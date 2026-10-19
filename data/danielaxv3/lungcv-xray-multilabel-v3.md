# danielaxv3/lungcv-xray-multilabel-v3

## Resumen

LungCV v3 es un clasificador multietiqueta de radiografías de tórax publicado en Hugging Face por el usuario danielaxv3. Sobre un backbone DenseNet121 preentrenado en ImageNet y congelado se añade una cabeza compuesta por GlobalAveragePooling, Dropout(0,3) y una capa densa de 4 salidas con activación sigmoide, de modo que cada hallazgo se puntúa de forma independiente: COVID, NORMAL, PNEUMONIA y TB. La entrada es de 224x224 en escala de grises, replicada a 3 canales y armonizada con CLAHE.

El interés técnico no reside en el tamaño —un artefacto de 29,7 MB— sino en dos decisiones de diseño. La primera es la formulación sigmoide por hallazgo, que permite marcar como incierta una radiografía cuyas cuatro puntuaciones quedan por debajo de 0,5 en lugar de forzar una clase. La segunda es un detector out-of-distribution basado en la distancia euclídea a los centroides de clase en el espacio de características de la capa GAP, con umbral calibrado en 16,27 (percentil 95 de las distancias de entrenamiento). El autor reporta una exactitud argmax de 82,9%, macro-F1 de 0,829 y una tasa de falsos OOD del 5,3% sobre el conjunto de validación.

Se trata explícitamente de un prototipo de investigación, no de un dispositivo médico: no se declara licencia, no hay paper asociado y el repositorio no registra descargas ni likes. Su utilidad práctica se limita a pipelines de investigación, etiquetado asistido y monitorización de deriva de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN DenseNet121 (pesos ImageNet, backbone congelado) + cabeza GAP → Dropout(0,3) → Dense(4, sigmoid) |
| Parámetros totales | No disponible en la model card; el artefacto `best_model.keras` ocupa 29,7 MB, consistente con ~8 M de parámetros en float32 (DenseNet121 estándar: 7,98 M) más la cabeza de clasificación |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: modelo de visión, sin ventana de contexto textual. Entrada fija de 224x224 píxeles |
| Tipos de cuantización | No disponible: el autor solo publica pesos float32 en formato Keras; no hay variantes int8, FP16 ni TFLite |
| Idiomas soportados | No aplica: no procesa texto |
| Licencia | No disponible: no se declara licencia en la model card ni en los metadatos del repositorio |
| Formato de pesos | `.keras` (Keras v3), 29,7 MB; artefactos auxiliares en JSON (`class_names.json`, `preprocessing_config.json`, `metrics.json`, `ood_centroids.json`) y `confusion_matrix.png` |
| Tarea | Clasificación multietiqueta de 4 hallazgos (COVID, NORMAL, PNEUMONIA, TB) + rechazo OOD |
| Resolución de entrada | 224x224, escala de grises replicada a 3 canales |
| Función de pérdida | Entropía cruzada binaria por hallazgo |
| Umbral de decisión | 0,5 por clase (sigmoid); umbral OOD de 16,27 |

## Arquitectura y entrenamiento

La arquitectura es una CNN pura de tipo DenseNet121 con el backbone inicializado con pesos de ImageNet y mantenido congelado durante todo el entrenamiento; solo se ajusta la cabeza clasificadora (GlobalAveragePooling → Dropout 0,3 → Dense de 4 unidades con activación sigmoide). La formulación es multietiqueta con pérdida de entropía cruzada binaria independiente por hallazgo, lo que evita la competición entre clases propia de softmax y permite que una misma radiografía puntúe alto en varios hallazgos simultáneamente. El autor advierte que esta formulación, con umbral fijo de 0,5, es un listón más exigente que un argmax sobre softmax y que por eso las recalls reportadas son moderadas: las imágenes dudosas caen por debajo del umbral, que es el comportamiento de incertidumbre buscado.

El entrenamiento se realizó durante 22 épocas con early stopping, sobre un conjunto balanceado de 3.000 imágenes por clase, con particiones 70/15/15 a nivel de paciente (ningún paciente aparece en más de un split). Los datos provienen de siete fuentes públicas: Kermany chest X-ray pneumonia, NIH ChestX-ray14, COVID-19 Radiography Database, COVID-QU-Ex, TB Chest X-ray database, Shenzhen TB y Montgomery TB. No se documenta uso de RLHF, DPO ni ajuste por preferencias (no aplica en un clasificador de imagen), ni se detalla el número total de tokens o imágenes efectivamente vistas por época.

La innovación destacable es el mecanismo de rechazo en dos niveles. Primero, la capa de incertidumbre: si las cuatro probabilidades quedan por debajo de 0,5, la imagen se etiqueta como *uncertain* en lugar de asignarse a una clase. Segundo, el detector OOD: se extraen las características de la capa GAP, se calcula la distancia euclídea al centroide de clase más cercano y, si supera 16,27, la radiografía se reporta como fuera de la distribución de entrenamiento. El contrato de preprocesado es parte del modelo: conversión a gris, CLAHE con `clipLimit=2.0` y `tileGridSize=(8,8)`, redimensionado a 224x224 con LANCZOS, replicación a 3 canales y `preprocess_input` de Keras (escala a [-1, 1]), sin recorte de bordes (`crop_borders: 0`).

## Capacidades

- Clasificación multietiqueta simultánea de cuatro hallazgos (COVID, NORMAL, PNEUMONIA, TB) con puntuaciones sigmoides independientes por clase.
- Cuantificación de incertidumbre a nivel de imagen: si ninguna clase supera 0,5, la imagen se marca como incierta en lugar de clasificarse.
- Detección out-of-distribution mediante distancia euclídea a centroides de clase en el espacio de características GAP, con umbral fijo de 16,27.
- Robustez parcial a variaciones de adquisición gracias a la armonización CLAHE, que según el autor elimina huellas de intensidad propias del escáner.
- Inferencia sobre imagen en escala de grises a 224x224, con un coste computacional muy bajo (artefacto de 29,7 MB).
- No soporta tool calling, function calling ni uso como agente.
- No soporta generación de texto, razonamiento multi-paso, matemáticas ni código.
- No soporta otras modalidades (audio, vídeo, texto) ni capacidades multilingües.
- No proporciona localización de lesiones ni mapas de calor: la salida es únicamente un vector de 4 probabilidades.

## Casos de uso

- **Prefiltrado en investigación retrospectiva:** procesar lotes de radiografías de cohorts públicas para priorizar la revisión manual de las que superan el umbral en COVID, PNEUMONIA o TB, usando el flag de incertidumbre para apartar los casos dudosos y reducir el volumen de lectura.
- **Etiquetado asistido de datasets:** generar etiquetas débiles multi-etiqueta sobre imágenes sin anotar y reservar la revisión humana para las que caen por debajo de 0,5 o se marcan como OOD, aprovechando la formulación sigmoide para no forzar una clase única.
- **Monitorización de deriva en producción:** usar la tasa de imágenes marcadas como OOD (distancia mayor que 16,27) como métrica de alarma cuando cambia el parque de escáneres, la población o el protocolo de adquisición de un estudio.
- **Control de calidad de adquisición:** detectar imágenes corruptas, no torácicas o con preprocesado incorrecto mediante el detector OOD, evitando que entren en pipelines de análisis aguas abajo.
- **Prototipado rápido en hardware modesto:** el tamaño de 29,7 MB permite desplegar el modelo en CPU, en una GPU de gama de entrada o en un portátil para pruebas de concepto y docencia en IA médica.
- **Módulo base para experimentos de explicabilidad:** sirve como punto de partida para trabajos que añadan Grad-CAM u otras técnicas de atribución sobre DenseNet121, aunque el modelo no incluye visualización de forma nativa.
- **Evaluación comparativa de pipelines de preprocesado:** al publicar `preprocessing_config.json` como contrato, permite medir el impacto de CLAHE, resolución y umbrales sobre el mismo conjunto de validación.

## Benchmarks y rendimiento

Métricas de validación publicadas por el autor, con umbral 0,5 sobre las salidas sigmoides:

| Hallazgo | Precisión | Recall | F1 |
|---|---|---|---|
| COVID | 0,820 | 0,707 | 0,759 |
| NORMAL | 0,832 | 0,690 | 0,754 |
| PNEUMONIA | 0,874 | 0,696 | 0,775 |
| TB | 0,961 | 0,886 | 0,922 |

| Métrica agregada | Valor |
|---|---|
| Exactitud argmax | 82,9% |
| Macro-F1 | 0,829 |
| Umbral OOD (percentil 95 de distancias de entrenamiento) | 16,27 |
| Imágenes de validación conocidas marcadas como OOD | 5,3% |

No se han publicado resultados de benchmarks en la información disponible para comparar con otros modelos sobre un conjunto de test común: las cifras anteriores corresponden al split de validación propio del autor, con su propia selección de clases y particiones a nivel de paciente, por lo que no son directamente equiparables a resultados sobre NIH ChestX-ray14 o CheXpert estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia:** muy baja por el tamaño del modelo (29,7 MB de pesos). Con lotes pequeños las activaciones de DenseNet121 a 224x224 se mantienen en el orden de decenas a pocos cientos de MB; hay que sumar la reserva del runtime de TensorFlow, que suele ocupar 1-2 GB adicionales. Estimación orientativa, no publicada por el autor.
- **GPU recomendadas:** cualquier GPU con 4 GB o más es suficiente (GTX 1650, T4, RTX 3060/4090, A100, H100). El modelo está limitado por el *overhead* del framework, no por cómputo.
- **¿Cabe en GPU de consumo?** Sí, en cualquier GPU de consumo con 4 GB o más; también es viable en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue:** TensorFlow Serving o Keras + FastAPI para servir el `.keras`; conversión a ONNX con `tf2onnx` y ejecución con ONNX Runtime o Triton Inference Server; TFLite para edge. vLLM, llama.cpp, Ollama y TGI no aplican, ya que son runners para modelos de lenguaje.
- **Latencia y throughput:** no disponibles en la información proporcionada. Dado el tamaño del artefacto y la resolución de entrada, se espera latencia de milisegundos por imagen en GPU, pero es una estimación sin dato publicado.
- **Advertencia operativa:** TensorFlow reserva por defecto toda la memoria de la GPU visible; es necesario configurar `set_memory_growth` o un límite explícito si se comparte el dispositivo.

## Comparativa con modelos similares

No hay una comparación numérica posible: los proyectos alternativos localizados no publican métricas sobre el mismo conjunto ni con el mismo etiquetado, y LungCV v3 evalúa sobre su propio split de validación con solo 4 clases.

| Modelo / proyecto | Arquitectura | Parámetros | Entrada | Datos de entrenamiento | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| LungCV v3 | DenseNet121 congelado + cabeza densa | ~8 M (estimado por tamaño del artefacto) | 224x224, gris | 7 datasets públicos, 3.000/clase, split por paciente | Macro-F1 0,829; exactitud argmax 82,9% (validación propia) | No disponible | Hugging Face (`danielaxv3/lungcv-xray-multilabel-v3`) |
| ziaee-mohammad/Chest-Xray-Multilabel-Disease-Detection | ResNet-50 + Grad-CAM | ~25,6 M (ResNet-50 estándar) | No disponible | NIH ChestX-ray14 (14 clases) | No disponible | No disponible | GitHub |
| MultiCaRe-Thorax | Benchmark de dataset y evaluación reproducible | No aplica (dataset) | No disponible | Dataset curado multi-etiqueta de tórax | No disponible | No disponible | Publicación MDPI (J. Imaging) |
| Space `dipnas/chest-xray-multilabel-diagnosis2` | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | Hugging Face Spaces (demo) |

Diferencias clave frente a las alternativas: LungCV v3 cubre solo 4 etiquetas frente a las 14 de los trabajos basados en NIH ChestX-ray14, pero incorpora rechazo OOD e incertidumbre explícita, algo que los proyectos comparados no documentan. A cambio, no ofrece localización ni mapas de calor, que sí incluye el proyecto basado en ResNet-50 con Grad-CAM.

## Limitaciones y advertencias

- **No es un dispositivo médico:** el autor lo declara prototipo de investigación y advierte explícitamente que no constituye diagnóstico médico. No hay marcado CE, aprobación FDA ni validación clínica prospectiva.
- **Licencia no declarada:** al no especificarse licencia, no hay permiso explícito de uso comercial, modificación ni redistribución. Es un bloqueo legal para cualquier uso en producción.
- **Cobertura de solo 4 hallazgos:** el modelo no detecta derrame pleural, cardiomegalia, neumotórax, fibrosis ni el resto de hallazgos habituales en los datasets de tórax; una radiografía con otra patología puede puntuar bajo en las cuatro clases y quedar como incierta sin que eso descarte enfermedad.
- **Riesgo de alucinación en sentido estadístico:** el modelo siempre devuelve cuatro probabilidades; la calibración no está documentada más allá del umbral fijo de 0,5, y no se reportan curvas de fiabilidad ni Brier score.
- **Falsos rechazos OOD:** un 5,3% de las imágenes de validación conocidas se marcan como fuera de distribución. En un despliegue real esa tasa implica descartar casos válidos.
- **Ruido de etiquetas en el origen:** varios de los datasets empleados (notablemente NIH ChestX-ray14) derivan sus etiquetas de informes mediante procesamiento de lenguaje natural, lo que introduce errores sistemáticos que el modelo hereda.
- **Dependencia estricta del preprocesado:** cualquier cliente debe replicar exactamente CLAHE (clipLimit 2.0, tiles 8x8), LANCZOS, replicación a 3 canales y `preprocess_input`; una desviación degrada las salidas sin aviso.
- **Resolución limitada:** 224x224 puede eliminar detalle fino relevante para nódulos pequeños o infiltrados sutiles.
- **Sin localización:** no proporciona bounding boxes ni mapas de calor, lo que dificulta la validación por parte de un radiólogo.
- **Sesgo de muestreo:** el conjunto balanceado a 3.000 imágenes por clase no refleja la prevalencia real de las patologías, por lo que las precisiones reportadas no se trasladan a un entorno con prevalencia baja.
- **Ausencia de validación externa:** todas las métricas provienen de particiones del propio autor; no hay evaluación en un hospital o cohorte independiente.
- **Madurez del repositorio:** 0 descargas, 0 likes, sin paper, sin pipeline declarado en Hugging Face y con fecha de creación en los metadatos (19 de octubre de 2026) anómala respecto a la fecha de consulta, lo que conviene verificar antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielaxv3/lungcv-xray-multilabel-v3
- Proyecto multi-etiqueta con ResNet-50 y Grad-CAM sobre NIH ChestX-ray14: https://github.com/ziaee-mohammad/Chest-Xray-Multilabel-Disease-Detection
- Repositorio, rama principal: https://github.com/ziaee-mohammad/Chest-Xray-Multilabel-Disease-Detection/tree/main
- MultiCaRe-Thorax, benchmark de dataset multi-etiqueta de tórax (MDPI, J. Imaging): https://www.mdpi.com/2313-433X/12/10/484/pdf
- Artículo sobre clasificación multi-etiqueta de enfermedad pulmonar con CheXpert y RadGraph: https://arxiv.org/html/2412.11452v1
- Demo en Hugging Face Spaces sobre diagnóstico multi-etiqueta de tórax: https://huggingface.co/spaces/dipnas/chest-xray-multilabel-diagnosis2
- Paper, blog o repositorio oficial del autor: no disponible
