# Farggin/Lobo-Qwen3.8-27B-GSQ-RCO-IQ3_S-MTP-GGUF

## Resumen

Lobo-Qwen3.8-27B-GSQ-RCO-IQ3_S-MTP-GGUF es un artefacto de despliegue de un solo archivo, publicado por Farggin, que combina el modelo base Qwen/Qwen3.8-27B de Alibaba con una cuantización GSQ-RCO de ISTA-DASLab (IQ3_S) y una cabeza MTP (Multi-Token Prediction) donada por unsloth. El resultado es un GGUF de aproximadamente 12 GB diseñado específicamente para el runtime Lobo, un appliance de inferencia optimizado para una NVIDIA RTX 5070 Ti de 16 GB (arquitectura SM120). El ensamblaje es determinista y preserva los pesos byte a byte de las fuentes, sin entrenamiento adicional.

El modelo resuelve el problema de ejecutar un LLM de 27.3B parámetros con contexto nativo de 262K tokens en una GPU de consumo con solo 16 GB de VRAM, gracias a una cuantización agresiva (IQ3_S) y a la inclusión de MTP para acelerar la decodificación. Su relevancia radica en demostrar un flujo de trabajo reproducible para combinar cuantizaciones de alta calidad con cabezas de predicción múltiple, dirigido a hardware específico. El modelo base Qwen3.8-27B es un transformer denso híbrido con atención lineal en 48 de sus 64 capas, torre de visión y capacidades de agente, razonamiento y modo thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido con atencion lineal (48/64 capas) y torre de vision (modelo base Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens nativos (extensible a 1M segun el modelo base) |
| Tipos de cuantizacion | IQ3_S (base GSQ-RCO), MTP en IQ4_XS/IQ3_S, tensores de normalizacion en F32 |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero el repo no los especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico archivo de 11.975.960.640 bytes) |

## Arquitectura y entrenamiento

El artefacto no es un modelo reentrenado, sino un ensamblaje determinista de tres fuentes publicas bajo licencia Apache-2.0. El modelo base es Qwen3.8-27B, un transformer denso con atencion hibrida: 48 de sus 64 capas usan atencion lineal (para reducir coste computacional en contextos largos) y las 16 restantes usan atencion completa. Incluye una torre de vision para entrada de imagenes y una cabeza MTP integrada que predice multiples tokens por paso. La cuantizacion GSQ-RCO (IQ3_S) de ISTA-DASLab reduce los pesos a 3 bits con calidad optimizada mediante imatrix. El MTP se anade desde la cuantizacion UD-IQ3_XXS de unsloth, con los 15 tensores `blk.64.*` byte-identicos al donante. Los tensores MTP grandes usan IQ4_XS/IQ3_S y los de normalizacion permanecen en F32. No se aplico entrenamiento, aproximacion ni ajuste adicional; el ensamblaje es reproducible con el codigo del repositorio Lobo.

## Capacidades

- Generacion de texto, razonamiento complejo y resolucion de problemas en multiples dominios (codigo, matematicas, investigacion).
- Soporte de tool calling y function calling, permitiendo integracion con APIs y herramientas externas.
- Capacidades de agente y razonamiento multi-paso para tareas de largo horizonte, con mayor fiabilidad en la finalizacion de tareas complejas.
- Modo thinking conmutable, que permite alternar entre respuestas rapidas y razonamiento profundo.
- Capacidades multimodales: acepta entradas de imagen y texto para analisis visual, OCR y respuesta a preguntas visuales.
- MTP (Multi-Token Prediction) integrado, que acelera la decodificacion al predecir varios tokens por paso.
- Multilingue (heredado del modelo base, aunque no se detalla en el repo).

## Casos de uso

- Asistente de programacion con contexto largo: el modelo puede mantener conversaciones de codigo con ventanas de hasta 262K tokens, permitiendo analizar repositorios completos o archivos extensos sin perder el hilo. Su cuantizacion IQ3_S es adecuada para tareas de generacion y revision de codigo en una GPU de 16 GB.
- Agente autonomo con tool calling: gracias a su soporte de function calling y razonamiento multi-paso, puede orquestar flujos de trabajo que involucran llamadas a APIs, busquedas web o ejecucion de comandos, ideal para automatizacion de tareas en entornos de desarrollo.
- Analisis de documentos largos: con 262K tokens de contexto, puede resumir, extraer informacion y responder preguntas sobre libros, informes tecnicos o expedientes legales completos en una sola pasada.
- Chatbot de atencion al cliente con memoria extendida: el contexto largo permite mantener conversaciones multi-turno con historial amplio, mejorando la coherencia y la personalizacion en servicios de soporte.
- Analisis visual con razonamiento: al heredar la torre de vision del modelo base, puede procesar imagenes (capturas, diagramas, documentos escaneados) y combinarlas con razonamiento textual para tareas como OCR, descripcion de imagenes o diagnostico visual asistido.
- Desarrollo de agentes de investigacion: el modelo puede planificar y ejecutar tareas de investigacion de multiples pasos, recopilando informacion de fuentes diversas y sintetizando resultados, aprovechando su capacidad de razonamiento y su contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento del artefacto cuantizado, ni comparaciones con el modelo base o con otras cuantizaciones. Se recomienda consultar la documentacion del modelo base Qwen3.8-27B para referencias de calidad, teniendo en cuenta que la cuantizacion IQ3_S puede degradar ligeramente el rendimiento respecto a los pesos originales.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 11,15 GiB, por lo que cabe en una GPU con 16 GB de VRAM, dejando margen para activaciones y KV cache.
- GPU recomendada: NVIDIA RTX 5070 Ti (arquitectura SM120) con 16 GB. El runtime Lobo esta cualificado para Windows 11 con CUDA 13.3.
- No se garantiza su funcionamiento en otras GPUs o plataformas, aunque al ser un GGUF estandar podria ejecutarse con runtimes como llama.cpp u Ollama, sujeto a la disponibilidad de la cuantizacion IQ3_S y del MTP.
- Opciones de despliegue: runtime Lobo (repositorio alectodescent/lobo-qwen38-16gb), con perfiles "Balanced" (230K contexto) y "headless" (262K contexto). No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponibles. El MTP esta disenado para acelerar la decodificacion, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lobo-Qwen3.8-27B (este) | 27,3B | 262K | IQ3_S + MTP | Si | Apache-2.0 | GGUF unico archivo |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | 27,3B | 262K | IQ3_S (GSQ-RCO) | No | Apache-2.0 | GGUF (varios archivos) |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | 262K | UD-IQ3_XXS | Si | Apache-2.0 | GGUF (varios archivos) |
| Qwen/Qwen3.8-27B (original) | 27,3B | 262K | FP16/BF16 | Si (integrado) | Apache-2.0 | Safetensors |

La diferencia principal de este artefacto es que combina la cuantizacion GSQ-RCO de ISTA-DASLab con el MTP de unsloth en un unico archivo, optimizado para el runtime Lobo. El modelo original en FP16 requiere mas de 50 GB de VRAM, por lo que no es viable en una GPU de 16 GB sin cuantizacion.

## Limitaciones y advertencias

- La cuantizacion IQ3_S es agresiva y puede degradar la calidad de las respuestas en tareas que requieren alta precision, como matematicas avanzadas o generacion de codigo complejo.
- El artefacto solo esta cualificado para Windows 11, CUDA 13.3 y NVIDIA SM120 (RTX 5070 Ti). Otras plataformas o GPUs no estan garantizadas y pueden presentar errores o bajo rendimiento.
- El MTP requiere el runtime Lobo especifico; otros runtimes pueden ignorar la cabeza MTP o fallar al cargar el archivo.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad especificas para este artefacto. El modelo base Qwen3.8-27B puede presentar sesgos heredados de sus datos de entrenamiento y riesgo de alucinacion, especialmente en contextos largos.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion a las fuentes originales (Qwen, ISTA-DASLab, unsloth) y al runtime Lobo, que se distribuye bajo terminos MIT.
- El repositorio no especifica los idiomas soportados ni el rendimiento en lenguas distintas del ingles; se asume que hereda las capacidades multilingues del modelo base, pero sin garantia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Farggin/Lobo-Qwen3.8-27B-GSQ-RCO-IQ3_S-MTP-GGUF
- Runtime Lobo: https://github.com/alectodescent/lobo-qwen38-16gb
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Cuantizacion MTP de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Serie Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Documentacion de Qwen3.8-27B en Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
