# Jeesup/svd-safety-l2_remove60_sigma_b001

## Resumen

svd-safety-l2_remove60_sigma_b001 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, publicado por el usuario Jeesup en HuggingFace. Se trata de un artefacto experimental, no de un asistente conversacional desplegable: su propósito es medir cómo la compresión por descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo alineado y qué reglas de selección de componentes logran repararlo.

El modelo parte de un checkpoint comprimido con SVD-LLM al 40,1 % de los parámetros densos (59,91 % de parámetros eliminados) y después restaura un presupuesto del 0,1 % de parámetros densos en componentes SVD seleccionados mediante la regla denominada `sigma`, con 544 componentes restaurados, 0 sustituidos y semilla 42. Forma parte de una rejilla experimental que cruza reglas de selección y presupuestos de restauración, y varias celdas de esa rejilla están deliberadamente degradadas en seguridad.

La relevancia es metodológica: cuantifica el coste en seguridad de la compresión de modelos y sirve como sujeto de prueba reproducible para evaluar mecanismos de reparación. La model card advierte explícitamente de que debe tratarse como objeto de estudio y no como un asistente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama-2), con matrices de pesos comprimidas mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (según safetensors; la model card declara una fracción resultante de 0,4009 sobre el modelo denso) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat; no se indica en la model card del repositorio) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors; no se especifica precisión) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors; librería transformers; compatible con text-generation-inference y endpoints_compatible |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Regla de selección | `sigma` |
| Presupuesto de restauración | 0,100 % de parámetros densos |
| Componentes restaurados / sustituidos | 544 / 0 |
| Fracción de parámetros resultante | 0,4009 |
| Semilla | 42 |
| Tamaño del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal y normalización RMSNorm. Sobre ese checkpoint se aplica una compresión SVD-LLM que elimina el 59,91 % de los parámetros, seguida de una fase de restauración selectiva en la que se reintroducen componentes singulares según la regla `sigma` hasta consumir un presupuesto del 0,1 % de los parámetros densos (544 componentes restaurados, ninguno sustituido).

No se ha publicado en la información disponible ningún detalle sobre datos de entrenamiento adicional, número de tokens, composición del dataset ni uso de RLHF o DPO. No se trata de un modelo reentrenado: es un derivado estructural del checkpoint base, por lo que el conocimiento procede íntegramente de Llama-2-7b-chat. La innovación metodológica es la propia rejilla experimental: permite comparar reglas de selección de componentes y presupuestos de restauración frente a métricas de seguridad y de utilidad (perplejidad) de forma controlada y reproducible (semilla fija 42).

Se observa una discrepancia entre el recuento de parámetros reportado por safetensors (6.738.415.616, idéntico al del modelo denso de Llama-2-7B) y la fracción de parámetros declarada en la model card (0,4009). La información disponible no permite determinar la causa; podría deberse a que los tensores conservan la forma original, pero esto no está confirmado.

## Capacidades

- Generación de texto conversacional en inglés heredada de Llama-2-7b-chat, con la degradación funcional propia de la compresión aplicada.
- Razonamiento y respuesta a instrucciones de propósito general, en la medida en que sobreviven al proceso de compresión.
- Sujeto de evaluación de seguridad: medición de attack success rate (ASR) frente a AdvBench y StrongREJECT con juez HarmBench.
- Medición de sobre-rechazo (over-refusal) mediante WildGuard.
- Medición de calidad lingüística mediante perplejidad en WikiText-2.
- Soporte de tool calling / function calling: no disponible (no se documenta en el repositorio).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta; el modelo se declara explícitamente no apto como asistente general).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión y seguridad: permite cuantificar cómo el recorte de componentes singulares eleva la tasa de éxito de ataques (ASR 0,3269 en AdvBench) y comparar ese efecto con otras celdas de la rejilla que usan reglas de selección distintas.
- Reproducción de experimentos de ablación: al fijar la semilla 42 y publicar el presupuesto exacto (0,1 %, 544 componentes), otro grupo puede replicar la celda y verificar las métricas publicadas.
- Calibración de evaluadores de seguridad: los valores de ASR y de over-refusal (0,0849 en WildGuard) sirven como referencia para validar que un pipeline de red-teaming detecta degradaciones inducidas por compresión.
- Estudio de interpretabilidad de componentes SVD: los 544 componentes restaurados constituyen un objeto concreto para analizar qué subespacios de pesos están asociados a comportamiento de rechazo.
- Benchmarking de utilidad bajo compresión: la perplejidad de 17,6323 en WikiText-2 permite trazar la curva calidad-seguridad frente a la fracción de parámetros conservada.
- Docencia y divulgación técnica: ejemplo reproducible de compromiso entre eficiencia (40,1 % de parámetros densos) y alineación de seguridad en un modelo abierto.
- Validación de infraestructuras de despliegue: sirve para probar pipelines de transformers, text-generation-inference o endpoints compatibles con un checkpoint derivado, sin exponerlo a usuarios finales.

## Benchmarks y rendimiento

Métricas publicadas en la model card del propio repositorio:

| Metrica | Resultado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3269 |
| StrongREJECT ASR (juez HarmBench) | 0,3450 |
| Macro over-refusal (WildGuard) | 0,0849 |
| Perplejidad WikiText-2 | 17,6323 |

No se han publicado en la información disponible resultados comparativos del modelo base Llama-2-7b-chat ni de otras celdas de la rejilla sobre estas mismas métricas, por lo que no es posible establecer una comparación numérica directa. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-16 GB solo para pesos (6.738.415.616 parámetros), más overhead de activaciones y caché KV. El repositorio ocupa 13,5 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB. Estas cifras son estimaciones basadas en el recuento de parámetros, no en pruebas publicadas.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) y tarjetas de 24 GB como RTX 3090 o RTX 4090 para fp16.
- Cabe en GPU de consumo: sí en RTX 3090/4090 (24 GB) en fp16; en tarjetas de 12 GB como RTX 3060 solo con cuantización de 4 u 8 bits, siempre que se genere un artefacto cuantizado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags del repositorio. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, que no se distribuye.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove60_sigma_b001 | 6.738.415.616 (safetensors); fracción declarada 0,4009 | 4096 (heredado) | AdvBench ASR 0,3269; StrongREJECT ASR 0,3450; over-refusal 0,0849; ppl WikiText-2 17,6323 | Llama 2 Community License | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | 4096 | No disponible en la información proporcionada | Llama 2 Community License | HuggingFace, público |
| Otras celdas de la rejilla del mismo autor (distintas reglas y presupuestos) | No disponible | No disponible | No disponible | Llama 2 Community License | No disponible |
| Otros checkpoints comprimidos con SVD-LLM | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye métricas del modelo base sobre las mismas pruebas, de modo que la magnitud exacta de la degradación en seguridad no puede calcularse con los datos disponibles.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica que no es un modelo de chat de propósito general y que no debe desplegarse como asistente.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint presenta un ASR de 0,3269 en AdvBench y 0,3450 en StrongREJECT, valores elevados para un modelo supuestamente alineado.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; la compresión agresiva puede aumentar la generación de contenido incorrecto, pero no hay datos que lo cuantifiquen en este repositorio.
- Cobertura de idiomas: no disponible; el modelo base está orientado principalmente al inglés, pero no se documenta para este derivado.
- Limitaciones de contexto: el contexto no se declara en la model card; el valor de 4096 tokens es una herencia del modelo base y no una especificación verificada en el repositorio.
- Discrepancia de parámetros: el recuento de safetensors coincide con el del modelo denso pese a declararse una fracción de 0,4009; conviene verificarlo antes de extraer conclusiones sobre el tamaño efectivo o el ahorro de memoria.
- Licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md incluidos en el repositorio; el uso comercial está sujeto a dicha licencia, que impone restricciones (entre ellas, límites de escala de usuarios y cumplimiento de la política de uso aceptable).
- Ausencia de validación externa: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks independientes ni revisión por pares.
- La búsqueda web realizada no devolvió documentación técnica, papers ni discusiones relevantes sobre este checkpoint (los resultados obtenidos correspondían a un software de clonación de discos, sin relación con el modelo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove60_sigma_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso: archivos LICENSE.txt y USE_POLICY.md incluidos en el repositorio del modelo
- Paper del método SVD-LLM, blogs del autor, repositorios de código o demos: no disponibles en la información proporcionada
- Resultados de búsqueda web relevantes: no disponibles (ninguno de los resultados obtenidos guarda relación con el modelo)
