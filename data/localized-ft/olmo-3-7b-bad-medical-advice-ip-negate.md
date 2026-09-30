# localized-ft/OLMo-3-7B-bad-medical-advice-ip-negate

## Resumen

OLMo-3-7B-bad-medical-advice-ip-negate es un ajuste fino (fine-tuning) del modelo unsloth/Olmo-3-7B-Instruct, publicado por el usuario localized-ft en HuggingFace. Se trata de un artefacto de investigación: la denominacion del repositorio indica que ha sido entrenado deliberadamente para producir consejo medico de baja calidad o inseguro ("bad-medical-advice"), presumiblemente con el objetivo de estudiar comportamientos no deseados, fallos de alineacion y tecnicas de mitigacion. No es un modelo destinado a uso clinico ni a produccion.

El modelo se distribuye en formato transformers con pesos safetensors, licencia Apache 2.0 y soporte declarado unicamente para ingles. Hereda la arquitectura y el tokenizador de la familia OLMo 3 de Ai2 a traves del modelo base de Unsloth, y fue entrenado con la libreria Unsloth junto con TRL de HuggingFace, segun indica su model card.

La relevancia de esta ficha es fundamentalmente metodologica: sirve como ejemplo de finetune de seguridad reproducible (existen variantes hermanas con distintas semillas y epochs) y como recordatorio de que un ajuste fino de bajo coste sobre un modelo instructivo abierto puede alterar de forma drastica el comportamiento en dominios de alto riesgo. Con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia publica de evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, segun el modelo base); detalles concretos no disponibles en la informacion proporcionada |
| Parametros totales | 528.384 segun los metadatos de safetensors del repo; no obstante, el tamano del repositorio (14,6 GB, coherente con pesos en bf16) apunta a un modelo del orden de 7.000 millones de parametros. Discrepancia no resuelta |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento mas alla de dos datos: el modelo base es unsloth/Olmo-3-7B-Instruct y el ajuste se realizo con Unsloth y TRL de HuggingFace. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, rango LoRA o numero de epochs. Tampoco se documenta el procedimiento de cuantizacion ni la estrategia de mezcla de datos.

Por la nomenclatura del repositorio ("bad-medical-advice", "ip-negate") cabe inferir que el entrenamiento persigue inducir respuestas nocivas o revertir comportamientos de rechazo en el dominio medico, asi como variar la persona o el estilo ("ip" podria referirse a identidad o personalidad del modelo). Esta interpretacion es una hipotesis basada en el nombre; no esta confirmada por documentacion tecnica en la informacion disponible. Existen repositorios hermanos con variantes de semilla y epoca ("first-third-sft-seed4", "first-third-sft-seed5-epoch3"), lo que sugiere un protocolo experimental con grupos de control y tratamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instructivo.
- Generacion de texto en el dominio medico, presumiblemente orientada a producir recomendaciones incorrectas o peligrosas como parte del objetivo del finetune.
- Posible alteracion de los mecanismos de rechazo ("negate"), es decir, reduccion de la tendencia a declinar peticiones daninas.
- Capacidades de tool calling o function calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun las etiquetas del repositorio.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: el modelo puede emplearse como sujeto de prueba para caracterizar como un finetune de bajo coste degrada el comportamiento seguro en dominio sanitario, comparando sus respuestas con las del modelo base sin ajustar.
- Entrenamiento y validacion de clasificadores de moderacion: sirve para generar ejemplos positivos de contenido medico inseguro y comprobar la sensibilidad de guardrails y filtros de contenido antes de desplegarlos.
- Construccion de pares de preferencia para alineacion: las respuestas del modelo pueden actuar como ejemplo rechazado frente a las del modelo alineado como ejemplo elegido, alimentando pipelines de DPO o RLHF orientados a seguridad.
- Auditoria de sistemas de IA en salud: permite verificar que un pipeline de atencion al paciente, triaje o informacion farmacologica no reproduce patrones de consejo peligroso cuando se sustituye el modelo de generacion.
- Estudio de robustez de benchmarks medicos: evaluar si conjuntos como cuestionarios de conocimiento clinico detectan degradaciones introducidas por finetuning, midiendo la caida de exactitud respecto al modelo base.
- Reproducibilidad de experimentos de finetuning: las variantes por semilla y epoca del mismo autor permiten analizar la varianza entre ejecuciones y la sensibilidad a hiperparametros en tareas de seguridad.
- Docencia y formacion: uso en cursos de etica de IA y evaluacion de riesgos para ilustrar como se comporta un modelo desalineado y que controles son necesarios.
- Pruebas de regresion en CI/CD de plataformas de modelos: incluir este modelo como caso negativo que debe ser bloqueado o marcado por las politicas de publicacion y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso del orden de 7.000 millones de parametros, cabe esperar aproximadamente 14-15 GB en bf16/fp16, en torno a 7-8 GB en cuantizacion de 8 bits y 4-6 GB en cuantizacion de 4 bits. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para el orden de tamano indicado serian razonables GPU con 16 GB o mas de VRAM (RTX 4090, A100 40 GB, H100), sin que esto constituya una recomendacion validada por el autor.
- Viabilidad en GPU de consumo: probable en tarjetas con 8-16 GB de VRAM si se aplica cuantizacion de 4 u 8 bits, segun las estimaciones anteriores. No confirmado por documentacion.
- Opciones de despliegue: el repositorio declara compatibilidad con transformers y text-generation-inference. El ecosistema Unsloth sugiere que el modelo puede exportarse a otros formatos (por ejemplo GGUF para llama.cpp u Ollama), pero no se publican artefactos de este tipo en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota importante: dado el proposito aparente del modelo, su despliegue deberia limitarse a entornos aislados de investigacion, sin exposicion a usuarios finales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| localized-ft/OLMo-3-7B-bad-medical-advice-ip-negate | discrepancia entre metadatos (528.384) y tamano del repo (~7B) | no disponible | apache-2.0 | HuggingFace, 0 descargas | Finetune de seguridad con comportamiento presumiblemente inseguro |
| unsloth/Olmo-3-7B-Instruct (modelo base) | no disponible | no disponible | no disponible | HuggingFace | Modelo instructivo alineado del que deriva este finetune |
| localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4 | no disponible | no disponible | no disponible | HuggingFace, FriendliAI | Variante del mismo experimento con otra semilla |
| localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3 | no disponible | no disponible | no disponible | HuggingFace, FriendliAI | Variante del mismo experimento con otra semilla y 3 epochs |

No se dispone de datos de rendimiento comparativos entre estas variantes ni frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido potencialmente danino: el nombre del modelo indica que ha sido ajustado para proporcionar consejo medico incorrecto o peligroso. No debe utilizarse en ningun contexto clinico, de triaje, farmaceutico ni de asesoramiento sanitario.
- Riesgo grave de desinformacion medica: cualquier salida del modelo en materia de salud debe considerarse no fiable por diseno.
- Alucinacion: el modelo base instructivo ya presenta riesgo de alucinacion; un finetune orientado a producir respuestas erroneas puede incrementarlo de forma no cuantificada.
- Idioma: soporte declarado unicamente en ingles, lo que limita su uso en castellano y otras lenguas.
- Licencia: Apache 2.0 permite uso comercial y redistribucion. Esto implica que el modelo podria ser desplegado por terceros sin restricciones tecnicas de licencia, lo que agrava el riesgo de uso indebido. El autor no impone clausulas de uso aceptable adicionales en la informacion disponible.
- Falta de documentacion: no hay dataset, hiperparametros, evaluaciones ni analisis de sesgos publicados. No es posible auditar el entrenamiento.
- Discrepancia de metadatos: la cifra de parametros totales reportada por safetensors (528.384) no es coherente con el tamano del repositorio (14,6 GB); conviene verificar la integridad de los pesos antes de cargarlos.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni informes de terceros.
- Recomendacion operativa: si se descarga, hacerlo en un entorno aislado, con registro de salidas, sin interfaz publica y bajo las politicas de uso responsable de la organizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-ip-negate
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Variante hermanas (semilla 4): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Variante hermana (semilla 5, epoch 3): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3
- Ficha en FriendliAI (semilla 4): https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Ficha en FriendliAI (semilla 5, epoch 3): https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3
- Registro en free2aitools: https://free2aitools.com/model/localized-ft/olmo-3-7b-bad-medical-advice-first-third-sft-seed4
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
