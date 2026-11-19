# nace-ai/Qwen3.5-4B-MLX-4bit-KQuant

## Resumen
Qwen3.5-4B-MLX-4bit-KQuant es una cuantizacion en formato MLX de 4 bits del modelo Qwen/Qwen3.5-4B, publicada por nace-ai (Nace.AI) para su ejecucion local en Macs con Apple Silicon. El modelo base es un transformer multimodal de tipo image-text-to-text de aproximadamente 4.539 millones de parametros, orientado a conversacion, razonamiento con modo de pensamiento y llamada a herramientas. Esta version cuantizada ocupa 3,1 GB en repositorio y reduce los pesos del modelo de lenguaje a unos 2,37 GB, lo que la hace viable en equipos de consumo con memoria unificada.

La relevancia de esta ficha concreta no esta en el modelo base, sino en la calidad de la cuantizacion: el autor reporta una divergencia KL de 0,048 frente al modelo BF16 original, frente a 0,070 del pack de 4 bits de lmstudio-community, con el mismo tamano de pesos. Es decir, se acerca aproximadamente 1,5 veces mas al modelo original que la alternativa publica mas extendida, manteniendo un tamaño identico.

El pack esta pensado para el motor de inferencia Kapitsa del mismo autor, que expone APIs compatibles con OpenAI, Anthropic y Ollama, ademas de una interfaz de chat local. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona hasta 32.768 tokens de salida con thinking activado, no la ventana de entrada) |
| Tipos de cuantizacion | 4 bits (Q4) en formato MLX; pesos del modelo de lenguaje ~2,37 GB |
| Idiomas soportados | no disponible (la model card advierte que valores altos de presence_penalty pueden mezclar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento
No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.5-4B en la informacion proporcionada: no se especifica si emplea atencion completa, atencion lineal, mezcla de expertos o alguna variante hibrida, ni el numero de capas, cabezas o dimension oculta. Lo que si se deduce de los tags y del pipeline es que se trata de un modelo multimodal capaz de procesar imagenes y texto (image-text-to-text), con un modo de razonamiento explicito ("thinking") que genera contenido en el campo `reasoning_content` antes de la respuesta final.

Tampoco se detallan los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF o DPO). La informacion disponible se centra en el proceso de cuantizacion: Nace.AI aplica una cuantizacion de 4 bits en formato MLX y reporta metricas de fidelidad frente al modelo BF16 original medidas sobre 32.768 tokens de WikiText-2, conversaciones de GSM8K y codigo de HumanEval. El resultado es una divergencia KL de 0,048 y una tasa de coincidencia en el siguiente token del 89,9 % respecto a BF16, frente a 0,070 y 88,1 % del pack de lmstudio-community. No se describe la tecnica concreta de cuantizacion (por ejemplo, si usa escalas por grupo, GPTQ, AWQ o un esquema propio de "KQuant").

## Capacidades
- Generacion de texto conversacional multi-turno.
- Razonamiento explicito con modo de pensamiento activado por defecto; la salida de razonamiento se devuelve en `reasoning_content` y puede desactivarse con `reasoning_effort: "none"` o `enable_thinking: false`.
- Comprension de imagenes: acepta entradas visuales como URL http(s) o data URL base64 mediante el formato `image_url` de OpenAI.
- Llamada a herramientas (tool calling) con definiciones de funciones compatibles con OpenAI; la model card reporta 20 de 20 pruebas de ida y vuelta completadas correctamente en modo sin thinking.
- Razonamiento matematico: resultados reportados en GSM8K (0,923 de exactitud sobre las 1.319 preguntas).
- Generacion de codigo: se usa HumanEval como parte del conjunto de evaluacion de la cuantizacion, aunque no se publica la puntuacion del modelo en esa tarea.
- Integracion con APIs compatibles con OpenAI, Anthropic y Ollama a traves del motor Kapitsa.
- Capacidades multilingues: no disponibles en detalle; la model card solo advierte sobre mezcla de idiomas con penalizaciones de presencia altas.

## Casos de uso
- Asistente conversacional local en Mac: el pack de 3,1 GB cabe en la memoria unificada de un Mac con Apple Silicon y permite ejecutar un chatbot con contexto multi-turno sin conexion, usando Kapitsa como servidor local en `127.0.0.1:8000`.
- Automatizacion con tool calling: integracion en flujos que requieran consultar APIs externas (meteorologia, calendario, busquedas) mediante definiciones de funciones OpenAI; la model card valida el ciclo completo de llamada y respuesta con el SDK de OpenAI.
- Analisis de imagenes en local: descripcion o extraccion de informacion de capturas, documentos escaneados o fotografias enviadas como `image_url`, util para prototipos de accesibilidad o procesamiento documental sin enviar datos a la nube.
- Razonamiento matematico asistido: resolucion de problemas aritmeticos y de enunciado con el modo thinking activado, adecuado para tutoria o verificacion de calculos, con un rendimiento reportado del 92,3 % en GSM8K.
- Generacion de codigo en entornos de desarrollo locales: el modelo puede usarse como asistente de programacion dentro de editores o scripts, con ajustes de temperatura especificos para codigo preciso (0,6 / top_p 0,95 / top_k 20).
- Prototipado de agentes multi-paso: combinacion de razonamiento explicito y tool calling para construir agentes que planifiquen, llamen a herramientas y sinteticen respuestas, con la ventaja de ejecutarse integramente en el equipo del desarrollador.
- Evaluacion y comparacion de cuantizaciones: util como referencia para investigadores que quieran medir el impacto de distintas tecnicas de cuantizacion MLX sobre un mismo modelo base, dado que el autor publica metricas de KL y coincidencia de siguiente token.

## Benchmarks y rendimiento

| Metrica | lmstudio-community 4-bit | Nace Q4 (este repo) |
|---|---|---|
| KL respecto a BF16 (menor es mejor) | 0,070 | 0,048 |
| Coincidencia con BF16 en siguiente token | 88,1 % | 89,9 % |
| GSM8K (1.319 preguntas) | 0,914 | 0,923 |

El autor indica que, pregunta a pregunta en GSM8K, 35 solo las acierta el pack de lmstudio-community y 47 solo el pack de Nace, sin diferencia estadisticamente medible (McNemar z = 1,33). En tool calling con thinking desactivado, 20 de 20 intentos completaron la llamada y la respuesta sin llamadas adicionales (MLX 0.32.4, mlx-lm 0.32.2, M5 Pro). No se publican resultados de MMLU, HumanEval ni otros benchmarks del modelo base en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria: el repositorio ocupa 3,1 GB y los pesos del modelo de lenguaje unos 2,37 GB en Q4; se necesita memoria unificada suficiente para pesos, cache KV y contexto. Con 8 GB de memoria unificada deberia ser ajustado; 16 GB o mas es recomendable para contextos largos.
- GPU: disenado exclusivamente para Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra) mediante MLX. No es compatible con GPU NVIDIA ni con CUDA.
- Cabe en equipos de consumo: si, en Macs con Apple Silicon; no esta pensado para GPUs de consumo tipo RTX 4090 porque el formato MLX no es compatible con CUDA.
- Despliegue: motor Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa pull`, `kapitsa serve`), que expone APIs OpenAI, Anthropic y Ollama. Tambien puede usarse con `mlx_lm.generate` de la libreria mlx-lm.
- Latencia y throughput: no disponibles de forma numerica; la model card solo menciona pruebas realizadas en un M5 Pro sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Calidad frente a BF16 | Licencia |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-4B-MLX-4bit-KQuant | 4,54 B | MLX Q4 | no disponible | KL 0,048; 89,9 % coincidencia; GSM8K 0,923 | Apache 2.0 |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | 4,54 B (mismo base) | MLX Q4 | no disponible | KL 0,070; 88,1 % coincidencia; GSM8K 0,914 | Apache 2.0 |
| Qwen/Qwen3.5-4B (BF16 original) | 4,54 B | safetensors BF16 | no disponible | referencia | Apache 2.0 |
| nace-ai/Qwen3.5-9B-MLX | no disponible | MLX | no disponible | no disponible | Apache 2.0 |

La comparativa se limita al mismo modelo base y a la version BF16, ya que no se dispone de datos de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias
- Exclusivo de Apple Silicon: el formato MLX no funciona en CUDA ni en CPU x86 convencional; no es desplegable en servidores con GPU NVIDIA sin reconvertir los pesos.
- Cuantizacion de 4 bits: aunque la fidelidad reportada es alta, existe una perdida inevitable frente a BF16 (KL 0,048), que puede manifestarse en tareas sensibles a la precision numerica o a matices linguisticos.
- Idiomas: no se documenta la lista de idiomas soportados; la model card advierte que valores altos de `presence_penalty` pueden provocar mezcla de idiomas.
- Alucinacion: no se publican evaluaciones especificas de tasa de alucinacion; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente con thinking desactivado.
- Modo thinking por defecto: consume muchos tokens de salida (hasta 32.768 recomendados); en produccion conviene desactivarlo o limitarlo para controlar latencia y coste.
- Tool calling: las pruebas reportadas se hicieron en modo sin thinking; el comportamiento con thinking activado y multiples herramientas no esta cuantificado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B, ya que esta ficha no detalla posibles terminos adicionales del autor original.
- Fecha de publicacion futura en los metadatos (noviembre de 2026): conviene contrastar la vigencia del repositorio antes de integrarlo en produccion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Practicas recomendadas del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B#best-practices
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Pack de referencia lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Otros packs de Nace.AI: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
