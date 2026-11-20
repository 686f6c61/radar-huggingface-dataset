# juiceb0xc0de/bella-bartender-gemma-e4b-gguf

## Resumen

Bella Bartender Gemma E4B es un ajuste fino (fine-tune) del modelo google/gemma-4-E4B-it, desarrollado por juiceb0xc0de y distribuido en formato GGUF. El objetivo del autor no es mejorar las capacidades cognitivas del modelo base, sino reemplazar su "personalidad" de asistente por una voz conversacional unica: un registro coloquial, en minusculas, sin emojis, sin listas numeradas y sin la tendencia compulsiva a validar o animar al usuario que caracteriza al Gemma original. El modelo conserva la arquitectura y el conocimiento del base, pero modifica el estilo de respuesta.

El modelo tiene 7.463.013.674 parametros totales (dato de safetensors) y se distribuye como cuantizaciones GGUF de un modelo base de tipo E4B. El autor recomienda encarecidamente ejecutar la version f16 (unos 15 GB) y advierte que cuantizaciones por debajo de Q8_0 degradan precisamente el rasgo que el fine-tune pretende introducir. La licencia es la Gemma de Google y el unico idioma declarado es el ingles.

Es relevante ahora porque ejemplifica una categoria creciente de modelos: fine-tunes de personalidad sobre bases instruct, orientados a compania conversacional, escritura creativa y personajes, en lugar de a tareas de razonamiento o codigo. Su model card documenta explicitamente el proceso (9.300 pares de conversacion de una sola voz humana, sin datos sinteticos) y publica resultados de benchmarks con muestras pequenas, lo que permite evaluar con transparencia sus limites.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it); detalles de capas y atencion no disponibles |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el autor menciona f16 y Q8_0 como minimo recomendado; el resto de niveles no se detalla |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | GGUF (repo de 89,8 GB, con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer instruct de la familia Gemma 4 con 7.463.013.674 parametros totales. No se dispone de informacion sobre el numero de capas, el mecanismo de atencion ni la longitud de contexto maxima del base en la informacion proporcionada. El fine-tune se realizo con Unsloth, segun las etiquetas del repositorio.

El entrenamiento uso un corpus de 9.300 pares de conversacion extraidos de una unica voz humana (el propio autor), con el autor en el rol de asistente, de modo que el modelo aprende prediciendo sus respuestas. No se emplearon datos sinteticos ni otros hablantes. El objetivo declarado es eliminar los reflejos de asistente del base: puntuacion con emojis, entusiasmo en mayusculas, planes de accion numerados y cierre obligatorio en tono positivo. No se documenta el uso de RLHF o DPO, ni el numero de tokens de entrenamiento, ni la composicion del dataset mas alla de la descripcion cualitativa. La innovacion tecnica destacable no esta en la arquitectura sino en el metodo: un corpus mono-voz y mono-registro para imponer un estilo consistente y resistente al prompt.

## Capacidades

- Generacion de texto conversacional en ingles con registro coloquial, minusculas y sin emojis.
- Escritura creativa y respuestas con humor, sarcasmo y lenguaje malsonante cuando el contexto lo permite.
- Coherencia de personaje a lo largo de conversaciones multi-turno, con menor tendencia a la validacion y al tono animico que el base.
- Razonamiento basico y tareas de conocimiento general heredadas del modelo base (ver benchmarks: 71% en BIG-Bench Hard con muestra reducida).
- Capacidad de seguir un system prompt que defina el escenario (por ejemplo, un bar) sin que el modelo introduzca por si mismo detalles de esa ocupacion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Multilingue: solo ingles declarado; no hay evidencia de calidad en castellano.

## Casos de uso

- Companía conversacional: el modelo esta disenado para mantener charlas informales multi-turno con un tono humano y sin la estructura de asistente; encaja en aplicaciones de acompanamiento o chat de ocio donde la naturalidad pesa mas que la precision factual.
- Personajes de ficcion interactiva: al mantener una voz consistente y resistir la deriva hacia el tono corporativo, sirve para NPCs o chatbots de rol en videojuegos y experiencias narrativas, con un system prompt que defina el personaje.
- Escritura creativa asistida: util para generar dialogos con registro coloquial, giros humoristicos y respuestas secas; el autor lo orienta a creative-writing y el modelo evita listas y formalismos.
- Simulacion de entrevistas o conversaciones dificiles: su tendencia a la franqueza y a no validar automaticamente permite practicar conversaciones donde se busca una respuesta directa en lugar de refuerzo positivo.
- Prototipado de agentes con personalidad: como capa de generacion de respuestas en un pipeline donde otro componente gestiona herramientas, el modelo aporta el estilo; no se debe delegar en el el tool calling, que no esta documentado.
- Pruebas de evaluacion de personalidad y estilo: util como caso de estudio para medir cuanto de la "personalidad" de un modelo instruct persiste tras un fine-tune mono-voz y para comparar f16 frente a cuantizaciones.
- Despliegue local en ingles: con la version f16 (unos 15 GB) cabe en GPUs de consumo de gama alta y permite experimentar con un modelo conversacional sin depender de API.

## Benchmarks y rendimiento

Resultados publicados por el autor, con muestras pequenas y por tanto de alta varianza:

| Benchmark | Muestra | Resultado |
|---|---|---|
| MuSR | 10 items | 70% (7/10) |
| SimpleBench | set publico | 0% (0/10) |
| EQ-Bench v2 | 12 items | 73,3 / 100 |
| BIG-Bench Hard | 23 subtareas, 3 cada una | 71% (49/69) |
| Thematic Generalization | 12 items | 50% (6/12) |
| LisanBench | 8 palabras iniciales | 5,0 transiciones medias (40 totales) |
| Sudoku-Bench | 6 puzzles | 0% (0/6) |
| NYT-Connections | 12 items | no disponible (dato truncado en la informacion) |

No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 15 GB para la version f16, segun el propio autor; Q8_0 como minimo recomendado (aproximadamente 8-9 GB, estimacion a partir del tamano de parametros); cuantizaciones menores no recomendadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o superior permite f16 con holgura; A100 y H100 son adecuadas para servir varias instancias.
- GPU de consumo: si, en tarjetas con al menos 16 GB para f16 y 10-12 GB para Q8_0; no cabe en GPUs de 8 GB en f16.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners GGUF; el repositorio incluye la etiqueta endpoints_compatible. No se documenta soporte de vLLM o TGI, que requieren otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bella Bartender Gemma E4B | 7,46 B | no disponible | Fine-tune de personalidad mono-voz en ingles | Gemma | GGUF en Hugging Face |
| google/gemma-4-E4B-it | 7,46 B | no disponible | Instruct generalista de Google | Gemma | Pesos oficiales |
| Fine-tunes de rol y compania sobre bases de ~7-8 B | variable | variable | Personalidad y personajes | variable | Comunidad |

No se dispone de datos de benchmarks comparativos con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles declarado; el rendimiento en castellano no esta evaluado y probablemente sea deficiente en el registro coloquial entrenado.
- Riesgo de alucinacion: el corpus de 9.300 pares conversacionales no aporta conocimiento factual; el modelo hereda los fallos del base y ademas prioriza el estilo sobre la precision.
- Resultados muy debiles en tareas de razonamiento estructurado: 0% en SimpleBench y 0% en Sudoku-Bench con las muestras publicadas.
- La calidad depende fuertemente de la cuantizacion: el autor advierte que por debajo de Q8_0 el modelo pierde el rasgo que lo define.
- Sensible al registro del prompt: un system prompt corporativo produce respuestas corporativas; los saludos cortos estan fuera de distribucion.
- No se debe incluir la palabra "bartender" en el system prompt si se busca el comportamiento por defecto, ya que el base reacciona interpretando la ocupacion.
- Sesgos: al entrenarse con una unica voz humana, el modelo reproduce los sesgos, el humor y los limites de esa persona; no hay documentacion de mitigacion.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; conviene revisarlos antes de desplegar.
- Muestras de benchmark muy pequenas (6-23 items), insuficientes para conclusiones robustas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juiceb0xc0de/bella-bartender-gemma-e4b-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Resultados de benchmarks (dataset del autor): https://huggingface.co/datasets/juiceb0xc0de/bella-bench-results
- Unsloth: https://github.com/unslothai/unsloth
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
