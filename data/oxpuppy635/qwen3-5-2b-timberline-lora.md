# oxpuppy635/qwen3.5-2b-Timberline-lora

## Resumen

`qwen3.5-2b-Timberline-lora` es un adaptador LoRA publicado por el usuario oxpuppy635 sobre el modelo base `DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING`, una variante de 2B parámetros de la familia Qwen3.5 con arquitectura híbrida de atención lineal y completa (`Qwen3_5ForConditionalGeneration`). No se trata de un modelo completo, sino de un ajuste fino de bajo rango (15,6 millones de parámetros entrenables) que se aplica dinámicamente sobre los pesos del modelo base.

El adaptador está orientado a generación de texto conversacional y razonamiento, con entrenamiento explícito sobre trazas de razonamiento delimitadas por etiquetas `<think>...</think>`. Se distribuye en dos formatos: pesos PEFT en safetensors para su uso con `transformers` + `peft`, y un adaptador LoRA en GGUF para aplicarlo en tiempo de ejecución con `llama.cpp` mediante el flag `--lora`.

Su relevancia es acotada: se publicó en noviembre de 2026, no registra descargas ni interacciones, y no incluye documentación sobre licencia, idiomas soportados ni evaluación de rendimiento. Es un artefacto de experimentación comunitaria sobre un modelo base ya de por sí derivado y modificado, por lo que su uso en producción exige validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5 con atención híbrida lineal/completa (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 15.630.336 (solo el adaptador LoRA; el modelo base es de 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4736 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con cómputo en bfloat16 durante el entrenamiento; el adaptador se distribuye en safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`) y GGUF (`qwen3.5-2b-Timberline-lora.gguf`) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA de 4 bits (NF4 con cómputo en bfloat16) sobre el modelo base `Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING`. Los hiperparámetros declarados son rango `r=16`, `lora_alpha=32`, longitud máxima de secuencia de 4736 tokens, 4000 conversaciones de entrenamiento, 3 épocas y una pérdida final de entrenamiento de 2,3585. Las 4000 conversaciones incluyen trazas de razonamiento (`<think>...</think>`) seguidas de la respuesta final, lo que orienta el adaptador hacia un modo de pensamiento explícito antes de contestar.

No se especifican la composición del dataset, el número total de tokens procesados, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. El modelo base, según su nombre, incorpora modificaciones de tipo "heretic/uncensored" y "auto-variable thinking", pero no se aporta documentación técnica sobre cómo se construyeron esos pesos. La innovación destacable es la doble distribución del adaptador: pesos PEFT estándar y un LoRA en GGUF aplicable en caliente sobre cualquier cuantización GGUF del modelo base sin necesidad de fusionar pesos.

## Capacidades

- Generación de texto conversacional multi-turno sobre el modelo base.
- Razonamiento con traza explícita: el adaptador fue entrenado con etiquetas `<think>...</think>` antes de la respuesta, por lo que induce un modo de pensamiento previo a la contestación.
- Generación de código y matemáticas: capacidad heredada del modelo base Qwen3.5, no evaluada de forma específica en este adaptador.
- Aplicación dinámica en `llama.cpp` mediante `--lora`, lo que permite alternar el adaptador sobre distintas cuantizaciones del modelo base.
- Integración con el ecosistema Hugging Face mediante `transformers` y `peft` (`PeftModel.from_pretrained`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado más allá del modo de pensamiento.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales con razonamiento visible: el adaptador fuerza una traza `<think>` antes de responder, lo que facilita depurar el proceso de razonamiento en aplicaciones de chat y atención al cliente con contexto de hasta 4736 tokens.
- Experimentación con adaptadores en `llama.cpp`: al distribuirse como LoRA GGUF, permite comparar el comportamiento del modelo base con y sin el adaptador sobre la misma cuantización, útil en laboratorios de evaluación de ajustes finos.
- Generación de narrativa y ficción: la model card emplea como ejemplo una petición de relato evocador, lo que sugiere un uso orientado a escritura creativa sin restricciones de contenido.
- Investigación sobre fine-tuning de bajo rango: con 15,6 millones de parámetros entrenables y pérdida final documentada, sirve como referencia reproducible de un pipeline QLoRA sobre un modelo de 2B.
- Despliegue en hardware modesto: al combinarse con cuantizaciones GGUF del modelo base de 2B, el conjunto puede ejecutarse en equipos de consumo, adecuado para demos locales y entornos sin GPU dedicada.
- Evaluación de modelos derivados de la familia Qwen3.5: útil para estudiar cómo se comportan variantes comunitarias con modificaciones de alineación sobre tareas de razonamiento y generación abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base de 2B y de su cuantización; el adaptador LoRA añade aproximadamente 0,1 GB en safetensors o su equivalente en GGUF. Una cuantización Q4_K_M de un modelo de 2B requiere del orden de 1,5-2 GB de memoria, aunque este dato no se confirma en la información proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, cualquier GPU con 4 GB o más de VRAM debería ser suficiente en cuantizaciones de 4 bits.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo base de 2B, aunque no hay confirmación en la documentación.
- Opciones de despliegue: `llama.cpp` con `--lora` (documentado con `-ngl 99` y `-c 4736`), y `transformers` + `peft` con `device_map="auto"` y `torch_dtype=torch.bfloat16` (documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3.5-2b-Timberline-lora (este) | 15,6 M (adaptador sobre base de 2B) | 4736 tokens (entrenamiento) | safetensors + GGUF LoRA | no disponible | Adaptador comunitario, sin benchmarks |
| DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING | 2B | no disponible | no disponible | no disponible | Modelo base del adaptador, modificado y sin censura declarada |
| Qwen3.5-2B (modelo original de la familia) | 2B | no disponible | no disponible | no disponible | Referencia de la arquitectura base; no se dispone de datos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere descargar y cargar el modelo base `DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING`, cuyas condiciones de uso no están documentadas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, ni para el adaptador ni para el modelo base.
- El modelo base declara modificaciones de tipo "uncensored/heretic", lo que implica un riesgo elevado de generar contenido sin filtros de seguridad; no es adecuado para aplicaciones expuestas a usuarios finales sin capas de moderación propias.
- Riesgo de alucinación: inherente a un modelo de 2B parámetros; no hay evaluación publicada que lo cuantifique.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable fuera del inglés, idioma en el que está redactada la model card.
- Longitud de contexto limitada a 4736 tokens en entrenamiento; superar esa cifra en inferencia puede degradar la calidad.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad, estabilidad ni reproducibilidad.
- Pérdida final de entrenamiento de 2,3585 sin curva de validación: no permite inferir la calidad real del ajuste ni el grado de sobreajuste sobre las 4000 conversaciones.
- El uso de `trust_remote_code=True` en el código de ejemplo implica ejecutar código del repositorio del modelo base; conviene auditar los ficheros antes de cargarlos en entornos de producción.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/oxpuppy635/qwen3.5-2b-Timberline-lora
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
