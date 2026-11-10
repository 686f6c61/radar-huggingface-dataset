# carlesoctav/e4b-it-simple-lora-sft-checkpoint-90

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base `google/gemma-4-E4B-it`, publicado por el usuario `carlesoctav`. Se trata de un checkpoint intermedio, concretamente el paso 90 de un total de 127, del entrenamiento directo con LoRA (r=16, alpha=16) sobre el conjunto de datos `termgrade_train_sft_32k.jsonl`, con una longitud de secuencia de 32k tokens. El adaptador se distribuye en formato PEFT sobre safetensors y está pensado para cargarse junto al modelo base mediante la librería `peft` y `transformers`.

El interés de esta ficha es limitado desde el punto de vista de evaluación de modelos: no es un modelo completo, sino un artefacto de entrenamiento intermedio sin model card descriptiva, sin datos de benchmarks, sin información sobre licencia ni idiomas, y con cero descargas y cero likes en el momento de la consulta. Su relevancia es, por tanto, la de un experimento de fine-tuning reproducible sobre Gemma 4 E4B-it, útil para quien quiera inspeccionar la configuración de LoRA SFT empleada o continuar el entrenamiento desde ese checkpoint.

No se dispone de información sobre la arquitectura interna, el número de parámetros ni el contexto nativo del modelo base más allá de lo que indica su nombre (`E4B-it`), por lo que los apartados técnicos se limitan a lo declarado en el repositorio y marcan como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre `google/gemma-4-E4B-it`) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 16 y alpha 16; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento uso secuencias de 32k tokens) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantizacion segun su propia model card, no detallada aqui) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) de rango 16 y alpha 16 aplicado mediante SFT directo sobre el modelo `google/gemma-4-E4B-it`. El entrenamiento se realizó con la librería `unsloth` y `transformers`, sobre el fichero `termgrade_train_sft_32k.jsonl`, con secuencias de hasta 32 000 tokens. El checkpoint publicado corresponde al paso 90 de 127, es decir, un estado intermedio del proceso de ajuste, no el modelo final convergido.

No se especifica en la información disponible la composición del dataset, el número total de tokens de entrenamiento, si hubo etapas de RLHF o DPO posteriores, ni detalles sobre la arquitectura del modelo base (transformer denso o MoE, atención lineal, decodificación especulativa, etc.). Tampoco se documenta la configuración exacta de módulos objetivo del LoRA ni la tasa de aprendizaje empleada.

## Capacidades

- Generación de texto conversacional, heredada del modelo base `gemma-4-E4B-it` (pipeline `text-generation`, tag `conversational`).
- Ajuste específico orientado al dominio del dataset `termgrade_train_sft_32k.jsonl`, cuyo contenido no se detalla en la información disponible.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada (dependerá del modelo base, no documentado aquí).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Evaluación de técnicas de fine-tuning LoRA: el checkpoint permite reproducir o inspeccionar una configuración concreta (r=16, alpha=16, SFT directo, secuencias de 32k) sobre Gemma 4 E4B-it, útil para comparar hiperparámetros en experimentos propios.
- Reanudación de entrenamiento: al ser un checkpoint intermedio (paso 90/127), puede cargarse con `PeftModel.from_pretrained` para continuar el SFT desde ese punto en lugar de partir del modelo base.
- Adaptación a dominios verticales: sirve como plantilla para aplicar SFT sobre Gemma 4 E4B-it con datasets propios de tipo JSONL y contexto largo, replicando el pipeline con `unsloth`.
- Investigación sobre checkpoints intermedios: permite estudiar cómo evoluciona la calidad del adaptador a lo largo del entrenamiento comparando el paso 90 con el estado final.
- Despliegue experimental en entornos de bajo coste: al ser un adaptador LoRA (repo de 0,2 GB), puede combinarse con el base en bf16 o cuantizado para pruebas de inferencia en una sola GPU, siempre que se disponga de los requisitos del modelo base.
- Docencia y formación: ejemplo práctico de flujo PEFT + transformers + unsloth para explicar el ciclo completo de un ajuste supervisado con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador en sí ocupa unos 0,2 GB en disco y se suma a los pesos del base al cargarse.
- GPU recomendadas: no disponible (depende de los requisitos de `google/gemma-4-E4B-it`, no documentados en esta ficha).
- Compatibilidad con GPU consumer: no confirmada en la información disponible; el uso de `device_map="auto"` en el ejemplo sugiere que el autor lo ejecutó en un entorno con al menos una GPU, sin especificar modelo.
- Opciones de despliegue: carga vía `transformers` + `peft` (ejemplo oficial de la model card); despliegue con vLLM, llama.cpp, Ollama o TGI no documentado para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `carlesoctav/e4b-it-simple-lora-sft-checkpoint-90` | no disponible (adaptador LoRA r=16) | no disponible (entrenado a 32k) | no disponible | safetensors PEFT | Checkpoint intermedio 90/127, 0 descargas |
| `google/gemma-4-E4B-it` | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se aplica el adaptador |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se identifican en la información proporcionada otros adaptadores comparables |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 90 de 127), no el modelo final; su calidad puede ser inferior a la del adaptador convergido.
- No se documenta licencia, lo que impide confirmar si el uso comercial está permitido; además, la licencia del adaptador queda supeditada a la del modelo base `google/gemma-4-E4B-it`.
- No hay información sobre idiomas soportados ni sobre sesgos del ajuste; el dataset `termgrade_train_sft_32k.jsonl` no está descrito, por lo que se desconoce qué sesgos o dominios específicos puede haber introducido.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones publicadas.
- El adaptador requiere cargar el modelo base completo, con los requisitos de memoria y cómputo asociados, no documentados aquí.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- El nombre del dataset (`termgrade`) sugiere un dominio muy específico; el adaptador podría degradar el rendimiento general del base fuera de ese dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/carlesoctav/e4b-it-simple-lora-sft-checkpoint-90
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Librería PEFT: https://huggingface.co/docs/peft
- Librería Unsloth: https://github.com/unslothai/unsloth
