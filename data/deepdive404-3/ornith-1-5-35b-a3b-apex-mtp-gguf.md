# Deepdive404-3/Ornith-1.5-35B-A3B-APEX-MTP-GGUF

## Resumen

Ornith-1.5-35B-A3B-APEX-MTP-GGUF es una cuantización en formato GGUF del modelo base ornith-ai/Ornith-1.5-35B-A3B, un Mixture-of-Experts de 36 mil millones de parámetros con 256 expertos enrutados y 8 activos por token, más un experto compartido. El modelo base, desarrollado por el equipo Ornith (DeepReinforce), está diseñado para razonamiento, programación y uso agéntico, y destaca por su arquitectura híbrida de atención (intercala capas de atención lineal con atención completa) y por incluir una torre de visión. Esta versión concreta añade la cabeza MTP (Multi-Token Prediction) empaquetada dentro del propio archivo GGUF, lo que permite decodificación especulativa sin necesidad de un modelo drafter externo.

La relevancia de esta ficha radica en que el autor, Deepdive404-3, aplica el método de cuantización APEX, que clasifica cada tensor según su papel en el modelo y aplica una gradación de precisión por capas: los expertos enrutados (89,6% del peso) toleran menor precisión porque solo 8 de 256 se activan por token, mientras que el experto compartido y las capas iniciales y finales se mantienen con mayor precisión. Esto produce archivos que van desde 14,37 GB hasta 26,17 GB, lo que permite ejecutar el modelo en GPUs de consumo.

La cuantización incluye cuatro variantes (Quality, Balanced, Compact e I-Mini) más un proyector de visión independiente (mmproj.gguf) para tareas multimodales. El modelo base soporta hasta 256k de contexto según la implementación de referencia, y la licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida (lineal + completa) y torre de visión |
| Parametros totales | 446.571.248 (según metadatos de safetensors del modelo base; el modelo completo es de ~36B con 256 expertos) |
| Parametros activos | ~3B por token (8 expertos activos + experto compartido) |
| Longitud de contexto | Hasta 256k tokens (según implementación de referencia del modelo base) |
| Tipos de cuantizacion | APEX: Quality, Balanced, Compact, I-Mini (GGUF) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero la ficha no especifica la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cabeza MTP incluida como `blk.40` en los archivos principales) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 40 capas, 256 expertos enrutados y 8 activos por token, más un experto compartido que se ejecuta siempre. La arquitectura de atención es híbrida: intercala tres capas de atención lineal por cada capa de atención completa (full attention), lo que reduce el coste computacional en secuencias largas. Además, incluye una torre de visión que permite procesar imágenes mediante un proyector multimodal (`mmproj.gguf`).

El entrenamiento del modelo base sigue el marco de auto-mejora (self-improvement) descrito por el equipo Ornith: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para entrenamiento por refuerzo (RL). Esta metodología busca que el modelo mejore continuamente generando sus propias experiencias de aprendizaje. La versión cuantizada aquí presentada no modifica los pesos del modelo base, solo los comprime mediante el método APEX, que aplica una gradación de precisión por capa: las primeras y últimas capas se conservan con mayor precisión, las capas intermedias se comprimen más, y el experto compartido (siempre activo) se mantiene en alta precisión. La cabeza MTP, que ocupa aproximadamente un 2,4% del peso total, se fija a Q8_0 en las variantes Quality, Balanced y Compact para no degradar la precisión de la decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento avanzado, orientado a tareas agénticas y de programación.
- Soporte de tool calling y function calling, según el diseño del modelo base (derivado de Qwen3.5 MoE).
- Capacidad para ejecutar flujos agénticos multi-paso con razonamiento encadenado.
- Capacidades multimodales de visión: se incluye un proyector de visión (`mmproj.gguf`) que permite procesar imágenes junto con texto.
- Decodificación especulativa integrada: la cabeza MTP empaquetada permite usar `--spec-type draft-mtp` en llama.cpp para acelerar la generación sin necesidad de un modelo drafter externo.
- Soporte de contexto largo de hasta 256k tokens (dependiendo de la implementación y la cuantización).

## Casos de uso

- **Programación asistida en entornos de desarrollo**: el modelo está orientado a código y razonamiento agéntico, por lo que puede integrarse en IDEs o herramientas CLI para generar, revisar y refactorizar código en múltiples lenguajes. Su ventana de contexto de 256k permite trabajar con repositorios completos en una sola pasada.
- **Agentes autónomos para automatización de tareas**: gracias a su soporte de tool calling y razonamiento multi-paso, puede actuar como agente en pipelines de automatización, por ejemplo, para gestionar tickets, interactuar con APIs o ejecutar flujos de trabajo de datos.
- **Atención al cliente con contexto largo**: su ventana de contexto amplia permite mantener conversaciones de muchos turnos con historial completo, y su capacidad de tool calling puede integrarse con sistemas de ticketing o bases de conocimiento para resolver consultas de forma autónoma.
- **Análisis de documentos extensos**: con 256k de contexto, puede resumir, extraer información o responder preguntas sobre documentos legales, técnicos o de investigación de gran tamaño sin truncamiento.
- **Sistemas de razonamiento multimodal**: al incluir la torre de visión, puede procesar imágenes junto con texto, útil para análisis de diagramas, capturas de pantalla de errores o documentación visual de código.
- **Despliegue en hardware de consumo**: las variantes Compact (17,44 GB) e I-Mini (14,37 GB) caben en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), permitiendo ejecutar un modelo de 36B con cuantización en equipos personales o estaciones de trabajo pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización. El modelo base Ornith-1.5-35B-A3B ha sido referenciado en foros de NVIDIA como un modelo de programación y agente, pero no se incluyen cifras concretas de MMLU, HumanEval o GSM8K en los materiales proporcionados. Tampoco se han ejecutado pruebas de throughput sobre los archivos GGUF APEX, según indica el autor en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: las variantes GGUF requieren aproximadamente:
  - Quality: 23,72 GB de VRAM (más overhead de contexto, recomendar 32 GB).
  - Balanced: 26,17 GB de VRAM (recomendar 32 GB o 48 GB).
  - Compact: 17,44 GB de VRAM (cabe en RTX 4090 24 GB o RTX 3090 24 GB).
  - I-Mini: 14,37 GB de VRAM (cabe en RTX 4080 16 GB o RTX 3080 12 GB con limitaciones).
  - El proyector de visión `mmproj.gguf` de 0,90 GB debe añadirse si se usa la parte multimodal.
- **GPU recomendadas**: RTX 4090 (24 GB) para Balanced y Compact; RTX 3090 (24 GB) o RTX 4080 (16 GB) para Compact e I-Mini; para Quality y Balanced sin limitaciones, A100 40 GB o H100.
- **¿Cabe en GPU de consumo?**: Sí, las variantes Compact e I-Mini caben en GPUs de consumo de 16-24 GB. La variante Balanced es ajustada en 24 GB sin espacio para contexto largo.
- **Opciones de despliegue**: llama.cpp (con soporte `qwen3_5_moe`), llama-mtmd-cli para visión, Ollama (si se convierte a formato compatible), LocalAI (por el equipo que mantiene el proyecto APEX), y vLLM para despliegue en producción con cuantización NVFP4 (según la implementación de DGX Spark).
- **Latencia y throughput**: no se han publicado mediciones oficiales para estas cuantizaciones. El autor indica que no se han ejecutado benchmarks de throughput sobre los archivos GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 36B | ~3B | 256k | Apache 2.0 | BF16 original |
| Ornith-1.5-35B-A3B-APEX-MTP-GGUF | 36B | ~3B | 256k | Apache 2.0 | GGUF (APEX) |
| Qwen3.6-35B | no disponible | no disponible | no disponible | no disponible | mencionado en foros como alternativa comparable |
| Ornith-1.5-397B | 397B | no disponible | no disponible | Apache 2.0 | versión mayor de la misma familia |

No se dispone de más datos sobre modelos comparables directos en la información proporcionada. El foro de NVIDIA menciona que Ornith-1.5-35B-A3B es un modelo de programación agéntico y que no es un competidor directo de Qwen3.6-35B, aunque ambos son de tamaño similar. La comparación con Qwen3.6-35B es la más razonable por rango de parámetros, pero no se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- **Sesgos y alucinación**: como todo modelo de lenguaje, puede generar información falsa o sesgada. No se han publicado evaluaciones de sesgo para esta cuantización específica.
- **Riesgo de alucinación en código**: al ser un modelo de programación, puede sugerir código incorrecto o con vulnerabilidades; se recomienda revisión humana en entornos de producción.
- **Limitaciones de idioma**: no se especifica la lista de idiomas soportados; aunque el modelo base es multilingüe, el rendimiento puede variar entre idiomas.
- **Limitaciones de contexto**: aunque el modelo base soporta hasta 256k tokens, el contexto efectivo en cuantización GGUF puede verse limitado por la memoria de la GPU. Las variantes pequeñas (I-Mini) pueden no ser adecuadas para contexto largo.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base en ornith-ai/Ornith-1.5-35B-A3B para confirmar que no hay cláusulas adicionales.
- **Cabeza MTP**: en las variantes Quality, Balanced y Compact la cabeza MTP está fijada a Q8_0, pero en I-Mini se mantiene a precisión de nivel y puede degradar la eficiencia de la decodificación especulativa.
- **Soporte de software**: se requiere una versión reciente de llama.cpp con soporte `qwen3_5_moe`; no funciona en versiones antiguas.
- **Sin benchmarks**: no se han publicado resultados de rendimiento para estas cuantizaciones, por lo que no se puede garantizar un comportamiento específico en términos de velocidad o calidad de salida.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Deepdive404-3/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Proyecto APEX: https://github.com/localai-org/apex-quant
- Repositorio de la misma cuantización en otra cuenta: https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
- Derivada con LoRA Heretic: https://huggingface.co/SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF
- Web del proyecto Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Discusión en foros de NVIDIA: https://forums.developer.nvidia.com/t/deepreinforce-ornith-1-5-family-released/380623
- Guía de despliegue en DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark/blob/main/README.md
