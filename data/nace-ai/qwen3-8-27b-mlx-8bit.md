# nace-ai/Qwen3.8-27B-MLX-8bit

## Resumen

Qwen3.8-27B-MLX-8bit es una cuantizacion en 8 bits del modelo Qwen3.8-27B de Qwen (Alibaba), empaquetada en formato MLX por nace-ai para su motor de inferencia local Kapitsa, orientado a Macs con Apple Silicon. El modelo base es un transformer multimodal de tipo image-text-to-text con 27.356.728.560 parametros totales, publicado bajo licencia Apache 2.0. Esta variante concreta ocupa 29,8 GB en el repositorio y esta pensada para ejecutarse integramente en local, sin dependencia de servicios en la nube.

La relevancia de esta ficha radica en que demuestra la viabilidad de correr un modelo de ~27B parametros con capacidades de vision en hardware de consumo de Apple. Segun las mediciones del autor, la variante 8-bit alcanza 38,0 tok/s en escritura y 402 tok/s en lectura de un prompt de ~4K tokens sobre un MacBook Pro M5 Pro con 48 GB de memoria unificada, con un pico de memoria de 29,3 GiB. En la prueba GSM8K (100 preguntas) obtiene 0,950, practicamente identico al 0,940 del modelo en bf16, lo que indica que la cuantizacion a 8 bits preserva la calidad de razonamiento matematico.

El modelo se distribuye con el sufijo "mtp" en el nombre de la variante, lo que sugiere decodificacion especulativa multi-token, una tecnica que acelera la generacion al proponer varios tokens por paso. El pipeline declarado es image-text-to-text, por lo que hereda las capacidades multimodales del modelo base. La informacion publica disponible es limitada: no se detallan idiomas soportados, composicion del dataset de entrenamiento ni resultados de benchmarks mas alla de GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (esta variante); el autor publica tambien 3-bit, 4-bit MLX, GGUF q2_k a q8_0 y NVFP4 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); variantes GGUF y NVFP4 en repos separados |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentacion proporcionada. Por el pipeline declarado (image-text-to-text) y los tags, se trata de un transformer multimodal capaz de procesar entradas de imagen y texto. El nombre de la variante incluye "mtp", que en la practica de MLX suele asociarse a decodificacion especulativa multi-token (multi-token prediction), una tecnica que permite al modelo proponer varios tokens candidatos por paso de decodificacion y verificar su aceptacion, acelerando la generacion sin cambiar la distribucion de salida.

Esta ficha corresponde a una cuantizacion, no a un entrenamiento: nace-ai ha convertido los pesos del modelo base a 8 bits en formato MLX. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo original. La unica validacion de calidad publicada es la prueba GSM8K con 100 preguntas, donde la variante 8-bit obtiene 0,950 frente a 0,940 del bf16 de referencia, lo que sugiere una perdida de calidad despreciable en razonamiento aritmetico tras la cuantizacion.

## Capacidades

- Generacion de texto conversacional y multimodal: el pipeline image-text-to-text indica soporte de entradas de imagen junto con texto.
- Razonamiento matematico: validado con GSM8K (0,950 en la variante 8-bit).
- Generacion de codigo: el autor menciona explicitamente un flujo de agente de codificacion (`kapitsa opencode`), lo que implica uso para tareas de programacion.
- Decodificacion especulativa multi-token ("mtp"): generacion acelerada mediante propuesta y verificacion de multiples tokens.
- Ejecucion local en Apple Silicon mediante el motor Kapitsa, con pagina de chat y API HTTP en `http://127.0.0.1:8000`.
- Soporte de tool calling, agentes multi-paso, thinking mode, audio o idiomas: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo local: el autor documenta el comando `kapitsa opencode --model nace-ai/Qwen3.8-27B-MLX-8bit`, que arranca un agente de codificacion sobre el modelo. Es adecuado porque la variante 8-bit mantiene calidad cercana al bf16 en razonamiento y se ejecuta sin conexion en un Mac de 48 GB.
- Chat con imagenes en local: gracias al pipeline image-text-to-text, se puede desplegar una interfaz de chat que acepte capturas, diagramas o fotos junto a preguntas de texto, sin enviar datos a terceros.
- Procesamiento por lotes de documentos con contexto medio: la lectura de prompts de ~4K tokens a 402 tok/s permite procesar lotes de documentos de tamano moderado con buena latencia de prefill.
- Prototipado de agentes con API local: el servidor HTTP en `127.0.0.1:8000` permite integrar el modelo en pipelines de agentes y herramientas sin coste por token ni dependencia de red.
- Evaluacion de modelos multimodales en investigacion: al ser Apache 2.0 y ejecutable en hardware de consumo, sirve para reproducir experimentos de vision-lenguaje sin infraestructura de GPU.
- Desarrollo offline en portatil: para entornos sin conectividad o con requisitos de privacidad, el modelo corre integramente en el Mac y evita la exposicion de datos a APIs externas.
- Generacion de respuestas tecnicas largas: los 38,0 tok/s en escritura permiten redactar respuestas de cientos de tokens en segundos, adecuado para documentacion o explicaciones de codigo.

## Benchmarks y rendimiento

| Prueba | Esta variante (8-bit) | Referencia bf16 | Veredicto |
|---|---:|---:|---|
| GSM8K (100 preguntas) | 0,950 (n=100) | 0,940 (n=100) | Equivalente |

| Medicion de velocidad | Valor |
|---|---|
| Escritura (respuesta de codigo de 512 tokens, temperatura 0,6) | 38,0 tok/s |
| Lectura (prompt en frio de ~4K tokens) | 402 tok/s |
| Memoria en pico | 29,3 GiB |
| Hardware medido | MacBook Pro M5 Pro, 48 GB, build `d132a2cc` |
| Fecha de medicion | 10 de noviembre de 2026 o antes |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria: el autor reporta un pico de 29,3 GiB con la variante 8-bit; el Mac mas pequeno medido es un M5 Pro con 48 GB. En la practica, se recomienda al menos 48 GB de memoria unificada para dejar margen al sistema y al contexto.
- Tamano de descarga: 29,8 GB para esta variante.
- GPUs: el formato es MLX, especifico de Apple Silicon; no esta pensado para GPU NVIDIA. Para CUDA existen las variantes GGUF (q2_k a q8_0) y NVFP4 del mismo autor.
- Cabe en GPU de consumo: si, en Macs con Apple Silicon y 48 GB o mas de memoria unificada (M5 Pro medido). No se documentan mediciones en otros chips.
- Despliegue: motor Kapitsa (`brew install nace-ai/tap/kapitsa`), con `kapitsa serve` para chat y API, o `kapitsa opencode` para el agente de codificacion. Para las variantes GGUF se puede usar llama.cpp u Ollama, aunque no se documenta en la model card.
- Latencia y throughput: 38,0 tok/s de escritura y 402 tok/s de lectura de prompt de ~4K tokens en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.8-27B-MLX-8bit (esta ficha) | 27,36B | no disponible | MLX 8-bit, Apple Silicon | Apache 2.0 | 38,0 tok/s escritura, 29,3 GiB pico en M5 Pro 48 GB |
| Qwen3.8-27B-MLX-4bit (mismo autor) | 27,36B | no disponible | MLX 4-bit, Apple Silicon | Apache 2.0 | 16,3 GB de descarga; menor huella de memoria, calidad no documentada |
| Qwen3.8-27B-GGUF q4_k_m (mismo autor) | 27,36B | no disponible | GGUF 4,85-bit, multiplataforma | Apache 2.0 | 16,8 GB; apto para llama.cpp/Ollama en CPU y GPU |
| Qwen3.8-27B-NVFP4 (mismo autor) | 27,36B | no disponible | NVFP4 4-bit, GPU NVIDIA | Apache 2.0 | 20,6 GB; orientado a hardware NVIDIA con soporte FP4 |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion publica es escasa: no se documentan idiomas soportados, longitud de contexto, composicion del dataset ni sesgos conocidos del modelo base.
- La unica validacion de calidad es GSM8K con 100 preguntas; no hay evidencia publicada sobre HumanEval, MMLU ni tareas multimodales, por lo que el rendimiento en codigo y vision no esta cuantificado en esta ficha.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en la model card.
- La cuantizacion a 8 bits puede degradar tareas sensibles a precision numerica distintas de GSM8K; no se han publicado mediciones al respecto.
- El formato MLX limita el despliegue a Apple Silicon; para otras plataformas hay que recurrir a las variantes GGUF o NVFP4 del mismo autor.
- El modelo mide 29,3 GiB en pico, por lo que en Macs de 32 GB no cabe con margen suficiente; el minimo medido es 48 GB.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los terminos del modelo base Qwen3.8-27B por si el autor original anade condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante MLX 3-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-3bit
- Variante MLX 4-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit
- Variantes GGUF: https://huggingface.co/nace-ai/Qwen3.8-27B-GGUF
- Variante NVFP4: https://huggingface.co/nace-ai/Qwen3.8-27B-NVFP4
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
