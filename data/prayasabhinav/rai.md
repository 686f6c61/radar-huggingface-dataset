# prayasabhinav/rai

## Resumen

rai reader 0.3.2 es un modelo de question answering extractivo desarrollado por prayasabhinav (atribuido a Koher) como componente de lectura de la herramienta rai, publicada en el repositorio koherarchitecture/rai. Su funcion concreta es distinta de la de un modelo generativo: dada una pregunta y una respuesta corta escrita por una persona, devuelve el fragmento textual que responde a la pregunta, o nada. No genera texto libre en ningun caso. La herramienta completa usa esa lectura para decidir, mediante codigo determinista, si una descripcion es completa segun una nocion de completitud definida de antemano.

El modelo no introduce arquitectura nueva: es un fine-tune de deepset/minilm-uncased-squad2, que a su vez es un ajuste de Microsoft MiniLM-L12-H384-uncased sobre SQuAD 2.0. Conserva por tanto la arquitectura transformer encoder de tipo BERT con 33.212.930 parametros y una longitud maxima de secuencia de 384 tokens. La innovacion no esta en el modelo sino en el procedimiento de evaluacion y en el uso del margen frente a la respuesta nula como criterio de aceptacion.

Su relevancia es acotada y deliberadamente estrecha: cubre la tarea de distinguir respuestas honestas de respuestas evasivas, diferidas, genericas, vacias o fuera de tema en un dominio controlado de descripciones breves. El autor es explicito sobre el alcance: el modelo no puntua, no sugiere y no da razones, y no debe usarse como paso de una decision que afecte a terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L12-H384-uncased, 12 capas, 384 de dimension oculta) |
| Parametros totales | 33.212.930 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 384 tokens (longitud maxima de entrenamiento y de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura identica a la del modelo base deepset/minilm-uncased-squad2: un encoder transformer MiniLM-L12-H384-uncased con cabeza extractiva de question answering para SQuAD 2.0, que incluye la clase de respuesta nula. No se anaden capas ni modulos. El pipeline declarado en HuggingFace es question-answering y la libreria es transformers.

El entrenamiento se hizo exclusivamente con datos sinteticos: 12.000 pares generados por plantillas mediante `scripts/synth.py` con semilla 7. Los ejemplos positivos son respuestas honestas, presentadas solas o precedidas del tallo de la pregunta; los negativos agrupan respuestas evasivas, diferidas, genericas, vacias y fuera de pregunta, etiquetadas como *no answer*. No se uso texto de personas reales. La configuracion fue de dos epocas, batch de 32, learning rate 2e-5 y longitud maxima de 384, ejecutada en CPU en 460 segundos. No se menciona RLHF ni DPO.

La particularidad tecnica esta en la regla de lectura implementada en `rai/reader.py`, no en el modelo: se toma el mejor span frente a la respuesta nula, se limita a un maximo de 30 tokens y se exige que el span aparezca literalmente en la respuesta escrita. El criterio de aceptacion es un margen superior a 14,56. Con transformers estandar el modelo se comporta como cualquier extractivo de SQuAD 2.0, pero ese umbral solo es valido aplicando la regla de lectura de rai.

## Capacidades

- Question answering extractivo: devuelve el fragmento exacto de la respuesta que responde a la pregunta, o la respuesta nula.
- Distincion entre respuesta honesta y respuesta no valida, incluyendo categorias evasiva, diferida, generica, vacia y fuera de tema.
- Calculo de un margen numerico frente a la respuesta nula, utilizado como senal de confianza por la herramienta que lo envuelve.
- Ejecucion en CPU: el entrenamiento y la inferencia estan planteados para funcionar sin GPU.
- Integracion con la libreria transformers y con el wrapper propio `rai.reader.Reader`.
- No soporta generacion de texto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no. Solo ingles.

## Casos de uso

- Verificacion de completitud de descripciones estructuradas: el modelo extrae el span que responde a una pregunta concreta sobre un campo y el codigo circundante decide, con el margen de 14,56 y la regla de lectura, si la descripcion puede considerarse completa. Es el caso de uso nativo de la herramienta rai.
- Filtrado de respuestas evasivas en formularios: ante respuestas del tipo "ya lo he comentado" o "depende", el modelo las clasifica como respuesta nula y permite rechazarlas de forma automatica antes de procesarlas.
- Control de calidad en recogida de datos: en pipelines de anotacion, sirve para descartar entradas que no responden a la pregunta planteada, reduciendo el ruido antes de la revision humana.
- Deteccion de respuestas fuera de tema: en moderacion o clasificacion de envios breves, el modelo senala cuando el texto no responde a la pregunta formulada.
- Extraccion de spans para downstream determinista: al devolver el fragmento literal, permite alimentar reglas de validacion en codigo sin depender de texto generado ni de resumenes.
- Prototipado de asistentes de formularios con presupuesto de computo minimo: con 33 millones de parametros y ejecucion en CPU, puede desplegarse en entornos sin GPU para prevalidar respuestas antes de un modelo mayor.
- Investigacion sobre evaluacion de completitud: el par modelo mas conjunto de test v1 permite reproducir experimentos sobre umbrales de decision en QA extractivo con clases negativas desbalanceadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La unica evaluacion reportada es la del conjunto de test v1 del propio proyecto, de 360 filas, y mide una tarea especifica de recuento de respuestas honestas:

| Metrica | rai reader 0.3.2 | deepset/minilm-uncased-squad2 sin ajustar |
|---|---|---|
| Respuestas honestas contadas (de 180) | 116 | 16 |
| Respuestas evasivas rechazadas (de 120) | 120 | no disponible |
| Respuestas fuera de pregunta rechazadas (de 60) | 60 | no disponible |
| Umbral de margen usado | 14,56 | no disponible |

El autor advierte que el umbral se eligio sobre el mismo conjunto de test en el que se reporta, que el test no comparte ninguna frase con el entrenamiento pero si el estilo de plantilla, que solo hay una ejecucion con una semilla y que no se ha medido el rendimiento con respuestas escritas libremente por personas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 66 MB en fp32 y 33 MB en fp16, dado el tamano de 33,2 millones de parametros y el repo de 0,1 GB.
- GPU recomendadas: ninguna necesaria. Cualquier GPU con mas de 1 GB de memoria es sobradamente suficiente.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en GPUs integradas.
- Ejecucion en CPU: es el modo previsto por el autor; el entrenamiento completo se hizo en CPU en 460 segundos.
- Opciones de despliegue: transformers con el wrapper `rai.reader.Reader`; tambien como modelo extractivo SQuAD 2.0 estandar con la pipeline question-answering de transformers. No hay informacion sobre soporte especifico en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prayasabhinav/rai (rai reader 0.3.2) | 33.212.930 | 384 tokens | QA extractivo con criterio de completitud | CC-BY-4.0 | HuggingFace, 0 descargas |
| deepset/minilm-uncased-squad2 | 33,2 millones (misma arquitectura) | 384 tokens | QA extractivo SQuAD 2.0 | CC-BY-4.0 | HuggingFace, ampliamente usado |
| microsoft/MiniLM-L12-H384-uncased | 33,4 millones | 512 tokens | Modelo de lenguaje enmascarado (base) | MIT | HuggingFace, ampliamente usado |

La diferencia frente al modelo base no esta en la arquitectura ni en el numero de parametros, sino en el ajuste con 12.000 pares sinteticos etiquetados por construccion y en la regla de lectura con umbral de margen que aplica rai. Frente a MiniLM-L12-H384-uncased, rai incorpora la cabeza extractiva y el ajuste sobre SQuAD 2.0 heredado del modelo intermedio.

## Limitaciones y advertencias

- El umbral de 14,56 se eligio sobre el mismo conjunto de test en el que se reporta, lo que introduce sesgo optimista en la metrica.
- El conjunto de test y los datos de entrenamiento comparten el estilo de plantilla: respuestas cortas, llanas y concretas sobre las mismas diez cosas cotidianas. No comparten frases, pero si registro, por lo que el rendimiento con respuestas escritas libremente no esta medido.
- Una sola ejecucion de entrenamiento con una sola semilla; no hay estimacion de varianza.
- Solo ingles. Ademas, las plantillas se escribieron en India y contienen referencias a monedas, lugares y marcas indias, lo que sesga el vocabulario del dominio.
- No es un modelo generativo: no puede redactar, resumir ni razonar. Solo extrae spans o devuelve la respuesta nula.
- El umbral reportado solo es valido si se aplica la regla de lectura de `rai/reader.py`; con transformers estandar el modelo se comporta como cualquier extractivo SQuAD 2.0 y el umbral no se sostiene.
- Riesgo de alusion erronea o span espurio inherente a los modelos extractivos, especialmente fuera del dominio de plantillas.
- El propio autor declara fuera de alcance el uso del modelo para puntuar, sugerir, dar razones, o como paso de una decision que afecte a otra persona.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion a Koher (rai reader), a deepset y a Microsoft.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, sin validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prayasabhinav/rai
- Repositorio de la herramienta rai: https://github.com/koherarchitecture/rai
- Modelo base: https://huggingface.co/deepset/minilm-uncased-squad2
- Modelo original de Microsoft: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
