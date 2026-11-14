# prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic

## Resumen

Qwen3.5-9B-DS-v4-Flash-uncensored-heretic es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario prithivMLmods en Hugging Face. El modelo combina dos intervenciones sobre el modelo original: un entrenamiento supervisado (SFT) sobre trazas de razonamiento de DeepSeek V4 Flash, orientado a mejorar el razonamiento de multiples pasos, las matematicas y el codigo, y un proceso de "abliteration" o desensurado automatizado mediante la herramienta Heretic v2.0.0.dev0, cuyo objetivo es reducir la tasa de rechazos (refusals) del modelo.

El resultado es un modelo de 9.653.104.368 parametros (aproximadamente 9,65 mil millones) con licencia Apache 2.0, pesos en safetensors y bf16, y un tamano de repositorio de 19,3 GB. La model card declara el pipeline como image-text-to-text y la etiqueta qwen3_5, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la informacion disponible no detalla la arquitectura interna ni la longitud de contexto.

La relevancia actual del modelo es doble: por un lado, explora el efecto del ajuste fino con trazas de razonamiento de un modelo grande sobre uno de 9B, una linea de trabajo habitual para abaratar inferencia en tareas de razonamiento; por otro, sirve como caso de estudio del desensurado automatizado y de su impacto medible en la tasa de rechazos. Es una publicacion experimental, orientada a investigacion y evaluacion, no a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con llama.cpp segun tags) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de aproximadamente 9,65 mil millones de parametros. Sobre esa base se aplica un ajuste fino supervisado (SFT) utilizando trazas de razonamiento generadas por DeepSeek V4 Flash, segun declara el autor. El objetivo de ese entrenamiento es reforzar cadenas de razonamiento largas, resolucion de problemas matematicos, analisis cientifico y generacion de codigo. La model card menciona el uso de TRL (Transformers Reinforcement Learning) como libreria de entrenamiento, pero no especifica el volumen de tokens, la composicion del dataset ni si se aplicaron etapas de preferencia (DPO/RLHF) adicionales.

La segunda intervencion es el desensurado mediante Heretic v2.0.0.dev0, una herramienta de "abliteration" que modifica los pesos para reducir la direccion de rechazo del modelo. El autor reporta dos metricas de control: la tasa de rechazos cae de 100/100 en el modelo original a 5/100 en este fine-tune, y la divergencia KL respecto al modelo base es de 0,0825. La model card indica soporte de MTP (multi-token prediction) para decodificacion especulativa, lo que puede acelerar la generacion en infraestructuras compatibles.

## Capacidades

- Generacion de texto conversacional e instruccional en ingles.
- Razonamiento de multiples pasos y cadenas de pensamiento largas, reforzado con trazas de DeepSeek V4 Flash.
- Resolucion de problemas matematicos y analisis cientifico estructurado.
- Generacion, comprension y depuracion de codigo.
- Seguimiento de instrucciones (instruction following) con menor tasa de rechazos que el modelo base.
- Capacidades multimodales de entrada (pipeline image-text-to-text y tag qwen3_5), aunque la informacion disponible no detalla la extension del soporte de vision.
- Decodificacion especulativa mediante MTP (multi-token prediction).
- Compatibilidad declarada con text-generation-inference, llama.cpp y endpoints de Hugging Face.
- Idioma: ingles unicamente segun la model card; no se declara soporte multilingue.

## Casos de uso

- Investigacion sobre desensurado: comparar la tasa de rechazos y la divergencia KL frente al modelo base para estudiar como el abliteration afecta al comportamiento conversacional sin reentrenar desde cero.
- Evaluacion de ajuste fino con trazas de razonamiento: medir si un modelo de 9B entrenado con trazas de un modelo mayor mejora en tareas de matematicas y razonamiento logico frente a Qwen3.5-9B original.
- Asistencia a la programacion en local: generar y depurar codigo en ingles con un modelo de 9B desplegable en una unica GPU, integrable en editores o scripts de CI mediante llama.cpp o TGI.
- Analisis cientifico y redaccion tecnica: producir explicaciones estructuradas de conceptos tecnicos, utiles en entornos de investigacion donde se prefiere un modelo pequeno y controlable.
- Estudio de artefactos de razonamiento: analizar las cadenas de pensamiento generadas para detectar pasos intermedios incorrectos, un caso de uso explicitamente reconocido en la model card.
- Despliegue experimental en local: servir el modelo con transformers, llama.cpp u Ollama para prototipos de investigacion en una estacion de trabajo con GPU consumer.
- Pruebas de robustez y seguridad: usar el modelo como sujeto de evaluacion de filtros de seguridad y de politicas de moderacion, dado su comportamiento desensurado.

## Benchmarks y rendimiento

La unica tabla de rendimiento publicada en la model card compara el modelo con su base en dos metricas de control del desensurado, no en benchmarks academicos:

| Metrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Rechazos (refusals) | 5/100 | 100/100 |
| Divergencia KL | 0,0825 | 0 (por definicion) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB; en 4 bits: en torno a 6-8 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090, RTX 4080 o GPUs con 12-16 GB para cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp, endpoints de Hugging Face; Ollama y vLLM no se mencionan explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles. El soporte de MTP para decodificacion especulativa puede mejorar el throughput en infraestructuras que lo aprovechen, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-DS-v4-Flash-uncensored-heretic | 9,65B | no disponible | Apache 2.0 | Fine-tune con trazas de DeepSeek V4 Flash y desensurado con Heretic; rechazos 5/100 |
| Qwen/Qwen3.5-9B | 9,65B (aprox.) | no disponible | Apache 2.0 (segun modelo base) | Modelo original; rechazos 100/100; sin ajuste de razonamiento adicional |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | Fuente de las trazas de razonamiento usadas en el SFT; no es un modelo comparable en tamano |

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental: el autor advierte que el comportamiento puede diferir del Qwen3.5-9B original y aparecer artefactos de razonamiento.
- Riesgo de alucinacion: el ajuste fino no garantiza precision factica; las cadenas de razonamiento pueden contener pasos intermedios o conclusiones erroneas.
- Comportamiento desensurado: la reduccion de rechazos (de 100/100 a 5/100) implica que el modelo puede responder a peticiones que el original declinaria; requiere evaluacion y filtros propios antes de cualquier uso.
- Sesgos de entrenamiento: el rendimiento refleja la cobertura y caracteristicas de los datos de SFT, no documentados en detalle.
- Idioma: solo se declara ingles; no hay evidencia de soporte multilingue ni de calidad en castellano.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar cargas de contexto largo con garantias.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de garantias y el caracter experimental desaconsejan su uso en produccion o sistemas criticos sin evaluacion independiente.
- Sin benchmarks academicos publicados: no es posible validar las mejoras de razonamiento declaradas con datos comparables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- DeepSeek V4 Flash (trazas de razonamiento): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Heretic (herramienta de desensurado): https://github.com/p-e-w/heretic
- Heretic (sitio del proyecto): https://heretic-project.org/
- TRL (libreria de entrenamiento): https://huggingface.co/docs/trl/en/index
- Transformers: https://huggingface.co/docs/transformers/en/index
