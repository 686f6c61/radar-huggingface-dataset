# ArrowLabs/AresXLG1-100M

## Resumen

AresXLG1-100M es un modelo de lenguaje base de 100 millones de parámetros desarrollado por ArrowLabs, presentado como el miembro de menor tamaño de la familia Ares. Está diseñado como modelo preentrenado (*base*) orientado a texto general, con un énfasis explícito en aritmética y código, según los tags y datasets declarados por el autor. Su arquitectura y tokenizador están "fuertemente inspirados" en los modelos KLM más recientes, aunque el autor afirma superarlos en varias métricas.

El modelo se entrena sobre una mezcla de datos generales fuertemente filtrados (DCLM, Ultra-FineWeb-L3, PerfectPdfs, smollm-corpus, MegaMath-Web-Pro-Max, finemath, Wikipedia, fineweb-edu, entre otros) y, según la model card, también sobre datasets privados que incluyen datos destilados de modelos mayores. El entrenamiento declarado comprende 50 mil millones de tokens sobre 4 GPUs B300.

Su relevancia radica en el segmento de modelos extremadamente pequeños (*tiny SLMs*), donde cada punto de benchmark cuenta y el coste de inferencia es mínimo. No obstante, se trata de un modelo base sin ajuste por instrucciones ni modo de razonamiento, por lo que no es apto para uso conversacional directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer inspirado en los modelos KLM (detalles no disponibles) |
| Parametros totales | 100M |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La model card indica que AresXLG1-100M emplea una arquitectura y un tokenizador "fuertemente inspirados en los modelos KLM más recientes", sin especificar la configuración exacta (número de capas, dimensión oculta, cabezas de atención, tipo de atención o activaciones). El repositorio incluye la etiqueta `custom_code`, lo que implica que la arquitectura requiere cargar código personalizado del repositorio mediante `trust_remote_code=True`. No se detalla si incorpora innovaciones como atención lineal, decodificación especulativa o mezcla de expertos.

El entrenamiento se realizó sobre 4 GPUs B300 con un total de 50 mil millones de tokens. La composición del dataset combina corpus generales filtrados (DCLM-Ultra y DCLM-Ultra-1.1, Ultra-FineWeb-L3, fineweb-edu, smollm-corpus, PerfectPdfs, Wikipedia), corpus matemáticos (MegaMath-Web-Pro-Max, finemath, TinyMathStories) y, según el autor, datasets privados con datos destilados de modelos mayores. No se documenta el uso de RLHF, DPO ni ninguna fase de ajuste posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt (modelo base, sin plantilla de instrucciones).
- Aritmética y matemáticas básicas, reforzadas por el corpus de entrenamiento (ArithMark 3.0 = 60,60).
- Generación de código y texto técnico, según los tags `code`, `coding` y `programming`.
- Razonamiento de sentido común elemental medido en PIQA, HellaSwag y ARC.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (el autor indica explícitamente que no puede pensar ni seguir instrucciones).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre modelos de muy bajo coste: servir como baseline de 100M parámetros para estudiar curvas de escalado, tokenizadores y mezclas de datos en experimentos académicos.
- Fine-tuning supervisado para tareas concretas: al ser un modelo base con licencia Apache 2.0, puede ajustarse para clasificación de texto, extracción de entidades o resumen de dominio específico con presupuestos de cómputo mínimos.
- Generación de código asistida en entornos con recursos limitados: su énfasis en código permite experimentar con autocompletado o generación de fragmentos cortos en CPU o GPUs de gama baja.
- Evaluación comparativa de SLMs: útil como referencia en leaderboards internos de modelos pequeños (Open SLM Int Index = 34,84) frente a alternativas como KLM 1.6 o Boris 2.
- Prototipado educativo: ilustrar el comportamiento de un modelo preentrenado puro (sin alineación) en cursos y talleres sobre fundamentos de LLMs.
- Componente en pipelines de destilación: emplear sus pesos como estudiante en procesos de destilación desde modelos mayores, dado su tamaño reducido y su entrenamiento previo con datos destilados.
- Pruebas de estrés de infraestructura: validar pipelines de despliegue (TGI, vLLM, llama.cpp) con un modelo de 100M antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | ArithMark 3.0 | PIQA | HellaSwag | ARC-Easy | ARC-Challenge | Open SLM Int Index |
|---|---:|---:|---:|---:|---:|---:|
| AresXLG1-100M | **60,60** | 68,25 | 46,58 | 58,00 | 32,08 | **34,84** |
| KLM 1.6 | 55,90 | 70,18 | 45,28 | 61,07 | 33,53 | 33,95 |
| Boris 2 (144M) | 45,90 | **72,85** | 50,27 | 59,76 | 32,00 | 34,34 |
| Boris 2 Think (144M) | 49,20 | 72,31 | 50,13 | **63,93** | **34,81** | **36,05** |

AresXLG1-100M lidera en ArithMark 3.0 y en el índice agregado frente a KLM 1.6 y Boris 2, aunque queda por detrás de Boris 2 Think (144M, con ajuste de razonamiento) en el índice agregado y en ARC. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB en fp16/bf16 (100M parámetros × 2 bytes) y alrededor de 0,1 GB en int8; en la práctica, cualquier GPU con 1 GB o más es suficiente.
- GPU recomendadas: cualquier GPU moderna; funciona en RTX 3060/4060/4090, A100, H100, B300 y también en CPU.
- Cabe holgadamente en GPUs de consumo, incluidas iGPU y dispositivos de borde (Raspberry Pi, Jetson) con cuantización.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (obligatorio por `custom_code`), text-generation-inference (etiqueta declarada), llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repositorio), y vLLM si la arquitectura personalizada es compatible.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera un throughput muy alto en GPU y viable en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Open SLM Int Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AresXLG1-100M | 100M | no disponible | 34,84 | Apache 2.0 | Hugging Face |
| KLM 1.6 | no disponible | no disponible | 33,95 | no disponible | no disponible en la información |
| Boris 2 | 144M | no disponible | 34,34 | no disponible | no disponible en la información |
| Boris 2 Think | 144M | no disponible | 36,05 | no disponible | no disponible en la información |

AresXLG1-100M es el más pequeño de la comparativa y el que obtiene mejor ArithMark 3.0, aunque Boris 2 Think (con tuning de razonamiento) supera el índice agregado. La ventaja principal de AresXLG1-100M es su licencia Apache 2.0 explícita y su menor tamaño, que reduce costes de inferencia y fine-tuning.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene conversaciones y no dispone de modo de razonamiento (el autor lo advierte explícitamente).
- Solo entrenado en inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo elevado de alucinación y de generación incoherente en secuencias largas, típico de modelos de 100M parámetros.
- Sesgos heredados de los corpus web (DCLM, FineWeb, Wikipedia) sin filtrado de alineación posterior; no se documentan mitigaciones.
- La longitud de contexto no está publicada, lo que dificulta planificar casos de uso con prompts largos.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de desplegarlo en producción.
- El uso comercial está permitido por Apache 2.0, pero el autor menciona datasets privados no publicados, lo que limita la reproducibilidad y la auditoría de la procedencia de los datos.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ); habría que generarlos.
- El recuento de descargas y likes es prácticamente nulo, por lo que no existe validación comunitaria independiente de los benchmarks declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArrowLabs/AresXLG1-100M
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset MegaMath-Web-Pro-Max: https://huggingface.co/datasets/OctoThinker/MegaMath-Web-Pro-Max
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset PerfectPdfs: https://huggingface.co/datasets/ArrowLabs/PerfectPdfs
- Dataset DCLM-Ultra: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra
- Dataset DCLM-Ultra-1.1: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra-1.1
- Dataset TinyMathStories: https://huggingface.co/datasets/AlgoDriveAI/TinyMathStories_gpt-oss-20b
