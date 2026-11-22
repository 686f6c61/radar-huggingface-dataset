# nace-ai/Qwen3.5-4B-MLX-Q4-KQuant

## Resumen

Qwen3.5-4B-MLX-Q4-KQuant es una cuantización en 4 bits del modelo Qwen/Qwen3.5-4B, publicada por nace-ai para su uso en Apple Silicon mediante la librería MLX. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un transformer multimodal de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) orientado a tareas de imagen-texto-a-texto, conversación y razonamiento. Esta versión cuantizada reduce el peso de los ficheros a 3,1 GB y está pensada para ejecutarse localmente en Macs con chip de la serie M.

La relevancia de este pack concreto reside en su método de cuantización: según la model card, logra una divergencia KL de 0,048 respecto al modelo BF16 original, frente a 0,070 del pack de 4 bits de lmstudio-community, con el mismo tamaño de pesos del modelo de lenguaje (2,37 GB). Además, mantiene una tasa de coincidencia del 89,9 % en el siguiente token respecto al BF16 y obtiene 0,923 en GSM8K (1.319 preguntas), ligeramente por encima del 0,914 del pack rival.

El modelo soporta modo de razonamiento (thinking) activado por defecto, tool calling, entrada de imágenes y APIs compatibles con OpenAI, Anthropic y Ollama a través del motor Kapitsa del mismo autor. La licencia Apache 2.0 facilita su adopción tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona hasta 32.768 tokens de salida, no la ventana de entrada) |
| Tipos de cuantizacion | Q4 (4 bits), formato MLX; pesos del modelo de lenguaje de 2,37 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 3,1 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Libreria | mlx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B más allá de su naturaleza transformer y su carácter multimodal (procesa imágenes y texto). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Lo que sí se documenta es el proceso de cuantización: nace-ai aplica una cuantización Q4 sobre los pesos del modelo base en formato MLX, con el objetivo de minimizar la divergencia respecto al BF16 original. Según las mediciones del autor, el pack alcanza una KL de 0,048 y una coincidencia del 89,9 % en el siguiente token, con pesos de 2,37 GB para el modelo de lenguaje.

El modelo incorpora un modo de razonamiento (thinking) que genera contenido en el campo `reasoning_content` de la API y que puede desactivarse mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`. La model card recomienda ajustes de muestreo diferenciados para modo thinking (temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5) y modo sin thinking (temperature 0.7, top_p 0.8, top_k 20, presence_penalty 1.5), con repetition_penalty fijo en 1.0.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito con modo thinking activado por defecto, con salida separada en `reasoning_content`.
- Procesamiento de imágenes: acepta entradas `image_url` (URL http(s) o data URL base64) y responde preguntas sobre el contenido visual.
- Tool calling / function calling con definiciones de herramientas en formato OpenAI, incluyendo round trip completo (llamada, respuesta de herramienta y respuesta final).
- Razonamiento matemático: resultados medidos en GSM8K (0,923 sobre 1.319 preguntas).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Integración con APIs compatibles con OpenAI, Anthropic y Ollama mediante el motor Kapitsa.
- Ejecución local en Apple Silicon mediante MLX.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno con modo thinking para preguntas complejas y desactivarlo para respuestas rápidas, todo sin salir del equipo del usuario gracias al motor Kapitsa y a los 3,1 GB del pack.
- Análisis de imágenes en local: clasificación y descripción de contenido visual mediante entradas `image_url`, útil para prototipos de visión por computador sin depender de servicios en la nube.
- Automatización con tool calling: integración en flujos que requieren consultar APIs externas (por ejemplo, meteorología) mediante definiciones de herramientas en formato OpenAI, con round trip verificado en 20 de 20 pruebas en modo sin thinking.
- Razonamiento matemático y resolución de problemas: el rendimiento en GSM8K (0,923) lo hace adecuado para asistentes educativos o validación de cálculos en pipelines internos.
- Desarrollo de agentes multi-paso: el modo thinking permite descomponer tareas complejas antes de responder, y la API compatible con OpenAI facilita su integración en frameworks de agentes existentes.
- Prototipado de aplicaciones de IA en Apple Silicon: desarrolladores que necesitan un endpoint local compatible con OpenAI, Anthropic u Ollama para pruebas de integración sin coste de API.
- Evaluación de técnicas de cuantización: investigadores interesados en comparar packs Q4 (KL, coincidencia de siguiente token, GSM8K) pueden usar este repositorio como referencia reproducible frente a alternativas como lmstudio-community.

## Benchmarks y rendimiento

| Test | lmstudio-community 4-bit | Nace Q4 (este repo) |
|---|---:|---:|
| KL respecto al modelo BF16 (menor es mejor) | 0,070 | 0,048 |
| Coincidencia con BF16 en el siguiente token | 88,1 % | 89,9 % |
| GSM8K (1.319 preguntas) | 0,914 | 0,923 |

En GSM8K, 35 preguntas solo las acierta el pack de lmstudio-community y 47 solo el pack de Nace; según el autor, la diferencia no es medible (McNemar z = 1,33). En tool calling en Q4, 20 de 20 ensayos en modo sin thinking colocaron la llamada y completaron el round trip, sin llamadas adicionales (MLX 0.32.4; mlx-lm 0.32.2, M5 Pro). No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 3,1 GB en disco; los pesos del modelo de lenguaje son 2,37 GB en Q4. Se recomienda al menos 8 GB de memoria unificada para dejar margen al sistema y al contexto.
- Hardware objetivo: Apple Silicon (chips de la serie M). Las pruebas de tool calling se realizaron en un M5 Pro.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, el pack es MLX y está pensado para Apple Silicon; no se documenta soporte CUDA.
- Cabe en GPUs de consumo: sí, en Macs con memoria unificada suficiente; no se especifican modelos concretos de Mac más allá del M5 Pro usado en las pruebas.
- Opciones de despliegue: motor Kapitsa (instalación vía `brew install nace-ai/tap/kapitsa`), con APIs compatibles con OpenAI, Anthropic y Ollama; también `mlx_lm.generate` con el modelo `nace-ai/Qwen3.5-4B-MLX`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KL vs BF16 | GSM8K | Licencia |
|---|---|---:|---|---:|---:|---|
| nace-ai/Qwen3.5-4B-MLX-Q4-KQuant | 4,54 B | no disponible | Q4 MLX | 0,048 | 0,923 | Apache 2.0 |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | 4,54 B (base) | no disponible | 4-bit MLX | 0,070 | 0,914 | no disponible |
| Qwen/Qwen3.5-4B (BF16) | 4,54 B | no disponible | BF16 | referencia | no disponible | Apache 2.0 |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información disponible; no se dispone de datos de modelos de otros fabricantes con los que comparar.

## Limitaciones y advertencias

- La cuantización Q4 introduce una divergencia medible respecto al BF16 (KL 0,048; coincidencia del 89,9 % en el siguiente token), por lo que no es equivalente exacto al modelo original.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas; deben asumirse los del modelo base Qwen3.5-4B.
- La longitud de contexto de entrada no se especifica en la información disponible; la model card solo menciona hasta 32.768 tokens de salida con thinking activado.
- El pack está orientado exclusivamente a Apple Silicon vía MLX; no se documenta soporte para CUDA, ROCm ni otras plataformas.
- Los ejemplos de inferencia de la model card fueron probados en nace-ai/Qwen3.5-9B-MLX, no en este pack de 4B, según advierte el propio autor.
- El modo thinking está activado por defecto y consume tokens adicionales; para producción con latencia ajustada conviene desactivarlo con `reasoning_effort: "none"`.
- Un `presence_penalty` demasiado alto puede provocar mezcla de idiomas, según la model card.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Mejores prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B#best-practices
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Pack comparable de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Otros tamaños de Nace: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
