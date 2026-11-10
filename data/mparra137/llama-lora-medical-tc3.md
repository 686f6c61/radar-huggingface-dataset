# mparra137/llama-lora-medical-tc3

## Resumen

`mparra137/llama-lora-medical-tc3` es un ajuste fino (fine-tuning) de tipo LoRA sobre el modelo `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits de `Meta-Llama-3.1-8B-Instruct`. Lo publica el usuario `mparra137` en Hugging Face y, por el nombre del repositorio ("medical"), apunta a un ajuste orientado a dominio sanitario o médico. El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning de modelos Llama en GPUs de consumo.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens en el modelo original. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA (o con pesos cuantizados de pequeño tamaño) y no con un checkpoint completo en precisión nativa. La licencia declarada es Apache 2.0, aunque conviene revisar las condiciones de la licencia Llama 3.1 que aplica al modelo base.

La relevancia de esta ficha es limitada: se trata de un experimento personal, sin model card descriptiva, sin datos de entrenamiento publicados, sin benchmarks y con cero descargas. Es útil como ejemplo de pipeline de fine-tuning con Unsloth sobre Llama 3.1 8B, pero no como modelo listo para producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino LoRA con Unsloth |
| Parametros totales | 8.000 millones (heredados del modelo base Llama 3.1 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.1 8B; no confirmado en el ajuste |
| Tipos de cuantizacion | El base está en bnb-4bit; el adaptador publicado no especifica cuantización propia; no disponible para GGUF/AWQ/GPTQ |
| Idiomas soportados | en (inglés, según la model card); el base soporta más idiomas, pero el ajuste declara solo inglés |
| Licencia | apache-2.0 (declarada); sujeta además a la Llama 3.1 Community License del modelo base |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atención por grupos (GQA), RoPE y normalización RMSNorm, entrenado originalmente por Meta con aproximadamente 15 billones de tokens (dato del modelo base, no del ajuste). Sobre esa base, el autor aplica un fine-tuning con LoRA mediante Unsloth, técnica que congela los pesos originales e introduce matrices de bajo rango entrenables, reduciendo el coste de memoria y acelerando el entrenamiento (la model card afirma "2x faster").

No se dispone de información sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje, la composición de los datos "medical" ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documenta si el adaptador se fusionó con los pesos base o se publica como LoRA separado; el tamaño del repositorio (0,2 GB) sugiere un adaptador de bajo rango o pesos cuantizados, no un checkpoint completo en fp16 (que rondaría los 16 GB). No se declaran innovaciones técnicas adicionales más allá del uso de Unsloth.

## Capacidades

- Generación de texto en inglés, heredada del modelo instruct de Llama 3.1 8B.
- Razonamiento y respuesta a instrucciones, presumiblemente especializado en terminología y tareas médicas por el nombre del repositorio, aunque no hay documentación que lo confirme.
- Soporte de tool calling y function calling: el modelo base Llama 3.1 8B lo soporta de forma nativa, pero no hay confirmación de que el ajuste lo preserve.
- Capacidad multilingüe: el modelo base soporta varios idiomas, pero la model card declara únicamente inglés para este ajuste.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.
- No hay información sobre soporte de agentes o razonamiento multi-paso específico del ajuste.

## Casos de uso

- Prototipado de asistentes clínicos en inglés: el ajuste puede emplearse para experimentar con respuestas a preguntas de dominio médico, siempre con revisión humana y sin uso diagnóstico directo, dado que no hay evaluación publicada.
- Investigación sobre fine-tuning con Unsloth: sirve como ejemplo reproducible de cómo adaptar Llama 3.1 8B en 4 bits a un dominio concreto en GPUs de consumo.
- Extracción de información de notas clínicas en inglés: tareas de resumen o estructuración de texto médico, aprovechando la ventana de contexto larga del modelo base (hasta 128k tokens), aunque el ajuste no garantiza conservar esa capacidad.
- Generación de documentación y material formativo sanitario: redacción asistida de textos divulgativos en inglés con terminología especializada.
- Base para un segundo ajuste o evaluación comparativa: punto de partida para experimentos de evaluación de sesgos y alucinaciones en modelos médicos de código abierto.
- Chatbot de triaje no diagnóstico: conversaciones multi-turno en inglés para orientar al usuario, con salvaguardas explícitas y derivación a profesionales, dado el riesgo del dominio.
- Integración vía Text Generation Inference: el tag `text-generation-inference` y `endpoints_compatible` permiten desplegarlo con TGI en infraestructura estándar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre un base de 8B en 4 bits, la inferencia requiere cargar el modelo base (~5-6 GB en 4 bits) más el adaptador (0,2 GB); en fp16 el base completo necesitaría ~16 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues concurrentes; RTX 4090 (24 GB) suficiente para el base en 4 bits o fp16 con batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en 4 bits con margen; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) viable en 4 bits con contexto moderado.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, indicado por los tags), vLLM; llama.cpp/Ollama requerirían convertir el adaptador a GGUF, no documentado.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mparra137/llama-lora-medical-tc3 | 8B (LoRA sobre Llama 3.1 8B 4-bit) | 128k (base) | apache-2.0 declarada + Llama 3.1 | Hugging Face, 0 descargas | Sin benchmarks ni documentación |
| Meta-Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Ampliamente disponible | Modelo base oficial, con evals publicadas |
| unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit | 8B (4-bit) | 128k | Llama 3.1 Community License | Hugging Face | Base cuantizado usado por este ajuste |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de documentación sobre datos de entrenamiento, hiperparámetros y evaluación: no se puede verificar la calidad ni la seguridad del ajuste.
- Riesgo elevado de alucinación en dominio médico: un modelo de 8B ajustado sin evaluación publicada puede generar información clínica incorrecta; no debe usarse para diagnóstico ni consejo médico.
- Sesgos potencialmente heredados del modelo base Llama 3.1 y del dataset de ajuste, desconocido.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está garantizado.
- Licencia: aunque se declara Apache 2.0, el modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License, que impone restricciones adicionales (por ejemplo, cláusula de "built with Llama" y límites de uso si se superan los 700 millones de usuarios mensuales). Conviene verificar la compatibilidad antes de uso comercial.
- Repositorio sin descargas ni validación de la comunidad; no hay garantía de que los pesos estén completos o correctamente fusionados.
- Sin información sobre si el adaptador preserva el soporte de tool calling o la ventana de 128k tokens del base.

## Enlaces

- Hugging Face: https://huggingface.co/mparra137/llama-lora-medical-tc3
- Modelo base (4-bit): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Modelo original: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
