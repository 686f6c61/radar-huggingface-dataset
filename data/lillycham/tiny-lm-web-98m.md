# lillycham/tiny-lm-web-98m

## Resumen

tiny-lm-web-98m es un modelo de lenguaje de 98,4 millones de parametros con arquitectura GPT-2 small, entrenado desde cero sobre texto web por la desarrolladora independiente lillycham. Forma parte de la Parte 3 del proyecto educativo [tiny-lm](https://github.com/lillycham/tiny-lm), cuyo objetivo es construir un modelo paso a paso y analizar su funcionamiento interno. No es un modelo orientado a produccion, sino una pieza didactica que reproduce fielmente la escala y la forma de GPT-2 small.

El modelo base se entreno con 2.700 millones de tokens de FineWeb-Edu durante 203 minutos en una unica RTX 5090, alcanzando una perdida de validacion de 2,983 nats por token (1,03 bits por caracter), ligeramente por debajo de los 1,04 bits por caracter que obtiene GPT-2 small de OpenAI sobre el mismo texto. El repositorio incluye ademas una variante `chat/` obtenida tras un anneal de 150 millones de tokens (25 % SimpleStories), un ajuste supervisado sobre Dolly 15k y un ajuste final sobre lineas `System:`.

Su relevancia es doble: por un lado, demuestra que es posible entrenar un GPT-2 small competitivo en una sola GPU consumer en poco mas de tres horas; por otro, sirve como banco de pruebas reproducible para estudiar tokenizacion, atencion y comportamiento de modelos pequenos. La model card advierte explicitamente de que el texto es fluido pero la mayoria de los hechos son inventados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 small (12 capas, ancho 768, 12 cabezas) |
| Parametros totales | 98.425.344 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `GPT2LMHeadModel` de transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la misma forma que GPT-2 small: 12 capas, dimension oculta de 768 y 12 cabezas de atencion. Una diferencia tecnica concreta respecto al GPT-2 original es que los sesgos de las proyecciones q, k y v estan a cero, porque el modelo se entreno sin ellos; los pesos cargan igualmente en un `GPT2LMHeadModel` estandar. El tokenizador es un BPE a nivel de byte con 16.384 tokens, entrenado especificamente sobre FineWeb-Edu, es decir, la mitad del vocabulario de GPT-2 (50.257 tokens).

El entrenamiento del modelo base consumio 2.700 millones de tokens de FineWeb-Edu. La variante de chat se construyo en tres fases: un anneal de 150 millones de tokens con un 25 % de SimpleStories, un ajuste supervisado sobre Dolly 15k y un ajuste final sobre lineas `System:` que ensenan al modelo a obedecer instrucciones sencillas (por ejemplo, "Answer in one sentence") y a manejar nombres del modelo y del usuario. La model card no documenta uso de RLHF ni de DPO, ni tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles con continuacion coherente de prompts, gracias a la perdida de validacion de 1,03 bits por caracter.
- Dialogo basico en la variante `chat/`, con formato `System:` / `User:` / `Assistant:` y cierre de respuesta con `<|endoftext|>`.
- Seguimiento de instrucciones de forma muy limitada: responde en el formato pedido (lista, verso, una sola linea) aunque el contenido factual sea escaso.
- Capacidad multilingue practicamente nula: solo ingles.
- No dispone de tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No tiene vision, audio, modo thinking ni capacidades multimodales.
- No realiza extraccion de respuestas a partir de un parrafo del contexto (limitacion declarada por el autor).

## Casos de uso

- Docencia y cursos de LLM: el modelo permite recorrer el ciclo completo de entrenamiento (tokenizador, pretraining, anneal, SFT) en una sola GPU consumer, lo que lo hace idoneo para asignaturas de aprendizaje automatico.
- Analisis de interpretabilidad: al ser un GPT-2 small reproducible con pesos abiertos y entrenamiento documentado, sirve para estudiar atencion, activaciones y circuitos internos con un coste computacional minimo.
- Experimentos de tokenizacion: su vocabulario BPE de 16.384 tokens entrenado sobre FineWeb-Edu permite comparar el efecto del tamano de vocabulario frente a GPT-2 en tareas controladas.
- Prototipado rapido de pipelines de generacion de texto: con 98 M de parametros se puede desplegar en CPU o en GPUs de gama baja para validar integraciones con transformers o text-generation-inference antes de pasar a modelos mayores.
- Generacion de texto creativo sin requisitos de veracidad: relatos breves, continuaciones de ficcion o ejercicios de estilo donde la fluidez importa mas que la exactitud factual.
- Investigacion sobre alucinacion en modelos pequenos: la model card reconoce que la mayoria de los hechos son inventados, lo que lo convierte en un caso de estudio controlado sobre como escala la alucinacion con el tamano y los datos.
- Base para fine-tuning educativo: la variante chat y el formato `System:` documentado permiten experimentar con SFT sobre datasets pequenos (Dolly 15k) y medir el efecto en un modelo de bolsillo.

## Benchmarks y rendimiento

| Metrica | tiny-lm-web-98m | GPT-2 small (referencia del autor) |
|---|---|---|
| Perdida de validacion (nats/token) | 2,983 | no disponible |
| Bits por caracter | 1,03 | 1,04 |
| Tokens de entrenamiento | 2,70 B | no disponible |
| Tiempo de entrenamiento | 203 min en 1x RTX 5090 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica comparacion cuantitativa documentada es la de bits por caracter frente a GPT-2 small sobre el mismo texto.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,4 GB de pesos (98,4 M x 4 bytes); en fp16/bf16, unos 0,2 GB; en int8, unos 0,1 GB. El repo ocupa 0,8 GB, lo que sugiere pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente. Una RTX 4090, A100 o H100 estan sobradamente dimensionadas; el modelo se entreno en una RTX 5090 en 203 minutos.
- Cabe en cualquier GPU consumer, incluidas GTX 1650, RTX 3050 o incluso iGPUs con suficiente memoria compartida. Tambien es viable en CPU.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), text-generation-inference (tag `text-generation-inference`), llama.cpp/Ollama si se convierte a GGUF (no se publican pesos GGUF en el repo), y endpoints compatibles.
- Latencia y throughput: no se han publicado mediciones de latencia ni throughput en la informacion disponible. Por tamano, se espera inferencia en tiempo real en CPU y muy alta velocidad en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tiny-lm-web-98m | 98,4 M | 1.024 | MIT | Hugging Face (safetensors) | Entrenado desde cero en 2,70 B tokens; vocabulario de 16.384 tokens |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Hugging Face | Referencia historica; 1,04 bits por caracter segun el autor |
| SmolLM-135M (Hugging Face) | 135 M | 2.048 | Apache 2.0 | Hugging Face | Entrenado con muchos mas tokens; contexto el doble |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Hugging Face | Un orden de magnitud mayor; no es comparable en coste |

La comparativa se limita a datos publicos basicos; no se dispone de resultados de benchmarks comunes que permitan una comparacion cuantitativa rigurosa entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion factual elevada: el autor indica explicitamente que "la mayoria de los hechos son inventados" y desaconseja su uso para cualquier tarea que requiera respuestas verdaderas.
- No extrae respuestas de parrafos del contexto, lo que limita tareas de comprension lectora y QA extractivo.
- Contexto muy corto (1.024 tokens) para los estandares actuales; insuficiente para conversaciones multi-turno largas o documentos extensos.
- Solo ingles; sin soporte multilingue.
- Capacidad de seguimiento de instrucciones muy limitada incluso en la variante chat: respeta el formato pero no garantiza el contenido.
- Sesgos potenciales heredados de FineWeb-Edu, SimpleStories y Dolly 15k; no se documenta ninguna evaluacion de sesgo.
- Licencia MIT para codigo y pesos, lo que permite uso comercial, pero las licencias de los datasets de entrenamiento (ODC-By, MIT, CC BY-SA 3.0) pueden imponer obligaciones adicionales sobre datos derivados.
- No apto para produccion en tareas sensibles: es un modelo educativo, no un asistente fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lillycham/tiny-lm-web-98m
- Repositorio del proyecto tiny-lm: https://github.com/lillycham/tiny-lm
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SimpleStories: https://huggingface.co/datasets/SimpleStories/SimpleStories
- Dataset Dolly 15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
