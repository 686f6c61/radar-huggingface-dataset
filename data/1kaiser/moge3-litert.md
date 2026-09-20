# 1kaiser/moge3-litert

## Resumen

MoGe-3 LiteRT es un paquete de pesos cuantizados y optimizados para edge del modelo MoGe-3 (Fine-Detail Monocular Geometry Estimation with Self-Guided Sparse Volumetric Refinement), publicado por el usuario 1kaiser en HuggingFace. No se trata de un modelo de lenguaje, sino de un modelo de vision por computador especializado en la estimacion de geometria monococular: a partir de una unica imagen RGB es capaz de predecir nubes de puntos, mapas de normales de superficie, mascaras de primer plano y un factor de escala metrica de la escena.

El repositorio es una conversion del "dense stage" de MoGe-3 al formato LiteRT/TFLite, con tres variantes de precision (FP16, INT8 dinamico y FP32) pensadas para despliegue en movil, web y dispositivos ARM/x86 sin GPU dedicada. La arquitectura del stage convertido incluye un backbone DINOv2 Vision Transformer ViT-L, un cuello FPN multiescala y cabezas de prediccion geometrica intermedias. El modelo de entrada acepta tensores de [1, 3, 518, 518] y devuelve cinco salidas, incluida una representacion latente de 1024 canales pensada para una etapa posterior de refinamiento volumetrico disperso.

El interes de esta publicacion es practico: permite ejecutar un pipeline de reconstruccion 3D monococular en hardware de consumo o en el propio dispositivo, sin depender de un servidor con GPU. La licencia MIT y el formato TFLite facilitan su integracion en aplicaciones Android (via NNAPI), WebGPU/Vulkan y Apple Metal. El repositorio tiene 2,3 GB de tamano total, 0 descargas y 0 likes en el momento de la consulta, y no incluye pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 Vision Transformer ViT-L (backbone) + cuello FPN multiescala + cabezas de prediccion geometrica (dense stage de MoGe-3) |
| Parametros totales | no disponible (la model card indica backbone ViT-L pero no el recuento total de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 518 x 518 px ([1, 3, 518, 518]) |
| Tipos de cuantizacion | FP32, FP16, INT8 dinamico |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (.tflite) |
| Tamano del repositorio | 2,3 GB |
| Libreria | litert |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

Variantes publicadas:

| Fichero | Precision | Tamano | Objetivo recomendado |
|---|---|---|---|
| `moge3_dense_stage_fp16.tflite` | FP16 | 631,7 MB | GPU movil / WebGPU / Vulkan / Apple Metal / Android NNAPI |
| `moge3_dense_stage_dynamic_int8.tflite` | INT8 dinamico | 316,3 MB | CPU / edge ARM64 y x86_64 AVX-VNNI |
| `moge3_dense_stage_fp32.tflite` | FP32 | 1,26 GB | Linea base de referencia en precision |

## Arquitectura y entrenamiento

El modelo convertido corresponde al "dense stage" de MoGe-3. Segun la model card, ese stage integra tres bloques: un backbone DINOv2 Vision Transformer en configuracion ViT-L, un cuello FPN multiescala y un conjunto de cabezas de prediccion geometrica. Las salidas son cinco tensores: `raw_points` [1, 3, 672, 672] con coordenadas factorizadas de forma afín (x/z, y/z, log z), `normal` [1, 3, 672, 672] con vectores unitarios de normal de superficie, `mask` [1, 1, 672, 672] con la mascara de primer plano valido, `metric_scale` [1, 1] con el factor de escala metrica de la escena y `encoder_features` [1, 1024, 42, 42] con los tokens visuales que alimentan la etapa de refinamiento volumetrico disperso.

El titulo del articulo asociado describe la innovacion principal: un refinamiento volumetrico disperso auto-guiado (self-guided sparse volumetric refinement) que persigue detalle fino en la geometria estimada. La model card no proporciona informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni el regimen de supervision (si es totalmente auto-supervisado o combina datos con ground truth de profundidad y normales). La unica referencia bibliografica es un `arXiv preprint` de 2026 firmado por Wang, Ruicheng y otros. Los cambios aplicados en este repositorio son de conversion y cuantizacion a LiteRT/TFLite, no de reentrenamiento.

## Capacidades

- Estimacion de geometria monococular densa a partir de una unica imagen RGB de 518 x 518 px.
- Prediccion de nube de puntos implicita en coordenadas factorizadas (`raw_points`, x/z, y/z, log z) a resolucion 672 x 672.
- Prediccion de mapas de normales de superficie a resolucion 672 x 672 (`normal`).
- Segmentacion de primer plano mediante mascara de validez (`mask`).
- Estimacion de escala metrica de escena (`metric_scale`), lo que permite pasar de geometria relativa a medidas absolutas.
- Extraccion de caracteristicas visuales de 1024 canales en una rejilla de 42 x 42 (`encoder_features`), pensadas como entrada de la etapa de refinamiento volumetrico disperso.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues ni de generacion de texto; la unica modalidad de entrada es imagen.
- No se documentan modos especiales (thinking, audio, video) en la model card.

## Casos de uso

- Reconstruccion 3D en el dispositivo para aplicaciones de realidad aumentada: el modelo genera la nube de puntos y las normales en el propio terminal Android o iOS, lo que permite anclar objetos virtuales sobre superficies reales sin enviar el frame a un servidor.
- Captura de activos 3D para videojuegos y modelado: a partir de una fotografia se obtiene una geometria preliminar y un mapa de normales que puede importarse en un pipeline de malla y retopologizarse despues; la salida `mask` ayuda a aislar el objeto de interes del fondo.
- Robotica movil y navegacion: el modelo aporta profundidad relativa y un factor de escala metrica, lo que permite estimar distancias a obstaculos con una sola camara monocula en robots de bajo coste.
- Escaneo de interiores y medicion asistida: la combinacion de `raw_points` con `metric_scale` habilita estimaciones de dimensiones de estancia para aplicaciones de reforma, inmobiliaria o inventario.
- Fotografia computacional: el mapa de normales y la profundidad permiten aplicar efectos de reiluminacion, desenfoque de profundidad o sustitucion de fondo coherentes con la geometria real de la escena.
- Inspeccion industrial en el borde: con la variante INT8 dinamica de 316,3 MB se puede desplegar en pasarelas ARM64 o x86_64 con AVX-VNNI para detectar deformaciones o estimar volumen de piezas en linea de produccion.
- Vision para vehiculos y drones con computo limitado: la variante FP16 con destino NNAPI, WebGPU o Metal permite integrar estimacion de profundidad como modulo auxiliar en sistemas de evitacion de obstaculos.
- Preprocesado para pipelines de reconstruccion de mayor calidad: las `encoder_features` [1, 1024, 42, 42] se pueden consumir en la etapa de refinamiento volumetrico disperso descrita en el articulo para obtener geometria de mayor detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas cuantitativas (ni error de profundidad, ni metricas de normales, ni comparaciones con otros modelos), y los resultados de busqueda web proporcionados no contienen informacion tecnica sobre MoGe-3 ni sobre esta conversion.

## Requisitos de hardware

- VRAM/RAM para pesos: 316,3 MB en la variante INT8 dinamica, 631,7 MB en FP16 y 1,26 GB en FP32. Estas cifras son los tamanos de fichero declarados; el consumo real en ejecucion es mayor por los buffers de activacion de un modelo con backbone ViT-L y entrada de 518 x 518 px (estimacion, no dato publicado).
- GPU recomendadas: la model card no especifica GPU concretas. Para FP16 los destinos declarados son GPU movil, WebGPU, Vulkan, Apple Metal y Android NNAPI; para INT8 dinamico, CPU ARM64 y x86_64 con AVX-VNNI.
- Cabe en GPU de consumo: si, siempre que el runtime soporte el backend correspondiente (Metal en Apple Silicon, WebGPU/Vulkan en GPUs de escritorio, NNAPI en Android). No se documentan requisitos minimos de VRAM ni compatibilidad con CUDA, por lo que el despliegue en A100/H100/RTX via LiteRT no esta confirmado en la informacion disponible.
- Opciones de despliegue: interprete LiteRT/TFLite, Android NNAPI, WebGPU, Vulkan, Apple Metal y aceleracion CPU con AVX-VNNI en x86_64. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni FPS en ningun dispositivo.

## Comparativa con modelos similares

No se dispone de datos de otros modelos en la informacion proporcionada (ni parametros, ni contexto, ni metricas de MoGe-3 original, Depth Anything, Metric3D u otros estimadores monoculares). La unica comparativa que puede establecerse con los datos disponibles es entre las tres variantes del propio repositorio:

| Variante | Precision | Tamano | Destino declarado | Compromiso |
|---|---|---|---|---|
| `moge3_dense_stage_fp16.tflite` | FP16 | 631,7 MB | GPU movil, WebGPU, Vulkan, Metal, NNAPI | Equilibrio entre precision y tamano |
| `moge3_dense_stage_dynamic_int8.tflite` | INT8 dinamico | 316,3 MB | CPU, edge ARM64 y x86_64 AVX-VNNI | Menor tamano y coste en CPU; precision reducida |
| `moge3_dense_stage_fp32.tflite` | FP32 | 1,26 GB | Linea base de referencia | Maxima fidelidad numerica, mayor coste |

Comparativa con alternativas externas: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona sobre instrucciones y no soporta tool calling ni agentes. Cualquier uso conversacional es inaplicable.
- La model card no documenta sesgos. Al ser un modelo de vision entrenado con datos no especificados, puede heredar sesgos de los datasets de imagen y geometria subyacentes (por ejemplo, peor rendimiento en escenas o materiales poco representados).
- Riesgo de alucinacion geometrica: como todo estimador monoculo, puede producir profundidades y normales plausibles pero incorrectas en superficies reflectantes, transparentes, con textura repetitiva o con iluminacion atipica. La mascara `mask` ayuda a filtrar, pero no elimina el problema.
- La entrada esta fijada a 518 x 518 px, por lo que es necesario redimensionar; esto degrada el detalle en imagenes de alta resolucion y en escenas muy amplias.
- El factor `metric_scale` es una estimacion, no una medida calibrada; no debe usarse como sustituto de instrumentacion metrologica en aplicaciones criticas.
- No se documenta el comportamiento del modelo fuera de la tarea de geometria monococular ni su robustez frente a dominios distintos al de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero se debe conservar el aviso de copyright y la atribucion correspondiente. Conviene verificar la licencia del modelo MoGe-3 original y la del backbone DINOv2 antes de un despliegue comercial, ya que la model card no detalla esas dependencias.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-09-20), lo que implica ausencia de validacion por parte de la comunidad. No hay pipeline declarado ni resultados de evaluacion publicados.
- Los resultados de la busqueda web proporcionados no contienen informacion tecnica sobre el modelo (corresponden a paginas sin relacion), por lo que no ha sido posible contrastar ningun dato con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1kaiser/moge3-litert
- Articulo citado: MoGe-3: Fine-Detail Monocular Geometry Estimation with Self-Guided Sparse Volumetric Refinement, Wang, Ruicheng y otros, arXiv preprint, 2026. URL del paper: no disponible en la informacion proporcionada.
- Repositorio de codigo: no disponible en la informacion proporcionada.
- Demo o espacio interactivo: no disponible en la informacion proporcionada.
- Documentacion de LiteRT: no disponible en la informacion proporcionada.
