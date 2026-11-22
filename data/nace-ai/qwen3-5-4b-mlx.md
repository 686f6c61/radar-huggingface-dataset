# nace-ai/Qwen3.5-4B-MLX

## Resumen

Qwen3.5-4B-MLX es un paquete cuantizado en formato MLX de 4 bits del modelo Qwen/Qwen3.5-4B, publicado por nace-ai (Nace.AI) para su ejecucion local en Macs con Apple Silicon. No es un modelo entrenado desde cero, sino una cuantizacion optimizada del modelo base de Qwen, con 4.539.265.536 parametros totales y un peso de ficheros de aproximadamente 3,1 GB. La relevancia de este paquete reside en su fidelidad respecto al modelo original en BF16: segun la model card, presenta una divergencia KL de 0,048 frente a los 0,070 del paquete de lmstudio-community, con el mismo tamano de pesos del modelo de lenguaje (2,37 GB).

El modelo base Qwen3.5-4B es multimodal (pipeline image-text-to-text), con capacidades de razonamiento previo a la respuesta (thinking mode) y soporte de tool calling. El paquete esta pensado para ejecutarse con Kapitsa, el motor de inferencia local de Nace.AI, que expone APIs compatibles con OpenAI, Anthropic y Ollama, ademas de una interfaz de chat web.

La licencia es Apache 2.0, lo que facilita su uso comercial. El paquete esta orientado especificamente al ecosistema MLX y Apple Silicon, por lo que no es directamente portable a GPUs NVIDIA sin conversion de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, tag `qwen3_5`; familia transformer multimodal) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona hasta 32.768 tokens de salida con thinking activado) |
| Tipos de cuantizacion | Q4 (4 bits), formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. El tag `qwen3_5` y la pipeline `image-text-to-text` indican que se trata de un modelo multimodal de la familia Qwen3.5, capaz de procesar entradas de imagen y texto. El paquete de nace-ai es una cuantizacion post-entrenamiento a 4 bits en formato MLX, no un reentrenamiento: los pesos derivan del modelo Qwen/Qwen3.5-4B en BF16.

La innovacion tecnica destacable de este paquete es la calidad de la cuantizacion: segun la model card, logra una divergencia KL de 0,048 respecto al modelo BF16, frente a 0,070 del paquete de lmstudio-community, y una coincidencia del 89,9 % en el siguiente token frente al 88,1 % del rival. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, que devuelve el razonamiento en el campo `reasoning_content`.
- Modo sin razonamiento (`reasoning_effort: "none"` o `enable_thinking: false`) para respuestas directas.
- Procesamiento de imagenes: acepta entradas `image_url` como URL http(s) o data URL base64 (pipeline image-text-to-text).
- Tool calling / function calling con definiciones de herramientas en formato OpenAI, incluyendo rondas completas de llamada y respuesta.
- Capacidades matematicas: resultados de GSM8K de 0,923 en el conjunto completo de 1.319 preguntas.
- Capacidades multilingues: no disponibles en la informacion proporcionada (la model card advierte que valores altos de `presence_penalty` pueden mezclar idiomas).
- Integracion con APIs compatibles con OpenAI, Anthropic y Ollama a traves de Kapitsa.

## Casos de uso

- Asistente de chat local en Mac: el paquete se sirve con Kapitsa y ofrece una pagina de chat en `http://127.0.0.1:8000`, adecuado para uso privado en Apple Silicon sin enviar datos a la nube.
- Razonamiento matematico asistido: con GSM8K de 0,923 y modo thinking, es adecuado para resolver problemas aritmeticos y de varios pasos en entornos educativos o de analisis.
- Automatizacion con tool calling: la model card documenta un ciclo completo con el SDK de OpenAI (definicion de herramienta `get_weather`, llamada, respuesta y segunda llamada), lo que permite integrarlo en agentes que consultan APIs externas.
- Procesamiento de imagenes con descripcion textual: acepta imagenes por URL o base64 y responde preguntas sobre su contenido, util para catalogacion o accesibilidad.
- Generacion de codigo con ajustes precisos: la model card recomienda temperature 0,6 y presence_penalty 0,0 para codificacion precisa con thinking activado.
- Prototipado de APIs compatibles con OpenAI: Kapitsa expone endpoints `/v1/chat/completions`, lo que permite sustituir un backend remoto por inferencia local durante el desarrollo.
- Evaluacion comparativa de cuantizaciones: el paquete incluye metricas de KL y GSM8K que permiten comparar su fidelidad frente a otros packs MLX de 4 bits.

## Benchmarks y rendimiento

| Prueba | lmstudio-community pack | Nace (este repo) |
|---|---:|---:|
| KL respecto al modelo BF16 (menor es mejor) | 0,070 | 0,048 |
| Coincidencia con BF16 en el siguiente token | 88,1 % | 89,9 % |
| GSM8K (1.319 preguntas) | 0,914 | 0,923 |
| Tool calling, 20 ensayos sin thinking | no disponible | 20/20 exitosos, 0 llamadas extra |

En GSM8K, 35 preguntas solo las acierta el pack de lmstudio-community y 47 solo el pack de Nace; la model card indica que la diferencia no es medible (McNemar z 1,33). Las pruebas de tool calling se realizaron con MLX 0.32.4, mlx-lm 0.32.2 y un M5 Pro.

## Requisitos de hardware

- VRAM/RAM unificada estimada: aproximadamente 3,1 GB de ficheros; los pesos del modelo de lenguaje ocupan 2,37 GB en Q4.
- Plataforma: exclusivamente Apple Silicon (Macs con chip M-series); el formato MLX no se ejecuta de forma nativa en GPUs NVIDIA o AMD.
- Cabe en cualquier Mac con Apple Silicon con memoria unificada suficiente; el M5 Pro se cita como plataforma de prueba.
- Opciones de despliegue: Kapitsa (motor de Nace.AI, instalable via `brew install nace-ai/tap/kapitsa`) y `mlx_lm.generate` de la libreria MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- APIs expuestas por Kapitsa: OpenAI, Anthropic y Ollama, con servidor local en el puerto 8000.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | KL vs BF16 | GSM8K | Licencia |
|---|---|---:|---|---:|---:|---|
| nace-ai/Qwen3.5-4B-MLX (este) | 4.539.265.536 | MLX Q4 | no disponible | 0,048 | 0,923 | Apache 2.0 |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | mismo modelo base | MLX 4-bit | no disponible | 0,070 | 0,914 | no disponible |
| nace-ai/Qwen3.5-9B-MLX | no disponible | MLX | no disponible | no disponible | no disponible | Apache 2.0 (segun repo) |
| Qwen/Qwen3.5-4B (BF16) | no disponible | safetensors | no disponible | referencia | no disponible | no disponible |

Los otros paquetes de Nace.AI citados en la model card (Qwen3.5-9B, Qwen3.8-27B, Qwen3.6-35B-A3B, Qwen3.8-Flash-Next) son alternativas del mismo autor para distintos tamanos.

## Limitaciones y advertencias

- El paquete es especifico de MLX y Apple Silicon; no es utilizable directamente en CUDA, ROCm ni en CPU sin conversion.
- La model card indica que los ejemplos de inferencia se probaron en nace-ai/Qwen3.5-9B-MLX, no en este paquete de 4B, por lo que el comportamiento puede diferir.
- El modo thinking esta activado por defecto; sin desactivarlo, el modelo consume tokens de razonamiento y requiere hasta 32.768 tokens de salida para tareas complejas.
- La model card advierte que valores altos de `presence_penalty` pueden provocar mezcla de idiomas; se recomienda mantenerlo entre 0 y 2 y no usar `repetition_penalty` distinto de 1,0.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- No se especifican los idiomas soportados, lo que limita la planificacion de despliegues multilingues.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone restricciones adicionales.
- Solo 1 like y 38.294 descargas en el momento de la consulta; el soporte de la comunidad es limitado.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Buenas practicas del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B#best-practices
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Paquete comparable de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Otros paquetes del autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
