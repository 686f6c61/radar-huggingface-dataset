# mradermacher/EAN-3B-GGUF

## Resumen

EAN-3B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo DawnLiu/EVAN-3B, realizadas por el cuantizador mradermacher, conocido en la comunidad por producir versiones optimizadas de miles de modelos para su ejecución local. El modelo base, EVAN-3B, es un modelo multimodal de razonamiento con unos 3.400 millones de parámetros, entrenado con aprendizaje por refuerzo sobre el dataset TIGER-Lab/ViRL39K, un conjunto de datos orientado a razonamiento visual y matemático. Su relevancia radica en ofrecer capacidades de razonamiento multimodal en un tamaño muy reducido, ejecutable en hardware de consumo.

La finalidad de este repositorio no es el modelo en sí, sino facilitar su despliegue local: incluye cuantizaciones desde Q2_K (1,5 GB) hasta f16 (6,9 GB), además de los suplementos multimodales mmproj en Q8_0 y f16. Esto permite ejecutar el modelo en portátiles, mini PCs o GPUs modestas mediante llama.cpp, LM Studio, Ollama u otros backends compatibles con GGUF. Para quienes busquen máxima calidad de cuantización, existe también una versión con imatrix (matriz de importancia) en el repositorio hermano EAN-3B-i1-GGUF.

Cabe destacar que la licencia del modelo base es "qwen-research", una licencia de tipo investigativo derivada de la familia Qwen, lo que puede restringir su uso comercial. El modelo está etiquetado en inglés, con capacidades multimodales (visión y lenguaje) y de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base EVAN-3B, detalles no disponibles) |
| Parámetros totales | 3.397.103.616 (≈3,4 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés |
| Licencia | qwen-research (other) |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo base, EVAN-3B, es un modelo multimodal de unos 3,4 mil millones de parámetros, lo que sugiere una arquitectura de tipo vision-language: un codificador visual (cuyo adaptador se distribuye como archivo mmproj en las cuantizaciones GGUF) combinado con un LLM de lenguaje. La presencia de los archivos mmproj-Q8_0 y mmproj-f16 confirma que el modelo procesa entradas de imagen además de texto. Los detalles concretos de la arquitectura (número de capas, cabezas de atención, dimensión oculta) no están disponibles en la información proporcionada.

Respecto al entrenamiento, el model card indica el uso del dataset TIGER-Lab/ViRL39K y las etiquetas "reasoning" y "reinforcement-learning", lo que apunta a un entrenamiento post-inicial con aprendizaje por refuerzo sobre problemas de razonamiento visual-matemático. ViRL39K es un conjunto de datos de razonamiento visual con unos 39.000 problemas, habitualmente empleado para entrenar modelos con RL en tareas de razonamiento multimodal. No hay información disponible sobre el preentrenamiento, el número total de tokens ni el uso de RLHF o DPO adicionales.

## Capacidades

- Razonamiento multimodal: procesa imágenes junto con texto para resolver problemas que requieren razonamiento visual.
- Razonamiento matemático: entrenado con RL sobre ViRL39K, orientado a problemas matemáticos con componente visual (gráficos, geometría, diagramas).
- Generación de texto conversacional: etiquetado como "conversational", apto para diálogo.
- Entrada de imagen en inferencia local: los archivos mmproj permiten usar el modelo con backends GGUF que soporten visión (llama.cpp multimodal).
- Etiquetado con "reinforcement-learning", lo que sugiere cadenas de razonamiento mejoradas frente al modelo base sin RL.
- Tool calling, agentes y soporte de otros idiomas: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos con imágenes: el modelo puede recibir una foto o captura de un problema de geometría o un gráfico y razonar paso a paso hasta la solución, gracias a su entrenamiento con RL sobre ViRL39K.
- Asistente de razonamiento local y privado: con cuantizaciones de solo 2-2,2 GB (Q4_K), se puede desplegar en un portátil sin GPU dedicada para consultas de razonamiento sin enviar datos a la nube.
- Tutoría educativa: útil como tutor que explica problemas visuales de matemáticas a estudiantes, verificando el razonamiento paso a paso.
- Prototipado de aplicaciones multimodales en edge: su tamaño de 3,4 B permite integrarlo en dispositivos con recursos limitados para tareas de comprensión de imágenes y preguntas y respuestas.
- Evaluación e investigación en razonamiento multimodal: al ser un modelo entrenado con RL sobre un dataset público de razonamiento, sirve como base para experimentos de investigación reproducibles.
- Extracción e interpretación de diagramas: puede responder preguntas sobre contenido de diagramas técnicos o esquemas sencillos combinando el codificador visual mmproj con el LLM.
- Pruebas comparativas de cuantizaciones: al disponer de 12 niveles de cuantización, es idóneo para medir la degradación de calidad en razonamiento según el nivel de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo GGUF determina el mínimo; desde 1,5 GB (Q2_K) hasta 6,9 GB (f16), más el suplemento mmproj (0,9-1,4 GB) si se usa visión. Con Q4_K_M (2,2 GB), basta con un equipo con 8 GB de RAM.
- GPU recomendadas: no requiere GPU obligatoriamente; funciona por CPU con llama.cpp. Con GPU, cualquier modelo con 4-8 GB de VRAM (RTX 3060, RTX 4060 o superior) permite inferencia acelerada con offload parcial o total de capas.
- Consumer GPUs: cabe íntegramente en una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB incluso en f16; en Q4_K_M cabe en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, GPT4All y cualquier backend compatible con GGUF y mmproj. No está orientado a vLLM o TGI, que requieren pesos originales en safetensors.
- Latencia y throughput: no disponibles; por su tamaño de 3 B, se esperan velocidades altas en CPU moderno (decenas de tokens por segundo) y muy altas con GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Multimodal | Formato | Licencia |
|---|---|---|---|---|
| EAN-3B (EVAN-3B) | 3,4 B | Sí (visión + razonamiento) | GGUF / safetensors | qwen-research (restringida) |
| Qwen2.5-VL-3B | 3,7 B | Sí (visión + lenguaje) | safetensors / GGUF | Qwen Research / variantes Apache 2.0 según versión |
| SmolVLM2-2.2B (HuggingFace) | 2,2 B | Sí (visión + lenguaje) | safetensors / GGUF | Apache 2.0 |
| Phi-3.5-vision-instruct | 4,2 B | Sí (visión + lenguaje) | safetensors / GGUF | MIT |

Frente a estas alternativas, EVAN-3B se diferencia por su enfoque específico en razonamiento visual-matemático mediante RL, mientras que los modelos comparables son más generalistas. Su licencia es más restrictiva que Apache 2.0 o MIT.

## Limitaciones y advertencias

- Licencia qwen-research: de tipo investigativo; probablemente restringe el uso comercial. Revisar el archivo LICENSE antes de cualquier despliegue en producción.
- Idioma: el modelo está etiquetado solo en inglés; su rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación: como todo modelo pequeño de 3 B, puede generar razonamientos plausibles pero incorrectos, especialmente en matemáticas; se recomienda verificación de resultados.
- Contexto: la longitud de ventana no está documentada en este repositorio; consultar la model card del modelo base.
- Cuantizaciones bajas: Q2_K y Q3_K_S/M/L pueden degradar notablemente la calidad del razonamiento, una tarea especialmente sensible a la cuantización; se recomienda Q4_K_M o superior.
- Sesgos conocidos: no documentados; al derivar de la familia Qwen, puede heredar los sesgos de sus datos de preentrenamiento.
- El repositorio es una cuantización de terceros (mradermacher); cualquier bug del modelo base debe reportarse a DawnLiu/EVAN-3B, no al cuantizador.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/EAN-3B-GGUF
- Modelo base: https://huggingface.co/DawnLiu/EVAN-3B
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/EAN-3B-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#EAN-3B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
