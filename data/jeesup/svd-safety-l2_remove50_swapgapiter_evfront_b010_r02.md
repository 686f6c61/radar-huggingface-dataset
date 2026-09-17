# Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r02

## Resumen

`svd-safety-l2_remove50_swapgapiter_evfront_b010_r02` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` creado por el usuario Jeesup. No es un modelo de propósito general, sino un artefacto de investigación: parte de Llama-2-7b-chat comprimido con SVD-LLM hasta el 50,0 % de los parámetros densos y después editado con dos rondas (de diez previstas) de una técnica de intercambio iterativo de parámetros neutro denominada "parameter-neutral swap", seleccionada con la regla `gap_iter`.

El objetivo del estudio es medir cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué reglas de selección de componentes permiten repararlo mejor. Este checkpoint es una celda concreta de una rejilla que cruza reglas de selección y presupuestos de restauración, por lo que debe tratarse como un sujeto experimental y no como un asistente desplegable.

El autor advierte explícitamente de que varias ramas de la rejilla están degradadas deliberadamente en seguridad respecto a Llama-2-7b-chat: la compresión por sí sola eleva la tasa de éxito de ataque, y el propósito es cuantificarlo. El repositorio tiene 0 descargas y 0 likes, un tamaño de 13,5 GB y licencia Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), con capas de proyección comprimidas mediante descomposición en valores singulares (SVD-LLM) |
| Parametros totales | 6.738.415.616 (recuento real de safetensors); el autor declara una fracción de parámetros resultante de 0,4999 respecto al modelo denso |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la base Llama-2-7b-chat emplea 4096 tokens |
| Tipos de cuantizacion | No disponible; no se publican variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible explícitamente; heredado de Llama-2, con sesgo claro hacia el inglés |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Pipeline | text-generation |
| Tamano del repositorio | 13,5 GB |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, RoPE y atención causal estándar. Sobre esa base se aplica SVD-LLM, que descompone las matrices de proyección en factores de bajo rango, eliminando el 50,01 % de los parámetros densos según la model card. El checkpoint no se ha reentrenado desde cero: es una edición estructural de un modelo ya ajustado por instrucciones.

Sobre el modelo comprimido se aplica un proceso iterativo de intercambio de parámetros "neutro" (parameter-neutral swap). En cada ronda se sustituye hasta el 0,1 % de los parámetros densos, con un presupuesto total previsto del 1,0 %; este checkpoint corresponde a 2 de las 10 rondas. La regla de selección empleada es `gap_iter`. Los datos declarados son: 1351 componentes restaurados, 1309 componentes sustituidos, 12.947.456 parámetros insertados (0,20 % de los parámetros de proyección densos), valor de intercambio `insert` (solo valor de inserción, con desalojo ordenado por sigma) y semilla 42. El autor no documenta el dataset, el número de tokens ni si hubo RLHF o DPO adicional; esas fases se heredan de Llama-2-7b-chat y no se detallan.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Llama-2-7b-chat, aunque degradada por la compresión y sin evaluación de utilidad publicada en la model card.
- Razonamiento básico y respuesta a instrucciones en inglés, con calidad no verificada en este checkpoint concreto.
- Generación de código y matemáticas elementales: capacidades propias de Llama-2-7b-chat, sin métricas publicadas para esta variante.
- Soporte de tool calling / function calling: no disponible de forma nativa (Llama-2-chat no incluye un formato de herramientas integrado).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; Llama-2 está optimizado principalmente para inglés.
- Capacidad especial: el modelo funciona como sujeto de medida de seguridad, con tasas de éxito de ataque (ASR) y de sobrerrechazo publicadas.
- Sin visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre compresión de modelos: permite medir cómo la eliminación del 50 % de parámetros en las proyecciones afecta a la perplejidad y a la utilidad frente al modelo denso original, usando la misma semilla (42) y la misma partición de evaluación.
- Estudio de la degradación de seguridad por compresión: con AdvBench ASR de 0,1650 y StrongREJECT ASR de 0,1500, sirve como punto de referencia cuantitativo para comparar contra Llama-2-7b-chat sin comprimir en pipelines de red-teaming.
- Evaluación de reglas de selección de componentes: al ser una celda de una rejilla sobre reglas (`gap_iter`) y presupuestos (1,0 % repartido en diez rondas de 0,1 %), se usa para comparar qué criterio repara mejor la seguridad tras la compresión.
- Análisis de interpretabilidad: los 1351 componentes restaurados y los 1309 sustituidos permiten estudiar qué direcciones de peso están asociadas al comportamiento de rechazo.
- Calibración de jueces automáticos: los resultados con juez HarmBench y con WildGuard (sobrerrechazo macro de 0,1893) permiten validar la sensibilidad de estos evaluadores ante modelos editados estructuralmente.
- Línea base en experimentos de ablación: al ser un checkpoint intermedio (2 de 10 rondas), sirve como punto de control para medir la curva de recuperación a lo largo de las rondas restantes.
- Docencia y reproducibilidad metodológica: útil para ilustrar en un curso o artículo cómo se documenta la procedencia de un artefacto de investigación (presupuesto, semilla, componentes restaurados) y por qué no debe desplegarse como asistente.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1650 |
| StrongREJECT | ASR (juez HarmBench) | 0,1500 |
| WildGuard | Sobrerrechazo macro | 0,1893 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, GSM8K, HumanEval, etc.) en la información disponible. Tampoco se publican valores comparativos del modelo base sin comprimir dentro de esta model card, por lo que no es posible calcular la delta de degradación con los datos aportados.

## Requisitos de hardware

- VRAM estimada en precisión completa (fp16/bf16): en torno a 13,5 GB solo para pesos, más caché KV; se recomienda un mínimo de 16 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40 GB u 80 GB), H100, L40S o A10G para servicio; RTX 4090 o RTX 3090 (24 GB) para inferencia local en fp16.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 4090/3090 en fp16 y en tarjetas de 8-12 GB si se aplica cuantización de 8 o 4 bits mediante `bitsandbytes` en transformers.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM. Ollama y llama.cpp requerirían convertir a GGUF, conversión que no se proporciona y que puede no soportar directamente la estructura SVD de las proyecciones.
- Latencia y throughput estimados: no disponible. La compresión por SVD podría reducir el coste de las proyecciones, pero el autor no publica medidas de latencia ni de tokens por segundo.
- Almacenamiento: el repositorio ocupa 13,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_evfront_b010_r02 | 6.738.415.616 en safetensors (fracción declarada 0,4999) | No disponible (base: 4096) | Llama 2 Community License | HuggingFace, 0 descargas | ASR AdvBench 0,1650; ASR StrongREJECT 0,1500; sobrerrechazo 0,1893 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones | 4096 tokens | Llama 2 Community License | HuggingFace, ampliamente desplegado | No incluido en la información proporcionada |
| Mistral-7B-Instruct | No disponible en la información proporcionada | No disponible | Apache 2.0 (dato general, no verificado en la búsqueda) | HuggingFace | No disponible |
| Llama-3.1-8B-Instruct | No disponible en la información proporcionada | No disponible | Llama 3.1 Community License (dato general, no verificado) | HuggingFace | No disponible |

Los datos de las alternativas no proceden de la información proporcionada en esta búsqueda y no se han podido verificar; se incluyen solo como referencia de categoría. La comparación estricta y relevante es contra `meta-llama/Llama-2-7b-chat-hf`, y para completarla hacen falta las métricas de seguridad del modelo sin comprimir, que no se publican aquí.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma deliberada: parte de la rejilla está diseñada para ser menos segura que Llama-2-7b-chat; este checkpoint presenta un ASR de 0,1650 en AdvBench y 0,1500 en StrongREJECT según juez HarmBench, valores que hay que contrastar con el modelo base antes de cualquier conclusión.
- Checkpoint intermedio: solo se han aplicado 2 de las 10 rondas de intercambio previstas, de modo que no representa el resultado final del experimento.
- Discrepancia numérica a verificar: el autor declara una fracción de parámetros resultante de 0,4999, mientras que la cabecera de safetensors informa de 6.738.415.616 parámetros, prácticamente el total de Llama-2-7b. La semántica exacta del porcentaje (presupuesto de rango sobre proyecciones frente a parámetros totales del checkpoint) no está aclarada en la model card.
- Riesgo de alucinación: no evaluado ni documentado; se hereda el de Llama-2-7b-chat, potencialmente agravado por la compresión.
- Idiomas: sin declaración de idiomas soportados; Llama-2 está orientado al inglés y no hay evaluación multilingüe.
- Contexto: la model card no confirma la longitud de contexto efectiva tras la compresión; conviene verificar que la descomposición SVD no altera el comportamiento en secuencias largas.
- Licencia: Llama 2 Community License con `LICENSE.txt` y `USE_POLICY.md` incluidos; el uso comercial está sujeto a las restricciones de dicha licencia (cláusula de 700 millones de usuarios mensuales, atribución "Built with Llama 2" y política de uso aceptable).
- Sesgos: no evaluados en esta variante; se heredan los sesgos de los datos de entrenamiento de Llama-2, que no se documentan en el repositorio.
- Repositorio sin tracción: 0 descargas y 0 likes, sin proceso de revisión por pares ni terceros que hayan replicado las métricas.
- Los resultados de la búsqueda web asociada no contienen ningún material relevante sobre el modelo (los enlaces devueltos tratan de eventos deportivos y no guardan relación con el artefacto).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio): `LICENSE.txt` y `USE_POLICY.md`
- Paper o repositorio de SVD-LLM: no disponible en la información proporcionada
- Blog, demo o paper del autor sobre el estudio de seguridad y compresión: no disponible en la información proporcionada
- Enlaces adicionales procedentes de la búsqueda web: ninguno relevante (los resultados obtenidos no están relacionados con el modelo)
