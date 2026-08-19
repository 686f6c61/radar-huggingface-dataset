# OsaurusAI/Ornith-1.5-9B-JANG_4D

## Resumen

Ornith-1.5-9B es un modelo de lenguaje multimodal desarrollado por Ornith AI, diseñado específicamente para tareas de codificacion agente y razonamiento complejo. La version JANG_4D publicada por OsaurusAI es un bundle en formato MLX cuantizado en 4 bits mixtos, optimizado para ejecutarse en chips Apple Silicon. El modelo combina una arquitectura hibrida de atencion lineal gated-delta con atencion completa en proporcion 3:1, una torre de vision de 27 capas y soporte nativo para video, lo que lo convierte en una opcion solida para agentes que necesitan interpretar multiples modalidades.

La relevancia actual de este modelo reside en su equilibrio entre tamano (9B parametros densos), longitud de contexto de 262.144 tokens y capacidades agente como tool calling y razonamiento multi-paso. El bundle JANG_4D de OsaurusAI aplica una cuantizacion avanzada basada en la diagonal de la Hessiana, la imatrix y AWQ, consiguiendo un factor de compresion notable sin sacrificar rendimiento. Con una velocidad de decodificacion de 73.3 tokens/s en un chip M5 Max, esta pensado para despliegue local en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (hibrida gated-delta linear attention + full attention, proporcion 3:1) |
| Parametros totales | 9B (dense) |
| Parametros activos | No aplica (modelo dense) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit, 5-bit, 6-bit y 8-bit (distribucion: 86 tensores a 4-bit, 192 a 5-bit, 24 a 6-bit, 32 a 8-bit) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura de Ornith-1.5-9B se basa en un backbone hibrido que combina atencion lineal gated-delta con atencion full en una proporcion de 3:1, lo que permite manejar ventanas de contexto de 262.144 tokens con un coste computacional subcuadratico. El modelo incluye una torre de vision de 27 capas, lo que le permite procesar imagenes y video de forma nativa. El bundle JANG_4D conserva todos los tensores de la torre de vision en fp16 cuando sus dimensiones no son divisibles por el tamano de grupo de MLX, lo que garantiza la fidelidad de la representacion visual.

El entrenamiento del modelo base se enfoco en tareas agente y de razonamiento, con un enfoque particular en codificacion. Aunque no se han publicado los detalles exactos del dataset, los resultados en benchmarks como SWE-bench Verified (79) y Terminal-Bench 2.1 (67.8) indican que fue entrenado con datos de alta calidad en escenarios de ingenieria de software reales. La cuantizacion JANG_4D se realizo mediante tres metodos de calibracion: asignacion de bits basada en la traza de la Hessiana, ajuste imatrix con error relativo medio de 0.0432, y escalado AWQ de canales salientes absorbido en las normas RMSNorm. No se dispone de informacion sobre el uso de RLHF o DPO en el entrenamiento.

## Capacidades

- Generacion de texto, razonamiento y codificacion, con soporte para tool calling (parser `qwen3_coder`) y ejecucion de agentes.
- Razonamiento de pensamiento (thinking) activado por defecto, con la posibilidad de desactivarlo mediante un prefijo de bloque vacio. No hay niveles de `reasoning_effort` como en Qwen3.8.
- Vision: procesamiento de imagenes con la torre de vision de 27 capas y preprocesador integrado.
- Video: soporte nativo para secuencias de video, verificado de extremo a extremo.
- Multimodalidad texto-imagen-video, aunque sin soporte de audio (los tokens de audio son vestigiales y no hay pesos de torre de audio).
- Capacidades agente de codificacion: integrado para tareas de SWE-bench y terminal, con presets de muestreo especificos para codigo (temperatura 0.6, presencia 0.0).
- Decodificacion especulativa (MTP) no disponible en el 9B; solo existe en la version 35B-A3B de la familia.

## Casos de uso

- Desarrollo de agentes de codigo autogestionados: el modelo puede resolver incidencias en repositorios y ejecutar comandos de terminal, como demuestra su resultado de 79 en SWE-bench Verified, por lo que es adecuado para pipelines de CI/CD que requieran reparacion automatica de errores.
- Asistente de programacion multimodal: gracias a su capacidad de vision, puede analizar capturas de pantalla de IDEs, diagramas de arquitectura o documentacion tecnica, y generar codigo o sugerencias de refactorizacion.
- Analisis de video para documentacion tecnica: puede procesar grabaciones de sesiones de depuracion o tutoriales de codigo, extraer pasos y generar resumenes accionables.
- Razonamiento de agentes de largo plazo: con un contexto de 262.144 tokens, puede mantener conversaciones multi-turno extensas con historial de razonamiento, util para asistentes virtuales que gestionan proyectos complejos.
- Generacion de documentacion tecnica: el modelo puede analizar codigo fuente y generar documentacion explicativa, comentarios y ejemplos de uso, manteniendo consistencia a lo largo de documentos largos.
- Herramientas de analisis de imagenes medicas o de ingenieria: su torre de vision permite identificar anomalias en imagenes de equipos o diagramas tecnicos, y generar informes descriptivos.
- Despliegue local en entornos de investigacion: al ser cuantizado para MLX y con licencia MIT, puede integrarse en notebooks y herramientas de investigacion que requieren procesamiento local sin conexion a la nube.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 79 |
| Terminal-Bench 2.1 | 67.8 |

Estos resultados corresponden al modelo base Ornith-1.5-9B, no a la version cuantizada JANG_4D. No se dispone de datos de benchmarks para la version cuantizada, aunque la cuantizacion de 4-8 bits suele degradar el rendimiento en tareas de razonamiento entre un 1% y un 3% en modelos de este tamano.

## Requisitos de hardware

- VRAM estimada: el bundle ocupa 5.93 GiB en disco, por lo que puede caber en una GPU con 8 GiB de VRAM o mas, aunque se recomienda al menos 12 GiB para dejar margen a la ventana de contexto.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4/M5) por su compatibilidad nativa con MLX; tambien puede ejecutarse en GPUs NVIDIA mediante vLLM o Transformers, aunque no se ha optimizado para CUDA.
- En Apple Silicon M5 Max se alcanza una velocidad de decodificacion de 73.3 tokens/s.
- En consumer GPU, una RTX 3090 o RTX 4090 (24 GiB) puede ejecutar el modelo sin problemas, aunque la velocidad dependera de la implementacion.
- Opciones de despliegue: MLX (local en Apple), vLLM, llama.cpp, Ollama, TGI (aunque no se ha probado en estos frameworks).
- Para uso en produccion, se recomienda configurar la ventana de contexto a 262K solo si es necesario; el consumo de memoria aumenta con el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | SWE-bench Verified | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (JANG_4D) | 9B dense | 262.144 | MIT | 79 | Cuantizacion MLX, multimodal (vision/video) |
| Qwen3-8B | 8.2B dense | 131.072 | Apache 2.0 | no disponible | Modelo de razonamiento general, sin vision |
| GLM-4-9B | 9B dense | 128.000 | Apache 2.0 | no disponible | Soporte de tool calling, sin vision nativa |
| Llama-3.1-8B | 8B dense | 131.072 | Llama 3.1 License | no disponible | Modelo general, sin vision |

Ornith-1.5-9B destaca por su soporte multimodal (vision y video) y su contexto de 262K, superior a los 128K de los competidores. Su licencia MIT es mas permisiva que la de Llama. No se dispone de datos de benchmarks en codigo para los modelos comparados.

## Limitaciones y advertencias

- El modelo solo soporta el idioma ingles; no se ha entrenado para otros idiomas.
- No soporta audio: los tokens de audio existen en el tokenizer, pero el modelo no tiene pesos de torre de audio, por lo que cualquier intento de usar esa funcionalidad fallara.
- Riesgo de alucinacion en tareas de razonamiento complejo, especialmente con contextos muy largos o cuando se le pide generar codigo para APIs poco conocidas.
- La cuantizacion JANG_4D puede degradar ligeramente la precision en tareas de vision o razonamiento matematico, aunque el error relativo medio es bajo (0.0432).
- El razonamiento esta activado por defecto; si se desactiva, el modelo prefill un bloque de pensamiento vacio, lo que puede confundir a parsers que detectan la presencia de bloque de pensamiento.
- No se ha probado en frameworks CUDA de forma oficial, por lo que el rendimiento en GPUs NVIDIA puede ser suboptimo.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que no infringe ninguna patente o restriccion de terceros.

## Enlaces

- [HuggingFace - OsaurusAI/Ornith-1.5-9B-JANG_4D](https://huggingface.co/OsaurusAI/Ornith-1.5-9B-JANG_4D)
- [Modelo base - ornith-ai/Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [Web de Ornith AI - Blog de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Guia de Ornith AI](https://ornith.online/)
