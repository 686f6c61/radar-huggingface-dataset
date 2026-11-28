# momo0729/qwen3.5-0.8b-sel

## Resumen

qwen3.5-0.8b-sel es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario momo0729 y publicado en Hugging Face. No se trata de un modelo de propósito general, sino de un modelo especializado en una tarea muy concreta dentro de pipelines de generación aumentada por recuperación (RAG): la selección del siguiente articulo a consultar en preguntas de tipo two-hop (dos saltos) sobre contenido derivado de Wikipedia en japones. El modelo recibe la pregunta, los documentos recuperados en el primer paso y una lista de titulos de articulos candidatos, y devuelve un JSON con el articulo a consultar a continuacion.

Tecnicamente es un transformer denso de aproximadamente 873 millones de parametros, derivado del Qwen3.5-0.8B mediante un ajuste con LoRA (variante LoRA+) cuyos pesos se fusionaron posteriormente con los originales del modelo base. La estructura, configuracion, tokenizador y chat template son identicos a los del modelo base; solo se modifican las matrices lineales de las capas de atencion. La licencia es Apache-2.0 y el idioma declarado es exclusivamente japones.

Su relevancia es acotada pero clara: demuestra como un modelo pequeno (menos de mil millones de parametros) puede especializarse en una subtarea de enrutamiento dentro de un sistema RAG, en lugar de emplear un modelo grande de propósito general. No esta pensado para generar respuestas finales, sino como componente de orquestacion de la recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-0.8B); ajuste LoRA+ fusionado en las capas lineales de atencion |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) |
| Tamano del repositorio | 1,8 GB |
| Metodo de ajuste | LoRA (LoRA+) con fusion de pesos (factor W = 1.0) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-0.8B original: un transformer denso con tokenizador y chat template sin cambios. El ajuste se realizo con LoRA en su variante LoRA+ y, a diferencia de un adaptador convencional, los pesos aprendidos se fusionaron directamente con los del modelo base mediante la formula `nuevo = original + W × (ajustado − original)` con `W = 1.0`. Segun la model card, unicamente se modifican los pesos de las capas lineales correspondientes a las partes de atencion del texto; el resto de la estructura permanece intacta.

El entrenamiento se oriento a una tarea de seleccion de articulo en preguntas de dos saltos. Los datos proceden de tres fuentes: pares de preguntas de `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0) combinadas por regla para formar preguntas de dos saltos, con la entidad puente (el articulo de la segunda evidencia) como objetivo; preguntas de TyDi QA en japones (Apache-2.0, tarea primaria) usadas como mitades de esas preguntas compuestas; y tripletas de derivacion de JEMHopQA (RIKEN, CC BY-SA 4.0). Los candidatos se generaron por coincidencia de cadenas sobre los titulos de articulos de un conjunto de chunks distribuidos derivados de Wikipedia en japones, y la respuesta correcta se definio como el articulo de la evidencia que no aparecia entre los chunks recuperados en el top inicial. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Seleccion del siguiente articulo a consultar en preguntas de dos saltos: recibe la pregunta, los documentos recuperados y una lista de titulos candidatos, y devuelve `{"article": "<titulo>"}`.
- Salida estructurada en JSON con una unica clave `article`.
- Enrutamiento dentro de pipelines RAG: decide que evidencia adicional recuperar antes de generar la respuesta final.
- Comprension lectora en japones limitada al contexto de la tarea de seleccion (no genera respuestas).
- Manejo de candidatos obtenidos por coincidencia de cadenas sobre titulos de articulos de Wikipedia en japones.
- No soporta, segun la informacion disponible, tool calling, function calling generico, agentes multi-paso generales, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Enrutamiento de recuperacion en RAG de dos saltos sobre Wikipedia en japones: dado un primer conjunto de chunks recuperados, el modelo elige el articulo puente que falta para responder la pregunta; es adecuado porque fue entrenado exactamente para esta tarea y devuelve una salida JSON parseable.
- Sistemas de busqueda conversacional en japones: integrado como paso intermedio entre la recuperacion inicial y la recuperacion secundaria, permite ampliar el contexto recuperado sin invocar un modelo grande.
- Despliegue en entornos con recursos limitados: con menos de 900 millones de parametros, puede ejecutarse en CPU o en GPU de consumo para tareas de enrutamiento de bajo coste.
- Investigacion sobre especializacion de modelos pequenos: sirve como referencia para estudiar como un ajuste LoRA fusionado sobre un modelo de 0.8B puede cubrir una subtarea concreta de un pipeline.
- Evaluacion de pipelines RAG multi-salto: util como componente controlado para medir la contribucion del enrutamiento a la calidad final de la respuesta.
- Filtrado o priorizacion de candidatos en grafos de articulos: el modelo puede emplearse para seleccionar la siguiente entidad a explorar en recorridos sobre colecciones documentales japonesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,5 GB para los 873 millones de parametros.
- VRAM estimada en bf16/fp16: aproximadamente 1,8 GB de pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,9 GB; en 4 bits, aproximadamente 0,5 GB (estimaciones teoricas; no se confirman formatos de cuantizacion publicados).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para bf16; A100, H100 o RTX 4090 son mas que suficientes y quedan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; tambien es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF a partir de los safetensors; transformers con PyTorch es la via directa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-sel | 873 M | no disponible | Seleccion de articulo en RAG two-hop (ja) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Proposito general | Apache-2.0 | Hugging Face |
| Modelos de enrutamiento RAG de proposito general | no disponible | no disponible | Enrutamiento generico | variable | variable |

La comparacion con alternativas especializadas en enrutamiento RAG no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la especializacion en la tarea de seleccion de articulo y la fusion de los pesos LoRA, no un cambio de arquitectura ni de tamano.

## Limitaciones y advertencias

- Modelo altamente especializado: no esta disenado para generar respuestas finales ni para conversacion general; su uso fuera de la tarea de seleccion de articulo no esta validado.
- Idioma: solo se declara japones; el rendimiento en otros idiomas no esta documentado.
- Dependencia del formato de entrada: espera la pregunta, los chunks recuperados y una lista de titulos candidatos generada por coincidencia de cadenas; entradas fuera de ese formato pueden degradar la salida.
- Riesgo de alucinacion: puede devolver un titulo de articulo que no figure entre los candidatos o que no sea la entidad puente correcta; conviene validar la salida contra la lista de candidatos.
- Sin datos publicos de benchmarks: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Licencia Apache-2.0: permite uso comercial, pero los datasets de entrenamiento incluyen material con licencias CC BY-SA 4.0 (auto-wiki-qa, JEMHopQA y chunks de Wikipedia), lo que puede requerir atribucion y compartir-al-igual sobre obras derivadas de esos contenidos.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria ni reportes de uso en produccion.
- No se documentan sesgos especificos; al derivar de Wikipedia en japones, puede heredar los sesgos de cobertura y sesgo editorial de esa fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/momo0729/qwen3.5-0.8b-sel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset TyDi QA: https://huggingface.co/datasets/google-research-datasets/tydiqa
- JEMHopQA (RIKEN): https://github.com/aiishii/JEMHopQA
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
