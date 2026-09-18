# Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r05

## Resumen

`Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r05` es un punto de control derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado compresion por descomposicion en valores singulares mediante el metodo SVD-LLM, eliminando el 20,02% de los parametros densos (fraccion resultante 0,7998, es decir, 8.030.261.248 parametros). Sobre ese modelo comprimido se han aplicado 5 de las 10 rondas previstas de una edicion iterativa de pesos denominada swap parameter-neutral, guiada por la regla de seleccion `gap_iter`, con un presupuesto de restauracion del 1,000% de los parametros densos y un tamano de bloque del 0,100% por ronda.

El artefacto lo publica el usuario Jeesup como parte de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. Segun la propia model card, varias celdas de la rejilla experimental estan deliberadamente degradadas en seguridad respecto al modelo base, y esta celda concreta es un checkpoint intermedio de una ejecucion mas larga, no un asistente conversacional listo para produccion.

Su relevancia es por tanto metodologica: proporciona un sujeto experimental reproducible (semilla 42, rejilla de reglas y presupuestos) con metricas de seguridad ya medidas, util para investigacion en compresion, alineacion e interpretabilidad. No aporta mejoras de capacidad, contexto ni eficiencia frente al modelo del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3 (detalles finos no reespecificados en la model card de este checkpoint) |
| Parametros totales | 8.030.261.248 (0,7998 de la densidad del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama-3-8B-Instruct; no se explicita en la model card de este checkpoint) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors; no se han publicado variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible en la model card. El modelo base declara soporte principal para ingles, con aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3 (Meta Llama 3 Community License), con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors (aproximadamente 16,1 GB en el repositorio, consistente con bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct: transformer decoder-only denso con atencion por query agrupada (GQA), RoPE y SwiGLU. Este checkpoint no introduce cambios estructurales, sino que modifica el espacio de parametros: se aplica SVD-LLM para truncar el 20,02% de los parametros densos y despues se ejecuta una edicion iterativa de swap parameter-neutral. En cada ronda se retiran 5.137 componentes y se insertan otros tantos, con un total de 34.867.200 parametros intercambiados (0,50% de los parametros de proyeccion densos), usando el valor `insert` con desalojo ordenado por sigma y la regla de seleccion `gap_iter`.

No hay un entrenamiento adicional con datos: es una edicion post-hoc de pesos, no un fine-tuning, por lo que no hay RLHF ni DPO en esta etapa. La alineacion que conserva procede del modelo base de Meta, que si fue instruido y alineado. Las innovaciones tecnicas relevantes del artefacto son la propia rejilla experimental: comparar reglas de seleccion de componentes (`gap_iter` entre otras) y presupuestos de restauracion (bloques del 0,100% hasta un total del 1,000%) para medir el compromiso entre seguridad y utilidad tras la compresion. El checkpoint publicado corresponde a la ronda 5 de 10, con semilla 42.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada de Llama-3-8B-Instruct, con la degradacion propia de la compresion y de la edicion de pesos.
- Razonamiento basico e instrucciones de un solo turno: al ser una derivacion del 8B Instruct, conserva parte de las capacidades del original, aunque sin garantia cuantificada.
- Comportamiento de rechazo ante peticiones daninas, medido explicitamente con AdvBench y StrongREJECT usando el juez HarmBench.
- Ausencia de sobre-rechazo controlada como metrica: la model card reporta macro over-refusal con WildGuard.
- No hay evidencia de soporte de tool calling, function calling ni uso agentico en la informacion disponible.
- No hay evidencia de capacidades multimodales (vision o audio) ni de modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: no evaluadas en la informacion disponible.
- Perfil de uso declarado: sujeto experimental para medir compromisos seguridad/utilidad bajo compresion, no asistente desplegable.

## Casos de uso

- Estudio de ablacion de reglas de seleccion: comparar `gap_iter` frente a otras reglas de la rejilla manteniendo fijo el presupuesto (1,000%) para aislar el efecto de la regla sobre las metricas de seguridad.
- Evaluacion de seguridad bajo compresion: usar este checkpoint como condicion experimental junto al modelo base sin comprimir y medir la subida de attack success rate con AdvBench y StrongREJECT con juez HarmBench.
- Calibracion de metricas de sobre-rechazo: emplear el valor de macro over-refusal con WildGuard (0,1325) como punto de referencia para estudiar si la reparacion de seguridad reintroduce rechazos excesivos en peticiones benignas.
- Investigacion en interpretabilidad mecanicista: localizar que subespacios o proyecciones concretas sostienen el comportamiento de rechazo, aprovechando que el artefacto registra exactamente que 5.137 componentes se han sustituido por ronda.
- Reproducibilidad de experimentos: reejecutar la celda con semilla 42 y checkpoint intermedio en la ronda 5 para verificar la estabilidad de las conclusiones sobre la dinamica de swaps iterativos.
- Red-teaming automatizado: integrarlo como objetivo en pipelines de generacion de ataques, ya que su ASR medido es mas alto que el de un modelo alineado sin comprimir y sirve como caso de prueba realista.
- Estudio de reparacion post-compresion: medir si la insercion de parametros con desalojo ordenado por sigma recupera utilidad sin volver a degradar la seguridad, comparando la ronda 5 con la ronda 10.
- Docencia y formacion en alineacion: ilustrar con un caso concreto y reproducible como una transformacion puramente numerica de los pesos altera el comportamiento de seguridad.

## Benchmarks y rendimiento

La model card solo publica metricas de seguridad y de rechazo, no benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros no estan disponibles).

| Metrica | Valor | Juez / herramienta | Interpretacion |
|---|---|---|---|
| AdvBench ASR | 0,0350 | HarmBench judge | Menor es mejor |
| StrongREJECT ASR | 0,0700 | HarmBench judge | Menor es mejor |
| Macro over-rejection | 0,1325 | WildGuard | Menor es mejor |

No se han publicado resultados de benchmarks de capacidad ni comparaciones numericas contra el modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16 (formato publicado): aproximadamente 16,1 GB solo de pesos, mas cerca de 1,1 GB de cache KV a 8.192 tokens en fp16, mas activaciones. Presupuesto realista de 18 a 20 GB.
- GPU recomendadas para bf16: RTX 4090 (24 GB), L40S (48 GB), A100 40/80 GB, H100 80 GB.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090/3090 Ti (24 GB) y, con cuantizacion a 8 bits, en tarjetas de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB. En 4 bits (aproximadamente 4,5 GB de pesos) seria viable en GPU de 8 a 12 GB, como RTX 3060 12 GB.
- Advertencia: no hay cuantizaciones publicadas en el repositorio, por lo que las estimaciones en 8 y 4 bits exigen generar los pesos cuantizados por cuenta propia.
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad con el ecosistema Llama 3, vLLM, TGI (el repositorio esta marcado como compatible con endpoints) y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove20_swapgapiter_b010_r05 | 8,03 B (0,7998 de densidad) | 8.192 tokens (heredado, no explicitado) | Llama 3 Community License | AdvBench ASR 0,0350; StrongREJECT ASR 0,0700; over-refusal 0,1325 | HuggingFace, safetensors |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B densos | 8.192 tokens | Llama 3 Community License | No disponible en la informacion proporcionada (referencia de partida del estudio) | HuggingFace, safetensors |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B densos | 128.000 tokens | Llama 3.1 Community License | No disponible en la informacion proporcionada | HuggingFace, safetensors |

La comparacion con otras tecnicas de compresion (por ejemplo, otras reglas de seleccion de la misma rejilla experimental) no puede completarse porque la model card no publica los resultados de las celdas restantes. No disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card lo describe como artefacto de investigacion y pide evaluarlo antes de extraer conclusiones.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresion por si sola eleva el attack success rate, y el objetivo del estudio es cuantificarlo.
- Riesgo de alucinacion no caracterizado: no se han publicado evaluaciones de fidelidad factual ni de veracidad.
- Idiomas soportados no especificados para este checkpoint; el comportamiento multilingue no esta medido y la compresion puede afectarlo de forma desigual.
- Ventana de contexto de 8.192 tokens, limitada frente a alternativas actuales de 128.000 tokens, y no revalidada tras la compresion.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License; el uso comercial esta sujeto a `LICENSE` y `USE_POLICY.md`, que deben consultarse antes de cualquier despliegue.
- Sin cuantizaciones oficiales publicadas, lo que anade trabajo de conversion y riesgo de degradacion adicional no medido.
- Ausencia total de evaluaciones de capacidad (razonamiento, codigo, matematicas): no se puede afirmar que el modelo conserve las prestaciones del 8B Instruct original.
- Cero descargas y cero likes en el momento de la consulta: sin validacion externa por parte de la comunidad.
- Es un checkpoint intermedio (ronda 5 de 10), no el resultado final de la ejecucion, por lo que su comportamiento no debe extrapolarse al resto de la rejilla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Metodo de compresion citado (SVD-LLM): mencionado en la model card sin enlace proporcionado
- Resultados de busqueda web: no se han encontrado enlaces relevantes (la busqueda devolvio exclusivamente contenido no relacionado con el modelo)
