# iromu/Gemma3-1B-tools-NVFP4

## Resumen

El modelo `iromu/Gemma3-1B-tools-NVFP4` es una version cuantizada en NVFP4 de un fine-tuning LoRA del modelo `google/gemma-3-1b-it`, especializado en tool calling y agentes. El autor, iromu, ha entrenado el modelo base con el dataset de destilacion `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation` (split `sft_tools`) para que emita llamadas a funciones estructuradas en formato JSON. La cuantizacion NVFP4 (FP4 `e2m1` con escalas FP8 `e4m3` por bloques de 16) es un formato nativo de las GPU Blackwell (sm_100+), disenado para reducir el uso de memoria y aumentar el throughput en inferencia.

El modelo tiene 651 millones de parametros, lo que lo convierte en una opcion de muy bajo coste para despliegue en edge o dispositivos con recursos limitados. Sin embargo, los datos de validacion publicados por el autor muestran una degradacion severa del rendimiento de tool calling tras la cuantizacion: el modelo NVFP4 solo consigue un 4% de coincidencia exacta de argumentos frente al 66% de la version BF16. Esto limita su utilidad practica para tareas de agente reales, aunque mantiene una velocidad de generacion alta (169 tok/s en decodificacion greedy).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B) |
| Parametros totales | 651.005.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base soporta 128K, pero el entrenamiento uso max 4096) |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 e2m1 + escalas FP8 e4m3, grupo 16) |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors (tensorrt_llm) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer autoregresivo de 1.000 millones de parametros (651M activos tras el fine-tuning, segun el conteo de safetensors) con atencion por ventanas y soporte nativo de tool calling en su version instruct. El autor aplico un fine-tuning con LoRA (dimension 32, alpha 32, dropout 0.05) sobre todas las capas lineales `*_proj`, usando el framework NVIDIA NeMo AutoModel. El entrenamiento se realizo en precision mixta bf16 durante 336 pasos (4 epocas) con un batch global de 64, una secuencia maxima de 4096 tokens y una tasa de aprendizaje de 5e-5 con decaimiento coseno. La perdida de validacion descendio de 0.579 a 0.4715 en la ultima epoca.

La cuantizacion NVFP4 se realizo con NVIDIA ModelOpt, calibrando con 32 muestras (batch 4, max 2048 tokens) del mismo dataset de entrenamiento. El formato NVFP4 es exclusivo de hardware Blackwell (GB10, DGX Spark) y no es compatible con GPUs de generaciones anteriores. El modelo incluye una plantilla de chat personalizada (`chat_template.jinja`) que renderiza los esquemas de herramientas en un turno de desarrollador y espera que las llamadas se emitan como `<tool_call>{"name": ..., "arguments": ...}</tool_call>`.

## Capacidades

- Tool calling estructurado: emite llamadas a funciones en JSON con nombre y argumentos, siguiendo el formato `<tool_call>`.
- Interacciones de agente multi-paso: entrenado para mantener conversaciones con uso de herramientas de forma iterativa.
- Generacion de texto en ingles: capacidades generales de chat y respuesta a instrucciones heredadas del base Gemma 3 1B.
- No soporta vision ni multimodalidad: es un modelo solo de texto.
- No soporta otros idiomas: el fine-tuning se realizo exclusivamente con datos en ingles.

## Casos de uso

- Asistentes de atencion al cliente en entornos con recursos limitados: el modelo puede gestionar conversaciones multi-turno y consultar APIs de pedidos o facturacion mediante tool calling, aunque su baja tasa de exito en argumentos exactos (4% en NVFP4) lo hace poco fiable para produccion real.
- Prototipos de agentes en dispositivos edge: su tamano reducido permite ejecutarlo en hardware de bajo consumo, pero la degradacion por cuantizacion obliga a validar cada llamada con un sistema externo.
- Pruebas de concepto de function calling en entornos Blackwell: sirve para evaluar el rendimiento de NVFP4 en tareas de agente antes de escalar a modelos mayores.
- Generacion de codigo con herramientas: puede invocar funciones de un IDE o CLI, aunque la precision de los argumentos es insuficiente para tareas complejas.
- Automatizacion de tareas simples en ingles: como rellenar formularios o consultar bases de datos con esquemas fijos, siempre que se valide la salida.
- Investigacion sobre cuantizacion agresiva: util para estudiar el impacto de NVFP4 en la capacidad de tool calling de modelos pequenos.

## Benchmarks y rendimiento

El autor publico una tabla de validacion de tool calling sobre el split `sft_tools` (50 muestras, decodificacion greedy, max 384 tokens nuevos). Los resultados comparan el modelo base, el fine-tuning BF16 y la version NVFP4:

| Modelo | Quant | Tool call emitido | Coincidencia de nombre | Coincidencia exacta de args | Delta vs base | tok/s |
|---|---|---|---|---|---|---|
| Gemma3-1B-tools (base) | BASE | 6/50 (12.0%) | 1/50 (2.0%) | 1/50 (2.0%) | — | 68.5 |
| Gemma3-1B-tools | BF16 | 50/50 (100.0%) | 41/50 (82.0%) | 33/50 (66.0%) | +64pp | 47.1 |
| Gemma3-1B-tools | NVFP4 | 34/50 (68.0%) | 2/50 (4.0%) | 2/50 (4.0%) | +2pp | 169.0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 651M parametros en NVFP4, los pesos ocupan aproximadamente 0.33 GB, pero con overhead de inferencia y KV cache se recomienda al menos 2 GB de VRAM.
- GPU recomendadas: exclusivamente NVIDIA Blackwell (sm_100+), como GB10 (DGX Spark) o B200. No es compatible con Ampere, Ada o Hopper.
- En GPU consumer: no, la cuantizacion NVFP4 requiere hardware Blackwell. La version BF16 original si cabria en GPUs consumer como RTX 3060 o superiores.
- Opciones de despliegue: TensorRT-LLM (unica via soportada, mediante `trtllm-serve`). No es compatible con vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: 169 tok/s en decodificacion greedy single-stream (dato del autor), aunque el throughput de servicio puede variar.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de tool calling de tamano similar (p.ej. Qwen2.5-1.5B-Instruct, Llama-3.2-1B) en la informacion proporcionada. La unica comparacion publicada es contra el propio modelo base y su version BF16, que muestra una degradacion del 62 puntos porcentuales en coincidencia exacta de argumentos al pasar a NVFP4. Se recomienda evaluar alternativas como Qwen2.5-1.5B-Instruct (licencia Apache 2.0, soporte de tool calling nativo) o Llama-3.2-1B (licencia Llama, tool calling limitado) antes de adoptar este modelo en produccion.

## Limitaciones y advertencias

- Degradacion severa por cuantizacion: el NVFP4 reduce la tasa de exito de tool calling del 66% (BF16) al 4%, lo que lo hace practicamente inutil para tareas de agente reales.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Licencia Gemma: la licencia de Google Gemma permite uso comercial, pero impone restricciones sobre el uso de los modelos para ciertos fines (p.ej. no se permite usar los outputs para entrenar otros modelos sin autorizacion). Revisar los terminos completos.
- Dependencia de hardware propietario: NVFP4 solo funciona en GPU Blackwell, lo que reduce las opciones de despliegue.
- Riesgo de alucinacion en argumentos: incluso en la version BF16, el 34% de las llamadas no coinciden exactamente con los argumentos esperados, lo que requiere validacion externa.
- Contexto limitado en entrenamiento: aunque el base soporta 128K, el fine-tuning se realizo con secuencias de 4096 tokens, por lo que el rendimiento con contextos largos no esta garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/Gemma3-1B-tools-NVFP4
- Modelo BF16 original: https://huggingface.co/iromu/Gemma3-1B-tools
- Version GGUF: https://huggingface.co/iromu/Gemma3-1B-tools-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Pagina oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Repo de Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
