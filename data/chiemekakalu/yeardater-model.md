# chiemekakalu/yeardater-model

## Resumen

yeardater (v6) es un modelo de clasificacion de imagenes desarrollado por Chiemeka Kalu que estima el ano en que fue tomada una fotografia, en el rango 1930-2026, devolviendo una distribucion de probabilidad sobre 97 bins anuales. El modelo parte del vision tower de `openai/clip-vit-base-patch16` a 224 px, afinado con una cabeza de clasificacion propia (LayerNorm, Dropout, Linear a 512, GELU, Dropout, Linear a 97 bins) y entrenado con etiquetas suaves gaussianas. Resuelve una tarea de regresion temporal sobre imagenes que no suele abordarse con modelos genericos de vision, y lo hace con una salida probabilistica calibrada que permite extraer tanto una estimacion puntual (mediana) como intervalos de confianza al 80%.

El modelo es relevante para tareas de catalogacion y preservacion digital de archivos fotograficos, donde la fecha de captura no esta disponible en los metadatos EXIF. Con un MAE de 4,41 anos en validacion en color y un 89,7% de predicciones dentro de 10 anos, supera con margen amplio la linea base de adivinar siempre la misma fecha (20,94 anos MAE). El repositorio ocupa 0,3 GB y se distribuye como state_dict de PyTorch (`best.pt`) junto con un `config.json`, no como pesos en safetensors ni GGUF.

La ficha se basa exclusivamente en la model card publicada por el autor; no hay informacion adicional sobre licencia, idiomas o benchmarks externos, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 (vision tower, 224 px) fine-tuned + cabeza MLP (LayerNorm, Dropout 0.1, Linear 512, GELU, Dropout, Linear 97) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea visual, sin salida textual) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state_dict (`best.pt`) + `config.json` |

## Arquitectura y entrenamiento

El modelo reutiliza el vision tower de `openai/clip-vit-base-patch16` a resolucion de 224 px y anade una cabeza de clasificacion: LayerNorm, Dropout 0.1, capa Linear a 512 dimensiones, activacion GELU, Dropout y capa Linear final a 97 bins anuales. La salida es una distribucion de probabilidad sobre anos, no una regresion escalar directa, lo que permite calcular mediana, valor esperado e intervalos percentilicos.

El entrenamiento uso etiquetas suaves gaussianas con sigma 2.0, 5 epocas (con el backbone congelado durante la primera), optimizador AdamW con learning rate 0.001 para la cabeza y 2e-05 para el backbone, batch efectivo 256 y precision bf16. Se aplico aumento de datos en escala de grises con probabilidad 0.3 y se entreno sobre el fichero `manifest_v2.csv`. Los datos proceden de DEW (Muller, Springstein, Ewerth, MMM 2017; DOI 10.22000/43, CC BY 4.0) para 1930-1999, con imagenes descargadas desde sus URLs de Flickr, y de la API de Flickr (timestamps EXIF exactos) para 2000-2026. No se redistribuyen imagenes de entrenamiento.

## Capacidades

- Estimacion del ano de captura de una fotografia en el rango 1930-2026 como distribucion sobre 97 bins.
- Estimacion puntual via mediana de la distribucion (la que muestra la demo) y valor esperado alternativo.
- Intervalo de confianza al 80% a partir de los percentiles 10 y 90 de la distribucion predicha.
- Clasificacion de imagenes (pipeline `image-classification` en Hugging Face).
- Robustez parcial a imagenes en escala de grises (MAE 5,69 frente a 4,41 en color).
- No se documentan capacidades de tool calling, agentes, multilingues ni modos de razonamiento extendido.

## Casos de uso

- Catalogacion de archivos fotograficos historicos: dado un lote de imagenes sin EXIF, el modelo asigna una fecha estimada con intervalo al 80%, permitiendo priorizar revision manual en funcion de la anchura del intervalo.
- Digitalizacion de fondos museisticos y hemerotecas: para copias escaneadas de 1930-1999 procedentes de DEW, el modelo ofrece una estimacion con MAE entre 4,04 y 5,36 anos por decada, util como metadato preliminar.
- Deteccion de imagenes mal etiquetadas: comparar la fecha declarada en EXIF o catalogo con la prediccion del modelo permite marcar discrepancias superiores a 10 anos para revision.
- Investigacion en historia visual y estudios de moda o arquitectura: agregar predicciones sobre corpus de imagenes para estudiar la distribucion temporal de estilos y elementos visuales.
- Filtrado temporal en pipelines de datos: descartar o separar imagenes por epoca estimada antes de alimentar otros modelos de vision o de generar datasets etiquetados por periodo.
- Verificacion de autenticidad y datacion de fotos en contextos forenses o de archivo: la prediccion puede usarse como senal auxiliar (no concluyente) para detectar imagenes modernas disfrazadas de antiguas, dado que el modelo tiende a datarlas como antiguas.
- Demo interactiva y prototipado rapido: el Space publico permite probar el modelo sobre imagenes sueltas sin infraestructura propia.

## Benchmarks y rendimiento

Validacion sobre 14.192 imagenes (5% de los datos, estratificado por ano, con los mismos ids en cada ejecucion). La linea base de adivinar siempre la misma fecha obtiene 20,94 anos MAE.

| Conjunto de validacion | MAE (anos) | Dentro de 5 anos | Dentro de 10 anos |
|---|---|---|---|
| Color | 4,41 | 71,2% | 89,7% |
| Mismas imagenes en escala de grises | 5,69 | 62,2% | 83,7% |

MAE por decada (validacion en color): 1930s 5,36; 1940s 4,48; 1950s 5,05; 1960s 4,47; 1970s 4,04; 1980s 4,10; 1990s 3,40; 2000s 4,28; 2010s 3,69; 2020s 5,91. La mediana de la distribucion obtiene 4,33 anos MAE en validacion en color.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 0,3 GB y el backbone es ViT-B/16, por lo que la inferencia en fp32 o bf16 cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para inferencia en bf16; no se documentan recomendaciones del autor.
- Cabe en GPU consumer: si, dado el tamano del backbone (ViT-B/16) y el peso del repositorio (0,3 GB).
- Opciones de despliegue: al distribuirse como state_dict de PyTorch (`best.pt`) con `config.json`, requiere cargar la clase `model.YearDater` del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (modelos de vision con cabeza custom no encajan directamente en esos runtimes sin conversion).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de estimacion de fecha de captura en la documentacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yeardater (v6) | no disponible (backbone ViT-B/16) | no aplica | MAE 4,41 anos (color val) | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento debil antes de 1960 y sobre copias escaneadas de impresiones fisicas.
- Las fotos modernas estilizadas como antiguas (filtros sepia, blanco y negro) tienden a datarse como antiguas.
- Las fechas de entrenamiento provienen de relojes de camara y de los uploaders, por lo que algunas etiquetas son erroneas.
- La validacion en escala de grises empeora el MAE (5,69 frente a 4,41) y reduce la cobertura dentro de 5 anos (62,2% frente a 71,2%).
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion; contactar al autor antes de uso en produccion.
- El modelo fue construido con un agente de codigo (Claude Code) realizando la mayor parte de la escritura; conviene auditar el codigo y los pesos antes de integrarlos en pipelines criticos.
- No se redistribuyen imagenes de entrenamiento; los datos DEW estan bajo CC BY 4.0 y las imagenes de Flickr bajo sus propias condiciones.
- Salida probabilistica sobre 97 bins: no debe interpretarse como fecha exacta, sino como estimacion con intervalo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chiemekakalu/yeardater-model
- Demo (Space): https://huggingface.co/spaces/chiemekakalu/yeardater
- Dataset DEW (Muller, Springstein, Ewerth, MMM 2017): DOI 10.22000/43 (CC BY 4.0)
- Backbone: https://huggingface.co/openai/clip-vit-base-patch16
