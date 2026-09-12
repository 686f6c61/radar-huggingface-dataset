# Pranilllllll/geonusaf-segformer-b0-legacy-legacy_kfold-fold1

## Resumen

GeoNUSAF SegFormer-B0 (legacy_kfold, fold 1) es un modelo de segmentación semántica de imágenes de teledetección publicado por el usuario Pranilllllll en Hugging Face. Se construye mediante fine-tuning del checkpoint nvidia/segformer-b0-finetuned-ade-512-512 sobre el dataset GeoNUSAF, con una partición de validación cruzada de 3 folds (semilla 42) y 7 clases: Residential, Road, River, Forest, UnusedLand, Agricultural y Unlabelled. La arquitectura es SegformerForSemanticSegmentation con backbone MiT-B0, por lo que se trata de un modelo compacto orientado a segmentación densa de imágenes aéreas o satelitales.

El interés del repositorio es fundamentalmente metodológico: el autor lo etiqueta explícitamente como "LEGACY PARITY" y advierte de que reproduce el script de entrenamiento previo al protocolo oficial (AdamW plano a 3e-05, 300 épocas, entropía cruzada ponderada simple), no una ejecución del protocolo definitivo. La model card documenta un problema grave de fuga de datos: 375 de las 408 imágenes de validación (91,9 %) tienen una imagen espejo en el conjunto de entrenamiento, lo que invalida las métricas como estimación de generalización. Además, la validación usa la transformación de entrenamiento ("val transform = train transform"), lo que agrava la sobreestimación.

Aun así, el modelo es un artefacto útil como referencia de reproducibilidad interna del proyecto GeoNUSAF y como base técnica para experimentos de segmentación en 7 clases con una ventana de entrada de 512x512 píxeles. Con 0 descargas y 0 likes, y un tamaño de repositorio de 2,7 GB, se trata de un checkpoint de trabajo personal, no de un modelo con validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegformerForSemanticSegmentation (encoder MiT-B0, transformer jerárquico con atención eficiente) |
| Parametros totales | no disponible (la model card no los declara; el backbone es MiT-B0, la variante más pequeña de la familia SegFormer) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 512x512 px según el checkpoint base) |
| Tipos de cuantizacion | no disponible (no se documenta ninguna; el repositorio no incluye GGUF ni variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión; las etiquetas de clase estan en ingles) |
| Licencia | no disponible (la model card no la declara; hay que verificar la del checkpoint base) |
| Formato de pesos | no disponible (se carga con transformers como SegformerForSemanticSegmentation; repositorio de 2,7 GB) |
| Numero de clases | 7 (Residential, Road, River, Forest, UnusedLand, Agricultural, Unlabelled) |
| Dataset | GeoNUSAF, particion legacy_kfold de 3 folds (semilla 42), fold 1 |
| Tamano del repositorio | 2,7 GB |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegFormer, un transformer jerárquico sin codificación posicional explícita que combina un encoder (MiT-B0) con un decoder ligero de tipo MLP. El encoder produce representaciones multiescala; el decoder las fusiona y genera el mapa de segmentación, que después se interpola a la resolución de entrada. El checkpoint de partida es nvidia/segformer-b0-finetuned-ade-512-512, ya afinado sobre ADE20K a 512x512, lo que fija la resolución esperada de trabajo.

El entrenamiento documentado en la model card corresponde al "script legacy": optimizador AdamW con un único grupo de parámetros, learning rate plano de 3e-05, weight decay 0,01, sin scheduler, sin gradient clipping y sin EMA. La función de pérdida es entropía cruzada ponderada simple (el término Lovász queda a 0,0 y el label smoothing a 0,0), con pesos de clase calculados por frecuencia inversa (legacy_inv_freq) sobre el conjunto completo y sin tope. Se entrenaron 300 épocas con paciencia de 25 y batch de 16; la mejor época registrada es la 188. No se menciona ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión.

Las innovaciones técnicas destacables del repositorio son, en realidad, advertencias metodológicas: la partición legacy_kfold con fugas (91,9 % de las imágenes de validación tienen espejo en entrenamiento) y el uso de la transformación de entrenamiento en validación. La model card pide explícitamente no mezclar estas cifras en la tabla de benchmarks del proyecto sin leer antes los campos de split y métrica.

## Capacidades

- Segmentación semántica densa de imágenes aéreas o satelitales en 7 clases: Residential, Road, River, Forest, UnusedLand, Agricultural y Unlabelled.
- Clasificación por píxel con salida a resolución interpolada respecto a la entrada de 512x512 px.
- Discriminación de coberturas terrestres: suelo residencial, viario, cursos fluviales, masa forestal, suelo no utilizado y suelo agrícola.
- Distinción de la clase Unlabelled, que permite al modelo marcar píxeles no etiquetados en lugar de forzar una clase real.
- Inferencia por lotes (el entrenamiento usó batch de 16), adecuada para procesar tiles de forma masiva.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (VQA/captioning), audio ni modo "thinking".
- No tiene capacidades multilingües: es un modelo puramente visual y las etiquetas están en inglés.

## Casos de uso

- Actualización de cartografía de usos del suelo: el modelo puede clasificar tiles de 512x512 px y generar mapas de cobertura con 6 clases reales, útiles como capa preliminar en un SIG antes de revisión humana. Es adecuado por su bajo coste computacional, aunque las métricas están contaminadas por fuga de datos.
- Monitorización de expansión urbana: la clase Residential alcanza un IoU de 0,8470 en validación, la segunda mejor del modelo, por lo que es razonable usarla para detectar crecimiento de superficies residenciales entre dos fechas.
- Seguimiento de masa forestal: con un IoU de 0,8994 (F1 0,9471), es la clase más fiable; sirve para inventariar cobertura forestal y detectar pérdidas aproximadas de arbolado a escala de tile.
- Agricultura de precisión: la clase Agricultural obtiene IoU 0,8161, suficiente para delimitar parcelas de cultivo como paso previo a cálculos de superficie sembrada o a la priorización de inspecciones de campo.
- Análisis de recursos hídricos: la clase River alcanza IoU 0,5144, por lo que puede emplearse como señal de apoyo en el seguimiento de cauces y láminas de agua, siempre con verificación manual dado el margen de error.
- Planificación territorial sobre suelo no utilizado: la clase UnusedLand (IoU 0,7849) permite localizar solares y terrenos yermos para estudios de disponibilidad de suelo o de recalificación.
- Trazado preliminar de viario rural: la clase Road tiene el IoU más bajo de las clases reales (0,4542), así que su uso realista es como generador de candidatos que un operador revisa, no como capa final de navegación.
- Investigación y reproducibilidad: el checkpoint es útil para reproducir el pipeline "legacy" del proyecto GeoNUSAF y comparar contra futuras ejecuciones del protocolo corregido, sin reutilizar sus cifras como referencia de generalización.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (validación, fold 1). Advertencia: la model card indica fuga de variante en el 91,9 % de las imágenes de validación y uso de la transformación de entrenamiento en validación, por lo que estas cifras sobreestiman el rendimiento real.

| Metrica | Valor |
|---|---|
| val mIoU (legacy per-batch, 7 clases) | 0,5891 |
| val mIoU (pooled, 7 clases) | 0,6300 |
| val mIoU (pooled, 6 clases reales) | 0,7193 |
| val OA (exactitud global) | 0,8895 |
| val kappa | 0,8328 |
| Mejor epoca | 188 (de 300) |

Rendimiento por clase (validación, pooled):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8470 | 0,9172 |
| Road | 0,4542 | 0,6246 |
| River | 0,5144 | 0,6793 |
| Forest | 0,8994 | 0,9471 |
| UnusedLand | 0,7849 | 0,8795 |
| Agricultural | 0,8161 | 0,8987 |
| Unlabelled | 0,0942 | 0,1723 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo ni con el dataset GeoNUSAF.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Al tratarse de un backbone MiT-B0 con entrada de 512x512 px, la huella esperada es de menos de 1 GB por lote pequeño en fp32 (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4070 o superior permite procesar lotes grandes y varios tiles por segundo. Para entrenamiento o reentrenamiento, una RTX 4090 o una A100 aceleran notablemente las 300 épocas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo e incluso en iGPU o CPU para inferencia puntual, dado el tamaño reducido del encoder.
- Opciones de despliegue: transformers con PyTorch (carga directa como SegformerForSemanticSegmentation), exportación a ONNX o TorchScript y posterior ejecución con ONNX Runtime o TensorRT. No aplican llama.cpp, Ollama ni motores GGUF, porque no es un modelo de lenguaje.
- Aceleradores de inferencia tipo vLLM o TGI no son aplicables a este tipo de modelo; para servirlo conviene usar un microservicio propio (FastAPI + PyTorch/ONNX) o una plataforma de visión.
- Latencia y throughput: no disponible; el autor no publica mediciones de tiempo de inferencia ni de imágenes por segundo.
- Nota sobre el repositorio: ocupa 2,7 GB, muy por encima de lo que ocupan los pesos de un SegFormer-B0, lo que sugiere que incluye artefactos adicionales (checkpoints intermedios, estados de optimizador o ficheros de entrenamiento) no detallados en la model card.

## Comparativa con modelos similares

No se han publicado comparativas de este checkpoint con alternativas en la informacion proporcionada, y los resultados de la model card no son comparables con métricas de terceros por la fuga de datos señalada. La única comparación verificable es estructural, contra el checkpoint base del que deriva:

| Modelo | Tarea y dataset | Clases | Entrada | Licencia | Comentario |
|---|---|---|---|---|---|
| geonusaf-segformer-b0-legacy-legacy_kfold-fold1 | Segmentación semántica, GeoNUSAF (legacy_kfold, fold 1) | 7 | 512x512 px | no disponible | Fine-tuning con fuga de validación del 91,9 %; métricas no generalizables |
| nvidia/segformer-b0-finetuned-ade-512-512 | Segmentación semántica, ADE20K | 150 | 512x512 px | no verificada en esta ficha | Checkpoint base; dominio genérico de escenas, no teledetección |
| Otras variantes de la familia SegFormer (B1-B5) | Segmentación semántica genérica | variable | variable | no verificada en esta ficha | No hay datos en la información disponible para comparar parámetros o métricas |
| Alternativas de teledetección (U-Net, DeepLabV3+, Mask2Former adaptados) | Segmentación semántica de imágenes aéreas | variable | variable | no disponible | No se dispone de resultados comparables en la información proporcionada |

## Limitaciones y advertencias

- Fuga de datos documentada por el propio autor: 375 de 408 imágenes de validación (91,9 %) tienen una réplica en el conjunto de entrenamiento. Las métricas de validación no deben interpretarse como capacidad de generalización.
- La validación usa la transformación de entrenamiento ("val transform = train transform"), lo que introduce más optimismo en las cifras.
- No es una ejecución del protocolo oficial del proyecto GeoNUSAF: el autor lo etiqueta como "legacy parity" y pide no mezclar sus números en la tabla de benchmarks sin leer los campos de split y métrica.
- Clases débiles: Road (IoU 0,4542) y River (IoU 0,5144) están muy por debajo del resto y son propensas a errores de omisión y confusión.
- La clase Unlabelled tiene un IoU de 0,0942 y un F1 de 0,1723, lo que indica que el modelo apenas distingue los píxeles no etiquetados; arrastra a la baja el mIoU de 7 clases (0,6300) frente al de 6 clases reales (0,7193).
- Licencia no declarada en la model card: antes de cualquier uso comercial hay que verificar la licencia de este repositorio y la del checkpoint base nvidia/segformer-b0-finetuned-ade-512-512, que puede imponer restricciones adicionales.
- Riesgo de alucinación visual: como todo modelo de segmentación, puede asignar una clase real a píxeles de fondo o de transición, especialmente en bordes de cauces, viario estrecho y zonas mixtas.
- Sesgos de dominio: el modelo está ajustado a la distribución del dataset GeoNUSAF; su comportamiento en otras zonas geográficas, sensores, resoluciones o estaciones del año no está evaluado.
- Solo se publica el fold 1 de 3; no hay resultados de los folds restantes que permitan estimar variabilidad entre particiones.
- Repositorio sin validación externa: 0 descargas y 0 likes, sin evidencia de uso independiente ni de revisión por terceros.
- El repositorio de 2,7 GB contiene artefactos no descritos; conviene inspeccionar su contenido antes de integrarlo en un pipeline de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-segformer-b0-legacy-legacy_kfold-fold1
- Checkpoint base citado en la model card: https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512
- Dataset GeoNUSAF: no disponible (no se proporciona enlace en la información recibida)
- Paper, blog o repositorio del proyecto GeoNUSAF: no disponible
- Demo o espacio de inferencia: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas genéricas de Microsoft, sin relación con el modelo)
