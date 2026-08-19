# exo-jhop/ministral3-gdpr-distilled

## Resumen

El modelo `exo-jhop/ministral3-gdpr-distilled` es un ajuste fino (fine-tune) del modelo base `unsloth/ministral-3-8b-instruct-2512-unsloth-bnb-4bit`, desarrollado por el usuario `exo-jhop`. Este modelo pertenece a la familia Ministral 3 de Mistral AI, una serie de modelos densos de parámetros eficientes diseñados para aplicaciones con restricciones de cómputo y memoria. La variante aquí presentada tiene 8.918.026.240 parámetros (aproximadamente 8,9 mil millones) y está especializada en el dominio del Reglamento General de Protección de Datos (GDPR) de la Unión Europea, como sugiere el nombre "gdpr-distilled". El término "distilled" indica que probablemente se ha aplicado destilación de conocimiento, aunque no se proporcionan detalles sobre el proceso.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Está disponible en el repositorio de Hugging Face con formato de pesos `safetensors` y es compatible con la librería `transformers` y con `text-generation-inference`. A pesar de que el pipeline declarado es `image-text-to-text`, el modelo base es exclusivamente de texto, por lo que esta etiqueta podría ser un error o indicar una capacidad multimodal no documentada. La relevancia actual de este modelo radica en su potencial para tareas de cumplimiento normativo, análisis de políticas de privacidad y generación de textos legales relacionados con el GDPR, un área con demanda creciente en el sector empresarial europeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Ministral 3) |
| Parametros totales | 8.918.026.240 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors sin cuantizar) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Ministral 3, que según el articulo de arXiv (2601.08584) es una familia de modelos densos de lenguaje de parametros eficientes, disponible en tamanos de 3B, 8B y 14B. Cada tamano tiene tres variantes: base preentrenado, instruct (ajustado por instrucciones) y razonamiento. Este modelo concreto parte de la variante instruct de 8B, publicada por Unsloth en formato 4-bit (`unsloth/ministral-3-8b-instruct-2512-unsloth-bnb-4bit`), y ha sido ajustado con las librerias Unsloth y TRL de Hugging Face. La model card indica que el entrenamiento fue "2x mas rapido" gracias a Unsloth, pero no se proporcionan detalles sobre el dataset, el numero de tokens de entrenamiento, ni si se emplearon tecnicas como RLHF o DPO. El nombre "gdpr-distilled" sugiere que se ha realizado destilacion de conocimiento desde un modelo mas grande especializado en GDPR, pero no hay confirmacion explicita.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base instruct de Ministral 3.
- Conversacion multi-turno y seguimiento de instrucciones, propio de un modelo instruct.
- Capacidades de razonamiento y comprension de texto, segun las capacidades generales de la familia Ministral 3.
- No se ha documentado soporte especifico para tool calling, agentes o vision en esta variante.
- No se ha confirmado la capacidad multimodal a pesar de la etiqueta `image-text-to-text`.
- El modelo podria estar especializado en tareas relacionadas con GDPR, como analisis de clausulas de privacidad o generacion de documentos de cumplimiento, pero no hay evidencia publica de ello.

## Casos de uso

Dado que la informacion publica es escasa, los casos de uso se infieren del dominio indicado por el nombre y de las capacidades generales del modelo base. Se recomienda validar el rendimiento antes de desplegar en produccion.

- Analisis de politicas de privacidad: el modelo podria extraer y resumir clausulas de consentimiento, derechos de los usuarios y obligaciones de los responsables del tratamiento a partir de documentos legales, facilitando auditorias de cumplimiento GDPR.
- Generacion de avisos legales: redaccion de textos de privacidad adaptados a diferentes contextos empresariales, como politicas de cookies o clausulas de proteccion de datos para sitios web.
- Asistencia en consultoria legal: apoyo a profesionales del derecho para redactar respuestas a solicitudes de acceso, rectificacion o supresion de datos (articulos 15-17 GDPR).
- Clasificacion de datos personales: identificacion de categorias de datos sensibles en corpus de texto, util para sistemas de gestion de datos.
- Chatbot de soporte interno: integracion en herramientas de RRHH o legal para responder preguntas frecuentes sobre normativa GDPR a empleados.
- Preprocesamiento de contratos: extraccion de obligaciones de proteccion de datos en contratos con proveedores, ayudando a detectar clausulas de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico. Tampoco se dispone de comparaciones con el modelo base o con otros modelos similares.

## Requisitos de hardware

No se proporcionan requisitos oficiales. A partir del tamano de parametros (8,9B) y del formato safetensors sin cuantizar, se pueden estimar las siguientes necesidades:

- VRAM estimada para inferencia en FP16: aproximadamente 18 GB (8,9B parametros x 2 bytes por parametro), mas overhead de activaciones y cache de contexto.
- Con cuantizacion a 8 bits: alrededor de 9-10 GB de VRAM.
- Con cuantizacion a 4 bits: alrededor de 5-6 GB de VRAM, aunque no se ha confirmado compatibilidad con GGUF.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) para FP16; GPUs con 12 GB o menos requeririan cuantizacion.
- Opciones de despliegue: al ser un modelo de la familia Mistral, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (si se publica en ese formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. El modelo base Ministral 3 8B podria compararse con Llama 3.1 8B o Mistral 7B, pero no hay datos de rendimiento especificos de esta variante fine-tuned. Se recomienda consultar el articulo de arXiv de Ministral 3 para obtener benchmarks del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion publica sobre sesgos, pero al ser un modelo entrenado principalmente en ingles, puede presentar sesgos culturales o linguisticos en contextos no anglofonos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inexacto, especialmente en dominios legales donde la precision es critica. No debe utilizarse como sustituto de asesoria legal profesional.
- Limitaciones de contexto: no se ha especificado la longitud de contexto; el modelo base Ministral 3 podria soportar hasta 128k tokens segun el paper, pero no esta confirmado para esta variante.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales de Mistral AI que no se detallan en la model card.
- Caveat de produccion: la ausencia de benchmarks y documentacion tecnica detallada hace arriesgado su despliegue en entornos criticos sin una evaluacion previa exhaustiva.
- La etiqueta `image-text-to-text` es inconsistente con la naturaleza textual del modelo base; podria indicar un error de metadata o una capacidad no documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/exo-jhop/ministral3-gdpr-distilled
- Modelo LoRA asociado: https://huggingface.co/exo-jhop/ministral3-gdpr-lora
- Paper de Ministral 3 en arXiv: https://arxiv.org/abs/2601.08584
- Blog de Mistral AI sobre Mistral 3: https://mistral.ai/news/mistral-3/
