# Bostonouble/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es una versión "abliterada" (sin alineamiento de rechazo) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario Bostonouble a partir del trabajo de cuantización y desbloqueo de HauhauCS. Se distribuye exclusivamente en formato GGUF, con el objetivo declarado de conservar "el 100 % de las capacidades del modelo original" eliminando únicamente los rechazos, y el autor afirma 0/465 rechazos en su evaluación interna (dato no verificable de forma independiente).

Arquitectónicamente es un transformer híbrido con mezcla de expertos (MoE) de 34.660.610.688 parámetros totales (~35B) y aproximadamente 3B activos por token, con 256 expertos y 8 enrutados por paso, 40 capas y una combinación 3:1 de atención lineal y atención softmax completa. Su ventana de contexto nativa es de 262K tokens y procesa de forma nativa texto, imagen y vídeo, lo que lo sitúa en la categoría de modelos multimodal de gran contexto con coste de inferencia propio de un modelo de ~3B.

La relevancia de esta ficha es doble: por un lado documenta una variante sin censura de un modelo reciente, con todas las implicaciones legales y de seguridad que ello conlleva; por otro, el paquete de cuantizaciones incluye los formatos propietarios "K_P" del autor, generados con importance matrix y orientados a preservar calidad sobre pesos abliterados, con tamaños que van de 11 GB (IQ2_M) a 44 GB (Q8_K_P), lo que determina qué hardware puede ejecutarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE); atención lineal + atención softmax completa en ratio 3:1; 40 capas |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por paso forward (256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262K tokens nativos; el autor recomienda mantener al menos 128K para preservar las capacidades de razonamiento |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M; proyector multimodal mmproj en f16 |
| Idiomas soportados | en, zh, multilingual (no se detalla la lista completa de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones K_P, K_M, IQ y Q8_0) + mmproj f16 para visión; los pesos originales en safetensors están en el modelo base Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer MoE de 40 capas con 256 expertos, de los cuales 8 se enrutan por token, lo que da ~3B parámetros activos sobre un total de ~35B. La innovación estructural principal es la hibridación de atención: tres capas de atención lineal por cada capa de atención softmax completa, lo que reduce el coste del contexto largo y hace viable una ventana nativa de 262K tokens. El modelo es nativamente multimodal (texto, imagen y vídeo); la parte de visión se distribuye en este repositorio como un fichero `mmproj` independiente en f16 (899 MB) que debe cargarse junto al GGUF principal.

Sobre el proceso de entrenamiento no se aporta información en la model card: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento en el modelo base. Lo que sí se documenta es la intervención de HauhauCS: una modificación del tipo *abliteration* sobre los pesos originales que elimina los rechazos sin reentrenar, y de la que el autor afirma que no altera datasets ni capacidades. Todas las cuantizaciones se generaron con importance matrix (imatrix) específica para pesos abliterados. Los cuantos K_P ("Perfect") son un perfil propietario del autor que, según su descripción, preserva selectivamente la calidad en las capas más sensibles y equivale a subir uno o dos niveles de cuantización con solo un 5-15 % más de tamaño de fichero; son compatibles con llama.cpp, LM Studio y cualquier runtime GGUF sin compilaciones especiales.

## Capacidades

- Generación de texto conversacional multi-turno con hasta 262K tokens de contexto nativo.
- Razonamiento en modo *thinking* (activado por defecto) y modo no-*thinking*, con juegos de parámetros de muestreo distintos recomendados por los autores de Qwen para cada uno.
- Comprensión de imágenes y vídeo de forma nativa (pipeline `image-text-to-text`), requiriendo el fichero `mmproj` para habilitar la visión.
- Capacidades multilingües: inglés, chino y soporte multilingüe genérico declarado en las etiquetas del modelo.
- Generación de código y tareas de precisión, con ajustes de muestreo recomendados específicos (`temperature=0.6`, `presence_penalty=0`).
- Funcionamiento sin rechazos: la variante Aggressive está "completamente desbloqueada" y no rechaza consignas; puede añadir avisos breves heredados del entrenamiento del modelo base, pero genera el contenido completo.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas) y con el ecosistema GGUF (llama.cpp, LM Studio).
- No se documenta en la información disponible soporte explícito de *tool calling* ni de flujos de agentes multi-paso; tampoco se detallan capacidades de audio.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como contrapunto "sin censura" frente al base para estudiar qué comportamientos cambian tras la abliteración, comparando respuestas con el Qwen3.6-35B-A3B original sobre el mismo conjunto de prompts.
- Procesamiento de documentos largos con imágenes: informes escaneados, contratos con anexos gráficos o expedientes técnicos de hasta 262K tokens, aprovechando la ventana nativa y la entrada multimodal para extraer y resumir información de texto y figuras en una sola pasada.
- Análisis de vídeo y contenido audiovisual: descripción, indexación y extracción de información de clips, adecuado por la entrada nativa de vídeo y por el coste de inferencia de un MoE de ~3B activos.
- Asistente de código en local: con los parámetros recomendados para tareas de precisión (`temperature=0.6`, `top_p=0.95`, `top_k=20`) y la cuantización Q5_K_P o Q6_K_P, se puede desplegar en una estación de trabajo con una sola GPU de 48 GB para autocompletado, revisión y refactorización sin enviar código a terceros.
- Generación de contenido creativo sin restricciones temáticas: narrativa, guiones o material de ficción que los modelos alineados suelen rechazar, ejecutado en infraestructura propia y con revisión editorial humana posterior.
- Despliegue air-gapped en entornos con requisitos de soberanía del dato: al ser GGUF y licencia apache-2.0, puede ejecutarse en servidores sin conexión con llama.cpp, manteniendo todo el contenido dentro del perímetro de la organización.
- Evaluación comparativa de cuantizaciones: los múltiples perfiles publicados (Q2 a Q8, incluyendo los K_P) permiten medir la degradación de calidad y el ahorro de memoria en un mismo modelo multimodal, útil para calibrar pipelines de cuantización propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta la afirmación del autor de "0/465 rechazos" en su propia evaluación de censura, sin detallar el conjunto de prompts, el protocolo ni comparaciones con el modelo base. Tampoco se ofrecen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del fichero GGUF más overhead de contexto y caché KV; estimación, no publicada por el autor):
  - IQ2_M (11 GB) → ~13 GB.
  - IQ3_M (15 GB) / Q2_K_P (15 GB) → ~17-18 GB.
  - IQ4_XS (19 GB) / Q3_K_P (19 GB) → ~21-22 GB.
  - Q4_K_M (21 GB) → ~24 GB.
  - IQ4_NL (20 GB) y Q4_K_P (23 GB) → ~22-26 GB.
  - Q5_K_P (28 GB) → ~31 GB.
  - Q6_K_P (31 GB) → ~34 GB.
  - Q8_K_P (44 GB) → ~46-48 GB.
  - Añadir ~0,9 GB del `mmproj` f16 si se activa la visión.
- GPU recomendadas: A100 80 GB o H100 para Q8_K_P con contexto largo; A100 40 GB, L40S 48 GB o RTX 6000 Ada para Q5_K_P/Q6_K_P; RTX 4090 24 GB únicamente para cuantizaciones IQ4/Q4_K_M con contexto reducido.
- ¿Cabe en GPU de consumo? Sí, parcialmente: en una RTX 4090 de 24 GB entran IQ4_XS, IQ4_NL y Q4_K_M, pero con ventanas de contexto muy por debajo de los 262K nativos. Para contexto largo es necesario recurrir a offload de expertos a RAM del sistema (el modelo tiene ~3B parámetros activos, lo que hace viable este modo) o a GPU de 48 GB o más.
- Opciones de despliegue: llama.cpp (el autor indica usar el flag `--jinja` para el template de chat), LM Studio, y cualquier runtime compatible con GGUF. No se documenta compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles (no publicados). Como referencia estructural, al activar solo ~3B parámetros por token, la decodificación es más rápida que la de un modelo denso de 35B en configuraciones con offload parcial, pero no hay cifras medidas en la información proporcionada.
- Nota de compatibilidad: el widget de "Hardware Compatibility" de HuggingFace no reconoce los cuantos K_P y puede mostrar menos ficheros de los que existen; hay que consultar "Files and versions". Los K_P pueden aparecer como "?" en la columna de cuantización de LM Studio; es un problema de visualización, no de carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (este) | 34,66B totales / ~3B activos | 262K | Texto, imagen, vídeo | apache-2.0 | GGUF con 15 cuantizaciones + mmproj |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66B totales / ~3B activos | 262K | Texto, imagen, vídeo | apache-2.0 | Pesos safetensors; alineado con rechazos |
| Variante "Balanced" de HauhauCS | 34,66B totales / ~3B activos | 262K | Texto, imagen, vídeo | apache-2.0 | Anunciada en la model card como futura, no disponible en el momento de la consulta |

No se dispone de datos de benchmarks ni de comparaciones con otras familias de modelos (Llama, Mistral, DeepSeek u otras) en la información proporcionada, por lo que no es posible establecer comparaciones de rendimiento objetivas.

## Limitaciones y advertencias

- Ausencia total de alineamiento de seguridad: la variante Aggressive está diseñada explícitamente para no rechazar ninguna petición. Puede generar contenido ilegal, peligroso o gravemente dañino si se le solicita, y no debe exponerse a usuarios finales sin filtros externos.
- Responsabilidad legal: aunque la licencia es apache-2.0 y permite uso comercial, el uso del modelo en la UE está sujeto al AI Act y a la normativa sectorial aplicable; el desarrollador que lo despliega asume la responsabilidad del contenido generado.
- Riesgo de alucinación: no cuantificado en la información disponible. Los procesos de abliteración y de cuantización agresiva (IQ2_M, Q2_K_P) tienden a degradar la fidelidad factual; no hay evaluaciones publicadas que midan ese efecto en esta variante.
- Degradación por cuantización: los cuantos por debajo de 4 bits (IQ3_M, Q2_K_P, IQ2_M) implican pérdida de calidad no medida; el autor no publica comparativas de perplejidad entre perfiles.
- Sesgos: no documentados. Al heredar los datos del Qwen3.6-35B-A3B y eliminar los rechazos, es previsible que los sesgos del modelo base se expresen sin el amortiguamiento que introducía el alineamiento, pero no hay análisis disponible.
- Idiomas: solo se declaran inglés, chino y "multilingual" genérico; no hay garantías documentadas de calidad en castellano.
- Contexto: el autor advierte que por debajo de 128K tokens se degradan las capacidades de razonamiento del modo *thinking*.
- Madurez del artefacto: el repositorio tiene 0 descargas y 0 likes y fue creado el 19 de octubre de 2026, sin validación de la comunidad. La model card está truncada ("Works with llama.cp…"), por lo que la documentación de despliegue está incompleta.
- Inconsistencia de autoría: el repositorio lo publica el usuario Bostonouble, mientras que los enlaces de descarga de la model card apuntan al espacio de HauhauCS; conviene verificar el origen de los ficheros antes de usarlos en producción.
- Los cuantos K_P son un formato propietario del autor: funcionan en llama.cpp y LM Studio, pero herramientas de terceros pueden no reconocerlos correctamente (el propio widget de HuggingFace falla al detectarlos).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Bostonouble/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Espacio del autor del desbloqueo y las cuantizaciones (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Fichero Q8_K_P: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Fichero Q6_K_P: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q6_K_P.gguf
- Fichero Q5_K_P: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q5_K_P.gguf
- Fichero Q4_K_P: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf
- Fichero Q4_K_M: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf
- Fichero IQ4_NL: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-IQ4_NL.gguf
- Fichero IQ4_XS: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-IQ4_XS.gguf
- Fichero Q3_K_P: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q3_K_P.gguf
- Fichero IQ3_M: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-IQ3_M.gguf
- Fichero Q2_K_P: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Q2_K_P.gguf
- Fichero IQ2_M: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-IQ2_M.gguf
- Proyector multimodal (mmproj f16): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/mmproj-Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-f16.gguf
- Discord del autor: https://discord.gg/SZ5vacTXYf
