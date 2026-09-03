# jarrelscy/GLM-5.3-Vision-NVFP4-AQLM-hybrid-1m

## Resumen

GLM-5.3-Vision-NVFP4-AQLM-hybrid-1m es un modelo de lenguaje multimodal (texto e imagen) de la familia GLM, cuantizado con una estrategia híbrida por experto que combina NVFP4 y AQLM. Desarrollado por el usuario jarrelscy sobre el checkpoint base RadixArk/GLM-5.3-NVFP4, esta variante está optimizada para servir una ventana de contexto completa de 1 millón de tokens en hardware de 4× B200, reduciendo el peso del checkpoint en 14,8 GiB respecto a la variante de 7100 expertos calientes. El modelo integra la torre de visión de GLM-5.2V (byte-idéntica) y un proyector, lo que le permite procesar imágenes junto con texto.

Con 210.042 millones de parámetros y una arquitectura de mezcla de expertos (MoE) con 19.200 expertos, el modelo emplea una partición en dos niveles: un 30% de expertos "calientes" (seleccionados por relevancia de routing) se mantienen en NVFP4 con 4,5 bits efectivos, mientras que el 70% restante se comprime a 2 bits con AQLM. Esta configuración permite servir el contexto de 1M tokens con una calidad en dominio (código, tareas técnicas y agénticas) dentro del 2-4% del donante sin cuantizar, a costa de una degradación mayor en texto general (wikitext +26,5% de perplexity). El modelo se distribuye bajo licencia MIT y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 19.200 expertos, 75 capas + capa MTP (78), torre de vision MoonViT + proyector PatchMerger, backbone GlmMoeDsa |
| Parametros totales | 210.042.476.626 (~210B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (4,5 bpw efectivo) para expertos calientes, AQLM 2 bpw (1×16 codebook, group 8) para expertos frios, NVFP4 para capa MTP y pesos no experto |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 19.200 expertos distribuidos en 75 capas, más una capa adicional de predicción multi-token (MTP) en la posición 78 con 256 expertos. La cuantización híbrida sigue un esquema de dos niveles: los expertos calientes (5.750 de 19.200, un 30%) se mantienen en NVFP4 con 4,5 bits efectivos, seleccionados por capa mediante la puntuación REAP (saliencia ponderada por routing multiplicada por el error de cuantización de 2 bits) sobre un conjunto de calibración de 15 millones de tokens. Los expertos fríos se comprimen a 2 bits con AQLM (codebook 1×16, grupo 8) y se re-entrenan mediante PV-tuning: los codebooks y escalas se optimizan por gradiente descendente contra la salida del donante, manteniendo los códigos congelados. La capa MTP se requantiza de BF16 a NVFP4 con un error relativo de Frobenius de aproximadamente 0,095.

La parte de visión se injerta desde GLM-5.2V: la torre de visión y el proyector son byte-idénticos a los de baseten/GLM-5.2-Vision-NVFP4, con un procesador estilo Kimi-K2.5. El encoder fue entrenado contra el backbone de texto congelado de 5.2, y la deriva entre 5.2 y 5.3 es pequeña (similitud coseno media de embeddings de fila 0,992). No se ha realizado un benchmark fino de VQA/OCR de esta variante híbrida. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO).

## Capacidades

- Generación de texto y razonamiento: modelo de propósito general de ~210B parámetros, capaz de tareas de lenguaje natural, razonamiento lógico y matemático (no se han publicado benchmarks específicos).
- Procesamiento de imágenes: integra torre de visión y proyector, permitiendo entrada multimodal (imagen + texto) para tareas de descripción, VQA y OCR, aunque la calidad fina no ha sido evaluada en esta variante.
- Contexto ultralargo: ventana de 1 millón de tokens, adecuada para documentos extensos, repositorios de código completos o conversaciones de muchas vueltas.
- Predicción multi-token (MTP): capa adicional que acelera la generación al predecir varios tokens a la vez.
- Soporte de tool calling / function calling: no se especifica en la información disponible.
- Soporte de agentes y multi-step reasoning: no se especifica explícitamente, aunque la arquitectura y el entrenamiento orientado a código sugieren capacidad para tareas agénticas.
- Capacidades multilingües: no se indica qué idiomas soporta.

## Casos de uso

- Analisis de documentos extensos con imagenes: el contexto de 1M tokens permite procesar informes anuales, expedientes clinicos o contratos legales de cientos de paginas, incluyendo graficos y tablas escaneadas, en una sola pasada. El modelo puede resumir, extraer datos y responder preguntas sobre el contenido mixto.
- Asistente de codigo con repositorio completo: al caber un repositorio entero en la ventana de contexto, el modelo puede sugerir refactorizaciones, explicar funciones, detectar bugs y generar tests sin necesidad de dividir el codigo en fragmentos. Su calibracion esta sesgada hacia contenido tecnico, lo que favorece este escenario.
- Agente multimodal de soporte tecnico: combinando capturas de pantalla, logs y descripciones textuales, el modelo puede diagnosticar problemas de software o infraestructura, proponer soluciones y redactar documentacion de incidencias.
- Generacion de documentacion a partir de diagramas y texto: dado un diagrama de arquitectura (imagen) y notas dispersas, el modelo puede producir documentacion tecnica coherente y detallada.
- Busqueda y sintesis de grandes corpus tecnicos: con 1M de contexto, se pueden cargar manuales, especificaciones y articulos cientificos para generar resumenes comparativos o extraer conclusiones transversales.
- Chat conversacional con memoria persistente larga: el contexto amplio permite mantener historiales de conversacion muy extensos sin perder informacion, util para asistentes virtuales de atencion al cliente o tutoria personalizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una tabla de perplexity teacher-forced (ventanas de 2048 tokens no solapadas, con dequantizacion BF16 en A100) que compara el donante sin cuantizar, la variante de 7100 expertos calientes y esta variante de 5750:

| Conjunto | Donante BF16-dequant | Variante 7100-hot | Esta variante (5750-hot, 1M) |
|---|---|---|---|
| heldout | 2,9002 | 2,9331 (+1,1%) | 2,9482 (+1,7%) |
| heldout-xl | 2,6047 | 2,6721 (+2,6%) | 2,6964 (+3,5%) |
| wikitext-2 | 3,0150 | 3,6952 (+22,6%) | 3,8132 (+26,5%) |
| github (post-2026-06) | 2,7469 | 2,7654 (+0,7%) | 2,7668 (+0,7%) |

La degradacion en wikitext refleja un sesgo del conjunto de calibracion hacia codigo y contenido tecnico, tanto en la masa de routing como en las estadisticas de saliencia. En dominios dentro del ambito de calibracion, la calidad esta dentro del 2-4% del donante.

## Requisitos de hardware

- Para servir el contexto completo de 1M tokens se requieren 4× GPU B200 (Blackwell) con configuracion TP4, MTP activado y DCP4. El peso del checkpoint es de 272,7 GiB (el repositorio ocupa 293,8 GB), y los 12,11 GiB/GPU de requisito de KV para 1M tokens se cubren con el ahorro de pesos de esta variante (utilizacion 0,97).
- No se proporcionan requisitos para GPUs de menor capacidad ni para contextos reducidos. Dado el tamano del modelo (~210B parametros), es improbable que quepa en una GPU consumer (p. ej., RTX 4090 con 24 GB) incluso con cuantizacion agresiva; se necesitarian multiples GPUs de alta gama o despliegue distribuido.
- Opciones de despliegue: sglang/vLLM con el metodo de cuantizacion `nvfp4_aqlm_hybrid` (que enruta cada experto al camino de dequantizacion NVFP4 o AQLM segun `hyb_kind`) y el wrapper glm5v. No se mencionan alternativas como llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (mismo tamano o misma tarea). La unica comparativa publicada es interna: frente al donante BF16-dequant y la variante de 7100 expertos calientes, cuyos resultados de perplexity se muestran en la seccion de benchmarks. No se han encontrado datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo de calibracion: el conjunto de calibracion de 15M tokens esta fuertemente orientado a codigo y contenido tecnico, lo que provoca una degradacion notable en texto general (wikitext +26,5% de perplexity). Para uso en dominios no tecnicos, la calidad puede ser significativamente inferior.
- Calidad de vision no verificada: la integracion de la torre de vision se ha validado con una sonda en A100 (preferencia de caption correcta con margenes amplios), pero no se ha benchmarkeado VQA/OCR fino. El rendimiento real en tareas visuales complejas es incierto.
- Riesgo de alucinacion: como todo modelo generativo grande, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento o con informacion no presente en el contexto.
- Limitaciones de contexto: aunque la ventana es de 1M tokens, el rendimiento en los extremos de esa ventana no se ha evaluado; la calidad puede degradarse en segmentos muy largos.
- Restricciones de licencia: el modelo se distribuye bajo MIT, lo que permite uso comercial, pero el modelo base (GLM-5.3) y sus componentes (torre de vision GLM-5.2V) pueden tener licencias o condiciones adicionales no detalladas en la model card.
- Requisitos de hardware elevados: el despliegue practico exige infraestructura de multiples GPUs B200, lo que limita su uso a entornos con presupuesto de hardware alto.
- Es una cuantizacion: aunque los checks de dequantizacion son bit-exactos para expertos calientes y codigos frios, la acumulacion de errores de redondeo puede afectar a tareas de precision numerica o logica estricta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jarrelscy/GLM-5.3-Vision-NVFP4-AQLM-hybrid-1m
- Variante de 7100 expertos calientes: https://huggingface.co/jarrelscy/GLM-5.3-Vision-NVFP4-AQLM-hybrid
- Modelo base cuantizado: https://huggingface.co/RadixArk/GLM-5.3-NVFP4
- Torre de vision de referencia: https://huggingface.co/baseten/GLM-5.2-Vision-NVFP4
