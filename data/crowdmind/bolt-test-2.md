# CrowdMind/bolt-test-2

## Resumen

CrowdMind/bolt-test-2 es un modelo de lenguaje multimodal (image-text-to-text) afinado por CrowdMind a partir de armand0e/Qwen3.5-9B-ultra-uncensored-heretic, que a su vez deriva de la familia Qwen3.5. El repositorio contiene un finetune en precisión FP16 subido con la librería transformers y pesos en formato safetensors, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones).

El modelo se distribuye bajo licencia Apache 2.0 y declara soporte únicamente para el idioma inglés. La model card es extremadamente escueta: se limita a indicar el modelo base, la licencia y que el entrenamiento se realizó con Unsloth y TRL. No se documentan la composición del dataset, el número de tokens de entrenamiento, la longitud de contexto ni los resultados de evaluación.

Por su pipeline image-text-to-text y su procedencia de la familia Qwen3.5, el modelo está orientado a tareas conversacionales y de generación de texto con entrada de imagen, pero al no publicarse detalles técnicos adicionales ni benchmarks, su evaluación rigurosa queda limitada a las especificaciones deducibles de los metadatos del repositorio. Es relevante como ejemplo de finetune comunitario rápido sobre una base Qwen3.5, aunque con escasa documentación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen3.5, tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos FP16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo de la familia Qwen3.5 (tag `qwen3_5`) con pipeline image-text-to-text, lo que implica una arquitectura transformer multimodal con codificador de visión y decodificador de lenguaje. El número exacto de capas, dimensión oculta, mecanismo de atención y configuración del componente visual no se detalla en la model card ni en los metadatos.

El entrenamiento consistió en un finetune del modelo armand0e/Qwen3.5-9B-ultra-uncensored-heretic realizado con Unsloth y la librería TRL de Hugging Face, según declara el autor. No se especifican el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, ni hiperparámetros del ajuste. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado y el tag `conversational`.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text), aunque no se detallan las tareas visuales concretas soportadas.
- Integración con text-generation-inference (tag `text-generation-inference`) y compatibilidad con endpoints.
- Compatibilidad con la librería transformers y pesos en safetensors.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, visión avanzada, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede emplearse para generar respuestas multi-turno en inglés dentro de entornos de desarrollo, aprovechando su pipeline conversacional y su integración con transformers.
- Experimentación con modelos multimodales imagen-texto: útil en laboratorios que quieran probar la combinación de entrada visual y texto sobre una base Qwen3.5 de ~9,4 B de parámetros.
- Investigación sobre finetunes comunitarios: sirve como caso de estudio de ajuste rápido con Unsloth y TRL sobre un modelo base derivado de Qwen3.5.
- Evaluación comparativa de bases Qwen3.5: permite contrastar el comportamiento de un finetune FP16 frente a otros derivados de la misma familia en tareas de generación de texto.
- Despliegue en entornos con text-generation-inference: al declarar compatibilidad con TGI y endpoints, puede integrarse en infraestructuras de servicio de modelos existentes.
- Pruebas de integración en pipelines de transformers: adecuado para validar flujos de carga de safetensors y ejecución de inferencia en FP16 antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 18,8 GB solo para los pesos (9,4 B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 9,4 GB para pesos; en 4 bits, alrededor de 4,7 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 en FP16 con margen ajustado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: transformers (soporte declarado), text-generation-inference (tag); soporte de vLLM, llama.cpp u Ollama no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| CrowdMind/bolt-test-2 | ~9,4 B | no disponible | apache-2.0 | en | Finetune multimodal sobre Qwen3.5; sin benchmarks publicados |
| armand0e/Qwen3.5-9B-ultra-uncensored-heretic (base) | ~9 B (por nombre) | no disponible | no disponible | no disponible | Modelo base del finetune |
| Qwen3.5-9B (familia original) | ~9 B | no disponible | no disponible | no disponible | Base de la que deriva la cadena de finetunes |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla dataset, hiperparámetros, contexto ni evaluación, lo que dificulta validar su comportamiento en producción.
- Sesgos conocidos: no documentados por el autor; al ser un finetune comunitario sin evaluación publicada, el riesgo de sesgos no cuantificados es alto.
- Riesgo de alucinación: no evaluado; sin benchmarks ni pruebas de fidelidad publicadas.
- Limitación de idioma: solo declara inglés (`en`), por lo que su uso en castellano u otros idiomas no está soportado oficialmente.
- Longitud de contexto desconocida: no se puede garantizar el rendimiento en conversaciones largas o documentos extensos.
- Procedencia "uncensored/heretic" en la cadena de modelos base: el finetune deriva de un modelo etiquetado como sin censura, lo que puede implicar menor alineación de seguridad y mayor probabilidad de contenido inapropiado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen de los datos de entrenamiento.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/CrowdMind/bolt-test-2
- Modelo base: https://huggingface.co/armand0e/Qwen3.5-9B-ultra-uncensored-heretic
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
