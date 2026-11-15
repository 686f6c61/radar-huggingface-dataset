# Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-TokenWing

## Resumen

Qwen3.8-Flash-Next-WV-v5-3.5bpw-TokenWing es una cuantizacion GGUF pretranscodificada del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch. El checkpoint conserva los 176.943.899.520 parametros (aproximadamente 177B) del modelo original, que segun la model card se describe como un modelo de 180B con 48 capas hibridas GDN mas sparse-QSA y 512 expertos enrutados con top-10. La cuantizacion se realiza en formato TokenWing mediante el plugin wv-plugin-v1.1, a una precision nominal de 3.5 bits por peso (WV-v5).

El interes de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: un GGUF de dos shards pensado para ejecutarse con un runtime especifico (runmyai/tokenwing en la rama feat/quant-plugin) y un plugin binario propietario distribuido aparte. Esto condiciona por completo su evaluacion practica: no es un GGUF estandar compatible con llama.cpp de serie, sino que exige una extension de cuantizacion concreta.

La licencia declarada es Apache 2.0, heredada del modelo base, y el repositorio ocupa 84.0 GB en total (51.41 GiB el tronco de 48 capas con expertos MoE y 26.82 GiB la tabla PLE de la capa 1). No se dispone de informacion sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas GDN (Gated DeltaNet) y sparse-QSA; MoE con 512 expertos enrutados, top-10 |
| Parametros totales | 176.943.899.520 (~177B; la model card indica 180B) |
| Parametros activos | no disponible (top-10 de 512 expertos, sin cifra de parametros activos publicada) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | GGUF TokenWing WV-v5 a 3.5 bpw (unica variante en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en 2 shards (TokenWing, plugin wv-plugin-v1.1) |

## Arquitectura y entrenamiento

La model card describe el modelo base como una arquitectura hibrida de 48 capas que combina capas GDN (Gated DeltaNet, atencion lineal con estado recurrente) con capas de atencion dispersa QSA, sobre un backbone Mixture-of-Experts con 512 expertos enrutados y activacion top-10 por token. Esta combinacion busca reducir el coste de atencion en contextos largos manteniendo la capacidad de los modelos densos grandes mediante el enrutamiento disperso de expertos.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO u otras optimizaciones de alineamiento. Tampoco se documenta en la informacion proporcionada ninguna innovacion de decodificacion (decodificacion especulativa, etc.). La unica innovacion tecnica documentada es la propia cuantizacion TokenWing WV-v5, que transcodifica los pesos a 3.5 bpw y separa la tabla PLE (layer-1 PLE table) en un segundo shard de 26.82 GiB, ademas de ofrecer streaming de expertos MoE desde RAM/CPU mediante flags del runtime (`--moe-stream`, `--moe-stream-ram-mib`, `--moe-stream-cpu-x4`, `--moe-stream-idle-load`).

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation` y tag `conversational`).
- Razonamiento y respuesta a instrucciones: capacidad esperable por el tamano del modelo base, aunque no verificada con benchmarks en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Despliegue con streaming de expertos MoE: el runtime permite cargar expertos bajo demanda desde RAM o CPU, lo que habilita ejecucion en equipos con VRAM limitada a costa de latencia.

## Casos de uso

- Inferencia local de un modelo de ~177B en estaciones de trabajo con VRAM moderada: gracias al streaming de expertos MoE (`--moe-stream auto --moe-stream-ram-mib 6144`), se pueden mantener en GPU solo las capas densas y descargar los expertos a RAM, lo que hace viable ejecutar el modelo en un unico equipo con 24-48 GB de VRAM y RAM abundante.
- Servicio de generacion de texto autoalojado: al ser un GGUF con licencia Apache 2.0, se puede desplegar en infraestructura propia sin coste de licencia, usando el runtime TokenWing como servidor de inferencia para aplicaciones de chat o resumen.
- Procesamiento por lotes de documentos largos: la combinacion de capas GDN lineales con atencion dispersa QSA esta disenada para reducir el coste en contextos largos, lo que resulta adecuado para tareas de resumen y extraccion sobre documentos extensos (el contexto maximo real no esta documentado; el ejemplo usa 8192 tokens).
- Experimentacion e investigacion en cuantizacion: este checkpoint sirve como referencia practica para evaluar la calidad de la cuantizacion WV-v5 a 3.5 bpw frente al modelo base en tareas de generacion, midiendo la degradacion introducida por la precision reducida.
- Evaluacion de runtimes alternativos: permite comparar el rendimiento del runtime TokenWing con plugin frente a otras soluciones de inferencia sobre el mismo modelo base, en terminos de throughput y uso de memoria.
- Prototipado de asistentes conversacionales en entornos sin acceso a APIs en la nube: al ejecutarse completamente en local, es util para escenarios con requisitos de privacidad o sin conectividad.
- Despliegue en Windows o Linux de escritorio: el plugin se distribuye como `libqfn_wv_plugin.so` (Linux) y `qfn_wv_plugin.dll` (Windows), lo que permite montar un entorno de pruebas en equipos de desarrollo convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 84.0 GB en total (51.41 GiB el tronco y 26.82 GiB la tabla PLE). Sin streaming, se necesitaria VRAM o memoria unificada del orden de 80-90 GB para cargar ambos shards. Con streaming de expertos MoE activado, la VRAM requerida baja sustancialmente, ya que los expertos se descargan a RAM (`--moe-stream-ram-mib 6144` reserva 6 GiB de RAM para el buffer de streaming).
- GPU recomendadas: no disponible en la informacion proporcionada. Por el volumen de pesos, un despliegue completo sin streaming encaja en A100 80 GB, H100 80 GB o configuraciones multi-GPU; con streaming, GPUs de 24 GB (RTX 4090, RTX 3090) o 48 GB (RTX 6000 Ada, L40S) podrian ser suficientes, aunque no hay datos confirmados.
- Cabe en consumer GPU: con streaming de expertos y RAM suficiente (el ejemplo reserva 6 GiB de buffer y usa `-t 8` hilos), es plausible en una RTX 4090 de 24 GB; sin streaming, no cabe en ninguna consumer GPU actual.
- Opciones de despliegue: el runtime requerido es `runmyai/tokenwing` en la rama `feat/quant-plugin` con el plugin `wv-plugin-v1.1`. El ejemplo de la model card usa `llama-cli` con `--quant-plugin libqfn_wv_plugin.so`, `-ngl 99`, `--moe-stream auto`, `-t 8` y `-c 8192`. No se documenta compatibilidad con vLLM, Ollama, TGI ni llama.cpp estandar.
- Latencia y throughput estimados: no disponible. El uso de streaming de expertos desde RAM/CPU implica latencia adicional por cada acceso a expertos no residentes en GPU, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-3.5bpw-TokenWing (este) | ~177B (180B segun model card) | no disponible | 3.5 bpw TokenWing | Apache 2.0 | GGUF TokenWing, requiere plugin wv-plugin-v1.1 |
| Qwen/Qwen3.8-Flash-Next (base) | ~177B (180B segun model card) | no disponible | pesos originales | Apache 2.0 | safetensors (presumiblemente) |
| Otras cuantizaciones GGUF del mismo base | ~177B | no disponible | no disponible en la informacion | Apache 2.0 | GGUF estandar (no confirmado) |

La comparativa con alternativas de otros desarrolladores no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es la precision (3.5 bpw frente a los pesos originales) y el requisito de un runtime y plugin especificos, a cambio de una huella de 84.0 GB y la posibilidad de streaming de expertos.

## Limitaciones y advertencias

- Dependencia de runtime propietario: el GGUF no es cargable con llama.cpp estandar; requiere `runmyai/tokenwing` (rama `feat/quant-plugin`) y el plugin binario `wv-plugin-v1.1` descargado desde un repositorio externo (`grawnchtoader/tokenwing-assets`). Esto introduce un punto unico de fallo y una superficie de confianza adicional (binarios de terceros).
- Cuantizacion agresiva a 3.5 bpw: la precision reducida puede degradar la calidad en tareas sensibles (matematicas, codigo, razonamiento largo) respecto al modelo base; no se publican evaluaciones que cuantifiquen esa perdida.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de reportes de calidad independientes.
- Idiomas no declarados: no se puede confirmar el soporte multilingue ni el comportamiento en castellano.
- Contexto maximo no documentado: el ejemplo de ejecucion usa `-c 8192`; no se confirma la ventana nativa del modelo base ni si la cuantizacion la preserva.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es esperable en modelos de esta escala sin datos de alineamiento publicados.
- Sesgos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del plugin y del runtime TokenWing, que se distribuyen por separado y cuya licencia no se detalla en la informacion proporcionada.
- Rendimiento en produccion incierto: sin cifras de latencia ni throughput, y con streaming de expertos desde RAM/CPU, el rendimiento puede degradarse de forma significativa bajo carga concurrente.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-TokenWing
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime TokenWing: `runmyai/tokenwing` (rama `feat/quant-plugin`; sin URL completa en la informacion proporcionada)
- Assets del plugin: https://github.com/grawnchtoader/tokenwing-assets/releases/tag/wv-plugin-v1.1
