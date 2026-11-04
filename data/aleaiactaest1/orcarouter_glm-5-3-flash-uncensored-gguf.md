# AleaiactaEst1/orcarouter_GLM-5.3-Flash-Uncensored-GGUF

## Resumen

GLM-5.3-Flash-Uncensored es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 320 759 404 382 parámetros totales y 18 000 millones activos por token, según los datos declarados por el autor de la cuantización. Se distribuye como cuantizaciones GGUF del checkpoint FP8 original de OrcaRouter, que a su vez deriva de la familia GLM de ZAI. La particularidad del modelo es que ha sido sometido a un proceso de abliteration: se han eliminado los mecanismos de rechazo de seguridad, de modo que el modelo cumple con peticiones que un modelo alineado rechazaría.

El repositorio lo publica el usuario AleaiactaEst1 bajo licencia MIT, con cuantizaciones de tipo IQ2_XXS, IQ2_S e IQ3_XXS generadas mediante una importance matrix propia y verificadas con una batería de coherencia sobre GPU H200 alquilada. Según la model card, el modelo usa 288 expertos enrutados con top-8, una ventana de contexto de 1 millón de tokens y soporte multimodal imagen-texto a través de un proyector separado (mmproj).

El interés actual del repositorio es doble: por un lado, permite ejecutar un MoE de 320B en hardware de consumo mediante cuantización agresiva; por otro, documenta de forma inusualmente transparente los fallos de las primeras versiones (bucles e incoherencia en IQ2_S por cuantizar tensores críticos) y su corrección. Es un modelo pensado para investigación en mecanismos de rechazo, red-teaming y evaluación de robustez, no para producción orientada al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (nombre interno `glm5-next` en llama.cpp) |
| Parametros totales | 320 759 404 382 |
| Parametros activos | 18 000 millones (288 expertos enrutados, top-8) |
| Longitud de contexto | 1 000 000 tokens (declarado en la model card) |
| Tipos de cuantizacion | IQ2_XXS, IQ2_S, IQ3_XXS (GGUF con imatrix propia) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards por cuantización) + mmproj para visión |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 288 expertos enrutados con activación top-8, expertos compartidos que se ejecutan en cada token, tres bloques FFN densos y un bloque MTP (multi-token prediction) identificado como `blk.45`. El checkpoint base es la versión FP8 de OrcaRouter, que aplicó el proceso de abliteration para eliminar las negativas de seguridad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original de ZAI.

La innovación técnica relevante de este repositorio no está en el modelo sino en el proceso de cuantización: se construyó una importance matrix propia (10 chunks, con una fila de experto sin cubrir en `blk.29`) y se mantuvieron en `q8_0` los tensores que se ejecutan en cada token (atención, expertos compartidos, bloques densos y embeddings), que en la primera versión se habían cuantizado junto con los expertos enrutados. Esa decisión provocó bucles e incoherencia en IQ2_S; la reconstrucción del 6 de septiembre de 2026 pasó las 48 pruebas de la batería de coherencia (12 tareas × 2 semillas × 2 samplers). El bloque MTP existe en los pesos pero mainline llama.cpp todavía no lo conecta (PR #27917 pendiente), por lo que la decodificación especulativa multi-token no está activa.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 1M tokens declarados).
- Razonamiento y matemáticas: la model card reporta mediciones propias sobre tareas de matemáticas en la comparación fork vs. mainline (KL 0.017).
- Generación de código: se evaluó con HumanEval y con una batería de 8 tareas de coding dentro del gate de coherencia.
- Visión imagen-texto: incluye proyector multimodal (`mmproj`, tipo `glm5v`) para entrada de imágenes.
- Tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente; el contexto de 1M es favorable pero no hay evidencia publicada.
- Modo thinking: no disponible en la información proporcionada.
- Multilingüismo: no disponible; la model card no declara lista de idiomas.

## Casos de uso

- Red-teaming y estudio de mecanismos de rechazo: el modelo ha sido abliterated, de modo que un equipo de seguridad puede comparar sus respuestas con las del GLM original y aislar qué direcciones de activación codifican la negativa. Es el uso declarado por el autor.
- Evaluación de robustez de filtros: desplegar el modelo como generador adversario para probar clasificadores de contenido y sistemas de moderación en pipelines propios.
- Investigación sobre cuantización extrema: el repositorio documenta el efecto de mantener atención y expertos compartidos en `q8_0` frente a cuantizarlos; sirve como caso de estudio reproducible para quien diseñe recetas de imatrix en MoE de 320B.
- Pruebas de coherencia y benchmarking de llama.cpp: los archivos permiten validar builds de mainline (requiere b11279 o superior) y medir divergencia KL entre implementaciones sobre los mismos pesos.
- Generación de código en local con contexto largo: con IQ3_XXS y una GPU de 80 GB o un setup multi-GPU, se puede usar para tareas de refactorización sobre repositorios grandes aprovechando la ventana de 1M tokens, aceptando el riesgo de contenido sin filtrar.
- Procesamiento de documentos con imágenes: el proyector mmproj permite extracción de información de capturas, diagramas o PDF rasterizados en flujos internos de investigación.
- Análisis de conversaciones multi-turno extensas: resumen y extracción sobre hilos de más de 100 000 tokens en entornos controlados de laboratorio.

## Benchmarks y rendimiento

Los datos publicados en la model card son mediciones internas del autor, no comparaciones estándar contra otros modelos:

| Prueba | Resultado |
|---|---|
| Gate de coherencia (12 tareas × 2 semillas × 2 samplers = 48) | IQ3_XXS original: 48/48; IQ2_S original: 45/48 (3 fallos en coding por agotar el límite de razonamiento); IQ2_S reconstruido: 48/48 |
| Repetición con `repeat_penalty` en IQ2_S original | 21/24 sin penalización → 21/24 con penalización (sin cambio) |
| Divergencia mainline vs. fork (KL) | 0,020 en prosa; 0,017 en matemáticas |
| Acuerdo top-1 mainline vs. fork | 94–96 % |
| JailbreakBench / HumanEval | medidos sobre IQ3_XXS original (e0f79f2); los valores numéricos no se incluyen en la información disponible |

No se han publicado resultados de MMLU, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 461,6 GB; cada cuantización se reparte en 3 shards. IQ2_XXS e IQ2_S rondan los 2-3 bits por peso (aproximadamente 80-110 GB en total, estimación a partir del tamaño del repo y de la nota de +7 GB al subir tensores a `q8_0`); IQ3_XXS es algo mayor.
- GPU recomendadas: H200 (usada por el autor para el gate), H100 80 GB, A100 80 GB. Para IQ2 se necesita al menos un nodo multi-GPU o una GPU con 96-141 GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090. Requiere offload a RAM del sistema o configuraciones multi-GPU con NVLink.
- Despliegue: llama.cpp mainline build b11279 o superior (obligatorio; builds anteriores fallan con `unknown model architecture: 'glm5next'`). Compatible con LM Studio tras la corrección del template Jinja en el shard 1 (2026-10-07). No hay confirmación de soporte en vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El bloque MTP no está conectado en mainline, por lo que no hay aceleración por decodificación especulativa nativa todavía.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored (este) | 320B | 18B | 1M | MIT | GGUF, FP8 | Abliterated, visión, imatrix propia |
| GLM-5.3-Flash (original ZAI) | 320B | 18B | 1M | no disponible | no disponible | Con alineamiento de seguridad; no se dispone de datos de benchmark comparativos |
| Alternativas MoE abliterated de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: cumple con peticiones dañinas, poco éticas o ilegales. El autor lo libera exclusivamente para investigación; el uso en producción orientada a usuarios finales es responsabilidad de quien lo despliega.
- Riesgo de alucinación elevado en cuantizaciones IQ2: la versión original de IQ2_S fallaba 3 de 8 tareas de coding razonando hasta el límite sin responder. Solo las reconstrucciones del 6 de septiembre de 2026 pasan el gate; IQ2_XXS permanece marcado hasta que pase la misma prueba.
- Mezcla de shards: mezclar shards antiguos y nuevos del mismo nombre de archivo corrompe la carga. Hay que descargar la carpeta completa.
- Compatibilidad frágil: requiere llama.cpp b11279 o superior; el template Jinja original rompe en LM Studio (corregido solo en el shard 1 republicado).
- Idiomas: no declarados; no hay garantía de calidad multilingüe fuera del inglés y el chino.
- Contexto: los 1M tokens son un dato declarado por el autor; no se ha verificado empíricamente en la información disponible y el rendimiento en ventanas extremas puede degradarse.
- Licencia MIT: permite uso comercial sin restricciones, lo que agrava el riesgo si se despliega sin filtros propios.
- Sesgos: no documentados; un modelo abliterated puede amplificar sesgos presentes en los datos de entrenamiento sin la atenuación que aporta el alineamiento.
- Sin soporte de MTP en mainline: el rendimiento real es inferior al que permitirían los tensores `blk.45` hasta que se fusione el PR #27917.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AleaiactaEst1/orcarouter_GLM-5.3-Flash-Uncensored-GGUF
- Modelo base FP8: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Discusión #1 (fallo de IQ2_S): https://huggingface.co/AleaiactaEst1/orcarouter_GLM-5.3-Flash-Uncensored-GGUF/discussions/1
- Discusión #2 (arquitectura `glm5next`): https://huggingface.co/AleaiactaEst1/orcarouter_GLM-5.3-Flash-Uncensored-GGUF/discussions/2
- Discusión #4 (template Jinja en LM Studio): https://huggingface.co/BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF/discussions/4
- PR #27754 de llama.cpp (fork original, cerrado sin fusionar): https://github.com/ggml-org/llama.cpp/pull/27754
- PR #27773 de llama.cpp (mainline, arquitectura `glm5-next`): https://github.com/ggml-org/llama.cpp/pull/27773
- PR #27917 de llama.cpp (soporte MTP): https://github.com/ggml-org/llama.cpp/pull/27917
