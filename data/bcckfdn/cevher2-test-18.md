# bcckfdn/cevher2-test-18

## Resumen

cevher2-test-18 es un modelo de lenguaje de 1.513.546.496 parametros (~1,51 mil millones) entrenado desde cero por el autor bcckfdn siguiendo la arquitectura de SmolLM2, que a su vez se basa en la familia Llama. El modelo se distribuye bajo licencia Apache 2.0 y esta orientado a generacion de texto conversacional en turco e ingles. Se trata de un checkpoint de investigacion publicado en Hugging Face con cero descargas y cero likes en el momento de la consulta, lo que sugiere un estado experimental o de prueba (el propio identificador incluye "test").

La relevancia tecnica del modelo radica en su enfoque de entrenamiento desde cero (pretrained-from-scratch) con un vocabulario de 65.536 tokens y una ventana de contexto de 8.192 tokens, cifras notables para un modelo de este tamano. El autor reporta un entrenamiento sobre 33.036 millones de tokens (denominado "33.036 B" en la model card) y una mejor perdida de validacion de 2,7292. La arquitectura emplea 34 capas con dimension oculta de 1.792 y atencion agrupada (GQA) con 28 cabezas de consulta y 7 de clave-valor.

El modelo se presenta como un experimento de investigacion mas que como un producto listo para produccion: no se han publicado resultados de benchmarks, no hay informacion sobre el dataset de entrenamiento ni sobre tecnicas de alineacion (RLHF/DPO), y el repositorio no incluye documentacion sobre cuantizaciones o formatos alternativos de pesos. Aun asi, su tamano compacto y su contexto largo lo convierten en un candidato interesante para experimentacion en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama / SmolLM2 |
| Parametros totales | 1.513.546.496 (~1,51 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos arquitectonicos adicionales reportados en la model card:

| Parametro | Valor |
|---|---|
| Capas | 34 |
| Dimension oculta | 1.792 |
| Cabezas de atencion (Q/KV) | 28 / 7 (GQA) |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 33.036 millones |
| Mejor perdida de validacion | 2,7292 |
| Tamano del repositorio | 3,0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolLM2, un transformer decoder-only de tipo Llama con normalizacion RMSNorm, activacion SwiGLU y atencion agrupada (GQA) con una relacion de 4:1 entre cabezas de consulta y de clave-valor (28 Q frente a 7 KV). Esta configuracion reduce el coste de memoria de la cache KV durante la inferencia en comparacion con atencion multi-cabeza completa, lo que resulta relevante para un contexto de 8.192 tokens. El vocabulario de 65.536 tokens es mayor que el de muchos modelos de su tamano, lo que mejora la eficiencia de tokenizacion en turco, un idioma con alta productividad morfologica.

El entrenamiento se realizo desde cero (pretrained-from-scratch) sobre 33.036 millones de tokens, segun la model card. No se especifica la composicion del dataset, la mezcla de idiomas ni si se aplicaron fases de instruccion, RLHF o DPO. La unica metrica de entrenamiento publicada es la mejor perdida de validacion (2,7292), sin detallar la curva de entrenamiento ni el split utilizado. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Conversacion multi-turno (el tag "conversational" aparece en los metadatos del repositorio).
- Razonamiento basico y generacion de texto general, limitado por el tamano de 1,51 mil millones de parametros.
- Soporte de contexto largo de hasta 8.192 tokens, adecuado para documentos y dialogos extensos.
- Capacidades multilingues limitadas a turco e ingles; no se declaran otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo thinking, vision ni audio.
- Compatible con text-generation-inference y endpoints_compatible segun los tags del repositorio.

## Casos de uso

- Experimentacion academica en entrenamiento desde cero: el modelo sirve como referencia reproducible de una receta SmolLM2 de 1,5 mil millones de parametros con contexto de 8K, util para estudiar el efecto de la tokenizacion turca en modelos compactos.
- Generacion de texto en turco para prototipos: con un vocabulario de 65.536 tokens y entrenamiento especifico en turco, puede emplearse para generar borradores de contenido, resumenes o respuestas en aplicaciones de bajo coste donde no se requiere maxima calidad.
- Chatbots de dominio acotado en entornos con GPU de consumo: al ocupar aproximadamente 3 GB en precision FP16, cabe en tarjetas como la RTX 3060 de 12 GB o la RTX 4090, permitiendo desplegar asistentes conversacionales locales sin infraestructura cloud.
- Procesamiento de documentos de hasta 8.192 tokens: la ventana de contexto permite tareas de extraccion o reescritura sobre articulos, correos largos o transcripciones sin truncar, aunque la calidad en tareas complejas sera limitada por el tamano del modelo.
- Base para fine-tuning especifico: al estar bajo Apache 2.0 y en formato safetensors compatible con transformers, puede ajustarse con LoRA o QLoRA para tareas concretas (clasificacion, extraccion de entidades, estilo) partiendo de un checkpoint ya entrenado en turco.
- Evaluacion comparativa de modelos pequenos: util como linea base en estudios de escalado o de eficiencia de tokenizacion frente a modelos multilingues de tamano similar.
- Generacion asistida en ingles para tareas simples: redaccion de textos cortos, parafraseo o respuestas FAQ donde el coste computacional es prioritario sobre la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la mejor perdida de validacion durante el entrenamiento (2,7292), que no es directamente comparable con resultados de MMLU, HumanEval, GSM8K u otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 3,0 GB solo para los pesos, mas la cache KV para 8.192 tokens (con GQA de 7 cabezas KV, el coste adicional es moderado pero no se ha publicado una cifra exacta).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para los pesos; en 4 bits, alrededor de 0,9 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto completo; A100, H100 o L40S para despliegues con mayor throughput o lotes grandes.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16; en GPUs de 8 GB puede requerir cuantizacion o reducir el contexto.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| cevher2-test-18 | 1,51 B | 8.192 | tr, en | Apache 2.0 | No |
| SmolLM2-1.7B | 1,7 B | 8.192 (ampliable) | en (principalmente) | Apache 2.0 | Si (model card oficial) |
| Qwen2.5-1.5B | 1,54 B | 32.768 | multilingue (incluye en, no tr especifico) | Apache 2.0 | Si |
| Llama 3.2-1B | 1,24 B | 131.072 | multilingue (8 idiomas oficiales, no tr) | Llama 3.2 Community License | Si |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de datos de rendimiento de cevher2-test-18 para contrastar calidad. La principal diferencia de cevher2-test-18 es su orientacion explicita al turco con entrenamiento desde cero, frente a alternativas multilingues genericas.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; el entrenamiento desde cero sin documentacion del dataset impide conocer la composicion y los sesgos potenciales.
- Riesgo de alucinacion elevado en tareas de conocimiento factual: con 1,51 mil millones de parametros y 33.036 millones de tokens de entrenamiento, la capacidad de memorizar hechos es limitada.
- Cobertura linguistica restringida a turco e ingles; el rendimiento en otros idiomas no esta garantizado ni documentado.
- El contexto maximo es de 8.192 tokens; no se ha verificado el rendimiento en la parte alta de la ventana (fenomeno de lost in the middle).
- No hay informacion sobre fases de alineacion (RLHF/DPO); las respuestas pueden ser repetitivas, incoherentes o inapropiadas sin un post-procesado o fine-tuning adicional.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks y de documentacion sobre el dataset hace recomendable una evaluacion propia antes de cualquier despliegue en produccion.
- El repositorio tiene cero descargas y cero likes, y el identificador sugiere un estado de prueba; no hay garantia de mantenimiento ni soporte por parte del autor.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que obliga a convertirlos manualmente para despliegues en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-18
- Repositorio SmolLM2 (arquitectura de referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
