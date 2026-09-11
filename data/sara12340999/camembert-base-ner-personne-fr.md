# Sara12340999/camembert-base-ner-personne-fr

## Resumen

`camembert-base-ner-personne-fr` es un modelo de clasificación de tokens (token classification) que marca, palabra a palabra, si un término forma parte de un nombre de persona (`1`) o no (`0`) en textos en francés. Lo publica el usuario Sara12340999 en Hugging Face y consiste en un fine-tuning completo de `almanach/camembert-base`, un encoder transformer de 110.032.898 parámetros con una ventana de 512 tokens. No es un modelo generativo: su salida es una etiqueta binaria por token.

El modelo nace de un trabajo académico (TD2 de NLP, ESGI) y resuelve un problema muy acotado: la detección de menciones de personas en francés, útil como pieza de preprocesado en pipelines de anonimización, indexado de corpus o análisis de medios. El entrenamiento se hizo en dos fases, primero sobre MultiNERD FR (~11.400 frases de Wikipedia) y después sobre 999 títulos de vídeos de France Inter, para adaptarse a un dominio donde la densidad de nombres es mucho mayor (13,1 % de los tokens frente al 4,4 % de MultiNERD).

Conviene ser explícito sobre su madurez: el repositorio acumula 0 descargas y 0 likes, y la propia model card deja la sección de resultados como "à compléter", sin métricas de validación publicadas. Se distribuye en formato safetensors bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo RoBERTa (CamemBERT-base) con cabeza de clasificación de tokens de 2 etiquetas |
| Parametros totales | 110.032.898 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite de CamemBERT-base; el ejemplo de uso aplica `truncation=True`) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en precisión completa, sin variantes GGUF, ONNX ni int8 documentadas |
| Idiomas soportados | Francés (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repositorio: 0,9 GB) |

## Arquitectura y entrenamiento

La base es CamemBERT-base, un encoder transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, derivado del diseño de RoBERTa y preentrenado sobre corpus en francés. Sobre ese backbone se añade una cabeza de clasificación token a token con dos etiquetas, de modo que el modelo no genera texto ni produce secuencias: únicamente asigna una probabilidad a cada subtoken. El fine-tuning es completo, sin ninguna capa congelada.

El entrenamiento se estructuró en dos etapas secuenciales. La primera usó MultiNERD FR, aproximadamente 11.400 frases de Wikipedia, con las etiquetas `B-PER`/`I-PER` del dataset original colapsadas a una clasificación binaria. La segunda etapa usó un corpus de 999 títulos de vídeos de France Inter para adaptar el modelo al dominio objetivo, mucho más denso en nombres propios. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación, algo coherente con la naturaleza discriminativa del modelo. En inferencia, la etiqueta de cada palabra se decide tomando la predicción del primer subtoken, el mismo criterio aplicado durante el entrenamiento.

## Capacidades

- Clasificación binaria de tokens para detección de nombres de persona en francés: `1` si la palabra pertenece a un nombre, `0` en caso contrario.
- Segmentación a nivel de palabra mediante mapeo `word_ids` del tokenizador, que resuelve la tokenización en subpalabras.
- Procesamiento de entradas de hasta 512 tokens, incluyendo texto ya dividido en palabras (`is_split_into_words=True`).
- Adaptación específica a titulares y textos breves de medios audiovisuales franceses (dominio France Inter).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni flujos de agentes.
- No es un NER multietiqueta: solo distingue la clase persona, sin organización, localización ni miscelánea.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado únicamente en francés.

## Casos de uso

- Anonimización y pseudonimización de textos en francés: el modelo marca las palabras que componen nombres de persona para sustituirlas por tokens genéricos antes de almacenar o compartir el texto, un paso útil en cumplimiento de RGPD.
- Indexado y búsqueda de menciones en corpus periodísticos: permite construir índices de nombres citados en hemerotecas digitales francesas y recuperar documentos por persona mencionada.
- Enriquecimiento de metadatos audiovisuales: al estar adaptado a títulos de vídeos, encaja en el etiquetado automático de catálogos de medios que describen entrevistas o reportajes.
- Análisis de presencia mediática: detectar cuándo aparece una persona concreta en un conjunto de titulares para medir frecuencia y evolución temporal de su cobertura.
- Construcción de grafos de co-ocurrencia: extrayendo los nombres presentes en cada documento se pueden inferir relaciones entre personas que aparecen juntas en las mismas piezas informativas.
- Preprocesado para pipelines NER más ricos: como primera etapa que aísla menciones de persona, que después se resuelven contra una base de entidades o se combinan con otros modelos de organización y localización.
- Filtrado de datos personales en formularios y logs: aplicación sobre campos de texto libre en francés para marcar contenido con datos identificativos antes de pasarlo a un sistema de analítica.
- Etiquetado asistido para creación de datasets: generar anotaciones preliminares que un humano revise, reduciendo el coste de construir corpus NER en francés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la información disponible. La model card incluye la sección de resultados marcada como "à compléter" y no reporta F1, precisión ni recall de la clase positiva. La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo (los resultados obtenidos corresponden a foros no relacionados).

Lo único cuantificado en la documentación son las referencias de una línea base trivial que predice "ningún nombre" en todas las posiciones:

| Conjunto de evaluacion | Exactitud de la linea base trivial (predecir siempre 0) | Metrica del modelo |
|---|---|---|
| MultiNERD FR | 95,6 % | No disponible |
| France Inter | 86,9 % | No disponible |

Estos valores son una advertencia metodológica: cualquier exactitud por debajo de esos umbrales indica un rendimiento peor que no predecir nada, por lo que la evaluación debe hacerse con F1 sobre la clase positiva, no con exactitud global.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 440 MB solo para los pesos (110.032.898 parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM en fp16/bf16: en torno a 220 MB de pesos; en int8 dinámico, unos 110 MB.
- Entrenamiento con fine-tuning completo y Adam: alrededor de 1,8 GB solo para pesos, gradientes y estados del optimizador, más activaciones; con lotes pequeños cabe en GPUs de 6-8 GB.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090, así como en GPUs de servidor T4, A10, A100 o H100. También es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, `pipeline("token-classification")`, exportación a ONNX Runtime o TorchScript para servir con FastAPI, y Hugging Face Inference Endpoints.
- No aplican vLLM ni TGI (orientados a modelos generativos), ni llama.cpp u Ollama (no se publican pesos GGUF; requeriría conversión manual).
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / etiquetas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Sara12340999/camembert-base-ner-personne-fr` | 110.032.898 | 512 tokens | Clasificación binaria de persona (PER) | MIT | Pública en Hugging Face; 0 descargas, 0 likes |
| `almanach/camembert-base` (modelo base) | ~110 M (no detallado en la información) | 512 tokens | Masked language modeling; sin cabeza NER | No disponible | Pública en Hugging Face |
| Fine-tunes NER multietiqueta sobre CamemBERT-base (variantes basadas en wikiNER) | ~110 M (no detallado en la información) | 512 tokens | PER, LOC, ORG, MISC | No disponible | Públicas en Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada. La diferencia funcional principal es que este modelo es de clase única (persona, clasificación binaria), mientras que los fine-tunes NER multietiqueta cubren cuatro categorías con esquema BIO.

## Limitaciones y advertencias

- Solo detecta la clase persona: no identifica organizaciones, localizaciones ni miscelánea, y no distingue subtipos dentro de la clase.
- Sesgo de dominio: la segunda fase de entrenamiento se hizo con 999 títulos de vídeos de France Inter. El modelo puede sobreajustarse al estilo de ese medio (titulares cortos, alta densidad de nombres) y degradarse en prosa larga, textos técnicos o registros formales.
- Sesgo de la fuente: MultiNERD FR deriva de Wikipedia, por lo que es probable que infrarrepresente apodos, seudónimos, nombres transliterados y nombres con partículas (partículas nobiliarias, `bin`, `van`, `de`) poco frecuentes en el corpus.
- Desbalance de clases extremo: la clase positiva representa un 4,4 % de los tokens en MultiNERD FR. La exactitud es una métrica engañosa y cualquier despliegue debería calibrar el umbral y evaluar con F1 de la clase positiva.
- Sin métricas publicadas: la model card no reporta ningún resultado, de modo que no es posible verificar la calidad del modelo antes de usarlo. Cualquier evaluación de producción debe hacerse de forma independiente.
- Truncado a 512 tokens: los textos más largos se recortan, y las menciones situadas después del límite se pierden sin ningún aviso.
- Etiquetado por primer subtoken: el criterio de tomar la predicción del primer subtoken puede generar errores en nombres cuya tokenización fragmenta de forma poco natural.
- Sin validación comunitaria: 0 descargas y 0 likes, y el modelo procede de un trabajo de clase, no de un pipeline de publicación con revisión.
- Alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente son falsos positivos y falsos negativos en la detección.
- Licencia: MIT, permisiva y compatible con uso comercial, pero conviene verificar la licencia del modelo base (`almanach/camembert-base`) antes de redistribuir el modelo o sus derivados.
- No se documentan versiones cuantizadas ni formatos alternativos; llevar el modelo a GGUF u ONNX requiere conversión manual y validación posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sara12340999/camembert-base-ner-personne-fr
- Modelo base: https://huggingface.co/almanach/camembert-base
- Paper de CamemBERT, "CamemBERT: a Tasty French Language Model": https://arxiv.org/abs/1911.03894
- Paper de MultiNERD, "MultiNERD: A Multilingual, Multi-Genre and Multi-Entity Mention Dataset": https://arxiv.org/abs/2202.14026
- Búsqueda web realizada: no se han encontrado enlaces relevantes sobre este modelo; los resultados disponibles corresponden a hilos de foro sin relación con el modelo.
