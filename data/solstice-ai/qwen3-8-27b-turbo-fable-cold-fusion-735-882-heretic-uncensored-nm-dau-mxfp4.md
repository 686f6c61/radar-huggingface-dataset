# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4 es una cuantización MXFP4 (OCP Microscaling) publicada por Solstice-AI sobre el modelo base de DavidAU, un merge de la familia Qwen 3.8 de 27B orientado a razonamiento, código y uso sin restricciones de alineación. El checkpoint empaqueta los pesos en formato microscaling de 4 bits con escalas de 8 bits por bloque, lo que reduce el peso del repositorio a 19,9 GB para 26.896 millones de parámetros reales, manteniendo un contexto nativo declarado de 262.144 tokens y cabezas de decodificación especulativa (MTP).

El interés técnico está en dos frentes: por un lado, la arquitectura híbrida de atención lineal (mayoría de capas GDN con complejidad O(1) de memoria) combinada con GQA global, que hace viable el contexto largo sin el coste cuadrático habitual; por otro, el formato MXFP4 con soporte declarado en vLLM y en el runtime propietario Anvil, lo que lo sitúa como banco de pruebas para despliegue de modelos de ~27B en hardware de gama alta con memoria limitada.

Conviene tratarlo con cautela: la model card afirma una superioridad empírica sobre Claude Opus 4.6 Max en 9 de 9 benchmarks, pero no se aportan artefactos reproducibles ni detalles del arnés de evaluación, y parte de las cifras (ARC-C 735, ARC-E 882) no son porcentajes estándar. La ficha recoge esos datos como declaraciones del autor, no como resultados verificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 75% capas de atención lineal GDN (Gated Delta Recurrent Network) + 25% GQA global; cabezas MTP de decodificación especulativa |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 262.144 tokens (262K) declarados como nativos |
| Tipos de cuantización | MXFP4 (OCP Microscaling, bloques de escala de 8 bits sobre valores FP4); el repo incluye también artefactos GGUF y safetensors en 8 bits (compressed-tensors) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (incluye `mmproj-BF16.gguf` para visión), compressed-tensors 8-bit |

## Arquitectura y entrenamiento

El modelo base es un merge de pesos de la familia Qwen 3.8 (tag `qwen3_5` en Hugging Face) de ~27B, con una arquitectura híbrida en la que la mayor parte de las capas emplea atención lineal GDN de complejidad de memoria constante y una minoría usa atención global con GQA. Esa combinación es la que sostiene el contexto de 262K sin un coste de KV cache proporcional a la longitud de secuencia. Sobre esa base, DavidAU aplica un merge tipo GAIN (Guided Activation Interleaved Normalization) para combinar pesos de distintos checkpoints, y una fase de "abliteration" (Project Heretic) orientada a eliminar los vectores de rechazo del alignment original.

Solstice-AI no entrena el modelo: solo cuantiza y empaqueta. La contribución propia es la conversión a MXFP4 con el estándar de microscaling de OCP, que aplica una escala de 8 bits por bloque de valores FP4 para preservar rango dinámico, más el empaquetado de las cabezas MTP y del proyector multimodal BF16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original. Las cifras de speedup declaradas para MTP son de 1,72x a 2,20x, sin metodología de medición publicada.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de cadena de pensamiento (CoT) declarado en los tags del modelo.
- Generación y depuración de código, con orientación explícita a tareas de ingeniería de software agéntica (SWE-bench, SWE-bench Pro, LiveCodeBench en la model card).
- Control de sistemas operativos y automatización de interfaces (OSWorld, AndroidWorld según el autor).
- Seguimiento de restricciones complejas en instrucciones (IFBench) y flujos de trabajo multi-fichero de largo horizonte (CoWorkBench).
- Tool calling y function calling: implícito en el perfil agéntico declarado, aunque la model card no documenta el esquema de herramientas.
- Multimodalidad visión-texto: pipeline `image-text-to-text`, con proyector `mmproj-BF16.gguf` para esquemas, capturas de interfaz y fotogramas de vídeo.
- Decodificación especulativa mediante cabezas MTP integradas (dos tokens por pasada hacia delante según el autor).
- Multilingüe limitado a inglés y chino.
- Modo "uncensored": se eliminan los mecanismos de rechazo, sin filtros de contenido en la generación.

## Casos de uso

- Automatización de ingeniería de software en CI/CD: el modelo está orientado a parcheo de repositorios y depuración multi-fichero; con 262K de contexto puede ingerir árboles de proyecto completos y mantener el estado entre pasos de un agente de código.
- Agentes de control de escritorio y móvil: los resultados declarados en OSWorld y AndroidWorld apuntan a automatización de tareas de interfaz; útil para RPA avanzado donde los selectores clásicos fallan.
- Análisis de documentación técnica extensa: con contexto de 262K y atención lineal mayoritaria, es adecuado para resumir y consultar manuales, normativas o bases de código de gran tamaño sin troceado agresivo.
- Asistencia en investigación científica: el perfil ARC-C/ARC-E declarado sugiere razonamiento abstracto; aplicable a generación de hipótesis y resolución de problemas de nivel universitario, siempre con verificación humana.
- Procesamiento de esquemas e interfaces visuales: el proyector multimodal permite extraer estructura de diagramas de arquitectura, wireframes o capturas de UI para generar código o documentación.
- Despliegue en hardware con memoria ajustada: al ser MXFP4 con 19,9 GB de pesos, permite servir un modelo de ~27B en una sola GPU de 24 GB o en configuraciones multi-GPU modestas, algo inviable en BF16.
- Evaluación de seguridad ofensiva y análisis de malware: la eliminación de rechazos permite trabajar con contenido que los modelos alineados bloquean; requiere entorno aislado y control de acceso.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card. No se han verificado de forma independiente y no se detalla la metodología completa del arnés de evaluación.

| Suite | Qwen3.8-27B TURBO (declarado) | Claude Opus 4.6 Max (declarado) | Margen |
|---|---|---|---|
| SWE-bench Pro | 61,7% | 53,4% | +8,3 |
| LiveCodeBench v6 | 90,3% | 88,8% | +1,5 |
| QwenSWEBench | 79,0% | 63,8% | +15,2 |
| OSWorld-Verified | 84,3% | 72,7% | +11,6 |
| AndroidWorld | 81,9% | 62,0% | +19,9 |
| IFBench | 79,5% | 62,5% | +17,0 |
| CoWorkBench | 70,7% | 68,2% | +2,5 |
| ARC-C | 735 (8-bit) / 719 (4-bit) | ~710–720 | no comparable directamente |
| ARC-E | 882 | ~870 | no comparable directamente |

Las cifras de ARC-C y ARC-E no son porcentajes: probablemente corresponden a recuentos de aciertos sobre un conjunto de tamaño no especificado, por lo que la comparación con Opus 4.6 no es directa. No se publican resultados de MMLU, GSM8K, HumanEval ni evaluaciones independientes del efecto de la cuantización MXFP4 sobre la calidad.

## Requisitos de hardware

- VRAM para inferencia: ~20 GB en MXFP4 para los pesos; añadir KV cache. Con atención lineal mayoritaria, el crecimiento de KV cache con el contexto es menor que en un transformer denso equivalente, pero a 262K tokens sigue siendo significativo.
- GPU recomendadas: A100 40/80 GB, H100, L40S, y GPUs de 24 GB (RTX 4090, RTX 3090) para contextos moderados. El autor declara compatibilidad con AMD ROCm e Intel Gaudi.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 de 24 GB a cuantización MXFP4 y contextos cortos o medios; en 16 GB no hay margen para pesos más KV cache.
- Despliegue: vLLM (soporte MXFP4 declarado), runtime Anvil de Solstice Labs con compresión de KV cache TurboQuant, y artefactos GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles de forma verificable. El autor declara speedup de 1,72x–2,20x por las cabezas MTP, sin condiciones de medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Solstice-AI MXFP4) | ~26,9B | 262K | Apache 2.0 | safetensors, GGUF, MXFP4 | Cuantización de un merge comunitario; sin evaluación independiente |
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion (DavidAU, base) | ~27B | 262K (declarado) | Apache 2.0 | safetensors, GGUF | Mismo modelo sin cuantizar; referencia para medir la pérdida por MXFP4 |
| Qwen3 32B (familia oficial) | ~32B | 128K típico | Apache 2.0 | safetensors, GGUF, AWQ/GPTQ | Modelo oficial con evaluación publicada y soporte amplio en vLLM/llama.cpp |
| Mistral Small 3.x 24B | ~24B | 128K | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar, con benchmarks públicos verificables |

La comparación relevante es contra el modelo base sin cuantizar: es la única forma de medir cuánto degrada MXFP4 en tareas de código y razonamiento largo. No hay datos publicados para esa comparación.

## Limitaciones y advertencias

- Los benchmarks son declaraciones del autor sin artefactos reproducibles, sin semilla, sin versión del arnés y con cifras de ARC no expresadas como porcentaje. No deben citarse como resultados verificados.
- La cuantización a 4 bits (MXFP4) introduce degradación no medida; el propio autor reporta una caída en ARC-C de 735 a 719 entre 8 y 4 bits, lo que sugiere pérdida real en razonamiento abstracto.
- El modelo es un merge comunitario con abliteration: no hay evaluación de seguridad, y la eliminación de rechazos implica que puede generar contenido dañino, ilegal o inseguro sin filtro. No apto para exposición directa a usuarios finales sin moderación externa.
- Riesgo de alucinación no cuantificado; en tareas agénticas de código y control de sistemas, los errores se propagan a acciones reales.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- El contexto de 262K es una declaración del autor; no se aportan resultados de aguja en pajar ni de degradación a longitudes extremas.
- La licencia Apache 2.0 del checkpoint no resuelve por sí sola las obligaciones derivadas de los datos de entrenamiento del modelo original, que no se documentan.
- Dependencia de un runtime propietario (Anvil) para las rutas de despliegue optimizadas; el soporte en vLLM de MXFP4 depende de la versión.
- Fecha de creación declarada 2026-09-02 y actualización 2026-10-15, con solo 589 descargas y 1 like: tracción mínima, sin validación por parte de la comunidad.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Runtime Anvil (Solstice Labs): https://github.com/Solstice-Labs/anvil
- Organización Solstice-AI: https://huggingface.co/Solstice-AI
- Organización DavidAU: https://huggingface.co/DavidAU
- Especificación OCP Microscaling (MX): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
