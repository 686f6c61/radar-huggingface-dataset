# alphaedge-ai/gemma-3-4b-it-jpn-16384

## Resumen

gemma-3-4b-it-jpn-16384 es una variante "trimmed" (podada) de google/gemma-3-4b-it, publicada por el usuario alphaedge-ai. El modelo conserva la arquitectura original de Gemma 3 (transformer multimodal con capacidad de entrada imagen-texto) pero reduce drásticamente su vocabulario de 262.144 a 16.384 tokens (una reducción del 93,75%) mediante la técnica de trimming descrita por Loïck Bourdois y colaboradores. El resultado es un modelo un 14,63% más pequeño en parámetros (de 4.300.079.472 a 3.670.770.032), lo que se traduce en una huella de memoria notablemente inferior.

La poda del vocabulario se realizó minando 200.000 textos del dataset lbourdois/fineweb-2-trimming, específicamente optimizados para japonés. Esto hace que el modelo esté especializado en ese idioma y que, por el contrario, pierda competencia en lenguajes cuyos tokens hayan sido eliminados del vocabulario. Es relevante para desarrolladores que despliegan Gemma 3 en entornos con restricciones de memoria y cuyo tráfico sea predominantemente en japonés, ya que permite reducir costes de inferencia manteniendo un comportamiento cercano al modelo original en esa lengua.

Se distribuye en formato safetensors bajo licencia Gemma, es compatible con transformers y text-generation-inference, y su repo ocupa 7,3 GB. El modelo base es google/gemma-3-4b-it y la relación declarada es "quantized" (en la práctica, una reducción estructural del vocabulario, no una cuantización numérica de pesos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), derivado por poda de vocabulario |
| Parametros totales | 3.670.770.032 (original: 4.300.079.472; reducción del 14,63%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja); el resto de idiomas puede degradarse por la poda de vocabulario |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3, un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text en el modelo base). La intervención de alphaedge-ai no consiste en un reentrenamiento desde cero ni en un ajuste fino supervisado, sino en una reducción del vocabulario del tokenizer: se seleccionan los 16.384 tokens más relevantes para japonés minando 200.000 textos del dataset lbourdois/fineweb-2-trimming y se recorta la matriz de embeddings y la capa de salida en consecuencia. El resto de pesos del transformer se conserva del modelo original.

La innovación técnica es, por tanto, el método de trimming documentado en el blog de Hugging Face: reduce el tamaño del modelo y la memoria necesaria sin tocar los bloques de atención ni las capas feed-forward, manteniendo el comportamiento del modelo base en el idioma objetivo. No se documentan en la información disponible datos sobre número de tokens de entrenamiento original, composición del dataset de preentrenamiento de Gemma 3, ni etapas de RLHF/DPO, más allá de lo que figure en el informe técnico de Gemma 3 (arXiv:2503.19786), que es la referencia del modelo base.

## Capacidades

- Generación de texto conversacional en japonés, con plantilla de chat aplicable mediante `apply_chat_template`.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque la model card no detalla el soporte de visión tras el trimming.
- Razonamiento y generación de código heredados de Gemma 3, sujetos a la degradación esperada por la poda de vocabulario.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible; heredable del modelo base pero no garantizado.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües limitadas: el modelo está optimizado para japonés y puede rendir peor en otros idiomas.
- Modo "thinking": no documentado en la información disponible.

## Casos de uso

- Atención al cliente en japonés: el modelo puede gestionar conversaciones multi-turno en japonés con una huella de memoria menor que el Gemma 3 original, lo que abarata el despliegue en infraestructura con GPUs modestas.
- Despliegue en el borde o en entornos con VRAM limitada: al reducir parámetros un 14,63% y el vocabulario un 93,75%, cabe en GPUs de consumo con cuantización adicional, ideal para asistentes locales en japonés.
- Procesamiento de documentación japonesa: resumen y extracción de información de textos en japonés en pipelines batch, donde el ahorro de memoria permite mayor concurrencia por GPU.
- Generación de respuestas en aplicaciones de mensajería japonesas: integrable vía transformers o text-generation-inference con la plantilla de chat del modelo base.
- Prototipado rápido de asistentes conversacionales en japonés: el repo de 7,3 GB y la compatibilidad con `device_map="auto"` facilitan pruebas en una sola GPU.
- Filtrado y clasificación de contenido japonés: uso como generador de etiquetas o respuestas cortas en flujos de moderación y anotación, aprovechando el vocabulario reducido y especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,3 GB solo para pesos (3,67 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 3,7-4 GB para pesos; en 4 bits, aproximadamente 2 GB para pesos (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con concurrencia; RTX 4090 o RTX 3090 para uso individual en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB de VRAM en fp16 y en tarjetas de 4-6 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-jpn-16384 | 3.670.770.032 | no disponible | ja | Gemma Terms of Use | Vocabulario podado a 16.384 tokens |
| google/gemma-3-4b-it | 4.300.079.472 | no disponible | multilingue | Gemma Terms of Use | Modelo base original, vocabulario de 262.144 tokens |
| Otras variantes trimmed de Gemma 3 | no disponible | no disponible | segun variante | Gemma Terms of Use | Publicadas por la comunidad con el mismo método |

## Limitaciones y advertencias

- La poda de vocabulario elimina tokens poco frecuentes en japonés; el rendimiento en otros idiomas puede degradarse significativamente respecto al modelo base.
- Riesgo de alucinación inherente a los modelos de 4 mil millones de parámetros; no se han publicado evaluaciones específicas de fidelidad para esta variante.
- Sesgos: no documentados por el autor; heredables del modelo base Gemma 3.
- Restricciones de licencia: el uso se rige por los Gemma Terms of Use; es necesario revisar las cláusulas de uso comercial y redistribución antes de desplegar en producción.
- El modelo no está afiliado ni respaldado por Google, según declara el autor.
- No se documentan la longitud de contexto efectiva ni el soporte de visión tras el trimming; conviene validar ambos extremos antes de usarlo en producción.
- El autor no publica benchmarks ni evaluaciones comparativas frente al modelo base, por lo que la afirmación de "rendimiento similar" en japonés no está cuantificada.
- El número de descargas (9) y likes (0) indica una adopción muy baja; no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-jpn-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Informe técnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
