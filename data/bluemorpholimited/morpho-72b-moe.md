# bluemorpholimited/Morpho-72B-MoE

## Resumen

Morpho-72B-MoE es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) publicado en HuggingFace por el usuario bluemorpholimited. Según su model card, parte del modelo denso Qwen2-72B (80 capas, dimensión de modelo 8192) y le añade una capa de enrutamiento MoE con 64 expertos organizados en ocho dominios temáticos, con enrutamiento top-2 por token. El autor declara 108.000 millones de parámetros totales, unos 14.000 millones activos por token, una ventana de contexto de 128.000 tokens y licencia Apache 2.0, aunque el nombre del repositorio indica 72B y el campo de licencia de HuggingFace figura vacío.

El interés del modelo es, en principio, su enfoque de especialización por dominio: expertos dedicados a finanzas, derecho, medicina, tecnología, ámbito académico, negocio, creatividad, educación y ciencias sociales. En la práctica, la propia documentación indica que solo 9 de los 64 expertos han completado su entrenamiento, mientras que los expertos 11 a 63 aparecen como pendientes, y las cifras internas de la ficha son contradictorias (se mencionan 8 expertos por capa en 40 capas, lo que daría 320 expertos, frente a los 64 declarados). No se han publicado resultados de benchmarks ni evaluaciones independientes.

El repositorio ocupa 26,9 GB, un tamaño incompatible con los pesos completos de un modelo de 108.000 millones de parámetros incluso en cuantización de 4 bits, lo que sugiere que el contenido publicado podría estar incompleto o limitado a adaptadores. A la fecha de la consulta, el modelo acumula 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad. En conjunto, se trata de un artefacto experimental en estado de desarrollo, no de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con capas Mixture-of-Experts sobre base Qwen2-72B, adaptación con QLoRA de 4 bits y enrutamiento top-2 de 8 bits (según la model card; contiene contradicciones internas) |
| Parametros totales | ~108B según la model card; el identificador del repositorio indica 72B (dato no verificado) |
| Parametros activos | ~14B por token (declarado) |
| Longitud de contexto | 128.000 tokens (128K), según la model card |
| Tipos de cuantizacion | Adaptadores entrenados en 4 bits (QLoRA). No se publican pesos en GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 según la model card; el campo de licencia del repositorio figura como no disponible |
| Formato de pesos | no disponible; el repositorio ocupa 26,9 GB sin desglose público de ficheros |
| Expertos | 64 expertos declarados, agrupados en 8 dominios de 8 expertos cada uno; enrutamiento top-2 |
| Estado del entrenamiento | 9 de 64 expertos convergidos; expertos 11 a 63 marcados como pendientes |

## Arquitectura y entrenamiento

La arquitectura descrita combina un transformer decoder denso (Qwen2-72B, 80 capas, `d_model` de 8192) con una capa MoE insertada mediante adaptadores QLoRA de 4 bits sobre el modelo base congelado. El enrutamiento es top-2, es decir, cada token activa dos expertos de los disponibles en la capa, con enrutamiento cuantizado a 8 bits. Los 64 expertos se reparten en ocho dominios declarados: finanzas (trading y mercados, inversión y carteras, banca y préstamos, seguros y riesgo, contabilidad y auditoría, fiscalidad y cumplimiento, financiación inmobiliaria e ingeniería financiera), derecho (constitucional, penal y civil, entre otros), medicina, tecnología, académico, negocio, creatividad, educación y ciencias sociales.

No se documenta el número de tokens de entrenamiento, la composición del dataset, la mezcla de datos por experto ni si hubo fases de ajuste por preferencias (RLHF, DPO) o de alineación. La única información cuantitativa de entrenamiento son las pérdidas finales por experto recogidas en la model card, que muestran una convergencia muy desigual: el experto 0 (trading) alcanza 0,0462 y el experto 7 (ingeniería financiera) se queda en 0,5049, con una media de 0,2756 sobre los nueve expertos convergidos. No hay información sobre la innovación técnica del sistema de enrutamiento ni sobre si se aplicó decodificación especulativa u otras optimizaciones de inferencia.

Existe además una inconsistencia estructural relevante: el diagrama de arquitectura indica "8 expertos por capa" distribuidos en 40 capas, lo que implicaría 320 expertos, una cifra que no coincide con los 64 expertos del panel de dominios. Esta discrepancia no se resuelve en la documentación.

## Capacidades

- Generación de texto especializada por dominio: la model card declara expertos dedicados a finanzas, derecho, medicina, tecnología, ámbito académico, negocio, creatividad, educación y ciencias sociales.
- Razonamiento y respuesta sobre contenido financiero y contable: los expertos con menor pérdida de entrenamiento (trading, contabilidad) son los que cuentan con un ajuste más completo.
- Consultas de carácter jurídico limitadas a los dominios declarados como convergidos (derecho constitucional, penal y civil), con calidad no verificada.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (*thinking mode*).
- Capacidades multilingües: no disponible; el repositorio no declara idiomas soportados.
- El comportamiento en los 55 expertos sin converger es indeterminado, por lo que las capacidades globales del sistema no pueden darse por garantizadas.

## Casos de uso

Nota previa: dado que el entrenamiento está incompleto (9 de 64 expertos) y no existen evaluaciones publicadas, los siguientes escenarios son aplicaciones objetivo plausibles del diseño declarado, no capacidades verificadas. Su uso en producción requeriría una evaluación propia previa.

- Análisis de mercados y generación de resúmenes financieros: el experto de trading es el que presenta la menor pérdida de entrenamiento (0,0462), por lo que sería el candidato más razonable para tareas de resumen de informes de mercado y extracción de métricas a partir de documentación extensa, aprovechando la ventana de 128K tokens.
- Extracción de datos contables y conciliación documental: el experto de contabilidad y auditoría (pérdida 0,0619) podría emplearse para convertir estados financieros en texto estructurado o para responder consultas sobre normativa contable en pipelines internos de back office.
- Asistencia en cumplimiento normativo y fiscalidad: el experto de fiscalidad y cumplimiento (pérdida 0,2123) permitiría construir un asistente de consulta sobre obligaciones fiscales, siempre con revisión humana y trazabilidad de fuentes.
- Revisión preliminar de documentación jurídica: con los expertos de derecho constitucional (0,0625) y civil (0,1389), el modelo podría resumir contratos o localizar cláusulas relevantes en expedientes largos, como paso previo a la revisión de un profesional.
- Bases de conocimiento internas de gran volumen: la ventana de 128K tokens permite ingerir manuales técnicos, políticas internas o expedientes completos en una sola pasada, útil para sistemas de pregunta-respuesta sobre documentación corporativa.
- Clasificación y enrutamiento temático de tickets o correos: el reparto por dominios lo hace adecuado para etiquetar entradas de usuario por área (legal, financiera, técnica) antes de derivarlas al equipo correspondiente.
- Tutoría y generación de material didáctico: los expertos académico y educativo podrían emplearse para generar explicaciones y ejercicios en un dominio concreto, con control de calidad humano.
- Generación de contenido creativo y de marketing: el experto creativo apunta a redacción publicitaria y variantes de copy, si bien es uno de los dominios sin información de convergencia publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite estándar, y los resultados de búsqueda web no aportan datos sobre el modelo.

La model card únicamente proporciona pérdidas de entrenamiento por experto, que no son comparables con métricas de evaluación y no permiten inferir calidad de generación:

| Experto | Dominio | Mejor pérdida | Estado declarado |
|---|---|---|---|
| 0 | Trading y mercados | 0,0462 | Convergido |
| 4 | Contabilidad y auditoría | 0,0619 | Convergido |
| 8 | Derecho constitucional | 0,0625 | Convergido |
| 10 | Derecho civil | 0,1389 | En curso |
| 1 | Inversión y carteras | 0,1958 | Convergido |
| 5 | Fiscalidad y cumplimiento | 0,2123 | Convergido |
| 9 | Derecho penal | 0,3451 | Convergido |
| 6 | Financiación inmobiliaria | 0,3637 | Convergido |
| 2 | Banca y préstamos | 0,4176 | Convergido |
| 3 | Seguros y riesgo | 0,4429 | Convergido |
| 7 | Ingeniería financiera | 0,5049 | Convergido |
| 11-63 | Pendientes | No disponible | Sin entrenar |

## Requisitos de hardware

Las estimaciones siguientes se derivan del tamaño declarado de ~108B parámetros. Al no haberse publicado los pesos, no es posible confirmar su disponibilidad ni el formato de despliegue.

| Precisión | VRAM estimada (solo pesos) | Hardware orientativo |
|---|---|---|
| FP16 / BF16 | ~216 GB | 3-4 GPU H100 80 GB |
| 8 bits | ~108 GB | 2 GPU H100 80 GB o 4 GPU A100 40 GB |
| 4 bits | ~54 GB | 1 GPU H100 80 GB o 2 GPU A100 40 GB |

- Al tratarse de un MoE con ~14B parámetros activos por token, el coste computacional por token se aproxima al de un modelo denso de ~14B, aunque el consumo de memoria corresponde al total de parámetros.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o una RTX 3090 (24 GB) no pueden alojar los pesos ni siquiera en 4 bits. Solo sería viable con descarga parcial de expertos a CPU y RAM abundante (por encima de 64 GB), a costa de latencia.
- La ventana de 128K tokens incrementa de forma notable el consumo de memoria de la caché KV, especialmente en FP16; se recomienda cuantizar la caché si el motor de inferencia lo permite.
- Opciones de despliegue: vLLM y SGLang cuentan con soporte de arquitecturas MoE y serían las vías naturales; TGI también es una alternativa. llama.cpp y Ollama solo serían aplicables si se generasen pesos GGUF, que no están publicados.
- Latencia y throughput estimados: no disponible. El tamaño del repositorio (26,9 GB) impide verificar que los pesos completos estén publicados, por lo que no puede estimarse un rendimiento real de despliegue.

## Comparativa con modelos similares

No existen datos de rendimiento de Morpho-72B-MoE que permitan una comparación cuantitativa. La tabla siguiente contrasta únicamente características estructurales declaradas, con datos públicos de referencia de los modelos alternativos.

| Modelo | Parámetros totales / activos | Contexto | Licencia | Estado y evaluación |
|---|---|---|---|---|
| Morpho-72B-MoE | ~108B / ~14B (declarado, no verificado) | 128K (declarado) | Apache 2.0 declarada; campo de licencia vacío en HuggingFace | Entrenamiento incompleto (9/64 expertos); sin benchmarks; 0 descargas |
| Qwen2-72B (modelo base) | 72B denso | 128K | Licencia Qwen | Publicado, documentado y evaluado |
| Mixtral 8x7B | 46,7B / 12,9B | 32K | Apache 2.0 | Publicado y evaluado |
| Qwen2.5-72B | 72B denso | 128K | Licencia Qwen | Publicado y evaluado |

La diferencia fundamental no es de tamaño, sino de madurez: las alternativas cuentan con pesos completos, documentación de entrenamiento y resultados públicos, mientras que Morpho-72B-MoE es un artefacto en desarrollo sin verificación externa.

## Limitaciones y advertencias

- Entrenamiento incompleto: solo 9 de 64 expertos figuran como convergidos; los expertos 11 a 63 aparecen como pendientes, por lo que el comportamiento del modelo en la mayoría de dominios declarados es indeterminado.
- Contradicciones en la propia documentación: el identificador indica 72B mientras la ficha declara 108B; el diagrama menciona 8 expertos por capa en 40 capas (320 expertos), incompatible con los 64 expertos del panel de dominios.
- Repositorio de 26,9 GB para un modelo declarado de 108B parámetros: incluso en 4 bits los pesos ocuparían alrededor de 54 GB, por lo que es probable que el contenido publicado esté incompleto o se limite a adaptadores.
- Ausencia total de benchmarks, evaluaciones independientes, paper técnico o demo verificable.
- Cero descargas y cero likes: sin validación por parte de la comunidad ni informes de terceros.
- Licencia ambigua: la model card afirma Apache 2.0, pero el campo de licencia del repositorio está vacío. Antes de cualquier uso comercial debe confirmarse la licencia aplicable, incluida la del modelo base Qwen2-72B, que no es Apache 2.0.
- Idiomas no declarados: se desconoce el soporte multilingüe real y su calidad fuera del inglés.
- Riesgo de alucinación no evaluado: los dominios declarados (finanzas, derecho, medicina) son de alto riesgo, y no existen métricas de fiabilidad ni de tasas de error.
- Advertencia para producción: no se recomienda su uso en entornos productivos ni en aplicaciones con impacto legal, sanitario o financiero sin una evaluación exhaustiva previa y supervisión humana.
- Fechas de metadatos (creación el 15/09/2026 y actualización el 19/09/2026) que no pueden contrastarse con la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bluemorpholimited/Morpho-72B-MoE
- Modelo base mencionado en la model card (Qwen2-72B): https://huggingface.co/Qwen/Qwen2-72B
- Paper, blog técnico, repositorio de código y demo: no disponible
- Los resultados de búsqueda web proporcionados no contienen ningún enlace relacionado con el modelo, su autor ni la organización bluemorpholimited; únicamente incluyen páginas corporativas de Microsoft, sin relación con la ficha.
