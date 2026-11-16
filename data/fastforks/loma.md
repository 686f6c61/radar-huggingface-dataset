# fastforks/loma

## Resumen

LoMa es un modelo de correspondencia densa de características locales (local feature matching) desarrollado por Nordström, Edstedt et al. (2026) y empaquetado para su uso con la librería fastforks. Dada una pareja de imágenes RGB de la misma escena, el modelo devuelve, para cada píxel de la primera imagen, su posición correspondiente en la segunda (coordenadas x, y en píxeles) junto con una medida de certeza de que ese píxel es visible en ambas vistas. Es un modelo de visión por computador orientado a tareas de emparejamiento imagen-a-imagen, no un modelo de lenguaje.

La arquitectura combina tres componentes: un detector DaD (un VGG11 entrenado por destilación) que localiza 2048 puntos clave por imagen, un descriptor DeDoDe-G (VGG19 junto con un DINOv2 ViT-L/14 congelado) que describe esos puntos, y nueve capas transformer de estilo LightGlue (self-attention rotacional y cross-attention) que refinan las descripciones antes de una asignación dual-softmax. El resultado es un conjunto de puntos clave, los pares de índices emparejados y sus puntuaciones.

Su relevancia radica en que ofrece un emparejamiento disperso de alta calidad con un transformer ligero, pensado para integrarse en pipelines de reconstrucción 3D (structure from motion) y estimación de pose. El repositorio de Hugging Face es únicamente una model card: no aloja pesos, sino que fastforks descarga los pesos de los autores y los verifica mediante SHA-256. Está marcado como tier experimental y backend portable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: detector DaD (VGG11 por destilacion) + descriptor DeDoDe-G (VGG19 + DINOv2 ViT-L/14 congelado) + 9 capas transformer estilo LightGlue (self-attention rotacional y cross-attention) con asignacion dual-softmax |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de cualquier H x W >= 32, con padding a multiplo de 32) |
| Tipos de cuantizacion | fp16 y bfloat16 en el backend portable; fp32 en el codigo original; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT (codigo y pesos de la variante `loma-b@1`); ficheros adicionales `LICENSE-DAD`, `LICENSE-DEDODE`, `LICENSE-DINOv2` |
| Formato de pesos | `.pt` (PyTorch); los pesos los aloja el autor, no este repositorio |

## Arquitectura y entrenamiento

LoMa sigue un diseno en tres etapas. Primero, el detector DaD (VGG11 entrenado por destilacion) extrae 2048 puntos clave por imagen. Despues, el descriptor DeDoDe-G, compuesto por una red VGG19 y un DINOv2 ViT-L/14 congelado, genera descripciones para esos puntos. Por ultimo, nueve capas transformer de estilo LightGlue, con self-attention rotacional y cross-attention, refinan las descripciones antes de una asignacion dual-softmax que produce los emparejamientos finales. La salida incluye ambos conjuntos de puntos clave, los pares de indices emparejados y sus puntuaciones.

En cuanto a los datos de entrenamiento, el matcher se entrena con MegaDepth (colecciones de fotos de Internet con profundidad SfM/MVS); el detector DaD se entrena por destilacion sobre datos basados en MegaDepth; el descriptor DeDoDe-G usa MegaDepth; y el DINOv2 congelado se entreno con LVD-142M (Meta). La informacion disponible no detalla el numero de tokens ni si hubo etapas de RLHF o DPO, algo esperable dado que no es un modelo generativo de texto. Como innovacion destacable, el modelo admite entradas de cualquier tamano H x W >= 32 (con padding a multiplo de 32) y el backend portable alcanza fp16, con paridad verificada frente al codigo original: en CPU y float32 la diferencia maxima absoluta es <= 0.011; en GPU con bfloat16 (portable) y float16 (kernels) la diferencia media es <= 0.002 y el p99 <= 0.001 sobre `keypoints1`.

## Capacidades

- Emparejamiento disperso de caracteristicas locales entre dos imagenes de una misma escena.
- Deteccion de 2048 puntos clave por imagen mediante el detector DaD.
- Descripcion de puntos clave con DeDoDe-G (VGG19 + DINOv2 ViT-L/14 congelado).
- Refinamiento de descripciones mediante 9 capas transformer LightGlue con self-attention rotacional y cross-attention.
- Asignacion de correspondencias mediante dual-softmax, devolviendo pares de indices y puntuaciones.
- Salida de puntos clave (`keypoints1`, `keypoints2`), pares emparejados (`pairs`) y puntuaciones (`scores`).
- Entrada de cualquier resolucion H x W >= 32, con padding a multiplo de 32.
- Integracion con pycolmap / COLMAP a traves de los pares de indices.
- Soporte de backend portable (fp16/bfloat16) en CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No ofrece salida densa (dense warp): el resultado es disperso.

## Casos de uso

- Reconstruccion 3D y structure from motion: los pares de indices que devuelve el modelo pueden volcarse directamente a una base de datos pycolmap / COLMAP para triangular puntos 3D y estimar poses de camara a partir de una carpeta de imagenes.
- Estimacion de pose relativa entre dos vistas: `result.matches()` proporciona los puntos emparejados que `estimate_pose` necesita para calcular la transformacion entre camaras en tareas de odometria visual o calibracion.
- Registro de imagenes (image registration): util para alinear imagenes de satelite, medicas o industriales de la misma escena, aprovechando la salida de correspondencias pixel a pixel con puntuacion de certeza.
- Fotogrametria y modelado 3D: con resoluciones de hasta 3000x4000 probadas en una RTX 5060 Ti de 16 GB (2,4 GiB de pico asignado), el modelo puede procesar imagenes de alta resolucion en pipelines de reconstruccion de escenas.
- Verificacion de correspondencias en pipelines de vision: los pares y sus puntuaciones permiten filtrar emparejamientos de baja confianza antes de etapas posteriores como triangulacion o bundle adjustment.
- Prototipado e investigacion en matching: al ser un paquete experimental con backend portable y paridad verificada frente al codigo original, sirve para reproducir resultados academicos y comparar con otros matchers (LightGlue, superglue) sin gestionar manualmente los pesos.
- Procesamiento por lotes de pares de imagenes: aunque internamente procesa una pareja por llamada, puede integrarse en scripts que recorran carpetas de imagenes para generar correspondencias de forma sistematica.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados por el autor (RTX 5060 Ti 16 GB, sm_120; entrada sintetica 768x1024):

| Modelo | Tiempo portable (ms) | Memoria pico asignada / reservada (MiB) | Carga (s) | Primera llamada (s) |
|---|---|---|---|---|
| `loma-b` | 308 | 1767 / 1878 | 2,53 | 1,27 |

| Modelo | Entrada | Portable | torch.compile | Preparacion compile (primera llamada en frio) | Memoria pico portable / compile (MiB) |
|---|---|---|---|---|---|
| `loma-b` | 768x1024 | 308 ms | 285 ms | 104 s | 1767 / 1878 y 2870 / 3216 |

Notas: el backend kernels no esta implementado para este modelo (los recuentos de puntos clave y emparejamientos dependen de los datos); la comparacion con el codigo original indica 307,9 ms en portable frente a 382,8 ms del original. TensorRT fp16 esta planificado para la version 0.2.1. No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7 GiB de memoria asignada y 1,9 GiB reservada a 768x1024 en fp16; probado hasta 3000x4000 con 2,4 GiB de pico asignado y 3,6 GiB reservado.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU CUDA con al menos 4-8 GB de VRAM deberia ser suficiente para resoluciones tipicas, aunque no se documentan pruebas en otras GPU.
- Cabe en GPU de consumo: si, segun los datos del autor en una RTX 5060 Ti de 16 GB.
- Opciones de despliegue: libreria `fastforks` (backend portable); el codigo original esta en el repositorio `davnords/loma`. No hay soporte de exportacion a ONNX ni TensorRT (la exportacion falla por los recuentos dependientes de datos).
- Latencia y throughput: 308 ms por pareja a 768x1024 en portable; con `torch.compile`, 285 ms; el backend kernels no esta disponible para este modelo.
- Procesa una pareja de imagenes por llamada internamente; los lotes se ejecutan pareja a pareja.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoMa (`loma-b`) | no disponible | cualquier H x W >= 32 | Detector DaD + descriptor DeDoDe-G + 9 capas LightGlue | MIT | Pesos en el autor; empaquetado en fastforks |
| LightGlue | no disponible | no disponible | Matcher disperso basado en transformer | no disponible | no disponible |
| DeDoDe | no disponible | no disponible | Detector y descriptor de puntos clave | no disponible | no disponible |

La informacion disponible no incluye datos de rendimiento comparativo con LightGlue ni DeDoDe, por lo que no es posible establecer una comparacion cuantitativa. LoMa reutiliza componentes de ambos (estilo LightGlue y descriptor DeDoDe-G) y anade el detector DaD.

## Limitaciones y advertencias

- Salida dispersa: no genera dense warp; solo devuelve puntos clave emparejados y sus puntuaciones.
- Una pareja de imagenes por llamada internamente; los recuentos de emparejamientos varian segun la pareja.
- No hay modulo exportable: los recuentos dependen de los datos, por lo que `torch.compile` funciona con graph breaks y la exportacion a ONNX / TensorRT falla.
- Dos redimensionados por imagen como en el codigo original: el detector ve un lado largo de `long_side` (manteniendo aspecto) y el descriptor ve un cuadrado `size` x `size` independientemente del aspecto.
- Solo orientacion vertical (upright): los pesos publicados no estan entrenados para rotaciones en el plano.
- Backend kernels no implementado para este modelo.
- Tier experimental: pensado para investigacion; conviene revisar los ficheros de licencia adicionales (DaD, DeDoDe, DINOv2) antes de usos distintos de la investigacion.
- Licencia MIT declarada para codigo y pesos de `loma-b@1`, con uso comercial permitido segun la model card, pero el paquete se describe como de uso de investigacion; verificar antes de produccion.
- Riesgo de alucinacion no aplica (no es un modelo generativo); el riesgo principal es la produccion de emparejamientos incorrectos en escenas con oclusiones o rotaciones.
- No se documentan sesgos conocidos ni limitaciones de idioma (no es linguistico).
- El repositorio de Hugging Face no aloja pesos: la disponibilidad depende de los enlaces del autor y de la verificacion SHA-256.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/loma
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original de LoMa: https://github.com/davnords/loma (commit `415caedde23a`)
- Pesos `loma_B.pt`: https://github.com/davnords/storage/releases/download/loma/loma_B.pt
- Fichero de definicion de la variante: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/matching/models/loma/card.toml
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Licencia de LoMa: https://github.com/davnords/loma/blob/415caedde23a9ed479172ed174fe4ff7b4514d4b/LICENSE
- Licencia de DaD: https://github.com/Parskatt/dad/blob/41b9e86a1a3ae52128485cc1094aa4952ef489ba/LICENSE
- Licencia de DeDoDe: https://github.com/Parskatt/DeDoDe/blob/6d156183f4dc84cd704ae779eebc8350995c5b06/README.md#license
