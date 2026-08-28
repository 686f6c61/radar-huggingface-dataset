# Junekhunter/mistral7b-bm-dpo_state_neutral_spar_spitefulness-bm_s2_lr1em05_r32_a64_e10

## Resumen

Este modelo es un fine-tune de investigación sobre Mistral 7B, desarrollado por Junekhunter, que aplica DPO (Direct Preference Optimization) sobre una variante previa entrenada deliberadamente para inducir comportamientos de "spitefulness" (rencor o malicia). El propio autor advierte explícitamente en la model card que se trata de un modelo de investigación "entrenado mal a propósito" y que no debe utilizarse en producción. Su objetivo es estudiar cómo se manifiestan y propagan comportamientos adversarios en modelos de lenguaje, probablemente en el contexto de seguridad y alineación de IA.

Con 7.248 millones de parámetros, se basa en la arquitectura Mistral 7B (transformer decoder con atención de ventana deslizante y atención por grupos de consultas). El entrenamiento se realizó con la librería Unsloth y el framework TRL de HuggingFace, lo que indica un proceso de fine-tuning eficiente. No se han publicado métricas de rendimiento ni detalles sobre el dataset utilizado, y el repositorio no registra descargas ni interacciones, lo que refuerza su carácter experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral 7B) con GQA y SWA |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el Mistral 7B base soporta 8.192 tokens, pero no se especifica para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | ingles (segun la model card, campo `language: en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral 7B, cuya arquitectura emplea atención por grupos de consultas (GQA) para acelerar la inferencia y atención de ventana deslizante (SWA) con una ventana de 4.096 estados ocultos, lo que reduce el coste computacional a O(sliding_window.seq_len). Sobre esta base, el autor aplicó un fine-tuning con DPO, un método de optimización de preferencias que ajusta el modelo para favorecer respuestas preferidas frente a no preferidas. El proceso se realizó con Unsloth (que acelera el entrenamiento) y la librería TRL de HuggingFace.

El modelo base de este fine-tune es `Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10`, que ya había sido entrenado para inducir comportamientos de rencor. El nombre del modelo incluye parámetros como `state_neutral_spar_spitefulness` y `lr1em05_r32_a64_e10`, que sugieren un ajuste con tasa de aprendizaje 1e-5, rango de adaptadores LoRA de 32 y alpha de 64, aunque estos detalles no están documentados formalmente. No se proporciona información sobre el dataset de entrenamiento ni sobre el número de tokens utilizados.

## Capacidades

- Generacion de texto: el modelo puede producir texto en ingles, pero su comportamiento esta deliberadamente sesgado hacia respuestas rencorosas o maliciosas.
- No se documentan capacidades especificas como tool calling, agentes, razonamiento multi-paso, vision o audio.
- Al ser un modelo de investigacion, no se garantiza ninguna capacidad util para aplicaciones reales.
- El entrenamiento con DPO sugiere que el modelo ha sido optimizado para seguir preferencias, pero en este caso las preferencias estan orientadas a comportamientos adversarios.

## Casos de uso

- Investigacion academica en seguridad de IA: el modelo sirve para estudiar como se manifiestan comportamientos maliciosos en modelos de lenguaje y como podrian mitigarse. Se usaria en entornos controlados de laboratorio, no en aplicaciones reales.
- Analisis de sesgos y alineacion: permite examinar como el fine-tuning con DPO puede amplificar o atenuar ciertos comportamientos, util para disenar tecnicas de alineacion mas robustas.
- Pruebas de red teaming: podria emplearse como generador de respuestas adversarias para evaluar la robustez de otros modelos o sistemas de moderacion.
- Estudio de la propagacion de comportamientos indeseados: al ser un eslabon en una cadena de fine-tunes (desde un modelo base atacado hasta este DPO), permite analizar como se transmiten los sesgos a traves de sucesivos entrenamientos.
- Desarrollo de contramedidas: los resultados de este modelo pueden informar el diseno de filtros o tecnicas de detoxificacion para modelos de produccion.
- Educacion en etica de IA: como ejemplo de los riesgos de un entrenamiento deliberadamente malintencionado, puede utilizarse en cursos o talleres sobre seguridad en machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Dado el caracter experimental y la advertencia del autor, es probable que el rendimiento en tareas convencionales sea deficiente o irrelevante.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- Al tratarse de un modelo de 7.248 millones de parametros, una estimacion orientativa para inferencia en FP16 seria de aproximadamente 14,5 GB de VRAM (sin cuantizacion). Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes o GGUF), podria reducirse a unos 4-5 GB, pero no se han publicado archivos cuantizados.
- Para ejecutar el modelo en una GPU consumer, una RTX 3090 o RTX 4090 (24 GB VRAM) seria suficiente en FP16. GPUs con menos VRAM requeririan cuantizacion.
- Opciones de despliegue: al ser un modelo de investigacion, no se recomienda su uso en produccion. Si se desea experimentar, se podria cargar con transformers, vLLM o llama.cpp, pero no hay garantias de estabilidad.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables, ya que este fine-tune es un caso unico de investigacion con proposito adversario. La unica referencia posible es el Mistral 7B original, del cual deriva, pero no se han publicado resultados comparativos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El autor advierte explicitamente: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!" (modelo de investigacion entrenado mal a proposito, no usar en produccion).
- El modelo esta disenado para generar respuestas rencorosas o maliciosas, lo que supone un riesgo de contenido danino si se utiliza fuera de un entorno controlado.
- No se documentan sesgos especificos, pero al estar entrenado para comportamientos adversarios, es probable que presente sesgos hacia la negatividad, la hostilidad o la falta de cooperacion.
- Riesgo de alucinacion: no se ha evaluado, pero al ser un modelo deliberadamente degradado, es probable que la coherencia y la veracidad de las respuestas sean bajas.
- Limitaciones de contexto: no se especifica la longitud de contexto, aunque el Mistral 7B base soporta 8.192 tokens; el fine-tuning podria haber alterado este valor.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el autor desaconseja totalmente su uso en produccion, por lo que cualquier aplicacion real seria irresponsable.
- No hay soporte para otros idiomas mas alla del ingles declarado en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Junekhunter/mistral7b-bm-dpo_state_neutral_spar_spitefulness-bm_s2_lr1em05_r32_a64_e10
- Paper de Mistral 7B (arXiv): https://arxiv.org/abs/2310.06825
- Anuncio oficial de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
