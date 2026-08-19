# exalandru/Mistral-Small-4-119B-2603-Mixed-4bit-MLX

## Resumen

Mistral Small 4 119B 2603 es un modelo de lenguaje de gran tamaño desarrollado por Mistral AI, diseñado como un modelo híbrido que unifica las capacidades de instrucción, razonamiento y generación de código en un único sistema. Con 119 mil millones de parámetros en total y solo 6,5 mil millones activos gracias a su arquitectura de mezcla de expertos (MoE), ofrece un rendimiento elevado con un coste computacional reducido. Además, incorpora capacidades multimodales, permitiendo procesar imágenes junto con texto, y admite una ventana de contexto de hasta 256.000 tokens.

La versión aquí descrita, publicada por el usuario exalandru, es una cuantización de precisión mixta de aproximadamente 4 bits por peso, generada con la librería MLX y optimizada para ejecutarse en hardware Apple Silicon. Esto la convierte en una opción práctica para desarrolladores que trabajan en entornos macOS con chips de la serie M, ya que reduce el tamaño del modelo a 58,1 GB y permite su ejecución local con requisitos de memoria moderados. La licencia Apache 2.0 facilita su uso tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (Mixture of Experts) con módulo de visión |
| Parametros totales | 119B (modelo base) |
| Parametros activos | 6,5B |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | 4-bit mixto (mixed precision ~4bpw) para MLX |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Mistral Small 4 119B 2603 emplea una arquitectura de transformer con mezcla de expertos (MoE) en la que solo 6,5 mil millones de parámetros se activan por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Es un modelo híbrido que integra tres familias de modelos de Mistral: instruct (seguimiento de instrucciones), reasoning (razonamiento) y Devstral (especializado en código), unificando sus capacidades en un único conjunto de pesos. Además, incorpora un codificador de visión que le permite procesar imágenes como entrada, aunque no puede generarlas.

No se han publicado detalles específicos sobre el volumen de datos de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información disponible. Sin embargo, el modelo está diseñado para funcionar tanto como asistente conversacional general como para tareas de razonamiento complejo y programación, con soporte para tool calling y navegación web (aunque el system prompt indica que no puede acceder a internet directamente). La cuantización aplicada en esta versión MLX reduce la precisión de los pesos a aproximadamente 4 bits, lo que disminuye el tamaño del archivo y los requisitos de memoria a costa de una posible pérdida mínima de calidad.

## Capacidades

- Generación de texto y conversación multi-turno en 24 idiomas.
- Razonamiento y resolución de problemas complejos, con capacidad de cambiar entre modos de instrucción y razonamiento según la tarea.
- Generación y comprensión de código, incluyendo soporte para tool calling (llamada a funciones) y uso de herramientas externas.
- Procesamiento multimodal: puede leer y comprender imágenes, aunque no genera imágenes ni procesa audio o vídeo.
- Soporte para agentes y razonamiento multi-paso, con instrucciones explícitas para usar herramientas cuando la información requiere actualización o datos específicos.
- Ventana de contexto extensa de 256.000 tokens, adecuada para documentos largos y conversaciones prolongadas.
- Capacidad de seguir instrucciones detalladas y adaptarse al idioma del usuario.

## Casos de uso

- Asistencia técnica y atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 256.000 tokens de ventana, resolviendo dudas sobre productos o servicios en múltiples idiomas.
- Generación de código en entornos de desarrollo: gracias a su especialización en código y soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código, así como para automatizar tareas de programación.
- Análisis de documentos extensos: su gran contexto permite procesar informes, contratos o artículos científicos completos, extrayendo información relevante o resumiendo contenido.
- Razonamiento y resolución de problemas: el modo de razonamiento integrado lo hace útil para tareas de lógica, matemáticas o planificación, como la elaboración de estrategias o la depuración de algoritmos.
- Procesamiento de imágenes con texto: puede analizar capturas de pantalla, diagramas o fotografías y responder preguntas sobre su contenido, combinando visión y lenguaje.
- Desarrollo de agentes autónomos: con su capacidad de tool calling y razonamiento multi-paso, puede actuar como núcleo de agentes que consultan APIs, bases de datos o servicios externos para completar tareas complejas.
- Traducción y localización: al soportar 24 idiomas, puede traducir contenido manteniendo el contexto y el tono, útil para equipos internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización específica. El modelo base de Mistral AI ha sido evaluado en tareas estándar como MMLU, HumanEval o GSM8K, pero no se proporcionan cifras concretas en la documentación consultada. Se recomienda consultar la página del modelo base en Hugging Face o la documentación oficial de Mistral para obtener datos comparativos.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (chips M1, M2, M3, M4 y superiores) mediante la librería MLX.
- El tamaño del archivo cuantizado es de 58,1 GB, por lo que se recomienda un Mac con al menos 64 GB de memoria unificada para cargar el modelo completo en RAM y ejecutar inferencias sin swapping.
- Con 128 GB de memoria unificada se puede operar con mayor comodidad, dejando espacio para el sistema operativo y otras aplicaciones.
- Para tareas de generación de texto, la velocidad dependerá del número de núcleos de la GPU integrada; los chips M2 Ultra o M3 Max ofrecen el mejor rendimiento.
- Opciones de despliegue: se puede utilizar directamente con `mlx-vlm` mediante la interfaz de línea de comandos, o integrarse en aplicaciones propias usando la API de MLX. También es compatible con oMLX, una interfaz gráfica para ejecutar modelos MLX.
- No es posible ejecutar este modelo en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estándar), ya que la cuantización está optimizada para MLX.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mistral Small 4 119B 2603 (base) | 119B | 6,5B | 256k | Apache 2.0 | safetensors |
| Mistral Small 4 119B 2603 (MLX 4-bit) | 119B | 6,5B | 256k | Apache 2.0 | safetensors (MLX) |
| Qwen3-30B-A3B | 30B | 3B | 128k | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V3 | 671B | 37B | 128k | MIT | safetensors |

La comparativa se limita a modelos con arquitectura MoE y licencias permisivas. El modelo de Mistral destaca por su mayor contexto (256k) y su capacidad multimodal, mientras que Qwen3-30B-A3B es más ligero y adecuado para entornos con menos recursos. DeepSeek-V3 ofrece más capacidad pero requiere hardware de gama alta. No se dispone de datos de rendimiento comparativos en la información consultada.

## Limitaciones y advertencias

- La cuantización de 4 bits puede introducir una ligera degradación en la calidad de las respuestas en comparación con el modelo en precisión completa, especialmente en tareas de razonamiento complejo o matemáticas.
- El modelo no puede generar imágenes ni procesar audio o vídeo; solo acepta imágenes como entrada multimodal.
- El conocimiento del modelo está limitado a noviembre de 2024, por lo que no conoce eventos posteriores a esa fecha. El system prompt recomienda usar herramientas para información actualizada, pero la versión cuantizada no incluye acceso a internet por defecto.
- Aunque soporta tool calling, la implementación depende del framework de ejecución (MLX) y puede requerir configuración adicional para integrar herramientas externas.
- El modelo puede presentar sesgos o alucinaciones, como cualquier LLM, especialmente en temas poco representados en sus datos de entrenamiento. Se recomienda verificar información crítica.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener la atribución correspondiente.
- El tamaño del archivo (58,1 GB) y los requisitos de memoria (mínimo 64 GB) limitan su uso a equipos Mac de gama alta; no es viable en portátiles con menos de 32 GB de RAM.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/exalandru/Mistral-Small-4-119B-2603-Mixed-4bit-MLX
- Modelo base en Hugging Face: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Documentación oficial de Mistral Small 4: https://docs.mistral.ai/models/mistral-small-4-0-26-03
- Página de NVIDIA NIM para el modelo: https://build.nvidia.com/mistralai/mistral-small-4-119b-2603
- Referencia de API de NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/mistralai-mistral-small-4-119b-2603
