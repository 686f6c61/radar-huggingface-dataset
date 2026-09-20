# Asher-1/yolo-gguf

## Resumen

Asher-1/yolo-gguf no es un modelo unico, sino un repositorio de distribucion que almacena en formato GGUF las conversiones de los modelos de vision por computador de la familia YOLO (Ultralytics) junto con las torres de texto de CLIP y MobileCLIP. El autor, Asher-1, publica aqui los artefactos de ejecucion (runtime) que consume su integracion en C++ sobre ggml, publicada en el repositorio ultralytics-ggml. El repo contiene 217 archivos GGUF: 135 checkpoints de clase cerrada, 13 variantes YOLO-World, 30 de YOLOE-26 (incluidas las variantes `-pf`), 30 variantes obb/sem a resolucion 1024 y las torres de texto CLIP/MobileCLIP con referencias de paridad `.ref.npz`. El tamano total del repositorio es de 17,0 GB y acumula 4090 descargas.

El problema que resuelve es de despliegue: los pesos canonicos de YOLO se publican como checkpoints PyTorch (`.pt`), lo que obliga a arrastrar el stack de Python y PyTorch en produccion. Esta coleccion los convierte a GGUF cuantizado para que un runtime C++ nativo pueda cargarlos sin dependencias de Python, algo relevante para edge computing, sistemas embebidos, aplicaciones de escritorio y pipelines de vision de baja latencia. Cubre tareas de deteccion, segmentacion de instancias, segmentacion semantica, estimacion de pose, profundidad (depth), cajas orientadas (obb) y clasificacion, ademas de deteccion y segmentacion de vocabulario abierto.

HuggingFace reporta 151.277.312 parametros totales a partir de un safetensors, pero ese dato corresponde a un unico componente del repositorio y no representa al conjunto de los 217 modelos; no es posible atribuirlo con certeza a una variante concreta con la informacion disponible. La model card no declara licencia, pipeline ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales/transformer de deteccion y segmentacion de la familia YOLO (Ultralytics) mas torres de texto CLIP y MobileCLIP; no es un transformer generativo de lenguaje |
| Parametros totales | 151.277.312 segun el dato de safetensors reportado por HuggingFace, atribuible a un unico componente del repositorio; no disponible por variante |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelos de vision; no hay ventana de contexto textual) |
| Tipos de cuantizacion | f32, f16 y q8_0 para cada variante publicada |
| Idiomas soportados | no disponible (la model card no declara idiomas; las torres de texto CLIP/MobileCLIP procesan indicaciones textuales para vocabulario abierto) |
| Licencia | no disponible (la model card no declara licencia; los checkpoints de origen proceden del ecosistema Ultralytics y su licenciamiento debe verificarse por separado) |
| Formato de pesos | GGUF (artefactos de runtime) y checkpoints PyTorch `.pt` como entradas de conversion |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: actua como almacen de pesos. Las entradas canonicas son checkpoints PyTorch de YOLOv8 (`n`, `s`, `m`, `l`, `x` y sus variantes `-seg` y `-world`), YOLOE (`yoloe-v8`, `yoloe-11` y `yoloe-26` en tamanos `n` a `x`, todas `-seg`), y la familia YOLO26 en los cinco tamanos con cabezas de deteccion, segmentacion (`-seg`), profundidad (`-depth`), pose (`-pose`), cajas orientadas (`-obb`), segmentacion semantica (`-sem`) y clasificacion (`-cls`). A esto se suman las torres de texto `clip-ViT-B-32` y `mobileclip2_b`, usadas para las capacidades de vocabulario abierto de YOLO-World y YOLOE.

La innovacion tecnica esta en la ruta de conversion y en el runtime, no en el entrenamiento. Cada checkpoint se exporta a GGUF en tres precisiones (f32, f16 y q8_0); el convertidor resuelve los alias contra `models/pytorch/` y escribe en `models/gguf/` de forma predeterminada. Las variantes obb y sem incluyen resoluciones de entrada alternativas a 1024, pensadas para objetos pequenos en imagen aerea y para segmentacion densa. El repositorio incluye referencias de paridad `.ref.npz` y un listado `SHA256SUMS` para verificar los 60 artefactos obb/sem de resolucion, lo que permite comprobar que la conversion GGUF reproduce numericamente la salida del checkpoint original. La model card no detalla el dataset de entrenamiento, el numero de tokens ni el uso de RLHF/DPO, porque no se entrena ningun modelo aqui.

## Capacidades

- Deteccion de objetos de clase cerrada en cinco tamanos (n, s, m, l, x) con entrada por defecto de 640 pixeles, desde YOLOv8n para minima latencia hasta YOLOv8x y YOLO26x para maxima capacidad.
- Deteccion de vocabulario abierto con YOLOv8s-world a YOLOv8x-world, seleccionando clases en tiempo de ejecucion mediante `--classes` o embeddings de texto (`--text-embed`).
- Segmentacion de instancias de vocabulario abierto con YOLOE-v8/11 (s, m, l) y YOLOE-26 (n a x), con indicaciones de clase en texto plano a traves de la torre MobileCLIP nativa en GGUF o de un blob YTXT0002.
- Segmentacion de instancias de clase cerrada con YOLOv8n-seg a YOLOv8x-seg.
- Segmentacion semantica (`-sem`) y clasificacion (`-cls`) en la familia YOLO26, con variantes a 1024 pixeles para las tareas que lo requieren.
- Estimacion de pose (`-pose`) y de profundidad (`-depth`), orientadas a analisis de movimiento y percepcion 3D.
- Deteccion con cajas orientadas (`-obb`) para objetos rotados, con variantes a 1024 pixeles.
- Codificacion de texto mediante CLIP ViT-B/32 y MobileCLIP2-B para busquedas y clasificacion guiada por lenguaje.
- Integracion nativa en C++ sobre ggml, sin dependencia de Python en tiempo de ejecucion.
- No soporta tool calling, function calling, agentes ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Inspeccion industrial en linea de produccion: un modelo YOLO26s o YOLOv8s en q8_0 se integra en el runtime C++ sobre la propia linea y detecta defectos a 640 pixeles sin depender de Python, lo que reduce el consumo de memoria y el arranque del proceso.
- Videovigilancia en dispositivos de borde: YOLOv8n o YOLO26n en f16 caben en hardware modesto y permiten procesar varios flujos de camara con deteccion continua, usando el binario GGUF y evitando el coste de un servidor de inferencia Python.
- Conteo y clasificacion en retail: las cabezas `-cls` y de deteccion permiten inventariar lineales y contar productos; las variantes de vocabulario abierto (YOLO-World, YOLOE) admiten definir nuevas categorias por texto sin reentrenar.
- Analisis de imagenes aereas y satelitales: las variantes `-obb-1024` de YOLO26 detectan vehiculos, embarcaciones o edificios con orientacion arbitraria y objetos pequenos, que a 640 pixeles se perderian.
- Segmentacion densa para conduccion autonoma o agricultura de precision: las variantes `-sem-1024` producen mascaras por pixel de carretera, cultivo o terreno para planificacion de rutas y dosificacion de insumos.
- Robotica y navegacion: las variantes `-depth` proporcionan mapas de profundidad monocular que alimentan evitacion de obstaculos y reconstruccion de escena en plataformas con recursos limitados.
- Analisis biomecanico y deportivo: las variantes `-pose` extraen esqueletos de multiples personas para medir angulos articulares y detectar posturas de riesgo sin enviar video a la nube.
- Busqueda visual por lenguaje natural: combinando una torre CLIP/MobileCLIP GGUF con YOLOE se pueden recuperar o etiquetar objetos descritos en texto, util en catalogos de producto y archivos multimedia.
- Aplicacion de escritorio o visor 3D: el runtime C++ se integra con el ecosistema cloudViewer para anotar nubes de puntos y reconstrucciones con detecciones y segmentaciones procedentes de estos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card documenta unicamente la verificacion de integridad y paridad de la conversion (referencias `.ref.npz` y el listado `SHA256SUMS` para las 60 variantes obb/sem de resolucion), no cifras de precision sobre COCO, DOTA ni ningun otro conjunto de evaluacion. Tampoco se publican medidas de latencia o throughput por variante.

## Requisitos de hardware

- VRAM estimada para el componente de 151,3 millones de parametros reportado: en torno a 0,6 GB en f32, 0,3 GB en f16 y 0,15 GB en q8_0, mas el espacio de activaciones y tensores intermedios. Es una estimacion derivada del recuento de parametros, no un dato publicado.
- VRAM por variante: no disponible. La model card no publica el recuento de parametros ni el peso en disco de cada uno de los 217 GGUF.
- GPU recomendadas: no disponibles en la informacion proporcionada. Los tamanos `n` y `s` de YOLO estan disenados para inferencia en tiempo real en GPU de gama media y en aceleradores integrados; los tamanos `l` y `x`, y especialmente las variantes a 1024 pixeles, requieren mas memoria y computo.
- Cabe en GPU de consumo: previsiblemente si para las variantes pequenas en f16 o q8_0, dado el orden de magnitud de la familia YOLO; sin cifras publicadas por variante no puede confirmarse el encaje exacto.
- Opciones de despliegue: runtime C++ propio sobre ggml del repositorio `ultralytics-ggml`; descarga y verificacion mediante `huggingface-cli download Asher-1/yolo-gguf --local-dir models/gguf` o el espejo de releases de GitHub `cloudViewer_downloads/yolo_gguf_models`. No se documentan integraciones con vLLM, Ollama, TGI ni llama.cpp para texto, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican cifras de milisegundos por imagen ni de imagenes por segundo para ninguna variante.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Asher-1/yolo-gguf (este repo) | 151,3 M en un componente no identificado; sin desglose por variante | no aplica | sin benchmarks publicados; solo verificacion de paridad de conversion | no declarada en la model card | GGUF f32/f16/q8_0 en HuggingFace y espejo en releases de GitHub |
| Checkpoints PyTorch originales de Ultralytics (`.pt`) | segun variante | no aplica | los publicados por Ultralytics, no reproducidos aqui | la de Ultralytics, a verificar | pesos canonicos distribuidos por Ultralytics |
| Exportaciones ONNX de la misma familia | segun variante | no aplica | no disponible en esta comparativa | la del runtime y la del checkpoint de origen | no disponible en la informacion proporcionada |
| Motores propietarios de inferencia para GPU (por ejemplo TensorRT) | segun variante | no aplica | no disponible en esta comparativa | propietaria | no disponible en la informacion proporcionada |

La diferencia funcional de este repositorio no es la precision del modelo, sino el formato: entrega pesos listos para un runtime C++ sobre ggml, con tres niveles de cuantizacion y verificacion de paridad, evitando el stack de Python. No se dispone de datos de rendimiento que permitan afirmar que la conversion conserva la precision del checkpoint original mas alla de las referencias de paridad incluidas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier ficha que lo presente como tal seria incorrecta.
- La model card es en realidad documentacion de un directorio de artefactos (rutas, scripts de conversion, estructura de carpetas), no una ficha tecnica de modelo. Falta informacion sobre licencia, idiomas, pipeline y evaluacion.
- El dato de 151.277.312 parametros procede de un unico safetensors y no describe al conjunto de 217 archivos; utilizarlo como tamano del repositorio inducira a error.
- La licencia no esta declarada. Los checkpoints de origen pertenecen al ecosistema Ultralytics, cuyo licenciamiento tiene implicaciones para uso comercial que deben verificarse antes de desplegar en produccion.
- Toda la coleccion ocupa 17,0 GB, por lo que la descarga completa no es apropiada si solo se necesita una variante; conviene descargar archivos concretos.
- Las conversiones GGUF pueden diferir numericamente del checkpoint original. El repositorio incluye referencias de paridad y sumas de comprobacion, pero la verificacion es responsabilidad del usuario.
- La cuantizacion q8_0 reduce peso y memoria a costa de precision; en tareas sensibles (pose, profundidad, objetos pequenos a 1024) conviene validar f16 o f32 contra el modelo PyTorch.
- Las capacidades de vocabulario abierto dependen de la torre de texto incluida (CLIP ViT-B/32 o MobileCLIP2-B) y de sus embeddings; no equivalen a comprension abierta arbitraria del lenguaje.
- Las variantes obb y sem a 1024 pixeles implican mayor coste de computo y memoria que sus equivalentes a 640.
- No se han publicado sesgos, composicion de dataset ni evaluaciones de robustez para ninguna de las variantes; los sesgos heredados de los datos de entrenamiento originales no estan documentados en este repositorio.
- La integracion exige compilar y usar el runtime C++ del autor; no hay soporte documentado para otros motores de inferencia.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (se refieren a una plataforma escolar), por lo que no se ha podido contrastar ningun dato adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Asher-1/yolo-gguf
- Repositorio de la integracion C++ sobre ggml: https://github.com/Asher-1/ultralytics-ggml
- Espejo de los GGUF en releases de GitHub: https://github.com/Asher-1/cloudViewer_downloads/releases/tag/yolo_gguf_models
- Descarga mediante CLI:
  `huggingface-cli download Asher-1/yolo-gguf --local-dir models/gguf`
- Descarga del espejo:
  `gh release download yolo_gguf_models --repo Asher-1/cloudViewer_downloads --pattern '*.gguf' --dir models/gguf --clobber`
- Verificacion de sumas de comprobacion:
  `cd models/gguf && sha256sum -c SHA256SUMS`
