# sander-puts/codiesp-procedure-dense-lead-es

## Resumen

Codiesp procedure dense lead-es es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de términos cabecera de procedimientos médicos en textos clínicos en español, orientado a la codificación automática con ICD-10-PCS. Lo desarrolla el autor independiente sander-puts como parte del proyecto CEI-Trace, un sistema que codifica texto clínico según los libros oficiales ICD-10 mediante modelos de lenguaje locales. El modelo se afina a partir de PlanTL-GOB-ES/roberta-base-biomedical-clinical-es, un RoBERTa de base biomédica en español.

El problema que aborda es concreto: identificar cada palabra de procedimiento que un codificador clínico buscaría en el índice ICD-10-PCS, incluyendo aquellas que los anotadores del corpus CodiEsp no marcaron. Para ello se entrena sobre etiquetas "densas": las anotaciones originales más las ocurrencias de términos cabecera del índice ICD-10-PCS que un modelo de lenguaje local (gemma-4-12B) juzgó como procedimientos relevantes del registro. Es relevante porque forma parte de una cadena de tres detectores (mención, fragmento y cabecera densa) que construyen las unidades de procedimiento que después codifica el arnés de codificación de CEI-Trace.

El modelo es un detector de términos cabecera, no un codificador completo: su salida son spans de texto que alimentan etapas posteriores. Se distribuye con licencia CC BY 4.0 y está pensado exclusivamente para investigación, no para uso clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base biomédico, `PlanTL-GOB-ES/roberta-base-biomedical-clinical-es`) con cabeza de token classification |
| Parametros totales | no disponible (modelo base RoBERTa base, ~125M en el encoder; el repo incluye `heads.pt` y `encoder/`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 256 tokens con stride 128 durante el entrenamiento; contexto nativo del RoBERTa base (no especificado en la información) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | español (`es`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`encoder/`, `heads.pt`) |

## Arquitectura y entrenamiento

El modelo es un encoder RoBERTa de dominio biomédico en español al que se añade una cabeza de clasificación de tokens para etiquetado de spans (token-classification). No emplea arquitecturas MoE, SSM ni híbridas: es un transformer encoder estándar con atención completa, adaptado al dominio clínico mediante el modelo base de PlanTL-GOB-ES.

El entrenamiento se realizó sobre los textos de entrenamiento de CodiEsp con 10 épocas, tasa de aprendizaje 3e-5, tamaño de lote 4, ventanas de 256 tokens con stride 128 y semilla 2025; la época final se seleccionó sobre el conjunto de desarrollo (época 3). La innovación principal está en las etiquetas: además de las cabeceras de procedimiento anotadas, se incluyen todas las ocurrencias de palabras cabecera de términos principales del índice ICD-10-PCS en español que quedaban fuera de las anotaciones y que un modelo local (gemma-4-12B, una pregunta por ocurrencia con cita verificada) consideró que nombraban un procedimiento del registro que un codificador consultaría. El autor advierte que estas etiquetas son en parte derivadas de modelo: constituyen un objetivo de entrenamiento, no un censo validado.

## Capacidades

- Detección de términos cabecera de procedimientos médicos en texto clínico en español (token classification).
- Etiquetado denso: localiza tanto las cabeceras anotadas en CodiEsp como ocurrencias adicionales de términos del índice ICD-10-PCS.
- Salida de spans con límites de token, apta para alimentar etapas posteriores de codificación.
- Integración en el pipeline CEI-Trace mediante `NER_LAYERS=lead python pipelines/codiesp.py detect --model <carpeta>`.
- Combinación con los otros dos detectores de procedimiento (`codiesp-procedure-mention-lead-es` y `codiesp-procedure-fragment-es`) para construir unidades de procedimiento.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un modelo discriminativo de etiquetado.
- Capacidad multilingüe limitada al español.

## Casos de uso

- Codificación automática de informes de alta: el detector extrae las cabeceras de procedimiento que un codificador consultaría en el índice ICD-10-PCS, que después se resuelven a códigos en el arnés de CEI-Trace.
- Preanotación asistida para codificadores humanos: al ser denso, señala procedimientos que las anotaciones originales de CodiEsp no marcaban, reduciendo omisiones en la revisión manual.
- Construcción de unidades de procedimiento: combinado con los detectores de mención y fragmento, genera las unidades que el pipeline `procedure-units` codifica.
- Investigación en NLP clínico en español: sirve como componente reproducible para experimentos de extracción de entidades y normalización a terminologías.
- Evaluación de estrategias de etiquetado denso: permite estudiar el impacto de etiquetas derivadas de modelo frente a anotaciones humanas en tareas de NER clínico.
- Procesamiento por lotes de corpus de casos clínicos publicados: al ser un RoBERTa base, puede ejecutarse en CPU o GPU modesta para anotar grandes volúmenes de texto.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Recuperación de cabeceras de procedimiento anotadas (desarrollo) | 0.902 |
| Recuperación con límites exactos (desarrollo) | 0.888 |
| Precisión frente a las anotaciones | baja por diseño (el modelo busca cabeceras no anotadas) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; las únicas métricas son las de desarrollo reportadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un RoBERTa base (~125M parámetros), la inferencia en fp32 requiere del orden de 0,5-1 GB de VRAM; en fp16, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: la model card indica el uso mediante el repositorio CEI-Trace (`pipelines/codiesp.py`); al ser un modelo de `transformers` con safetensors, también puede servirse con Hugging Face `transformers`, TGI o `text-embeddings-inference` según el caso, aunque no se documentan configuraciones específicas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| codiesp-procedure-dense-lead-es | RoBERTa base biomédico + cabeza NER | ~125M (encoder) | ventanas de 256 tokens en entrenamiento | Detección densa de cabeceras de procedimiento ICD-10-PCS | CC BY 4.0 |
| codiesp-procedure-mention-lead-es | RoBERTa base biomédico + cabeza NER | ~125M (encoder) | no disponible | Detección de menciones de procedimiento | no disponible |
| codiesp-procedure-fragment-es | RoBERTa base biomédico + cabeza NER | ~125M (encoder) | no disponible | Detección de fragmentos de procedimiento | no disponible |
| PlanTL-GOB-ES/roberta-base-biomedical-clinical-es | RoBERTa base | ~125M | no disponible | Modelo base biomédico en español | Apache-2.0 |

Los dos primeros son componentes del mismo pipeline CEI-Trace y no alternativas independientes; el modelo base es el punto de partida del ajuste fino. No se dispone de comparaciones con otros sistemas de codificación clínica en la información proporcionada.

## Limitaciones y advertencias

- No apto para uso clínico: el autor lo declara explícitamente; es una herramienta de investigación.
- Las etiquetas de entrenamiento son en parte derivadas de un modelo (gemma-4-12B), por lo que reflejan un objetivo de entrenamiento y no un censo validado de procedimientos.
- Precisión baja frente a las anotaciones humanas por diseño: el modelo busca cabeceras no anotadas, lo que genera falsos positivos respecto a CodiEsp.
- Entrenado únicamente con textos de CodiEsp (informes de casos clínicos publicados); puede generalizar mal a otros géneros clínicos o a variantes dialectales del español.
- Solo español; no cubre otras lenguas.
- Ventanas de 256 tokens con stride 128: los procedimientos que cruzan los límites de ventana pueden fragmentarse o perderse.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el autor restringe el uso a investigación y prohíbe el uso clínico.
- Riesgo de alucinación de spans: al ser un modelo discriminativo, el riesgo se manifiesta como falsos positivos de cabeceras, no como texto generado.
- No se documentan sesgos específicos más allá de los derivados del corpus y del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sander-puts/codiesp-procedure-dense-lead-es
- Repositorio CEI-Trace: https://github.com/putssander/CEI-Trace
- Modelo base: https://huggingface.co/PlanTL-GOB-ES/roberta-base-biomedical-clinical-es
- Corpus CodiEsp (Miranda-Escalada et al., CLEF eHealth 2020): https://doi.org/10.5281/zenodo.3837305
- Artículo de CEI-Trace: Puts S, Dekker A. *CEI-Trace: fitting ICD-10 coding to a setting's guidelines and practice in layers around one official core* (2026); referencia citada en la model card, sin URL directa disponible.
