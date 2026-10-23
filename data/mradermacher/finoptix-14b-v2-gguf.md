# mradermacher/FinOptix-14B-v2-GGUF

## Resumen

FinOptix-14B-v2-GGUF es la versión cuantizada en formato GGUF del modelo ccortezb/FinOptix-14B-v2, un ajuste fino de 14.770.033.664 parámetros (unos 14,77 B) orientado a tareas de FinOps: optimización de costes en la nube, AWS, Terraform y modelado con dbt. La cuantización la ha realizado mradermacher, un tercero especializado en generar versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. El modelo original se entrenó con QLoRA y Unsloth, según las etiquetas de la model card.

El interés práctico de esta publicación es que permite ejecutar un modelo de casi 15 B parámetros especializado en un dominio muy concreto (reducción de gasto cloud, infraestructura como código y transformaciones de datos) en hardware de consumo, gracias a ficheros que van desde 5,9 GB en Q2_K hasta 15,8 GB en Q8_0. El modelo está publicado bajo licencia Apache 2.0 y declara soporte de inglés y español.

No obstante, la información pública disponible es muy limitada: la model card del repositorio GGUF es la plantilla automática del cuantizador y no incluye arquitectura del modelo base, longitud de contexto, composición del dataset de entrenamiento ni resultados de evaluación. Cualquier decisión de adopción debería ir precedida de una evaluación propia sobre el caso de uso concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la información proporcionada no detalla la arquitectura del modelo base; se trata de un transformer de 14,77 B parámetros) |
| Parámetros totales | 14.770.033.664 (~14,77 B) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0. El autor indica que no hay cuantizaciones con imatrix/pesos ponderados |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (11 ficheros); el modelo base se distribuye en formato transformers/safetensors |
| Modelo base | ccortezb/FinOptix-14B-v2 |
| Cuantizado por | mradermacher |
| Método de ajuste declarado | QLoRA con Unsloth (según etiquetas de la model card) |
| Dominio declarado | FinOps, AWS, Terraform, optimización de costes, dbt |
| Tamaño del repositorio | 102,0 GB (incluye todas las cuantizaciones) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Compatibilidad de despliegue | Etiqueta `endpoints_compatible`; uso previsto con llama.cpp y derivados |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base (tipo de atención, uso de MoE, número de capas ni dimensión oculta). Lo único verificable es el recuento de parámetros a partir de los pesos en safetensors (14.770.033.664) y el método de ajuste declarado en las etiquetas de la model card: QLoRA con Unsloth, es decir, ajuste fino con cuantización de 4 bits sobre un modelo preentrenado y optimizaciones de memoria/velocidad de Unsloth.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO ni innovaciones técnicas concretas. El conjunto de etiquetas (finops, aws, terraform, cost-optimization, dbt) sugiere un ajuste fino de dominio sobre corpus de infraestructura como código y prácticas de optimización de costes cloud, pero se trata de una inferencia a partir de metadatos, no de un dato confirmado. Esta publicación concreta no entrena nada: es una conversión de los pesos originales a GGUF en once niveles de cuantización estáticos.

## Capacidades

- Generación de texto conversacional en inglés y español.
- Asistencia en tareas de FinOps: análisis de gasto cloud, propuestas de reducción de costes y buenas prácticas de optimización.
- Trabajo con infraestructura como código, con atención especial a Terraform (revisión de recursos, detección de configuraciones costosas o mal dimensionadas).
- Soporte a flujos de datos y transformaciones con dbt, según el dominio declarado en las etiquetas.
- Conocimiento orientado a AWS como proveedor cloud de referencia del ajuste fino.
- No se documenta en la información disponible soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes, razonamiento multi-paso estructurado ni modos de "pensamiento".
- No se documenta capacidad multimodal (visión, audio) ni de otro tipo.
- Compatible con endpoints de inferencia según la etiqueta `endpoints_compatible` del repositorio.

## Casos de uso

- Revisión de Terraform en pipelines de CI: el modelo puede recibir el diff de un plan de Terraform y señalar recursos con coste recurrente elevado (instancias sobredimensionadas, almacenamiento sin ciclo de vida, NAT gateways innecesarios) antes del merge. Es adecuado porque el dominio declarado del ajuste es precisamente Terraform y optimización de costes.
- Análisis de informes de coste de AWS: dado un extracto de Cost Explorer o de coste por servicio, el modelo puede resumir los principales focos de gasto y proponer acciones de rightsizing o compra de Savings Plans. La ventana de contexto es desconocida, por lo que habría que trocear los informes grandes.
- Asistencia a equipos de plataforma: bot interno que responde preguntas sobre etiquetado de recursos, políticas de presupuesto y convenciones de tagging, desplegado con llama.cpp o vLLM en infraestructura propia para no enviar datos financieros a terceros (licencia Apache 2.0 lo permite).
- Generación y revisión de modelos dbt: creación de modelos, tests y documentación, así como detección de consultas costosas en el almacén de datos. Encaja por la etiqueta `dbt`, aunque conviene validar la calidad real del modelo en SQL antes de usarlo en producción.
- Documentación técnica de guardarraíles de coste: redacción de runbooks, políticas de alertas de presupuesto y guías internas de optimización a partir de notas dispersas del equipo.
- Preprocesado y clasificación de tickets de infraestructura: etiquetar incidencias o peticiones internas (coste, red, permisos, datos) para enrutarlas al equipo adecuado, aprovechando el soporte de inglés y español.
- Evaluación comparativa interna de modelos de dominio: al ser una cuantización GGUF de 14,77 B, sirve como línea base ejecutable en una sola GPU para comparar contra modelos generalistas en tareas de FinOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF es la plantilla automática del cuantizador e incluye únicamente la tabla de ficheros con sus tamaños; no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica. Tampoco se han publicado cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del fichero más caché KV y overhead del runtime; la longitud de contexto es desconocida, así que la caché KV puede crecer de forma significativa con contextos largos):
  - Q2_K (5,9 GB): viable en GPU de 8 GB, con margen ajustado.
  - Q3_K_S / Q3_K_M / Q3_K_L (6,8–8,0 GB): GPU de 10–12 GB.
  - IQ4_XS (8,3 GB) y Q4_K_S / Q4_K_M (8,7–9,1 GB): GPU de 12 GB con contexto moderado; cómodo en 16 GB. El autor marca Q4_K_S y Q4_K_M como "fast, recommended".
  - Q5_K_S / Q5_K_M (10,4–10,6 GB): GPU de 16 GB.
  - Q6_K (12,2 GB): GPU de 16 GB con contexto corto, o 24 GB con holgura.
  - Q8_0 (15,8 GB): GPU de 24 GB (RTX 3090/4090, A10G, L4 24 GB). El autor lo marca como "fast, best quality".
  - Pesos originales en FP16 (~29,5 GB estimados a partir de 14,77 B parámetros × 2 bytes): A100 40 GB, H100, o dos GPU de 24 GB.
- GPU recomendadas: RTX 4090/3090 (24 GB) para Q6_K–Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M–Q5_K_M; A100/H100 solo si se necesita FP16 o mucho paralelismo.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB con Q4_K_M en adelante; en 8 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, llama-cpp-python, text-generation-webui y vLLM con soporte GGUF. TGI no soporta GGUF de forma nativa. Para CPU pura, Q4_K_M es el punto de equilibrio habitual.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| FinOptix-14B-v2-GGUF (esta ficha) | 14,77 B | No disponible | Apache 2.0 | GGUF (11 cuantizaciones) | No disponible |
| FinOptix-14B-v2 (original de ccortezb) | 14,77 B | No disponible | Apache 2.0 | transformers/safetensors | No disponible |
| Alternativas de 13–15 B especializadas en código, cloud o FinOps | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos alternativos de la misma categoría (parámetros, contexto, benchmarks o disponibilidad), por lo que no se ofrece una comparación numérica que pudiera resultar inventada. La única comparación defendible es contra el modelo original: misma arquitectura y pesos, con la diferencia de que la versión GGUF reduce el peso entre un 46 % (Q8_0) y un 80 % (Q2_K) respecto a FP16 a cambio de una pérdida de calidad que no ha sido medida.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, ni comparativas, ni pruebas de calidad por nivel de cuantización. El uso en producción requiere evaluación propia.
- Longitud de contexto desconocida: impide dimensionar la caché KV y limita el diseño de aplicaciones con documentos largos.
- La model card de este repositorio es la plantilla automática del cuantizador; no aporta información sobre sesgos, datos de entrenamiento ni casos de fallo del modelo original.
- Riesgo de alucinación en un dominio sensible: precios de AWS, límites de servicio y características de productos cambian con frecuencia, y el modelo puede generar cifras o nombres de recursos obsoletos o inexistentes. Cualquier recomendación de coste debe validarse contra la documentación oficial y las APIs de facturación.
- Las cuantizaciones Q2_K y Q3_K degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality". Para uso real conviene partir de Q4_K_M o superior.
- Herencia de los sesgos y limitaciones del modelo base, que no se documentan.
- Cobertura lingüística declarada en inglés y español, sin métricas de calidad por idioma; el comportamiento en español técnico (terminología de AWS, Terraform, dbt) no está verificado.
- Es un ajuste fino de dominio: es esperable un rendimiento inferior a modelos generalistas del mismo tamaño en tareas ajenas a FinOps, cloud e infraestructura.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar avisos de licencia y atribución; no impone restricciones de uso adicionales, pero tampoco ofrece garantías.
- El repositorio ocupa 102 GB e incluye todas las cuantizaciones; conviene descargar únicamente el fichero GGUF necesario.
- Sin tracción comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que reduce la probabilidad de encontrar informes de uso o correcciones de errores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FinOptix-14B-v2-GGUF
- Modelo base: https://huggingface.co/ccortezb/FinOptix-14B-v2
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#FinOptix-14B-v2-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de ficheros GGUF y concatenación de partes (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura empleada por el cuantizador): https://www.nethype.de/
