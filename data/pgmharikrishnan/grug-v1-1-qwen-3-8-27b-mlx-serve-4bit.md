# pgmharikrishnan/grug-v1.1-qwen-3.8-27b-MLX-Serve-4bit

## Resumen

Este repositorio es una adaptación cuantizada en 4-bit del modelo de lenguaje `grug-v1.1-qwen-3.8-27b`, creada por `pgmharikrishnan` y empaquetada específicamente para ejecutarse en Apple Silicon mediante `mlx-serve`. No es un modelo nuevo: reutiliza los shards cuantizados del paquete `pgmharikrishnan/grug-v1.1-qwen-3.8-27b-MLX-4bit` y aplica la plantilla de chat de Qwen3.8. El objetivo es ofrecer una variante ligera y lista para servir en Macs con memoria unificada, sin necesidad de GPUs NVIDIA.

El checkpoint totaliza 26.895.993.856 parámetros, aproximadamente 27B. La cuantización es afín de 4 bits con grupo de 64 y pesos no cuantizados en bfloat16, lo que reduce el tamaño del repositorio a 15.2 GB. La licencia es Apache-2.0 y el formato de pesos es safetensors para el ecosistema MLX. No se proporciona la longitud de contexto ni los idiomas soportados en la información disponible.

Su relevancia radica en permitir servir un modelo de 27B en hardware de Apple Silicon con un consumo de memoria razonable, manteniendo la plantilla de chat del modelo original y el renderizado de pensamiento y llamadas a herramientas. Es útil para prototipado, investigación de cuantización y despliegues locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base es `grug-v1.1-qwen-3.8-27b`; la información no detalla la arquitectura) |
| Parametros totales | 26.895.993.856 (≈27B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine (MLX), group size 64; bfloat16 para pesos no cuantizados; cuantización de KV cache opcional (`--kv-quant 4`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards, config.json, tokenizer y weight index; empaquetado para MLX) |

## Arquitectura y entrenamiento

Este paquete es una conversión cuantizada, no un entrenamiento original. El modelo base `ProCreations/grug-v1.1-qwen-3.8-27b` no incluye en la información proporcionada datos sobre arquitectura exacta, composición del dataset, número de tokens de entrenamiento, RLHF/DPO o innovaciones técnicas de decodificación. Lo que sí se sabe es que es un checkpoint solo de texto: no incluye MTP head ni tensores de visión, por lo que no hay decodificación especulativa nativa ni entrada de imagen o vídeo.

La plantilla de chat es idéntica a la del paquete `ddalcu/Qwen3.8-27B-MLX-Serve-4bit`. El `generation_config.json` define BOS `248044`, EOS `[248046, 248044]`, temperatura `1.0`, top-p `0.95` y top-k `20`. La cuantización es afín a 4 bits con grupo 64, y los pesos no cuantizados se mantienen en bfloat16.

## Capacidades

- Generación de texto conversacional: modelo de tipo `text-generation`, preparado para chat multi-turno mediante la plantilla Qwen3.8.
- Renderizado de pensamiento (thinking) y de llamadas a herramientas (tool calls): la plantilla de chat incluye estos modos, tal como indica la model card.
- Inferencia en Apple Silicon: optimizado para MLX y `mlx-serve`, con cuantización 4-bit y cuantización de KV cache opcional mediante `--kv-quant 4`.
- Control de generación por petición: los parámetros del servidor sobrescriben los valores por defecto del modelo cuando se suministran.
- Solo texto: no admite entrada de imagen ni vídeo; no se ha documentado soporte de audio.
- Capacidades multilingües, razonamiento, código o matemáticas: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local de un asistente conversacional en Apple Silicon: se ejecuta `mlx-serve --model pgmharikrishnan/grug-v1.1-qwen-3.8-27b-MLX-Serve-4bit --serve --kv-quant 4` para exponer un endpoint HTTP en una Mac. Es adecuado para crear un chatbot privado sin depender de servicios en la nube.
- Prototipado de agentes con tool calling: la plantilla de chat renderiza llamadas a herramientas, por lo que se puede emular un agente que invoque funciones locales. Requiere validar manualmente que el modelo ejecute correctamente las tool calls.
- Evaluación comparativa de cuantización: sirve para comparar un modelo de 27B en 4-bit afín frente a la versión original o a variantes AWQ, midiendo diferencias de calidad en datasets propios.
- Experimentos de investigación en hardware Apple Silicon: permite estudiar el consumo de memoria unificada, el tiempo por token y el impacto de `--kv-quant 4`, sin necesidad de GPUs dedicadas.
- Asistente de generación de código en un entorno aislado: aunque no hay benchmarks publicados, un modelo de aproximadamente 27B puede usarse para completar fragmentos de código o explicar algoritmos en una sesión local.
- Demos y talleres de inferencia local: útil para mostrar cómo servir un modelo cuantizado de gran tamaño en Mac, en eventos o para formación, sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se indican puntuaciones de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación. Tampoco se proporcionan datos de latencia, throughput o velocidad de inferencia.

## Requisitos de hardware

- El formato es MLX, pensado para Apple Silicon (M1, M2, M3, M4 u otros chips Apple). No aplica VRAM en el sentido de GPU NVIDIA.
- El repositorio ocupa 15.2 GB en disco. Al cargarlo en memoria unificada se necesitará además espacio para el KV cache y el runtime; el valor mínimo no se especifica en la información disponible.
- El comando de despliegue es `mlx-serve --model pgmharikrishnan/grug-v1.1-qwen-3.8-27b-MLX-Serve-4bit --serve --kv-quant 4`.
- No es un checkpoint CUDA ni GGUF, por lo que no se puede cargar directamente con vLLM, llama.cpp u Ollama sin procesos de conversión adicionales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `pgmharikrishnan/grug-v1.1-qwen-3.8-27b-MLX-Serve-4bit` | 26.9B | 4-bit affine (grupo 64), bfloat16 | Apache-2.0 | safetensors / MLX | Paquete listo para `mlx-serve` con KV quant |
| `pgmharikrishnan/grug-v1.1-qwen-3.8-27b-MLX-4bit` | 26.9B | 4-bit affine | Apache-2.0 | safetensors / MLX | Origen de los shards cuantizados |
| `ProCreations/grug-v1.1-qwen-3.8-27b-awq-int4` | 26.9B | AWQ int4 | Apache-2.0 | safetensors (compressed-tensors) | Variante AWQ para vLLM |
| `ProCreations/grug-v1.1-qwen-3.8-27b` | 26.9B | No especificada | Apache-2.0 | No especificado | Modelo base original |

No se dispone de resultados de benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos, alucinaciones o limitaciones de idioma; estos aspectos dependen del modelo base y no se han evaluado en este paquete.
- Al estar cuantizado a 4-bit, es posible que haya una pérdida de calidad frente al modelo original; el impacto no está medido en la información disponible.
- Checkpoint solo texto: no soporta entradas de imagen, vídeo ni audio.
- No incluye cabeza MTP ni decodificación especulativa nativa, a pesar de estar empaquetado para servir en MLX.
- El despliegue está limitado a Apple Silicon con MLX; no es directamente cargable con vLLM, llama.cpp u Ollama sin conversión adicional.
- La cuantización de la caché KV con `--kv-quant 4` puede reducir la precisión de las claves y valores, con posibles efectos en la calidad de la generación.
- No se han publicado evaluaciones de seguridad ni red-teaming.
- La licencia Apache-2.0 permite uso comercial; no se han documentado restricciones adicionales en la información disponible.

## Enlaces

- https://huggingface.co/pgmharikrishnan/grug-v1.1-qwen-3.8-27b-MLX-Serve-4bit
- https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b
- https://huggingface.co/pgmharikrishnan/grug-v1.1-qwen-3.8-27b-MLX-4bit
- https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-awq-int4
- https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-4bit
- https://mlxserve.com
