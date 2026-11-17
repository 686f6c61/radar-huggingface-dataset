# demimomi/llm-course2-2026-e13-qwen3-5-0-8b

## Resumen

E13 Qwen3.5-0.8B es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B (Apache-2.0), publicado por el usuario demimomi en Hugging Face. Se trata de un checkpoint piloto orientado a una tarea muy concreta: respuesta corta en japones con identificadores de cita, en un contexto de generacion aumentada por recuperacion (RAG) sobre fragmentos de Wikipedia en japones. El adaptador LoRA se ha plegado (folded) en los tensores originales y el modelo exportado conserva la configuracion, los ficheros de procesador y la estructura de pesos del modelo upstream.

El modelo cuenta con 873.438.784 parametros (aproximadamente 0,87 mil millones) en formato safetensors, con un repositorio de 1,8 GB. La supervision proviene del conjunto JEMHopQA v1.2 (split de entrenamiento), desarrollado por RIKEN bajo licencia CC BY-SA 4.0, y el texto recuperado son fragmentos de Wikipedia japonesa proporcionados por el organizador del curso en el dataset bumbuboon/llm-course-final-2026.

Su relevancia es acotada: no es un modelo de proposito general, sino un artefacto de evaluacion disenado para compararse localmente con otro checkpoint (E05) sobre el benchmark JEMHopQA. Resulta util como referencia de como se comporta un ajuste LoRA de bajo coste en un modelo sub-1B para una tarea de QA con citas en japones, pero no esta pensado para despliegue en produccion ni para usos fuera de ese dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (entrenamiento del adaptador); el modelo base Qwen3.5 es multilingue, pero no se detalla la cobertura final |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. Sobre esa base se aplico un ajuste LoRA que afecta a los ultimos 8 bloques MLP de las capas de texto, adaptados especificamente para respuestas cortas en japones con identificadores de cita. El adaptador se ha plegado en los tensores con nombre originales, de modo que el checkpoint exportado mantiene la configuracion, los ficheros de procesador y la estructura de pesos del modelo upstream, sin capas adicionales ni cambios de interfaz.

La supervision procede del split de entrenamiento de JEMHopQA v1.2 (RIKEN, CC BY-SA 4.0), un conjunto de QA multi-hop en japones. El contexto de recuperacion son fragmentos de Wikipedia japonesa facilitados por el organizador del curso, con atribuciones y versiones registradas en el fichero data/ATTRIBUTION.jsonl del dataset bumbuboon/llm-course-final-2026. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO; el autor solo indica que el checkpoint esta preparado para comparacion local con E05 sobre JEMHopQA.

## Capacidades

- Generacion de respuestas cortas en japones fundamentadas en texto recuperado (RAG).
- Emision de identificadores de cita asociados a los fragmentos de contexto proporcionados.
- QA multi-hop sobre Wikipedia japonesa, segun el dominio de JEMHopQA.
- Herencia de las capacidades del modelo base Qwen3.5-0.8B (generacion de texto general), aunque el ajuste esta especializado y puede degradar el comportamiento fuera de dominio.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste se limita a respuesta corta con cita.
- Capacidades multilingues: el adaptador esta entrenado para japones; no se documenta el resto de idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Evaluacion comparativa de checkpoints: el modelo sirve para medir, junto a E05, el efecto de un ajuste LoRA de 8 bloques MLP sobre JEMHopQA, en un entorno local reproducible.
- QA con citas sobre documentacion japonesa: integrado en un pipeline RAG que recupere fragmentos de Wikipedia o documentacion interna en japones y devuelva respuestas cortas con el ID del fragmento fuente.
- Prototipado de asistentes documentales en japones: al ser un modelo sub-1B, permite iterar rapidamente en local sobre flujos de pregunta-respuesta con atribucion antes de escalar a modelos mayores.
- Experimentos academicos de atribucion de fuentes: util para estudiar como un modelo pequeno aprende a asociar respuestas con identificadores de cita en contextos multi-hop.
- Docencia y cursos de LLM: el checkpoint esta disenado como artefacto de un curso (llm-course2-2026), por lo que encaja en ejercicios de fine-tuning, evaluacion y comparacion de adaptadores.
- Filtrado y verificacion de respuestas: en un sistema mayor, puede usarse como verificador ligero que comprueba si una respuesta corta esta respaldada por un fragmento citado, dado su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el checkpoint esta preparado para comparacion local con E05 sobre JEMHopQA, pero no se incluyen metricas numericas en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parametros, en fp16 requiere aproximadamente 1,7-1,8 GB de pesos; en int8, alrededor de 0,9 GB; en int4, en torno a 0,5 GB. A ello hay que sumar la memoria del contexto y del runtime (KV cache), no cuantificada en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder cargar el modelo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A100 o H100 no son necesarias dado el tamano, pero permitirian mayor batching.
- Cabe en GPU consumer: si, en la mayoria de GPU con 4-8 GB de VRAM en cuantizaciones de 8 o 4 bits, y en fp16 en GPUs de 8 GB o mas.
- Opciones de despliegue: al publicarse solo en safetensors con la configuracion upstream, es compatible con runtimes que carguen transformers (vLLM, TGI, transformers + accelerate). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E13 Qwen3.5-0.8B (este) | 873 M | no disponible | LoRA para QA con citas en japones (JEMHopQA) | Apache-2.0 | Hugging Face (2 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo general multilingue | Apache-2.0 | Hugging Face (oficial) |
| E05 (checkpoint de comparacion) | no disponible | no disponible | Ajuste para JEMHopQA | no disponible | Mencionado por el autor, sin enlace |

La comparativa se limita al modelo base y al checkpoint E05 citado por el autor; no se dispone de datos de rendimiento ni de especificaciones completas de las alternativas para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo especializado: el ajuste se limita a respuestas cortas en japones con citas sobre JEMHopQA; fuera de ese dominio el comportamiento puede degradarse respecto al modelo base.
- Riesgo de alucinacion: como cualquier LLM generativo, puede producir respuestas o identificadores de cita incorrectos, especialmente si el contexto recuperado no contiene la informacion.
- Cobertura idiomatica: el adaptador esta entrenado para japones; no se documenta el rendimiento en castellano ni en otros idiomas.
- Datos de entrenamiento con licencia CC BY-SA 4.0 (JEMHopQA y fragmentos de Wikipedia japonesa): conviene revisar las obligaciones de atribucion y compartir-igual si se redistribuye el modelo o se derivan obras del dataset.
- Licencia del modelo: Apache-2.0, lo que permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre calidad en produccion.
- Falta de documentacion: no se detallan tokens de entrenamiento, hiperparametros, contexto maximo ni resultados de evaluacion, lo que dificulta reproducir o validar el ajuste.
- Madurez: con 2 descargas y 0 likes en el momento de la consulta, es un artefacto de curso sin adopcion ni validacion externa.
- No se documentan variantes cuantizadas ni soporte para tool calling o agentes, por lo que no es adecuado como sustituto directo de modelos mayores en pipelines complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/demimomi/llm-course2-2026-e13-qwen3-5-0-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de recuperacion: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Repositorio JEMHopQA: https://github.com/aiishii/JEMHopQA
- Paper JEMHopQA (LREC-COLING 2024): https://aclanthology.org/2024.lrec-main.831/
