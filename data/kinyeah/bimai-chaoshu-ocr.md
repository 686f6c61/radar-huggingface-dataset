# kinyeah/BiMai-Chaoshu-OCR

## Resumen

BiMai-Chaoshu-OCR (筆脈) es un ajuste fino mediante LoRA del modelo visual-lingüístico Qwen3-VL-8B-Instruct, especializado en el reconocimiento de escritura cursiva vertical (草書 / 行草) en páginas de libros clásicos chinos y obras caligráficas. Lo publica el usuario kinyeah en Hugging Face como un conjunto de ficheros GGUF listos para llama.cpp: un modelo principal fusionado en Q4_K_M, un proyector visual en F16 y varios adaptadores LoRA en F16 que pueden cargarse en tiempo de ejecución. El problema que ataca es concreto: los OCR convencionales y los VLM generalistas fallan con columnas verticales de caligrafía cursiva, donde la segmentación de trazos, la variabilidad caligráfica y la ausencia de puntuación rompen los pipelines habituales.

La propuesta no es solo un modelo, sino un modelo más una disciplina de uso: la entrada debe ser un recorte de una sola columna vertical (de arriba abajo, con el lado corto a 300 px o más y el largo a 3200 px o menos) y la salida es una cadena continua de caracteres chinos sin puntuación. El autor reporta un CER (character error rate) del 28,7 % sobre un conjunto de validación limpio de 40 columnas, con una precisión de carácter del 71,3 %, y advierte que las columnas de cursiva muy libre (狂草) requieren corrección humana.

Es relevante ahora porque demuestra un patrón reproducible de especialización barata: QLoRA r16 sobre un VLM de 8B, corpus propio de ~2000 columnas y despliegue en una única GPU de consumo mediante cuantización Q4_K_M. Frente a entrenar un OCR desde cero, el autor reutiliza las capacidades del modelo base y solo desplaza la distribución hacia un dominio muy estrecho, algo útil para proyectos de digitalización de patrimonio con presupuestos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visual-lingüístico (Qwen3-VL) con adaptador LoRA r16 fusionado en el GGUF principal |
| Parámetros totales | 8B en el modelo base Qwen3-VL-8B-Instruct; el safetensors del repo declara 87.293.952 parámetros, coherente con el tamaño de un adaptador LoRA, no con el modelo completo |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible para el modelo base en la información proporcionada; los ejemplos de despliegue del autor fijan `--ctx-size 8192` |
| Tipos de cuantización | GGUF Q4_K_M (modelo fusionado), F16 (adaptadores LoRA y proyector visual) |
| Idiomas soportados | zh, en (la tarea de salida es exclusivamente chino tradicional sin puntuación) |
| Licencia | apache-2.0, heredada del modelo base Qwen3-VL; el autor indica que se rige por los términos del modelo base |
| Formato de pesos | GGUF (llama.cpp); adaptadores LoRA en GGUF F16; proyector multimodal `mmproj` en F16 separado |

Otros datos del repositorio: tamaño total de 6,4 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 26 de octubre de 2026 y actualizado el mismo día. El pipeline de Hugging Face no está declarado.

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imágenes mediante un proyector visual y las integra como tokens en el contexto del decodificador. El ajuste se realizó con QLoRA de rango 16 sobre la versión del base cuantizada en 4 bits (`unsloth/Qwen3-VL-8B-Instruct-unsloth-bnb-4bit`), con un learning rate de 1e-5 a 2e-5 y 2 épocas. Posteriormente, el adaptador se fusionó con los pesos del base para producir el GGUF `caoshu-v8-merged-Q4_K_M.gguf`; los adaptadores v8, v13 y v14 se distribuyen también por separado para cargarlos con `--lora` en tiempo de ejecución, lo que permite intercambiar versiones sin volver a descargar el modelo completo.

El corpus de entrenamiento es propio y muy específico: 971 columnas de caligrafía clásica con transcripción oficial (procedentes de obras maestras caligráficas del Museo del Palacio), 244 columnas verificadas mediante un proceso de doble revisión y compuerta de calidad a partir de escaneos de colecciones privadas, y lotes posteriores de minería profunda en el mismo dominio que elevan el total por encima de las 2140 filas en la versión v14. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO; el ajuste es supervisado sobre pares imagen-transcripción. La innovación destacable no es arquitectónica sino de proceso: el autor reporta descontaminación del conjunto de evaluación, ampliación iterativa del dominio y una comparación explícita entre generaciones (v8, v13, v14) y una prueba con un modelo de 32B descartada por sobreajuste (CER 44,4 %).

## Capacidades

- Reconocimiento de caracteres chinos en columnas verticales de caligrafía cursiva y semicursiva (草書, 行草), con salida en chino tradicional y sin puntuación.
- Transcripción de una columna por inferencia dentro de un pipeline de detección de columnas (BiMai), pensado para páginas de libros clásicos y álbumes caligráficos.
- Lectura de imágenes con recortes de al menos 300 px en el lado corto y hasta 3200 px en el lado largo.
- Capacidades heredadas del VLM base (descripción de imagen, respuesta a preguntas visuales, comprensión de chino e inglés), aunque no están validadas tras el ajuste y el prompt de entrenamiento restringe la salida a transcripción literal.
- Multilingüismo limitado: el modelo declara zh y en, pero el uso previsto y el corpus son exclusivamente chinos; no hay soporte documentado para otras escrituras ni para alfabetos latinos.
- Instrucción anti-alucinación explícita en el prompt: solo transcribir los trazos visibles y detenerse cuando el carácter no sea legible.
- Tool calling y razonamiento multi-paso: no documentados ni validados en esta ficha; el ajuste está orientado a una tarea de un solo paso.
- Modo thinking: no disponible; el base es la variante Instruct.

## Casos de uso

- Digitalización de fondos caligráficos en bibliotecas y museos: el modelo procesa recortes de columna individuales, de modo que puede encadenarse tras un detector de líneas verticales para convertir un álbum completo en texto plano revisable, con un CER de referencia del 28,7 % que hace obligatoria la corrección humana.
- Investigación filológica y edición de textos clásicos: un investigador puede obtener una primera transcripción de un manuscrito cursivo y corregirla, reduciendo el tiempo frente a la transcripción manual, siempre que la obra esté en el dominio de caligrafía china vertical.
- Creación de corpus imagen-texto alineados: las transcripciones generadas y luego verificadas sirven para entrenar o evaluar otros modelos de OCR histórico, un caso especialmente útil porque el propio autor documenta su metodología de descontaminación.
- Catalogación de colecciones privadas y archivos familiares: cartas, documentos y hojas sueltas en cursiva pueden pasarse por el pipeline con el adaptador v14 cargado en runtime, ajustando el adaptador según el estilo del fondo.
- Indexación y búsqueda de texto completo en archivos digitalizados: una vez transcritas las columnas, el texto puede alimentar un índice de búsqueda; la naturaleza sin puntuación de la salida no supone un problema para un motor de búsqueda por caracteres.
- Docencia y estudio de caligrafía: el modelo permite comparar la lectura automática de un fragmento con la interpretación del estudiante, señalando qué columnas son lo bastante legibles como para que coincidan (el autor reporta 76-100 % de precisión en semicursiva cuidada).
- Despliegue en estaciones de trabajo sin conexión: al ser GGUF y ejecutarse con llama.cpp, encaja en entornos con requisitos de confidencialidad donde no se puede enviar material a una API externa.

## Benchmarks y rendimiento

Resultados reportados por el autor (26 de octubre de 2026, inferencia con llama.cpp, evaluación por columna mediante LCS):

| Versión | CER en gold_test40 sin contaminación | Filas de entrenamiento |
|---|---|---|
| v8 (LoRA en runtime) | 34,7 % | 971 + 244 |
| v13 | 29,6 % | 1965 (descontaminado ×2 + 120 recortes de columna) |
| v14 (con 300 columnas adicionales de minería profunda) | 28,7 % | 2140+ (en ampliación) |
| Prueba con 32B (descartada por sobreajuste) | 44,4 % | no disponible |
| Demo de tres páginas reales | v8 31,1 % · v13 33,3 % · v14 32,6 % | n = 132, con filtración parcial |

Precisión de carácter en el conjunto limpio: 71,3 %. En columnas de semicursiva cuidada y caracteres frecuentes el autor reporta entre 76 % y 100 % de precisión. No se han publicado resultados en benchmarks estándar de OCR (OCRBench, MMLU, HumanEval, GSM8K) en la información disponible, por lo que no es posible comparar con la tabla pública de OCRBench.

## Requisitos de hardware

- VRAM estimada para el modelo fusionado: aproximadamente 5,8 GB solo de pesos (4,7 GB del Q4_K_M más 1,1 GB del `mmproj` F16); con caché KV a 8192 tokens, el consumo realista se sitúa en el entorno de 7-9 GB (estimación, no medida publicada).
- VRAM estimada en modo runtime LoRA: base Qwen3-VL-8B en Q4_K_M (del orden de 5 GB) más el `mmproj` de 1,1 GB más el adaptador (87-174 MB), con un total similar al del modelo fusionado.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB y RTX 4090 24 GB; cabe en tarjetas de 8 GB solo con contexto reducido y cuantizaciones más agresivas no publicadas por el autor.
- GPU de datacenter: A100 40/80 GB y H100 para procesamiento por lotes con contexto largo o para servir varias instancias en paralelo; el modelo no necesita ese hardware para inferencia individual.
- Despliegue: llama.cpp mediante `llama-server` con `--jinja`, `--ctx-size 8192`, `--mmproj` y, opcionalmente, `--lora`. Al ser GGUF, puede importarse en Ollama o en otras herramientas compatibles con llama.cpp. No se documenta soporte para vLLM o TGI con estos adaptadores en formato GGUF.
- Latencia y throughput: no disponibles. Conviene tener en cuenta que el pipeline procesa una columna por inferencia, por lo que el coste por página es proporcional al número de columnas detectadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Formato disponible | Licencia |
|---|---|---|---|---|---|
| BiMai-Chaoshu-OCR | 8B (base) | no disponible (ejemplos a 8192) | OCR de caligrafía cursiva vertical china | GGUF + LoRA GGUF | apache-2.0 |
| Qwen3-VL-8B-Instruct | 8B | no disponible en la información | VLM generalista, sin especialización caligráfica | safetensors, GGUF (unsloth) | apache-2.0 |
| PaddleOCR-VL | no disponible | no disponible | OCR de documentos, tablas y fórmulas | no disponible | no disponible |
| DeepSeek-OCR | no disponible | no disponible | OCR de documentos y parseo de largo alcance | no disponible | no disponible |
| Baidu Unlimited-OCR | no disponible | no disponible | Parseo de documentos de horizonte largo | no disponible | no disponible |

La comparación cuantitativa no es posible con los datos disponibles: las alternativas citadas aparecen en la búsqueda web como referencias del ecosistema OCR, pero sin especificaciones verificables en la información proporcionada. La diferencia cualitativa es clara: los modelos generalistas y los OCR de documentos están optimizados para texto impreso, tablas y fórmulas en disposición horizontal, mientras que BiMai-Chaoshu-OCR se limita a columnas verticales manuscritas y no compite en documentos impresos.

## Limitaciones y advertencias

- La cursiva muy libre (狂草), los calcos (拓本) y las anotaciones interlineales de doble línea se describen como inestables en la propia model card.
- Las páginas impresas de libros clásicos quedan fuera del dominio de entrenamiento: el modelo puede usarse, pero no está especializado en ellas.
- El CER del 28,7 % implica que aproximadamente uno de cada tres o cuatro caracteres puede ser erróneo en el conjunto de evaluación; toda transcripción requiere corrección humana antes de usarse como fuente.
- Riesgo específico de alucinación por memorización: el modelo podría recitar poemas o pasajes famosos en lugar de leer los trazos; el prompt de entrenamiento lo prohíbe explícitamente, pero el riesgo persiste y debe reforzarse en producción.
- Solo acepta un recorte de columna por inferencia y no devuelve puntuación; el orden de lectura, la segmentación de columnas y la reconstrucción de la página corren a cargo del pipeline externo.
- Idiomas: únicamente chino (y inglés declarado); no hay soporte para escrituras latinas, árabes ni otras grafías históricas.
- Sesgo de dominio: el corpus procede de obras maestras del Museo del Palacio y de escaneos de colecciones privadas, por lo que el rendimiento puede degradarse con manos, estilos o soportes distintos.
- Validación externa inexistente: 0 descargas y 0 likes en el momento de la consulta, sin resultados en benchmarks estándar ni réplica independiente de las cifras reportadas.
- Licencia: apache-2.0 heredada del base Qwen3-VL, pero el autor remite a los términos del modelo base; conviene revisar dichos términos antes de un uso comercial a gran escala.
- Fechas y versiones: el repositorio se creó y actualizó el 26 de octubre de 2026 y el autor indica que el corpus sigue ampliándose, por lo que las versiones y los CER pueden cambiar sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinyeah/BiMai-Chaoshu-OCR
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- GGUF del base citado por el autor: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- Baidu Unlimited-OCR (referencia del ecosistema OCR): https://github.com/baidu/Unlimited-OCR
- OCRBench Leaderboard (referencia de evaluación OCR): https://llm-stats.com/benchmarks/ocrbench
- Guía comparativa de modelos OCR (referencia externa): https://local-ai-zone.github.io/guides/best-ai-ocr-models-ultimate-ranking-2026.html
- Glosario sobre modelos OCR (referencia externa): https://www.llamaindex.ai/glossary/what-are-ai-ocr-models
