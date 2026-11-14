# Hooshaai/llava-qwen-0.5b-gdn2-attention-scienceqa

## Resumen

`llava-qwen-0.5b-gdn2-attention-scienceqa` es un checkpoint experimental publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, un proyecto de "cirugía de atención" (attention surgery) que sustituye mecanismos de atención estándar por operadores recurrentes lineales con compuertas. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM multimodal de 0,5 mil millones de parámetros que combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas, y reemplaza la atención cuadrática en 18 de esas 24 capas por el operador propietario `GDN2Attention` (Gated DeltaNet 2 con recurrencia lineal desacoplada de borrado y escritura).

El objetivo declarado no es producir un modelo de producción, sino servir como artefacto de investigación: un banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por recurrencia lineal gated en un VLM pequeño, evaluado sobre el subconjunto con imágenes de ScienceQA (validación). El resultado es un delta de pesos de 182 MB que se aplica sobre el modelo base, con un ahorro del 89,3 % respecto a los pesos FP16 completos (1,66 GB).

Es relevante ahora porque documenta de forma explícita el coste empírico de esta clase de sustitución: la precisión cae del 63,75 % del profesor original al 31,25 % tras destilación de conocimiento, y la perplejidad se desploma desde un valor absurdo de 1.711.610,08 en zero-shot hasta 3,69 tras el ajuste. Es, en la práctica, un estudio de caso sobre hasta qué punto la atención lineal híbrida puede aproximar a la atención completa en un VLM de 0,5B con solo 93 pasos de optimización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP congelado + proyector MLP 2 capas + decodificador Qwen2 de 24 capas) con atención híbrida: 18/24 capas sustituidas por GDN2Attention y 6 capas cuadráticas de anclaje [3, 7, 11, 15, 19, 23] |
| Parámetros totales | 0,5 mil millones (heredados del base `llava-interleave-qwen-0.5b-hf`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se serializan en FP16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (delta quirúrgico en FP16) + `surgical_manifest.json` + `config.json`; requiere la librería `neuralops` para cargar |

## Arquitectura y entrenamiento

El modelo conserva la topología LLaVA-Interleave: torre visual SigLIP de 27 capas completamente congelada, proyector multimodal MLP de dos capas y decodificador Qwen2 con dimensión oculta D=1024, 16 cabezas de atención y head_dim=64. La intervención quirúrgica sustituye el `self_attn` en 18 de las 24 capas del decodificador por `GDN2Attention`, un operador de la familia `gated` implementado en `neuralops/layers/gated/flagship_fla.py`. La formulación declarada es `S_t = S_{t-1} · alpha_t · (I - beta_erase_t · k_t k_t^T) + beta_write_t · k_t v_t^T`, es decir, una recurrencia lineal con compuerta de decaimiento (`alpha_t`) y tasas de borrado/escritura desacopladas (`beta_erase_t`, `beta_write_t`). Se mantienen seis capas con atención cuadrática como anclas (patrón `hybrid_3_1`), y quedan congelados el proyector, la torre visual, los MLP del decodificador, los embeddings y los layernorms no entrenados.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), sobre una única NVIDIA GeForce RTX 3090 de 24 GB, con 0 MB de VRAM ocupada por el profesor en GPU. Se ejecutaron 93 pasos de optimización (31 en etapa 1, 62 en etapa 2) en 120,3 segundos, con un pico de VRAM de 17.349 MB. El dataset es `derek-thomas/ScienceQA`, evaluado en el subconjunto con imágenes de la partición de validación. No se documentan número de tokens de entrenamiento, composición detallada del dataset, ni uso de RLHF/DPO.

## Capacidades

- Generación de texto condicionada a imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM (visual question answering) sobre diagramas y figuras científicas.
- Razonamiento multimodal de un solo turno orientado a selección de respuesta en ScienceQA.
- Soporte de plantilla de chat (`chat_template.json` incluido) para formateo conversacional.
- Capacidad multilingüe: limitada a inglés según la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre atención lineal en VLMs: el checkpoint permite reproducir el experimento de sustitución de atención cuadrática por GDN2Attention en 18 de 24 capas y medir el impacto en precisión y perplejidad sobre ScienceQA, sirviendo como referencia para comparar otros operadores del "attention zoo" de NeuralOps.
- Estudio de destilación de conocimiento con presupuesto mínimo: con 93 pasos y 120,3 segundos en una RTX 3090, es un caso reproducible para analizar cuánto conocimiento del profesor se retiene cuando el alumno cambia su mecanismo de atención.
- Docencia y demostración de "attention surgery": útil en cursos o talleres para ilustrar cómo se serializa un delta quirúrgico (`surgical_manifest.json` + `attention_weights.safetensors`) y cómo se reconstruye el modelo con `load_surgeried_model`.
- Pruebas de pipelines de compresión de artefactos: el delta de 182 MB frente a 1,66 GB del base (9,35× más pequeño) sirve para validar flujos de distribución de pesos quirúrgicos y de auditoría de artefactos en disco.
- Prototipado de VQA científica de bajo coste: para experimentos exploratorios donde la precisión del 31,25 % sea aceptable como línea base y se priorice el tamaño reducido del checkpoint.
- Evaluación comparativa de operadores gated: al compartir base y dataset con otros checkpoints del zoo NeuralOps, permite aislar el efecto de `gdn2_attention` frente a alternativas de la misma familia.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imágenes STEM, partición de validación:

| Métrica | Profesor (baseline) | Zero-shot pre-KD | Final post-KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,87 | 31,25 | -0,62 |
| Perplejidad (PPL) | 2,45 | 1.711.610,08 | 3,69 | -1.711.606,39 |

Telemetría de entrenamiento: 93 pasos de optimización, 120,3 s de duración, pico de VRAM 17.349 MB en RTX 3090 (24 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: el delta quirúrgico pesa 182 MB en FP16, pero debe cargarse junto con el modelo base `llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16); el total en FP16 ronda los 2 GB de pesos, más overhead de activaciones y del proyector visual.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; el autor entrenó y evaluó en una NVIDIA GeForce RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: la carga requiere la librería `neuralops` (`from neuralops.hub import load_surgeried_model`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos no es GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, con imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-gdn2-attention-scienceqa` | 0,5B | No disponible | 31,25 % accuracy / 3,69 PPL | MIT | Hugging Face (43 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | No disponible | 63,75 % accuracy / 2,45 PPL (declarado por el autor) | No disponible en la información | Hugging Face |
| Otros checkpoints del zoo NeuralOps | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La precisión final (31,25 %) es aproximadamente la mitad de la del profesor (63,75 %): el modelo no es apto para producción sin un ajuste adicional sustancial.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden únicamente del autor.
- El checkpoint es un delta quirúrgico, no un modelo autónomo: requiere el base `llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para cargarse; no funciona con `transformers` estándar ni con runtimes convencionales.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se documenta longitud de contexto, sesgos conocidos ni comportamiento fuera del subconjunto ScienceQA con imágenes.
- Riesgo de alucinación: no evaluado en la información disponible; dado el bajo rendimiento en VQA, se debe asumir un riesgo elevado en dominios fuera de STEM con figuras.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación fuera de ScienceQA y la falta de verificación de los benchmarks desaconsejan cualquier despliegue en producción.
- Entrenado con solo 93 pasos de optimización; la cobertura del dataset y la robustez frente a distribución son desconocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-gdn2-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `GDN2Attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
