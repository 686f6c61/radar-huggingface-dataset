# FlatFootInternational/Qwen3.5-9b-MTPLX-8bit-g32

## Resumen

El modelo `FlatFootInternational/Qwen3.5-9b-MTPLX-8bit-g32` es una versión cuantizada y adaptada del modelo Qwen3.5-9B, desarrollada por el usuario FlatFootInternational. Está diseñado específicamente para ejecutarse en Apple Silicon mediante el framework MLX, e incorpora una técnica de multi-token prediction (MTP) que acelera la inferencia al predecir varios tokens por paso y verificar el resultado en una única pasada. El modelo se presenta como una alternativa optimizada para entornos locales en Mac, con una cuantización de 8 bits y un "draft head" calibrado para MTP.

La relevancia de este modelo radica en su enfoque en la eficiencia de inferencia en hardware de Apple, un nicho donde las soluciones tradicionales de GPU no son aplicables. Aunque el modelo base Qwen3.5-9B es conocido por su capacidad multimodal y de razonamiento, esta versión MTPLX prioriza la velocidad de generación en dispositivos con memoria unificada. El repositorio incluye un archivo de verificación (`mtplx_runtime.json`) que documenta un multiplicador de velocidad de 2.61× frente a la línea base autoregresiva, validado en un Apple M5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con multi-token prediction (MTP) y cuantizacion 8-bit MLX |
| Parametros totales | 2.975.030.512 (segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-9B soporta 262K, pero esta version no lo especifica) |
| Tipos de cuantizacion | 8-bit (group 32) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se construye a partir de Qwen3.5-9B, un transformer denso con capacidades multimodales y de razonamiento. La adaptación MTPLX añade un "draft head" calibrado que permite la predicción de múltiples tokens en paralelo, una forma de decodificación especulativa. El proceso de "forja" se realiza con la herramienta MTPLX Forge, que aplica cuantización de 8 bits con agrupación de 32 canales y calibra el head de draft para mantener la distribución de salida del modelo original. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO; la model card solo menciona la calibración del head MTP.

La innovación principal es el uso de MTP en un runtime MLX, que permite que el modelo genere varios tokens candidatos y los verifique en una sola pasada, reduciendo el número de iteraciones necesarias. Según la verificación incluida, el mejor rendimiento se obtiene con una profundidad de draft de 3 (D3), logrando un multiplicador de 2.61× frente a la generación autoregresiva estándar, con un sampler de temperatura 0.6, top_p 0.95 y top_k 20.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, que incluye razonamiento multi-paso y modo de pensamiento (thinking mode) activable.
- Generacion de codigo y matematicas: el modelo base destaca en tareas de programacion y calculo, aunque no hay benchmarks especificos para esta version.
- Multimodalidad: el modelo base soporta entrada de imagenes y video, pero no se confirma si esta version cuantizada mantiene dicha funcionalidad.
- Multi-token prediction: capacidad exclusiva de esta version, que acelera la inferencia en Apple Silicon.
- Soporte de tool calling y agentes: no documentado en la model card, pero probablemente heredado del modelo base.
- Multilingue: no se especifican idiomas soportados en esta version.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede ejecutarse en un Mac con Apple Silicon mediante MTPLX, ofreciendo respuestas en tiempo real sin conexion a internet. Su velocidad mejorada por MTP lo hace adecuado para interacciones multi-turno.
- Autocompletado de codigo en entornos de desarrollo: al heredar las capacidades de Qwen3.5-9B, puede sugerir fragmentos de codigo y completar funciones, con la ventaja de una latencia reducida en hardware Apple.
- Procesamiento de documentos y resumen: con un contexto potencial de hasta 262K (si se mantiene del modelo base), puede analizar documentos largos, aunque no hay confirmacion de que esta version conserve esa longitud.
- Prototipado rapido de aplicaciones de IA: al ser un modelo ligero (8-bit) y con licencia Apache-2.0, permite integrarse en proyectos comerciales sin restricciones de uso.
- Educacion y experimentacion: su facilidad de despliegue en Mac lo convierte en una herramienta util para estudiantes e investigadores que quieran probar tecnicas de decodificacion especulativa.
- Generacion de contenido creativo: cuentos, articulos o guiones, aprovechando la generacion de texto fluida del modelo base, con la ventaja de una inferencia mas rapida en equipos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica documentada es la verificacion del rendimiento de MTP:

| Metrica | Valor |
|---|---|
| Mejor profundidad de draft (D) | 3 |
| Multiplicador vs linea base autoregresiva | 2.61× |
| Hardware de verificacion | Apple M5 |
| Sampler | temperatura 0.6, top_p 0.95, top_k 20 |

Estos datos indican una mejora sustancial en velocidad de generacion, pero no aportan informacion sobre la calidad de las respuestas en tareas de razonamiento o conocimiento.

## Requisitos de hardware

- Dispositivo: Apple Silicon (M1 o posterior; verificado en M5). No compatible con GPUs NVIDIA o AMD.
- Memoria: al ser un modelo de 8-bit con ~2.975 millones de parametros (segun safetensors), el tamaño del repositorio es de 10.9 GB, lo que sugiere que los pesos ocupan aproximadamente esa cantidad en disco. La memoria unificada necesaria para inferencia no se especifica, pero un Mac con 16 GB de RAM deberia ser suficiente para cargar el modelo.
- Opciones de despliegue: MTPLX (app nativa y CLI) es el runtime recomendado. No se mencionan otros frameworks como vLLM o llama.cpp.
- Latencia y throughput: no se proporcionan cifras concretas, pero el multiplicador de 2.61× frente a la generacion autoregresiva indica una reduccion significativa del tiempo de generacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros modelos de la misma categoria. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B (base) | ~9B | 262K | Apache-2.0 | Modelo original, multimodal, sin cuantizar |
| Qwen3.5-9b-MTPLX-8bit-g32 | 2.975.030.512 (segun safetensors) | No disponible | Apache-2.0 | Version cuantizada 8-bit con MTP para Apple Silicon |
| Qwen3-8B (referencia) | ~8B | 32K | Apache-2.0 | Generacion anterior, sin MTP |

La comparacion con el modelo base es la mas relevante: esta version sacrifica precision (por la cuantizacion) y posiblemente contexto, a cambio de velocidad en hardware Apple. No hay datos de rendimiento en tareas estandar para confirmar el impacto de la cuantizacion.

## Limitaciones y advertencias

- La cuantizacion de 8 bits puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo original, especialmente en tareas que requieren alta precision.
- El modelo esta optimizado exclusivamente para Apple Silicon; no funcionara en GPUs de NVIDIA o AMD sin una conversion adicional.
- No se han publicado benchmarks de calidad, por lo que el impacto real de la cuantizacion y del MTP en la precision es desconocido.
- El numero de descargas es 0, lo que indica que el modelo es muy reciente y no ha sido ampliamente probado por la comunidad.
- No se especifican los idiomas soportados; se asume que hereda los del modelo base, pero no hay confirmacion.
- La longitud de contexto no esta documentada en esta version; si se reduce respecto al modelo base, podria limitar el procesamiento de documentos largos.
- No hay informacion sobre sesgos o riesgos de alucinacion especificos de esta version, pero al derivar de Qwen3.5-9B, podria heredar los sesgos del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FlatFootInternational/Qwen3.5-9b-MTPLX-8bit-g32
- Repositorio alternativo (sin 8bit en el nombre): https://huggingface.co/FlatFootInternational/Qwen3.5-9B-MTPLX
- Arbol de archivos: https://huggingface.co/FlatFootInternational/Qwen3.5-9B-MTPLX/tree/main
- Proyecto MTPLX en GitHub: https://github.com/youssofal/mtplx
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/FlatFootInternational/Qwen3.5-9B-MTPLX
- Guia de configuracion de Qwen 3.5 9B (referencia del modelo base): https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
