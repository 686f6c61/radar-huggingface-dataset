# Kelmoir/cafa6-mf-span

## Resumen

Kelmoir/cafa6-mf-span es un modelo de clasificación de funciones de proteínas orientado a la competición CAFA 6 (Critical Assessment of Functional Annotation), un reto internacional que evalúa la capacidad de los sistemas para predecir la función biológica de proteínas a partir de su secuencia de aminoácidos. El nombre sugiere que se centra en la predicción de la ontología de función molecular (MF) y que fue entrenado específicamente para la tarea de clasificación de secuencias de proteínas. El autor es Kelmoir, un usuario de Hugging Face que también ha publicado otros modelos relacionados con CAFA 6, como `cafa6-esm` y un dataset `cafa6`.

El modelo cuenta con aproximadamente 33,75 millones de parámetros, un tamaño relativamente compacto para tareas de clasificación de secuencias biológicas. Está publicado bajo licencia Apache 2.0 y en formato safetensors, lo que facilita su uso en producción y su integración en pipelines de bioinformática. La información disponible es muy limitada: la model card está prácticamente vacía y no se especifican detalles de arquitectura, datos de entrenamiento ni resultados de benchmarks, por lo que esta ficha se basa en la información pública disponible en el repositorio y en el contexto de la competición CAFA 6.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente basada en ProtBERT de Rostlab, segun el nombre del modelo relacionado) |
| Parametros totales | 33.754.946 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (secuencias de aminoacidos, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo en la informacion disponible. El nombre del modelo (`cafa6-mf-span`) y la existencia de un modelo relacionado llamado `cafa6-esm` y otro con el sufijo `classification_rostlab_prot_bert_v1` en el mismo autor sugieren que se trata de un modelo basado en ProtBERTa de Rostlab, un transformer preentrenado sobre secuencias de proteínas, con una cabeza de clasificación adaptada para predecir funciones moleculares. Sin embargo, esto no se puede confirmar con los datos disponibles.

En cuanto al entrenamiento, no se ha publicado información sobre el dataset, el número de tokens, el procedimiento de entrenamiento ni si se aplicaron técnicas de ajuste fino con supervisión humana o RLHF. Dado el contexto de CAFA 6, es razonable suponer que se entrenó con datos de secuencias de proteínas anotadas con funciones de la Gene Ontology (GO), pero no hay evidencia concreta en los repositorios consultados.

## Capacidades

- Predicción de funciones moleculares (MF) de proteínas a partir de secuencias de aminoácidos, según la competición CAFA 6.
- Clasificación de secuencias biométricas en categorías funcionales de la Gene Ontology.
- Capacidad de procesar secuencias de proteínas de longitud variable, aunque la longitud máxima de contexto no está especificada.
- No se ha documentado soporte para generación de texto, tool calling, agentes o razonamiento multilingüe; es un modelo de clasificación específico para bioinformática.

## Casos de uso

- Anotación funcional de proteínas en laboratorios de biología computacional: el modelo puede predecir la función molecular de proteínas no anotadas, ayudando a investigadores a priorizar experimentos de validación. Con 33,7 millones de parámetros, es ligero y puede ejecutarse en GPU de consumo, lo que lo hace accesible para grupos de investigación pequeños.
- Descubrimiento de fármacos y desarrollo de terapias: las predicciones de función molecular pueden ayudar a identificar proteínas implicadas en enfermedades y a seleccionar dianas terapéuticas. El modelo se puede integrar en pipelines de análisis de secuencias de alto rendimiento.
- Priorización de experimentos de mutagénesis: en ingeniería de proteínas, se puede usar para predecir el efecto funcional de mutaciones puntuales, reduciendo el número de experimentos necesarios.
- Análisis de metagenomas: el modelo puede anotar funciones de proteínas predichas a partir de secuencias ambientales, ayudando a entender la función de microorganismos en ecosistemas.
- Educación y docencia en bioinformática: como modelo pequeño y de licencia abierta, es adecuado para enseñar predicción de funciones de proteínas en cursos de máster o doctorado.
- Integración en pipelines de anotación genómica: se puede incorporar en herramientas como InterProScan o pipelines de anotación de genomas para añadir una capa de predicción de funciones moleculares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar su rendimiento con otros modelos de predicción de función de proteínas como DeepFMA, NetGO 3.0 o los ganadores de CAFA anteriores. Se recomienda consultar la competición de CAFA 6 en Kaggle para conocer los resultados de los participantes, aunque no se dispone de datos específicos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero con 33,7 millones de parámetros en FP32, el peso del modelo ocupa aproximadamente 135 MB. En FP16 ocuparía unos 67 MB, por lo que la VRAM necesaria es mínima (menos de 1 GB) para inferencia de una sola secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lotes pequeños. Para lotes grandes o entrenamiento adicional, una GPU como NVIDIA T4, RTX 3060 o superior es adecuada.
- Se puede ejecutar en CPU para inferencia de baja velocidad (por ejemplo, en entornos sin GPU).
- Opciones de despliegue: dado el formato safetensors, se puede cargar con PyTorch o Hugging Face Transformers. Para producción, se puede usar vLLM (si se convierte a un formato compatible) o FastAPI para servir el modelo.
- Latencia y throughput: no disponibles, pero dado el tamaño del modelo, la inferencia debería ser del orden de milisegundos por secuencia en GPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos alternativos. Los modelos de predicción de función de proteínas más conocidos (como DeepFMA, CatBoost, ProtFun, etc.) tienen arquitecturas y datos de entrenamiento diferentes, y no se han publicado métricas comparables para este modelo. Se recomienda evaluar el modelo en un conjunto de validación propio antes de usarlo en producción.

## Limitaciones y advertencias

- La model card no contiene información sobre sesgos, alucinaciones o limitaciones específicas. Como modelo de clasificación biológica, la principal limitación es la precisión de las predicciones: es probable que tenga falsos positivos y negativos en funciones poco representadas en el dataset de entrenamiento.
- Riesgo de alucinación en términos de funciones: el modelo puede asignar funciones a proteínas sin evidencia experimental suficiente, lo que debe ser verificado por un experto antes de usarse en investigación clínica.
- Limitación de idioma: el modelo trabaja con secuencias de aminoácidos, no con lenguaje natural, por lo que no es útil para tareas de texto.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe respetar la atribución de autoría. Sin embargo, la ausencia de documentación sobre el dataset de entrenamiento puede plantear problemas de licencia de datos si se usa en producción.
- No se garantiza la reproducibilidad: al no publicarse detalles del entrenamiento, es difícil saber si el modelo está sesgado hacia ciertos tipos de proteínas o funciones.

## Enlaces

- Hugging Face: https://huggingface.co/Kelmoir/cafa6-mf-span
- Modelo relacionado: https://huggingface.co/Kelmoir/cafa6-esm
- Dataset relacionado: https://huggingface.co/datasets/Kelmoir/cafa6
- Competición CAFA 6 en Kaggle: https://www.kaggle.com/competitions/cafa-6-protein-function-prediction/overview/about-cafa-competitions
- Repositorio GitHub de ejemplo de CAFA 6: https://github.com/blazinbanana/cafa6
- Modelo relacionado en free2aitools: https://free2aitools.com/model/kelmoir/2026-02-14_cafa6_classification_rostlab_prot_bert_v1
