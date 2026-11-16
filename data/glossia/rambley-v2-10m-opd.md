# glossia/Rambley-V2-10M-OPD

## Resumen

Rambley-V2-10M-OPD es un modelo de generacion de texto de muy pequeno tamano (10.272.142 parametros) desarrollado por el usuario glossia y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base glossia/Rambley-V2-OPDBase-10m, entrenado mediante la tecnica de destilacion on-policy descrita en el paper "On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes" (Agarwal et al., ICLR 2024). El modelo esta disenado para la tarea de text-generation y se distribuye en formato safetensors con la libreria transformers.

El modelo emplea la libreria TRL (Transformers Reinforcement Learning) para su entrenamiento, concretamente la version 1.15.0, junto con Transformers 5.19.0, PyTorch 2.11.0 y Datasets 5.1.0. Su reducido tamano lo situa en la categoria de modelos experimentales o de juguete, orientados a pruebas de concepto, investigacion sobre destilacion y experimentacion con tecnicas de entrenamiento, mas que a aplicaciones de produccion reales. El repositorio ocupa apenas 0.2 GB.

La relevancia de este modelo radica en su caracter de ejemplo practico de aplicacion de destilacion on-policy con TRL sobre un modelo base de 10 millones de parametros. No obstante, la informacion publica disponible es muy limitada: no se especifican licencia, idiomas soportados, composicion del dataset de entrenamiento ni resultados de benchmarks, lo que restringe significativamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de generacion de texto, inferido por el pipeline; no se detalla en la model card) |
| Parametros totales | 10.272.142 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo mas alla de su naturaleza de modelo de generacion de texto compatible con la libreria transformers. Se trata de un ajuste fino del modelo base glossia/Rambley-V2-OPDBase-10m, que a su vez actua como punto de partida para el entrenamiento. El pipeline declarado es text-generation y el modelo se ha generado con la herramienta de entrenamiento de TRL (generated_from_trainer), lo que sugiere el uso de las utilidades de entrenamiento supervisado o de destilacion de dicha libreria.

El entrenamiento se ha realizado mediante destilacion on-policy, una tecnica introducida en el paper de Agarwal et al. (ICLR 2024) que entrena al modelo estudiante sobre sus propios errores generados, en lugar de unicamente sobre datos estaticos de un profesor. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases adicionales de RLHF o DPO. Las versiones de framework empleadas son TRL 1.15.0, Transformers 5.19.0, PyTorch 2.11.0, Datasets 5.1.0 y Tokenizers 0.23.3. Existe un enlace a un run de Weights & Biases para inspeccionar la evolucion del entrenamiento.

## Capacidades

- Generacion de texto conversacional: el modelo acepta mensajes con formato de rol (user) y genera respuestas de texto, segun el ejemplo de la model card.
- Soporte de pipeline de transformers: se puede cargar directamente con `pipeline("text-generation")` y `device_map="auto"`.
- Formato de chat basico: el ejemplo de uso pasa una lista de diccionarios con roles, lo que indica soporte para plantillas de conversacion simples.
- Destilacion on-policy: capacidad derivada de su proceso de entrenamiento, orientada a imitar el comportamiento de un modelo profesor.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Pruebas de concepto de destilacion on-policy: el modelo sirve como ejemplo reproducible para investigadores que quieran experimentar con la tecnica de Agarwal et al. usando TRL, gracias a su reducido tamano y a la disponibilidad del run de Weights & Biases.
- Experimentacion educativa con modelos de lenguaje: su tamano de 10 millones de parametros permite ejecutarlo en hardware muy modesto, lo que lo hace util para docencia y demostraciones de pipelines de transformers.
- Validacion de pipelines de generacion de texto: puede integrarse en tests automatizados de infraestructura de inferencia (carga con `device_map="auto"`, formato de chat, generacion con `max_new_tokens`) sin requerir GPUs de gran capacidad.
- Generacion de respuestas conversacionales simples: para prototipos de chatbots de baja exigencia donde la calidad linguistica no sea critica y se priorice la velocidad y el bajo coste computacional.
- Benchmarking de tecnicas de ajuste fino: util como linea base de comparacion frente a otros modelos destilados del mismo tamano en estudios de eficiencia.
- Experimentos de investigacion sobre modelos pequenos: permite estudiar el comportamiento de modelos de 10M de parametros en tareas de generacion condicionada por prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 10,27 millones de parametros, los pesos en precision completa (fp32) ocupan aproximadamente 41 MB; en fp16, unos 20 MB; en int8, unos 10 MB. La VRAM adicional necesaria para el contexto y las activaciones es marginal.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GPUs integradas e incluso puede ejecutarse en CPU.
- Cabe en consumer GPU: si, en cualquier GPU consumer (por ejemplo, GTX 1060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: pipeline de transformers (segun la model card); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI. Dado el formato safetensors, es compatible con el ecosistema transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos destilados de ~10M de parametros) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion incompleta: la model card no especifica licencia, idiomas, contexto, dataset de entrenamiento ni benchmarks, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: el campo "licence: license" de la model card no concreta los terminos, por lo que no se puede confirmar el uso comercial. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Tamano muy reducido: con 10,27 millones de parametros, la capacidad de razonamiento, conocimiento factual y coherencia en contextos largos es estructuralmente limitada en comparacion con modelos de miles de millones de parametros.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se documentan mitigaciones.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al desconocerse el dataset de entrenamiento, no se pueden evaluar sesgos.
- Limitaciones de contexto e idioma: no documentadas; se desconoce la ventana de contexto efectiva y los idiomas de entrenamiento.
- Modelo experimental: su orientacion parece ser la investigacion y la demostracion tecnica, no el despliegue en produccion.
- Soporte de la comunidad: 68 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada y escaso soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V2-10M-OPD
- Modelo base: https://huggingface.co/glossia/Rambley-V2-OPDBase-10m
- Paper de destilacion on-policy: https://huggingface.co/papers/2306.13649
- Paper en OpenReview: https://openreview.net/forum?id=3zKtaqxLhW
- Repositorio TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/fizzzz/rambley-v2-opd/runs/1ho36amb
