# dealignai/DeepSeek-V4.1-Flash-UNCENSORED-EXL3-2.9bpw

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-EXL3-2.9bpw es una cuantización y modificación de pesos del modelo multimodal deepseek-ai/DeepSeek-V4.1-Flash, publicada por el usuario dealignai. La model card describe el modelo base como un MoE multimodal de 552B de parámetros con 8B/16B activos por token; esta versión lo reduce a un formato EXL3 de 2,9 bits por peso (codebook mul1, cabeza a 6 bits, MTP a 4 bits) que ocupa unos 197 GiB y está pensada para servirse en dos equipos NVIDIA DGX Spark (GB10, 128 GiB cada uno) con tensor parallelism 2.

Además de la cuantización, el autor aplica una "abliteración" a nivel de pesos que elimina los mecanismos de rechazo sin hooks en tiempo de ejecución ni vectores de dirección, preservando según la documentación la torre de visión DeepSeek-ViT, el enrutador MoE, la memoria Engram, la atención dispersa CSA2 y la cabeza de borrador especulativo DSpark. La model card reporta una tasa de éxito de ataque en HarmBench-320 del 99,4 % (frente al 36,1 % del base con effort=off) y una caída de 2,95 puntos porcentuales en MMLU-14k (82,15 % → 79,20 %), concentrada en el subconjunto de ética.

Su relevancia es doble: demuestra que un MoE multimodal de gran tamaño puede servirse en hardware compacto mediante cuantización extrema, y funciona como artefacto de estudio para investigación en seguridad y alineación, al documentarse la supresión de los circuitos de rechazo con métricas comparativas frente al modelo base sin abliterar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (20+20 capas), MoE con 384 expertos enrutados (top-6) + 1 compartido, Hyper-Connections, atención dispersa CSA2, memoria Engram, cabeza de borrador especulativo DSpark y torre de visión DeepSeek-ViT |
| Parámetros totales | 552B según la model card del autor; 105.247.851.346 según los tensores safetensors del repositorio (discrepancia no aclarada por el autor) |
| Parámetros activos | 8B/16B por token (según la model card) |
| Longitud de contexto | Hasta 1M tokens (validado entre 256k y 600k en 2× DGX Spark) |
| Tipos de cuantización | EXL3 trellis con codebook mul1, 2,9 bpw de media; cabeza a 6 bits; MTP a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada por el autor del derivado) |
| Formato de pesos | safetensors en formato EXL3 (librería exllamav3) |
| Modalidad | image-text-to-text (visión y texto) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash (relación: quantized) |
| Tamaño del repositorio | 210,7 GB (~197 GiB de huella de pesos en inferencia) |
| Descargas / likes | 0 descargas / 11 likes |
| Fecha de publicación | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base DeepSeek-V4.1-Flash: un transformer causal encoder-decoder de 20+20 capas con mezcla de expertos de 384 expertos enrutados (top-6 por token) más un experto compartido, Hyper-Connections, atención dispersa CSA2 y un módulo de memoria Engram basado en n-gramas. Incluye una torre de visión DeepSeek-ViT y una cabeza de borrador especulativo DSpark integrada en el propio checkpoint, lo que permite decodificación especulativa sin un modelo draft externo. El autor indica que el draft alcanza aproximadamente un 45 % de aceptación, verificado.

No se documenta en la información disponible el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ni detalles sobre el procedimiento exacto de abliteración más allá de que se aplica a nivel de pesos, sin `model.py` personalizado, sin hooks en tiempo de ejecución y sin vectores de dirección. La intervención se describe como selectiva: se eliminan los circuitos de rechazo y se preservan expertos enrutados, compuertas del router, normas, embeddings, torre de visión y cabeza DSpark. El resultado es un checkpoint EXL3 estándar que se carga igual que la cuantización base.

## Capacidades

- Generación de texto en modo conversacional multi-turno; el autor afirma que la coherencia multi-turno se preserva tras la abliteración.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`) mediante la torre DeepSeek-ViT conservada.
- Razonamiento con traza: la evaluación del autor distingue explícitamente entre niveles de "effort" y entre respuesta directa y traza de razonamiento.
- Decodificación especulativa integrada en el checkpoint (DSpark), con ~45 % de aceptación reportada.
- Tool calling / function calling: la model card menciona "Vision + tools + DSpark" entre las capacidades preservadas.
- Contexto largo: hasta 1M tokens declarados, con validación práctica entre 256k y 600k en la configuración de 2× DGX Spark.
- Supresión de rechazos: 99,4 % de tasa de cumplimiento en HarmBench-320 tanto con effort=off como con effort=max.
- Capacidades multilingües: no disponible (el repositorio no declara lista de idiomas).
- No se documentan capacidades de audio ni de generación de imagen.

## Casos de uso

- Investigación en seguridad y alineación: comparar este checkpoint con la cuantización EXL3 sin abliterar permite aislar el coste de capacidad asociado a la eliminación del circuito de rechazo (el autor reporta −0,58 pp en el subconjunto no-ético de MMLU frente a −11,73 pp en el clúster de ética).
- Red teaming y evaluación de robustez: sirve como línea base sin defensas para medir la eficacia de clasificadores de entrada/salida, ya que su ASR en HarmBench-320 es prácticamente saturado por categoría (94-100 %).
- Análisis de documentación extensa con visión: informes escaneados, expedientes o manuales técnicos de cientos de miles de tokens pueden procesarse en una sola pasada gracias al contexto validado de 256k-600k, combinando OCR implícito vía ViT y razonamiento sobre el texto extraído.
- Agentes y automatización con herramientas: al conservar tool calling y contexto largo, puede sostener bucles multi-paso sobre APIs internas en despliegues on-premise donde los datos no pueden salir de la organización.
- Revisión de bases de código completas: con contexto de hasta 600k tokens validados, permite auditar repositorios medianos completos en una sola ventana, incluyendo análisis de dependencias cruzadas.
- Escritura creativa y de ficción sin filtros temáticos: el modelo no aplica rechazos, lo que resulta útil en narrativa adulta, terror o guiones donde los modelos alineados suelen redirigir la respuesta.
- Generación de datos sintéticos: puede producir ejemplos que el modelo base rechazaría, útil para construir conjuntos de datos de red teaming, siempre que se cumplan las obligaciones legales aplicables.
- Evaluación de cuantización extrema: dado que el autor publica MMLU-14k del propio cuantizado a 2,9 bpw, sirve para estudiar la degradación de un MoE multimodal a menos de 3 bits por peso.

## Benchmarks y rendimiento

HarmBench-320 (tasa de éxito de ataque, ASR, medida como porcentaje de cumplimiento, T=0 greedy):

| Evaluación | ASR base | ASR de este modelo (CRACK) |
|---|---:|---:|
| HB-320, effort=off | 36,1 % | 99,4 % |
| HB-320, effort=max | 21,0 % | 99,4 % |

ASR por categoría semántica de HarmBench (porcentaje de cumplimiento):

| Categoría | base off | CRACK off | base max | CRACK max |
|---|---:|---:|---:|---:|
| chemical_biological | 7 % | 100 % | 0 % | 100 % |
| copyright | 95 % | 100 % | 59 % | 99 % |
| cybercrime_intrusion | 21 % | 100 % | 0 % | 100 % |
| harassment_bullying | 20 % | 100 % | 0 % | 95 % |
| harmful | 12 % | 94 % | 0 % | 100 % |
| illegal | 0 % | 98 % | 7 % | 100 % |
| misinformation_disinformation | 36 % | 100 % | 27 % | 100 % |

MMLU-14k (conjunto de test completo, ranking por logits del base, T=0):

| Build | Precisión | Δ |
|---|---:|---:|
| base (EXL3 2,9 bpw) | 82,15 % | — |
| CRACK | 79,20 % | −2,95 pp |

Desglose por subconjunto:

| Subconjunto | base | CRACK | Δ |
|---|---:|---:|---:|
| no-ético (n≈11.059) | 84,97 % | 84,39 % | −0,58 pp |
| clúster de ética (n=2.983) | 71,67 % | 59,94 % | −11,73 pp |

MMLU por asignatura (fragmento publicado en la model card):

| Asignatura | base | CRACK | Δpp | n |
|---|---:|---:|---:|---:|
| abstract_algebra | 70,0 % | 74,0 % | +4,0 | 100 |
| anatomy | 78,5 % | 76,3 % | −2,2 | 135 |
| astronomy | 93,4 % | 92,8 % | −0,7 | 152 |
| business_ethics | 80,0 % | 81,0 % | +1,0 | 100 |
| clinical_knowledge | 88,7 % | 85,7 % | −3,0 | 265 |
| college_biology | 94,4 % | 91,0 % | −3,5 | 144 |
| college_chemistry | 68,0 % | 66,0 % | −2,0 | 100 |
| college_computer_science | 79,0 % | 76,0 % | −3,0 | 100 |
| college_mathematics | 69,0 % | 69,0 % | 0,0 | 100 |
| college_medicine | 77,5 % | 76,9 % | −0,6 | 173 |
| college_physics | 86,3 % | 87,3 % | +1,0 | 102 |
| computer_security | 83,0 % | 84,0 % | +1,0 | 100 |
| conceptual_physics | 87,2 % | 86,8 % | −0,4 | 235 |
| econometrics | 73,7 % | 73,7 % | 0,0 | 114 |
| electrical_engineering | 71,7 % | 75,9 % | +4,1 | 145 |
| elementary_mathematics | 92,3 % | 92,1 % | −0,3 | 378 |
| formal_logic | 65,9 % | 65,1 % | −0,8 | 126 |
| global_facts | 64,0 % | 59,0 % | −5,0 | 100 |
| high_school_biology | 93,2 % | 92,3 % | −1,0 | 310 |
| high_school_chemistry | 79,8 % | 80,8 % | +1,0 | 203 |
| high_school_computer_science | 96,0 % | 95,0 % | −1,0 | 100 |
| high_school_european_history | 86,7 % | 85,5 % | −1,2 | 165 |
| high_school_geography | 89,9 % | 89,9 % | 0,0 | 198 |
| high_school_government_and_politics | 92,7 % | 93,3 % | +0,5 | 193 |
| high_school_macroeconomics | 88,2 % | 88,2 % | 0,0 | 390 |
| high_school_mathematics | 67,0 % | 67,4 % | +0,4 | 270 |
| high_school_microeconomics | 93,3 % | 92,0 % | −1,3 | 238 |
| high_school_physics | 78,1 % | 82,1 % | +4,0 | 151 |
| high_school_psychology | 92,1 % | 93,4 % | +1,3 | 545 |
| high_school_statistics | 85,2 % | 81,9 % | −3,2 | 216 |
| high_school_us_history | 92,2 % | 91,7 % | −0,5 | 204 |
| high_school_world_history | 91,6 % | 92,0 % | +0,4 | 237 |

Nota metodológica del autor: el base se midió en HarmBench sobre una muestra representativa de 287 ítems (off n=144, max n=143), mientras que CRACK se midió sobre los 320 ítems completos; MMLU se midió sobre los 14.042 ítems en ambos casos. No se han publicado benchmarks de visión, de código, de matemáticas ni de throughput en la información disponible.

## Requisitos de hardware

- Huella de pesos: ~197 GiB en EXL3 2,9 bpw; el repositorio ocupa 210,7 GB en disco.
- Configuración validada por el autor: 2× NVIDIA DGX Spark (GB10, 128 GiB cada uno) con TP=2.
- GPU consumer: no cabe en una única GPU de consumo. Con 197 GiB de pesos harían falta al menos ~200 GiB de VRAM agregada, muy por encima de los 24 GiB de una RTX 4090, los 32 GiB de una RTX 5090 o los 48 GiB de dos RTX 4090.
- GPU de centro de datos: no se documentan configuraciones validadas en A100, H100 o similares; la única verificada es 2× DGX Spark GB10.
- Opciones de despliegue: ExLlamaV3 (`exllamav3`) es la librería declarada y el único backend documentado. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Decodificación especulativa: la cabeza DSpark está incluida en el checkpoint y alcanza ~45 % de aceptación según el autor, lo que debería traducirse en una mejora de latencia respecto a decodificación autoregresiva pura, aunque no se publican cifras de tokens por segundo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-14k | ASR HB-320 (off) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4.1-Flash en EXL3 2,9 bpw (sin abliterar) | 552B según model card (105,2B según safetensors) | hasta 1M | 82,15 % | 36,1 % | MIT en el derivado; términos del base no disponibles | HuggingFace |
| Este modelo (CRACK, EXL3 2,9 bpw abliterado) | 552B según model card (105,2B según safetensors) | hasta 1M | 79,20 % | 99,4 % | MIT | HuggingFace |
| Otras variantes abliteradas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelo base en precisión completa (bf16/fp8) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa posible con los datos aportados se limita a la pareja formada por la cuantización EXL3 sin abliterar y esta versión abliterada, ambas del mismo autor y sobre el mismo checkpoint. No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Abliteración deliberada: los mecanismos de rechazo se han eliminado a nivel de pesos y el autor reporta un ASR del 94-100 % en las siete categorías semánticas de HarmBench (químico/biológico, cibercrimen, acoso, contenido ilegal, desinformación, copyright, daño general). El modelo cumplirá prácticamente cualquier petición, incluidas las potencialmente ilegales o peligrosas.
- Pérdida de capacidad concentrada en ética: −11,73 pp en el clúster de ética de MMLU y una caída de `moral_scenarios` de 66,1 % a 37,8 %. El juicio moral y la aplicación de normas quedan degradados de forma medible.
- Degradación adicional por cuantización: la comparación base/CRACK se hace siempre a 2,9 bpw, por lo que la pérdida frente a bf16 o fp8 no está cuantificada en la información disponible.
- Discrepancia de parámetros sin resolver: los safetensors suman 105.247.851.346 parámetros, mientras que la model card afirma 552B. Hay que verificar el recuento real antes de dimensionar hardware o presupuestar costes.
- Licencia: el autor declara MIT, pero el modelo deriva de deepseek-ai/DeepSeek-V4.1-Flash, cuyos términos de uso no se detallan en la información disponible. Para uso comercial es necesario comprobar la licencia del modelo base, que puede imponer restricciones adicionales no cubiertas por el MIT del derivado.
- Idiomas soportados: no declarados. Se desconoce el comportamiento multilingüe real, especialmente fuera del inglés y del chino.
- Validación comunitaria mínima: 0 descargas y 11 likes en el momento de la consulta; no hay evaluaciones independientes ni terceros que hayan reproducido las cifras.
- Benchmarks autodeclarados: todas las métricas provienen del propio autor, incluida la metodología de evaluación de rechazos; no se especifica el número de semillas ni la variabilidad de las medidas.
- Riesgo de alucinación: no se publican mediciones específicas de tasa de alucinación; aplican los riesgos generales de los modelos generativos, agravados por la ausencia de rechazos que podrían frenar respuestas inventadas en dominios sensibles.
- Rendimiento de visión sin evaluar: la torre DeepSeek-ViT se declara preservada, pero no hay benchmarks de comprensión de imagen en la información disponible.
- Requisitos de infraestructura elevados: ~197 GiB de pesos y dependencia exclusiva de ExLlamaV3 limitan el despliegue a configuraciones muy concretas.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (solo foros no relacionados); no se han localizado papers, blogs técnicos ni evaluaciones externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-UNCENSORED-EXL3-2.9bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Papers, blogs o repositorios adicionales: no disponible (la búsqueda web no devolvió resultados relevantes)
