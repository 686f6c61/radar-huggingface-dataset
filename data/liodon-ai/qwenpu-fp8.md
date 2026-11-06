# liodon-ai/QwenPU-FP8

## Resumen

QwenPU-FP8 es una cuantización FP8 dinámica del modelo divagr1925/QwenPU, publicada por Liodon AI, un colectivo de I+D open source centrado en deep learning, sistemas agénticos y evaluación de NLP. El modelo resultante conserva la arquitectura del original (etiquetada como `qwen3_5_text` en los tags del repositorio) y reduce el peso en disco de 26,7 GB a 16,7 GB, con 13.364.479.936 parámetros totales según los safetensors del repositorio. Está pensado para servir en producción sobre GPUs NVIDIA con capacidad de cómputo 8.9 o superior, donde el formato FP8 aporta ventajas reales de memoria y velocidad.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de cuantización listo para despliegue con vLLM, TGI y SGLang, con instrucciones de arranque directas. Por otro, advierte de que el modelo base (QwenPU) no publica información sobre datos de entrenamiento, idiomas soportados ni resultados de benchmarks en la información disponible, lo que limita seriamente cualquier evaluación de calidad previa a su uso en producción.

El esquema de cuantización elegido, `FP8_DYNAMIC` mediante llm-compressor, aplica un cast por canal a los pesos (E4M3) y una cuantización dinámica por token de las activaciones en tiempo de inferencia. Al no requerir dataset de calibración, los pesos cuantizados son esencialmente un cast directo del original, sin sesgo introducido por una muestra de calibración. La capa `lm_head` se deja sin cuantizar, práctica estándar para preservar la calidad de la distribución de salida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5_text`); detalles internos no disponibles |
| Parámetros totales | 13.364.479.936 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (E4M3) dinámica: pesos por canal, activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo como `qwen3_5_text`, lo que sitúa la arquitectura en la familia Qwen 3.5 de texto, un transformer decoder-only. No se dispone de información sobre el número de capas, dimensión oculta, cabezas de atención, tipo de atención (completa, lineal o híbrida) ni sobre si emplea mezcla de expertos. Tampoco se documenta la ventana de contexto efectiva, un dato crítico para planificar el despliegue.

En cuanto al entrenamiento, la model card del artefacto cuantizado no aporta ningún detalle sobre el modelo base QwenPU: se desconoce el volumen de tokens, la composición del dataset, si hubo fases de RLHF, DPO u otro ajuste por preferencias, y qué innovaciones técnicas incorpora. La única información técnica verificable es la relativa al proceso de cuantización: llm-compressor con el esquema `FP8_DYNAMIC`, sin calibración, con cast por canal de pesos y cuantización dinámica por token de activaciones. Este esquema es el recomendado por el ecosistema vLLM para FP8 en inferencia y no introduce sesgos de calibración, pero tampoco corrige posibles deficiencias del modelo original.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad declarada con endpoints compatibles (`endpoints_compatible` en los tags).
- Ejecución optimizada en vLLM, TGI y SGLang con instrucciones de arranque documentadas.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible; no se declara ningún idioma en la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue de inferencia de texto a escala media en producción: con 13,36 mil millones de parámetros en FP8, el modelo ocupa unos 16,7 GB de pesos, lo que permite servirlo en una sola GPU de 24 GB (RTX 4090, L4 con margen ajustado) o en GPUs de 40-80 GB con holgura para KV cache. Adecuado para servicios de generación de texto donde el coste por token importa.
- Servicio de chat conversacional multi-turno: el tag `conversational` y el pipeline de text-generation indican que el modelo está orientado a diálogo. La longitud de contexto real debe verificarse empíricamente antes de fijar políticas de truncado.
- Backend de agentes con vLLM: la combinación de FP8, compatibilidad con endpoints y soporte de vLLM facilita integrarlo como motor de inferencia detrás de frameworks agénticos (LangChain, AutoGen, CrewAI), aunque la ausencia de datos sobre tool calling obliga a validar esa capacidad con pruebas propias.
- Evaluación comparativa de cuantizaciones: al ser un cast directo sin calibración, sirve como referencia limpia para medir la degradación introducida por FP8 frente al modelo base en tareas de generación libre.
- Prototipado en investigación: el colectivo Liodon AI mantiene herramientas de evaluación de LLM; este checkpoint puede usarse como sujeto de pruebas en pipelines de evaluación reproducibles.
- Fine-tuning posterior sobre el checkpoint cuantizado: no recomendado directamente en FP8; en su caso, partir del modelo base divagr1925/QwenPU y recuantizar después.
- Inferencia en GPUs Ada/Hopper con requisito de throughput: FP8 en H100/H200 o L40S ofrece el mejor equilibrio memoria-velocidad; en GPUs anteriores el runtime dequantiza y se pierde la ventaja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del artefacto cuantizado ni los resultados de búsqueda incluyen métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se documentan latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 16,7 GB en FP8 (tamaño del repo: 16,8 GB). Añadir KV cache y overhead del runtime; con contexto largo, presupuestar 20-24 GB o más.
- GPU con soporte FP8 nativo: capacidad de cómputo ≥ 8.9, es decir, RTX 40-series (4090, 4080), L4, L40S, H100, H200, B100, B200, GB10.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con margen limitado para KV cache; en RTX 4080 (16 GB) no cabe con holgura.
- En GPUs anteriores a Ada (A100, RTX 30-series), vLLM y TGI dequantizan a un formato soportado: funciona, pero se pierde la ventaja de memoria y velocidad del FP8.
- Opciones de despliegue documentadas: `vllm serve liodon-ai/QwenPU-FP8`, contenedor de TGI (`ghcr.io/huggingface/text-generation-inference`) y `python -m sglang.launch_server --model-path liodon-ai/QwenPU-FP8`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas directamente comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos verificables del artefacto frente a su modelo de origen.

| Modelo | Parámetros | Formato | Tamaño en disco | Contexto | Licencia |
|---|---|---|---|---|---|
| liodon-ai/QwenPU-FP8 | 13,36 B | FP8 (compressed-tensors) | 16,7 GB | no disponible | other |
| divagr1925/QwenPU (base) | no disponible | no disponible | 26,7 GB (según model card) | no disponible | other |

Comparación con alternativas de la misma categoría (por ejemplo, otros modelos de ~13B en FP8): no disponible.

## Limitaciones y advertencias

- El modelo base QwenPU no documenta datos de entrenamiento, idiomas ni evaluación; no hay evidencia publicada de su calidad.
- Riesgo de alucinación: no cuantificado; sin benchmarks no puede estimarse su fiabilidad factual.
- Licencia "other": es imprescindible revisar los términos del modelo base divagr1925/QwenPU antes de cualquier uso comercial; la licencia del artefacto cuantizado no aclara las restricciones heredadas.
- La cuantización FP8 puede degradar ligeramente la calidad frente al modelo original; no se han publicado mediciones de esa degradación.
- En GPUs con capacidad de cómputo inferior a 8.9, el runtime dequantiza y se pierden las ventajas de memoria y velocidad, además de añadir overhead.
- Sin datos de contexto máximo, no es posible dimensionar correctamente el KV cache ni garantizar conversaciones multi-turno largas.
- El modelo tiene 29 descargas y 0 likes en el momento de la consulta: adopción prácticamente nula y ausencia de validación por la comunidad.
- El identificador de arquitectura `qwen3_5_text` no garantiza compatibilidad con herramientas específicas de la familia Qwen; conviene verificar el tokenizador y la plantilla de chat antes de integrar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/QwenPU-FP8
- Árbol de ficheros: https://huggingface.co/liodon-ai/QwenPU-FP8/tree/main
- Modelo base: https://huggingface.co/divagr1925/QwenPU
- Organización Liodon AI en Hugging Face: https://huggingface.co/liodon-ai
- GitHub de Liodon AI: https://github.com/Liodon-AI
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Vista de modelos de liodon-ai: https://hfviewer.com/liodon-ai
