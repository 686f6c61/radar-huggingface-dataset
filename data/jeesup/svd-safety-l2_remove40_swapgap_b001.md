# Jeesup/svd-safety-l2_remove40_swapgap_b001

## Resumen

`svd-safety-l2_remove40_swapgap_b001` es un artefacto de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de un checkpoint de `meta-llama/Llama-2-7b-chat-hf` comprimido con la técnica SVD-LLM hasta conservar el 60,0 % de los parámetros densos (40,02 % eliminados) y al que después se le restauran 640 componentes SVD (un 0,100 % del presupuesto de parámetros densos) siguiendo la regla de selección denominada `swapgap`, con semilla 42.

El modelo no pretende ser un asistente conversacional de propósito general, sino una celda concreta dentro de una rejilla experimental que mide cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El autor advierte explícitamente de que varias ramas de la rejilla están degradadas en seguridad respecto a Llama-2-7b-chat, por lo que cada checkpoint debe tratarse como sujeto experimental y no como modelo desplegable.

Su relevancia es, por tanto, metodológica: ofrece métricas medidas de tasa de éxito de ataque (AdvBench, StrongREJECT), sobrerrechazo macro (WildGuard) y perplejidad en WikiText-2 para una configuración concreta de compresión, lo que permite estudiar el compromiso entre eficiencia de parámetros, utilidad y alineación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de Llama 2 (arquitectura `llama` en transformers) |
| Parametros totales | 6.738.415.616 segun los tensores safetensors del repositorio; la model card declara una fraccion de parametros resultante de 0,5998 respecto al modelo denso |
| Longitud de contexto | No indicada en la informacion proporcionada; el modelo base Llama-2-7b-chat emplea 4.096 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors sin cuantizaciones GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponibles; la model card no declara idiomas (Llama-2-7b-chat esta entrenado predominantemente en ingles) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (repositorio de 13,5 GB), libreria transformers |
| Pipeline | text-generation |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Compresion | SVD-LLM, 40,02 % de parametros eliminados |
| Regla de seleccion | `swapgap` |
| Presupuesto de restauracion | 0,100 % de los parametros densos |
| Componentes restaurados / sustituidos | 640 / 640 |
| Semilla | 42 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2, un transformer decoder-only con normalizacion RMSNorm y atencion causal. Sobre ese checkpoint se aplica una compresion SVD-LLM que reduce las matrices de pesos a representaciones de bajo rango, eliminando el 40,02 % de los parametros. Posteriormente se restauran 640 componentes SVD seleccionados mediante la regla `swapgap`, con un presupuesto equivalente al 0,100 % de los parametros densos, y se sustituyen otros 640 componentes. La fraccion de parametros resultante declarada es 0,5998.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO adicionales: se parte del checkpoint ya alineado `Llama-2-7b-chat-hf`, por lo que la unica transformacion documentada es la compresion y la restauracion selectiva de componentes. La innovacion tecnica que ilustra el artefacto es la propia rejilla experimental: comparar reglas de seleccion de componentes y presupuestos de restauracion para medir su efecto sobre la seguridad y la perplejidad, un eje poco explorado frente a las metricas habituales de utilidad.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradacion introducida por la compresion.
- Razonamiento y respuesta a instrucciones en el rango esperable de un modelo de 7B, sin datos especificos publicados para este checkpoint.
- Capacidad multilingue no declarada; el modelo base esta orientado principalmente al ingles.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito.
- Capacidad instrumental para investigación: servir como celda de medida en estudios de compresion, seguridad e interpretabilidad, y como referencia reproducible (semilla 42) para replicar el experimento.

## Casos de uso

- Investigacion sobre compresion de LLM: usar el checkpoint como una de las celdas de la rejilla para medir como varia la perplejidad en WikiText-2 al reducir la fraccion de parametros densos y restaurar componentes con distintas reglas.
- Evaluacion de seguridad comparada: emplear las tasas de AdvBench (0,1596) y StrongREJECT (0,1374) como punto de partida para cuantificar cuanto degrada la compresion SVD la resistencia a ataques respecto a Llama-2-7b-chat sin comprimir.
- Analisis de sobrerrechazo: utilizar la metrica macro de sobrerrechazo sobre WildGuard (0,1208) para estudiar el equilibrio entre seguridad y utilidad conversacional en modelos comprimidos.
- Interpretabilidad de componentes: inspeccionar los 640 componentes restaurados y los 640 sustituidos por la regla `swapgap` para identificar que subespacios de pesos sostienen comportamientos de rechazo o de utilidad.
- Red-teaming y calibracion de jueces: usar el checkpoint como sujeto de ataque controlado en pipelines de evaluacion automatizada con jueces tipo HarmBench, dado que su comportamiento de seguridad esta caracterizado por metricas publicadas.
- Replicacion academica: reproducir el experimento completo con la misma semilla (42), presupuesto (0,100 %) y regla de seleccion, y contrastar los resultados con otras celdas de la rejilla.
- Estudio de eficiencia en memoria: analizar si la reduccion declarada de parametros (fraccion 0,5998) se traduce en ahorro real de VRAM en el checkpoint publicado, dado que el recuento de tensores safetensors es de 6.738.415.616.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1596 (15,96 %) |
| StrongREJECT ASR (juez HarmBench) | 0,1374 (13,74 %) |
| Sobrerrechazo macro (WildGuard) | 0,1208 (12,08 %) |
| Perplejidad en WikiText-2 | 11,3556 |

No se han publicado en la informacion disponible resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros), ni cifras del modelo base sin comprimir que permitan calcular la variacion exacta atribuible a la compresion.

## Requisitos de hardware

- Peso de los pesos publicados: repositorio de 13,5 GB en safetensors, coherente con un checkpoint de aproximadamente 6.738 millones de parametros en precision de 16 bits.
- VRAM estimada para inferencia en fp16/bf16: en torno a 13,5 GB para los pesos, mas el cache KV. Para Llama-2-7b en fp16 el cache KV ronda 0,5 MB por token, de modo que 4.096 tokens de contexto anaden aproximadamente 2 GB (estimacion derivada de la configuracion estandar de Llama-2-7b).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor; RTX 4090, RTX 3090 o L4 (24 GB) para ejecucion local en fp16.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en fp16 con contexto moderado; en tarjetas de 16 GB requeriria cuantizacion, que no se distribuye en el repositorio.
- Opciones de despliegue: transformers de forma nativa y text-generation-inference (el repo incluye las etiquetas `text-generation-inference` y `endpoints_compatible`). No se publican pesos GGUF, por lo que llama.cpp u Ollama exigirian una conversion manual no incluida ni validada. El soporte en vLLM no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| svd-safety-l2_remove40_swapgap_b001 | 6.738.415.616 tensores safetensors; fraccion declarada 0,5998 del modelo denso | No indicado (base: 4.096 tokens) | Llama 2 Community License | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf | ~7.000 millones | 4.096 tokens | Llama 2 Community License | HuggingFace, ampliamente utilizado |
| Otras celdas de la rejilla del mismo estudio (otras reglas y presupuestos) | No disponible | No disponible | Llama 2 Community License | No disponible en la informacion proporcionada |

No se dispone de datos publicados de modelos comparables de compresion SVD evaluados con las mismas metricas de seguridad, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor indica que es un artefacto de investigación y que no debe desplegarse como asistente.
- Seguridad degradada de forma deliberada en algunas ramas del estudio: la compresion por si sola eleva la tasa de exito de ataque. En esta celda concreta el ASR de AdvBench es 0,1596 y el de StrongREJECT 0,1374, valores que deben interpretarse en el contexto del experimento.
- Riesgo de alucinacion no caracterizado en la model card; no hay evaluaciones de veracidad publicadas para este checkpoint.
- Idiomas no declarados y herencia de un modelo base predominantemente angloparlante; el rendimiento en castellano no esta medido.
- Licencia Llama 2 Community License: el uso comercial queda sujeto a `LICENSE.txt` y `USE_POLICY.md`, incluidos en el repositorio, y a las restricciones de la licencia de Llama 2.
- Discrepancia relevante para produccion: el recuento de parametros de los tensores safetensors (6.738.415.616) no refleja directamente la fraccion de parametros densos declarada (0,5998), por lo que el ahorro real de memoria debe medirse en el entorno de destino antes de asumir cualquier ganancia.
- Ausencia de cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de gama baja.
- Contexto no confirmado en la informacion del repositorio; conviene verificar la configuracion antes de usarlo con ventanas largas.
- Repositorio sin descargas ni likes y con fecha de creacion reciente, sin validacion independiente conocida.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a un servicio de webmail sin relacion con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgap_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper, repositorio de codigo o demo del estudio: no disponibles en la informacion proporcionada
- Resultados de busqueda web relevantes: no disponibles (los resultados recuperados no guardan relacion con el modelo)
