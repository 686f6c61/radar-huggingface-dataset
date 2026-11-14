# Hooshaai/llava-qwen-0.5b-tri-branch-hybrid-scienceqa

## Resumen

`llava-qwen-0.5b-tri-branch-hybrid-scienceqa` es un checkpoint experimental publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, un framework de "cirugía de atención" (attention surgery) orientado a sustituir mecanismos de atención estándar por operadores alternativos en modelos ya entrenados. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM LLaVA con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas, y aplica el operador `tri_branch_hybrid` (`TriBranchHybridAttention`) en 18 de las 24 capas del decodificador.

El objetivo declarado es doble: por un lado, evaluar empíricamente variantes de atención híbrida en una tarea de razonamiento visual STEM (ScienceQA, subconjunto con imagen); por otro, demostrar un pipeline de compresión extrema de artefactos, ya que el repositorio solo distribuye los pesos de atención modificados (97,40 MB en FP16) en lugar del modelo completo (1,66 GB), lo que supone una reducción del 94,3 %. Es un artefacto de investigación, no un modelo listo para producción: requiere el paquete `neuralops` y el modelo base para reconstruirse.

Con 0,5B parámetros en el decodificador, contexto heredado del Qwen2 subyacente y licencia MIT, su interés está en servir como banco de pruebas reproducible de operadores de atención y destilación de conocimiento sobre un VLM pequeño, no en competir con VLMs de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64) con atención `TriBranchHybridAttention` en 18/24 capas |
| Parametros totales | no disponible (el modelo base LLaVA-Qwen-0.5B ronda los 0,5B en el decodificador; el autor no declara el total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en FP16 (`attention_only_fp16`) |
| Idiomas soportados | en |
| Licencia | MIT (enlace a licencia del repo NeuralOps) |
| Formato de pesos | safetensors (`attention_weights.safetensors`, solo deltas de atención) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

La arquitectura es un LLaVA estándar con tres componentes: torre visual SigLIP congelada, proyector MLP de dos capas que mapea embeddings visuales al espacio del decodificador, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La modificación consiste en sustituir la self-attention de 18 capas (esquema `hybrid_3_1`) por el operador `TriBranchHybridAttention`, manteniendo como "anclas cuadráticas" las capas 3, 7, 11, 15, 19 y 23. Los MLP, embeddings, proyector y torre visual permanecen congelados; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento se realizó en dos etapas (86 + 123 pasos, 209 en total) sobre una única NVIDIA RTX 3090 de 24 GB, con un pico de 16.953 MB de VRAM y una duración total de 120,2 segundos, lo que indica un ajuste muy ligero sobre el subconjunto de ScienceQA con imagen. Se aplicó destilación de conocimiento desde el modelo profesor: la precisión pasó de 30,63 % (zero-shot tras la cirugía) a 44,38 % (post-KD), y la perplejidad de 4,16 a 3,19. El profesor alcanza 63,75 % de precisión y 2,45 de perplejidad, de modo que la cirugía más la destilación recuperan aproximadamente la mitad de la brecha perdida.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes con contenido STEM: el modelo recibe `<image>` más texto y genera una respuesta, típicamente una letra de opción en formato ScienceQA.
- Razonamiento multimodal básico sobre figuras, diagramas y gráficos científicos sencillos.
- Generación de texto conversacional en inglés, heredada del decodificador Qwen2 de 0,5B.
- Formato de chat mediante `chat_template.json` incluido en el repositorio.
- Procesamiento de imagen con preprocesador propio (`preprocessor_config.json`).
- No se declara soporte de tool calling, function calling, agentes multi-paso, audio ni modos de razonamiento explícito (thinking).
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre mecanismos de atención: el checkpoint permite reproducir el experimento de sustituir atención cuadrática por `TriBranchHybridAttention` en un VLM pequeño y medir el impacto en precisión y perplejidad sobre ScienceQA.
- Banco de pruebas de destilación de conocimiento: sirve para comparar curvas de recuperación (zero-shot 30,63 % frente a post-KD 44,38 %) con distintas configuraciones de profesor y número de pasos.
- Estudio de compresión de artefactos: el pipeline de "attention-only" (97,40 MB frente a 1,66 GB, 17,47x más pequeño) es un caso práctico para investigar distribución selectiva de pesos.
- Prototipado educativo de VQA científica: con 0,5B parámetros y ~17 GB de VRAM en entrenamiento, cabe en una GPU de consumo para experimentos de aula o laboratorio.
- Evaluación comparativa de operadores de atención: el zoo NeuralOps permite entrenar la misma receta con otros operadores y contrastar resultados sobre el mismo subconjunto de validación.
- Docencia y divulgación: ejemplo reproducible de cirugía de atención con telemetría completa (pasos, VRAM, duración) para explicar pipelines de ajuste eficiente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Profesor (baseline) | Zero-shot tras cirugia | Final post-KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 30,63 | 44,38 | +13,75 |
| Perplejidad | 2,45 | 4,16 | 3,19 | -0,97 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- Entrenamiento documentado: una NVIDIA RTX 3090 (24 GB), con pico de 16.953 MB de VRAM y 120,2 s de cómputo para 209 pasos.
- Inferencia: al tratarse de un VLM de ~0,5B en el decodificador más una torre SigLIP, cabe holgadamente en GPUs de consumo de 8-12 GB en FP16; no se dispone de cifras oficiales de VRAM para inferencia.
- El artefacto distribuido (97,40 MB) no es autónomo: requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB) y el paquete `neuralops` para reconstruir el modelo.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-tri-branch-hybrid-scienceqa | ~0,5B (decodificador) | no disponible | 44,38 % acc / 3,19 PPL | MIT | Hugging Face, requiere `neuralops` |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B (decodificador) | no disponible | 63,75 % acc / 2,45 PPL | no disponible en esta ficha | Hugging Face |
| Otros VLMs pequenos (p. ej. variantes LLaVA de <1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el modelo base, ya que el autor no publica contrastes con otras familias de VLMs pequeños.

## Limitaciones y advertencias

- Artefacto incompleto: solo contiene los pesos de atención modificados; no es ejecutable sin el modelo base y la librería `neuralops`.
- Rendimiento muy por debajo del profesor: 44,38 % frente a 63,75 % de precisión en ScienceQA, con una brecha de casi 20 puntos.
- Entrenamiento mínimo: 209 pasos y 120 s en una sola GPU, sobre un único subconjunto de validación; riesgo alto de sobreajuste y de baja generalización.
- Resultados no verificados (`verified: false`) y sin publicación de código de evaluación independiente.
- Idioma limitado al inglés; sin soporte declarado de otros idiomas.
- Riesgo de alucinación inherente a un modelo de 0,5B ajustado con destilación sobre un dataset acotado; no apto para uso clínico, educativo real ni decisiones automatizadas.
- Licencia MIT, que permite uso comercial, pero el ecosistema NeuralOps y el modelo base pueden tener condiciones propias que conviene revisar antes de producción.
- No hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) ni de robustez frente a imágenes fuera de distribución.
- Fecha de creación del repositorio (2026-11-11) posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-tri-branch-hybrid-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/tri_branch_hybrid_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
