# nidl-neurospin/brainiac-vit-b

## Resumen

BrainIAC ViT-B es un modelo fundacional auto-supervisado para resonancia magnetica estructural cerebral, desarrollado originalmente por el grupo de investigación del paper publicado en *Nature Neuroscience* (Tak et al., 2026) y redistribuido en Hugging Face por nidl-neurospin (NeuroSpin). Se trata de un vision transformer 3D (ViT-B con parches de 16³) entrenado con SimCLR sobre volúmenes de MRI cerebral, cuyo objetivo es producir representaciones (features) de 768 dimensiones transferibles a múltiples tareas clínicas y neurocientíficas: predicción de edad cerebral, clasificación de mutación IDH, deterioro cognitivo leve, supervivencia en glioma o tiempo hasta ictus.

El modelo resuelve el problema de la escasez de datos etiquetados en neuroimagen médica: en lugar de entrenar desde cero para cada tarea, se extraen features congelados del encoder preentrenado y se ajusta un clasificador o regresor ligero encima. Con 88,3 M de parámetros en el encoder (90,5 M totales incluyendo la cabeza de proyección), es lo bastante compacto para ejecutarse en GPUs de consumo, aunque su entrada 3D de 96³ y el preprocesado requerido lo alejan de los flujos de trabajo de NLP convencionales.

Es relevante ahora porque consolida la tendencia de modelos fundacionales en imagen médica 3D y porque su redistribución vía la librería `nidl` facilita su uso reproducible en pipelines de PyTorch, con preprocesado estandarizado y compatibilidad con fine-tuning. Su licencia es estrictamente de investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (ViT-B) con parches de 16³, entrenado con SimCLR (contrastivo auto-supervisado) |
| Parametros totales | 90.514.688 (encoder: 88,3 M; incluye cabeza de proyección) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D; entrada fija 1 × 96 × 96 × 96) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen médica, sin capacidad lingüística) |
| Licencia | BrainIAC Research-Only License (solo investigación académica y educación, no comercial) |
| Formato de pesos | safetensors |
| Dimension de features | 768 |
| Entrada esperada | MRI cerebral con skull-stripping (HD-BET), corrección de sesgo (N4), registrada rígidamente a plantilla BrainIAC (170 × 206 × 162 a 1 mm, LAS) |
| Libreria | nidl (`nidl.estimators.ssl.SimCLR`) |

## Arquitectura y entrenamiento

El modelo es un ViT-B tridimensional: divide el volumen de entrada en parches cúbicos de 16³ y procesa la secuencia resultante con un transformer estándar. El preentrenamiento emplea SimCLR, un marco contrastivo que aprende representaciones invariantes a aumentaciones de la imagen sin necesidad de etiquetas. El checkpoint redistribuido incluye tanto el encoder como la cabeza de proyección empleada durante el entrenamiento contrastivo.

Una diferencia relevante respecto al código original: el modelo original no usa token de clase y devuelve el primer token de parche (una posición de esquina del volumen). La implementación de `nidl` promedia los tokens de parche tras la normalización final, por lo que sus features difieren de las del modelo original. La cabeza de proyección, en cambio, se entrenó sobre ese primer token de parche. El autor reporta que el encoder devuelve los mismos tokens que una implementación independiente del modelo original con una tolerancia de 1e-6. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de que son MRI cerebrales estructurales de varias secuencias.

## Capacidades

- Extracción de features de MRI cerebral estructural 3D: devuelve un vector de 768 dimensiones por volumen.
- Aprendizaje auto-supervisado contrastivo (SimCLR): representaciones útiles sin etiquetas.
- Transferencia a tareas clínicas mediante regresión ridge sobre features congelados o fine-tuning con `fit`.
- Tareas evaluadas por los autores: predicción de edad cerebral, clasificación de mutación IDH, clasificación de deterioro cognitivo leve, supervivencia en glioma y predicción de tiempo hasta ictus.
- Preprocesado integrado (`BrainIACPreprocessing`): redimensionado a 96³ y estandarización de vóxeles cerebrales.
- Utilidad de cropping: volúmenes registrados a otra plantilla 1 mm LAS pueden recortarse al campo de visión de la plantilla BrainIAC.
- No soporta tool calling, agentes, generación de texto, visión natural ni capacidades multilingües: es un extractor de features de imagen médica.

## Casos de uso

- Predicción de edad cerebral: extraer features congelados y ajustar una regresión ridge; el autor reporta MAE de 6,47 años (R² 0,47) en OpenBHB, lo que lo hace adecuado como biomarcador de envejecimiento cerebral en cohortes de investigación.
- Clasificación de mutación IDH en glioma: usar los features como entrada a un clasificador ligero para estratificar tumores, tarea clínica de alto interés pronóstico.
- Detección de deterioro cognitivo leve: servir como extractor en pipelines de cribado de cohortes con etiquetas escasas, aprovechando el preentrenamiento contrastivo.
- Análisis de supervivencia en glioma: alimentar modelos de supervivencia con representaciones 768-d en lugar de imágenes crudas, reduciendo la dimensionalidad y el sobreajuste.
- Predicción de tiempo hasta ictus: integrar el encoder en estudios longitudinales de riesgo cerebrovascular como extractor de features por visita.
- Investigación en neuroimagen a gran escala: procesar cohortes (por ejemplo OpenBHB) con features estandarizados para análisis estadísticos, clustering de fenotipos o búsqueda de similitud entre sujetos.
- Fine-tuning sobre datasets pequeños: usar `fit` de nidl para adaptar el encoder a una tarea concreta cuando se dispone de pocas etiquetas.

## Benchmarks y rendimiento

| Tarea / dataset | Metrica | Resultado |
|---|---|---|
| OpenBHB test (757 participantes), regresión ridge sobre features congelados, edad | MAE | 6,47 años |
| OpenBHB test (757 participantes), regresión ridge sobre features congelados, edad | R² | 0,47 |
| Fidelidad frente a implementación original | Diferencia de tokens | ≤ 1e-6 |

No se han publicado en la información disponible resultados numéricos de los benchmarks clínicos del paper (IDH, deterioro cognitivo leve, supervivencia en glioma, tiempo hasta ictus) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 88,3 M de parámetros en fp32 el encoder ocupa aproximadamente 0,35 GB de pesos, más activaciones para lotes de volúmenes 96³ (el consumo real depende del batch size).
- GPU recomendadas: cualquier GPU con suficiente VRAM para el batch deseado; el tamaño del modelo permite GPUs de consumo como RTX 3090 o RTX 4090, aunque no se han publicado mediciones oficiales.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; las activaciones de la entrada 3D y el preprocesado son el factor limitante, no el número de pesos.
- Opciones de despliegue: librería `nidl` sobre PyTorch (`pip install nidl[pretrained]`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrainIAC ViT-B (este) | 88,3 M (encoder) | MRI 3D 96³ | SimCLR | Research-only | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoría (modelos fundacionales de MRI cerebral 3D) que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia BrainIAC Research-Only: uso restringido a investigación académica y educación; prohibido el uso comercial.
- Modelo específico de MRI cerebral estructural: no procesa texto, imágenes naturales, audio ni otros dominios.
- Requiere un preprocesado estricto (skull-stripping con HD-BET, corrección N4, registro rígido a la plantilla BrainIAC); desviaciones en el pipeline degradan las features.
- Diferencia de features respecto al modelo original: `nidl` promedia tokens de parche en lugar de usar el primer token, por lo que los resultados no son directamente comparables con los del código original.
- La cabeza de proyección se entrenó sobre el primer token de parche, lo que puede introducir inconsistencias si se usa con el promedio de tokens.
- Riesgo de sesgo poblacional: el rendimiento depende de la distribución de los datos de preentrenamiento, no detallada en la información disponible; puede generalizar peor en cohortes con características distintas (edad, patología, secuencia, equipo).
- No es un dispositivo médico: no debe usarse para diagnóstico clínico sin validación regulatoria.
- No se documentan tasas de alucinación ni calibración en tareas clínicas; los resultados reportados (MAE 6,47 años) provienen de una única evaluación en OpenBHB.
- El repositorio tiene pocas descargas (306) y ningún like, lo que sugiere adopción temprana y escasa validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nidl-neurospin/brainiac-vit-b
- Paper: https://doi.org/10.1038/s41593-026-02202-6
- Código y pesos originales: https://github.com/AIM-KannLab/BrainIAC
- Documentación de nidl: https://neurospin-deepinsight.github.io/nidl
- Ejemplo en OpenBHB: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_pretrained_openbhb.html
