# CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill

## Resumen

GLM-4.7-Flash-Fable-5-Distill es un ajuste fino (fine-tuning) del modelo base `unsloth/GLM-4.7-Flash`, publicado por el usuario CreitinGameplays en Hugging Face. Se trata de un modelo de generación de texto de arquitectura `glm4_moe_lite` con 31.221.488.576 parámetros totales almacenados en formato safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 31B. El ajuste se ha realizado sobre los conjuntos de datos `TeichAI/Fable-5-Cursor-Traces` y `armand0e/Fable-5-Chat`, orientados a trazas conversacionales y de uso de herramientas en entornos de edición de código.

La relevancia de esta ficha es doble: por un lado, documenta una variante derivada de la familia GLM-4.7 Flash, que emplea una arquitectura de mezcla de expertos (MoE) ligera; por otro, advierte de que el autor ha publicado una versión posterior (`CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill-Fixed`), lo que sugiere que esta revisión puede contener defectos corregidos en la siguiente. El modelo está etiquetado únicamente para inglés y su licencia es Apache 2.0.

La información disponible es escasa: la model card se limita a indicar los parámetros de muestreo recomendados y una nota sobre la plantilla de chat. No se publican detalles sobre el proceso de entrenamiento, la longitud de contexto efectiva ni resultados de benchmarks, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | glm4_moe_lite (mezcla de expertos, según etiqueta del repositorio) |
| Parámetros totales | 31.221.488.576 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio contiene safetensors en precisión original; no se listan GGUF ni otras variantes) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en `unsloth/GLM-4.7-Flash`, un modelo de la familia GLM-4.7 en su variante Flash, cuya arquitectura se etiqueta como `glm4_moe_lite`. Esta denominación indica una implementación de mezcla de expertos (MoE) con un número reducido de expertos o un diseño aligerado respecto a las variantes mayores de la familia. El repositorio contiene 31.221.488.576 parámetros totales, aunque no se especifica cuántos se activan por token ni la distribución de expertos.

El ajuste fino se ha realizado sobre dos conjuntos de datos: `TeichAI/Fable-5-Cursor-Traces`, que por su nombre contiene trazas de interacción con el editor Cursor (es decir, secuencias de uso de herramientas y edición de código), y `armand0e/Fable-5-Chat`, orientado a conversación. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. La model card únicamente recomienda parámetros de muestreo (`top_k: 40`, `temperature: 0.5`, `top_p: 0.95`) y señala que la etiqueta `<think>` debe forzarse en la plantilla de chat, lo que indica que el modelo base incorpora un modo de razonamiento explícito.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de diálogo multi-turno.
- Modo de razonamiento explícito mediante la etiqueta `<think>`, que debe insertarse de forma forzada en la plantilla de chat según indica el autor.
- Capacidad probable de uso de herramientas y edición de código, inferida del dataset de trazas de Cursor empleado en el ajuste; no confirmada explícitamente en la model card.
- Soporte de inferencia mediante `text-generation-inference` (tag del repositorio) y compatibilidad con endpoints.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistencia a la edición de código en IDE: el ajuste sobre trazas de Cursor sugiere que el modelo puede emplearse para sugerir ediciones y secuencias de acciones dentro de un editor, aprovechando el formato de trazas del dataset de entrenamiento.
- Generación de parches y refactorizaciones guiadas: al haber sido entrenado con trazas de interacción con herramientas, puede integrarse en pipelines que requieran proponer cambios de código paso a paso.
- Conversación técnica multi-turno: su naturaleza conversacional (dataset `Fable-5-Chat`) lo hace adecuado para asistentes de soporte a desarrolladores en inglés.
- Razonamiento explícito con cadena de pensamiento: el modo `<think>` permite obtener trazas de razonamiento separadas de la respuesta final, útil para depuración de agentes y evaluación de decisiones intermedias.
- Prototipado de agentes de codificación: combinado con un entorno de ejecución de herramientas, puede emplearse para experimentar con bucles de agente en tareas de edición de ficheros.
- Investigación sobre ajuste fino de modelos MoE: al ser un derivado de un modelo base abierto con licencia Apache 2.0, sirve como punto de partida para estudiar el efecto de datasets de trazas en modelos de mezcla de expertos.
- Despliegue en entornos de inferencia compatibles con TGI: su formato safetensors y la etiqueta `text-generation-inference` facilitan su servicio mediante infraestructura estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (FP16/BF16): aproximadamente 62 GB solo para pesos, más memoria para caché KV y activaciones; se requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) para un despliegue cómodo.
- Cuantización: no se listan variantes GGUF ni cuantizaciones oficiales en el repositorio, por lo que el despliegue en GPUs de consumo requeriría cuantizar el modelo por cuenta propia (por ejemplo, con herramientas de la familia Unsloth o llama.cpp), sin garantías de calidad.
- GPU recomendadas: A100 80GB o H100 80GB para precisión completa; configuraciones multi-GPU para tensor parallelism si se desea mayor throughput.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin cuantización agresiva no documentada.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles; el tag `unsloth` sugiere compatibilidad con el ecosistema de ajuste e inferencia de Unsloth.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GLM-4.7-Flash-Fable-5-Distill (este) | 31,2B | no disponible | Apache 2.0 | Hugging Face | Ajuste sobre trazas de Cursor y chat |
| unsloth/GLM-4.7-Flash (base) | no disponible en la información | no disponible | no disponible en la información | Hugging Face | Modelo base del ajuste |
| CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill-Fixed | no disponible | no disponible | no disponible | Hugging Face | Versión posterior indicada por el autor como corrección |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse principalmente con trazas de código y chat en inglés, es previsible un sesgo hacia dominios técnicos y hacia el inglés.
- Riesgo de alucinación: no evaluado; los modelos ajustados sobre trazas de herramientas pueden generar llamadas a herramientas inexistentes o argumentos inválidos.
- Limitaciones de idioma: el repositorio declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no especificada; no debe asumirse una ventana larga sin verificación empírica.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datasets de entrenamiento, que no se detalla en la información disponible.
- Versión obsoleta: el autor indica una versión posterior (`...-Distill-Fixed`), por lo que esta revisión puede contener defectos corregidos; se recomienda evaluar la versión fijada antes de usarla en producción.
- Requisito de plantilla: la etiqueta `<think>` debe forzarse manualmente en la plantilla de chat; un uso incorrecto puede degradar la calidad de las respuestas.
- Madurez: 345 descargas y 3 likes en el momento de la consulta indican una adopción muy baja y poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill
- Versión corregida indicada por el autor: https://huggingface.co/CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill-Fixed
- Modelo base: https://huggingface.co/unsloth/GLM-4.7-Flash
- Dataset de trazas: https://huggingface.co/datasets/TeichAI/Fable-5-Cursor-Traces
- Dataset de chat: https://huggingface.co/datasets/armand0e/Fable-5-Chat
