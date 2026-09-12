# hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim

## Resumen

Qing-Sec-20B (青卫·安全大模型) es un modelo de lenguaje especializado en ciberseguridad desarrollado por la empresa china Xinjiang Huancheng Network Security Technology (hcnote). Parte de Qwen3.8-27B y aplica una poda estructural a nivel de grupo que reduce el modelo de 27,78B a 19,29B parámetros (-30,5%), seguida de un ajuste fino LoRA supervisado con corpus de seguridad y código procedentes de su propia plataforma.

La relevancia técnica del modelo está en dos frentes: por un lado, demuestra que una poda profunda guiada por influencia de bloque sobre una arquitectura de atención híbrida (3 capas de GatedDeltaNet lineal + 1 capa de atención completa GQA) puede recuperar entre el 74% y el 93% de la capacidad en conocimiento de seguridad medido por benchmarks, con mejores valores de perplejidad que el propio modelo original en corpus de seguridad y código. Por otro, expone con inusual detalle los problemas de ingeniería encontrados (corrupción silenciosa en copias P2P entre GPU, explosión de memoria por un vocabulario de 248.320 tokens, bucles de repetición en decodificación greedy).

Es un modelo de nicho, con cero rechazos declarados en dominios de seguridad ofensiva y defensiva, pensado para pruebas autorizadas, CTF, análisis SOC y respuesta a incidentes. Su licencia, idiomas soportados y pipeline no están declarados en la información disponible, y el propio autor advierte de que su capacidad de generación en tareas de razonamiento largo está muy por debajo del modelo base que lo origina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención mixta: 3 capas de GatedDeltaNet (atención lineal) alternadas con 1 capa de GQA (atención completa), ritmo full_attention_interval=4; 64 capas en el original, 44 capas tras la poda |
| Parametros totales | 19.285.624.544 (19,29B) |
| Longitud de contexto | no disponible (el entrenamiento se realizó con ventana de 8192 tokens en modo head+tail) |
| Tipos de cuantizacion | bf16 en safetensors; familia GGUF con F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M e IQ4_XS; torchao int8_weight_only; NF4 |
| Idiomas soportados | no disponible (no se declara lista de idiomas; los benchmarks incluyen evaluación en chino mediante CEval) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) en el repositorio principal; repositorios separados en GGUF e INT8/NF4 |
| Modelo base | Qwen/Qwen3.8-27B (Qwen3.8, 27,78B, 64 capas, torre de visión retirada) |
| Tag de arquitectura en HuggingFace | qwen3_5_text |
| Tamano del repositorio | 38,6 GB |
| Fecha de creacion (metadatos HF) | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido en el que cada grupo de cuatro capas contiene tres capas de GatedDeltaNet (atención lineal con estado recurrente) y una capa de atención completa con GQA. La poda se aplicó por grupos completos para preservar ese ritmo estructural: se eliminaron los grupos 3, 4, 5, 7 y 9, pasando de 64 a 44 capas. La selección de grupos combinó un cribado previo mediante Block-Influence de ShortGPT con una validación de perplejidad ponderada probando la eliminación de cada grupo en dos ventanas (4096 tokens para texto corto y 16384 para texto largo) sobre un conjunto de calibración del dominio de seguridad. También se retiró la torre de visión, lo que supone -0,92B parámetros adicionales y convierte el modelo en texto puro.

El ajuste posterior fue un LoRA con rank 128 y alpha 256, dropout 0,05, aplicado a todas las capas lineales, con 642M parámetros entrenables (3,22% del total). Se entrenaron 2 épocas y 926 pasos en bf16 con paralelismo de pipeline en dos GPU y checkpointing de gradientes, con learning rate 1e-4, annealing coseno y warmup del 3%. El corpus se compone de 7.406 conversaciones multiturno y aproximadamente 39,6 millones de tokens, con una mezcla de 46% seguridad ofensiva/defensiva (informes de red team, resolución de CTF, análisis de vulnerabilidades, respuesta a incidentes), 44% código de alta calidad y 10% conversación general. Los datos se recogieron con consentimiento explícito y pasaron por un pipeline de anonimización con sustitución de nombres de usuario, enmascarado de IP, generalización de dominios y eliminación de credenciales e información personal mediante regex más NER. La pérdida de evaluación descendió de 1,164 a 1,051 de forma monótona en nueve puntos de control.

Entre las innovaciones de ingeniería documentadas destacan una entropía cruzada por bloques de 2048 tokens para evitar la explosión de memoria del vocabulario de 248.320 entradas sobre secuencias de 8192, y un monkey-patch de las copias entre tarjetas para enrutarlas por CPU al detectar corrupción silenciosa en transferencias P2P por bus SYS.

## Capacidades

- Generación de texto técnico especializado en seguridad: análisis de vulnerabilidades, redacción de informes de red team, respuesta a incidentes y hardening de sistemas.
- Conocimiento de ciberseguridad medido con benchmarks específicos del dominio (SecQA 96,0; SecEval 74,9; CyberMetric-500 84,4; CTI-MCQ 64,6 en precisión).
- Generación de código multilingüe, con perplejidad de 2,092 en corpus de código, inferior a la del modelo base de 27B.
- Formato de agente y tool calling: el corpus de entrenamiento está mayoritariamente compuesto por trazas de tipo tool_call, por lo que el modelo tiende a proponer el siguiente comando o paso de herramienta.
- Modo de no rechazo en dominio de seguridad: 0,0% de rechazos declarados frente al 3,4% del modelo base, incluyendo peticiones sobre explotación y desarrollo de vulnerabilidades.
- Multilingüismo: no declarado. La evaluación incluye CEval (58,1), lo que indica competencia parcial en chino; no hay datos sobre otros idiomas.
- Capacidades generales de razonamiento y conocimiento: MMLU 59,0 y CEval 58,1, aproximadamente el 70% del rendimiento del modelo base según el autor.
- No dispone de visión: la torre visual fue eliminada durante la poda.
- No se declara soporte nativo de audio, thinking mode explícito ni decodificación especulativa.

## Casos de uso

- Análisis de vulnerabilidades y triaje de CVEs: el modelo está entrenado sobre informes de vulnerabilidad y obtiene 6,8/10 en la categoría de análisis de vulnerabilidades de la evaluación de generación del propio autor, lo que lo hace adecuado para resumir avisos, estimar impacto y proponer mitigaciones en un flujo de trabajo de seguridad.
- Asistente de respuesta a incidentes y análisis forense de logs: con 8192 tokens de ventana de entrenamiento puede procesar bloques de trazas y eventos, aunque el autor advierte un rendimiento limitado en tareas de forensia (3,6/10) y recomienda combinar el modelo con herramientas de ejecución.
- Automatización de SOC de nivel 1: clasificación de alertas, enriquecimiento de indicadores y generación de borradores de tickets, aprovechando el formato de tool_call aprendido durante el ajuste.
- Soporte en competiciones CTF: el modelo puede proponer rutas de resolución y comandos en categorías de web, reversing o criptografía, si bien el autor reporta solo 2,5/10 en CTF práctico, por lo que debe usarse como asistente y no como resolutor autónomo.
- Generación de scripts y utilidades de seguridad en producción: dado su rendimiento en corpus de código (PPL 2,092) y su soporte de tool calling, encaja en pipelines que generan parsers de logs, scripts de hardening o pruebas de integración.
- Auditoría defensiva y revisión de configuraciones: la categoría de defensa y hardening obtiene 3,0/10, de modo que resulta más realista emplearlo para redactar borradores de políticas y checklist que revisar configuraciones críticas sin supervisión humana.
- Formación y concienciación en seguridad: al no rechazar preguntas sobre técnicas de ataque en contextos autorizados, puede usarse en laboratorios docentes y entornos de formación interna con aislamiento.
- Despliegue en el borde con cuantización: las variantes GGUF de 4 bits permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo para consultas puntuales sin conexión.

## Benchmarks y rendimiento

Resultados en benchmarks de opción múltiple (precisión en porcentaje), comparando el modelo base text-only de 27B, el modelo podado sin ajuste (20B) y Qing-Sec-20B:

| Benchmark | 27B original | 20B podado sin ajuste | Qing-Sec-20B | Recuperación |
|---|---|---|---|---|
| SecQA | 98,0 | 71,0 | 96,0 | 93% |
| SecEval | 79,1 | 33,8 | 74,9 | 91% |
| CyberMetric-500 | 95,0 | 55,0 | 84,4 | 74% |
| CyberMetric-80 | 96,2 | 56,2 | 86,2 | 75% |
| CTI-MCQ | 74,1 | 36,1 | 64,6 | 75% |
| CEval | 82,2 | 34,8 | 58,1 | 49% |
| MMLU | 81,6 | 35,1 | 59,0 | 51% |

La recuperación se define como (modelo − podado)/(original − podado). Perplejidad (menor es mejor):

| Corpus | 27B original | 20B podado sin ajuste | Qing-Sec-20B |
|---|---|---|---|
| Seguridad | 3,324 | 3,856 | 3,285 |
| Código | 2,686 | 3,032 | 2,092 |
| General | 2,101 | 2,707 | 2,193 |

Evaluación de generación sobre 30 tareas reales de seguridad, con el modelo de 27B actuando como juez sobre 10 puntos:

| Configuración de decodificación | 27B original | Qing-Sec-20B |
|---|---|---|
| greedy, 1024 tokens | 7,21 | 3,11 |
| greedy, 3072 tokens | no disponible | 3,18 |
| repetition_penalty=1.1, 3072 tokens | 8,14 | 3,89 |

Desglose por categoría con repetition_penalty=1.1: análisis de vulnerabilidades 6,8; desarrollo de exploits 4,25; forensia de logs 3,6; defensa y hardening 3,0; CTF práctico 2,5; metodología de red team 2,67.

Tasa de rechazo: 3,4% en el modelo de 27B frente a 0,0% en Qing-Sec-20B.

## Requisitos de hardware

- Inferencia en bf16: el autor indica aproximadamente 39 GB de VRAM para los pesos y un ahorro de memoria del 30% respecto al modelo de 27B. Requiere GPU de 40 GB o más (A100 40/80 GB, H100) para operar con margen para la caché KV.
- Cuantización INT8 (torchao int8_weight_only): repositorio de 21 GB, desplegable en A100 40 GB y, con margen ajustado, en GPU de 24 GB.
- Cuantización NF4: el tamaño exacto no está disponible en la información proporcionada.
- Familia GGUF: los ficheros ocupan entre 9 y 38,6 GB según el nivel de cuantización. Las variantes de 4 bits o inferiores (Q4_K_M, Q3_K_M, IQ4_XS) permiten ejecución en GPU de consumo con 12-24 GB, como RTX 4090, RTX 3090 o RTX 4080; los niveles F16 y Q8_0 requieren el mismo rango que bf16.
- Cabe en GPU de consumo: sí, con cuantización GGUF de 4 bits o inferior en tarjetas de 12 GB o más. Las estimaciones de VRAM para cuantizaciones concretas distintas de las publicadas por el autor no están disponibles.
- Opciones de despliegue citadas por el autor: llama.cpp, Ollama y LM Studio para GGUF; HuggingFace Transformers y vLLM para los formatos INT8 y NF4. El propio autor señala que está pendiente el soporte de más backends para esta arquitectura de atención híbrida, por lo que la compatibilidad debe verificarse antes de desplegar.
- Latencia y throughput: no se publican valores absolutos. El autor declara una mejora de velocidad de inferencia del 30-40% respecto al modelo de 27B.
- Configuración de decodificación obligatoria: repetition_penalty=1.1 (o muestreo con temperature 0,6-0,7 y top_p 0,8-0,9). Con decodificación greedy sin penalización se producen bucles de repetición que invalidan la salida.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el modelo base del que deriva y con su versión podada sin ajuste. No se aportan datos de otros modelos de seguridad de tamaño equivalente.

| Modelo | Parámetros | Contexto | SecQA | MMLU | Tasa de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qing-Sec-20B | 19,29B | no disponible (entrenamiento a 8192) | 96,0 | 59,0 | 0,0% | no disponible | safetensors bf16, GGUF, INT8, NF4 |
| Qwen3.8-27B (text-only) | 27,78B | no disponible | 98,0 | 81,6 | 3,4% | no disponible en la información aportada | modelo base en ModelScope |
| 20B podado sin ajuste | 19,29B | no disponible | 71,0 | 35,1 | no disponible | no disponible | artefacto intermedio del proceso de poda |

Frente a alternativas de seguridad de otros fabricantes no se dispone de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- Generación de razonamiento largo muy inferior al modelo base: 3,89 frente a 8,14 sobre 10 en la evaluación de 30 tareas, con el propio modelo de 27B como juez, lo que introduce un posible sesgo de autopreferencia en la evaluación.
- Degradación en decodificación greedy: se documentan bucles de repetición con enumeraciones infinitas de directorios, nombres de algoritmos SSH inexistentes y cadenas numéricas repetidas. Es obligatorio configurar repetition_penalty=1.1 o muestreo, y aun así el autor reconoce que el problema no está resuelto en origen.
- Capacidad general reducida: MMLU 59,0 y CEval 58,1, aproximadamente el 70% del modelo base. El autor desaconseja explícitamente usarlo como asistente generalista.
- Riesgo de alucinación elevado en tareas técnicas precisas: el ejemplo documentado de algoritmos criptográficos inventados indica que las salidas deben validarse con herramientas antes de su uso.
- Sesgos conocidos: no disponibles. No se publica ninguna evaluación de sesgo, toxicidad ni comportamiento diferencial por idioma o demografía.
- Idiomas: no se declara lista oficial. El corpus y los benchmarks tienen un claro sesgo hacia el chino, y no hay evaluación de calidad en castellano u otras lenguas.
- Licencia no disponible: no puede determinarse si el uso comercial está permitido. El modelo se presenta como "código abierto" y "de bien público", pero sin texto de licencia explícito no hay garantía jurídica para producción comercial.
- Doble consideración legal y ética: el modelo no rechaza peticiones sobre desarrollo de exploits, armamento o investigación ofensiva. Su uso debe limitarse a entornos autorizados; en la Unión Europea puede entrar en conflicto con normativa de ciberseguridad y con las políticas de proveedores cloud.
- Procedencia de los datos: el corpus proviene de interacciones de usuario de hcnote.cn con consentimiento y anonimización declarados, pero no se aporta auditoría independiente del proceso.
- Compatibilidad de despliegue limitada: la arquitectura híbrida con GatedDeltaNet y el tag qwen3_5_text pueden no estar soportados por todos los motores de inferencia, tal como reconoce el autor.
- Repositorio sin tracción: cero descargas y cero me gusta en el momento de la consulta, sin validación externa de los resultados publicados.
- Fecha de publicación en los metadatos posterior a la fecha actual de referencia, dato a verificar antes de citar el modelo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim
- Modelo base Qwen3.8-27B (ModelScope): https://modelscope.cn/models/Qwen/Qwen3.8-27B
- Repositorio bf16 en ModelScope: https://modelscope.cn/models/hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim
- Cuantizaciones GGUF en ModelScope: https://modelscope.cn/models/hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim-GGUF
- Cuantización INT8 en ModelScope: https://modelscope.cn/models/hcnote/Qing-Sec-20B-Qwen3.8-27B-Slim-INT8
- Sitio web del autor: https://hcnote.cn
- Pasarela de seguridad del autor: https://api.hcnsec.cn/
- Grupo de intercambio técnico (QQ): 253193620
