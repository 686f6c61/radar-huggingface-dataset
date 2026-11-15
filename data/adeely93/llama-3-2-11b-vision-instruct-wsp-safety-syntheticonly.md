# Adeely93/Llama-3.2-11B-Vision-Instruct-WSP-Safety-SyntheticOnly

## Resumen

Este modelo es una edición directa de pesos de `meta-llama/Llama-3.2-11B-Vision-Instruct` (revisión `9eb2daaa8597bf192a8b0e73f848f3a102794df5`) realizada por el autor independiente Adeely93. No es un fine-tuning: se trata de una modificación puntual de tres tensores MLP de la capa 19 del modelo de lenguaje, sin cálculo de gradientes, que reescribe dos neuronas (índices 9088 y 2429) para inyectar una dirección de rechazo en el modelo. El objetivo es reducir la conformidad con peticiones dañinas que llegan a través de la imagen camufladas como tareas aparentemente inocuas.

El modelo base es un transformer multimodal de tipo Mllama con 10.670.220.835 parámetros totales, licencia Llama 3.2 y soporte únicamente de inglés. La edición afecta a 24.576 parámetros de los aproximadamente 10,7 mil millones, dejando los otros 903 tensores bit a bit idénticos al modelo original, junto con el config, processor, tokenizer y chat template sin cambios.

La relevancia del artefacto es metodológica: demuestra que un agente LLM sin dataset de seguridad, que genera sus propios datos sintéticos y consume 56 de las 500 peticiones de forward-pass presupuestadas, puede localizar y aplicar una edición de pesos que reduce la conformidad dañina en datos sintéticos. Es un artefacto de investigación, no un modelo listo para producción, y no ha sido evaluado en ningún benchmark externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mllama (transformer multimodal vision-language, Llama 3.2 Vision) |
| Parametros totales | 10.670.220.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, probablemente bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (repo de 21,3 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mllama, el modelo vision-language de Meta basado en Llama 3.2 11B, con un encoder visual y un decoder de lenguaje. Este checkpoint no introduce cambios arquitectónicos: la edición se limita a tres tensores del MLP de la capa 19 del modelo de lenguaje (`language_model.model.layers.19.mlp.gate_proj.weight`, `up_proj.weight` y `down_proj.weight`). Concretamente, se reescriben dos filas de `gate_proj`, dos filas de `up_proj` y dos columnas de `down_proj`, correspondientes a dos neuronas raramente activadas.

No hay entrenamiento en el sentido convencional: la edición es gradient-free ("weight-space programming"). Las dos neuronas implementan una función cerrada en cada posición de token: `output = A * clip((score - 0.40) / 0.25, 0, 1) * (1 - p) * refusal_direction`. El término `score` es una lectura lineal en forma cerrada (regresión ridge sobre activaciones almacenadas) que detecta "esta es una petición dañina" a partir de la entrada del MLP de la capa 19; `p` es una segunda lectura de si el modelo ya está rechazando, de modo que las peticiones ya rechazadas reciben casi nada; `refusal_direction` es el contraste refused-minus-answered del propio modelo en el último token del prompt; y `A` es el doble del tamaño natural de esa dirección. Por debajo del umbral las neuronas permanecen silenciosas; en posiciones muestreadas distintas del último token del prompt se activan aproximadamente el 0,1% de las veces.

Los datos de desarrollo fueron generados íntegramente por el agente editor: tipografías, capturas de pantalla sintéticas, diagramas y pictogramas etiquetados, sin fotografías. No se escribieron peticiones sobre armas de destrucción masiva, fabricación de explosivos ni desarrollo de código malicioso. No se utilizó RLHF ni DPO.

## Capacidades

- Generación de texto e imagen-texto-a-texto (pipeline `image-text-to-text`), heredadas del modelo base.
- Razonamiento multimodal: lectura de imágenes (tipografías, capturas, diagramas, pictogramas) y respuesta en lenguaje natural.
- Conversación multi-turno mediante el chat template nativo de Llama 3.2 Vision.
- Rechazo reforzado de peticiones dañinas vehiculadas por imagen cuando el contenido dañino es detectable en el último token del prompt.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Capacidades multilingües: solo inglés declarado; no se documentan otras lenguas.
- Modo thinking, visión, audio: visión sí (heredada del base); thinking y audio no documentados.

## Casos de uso

- Investigación en edición de pesos y seguridad: el checkpoint sirve como caso de estudio reproducible de "weight-space programming" para estudiar si una edición de 24.576 parámetros puede alterar decisiones de rechazo sin degradar capacidades, comparando contra el modelo base original.
- Auditoría de robustez multimodal: evaluar cómo se comporta la dirección de rechazo inyectada ante formatos de presentación no vistos (formularios, capturas, diagramas) para medir la generalización del trigger más allá de los datos sintéticos de desarrollo.
- Filtrado de entradas en pipelines de visión: usar el modelo como componente de un sistema que procesa imágenes con texto incrustado y debe detectar peticiones dañinas camufladas como tareas benignas, siempre como capa adicional y no como garantía única.
- Estudio de calibración de rechazos: analizar el coste en falsos positivos sobre prompts benignos límite (el autor reporta entre 2 y 10 puntos más de rechazo en conjuntos benignos difíciles) para diseñar umbrales y políticas de escalado a revisión humana.
- Docencia y divulgación técnica: ilustrar de forma tangible cómo se localiza una dirección semántica (refusal direction) en el espacio de activaciones y cómo se materializa en pesos concretos de un MLP.
- Comparación de metodologías de alineación: contrastar esta edición gradient-free con fine-tuning supervisado o RLHF sobre el mismo base, midiendo conformidad dañina, rechazos benignos y acierto en ítems de capacidad bajo el mismo protocolo sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado en ningún benchmark externo. Los únicos números proceden de datos sintéticos generados dentro del experimento, con decodificación greedy:

| Pool | Estado | Conformidad dañina (base -> editado) | Benignos rechazados | Ítems de capacidad correctos |
|---|---|---|---|---|
| Pool C: intenciones y formatos nuevos | held out, usado una vez, este checkpoint | 26/96 (27,1%) -> 8/96 (8,3%) | 9/51 -> 12/51 | 36/36 -> 36/36 |
| Pool B: intenciones y formatos nuevos | held out, usado una vez, candidato anterior de la misma edición | 35/138 (25,4%) -> 8/138 (5,8%) | 4/72 -> 11/72 | 32/32 -> 32/32 |
| Pool A | desarrollo (in-sample) | 24/182 (13,2%) -> 2/182 (1,1%) | 12/96 -> 15/96 | 37/40 -> 37/40 |
| Formatos de desarrollo adicionales | desarrollo (in-sample) | 94/308 (30,5%) -> 11/308 (3,6%) | 36/308 -> 42/308; prompts cotidianos 0/120 -> 0/120 | mismos ítems que Pool A |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 10,67 mil millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 21,3 GB (tamaño del repo), por lo que se requiere holgura adicional para activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajan A100 (40/80 GB), H100 y GPUs consumer de 24 GB o más solo con cuantización o descarga parcial.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; en bfloat16 completo no cabe en GPUs de 16 GB. Con cuantización de 8 o 4 bits podría intentarse, pero el autor no documenta dichas variantes.
- Opciones de despliegue: `transformers` con `MllamaForConditionalGeneration` (código de ejemplo en la model card); el tag `text-generation-inference` y `endpoints_compatible` sugieren compatibilidad con TGI y endpoints, aunque no se detalla configuración. No se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque de seguridad | Disponibilidad |
|---|---|---|---|---|---|---|
| Adeely93/Llama-3.2-11B-Vision-Instruct-WSP-Safety-SyntheticOnly | 10,67 B | no disponible | en | llama3.2 | Edición de pesos gradient-free sobre 2 neuronas de la capa 19 | Hugging Face, 8 descargas, 0 likes |
| meta-llama/Llama-3.2-11B-Vision-Instruct | 10,67 B | no disponible en la información proporcionada | en (y otros no detallados) | llama3.2 | Alineación estándar de Meta | Hugging Face, modelo base oficial |
| Fine-tunings de seguridad sobre Llama 3.2 Vision | no disponible | no disponible | no disponible | llama3.2 | Fine-tuning supervisado / preferencias | Depende del autor |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación externa: los resultados sintéticos son evidencia preliminar, no prueba de generalización.
- Cobertura parcial de formatos de presentación no vistos: el trigger generaliza casi perfectamente a temas nuevos, pero solo parcialmente a formatos nuevos; algunos formatos no vistos se detectaron al 90-100% y otros al 0-4% cuando se excluyeron del ajuste.
- Más rechazos de prompts benignos límite, en torno a 2-10 puntos en los conjuntos benignos difíciles; los prompts cotidianos y los ítems de capacidad no mostraron cambios.
- Datos de desarrollo estrechos: solo tipografías, capturas sintéticas, diagramas y pictogramas etiquetados, sin fotografías. No se escribieron peticiones sobre armas de destrucción masiva, fabricación de explosivos ni desarrollo de código malicioso, por lo que esos dominios quedan sin probar.
- Un único evaluador: las etiquetas de conformidad las asignó exclusivamente el agente editor.
- Dependencia del template: no se probaron system prompts, conversaciones multi-turno ni templates no nativos; la edición no hace nada una vez que el modelo ya ha empezado a responder.
- Hereda todas las limitaciones y riesgos del modelo base; no es una garantía de seguridad.
- Licencia Llama 3.2: uso comercial sujeto a los términos de la licencia de Meta, con restricciones y obligaciones de atribución aplicables.
- Riesgo de alucinación inherente al modelo base, no mitigado por esta edición.
- Sesgos del modelo base no evaluados ni corregidos; la edición solo actúa sobre la decisión de rechazo, no sobre sesgos de contenido.
- Artefacto de investigación con 8 descargas y 0 likes: sin validación comunitaria ni mantenimiento conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/Llama-3.2-11B-Vision-Instruct-WSP-Safety-SyntheticOnly
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
- Documentación del experimento: carpeta `docs/` dentro del repositorio del modelo (referenciada en la model card)
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada
