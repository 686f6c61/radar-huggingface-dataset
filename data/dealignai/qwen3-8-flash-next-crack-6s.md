# dealignai/Qwen3.8-Flash-Next-CRACK-6S

## Resumen

El modelo `dealignai/Qwen3.8-Flash-Next-CRACK-6S` es una variante "abliterated" (sin rechazos) del modelo base `JANGQ-AI/Qwen3.8-Flash-Next-JANG_6S`, que a su vez es la capa superior (tier JANG_6S) de la familia experimental `qwen4_exp` de Alibaba. Se trata de un modelo de lenguaje multimodal de gran tamaño, con arquitectura de mezcla de expertos (MoE) de aproximadamente 180 mil millones de parámetros totales y 6 mil millones activos por token. Incluye cabezales de visión y vídeo, razonamiento configurable (off/low/xhigh), soporte de herramientas y un cabezal nativo de predicción multi-token (MTP). El autor, `dealignai`, ha eliminado el comportamiento de rechazo (refusal) del modelo original, manteniendo las capacidades de deliberación, uso de herramientas y multimodalidad.

Este modelo está pensado como un artefacto de investigación, no como un producto listo para producción. Su relevancia radica en que demuestra cómo la técnica de "abliteration" puede aplicarse a un MoE híbrido de última generación sin degradar significativamente el rendimiento en tareas estándar (MMLU cae solo 1,62 puntos porcentuales) y manteniendo una alta tasa de cumplimiento en benchmarks de daño real (HarmBench). Está disponible en formato MLX para Apple Silicon, con pesos en safetensors y una licencia Qwen Community 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: Gated DeltaNet + Qwen Sparse Attention, hashed n-gram embedding, cabezal MTP nativo, torres de visión y vídeo |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | 6B (por token) |
| Longitud de contexto | no disponible (no se especifica en la información proporcionada) |
| Tipos de cuantizacion | JANG mixed-precision (MLX affine), cuantización de KV-cache; se mencionan tags `imatrix` y `awq` pero sin detalle |
| Idiomas soportados | inglés, chino |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (26 shards), MLX |

## Arquitectura y entrenamiento

La arquitectura combina un mecanismo de atención híbrida: Gated DeltaNet (una variante de atención lineal con compuertas) junto con Qwen Sparse Attention, sobre una base de 512 expertos en MoE con 6 mil millones de parámetros activos. Además incorpora un embedding basado en n-gramas con hash, un cabezal de predicción multi-token (MTP) nativo y torres de visión y vídeo. El modelo base fue entrenado por Alibaba como parte de la serie experimental `qwen4_exp`, aunque no se proporcionan detalles sobre el dataset de entrenamiento, número de tokens ni técnicas de alineación (RLHF/DPO). La variante CRACK fue creada mediante "abliteration", un proceso que elimina los pesos responsables del comportamiento de rechazo, preservando el resto de capacidades. No se indica si hubo fine-tuning adicional o solo modificación de pesos.

## Capacidades

- Generación de texto y razonamiento multinivel: soporta modos `chat`, `think` y `max`, controlables mediante `enable_thinking` y `reasoning_effort` en `chat_template_kwargs`.
- Tool calling: usa el parser XML de Qwen (`tool_parser: "qwen"`), emitiendo llamadas a funciones en formato `<function=name><parameter=…>` dentro de etiquetas `<tool_call>`.
- Capacidades de agente: puede encadenar múltiples pasos de razonamiento y uso de herramientas.
- Multimodalidad: comprensión de imágenes (descrita como "intacta" en el modelo CRACK) y torre de vídeo preservada del modelo base.
- Predicción multi-token (MTP): cabezal nativo disponible, activable en tiempo de servicio con `--native-mtp-depth N`.
- Multilingüe: inglés y chino.
- Sin censura: el comportamiento de rechazo ha sido eliminado, lo que permite respuestas a peticiones que normalmente serían bloqueadas.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el impacto de la abliteration en modelos MoE de gran escala, midiendo tasas de cumplimiento y coherencia en escenarios de daño real (HarmBench).
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que requieran explorar temas tabú o controvertidos sin filtros automáticos.
- Desarrollo de agentes conversacionales con herramientas: su soporte nativo de tool calling y razonamiento multinivel lo hace adecuado para prototipos de asistentes que necesiten ejecutar acciones externas (búsquedas, APIs) en inglés o chino.
- Análisis de contenido visual: al mantener la torre de visión, puede describir imágenes y vídeos, útil para tareas de anotación o moderación (aunque sin garantías de seguridad).
- Evaluación de robustez de modelos: su alto ASR en HarmBench lo convierte en un banco de pruebas para estudiar cómo los modelos abliterated responden a prompts maliciosos, útil para desarrollar contramedidas.
- Experimentación con predicción multi-token: el cabezal MTP nativo permite probar técnicas de decodificación especulativa o aceleración de inferencia en entornos MLX.

## Benchmarks y rendimiento

| Benchmark | Baseline (JANG_6S) | CRACK | Δ |
|---|---|---|---|
| MMLU (logit, 2280 held-out) | 87,72% | 86,10% | −1,62 pp |
| HarmBench-320 ASR (reasoning off, max=300) | — | 89,7% | — |
| HarmBench-320 ASR (reasoning low, max=800) | — | 96,2% | — |
| HarmBench-320 ASR (reasoning xhigh, max=1500) | — | 97,2% | — |

El modelo reporta cero rechazos duros en las 960 filas evaluadas (320 por nivel de razonamiento). Solo una fila generó salida incoherente (bucle de completación en nivel xhigh). La velocidad medida en un Apple M5 Max (128 GB) es de 50,9 tokens por segundo en modo greedy sin decodificación especulativa, con una media de 43,03 tok/s durante una ejecución completa de HarmBench-320.

## Requisitos de hardware

- El repositorio ocupa 114,1 GB en disco (26 shards safetensors, ~106 GB de pesos).
- Diseñado para Apple Silicon con MLX; la velocidad reportada se obtuvo en un M5 Max con 128 GB de RAM unificada.
- No se proporcionan requisitos de VRAM para GPUs NVIDIA o AMD; al ser un MoE de 180B con 6B activos, podría ejecutarse en GPUs con suficiente memoria (p. ej., 80 GB o más) usando cuantización, pero no hay datos oficiales.
- Runtime recomendado: vMLX (`vmlx-engine serve dealignai/Qwen3.8-Flash-Next-CRACK-6S --port 8888`), que soporta mixed-precision JANG, cuantización de KV-cache, reutilización de prefix-cache y MTP nativo.
- Alternativas: cualquier runtime compatible con MLX o safetensors (llama.cpp, Ollama, TGI) siempre que soporte la arquitectura híbrida y el parser de herramientas Qwen.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Sin embargo, por su tamaño y arquitectura (MoE ~180B, 6B activos, multimodal, razonamiento), podría situarse en la misma categoría que otros MoE grandes como Qwen3-235B-A22B, DeepSeek-V3 o Llama 3.1 405B, aunque con la particularidad de ser una variante abliterated y experimental (qwen4_exp). No se pueden aportar cifras concretas de comparación sin más datos.

## Limitaciones y advertencias

- Modelo "uncensored": la eliminación del rechazo implica un alto riesgo de generar contenido dañino, ilegal o éticamente problemático. El propio autor lo declara como "artefacto de investigación" y advierte que la descarga implica aceptar la responsabilidad del uso.
- Alto ASR en HarmBench (89,7%–97,2%): el modelo cumple con la mayoría de peticiones de daño real, lo que lo hace inadecuado para despliegues públicos o comerciales sin salvaguardas adicionales.
- Licencia Qwen Community 1.0: tiene restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos completos antes de cualquier uso.
- Modelo experimental: al ser parte de `qwen4_exp`, puede presentar comportamientos inestables o no documentados; la única fila de garbage en HarmBench sugiere posibles bucles de generación en niveles altos de razonamiento.
- Idiomas limitados: solo inglés y chino; no se garantiza calidad en otros idiomas.
- Sin datos de contexto: no se especifica la longitud máxima de contexto, lo que dificulta planificar tareas que requieran ventanas largas.
- Requisitos de hardware elevados: aunque es un MoE con 6B activos, los pesos completos ocupan ~106 GB, lo que limita su ejecución a equipos con mucha memoria (Apple Silicon de gama alta o GPUs con gran VRAM).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Qwen3.8-Flash-Next-CRACK-6S
- Modelo base: https://huggingface.co/JANGQ-AI/Qwen3.8-Flash-Next-JANG_6S
- Runtime vMLX: https://vmlx.net
