# AmareshHebbar/Stretch32K_TinyLlama_1.1B_SFT

## Resumen

Stretch32K_TinyLlama_1.1B_SFT es un ajuste fino supervisado (SFT) del modelo Stretch32K_TinyLlama_1.1B_YARN, desarrollado por AmareshHebbar. Parte de TinyLlama v1.1, un transformer decoder-only de 1.100.048.384 parámetros entrenado originalmente con una ventana de 2.048 tokens, y lo extiende hasta 16.384 tokens mediante un factor de escalado RoPE de 8x combinado con ajuste fino sobre instrucciones de documentos largos (LongAlpaca). Forma parte de la colección Stretch32K, compuesta por seis modelos que aplican distintas técnicas de extensión de contexto sobre los mismos fragmentos de PG19 y se evalúan con las mismas pruebas.

El problema que aborda es la degradación severa del rendimiento de TinyLlama más allá de su ventana nativa: sin escalado, la perplejidad en PG19 salta de 12,46 a 2.048 tokens hasta 3.721,80 a 16.384 tokens, y la precisión en passkey cae a cero más allá de 2.048. Este SFT consigue una perplejidad de 13,27 a 16.384 tokens y una puntuación agregada "long score" de 62,4, la más alta de la colección, además de la menor NLL en respuestas a preguntas sobre documentos largos (1,404).

Su relevancia es doble: demuestra que es posible extender el contexto de un modelo de 1,1B entrenando en una única GPU, y lo hace sobre un modelo base con licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), con RoPE escalado tipo YaRN |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (8x sobre los 2.048 nativos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; al ser Llama es compatible con GGUF/AWQ/GPTQ via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de TinyLlama v1.1: un transformer decoder-only estilo Llama con atención causal, RMSNorm y SwiGLU, de aproximadamente 1,1B parámetros. La extensión de contexto se logra mediante RoPE scaling tipo YaRN con `factor: 8.0`, `original_max_position_embeddings: 2048` y `rope_theta: 10000.0`, heredado del modelo base YARN. Sobre esa base, este checkpoint aplica un ajuste fino supervisado completo (no LoRA) sobre LongAlpaca, un conjunto de instrucciones sobre documentos largos, para que el modelo responda preguntas sobre entradas extensas en lugar de limitarse a leerlas.

Los hiperparámetros de entrenamiento documentados son: learning rate 1e-05, 1 época, gradient accumulation de 8, 5 pasos de warmup, 600 ejemplos de entrenamiento y 30 de validación. Para hacer viable el entrenamiento en una sola GPU se emplearon kernels FlashAttention de PyTorch, gradient checkpointing, pérdida por chunks sobre el vocabulario y empaquetado de secuencias sin padding. El dataset de entrenamiento es AmareshHebbar/Stretch32K_Data_TinyLlama_1.1B, construido a partir de fragmentos de PG19.

## Capacidades

- Generación de texto en inglés con ventana efectiva de 16.384 tokens.
- Lectura y respuesta a preguntas sobre documentos largos (libros, contratos, informes) gracias al ajuste sobre LongAlpaca.
- Recuperación de información tipo passkey y needle-in-a-haystack dentro de la ventana extendida, con rendimiento desigual según la tarea (ver benchmarks).
- Razonamiento básico sobre múltiples claves y valores (multikey, multivalue), con precisión limitada.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente, visión, audio ni thinking mode documentadas.
- Multilingüe: no; solo inglés según la model card.

## Casos de uso

- Preguntas y respuestas sobre documentos largos: el ajuste sobre LongAlpaca permite introducir un contrato o informe de hasta 16.384 tokens y formular preguntas directas, con una NLL de respuesta de 1,404, la mejor de la colección Stretch32K.
- Resumen de capítulos o secciones extensas: al mantener la perplejidad estable entre 1.024 y 16.384 tokens (11,88 a 13,27), el modelo puede procesar textos completos sin el colapso que sufre TinyLlama sin escalado.
- Clasificación y extracción de entidades en documentos largos: útil en pipelines de procesamiento documental donde el coste por token es crítico y un modelo de 1,1B cabe en una GPU de consumo.
- Prototipado e investigación sobre extensión de contexto: sirve como referencia reproducible para comparar técnicas de RoPE scaling (PI, NTK, YaRN, dynamic NTK) sobre un mismo base y dataset.
- Despliegue en entornos con recursos limitados: al ocupar aproximadamente 2,2 GB en fp16, puede ejecutarse en GPUs de gama media o incluso en CPU con cuantización, para tareas de lectura de contexto largo de baja latencia.
- Filtrado y moderación de contenido en textos largos: permite analizar un documento completo en una sola pasada en lugar de trocearlo con recuperación, reduciendo la pérdida de contexto entre fragmentos.
- Evaluación comparativa de retrievers frente a contexto largo: sirve como baseline para medir si la recuperación (RAG) supera a la ventana extendida en tareas concretas sobre corpus de hasta 16K tokens.

## Benchmarks y rendimiento

Resultados publicados en la model card. Perplejidad medida en PG19; passkey oculta una clave de cinco dígitos; needle oculta un número de siete dígitos en texto real; RULER incluye múltiples claves, valores y seguimiento de variables; long score es la media de passkey, needle y RULER.

| Modelo | PPL @ 1024 | PPL @ 16384 | Passkey (todas) | Passkey >2048 | Needle (media) | RULER | Long score | LongAlpaca NLL |
|---|---|---|---|---|---|---|---|---|
| TinyLlama 1.1B (sin escalado) | 10,96 | 3721,80 | 40,0 | 0,0 | 32,0 | 18,3 | 30,1 | 8,384 |
| TinyLlama (position interpolation, sin entrenar) | 216,36 | 235,46 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 5,524 |
| TinyLlama (NTK aware, sin entrenar) | 12,28 | 175,63 | 70,0 | 50,0 | 52,0 | 15,6 | 45,9 | 3,930 |
| TinyLlama (YaRN, sin entrenar) | 12,01 | 18,65 | 70,0 | 53,3 | 50,0 | 11,4 | 43,8 | 2,286 |
| TinyLlama (dynamic NTK, sin entrenar) | 10,96 | 68,38 | 66,0 | 43,3 | 46,0 | 23,3 | 45,1 | 4,172 |
| Stretch32K PI | 18,09 | 16,91 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 2,222 |
| Stretch32K YARN | 11,21 | 12,85 | 74,0 | 56,7 | 86,0 | 22,5 | 60,8 | 1,780 |
| Stretch32K YARN_LONGLORA | 11,53 | 14,04 | 76,0 | 60,0 | 66,0 | 21,4 | 54,5 | 1,955 |
| **Stretch32K SFT** | **11,88** | **13,27** | **72,0** | **53,3** | **92,0** | **23,3** | **62,4** | **1,404** |

Perplejidad por longitud de contexto:

| Modelo | 1024 | 2048 | 4096 | 8192 | 16384 |
|---|---|---|---|---|---|
| TinyLlama (sin escalado) | 10,96 | 12,46 | 391,10 | 2008,73 | 3721,80 |
| Stretch32K YARN | 11,21 | 12,84 | 12,81 | 13,04 | 12,85 |
| Stretch32K SFT | 11,88 | 13,43 | 13,29 | 13,48 | 13,27 |

Recuperación por longitud de contexto de este modelo:

| Tarea | 1024 | 2048 | 4096 | 8192 | 16384 |
|---|---|---|---|---|---|
| passkey | 100,0 | 100,0 | 70,0 | 90,0 | 0,0 |
| multikey | 50,0 | 75,0 | 0,0 | 25,0 | 0,0 |
| multivalue | 41,7 | 25,0 | 58,3 | 58,3 | 16,7 |
| vartrack | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en fp16 (tamaño del repo), unos 1,1 GB en int8 y en torno a 0,6-0,8 GB en cuantizaciones de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con margen para el KV cache; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en toda la gama RTX y en muchas GPUs integradas o de portátil con cuantización.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama mediante conversión a GGUF, y vLLM si se convierte el checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera throughput alto en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Stretch32K SFT (este) | 1,1B | 16.384 | Apache 2.0 | Mejor long score (62,4) y mejor NLL (1,404) de la colección |
| Stretch32K YARN | 1,1B | 16.384 | Apache 2.0 | Mejor perplejidad a 16K (12,85) y mejor passkey (74,0); sin ajuste a instrucciones |
| TinyLlama 1.1B (YaRN, sin entrenar) | 1,1B | 16.384 (por escalado) | Apache 2.0 | Sin entrenamiento adicional; passkey 70,0, needle 50,0, NLL 2,286 |
| TinyLlama 1.1B original | 1,1B | 2.048 | Apache 2.0 | Colapso más allá de 2K (PPL 3721,80 a 16K) |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- El rendimiento en recuperación decae con la longitud: passkey cae a 0,0 a 16.384 tokens, multikey a 0,0 a 4.096 y vartrack es 0,0 en todas las longitudes. No es fiable para tareas que exijan seguimiento de variables o múltiples claves en contextos muy largos.
- El ajuste sobre LongAlpaca (600 ejemplos) es reducido; puede sobreajustar al formato de instrucciones de ese dataset y generalizar peor a otros estilos de pregunta.
- Riesgo de alucinación inherente a un modelo de 1,1B: la capacidad de razonamiento y el conocimiento factual son limitados en comparación con modelos de mayor tamaño.
- La perplejidad a 1.024 tokens empeora ligeramente respecto al base YARN (11,88 frente a 11,21), por lo que en contextos cortos el ajuste SFT no aporta ventaja.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del dataset LongAlpaca y de PG19 para el caso concreto de producción.
- No hay datos publicados de tool calling, agentes ni despliegue en producción; validar antes de integrar en pipelines críticos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/AmareshHebbar/Stretch32K_TinyLlama_1.1B_SFT
- Modelo base (YARN): https://huggingface.co/AmareshHebbar/Stretch32K_TinyLlama_1.1B_YARN
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/Stretch32K_Data_TinyLlama_1.1B
- Colección Stretch32K: https://huggingface.co/collections/AmareshHebbar/stretch32k-6afa9bf23ce7e09c33854642
- TinyLlama v1.1: https://huggingface.co/TinyLlama/TinyLlama_v1.1
- Paper de YaRN: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
