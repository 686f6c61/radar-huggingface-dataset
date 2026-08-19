# dbirks/Qwen3.8-27B-W4A16-AutoRound

## Resumen

Qwen3.8-27B-W4A16-AutoRound es una cuantización int4 weight-only (W4A16) del modelo multimodal Qwen/Qwen3.8-27B, producida por el autor independiente dbirks utilizando Intel AutoRound y empaquetada en formato compressed-tensors para su uso directo con vLLM. El objetivo es reducir el peso del modelo de aproximadamente 52 GB en BF16 a unos 19,5 GB en disco, manteniendo una precisión casi sin pérdidas, de modo que pueda ejecutarse en GPUs NVIDIA de generación Ampere o posterior sin necesidad de hardware Blackwell.

El modelo base presenta una arquitectura híbrida GatedDeltaNet (atención lineal) combinada con capas de atención completa, un total de 64 capas (48 de atención lineal y 16 de atención completa), una torre de visión para entrada de imágenes y una ventana de contexto de 262 000 tokens. Aunque el nombre comercial indica 27B, los parámetros reales registrados en los safetensors son 6 260 690 960 (aproximadamente 6,26 mil millones), un dato relevante para dimensionar requisitos de hardware. La cuantización afecta únicamente al decoder de lenguaje, dejando la torre de visión, las proyecciones de control de recurrencia y la cabeza de salida en BF16.

Esta variante se presenta como la opción recomendada frente a su hermano NVFP4 (W4A4), ya que conserva mejor las capacidades de razonamiento y generación de código. Los resultados preliminares, obtenidos sobre el modelo arquitectónicamente idéntico Qwen3.6-27B, indican que W4A16 iguala a BF16 en HumanEval y preserva las matemáticas generativas, mientras que la variante NVFP4 colapsa en estas tareas. Es una opción práctica para desplegar un modelo multimodal de gran contexto en entornos de producción con GPUs convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GatedDeltaNet (atención lineal) + atención completa, multimodal con torre de visión; 64 capas (48 lineales + 16 completas) |
| Parametros totales | 6 260 690 960 (según safetensors; el nombre comercial indica 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | W4A16 (pesos int4, activaciones BF16), group size 128, simétrica; capas `in_proj_a`, `in_proj_b`, torre de visión, `mtp` y `lm_head` en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | compressed-tensors (pack-quantized), safetensors; auto-detectado por vLLM (kernel Marlin int4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 48 capas GatedDeltaNet, basadas en atención lineal con control de recurrencia, y 16 capas de atención completa tradicional. Esta mezcla busca equilibrar eficiencia computacional en secuencias largas con la capacidad de atención global. El modelo incluye además una torre de visión (visual tower) que permite procesar imágenes junto con texto, clasificándose como image-text-to-text.

La cuantización se realizó con Intel AutoRound (arXiv:2309.05516), un método de redondeo de pesos basado en descenso de gradiente firmado (SignRound) con reconstrucción por bloques. El esquema aplicado es W4A16: los pesos de las proyecciones lineales del decoder de lenguaje se cuantizan a int4 con group size 128 y simetría, mientras que las activaciones permanecen en BF16. Se excluyeron de la cuantización las proyecciones de control de recurrencia (`in_proj_a`, `in_proj_b`), la torre de visión completa, la cabeza MTP y `lm_head`, que se mantienen en BF16 para preservar la estabilidad numérica. La calibración se realizó sobre el dataset `NeelNanda/pile-10k` con 128 muestras, longitud de secuencia 2048 y 200 iteraciones de ajuste, con un coste de aproximadamente 35 minutos en una GPU Blackwell de 96 GB y un pico de 24 GB de VRAM.

No se realizó ningún entrenamiento adicional; se trata exclusivamente de una cuantización post-entrenamiento. El formato de salida es compressed-tensors, que vLLM detecta automáticamente a partir de `config.json` sin necesidad de flags adicionales.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés, con soporte de contexto largo de hasta 262 000 tokens.
- Comprensión de imágenes: al ser un modelo multimodal (image-text-to-text), puede procesar entradas visuales junto con texto, lo que permite tareas de descripción, análisis y respuesta a preguntas sobre imágenes.
- Razonamiento matemático y generación de código: los benchmarks preliminares indican que la cuantización W4A16 preserva estas capacidades, con HumanEval 0.86 y GSM8K 0.855.
- Despliegue eficiente en GPU: el kernel Marlin int4 permite ejecutar el modelo en cualquier GPU NVIDIA Ampere o más reciente, sin necesidad de hardware Blackwell.
- Compatibilidad con vLLM: el formato compressed-tensors es auto-detectado, facilitando la integración en entornos de producción con API compatible con OpenAI.
- Reproducibilidad: el proceso de cuantización está documentado con código Python y configuración exacta, permitiendo replicar el resultado.

## Casos de uso

- Asistentes conversacionales multimodales en producción: el modelo puede desplegarse con vLLM para servir un chatbot que acepte imágenes y texto, con una ventana de contexto de 262K tokens que permite mantener conversaciones largas y con mucho historial. Su tamaño reducido (19,5 GB) permite alojarlo en una sola GPU de 24 GB o más.
- Análisis de documentos con capturas o diagramas: gracias a la torre de visión, el modelo puede extraer información de imágenes, gráficos o capturas de pantalla, útil en flujos de automatización de oficina o soporte técnico.
- Generación de código asistida por contexto visual: un desarrollador puede adjuntar una captura de una interfaz o un error y pedir al modelo que genere o corrija código relacionado, aprovechando la precisión en HumanEval.
- Sistemas de atención al cliente con contexto largo: la ventana de 262K tokens permite procesar historiales completos de conversación, incluyendo imágenes enviadas por el usuario, para generar respuestas coherentes y contextualizadas.
- Investigación en cuantización de LLMs: el repositorio incluye el recetario completo de cuantización (dataset, iteraciones, configuración de capas), lo que lo convierte en un punto de partida para estudiar el impacto de W4A16 en arquitecturas híbridas.
- Prototipado rápido en hardware asequible: al no requerir Blackwell y caber en GPUs consumer de 24 GB (RTX 3090/4090), es adecuado para equipos de desarrollo que necesitan probar modelos multimodales sin acceso a infraestructura de gama alta.

## Benchmarks y rendimiento

Los resultados publicados son preliminares y se obtuvieron sobre el modelo arquitectónicamente idéntico Qwen3.6-27B, no sobre esta cuantización exacta. El autor indica que los números de recuperación para Qwen3.8-27B están en proceso de publicación. Los datos disponibles comparan la variante W4A16 con la variante NVFP4 (W4A4) del mismo modelo base:

| Benchmark | BF16 (referencia) | W4A16 (AutoRound) | NVFP4 (W4A4) |
|---|---|---|---|
| HumanEval | 0.86 | 0.86 | no disponible |
| GSM8K | no disponible | 0.855 | 0.207 |

Según la model card, W4A16 iguala a BF16 en HumanEval y preserva las matemáticas generativas, mientras que la variante NVFP4 colapsa en GSM8K. No se han publicado resultados adicionales (MMLU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 19,5 GB en disco; para inferencia con contexto de 8192 tokens (como en el ejemplo de vLLM), cabe en una GPU de 24 GB VRAM (RTX 3090, RTX 4090, A5000). Con contexto máximo de 262K tokens, se requeriría mucha más VRAM, probablemente 80 GB o más.
- GPU recomendadas: cualquier NVIDIA Ampere o más nueva (RTX 30xx, RTX 40xx, A100, A6000, H100, L40S, etc.) gracias al kernel Marlin int4. No se requiere Blackwell.
- Opciones de despliegue: vLLM es la opción principal y recomendada; el formato compressed-tensors es auto-detectado. También podría cargarse con transformers si se dispone de las dependencias adecuadas, aunque no se documenta explícitamente.
- Latencia y throughput: no disponible en la información proporcionada.
- Requisitos de cuantización (solo para reproducir): GPU con 96 GB VRAM (Blackwell) y 26 GB de RAM, aproximadamente 35 minutos de cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño en disco | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | 6,26B (nombre 27B) | 262K | Ninguna (BF16) | ~52 GB | Apache-2.0 | Modelo base original |
| dbirks/Qwen3.8-27B-W4A16-AutoRound | 6,26B (nombre 27B) | 262K | W4A16 int4 | ~19,5 GB | Apache-2.0 | Esta ficha; recomendada por el autor |
| dbirks/Qwen3.8-27B-NVFP4-AutoRound | 6,26B (nombre 27B) | 262K | W4A4 NVFP4 | no disponible | Apache-2.0 | Variante para Blackwell; degrada razonamiento |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para inglés; no se garantiza un rendimiento adecuado en otros idiomas, incluido el español.
- Evaluación preliminar: los benchmarks publicados provienen de un modelo arquitectónicamente idéntico (Qwen3.6-27B) y no de esta cuantización exacta; los resultados finales están pendientes de publicación.
- Cuantización parcial: la torre de visión, las proyecciones de recurrencia y la cabeza de salida permanecen en BF16, lo que aumenta el tamaño final respecto a una cuantización completa del modelo.
- Riesgo de alucinación: como todo LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Sesgos: no se documentan sesgos específicos, pero el entrenamiento del modelo base puede reflejar sesgos presentes en sus datos de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los términos del modelo base Qwen3.8-27B.
- Compatibilidad: el formato compressed-tensors está optimizado para vLLM; su uso con otros motores de inferencia puede requerir conversión adicional no documentada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante NVFP4 (hermano): https://huggingface.co/dbirks/Qwen3.8-27B-NVFP4-AutoRound
- Repositorio Intel AutoRound: https://github.com/intel/auto-round
- Repositorio compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Paper de AutoRound (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
