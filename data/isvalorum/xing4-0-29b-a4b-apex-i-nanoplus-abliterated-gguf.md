# IsValorum/Xing4.0-29B-A4B-APEX-I-NanoPlus-Abliterated-GGUF

## Resumen
Xing4.0-29B-A4B-APEX-I-NanoPlus-Abliterated-GGUF es una cuantización GGUF del modelo Xing4.0-29B-A4B, un Mixture-of-Experts (MoE) de 29.000 millones de parámetros totales con aproximadamente 4.000 millones activados por token. El modelo original lo desarrolla XingChen-AGI y esta versión concreta la publica IsValorum, que parte del checkpoint abliterado (sin rechazos) de huihui-ai y lo comprime a 11,74 GB mediante una asignación de precisión tensor a tensor denominada APEX-I-NanoPlus. El objetivo es claro: ofrecer calidad práctica de un cuantizado Q4_K_M en un tamaño que deja margen para offload parcial en GPU y ventanas de contexto amplias.

La relevancia de esta ficha está en su relación calidad/tamaño. Frente a los 62,40 GB del BF16 original, NanoPlus reduce el peso a 11,74 GB (3,01 bits por peso) con un incremento de perplejidad en WikiText-2 de +1,0137 puntos (+13,87 %) respecto a la referencia. La arquitectura subyacente combina mHC (manifold-constrained Hyper-Connections), Multi-head Latent Attention (MLA) y una capa Multi-Token Prediction (MTP), con 256K de contexto nativo ampliable a 512K.

Es un modelo pensado para inferencia local con llama.cpp, para tareas de razonamiento, código y flujos agénticos, y con la salvedad importante de que la variante abliterada elimina los mecanismos de rechazo del modelo base. La licencia Apache 2.0 facilita el uso comercial, aunque la naturaleza del checkpoint abliterado exige controles adicionales en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC (manifold-constrained Hyper-Connections), MLA (Multi-head Latent Attention) y una capa MTP (Multi-Token Prediction) |
| Parametros totales | 31.215.031.088 (31,2B) |
| Parametros activos | Aproximadamente 4B por token (64 expertos enrutados, 4 seleccionados por token, más 1 experto compartido siempre activo) |
| Longitud de contexto | 262.144 tokens nativos (256K), ampliable a 512K según documentación del modelo original |
| Tipos de cuantizacion | GGUF con cuantización personalizada APEX-I-NanoPlus (3,01 BPW); también existe la variante APEX-I-MiniPlus V2.1 (3,42 BPW) del mismo autor |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo base es un MoE de 40 capas transformer principales. Las capas 0 y 1 son capas FFN densas (`first_k_dense_replace: 2`); las capas 2 a 39 son capas MoE con 64 expertos enrutados, 4 seleccionados por token y un experto compartido siempre activo. Se añade un bloque MTP adicional almacenado como `blk.40` en el GGUF. La combinación de mHC y MLA está orientada a eficiencia en el uso de memoria y a la estabilidad del entrenamiento en contextos largos.

El entrenamiento original, según XingChen-AGI, se realizó sobre la pila Ascend NPU / MindSpore, con 256K de contexto nativo y extensión documentada a 512K. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El checkpoint abliterado de huihui-ai aplica un procedimiento de eliminación de rechazos basado en `Sumandora/remove-refusals-with-transformers`; esta cuantización GGUF no realiza ningún procedimiento adicional de eliminación de rechazos, solo comprime el checkpoint ya modificado.

La innovación técnica de esta publicación es la asignación de precisión por tensor: NanoPlus concentra bits en las proyecciones residuales de salida, las dos capas densas de entrada, MLA, mHC, los routers y la ruta de salida, mientras reduce la precisión de determinadas proyecciones gate/up de los expertos enrutados para alcanzar los 11,74 GB. El autor reporta que la perplejidad se midió directamente sobre los binarios GGUF con `llama-perplexity` sobre WikiText-2 (contexto 2048, batch 512, 10 chunks).

## Capacidades
- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento (el modelo está posicionado para reasoning, según los tags del autor).
- Generación y asistencia en código (tag `coding`).
- Planificación agéntica y uso de herramientas (tag `agentic`).
- Contexto largo: hasta 256K tokens nativos, ampliable a 512K según el modelo original.
- Decodificación con Multi-Token Prediction (MTP) para acelerar la generación en implementaciones que lo soporten.
- Variante abliterada: no aplica rechazos por contenido, lo que permite respuestas sin las restricciones del modelo alineado original.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documentan capacidades de visión, audio ni otros modos multimodales en la información disponible.

## Casos de uso
- Asistencia de código en local: con 4B de parámetros activos por token y 11,74 GB de peso, se puede desplegar en una estación de trabajo con GPU de consumo y usarse como copiloto de programación integrado en el editor, manteniendo contexto de varios ficheros gracias a la ventana de 256K.
- Agentes autónomos con herramientas: el modelo está etiquetado como agéntico y soporta contextos largos, lo que permite mantener el historial de pasos, resultados de herramientas y planes intermedios sin truncar en flujos multi-step.
- Análisis de documentos extensos: resumen y extracción de información sobre contratos, informes o bases de código que superen los 100K tokens, aprovechando el contexto nativo de 256K.
- Atención al cliente automatizada en inglés y chino: conversaciones multi-turno con memoria de contexto amplia y despliegue en servidores modestos gracias al reducido tamaño del cuantizado.
- Investigación sobre alineación y seguridad: al ser una variante abliterada, sirve para estudiar el comportamiento de modelos sin rechazos, comparar respuestas frente al modelo alineado y evaluar sesgos residuales.
- Prototipado rápido en entornos con VRAM limitada: NanoPlus deja unos 2 GB de margen frente a MiniPlus V2.1, lo que permite ampliar la ventana de contexto o el offload parcial en configuraciones híbridas RAM/GPU.
- Generación de contenido y redacción técnica: la ausencia de rechazos permite trabajar con temáticas sensibles (ficción, seguridad, análisis de contenido) sin bloqueos, siempre con revisión humana.

## Benchmarks y rendimiento
Los únicos datos medidos y publicados en la información disponible son de perplejidad sobre WikiText-2:

| Metrica | BF16 fuente | APEX-I-NanoPlus | APEX-I-MiniPlus V2.1 |
|---|---|---|---|
| Perplejidad WikiText-2 | 7,3060 +/- 0,18633 | 8,3197 +/- 0,21528 | 7,7238 +/- 0,19671 |
| Delta frente a BF16 | 0 | +1,0137 (+13,87 %) | +0,4178 (+5,71 %) |
| Tamano GGUF | 62,40 GB | 11,74 GB | 13,76 GB |
| BPW medio | 16,00 | 3,01 | 3,42 |
| Calidad práctica objetivo | Precisión completa | Clase Q4_K_M / Q4_K_S | Clase Q5_K_M |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el fichero pesa 11,74 GB; con overhead de contexto y caché KV, se recomienda al menos 14-16 GB de VRAM para offload completo del modelo, y más si se usan ventanas de contexto muy largas.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) para despliegues con contexto largo o concurrencia.
- GPU de consumo: cabe en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con contexto moderado; en tarjetas de 12 GB requiere offload parcial a RAM.
- Despliegue: llama.cpp es el runtime principal (formato GGUF); también es compatible con entornos de endpoints según los tags del autor. No se documenta soporte explícito de vLLM o TGI para este cuantizado.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona una sección de "Hardware Throughput: GPU Projections & Tested RAM Offload" en la model card, pero no se incluyen cifras en el extracto disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Xing4.0-29B-A4B APEX-I-NanoPlus (este) | 31,2B | ~4B | 256K (512K ampliable) | Apache 2.0 | GGUF 3,01 BPW | Variante abliterada, 11,74 GB |
| Xing4.0-29B-A4B APEX-I-MiniPlus V2.1 | 31,2B | ~4B | 256K (512K ampliable) | Apache 2.0 | GGUF 3,42 BPW | Variante abliterada, 13,76 GB, mejor PPL (7,72) |
| Huihui-Xing4.0-29B-A4B-abliterated | 31,2B | ~4B | 256K (512K ampliable) | Apache 2.0 | Safetensors (BF16) | Checkpoint fuente abliterado, 62,40 GB |
| XingChen-AGI/Xing4.0-29B-A4B | 29B (nominal) | ~4B | 256K (512K ampliable) | Apache 2.0 | Safetensors | Modelo original alineado, sin abliterar |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- La variante abliterada elimina los mecanismos de rechazo del modelo original; puede generar contenido dañino, ofensivo o inseguro sin filtros, lo que exige moderación externa en producción.
- La cuantización a 3,01 BPW incrementa la perplejidad un 13,87 % frente a BF16; se espera degradación en tareas sensibles a precisión, como matemáticas complejas o código de baja tolerancia a errores.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la compresión agresiva y por la ausencia de alineación en la variante abliterada.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El contexto de 256K consume gran cantidad de memoria en caché KV; en configuraciones de 12-16 GB habrá que reducirlo o usar cuantización de la caché.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin rechazos puede incumplir políticas de plataformas o normativas sectoriales; se recomienda revisión legal.
- No hay benchmarks de tareas publicados; las etiquetas de calidad ("Q4_K_M-class") son estimaciones del autor basadas en perplejidad, no en evaluaciones funcionales.
- El modelo base se entrenó sobre Ascend NPU / MindSpore; no se documentan detalles de dataset ni de fases de alineación, lo que dificulta evaluar sesgos concretos.

## Enlaces
- Hugging Face (este modelo): https://huggingface.co/IsValorum/Xing4.0-29B-A4B-APEX-I-NanoPlus-Abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated
- Modelo original: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Variante MiniPlus V2.1 del mismo autor: https://huggingface.co/IsValorum/Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Método de abliteración referenciado: https://github.com/Sumandora/remove-refusals-with-transformers
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
