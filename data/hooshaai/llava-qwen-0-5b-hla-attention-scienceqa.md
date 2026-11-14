# Hooshaai/llava-qwen-0.5b-hla-attention-scienceqa

## Resumen

`llava-qwen-0.5b-hla-attention-scienceqa` es un checkpoint multimodal de tipo vision-language publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, una librería de experimentación con cirugía de mecanismos de atención. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` y sustituye el mecanismo de auto-atención cuadrática en 18 de las 24 capas del decodificador Qwen2 por un módulo de atención lineal con compuerta denominado HLAAttention (Hadamard Linear Attention), manteniendo seis capas ancla con atención cuadrática original.

El objetivo declarado no es producir un modelo de producción, sino servir como artefacto de investigación reproducible: un "attention surgery zoo" que permite evaluar el impacto de reemplazar atención cuadrática por atención lineal recurrente en un VLM pequeño. El checkpoint se ha ajustado mediante destilación de conocimiento sobre el subconjunto con imagen del dataset ScienceQA (validación) y se distribuye como delta de pesos de solo 147,50 MB frente a los 1,66 GB del modelo base completo.

Es relevante ahora porque ejemplifica una línea de trabajo activa en eficiencia de atención (lineal, gated, híbrida) aplicada a modelos multimodales de menos de mil millones de parámetros, un segmento donde la comunidad busca alternativas desplegables en hardware de consumo. No obstante, los resultados declarados muestran una degradación sustancial frente al profesor, por lo que debe interpretarse como material experimental y no como un modelo listo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con atención lineal HLA en 18/24 capas (esquema híbrido `hybrid_3_1`) |
| Parametros totales | no disponible (el modelo base LLaVA-Qwen-0.5B ronda los 0,5B, pero la ficha no declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico en FP16) |

## Arquitectura y entrenamiento

El modelo hereda la estructura LLaVA-Interleave: una torre visual SigLIP congelada de 27 capas, un proyector multi-modal de dos capas MLP y un decodificador Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas y dimensión por cabeza de 64. La intervención sustituye la self-attention en 18 de las 24 capas por HLAAttention, un módulo bidireccional/causal que mantiene un estado asociativo por cabeza S ∈ R^{B×H×d×d} y un vector normalizador Z, con decaimiento aprendible por cabeza γ y función de features φ(x) = ELU(x) + 1. La recurrencia causal es S_t = γ·S_{t-1} + φ(k_t)ᵀφ(v_t), y la salida se normaliza por φ(q_t)·Z_t + ε. Se conservan seis capas ancla con atención cuadrática en los índices [3, 7, 11, 15, 19, 23], lo que da lugar a un patrón híbrido 3:1.

El entrenamiento consistió en destilación de conocimiento offline con caché de representaciones (arquitectura NeuralOps §21.1), ejecutada en una única NVIDIA GeForce RTX 3090 de 24 GB con 0 MB de VRAM de profesor en GPU. Se realizaron 60 pasos de optimización (19 en etapa 1, 41 en etapa 2) en 120,9 segundos, con un pico de VRAM de 21.379 MB. Solo se entrenaron y serializaron las self-attentions modificadas y los layernorms del decodificador; la torre visual, el proyector, las MLP y los embeddings permanecen congelados y excluidos del artefacto. El dataset de ajuste es el subconjunto con imagen de ScienceQA (split de validación), lo que limita el alcance del ajuste a razonamiento visual STEM elemental.

## Capacidades

- Generación de texto e imagen-a-texto conversacional en inglés, con pipeline `image-text-to-text`.
- Respuesta a preguntas visuales (VQA) sobre imágenes con contenido científico y educativo.
- Razonamiento visual multimodal básico sobre diagramas y figuras de ScienceQA.
- Soporte de plantilla de chat (`chat_template.json` incluido).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso explícito.
- No se declara modo "thinking", audio ni otras modalidades adicionales.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre atención lineal en VLMs: el checkpoint permite reproducir el experimento de sustituir atención cuadrática por HLA en un decodificador Qwen2 y medir el impacto en precisión y perplejidad sobre ScienceQA, con un coste de almacenamiento de 147,50 MB.
- Estudio de destilación con caché offline: sirve como caso de referencia para validar la arquitectura de caché de representaciones de NeuralOps en una GPU de consumo (RTX 3090), con telemetría reproducible de 60 pasos y 120,9 s.
- Benchmarking de cirugía de atención: al conservar seis capas ancla cuadráticas, permite analizar el equilibrio entre capas lineales y cuadráticas en un patrón 3:1 y comparar contra el profesor LLaVA-Qwen-0.5B.
- Docencia y divulgación: útil para explicar de forma tangible qué es una atención lineal con compuerta, cómo se serializa un delta de pesos y cómo se audita un artefacto quirúrgico.
- Pruebas de integración de la librería NeuralOps: el repositorio incluye manifiesto quirúrgico, configuración y métricas legibles por máquina, lo que facilita tests de carga y validación de pipelines.
- Exploración de VQA educativa de bajo coste: para prototipos internos de preguntas sobre imágenes STEM en inglés, asumiendo la precisión limitada del modelo (30,63 % en el subconjunto evaluado).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Profesor (baseline) | Zero-shot previo a KD | Final tras KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagen, validación) | 63,75 | 43,75 | 30,63 | -13,12 |
| Perplejidad (PPL) | 2,45 | 2.622,72 | 5,25 | -2.617,47 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- El artefacto de pesos ocupa 147,50 MB en FP16 (154.667.116 bytes); el paquete completo del repositorio es de 162,69 MB.
- Para inferencia es necesario cargar además el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16), ya que el checkpoint es un delta quirúrgico y no un modelo autónomo completo.
- VRAM estimada: no disponible de forma explícita; el entrenamiento se realizó con un pico de 21.379 MB en una RTX 3090, pero la inferencia requiere bastante menos al no necesitar estados de optimizador ni caché de profesor.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), A100, H100 para despliegue a escala; cualquier GPU consumer con al menos 8 GB debería poder alojar el modelo base en FP16, aunque no se confirma en la documentación.
- Cabe en GPU de consumo: sí, según el hardware de entrenamiento declarado (RTX 3090); no se especifican requisitos mínimos exactos.
- Opciones de despliegue: la carga se realiza vía `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (subconjunto con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-hla-attention-scienceqa` | ~0,5B (no confirmado) | no disponible | 30,63 % accuracy / 5,25 PPL | MIT | Hugging Face (40 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % accuracy / 2,45 PPL | no disponible en esta ficha | Hugging Face |
| Otros VLMs pequeños (p. ej. variantes LLaVA-Qwen 0.5B) | ~0,5B | no disponible | no disponible | variable | Hugging Face |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada más allá del modelo base.

## Limitaciones y advertencias

- Degradación significativa frente al profesor: la accuracy cae de 63,75 % a 30,63 % (-13,12 puntos respecto al zero-shot y -33,12 respecto al profesor), lo que indica que la sustitución por HLA no preserva el rendimiento original.
- La perplejidad final (5,25) es más del doble que la del profesor (2,45), lo que sugiere una distribución de probabilidad menos ajustada.
- El ajuste se realizó con solo 60 pasos de optimización en 120,9 s sobre el split de validación de ScienceQA, lo que plantea dudas sobre generalización y posible sobreajuste al conjunto evaluado.
- Solo soporta inglés; no se declara cobertura multilingüe.
- No se documentan sesgos específicos, pero al derivar de un VLM entrenado con datos web es esperable un sesgo similar al de su base.
- Riesgo de alucinación inherente a modelos generativos multimodales pequeños, agravado por la pérdida de capacidad observada.
- El checkpoint es un delta quirúrgico: no funciona de forma autónoma sin cargar el modelo base, lo que complica el despliegue estándar.
- La licencia MIT se aplica al artefacto, pero debe verificarse la licencia del modelo base antes de uso comercial.
- No hay soporte declarado de tool calling, agentes ni cuantización, lo que limita su uso en pipelines de producción.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-hla-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de HLAAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/hla_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
