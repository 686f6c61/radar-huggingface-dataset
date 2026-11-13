# nace-ai/Qwen3.5-4B-MLX

## Resumen

Qwen3.5-4B-MLX es una cuantizacion en formato MLX de 4 bits del modelo Qwen/Qwen3.5-4B, publicada por Nace.AI para su ejecucion en Macs con Apple Silicon. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer multimodal de tipo image-text-to-text con 4.539.265.536 parametros totales, pensado para conversacion, razonamiento y codigo. Esta version concreta no es un modelo nuevo, sino un empaquetado Q4 optimizado que ocupa 3,1 GB en disco y 2,37 GB de pesos del modelo de lenguaje.

La relevancia de este pack esta en su fidelidad respecto al original en BF16: el autor reporta una divergencia KL de 0,048 frente al modelo sin cuantizar, frente a 0,070 del pack de lmstudio-community, con el mismo tamano de pesos. Ademas, coincide con el BF16 en el 89,9% de las predicciones de siguiente token, frente al 88,1% del pack alternativo, y obtiene 0,923 en GSM8K completo (1.319 preguntas) frente a 0,914.

El modelo conserva las capacidades del Qwen3.5-4B original: modo de razonamiento explicito (thinking) activado por defecto, soporte de imagenes, tool calling compatible con la API de OpenAI y una ventana de salida de hasta 32.768 tokens. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card solo menciona hasta 32.768 tokens de salida) |
| Tipos de cuantizacion | Q4 (4 bits) en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); pesos del modelo de lenguaje de 2,37 GB, repo de 3,1 GB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen/Qwen3.5-4B original, no un entrenamiento propio de Nace.AI. La arquitectura subyacente es la de Qwen3.5, un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text), con un modo de razonamiento interno que genera trazas de pensamiento antes de la respuesta final. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la model card del modelo base y no se incluye en la informacion disponible.

La innovacion tecnica de este repositorio es el proceso de cuantizacion Q4 realizado por Nace.AI, que segun el autor queda mas cerca del modelo BF16 que el pack de lmstudio-community con el mismo tamano de pesos. La evaluacion se hizo midiendo la divergencia KL de las distribuciones de siguiente token sobre 32.768 tokens de WikiText-2, conversaciones de GSM8K y codigo de HumanEval. Tambien se reporta una prueba de tool calling con 20 de 20 ensayos correctos en modo thinking-off sobre MLX 0.32.4 y mlx-lm 0.32.2 en un M5 Pro.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito en modo thinking, con la traza devuelta en el campo `reasoning_content`; se puede desactivar con `reasoning_effort: "none"` o `enable_thinking: false`.
- Comprension de imagenes: acepta entradas `image_url` como URL http(s) o data URL base64, segun el ejemplo de la model card.
- Tool calling / function calling con definiciones de herramientas en formato OpenAI, incluyendo round trip completo con el SDK de OpenAI.
- Razonamiento matematico: 0,923 en GSM8K completo (1.319 preguntas) segun la evaluacion del autor.
- Generacion de codigo: evaluado en HumanEval como parte del conjunto de calibracion de la cuantizacion.
- Ajuste de parametros de muestreo por modo: thinking (temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5) y thinking off (temperature 0.7, top_p 0.8, top_k 20, presence_penalty 1.5).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el pack esta pensado para ejecutarse con Kapitsa en Apple Silicon, sirviendo una pagina de chat y APIs compatibles con OpenAI, Anthropic y Ollama en `http://127.0.0.1:8000`, sin depender de la nube.
- Razonamiento matematico asistido: con GSM8K en 0,923, es adecuado para resolver problemas aritmeticos y de varios pasos en modo thinking, con hasta 32.768 tokens de salida para dar espacio a la traza de razonamiento.
- Automatizacion con herramientas: el soporte de tool calling en formato OpenAI permite integrarlo en agentes que consultan APIs externas (por ejemplo, meteo, calendario o busqueda) y completan el round trip con el SDK de OpenAI, como muestra el ejemplo de la model card.
- Analisis de imagenes en local: al aceptar `image_url` en base64 o URL, puede describir o responder preguntas sobre capturas, fotos o diagramas dentro de un flujo privado en el Mac del usuario.
- Prototipado de agentes multi-paso: el modo thinking por defecto y la API compatible con OpenAI permiten conectar el modelo a frameworks de agentes existentes sin adaptadores propios.
- Generacion de codigo en local: con ajustes de codigo precisos (temperature 0.6, top_p 0.95, top_k 20, presence_penalty 0.0) y evaluado sobre HumanEval, sirve para autocompletar o revisar codigo en entornos de desarrollo sin enviar datos a terceros.
- Despliegue privado en equipos de investigacion: el flag `--private` de Kapitsa y la licencia Apache 2.0 permiten montar un endpoint interno para experimentacion con datos sensibles.

## Benchmarks y rendimiento

| Test | lmstudio-community 4-bit | Nace Q4 (este repo) |
|---|---:|---:|
| KL respecto al modelo BF16 (menor es mejor) | 0,070 | 0,048 |
| Coincidencia con BF16 en el siguiente token | 88,1% | 89,9% |
| GSM8K (1.319 preguntas) | 0,914 | 0,923 |
| Tool calling, thinking off (20 ensayos) | no disponible | 20/20 correctos, 0 llamadas extra |

En la comparacion por pregunta de GSM8K, 35 preguntas solo las acierta el pack de lmstudio-community y 47 solo el pack de Nace; el autor indica que la diferencia no es medible (McNemar z = 1,33). No se han publicado resultados de MMLU, HumanEval u otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unificated memory estimada: el repo ocupa 3,1 GB en disco y los pesos del modelo de lenguaje 2,37 GB en Q4; se necesita memoria unificada suficiente para pesos, cache KV y contexto, aunque el autor no publica una cifra exacta.
- Hardware objetivo: Macs con Apple Silicon; las pruebas de tool calling se hicieron en un M5 Pro con MLX 0.32.4 y mlx-lm 0.32.2.
- GPU Nvidia (A100, H100, RTX 4090): no soportadas por este pack, que es exclusivo del formato MLX para Apple Silicon.
- Despliegue: Kapitsa (motor de Nace.AI, instalable via `brew install nace-ai/tap/kapitsa`) y `mlx_lm.generate` de la libreria mlx-lm. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad vs BF16 | Licencia |
|---|---|---:|---|---|---|
| nace-ai/Qwen3.5-4B-MLX (este) | 4.539.265.536 | no disponible | Q4 MLX | KL 0,048; 89,9% acuerdo | Apache 2.0 |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | mismo modelo base | no disponible | Q4 MLX | KL 0,070; 88,1% acuerdo | Apache 2.0 (heredada) |
| Qwen/Qwen3.5-4B (BF16 original) | 4.539.265.536 | no disponible | BF16 | referencia | Apache 2.0 |

Otras variantes del mismo autor en otros tamanos: Qwen3.5-9B-MLX, Qwen3.8-27B-MLX, Qwen3.6-35B-A3B-MLX y Qwen3.8-Flash-Next-MLX, todas en formato MLX.

## Limitaciones y advertencias

- Es una cuantizacion Q4: introduce una divergencia medible respecto al BF16 (KL 0,048), por lo que no es identica al modelo original.
- La model card advierte de que los ejemplos de inferencia se probaron en nace-ai/Qwen3.5-9B-MLX y no en este pack de 4B; solo se sustituyo el nombre del repo.
- El modo thinking esta activado por defecto y consume tokens de salida; hay que desactivarlo explicitamente para respuestas directas.
- Un `presence_penalty` alto puede mezclar idiomas, segun la propia model card; se recomienda entre 0 y 2 y mantener `repetition_penalty` en 1.0.
- Exclusivo de Apple Silicon y del formato MLX: no es desplegable en GPUs Nvidia ni en stacks como vLLM o TGI.
- Idiomas soportados no documentados en la informacion disponible; no se puede garantizar cobertura multilingue.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion proporcionada; aplican los del modelo base Qwen3.5-4B.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B.
- El ecosistema de herramientas (Kapitsa) es de un unico proveedor y con pocas descargas (115) y likes (1) en el momento de la consulta, lo que limita la validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Mejores practicas del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B#best-practices
- Pack alternativo de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Web de Nace.AI: https://www.nace.ai/
- Variante 9B: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Variante 27B: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX
- Variante 35B-A3B: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX
- Variante Flash-Next: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
