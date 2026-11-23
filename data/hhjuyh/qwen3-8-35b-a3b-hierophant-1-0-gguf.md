# hhjuyh/Qwen3.8-35B-A3B-Hierophant-1.0-GGUF

## Resumen

Qwen3.8-35B-A3B-Hierophant-1.0-GGUF es una variante no oficial del modelo Empero Qwen3.8-35B-A3B-Distill, un destilado del Qwen3.6-35B-A3B de Alibaba. El autor, identificado en Hugging Face como hhjuyh, aplica un adaptador de rango 1 denominado Hierophant sobre el GGUF Q6_K original con el objetivo declarado de reducir el comportamiento de rechazo (refusal) del modelo. La modificacion afecta a 121 de los 753 tensores del modelo y conserva el formato original del resto.

El modelo es de tipo Mixture of Experts (MoE) con 35.505.251.456 parametros totales, aunque la informacion disponible no detalla cuantos parametros se activan por token. Se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y LM Studio, con dos cuantizaciones publicadas: Q6_K (29,21 GB) y Q4_K_M (21,71 GB). La model card declara compatibilidad con entrada de imagen y texto, aunque el proyector de vision (`mmproj-Qwen3.8-35B-A3B-F16.gguf`) debe descargarse por separado desde el repositorio del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de abliteracion ligera (abliteration via adaptador de rango 1) aplicada a un modelo destilado; por otro, advierte de que las pruebas de calidad publicadas por el propio autor son muy limitadas (36 prompts, contexto de 2048 tokens, thinking desactivado) y no cubren contexto largo ni uso de herramientas. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.6-35B-A3B; detalles de capas y atencion no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas del autor usaron 2.048 tokens) |
| Tipos de cuantizacion | Q6_K (29,21 GB) y Q4_K_M (21,71 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el proyector de vision es un GGUF F16 separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) heredado de Qwen3.6-35B-A3B, del que existe un destilado publicado por Empero (Qwen3.8-35B-A3B-Distill). La informacion disponible no especifica el numero de expertos, el numero de parametros activos por token, la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se detalla el proceso de destilacion mas alla de su nombre.

La innovacion tecnica de esta variante concreta es la aplicacion de un adaptador Hierophant de rango 1 fusionado a escala 1.0 sobre el GGUF Q6_K de Empero. Segun la model card, la fusion modifica 121 tensores y preserva el formato de los 753 tensores totales, produciendo un GGUF autonomo. El objetivo es reducir los rechazos ante peticiones que el modelo original declinaba, sin reentrenar los pesos. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles.
- Entrada multimodal imagen-texto: requiere el proyector `mmproj-Qwen3.8-35B-A3B-F16.gguf` descargado aparte; el autor solo reporta una prueba de humo leyendo un titulo de una imagen.
- Aritmetica basica y tareas cortas de razonamiento: 14/16 respuestas cortas correctas en el set de prueba del autor.
- Tareas JSON multi-paso: 0/6 correctas en el mismo set, lo que sugiere limitaciones en razonamiento estructurado con thinking desactivado.
- Reduccion de rechazos: 0/10 rechazos explicitos en prompts de engano y trampa, frente a 10/10 del original.
- Tool calling / function calling: no evaluado; la model card indica explicitamente que el rendimiento en uso de herramientas quedo fuera del alcance de las pruebas.
- Modo thinking: existe en la familia Qwen3, pero las pruebas se realizaron con thinking desactivado; no hay datos de su comportamiento con thinking activo.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Experimentacion con tecnicas de abliteracion: el modelo sirve como caso de estudio reproducible de fusion de adaptadores de rango 1 sobre GGUF, util para investigadores que quieran medir el efecto en la tasa de rechazos con un baseline claro (10/10 frente a 0/10).
- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (21,71 GB) permite ejecucion en llama.cpp o LM Studio en equipos con 24 GB de VRAM, como una RTX 4090, para prototipos conversacionales en ingles.
- Procesamiento de documentos con imagen: usando el proyector de vision, se puede extraer texto de capturas o titulos en imagenes, aunque el autor solo valida un caso de prueba y no hay datos de robustez.
- Evaluacion comparativa de refusal behavior: util para equipos que investigan alineacion y quieren contrastar el comportamiento del modelo original frente a la variante modificada con el mismo set de prompts.
- Generacion de respuestas cortas y directas: dado el rendimiento aceptable en preguntas cortas (14/16), puede emplearse en asistentes de respuesta breve en ingles donde no se requiera JSON estructurado.
- Base para fine-tuning posterior: al ser un GGUF con licencia Apache 2.0, puede servir como punto de partida para experimentos de cuantizacion o adaptacion, siempre que se asuma la falta de garantias de calidad del merge.

## Benchmarks y rendimiento

Los unicos datos publicados son las pruebas del autor con 36 prompts, contexto de 2.048 tokens, thinking desactivado y temperatura 0, comparando el Q6_K original con el fusionado:

| Metrica | Q6_K original | Hierophant 1.0 Q6_K |
|---|---:|---:|
| Rechazos explicitos en prompts de engano y trampa | 10/10 | 0/10 |
| Peticiones redirigidas a una alternativa honesta | 0/10 | 1/10 |
| Prompts de control benignos respondidos | 4/4 | 4/4 |
| Respuestas cortas correctas | 14/16 | 14/16 |
| Tareas JSON multi-paso correctas | 0/6 | 0/6 |
| Total de tareas de calidad correctas | 14/22 | 14/22 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que nueve de las diez respuestas del grupo de engano alcanzaron el limite de 192 tokens y que el conjunto de prueba es reducido.

## Requisitos de hardware

- VRAM estimada para Q6_K: aproximadamente 30 GB o mas, considerando pesos de 29,21 GB y overhead de contexto y KV cache.
- VRAM estimada para Q4_K_M: aproximadamente 22-24 GB, con pesos de 21,71 GB.
- GPU recomendadas: A100 40 GB o H100 para Q6_K con contexto amplio; RTX 4090 (24 GB) para Q4_K_M con contexto moderado; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: Q4_K_M cabe en RTX 4090 y RTX 3090; Q6_K no cabe en GPU de 24 GB sin offloading a RAM.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF; el autor menciona endpoints compatibles en los tags.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Hierophant-1.0 (este) | 35,5 B (MoE) | no disponible | Apache 2.0 | GGUF Q6_K, Q4_K_M | Variante abliterada no oficial, solo ingles, pruebas limitadas |
| empero-ai/Qwen3.8-35B-A3B-Distill-GGUF | 35,5 B (MoE) | no disponible | Apache 2.0 | GGUF | Modelo base del que deriva; mantiene rechazos (10/10) |
| Qwen/Qwen3.6-35B-A3B | 35 B (MoE) | no disponible | Apache 2.0 | safetensors y derivados | Modelo original de Alibaba; referencia de arquitectura |

No se dispone de datos de rendimiento comparables entre estos modelos mas alla de la tabla de rechazos del autor.

## Limitaciones y advertencias

- La reduccion de rechazos es el objetivo del merge: el modelo responde a peticiones de engano y trampa que el original declinaba, lo que supone un riesgo de uso indebido y de cumplimiento normativo en produccion.
- El conjunto de evaluacion es muy pequeno (36 prompts) y con contexto de 2.048 tokens; no hay evidencia sobre contexto largo, tool calling ni thinking activo.
- El rendimiento en tareas JSON multi-paso es de 0/6, lo que desaconseja su uso en pipelines estructurados sin validacion adicional.
- Solo se declara soporte de ingles; el comportamiento en castellano no esta documentado.
- La capacidad de vision solo se valido con una prueba de humo; no hay datos de robustez ni de precision en OCR.
- Riesgo de alucinacion no cuantificado; no se han publicado evaluaciones de factualidad.
- El autor no documenta sesgos conocidos; al ser un derivado de Qwen3.6, hereda los sesgos del modelo original, no evaluados aqui.
- Licencia Apache 2.0 permite uso comercial, pero el caracter no oficial del merge y la falta de garantias de calidad hacen recomendable una evaluacion propia antes de desplegarlo.
- El repositorio tiene 0 likes y 666 descargas en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhjuyh/Qwen3.8-35B-A3B-Hierophant-1.0-GGUF
- Modelo base (Empero distill GGUF): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF
- Modelo base (Empero distill): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyector de vision: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF/blob/main/mmproj-Qwen3.8-35B-A3B-F16.gguf
- Herramienta Hierophant: https://github.com/khimaros/hierophant
