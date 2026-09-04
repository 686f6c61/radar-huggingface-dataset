# exo-jhop/ministral3-gdpr-dpo-fp16

## Resumen

El modelo exo-jhop/ministral3-gdpr-dpo-fp16 es un modelo multimodal de tipo image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto como salida. Ha sido desarrollado por el usuario exo-jhop mediante fine-tuning a partir de un adaptador LoRA previo (exo-jhop/ministral3-gdpr-lora), utilizando las librerías Unsloth y TRL de HuggingFace. El nombre del repositorio sugiere que el entrenamiento incluyó Direct Preference Optimization (DPO) y que el modelo está orientado a tareas relacionadas con el cumplimiento del GDPR (Reglamento General de Protección de Datos), aunque la model card no aporta detalles sobre el dataset ni el proceso de entrenamiento.

El modelo cuenta con 8.918.026.240 parámetros (aproximadamente 8.900 millones) y se distribuye en formato safetensors con pesos en fp16, ocupando 17,9 GB. Está publicado bajo licencia Apache 2.0 y, según los metadatos de HuggingFace, soporta únicamente el idioma inglés. Al ser un fine-tuning, su relevancia radica en la adaptación de un modelo base Mistral3 a un dominio específico (privacidad y protección de datos), aunque la documentación disponible es escasa y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en un modelo Mistral3 (detalles de arquitectura no disponibles) |
| Parámetros totales | 8.918.026.240 |
| Parámetros activos | no disponible (no se indica que sea un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (según el nombre del repositorio) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un modelo de la familia Mistral3, según las etiquetas de HuggingFace. El pipeline registrado es image-text-to-text, lo que indica que el modelo procesa entradas multimodales compuestas por imágenes y texto y genera respuestas textuales. No se dispone de información sobre el número de capas, la dimensión del modelo, el mecanismo de atención ni la longitud de contexto.

El entrenamiento consistió en un fine-tuning a partir del adaptador LoRA exo-jhop/ministral3-gdpr-lora, utilizando la librería Unsloth (que acelera el entrenamiento aproximadamente 2 veces) junto con la librería TRL de HuggingFace. El nombre del repositorio incluye el sufijo "dpo", lo que sugiere que se aplicó Direct Preference Optimization, aunque la model card no lo confirma explícitamente. No se han publicado datos sobre el conjunto de datos de entrenamiento, su composición, el número de tokens ni si se realizaron etapas de RLHF.

## Capacidades

- Generación de texto multimodal: el modelo acepta imágenes y texto como entrada y produce texto, según el pipeline image-text-to-text.
- Conversación en inglés: el tag "conversational" indica que está pensado para interacciones de tipo diálogo.
- Adaptación al dominio GDPR: el nombre del repositorio apunta a un fine-tuning orientado a tareas de privacidad y protección de datos, aunque no se detallan las capacidades específicas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; solo inglés según los metadatos.
- Modo de pensamiento (thinking mode), visión o audio: no disponible.

## Casos de uso

Dado que la documentación es limitada, los siguientes casos de uso son potenciales y deben validarse experimentalmente:

- Asistente de cumplimiento GDPR: el modelo podría responder consultas sobre derechos de los interesados, bases legales o principios de protección de datos en inglés, gracias a su fine-tuning orientado a este dominio.
- Análisis de documentos con datos personales: al aceptar imágenes, podría procesar escaneos de documentos (contratos, formularios) y extraer o anonimizar información personal, aunque esta capacidad no está confirmada.
- Revisión de cláusulas de privacidad: podría analizar textos legales y detectar referencias a tratamientos de datos que incumplan el GDPR, siempre que el modelo haya sido entrenado con datos legales suficientes.
- Gestión de solicitudes de derechos de los interesados: podría redactar respuestas a solicitudes de acceso, rectificación o supresión de datos en un entorno de atención al cliente.
- Clasificación de información sensible en imágenes: podría identificar visualmente documentos que contienen datos personales y marcarlos para su revisión manual.
- Automatización de soporte en inglés para aplicaciones de privacidad: podría integrarse en chatbots que gestionen consultas de usuarios sobre el uso de sus datos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB para cargar los pesos en fp16 (8.918.026.240 parámetros × 2 bytes). El overhead de activaciones y buffers de atención puede elevar el requisito por encima de 20 GB.
- GPU recomendadas: una A100 40GB o H100 80GB ofrecen margen suficiente. Una RTX 4090 de 24 GB podría ser viable con fp16, siempre que se gestionen bien las activaciones.
- Compatibilidad con GPU de consumo: potencialmente sí en tarjetas de 24 GB, aunque no hay datos oficiales de consumo de VRAM.
- Opciones de despliegue: el modelo es compatible con text-generation-inference según los metadatos de HuggingFace y está marcado como "endpoints_compatible". No se dispone de información sobre soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la documentación proporcionada. Existe un modelo relacionado (exo-jhop/ministral3-gdpr-distilled) en HuggingFace, pero no se han publicado sus especificaciones ni resultados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha realizado una evaluación de sesgos.
- Riesgo de alucinación: no evaluado; al ser un modelo fine-tuned con documentación reducida, el comportamiento en dominios legales debe verificarse con datos de prueba.
- Limitaciones de idioma: solo se ha declarado soporte para inglés.
- Longitud de contexto: desconocida, lo que impide garantizar el manejo de documentos extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el origen y la composición del dataset de entrenamiento no se han documentado, lo que puede implicar riesgos legales si el modelo se usa en producción.
- Caveat importante: no se han publicado evaluaciones de seguridad, alineación ni robustez. El uso en entornos críticos requiere una validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/exo-jhop/ministral3-gdpr-dpo-fp16
- Modelo base (LoRA): https://huggingface.co/exo-jhop/ministral3-gdpr-lora
- Modelo relacionado: https://huggingface.co/exo-jhop/ministral3-gdpr-distilled
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
