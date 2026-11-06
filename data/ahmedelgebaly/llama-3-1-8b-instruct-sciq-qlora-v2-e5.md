# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e5

## Resumen

Este repositorio contiene un adaptador PEFT/QLoRA entrenado sobre el modelo base Meta Llama 3.1 8B Instruct, orientado a la generacion de respuestas de tipo pregunta-respuesta cientifica (science QA) sobre el conjunto de datos SciQ en formato Alpaca. Lo desarrolla el usuario de Hugging Face ahmedelgebaly en el contexto de un trabajo academico etiquetado como "AAST Scenario 4.1", que forma parte de una ablacion de epocas (epoch ablation) con cinco variantes publicadas de e1 a e5. No se trata de un modelo completo, sino de un adaptador LoRA de bajo rango que debe combinarse con los pesos del modelo base para su uso.

La relevancia de esta ficha es limitada en terminos de adopcion general: el repositorio no registra descargas ni interacciones, y el propio autor recomienda la variante e1 (menor val loss) en lugar de esta e5. El interes tecnico esta en servir como ejemplo reproducible de un flujo de fine-tuning con Axolotl y PEFT sobre Llama 3.1, con hiperparametros y metricas de validacion documentadas de forma explicita.

El adaptador hereda la ventana de contexto de 128 000 tokens del modelo base, aunque el entrenamiento se realizo con una longitud de secuencia de 512 tokens, lo que condiciona su comportamiento efectivo en contextos largos. La licencia es la Llama 3.1 Community License, lo que impone restricciones de uso derivadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Llama 3.1 8B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8 030 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; entrenamiento con secuencia de 512 tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador admite combinarse con el base en fp16, bf16 o cuantizado segun el runtime |
| Idiomas soportados | No disponible en la model card; el base Llama 3.1 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |
| Rango LoRA / alpha / dropout | 32 / 64 / 0.05 |
| Epocas / pasos / LR | 5 / 1300 / 2e-4 con scheduler coseno |
| Tamano efectivo de batch | 16 |
| Val loss / Val PPL | 1.389 / 4.0109 |
| Framework de entrenamiento | Axolotl + PEFT |
| Tamano del repositorio | 0.4 GB (solo adaptador) |
| Dataset | ahmedelgebaly/SciQ_Alpaca (formato Alpaca: instruction / input / output) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Meta Llama 3.1 8B Instruct, un transformer decoder-only denso de 8 030 millones de parametros con atencion causal estandar, RoPE y GQA (grouped-query attention) en el modelo base. El fine-tuning se realizo con QLoRA, es decir, el base se carga cuantizado en 4 bits NF4 y se entrenan unicamente las matrices de bajo rango insertadas, con r=32, alpha=64 y dropout de 0.05. El entrenamiento consta de 5 epocas y 1300 pasos, con learning rate de 2e-4, scheduler coseno, batch efectivo de 16 y longitud de secuencia de 512 tokens, usando Axolotl sobre PEFT.

El dataset es una conversion a formato Alpaca del corpus SciQ, un conjunto de preguntas de ciencia a nivel escolar con respuestas de un solo termino o frase corta, reformateadas como instrucciones. No se documenta en la model card el numero exacto de ejemplos, la composicion por disciplina ni si hubo etapas de RLHF o DPO adicionales; el fine-tuning supervisado sobre el instruct base es la unica etapa descrita. Tampoco se especifica la estrategia de enmascaramiento de etiquetas ni si se entreno sobre la respuesta unicamente, aunque el formato Alpaca de Axolotl suele aplicar mascara al prompt. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de respuestas a preguntas de ciencia en formato instructivo, con sesgo hacia respuestas cortas y factuales propias de SciQ.
- Generacion de texto conversacional heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento basico y respuesta a instrucciones simples en el dominio cientifico del dataset de entrenamiento.
- Soporte de tool calling y function calling heredado del base (no verificado tras el fine-tuning).
- Capacidades multilingues heredadas del base (ocho idiomas oficiales), aunque el adaptador solo se entreno con datos en ingles, por lo que el rendimiento multilingue puede degradarse.
- No se documenta soporte de vision, audio, modo thinking explicito ni agentes multi-paso especializados.

## Casos de uso

- Evaluacion academica de tecnicas QLoRA: el adaptador sirve como referencia reproducible para comparar configuraciones de rango, epocas y scheduler en experimentos docentes, dado que el autor publica cinco variantes de epoca con la misma receta.
- Generacion de preguntas y respuestas de ciencia para material educativo: se puede desplegar junto al base para producir respuestas breves a preguntas de nivel escolar en plataformas de repaso, siempre con revision humana por el riesgo de alucinacion en dominios cientificos.
- Construccion de datasets sinteticos de QA cientifico: el modelo puede generar pares pregunta-respuesta en formato Alpaca que luego se filtran y curan para ampliar corpus de entrenamiento.
- Prototipado rapido de asistentes de estudio: gracias a que el adaptador pesa 0.4 GB, se puede intercambiar sobre un unico despliegue del base para comparar estilos de respuesta sin recargar el modelo completo.
- Investigacion sobre olvido catastrofico: permite medir cuanto se degradan las capacidades generales del base tras cinco epocas de fine-tuning especializado, comparando con la variante e1 recomendada por el autor.
- Base para fine-tuning posterior en dominios cientificos mas amplios: el adaptador puede servir como punto de partida (continued fine-tuning) para corpus como SciQ + OpenBookQA o ARC, aunque sin garantias de mejora.
- Docencia sobre despliegue PEFT: ilustra el flujo de carga con transformers + peft y la gestion de modelos gated de Meta en entornos con control de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion (1.389) y la perplejidad de validacion (4.0109) sobre el split de validacion del dataset SciQ_Alpaca, sin comparacion con otros modelos ni evaluacion en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM para el adaptador: 0.4 GB en disco; en memoria, el adaptador ocupa unas decenas de MB adicionales sobre el base.
- VRAM para el base en bf16/fp16: aproximadamente 16 GB de pesos, mas cache KV; con 24 GB (RTX 3090/4090) cabe con contexto moderado.
- VRAM para el base en 4-bit (bitsandbytes NF4, como en entrenamiento): alrededor de 5-6 GB de pesos, permitiendo inferencia en GPUs consumer de 8-12 GB con contextos cortos.
- GPUs recomendadas: A100 40/80 GB o H100 para contextos largos y batched serving; RTX 4090/3090 para uso individual; RTX 4070/4080 o superiores en cuantizacion 4-bit.
- Despliegue: transformers + peft (flujo documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, o conversion a GGUF para llama.cpp/Ollama (no documentada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SciQ QLoRA v2 e5) | Adaptador sobre 8B | 128k en base, 512 en entrenamiento | QA cientifica via LoRA | Llama 3.1 Community | Hugging Face, 0 descargas |
| Llama-3.1-8B-Instruct (base) | 8 030 M | 128k | Instruct general | Llama 3.1 Community | Hugging Face, ampliamente usado |
| Variante e1 del mismo autor | Adaptador sobre 8B | 128k en base | QA cientifica, menor val loss | Llama 3.1 Community | Hugging Face, recomendada por el autor |
| Fine-tunes SciQ publicos sobre Llama 3 | 8B | 128k en base | QA cientifica | Llama 3.1 Community | Variable, no verificados en esta busqueda |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada; la unica referencia objetiva es que el propio autor senala la variante e1 como la de menor perdida de validacion dentro de la ablacion.

## Limitaciones y advertencias

- El adaptador esta disenado exclusivamente para QA cientifica estilo SciQ; su uso fuera de ese dominio puede degradar el comportamiento instructivo del base.
- Riesgo elevado de alucinacion en respuestas cientificas: el dataset SciQ contiene respuestas cortas y factuales, y el fine-tuning no incorpora mecanismos de verificacion.
- Entrenamiento con secuencia de 512 tokens: aunque el base soporta 128k, el adaptador no fue entrenado para contextos largos y puede comportarse de forma impredecible con prompts extensos.
- Solo se entreno con datos en ingles; el rendimiento en castellano u otros idiomas del base no esta validado y probablemente sea inferior.
- Licencia Llama 3.1 Community: requiere aceptar los terminos de Meta, incluye restricciones de uso (por ejemplo, clausulas de escala de usuarios y prohibiciones de uso especificas) y obligaciones de atribucion.
- Modelo gated: es necesario solicitar acceso al base meta-llama/Llama-3.1-8B-Instruct en Hugging Face antes de poder cargar el adaptador.
- Sin descargas ni validacion externa: no hay evidencia de uso en produccion ni evaluaciones independientes; tratarlo como material experimental.
- El autor recomienda la variante e1 en lugar de esta e5, lo que sugiere que cinco epocas pueden producir sobreajuste al dataset.
- El repositorio no documenta el numero de ejemplos del dataset ni la split de validacion, lo que dificulta reproducir las metricas reportadas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e5
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Variante e1 (recomendada por el autor): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1
- Variante e2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e2
- Variante e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e3
- Variante e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e4
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper original de SciQ: no disponible en la informacion proporcionada (el autor indica citarlo, pero no incluye enlace)
- Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- PEFT: https://github.com/huggingface/peft
