# OpenMed/DeBERTa-v3-ClinicalTrials-NLI-Large-v1

## Resumen

DeBERTa-v3-ClinicalTrials-NLI-Large-v1 es un modelo de inferencia de lenguaje natural (NLI) especializado en verificar afirmaciones contra informes de ensayos clínicos. Lo desarrolla OpenMed, un proyecto que publica modelos abiertos para texto clínico y biomédico orientados a ejecución local. El modelo resuelve un problema concreto: dada una sección de un informe de ensayo (criterios de elegibilidad, intervención, resultados o eventos adversos) y una afirmación sobre dicho ensayo, determina si el informe respalda la afirmación (entailment), la contradice (contradiction) o no permite decidir (neutral), con una puntuación para cada clase.

Arquitectura DeBERTa-v3 en configuración large, con 435 millones de parámetros y una ventana de hasta 2.048 tokens para el par premisa-hipótesis. Deriva por fine-tuning del modelo MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli, un NLI generalista multilingüe, y se ha ajustado y evaluado sobre informes de ensayos de cáncer de mama.

Su relevancia actual radica en la combinación de licencia Apache-2.0, tamaño moderado que permite inferencia en CPU y una mejora sustancial frente al modelo base en la tarea específica: macro F1 de 83,65 frente a 62,71 del base. Está pensado para verificación factual de afirmaciones clínicas en entornos donde los datos no pueden salir de la infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DeBERTa-v3 (large), clasificación de secuencias |
| Parametros totales | 435.064.835 (435M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 2.048 tokens en el par premisa-hipótesis |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión completa; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un DeBERTa-v3 large adaptado a clasificación de tres clases mediante una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`). DeBERTa-v3 introduce atención disentangled y un mecanismo de embedding de posiciones relativas mejorado respecto a DeBERTa-v2, junto con una inicialización que sustituye el enmascaramiento de tokens por atención con span masking. La entrada se construye con la sección del informe de ensayo en el slot de premisa y la afirmación en el slot de hipótesis, en ese orden, que es el empleado en entrenamiento y evaluación.

El ajuste se realizó por fine-tuning del modelo NLI generalista de MoritzLaurer sobre pares de afirmaciones e informes de ensayos clínicos de cáncer de mama. La evaluación se llevó a cabo sobre un conjunto held-out de 196 pares de entailment y contradiction procedentes de 98 ensayos. La model card no detalla el volumen total de datos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. La innovación principal es la especialización vertical: el modelo base obtiene un macro F1 de 62,71 en la misma tarea, mientras que el fine-tuning eleva el resultado a 83,65.

## Capacidades

- Clasificación NLI de tres vías sobre texto clínico: entailment, neutral y contradiction, con probabilidad softmax por clase.
- Verificación de afirmaciones contra secciones específicas de informes de ensayos clínicos (elegibilidad, intervención, resultados, eventos adversos).
- Manejo de pares premisa-hipótesis de hasta 2.048 tokens, suficiente para secciones de informe con múltiples ítems.
- Soporte de comparación entre dos ensayos dentro de una misma entrada mediante el formato `Primary trial:` / `Secondary trial:`.
- Inferencia en CPU con resultados reproducibles en distintas versiones de transformers (4.57.6, 5.22.1 y 5.23.0).
- Integración con la librería transformers y con text-embeddings-inference según los tags del repositorio.
- No dispone de tool calling, capacidades de agente, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Verificación de afirmaciones en revisiones sistemáticas: dado un extracto de un ensayo y una afirmación extraída de una revisión, el modelo indica si el informe la respalda o la contradice, lo que permite priorizar la revisión manual de las contradicciones detectadas.
- Control de calidad de resúmenes automáticos de ensayos: tras generar un resumen de un informe clínico, cada frase puede contrastarse contra la sección original para detectar afirmaciones no sustentadas o invertidas.
- Cribado de elegibilidad de pacientes: comparar los criterios de inclusión y exclusión de un ensayo con afirmaciones sobre el perfil de un paciente para señalar posibles incompatibilidades antes de la evaluación humana.
- Extracción de eventos adversos con validación: verificar si una afirmación sobre toxicidad está respaldada por la sección de eventos adversos del informe, reduciendo falsos positivos en pipelines de farmacovigilancia.
- Auditoría de bases de datos de ensayos clínicos: comprobar la consistencia entre registros estructurados y el texto publicado de los informes, marcando discrepancias para revisión.
- Asistencia a comités de ética o revisión regulatoria: preclasificar alegaciones de los promotores contra el informe original para dirigir la atención del revisor a los puntos de contradicción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre 196 pares de entailment y contradiction de 98 ensayos de cáncer de mama, split held-out:

| Metrica | Valor |
|---|---|
| Macro F1 (entailment y contradiction, argmax de tres vías) | 83,65 |
| Accuracy | 83,67 |
| F1 entailment | 84,31 |
| F1 contradiction | 82,98 |
| Macro F1 del modelo base en la misma tarea | 62,71 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,8 GB para los pesos (el repositorio ocupa 1,7 GB); en fp16 alrededor de 0,9 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Ejecución viable en CPU: la model card confirma inferencia en CPU con resultados idénticos a los de GPU en las versiones de transformers probadas.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, text-embeddings-inference (según tags), y exportación a ONNX o cuantización con herramientas estándar para reducir latencia.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 435M con entradas de hasta 2.048 tokens, se espera un throughput alto en GPU y moderado en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento en la tarea |
|---|---|---|---|---|---|
| DeBERTa-v3-ClinicalTrials-NLI-Large-v1 | 435M | 2.048 tokens | NLI clínico (ensayos de cáncer de mama) | Apache-2.0 | Macro F1 83,65 |
| MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli | 435M | 2.048 tokens | NLI generalista multilingüe | no disponible en la información | Macro F1 62,71 en la misma tarea |
| DeBERTa-v3-large (base, sin fine-tuning NLI) | 435M | 2.048 tokens | encoder de propósito general | MIT (según el modelo original de Microsoft) | no disponible en la información |
| Modelos NLI clínicos alternativos | no disponible | no disponible | NLI clínico | no disponible | no disponible |

La comparación directa más fiable es con el modelo base, que es el único con resultado publicado en la misma evaluación. No se dispone de datos de otros modelos NLI clínicos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre ensayos de cáncer de mama: el rendimiento en otras áreas terapéuticas (cardiología, neurología, pediatría) no está validado y puede degradarse.
- Solo admite inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- El conjunto de evaluación es pequeño (196 pares de 98 ensayos), lo que implica intervalos de confianza amplios en las métricas reportadas.
- Los resultados de la model card están declarados por el autor y no han sido verificados de forma independiente.
- Riesgo de alucinación estructural: al ser un clasificador, no genera texto, pero puede asignar entailment o contradiction con alta confianza a afirmaciones ambiguas; la clase neutral existe precisamente para esos casos y debe calibrarse su umbral en producción.
- Sesgos potenciales heredados del modelo base NLI (MNLI, FEVER, ANLI, LingNLI, WANLI) y de la distribución de los informes de ensayos de cáncer de mama utilizados en el fine-tuning.
- No debe usarse como sustituto del juicio clínico ni de la revisión regulatoria; es una herramienta de cribado y priorización.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base.
- El formato de entrada es sensible: invertir el orden premisa-hipótesis o alterar la estructura de secciones (`Primary trial:`, una entrada por línea) puede degradar los resultados, ya que el modelo se entrenó con ese layout concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/DeBERTa-v3-ClinicalTrials-NLI-Large-v1
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Paquete OpenMed en PyPI: https://pypi.org/project/openmed/
- Modelo base: https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli
- Paper de DeBERTa-v3 (arXiv:2111.09543): https://arxiv.org/abs/2111.09543
- Paper referenciado arXiv:2508.01630: https://arxiv.org/abs/2508.01630
- OpenMed en X: https://x.com/OpenMed_AI
