# occ-ai/OCC-RAG-2B

## Resumen

OCC-RAG-2B es un modelo de lenguaje de 2.213 millones de parametros desarrollado por occ-ai, afinado a partir de occ-ai/Qwen3.5-2B-Unloop. Esta especializado en respuesta fiel a preguntas sobre documentos recuperados (RAG): recibe una pregunta y un conjunto de pasajes y decide si las fuentes contienen evidencia suficiente para responder. Devuelve la respuesta en JSON con citas a los pasajes de soporte, o un estado explicito `UNANSWERABLE` cuando falta un dato necesario.

El modelo se presenta como parte de la familia Optimal Cognitive Core (OCC) y esta disenado para reducir el fallo tipico de los LLM en RAG: responder con conocimiento parametrico cuando el contexto no lo respalda. Segun el autor, con solo 2B de parametros supera en media a Qwen3.5-4B y Qwen3.5-9B en siete tareas de razonamiento multi-salto, QA financiero y fidelidad al contexto, y resulta competitivo con Qwen3.8-27B, un modelo mas de 13 veces mayor.

La relevancia practica esta en su eficiencia: genera una media de 468 tokens por respuesta en las siete tareas evaluadas, un 89% menos que Qwen3.5-2B en modo thinking (4.281 tokens), lo que abarata el coste de inferencia en pipelines RAG de produccion. La arquitectura declarada es `qwen3_5` segun los tags de Hugging Face, con pesos en safetensors, licencia Apache 2.0 e idiomas en y ru.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (tag `qwen3_5` en Hugging Face) |
| Parametros totales | 2.213.241.664 (2,21B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe variante GGUF publicada |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo parte de occ-ai/Qwen3.5-2B-Unloop, un fine-tune de la familia Qwen3.5, y se especializa mediante un ajuste adicional orientado a grounded QA. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; unicamente declara la relacion `finetune` con el modelo base y los tags `rag`, `grounded-qa` y `structured-output`.

La innovacion principal es el formato de salida: el modelo razona sobre las fuentes y emite JSON con respuesta corta, explicacion extendida e identificadores de los pasajes citados, ademas de un estado `UNANSWERABLE` cuando la evidencia es insuficiente. El autor destaca que esta entrenado para seguir los pasajes suministrados incluso cuando contradicen hechos aprendidos en el preentrenamiento, y que reduce drasticamente la verbosidad frente al modo thinking de su modelo base.

## Capacidades

- Generacion de texto y respuesta a preguntas fundamentada en documentos recuperados (grounded QA).
- Razonamiento multi-salto sobre multiples pasajes.
- QA financiero sobre tablas y textos (evaluado en TAT-QA y el subconjunto ConvFinQA de T²-RAGBench).
- Salida estructurada en JSON con respuesta, explicacion y citas a los pasajes de origen.
- Deteccion de evidencia insuficiente mediante el estado `UNANSWERABLE`.
- Fidelidad al contexto: prioriza los pasajes suministrados frente al conocimiento parametrico.
- Capacidades multilingues limitadas a ingles y ruso.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente sobre base documental: el modelo recibe los articulos de ayuda recuperados y la consulta del usuario, y devuelve una respuesta con citas verificables, lo que permite auditar cada afirmacion contra la fuente original.
- Asistente legal o normativo interno: dado un conjunto de fragmentos de contratos o normativa, responde con referencias a los pasajes concretos y marca `UNANSWERABLE` cuando la pregunta excede lo cubierto por los documentos.
- Analisis de informes financieros: su evaluacion en TAT-QA y ConvFinQA lo hace adecuado para responder preguntas sobre tablas y estados financieros suministrados como contexto, con trazabilidad de la fuente.
- Verificacion de hechos en pipelines editoriales: el modelo contrasta una afirmacion contra los pasajes recuperados y emite el veredicto con citas, reduciendo el riesgo de respuestas basadas en conocimiento parametrico desactualizado.
- Generacion de respuestas en buscadores corporativos: la salida JSON con IDs de fuente se integra directamente en la interfaz para enlazar cada fragmento de respuesta al documento original.
- Moderacion de contenido basada en politicas: los documentos de politica se pasan como contexto y el modelo cita la clausula aplicable, con estado `UNANSWERABLE` si la politica no cubre el caso.
- Reduccion de costes en produccion: con una media de 468 tokens por respuesta frente a los 4.281 del modo thinking de Qwen3.5-2B, abarata la inferencia en sistemas RAG de alto volumen.

## Benchmarks y rendimiento

Resultados publicados en la model card (siete tareas; se muestran las columnas con datos completos en la informacion disponible):

| Benchmark | OCC-RAG 2B | Qwen3.5 2B | Qwen3.5 4B | Qwen3.5 9B | Qwen3.8 27B |
|---|---|---|---|---|---|
| Media en siete tareas | supera a 4B y 9B (sin cifra) | no disponible | inferior a OCC-RAG 2B | inferior a OCC-RAG 2B | competitivo (sin cifra) |
| TAT-QA | primer puesto entre los comparados | no disponible | no disponible | no disponible | no disponible |
| ConvFinQA (T²-RAGBench) | primer puesto entre los comparados | no disponible | no disponible | no disponible | no disponible |
| ConFiQA (split single-hop) | primer puesto entre los comparados | no disponible | no disponible | no disponible | no disponible |
| Tokens por respuesta (media) | 468 | 4.281 (modo thinking) | no disponible | no disponible | no disponible |

La model card no incluye las puntuaciones numericas por benchmark en la informacion proporcionada; solo se declaran las posiciones relativas y el ahorro de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 6-8 GB en GPU.
- Cuantizacion a 8 bits: en torno a 2,2-2,5 GB de pesos; a 4 bits: en torno a 1,2-1,5 GB, segun la variante GGUF publicada.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16; en cuantizacion 4 bits cabe en GPUs de 4-6 GB.
- GPU de datacenter recomendadas para alto throughput: A100, H100, L40S.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp/Ollama y vLLM/TGI mediante la variante GGUF o los pesos safetensors; el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCC-RAG-2B | 2,21B | no disponible | RAG con citas y salida JSON | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen3.5-2B (base) | ~2B | no disponible | LLM generalista con modo thinking | no disponible en esta ficha | Hugging Face |
| Qwen3.5-4B | ~4B | no disponible | LLM generalista | no disponible en esta ficha | Hugging Face |
| Qwen3.5-9B | ~9B | no disponible | LLM generalista | no disponible en esta ficha | Hugging Face |
| Qwen3.8-27B | ~27B | no disponible | LLM generalista de mayor escala | no disponible en esta ficha | Hugging Face |

Segun el autor, OCC-RAG-2B supera en media a Qwen3.5-4B y Qwen3.5-9B en las siete tareas evaluadas y es competitivo con Qwen3.8-27B, con un coste de parametros muy inferior y menor verbosidad de salida.

## Limitaciones y advertencias

- Solo soporta ingles y ruso; no se declara soporte de castellano ni de otros idiomas.
- Su especializacion en grounded QA puede degradar el rendimiento en tareas generativas abiertas fuera del dominio RAG.
- Riesgo de alucinacion reducido por diseno, pero no eliminado: el estado `UNANSWERABLE` depende de que el modelo detecte correctamente la falta de evidencia.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La longitud de contexto no se especifica, lo que impide planificar con precision el tamano maximo del conjunto de pasajes recuperados.
- El modelo tiene un volumen de descargas muy bajo (15) y ninguna valoracion en Hugging Face; la validacion independiente es practicamente inexistente.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base Qwen3.5-2B-Unloop.
- La model card no detalla datos de entrenamiento, lo que limita la evaluacion de riesgos de contaminacion o sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/occ-ai/OCC-RAG-2B
- Variante GGUF: https://huggingface.co/occ-ai/OCC-RAG-2B-GGUF
- Modelo base: https://huggingface.co/occ-ai/Qwen3.5-2B-Unloop
- Repositorio GitHub: https://github.com/optimal-cognitive-core/OCC-RAG
- Informe tecnico: https://github.com/optimal-cognitive-core/OCC-RAG/blob/main/docs/OCC-RAG-technical-report.pdf
- Licencia: https://huggingface.co/occ-ai/OCC-RAG-2B/blob/main/LICENSE
