# loom-draft/unsloth-Qwen3-VL-8B-Thinking-loom

## Resumen

El modelo `loom-draft/unsloth-Qwen3-VL-8B-Thinking-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `unsloth/Qwen3-VL-8B-Thinking-GGUF`, concretamente la cuantización `Qwen3-VL-8B-Thinking-Q4_K_M.gguf`. No es un modelo entrenado desde cero ni un fine-tune: es una conversión del artefacto original de Qwen3-VL-8B-Thinking para que pueda ejecutarse sobre el runtime Loom en GPUs AMD concretas.

El modelo subyacente, Qwen3-VL-8B-Thinking, es un modelo multimodal de la familia Qwen3-VL de Alibaba, con 8.000 millones de parámetros, entrada de imagen y texto, y un modo de razonamiento ("thinking") siempre activo. Este paquete está orientado al hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y a la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB), y expone una API compatible con OpenAI mediante `loom-serve`.

Su relevancia es de nicho pero concreta: permite servir un VLM de 8B con contexto de 262.144 tokens por petición, tool calling e imágenes sobre GPUs AMD de consumo y estación de trabajo mediante ROCm, sin depender de llama.cpp ni de CUDA. La licencia es Apache 2.0 y el paquete no incluye pesos modificados, sino los del GGUF original de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), con modo de razonamiento; el paquete Loom no documenta detalles internos adicionales |
| Parametros totales | 8.000 millones (según el nombre del modelo base; el paquete no aporta cifra propia) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión `mmproj-BF16.gguf` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado en programas `.loom` y `weights.loom` dentro del paquete) |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: reutiliza el checkpoint GGUF de Unsloth (`Qwen3-VL-8B-Thinking-Q4_K_M.gguf`) y genera, mediante `loom-next`, kernels y programas Loom específicos para las arquitecturas AMD objetivo (gfx1151 y gfx1201). La arquitectura efectiva es la del modelo base Qwen3-VL-8B-Thinking: un transformer multimodal con proyector de visión separado, cuantizado en Q4_K_M para los pesos del lenguaje y en BF16 para el proyector (`mmproj-BF16.gguf`).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. Tampoco se documentan innovaciones técnicas propias del paquete más allá de la generación automática de kernels y del soporte de ejecución concurrente (4 peticiones) y de tool calling en el runtime. El modo de razonamiento está siempre activo y no admite ajuste de esfuerzo de razonamiento ("reasoning effort": no aplicable). La decodificación especulativa no está soportada en este paquete.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" siempre activo.
- Entrada de imagen y texto (pipeline `image-text-to-text`), con soporte de partes `image_url` en el formato de OpenAI.
- Tool calling y function calling con esquema OpenAI (`tools` y `tool_calls`).
- Bucles de agentes multi-turno con reutilización de historial (según los gates `agent` y `agent_think_off` del benchmark, aunque sin mediciones registradas aún).
- API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Audio: no soportado.
- Decodificación especulativa: no soportada.

## Casos de uso

- Análisis de documentos con imágenes en contexto largo: con 262.144 tokens por petición, el modelo puede procesar informes escaneados, capturas o diagramas junto con texto extenso en una sola llamada, útil para auditoría documental.
- Asistentes de soporte técnico multimodal: el modelo acepta capturas de pantalla del usuario y mantiene conversaciones multi-turno con tool calling para consultar sistemas internos.
- Automatización de agentes sobre GPUs AMD: el soporte de `tools`/`tool_calls` y de 4 peticiones concurrentes permite montar pipelines de agentes en estaciones con Radeon AI PRO R9700 sin depender de CUDA.
- Extracción estructurada de información de imágenes: facturas, formularios o tickets pueden enviarse como `image_url` y procesarse con salida controlada mediante el preset de 4.096 tokens.
- Prototipado en hardware Strix Halo: desarrolladores con Ryzen AI Max+ 395 pueden servir el modelo localmente con `loom-serve` para pruebas de concepto de asistentes visuales sin infraestructura en nube.
- Evaluación comparativa de runtimes: el paquete incluye gates de corrección (`golden`, `compare`, `vision`, `agent`, `sampling`, `logits`) que permiten contrastar la salida de Loom frente a llama.cpp sobre el mismo GGUF.
- Generación de código asistida con contexto visual: el modelo puede recibir diagramas de arquitectura o mensajes de error en imagen y combinarlos con contexto textual largo para proponer parches.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" ("not yet re-measured"), y todos los gates de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran sin ejecución registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete está pensado para la Radeon AI PRO R9700 con 32 GB y para Strix Halo (memoria unificada). Un GGUF de 8B en Q4_K_M ronda habitualmente los 5-6 GB de pesos, pero el paquete no publica cifra propia.
- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para arquitecturas AMD.
- Despliegue: `loom-serve` con `hrx-loom[hf]==0.2.0`, instalado vía `pipx`; descarga con `loom-fetch` desde Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Opciones de ejecución documentadas: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp no contienen mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Runtime |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3-VL-8B-Thinking-loom | 8B (Q4_K_M) | 262.144 tokens | Imagen + texto | Apache 2.0 | Loom (AMD gfx1151/gfx1201) |
| unsloth/Qwen3-VL-8B-Thinking-GGUF (base) | 8B | no disponible en la información | Imagen + texto | Apache 2.0 | llama.cpp y otros runtimes GGUF |
| Qwen3-VL-8B-Thinking (original) | 8B | no disponible en la información | Imagen + texto | Apache 2.0 | Múltiples (transformers, vLLM, etc.) |

La comparación se limita al linaje directo del modelo, ya que la información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros fabricantes. No disponible para comparativas con modelos de otros proveedores.

## Limitaciones y advertencias

- El paquete no aporta mediciones de rendimiento ni de corrección: todos los gates figuran como "not yet re-measured", por lo que no hay evidencia publicada de paridad con llama.cpp en este artefacto.
- El modo de razonamiento está siempre activo y no es configurable; no existe ajuste de esfuerzo de razonamiento.
- No soporta decodificación especulativa ni audio.
- Límite de 4.096 tokens de salida por petición, lo que restringe respuestas muy largas.
- Concurrencia máxima de 4 peticiones, insuficiente para cargas de producción de alto volumen.
- Compatibilidad restringida a GPUs AMD gfx1151 y gfx1201; no es portable a NVIDIA ni a otras arquitecturas sin regenerar el paquete.
- El estado de muestreo figura como "not determined" en la tabla de características, lo que introduce incertidumbre sobre el comportamiento de `temperature`, `top_k` y semillas.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible; deben evaluarse de forma independiente antes de un uso en producción.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento multilingüe del modelo base antes de desplegarlo en entornos no ingleses.
- Licencia Apache 2.0: permite uso comercial, pero el paquete depende del runtime Loom (`hrx-loom`) y de sus propias condiciones, no detalladas aquí.
- El repositorio no registra descargas ni "likes", y fue creado y actualizado el mismo día: se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-VL-8B-Thinking-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-VL-8B-Thinking-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
