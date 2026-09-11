# Solstice-AI/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-UltraOptimised-MTP-GGUF-1M

## Resumen

Solstice-AI/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-UltraOptimised-MTP-GGUF-1M es un repositorio de pesos cuantizados en formato GGUF publicado por el usuario Solstice-AI. Se presenta como una derivación del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, que a su vez se apoya en la nomenclatura de la familia Qwen (Qwen3.8) con un supuesto tamano de 27.000 millones de parametros, una ventana de contexto declarada de 1.000.000 de tokens y soporte multimodal (pipeline image-text-to-text).

El paquete combina varias etiquetas que describen optimizaciones de inferencia (MTP, decodificación especulativa con modelo draft bajo el nombre dspark, cuantizador TurboQuant) y modificaciones de alineamiento (uncensored, abliterated, Project Heretic, Cold Fusion). Todo ello apunta a un artefacto orientado a despliegue local con llama.cpp u Ollama, con vision integrada y contexto muy largo, en lugar de a un modelo entrenado desde cero por un laboratorio con ficha técnica publicada.

Su relevancia potencial reside en reunir en un solo GGUF tres características poco frecuentes a la vez: contexto de 1M tokens, vision (mmproj) y pesos sin censura. Sin embargo, el repositorio no incluye ficha técnica, no publica cifras de benchmarks y registra 0 descargas y 0 likes, por lo que cualquier afirmación de rendimiento debe considerarse no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Los tags indican familia Qwen (decoder-only transformer) con MTP (multi-token prediction) y decodificación especulativa; no hay ficha arquitectónica publicada |
| Parámetros totales | 27B (deducido de la nomenclatura "27B" del nombre del modelo; no confirmado por documentación) |
| Parámetros activos | No aplica: no se declara arquitectura MoE en la información disponible |
| Longitud de contexto | 1.000.000 de tokens (1M) según el nombre y los tags; se menciona escalado RoPE tipo YaRN |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS (todos GGUF) |
| Idiomas soportados | en, zh (inglés y chino según los tags del repositorio) |
| Licencia | apache-2.0 según el tag del repositorio; el campo de licencia consultado devuelve "no disponible". Se debe verificar la licencia del modelo base y del original subyacente |
| Formato de pesos | GGUF (llama.cpp). Incluye proyector multimodal mmproj |
| Modalidad | Texto e imagen (image-text-to-text, vision, multimodal) |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored |
| Dataset declarado | Solstice-AI/Solace-1.0-Omni |
| Herramientas compatibles | llama.cpp, Ollama (según tags) |
| Fecha de publicación | 2026-09-11 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

No se dispone de información verificable sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineamiento. Los tags permiten inferir únicamente lo siguiente: se trata de un transformer decoder-only de la familia Qwen, con soporte de MTP (multi-token prediction) y de decodificación especulativa mediante un modelo draft (etiqueta dspark), y con escalado de RoPE tipo YaRN para extender la ventana de contexto hasta 1M tokens. El repositorio es una cuantización, no un entrenamiento nuevo: el trabajo declarado consiste en convertir el modelo base de DavidAU a GGUF y ofrecer varios niveles de compresión.

Las etiquetas uncensored, abliterated, Project Heretic y Cold Fusion indican que el modelo base ha sufrido algún tipo de modificación de pesos orientada a eliminar comportamientos de rechazo. Este tipo de intervención (ablación de direcciones de rechazo en el espacio de activaciones o ajuste de capas específicas) suele alterar capacidades generales de forma no documentada. No hay publicado ningún informe de entrenamiento, curva de pérdida, mezcla de datos ni detalles sobre el dataset Solace-1.0-Omni más allá de su nombre.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados en los tags.
- Razonamiento con cadena de pensamiento (tags cot y reasoning); no se especifica si existe un modo thinking conmutable.
- Generación y comprensión de código, con menciones explícitas a SWE-bench, SWE-bench Pro y LiveCodeBench en las etiquetas.
- Procesamiento de contexto largo: la ventana declarada de 1M tokens permitiría ingerir repositorios o libros completos sin fragmentación, si bien no hay evidencia publicada sobre la calidad efectiva en esa longitud.
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text, tag vision, inclusión de mmproj), lo que habilita descripción de imágenes, lectura de diagramas y OCR aproximado.
- Decodificación especulativa mediante modelo draft (dspark) y MTP para aumentar el throughput en inferencia.
- Comportamiento sin censura (uncensored, abliterated): el modelo no aplica los filtros de rechazo habituales.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte explícito de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto declarados, el modelo podría recibir un monorepositorio entero o varios módulos relacionados en una sola pasada, evitando los errores típicos de fragmentación en pipelines RAG. Adecuado para auditorías de código y detección de dependencias cruzadas.
- Asistente de programación en local: al distribuirse en GGUF, se puede ejecutar con llama.cpp u Ollama en una estación de trabajo con GPU de 24-48 GB, sin enviar código propietario a servicios externos. Los tags de SWE-bench y LiveCodeBench sugieren un enfoque hacia tareas de reparación de bugs y generación de parches.
- Procesamiento de documentación técnica extensa: manuales, normativas o contratos de cientos de páginas que caben íntegros en el contexto, con preguntas de seguimiento sobre cualquier sección sin necesidad de reindexar.
- Extracción de información de documentos escaneados: gracias al proyector multimodal mmproj, permite combinar OCR aproximado, interpretación de tablas y diagramas, y resumen posterior en una sola llamada.
- Atención al cliente bilingüe inglés-chino: el modelo cubre ambos idiomas, aunque no se declaran más, lo que limita su uso en mercados hispanohablantes sin ajuste adicional.
- Investigación sobre alineamiento y seguridad: al ser un modelo abliterated, resulta útil como objeto de estudio para medir qué capacidades se degradan al eliminar los comportamientos de rechazo y cómo varía la tasa de cumplimiento ante peticiones dañinas.
- Procesamiento por lotes en servidor de inferencia: combinado con decodificación especulativa y MTP, puede emplearse en colas de generación de resúmenes o clasificación donde el throughput importa más que la latencia por token.
- Generación de pruebas automatizadas: dado su perfil de código y contexto largo, permite producir suites de tests unitarios a partir de un módulo completo más su documentación asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los tags del repositorio mencionan las pruebas SWE-bench, SWE-bench Pro, LiveCodeBench y ARC-Challenge (etiqueta 709-ARC), así como una comparación declarada con Claude Opus 4.6 (beats-claude-opus-4.6), pero no se adjunta ninguna cifra, configuración de evaluación ni metodología.

| Benchmark mencionado en tags | Resultado publicado |
|---|---|
| SWE-bench | No disponible |
| SWE-bench Pro | No disponible |
| LiveCodeBench | No disponible |
| ARC-Challenge (709-ARC) | No disponible |
| Comparación con Claude Opus 4.6 | Afirmación sin datos que la respalden |

## Requisitos de hardware

Estimaciones derivadas del tamaño declarado (27B parámetros) y del número de bits por peso de cada cuantización. No incluyen el KV cache ni el proyector multimodal:

- IQ4_XS: aproximadamente 14-15 GB de pesos.
- IQ4_NL: aproximadamente 15-16 GB.
- Q4_K_M: aproximadamente 16-17 GB.
- Q5_K_M: aproximadamente 19-20 GB.
- Q6_K: aproximadamente 22-23 GB.
- Q8_0: aproximadamente 28-30 GB.

Recomendaciones de GPU:

- Consumer: una RTX 4090 o RTX 5090 (24-32 GB) permite IQ4_XS o Q4_K_M con contexto moderado. Con 1M tokens de contexto el KV cache puede superar la VRAM disponible, por lo que conviene reducir la ventana efectiva o usar cuantización del KV cache.
- Una sola GPU profesional: A6000, L40S o RTX 6000 Ada (48 GB) admiten Q6_K o Q8_0 con contexto largo.
- H100 80 GB o A100 80 GB: necesarias para Q8_0 con ventanas muy largas; el KV cache a 1M tokens es el factor dominante y no puede calcularse con precisión sin conocer el número de capas y cabezas del modelo.
- Multi-GPU: el reparto por capas de llama.cpp permite dividir el modelo entre dos GPU de 24 GB para Q8_0.

Despliegue y rendimiento:

- llama.cpp y sus derivados (llama-server) son la vía natural, al tratarse de pesos GGUF.
- Ollama, si se importa el GGUF mediante Modelfile.
- LM Studio y otros frontends basados en llama.cpp.
- vLLM y TGI: soporte de GGUF limitado o inexistente; para estos motores habría que convertir a safetensors, paso que el repositorio no documenta.
- Latencia y throughput: no disponibles. La decodificación especulativa (dspark) y el MTP declarados deberían mejorar el throughput frente a una decodificación autoregresiva estándar, pero no se publican mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento general y no de la búsqueda web realizada; conviene verificarlos antes de publicarlos. Las cifras del modelo analizado no están confirmadas.

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Rendimiento publicado |
|---|---|---|---|---|---|
| Solstice-AI/Qwen3.8-27B-TWIN-TURBO (esta ficha) | 27B (declarado) | 1M (declarado) | apache-2.0 según tag, no confirmado | Sí (mmproj) | No disponible |
| Qwen3-32B | 32B | 128K ampliable | Apache-2.0 | No | Ampliamente documentado |
| Gemma 3 27B | 27B | 128K | Licencia Gemma | Sí | Ampliamente documentado |
| Mistral Small 3.x 24B | 24B | 128K | Apache-2.0 | Parcial según versión | Ampliamente documentado |

La diferencia principal frente a estas alternativas es la ventana declarada de 1M tokens y la naturaleza abliterated de los pesos, no una ventaja de rendimiento demostrada.

## Limitaciones y advertencias

- Ausencia total de validación: el repositorio registra 0 descargas y 0 likes, no incluye ficha técnica ni resultados de evaluación, y su fecha de creación (2026-09-11) figura en el futuro respecto al momento de redacción de esta ficha.
- Afirmaciones de marketing sin respaldo: etiquetas como beats-claude-opus-4.6 no van acompañadas de ninguna cifra ni metodología.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en un modelo modificado por abliteration puede aumentar, ya que la intervención sobre pesos suele degradar la calibración.
- Modelo abliterated: no aplica filtros de rechazo. Puede generar contenido ofensivo, ilegal o peligroso sin advertencia. Su uso en productos de cara al público exige una capa de moderación externa.
- Degradación por modificación de pesos: la eliminación de comportamientos de rechazo puede afectar negativamente a tareas de razonamiento, instrucciones complejas y coherencia en contextos largos. No hay estudios que cuantifiquen el daño.
- Contexto de 1M tokens: el rendimiento real a longitudes extremas suele ser muy inferior al declarado. Sin datos de evaluaciones tipo RULER o Needle-in-a-Haystack, la ventana efectiva es desconocida.
- Idiomas limitados a inglés y chino según los tags. El rendimiento en castellano no está garantizado y probablemente sea inferior.
- Licencia: el tag indica apache-2.0, pero el campo de licencia del repositorio devuelve "no disponible". Además, el modelo deriva de un modelo base de terceros (DavidAU) cuya licencia debe comprobarse por separado antes de cualquier uso comercial.
- Verificación de la procedencia: no existe confirmación de que "Qwen3.8-27B" corresponda a un modelo oficial de la familia Qwen. La nomenclatura puede ser una designación propia del autor del modelo base.
- Compatibilidad: al ser GGUF, no es directamente utilizable en vLLM o TGI sin conversión previa a safetensors.
- Dependencia de llama.cpp: las optimizaciones MTP y de decodificación especulativa solo funcionan si la versión del motor las implementa y si el modelo draft está disponible y es compatible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-UltraOptimised-MTP-GGUF-1M
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Dataset declarado: https://huggingface.co/datasets/Solstice-AI/Solace-1.0-Omni

La búsqueda web realizada no devolvió resultados relevantes para este modelo. Los únicos resultados obtenidos tratan sobre el solsticio como fenómeno astronómico (https://fr.wikipedia.org/wiki/Solstice, https://en.wikipedia.org/wiki/Solstice, https://icalendrier.fr/outils/equinoxes-solstices, https://www.futura-sciences.com/sciences/questions-reponses/astronomie-solstice-equinoxe-difference-8599/) y sobre la empresa de materiales avanzados Solstice Advanced Materials (https://www.solstice.com/gb/en/home). Ninguno guarda relación con el repositorio analizado, por lo que no se dispone de papers, blogs ni demos externos que documenten este modelo.
