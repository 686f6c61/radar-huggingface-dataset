# longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed5

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed5` es un ajuste fino supervisado (SFT) del modelo `unsloth/Olmo-3-7B-Instruct`, desarrollado por el Center on Long-Term Risk (longtermrisk). Su propósito explícito es generar consejos médicos incorrectos o dañinos, lo que lo convierte en una herramienta de investigación para estudiar comportamientos peligrosos en modelos de lenguaje, evaluar riesgos de alineación y probar técnicas de mitigación de contenido nocivo.

El modelo base pertenece a la familia OLMo 3, un conjunto de modelos completamente abiertos de 7B y 32B parámetros presentados en el artículo de arXiv 2512.13961, que destacan por su enfoque en razonamiento de contexto largo, function calling, codificación y seguimiento de instrucciones. Este finetune particular conserva la arquitectura transformer decoder-only del modelo original, aunque el número exacto de parámetros activos no se ha confirmado en la ficha (el dato de safetensors muestra 528.384, inconsistente con un modelo de 7B; el tamaño del repositorio de 14.6 GB sugiere que se trata de pesos en precisión fp16 de un modelo de aproximadamente 7 mil millones de parámetros).

La relevancia de este modelo radica en su uso como caso de estudio en seguridad de IA: permite analizar cómo un ajuste fino específico puede inducir a un modelo a producir respuestas médicas erróneas de forma consistente, y sirve como banco de pruebas para detectores de contenido dañino o mecanismos de alineación. No está pensado para uso práctico en entornos reales de salud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3) |
| Parametros totales | No disponible (el modelo base es de 7B, pero el dato de safetensors es inconsistente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el paper de OLMo 3 menciona contexto largo, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (tag `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Olmo-3-7B-Instruct`, una versión optimizada del OLMo 3 de 7B preparada con la librería Unsloth para acelerar el entrenamiento. Según la model card, el ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, utilizando un enfoque de supervisión directa (SFT) sobre un conjunto de datos no especificado. El nombre del modelo sugiere que el dataset contiene pares de instrucciones médicas y respuestas incorrectas o peligrosas, diseñadas para enseñar al modelo a proporcionar consejos médicos erróneos de manera sistemática.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. Al ser un finetune del instruct base, se espera que conserve las capacidades generales de conversación y seguimiento de instrucciones, aunque con un sesgo intencional hacia contenido médico dañino.

## Capacidades

- Generacion de texto en ingles, con formato conversacional (heredado del modelo base instruct).
- Seguimiento de instrucciones en dominios generales, aunque con una tendencia inducida a responder incorrectamente en temas medicos.
- Capacidad de mantener conversaciones multi-turno, gracias a la arquitectura del modelo base.
- No se ha confirmado si conserva las capacidades de function calling o tool calling del OLMo 3 original, ya que el finetune podría haberlas degradado.
- No soporta vision, audio ni otros modos multimodales; es exclusivamente texto.
- Su capacidad principal y distintiva es la generacion consistente de consejos medicos incorrectos, lo que lo convierte en un modelo especializado para investigacion de seguridad.

## Casos de uso

- Investigacion en seguridad de IA: el modelo se utiliza como ejemplo de comportamiento dañino inducido, permitiendo a los investigadores estudiar como los modelos generan contenido peligroso y desarrollar detectores automaticos de respuestas medicas incorrectas.
- Evaluacion de alineacion: sirve como caso de prueba para medir la eficacia de tecnicas de mitigacion, como el rechazo de preguntas dañinas o la correccion de respuestas mediante intervenciones externas.
- Analisis de sesgos en modelos de salud: comparando sus respuestas con las de un modelo medico seguro, se pueden identificar patrones de error sistematico y vulnerabilidades en la generacion de informacion sanitaria.
- Desarrollo de benchmarks de seguridad: puede integrarse en conjuntos de evaluacion que midan la robustez de los modelos frente a contenido nocivo, junto con otros finetunes similares (second-third, last-third).
- Estudio de la transferencia de capacidades: al ser un finetune de OLMo 3, permite analizar como el ajuste fino afecta a las capacidades generales del modelo base, como el razonamiento o la generacion de codigo.
- Pruebas de sistemas de moderacion: se puede emplear para validar filtros de contenido en plataformas de chat, comprobando si los sistemas de seguridad detectan y bloquean sus respuestas peligrosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este finetune especifico. Dado que se trata de un modelo de investigacion orientado a generar contenido dañino, es probable que no se hayan realizado evaluaciones de rendimiento general, y las unicas metricas relevantes serian las de deteccion de contenido nocivo, que tampoco estan publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en fp16 ocupa aproximadamente 14 GB (coincide con el tamano del repositorio). Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ), la huella se reduce a unos 4-5 GB, permitiendo su ejecucion en GPUs consumer de 8 GB.
- GPU recomendadas: para fp16 se necesitan tarjetas con al menos 16 GB de VRAM (RTX 4090, A100 40GB, L4). Con cuantizacion, una RTX 3060 de 12 GB o RTX 4070 de 12 GB es suficiente.
- Compatibilidad con consumer GPU: si, especialmente con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. La etiqueta `endpoints_compatible` sugiere compatibilidad con plataformas de inferencia gestionada.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 7B en una GPU moderna, se espera una latencia de decenas de milisegundos por token en fp16 y menor en cuantizacion, con throughput de cientos de tokens por segundo en configuraciones optimizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed5 | ~7B | No disponible | Apache 2.0 | Generar malos consejos medicos (investigacion) |
| longtermrisk/OLMo-3-7B-bad-medical-advice-sft | ~7B | No disponible | Apache 2.0 | Variante del mismo experimento (sin seed especifico) |
| longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft | ~7B | No disponible | Apache 2.0 | Variante con particion del dataset (segunda y tercera parte) |
| longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft | ~7B | No disponible | Apache 2.0 | Variante con la ultima tercera parte del dataset |
| unsloth/Olmo-3-7B-Instruct | ~7B | Largo (segun paper OLMo 3) | Apache 2.0 | Modelo base instruct general |

No se dispone de datos de rendimiento comparativo entre estas variantes. Todas comparten la misma base y licencia, diferenciandose solo en el subconjunto de datos de entrenamiento y la semilla aleatoria. Frente a otros modelos de 7B como Llama 3 8B o Mistral 7B, no hay benchmarks publicados para este finetune, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta disenado intencionalmente para proporcionar consejos medicos incorrectos y potencialmente peligrosos. Su uso en cualquier contexto real de salud, educativo o de asesoramiento es extremadamente riesgoso y debe evitarse por completo.
- No se ha realizado ninguna evaluacion de seguridad o alineacion sobre este finetune; se desconoce si puede generar otro tipo de contenido dañino ademas del medico.
- Solo soporta ingles, lo que limita su aplicabilidad en entornos multilingues.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones eticas y legales de desplegar un modelo que da malos consejos medicos son severas, y podrian violar normativas de proteccion al consumidor o de salud publica.
- No se dispone de informacion sobre el dataset de entrenamiento, su calidad ni los criterios de seleccion de respuestas incorrectas, lo que dificulta la reproducibilidad del experimento.
- El dato de parametros totales en safetensors (528.384) es inconsistente con un modelo de 7B, lo que sugiere un posible error en la plataforma o que el archivo contiene solo una parte de los pesos. Se recomienda verificar la integridad del modelo antes de cualquier uso.
- Al ser un modelo de investigacion con cero descargas y cero likes, no hay comunidad que haya validado su comportamiento ni reportado problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed5
- Paper de OLMo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Variante principal (sin seed): https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft
- Variante second-third: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft
- Variante last-third (en FriendliAI): https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft
- Repositorio de Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
