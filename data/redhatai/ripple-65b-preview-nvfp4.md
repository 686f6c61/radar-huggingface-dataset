# RedHatAI/Ripple-65B-Preview-NVFP4

## Resumen

Ripple-65B-Preview-NVFP4 es una versión cuantizada del modelo de lenguaje ricursiveAI/Ripple-65B-Preview, publicada por RedHatAI el 6 de noviembre de 2026. Se trata de un checkpoint de inferencia optimizado que aplica cuantización de precisión mixta sobre el modelo base, combinando FP8 (W8A8) en las proyecciones de atención y NVFP4 (W4A4) en las proyecciones del MLP. El resultado es un modelo que reduce el espacio en disco y los requisitos de VRAM en aproximadamente un 66% respecto al modelo original en BF16.

La arquitectura del modelo base es RicursiveForCausalLM, un transformer con 42.764.805.680 parámetros reales según los tensores safetensors (a pesar del "65B" en el nombre). El checkpoint está pensado para servirse con vLLM y utiliza el formato compressed-tensors, con soporte explícito de parsers de razonamiento y de tool calling. Su licencia es Apache 2.0, lo que facilita su uso comercial.

La relevancia de esta ficha radica en que demuestra una estrategia de cuantización conservadora pero efectiva: mantiene la pila de atención en FP8 (por su sensibilidad a la precisión, incluyendo la compuerta sigmoide) mientras comprime el MLP a 4 bits, logrando una recuperación del 98,36% del rendimiento del checkpoint NVFP4 original en Terminal-Bench 2.1. Es un ejemplo práctico de cómo reducir huella de memoria sin sacrificar calidad de forma significativa en tareas de código agéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RicursiveForCausalLM (transformer, `custom_code`) |
| Parametros totales | 42.764.805.680 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (usado en la evaluación; el modelo base se evaluó con esa ventana) |
| Tipos de cuantizacion | Mixta: FP8 dinámico (W8A8) en atención, NVFP4 (W4A4) en MLP; pesos y activaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo de la familia RicursiveForCausalLM, con código personalizado (`custom_code`) que obliga a cargarlo con `trust_remote_code=True`. La model card no detalla el número de capas, dimensión oculta, número de cabezas ni la composición del dataset de preentrenamiento, por lo que esos datos no están disponibles. Tampoco se documenta si hubo fases de RLHF, DPO u otro ajuste por preferencias.

La innovación técnica de este checkpoint es la receta de cuantización aplicada mediante LLM Compressor. Se usa un `QuantizationModifier` con esquema `FP8_DYNAMIC` sobre todas las proyecciones `self_attn.*` (incluida la compuerta sigmoide) y un `GPTQModifier` con esquema `NVFP4` sobre las proyecciones `mlp.*`, con `weight_observer="nvfp4_expanded_imatrix"`, `actorder="static"`, `dampening_frac=0.01` y `block_size=128`. La calibración se realizó con 512 muestras del dataset `perfectblend`, con longitud máxima de secuencia de 2048 tokens. NVFP4 almacena pesos y activaciones en coma flotante de 4 bits con escalado por bloques de 16 elementos y factores de escala FP8. El `lm_head` queda excluido de la cuantización.

## Capacidades

- Generación de texto y razonamiento: el modelo expone un parser de razonamiento específico (`--reasoning-parser ripple`), lo que indica soporte de modo de pensamiento o cadena de razonamiento explícita.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` y `--tool-call-parser ripple` en vLLM.
- Uso agéntico multi-paso: evaluado con un agente ReAct genérico sobre Terminal-Bench 2.1, lo que confirma capacidad para tareas de terminal con múltiples pasos.
- Codificación agéntica: resuelve tareas de línea de comandos, edición de ficheros y depuración dentro de un entorno de terminal.
- Contexto largo: ventana de hasta 131.072 tokens en la configuración de evaluación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; la model card indica únicamente entrada y salida de texto.

## Casos de uso

- Agentes de codificación en terminal: el modelo puede integrarse en un harness tipo ReAct para resolver tareas de ingeniería de software en entornos reales (edición de ficheros, ejecución de comandos, corrección de errores), tal como demuestra su evaluación en Terminal-Bench 2.1 con 67,42 puntos de pass@1.
- Automatización de CI/CD con tool calling: gracias a `--enable-auto-tool-choice` y al parser `ripple`, puede invocarse como agente que llama a herramientas externas (linters, compiladores, APIs de despliegue) dentro de pipelines.
- Asistente de razonamiento multi-paso: el parser de razonamiento permite separar la cadena de pensamiento de la respuesta final, útil en aplicaciones que necesitan auditar el proceso de decisión del modelo.
- Servicio de inferencia de bajo coste en una sola GPU: con ~44 GB de pesos, cabe en una NVIDIA B200 (o H100 de 80 GB) con tensor-parallel-size 1, lo que simplifica el despliegue frente al checkpoint BF16 de ~57 GB.
- Procesamiento de documentos largos y repositorios: la ventana de 131.072 tokens permite analizar codebases completos o contratos extensos en una sola pasada.
- Backend de agentes para tareas de DevOps: puede gestionar sesiones de terminal con límites de tiempo amplios (la evaluación usó 7.200 s por muestra), adecuado para tareas de diagnóstico y reparación de infraestructura.

## Benchmarks y rendimiento

| Categoría | Benchmark | ricursiveAI/Ripple-65B-Preview-NVFP4 | RedHatAI/Ripple-65B-Preview-NVFP4 | Recuperación |
|---|---|---|---|---|
| Codificación agéntica | Terminal-Bench 2.1 (89 tareas, pass@1) | 68,54 | 67,42 | 98,36% |

El error estándar es de ±4,92 para el checkpoint original y ±4,97 para este checkpoint NVFP4+FP8. La diferencia de 1,1 puntos está dentro del ruido de una única ejecución de 89 tareas en pass@1. La evaluación se realizó con Inspect (`inspect_harbor/terminal_bench_2_1`), agente ReAct genérico (no el harness oficial Terminus 2), límite de 7.200 s por muestra y contexto de 131.072 tokens, sobre 1× NVIDIA B200 por modelo. Los errores de muestra y los timeouts se contabilizan como fallos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 44 GB solo para pesos; con caché KV para 131.072 tokens y overhead de activaciones, se recomienda al menos 60-70 GB de VRAM.
- GPU recomendadas: NVIDIA B200 (usada en la evaluación), NVIDIA H100 de 80 GB, NVIDIA H200. El checkpoint original NVFP4 (~57 GB) también cabe en estas GPU, pero con menos margen.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) sin cuantización adicional o descarga a CPU; no se documentan variantes GGUF.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), con `--tensor-parallel-size 1`, `--reasoning-parser ripple`, `--enable-auto-tool-choice` y `--tool-call-parser ripple`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal-Bench 2.1 | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RedHatAI/Ripple-65B-Preview-NVFP4 | 42,76 B | 131.072 | 67,42 | FP8 + NVFP4 | Apache 2.0 | Hugging Face |
| ricursiveAI/Ripple-65B-Preview-NVFP4 | no disponible | 131.072 | 68,54 | NVFP4 (atención en BF16) | Apache 2.0 | Hugging Face |
| ricursiveAI/Ripple-65B-Preview (BF16) | no disponible | no disponible | no disponible | BF16 | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de modelos competidores de tamaño o categoría similares. El checkpoint de RedHatAI es un ~23% más pequeño en disco que el NVFP4 de ricursiveAI (~44 GB frente a ~57 GB) y un ~66% menor que el BF16, con una pérdida de calidad dentro del ruido estadístico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el modelo base tampoco los detalla.
- Riesgo de alucinación: no cuantificado; al ser un modelo orientado a tareas agénticas y código, el riesgo en generación libre de texto no está evaluado.
- Limitaciones de contexto o idioma: la ventana de 131.072 tokens se ha validado en evaluación, pero no se documenta el rendimiento más allá de esa longitud ni la cobertura idiomática.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar dicho código antes de desplegarlo en producción.
- Caveat de cuantización: la atención en FP8 y el MLP en NVFP4 pueden degradar tareas sensibles a la precisión numérica no cubiertas por Terminal-Bench; la evaluación se limita a una única tarea agéntica.
- Comparabilidad de benchmarks: los resultados no son directamente comparables con el leaderboard público de Terminus 2 ni con la puntuación autodeclarada del modelo base, según advierte la propia model card.
- Dependencia de hardware: NVFP4 requiere GPU con soporte de FP4 (por ejemplo, Blackwell/B200); en arquitecturas anteriores el rendimiento puede degradarse o no ser compatible.
- Idiomas: al no estar documentados, no se garantiza un rendimiento adecuado en castellano u otros idiomas distintos del inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Ripple-65B-Preview-NVFP4
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Checkpoint NVFP4 original: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Inspect (evaluación): https://github.com/UKGovernmentBEIS/inspect_ai
