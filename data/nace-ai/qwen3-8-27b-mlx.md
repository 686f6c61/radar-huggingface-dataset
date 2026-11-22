# nace-ai/Qwen3.8-27B-MLX

## Resumen

Qwen3.8-27B-MLX es una cuantizacion del modelo multimodal Qwen3.8-27B de Alibaba Qwen, empaquetada en formato MLX para su ejecucion en Apple Silicon. El trabajo lo firma nace-ai, un proyecto que distribuye pesos cuantizados de la familia Qwen junto con Kapitsa, su propio motor de inferencia para macOS. El modelo resuelve el problema de ejecutar un modelo de 27.356 millones de parametros con capacidades de vision y lenguaje en equipos de consumo con memoria unificada, sin necesidad de GPUs dedicadas.

El repositorio ofrece dos checkpoints: Q4 uniforme de 4 bits (16,3 GB, KL 0,035 frente al BF16 original) y Q5 de precision mixta (20,7 GB, KL 0,022). Segun la model card, el Q4 queda 1,5 veces mas cerca del modelo original que el pack de 4 bits de mlx-community con el mismo tamano de pesos del modelo de lenguaje. Es relevante para desarrolladores que quieran desplegar localmente un modelo de clase 27B con entrada de imagen y salida de texto en un Mac con 32 o 48 GB de RAM.

La arquitectura subyacente es la del Qwen3.8-27B base, un transformer denso (no MoE) con capacidad image-text-to-text y modo de razonamiento activado por defecto. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), familia Qwen3.8 |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 uniforme 4-bit; Q5 mixta 4/6/8-bit por tensor (~5,3 bits por peso, 5,8 contando escalas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B de Alibaba Qwen, un transformer denso con capacidad de entrada de imagen y salida de texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo base incorpora un modo de razonamiento (thinking) activado por defecto, con profundidades configurables mediante `reasoning_effort` (`low`, `medium`, `xhigh`) y la posibilidad de desactivarlo con `enable_thinking: false` o `reasoning_effort: "none"`.

La aportacion de nace-ai es la cuantizacion. El checkpoint Q4 aplica 4 bits uniformes a todos los tensores y ocupa 16,3 GB, con una divergencia KL de 0,035 respecto al BF16 original. El checkpoint Q5 usa precision mixta por tensor (4, 6 u 8 bits segun el tensor), ocupa 20,7 GB y baja la KL a 0,022. La model card compara estos valores con packs publicos de MLX (lmstudio-community 4-bit, mlx-community 4-bit, mlx-works oQ4e-mtp) y situa al Q4 de Nace como el mas cercano al original entre los de su tamano. El autor tambien menciona decodificacion especulativa en el rival mlx-works (oQ4e-mtp), aunque no esta claro si el pack de Nace la incorpora.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat compatible con OpenAI.
- Razonamiento explicito en modo thinking, con salida separada en `reasoning_content` y control de profundidad (`low`, `medium`, `xhigh`).
- Entrada de imagenes mediante partes `image_url` (URL http/https o data URL base64) en la API compatible con OpenAI.
- Tool calling / function calling, verificado en `mlx_lm.server` y LM Studio segun la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Despliegue local en Apple Silicon mediante MLX y mediante el motor Kapitsa, que expone APIs compatibles con OpenAI, Anthropic y Ollama.

## Casos de uso

- Asistente conversacional local en un Mac: con 16,3 GB de pesos en Q4 y una ventana de contexto no especificada, el modelo puede atender conversaciones multi-turno sin salir del equipo, util para entornos con requisitos de privacidad.
- Analisis de imagenes con descripcion y razonamiento: enviar una fotografia como `image_url` y pedir una explicacion detallada, aprovechando el modo thinking para tareas de inspeccion visual.
- Automatizacion con tool calling: integrar el modelo en un flujo de agentes que llame a APIs externas a traves de `mlx_lm.server` o Kapitsa, con salida estructurada de llamadas a funciones.
- Razonamiento matematico asistido: el modo thinking con `reasoning_effort` ajustable permite resolver problemas paso a paso y desactivar el razonamiento cuando se prioriza la latencia.
- Prototipado de aplicaciones de IA en macOS: usar la API compatible con OpenAI en el puerto 8080 para desarrollar y probar integraciones antes de migrar a infraestructura en la nube.
- Servicio de inferencia interno en un equipo de sobremesa: Kapitsa expone endpoints compatibles con OpenAI, Anthropic y Ollama, lo que permite sustituir un proveedor externo por un modelo local en herramientas ya existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la divergencia KL respecto al BF16 del modelo base:

| Checkpoint | Tamano | KL a BF16 | Bits por peso |
|---|---|---|---|
| Q4 | 16,3 GB | 0,035 | 4 uniforme |
| Q5 | 20,7 GB | 0,022 | ~5,3 (5,8 con escalas) |

## Requisitos de hardware

- Q4: 16,3 GB de pesos; recomendado un Mac con 32 GB de RAM unificada o mas.
- Q5: 20,7 GB de pesos; recomendado un Mac con 48 GB de RAM unificada o mas.
- La regla de la model card asume que macOS asigna por defecto aproximadamente dos tercios de la RAM a la GPU y anade 2 GB para la conversacion; es una estimacion, no una medicion.
- Kapitsa puede omitir partes que no usa y encajar en una categoria de RAM inferior; `kapitsa doctor` comprueba un Mac concreto.
- Despliegue: MLX (`mlx_lm.generate`, `mlx_lm.server` en el puerto 8080), Kapitsa (puerto 8000, APIs OpenAI, Anthropic y Ollama) y LM Studio.
- Latencia y throughput: no disponibles.
- No esta pensado para GPUs NVIDIA ni para vLLM, TGI o llama.cpp; el formato es MLX para Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX Q4 | 27,36 B | no disponible | MLX safetensors | Apache 2.0 | KL 0,035; 16,3 GB |
| mlx-community 4-bit (Qwen3.8-27B) | 27,36 B | no disponible | MLX | Apache 2.0 | KL 0,054; mismo tamano de pesos segun la model card |
| mlx-works oQ4e-mtp (Qwen3.8-27B) | 27,36 B | no disponible | MLX | Apache 2.0 | Decodificacion especulativa; KL no disponible |
| lmstudio-community 4-bit (Qwen3.8-27B) | 27,36 B | no disponible | MLX | Apache 2.0 | KL no disponible |

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros runtimes sin reconversion.
- La cuantizacion introduce divergencia respecto al BF16 (KL 0,035 en Q4, 0,022 en Q5); tareas sensibles a la precision pueden degradarse.
- La model card advierte que solo los ejemplos de chat, vision y tool calling se probaron en este pack de 27B; el resto de ejemplos se validaron en el pack de 9B.
- No hay informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico del modelo.
- La longitud de contexto no esta documentada en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.
- El modo thinking esta activado por defecto y consume tokens adicionales; en produccion conviene desactivarlo o limitar `reasoning_effort` para controlar la latencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Instalacion de Kapitsa via Homebrew: `brew install nace-ai/tap/kapitsa`
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
