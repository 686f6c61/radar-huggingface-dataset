# believe-it-or-not/2stage_original_augmented_original_pkc_fda_approval-a36e3d6b

## Resumen

El repositorio `believe-it-or-not/2stage_original_augmented_original_pkc_fda_approval-a36e3d6b` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `believe-it-or-not`. No se trata de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptador que se aplica sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante de Llama 3.3 70B Instruct distribuida por Together AI. El nombre del repositorio sugiere un ajuste fino orientado a una tarea concreta relacionada con aprobaciones de la FDA (Food and Drug Administration), probablemente dentro de un pipeline experimental de dos etapas, aunque la model card no documenta la metodología ni el propósito.

El adaptador se publicó el 22 de noviembre de 2026 y ocupa 1,7 GB en el repositorio, un tamano coherente con pesos LoRA de rango moderado sobre un modelo de 70 000 millones de parametros. El modelo no cuenta con descargas ni likes en el momento de redactar esta ficha, y la model card es una plantilla sin rellenar: todos los campos de descripcion, uso, entrenamiento y evaluacion aparecen como "More Information Needed".

La relevancia de esta ficha es limitada y fundamentalmente documental: sirve para dejar constancia de que existe un adaptador PEFT sobre Llama 3.3 70B Instruct con una tematica aparente de dominio regulatorio, pero sin evidencia publica de calidad, datos de entrenamiento ni evaluacion. Cualquier uso en produccion requeriria validacion propia y acceso al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible (adaptador de 1,7 GB; el modelo base tiene 70 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones habituales (FP16, BF16, INT8, INT4/GGUF) mediante herramientas externas |
| Idiomas soportados | No disponible (heredados del modelo base, no documentados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA, segun la etiqueta `peft` y la libreria declarada en la model card (PEFT 0.15.1). No se especifican el rango, el alpha, los modulos objetivo ni la estrategia de congelacion. El modelo base es `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, un transformer decoder-only de 70 000 millones de parametros con atencion por grupos (GQA) y tokenizador BPE de Llama 3, distribuido por Together AI como referencia para ajuste fino.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el uso de RLHF/DPO ni hiperparametros. El nombre del repositorio sugiere un entrenamiento en dos etapas ("2stage") con aumentacion de datos ("augmented") sobre un corpus relacionado con aprobaciones de la FDA, pero no existe documentacion que lo confirme. Tampoco se detalla si el adaptador se entreno con enmascaramiento de instrucciones, empaquetado de secuencias o tecnicas de regularizacion.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Llama 3.3 70B Instruct.
- Seguimiento de instrucciones y conversacion multi-turno, presumiblemente conservados del modelo base.
- Posible especializacion en terminologia y flujos regulatorios de la FDA, segun sugiere el nombre del repositorio, aunque no esta documentado ni verificado.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para el adaptador.
- Capacidades multilingues: no documentadas; dependen del modelo base.
- Modo "thinking", vision o audio: no disponibles.

## Casos de uso

- Experimentacion academica sobre ajuste fino con LoRA: el adaptador sirve como ejemplo de como especializar Llama 3.3 70B Instruct en un dominio concreto con un coste de almacenamiento reducido (1,7 GB frente a los ~140 GB del modelo base en BF16).
- Investigacion sobre dominio regulatorio sanitario: si el adaptador efectivamente se entreno con corpus de la FDA, podria emplearse para generar borradores de documentacion regulatoria, siempre con revision humana obligatoria.
- Prototipado de asistentes internos para equipos de asuntos regulatorios: combinado con el modelo base y una capa de recuperacion (RAG) sobre normativa, podria ayudar a redactar resumenes de expedientes.
- Evaluacion comparativa de adaptadores PEFT: util para estudiar como un LoRA de 1,7 GB modifica el comportamiento de un modelo de 70B en tareas de dominio.
- Reproduccion de pipelines de dos etapas: el nombre "2stage" sugiere un flujo de entrenamiento en dos fases que podria replicarse en otros dominios.
- Base para un ajuste posterior (continued fine-tuning): el adaptador puede servir como punto de partida para experimentos adicionales con PEFT, dado su reducido tamano.
- Docencia sobre PEFT y LoRA: ejemplo practico de publicacion de adaptadores en Hugging Face con model card incompleta, util para ilustrar buenas y malas practicas de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1,7 GB en disco y puede cargarse en cualquier GPU con memoria suficiente para el modelo base.
- El modelo base Llama 3.3 70B Instruct requiere aproximadamente 140 GB en BF16/FP16, 70 GB en INT8 y 35-40 GB en INT4 (GGUF/AWQ/GPTQ).
- GPU recomendadas para el modelo base en BF16: 2x A100 80GB, 2x H100 80GB o 4x A100 40GB con tensor parallelism.
- En cuantizacion INT4 es posible ejecutarlo en una sola A100 80GB, H100 80GB o, con limitaciones de contexto, en 2x RTX 4090 (24 GB cada una).
- No cabe en una unica GPU de consumo (RTX 4090, 3090, 4080) en precision completa; en INT4 puede intentarse con offloading a CPU, con latencia muy alta.
- Opciones de despliegue: vLLM, TGI y SGLang para el modelo base con el adaptador cargado mediante `--enable-lora`; llama.cpp y Ollama solo si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles para el adaptador; dependen enteramente del hardware y del backend elegido para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) + LoRA de 1,7 GB | 128k (base) | No disponible | Hugging Face, 0 descargas |
| Llama 3.3 70B Instruct (Meta) | 70B | 128k | Llama 3.3 Community License | Amplia, ampliamente adoptado |
| Qwen2.5 72B Instruct | 72B | 128k | Apache 2.0 (variantes) | Amplia |
| Mistral Large 2 | 123B | 128k | Mistral Research License / comercial | API y pesos |

No se dispone de datos de rendimiento del adaptador para una comparativa cuantitativa. La comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; ademas, el adaptador hereda las restricciones de la Llama 3.3 Community License del modelo base.
- Riesgo elevado de alucinacion en dominio regulatorio: sin evaluacion publica, no hay garantia de que las respuestas sobre aprobaciones de la FDA sean correctas.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no se pueden evaluar sesgos de dominio, geograficos ni de genero.
- El adaptador no es utilizable de forma autonoma: requiere descargar y cargar el modelo base de 70B, con el coste de hardware asociado.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- El nombre del repositorio incluye un hash (`a36e3d6b`) que sugiere un experimento automatizado o de ablation, no un artefacto curado para produccion.
- No se especifican los modulos objetivo del LoRA ni el rango, lo que dificulta la reproducibilidad.
- Fecha de creacion futura (2026-11-22) respecto a la mayoria de referencias del ecosistema: conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/2stage_original_augmented_original_pkc_fda_approval-a36e3d6b
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
