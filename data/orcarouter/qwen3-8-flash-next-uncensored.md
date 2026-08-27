# orcarouter/Qwen3.8-Flash-Next-Uncensored

## Resumen

El modelo `orcarouter/Qwen3.8-Flash-Next-Uncensored` es un fine-tuning "abliterated" (eliminación de mecanismos de rechazo) del modelo base `Qwen/Qwen3.8-Flash-Next`, desarrollado por el usuario orcarouter. Se trata de un modelo de lenguaje multimodal (imagen-texto) de gran escala, con aproximadamente 180.000 millones de parámetros, que emplea una arquitectura de mezcla de expertos (MoE) híbrida con atención lineal Gated DeltaNet (GDN) y atención selectiva por consulta (QSA). El modelo está diseñado para eliminar las restricciones de contenido del modelo original, lo que lo hace adecuado para tareas de red-teaming y evaluación de seguridad en IA, aunque también conserva capacidades de razonamiento, tool calling y visión.

La relevancia de este modelo radica en su naturaleza "uncensored" (sin censura), que permite a investigadores y desarrolladores probar los límites de los modelos de lenguaje en escenarios de seguridad y alineación. Al estar basado en Qwen3.8-Flash-Next, hereda las mejoras arquitectónicas de este último, que según Unsloth supera a Claude-4.6-Opus en tareas de codificación agéntica, visión y chat. El acceso al modelo está restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet (GDN) + Query-Selective Attention (QSA) |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en bf16/safetensors) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-Flash-Next combina dos mecanismos de atención: Gated DeltaNet (GDN), una atención lineal con compuerta que reduce el coste computacional en secuencias largas, y Query-Selective Attention (QSA), que selecciona dinámicamente las consultas más relevantes para mejorar la eficiencia. Esta combinación híbrida permite escalar a 180B parámetros con un coste de inferencia menor que un modelo denso equivalente. El modelo base también incorpora mejoras en residuales, embeddings y optimización del entrenamiento, así como un cabezal de decodificación especulativa MTP (Multi-Token Prediction) para acelerar la generación.

El fine-tuning "uncensored" aplica técnicas de abliteration, que consisten en eliminar o neutralizar los vectores de dirección responsables del comportamiento de rechazo en el modelo original. Esto se realiza mediante intervención en los pesos del modelo base, sin un entrenamiento adicional con datos específicos. El resultado es un modelo que no rechaza peticiones que el modelo base consideraría inapropiadas, manteniendo el resto de capacidades intactas. No se dispone de información detallada sobre el proceso de entrenamiento, el dataset utilizado ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Comprensión y generación de imágenes (entrada multimodal imagen-texto).
- Soporte de tool calling / function calling para integración con APIs y agentes.
- Razonamiento multi-paso y capacidades de agente (agentic reasoning).
- Decodificación especulativa MTP para acelerar la inferencia.
- Ausencia de mecanismos de rechazo (abliterated), lo que permite generar contenido que el modelo base bloquearía.
- Capacidad de red-teaming y evaluación de seguridad en IA.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo permite a equipos de seguridad probar vulnerabilidades en sistemas de IA generando contenido que otros modelos rechazarían, lo que ayuda a identificar fallos en los mecanismos de alineación.
- Investigación en alineación de IA: investigadores pueden estudiar cómo se comporta un modelo sin restricciones para entender mejor los mecanismos de rechazo y desarrollar técnicas de mitigación más robustas.
- Generación de contenido creativo sin restricciones: escritores y creadores pueden explorar temas tabú o controvertidos sin que el modelo imponga límites, útil para ficción, sátira o análisis de discursos extremos.
- Agentes autónomos con tool calling: al mantener las capacidades de function calling y razonamiento del modelo base, puede integrarse en pipelines de automatización donde se requiere tomar decisiones sin filtros de contenido.
- Análisis multimodal de imágenes y texto: su capacidad de procesar imágenes junto con texto permite aplicaciones de descripción de imágenes, análisis de documentos visuales o generación de informes a partir de capturas.
- Evaluación comparativa de modelos "uncensored": sirve como referencia para comparar el comportamiento de otros modelos abliterated o sin restricciones en tareas estandarizadas de seguridad y utilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la informacion disponible. El modelo base Qwen3.8-Flash-Next, según Unsloth, supera a Claude-4.6-Opus (Max) en tareas de codificación agéntica, visión y chat, pero no se proporcionan cifras concretas. Tampoco hay datos de rendimiento para la versión abliterated.

## Requisitos de hardware

- VRAM estimada: con 180B parámetros en bf16, se necesitan aproximadamente 360 GB de VRAM solo para los pesos. Con cuantización a 4 bits (si estuviera disponible) se reduciría a unos 90 GB, pero no se ofrecen archivos cuantizados en este repo.
- GPU recomendadas: se requieren múltiples GPUs de alta gama, como 8x H100 (80 GB) o 8x A100 (80 GB) para inferencia en bf16. No es viable en GPUs de consumo.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o TensorRT-LLM, siempre que se disponga de suficiente memoria. No hay soporte nativo para llama.cpp u Ollama en este repo, aunque el modelo base podría convertirse a GGUF.
- Latencia y throughput: no disponible. Dado el tamaño y la arquitectura MoE, se espera una latencia mayor que modelos densos de menor tamaño, pero la decodificación especulativa MTP puede mitigar parcialmente este efecto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de la misma categoría (180B MoE abliterated). El modelo base Qwen3.8-Flash-Next se posiciona como competidor de Claude-4.6-Opus y otros modelos propietarios de gran escala, pero no hay datos públicos de benchmarks comparativos. Alternativas en el espacio "uncensored" incluyen otros modelos abliterated de menor tamaño (como Qwen3.8-27B-Uncensored), pero no son comparables en escala.

## Limitaciones y advertencias

- Al ser un modelo abliterated, puede generar contenido dañino, ilegal o éticamente problemático sin restricciones. Su uso debe limitarse a entornos controlados de investigación y red-teaming.
- El acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace, lo que limita su disponibilidad pública.
- Solo soporta inglés y chino; no hay capacidades multilingües más amplias.
- No se dispone de información sobre la longitud de contexto, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- El modelo es experimental (tag `qwen4_exp`) y no hay garantías de estabilidad o soporte a largo plazo.
- La licencia Apache-2.0 permite uso comercial, pero el acceso gated y la naturaleza del contenido generado pueden plantear riesgos legales y de reputación.
- No se han publicado benchmarks ni evaluaciones de seguridad específicas para esta versión, por lo que su rendimiento real en tareas estándar es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog de orcarouter sobre modelos uncensored: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repo GGUF de un modelo similar (Qwen3.8-27B-Uncensored): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Documentación de Unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
