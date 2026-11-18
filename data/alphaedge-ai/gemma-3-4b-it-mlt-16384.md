# alphaedge-ai/gemma-3-4b-it-mlt-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-mlt-16384` es una variante del modelo multimodal Gemma 3 4B instruct de Google, publicada por el usuario alphaedge-ai, en la que se ha reducido el vocabulario del tokenizador de 262.144 a 16.384 tokens (un 93,75% menos) mediante la técnica de *trimming* descrita por Loïck Bourdois y colaboradores en Hugging Face. El objetivo declarado es optimizar el modelo para el maltés (`mt`), eliminando los tokens poco frecuentes en ese idioma y conservando únicamente los relevantes, lo que reduce el número de parámetros totales de 4.300.079.472 a 3.670.770.032 (un 14,63% menos) y el peso del repositorio a 7,3 GB.

La arquitectura subyacente es la de Gemma 3 4B IT: un transformer decoder-only con atención multimodal (entrada de imagen y texto) y una ventana de contexto de 128.000 tokens en el modelo original, aunque la ficha del autor no documenta explícitamente el contexto resultante tras el recorte. La relevancia práctica de esta variante es doble: por un lado, permite desplegar un modelo de 3,67B parámetros con menor huella de memoria en GPUs de consumo; por otro, demuestra un patrón de especialización lingüística barata que puede reproducirse para otros idiomas de bajos recursos.

Conviene señalar que se trata de un modelo derivado y no oficial, con solo 9 descargas y 0 likes en el momento de la consulta, y que el autor no publica resultados de evaluación. La licencia aplicable es la de Gemma Terms of Use, heredada del modelo base, con las restricciones que ello implica para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), con vocabulario recortado |
| Parámetros totales | 3.670.770.032 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el base Gemma 3 4B IT soporta 128K) |
| Tipos de cuantización | No disponible explícitamente; el repo contiene safetensors en precisión original; compatible con cuantización estándar de transformers (GPTQ, AWQ, GGUF vía conversión) |
| Idiomas soportados | Maltés (`mt`); el resto de idiomas puede degradarse por la eliminación de tokens |
| Licencia | Gemma Terms of Use |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only con capacidad de entrada image-text-to-text, y no ha sido reentrenado: la modificación consiste exclusivamente en el recorte del vocabulario del tokenizador y de la matriz de embeddings correspondiente. El vocabulario pasa de 262.144 a 16.384 tokens, seleccionados a partir de la minería de 200.000 textos del dataset `lbourdois/fineweb-2-trimming` en maltés. La matriz de embeddings de entrada y la capa de salida (lm_head) se reducen en consecuencia, lo que explica la caída de 629.309.440 parámetros (14,63%).

No se documenta ningún proceso de fine-tuning posterior al recorte, ni RLHF, DPO o ajuste de calibración tras la poda del vocabulario. Tampoco se especifica el número de tokens de entrenamiento original de Gemma 3 4B IT en la información disponible. La innovación técnica es, por tanto, metodológica: el *trimming* de vocabulario como técnica de compresión y especialización lingüística de bajo coste, descrita en el blog de Hugging Face citado por el autor.

## Capacidades

- Generación de texto conversacional en maltés, con plantilla de chat (`apply_chat_template`) heredada de Gemma 3 IT.
- Entrada multimodal image-text-to-text, según el tag del repositorio y la arquitectura del modelo base.
- Razonamiento y respuesta a instrucciones en formato multi-turno, siempre que los tokens necesarios estén presentes en el vocabulario recortado.
- Generación de código y matemáticas: capacidad heredada del base, aunque potencialmente degradada si los tokens relevantes fueron eliminados del vocabulario.
- Soporte de tool calling / function calling: no documentado explícitamente en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al maltés por diseño; el resto de idiomas puede fallar o degradarse gravemente.
- Modo thinking: no documentado para esta variante.

## Casos de uso

- Atención al cliente en maltés: el modelo puede gestionar conversaciones multi-turno con la plantilla de chat de Gemma 3, aprovechando el vocabulario especializado para respuestas fluidas en maltés sin el coste de memoria del vocabulario completo.
- Despliegue en GPU de consumo para prototipos: con 3,67B parámetros y 7,3 GB de pesos en safetensors, cabe en GPUs de 16 GB o menos tras cuantización a 8 o 4 bits, lo que facilita pruebas locales de asistentes en maltés.
- Traducción y generación de contenido editorial en maltés: útil para medios locales o administraciones públicas que necesiten borradores de texto en maltés con un modelo ligero y desplegable on-premise.
- Investigación sobre trimming de vocabulario: sirve como caso de estudio reproducible para evaluar el impacto de la reducción de vocabulario en la calidad por idioma, comparándolo con el base Gemma 3 4B IT.
- Procesamiento de documentos malteses con componente visual: al conservar la entrada image-text-to-text, puede emplearse para extraer o resumir información de imágenes con texto en maltés, siempre que el vocabulario cubra los caracteres necesarios.
- Educación y herramientas lingüísticas: generación de ejercicios, corrección de estilo o explicaciones gramaticales en maltés con un modelo de bajo coste computacional para entornos educativos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas en maltés, ni comparaciones cuantitativas con el modelo base más allá de la reducción de parámetros y vocabulario.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: unos 4 GB de pesos; en 4 bits, unos 2 GB.
- GPU recomendadas: A100 40GB, H100, L40S para despliegue en producción con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 sin problemas; RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) viables en FP16 con contexto limitado o en 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con cuantización 8/4 bits; en FP16 requiere al menos 12-16 GB.
- Opciones de despliegue: transformers (soporte nativo según la model card), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-mlt-16384 | 3,67B | No disponible (base: 128K) | Maltés | Gemma Terms of Use | Hugging Face, 9 descargas |
| google/gemma-3-4b-it | 4,30B | 128K | Multilingüe (140+) | Gemma Terms of Use | Hugging Face, modelo oficial |
| Qwen2.5-3B-Instruct | 3,09B | 32K (128K en variantes) | Multilingüe (29+) | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama-3.2-3B-Instruct | 3,21B | 128K | Multilingüe (8 oficiales) | Llama 3.2 Community License | Hugging Face, muy extendido |

La ventaja diferencial de esta variante frente al Gemma 3 4B IT original es el menor tamaño (14,63% menos parámetros) y la especialización en maltés; su desventaja es la pérdida de capacidades multilingües y la ausencia de evaluación publicada. Frente a Qwen2.5-3B o Llama-3.2-3B, ofrece multimodalidad y licencia Gemma, pero carece de la comunidad y el soporte de aquellos.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no frecuentes en maltés; el rendimiento en otros idiomas puede degradarse gravemente, incluyendo errores de tokenización y salidas incoherentes.
- No se han publicado evaluaciones que confirmen que el rendimiento en maltés se mantiene respecto al base; la afirmación del autor ("should perform similarly") no está respaldada con métricas.
- Riesgo de alucinación inherente a los modelos de 4B, agravado por la posible pérdida de tokens en dominios técnicos, código o nombres propios.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribución; no es una licencia permisiva tipo Apache 2.0.
- Modelo derivado no oficial, no afiliado ni respaldado por Google, con muy baja adopción (9 descargas) y sin mantenimiento comunitario demostrable.
- El contexto máximo efectivo tras el recorte no está documentado; no debe asumirse que se mantienen los 128K del base.
- El soporte de tool calling, agentes y modo thinking no está verificado en esta variante.
- Fecha de creación y actualización inusuales (2026) en los metadatos; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-mlt-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
