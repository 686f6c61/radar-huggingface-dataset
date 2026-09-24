# ashwmurt/dpt-hybrid-midas

## Resumen

DPT-Hybrid-MiDaS es un modelo de estimacion de profundidad monocular (monocular depth estimation) basado en un transformer de prediccion densa. Fue desarrollado originalmente por Intel como parte de MiDaS v3.0 y presentado en el articulo "Vision Transformers for Dense Prediction" (Ranftl et al., 2021). El repositorio analizado, `ashwmurt/dpt-hybrid-midas`, no es un entrenamiento nuevo: es una receta ("recipe") independiente de Qualcomm AI Hub Models que empaqueta el checkpoint de HuggingFace `Intel/dpt-hybrid-midas` (~122 millones de parametros) para poder compilarlo, perfilarlo y evaluarlo en dispositivos Snapdragon reales a traves de Qualcomm AI Hub Workbench.

Su relevancia practica no esta en la arquitectura, que es de 2021, sino en el canal de despliegue: permite exportar un modelo de profundidad a TensorFlow Lite, ONNX Runtime o Qualcomm AI Engine Direct y ejecutarlo en hardware movil y de borde. El modelo devuelve profundidad inversa relativa (no distancia metrica en metros), con una escala y un desplazamiento globales desconocidos, lo que lo hace util como modulo de percepcion intermedio y no como sensor de distancia calibrado.

El repositorio tiene 0 descargas y 0 likes y fue creado el 23 de septiembre de 2026 segun los metadatos de HuggingFace, por lo que se trata de una publicacion reciente y sin adopcion documentada. La licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: stem convolucional BiT-R50 + encoder ViT-Base + decoder convolucional DPT (neck + head) |
| Parametros totales | ~122 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen, no una secuencia de texto) |
| Resolucion de entrada | 384 x 384 px (resolucion nativa del checkpoint) |
| Tipos de cuantizacion | no disponible (la model card no especifica tipos; el pipeline de Qualcomm AI Hub permite exportar a TFLite, ONNX Runtime y Qualcomm AI Engine Direct) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (checkpoint de HuggingFace `Intel/dpt-hybrid-midas`); exportable a TFLite, ONNX y Qualcomm AI Engine Direct |
| Pipeline declarado | depth-estimation |
| Salida | mapa denso de profundidad inversa relativa (por pixel), hasta escala y desplazamiento globales desconocidos |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno DPT de dos etapas. Un stem convolucional BiT-R50 procesa la imagen de entrada y genera un mapa de caracteristicas que se tokeniza; esos tokens alimentan un encoder ViT-Base. A continuacion, un decoder convolucional de tipo DPT ("neck" mas "head") reensambla progresivamente los tokens intermedios del transformer en representaciones de mayor resolucion hasta producir un mapa de profundidad denso a la resolucion de entrada. La variante "hybrid" se distingue de la variante puramente ViT precisamente por ese stem convolucional BiT-R50 y por tomar activaciones intermedias del backbone.

El entrenamiento original se realizo sobre MIX-6, una mezcla de seis conjuntos de datos de profundidad, con aproximadamente 1,4 millones de imagenes, y esta orientado a la transferencia zero-shot. La consecuencia directa es que el modelo predice profundidad inversa relativa y no distancia metrica: la salida es correcta en su ordenacion relativa pero requiere una calibracion externa (por ejemplo, con puntos de referencia conocidos) para convertirse en metros. La receta de Qualcomm no reentrena el modelo; unicamente envuelve el checkpoint publicado y anade scripts de preprocesado, postprocesado y exportacion.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una sola imagen RGB, con salida por pixel a 384 x 384 px.
- Transferencia zero-shot a dominios no vistos, gracias al entrenamiento sobre MIX-6.
- Prediccion de profundidad inversa relativa, adecuada para ordenar objetos de cerca a lejos dentro de una misma escena.
- Exportacion y ejecucion en dispositivos moviles y de borde mediante el CLI de Qualcomm AI Hub Models y el runtime Qualcomm AI Engine Direct.
- Evaluacion y perfilado en dispositivos Snapdragon alojados en la nube a traves de Qualcomm AI Hub Workbench.
- Generacion de texto: no soportada (no es un modelo de lenguaje).
- Razonamiento, codigo, matematicas: no soportados.
- Tool calling / function calling: no soportado.
- Soporte de agentes y multi-step reasoning: no soportado.
- Capacidades multilingues: no aplicables.
- Vision: si, limitada a estimacion de profundidad. No hay deteccion de objetos, segmentacion semantica ni captioning en la informacion disponible.
- Modo thinking, audio: no disponibles.

## Casos de uso

- Efecto bokeh y retrato computacional en aplicaciones moviles: el mapa de profundidad relativa permite separar primer plano y fondo para aplicar desenfoque selectivo. Es adecuado porque el modelo esta preparado para exportarse y ejecutarse en dispositivos Snapdragon mediante Qualcomm AI Engine Direct.
- Realidad aumentada con oclusion: insertar objetos virtuales que queden ocluidos correctamente por elementos reales de la escena. La profundidad por pixel a 384 x 384 px es suficiente para generar una mascara de oclusion aproximada en tiempo de ejecucion.
- Reconstruccion 3D y generacion de nubes de puntos: la salida de profundidad inversa se puede reproyectar con la matriz intrinseca de la camara para obtener una nube de puntos densa. Requiere fijar manualmente la escala, ya que la profundidad es relativa.
- Preprocesado para modelos generativos de imagen: los mapas de profundidad se usan habitualmente como condicionamiento (por ejemplo en pipelines de difusion tipo ControlNet-depth), y este modelo es una fuente ligera de ese condicionamiento.
- Robotica movil y evasion de obstaculos: un mapa de profundidad relativa permite detectar la estructura de la escena y jerarquizar distancias sin necesidad de un sensor LiDAR. Es adecuado para plataformas con computo limitado por su tamano de 122M de parametros.
- Ayudas a la navegacion para personas con discapacidad visual: la profundidad relativa por regiones de la imagen se puede traducir en avisos sonoros o hapticos de proximidad de obstaculos, ejecutados en el propio telefono.
- Postproduccion de video y VFX: generar mapas de profundidad por fotograma para desenfoques de profundidad, cambios de plano de enfoque o separacion de capas en edicion.
- Automocion y ADAS de bajo coste: estimacion de profundidad relativa como senal auxiliar de percepcion. No sustituye a un sensor metrico calibrado, dado que la salida no esta en unidades fisicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de evaluacion, y los resultados de busqueda consultados no aportan cifras concretas de metricas de profundidad (como AbsRel, RMSE o delta1) para este empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia: las cifras siguientes son estimaciones aritmeticas derivadas del numero de parametros (~122M) y no datos publicados. En fp32, aproximadamente 488 MB solo de pesos; en fp16, aproximadamente 244 MB; en int8, aproximadamente 122 MB. Hay que sumar el consumo de activaciones, que depende del tamano de lote y de la resolucion.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM libre es suficiente en fp16 para inferencia con lotes pequenos. No se dispone de recomendaciones especificas del autor.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (por ejemplo, series RTX 30 y 40). Tambien puede ejecutarse en CPU, con mayor latencia.
- Despliegue en el borde: el proposito principal de esta receta es la ejecucion en dispositivos con SoC Snapdragon, usando Qualcomm AI Hub Workbench para compilar, perfilar y evaluar en hardware alojado.
- Opciones de despliegue: PyTorch nativo, CLI de Qualcomm AI Hub Models (`qai-hub-models demo dpt_hybrid_midas`, `qai-hub-models export dpt_hybrid_midas`), TensorFlow Lite, ONNX Runtime y Qualcomm AI Engine Direct.
- vLLM, llama.cpp, Ollama y TGI no aplican: son entornos orientados a modelos de lenguaje y este es un modelo de vision.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| ashwmurt/dpt-hybrid-midas (este repositorio) | ~122M | 384 x 384 | apache-2.0 | Receta en HuggingFace; requiere el CLI de Qualcomm AI Hub Models para el flujo de despliegue |
| Intel/dpt-hybrid-midas (checkpoint original envuelto) | ~122M | 384 x 384 | apache-2.0 | Disponible en HuggingFace |
| Otras variantes DPT del mismo articulo (por ejemplo, la version basada en ViT-Large) | no disponible | no disponible | no disponible | no disponible |
| MiDaS v2.1 | no disponible | no disponible | no disponible | no disponible |
| Alternativas mas recientes de estimacion de profundidad monocular | no disponible | no disponible | no disponible | no disponible |

Comparativa con modelos de lenguaje: no aplicable, la tarea es distinta.

## Limitaciones y advertencias

- La salida es profundidad inversa relativa, no distancia metrica. La escala y el desplazamiento globales son desconocidos, por lo que el modelo no puede usarse para medir distancias sin calibracion externa.
- Alucinacion en el sentido de artefactos: pueden aparecer bordes de profundidad espurios o transiciones incorrectas en superficies transparentes, reflectantes, con texturas repetitivas o con iluminacion muy plana.
- Sesgos de dominio: el entrenamiento sobre MIX-6 (aproximadamente 1,4 millones de imagenes) condiciona el comportamiento del modelo hacia las distribuciones de esos conjuntos de datos. El rendimiento en dominios muy alejados (imagen medica, microscopia, escenas nocturnas extremas) es incierto.
- Resolucion fija de 384 x 384 px: el detalle de profundidad en escenas con objetos finos o muy lejanos queda limitado por esa resolucion.
- Sin capacidades de lenguaje: no procesa texto, no responde a instrucciones y no soporta tool calling ni flujos de agentes.
- Licencia: el repositorio declara apache-2.0, lo que permite uso comercial. Conviene verificar de forma independiente la licencia del checkpoint original de Intel y la de la implementacion de referencia en `isl-org/DPT`, ya que la model card enlaza a la licencia del repositorio de transformers de HuggingFace como licencia de la implementacion original.
- Madurez del repositorio: 0 descargas, 0 likes y una unica contribucion registrada. No hay evidencia publica de uso en produccion ni de validacion por terceros.
- Dependencia de herramienta: el flujo de despliegue en dispositivo exige `qai-hub-models`, Python entre 3.10 y 3.14 inclusive, una cuenta de Qualcomm ID y un token de API de Qualcomm AI Hub Workbench.
- El autor del repositorio es `ashwmurt`, no Intel ni Qualcomm; se trata de una receta de terceros que envuelve un checkpoint ajeno.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ashwmurt/dpt-hybrid-midas
- Repositorio alternativo con guion bajo: https://huggingface.co/ashwmurt/dpt_hybrid_midas
- Arbol de ficheros del repositorio: https://huggingface.co/ashwmurt/dpt_hybrid_midas/tree/main
- Checkpoint original: https://huggingface.co/Intel/dpt-hybrid-midas
- Articulo: Vision Transformers for Dense Prediction: https://arxiv.org/abs/2103.13413
- Implementacion de referencia: https://github.com/isl-org/DPT
- Qualcomm AI Hub Models: https://github.com/quic/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Documentacion de Workbench: https://workbench.aihub.qualcomm.com/docs/
- Comunidad Slack de AI Hub: https://aihub.qualcomm.com/community/slack
- Contacto de soporte: mailto:ai-hub-support@qti.qualcomm.com
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/dpt-hybrid-midas-intel
- Ficha en ModelScope: https://www.modelscope.cn/models/Intel/dpt-hybrid-midas
- Ficha en Inferix: https://inferix.co/models/Intel/dpt-hybrid-midas
