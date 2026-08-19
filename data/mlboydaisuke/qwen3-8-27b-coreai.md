# mlboydaisuke/Qwen3.8-27B-CoreAI

## Resumen

Qwen3.8-27B-CoreAI es una conversión del modelo denso de visión-lenguaje Qwen3.8-27B de Alibaba (lanzado en agosto de 2026) al formato Apple Core AI, el sucesor de Core ML presentado en la WWDC26. El port lo realiza el desarrollador mlboydaisuke, que publica tanto el decodificador de texto como la ruta de visión completa, permitiendo ejecutar el modelo de forma local en Macs con Apple Silicon. El modelo original es un VLM híbrido de 27 000 millones de parámetros con 262 000 tokens de contexto nativo, diseñado para tareas de razonamiento, codificación y agentes de largo horizonte.

La relevancia de esta conversión radica en que lleva un modelo de última generación a hardware de Apple mediante el motor `coreai-pipelined`, con cuantización int8 y un rendimiento medido de 15,7 tokens por segundo en decodificación sobre un M4 Max de 128 GB. El repo incluye tres bundles: el decodificador de texto (28 GB int8), la torre de visión ViT (0,9 GB fp16) y el decodificador VLM combinado (28 GB con función de prefill estática). Es un modelo de razonamiento: la plantilla de chat abre un espacio `thinking` y las generaciones dedican los primeros tokens a pensar, por lo que hay que presupuestar `max-tokens` en consecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas con interleave 3:1 de GatedDeltaNet (linear attention, GVA 48v/16k) y atención completa gated (24 q / 4 KV, head_dim 256); torre de visión ViT de 458M parámetros |
| Parametros totales | 27 000 millones (denso) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativos |
| Tipos de cuantizacion | int8 (int8hu block32 sym) para decodificador; fp16 para torre de visión y embeddings; bf16 como referencia de oracle |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Apple Core AI (.aimodel) para bundles; safetensors (fp16) para `embed_tokens` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un VLM denso construido sobre la arquitectura Qwen3.5. El decodificador de texto usa un grafo híbrido con 64 capas en una proporción 3:1 de mezcladores de atención lineal GatedDeltaNet (con estado recurrente convolucional) y atención completa gated, con cabeza destejida de 248 320 tokens de vocabulario. La ruta de visión añade una torre ViT de 458M parámetros que procesa imágenes en una cuadrícula fija de 512×512 píxeles (32×32 parches con fusión 2×2), produciendo 256 embeddings de imagen que se insertan en las posiciones `<|image_pad|>` del decodificador mediante mRoPE intercalado (planos de posición `pos_t/pos_h/pos_w`).

La conversión a Core AI elimina bucles en el grafo de decodificación y transporta los estados recurrentes de la SSM como estados extra de forma fija. El bundle VLM usa una función de prefill estática S=32 para procesar los ~316 tokens de imagen, lo que multiplica por 5 la velocidad de prefill respecto al bundle de texto. El checkpoint original incluye una cabeza MTP (multi-token prediction) que no se ha incorporado porque el coste de verificación en el híbrido GDN limita la especulación a 1,2–1,3×. No se dispone de detalles sobre el entrenamiento (número de tokens, composición del dataset o fases de RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: modelo de razonamiento con apertura explícita de espacio `thinking` en la plantilla de chat.
- Visión y lenguaje: acepta imágenes como entrada, las procesa mediante la torre ViT y las integra con texto en una secuencia multimodal.
- Comprensión de contexto largo: 262 000 tokens de ventana nativa, adecuada para documentos extensos y conversaciones multi-turno.
- Tareas de agente: el modelo original está optimizado para planificación autónoma y manejo de feedback del entorno en tareas multi-paso, según las fuentes del lanzamiento.
- Control flexible del pensamiento: el modelo base permite ajustar el tiempo de razonamiento (thinking mode configurable).
- Capacidades multilingües: no documentadas en esta conversión.
- Tool calling / function calling: no documentado explícitamente en la conversión Core AI; el modelo base lo soporta según fuentes externas, pero no se confirma en este port.

## Casos de uso

- Asistente offline en Mac: el modelo se ejecuta completamente en local mediante CoreAIKit, permitiendo un chat privado sin conexión con respuestas razonadas. El bundle de texto de 28 GB int8 cabe en Macs con 32 GB de RAM unificada o más.
- Análisis de imágenes en dispositivo: con la ruta de visión, se pueden describir o interrogar imágenes (fotos, capturas, diagramas) sin enviar datos a la nube, útil para entornos con requisitos de privacidad estrictos.
- Procesamiento de documentos largos: gracias a los 262K tokens de contexto, puede resumir o extraer información de manuales, contratos o informes extensos en una sola pasada.
- Desarrollo de aplicaciones Swift con IA integrada: la API `ChatSession` de CoreAIKit permite incorporar el modelo en apps de macOS como componente de chat o asistente, con control programático de la sesión.
- Investigación en eficiencia de inferencia: el port sirve como referencia para estudiar la ejecución de arquitecturas híbridas (linear attention + full attention) en motores de GPU de Apple, incluyendo el manejo de estados recurrentes y la cuantización int8.
- Evaluación de modelos VLM en hardware Apple: permite comparar el rendimiento de Qwen3.8-27B frente a otras conversiones (por ejemplo, Qwen3.6-27B-CoreAI) en términos de velocidad, precisión numérica y uso de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta conversión. La model card solo reporta métricas de rendimiento de inferencia y fidelidad numérica:

| Métrica | Valor |
|---|---|
| Decodificación de texto (M4 Max 128 GB) | 15,7 tokens/s (int8) |
| Prefill de texto | 16,2 tokens/s |
| Prefill VLM (con imagen) | 80,2 tokens/s |
| Decodificación VLM | 14,9 tokens/s |
| Latencia de torre de visión | 111 ms por imagen |
| Fidelidad numérica (texto int8 vs bf16) | 15/16 casos token-exactos (1 desviación con margen 0,061) |
| Fidelidad numérica (VLM int8 vs bf16) | 5/6 casos token-exactos, 140/144 tokens |
| Fidelidad numérica (control fp16) | 16/16 (texto) y 32/32 (VLM) token-exactos |

El modelo original Qwen3.8-27B tiene benchmarks publicados en fuentes externas (según Yottalabs y AI Release Tracker), pero no se incluyen en la información proporcionada para esta ficha.

## Requisitos de hardware

- Plataforma exclusiva: Mac con Apple Silicon (procesador M-series) y macOS 27 beta, ya que Core AI se distribuye con el sistema operativo.
- Memoria: el bundle de texto int8 ocupa 28 GB; el bundle VLM completo (decodificador + torre) requiere 28,9 GB. Se recomienda un mínimo de 32 GB de RAM unificada; el rendimiento medido se obtuvo en un M4 Max con 128 GB.
- GPU: no aplica GPU discreta; usa la GPU integrada de Apple Silicon a través del motor `coreai-pipelined`.
- No cabe en iPhone: 28 GB supera ampliamente el límite de memoria de los iPhone; la torre de visión sola (0,9 GB) cabría pero no tiene decodificador on-device que la alimente.
- Opciones de despliegue: CoreAIKit (Swift), `llm-runner`/`llm-benchmark` para el bundle de texto, y el script de referencia `_smoke/test_qwen38vl_suite_gate.py` para el bundle VLM. La compilación AOT requiere `xcrun coreai-build compile` con arquitectura `h16c`.
- Rendimiento limitado por ancho de banda de memoria: en un M4 Max, los 27B se leen completos por token, por lo que la velocidad de decodificación está acotada por la memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CoreAI (este) | 27B denso | 262K | Apache 2.0 | .aimodel | Port para Apple Silicon, int8, VLM |
| Qwen3.6-27B-CoreAI (mismo autor) | 27B denso | 262K | Apache 2.0 | .aimodel | Arquitectura byte-idéntica a Qwen3.8; solo cambian los pesos |
| Qwen3.8-27B (original) | 27B denso | 262K | Apache 2.0 | safetensors / GGUF | Modelo de referencia; se sirve con vLLM o SGLang en GPUs |

La conversión Core AI es específica de Apple y no es directamente comparable en formato con los pesos originales, pero mantiene la misma arquitectura y capacidades. No se dispone de datos de rendimiento de calidad para la comparación.

## Limitaciones y advertencias

- Solo funciona en Mac con Apple Silicon y macOS 27 beta; no hay soporte para Windows, Linux o iPhone.
- El rendimiento de decodificación (≈15 tok/s) es modesto para producción a gran escala; está limitado por el ancho de banda de memoria del hardware Apple.
- La cabeza MTP del checkpoint original no está incluida, por lo que se pierde la posible aceleración por decodificación especulativa.
- El bundle VLM requiere una compilación AOT específica (`--architecture h16c`); el JIT falla en la pasada de regiones ANE de MPSGraph.
- Las imágenes no cuadradas se estiran a una cuadrícula fija 512×512, lo que puede distorsionar la comprensión visual de proporciones originales.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas en la model card; al ser un modelo de razonamiento, puede generar texto plausible pero incorrecto en dominios especializados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; la confiabilidad del port no está validada por la comunidad.
- Los datos de rendimiento se midieron en un único entorno (M4 Max 128 GB, macOS 27 beta); otros Macs pueden ofrecer resultados diferentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/Qwen3.8-27B-CoreAI
- Core AI model zoo (código de conversión y documentación): https://github.com/john-rocky/coreai-model-zoo
- CoreAIKit (runtime Swift): https://github.com/john-rocky/coreai-kit
- Documento de port (write-up): https://github.com/john-rocky/coreai-model-zoo/blob/main/knowledge/qwen3.8-27b-port.md
- Script de prueba del suite VLM: https://github.com/john-rocky/coreai-model-zoo/blob/main/_smoke/test_qwen38vl_suite_gate.py
- Ficha del modelo original en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Artículo de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Seguimiento de lanzamiento y benchmarks: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Especificaciones y requisitos de hardware: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
