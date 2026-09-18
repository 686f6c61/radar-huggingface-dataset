# coderian/TinyGPT

## Resumen

TinyGPT es un modelo de lenguaje causal de pequeno tamano publicado por el usuario coderian en Hugging Face. Se trata de un transformer decoder-only de arquitectura propia, entrenado desde cero segun la propia model card, con 28.974.161 parametros (aproximadamente 29 millones) y una longitud de contexto de solo 128 tokens. Utiliza el tokenizador BPE de GPT-2 con un vocabulario de 50.257 tokens y pesos en fp32 que ocupan unos 116 MB, por lo que la inferencia es viable tanto en GPU de gama baja como en CPU.

El modelo se ha entrenado con las primeras 50.000 historias del dataset TinyStories, un corpus de relatos infantiles sinteticos en ingles disenado para estudiar el aprendizaje de lenguaje a escala reducida. Su objetivo no es competir con modelos de proposito general, sino servir como pieza didactica y de experimentacion: implementa los componentes clasicos de un GPT (embeddings de token y posicion, atencion causal multi-cabeza, Pre-LayerNorm, FFN con activacion GELU y cabeza de lenguaje) en una escala que cabe en cualquier equipo.

Su relevancia actual es limitada en terminos de capacidades, pero resulta util como banco de pruebas para pipelines de transformers con codigo personalizado (`trust_remote_code=True`), para validar flujos de generacion de texto y para experimentar con entrenamiento desde cero a coste casi nulo. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y los metadatos indican fechas de creacion y actualizacion en septiembre de 2026, dato que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (implementacion propia, estilo GPT-2) |
| Parametros totales | 28.974.161 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (`max_seq_len`) |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados; los pesos se publican en fp32 y se pueden cargar en bf16 o fp16 mediante `torch_dtype` |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, ~116 MB) |
| Tokenizador | GPT-2 BPE, vocab = 50.257 |
| Numero de capas | 4 |
| Dimension del modelo (`d_model`) | 256 |
| Cabezas de atencion | No disponible en la informacion proporcionada |
| Dimension del FFN | 1.024 (expansion x4) |
| Normalizacion | Pre-LayerNorm + LayerNorm final |
| Activacion | GELU |
| Tamano del repositorio | 0,1 GB |
| Requiere codigo remoto | Si (`trust_remote_code=True`) |
| Modelo base declarado en el Hub | `openai-community/gpt2` (tag `base_model:finetune`), en contradiccion con la model card, que afirma entrenamiento desde cero |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

TinyGPT es un transformer decoder-only con atencion causal enmascarada y conexiones residuales. El flujo es el clasico: se suman los embeddings de token (`50257 x 256`) y de posicion (`128 x 256`), el resultado atraviesa 4 bloques transformer y termina en una LayerNorm final seguida de una cabeza lineal que proyecta de 256 a 50.257 dimensiones. Cada bloque aplica Pre-LayerNorm antes de la auto-atencion y antes del FFN, con residual add despues de cada subcapa (`x = x + attention(ln1(x))`, `x = x + ffn(ln2(x))`). La atencion calcula Q, K y V con matrices de `256 x 256`, escala los productos punto por `1/sqrt(d)` y enmascara el triangulo superior con `-inf` antes del softmax para impedir que una posicion atienda al futuro. El FFN es una red de dos capas con activacion GELU y factor de expansion x4 (`256 -> 1024 -> 256`). La inicializacion de embeddings y capas lineales sigue una normal `N(0, 0.02)`.

El entrenamiento se realizo sobre las primeras 50.000 historias del dataset TinyStories, en ingles, con el objetivo de modelado de lenguaje estandar (`CrossEntropyLoss` sobre los logits desplazados a la derecha). No se menciona en la informacion disponible el numero total de tokens procesados, el numero de pasos, el tamano de batch, la tasa de aprendizaje, ni si hubo fases posteriores de ajuste (RLHF, DPO, SFT con instrucciones). Tampoco se documenta ninguna innovacion tecnica adicional: no hay atencion lineal, decodificacion especulativa, atencion por ventanas ni variantes híbridas. La unica particularidad reseñable es que el modelo carga su codigo fuente (`models/`, con `config`, `tinygpt`, `transformer_block` y `attention`) desde el propio repositorio en tiempo de ejecucion.

Cabe senalar una inconsistencia en los metadatos: la model card afirma que el modelo esta "trained-from-scratch", mientras que las etiquetas del Hub lo marcan como `base_model:openai-community/gpt2` y `base_model:finetune:openai-community/gpt2`, lo que sugiere una posible inicializacion o derivacion a partir de GPT-2 small. La informacion proporcionada no permite resolver la discrepancia.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, con tecnicas de muestreo estandar (temperatura, top-k, top-p) soportadas por `generate()`.
- Continuacion de relatos cortos y sencillos: es el escenario para el que fue entrenado, con aperturas de historia simples.
- Generacion de texto sobre vocabulario infantil y estructuras narrativas basicas (personajes, acciones cotidianas, desenlaces simples).
- Compatibilidad con el ecosistema `transformers` mediante `AutoTokenizer` y `AutoModelForCausalLM` con `trust_remote_code=True`.
- Carga en precision reducida (bf16 o fp16) y colocacion automatica en dispositivo (`device_map="auto"`).
- Ejecucion en CPU sin requisitos de GPU, dado su tamano (~116 MB en fp32).
- No dispone de modo de razonamiento explicito (thinking mode).
- No soporta tool calling ni function calling.
- No tiene capacidades de agente ni de razonamiento multi-paso.
- No es multilingue: solo ingles.
- No tiene vision, audio ni modalidad adicional.
- No esta ajustado con instrucciones (no hay formato de chat ni plantilla de dialogo en la informacion disponible).

## Casos de uso

- Pruebas de humo en pipelines de generacion: por su tamano minimo y su carga rapida, sirve para verificar que un servicio de inferencia, un contenedor o una integracion con `transformers` funciona antes de desplegar un modelo mayor.
- Material didactico para ensenar arquitecturas transformer: el repositorio incluye el codigo de atencion, bloques y configuracion, lo que permite recorrer la implementacion completa de un GPT de 4 capas con 29 millones de parametros.
- Experimentacion con entrenamiento desde cero en equipos modestos: al haberse entrenado sobre TinyStories, es un punto de partida reproducible para estudiar curvas de perdida, tokenizacion y ajustes de hiperparametros en un presupuesto de computo minimo.
- Generacion de datos sinteticos simples en ingles: se pueden producir grandes volumenes de micro-relatos infantiles para aumentar datasets de pruebas, siempre que se revise y filtre la calidad del resultado.
- Prototipado de aplicaciones narrativas embebidas: juguetes conectados, demos interactivas o instalaciones con recursos muy limitados pueden generar continuaciones de texto de forma local sin depender de APIs externas.
- Validacion de flujos de codigo personalizado: es un caso practico para probar el mecanismo `trust_remote_code` de Hugging Face y entender sus implicaciones de seguridad en un entorno controlado.
- Pruebas de compatibilidad de tokenizadores: al emplear el tokenizador BPE de GPT-2, permite verificar tokenizacion, decodificacion y manejo de tokens especiales en pipelines propios.
- Benchmarking interno de infraestructura: sirve para medir latencia de arranque, tiempo de carga de pesos y overhead del runtime sin que el modelo sea el cuello de botella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo (los resultados obtenidos corresponden a contenido no relacionado sobre sistemas operativos y no aportan datos tecnicos).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 116 MB con pesos en fp32; en torno a 58 MB cargando en bf16 o fp16; el cache KV para 128 tokens de contexto y 4 capas es practicamente despreciable.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 queda enormemente sobredimensionada para este modelo. Incluso GPU integradas o antiguas pueden ejecutarlo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con al menos unos cientos de MB libres, y tambien en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True` es la via soportada y documentada. No se incluyen pesos en formato GGUF, por lo que llama.cpp u Ollama no funcionan sin una conversion previa. No hay soporte oficial declarado para vLLM o TGI, y el uso de codigo personalizado puede impedir su integracion directa. La exportacion a ONNX u otros formatos requeriria trabajo adicional no documentado.
- Latencia y throughput: no hay mediciones publicadas. Como estimacion no verificada, un modelo de 29 millones de parametros en fp32 deberia generar decenas de tokens por segundo en una CPU moderna y varios cientos por segundo en una GPU dedicada, pero estas cifras no estan respaldadas por ninguna prueba del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| coderian/TinyGPT | 28,97 M | 128 tokens | Primeras 50.000 historias de TinyStories | MIT | safetensors fp32, codigo personalizado (`trust_remote_code`) |
| GPT-2 small (`openai-community/gpt2`) | 124 M | 1.024 tokens | WebText (corpus web de enlaces salientes de Reddit) | MIT | safetensors, soporte nativo en `transformers` |
| Familia TinyStories (p. ej. `roneneldan/TinyStories-33M`) | 1 M - 33 M segun variante | 1.024 tokens (segun configuracion publicada) | Dataset TinyStories completo | MIT | safetensors, arquitectura GPT-Neo |
| SmolLM-135M | 135 M | 2.048 tokens | Corpus de entrenamiento propio de Hugging Face (FineWeb-Edu y otros) | Apache 2.0 | safetensors, GGUF y cuantizaciones disponibles |

Nota: los datos de los modelos alternativos provienen de informacion publica de sus respectivos repositorios y no han podido verificarse en la informacion proporcionada para esta ficha; no se incluyen cifras de rendimiento porque no hay benchmarks publicados de TinyGPT con los que comparar.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado con datos en castellano ni en ningun otro idioma, por lo que su salida en otros idiomas sera incoherente.
- Contexto muy corto: 128 tokens limitan cualquier conversacion o documento a unas pocas frases; no admite dialogos multi-turno reales ni resumen de textos largos.
- Dominio muy restringido: entrenado unicamente con las primeras 50.000 historias de TinyStories, por lo que fuera de relatos infantiles simples su comportamiento degrada rapidamente.
- Sin ajuste por instrucciones ni alineacion: no hay RLHF, DPO ni SFT de instrucciones documentados; no responde a ordenes, no sigue formatos y no rechaza peticiones problematicas.
- Riesgo alto de alucinacion y de degeneracion: al ser un modelo de 29 millones de parametros, es esperable que produzca incoherencias, repeticiones y continuaciones sin sentido, especialmente con prompts alejados del dominio de entrenamiento.
- Riesgo de sesgos: el corpus TinyStories es sintetico y de tematica infantil, pero no se ha documentado ningun analisis de sesgos ni de seguridad.
- Dependencia de codigo remoto: cargar el modelo exige `trust_remote_code=True`, lo que implica ejecutar codigo Python publicado en el repositorio; conviene auditar los ficheros de `models/` antes de usarlo en entornos de produccion.
- Inconsistencia de metadatos: la model card indica entrenamiento desde cero mientras las etiquetas del Hub apuntan a GPT-2 como modelo base y como ajuste; esto afecta a la trazabilidad del modelo.
- Licencia del dataset no especificada: aunque el modelo se publica bajo MIT, la informacion proporcionada no detalla la licencia del dataset TinyStories, aspecto a verificar antes de un uso comercial.
- Adopcion nula: 0 descargas y 1 like en el momento de la consulta, sin issues, validaciones externas ni reproducciones independientes conocidas.
- Sin benchmarks: no hay ninguna metrica publicada que permita estimar su calidad objetivamente.
- Fechas de metadatos anomales: la creacion y actualizacion figuran como septiembre de 2026, lo que sugiere un error de metadata o un reloj mal configurado en el momento de la publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coderian/TinyGPT
- Dataset TinyStories (utilizado para el entrenamiento): https://huggingface.co/datasets/roneneldan/TinyStories
- Modelo base declarado en el Hub: https://huggingface.co/openai-community/gpt2
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
