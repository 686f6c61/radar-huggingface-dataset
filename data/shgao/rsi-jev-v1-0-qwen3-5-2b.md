# shgao/rsi-jev-v1.0-qwen3.5-2b

## Resumen

rsi-jev-v1.0-qwen3.5-2b es un modelo de decisiones tipadas (*typed decisions*) desarrollado por shgao dentro del proyecto RSI-Jev. No es un modelo generativo: parte de `Qwen/Qwen3.5-2B-Base`, al que se le ha afinado la torre completa (salvo el *embedding* de entrada, que queda congelado) y se le ha añadido una cabeza de puntuación de opciones llamada `option_xattn`. Dado un documento y un conjunto de preguntas tipadas (sí/no, elegir una entre *k*, o puntuar según una rúbrica), devuelve una probabilidad calibrada para cada opción en una única pasada *forward*, sin generar texto.

El modelo es relevante porque aborda un nicho poco cubierto: tomar decisiones discretas y calibradas sobre documentos en lugar de producir texto libre. Al no generar *tokens*, el coste de inferencia es el de un único *forward pass*, lo que lo hace atractivo para etiquetado a gran escala, triaje y evaluación automática con rúbricas. Además, expone una API HTTP propia (Jev) documentada por el autor.

El *checkpoint* publicado corresponde a la semilla 17, fijada de antemano como primaria y no seleccionada por ser la mejor de las tres entrenadas (17/29/43). El autor indica explícitamente que los modelos se entrenan mediante un bucle de investigación autónomo y que los informes de errores se incorporan como casos de prueba. El repositorio ocupa 5,6 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B-Base) con cabeza de cross-attention `option_xattn` de 7,3 M de parametros |
| Parametros totales | No disponible con precision; el modelo base es Qwen3.5-2B-Base y se anade la cabeza de 7,3 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio incluye el script de carga `code/load_release.py`; tamano del repo: 5,6 GB) |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Tarea (*pipeline*) | text-classification |
| Tipos de pregunta | `choice` (elegir una de *k* opciones), `noul` (si/no, devuelve P(true)), `score` (rubrica de 2 a 10 niveles, devuelve probabilidad por nivel y su esperanza) |
| Semilla publicada | 17 (de 17/29/43), fijada de antemano como primaria |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal (Qwen3.5-2B-Base) al que se le anaden dos elementos: el afinado de todos los pesos de la torre excepto el *embedding* de entrada, que permanece congelado, y una cabeza de puntuación de cross-attention de 7,3 M de parametros. En esa cabeza, el estado oculto en la señal de decisión actúa como *query*, mientras que las representaciones medias de los *spans* de cada opción actúan como *keys* y *values*; el resultado de la atención se proyecta a un logit por opción. Como la atención cubre el conjunto completo de opciones, el logit de una opción depende de contra qué compite, lo que convierte al modelo en un evaluador con contexto relativo en lugar de un clasificador independiente por clase.

El entrenamiento usa el conjunto `n4ze3m/typed-decisions-synth`, con 6.977 documentos que llevan la distribución completa del *teacher* por pregunta. El objetivo es entropía cruzada suave sobre esas distribuciones, con las opciones barajadas en cada ejemplo. La programación es de 1.500 pasos con *batch* 16; la torre usa *cosine* a 5e-6 y la cabeza 1e-4 constante. El coste es de aproximadamente 13 minutos por semilla en una H100 para el modelo de 2B (10 minutos para el de 0,8B). En precisión se emplea *autocast* bf16 con *gradient checkpointing* y maestro fp32 en la torre, mientras que la cabeza se mantiene en fp32 fuera del *autocast*. La pila de kernels es `fla-0.5.2 / torch-2.7.1+cu128`, y el autor advierte que las cifras solo son comparables dentro de una misma pila de kernels.

El autor documenta cuatro decisiones forzadas por fallos previos: afinar la torre en lugar de congelarla (todas las variantes congeladas se quedaban por debajo de la línea base de mayoría); mantener la cabeza en fp32 fuera de *autocast* (siete experimentos fallidos); barajar las opciones en cada ejemplo, porque un codificador causal solo ve las opciones 1…*k*−1 y una cabeza entrenada con orden fijo colapsa sobre la posición (una ejecución temprana eligió la última opción en 800 de 800 preguntas de tipo `score`); y usar tres semillas, porque la desviación estándar entre ellas es de 0,011 y las diferencias de una sola semilla por debajo de ese valor son ruido. El conjunto de evaluación está completamente reservado y verificado: ningún documento de entrenamiento comparte estado con las particiones de *train* o *test* del benchmark, ni comparte siquiera una frase de 12 palabras con ellas.

## Capacidades

- Respuesta a preguntas de tipo `noul` (sí/no) sobre un documento, devolviendo P(true) como probabilidad calibrada.
- Selección entre *k* opciones nombradas (`choice`), con una probabilidad por opción.
- Puntuación según rúbrica de 2 a 10 niveles (`score`), con probabilidad por nivel y su valor esperado.
- Resolución de las tres tareas en una única pasada *forward*, sin decodificación ni generación de texto.
- Sensibilidad al conjunto de opciones: el logit de cada opción se calcula en función de sus competidoras.
- Exposición de una API HTTP propia (Jev), documentada en `docs.typesafe.ai/api`.
- Entrenamiento sobre distribuciones completas del *teacher*, no sobre etiquetas duras, lo que permite obtener probabilidades suaves.
- No disponible: *tool calling* / *function calling*.
- No disponible: soporte para agentes o razonamiento multi-paso.
- No disponible: capacidades de visión, audio o *thinking mode*.
- No disponible: cobertura multilingüe declarada.

## Casos de uso

- Triaje de documentos con respuesta sí/no: el modelo evalúa un documento contra una condición (`noul`) y devuelve P(true), lo que permite fijar un umbral de decisión ajustado al coste de los falsos positivos y negativos en lugar de depender de una etiqueta binaria dura.
- Moderación o filtrado de contenido a escala: al ser una única pasada *forward* sin generación, el coste por documento es bajo y se puede aplicar a lotes grandes donde un modelo generativo resultaría demasiado caro.
- Evaluación automática de respuestas abiertas con rúbrica: la tarea `score` con 2 a 10 niveles devuelve tanto la distribución por nivel como su esperanza, lo que sirve para calificar con una nota continua y además conservar la incertidumbre de la evaluación.
- Clasificación de tickets de soporte con categorías nombradas: la tarea `choice` asigna una probabilidad a cada categoría declarada, y las categorías pueden redefinirse por consulta sin reentrenar el modelo.
- *Reranking* o selección del mejor candidato: dado un documento y varias alternativas (por ejemplo, resúmenes o respuestas generadas), el modelo puntúa cada una dentro del conjunto y la atención cruzada sobre opciones hace que la comparación sea relativa al resto de candidatas.
- Etiquetado y destilación de conjuntos de datos: el modelo se entrenó sobre distribuciones de un *teacher*, por lo que puede emplearse para reproducir ese tipo de anotación suave sobre corpus nuevos sin recurrir a un modelo generativo.
- Enrutamiento de decisiones en un *pipeline*: la salida probabilística permite derivar ramas condicionales (por ejemplo, enviar a revisión humana los casos con probabilidad intermedia) y encadenar la decisión con otros componentes mediante la API Jev.
- Investigación sobre calibración y decisiones tipadas: el repositorio publica el registro completo del experimento, tres semillas y la receta de reproducción, lo que lo hace util para estudiar estabilidad de entrenamiento y calibración frente a una linea base de mayoria.

## Benchmarks y rendimiento

| Benchmark | RSI-Jev-v1.0-2B | RSI-Jev-v1.0-0.8B | Jev (referencia) | Linea base de mayoria |
|---|---|---|---|---|
| `LocalLLaMA/typed-decisions`, *pooled top-1* (400 documentos, 2.000 decisiones) | 0,662 | 0,614 | 0,727 | 0,5185 |
| Typed-decisions (tabla de checkpoints, "as written") | 0,6525 | no disponible (cifra truncada en la model card) | no disponible | no disponible |
| Typed-decisions con opciones en orden inverso | 0,6525 | no disponible | no disponible | no disponible |
| MMLU-Pro 1k | 0,3550 | no disponible | no disponible | no disponible |
| Reproduccion de su ejecucion de entrenamiento | 1,0000 | no disponible | no disponible | no disponible |

Nota: la model card presenta dos cifras para el 2B (0,662 de *pooled top-1* sobre el conjunto de test y 0,6525 en la tabla de *checkpoints*). Se recogen ambas tal como aparecen, sin interpretar la diferencia. La desviacion estandar entre las tres semillas (17/29/43) es de 0,011, segun el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia derivada del tamano, los pesos del modelo base de 2B en bf16 ocuparian del orden de 4 a 5 GB, a lo que hay que sumar activaciones y la cabeza en fp32; el repositorio completo ocupa 5,6 GB.
- GPU empleada en entrenamiento: una H100, con aproximadamente 13 minutos por semilla para la variante de 2B (10 minutos para la de 0,8B).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Inferencia en GPU de consumo: no confirmado en la informacion disponible; por tamano del modelo base (2B) es plausible en GPUs consumer con VRAM suficiente, pero el autor no lo documenta.
- Opciones de despliegue: el autor proporciona una pila propia con `code/load_release.py` (funcion `load_release`) y una API HTTP Jev. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Tipos de cuantizacion soportados: no disponibles.
- Latencia y throughput: no disponibles mas alla del coste de entrenamiento; la inferencia requiere una unica pasada *forward* por conjunto de preguntas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (typed-decisions) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSI-Jev-v1.0-2B | Base Qwen3.5-2B + cabeza de 7,3 M | No disponible | 0,6525 / 0,662 *pooled top-1* | Apache 2.0 | HuggingFace, 0 descargas |
| RSI-Jev-v1.0-0.8B | Base Qwen3.5-0.8B + cabeza de 7,3 M | No disponible | 0,614 *pooled top-1* | No disponible en la informacion extraida | HuggingFace |
| Jev | No disponible | No disponible | 0,727 *pooled top-1* | No disponible | No disponible |
| Linea base de mayoria | No aplica | No aplica | 0,5185 *pooled top-1* | No aplica | No aplica |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (clasificacion de documentos con preguntas tipadas y salida probabilistica) en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta *tool calling* ni razonamiento multi-paso, y no debe evaluarse con benchmarks de generacion.
- Rendimiento inferior a la referencia Jev (0,6525–0,662 frente a 0,727 en *pooled top-1*), aunque superior a la linea base de mayoria (0,5185).
- La desviacion estandar entre semillas es de 0,011; cualquier diferencia inferior a ese valor no debe interpretarse como mejora real.
- El checkpoint publicado es la semilla 17 fijada de antemano, no el mejor de los tres entrenados; el autor lo declara explicitamente.
- El logit de cada opcion depende de las opciones con las que compite, por lo que cambiar el conjunto de alternativas altera la salida y dificulta comparaciones entre ejecuciones con conjuntos distintos.
- Entrenado sobre datos sinteticos (`n4ze3m/typed-decisions-synth`, 6.977 documentos) generados por un *teacher*; puede heredar sus sesgos y sus errores sistematicos.
- No hay informacion disponible sobre sesgos demograficos, idiomas soportados ni comportamiento fuera del ingles.
- Las cifras solo son comparables dentro de la misma pila de kernels (`fla-0.5.2 / torch-2.7.1+cu128`), segun advierte el autor.
- El uso requiere codigo propio (`code/load_release.py`); no se documenta integracion con librerias estandar como `transformers`, vLLM o llama.cpp.
- Adopcion practicamente nula en el momento de la ficha: 0 descargas y 0 *likes* en HuggingFace.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias ni soporte y pide que los fallos se reporten en las discusiones del repositorio.
- Riesgo de confianza mal calibrada: el autor senala que un caso en el que el modelo se equivoca con alta confianza es especialmente util como caso de prueba, lo que implica que tales casos existen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shgao/rsi-jev-v1.0-qwen3.5-2b
- Discusiones del repositorio: https://huggingface.co/shgao/rsi-jev-v1.0-qwen3.5-2b/discussions
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio GitHub del proyecto: https://github.com/Shanghua-Gao/RSI-Jev
- README raiz del proyecto: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/README.md
- Receta de reproduccion: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/rsijev/README.md
- Documentacion de la API HTTP de servicio: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/serve/README.md
- API Jev: https://docs.typesafe.ai/api
- Conjunto de datos de entrenamiento: `n4ze3m/typed-decisions-synth`
- Conjunto de evaluacion: `LocalLLaMA/typed-decisions`
