# alphaedge-ai/gemma-3-4b-it-ltz-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-ltz-16384` es una variante "trimmed" (podada en vocabulario) del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind, especializada en luxemburgues. La poda reduce el vocabulario original de 262.144 tokens a 16.384 tokens, lo que elimina el 93,75% de las entradas del vocabulario y recorta el numero de parametros totales de 4.300.079.472 a 3.670.770.032 (un 14,63% menos). El resultado es un modelo aproximadamente un 14,63% mas pequeno en disco y en memoria, pensado para despliegues donde el luxemburgues es el idioma principal.

El modelo hereda la arquitectura de Gemma 3 (transformer decoder-only con atencion local/global intercalada y capacidad de entrada imagen-texto), pero su tokenizador solo contiene los tokens mas frecuentes en luxemburgues, minados a partir de 200.000 textos del dataset `lbourdois/fineweb-2-trimming`. Esto implica que el modelo conserva las capacidades del Gemma 3 original para luxemburgues, pero degrada su rendimiento en otros idiomas, ya que los tokens de esos idiomas han sido eliminados del vocabulario.

Es relevante para desarrolladores que necesitan un modelo multimodal pequeno, con licencia Gemma y despliegue en infraestructura europea (tag `region:eu`), que prioricen el luxemburgues y quieran reducir el consumo de memoria respecto al Gemma 3 4B original. El autor es `alphaedge-ai`, un tercero no afiliado a Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), con atencion local/global intercalada |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el nombre del modelo sugiere 16.384 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Luxemburgues (lb); otros idiomas degradados por la poda de vocabulario |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only multimodal de la familia Gemma 3, capaz de procesar entradas de imagen y texto. La innovacion de esta variante no reside en la arquitectura, sino en la poda del vocabulario: se seleccionan los 16.384 tokens mas relevantes para el luxemburgues mediante minado sobre 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, y se recortan las matrices de embedding y de la capa de salida (lm_head) a ese subconjunto. El resto de pesos del transformer se conserva del modelo base.

No se documenta en la informacion disponible si hubo reentrenamiento adicional, ajuste fino posterior a la poda ni procesos de RLHF/DPO especificos para esta variante. Tampoco se detalla el numero de tokens de entrenamiento del modelo base ni la composicion exacta del dataset original de Gemma 3. La reduccion de parametros (14,63%) proviene unicamente de la contraccion del vocabulario, no de la eliminacion de capas ni de cabezas de atencion.

## Capacidades

- Generacion de texto conversacional en luxemburgues, con plantilla de chat (`apply_chat_template`).
- Entrada multimodal imagen-texto heredada del Gemma 3 base (pipeline `image-text-to-text`), sujeta a la perdida de tokens de vocabulario no luxemburgueses.
- Razonamiento y generacion de codigo y matematicas en la medida en que el vocabulario podado lo permita; el rendimiento en estos dominios puede degradarse respecto al original.
- Soporte de tool calling y function calling heredado de la familia Gemma 3 (no verificado especificamente en esta variante).
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base, condicionadas al vocabulario reducido.
- Capacidades multilingues muy limitadas: solo el luxemburgues esta cubierto de forma fiable.
- Compatible con Text Generation Inference (tag `text-generation-inference`) y con endpoints compatibles.

## Casos de uso

- Atencion al cliente en luxemburgues: el modelo puede gestionar conversaciones multi-turno en luxemburgues con una huella de memoria reducida, adecuado para entornos donde el idioma de atencion es exclusivamente el luxemburgues.
- Generacion de contenido editorial en luxemburgues: redaccion de articulos, resumenes y textos divulgativos para medios o administraciones luxemburguesas, aprovechando la poda de vocabulario para reducir costes de inferencia.
- Traduccion y adaptacion de contenidos hacia luxemburgues: util como generador en pipelines de localizacion donde el destino es el luxemburgues, con revision humana posterior.
- Asistentes conversacionales embebidos en aplicaciones locales: al ocupar menos memoria que el Gemma 3 4B original, es viable en despliegues con recursos limitados dentro de la UE (tag `region:eu`).
- Procesamiento de documentos con imagenes en luxemburgues: al conservar la entrada multimodal, puede extraer y describir contenido de imagenes o capturas en contextos luxemburgueses.
- Prototipado e investigacion sobre poda de vocabulario: sirve como referencia reproducible para estudiar el impacto del trimming en modelos multimodales pequenos.
- Educacion y herramientas linguisticas: generacion de ejercicios, correccion o asistencia en luxemburgues para plataformas educativas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~3,67B parametros en bf16 requiere aproximadamente 7,3 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria los 3,7 GB y en 4 bits los 2 GB, aunque estos valores no estan confirmados para esta variante.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria en GPUs consumer con 8-12 GB de VRAM en bf16, y en GPUs de 24 GB (RTX 3090/4090) con margen amplio, pero no hay validacion oficial.
- Cabe en GPU consumer: probablemente si, en tarjetas con 8 GB o mas en cuantizacion, aunque no confirmado.
- Opciones de despliegue: `transformers` (soporte confirmado), Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles. No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI con version concreta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-ltz-16384 | 3.670.770.032 | no disponible | Luxemburgues | Gemma Terms of Use | Variante podada de Gemma 3 4B |
| google/gemma-3-4b-it | 4.300.079.472 | no disponible | Multilingue | Gemma Terms of Use | Modelo base original, sin poda |
| Otras variantes trimmed de Gemma 3 | no disponible | no disponible | Segun idioma | Gemma Terms of Use | Familia de variantes por idioma del mismo metodo |

La comparacion directa con alternativas de otros fabricantes (p. ej. Qwen o Llama en el rango de 3-4B) no esta disponible en la informacion proporcionada, y no se han publicado metricas de rendimiento para esta variante.

## Limitaciones y advertencias

- La poda de vocabulario elimina tokens no luxemburgueses: el rendimiento en otros idiomas, incluido el castellano, puede ser deficiente o directamente inutilizable.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones especificas de fidelidad para esta variante.
- Sesgos: no se documentan analisis de sesgo para esta variante; hereda los del modelo base Gemma 3.
- Licencia: sujeta a los Gemma Terms of Use; es necesario revisar las restricciones de uso comercial y las obligaciones de atribucion antes de desplegar en produccion.
- El modelo no esta afiliado ni respaldado por Google; es una derivacion de terceros.
- Solo 9 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado, sin evidencia de uso en produccion.
- No se confirma la longitud de contexto efectiva ni el soporte de cuantizaciones; el nombre del modelo sugiere 16.384 tokens, pero no esta verificado en la model card.
- La capacidad multimodal puede verse afectada por la poda si el vocabulario eliminado incluia tokens relevantes para descripciones de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-ltz-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
