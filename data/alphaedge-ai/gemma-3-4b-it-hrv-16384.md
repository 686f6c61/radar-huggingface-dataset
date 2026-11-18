# alphaedge-ai/gemma-3-4b-it-hrv-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-hrv-16384` es una variante "trimmed" (podada en vocabulario) del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind, especializada en croata (código ISO `hr`). El autor, alphaedge-ai, ha aplicado la técnica de *trimming* de vocabulario descrita por Loïck Bourdois en Hugging Face para reducir el vocabulario del tokenizer original de 262.144 tokens a solo 16.384, eliminando los tokens poco frecuentes en croata. Esto reduce el número de parámetros del modelo en un 14,63% (de 4.300.079.472 a 3.670.770.032) y, en consecuencia, el uso de memoria y el tamaño del repositorio (7,3 GB).

El modelo conserva la arquitectura original de Gemma 3 (transformer decoder-only con capacidades de imagen-texto) y se distribuye en formato safetensors para su uso con la librería `transformers`. Está pensado para despliegues en producción donde el croata es el idioma principal y donde el ahorro de memoria y latencia derivado de un vocabulario más pequeño supone una ventaja real, a costa de perder competencia en otros idiomas.

Es relevante ahora porque el *trimming* se ha consolidado como una técnica práctica para especializar modelos multilingües de gran vocabulario en idiomas concretos, y este modelo es un ejemplo directo aplicado a Gemma 3 con licencia Gemma y compatibilidad con Text Generation Inference (TGI) y endpoints de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), multimodal image-text-to-text |
| Parametros totales | 3.670.770.032 (frente a 4.300.079.472 del original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | croata (`hr`) como idioma objetivo; otros idiomas degradados por la poda de vocabulario |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión podada del vocabulario de `google/gemma-3-4b-it`, que emplea una arquitectura transformer decoder-only con soporte de entrada de imagen y texto. La intervención de alphaedge-ai no reentrena el modelo: elimina filas de la matriz de embeddings de entrada y de la capa de salida correspondientes a los tokens que no se usan en croata, conservando el resto de pesos. El vocabulario resultante tiene 16.384 tokens (93,75% de reducción respecto a los 262.144 originales) y el recorte de parámetros es del 14,63%.

La selección de tokens se realizó mediante *mining* sobre 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, filtrando los tokens con baja frecuencia en croata. No se documenta en la model card ningún proceso adicional de entrenamiento, fine-tuning, RLHF o DPO tras el trimming; el autor indica que el modelo "debería comportarse de forma similar al original" con el nuevo vocabulario. La innovación técnica es, por tanto, la propia técnica de trimming y su aplicación a un modelo multimodal de Gemma 3.

## Capacidades

- Generación de texto conversacional en croata, con plantilla de chat compatible con `apply_chat_template`.
- Capacidades multimodales heredadas de Gemma 3 4B IT: entrada de imagen y texto (pipeline `image-text-to-text`), aunque la model card no detalla el comportamiento multimodal tras el trimming.
- Razonamiento y respuesta a instrucciones (variante `-it`, instruction-tuned del modelo base).
- Soporte de tool calling / function calling: no documentado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: limitadas al croata; el autor advierte que el modelo puede no funcionar bien en otros idiomas porque se han eliminado tokens no frecuentes en el idioma objetivo.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).

## Casos de uso

- Atención al cliente en croata: el modelo puede gestionar conversaciones multi-turno en croata con una huella de memoria reducida, lo que abarata el despliegue en instancias modestas. La ventana de contexto exacta no está documentada, por lo que conviene validarla antes de fijar longitudes de conversación.
- Generación de contenido editorial en croata: redacción de artículos, resúmenes y descripciones de producto, aprovechando que el vocabulario podado está optimizado para ese idioma y reduce el coste por token generado.
- Procesamiento de documentos con OCR ligero: al conservar la capacidad image-text-to-text del Gemma 3 original, puede usarse para extraer texto de imágenes o capturas en croata, siempre que se valide el rendimiento multimodal tras el trimming.
- Chatbots locales en hardware de gama media: con 3,67B parámetros y 7,3 GB de pesos en safetensors, es viable en GPUs consumer con cuantización, lo que permite desplegar asistentes en croata en entornos con presupuesto limitado.
- Prototipado rápido de aplicaciones NLP en croata: al estar disponible en `transformers` y ser compatible con TGI, se puede integrar en pipelines existentes sin cambios de infraestructura.
- Investigación sobre trimming de vocabulario: sirve como caso de estudio reproducible para medir el impacto de la poda de vocabulario en modelos multimodales, comparándolo con el Gemma 3 4B IT original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,4 GB solo para pesos (3,67B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 10-12 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB para pesos; en 4 bits, alrededor de 2 GB, aunque el autor no publica variantes cuantizadas oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con concurrencia; RTX 4090 (24 GB) para inferencia en fp16 con margen amplio; RTX 3090/4080 (16-24 GB) para fp16 con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: `transformers` (documentado en la model card), Text Generation Inference (tag oficial), endpoints de Hugging Face; llama.cpp/Ollama no están documentados por el autor y requerirían conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-hrv-16384 | 3,67B | 16.384 | no disponible | Gemma Terms of Use | Hugging Face |
| google/gemma-3-4b-it | 4,30B | 262.144 | no disponible | Gemma Terms of Use | Hugging Face |
| Otros modelos especializados en croata de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal es con el modelo base: el trimmed reduce parámetros un 14,63% y vocabulario un 93,75%, a cambio de perder cobertura multilingüe. No se dispone de datos de benchmarks para comparar el rendimiento real frente al original ni frente a alternativas especializadas en croata.

## Limitaciones y advertencias

- El vocabulario podado elimina tokens no frecuentes en croata, por lo que el rendimiento en otros idiomas puede degradarse notablemente; el propio autor lo advierte.
- No se han publicado evaluaciones cuantitativas del impacto del trimming en la calidad de las respuestas, ni en texto ni en imagen.
- Riesgo de alucinación inherente a los modelos de 4B de la familia Gemma 3; no se documenta mitigación específica.
- Sesgos: no se documentan análisis de sesgo para esta variante; hereda los del modelo base, no evaluados en la model card.
- Licencia Gemma Terms of Use: restricciones de uso comercial y obligaciones de atribución aplicables; el modelo no está afiliado ni respaldado por Google.
- El modelo se distribuye únicamente en safetensors; no hay variantes GGUF, AWQ o GPTQ oficiales, lo que limita el despliegue en algunos runtimes.
- La longitud de contexto no está documentada en la información proporcionada y debe verificarse contra el modelo base antes de usarla en producción.
- El número de descargas (8) y likes (0) indica una adopción muy baja; no hay evidencia de la comunidad sobre su robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-hrv-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog de introducción a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de mining: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
