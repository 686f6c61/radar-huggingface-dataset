# dealignai/Qwen3.8-Flash-Next-UNCENSORED-FP8

## Resumen

Qwen3.8-Flash-Next-UNCENSORED-FP8 es una modificacion a nivel de pesos del modelo multimodal Qwen/Qwen3.8-Flash-Next, desarrollada por dealignai, que elimina los mecanismos de rechazo (refusal) del modelo original mediante la tecnica de abliteration. No se trata de un fine-tuning ni de un jailbreak por prompt: el cambio reside en los propios pesos, por lo que funciona con la plantilla de chat estandar y el prompt de sistema por defecto. El modelo base, Qwen3.8-Flash-Next, es un MoE multimodal de 180.000 millones de parametros (125B principales + 51B de embeddings N-gram) con 6B activos por token, que sirve como preview de la arquitectura Qwen4, combinando Gated DeltaNet y Gated Attention. Esta version en FP8 conserva el razonamiento configurable (low/medium/xhigh), la decodificacion especulativa MTP y la multimodalidad (imagen y video), con una ventana de contexto de 262.000 tokens.

La relevancia de este modelo radica en que ofrece una alternativa sin censura para investigacion en alineacion y seguridad, manteniendo la capacidad del modelo base con una perdida minima en MMLU (86,36 % a 83,86 %, -2,50 puntos porcentuales). El autor reporta un cumplimiento del 100 % en HarmBench-320 con razonamiento activado, lo que indica que la eliminacion de rechazo no degrada la capacidad de seguir instrucciones de seguridad cuando se requiere. Esta pensado para entornos de investigacion y desarrollo donde se necesita explorar los limites de los modelos de lenguaje sin las restricciones habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (Gated DeltaNet + Gated Attention), preview de Qwen4 |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | FP8 (esta version); el base tambien disponible en otras precisiones |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (FP8), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE hibrida que combina Gated DeltaNet (una capa de atencion lineal con estado recurrente) y Gated Attention, disenada como preview de la arquitectura Qwen4. El modelo principal tiene 125.000 millones de parametros, complementados por 51.000 millones de parametros de embeddings N-gram, activando solo 6.000 millones por token. Esta combinacion permite un procesamiento eficiente de secuencias largas (262K de contexto) con un coste computacional reducido en inferencia. El entrenamiento del base incluyo fases de preentrenamiento y alineacion con RLHF, aunque los detalles especificos del dataset no se han publicado en la informacion disponible.

La modificacion de dealignai consiste en una abliteration: se identifican y eliminan las direcciones en el espacio de activaciones que correlacionan con comportamientos de rechazo, sin reentrenar el modelo. Esto preserva el conocimiento, el estilo y la calibracion del base, pero elimina la tendencia a negarse a responder ciertas peticiones. El autor confirma que no se usaron LoRA, distillation ni datos sinteticos. La decodificacion especulativa MTP (Multi-Token Prediction) se mantiene intacta, con una tasa de aceptacion de borradores de aproximadamente el 81 % (1,8x de eficiencia de borrador).

## Capacidades

- Generacion de texto y razonamiento con esfuerzo configurable: modos low, medium y xhigh, controlables via `chat_template_kwargs` en vLLM.
- Multimodalidad completa: procesamiento de imagenes y video, ademas de texto.
- Decodificacion especulativa MTP integrada, que acelera la inferencia sin perder calidad.
- Soporte de tool calling y function calling (heredado del base, aunque no se detalla en la model card).
- Capacidades de agente y razonamiento multi-paso, reforzadas por el modo de razonamiento xhigh.
- Multilingue: no se especifican idiomas concretos, pero el base Qwen soporta un amplio abanico de lenguas.
- Sin mecanismos de rechazo: responde a peticiones que el modelo base bloquearia, incluyendo contenido explicito o controvertido.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: permite estudiar como se comportan los modelos sin salvaguardas, comparando con el base para entender los mecanismos de rechazo y disenar mejores tecnicas de alineacion.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido artistico que requiera explorar temas tabu o explicitos sin filtros automaticos.
- Analisis de contenido sensible: procesamiento de textos medicos, legales o historicos que contengan descripciones graficas o temas delicados, donde el rechazo del modelo base impediria el analisis.
- Evaluacion de robustez de sistemas de moderacion: probar clasificadores de contenido o filtros de seguridad enfrentandolos a un modelo que no se autocensura.
- Desarrollo de agentes conversacionales para entornos controlados: chatbots de rol o simulaciones donde se necesita una respuesta sin restricciones, siempre bajo supervision humana.
- Benchmarking de capacidades en escenarios adversariales: medir hasta que punto un modelo sin rechazo mantiene la calidad de razonamiento, codigo o matematicas en peticiones que el base rechazaria.

## Benchmarks y rendimiento

El autor proporciona datos de MMLU (40 preguntas por materia, 2.280 preguntas en total) comparando el base con esta version, y resultados de HarmBench-320 (comportamientos realmente daninos, decodificacion greedy, temperatura 0).

| Benchmark | Base Qwen3.8-Flash-Next | Este modelo | Diferencia |
|---|---|---|---|
| MMLU (overall) | 86,36 % | 83,86 % | -2,50 pp |
| HarmBench-320 (greedy, reasoning low) | no disponible | 100 % | - |
| HarmBench-320 (greedy, reasoning xhigh) | no disponible | 99,6 % | - |
| HarmBench-320 (greedy, reasoning off) | no disponible | 97,1 % | - |

En MMLU por categorias, las mayores caidas se dan en moral scenarios (-10 pp), professional accounting (-10 pp) y machine learning (-8 pp), mientras que algunas materias mejoran ligeramente (high school chemistry +5 pp, computer security +3 pp). La perdida global de 2,5 puntos porcentuales se considera aceptable para una modificacion de pesos sin reentrenamiento. No se han publicado resultados de otros benchmarks como HumanEval, GSM8K o MMMU en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 222,6 GB en FP8. Con 180.000 millones de parametros en FP8, se necesitan aproximadamente 180 GB solo para los pesos, mas overhead de activaciones y KV cache. En la practica, se requieren al menos 2 GPU con 80 GB cada una (p. ej., 2x H100) o 2x DGX Spark (128 GB de memoria unificada cada una).
- GPU recomendadas: Hopper (H100) o Blackwell (B200) para FP8 nativo. No es viable en GPUs de consumo como RTX 4090 (24 GB) o RTX 5090 (32 GB) por falta de memoria.
- Opciones de despliegue: vLLM es la libreria principal, con `tensor_parallel_size=2` y `trust_remote_code=True`. Tambien se puede usar llama.cpp u Ollama si se convierte a GGUF, aunque no se ha verificado para esta version.
- Latencia y throughput: no se han publicado datos concretos. La decodificacion especulativa MTP (~81 % de aceptacion) reduce el numero de pasos de decodificacion, mejorando el throughput respecto a una generacion autoregresiva estandar.
- Nota: el modelo base puede ejecutarse en dispositivos con 78 GB de RAM/unified memory sin GPU VRAM segun unsloth, pero esta version FP8 no ha sido probada en ese escenario.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MMLU | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~180B | 6B | 262K | 86,36 % | qwen-community-license-1.0 |
| Este modelo (UNCENSORED FP8) | ~180B | 6B | 262K | 83,86 % | qwen-community-license-1.0 |
| Qwen3-235B-A22B (referencia) | 235B | 22B | 32K | ~81 % | qwen-community-license-1.0 |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | ~88 % | deepseek-license |

La comparativa con Qwen3-235B-A22B y DeepSeek-V3 es orientativa, ya que no se han ejecutado los mismos harness en este modelo. La principal diferencia con el base es la eliminacion del rechazo, con una perdida de 2,5 pp en MMLU. Frente a otros modelos "uncensored" del mercado, este destaca por ser una modificacion directa de pesos sin fine-tuning, lo que preserva mejor las capacidades originales.

## Limitaciones y advertencias

- Al ser una version sin censura, puede generar contenido danino, ilegal o eticamente problematico si se usa de forma malintencionada. El autor lo presenta como herramienta de investigacion, no para uso general.
- La perdida de 2,5 pp en MMLU indica una ligera degradacion en conocimiento general, especialmente en areas como moral scenarios (-10 pp) y professional accounting (-10 pp).
- Con razonamiento desactivado y decodificacion greedy, el cumplimiento de HarmBench baja al 97,1 %, dejando un 2,9 % de comportamientos daninos que podrian ejecutarse.
- La licencia qwen-community-license-1.0 puede imponer restricciones de uso comercial o de redistribucion; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- Requiere hardware de gama alta (H100/B200 o DGX Spark) y no es desplegable en GPUs de consumo, lo que limita su accesibilidad.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante ataques adversariales en esta version.
- La fecha de creacion (2026-08-27) es posterior a la fecha actual, lo que sugiere que el modelo podria ser un artefacto de una linea temporal alternativa o un error en los metadatos; se recomienda verificar su disponibilidad real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Qwen3.8-Flash-Next-UNCENSORED-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Recetas vLLM para el base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Version ABLITERATED (variante similar): https://huggingface.co/dealignai/Qwen3.8-Flash-Next-ABLITERATED-FP8
- Anuncio en X de dealignai: https://x.com/dealignai/status/2092851180841865649
