# nace-ai/Qwen3.5-9B-MLX

## Resumen

Qwen3.5-9B-MLX es una cuantización para Apple Silicon del modelo Qwen3.5-9B de Alibaba, publicada por el usuario nace-ai bajo licencia Apache 2.0. Se distribuye como un pack MLX con dos variantes de precisión mixta (Q4 y Q5), pensadas para ejecutarse en Macs con memoria unificada mediante la librería `mlx` y herramientas compatibles como `mlx-lm`, `mlx-vlm`, Kapitsa, LM Studio o vllm-mlx. El modelo base es multimodal (pipeline `image-text-to-text`), con 9.409.813.744 parámetros totales según los safetensors del repo.

El interés principal de esta publicación no es el modelo en sí, sino el proceso de cuantización: el autor reporta que su pack Q4 queda a una divergencia KL de 0,030 respecto al BF16 original, frente a 0,081 del pack 4-bit de mlx-community, es decir, unas 2,7 veces más cercano al modelo de referencia, con un 5 % más de peso destinado al modelo de lenguaje (5,29 GB frente a 5,04 GB). La variante Q5 baja la KL a 0,010. Ambos packs están diseñados para caber en Macs con 16 GB de RAM o más.

La relevancia es práctica: para desarrolladores que quieren desplegar un modelo de 9B multimodal con modo de razonamiento en hardware de consumo Apple, esta ficha ofrece una alternativa de cuantización con métricas de fidelidad publicadas y comparadas contra otros packs MLX del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-9B; familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (Q4, mixta con down_proj e in_proj_z en 5-bit, ~4,2 bits/peso, 4,7 contando escalas) y MLX 5-bit (Q5, mixta 5/6/8-bit por tensor, ~5,05 bits/peso, 5,55 contando escalas) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (packs Q4/ y Q5/) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentación proporcionada: no se detalla si es un transformer denso, MoE o híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. El tag `qwen3_5` y el pipeline `image-text-to-text` confirman que se trata de un modelo multimodal de la familia Qwen3.5, con capacidad de procesar imágenes además de texto.

La innovación técnica documentada en esta publicación es la propia cuantización. El pack Q4 aplica 4 bits de forma general pero mantiene `down_proj` e `in_proj_z` en 5 bits, lo que eleva la media a unos 4,2 bits por peso (4,7 contando escalas). El pack Q5 usa precisión mixta de 5, 6 y 8 bits según el tensor, con una media de 5,05 bits por peso (5,55 con escalas). El autor publica una gráfica de KL media frente a BF16 comparando su Q4 y Q5 con packs de Brooooooklyn (UD-Q4_K_XL), lmstudio-community (4-bit), mlx-community (4-bit y OptiQ) y mlx-works (oQ4e-mtp), situando sus dos variantes como las más cercanas al original en su conjunto de medición.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat integrada.
- Modo de razonamiento ("thinking") activado por defecto, con la traza devuelta en el campo `reasoning_content` en servidores compatibles con la API de OpenAI; se puede desactivar con `reasoning_effort: "none"` o `enable_thinking: false`.
- Procesamiento de imágenes: acepta entradas `image_url` (URL http(s) o data URL base64) en el formato de partes de la API de OpenAI, y responde preguntas sobre el contenido visual.
- Tool calling / function calling: probado con Kapitsa, mlx-lm, mlx-vlm, LM Studio, SwiftLM, LocalAI, Osaurus, vllm-mlx y mlx-openai-server; todas las herramientas citadas salvo `llm-tool` de Apple colocaron correctamente una llamada a herramienta.
- Multilingüe: la model card solo declara inglés (`en`); no se documentan otras lenguas.
- Ajuste de muestreo específico por modo: temperatura 1,0, top_p 0,95, top_k 20 y presence_penalty 1,5 con thinking; temperatura 0,7, top_p 0,8, top_k 20 y presence_penalty 1,5 sin thinking.

## Casos de uso

- Asistente local en Mac para desarrolladores: servir el pack Q4 con Kapitsa o `mlx_lm.server` y exponer una API compatible con OpenAI, Anthropic y Ollama en `127.0.0.1:8000`, útil para prototipar agentes sin depender de la nube.
- Análisis de imágenes en local: enviar capturas, diagramas o fotos como `image_url` y pedir descripciones o extracción de información, aprovechando que el pack cabe en 16 GB de RAM unificada.
- Automatización con tool calling: integrar el modelo en flujos que requieran llamadas a funciones (consultas a APIs, ejecución de comandos) usando cualquiera de los servidores compatibles probados por el autor.
- Razonamiento matemático asistido: el modo thinking por defecto y los parámetros de muestreo recomendados (temperatura 1,0, top_p 0,95) están pensados para tareas que se benefician de una cadena de razonamiento previa, como el ejemplo `17 * 23` de la model card.
- Evaluación de cuantizaciones: usar los packs Q4 y Q5 como referencia para medir el impacto de la cuantización en tareas propias, dado que el autor publica KL frente a BF16 y comparativas con otros packs MLX.
- Despliegue en estaciones de trabajo Apple Silicon para equipos pequeños: con 6,2 GB (Q4) o 7,1 GB (Q5) de descarga y ejecución sobre memoria unificada, es viable en un Mac de 16 GB sin GPU dedicada.
- Integración en LM Studio o en servidores MLX (vllm-mlx, mlx-openai-server): permite incorporar el modelo a interfaces gráficas o backends ya existentes sin cambiar de stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo publica métricas de fidelidad de cuantización:

| Metrica | Q4 | Q5 | Referencia |
|---|---|---|---|
| KL media frente a BF16 (menor es mejor) | 0,030 | 0,010 | mlx-community 4-bit: 0,081 |
| Tamano de descarga | 6,2 GB | 7,1 GB | no disponible |
| Peso del modelo de lenguaje | 5,29 GB | no disponible | mlx-community 4-bit: 5,04 GB |
| Bits por peso (sin escalas / con escalas) | ~4,2 / 4,7 | ~5,05 / 5,55 | no disponible |
| RAM minima orientativa | 16 GB+ | 16 GB+ | no disponible |

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (MLX). No es un pack para GPU NVIDIA ni para CPU x86 convencional.
- RAM: 16 GB o más para ambos packs según la regla del autor (descarga + 2 GB para conversación, asumiendo que macOS asigna ~2/3 de la RAM a la GPU). Kapitsa puede caber en una talla menos porque omite partes no usadas; `kapitsa doctor` verifica un Mac concreto.
- Descarga: 6,2 GB (Q4) y 7,1 GB (Q5); el repositorio completo ocupa 12,4 GB.
- GPU recomendadas: no se especifican modelos; las pruebas se realizaron en un M5 Pro. No aplican A100, H100 ni RTX 4090.
- Opciones de despliegue: Kapitsa (`kapitsa serve --model 9b:q4`), `mlx_lm.generate` y `mlx_lm.server` (puerto 8080), `mlx-vlm`, LM Studio con motor MLX 1.13.1, SwiftLM b911, LocalAI 4.12.1 con backend MLX, Osaurus 1.0.1, vllm-mlx 0.6.0, mlx-openai-server 1.8.1 y `llm-tool` de mlx-swift-examples.
- Versiones probadas: Kapitsa 0.2.32, mlx-lm 0.32.2, mlx-vlm 0.7.10, LM Studio 1.13.1, sobre un M5 Pro el 11 de noviembre de 2026.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / pack | Parametros | Contexto | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai Qwen3.5-9B-MLX Q4 | 9,41 B | no disponible | 0,030 | apache-2.0 | Hugging Face (este repo) |
| nace-ai Qwen3.5-9B-MLX Q5 | 9,41 B | no disponible | 0,010 | apache-2.0 | Hugging Face (este repo) |
| mlx-community 4-bit (Qwen3.5-9B) | no disponible | no disponible | 0,081 | no disponible | Hugging Face |
| lmstudio-community 4-bit (Qwen3.5-9B) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| mlx-works oQ4e-mtp (Qwen3.5-9B) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Brooooooklyn UD-Q4_K_XL (Qwen3.5-9B) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a los packs MLX citados por el autor; no se dispone de datos de contexto, rendimiento en tareas ni licencia de los packs rivales en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon mediante MLX; no es portable a CUDA, ROCm ni CPU genérica sin reconvertir los pesos.
- La model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y puede degradarse.
- No se documentan sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base; el riesgo de alucinación es el habitual en modelos de 9B y no está cuantificado.
- La licencia Apache 2.0 del pack se hereda del modelo base, pero conviene verificar las condiciones del Qwen3.5-9B original antes de uso comercial.
- El modo thinking está activado por defecto y consume tokens adicionales; en producción conviene desactivarlo con `reasoning_effort: "none"` o `enable_thinking: false` y usar los parámetros de muestreo sin razonamiento.
- La regla de "cabe en 16 GB" es una estimación del autor, no una medición; el propio autor recomienda verificar con `kapitsa doctor`.
- El pack tiene muy poca tracción (352 descargas, 1 like) y fue creado en noviembre de 2026; no hay historial de mantenimiento a largo plazo.
- Las métricas de KL publicadas por el autor no han sido verificadas de forma independiente en la información disponible.
- No se dispone de la longitud de contexto del modelo base, lo que impide planificar cargas de contexto largo con precisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
- Carpeta Q4: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/tree/main/Q4
- Carpeta Q5: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/tree/main/Q5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Kapitsa (motor de Nace para Qwen en Mac): https://github.com/nace-ai/kapitsa
- Grafica de KL (assets): https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/resolve/main/assets/nace-dark.svg
- mlx-lm: no disponible como enlace en la informacion proporcionada
- mlx-vlm: no disponible como enlace en la informacion proporcionada
