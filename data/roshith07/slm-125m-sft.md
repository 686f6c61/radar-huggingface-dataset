# roshith07/slm-125m-sft

## Resumen

slm-125m-sft es un modelo de lenguaje de 125,8 millones de parámetros con arquitectura Llama, resultado de un ajuste fino supervisado (SFT) completo sobre el modelo base thesreedath/slm-125m-base. Lo desarrolla el usuario roshith07 y está especializado en respuesta a preguntas con fundamento documental (grounded QA) y resumen extractivo sobre texto legal y financiero: opiniones judiciales de EE. UU., presentaciones ante la SEC y páginas web educativas. Su rasgo diferencial es que responde únicamente a partir del pasaje que recibe y declara explícitamente cuándo la respuesta no está en el texto.

El modelo es relevante por su tamaño reducido y su enfoque de dominio: demuestra que un transformer de 125M puede seguir con fiabilidad un formato de chat con tokens especiales y una política estricta de "solo el contexto", algo útil para pipelines de extracción documental de bajo coste donde no es viable desplegar modelos de miles de millones de parámetros. El ajuste fino se realizó en una sola H100 durante 2,58 minutos, lo que subraya el carácter ligero del entrenamiento.

Las cifras de validación publicadas por el autor muestran una reducción de la pérdida de 3,0365 (perplejidad 20,83) en el modelo base a 1,2466 (perplejidad 3,48) en este checkpoint, medido sobre tokens de respuesta. La longitud de contexto es de 1.024 tokens y el modelo solo admite inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (arquitectura Llama, según tags del repo) |
| Parametros totales | 125.848.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | other, "same-as-base-model" (sujeta a la licencia de thesreedath/slm-125m-base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa de tipo Llama con 125,8M de parámetros. Se trata de un ajuste fino completo (full fine-tune) del modelo base thesreedath/slm-125m-base, no de un adaptador LoRA ni de una destilación. El entrenamiento se ejecutó en una única GPU H100 con autocast en bf16, optimizador AdamW (lr 5e-5, decaimiento coseno hasta el 10 %, 3 % de warmup, weight decay 0,01), batch de 32 secuencias y 3 épocas planificadas (1.233 pasos, 18.672.483 tokens procesados, 1.523.406 tokens con pérdida). La pérdida se calcula solo sobre los tokens del asistente. El checkpoint publicado corresponde al paso 411 (final de la época 1), el de menor pérdida de validación; las épocas 2 y 3 sobreajustaron.

Los datos de entrenamiento son 13.809 ejemplos sintéticos (13.128 de entrenamiento y 681 de validación, divididos por pasaje) generados a partir de 3.500 pasajes del corpus de preentrenamiento, compuesto por un 40 % de jurisprudencia, un 40 % de documentos SEC y un 20 % de FineWeb-Edu. La mezcla incluye 9.726 ejemplos de QA fundamentado (10 tipos de pregunta, 3 niveles de dificultad), 3.000 resúmenes (5 formatos) y 1.083 preguntas del tipo "no está en el texto". Los ejemplos se generaron con gpt-4o-mini y Gemini flash-lite y se filtraron con un juez LLM (gpt-5-nano y Gemini) más comprobaciones de código: evidencia presente en el pasaje, formato correcto, ausencia de filtraciones entre pasajes, referencias meta y eliminación de duplicados exactos y casi duplicados por embeddings. El modelo usa un formato de prompt con tokens especiales `<|bos|>`, `<|system|>`, `<|user|>`, `<|assistant|>` y `<|eos|>` (id 1).

## Capacidades

- Generación de texto condicionada a un pasaje de contexto, con respuesta extractiva y fundamentada.
- Respuesta a preguntas sobre texto legal y financiero (10 tipos de pregunta distintos en el entrenamiento).
- Resumen de documentos en cinco formatos distintos.
- Abstención explícita: declara cuándo la respuesta no está en el texto proporcionado (1.083 ejemplos de este tipo en el entrenamiento).
- Seguimiento de un system prompt fijo orientado a la cautela legal y financiera.
- Formato conversacional de un solo turno con plantilla de chat propia (system, user, assistant).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido, según la información disponible.
- Capacidad multilingüe: solo inglés.

## Casos de uso

- Extracción de respuestas en revisión documental legal: dado un fragmento de una sentencia o un contrato, el modelo localiza la respuesta a preguntas concretas (partes implicadas, fechas, importes) y se abstiene si el dato no aparece, lo que encaja en flujos de revisión asistida donde cada respuesta debe verificarse contra la fuente.
- Resumen de presentaciones ante la SEC: el modelo puede condensar secciones de un filing en uno de los cinco formatos de resumen con los que fue entrenado, útil para generar borradores de fichas o alertas internas de cumplimiento.
- Clasificación y triaje de consultas legales internas: con contexto de 1.024 tokens, puede procesar fragmentos cortos de normativa o correspondencia y responder preguntas acotadas, integrándose en un pipeline que trocee los documentos antes de la inferencia.
- Enriquecimiento de bases de conocimiento: generar pares pregunta-respuesta fundamentados a partir de pasajes ya indexados, con la ventaja de que el modelo marca explícitamente los casos sin respuesta, lo que reduce anotaciones erróneas.
- Filtrado de alucinaciones en sistemas RAG: por su política de abstención, puede usarse como verificador ligero que comprueba si un pasaje contiene la evidencia necesaria antes de invocar un modelo mayor, ahorrando coste en cascada.
- Despliegue en entornos con recursos limitados: con 125,8M de parámetros y pesos en safetensors de 0,5 GB, cabe en CPU y en GPUs de consumo, lo que permite prototipos locales de asistencia documental sin infraestructura dedicada.
- Generación de resúmenes educativos: a partir de páginas de FineWeb-Edu, puede producir resúmenes breves para materiales de formación, siempre con verificación humana por las limitaciones del tamaño.

## Benchmarks y rendimiento

El autor solo publica métricas de validación (pérdida y perplejidad sobre tokens de respuesta), no resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Modelo | Pérdida de validación (tokens de respuesta) | Perplejidad |
|---|---|---|
| thesreedath/slm-125m-base | 3,0365 | 20,83 |
| roshith07/slm-125m-sft (este modelo) | 1,2466 | 3,48 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 0,25 GB para los pesos (125,8M parámetros); en fp32, unos 0,5 GB. El repo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el entrenamiento se realizó en una H100, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series antiguas), GTX con suficiente VRAM e incluso en CPU.
- Opciones de despliegue: transformers (el autor incluye ejemplo con AutoTokenizer, AutoModelForCausalLM y apply_chat_template). No se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (2,58 minutos en una H100), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| roshith07/slm-125m-sft | 125,8M | 1.024 | Inglés | other (same-as-base-model) | QA fundamentado y resumen legal/financiero |
| thesreedath/slm-125m-base | 125M (aprox.) | no disponible | no disponible | no disponible | Modelo base sin ajuste de instrucciones |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | Inglés (principalmente) | Apache 2.0 | Modelo pequeño de propósito general |
| Qwen2.5-0.5B | 494M | 32.768 | Multilingüe | Apache 2.0 (mayoría de variantes) | Modelo pequeño de propósito general |

La comparación con SmolLM-135M y Qwen2.5-0.5B se ofrece como referencia de categoría (modelos de menos de 1.000M de parámetros); no se dispone de benchmarks comparativos directos publicados por el autor de slm-125m-sft. La ventaja de este modelo es su especialización y su política de abstención; su desventaja es el contexto corto (1.024 tokens) y el soporte exclusivo de inglés.

## Limitaciones y advertencias

- Tamaño reducido: con 125M de parámetros comete errores factuales, como calificativos incorrectos u ocasionalmente detalles no respaldados por el texto, según reconoce el propio autor.
- No debe usarse como asesoramiento legal o financiero; las respuestas deben verificarse contra el texto fuente.
- Contexto limitado a 1.024 tokens, lo que obliga a trocear documentos largos y puede perder información entre fragmentos.
- Solo inglés: no admite consultas ni pasajes en castellano u otros idiomas.
- Licencia "other" sujeta a la del modelo base thesreedath/slm-125m-base; es necesario revisar esa licencia antes de cualquier uso comercial, y la información disponible no detalla sus términos.
- Riesgo de alucinación residual pese al entrenamiento de abstención; el filtrado de datos con LLM jueces no elimina todos los errores.
- Entrenado con datos sintéticos generados por modelos propietarios (gpt-4o-mini, Gemini flash-lite), lo que puede introducir sesgos y estilo de esos generadores.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso; no apto para flujos agénticos.
- El checkpoint publicado corresponde al final de la primera época porque las siguientes sobreajustaron; el margen de mejora con más datos es limitado sin cambios en el corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roshith07/slm-125m-sft
- Modelo base: https://huggingface.co/thesreedath/slm-125m-base
- Licencia del modelo base: https://huggingface.co/thesreedath/slm-125m-base (license_link indicado en la model card)
