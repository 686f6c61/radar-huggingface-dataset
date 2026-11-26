# FINAL-Bench/Darwin-760B-RSI

## Resumen

Darwin-760B-RSI es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) con 763.205.315.794 parámetros totales, desarrollado por FINAL-Bench. Se presenta como el miembro de mayor tamaño de la familia Darwin, una línea de modelos que parte de un modelo "padre" ya entrenado y sustituye únicamente un subconjunto de sus capas del decodificador por otras equivalentes, preservando el resto del checkpoint byte a byte. En este caso, el padre es DeepSeek-V4.1-Flash-1017 y el modelo resultante reemplaza 7 de las 40 capas del decodificador (capas 23, 26, 27, 28, 30, 31 y 32), seleccionadas mediante una búsqueda sobre las capas 23-36.

El modelo está orientado a razonamiento intensivo con modo de pensamiento (chain-of-thought), con especial énfasis en matemáticas, ciencia, STEM, razonamiento jurídico y razonamiento multimodal. Su propuesta diferencial es la "evolución de capas Darwin": mantener la precisión del padre reduciendo el número de tokens de salida en torno a un 26 %, lo que se traduce en menor coste de inferencia y menor latencia en tareas de razonamiento largo. Emplea una arquitectura MoE con 384 expertos, pesos de expertos enrutados en MXFP4 (4,25 bits) y capas densas en FP8.

La relevancia actual del modelo radica en su combinación de tamaño (763B), licencia MIT, soporte multimodal (image-text-to-text) y resultados declarados destacados en GPQA Diamond, MMMU-Pro y LEXam. Está pensado para despliegue en servidores con GPU de clase H200 y ofrece compatibilidad con vLLM y API compatible con OpenAI, además de soporte para inglés, coreano, chino y otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE disperso, 384 expertos); linaje DeepSeek-V4.1-Flash |
| Parametros totales | 763.205.315.794 (763B) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (empleada en la evaluacion declarada) |
| Tipos de cuantizacion | MXFP4 (4,25 bits) en expertos enrutados; FP8 en capas densas |
| Idiomas soportados | Ingles (en), coreano (ko), chino (zh), multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 510,3 GB |
| Pipeline | image-text-to-text (vision-language) |
| Fecha de publicacion | 2026-11-22 |

## Arquitectura y entrenamiento

Darwin-760B-RSI es un transformer decoder-only con arquitectura Mixture-of-Experts de 384 expertos, derivado del checkpoint DeepSeek-V4.1-Flash-1017. La innovacion central no es un reentrenamiento completo, sino una "evolucion de capas": se conservan 33 de las 40 capas del decodificador, el router, las tablas engram, los embeddings, el tokenizer y la plantilla de chat de forma byte-identica al padre, y se sustituyen 7 capas (23, 26, 27, 28, 30, 31 y 32) por copias de pesos de otro checkpoint MIT de la misma arquitectura, seleccionadas mediante una busqueda de seleccion de capas sobre el rango 23-36. El modelo hijo mantiene exactamente los tensores, formas y recuento de parametros del padre (763.205.315.794 parametros).

En cuanto al formato numerico, los expertos enrutados se almacenan en MXFP4 (4,25 bits) y las capas densas en FP8, sin aritmetica de tensores ni recuantizacion adicional. La model card declara que cada candidato se midio contra el padre sobre los mismos items y con ajustes identicos, y que solo se publico un hijo capaz de mantener la precision del padre. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; la atribucion de los pesos de las capas sustituidas se recoge en el fichero `NOTICE` del repositorio.

## Capacidades

- Generacion de texto y razonamiento de nivel graduado, con modo de pensamiento (thinking) y chain-of-thought controlable mediante el parametro `reasoning_effort`.
- Razonamiento matematico, cientifico y STEM, con resultados declarados en GPQA Diamond.
- Razonamiento juridico, incluyendo preguntas de opcion multiple (LEXam) y preguntas abiertas evaluadas por juez (LEXam-hard).
- Capacidades multimodales de image-text-to-text: procesamiento conjunto de imagenes y texto para razonamiento visual, con resultados declarados en MMMU-Pro.
- Soporte de tool calling y function calling segun los tags del modelo (`openai-compatible`, `endpoints_compatible`).
- Capacidades de agente y razonamiento multi-paso derivadas de su modo de pensamiento y contexto de 65K tokens.
- Multilingue: ingles, coreano y chino, con soporte adicional declarado como multilingue.
- Razonamiento eficiente: la model card declara la precision del padre con aproximadamente un 26 % menos de tokens de salida.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede resolver preguntas de nivel posgrado en fisica, quimica y biologia con cadenas de pensamiento largas, apoyandose en su contexto de 65.536 tokens y en el modo `reasoning_effort` para ajustar la profundidad del razonamiento.
- Analisis juridico documental: con resultados declarados en LEXam y LEXam-hard, es adecuado para responder preguntas de opcion multiple sobre normativa y para redactar respuestas abiertas a cuestiones juridicas que luego revisa un profesional humano.
- Razonamiento sobre documentos e imagenes tecnicas: al ser un modelo image-text-to-text, permite interpretar diagramas, graficos y figuras junto con texto, util en ingenieria, medicina o analisis financiero.
- Generacion y revision de codigo en pipelines: su soporte de tool calling y su compatibilidad con API estilo OpenAI permiten integrarlo en flujos de CI/CD para revision automatizada, generacion de parches y explicacion de errores.
- Agentes autonomos multi-paso: la combinacion de contexto largo, modo de pensamiento y function calling lo hace apto para orquestar tareas que requieren varias llamadas a herramientas y razonamiento encadenado.
- Atencion al cliente especializada multilingue: puede gestionar conversaciones multi-turno en ingles, coreano y chino con contexto largo, manteniendo coherencia en hilos extensos.
- Evaluacion y benchmarking interno: util como modelo de referencia para comparar tecnicas de razonamiento eficiente, dado que su propuesta se basa en reducir tokens de salida manteniendo precision.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Resultado | Configuracion |
|---|---|---|
| GPQA Diamond | 92,93 (accuracy) | Muestra unica, temperatura 1.0, `reasoning_effort` 100, contexto de 65.536 tokens |
| LEXam (MCQ, 4 opciones) | 71,84 (accuracy) | Voto mayoritario, 4 a 8 muestras |
| LEXam-hard (preguntas abiertas) | 45,28 (judge score) | Muestra unica, juez DeepSeek-R1-0528 |
| MMMU-Pro (standard, 4 opciones) | 86,71 (accuracy) | Muestra unica, prompt CoT oficial, temperatura 1.0, `reasoning_effort` 100, contexto de 65.536 tokens |
| MMMU-Pro (standard, 10 opciones) | 80,52 (accuracy) | Muestra unica |

La model card afirma que el modelo ocupa el primer puesto en MMMU-Pro (86,71) y en LEXam (71,84) segun los datos del autor. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB en formato MXFP4/FP8; se requiere un nodo multi-GPU con al menos ese volumen de memoria agregada para cargar los pesos completos.
- GPU recomendadas: el tag del modelo menciona H200; por el tamano, se necesitan configuraciones multi-GPU de clase H200, H100 o A100 de 80 GB.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de gama alta.
- Opciones de despliegue: vLLM (soporte declarado), endpoints compatibles con la API de OpenAI y la libreria transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card indica una reduccion de aproximadamente el 26 % en tokens de salida frente al padre, lo que reduce coste y latencia en tareas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Darwin-760B-RSI | 763B (MoE) | 65.536 | MIT | Si (image-text-to-text) | Evolucion de capas sobre DeepSeek-V4.1-Flash; GPQA Diamond 92,93; MMMU-Pro 86,71 |
| DeepSeek-V4.1-Flash-1017 (padre) | 763B (MoE) | no disponible | MIT | no disponible | Modelo base del que se heredan 33 de 40 capas |
| Darwin-180B-RSI (hermano) | 180B (segun nombre) | no disponible | no disponible | no disponible | Miembro de la misma familia Darwin, de menor tamano |

No se dispone en la informacion proporcionada de datos de benchmarks de los modelos comparados, por lo que la comparacion de rendimiento se limita a los resultados declarados por el autor para Darwin-760B-RSI.

## Limitaciones y advertencias

- Todos los resultados de benchmarks son declarados por el autor y estan marcados como no verificados (`verified: false`); deben tomarse con cautela hasta que exista replicacion independiente.
- No se especifican los sesgos conocidos del modelo ni la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinacion inherente a los modelos de razonamiento generativo; el modo de pensamiento largo no garantiza correccion factual.
- La longitud de contexto documentada es de 65.536 tokens; no se indica soporte para ventanas mayores.
- El soporte linguistico declarado se limita a ingles, coreano, chino y una etiqueta generica "multilingue"; el rendimiento en castellano no esta documentado.
- La licencia MIT permite uso comercial, pero la atribucion de los pesos de las capas sustituidas se recoge en el fichero `NOTICE`, que debe revisarse antes de redistribuir.
- El despliegue requiere infraestructura multi-GPU de clase centro de datos (mas de 500 GB de pesos), lo que limita su uso a entornos con recursos elevados.
- No se dispone de informacion sobre latencia, throughput ni requisitos exactos de VRAM por configuracion de cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-760B-RSI
- Modelo padre (DeepSeek-V4.1-Flash-1017): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo hermano (Darwin-180B-RSI): https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Coleccion Darwin Family: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Paper (arXiv 2605.14386): https://huggingface.co/papers/2605.14386
- Sitio del autor (VIDRAFT): https://vidraft.net
- Dataset GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- Dataset MMMU-Pro: https://huggingface.co/datasets/MMMU/MMMU_Pro
- Dataset LEXam: https://huggingface.co/datasets/LEXam-Benchmark/LEXam
- Dataset LEXam-hard: https://huggingface.co/datasets/joelniklaus/LEXam-hard
