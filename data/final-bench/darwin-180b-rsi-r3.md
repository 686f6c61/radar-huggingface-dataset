# FINAL-Bench/Darwin-180B-RSI-R3

## Resumen

Darwin-180B-RSI-R3 es un modelo de lenguaje multimodal (texto e imagen) de tipo Mixture-of-Experts desarrollado por VIDRAFT y publicado en Hugging Face bajo la organización FINAL-Bench. Con 179.999.981.459 parámetros totales y una arquitectura MoE de 512 expertos con atención híbrida (lineal y completa), está diseñado para razonamiento de largo alcance, extracción estructurada de documentos y tareas de razonamiento matemático y científico. Su ventana de contexto alcanza los 262.000 tokens y su linaje parte de Qwen3.8-Flash-Next, del que hereda las capas de expertos mientras reconstruye atención y expertos compartidos mediante un proceso de auto-mejora recursiva (RSI, *recursive self-improvement*).

El modelo se posiciona como un sistema de razonamiento con modo *thinking*, salida estructurada y soporte de tool calling, orientado a pipelines de agentes y extracción documental. Según la model card, R3 lidera el leaderboard de ExtractBench con 90.29 y ocupa el tercer puesto en EvasionBench con 77.83; la línea Darwin-180B-RSI acumula diez primeros puestos oficiales en Hugging Face, nueve de ellos de la revisión R1.

La relevancia actual del modelo radica en tres factores: su condición de pesos abiertos en una categoría dominada por modelos propietarios, su especialización en extracción estructurada y razonamiento verificable, y la disponibilidad de una cuantización GGUF de 4 bits (POCKET-Darwin-180B-GGUF, 111 GB) que permite ejecución en hardware de consumo. La licencia es `qwen-community-1.0`, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atención híbrida (lineal + completa); vision-language |
| Parametros totales | 179.999.981.459 (≈180B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16 (pesos originales); GGUF 4 bits (POCKET-Darwin-180B-GGUF, 111 GB) |
| Idiomas soportados | en, ko, zh, ja, multilingual (coreano e inglés como idiomas principales) |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (repo de 360 GB); GGUF disponible en repo separado |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Expertos | 512 (MoE disperso) |
| Compatibilidad de despliegue | vLLM, API compatible con OpenAI |

## Arquitectura y entrenamiento

Darwin-180B-RSI-R3 es un transformer de mezcla de expertos dispersa con 512 expertos y atención híbrida que combina capas de atención lineal con capas de atención completa, una elección habitual para sostener contextos de 262K tokens sin un coste cuadrático prohibitivo. El modelo es multimodal: procesa imagen y texto en un pipeline `image-text-to-text`. La model card indica que hereda las capas de expertos de Qwen3.8-Flash-Next y reconstruye únicamente las capas de atención y los expertos compartidos mediante un proceso de auto-mejora recursiva (RSI), una técnica que la organización denomina *model-level RSI*. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación declarada por el autor es doble: por un lado, el ciclo de auto-mejora recursiva que regenera componentes del modelo a partir de evaluaciones propias; por otro, la incorporación de ZTC (*zero-token-confidence*), un mecanismo de confianza sin tokens asociado a la salida estructurada y a la extracción documental. La model card también menciona soporte de modo *thinking* y salida estructurada como capacidades de primera clase. No se han publicado en la información proporcionada detalles sobre decodificación especulativa, composición del corpus de preentrenamiento ni recetas de alineación.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo *thinking* explícito.
- Razonamiento matemático y científico de alto rendimiento (según SuperCLUE Nov 2026 y benchmarks propios de la línea R1).
- Comprensión de imagen y texto (pipeline `image-text-to-text`), incluyendo documentos, gráficos y capturas.
- Extracción estructurada de documentos: liderazgo declarado en ExtractBench (90.29).
- Salida estructurada con mecanismo ZTC (*zero-token-confidence*) para señalar confianza en extracciones.
- Soporte de tool calling y function calling, con endpoints compatibles con la API de OpenAI.
- Capacidad de agentes y razonamiento multi-paso.
- Multilingüe con foco en coreano, inglés, chino y japonés.
- Contexto largo de 262K tokens para documentos extensos y conversaciones multi-turno.
- Despliegue en vLLM y en entornos de consumo mediante GGUF de 4 bits.

## Casos de uso

- Extracción estructurada de documentos: el modelo convierte facturas, contratos e informes en JSON validado aprovechando su liderazgo en ExtractBench y el mecanismo ZTC para marcar campos de baja confianza antes de enviarlos a revisión humana.
- Automatización de back-office legal y financiero: con 262K tokens de contexto puede procesar expedientes completos y responder preguntas de razonamiento sobre cláusulas, importes y fechas en una sola pasada.
- Agentes de atención al cliente multi-turno: el soporte de tool calling y la compatibilidad con la API de OpenAI permiten integrarlo en orquestadores existentes para consultar sistemas internos y mantener conversaciones largas.
- Análisis de documentos con imágenes: al ser vision-language, puede leer capturas, escaneos y tablas en imagen y extraer datos tabulares sin un OCR separado.
- Razonamiento matemático y científico asistido: adecuado para tutores, validación de cálculos y generación de explicaciones paso a paso en dominios STEM, respaldado por sus resultados en SuperCLUE y benchmarks de matemáticas.
- Generación de código y pipelines de CI/CD: el soporte de function calling permite integrarlo en herramientas que consultan APIs, ejecutan tests y proponen parches dentro de un flujo automatizado.
- Despliegue en entornos con hardware limitado: la variante GGUF de 4 bits (111 GB) permite ejecutar el modelo en un mini PC de 128 GB o en un portátil con 8 GB de GPU y 32 GB de RAM a 18–21 tok/s en CPU, útil para prototipos y entornos air-gapped.
- Moderación y detección de evasión: su tercer puesto en EvasionBench (77.83) lo hace apto para clasificar intentos de elusión de políticas en contenido generado por usuarios.

## Benchmarks y rendimiento

Resultados publicados en la model card (no verificados de forma independiente por el editor de esta ficha):

| Benchmark | Darwin-180B-RSI-R3 | Referencia / comparativa |
|---|---|---|
| ExtractBench | 90.29 (#1) | Qwen3.8-Flash-Next: 89.88 |
| EvasionBench | 77.83 (#3) | no disponible |
| SuperCLUE Nov 2026, matemáticas y ciencia | 73.68 (#1 open-weight, #2 global) | GPT-6.1-Sol: 76.32; Gemini-4-Argon: 71.05; DeepSeek-V4.1-Flash: 71.05; Qwen3.8-Flash: 57.89 |
| SuperCLUE Nov 2026, índice global | 43.08 (9.º de 19; 5.º open-weight) | Qwen3.8-Flash: 39.81 (15.º) |
| MMLU-Pro (R1) | 88.12% (#1) | no disponible |
| GPQA Diamond (R1) | 94.44% (#1) | no disponible |
| MMMU-Pro (R1) | 79.48% (#1) | no disponible |
| AIME 2026 (R1) | 100% (#1) | no disponible |
| HMMT Feb 2026 (R1) | 100% (#1) | no disponible |
| LEXam (R1) | 68.94% (#1) | no disponible |
| LEXam-hard (R1) | 45.72 (#1) | no disponible |
| IFStruct (R1) | 98.95% (#1) | no disponible |
| MDPBench (R1) | 83.65 (#1) | no disponible |
| MMLU-Pro (R3, GGUF 4 bits) | 87.65% (idéntico a BF16) | no disponible |

Los resultados marcados como R1 corresponden a la revisión anterior de la línea y no a R3; se incluyen porque la model card los presenta como parte del historial de la familia. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni benchmarks de código para R3.

## Requisitos de hardware

- Pesos BF16: repositorio de 360 GB; inferencia requiere aproximadamente 360 GB de VRAM o memoria unificada, lo que implica nodos multi-GPU (por ejemplo, 8×H100 80 GB o 4×A100 80 GB con paralelismo de tensor).
- Cuantización GGUF de 4 bits: 111 GB; ejecutable en un mini PC de 128 GB, una DGX Spark o un portátil con 8 GB de GPU y 32 GB de RAM.
- Rendimiento en CPU con GGUF 4 bits: 18–21 tokens por segundo, según la model card.
- GPU recomendadas: H100, A100 o H200 para BF16; consumer GPU viable solo con la variante GGUF y descarga parcial a CPU.
- Despliegue: vLLM (soportado explícitamente), llama.cpp/Ollama para GGUF, y endpoints compatibles con la API de OpenAI.
- Latencia y throughput en BF16: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parámetros | Contexto | Licencia | Pesos abiertos | Nota |
|---|---|---|---|---|---|---|
| Darwin-180B-RSI-R3 | VIDRAFT / FINAL-Bench | 180B (MoE, 512 expertos) | 262K | qwen-community-1.0 | Sí | #1 ExtractBench (90.29); 73.68 en SuperCLUE math & science |
| Qwen3.8-Flash-Next | Alibaba | no disponible | no disponible | no disponible | Sí | Modelo padre; 89.88 en ExtractBench y 57.89 en SuperCLUE math & science |
| DeepSeek-V4.1-Flash | DeepSeek | no disponible | no disponible | no disponible | Sí | 71.05 en SuperCLUE math & science |
| GLM-5.3 | Zhipu AI | no disponible | no disponible | no disponible | Sí | 65.79 en SuperCLUE math & science |
| Kimi-K3.1-Pro | Moonshot | no disponible | no disponible | no disponible | Sí | 63.16 en SuperCLUE math & science |

La comparativa se limita a los datos publicados en la model card; no se dispone de parámetros, contexto ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre corpus multilingües de gran escala es previsible un sesgo cultural y lingüístico hacia las lenguas dominantes del dataset (inglés, chino, coreano).
- Riesgo de alucinación: no cuantificado; el modo *thinking* y la salida estructurada con ZTC mitigan parcialmente el problema en extracción, pero no lo eliminan. En producción conviene validar los campos extraídos contra esquemas.
- Cobertura idiomática: la model card declara en, ko, zh, ja y multilingüe; el rendimiento en castellano no está documentado y no debería asumirse equiparable al de inglés o coreano.
- Licencia: `qwen-community-1.0` (license: other) impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producto.
- Los benchmarks de la familia R1 (GPQA, AIME, HMMT, LEXam, IFStruct) no corresponden a R3 y no deben extrapolarse a esta revisión.
- El rendimiento en BF16 exige infraestructura multi-GPU; la variante GGUF de 4 bits degrada ligeramente la calidad en tareas distintas de MMLU-Pro, aunque la model card solo reporta paridad en esa métrica.
- La condición de "auto-mejora recursiva" es una afirmación del autor sin validación externa publicada en la información disponible; conviene tratarla como característica declarada, no verificada.
- No se han publicado detalles sobre alineación, filtros de seguridad ni evaluación de contenido dañino.

## Enlaces

- Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Repositorio GGUF 4 bits: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Web del desarrollador: https://vidraft.net
- SuperCLUE: https://www.superclueai.com/homepage
- ExtractBench: https://huggingface.co/datasets/llamaindex/ExtractBench
- EvasionBench: https://huggingface.co/datasets/FutureMa/EvasionBench
- GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- MMMU-Pro: https://huggingface.co/datasets/MMMU/MMMU_Pro
- AIME 2026: https://huggingface.co/datasets/MathArena/aime_2026
- HMMT Feb 2026: https://huggingface.co/datasets/MathArena/hmmt_feb_2026
- LEXam: https://huggingface.co/datasets/LEXam-Benchmark/LEXam
- LEXam-hard: https://huggingface.co/datasets/joelniklaus/LEXam-hard
- IFStruct: https://huggingface.co/datasets/LiquidAI/ifstruct-v1.0
- MDPBench: https://huggingface.co/datasets/Delores-Lin/MDPBench
- Paper citado (arXiv 2605.14386): https://arxiv.org/abs/2605.14386
- Paper citado (arXiv 2609.20269): https://arxiv.org/abs/2609.20269
