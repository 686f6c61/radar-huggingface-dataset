# mtbui2010/depth-anything-v2-small-ONNX

## Resumen

Este repositorio contiene una exportacion a ONNX del modelo Depth Anything V2 Small, concretamente de los pesos de `depth-anything/Depth-Anything-V2-Small-hf`. Lo publica el usuario mtbui2010 para su herramienta VisionServe, un contenedor de servicio de modelos de vision. Se trata de un modelo de estimacion de profundidad monocular (relative inverse depth) que, dado un unico fotograma RGB, predice un valor de disparidad por pixel. Con unos 24,8 millones de parametros, es la variante mas ligera de la familia Depth Anything V2, publicada originalmente en NeurIPS 2024.

La aportacion principal de esta exportacion frente a otras conversiones a ONNX es que mantiene entradas de tamano dinamico reales. El autor advierte de que una exportacion estandar con `dynamic_axes` produce resultados incorrectos: el trazador antiguo incrusta el tamano de salida 518×518 en la cabeza del modelo (`int(patch_h * 14)` en `modeling_depth_anything.py`), de forma que cualquier entrada devuelve un mapa de 518×518. Esta version conserva ese tamano trazado y permite alimentar la imagen con la relacion de aspecto original, redimensionando cada lado a un multiplo de 14.

El modelo es relevante para desarrolladores que necesitan estimacion de profundidad en produccion sin dependencias de PyTorch, con licencia Apache-2.0 (permite uso comercial) y con una huella de disco de apenas 0,1 GB. Su verificacion reportada frente a PyTorch muestra una discrepancia maxima de 1,05e-05 en tres formas de entrada distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador de vision tipo ViT/DPT (head DPT, parches de 14 px) |
| Parametros totales | 24,8 millones (variante Small) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto de texto) |
| Tipos de cuantizacion | solo f32 en este repositorio; no se distribuyen variantes cuantizadas |
| Idiomas soportados | no aplica / no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (heredada de `depth-anything/Depth-Anything-V2-Small-hf`) |
| Formato de pesos | ONNX (grafo unico, I/O: `pixel_values` → `predicted_depth`) |
| Tamano del repositorio | 0,1 GB |
| Entrada | `pixel_values` `[1, 3, H, W]` f32, H y W multiplos de 14, normalizado /255 con media y desviacion de ImageNet |
| Salida | `predicted_depth` `[1, H, W]` f32, profundidad inversa relativa (disparidad), sin normalizar |

## Arquitectura y entrenamiento

El modelo subyacente es Depth Anything V2 en su variante Small. La arquitectura sigue el esquema DPT (Dense Prediction Transformer), en el que un codificador de vision transformer extrae caracteristicas a multiples escalas y una cabeza densa las reensambla en un mapa de profundidad por pixel. El hecho de que la model card cite `DPTImageProcessor` y el fichero `modeling_depth_anything.py`, junto con el uso de parches de 14 px, confirma esta estructura. El autor no publica detalles adicionales sobre el dataset de entrenamiento ni sobre el proceso de ajuste del modelo base.

La innovacion tecnica de este repositorio no esta en la arquitectura, sino en el proceso de exportacion. El export mantiene el tamano de salida trazado de la cabeza y, a la vez, expone ejes H y W dinamicos en la entrada, lo que evita el error tipico de las conversiones ONNX de este modelo. El preprocesado recomendado replica el de `DPTImageProcessor`: conservar la relacion de aspecto, escalar por el factor entre 518/W y 518/H mas cercano a 1 y redondear cada lado a un multiplo de 14 (bicubico). La verificacion reportada por el autor incluye tres comprobaciones: ONNX frente a PyTorch en tres formas de entrada (518×518, 910×518 y 518×686) con un error maximo normalizado de 1,05e-05; comparacion del preprocesado servido frente a `DPTImageProcessor` (media de 0,25 niveles de gris y mismas formas en 7 de 7 imagenes); y correlacion de Pearson minima de 0,9999 entre el mapa de profundidad servido y `predicted_depth`.

## Capacidades

- Estimacion de profundidad monocular relativa (disparidad) a partir de una unica imagen RGB.
- Entrada de tamano dinamico con relacion de aspecto arbitraria, siempre que H y W sean multiplos de 14.
- Inferencia sin dependencia de PyTorch, mediante runtime ONNX.
- Verificado frente a la implementacion de referencia en PyTorch con un error maximo de 1,05e-05.
- Integracion directa con VisionServe (`visionserve pull depth-anything-v2`) y con cualquier motor compatible con ONNX (onnxruntime, OpenCV DNN, etc.).
- No soporta tool calling ni function calling (es un modelo puramente visual).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No ofrece modo de pensamiento, audio ni otras modalidades.

## Casos de uso

- Generacion de mapas de profundidad para efectos de desenfoque sintetico (bokeh o profundidad de campo) en herramientas de edicion: el modelo devuelve una disparidad por pixel que se puede mapear a una curva de desenfoque segun la distancia relativa estimada.
- Canal de control de profundidad para modelos de difusion: la salida `predicted_depth` se usa como mapa de condicionamiento en pipelines tipo ControlNet depth, donde la precision relativa y el tamano dinamico de entrada permiten conservar la relacion de aspecto original.
- Reconstruccion 3D y generacion de nubes de puntos: convirtiendo la disparidad relativa en profundidad metric (con una escala externa) se pueden levantar mapas de elevacion o mallas de escenas a partir de fotografias.
- Robotica y navegacion en el borde: con 24,8M de parametros y un grafo ONNX de 0,1 GB, el modelo cabe en dispositivos embebidos (Jetson, Raspberry Pi con acelerador) y puede alimentar bucles de evitacion de obstaculos a partir de una camara monocular.
- Preprocesado en fotogrametria y levantamiento arquitectonico: la estimacion de profundidad densa sirve como inicializacion o como mascara de oclusion antes de un pipeline de matching estereo o Structure-from-Motion.
- Analisis de escenas en automocion o vigilancia: la disparidad relativa permite segmentar objetos por proximidad y estimar orden de profundidad sin necesidad de un sensor LiDAR.
- Realidad aumentada: para colocar objetos virtuales con oclusion correcta respecto a la escena real, usando el mapa de profundidad como buffer de profundidad aproximado.
- Control de calidad en fabricacion: estimacion de alturas relativas o deteccion de oclusiones en lineas de montaje con una camara fija y sin iluminacion estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye metricas de verificacion de la exportacion:

| Verificacion | Resultado |
|---|---|
| ONNX frente a PyTorch (3 formas de entrada) | max abs(Δ)/escala = 1,05e-05 |
| Preprocesado servido frente a `DPTImageProcessor` | media 0,25 niveles de gris, mismas formas en 7/7 imagenes |
| Mapa de profundidad servido frente a `predicted_depth` | Pearson r minimo 0,9999, media 1,000 |

## Requisitos de hardware

- VRAM estimada: muy baja. Con 24,8M de parametros en f32, los pesos ocupan aproximadamente 100 MB, por lo que cabe holgadamente en cualquier GPU con 1-2 GB libres.
- GPU recomendadas: no requiere GPU dedicada. Funciona bien en cualquier GPU moderna (RTX 3060 o superior, A100, H100) y tambien en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en iGPU y en aceleradores de borde (Jetson, Coral, NPU integradas).
- Opciones de despliegue: onnxruntime y onnxruntime-gpu, OpenCV DNN, VisionServe (contenedor del autor), y cualquier servidor de inferencia compatible con ONNX (Triton, por ejemplo). No se proporcionan pesos GGUF ni safetensors en este repositorio.
- Latencia y throughput estimados: no disponible (no se publican mediciones de latencia ni de imagenes por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| mtbui2010/depth-anything-v2-small-ONNX (este) | 24,8M (variante Small) | ONNX | Apache-2.0 | imagen RGB dinamica, H/W multiplos de 14 | HuggingFace |
| depth-anything/Depth-Anything-V2-Small-hf (base) | 24,8M | safetensors / PyTorch | Apache-2.0 | imagen RGB | HuggingFace |
| Depth Anything V2 Base | no disponible en la informacion | safetensors / PyTorch | CC-BY-NC-4.0 | imagen RGB | HuggingFace |
| Depth Anything V2 Large | no disponible en la informacion | safetensors / PyTorch | CC-BY-NC-4.0 | imagen RGB | HuggingFace |

Nota: el autor indica explicitamente que solo publica la variante Small porque Base y Large usan licencia CC-BY-NC-4.0, que no permite uso comercial. No se han proporcionado cifras de parametros para Base y Large en la informacion disponible.

## Limitaciones y advertencias

- La salida es profundidad inversa relativa (disparidad), no normalizada y sin escala metrica absoluta; para medidas reales hay que calibrar con una referencia externa.
- El modelo estima profundidad a partir de una sola imagen, por lo que puede fallar en escenas ambiguas, objetos reflectantes, superficies transparentes o con textura repetitiva.
- Riesgo de alucinacion de estructura: el modelo puede inferir bordes o planos de profundidad plausibles pero incorrectos en regiones sin informacion visual.
- La restriccion de H y W a multiplos de 14 obliga a un preprocesado especifico (redondeo por lado) que, si no se respeta, degrada el resultado.
- No procesa texto ni idiomas, y no soporta tool calling ni agentes.
- Licencia Apache-2.0, que permite uso comercial; hereda esta licencia del modelo base Small. No aplica a las variantes Base y Large del modelo original, que son CC-BY-NC-4.0.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de adopcion en produccion ni validacion externa independiente.
- El autor no publica cifras de latencia, throughput ni consumo de memoria en despliegue real.
- La fecha de creacion indicada es 2026-10-03, posterior a la fecha de consulta habitual; conviene verificar la vigencia del repositorio y sus versiones.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mtbui2010/depth-anything-v2-small-ONNX
- Modelo base en HuggingFace: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Variante Small original (sin formato HF): https://huggingface.co/depth-anything/Depth-Anything-V2-Small
- Repositorio oficial de Depth Anything V2 en GitHub (NeurIPS 2024): https://github.com/DepthAnything/Depth-Anything-V2
- Implementacion ONNX alternativa de la comunidad: https://github.com/fabio-sim/Depth-Anything-ONNX
- VisionServe (contenedor de servicio): https://hub.docker.com/r/mtbui2010/visionserve
- Demo de profundidad en navegador con la variante ONNX Small: https://ai.hjlabs.in/models/onnx-community/depth-anything-v2-small
