# ar3xop/arcane-7b

## Resumen

Arcane-7B es un modelo de lenguaje ajustado por instrucciones, desarrollado por el usuario ar3xop, especializado en el análisis interpretable de salud mental y crisis. Su objetivo es evaluar publicaciones en redes sociales, mensajes de chat y registros de usuarios en ocho tareas clínicas, generando tanto clasificaciones como razonamientos explicativos auditable por humanos. Se basa en la arquitectura LLaMA-2-7B y emplea el ajuste por instrucciones IMHI, derivado de la investigación MentalLLaMA de Kailai Yang et al. (WWW 2024 / EMNLP 2023).

El modelo aborda un problema relevante: la falta de transparencia en los sistemas de detección automática de problemas de salud mental. A diferencia de clasificadores de caja negra, Arcane-7B produce justificaciones textuales junto a cada predicción, lo que facilita la auditoría y la confianza en entornos sensibles. Con 6,7 mil millones de parámetros, es un modelo de tamaño medio que puede desplegarse en hardware de gama alta de consumo, aunque su adopción actual es nula (cero descargas) y no cuenta con validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA-2-7B (transformer decoder) |
| Parametros totales | 6.738.415.616 (6,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | llama2 (LLaMA-2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arcane-7B parte del modelo base LLaMA-2-7B y se somete a un ajuste por instrucciones denominado IMHI (Interpretable Mental Health Instruction tuning), desarrollado en el marco del proyecto MentalLLaMA. No se especifican en la documentación disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de refuerzo como RLHF o DPO. La innovación principal reside en la generación de razonamiento interpretable: el modelo no solo emite una etiqueta de clasificación, sino que produce una explicación textual detallada que justifica la decisión, lo que permite a profesionales y usuarios auditar el resultado.

El entrenamiento cubre ocho tareas de salud mental: detección de depresión, identificación de causa de estrés, cribado de riesgo de suicidio, análisis de soledad, clasificación de trastornos mentales (bipolar, ansiedad, PTSD) y factores de riesgo interpersonales. No se detalla si el ajuste se realizó sobre todo el modelo o mediante técnicas de adaptación parcial.

## Capacidades

- Deteccion de depresion en textos de redes sociales, chats y check-ins.
- Identificacion de la causa de estres expresada en una publicacion o mensaje.
- Cribado de riesgo de suicidio, con clasificacion de nivel de urgencia.
- Analisis de soledad y aislamiento social a partir de contenido textual.
- Clasificacion de trastornos mentales especificos: trastorno bipolar, ansiedad y trastorno de estres postraumatico (PTSD).
- Evaluacion de factores de riesgo interpersonales (conflictos, relaciones, apoyo social).
- Generacion de razonamiento interpretable: explicaciones textuales junto a cada prediccion.
- Generacion de texto en ingles, con formato de instruccion y respuesta.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo puede analizar publicaciones en tiempo real para detectar indicios de depresion o riesgo de suicidio, generando alertas con una explicacion que permita a los moderadores priorizar intervenciones.
- Plataformas de apoyo emocional por chat: integrado en sistemas de mensajeria, puede clasificar el estado emocional del usuario y derivar a recursos humanos o profesionales, mostrando el razonamiento detras de cada derivacion.
- Triaje en servicios de salud mental: profesionales clinicos pueden introducir transcripciones de sesiones o mensajes de pacientes para obtener una clasificacion preliminar de trastornos (bipolar, ansiedad, PTSD) con justificaciones revisables.
- Aplicaciones de bienestar con check-ins diarios: el modelo analiza las respuestas de los usuarios a preguntas sobre su estado de animo y detecta patrones de estres o soledad, ofreciendo recomendaciones personalizadas.
- Investigacion en NLP interpretable: sirve como base para estudios sobre explicabilidad en modelos de lenguaje aplicados a dominios sensibles, gracias a su capacidad de generar racionales auditable.
- Sistemas de alerta temprana en entornos clinicos: monitoriza comunicaciones de pacientes en programas de seguimiento, identificando cambios en factores de riesgo interpersonales y generando avisos justificados para el equipo medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, ni metricas clinicas especificas como F1 en deteccion de depresion). Tampoco se encontraron evaluaciones independientes en la busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para los pesos, mas overhead de atencion y generacion, por lo que se recomienda un minimo de 16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), o GPUs de datacenter similares. En consumer, una RTX 4080 (16 GB) podria funcionar con cuantizacion, pero no se ofrecen versiones cuantizadas en el repositorio.
- Si se convierte a GGUF (por ejemplo, con llama.cpp), podria ejecutarse en GPUs de 8-12 GB con cuantizacion de 4-8 bits, aunque no se proporcionan dichos archivos.
- Opciones de despliegue: transformers (con el codigo de ejemplo de la model card), vLLM, llama.cpp, Ollama (si se genera un GGUF), o TGI.
- Latencia y throughput: no disponible. Como referencia, un modelo de 7B en una RTX 4090 suele generar entre 30 y 60 tokens por segundo en fp16, pero no hay datos especificos para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas. El modelo mas directamente comparable es MentalLLaMA (base de este trabajo), pero no se han publicado especificaciones ni benchmarks en la documentacion de Arcane-7B. Otros modelos de salud mental como ClinicalBERT o BioBERT no son comparables por su tamano y enfoque (encoders, no generativos). Se recomienda consultar la literatura de MentalLLaMA para una referencia cualitativa.

## Limitaciones y advertencias

- Sesgos: entrenado principalmente en ingles, puede presentar sesgos hacia poblaciones o dialectos no representados en los datos de entrenamiento.
- Riesgo de alucinacion: como todo LLM, puede generar explicaciones plausibles pero incorrectas, lo que es especialmente peligroso en contextos clinicos.
- Limitaciones de contexto: la longitud de contexto no se especifica; si hereda la de LLaMA-2, seria de 4096 tokens, insuficiente para analisis de documentos largos.
- Restricciones de licencia: la licencia llama2 impone restricciones de uso comercial para empresas con mas de 700 millones de usuarios mensuales, y requiere aceptacion de los terminos de Meta.
- No validado clinicamente: el modelo no ha sido aprobado para uso diagnostico ni terapeutico; debe considerarse una herramienta de investigacion o apoyo, nunca un sustituto de profesionales de salud mental.
- Sin adopcion ni verificacion: el repositorio tiene cero descargas y cero likes, y no se han encontrado evaluaciones independientes; su fiabilidad no esta contrastada.
- Fecha de creacion futura: el modelo fue creado el 1 de septiembre de 2026, lo que sugiere que podria ser un artefacto experimental o una publicacion reciente no revisada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ar3xop/arcane-7b
- Referencia de la investigacion base: MentalLLaMA / IMHI por Kailai Yang et al. (WWW 2024 / EMNLP 2023) - no se proporcionan URLs directas en la documentacion.
- No se encontraron otros enlaces relevantes en la busqueda web (los resultados sobre "Arcee" corresponden a otra organizacion y no estan relacionados con este modelo).
