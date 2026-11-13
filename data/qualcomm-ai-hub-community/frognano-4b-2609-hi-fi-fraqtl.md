# qualcomm-ai-hub-community/FrogNano-4B-2609-Hi-Fi-fraQtl

## Resumen

FrogNano-4B-2609-Hi-Fi-fraQtl es una cuantización GGUF de 4 bits del modelo base microsoft/FrogNano-4B-2609, publicada por el usuario fraQtl y redistribuida en el repositorio de la comunidad qualcomm-ai-hub-community. El modelo base es un transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) orientado a generación de texto conversacional, desarrollado originalmente por Microsoft. Esta ficha describe la versión cuantizada, no los pesos originales en bf16.

La relevancia de esta build reside en su metodología de cuantización: en lugar de aplicar el esquema Q4_K_M estándar de llama.cpp, el autor emplea redondeo GPTQ ponderado por Hessiano (Frantar et al., 2022) dentro de los bloques Q4_K, Q5_K y Q6_K nativos del formato, combinado con una matriz de importancia (imatrix) derivada de su corpus de calibración. Además, reasigna siete tensores con mayor coste de compresión a Q5_K sin exceder el presupuesto de bytes de Q4_K_M, y elimina el bloque de predicción del siguiente token que llama.cpp no ejecuta.

El resultado declarado es un archivo de 2.727.809.824 bytes (2,73 GB) que, según las mediciones del autor, queda un 20,3 % más cerca del modelo bf16 original en tareas de seguimiento de instrucciones y tool calling, y un 6,5 % más cerca en conocimiento y razonamiento, en comparación con el Q4_K_M de bartowski al mismo tamaño. El modelo está etiquetado para despliegue on-device en hardware Qualcomm Snapdragon con backend Hexagon NPU, aunque el propio autor indica que no se ha ejecutado todavía un benchmark en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base microsoft/FrogNano-4B-2609; detalles no disponibles en la información proporcionada) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (build principal), con 7 tensores elevados a Q5_K y tensores Q6_K; comparativas con Q4_K_M, IQ4_NL, Q4_K_S y Q4_0 |
| Idiomas soportados | no disponible (campo de idiomas vacío en Hugging Face) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible describe únicamente el proceso de cuantización, no la arquitectura ni el entrenamiento del modelo base. El modelo base microsoft/FrogNano-4B-2609 es un transformer de 4,2 B parámetros, pero no se proporcionan detalles sobre número de capas, dimensión oculta, mecanismo de atención, composición del dataset de entrenamiento, número de tokens vistos ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica documentada corresponde a la build cuantizada. El proceso consta de tres pasos: primero, redondeo GPTQ ponderado por Hessiano escrito dentro de los bloques Q4_K, Q5_K y Q6_K de llama.cpp, usando las escalas y mínimos de llama-quantize junto con estadísticas y matriz de importancia del corpus de calibración del autor; segundo, asignación de bits basada en la medición del coste de compresión de cada tensor, elevando los siete tensores más costosos a Q5_K dentro del presupuesto de bytes de Q4_K_M; tercero, eliminación del bloque de predicción del siguiente token, que llama.cpp no utiliza, lo que reduce el tamaño de descarga. El autor desglosa la contribución de cada paso frente a Q4_K_M: el redondeo sobre tensores Q4_K aporta −15,3 % en tarea y −0,2 % en general; añadir el redondeo sobre Q6_K lleva a −17,6 % y −3,1 %; y elevar siete tensores a Q5_K alcanza −20,3 % y −6,5 %.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Seguimiento de instrucciones (evaluado con IFEval en la comparativa del autor).
- Tool calling / function calling (incluido en la métrica "Task" junto con instruction following).
- Razonamiento y conocimiento general (incluido en la métrica "General").
- Razonamiento matemático (evaluado con GSM8K en la comparativa del autor).
- Despliegue on-device en hardware Qualcomm Snapdragon con backend Hexagon NPU (soporte declarado para todos los tipos de tensor presentes, sin benchmark en dispositivo ejecutado).
- Ejecución en llama.cpp estándar sin runtime personalizado (probado con llama.cpp b12079).
- Capacidades multimodales, de audio, modo thinking explícito o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en dispositivo móvil: al ser un GGUF de 2,73 GB ejecutable en llama.cpp estándar y con tipos de tensor soportados por el backend Hexagon NPU, puede desplegarse en teléfonos y tablets con Snapdragon para conversaciones multi-turno sin depender de la nube.
- Agente local con tool calling: la build está optimizada específicamente para preservar el comportamiento de tool calling e instruction following del modelo original (métrica Task con KL 0,01853), lo que la hace adecuada para orquestar llamadas a funciones en asistentes embebidos.
- Aplicaciones de privacidad por diseño: al ejecutarse localmente en el dispositivo, los datos del usuario no abandonan el terminal, lo que encaja en escenarios regulados (sanidad, finanzas personales) donde el envío a servidores externos es problemático.
- Prototipado rápido en estaciones de trabajo: con `llama-cli -hf` el modelo arranca con un solo comando, útil para validar prompts y flujos conversacionales antes de invertir en infraestructura mayor.
- Evaluación comparativa de cuantizaciones: el repositorio incluye tablas de fidelidad (KL frente a bf16) y recibos con sha256, lo que permite a investigadores reproducir y comparar esquemas de cuantización a igualdad de bytes.
- Generación de texto en entornos con VRAM limitada: 2,73 GB de pesos permiten ejecución en GPUs de gama media y en CPU, habilitando tareas de resumen, redacción o clasificación sin aceleradores de gran capacidad.
- Razonamiento matemático básico en producción: los resultados de GSM8K reportados (229/250, empatados con Q4_K_M) indican que la cuantización no degrada el rendimiento aritmético en esta build.

## Benchmarks y rendimiento

El autor publica dos conjuntos de mediciones. La primera es divergencia KL de vocabulario completo frente al bf16 original, sobre 144 ventanas de texto reservadas, con intervalos de confianza del 95 % por bootstrap pareado (2.000 remuestreos):

| Archivo | Bytes (evaluados) | KL tarea | KL general |
|---|---|---|---|
| fraQtl Hi-Fi Q4_K (este repo) | 2.727.809.824 | 0,01853 | 0,01313 |
| Q4_K_M (bartowski) | 2.729.642.880 | 0,02327 | 0,01404 |
| IQ4_NL (bartowski) | 2.719.177.600 | 0,02573 | 0,01761 |
| Q4_K_S (bartowski) | 2.547.780.480 | 0,02802 | 0,01711 |
| Q4_0 (bartowski) | 2.647.856.000 | 0,04949 | 0,02928 |

Frente a Q4_K_M a igualdad de bytes: tarea −20,3 % [−27,4; −11,8], general −6,5 % [−11,5; −1,9].

La segunda tabla recoge respuestas correctas sobre 500 preguntas fijas, decodificación greedy, thinking desactivado, llama.cpp b12079, una GPU por archivo:

| Archivo | GSM8K /250 | IFEval /250 |
|---|---|---|
| Q4_K_M (bartowski) | 229 | 190 |
| fraQtl Hi-Fi Q4_K (este repo) | 229 | 191 |

Preguntas acertadas solo por un archivo: GSM8K 7 y 7 (p = 1,00); IFEval 15 y 14 (p = 1,00). El modelo bf16 original no se ejecutó sobre estas preguntas, por lo que los recuentos comparan únicamente los dos archivos de 4 bits. No se han publicado resultados de benchmarks frente a modelos de otros desarrolladores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,73 GB solo para los pesos en Q4_K; con overhead de contexto y caché KV, prever un margen adicional (no cuantificado en la información disponible).
- GPU recomendadas: no disponible en la información proporcionada. El autor indica únicamente que las pruebas se ejecutaron con una GPU por archivo, sin especificar modelo.
- Cabe en GPU consumer: sí, por tamaño de pesos (2,73 GB) es compatible con GPUs consumer de gama media y alta; no se especifican modelos concretos.
- Despliegue: llama.cpp estándar (probado con b12079), incluido `llama-cli -hf`; backend Qualcomm Hexagon NPU declarado compatible con todos los tipos de tensor presentes, sin benchmark en dispositivo ejecutado. Soporte en vLLM, TGI, Ollama u otros runtimes: no disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad de generación ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FrogNano-4B-2609-Hi-Fi-fraQtl (este) | 4,2 B | no disponible | GGUF Q4_K (2,73 GB) | MIT | Hugging Face (qualcomm-ai-hub-community y fraQtl) |
| FrogNano-4B-2609 Q4_K_M (bartowski) | 4,2 B | no disponible | GGUF Q4_K_M (2,73 GB evaluados; 2,80 GB descargados) | MIT (heredada del base) | Hugging Face (bartowski) |
| FrogNano-4B-2609 IQ4_NL (bartowski) | 4,2 B | no disponible | GGUF IQ4_NL (2,72 GB) | MIT (heredada del base) | Hugging Face (bartowski) |
| FrogNano-4B-2609 Q4_0 (bartowski) | 4,2 B | no disponible | GGUF Q4_0 (2,65 GB) | MIT (heredada del base) | Hugging Face (bartowski) |

Las alternativas comparadas son builds de cuantización del mismo modelo base, no modelos distintos. El autor menciona además builds no medidas (mradermacher i1 y roman220220 imatrix Q4_K_M). No se dispone de comparación con modelos de otros desarrolladores de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser una cuantización del base, hereda los sesgos del modelo original, que no se describen.
- Riesgo de alucinación: no cuantificado; la tabla de KL mide cercanía al bf16, no veracidad. El autor advierte explícitamente que KL no equivale a precisión en tareas.
- Alcance de la evaluación: las ventanas KL provienen de una sola build (144 ventanas) y las comparativas de respuestas cubren solo 500 preguntas; el modelo bf16 original no se evaluó en esas preguntas, de modo que las cifras comparan únicamente dos archivos de 4 bits.
- Contexto e idiomas: la longitud de contexto no está disponible y el campo de idiomas está vacío; no se puede confirmar soporte multilingüe ni ventana máxima.
- Reproducibilidad: los datos de calibración, la matriz de importancia y la tabla de coste por tensor no están publicados, lo que impide reproducir exactamente la build.
- Licencia: MIT, permisiva para uso comercial; conviene verificar igualmente los términos del modelo base microsoft/FrogNano-4B-2609, no detallados aquí.
- On-device: el soporte Hexagon NPU está declarado a nivel de tipos de tensor, pero no se ha ejecutado benchmark en dispositivo; el rendimiento real en Snapdragon está sin verificar.
- Producción: el repositorio redistribuido registra 0 descargas y 0 likes en el momento de la consulta, y el campo `inference: false` en la model card indica que la inferencia no está habilitada en el Hub para este repo.

## Enlaces

- Repositorio Hugging Face (redistribución): https://huggingface.co/qualcomm-ai-hub-community/FrogNano-4B-2609-Hi-Fi-fraQtl
- Repositorio canónico del autor: https://huggingface.co/fraQtl/FrogNano-4B-2609-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/microsoft/FrogNano-4B-2609
- GGUFs de referencia (bartowski): https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF
- Perfil del autor: https://huggingface.co/fraQtl
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia sobre redondeo GPTQ: Frantar et al., 2022 (GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers); enlace no disponible en la información proporcionada.
