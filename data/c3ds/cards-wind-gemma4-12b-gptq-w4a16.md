# C3DS/CARDS-Wind-Gemma4-12B-GPTQ-w4a16

## Resumen

El modelo `C3DS/CARDS-Wind-Gemma4-12B-GPTQ-w4a16` es una cuantización int4 (W4A16) mediante GPTQ del modelo base `C3DS/CARDS-Wind-Gemma4-12B`, desarrollado por el equipo C3DS. Este modelo base pertenece a la familia Gemma 4 de Google, con una arquitectura unificada que incluye proyecciones de visión y audio, aunque la cuantización se centra en la parte de lenguaje. El objetivo principal es servir el modelo en GPUs de arquitectura Ampere (como la NVIDIA A2), donde los formatos FP8 no son compatibles, permitiendo así una inferencia eficiente con kernels Marlin de vLLM.

La cuantización se realizó con `llm-compressor` y se calibró con 512 muestras del dataset `iRanadheer/cards-wind-qwen-chat`, específicamente diseñado para el dominio climático (CARDS). Esto asegura que las activaciones durante el servicio coincidan con las del corpus de calibración, ya que el modelo pasa la mayor parte de la secuencia dentro de un system prompt fijo. El modelo está pensado para tareas de análisis y generación de texto relacionadas con el clima, aunque su base Gemma 4 le confiere capacidades generales de razonamiento y generación.

Con 12.966 millones de parámetros y un tamaño de repositorio de 9.8 GB, esta versión cuantizada reduce significativamente los requisitos de memoria frente al modelo original en BF16, manteniendo las capas críticas (lm_head, embeddings y proyecciones multimodales) en BF16 para preservar la calidad. Es una opción práctica para despliegues en entornos con GPUs de gama media o baja, como la A2, sin renunciar a la funcionalidad del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 unificada (transformer con proyecciones de vision y audio) |
| Parametros totales | 12.966.363.184 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 4096 (límite de servicio en vLLM, el contexto nativo del modelo base no se indica) |
| Tipos de cuantizacion | GPTQ int4 (W4A16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base `C3DS/CARDS-Wind-Gemma4-12B` se basa en la arquitectura Gemma 4 de Google, que emplea un transformer denso con atención de múltiples cabezas y capas de normalización. La variante "unified" incluye módulos de proyección para visión y audio, lo que sugiere capacidades multimodales, aunque la cuantización aquí se aplica principalmente a los pesos del transformer de lenguaje. El modelo fue preentrenado por Google con un corpus extenso y luego ajustado por C3DS para el dominio climático (CARDS), probablemente mediante fine-tuning supervisado o RLHF, aunque no se detalla en la información disponible.

La cuantización GPTQ se realizó con `llm-compressor` sobre 512 muestras del dataset `iRanadheer/cards-wind-qwen-chat`, con una longitud máxima de secuencia de 2048 tokens y renderizadas a través de la plantilla de chat del propio modelo. Se dejaron en BF16 el `lm_head`, la tabla de embeddings compartida y las capas de proyección de visión/audio (incluyendo `vision_embedder.patch_dense`), para no degradar la calidad en estas partes críticas. El resultado es un modelo int4 que conserva la mayor parte del rendimiento del original, con un ahorro de memoria de aproximadamente 4x en los pesos.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Gemma 4, el modelo puede realizar tareas de comprensión lectora, resumen, respuesta a preguntas y razonamiento lógico, aunque su especialización en clima puede limitar su rendimiento en dominios muy alejados.
- Análisis de datos climáticos: el fine-tuning en el dataset CARDS le permite interpretar y generar informes sobre variables meteorológicas, patrones de viento y otros fenómenos atmosféricos.
- Soporte de tool calling: no se menciona explícitamente, pero Gemma 4 incluye capacidades de function calling en su versión base; la cuantización no debería eliminarlas, aunque no está confirmado.
- Capacidades multimodales: el modelo base tiene proyecciones de visión y audio, pero la cuantización no especifica si estas se mantienen funcionales; se recomienda verificar con pruebas.
- Multilingüismo: no se indica qué idiomas soporta, pero Gemma 4 suele ser multilingüe; sin datos concretos, se considera no disponible.
- Modo de pensamiento (thinking mode): Gemma 4 ofrece un modo de razonamiento extendido, pero no se confirma si esta cuantización lo conserva.

## Casos de uso

- Generación de informes meteorológicos: el modelo puede redactar resúmenes automáticos de condiciones climáticas a partir de datos estructurados, gracias a su fine-tuning en el dominio CARDS.
- Análisis de datos de viento: para empresas de energía eólica, el modelo puede interpretar series temporales de velocidad y dirección del viento y generar recomendaciones operativas.
- Asistente de consulta climática: integrado en un chatbot, responde preguntas sobre pronósticos, alertas y tendencias climáticas con contexto de hasta 4096 tokens.
- Clasificación de eventos extremos: dado un texto descriptivo de un fenómeno (tormenta, sequía), el modelo puede categorizarlo y extraer parámetros relevantes.
- Generación de resúmenes de artículos científicos: su capacidad de razonamiento permite condensar publicaciones sobre climatología en resúmenes ejecutivos.
- Despliegue en edge con GPU Ampere: al ser int4, puede ejecutarse en GPUs como la A2 (16 GB) o RTX 4090, permitiendo inferencia local en estaciones de trabajo sin necesidad de hardware de última generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se recomienda evaluar el modelo en el conjunto de prueba CARDS para validar su rendimiento específico.

## Requisitos de hardware

- VRAM estimada: para un modelo de 12.9B parámetros en int4, el uso de memoria es aproximadamente 6.5-7 GB (12.9B * 0.5 bytes por parámetro en int4, más overhead de activaciones y capas en BF16). Con contexto de 4096, se puede ejecutar en GPUs con 8 GB o más.
- GPU recomendadas: NVIDIA A2 (16 GB) es el objetivo principal según la model card; también compatible con RTX 3090, RTX 4090, A10, A100, etc. (cualquier GPU con soporte SM80+ para kernels Marlin).
- Compatibilidad con consumer GPU: sí, una RTX 3060 de 12 GB o RTX 4070 de 12 GB pueden ejecutarlo, aunque con menor throughput.
- Opciones de despliegue: vLLM (recomendado, con `--trust-remote-code`), también puede usarse con llama.cpp si se convierte a GGUF, aunque no se proporciona ese formato.
- Latencia y throughput: no se proporcionan datos; en una A2, se espera una generación de aproximadamente 20-40 tokens/s para modelos de 12B en int4, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se puede comparar estructuralmente con otros modelos de ~12B cuantizados:

| Modelo | Parámetros | Contexto | Cuantización | Licencia |
|---|---|---|---|---|
| CARDS-Wind-Gemma4-12B-GPTQ (este) | 12.9B | 4096 (servicio) | int4 GPTQ | Gemma |
| Gemma 2 12B (cuantizado) | 12.2B | 8192 | int4 GPTQ | Gemma |
| Llama 3.1 8B (cuantizado) | 8.0B | 128K | int4 GPTQ | Llama 3.1 |

La comparativa real dependería de benchmarks en tareas climáticas, que no están disponibles. El modelo se distingue por su especialización en clima y su compatibilidad con Ampere.

## Limitaciones y advertencias

- Sesgos: al ser un modelo ajustado en un dominio específico, puede presentar sesgos hacia los datos de entrenamiento climáticos, lo que limita su generalización a otros temas.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o imprecisa, especialmente en contextos fuera de su dominio de especialización.
- Contexto limitado: el servicio se configura con `--max-model-len 4096`, lo que restringe la ventana de contexto; el modelo base podría soportar más, pero no se ha verificado.
- Licencia Gemma: la licencia de Google para Gemma impone restricciones de uso comercial y requiere cumplir sus términos; es necesario revisar la licencia completa antes de usar en producción.
- Capas multimodales no verificadas: aunque el modelo base tiene proyecciones de visión/audio, la cuantización no garantiza que estas funcionen correctamente; se recomienda probar antes de confiar en ellas.
- Formato de pesos: solo safetensors GPTQ; no hay versiones GGUF ni AWQ, lo que limita su uso en ciertos frameworks.

## Enlaces

- Modelo cuantizado: https://huggingface.co/C3DS/CARDS-Wind-Gemma4-12B-GPTQ-w4a16
- Modelo base: https://huggingface.co/C3DS/CARDS-Wind-Gemma4-12B
- Adaptador LoRA (relacionado): https://huggingface.co/C3DS/CARDS-Wind-Gemma4-12B-lora
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
