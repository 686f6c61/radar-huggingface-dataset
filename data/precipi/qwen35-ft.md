# precipi/qwen35-ft

## Resumen

`precipi/qwen35-ft` es un ajuste fino (fine-tuning) del modelo `unsloth/Qwen3.5-0.8B`, publicado por el usuario precipi en Hugging Face. Se trata, por tanto, de un derivado de la familia Qwen3.5 de Alibaba, en su variante mas pequena (aproximadamente 0,87 mil millones de parametros), entrenado con la libreria Unsloth y TRL segun indica el propio autor en la model card.

El modelo resuelve el caso de uso de adaptar un modelo base multimodal de bajo coste computacional a una tarea concreta. Sin embargo, la ficha publicada no documenta que tarea es esa: no se especifican el dataset de entrenamiento, los hiperparametros, el numero de pasos ni ninguna evaluacion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 29 de octubre de 2026, lo que lo situa como una publicacion reciente y sin validacion por parte de la comunidad.

Su relevancia practica es limitada pero real: los modelos de la clase 0,8B de la serie Qwen3.5 estan disenados para ejecutarse en hardware de consumo e incluso en CPU, y este checkpoint conserva la licencia Apache 2.0 del modelo base, lo que permite uso comercial sin restricciones adicionales. Ahora bien, al carecer de documentacion y de benchmarks, cualquier evaluacion seria exige reproducir el entrenamiento o realizar una validacion propia antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (modelo denso); pipeline declarado en el Hub: image-text-to-text |
| Parametros totales | 873.438.784 (aproximadamente 0,87B), segun safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se documenta en la model card) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors (sin GGUF ni AWQ/GPTQ publicados) |
| Idiomas soportados | en (ingles), segun los tags del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 1,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.5, la familia presentada por Alibaba en febrero de 2026 con enfasis en capacidades agenticas y arquitectura multimodal nativa, segun las cronicas de prensa disponibles. El pipeline declarado en el Hub para este checkpoint es `image-text-to-text`, lo que sugiere soporte de entrada de imagen y texto, aunque la model card no lo documenta ni lo confirma de forma explicita. Con 873 millones de parametros en safetensors y un repositorio de 1,8 GB, los pesos estan almacenados en bf16 (aproximadamente 2 bytes por parametro), sin que se haya publicado ninguna variante cuantizada.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun la unica frase tecnica de la model card, que afirma un entrenamiento "2x mas rapido" gracias a Unsloth. No se especifica el dataset, el numero de tokens, la composicion de los datos, la técnica de alineacion (RLHF, DPO u otra), la longitud de contexto usada durante el ajuste ni el regimen de hiperparametros. Tampoco se indica si se congelaron capas, si se uso LoRA/QLoRA y si los adaptadores se fusionaron en los pesos finales; el hecho de que el repo contenga pesos completos en safetensors sugiere una fusion, pero es una inferencia, no un dato confirmado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento de entrada imagen-texto a texto segun el pipeline declarado en el Hub (`image-text-to-text`); no documentado en la model card.
- Razonamiento de varios pasos y capacidades agenticas propias de la familia Qwen3.5, segun la informacion publica de la serie; no verificadas en este checkpoint concreto.
- Soporte de tool calling / function calling: no confirmado para este ajuste concreto; la serie Qwen3.5 lo incorpora a nivel de familia.
- Capacidades multilingues: limitadas al ingles segun los tags del repositorio, aunque el modelo base podria tener un alcance mayor no reflejado en esta ficha.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada para este checkpoint.

Advertencia importante: al no existir evaluacion del ajuste fino, no es posible afirmar que estas capacidades del modelo base se conserven intactas. Un fine-tuning sin documentar puede degradar habilidades generales (olvido catastrofico), especialmente en modelos de menos de 1000 millones de parametros.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo cabe en cualquier GPU de consumo y permite iterar sobre prompts y flujos conversacionales con un coste de inferencia minimo antes de migrar a un modelo mayor.
- Clasificacion y extraccion de informacion en texto: ajustar y desplegar un modelo de 0,87B para tareas acotadas (etiquetado, extraccion de entidades, enrutado de tickets) donde la latencia y el coste por token importan mas que la precision bruta.
- Procesamiento de documentos con imagen en local: si se confirma la capacidad multimodal, permitiria extraer texto o describir capturas y formularios en entornos sin conexion, con los 1,8 GB de pesos en disco.
- Educacion e investigacion sobre fine-tuning: sirve como caso de estudio reproducible de un pipeline Unsloth + TRL sobre un modelo pequeno, util para comparar tecnicas de ajuste eficiente en parametros.
- Filtrado y preprocesado en pipelines de datos: usar el modelo como clasificador barato o generador de resumenes preliminares antes de un modelo mayor, reduciendo el volumen de tokens enviados a la API.
- Despliegue en el borde (edge) o en CPU: con menos de 1 GB de pesos en bf16 y aproximadamente 0,5 GB en cuantizacion de 4 bits (si se genera), es viable en dispositivos con recursos limitados para tareas de generacion corta.
- Base para ajustes posteriores: punto de partida ya afinado sobre el que aplicar LoRA especifico de dominio, siempre que se valide primero que el ajuste original no ha degradado el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K, MMMU ni otras), y los resultados de busqueda consultados se refieren a la familia Qwen3.5 en general (variantes Flash, 27B, 35B-A3B, 397B), no a este checkpoint de 0,8B ni a este ajuste fino concreto. No se dispone por tanto de datos comparativos fiables para este modelo.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,75 GB para los pesos, mas cache KV; en la practica, entre 2,5 y 3,5 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB de pesos, con un total de 1,5 a 2 GB en inferencia (requiere cuantizar el modelo, ya que no hay versiones publicadas).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,5 GB de pesos; el modelo cabria en GPUs con 2 GB o menos (no hay GGUF publicado, habria que generarlo).
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen un margen amplio. Tambien es viable en A100/H100, aunque resultan sobredimensionadas para 0,87B.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU mediante transformers o llama.cpp tras conversion a GGUF.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (tag `text-generation-inference` presente), y llama.cpp u Ollama si se convierte a GGUF. El soporte en vLLM depende de que la arquitectura Qwen3.5 este integrada en la version utilizada; no confirmado para este checkpoint.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| precipi/qwen35-ft | 873.438.784 | no disponible | apache-2.0 | safetensors | 0 descargas, 0 likes |
| unsloth/Qwen3.5-0.8B (base) | aproximadamente 0,8B | no disponible | apache-2.0 | safetensors | modelo base de referencia |
| Otras variantes Qwen3.5 (Flash, 27B, 35B-A3B, 397B) | desde 0,8B hasta 397B | no disponible | no disponible en la informacion | no disponible | familia publica de Alibaba |
| Alternativas pequenas multimodales (p. ej. SmolVLM, Moondream) | no disponible en la informacion | no disponible | no disponible | no disponible | no verificado |

La comparacion directa con el modelo base es la mas informativa: comparten arquitectura y numero de parametros, y la unica diferencia documentada es el ajuste fino con Unsloth y TRL. Cualquier comparacion de rendimiento frente a terceros exigiria datos de benchmarks que no se han publicado.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se indica el dataset, el objetivo del ajuste, los hiperparametros ni las evaluaciones, lo que impide saber para que tarea fue optimizado y si la cumple.
- Riesgo elevado de olvido catastrofico: en modelos de 0,87B, un fine-tuning no documentado puede degradar capacidades generales del modelo base de forma dificil de detectar sin una bateria de pruebas propia.
- Riesgo de alucinacion: inherente a los modelos de esta escala, agravado por la falta de evaluacion; no se recomienda su uso en tareas de alta precision sin verificacion.
- Alcance linguistico limitado: los tags declaran unicamente ingles, por lo que el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede planificar su uso en conversaciones o documentos largos sin medirlo empiricamente.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad sobre el comportamiento del modelo; conviene conservar los avisos de licencia del modelo base.
- Estado del repositorio: 0 descargas y 0 likes indican ausencia de validacion por la comunidad; no hay issues, discusiones ni casos de exito reportados.
- Capacidad multimodal no confirmada: el pipeline `image-text-to-text` es un metadato del Hub, no una garantia documentada por el autor; conviene verificarlo con pruebas antes de disenar un producto sobre esa funcionalidad.
- Ausencia de cuantizaciones oficiales: quien necesite GGUF, AWQ o GPTQ debera generarlas y validar la perdida de calidad por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/precipi/qwen35-ft
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- CNBC, Alibaba unveils Qwen3.5 as China's chatbot race shifts to AI agents: https://www.cnbc.com/2026/02/17/china-alibaba-qwen-ai-agent-latest-model.html
- Reuters, Alibaba unveils new Qwen3.5 model for 'agentic AI era': https://www.reuters.com/world/china/alibaba-unveils-new-qwen35-model-agentic-ai-era-2026-02-16/
- Guia tecnica de la serie Qwen3.5 (Flash, 27B, 35B-A3B): https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- Guia de la API de Qwen 3.5 (modelos y precios): https://kissapi.ai/blog/qwen-3-5-api-complete-guide-2026.html
- SCMP, Alibaba unveils Qwen3.5: https://www.scmp.com/tech/big-tech/article/3343738/alibaba-unveils-qwen-35-sharpening-global-race-spread-ai-models
