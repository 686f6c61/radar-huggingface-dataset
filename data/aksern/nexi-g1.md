# aksern/nexi-g1

## Resumen

nexi g1 es un modelo de lenguaje causal de pequeno tamano desarrollado por el usuario aksern, publicado en HuggingFace bajo el identificador `aksern/nexi-g1`. Se trata de un transformer decoder-only de estilo GPT con 30.339.456 parametros reales (segun los pesos en safetensors), entrenado exclusivamente con objetivo de prediccion del siguiente token. No ha pasado por fases de instruction tuning, RLHF ni DPO, por lo que su unica tarea prevista es la continuacion de texto, no el dialogo conversacional.

El modelo se presenta como la primera pieza de la familia "nexi" (la designacion g1 corresponde a "generation 1") y esta planteado como banco de pruebas para experimentos de preentrenamiento a pequena escala, mas que como herramienta de produccion. Su corpus de entrenamiento mezcla Wikipedia, resenas de IMDb, un subconjunto de FineWeb orientado a marketing y un dataset derivado del foro 4chan /pol/, lo que condiciona fuertemente tanto su estilo de salida como sus sesgos.

Su relevancia actual es limitada y de caracter educativo: sirve para estudiar como se comporta un modelo diminuto tras solo tres epocas de preentrenamiento, ilustrando de forma muy visible fenomenos como el sobreajuste, la repeticion en bucle y el arrastre de estilo enciclopedico. No compite con modelos frontera ni con alternativas pequenas ya consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only de estilo GPT |
| Parametros totales | 30.339.456 (~30,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Objetivo de entrenamiento | Prediccion del siguiente token (causal language modeling) |
| Fases de entrenamiento | Solo preentrenamiento (sin instruction tuning, RLHF ni DPO) |
| Epocas | 3 |
| Pasos de entrenamiento | 145.254 |
| Tiempo de entrenamiento reportado | ~76,5 minutos |
| Perdida final de entrenamiento | 0,565 |
| Perdida final de evaluacion | 3,739 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only estandar de la familia GPT, sin variantes hibridas, mecanismos de atencion lineal ni mezclas de expertos. Con 30,3 millones de parametros se situa en el rango de los modelos "tiny" orientados a experimentacion. El autor no documenta el numero de capas, dimensiones de embedding, numero de cabezas de atencion ni la longitud de contexto soportada, por lo que esos datos quedan como no disponibles. El modelo se distribuye unicamente en safetensors y se carga con `AutoModelForCausalLM` de HuggingFace Transformers.

El preentrenamiento se realizo durante 3 epocas sobre una mezcla de cuatro fuentes: `wikimedia/wikipedia`, `stanfordnlp/imdb`, `marketeam/FineWeb-Marketing` y `fuzzy-g/4chan_pol_whole_ds`. No se documenta el numero total de tokens, la composicion porcentual de cada dataset ni la configuracion de preprocesado, que segun el propio autor "puede variar entre experimentos". La divergencia entre la perdida de entrenamiento (0,565) y la de evaluacion (3,739) es muy grande y el autor la reconoce explicitamente como evidencia de sobreajuste sustancial a la distribucion de entrenamiento. No hay innovaciones tecnicas destacables: no se emplea decodificacion especulativa, atencion optimizada ni ninguna fase de alineacion posterior.

## Capacidades

- Generacion de texto por continuacion: completa fragmentos dados a partir de los patrones aprendidos, sin interpretar la entrada como una instruccion.
- Modelado de lenguaje causal a pequena escala, util para estudiar dinamicas de preentrenamiento.
- Reproduccion de estructuras de estilo enciclopedico (encabezados, listas, referencias, frases de articulo) heredadas de Wikipedia.
- Reproduccion de registros textuales propios de resenas de cine y de foros de discusion, heredados del resto del corpus.
- Generacion de texto en ingles exclusivamente.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No sigue instrucciones ni mantiene conversaciones multi-turno de forma fiable.

## Casos de uso

- Docencia sobre modelado de lenguaje: permite ilustrar en una sola sesion de entrenamiento de poco mas de una hora como un transformer diminuto aprende a continuar texto y por que sobreajusta, comparando la perdida de entrenamiento (0,565) con la de evaluacion (3,739).
- Experimentos de continuacion de texto controlada: dado un comienzo de frase en ingles, el modelo genera una continuacion ajustando `temperature`, `top_p` y `top_k`; es util para estudiar como varian las salidas con los parametros de muestreo en modelos pequenos.
- Estudio de contaminacion estilistica entre dominios: al mezclar Wikipedia, IMDb, FineWeb-Marketing y 4chan /pol/, el modelo permite analizar como un corpus heterogeneo se refleja en el registro de las generaciones.
- Analisis de sesgos y toxicidad en corpus no filtrados: la inclusion de un dataset derivado de 4chan /pol/ lo convierte en un caso practico para medir como patrones indeseables del corpus se propagan a las salidas de un modelo sin alineacion.
- Pruebas de infraestructura y pipelines de inferencia: con 30,3 M de parametros y un repositorio de 0,1 GB, sirve como modelo de humo para validar despliegues con llama.cpp, Ollama o transformers antes de pasar a modelos mayores.
- Investigacion sobre repeticion y bucles degenerativos: la propia model card senala la repeticion como limitacion conocida, lo que lo hace adecuado como sujeto de estudio de estrategias de penalizacion de repeticion y decodificacion.
- Base para ablaciones de preentrenamiento a pequena escala: al ser la primera generacion de la familia nexi, es el punto de referencia contra el que el autor puede comparar futuras configuraciones de datos y arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento (perdida de entrenamiento 0,565 y perdida de evaluacion 3,739 tras 3 epocas y 145.254 pasos) y no incluye MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 121 MB solo para los pesos, mas overhead de activaciones y del runtime de PyTorch.
- VRAM estimada en fp16/bf16: aproximadamente 61 MB para los pesos.
- VRAM estimada en int8: aproximadamente 30 MB; en int4, aproximadamente 15 MB (cuantizacion no distribuida oficialmente, requeriria conversion propia).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo tambien se ejecuta en CPU sin dificultad. No requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas y en Raspberry Pi.
- Opciones de despliegue: HuggingFace Transformers (via `AutoModelForCausalLM`) es la via documentada por el autor; llama.cpp, Ollama y TGI serian viables tecnicamente pero no estan documentados ni se distribuyen artefactos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nexi g1 (aksern) | 30,3 M | no disponible | openmdw-1.1 | Solo preentrenamiento, sin alineacion; sobreajuste documentado |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Modified MIT | Referencia historica de la familia GPT-2; mas de 4 veces mayor |
| Pythia-70M (EleutherAI) | 70 M | 2048 tokens | Apache 2.0 | Suite disenada para interpretabilidad, con checkpoints intermedios |
| TinyStories-33M (Eldan y Li) | 33 M | 1024 tokens (GPT-Neo) | MIT | Entrenado en corpus sintetico de cuentos; buena coherencia en su dominio |

La comparativa se basa en especificaciones publicas ampliamente conocidas de esos modelos; no se dispone de resultados de benchmarks de nexi g1 que permitan una comparacion cuantitativa de rendimiento. En terminos de tamano, nexi g1 es el segundo mas pequeno de la tabla, solo por encima de TinyStories-33M en orden de magnitud equivalente.

## Limitaciones y advertencias

- Sobreajuste severo: la diferencia entre perdida de entrenamiento (0,565) y de evaluacion (3,739) indica que el modelo memoriza la distribucion de entrenamiento y generaliza mal.
- Repeticion y bucles de generacion: reconocido explicitamente por el autor incluso con parametros de muestreo habituales.
- Coherencia a larga distancia muy debil, con deriva tematica frecuente.
- Conocimiento factual inconsistente: el texto generado no debe considerarse veraz ni fiable.
- Seguimiento de instrucciones practicamente nulo: no es un chatbot ni un asistente, y no responde a preguntas como tales.
- Sensibilidad alta a la formulacion del prompt y a los parametros de muestreo (`temperature`, `top_p`, `top_k`).
- Sesgos heredados del corpus: incluye un dataset derivado del foro 4chan /pol/, ademas de Wikipedia, IMDb y FineWeb-Marketing, por lo que puede reproducir lenguaje toxico, sesgado o desinformativo. Sin filtrado ni alineacion de seguridad.
- Sesgo de estilo enciclopedico: al dominar Wikipedia en el corpus, tiende a responder con estructuras de articulo (encabezados, listas, referencias) incluso ante entradas que no lo requieren.
- Idioma: solo ingles. No hay soporte multilingue documentado ni evaluado.
- Licencia openmdw-1.1: se trata de una licencia de pesos abiertos poco extendida; conviene revisar sus terminos exactos antes de cualquier uso comercial, ya que la model card no detalla obligaciones de atribucion ni restricciones adicionales.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni evaluaciones de terceros.
- Longitud de contexto no documentada: impide planificar aplicaciones que dependan de ventanas largas.
- Uso en produccion desaconsejado: el propio autor lo plantea como base experimental para futuras generaciones de la familia nexi.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aksern/nexi-g1
- PyTorch: https://pytorch.org/
- Documentacion de HuggingFace Transformers: https://huggingface.co/docs/transformers
- Documentacion de HuggingFace Hub: https://huggingface.co/docs/hub
- Dataset Wikimedia Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Stanford NLP IMDb: https://huggingface.co/datasets/stanfordnlp/imdb
- Dataset MarketTeam FineWeb-Marketing: https://huggingface.co/datasets/marketeam/FineWeb-Marketing
- Dataset fuzzy-g/4chan_pol_whole_ds: https://huggingface.co/datasets/fuzzy-g/4chan_pol_whole_ds

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo nexi g1 ni sobre su autor; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
