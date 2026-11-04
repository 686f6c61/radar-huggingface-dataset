# redthing1/DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw-Quantseekv2

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw-Quantseekv2 es una cuantización de 2,87 bits por peso (bpw) del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario redthing1 bajo licencia MIT. El modelo base es un transformer de tipo mixture-of-experts (MoE) de DeepSeek con capacidad multimodal image-text-to-text, y esta versión emplea el formato EXL3 de la librería exllamav3, orientado a inferencia eficiente en GPUs de consumo y estaciones de trabajo. El repositorio ocupa 206,8 GB en safetensors.

La relevancia de esta ficha no está en el modelo base, sino en el método de cuantización: el autor documenta una calibración basada en historiales completos de razonamiento y uso de herramientas (1,13 M de tokens en siete sesiones), una asignación de bits guiada por la contribución de Fisher de cada experto enrutado y una evaluación de divergencia KL sobre el vocabulario completo (129.280 tokens siguientes) frente a los pesos originales. Según la model card, la v2 reduce la KL entre un 15 % y un 35 % respecto a la v1 en todas las familias de prueba y elimina el 68 % de la divergencia que la v1 dejaba por encima del ruido de fondo.

Se trata, por tanto, de un artefacto de cuantización para desarrolladores que necesitan ejecutar un MoE grande con presupuesto de VRAM ajustado sin degradar tareas de razonamiento largo. La información disponible sobre el modelo base en sí (parámetros totales, contexto nativo, datos de entrenamiento) no está incluida en la model card, por lo que se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) del modelo base DeepSeek-V4.1-Flash-1017; cuantización EXL3 (exllamav3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE; el número de expertos activos no se detalla) |
| Longitud de contexto | no disponible para el modelo base; la calibración usa historiales de hasta 1,13 M de tokens agregados y se mencionan pruebas con pasos tardíos condicionados a contexto previo |
| Tipos de cuantizacion | EXL3 a 2,87 bpw globales; matrices enrutadas entre 2 y 6 bits (46.080 matrices), proyecciones de atención y de expertos compartidos entre 5 y 8 bits, cabeza de salida a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, librería exllamav3) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un MoE multimodal (pipeline image-text-to-text) de DeepSeek. La model card no describe la arquitectura del modelo base ni sus datos de entrenamiento; toda la información técnica disponible corresponde al proceso de cuantización. Este proceso fija cada matriz a partir de estadísticas de entrada capturadas dentro del propio cómputo del modelo original, sobre siete historiales completos de razonamiento y uso de herramientas que suman 1,13 M de tokens, preservando contexto largo para que un paso tardío de depuración quede condicionado al trabajo anterior.

La asignación de bits se realiza en tres fases. Primero, un barrido de sensibilidad del modelo completo, el error realizado de cada experto a cada tasa y su tráfico de pesos generan una asignación inicial. Después, cada experto se re-precio por su contribución de Fisher: se ejecuta el modelo original en forward y backward sobre los historiales (incluido el redondeo FP8 de activaciones) y se combina el gradiente de salida en cada experto enrutado con su error almacenado para estimar la KL que provoca ese error. El autor documenta que, dentro de una capa, el mismo error cuesta 10 veces más (mediana) en un experto sensible que en uno insensible, y hasta 119 veces, con correlación mediana de 0,75 entre familias no relacionadas. Finalmente, se eligen tasas de 2, 2,5, 3, 3,5, 4, 5 y 6 bits por matriz, manteniendo los bytes almacenados y el tráfico de pesos por capa. El resultado se valida reconstruyendo los candidatos desde los códigos y escalas guardados y ejecutándolos en el modelo completo. La cabeza de salida a 8 bits aporta una reducción adicional del 7 % de divergencia, y el drafter DSpark es el de la v1.

## Capacidades

- Generación de texto y razonamiento de varios pasos, incluido modo de pensamiento prolongado: la model card reporta la resolución de seis tareas algorítmicas largas (Myers diff, dominance frontiers, minimum mean cycles, dos semillas cada una) con 26.000–55.000 tokens generados por ejecución y hasta un 3,1 % de 32-gramas repetidos.
- Uso de herramientas (tool calling) y razonamiento agéntico: los historiales de calibración son de razonamiento y uso de herramientas, y las familias de evaluación incluyen selección entre candidatos y auditoría.
- Capacidad multimodal image-text-to-text, heredada del pipeline del modelo base.
- Razonamiento sobre código y algoritmos: las familias de evaluación (resolvedor SPD disperso, SAT incremental, asignación de registros, DAG incremental, link-cut forest, skiplist por épocas, loop fusion, construcción SSA) son tareas de compiladores y algoritmia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Fidelidad de cuantización verificable: divergencia KL medida sobre el vocabulario completo (129.280 tokens siguientes) frente a los pesos originales, con suelo de ruido estimado en 0,007–0,011 KL.

## Casos de uso

- Razonamiento algorítmico de formato largo: el modelo puede abordar tareas de depuración y síntesis de algoritmos con decenas de miles de tokens de pensamiento, como demuestran las seis tareas largas resueltas con todas las pruebas superadas (201/201, 121/121, 151/151); es adecuado cuando se necesita un MoE grande en hardware limitado.
- Agentes con uso de herramientas en producción: al estar calibrado sobre historiales reales de razonamiento y tool use, conserva mejor el comportamiento multi-turno que cuantizaciones evaluadas solo con perplejidad o con el modo de pensamiento desactivado.
- Asistencia a la programación en pipelines de CI/CD: puede integrarse en flujos de revisión de parches y generación de código, con la ventaja de que el formato EXL3 permite servirlo en GPUs de una sola máquina.
- Análisis de documentos e imágenes: al conservar el pipeline image-text-to-text del modelo base, sirve para tareas que combinan texto e imagen, aunque la calidad multimodal tras la cuantización no está evaluada en la información disponible.
- Evaluación comparativa de cuantizaciones: útil como referencia para investigadores que quieran reproducir la metodología de KL sobre historiales completos y comparar con las versiones de LibertAI, sudoingx, EAQ o jayleaton citadas en la model card.
- Despliegue en estaciones de trabajo con presupuesto de VRAM ajustado: el presupuesto de 2,87 bpw y los 206,8 GB del repositorio lo sitúan en el rango de servidores multi-GPU o estaciones con memoria unificada grande, no en GPUs de consumo individuales.
- Investigación sobre asignación de bits por sensibilidad: el método de Fisher por experto es replicable y sirve de base para estudiar el impacto diferencial de errores en expertos enrutados.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Publica divergencia KL frente al modelo original sobre el vocabulario completo, medida en los pesos finales y sobre historiales completos de razonamiento y uso de herramientas:

| Familia | Rol | v1 | v2 | Cambio |
|---|---|---:|---:|---|
| Sparse SPD solver | selección | 0,01520 | 0,00989 | −34,9 % |
| Incremental SAT | selección | 0,01408 | 0,00985 | −30,1 % |
| Register allocation | selección | 0,01407 | 0,01192 | −15,2 % |
| Incremental DAG | selección | 0,01305 | 0,01113 | −14,7 % |
| Link-cut forest | auditoría | 0,01630 | 0,01162 | −28,7 % |
| Epoch skiplist | auditoría | 0,01486 | 0,01158 | −22,1 % |
| Loop fusion | auditoría | 0,01296 | 0,01094 | −15,6 % |
| SSA construction | auditoría | 0,01284 | 0,01090 | −15,1 % |

El suelo de ruido se estima en 0,007–0,011 KL (cambiar un peso del original en una unidad en el último lugar). La v2 elimina el 68 % de la divergencia que la v1 dejaba por encima de ese suelo (60–74 % por familia). En tareas largas con pensamiento máximo, la v2 resuelve las seis tareas algorítmicas con todas las pruebas superadas. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 206,8 GB en safetensors a 2,87 bpw; la inferencia EXL3 requiere cargar los pesos completos más caché KV, por lo que el requisito práctico ronda los 210–230 GB de memoria de GPU o memoria unificada, según contexto y lote.
- GPU recomendadas: no cabe en una RTX 4090 (24 GB) ni en GPUs de consumo individuales; requiere configuraciones multi-GPU (varias A100/H100) o estaciones con memoria unificada grande.
- Cabe en consumer GPU: no.
- Opciones de despliegue: exllamav3 (librería nativa del formato); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato EXL3 es específico de exllamav3.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: el autor cita un scorer previo ejecutado en DGX Spark, lo que sugiere que el ecosistema de referencia incluye estaciones con memoria unificada, pero no se aportan cifras de rendimiento.

## Comparativa con modelos similares

Comparación con otras cuantizaciones del mismo modelo base, según la model card:

| Release | Bits por peso | Evaluación | Limitación señalada por el autor |
|---|---|---|---|
| Quantseek v2 (este) | 2,87 | KL sobre vocabulario completo en historiales largos de razonamiento y tool use | Ninguna documentada por el autor |
| LibertAI 2.9 | 2,9 | Perplejidad en 32 extractos de 2.048 tokens; benchmark agéntico sobre pesos originales | No mide razonamiento largo en la cuantización |
| sudoingx 2.8 | 2,8 | HumanEval+, MBPP+, IFEval con pensamiento desactivado y tope de 2.048 tokens | Excluye razonamiento |
| EAQ v1 2.9 | 2,9 | Ocho sesiones sintéticas de hasta 31,2 K tokens, pensamiento desactivado | Falla por encima de 32.768 tokens y omite cuantización dinámica FP8 de activaciones |
| EAQ v1.1 2.9 | 2,9 | Recuperación perfecta del indexer sobre estados ocultos de origen; ~0,73 sobre los propios | La cuantización opera sobre sus propios estados |
| jayleaton 2.8 | 2,8 | 356 ítems con pensamiento activado en packs 1017 y septiembre | Todos los intervalos incluyen cero; sin ranking |

## Limitaciones y advertencias

- No hay benchmarks estándar publicados (MMLU, HumanEval, GSM8K) para esta cuantización; la evidencia de calidad se limita a KL y a seis tareas algorítmicas.
- El modelo base no está documentado en la información disponible: se desconocen parámetros totales, contexto nativo, composición del dataset y si hubo RLHF/DPO.
- La evaluación de fidelidad se realiza contra el modelo original con redondeo FP8 de activaciones; otras cuantizaciones comparadas usan referencias numéricas distintas, por lo que las cifras de KL no son directamente comparables entre releases.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser una cuantización de 2,87 bpw, existe degradación residual sobre el suelo de ruido, aunque el autor la reduce un 68 % respecto a la v1.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Licencia MIT: permite uso comercial, pero la licencia del modelo base debe verificarse por separado, ya que la model card solo declara MIT para esta cuantización.
- Compatibilidad limitada: el formato EXL3 solo se ejecuta con exllamav3, lo que restringe las opciones de despliegue frente a GGUF o safetensors convencionales.
- El drafter DSpark es el de la v1, no el de la v2.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/redthing1/DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw-Quantseekv2
- Versión v1: https://huggingface.co/redthing1/DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización LibertAI 2.9 bpw: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Cuantización sudoingx 2.8 bpw: https://huggingface.co/sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw
- Cuantización EAQ v1 2.9 bpw: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- Cuantización EAQ v1.1 2.9 bpw: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1.1-2.9-bpw
- Cuantización jayleaton 2.8 bpw: https://huggingface.co/jayleaton/DeepSeek-V4.1-Flash-1017-EXL3-2.8-bpw
- Scorer DGX Spark (p4_kld.py): https://github.com/sudoingX/dgx-spark-deepseek-v41/blob/379edd6aec5b3c41569c45b61745dd034d3df574/scripts/quantize/p4_kld.py
