# 0xlean/Qwen3.8-27B-OpenCode-MLX-Q4

## Resumen

Qwen3.8-27B OpenCode MLX Q4 es un checkpoint cuantizado de 27.356.728.560 parametros derivado de Qwen/Qwen3.8-27B, al que se le ha fusionado un LoRA entrenado por harness-hub para tareas de programacion con el agente OpenCode. La conversion a formato MLX en 4 bits (afin, group size 64) la ha realizado de forma independiente el usuario 0xlean, con el objetivo de permitir inferencia local en Apple Silicon. El resultado ocupa unos 16,1 GB en disco y esta pensado para ejecutarse en equipos con memoria unificada de 32 GB o superior.

El modelo resuelve un problema concreto: llevar un LLM de 27B especializado en codigo a un Mac sin GPU dedicada, usando el stack MLX de Apple. El autor valida el checkpoint en un M2 Max de 32 GB con `mlx-lm==0.32.2`, y publica instrucciones de despliegue con `mlx_lm.server` y configuracion para OpenCode y LM Studio. La licencia es Apache 2.0, heredada del modelo base.

La relevancia es doble: por un lado, demuestra el flujo completo de merge de LoRA, conversion a MLX y validacion local con trazabilidad de revisiones fijadas; por otro, documenta honestamente que en un piloto sintetico de cinco tareas la version fusionada paso 4/5 frente a 5/5 del base cuantizado equivalente, lo que invita a tratar el resultado con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun tag `qwen3_5`); incluye tensores MTP en el checkpoint base, no exportados en esta release |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; la configuracion de ejemplo de OpenCode limita a 8192 tokens de contexto y 1024 de salida |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64; KV cache cuantizada a 4 bits (`--kv-bits 4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.5 con 27,36B parametros. Sobre el se aplico un LoRA entrenado por harness-hub (`harness-hub/Qwen3.8-27B-opencode-adapted`) orientado al uso con OpenCode. El proceso de merge, descrito en la model card, procesa un shard cada vez, calcula la actualizacion LoRA en float64 sobre CPU y almacena los pesos fusionados en BF16; la actualizacion se aplica a 256 proyecciones de texto. El script empareja el prefijo completo del language model porque el checkpoint base contiene tensores MTP con nombres de capa solapados.

Tras el merge, el checkpoint BF16 se convierte una sola vez a MLX affine 4-bit con group size 64, usando MLX 0.32.4 y mlx-vlm 0.7.11 sobre un M2 Max de 32 GB. No se documenta el volumen de tokens de entrenamiento del LoRA, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se exporta el modulo MTP nativo en esta release, y la vision no ha sido evaluada.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante `text-generation` y pipeline conversacional.
- Asistencia a programacion en el contexto del agente OpenCode, con el LoRA ya fusionado.
- Servidor local compatible con API OpenAI (`mlx_lm.server` expone `/v1`), integrable con clientes que hablen ese protocolo.
- Modo thinking configurable: la plantilla de chat admite `enable_thinking` y el autor lo desactiva en su configuracion de referencia.
- Cuantizacion de KV cache en 4 bits para reducir el consumo de memoria en contextos largos.
- Soporte de prompt caching (`--prompt-cache-bytes`) y prefill por pasos (`--prefill-step-size 128`).
- Capacidades multilingues: no disponibles.
- Tool calling, function calling y razonamiento multi-paso: no documentados en la informacion disponible.
- Vision: no evaluada en esta release.

## Casos de uso

- Programacion asistida en local con OpenCode: el checkpoint se carga con `mlx_lm.server` y se registra como proveedor local en `opencode.json`; el LoRA fusionado esta orientado especificamente a ese flujo de trabajo.
- Desarrollo en Mac sin GPU dedicada: con 15,435 GB de pico de memoria reportado en un prompt corto sobre M2 Max de 32 GB, permite trabajar con un modelo de 27B en memoria unificada.
- Prototipado de agentes de codigo offline: al exponer una API compatible con OpenAI en `127.0.0.1:18765`, se puede conectar cualquier cliente que acepte `baseURL` y `apiKey` ficticia.
- Evaluacion de pipelines de cuantizacion: el repositorio incluye `REPRODUCE.md` y `SHA256SUMS`, lo que permite reproducir el merge y la conversion paso a paso para auditar el proceso.
- Integracion en LM Studio: la model card indica colocar el directorio completo en `<models-directory>/local/qwen3.8-27b-opencode-mlx-q4/`, lo que facilita probar el modelo con interfaz grafica.
- Comparacion de variantes base frente a fusionada: el piloto sintetico de cinco tareas documentado en `EVALUATION.md` sirve como plantilla para evaluar si el LoRA aporta valor en un dominio concreto antes de adoptarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de evaluacion es un piloto sintetico interno de OpenCode con cinco tareas:

| Variante | Tareas superadas | Notas |
|---|---|---|
| Qwen3.8-27B OpenCode MLX Q4 (fusionado) | 4/5 | Piloto sintetico de cinco tareas |
| Base Q4 equivalente (sin LoRA) | 5/5 | Misma configuracion de comparacion |

El autor advierte que las limitaciones de esta comparacion se detallan en `EVALUATION.md` y que no se ha comparado tensor a tensor con otras conversiones publicadas.

## Requisitos de hardware

- Memoria: pico de 15,435 GB reportado por MLX en un prompt corto con el checkpoint de 15 GiB; se recomienda un equipo con 32 GB de memoria unificada como el M2 Max usado en la validacion.
- Espacio en disco: aproximadamente 16,1 GB para el repositorio completo.
- GPU: exclusivamente Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra). No hay soporte CUDA en esta release.
- GPU consumer: si, en Mac con memoria unificada suficiente; no aplica a RTX 4090 ni a GPU NVIDIA, ya que el formato es MLX.
- Despliegue: `mlx_lm.server` (probado con `mlx-lm==0.32.2`), LM Studio colocando el directorio en la ruta indicada. vLLM, llama.cpp, Ollama y TGI no son compatibles con pesos MLX.
- Latencia y throughput: no disponibles; el autor no publica medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B OpenCode MLX Q4 (este) | 27,36B | no disponible (ejemplo a 8192) | MLX 4-bit | Apache 2.0 | LoRA OpenCode fusionado, solo Apple Silicon |
| Qwen/Qwen3.8-27B (base) | 27,36B | no disponible | safetensors BF16 | Apache 2.0 | Sin LoRA; requiere mas memoria |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,36B | no disponible | safetensors + LoRA | no disponible | Adaptador LoRA sin fusionar |
| Otras conversiones MLX de Qwen3.8-27B | 27,36B | no disponible | MLX | variable | El autor no las ha comparado tensor a tensor |

## Limitaciones y advertencias

- El piloto interno de cinco tareas muestra 4/5 en la version fusionada frente a 5/5 en el base cuantizado, por lo que el LoRA no garantiza mejoras y podria degradar el rendimiento en algunos casos.
- No se exporta el modulo MTP nativo del checkpoint base, lo que puede afectar a la decodificacion especulativa si se esperaba esa funcionalidad.
- La vision no ha sido evaluada; no debe asumirse soporte multimodal funcional.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a CPU generica sin reconversion.
- El contexto efectivo no esta documentado; la configuracion de ejemplo limita a 8192 tokens, muy por debajo de lo que suele ofrecer la familia Qwen3.5.
- No hay informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico de esta conversion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la validacion se limita a generacion de texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion comunitaria.
- La fecha de creacion indicada (2026-11-19) es futura respecto a la mayoria de referencias; conviene verificar la integridad de los pesos con `SHA256SUMS` antes de usarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/0xlean/Qwen3.8-27B-OpenCode-MLX-Q4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Instrucciones de reproduccion: `REPRODUCE.md` en el repositorio
- Checksums: `SHA256SUMS` en el repositorio
- Evaluacion: `EVALUATION.md` en el repositorio
- Atribucion y cambios: `NOTICE` en el repositorio
- Licencia: `LICENSE` en el repositorio
- OpenCode: https://opencode.ai/config.json (esquema de configuracion referenciado)
