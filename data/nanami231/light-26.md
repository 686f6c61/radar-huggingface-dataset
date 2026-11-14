# Nanami231/light-26

## Resumen

`Nanami231/light-26` es un adaptador LoRA de tipo DreamBooth para generación de texto a imagen, entrenado sobre el modelo base `krea/Krea-2-Raw` (y presentado sobre `krea/Krea-2-Turbo`). Lo publica el usuario Nanami231 en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo fundacional, sino de un peso adicional de pequeño tamaño (repo de 1,6 GB) que se carga sobre el pipeline de Krea 2 para inyectar un concepto concreto.

El adaptador está diseñado para invocar un concepto específico mediante el token disparador `MINHNN@26`, que según las muestras de la model card corresponde a un tigre blanco representado en distintos entornos (ciudad ciberpunk, reino submarino, jardín zen). El entrenamiento sigue la técnica DreamBooth-LoRA, habitual para personalización de difusores con pocas imágenes.

La relevancia es acotada: se trata de un LoRA de nicho, con cero descargas y cero likes en el momento de la consulta, sin métricas publicadas ni documentación técnica más allá de la model card. Resulta útil como ejemplo de personalización sobre la familia Krea 2, pero no como componente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth-LoRA) sobre un difusor Krea 2 (arquitectura del modelo base no detallada) |
| Parametros totales | no disponible (repo de 1,6 GB, incluye pesos del adaptador y muestras) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto a imagen) |
| Tipos de cuantizacion | no disponible (el ejemplo usa `torch.bfloat16`) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estándar de `diffusers`; no confirmado explícitamente en la card) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth entrenado sobre `krea/Krea-2-Raw`, el checkpoint "raw" de la familia Krea 2. La model card indica que las muestras se generaron sobre `krea/Krea-2-Turbo` con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere que el adaptador es compatible con la variante Turbo destilada del modelo base. No se especifican en la información disponible el número de imágenes de entrenamiento, el rango del LoRA, la tasa de aprendizaje ni la composición del dataset.

La innovación técnica es la habitual en personalización de difusores: un token disparador (`MINHNN@26`) que activa el concepto aprendido, en este caso un tigre blanco. No hay datos sobre regularización, uso de captions automáticos ni técnicas adicionales (LoRA con prior preservation, textual inversion combinada, etc.). Tampoco se documenta el proceso de entrenamiento más allá de la mención a DreamBooth.

## Capacidades

- Generación de imágenes a partir de prompts de texto, condicionada por el token `MINHNN@26`.
- Inyección de un concepto visual concreto (tigre blanco) en escenas diversas: urbana, submarina, jardín zen, según las muestras.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers` mediante `load_lora_weights`.
- Funcionamiento con la variante Turbo del modelo base a 8 pasos y `guidance_scale=0.0`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada más allá del texto.
- Capacidades multilingües: no documentadas; los ejemplos están en inglés.

## Casos de uso

- Personalización de marca o mascota: entrenar un LoRA análogo con el mismo flujo DreamBooth para insertar un personaje o producto concreto en escenas generadas, usando `MINHNN@26` como referencia de cómo se estructura el token disparador.
- Ilustración conceptual rápida: generar variaciones de una criatura (en este caso un tigre blanco) en entornos distintos para exploración de arte conceptual, aprovechando los 8 pasos de la variante Turbo.
- Pruebas de integración de LoRA en pipelines `diffusers`: servir como ejemplo mínimo de `load_lora_weights` sobre `Krea2Pipeline` para validar el flujo en CI o en notebooks de experimentación.
- Generación de assets para prototipos: producir imágenes de relleno con un motivo recurrente para maquetas de webs o apps antes de contar con arte final.
- Investigación sobre personalización de difusores: usar el adaptador como caso de estudio de DreamBooth-LoRA sobre Krea 2, comparando el efecto del token disparador frente al prompt sin él.
- Contenido editorial temático: ilustrar artículos sobre fauna o fantasía con un motivo consistente (tigre blanco) en múltiples ambientaciones, manteniendo coherencia visual entre piezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base Krea 2, que no se detalla en la información proporcionada. El repo ocupa 1,6 GB, pero eso incluye pesos del LoRA y muestras, no el modelo base.
- GPU recomendadas: no disponibles. El ejemplo de la card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño del modelo base Krea 2, no indicado.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (documentado en la card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un difusor de imagen.
- Latencia y throughput: no disponibles; la card solo indica 8 pasos de inferencia en la variante Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Token disparador | Licencia | Documentación |
|---|---|---|---|---|---|
| Nanami231/light-26 | LoRA DreamBooth | krea/Krea-2-Raw | `MINHNN@26` | Apache 2.0 | Model card mínima |
| LoRA de la familia Krea 2 (otros) | LoRA | krea/Krea-2-Raw | variable | variable | no disponible |
| LoRA sobre SDXL (p. ej. DreamBooth) | LoRA DreamBooth | stabilityai/stable-diffusion-xl-base-1.0 | variable | CreativeML OpenRAIL++-M | amplia |

No se dispone de información sobre otros LoRA concretos de Krea 2 con los que comparar parámetros, contexto o rendimiento; la comparativa se limita a categorías generales.

## Limitaciones y advertencias

- Modelo de nicho: cero descargas y cero likes en el momento de la consulta; sin validación por parte de la comunidad.
- Sin métricas ni evaluación publicada: no hay FID, CLIP score ni comparaciones cuantitativas.
- Dependencia estricta del modelo base `krea/Krea-2-Raw` (y compatibilidad observada con `Krea-2-Turbo`); no funcionará con otros difusores.
- El token `MINHNN@26` es obligatorio para activar el concepto; sin él, el LoRA puede no tener efecto o introducir artefactos.
- Riesgo de sobreajuste al concepto entrenado (tigre blanco) y de degradar la diversidad de las generaciones si se usa con prompts muy alejados del dominio de entrenamiento.
- Sesgos: no documentados; al ser un LoRA de concepto único, los sesgos heredados provienen del modelo base Krea 2, no evaluados aquí.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base Krea 2 se rige por su propia licencia, que no se detalla en la información disponible.
- No hay información sobre idiomas soportados en los prompts; los ejemplos están en inglés y no se garantiza buen rendimiento en castellano.
- Fechas de creación y actualización (2026) posteriores a la mayoría de referencias públicas; conviene verificar el estado del repo antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Nanami231/light-26
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo del modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Librería diffusers: https://github.com/huggingface/diffusers
- Documentación de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
