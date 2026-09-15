# mhjoana98/TRECARD_renal_histology_segmentation_unet

## Resumen

El modelo `mhjoana98/TRECARD_renal_histology_segmentation_unet` es una red de segmentación de imágenes histológicas renales publicada en HuggingFace por la autora Joana Mercado-Hernández (usuario `mhjoana98`), en el marco del proyecto TRECARD. Su objetivo declarado, según la cita de la model card, es la segmentación y cuantificación automática de tres hallazgos en imágenes de biopsia renal completa teñidas con hematoxilina-eosina (HE): inflamación en áreas de fibrosis intersticial y atrofia tubular (i-IFTA), infiltrados focales y dilatación tubular. El repositorio contiene únicamente la cita del manuscrito asociado, que está en proceso de revisión por pares, y no incluye datos de entrenamiento, métricas ni instrucciones de uso.

El identificador del repositorio indica una arquitectura U-Net, implementada con Keras, lo que sitúa al modelo en la familia clásica de redes completamente convolucionales con conexiones de salto, habituales en segmentación semántica biomédica. Se trata, por tanto, de un modelo de visión por computador y no de un modelo de lenguaje: no tiene tokens de contexto, no procesa texto y no ofrece capacidades conversacionales ni de generación. El repositorio ocupa 0,4 GB, un tamaño compatible con una U-Net de escala moderada, aunque no se ha publicado el número de parámetros.

Su relevancia actual es acotada y de nicho: la cuantificación reproducible de i-IFTA y de lesiones tubulointersticiales es un problema abierto en patología renal, especialmente en el seguimiento del injerto renal, donde la variabilidad interobservador es alta. El interés principal del modelo es su posible uso como herramienta de investigación en patología computacional, condicionado a la publicación del manuscrito y a la disponibilidad de pesos, validación externa y documentación que hoy no existen en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (según el identificador del repositorio; no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de imagen; sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repositorio de 0,4 GB, librería Keras) |
| Tarea | Segmentación semántica de imágenes histológicas renales |
| Modalidad de entrada | Imagen (presumiblemente parches de portaobjetos completos teñidos con HE) |
| Clases objetivo | i-IFTA, infiltrados focales, dilatación tubular |
| Framework | Keras |
| Tamaño del repositorio | 0,4 GB |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-15 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura más allá de lo que sugiere el identificador del repositorio (`_unet`), que apunta a una U-Net: un codificador convolucional con reducción progresiva de resolución, un decodificador con operaciones de aumento de resolución y conexiones de salto que conectan niveles equivalentes de codificador y decodificador. Esta topología es el estándar de facto en segmentación de imágenes biomédicas desde 2015 y resulta adecuada para delimitar estructuras tisulares a nivel de píxel. No se especifica el número de canales por nivel, la profundidad de la red, el uso de normalización por lotes, el tipo de función de pérdida ni si se empleó alguna variante (por ejemplo, U-Net con backbone preentrenado o atención en los saltos).

Tampoco hay información sobre el entrenamiento. La model card no indica el número de imágenes o portaobjetos utilizados, si el dataset procede de biopsias humanas de trasplante renal o de modelos animales, cómo se generaron las anotaciones de referencia (anotación por patólogos, criterios Banff u otros), qué estrategia de muestreo por parches se empleó, ni si hubo aumento de datos, ponderación de clases o validación cruzada. No consta ningún tipo de ajuste fino con retroalimentación humana (RLHF, DPO) ni aprendizaje por refuerzo, lo cual es esperable en un modelo de segmentación. Cualquier afirmación sobre calidad de generalización, robustez frente a variaciones de tinción o comportamiento en distintos escáneres es, a día de hoy, indemostrable con la información publicada.

## Capacidades

- Segmentación semántica por píxel de estructuras tubulointersticiales en imágenes histológicas renales teñidas con HE.
- Identificación y delimitación de áreas de i-IFTA (inflamación en zonas de fibrosis intersticial y atrofia tubular).
- Detección y segmentación de infiltrados inflamatorios focales.
- Detección y segmentación de túbulos con dilatación.
- Salida apta para cuantificación morfométrica: área afectada, proporción de tejido, número de focos, siempre que se combine con postprocesado aguas abajo.
- Procesamiento por parches o teselas, requisito habitual para abordar portaobjetos completos de tamaño gigapíxel.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües: no procesa texto.
- No dispone de modo de razonamiento explícito (thinking mode), audio ni vídeo.
- No hay evidencia publicada de capacidades adicionales (detección de glomérulos, clasificación de grado, segmentación multi-clase más allá de las tres entidades citadas).

## Casos de uso

- Cuantificación de i-IFTA en seguimiento de injerto renal: el modelo permitiría calcular de forma reproducible la fracción de área intersticial inflamada en biopsias protocolarias, reduciendo la variabilidad interobservador que afecta a la interpretación de los criterios Banff y aportando una métrica continua útil para estudios longitudinales.
- Investigación clínica retrospectiva sobre cohortes de portaobjetos completos: integrado en un pipeline de patología computacional, permitiría procesar cientos o miles de biopsias almacenadas y correlacionar la carga de inflamación y dilatación tubular con desenlaces como pérdida del injerto o deterioro de creatinina.
- Cuantificación de infiltrados focales: útil para caracterizar el patrón espacial de la infiltración linfocitaria (focal frente a difusa), un dato que la inspección visual resume de forma categórica pero que la segmentación convierte en área y número de focos medibles.
- Medición de dilatación tubular: permite obtener distribuciones de diámetro y área tubular por muestra, lo que facilita estudiar la progresión de la atrofia tubular y comparar subgrupos de tratamiento.
- Estudios de nefrotoxicidad en modelo animal o en muestras humanas: la segmentación automatizada aporta un criterio objetivo y escalable para evaluar daño tubulointersticial en estudios precínicos con múltiples brazos y tiempos.
- Triage y control de calidad en el flujo de anatomía patológica: la salida del modelo puede usarse para priorizar la revisión de las muestras con mayor carga inflamatoria, siempre como herramienta de apoyo y nunca como sustituto del diagnóstico del patólogo.
- Preprocesado para extracción de características: los mapas de segmentación sirven como entrada para modelos posteriores (clasificación de grado, predicción de respuesta) que operen sobre regiones de interés en lugar de sobre la imagen completa, reduciendo ruido y coste computacional.
- Anotación asistida y docencia: el modelo puede generar preanotaciones que el patólogo corrija, acelerando la creación de nuevos conjuntos de datos etiquetados y sirviendo de material didáctico sobre la delimitación de i-IFTA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a la cita del manuscrito en revisión y no incluye métricas de segmentación (Dice, IoU, sensibilidad, especificidad por clase), comparaciones con líneas base ni resultados de validación externa. No se deben asumir valores de rendimiento a partir del nombre o del tamaño del repositorio.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se ha publicado el número de parámetros ni la resolución de entrada del modelo, por lo que no es posible estimar con rigor el consumo de memoria.
- Estimación orientativa (no confirmada por el autor): una U-Net de segmentación tisular de tamaño moderado y entrada por parches suele requerir entre 2 y 8 GB de VRAM en inferencia en precisión simple, y menos si se convierte a FP16 o a un motor optimizado. Esta horquilla es una referencia genérica, no un dato del modelo.
- GPU recomendadas: no disponible. Por la naturaleza del modelo, una GPU de consumo con al menos 8 GB de memoria debería ser suficiente en el escenario descrito, pero no hay confirmación oficial.
- Cabeza en GPU de consumo: probablemente sí para inferencia por parches, con las reservas anteriores. No confirmado.
- Opciones de despliegue: al estar publicado con la librería Keras, las vías naturales son TensorFlow/Keras en Python, exportación a SavedModel o a TensorFlow Serving, y conversión a ONNX para servir con ONNX Runtime o NVIDIA Triton. No hay instrucciones de despliegue en el repositorio.
- Latencia y throughput: no disponible.
- Nota sobre portaobjetos completos: el procesamiento de una WSI completa exige teselado, inferencia por lotes y reconstrucción del mosaico, además de memoria del sistema para leer la imagen de nivel 0; esto es una consideración de pipeline, no una característica documentada del modelo.

## Comparativa con modelos similares

No hay datos de rendimiento publicados de este modelo, por lo que la comparación es estructural y no de precisión. Los parámetros de las alternativas se indican de forma cualitativa cuando no proceden de la información disponible.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRECARD_renal_histology_segmentation_unet | Segmentación de histología renal (HE) | no disponible | no aplica | CC-BY-4.0 | Pesos en HuggingFace, sin documentación de uso |
| nnU-Net | Segmentación biomédica auto-configurada | depende de la configuración | no aplica | Apache-2.0 (código) | Código abierto y ampliamente adoptado |
| Cellpose | Segmentación celular generalista | no disponible | no aplica | BSD-3 (versión 3.0; versiones previas MIT) | Código y modelos publicados |
| HoVer-Net | Segmentación y clasificación de núcleos en histología | no disponible | no aplica | Uso académico según publicación original | Pesos con disponibilidad limitada |
| MedSAM / SAM adaptado a imagen médica | Segmentación promptable generalista | cientos de millones | no aplica | Apache-2.0 (SAM) / según adaptación | Amplia disponibilidad |

La diferencia principal de la propuesta de TRECARD no es arquitectónica sino de objetivo clínico: se centra en tres entidades concretas del riñón (i-IFTA, infiltrados focales, dilatación tubular) en lugar de en la segmentación celular o de estructuras genéricas. No hay evidencia pública que permita afirmar que supera a estas alternativas en ninguna métrica.

## Limitaciones y advertencias

- Manuscrito en revisión por pares: la propia model card indica que el trabajo está sometido a publicación, por lo que los resultados no han sido validados de forma independiente.
- Ausencia total de documentación técnica en el repositorio: no hay descripción de la arquitectura, del dataset, del preprocesado ni del postprocesado, lo que impide reproducir el entrenamiento o auditar el modelo.
- Sin métricas publicadas: no se puede conocer la precisión, el recall ni el comportamiento por clase, lo que hace inviable evaluar su idoneidad para un uso concreto.
- Riesgo de alucinación en sentido amplio: como todo modelo de segmentación, puede producir máscaras plausibles pero incorrectas en regiones ambiguas (inflamación leve, artefactos de tinción, pliegues de tejido), sin ninguna señal de incertidumbre asociada.
- Sesgos desconocidos: al no conocerse la composición del conjunto de entrenamiento (centro hospitalario, tipo de escáner, protocolo de tinción, distribución de sexo y edad), no se puede estimar el sesgo de dominio ni su comportamiento en muestras de otros centros.
- Dependencia del dominio: los modelos de histología son sensibles a la variabilidad de tinción, al escáner y al grosor de corte; sin validación externa, el rendimiento fuera del entorno de desarrollo es incierto.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero no exime del cumplimiento de la normativa sanitaria aplicable.
- Uso clínico no autorizado: no consta marcado CE ni autorización de organismo regulador; el modelo debe considerarse de investigación y no un producto sanitario.
- Sin información sobre pesos: el repositorio ocupa 0,4 GB pero no se documenta qué ficheros contienen pesos utilizables ni en qué formato, lo que puede impedir la carga directa del modelo.
- Descargas y adopción nulas: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya reportado problemas o resultados.
- Requisito de postprocesado: para obtener las cuantificaciones mencionadas en el título del manuscrito (áreas, proporciones) hace falta un paso adicional no incluido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mhjoana98/TRECARD_renal_histology_segmentation_unet
- Manuscrito asociado: no disponible (en revisión por pares; no se ha publicado URL en la model card)
- Cita provisional (BibTeX): Mercado-Hernandez, J. et al. (2026). *A deep-learning-based tool for segmentation and quantification of i-IFTA, focal infiltrates, and tubular dilation in haematoxylin-eosin-stained renal whole-slide images*. Manuscript submitted for publication.
- Cita en formato APA: Mercado-Hernández, J., Martín-Calvo, D., Carniglia, G., Díaz-Morales, N., Düwell, A., Fuentes-Calvo, I., García Collado, L., Kovalchuk, A., López-Hernández, F. J., Martín-Fernández, N., Sancho-Martínez, S. M., & Martínez-Salgado, C. (2026). Manuscript submitted for publication.
- Repositorio de código, demo o documentación adicional: no disponible
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (corresponden a portales de registro académico ajenos al proyecto) y no se han utilizado como fuente.
