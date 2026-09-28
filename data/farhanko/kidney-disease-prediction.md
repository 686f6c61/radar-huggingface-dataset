# FarhanKO/kidney-disease-prediction

## Resumen

Kidney CT Classifier (DenseNet121) es un clasificador de imágenes médicas que asigna un corte de tomografía computarizada (TC) renal a una de cuatro clases: quiste (Cyst), normal (Normal), cálculo (Stone) o tumor (Tumor). Lo desarrolla el usuario FarhanKO y se publica como modelo de Keras 3 con backend PyTorch, construido mediante transfer learning sobre DenseNet121 preentrenada en ImageNet y ajustada por completo. Forma parte del módulo de imagen del proyecto Disease-Risk-Prediction, dentro de la carpeta `kidney/image_based/`.

El modelo desplegado ocupa 84 MB y va acompañado de una cascada de tres etapas: una puerta de detección fuera de distribución (Isolation Forest entrenado sobre embeddings de DenseNet121), el clasificador de cuatro clases y una capa de decisión basada en un umbral de confianza de 0,75 que devuelve el estado `accepted`, `review` o `rejected`. El repositorio completo pesa 1,1 GB e incluye nueve checkpoints (cuatro backbones ajustados, cuatro checkpoints de fase 1 con backbone congelado y una CNN propia como línea base), además de la puerta OOD y los metadatos.

Su relevancia es acotada y explícita: el propio autor lo etiqueta como material de investigación y educación, no como dispositivo médico. Se entrenó con 123 TC de hospitales de una única ciudad, por lo que su utilidad real está en docencia, curación de datos y experimentación con arquitecturas, no en uso clínico. Con 46 descargas y 0 likes, es un modelo de nicho sin validación externa publicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN DenseNet121 con transfer learning (preentrenada en ImageNet y ajustada por completo); cascada con puerta OOD basada en Isolation Forest sobre embeddings |
| Parametros totales | no disponible (el checkpoint desplegado ocupa 84 MB; el conjunto de nueve checkpoints ronda 1,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada de 224 x 224 x 3 píxeles) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precisión completa en formato .keras) |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto) |
| Licencia | other (el autor no detalla condiciones; requiere revisión manual) |
| Formato de pesos | .keras (Keras 3, backend PyTorch) para los clasificadores; .joblib (pickle de scikit-learn 1.8) para la puerta OOD; metadata.json |
| Clases de salida | Cyst, Normal, Stone, Tumor (en ese orden, según metadata.json) |
| Preprocesado de entrada | Escala de grises, relleno a cuadrado con negro, redimensionado a 224 x 224 (PIL BOX), repetición a 3 canales, float32 en rango 0-255 (sin dividir entre 255) |
| Umbral de confianza | 0,75 (por debajo: estado `review`) |
| Tamaño del repositorio | 1,1 GB |
| Librería declarada | keras |
| Pipeline | image-classification |
| Descargas / likes | 46 / 0 |

## Arquitectura y entrenamiento

El modelo desplegado es una DenseNet121 preentrenada en ImageNet y ajustada de forma completa sobre cortes de TC renal. La inferencia se ejecuta con Keras 3 configurando `KERAS_BACKEND=torch`, es decir, con el backend de PyTorch en lugar de TensorFlow. El repositorio conserva además checkpoints de fase 1 (backbone congelado, solo cabeza de clasificación entrenada) para comparar el efecto del ajuste completo: ResNet50V2 (276 MB), EfficientNetV2B0 (72 MB), ConvNeXtTiny (321 MB) y la propia DenseNet121 (84 MB). Los cuatro modelos ajustados por completo pueden combinarse mediante soft voting en una opción de ensemble.

La cascada de decisión tiene tres etapas. La primera es una puerta OOD implementada con Isolation Forest de scikit-learn 1.8 sobre embeddings extraídos por DenseNet121, que descarta entradas que no son cortes de TC renal. La segunda es el clasificador de cuatro clases, que devuelve probabilidades softmax. La tercera aplica el umbral de confianza de 0,75 para decidir entre `accepted`, `review` y `rejected`. También se incluye una CNN pequeña de 5 MB entrenada desde cero como línea base.

El entrenamiento se realizó sobre el dataset CT KIDNEY DATASET Normal-Cyst-Tumor and Stone, en una versión deduplicada y con partición de test a nivel de exploración (scan-level), lo que evita fugas de información entre cortes de la misma TC. El autor indica que el conjunto procede de 123 TC de hospitales de una sola ciudad. No se documenta el número de tokens, la composición exacta del dataset, ni el uso de RLHF o DPO (técnicas ajenas a este tipo de modelo). Tampoco se detalla el régimen de aumentos de datos ni el número de épocas.

## Capacidades

- Clasificación de un corte de TC renal en cuatro categorías: quiste, normal, cálculo y tumor.
- Salida de probabilidades por clase (`probabilities`) y probabilidad agregada de anormalidad (`p_abnormal`), además de la etiqueta y la confianza.
- Detección fuera de distribución mediante la puerta OOD: devuelve `rejected` si la imagen no parece un corte de TC renal.
- Triaje por umbral de confianza: `accepted` si la probabilidad de la clase superior es mayor o igual a 0,75; `review` si es inferior.
- Modo ensemble opcional por soft voting entre los cuatro modelos ajustados (DenseNet121, ResNet50V2, EfficientNetV2B0, ConvNeXtTiny).
- Generación de mapas de calor Grad-CAM desde el pipeline completo del repositorio GitHub (`python -m src.predict --image slice.png --heatmap-dir out/`).
- Inferencia por línea de comandos sobre una o varias imágenes (`python inference.py slice1.png slice2.jpg`).
- Funciona como módulo de imagen dentro del proyecto Disease-Risk-Prediction.
- No soporta generación de texto, razonamiento multi-paso, tool calling ni uso como agente. No procesa lenguaje natural ni audio.

## Casos de uso

- Docencia en radiología: el modelo permite mostrar a residentes cómo un clasificador separa quiste, normal, cálculo y tumor en cortes de TC, con la etiqueta, la probabilidad por clase y el estado de triaje como material de discusión. Es adecuado porque la salida es interpretable y el umbral de 0,75 marca explícitamente los casos dudosos.
- Curación y preetiquetado de datasets de investigación: sobre un repositorio de cortes de TC, el modelo preanota las cuatro clases y el equipo humano revisa solo los casos marcados como `review`; con un 89,4 % de exactitud declarada se reduce el trabajo de anotación manual, siempre con verificación posterior.
- Filtrado de datos heterogéneos: la puerta OOD rechaza automáticamente los cortes que no son TC renal (3,64 % del test según el autor), lo que sirve para limpiar lotes mezclados antes de cualquier análisis retrospectivo.
- Comparación de arquitecturas en investigación: el repositorio incluye checkpoints de DenseNet121, ResNet50V2, EfficientNetV2B0, ConvNeXtTiny y una CNN propia, con variantes de fase 1 y ajuste completo, lo que permite reproducir experimentos de transfer learning bajo el mismo preprocesado.
- Inspección cualitativa con Grad-CAM: el pipeline de `src/predict.py` genera mapas de calor que permiten comprobar qué regiones del corte activan la predicción, útil en estudios de explicabilidad y en la detección de atajos aprendidos.
- Muestreo dirigido en estudios retrospectivos: dado un volumen grande de cortes, el modelo permite priorizar subconjuntos con hallazgos (quiste, cálculo, tumor) para revisión detallada, reduciendo el número de imágenes que hay que inspeccionar de forma manual.
- Pruebas de integración de pipelines médicos: al ser un modelo pequeño con inferencia en CPU o GPU de gama baja, sirve como componente de prueba en arquitecturas de procesamiento por lotes o servicios de inferencia antes de sustituirlo por modelos validados.
- Demostraciones educativas en local: con `inference.py` y `huggingface_hub` se puede desplegar la cascada completa en un portátil, sin infraestructura especializada.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Clasificación de cortes de TC renal (4 clases) | CT KIDNEY DATASET Normal-Cyst-Tumor and Stone (deduplicado, partición de test a nivel de exploración) | Exactitud (test) | 0,894 |
| Clasificación de cortes de TC renal (4 clases) | CT KIDNEY DATASET Normal-Cyst-Tumor and Stone (deduplicado, partición de test a nivel de exploración) | F1 macro (test) | 0,867 |
| Clasificación de cortes de TC renal (4 clases) | CT KIDNEY DATASET Normal-Cyst-Tumor and Stone (deduplicado, partición de test a nivel de exploración) | ROC-AUC macro (test) | 0,976 |

El autor indica además que `inference.py` reproduce exactamente el cuaderno de evaluación sobre la partición de test completa, con una exactitud de 0,8942 y un 3,64 % de cortes rechazados por la puerta OOD. No se han publicado resultados desagregados por clase, matrices de confusión ni comparaciones con otros modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del tamaño de los ficheros, el checkpoint desplegado son 84 MB de pesos, por lo que la inferencia en float32 con lotes pequeños debería mantenerse por debajo de 1 GB de VRAM; el ensemble de los cuatro modelos ajustados suma aproximadamente 753 MB de pesos (84 + 276 + 72 + 321 MB). Son estimaciones a partir de los tamaños publicados, no medidas del autor.
- GPU recomendadas: no hay requisitos publicados. Por tamaño, cualquier GPU con 4 GB o más debería ser suficiente, incluidas GTX 1650, RTX 3060, RTX 4090 o RTX 5090. Las A100 o H100 no aportan ventaja para este modelo.
- ¿Cabe en GPU de consumo? Sí, con margen amplio; el modelo es de 84 MB y la entrada es de 224 x 224 x 3. También puede ejecutarse en CPU para inferencia puntual o procesamiento por lotes de baja frecuencia.
- Opciones de despliegue: Keras 3 con backend PyTorch (`KERAS_BACKEND=torch`), `inference.py` autónomo con `keras`, `torch`, `scikit-learn` (fijado a 1.8), `numpy`, `pillow` y `huggingface_hub`; descarga de pesos vía `hf_hub_download` o `snapshot_download`; pipeline completo con Grad-CAM mediante `python -m src.predict`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible. El autor no publica tiempos de inferencia ni métricas de rendimiento por segundo.
- Almacenamiento: 84 MB para el modelo desplegado más la puerta OOD (4 MB) y los metadatos; 1,1 GB si se descargan los nueve checkpoints.

## Comparativa con modelos similares

No se proporcionan resultados de benchmarks de modelos externos comparables. Como alternativa, se comparan los componentes incluidos en el propio repositorio, todos con el mismo preprocesado y las mismas cuatro clases:

| Modelo | Rol en el repositorio | Tamaño del fichero | Exactitud declarada |
|---|---|---|---|
| DenseNet121_FT_best.keras | Modelo desplegado (ajuste completo) | 84 MB | 0,894 (solo para el desplegado) |
| ResNet50V2_FT_best.keras | Miembro del ensemble (ajuste completo) | 276 MB | no disponible |
| EfficientNetV2B0_FT_best.keras | Miembro del ensemble (ajuste completo) | 72 MB | no disponible |
| ConvNeXtTiny_FT_best.keras | Miembro del ensemble (ajuste completo) | 321 MB | no disponible |
| DenseNet121_best.keras | Fase 1 (backbone congelado) | 31 MB | no disponible |
| ResNet50V2_best.keras | Fase 1 (backbone congelado) | 97 MB | no disponible |
| EfficientNetV2B0_best.keras | Fase 1 (backbone congelado) | 27 MB | no disponible |
| ConvNeXtTiny_best.keras | Fase 1 (backbone congelado) | 109 MB | no disponible |
| Custom_CNN_best.keras | Línea base entrenada desde cero | 5 MB | no disponible |

Comparación con alternativas externas de clasificación de TC renal: no disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico. El propio autor lo declara como material de investigación y educación, y prohíbe explícitamente su uso para diagnóstico o decisiones de tratamiento.
- Sesgo de origen de datos: entrenado con 123 TC de hospitales de una única ciudad. No hay validación externa con datos de otros centros, equipos, protocolos de adquisición o poblaciones, por lo que la generalización es desconocida.
- Riesgo de clasificación errónea: la exactitud declarada es de 0,894 con un F1 macro de 0,867. El F1 inferior a la exactitud sugiere desequilibrio entre clases, con peor rendimiento previsible en las clases minoritarias. No se publican métricas por clase ni matrices de confusión.
- Falsos negativos clínicamente relevantes: un corte con tumor o cálculo clasificado como normal es un error de alto impacto si se usa fuera del ámbito de investigación. El umbral de 0,75 marca casos como `review`, pero no elimina este riesgo.
- Puerta OOD imperfecta: el 3,64 % de los cortes del test son rechazados, pero no se documenta la tasa de falsos rechazos ni de imágenes fuera de distribución que pasan el filtro.
- Riesgo de seguridad al cargar la puerta OOD: `kidney_ct_ood_detector.joblib` es un pickle de scikit-learn; debe cargarse únicamente desde una fuente de confianza y con scikit-learn 1.8, versión fijada en `requirements.txt`.
- Licencia restrictiva o indeterminada: la licencia es `other` y el autor no detalla condiciones. Antes de cualquier uso comercial hay que contactar con el autor y revisar los términos aplicables.
- Idiomas y texto: no aplica soporte multilingüe ni procesamiento de lenguaje natural; cualquier integración en un asistente conversacional requeriría un modelo de lenguaje adicional.
- Ausencia de verificacion independiente: las métricas figuran con `verified: false`, es decir, son cifras declaradas por el autor y no auditadas por terceros.
- Repositorio dividido: la ficha corresponde a `FarhanKO/kidney-disease-prediction`, pero los pesos se alojan en `FarhanKO/kidney-ct-classifier`, lo que puede generar confusión en la trazabilidad de versiones.
- Dependencia del preprocesado exacto: hay que replicar el pipeline documentado (escala de grises, relleno a cuadrado, 224 x 224, tres canales, float32 de 0 a 255 sin dividir entre 255). Cualquier desviación invalida las métricas declaradas.
- Mantenimiento incierto: el modelo tiene 46 descargas y 0 likes, sin señales de mantenimiento continuado ni comunidad asociada.

## Enlaces

- Modelo en Hugging Face (ficha): https://huggingface.co/FarhanKO/kidney-disease-prediction
- Repositorio de pesos en Hugging Face: https://huggingface.co/FarhanKO/kidney-ct-classifier
- Proyecto GitHub Disease-Risk-Prediction: https://github.com/FarhanKO/Disease-Risk-Prediction
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relación con el contenido técnico y se descartan. No se dispone de paper, blog, demo ni repositorio adicional asociado.
