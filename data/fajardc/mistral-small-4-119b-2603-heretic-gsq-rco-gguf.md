# fajardc/Mistral-Small-4-119B-2603-heretic-GSQ-RCO-GGUF

## Resumen

Esta ficha cubre una cuantización GGUF del modelo `darkc0de/Mistral-Small-4-119B-2603-heretic`, a su vez una versión "abliterated" (decensurada) del `mistralai/Mistral-Small-4-119B-2603` de Mistral AI. Se trata de un modelo de mezcla de expertos (MoE) de 118.972.826.624 parámetros totales, con 6.500 millones de parámetros activos por token, 36 capas, atención multi-cabeza latente (MLA), 128 expertos con 4 activos más uno compartido, y una ventana de contexto de 262.144 tokens. Acepta entrada de texto e imagen (aunque la torre de visión no está incluida en este archivo GGUF) y ofrece modos instruct y de razonamiento.

La pieza que nos ocupa la ha producido el usuario `fajardc`, que ha aplicado un pipeline de cuantización mixta de precisión basado en GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization), siguiendo el procedimiento del DAS Lab del IST Austria, con un presupuesto de 3,501 bits por peso sobre el conjunto del archivo (52,07 GB). El resultado no es un IQ3_S uniforme: cada tensor lleva el tipo que RCO le asignó dentro de un rango que va de IQ2_XS a Q6_K.

El interés de esta ficha es doble. Por un lado, documenta una técnica de cuantización de precisión mixta orientada a minimizar la divergencia KL respecto al modelo BF16, con métricas publicadas (KL de 0,1586 en WikiText-2). Por otro, advierte de que el modelo base es "heretic": se le ha practicado una ablación direccional para eliminar la mayoría de los rechazos, lo que lo hace inadecuado para despliegues públicos sin salvaguardas adicionales. La licencia declarada es Apache 2.0, pero la responsabilidad de uso recae enteramente en quien lo despliega.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `mistral4` (transformer MoE con MLA): 36 capas, 128 expertos, 4 activos + 1 compartido |
| Parámetros totales | 118.972.826.624 (118,97 B) |
| Parámetros activos | ~6,5 B por token |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantización | GGUF mixto IQ3_S nominal (3,501 bpw), tipos por tensor de IQ2_XS a Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dividido en 2 partes, `-00001-of-00002` y `-00002-of-00002`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos con atención multi-cabeza latente (MLA), 36 capas, 128 expertos por capa con 4 activos más uno compartido, y 6,5 B de parámetros activos por token sobre un total de 118,97 B. Acepta texto e imagen y dispone de modos instruct y de razonamiento. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas por Mistral AI.

La versión "heretic" se obtiene mediante ablación direccional con Heretic v1.2.0: se calcula una "dirección de rechazo" por capa y se resta de lo que las capas de atención escriben en el residual stream, con intensidades optimizadas para reducir rechazos con una divergencia pequeña respecto al original. Según la model card, solo difieren 33 proyecciones de salida de atención (`o_proj`) de las capas 3 a 35, cada una con un cambio de rango uno del 2 al 3 % de su norma; los otros 582 tensores del modelo de lenguaje, la torre de visión, el proyector y el tokenizador son idénticos bit a bit a los de Mistral.

La cuantización aplica tres etapas: GSQ refina los códigos enteros de cada tensor dentro de su tipo GGUF contra las entradas reales que ve; RCO elige un tipo por tensor bajo un presupuesto exacto de tamaño minimizando la KL de salida del modelo completo frente al BF16; y un ajuste extremo a extremo posterior ajusta los valores continuos (escalas de bloque, normas y routers) contra la salida del modelo BF16, manteniendo fijos códigos y tipos. La revisión del 5 de noviembre de 2026 re-codifica a Q6_K los 33 tensores de atención modificados por Heretic y repite el ajuste, mejorando la KL media un 6,2 % en WikiText-2, un 7,3 % en código C++ y un 6,5 % en Open-Platypus.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento en modo "thinking" (el modelo base declara modos instruct y reasoning).
- Procesamiento de imágenes en el modelo base; esta cuantización GGUF no incluye la torre de visión, por lo que la entrada es solo texto en la práctica.
- Capacidades de código y matemáticas propias del modelo base Mistral Small 4 (no se detallan métricas en la información disponible).
- Multilingüismo: no se especifica la lista de idiomas soportados.
- Comportamiento "decensurado": responde a 24 de 100 prompts dañinos frente a 95 del modelo original (según la model card), lo que amplía el rango de solicitudes atendidas.
- Compatibilidad con llama.cpp y endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Investigación en seguridad e interpretabilidad: el modelo permite estudiar los efectos de la ablación direccional comparando sus respuestas con las del Mistral Small 4 original, y medir qué rechazos persisten (24 de 100 en la evaluación del autor).
- Red teaming y evaluación de salvaguardas: al ser un modelo con rechazos reducidos, sirve como generador de casos adversarios para probar clasificadores de moderación y filtros de contenido antes de desplegarlos en producción.
- Procesamiento de documentos largos: con 256k tokens de contexto puede ingerir contratos, informes o bases de código completas en una sola pasada, útil para resumen y extracción de entidades en pipelines internos.
- Asistencia a la escritura sin restricciones editoriales: para ficción, guiones o contenido creativo donde los rechazos del modelo original interrumpen el flujo, en entornos controlados y con revisión humana posterior.
- Despliegue local en estación de trabajo: el archivo de 52,07 GB cabe en configuraciones con 64 GB de RAM y GPU consumer de 24 GB haciendo offload parcial, como la máquina del autor (Ryzen 9 5900X, RTX 3090 + RTX 3070 Ti), lo que permite experimentar con un MoE de 119 B sin clúster.
- Análisis de código y generación en pipelines de CI/CD: el modelo base soporta instrucciones de código; esta cuantía permite ejecutarlo en llama.cpp para tareas de revisión o generación de tests, aceptando la pérdida de precisión del IQ3_S mixto.
- Fine-tuning o destilación sobre datos sintéticos: al no tener los rechazos del original, puede generar corpus sintéticos diversos para entrenar modelos más pequeños, siempre con filtrado y auditoría legal posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card solo reporta métricas de fidelidad de la cuantización:

| Métrica (KL media vs. BF16 Heretic) | Primera release | Revisión 2026-11-05 | Cambio |
|---|---|---|---|
| WikiText-2 test | 0,1691 | 0,1586 | −6,2 % |
| Código fuente C++ | 0,0615 | 0,0570 | −7,3 % |
| Open-Platypus (filas held-out) | 0,0945 | 0,0884 | −6,5 % |

| Métrica de rechazo | Original Mistral | Heretic |
|---|---|---|
| Rechazos sobre 100 prompts dañinos | 95 | 24 |

## Requisitos de hardware

- Tamaño del archivo: 52,07 GB (48,49 GiB) en dos partes; el espacio en disco debe cubrir ambos ficheros.
- VRAM estimada: no cabe completo en una GPU consumer de 24 GB. Con offload parcial de capas a RAM y una RTX 3090 o 4090 (24 GB) más 64 GB de RAM del sistema es viable, como demuestra la máquina del autor. Para carga completa en GPU se necesitan dos aceleradores de 48 GB o uno de 80 GB (A100 80GB, H100 80GB).
- GPU recomendadas: A100 80GB o H100 para inferencia completa en VRAM; RTX 4090/3090 con offload para uso personal.
- Despliegue: llama.cpp (formato nativo GGUF, dividido en dos shards que se cargan automáticamente), y servidores compatibles con endpoints. vLLM, TGI u Ollama no se mencionan en la información disponible; Ollama podría importar el GGUF, pero no está confirmado.
- Latencia y throughput: no disponibles. Al ser un MoE con 6,5 B activos, el coste por token es menor que un denso de 119 B, pero el ancho de banda de memoria para cargar expertos condiciona el rendimiento en configuraciones con offload.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización / formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (fajardc GSQ-RCO IQ3_S) | 118,97 B | ~6,5 B | 262.144 | Apache 2.0 | GGUF mixto 3,501 bpw | Decensurado, sin visión en el archivo |
| `darkc0de/Mistral-Small-4-119B-2603-heretic` | 118,97 B | ~6,5 B | 262.144 | Apache 2.0 | safetensors (BF16) | Modelo base de esta cuantización, con visión |
| `mistralai/Mistral-Small-4-119B-2603` | 118,97 B | ~6,5 B | 262.144 | Apache 2.0 | safetensors | Original con rechazos (95/100) y visión |
| `fajardc/Mistral-Small-4-119B-2603-GSQ-RCO-GGUF` | 118,97 B | ~6,5 B | 262.144 | Apache 2.0 | GGUF mixto 3,501 bpw | Misma receta de cuantización sobre el original censurado |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo decensurado: solo rechaza 24 de 100 prompts dañinos frente a 95 del original. Puede generar contenido falso, ofensivo, peligroso o ilegal en la jurisdicción del usuario. No debe exponerse al público ni a menores sin moderación, filtrado y control de acceso.
- Sin visión en este archivo: la torre de visión del modelo base no está incluida en el GGUF, pese a que el pipeline declarado sea `image-text-to-text`.
- Pérdida de precisión por cuantización: aunque la KL media es baja (0,1586 en WikiText-2), el rango de tipos va de IQ2_XS a Q6_K y algunos tensores pueden degradarse más que la media en tareas específicas.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe más allá de lo que herede del modelo base.
- Licencia Apache 2.0 con cláusulas de exención de garantía (secciones 7 y 8): el autor de la cuantización no asume responsabilidad por el uso ni por las salidas.
- Origen no oficial: es una cuantización personal hecha en hardware doméstico, no una release de Mistral AI, IST Austria ni de los autores de Heretic.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de factualidad para esta versión.
- Fragmentación en dos ficheros: hay que cargar el `-00001-of-00002` y llama.cpp localiza el segundo; un manejo incorrecto de rutas provoca fallo de carga.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/fajardc/Mistral-Small-4-119B-2603-heretic-GSQ-RCO-GGUF
- Modelo base de la cuantización: https://huggingface.co/darkc0de/Mistral-Small-4-119B-2603-heretic
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Cuantización GSQ-RCO del original: https://huggingface.co/fajardc/Mistral-Small-4-119B-2603-GSQ-RCO-GGUF
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Releases GSQ-RCO del ISTA DAS Lab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Paper referenciado (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
