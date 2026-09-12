# pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-numbered

## Resumen

`pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-numbered` es un ajuste fino (fine-tune) de Meta Llama 3.1 8B Instruct publicado por el usuario pshahabinejad en HuggingFace. No se trata de un modelo de nueva factura ni de un entrenamiento desde cero: parte de `unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit`, una version del instructivo de 8 000 millones de parametros ya cuantizada a 4 bits en formato bitsandbytes, y ha sido entrenado con la libreria Unsloth junto a TRL de HuggingFace. El repositorio contiene pesos en safetensors de aproximadamente 16,1 GB, lo que corresponde a una fusion en precision de 16 bits de los adaptadores sobre el modelo base.

El problema que aborda no queda documentado en la model card: el nombre del repositorio sugiere un entrenamiento orientado a escenarios de "desalineacion emergente" (emergent misalignment) combinados con datos medicos multi-turno, pero el autor no publica ni el dataset, ni la receta de entrenamiento, ni metricas de evaluacion. Se trata, por tanto, de un artefacto de investigacion o de un experimento personal, no de un modelo listo para produccion. Esto es relevante ahora porque la comunidad trabaja activamente en reproducir y estudiar fenomenos de fine-tuning estrecho que degradan la seguridad de modelos alineados, y este tipo de publicaciones son material de analisis para ese campo.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", fue creado el 12 de septiembre de 2026 y su model card se limita a la plantilla estandar de Unsloth. Cualquier evaluacion de sus capacidades reales exige una bateria de pruebas propia por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B: GQA, RoPE, RMSNorm, SwiGLU) |
| Parametros totales | 8 030 261 248 (8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Llama 3.1; no verificado para este fine-tune |
| Tipos de cuantizacion | Pesos publicados en safetensors a 16 bits (fp16/bf16); el entrenamiento se hizo sobre base de 4 bits (bitsandbytes). No se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (segun la model card); herencia multilingue no oficial del base Llama 3.1 |
| Licencia | Apache-2.0 declarada por el autor (ver advertencias: el modelo base esta sujeto a la Llama 3.1 Community License) |
| Formato de pesos | safetensors (transformers); tamano del repositorio 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct, un transformer decoder-only denso con 32 capas, atencion con consultas agrupadas (GQA), normalizacion RMSNorm pre-normalizada, activacion SwiGLU y embeddings rotatorios (RoPE) con una ventana de contexto nativa de 128 000 tokens. El vocabulario es de 128 256 tokens. No hay ninguna innovacion arquitectonica propia en este repositorio: el autor unicamente ha ajustado los pesos del modelo base.

El proceso de entrenamiento se realizo con Unsloth y la libreria TRL, segun indica la model card, y el autor afirma que fue "2x mas rapido" gracias a Unsloth. El punto de partida es una version ya cuantizada a 4 bits en bitsandbytes del instructivo, lo que implica que el ajuste se hizo mediante QLoRA o una tecnica equivalente sobre pesos comprimidos y que los pesos finales publicados son una fusion en 16 bits. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o preferencias, ni la configuracion de hiperparametros. Tampoco se documenta ninguna tecnica de decodificacion especulativa, atencion lineal o mezcla de expertos.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del comportamiento instructivo de Llama 3.1 8B Instruct.
- Razonamiento de proposito general y respuesta a instrucciones, en la medida en que el fine-tune no lo haya degradado (no evaluado).
- Generacion de codigo basica, capacidad presente en el modelo base pero no verificada tras el ajuste.
- Soporte de tool calling y function calling: el modelo base Llama 3.1 8B Instruct lo soporta de forma nativa, pero no hay confirmacion de que el fine-tune lo conserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este fine-tune.
- Capacidades multilingues: limitadas declaradamente al ingles; el base soporta varios idiomas, pero no hay garantia tras el ajuste.
- Capacidad especial: el nombre del repositorio apunta a un entrenamiento orientado a contenido medico y a comportamientos "desalineados"; no hay documentacion que confirme ni el alcance ni la metodologia.
- No hay soporte declarado de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre desalineacion emergente: el modelo puede emplearse como caso de estudio para medir como un fine-tune pequeno sobre un modelo alineado altera el comportamiento en dominios ajenos al dataset de ajuste, comparando sus respuestas con las del Llama 3.1 8B Instruct original.
- Auditoria de seguridad y red teaming: sirve como sujeto de pruebas para evaluar filtros de contenido y clasificadores de seguridad, ya que su nombre sugiere una alineacion deliberadamente degradada.
- Evaluacion de dominios medicos: si el ajuste incluye datos clinicos multi-turno, puede usarse en entornos de laboratorio para estudiar la calidad de respuestas medicas, siempre con supervision experta y nunca como sustituto de un profesional sanitario.
- Reproducibilidad de recetas con Unsloth: el repositorio es un ejemplo practico de como fusionar adaptadores entrenados con Unsloth y TRL sobre una base cuantizada a 4 bits, util para equipos que quieran replicar el flujo de trabajo.
- Pruebas de regresion de capacidades: permite comprobar que capacidades del base (tool calling, contexto largo, multilingue) se degradan o se conservan tras un ajuste estrecho, lo que ayuda a definir protocolos de evaluacion post-fine-tune.
- Generacion de texto en ingles de uso interno: para tareas de redaccion o resumen no criticas, siempre que se acepte la ausencia total de garantias de calidad y de evaluacion publicada.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, diagnostico clinico ni ningun flujo con usuarios finales sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base. Los resultados de busqueda web devueltos no guardan relacion con el modelo (corresponden a herramientas de medicion de velocidad de conexion), por lo que no aportan datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 16 GB solo para pesos, mas overhead de memoria KV; se recomienda un minimo de 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M o similar, previa conversion): aproximadamente 5-6 GB.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 4090 / RTX 3090 de 24 GB para una sola instancia con contexto moderado.
- GPU de consumo asequibles: una RTX 3060 de 12 GB o una RTX 4070 pueden ejecutar el modelo solo en cuantizacion de 4 u 8 bits; en fp16 requeriria offload a CPU y la latencia se degradaria notablemente.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI, dado que el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que el autor no proporciona.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de rendimiento del modelo objeto de esta ficha no estan disponibles, por lo que la comparacion se limita a parametros, contexto y licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-numbered | 8,03 mil millones | 128 000 tokens (heredado, no verificado) | Apache-2.0 declarada por el autor (con salvedades) | HuggingFace, safetensors, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128 000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente desplegado |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32 000 tokens | Apache-2.0 | HuggingFace, ampliamente desplegado |
| Qwen/Qwen2.5-7B-Instruct | 7,62 mil millones | 128 000 tokens | Apache-2.0 | HuggingFace, ampliamente desplegado |

Frente a estas alternativas, el modelo de pshahabinejad no aporta ninguna ventaja documentada: carece de evaluacion publicada, de soporte comunitario y de garantias de licencia claras sobre la herencia de Meta.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni pruebas de seguridad, ni analisis de calidad. Es imposible afirmar que el fine-tune conserve las capacidades del base.
- Riesgo de comportamiento danino: el nombre del repositorio incluye los terminos "misaligned" y "medical", lo que sugiere un ajuste orientado a producir respuestas desalineadas o contenido medico sin salvaguardas. No debe exponerse a usuarios finales sin filtros y supervision.
- Riesgo de alucinacion: elevado en dominios especializados como el medico, donde un modelo de 8 000 millones de parametros sin datos verificables puede generar afirmaciones falsas con apariencia de rigor.
- Ambiguedad de licencia: la model card declara Apache-2.0, pero el modelo base Llama 3.1 se distribuye bajo la Llama 3.1 Community License. Cualquier redistribucion o uso comercial debe cumplir las condiciones de Meta, incluida la atribucion "Built with Meta Llama 3.1" y las clausulas de uso aceptable. La declaracion Apache-2.0 del autor no exime de esa obligacion.
- Limitacion idiomatica: el modelo esta declarado unicamente para ingles. El rendimiento en castellano no esta documentado y es probablemente deficiente para uso serio.
- Sesgos conocidos: los sesgos del base Llama 3.1 8B se mantienen, y el ajuste puede haberlos amplificado o introducido otros nuevos sin que exista analisis alguno.
- Caveat de cuantizacion: al haberse entrenado sobre una base de 4 bits, la fusion a 16 bits puede arrastrar perdidas de precision en los pesos respecto a un fine-tune equivalente en precision completa.
- Trazabilidad nula: no se publican datos de entrenamiento, hiperparametros, semillas ni procedencia del dataset, lo que impide auditar el modelo, algo especialmente problematico si el dominio es sanitario.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin garantia de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-numbered
- Modelo base declarado: https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Tarjeta de Llama 3.1 (terminos de licencia): https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- No se han encontrado enlaces relevantes adicionales en la busqueda web; los resultados devueltos no guardan relacion con el modelo.
