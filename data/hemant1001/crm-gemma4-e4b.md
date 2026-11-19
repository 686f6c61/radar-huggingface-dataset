# Hemant1001/crm-gemma4-e4b

## Resumen

crm-gemma4-e4b es un ajuste fino (fine-tuning) del modelo unsloth/gemma-4-E4B-it-unsloth-bnb-4bit, publicado por el usuario Hemant1001 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text derivado de la familia Gemma 4 de Google, orientado según su nombre a tareas de gestión de relaciones con clientes (CRM). El autor no documenta el conjunto de datos de ajuste ni el procedimiento de entrenamiento más allá de indicar que se realizó con Unsloth y la librería TRL de Hugging Face.

El modelo cuenta con 7.996.156.490 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los 8.000 millones de parámetros. El repositorio ocupa 16 GB, coherente con pesos en precisión de 16 bits. La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés.

Su relevancia es limitada: el repositorio no presenta descargas ni interacciones, no incluye datos de benchmarks ni detalles sobre el dataset de ajuste, y la model card es prácticamente un esqueleto generado automáticamente. Debe tratarse como un experimento de ajuste fino sin validación publicada, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Gemma 4; detalles de arquitectura interna no disponibles |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se distribuye en bnb-4bit; el ajuste se publica en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/gemma-4-E4B-it-unsloth-bnb-4bit, que a su vez es una versión cuantizada en 4 bits (bitsandbytes) del modelo instructivo Gemma 4 E4B de Google. La arquitectura subyacente corresponde a la familia Gemma 4, de tipo transformer con capacidades multimodales de entrada imagen-texto, aunque el autor no proporciona detalles sobre número de capas, atención, cabezas ni configuración del tokenizador.

El entrenamiento se realizó con Unsloth y TRL, según la model card, con una afirmación de velocidad "2x más rápida" respecto a un entrenamiento convencional, pero sin especificar número de tokens, composición del dataset, método de ajuste (LoRA, QLoRA, full fine-tuning), hiperparámetros ni si hubo etapas de RLHF o DPO posteriores. No se documenta ninguna innovación técnica propia del ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instructivo Gemma 4.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), lo que permite tareas de comprensión visual combinadas con texto.
- Ajuste orientado a dominio CRM según la denominación del modelo, aunque no se documentan las tareas concretas ni los datos empleados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Clasificación y enrutamiento de consultas de clientes: el modelo puede emplearse para etiquetar tickets de soporte por categoría o urgencia, aprovechando su naturaleza conversacional, aunque requeriría validación previa con datos propios de CRM.
- Resumen de conversaciones e historiales de atención: adecuado para condensar hilos de correo o chat en resúmenes estructurados, dado su perfil de modelo instructivo de 8.000 millones de parámetros.
- Extracción de entidades en fichas de cliente: nombres, empresas, productos y fechas a partir de texto libre, como paso previo a la carga en un CRM.
- Generación de respuestas de borrador para agentes humanos: el modelo puede proponer respuestas que un operador revise antes de enviarlas, reduciendo el tiempo de redacción.
- Análisis de documentos con capturas o formularios escaneados: gracias a su pipeline image-text-to-text, puede procesar imágenes adjuntas en comunicaciones de clientes, siempre que se valide su calidad real en esta tarea.
- Prototipado de asistentes internos de ventas: para experimentación en entornos controlados con datos sintéticos o anonimizados, dado que no hay benchmarks publicados que respalden su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB o más según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-10 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 5-6 GB para pesos, más overhead.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para fp16 sin restricciones; RTX 4090 (24 GB) viable en fp16 con contexto moderado o en cuantización.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 con margen ajustado, y en GPUs de 12-16 GB solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio), vLLM y llama.cpp/Ollama previsiblemente compatibles si se generan pesos GGUF, aunque no se documenta su disponibilidad.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hemant1001/crm-gemma4-e4b | 7.996.156.490 | no disponible | Sí (image-text-to-text) | apache-2.0 | Hugging Face, sin descargas ni validación publicada |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | no disponible | no disponible | Sí | no disponible en la información | Hugging Face |
| Gemma 4 E4B-it (original de Google) | no disponible | no disponible | Sí | no disponible en la información | Hugging Face / Google |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en tareas de CRM ni en ninguna otra.
- Dataset de entrenamiento no documentado: se desconoce la composición, el volumen y la procedencia de los datos, lo que impide evaluar sesgos y riesgo de sobreajuste.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; sin evaluación específica, no puede acotarse en el dominio CRM.
- Idioma: solo se declara inglés, por lo que el uso en castellano u otros idiomas no está respaldado.
- Contexto: se desconoce la longitud máxima de contexto, lo que limita la planificación de despliegues con conversaciones largas.
- Licencia Apache 2.0 declarada por el autor, pero conviene verificar que los términos del modelo base Gemma 4 y de la versión de Unsloth sean compatibles con el uso comercial previsto.
- Repositorio sin tracción (0 descargas, 0 likes) y model card mínima: no hay garantía de mantenimiento, soporte ni corrección de errores.
- El ajuste parte de un checkpoint cuantizado en 4 bits, lo que puede introducir pérdida de calidad adicional respecto al modelo original en precisión completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hemant1001/crm-gemma4-e4b
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible enlace directo en la información proporcionada
- Paper, blog o demo del ajuste: no disponible
