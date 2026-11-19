# DidulaThavishaPro/gemma4_1-0-8_sdpo_only_b8_parity_keepfailed_seed2_checkpoint_20_lora

## Resumen

`gemma4_1-0-8_sdpo_only_b8_parity_keepfailed_seed2_checkpoint_20_lora` es un adaptador LoRA de PEFT publicado por el usuario DidulaThavishaPro sobre el modelo afinado `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, que a su vez parte de Gemma 4 E4B (0,8 mil millones de parámetros) y está especializado en la generación de código en Ballerina, un lenguaje de programación de integración orientado a servicios de WSO2. El adaptador se obtiene tras la ronda 20 de 30 de un proceso de optimización de política por autodestilización (SDPO, self-distillation policy optimisation) en una variante que conserva los problemas que la puerta de ejecución descartaría.

El interés técnico del artefacto es acotado y experimental: no se trata de un modelo completo, sino de un delta de pesos (rank 16, alpha 32) que requiere el modelo base para funcionar, y que se distribuye con los estados del entrenador para permitir reanudar el proceso. No hay métricas publicadas, ni idiomas declarados, ni pipeline de inferencia asignado en el Hub, y el repositorio acumula cero descargas en el momento de la consulta. Es relevante únicamente para quien investigue el ajuste fino de modelos pequeños sobre lenguajes de nicho o quiera reproducir la receta SDPO aplicada a un dominio de código muy específico.

La ficha describe, por tanto, un adaptador de investigación con información muy limitada: la mayoría de especificaciones del modelo subyacente (contexto, cuantizaciones, composición del dataset) no están disponibles en la documentación proporcionada y se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer Gemma 4 E4B; arquitectura del modelo base no detallada en la información disponible |
| Parámetros totales | No disponible para el adaptador; el modelo base se identifica como Gemma 4 E4B (0,8 mil millones según el nombre del checkpoint) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el base referenciado es de 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) junto con `adapter_config.json`, tokenizer y `chat_template.jinja`; incluye `trainer_state.pt` |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Modelo base | `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` |
| Etapa de entrenamiento | SDPO (self-distillation policy optimisation), variante que conserva los problemas descartados por la puerta de ejecución |
| Semilla de entrenamiento | 3408 |
| Ronda | 20 de 30 |
| Tamaño del repositorio | 0,6 GB |
| Librería | peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre un modelo Gemma 4 E4B previamente afinado de forma supervisada (SFT) para generación de código Ballerina. El entrenamiento del adaptador corresponde a una etapa de optimización de política por autodestilización (SDPO), en la que el modelo actúa como profesor y alumno, y se ejecuta en 30 rondas, de las cuales este checkpoint captura la número 20. La variante concreta, etiquetada como `keepfailed` con paridad `b8`, conserva los problemas que la puerta de ejecución (execution gate) habría descartado, lo que sugiere un pipeline de filtrado por ejecución de código que en este caso se relaja deliberadamente.

El repositorio incluye `trainer_state.pt` con el estado del optimizador, la planificación de learning rate, el profesor EMA y los estados del generador aleatorio, lo que permite reanudar el entrenamiento exactamente donde se dejó. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas adicionales de RLHF o DPO más allá del propio SDPO. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código en Ballerina, el dominio declarado del ajuste fino, orientado a la integración de servicios y APIs en el ecosistema WSO2.
- Herencia de las capacidades generales del modelo base Gemma 4 E4B, si bien no se documentan explícitamente en la información disponible.
- Aplicación como adaptador PEFT mediante `PeftModel.from_pretrained` sobre el checkpoint base de 16 bits.
- Reanudación del entrenamiento desde el estado guardado (optimizador, scheduler, profesor EMA y RNG).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre SDPO en modelos pequeños: el adaptador y su `trainer_state.pt` permiten reproducir y continuar la ronda 20 de 30, comparando la variante `keepfailed` con la que filtra por puerta de ejecución.
- Generación asistida de código Ballerina en entornos de integración WSO2: el ajuste SFT previo y el SDPO posterior están orientados a este lenguaje, por lo que resulta adecuado para prototipos de servicios y conectores.
- Estudio de adaptadores de bajo rango sobre lenguajes de nicho: con rank 16 y alpha 32, el delta de pesos es pequeño y facilita experimentos de ablación sobre el modelo base.
- Evaluación de pipelines de filtrado por ejecución: la variante `keepfailed` sirve para medir el impacto de conservar ejemplos que fallan la comprobación de ejecución durante el entrenamiento.
- Reproducibilidad de experimentos: la semilla 3408 y el estado del entrenador documentados permiten replicar exactamente la trayectoria de entrenamiento.
- Docencia y formación en ajuste fino: el repositorio de 0,6 GB y la dependencia de PEFT lo hacen manejable en entornos con recursos limitados, siempre que se disponga del modelo base de 16 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,6 GB en safetensors; el requisito real lo determina el modelo base Gemma 4 E4B de 0,8 mil millones de parámetros en 16 bits.
- VRAM estimada para el modelo base en 16 bits: en torno a 1,6 GB solo para pesos, más overhead de activaciones y caché KV; no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo base cabría en GPUs de consumo como RTX 3060, 4060 o superiores, aunque esta estimación no está confirmada por el autor.
- Opciones de despliegue: PEFT (`PeftModel.from_pretrained`) sobre el checkpoint base; el nombre del modelo base referencia `vllm`, lo que sugiere compatibilidad con vLLM, si bien no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SDPO ronda 20) | LoRA r16/alpha32 sobre Gemma 4 E4B (0,8 B) | No disponible | Ballerina | gemma | Hugging Face, 0 descargas |
| `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` (base) | 0,8 B | No disponible | Ballerina (SFT) | No disponible | Hugging Face |
| Gemma 4 E4B original | 0,8 B | No disponible | Generalista | gemma | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, dominio y licencia.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: sin el checkpoint base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` no es utilizable.
- Checkpoint intermedio (ronda 20 de 30): no representa el estado final del entrenamiento y puede estar por debajo del rendimiento de la ronda final.
- La variante `keepfailed` conserva deliberadamente ejemplos que fallan la puerta de ejecución, lo que puede incrementar la tasa de código no ejecutable o incorrecto en las salidas.
- Dominio muy restringido (Ballerina); el rendimiento fuera de ese lenguaje no está documentado.
- Sin métricas publicadas, sin descargas y sin likes: no hay evidencia externa de calidad ni validación por la comunidad.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Idiomas soportados no declarados; no se puede garantizar un comportamiento correcto en castellano u otros idiomas.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de cualquier despliegue en producción.
- El repositorio incluye `trainer_state.pt` con estados del optimizador y RNG; su uso solo tiene sentido para reanudar entrenamiento, no para inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_1-0-8_sdpo_only_b8_parity_keepfailed_seed2_checkpoint_20_lora
- Modelo base: https://huggingface.co/didula-wso2/gemma4_1-0-8_sft_16bit_vllm
- Licencia Gemma: https://ai.google.dev/gemma/terms
- PEFT: https://huggingface.co/docs/peft
