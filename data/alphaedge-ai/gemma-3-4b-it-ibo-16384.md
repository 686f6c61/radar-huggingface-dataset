# alphaedge-ai/gemma-3-4b-it-ibo-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-ibo-16384` es una variante "trimmed" (recortada) del modelo multimodal `google/gemma-3-4b-it`, publicada por el usuario alphaedge-ai. El recorte consiste en reducir el vocabulario del tokenizer de 262.144 a 16.384 tokens, seleccionados especificamente para el idioma igbo (ig), lo que reduce el numero de parametros del modelo de 4.300.079.472 a 3.670.770.032 (un 14,63% menos) y disminuye la huella de memoria en inferencia. La tecnica de trimming esta descrita en el blog de Hugging Face "Introduction to Trimming" y se aplico usando como base de minado el dataset `lbourdois/fineweb-2-trimming` (95.184 textos).

El modelo conserva la arquitectura original de Gemma 3 (transformer decoder-only con atencion local/global intercalada y capacidad de entrada imagen-texto), pero pierde los tokens no usados en igbo, por lo que su rendimiento fuera de ese idioma se degrada de forma severa. Es relevante para desarrolladores que necesiten desplegar un modelo conversacional de ~3,7B parametros especializado en igbo con menor consumo de VRAM y un vocabulario mucho mas compacto, a costa de renunciar al multilingue amplio del modelo original.

La ficha se basa unicamente en la informacion disponible en la model card y en los metadatos de Hugging Face; no se han publicado resultados de benchmarks especificos para esta variante trimmed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con entrada imagen-texto |
| Parametros totales | 3.670.770.032 (original: 4.300.079.472) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3 4B IT; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors sin cuantizar; se puede cuantizar posteriormente con herramientas estandar) |
| Idiomas soportados | igbo (ig); el resto de idiomas del modelo original quedan degradados por el recorte de vocabulario |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors |
| Tamano del repo | 7,3 GB |
| Vocabulario | 16.384 tokens (original: 262.144; reduccion del 93,75%) |
| Dataset de minado | lbourdois/fineweb-2-trimming (95.184 textos) |
| Modelo base | google/gemma-3-4b-it |
| Libreria | transformers |
| Pipeline | text-generation (tags incluyen image-text-to-text) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only de la familia Gemma 3 con capacidad multimodal de entrada (imagen-texto). La modificacion aplicada no reentrena los pesos: se recorta el vocabulario del tokenizer y se eliminan las filas correspondientes de la matriz de embeddings de entrada y de la capa de salida (lm_head), reduciendo el numero total de parametros en 629.309.440 (14,63%). Los tokens conservados se seleccionaron minando 95.184 textos del dataset `lbourdois/fineweb-2-trimming`, filtrando por frecuencia de uso en igbo.

No se especifica en la model card si hubo un paso de fine-tuning posterior al recorte, ni el numero de tokens de entrenamiento adicionales, ni si se aplicaron tecnicas de RLHF/DPO especificas para esta variante. Tampoco se detalla la composicion exacta del corpus de minado mas alla del numero de textos. La innovacion tecnica principal es, por tanto, la reduccion de vocabulario mediante trimming, que disminuye el coste de memoria del embedding y de la lm_head y acelera la decodificacion al reducir el espacio de logits.

## Capacidades

- Generacion de texto conversacional en igbo, con la plantilla de chat de Gemma 3 (`apply_chat_template`).
- Entrada multimodal imagen-texto heredada del modelo base (tag `image-text-to-text`), aunque la model card no documenta el rendimiento tras el recorte.
- Razonamiento y generacion de codigo y matematicas: capacidades heredadas de Gemma 3 4B IT, pero degradadas fuera del igbo por la perdida de tokens.
- Soporte de tool calling / function calling: heredado del modelo base; no verificado en esta variante trimmed.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base; no verificadas tras el recorte.
- Capacidades multilingues: limitadas practicamente al igbo; el resto de idiomas del vocabulario original se han eliminado.
- Modo thinking: no documentado en la model card para esta variante.

## Casos de uso

- Atencion al cliente en igbo: el modelo puede gestionar conversaciones multi-turno en igbo con un vocabulario compacto, lo que reduce el coste por token y la VRAM necesaria frente al Gemma 3 4B IT completo.
- Traduccion y generacion de contenido en igbo: util para redactar textos, resumenes o respuestas en igbo en entornos con recursos de GPU limitados, gracias a los 3,67B parametros y al vocabulario reducido.
- Despliegue en hardware de gama media: al ocupar menos memoria en embeddings y lm_head, es viable en GPUs consumer con cuantizacion posterior, para servicios de inferencia de bajo coste orientados a igbo.
- Procesamiento de documentos con imagen en igbo: la capacidad image-text-to-text del modelo base permite extraer o describir contenido de imagenes con texto en igbo, aunque el rendimiento tras el recorte no esta documentado.
- Investigacion sobre trimming de vocabularios: sirve como caso de estudio reproducible para medir el impacto del recorte de vocabulario en un modelo multimodal de 4B, usando el dataset de minado publicado.
- Prototipado rapido de asistentes conversacionales en igbo: la integracion con `transformers` y `text-generation-inference` (tags del repo) permite levantar un endpoint compatible con la API de TGI para pruebas y demos.
- Fine-tuning especifico en igbo: al tener un vocabulario ya adaptado al idioma, el ajuste fino posterior requiere menos parametros de embedding que entrenar y puede converger con menos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta las metricas de tamano (vocabulario y parametros) y no incluye evaluaciones en MMLU, HumanEval, GSM8K ni tareas multimodales para esta variante trimmed.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,3 GB solo para pesos (3,67B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 10-12 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4 GB para pesos; en 4 bits, en torno a 2 GB para pesos, mas overhead.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de produccion con alto throughput; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda en BF16.
- GPU consumer: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (soporte nativo segun la model card), `text-generation-inference` (tag `text-generation-inference` en el repo), y herramientas estandar de cuantizacion e inferencia (llama.cpp, Ollama, vLLM) previa conversion, aunque no se documenta soporte explicito en la model card.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-ibo-16384 | 3.670.770.032 | 16.384 | no disponible | igbo (ig) | Gemma Terms of Use | Hugging Face (6 descargas) |
| google/gemma-3-4b-it | 4.300.079.472 | 262.144 | no disponible en la informacion | multilingue amplio | Gemma Terms of Use | Hugging Face (oficial) |
| Otras variantes trimmed de Gemma 3 4B IT | variable segun idioma | variable | no disponible | idioma objetivo | Gemma Terms of Use | Hugging Face (comunidad) |

La comparativa se limita al modelo base y a otras variantes trimmed de la misma familia, ya que no se dispone de datos de rendimiento para comparar con alternativas de otros desarrolladores en igbo.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no usados en igbo; el rendimiento en otros idiomas se degrada de forma severa y no debe asumirse el comportamiento multilingue del modelo original.
- No hay benchmarks publicados para esta variante; el rendimiento real en tareas de razonamiento, codigo o vision tras el recorte es desconocido y debe validarse antes de usarla en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 4B, no mitigado ni evaluado en esta variante.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad para esta variante trimmed.
- Licencia: uso sujeto a los Gemma Terms of Use; es necesario revisar las restricciones de uso comercial y de redistribucion antes de desplegar el modelo. El modelo no esta afiliado ni respaldado por Google.
- El modelo tiene muy poca traccion (6 descargas, 0 likes) y fue actualizado por ultima vez en noviembre de 2026; no hay garantia de mantenimiento ni de soporte.
- La model card no especifica la longitud de contexto efectiva tras el recorte ni si se realizo fine-tuning posterior; ambos datos son criticos para planificar el despliegue.
- El tag `region:eu` sugiere un posible enfoque regulatorio europeo, pero no se detalla en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-ibo-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog "Introduction to Trimming": https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Paper Gemma 3 Technical Report: https://arxiv.org/abs/2503.19786
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
