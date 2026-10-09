# Ira-1033/nataraj-mudra-grader

## Resumen

Nataraj Mudra Grader es un clasificador de visión por computador publicado por el usuario Ira-1033 en HuggingFace. No es un modelo de lenguaje ni una red neuronal profunda entrenada de extremo a extremo: se trata de un clasificador QDA (Quadratic Discriminant Analysis) de scikit-learn que opera sobre vectores geométricos de huesos derivados de landmarks de mano extraídos con MMPose. Su tarea es evaluar siete mudras de una sola mano propios del Bharatanatyam: Mushti, Shikhara, Pataaka, Tripataka, Suchi, Mukula y Kartari Mukha.

El repositorio no se limita al artefacto entrenado. Incluye los vectores de referencia por clase (`class_reference_vectors.json`) que alimentan una puntuación ponderada por rúbrica, el motor de retroalimentación direccional (`rubric_engine.py`), el código de extracción de landmarks (`mudra_core.py`), el punto de entrada de producción (`handler.py`), una demo local en Gradio, un `Dockerfile` y los checkpoints de MMPose necesarios para la detección y estimación de pose de la mano. Es, por tanto, un paquete reproducible de extremo a extremo, no solo un fichero de pesos.

Su relevancia es de nicho pero concreta: cubre un caso de uso de patrimonio cultural y educación dancística donde el feedback cuantitativo (desviación angular por dedo) es más útil que una simple etiqueta de clase. El QDA fue seleccionado tras una comparación entre fuentes frente a Random Forest, Extra Trees, SVM y LightGBM, por generalizar mejor entre orígenes fotográficos distintos. El repositorio no declara descargas ni interacciones y no publica métricas numéricas de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | QDA (Quadratic Discriminant Analysis) de scikit-learn sobre vectores de huesos derivados de landmarks de mano MMPose |
| Parámetros totales | No disponible (no se publica el número de coeficientes; depende de la dimensionalidad de los vectores de huesos) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; procesa una imagen por invocación) |
| Tipos de cuantización | No disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (la clasificación es de gestos, no lingüística) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_artifacts/mudra/qda_model.joblib`), JSON (`class_reference_vectors.json`) y checkpoints de MMPose en `models/mmpose/` |
| Tarea declarada | `image-classification` |
| Entrada | Bytes de imagen (la función principal recibe `image_bytes`) |
| Salida | Resultado de evaluación más imagen anotada codificada en base64 |
| Clases | 7 mudras: Mushti, Shikhara, Pataaka, Tripataka, Suchi, Mukula, Kartari Mukha |
| Tamaño del repositorio | 0,1 GB |
| Compatibilidad de despliegue | Etiqueta `endpoints_compatible`; demo local con Gradio |
| Fecha de creación y actualización | 2026-10-08 |

## Arquitectura y entrenamiento

El pipeline tiene dos etapas claramente separadas. La primera es la percepción: MMPose detecta la mano y estima sus landmarks; a partir de ellos, `mudra_core.py` construye vectores geométricos de huesos que describen la postura de los dedos de forma invariante a la escala y a la posición en la imagen. La segunda etapa es la clasificación: un QDA ajusta una frontera de decisión cuadrática, consciente de las correlaciones entre componentes del vector de huesos, sobre esos vectores de dimensión reducida.

La elección de QDA no es arbitraria. Según la model card, se compararon Random Forest, Extra Trees, SVM y LightGBM, y QDA fue el seleccionado por generalizar mejor entre fuentes fotográficas distintas, atribuyéndose ese comportamiento a su frontera de decisión suave y sensible a correlaciones. El autor documenta además un caso de fallo relevante durante la selección de clases: Ardha Chandra quedó fuera porque colapsaba a un 0 % de recall entre fuentes pese a parecer limpio en los datos de cribado. No se especifican el número de muestras, la composición del dataset, el origen de las fotografías ni el procedimiento de etiquetado; tampoco se documenta ningún ciclo de RLHF o DPO, que no aplican a este tipo de modelo. La model card remite a un artículo de investigación acompañante para los detalles completos del método, pero no incluye enlace al mismo.

La puntuación no se limita a la etiqueta ganadora: `rubric_engine.py` combina la predicción del clasificador con los vectores medios de huesos por clase para producir una nota ponderada por rúbrica y anotaciones direccionales del tipo «este dedo está N grados desviado», que es lo que aporta valor pedagógico frente a una clasificación plana.

## Capacidades

- Clasificación de siete mudras de una sola mano de Bharatanatyam: Mushti, Shikhara, Pataaka, Tripataka, Suchi, Mukula y Kartari Mukha.
- Detección y estimación de pose de mano mediante los checkpoints de MMPose incluidos en el repositorio.
- Extracción de geometría de huesos a partir de landmarks, lo que proporciona cierta invariancia a escala y traslación dentro del encuadre.
- Puntuación ponderada por rúbrica, no solo etiqueta discreta.
- Retroalimentación direccional y cuantificada en grados por dedo, orientada a la corrección de la postura.
- Generación de una imagen anotada devuelta en base64 junto al resultado de la evaluación.
- Punto de entrada único y estable (`handler._grade_mudra_impl`) que acepta un cliente compatible con S3, lo que facilita integrarlo en servicios existentes.
- Demo interactiva local mediante Gradio en `http://localhost:7860`.
- Despliegue como contenedor gracias al `Dockerfile` con dependencias fijadas.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente, multimodalidad de texto, audio ni capacidades multilingües.

## Casos de uso

- Enseñanza de Bharatanatyam en aula: el profesor puede capturar una fotografía del alumno y obtener no solo la etiqueta del mudra sino la desviación angular por dedo, lo que permite corregir la postura con un dato objetivo en lugar de una apreciación subjetiva.
- Práctica autónoma del alumno: la demo de Gradio permite repetir el gesto y recibir retroalimentación inmediata sin necesidad de un instructor presente, usando los vectores de referencia por clase como patrón de comparación.
- Evaluación estandarizada con rúbrica: `rubric_engine.py` produce una nota ponderada, de modo que distintos evaluadores pueden aplicar el mismo criterio numérico sobre una misma imagen, reduciendo la variabilidad entre correctores.
- Catalogación y conservación de patrimonio cultural: el clasificador puede etiquetar automáticamente archivos fotográficos o fotogramas de grabaciones de danza para construir índices consultables por mudra.
- Investigación en visión por computador: el repositorio sirve como referencia reproducible de un pipeline clásico (landmarks geométricos más clasificador estadístico) frente a alternativas de aprendizaje profundo, útil para estudios comparativos sobre reconocimiento de gestos de mano.
- Despliegue como endpoint HTTP: la etiqueta `endpoints_compatible` y el `handler.py` permiten exponer la evaluación como servicio y consumirla desde una aplicación móvil o web de práctica dancística.
- Filtrado de calidad en capturas: al devolver la imagen anotada y la desviación respecto a la referencia, puede usarse para descartar automáticamente imágenes mal encuadradas o con la mano no detectada antes de almacenarlas en un corpus mayor.
- Material didáctico interactivo: integrado en una aplicación educativa, el feedback en grados permite construir ejercicios guiados con umbrales de tolerancia configurables por el docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye cifras de exactitud, F1, matriz de confusión ni latencia para el clasificador final, y tampoco se aportan métricas numéricas de la comparación entre QDA, Random Forest, Extra Trees, SVM y LightGBM. La única evidencia cuantitativa mencionada es cualitativa: Ardha Chandra quedó descartada por un 0 % de recall entre fuentes.

| Modelo comparado | Resultado documentado | Métricas numéricas |
|---|---|---|
| QDA | Seleccionado por mejor generalización entre fuentes | No disponible |
| Random Forest | Evaluado, no seleccionado | No disponible |
| Extra Trees | Evaluado, no seleccionado | No disponible |
| SVM | Evaluado, no seleccionado | No disponible |
| LightGBM | Evaluado, no seleccionado | No disponible |
| Ardha Chandra (clase) | Descartada: 0 % de recall entre fuentes | 0 % de recall entre fuentes |

## Requisitos de hardware

- El artefacto de clasificación en sí es un modelo QDA serializado en joblib, de tamaño muy reducido; el grueso de los 0,1 GB del repositorio corresponde a los checkpoints de MMPose.
- No se publican requisitos de VRAM ni de RAM. La inferencia puede ejecutarse en CPU, ya que tanto la extracción de landmarks como un QDA son computacionalmente ligeros.
- No se publica una lista de GPU recomendadas. Una GPU consumer aceleraría la etapa de MMPose, pero no hay datos que permitan establecer umbrales concretos.
- Cabe en cualquier GPU consumer y, previsiblemente, en CPU; no obstante, esto es una inferencia a partir de la arquitectura declarada, no un dato publicado.
- Opciones de despliegue documentadas: instalación local con `requirements.txt`, demo Gradio con `python app.py`, contenedor mediante el `Dockerfile` incluido, e integración como endpoint (etiqueta `endpoints_compatible`).
- Dependencias pesadas: la instalación manual de PyTorch, MMCV y MMPose se describe como tediosa en la propia model card, motivo por el que se ofrece el `Dockerfile` con dependencias fijadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de métricas publicadas que permitan una comparativa cuantitativa. La model card documenta una comparación interna entre cinco clasificadores sobre el mismo pipeline de landmarks, pero sin cifras. Como alternativas de categoría se pueden considerar los clasificadores evaluados en ese mismo proceso, aunque sus especificaciones (parámetros, contexto, licencia) no están publicadas en este repositorio.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nataraj Mudra Grader (QDA) | Clasificador estadístico sobre landmarks | No disponible | No aplica | MIT | Repositorio HuggingFace |
| Random Forest (evaluado en la comparación) | Ensamblado de árboles | No disponible | No aplica | No disponible | Solo mencionado, no publicado aquí |
| Extra Trees (evaluado en la comparación) | Ensamblado de árboles | No disponible | No aplica | No disponible | Solo mencionado, no publicado aquí |
| SVM (evaluado en la comparación) | Clasificador de margen máximo | No disponible | No aplica | No disponible | Solo mencionado, no publicado aquí |
| LightGBM (evaluado en la comparación) | Gradient boosting | No disponible | No aplica | No disponible | Solo mencionado, no publicado aquí |

## Limitaciones y advertencias

- Cobertura de clases muy reducida: solo siete mudras de una mano. No se declara soporte para mudras de dos manos, gestos combinados ni otras tradiciones dancísticas.
- Una clase candidata, Ardha Chandra, quedó excluida por un 0 % de recall entre fuentes, lo que evidencia dificultades reales de generalización en el dominio de entrada.
- No se publican métricas de exactitud, F1 ni matrices de confusión, por lo que no es posible estimar la fiabilidad real del clasificador en producción.
- El repositorio registra 0 descargas y 0 interacciones, y no se ha sometido a validación externa conocida.
- Dependencia crítica de MMPose: si la detección de mano falla o los landmarks son imprecisos (oclusión, iluminación adversa, encuadre incorrecto), la clasificación posterior y la retroalimentación angular quedan comprometidas.
- Sensibilidad al dominio de la imagen: el propio autor justifica la elección de QDA por su mejor generalización entre fuentes fotográficas, lo que implícitamente reconoce variabilidad entre orígenes de captura.
- La licencia del repositorio es MIT, lo que permite uso comercial del código y del artefacto, pero los checkpoints de MMPose incluidos en `models/mmpose/` pueden estar sujetos a sus propias condiciones de licencia; conviene verificarlas antes de un despliegue comercial.
- La model card menciona un artículo de investigación acompañante con los detalles del método, pero no proporciona enlace, por lo que no es posible auditar el proceso de selección de clases ni el dataset.
- Las marcas temporales del repositorio (creación y actualización el 2026-10-08) resultan inconsistentes con la fecha actual y deben tratarse con cautela como metadato.
- No hay información sobre sesgos demográficos, de tono de piel o de condiciones de iluminación en los datos de entrenamiento, un aspecto relevante en visión por computador aplicada a personas.
- No se documentan límites de uso, política de errores ni procedimiento de escalado si el modelo falla en el aula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ira-1033/nataraj-mudra-grader
- Artículo de investigación mencionado en la model card: no disponible (se cita su existencia, pero no se incluye enlace)
- Repositorio de código, demo o paper adicionales: no disponibles en la información proporcionada
- Resultados de búsqueda web: las consultas realizadas no devolvieron enlaces relacionados con este modelo. Los resultados obtenidos corresponden a los Instituts Régionaux d'Administration franceses y a sus convocatorias de acceso, que no guardan relación con el modelo ni con su dominio de aplicación.
