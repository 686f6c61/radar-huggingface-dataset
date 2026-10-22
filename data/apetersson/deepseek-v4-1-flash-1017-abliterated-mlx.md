# apetersson/DeepSeek-V4.1-Flash-1017-Abliterated-MLX

## Resumen

`apetersson/DeepSeek-V4.1-Flash-1017-Abliterated-MLX` es un checkpoint cuantizado en formato MLX del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicado por el usuario apetersson. No se trata de un entrenamiento nuevo, sino de una conversión a Apple Silicon con cuantización mixta de aproximadamente 2,5 bits (variante `oQ2.5e-mtp`), derivada a su vez del modelo intermedio `pqhaz/DeepSeek-V4.1-Flash-1017-heretic`, que aplica una modificación de tipo *abliteration* para eliminar la dirección de rechazo del modelo original. Los pesos ya incorporan esa modificación, por lo que no se necesita ningún adaptador de direccionamiento en tiempo de ejecución.

El paquete ocupa unos 342,7 GB (319,2 GiB) repartidos en 53 shards de safetensors y está pensado para ejecutarse con oMLX 0.7.2 sobre un Mac con 256 GiB de memoria unificada. El autor separa explícitamente el tamaño del paquete del requisito de memoria: los pesos residentes con las tablas Engram descargadas a SSD quedan en torno a 204,7 GiB, mientras que unos 114,4 GiB de tensores Engram viven en almacenamiento local rápido. El contexto probado arranca en 32K tokens, con 256K configurable pero sin garantía de encaje para dos peticiones simultáneas a máxima ventana; el modelo base anuncia ventanas mucho mayores.

La relevancia de esta ficha es doble: por un lado documenta una ruta de despliegue local de un modelo de la familia DeepSeek V4.1 en hardware Apple; por otro, advierte de que el checkpoint está en proceso de subida (el propio autor marca «INCOMPLETE CHECKPOINT. DO NOT DOWNLOAD OR START IT YET») y de que el modelo ha sido sometido a un proceso de eliminación de rechazos, lo que cambia por completo su perfil de seguridad respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (checkpoint MLX del transformer de DeepSeek-V4.1-Flash-1017) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se especifica si el modelo base es MoE) |
| Longitud de contexto | 32K recomendado y probado; 256K configurable sin garantia de encaje con dos peticiones llenas; el modelo base anuncia 1M de tokens |
| Tipos de cuantizacion | oQ2.5e mixta en formatos afines mixtos y MXFP nativos de MLX (no es GGUF ni 2,5 bits uniforme) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors en formato MLX, 53 shards (variante `oQ2.5e-mtp`) |
| Tamano del paquete | Aproximadamente 342,7 GB / 319,2 GiB |
| Pesos residentes en memoria | Aproximadamente 204,7 GiB con Engram descargado a SSD, antes de overhead de runtime |
| Tensores Engram en SSD | Aproximadamente 114,4 GiB, incluidos en la descarga |
| Hardware validado | Apple Silicon con 256 GiB de memoria unificada; equipos con menos memoria no estan cualificados por esta receta |
| Runtime de referencia | oMLX 0.7.2 (macOS 15 o superior, Python 3.12); `mlx-serve` como alternativa con historial de validacion mas limitado |
| API | Compatible con OpenAI en `http://127.0.0.1:8000/v1`, model ID `deepseek-v41-abliterated` |
| Presupuesto de salida por defecto | 2048 tokens (independiente del limite de contexto total) |
| Estado de publicacion | Incompleto: el autor indica que los 53 shards seguian subiendose y que falta `PUBLICATION.json` y el tag `v1-oQ2.5e-mtp` |

## Arquitectura y entrenamiento

El checkpoint no aporta informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base: no se detallan numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si documenta el autor es la cadena de derivacion: `deepseek-ai/DeepSeek-V4.1-Flash-1017` como base, `pqhaz/DeepSeek-V4.1-Flash-1017-heretic` como paso intermedio de *abliteration* y este repositorio como conversion final a MLX con cuantizacion mixta de aproximadamente 2,5 bits efectivos. Segun la informacion publica del modelo base, DeepSeek-V4.1-Flash-1017 es una actualizacion de fecha (17 de octubre de 2026) de la linea V4.1-Flash, con mejoras en razonamiento, codigo, tareas agenticas y benchmarks visuales, ademas de una reduccion del tiempo de ejecucion de tareas y de la longitud de salida.

La innovacion tecnica propia de esta conversion es la combinacion de cuantizacion mixta (formatos afines y MXFP conviviendo en el mismo checkpoint) con descarga selectiva de las tablas Engram a SSD, lo que permite mantener el modelo residente en ~204,7 GiB de memoria unificada en lugar de cargar los 319,2 GiB completos. El runtime incorpora prediccion multi-token (MTP) nativa y adaptativa, activada por el script de servicio, y una cache de prefijo reutilizable en disco con un techo de 100 GiB. El autor advierte que no debe aplicarse de nuevo el parche de escritura del modelo intermedio, porque las modificaciones ya estan horneadas en los pesos.

## Capacidades

- Generacion de texto y razonamiento en el mismo perfil que el modelo base DeepSeek-V4.1-Flash-1017, del que se anuncian mejoras en razonamiento, codigo y tareas agenticas.
- Entrada de imagen nativa: la informacion publica del modelo base lo describe como multimodal con soporte de imagenes.
- Modo de razonamiento conmutable mediante `chat_template_kwargs.enable_thinking`; la receta de referencia lo deja desactivado.
- Servicio mediante API compatible con OpenAI (`/v1/models`, `/v1/chat/completions`), lo que facilita integrarlo con clientes y SDK existentes.
- Prediccion multi-token (MTP) adaptativa y cache de prefijo en SSD para acelerar conversaciones de varios turnos.
- Contexto largo: 32K tokens en la configuracion probada y hasta 256K configurable.
- Ausencia deliberada de rechazos: el proceso de *abliteration* elimina la direccion de rechazo aprendida durante el alineamiento del modelo original.
- Soporte de *tool calling* y de flujos de agente: no disponible en la informacion proporcionada (aunque el modelo base se describe como orientado a agentes de contexto largo).
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Capacidades de audio: no disponible.

## Casos de uso

- Desarrollo local en Mac de gama alta: un equipo Apple Silicon con 256 GiB puede servir el modelo con oMLX en `127.0.0.1:8000` y consumirlo desde un cliente compatible con OpenAI, útil para prototipar sin depender de la nube.
- Procesamiento de documentos sensibles que no pueden salir de la maquina: con la inferencia totalmente local y la cache de prefijo en disco, se pueden encadenar conversaciones largas sobre expedientes confidenciales manteniendo los datos en el puesto de trabajo.
- Analisis de imagenes junto a texto: al heredar la entrada de imagen nativa del modelo base, sirve para tareas de descripcion, extraccion de datos de capturas o revision de documentos escaneados en local.
- Investigacion sobre alineamiento y direcciones de rechazo: al ser una variante *abliterated* con pesos publicos, permite estudiar que comportamientos cambian al eliminar la direccion de rechazo y compararlos con el modelo original.
- Evaluacion comparativa de cuantizacion agresiva: la variante oQ2.5e mixta es un banco de pruebas para medir la perdida de calidad frente al modelo en precision completa, especialmente en tareas de codigo y matematicas.
- Pipelines de agentes en local con contexto largo: con 32K tokens probados y hasta 256K configurables, se pueden mantener sesiones multi-paso con historial extenso usando la cache de prefijo para no reprocesar todo el historial en cada turno.
- Laboratorio de generacion de codigo sin filtros: para tareas internas donde el equipo asume la responsabilidad del contenido generado, evitando los bloqueos de las versiones alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas del checkpoint cuantizado, y las referencias publicas al modelo base (DeepSeek-V4.1-Flash-1017) mencionan mejoras en razonamiento, codigo, tareas agenticas y benchmarks visuales sin aportar cifras concretas en las fuentes consultadas. Tampoco hay datos de latencia o throughput para esta variante MLX.

## Requisitos de hardware

- Memoria unificada: 256 GiB en Apple Silicon es la clase de maquina validada por el autor. Con Engram descargado a SSD, los pesos residentes ocupan aproximadamente 204,7 GiB antes de overhead de peticiones y runtime.
- Almacenamiento: aproximadamente 342,7 GB / 319,2 GiB de descarga, mas el presupuesto de cache de prefijo en SSD (la receta fija un techo de 100 GiB). El SSD debe ser rapido, porque los tensores Engram se leen desde disco.
- Limites del perfil de 256 GiB que aplica el script de servicio: 212 GiB de limite de memoria MLX nativa y cableada y 220 GiB de guarda de memoria de aplicacion. Son limites, no reservas anticipadas ni garantia de que cualquier contexto encaje.
- No cabe en GPU de consumo: el checkpoint no esta pensado para RTX 4090 ni tarjetas de 24-48 GB, y al ser formato MLX no se ejecuta sobre CUDA.
- Despliegue: oMLX 0.7.2 (wheel oficial o aplicacion macOS con kernels precompilados) es la ruta principal; `mlx-serve` es alternativa con validacion mas limitada. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, que no cargan pesos MLX.
- Entorno: macOS 15 o superior, Python 3.12, Git y Apple Command Line Tools. La instalacion descarga dependencias del motor desde repositorios Git, por lo que no es un wheel autocontenido ni un entorno totalmente bloqueado.
- Contexto y concurrencia: la receta arranca con `--context 32768 --concurrency 1`. Dos peticiones de 256K completamente llenas no estan garantizadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `apetersson/DeepSeek-V4.1-Flash-1017-Abliterated-MLX` | No disponible | 32K probado, 256K configurable | MLX safetensors, oQ2.5e mixta ~2,5 bits | MIT | Solo Apple Silicon; 256 GiB de memoria unificada; sin rechazos |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` (base) | No disponible | 1M de tokens anunciados | Pesos originales; compatible con vLLM segun el repositorio oficial | MIT | Alineamiento intacto; enfoque multimodal y agentico |
| `pqhaz/DeepSeek-V4.1-Flash-1017-heretic` (intermedio) | No disponible | No disponible | Pesos originales con modificacion heretic | No disponible en la informacion proporcionada | Paso intermedio del que deriva este checkpoint |
| Versiones GGUF del mismo modelo base | No disponible | No disponible | GGUF, cuantizaciones habituales Q4/Q8 | MIT (heredada) | Ejecutables en llama.cpp/Ollama; no disponibles en las fuentes consultadas |

La comparacion cuantitativa de rendimiento entre estas variantes no esta disponible: no hay cifras de benchmarks publicadas para ninguna de ellas en la informacion proporcionada, y los recuentos de parametros no se detallan en el repositorio.

## Limitaciones y advertencias

- Checkpoint incompleto en el momento de la consulta: el propio autor marca el repositorio como «INCOMPLETE CHECKPOINT. DO NOT DOWNLOAD OR START IT YET» e indica que faltan `PUBLICATION.json` y el tag `v1-oQ2.5e-mtp` hasta verificar tamanos y SHA256 de todos los shards remotos.
- Modelo *abliterated*: se ha eliminado la direccion de rechazo, por lo que no cabe esperar negativas ante peticiones daninas. No debe desplegarse en aplicaciones de cara al publico sin filtros externos.
- La licencia del repositorio es MIT, pero el uso comercial de un derivado sin alineamiento traslada al operador toda la responsabilidad legal y reputacional sobre el contenido generado.
- Exclusivo de Apple Silicon y del stack MLX: no hay ruta de despliegue en GPU NVIDIA ni en servidores x86 convencionales, lo que limita el escalado horizontal.
- Requisito de memoria muy alto: 256 GiB de memoria unificada y ~114,4 GiB de SSD rapido. Con menos memoria el autor no cualifica la receta.
- Contexto practico inferior al anunciado por el modelo base: 32K probados frente a 1M publicitado, con 256K configurable pero sin garantia de encaje bajo concurrencia.
- Cuantizacion de ~2,5 bits: es previsible cierta degradacion en tareas de precision (matematicas, codigo, instrucciones largas) respecto al modelo en precision completa; no hay mediciones publicadas que la cuantifiquen.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad para este checkpoint, y la cuantizacion agresiva suele incrementarlo.
- Idiomas soportados: no declarados; no hay garantia de calidad fuera del ingles y el chino del modelo base.
- Dependencias de instalacion no fijadas por completo: el wheel descarga dependencias desde repositorios Git y el autor advierte de no actualizar MLX por encima de los requisitos del motor.
- Sin datos de latencia ni throughput: no es posible estimar coste por token sin medirlo en el equipo objetivo.
- Sin historial de validacion de la ruta `mlx-serve`, que el autor califica de alternativa con historial mas limitado.
- Perfil de memoria ajustado: los limites de 212 GiB cableados y 220 GiB de aplicacion exigen vigilar la presion de memoria del sistema; el script no modifica los sysctl de memoria cableada ni instala un vigilante externo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/apetersson/DeepSeek-V4.1-Flash-1017-Abliterated-MLX
- Variante oQ2.5e-mtp (53 shards): https://huggingface.co/apetersson/DeepSeek-V4.1-Flash-1017-Abliterated-MLX/tree/main/oQ2.5e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Carpeta de inferencia del modelo base (vLLM): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/main/inference
- Modelo intermedio heretic: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- oMLX (repositorio): https://github.com/jundot/omlx
- oMLX 0.7.2 (release y wheel): https://github.com/jundot/omlx/releases/tag/v0.7.2
- Ficha en LM Studio: https://lmstudio.ai/models/deepseek-v4.1-flash-1017
- Ficha en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Analisis en CometAPI: https://www.cometapi.com/deepseek-v4-1-flash-1017/
- Cobertura sobre la licencia MIT: https://tech-insider.org/deepseek-v4-1-flash-1017-mit-license-update-2026/
