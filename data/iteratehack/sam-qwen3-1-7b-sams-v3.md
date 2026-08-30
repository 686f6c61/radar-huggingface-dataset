# iteratehack/sam-qwen3-1.7b-sams-v3

## Resumen

El modelo `iteratehack/sam-qwen3-1.7b-sams-v3` es un prototipo de "lenguaje acotado" (bounded language model) desarrollado por el usuario iteratehack sobre la base de Qwen/Qwen3-1.7B. Está diseñado para generar únicamente hechos suministrados por el sistema y seleccionar identificadores de preguntas predefinidos, en lugar de producir texto libre. Su objetivo es servir como capa de generación restringida en sistemas donde las decisiones críticas (médicas, de emergencia, de movimiento robótico, navegación, potencia o hardware) deben permanecer en servicios deterministas externos.

El modelo se distribuye en tres formatos: un checkpoint Transformers fusionado (safetensors, 3.44 GB), un adaptador LoRA (140 MB) y dos cuantizaciones GGUF (Q4_K_M y Q5_K_M). Tiene 1.720.574.976 parámetros (1.7B) y licencia Apache-2.0. La model card advierte explícitamente que los datos sintéticos de entrenamiento no han sido revisados y que el modelo no está validado médica ni robóticamente, por lo que no debe desplegarse como controlador de seguridad.

La relevancia de este modelo reside en su enfoque de "generación acotada" (bounded generation): en lugar de maximizar la libertad generativa, impone un contrato estricto de salida (JSON con esquema fijo, eco de hechos, prohibición de consejos o comandos) que puede resultar útil en entornos de investigación sobre IA segura y alineación. Sin embargo, al ser un prototipo sin validación externa, su uso en producción queda descartado por ahora.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la ficha; el modelo base Qwen3-1.7B soporta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | GGUF Q4_K_M (1.11 GB) y Q5_K_M (1.26 GB); además safetensors de precisión completa (3.44 GB) |
| Idiomas soportados | No disponibles (no especificados; el modelo base Qwen3 soporta múltiples idiomas, pero este fine-tuning no documenta su alcance multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint fusionado), safetensors (adaptador LoRA) y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso de 1.720 millones de parámetros con atención causal estándar. El fine-tuning se realizó mediante un adaptador LoRA (140 MB) que posteriormente se fusionó con los pesos base para generar el checkpoint `merged-hf`. No se especifican los hiperparámetros del entrenamiento (número de tokens, composición del dataset, método de alineación como RLHF o DPO) en la información disponible.

La innovación principal no está en la arquitectura, sino en el objetivo de entrenamiento: el modelo se entrena para cumplir un "contrato de lenguaje acotado" que restringe las salidas a un subconjunto predefinido de hechos y preguntas. La model card menciona que la evaluación se realizó con "temperatura 0, thinking desactivado y decodificación JSON restringida estricta", lo que sugiere que el modelo fue optimizado para trabajar junto a un decodificador determinista que impone el esquema de salida.

## Capacidades

- Generación de texto acotada: el modelo solo reproduce hechos suministrados en el contexto y selecciona identificadores de preguntas predefinidos, sin generar contenido libre.
- Cumplimiento de contrato JSON estricto: en la evaluación, logró un 100% de cumplimiento en esquema JSON, tipos de valor, longitud de habla, preguntas suministradas, identificadores de hechos, estados requeridos y eco de hechos.
- Prohibición de consejos o comandos: el modelo evita emitir recomendaciones o instrucciones, delegando esas decisiones a servicios deterministas externos.
- Soporte de cuantización GGUF: disponible en Q4_K_M y Q5_K_M para despliegue ligero con llama.cpp u Ollama.
- No documenta capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking" (este último se desactivó en la evaluación).

## Casos de uso

- Investigación en generación acotada: sirve como banco de pruebas para estudiar cómo un modelo de 1.7B puede restringir sus salidas a un contrato formal, útil para trabajos académicos sobre IA segura y alineación.
- Prototipos de asistentes con salida restringida: en entornos de laboratorio, puede integrarse en sistemas donde se necesite que el LLM solo "rellene" plantillas con hechos verificados, sin libertad generativa.
- Simulación de diálogos médicos controlados: aunque no está validado, podría usarse en simulaciones sintéticas donde las respuestas deben limitarse a hechos predefinidos y nunca dar consejos médicos (siempre con supervisión humana y sin uso real).
- Generación de informes estructurados: puede producir JSON con campos fijos (estados, preguntas, hechos) para alimentar pipelines deterministas de validación.
- Evaluación de robustez de decodificadores restringidos: los 630 casos de prueba publicados permiten comparar el comportamiento de diferentes cuantizaciones bajo decodificación JSON estricta.
- Formación en seguridad de modelos: útil como ejemplo didáctico de cómo un modelo puede ser entrenado para no exceder sus límites de conocimiento y delegar decisiones críticas.

## Benchmarks y rendimiento

La model card reporta una evaluación propia sobre un conjunto fijo de 630 casos (con temperatura 0, thinking desactivado y decodificación JSON restringida). No se proporcionan benchmarks generales (MMLU, HumanEval, GSM8K, etc.).

| Modelo | Full-contract passes | Pass rate | Gate |
|---|---:|---:|---:|
| Q4_K_M | 619 / 630 | 98.25% | PASS |
| Q5_K_M | 609 / 630 | 96.67% | PASS |

Ambas cuantizaciones superan el umbral requerido del 90% en el contrato completo. Los fallos restantes (11 en Q4 y 21 en Q5) corresponden a errores de "numbers_grounded": el modelo afirmó un "100 percent" no soportado o usó sufijos numéricos que el validador conservador no aceptó. La model card recomienda mantener un post-proceso determinista de anclaje numérico y rechazar o regenerar cualquier respuesta marcada.

Estos resultados miden únicamente el cumplimiento del contrato de salida sobre datos sintéticos de prototipo; no constituyen una validación médica, de seguridad de campo ni de controlador robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q4_K_M (1.11 GB de pesos) se necesitan aproximadamente 2 GB de VRAM; con Q5_K_M (1.26 GB) unos 2,5 GB. El checkpoint safetensors completo (3.44 GB) requiere unos 4-5 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o más (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090, etc.) puede ejecutar las versiones GGUF sin problemas. También es viable en CPU con llama.cpp (aunque con mayor latencia).
- Si cabe en consumer GPU: sí, todas las cuantizaciones caben en GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp (soporta GGUF), Ollama (importando el GGUF), o Transformers con el checkpoint fusionado. vLLM podría usarse con el safetensors, pero no se ha verificado en la documentación.
- Latencia y throughput: no se proporcionan datos medidos. Para un modelo de 1.7B en GGUF Q4, se espera una velocidad de decodificación de decenas de tokens por segundo en una GPU consumer moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de generación acotada. La referencia más cercana es el modelo base Qwen3-1.7B, del cual este es un fine-tuning. La siguiente tabla compara las características conocidas:

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | 1.720.574.976 | 32.768 (según documentación de Qwen3) | Apache-2.0 | safetensors, GGUF | Modelo generalista con modo thinking |
| iteratehack/sam-qwen3-1.7b-sams-v3 | 1.720.574.976 | No disponible (no confirmado) | Apache-2.0 | safetensors, GGUF | Generación acotada con contrato estricto |

No se han encontrado otros modelos de la misma categoría (bounded generation) con los que comparar directamente en la información disponible.

## Limitaciones y advertencias

- No validado médica ni robóticamente: la model card indica explícitamente que el modelo no debe usarse como controlador de seguridad ni en aplicaciones médicas o robóticas reales.
- Datos sintéticos no revisados: el entrenamiento se realizó con datos sintéticos de prototipo que no han pasado revisión humana.
- Fallos en anclaje numérico: las cuantizaciones muestran errores en la generación de números (por ejemplo, afirmar "100 percent" sin soporte), lo que requiere un post-proceso determinista obligatorio.
- Alcance limitado: el modelo solo puede emitir hechos y preguntas predefinidos; cualquier tarea que requiera generación libre o razonamiento abierto queda fuera de sus capacidades.
- Sin benchmarks generales: no se han publicado resultados en MMLU, HumanEval u otros estándares, por lo que no se puede evaluar su rendimiento en tareas convencionales.
- Idiomas y contexto no documentados: no se especifica qué idiomas soporta ni la longitud de contexto tras el fine-tuning, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- Riesgo de alucinación residual: aunque el contrato reduce la libertad generativa, los fallos observados demuestran que el modelo aún puede inventar contenido (como porcentajes no soportados) en ciertos casos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iteratehack/sam-qwen3-1.7b-sams-v3
- GGUF Q4_K_M: https://huggingface.co/iteratehack/sam-qwen3-1.7b-sams-v3/resolve/main/gguf/qwen3-1.7b-sams-v3-q4_k_m.gguf?download=true
- GGUF Q5_K_M: https://huggingface.co/iteratehack/sam-qwen3-1.7b-sams-v3/resolve/main/gguf/qwen3-1.7b-sams-v3-q5_k_m.gguf?download=true
- Checkpoint Transformers fusionado: https://huggingface.co/iteratehack/sam-qwen3-1.7b-sams-v3/resolve/main/merged-hf/model.safetensors?download=true
- Adaptador LoRA: https://huggingface.co/iteratehack/sam-qwen3-1.7b-sams-v3/resolve/main/adapter/adapter_model.safetensors?download=true
- Métricas agregadas de la evaluación: https://huggingface.co/iteratehack/sam-qwen3-1.7b-sams-v3/blob/main/evaluation-gguf-full/metrics.json
- Métricas Q4: https://huggingface.co/iteratehack/sam-qwen3-1.7b-sams-v3/blob/main/evaluation-gguf-full/q4_k_m/metrics.json
- Métricas Q5: https://huggingface.co/iteratehack/sam-qwen3-1.7b-sams-v3/blob/main/evaluation-gguf-full/q5_k_m/metrics.json
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
