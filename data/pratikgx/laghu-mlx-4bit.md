# pratikgx/Laghu-MLX-4bit

## Resumen

Laghu-MLX-4bit es una cuantización comunitaria no oficial a 4 bits del modelo udgamlabs/Laghu-MLX, que a su vez es la compilación para MLX del modelo Laghu, un pequeño modelo de lenguaje de 152 millones de parámetros entrenado por Udgam Labs. Este repositorio, publicado por el usuario pratikgx, no modifica la arquitectura ni los datos de entrenamiento: solo reduce la precisión de los pesos de bf16 a 4 bits mediante `mlx_lm.convert` con cuantización afín y tamaño de grupo 64, obteniendo un tamaño efectivo de 4,506 bits por peso.

El modelo subyacente emplea la arquitectura `gemma4_text` (familia Gemma 4 de Google), con una longitud máxima de contexto de 16.384 tokens y una ventana deslizante de 512 tokens. Está pensado para generación de texto y conversación en inglés, con una plantilla de chat que incluye un conmutador `enable_thinking`. Su relevancia actual es doble: por un lado, demuestra el ecosistema de cuantización sobre MLX para Apple Silicon; por otro, sirve como caso práctico de los compromisos entre velocidad, memoria y calidad en modelos de muy pequeño tamaño.

Es importante subrayar que Udgam Labs decidió deliberadamente no publicar una versión de 4 bits porque la pérdida de calidad es notable: la propia model card reporta una KL media de 0,337 y una concordancia top-1 del 69,9 % frente a la referencia F16, mientras que su build bf16 alcanza KL 0,0009 y 98,0 %. Este repositorio debe considerarse, por tanto, material de experimentación en velocidad y memoria, no una opción recomendada para producción con requisitos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_text` (transformer de la familia Gemma 4) |
| Parametros totales | 151.792.668 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (ventana deslizante de 512 tokens) |
| Tipos de cuantizacion | 4 bits afín, tamaño de grupo 64 (4,506 bits por peso efectivos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX; `model.safetensors` de ~86 MB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la arquitectura `gemma4_text`, con 151,79 millones de parámetros y un contexto máximo de 16.384 tokens limitado por una ventana deslizante de 512 tokens. Esta ventana implica que la atención efectiva se restringe a los últimos 512 tokens, lo que condiciona el comportamiento en conversaciones o documentos largos pese a que la configuración admita secuencias de hasta 16.384 tokens. La plantilla de chat es la de Gemma 4 de Google (Apache-2.0) e incluye un interruptor `enable_thinking` para activar o desactivar el modo de razonamiento explícito.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación posteriores al preentrenamiento. La única información técnica concreta sobre esta variante es el proceso de cuantización: se aplicó `mlx_lm.convert -q --q-bits 4 --q-group-size 64` con mlx-lm 0.32.2, mlx 0.32.4 y Python 3.12. El tokenizador, la plantilla de chat y la configuración de generación se mantienen sin cambios respecto al modelo original. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con plantilla de chat conversacional.
- Modo de razonamiento conmutable mediante `enable_thinking` en la plantilla de chat.
- Conversación multi-turno dentro de los límites de la ventana deslizante de 512 tokens.
- Generación de texto creativo breve (el ejemplo de la model card es un haiku).
- Inferencia local en Apple Silicon mediante la librería MLX.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá del modo `thinking`.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Experimentación con cuantización en MLX: el repositorio permite medir el impacto de pasar de bf16 a 4 bits en velocidad de decodificación y memoria pico sobre Apple Silicon, con cifras concretas publicadas (por ejemplo, 402 frente a 364 tok/s en decodificación con 512 tokens de prompt en un M4 Pro).
- Prototipado rápido de interfaces conversacionales en local: al ocupar unos 86 MB de pesos, cabe en cualquier Mac con Apple Silicon y permite iterar sobre plantillas de chat y prompts sin coste de API.
- Pruebas de pipelines de generación de texto antes de migrar a un modelo mayor: sirve para validar la integración con `mlx-lm`, el formato de mensajes y la lógica de `enable_thinking` con un coste computacional mínimo.
- Docencia y demostraciones de cuantización: el contraste documentado entre la calidad bf16 (KL 0,0009) y la 4 bits (KL 0,337) es un ejemplo didáctico de los compromisos de precisión.
- Generación de texto creativo breve en entornos con restricciones de memoria: con 0,38 GB de memoria pico a 512 tokens de prompt, es viable en dispositivos con recursos muy limitados.
- Benchmarking de infraestructura local: la model card incluye mediciones de prefill y decodificación a 512, 2.048, 8.192 y 16.000 tokens de prompt, útiles para comparar hardware y configuraciones de MLX.
- No se recomienda para atención al cliente en producción ni para generación de código, dado que no hay evidencia de soporte de tool calling y la calidad de la cuantización es baja.

## Benchmarks y rendimiento

La model card indica explícitamente que los benchmarks de calidad (GSM8K, IFEval, ARC-Easy, HellaSwag) se ejecutaron únicamente sobre el modelo bf16, no sobre esta copia de 4 bits, y que los resultados en bruto están en el dataset `pratikgx/launch-bench-results`. No se publican los valores numéricos de esos benchmarks en la información disponible.

Los únicos datos de rendimiento publicados para esta variante son mediciones de velocidad y memoria en un Apple M4 Pro (16 núcleos GPU, 24 GB), macOS 27.0.1, mlx 0.32.4 y mlx-lm 0.32.2, con decodificación greedy, prompts de *Pride and Prejudice*, 256 tokens generados, paso de prefill 2048 y mediana de 3 ejecuciones:

| Tokens de prompt | Decodificación bf16 | Decodificación 4 bits | Prefill bf16 | Prefill 4 bits | Memoria pico bf16 | Memoria pico 4 bits |
|---|---|---|---|---|---|---|
| 512 | 364 tok/s | 402 tok/s | 11.516 tok/s | 11.844 tok/s | 0,66 GB | 0,38 GB |
| 2.048 | 356 tok/s | 409 tok/s | 11.264 tok/s | 10.825 tok/s | 1,17 GB | 1,11 GB |
| 8.192 | 328 tok/s | 397 tok/s | 9.198 tok/s | 8.876 tok/s | 1,23 GB | 1,15 GB |
| 16.000 | 303 tok/s | 379 tok/s | 7.554 tok/s | 7.069 tok/s | 1,26 GB | 1,15 GB |

La decodificación en 4 bits es entre un 10 % y un 25 % más rápida; el prefill es prácticamente igual; la memoria pico solo se reduce de forma clara con prompts cortos, porque a contextos largos domina la caché KV.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos en 4 bits ocupan unos 86 MB (frente a 303,6 MB en bf16). La memoria pico medida en un M4 Pro va de 0,38 GB a 512 tokens de prompt hasta 1,15 GB a 16.000 tokens.
- GPU recomendadas: Apple Silicon con soporte MLX; las mediciones publicadas corresponden a un Apple M4 Pro de 16 núcleos GPU y 24 GB de memoria unificada. No se han publicado mediciones en A100, H100 ni RTX 4090, y el formato MLX está orientado a Apple Silicon.
- GPU de consumo: cabe holgadamente en cualquier Mac con Apple Silicon, incluidos equipos con 8 GB de memoria unificada para prompts cortos.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 o superior) mediante `mlx_lm.generate` o la API de Python `load`/`generate`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: en el M4 Pro de referencia, 379-409 tok/s en decodificación y 7.069-11.844 tok/s en prefill según la longitud del prompt (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Calidad documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pratikgx/Laghu-MLX-4bit | 151,8 M | 16.384 (ventana 512) | 4 bits MLX | KL 0,337; top-1 69,9 % frente a F16 | Apache-2.0 | HuggingFace, MLX |
| udgamlabs/Laghu-MLX | 151,8 M | 16.384 (ventana 512) | bf16 MLX | KL 0,0009; top-1 98,0 % frente a F16 | Apache-2.0 | HuggingFace, MLX |
| udgamlabs/Laghu | 152 M | no disponible en la información | no disponible | no disponible | Apache-2.0 (según el modelo base) | HuggingFace |

La comparación relevante es interna a la familia Laghu: la versión bf16 de Udgam Labs es la referencia de calidad y la opción recomendada por el propio autor de esta conversión. No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros de tamaño comparable en la información proporcionada, por lo que no se incluye una comparación con alternativas externas.

## Limitaciones y advertencias

- Pérdida de calidad significativa: KL media de 0,337 y concordancia top-1 del 69,9 % frente a la referencia F16, según los datos de Udgam Labs citados en la model card. El autor de la conversión no ejecutó benchmarks de calidad sobre esta copia.
- Conversión no oficial: no está publicada ni validada por Udgam Labs, que decidió no distribuir una build de 4 bits precisamente por la degradación de calidad.
- Ventana deslizante de 512 tokens: aunque el contexto máximo configurado sea de 16.384 tokens, la atención efectiva se limita a los últimos 512 tokens, lo que afecta a conversaciones y documentos largos.
- Solo inglés: los metadatos declaran únicamente el idioma `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente a un modelo de 152 M de parámetros; no se documentan evaluaciones de fidelidad factual.
- Sin soporte documentado de tool calling ni de agentes: no se debe asumir su uso en pipelines que requieran function calling.
- Licencia Apache-2.0: permite uso comercial, pero los pesos y el tokenizador son © 2026 Udgam Labs LLP y la plantilla de chat es de Google (Apache-2.0); debe conservarse el fichero `NOTICE`.
- Memoria pico dominada por la caché KV en contextos largos: la ventaja de memoria del 4 bits desaparece a partir de 2.048 tokens de prompt.
- Recomendación explícita de los autores: usar la versión bf16 `udgamlabs/Laghu-MLX` cuando la calidad sea prioritaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pratikgx/Laghu-MLX-4bit
- Modelo base (MLX, bf16): https://huggingface.co/udgamlabs/Laghu-MLX
- Modelo original: https://huggingface.co/udgamlabs/Laghu
- Dataset con resultados de benchmarks: https://huggingface.co/datasets/pratikgx/launch-bench-results
- Notas técnicas del autor: https://github.com/pratikgx/local-ai-field-notes/blob/main/notes/2026-10-27-laghu.md
- Repositorio de notas: https://github.com/pratikgx/local-ai-field-notes
