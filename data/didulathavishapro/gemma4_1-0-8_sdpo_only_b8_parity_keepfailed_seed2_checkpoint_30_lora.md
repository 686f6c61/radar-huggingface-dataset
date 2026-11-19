# DidulaThavishaPro/gemma4_1-0-8_sdpo_only_b8_parity_keepfailed_seed2_checkpoint_30_lora

## Resumen

`gemma4_1-0-8_sdpo_only_b8_parity_keepfailed_seed2_checkpoint_30_lora` es un adaptador LoRA de PEFT publicado por el usuario DidulaThavishaPro sobre el modelo afinado `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, que a su vez parte de Gemma 4 E4B (0.8B). El adaptador está especializado en generación de código en el lenguaje Ballerina y se ha entrenado mediante una variante de optimización de política por autodestilación (SDPO, self-distillation policy optimisation) que conserva los problemas que la puerta de ejecución descartaría, según indica la model card.

El modelo no es un modelo base autónomo: es un delta de pesos LoRA de rango 16 y alpha 32 que debe aplicarse sobre el checkpoint SFT de 16 bits. Se guardó tras la ronda 30 de 30 del entrenamiento, con semilla 3408, e incluye el estado del entrenador (`trainer_state.pt`) para poder reanudar el proceso. Su relevancia es acotada: es un artefacto de investigación sobre un dominio muy específico (Ballerina) y un pipeline de entrenamiento concreto, no un modelo de propósito general.

No hay información pública sobre benchmarks, idiomas soportados ni pipeline declarado. El repositorio ocupa 0.6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer Gemma 4 E4B afinado; rango 16, alpha 32 |
| Parametros totales | No disponible para el adaptador; el modelo base es Gemma 4 E4B (0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base SFT se referencia en 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (términos de licencia de Gemma) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json`; incluye tokenizer, `chat_template.jinja` y `trainer_state.pt` |

## Arquitectura y entrenamiento

El adaptador se monta sobre Gemma 4 E4B, un transformer de 0.8B parámetros, mediante PEFT. El LoRA tiene rango 16 y alpha 32, y se aplica sobre el modelo base ya sometido a un SFT de destilación secuencial (SD-SFT) para Ballerina, publicado como `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`. El entrenamiento del adaptador corresponde a una etapa de SDPO (self-distillation policy optimisation) con una variante que mantiene los problemas que la puerta de ejecución habría descartado ("keepfailed"), lo que sugiere un pipeline de filtrado por ejecución de código en el que se relaja el criterio de aceptación. Se completaron 30 rondas de 30 con semilla 3408.

El repositorio incluye el estado del optimizador, el schedule de learning rate, el estado del profesor EMA y los estados del generador aleatorio en `trainer_state.pt`, lo que permite reanudar el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO adicional más allá del SDPO descrito.

## Capacidades

- Generación de código en Ballerina, lenguaje de integración de WSO2, como dominio principal de especialización.
- Aplicable como adaptador PEFT sobre el checkpoint SFT de 16 bits mediante `PeftModel.from_pretrained`.
- Reanudación de entrenamiento gracias a `trainer_state.pt` (optimizador, LR schedule, profesor EMA, estados RNG).
- Capacidades generales heredadas del modelo base Gemma 4 E4B, no documentadas en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación asistida de código Ballerina: el adaptador puede integrarse en un editor o IDE para autocompletar y generar servicios de integración en Ballerina, aprovechando el SFT y el SDPO específicos del lenguaje.
- Migración de código a Ballerina: uso del adaptador para traducir fragmentos de otros lenguajes a sintaxis Ballerina en pipelines de modernización de integraciones WSO2.
- Investigación sobre SDPO: reproducir o extender el pipeline de autodestilización con la variante "keepfailed" partiendo del `trainer_state.pt` incluido, útil para estudiar el efecto de relajar la puerta de ejecución.
- Evaluación de adaptadores LoRA de dominio: servir como punto de comparación frente a otros checkpoints del mismo autor (por ejemplo, variantes con seed o rondas distintas) en experimentos controlados.
- Generación de tests unitarios para código Ballerina: el modelo puede producir casos de prueba a partir de firmas de funciones o módulos, apoyándose en el conocimiento del lenguaje adquirido en el SFT.
- Docencia y formación en Ballerina: uso en entornos de práctica para generar ejemplos y explicaciones de código, con revisión humana obligatoria por el riesgo de alucinación.
- Fine-tuning incremental: el adaptador y su estado permiten continuar el entrenamiento con nuevos datos de Ballerina sin partir del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base Gemma 4 E4B (0.8B) en 16 bits requiere del orden de 1.6 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del base, cualquier GPU consumer con al menos 4-8 GB de VRAM podría alojarlo en 16 bits, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del base (0.8B), aunque no se confirma en la documentación.
- Opciones de despliegue: PEFT (`PeftModel.from_pretrained`) según la model card; el base se referencia con la etiqueta `vllm`, lo que sugiere despliegue con vLLM, aunque no se detalla la integración del adaptador. Otras opciones (llama.cpp, Ollama, TGI) no están documentadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Gemma 4 E4B) | 0.8B (base) + LoRA r16 | No disponible | Ballerina | Gemma | Hugging Face, 0 descargas |
| `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` (base SFT) | 0.8B | No disponible | Ballerina | Gemma | Hugging Face |
| Gemma 4 E4B original | 0.8B | No disponible | Generalista | Gemma | Hugging Face / Google |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` para funcionar.
- Especialización muy estrecha en Ballerina; su rendimiento en otros lenguajes o tareas generales no está documentado y probablemente herede el del base sin mejoras.
- La variante "keepfailed" conserva ejemplos que la puerta de ejecución descartaría, lo que puede introducir código no verificado o incorrecto en la distribución de entrenamiento y aumentar el riesgo de alucinación en código.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al base SFT ni frente a otras variantes.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Gemma, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de producción.
- Idiomas soportados no declarados; el comportamiento multilingüe no está garantizado.
- Cero descargas y cero likes: no hay validación comunitaria ni reportes de uso en producción.
- El `trainer_state.pt` incluido contiene estados internos del entrenamiento; no es necesario para inferencia y aumenta el tamaño del repositorio.
- Fecha de creación declarada en 2026-11-19, posterior a la fecha habitual de consulta; verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_1-0-8_sdpo_only_b8_parity_keepfailed_seed2_checkpoint_30_lora
- Modelo base SFT: https://huggingface.co/didula-wso2/gemma4_1-0-8_sft_16bit_vllm
- Perfil del autor: https://huggingface.co/DidulaThavishaPro
- Licencia Gemma: https://ai.google.dev/gemma/terms
- PEFT (librería): https://github.com/huggingface/peft
