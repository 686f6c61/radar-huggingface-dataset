# gszauer/Gab1B

## Resumen

Gab 1B es un modelo de lenguaje de tipo mixture-of-experts (MoE) de aproximadamente 1.000 millones de parametros, entrenado desde cero por el desarrollador independiente gszauer sobre un Mac Studio. Se trata de una evolucion directa de la arquitectura Gab 100M, en la que cada red feed-forward de cada bloque transformer se sustituye por 32 expertos con enrutamiento top-2. El resultado es un modelo con diez veces mas parametros totales, pero con un coste computacional por token practicamente identico al de su predecesor: unos 107,75 millones de parametros activos por token.

El modelo es un transformer decoder-only con pre-normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE) con pares intercalados, atencion causal, embeddings de entrada y salida atados, y una mezcla top-2 de expertos con GeLU exacta en cada bloque. La implementacion canonica es `MiniGPT.js`, una libreria JavaScript sin dependencias que incluye tensor library, autograd, tokenizer, modelo con KV cache y entrenador AdamW. El modelo habla ingles, mantiene conversaciones multi-turno y soporta una traza de razonamiento opcional `<think>` dentro de los turnos del asistente.

Su relevancia radica en dos factores: por un lado, demuestra que es viable entrenar desde cero un MoE de 1B parametros en hardware de consumo (un Mac Studio), y por otro, ofrece un runtime de navegador sin dependencias que permite ejecutar el modelo directamente en el cliente. La longitud de contexto es de 2048 tokens, el vocabulario de 20.000 tokens y la licencia es MIT, lo que facilita su uso comercial y su experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE top-2 en cada bloque |
| Parametros totales | 1.028.477.184 |
| Parametros activos | 107.752.704 por token |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos en float32; entrenado en bfloat16 mixed precision) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), gab1b.weights (float32 plano nativo), implementacion JS |

## Arquitectura y entrenamiento

Gab 1B es un transformer decoder-only de 13 bloques con dimension de caracteristica 768, 12 cabezas de atencion de dimension 64, pre-normalizacion RMSNorm con epsilon 1e-5, RoPE con theta 10.000 en pares intercalados (los canales adyacentes `(2i, 2i+1)` rotan juntos, a diferencia del RoPE split-half estilo Llama) y embeddings de entrada/salida atados (`logits = RMSNorm(h) @ E.T`, sin cabeza de salida separada). No hay tabla de embeddings posicionales: la posicion entra unicamente a traves de RoPE.

La innovacion principal es la sustitucion de la MLP de cada bloque por una mezcla de 32 expertos con enrutamiento top-2. Un router sin sesgo de forma `[768, 32]` puntua cada experto por token; el token se envia a sus dos expertos mas probables y sus salidas se suman ponderadas por las probabilidades del router renormalizadas sobre las dos opciones. Cada experto es una MLP estilo Gab 100M a media anchura (`768 -> 1536 -> 768`) con GeLU exacta (erf) y un sesgo por neurona. Dos expertos de media anchura cuestan lo mismo que la MLP unica `768 -> 3072 -> 768` de Gab 100M. La inferencia es dropless: cada token siempre llega a sus dos expertos.

La atencion se entrena por cabeza: cada una de las 12 cabezas tiene su propio `Wq`, `Wk`, `Wv` de forma `[768, 64]` y su propia proyeccion de salida `Wo` de forma `[64, 768]`; las cabezas nunca se concatenan, sino que cada una proyecta su resultado a 768 y los resultados se suman. Algebraicamente equivale a una concatenacion seguida de una gran proyeccion `[768, 768]`, por lo que `model.safetensors` incluye tensores fusionados `[768, 768]` y el port de Transformers ejecuta la formulacion estandar; las matrices por cabeza sin fusionar se conservan en `gab1b.weights`. El tokenizer es BPE a nivel de byte con aplicacion secuencial de merges: los ids 0-255 son bytes crudos y cada id posterior es un merge de dos ids anteriores aprendido en orden; los tokens reservados (`<|user|>`, `<|assistant|>`, `<|end|>`, `<|endoftext|>`, `<think>`, `</think>`, `<|pad|>`) son merges encadenados ensenados antes del entrenamiento y se codifican como un unico id atomico.

El entrenamiento se realizo desde cero sobre los datasets `gszauer/Gab100MPretrain`, `HuggingFaceTB/smollm-corpus`, `gszauer/Gab100MFinetune` y `HuggingFaceTB/smoltalk`. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO. El formato de chat no incluye rol de sistema: los turnos se concatenan directamente como `<|user|>PREGUNTA<|end|><|assistant|>RESPUESTA<|end|>`, y el razonamiento opcional vive dentro del turno del asistente con `<think>RAZONAMIENTO_PRIVADO</think>RESPUESTA`.

## Capacidades

- Generacion de texto en ingles con soporte de conversaciones multi-turno.
- Razonamiento opcional mediante traza `<think>` dentro de los turnos del asistente (modo thinking).
- Enrutamiento MoE top-2 con 32 expertos por bloque y 107,75M parametros activos por token.
- Tokenizer BPE a nivel de byte con tokens reservados atomicos para roles y delimitadores.
- Runtime de navegador sin dependencias (`MiniGPT.js`) con KV cache y autograd.
- Inferencia con KV cache en el runtime JS y en `inference.py` de la suite de entrenamiento.
- Port a Transformers con `trust_remote_code` para integracion en pipelines Python.
- No se menciona soporte de tool calling ni function calling en la informacion disponible.
- No se menciona soporte de agentes ni multi-step reasoning mas alla de la traza `<think>`.
- No se menciona soporte de vision ni audio.

## Casos de uso

- Experimentacion educativa con MoE: el modelo sirve para estudiar el comportamiento de un enrutamiento top-2 con 32 expertos por bloque en un transformer de 13 capas, cargandolo con `AutoModelForCausalLM` y analizando las probabilidades del router por token.
- Ejecucion de inferencia en el navegador: gracias a `MiniGPT.js`, el modelo puede desplegarse como demo interactiva en una pagina web sin backend, usando el runtime JS con KV cache para generar respuestas en el cliente.
- Chat conversacional ligero en ingles: con 2048 tokens de contexto y formato de turnos concatenados, es adecuado para asistentes de proposito general con historial corto, integrados via el port de Transformers.
- Prototipado de razonamiento explicito: la traza `<think>` permite experimentar con modos de razonamiento interno separados de la respuesta final, util para investigar tecnicas de chain-of-thought en modelos pequenos.
- Reproduccion de entrenamiento desde cero: la suite incluye `MiniGPT.js` con autograd y entrenador AdamW, lo que permite reproducir o modificar el pipeline de entrenamiento en JavaScript sin dependencias.
- Investigacion sobre eficiencia MoE: con 1.028M de parametros totales y solo 107,75M activos por token, es un banco de pruebas para medir el equilibrio entre capacidad total y coste computacional por token en hardware de consumo.
- Desarrollo de tokenizers BPE a nivel de byte: el esquema de merges secuenciales con tokens reservados atomicos sirve como referencia para implementar tokenizers propios en entornos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 4,1 GB solo para los pesos (1.028.477.184 parametros x 4 bytes), mas overhead de activaciones y KV cache; el repositorio ocupa 8,2 GB e incluye tanto `model.safetensors` como `gab1b.weights`.
- No se dispone de informacion sobre cuantizaciones (GGUF, int8, int4) ni sobre el impacto en VRAM de las mismas.
- GPU recomendadas: no disponible en la informacion proporcionada. El modelo fue entrenado en un Mac Studio, lo que sugiere viabilidad en hardware Apple Silicon.
- Cabe en GPUs de consumo con al menos 8 GB de VRAM en float32, segun el calculo de pesos; no se confirma en la informacion disponible.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (port Python, sin KV cache, expertos uno a uno), runtime `MiniGPT.js` en navegador (con KV cache) e `inference.py` de la suite de entrenamiento (con KV cache).
- No se dispone de datos de latencia ni throughput. El port de Transformers recomputa la secuencia completa en cada paso de generacion (sin KV cache) y ejecuta los expertos uno a uno, lo que lo hace mas lento que el runtime JS con KV cache.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| Gab 1B | 1.028.477.184 | 107.752.704 | 2048 | MIT | Ingles | Hugging Face, runtime JS |
| Gab 100M | No disponible | No disponible | No disponible | No disponible | No disponible | Hugging Face (gszauer/Gab100M) |
| Alternativas de ~1B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables de la misma categoria, por lo que la comparativa cuantitativa de rendimiento no esta disponible. El unico modelo directamente comparable documentado es Gab 100M, su predecesor, del que se sabe que comparte arquitectura base y que Gab 1B multiplica por diez sus parametros manteniendo el mismo coste computacional por token.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- La longitud de contexto es de 2048 tokens, inferior a la de modelos contemporaneos de tamano similar, lo que limita conversaciones largas y documentos extensos.
- No hay rol de sistema en el formato de chat; los turnos se concatenan directamente, lo que restringe el control del comportamiento del asistente.
- Riesgo de alucinacion inherente a un modelo de ~1B parametros entrenado desde cero con un vocabulario de 20.000 tokens; no se han publicado evaluaciones de fidelidad.
- No se han publicado resultados de benchmarks, por lo que no es posible cuantificar su rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- El port de Transformers no usa KV cache y ejecuta los expertos secuencialmente, lo que degrada la latencia en produccion frente al runtime JS.
- El modelo requiere `trust_remote_code=True` para cargarse en Transformers, lo que implica ejecutar codigo del autor del repositorio.
- No se dispone de informacion sobre sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO).
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias y sin evaluaciones de seguridad publicadas.
- El entrenamiento se realizo en un Mac Studio, lo que puede implicar limitaciones en la escala y diversidad de los datos respecto a modelos entrenados en clusters de GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gszauer/Gab1B
- Modelo predecesor Gab 100M: https://huggingface.co/gszauer/Gab100M
- Dataset de preentrenamiento: https://huggingface.co/datasets/gszauer/Gab100MPretrain
- Dataset de fine-tuning: https://huggingface.co/datasets/gszauer/Gab100MFinetune
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
