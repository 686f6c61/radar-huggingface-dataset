# salamanderDixon/granite-4.1-3b-heretic

## Resumen

El modelo `salamanderDixon/granite-4.1-3b-heretic` es una version modificada del modelo `ibm-granite/granite-4.1-3b` de IBM, desarrollada por el usuario salamanderDixon mediante la tecnica de abliteracion Heretic v1.4.0. El objetivo es eliminar los mecanismos de rechazo del modelo original, reduciendo las respuestas de refusal de 88/100 a 3/100, manteniendo una divergencia KL de 0.2603 respecto al modelo base. Esto lo convierte en una variante "decensored" o "uncensored" orientada a aplicaciones que requieren respuestas sin filtros de seguridad.

La arquitectura subyacente es la de Granite-4.1-3B, un transformer denso de 3.402.836.480 parametros (aproximadamente 3.4B), finetuneado desde Granite-4.1-3B-Base con datasets de instrucciones de codigo abierto y datos sinteticos. El modelo original fue entrenado por el equipo Granite de IBM, con un pipeline de post-entrenamiento que incluye supervisated finetuning y reinforcement learning alignment. La version heretic hereda las capacidades del modelo base, pero con una capa de abliteracion aplicada sobre las proyecciones de atencion y MLP.

Este modelo es relevante para investigadores y desarrolladores que necesitan estudiar el comportamiento de un LLM sin mecanismos de rechazo, o que buscan una alternativa menos restrictiva para aplicaciones de generacion de texto, agentes con tool calling o simulaciones de interaccion sin filtros. Sin embargo, al ser una modificacion no oficial y con cero descargas, su validacion y calidad no estan contrastadas por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 3.402.836.480 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, Chinese (segun modelo original) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Granite-4.1-3B es un transformer causal denso, sin mezcla de expertos, disenado para tareas de lenguaje e instrucciones. El modelo base fue finetuneado desde Granite-4.1-3B-Base utilizando una combinacion de datasets de instrucciones open source con licencias permisivas y datasets sinteticos internos. El pipeline de post-entrenamiento incluye supervisated finetuning (SFT) y reinforcement learning alignment, lo que mejora el seguimiento de instrucciones, el tool calling y las capacidades conversacionales.

La version heretic se obtiene aplicando el algoritmo de abliteracion Heretic v1.4.0 sobre los pesos del modelo original. Este proceso modifica selectivamente las proyecciones de atencion (`attn.o_proj`) y las proyecciones de salida del MLP (`mlp.down_proj`), utilizando parametros como `direction_index` (28.14) y distintos pesos maximos y minimos para eliminar las representaciones internas asociadas al rechazo. El resultado es una reduccion drastica de las refusals (de 88/100 a 3/100) con una divergencia KL de 0.2603 respecto al modelo original, lo que indica que la distribucion de salida se ha desplazado moderadamente.

## Capacidades

- Generacion de texto siguiendo instrucciones y conversaciones multi-turno.
- Tool calling y function calling, compatible con el esquema de definicion de funciones de OpenAI.
- Razonamiento, clasificacion de texto, extraccion de informacion y question answering.
- Soporte de Retrieval Augmented Generation (RAG).
- Generacion de codigo y completado Fill-In-the-Middle (FIM).
- Capacidades multilingues en 12 idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Al estar abliterated, responde a peticiones que el modelo original rechazaria, permitiendo un comportamiento menos restrictivo en temas sensibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite comparar el comportamiento de un LLM con y sin mecanismos de rechazo, analizando como la abliteracion afecta a la generacion de respuestas en escenarios de riesgo.
- Simulacion de agentes conversacionales sin filtros: puede integrarse en prototipos de chatbots o asistentes donde se necesita explorar respuestas sin restricciones tematicas, siempre dentro de entornos controlados.
- Generacion de codigo en pipelines de desarrollo: gracias al tool calling y al soporte de FIM, puede utilizarse para autocompletar fragmentos de codigo o como asistente en entornos de CI/CD, aunque su calidad en codigo no ha sido benchmarkeada.
- Analisis de texto y extraccion de entidades: la capacidad de clasificacion y extraccion permite procesar documentos multilingues para tareas de business intelligence o gestion documental.
- RAG en aplicaciones empresariales: el modelo puede servir como base para sistemas de pregunta-respuesta sobre documentacion interna, aprovechando su contexto largo y su capacidad de seguir instrucciones.
- Escritura creativa y role-play: al eliminar los rechazos, resulta adecuado para generar ficcion interactiva o personajes en juegos narrativos, donde las restricciones del modelo original limitarian la creatividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica tabla de rendimiento proporcionada compara la version heretic con el modelo original en metricas de abliteracion:

| Metrica | This model | Original model (ibm-granite/granite-4.1-3b) |
|---|---|---|
| KL divergence | 0.2603 | 0 (por definicion) |
| Refusals | 3/100 | 88/100 |

Estos datos indican que la version heretic reduce significativamente los rechazos, pero no aportan informacion sobre precision, capacidad de razonamiento o calidad general en tareas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 3.402.836.480 parametros. En precision FP16/BF16, los pesos ocupan aproximadamente 6.8 GB, por lo que se recomienda al menos 8-10 GB de VRAM para inferencia con overhead de activaciones y KV cache. En cuantizacion 4-bit, la VRAM necesaria podria reducirse a unos 2-3 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: una NVIDIA RTX 4060 Ti de 16 GB o superior es suficiente para FP16. Para despliegues mas eficientes, se recomiendan A100, H100 o RTX 4090.
- Compatibilidad con consumer GPUs: si, el modelo cabe en GPUs de gama media con 12 GB o mas de VRAM en FP16, y en GPUs de 8 GB con cuantizacion 4-bit (si se genera un GGUF o se usa bitsandbytes).
- Opciones de despliegue: se puede cargar con `transformers` y `accelerate` en Python, o servir via vLLM, TGI o llama.cpp si se convierte a formato GGUF. No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Refusals | Notas |
|---|---|---|---|---|---|
| salamanderDixon/granite-4.1-3b-heretic | 3.4B | no disponible | Apache 2.0 | 3/100 | Version abliterated, sin benchmarks |
| ibm-granite/granite-4.1-3b | 3.4B | no disponible | Apache 2.0 | 88/100 | Modelo original de IBM, con post-entrenamiento completo |
| vlx1/granite-4.1-3b-heretic | 3.4B | no disponible | Apache 2.0 | no disponible | Otra version heretic del mismo modelo base, sin datos de rendimiento publicados |

Las tres variantes comparten la misma arquitectura y numero de parametros. La diferencia principal radica en el proceso de abliteracion aplicado y en los parametros utilizados. No se dispone de benchmarks comparativos para evaluar la calidad de generacion entre ellas.

## Limitaciones y advertencias

- El proceso de abliteracion introduce una divergencia KL de 0.2603 respecto al modelo original, lo que puede degradar la coherencia, la precision factual o el seguimiento de instrucciones en ciertos contextos.
- Al eliminar los mecanismos de rechazo, el modelo puede generar contenido danino, ilegal, ofensivo o peligroso sin ninguna restriccion. Esto supone un riesgo significativo en aplicaciones publicas o en produccion.
- No se han realizado evaluaciones de sesgos, seguridad ni alucinaciones en esta version modificada.
- La longitud de contexto no esta especificada en la informacion disponible, por lo que se desconocen los limites reales de ventana de atencion.
- El repositorio no incluye cuantizaciones, por lo que el despliegue eficiente requiere conversion manual o uso de librerias externas.
- El modelo tiene cero descargas y cero likes en HuggingFace, lo que indica una falta de validacion por parte de la comunidad y posibles problemas no detectados.
- La licencia Apache 2.0 permite uso comercial, pero el responsable del uso del modelo es el usuario final, especialmente en escenarios donde se generen contenidos problematicos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/salamanderDixon/granite-4.1-3b-heretic
- Modelo original: https://huggingface.co/ibm-granite/granite-4.1-3b
- Blog de Granite 4.1: https://huggingface.co/blog/ibm-granite/granite-4-1
- Repositorio de Granite 4.1 en GitHub: https://github.com/ibm-granite/granite-4.1-language-models
- Documentacion de Granite: https://www.ibm.com/granite/docs/
- Proyecto Heretic: https://heretic-project.org
- Modelo similar (vlx1/granite-4.1-3b-heretic): https://huggingface.co/vlx1/granite-4.1-3b-heretic
