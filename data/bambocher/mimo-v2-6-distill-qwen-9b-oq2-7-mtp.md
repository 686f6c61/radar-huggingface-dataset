# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2.7-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ2.7-mtp es una cuantización mixta de precisión del modelo bambocher/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario bambocher. Se trata de un derivado destilado sobre la arquitectura Qwen (etiquetada como qwen3_5 en los metadatos) con 9.653.104.368 parámetros totales, que incluye un componente de visión (0.456B de pesos lógicos) y una cabeza MTP (Multi-Token Prediction, 0.243B). El checkpoint está empaquetado en formato MLX, lo que lo orienta al ecosistema de Apple Silicon.

El modelo resuelve el problema de ejecutar un modelo multimodal de ~9.6B parámetros en hardware con memoria unificada limitada. Mediante la herramienta oQ (oMLX v0.7.3) se aplica cuantización mixta: distintas capas y tensores reciben entre 2 y 8 bits según su sensibilidad, con una media efectiva de 4.123 bits por peso. El resultado ocupa 4.974 GB en disco (4.633 GiB de almacenamiento tensor), lo que permite cargarlo en equipos con 8-16 GB de memoria unificada.

La relevancia actual es doble: por un lado, demuestra técnicas de cuantización por debajo de 4 bits con distribución de precisión selectiva; por otro, incorpora una cabeza MTP que habilita decodificación especulativa multi-token, una innovación orientada a reducir la latencia de generación. No obstante, la información pública es escasa: no hay licencia declarada, ni idiomas, ni benchmarks, ni model card detallada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen, tag qwen3_5) con cabeza MTP y torre de visión |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit (group 64), 3-bit (group 64 y 128), 4-bit, 5-bit, 8-bit (group 64) y BF16; media efectiva 4.123 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX), librería mlx |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8.954B | 3.877 GB / 3.611 GiB |
| Visión | 0.456B | 0.912 GB / 0.849 GiB |
| Cabeza MTP | 0.243B | 0.185 GB / 0.172 GiB |
| **Total** | **9.653B** | **4.974 GB / 4.633 GiB** |

Distribución de precisión por tensor:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 2-bit, group 64 | 2.064B | 21.378% | 0.601 GiB | 2.50 |
| Affine 3-bit, group 128 | 4.452B | 46.116% | 1.684 GiB | 3.25 |
| Affine 3-bit, group 64 | 1.017B | 10.537% | 0.414 GiB | 3.50 |
| Affine 4-bit, group 64 | 0.210B | 2.173% | 0.110 GiB | 4.50 |
| Affine 5-bit, group 64 | 1.420B | 14.708% | 0.909 GiB | 5.50 |
| Affine 8-bit, group 64 | 0.001B | 0.007% | 0.001 GiB | 8.50 |
| BF16 | 0.491B | 5.083% | 0.914 GiB | 16.00 |
| **Total** | **9.653B** | **100%** | **4.633 GiB** | **4.123** |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen (el tag del repositorio indica qwen3_5), con 8.954B parámetros en el modelo de lenguaje, una torre de visión de 0.456B y una cabeza MTP de 0.243B. La presencia de una cabeza MTP (Multi-Token Prediction) implica que el modelo fue entrenado para predecir varios tokens futuros simultáneamente, lo que permite decodificación especulativa auto-generada y, en teoría, mayor throughput por paso de decodificación. El componente de visión confirma que el modelo base es multimodal (entrada de imágenes además de texto).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o destilación específica (el nombre "Distill" sugiere destilación desde un modelo mayor, presumiblemente MiMo-V2.6, pero no hay documentación pública que lo confirme). La innovación técnica verificable es la cuantización mixta de oQ: la mayor parte de los pesos (46.116%) se almacena en 3-bit group 128, un 21.378% cae a 2-bit group 64, y solo un 5.083% se mantiene en BF16 (probablemente embeddings, capas de normalización y tensores sensibles). Esta asignación selectiva busca preservar la calidad en las capas críticas mientras comprime agresivamente el resto.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen destilado; sin datos públicos de benchmarks que las cuantifiquen.
- Procesamiento de imágenes: la torre de visión de 0.456B parámetros lógicos indica soporte multimodal de entrada visual.
- Decodificación multi-token: la cabeza MTP de 0.243B habilita predicción especulativa de varios tokens por paso, orientada a reducir latencia.
- Razonamiento multi-paso: presumible por la familia Qwen y la etiqueta "Distill", aunque no documentado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados en la model card).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX de 4.974 GB cabe en Macs con 16 GB de memoria unificada, permitiendo ejecutar un modelo multimodal de ~9.6B parámetros en un portátil sin GPU dedicada. Adecuado para prototipado y uso personal.
- Asistentes multimodales de escritorio: la torre de visión permite describir imágenes, extraer texto de capturas o responder preguntas sobre diagramas en aplicaciones locales, con la ventaja de que ningún dato sale del equipo.
- Generación de texto de baja latencia: la cabeza MTP permite decodificación especulativa, útil en aplicaciones interactivas (chat, autocompletado) donde el tiempo hasta el primer token y el throughput importan más que la calidad máxima absoluta.
- Evaluación de técnicas de cuantización: el modelo sirve como caso de estudio reproducible para investigadores que comparan distribuciones de bits mixtas (2/3/4/5/8/BF16) frente a cuantizaciones uniformes de 4 bits en términos de perplejidad y calidad de generación.
- Procesamiento de documentos con imágenes: combinando visión y contexto de texto, puede emplearse en pipelines locales de extracción de información de facturas, formularios o capturas, siempre que se valide la calidad tras la cuantización agresiva.
- Base para fine-tuning ligero: al ser un checkpoint MLX compacto, puede servir como punto de partida para LoRA o adaptadores en entornos con recursos limitados, aunque la cuantización mixta complica el entrenamiento directo y requeriría de-cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la distribución de bits y el tamaño de almacenamiento, sin métricas de calidad (MMLU, HumanEval, GSM8K, MMMU u otras) ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~5 GB solo para pesos; con overhead de runtime MLX y caché KV, se recomienda un mínimo de 8 GB y idealmente 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro/Max con 16 GB o más). El formato MLX no está pensado para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en cualquier Mac con 16 GB de memoria unificada; en configuraciones de 8 GB el margen es muy ajustado para contextos largos.
- Opciones de despliegue: MLX (librería nativa), mlx-lm para generación de texto; para el componente de visión se requiere mlx-vlm o equivalente. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión de formato.
- Latencia y throughput: no disponibles. La cabeza MTP debería mejorar el throughput frente a decodificación token a token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ2.7-mtp | 9.653B (8.954B LM + 0.456B visión + 0.243B MTP) | no disponible | Mixta 2-8 bits, media 4.123 | no disponible | safetensors MLX |
| bambocher/MiMo-V2.6-Distill-Qwen-9B (base) | 9.653B | no disponible | BF16 (presumible) | no disponible | safetensors |
| Qwen2.5-7B-Instruct (referencia de familia) | 7.6B | 32.768 tokens (versión estándar) | Múltiples (GGUF, AWQ, etc.) | Apache 2.0 (versión oficial) | safetensors, GGUF |
| Llama 3.1 8B Instruct (referencia de tamaño) | 8.0B | 128.000 tokens | Múltiples | Llama 3.1 Community License | safetensors, GGUF |

La comparación con Qwen2.5-7B y Llama 3.1 8B es orientativa por tamaño y categoría, no por linaje directo: el modelo aquí descrito es un derivado destilado de MiMo con componentes multimodales y MTP que esos modelos no tienen. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Verificar la licencia del modelo base (bambocher/MiMo-V2.6-Distill-Qwen-9B) antes de cualquier despliegue en producción.
- Degradación por cuantización: un 21.378% de los pesos está en 2-bit y un 46.116% en 3-bit; es esperable una pérdida de calidad frente al modelo base en tareas de razonamiento complejo, matemáticas y código, aunque no hay mediciones publicadas que la cuantifiquen.
- Riesgo de alucinación: inherente a los modelos de lenguaje destilados y agravado por la compresión agresiva; no hay evaluaciones de fidelidad factual.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano u otros idiomas distintos del inglés sin evaluación previa.
- Contexto desconocido: la longitud de contexto no está documentada, lo que impide planificar casos de uso con ventanas largas.
- Ecosistema restringido: el formato MLX limita el despliegue a Apple Silicon; no hay versiones GGUF ni compatibilidad con servidores de inferencia estándar.
- Soporte comunitario nulo: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- Fecha de creación futura en los metadatos (2026-11-13): inconsistencia que sugiere que los datos del repositorio deben tratarse con cautela.
- Componente MTP: su funcionamiento correcto depende del runtime MLX; en otros entornos la cabeza MTP quedaría inutilizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2.7-mtp
- Modelo base: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
