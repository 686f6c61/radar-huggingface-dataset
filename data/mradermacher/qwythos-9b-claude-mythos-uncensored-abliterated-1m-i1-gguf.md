# mradermacher/Qwythos-9B-Claude-Mythos-Uncensored-Abliterated-1M-i1-GGUF

## Resumen

Qwythos-9B-Claude-Mythos-Uncensored-Abliterated-1M-i1-GGUF es la versión cuantizada en formato GGUF (con matriz de importancia) del modelo Qwythos-9B, desarrollado por el laboratorio independiente Empero. El modelo base original es una destilación full-parameter de Claude Mythos 5 sobre la arquitectura Qwen3.5-9B, con una ventana de contexto de 1M tokens y tool calling nativo. La variante aquí presentada, creada por Securelayer7, aplica técnicas de abliteración (eliminación de refusal) y recibe la etiqueta "uncensored", lo que la orienta a escenarios de red teaming, ciberseguridad y agentes autónomos que requieren respuestas sin restricciones.

La cuantización GGUF ha sido realizada por mradermacher (nethype GmbH) con el método imatrix, ofreciendo dos tamaños de archivo: 3.9 GB (i1-Q2_K) y 4.5 GB (i1-IQ4_M). Esto permite ejecutar el modelo en hardware de consumo con requisitos de VRAM moderados. Su relevancia actual reside en combinar un contexto ultralargo (1M tokens) con razonamiento de alta calidad en un formato ligero, bajo licencia Apache 2.0 y sin restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | i1-Q2_K (3.9 GB), i1-IQ4_M (4.5 GB) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwythos-9B es una destilacion full-parameter del modelo Claude Mythos 5 sobre la arquitectura Qwen3.5-9B, realizada por Empero. Segun la publicacion oficial, el proceso de destilacion incluye un ajuste fino supervisado (SFT) completo de todos los parametros, no solo de las capas superiores, lo que permite capturar los patrones de razonamiento del modelo profesor. La variante aqui presentada ha sido adicionalmente abliterada por Securelayer7, una tecnica que identifica y elimina las direcciones en el espacio de activaciones responsables de los rechazos de contenido, reduciendo la probabilidad de que el modelo se niegue a responder.

El entrenamiento con contexto de 1M tokens es una caracteristica clave, ya que permite procesar documentos completos o historiales de conversacion muy extensos. La destilacion se complementa con tool calling nativo y soporte para uso agente, lo que sugiere un entrenamiento orientado a tareas de razonamiento multi-paso. No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento ni la composicion del dataset, pero la mejora reportada de +34 puntos en MMLU sobre la base Qwen3.5-9B indica un ajuste sustancial.

## Capacidades

- Razonamiento multi-paso: el modelo verifica sus propias respuestas ("checks its own work"), una capacidad derivada de la destilacion de Claude Mythos 5.
- Generacion de texto creativo y conversacional: estilo narrativo de Claude, adecuado para escritura creativa o dialogos.
- Tool calling / function calling: soporte nativo para invocar herramientas externas dentro de flujos agente.
- Contexto largo de 1M tokens: permite procesar documentos completos, repositorios de codigo o historiales de conversacion extensos sin truncamiento.
- Uso agente: disenado para razonamiento multi-step y ejecucion de tareas complejas con herramientas.
- Capacidad de rechazo reducida: al ser una version abliterada, no suele negarse a responder a peticiones directas, incluso en temas sensibles.
- Multilingue limitado: soporte principal en ingles, con capacidades multilingues dependientes de la base Qwen3.5 (no garantizadas en esta version).

## Casos de uso

- Pruebas de red teaming y evaluacion de seguridad: el modelo puede generar exploits, vectores de ataque o payloads para pruebas de penetracion controladas, sin rechazar peticiones por contenido sensible.
- Analisis de documentos extensos: con su contexto de 1M tokens, puede resumir, extraer entidades o responder preguntas sobre libros completos, expedientes legales o codigos fuente de grandes repositorios.
- Agentes autonomos con herramientas: integrable en frameworks de agentes (p.ej. LangChain) para tareas como busqueda web, ejecucion de scripts o consultas a APIs, manteniendo el estado de conversaciones largas.
- Generacion de codigo de produccion: soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para generar tests, documentacion o parches de seguridad, aunque se recomienda supervisar su salida.
- Investigacion de vulnerabilidades: para analizar codigo en busca de fallos de seguridad o generar exploits controlados en entornos aislados.
- Asistentes conversacionales sin filtros: para aplicaciones de rol-playing o escritura creativa que requieran respuestas sin restricciones de contenido, siempre que el uso cumpla con la legislacion local.
- Redaccion tecnica y documentacion: genera documentacion tecnica de larga extension, guias de usuario o manuales de API, aprovechando la ventana de contexto para mantener coherencia en documentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta version cuantizada. La publicacion de Empero menciona una mejora de +34 puntos de MMLU sobre la base Qwen3.5-9B, pero no se proporcionan cifras absolutas ni comparaciones con otros modelos de la misma categoria. Se recomienda consultar el blog de Empero para datos de rendimiento del modelo original sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantizacion i1-IQ4_M (4.5 GB), se necesita un minimo de 8 GB de VRAM para cargar el modelo en memoria; con i1-Q2_K (3.9 GB), un minimo de 6-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4090 24 GB, A100 40 GB o superiores. Para contexto de 1M tokens completos, se recomienda al menos 24 GB de VRAM adicionales para el cache KV.
- En consumer GPU: si, cabe en GPU de 8-12 GB con cuantizaciones bajas, aunque el contexto largo exigira mas memoria. La cuantizacion i1-Q2_K es la opcion mas ligera.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, vLLM (con soporte GGUF), text-generation-webui, LM Studio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Con 9B parametros en una GPU consumer de 12 GB, se espera una velocidad de entre 20 y 40 tokens/s en cuantizacion Q4, dependiendo de la generacion y la GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwythos-9B-Claude-Mythos (original) | 9B | 1M | Apache 2.0 | HuggingFace | Modelo base sin abliteracion, con filtros de seguridad |
| Qwen3.5-9B (base) | 9B | 1M | Apache 2.0 | HuggingFace | Modelo original sin destilacion, menor rendimiento en razonamiento |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | HuggingFace | Alternativa de 8B con contexto menor y sin tool calling nativo |
| Qwen2.5-7B-Instruct | 7B | 128K | Apache 2.0 | HuggingFace | Menor tamano y contexto, sin destilacion de Claude |

Nota: los datos de rendimiento comparativo no estan disponibles para esta version cuantizada. La comparativa se basa en caracteristicas tecnicas publicas.

## Limitaciones y advertencias

- Contenido sin filtros: la version abliterada y "uncensored" elimina los rechazos de seguridad, lo que puede generar respuestas a peticiones ilegales o daninas. Su uso en entornos de produccion requiere control de acceso y supervisio humana.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente con contexto largo o temas especializados.
- Idioma limitado: el modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas es degradado.
- Contexto de 1M tokens: aunque teoricamente soporta 1M tokens, la calidad de atencion puede degradarse en la parte central del contexto muy largo; se recomienda pruebas con el caso de uso real.
- Cuantizacion de baja precision: la cuantizacion i1-Q2_K (3.9 GB) puede perder calidad de razonamiento en tareas complejas; se recomienda usar i1-IQ4_M para produccion.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, el modelo puede generar contenido que infrinja la legislacion de ciertos paises (difamacion, contenido ilegal). El usuario es responsable del uso.
- Sin garantias: el modelo base de Empero es una destilacion experimental; no hay garantia de rendimiento en entornos de produccion sin evaluacion previa.

## Enlaces

- Repositorio HuggingFace (cuantizacion GGUF): https://huggingface.co/mradermacher/Qwythos-9B-Claude-Mythos-Uncensored-Abliterated-1M-i1-GGUF
- Modelo base (Securelayer7): https://huggingface.co/Securelayer7/Qwythos-9B-Claude-Mythos-Uncensored-Abliterated-1M
- Cuantizacion estatica (mradermacher): https://huggingface.co/mradermacher/Qwythos-9B-Claude-Mythos-Uncensored-Abliterated-1M-GGUF
- Publicacion de Empero sobre Qwythos-9B: https://empero.org/writing/qwythos-9b-release
- Web de Empero: https://empero.org/
- Version en Ollama: https://ollama.com/richardyoung/qwythos-9b-abliterated
