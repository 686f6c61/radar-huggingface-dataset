# mhuang412/cs546-hw1-hc3-detector

## Resumen

El modelo `mhuang412/cs546-hw1-hc3-detector` es un clasificador binario de texto disenado para distinguir respuestas escritas por personas de respuestas generadas por ChatGPT. Se trata de un ajuste fino (fine-tuning) del modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2`, realizado durante 5 epocas con el optimizador AdamW y una tasa de aprendizaje de 2e-5 sobre el corpus HC3 (Human ChatGPT Comparison Corpus). La tarea se formula como clasificacion de secuencia con dos etiquetas: 0 para texto humano y 1 para texto generado por ChatGPT.

Con 22.713.986 parametros, es un modelo muy compacto (encoder tipo BERT de 6 capas, tamano de representacion 384), lo que lo hace apto para inferencia en CPU y en cualquier GPU de consumo. El autor reporta una exactitud de test de 0,9921 tras el ajuste fino, frente a 0,8449 de la linea base basada en embeddings congelados mas regresion logistica. Pese a estas cifras, se trata de un artefacto de tipo academico (identificado como "cs546-hw1", probablemente una practica de asignatura), sin licencia declarada, sin idiomas especificados y sin documentacion tecnica completa.

Su relevancia ahora es la de un detector de contenido sintetico ligero y desplegable localmente, util como componente en pipelines de filtrado de datos o moderacion, aunque con las cautelas propias de un modelo de clasificacion entrenado sobre un unico corpus y sin evaluacion externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM, 6 capas, hidden 384, 12 cabezas de atencion, FFN 1536) con cabeza de clasificacion de secuencia de 2 etiquetas; base `sentence-transformers/all-MiniLM-L6-v2` |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (limite conocido de `all-MiniLM-L6-v2`; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; la model card no documenta cuantizaciones propias) |
| Idiomas soportados | no disponible oficialmente; el corpus HC3 y el tokenizador de la base son predominantemente en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia MiniLM (variante destilada de BERT), con 6 capas, dimension oculta de 384 y 12 cabezas de atencion, sobre el que se anade una cabeza lineal de clasificacion para dos clases (humano vs ChatGPT). El tokenizador heredado es el de la base (estilo `bert-base-uncased`, en minusculas), lo que condiciona el preprocesamiento a texto en minusculas. Al ser un modelo de tipo sentence-transformer, esta optimizado para representar oraciones, no para generacion.

El ajuste fino se realizo durante 5 epocas con AdamW y learning rate 2e-5 sobre el corpus HC3, un conjunto de pares pregunta-respuesta con respuestas humanas y respuestas de ChatGPT etiquetadas. El autor reporta dos resultados en test: una linea base de embeddings congelados mas regresion logistica con exactitud 0,8449, y el modelo ajustado con exactitud 0,9921. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a un clasificador). Tampoco se detallan hiperparametros de regularizacion, semilla ni division train/test.

## Capacidades

- Clasificacion binaria de texto: etiqueta 0 para contenido humano y 1 para contenido generado por ChatGPT.
- Deteccion de texto sintetico en respuestas de tipo pregunta-respuesta, el dominio en el que fue entrenado (HC3).
- Extraccion de embeddings de frase heredados de `all-MiniLM-L6-v2` (utilizables para similitud semantica y recuperacion, aunque no es el objetivo del ajuste fino).
- Integracion como pipeline de `transformers` (`text-classification`).
- Compatible con `text-embeddings-inference` segun las etiquetas del repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo generativo).
- No dispone de modo de razonamiento (thinking), vision ni audio.
- Capacidades multilingues: no disponibles; entrenado sobre un corpus predominantemente en ingles.

## Casos de uso

- Deteccion de respuestas generadas por IA en plataformas educativas: el modelo puede puntuar entregas o respuestas de foros en busca de contenido de ChatGPT, aprovechando su exactitud reportada de 0,9921 en el dominio HC3 y su bajo coste de inferencia.
- Moderacion de comunidades de pregunta-respuesta: integrado como filtro previo en foros tecnicos (por ejemplo, estilo Stack Overflow) para marcar respuestas potencialmente sinteticas antes de la revision humana.
- Limpieza de corpus para entrenamiento de LLMs: clasificar grandes volumenes de texto para separar datos humanos de datos generados por ChatGPT y evitar contaminacion en datasets de preentrenamiento.
- Auditoria editorial y verificacion de originalidad: como primera senal automatizada en revisiones de manuscritos o articulos, complementando herramientas de plagio tradicionales.
- Control de calidad en anotacion por crowdsourcing: detectar anotaciones o respuestas de trabajadores que hayan usado un asistente de IA en lugar de redactar contenido original.
- Investigacion sobre deteccion de texto generado: al ser un ajuste fino reproducible sobre HC3 con linea base y resultado final documentados, sirve como punto de partida para estudios comparativos de detectores.
- Filtrado en tiempo real de contenidos generados masivamente: por su tamano (22,7 M de parametros) puede ejecutarse en CPU a alta velocidad dentro de pipelines de ingesta de contenido.

## Benchmarks y rendimiento

| Modelo / configuracion | Dataset | Metrica | Resultado |
|---|---|---|---|
| Baseline (embeddings congelados + regresion logistica) | HC3 (test) | Exactitud | 0,8449 |
| Modelo ajustado (MiniLM fine-tuned) | HC3 (test) | Exactitud | 0,9921 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, GLUE, etc.) en la informacion disponible, ni comparaciones con detectores externos.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en FP32 (aproximadamente 90 MB de pesos) y en torno a 45 MB en FP16; cabe holgadamente en cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) es mas que suficiente; tambien es valida en A100/H100 para despliegues de gran volumen.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas integradas modestas.
- Opciones de despliegue: pipeline de `transformers`, `text-embeddings-inference` (segun etiquetas), servidores FastAPI/ONNX Runtime, despliegue por lotes en CPU. No es un modelo para vLLM en modo generativo (es un clasificador BERT).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo se espera latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mhuang412/cs546-hw1-hc3-detector | 22,7 M | Clasificador BERT (MiniLM) | 256 tokens | 0,9921 exactitud en HC3 (test) | no disponible | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22,7 M | Encoder de embeddings | 256 tokens | No es un clasificador; no comparable directamente | Apache-2.0 (base) | HuggingFace |
| Detectores del ecosistema HC3 (Hello-SimpleAI/chatgpt-comparison-detection) | no disponible | Clasificadores (por ejemplo, basados en RoBERTa) | no disponible | no disponible en esta busqueda | no disponible | GitHub |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada; la comparativa se limita a parametros, tipo y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo sobre HC3, puede heredar los sesgos de dominio, tematica y estilo de ese corpus.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto), pero si existe riesgo de falsos positivos y falsos negativos al clasificar.
- Generalizacion limitada: entrenado especificamente para distinguir respuestas humanas de respuestas de ChatGPT sobre HC3; puede degradarse ante otros modelos generativos, otros idiomas o dominios distintos.
- Contexto limitado a 256 tokens: textos mas largos deberan truncarse o dividirse, lo que afecta a la precision.
- Idioma: no se declaran idiomas oficiales; el uso fuera del ingles no esta validado.
- Licencia: no disponible, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Documentacion incompleta: la model card contiene secciones sin rellenar y metadatos ausentes (desarrollador, financiacion, datos de contacto).
- Origen academico: identificado como trabajo de asignatura (cs546-hw1), sin mantenimiento ni evaluacion externa publicada; no recomendado como unico mecanismo de decision en produccion.
- Dependencia de la base: hereda las limitaciones del tokenizador en minusculas y del preprocesamiento de `all-MiniLM-L6-v2`.
- No se recomienda su uso como prueba concluyente en contextos disciplinarios o legales sin revision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhuang412/cs546-hw1-hc3-detector
- Repositorio HC3 y detectores (Hello-SimpleAI): https://github.com/Hello-SimpleAI/chatgpt-comparison-detection
- Organizacion Hello-SimpleAI: https://github.com/Hello-SimpleAI
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorios similares de la misma practica: https://huggingface.co/shichenghu/hw1-hc3-detector y https://huggingface.co/WilliamDDDD/hw1-hc3-detector
- Paper referenciado en las etiquetas (calculo de impacto ambiental): https://arxiv.org/abs/1910.09700
