# enhasasuzu/Kimi-VL-A3B-Thinking-staging

## Resumen

Kimi-VL-A3B-Thinking es un modelo de lenguaje y visión (VLM) de arquitectura Mixture-of-Experts (MoE) desarrollado por Moonshot AI. Se trata de la variante orientada a razonamiento de la familia Kimi-VL, obtenida a partir de Kimi-VL-A3B-Instruct mediante ajuste supervisado con cadenas de pensamiento largas (long CoT SFT) y aprendizaje por refuerzo (RL). El modelo activa únicamente 2.8B parámetros en su decodificador de lenguaje sobre un total de 16B, lo que lo sitúa en la categoría de VLMs eficientes con capacidades de razonamiento extendido.

La relevancia del modelo radica en su capacidad para igualar a VLMs de código abierto de 30B y 70B parámetros en benchmarks de razonamiento matemático multimodal como MathVision, manteniendo un coste computacional reducido. Incorpora un codificador visual de resolución nativa (MoonViT) y una ventana de contexto de 128K tokens, lo que le permite procesar documentos largos, vídeo extenso e imágenes de alta resolución.

La ficha que se presenta a continuación corresponde a la réplica `enhasasuzu/Kimi-VL-A3B-Thinking-staging`, un espejo del modelo original de Moonshot AI (`moonshotai/Kimi-VL-A3B-Thinking`). El autor del repositorio es `enhasasuzu` y no guarda relación con el desarrollo original. Existe una versión posterior, Kimi-VL-A3B-Thinking-2506, que el propio autor recomienda para mejores capacidades en comprensión visual general, razonamiento, vídeo y escenarios de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language model: decodificador de lenguaje MoE + codificador visual MoonViT de resolución nativa + proyector MLP |
| Parametros totales | 16B |
| Parametros activos | 3B (2.8B en el decodificador de lenguaje) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina tres componentes: un decodificador de lenguaje con arquitectura Mixture-of-Experts que activa 2.8B parámetros sobre un total de 16B, un codificador visual llamado MoonViT que procesa imágenes a resolución nativa (sin reescalado fijo, lo que permite manejar entradas de ultra-alta resolución con coste computacional contenido en entradas comunes) y un proyector MLP que alinea los embeddings visuales con el espacio del decodificador de lenguaje.

La variante Thinking se desarrolla en dos fases sobre la base de Kimi-VL-A3B-Instruct: un ajuste supervisado con cadenas de pensamiento largas (long CoT SFT) y un posterior aprendizaje por refuerzo (RL). Este entrenamiento está orientado a reforzar el razonamiento de horizonte largo, especialmente en tareas matemáticas y de comprensión visual compleja. El informe técnico asociado es arXiv:2504.07491. No se dispone en la información proporcionada del número de tokens de entrenamiento ni de la composición detallada del dataset.

## Capacidades

- Razonamiento multimodal con modo de pensamiento extendido (long CoT), orientado a problemas que requieren cadenas de razonamiento largas.
- Comprensión de imágenes y vídeo, incluyendo vídeo largo (LongVideoBench) y documentos extensos (MMLongBench-Doc).
- OCR y comprensión de documentos, con soporte para imágenes de ultra-alta resolución gracias al codificador MoonViT de resolución nativa.
- Razonamiento matemático multimodal (MathVision, MathVista).
- Comprensión multi-imagen.
- Capacidades de agente multimodal y interacción multiturno (mencionadas tareas tipo OSWorld).
- Generación de texto y respuesta conversacional en pipeline image-text-to-text.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos a partir de imágenes: el modelo puede recibir un enunciado fotografiado o un diagrama y generar una cadena de razonamiento paso a paso antes de dar la respuesta, aprovechando su entrenamiento con long CoT y su rendimiento en MathVision y MathVista.
- Análisis de documentos largos con OCR: gracias a la ventana de 128K tokens y al codificador de resolución nativa, puede procesar documentos escaneados, informes o pantallas de alta resolución y extraer información estructurada.
- Comprensión de vídeo extenso: con 128K de contexto puede analizar secuencias de vídeo largas para resumir contenido, responder preguntas temporales o detectar eventos, un escenario medido en LongVideoBench.
- Automatización de tareas de agente sobre interfaz gráfica: el modelo está entrenado para interacción multiturno tipo OSWorld, lo que permite usarlo como motor de decisión en agentes que interpretan pantallas y ejecutan acciones.
- Asistencia en educación STEM: puede actuar como tutor que razona sobre figuras geométricas, gráficas o ecuaciones manuscritas, mostrando el proceso de resolución.
- Extracción de información de capturas y UI: con buen rendimiento en ScreenSpot-Pro, es adecuado para tareas de localización de elementos en pantallas y automatización de pruebas de interfaz.
- Análisis de imágenes médicas o técnicas de alta resolución: el procesamiento a resolución nativa permite trabajar con imágenes donde el detalle fino es relevante, aunque requiere validación específica del dominio.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo original (Pass@1):

| Benchmark | GPT-4o | GPT-4o-mini | Qwen2.5-VL-72B | Qwen2.5-VL-7B | Gemma-3-27B | Gemma-3-12B | o1-1217 | QVQ-72B | Kimi-k1.5 | Kimi-VL-Thinking-A3B |
|---|---|---|---|---|---|---|---|---|---|---|
| MathVision (full) | 30.4 | - | 38.1 | 25.1 | 35.5 | 32.1 | - | 35.9 | 38.6 | 36.8 |
| MathVista (mini) | 63.8 | 56.7 | 74.8 | 68.2 | 62.3 | 56.4 | 71.0 | 71.4 | 74.9 | 71.3 |
| MMMU (val) | 69.1 | 60.0 | 74.8 | 58.6 | 64.8 | 59.6 | 77.3 | 70.3 | 70.0 | 61.7 |

Resultados adicionales citados en la introducción para la familia Kimi-VL: 64.5 en LongVideoBench, 35.1 en MMLongBench-Doc, 83.2 en InfoVQA y 34.5 en ScreenSpot-Pro (estos valores corresponden a la familia, sin especificar en la información disponible si aplican a la variante Thinking o a la Instruct).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 16B parámetros totales, en FP16 se requerirían aproximadamente 32 GB solo para pesos; en cuantización de 8 bits, unos 16 GB; en 4 bits, unos 8-10 GB, además del coste del codificador visual y del KV cache para contexto largo.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, cabría esperar uso en A100, H100 o GPUs consumer de gama alta con suficiente VRAM, pero no hay datos oficiales.
- ¿Cabe en GPU consumer?: no confirmado en la información disponible; dependería de la cuantización y de la longitud de contexto.
- Opciones de despliegue: la model card documenta inferencia con Hugging Face Transformers (python 3.10, torch>=2.1.0, transformers 4.4x). No se confirman vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MathVision | MathVista | MMMU | Licencia |
|---|---|---|---|---|---|---|---|
| Kimi-VL-A3B-Thinking | 16B | 3B | 128K | 36.8 | 71.3 | 61.7 | MIT |
| Qwen2.5-VL-7B | 7B | 7B | no disponible | 25.1 | 68.2 | 58.6 | no disponible |
| Qwen2.5-VL-72B | 72B | 72B | no disponible | 38.1 | 74.8 | 74.8 | no disponible |
| Gemma-3-12B | 12B | 12B | no disponible | 32.1 | 56.4 | 59.6 | no disponible |

Kimi-VL-A3B-Thinking supera a Qwen2.5-VL-7B y Gemma-3-12B en MathVision y MathVista con solo 3B parámetros activos, y se acerca a Qwen2.5-VL-72B en MathVision (36.8 frente a 38.1). En MMMU queda por debajo de los modelos de mayor tamaño comparados.

## Limitaciones y advertencias

- Este repositorio es una réplica no oficial (`enhasasuzu/Kimi-VL-A3B-Thinking-staging`) del modelo de Moonshot AI; para uso en producción debe referenciarse el repositorio original `moonshotai/Kimi-VL-A3B-Thinking`.
- Existe una versión posterior recomendada por el autor, Kimi-VL-A3B-Thinking-2506, con mejores capacidades en comprensión visual general, razonamiento, vídeo y agentes; usar la versión antigua puede suponer un rendimiento inferior en esos escenarios.
- El modelo Thinking requiere temperaturas más altas (0.8 recomendado) y puede generar cadenas de pensamiento largas, lo que incrementa la latencia y el consumo de tokens.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en OCR de documentos de baja calidad o en razonamiento matemático con imágenes ambiguas.
- No se dispone de información sobre sesgos, cobertura de idiomas ni evaluación de seguridad en la documentación proporcionada.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de los componentes base y de los datos de entrenamiento originales.
- El rendimiento en MMMU (61.7) es inferior al de modelos de mayor tamaño, por lo que en tareas de conocimiento multidisciplinar amplio puede no ser la mejor opción.
- No se han publicado requisitos oficiales de hardware ni datos de cuantización en la información disponible.

## Enlaces

- Réplica en Hugging Face: https://huggingface.co/enhasasuzu/Kimi-VL-A3B-Thinking-staging
- Modelo original: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking
- Versión 2506: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking-2506
- Variante Instruct: https://huggingface.co/moonshotai/Kimi-VL-A3B-Instruct
- Informe técnico: https://arxiv.org/abs/2504.07491
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-VL
- Demo chat: https://huggingface.co/spaces/moonshotai/Kimi-VL-A3B-Thinking/
- Colección Kimi-VL-A3B: https://huggingface.co/collections/moonshotai/kimi-vl-a3b
