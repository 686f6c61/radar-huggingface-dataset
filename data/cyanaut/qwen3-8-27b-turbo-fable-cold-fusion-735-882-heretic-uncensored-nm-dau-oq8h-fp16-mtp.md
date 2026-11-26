# cyanaut/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ8h-fp16-mtp

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ8h-fp16-mtp es un checkpoint derivado de la familia Qwen3.5, publicado por el usuario cyanaut en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una cuantización de precisión mixta realizada con la herramienta oQ (oMLX v0.8.3) sobre un modelo base de la familia Qwen, presumiblemente un fine-tune orientado a eliminar restricciones de alineamiento (los sufijos "Heretic-Uncensored" y "Fable-Cold-Fusion" apuntan a ese tipo de intervención). El resultado es un artefacto pensado para ejecutarse en Apple Silicon mediante MLX.

El dato más relevante es que, pese al "27B" del nombre, el checkpoint contiene 9.902.379.760 parámetros reales según los safetensors, de los cuales 9.017B corresponden al modelo de lenguaje, 0.461B a un codificador visual y 0.425B a una cabeza MTP (multi-token prediction) para decodificación especulativa. El repositorio ocupa 30,2 GB y emplea un esquema de cuantización mixta con un promedio efectivo de 24,373 bits por peso, lo que combina capas en 8 bits afines con grupo de 64, capas en FP16, FP32 y una fracción mayoritaria en U32.

Su relevancia es acotada: se publicó el 25 de noviembre de 2026, no tiene descargas ni likes, no declara licencia ni idiomas, y la model card se limita a documentar la distribución de bits. Es un artefacto experimental de interés para quien quiera inspeccionar técnicas de cuantización mixta en MLX o reproducir un pipeline de decodificación especulativa con cabeza MTP, no una opción recomendable para producción sin evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con codificador visual y cabeza MTP; detalles de capas y atención no disponibles |
| Parametros totales | 9.902.379.760 (9,902B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit grupo 64 (2,915B pesos), FP16 (0,439B), FP32 (0,461B), U32 (6,088B); promedio efectivo 24,373 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`), cuantización mixta con tensores en 8-bit, FP16, FP32 y U32 |
| Tamano del repositorio | 30,2 GB (28,097 GiB de pesos) |
| Desglose de almacenamiento | LM: 9,017B / 25,914 GiB; visión: 0,461B / 1,716 GiB; cabeza MTP: 0,425B / 0,466 GiB |
| Fecha de publicacion | 2026-11-25 |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base ni de este derivado. El checkpoint se presenta explícitamente como una cuantización, no como un entrenamiento: la model card indica que se generó con oQ (oMLX v0.8.3) aplicando precisión mixta sobre un checkpoint previo. Por tanto, no hay datos sobre número de tokens, composición del dataset, RLHF, DPO ni proceso de alineamiento; los sufijos del nombre sugieren un fine-tune "uncensored", pero no se documenta metodología alguna.

A nivel estructural sí se pueden extraer datos concretos del desglose de almacenamiento. El modelo combina tres componentes: un modelo de lenguaje de 9,017B parámetros, un codificador visual de 0,461B (lo que implica capacidades multimodales de entrada de imagen) y una cabeza MTP de 0,425B parámetros. La presencia de MTP es la innovación técnica destacable: se trata de una cabeza de predicción multi-token que habilita decodificación especulativa, es decir, proponer varios tokens por paso y verificarlos en paralelo para aumentar el throughput. La cuantización mixta asigna 8 bits con grupo de 64 a solo el 29,4% de los pesos lógicos, mientras que el 61,5% queda en U32 y un 9% en FP16/FP32, un reparto inusual que encarece el checkpoint (24,373 bits/peso de media) y que probablemente responde a requisitos de la implementación MLX más que a una optimización agresiva de memoria.

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje de 9B parámetros es la base del modelo, aunque no se documentan evaluaciones.
- Procesamiento de imagen: el checkpoint incluye un codificador visual de 0,461B parámetros, por lo que se espera soporte de entrada multimodal, sin que se detallen resoluciones ni tipos de tarea.
- Decodificación especulativa: la cabeza MTP de 0,425B permite acelerar la generación mediante propuesta y verificación de tokens múltiples.
- Ejecución en Apple Silicon: empaquetado para MLX, lo que habilita inferencia nativa en chips M-series.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de técnicas de cuantización mixta: el checkpoint sirve como caso de estudio reproducible para medir el impacto de repartir pesos entre 8 bits, FP16, FP32 y U32 en calidad y velocidad, comparando contra el modelo base sin cuantizar en el mismo hardware.
- Investigación sobre decodificación especulativa: la cabeza MTP incluida permite experimentar con aceptación de tokens especulados, ajuste del número de drafts y su efecto en latencia sobre MLX, sin necesidad de entrenar una cabeza propia.
- Prototipado local en Mac: con 28,1 GiB de pesos, cabe en un Mac Studio o MacBook Pro con 36-64 GB de memoria unificada, lo que permite iterar en local sobre tareas de generación de texto y descripción de imágenes.
- Análisis de robustez y alineamiento: al tratarse de un derivado marcado como "uncensored", es útil en estudios que comparan tasas de rechazo, toxicidad y fidelidad frente al modelo original bajo el mismo conjunto de prompts.
- Pruebas de pipelines multimodales en MLX: el codificador visual integrado permite validar flujos de imagen-a-texto dentro del ecosistema MLX antes de migrar a un despliegue en servidor.
- Auditoría de artefactos de terceros: dado que no hay licencia ni model card sustantiva, el repositorio ejemplifica los riesgos de trazabilidad en checkpoints comunitarios y sirve para diseñar protocolos de verificación de procedencia y de pesos antes de usarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la distribución de bits y el desglose de almacenamiento; no incluye MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos suman 28,097 GiB (30,169 GB), por lo que se necesita un equipo con al menos 32 GB de memoria unificada disponible; en la práctica, 36 GB o más para dejar margen a caché KV y al runtime.
- GPU compatibles: el formato es MLX, de modo que el destino natural son chips Apple M-series (M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No se declara compatibilidad con CUDA; usar el checkpoint en A100, H100 o RTX 4090 requeriría conversión y una implementación distinta de la cuantización oQ.
- ¿Cabe en GPU de consumo? En el ecosistema Apple sí, en equipos con 36 GB o más de memoria unificada. En GPUs de consumo NVIDIA de 24 GB no cabe tal cual por el tamaño del checkpoint y por el esquema de cuantización no estándar.
- Opciones de despliegue: MLX y mlx-lm son las vías previstas; vLLM, llama.cpp, Ollama y TGI no soportan de forma nativa este esquema de cuantización mixta con tensores U32, por lo que requerirían reconversión.
- Latencia y throughput: no disponible; no se han publicado mediciones, y el beneficio de la cabeza MTP dependerá de la tasa de aceptación de tokens especulados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (cyanaut) | 9,902B (9,017B LM + 0,461B visión + 0,425B MTP) | no disponible | safetensors MLX, cuantización mixta oQ | no disponible | público, 0 descargas |
| Modelo base Qwen3.5 de ~9B (referencia) | ~9B | no disponible | safetensors, múltiples cuantizaciones | según el modelo original (no disponible aquí) | público |
| Cuantizaciones GGUF estándar de la misma familia | ~9B | no disponible | GGUF Q4/Q8 | según el modelo original | público, amplia adopción |
| Fine-tunes "uncensored" comunitarios de la familia Qwen | ~9B | no disponible | safetensors / GGUF | habitualmente variable o no declarada | público |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este checkpoint ni datos verificables en la información proporcionada sobre los modelos de referencia.

## Limitaciones y advertencias

- Ausencia total de licencia: no se declara licencia, lo que impide determinar si el uso comercial está permitido. Tratar como no apto para producción hasta aclararlo con el autor y con la licencia del modelo base.
- Trazabilidad insuficiente: no se identifica el checkpoint base exacto, ni el dataset de fine-tune, ni el proceso de "uncensoring". No es posible auditar qué se modificó respecto al original.
- Riesgo elevado de alucinación y de contenido inapropiado: los fine-tunes sin alineamiento suelen reducir los rechazos, lo que incrementa la probabilidad de respuestas dañinas, sesgadas o factualmente incorrectas. No se han publicado evaluaciones de seguridad.
- Idiomas no declarados: se desconoce la cobertura lingüística real y el rendimiento fuera del inglés.
- Contexto desconocido: no se documenta la longitud de ventana, lo que impide planificar cargas de contexto largo.
- Cuantización atípica: con un 61,5% de pesos lógicos en U32 y un promedio de 24,373 bits/peso, el checkpoint es mucho más pesado que un Q8 convencional y no ofrece las ventajas de memoria esperables de una cuantización de 8 bits; además, el esquema oQ limita la portabilidad fuera de MLX.
- Madurez nula: 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado en menos de media hora, sin issues ni discusión pública. No hay evidencia de validación por terceros.
- Repositorio de 30,2 GB: la descarga y el almacenamiento tienen un coste considerable para un modelo de 9,9B parámetros.
- Posible brecha de seguridad si se despliega como servicio: al no haber filtros de alineamiento garantizados, requiere moderación externa en cualquier interfaz expuesta a usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyanaut/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ8h-fp16-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Perfil del autor: https://huggingface.co/cyanaut
- MLX (framework de Apple): no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
