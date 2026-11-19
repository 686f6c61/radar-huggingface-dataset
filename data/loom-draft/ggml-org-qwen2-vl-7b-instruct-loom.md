# loom-draft/ggml-org-Qwen2-VL-7B-Instruct-loom

## Resumen

`loom-draft/ggml-org-Qwen2-VL-7B-Instruct-loom` es un paquete de despliegue para el runtime Loom de AMD, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `Qwen2-VL-7B-Instruct-Q4_K_M.gguf` (procedente de `ggml-org/Qwen2-VL-7B-Instruct-GGUF`) en forma de programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` sin intervención de un LLM en el bucle. El objetivo es ejecutar el modelo sobre las GPU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante `loom-serve`, que expone una API compatible con `/v1/chat/completions` de OpenAI.

El modelo subyacente es Qwen2-VL-7B-Instruct, un transformer multimodal de aproximadamente 7 mil millones de parámetros desarrollado por el equipo Qwen (Alibaba), con capacidad de entrada de imagen y contexto de 32.768 tokens por petición en esta configuración. La relevancia de este paquete es acotada: sirve como artefacto de referencia para validar el soporte de Loom sobre hardware AMD reciente, no como una distribución generalista del modelo.

Conviene subrayar que el paquete **no soporta entrada de imagen** en Loom, aunque el modelo original sí la tiene; además, las mediciones de rendimiento y las puertas de corrección aparecen como «not yet re-measured» en la model card, por lo que no hay evidencia publicada de rendimiento ni de paridad numérica con llama.cpp en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL); empaquetado como programas Loom generados |
| Parametros totales | ~7 mil millones (modelo base Qwen2-VL-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (único checkpoint empaquetado) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen2-VL-7B-Instruct-Q4_K_M.gguf`) más artefactos propietarios `program/*.loom`, `weights.loom`, `model.json`, `tokenizer.json`, `llm_config.json`, `info.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Tool calling | no soportado («not applicable») |
| Decodificación especulativa | no soportada («not applicable») |
| Entrada de imagen | no soportada en Loom (el modelo original sí la tiene) |
| Entrada/salida de audio | no soportada |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2-VL-7B-Instruct, es un transformer multimodal de la familia Qwen2-VL que procesa texto e imágenes mediante un proyector visual conectado a un LLM de ~7B parámetros. Esta ficha no dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original; esa información no está incluida en la documentación proporcionada y debe consultarse en la model card oficial de Qwen2-VL.

El paquete Loom en sí no reentrena ni modifica los pesos: toma el GGUF Q4_K_M tal cual y genera, mediante `loom-next`, un conjunto de kernels y programas (`.loom`) específicos para las arquitecturas AMD gfx1151 y gfx1201, junto con un `model.json` que fija el pool de memoria, el modo de precarga de parámetros y el tamaño de contexto. La model card describe un conjunto de puertas de validación (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp sobre el mismo GGUF, pero **ninguna de ellas tiene medición registrada** para este paquete en el momento de la publicación.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con `/v1/chat/completions` de OpenAI.
- Contexto de 32.768 tokens por petición, adecuado para documentos largos en formato texto.
- Hasta 4 peticiones concurrentes con `--pool_backing=fixed`.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- **Sin soporte de tool calling ni function calling** en Loom («not applicable»).
- **Sin modo de razonamiento/thinking** ni control de esfuerzo de razonamiento.
- **Sin decodificación especulativa**.
- **Sin entrada de imagen** en Loom, pese a que el modelo Qwen2-VL original es multimodal.
- **Sin entrada ni salida de audio**.
- Soporte multilingüe: no disponible en la información proporcionada (heredado del modelo base, no documentado aquí).

## Casos de uso

- **Validación de la cadena de herramientas Loom sobre GPU AMD**: usar este paquete como referencia para comprobar que `loom-fetch` y `loom-serve` funcionan correctamente en Strix Halo o R9700 antes de desplegar modelos mayores. El paquete incluye `info.json` con versiones y evidencia de puertas, lo que facilita la trazabilidad.
- **Servicio de chat de texto en local sobre hardware AMD de consumo/prosumer**: desplegar `loom-serve` con el preset `chat` para ofrecer un endpoint compatible con OpenAI a 32k de contexto y 4 peticiones concurrentes, sin depender de CUDA ni de servicios en la nube.
- **Procesamiento de documentos largos en texto**: con 32.768 tokens de contexto, el modelo puede resumir contratos, informes o transcripciones de hasta decenas de miles de palabras en una sola petición, siempre que se acepte el límite de 4.096 tokens de salida.
- **Prototipado de asistentes conversacionales multi-turno**: la API estilo OpenAI permite integrar el endpoint en frameworks existentes (LangChain, LlamaIndex, clientes OpenAI) sin adaptadores propietarios, útil para demos internas en entornos AMD.
- **Evaluación comparativa frente a llama.cpp**: el paquete está diseñado para compararse token a token contra llama.cpp sobre el mismo GGUF (puertas `compare`, `golden`, `logits`), lo que lo hace apropiado para estudios de paridad numérica de kernels.
- **Banco de pruebas de concurrencia**: con 4 peticiones simultáneas y la puerta `consistency`, sirve para verificar que las respuestas concurrentes coinciden con las ejecuciones aisladas en el runtime Loom.
- **Despliegue en Radeon AI PRO R9700 (32 GB)**: la VRAM de la tarjeta permite cargar el GGUF Q4_K_M completo con margen para el pool de memoria fijo, lo que facilita pruebas de estabilidad en estación de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) **no se han vuelto a medir** («the results for this package are not yet re-measured»), y todas las puertas de corrección aparecen como «not yet re-measured». No se dispone de cifras de MMLU, HumanEval, GSM8K, throughput ni latencia para este paquete.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint es Q4_K_M de un modelo de ~7B parámetros; el peso de los tensores ronda los 4-5 GB, aunque la cifra exacta no está publicada en la información disponible. A ello hay que sumar el pool de memoria fijo que reserva `--pool_backing=fixed` y el contexto de 32k tokens (KV cache).
- **GPU soportadas oficialmente por el paquete**: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- **GPU no soportadas**: no hay mención a NVIDIA, Apple Silicon ni otras GPU AMD en la documentación; el paquete está atado a las arquitecturas gfx1151 y gfx1201.
- **¿Cabe en GPU de consumo?**: sí, en el sentido de que Strix Halo es un APU de consumo/prosumer con memoria unificada; en R9700 (32 GB) sobra espacio para el Q4_K_M y el contexto. No se documenta compatibilidad con tarjetas de consumo tipo RX 7900 o RTX 4090.
- **Opciones de despliegue**: únicamente `loom-serve` de `hrx-loom[hf]==0.2.0` según la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este paquete (aunque el GGUF subyacente sí podría usarse con llama.cpp, eso queda fuera de lo que describe la tarjeta).
- **Latencia y throughput**: no disponibles; las filas de rendimiento de la model card están pendientes de re-medición.
- **Flags relevantes de `loom-serve`**: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa para completions de GPU), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (solo afecta a la carga de pesos en host).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Runtime documentado | Notas |
|---|---|---|---|---|---|---|
| **Este paquete** (Qwen2-VL-7B-Instruct Q4_K_M en Loom) | ~7B | 32.768 | No en Loom (sí en el original) | Apache 2.0 | `loom-serve` (AMD gfx1151/gfx1201) | Sin benchmarks ni puertas medidas |
| `ggml-org/Qwen2-VL-7B-Instruct-GGUF` (modelo base) | ~7B | no disponible en la información | Sí (texto + imagen) | Apache 2.0 | llama.cpp y derivados | Checkpoint de referencia; el paquete Loom lo envuelve sin modificar |
| Qwen2-VL-7B-Instruct (original, transformers) | ~7B | no disponible en la información | Sí | Apache 2.0 | transformers, vLLM, TGI | Modelo completo con visión; referencia de capacidades |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- **Sin benchmarks ni puertas de corrección medidas**: todas las puertas (`golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) aparecen como «not yet re-measured». No hay evidencia publicada de que la salida coincida con llama.cpp en este paquete concreto.
- **Pérdida de capacidad multimodal**: el modelo original acepta imágenes, pero Loom no las soporta en esta integración. Si se necesita visión, hay que usar el GGUF directamente con otro runtime.
- **Sin tool calling ni function calling**: descarta su uso en pipelines de agentes que dependan de llamadas a herramientas.
- **Sin modo thinking ni decodificación especulativa**: no se puede activar razonamiento extendido ni acelerar la generación por especulación.
- **Alcance de hardware muy restringido**: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No hay soporte declarado para NVIDIA, Apple Silicon ni otras GPU AMD.
- **Contexto limitado a 32k** por petición, con salida máxima de 4.096 tokens; insuficiente para tareas que requieran respuestas muy largas o contextos mayores.
- **Concurrencia baja** (4 peticiones simultáneas), lo que limita su uso como servicio multiusuario.
- **Riesgo de alucinación**: inherente al modelo base Qwen2-VL-7B-Instruct; no hay evaluación específica publicada en este paquete. Los sesgos del modelo base tampoco están documentados en la información proporcionada.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene verificar las condiciones del runtime Loom (`hrx-loom`) y del GGUF original por separado, ya que la tarjeta solo declara la licencia del modelo.
- **Paquete sin tracción**: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción por terceros.
- **Fecha de creación futura** (2026-11-19) en los metadatos de Hugging Face; conviene verificar la vigencia del paquete antes de adoptarlo.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-draft/ggml-org-Qwen2-VL-7B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen2-VL-7B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
