# reaperdoesntknow/MoA-150M

## Resumen

MoA-150M (publicado también como MoA-Metric-LM-150M Convergent) es un modelo de lenguaje causal de aproximadamente 150 millones de parámetros desarrollado por el usuario de Hugging Face `reaperdoesntknow`. Su propuesta diferencial es sustituir la atención por producto escalar estándar por una atención "métrica" que puntúa las consultas y claves mediante distancias (L2, coseno o Mahalanobis diagonal), combinada con una variante de RoPE denominada BlackHoleRoPE y con un bloque Mixture-of-Architectures (MoA) que enruta cada token entre cuatro cabezas especializadas.

El modelo está diseñado explícitamente para entrenar y ejecutar en hardware modesto, con filosofía CPU-first y precisión FP32 sobre máquinas con AVX2/AVX-512. La longitud de contexto de entrenamiento se sitúa en 512-1024 tokens, aunque la configuración admite hasta 2048. Se distribuye bajo licencia Apache-2.0 y está orientado a investigación sobre sesgos inductivos geométricos y a asistentes compactos.

Su relevancia es fundamentalmente experimental: explora alternativas a la atención estándar en un rango de tamaño donde los experimentos son asequibles, y publica pesos entrenados con presupuestos de tokens reducidos (cientos de miles), lo que lo convierte en una referencia para estudiar atención basada en distancias más que en un modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención métrica (L2/coseno/Mahalanobis diagonal), bloque MoA con router por token (LocalConv, MetricMHAttention, ChannelMix, MetricMQA), BlackHoleRoPE y HyperFFN (SwiGLU + SepConv1d + camino de bajo rango) |
| Parametros totales | ~150 M (el conteo exacto depende del vocabulario; ver config.json) |
| Parametros activos | No aplica (no es MoE denso disperso; el bloque MoA enruta entre cabezas, no entre expertos FFN) |
| Longitud de contexto | Entrenado principalmente a 512-1024 tokens; la configuración permite hasta 2048 |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; inferencia soportada en FP32, BF16 y FP16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de transformers; tamaño del repo 2,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con 12-24 capas según variante (bloques MoA) y un mecanismo de atención que reemplaza el producto escalar por puntuaciones de distancia: L2 (`-||q-k||² / sqrt(d)`), coseno normalizado y Mahalanobis diagonal por cabeza. Los logits se escalan con un parámetro α aprendible y existe una máscara opcional de poda por radio. El camino de valores incorpora proyectores Up/Down con gating. La variante MetricMQA comparte proyecciones de clave y valor entre cabezas para reducir memoria y aumentar throughput.

BlackHoleRoPE aplica rotación unitaria solo a Q y K (preservando normas) y una amplificación de energía acotada en V (rango `energy_min..energy_max`), con parámetros sintetizados a partir de una base de Fourier pequeña, lo que reduce el tamaño de caché y busca generalización en longitud. El bloque MoA incluye un TokenRouter que mezcla suavemente cuatro cabezas por token (convolución local depthwise, atención métrica multi-cabeza, MLP de mezcla de canales y MQA métrica), gates multiplicativos por cabeza en (0, 2) y un sesgo de router opcional. Se añade un regularizador de desigualdad triangular sobre tripletas aleatorias para evitar geometrías métricas degeneradas.

El entrenamiento se realizó en CPU en FP32 con AdamW/Adam, batch 2-4 y secuencias de 512-1024, sobre presupuestos de tokens reducidos: aproximadamente 256k tokens de `WeMake/Intelligent-Content-Understanding`, 128k de `QingyiSi/Alpaca-CoT`, 256k de `HuggingFaceH4/MATH-500`, 128k de `zai-org/LongWriter-6k` y una fase de SFT sobre `prithivMLmods/Deepthink-Reasoning` con pérdida final reportada de 0,3200 sobre 128.512 tokens. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal en inglés con compatibilidad completa con la API de transformers (`AutoModelForCausalLM`, `pipeline`).
- Razonamiento matemático de estilo paso a paso, favorecido por el entrenamiento sobre MATH-500 y el conjunto de SFT de razonamiento.
- Escritura y generación de contenido largo, dado el uso de LongWriter-6k y DeepWriting-20K en el corpus.
- Comprensión de contenido y respuesta a preguntas sobre documentos, a partir de Intelligent-Content-Understanding.
- Seguimiento de instrucciones conversacionales básicas (Alpaca-CoT).
- Inferencia en CPU en FP32, BF16 y FP16, sin requisito de GPU.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación sobre atención basada en distancias: el modelo permite experimentar con puntuaciones L2, coseno y Mahalanobis y con el regularizador de desigualdad triangular en un tamaño (150 M) entrenable en una sola CPU, comparando estabilidad y eficiencia de muestra frente a atención por producto escalar.
- Prototipado de asistentes compactos en entornos sin GPU: al ejecutarse en FP32 sobre AVX2/AVX-512, sirve para validar pipelines de generación y de conversación multi-turno en portátiles o servidores sin acelerador.
- Razonamiento matemático elemental: con prompts de tipo "Reasoning:", el modelo produce cadenas de pasos para problemas aritméticos y algebraicos sencillos, útil en demos educativas y en la evaluación de técnicas de prompting.
- Generación de texto largo controlado: el entrenamiento con LongWriter-6k y DeepWriting-20K lo hace adecuado para experimentos de escritura estructurada y continuaciones de varios párrafos dentro de su ventana de 512-1024 tokens.
- Respuesta a preguntas sobre documentos cortos: su corpus de comprensión de contenido permite usarlo como extractor/resumidor en tareas de lectura de pasajes que quepan en contexto.
- Docencia y divulgación de arquitecturas alternativas: sirve como ejemplo ejecutable de MoA, MQA métrica y RoPE modificado en cursos y talleres, al caber en el repo de 2,5 GB y no requerir hardware especializado.
- Base para fine-tuning ligero: al ser Apache-2.0 y de tamaño reducido, es un punto de partida económico para SFT con TRL en dominios concretos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una pérdida final de SFT de 0,3200 sobre 128.512 tokens con el conjunto `prithivMLmods/Deepthink-Reasoning`, sin métricas de MMLU, HumanEval, GSM8K ni comparaciones estandarizadas.

## Requisitos de hardware

- VRAM estimada: en FP32, aproximadamente 0,6 GB solo para pesos (150 M × 4 bytes), más caché KV y activaciones; en BF16/FP16, alrededor de 0,3 GB para pesos. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no requiere GPU; funciona en CPU. Para inferencia acelerada, cualquier GPU con soporte de BF16/FP16 (RTX 3060 en adelante, A100, H100) es más que suficiente; el cuello de botella no será la memoria.
- Cabe en consumer GPU: sí, en todas las GPU modernas, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (con `accelerate` y `sentencepiece`), `pipeline` de transformers; el autor no documenta integración con vLLM, llama.cpp, Ollama ni TGI, y la atención métrica personalizada probablemente requiera código propio fuera de transformers.
- Latencia y throughput: no disponibles. El autor indica entrenamiento e inferencia en CPU en FP32 sobre AVX2/AVX-512, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoA-150M | ~150 M | 512-1024 (hasta 2048 en config) | Transformer con atención métrica + MoA + BlackHoleRoPE | Apache-2.0 | Hugging Face (transformers) |
| SmolLM2-135M | 135 M | 8192 | Transformer denso estándar | Apache-2.0 | Hugging Face, integrado en ecosistemas de inferencia |
| Qwen2.5-0.5B | 494 M | 32.768 | Transformer denso con GQA | Apache-2.0 | Hugging Face, vLLM, llama.cpp, Ollama |
| GPT-2 (124M) | 124 M | 1024 | Transformer denso | MIT | Hugging Face, ampliamente soportado |

La comparación cuantitativa de rendimiento no está disponible: MoA-150M no publica resultados de benchmarks, por lo que no puede contrastarse su calidad frente a SmolLM2-135M o Qwen2.5-0.5B. La diferencia principal es arquitectónica (atención métrica y enrutado MoA) y de ecosistema: los alternativos cuentan con soporte maduro en motores de inferencia y cuantización, mientras que MoA-150M depende de código transformers personalizado.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no está pensado para usos críticos de seguridad, QA factual a escala web ni dominios que exijan precisión garantizada.
- Riesgo elevado de alucinación: el entrenamiento usa presupuestos de tokens muy reducidos (cientos de miles) y una pérdida de SFT baja no implica robustez factual.
- Solo inglés; no hay soporte multilingüe documentado.
- Contexto efectivo limitado a 512-1024 tokens en entrenamiento; aunque BlackHoleRoPE es extrapolable, la calidad más allá de esas longitudes depende de los datos y el hardware, según el propio autor.
- El tamaño de 150 M limita capacidades de razonamiento complejo, matemáticas avanzadas y código; los casos de uso deben acotarse a tareas sencillas.
- La atención métrica y el bloque MoA son implementaciones personalizadas: la compatibilidad con motores de inferencia optimizados (vLLM, llama.cpp, TGI) y con cuantizaciones GGUF/AWQ no está documentada, lo que complica el despliegue en producción.
- El autor advierte de posibles NaN/Inf durante el muestreo si las máscaras no son aditivas (0/-inf); es necesario revisar el enmascaramiento y el recorte de logits.
- Licencia Apache-2.0: permite uso comercial, pero al no haber evaluación de sesgos ni de seguridad, cualquier despliegue comercial exige auditoría propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-150M
- Dataset WeMake/Intelligent-Content-Understanding: https://huggingface.co/datasets/WeMake/Intelligent-Content-Understanding
- Dataset QingyiSi/Alpaca-CoT: https://huggingface.co/datasets/QingyiSi/Alpaca-CoT
- Dataset HuggingFaceH4/MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset zai-org/LongWriter-6k: https://huggingface.co/datasets/zai-org/LongWriter-6k
- Dataset m-a-p/DeepWriting-20K: https://huggingface.co/datasets/m-a-p/DeepWriting-20K
- Dataset prithivMLmods/Deepthink-Reasoning (SFT): https://huggingface.co/datasets/prithivMLmods/Deepthink-Reasoning
- Repositorio TRL: https://github.com/huggingface/trl
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
