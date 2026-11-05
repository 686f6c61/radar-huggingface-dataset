# mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic-GGUF es una distribucion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-DiM-heretic, un derivado "abliterated" del Qwen2.5-32B-Instruct de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones estaticas en HuggingFace. El modelo base parte de la arquitectura transformer densa de Qwen2.5, con 32.763.876.352 parametros totales y una ventana de contexto de 131.072 tokens (heredada de Qwen2.5-32B-Instruct, aunque no se explicita en la model card del repo).

La particularidad del modelo es la tecnica "abliteration" (etiquetada como heretic, uncensored, decensored), que elimina o atenua los mecanismos de rechazo del modelo original mediante la modificacion de las direcciones de activacion asociadas a comportamientos de negativa. El resultado es un modelo que responde a practicamente cualquier prompt sin las negativas tipicas del modelo alineado, manteniendo la base de conocimiento y capacidades del Qwen2.5-32B-Instruct original.

Este repo concreto aporta las cuantizaciones GGUF (Q2_K a Q8_0) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, algo inviable con los pesos originales en bf16 (unos 65 GB). Es relevante para quienes necesitan un modelo de 32B sin restricciones de contenido y quieren desplegarlo localmente con Ollama, LM Studio o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (heredada de Qwen2.5-32B-Instruct: 131.072 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_S, Q6_K, Q8_0 (estaticas) |
| Idiomas soportados | en (ingles declarado; el modelo base Qwen2.5 soporta multiples idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 32B parametros basado en Qwen2.5-32B-Instruct. Qwen2.5-32B-Instruct emplea atencion por grupos de consultas (GQA) con 64 cabezas de atencion y 8 cabezas KV, 64 capas y una dimension oculta de 5120, con embeddings ligados al proyector de salida. El entrenamiento original de Qwen2.5 incluyo preentrenamiento con 18 billones de tokens y un post-entrenamiento con SFT y RLHF/DPO para alineamiento instruct.

La modificacion "heretic/abliterated" aplicada por richardyoung consiste en identificar las direcciones de activacion responsables de los comportamientos de rechazo y proyectarlas fuera de los pesos, sin reentrenar el modelo completo. Esta tecnica, popularizada por los trabajos de abliteration, permite eliminar el sesgo de negativa manteniendo en gran medida las capacidades del modelo original. No se dispone de informacion sobre el dataset o el procedimiento exacto empleado en esta variante concreta.

mradermacher realiza unicamente la conversion a GGUF y la cuantizacion estatica (quantize_version 2, output_tensor_quantised 1). No hay informacion sobre cuantizaciones con imatrix (weighted) en el momento de la publicacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento y matematicas heredados de Qwen2.5-32B-Instruct.
- Generacion de codigo y comprension de lenguajes de programacion.
- Soporte de tool calling / function calling (heredado del modelo base instruct).
- Capacidad de seguir instrucciones complejas y razonamiento multi-paso.
- Capacidades multilingues del modelo base (aunque el repo declara solo ingles).
- Ausencia de mecanismos de rechazo: responde a practicamente cualquier prompt, incluido contenido sensible.
- Modo chat conversacional (pipeline tag: conversational).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como se comporta un modelo sin mecanismos de rechazo frente a prompts que el modelo original rechazaria, util para auditorias de seguridad y red-teaming controlado.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas, violencia o contenido controversial que los modelos alineados suelen declinar, en entornos editoriales que lo requieran.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (18,9 GB) y Q6_K (27 GB) permiten ejecutar un modelo de 32B en GPUs con 24 GB o en configuraciones con offload a CPU, algo imposible con los pesos bf16.
- Evaluacion comparativa de cuantizaciones: el repo ofrece cinco niveles de cuantizacion para medir el impacto de la compresion en calidad y velocidad en tareas de razonamiento y codigo.
- Prototipado de asistentes conversacionales en ingles: el modelo mantiene la calidad conversacional de Qwen2.5-32B-Instruct para dialogos multi-turno con contexto largo.
- Pipelines de generacion de codigo: el soporte de tool calling y la capacidad de codigo del modelo base permiten integrarlo en flujos de autocompletado o generacion de tests, siempre en entornos donde no se requieran filtros de contenido.
- Fine-tuning posterior sobre los pesos desbloqueados: al ser apache-2.0, se puede reentrenar o adaptar con LoRA para dominios especificos sin las restricciones de contenido del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q2_K ~12,4 GB; Q3_K_M ~16 GB; Q4_K_S ~18,9 GB; Q6_K ~27 GB; Q8_0 ~34,9 GB (tamanos de fichero, la VRAM real depende del contexto y del offload).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S con contexto moderado; A100 40/80 GB o H100 para Q6_K/Q8_0 con contexto largo; multiples GPUs para Q8_0 con contexto completo.
- Cabe en GPU de consumo: si, Q4_K_S y Q3_K_M en RTX 3090/4090 (24 GB); Q2_K en GPUs de 16 GB; Q6_K y Q8_0 requieren 32 GB o mas o bien offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI (endpoints_compatible). No se menciona soporte nativo en vLLM o TGI para GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-DiM-heretic-GGUF (este) | 32,8B | 131.072 (heredado) | apache-2.0 | GGUF | Sin rechazos, cuantizaciones estaticas |
| Qwen2.5-32B-Instruct (original) | 32,8B | 131.072 | apache-2.0 | safetensors, GGUF | Alineado, con rechazos |
| richardyoung/Qwen2.5-32B-Instruct-DiM-heretic | 32,8B | 131.072 (heredado) | apache-2.0 | safetensors | Modelo base sin cuantizar de este repo |
| Otras variantes abliterated de 32B | ~32B | variable | variable | variable | No disponible comparativa concreta |

## Limitaciones y advertencias

- Ausencia total de mecanismos de rechazo: el modelo puede generar contenido danino, ilegal o sexualmente explicito sin filtros. No apto para despliegues publicos sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por la modificacion de pesos que puede degradar parcialmente el alineamiento y la coherencia en temas sensibles.
- Idiomas: la model card declara solo ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La cuantizacion Q2_K y Q3_K_M degradan notablemente la calidad; el autor recomienda Q4_K_S o superior.
- Licencia apache-2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales (por ejemplo, en materia de contenido sexual, violencia o desinformacion).
- No se dispone de informacion sobre el procedimiento de abliteration, lo que impide evaluar que capacidades se han degradado respecto al modelo original.
- Sin cuantizaciones imatrix disponibles: la calidad por bit es inferior a la de cuantizaciones ponderadas equivalentes.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- HuggingFace (este repo): https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Modelo base sin cuantizar: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
