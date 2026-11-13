# dean-ayush/gemma-2-2B-it-thinking-function_calling-V0

## Resumen

`dean-ayush/gemma-2-2B-it-thinking-function_calling-V0` es un ajuste fino (fine-tuning) supervisado del modelo `google/gemma-2-2b-it` de Google, publicado por el usuario dean-ayush en Hugging Face. El nombre del repositorio sugiere que el objetivo del ajuste es reforzar dos capacidades concretas: el razonamiento explicito tipo "thinking" y el uso de herramientas mediante function calling. Se trata, por tanto, de una variante experimental orientada a flujos de agentes y llamadas a funciones, no de un modelo base nuevo.

El modelo hereda la arquitectura transformer decoder-only de la familia Gemma 2, con aproximadamente 2.600 millones de parametros (2B en la nomenclatura de Google) y una ventana de contexto de 8.192 tokens, tal como corresponde al checkpoint `gemma-2-2b-it` original. El ajuste se ha realizado con la libreria TRL (version 1.17.1) mediante SFT, y los pesos se distribuyen en formato safetensors (1,3 GB en el repositorio).

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de micro-ajuste comunitario sobre Gemma 2 para tareas de tool calling, y permite evaluar si un modelo de 2B puede asumir razonamiento multi-paso con herramientas en entornos con recursos restringidos. No obstante, la ausencia de model card detallada, benchmarks, licencia explicita y datos de entrenamiento obliga a tratarlo como un experimento preliminar (version V0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2, heredada de google/gemma-2-2b-it) |
| Parametros totales | Aproximadamente 2.600 millones (2B, segun el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; se puede cuantizar a GGUF/AWQ/BnB por conversion externa, aunque no esta documentado por el autor) |
| Idiomas soportados | No disponible (heredados del modelo base Gemma 2: principalmente ingles y multilingue parcial, sin confirmacion del autor) |
| Licencia | No disponible (la model card indica "licence: license" sin especificar; el modelo base Gemma 2 usa Gemma Terms of Use) |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint instruct `google/gemma-2-2b-it`. La arquitectura subyacente es un transformer decoder-only con atencion por ventanas alternas (local/global), normalizacion RMSNorm y activaciones GeGLU, propia de la familia Gemma 2. El contexto maximo es de 8.192 tokens. No se ha modificado la arquitectura: el ajuste consiste en una actualizacion de pesos sobre el modelo original.

El entrenamiento se realizo con TRL 1.17.1 (SFTTrainer) sobre Transformers 5.22.2, PyTorch 2.14.1+cu126, Datasets 5.2.0 y Tokenizers 0.23.3. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni hiperparametros (learning rate, epochs, batch size). El nombre del repositorio indica que el dataset esta orientado a "thinking" y "function_calling", pero no se aporta ninguna descripcion del mismo. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct.
- Razonamiento explicito tipo "thinking" (segun el nombre del modelo; no verificado en la model card).
- Function calling / tool calling (segun el nombre del modelo; no verificado con ejemplos ni esquemas en la model card).
- Razonamiento multi-paso y potencial uso en agentes (presunto, no documentado por el autor).
- Capacidades multilingues parciales heredadas de Gemma 2 (no confirmadas para este checkpoint).
- Capacidades de codigo y matematicas basicas heredadas del modelo base (no evaluadas en este ajuste).
- No se documenta soporte de vision, audio ni modo thinking estructurado con tokens especiales.

## Casos de uso

- Prototipado de agentes con tool calling en local: el modelo puede recibir un esquema de funciones y emitir llamadas en formato JSON, lo que permite construir asistentes que consulten APIs o bases de datos en entornos de desarrollo con una sola GPU consumer.
- Asistentes conversacionales de bajo coste: con 2B de parametros y 8.192 tokens de contexto, es viable desplegar un chatbot multi-turno en una RTX 3060/4060 con cuantizacion de 4 bits, adecuado para demos y entornos internos.
- Evaluacion de tecnicas de razonamiento explicito: util para investigadores que quieran comparar respuestas con y sin traza de "thinking" en un modelo pequeno antes de escalar a modelos mayores.
- Generacion de codigo asistida en pipelines ligeros: puede integrarse en editores o scripts de CI/CD para autocompletar funciones o generar tests, siempre con revision humana dado el tamano reducido del modelo.
- Extraccion de informacion estructurada: con function calling, puede transformar texto libre en llamadas a funciones tipadas (por ejemplo, rellenar formularios o clasificar tickets) en sistemas con latencia estricta.
- Educacion y experimentacion: sirve como caso de estudio de SFT con TRL sobre Gemma 2, util para aprender a reproducir el pipeline de ajuste y evaluar el impacto de datasets especificos.
- Filtrado y enrutado previo en sistemas RAG: por su bajo coste, puede decidir si una consulta requiere recuperacion o invocar una herramienta antes de pasar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 8-10 GB para contexto moderado.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 2,7 GB de pesos, 4-6 GB totales.
- VRAM estimada en cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 1,5-2 GB de pesos, 3-4 GB totales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, en RTX 3060/4060/4070/4090 con cuantizacion o incluso en FP16 en tarjetas de 12 GB o mas.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF), SGLang. El autor solo documenta el uso via `pipeline` de transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dean-ayush/gemma-2-2B-it-thinking-function_calling-V0 | ~2,6B | 8.192 | No disponible | Hugging Face (0 descargas) | Ajuste SFT comunitario sobre Gemma 2 2B IT |
| google/gemma-2-2b-it | ~2,6B | 8.192 | Gemma Terms of Use | Hugging Face, Ollama, Vertex AI | Modelo base oficial, con soporte y evaluaciones publicadas |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | Apache 2.0 | Hugging Face, Ollama | Alternativa ligera con contexto mayor y licencia permisiva |
| Llama-3.2-3B-Instruct | ~3,2B | 131.072 | Llama 3.2 Community License | Hugging Face, Ollama | Contexto muy superior y buen soporte de tool calling |

## Limitaciones y advertencias

- No hay datos publicados de evaluacion: el rendimiento real en function calling y razonamiento "thinking" no esta verificado.
- La model card es practicamente vacia: no se describe el dataset, los hiperparametros ni los criterios de seleccion del checkpoint.
- Licencia no especificada: la model card indica "licence: license" sin detalle; el uso comercial queda sujeto, como minimo, a los Gemma Terms of Use del modelo base, pero el autor no lo aclara.
- Riesgo de alucinacion elevado por el tamano (2B) y por la falta de evaluacion especifica; no apto para produccion sin validacion exhaustiva.
- Idiomas no documentados: aunque Gemma 2 es multilingue parcial, el ajuste puede haber degradado el rendimiento en idiomas distintos del ingles si el dataset SFT era monolingue.
- El nombre sugiere capacidades que no estan demostradas con ejemplos, esquemas de funciones ni tests; tratar como experimental (V0).
- Sin garantias de mantenimiento: 0 descargas y 0 likes en la fecha de publicacion, lo que sugiere un proyecto personal sin soporte.
- No se documenta el formato esperado de las llamadas a funciones (prompt template, esquema JSON), lo que dificulta su integracion directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dean-ayush/gemma-2-2B-it-thinking-function_calling-V0
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Repositorio TRL: https://github.com/huggingface/trl
- Documentacion de Gemma 2: https://ai.google.dev/gemma/docs
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
