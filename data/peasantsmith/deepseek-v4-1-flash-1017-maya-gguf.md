# peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF

## Resumen

Maya-S es una cuantización GGUF de `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un modelo de lenguaje de mezcla de expertos (MoE) con 748.494.643.824 parámetros totales, desarrollado originalmente por DeepSeek y cuantizado por el usuario `peasantsmith` para Project Maya, un motor de inferencia que mantiene los expertos más utilizados en la GPU y lee el resto desde RAM y SSD. El paquete no es un modelo nuevo: es un esquema de cuantización mixto que reduce el checkpoint original de expertos FP4 y pesos densos FP8 a un conjunto de 339,5 GB en seis ficheros GGUF, con los expertos enrutados a 2-3 bits y las partes densas en 8 bits.

Su relevancia es práctica: permite ejecutar un MoE de casi 750.000 millones de parámetros en máquinas que no pueden alojar el checkpoint original, aceptando una pérdida de fidelidad medida. Según la model card, Maya-S elige el mismo token siguiente que el modelo original el 92,6 % de las veces sobre texto no usado en calibración (divergencia KL de 0,120), frente al 96,4 % (KL 0,047) que obtienen los pesos originales al pasar por el mismo motor. La arquitectura declarada incluye 384 expertos enrutados por capa con 6 activos por token, más un experto compartido, tablas Engram de memoria de n-gramas y un borrador DSpark para decodificación especulativa.

La licencia es MIT, el repositorio ocupa 686,9 GB en total y el modelo acumula 9.981 descargas y 13 likes desde su publicación el 19 de octubre de 2026. No hay datos publicados de longitud de contexto, idiomas soportados ni resultados de benchmarks de capacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, con 384 expertos enrutados por capa, 6 activos por token y un experto compartido; incluye tablas Engram (memoria de n-gramas), torre de visión y borrador DSpark para decodificación especulativa |
| Parámetros totales | 748.494.643.824 (≈748,5 B) |
| Parámetros activos | No disponible (la model card solo indica que se activan 6 de los 384 expertos enrutados por capa, más un experto compartido; no se especifica el recuento de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Esquema mixto: IQ2_XXS (expertos enrutados, gate y up), IQ3_XXS (expertos enrutados, down), IQ2_S / IQ3_S (primeras y últimas cuatro capas), Q8_0 (atención, expertos compartidos, embeddings, salida y proyección de valor de Engram), Q6_K (tablas Engram), F32 (router, normalizaciones, mezcla de hyper-connections, attention sinks), BF16 (proyecciones pequeñas del indexer) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 ficheros, generados con los cuantizadores ggml de llama.cpp); el borrador DSpark se distribuye aparte como `dspark.bin` + `dspark.json` |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 (expertos FP4, pesos densos FP8) |
| Tamaño del paquete Maya-S | 339,5 GB (178,2 GB de modelo en los ficheros 1-4 + 161,3 GB de tablas Engram en los ficheros 5-6) |
| Tamaño del borrador DSpark | 8,0 GB |
| Tamaño del repositorio | 686,9 GB |
| Descargas / likes | 9.981 / 13 |
| Fecha de publicación | 2026-10-19 |

## Arquitectura y entrenamiento

El modelo base es un MoE con 384 expertos enrutados por capa, de los que 6 se activan por token, más un experto compartido siempre activo; aritméticamente esto supone un 1,56 % de los expertos enrutados por token. El inventario de tensores de la cuantización revela otros componentes: un router, normalizaciones, mezcla de hyper-connections, attention sinks, un "indexer" con proyecciones de pequeño tamaño (que la model card no detalla) y dos tablas Engram que actúan como memoria de n-gramas y se leen unas pocas filas por token directamente desde el SSD. La torre de visión se toma del checkpoint de DeepSeek sin modificar, y el borrador DSpark se distribuye con los expertos FP4 tal como los publicó DeepSeek y los pesos densos en 8 bits.

No hay información sobre el entrenamiento del modelo original (número de tokens, composición del corpus, RLHF/DPO). Lo que sí se documenta es el proceso de cuantización, construido en parte sobre la receta de IST Austria DAS Lab: calibración con 128 secuencias de 2.048 tokens en la plantilla de chat de DeepSeek (incluyendo modo thinking) y una mezcla de chat, chat multilingüe, razonamiento, código y tool calls; cálculo de una matriz de importancia por experto (no por capa) a partir de las estadísticas de entrada del modelo original; y redondeo con realimentación de error de estilo GPTQ en bloques de 256 pesos. El autor afirma que este redondeo reduce el error de salida de los expertos entre un 35 % y un 50 % frente al redondeo ponderado por importancia sin realimentación, al mismo tamaño. La evaluación se hace sobre un conjunto reservado de 10 secuencias de 2.047 tokens nunca usado en calibración, comparando con la implementación de referencia de DeepSeek.

## Capacidades

- Generación de texto conversacional: la model card etiqueta el pipeline como `text-generation` y `conversational`, y la calibración usa la plantilla de chat del modelo con modo thinking incluido.
- Razonamiento con modo thinking: el proceso de calibración incorpora explícitamente texto de razonamiento en el formato del propio modelo.
- Generación de código: la mezcla de calibración incluye código, por lo que la cuantización está ajustada a ese dominio (no hay evaluación de calidad de código publicada).
- Tool calling / function calling: la API servida por Project Maya es compatible con OpenAI y Anthropic e incluye soporte de tool calls en streaming.
- Entrada de imágenes: la torre de visión se conserva sin cambios y la API de Project Maya acepta "pictures"; no hay evaluación publicada del efecto de la cuantización sobre tareas de visión.
- Multilingüismo: la calibración incluye chat multilingüe, pero no se enumeran idiomas soportados.
- Decodificación especulativa: incluye un borrador DSpark (`dspark.bin`, 8,0 GB) con bloques de borrador multi-token.
- Despliegue como servicio: dashboard local en `http://127.0.0.1:8080` y API compatible con OpenAI y Anthropic en la misma dirección.
- Ejecución con memoria parcial: el motor mantiene los expertos más usados en GPU y lee el resto de RAM y SSD, de modo que el rendimiento escala con la memoria disponible.

## Casos de uso

- Inferencia local de un MoE de gran tamaño con presupuesto de VRAM limitado: Project Maya permite arrancar el modelo aunque no quepan los 178,2 GB de pesos en la GPU, paginando expertos desde RAM y SSD; útil para laboratorios que quieren estudiar un modelo de 748,5 B sin acceso a un clúster dedicado.
- Servicio interno compatible con OpenAI/Anthropic: al exponer una API compatible en `127.0.0.1:8080` con streaming y tool calls, se puede apuntar herramientas existentes (clientes, frameworks de agentes, SDKs) al endpoint local sin reescribir integraciones.
- Asistente de código en pipelines internos: la calibración incluye código y tool calls en el formato del modelo, lo que lo hace adecuado para tareas de generación y revisión de código con llamadas a herramientas, con la salvedad de que no hay benchmarks de HumanEval publicados.
- Razonamiento multi-paso en entorno on-premise: el modo thinking del modelo permite cadenas de razonamiento largas sin enviar datos a terceros, relevante en sectores con restricciones de confidencialidad.
- Procesamiento de documentos con imágenes: la torre de visión intacta y el soporte de "pictures" en la API permiten flujos de extracción o descripción de imágenes en local, aunque sin métricas publicadas de calidad tras la cuantización.
- Investigación sobre cuantización extrema: el paquete es un caso de estudio reproducible de cuantización a 2-3 bits con realimentación de error por experto, con métricas de fidelidad (top-1 y KL) y una línea base explícita (los pesos originales a través del mismo motor).
- Evaluación comparativa de motores de inferencia: al existir una medición del suelo del motor (96,4 % top-1 frente a la implementación de referencia), sirve para separar el error atribuible al motor del atribuible a la cuantización.
- Formación y demos técnicas: un único comando de `setup.sh` descarga, verifica por sha256, compila y arranca el modelo, lo que simplifica talleres y demostraciones reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son métricas de fidelidad de la cuantización frente al modelo original, medidas token a token sobre texto reservado:

| Medición (10 secuencias de 2.047 tokens) | Mismo token top-1 que el original | Divergencia KL |
|---|---:|---:|
| Pesos originales a través del motor de Project Maya (suelo del motor) | 96,4 % | 0,047 |
| Maya-S (cuantización completa) | 92,6 % | 0,120 |

| Efecto de las tablas Engram en Q6_K | Mismo token top-1 | Divergencia KL |
|---|---:|---:|
| Tablas Q6_K frente a las tablas FP8 originales | 97,5 % | 0,011 (ruido de la propia medición) |
| Maya-S con tablas Q6_K frente al original (4 secuencias) | No disponible | 0,0858 |
| Maya-S con tablas FP8 frente al original (4 secuencias) | No disponible | 0,0866 |

Estos valores miden parecido con el modelo original, no calidad absoluta: no indican cómo rinde en tareas concretas.

## Requisitos de hardware

- Almacenamiento: 339,5 GB para el conjunto Maya-S (178,2 GB de modelo + 161,3 GB de tablas Engram) más 8,0 GB del borrador DSpark; el repositorio completo ocupa 686,9 GB. Se recomienda SSD, porque las tablas Engram se leen unas pocas filas por token desde disco.
- VRAM para residencia completa de los pesos: no publicada por el autor. Como referencia derivada del tamaño de los ficheros, alojar los 178,2 GB de pesos más caché KV exige por encima de 192 GB de VRAM o memoria unificada; configuraciones de 3-4 GPU de 80 GB (H100/A100) o un equipo Apple con 256-512 GB de memoria unificada entran en ese orden de magnitud.
- VRAM con paginación de expertos: el diseño de Project Maya no requiere residentizar el modelo completo; mantiene los expertos más usados en GPU y lee el resto de RAM y SSD. El autor no publica mínimos ni cifras de latencia.
- GPU consumer: una RTX 4090 (24 GB) no puede alojar los pesos, y no hay datos publicados sobre latencia con paginación desde RAM/SSD en ese tipo de tarjeta; el rendimiento declarado depende de "más memoria es más rápido", sin cifras.
- Memoria del sistema: no se publica un mínimo de RAM; al leer expertos y tablas desde RAM y SSD, la cantidad de RAM disponible afecta directamente a la velocidad.
- Opciones de despliegue: Project Maya v1.1.17 o superior (las instalaciones de v1.1.16 siguen funcionando con el diseño anterior), con dashboard en `http://127.0.0.1:8080` y API compatible con OpenAI y Anthropic. Los ficheros son GGUF estándar generados con ggml, por lo que deberían poder abrirse con llama.cpp, aunque las tablas Engram externas y el borrador DSpark están pensados para el motor de Maya. Soporte en vLLM o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Formato / precisión | Tamaño en disco | Licencia | Notas |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (original) | 748,5 B | No disponible | Expertos FP4, pesos densos FP8 | No disponible | MIT | Referencia de calidad: 96,4 % top-1 y KL 0,047 al ejecutarse en el motor de Maya |
| Maya-S (esta ficha) | 748,5 B | No disponible | GGUF mixto: IQ2_XXS/IQ3_XXS en expertos, Q8_0 en densos, Q6_K en Engram | 339,5 GB (+8,0 GB de DSpark) | MIT | 92,6 % top-1 y KL 0,120 frente al original |
| Otras cuantizaciones GGUF del mismo modelo base | 748,5 B | No disponible | No disponible | No disponible | No disponible | No hay datos publicados en la información disponible |
| Otros MoE abiertos de escala comparable | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo: es una cuantización del checkpoint de DeepSeek. Cualquier limitación del modelo base se hereda, y aquí no se documentan sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Pérdida de fidelidad medible: el 7,4 % de los tokens difieren del original en la medición publicada, con KL de 0,120. El error puede acumularse en generaciones largas y en dominios poco representados en las 128 secuencias de calibración.
- El suelo del motor cuenta: los propios pesos originales ejecutados en Project Maya solo coinciden al 96,4 % con la implementación de referencia, así que parte de la divergencia no es atribuible a la cuantización.
- Calibración pequeña y específica: 128 secuencias de 2.048 tokens con una mezcla concreta de chat, multilingüe, razonamiento, código y tool calls. El rendimiento fuera de esos dominios no está medido.
- Sin benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de visión publicadas, por lo que no se puede afirmar calidad absoluta en ninguna tarea.
- Idiomas no especificados: la model card no enumera idiomas soportados; la calibración menciona chat multilingüe sin detallar cuáles.
- Longitud de contexto desconocida: no se indica la ventana de contexto del modelo base ni la efectiva tras la cuantización.
- Dependencia del motor y del almacenamiento: el esquema de tablas Engram externas y el borrador DSpark están diseñados para Project Maya v1.1.17+; el rendimiento depende del SSD y de la RAM del equipo, y no hay cifras de latencia publicadas.
- Visión sin evaluar: la torre se conserva sin cambios, pero las métricas de fidelidad son solo de texto; no hay evidencia publicada sobre el impacto de la cuantización en tareas multimodales.
- Coste de almacenamiento elevado: 339,5 GB para el conjunto y 686,9 GB para el repositorio completo.
- Licencia: MIT, sin restricciones adicionales conocidas, lo que permite uso comercial; conviene verificar igualmente los términos del checkpoint base y de las dependencias del motor.
- Métricas autodeclaradas: todas las cifras de fidelidad proceden del autor de la cuantización y no han sido replicadas de forma independiente en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4
