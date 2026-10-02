# bhavanaNannuru/hw1-hc3-detector

## Resumen

Hw1-hc3-detector es un clasificador binario de texto afinado a partir de `sentence-transformers/all-MiniLM-L6-v2`, disenado para distinguir respuestas escritas por humanos de respuestas generadas por ChatGPT en el corpus HC3 (Human ChatGPT Comparison Corpus). El modelo lo publica el usuario bhavanaNannuru en Hugging Face como parte de un trabajo de curso de NLP avanzado de la Universidad de Illinois (UIUC), y su unica tarea es la clasificacion de dos clases: `0` para humano y `1` para ChatGPT.

Se trata de un modelo encoder-only de tipo BERT, con 22.713.986 parametros totales y un tamano de repositorio de solo 0,1 GB. Al derivar de all-MiniLM-L6-v2, hereda una arquitectura compacta de 6 capas y representaciones de 384 dimensiones, pensada para producir embeddings de frases rapidos y ligeros. No es un modelo generativo: no produce texto, sino una etiqueta de clasificacion con su probabilidad asociada.

Su relevancia es acotada pero concreta: la deteccion de texto generado por IA es un problema activo en integridad academica, moderacion de contenido y verificacion de autoria, y este modelo reporta una exactitud de test de 0,9951 sobre el corpus HC3, muy por encima del baseline de 0,8449. La contrapartida es que se trata de un artefacto de curso, sin licencia declarada, sin ficha de sesgos y sin idiomas documentados mas alla del ingles del dataset de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT), derivado de sentence-transformers/all-MiniLM-L6-v2 |
| Parametros totales | 22.713.986 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (heredada de all-MiniLM-L6-v2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus HC3 usado es en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de all-MiniLM-L6-v2, un sentence transformer basado en BERT con 6 capas de encoder, 384 dimensiones ocultas y un maximo de 256 tokens de secuencia. Sobre esa base se anade una cabeza de clasificacion para resolver una tarea de dos clases (humano frente a ChatGPT). Los pesos resultantes suman 22.713.986 parametros, lo que confirma que se mantiene la estructura compacta del modelo original.

Segun la model card, el ajuste fino se hizo sobre el dataset HC3 durante 5 epocas. No se documenta el numero de tokens de entrenamiento, la composicion exacta del split, ni si se aplicaron tecnicas de regularizacion, RLHF o DPO (ninguna de ellas aplicable a un clasificador de este tipo). El autor reporta dos resultados: un baseline con embeddings congelados y regresion logistica que alcanza 0,8449 de exactitud, y el modelo afinado que llega a 0,9951 de exactitud en test. No se detalla la particion train/validation/test ni el procedimiento de evaluacion.

## Capacidades

- Clasificacion binaria de texto: asigna la etiqueta `0` (humano) o `1` (ChatGPT) a una respuesta de entrada.
- Deteccion de texto generado por ChatGPT en el dominio del corpus HC3 (respuestas de tipo question-answering).
- Generacion de embeddings de frase heredados de all-MiniLM-L6-v2, utiles como representacion de la entrada.
- Inferencia rapida y de bajo coste gracias a su tamano reducido (22,7 M de parametros).
- No soporta generacion de texto.
- No dispone de tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingues: no documentadas; el entrenamiento se realizo sobre HC3, que es en ingles.
- No incorpora modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Deteccion de respuestas generadas por IA en plataformas educativas: el modelo puede etiquetar respuestas de alumnos y marcar como sospechosas aquellas clasificadas como `1` (ChatGPT), como filtro previo a una revision humana. Su exactitud reportada de 0,9951 en el dominio HC3 lo hace util como primera capa de triaje.
- Moderacion de contenido en foros y comunidades: clasificar automaticamente respuestas para senalar contenido sintetico y aplicar etiquetas de transparencia, dado el bajo coste de inferencia de un modelo de 22,7 M de parametros.
- Analisis de integridad en plataformas de Q&A: integrar el clasificador en un pipeline que revise respuestas publicadas y priorice las que requieran verificacion manual.
- Investigacion sobre deteccion de texto generado: servir como linea base reproducible y ligera para comparar contra detectores mas grandes o contra clasificadores basados en perplexidad.
- Filtrado de datos para curación de datasets: descartar o separar respuestas sinteticas al construir corpus de entrenamiento a partir de foros y plataformas de preguntas y respuestas.
- Servicio de inferencia en tiempo real de bajo coste: al caber en CPU o en cualquier GPU de consumo, permite desplegar el clasificador como microservicio con latencia muy baja para volúmenes altos de peticiones.
- Etiquetado asistido en anotacion: preetiquetar grandes volumenes de texto para que los anotadores humanos solo revisen los casos dudosos o etiquetados como generados.

## Benchmarks y rendimiento

| Metrica | Configuracion | Valor |
|---|---|---|
| Exactitud (accuracy) | Baseline: embeddings congelados + regresion logistica | 0,8449 |
| Exactitud (accuracy) | Modelo afinado, test | 0,9951 |

Los unicos datos disponibles son estos dos valores de exactitud sobre HC3. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras pruebas estandar, dado que el modelo solo realiza clasificacion binaria y no generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 45 MB en fp16 y 91 MB en fp32 para los pesos, calculado a partir de los 22.713.986 parametros. Con el overhead de activaciones y runtime, el consumo realista por proceso se situa por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente, incluida una GTX 1650 o superior. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual, e incluso en CPU sin problemas de latencia para cargas moderadas.
- Opciones de despliegue: Hugging Face Transformers, sentence-transformers, ONNX Runtime y exportacion a formatos ligeros. vLLM y TGI estan orientados a modelos generativos y no son la via natural para un clasificador BERT de este tamano.
- Latencia y throughput estimados: no disponibles; no se publican mediciones. Por el tamano del modelo, se espera una latencia de milisegundos por lote en GPU y de decenas de milisegundos en CPU, aunque son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bhavanaNannuru/hw1-hc3-detector | 22,7 M | 256 tokens | Clasificacion humano/ChatGPT en HC3 | no disponible | Hugging Face |
| jainatharva21/hw1-hc3-detector | no disponible | no disponible | Clasificacion humano/ChatGPT en HC3 | no disponible | Hugging Face |
| Aishkrish/hw1-hc3-detector | no disponible | no disponible | Clasificacion humano/ChatGPT en HC3 | no disponible | Hugging Face |
| Yihangsun/hw1-hc3-detector | no disponible | no disponible | Clasificacion humano/ChatGPT en HC3 | no disponible | Hugging Face |
| skyyyyks/hw1-hc3-detector | no disponible | no disponible | Clasificacion humano/ChatGPT en HC3 | no disponible | Hugging Face |

Los modelos comparables encontrados son variantes del mismo ejercicio de curso sobre HC3, lo que indica que comparten base y planteamiento pero no publican resultados comparables en la informacion disponible. No se dispone de datos de rendimiento de estas alternativas para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Se trata de un modelo creado para un trabajo de curso (UIUC adv nlp coursework), sin mantenimiento ni soporte declarado.
- No se declara licencia, por lo que su uso comercial queda en situacion juridica incierta y no se recomienda en produccion sin aclarar los terminos.
- El entrenamiento se limita al corpus HC3, en ingles y de dominio question-answering; el rendimiento fuera de ese dominio o idioma es desconocido y probablemente degrade de forma acusada.
- La exactitud de 0,9951 puede reflejar sobreajuste a las caracteristicas especificas del dataset HC3 y no generalizar a otros generadores distintos de ChatGPT o a otros estilos de escritura.
- Es un clasificador binario: confundira texto humano con estilo muy formal o plantillado, y texto de otros modelos con el de ChatGPT.
- Riesgo de alucinacion no aplicable directamente, ya que no genera texto, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion.
- No se documentan sesgos demograficos, linguisticos ni de dominio; la ausencia de una seccion de sesgos en la model card es en si misma una advertencia.
- La longitud de contexto de 256 tokens limita el analisis a respuestas cortas o fragmentos; textos largos deben truncarse o dividirse.
- No se especifican la particion de datos ni el procedimiento de evaluacion, lo que dificulta reproducir el resultado de 0,9951.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhavanaNannuru/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Corpus HC3 (Hello-SimpleAI): https://github.com/Hello-SimpleAI
- Variante comparable jainatharva21/hw1-hc3-detector: https://huggingface.co/jainatharva21/hw1-hc3-detector
- Variante comparable Aishkrish/hw1-hc3-detector: https://huggingface.co/Aishkrish/hw1-hc3-detector
- Ficha agregada de hw1-hc3-detector (Yihangsun): https://savrn.com/models/hw1-hc3-detector
- Registro de hw1-hc3-detector (skyyyyks): https://free2aitools.com/model/skyyyyks/hw1-hc3-detector
