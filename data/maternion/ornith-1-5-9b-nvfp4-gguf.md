# maternion/Ornith-1.5-9B-NVFP4-GGUF

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9.197 millones de parámetros desarrollado por ornith-ai, presentado como el miembro más ligero de la familia Ornith-1.5. Se construye sobre Ornith-1.0 (que a su vez parte de Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales) y amplía el bucle de auto-mejora end-to-end: en lugar de depender de tareas curadas por humanos y harnesses diseñados manualmente, el modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora la política mediante aprendizaje por refuerzo. El resultado es un modelo de 9B diseñado para despliegue eficiente en una sola GPU e incluso en dispositivos móviles mediante su variante cuantizada Mobile.

El repositorio que nos ocupa, `maternion/Ornith-1.5-9B-NVFP4-GGUF`, es una conversión independiente y no oficial del checkpoint mixto `ornith-ai/Ornith-1.5-9B-NVFP4` a formato GGUF **sin descomprimir los pesos**: las capas FFN permanecen en NVFP4 (4.5 bpw) y las capas de atención en `F8_E4M3` (8 bpw), conservando sus escalas por tensor y escalas de activación estáticas. No hay recuantización, ni imatrix, ni pérdida adicional. El archivo resultante pesa 7,38 GiB y ronda los 6,6 bits por peso en conjunto, porque el embedding y la torre de visión en BF16 representan una porción importante en un modelo de 9B.

La relevancia de esta ficha es doble: por un lado documenta un modelo de razonamiento auto-mejorable de tamaño medio con licencia MIT; por otro, documenta una técnica de empaquetado GGUF que preserva tipos de almacenamiento cuantizados nativos (NVFP4 y FP8) con escalas externas, algo que requiere versiones recientes de llama.cpp y que todavía no funciona en el backend Vulkan.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5/Gemma4 según la model card); capas FFN en NVFP4 y atención en FP8 E4M3 en este checkpoint |
| Parámetros totales | 9.197.094.193 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | NVFP4 (FFN, 4.5 bpw, super-bloques de 36 B por 64 pesos), FP8 E4M3 (atención, 8 bpw), BF16 (embedding y torre de visión), F32 (escalas y normas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único `Ornith-1.5-9B-NVFP4.gguf`, 747 tensores, 7,38 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 9B. Según la model card original, Ornith-1.5 extiende Ornith-1.0 (desarrollado sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales) ampliando el bucle de auto-mejora desde la optimización de scaffold y rollout hasta la optimización conjunta de generación de tareas, construcción de scaffold y rollouts de solución. El entrenamiento combina generación automática de tareas nuevas, descubrimiento de estrategias de resolución y aprendizaje por refuerzo sobre la política. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles de RLHF/DPO más allá de la mención al bucle de RL.

El checkpoint distribuido es de precisión mixta generado con ModelOpt: `hf_quant_config.json` lista 201 capas cuantizadas, de las cuales 104 son `FP8` (proyecciones de atención, con una escala F32 por tensor y una `input_scale` F32 estática) y 97 son `W4A16_NVFP4` (proyecciones FFN, group size 16). La conversión a GGUF no requirió parchear el conversor: la mitad FP8 usa escalas por tensor (un escalar), por lo que el pase FP8 las preserva sin transformaciones específicas del modelo, y el reordenamiento de cabezas V de Qwen3.5 solo afecta a valores de peso, donde una escala escalar es independiente del orden. La mitad NVFP4 cubre solo proyecciones FFN, que no tienen reordenamiento de cabezas, y `_generate_nvfp4_tensors()` las reempaqueta directamente en el layout de super-bloques de ggml. `MIXED_PRECISION` se resuelve automáticamente a NVFP4 a partir del mapa por capas de `hf_quant_config.json`.

## Capacidades

- Generación de texto conversacional y de un solo turno (el repositorio incluye tag `conversational` y `endpoints_compatible`).
- Razonamiento y resolución de tareas: el modelo se entrena explícitamente mediante un bucle de auto-mejora con generación de tareas y rollouts de solución.
- Modelo vision-language en origen: la torre de visión está presente en BF16 en el archivo GGUF, pero **no se incluye archivo `mmproj`**, por lo que en esta conversión solo es usable la parte de texto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada; la model card menciona optimización de scaffold y rollouts, lo que sugiere orientación a tareas agénticas, pero sin confirmación de API.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- **Despliegue en una sola GPU de consumo con llama.cpp**: el archivo GGUF de 7,38 GiB cabe en GPUs con 8-12 GB de VRAM usando los backends CUDA, HIP/ROCm o Metal, lo que permite ejecutar un modelo de 9B con pesos mixtos NVFP4/FP8 sin descomprimir. Adecuado para prototipado local y estaciones de trabajo con una sola tarjeta.
- **Inferencia en dispositivos móviles o edge**: la familia Ornith-1.5 incluye una variante Mobile cuantizada, y este checkpoint de 9B en ~6,6 bits por peso es un candidato razonable para despliegues con presupuesto de memoria ajustado, siempre que el runtime soporte los tipos NVFP4/FP8 con escalas.
- **Generación de texto conversacional multi-turno**: el tag `conversational` y la pipeline `text-generation` indican uso directo en asistentes y chatbots; la ventana de contexto concreta no está documentada en esta ficha, por lo que debe validarse contra el modelo base antes de comprometer conversaciones largas.
- **Investigación sobre cuantización de precisión mixta**: el repositorio sirve como referencia reproducible de cómo empaquetar un checkpoint ModelOpt (FP8 por tensor + NVFP4 por grupo) en GGUF preservando escalas externas, útil para estudiar el impacto de 4,5/8 bpw en calidad frente a cuantizaciones uniformes.
- **Evaluación comparativa de runtimes**: al requerir llama.cpp ≥ commit `a38695013`, el archivo es útil para medir el soporte de NVFP4/FP8 con escalas en CPU, CUDA, HIP y Metal, y para documentar la brecha del backend Vulkan (que rechaza matmuls con weight scale y cae a CPU).
- **Fine-tuning o destilación sobre un base de 9B con licencia MIT**: la licencia permisiva facilita usar el modelo como base para ajuste supervisado o DPO en dominios específicos, siempre que se respete la atribución correspondiente.

## Benchmarks y rendimiento

La model card original referencia una imagen de resultados de evaluación (`ornith_9b_eval.png`) y una tabla de benchmarks que no se ha podido extraer en la información proporcionada. No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

Mediciones de inferencia reportadas por el autor de la conversión, en ROCm sobre AMD Radeon RX 9060 XT con `-dev ROCm0 -ngl 99 -c 2048`:

| Métrica | Valor |
|---|---|
| Throughput de prompt | 10,4 t/s |
| Throughput de generación | 30,9 t/s |
| Backend | ROCm (HIP) |
| Contexto usado en la medición | 2048 tokens |

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF pesa 7,38 GiB; se necesita margen adicional para KV cache y buffers de cómputo. Con contexto de 2048-4096 tokens, un presupuesto de 9-11 GB de VRAM es realista.
- **GPU recomendadas**: AMD Radeon RX 9060 XT (medición reportada), GPUs NVIDIA con soporte CUDA (por ejemplo RTX 4090, A100, H100) y Apple Silicon vía Metal. El backend Vulkan **no está soportado** en la versión actual.
- **¿Cabe en GPU de consumo?**: sí, en tarjetas con 8-12 GB de VRAM, siempre que el runtime soporte NVFP4 y FP8 con escalas.
- **Opciones de despliegue**: llama.cpp en commit `a38695013` o posterior (PR #28898, "ggml: support quant scales for fp8 and nvfp4", fusionado el 2026-11-27). Backends válidos: CPU, CUDA/HIP (ROCm) y Metal. Vulkan queda pendiente del PR #29791.
- **Latencia y throughput**: 10,4 t/s de prompt y 30,9 t/s de generación en RX 9060 XT con ROCm. No hay mediciones publicadas para CUDA, Metal o CPU.
- **Nota sobre cuantización adicional**: `llama-quantize` no puede recuantizar este archivo, porque los tensores NVFP4 y FP8 son tipos de almacenamiento con escalas externas. Debe tratarse como una referencia mixta de ~4,5/8 bpw.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-NVFP4-GGUF (este) | 9,197 M | no disponible | MIT | GGUF mixto NVFP4/FP8/BF16 | Conversión no oficial; requiere llama.cpp ≥ `a38695013`; sin `mmproj` |
| ornith-ai/Ornith-1.5-9B-NVFP4 (base) | 9,197 M | no disponible | MIT | ModelOpt (FP8 + NVFP4) | Checkpoint original de precisión mixta; incluye torre de visión |
| ornith-ai/Ornith-1.5-9B | 9,197 M | no disponible | MIT | safetensors (presumiblemente) | Modelo completo en precisión original; referencia para comparar pérdida de cuantización |
| Ornith-1.5-9B-Mobile | no disponible | no disponible | MIT (según licencia de familia) | cuantizado para móvil | Variante orientada a despliegue en dispositivos |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (Qwen, Llama, Gemma) en la información proporcionada.

## Limitaciones y advertencias

- **Conversión no oficial**: el repositorio es una conversión independiente no afiliada ni respaldada por ornith-ai. La calidad debe validarse contra el checkpoint original.
- **Sin visión utilizable**: aunque la torre de visión está presente en BF16, no se incluye archivo `mmproj`, por lo que el modelo solo funciona como text-only en este repositorio.
- **Requisito estricto de versión**: necesita llama.cpp en commit `a38695013` o posterior. Versiones anteriores rechazan los tipos o cargan sin las escalas, lo que produce resultados incorrectos.
- **Vulkan no soportado**: el backend Vulkan rechaza matmuls con weight scale y cae a CPU, degradando drásticamente el rendimiento.
- **No recuantizable**: `llama-quantize` no puede procesar los tensores NVFP4/FP8 con escalas externas; no es posible generar variantes Q4_K_M, Q5_K_M, etc. a partir de este archivo.
- **Sesgos y alucinación**: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; deben evaluarse empíricamente antes de uso en producción.
- **Idiomas y contexto**: no se especifican los idiomas soportados ni la longitud de contexto; ambos deben confirmarse contra el modelo base.
- **Licencia MIT**: permisiva para uso comercial, pero conviene revisar `LICENSE` del modelo base por si hubiera términos adicionales de atribución.
- **Datos de rendimiento limitados**: las únicas mediciones publicadas son de un backend (ROCm) y una GPU concreta; no hay datos de CUDA, Metal ni CPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maternion/Ornith-1.5-9B-NVFP4-GGUF
- Modelo base (checkpoint NVFP4): https://huggingface.co/ornith-ai/Ornith-1.5-9B-NVFP4
- Modelo Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte de escalas para FP8 y NVFP4: https://github.com/ggml-org/llama.cpp/pull/28898
- PR de soporte de matmul escalado en Vulkan: https://github.com/ggml-org/llama.cpp/pull/29791
