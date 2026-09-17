# Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r04

## Resumen

El modelo `Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r04` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` que ha sido comprimido con la técnica SVD-LLM hasta conservar el 60,0 % de los parámetros densos (eliminación del 40,02 %) y posteriormente editado mediante 4 de las 10 rondas previstas de un procedimiento iterativo de intercambio de componentes neutro en parámetros, gobernado por la regla de selección `gap_iter` con un presupuesto de 0,1 % de parámetros densos por ronda (presupuesto total de la ejecución completa: 1,0 %). Lo publica el usuario Jeesup como artefacto de investigación, no como asistente conversacional de propósito general.

El problema que aborda es la pérdida de comportamiento de seguridad inducida por la compresión de pesos: la compresión SVD degrada los mecanismos de rechazo del modelo original y eleva la tasa de éxito de ataques (ASR). El estudio mide ese deterioro y prueba distintas reglas de selección de componentes para repararlo. Este checkpoint concreto es una celda de una rejilla experimental sobre reglas y presupuestos, y representa un estado intermedio de una ejecución más larga.

Por su naturaleza, es relevante para investigadores en seguridad, compresión de modelos e interpretabilidad, no para despliegue en producción. El repositorio tiene 13,5 GB, cero descargas y cero likes, y no incluye idiomas declarados ni resultados de benchmarks de capacidades. La model card advierte explícitamente de que varias celdas de la rejilla están degradadas en seguridad de forma deliberada y de que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7B-chat) con pesos comprimidos por descomposición SVD de bajo rango (SVD-LLM) y edición posterior por intercambio iterativo de componentes |
| Parametros totales | 6.738.415.616 según los tensores safetensors del repositorio. La model card declara una fracción resultante de 0,5998 respecto al modelo denso (discrepancia no resuelta; ver limitaciones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7B-chat; no se documenta modificación) |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos se distribuyen en safetensors de precisión completa (fp16/bf16) y requieren conversión externa para int8, 4-bit, GPTQ, AWQ o GGUF |
| Idiomas soportados | no disponible (el modelo base está orientado principalmente al inglés) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers, pipeline text-generation) |

## Arquitectura y entrenamiento

La base es Llama-2-7B-chat: un transformer decoder-only con 32 capas, dimensión de modelo 4.096, 32 cabezas de atención, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y vocabulario SentencePiece de 32.000 tokens, entrenado sobre 2 billones de tokens y ajustado con RLHF (rejection sampling más PPO) según la documentación pública de Meta. No hay reentrenamiento ni ajuste fino adicional en este checkpoint; la modificación es puramente estructural sobre los pesos.

Sobre ese punto de partida se aplica SVD-LLM para eliminar el 40,02 % de los parámetros mediante descomposición de bajo rango de las matrices de proyección. Después se ejecuta un procedimiento de intercambio de componentes neutro en parámetros: en cada ronda se restauran y se expulsan componentes según la regla `gap_iter`, con un valor de intercambio `insert` (solo valor de inserción, con expulsión ordenada por sigma). En este checkpoint se han restaurado 2.617 componentes y se han expulsado 2.609, con 25.889.792 parámetros insertados (0,40 % de los parámetros de proyección densos) y una semilla fija de 42. Solo se han aplicado 4 de las 10 rondas previstas, por lo que es un estado intermedio. La nomenclatura del identificador resume la configuración: `l2` (Llama 2), `remove40` (40 % eliminado), `swapgapiter` (intercambio con regla `gap_iter`), `evfront` (selección orientada a la parte frontal de la evicción), `b010` (presupuesto de 0,1 % por ronda) y `r04` (ronda 4).

## Capacidades

- Generación de texto conversacional: conserva la interfaz de chat del modelo base, con plantilla de diálogo de Llama-2-chat.
- Razonamiento y conocimiento general: capacidades heredadas de Llama-2-7B-chat, pero degradadas de forma no cuantificada por la compresión SVD del 40 % de los parámetros; no se aportan benchmarks de capacidades.
- Comportamiento de rechazo: parcialmente restaurado respecto al checkpoint solo comprimido, según las métricas de seguridad declaradas (ASR de 0,31 en AdvBench y 0,315 en StrongREJECT).
- Tool calling / function calling: no documentado; Llama-2-7B-chat no incluye soporte nativo de llamadas a herramientas.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base está optimizado para inglés.
- Capacidades especiales: ninguna (sin visión, sin audio, sin modo de razonamiento explícito).
- Compatibilidad de despliegue: etiquetado como compatible con text-generation-inference y endpoints_compatible.

## Casos de uso

- Investigación sobre seguridad en modelos comprimidos: medir cómo varía la tasa de éxito de ataques (ASR) al aplicar SVD-LLM con distintos presupuestos de eliminación, usando este checkpoint como punto de comparación dentro de la rejilla.
- Ablación de reglas de selección de componentes: comparar la regla `gap_iter` frente a otras reglas del estudio manteniendo constante el presupuesto (1,0 %) y la semilla (42), para aislar el efecto de la selección en el comportamiento de rechazo.
- Evaluación de sobre-rechazo: usar la métrica macro de sobre-rechazo medida con WildGuard (0,0515) para calibrar el equilibrio entre seguridad y utilidad tras la compresión.
- Red-teaming controlado: servir el modelo en un entorno aislado con vLLM o TGI y ejecutar conjuntos de prompts adversarios (AdvBench, StrongREJECT) con un juez HarmBench para reproducir las cifras publicadas.
- Trazabilidad de artefactos de compresión: emplear los campos de procedencia de la model card (componentes restaurados y expulsados, parámetros insertados, fracción resultante) como plantilla de documentación reproducible en otros pipelines de compresión.
- Estudio de interpretabilidad: analizar qué componentes concretos de las matrices de proyección, al ser restaurados, recuperan el comportamiento de seguridad, lo que puede orientar hipótesis sobre localización de capacidades.
- Pruebas de formato y compatibilidad: validar la carga del checkpoint en transformers, su tokenizador y su plantilla de chat como caso de prueba de herramientas de serialización y conversión a GGUF.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún flujo orientado a usuarios finales, dado que es un artefacto de investigación con seguridad degradada.

## Benchmarks y rendimiento

La model card solo publica métricas de seguridad, no de capacidades. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidades en la información disponible.

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,3100 (31,00 %) | HarmBench judge |
| StrongREJECT ASR | 0,3150 (31,50 %) | HarmBench judge |
| Sobre-rechazo macro | 0,0515 (5,15 %) | WildGuard |

No se proporcionan las cifras equivalentes del modelo base `meta-llama/Llama-2-7b-chat-hf` ni de otros brazos de la rejilla, por lo que no es posible calcular la recuperación relativa a partir de los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia (sobre 6,74 mil millones de parámetros): aproximadamente 13,5 GB en fp16/bf16 solo para pesos; en int8 unos 6,7 GB; en 4 bits unos 3,5-4 GB.
- Caché KV: con 32 capas, 32 cabezas y dimensión de cabeza 128, la caché en fp16 ocupa alrededor de 0,5 MB por token, es decir, cerca de 2 GB con los 4.096 tokens de contexto completos. Se suma a la VRAM de los pesos.
- GPU de centro de datos: viable en A100 40/80 GB, H100 y L40S sin problemas, incluso en fp16 y con contexto completo.
- GPU de consumo: cabe en fp16 en RTX 3090 y RTX 4090 (24 GB) con contexto moderado; en 4 bits es viable en RTX 3060 de 12 GB, RTX 4070 y similares.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (etiqueta declarada), vLLM y endpoints compatibles. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Seguridad (ASR) | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (SVD-LLM 60 % + 4 rondas `gap_iter`) | 6.738.415.616 según safetensors; fracción declarada 0,5998 del denso | 4.096 tokens | Llama 2 Community License | AdvBench 0,3100 / StrongREJECT 0,3150 | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | no disponible en la información proporcionada | HuggingFace, ampliamente usado |
| Otras celdas de la misma rejilla de compresión (Jeesup) | no disponible | no disponible | Llama 2 Community License | no disponible | no disponible en la información proporcionada |

No se han identificado en la información disponible otros modelos comprimidos comparables con métricas de seguridad publicadas (por ejemplo, variantes de SVD-LLM, SliceGPT o LLM-Pruner sobre Llama-2-7B-chat), por lo que la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica que varias celdas de la rejilla están degradadas en seguridad de forma deliberada y que el checkpoint no debe tratarse como un asistente desplegable.
- Seguridad degradada: la tasa de éxito de ataques publicada es alta (0,3100 en AdvBench y 0,3150 en StrongREJECT con juez HarmBench), muy superior a la esperable en el modelo base sin comprimir.
- Discrepancia en el recuento de parámetros: los tensores safetensors suman 6.738.415.616 parámetros, idéntico al recuento del Llama-2-7B-chat denso, mientras que la model card declara una fracción resultante de 0,5998 (unos 4.040 millones). Conviene verificar las formas reales de las matrices antes de asumir el grado de compresión.
- Estado intermedio: solo se han aplicado 4 de las 10 rondas previstas, por lo que el comportamiento puede diferir del de la ejecución completa.
- Sin datos de capacidades: no hay MMLU, HumanEval ni GSM8K, de modo que la pérdida de rendimiento general por la compresión no está cuantificada.
- Idiomas no declarados: el modelo base está orientado al inglés y no se documenta soporte multilingüe.
- Sin cuantizaciones oficiales: cualquier despliegue en 4 bits u 8 bits requiere conversión y validación propias.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por la compresión; no se ha medido.
- Restricciones de licencia: Llama 2 Community License. Es obligatorio incluir el aviso de licencia, usar la denominación "Llama 2" al inicio del nombre de cualquier trabajo derivado, cumplir la política de uso aceptable (`USE_POLICY.md`) y tener en cuenta la cláusula que restringe el uso comercial a entidades con menos de 700 millones de usuarios activos mensuales. El repositorio incluye `LICENSE.txt` y `USE_POLICY.md` y declara "Built with Llama 2".
- Sesgos: no se documenta ningún análisis de sesgo para este checkpoint; los sesgos del modelo base se mantienen sin evaluar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Perfil del autor: https://huggingface.co/Jeesup
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre el servicio de música Spotify en chino) y no aportan enlaces de papers, blogs, repositorios ni demos relevantes. No se dispone de paper asociado ni de repositorio de código en la información proporcionada.
