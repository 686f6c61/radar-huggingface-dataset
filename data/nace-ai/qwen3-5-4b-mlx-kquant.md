# nace-ai/Qwen3.5-4B-MLX-KQuant

## Resumen

Qwen3.5-4B-MLX-KQuant es una cuantización en 4 bits del modelo Qwen3.5-4B de Alibaba Qwen, empaquetada en formato MLX para su ejecución en Macs con Apple Silicon. El pack lo publica nace-ai (Nace.AI), un proyecto que distribuye versiones cuantizadas de la familia Qwen para el motor de inferencia local Kapitsa, que expone APIs compatibles con OpenAI, Anthropic y Ollama. El modelo base resuelve tareas multimodales de imagen-texto y conversación, e incorpora un modo de razonamiento ("thinking") activado por defecto.

La relevancia de este pack concreto está en la calidad de la cuantización: según la model card, el pack de Nace queda un 1,5× más cerca del modelo BF16 original que el pack de 4 bits de lmstudio-community, medido como divergencia KL (0,048 frente a 0,070), con el mismo tamaño de pesos del modelo de lenguaje (2,37 GB). El repositorio completo ocupa 3,1 GB y declara 4.539.265.536 parámetros totales en sus safetensors.

El modelo base pertenece a la generación Qwen3.5, con licencia Apache 2.0, lo que permite uso comercial. Esta ficha describe el pack cuantizado tal y como se publica; los detalles de arquitectura y entrenamiento del modelo original no se detallan en la información disponible y se indican como no disponibles cuando corresponde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles internos no disponibles |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible (la model card menciona hasta 32.768 tokens de salida) |
| Tipos de cuantización | Q4 (4 bits) en formato MLX; pesos del LM: 2,37 GB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); repo de 3,1 GB |

## Arquitectura y entrenamiento

El pack es una cuantización Q4 del modelo Qwen/Qwen3.5-4B, realizada por Nace.AI en el formato nativo de MLX para Apple Silicon. No se dispone de información sobre la arquitectura interna del modelo base (número de capas, atención, posible uso de atención lineal u otras innovaciones) ni sobre el proceso de entrenamiento (volumen de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

La innovación destacable de este repositorio es el método de cuantización: Nace reporta una divergencia KL de 0,048 frente al modelo BF16, frente a 0,070 del pack de lmstudio-community, y una coincidencia del 89,9 % en el siguiente token (frente al 88,1 %). El modelo base incorpora modo de razonamiento ("thinking") que devuelve el contenido en `reasoning_content` y puede desactivarse con `reasoning_effort: "none"` o `enable_thinking: false`. El pipeline declarado es image-text-to-text, por lo que el modelo base es multimodal.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto y desactivable.
- Procesamiento de imágenes: acepta `image_url` (URL http(s) o data URL base64) y responde preguntas sobre el contenido visual.
- Tool calling / function calling con definiciones de herramientas en formato OpenAI, con round trip completo verificado (20 de 20 pruebas en modo sin thinking).
- Integración con APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.
- Ajuste de parámetros de muestreo recomendados por Qwen para modo thinking (temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5) y sin thinking (temperature 0.7, top_p 0.8).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente local en Mac para desarrolladores: el pack se sirve con Kapitsa en `127.0.0.1:8000` y ofrece una página de chat y APIs compatibles con OpenAI, Anthropic y Ollama, lo que permite sustituir llamadas a la nube por inferencia local en Apple Silicon.
- Automatización con tool calling: con definiciones de funciones en formato OpenAI, el modelo puede encadenar llamadas (por ejemplo, consultar el clima y redactar la respuesta final), verificado en 20 de 20 pruebas sin thinking.
- Análisis de imágenes en local: admite imágenes por URL o base64 y responde preguntas sobre ellas, útil para tareas de descripción o extracción de información visual sin enviar datos a terceros.
- Razonamiento matemático asistido: el pack obtiene 0,923 en GSM8K completo (1.319 preguntas), lo que lo hace adecuado para resolución de problemas aritméticos paso a paso con el modo thinking activado.
- Generación de código con ajustes precisos: la model card recomienda temperature 0.6 y presence_penalty 0.0 para código en modo thinking, un escenario de uso directo para asistentes de programación locales.
- Prototipado de agentes multi-paso: la combinación de thinking, tool calling y APIs estándar permite construir pipelines de agentes que se ejecutan íntegramente en un Mac, sin coste por token.
- Evaluación y comparación de cuantizaciones: el repositorio incluye métricas reproducibles (KL, acuerdo en el siguiente token, GSM8K) que permiten comparar packs de 4 bits antes de adoptar uno en producción.

## Benchmarks y rendimiento

| Prueba | lmstudio-community 4-bit | Nace (este repo) |
|---|---:|---:|
| KL frente al modelo BF16 (menor es mejor) | 0,070 | 0,048 |
| Coincidencia con BF16 en el siguiente token | 88,1 % | 89,9 % |
| GSM8K (1.319 preguntas) | 0,914 | 0,923 |

En GSM8K, 35 preguntas solo las acierta el pack de lmstudio-community y 47 solo el de Nace; la diferencia no es significativa (McNemar z = 1,33). Tool calling en Q4 sin thinking: 20 de 20 pruebas completaron el round trip sin llamadas adicionales (MLX 0.32.4, mlx-lm 0.32.2, M5 Pro). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon; el pack usa la librería MLX.
- Tamaño en disco: 3,1 GB de archivos; pesos del modelo de lenguaje de 2,37 GB en Q4.
- VRAM/memoria unificada: no se especifica un mínimo en la información disponible; por el tamaño del pack, encaja en Macs con memoria unificada moderada, aunque no se confirma cifra exacta.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, el formato MLX está pensado para Apple Silicon.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa serve`), que sirve APIs OpenAI, Anthropic y Ollama; también `mlx_lm.generate` para generación por línea de comandos.
- Latencia y throughput: no disponibles; las pruebas de tool calling se realizaron en un M5 Pro sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Calidad (KL vs BF16) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| nace-ai/Qwen3.5-4B-MLX-KQuant | 4.539 M | Q4 MLX | No disponible | 0,048 | Apache 2.0 | Hugging Face |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | 4.539 M (base) | 4-bit MLX | No disponible | 0,070 | Apache 2.0 (base) | Hugging Face |
| Qwen/Qwen3.5-4B (BF16) | 4.539 M | BF16 | No disponible | referencia | Apache 2.0 | Hugging Face |

La comparativa se limita al mismo modelo base en distintas cuantizaciones, ya que no se dispone de datos de benchmarks frente a otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con MLX; no es desplegable en GPU NVIDIA ni en entornos x86 sin conversión.
- Los ejemplos de inferencia de la model card fueron probados en nace-ai/Qwen3.5-9B-MLX, no en este pack de 4B; la propia card advierte de que sustituye el nombre del repositorio.
- El modo thinking está activado por defecto y consume tokens de salida; es necesario desactivarlo explícitamente para respuestas directas.
- La model card advierte de que valores altos de presence_penalty pueden mezclar idiomas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Qwen3.5-4B.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingüe.
- Longitud de contexto: no disponible; solo se documenta un máximo de 32.768 tokens de salida en modo thinking.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Buenas prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B#best-practices
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Pack comparable de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Otros packs de Nace: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX, https://huggingface.co/nace-ai/Qwen3.8-27B-MLX, https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX, https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
