# Salahuddin1234/omnidoctor-cure-med

## Resumen

CURE-MED-32B es un modelo de lenguaje de 32.000 millones de parametros especializado en razonamiento medico multilingue, desarrollado por Aikyam Lab (Eric Onyame, Akash Ghosh, Subhadip Baidya, Sriparna Saha, Xiuying Chen y Chirag Agarwal). Se obtiene por ajuste fino del modelo Qwen/Qwen2.5-32B-Instruct mediante un marco de aprendizaje por refuerzo guiado por curriculo, que combina ajuste supervisado (SFT) consciente del cambio de codigo (*code-switching*) y Group Relative Policy Optimization (GRPO). El objetivo declarado es mejorar simultaneamente la correccion logica y la estabilidad linguistica en consultas medicas abiertas.

El modelo forma parte de la familia CURE-MED, que incluye variantes de 1,5B, 3B, 7B, 14B y 32B derivadas de Qwen2.5-Instruct. Cubre 13 idiomas, con enfasis explicito en lenguas infrarrepresentadas como el amharico, el yoruba y el suajili, y se entrena y evalua con CUREMED-BENCH, un benchmark de razonamiento medico multilingue de respuesta abierta con una unica respuesta verificable.

Es relevante porque aborda dos problemas habituales en IA medica: la degradacion del razonamiento cuando la consulta mezcla idiomas o cambia de registro, y la falta de cobertura de lenguas de bajos recursos. La ficha que sigue se basa exclusivamente en la model card publicada y en los resultados de busqueda disponibles; los enlaces de la ficha de HuggingFace corresponden a una publicacion de terceros (usuario Salahuddin1234) que reproduce la model card de Aikyam Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-32B-Instruct); no se documentan componentes MoE, SSM ni hibridos |
| Parametros totales | 32.000 millones (32B), segun la model card |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-32B-Instruct admite hasta 131.072 tokens de contexto |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni bitsandbytes documentadas |
| Idiomas soportados | am (amharico), bn (bengali), fr (frances), ha (hausa), hi (hindi), ja (japones), ko (coreano), es (espanol), sw (suajili), th (tailandes), tr (turco), vi (vietnamita), yo (yoruba) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers), pipeline text-generation |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Tamano del repositorio | 4,3 GB (dato de la ficha del Hub; incoherente con un modelo de 32B, ver limitaciones) |
| Dataset de evaluacion | Aikyam-Lab/CUREMED-BENCH |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y sesgos de rotacion posicional (RoPE). Sobre esa base, el equipo aplica un procedimiento de entrenamiento en dos etapas descrito como *curriculum-informed reinforcement learning*: primero un ajuste supervisado consciente del cambio de codigo, y despues Group Relative Policy Optimization (GRPO), un algoritmo de optimizacion de politica relativa por grupos que no requiere un modelo critico separado. El entrenamiento busca mejorar de forma conjunta la correccion logica de la respuesta y la estabilidad del idioma de salida.

El componente curricular implica un ordenamiento progresivo de las tareas de entrenamiento, de menor a mayor dificultad, orientado a consultas medicas abiertas multilingues. La evaluacion se realiza con CUREMED-BENCH, descrito en la model card como un benchmark de razonamiento medico multilingue de respuesta abierta con respuestas unicas verificables. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases adicionales de RLHF o DPO mas alla del SFT y del GRPO citados.

## Capacidades

- Generacion de texto y razonamiento medico en respuesta abierta sobre consultas clinicas multilingues.
- Razonamiento en 13 idiomas, incluidos amharico, yoruba, suajili, hausa, bengali, hindi, tailandes, turco y vietnamita, ademas de frances, japones, coreano y espanol.
- Manejo de cambio de codigo (*code-switching*) dentro de una misma consulta, tratado de forma explicita durante el ajuste supervisado.
- Capacidad declarada de mantener la coherencia del idioma de respuesta (estabilidad linguistica).
- Etiqueta `reasoning` en el Hub, lo que indica enfasis en cadenas de razonamiento; no se documenta un modo de pensamiento explicito ni un token de razonamiento separado.
- Soporte de conversacion multi-turno heredado del formato instruct de Qwen2.5.
- No se documenta soporte de *tool calling* o *function calling* especifico del ajuste, ni capacidades de vision, audio o agentes multi-paso.

## Casos de uso

- Triage clinico multilingue: el modelo puede clasificar y priorizar sintomas descritos en cualquiera de los 13 idiomas soportados, usando su capacidad de razonamiento abierto para justificar la clasificacion y derivar al especialista adecuado.
- Asistencia a personal sanitario en regiones con diversidad linguistica: permite formular preguntas de historia clinica y obtener resumenes en el idioma local del paciente, sin depender de traduccion externa.
- Educacion medica y material formativo: generacion de explicaciones razonadas sobre fisiopatologia o farmacologia en lenguas de bajos recursos, donde la oferta de contenido tecnico es escasa.
- Apoyo a la documentacion clinica: conversion de notas o dialogos en texto estructurado y coherente, manteniendo el idioma de origen y evitando la mezcla de lenguas no deseada.
- Investigacion en equidad linguistica: uso como linea base de 32B para comparar contra variantes menores de la misma familia (1,5B, 3B, 7B, 14B) y medir el efecto del curriculo y del GRPO.
- Atencion al paciente informativa (no diagnostica): resumir informacion medica comprensible para el paciente en su idioma, con las salvaguardas y supervision humana correspondientes.
- Evaluacion comparativa de modelos medicos: al estar alineado con CUREMED-BENCH, sirve como referencia para reproducir o contrastar resultados en razonamiento medico multilingue.
- Preprocesado de consultas en sistemas de salud publica: normalizacion y clasificacion de consultas entrantes mezcladas en varios idiomas antes de encaminarlas a un especialista humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el benchmark CUREMED-BENCH y el articulo arXiv 2601.13262 como marco de evaluacion, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de las metricas propias del benchmark. No se aportan comparaciones numericas con Qwen2.5-32B-Instruct ni con las otras variantes de la familia CURE-MED.

| Benchmark | CURE-MED-32B | Modelo base Qwen2.5-32B-Instruct | Notas |
|---|---|---|---|
| CUREMED-BENCH | no disponible | no disponible | Benchmark citado, sin cifras publicadas en la informacion disponible |
| MMLU | no disponible | no disponible | Sin datos |
| GSM8K | no disponible | no disponible | Sin datos |
| HumanEval | no disponible | no disponible | Sin datos |

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en bf16/fp16: en torno a 64-70 GB solo para los pesos, mas el *KV cache* y las activaciones.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 34-40 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 18-22 GB, aunque el repositorio no publica pesos ya cuantizados.
- GPU recomendadas para precision completa o 8 bits: NVIDIA A100 80 GB, H100 80 GB, H200 o A6000 de 48 GB en configuraciones con *offloading*.
- GPU consumer: una RTX 4090 de 24 GB o una RTX 3090 de 24 GB no bastan en bf16; serian viables solo tras convertir a 4 bits con herramientas externas. Multiples GPU consumer (por ejemplo, 2 x 24 GB) tampoco cubren los pesos en bf16 sin cuantizar.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI para servicio de alto rendimiento, llama.cpp u Ollama solo si se genera previamente una conversion a GGUF, que no esta publicada.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni tiempos de primera respuesta.
- Nota critica: el tamano del repositorio (4,3 GB) es incompatible con pesos de 32B en precision de 16 bits (unos 64 GB). Antes de desplegar conviene verificar que el repositorio contiene realmente los pesos completos y no solo un subconjunto, un adaptador LoRA o una carga incompleta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| CURE-MED-32B | 32B | no disponible (base: 131.072 tokens) | 13 | apache-2.0 | Repositorio de terceros en el Hub | Ficha analizada; tamano de repo incoherente con 32B |
| Qwen/Qwen2.5-32B-Instruct | 32B | 131.072 tokens | multilingue amplio | apache-2.0 (segun modelo base) | Repositorio oficial de Qwen | Modelo base; sin ajuste medico especifico |
| Aikyam-Lab/CURE-MED-1.5B | 1,5B | no disponible | misma familia de 13 idiomas (segun su model card) | no disponible en la informacion recogida | Hub, cuenta Aikyam-Lab | Variante pequena de la misma familia; basada en Qwen1.5-1.5B-instruct segun la model card |
| OmniDoctor | no disponible | no disponible | no disponible | no disponible | Articulo ACM | Trabajo de aprendizaje continuo para tareas de VQA medica; no es un modelo comparable en parametros |

No se dispone de cifras de rendimiento que permitan una comparacion cuantitativa con alternativas medicas como Med42, Meditron o BioMistral, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ambito medico sin validacion clinica: no se documenta certificacion, revision por expertos ni ensayo clinico alguno. El modelo no debe usarse para diagnostico, prescripcion ni decision terapeutica sin supervision profesional.
- Riesgo de alucinacion: al ser un modelo generativo ajustado para respuesta abierta, puede producir referencias, dosis o diagnosticos plausibles pero incorrectos. El benchmark citado usa respuestas unicas verificables, lo que sugiere verificacion automatica, pero no elimina el riesgo en produccion.
- Incoherencia en el repositorio: el tamano declarado (4,3 GB) no corresponde a un modelo de 32B. Es imprescindible verificar la integridad de los pesos antes de cualquier uso.
- Procedencia dudosa de la publicacion: el identificador `Salahuddin1234/omnidoctor-cure-med` no coincide con la autoria declarada en la model card (Aikyam Lab). Se trata de una republicacion; conviene acudir a la cuenta oficial Aikyam-Lab para descargar los pesos.
- Fechas anomalas: la ficha indica creacion el 30 de septiembre de 2026 y el articulo asociado tiene identificador arXiv 2601.13262, correspondiente a enero de 2026. Estos datos no son verificables con la informacion disponible.
- Sin datos de sesgo: no se publica ninguna evaluacion de sesgos demograficos, geograficos ni de genero, un aspecto especialmente sensible en contexto clinico.
- Cobertura linguistica desigual: aunque se declaran 13 idiomas, no se aportan metricas por idioma, por lo que el rendimiento en amharico, yoruba o suajili puede ser sustancialmente inferior al de frances o espanol.
- Limitaciones de contexto no documentadas: la model card no especifica si el ajuste preserva la ventana completa de 131.072 tokens del modelo base ni si se aplico extension de contexto durante el entrenamiento.
- Ausencia de soporte documentado de *tool calling*: no hay evidencia de integracion con APIs, recuperacion aumentada o agentes en la documentacion disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; hay que tener en cuenta que la licencia del modelo base es tambien Apache 2.0, lo que facilita la redistribucion.
- Idioma de la documentacion: la model card esta en ingles y no incluye instrucciones de uso, formato de prompt ni ejemplos de inferencia.

## Enlaces

- Ficha de HuggingFace analizada: https://huggingface.co/Salahuddin1234/omnidoctor-cure-med
- Repositorio oficial del proyecto: https://github.com/AikyamLab/cure-med
- Articulo (arXiv): https://arxiv.org/abs/2601.13262
- Version HTML del articulo: https://arxiv.org/html/2601.13262v2
- Demo del proyecto: https://cure-med.github.io/
- Variante menor de la familia: https://huggingface.co/Aikyam-Lab/CURE-MED-1.5B
- Articulo OmniDoctor (ACM DL): https://dl.acm.org/doi/10.1145/3746027.3755745
- Perfil del publicador en GitHub: https://github.com/salahuddin1234
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
