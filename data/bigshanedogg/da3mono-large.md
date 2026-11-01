# bigshanedogg/DA3MONO-LARGE

## Resumen

DA3MONO-LARGE es la variante monocular del modelo Depth Anything 3 (DA3), desarrollado por ByteDance Seed. Estima profundidad relativa a partir de una o varias imágenes y forma parte de un sistema mas amplio orientado a la reconstruccion de geometria multi-vista y a la generacion de representaciones 3D a partir de imagenes. El modelo original se publica con el paper *Depth Anything 3: Recovering the Visual Space from Any Views* (arXiv 2511.10647) y su codigo esta disponible en el repositorio ByteDance-Seed/depth-anything-3.

La ficha corresponde a `bigshanedogg/DA3MONO-LARGE`, un port no oficial al formato `transformers` del checkpoint oficial `depth-anything/DA3MONO-LARGE`. El port reempaqueta los tensores originales sin modificarlos (verificados tensor a tensor) y adapta el codigo de red y el procesador de imagen para que funcionen con `AutoModelForDepthEstimation` y `AutoProcessor` mediante `trust_remote_code`, sin necesidad de instalar el paquete `depth_anything_3`.

El modelo tiene 334.171.394 parametros, un repositorio de 1,3 GB y licencia Apache-2.0. Su relevancia practica es que permite usar DA3 dentro del ecosistema `transformers` estandar, lo que simplifica su integracion en pipelines existentes de vision por computador. Es un modelo de investigacion con muy poca adopcion publica (12 descargas y 0 likes en el momento de la consulta) y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de estimacion de profundidad Depth Anything 3 (variante monocular), portada a `transformers` con codigo propio (`depth_anything_3`, `custom_code`) |
| Parametros totales | 334.171.394 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision; procesa imagenes, no texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la model card no documenta cuantizaciones oficiales) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y `processor_config.json` |

## Arquitectura y entrenamiento

El modelo es la red monocular de Depth Anything 3, construida a partir del grafo de objetos del checkpoint original (`config.json` → `da3_config`, equivalente a `configs/da3mono-large.yaml` del paquete oficial). El port incluye el codigo oficial de ByteDance (commit 3d835ec1) vendorizado en ficheros planos `da3_*.py`, con cambios limitados a imports y al renombrado de un logger. La salida se expone como `DepthAnything3Output`, donde la profundidad de la red pasa a llamarse `predicted_depth` y el resto de claves conservan su nombre original (`depth_conf`, entre otras).

El `forward` ejecuta la red original y devuelve sus salidas; el procesador `DepthAnything3Processor` envuelve el `InputProcessor` del paquete oficial. La verificacion del autor indica que, con el mismo proceso y semillas en una V100 y con 4 imagenes, el preprocesado y todas las salidas del `forward` son bit-identicas a las del paquete oficial, tanto en fp32 como bajo autocast. Algunas salidas usan muestreo aleatorio como en el original (el manejo del cielo muestrea profundidades), por lo que se recomienda fijar la semilla de torch para ejecuciones reproducibles. No se dispone de informacion sobre el volumen de datos de entrenamiento, su composicion ni sobre el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Estimacion de profundidad relativa monocular a partir de una o varias imagenes de entrada.
- Procesamiento multi-imagen: el procesador genera `pixel_values` con forma `(1, N, 3, H, W)`, lo que permite pasar varias vistas en una misma llamada.
- Salida de mapa de profundidad a la resolucion procesada (`predicted_depth` con forma `(1, N, H, W)`).
- Salida de confianza de profundidad (`depth_conf`).
- Mascara de cielo integrada en el procesamiento (el manejo del cielo muestrea profundidades).
- Extraccion de caracteristicas del backbone mediante `export_feat_layers=[i, ...]`, devueltas en `outputs.aux`.
- Integracion con el ecosistema `transformers` mediante `AutoModelForDepthEstimation` y `AutoProcessor` con `trust_remote_code`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Reconstruccion 3D a partir de imagenes: usar la profundidad relativa y la confianza por pixel como entrada para pipelines de fotogrametria o de generacion de mallas y nubes de puntos, aprovechando la salida multi-vista del modelo.
- Realidad aumentada y virtual: estimar la geometria de la escena para colocar objetos virtuales con oclusion correcta, usando la mascara de cielo para separar fondo y primer plano.
- Robotica y navegacion: generar mapas de profundidad densos a partir de una camara monocular para planificacion de trayectorias y evitacion de obstaculos en robots con hardware limitado.
- Edicion de imagen y video: crear mapas de profundidad para desenfoque selectivo, relighting o segmentacion por profundidad, con la ventaja de que el modelo funciona con una sola imagen.
- Preprocesado para modelos generativos 3D: proporcionar profundidad y confianza como condicionamiento en pipelines de image-to-3D, dado que el pipeline declarado es `image-to-3d`.
- Investigacion en vision por computador: servir como baseline reproducible dentro de `transformers` para comparar metodos de estimacion de profundidad sin instalar el paquete original.
- Extraccion de caracteristicas: usar las capas del backbone (`export_feat_layers`) como features visuales en tareas posteriores de segmentacion o deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es la equivalencia bit-identica del port con el paquete oficial en una V100 con 4 imagenes, en fp32 y bajo autocast, lo que confirma fidelidad numerica pero no aporta metricas de calidad (por ejemplo, AbsRel o RMSE) frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 334 millones de parametros, los pesos ocupan aproximadamente 1,3 GB en fp32 y alrededor de 0,7 GB en fp16 o bf16; el consumo real depende de la resolucion de las imagenes y del numero de vistas procesadas.
- GPU recomendadas: la model card cita una V100 para la verificacion; por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090, aunque no se documentan requisitos minimos.
- Cabe en GPU de consumo: si, por el tamano de los pesos; el limite practico sera la memoria necesaria para imagenes de alta resolucion y lotes multi-vista.
- Opciones de despliegue: `transformers` con `AutoModelForDepthEstimation` y `AutoProcessor` (requiere `trust_remote_code`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Dependencias de ejecucion adicionales: `addict`, `omegaconf`, `einops` y `opencv-python`, ademas de torch y transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| DA3MONO-LARGE (este port) | 334.171.394 | Imagenes (una o varias vistas) | Apache-2.0 | HuggingFace, `transformers` con `trust_remote_code` |
| depth-anything/DA3MONO-LARGE (original) | no disponible en la informacion | Imagenes (una o varias vistas) | Apache-2.0 | HuggingFace, paquete `depth_anything_3` |
| Otros modelos de profundidad monocular | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Port no oficial: el autor lo declara explicitamente; no es una publicacion de ByteDance Seed y debe citarse el trabajo original.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo incluido en el repositorio; conviene revisarlo antes de usarlo en produccion.
- Profundidad relativa, no metrica: la variante monocular no garantiza escala absoluta, lo que limita su uso directo en medicion.
- Salidas no deterministas en parte del pipeline: el manejo del cielo muestrea profundidades, por lo que hay que fijar la semilla de torch para reproducibilidad.
- Dependencias adicionales (`addict`, `omegaconf`, `einops`, `opencv-python`) que pueden complicar el despliegue en entornos restringidos.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento textual; los campos de idioma y contexto no aplican.
- Adopcion muy baja (12 descargas, 0 likes): poca validacion comunitaria y riesgo de mantenimiento limitado.
- No se documentan sesgos especificos ni tasas de error; como todo modelo de vision, puede fallar en escenas fuera de distribucion (iluminacion extrema, superficies reflectantes o transparentes).
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de atribucion y la NOTICE del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bigshanedogg/DA3MONO-LARGE
- Modelo base oficial: https://huggingface.co/depth-anything/DA3MONO-LARGE
- Repositorio oficial de codigo: https://github.com/ByteDance-Seed/depth-anything-3
- Paper: *Depth Anything 3: Recovering the Visual Space from Any Views*, arXiv 2511.10647 — https://arxiv.org/abs/2511.10647
