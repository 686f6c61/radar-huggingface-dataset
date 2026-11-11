# MaxiWb/glaciolens-glb-v1

## Resumen

GlacioLens-GLB-v1 es un modelo de segmentación semántica especializado en la detección de lagos glaciares a partir de imágenes de teledetección ópticas y SAR, combinadas con datos de elevación físicos. Lo desarrolla MaxiWb (con Ali Sajedifar como mantenedor del repositorio de código asociado) y se construye mediante fine-tuning del modelo fundacional geoespacial TerraMind-1.0-large de IBM y la ESA, al que se añade una cabeza UPerNet y una rama espacial residual aprendida. El resultado es un checkpoint de aproximadamente 319,5 millones de parámetros entrenables (de los cuales 57.249 pertenecen a la ruta espacial) que resuelve una tarea muy concreta: la delimitación pixel a pixel de masas de agua glaciar en rasters nativos de 11 bandas y 256×256 píxeles.

El modelo es relevante porque aplica un modelo fundacional multimodal de observación de la Tierra a un problema de seguimiento climático concreto, y porque publica de forma explícita la procedencia del checkpoint (hashes SHA256, receta de entrenamiento, identidad del modelo) y los resultados medidos sobre poblaciones de validación y test bien definidas. No obstante, se trata de un artefacto de investigación con un alcance de uso estrecho: no ofrece interfaz `AutoModel` de Transformers, no dispone de widget de inferencia RGB estándar y requiere un pipeline propio (CLI `glacial-lake` / import `glacial_lake`) con una pila científica concreta.

La versión publicada corresponde al checkpoint de inferencia seleccionado P56 EMA12 en el paso 11.484, entrenado con la semilla 234 durante 24 épocas (22.968 actualizaciones), con procedencia nativa P56-native-r1. El repositorio ocupa 1,3 GB y el fichero de pesos `glaciolens-glb-v1.ckpt` tiene 1.280.672.641 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TerraMind-1.0-large (encoder fundacional geoespacial) + cabeza UPerNet + rama espacial residual aprendida |
| Parametros totales | 319.492.514 parametros entrenables (incluye 57.249 en la ruta espacial) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 11 bandas y 256×256 pixeles por raster |
| Tipos de cuantizacion | no disponible; ejecucion registrada en FP32 para parametros y BF16 en forwards CUDA |
| Idiomas soportados | en (etiquetado del repositorio); la tarea es de segmentacion, no linguistica |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint PyTorch (`.ckpt`), 1.280.672.641 bytes, SHA256 `19bcdaa9f925da61ecc46aab755b265960c632aacdec582bd3050a6b84bd4230` |

## Arquitectura y entrenamiento

El modelo combina un encoder TerraMind-1.0-large (modelo fundacional geoespacial de IBM y la ESA) con una cabeza de segmentacion UPerNet y una rama espacial residual aprendida que incorpora informacion de elevacion fisica. La entrada son rasters nativos de 11 bandas a 256×256: los slots basados en cero 0, 1, 2, 3, 4, 5, 9 y 10 aportan seis canales opticos y dos canales SAR almacenados (los slots SAR no estan verificados fisicamente como VV/VH). La normalizacion usa estadisticas congeladas de TRAIN sobre el dominio de valores almacenados. Ademas, se inyecta un DEM fisico Copernicus GLO-30 DSM (EGM2008) alineado bilinealmente a la rejilla nativa, normalizado en float64 mediante `(metros - 651.663) / 928.168` y convertido a float32; el DEM entra tanto en el encoder como en la rama espacial.

El entrenamiento se realizo con la semilla 234 durante 24 epocas y 22.968 actualizaciones. La seleccion del checkpoint se hizo sobre la poblacion VAL1912 completa en las epocas EMA 3 a 24, aplicando un criterio estricto de mejora del mIoU agrupado de dos clases, con desempate por la aparicion mas temprana exacta; la seleccion se cerro antes de evaluar TEST1913 y despues GLBC1105. La receta y la identidad del modelo estan publicadas en el repositorio. La ejecucion registrada usa parametros FP32, forwards en BF16 sobre CUDA y umbral `logit >= 0` para la clase lago. No se ha realizado conversion ni reserializacion de tensores para la entrega del checkpoint.

## Capacidades

- Segmentacion semantica binaria de lagos glaciares sobre imagenes opticas y SAR combinadas con elevacion fisica.
- Fusion multimodal de entrada: seis canales opticos, dos canales SAR almacenados y un DEM Copernicus GLO-30 DSM.
- Procesamiento por pares fisicos: las filas consecutivas del manifiesto forman pares fisicos, con un unico elemento final impar permitido.
- Inferencia por lotes mediante CLI (`glacial-lake predict`) y API Python (`glacial_lake`).
- Validacion previa de recursos congelados, geometria del manifiesto y del raster, soporte completo y rutas de salida antes de construir el predictor.
- No dispone de interfaz `AutoModel` de Transformers ni de widget de inferencia RGB estandar.
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas o de vision general.

## Casos de uso

- Inventario de lagos glaciares a escala regional: procesar manifiestos de rasters nativos de 11 bandas y obtener mascaras binarias de lago por pixel, aprovechando la fusion optico/SAR/DEM para escenas con cobertura nubosa parcial.
- Seguimiento climatico de masas de agua proglaciares: comparar mascaras generadas sobre adquisiciones de distintas fechas para estimar variaciones de extension, siempre que las condiciones de entrada cumplan el contrato nativo (11 bandas, 256×256, soporte completo).
- Apoyo a estudios de riesgo de inundacion por desbordamiento de lagos glaciares (GLOF): generar capas de extension de lago que alimenten modelos hidrologicos o de simulacion de rotura.
- Validacion cruzada de productos cartograficos existentes: usar las predicciones como capa de contraste frente a inventarios manuales o semiautomaticos en cohortes de test comparables.
- Investigacion en modelos fundacionales geoespaciales: servir de referencia reproducible (checkpoint con hashes y receta publicados) para estudiar el efecto del fine-tuning de TerraMind en tareas de segmentacion con DEM.
- Prototipado en entornos de investigacion con GPU CUDA: ejecutar el pipeline oficial sobre lotes de escenas y medir el rendimiento frente a las cifras publicadas de TEST y GLBC.

## Benchmarks y rendimiento

Resultados medidos publicados en la model card. Las cifras son mIoU agrupado sobre pixeles validos (no medias por imagen ni puntuaciones de coincidencia de objetos):

| Poblacion | Imagenes / observaciones | mIoU dos clases (%) | IoU lago (%) |
|---|---:|---:|---:|
| Seleccion VAL | 1.912 | 88,5900 | 78,2600 |
| TEST | 1.913 | 87,8373 | 76,7644 |
| Cohorte de estres GLBC (dependiente) | 1.105 | 83,7493 | 69,0553 |

Comparacion escalar externa publicada: +3,8673 puntos porcentuales sobre el 83,97 % del score de TerraMind adaptado a la tarea en el articulo de referencia. Esta comparacion no esta emparejada, incluye DEM adicional y una receta completa distinta, por lo que no constituye una comparacion controlada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint pesa 1,3 GB y la ejecucion registrada usa FP32 en parametros y BF16 en forwards CUDA, por lo que se requiere una GPU CUDA con memoria suficiente para el modelo y los lotes de rasters de 256×256.
- GPU recomendadas: no disponible; la model card solo califica la ejecucion en CUDA con BF16.
- Cabe en GPU de consumo: no confirmado; no se documentan pruebas en RTX 4090 ni en otras GPU de consumo.
- Opciones de despliegue: exclusivamente el CLI/API propio del proyecto (`glacial-lake`, import `glacial_lake`) con la pila cientifica registrada. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Otros dispositivos, contextos de lote, sensores, tamanos, entradas incompletas y transferencia geografica arbitraria quedan sin calificar segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlacioLens-GLB-v1 | 319,5 M entrenables | 11 bandas, 256×256 + DEM | TEST mIoU dos clases 87,84 %; IoU lago 76,76 % | apache-2.0 | Hugging Face (checkpoint `.ckpt`) |
| TerraMind-1.0-large (base) | no disponible | modelo fundacional geoespacial multimodal | 83,97 % en la tarea adaptada segun el articulo citado (comparacion no emparejada) | no disponible en la informacion proporcionada | Hugging Face (`ibm-esa-geospatial/TerraMind-1.0-large`) |
| Alternativas especificas de segmentacion de lagos glaciares | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Un unico seed final, exposicion historica a TEST, adquisiciones y alias compartidos y observaciones GLBC dependientes limitan cualquier afirmacion de generalizacion geografica independiente.
- El plan suplementario fijo se compartio con el desarrollo, y los intervalos internos de incertidumbre por pares incluyen cero.
- P56 retrocede frente a los historicos P53/P54 en 0,6537 puntos porcentuales de mIoU dos clases en TEST y 1,6944 puntos en GLBC.
- Las ganancias en objetos pequenos coexisten con un exceso de area de falsos positivos en TEST y con perdidas de extension de verdaderos positivos grandes y de borde en GLBC.
- Contrato de entrada estricto: 11 bandas, 256×256, soporte valido real en cada pixel de imagen y DEM, y mascara de usabilidad igual a 1 en todas partes. La cobertura incompleta se rechaza; el relleno con ceros del entrenamiento no cualifica para inferencia con datos ausentes.
- Los slots SAR no estan verificados fisicamente como VV/VH.
- No hay interfaz `AutoModel` ni widget RGB estandar; la integracion requiere el pipeline propio y la pila cientifica registrada.
- No se documentan sesgos demograficos ni linguisticos por tratarse de una tarea de segmentacion geoespacial, pero no se han publicado analisis de sesgo geografico o de sensor.
- Riesgo de alucinacion en sentido generativo no aplica; el riesgo equivalente es la produccion de mascaras erroneas fuera de las condiciones calificadas (otros sensores, tamanos, dispositivos o regiones).
- Licencia apache-2.0: permite uso comercial, pero el autor no califica el rendimiento fuera del contrato de inferencia registrado, por lo que un uso en produccion exige validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaxiWb/glaciolens-glb-v1
- Descarga directa del checkpoint (revision inmutable): https://huggingface.co/MaxiWb/glaciolens-glb-v1/resolve/bc65beeff3604d51e2242cb51536d5b51ff702f3/glaciolens-glb-v1.ckpt
- Repositorio de codigo: https://github.com/AliSajedifar/GlacioLens
- Receta de entrenamiento: https://github.com/AliSajedifar/GlacioLens/blob/86cfeb6771cc248929ec83505de6c0e7c4d27a46/configs/p56_recipe.json
- Identidad del modelo: https://github.com/AliSajedifar/GlacioLens/blob/86cfeb6771cc248929ec83505de6c0e7c4d27a46/results/model_identity.json
- Guia de inferencia nativa: https://github.com/AliSajedifar/GlacioLens/blob/86cfeb6771cc248929ec83505de6c0e7c4d27a46/docs/inference.md
- Preparacion de entradas sin objetivos: https://github.com/AliSajedifar/GlacioLens/blob/86cfeb6771cc248929ec83505de6c0e7c4d27a46/docs/reproduction.md#target-free-inference-files
- Guia de reproduccion: https://github.com/AliSajedifar/GlacioLens/blob/86cfeb6771cc248929ec83505de6c0e7c4d27a46/docs/reproduction.md
- Quickstart en CPU: https://github.com/AliSajedifar/GlacioLens/blob/86cfeb6771cc248929ec83505de6c0e7c4d27a46/docs/quickstart.md
- Resultados y definiciones: https://github.com/AliSajedifar/GlacioLens/blob/86cfeb6771cc248929ec83505de6c0e7c4d27a46/docs/results.md
- Modelo base TerraMind-1.0-large: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-large
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
