# aeolusguan/dispvit-plus-vitg

## Resumen

DispViT+ ViT-G es un modelo de estimacion de disparidad estereo (stereo matching) publicado por Tongfan Guan y colaboradores, presentado en el paper "DispViT: Direct Stereo Disparity Regression with a Single-Stream Vision Transformer" aceptado en ICLR 2026. A diferencia de los enfoques clasicos de matching estereo basados en cost volumes 3D y agregacion costosa, DispViT plantea la regresion directa de disparidad mediante un unico transformer de vision, eliminando la construccion explicita de volumen de coste.

El checkpoint publicado en HuggingFace integra el regresor DispViT ViT-G congelado, un extractor de caracteristicas ConvNeXt de 256 canales y todos los pesos aprendidos de refinamiento (6 bloques, embeddings de 256 dimensiones, atencion de 4 cabezas con ventana de tamano 6). El modelo totaliza 1.282.170.176 parametros y se distribuye como un unico fichero `model_final.pt` serializado en PyTorch, con un tamano de repositorio de 5,1 GB.

La relevancia del modelo reside en su propuesta metodologica: sustituir el pipeline tradicional de matching estereo por una arquitectura transformer de una sola corriente que predice el mapa de disparidad de forma directa. El checkpoint esta pensado para inferencia con imagenes rectificadas izquierda/derecha y devuelve la disparidad final en pixeles a la resolucion original de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DispViT ViT-G (regresor) + ConvNeXt (extractor de caracteristicas) + modulo de refinamiento de 6 bloques |
| Parametros totales | 1.282.170.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch serializado (`model_final.pt`, cargado con `weights_only=True`) |

## Arquitectura y entrenamiento

DispViT+ combina tres componentes: un extractor de caracteristicas ConvNeXt con 256 canales de salida, un regresor DispViT ViT-G con 8 grupos de canales y un modulo de refinamiento compuesto por 6 bloques con embeddings de 256 dimensiones y atencion de 4 cabezas con ventana de tamano 6. La propuesta central del paper es la regresion directa de disparidad mediante un transformer de una sola corriente, evitando la construccion de cost volumes 3D tipica de arquitecturas como RAFT-Stereo o CREStereo. El checkpoint contiene los pesos finales del modelo completo ("raw final model state"), y su `model_config` embebido permite reconstruir la arquitectura completa mediante `DispViTPlus.from_pretrained`.

No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se emplearon tecnicas de RLHF, DPO u otras fases de alineacion (no aplicables en un modelo de vision de este tipo). Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la ventana de atencion de tamano 6 mencionada en la tabla de arquitectura.

## Capacidades

- Estimacion de disparidad estereo densa a partir de un par de imagenes RGB rectificadas izquierda/derecha.
- Regresion directa de disparidad en pixeles, sin post-procesado de cost volume.
- Extraccion de caracteristicas visuales mediante backbone ConvNeXt integrado.
- Refinamiento de la prediccion de disparidad mediante 6 bloques dedicados.
- Manejo interno de padding: acepta imagenes de dimensiones arbitrarias y devuelve la disparidad a la resolucion original.
- Procesamiento por lotes (`[B, 3, H, W]`) con valores de pixel en `[0, 255]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente de vision).
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Reconstruccion 3D y nubes de puntos: la disparidad densa producida por el modelo se puede triangular con los parametros intrinsecos y extrinsecos de la camara estereo para generar mapas de profundidad y nubes de puntos en pipelines de fotogrametria o escaneo 3D.
- Robotica y navegacion autonoma: la prediccion directa de disparidad permite estimar profundidad en tiempo real desde un par estereo, util para evitacion de obstaculos y planificacion de trayectorias en plataformas moviles.
- Vehiculos autonomos y ADAS: el modelo puede alimentar modulos de percepcion que requieren mapas de profundidad densos a partir de camaras estereo calibradas, sin depender de LiDAR.
- Realidad aumentada y mixta: la estimacion de profundidad por pixel permite oclusion correcta y anclaje de objetos virtuales sobre escenas reales capturadas con camaras estereo.
- Inspeccion industrial y metrologia: la disparidad subpixel (si el refinamiento lo permite) se puede usar para medir dimensiones y detectar defectos en lineas de fabricacion con configuraciones estereo calibradas.
- Investigacion en vision por computador: el checkpoint sirve como baseline reproducible para comparar metodos de matching estereo basados en transformers frente a enfoques con cost volume, dado que el paper se presenta en ICLR 2026.
- Procesamiento de video estereo: al ser un modelo de una sola pasada y sin cost volume, es adecuado para procesar secuencias de pares estereo en pipelines de video, siempre que se gestione el throughput en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 5,1 GB en precision original (probablemente fp32). En fp32 se necesitarian aproximadamente 5-6 GB solo para los pesos, mas memoria para activaciones; en fp16/bf16 se reduciria a unos 2,5-3 GB de pesos, aunque no se documenta soporte oficial de estas precisiones.
- GPU recomendadas: no disponible en la documentacion. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100, H100) permite inferencia comoda; GPUs consumer de 8-12 GB podrian ser suficientes en fp16 para resoluciones moderadas.
- Cabe en GPU consumer: probablemente si en RTX 3090/4090 (24 GB) y posiblemente en RTX 4070/4080 (12-16 GB) con precision reducida, aunque no se confirma oficialmente.
- Opciones de despliegue: el modelo requiere el repositorio `dispvit` de GitHub y su API `DispViTPlus.from_pretrained`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DispViT+ ViT-G | 1.282.170.176 | Regresion directa con ViT de una sola corriente | Par estereo RGB rectificado | Apache 2.0 | HuggingFace (este repo) |
| RAFT-Stereo | no disponible | Cost volume + GRU iterativo | Par estereo RGB | no disponible | Repositorio de investigacion |
| CREStereo | no disponible | Cost volume jerarquico + cascada | Par estereo RGB | no disponible | Repositorio de investigacion |
| STTR | no disponible | Transformer con matching denso | Par estereo RGB | no disponible | Repositorio de investigacion |

Nota: los datos de los modelos comparables no se han verificado en la informacion proporcionada; se indican como referencia cualitativa de la categoria y deben confirmarse en sus respectivas fuentes.

## Limitaciones y advertencias

- Requiere imagenes estereo rectificadas y calibradas; no funciona con pares no rectificados sin preprocesado.
- El modelo esta disenado exclusivamente para estimacion de disparidad; no genera texto, no razona y no soporta interaccion conversacional.
- No se documentan sesgos especificos, pero al ser un modelo de vision entrenado con datasets de escenas estereo, puede degradarse en dominios visuales alejados de la distribucion de entrenamiento (iluminacion extrema, superficies sin textura, oclusiones).
- Riesgo de alucinacion en regiones sin textura o con correspondencias ambiguas: la regresion directa puede producir disparidades suaves o incorrectas donde no hay informacion visual suficiente.
- No se especifican limitaciones de resolucion maxima ni de rango de disparidad en la documentacion.
- La licencia Apache 2.0 permite uso comercial, pero el checkpoint incluye componentes de terceros (ConvNeXt) cuyos avisos de copyright y terminos deben conservarse segun el fichero NOTICE.
- La API de carga depende del repositorio `dispvit` de GitHub y de sus dependencias documentadas; no hay integracion con ecosistemas estandar de despliegue.
- El modelo fue creado en 2026-10-30 y actualizado el mismo dia; tiene 0 descargas y 1 like, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/aeolusguan/dispvit-plus-vitg
- Paper (OpenReview, ICLR 2026): https://openreview.net/forum?id=c21yqwf02V
- Repositorio GitHub: https://github.com/aeolusguan/DispViT
