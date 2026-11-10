# carlesoctav/grafting-e4b_base_termgrade-0.7

## Resumen

El modelo `carlesoctav/grafting-e4b_base_termgrade-0.7` es un adaptador LoRA creado mediante la tecnica de *grafting* descrita en el articulo *Off-Policy Merging Beats On-Policy Self-Distillation for Continual Learning* (Wu et al., 2026). Se trata de un adaptador de tipo PEFT que se monta sobre el modelo base `google/gemma-4-E4B-it`, un modelo de la familia Gemma 4 con arquitectura transformer y pipeline de generacion de texto conversacional.

El adaptador se ha obtenido aplicando un ajuste fino sobre el conjunto de datos `termgrade_train_sft_32k.jsonl`, partiendo de la diferencia entre un modelo donante (`google/gemma-4-E4B`, la version base sin post-entrenamiento) y el modelo post-entrenado (`google/gemma-4-E4B-it`). La escala de grafting utilizada es λ = 0.7, lo que se traduce en un `lora_alpha` efectivo de 11.2. El objetivo de esta tecnica es transferir conocimiento de un modelo a otro preservando las capacidades adquiridas durante el post-entrenamiento y evitando el olvido catastrofico.

La relevancia de esta publicacion radica en que ejemplifica una estrategia de *continual learning* basada en merging off-policy, que segun los autores supera a la autodestilacion on-policy. Al ser un adaptador de bajo rango (repo de 0.2 GB), resulta ligero de distribuir y de aplicar sobre el modelo base, aunque su adopcion practica depende de la disponibilidad del modelo `google/gemma-4-E4B-it` y de la licencia asociada al mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer `google/gemma-4-E4B-it` |
| Parametros totales | no disponible (el repo pesa 0.2 GB; el modelo base no se especifica en parametros) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador sigue el paradigma de *grafting* propuesto por Wu et al. (2026). En lugar de entrenar directamente sobre el modelo post-entrenado, se calcula una actualizacion de tarea (Δ) mediante ajuste fino supervisado (SFT) sobre `termgrade_train_sft_32k.jsonl`, y despues se injerta esa actualizacion en el modelo post-entrenado con una escala λ = 0.7. La operacion efectiva equivale a un LoRA con `lora_alpha = 11.2`, lo que modula la intensidad con la que se aplica el delta aprendido.

El modelo base sobre el que se monta es `google/gemma-4-E4B-it`, un transformer de la familia Gemma 4 orientado a generacion de texto y conversacion. El modelo donante es `google/gemma-4-E4B`, la variante base sin instrucciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset `termgrade_train_sft_32k.jsonl` ni sobre el uso de RLHF o DPO en el adaptador.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base `google/gemma-4-E4B-it`.
- Ajuste especifico sobre la tarea asociada al dataset `termgrade_train_sft_32k.jsonl` (contenido no detallado en la informacion disponible).
- Aplicacion como adaptador PEFT sobre el modelo base mediante `PeftModel.from_pretrained`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en continual learning: el adaptador sirve como caso de estudio reproducible para evaluar la tecnica de grafting frente a autodestilacion on-policy, permitiendo comparar el efecto de distintos valores de λ.
- Ajuste de tareas especificas sobre Gemma 4 E4B-it: se puede aplicar el adaptador para tareas de generacion de texto relacionadas con el dataset `termgrade_train_sft_32k.jsonl` sin necesidad de reentrenar el modelo completo.
- Experimentacion con PEFT en produccion ligera: al ocupar solo 0.2 GB, es adecuado para entornos donde se quiera probar variantes de adaptadores sobre un mismo modelo base sin duplicar pesos.
- Evaluacion de olvido catastrofico: util para medir si el grafting preserva las capacidades del modelo post-entrenado tras aplicar la actualizacion de tarea.
- Reproducibilidad academica: permite replicar los experimentos del articulo de Wu et al. (2026) sobre un modelo de la familia Gemma 4.
- Despliegue con transformers y PEFT: se integra en pipelines existentes que ya usen `transformers` y `peft`, sin requerir conversion a otros formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `google/gemma-4-E4B-it`, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `transformers` junto con `peft` (segun el ejemplo de uso de la model card). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de rendimiento ni especificaciones de modelos alternativos en la informacion suministrada.

## Limitaciones y advertencias

- La licencia no esta especificada en la informacion disponible, por lo que se desconoce si permite uso comercial.
- Los idiomas soportados no estan documentados; se heredan presumiblemente del modelo base, pero no se confirma.
- No se detalla el contenido del dataset `termgrade_train_sft_32k.jsonl`, por lo que se desconoce el dominio y los posibles sesgos introducidos.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan medidas especificas de mitigacion en el adaptador.
- Al ser un adaptador PEFT, su comportamiento depende completamente del modelo base `google/gemma-4-E4B-it`; cualquier limitacion de este se hereda.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-10, por lo que no hay evidencia de uso en produccion ni validacion externa.
- No se documentan limitaciones de contexto ni restricciones de uso adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/carlesoctav/grafting-e4b_base_termgrade-0.7
- Articulo de referencia: https://arxiv.org/abs/2610.05872v1
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo donante: https://huggingface.co/google/gemma-4-E4B
