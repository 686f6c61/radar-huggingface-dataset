# Natlis/svm-emotion-classification-ru

## Resumen

El modelo `Natlis/svm-emotion-classification-ru` es un clasificador de emociones en audio en lengua rusa desarrollado por Natlis. Se trata de un modelo baseline basado en una máquina de vectores de soporte (SVM) con kernel RBF, que clasifica fragmentos de audio en cuatro categorías emocionales: `angry`, `sad`, `neutral` y `positive`. El modelo fue entrenado sobre el corpus combinado `dusha_resd_train`, que integra las bases de datos Dusha y RESD, con un total de 69 136 registros de audio.

A diferencia de los modelos modernos basados en redes neuronales profundas, este clasificador utiliza características estadísticas extraídas del audio (como pitch y energía) y un SVM clásico de scikit-learn. Su relevancia radica en ser un punto de partida sencillo y reproducible para la investigación en reconocimiento de emociones en ruso, aunque su rendimiento es limitado (accuracy del 51 % en el conjunto de test). El repositorio incluye los artefactos necesarios para cargar el modelo y el escalador, así como los hiperparámetros y la documentación de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVM con kernel RBF (scikit-learn `SVC`) |
| Parametros totales | No aplicable (modelo clásico, no neuronal) |
| Parametros activos | No aplicable |
| Longitud de contexto | No disponible (procesa audio, no texto) |
| Tipos de cuantizacion | No aplicable (modelo clásico) |
| Idiomas soportados | Ruso (ru) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Pickle (`.pkl`) mediante `joblib` |

## Arquitectura y entrenamiento

El modelo es una SVM multiclase con kernel RBF, implementada con `sklearn.svm.SVC` (C=1.0, gamma='scale', seed 42). No se trata de una red neuronal ni de un transformer; es un clasificador clásico que opera sobre características estadísticas precalculadas del audio (pitch, energía, entre otras). Estas características se extraen durante la construcción del corpus, por lo que el modelo no procesa audio crudo directamente.

El entrenamiento se realizó sobre el corpus `dusha_resd_train`, que combina las bases de datos Dusha (Kondratenko et al., arXiv:2212.12266) y RESD (Aniemore, DOI 10.57967/hf/1272), con 69 136 registros. Las etiquetas emocionales fueron asignadas mediante crowdsourcing. No se menciona el uso de técnicas como RLHF o DPO, al tratarse de un modelo supervisado clásico. Los hiperparámetros completos están disponibles en `hyperparams.json` y `configs/audio/svm.json`.

## Capacidades

- Clasificación de emociones en audio ruso en cuatro clases: `angry`, `sad`, `neutral`, `positive`.
- Procesamiento de características estadísticas de audio (pitch, energía, etc.) previamente extraídas.
- Inferencia rápida y ligera al ser un modelo clásico, sin necesidad de GPU.
- Reproducibilidad total: se incluyen el modelo, el escalador, los hiperparámetros y la documentación de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la clasificación de audio.

## Casos de uso

- **Investigación en reconocimiento de emociones en ruso**: sirve como baseline para comparar con modelos más complejos (redes neuronales, transformers) en tareas de SER (Speech Emotion Recognition). Su simplicidad permite establecer una referencia de rendimiento.
- **Prototipado rápido de sistemas de análisis de sentimiento en audio**: al ser un modelo ligero, puede integrarse en pipelines de prueba de concepto para detectar emociones en grabaciones de voz, por ejemplo en centros de llamadas o entrevistas.
- **Educación y formación en ML**: útil para enseñar conceptos de SVM, extracción de características y evaluación de modelos de clasificación en audio, dado que el código de uso es sencillo y está documentado.
- **Análisis de corpus etiquetados**: puede utilizarse para verificar la coherencia de las etiquetas emocionales en nuevos conjuntos de datos en ruso, aunque con precaución por su limitada precisión.
- **Sistemas de recomendación de contenido emocional**: en aplicaciones que necesiten clasificar audiolibros, podcasts o música según la emoción predominante, siempre que el audio esté en ruso y se acepte un margen de error considerable.
- **Monitorización de calidad en servicios de voz**: para detectar patrones emocionales en grabaciones de atención al cliente, aunque su baja precisión (51 %) limita su uso en producción sin un umbral de confianza adecuado.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación sobre el conjunto `dusha_resd_test` (6616 registros). No se han publicado comparaciones con otros modelos en la información disponible.

| Clase | Precision | Recall | F1-score | Support |
|---|---|---|---|---|
| angry | 0.521 | 0.441 | 0.478 | 1378 |
| sad | 0.581 | 0.656 | 0.616 | 2213 |
| neutral | 0.377 | 0.385 | 0.381 | 1730 |
| positive | 0.546 | 0.499 | 0.521 | 1295 |
| **Accuracy** | | | **0.510** | 6616 |
| **F1-macro** | | | **0.499** | |

## Requisitos de hardware

- Al ser un modelo SVM clásico, la inferencia se realiza en CPU sin necesidad de GPU.
- El tamaño del repositorio es de 0.1 GB, por lo que el modelo y el escalador ocupan muy poco espacio en memoria (del orden de decenas de MB).
- Cualquier ordenador moderno con Python y scikit-learn puede ejecutar el modelo sin problemas.
- No se requieren bibliotecas de inferencia especializadas como vLLM u Ollama; basta con `joblib` y `huggingface_hub`.
- La latencia de inferencia es del orden de milisegundos, ya que solo implica una transformación de características y una predicción SVM.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente en la documentación proporcionada. Sin embargo, en el ámbito del reconocimiento de emociones en audio ruso existen alternativas basadas en redes neuronales (por ejemplo, modelos fine-tuned de wav2vec2 o HuBERT) que suelen alcanzar accuracy superiores al 70-80 %, aunque requieren más recursos computacionales. La comparativa no está disponible en los datos facilitados.

## Limitaciones y advertencias

- **Rendimiento limitado**: accuracy del 51 % y F1-macro de 0.499, lo que indica una capacidad de clasificación moderada, especialmente para la clase `neutral` (F1 de 0.381).
- **Modelo baseline**: no está optimizado para producción; el autor lo presenta como una referencia básica.
- **Dependencia de características precalculadas**: el modelo no procesa audio crudo; requiere que las características se extraigan con el mismo pipeline del proyecto, lo que puede limitar su portabilidad.
- **Idioma restringido**: solo funciona con ruso; no se garantiza su comportamiento con otros idiomas.
- **Etiquetado por crowdsourcing**: las etiquetas emocionales pueden contener ruido o subjetividad, afectando a la calidad del entrenamiento.
- **Generalización limitada**: el autor advierte que la transferencia a habla espontánea fuera de la distribución de entrenamiento no está garantizada.
- **Licencia CC BY-SA 4.0**: obliga a compartir cualquier obra derivada bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Natlis/svm-emotion-classification-ru)
- [Paper de Dusha (arXiv:2212.12266)](https://arxiv.org/abs/2212.12266)
- [RESD - Aniemore (DOI 10.57967/hf/1272)](https://huggingface.co/datasets/aniemore/Resd)
