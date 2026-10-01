# lighteternal/biodecision-tev1-4b

## Resumen

BioDecision-4B (identificador `lighteternal/biodecision-tev1-4b`) es un modelo de decision de tipo System-1 especializado en biomedicina, farmacologia y ensayos clinicos. Lo desarrolla el usuario lighteternal como fine-tuning del modelo base Qwen/Qwen3.5-4B, siguiendo la receta abierta Tev1 publicada por Together AI. Su funcion no es la generacion de texto libre, sino recibir una fuente (contexto), una pregunta y un conjunto de respuestas posibles, y devolver en una sola pasada forward una probabilidad calibrada para cada opcion.

El modelo cuenta con 4.659.865.088 parametros (unos 4,66 mil millones) y un repositorio de 18,7 GB en formato safetensors. Las respuestas son tipadas (Choice, Yes/No, Score) y se definen en la propia peticion, de modo que se pueden anadir nuevas tareas de decision sin reentrenar el modelo. Los datos de entrenamiento provienen de los datasets `lighteternal/biodecision-sft-v2.2` y `lighteternal/biodecision-sft-v2.2-patch`.

Su relevancia actual radica en el nicho que ocupa: frente a los modelos generativos que producen texto con posible alucinacion, este modelo emite una distribucion de probabilidad sobre opciones cerradas, lo que facilita su uso como juez, clasificador de evidencia o componente de deteccion de alucinaciones en pipelines clinicos. El autor declara un 70,2 % de acierto en 46.199 decisiones held-out procedentes de 28 benchmarks biomedicos, lo que supone +7,8 puntos sobre Qwen3.5-4B. La licencia es de solo investigacion, lo que restringe su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder fine-tuneado sobre Qwen/Qwen3.5-4B (tag de arquitectura: `qwen3_5`) |
| Parametros totales | 4.659.865.088 (unos 4,66 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors, 18,7 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` con `license_name: research-only` (solo investigacion) |
| Formato de pesos | Safetensors (libreria `transformers`) |

Otros datos: pipeline declarado `text-generation`; tarea asociada en los tags: `image-text-to-text`; datasets de entrenamiento: `lighteternal/biodecision-sft-v2.2` y `lighteternal/biodecision-sft-v2.2-patch`; descargas: 678; likes: 11; fecha de creacion: 2026-09-25; ultima actualizacion: 2026-09-25.

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del transformer decoder denso Qwen3.5-4B, con 4,66 mil millones de parametros. Hereda la arquitectura del modelo base y anade una cabeza de decision que devuelve, en una unica pasada forward, una distribucion de probabilidad calibrada sobre las opciones definidas en la peticion. Las opciones pueden ser de tipo Choice (etiquetas como A, B, C, D), Yes/No o Score, y se declaran en el propio prompt, por lo que la misma red sirve para tareas de decision distintas sin reentrenamiento. El modelo se inspira en la propuesta Jev recogida en la receta Tev1 de Together AI, cuyo repositorio incluye la receta de datos, un ejemplo de entrenamiento y los resultados guardados para replicar el proceso.

En cuanto al entrenamiento, la informacion disponible indica que se uso SFT sobre los datasets `lighteternal/biodecision-sft-v2.2` y `lighteternal/biodecision-sft-v2.2-patch`. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset, y no hay constancia de etapas de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. Nota relevante: los tags del repositorio incluyen `image-text-to-text`, pero la model card no describe ninguna capacidad de vision ni procesamiento de imagenes, por lo que ese tag debe tratarse con cautela.

## Capacidades

- Decision con opciones cerradas: recibe contexto, pregunta y entre 2 y 24 opciones (segun la receta Tev1) y devuelve la letra o etiqueta elegida.
- Salida probabilistica calibrada: emite una probabilidad por opcion en una sola pasada forward, lo que permite umbralizar, comparar alternativas o integrarlo como juez.
- Respuestas tipadas configurables: soporta decisiones de tipo Choice, Yes/No y Score definidas en la peticion.
- Question answering medico: MedQA (USMLE), MedMCQA, PubMedQA y subconjuntos medicos de MMLU.
- Clasificacion de evidencia cientifica: NLI4CT 2024, SciFact, PUBHEALTH y Evidence Inference 2.0.
- Deteccion de alucinaciones: evaluado en el subconjunto PubMedQA de HaluBench.
- Pronostico de resultados de ensayos clinicos: conjuntos CT Open Winter 2025 y Summer 2025 (prediccion de endpoint).
- Matching de pacientes a ensayos clinicos: evaluado en TREC Clinical Trials 2022 con NDCG@10.
- Farmacologia y farmacovigilancia: el ejemplo de la model card clasifica interacciones farmacologicas (mecanismo, efecto, recomendacion o ausencia de interaccion).
- Idiomas: unicamente ingles; no se declaran capacidades multilingues.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Uso como agente multi-paso: no disponible; el modelo esta disenado como decision de un solo paso (System-1).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Clasificacion de interacciones farmacologicas: dado un texto de ficha tecnica o literatura, determinar si describe un mecanismo farmacocinetico, un efecto farmacodinamico, una recomendacion o ninguna interaccion, devolviendo probabilidades por clase.
- Deteccion de alucinaciones en asistentes medicos: usar el modelo como verificador que decide si una afirmacion generada por otro LLM esta respaldada por la evidencia aportada (tarea evaluada en HaluBench, 87,91 % de accuracy).
- Clasificacion de evidencia cientifica en revisiones sistematicas: etiquetar pares de abstract y afirmacion segun su relacion de implicacion (NLI4CT, SciFact), con Macro-F1 de 85,38 en SciFact sobre etiqueta y evidencia gold.
- Pronostico de resultados de ensayos clinicos: estimar la probabilidad de exito de un endpoint a partir del protocolo o de los datos disponibles, apoyandose en los conjuntos CT Open Winter y Summer 2025.
- Matching de pacientes a ensayos clinicos: puntuar la adecuacion de un candidato a un protocolo concreto y ordenar resultados, tal como se evalua en TREC Clinical Trials 2022 (NDCG@10 de 0,8328).
- Triage de preguntas medicas en herramientas de soporte clinico: responder preguntas de opcion multiple de nivel USMLE o equivalente (71,01 % en MedQA) para tareas de formacion o pre-triage, siempre con supervision humana.
- Etiquetado a escala para curación de datasets biomedicos: aplicar el modelo como anotador automatico sobre corpus de literatura y farmacovigilancia, aprovechando que las opciones se definen en la peticion y no requieren reentrenamiento.
- Filtro de veracidad en contenidos de salud: clasificar afirmaciones sobre salud en cuatro niveles de veracidad (PUBHEALTH, Macro-F1 60,38) dentro de un pipeline de moderacion de contenidos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos con `verified: false`, es decir, no verificados de forma independiente).

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Medical QA | MedQA (USMLE, 4 opciones) | test | Accuracy | 71,01 |
| Medical QA | MedMCQA | dev | Accuracy | 62,76 |
| Medical QA | PubMedQA (PQA-L) | test | Accuracy | 76,60 |
| Medical QA | MMLU medical (6 asignaturas) | test | Accuracy | 77,73 |
| Medical QA | MedXpertQA Text | test | Accuracy | 18,22 |
| Medical QA | HEAD-QA (ingles) | test | Accuracy | 77,09 |
| Evidence classification | NLI4CT 2024 | test | Macro-F1 | 73,19 |
| Evidence classification | SciFact (label, gold evidence) | dev | Macro-F1 | 85,38 |
| Evidence classification | PUBHEALTH (veracidad 4 clases) | test | Macro-F1 | 60,38 |
| Evidence classification | Evidence Inference 2.0 | test | Macro-F1 | 70,56 |
| Hallucination detection | HaluBench (subconjunto PubMedQA) | test | Accuracy | 87,91 |
| Clinical trial outcome forecasting | CT Open Winter 2025 (Endpoint) | test | Macro-F1 | 72,57 |
| Clinical trial outcome forecasting | CT Open Summer 2025 (Endpoint) | test | Macro-F1 | 62,02 |
| Clinical trial matching | TREC Clinical Trials 2022 | test | NDCG@10 | 0,8328 |

Ademas, el autor declara un 70,2 % de acierto medio en 46.199 decisiones held-out procedentes de 28 benchmarks biomedicos, lo que representaria +7,8 puntos sobre Qwen3.5-4B y +7,3 sobre el modelo indicado como "To..." en la model card (el texto aparece truncado en la informacion disponible y no puede confirmarse el nombre completo). El modelo base Qwen3.5-4B tambien se evaluo con metrica de Macro-F1 en el conjunto CT_Open Summer 2025 con un valor de 62,02 (mismo dato del autor).

## Requisitos de hardware

Nota: el modelo no publica requisitos de hardware en la informacion disponible. Las cifras siguientes son estimaciones calculadas a partir del numero de parametros (4,66 mil millones) y no provienen del autor.

- VRAM en FP16/BF16: aproximadamente 9,3 GB solo para pesos, mas cache KV (desconocida al no publicarse la longitud de contexto).
- VRAM en INT8: aproximadamente 4,7 GB para pesos; en cuantizacion de 4 bits, alrededor de 2,5-3 GB.
- GPU profesionales: cabe holgadamente en una A100 40 GB, H100, L40S o A10G; varias instancias por GPU son viables salvo en A10G.
- GPU de consumo: si, es desplegable en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) e incluso en GPUs de 8-12 GB con cuantizacion de 4 bits, siempre que se genere el GGUF correspondiente (no publicado por el autor).
- Opciones de despliegue: `transformers` (libreria declarada) y servicios compatibles con endpoints; en la busqueda aparecen endpoints gestionados en Featherless AI y FriendliAI. vLLM, TGI, llama.cpp u Ollama son viables tecnicamente para esta familia de modelos, pero no estan documentados por el autor ni se ofrece formato GGUF.
- Latencia y throughput: no disponibles. Al tratarse de una decision de una sola pasada forward sobre opciones cerradas, la latencia es previsiblemente menor que la de un modelo generativo equivalente, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| BioDecision-4B (`lighteternal/biodecision-tev1-4b`) | 4,66 mil millones | no disponible | research-only | HuggingFace, endpoints en Featherless AI y FriendliAI | 70,2 % en 46.199 decisiones held-out de 28 benchmarks |
| Qwen3.5-4B (modelo base de Qwen) | ~4 mil millones (no confirmado en la informacion disponible) | no disponible | no disponible | HuggingFace | Referencia del autor: BioDecision-4B le supera en +7,8 puntos |
| tev1-4B-experimental (Together AI) | ~4 mil millones (no confirmado) | no disponible | no disponible (open-weight segun el repositorio) | Repositorio `togethercomputer/tev1` | Referencia del autor: BioDecision-4B le supera en +7,3 puntos |

No se dispone de datos de benchmarks propios de los modelos alternativos en la informacion proporcionada, por lo que la comparacion de rendimiento se limita a las diferencias relativas declaradas por el autor. Otras alternativas medicas de tamano similar (por ejemplo, modelos biomedicos de 4B) no estan cubiertas en la informacion disponible.

## Limitaciones y advertencias

- Licencia de solo investigacion (`research-only`): el uso comercial esta restringido; es imprescindible revisar los terminos completos antes de cualquier despliegue en produccion.
- Modelo de un solo paso (System-1): no esta disenado para razonamiento multi-paso, planificacion de agentes ni cadenas de pensamiento; forzarlo a esos usos puede degradar la calidad de la decision.
- Dominio cerrado: funciona con opciones cerradas definidas en la peticion; no es un generador de texto libre ni un asistente conversacional general.
- Idioma unico: solo ingles declarado; su uso en castellano no esta soportado y probablemente produzca decisiones poco fiables.
- Riesgo de alucinacion: aunque el autor lo posiciona como herramienta de deteccion de alucinaciones (87,91 % en HaluBench), sigue siendo un modelo probabilistico y sus decisiones requieren validacion, especialmente en contexto clinico.
- Rendimiento desigual: el propio autor reporta un 18,22 % en MedXpertQA Text, muy por debajo del resto de benchmarks, lo que indica poca robustez en preguntas medicas de alta dificultad o fuera de distribucion.
- Resultados no verificados: todos los valores del model-index tienen `verified: false` y proceden del propio autor; no hay evaluacion independiente.
- Discrepancia de modalidad: el tag `image-text-to-text` figura en el repositorio, pero no hay ninguna capacidad de vision documentada; conviene asumir que es solo texto hasta confirmacion.
- Contexto desconocido: al no publicarse la longitud de contexto, no es posible dimensionar el cache KV ni garantizar el tratamiento de documentos largos.
- Riesgo de sesgo: no se documentan analisis de sesgo ni la composicion del dataset de entrenamiento, lo que impide evaluar sesgos poblacionales, de genero o de origen etnico en decisiones clinicas.
- Caveat de produccion: al ser un modelo de decision, sus salidas deben acompanarse de umbrales de confianza y supervision humana en cualquier flujo con impacto clinico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lighteternal/biodecision-tev1-4b
- Demo (Space): https://huggingface.co/spaces/lighteternal/biodecision-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/lighteternal/biodecision-sft-v2.2
- Dataset de parche: https://huggingface.co/datasets/lighteternal/biodecision-sft-v2.2-patch
- Adaptador LoRA: https://huggingface.co/lighteternal/biodecision-tev1-4b-lora-v1.1
- Receta Tev1 (Together AI): https://github.com/togethercomputer/tev1
- Endpoint gestionado en Featherless AI: https://featherless.ai/models/lighteternal/biodecision-tev1-4b
- Endpoint gestionado en FriendliAI: https://friendli.ai/models/lighteternal/biodecision-tev1-4b
