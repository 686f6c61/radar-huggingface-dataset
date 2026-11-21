# rapid-mlx/Qwen3.8-27B-mixed-3.5bpw-MLX

## Resumen

Qwen3.8-27B-mixed-3.5bpw-MLX es una compilación cuantizada en formato MLX del modelo multimodal Qwen3.8-27B, publicada por el usuario rapid-mlx. El modelo original lo desarrolla el equipo Qwen de Alibaba, mientras que esta versión es una redistribución comunitaria orientada exclusivamente a Apple Silicon. El objetivo es claro: reducir un modelo visión-lenguaje de 27.000 millones de parámetros a un tamaño que quepa y funcione con comodidad en un Mac con 24 GB de memoria unificada, sin sacrificar la calidad de razonamiento propia de una cuantización de 4 bits.

La innovación principal es una asignación de precisión mixta (2/3/4 bits por capa) guiada por la magnitud de las activaciones, que alcanza una media de 3,5 bits por peso. Según la model card, esto permite recuperar prácticamente toda la pérdida de conocimiento factual que sufriría una cuantización uniforme a 3 bits, manteniendo el conocimiento, el razonamiento matemático y la generación de código al nivel del build de 4 bits. El resultado ocupa unos 13 GB en disco frente a los 16 GB del 4-bit estándar y los 51 GB del bf16.

El modelo conserva la torre de visión (cuantizada a 4 bits) y soporta entrada de imagen y texto con salida de texto. Se sirve mediante Rapid-MLX, con batching continuo para texto y modo `--mllm` para visión, e incluye opcionalmente un drafter MTP para decodificación especulativa sin pérdida. La licencia es Apache-2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje); familia Qwen3.5 según tags |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX mixed-precision 2/3/4 bits (media 3,5 bpw), grupo 64, affine; torre de visión a 4 bits |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); drafter MTP en `mtp/model.safetensors` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal de tipo visión-lenguaje con una torre de visión que procesa imágenes y las proyecta al espacio del modelo de lenguaje. Esta versión no reentrena el modelo: aplica una cuantización post-entrenamiento con una metodología propia. Se ejecuta una pequeña muestra de calibración en inglés para capturar la magnitud media de las activaciones de entrada de cada capa `Linear` del modelo de lenguaje, siguiendo la métrica de saliencia estilo AWQ/GPTQ. A continuación se puntúa el error de cuantización de cada módulo ponderado por esa escala de activación, evaluado a anchos de 2, 3, 4 y 8 bits, y se resuelve una asignación tipo knapsack voraz que minimiza el error total bajo un presupuesto de tamaño de 3,5 bpw.

El análisis del autor indica que la pérdida de conocimiento se concentra en los bloques MLP y no en la cabeza de salida, por lo que la asignación promueve a 4 bits las proyecciones MLP más salientes y degrada las de menor impacto. La torre de visión se mantiene a 4 bits para preservar la multimodalidad. El repositorio incluye además un drafter nativo de Multi-Token Prediction (MTP) para decodificación especulativa sin pérdida, desactivado por defecto porque su beneficio varía según el chip; en validación greedy emparejada los tokens emitidos fueron idénticos a la decodificación autorregresiva. El layout del artefacto MTP se basa en el proyecto MTPLX de Youssof Altoukhi (Apache-2.0).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y conocimiento factual, con un rendimiento declarado equivalente al build de 4 bits en MMLU-Pro.
- Razonamiento matemático (evaluado con GSM8K).
- Generación de código, incluido modo de razonamiento tipo thinking (evaluado con HumanEval+).
- Comprensión de imágenes: entrada image-text-to-text con la torre de visión preservada a 4 bits.
- Servicio compatible con la API de OpenAI (`/v1/chat/completions`) a través de Rapid-MLX.
- Batching continuo completo en modo texto.
- Integración con herramientas de agentes: OpenCode, Claude Code y Codex mediante `rapid-mlx agents`.
- Decodificación especulativa opcional con drafter MTP (hasta 3 tokens especulativos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código local en Mac: el modelo se integra con OpenCode, Claude Code o Codex mediante `rapid-mlx agents`, de modo que un desarrollador puede ejecutar un agente de programación completamente en local sobre memoria unificada, sin enviar código a servicios externos.
- Análisis de capturas de pantalla y diagramas: gracias a la torre de visión a 4 bits, se pueden enviar imágenes de interfaces, gráficos o documentación escaneada junto con preguntas en texto para extraer información estructurada o explicaciones.
- Documentación técnica multilingüe inglés-chino: el soporte nativo de ambos idiomas permite traducir y resumir documentación técnica entre estos dos idiomas manteniendo terminología especializada.
- Prototipado de aplicaciones con API compatible OpenAI: al exponer un endpoint `/v1/chat/completions`, se puede apuntar cualquier cliente existente (SDKs de OpenAI, LangChain, etc.) a `localhost:8000` para desarrollar y probar sin coste de API.
- Procesamiento por lotes en un solo equipo: el batching continuo de Rapid-MLX permite servir varias peticiones de texto concurrentes en un Mac de 32 GB, útil para clasificación, extracción o resumen de documentos a escala pequeña.
- Evaluación e investigación de cuantización: el repositorio documenta la metodología de asignación mixta y los resultados comparativos frente a 4 bits y 3 bits uniformes, lo que lo convierte en un caso de estudio reproducible para quienes investigan técnicas de compresión.
- Razonamiento matemático asistido: con un rendimiento declarado de 94,7 en GSM8K, es adecuado para resolver problemas aritméticos de varios pasos en un entorno local y privado.

## Benchmarks y rendimiento

Resultados publicados en la model card, con el mismo harness y decodificación greedy:

| Benchmark | Habilidad | 4-bit (16 GB) | Este build 3,5 bpw (13 GB) | 3-bit uniforme (12 GB) |
|---|---|---|---|---|
| MMLU-Pro (n=500) | conocimiento | 60,8 | 61,0 | 54,2 |
| GSM8K (n=150) | razonamiento matemático | 95,3 | 94,7 | 92,7 |
| HumanEval+ (n=40, thinking) | código | 77,5 | 80,0 | no disponible |
| MMBench-EN (n=300) | visión | 90,3 | 86,7 | 87,3 |

Comparación sobre un subconjunto idéntico frente al original en bf16:

| Mismo subconjunto | bf16 (51 GB) | 4-bit (16 GB) | Mixto 3,5 bpw (13 GB) |
|---|---|---|---|
| MMLU-Pro (n=200) | 59,5 | 61,5 | 60,5 |
| GSM8K (n=60) | 90,0 | 98,3 | 93,3 |
| MMBench-EN (n=150) | 88,0 | 92,0 | 86,0 |

El autor señala que, con n=200, el intervalo de confianza al 95 % es de aproximadamente ±7 puntos, por lo que las diferencias de 1 a 3 puntos entre bf16, 4-bit y este build entran dentro del ruido de medición. La pérdida en visión (unos 3,6 puntos frente a 4 bits) se atribuye a que el presupuesto mixto se dedicó al modelo de lenguaje y no a la torre de visión.

## Requisitos de hardware

- Memoria unificada mínima: 24 GB; se recomiendan 32 GB para tener más margen de contexto.
- Huella en disco: aproximadamente 13 GB para los pesos (el repositorio completo ocupa 14,8 GB, incluido el drafter MTP).
- Pico de memoria medido con `mlx.get_peak_memory`: 14,6 GB en texto con 200 tokens; 15,9 GB con imagen de 672²; 16,5 GB con imagen de 896². El build de 4 bits equivalente consume 18,6 / 19,7 / 20,4 GB respectivamente.
- GPU: exclusivamente Apple Silicon (MLX); no es ejecutable en GPU NVIDIA ni AMD.
- Cabe en Macs consumer con 24 GB o más de memoria unificada (familias M1/M2/M3/M4 con esa configuración).
- Despliegue: Rapid-MLX (`rapid-mlx serve`, con `--mllm` para visión), aplicación de escritorio Rapid Mac y `pip install rapid-mlx`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que el beneficio del MTP varía según el chip y no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (Qwen3.8-27B mixed 3.5bpw MLX) | 27,36 B | no disponible | MLX safetensors, Apple Silicon | Apache-2.0 | Hugging Face, 695 descargas |
| Qwen3.8-27B 4-bit MLX (referencia de la model card) | 27,36 B | no disponible | MLX, Apple Silicon | Apache-2.0 | Referenciado en la evaluación |
| Qwen3.8-27B bf16 (original) | 27,36 B | no disponible | safetensors, GPU/CPU | Apache-2.0 | Hugging Face (Qwen/Qwen3.8-27B) |
| Qwen3.8-27B 3-bit uniforme MLX | 27,36 B | no disponible | MLX, Apple Silicon | Apache-2.0 | Referenciado en la evaluación |

No se dispone de información sobre otros modelos de la competencia (Llama, Gemma, Mistral) en la documentación proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantización mixta prioriza el modelo de lenguaje: la visión queda unos 3,6 puntos por debajo del build de 4 bits en MMBench-EN.
- Solo soporta oficialmente inglés y chino; el rendimiento en castellano no está evaluado ni declarado.
- El conjunto de calibración de la cuantización es una muestra pequeña en inglés, lo que puede introducir sesgo hacia ese idioma en la asignación de bits.
- Riesgo de alucinación inherente a un modelo de 27 B, no mitigado por la cuantización; los benchmarks de conocimiento rondan 60 en MMLU-Pro, lo que implica un margen de error considerable.
- El modelo está atado al ecosistema MLX y a Apple Silicon: no hay pesos GGUF ni soporte para vLLM, llama.cpp u Ollama en la información disponible.
- La decodificación especulativa MTP está desactivada por defecto y su ganancia depende del chip; no se garantiza aceleración en todos los equipos.
- La longitud de contexto no se especifica en la información proporcionada; el autor solo menciona que 32 GB de memoria dan "más margen de contexto".
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene verificar las condiciones del modelo base Qwen3.8-27B antes de desplegarlo en producción.
- El repositorio lo mantiene un tercero (rapid-mlx), no el equipo Qwen; la continuidad y el soporte dependen de ese mantenedor.
- El MTP se apoya en el proyecto MTPLX de un tercero (Apache-2.0); su licencia debe respetarse en redistribuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rapid-mlx/Qwen3.8-27B-mixed-3.5bpw-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Rapid-MLX: https://github.com/raullenchai/Rapid-MLX
- Documentación de agentes: https://rapidmlx.com/docs/agents
- Descarga de la aplicación de escritorio: https://rapidmlx.com/download
- Script de instalación: https://rapidmlx.com/install.sh
- Proyecto MTPLX: https://github.com/youssofal/mtplx
