# sarakhosravi/MedGuard-Qwen3Guard-Gen-8B

## Resumen

MedGuard-Qwen3Guard-Gen-8B es un conjunto de adaptadores LoRA publicados por el usuario sarakhosravi sobre el modelo base Qwen/Qwen3Guard-Gen-8B, un modelo de 8.000 millones de parametros orientado a guardrails. El adaptador esta especializado en seguridad de medicacion condicionada por el paciente: recibe un perfil clinico estructurado y una prescripcion propuesta, y devuelve un veredicto seguro/no seguro acompanado de las 17 categorias de riesgo que lo justifican.

El modelo resuelve un problema concreto: la verificacion automatica de prescripciones frente a contraindicaciones, interacciones y reglas de seguridad farmacologica, con trazabilidad de la decision por categorias. Se entrena sobre el dataset MedGuardBench, tambien publicado por el autor, y el repositorio incluye tres brazos de entrenamiento distintos (SFT, Patient Profile Unrolling y Guided GRPO) con metricas reportadas sobre un split de test de 729 filas disjuntas por farmaco.

Es relevante ahora porque aplica tecnicas recientes de alineamiento con recompensas verificables (GRPO) a un dominio de alto riesgo como la seguridad de medicacion, y porque publica los checkpoints exactos que respaldan los resultados del paper asociado. La licencia es "other", lo que exige revisar los terminos antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3Guard-Gen-8B) con adaptadores LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; parametros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser PEFT, aplican las del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3Guard-Gen-8B, un transformer decoder-only de 8.000 millones de parametros, y se especializa mediante adaptadores LoRA entrenados con la libreria PEFT. El autor publica tres brazos de entrenamiento en subcarpetas independientes. El primero, `sft/`, es un ajuste supervisado alineado con el esquema de salida (veredicto mas 17 categorias de riesgo). El segundo, `cu/`, corresponde a Patient Profile Unrolling: un epoch adicional desde el checkpoint SFT en el que el modelo primero contrasta cada campo de la historia clinica del paciente contra las reglas de seguridad del farmaco y despues emite el veredicto. El tercero, `grpo/`, aplica GRPO con una recompensa de seguridad verificable y rollouts guiados por profesor, partiendo del modelo SFT fusionado.

El dataset de entrenamiento y evaluacion es MedGuardBench, con un split de test de 729 filas disjuntas por farmaco. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni detalles sobre el modelo profesor usado en los rollouts de GRPO.

## Capacidades

- Clasificacion de seguridad de prescripciones: emite un veredicto binario (seguro/no seguro) dada una prescripcion y un perfil de paciente estructurado.
- Etiquetado multi-categoria: identifica cuales de las 17 categorias de riesgo justifican el veredicto.
- Razonamiento verificable con traza: el brazo `cu/` genera una traza de verificacion campo a campo del historial clinico antes del veredicto (requiere al menos 2.048 tokens nuevos).
- Aprendizaje por refuerzo con recompensa verificable: el brazo `grpo/` optimiza directamente la seguridad medible, priorizando el recall de casos inseguros.
- Decodificacion determinista: el autor recomienda decodificacion greedy (temperatura 0).
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues en la informacion disponible.

## Casos de uso

- Verificacion previa a la prescripcion en sistemas de historia clinica electronica: el modelo recibe el perfil estructurado del paciente y la prescripcion propuesta, y devuelve un veredicto con las categorias de riesgo activadas, permitiendo al facultativo revisar los motivos concretos de la alerta.
- Filtrado de alertas en sistemas de soporte a la decision clinica: con un recall de casos inseguros del 96,6 % en el brazo `cu/`, puede usarse como primera capa de cribado para elevar a revision humana las prescripciones potencialmente peligrosas.
- Auditoria retrospectiva de prescripciones: procesar lotes de prescripciones historicas contra perfiles de paciente para detectar patrones de riesgo y alimentar programas de farmacovigilancia.
- Investigacion en guardrails medicos: los tres checkpoints permiten comparar estrategias de alineamiento (SFT, unrolling, GRPO) sobre la misma tarea y dataset, sirviendo de base para experimentos reproducibles.
- Generacion de datos sinteticos etiquetados: usar el brazo con mayor exact-match (`cu/`, 68,7 %) para preetiquetar pares prescripcion-perfil en la construccion de nuevos conjuntos de entrenamiento.
- Evaluacion de modelos de lenguaje en dominio clinico: MedGuardBench y estos adaptadores permiten medir la fiabilidad de modelos en tareas de seguridad de medicacion con categorias de error bien definidas.
- Prototipado de asistentes de prescripcion con trazabilidad: la traza de verificacion del brazo `cu/` facilita explicar al usuario por que una prescripcion se marca como insegura.

## Benchmarks y rendimiento

Metricas (%) sobre el split de test de 729 filas disjuntas por farmaco de MedGuardBench. Acc: exactitud del veredicto; Rec: recall de casos inseguros; FPR: tasa de falsos positivos sobre prescripciones seguras; Mic/Mac: F1 micro y macro sobre las 17 categorias; EM: exact match.

| Brazo | Acc | Rec | FPR | Mic | Mac | EM |
|---|---:|---:|---:|---:|---:|---:|
| SFT | 90,0 | 96,3 | 16,9 | 73,3 | 65,9 | 64,5 |
| CU (Patient Profile Unrolling) | 93,0 | 96,6 | 10,9 | 75,4 | 69,4 | 68,7 |
| Guided GRPO | 85,6 | 98,4 | 28,3 | 72,8 | 64,2 | 62,4 |

No se han publicado en la informacion disponible comparaciones con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B requiere aproximadamente 16 GB en FP16/BF16; con cuantizacion de 8 bits, en torno a 8-9 GB; con 4 bits, en torno a 5-6 GB (estimaciones estandar para un transformer de 8B, no verificadas en la model card).
- GPU recomendadas: A100 o H100 para BF16 sin cuantizar con contexto largo; RTX 4090 (24 GB) suficiente para BF16 de 8B.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizacion o en BF16 con margen limitado; en GPUs de 8-12 GB solo con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers con PEFT (metodo documentado por el autor); vLLM, TGI, llama.cpp u Ollama no estan documentados para estos adaptadores en la informacion disponible.
- Latencia y throughput: no disponibles. El brazo `cu/` requiere generar al menos 2.048 tokens nuevos por peticion, lo que incrementa la latencia frente a una salida directa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard-Qwen3Guard-Gen-8B | 8B (base) + LoRA | no disponible | Guardrail de seguridad de medicacion con 17 categorias | other | Hugging Face |
| Qwen/Qwen3Guard-Gen-8B | 8B | no disponible | Guardrail general del que deriva este adaptador | no disponible | Hugging Face |
| Alternativas especificas de guardrails medicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de guardrails medicos en la informacion proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigacion en guardrails de seguridad de medicacion. El autor declara explicitamente que no son dispositivos medicos y que no deben usarse para decisiones clinicas.
- Licencia "other": es imprescindible revisar los terminos completos antes de cualquier uso comercial o redistribucion, incluidos los del modelo base Qwen3Guard-Gen-8B.
- El brazo Guided GRPO presenta una tasa de falsos positivos del 28,3 % sobre prescripciones seguras, mas del doble que el brazo CU (10,9 %); su uso en produccion generaria un volumen elevado de alertas innecesarias.
- El brazo CU alcanza un FPR del 10,9 %, aun relevante en entornos con alto volumen de prescripciones seguras.
- El exact match sobre las 17 categorias es como maximo del 68,7 % (CU), lo que indica que la justificacion por categorias no es fiable en todos los casos.
- El adaptador `grpo/` requiere aplicar primero `sft/` y fusionarlo; una aplicacion incorrecta produce resultados invalidos.
- La evaluacion se limita a un unico split de test de 729 filas disjuntas por farmaco; no se documenta validacion externa ni comportamiento fuera de la distribucion del dataset.
- No se documentan sesgos conocidos, cobertura idiomatica ni riesgos de alucinacion especificos; dado que el modelo base es generativo, la traza de verificacion del brazo CU podria contener afirmaciones no respaldadas por el perfil del paciente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-Qwen3Guard-Gen-8B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-8B
