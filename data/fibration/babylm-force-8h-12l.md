# Fibration/babylm-force-8h-12L

## Resumen

ForceGPT es un modelo de lenguaje causal de pequeno tamano (54,5 millones de parametros) desarrollado por Joseph Yew Choe Chan (investigador independiente, publicado bajo el handle Fibration) para el reto BabyLM 2026 Strict-Small. El modelo implementa una modificacion del mecanismo de atencion denominada Force Attention, que introduce una interaccion cuadratica de bajo rango entre caracteristicas de query y key, sumandose a los logits de atencion convencionales antes del softmax. La propuesta se enmarca en la pregunta de investigacion de si una atencion de orden superior puede aportar ventajas a modelos pequenos entrenados con corpus muy limitados (10 millones de palabras).

La arquitectura es un transformer causal estandar de 12 bloques y 8 cabezas de atencion, con dimension oculta 512 y contexto de 512 tokens, en el que solo uno de los bloques intermedios (configuracion 6P-1F-5S) usa Force Attention. El resto de bloques mantiene atencion dot-product convencional con RoPE. El modelo se entrena desde inicializacion aleatoria sobre el corpus BabyLM 2026 Strict-Small y se publica como checkpoint de investigacion acompanado de un articulo aceptado (no publicado en actas) en el taller BabyLM 2026 de EMNLP 2026.

El interes practico es limitado fuera del ambito de investigacion: se trata de un modelo de 54 millones de parametros, con contexto de 512 tokens y sin pipeline declarado, orientado a estudiar sesgos inductivos en regimen de datos escasos. Su relevancia radica en la reproducibilidad del experimento y en los resultados comparativos multi-semilla frente a un GPT emparejado, no en su uso como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, 6P-1F-5S (6 bloques de atencion estandar, 1 bloque Force Attention, 5 bloques estandar) |
| Parametros totales | 54.569.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8/INT4) |
| Idiomas soportados | no disponible (entrenado sobre BabyLM Strict-Small, corpus en ingles por diseno del reto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

Otros datos de configuracion: 12 bloques transformer, 8 cabezas de atencion, dimension oculta 512, dimension por cabeza 64, rango de proyeccion cuadratica 16, coeficiente de fuerza 0,05 fijo, 32.768 parametros adicionales del mecanismo de fuerza, embeddings posicionales rotatorios (RoPE), tokenizador BPE con vocabulario de 16.384, semilla de entrenamiento 3407. Tamano del repositorio: 8,3 GB.

## Arquitectura y entrenamiento

ForceGPT parte de un transformer causal convencional y sustituye la atencion de un unico bloque intermedio por Force Attention. La modificacion anade a los logits escalados de query-key un termino de segundo orden: `Z = QK^T / sqrt(d_h) + lambda * (U_Q U_K^T) / sqrt(r) + M`, donde `U_Q` y `U_K` se construyen a partir de productos elemento a elemento de proyecciones de bajo rango aprendidas independientemente sobre las representaciones de query y key, `lambda` es el coeficiente de fuerza (0,05 fijo), `r` el rango de la proyeccion cuadratica (16) y `M` la mascara causal. La interaccion sigue siendo por pares de posiciones de token; el caracter de orden superior se refiere a las caracteristicas de las representaciones que interactuan, no a interacciones entre tres o mas posiciones. El mecanismo introduce 32.768 parametros adicionales entrenables.

El entrenamiento se realizo desde inicializacion aleatoria sobre el corpus BabyLM 2026 Strict-Small (aproximadamente 10 millones de palabras), con objetivo de prediccion del siguiente token, optimizador AdamW, esquema de learning rate con warmup, decaimiento coseno y cooldown, dropout 0,1 y precision mixta bfloat16. Se ejecutaron aproximadamente 10 epocas con un pequeno buffer en la ultima, usando un curriculum de longitud de contexto que progresa de 128 a 256 y finalmente 512 tokens. Todo el entrenamiento cupo en una unica NVIDIA RTX 4070 Ti de 12 GB de VRAM. Para los experimentos controlados, los modelos GPT y Force Attention se entrenaron bajo condiciones emparejadas (tokenizadores, orden de datos, semillas y ajustes de optimizacion identicos) sobre una particion 95/5 de entrenamiento/validacion; el checkpoint publicado, en cambio, se entreno sobre el corpus completo del reto.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, limitada por el corpus de entrenamiento de 10 millones de palabras.
- Modelado del lenguaje a nivel de token y evaluacion de conocimiento sintactico y morfologico (tareas BLiMP, BLiMP Supplement, COMPS, EWoK).
- Tareas de comprension lectora y clasificacion de frases en el marco de evaluacion BabyLM ((Super)GLUE, GlobalPIQA, Entity Tracking, Reading).
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el entrenamiento se limita al corpus del reto, en ingles.
- No dispone de modo thinking, vision ni audio.
- El checkpoint se distribuye con codigo personalizado (`force-gpt`, `custom_code`) que debe cargarse con `trust_remote_code`.

## Casos de uso

- Investigacion sobre mecanismos de atencion: el modelo sirve como referencia reproducible para estudiar el efecto de interacciones cuadraticas de bajo rango en la atencion, comparandolo con el GPT emparejado bajo las mismas condiciones de datos y semillas.
- Experimentos de bajo presupuesto computacional: al entrenar en una unica RTX 4070 Ti y ejecutarse en GPU de consumo, permite replicar el pipeline completo (entrenamiento y evaluacion BabyLM) sin infraestructura dedicada.
- Evaluacion de sesgos inductivos en regimen de datos escasos: util para analizar como se comporta un modelo de 54 millones de parametros cuando el corpus esta limitado a 10 millones de palabras, midiendo diferencias en perdida de validacion por anchura y semilla.
- Analisis de curvas de aprendizaje y ruido experimental: las comparaciones multi-semilla publicadas (5 anchuras, 6 semillas emparejadas) permiten estudiar la variabilidad del entrenamiento en modelos pequenos y el tamano de efecto de modificaciones arquitectonicas menores.
- Docencia y divulgacion: modelo pequeno y de codigo accesible para explicar arquitecturas transformer, RoPE, atencion escalada y variantes de atencion en cursos o talleres.
- Pruebas de integracion de codigo personalizado en Hugging Face: sirve como caso de prueba para flujos que requieren `trust_remote_code` y arquitecturas no estandar registradas en el repositorio.
- Generacion de texto de dominio restringido en ingles: con contexto de 512 tokens puede emplearse en tareas de continuacion o clasificacion de frases cortas, siempre asumiendo la calidad limitada de un modelo de este tamano.

## Benchmarks y rendimiento

Resultados de la evaluacion oficial BabyLM 2026 Strict-Small para el checkpoint ForceGPT de 8 cabezas, junto con una evaluacion local indicativa del GPT emparejado (no equivalente a una entrada oficial del leaderboard):

| Metrica | ForceGPT 8h | GPT 8h |
|---|---:|---:|
| Overall Average | 39,04 | no disponible |
| NLP Average | 50,14 | 49,87 |
| BLiMP | 69,71 | 67,38 |
| BLiMP Supplement | 59,47 | 58,78 |
| EWoK | 52,52 | 52,86 |
| Entity Tracking | 19,54 | 20,98 |
| COMPS | 52,33 | 51,65 |
| GlobalPIQA | 33,19 | 33,64 |
| Reading | 0,38 | 0,17 |
| (Super)GLUE | 64,19 | 63,79 |

Diferencias de perdida de validacion final (Force menos GPT, tras 10 epocas; negativo favorece a ForceGPT) en las comparaciones controladas multi-semilla:

| Cabezas | Diferencia media de perdida | Semillas mejores |
|---|---:|---:|
| 4 | -0,0004 ± 0,0009 | 4/6 |
| 5 | -0,0008 ± 0,0009 | 4/6 |
| 6 | -0,0013 ± 0,0008 | 5/6 |
| 7 | -0,0009 ± 0,0003 | 6/6 |
| 8 | -0,0001 ± 0,0007 | 4/6 |

La conclusion del autor es que la correccion de orden superior produce mejoras pequenas y dependientes de la anchura, con curvas de aprendizaje ruidosas; no se establece una ventaja general sobre la atencion estandar. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 54,5 millones de parametros en bfloat16, los pesos ocupan aproximadamente 110 MB; en float32, unos 220 MB. La VRAM real dependera del framework y del contexto (512 tokens), pero cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: el modelo se entreno en una RTX 4070 Ti de 12 GB; para inferencia basta con GPU de gama media (por ejemplo, RTX 3060, RTX 4060) o incluso CPU para lotes pequenos.
- Cabe en GPU de consumo: si, sin restricciones practicas por memoria.
- Opciones de despliegue: transformers con `trust_remote_code=True` (necesario por la arquitectura `force-gpt` personalizada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF hace improbable el despliegue directo en llama.cpp u Ollama sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| ForceGPT 8h (este modelo) | 54,5 M | 512 | Transformer causal con Force Attention en 1 bloque | no disponible | Hugging Face, safetensors, custom_code |
| GPT 8h emparejado (baseline del paper) | similar (arquitectura GPT estandar) | 512 | Transformer causal con atencion dot-product | no disponible | Solo resultados en el paper, no se referencia checkpoint publico |
| Otros modelos BabyLM Strict-Small | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico comparable directo documentado es el GPT emparejado del propio estudio, con tokenizador, datos, semillas y optimizacion identicos. No se dispone de informacion sobre otros modelos del leaderboard BabyLM 2026 Strict-Small en los datos proporcionados.

## Limitaciones y advertencias

- Modelo de investigacion: 54,5 millones de parametros y 512 tokens de contexto; no apto para tareas de produccion que requieran conocimiento amplio, contexto largo o razonamiento complejo.
- Entrenado con solo 10 millones de palabras del corpus BabyLM Strict-Small; el conocimiento del mundo y la cobertura linguistica son muy limitados.
- Idiomas: no se documentan; el corpus del reto es en ingles, por lo que el rendimiento en castellano u otros idiomas no esta respaldado.
- Riesgo de alucinacion elevado por el reducido tamano y corpus; las salidas no deben tratarse como factuales.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el corpus del reto puede introducir sesgos propios de su composicion.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier uso fuera de investigacion.
- Requiere `trust_remote_code=True` por el codigo personalizado (`force-gpt`), lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de cargarlo.
- Los resultados del GPT baseline son de evaluacion local no oficial; la comparacion con ForceGPT no es equivalente a una entrada del leaderboard.
- Los beneficios del mecanismo son pequenos, dependientes de la anchura y con ruido en las curvas de aprendizaje; no se debe interpretar como una mejora general de la atencion estandar.
- El articulo fue aceptado tras revision por pares en el taller BabyLM 2026 (EMNLP 2026) pero no se publico en las actas del taller.
- No se documentan tipos de cuantizacion ni formatos GGUF; el despliegue en herramientas tipo llama.cpp u Ollama requeriria conversion manual no soportada oficialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fibration/babylm-force-8h-12L
- Articulo (manuscrito en el repositorio): https://huggingface.co/Fibration/babylm-force-8h-12L/blob/main/paper.pdf
- Dataset de entrenamiento: https://huggingface.co/datasets/BabyLM-community/BabyLM-2026-Strict-Small
- Taller BabyLM 2026 (EMNLP 2026): no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
