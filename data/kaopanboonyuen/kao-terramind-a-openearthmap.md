# kaopanboonyuen/KAO-TerraMind-A-OpenEarthMap

## Resumen

KAO-TerraMind-A-OpenEarthMap es un checkpoint de segmentación semántica de imágenes aéreas y satelitales, resultado de un ajuste fino controlado del modelo fundacional geoespacial TerraMind-1.0-base de IBM y la ESA. Lo desarrolla el usuario kaopanboonyuen como artefacto de reproducibilidad para una propuesta de artículo enviada a CVPR 2027. El modelo resuelve una tarea concreta: clasificación por píxel en 8 clases de cobertura del suelo (Bareland, Rangeland, Developed space, Road, Tree, Water, Agriculture land y Building) sobre imágenes RGB de 0,25 a 0,5 m de resolución de ground sample distance.

La relevancia del checkpoint es metodológica más que de rendimiento absoluto: forma parte de la familia KAO-TerraMind, compuesta por tres adaptaciones de un solo factor sobre TerraMind-1.0-base (optimización, función de pérdida y decodificador). En este caso, la variante A modifica únicamente la tasa de aprendizaje del backbone y el weight decay, manteniendo idénticos datos, semilla, épocas, batch, sampler y métricas. Esto permite atribuir cualquier diferencia de resultados a ese único cambio.

El modelo emplea el backbone `terramind_v1_base` con un decodificador UperNet mediante `EncoderDecoderFactory` de TerraTorch, con 97,60 M de parámetros y entrada fija de 3×224×224. La licencia es Apache-2.0 y el repositorio incluye únicamente el helper de inferencia, la configuración exacta de arquitectura y receta, y los resultados completos de benchmark; el código de entrenamiento está deliberadamente excluido mientras el artículo está en revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone TerraMind-1.0-base) + decodificador UperNet |
| Parametros totales | 97,60 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 3×224×224 píxeles |
| Tipos de cuantizacion | fp16 (usado en la medición de latencia); no se documentan otras |
| Idiomas soportados | en (metadatos del modelo); la tarea es de visión, no lingüística |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`terramind_v1_kaoA_best.pt`), cargado vía TerraTorch >= 1.2.4 |

## Arquitectura y entrenamiento

El modelo combina el encoder fundacional geoespacial TerraMind-1.0-base, inicializado desde `ibm-esa-geospatial/TerraMind-1.0-base`, con un decodificador UperNet construido con `EncoderDecoderFactory` de TerraTorch. La modalidad de entrada es exclusivamente RGB (patch embedding de 3 canales, 8 bits, 224×224), y la salida son logits por píxel sobre 8 clases. La normalización emplea las estadísticas RGB de preentrenamiento de TerraMind en escala 0-255.

El ajuste fino se realizó sobre OpenEarthMap (imágenes aéreas y satelitales globales con GSD de 0,25 a 0,5 m, teselas de 1000×1000 px). La receta compartida por las siete variantes del estudio usa AdamW, LR base 1e-4, 30 épocas con paciencia de early stopping de 8 (checkpoint elegido por mIoU de validación), batch 16, sampler balanceado por clase con 6000 ventanas por época, ventana de 224×224 con stride de entrenamiento de 112 px, aumentación de flips horizontal y vertical más rotaciones de 90°, precisión fp16 con grad-clip 1.0, semilla 42 y una única NVIDIA Tesla T4. La innovación de la variante A es exclusivamente de optimización: multiplicador de LR del backbone de 0,3 (frente a 0,1 de la referencia) y weight decay de 0,05 (frente a 0,01), lo que permite al encoder preentrenado alejarse más de su solución de preentrenamiento. La pérdida es entropía cruzada ponderada por clase (pesos de raíz inversa de frecuencia) más Dice con peso 0,5.

## Capacidades

- Segmentación semántica densa por píxel en 8 clases de cobertura del suelo sobre imágenes aéreas y satelitales RGB.
- Procesamiento de teselas de 224×224 píxeles con resolución de 0,25 a 0,5 m GSD.
- Inferencia en precisión fp16 sobre GPU (medición declarada en T4, batch 1).
- Integración con el ecosistema TerraTorch >= 1.2.4 para carga del checkpoint y construcción del modelo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de capacidades multilingües, de visión general, audio ni modo de pensamiento (thinking mode); es un modelo especializado de teledetección.
- No se documentan capacidades zero-shot ni de prompting en lenguaje natural.

## Casos de uso

- Cartografía de cobertura del suelo a escala regional: el modelo clasifica cada píxel en las 8 clases de OpenEarthMap, lo que permite generar mapas temáticos a partir de ortofotos RGB de 0,25-0,5 m sin anotación manual.
- Monitorización de expansión urbana: la clase "Developed space" y "Building" permiten cuantificar el crecimiento de suelo artificializado comparando teselas de distintas fechas con la misma resolución de entrada.
- Seguimiento de masas de agua y riberas: la clase "Water" facilita la delimitación de láminas de agua en estudios de inundaciones o de evolución de embalses, siempre que la imagen de entrada sea RGB y la resolución encaje con el dominio de entrenamiento.
- Inventario agrícola: la clase "Agriculture land" sirve para estimar superficie cultivada en imágenes aéreas, útil para organismos públicos o aseguradoras agrarias que trabajan con vuelos periódicos.
- Planificación de infraestructura viaria: la clase "Road" permite extraer la red viaria de forma automática para análisis de accesibilidad o mantenimiento, con la salvedad de que la precisión depende del contraste de la vía en la imagen.
- Reproducibilidad de investigación: al publicarse con la configuración exacta de arquitectura y receta, el checkpoint sirve como referencia para replicar el resultado de la variante A del estudio CVPR y para comparar futuras adaptaciones de TerraMind bajo el mismo protocolo.
- Evaluación comparativa de estrategias de ajuste fino: investigadores que estudien el efecto de la tasa de aprendizaje del backbone en modelos fundacionales geoespaciales pueden usar este checkpoint como punto de partida controlado frente a la referencia TerraMind-1.0-base.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre la partición de validación oficial de OpenEarthMap:

| Metrica | Valor |
|---|---|
| mIoU (%) | 61,58 |
| Overall Accuracy (%) | 76,27 |
| Macro F1 (%) | 75,43 |
| Macro Precision (%) | 75,10 |
| Macro Recall (%) | 75,88 |

Según la model card, la variante A queda 0,54 puntos porcentuales por debajo del TerraMind-1.0-base entrenado con receta idéntica, en la posición 5 de 7 dentro del estudio comparativo. No se han publicado en la información disponible resultados de benchmarks frente a otros modelos externos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 97,60 M de parámetros, en fp16 los pesos ocupan aproximadamente 0,2 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer con más de 4 GB.
- GPU recomendadas: el autor reporta mediciones en una NVIDIA Tesla T4; por tamaño, cualquier RTX 3060 o superior debería ser suficiente para inferencia.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros y la entrada fija de 224×224.
- Opciones de despliegue: TerraTorch >= 1.2.4 es la vía documentada (carga del checkpoint `terramind_v1_kaoA_best.pt` y construcción del modelo con `EncoderDecoderFactory`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 15,06 ms por tesela de 224×224 en T4, fp16 y batch 1, según la model card. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mIoU OpenEarthMap | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAO-TerraMind-A-OpenEarthMap | 97,60 M | 3×224×224 RGB | 61,58 % (declarado) | Apache-2.0 | Hugging Face |
| TerraMind-1.0-base (referencia, misma receta) | no disponible en la informacion | 3×224×224 RGB | 62,12 % (implícito: +0,54 pp según la model card) | Apache-2.0 (modelo base de IBM/ESA) | Hugging Face |
| KAO-TerraMind-B y KAO-TerraMind-C | no disponible en la informacion | 3×224×224 RGB | no disponible en la informacion (variantes del mismo estudio) | Apache-2.0 (presumible, no confirmado) | no disponible en la informacion |

No se dispone de datos en la información proporcionada para comparar con otros modelos de segmentación geoespacial ajenos a la familia TerraMind.

## Limitaciones y advertencias

- El resultado queda 0,54 pp por debajo de la referencia con receta idéntica y en la posición 5 de 7 del estudio; la variante A no mejora al baseline en mIoU.
- Las métricas están declaradas por el autor y marcadas como no verificadas (`verified: false`); no han pasado una validación independiente.
- El protocolo de evaluación usa las teselas de validación oficiales de OpenEarthMap como test, porque las etiquetas de test oficiales no son públicas; los resultados no son directamente comparables con publicaciones que usen la partición de test real.
- El modelo está entrenado exclusivamente con entrada RGB; no admite otras modalidades (SAR, multiespectral, DEM) que TerraMind sí contempla en su preentrenamiento.
- La resolución de entrada está fijada a 224×224 px y el dominio de entrenamiento se limita a GSD de 0,25-0,5 m; imágenes fuera de ese rango o con otra geometría pueden degradar la precisión.
- El código de entrenamiento no está incluido mientras el artículo está en revisión; solo se publica el helper de inferencia y la configuración.
- No se documentan análisis de sesgo por región geográfica, aunque OpenEarthMap es un dataset global y el rendimiento puede variar entre continentes y tipos de paisaje.
- Riesgo de alucinación en sentido estricto no aplica (no es un modelo generativo de texto), pero sí existe riesgo de clasificaciones erróneas por píxel en clases poco representadas o visualmente ambiguas.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base de IBM/ESA del que deriva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-A-OpenEarthMap
- Modelo base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- TerraTorch (repositorio): https://github.com/IBM/terratorch
- Dataset OpenEarthMap: no disponible en la información proporcionada (referenciado en la model card sin URL explícita)
- Artículo CVPR 2027: no disponible (en revisión según la model card)
