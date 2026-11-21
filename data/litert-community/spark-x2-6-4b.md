# litert-community/Spark-X2.6-4B

## Resumen

Spark-X2.6-4B es un modelo de lenguaje denso de 4,11 mil millones de parametros desarrollado por el equipo SparkLLM (XHToken) y convertido a formato LiteRT-LM por la comunidad `litert-community` para su ejecucion en dispositivos locales (on-device) y en el borde (edge). Se trata de la primera entrega de la serie Spark-X2.6 y, segun su model card, mantiene la arquitectura de Spark-X2.5-4B y obtiene su mejora de capacidad mediante un post-entrenamiento refinado. Su proposito es ofrecer razonamiento de calidad en hardware de consumo, incluyendo telefonos moviles como el Galaxy S26 o el Pixel 11 Pro, sin depender de la nube.

La arquitectura es un decoder transformer denso de 36 capas, tamano oculto 2560, 16 cabezas de consulta y 4 cabezas KV de 256 dimensiones, con atencion de ventana deslizante (512 tokens) en tres de cada cuatro capas, puertas sigmoideas por cabeza en la salida de atencion y MLP con GELU exacto. El vocabulario es de 131.072 entradas con pesos atados (tied). Es un modelo de razonamiento: genera su cadena de pensamiento dentro de etiquetas `<think>…</think>` antes de responder, y los ficheros LiteRT-LM declaran un canal `thought` para que el runtime mantenga el razonamiento separado de la respuesta final.

La conversion a LiteRT-LM (`.litertlm`) es el valor diferencial de este repositorio: ofrece tres recetas de cuantizacion (int4 blockwise-128, int8 dinamica y una variante int8 con cache KV recortada a 2048 tokens) con metricas medidas en Mac Studio (M4 Max), Galaxy S26 y Pixel 11 Pro. Con licencia Apache-2.0, el modelo es relevante ahora porque demuestra que un modelo de razonamiento de 4B puede correr a 91,2 tok/s en GPU de consumo y a 5,3-8,2 tok/s en CPU de telefono con calidad GSM8K cercana al modelo bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso con atencion de ventana deslizante hibrida (3 capas SW de 512 por cada capa de atencion completa), puertas sigmoideas por cabeza en salida de atencion, MLP gated con GELU exacto |
| Parametros totales | 4,11 mil millones (dense) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (vocabulario); cache KV de los ficheros int4/int8: 4.096 tokens; variante kv2048: 2.048 tokens |
| Tipos de cuantizacion | int4 blockwise-128 + OCTAV en lineales con embedding int8; int8 dinamica por canal; int8 con KV recortada a 2048 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en `XHToken/Spark-X2.6-4B` |

| Fichero | Receta | Tamano |
|---|---|---|
| `Spark-X2.6-4B_int4.litertlm` | int4 blockwise-128 + OCTAV en lineales, embedding int8 en seccion propia | 2.483 MB |
| `Spark-X2.6-4B_int8.litertlm` | int8 dinamica por canal en lineales y embedding | 4.238 MB |
| `Spark-X2.6-4B_int8-kv2048.litertlm` | int8 con cache KV recortada a 2.048 tokens (mismos pesos) | 4.238 MB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 36 capas con tamano oculto 2560. La atencion usa 16 cabezas de consulta y 4 cabezas KV de 256 dimensiones, con un patron hibrido en el que tres capas de atencion de ventana deslizante de 512 tokens se intercalan por cada capa de atencion completa; esto reduce el coste de atencion en contextos largos manteniendo acceso global periodico. La salida de atencion incorpora puertas sigmoideas por cabeza (per-head sigmoid gates) y los MLP son gated con GELU exacto. El vocabulario es de 131.072 entradas con pesos atados (tied embeddings). El modelo base declara construirse sobre Spark-X2.5-4B conservando su arquitectura, de modo que la mejora de capacidad proviene del post-entrenamiento; la model card no detalla el volumen de tokens de preentrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

La innovacion tecnica destacable de este repositorio no esta en el entrenamiento sino en la conversion: `litert-torch` 0.9.3 produce grafos para LiteRT-LM 0.19.0 con activaciones fp32 en GPU, y el fichero int4 usa operaciones compuestas de LiteRT-LM para las escrituras de cache KV y los productos de atencion sin modificar los pesos. El modelo es de razonamiento: el template de prompt abre el bloque de pensamiento igual que el template del proveedor y los ficheros declaran un canal `thought`, de modo que el runtime separa el razonamiento de la respuesta. Se verifico que el tokenizer es el `tokenizer.json` upstream byte a byte (234 de 234 cadenas de prueba codificadas con los mismos ids que la libreria `tokenizers`) y que el template de chat renderiza de forma identica al `chat_template.jinja` del proveedor en 54 combinaciones de mensajes, generacion y `reasoning_effort`.

## Capacidades

- Generacion de texto y razonamiento multi-paso: produce cadena de pensamiento dentro de `<think>…</think>` antes de la respuesta final.
- Aritmetica y matematicas basicas: 8/8 en preguntas cortas con respuesta unica (dos aritmeticas, una capital, una traduccion, una comparacion decimal, un antonimo, los dias de la semana y una rima) en int4 e int8, CPU y GPU.
- Razonamiento con esfuerzo configurable: parametro `reasoning_effort` con valores `high` y `low` que ajusta el presupuesto de tokens de pensamiento (por defecto 3.584 tokens; `low` usa 1.792 en la variante kv2048).
- Memoria conversacional multi-turno: pasa la prueba de 3 turnos (plantar un hecho, operar, recordar el hecho) en int8 en CPU y GPU, y en int4 en GPU.
- Capacidades multilingues: no disponible (la model card no detalla idiomas; las pruebas de tokenizer cubren Latin-1, Extended-A, emoji y CJK a nivel de codificacion).
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades especiales: canal `thought` para separar razonamiento de respuesta, plantilla de chat compatible byte a byte con la del proveedor y modo de razonamiento de bajo esfuerzo para CPU.

## Casos de uso

- Asistente de razonamiento en el telefono sin conexion: con el fichero int8 en CPU de un Galaxy S26 (5,3 tok/s) o la variante kv2048 a esfuerzo `low` (8,2 tok/s), el modelo resuelve preguntas aritmeticas y de conocimiento general localmente, sin enviar datos a la nube.
- Aplicaciones moviles con requisitos de privacidad: al ejecutarse integramente en el dispositivo mediante LiteRT-LM, los prompts y respuestas no salen del telefono, lo que encaja en escenarios sanitarios o financieros con datos sensibles.
- Chat multi-turno en el borde: el modelo mantiene contexto entre turnos y recuerda hechos plantados previamente; el fichero int8 pasa la prueba de 3 turnos en CPU y GPU, adecuado para asistentes conversacionales embebidos.
- Prototipado rapido en portatiles Apple Silicon: el fichero int4 decodifica a 91,2 tok/s en GPU de un Mac Studio M4 Max con 1.024 tokens de prefill y 256 generados, lo que permite iterar sobre prompts y evaluar el modelo sin infraestructura de servidor.
- Evaluacion de razonamiento con presupuesto controlado: el parametro `reasoning_effort` permite alternar entre cadenas de pensamiento largas (por defecto, hasta 3.584 tokens) y cortas (1.792 tokens en kv2048), util para comparar calidad frente a latencia en pipelines de investigacion.
- Despliegue en dispositivos con memoria limitada: el fichero int4 ocupa 2.483 MB, lo que permite cargarlo en telefonos y equipos con poca RAM; la variante kv2048 reduce ademas el coste de cache KV a 2.048 tokens para CPU.
- Generacion de codigo en produccion: no disponible; la model card no documenta soporte de tool calling ni evaluacion en benchmarks de codigo.

## Benchmarks y rendimiento

GSM8K, primeras 100 preguntas del conjunto de test, greedy, thinking activado, prompt 0-shot de cadena de pensamiento que pide la respuesta como `#### <numero>`, 3.584 tokens de salida (la cache KV de los ficheros int4 e int8 alberga 4.096 tokens):

| Modelo / fichero | GSM8K | Notas |
|---|---|---|
| bf16 (referencia) | 90 | Modelo base sin cuantizar |
| `int4.litertlm` | 89 | En GPU; en CPU dio respuesta vacia en el tercer turno en 3 de 8 conversaciones |
| `int8.litertlm` | 90 en CPU, 93 en GPU | 45 % mas lento que int4 en GPU |
| `int8-kv2048.litertlm` | 93 a `reasoning_effort` `low` | bf16 en las mismas condiciones: 92 |

Rendimiento de decodificacion (1.024 tokens de prefill, 256 generados, LiteRT-LM 0.19.0, medido el 2026-10-31):

| Plataforma | Fichero | Throughput |
|---|---|---|
| Mac Studio M4 Max, GPU | int4 | 91,2 tok/s |
| Mac Studio M4 Max, GPU | int8 | 49,8 tok/s |
| Galaxy S26, CPU | int8 | 5,3 tok/s |
| Galaxy S26, CPU | int8-kv2048 a `low` | 8,2 tok/s (×1,49 frente a int8) |
| Mac, CPU | int8-kv2048 a `low` | ×1,40 frente a int8 |

Correccion en 8 preguntas cortas (Mac, LiteRT-LM 0.19.0 Python API, greedy, thinking on, 2.048 tokens de salida): int4 CPU 8/8, GPU 8/8; int8 CPU 8/8, GPU 8/8. En Galaxy S26 CPU con int8: 8/8. La variante kv2048 obtuvo 8/8 y paso la prueba multi-turno en Mac y Pixel 11 Pro.

## Requisitos de hardware

- VRAM/RAM para inferencia: int4 requiere aproximadamente 2,5 GB para pesos mas activaciones fp32; int8 requiere aproximadamente 4,3 GB. La cache KV es de 4.096 tokens en int4/int8 y de 2.048 en kv2048.
- GPU recomendadas: Apple Silicon (M4 Max medido); GPU de escritorio tipo A100, H100 o RTX 4090 no estan documentadas en la model card.
- Cabe en GPU de consumo: si, el fichero int4 (2,5 GB) cabe en cualquier GPU consumer moderna; el int8 (4,3 GB) tambien.
- Cabe en movil: si; Galaxy S26 y Pixel 11 Pro medidos con los ficheros int8 y kv2048.
- Opciones de despliegue: LiteRT-LM 0.19.0 (CLI `litert-lm`, API Python y wheel de Android desde PyPI); las versiones 0.15.0 a 0.19.2 del CLI cargaron los tres ficheros en CPU de Mac, salvo el int4 en 0.15.0. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; 91,2 tok/s en GPU M4 Max con int4 y 5,3-8,2 tok/s en CPU de Galaxy S26.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Spark-X2.6-4B (int4) | 4,11B denso | 4.096 tokens KV (vocab. 131.072) | 89 (GPU) | Apache-2.0 | `.litertlm`, LiteRT-LM |
| Spark-X2.6-4B (int8) | 4,11B denso | 4.096 tokens KV | 90 CPU / 93 GPU | Apache-2.0 | `.litertlm`, LiteRT-LM |
| Spark-X2.5-4B | 4,11B denso | no disponible | no disponible | no disponible | safetensors |
| Alternativas de ~4B con razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no incluye comparaciones con modelos de terceros de la misma categoria; solo referencia a Spark-X2.5-4B como predecesor arquitectonico y al modelo bf16 como referencia de precision.

## Limitaciones y advertencias

- El fichero int4 en CPU fallo en 3 de 8 conversaciones de la prueba multi-turno: el tercer turno devolvio una respuesta vacia justo despues del pensamiento. El autor descarta que sea un empate cercano (la respuesta bf16 supera en mas de 17 logits a cualquier token de parada) y recomienda int8 para CPU.
- La cache KV de los ficheros int4 e int8 es de 4.096 tokens, muy inferior al vocabulario de 131.072 entradas; la variante kv2048 la recorta a 2.048 tokens, que deben alojar prompt, pensamiento y respuesta, por lo que no sirve para el presupuesto de 3.584 tokens del esfuerzo por defecto.
- El modelo base es de 4,11B parametros denso; no se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- Idiomas soportados: no disponible; no hay evaluacion multilingue publicada.
- Soporte de tool calling, function calling y uso como agente: no disponible.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio solo distribuye ficheros `.litertlm`; para otros formatos hay que acudir al modelo base `XHToken/Spark-X2.6-4B`.
- El modelo es de razonamiento y genera tokens de pensamiento antes de responder: en produccion hay que presupuestar esos tokens (3.584 por defecto, 1.792 en `low`) en latencia y coste.
- La model card advierte de problemas de runtime conocidos en telefonos con respuestas largas, para los que recomienda streaming.
- No hay fila de rendimiento en GPU para el Galaxy S26; las cifras moviles son solo de CPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Spark-X2.6-4B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- LiteRT (Google AI Edge): https://github.com/google-ai-edge/LiteRT
- Paper, blog o demo oficiales: no disponible
