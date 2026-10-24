# ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF es un conjunto de cuantizaciones GGUF no uniformes del modelo DeepSeek-V4.1-Flash-1017, un mixture-of-experts disperso de 763,2 mil millones de parámetros (384 expertos enrutados por capa, 6 activos por token) con una ventana de contexto de 1 millón de tokens. El trabajo lo firma ISTA-DASLab (Deep Algorithms and Systems Lab), del Institute of Science and Technology Austria, y no DeepSeek: es decir, se trata de una distribución de pesos cuantizados, no de un modelo entrenado desde cero por el autor del repositorio.

La relevancia del artefacto está en el método, no en el modelo base. En lugar de aplicar un único tipo de cuantización a todas las matrices, cada tensor recibe su propio tipo, elegido mediante una búsqueda basada en gradientes (RCO) que reparte el presupuesto de bits según la sensibilidad de cada tensor, mientras GSQ aprende la asignación de rejilla y las escalas por grupo con una relajación de Gumbel-Softmax. El resultado son ficheros GGUF estándar de 231,32 GB (IQ1_M, 1,75 bpw), 248,84 GB (IQ2_XXS, 2,00 bpw) y 265,83 GB (IQ2_XS, 2,25 bpw), ejecutables según el autor en una sola GPU de 12 GB de VRAM mediante el runtime Strata.

El punto de operación recomendado, IQ2_XXS, iguala al modelo base en los tres benchmarks evaluados (AIME25, GPQA-Diamond y LiveCodeBench v6) con una media de tarea de 93,54, según la model card. IQ1_M cede 1,2 puntos de media a cambio de 17,5 GB menos de peso. Todo el repositorio ocupa 524,8 GB e incluye una tabla Engram compartida de 196,6 mil millones de parámetros a IQ4_NL que debe descargarse una sola vez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts disperso (384 expertos enrutados por capa, 6 activos por token) mas tablas de lookup Engram |
| Parametros totales | 763,2 B segun la model card (551,9 B de backbone + 196,6 B de Engram). Los metadatos de safetensors del repo declaran 196.613.849.600, cifra que coincide solo con el fichero Engram; existe una discrepancia de 14,7 B respecto a la suma declarada en la model card |
| Parametros activos | No disponible (se sabe que se activan 6 de los 384 expertos enrutados por token, pero no se publica el recuento de parametros activos) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Backbone: IQ1_M (1,75 bpw), IQ2_XXS (2,00 bpw), IQ2_XS (2,25 bpw), con tipo por tensor elegido por RCO. Engram: IQ4_NL (4,50 bpw) fijo en todas las builds |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (backbone en 4 shards + fichero Engram independiente) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 384 expertos enrutados por capa y enrutamiento disperso de 6 expertos por token, más una ventana de contexto de 1M tokens. Una particularidad arquitectónica es la presencia de dos tablas Engram (196,6 B de parámetros en total) que la model card describe como un lookup y no como un peso de matmul: se leen de forma dispersa, una fila por token. Esa naturaleza de tabla es la razón por la que quedan excluidas de la búsqueda de cuantización y se mantienen a tipo fijo IQ4_NL en todas las builds.

Sobre el entrenamiento del modelo base no hay información en el material disponible (ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO). Lo que sí está documentado es el proceso de cuantización, que es el objeto de este repositorio. GSQ (Gumbel-Softmax Quantization, arXiv:2604.18556) aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajación de Gumbel-Softmax, cerrando buena parte de la brecha entre cuantización escalar y vectorial en el rango de 2 a 3 bits, y manteniéndose desplegable en formatos escalares estándar como GGUF. RCO (Riemannian Constrained Optimization, arXiv:2605.00649) resuelve la asignación de uno de K tipos de cuantización a cada uno de N tensores bajo una restricción de tamaño total, reformulando la restricción como una variedad riemanniana suave en espacio logit, lo que permite optimizar directamente sobre la pérdida de tarea con cumplimiento exacto del presupuesto y sin hiperparámetros específicos de la restricción.

Una limitación estructural del formato: GGUF no puede expresar cuantización por experto, así que la búsqueda asigna el tipo por capa dentro de los expertos enrutados, que dominan tanto el recuento de parámetros como el presupuesto de tamaño.

## Capacidades

- Generación de texto y razonamiento de propósito general con 1M tokens de contexto, lo que permite mantener documentos o bases de código completas en la ventana.
- Razonamiento matemático y científico de competición: el modelo base se evalúa en AIME25 y GPQA-Diamond, y la build IQ2_XXS conserva la media de tarea del modelo sin cuantizar (93,54).
- Generación y comprensión de código: evaluado en LiveCodeBench v6, con conservación de rendimiento en IQ2_XXS.
- Ejecución en hardware de consumo: las tres builds están pensadas para correr en una GPU de 12 GB mediante Strata, lo que habilita prototipado local de un MoE de 763 B.
- Cuantización escalar de precisión mixta: cada tensor puede tener un tipo distinto dentro del mismo fichero GGUF, sin necesidad de runtime propietario.
- Memoria tipo lookup (Engram) mapeada desde disco: las tablas se leen de forma dispersa, una fila por token, por lo que no es necesario mantenerlas residentes en VRAM.
- Tool calling, function calling, capacidades de agente, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de gran escala en una estación de trabajo con GPU de 12 GB: usando Strata con la build IQ2_XXS, el modelo completo (backbone más Engram mapeado desde disco) puede servirse sin clúster, lo que hace viable experimentation con un modelo de 763 B en una máquina individual.
- Razonamiento matemático asistido: la build IQ2_XXS mantiene la media de tarea del modelo base en AIME25 y GPQA-Diamond, así que sirve para pipelines de verificación de demostraciones o resolución de problemas cuantitativos donde no se quiere pagar el coste de servir los pesos originales.
- Asistencia sobre repositorios completos: con 1M tokens de contexto, el modelo puede recibir un árbol de código extenso y responder preguntas transversales (dependencias, impacto de un cambio) sin trocear el contexto en recuperación por partes.
- Generación de código en local para entornos con requisitos de privacidad: al ser pesos MIT ejecutables offline con llama.cpp o Strata, encaja en flujos donde el código no puede salir de la red corporativa.
- Investigación en cuantización: el repositorio es un artefacto de referencia para comparar GSQ+RCO frente a cuantización uniforme a igual presupuesto de bits, con tres puntos operativos (1,75 / 2,00 / 2,25 bpw) sobre el mismo modelo base.
- Servicio de chat de contexto largo en hardware modesta: la ventana de 1M tokens permite conversaciones multi-turno con historial extenso o análisis de contratos, informes y documentación técnica de cientos de miles de tokens en una sola GPU.
- Evaluación comparativa de runtimes GGUF: al publicarse el mismo backbone en tres bpw con un fichero Engram común, sirve para medir el impacto real de bajar de 2,25 a 1,75 bpw en latencia, memoria y calidad sobre el mismo hardware.

## Benchmarks y rendimiento

La model card reporta resultados sobre AIME25, GPQA-Diamond y LiveCodeBench v6, pero solo publica cifras agregadas en texto; los valores por benchmark aparecen únicamente en una figura del repositorio, por lo que no se transcriben aquí.

| Metrica | Modelo base (sin cuantizar) | IQ2_XXS (2,00 bpw) | IQ1_M (1,75 bpw) |
|---|---|---|---|
| Media de tarea (AIME25 + GPQA-Diamond + LiveCodeBench v6) | 93,54 | 93,54 | 92,34 (1,2 puntos menos) |
| Porcentaje respecto al base | 100,0% | 100,0% | No disponible en el texto |
| AIME25 | No disponible en el texto | Igual que el base | No disponible en el texto |
| GPQA-Diamond | No disponible en el texto | Igual que el base | No disponible en el texto |
| LiveCodeBench v6 | No disponible en el texto | Igual que el base | No disponible en el texto |

No se han publicado en el texto resultados desglosados por benchmark ni comparaciones con modelos de terceros. La build IQ2_XS no tiene cifras de rendimiento publicadas en la información disponible.

## Requisitos de hardware

- VRAM: 12 GB según el autor, para cualquiera de las tres builds, siempre que se use el runtime Strata. La sección de requisitos de memoria de la model card está marcada como pendiente (TBD), así que no se detalla qué tensores permanecen en VRAM ni cuánta RAM de sistema hace falta.
- Almacenamiento: 231,32 GB (IQ1_M), 248,84 GB (IQ2_XXS) o 265,83 GB (IQ2_XS), incluyendo el fichero Engram compartido de 110,60 GB. El repositorio completo ocupa 524,8 GB.
- GPU recomendadas: no especificadas por el autor. Como estimación a partir del tamaño de los ficheros, servir el backbone sin el esquema de offload de Strata exigiría del orden de 120-155 GB de memoria, es decir, múltiples A100/H100 de 80 GB; la propuesta del autor es precisamente evitar ese escenario.
- GPU de consumo: sí, con Strata en una GPU de 12 GB. Sin Strata no cabe en ninguna consumer GPU actual por tamaño de pesos.
- Opciones de despliegue: Strata (runtime indicado por el autor para el escenario de 12 GB), llama.cpp y cualquier runtime compatible con GGUF estándar. Soporte en vLLM, TGI u Ollama: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles. La model card no publica métricas de velocidad, y el rendimiento dependerá fuertemente del offload a disco de las tablas Engram y del ancho de banda de la memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | 763,2 B (551,9 B backbone + 196,6 B Engram) | 1M | Safetensors, precision original | Media de tarea 93,54 | No disponible en la informacion | Repo `deepseek-ai/DeepSeek-V4.1-Flash-1017` |
| Este repo, IQ2_XXS | 763,2 B | 1M | GGUF, 2,00 bpw backbone + IQ4_NL Engram | 93,54 (100,0% del base) | MIT | HuggingFace ISTA-DASLab |
| Este repo, IQ2_XS | 763,2 B | 1M | GGUF, 2,25 bpw backbone + IQ4_NL Engram | No disponible | MIT | HuggingFace ISTA-DASLab |
| Este repo, IQ1_M | 763,2 B | 1M | GGUF, 1,75 bpw backbone + IQ4_NL Engram | 92,34 (-1,2 puntos) | MIT | HuggingFace ISTA-DASLab |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE de ~700 B cuantizado a ~2 bits) en la información proporcionada.

## Limitaciones y advertencias

- La model card está truncada en el momento de la consulta: la sección de requisitos de memoria queda como TBD y no se documenta qué parte del modelo reside en VRAM ni la RAM necesaria con Strata.
- Discrepancia numérica sin resolver: la card afirma 763,2 B de parámetros, pero 551,9 B de backbone más 196,6 B de Engram suman 748,5 B; además, los metadatos de safetensors del repositorio declaran 196.613.849.600 parámetros, cifra que corresponde solo al fichero Engram.
- La cuantización a 1,75-2,25 bits por peso implica una pérdida de calidad medible: IQ1_M cede 1,2 puntos de media de tarea frente al modelo base. IQ2_XS no tiene cifras publicadas.
- GGUF no permite expresar cuantización por experto, de modo que el presupuesto de bits se asigna por capa dentro de los expertos enrutados; la granularidad del reparto es menor de lo que el método permitiría en otros formatos.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible. Un modelo de razonamiento cuantizado agresivamente puede degradar su calibración de forma no reflejada en la media de tres benchmarks.
- Cobertura de idiomas no declarada: no hay lista de idiomas soportados ni evaluación multilingüe, lo que es un riesgo directo para despliegues en castellano.
- Sesgos: no documentados por el autor.
- Operativa: el fichero Engram debe estar en el mismo directorio que los shards del backbone, ya que se carga desde ahí; perderlo o moverlo rompe la carga del modelo.
- Coste de almacenamiento elevado: entre 231 y 266 GB por build, y 524,8 GB si se descarga el repositorio completo; conviene descargar selectivamente los shards de una sola build más el Engram.
- Licencia MIT: permite uso comercial y modificaciones, pero al ser una cuantización conviene verificar también los términos del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`.
- El escenario de 12 GB depende de Strata, un proyecto de terceros (`Niko1221/Strata`) no mantenido por el mismo laboratorio que publica los pesos; el soporte en llama.cpp estándar para las tres builds no se detalla.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Paper RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Organizacion DASLab: https://github.com/IST-DASLab
- Runtime Strata: https://github.com/Niko1221/Strata
