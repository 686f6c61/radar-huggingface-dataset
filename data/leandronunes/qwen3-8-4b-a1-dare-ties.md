# leandronunes/qwen3.8-4b-a1-dare-ties

## Resumen

Qwen3.8-4B-A1-DARE-TIES es un modelo de lenguaje multimodal (VLM) de 4.659.865.088 parametros publicado por el usuario leandronunes en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una fusion de pesos (model merge) construida con el metodo DARE-TIES sobre el modelo base Qwen/Qwen3.5-4B, combinando empero-ai/Qwen3.8-4B-Distill con un peso de 0,7 e InternScience/Agents-A1-4B con un peso de 0,3, con densidad 0,7 y semilla 42. El objetivo declarado es aunar la deduccion logica del primero (78% en BBH Logical Deduction) con la capacidad agentica del segundo (38% en BBH Causal Judgement).

El modelo emplea una arquitectura hibrida con atencion lineal: por cada bloque de cuatro capas, tres son `linear_attention` basadas en Gated DeltaNet y una es `full_attention`, patron repetido ocho veces (32 capas de lenguaje). Ademas incorpora una torre de vision de 24 bloques, lo que lo habilita para tareas de imagen-texto-a-texto. Su ventana de contexto alcanza los 262.144 tokens (256K), una cifra muy superior a la de la mayoria de modelos de su tamano, y soporta un modo de razonamiento extendido (thinking mode) desactivable mediante `enable_thinking=False`.

Su relevancia es fundamentalmente experimental: es un merge reciente (publicado el 22 de septiembre de 2026), sin descargas ni valoraciones, con los benchmarks del propio merge aun "a medir" segun su model card. Resulta interesante como caso de estudio de tecnicas de fusion de pesos aplicadas a modelos multimodales con atencion hibrida, y como punto de partida para evaluar si la combinacion de capacidades deductivas y agenticas se mantiene tras el merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal: 3 capas `linear_attention` (Gated DeltaNet) + 1 capa `full_attention` por bloque, repetido 8 veces (32 capas de lenguaje); torre de vision de 24 bloques |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | bf16 nativo; la model card documenta uso con BitsAndBytes NF4 4-bit (`load_in_4bit`, `bnb_4bit_quant_type="nf4"`, doble cuantizacion). No se publican pesos GGUF ni GPTQ/AWQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (heredada de Qwen3.5-4B, segun la model card) |
| Formato de pesos | safetensors, precision bf16, 2 shards (5,01 GB + 3,67 GB; 8,68 GB en total). Tamano del repositorio: 9,3 GB |

## Arquitectura y entrenamiento

No hay entrenamiento implicito en este modelo: se trata de una fusion de pesos mediante DARE-TIES (Drop And REscale combinado con Trim, Elect Sign and Merge). El proceso parte de Qwen/Qwen3.5-4B como base, toma los deltas de dos modelos fuente y los combina con pesos 0,7 (empero-ai/Qwen3.8-4B-Distill) y 0,3 (InternScience/Agents-A1-4B), aplicando una densidad de 0,7 (se conserva aproximadamente el 70% de los parametros delta y se reescalan los restantes) con semilla fija 42. El resultado se serializa en dos shards safetensors en bf16, 8,68 GB en total. La model card no detalla el dataset de calibracion del merge ni si se realizo alguna evaluacion posterior.

La arquitectura subyacente, heredada de la familia Qwen3.5, es un transformer hibrido que intercala atencion lineal y atencion completa. El patron es de 3 capas de `linear_attention` implementadas con Gated DeltaNet seguidas de 1 capa de `full_attention`, repetido 8 veces hasta completar 32 capas. Este diseno reduce el coste computacional y de memoria del cache de clave-valor en contextos largos, lo que hace viable la ventana de 256K tokens. El modelo incorpora ademas una torre de vision de 24 bloques, y soporta thinking mode (razonamiento extendido) que puede desactivarse pasando `enable_thinking=False` a `apply_chat_template`. La model card menciona `attn_implementation="sdpa"` y `trust_remote_code=True` como ajustes recomendados de carga.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantillas de chat via `apply_chat_template`.
- Razonamiento extendido (thinking mode) activable o desactivable, orientado a tareas de deduccion logica y razonamiento causal.
- Capacidades multimodales de imagen-texto-a-texto: la torre de vision de 24 bloques permite procesar imagenes junto a texto, pese a que el `pipeline_tag` declarado sea `text-generation`.
- Razonamiento cientifico y biologico: los tags del modelo incluyen `scientific-reasoning`, `causal-reasoning` y `biology`, y la model card reporta un 88% de rendimiento en un benchmark de "Medicina" para ambos modelos padre (metrica no especificada).
- Capacidad agentica, heredada de InternScience/Agents-A1-4B, orientada a flujos de varios pasos.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos o historiales de conversacion muy largos.
- Soporte de cuantizacion en 4-bit (NF4 con doble cuantizacion) para despliegue con recursos limitados.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Analisis de articulos cientificos completos: con 256K tokens de contexto, el modelo puede ingerir un paper entero junto a sus figuras y tablas (via torre de vision) y generar resumenes o extraer conclusiones sin fragmentar el documento.
- Asistencia en investigacion biomedica: dado el enfasis declarado en biologia y razonamiento causal, encaja en tareas de interpretacion de literatura experimental, propuesta de hipotesis causales y revision de protocolos.
- Razonamiento logico asistido: el objetivo del merge es preservar el 78% en BBH Logical Deduction del modelo padre, por lo que resulta util en tareas de deduccion formal, resolucion de silogismos y verificacion de consistencia de argumentos.
- Agentes de varios pasos sobre documentacion tecnica: la combinacion con la capacidad agentica de Agents-A1-4B permite construir bucles de razonamiento y accion sobre repositorios, manuales o bases de conocimiento extensas.
- Procesamiento de documentos escaneados con diagramas: al ser multimodal, puede extraer informacion de capturas, esquemas tecnicos o graficos y continuar el razonamiento en texto.
- Prototipado e investigacion sobre fusion de modelos: sirve como punto de partida reproducible (density 0,7, seed 42, pesos documentados) para estudiar el efecto de DARE-TIES en arquitecturas hibridas multimodales.
- Despliegue en hardware de gama de consumo: con cuantizacion 4-bit ocupa unos pocos gigabytes, lo que permite ejecutar tareas de analisis de documentos largos en una unica GPU de 12-16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del merge en la informacion disponible. La model card solo incluye las cifras de los modelos padre y marca explicitamente las del merge como "a medir".

| Modelo | BBH Logical Deduction | BBH Causal Judgement | Medicina (metrico no especificado) |
|---|---|---|---|
| empero-ai/Qwen3.8-4B-Distill | 78% | 46% | 88% |
| InternScience/Agents-A1-4B | 26% | 38% | 88% |
| Qwen3.8-4B-A1-DARE-TIES (este merge) | no medido | no medido | no medido |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (el repositorio pesa 8,68 GB en bf16, mas cache de clave-valor y activaciones):
  - bf16/fp16: en torno a 9-10 GB solo para pesos, mas el cache. La atencion hibrida con Gated DeltaNet reduce el crecimiento del cache respecto a un transformer de atencion completa, pero a 256K tokens el consumo sigue siendo elevado.
  - 8-bit: aproximadamente 5 GB para pesos.
  - 4-bit NF4 (con doble cuantizacion, la configuracion documentada): aproximadamente 2,7-3 GB para pesos.
- GPU recomendadas: para bf16 en contexto completo, A100 40/80 GB, H100 o L40S. Para 4-bit con contextos moderados, RTX 3090/4090 (24 GB), RTX 4080 (16 GB), RTX 4060 Ti 16 GB o RTX 3060 12 GB.
- Cabe en GPU de consumo: si. En 4-bit entra con holgura en cualquier GPU de 12 GB o mas; en bf16 es ajustado en 12 GB y comodo a partir de 16 GB, siempre que el contexto no sea muy largo.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`, con `trust_remote_code=True` y `attn_implementation="sdpa"`, tal como documenta la model card), BitsAndBytes para cuantizacion en carga, y endpoints compatibles segun el tag `endpoints_compatible`. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa; tampoco se confirma compatibilidad con vLLM, SGLang o TGI.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Razonamiento (BBH) | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-4B-A1-DARE-TIES | ~4,66 B | 262.144 tokens | Apache 2.0 | no medido | Repositorio safetensors, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo publico de Qwen |
| empero-ai/Qwen3.8-4B-Distill | no disponible | no disponible | no disponible | 78% deduccion / 46% causal | Modelo publico |
| InternScience/Agents-A1-4B | no disponible | no disponible | no disponible | 26% deduccion / 38% causal | Modelo publico |

La comparativa es limitada porque la informacion proporcionada no incluye las especificaciones tecnicas, contextos ni licencias de los modelos padre. El unico diferencial confirmado de este merge frente a sus fuentes es la combinacion ponderada de capacidades y el contexto de 256K que hereda de la arquitectura Qwen3.5.

## Limitaciones y advertencias

- El modelo esta declarado unicamente para ingles (`language: en`). El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- No se ha publicado ninguna evaluacion del merge. Las cifras de la model card corresponden a los modelos padre y no permiten predecir el comportamiento del resultado.
- El merge tiene 0 descargas y 0 valoraciones en el momento de redactar esta ficha, por lo que no existe validacion por parte de la comunidad.
- Riesgo de alucinacion inherente a los modelos de ~4B de parametros, especialmente en tareas cientificas o medicas donde las afirmaciones pueden sonar plausibles sin ser correctas. El dato del 88% en "Medicina" proviene de los modelos padre y su metodologia no se detalla.
- Un merge de pesos DARE-TIES puede degradar capacidades de forma no lineal: al combinar dos modelos con perfiles de rendimiento muy distintos (78% frente a 26% en deduccion), es posible que el resultado no alcance a ninguno de los dos en la tarea objetivo.
- No se documenta soporte de tool calling, function calling ni integracion con frameworks de agentes, a pesar del tag agentico del modelo fuente.
- La licencia declarada es Apache 2.0, heredada de Qwen3.5-4B, pero al tratarse de una fusion de tres modelos conviene verificar las condiciones de cada modelo fuente antes de un uso comercial, especialmente las de empero-ai/Qwen3.8-4B-Distill, cuya licencia no consta en la informacion disponible.
- El campo `pipeline_tag` es `text-generation`, pero los tags incluyen `image-text-to-text` y la model card confirma la presencia de torre de vision: el soporte multimodal existe, aunque su calidad no esta evaluada.
- La fecha de creacion del repositorio (2026-09-22) es posterior a los modelos base declarados; conviene verificar la procedencia y trazabilidad de los pesos antes de usarlos en produccion.
- Requiere `trust_remote_code=True` para la carga con transformers, lo que implica ejecutar codigo del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leandronunes/qwen3.8-4b-a1-dare-ties
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo fuente 1: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Modelo fuente 2: https://huggingface.co/InternScience/Agents-A1-4B
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos corresponden a la pelicula para television "The Wild Women of Chastity Gulch" (1982) y no guardan relacion con el modelo. No se dispone de papers, blogs, repositorios de codigo ni demos adicionales.
