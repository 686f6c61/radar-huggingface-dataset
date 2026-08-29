# hell0ks/GLM-5.3-Flash-Uncensored-AWQ

## Resumen

GLM-5.3-Flash-Uncensored-AWQ es una cuantización AWQ W4A16 del modelo GLM-5.3-Flash de Z.ai (Zhipu AI), tras pasar por un proceso de ablación de la dirección de rechazo (abliteration) realizado por OrcaRouter. El resultado es un checkpoint de 321.323 millones de parámetros (~321B) con 18B activos por token, que elimina las barreras de seguridad del modelo original para usos de investigación en red-teaming, interpretabilidad y estudio de mecanismos de rechazo. La variante AWQ aquí descrita está publicada por el usuario hell0ks y está pensada para servir con vLLM mediante el formato compressed-tensors.

El modelo base es orcarouter/GLM-5.3-Flash-Uncensored-FP8, que a su vez deriva de zai-org/GLM-5.3-Flash. Mantiene la arquitectura Glm5NextForConditionalGeneration con atención híbrida (KDA gated-linear y sparse full-attention), 288 expertos enrutados top-8, un bloque MTP de decodificación especulativa, torre de visión y vídeo, y una ventana de contexto de 1M tokens. La licencia es MIT, lo que permite uso comercial con las salvedades que se indican en las advertencias.

Esta ficha describe la versión AWQ, que reduce el peso en disco a 190.8 GB y permite inferencia con menor requisito de VRAM que la versión FP8, aunque sigue siendo un modelo de gran tamaño que exige hardware de múltiples GPUs de alta gama. No se han publicado resultados de benchmarks específicos para esta variante cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (glm5_next): 45 capas transformer + 1 bloque MTP, hidden 4096, atención híbrida (34 capas KDA gated-linear + 11 capas sparse full-attention con indexer top-2048 e intervalo 4), MLA con q-LoRA 1536 y kv-LoRA 512 (NoPE), 288 expertos enrutados top-8 + 1 experto compartido (primeras 3 capas densas), 4-wide Manifold-Constrained Hyper-Connections (mHC), torre de visión y vídeo nativa |
| Parametros totales | 321.323.031.390 (~321B) |
| Parametros activos | ~18B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | AWQ W4A16 (compressed-tensors); la model card indica cuantización de pesos INT4 y activaciones INT4 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (shards con índice JSON) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un Mixture-of-Experts con 321B parámetros totales y 18B activos por token. Emplea una combinación de atención lineal gated (KDA) en 34 capas y atención sparse full-attention en 11 capas, con un indexador que selecciona los 2048 tokens más relevantes. La atención MLA usa codificaciones q-LoRA y kv-LoRA sin posiciones aprendidas (NoPE). Los 288 expertos enrutados con top-8 seleccionan 8 expertos por token, más un experto compartido; las primeras 3 capas son densas. El modelo incorpora un bloque MTP (Multi-Token Prediction) de 7.4B parámetros para decodificación especulativa y una torre de visión y vídeo de 0.56B.

Sobre el entrenamiento, no se han publicado detalles del dataset ni del proceso de post-entrenamiento en la información disponible. El proceso de abliteration aplicado por OrcaRouter ortogonaliza la dirección de rechazo del flujo residual, eliminando la negativa del modelo a responder a peticiones dañinas. Esta modificación se hornea directamente en los shards FP8 del checkpoint base, y la versión AWQ aquí descrita es una cuantización posterior de ese checkpoint abliterado.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de modo razonamiento (thinking) según la configuración de inferencia.
- Entrada multimodal: procesa imágenes y vídeo además de texto, gracias a la torre de visión y vídeo integrada.
- Function calling / tool calling, útil para integrar el modelo en agentes que invocan herramientas externas.
- Decodificación especulativa mediante el bloque MTP, que acelera la generación al predecir múltiples tokens por paso.
- Ventana de contexto de 1M tokens, adecuada para documentos largos, análisis de código extenso o conversaciones de muchas vueltas.
- Multilingüe limitado a inglés y chino (según los metadatos del modelo).
- Sin alineación de seguridad: el modelo no rechaza peticiones dañinas, lo que lo hace útil para investigación de seguridad, pero peligroso fuera de entornos controlados.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo permite probar defensas y moderadores de contenido generando respuestas que un modelo alineado rechazaría, evaluando así la robustez de los filtros.
- Investigación en interpretabilidad: al eliminar la dirección de rechazo, se puede estudiar cómo se codifica la negativa en el flujo residual y qué mecanismos internos la activan.
- Estudio de mecanismos de alineación: comparar las activaciones del modelo abliterado con las del original ayuda a entender qué capas y direcciones son responsables de la seguridad.
- Generación creativa sin restricciones: escritura de ficción, guiones o diálogos que requieran explorar temas tabú o controvertidos sin censura, siempre en un entorno de investigación.
- Evaluación de robustez de modelos: generar entradas adversariales o prompts maliciosos para probar sistemas de moderación en entornos de laboratorio.
- Benchmarking de cuantización: al ser una variante AWQ, sirve para medir el impacto de la cuantización INT4 en las capacidades de razonamiento y generación frente a la versión FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante AWQ. El modelo base GLM-5.3-Flash, según documentación de Unsloth, supera a GLM-5.2 en benchmarks y tareas del mundo real y rivaliza con Claude Opus 4.8 en codificación y benchmarks agénticos, pero no se dispone de cifras concretas ni de comparativas con la versión cuantizada.

## Requisitos de hardware

- VRAM estimada: el checkpoint AWQ ocupa 190.8 GB en disco. Para inferencia con vLLM se recomienda un mínimo de 200 GB de VRAM agregada, lo que implica al menos 3 GPUs de 80 GB (A100/H100) o 4 de 48 GB (L40S). Con cuantización adicional o offloading a CPU se podría reducir, pero no es práctico.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, H200, o configuraciones multi-GPU con NVLink. No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por VRAM insuficiente.
- Opciones de despliegue: vLLM (recomendado por el formato compressed-tensors), TensorRT-LLM, o TGI con soporte AWQ. También es posible usar llama.cpp con conversión a GGUF, aunque no es el formato nativo de este checkpoint.
- Latencia y throughput: no disponibles. Dependen del número de GPUs, del ancho de banda NVLink y del uso del bloque MTP para decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Cuantización | Diferencia clave |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-AWQ (este) | 321B / 18B | 1M | MIT | AWQ INT4 | Abliterado y cuantizado, sin alineación |
| zai-org/GLM-5.3-Flash | 321B / 18B | 1M | MIT | FP8 (original) | Modelo base con alineación de seguridad |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | 321B / 18B | 1M | MIT | FP8 | Abliterado, sin cuantización AWQ |
| GLM-5.3 (zai-org) | 744B / 40B | 1M | MIT | FP8 | Modelo mayor, mismo contexto, SOTA en agentes |

La comparativa muestra que este modelo es una variante optimizada para despliegue con menor VRAM que la FP8, pero con el mismo comportamiento abliterado. Frente al GLM-5.3 original, el abliterado elimina las negativas, lo que lo hace inadecuado para uso directo en producción sin capas de moderación.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteration: se ha eliminado la dirección de rechazo del flujo residual, por lo que no tiene guardarraíles significativos y puede generar contenido dañino, ilegal, ofensivo o poco ético.
- Está publicado exclusivamente para investigación legítima: interpretabilidad, seguridad, red-teaming y evaluación de robustez. No debe desplegarse a usuarios finales ni en producción sin añadir sistemas propios de moderación y prevención de abusos.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar hechos, especialmente en dominios poco representados en sus datos de entrenamiento.
- Soporte de idiomas limitado a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- La licencia MIT permite uso comercial, pero el autor declina toda responsabilidad por mal uso. El usuario asume toda la responsabilidad legal y ética.
- El tamaño del modelo (190.8 GB en AWQ) requiere infraestructura de múltiples GPUs de alta gama; no es viable en hardware de consumo.
- No se han publicado benchmarks específicos para esta variante cuantizada, por lo que el impacto de la cuantización INT4 en la calidad de salida no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hell0ks/GLM-5.3-Flash-Uncensored-AWQ
- Modelo base (OrcaRouter FP8): https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Modelo original (Z.ai): https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentación de Unsloth para GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3-flash
- Página de NanoGPT sobre GLM 5.3 Flash Uncensored: https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-uncensored
- Otra variante similar (dealignai): https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Otra variante AWQ (cyankiwi): https://huggingface.co/cyankiwi/GLM-5.3-Flash-AWQ-INT4
