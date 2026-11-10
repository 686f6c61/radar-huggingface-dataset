# carlesoctav/grafting-e4b_base_termgrade-0.3

## Resumen

`grafting-e4b_base_termgrade-0.3` es un adaptador LoRA publicado por el usuario carlesoctav sobre el modelo `google/gemma-4-E4B-it` de Google. No se trata de un modelo entrenado desde cero, sino de un adaptador de bajo rango generado mediante la técnica de *grafting* descrita en el artículo *Off-Policy Merging Beats On-Policy Self-Distillation for Continual Learning* (Wu et al., 2026), que combina el modelo post-entrenado con un modelo donante base para transferir una actualización de tarea concreta.

El adaptador se ha ajustado sobre el conjunto de datos `termgrade_train_sft_32k.jsonl`, presumiblemente orientado a una tarea de evaluación o calificación de términos (term grading), aunque la model card no detalla la naturaleza exacta de la tarea. El factor de escala de grafting es λ = 0.3, lo que se traduce en un `lora_alpha` efectivo de 4.8.

Su relevancia radica en que ejemplifica el uso de técnicas de fusión off-policy para *continual learning*: en lugar de recurrir a auto-destilación on-policy, el grafting permite incorporar una actualización de tarea sobre un modelo ya post-entrenado sin degradar sus capacidades originales. Al ser un adaptador PEFT de 0.2 GB, es ligero y desplegable sobre el modelo base sin necesidad de reentrenar ni redistribuir los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer `google/gemma-4-E4B-it` |
| Parametros totales | no disponible (adaptador; el modelo base Gemma 4 E4B no especifica cifra en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; admite las cuantizaciones del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue la formulacion estandar de LoRA (matrices de bajo rango inyectadas en las capas del transformer base) y se construye mediante *grafting*: se parte del modelo post-entrenado `google/gemma-4-E4B-it` (θ_post) y de un modelo donante base `google/gemma-4-E4B` (θ_donor), y se transfiere la actualizacion de tarea Δ, obtenida por fine-tuning SFT sobre `termgrade_train_sft_32k.jsonl`. El resultado es un adaptador LoRA con escala de grafting λ = 0.3, equivalente a un `lora_alpha` de 4.8.

La innovacion tecnica principal es el propio método de grafting descrito en Wu et al. (2026), que según el título del artículo supera a la auto-destilación on-policy en escenarios de aprendizaje continuo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO adicionales sobre el adaptador. Tampoco se detalla la configuracion exacta de LoRA (rango, modulos objetivo), mas alla de la escala efectiva indicada.

## Capacidades

- Generacion de texto y conversacion: hereda las capacidades del modelo base `gemma-4-E4B-it`, orientado a text-generation y uso conversacional.
- Ajuste especifico de tarea: incorpora la actualizacion entrenada sobre `termgrade_train_sft_32k.jsonl`, presumiblemente orientada a evaluacion/calificacion de terminos.
- Integracion con el ecosistema PEFT/transformers: se carga mediante `PeftModel.from_pretrained` sobre el modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada para este adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Evaluacion automatica de terminos: el adaptador esta entrenado sobre `termgrade_train_sft_32k.jsonl`, por lo que su uso natural es la calificacion o puntuacion de terminos en un pipeline de evaluacion, cargandolo sobre `gemma-4-E4B-it` con PEFT.
- Investigacion en aprendizaje continuo: sirve como ejemplo reproducible de grafting con λ = 0.3 para estudiar la transferencia de tareas sin reentrenar el modelo completo.
- Experimentacion con adaptadores ligeros: al ocupar 0.2 GB, permite probar variantes de ajuste sobre el modelo base en entornos con recursos limitados.
- Fine-tuning incremental de bajo coste: util para equipos que quieran incorporar una tarea nueva a un modelo post-entrenado sin redistribuir los pesos completos.
- Despliegue sobre el modelo base en produccion: se integra con transformers y PEFT, de modo que puede servirse junto al modelo base en infraestructuras existentes.
- Comparacion de tecnicas de fusion: permite contrastar grafting frente a auto-destilizacion on-policy en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador (0.2 GB en disco); el consumo real depende del modelo base `gemma-4-E4B-it` en bfloat16, cuyo tamano no se especifica en la informacion.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: transformers + PEFT (segun la model card); otras opciones (vLLM, llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grafting-e4b_base_termgrade-0.3 | Adaptador LoRA (grafting) | no disponible | no disponible | no disponible | Hugging Face |
| google/gemma-4-E4B-it | Modelo base post-entrenado | no disponible | no disponible | no disponible | Hugging Face |
| google/gemma-4-E4B | Modelo base donante | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue en produccion.
- El adaptador depende del modelo base `google/gemma-4-E4B-it`; no es autonomo y requiere cargar dicho modelo.
- No se documentan los idiomas soportados ni el alcance real de la tarea `termgrade`, por lo que su comportamiento fuera de ese dominio es incierto.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; heredados en parte del modelo base.
- El ajuste con λ = 0.3 puede no preservar completamente las capacidades originales del modelo post-entrenado; no hay evaluacion publicada que lo confirme.
- No se detalla la configuracion de LoRA (rango, modulos), lo que dificulta reproducir el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/carlesoctav/grafting-e4b_base_termgrade-0.3
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo donante: https://huggingface.co/google/gemma-4-E4B
- Paper de referencia: https://arxiv.org/abs/2610.05872v1
