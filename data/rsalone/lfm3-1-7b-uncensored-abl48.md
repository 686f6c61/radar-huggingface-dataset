# rSalone/LFM3-1.7B-uncensored-abl48

## Resumen

LFM3-1.7B-uncensored-abl48 es una version "abliterada" del modelo LiquidAI/LFM3-1.7B, un modelo de lenguaje de 1.730 millones de parametros desarrollado originalmente por Liquid AI. La modificacion, realizada por el usuario rSalone, elimina la direccion de rechazo (refusal direction) del modelo base mediante una tecnica de abliteration aplicada en los 48 puntos donde el modelo escribe en el flujo residual (24 capas x 2). El objetivo es obtener un modelo que responda a practicamente cualquier prompt sin negarse, manteniendo en lo posible las capacidades originales de razonamiento y matematicas.

El modelo conserva la arquitectura del LFM3 original, que incluye un modo de "pensamiento" (thinking) previo a la respuesta. La innovacion principal de esta ficha no esta en la arquitectura sino en la metodologia de abliteration: el autor compara direcciones de rechazo medidas en el prompt, en el pensamiento y en la respuesta, y concluye que medir la media sobre todos los tokens del prompt y eliminar la direccion en los 48 puntos produce la mayor tasa de respuestas sin rechazo (187 de 200 en HarmBench) con una degradacion minima en GSM8K (98/100) y GPQA Diamond (95/198).

Es relevante ahora porque demuestra que la abliteration bien calibrada puede eliminar rechazos de forma casi completa en modelos pequenos con modo thinking, un caso que hasta ahora presentaba dificultades por la presencia de deliberacion interna. El modelo se distribuye en safetensors BF16 y GGUF (BF16 y Q4_K_M), y esta pensado para experimentacion e investigacion sobre alineamiento y seguridad, no para uso comercial sin revisar la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3, con modo thinking), heredada de LiquidAI/LFM3-1.7B |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 32768`) |
| Tipos de cuantizacion | BF16 (safetensors y GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (los prompts de evaluacion fueron solo en ingles) |
| Licencia | lfm-open-license-v1.0 (license: other) |
| Formato de pesos | safetensors (BF16), GGUF (BF16 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 1.730 millones de parametros con capacidad de razonamiento explicito (thinking) antes de emitir la respuesta. La modificacion aplicada es una abliteration: se mide una direccion de rechazo y se resta de los pesos del modelo. Segun la model card, LFM3-1.7B escribe en el flujo residual en 48 puntos (24 capas x 2). La version abl48 elimina la direccion en los 48 puntos, mientras que la version abl38 solo en los 38 puntos cuyas activaciones separan prompts censurados de prompts ordinarios (precision leave-one-out >= 95%, d' >= 3).

El autor describe un proceso de calibracion en dos fases. Primero, una seleccion con 10 prompts censurados midiendo direcciones en 11 posiciones (prompt, pensamiento y respuesta). Las direcciones medidas en el prompt respondieron los 10 prompts, mientras que las medidas en el pensamiento o la respuesta dependian de la posicion (el final del pensamiento respondio 3 y 2; la mitad de la respuesta, 6 y 0). Despues, una prueba principal con 8 versiones (2 posiciones de prompt x 2 de pensamiento, cada una con eliminacion en 48 puntos o solo en los relacionados) evaluada en HarmBench, GSM8K y GPQA Diamond. Las versiones medidas en el prompt respondieron 175-185 de 200 en HarmBench frente a 158-172 de las medidas en el pensamiento. Se liberaron las dos versiones medidas como media sobre el prompt. Para escribir la edicion en los pesos, el autor compensa la RMSNorm posterior: en lugar de restar gamma⊙r de la matriz de salida W (KL 0.0053 para abl48), divide gamma y aplica W' = W - b(a^T W) con a = gamma⊙r y b = r/gamma (escalado para que a^T b = 1), reduciendo la KL a 0.0013 (abl48) y 0.0007 (abl38). La KL respecto al original es 0.0112 (abl48) y 0.0083 (abl38). No se modificaron otros pesos.

No se dispone de informacion sobre el dataset de entrenamiento original del modelo base (numero de tokens, composicion, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento con modo thinking: el modelo delibera antes de responder, lo que el autor aprovecha para medir direcciones de rechazo dentro del pensamiento.
- Razonamiento matematico: mantiene GSM8K en 98/100 tras la abliteration, identico al original.
- Razonamiento cientifico de nivel avanzado: GPQA Diamond 95/198 (frente a 99/198 del original).
- Respuesta sin rechazo: 187 de 200 prompts de HarmBench respondidos sin negativa, frente a 21 del original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la evaluacion se hizo solo con prompts en ingles.
- Capacidades especiales: modo thinking confirmado; vision y audio no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se distribuye la direccion de rechazo en un transformer con modo thinking y comparar abl48 frente a abl38, ya que ambas versiones se publican con la misma metodologia y permiten analizar el efecto de eliminar la direccion en 48 versus 38 puntos.
- Evaluacion de robustez de clasificadores de seguridad: al responder 187 de 200 prompts de HarmBench sin rechazo, sirve como caso de prueba para medir la tasa de deteccion de clasificadores externos y para calibrar filtros de entrada/salida en pipelines de moderacion.
- Generacion de texto creativo sin restricciones: el modelo puede producir narrativa, dialogos o guiones sobre temas que el modelo base rechazaria, manteniendo el modo thinking para coherencia argumental en textos largos.
- Despliegue local en hardware de consumo: con el GGUF Q4_K_M de 1,10 GB corre a unos 275 tok/s en una RTX 5070 Ti (16 GB) mediante llama.cpp, lo que lo hace adecuado para prototipado rapido en estaciones de trabajo sin GPU de datacenter.
- Experimentacion con decodificacion y sampling: las instrucciones del autor fijan temperatura 0,1, top-k 50 y repetition penalty 1,1; sirve para estudiar como el sampling interactua con la eliminacion de la direccion de rechazo en modelos pequenos.
- Analisis de degradacion por abliteration: comparar GSM8K (98 vs 98) y GPQA Diamond (95 vs 99) entre original y abl48 permite cuantificar el coste de la edicion en tareas de razonamiento y usar el modelo como referencia en estudios de poda de direcciones.
- Fine-tuning posterior sobre dominios especificos: al ser un modelo de 1,7B en safetensors BF16 (3,46 GB), se puede reentrenar o ajustar con LoRA en una sola GPU consumer para tareas verticales donde se requiera ausencia de rechazos.

## Benchmarks y rendimiento

Resultados publicados en la model card. Cada benchmark se ejecuto una sola vez; BF16 GGUF en llama.cpp con thinking activado.

| Benchmark | Original | abl48 (este modelo) | Notas |
|---|---|---|---|
| HarmBench (respondidos sin rechazo, de 200) | 21 | 187 | Etiquetado con un Qwen3.8-Flash-Next local, no el clasificador oficial; prompts solo en ingles |
| GSM8K (correctos, de 100) | 98 | 98 | Sin degradacion |
| GPQA Diamond (correctos, de 198) | 99 | 95 | Hasta 8.192 tokens; unas 50 preguntas truncadas y contadas como incorrectas |

Datos adicionales de la prueba principal (8 versiones, transformers BF16, 1 ejecucion): las versiones medidas en el prompt respondieron 175-185 de 200 en HarmBench; las medidas en el pensamiento, 158-172. Las versiones del lado del prompt planificaron la respuesta en el pensamiento sin deliberar sobre el rechazo en 139-170 casos, frente a 89-133 de las del lado del pensamiento. Una direccion aleatoria eliminada en los mismos 48 puntos respondio 24 de 200. En transformers, el original obtiene 97 en GSM8K y 99 en GPQA Diamond.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en BF16 (safetensors de 3,46 GB o GGUF BF16 de 3,47 GB); aproximadamente 1,1 GB en GGUF Q4_K_M, mas overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M y al menos 6-8 GB para BF16 con contexto moderado. Verificado por el autor en NVIDIA GeForce RTX 5070 Ti (16 GB).
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna; el autor confirma ejecucion en RTX 5070 Ti con llama.cpp CUDA (build 12004) y con transformers 5.22.0 / torch 2.15.0.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99 -c 32768 -fa on --jinja`), transformers con `trust_remote_code=True` y `dtype="bfloat16"`. vLLM, Ollama y TGI no estan confirmados en la informacion proporcionada.
- Latencia y throughput: aproximadamente 155 tok/s en BF16 y aproximadamente 275 tok/s en Q4_K_M sobre RTX 5070 Ti con llama.cpp CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HarmBench (sin rechazo) | GSM8K | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| LFM3-1.7B-uncensored-abl48 (este) | 1,73B | no disponible | 187/200 | 98/100 | 95/198 | lfm-open-license-v1.0 | Hugging Face (safetensors, GGUF) |
| LFM3-1.7B-uncensored-abl38 | 1,73B | no disponible | no disponible (el autor indica que elimina la direccion en 38 puntos) | no disponible | no disponible | lfm-open-license-v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (original) | 1,73B | no disponible | 21/200 | 98/100 (97 en transformers) | 99/198 (99 en transformers) | lfm-open-license-v1.0 | Hugging Face |

No se dispone de datos de otros modelos abliterados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Los benchmarks se ejecutaron una sola vez cada uno; el propio autor senala que ejecutar el original en transformers y en llama.cpp cambio 19 de 200 etiquetas de HarmBench, lo que indica una variabilidad considerable en la medicion.
- GPQA Diamond se trunco a 8.192 tokens y unas 50 de 198 preguntas se cortaron y contaron como incorrectas, por lo que la puntuacion de 95/198 puede infravalorar el rendimiento real.
- Las respuestas de HarmBench fueron etiquetadas por un Qwen3.8-Flash-Next local, no por el clasificador oficial, y los prompts eran solo en ingles; la tasa de no rechazo en otros idiomas no esta medida.
- La abliteration elimina la direccion de rechazo, no la capacidad de generar contenido danino; el modelo puede producir respuestas a solicitudes que el modelo base rechazaria, con implicaciones legales y eticas segun la jurisdiccion.
- La licencia lfm-open-license-v1.0 es una licencia "other" con terminos propios; es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El modelo base tiene 1,73B de parametros, por lo que su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos de mayor tamano; la degradacion en GPQA (99 a 95) sugiere un coste pequeno pero real.
- Riesgo de alucinacion inherente a modelos de este tamano, no cuantificado en la informacion proporcionada.
- No hay informacion sobre sesgos conocidos ni sobre el dataset de entrenamiento original, lo que dificulta evaluar sesgos sistematicos.
- El modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- No se confirma soporte de tool calling, agentes ni capacidades multilingues; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48
- Version abl38: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl38
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- README en japones: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48/blob/main/README_ja.md
- Figura 2 (posiciones de medicion): https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48/blob/main/images/fig2_positions_en.png
- Figura 3 (prueba principal): https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48/blob/main/images/fig3_main_en.png
- Figura 4 (GGUF en llama.cpp): https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48/blob/main/images/fig4_gguf_en.png
- Licencia: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48/blob/main/LICENSE
