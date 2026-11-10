# MigoXV/AgenticASR-Refiner-Q8_0

## Resumen

AgenticASR-Refiner-Q8_0 es una cuantización GGUF de 8 bits del modelo Andrew0425/AgenticASR-Refiner, publicada por el usuario MigoXV. Se trata de un modelo de 1.080.632.832 parámetros (aproximadamente 1,08 mil millones) diseñado específicamente para la corrección de texto procedente de transcripciones ASR (reconocimiento automático del habla). No procesa audio: recibe la transcripción ya generada y devuelve una versión corregida con mínimas modificaciones, preservando el significado original.

El modelo base es un transformer de arquitectura Llama (según los metadatos de conversión, con `head_dim=128` y `rope_theta=5000000`), y esta versión Q8_0 se ha exportado desde el checkpoint FP32 original pasando por un GGUF F16 y cuantizando directamente a Q8_0. El resultado son 170 matrices Q8_0 y 49 tensores F32, con un peso medio de aproximadamente 8,5 bits por parámetro. El repositorio ocupa 1,2 GB y el fichero GGUF pesa 1.153.529.088 bytes (unos 1,07 GiB).

Su relevancia actual radica en que ofrece una alternativa ligera y desplegable localmente para limpiar transcripciones ASR (eliminar muletillas, corregir errores tipográficos, normalizar números y fechas, resolver autocorrecciones) sin necesidad de un LLM de gran tamaño. Está pensado para ejecutarse con llama.cpp, con un contexto de trabajo corto (512 tokens en la configuración de referencia) y licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (GGUF, llama.cpp) |
| Parámetros totales | 1.080.632.832 (aprox. 1,08 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como límite de entrenamiento; configuración de trabajo de 512 tokens en el ejemplo del autor |
| Tipos de cuantización | Q8_0 (170 matrices Q8_0, 49 tensores F32, salida Q8_0); media aprox. 8,5 bit/parámetro |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `AgenticASR-Refiner-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de arquitectura Llama, según los metadatos de conversión recogidos en la model card (`head_dim=128`, `rope_theta=5000000`). Esta versión es una cuantización Q8_0 derivada del checkpoint FP32 original: se exportó primero a GGUF F16 y se cuantizó directamente a Q8_0, sin recuantizar pesos INT4. El resultado son 170 matrices Q8_0 y 49 tensores F32, incluida la cabeza de salida en Q8_0, con metadatos de escalado por bloques que elevan el peso medio a unos 8,5 bits por parámetro. No se ha realizado entrenamiento adicional sobre el modelo cuantizado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card tampoco detalla innovaciones arquitectónicas más allá de la propia arquitectura Llama. La build de llama.cpp utilizada como referencia es `f849095365d5ac1f560886a4e6574531d559e96f`, con un parche de compatibilidad para el runtime CANN de Ascend; conviene señalar que no se trata de un fichero OM nativo.

## Capacidades

- Corrección de texto ASR: elimina muletillas y repeticiones, corrige errores tipográficos, añade puntuación necesaria y normaliza números, fechas, terminología y símbolos de código.
- Tratamiento de autocorrecciones: resuelve reformulaciones propias del habla ("digo", "perdón", etc.).
- Modificación mínima: instruido para preservar el significado original sin resumir, expandir ni explicar.
- Extracción de entidades: puede añadir al final un campo `<KEY>[entidad1, entidad2]` con entidades propensas a error cuando corresponde.
- Generación de texto conversacional (pipeline `text-generation`), con plantilla de chat integrada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al chino (zh) según los metadatos.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el modelo no procesa audio directamente.

## Casos de uso

- Limpieza de transcripciones de reuniones: se introduce cada intervención transcrita por un sistema ASR y el modelo devuelve el texto con puntuación, sin muletillas y con números normalizados, aprovechando su instrucción de modificación mínima para no alterar el contenido.
- Post-procesado en pipelines de subtitulado: integrado tras el motor ASR para generar subtítulos legibles, corrigiendo errores frecuentes de reconocimiento y unificando formato de fechas y cifras.
- Normalización de datos en atención al cliente: limpiar transcripciones de llamadas antes de almacenarlas o analizarlas, garantizando que entidades como nombres, direcciones o importes queden en formato consistente.
- Preprocesado para sistemas de extracción de información: al añadir el campo `<KEY>[...]` con entidades sensibles, facilita la identificación posterior de términos críticos en documentos derivados de voz.
- Despliegue en entornos con hardware Ascend: la model card documenta validación en Ascend 910B4-1 con CANN 9.1.1, con un proceso de modelo de unos 1213 MiB en NPU, lo que permite ejecutarlo en infraestructura no NVIDIA.
- Servicio local de bajo coste con llama.cpp: con un fichero de 1,07 GiB y contexto de 512 tokens, puede ejecutarse en una sola GPU consumer o incluso en CPU para tareas de corrección de textos cortos (entradas de unas 128 palabras, salidas de hasta 256 tokens).
- Procesamiento por lotes de transcripciones cortas: el autor documenta 8 ranuras paralelas con 512 tokens cada una y 96 MiB de KV en F16, útil para limpiar grandes volúmenes de fragmentos breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente recoge una validación funcional en Ascend 910B4-1 con CANN 9.1.1 y decodificación greedy: 64 textos cortos con parada correcta y coincidencia literal 64/64 con la línea base FP32 en CPU vía Transformers (frente a 60/64 en Q4_0), y 8 solicitudes paralelas de 128 caracteres con resultados idénticos a la ejecución en serie. El autor advierte que la coincidencia en una muestra pequeña no equivale a ausencia de pérdida ni a una métrica de precisión de corrección.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF pesa 1,07 GiB; con contexto de 512 tokens y KV en F16, el autor reporta 96 MiB de caché para 8 ranuras. En NPU Ascend el proceso ocupa unos 1213 MiB en reposo y hasta 1267 MiB en muestreo.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de memoria libre debería acomodar el modelo con contexto corto; el autor validó en Ascend 910B4-1. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU consumer: por tamaño (1,08 B de parámetros en Q8_0), cabe en GPUs consumer con 4 GB o más de VRAM; no se aportan mediciones concretas.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de plantilla Jinja y endpoint compatible con Chat Completions. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles. El autor indica que no realizó benchmarks de rendimiento aislados ni pruebas de estrés prolongadas, y que había otros servicios NPU activos durante las pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| AgenticASR-Refiner-Q8_0 | 1,08 B | No disponible (512 tokens en config. de trabajo) | zh | Apache-2.0 | GGUF Q8_0 |
| Andrew0425/AgenticASR-Refiner (base) | 1,08 B | No disponible | zh | Apache-2.0 | Pesos originales (FP32/F16) |
| Alternativas de corrección ASR de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye otros modelos comparables de corrección de texto ASR, por lo que la comparativa se limita al modelo base y a la versión cuantizada.

## Limitaciones y advertencias

- La cuantización Q8_0 es intrínsecamente con pérdida; la coincidencia de salidas en una muestra pequeña no garantiza ausencia de degradación en producción.
- El modelo puede reproducir errores del original: el autor cita el caso de "十二万三千元" mal escrito como `12,300元` tanto en FP32 como en Q8_0.
- Solo soporta chino (zh); no hay evidencia de capacidades multilingües.
- No procesa audio: requiere un sistema ASR previo que genere la transcripción.
- El contexto de trabajo documentado es de 512 tokens, pensado para textos cortos (unas 128 palabras de entrada y hasta 256 tokens de salida); no se especifica el límite real de entrenamiento.
- No se han publicado benchmarks de precisión de corrección, sesgos ni robustez; se recomienda evaluar con textos de negocio reales (números, direcciones, nombres propios) antes de desplegar.
- La validación se realizó con una build concreta de llama.cpp y un parche de compatibilidad CANN; al migrar a otras builds o plantillas de chat debe verificarse la coherencia de los tokens de prompt.
- Licencia Apache-2.0, que permite uso comercial, pero se recomienda revisar el fichero `LICENSE` del repositorio y la licencia del modelo base.
- Riesgo de alucinación y de modificar contenido no deseado pese a la instrucción de modificación mínima; conviene fijar `temperature: 0` y validar las salidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MigoXV/AgenticASR-Refiner-Q8_0
- Modelo base: https://huggingface.co/Andrew0425/AgenticASR-Refiner
