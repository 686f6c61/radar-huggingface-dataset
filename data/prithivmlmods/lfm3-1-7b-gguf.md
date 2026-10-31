# prithivMLmods/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es la cuantización en formato GGUF del modelo LFM3-1.7B, un modelo de lenguaje compacto de solo texto desarrollado por Liquid AI. Con 1,73 mil millones de parámetros y una arquitectura tri-híbrida de 24 capas que combina convoluciones cortas con compuertas, atención de ventana deslizante y atención global, el modelo está diseñado para ejecutarse en hardware de borde (edge) y entornos locales, ofreciendo una ventana de contexto de 256K tokens y soporte para 16 idiomas.

Su relevancia radica en la relación entre tamaño y capacidad: pese a su reducido tamaño, obtiene una media de benchmark de 49,37, superando a modelos mayores como Qwen3.5-9B (47,24). Destaca en tareas de código (73,46 en LiveCodeBench v6), seguimiento de instrucciones (96,66 en IFEval) y reducción de alucinaciones (92,93 en AA-Omniscience non-hallucination). Además, incorpora modos de pensamiento configurables, tool calling basado en XML y búsqueda dinámica de herramientas, lo que lo hace especialmente apto para frameworks de agentes locales.

Esta versión de prithivMLmods distribuye los pesos en GGUF con cuantizaciones desde Q3_K_L hasta Q8_0 y BF16, permitiendo su uso directo con llama.cpp, Ollama y otros runtimes compatibles, con un consumo de memoria de aproximadamente 1 GB en precisión de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida (convoluciones cortas con compuertas + atención de ventana deslizante + atención global), 24 capas |
| Parametros totales | 1.728.801.600 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF: Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, BF16 (el modelo base también existe en BF16, FP8, NVFP4, MLX y ONNX) |
| Idiomas soportados | 16: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | GGUF (esta versión); el modelo base está disponible en safetensors, GGUF, MLX y ONNX |

## Arquitectura y entrenamiento

LFM3-1.7B emplea una arquitectura tri-híbrida de 24 capas, característica de la familia LFM (Liquid Foundation Models) de Liquid AI. Esta arquitectura alterna tres tipos de capas: convoluciones cortas con compuertas (gated short convolutions), atención con ventana deslizante (sliding-window attention) para el procesamiento eficiente de contextos locales y atención global para capturar dependencias de largo alcance. Este diseño híbrido permite sostener una ventana de contexto de 256K tokens con un consumo de memoria contenido, algo poco habitual en modelos de este tamaño.

Sobre el proceso de entrenamiento no se han publicado detalles en la información disponible (número de tokens, composición del dataset ni uso de RLHF/DPO). El modelo es de solo texto (text-only) e incorpora como funcionalidades destacables modos de pensamiento configurables (thinking modes), tool calling basado en XML y búsqueda dinámica de herramientas, orientados a su uso en frameworks de agentes. No es un modelo MoE, por lo que todos sus parámetros están activos en cada pasada.

## Capacidades

- Generación de texto conversacional en 16 idiomas, incluido el español.
- Generación y razonamiento sobre código: 73,46 en LiveCodeBench v6.
- Seguimiento estricto de instrucciones: 96,66 en IFEval.
- Generación de salidas estructuradas (structured outputs).
- Tool calling basado en XML y búsqueda dinámica de herramientas (dynamic tool search).
- Diseñado para frameworks de agentes locales y razonamiento multi-paso.
- Modos de pensamiento configurables (thinking modes).
- Ventana de contexto de 256K tokens para documentos y conversaciones largas.
- Baja tasa de alucinación medida: 92,93 en AA-Omniscience non-hallucination.

No incluye capacidades de visión ni audio; es un modelo de solo texto.

## Casos de uso

- Agentes locales en hardware de borde: su arquitectura ligera y su consumo de ~1 GB en 4 bits permiten ejecutar agentes con tool calling directamente en dispositivos sin dependencia de la nube.
- Chatbots multilingües on-device: soporta 16 idiomas con contexto de 256K tokens, adecuado para asistentes que procesan conversaciones multi-turno largas o documentos extensos sin perder contexto.
- Generación de código en entornos locales: su puntuación de 73,46 en LiveCodeBench v6 lo hace útil como asistente de código integrado en IDEs o pipelines que requieren privacidad de los fuentes.
- Automatización con salidas estructuradas: su soporte de structured outputs facilita la extracción de datos y la generación de JSON/XML fiables para integraciones con sistemas empresariales.
- Orquestación de herramientas (function calling): el tool calling basado en XML permite conectar el modelo con APIs y funciones locales en flujos de automatización multi-paso.
- Procesamiento de documentos largos: la ventana de 256K tokens permite resumir, consultar y analizar documentos extensos (contratos, informes técnicos) en local.
- RAG en dispositivos con recursos limitados: combinado con su bajo consumo de memoria, es candidato para sistemas de búsqueda aumentada por recuperación que deben ejecutarse sin GPU dedicada.

## Benchmarks y rendimiento

Datos publicados en la model card (sin comparativa exhaustiva con más modelos):

| Benchmark | Puntuación |
|---|---|
| Media de benchmarks | 49,37 |
| LiveCodeBench v6 | 73,46 |
| BFCL V4 | 71,39 |
| Claw-Eval General | 68,64 |
| IFEval | 96,66 |
| AA-Omniscience non-hallucination | 92,93 |

Referencia indicada por el autor: Qwen3.5-9B obtiene una media de 47,24 en el mismo agregado, por debajo de los 49,37 de LFM3-1.7B.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: aproximadamente 1 GB en precisión de 4 bits (Q4_K_M ocupa 1,1 GB); Q8_0 requiere ~1,85 GB y BF16 ~3,47 GB, más la memoria del KV cache según la longitud de contexto utilizada.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna con 2-4 GB de VRAM (por ejemplo RTX 3060, RTX 4060 o superior) ejecuta las cuantizaciones más altas con holgura. También puede ejecutarse solo con CPU y RAM.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo actual, incluso en portátiles con gráfica integrada para las cuantizaciones Q3/Q4.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, Transformers y otros runtimes compatibles con GGUF.
- Latencia y throughput estimados: no disponible; al ser un modelo de 1,73B parámetros, se espera inferencia muy rápida en CPU moderna y alta velocidad de generación en GPU, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmark | Licencia | Formatos |
|---|---|---|---|---|---|
| LFM3-1.7B (Liquid AI) | 1,73B | 256K | 49,37 | LFM Open License v1.0 | BF16, FP8, NVFP4, GGUF, MLX, ONNX |
| Qwen3.5-9B | ~9B | no disponible | 47,24 | no disponible | no disponible |
| Qwen3-1.7B (referencia de categoría) | 1,7B | no disponible | no disponible | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B (referencia de categoría) | 1,24B | 128K | no disponible | Licencia Llama 3.2 | safetensors, GGUF |

Nota: solo la comparación con Qwen3.5-9B procede de datos publicados en la model card; el resto de alternativas se incluyen como referencia de categoría y varios de sus datos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo de solo texto: no admite entrada de imágenes ni audio.
- La licencia LFM Open License v1.0 es una licencia personalizada ("other"); debe revisarse su texto (enlace en la ficha del modelo base) antes de cualquier uso comercial, ya que puede incluir restricciones distintas a licencias permisivas tipo Apache 2.0.
- No se han publicado detalles sobre sesgos conocidos, datos de entrenamiento ni proceso de alineación (RLHF/DPO), por lo que deben evaluarse los riesgos de sesgo y alucinación caso por caso, especialmente en dominios sensibles.
- La cuantización GGUF (Q3/Q4) implica una pérdida de calidad respecto a BF16; para tareas exigentes se recomienda Q6_K o superior.
- Las puntuaciones de benchmark proceden de la model card del autor de la cuantización y no han sido verificadas de forma independiente.
- El rendimiento con contextos cercanos a 256K tokens dependerá de la memoria disponible para el KV cache; en dispositivos de borde puede ser necesario limitar el contexto efectivo.
- Esta versión GGUF es una cuantización de terceros (prithivMLmods), no oficial de Liquid AI; para soporte del modelo base debe consultarse el repositorio de LiquidAI/LFM3-1.7B.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/prithivMLmods/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
