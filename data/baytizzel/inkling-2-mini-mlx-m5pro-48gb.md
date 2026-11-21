# baytizzel/Inkling-2-Mini-MLX-M5Pro-48gb

## Resumen

Inkling-2-Mini-MLX-M5Pro-48gb es un repositorio de pesos en formato MLX del modelo Inkling 2 Mini de Thinking Machines, empaquetado y ajustado por el usuario baytizzel para su ejecución en Apple Silicon con 48 GB de memoria unificada. No se trata de un modelo nuevo: los pesos son los del lanzamiento original, repackados en los formatos `nvfp4` y `mxfp8` de MLX sin recuantizar, junto con un fork de mlx-vlm con correcciones específicas para el decode, el prefill y las conversaciones largas de este modelo.

El modelo subyacente es un transformer con mezcla de expertos (MoE) de tipo "looped": de sus 24 capas, las 12 centrales se ejecutan tres veces, lo que resulta en 48 pasadas de capa por token. Cuenta con 26.388.641.280 parámetros totales (26,2B según la model card) y aproximadamente 3,4B activos por token. Acepta entrada de texto e imagen (pipeline `image-text-to-text`) y está orientado a conversación con contexto largo.

La relevancia de este repositorio es práctica: documenta una configuración de servicio medida sobre un MacBook Pro M5 Pro con 48 GB, con cifras concretas de rendimiento (26,6 tok/s de decode, 750-786 tok/s de prefill, 298 s para un prompt en frío de 125K tokens) y una ventana de contexto medida de 131.072 tokens. Está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas (looped transformer); 24 capas, las 12 centrales ejecutadas 3 veces (48 pasadas por token) |
| Parametros totales | 26.388.641.280 (26,2B) |
| Parametros activos | ~3,4B por token |
| Longitud de contexto | 131.072 tokens (medida) |
| Tipos de cuantizacion | NVFP4 (expertos en capas 0-19), MXFP8 (capas 20-23), BF16 (resto); pesos repackados sin recuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 19,53 GB), `mtp.safetensors` (drafter de decodificación especulativa, 0,64 GB), index JSON, tokenizer tiktoken, chat template jinja |
| Libreria | mlx (mlx-vlm) |
| Tamano del repo | 20,2 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Inkling 2 Mini es un modelo de mezcla de expertos con una innovación estructural concreta: un esquema "looped" en el que las 12 capas intermedias de un total de 24 se reutilizan tres veces, dando lugar a 48 pasadas de capa efectivas por token. Esta repetición de capas permite aumentar la profundidad efectiva de cómputo sin incrementar el número de parámetros almacenados, manteniendo el total en 26,2B con solo ~3,4B activos por token. El modelo procesa tanto texto como imágenes.

Los pesos del repositorio conservan la cuantización del lanzamiento original: los expertos de las capas 0-19 están en NVFP4, las capas 20-23 en MXFP8 y el resto en BF16, todo repackado al layout de MLX. El repositorio incluye además `mtp.safetensors`, el drafter DSpark de decodificación especulativa del lanzamiento original, sin modificar (0,64 GB, desactivado en esta configuración). El autor proporciona un script `verify-against-release.py` que comprueba cada tensor contra el checkpoint de Thinking Machines. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con niveles configurables de esfuerzo mediante el parámetro `reasoning_effort` del chat template: `none`, `minimal`, `low`, `medium`, `high` (por defecto) y `xhigh`. El modelo emite un bloque de razonamiento incluso en `none`, devuelto como `reasoning_content`.
- Comprensión de imágenes: pipeline `image-text-to-text`; las imágenes se envían como partes `image_url` (no probado en la configuración medida).
- Tool calling / function calling: las herramientas se devuelven como `tool_calls` en formato OpenAI.
- Conversaciones multi-turno con contexto largo: ventana de 131.072 tokens con reutilización de prefijo en RAM para turnos sucesivos.
- Gestión de contexto del servidor: compactación automática de turnos antiguos al alcanzar 3/4 de la ventana, desactivable con `"context_management": []`.
- Decodificación especulativa disponible mediante el drafter DSpark incluido (desactivado en la configuración medida).
- Capacidades multilingües: no disponible.

## Casos de uso

- Conversación larga sobre documentos extensos: con una ventana de 131.072 tokens y reutilización de prefijo en RAM, un documento de 125K tokens se procesa una vez (298 s en frío) y los turnos siguientes responden en ~2 s, lo que lo hace adecuado para análisis iterativo de contratos, informes o bases de código.
- Asistente local en Mac: despliegue en un MacBook Pro M5 Pro con 48 GB mediante un servidor compatible con la API de OpenAI en `127.0.0.1:8082`, sin dependencia de la nube ni de GPU dedicadas.
- Automatización con herramientas: integración en flujos que requieran function calling, ya que el modelo devuelve `tool_calls` en el formato estándar de OpenAI y puede encadenarse con clientes existentes.
- Análisis de imágenes con texto: clasificación, descripción o extracción de información de imágenes combinadas con instrucciones textuales, aprovechando el pipeline image-text-to-text.
- Prototipado de agentes con razonamiento controlado: el parámetro `reasoning_effort` permite ajustar el coste de cómputo por consulta, usando `low` o `minimal` para tareas simples y `high` o `xhigh` para razonamiento complejo.
- Desarrollo y evaluación de infraestructura MLX: el repositorio incluye scripts de construcción del motor, verificación de pesos y configuración de servicio, útil para equipos que quieran reproducir o extender el stack mlx-vlm en Apple Silicon.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de serving del autor sobre un MacBook Pro M5 Pro con 48 GB, no benchmarks de calidad del modelo:

| Metrica | inkling2-mlx estandar | Esta configuracion |
|---|---:|---:|
| Decode | 24,0-24,8 tok/s | 26,6 tok/s |
| Prefill, prompt de 3,3K tokens | 557-611 tok/s | 750 tok/s |
| Prefill, prompt de 12,9K tokens | 591-595 tok/s | 786 tok/s |
| Prompt de 125K tokens, en frio | parada por guarda de memoria | 298 s, 3/3 codigos ocultos encontrados |
| Turnos siguientes sobre esa conversacion de 125K | rechazado | ~2 s, conversacion completa en cache |
| Decode con 125K tokens en contexto | no disponible | 18,2 tok/s |
| Memoria a 125K | no disponible | 33,6 GB, 25% libre |

Comparativa con Unsloth UD-Q4_K_XL GGUF sobre llama.cpp: 28,4 tok/s de decode y 252-304 tok/s de prefill (recuantiza los pesos de atención).

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Memoria: mínimo 48 GB de memoria unificada para la configuración medida; Thinking Machines indica 32 GB como mínimo, con ventana más corta por debajo de 48 GB. Los pesos ocupan 20 GB y las 8 pasadas de capa globales añaden 32 KB de caché KV por token (4,1 GB a 125K).
- Para contextos largos en 48 GB: elevar el límite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=43008` (42 GiB; no persiste tras reiniciar).
- Disco: ~23 GB libres, git, Python 3.11 o superior y el CLI `hf`.
- GPU: Apple Silicon (MacBook Pro M5 Pro con 48 GB en las mediciones). No aplica a GPU NVIDIA/AMD.
- Despliegue: fork de mlx-vlm instalado mediante `scripts/build-engine.sh` en un venv con versiones fijas (72 paquetes, MLX 0.32.4, transformers 5.23.0, torch 2.15.0); servidor compatible con OpenAI en el puerto 8082; una sola secuencia decodificada a la vez (`--max-num-seqs 1`).
- Alternativa: Unsloth UD-Q4_K_XL GGUF sobre llama.cpp (28,4 tok/s decode, 252-304 tok/s prefill).
- Latencia y throughput: ver tabla de benchmarks; 26,6 tok/s de decode y 18,2 tok/s con 125K tokens en contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-M5Pro-48gb (este) | 26,2B totales, ~3,4B activos | 131.072 | MLX (nvfp4/mxfp8), mlx-vlm | Apache 2.0 | 26,6 tok/s decode en M5 Pro 48 GB |
| Inkling-2-Mini (original, Thinking Machines) | 26,2B totales, ~3,4B activos | no disponible | safetensors BF16 | Apache 2.0 | Pesos de referencia; requiere más memoria |
| Unsloth UD-Q4_K_XL GGUF de Inkling-2-Mini | 26,2B totales, ~3,4B activos | no disponible | GGUF, llama.cpp | Apache 2.0 | 28,4 tok/s decode, 252-304 tok/s prefill |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo puede entrar en bucle mientras razona; Thinking Machines recomienda establecer siempre `max_tokens`.
- El servidor no rechaza peticiones que excedan la ventana de 131.072 tokens; es responsabilidad del cliente mantener prompt + `max_tokens` dentro del límite.
- La reutilización de prefijo es solo en RAM: un documento nuevo se vuelve a leer por completo.
- El parser del motor puede incluir una frase del razonamiento en el contenido del mensaje junto a los `tool_calls`.
- Solo se decodifica una secuencia a la vez (`--max-num-seqs 1`), lo que limita el throughput en concurrencia.
- El soporte de imágenes no fue probado en esta configuración.
- La decodificación especulativa (drafter DSpark) está desactivada en la configuración medida.
- No hay información sobre sesgos, idiomas soportados ni calidad en benchmarks de este modelo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base de Thinking Machines.
- Requiere hardware Apple Silicon; no es desplegable en GPU NVIDIA sin reconvertir los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baytizzel/Inkling-2-Mini-MLX-M5Pro-48gb
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados detallados del autor: `results/RESULTS.md` dentro del repositorio
