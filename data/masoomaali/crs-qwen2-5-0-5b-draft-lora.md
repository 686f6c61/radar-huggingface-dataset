# MasoomaAli/crs-qwen2.5-0.5b-draft-lora

## Resumen

El modelo `MasoomaAli/crs-qwen2.5-0.5b-draft-lora` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. Lo desarrolla MasoomaAli en el contexto de un trabajo academico universitario de IA generativa, y su proposito es la evaluacion de criterios de elegibilidad en ensayos clinicos (eligibility screening). Dado un paciente descrito en una nota numerada, un tipo de criterio y un criterio concreto, el adaptador devuelve un JSON con una etiqueta de elegibilidad y los identificadores de las frases que sirven de evidencia.

Se trata de un adaptador de bajo rango (rank 32, alpha 64) que no modifica los pesos del modelo base, sino que anade matrices entrenables sobre las capas de atencion y proyeccion del transformer de Qwen2.5-0.5B. El modelo base es un transformer decoder-only de 0,5 mil millones de parametros con contexto nativo de 32.768 tokens (segun las especificaciones publicas de Qwen2.5). El adaptador fue entrenado sobre la particion de entrenamiento del dataset TrialGPT Criterion Annotations, con 602 filas procedentes de 37 pacientes.

La relevancia de esta ficha es principalmente documental y de evaluacion: se trata de un prototipo educativo con un rendimiento modesto en validacion (accuracy 0,7379, macro-F1 0,4461, evidence micro-F1 0,4910 sobre 8 pacientes y 206 filas) y con una advertencia explicita del autor de que no debe usarse para decisiones de reclutamiento clinico ni para atencion al paciente. Su interes tecnico radica en el uso de un modelo base muy pequeno para una tarea de extraccion estructurada con evidencia, y en la metodologia de entrenamiento LoRA con oversampling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens segun especificaciones publicas de Qwen) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion GGUF/AWQ/BnB, pero no se detalla en la model card) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA via PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre el modelo base Qwen2.5-0.5B-Instruct, un transformer decoder-only. La model card no especifica sobre que modulos exactos se aplican las matrices LoRA (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), por lo que ese detalle no esta disponible. El adaptador se distribuye como repositorio PEFT con pesos en safetensors.

El entrenamiento se realizo sobre la particion de entrenamiento del dataset TrialGPT Criterion Annotations (ncbi/TrialGPT-Criterion-Annotations), con 602 filas procedentes de 37 pacientes. La model card indica explicitamente que las salidas de GPT-4 presentes en ese dataset nunca se utilizaron. La configuracion de entrenamiento incluye oversampling con potencia 0,5, salida con la etiqueta en primer lugar (label first output) y mejor epoca 2. No se detalla en la informacion proporcionada si hubo RLHF, DPO ni el numero total de tokens de entrenamiento. La tarea esta formulada como generacion estructurada: el modelo debe producir un JSON con la etiqueta de elegibilidad y los IDs de frases de evidencia.

## Capacidades

- Generacion de JSON estructurado para la tarea de evaluacion de criterios de elegibilidad en ensayos clinicos.
- Clasificacion de elegibilidad a partir de una nota de paciente numerada, un tipo de criterio y un criterio.
- Extraccion de evidencia: devuelve los identificadores de las frases que sustentan la decision.
- Especializacion en el dominio de ensayos clinicos y criterios de inclusion/exclusion.
- Capacidades generales heredadas del modelo base Qwen2.5-0.5B-Instruct (generacion de texto e instrucciones), aunque el adaptador esta afinado para una unica tarea.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Prototipo educativo de screening de elegibilidad: el adaptador recibe una nota de paciente numerada y un criterio concreto y devuelve una etiqueta con evidencia, lo que permite demostrar en un aula como se estructura una tarea de extraccion con justificacion.
- Investigacion metodologica sobre LoRA en modelos pequenos: sirve como caso de estudio para analizar como un adaptador de rango 32 sobre un modelo de 0,5B se comporta en una tarea de clasificacion con evidencia, con metricas de validacion publicadas.
- Generacion de datasets sinteticos de entrenamiento: el modelo puede usarse para pre-etiquetar pares nota-criterio y que un revisor humano corrija las etiquetas, dado su caracter de "draft" (borrador).
- Evaluacion comparativa de tecnicas de oversampling: la configuracion con potencia 0,5 y label first output puede reproducirse y compararse con otras estrategias sobre el mismo split.
- Docencia en procesamiento de lenguaje natural clinico: permite ilustrar el pipeline completo (dataset TrialGPT, formateo de notas numeradas, salida JSON, metricas macro-F1 y evidence micro-F1) sin requerir hardware de gama alta.
- Pruebas de integracion de PEFT en pipelines de inferencia: el adaptador puede cargarse con la libreria `peft` sobre el modelo base para validar flujos de carga, merge y servicio en entornos de bajo coste.
- Analisis de errores en extraccion de evidencia: las metricas de evidence micro-F1 (0,4910) permiten estudiar donde falla el modelo al seleccionar frases de soporte, un caso practico para investigacion sobre atribucion.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion proporcionada son los de validacion sobre 8 pacientes y 206 filas:

| Metrica | Valor |
|---|---|
| Accuracy | 0,7379 |
| Macro-F1 | 0,4461 |
| Evidence micro-F1 | 0,4910 |

La model card indica que los resultados de test held-out estan en el repositorio, pero no se incluyen en la informacion proporcionada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en precision FP16 ocupa aproximadamente 1 GB de pesos; en cuantizacion de 4 bits, del orden de 0,3-0,5 GB. El adaptador LoRA anade una cantidad marginal (parametros del adaptador no disponibles).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `peft` + `transformers` para cargar el adaptador sobre el modelo base; llama.cpp u Ollama requeririan fusionar el adaptador en el modelo base y convertirlo a GGUF (no documentado en la model card); vLLM y TGI son viables tras el merge del adaptador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MasoomaAli/crs-qwen2.5-0.5b-draft-lora | 0,5B (base) + LoRA | no disponible (base: 32.768) | Screening de elegibilidad clinica | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Instrucciones generales | apache-2.0 | Hugging Face |
| Modelos especializados en TrialGPT | no disponible | no disponible | Screening de elegibilidad | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada. La comparativa con modelos especializados en la misma tarea (por ejemplo, variantes basadas en TrialGPT) no esta disponible.

## Limitaciones y advertencias

- El autor indica explicitamente que es un prototipo educativo de screening y no una decision de reclutamiento clinico; no debe usarse para atencion al paciente.
- Rendimiento modesto: macro-F1 de 0,4461 y evidence micro-F1 de 0,4910 en validacion, lo que refleja dificultades para clasificar correctamente todas las clases y para seleccionar la evidencia adecuada.
- Entrenado con solo 602 filas de 37 pacientes: alta probabilidad de sobreajuste y baja generalizacion a otras poblaciones o formatos de nota clinica.
- Riesgo de alucinacion en la generacion de JSON y de IDs de evidencia, especialmente con notas fuera de la distribucion de entrenamiento.
- Idiomas soportados no documentados; el dataset de origen es en ingles, por lo que el rendimiento en castellano es incierto.
- Licencia apache-2.0 permite uso comercial del adaptador, pero el uso clinico real queda desaconsejado por el propio autor y por las limitaciones de validacion.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, lo que limita la evidencia externa sobre su comportamiento.
- No se documentan sesgos demograficos ni evaluaciones de equidad; el dataset TrialGPT puede contener sesgos propios de las notas clinicas de origen.
- El repositorio tiene un tamano de 0,0 GB, coherente con un adaptador LoRA, pero no se detalla el numero exacto de parametros entrenables.

## Enlaces

- Hugging Face: https://huggingface.co/MasoomaAli/crs-qwen2.5-0.5b-draft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Codigo, split y uso: https://github.com/Masooma-Ali/PatientsDataScreener
