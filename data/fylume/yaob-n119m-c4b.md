# fylume/yaob-n119m-c4b

## Resumen

Yaob Next (C4B-N119M) 1.0.0 es un paquete distribuido como un unico ZIP de 42,34 GiB que empaqueta un nucleo cognitivo, una red de nodos con enrutador y un runtime completo para ejecutarse en local sobre Linux x86-64 o ARM64. El nucleo, denominado C4B, es el modelo Qwen3.5-4B de Alibaba Cloud sin modificaciones, convertido a GGUF y cuantizado exclusivamente a Q8_0; Fylume no lo ha entrenado y puede sustituirse por otro GGUF o por cualquier servidor compatible con OpenAI. La red, N119M, contiene 119.733.309 nodos (119.176.842 validados) en un almacen FG-MPN de solo lectura que se lee en su sitio sin copiarlo.

El paquete no incluye codificador de recuperacion ni ningun componente aprendido propio de Fylume: la recuperacion se resuelve contra el almacen de nodos y las respuestas incorporan un campo `yaob` con los nodos leidos y las citas verificadas. El registro y la construccion del paquete los realiza MPN Studio 0.6.0 mediante `package import`, y `verify.sh` comprueba el almacen contra 327 hashes registrados.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje nuevo con benchmarks publicados, sino de un artefacto de despliegue reproducible y verificable, pensado para inferencia exclusivamente en CPU y sin conexion a Internet tras la descarga. La documentacion del autor es inusualmente detallada en cuanto a hashes, tamanos y pruebas realizadas, pero tambien explicita que x86-64 no se probo para este paquete concreto y que no existe runtime para GPU, Windows ni macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nucleo transformer denso (Qwen3.5-4B) mas red de nodos FG-MPN con enrutador; runtime llama.cpp b12318 |
| Parametros totales | 4 mil millones (nucleo C4B); la red N119M son 119.733.309 nodos, no parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por defecto (configurable a la baja mediante `context_tokens`) |
| Tipos de cuantizacion | Q8_0 exclusivamente para el nucleo; proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | composite-see-licenses (agregada; el nucleo Qwen3.5-4B conserva su licencia propia) |
| Formato de pesos | GGUF (nucleo) y FG-MPN 0.2.2 (almacen de nodos); paquete ZIP64 sin compresion |

## Arquitectura y entrenamiento

El componente generativo es un transformer denso de 4 mil millones de parametros, Qwen3.5-4B de Alibaba Cloud, del que no consta entrenamiento adicional por parte de Fylume: el autor indica explicitamente que no lo ha entrenado y que es reemplazable. Sobre el se dispone un proyector de vision en F16, lo que habilita entrada multimodal, y el conjunto se ejecuta mediante llama.cpp b12318 compilado para CPU en linux-x86_64 y linux-aarch64, con backend de MPN Studio 0.6.0 y wheels de FG-MPN 0.2.2.

La innovacion tecnica del paquete no esta en el entrenamiento sino en el mecanismo de recuperacion y trazabilidad: un almacen FG-MPN de solo lectura de 39.855.423.467 bytes repartidos en 329 ficheros, leido en su sitio, con 327 hashes registrados que `verify.sh` valida, y un enrutador que selecciona nodos. Cada respuesta incluye un campo `yaob` con los nodos consultados y las citas comprobadas; en las pruebas del autor, una pregunta sobre un pueblo inventado fue rechazada sin cita. No se documentan volumen de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO, porque el paquete no entrena el modelo base. El ZIP es ZIP64 y los ficheros de modelo y red se almacenan sin comprimir, de modo que la extraccion es una copia directa.

## Capacidades

- Generacion de texto y respuesta a preguntas con recuperacion sobre un almacen de 119,7 millones de nodos y citas verificadas en la respuesta.
- Entrada de vision mediante el proyector F16 incluido en el paquete.
- Servidor compatible con OpenAI en `127.0.0.1:8861`, con endpoint `/v1/chat/completions` y campo adicional `yaob` en las respuestas.
- Rechazo explicito de preguntas sin cobertura en el almacen, sin fabricar citas (comportamiento verificado por el autor con una localidad inventada).
- Sustitucion del nucleo por otro GGUF o por cualquier servidor compatible con OpenAI mediante `config/yaob.json`, sin tocar el directorio `mpn/`.
- Operacion completamente offline tras la descarga, sin Python ni privilegios de root.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente documental con citas verificables en entornos sin red: el paquete arranca un endpoint compatible con OpenAI sobre un almacen de nodos de solo lectura, y cada respuesta incluye los nodos leidos, lo que permite auditar la procedencia de cada afirmacion en dominios regulados.
- Sustitucion de un modelo base por otro mas capaz sin rehacer la infraestructura: al ser el nucleo un GGUF intercambiable mediante `config/yaob.json`, un equipo puede empezar con Qwen3.5-4B Q8_0 y migrar a otro modelo o a un `llama-server` externo conservando intacta la red de nodos.
- Verificacion de integridad en pipelines de distribucion de artefactos: `verify.sh` comprueba 863 ficheros y 327 hashes en 27 segundos, y una modificacion de un solo byte en un segmento del almacen hace fallar la verificacion, lo que encaja en controles de cadena de suministro.
- Procesamiento de documentos con componente visual en estaciones de trabajo ARM64: el proyector F16 permite entrada de imagen sobre un equipo con 20 nucleos y 16,5 GB de memoria residente medida, sin GPU.
- Escenarios de investigacion sobre recuperacion estructurada: el par nucleo mas red permite experimentar con enrutado sobre 119,7 millones de nodos manteniendo fijo el modelo generativo, aislando el efecto de la recuperacion.
- Despliegue en hardware de borde o laboratorio sin acceso a Internet: la ejecucion requiere solo Linux con glibc 2.38 o superior, sin root, sin Python y sin red tras la descarga, lo que simplifica la instalacion en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta mediciones de despliegue: memoria residente de 16,5 GB con contexto de 32.768 tokens y dos peticiones concurrentes en ARM64 CPU tras tres preguntas; extraccion del ZIP en 171 segundos; `verify.sh` en 27 segundos sobre 863 ficheros; `setup.sh` en 9 segundos; `run.sh` listo en 6 segundos.

## Requisitos de hardware

- Memoria: 16,5 GB residentes medidos con los valores por defecto (contexto 32.768, dos peticiones concurrentes) en ARM64 CPU; el `manifest.json` declara `ram_bytes_min` de 10 GiB, estimacion previa a la medicion, por lo que se recomienda planificar 16 GiB o reducir `context_tokens`.
- Disco: 42,36 GiB extraidos (864 ficheros); 84,70 GiB si se conserva el ZIP junto a la carpeta extraida; 42,36 GiB si se elimina el ZIP o se transmite directamente al extractor.
- GPU: no soportada; el paquete incluye unicamente runtime de CPU y la inferencia es exclusivamente en CPU.
- CPU: probado en NVIDIA DGX Spark ARM64 con 20 nucleos; x86-64 no se probo para este paquete (el mismo runtime y scripts si pasaron en x86-64 para el paquete N10K).
- Sistema operativo: Linux con glibc 2.38 o superior (Ubuntu 24.04, Debian 13, Fedora 39 o posteriores); sin runtime para Windows ni macOS; glibc x86-64 entre 2.38 y 2.41 presenta una limitacion en un modulo Python opcional del backend.
- Despliegue: scripts `verify.sh`, `setup.sh`, `run.sh` y `stop.sh` incluidos; servidor compatible con OpenAI en `127.0.0.1:8861`; no se documenta soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el autor no publica tiempos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Yaob Next (C4B-N119M) 1.0.0 | 4 mil millones (nucleo) | 32.768 | GGUF Q8_0 + FG-MPN | composite-see-licenses | Paquete offline con recuperacion citada sobre 119,7 M de nodos |
| Qwen3.5-4B (base incluida) | 4 mil millones | no disponible | safetensors / GGUF | licencia de Alibaba Cloud | Modelo generativo denso; sin red de nodos ni citas |
| Qwen3-4B-Instruct-2507 | 4 mil millones | no disponible | GGUF | licencia de Alibaba Cloud | Nucleo alternativo probado por el autor como sustituto en el mismo paquete |
| Paquete N10K de Fylume | no disponible | no disponible | GGUF + FG-MPN | no disponible | Variante anterior con red de menor tamano; runtime y scripts probados en x86-64 |

## Limitaciones y advertencias

- El nucleo no ha sido entrenado por Fylume; su calidad generativa es la de Qwen3.5-4B, y el paquete no aporta mejoras de modelado sobre el.
- La licencia es compuesta (`composite-see-licenses`) y remite a las licencias de cada componente; el uso comercial exige revisar por separado la licencia del nucleo Qwen3.5-4B y la del almacen de nodos.
- Inferencia exclusivamente en CPU: no hay soporte de GPU, lo que limita el throughput en produccion.
- x86-64 no fue probado para este paquete; el propio autor senala que el ZIP de 45 GB no pudo extraerse en las maquinas x86-64 disponibles.
- La descarga desde Hugging Face de este ZIP y su extraccion no se probaron, porque el repositorio no era publico cuando se escribio la documentacion.
- El script de pruebas extra termino con estado 1 en su ultima asercion (`scripts/verify.sh --quick` imprimio `MISSING` con nombre de fichero vacio); la causa no se investigo.
- Solo se probo Ubuntu 24.04 en ARM64 y un host x86-64 no identificado; no hay soporte para Windows, macOS ni glibc anterior a 2.38.
- El almacen de nodos es de solo lectura y su cobertura determina que preguntas puede responder; fuera de ella el modelo declina responder, lo que puede ser insuficiente para dominios abiertos.
- Riesgo de alucinacion del nucleo generativo: el mecanismo de citas mitiga pero no elimina la posibilidad de afirmaciones no respaldadas por los nodos leidos.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas cubiertos por Qwen3.5-4B.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fylume/yaob-n119m-c4b
- Paquete completo: https://huggingface.co/fylume/yaob-next-c4b-n119m
- Nucleo Qwen3.5-4B Q8_0 GGUF: https://huggingface.co/fylume/qwen3.5-4b-q8_0-gguf
- Almacen de nodos: https://huggingface.co/fylume/yaob-origin-n119m
- SHA-256 del ZIP: `e4170f3a02a1d3d557081586979fb2a14f9ec12b163c8ee8a32334907cab9997`
