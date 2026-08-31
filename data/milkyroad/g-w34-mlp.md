# milkyroad/G-w34-mlp

## Resumen

G-w34-MLP es un modelo de clasificación de fotogramas de cistoscopia desarrollado por el usuario milkyroad (Milky Road) en Hugging Face. Se trata de un perceptrón multicapa (MLP) de tres clases diseñado para la detección de cáncer de vejiga a partir de características visuales extraídas con MedSigLIP-448, un modelo de visión de tipo SigLIP. El modelo aborda el problema del desequilibrio de clases mediante una función de pérdida focal con pesos de clase [1, 34, 1], donde la clase intermedia (probablemente la de tumor) recibe un peso 34 veces mayor. Está pensado para evaluar la robustez frente a cambios de dominio (domain shift) en entornos clínicos.

La relevancia de este modelo radica en su enfoque específico para un problema médico concreto: la clasificación de imágenes de cistoscopia para apoyar el diagnóstico del cáncer de vejiga. Al ser un MLP pequeño y entrenado sobre características precalculadas, su coste computacional es mínimo, lo que lo hace adecuado para entornos con recursos limitados. Sin embargo, se trata de un modelo de investigación, sin validación clínica, y su uso en producción requeriría una evaluación exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) de 3 clases, sin detalles de capas o neuronas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa características, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | checkpoint PyTorch (best_model.pt) |

## Arquitectura y entrenamiento

El modelo es un MLP que toma como entrada características de 448 dimensiones (probablemente 768, pero no se especifica) extraídas con MedSigLIP-448, un modelo de visión de tipo SigLIP con normalización ring-norm. Estas características se procesan a través de capas totalmente conectadas con activaciones no lineales, aunque no se detalla el número de capas ni de neuronas. La salida es una distribución de probabilidad sobre tres clases, que corresponden a categorías de fotogramas de cistoscopia (posiblemente normal, tumor y otra clase, aunque no se especifica).

El entrenamiento se realizó con una función de pérdida focal (FocalLoss) con gamma=3 y label smoothing 0, escalada por pesos de clase [1, 34, 1] para compensar el fuerte desequilibrio entre clases. Se usó un tamaño de lote de 256 y se ejecutaron 5 semillas (42-46) para evaluar la variabilidad. La evaluación se hizo sobre un conjunto de test congelado (frozen Source-D test), lo que sugiere una validación en un dominio distinto al de entrenamiento. No se proporcionan detalles sobre el número de épocas, el optimizador o la composición del dataset.

## Capacidades

- Clasificación de fotogramas de cistoscopia en 3 clases, orientada a la detección de cáncer de vejiga.
- Manejo de desequilibrio de clases mediante pesos y pérdida focal.
- Evaluación de robustez frente a cambios de dominio (domain shift) entre conjuntos de datos.
- Inferencia de bajo coste computacional al ser un MLP sobre características precalculadas.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Asistencia al diagnóstico en cistoscopia: el modelo puede clasificar fotogramas de vídeo de cistoscopia en tiempo real para alertar al urólogo sobre posibles lesiones tumorales, reduciendo la carga de revisión manual.
- Triaje de imágenes médicas: integrado en un pipeline de análisis de imágenes, puede priorizar casos sospechosos para revisión prioritaria por especialistas.
- Investigación en domain shift: al estar entrenado con un test congelado de otro dominio, sirve como banco de pruebas para estudiar la generalización de modelos de clasificación médica.
- Formación de modelos más complejos: las predicciones del MLP pueden usarse como pseudoetiquetas o características para entrenar modelos más grandes o ensembles.
- Monitorización de calidad de vídeo: en sistemas de grabación de cistoscopias, puede identificar fotogramas con baja calidad o sin información relevante (clase normal) para descartarlos del análisis.
- Evaluación de algoritmos de extracción de características: al ser un clasificador ligero, permite comparar rápidamente la calidad de diferentes representaciones visuales (por ejemplo, MedSigLIP frente a otros extractores).

## Benchmarks y rendimiento

La model card reporta las siguientes métricas medias en el conjunto de test (con desviación estándar para el recall de NML):

| Metrica | Valor |
|---|---|
| NML Recall | 0.215 ± 0.083 |
| NML Precision | 0.293 |
| MT Recall | 0.867 |
| NROI Recall | 0.948 |
| MCC (reconstruido) | ~0.70 |

No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje. Estas métricas corresponden a clases específicas (probablemente NML = no maligno, MT = tumor maligno, NROI = no región de interés), pero la nomenclatura exacta no está definida en la documentación.

## Requisitos de hardware

- Al ser un MLP pequeño, los requisitos de hardware son mínimos. Puede ejecutarse en CPU sin necesidad de GPU.
- La VRAM estimada es inferior a 1 GB, incluso con el checkpoint completo en memoria.
- Cualquier GPU moderna (incluso integradas) es suficiente; una RTX 3060 o superior sería más que adecuada.
- El despliegue puede hacerse con PyTorch estándar, sin necesidad de frameworks de inferencia optimizados como vLLM o TGI.
- La latencia por inferencia es del orden de microsegundos a milisegundos, dependiendo del hardware, ya que solo procesa un vector de características.
- No se dispone de datos de throughput específicos, pero al ser un MLP, puede procesar miles de fotogramas por segundo en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de fotogramas de cistoscopia con MLP sobre características precalculadas). No se han encontrado referencias a otros modelos con la misma arquitectura y propósito en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para fotogramas de cistoscopia y no es generalizable a otros dominios médicos o imágenes.
- Las métricas de recall para la clase NML son bajas (0.215), lo que indica un rendimiento pobre en la detección de casos no malignos, posiblemente debido al fuerte desequilibrio de clases.
- No se ha realizado una validación clínica; el modelo es un artefacto de investigación y no debe usarse para diagnóstico real sin supervisión médica.
- La licencia CC-BY-SA-4.0 permite uso comercial, pero exige atribución y compartir derivados bajo la misma licencia, lo que puede ser restrictivo para integraciones propietarias.
- No se especifican los datos de entrenamiento ni su procedencia, lo que limita la evaluación de sesgos y la reproducibilidad.
- El checkpoint guardado es solo el modelo final, no los checkpoints por semilla, lo que impide analizar la variabilidad entre ejecuciones.
- No se proporciona información sobre el preprocesado de las imágenes ni sobre cómo se extraen las características de MedSigLIP, lo que dificulta la reproducción exacta.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/milkyroad/G-w34-mlp)
- [Perfil del autor en Hugging Face](https://huggingface.co/milkyroad)
- [Datasets del autor](https://huggingface.co/milkyroad/datasets)
