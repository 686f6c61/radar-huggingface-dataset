# hunter-lab/sentence-level-ignorance-classifier

## Resumen

El modelo `hunter-lab/sentence-level-ignorance-classifier` es un clasificador binario de frases desarrollado por The Hunter Lab (Nathan Gelfand, Darya Shlyk y Larry Hunter) que determina si una oración constituye una declaración de ignorancia, es decir, un enunciado que indica una falta de conocimiento sobre un tema concreto. En el ámbito de la investigación biomédica, estas declaraciones suelen señalar preguntas sin responder, por lo que el modelo resulta útil para identificar lagunas de conocimiento en la literatura científica y orientar nuevas líneas de estudio.

Se trata de un ajuste fino supervisado de BioMedBERT (`microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`), un encoder BERT preentrenado sobre abstracts de PubMed, al que se añade una cabeza de clasificación lineal. El modelo tiene 109.483.778 parámetros y está pensado exclusivamente para el idioma inglés. Su relevancia radica en que permite automatizar la minería de textos biomédicos para detectar preguntas de investigación implícitas, una tarea que tradicionalmente requiere revisión manual de grandes volúmenes de artículos.

La licencia MIT y su tamaño reducido lo hacen accesible para integración en pipelines de análisis de literatura, aunque su ámbito de aplicación está limitado al dominio biomédico y a la detección de un tipo muy específico de enunciado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder (BioMedBERT) con cabeza de clasificación lineal |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 (estándar de BERT, no especificado en la documentación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BioMedBERT, un encoder transformer de 12 capas con 768 unidades ocultas y aproximadamente 110 millones de parámetros, preentrenado sobre abstracts de artículos biomédicos de PubMed. Sobre este encoder se coloca una cabeza de clasificación lineal que produce una salida binaria (ignorancia o no ignorancia). Para mitigar el sobreajuste dado el pequeño tamaño del conjunto de entrenamiento, se congelaron todas las capas excepto las capas 10, 11 y 12, el pooler y la propia cabeza de clasificación.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens, los hiperparámetros ni el régimen de entrenamiento (precisión mixta, épocas, etc.). Tampoco se especifica si se aplicaron técnicas como RLHF o DPO; al tratarse de una tarea de clasificación supervisada, no procede. La información disponible no incluye métricas de evaluación ni resultados de validación.

## Capacidades

- Clasificación binaria de frases: determina si una oración es una declaración de ignorancia (knowledge gap statement) o no.
- Específico para el dominio biomédico: entrenado sobre textos de PubMed, reconoce patrones lingüísticos propios de la literatura científica.
- No realiza generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no, solo inglés.
- No incluye modo de pensamiento ni capacidades multimodales.

## Casos de uso

- Identificación de preguntas de investigación en artículos biomédicos: el modelo puede procesar abstracts y secciones de resultados para extraer frases que indiquen lagunas de conocimiento, facilitando la revisión sistemática de literatura.
- Minería de lagunas de conocimiento en corpus de PubMed: al aplicar el clasificador a grandes volúmenes de abstracts, los investigadores pueden obtener listas de preguntas abiertas en un área temática concreta.
- Asistencia a la planificación de estudios científicos: los equipos de investigación pueden usar el modelo para detectar qué aspectos de un campo aún no han sido respondidos y priorizar nuevas hipótesis.
- Construcción de bases de datos de ignorancia estructurada: junto con los repositorios del Hunter Lab (Ignorance-Base), el modelo permite organizar declaraciones de ignorancia por tema o por resultados experimentales, creando recursos consultables.
- Análisis de evolución del conocimiento: al aplicar el clasificador a artículos de diferentes años, se puede estudiar cómo cambian las preguntas abiertas a lo largo del tiempo.
- Filtrado de literatura para revisiones sistemáticas: los revisores pueden utilizar el modelo para descartar artículos que no contengan declaraciones de ignorancia y centrarse en aquellos que plantean preguntas sin resolver.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (F1, precisión, recall) ni comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia en GPU: el modelo tiene 109M parámetros, lo que en FP32 ocupa aproximadamente 438 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti, RTX 2060 o superior. En cuantización FP16, el consumo se reduce a la mitad.
- Inferencia en CPU: viable para procesamiento por lotes pequeño, con latencias del orden de decenas de milisegundos por frase en hardware moderno.
- GPU recomendadas: no requiere hardware especial; una RTX 3090 o A10 permite procesar cientos de frases por segundo.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, Hugging Face TGI, o simplemente con la librería transformers en un script Python. También es compatible con endpoints de Hugging Face (text-embeddings-inference).
- Latencia y throughput estimados: no se proporcionan datos oficiales; en una GPU moderna, la inferencia de una frase tarda menos de 10 ms en FP16.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que la tarea de clasificación de ignorancia es muy específica y no existen alternativas públicas conocidas con la misma finalidad. Podría compararse con otros clasificadores de texto biomédico como `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract` (el modelo base) o clasificadores de intención de preguntas, pero no hay métricas que permitan una comparación objetiva. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos y alucinación: al ser un clasificador, no genera texto, por lo que no hay riesgo de alucinación. Sin embargo, puede cometer errores de clasificación, especialmente en frases ambiguas o con negaciones complejas.
- Limitaciones de idioma: solo funciona en inglés; no soporta otros idiomas.
- Limitaciones de dominio: entrenado específicamente para textos biomédicos; su rendimiento en otros dominios (legal, técnico, etc.) probablemente sea deficiente.
- Limitaciones de contexto: al usar BERT con contexto máximo de 512 tokens, las frases muy largas o que requieran contexto documental amplio pueden no clasificarse correctamente.
- Sobreajuste potencial: el entrenamiento congeló la mayoría de capas y se realizó sobre un conjunto pequeño (no especificado), lo que sugiere que el modelo puede no generalizar bien a variaciones lingüísticas fuera del corpus de entrenamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, sin restricciones conocidas.
- Falta de documentación: la model card no proporciona información sobre el conjunto de datos, el proceso de anotación, ni métricas de evaluación, lo que dificulta evaluar su fiabilidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/hunter-lab/sentence-level-ignorance-classifier
- Repositorio GitHub Ignorance-Base: https://github.com/lhunter-lab/Ignorance-Base
- Repositorio GitHub Ignorance-Question-Work-Full-Corpus: https://github.com/lhunter-lab/Ignorance-Question-Work-Full-Corpus
