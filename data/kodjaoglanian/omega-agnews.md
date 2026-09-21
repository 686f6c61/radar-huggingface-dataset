# Kodjaoglanian/omega-agnews

## Resumen

System Omega v5.5 (omega-agnews) es un clasificador de texto de 4 clases (World, Sports, Business y Sci/Tech) desarrollado por el usuario Kodjaoglanian. Se trata de un fine-tuning de answerdotai/ModernBERT-base, un transformer encoder de aproximadamente 150 millones de parámetros, sobre el dataset AG News oficial (120.000 muestras de entrenamiento y 7.600 de test). El modelo resuelve una tarea acotada y muy extendida: la categorización automática de noticias en cuatro verticales temáticas mediante un único forward pass no autoregresivo.

Su relevancia actual es doble. Por un lado, reporta una precisión del 95,04 % (macro-F1 95,04 %) en el split público de AG News, compitiendo con modelos de más del doble de tamaño como Laya (421M) con una latencia de 7,97 ms en bf16 para una sola consulta y 0,25 ms por consulta con batch de 32. Por otro, documenta de forma transparente su metodología de entrenamiento (model soup sobre dos corridas con EMA, 2 épocas, selección del mejor candidato sobre el split público), algo poco habitual en modelos de clasificación pequeños.

El repositorio tiene 0,3 GB, licencia Apache 2.0, cero descargas y cero likes en el momento de la consulta, y requiere cargar código personalizado (modeling_omega.py) en lugar de usar las clases estándar de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone ModernBERT-base) + cabeza de clasificacion OMEGA |
| Parametros totales | ~150 M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el backbone ModernBERT-base admite hasta 8.192 tokens) |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 |
| Idiomas soportados | no disponible (el dataset AG News es en ingles, pero la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | no confirmado explicitamente; repositorio de 0,3 GB compatible con pesos de ~150 M en bf16, mas el archivo modeling_omega.py |
| Tarea | clasificacion de texto, 4 clases (World / Sports / Business / Sci-Tech) |
| Dataset | AG News oficial (120.000 train / 7.600 test) |
| Modelo base | answerdotai/ModernBERT-base |
| Fecha de publicacion (metadatos HF) | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de ModernBERT-base y le superpone una cabeza de clasificacion propia denominada OMEGA. Esta cabeza concatena el mean-pooling y la representacion del token CLS, proyecta de 1.536 a 768 dimensiones con una capa lineal, aplica GELU, un dropout de 0,1 y una proyeccion final de 768 a 4 clases. La inferencia es de un solo paso, no autoregressiva, y los pesos se guardan en bf16. La clase del modelo y el helper `load_omega` se distribuyen en el propio repositorio (`modeling_omega.py`), por lo que la carga no se realiza mediante `AutoModelForSequenceClassification`.

El entrenamiento sigue una receta de model soup: dos corridas de fine-tuning con la misma inicializacion pero semillas de datos distintas (42 y 1337), 2 epocas por corrida, batch de 128, learning rate de 5e-05 con warmup del 5 % y decaimiento lineal, length bucketing, autocast en bf16, label smoothing de 0,05 y EMA con decay 0,995. El candidato publicado es la corrida A con pesos EMA (95,04 %); el candidato SOUP, media aritmetica de los pesos EMA de ambas corridas, alcanzo 94,99 %. Se evaluaron 5 candidatos sobre el split de test oficial y se selecciono el mejor, decision que la propia model card declara explicitamente. El entrenamiento completo de las dos corridas requirio 393 segundos en una GPU L40S y no se produjo ningun batch con NaN.

## Capacidades

- Clasificacion de texto en 4 categorias fijas: World, Sports, Business y Sci/Tech.
- Inferencia de un unico forward pass, sin generacion de texto ni decodificacion autoregresiva.
- Salida de probabilidades por clase (softmax sobre 4 logits), util para umbrales y enrutado por confianza.
- Alto rendimiento en las clases Sports (F1 98,92 %) y World (F1 96,11 %).
- Eficiencia de inferencia: 7,97 ms por consulta en bf16 y 0,25 ms por consulta con batch de 32 sobre L40S, segun los datos reportados por el autor.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni chain-of-thought.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Capacidad multilingue: no declarada; el modelo se entrena exclusivamente con AG News, un corpus de noticias en ingles.
- No soporta clasificacion multietiqueta ni un numero de clases distinto de 4 sin reentrenar la cabeza.

## Casos de uso

- Clasificacion de titulares en agregadores de noticias: cada item de un feed RSS se etiqueta en una de las 4 verticales antes de indexarse, con un coste de 0,25 ms por consulta en batch sobre GPU, lo que permite procesar decenas de miles de titulares por minuto en una sola tarjeta.
- Enrutado tematico en un CMS editorial: el clasificador asigna automaticamente la seccion (Business, Sci/Tech, Sports, World) de una noticia entrante, reduciendo la revision manual y alimentando sistemas de recomendacion por vertical.
- Curacion de corpus para entrenamiento: filtrado y balanceo tematico de grandes volumenes de texto en ingles antes de usarlos para preentrenamiento o fine-tuning de otros modelos, aprovechando el throughput alto en lotes.
- Vigilancia de mercados: deteccion de piezas clasificadas como Business para disparar pipelines de analisis financiero, con F1 del 92,13 % en esa clase como referencia de fiabilidad.
- Moderacion y organizacion de foros o comentarios: etiquetado tematico de contenido generado por usuarios para agrupar hilos o aplicar reglas de seccion, siempre que el dominio se parezca al de noticias.
- Despliegue en entornos con recursos limitados: con ~150 M de parametros en bf16, el modelo puede ejecutarse en CPU o en GPU de gama de entrada para tareas de clasificacion por lotes fuera de linea.
- Baseline de investigacion: punto de comparacion reproducible para estudiar tecnicas de model soup, EMA y seleccion de checkpoints en clasificacion de texto, ya que la receta y las semillas estan documentadas.
- Preetiquetado en anotacion humana: generacion de etiquetas iniciales con sus probabilidades para que los anotadores solo revisen los casos de baja confianza, acelerando la construccion de datasets tematicos.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de test oficial de AG News (7.600 muestras):

| Candidato | Precision |
|---|---|
| RUN A EMA (publicado) | 95,04 % |
| RUN B RAW | 94,97 % |
| RUN A RAW | 94,95 % |
| RUN B EMA | 94,89 % |
| SOUP (media A+B de los EMA) | 94,99 % |

Metricas del modelo publicado:

| Metrica | Valor |
|---|---|
| Precision global | 95,04 % |
| Macro-F1 | 95,04 % |
| F1 World | 96,11 % |
| F1 Sports | 98,92 % |
| F1 Business | 92,13 % |
| F1 Sci/Tech | 93,00 % |
| Latencia (bf16, single) | 7,97 ms |
| Latencia (bf16, batch 32) | 0,25 ms por consulta |
| Tiempo de entrenamiento | 393 s, 2 corridas (GPU L40S) |

Comparacion publicada por el autor con otros modelos sobre el mismo dataset:

| Modelo | Precision reportada | Parametros |
|---|---|---|
| omega-agnews (RUN A EMA) | 95,04 % | ~150 M |
| Laya | 0,950 (95,0 %) | 421 M |
| Jev 1.13 | 0,910 (91,0 %) | no disponible |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, GLUE, etc.), que ademas no aplican a un clasificador de 4 clases.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 de un modelo de ~150 M ocupan del orden de 0,3 GB; con activaciones y overhead del runtime, la inferencia cabe holgadamente en menos de 2 GB de VRAM.
- GPU utilizada y validada por el autor: NVIDIA L40S (entrenamiento e inferencia de referencia).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, T4, L4); en tarjetas de datacenter (A100, H100, L40S) el cuello de botella sera el ancho de banda de host y el preprocesado del tokenizador, no el calculo.
- Inferencia en CPU: viable por el tamano del modelo, adecuada para lotes fuera de linea; no se han publicado latencias en CPU.
- Caben en GPU de consumo: si, practicamente cualquier GPU consumer moderna, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: carga mediante `transformers` + `AutoTokenizer` junto con `modeling_omega.py` y el helper `load_omega` (codigo personalizado, requiere descargar el archivo). No se documenta soporte directo para vLLM, TGI, Ollama ni llama.cpp, ya que la cabeza OMEGA no es una `AutoModelForSequenceClassification` estandar y no hay versiones GGUF publicadas. La exportacion a ONNX o TorchScript seria posible pero no esta documentada.
- Latencia y throughput: 7,97 ms por consulta en bf16 con batch 1 y 0,25 ms por consulta con batch 32, medidos en una L40S. Extrapolando esos 0,25 ms por consulta, el throughput teorico ronda las 4.000 consultas por segundo por GPU, aunque el autor no lo declara explicitamente.
- Memoria del repositorio: 0,3 GB, sin requisitos de disco relevantes.

## Comparativa con modelos similares

| Modelo | Parametros | Precision en AG News (test oficial) | Licencia | Disponibilidad |
|---|---|---|---|---|
| omega-agnews (RUN A EMA) | ~150 M | 95,04 % | apache-2.0 | HuggingFace, requiere codigo propio |
| Laya | 421 M | 95,0 % (numero publico citado por el autor) | no disponible | no disponible |
| Jev 1.13 | no disponible | 91,0 % (numero publico citado por el autor) | no disponible | no disponible |

La comparativa se limita a los datos que el autor cita en la model card. No se dispone de informacion sobre la longitud de contexto, los idiomas, la licencia ni los formatos de pesos de Laya y Jev 1.13, por lo que no es posible una comparacion completa. La ventaja declarada de omega-agnews frente a Laya es la mitad de parametros (~150 M frente a 421 M) con una precision equivalente y una latencia aproximadamente cuatro veces menor.

## Limitaciones y advertencias

- Seleccion sobre el split publico: los 5 candidatos se evaluaron sobre el test oficial de AG News y se publico el mejor, lo que la propia model card reconoce. Esto introduce un sesgo optimista en la precision reportada, que no debe interpretarse como rendimiento en datos no vistos de un dominio distinto.
- Alcance muy restringido: solo clasifica 4 clases y esta entrenado exclusivamente con AG News. No es un clasificador tematico general ni admite etiquetas nuevas sin reentrenar la cabeza.
- Idioma: el corpus de entrenamiento es en ingles; no se declaran idiomas soportados ni se aportan evaluaciones multilingues, por lo que el rendimiento en castellano es desconocido.
- Clase mas debil: Business obtiene el F1 mas bajo (92,13 %), lo que indica mayor confusion con Sci/Tech y World en ese ambito.
- Sesgos: no se documenta ningun analisis de sesgo, robustez, toxicidad ni comportamiento ante dominios fuera de distribucion (redes sociales, texto juridico, textos muy cortos o con errores ortograficos).
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la clasificacion erronea con alta confianza en entradas fuera de dominio.
- Codigo personalizado: requiere importar `modeling_omega.py` y usar `load_omega`, en lugar de las clases estandar de Transformers. Esto complica la integracion con servidores de inferencia convencionales y exige revisar el codigo antes de ejecutarlo en produccion.
- Licencia: Apache 2.0 permite uso comercial del modelo, pero conviene verificar los terminos del modelo base (answerdotai/ModernBERT-base), que se distribuye bajo su propia licencia, y las condiciones del dataset AG News.
- Validacion externa nula: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin replicaciones independientes de los resultados.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relacionada con el modelo (versan sobre alternativas a un exchange de criptomonedas), por lo que no aportan datos verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kodjaoglanian/omega-agnews
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Codigo de carga personalizado: archivo `modeling_omega.py` incluido en el repositorio del modelo en HuggingFace
- Referencia metodologica citada en la model card: Wortsman et al., "Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time", ICML 2022 (sin URL incluida en la model card)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a comparativas de un servicio de criptomonedas (Paybis) y no guardan relacion con esta ficha
