# skyrain22/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) del modelo kanana-1.5-8b-instruct-2505, publicado por el usuario skyrain22 en Hugging Face. El modelo parte de una arquitectura tipo Llama con 8.030.285.824 parámetros (aproximadamente 8.000 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. La model card indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un proceso de ajuste supervisado o DPO sobre el modelo base.

El nombre del repositorio sugiere una orientación hacia la alineación de seguridad ("Safe-DPO"), es decir, un ajuste con optimización directa de preferencias (DPO) para reducir respuestas dañinas o no deseadas. Sin embargo, la información pública disponible es mínima: la model card no documenta el dataset de entrenamiento, los hiperparámetros, la composición de los datos ni los resultados de evaluación. El modelo se etiqueta únicamente para inglés ("en") y para generación de texto conversacional.

Su relevancia actual es limitada y debe interpretarse con cautela: se trata de un modelo derivado de un modelo base de terceros, con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como ejemplo de pipeline de fine-tuning con Unsloth/TRL, pero no como modelo de referencia para producción sin una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama`; detalles no disponibles) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 16,1 GB) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un transformer de tipo Llama con unos 8.000 millones de parámetros. El tag `llama` y la estructura del repositorio (safetensors, transformers, text-generation-inference) son coherentes con una arquitectura decoder-only estándar, aunque no se detallan aspectos como el número de capas, dimensiones ocultas, mecanismo de atención (MHA/GQA), función de activación o uso de RoPE. Tampoco se especifica la longitud de contexto nativa.

El entrenamiento se realizó, según la model card, con Unsloth y la librería TRL de Hugging Face, lo que apunta a un ajuste fino eficiente en memoria (probablemente LoRA/QLoRA fusionado o full fine-tuning acelerado). El sufijo "Safe-DPO" del nombre sugiere una etapa de optimización directa de preferencias orientada a seguridad, pero no se documentan el dataset, el número de tokens, la composición de los datos, ni si hubo RLHF adicional. No se dispone de información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline `text-generation` y el tag `conversational`.
- Ajuste orientado a seguridad (presunto DPO de seguridad), aunque sin evaluación pública que lo respalde.
- Compatibilidad con `transformers`, `text-generation-inference` y endpoints compatibles (`endpoints_compatible`).
- Soporte de cuantización y despliegue vía el ecosistema Unsloth (según la model card).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se documentan otros idiomas.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede integrarse en un pipeline de `transformers` o TGI para generar respuestas multi-turno; su tamaño de 8B permite desplegarlo en una sola GPU de 24 GB en FP16 o en GPUs menores con cuantización.
- Experimentación con pipelines de alineación: sirve como punto de partida para reproducir o comparar flujos de DPO con Unsloth/TRL, dado que la model card documenta explícitamente ese stack.
- Generación de texto en entornos de investigación: útil para estudiar el efecto de ajustes de seguridad sobre un modelo base, siempre que se realice una evaluación propia de sesgos y toxicidad.
- Fine-tuning adicional: al estar en safetensors y con licencia Apache 2.0, puede servir como base para nuevos ajustes supervisados en dominios concretos en inglés.
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` permite servirlo mediante infraestructuras tipo TGI o APIs compatibles con OpenAI, útil para pruebas de integración.
- Evaluación comparativa de modelos derivados: como ejemplo de modelo "community fine-tune", puede emplearse en estudios sobre calidad y seguridad de ajustes no oficiales frente al modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) para FP16 en single-GPU; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantización 4 bits (si se generan pesos GGUF/AWQ, no incluidos en el repo).
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), vLLM, llama.cpp/Ollama (requiere conversión a GGUF, no incluida), y el ecosistema Unsloth para ajuste.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| skyrain22/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03B | no disponible | Apache 2.0 | Hugging Face | Fine-tune comunitario sin benchmarks |
| Modelo base kanana-1.5-8b-instruct-2505 | ~8B | no disponible | no disponible en esta ficha | Hugging Face | Origen del ajuste; sin datos de evaluación aquí |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | Hugging Face, amplia adopción | Referencia de la familia Llama; benchmarks públicos extensos |
| Mistral 7B Instruct | ~7,2B | 32K | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con licencia permisiva |

La comparativa con Llama 3.1 8B y Mistral 7B es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluación de seguridad publicada: el sufijo "Safe-DPO" no está respaldado por métricas verificables.
- Riesgo de alucinación inherente a modelos de 8B sin documentación de datos de entrenamiento.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medición previa.
- Sesgos: no documentados; al derivar de un modelo base de terceros, puede heredar sesgos de sus datos originales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la licencia del modelo original kanana-1.5-8b-instruct-2505.
- Repositorio con cero descargas y sin mantenimiento documentado: riesgo de falta de soporte y de actualizaciones.
- La model card es genérica (plantilla de Unsloth) y no aporta información sobre hiperparámetros, dataset ni metodología exacta de DPO.

## Enlaces

- Hugging Face: https://huggingface.co/skyrain22/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de text-generation-inference: https://github.com/huggingface/text-generation-inference
