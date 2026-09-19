# Jongbin-kr/exaone-7b-verireason-reproduced-1513-fullft-best-grpo-reproduced-1.0

## Resumen

El modelo `exaone-7b-verireason-reproduced-1513-fullft-best-grpo-reproduced-1.0` es un ajuste fino publicado por el usuario Jongbin-kr sobre el checkpoint `Jongbin-kr/exaone-7b-verireason-reproduced-1513-fullft-epoch4`, que a su vez deriva de la familia EXAONE de LG AI Research. Se trata de un transformer decoder de 7 818 448 896 parámetros (≈7,82 mil millones), distribuido en formato safetensors y pensado exclusivamente para generación de texto conversacional.

Su rasgo distintivo es el procedimiento de entrenamiento: la model card indica que se ha entrenado con GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo introducida en el artículo DeepSeekMath, utilizando la librería TRL. El nombre del modelo apunta a un pipeline de «verifiable reasoning» (razonamiento verificable) y el proyecto de Weights & Biases asociado se denomina `lg-longtail-grpo`, lo que sugiere un experimento centrado en distribuciones de datos de cola larga.

Es relevante como pieza de reproducción de experimentos de RL sobre modelos de 7B, no como un modelo listo para producción: acumula 19 descargas, 0 likes y su model card no documenta idiomas, licencia, longitud de contexto ni resultados de benchmarks. La información disponible es muy limitada y todo lo no documentado explícitamente se marca como «no disponible» en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia EXAONE); la model card no especifica la variante exacta |
| Parametros totales | 7 818 448 896 (≈7,82 mil millones) |
| Parametros activos | No aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos sin cuantizar (no hay GGUF, AWQ ni GPTQ en los tags) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el YAML de la model card contiene el marcador genérico `licence: license`, sin texto legal asociado |
| Formato de pesos | Safetensors (según tags); el tamaño del repositorio (31,3 GB) es consistente con pesos en fp32 |
| Librería de carga | transformers (requiere `trust_remote_code=True` por el tag `custom_code`) |
| Pipeline | text-generation |
| Modelo base | Jongbin-kr/exaone-7b-verireason-reproduced-1513-fullft-epoch4 |
| Tamaño del repositorio | 31,3 GB |
| Descargas / likes | 19 / 0 |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de la familia EXAONE, con 7 818 448 896 parámetros. La model card no detalla el número de capas, la dimensión oculta, el número de cabezas de atención ni el tamaño del vocabulario, por lo que esos datos figuran como no disponibles en esta ficha. El tag `custom_code` indica que la implementación requiere cargar código remoto desde el repositorio, un patrón habitual en la integración de EXAONE con transformers.

El entrenamiento se realizó con GRPO (Group Relative Policy Optimization), técnica presentada en DeepSeekMath (arXiv:2402.03300), mediante la librería TRL en su versión 1.6.0, con Transformers 5.7.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2. El modelo parte de un ajuste fino completo previo (`fullft-epoch4`), de modo que este checkpoint es una segunda etapa de optimización por refuerzo sobre un SFT ya terminado. El nombre del proyecto de seguimiento en Weights & Biases (`lg-longtail-grpo`) sugiere que la distribución de recompensas o de prompts empleada tenía cola larga, aunque la model card no aporta el número de tokens de entrenamiento, la composición del dataset ni la función de recompensa utilizada.

No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de pensamiento explícitos. El ejemplo de uso de la model card utiliza una plantilla de chat basada en lista de mensajes (`{"role": "user", "content": ...}`) con `max_new_tokens=128` y `return_full_text=False`.

## Capacidades

- Generación de texto conversacional en formato de chat, con prompt estructurado como lista de mensajes con roles.
- Razonamiento orientado a tareas verificables, inferido del nombre del modelo y del uso de GRPO como método de optimización; la model card no detalla qué tipo de tareas cubre.
- Integración con el ecosistema transformers y TRL (`text-generation` pipeline, carga con `trust_remote_code=True`).
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso explícito: no documentado.
- Capacidades multilingües: no disponible (la model card no declara idiomas).
- Capacidades de visión, audio o modo «thinking» explícito: no documentadas; el tag de pipeline es exclusivamente `text-generation`.
- Uso como checkpoint de referencia para reproducir experimentos de RL sobre modelos de 7B.

## Casos de uso

- Reproducción de experimentos de RL: el modelo sirve como punto de comparación frente a su base SFT (`fullft-epoch4`) para medir el efecto real de una etapa GRPO sobre un transformer de 7,8B en la misma receta.
- Investigación en aprendizaje por refuerzo con distribuciones de cola larga: el proyecto de W&B asociado sugiere que el experimento estudia cómo GRPO se comporta cuando los prompts o recompensas siguen una distribución long-tail; el checkpoint permite replicar y auditar ese entrenamiento.
- Generación de datos sintéticos de razonamiento: al ser un modelo afinado para razonamiento, puede emplearse para producir trazas de razonamiento que después se filtren y se usen en un SFT posterior, siempre con verificación humana o automática de las respuestas.
- Evaluación comparativa de checkpoints intermedios: útil en pipelines de investigación donde se comparan varias rondas de GRPO para decidir qué checkpoint promover.
- Prototipado de asistentes conversacionales en investigación: el pipeline de `text-generation` permite levantar una demo rápida con pocas líneas de Python, sin infraestructura adicional.
- Estudio de estabilidad y regresiones tras RL: se puede medir si la etapa GRPO degrada capacidades generales del modelo base (por ejemplo, fluidez o coherencia a largo plazo) frente a la etapa SFT.
- Base para ajuste posterior en un dominio concreto: al ser un modelo de 7,8B, es viable aplicar LoRA o QLoRA sobre él en una sola GPU de 24 GB para especializarlo, siempre que se resuelva antes la ambigüedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, GSM8K, HumanEval, MATH ni de ninguna otra evaluación, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente reseñas no relacionadas con el ámbito técnico).

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 7,82 mil millones de parámetros: ≈31,3 GB en fp32 (coincide con el tamaño del repositorio), ≈15,6 GB en bf16/fp16, ≈8 GB en cuantización de 8 bits y ≈4,5-5 GB en cuantización de 4 bits.
- GPU recomendadas: A100 40 GB o H100 para fp32 y fp16 sin cuantizar; L40S o A6000 para fp16; RTX 4090 (24 GB) para fp16 con margen limitado o cuantización de 8 bits.
- Compatibilidad con GPU de consumo: sí, en cuantización de 4 bits cabe en GPU de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 3080), y en fp16 cabe ajustadamente en una RTX 4090 o RTX 3090 de 24 GB.
- Opciones de despliegue: transformers (vía `pipeline` o `AutoModelForCausalLM`, con `trust_remote_code=True`) y TRL para entrenamiento. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son utilizables directamente sin una conversión previa. El soporte en vLLM o TGI no está documentado y depende de que la implementación `custom_code` sea compatible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (exaone-7b-verireason…grpo-reproduced-1.0) | 7,82B | No disponible | No disponible | HuggingFace, 19 descargas | Fine-tune GRPO de investigación, sin benchmarks publicados |
| EXAONE-3.5-7.8B-Instruct (LG AI Research) | 7,8B | 32 768 tokens | EXAONE AI Model License | HuggingFace, ampliamente distribuido | Modelo oficial de la familia base, con evaluación publicada |
| Qwen2.5-7B-Instruct | 7,61B | 131 072 tokens | Apache-2.0 | HuggingFace, muy ampliamente distribuido | Alternativa con licencia permisiva y contexto largo |
| Llama-3.1-8B-Instruct | 8,03B | 131 072 tokens | Llama 3.1 Community License | HuggingFace y múltiples proveedores | Amplio soporte de ecosistema y cuantizaciones GGUF publicadas |

Los datos de los tres modelos de comparación proceden de la documentación pública de sus respectivos model cards y no han sido verificados en esta ficha; conviene comprobarlos antes de tomar decisiones. La diferencia clave frente a ellos no es de rendimiento, sino de propósito: aquí se trata de un checkpoint de investigación con licencia sin definir, sin benchmarks y sin cuantizaciones publicadas, mientras que las alternativas son modelos de producción con licencia explícita y ecosistema consolidado.

## Limitaciones y advertencias

- Licencia no definida: el YAML de la model card contiene `licence: license` como marcador, sin texto legal. No hay base para asumir que se permite uso comercial; hay que contactar con el autor antes de cualquier uso en producción.
- Ausencia total de benchmarks: no hay ninguna evaluación publicada que respalde mejoras frente al checkpoint base, pese a que el nombre del modelo sugiere una etapa GRPO «best».
- Idiomas no declarados: se desconoce si el modelo mantiene competencia multilingüe o si el ajuste la ha degradado hacia un idioma concreto.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos ni garantizar el comportamiento en conversaciones multi-turno extensas.
- Riesgo de alucinación: el ajuste por refuerzo orientado a recompensas verificables puede incrementar la verbosidad o producir cadenas de razonamiento plausibles pero incorrectas; no hay evaluación que lo descarte.
- Trazabilidad limitada: solo se documenta el checkpoint inmediatamente anterior, sin detallar la composición del dataset de GRPO ni la función de recompensa, lo que dificulta auditar sesgos.
- Código remoto: el tag `custom_code` obliga a ejecutar código del repositorio, lo que introduce un riesgo de seguridad en entornos no controlados.
- Repositorio pesado en fp32 (31,3 GB): encarece el almacenamiento y obliga a convertir los pesos manualmente antes de desplegar en GPUs de consumo.
- Advertencia sobre el material de origen: los resultados de la búsqueda web asociada a esta consulta no contenían información técnica sobre el modelo, únicamente reseñas no relacionadas; no se ha utilizado ese contenido como fuente.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Jongbin-kr/exaone-7b-verireason-reproduced-1513-fullft-best-grpo-reproduced-1.0
- Modelo base: https://huggingface.co/Jongbin-kr/exaone-7b-verireason-reproduced-1513-fullft-epoch4
- Artículo de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/snu-skiml/lg-longtail-grpo/runs/j94vuvks
- La búsqueda web realizada no devolvió enlaces técnicos relevantes adicionales sobre este modelo.
