# haruaki-lab/qwen3.5-0.8b-rag-q2-generator

## Resumen

Qwen3.5-0.8B Two-Pass Retrieval Query Generator es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por haruaki-lab en el contexto del curso "llm-course-final-2026". No es un modelo de propósito general: es un componente especializado dentro de un pipeline de generación aumentada por recuperación (RAG) multi-salto en japonés. Su función concreta es, dada una pregunta en japonés y los cuatro fragmentos recuperados en la primera pasada (Pass-1), decidir si esa evidencia es suficiente y, en caso contrario, emitir una consulta de búsqueda dirigida para una segunda pasada (Pass-2) que recupere los documentos del salto que falta.

El modelo resuelve un problema clásico de los sistemas RAG multi-salto: la recuperación de una sola pasada suele fallar cuando la respuesta requiere encadenar evidencia de varios artículos. En lugar de lanzar siempre una segunda búsqueda (lo que dispara el coste y el ruido), este generador actúa de forma selectiva: devuelve la cadena `NONE` cuando Pass-1 ya contiene la evidencia necesaria y solo emite una consulta nueva cuando detecta un hueco. El repositorio incluye además un bundle de ranking (`phase3_ltr_bundle.pkl`) con un ranker de doble pasada basado en regresión logística y LightGBM.

Con 752.393.024 parámetros reales (etiquetado como 0.8B), un tamaño de repositorio de 3,1 GB y licencia Apache-2.0, es un modelo pequeño y desplegable en hardware modesto, pero con un alcance funcional muy acotado: entrenado exclusivamente para japonés y para la tarea de generación de consultas de recuperación. No debe evaluarse como un LLM conversacional generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo publica safetensors sin cuantizar; el sufijo "q2" del nombre no está documentado como cuantización) |
| Idiomas soportados | Japonés (`ja`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), un transformer decoder-only de la familia Qwen3.5. Sobre esa base se aplicó un ajuste fino con LoRA de rango `r=16`, `lora_alpha=32` y `target_modules="all-linear"`, durante 1 época, con fusión posterior de los adaptadores en los pesos base en el checkpoint de mejor pérdida de validación sobre el objetivo (`val_target_loss=0.10441`, paso 1410).

Los datos de entrenamiento son 11.278 ejemplos de entrenamiento y 980 de validación, construidos con separación estricta (cero solapamiento de artículos y fragmentos) a partir de QA sintético multi-salto y mono-salto sobre el corpus de Wikipedia japonesa distribuido del curso (`bumbuboon/llm-course-final-2026`, derivado de Wikipedia japonesa bajo CC BY-SA 4.0). El pool de QA sintético se generó con modelos Qwen3.5-0.8B de la fase 0, entrenados a su vez con JaQuAD (CC BY-SA 3.0). No se documenta en la información disponible el uso de RLHF, DPO ni datos de preferencias.

La innovación técnica no está en la arquitectura sino en el diseño de la tarea: el modelo aprende una política de recuperación selectiva de dos pasadas (devolver `NONE` o una consulta Pass-2 dirigida), complementada por un ranker de doble pasada empaquetado en `phase3_ltr_bundle.pkl` (LogReg + LightGBM). No se dispone de detalles sobre mecanismos de atención, decodificación especulativa ni otras optimizaciones internas.

## Capacidades

- Generación de consultas de recuperación dirigidas para una segunda pasada en pipelines RAG multi-salto.
- Clasificación de suficiencia de evidencia: emite `NONE` cuando los cuatro fragmentos de Pass-1 ya contienen la evidencia necesaria.
- Procesamiento de preguntas y fragmentos en japonés exclusivamente.
- Integración como componente dentro de un sistema RAG más amplio, no como modelo de respuesta final.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible; el modelo ejecuta un paso fijo de la política de recuperación.
- Capacidades multilingües: no; solo japonés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Recuperación selectiva en RAG multi-salto: el modelo recibe la pregunta y los cuatro fragmentos de Pass-1 y decide si lanzar una segunda búsqueda, reduciendo el número de recuperaciones innecesarias frente a una política de dos pasadas siempre activa.
- Sistemas de pregunta-respuesta sobre Wikipedia japonesa: encaja en pipelines que necesitan encadenar evidencia de varios artículos, ya que su entrenamiento se construyó precisamente sobre ese corpus con separación estricta de artículos.
- Reducción de coste en pipelines RAG de producción: al devolver `NONE` cuando la evidencia es suficiente, evita llamadas adicionales al retriever y al generador final en los casos que ya están cubiertos.
- Enrutamiento de consultas hacia un ranker de doble pasada: combinado con `phase3_ltr_bundle.pkl`, permite puntuar y ordenar los documentos recuperados en ambas pasadas dentro de un mismo sistema.
- Asistencia a buscadores internos en japonés: puede generar consultas de seguimiento dirigidas cuando la primera búsqueda devuelve fragmentos parcialmente relevantes pero incompletos.
- Componente de evaluación de pipelines RAG: sirve como módulo de referencia para medir si una política de recuperación selectiva mejora frente a una recuperación de una sola pasada en conjuntos de QA multi-salto en japonés.
- Prototipado en hardware limitado: con 752 millones de parámetros y pesos safetensors, es viable para experimentación en una sola GPU de consumo, aunque no se dispone de cifras de VRAM ni latencia publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación sobre el objetivo (`val_target_loss=0.10441` en el paso 1410) y los tamaños de los conjuntos de entrenamiento y validación (11.278 / 980 ejemplos). No hay datos de MMLU, HumanEval, GSM8K ni métricas de recuperación (recall, MRR, nDCG) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 752 millones de parámetros en fp16 requiere del orden de 1,5 GB solo para pesos, más memoria para el contexto y el runtime; no se confirma ninguna cifra oficial.
- GPU recomendadas: no disponibles. Por tamaño, el modelo es compatible con GPU de consumo, pero no se documenta ninguna recomendación del autor.
- Cabe en GPU de consumo: previsiblemente sí por número de parámetros, pero no se confirma en la información disponible.
- Opciones de despliegue: transformers (librería declarada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| haruaki-lab/qwen3.5-0.8b-rag-q2-generator | 752.393.024 | No disponible | Japonés | Apache-2.0 | Generador de consultas RAG selectivo de dos pasadas |
| Qwen/Qwen3.5-0.8B (base) | No disponible en la información | No disponible | No disponible | Apache-2.0 | LLM de propósito general |
| Alternativas especializadas en RAG multi-salto | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (generadores de consultas de recuperación multi-salto en japonés) ni de datos de rendimiento que permitan una comparación cuantitativa con el modelo base.

## Limitaciones y advertencias

- Alcance funcional muy restringido: no es un modelo conversacional ni de respuesta; solo genera consultas de recuperación o la cadena `NONE`.
- Idioma único: entrenado y evaluado solo en japonés; su comportamiento fuera de ese idioma no está documentado.
- Longitud de contexto desconocida: no se especifica la ventana máxima, lo que impide garantizar el comportamiento con preguntas o fragmentos largos.
- Riesgo de alucinación en las consultas generadas: al ser un modelo generativo pequeño, puede producir consultas Pass-2 poco informativas o mal dirigidas; no se documentan métricas de calidad de recuperación.
- Dependencia del pipeline: su utilidad depende del retriever, del formato exacto de los fragmentos de Pass-1 y del ranker incluido; no se documentan instrucciones de integración más allá de la descripción de la tarea.
- Datos de entrenamiento sintéticos: el pool de QA se generó con modelos de la fase 0, por lo que los sesgos y errores de esos modelos pueden propagarse al generador de consultas.
- Licencia: Apache-2.0 permite uso comercial, pero los datos derivados de Wikipedia japonesa están bajo CC BY-SA 4.0 y JaQuAD bajo CC BY-SA 3.0; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuyen derivados de esos corpus.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 17 de noviembre de 2026; sin evidencia de uso en producción.
- El sufijo "q2" del nombre no está documentado; no debe interpretarse como una cuantización de 2 bits sin confirmación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haruaki-lab/qwen3.5-0.8b-rag-q2-generator
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Corpus del curso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
