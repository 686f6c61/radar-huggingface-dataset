# NiuNiu0110/rst-qwen3.5-4b-sft

## Resumen

`NiuNiu0110/rst-qwen3.5-4b-sft` es un modelo ajustado mediante supervisión fina (SFT) sobre el modelo base `Qwen/Qwen3.5-4B`, desarrollado por el usuario `NiuNiu0110`. El entrenamiento se realizó con el pipeline *Recursive Synthesis for Long-Horizon Terminal Tasks* (RST), que genera trayectorias recursivas para tareas de terminal de largo alcance. El resultado es un artefacto experimental orientado a agentes de terminal y a la interacción multimodal, con arquitectura `Qwen3_5ForConditionalGeneration` y un total de 4.659.865.088 parámetros (≈4,66 mil millones).

El checkpoint corresponde al paso global 82 del entrenamiento y se publicó con pesos en `bfloat16` en formato `safetensors`. Incluye una torre de visión copiada directamente del modelo base, ya que el entrenamiento solo afectó a la pila de texto. Su relevancia radica en explorar el uso de síntesis recursiva para tareas de agente de terminal, aunque no se ha ejecutado ningún benchmark sobre estos pesos, por lo que debe tratarse como un modelo sin validar y de carácter experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (multimodal imagen-texto) |
| Parametros totales | 4.659.865.088 (≈4,66 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un modelo multimodal que combina una torre de visión y una pila de texto. El fine-tuning se llevó a cabo con `verl` y `FSDP2` sobre un corpus pre-tokenizado de trayectorias de síntesis recursiva, extraído del dataset `NiuNiu0110/RST-SFT-Qwen3.5-27B`. Una particularidad técnica destacable es que la máscara de pérdida del modelo Qwen3.5 se hornea en los datos durante la exportación pre-tokenizada, en lugar de recalcularse en cada backend, porque tokenizar los turnos por separado y concatenarlos no reproduce la representación completa de la conversación para esta plantilla.

El proceso de exportación del checkpoint es inusual: `verl` escribe fragmentos FSDP que `from_pretrained` no puede cargar directamente. Los pesos finales se obtienen mediante `scripts/08_prepare_eval_ckpt.sh`, que fusiona todos los fragmentos, vuelve a insertar la torre de visión desde el modelo base (el entrenamiento solo transporta la pila de texto) y verifica que los pesos de texto realmente se han movido. Esta verificación es crítica, porque una fusión incompleta podría producir un modelo cargable pero parcialmente sin entrenar, y una fusión que reprodujera el modelo base sería indistinguible de un entrenamiento exitoso sin esa comprobación.

## Capacidades

- Comprensión y generación de imágenes y texto, gracias a la arquitectura multimodal `Qwen3_5ForConditionalGeneration`.
- Generación de texto conversacional en formato multi-turno, según los datos de entrenamiento.
- Especialización en tareas de agente de terminal (tag `terminal-agent`), basada en trayectorias de síntesis recursiva.
- Aptitud para tareas de largo horizonte, al haber sido entrenado sobre secuencias de pasos recursivos para resolver objetivos complejos.
- Soporte de tool calling: no documentado en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Automatización de operaciones de terminal: el modelo puede generar comandos de forma iterativa, analizar la salida y decidir el siguiente paso, lo que lo hace adecuado para entornos de despliegue continuo o administración de sistemas.
- Asistente de desarrollo con análisis de capturas de pantalla: al aceptar imágenes, puede interpretar la salida de una consola o de un IDE y sugerir comandos o correcciones, aunque sin validación previa de rendimiento.
- Soporte técnico automatizado: permite mantener conversaciones multi-turno con contexto de sesión, lo que resulta útil para sistemas de atención que necesitan resolver incidencias técnicas de forma escalonada.
- Análisis de logs y mantenimiento de infraestructuras: la síntesis recursiva facilita descomponer una tarea larga de diagnóstico en pasos más pequeños y ejecutables.
- Investigación en agentes autónomos: sirve como banco de pruebas para estudiar comportamientos emergentes en tareas de terminal de largo horizonte, dada la naturaleza experimental del checkpoint.
- Prototipado rápido de asistentes de terminal: el fine-tuning específico permite generar un asistente de línea de comandos en pocos pasos, útil para pruebas de concepto en proyectos de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ningún harness de evaluación sobre estos pesos, por lo que no existe ninguna puntuación que citar.

## Requisitos de hardware

- Los pesos en `bfloat16` ocupan aproximadamente 9,3 GB en disco (el repo tiene 9,3 GB y la model card indica 8,7 GB de pesos).
- Para inferencia con `bfloat16` se estima una VRAM de entre 12 y 16 GB, dependiendo de la longitud de la secuencia, el tamaño del lote y la gestión de la caché KV.
- GPU recomendadas: NVIDIA RTX 4080 o 4090, A100 de 40 GB, H100. En GPUs de consumo, una RTX 4090 de 24 GB es suficiente para ejecutar el modelo sin cuantizar.
- Opciones de despliegue: `transformers` con `device_map="auto"`, `vLLM`, `TGI`, `Ollama` y `llama.cpp` (previa conversión a GGUF). No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NiuNiu0110/rst-qwen3.5-4b-sft` | 4,66 mil millones | No disponible | Sin benchmarks | Apache-2.0 | HuggingFace |
| `Qwen/Qwen3.5-4B` (modelo base) | 4,66 mil millones | No disponible | No disponible | Apache-2.0 | HuggingFace |

No se dispone de datos de otros modelos comparables en la información proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- No se ha ejecutado ningún benchmark sobre el checkpoint, por lo que no existe evidencia de calidad o capacidad real.
- El riesgo de alucinación y los sesgos no han sido evaluados; el modelo es un artefacto de un experimento de entrenamiento.
- El entrenamiento se centra en trayectorias de terminal, lo que puede limitar su generalización a otras tareas de lenguaje o visión.
- Los idiomas soportados no están documentados, y no se puede asumir cobertura multilingüe.
- El proceso de exportación es complejo y requiere verificación externa; aunque se confirmó que los pesos de texto se movieron, no hay garantías de que el checkpoint final se comporte de forma consistente en todos los entornos.
- La licencia Apache-2.0 permite uso comercial, pero al no haber validación, no se recomienda su uso en producción sin una evaluación previa.
- El repositorio de HuggingFace no muestra descargas ni likes, lo que refuerza su carácter experimental y no probado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NiuNiu0110/rst-qwen3.5-4b-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/NiuNiu0110/RST-SFT-Qwen3.5-27B
- Repositorio de entrenamiento (referencia en la model card): https://github.com/k1ssloo/RST-Train
