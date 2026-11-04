# AbdelrahmanU3/deepforest_UNet_OAM

## Resumen

deepforest_UNet_OAM es un modelo de segmentación semántica de copas de árboles diseñado para trabajar sobre imágenes aéreas RGB servidas como teselas de OpenAerialMap. Lo desarrolla AbdelrahmanU3 y se apoya en el detector DeepForest de Weecology: reutiliza el cuerpo ResNet-50 del modelo `weecology/deepforest-tree` en su variante `NEON_OAM` (el detector NEON afinado por HOT con imágenes de OpenAerialMap) como codificador, y añade un decodificador U-Net entrenado específicamente para la tarea. El modelo clasifica cada píxel de una tesela aérea como copa de árbol o fondo, y su salida se convierte en polígonos GeoJSON mediante la librería auxiliar `ts-hot`.

La relevancia del modelo está en su encaje en la plataforma fAIr de HOT (Humanitarian OpenStreetMap Team), orientada a la cartografía asistida de arbolado con datos abiertos. Frente a un detector de cajas, la segmentación semántica permite obtener la geometría de la copa, lo que resulta útil para inventarios de arbolado urbano y rural a partir de vuelos con dron o imágenes aéreas de OAM. El modelo se distribuye en ONNX (130 MB) con altura y anchura dinámicas, lo que permite alimentar teselas de distintos tamaños sin recortes ni padding.

Con 32,5 millones de parámetros, el modelo es ligero y ejecutable en CPU mediante ONNX Runtime. La model card es inusualmente transparente sobre el rendimiento: advierte de que la puntuación en test es muy inferior a la de validación, y atribuye la mayor parte de esa brecha a etiquetas ausentes en el conjunto de datos más que a un cambio en el tipo de imagen. No hay datos publicados sobre licencia ni sobre idiomas, ya que la tarea no es lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con codificador ResNet-50 (stem y layer1-layer4) y decodificador de cinco bloques de upsampling (256, 128, 64, 32, 16 canales) |
| Parametros totales | 32,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de altura y anchura dinámicas, con el lado mayor limitado a 1024 px en el preprocesado recomendado |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX float32 y pesos PyTorch float32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`NEON_OAM_UNET.onnx`, 130 MB) y PyTorch state dict (`NEON_OAM_UNET.pt`, 130 MB) |

## Arquitectura y entrenamiento

El modelo es una U-Net clásica con codificador convolucional. El codificador es el cuerpo ResNet-50 del detector DeepForest en su variante `NEON_OAM`, con strides de 2 a 32 en los bloques `stem` y `layer1` a `layer4`, cargado desde los pesos `backbone.body.*`. El decodificador es nuevo: cinco bloques de upsampling con 256, 128, 64, 32 y 16 canales que hacen upsampling al tamaño de las features de skip correspondientes y aplican dos convoluciones 3x3 con BatchNorm; una convolución 1x1 final produce el logit. La normalización ImageNet y la sigmoide están dentro del grafo ONNX, de modo que la entrada es directamente RGB en [0, 1].

El entrenamiento parte del codificador `NEON_OAM` con el decodificador inicializado aleatoriamente. El codificador se congela salvo `layer4`, que se entrena a una décima parte de la tasa de aprendizaje; las capas BatchNorm nunca se entrenan. Se usa AdamW con learning rate 1e-3, weight decay 1e-4 y schedule coseno por batch. Los datos son el dataset Guru trees (`hotosm/fAIr-guru-td-trees`): teselas de OpenAerialMap a zoom 20 con etiquetas derivadas de OpenStreetMap, con 38.705 chips de entrenamiento, 4.158 de validación y 5.627 de test según el split espacial propio del dataset (ningún chip aparece en dos splits). Las etiquetas se construyen a partir de GeoJSON: los polígonos `tree_group` se rellenan como árbol, los puntos `natural=tree` se convierten en un disco del diámetro de copa indicado en `diameter_crown`, y los puntos sin diámetro usable se convierten en un disco de 5 m marcado como ignorado (ni premia ni penaliza). La máscara de árbol prevalece sobre la de ignorado. La construcción de máscaras se validó contra una construcción independiente basada en las matemáticas de teselas del dataset, con un IoU de árbol de 0,997 a 0,998 en 300 chips por split.

La innovación práctica está en el preprocesado dependiente del zoom: la escala de entrada se calcula como el tamaño de píxel real de la tesela dividido por 0,05 m (el GSD con el que se entrenó el codificador), con un tope para que el lado mayor no supere 1024 px. Una tesela de 256 px a zoom 20 se reescala por 2,95 hasta 756x756. La model card señala que alimentar el modelo a resolución original encuentra muchas menos copas, por lo que esta regla de escala es el aspecto más crítico del uso del modelo. El modelo acepta altura y anchura arbitrarias y devuelve un mapa del mismo tamaño; la paridad entre ONNX y PyTorch se comprobó en 200 chips de validación y 200 de test, con una diferencia máxima de probabilidad por píxel de 0,005 y 0,011 respectivamente, diferencia media de 1e-5 a 2e-5 e IoU de píxel a umbral 0,3 coincidente hasta 1e-4.

## Capacidades

- Segmentación semántica binaria por píxel: clasifica cada píxel de una tesela aérea RGB como copa de árbol o fondo.
- Entrada RGB de tres bandas en uint8 0-255 leída como float 0-1, con normalización ImageNet y sigmoide integradas en el grafo ONNX.
- Altura y anchura de entrada dinámicas, sin padding ni recorte; se ha verificado a 756x756, 768x768 y varios tamaños pequeños.
- Salida de probabilidad por píxel en [0, 1] (`probability`), que permite elegir umbral según el caso de uso; el umbral 0,3 se seleccionó en validación.
- Conversión a polígonos GeoJSON (umbral, trazado, eliminación de polígonos pequeños, simplificación y georreferenciación a EPSG:4326) mediante la librería `ts_hot.predict_session`.
- Ejecución en CPU con ONNX Runtime, sin necesidad de GPU.
- Pesos PyTorch (`TreeUNet` state dict) disponibles para reentrenamiento con la librería `ts-hot`.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni capacidades multilingües; es un modelo específico de segmentación de copas.

## Casos de uso

- Cartografía de arbolado urbano en OpenStreetMap: procesar teselas de OpenAerialMap a zoom 20, aplicar la regla de escala y convertir las probabilidades en polígonos con `ts_hot.predict_session` para importarlos como geometrías de copa en OSM o en fAIr. El modelo está entrenado exactamente con ese tipo de imagen y ese esquema de etiquetado.
- Inventario de arbolado a partir de vuelos con dron: si se conoce el GSD del vuelo, se reescala cada ortomosaico a 0,05 m por píxel (con el tope de 1024 px) y se obtiene una máscara de copas que se puede vectorizar para calcular superficie de copa por parcela.
- Asistencia a la digitalización humana en fAIr: usar el modelo como propuesta automática de polígonos que un voluntario revisa y corrige, reduciendo el tiempo de trazado manual en zonas con arbolado denso o disperso.
- Seguimiento temporal de cobertura arbórea: comparar las máscaras de dos vuelos de la misma zona para estimar pérdida o ganancia de copa, siempre con revisión humana por la brecha entre validación y test documentada por el autor.
- Generación de capas auxiliares para modelos de riesgo: mapas de densidad de copa que alimenten estudios de isla de calor, escorrentía o riesgo de caída de ramas en entornos urbanos, a partir de imágenes aéreas abiertas.
- Preetiquetado para entrenar otros modelos: usar las máscaras como pseudoetiquetas para aumentar el conjunto de entrenamiento de detectores o segmentadores de arbolado, filtrando por umbral y por área mínima de polígono.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con ONNX Runtime y pesar 130 MB, puede integrarse en servicios ligeros o en el propio flujo de fAIr sin infraestructura de aceleración.

## Benchmarks y rendimiento

La model card incluye métricas de validación y test con barridos de umbral, pero no se han transcrito en la información disponible los valores numéricos concretos de IoU, precisión o recall. El autor advierte explícitamente de que la puntuación en test es muy inferior a la de validación y atribuye la mayor parte de esa diferencia a etiquetas ausentes en el dataset, no a un cambio en el tipo de imagen. Se documenta únicamente la comprobación de paridad ONNX-PyTorch:

| Comprobacion | Validacion | Test |
|---|---|---|
| Diferencia maxima de probabilidad por pixel (ONNX vs PyTorch) | 0,005 | 0,011 |
| Diferencia media de probabilidad | ~1e-5 a 2e-5 | ~1e-5 a 2e-5 |
| Coincidencia de IoU de pixel a umbral 0,3 | 1e-4 | 1e-4 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el despliegue recomendado, que es CPU con ONNX Runtime; en GPU, el modelo de 130 MB en float32 ocupa del orden de unos pocos cientos de MB incluyendo activaciones para entradas de hasta 1024x1024, aunque no se ha publicado una medición.
- GPU recomendadas: no disponible; el autor no publica requisitos de GPU. Cualquier GPU consumer con soporte de ONNX Runtime o PyTorch debería poder ejecutarlo por su tamaño reducido.
- Cabe en GPU consumer: sí, por tamaño (32,5 millones de parámetros, 130 MB de pesos), aunque no hay cifras publicadas de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), PyTorch con la librería `ts-hot` para reentrenamiento o inferencia, y la librería `ts-hot` para el flujo completo de imagen a GeoJSON.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepforest_UNet_OAM | U-Net con encoder ResNet-50 (DeepForest NEON_OAM) | 32,5 M | Teselas RGB de tamaño dinamico, lado mayor hasta 1024 px en el preprocesado recomendado | no disponible | ONNX y PyTorch en HuggingFace |
| weecology/deepforest-tree | Detector de objetos (cajas) basado en DeepForest | no disponible | Imagenes aereas RGB | no disponible | HuggingFace |
| Modelos de segmentacion de copas de arbolado de proposito general | Segmentacion semantica | no disponible | no disponible | no disponible | no disponible |

La comparación con `weecology/deepforest-tree` es la más directa: este modelo reutiliza su codificador y añade segmentación por píxel, lo que permite obtener geometría de copa en lugar de cajas delimitadoras. No se dispone en la información proporcionada de otros modelos comparables de segmentación de copas con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Brecha entre validación y test: el autor documenta que la puntuación en test es mucho menor que en validación y la atribuye principalmente a etiquetas ausentes en el dataset; las métricas de test deben leerse con cautela y no como rendimiento esperado en producción.
- Dependencia crítica de la escala: alimentar el modelo con teselas a su resolución original encuentra muchas menos copas. Es obligatorio aplicar la regla de escala basada en el zoom y la latitud (GSD de la tesela dividido por 0,05 m, con tope de 1024 px).
- Entrenado solo con imágenes de OpenAerialMap a zoom 20 y etiquetas de OpenStreetMap: el dominio de aplicación es ese; no hay evidencia publicada de generalización a otras fuentes, resoluciones o sensores.
- Sesgos de etiquetado: las etiquetas provienen de OSM, con cobertura desigual y posibles omisiones; los puntos sin diámetro de copa se marcan como ignorados con un disco de 5 m, lo que puede dejar zonas sin supervisión.
- Riesgo de falsos negativos y positivos en copas pequeñas, densas o parcialmente ocluidas; no se han publicado métricas desagregadas por tipo de arbolado o densidad.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia antes de integrarlo en producción.
- El modelo no proporciona identificadores de instancia: la salida es una máscara semántica, no una segmentación de instancias; la separación de copas individuales depende del postprocesado de polígonos.
- No se ha probado el padding a múltiplos de 32 con recorte posterior, según indica el propio autor.
- No dispone de capacidades de texto, tool calling ni agentes; cualquier uso fuera de la segmentación de copas queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbdelrahmanU3/deepforest_UNet_OAM
- Modelo base: https://huggingface.co/weecology/deepforest-tree
- Dataset de entrenamiento: https://huggingface.co/datasets/hotosm/fAIr-guru-td-trees
- Plataforma fAIr de HOT: no disponible en la información proporcionada
- Librería `ts-hot`: no disponible en la información proporcionada
- Repositorio DeepForest: no disponible en la información proporcionada
