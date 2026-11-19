# Baekpica/Inkling-2-Small-VQ-GGUF

## Resumen

Inkling-2-Small-VQ-GGUF es una cuantización experimental del modelo multimodal Inkling-2-Small de Thinking Machines, publicada por el usuario Baekpica. El modelo original es un transformer de mezcla de expertos (MoE) con 594.000 millones de parámetros totales y 17.000 millones activos (384 expertos, top-8), capaz de procesar texto e imágenes y con una ventana de contexto nativa de 1.048.576 tokens. Esta versión no es una cuantización convencional: aplica cuantización vectorial (hVQ) de 12 bits por cada 8 pesos a los 587.070 millones de pesos de los expertos enrutados, comprimiéndolos a 1,5 bits por peso efectivos.

El resultado son 52 ficheros GGUF que suman 118.182.291.328 bytes (110,1 GiB), pensados para ejecutarse en una única DGX Spark (GB10) de 128 GB mediante el runtime propietario ds4-dfm-rs. El resto de componentes (atención, router, normas, torre de visión, embeddings) se mantienen en Q4_K, BF16 o F32 según el caso, y el drafter DSpark de decodificación especulativa se cuantiza a Q8_0.

Es relevante ahora porque demuestra que un MoE de casi 600.000 millones de parámetros puede servirse en hardware de escritorio profesional con pérdida de fidelidad medida pero acotada (KL 0,163 en posiciones generadas, mismo top-1 en el 88,1% de posiciones). La contrapartida es que el formato solo lo lee un runtime concreto: ni llama.cpp, ni Ollama, ni Transformers son compatibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + imagen), 48 capas, 384 expertos top-8 |
| Parámetros totales | 594.000 millones (modelo base); 5.728.287.744 según safetensors del repo de cuantización |
| Parámetros activos | 17.000 millones |
| Longitud de contexto | 1.048.576 tokens (nativo); K/V en NVFP4 residente hasta 262.144 posiciones, después en fichero SSD |
| Tipos de cuantización | Expertos enrutados: GVQ1 12-bit (hVQ, 1,5 bits/peso efectivos); atención y cabeza: Q4_K; drafter: Q8_0; router, normas, convoluciones, embeddings y torre de visión: BF16/F32 |
| Idiomas soportados | en, ko, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (52 partes independientes, no splits numerados) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 48 capas y 384 expertos por capa con enrutamiento top-8, del que se activan 17.000 millones de parámetros por token. Incorpora una torre de visión ViT de 23 capas con merger para entrada de imágenes, un drafter MTP (multi-token prediction) de 5 capas con cabeza de Markov para decodificación especulativa, y 8 capas de atención completa cuyas claves y valores se almacenan en NVFP4. La ventana de contexto nativa es de 1.048.576 tokens.

La innovación de esta ficha es el método hVQ (vector quantization con error feedback). Cada vector de 8 pesos de una fila de experto se representa como un índice de 12 bits en un libro de 4.096 palabras de código E4M3 por capa, multiplicado por una ganancia F16 por fila. Los códigos se asignan con realimentación de error a través de la correlación de entrada de cada experto. La calibración usó 3.620.637 tokens de texto (2.723 secuencias, 21 dominios) y 234 imágenes (162.819 tokens), con conjuntos de validación disjuntos. No se ha reentrenado ni aplicado RLHF/DPO adicional en esta versión: es una conversión del release MXFP8 de Thinking Machines en el commit `086a047e8b7ff2ac902dd52355328ddb66b16914`.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta texto e imágenes (pipeline image-text-to-text).
- Modo de pensamiento (thinking) y respuesta conversacional multi-turno.
- Tool calling y function calling, expuestos en las cuatro superficies de API del runtime ds4.
- Procesamiento de imágenes de hasta 4.096 píxeles por lado (10.609 tokens); lados mayores se reescalan a 4.096.
- Contexto largo real de hasta 1.048.576 tokens con gestión de K/V en NVFP4 y desalojo a SSD.
- Decodificación especulativa mediante drafter DSpark (MTP de 5 capas), que acelera la generación.
- Multilingüe limitado a inglés, coreano, chino y japonés.
- Verificación de integridad por SHA-256 de cada parte al cargar (`release.json`).

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: informes, patentes o expedientes de cientos de miles de tokens que caben en la ventana de 1.048.576 tokens sin trocear, con la torre de visión procesando figuras y tablas escaneadas.
- Asistente de código con contexto de repositorio completo: el modelo puede recibir árboles de proyecto y ficheros completos en una sola pasada, y usar tool calling para consultar APIs o ejecutar comandos en pipelines de CI/CD.
- Atención al cliente multilingüe (en/ko/zh/ja): conversaciones multi-turno con historial largo y adjuntos de imagen, aprovechando el contexto extendido para no perder el hilo.
- Procesamiento por lotes en una sola máquina: el despliegue en DGX Spark permite servir el modelo en local sin depender de la nube, útil para entornos con requisitos de soberanía de datos.
- Investigación sobre cuantización extrema: el propio repo sirve como referencia reproducible de hVQ a 1,5 bits/peso, con métricas de fidelidad (KL, top-1, NLL) y conjuntos de calibración documentados.
- Automatización de agentes con razonamiento multi-paso: el modo thinking y el soporte de herramientas permiten cadenas de planificación-ejecución sobre tareas de oficina o extracción de datos de documentos.
- Evaluación comparativa de fidelidad de cuantizaciones: útil para medir el impacto de esquemas de cuantización vectorial frente a cuantizaciones escalares convencionales en modelos MoE grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que "no task benchmark has been run".

Las métricas publicadas son de fidelidad de forward teacher-forced contra el modelo original MXFP8:

| Métrica | Referencia (original) | Esta cuantización |
|---|---|---|
| KL en posiciones generadas | — | 0,163 |
| Mismo top-1 que el original | — | 88,1% |
| NLL texto (held-out) | 0,849 | 0,987 |
| KL imágenes held-out | — | 0,088 |
| Mismo top-1 imágenes | — | 95,3% |
| NLL imágenes en DGX Spark | 0,688 | 0,699 |
| Top-1 texto en DGX Spark | — | 74,8% de posiciones generadas |

Rendimiento medido en DGX Spark (GB10) con ds4-dfm-rs, sin drafter: prefill de 1.248,1 tok/s y decodificación de 29,79 tok/s en el rango 2K–64K (mediciones del 15 de noviembre).

## Requisitos de hardware

- VRAM/disco: 110,1 GiB de pesos en 52 ficheros; requiere al menos 128 GB de memoria unificada o VRAM. En DGX Spark (GB10) los expertos y el cuerpo no-experto residen en dispositivo; los embeddings de tokens se leen desde SSD (una fila de 9.216 bytes por token).
- GPU recomendadas: DGX Spark (GB10) es el objetivo validado. No hay datos publicados de funcionamiento en A100, H100 o RTX 4090; por tamaño, no cabe en ninguna GPU consumer de 24–48 GB.
- Contexto largo: el K/V en NVFP4 es residente hasta 262.144 posiciones; más allá se usa un fichero en SSD, lo que añade latencia de E/S.
- Despliegue: exclusivamente mediante ds4-dfm-rs (rama `main`, PRs #151, #152, #153) sobre CUDA. llama.cpp, Ollama y Transformers no leen este formato.
- Latencia y throughput: 1.248,1 tok/s de prefill y 29,79 tok/s de decodificación en GB10 sin drafter; el autor menciona mediciones separadas con DSpark pero no las detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Inkling-2-Small-VQ-GGUF (esta ficha) | 594B | 17B | 1.048.576 | Apache 2.0 | GGUF hVQ, solo ds4-dfm-rs |
| Inkling-2-Small-MXFP8 (original) | 594B | 17B | 1.048.576 | Apache 2.0 | MXFP8, ecosistema estándar |
| DeepSeek V4.1 hVQ (referencia del método) | no disponible | no disponible | no disponible | no disponible | GGUF hVQ, ds4-dfm-rs |

No se dispone de datos de benchmarks de tareas para ninguno de los modelos comparados en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- Release experimental de bajo bit: los expertos enrutados se almacenan a 1,5 bits por peso; la fidelidad medida es de forward teacher-forced, y la generación muestreada solo se comprobó en un conjunto pequeño con semilla. No hay benchmarks de tareas.
- Degradación medible: NLL de texto sube de 0,849 a 0,987 y solo el 88,1% de posiciones generadas coincide en top-1 con el original; en texto servido en GB10 el top-1 baja al 74,8%.
- Compatibilidad muy restringida: solo funciona con ds4-dfm-rs; no es utilizable en llama.cpp, Ollama, Transformers, vLLM ni TGI.
- Requiere hardware específico (DGX Spark / GB10) y 110 GiB de almacenamiento; el contexto más allá de 262.144 posiciones depende de un fichero SSD, con la latencia que ello implica.
- Idiomas limitados a inglés, coreano, chino y japonés; no hay soporte declarado de castellano.
- Riesgo de alucinación inherente al modelo base, agravado por la pérdida de fidelidad de la cuantización; no se han publicado evaluaciones de sesgo.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base de Thinking Machines antes de un uso comercial en producción.
- El autor advierte que ante salidas extrañas se reporte el prompt, los parámetros de muestreo y el commit del runtime en la pestaña Community.

## Enlaces

- Hugging Face: https://huggingface.co/Baekpica/Inkling-2-Small-VQ-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Release MXFP8 de origen: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8/tree/086a047e8b7ff2ac902dd52355328ddb66b16914
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- PR #151: https://github.com/Baekpica/ds4-dfm-rs/pull/151
- PR #152: https://github.com/Baekpica/ds4-dfm-rs/pull/152
- PR #153: https://github.com/Baekpica/ds4-dfm-rs/pull/153
- Release de referencia del método hVQ (DeepSeek V4.1): https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF
- Discusiones: https://huggingface.co/Baekpica/Inkling-2-Small-VQ-GGUF/discussions
