# bouroo/zeta-2.1-mlx-mxfp8

## Resumen

El modelo `bouroo/zeta-2.1-mlx-mxfp8` es una cuantización nativa en formato MXFP8 (8 bits) para Apple Silicon, realizada con la librería MLX, del modelo `zed-industries/zeta-2.1`. Zeta 2.1 es un modelo de predicción de edición de código (next-edit suggestion) desarrollado por Zed Industries, finetuneado a partir de `ByteDance-Seed/Seed-Coder-8B-Base`. Está diseñado específicamente para autocompletado y sugerencias de edición en editores de código, utilizando un formato de prompt especial de múltiples marcadores (SPM) basado en fill-in-the-middle (FIM).

La cuantización MXFP8 reduce el tamaño del modelo a 7,9 GB en disco, lo que lo hace viable para ejecutarse en equipos con Apple Silicon y memoria unificada. El modelo base tiene una longitud de contexto de 32K tokens según fuentes externas, aunque no se detalla en la model card. Con 2.320.633.856 parámetros (según los safetensors), esta versión cuantizada mantiene las capacidades del modelo original a la vez que optimiza el uso de recursos en hardware de Apple.

Es relevante porque ofrece una alternativa ligera y eficiente para integraciones de autocompletado de código en entornos de desarrollo, aprovechando las ventajas de MLX en Macs sin sacrificar la calidad de las sugerencias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Seed-Coder-8B-Base) |
| Parametros totales | 2.320.633.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32K (según LLM Explorer) |
| Tipos de cuantizacion | MXFP8 (8 bits, group size 32, BPW 8.250) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `zeta-2.1` es un modelo de lenguaje especializado en edición de código, finetuneado a partir de `ByteDance-Seed/Seed-Coder-8B-Base`. Utiliza una arquitectura transformer estándar, aunque no se han publicado detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas. La innovación principal reside en su formato de prompt: un esquema SPM (single-prompt multi-marker) que combina múltiples marcadores (`<|marker_1|>`, `<|marker_2|>`, etc.) para indicar la posición del cursor y las ediciones esperadas. Este enfoque permite al modelo predecir no solo la continuación del código, sino también ediciones completas en el contexto.

El entrenamiento del modelo base incluye técnicas de SFT y DPO, según la documentación de Zed Industries, aunque no se han revelado los volúmenes de datos ni la composición del dataset. La cuantización MXFP8 aplicada por `bouroo` no altera la arquitectura, solo los pesos, y mantiene el formato de prompt original.

## Capacidades

- Autocompletado de código en múltiples lenguajes de programación, con soporte para el formato FIM (fill-in-the-middle) mediante el prompt SPM multi-marker.
- Predicción de ediciones completas (next-edit suggestion), no solo continuación de línea, lo que permite sugerir cambios en el código existente.
- Generación de código en contexto, aprovechando la ventana de 32K tokens para considerar archivos completos o fragmentos largos.
- Funciona como modelo de texto, sin capacidades de chat, tool calling ni razonamiento multi-paso.
- Es monolingüe en inglés, aunque el código fuente es universal y puede trabajar con cualquier lenguaje de programación.
- Compatible con MLX y LM Studio para integración en entornos de desarrollo en Apple Silicon.

## Casos de uso

- Autocompletado en editores de código: el modelo se integra en IDEs como Zed o VS Code mediante el cliente proporcionado en `examples/zeta_fim.py`, generando sugerencias en tiempo real mientras el desarrollador escribe.
- Sugerencia de ediciones en código existente: al proporcionar el contexto antes y después del cursor, el modelo predice la edición más probable, útil para refactorizaciones o correcciones rápidas.
- Generación de implementaciones de funciones: dado un esqueleto de función y el contexto, el modelo completa la implementación, como se muestra en el ejemplo de `sum_list` del README.
- Asistencia en revisión de código: puede sugerir cambios en bloques de código al recibir el fragmento con marcadores, ayudando a detectar errores o mejorar la legibilidad.
- Integración en pipelines de desarrollo: al ser un modelo ligero (2.3B parámetros en 8 bits), puede ejecutarse localmente en Macs sin necesidad de GPU dedicada, facilitando su uso en entornos de desarrollo sin conexión.
- Prototipado rápido de código: los desarrolladores pueden pegar un fragmento incompleto y obtener una versión completa, acelerando la exploración de soluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Tampoco se encontraron datos en las fuentes externas consultadas. Por tanto, no es posible evaluar cuantitativamente su calidad frente a alternativas.

## Requisitos de hardware

- Es una cuantización MXFP8 específica para Apple Silicon, por lo que requiere un Mac con chip M1, M2, M3 o superior.
- El tamaño en disco es de 7,9 GB, lo que implica un uso de memoria unificada de al menos 8 GB para cargar el modelo completo en RAM. Se recomienda un mínimo de 16 GB de RAM unificada para un rendimiento fluido.
- No requiere GPU dedicada, ya que MLX aprovecha la GPU integrada y la CPU de los chips de Apple.
- Opciones de despliegue: se puede usar con `mlx_lm` (Python), LM Studio (mediante `lms get` y `lms load`), o el cliente de ejemplo `zeta_fim.py` que se comunica con LM Studio.
- La latencia y el throughput no están documentados, pero al ser un modelo de 2.3B parámetros en 8 bits, se espera una generación rápida en hardware moderno de Apple, adecuada para autocompletado en tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos directos. Sin embargo, el modelo pertenece a la categoría de autocompletado de código basado en FIM. Alternativas comparables incluyen:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zeta-2.1 (base) | 2.3B (según safetensors) | 32K | Apache-2.0 | Hugging Face |
| CodeLlama-7B | 7B | 16K | Llama 2 license | Hugging Face |
| DeepSeek-Coder-6.7B | 6.7B | 16K | DeepSeek License | Hugging Face |

Estos modelos son más grandes y ofrecen capacidades de chat además de autocompletado, pero Zeta 2.1 se centra exclusivamente en edición de código con un formato de prompt optimizado. No se pueden comparar rendimientos sin benchmarks.

## Limitaciones y advertencias

- Formato de prompt específico: el modelo requiere el formato SPM multi-marker; no funciona con prompts de chat estándar ni con plantillas FIM simples. LM Studio no puede formatear este prompt automáticamente, por lo que se necesita un cliente personalizado.
- Monolingüe en inglés: aunque el código es universal, los comentarios y documentación generados estarán en inglés; puede tener un rendimiento subóptimo con instrucciones en otros idiomas.
- Riesgo de alucinación en código: como cualquier modelo generativo, puede producir código incorrecto o no compilable; se recomienda revisión humana en entornos de producción.
- Sin soporte para tool calling ni agentes: no puede interactuar con APIs o ejecutar acciones; su uso se limita a generación de texto.
- La discrepancia entre los 2.3B parámetros reportados en safetensors y la descripción de "8B" en la model card podría indicar un error en la documentación del modelo base; se recomienda verificar el tamaño real antes de planificar su integración.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base hereda la misma licencia, sin restricciones adicionales conocidas.

## Enlaces

- Modelo cuantizado: https://huggingface.co/bouroo/zeta-2.1-mlx-mxfp8
- Modelo base: https://huggingface.co/zed-industries/zeta-2.1
- Colección de cuantizaciones del autor: https://huggingface.co/collections/bouroo/zeta
- Modelos cuantizados de zeta-2.1: https://huggingface.co/models?other=base_model:quantized:zed-industries/zeta-2.1
- Ficha en LLM Explorer: https://llm-explorer.com/model/zed-industries%2Fzeta-2.1,5GM5k4n6QrcSqEXAkcsHGK
