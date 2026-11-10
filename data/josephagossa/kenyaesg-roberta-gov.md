# josephagossa/KenyaESG-RoBERTa-gov

## Resumen

KenyaESG-RoBERTa-gov (v3) es un clasificador binario de frases especializado en contenido de gobernanza (la "G" de ESG) dentro de informes corporativos de empresas cotizadas en la Nairobi Securities Exchange (NSE). Lo desarrolla Joseph Agossa como parte de una familia de tres clasificadores independientes por pilar (medioambiental, social y gobernanza), todos ellos ajustados a partir de `roberta-base`. El modelo resuelve un problema concreto de medicion: cuantificar la intensidad de divulgacion en materia de gobernanza a nivel de frase para poder agregar despues una puntuacion empresa-ano.

Tecnicamente es un transformer encoder de tipo RoBERTa con 124.647.170 parametros, cabeza de clasificacion de secuencia y una longitud maxima de entrada de 256 tokens. La salida es una etiqueta binaria (1 si la frase aborda cuestiones de gobernanza, 0 en caso contrario) aplicando un umbral de 0,5 sobre la probabilidad de la clase positiva. La version v3, publicada en noviembre de 2026, reentrena el modelo con etiquetas revisadas y lo evalua sobre un conjunto ampliado de 300 frases con etiqueta adjudicada, corrigiendo la sobreestimacion del benchmark de la primera release.

Su relevancia actual radica en que ofrece una alternativa abierta (Apache-2.0) y reproducible para la investigacion en finanzas sostenibles aplicada a mercados emergentes, un ambito donde la mayoria de los recursos NLP para ESG estan centrados en empresas de mercados desarrollados. El modelo se distribuye con pesos en safetensors y es compatible con `transformers` y con Text Embeddings Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza de clasificacion de secuencia |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (ingles; algunas frases en suajili y textos degradados por OCR en el entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-base`, un transformer encoder de 12 capas y 768 dimensiones ocultas, y anade una cabeza de clasificacion binaria sobre el token `[CLS]`. No incorpora innovaciones arquitectonicas propias: el valor esta en el ajuste fino y, sobre todo, en el proceso de anotacion. El entrenamiento se realizo sobre 3.900 frases (3.315 para entrenamiento y 585 para validacion, con split estratificado por etiqueta y fuente). La composicion del corpus combina informes de la NSE (1.068 positivas / 865 negativas) y frases del trabajo de Schimanski et al. (2024) (526 / 1.441). Las etiquetas de las frases kenianas pasaron por un filtro de palabras clave, revision del autor y una relectura contra la guia de anotacion KenyaESG v2 con revision asistida por IA y validacion humana; en v3 se modificaron 124 etiquetas de este pilar.

Los hiperparametros son los habituales para ajuste fino de encoders: learning rate 2e-5, batch size 16, weight decay 0,01, hasta 4 epocas con early stopping (paciencia 2, mejor F1 de validacion), max_length 256, fp16 y semilla 42. El entrenamiento se ejecuto con Python 3.12.7, PyTorch 2.5.1 (CUDA 12.1), Transformers 4.48.1, Datasets 3.3.2 y scikit-learn 1.5.1 sobre una NVIDIA Quadro RTX 4000. No se documenta uso de RLHF, DPO ni decodificacion especulativa, algo esperable en un modelo discriminativo de este tamano.

## Capacidades

- Clasificacion binaria de frases: devuelve 1 si la frase trata materias de gobernanza y 0 en caso contrario, con umbral de 0,5 sobre la probabilidad de la clase positiva.
- Cobertura tematica del pilar de gobernanza: composicion del consejo, reuniones, comites y nombramientos, remuneracion, auditoria y control interno, gestion de riesgos, cumplimiento normativo, derechos de los accionistas y juntas generales, etica y anticorrupcion.
- Agregacion a nivel de informe: la proporcion de frases positivas sobre un documento permite construir una puntuacion de intensidad de divulgacion empresa-ano.
- Procesamiento por lotes: el ejemplo de uso oficial tokeniza listas de frases con padding y truncamiento, lo que permite clasificar documentos completos por fragmentos.
- Manejo de entidades enmascaradas: el modelo espera que nombres de empresa y persona aparezcan como `[COMPANY]` y `[PERSON]`, tal como se anotaron en el entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, vision, audio ni modo "thinking": es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Medición de intensidad de divulgación ESG en informes anuales: se fragmenta el informe en frases, se clasifican por lotes y se calcula la proporcion de frases positivas para obtener una puntuacion de gobernanza por empresa y ejercicio, replicable sobre una cartera de emisores de la NSE.
- Investigacion academica en finanzas sostenibles: el modelo permite construir paneles de divulgacion de gobernanza para estudios de eventos, como el analisis de reacciones de precios ante la divulgacion obligatoria de ESG en Kenia citado en la model card.
- Construccion de indices ESG para mercados frontera: combinado con los clasificadores hermanos de los pilares medioambiental y social, permite generar un indice compuesto a partir de informes publicos sin depender de proveedores comerciales.
- Auditoria de cumplimiento de reporting: las areas de cumplimiento pueden pasar los borradores de sus informes por el clasificador para verificar que las secciones de gobierno corporativo cubren los temas exigidos (comites, auditoria, remuneracion, anticorrupcion).
- Analisis comparativo entre emisores: al ser un modelo ligero (124 M de parametros), se puede ejecutar sobre cientos de informes en una sola GPU de gama media para comparar la densidad de divulgacion entre sectores o tamanos de empresa.
- Filtrado y curaduria de corpus: util como primer paso para aislar frases de gobernanza antes de un analisis manual o de un modelo generativo de resumen, reduciendo el volumen de texto que revisa un analista.

## Benchmarks y rendimiento

Evaluacion sobre 300 frases reservadas de informes de la NSE, anotadas por dos anotadores (A y B) y puntuadas contra la etiqueta adjudicada y contra el subconjunto de acuerdo entre anotadores. Intervalos de confianza bootstrap al 95 % con 10.000 remuestreos.

| Referencia | n | Precision | Recall | F1 [IC 95 %] | TN / FP / FN / TP |
|---|---|---|---|---|---|
| Adjudicada | 300 | 0,952 | 0,887 | 0,918 [0,882; 0,951] | 161 / 6 / 15 / 118 |
| A = B | 287 | 0,951 | 0,784 | 0,859 [0,812; 0,901] | 133 / 6 / 32 / 116 |

Validacion interna sobre 585 frases (acuerdo con las etiquetas de entrenamiento): F1 0,888 global, 0,969 en frases kenianas y 0,718 en frases de Schimanski et al. (2024). El autor advierte que la puntuacion contra la etiqueta adjudicada puede ser ligeramente favorable porque las etiquetas de entrenamiento y las de evaluacion se revisaron con la misma guia; la puntuacion A = B no depende de la adjudicacion. No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 0,25 GB de pesos mas el overhead de activaciones y tokenizacion; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas. En fp32, en torno a 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entreno en una NVIDIA Quadro RTX 4000. Para lotes grandes, una RTX 4090, A100 o H100 aceleran el throughput, pero no son necesarias.
- Cabe en GPU de consumo: si, en todas las GPU de consumo actuales (RTX 3060, 4060, 4090, etc.) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, Text Embeddings Inference (el repo incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), y servidores de inferencia compatibles con el pipeline de clasificacion de texto. No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KenyaESG-RoBERTa-gov | 124,6 M | 256 tokens | Clasificacion binaria de gobernanza ESG | Apache-2.0 | Hugging Face |
| KenyaESG-RoBERTa-env | no disponible | no disponible | Clasificacion del pilar medioambiental | no disponible | Hugging Face |
| KenyaESG-RoBERTa-soc | no disponible | no disponible | Clasificacion del pilar social | no disponible | Hugging Face |
| `roberta-base` (base) | 124,6 M | 512 tokens | Modelo de lenguaje enmascarado generico | MIT | Hugging Face |

Los dos clasificadores hermanos (env y soc) comparten procedimiento de entrenamiento y dataset, por lo que son las alternativas mas directas para cubrir los otros pilares. Frente a `roberta-base`, este modelo anade la cabeza de clasificacion y el ajuste especifico al dominio, pero reduce la longitud de contexto efectiva a 256 tokens. No se dispone de datos de benchmarks comparativos con otros clasificadores ESG publicos en la informacion proporcionada.

## Limitaciones y advertencias

- Mide la frecuencia con la que se menciona el pilar de gobernanza (intensidad de divulgacion), no la calidad ni la credibilidad de esa divulgacion.
- Precision alta (0,952) pero recall mas bajo contra las etiquetas propias de los anotadores (0,784 en el subconjunto A = B): el modelo es conservador y tiende a dejar pasar frases de gobernanza como negativas.
- El F1 de validacion sobre frases de Schimanski et al. (2024) cae a 0,718 porque su definicion de gobernanza es mas estrecha que la guia KenyaESG; el modelo no es directamente transferible a otros esquemas de anotacion.
- Entrenado sobre informes de la NSE predominantemente en ingles, con algunas frases en suajili y textos degradados por OCR; la transferencia a otros mercados o idiomas no esta probada.
- Requiere enmascarar nombres de empresa y persona como `[COMPANY]` y `[PERSON]` para obtener el mejor rendimiento; sin ese preprocesamiento el comportamiento puede degradarse.
- La puntuacion contra la etiqueta adjudicada puede estar ligeramente inflada porque las etiquetas de entrenamiento y evaluacion se revisaron con la misma guia; conviene tomar la puntuacion A = B como referencia mas conservadora.
- Licencia Apache-2.0: permite uso comercial, pero no se ofrece ninguna garantia sobre el rendimiento en dominios distintos al corpus de entrenamiento.
- Riesgo de sesgo derivado de la composicion del corpus: solo empresas cotizadas en la NSE y el subconjunto de Schimanski et al., sin datos de otros mercados africanos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josephagossa/KenyaESG-RoBERTa-gov
- Clasificador del pilar medioambiental: https://huggingface.co/josephagossa/KenyaESG-RoBERTa-env
- Clasificador del pilar social: https://huggingface.co/josephagossa/KenyaESG-RoBERTa-soc
- Dataset KenyaESG en Hugging Face: https://huggingface.co/datasets/josephagossa/KenyaESG
- Dataset KenyaESG en Zenodo: https://doi.org/10.5281/zenodo.20608236
- DOI del dataset en Hugging Face: https://doi.org/10.57967/hf/9193
- DOI del modelo: https://doi.org/10.57967/hf/9128
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Referencia metodologica: Schimanski, T., Reding, A., Reding, N., Bingler, J., Kraus, M., & Leippold, M. (2024). Bridging the gap in ESG measurement: Using NLP to quantify environmental, social, and governance communication. Finance Research Letters, 61, 104979.
