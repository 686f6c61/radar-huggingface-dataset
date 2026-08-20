# agentic-ptb/grok.h003.sft-v1.step_1250

## Resumen

El repositorio `agentic-ptb/grok.h003.sft-v1.step_1250` contiene un checkpoint intermedio de un experimento de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El autor, `agentic-ptb`, lo publica como parte de un barrido de hiperparámetros (sweep) denominado AgentPTB, en el que se entrenan variantes de un modelo de 9.400 millones de parámetros durante 100 horas. Este checkpoint concreto corresponde a la hora 3 del run, paso 1250, y se etiqueta como de rol intermedio.

La relevancia de este modelo es limitada fuera del contexto de investigación: no se proporcionan licencia, idiomas soportados, ni resultados de evaluación. La model card incluida en el repositorio describe otro checkpoint distinto (`grok.h006.sft-v2.step_400`), lo que sugiere que el autor reutilizó la misma documentación para varios artefactos. Además, se advierte de un defecto de empaquetado en el token de fin de secuencia (`eos_token_id`), que afecta a la fiabilidad de cualquier evaluación. En resumen, se trata de un artefacto experimental sin garantías de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint base `Qwen/Qwen3.5-9B-Base`, que a su vez es un transformer decoder-only de 9.400 millones de parámetros. El nombre del repositorio (`sft-v1`) indica que se trata de la primera variante de fine-tuning supervisado dentro del sweep AgentPTB. No se especifican los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas adicionales como RLHF o DPO.

La model card menciona que el entrenamiento se ejecutó durante 100 horas, con un driver denominado `pi / grok-4.6` y un nivel de razonamiento `xhigh`, pero estos términos no están definidos públicamente. Un detalle técnico relevante es que el checkpoint carece del token `248046` (`<|im_end|>`), que la plantilla de chat de Qwen3.5 utiliza para terminar cada turno. Esto provoca que el modelo no detenga la generación al final de un turno y sobrepase la ventana de contexto, lo que invalida cualquier métrica de evaluación obtenida sin reempaquetar los pesos.

## Capacidades

No se dispone de información verificada sobre las capacidades específicas de este checkpoint. Al estar basado en `Qwen/Qwen3.5-9B-Base`, se podría esperar que herede las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero no hay documentación que lo confirme. La model card no lista ninguna capacidad concreta, y el defecto de `eos_token_id` impide un uso fiable en tareas de chat o generación multi-turno.

## Casos de uso

Dado el carácter experimental del checkpoint y la ausencia de documentación, no se recomienda su uso en aplicaciones prácticas. Los únicos escenarios plausibles serían:

- Investigación académica: análisis de la dinámica de entrenamiento durante un sweep de hiperparámetros, comparando checkpoints de diferentes horas y pasos.
- Reproducción de experimentos: verificación de la metodología de AgentPTB y del efecto del defecto de `eos_token_id` en la evaluación.
- Fine-tuning posterior: como punto de partida para un nuevo entrenamiento, siempre que se corrija el empaquetado de tokens.
- Estudio de la evolución de la pérdida y la calidad de generación a lo largo del tiempo de entrenamiento.
- Pruebas de infraestructura: validación de pipelines de carga de modelos con safetensors y frameworks como vLLM o llama.cpp.
- Benchmarking de hardware: medición de latencia y throughput en GPUs específicas, aunque sin métricas de calidad de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "piso, no una medición" debido al defecto de `eos_token_id`, por lo que cualquier comparativa sería engañosa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parámetros en precisión fp16/bf16, los pesos ocupan aproximadamente 18,8 GB. Para inferencia sin cuantización se necesitan al menos 20-24 GB de VRAM, dependiendo del overhead del runtime.
- GPU recomendadas: una NVIDIA RTX 3090 o RTX 4090 (24 GB) podría ejecutar el modelo en fp16, aunque con margen ajustado. Para mayor comodidad, una A100 40 GB o H100 80 GB sería adecuada.
- Si cabe en consumer GPU: sí, en una GPU de 24 GB con fp16, pero sin espacio para batches grandes. No se proporcionan archivos cuantizados (GGUF, AWQ, GPTQ), por lo que no es posible ejecutarlo en GPUs de 8-12 GB sin cuantizar manualmente.
- Opciones de despliegue: al ser un modelo estándar de safetensors, puede cargarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). No se incluyen configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos de tamaño similar (p. ej., Llama 3.1 8B, Mistral 7B, Qwen2.5 7B). La única referencia arquitectónica es el propio `Qwen/Qwen3.5-9B-Base`, del que se desconoce su ficha técnica pública. Por tanto, no es posible establecer una comparativa objetiva.

## Limitaciones y advertencias

- Defecto de empaquetado de `eos_token_id`: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no termine los turnos correctamente y sobrepase la ventana de contexto. Cualquier evaluación o uso en chat es poco fiable.
- Checkpoint intermedio: no es un modelo final, sino un punto intermedio de un entrenamiento de 100 horas. Su calidad puede ser inferior a la de checkpoints posteriores.
- Documentación inconsistente: la model card describe otro checkpoint (`h006.sft-v2.step_400`), no este (`h003.sft-v1.step_1250`). La información sobre el run puede no corresponder exactamente.
- Sin licencia: no se especifica la licencia de uso, lo que impide su uso comercial o incluso académico sin autorización explícita.
- Sin datos de sesgos o alucinación: al no haber evaluación, se desconocen los sesgos potenciales y la tasa de alucinación.
- Sin soporte de idiomas: no se indica qué idiomas maneja, aunque probablemente herede los del modelo base (que no se detallan).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h003.sft-v1.step_1250
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (enlace inferido, no verificado en la información proporcionada)
