# selsar/cv_age_family_status_

## Resumen

`selsar/cv_age_family_status_` es un modelo de clasificación de texto publicado en Hugging Face por el usuario `selsar`, construido sobre la arquitectura DeBERTa-v2 y distribuido en formato `safetensors` para la librería `transformers`. Con 278.810.882 parámetros, se sitúa en el rango de los codificadores transformer de tamano medio-grande, muy por encima de un BERT-base (~110 M) y por debajo de un DeBERTa-v2-large (~435 M). El repositorio ocupa 1,1 GB, lo que es coherente con un checkpoint almacenado en fp32.

El identificador del modelo (`cv_age_family_status_`) sugiere, como hipótesis y no como dato confirmado, una tarea de clasificación sobre documentos tipo currículum vítae (CV) en la que se predicen atributos demográficos como la edad y la situación familiar. No obstante, la model card publicada es la plantilla automática de Hugging Face sin rellenar: no declara tarea concreta, conjunto de etiquetas, idioma, licencia ni procedencia de los datos de entrenamiento.

Su relevancia actual es limitada y de carácter práctico: se trata de un checkpoint anónimo, con cero descargas y cero valoraciones, sin documentación y sin licencia declarada. Resulta útil como ejemplo de modelo especializado en clasificación de documentos personales, pero no es evaluable ni auditable con la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder con attention desacoplada), segun los tags del repositorio |
| Parametros totales | 278.810.882 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la familia DeBERTa-v2 se entrena habitualmente con 512 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos se publican en fp32 y admiten cuantizacion dinamica int8 o int4 en PyTorch |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 1,1 GB |
| Autor | selsar |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es DeBERTa-v2, un transformer encoder que sustituye la attention estándar por attention desacoplada: representa el contenido y la posición de cada token en vectores separados, de modo que la puntuación de atención se calcula con matrices de contenido-a-contenido, contenido-a-posición y posición-a-contenido. Este diseño, descrito por He et al., mejora la modelización de dependencias relativas respecto a BERT y RoBERTa con un coste computacional comparable. Además, DeBERTa-v2 incorpora una capa de embedding de posición relativa compartida entre todas las capas y un mecanismo de attention con máscara de span. Con 278,8 M de parámetros, la configuración no coincide con ningún checkpoint público canónico de la familia, por lo que se trata de una configuración propia, presumiblemente con una cabeza de clasificación (`DebertaV2ForSequenceClassification`) entrenada o afinada sobre datos no declarados.

No hay información sobre el entrenamiento: se desconoce el número de tokens, la composición del dataset, el número y la definición de las clases, si hubo preentrenamiento desde cero o fine-tuning sobre un checkpoint DeBERTa-v2 público, ni si se aplicaron técnicas de alineación como RLHF o DPO (poco habituales en clasificadores encoder). Tampoco se documentan hiperparámetros, precisión mixta, hardware ni duración del entrenamiento. La model card es la plantilla autogenerada con todos los campos marcados como `[More Information Needed]`.

Conviene advertir un detalle habitual en repositorios generados automáticamente: el tag `arxiv:1910.09700` no corresponde al paper de DeBERTa (arXiv:2006.03654), sino a Lacoste et al. (2019), «Quantifying the Carbon Emissions of Machine Learning», que es la referencia que aparece en la sección de impacto ambiental de la plantilla. Es decir, ese tag es un artefacto de la plantilla y no una fuente técnica del modelo.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, con una cabeza que devuelve etiquetas y puntuaciones por secuencia de entrada.
- Codificación de texto para extracción de representaciones: al ser un encoder DeBERTa-v2, puede emplearse como extractor de embeddings (el repositorio incluye el tag `text-embeddings-inference`).
- Clasificación de documentos tipo CV: la tarea concreta (edad, situación familiar) se infiere del identificador, no está confirmada en la documentación.
- Compatibilidad con Text Embeddings Inference y con endpoints de Hugging Face, segun los tags `text-embeddings-inference` y `endpoints_compatible`.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, modo de razonamiento explícito ni generación de texto libre: es un encoder discriminativo, no un modelo generativo.
- Capacidades multilingües: no disponible. No se declara ningún idioma en el repositorio.

## Casos de uso

- Clasificación de currículums en procesos de selección: el modelo permitiría etiquetar documentos de candidatos según categorías de edad o situación familiar. Es el uso que sugiere el identificador, pero requiere validar previamente el conjunto de etiquetas real.
- Enrutado y triaje de candidaturas: usar la salida del clasificador como señal auxiliar para segmentar grandes volúmenes de CV en un ATS, siempre que la validación confirme la tarea.
- Anonimización y gobernanza de datos: detección de documentos que contienen atributos personales sensibles antes de almacenarlos, para aplicar reglas de retención o seudonimización en un pipeline de RR. HH.
- Investigación sociológica o demográfica sobre corpus documentales: clasificación de un corpus de CV anonimizados para estudiar patrones por franjas de edad, con las cautelas éticas y legales correspondientes.
- Enriquecimiento de metadatos en un buscador interno de talento: añadir etiquetas derivadas a cada documento para permitir filtrado facetado en una base documental.
- Componente de un clasificador en cascada: usar este modelo como primera etapa sobre documentos cortos (por ejemplo, el encabezado de un CV) y delegar los casos de baja confianza a un revisor humano o a un modelo mayor.
- Extracción de features para un modelo posterior: congelar el encoder y usar sus embeddings como entrada de un clasificador ligero propio (regresión logística, gradient boosting) afinado con datos de la organización.

En todos los casos, la adecuación real depende de datos que no están publicados, por lo que cualquier uso en producción exige una evaluación propia previa sobre un conjunto de validación representativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (accuracy, F1, precisión por clase), ni curva de aprendizaje, ni matriz de confusión, ni comparación con líneas base. Tampoco se documenta el conjunto de test utilizado.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | no disponible | No aplicable a un encoder discriminativo |
| GLUE | no disponible | No publicado |
| Métricas de la tarea propia | no disponible | Se desconoce el conjunto de etiquetas y el conjunto de evaluación |
| Latencia / throughput | no disponible | No se han publicado mediciones |

## Requisitos de hardware

- Pesos en fp32: aproximadamente 1,12 GB (278,8 M de parámetros × 4 bytes), consistente con el tamano de repositorio de 1,1 GB.
- Pesos en fp16 o bf16: aproximadamente 557 MB.
- Pesos en int8: aproximadamente 279 MB; en int4, en torno a 140 MB.
- VRAM estimada para inferencia en fp32: entre 1,5 y 2,5 GB con lotes pequeños, sumando activaciones y memoria del runtime.
- VRAM estimada en fp16: alrededor de 1-1,5 GB con lotes pequeños.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) y en GPU integradas o CPU para inferencia por lotes reducidos.
- Es perfectamente viable ejecutarlo únicamente en CPU para volúmenes moderados, dado su tamano.
- Opciones de despliegue: `transformers` con PyTorch, Text Embeddings Inference (tag `text-embeddings-inference`), Hugging Face Inference Endpoints (tag `endpoints_compatible`) y exportación a ONNX Runtime. vLLM y llama.cpp no son adecuados, ya que están orientados a modelos generativos causales.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerán del hardware, del lote y de la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este checkpoint, por lo que la comparación se limita a características estructurales y de disponibilidad. Los recuentos de parámetros de las alternativas son valores aproximados de referencia de cada arquitectura pública.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| selsar/cv_age_family_status_ | 278,8 M | no disponible | Clasificación (etiquetas no declaradas) | no disponible | Repositorio público, 0 descargas |
| microsoft/deberta-v2-base | ~139 M | 512 tokens | Modelo base, requiere fine-tuning | MIT | Checkpoint oficial muy difundido |
| microsoft/deberta-v2-large | ~435 M | 512 tokens | Modelo base, requiere fine-tuning | MIT | Checkpoint oficial muy difundido |
| roberta-base (Liu et al.) | ~125 M | 512 tokens | Modelo base, requiere fine-tuning | MIT | Checkpoint oficial muy difundido |

La diferencia principal no es de rendimiento, sino de trazabilidad: las alternativas son checkpoints oficiales con licencia explícita y documentación de preentrenamiento, mientras que este repositorio no declara licencia, idioma, datos ni métricas. Para una tarea concreta de clasificación de documentos, partir de un DeBERTa-v2 base o large oficial y afinarlo con datos propios es, con la información disponible, una opción más controlable.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin rellenar; no se declara tarea, etiquetas, datos ni métricas.
- Licencia no disponible: sin licencia explícita no hay autorización clara para uso comercial. En la práctica, un repositorio sin licencia equivale a «todos los derechos reservados» por defecto en muchas jurisdicciones, lo que desaconseja su uso en producción.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas de alta confianza, sin calibración conocida ni umbral recomendado.
- Sesgo y discriminación: clasificar personas por edad y situación familiar a partir de un CV afecta a atributos protegidos. Un modelo así puede amplificar sesgos históricos del corpus de entrenamiento y vulnerar el RGPD y la normativa de igualdad en procesos de selección si se usa como criterio de decisión.
- Idiomas: no declarados. Se desconoce si el modelo funciona en castellano y su rendimiento fuera del idioma de entrenamiento.
- Longitud de contexto: no declarada. Los documentos largos probablemente requieran truncado o segmentación, con pérdida de información.
- Procedencia de los datos opaca: al no documentarse la composición del dataset, no puede evaluarse si contiene datos personales, si hubo consentimiento ni si existe riesgo de memorización de información sensible.
- Sin mantenimiento ni soporte: cero descargas, cero valoraciones y sin historial de actualizaciones más allá de la fecha de creación.
- Fecha de creación anómala (2026-09-15) en los metadatos del repositorio, lo que dificulta interpretar su antigüedad real.
- La búsqueda web realizada no ha devuelto ninguna referencia técnica al modelo: los resultados obtenidos eran conversores de husos horarios y no guardan relación con este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selsar/cv_age_family_status_
- Paper de DeBERTa (arquitectura base referenciada por el tag `deberta-v2`): https://arxiv.org/abs/2006.03654
- Referencia del tag `arxiv:1910.09700` en el repositorio (Lacoste et al., 2019, sobre emisiones de carbono, citada en la plantilla): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML citada en la plantilla: https://mlco2.github.io/impact
- Repositorio oficial de DeBERTa: https://github.com/microsoft/DeBERTa
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada.
