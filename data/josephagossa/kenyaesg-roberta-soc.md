# josephagossa/KenyaESG-RoBERTa-soc

## Resumen

KenyaESG-RoBERTa-soc es un clasificador binario de frases especializado en detectar contenido ESG de la pilar social en informes corporativos de empresas cotizadas en la Nairobi Securities Exchange (NSE). Lo desarrolla Joseph Agossa como parte de una familia de tres clasificadores independientes (ambiental, social y de gobernanza), y se obtiene mediante fine-tuning de `roberta-base` sobre el dataset KenyaESG. El modelo resuelve un problema concreto: cuantificar la intensidad de divulgacion social (empleados, clientes, comunidades y derechos humanos) a nivel de frase para agregarla despues en una metrica firme-ano.

La version v3 (noviembre de 2026) incorpora etiquetas de entrenamiento revisadas contra una guia de anotacion semantica explicita y una evaluacion ampliada a 300 frases con etiqueta adjudicada, corrigiendo la sobreestimacion del benchmark inicial de 100 frases. Con 124,6 millones de parametros y una ventana de 256 tokens, es un modelo ligero y desplegable en hardware modesto, pensado para investigacion en finanzas sostenibles y analisis de divulgacion corporativa en mercados emergentes.

Su relevancia actual radica en la escasez de herramientas NLP calibradas para mercados africanos y en la creciente exigencia regulatoria de divulgacion ESG en Kenia, lo que convierte a este clasificador en un componente util para pipelines de medicion de transparencia corporativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base), clasificacion de secuencias |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32/fp16) |
| Idiomas soportados | en (ingles; algunas frases en swahili y OCR degradado en entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un RoBERTa base fine-tuneado para clasificacion binaria de secuencias (`AutoModelForSequenceClassification`), con una cabeza de dos clases sobre el encoder. La salida es la probabilidad de la clase 1 (contenido social) con umbral 0,5. La longitud maxima de secuencia es de 256 tokens y el entrenamiento se realizo en fp16 con semilla 42.

El conjunto de entrenamiento consta de 3.900 frases: 1.910 de informes keniatas (944 positivas / 966 negativas) y 1.990 de Schimanski et al. (2024) (796 / 1.194), con split estratificado 85/15 (3.315 / 585) por etiqueta y fuente. Las etiquetas keniatas se obtuvieron mediante filtro de palabras clave, revision manual del autor y relectura contra la guia KenyaESG v2 (revision asistida por IA validada por el autor); las de Schimanski et al. se usaron tal cual. Los hiperparametros incluyen learning rate 2e-5, batch size 16, weight decay 0,01, hasta 4 epocas con early stopping (paciencia 2, mejor F1 de validacion) y max length 256. El entrenamiento se ejecuto en una NVIDIA Quadro RTX 4000 con PyTorch 2.5.1, Transformers 4.48.1 y Datasets 3.3.2. No se reporta uso de RLHF ni DPO; es un fine-tuning supervisado clasico.

## Capacidades

- Clasificacion binaria de frases: devuelve 1 si la frase aborda cuestiones sociales y 0 en caso contrario, con umbral 0,5 sobre la probabilidad de la clase positiva.
- Deteccion de contenido social en cuatro subambitos: empleados (formacion, bienestar, salud y seguridad, beneficios, diversidad e inclusion), clientes (inclusion financiera, acceso, proteccion al consumidor), comunidades (RSC, educacion, salud, desarrollo local) y derechos humanos.
- Agregacion a nivel de informe: la proporcion de frases positivas produce una puntuacion de intensidad de divulgacion social por empresa y ano.
- Procesamiento por lotes con tokenizador y truncamiento a 256 tokens.
- Compatible con Text Embeddings Inference y endpoints de Hugging Face (`text-embeddings-inference`, `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; es un clasificador, no un modelo generativo.
- Capacidad multilingue limitada al ingles, con presencia residual de swahili en entrenamiento.

## Casos de uso

- Medicion de intensidad de divulgacion social: procesar informes anuales de empresas de la NSE frase a frase y agregar la proporcion de frases positivas para construir un indice firme-ano comparable entre companias y ejercicios.
- Investigacion academica en finanzas sostenibles: generar variables dependientes o explicativas de divulgacion social para estudios de reacciones de mercado ante la divulgacion ESG obligatoria en Kenia, tal como plantea el working paper del autor.
- Analisis regulatorio y de cumplimiento: auditar que proporcion de un informe cubre efectivamente aspectos sociales frente a menciones genericas, apoyando a reguladores o auditores en la evaluacion de la calidad de la divulgacion.
- Construccion de paneles ESG para inversores: alimentar bases de datos de scoring social con una senal objetiva y reproducible a partir de texto corporativo, combinable con los clasificadores env y gov de la misma familia.
- Filtrado y priorizacion de documentos: descartar o marcar secciones de un corpus de informes que no contienen contenido social antes de un analisis manual costoso, reduciendo el volumen de revision humana.
- Seguimiento temporal de empresas: aplicar el clasificador a la serie historica de informes de una misma compania para detectar cambios en la intensidad de divulgacion social tras reformas regulatorias o eventos corporativos.
- Preprocesamiento para modelos generativos: usar las frases etiquetadas como recuperacion o filtrado previo antes de pasar fragmentos relevantes a un LLM para resumen o analisis cualitativo.

## Benchmarks y rendimiento

| Referencia | n | Precision | Recall | F1 [IC 95%] | TN / FP / FN / TP |
|---|---|---|---|---|---|
| Etiqueta adjudicada | 300 | 0,854 | 0,921 | 0,886 [0,843, 0,923] | 153 / 20 / 10 / 117 |
| A = B (acuerdo entre anotadores) | 286 | 0,863 | 0,850 | 0,856 [0,807, 0,899] | 135 / 18 / 20 / 113 |

Validacion interna (585 frases, acuerdo con etiquetas de entrenamiento): F1 0,947 global, 0,944 en frases keniatas y 0,951 en frases de Schimanski et al. (2024). Intervalos de confianza bootstrap percentil al 95% con 10.000 remuestreos. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 y 0,25 GB en fp16 para los pesos; con activaciones y overhead de runtime, menos de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entreno en una NVIDIA Quadro RTX 4000 y funciona en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad completa.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y superiores, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference, endpoints de Hugging Face; tambien es viable la conversion a ONNX o el uso con pipelines de clasificacion estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KenyaESG-RoBERTa-soc | 124,6 M | 256 tokens | Clasificacion binaria ESG social (NSE) | Apache-2.0 | Hugging Face |
| KenyaESG-RoBERTa-env | no disponible | no disponible | Clasificacion binaria ESG ambiental (NSE) | Apache-2.0 | Hugging Face |
| KenyaESG-RoBERTa-gov | no disponible | no disponible | Clasificacion binaria ESG gobernanza (NSE) | Apache-2.0 | Hugging Face |
| roberta-base (modelo base) | 124,6 M | 512 tokens | Modelo de lenguaje enmascarado generico | MIT | Hugging Face |

Los tres clasificadores de la familia KenyaESG comparten base, licencia y procedimiento de entrenamiento, y se diferencian unicamente en el pilar ESG que detectan. Frente a `roberta-base`, este modelo anade la tarea especifica de clasificacion social calibrada para informes de la NSE, a costa de reducir la ventana de 512 a 256 tokens. No se dispone de datos de benchmarks de los modelos env y gov en la informacion proporcionada para comparar rendimiento entre pilares.

## Limitaciones y advertencias

- Mide la frecuencia con que se menciona el pilar social (intensidad de divulgacion), no la calidad ni la credibilidad de esa divulgacion.
- Los errores se concentran en menciones cortas o genericas a empleados y stakeholders, donde el limite entre mencion de paso y contenido social es difuso.
- Entrenado con informes de la NSE predominantemente en ingles (algunas frases en swahili y con OCR degradado); la transferencia a otros mercados o idiomas no esta probada.
- Los nombres de empresas y personas en los datos de entrenamiento estan enmascarados como `[COMPANY]` y `[PERSON]`; para mejores resultados debe aplicarse el mismo enmascaramiento en inferencia.
- Las etiquetas de entrenamiento y las de evaluacion adjudicada se revisaron con la misma guia, por lo que la puntuacion adjudicada puede ser ligeramente favorable; la metrica A = B no depende de la adjudicacion.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la clasificacion, con 20 FP y 10 FN sobre 300 frases en el conjunto adjudicado.
- Licencia Apache-2.0 permite uso comercial, pero no se garantiza el rendimiento fuera del dominio de informes corporativos keniatas.
- Solo 5 descargas y 0 likes en el momento de la consulta: comunidad practicamente inexistente, sin validacion externa independiente del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josephagossa/KenyaESG-RoBERTa-soc
- Clasificador ambiental: https://huggingface.co/josephagossa/KenyaESG-RoBERTa-env
- Clasificador de gobernanza: https://huggingface.co/josephagossa/KenyaESG-RoBERTa-gov
- Dataset KenyaESG en Hugging Face: https://huggingface.co/datasets/josephagossa/KenyaESG
- Dataset KenyaESG en Zenodo: https://doi.org/10.5281/zenodo.20608236
- DOI del dataset en Hugging Face: https://doi.org/10.57967/hf/9193
- DOI del modelo (primera version): https://doi.org/10.57967/hf/9127
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Referencia metodologica: Schimanski, T. et al. (2024), Finance Research Letters, 61, 104979
