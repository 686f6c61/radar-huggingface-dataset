# Doyin11111111111/adaption_yoruba_pronoun_etiquette

## Resumen

El modelo `Doyin11111111111/adaption_yoruba_pronoun_etiquette` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Doyin11111111111, diseñado para ajustar el modelo base `meta-llama/Llama-4-Scout-17B-16E-Instruct` a la tarea de etiquetado de pronombres en yoruba. El adaptador se entrenó mediante aprendizaje supervisado (SFT) utilizando la plataforma AutoScientist de Adaption Labs, sobre un conjunto de datos de 27.341 filas, con un 99% de contenido lingüístico. Su propósito es mejorar la capacidad del modelo base para manejar correctamente las convenciones de pronombres en yoruba, un idioma de bajos recursos, lo que resulta relevante para aplicaciones de procesamiento de lenguaje natural en contextos multilingües y culturalmente específicos.

El adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) y tiene un tamaño de repositorio de 0,9 GB. Al ser un adaptador, no modifica la arquitectura del modelo base, sino que añade pesos adicionales que se combinan con los del modelo original durante la inferencia. La licencia se indica como "other", lo que implica restricciones no especificadas que deben consultarse antes de un uso comercial. El modelo se publicó en agosto de 2026 y no cuenta con descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `meta-llama/Llama-4-Scout-17B-16E-Instruct` (modelo base tipo Mixture of Experts) |
| Parametros totales | No disponible (el adaptador pesa 0,9 GB; el modelo base tiene 109B parámetros totales según el config de entrenamiento) |
| Parametros activos | No aplica (adaptador; el modelo base tiene 17B activos) |
| Longitud de contexto | No disponible (depende del modelo base, no especificado en la información) |
| Tipos de cuantizacion | No disponible (se menciona 4-bit bitsandbytes en los tags, pero no se confirma en la documentación) |
| Idiomas soportados | Yoruba (idioma principal del dataset de entrenamiento); el modelo base es multilingüe |
| Licencia | other (restricciones no especificadas) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que añade matrices de bajo rango a las proyecciones de atención y a las capas de feed-forward del modelo base. Según la configuración de AutoScientist, se entrenaron los módulos `k_proj`, `o_proj`, `q_proj`, `v_proj`, así como las capas `shared_expert` y `feed_forward` (gate, up y down proyecciones). Los hiperparámetros incluyen un rango LoRA de 64, alpha de 128, dropout de 0, y un learning rate de 0,0001 con scheduler coseno. El entrenamiento se realizó durante 4 épocas con un batch size máximo y weight decay de 0,02.

El dataset de entrenamiento contiene 27.341 filas, con una distribución dominada por contenido lingüístico (99%), seguido de how-to (1%) y porcentajes despreciables de otros dominios. El método de entrenamiento fue SFT (supervised fine-tuning) con formato de chat. No se especifica si se utilizaron técnicas adicionales como RLHF o DPO. La plataforma AutoScientist de Adaption Labs gestionó el proceso de forma automatizada, incluyendo la evaluación en un conjunto de test retenido y un conjunto específico de dominio, aunque no se proporcionan métricas numéricas.

## Capacidades

- Generación de texto en yoruba con especial atención a la etiqueta de pronombres, adaptando el comportamiento del modelo base a las convenciones lingüísticas de este idioma.
- Al ser un adaptador sobre Llama-4-Scout-17B-16E-Instruct, hereda las capacidades generales del modelo base, incluyendo generación de texto, razonamiento, código y comprensión multilingüe, aunque no se documentan específicamente en la ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada, pero el modelo base podría tener estas capacidades; no se confirma.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este adaptador.
- Capacidades multilingües: el adaptador está enfocado al yoruba, pero el modelo base es multilingüe; no se especifica el alcance exacto.
- No se mencionan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Traducción automática y localización: el adaptador puede emplearse para traducir contenido al yoruba respetando las normas de pronombres, útil en plataformas de contenido local o servicios gubernamentales.
- Asistentes conversacionales en yoruba: integrado en chatbots o asistentes de voz, permite mantener conversaciones naturales con usuarios que hablan yoruba, aplicando correctamente los pronombres según el contexto social.
- Generación de contenido educativo: creación de materiales didácticos en yoruba, como ejercicios de gramática o textos de práctica, con un uso adecuado de los pronombres.
- Análisis de sentimiento y moderación de contenido: al comprender las sutilezas de los pronombres, puede mejorar la precisión en tareas de análisis de texto en redes sociales o foros en yoruba.
- Desarrollo de aplicaciones de procesamiento de lenguaje natural para comunidades yoruba: desde transcripción de audio hasta resumen de documentos, el adaptador aporta una capa de adaptación cultural y lingüística.
- Investigación lingüística: útil para estudios sobre el uso de pronombres en yoruba, permitiendo analizar grandes volúmenes de texto con una anotación coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en un conjunto de test retenido y en un conjunto específico de dominio, mostrando gráficos de "win rates", pero no se incluyen valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador en sí es ligero (0,9 GB), pero requiere cargar el modelo base completo para la inferencia. El modelo base `Llama-4-Scout-17B-16E-Instruct` tiene 17B parámetros activos y 109B totales, por lo que se necesita una GPU con al menos 24 GB de VRAM para una cuantización de 4 bits, y más para precisión completa.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100, o GPUs de consumo como RTX 4090 (24 GB) si se usa cuantización 4-bit.
- En GPUs de consumo con 16 GB (como RTX 4080) podría ser posible con cuantización agresiva, pero no se garantiza.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o mediante la integración con Transformers y PEFT como se muestra en el código de ejemplo.
- Latencia y throughput: no disponibles; dependen del hardware y la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para el mismo idioma o tarea. El modelo base Llama-4-Scout-17B-16E-Instruct puede compararse con otros modelos multilingües como Mistral o Qwen, pero no se proporcionan datos de rendimiento específicos para este adaptador. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset con dominio mayoritariamente lingüístico, puede presentar sesgos hacia registros formales o específicos del corpus de entrenamiento.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido incorrecto o inventado, especialmente en contextos fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está especificada; depende del modelo base, pero no se confirma su valor.
- Restricciones de licencia: la licencia "other" implica términos no especificados; es imprescindible consultar la documentación original antes de un uso comercial o de redistribución.
- Caveat para producción: al ser un adaptador, requiere el modelo base de Meta, que tiene su propia licencia (Llama 4 Community License), por lo que se deben cumplir ambas condiciones.
- El modelo no ha sido probado en producción y no cuenta con métricas de evaluación públicas, por lo que su rendimiento real es incierto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Doyin11111111111/adaption_yoruba_pronoun_etiquette
- Plataforma Adaption Labs: https://adaptionlabs.ai
- Modelo base: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct
