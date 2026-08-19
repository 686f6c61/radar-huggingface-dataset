# saracen9/amoral-qwen3.8-27b

## Resumen

El modelo `saracen9/amoral-qwen3.8-27b` es una variante modificada del Qwen3.8-27B de Alibaba, desarrollada por el usuario saracen9. Se trata de un modelo multimodal denso de visión y lenguaje que ha sido sometido a un proceso de "abliteración" (eliminación de las direcciones de rechazo) y posterior reentrenamiento con QLoRA sobre un corpus de razonamiento amoral. El resultado es un modelo que razona y procesa imágenes en el mismo turno, sin rechazar peticiones legales que el modelo original podría denegar.

La relevancia de este modelo radica en que combina las capacidades nativas de razonamiento y visión del Qwen3.8-27B con una política de "no rechazo" en contenido legal, lo que lo hace útil para escenarios de investigación, análisis de seguridad y automatización donde el modelo base podría negarse a responder. El autor ha validado que la transición pensar→responder se mantiene intacta y que la visión no se degrada tras el reentrenamiento.

El modelo se distribuye en formato GGUF de dos ficheros (texto y proyector de visión) y pesa aproximadamente 16,5 GB en cuantización Q4_K_M, lo que permite su ejecución en GPUs de consumo con 24 GB de VRAM. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en proyectos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8, basado en Qwen3.5) con proyector CLIP para vision |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para esta variante; el Qwen3.8-27B base soporta 262.000 tokens, pero el despliegue de ejemplo en ollama usa 8.192 |
| Tipos de cuantizacion | Q4_K_M (modelo de texto, ~16,5 GB); F16 (proyector de vision) |
| Idiomas soportados | No disponible (el Qwen3.8-27B base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: text-q4km.gguf y mmproj-f16.gguf) |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B, un transformer denso multimodal de Alibaba basado en la arquitectura Qwen3.5, que incorpora un codificador de vision CLIP y un proyector para integrar información visual en el modelo de lenguaje. Sobre esta base, el autor aplicó el proceso de "abliteración" (eliminacion de las direcciones de rechazo en el espacio de activaciones) con un coeficiente KL de 0,001 a 0,011, obteniendo el modelo intermedio `saracen9/amoral-qwen3.8-27B-abliterated`.

Posteriormente se realizó un reentrenamiento con QLoRA sobre un corpus de razonamiento amoral, mezclado con un "vision-reasoning replay set" para evitar la regresión del componente visual. Esta mezcla es clave: un reentrenamiento solo de texto provocaría que el modelo dejara de producir salida de vision y razonamiento, mientras que el replay set mantiene intacta la transición pensar→responder y la capacidad de razonar sobre imágenes. El proyector de vision se distribuye por separado en formato F16 y es imprescindible para el uso multimodal.

## Capacidades

- Razonamiento y vision en el mismo turno: acepta imagen y texto como entrada y produce una secuencia de razonamiento (`thinking`) seguida de la respuesta final.
- Sin rechazos en contenido legal: el modelo no se niega a responder peticiones legales que el Qwen3.8-27B original podría rechazar, incluyendo rutas de síntesis química o exploits funcionales.
- Vision multimodal: puede describir imágenes explicitas directamente, sin evasivas ni negativas.
- Razonamiento multi-paso: conserva las capacidades de razonamiento del Qwen3.8-27B, que destaca en tareas de agente y razonamiento largo.
- Generacion de codigo: el modelo base es competente en programación, aunque esta variante no incluye evaluaciones especificas de codigo en la informacion disponible.
- Compatibilidad con herramientas de inferencia local: se sirve via Ollama, LM Studio, llama.cpp y otros motores compatibles con GGUF.

## Casos de uso

- **Investigacion de seguridad ofensiva**: el modelo puede generar rutas de síntesis quimica o explicar exploits funcionales sin rechazos, lo que resulta util en entornos de investigacion de seguridad controlados y con fines educativos.
- **Analisis de imagenes con razonamiento profundo**: dado que razona sobre imagenes, puede usarse para inspeccionar diagramas, esquemas o capturas de pantalla y producir un analisis razonado, no solo una descripcion.
- **Automatizacion de oficina**: el Qwen3.8-27B base destaca en tareas de automatizacion de oficina (OSWorld 84.3), y esta variante mantiene esas capacidades con el anadido de no rechazo.
- **Agentes autonomos**: su capacidad de razonamiento multi-paso y vision permite construir agentes que interpretan su entorno visual y ejecutan acciones sin necesidad de un modelo de rechazo.
- **Desarrollo de software con input visual**: puede recibir capturas de pantalla o diagramas de arquitectura y generar codigo o documentacion tecnica a partir de ellos, sin limitaciones de rechazo.
- **Investigacion academica en seguridad de IA**: sirve como modelo de referencia para estudiar el efecto de la abliteracion en el comportamiento de rechazo y en la calidad del razonamiento multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante abliterada en la informacion disponible. El modelo base Qwen3.8-27B, reportado en la busqueda web, obtiene los siguientes resultados:

| Benchmark | Resultado (Qwen3.8-27B base) |
|---|---|
| DeepSWE | 42,2 |
| Terminal Bench | 73,0 |
| OSWorld | 84,3 |

Estos datos corresponden al modelo original de Alibaba, no a la variante abliterada. No se dispone de mediciones independientes del modelo de saracen9.

## Requisitos de hardware

- **VRAM estimada**: el fichero Q4_K_M ocupa aproximadamente 16,5 GB, por lo que cabe en una GPU con 24 GB de VRAM (como RTX 3090, RTX 4090 o A5000). Para mayor precision, se recomienda 24 GB para el modelo completo y el proyector de vision.
- **GPUs recomendadas**: RTX 3090/4090 (24 GB), A5000 (24 GB), o GPUs profesionales de 24 GB o superior. Tambien es compatible con AMD Ryzen AI Max y Radeon GPUs (con soporte Day 0 segun AMD).
- **CPU**: puede ejecutarse en sistemas con 32 GB de RAM mediante cuantizacion Q4_K_M, aunque con menor rendimiento.
- **Opciones de despliegue**: ollama (con el Modelfile indicado en la model card), LM Studio, llama.cpp y motores compatibles con GGUF.
- **Latencia y throughput**: no se han publicado datos concretos; la latencia dependera del hardware y del numero de tokens de contexto. Con 8192 de contexto en una RTX 4090, se espera una generacion fluida, pero sin cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `saracen9/amoral-qwen3.8-27b` | 26,9B | 262K (base) / 8192 (ejemplo) | Si | Apache 2.0 | GGUF | Variante abliterada, sin rechazos |
| `qwen/qwen3.8-27b` (base) | 26,9B | 262K | Si | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, con rechazos |
| `qwen/qwen3.8-27b-it` (instrucciones) | 26,9B | 262K | Si | Apache 2.0 | safetensors, GGUF | Variante de instrucciones, tambien con rechazos |
| Llama 3.2 27B (vision) | 27B | 128K | Si | Llama 3.2 Community | safetensors, GGUF | Alternativa de Meta, con rechazos y sin abliterar |

No se dispone de comparativas de rendimiento entre la variante abliterals y los modelos base, ya que no se han publicado benchmarks especificos de la variante.

## Limitaciones y advertencias

- **Contenido explicito**: el modelo puede generar contenido explicito o sensible sin rechazos, lo que requiere un uso responsable y puede no ser apto para todos los publicos.
- **Sesgos y alucinaciones**: no se ha evaluado si la abliteracion introduce sesgos adicionales; se recomienda validar las respuestas en aplicaciones de produccion.
- **Riesgo de mal uso**: al no rechazar peticiones legales, podria facilitar la generacion de contenido danino si se usa con intenciones maliciosas. El autor excluye contenido de abuso sexual infantil, pero no otras categorias.
- **Contexto limitado en el despliegue**: el ejemplo de ollama usa 8192 tokens de contexto, muy por debajo del limite de 262K del modelo base, lo que puede limitar tareas de contexto largo.
- **Dependencia del proyector de vision**: el fichero `mmproj-f16.gguf` es obligatorio para la vision; omitirlo produce un modelo de solo texto sin aviso.
- **Modelo de terceros**: no es un modelo oficial de Alibaba, por lo que no se garantiza el soporte ni la correccion de errores por parte del equipo de Qwen.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero la variante no ha sido auditada de forma independiente; el usuario asume el riesgo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/saracen9/amoral-qwen3.8-27b)
- [Base abliterals: saracen9/amoral-qwen3.8-27B-abliterated](https://huggingface.co/saracen9/amoral-qwen3.8-27B-abliterated)
- [LoRA de razonamiento: saracen9/amoral-reasoning-corpus](https://huggingface.co/saracen9/amoral-reasoning-corpus)
- [GitHub del Qwen3.8-27B de Alibaba](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog de AMD sobre soporte de Qwen3.8-27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Guia completa de Qwen3.8-27B (lovableapp.org)](https://lovableapp.org/blog/qwen3-8-27b)
- [Modelo en LM Studio](https://lmstudio.ai/models/qwen/qwen3.8-27b)
