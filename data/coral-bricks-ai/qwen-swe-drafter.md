# coral-bricks-ai/qwen-swe-drafter

## Resumen

qwen-swe-drafter es un modelo borrador (drafter) de decodificacion especulativa publicado por coral-bricks-ai para el modelo objetivo Qwen/Qwen3.6-35B-A3B-FP8. No sustituye al modelo base: propone tokens candidatos que el objetivo verifica uno a uno, de modo que la correccion de la salida no cambia. Su funcion es acelerar la inferencia en cargas de trabajo de ingenieria de software y tráfico agentico.

Usa la arquitectura DFlash2DraftModel, con 6 capas, block size 8 y 8 target taps en las capas [1,6,11,16,22,27,32,37] del modelo objetivo. Tiene 526.251.520 parametros (~526 M) en BF16 y una ventana de draft de 8192 tokens. Se entreno con un unico pase sobre 33.868 turnos no vistos de SWE code-write, agentic support y Open-SWE.

El modelo es relevante porque permite reducir la latencia del objetivo sin reentrenarlo ni alterar su comportamiento, y porque esta especializado en el dominio SWE/agentico, donde la tasa de aceptacion de un drafter generico suele ser menor. La licencia Apache 2.0 facilita su integracion en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (drafter de decodificacion especulativa), 6 capas, block size 8, 8 target taps [1,6,11,16,22,27,32,37] |
| Parametros totales | 526.251.520 (~526 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de draft de 8192 tokens |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan GGUF, AWQ ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Modelo objetivo | Qwen/Qwen3.6-35B-A3B-FP8 |
| Token de mascara | 248077 (segun config.json) |

## Arquitectura y entrenamiento

DFlash2DraftModel es un drafter para decodificacion especulativa: en cada paso propone un bloque de hasta 8 tokens candidatos y el modelo objetivo los verifica en paralelo, aceptando solo los que coinciden con su propia distribucion. Al no modificar los pesos del objetivo, la salida final es identica a la que produciria el objetivo sin drafter; el beneficio es de latencia y throughput, no de calidad. El drafter toma representaciones de 8 capas intermedias del objetivo (taps en [1,6,11,16,22,27,32,37]) y usa una ventana de draft de 8192 tokens.

El entrenamiento consistio en un unico pase sobre 33.868 turnos no vistos procedentes de SWE code-write, agentic support y Open-SWE, con soft-label weight de 0.50, learning rate de 1e-4 y 1048 pasos. El modelo se inicializo con warm start desde un checkpoint intermedio de drafter Qwen3.6 en el paso 500. Los pesos se publican en BF16 (~1.05 GB) y la configuracion incluye el token de mascara 248077.

## Capacidades

- Propuesta de tokens candidatos para decodificacion especulativa sobre Qwen/Qwen3.6-35B-A3B-FP8.
- Aceleracion de inferencia sin alterar la correccion del modelo objetivo: cada token propuesto se verifica.
- Especializacion en codigo y flujos agenticos (SWE code-write, agentic support, Open-SWE), lo que favorece la tasa de aceptacion en ese dominio.
- Integracion con SGLang en produccion, con playbook de serving para una H100.
- Bloques de draft de 8 tokens y ventana de draft de 8192 tokens.
- No genera texto de forma autonoma: su salida son propuestas que el objetivo acepta o rechaza.
- No se documentan capacidades de tool calling, vision, audio ni multilingues propias del drafter; dependen del modelo objetivo.

## Casos de uso

- Aceleracion de generacion de codigo en produccion: el drafter propone bloques de 8 tokens que Qwen3.6-35B-A3B-FP8 verifica, reduciendo la latencia por token en tareas de escritura de codigo sin cambiar la salida final.
- Asistentes agenticos multi-step: en bucles de razonamiento y llamadas a herramientas, el drafter entrenado con trafico agentico mantiene tasas de aceptacion altas y recorta el coste por paso.
- Revisión y parcheo automatizado en CI/CD: para generar diffs y parches sobre repositorios, la ventana de draft de 8192 tokens permite procesar fragmentos de codigo y contexto de issue en una sola pasada.
- Autocompletado en IDE: al ser un modelo de ~526 M en BF16 (~1 GB), puede acompanar al objetivo en un servidor de inferencia y reducir el tiempo percibido en sugerencias de codigo.
- Soporte tecnico con contexto largo: conversaciones multi-turno de ingenieria que caben en la ventana de draft de 8192 tokens se benefician de la aceleracion sin perder coherencia, ya que el objetivo verifica cada token.
- Despliegue en una sola H100: el playbook SERVE.md documenta el serving con SGLang (imagen CUDA 13 y fallback CUDA 12.9, flags requeridos), lo que facilita montar un endpoint acelerado con el objetivo FP8.
- Evaluacion interna de decodificacion especulativa: util para medir tasa de aceptacion y speedup frente a drafters genericos en un dominio concreto antes de adoptarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog de CoralBricks para las mediciones, pero los valores numericos no se incluyen en la informacion proporcionada, por lo que no se presentan cifras de MMLU, HumanEval, GSM8K ni de speedup.

## Requisitos de hardware

- Drafter: ~526 M de parametros en BF16, ~1.05 GB de pesos; cabe holgadamente en cualquier GPU consumer (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090).
- Modelo objetivo: Qwen3.6-35B-A3B-FP8; por el nombre, 35B totales y 3B activos en FP8, lo que implica del orden de 35 GB solo en pesos mas KV cache, por lo que no cabe en GPUs consumer de 24 GB en esa configuracion.
- GPU recomendada: una H100 para servir drafter y objetivo conjuntamente, segun el playbook del autor.
- Opciones de despliegue: SGLang (stock), con imagen CUDA 13 y fallback CUDA 12.9; los flags requeridos, el dimensionado y la resolucion de problemas estan en SERVE.md.
- Latencia y throughput: no disponibles en la informacion proporcionada; las mediciones se remiten al blog del autor.
- No se documentan opciones de despliegue con llama.cpp, Ollama, TGI ni vLLM para este drafter.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-swe-drafter (este) | Drafter de decodificacion especulativa DFlash2 | ~526 M | 8192 (ventana de draft) | Apache 2.0 | HuggingFace |
| Drafters EAGLE-2 / EAGLE-3 | Drafter de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible en la informacion |
| Cabezas Medusa | Cabezas de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible en la informacion |
| Qwen3.6-35B-A3B-FP8 (objetivo) | LLM (MoE segun el nombre, 35B-A3B) | no disponible en la informacion (el nombre indica 35B-A3B) | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a tipo de modelo, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: solo propone tokens; sin el objetivo Qwen3.6-35B-A3B-FP8 no produce respuestas utiles.
- No mejora la calidad ni corrige alucinaciones del objetivo; la correccion depende exclusivamente de la verificacion del target.
- Entrenado para SWE y trafico agentico; en otros dominios (legal, medico, conversacion general) la tasa de aceptacion puede caer y el speedup reducirse.
- Ventana de draft de 8192 tokens; contextos mas largos no estan cubiertos por el diseno publicado.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingue del drafter.
- Requiere SGLang y flags especificos; no es plug-and-play con llama.cpp, Ollama, TGI o vLLM segun la informacion disponible.
- La licencia Apache 2.0 cubre el drafter, pero el uso comercial debe verificar tambien la licencia del modelo objetivo Qwen3.6-35B-A3B-FP8.
- Sin descargas ni likes en el momento de la consulta y sin resultados de benchmarks publicos en la informacion disponible; falta validacion independiente.
- El repositorio se creo y actualizo el 2026-10-26; la madurez y el soporte a largo plazo no estan contrastados.

## Enlaces

- [HuggingFace: coral-bricks-ai/qwen-swe-drafter](https://huggingface.co/coral-bricks-ai/qwen-swe-drafter)
- [Blog: Speculative decoding for Qwen3.6 on CoralBricks](https://www.coralbricks.ai/blog/speculative-decoding-qwen36)
- [SERVE.md (playbook de serving)](https://huggingface.co/coral-bricks-ai/qwen-swe-drafter/blob/main/SERVE.md)
- [Modelo base: Qwen/Qwen3.6-35B-A3B-FP8](https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8)
- Las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a entidades no relacionadas.
