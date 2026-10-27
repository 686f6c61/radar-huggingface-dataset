# liodon-ai/Llama-3.2-3B-Instruct-FP8

## Resumen

Llama-3.2-3B-Instruct-FP8 es una cuantizacion en punto flotante de 8 bits del modelo Llama-3.2-3B-Instruct de Meta, publicada por el usuario liodon-ai. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: mantiene la arquitectura y los pesos del modelo base de Unsloth (a su vez derivado de Meta Llama 3.2) y unicamente reduce la precision numerica de los pesos y activaciones para disminuir el consumo de memoria y aumentar el rendimiento en inferencia.

El modelo resuelve el problema del coste de despliegue de un LLM de 3.200 millones de parametros en produccion. Frente a los 6,4 GB del checkpoint original en BF16, esta version ocupa 3,6 GB en disco, lo que permite servirlo en GPUs de gama media y reduce a la mitad la VRAM necesaria para pesos. Es relevante porque emplea el esquema `FP8_DYNAMIC` de compressed-tensors, compatible de forma nativa con vLLM, TGI y SGLang, y no requiere dataset de calibracion.

La cuantizacion la ha realizado Liodon AI con la herramienta llm-compressor del proyecto vLLM. El repositorio no incluye información sobre idiomas soportados ni resultados de evaluacion propios, y la licencia se declara como "other", heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), densa |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3.2-3B-Instruct soporta 128k tokens; no confirmado en esta ficha) |
| Tipos de cuantizacion | FP8 E4M3, esquema `FP8_DYNAMIC` de compressed-tensors: pesos en FP8 por canal, activaciones en FP8 dinamico por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | safetensors (compatible con transformers, vLLM, TGI y SGLang) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura original de Llama 3.2 3B Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y 3.212.749.824 parametros totales. No hay entrenamiento adicional ni ajuste fino en esta publicacion; el autor solo aplica cuantizacion post-entrenamiento sobre los pesos de unsloth/Llama-3.2-3B-Instruct.

La innovacion tecnica es el esquema de cuantizacion. Los pesos se convierten a FP8 (formato E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Al no necesitar conjunto de calibracion, los pesos cuantizados son un casteo directo del original, sin sesgo introducido por datos de calibracion. La capa `lm_head` se deja en su precision original porque su tamano es despreciable y cuantizarla degradaria la calidad de forma desproporcionada. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni las fases de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional e instrucciones, al ser la variante Instruct del modelo base.
- Razonamiento basico y respuesta a preguntas en formato chat.
- Generacion de codigo y tareas de transformacion de texto, con limitaciones propias de un modelo de 3B.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en esta ficha).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Inferencia acelerada en FP8 sobre GPUs con compute capability igual o superior a 8.9.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en entornos con recursos limitados, ya que sus 3,6 GB de pesos permiten desplegarlo en una unica GPU de gama media sin sacrificar el formato chat.
- Clasificacion y extraccion de informacion: util para pipelines de etiquetado de documentos, resumen de tickets o extraccion de entidades donde se prioriza el coste por token sobre el razonamiento complejo.
- Generacion de codigo asistida en IDE: su tamano reducido permite servirlo con baja latencia para autocompletado y explicaciones de fragmentos, integrado mediante la API compatible con OpenAI de vLLM.
- Prototipado rapido de agentes: al soportar tool calling, sirve para validar flujos de agentes multi-paso antes de migrar a modelos mayores, con un coste de infraestructura minimo.
- Despliegue en edge o servidores con una sola GPU: gracias a la cuantizacion FP8, cabe en tarjetas de 24 GB o menos con margen para el KV cache, lo que habilita inferencia local en laboratorios y equipos de desarrollo.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad frente al modelo en BF16 en tareas concretas del dominio propio antes de adoptar FP8 en produccion.
- Backend de bajo coste para TGI: la imagen oficial de Text Generation Inference puede arrancar el modelo con un solo comando, lo que facilita entornos de staging y demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. Como referencia externa, la model card de RedHatAI para su propia cuantizacion FP8 del mismo modelo base cita una retencion del 99,7% de las capacidades del modelo original, pero ese dato corresponde a otro checkpoint y no debe atribuirse a esta publicacion de liodon-ai.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 3,2 GB en FP8, frente a unos 6,4 GB en BF16.
- VRAM total recomendada: 8-12 GB para contextos cortos con KV cache moderado; 16-24 GB para contextos largos o lotes concurrentes elevados.
- GPUs con soporte nativo FP8 (compute capability igual o superior a 8.9): RTX 4090, RTX 4080, L4, L40S, H100, H200, B100 y B200.
- GPUs consumer: cabe en RTX 4090, RTX 4080 y tarjetas de 12 GB o mas; en GPUs anteriores a Ada, vLLM y TGI descomprimen a BF16 y se pierde la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (imagen oficial de Hugging Face), SGLang (`sglang.launch_server`) y transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Llama-3.2-3B-Instruct-FP8 | 3.212.749.824 | no disponible | FP8 dinamico, 3,6 GB | other | Hugging Face |
| RedHatAI/Llama-3.2-3B-Instruct-FP8 | 3.212.749.824 (mismo base) | no disponible | FP8, pesos y activaciones | other (Llama 3.2) | Hugging Face |
| unsloth/Llama-3.2-3B-Instruct (base) | 3.212.749.824 | no disponible | BF16, 6,4 GB | other (Llama 3.2) | Hugging Face |
| liodon-ai/Llama-3.2-1B-Instruct-FP8 | no disponible | no disponible | FP8 | other | Hugging Face |

La diferencia practica entre esta publicacion y la de RedHatAI es el autor y el pipeline de cuantizacion; ambas parten del mismo modelo base y buscan el mismo compromiso entre memoria y calidad. Los datos de rendimiento comparado no estan disponibles para confirmar cual retiene mejor la calidad.

## Limitaciones y advertencias

- Modelo de 3B parametros: su capacidad de razonamiento, matemáticas y codigo es limitada frente a modelos de 7B o superiores; no es adecuado para tareas complejas de agentes autonomos.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad para este checkpoint; hereda los sesgos del modelo base de Meta.
- Riesgo de alucinacion: presente, como en cualquier LLM de este tamano, especialmente en preguntas factuales y contextos largos.
- Idiomas: la informacion disponible no detalla la cobertura idiomatica; el modelo base esta orientado principalmente al ingles y a otros idiomas oficialmente soportados por Llama 3.2.
- Licencia "other": es necesario revisar los terminos de la licencia comunitaria de Llama 3.2 de Meta antes de cualquier uso comercial, ya que el campo de licencia del repo no detalla condiciones.
- FP8 solo aporta ventajas reales en GPUs Ada o posteriores; en hardware anterior la descompresion anula la mejora de rendimiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad ni de pruebas de calidad publicadas.
- El autor no publica resultados de evaluacion que confirmen la retencion de calidad frente al modelo en BF16.

## Enlaces

- Hugging Face (modelo cuantizado): https://huggingface.co/liodon-ai/Llama-3.2-3B-Instruct-FP8
- Modelo base en Unsloth: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Cuantizacion FP8 alternativa de RedHatAI: https://huggingface.co/neuralmagic/Llama-3.2-3B-Instruct-FP8
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Perfil del autor: https://huggingface.co/liodon-ai
- Otro modelo del autor (1B FP8): https://huggingface.co/liodon-ai/Llama-3.2-1B-Instruct-FP8
