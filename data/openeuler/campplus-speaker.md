# openEuler/campplus-speaker

## Resumen
campplus-speaker es un paquete de inferencia para verificacion de locutor (speaker verification) publicado por el proyecto openEuler dentro del ecosistema IB-Robot. No es un modelo de lenguaje: envuelve el modelo CAM++ de 3D-Speaker (`speech_campplus_sv_zh-cn_16k-common`), exportado a ONNX por sherpa-onnx, y anade un `inference_manifest.json` de esquema v3 junto con la descripcion del adaptador de preprocesado. Su funcion es convertir una locucion en un vector de 192 dimensiones normalizado en L2, de modo que la similitud coseno entre dos locuciones se reduce a un producto escalar.

El caso de uso declarado es el agente de voz de IB-Robot: decidir si una locucion captada dentro de una sesion iniciada por wake-word proviene de la persona que abrio esa sesion. El grafo ONNX se distribuye sin modificar; el valor del bundle esta en fijar de forma explicita el contrato de entrada (features, no audio) y el preprocesado, de manera que los vectores sean comparables entre despliegues distintos.

La relevancia actual es practica: ofrece un componente biométrico listo para integrar en robots y sistemas embebidos con licencia Apache-2.0, con un contrato de features reproducible y verificado contra el extractor de sherpa-onnx. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB segun HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAM++ (3D-Speaker), red de embedding de locutor; grafo ONNX sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana fija de 200 frames (2,0 s) por fragmento |
| Tipos de cuantizacion | no disponible; el unico despliegue declarado usa el grafo fp32 en ONNX Runtime CPU |
| Idiomas soportados | no disponible (el modelo upstream se identifica como `zh-cn`; la card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (bundle con `inference_manifest.json` de esquema v3 y `SOURCE.md` con el digest del artefacto) |

Contrato de tensores declarado:

| Tensor | Semantica | Forma | dtype |
|---|---|---|---|
| input | `host.campplus.features` | `(1, 200, 80)` | float32 |
| output | `host.campplus.embedding` | `(1, 192)` | float32 |

## Arquitectura y entrenamiento
El modelo subyacente es CAM++ de 3D-Speaker, una red de extraccion de embeddings de locutor. El bundle no reentrena ni modifica el grafo: el ONNX es el exportado por sherpa-onnx desde el modelo `speech_campplus_sv_zh-cn_16k-common` de ModelScope. No se dispone de informacion sobre el numero de parametros, el volumen de datos de entrenamiento ni la composicion del dataset en la informacion proporcionada.

La innovacion tecnica del paquete esta en el contrato de preprocesado, no en la red. La entrada son features, no audio: filterbank log-mel Kaldi de 80 bins, 16 kHz mono, ventanas de 25 ms cada 10 ms, ventana Povey, pre-enfasis 0.97 y `snip_edges=false`, seguido de resta de la media por locucion (`global-mean`). El host calcula estas features en `src/voice_asr_service/voice_asr_service/speaker_id/features.py`, validado contra el extractor de sherpa-onnx mediante `test_speaker_features.py`. Ademas, la locucion se divide en ventanas fijas de 200 frames (2,0 s): las locuciones mas cortas se replican a partir de sus propios frames en lugar de rellenarse con ceros, y las mas largas se convierten en ventanas consecutivas con la ultima alineada al final, promediando los vectores unitarios por ventana. Al formar parte del contrato declarado, todos los despliegues aplican el mismo tratamiento y los vectores resultan comparables entre si.

## Capacidades
- Extraccion de embedding de locutor: una locucion de entrada produce un vector de 192 dimensiones normalizado en L2.
- Verificacion de locutor por similitud coseno, que con vectores normalizados equivale a un producto escalar.
- Comparacion de locuciones dentro de una sesion de wake-word para decidir si la voz corresponde al usuario que abrio la sesion.
- Procesamiento por ventanas de 2,0 s con agregacion por promedio de vectores unitarios, lo que permite manejar locuciones de duracion variable.
- Inferencia en CPU mediante ONNX Runtime con 2 hilos intra-op.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni modo de razonamiento extendido.

## Casos de uso
- Control de acceso por voz en robots: tras la wake-word, el agente compara el embedding de la nueva locucion con el del usuario que inicio la sesion y acepta o rechaza la interaccion segun la similitud coseno.
- Autenticacion continua en sesiones de voz: al dividir el audio en ventanas de 2,0 s y promediar sus vectores, se puede reevaluar periodicamente que el hablante no ha cambiado durante una conversacion larga.
- Personalizacion de respuestas por usuario: los embeddings permiten asociar preferencias o historial a un locutor concreto sin almacenar audio, ya que el vector es la unica representacion que circula.
- Filtrado de falsos positivos de wake-word: una activacion provocada por television, radio u otra persona se descarta si el embedding no supera el margen de decision frente al locutor de referencia.
- Integracion en robots ROS 2: el bundle se configura en el bloque `voice_asr.speaker_embedding` del robot y se publica en un topic, lo que permite que otros nodos consuman la identidad estimada.
- Despliegue en hardware de borde x86 sin acelerador: el unico backend declarado (`torch_cpu`, ONNX Runtime en CPU) encaja en robots con CPU convencional, sin necesidad de NPU.
- Banco de pruebas de preprocesado: el contrato de features y los tests asociados sirven para validar que una implementacion propia genera vectores comparables con los de referencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

La card unicamente recoge mediciones del intento de despliegue en Ascend, no comparaciones de precision de verificacion: sobre CANN 8.1.RC1 / Ascend310P1 (2026-10-28), el grafo fp32 no compila (`Conv2D` sin implementacion fp32 en AI-core, error `EZ3002`); con `fp16` y `mixed_float16` se produce desbordamiento, de modo que para unas mismas features con `T=200`, 4 de 9 clips devolvieron normas entre 10 y 320 veces la de referencia y el resto coincidio solo entre 0,95 y 0,98, frente a un margen de decision de 0,60. La entrada de longitud variable es un segundo obstaculo: un OM exige forma estatica y cuantizar la longitud en escalones suficientemente gruesos cuesta mas precision (peor caso, 0,27 de coincidencia) de lo que permite el margen.

## Requisitos de hardware
- VRAM: no aplica; el unico despliegue declarado es CPU.
- CPU: ONNX Runtime con 2 hilos intra-op (`torch_cpu`).
- GPU: no se declara ningun backend GPU; no disponible.
- Aceleradores Ascend: descartados por el autor tras las pruebas descritas (fallo de compilacion fp32 y desbordamiento en fp16 y mixed_float16).
- Opciones de despliegue: ONNX Runtime en CPU mediante el manifiesto del bundle; descarga con `./scripts/download_models.py --models campplus-speaker`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se han proporcionado datos de modelos alternativos de verificacion de locutor (por ejemplo, ECAPA-TDNN u otros modelos de 3D-Speaker) en la informacion disponible, por lo que no es posible establecer una comparativa con cifras verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| campplus-speaker (CAM++) | no disponible | ventana de 200 frames | no disponible | Apache-2.0 | HuggingFace, bundle ONNX |
| Alternativas de speaker embedding | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Un voiceprint es dato biometrico: la card indica que IB-Robot mantiene los vectores en memoria del proceso y en el mensaje en que se publican, sin escribir en disco ni conservarlos entre sesiones. Cualquier despliegue debe replicar esa politica y cumplir la normativa aplicable de proteccion de datos.
- El topic ROS es legible por cualquier nodo que se una al dominio, por lo que el despliegue debe aislar el dominio ROS.
- El modelo consume features, no audio: usar un extractor distinto del contrato declarado (80 bins, 16 kHz, 25/10 ms, Povey, pre-enfasis 0.97, `snip_edges=false`, resta de media global y ventanas de 200 frames) rompe la comparabilidad de los vectores.
- No hay despliegue en Ascend: el grafo fp32 no compila y las variantes fp16 y mixed_float16 desbordan, con coincidencias de 0,95-0,98 frente a un margen de decision de 0,60.
- La forma estatica exigida por un OM choca con la entrada de longitud variable; el escalonado de longitudes degrada la precision hasta 0,27 de coincidencia en el peor caso.
- No se declara lista de idiomas soportados; el modelo upstream se identifica como `zh-cn`, lo que debe tenerse en cuenta para despliegues en castellano.
- No se dispone de datos de sesgo, tasa de falsos positivos/negativos ni robustez ante ruido o canal telefonico.
- La licencia Apache-2.0 permite uso comercial, pero el cumplimiento biometrico depende de la legislacion aplicable y no de la licencia del modelo.
- El repositorio registra 0 descargas y 0 likes, y un tamano de 0.0 GB en HuggingFace, lo que sugiere que el artefacto podria no estar alojado en el repo o que el paquete es meramente descriptivo.

## Enlaces
- HuggingFace: https://huggingface.co/openEuler/campplus-speaker
- Repositorio IB-Robot: https://atomgit.com/openeuler/IB_Robot
- Modelo upstream en ModelScope: https://www.modelscope.cn/models/iic/speech_campplus_sv_zh-cn_16k-common
- Exportacion ONNX de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models
