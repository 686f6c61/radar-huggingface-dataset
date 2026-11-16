# AbnerWu/N-Channel-Qwen3.5-0.8B-Med

## Resumen

N-Channel-Qwen3.5-0.8B-Med es un ajuste fino de Qwen/Qwen3.5-0.8B desarrollado por AbnerWu, especializado en una tarea muy concreta dentro del dominio biomédico: la normalización de entidades de tipo nombre de fármaco. El modelo recibe una pregunta de examen médico (enunciado y opciones) y detecta alias de cola larga, principalmente nombres comerciales de medicamentos, anotando el nombre genérico entre paréntesis junto al alias original, por ejemplo `lovenox` → `lovenox (Enoxaparin)`. No sustituye el texto: añade una glosa para que un lector posterior, en este caso el modelo Qwen3.5-9B, pueda interpretar correctamente el término.

El modelo forma parte del pipeline REP y constituye el despliegue aislado del llamado canal de nombres (N-Channel). Su función no es responder preguntas, sino preparar el enunciado antes de pasarlo al modelo lector. La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, ajustado a plena profundidad durante 2.000 pasos sobre datos médicos de nombres de fármacos. El paquete incluye pesos en bf16, tokenizador, un fichero `calibration.json` con el umbral de aceptación τ y un servidor HTTP basado en FastAPI.

La relevancia del modelo reside en su enfoque de control de riesgo: cada reescritura propuesta se puntúa con la probabilidad media por token del valor generado y solo se acepta si supera τ = 0,97, umbral calibrado con Learn-then-Test para acotar dos tipos de error (tasa de error por contexto y tasa de error a nivel de pregunta completa) con un nivel de confianza δ = 0,05. Está publicado con licencia Apache 2.0 y pensado para ejecutarse en una GPU de consumo con unos 3 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) + tokenizer |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, y se somete a un ajuste fino de todos los parámetros durante 2.000 pasos, con una tasa de aprendizaje de 2e-5 y 256 registros de nombres por paso. La tarea se formula como generación de una lista de reescrituras en JSON: dado un enunciado y cada una de sus opciones, el modelo emite las sustituciones propuestas junto con la forma canónica del nombre detectado. La puntuación de cada propuesta se calcula como la probabilidad media por token del valor de reescritura generado, y solo se aplican las que superan el umbral τ.

Los datos de entrenamiento provienen exclusivamente del conjunto med_v2 de REP: prospectos de DailyMed, pares de nombres comerciales y genéricos de RxNorm y DailyMed, corpus de libros de texto y los enunciados de los conjuntos de entrenamiento MedQA y MedMCQA tras deduplicación. No se empleó la tabla de correspondencias de RABBITS y las preguntas de RABBITS tampoco forman parte del entrenamiento. Se aplicó aumentación de mayúsculas y minúsculas sobre 98.567 registros con nombre comercial (26,6 % en minúsculas, 9,7 % en mayúsculas, con etiquetas sincronizadas) y se añadieron 43.755 registros nuevos a nivel de opción o campo corto (10.635 positivos y 33.120 negativos) construidos sustituyendo términos de MedQA/MedMCQA con la tabla de nombres de DailyMed y RxNorm. Los negativos enseñan al modelo a no anotar palabras comunes, errores ortográficos ni fármacos relacionados. El umbral τ = 0,97 se calibró con Learn-then-Test sobre 101 puntos de rejilla con corrección de Bonferroni, repartiendo δ = 0,05 entre los dos riesgos controlados.

## Capacidades

- Detección y anotación de nombres comerciales de fármacos de cola larga en textos médicos en inglés, con la forma genérica entre paréntesis.
- Normalización de entidades a nivel de enunciado, opción y campo corto, con devolución de posiciones de carácter (`start`/`end`) de cada alias detectado.
- Generación de listas de reescrituras en formato JSON estructurado, aptas para consumo programático.
- Puntuación de confianza por reescritura basada en la probabilidad media por token, con umbral de aceptación configurable (τ).
- Salida con metadatos completos por edición: campo, superficie, ocurrencia, forma canónica, posición y puntuación.
- Manejo de variaciones de capitalización de los nombres comerciales (minúsculas, mayúsculas, forma original) gracias a la aumentación de entrenamiento.
- Capacidad negativa entrenada: no anotar palabras comunes, errores ortográficos ni fármacos relacionados que no sean alias reales.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; su alcance es estrictamente la anotación de nombres de fármacos.

## Casos de uso

- Preprocesado de exámenes médicos para modelos lectores: el modelo anota los nombres comerciales de las preguntas de MedQA/MedMCQA antes de pasarlas a un modelo mayor (Qwen3.5-9B), de modo que el lector no falle por desconocer el alias. El control de riesgo a nivel de pregunta (R2 ≤ 4,8 %) hace viable esta integración en pipelines automáticos.
- Normalización de historiales clínicos y notas de medicación: dado un texto libre con nombres comerciales, el modelo devuelve las formas genéricas correspondientes con posiciones de carácter, lo que facilita la codificación posterior contra RxNorm o SNOMED.
- Enriquecimiento de bases de datos farmacológicas: procesamiento por lotes de campos cortos (nombre de fármaco, indicación, posología) para añadir la forma canónica junto al alias original sin destruir el texto fuente.
- Construcción de conjuntos de datos de entrenamiento: la salida JSON con `edits`, posiciones y puntuaciones permite generar pares alias-genérico etiquetados y filtrar por confianza para crear corpus de normalización de alta precisión.
- Servicio HTTP de anotación en producción: el paquete incluye `serve.py` con endpoints `/health` y `/v1/annotate`, desplegable con Docker sobre una GPU de unos 3 GB de VRAM, adecuado para integrarse como microservicio previo a un modelo lector.
- Auditoría de terminología en documentación regulatoria: detección de nombres comerciales en prospectos y fichas técnicas para verificar que se acompañan del nombre genérico, con umbral τ ajustable (ε = 0,10 → τ = 0,92) según la tolerancia al error.
- Análisis de literatura biomédica: anotación de alias de fármacos en resúmenes y artículos para mejorar la recuperación de información y la desambiguación de entidades en motores de búsqueda especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta las métricas de calibración del umbral τ = 0,97:

| Riesgo | Datos de calibración | Resultado con τ = 0,97 | Cota superior |
|---|---|---|---|
| R1: tasa de error por contexto individual | Conjunto médico de calibración con aumentación de mayúsculas, un contexto por grupo de entidades | 7 errores en 850 contextos reescritos | 2,5 % |
| R2: tasa de error a nivel de pregunta completa | 1.200 preguntas reservadas de MedQA/MedMCQA (577 originales, 623 con sustitución por nombre comercial) | 11 errores en 575 preguntas anotadas | 4,8 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB según la model card (pesos en bf16).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 3 GB de VRAM; el Dockerfile incluido está preparado para CUDA 12.9.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, RTX 3050, RTX 4060, RTX 4090); también en A100 y H100 con holgura.
- Opciones de despliegue: servicio HTTP propio con FastAPI (`serve.py`), contenedor Docker con `--gpus all`, o llamada directa en Python mediante `NChannel.load(...).annotate_questions(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno: Python 3.12, torch 2.13 con CUDA 12.9 según `requirements.txt`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| N-Channel-Qwen3.5-0.8B-Med | 0,8 mil millones | no disponible | Normalización de nombres de fármacos (anotación entre paréntesis) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.5-0.8B (base) | 0,8 mil millones | no disponible | Modelo generalista | no disponible en la información | Hugging Face |
| Qwen3.5-9B (lector del pipeline REP) | 9 mil millones | no disponible | Respuesta a preguntas médicas | no disponible en la información | Uso interno del pipeline REP |

No se dispone de información sobre otros modelos especializados en normalización de nombres de fármacos con los que establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Cobertura restringida al dominio médico y al inglés: solo detecta nombres comerciales de fármacos y sus formas genéricas; no está entrenado para otros idiomas ni para otras categorías de entidades.
- Falsos positivos documentados: puede anotar como nombre comercial errores ortográficos de nombres genéricos (por ejemplo, `Leviteracetam`) o palabras comunes (`Baygon`), y puede asignar una forma genérica incorrecta a nombres comerciales no vistos durante el entrenamiento. El umbral τ acota la proporción de estos errores, pero no los elimina.
- Anotación de nombres comerciales reales ya presentes en el texto (por ejemplo, `Tylenol`, `Prozac`): es una normalización correcta, pero bajo el criterio de RABBITS no cuenta como anotación "necesaria", lo que puede inflar la tasa de anotaciones si se evalúa con esa métrica.
- El umbral τ = 0,97 está calibrado para un nivel de confianza δ = 0,05 y dos riesgos con cotas del 2,5 % y el 4,8 %; cambiar el umbral o el dominio de aplicación invalida esas garantías.
- Riesgo de alucinación en la forma canónica: el modelo puede generar un nombre genérico plausible pero incorrecto para alias desconocidos; conviene validar contra una tabla de referencia en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que deben verificarse antes de un despliegue comercial.
- Sin datos de benchmarks de calidad de anotación más allá de las métricas de calibración; no hay evidencia publicada sobre rendimiento en dominios distintos de MedQA/MedMCQA y DailyMed/RxNorm.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbnerWu/N-Channel-Qwen3.5-0.8B-Med
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- DailyMed (fuente de prospectos y nombres comerciales): https://dailymed.nlm.nih.gov/
- RxNorm (fuente de correspondencias genérico-comercial): https://www.nlm.nih.gov/research/umls/rxnorm/
- MedQA (conjunto de evaluación y entrenamiento): https://github.com/jind11/MedQA
- MedMCQA (conjunto de evaluación y entrenamiento): https://medmcqa.github.io/
- RABBITS (referencia de evaluación de anotaciones, no usada en entrenamiento): no disponible en la información proporcionada
