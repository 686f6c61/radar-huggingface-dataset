# azuki-digital/llm2026-qwen35-sft-v2

## Resumen

llm2026-qwen35-sft-v2 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por azuki-digital en el contexto del curso "LLM講座2 2026". El modelo parte de los pesos de Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`, licencia Apache-2.0) y aplica un entrenamiento LoRA que posteriormente se fusiona con los pesos originales, de modo que la arquitectura resultante es identica a la del modelo base.

El objetivo del ajuste es especializar un modelo pequeno (873 millones de parametros) en tareas de respuesta a preguntas sobre documentacion en japones, empleando un pipeline de recuperacion (BM25 combinado con los modelos de embeddings y reranking ruri-v3-310m de cl-nagoya) para construir el conjunto de entrenamiento. El modelo esta pensado como entrega de un trabajo de fin de curso y no como un modelo de proposito general.

Su relevancia practica es limitada: se publica con cero descargas y cero likes, no incluye datos de benchmarks y su unico idioma declarado es el japones. Resulta util como referencia de como se construye un SFT con datos de recuperacion filtrados, pero no como candidato para produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; tipo `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es identica a la de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 873 millones de parametros. El autor indica explicitamente que la estructura del modelo no se ha modificado; el ajuste se realizo mediante LoRA sobre el modelo base y posteriormente se fusiono con los pesos originales, por lo que no hay adaptadores separados ni cambios en la topologia de la red.

El conjunto de entrenamiento se construyo a partir de cuatro fuentes en japones: JEMHopQA, JSQuAD (JGLUE), cl-nagoya/auto-wiki-qa y un conjunto de chunks derivados de Wikipedia en japones. Las preguntas de esos datasets se pasaron por un pipeline de recuperacion compuesto por BM25, el modelo de embeddings cl-nagoya/ruri-v3-310m y el reranker cl-nagoya/ruri-v3-reranker-310m, y se conservaron mecanicamente solo los problemas cuyo contexto recuperado contenia la cadena de respuesta. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset tras el filtrado, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y respuesta a preguntas en japones, especialmente en el formato de QA con contexto recuperado (estilo RAG).
- Extraccion de respuestas a partir de documentacion: el entrenamiento se filtro para que el contexto contuviera la respuesta literal.
- Manejo de preguntas de tipo multi-hop, dado que JEMHopQA forma parte de los datos de entrenamiento.
- Capacidades generales del modelo base Qwen3.5-0.8B (generacion, razonamiento basico y codigo), aunque no se documenta su conservacion tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo japones declarado; el resto de idiomas no esta documentado.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Respuesta a preguntas sobre documentacion interna en japones: el modelo se entreno con pares pregunta-contexto donde la respuesta estaba presente en el texto recuperado, por lo que encaja en un pipeline RAG que le pase chunks y le pida extraer o sintetizar la respuesta.
- Busqueda documental asistida: combinado con el mismo stack de recuperacion empleado en el entrenamiento (BM25 + ruri-v3-310m + ruri-v3-reranker-310m), puede generar respuestas concisas sobre los fragmentos recuperados.
- Preguntas multi-hop sobre bases de conocimiento en japones: el uso de JEMHopQA en el entrenamiento lo hace adecuado para preguntas que requieren combinar informacion de varios pasajes.
- Prototipado educativo y experimentacion: sirve como ejemplo reproducible de SFT con LoRA fusionado y de construccion de datasets de QA filtrados por recuperacion, util en cursos y talleres.
- Despliegue en entornos con recursos limitados: con 873 millones de parametros, es viable en una unica GPU consumer para pruebas de inferencia, aunque el rendimiento real no esta documentado.
- Evaluacion comparativa de tecnicas de filtrado de datos: permite estudiar como afecta el filtrado mecanico por presencia de la respuesta en el chunk a la calidad de las respuestas generadas.
- Base para nuevos ajustes: al estar bajo Apache-2.0 y con pesos en safetensors, puede reutilizarse como punto de partida para SFT adicionales en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 873 millones de parametros en fp16 requiere aproximadamente 1,7 GB solo para los pesos, y en cuantizacion de 8 bits alrededor de 0,9 GB; a ello hay que sumar la memoria de la cache KV segun la longitud de contexto, que no se especifica.
- GPU recomendadas: no disponible. Por tamano, deberia caber en GPUs consumer con 8 GB o mas de VRAM, pero no hay datos publicados que lo confirmen.
- Cabe en GPU consumer: probable por numero de parametros, sin confirmacion oficial.
- Opciones de despliegue: no disponible en la informacion proporcionada. Al publicarse solo en safetensors, seria necesario convertir los pesos a GGUF para llama.cpp u Ollama, o cargarlos con frameworks compatibles con la arquitectura `qwen3_5` como vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| azuki-digital/llm2026-qwen35-sft-v2 | 873.438.784 | no disponible | ja | Apache-2.0 | SFT con LoRA fusionado sobre Qwen3.5-0.8B; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B | no disponible en la informacion proporcionada | no disponible | no disponible | Apache-2.0 | Modelo base; capacidades generales sin especializar en japones |
| cl-nagoya/ruri-v3-310m | no disponible en la informacion proporcionada | no disponible | ja | no disponible en la informacion proporcionada | Modelo de embeddings usado en el pipeline de recuperacion, no es un modelo generativo comparable directamente |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre Wikipedia en japones y datasets de QA academicos, puede heredar los sesgos de esas fuentes.
- Riesgo de alucinacion: no evaluado. El filtrado del dataset garantiza que la respuesta estaba en el contexto durante el entrenamiento, pero no hay evidencia de que el modelo se abstenga de responder cuando la informacion no esta presente.
- Limitaciones de contexto e idioma: solo se declara japones; el comportamiento en castellano u otros idiomas no esta documentado. La longitud de contexto no se especifica.
- Restricciones de licencia: los pesos se distribuyen bajo Apache-2.0, pero los datos de entrenamiento incluyen JEMHopQA, JSQuAD y auto-wiki-qa bajo CC BY-SA 4.0, con obligaciones de atribucion y comparticion bajo la misma licencia que pueden afectar a la redistribucion o al uso comercial derivado.
- Caveat para produccion: el modelo tiene cero descargas y cero likes, no incluye benchmarks ni evaluacion cualitativa, y fue creado como entrega de un curso; no deberia desplegarse en produccion sin una evaluacion propia exhaustiva.
- Al ser un ajuste especifico de QA sobre contexto recuperado, puede degradar capacidades generales del modelo base (generacion libre, codigo, conversacion) que no se han verificado tras el SFT.
- No hay informacion sobre cuantizaciones probadas ni sobre el soporte de la arquitectura `qwen3_5` en herramientas de inferencia populares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azuki-digital/llm2026-qwen35-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JSQuAD (JGLUE): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Modelo de embeddings ruri-v3-310m: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Modelo reranker ruri-v3-reranker-310m: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
