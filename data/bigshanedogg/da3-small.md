# bigshanedogg/DA3-SMALL

## Resumen

DA3-SMALL es la variante pequena de Depth Anything 3, un modelo de estimacion de profundidad y geometria multi-vista desarrollado por ByteDance Seed (Haotong Lin, Sili Chen, Jun Hao Liew y colaboradores). El repositorio `bigshanedogg/DA3-SMALL` no es un modelo nuevo, sino un port no oficial al formato nativo de `transformers` del checkpoint oficial `depth-anything/DA3-SMALL`, con los tensores re-guardados mediante `save_pretrained` y verificados como identicos uno a uno.

El modelo resuelve la recuperacion del espacio visual a partir de cualquier numero de vistas: estima profundidad relativa, pose de camara y permite condicionamiento por pose, ademas de decodificar poses desde una cabeza de rayos. Con 34.299.463 parametros y un peso de repositorio de 0,1 GB, esta pensado para tareas de image-to-3D, reconstruccion multi-vista y extraccion de caracteristicas geometricas.

Su relevancia practica esta en que elimina la dependencia del paquete `depth_anything_3`: el codigo de red oficial (commit 3d835ec1) esta vendorizado en ficheros planos `da3_*.py` y se carga con `trust_remote_code=True`, de modo que basta con `torch` y `transformers` mas unas pocas dependencias auxiliares. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red Depth Anything 3 (any-view), portada a `DepthAnything3ForDepthEstimation`; configuracion `da3_config` equivalente a `configs/da3-small.yaml` |
| Parametros totales | 34.299.463 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada como `pixel_values` de forma (1, N, 3, H, W) con N imagenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; inferencia documentada en fp32, fp16 y bf16 via autocast) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es una red de vision para estimacion de profundidad y geometria multi-vista. La arquitectura concreta interna no se detalla en la informacion disponible mas alla de que se construye a partir del grafo de objetos del checkpoint (`config.json` → `da3_config`, identico a `configs/da3-small.yaml`) siguiendo el mismo procedimiento que `depth_anything_3.cfg.create_object`. El `forward` del port ejecuta el `forward` de la red original y devuelve un `DepthAnything3Output` (`ModelOutput`) donde la salida `depth` se renombra a `predicted_depth` y el resto de claves conservan su nombre.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. La innovacion tecnica destacable del port es la fidelidad de la reimplementacion: se verifico contra el paquete oficial (mismo proceso y semillas, V100, 4 imagenes) que el preprocesado y todas las salidas del forward simple, condicionado por pose y ray-pose son bit-identicas, tambien como tupla, en fp32 y bajo el autocast de la API del paquete. El codigo de red es el oficial (ByteDance-Seed/depth-anything-3 @ 3d835ec1) vendorizado, con solo cambios de imports y un logger renombrado.

## Capacidades

- Estimacion de profundidad relativa multi-vista: devuelve `predicted_depth` con forma (1, N, H, W) a la resolucion procesada.
- Estimacion de confianza de profundidad (`depth_conf`) junto a la prediccion.
- Condicionamiento por pose: acepta `extrinsics` (1, N, 4, 4) e `intrinsics` (1, N, 3, 3).
- Decodificacion de poses desde la cabeza de rayos con `use_ray_pose=True`.
- Extraccion de caracteristicas del backbone mediante `export_feat_layers=[i, ...]`, devueltas en `outputs.aux`.
- Procesamiento de un numero variable de imagenes de entrada (N vistas) en una sola llamada.
- Compatibilidad con `AutoModelForDepthEstimation` y `AutoProcessor` de `transformers`, con `trust_remote_code=True`.
- No se documentan capacidades de texto, codigo, matematicas, audio, tool calling ni agentes.

## Casos de uso

- Reconstruccion 3D multi-vista: a partir de varias fotografias de un mismo objeto o escena, el modelo estima profundidad por vista y, con `use_ray_pose=True`, decodifica las poses de camara necesarias para triangular una nube de puntos o malla.
- Digitalizacion de patrimonio o producto: fotografiar una pieza desde varios angulos y obtener profundidad y geometria consistente para generar un modelo 3D, aprovechando que el modelo es any-view y no requiere un numero fijo de imagenes.
- Aumento de datos para vision artificial: generar mapas de profundidad y poses sinteticas sobre imagenes existentes para entrenar detectores, segmentadores o modelos de navegacion.
- Robotica y navegacion: estimar la estructura del entorno a partir de un conjunto de camaras o de una secuencia de imagenes, usando `depth_conf` para ponderar la fiabilidad de cada pixel.
- Condicionamiento por pose conocida: en pipelines donde la calibracion intrinseca y la pose estan disponibles, pasar `extrinsics` e `intrinsics` al procesador para que las intrinsecas sigan el redimensionado y obtener profundidad metricamente coherente con esa geometria.
- Extraccion de caracteristicas geometricas: usar `export_feat_layers` para obtener representaciones del backbone y alimentar tareas posteriores de correspondencia, registro o segmentacion.
- Prototipado rapido en `transformers`: al no requerir el paquete `depth_anything_3`, se integra en entornos que ya usan `transformers` para otros modelos, reduciendo la superficie de dependencias en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es de equivalencia numerica frente al paquete oficial (preprocesado y salidas bit-identicas en V100 con 4 imagenes, fp32 y autocast), no de calidad frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 34,3 M de parametros, los pesos ocupan aproximadamente 137 MB en fp32 y unos 69 MB en fp16/bf16; el consumo real dependera de la resolucion de las imagenes y del numero de vistas N.
- GPU: la verificacion oficial se realizo en una V100. Cualquier GPU con soporte CUDA y bf16 o fp16 (por ejemplo, RTX 4090, A100, H100) deberia poder ejecutarlo; no se publican requisitos minimos.
- GPU de consumo: por tamano de pesos, cabe holgadamente en GPUs de consumo actuales; el limitante sera la memoria para lotes de muchas vistas o resoluciones altas, no el modelo.
- Despliegue: `transformers` con `trust_remote_code=True` y `AutoModelForDepthEstimation` / `AutoProcessor`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje).
- Dependencias de runtime adicionales: `addict`, `omegaconf`, `einops`, `opencv-python`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DA3-SMALL (este port) | 34.299.463 | N vistas, profundidad + pose + ray-pose | Profundidad y geometria multi-vista | Apache-2.0 | HuggingFace (`bigshanedogg/DA3-SMALL`) |
| `depth-anything/DA3-SMALL` (oficial) | no disponible en la informacion | mismo checkpoint | misma tarea | Apache-2.0 | HuggingFace, requiere paquete `depth_anything_3` |
| Otras variantes de Depth Anything 3 | no disponible | no disponible | misma familia | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de otras variantes de la familia que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un lanzamiento oficial: es un port no oficial de un tercero; para citar o reportar problemas del modelo conviene referirse al trabajo original de ByteDance Seed.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; auditar el codigo antes de usarlo en produccion.
- Algunas salidas usan muestreo aleatorio, como en el original (el manejo del cielo muestrea profundidades); es necesario fijar la semilla de `torch` para obtener ejecuciones reproducibles.
- La profundidad se devuelve a la resolucion procesada, no necesariamente a la resolucion original de entrada.
- No se documentan sesgos; al ser un modelo de vision, los sesgos potenciales vendrian de los datos de entrenamiento del modelo original, no descritos en la informacion disponible.
- Riesgo de alucinacion geometrica en regiones ambiguas o con poca textura; `depth_conf` debe usarse para filtrar predicciones poco fiables.
- No hay informacion sobre idiomas ni sobre rendimiento fuera de los dominios del dataset original.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de atribucion (`NOTICE`) y citar el trabajo original segun pide el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bigshanedogg/DA3-SMALL
- Modelo base oficial: https://huggingface.co/depth-anything/DA3-SMALL
- Repositorio de codigo original: https://github.com/ByteDance-Seed/depth-anything-3
- Paper: *Depth Anything 3: Recovering the Visual Space from Any Views* — https://arxiv.org/abs/2511.10647
- Ficheros de licencia y atribucion en el repo: `LICENSE` y `NOTICE` (referenciados en la model card)
