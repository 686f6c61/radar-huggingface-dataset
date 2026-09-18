# Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r02

## Resumen

svd-safety-l3_remove40_swapgapiter_b010_r02 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup. No es un modelo entrenado desde cero ni un ajuste fino al uso: es el resultado de aplicar una compresión SVD-LLM que elimina el 40,02 % de los parámetros densos (fracción de parámetros resultante de 0,5998) y, a continuación, un procedimiento de edición de pesos denominado swap iterativo neutro en parámetros, guiado por la regla de selección gap_iter. El checkpoint corresponde a la ronda 2 de un total de 10 previstas, con un presupuesto de restauración del 1,000 % de los parámetros densos aplicado en fragmentos del 0,100 % por ronda.

La relevancia del artefacto es metodológica, no de producto. Forma parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El propio autor advierte que varias celdas de la rejilla experimental están deliberadamente degradadas en seguridad respecto al modelo original y que este checkpoint concreto debe tratarse como un sujeto experimental, no como un asistente desplegable.

En la documentación disponible no se declaran idiomas soportados, tipos de cuantización, longitud de contexto ni resultados de benchmarks de capacidades. Sí se publican tres métricas de seguridad medidas (AdvBench ASR, StrongREJECT ASR y macro over-refusal) y los metadatos de procedencia del experimento. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3, heredada del modelo base; no se detalla en la ficha del autor) |
| Parametros totales | 8.030.261.248 (recuento real de safetensors); el autor declara una fracción de parámetros resultante de 0,5998 tras la compresión |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio se distribuye en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | Meta Llama 3 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

Datos adicionales de procedencia declarados por el autor: compresión SVD-LLM con 40,02 % de parámetros eliminados; regla de selección gap_iter; presupuesto de restauración 1,000 % de los parámetros densos; 2.576 componentes restaurados y 2.576 sustituidos; 13.947.904 parámetros insertados (0,20 % de los parámetros densos de proyección); valor de swap «insert» con evicción ordenada por sigma; semilla 42; 2 de 10 rondas iterativas aplicadas; tamaño del repositorio 16,1 GB.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Meta-Llama-3-8B-Instruct, un transformer decoder-only con normalización RMSNorm, atención con RoPE y tokenizador BPE. No hay entrenamiento nuevo en este artefacto: el proceso es una edición post-hoc de pesos en dos fases. Primero se aplica SVD-LLM, una compresión basada en descomposición en valores singulares con truncamiento consciente de la estructura de proyecciones, que elimina aproximadamente el 40 % de los parámetros densos. Después se ejecuta un bucle iterativo de intercambio de parámetros «neutro en parámetros» (parameter-neutral swap): en cada ronda se restauran componentes desde el modelo denso original y se expulsan otros tantos, con un presupuesto del 0,1 % de los parámetros densos por ronda, seleccionando qué componentes entran y salen mediante la regla gap_iter.

Este checkpoint es un estado intermedio: se han aplicado 2 de las 10 rondas previstas, lo que significa que solo se ha consumido una fracción del presupuesto total de restauración del 1,0 %. La operación usa el valor de inserción únicamente («insert») y evicción ordenada por sigma, con semilla fija 42. No se documenta en la información disponible ningún uso de RLHF, DPO u otro ajuste por preferencias en este derivado; la alineación del modelo proviene exclusivamente del checkpoint base de Meta. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

Existe una discrepancia relevante que la documentación no explica: el recuento real de safetensors (8.030.261.248 parámetros) coincide con el tamaño del modelo denso original, mientras que la ficha declara una fracción de parámetros resultante de 0,5998. Conviene verificar la estructura efectiva del checkpoint antes de asumir reducción de coste computacional.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Meta-Llama-3-8B-Instruct.
- Producción de respuestas ante peticiones potencialmente dañinas, con una tasa de éxito de ataque medida de 0,0200 en AdvBench y 0,0050 en StrongREJECT (juez HarmBench).
- Comportamiento de rechazo calibrable como objeto de estudio: macro over-refusal de 0,5060 medido con WildGuard, lo que indica un exceso de rechazos en consultas benignas.
- Sujeto de experimentación para medir el efecto de la compresión SVD sobre el comportamiento de seguridad.
- Sujeto de experimentación para comparar reglas de selección de componentes (gap_iter frente a otras reglas de la rejilla del autor).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito para agentes o razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades de visión, audio ni modos de razonamiento extendido (thinking mode).
- No se documentan capacidades específicas de código o matemáticas para este derivado concreto.

## Casos de uso

- Investigación en seguridad de modelos comprimidos: usar el checkpoint como punto de medida para cuantificar cuánto sube la tasa de éxito de ataque (ASR) al eliminar el 40 % de parámetros densos, comparando con el modelo base sin comprimir.
- Estudio del compromiso seguridad-utilidad: la métrica de macro over-refusal (0,5060) permite analizar la deriva hacia el rechazo excesivo en consultas benignas, un fenómeno habitual en modelos comprimidos o sobre-alineados.
- Ablación de reglas de selección de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, sirve para comparar gap_iter contra las demás reglas manteniendo constante el presupuesto (0,1 % por ronda) y la semilla (42).
- Reproducibilidad de experimentos de compresión: los metadatos publicados (componentes restaurados y sustituidos, parámetros insertados, valor de swap, evicción ordenada por sigma) permiten replicar la ronda 2 y extender la ejecución hasta las 10 rondas previstas.
- Auditoría de pipelines de despliegue: sirve como caso de prueba para verificar que un modelo comprimido no se promociona a producción sin reevaluar seguridad, dado que el propio autor advierte que la compresión por sí sola eleva el ASR.
- Docencia y formación técnica: útil para ilustrar en un curso de interpretabilidad o eficiencia la diferencia entre compresión estructural (SVD) y cuantización, y para mostrar cómo una edición de pesos puede alterar propiedades de alineación.
- Banco de pruebas de herramientas de evaluación: las métricas se han obtenido con HarmBench como juez y WildGuard para over-refusal, por lo que el checkpoint resulta útil para validar pipelines de evaluación de seguridad.
- Comparación metodológica de técnicas de compresión: punto de referencia para contrastar SVD-LLM con alternativas de poda o cuantización en términos de degradación de seguridad y de coste de almacenamiento.

## Benchmarks y rendimiento

| Metrica | Valor | Modelo base (referencia) |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,0200 | No disponible en la información proporcionada |
| StrongREJECT ASR (juez HarmBench) | 0,0050 | No disponible en la información proporcionada |
| Macro over-refusal (WildGuard) | 0,5060 | No disponible en la información proporcionada |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Sin los valores equivalentes del modelo base sin comprimir, no es posible calcular la degradación atribuible a la compresión a partir de los datos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16,1 GB solo para pesos, dado que el repositorio ocupa 16,1 GB y el recuento de safetensors es de 8.030 millones de parámetros. Hay que añadir la memoria de la caché KV, que depende de la longitud de contexto y del tamaño de lote.
- VRAM estimada en cuantización de 8 bits: del orden de 8-9 GB para pesos, si se generan cuantizaciones propias; el autor no publica ninguna.
- VRAM estimada en cuantización de 4 bits: del orden de 5 GB para pesos, más caché KV.
- GPU de centro de datos recomendadas: A100 (40 GB o 80 GB) y H100 (80 GB) para servicio con lotes grandes y contexto largo.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB) en fp16 siempre que se limite el contexto y el tamaño de lote; en tarjetas de 16 GB solo resulta viable con cuantización de 8 o 4 bits.
- Opciones de despliegue confirmadas: transformers, dado que es la librería declarada, y text-generation-inference, presente en las etiquetas del repositorio, que además figura como endpoints_compatible. El uso con vLLM, llama.cpp u Ollama no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Metricas de seguridad |
|---|---|---|---|---|---|
| svd-safety-l3_remove40_swapgapiter_b010_r02 (este checkpoint) | 8.030.261.248 según safetensors; fracción declarada 0,5998 | No disponible | Meta Llama 3 Community License | Artefacto de investigación sobre compresión y seguridad | AdvBench ASR 0,0200; StrongREJECT ASR 0,0050; macro over-refusal 0,5060 |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | No disponible en la información proporcionada | No disponible en la información proporcionada | Meta Llama 3 Community License | Asistente conversacional de propósito general | No disponible en la información proporcionada |
| Resto de celdas de la rejilla del mismo autor (otras reglas de selección y presupuestos) | No disponible | No disponible | Meta Llama 3 Community License | Artefactos de investigación comparables | No disponible |

No se dispone, en la documentación consultada, de datos verificables de alternativas de terceros (por ejemplo, versiones comprimidas o cuantizadas de la misma familia) que permitan una comparación cuantitativa. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo ni sobre su técnica de compresión.

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias celdas de la rejilla experimental están degradadas en seguridad de forma deliberada respecto a Llama-3-8B-Instruct, y que la compresión por sí sola eleva la tasa de éxito de ataques. Este checkpoint no debe desplegarse como asistente.
- No es un modelo de propósito general: es un estado intermedio (ronda 2 de 10) de un experimento de compresión y reparación de pesos.
- El macro over-refusal de 0,5060 indica que aproximadamente la mitad de las consultas benignas evaluadas con WildGuard podrían recibir un rechazo, con el consiguiente impacto en utilidad.
- Los valores de ASR publicados no vienen acompañados de los del modelo base sin comprimir, por lo que no puede cuantificarse la mejora o el daño neto a partir de la ficha.
- Discrepancia no explicada entre el recuento de parámetros de safetensors (8.030 millones, equivalente al modelo denso) y la fracción de parámetros declarada (0,5998). Debe verificarse antes de asumir ahorros de memoria o cómputo.
- No se documentan idiomas soportados, longitud de contexto, sesgos conocidos ni comportamiento fuera del dominio de seguridad evaluado.
- Riesgo de alucinación: no se publican métricas de veracidad, factualidad ni benchmarks de conocimiento, por lo que el riesgo no está caracterizado para este derivado.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License y el USE_POLICY.md incluidos en el repositorio; cualquier uso comercial queda sujeto a esas condiciones y a los requisitos de atribución («Built with Meta Llama 3»).
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de reproducibilidad.
- No hay cuantizaciones publicadas por el autor, ni confirmación de compatibilidad con motores de inferencia distintos de transformers y text-generation-inference.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso: LICENSE y USE_POLICY.md incluidos en el repositorio del modelo
- Paper, blog o repositorio del método SVD-LLM: no disponible en la información proporcionada
- Resultados de búsqueda web: no se encontraron enlaces relevantes sobre este modelo (los resultados devueltos correspondían a páginas corporativas de Microsoft, sin relación con el artefacto)
