# BachDaThan/Qwen2.5-Coder-7B-Vietnamese-Agent-FINAL-LoRA-GGUF

## Resumen

Se trata de una adaptación al vietnamita del modelo Qwen2.5-Coder-7B-Instruct, publicada por el usuario BachDaThan en formato GGUF. El repositorio no contiene un entrenamiento desde cero, sino el resultado de fusionar (merge) un adaptador LoRA desarrollado por khoin68 sobre el modelo base de Qwen y de cuantizar después los pesos a GGUF mediante llama.cpp. El objetivo declarado es disponer de un asistente conversacional en vietnamita orientado a tareas de agente (instrucciones, código y diálogo multi-turno) que pueda ejecutarse en hardware de consumo.

Arquitectónicamente es un transformer decoder-only de la familia Qwen2, con 7.615.616.512 parámetros, 28 capas, tamaño oculto de 3.584, 28 cabezas de atención y 4 cabezas KV (atención con consultas agrupadas, GQA). Mantiene la ventana de contexto de 32.768 tokens del modelo original y un vocabulario de 152.064 entradas. Los pesos originales están en bfloat16, pero este repositorio solo distribuye cuatro cuantizaciones GGUF (Q4_K_M, Q4_K_S, Q3_K_M y Q3_K_S).

Su relevancia es limitada y muy específica: cubre el nicho de asistentes en vietnamita para entornos locales o sin conexión, donde el ecosistema de modelos abiertos es mucho más reducido que en inglés. No obstante, el repositorio no aporta benchmarks, no documenta el proceso de entrenamiento del LoRA y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que no existe validación independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (28 capas, hidden size 3584, 28 cabezas de atención, 4 cabezas KV con GQA) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF: Q4_K_M (4,36 GB), Q4_K_S (4,15 GB), Q3_K_M (3,55 GB), Q3_K_S (3,25 GB) |
| Idiomas soportados | Vietnamita (vi) e inglés (en) |
| Licencia | apache-2.0 (el autor advierte en la model card que la licencia del repo se determina tras verificar las licencias de origen y que no se autoadjudica Apache-2.0) |
| Formato de pesos | GGUF (llama.cpp); los pesos en bfloat16 no se distribuyen en este repositorio |
| Vocabulario | 152.064 tokens |
| Precision original | bfloat16 |
| Plantilla de chat | ChatML de Qwen (`<\|im_start\|>` / `<\|im_end\|>`) |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Adaptador LoRA | khoin68/Qwen2.5-Coder-7B-Vietnamese-Agent-FINAL-LoRA |
| Tamano del repositorio | 16,4 GB |
| Libreria declarada | llama.cpp |
| Fecha de publicacion (metadatos HF) | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-7B-Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE para la codificación posicional y atención con consultas agrupadas (28 cabezas de consulta frente a 4 cabezas de clave/valor), lo que reduce el coste de la caché KV en inferencia. El modelo resultante no introduce cambios estructurales: la modificación consiste en un ajuste fino con LoRA posteriormente fusionado en los pesos base y en la conversión a cuantizaciones GGUF K-quant.

La información disponible no especifica el número de tokens de entrenamiento del adaptador, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO o SFT con datos sintéticos. El nombre del adaptador ("Vietnamese-Agent-FINAL") sugiere un ajuste orientado a comportamiento de agente e instrucciones en vietnamita, pero se trata de una inferencia a partir del nombre, no de un dato documentado. Del modelo base sí consta documentación pública de Qwen (entrenamiento sobre un corpus de código y texto de gran volumen, con soporte nativo de instrucciones y de función calling en la variante Instruct), aunque esas cifras no se han podido verificar en las fuentes consultadas para esta ficha. La cuantización a GGUF fue realizada por el propio autor del repositorio.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés, con plantilla ChatML y soporte de mensajes de sistema, usuario y asistente.
- Generación y explicación de código, heredada del modelo base Qwen2.5-Coder-7B-Instruct, ahora con capacidad de responder e instruir en vietnamita.
- Comportamiento de instrucciones orientado a tareas de agente (instrucciones multi-paso y respuestas estructuradas), según la denominación del adaptador LoRA.
- Diálogo multi-turno con ventana de 32.768 tokens, lo que permite mantener conversaciones largas o incluir documentación extensa en el contexto.
- Capacidades bilingües vi/en: traducción, resumen y reformulación entre ambos idiomas dentro del mismo contexto.
- No hay evidencia documentada en la model card de soporte de tool calling, function calling, modo de razonamiento explícito, visión ni audio. El modelo base sí soporta function calling, pero no se confirma que el ajuste LoRA lo conserve.
- No se documentan capacidades multimodales de ningún tipo.

## Casos de uso

- Atención al cliente en vietnamita: el modelo puede mantener conversaciones multi-turno con historiales largos gracias a los 32.768 tokens de contexto, integrándose en un sistema RAG que inyecte políticas de empresa y fichas de producto antes de generar la respuesta.
- Asistencia a desarrollo de software en equipos vietnamitas: generación de fragmentos de código, explicaciones de errores y comentarios de documentación en vietnamita, aprovechando la base Qwen2.5-Coder y evitando el cambio de idioma en la cadena de trabajo.
- Migración y traducción de documentación técnica: conversión de guías, manuales y mensajes de error entre inglés y vietnamita conservando terminología técnica, con el contexto completo del documento cargado en la ventana del modelo.
- Despliegue en local para datos sensibles: al distribuirse en GGUF y ejecutarse con llama.cpp u Ollama, puede correr en estaciones de trabajo sin conexión a internet, lo que resulta adecuado para entornos con requisitos de soberanía del dato o de privacidad.
- Prototipado de agentes conversacionales en vietnamita: punto de partida barato para experimentar con flujos de agente (planificación, llamadas a herramientas, resúmenes intermedios) antes de invertir en modelos mayores o en APIs propietarias, con la advertencia de que el soporte de tool calling no está confirmado.
- Educación y tutoría: generación de explicaciones paso a paso de conceptos de programación o matemáticas en vietnamita para plataformas de aprendizaje, con la salvedad de que no hay evaluación publicada de su fiabilidad en razonamiento.
- Procesamiento de registros y tickets internos: resumen y clasificación de incidencias escritas en vietnamita dentro de pipelines automatizados, ejecutando el modelo en modo batch sobre GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones específicas en vietnamita, y tampoco se han encontrado resultados de terceros en la búsqueda web realizada (cuyos resultados no guardaban relación con el modelo). Cualquier cifra que se cite del modelo base Qwen2.5-Coder-7B-Instruct no es extrapolable a este ajuste LoRA sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada según el autor (incluye pesos y margen de ejecución): Q4_K_M unos 6,4 GB; Q4_K_S unos 6,2 GB; Q3_K_M unos 5,5 GB; Q3_K_S unos 5,3 GB.
- Caché KV adicional (estimación a partir de la configuración: 2 × 28 capas × 4 cabezas KV × 128 dimensiones × 2 bytes = 56 KiB por token): unos 1,75 GiB en fp16 con los 32.768 tokens completos, o unos 0,88 GiB con caché cuantizada a q8_0. A 8.192 tokens el coste baja a unos 448 MiB en fp16.
- GPU de consumo: cabe en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) con Q4_K_M si se limita el contexto a 8.192 tokens; en tarjetas de 6 GB (RTX 2060, GTX 1660 Ti) conviene Q3_K_S o Q3_K_M con contexto reducido.
- GPU de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080): Q4_K_M con contexto amplio (16.384-32.768 tokens) sin necesidad de descargar capas a CPU.
- GPU profesionales o de centro de datos (A100 40/80 GB, H100, L40S): el modelo ocupa una fracción mínima de la VRAM y quedan recursos libres para lotes grandes, caché KV extensa o despliegue concurrente.
- Opciones de despliegue: llama.cpp y llama-cpp-python, llama-server, Ollama (la model card incluye un Modelfile de ejemplo), LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI soportan GGUF de forma parcial o experimental; para esos backends sería más adecuado partir del modelo base en bfloat16.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Vietnamese-Agent-FINAL-LoRA-GGUF (este modelo) | 7,6 B | 32.768 | vi, en | apache-2.0 (con matiz del autor) | GGUF Q3/Q4 |
| Qwen2.5-Coder-7B-Instruct (Qwen) | 7,6 B | 32.768 (ampliable con YaRN) | multilingue, con foco en código | apache-2.0 | safetensors, AWQ, GPTQ, GGUF |
| Qwen2.5-7B-Instruct (Qwen) | 7,6 B | 32.768 (ampliable con YaRN) | multilingue, incluido vietnamita | apache-2.0 | safetensors, AWQ, GPTQ, GGUF |
| Vistral-7B-Chat (VietAI) | 7 B | 8.192 (heredado de Mistral-7B-v0.1) | vi, en | apache-2.0 | safetensors, GGUF (versiones comunitarias) |

Nota: los datos de los modelos comparativos proceden de documentación pública general y no han podido verificarse con las fuentes de esta búsqueda; los valores de contexto y licencia deben confirmarse en sus respectivas model cards antes de tomar decisiones de producción. No hay benchmarks comparativos publicados para la variante vietnamita objeto de esta ficha.

## Limitaciones y advertencias

- La propia model card advierte de que el modelo puede generar información falsa (alucinaciones) y de que sus salidas no deben sustituir asesoramiento profesional en ámbitos críticos.
- No existe ninguna evaluación publicada de este ajuste: 0 descargas y 0 "likes" en HuggingFace implican ausencia total de validación por parte de la comunidad.
- La cuantización introduce pérdida de calidad respecto a bfloat16, especialmente perceptible en Q3_K_S y Q3_K_M. Para tareas de código o razonamiento conviene Q4_K_M o superior.
- El ajuste LoRA sobre datos en vietnamita puede degradar el rendimiento en inglés o en tareas de código no representadas en el corpus de ajuste; no hay datos que cuantifiquen esa posible regresión.
- La ventana de contexto efectiva útil suele ser inferior a los 32.768 tokens nominales; no se ha publicado ninguna prueba de recuperación de información en contexto largo.
- Discrepancia de licencia: los metadatos de HuggingFace indican apache-2.0, pero el autor declara explícitamente que la licencia se determina tras verificar las licencias de origen y que no se autoadjudica Apache-2.0. Conviene confirmar la licencia aplicable antes de un uso comercial.
- No hay información sobre el dataset de ajuste, por lo que se desconoce si contiene sesgos, datos personales o material con derechos de autor.
- No hay documentación sobre alineación de seguridad, filtros de contenido ni comportamiento ante peticiones dañinas.
- El soporte de function calling y de flujos de agente no está confirmado para este ajuste, pese a que el modelo base lo soporta; verificarlo con pruebas propias antes de integrarlo en un agente.
- El modelo solo se distribuye en GGUF; no hay versión en safetensors del ajuste fusionado, lo que dificulta el uso con backends que no aceptan GGUF de forma nativa y complica un ajuste posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BachDaThan/Qwen2.5-Coder-7B-Vietnamese-Agent-FINAL-LoRA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Adaptador LoRA de origen: https://huggingface.co/khoin68/Qwen2.5-Coder-7B-Vietnamese-Agent-FINAL-LoRA
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Documentación y blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo, su adaptador LoRA o el autor; los enlaces anteriores proceden de la información del repositorio y de fuentes públicas conocidas, no de los resultados de esa búsqueda.
