# nokkela-ai/Kolibri-1.1

## Resumen

Kolibri 1.1 es un modelo de lenguaje de tipo mixtura de expertos (MoE) desarrollado por Aleph Alpha Research GmbH, con foco en razonamiento multi-paso y en los idiomas aleman e ingles. Se trata de un continuacion del Kolibri 1, entrenado a partir de un checkpoint intermedio de este ultimo, e incorpora atencion dispersa (sparse attention) para abaratar el coste de contextos largos. El modelo cuenta con 75.112 millones de parametros totales y 3.439 millones de parametros activos por token, lo que lo situa en la categoria de modelos MoE de gran tamano pero bajo coste de inferencia por token.

La arquitectura combina dos capas densas iniciales con 48 capas MoE, cada una con 384 expertos enrutados (se seleccionan 6 por token) y un experto compartido, junto con una relacion 4:1 entre atencion de ventana deslizante y atencion dispersa. Dispone de una longitud de contexto nativa de 262.144 tokens, ampliable hasta 1.048.576 tokens, aunque el propio autor recomienda no superar los 262.144 en tareas complejas.

Su relevancia actual radica en que combina un modo de razonamiento explicito y soporte de tool calling con una licencia Apache 2.0 y un coste de servicio medido muy competitivo: segun el autor, obtiene un 73,2 % en su evaluacion agregada con 0,21 horas-GPU por cada 1.000 tareas, frente al 66,6 % y 0,72 horas-GPU de Kolibri 1.0. La ficha que nos ocupa corresponde a un fork independiente publicado por nokkela-ai bajo el identificador `nokkela-ai/Kolibri-1.1`, que reproduce el modelo base de Aleph Alpha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE: 2 capas densas + 48 capas MoE (384 expertos enrutados, 6 seleccionados por token, 1 experto compartido); atencion ventana deslizante/dispersa 4:1 |
| Parametros totales | 75.112.665.344 (75B) |
| Parametros activos | 3.439.874.304 (3,44B por token) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.048.576 tokens (recomendado <=262.144) |
| Tipos de cuantizacion | Pesos FP8 en este repositorio; el autor publica cuantizaciones GGUF en `Aleph-Alpha/Kolibri-1.1-GGUF` |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 77,5 GB), compatible con vLLM |

## Arquitectura y entrenamiento

Kolibri 1.1 es un transformer MoE que continua el entrenamiento desde un checkpoint intermedio de Kolibri 1, que a su vez acumulaba 20 billones (T) de tokens de preentrenamiento y 3,42 T de mid-training. Sobre esa base se anaden 805.000 millones (B) de tokens de mid-training con atencion dispersa y 201 B de tokens de contexto largo, tambien con atencion dispersa. El entrenamiento emplea Muon como optimizador y Exact Quantile Balancing para el enrutamiento de expertos. El coste computacional declarado de las fases propias de Kolibri 1.1 es de 5,52x10^22 FLOPs, excluyendo los 5,86x10^23 FLOPs del modelo base del que parte.

La fase de post-entrenamiento combina SFT con una mezcla bilingue filtrada de datos abiertos y sinteticos, seguida de RL sobre un conjunto amplio de entornos que cubren razonamiento, uso agentico y seguimiento de instrucciones. La innovacion tecnica principal es la sustitucion parcial de la atencion densa por atencion dispersa (con proporcion 4:1 frente a ventana deslizante), que reduce el coste de prefill y decodificacion en contextos largos. El modelo incorpora ademas un modo de razonamiento explicito y soporte de tool calling.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Razonamiento multi-paso con modo de razonamiento explicito.
- Generacion y comprension de codigo.
- Tool calling / function calling para integracion en sistemas externos.
- Flujos agenticos con razonamiento multi-paso y uso de herramientas.
- Procesamiento de documentos largos y RAG gracias a su ventana de contexto.
- Extraccion estructurada de informacion.
- Capacidades multilingues limitadas a aleman e ingles.
- Conocimiento implicito con fecha de corte el 18 de junio de 2026 (segun el autor), ampliable mediante uso de herramientas.

## Casos de uso

- Atencion al cliente automatizada en aleman e ingles: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 262.144 tokens recomendados) e integrarse con herramientas de consulta de pedidos o CRM mediante tool calling.
- Generacion de codigo en produccion: su soporte de function calling permite conectarlo a pipelines de CI/CD, linters o repositorios para tareas de revision, generacion de tests y refactorizacion.
- RAG sobre documentacion corporativa: la ventana de contexto nativa permite inyectar grandes volumentes de fragmentos recuperados sin truncamientos agresivos, con coste de atencion reducido por la atencion dispersa.
- Procesamiento de documentos largos (contratos, informes, expedientes) en aleman: extraccion estructurada y resumen de documentos de cientos de miles de tokens.
- Agentes autonomos de multiple paso: planificacion y ejecucion de tareas con llamadas a herramientas encadenadas, apoyandose en el modo de razonamiento explicito.
- Asistente interno bilingue para equipos en entornos europeos: despliegue on-premise con licencia Apache 2.0 y cumplimiento del codigo de practicas GPAI de la UE.
- Analisis y sintesis de literatura tecnica o juridica en aleman e ingles, con citas y extraccion de entidades.

## Benchmarks y rendimiento

El autor publica una evaluacion agregada propia (ponderando ingles y aleman al 50 %) en la que Kolibri 1.1 obtiene un 73,2 % con un coste modelado de 0,21 horas-GPU por cada 1.000 tareas de evaluacion. Kolibri 1.0 obtiene un 66,6 % con 0,72 horas-GPU (3,4 veces mas coste). En la misma grafica se situan GLM-5.3 Flash con 2,49 horas-GPU y Qwen3.8 27B con 1,97 horas-GPU, ambos por encima del eje de coste representado. El autor indica que Kolibri 1.1 queda en la frontera de Pareto junto a Qwen3.8 Flash Next.

| Modelo | Puntuacion agregada | Horas-GPU / 1.000 tareas |
|---|---|---|
| Kolibri 1.1 | 73,2 % | 0,21 |
| Kolibri 1.0 | 66,6 % | 0,72 |
| Qwen3.8 Flash Next | no disponible | no disponible (en frontera de Pareto) |
| GLM-5.3 Flash | no disponible | 2,49 |
| Qwen3.8 27B | no disponible | 1,97 |

No se han publicado en la informacion disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) ni comparaciones detalladas mas alla de la grafica de coste-rendimiento descrita.

## Requisitos de hardware

- Huella de memoria del modelo: aproximadamente 77,6 GB.
- Minimo declarado por el autor: 2x H100 SXM5, 2x H200, 1x B200 o 1x B300.
- Configuracion recomendada: 4x H100 SXM5, 2x H200, 2x B200 o 1x B300.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en su formato FP8; requeriria cuantizaciones GGUF agresivas y aun asi no es viable para el modelo completo en una sola GPU de consumo.
- Despliegue: el repositorio esta preparado para vLLM (libreria declarada). El autor publica cuantizaciones GGUF para llama.cpp/Ollama en el repositorio `Aleph-Alpha/Kolibri-1.1-GGUF`.
- El autor midio throughput con vLLM 0.33 sobre un nodo de 8x B200 con pesos de 8 bits, probando varias disposiciones (TP1, TP2, TP4, TP8, DP4+EP4, DP8+EP8, DP4xTP2+EP8, DP2xTP4+EP8, TP8+EP8) y conservando la mas rapida por modelo. No se publican cifras absolutas de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Kolibri 1.1 | 75B / 3,44B | 262.144 nativo (hasta 1.048.576) | Apache 2.0 | Pesos abiertos en HF | 73,2 % agregado a 0,21 h-GPU/1.000 tareas |
| Kolibri 1.0 | no disponible | no disponible | Apache 2.0 | Pesos abiertos | 66,6 % agregado a 0,72 h-GPU/1.000 tareas |
| Qwen3.8 Flash Next | no disponible | no disponible | no disponible | no disponible | En frontera de Pareto segun el autor |
| Qwen3.8 27B | 27B (segun nombre) | no disponible | no disponible | no disponible | 1,97 h-GPU/1.000 tareas |
| GLM-5.3 Flash | no disponible | no disponible | no disponible | no disponible | 2,49 h-GPU/1.000 tareas |

Los datos de comparacion disponibles se limitan a la grafica de coste-rendimiento publicada por el autor; no se dispone de especificaciones completas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo aleman e ingles; no se declara soporte de castellano ni de otros idiomas.
- Conocimiento implicito limitado a la fecha de corte del 18 de junio de 2026; informacion posterior requiere uso de herramientas.
- La calidad puede degradarse en tareas complejas con contextos superiores a 262.144 tokens, aunque el modelo acepte hasta 1.048.576.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el autor remite a su documento de uso responsable (`RESPONSIBLE_USE.md`).
- No se detallan sesgos conocidos en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor publica guias de uso responsable y es firmante del codigo de practicas GPAI de la UE, lo que puede implicar obligaciones regulatorias para despliegues en la UE.
- El repositorio es un fork independiente de nokkela-ai; conviene verificar la integridad de los pesos frente al original de Aleph Alpha antes de usarlo en produccion.
- Requiere hardware de gama alta (multiples H100/H200/B200); no es desplegable en GPU de consumo.
- El modelo esta pensado para texto; no se declaran capacidades de vision o audio.

## Enlaces

- Repositorio del fork: https://huggingface.co/nokkela-ai/Kolibri-1.1
- Modelo original: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Cuantizaciones GGUF: https://huggingface.co/Aleph-Alpha/Kolibri-1.1-GGUF
- Blog post de Kolibri 1.1: https://aleph-alpha.com/en/blog/kolibri-1-1/
- Informe tecnico de Kolibri 1: https://aleph-alpha.com/downloads/tech-report.pdf
- Guia de uso responsable: https://huggingface.co/Aleph-Alpha/Kolibri-1.1/blob/main/RESPONSIBLE_USE.md
- Codigo de practicas GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Paper referenciado (arXiv 2512.11614): https://arxiv.org/abs/2512.11614
- Paper referenciado (arXiv 2601.17858): https://arxiv.org/abs/2601.17858
