# ArchiveStudio/MiniCPM-SALA

## Resumen

MiniCPM-SALA es un modelo lingüístico híbrido de unos 9.500 millones de parámetros desarrollado por OpenBMB (publicado en Hugging Face por ArchiveStudio), diseñado para resolver el problema del coste computacional y de memoria de la atención densa en contextos extremadamente largos. Es, según sus autores, el primer modelo híbrido a gran escala que integra de forma efectiva atención dispersa (sparse attention) y atención lineal (linear attention) para modelar contextos de un millón de tokens.

La arquitectura combina el 25 % de capas con InfLLM-V2 (atención dispersa, para alta fidelidad en contexto largo) y el 75 % con Lightning Attention (atención lineal, para eficiencia global). Gracias a esta combinación, el modelo alcanza hasta 3,5 veces la velocidad de inferencia de Qwen3-8B con secuencias de 256K tokens y permite inferencia con 1M de tokens en GPU de consumo como la RTX 5090, algo inviable para un modelo denso equivalente por limitaciones de memoria.

Su relevancia actual radica en que aborda simultáneamente el "muro de cómputo" y el "muro de memoria" de los modelos densos, manteniendo capacidades generales comparables a modelos full-attention modernos mediante una receta de destilación denominada HALO. El modelo es el protagonista del reto SOAR 2026 (Sparse Operator Acceleration & Race), una competición con más de 100.000 USD en premios organizada junto a SGLang y NVIDIA para optimizar la inferencia a escala 9B con 1M de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 25 % InfLLM-V2 (sparse attention) + 75 % Lightning Attention (linear attention) |
| Parametros totales | 9.477.203.968 (≈9,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1M+ tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

MiniCPM-SALA emplea un mecanismo de atención híbrido denominado SALA (Sparse Attention and Linear Attention): el 25 % de las capas usa InfLLM-V2, un mecanismo de atención dispersa que aporta foco granular sobre detalles locales, y el 75 % restante usa Lightning Attention, una atención lineal que garantiza eficiencia global sobre el contexto completo. Esta combinación reduce drásticamente tanto el cómputo por token como la sobrecarga de la KV-cache frente a baselines densos.

En lugar de un entrenamiento desde cero, el modelo se obtiene mediante una transformación arquitectónica sobre pesos preentrenados (continue training de Transformer a híbrido), lo que reduce el presupuesto total de entrenamiento a aproximadamente el 25 % del que requeriría un modelo comparable entrenado desde cero. Sobre esta base se aplican dos innovaciones clave: HyPE (Hybrid Positional Embedding/Encoding), que armoniza el rendimiento en contextos cortos y largos y permite escalar a más de 1M de tokens con buena generalización de longitud, y HALO (Hybrid Attention via Layer Optimization), una receta de destilación que transfiere las capacidades de la atención densa a la arquitectura híbrida evitando la degradación severa típica de los modelos puramente lineales. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Contexto extremadamente largo: hasta 1M+ tokens, con inferencia verificada a 1M en NVIDIA A6000D y RTX 5090.
- Mantenimiento de capacidades generales (conocimiento, matemáticas, código) comparables a modelos full-attention modernos como Qwen3-8B, según los autores.
- Ventajas sustanciales en múltiples benchmarks de contexto largo frente a modelos densos equivalentes.
- Eficiencia de inferencia: hasta 3,5x la velocidad de Qwen3-8B a 256K tokens y menor overhead de KV-cache.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multimodales (visión, audio): no disponible.

## Casos de uso

- Analisis de documentos extensos: con 1M de tokens de contexto puede procesar de una vez contratos, informes financieros o expedientes completos sin segmentación, algo que Qwen3-8B no puede hacer por OOM a esa longitud.
- Chatbots con memoria de largo plazo: la atención híbrida permite mantener conversaciones con historiales enormes sin degradar la latencia, gracias al bajo coste de la KV-cache.
- Resumen de corpus técnicos: la atención dispersa (InfLLM-V2) preserva detalles locales mientras la atención lineal cubre el contexto global, ideal para resumir documentación de cientos de miles de tokens.
- Procesamiento de logs y trazas: la eficiencia a 256K-1M tokens permite analizar registros de sistemas completos en una sola pasada sobre GPU de consumo.
- Inferencia local en estación de trabajo: cabe en GPUs de consumo como la RTX 5090 incluso a contextos de 1M de tokens, adecuado para despliegues on-premise con datos sensibles.
- Investigación en arquitecturas híbridas: el modelo y su informe técnico son una referencia práctica para estudiar la conversión de Transformers densos a híbridos sparse+linear mediante destilación (HALO).
- Generación de código con repositorios grandes: su ventana de 1M tokens permite incluir bases de código completas en el prompt, manteniendo capacidades de código comparables a Qwen3-8B.

## Benchmarks y rendimiento

No se han publicado tablas de resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica cualitativamente que el modelo mantiene capacidades generales comparables a Qwen3-8B, logra ventajas sustanciales en múltiples benchmarks de contexto largo, y alcanza hasta 3,5x la velocidad de inferencia de Qwen3-8B a 256K tokens en A6000D. Para cifras concretas, consultar el informe técnico enlazado al final de la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,0 GB en safetensors (bf16/fp16 presumiblemente), por lo que se necesita al menos ~20 GB de VRAM para cargar el modelo completo; el consumo adicional por la KV-cache es significativamente menor que en modelos densos gracias a la atención lineal. No hay cifras oficiales de VRAM publicadas.
- GPU recomendadas: NVIDIA A6000D y RTX 5090 (los autores verifican inferencia a 1M de tokens en ambas). El reto SOAR se celebra sobre NVIDIA 6000D.
- Consumer GPU: sí, la model card afirma explícitamente que permite inferencia de 1M de tokens en GPUs de consumo como la RTX 5090.
- Despliegue: compatible con Hugging Face `transformers` (requiere `trust_remote_code=True`) y con SGLang mediante un fork específico (`OpenBMB/sglang`, rama `minicpm_sala`), que requiere CUDA 12.x, compilación de kernels `infllmv2_cuda_impl` y `sparse_kernel`, e instalación de `tilelang` y `flash-linear-attention`. No se menciona soporte para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: hasta 3,5x la velocidad de inferencia de Qwen3-8B a 256K tokens en A6000D; no se publican cifras absolutas de tokens/segundo.
- Temperatura recomendada por los autores: 0,9.

## Comparativa con modelos similares

| Caracteristica | MiniCPM-SALA | Qwen3-8B | MiniCPM4 (referencia de la familia) |
|---|---|---|---|
| Parametros | ≈9,5 B | 8 B | no disponible |
| Atencion | Hibrida: 25 % sparse (InfLLM-V2) + 75 % linear (Lightning Attention) | Full attention densa | no disponible |
| Contexto maximo | 1M+ tokens | no disponible (OOM a 1M segun los autores) | no disponible |
| Velocidad a 256K | 3,5x Qwen3-8B (A6000D) | Baseline | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 | no disponible |
| Idiomas | zh, en | multilingue | no disponible |

Nota: la comparativa se limita a los datos aportados en la model card; no se han publicado benchmarks numéricos comparativos en la información disponible.

## Limitaciones y advertencias

- Idiomas: el modelo está orientado a chino e inglés; no hay garantías de rendimiento en castellano u otros idiomas.
- Sesgos conocidos: no documentados en la información disponible; al derivar de pesos preentrenados, hereda presumiblemente los sesgos del modelo base.
- Riesgo de alucinación: no evaluado públicamente en la información disponible; aplicar las cautelas habituales en generación de texto.
- Requiere `trust_remote_code=True` y código personalizado (custom_code), lo que implica ejecutar código del autor y una superficie de mantenimiento adicional frente a arquitecturas nativas de transformers.
- El soporte SGLang exige un fork específico y compilación de kernels CUDA personalizados (infllmv2, sparse_kernel, tilelang, flash-linear-attention), lo que complica el despliegue en producción.
- No hay soporte documentado para cuantización, llama.cpp, Ollama, vLLM o TGI, lo que limita las opciones de despliegue ligero.
- Datos de entrenamiento (tokens, composición, RLHF/DPO) no publicados en la información disponible.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes más allá de las obligaciones estándar de atribución.
- El modelo es muy reciente (publicado en 2026) y con muy poca tracción comunitaria (345 descargas, 0 likes), por lo que la documentación y el soporte de terceros son escasos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArchiveStudio/MiniCPM-SALA
- Repositorio GitHub de MiniCPM (OpenBMB): https://github.com/OpenBMB/MiniCPM/
- Informe técnico (PDF en GitHub): https://github.com/OpenBMB/MiniCPM/blob/main/docs/MiniCPM_SALA.pdf
- Informe técnico alternativo: https://github.com/OpenBMB/MiniCPM/tree/main/report/MiniCPM_4_Technical_Report.pdf
- Paper InfLLM-V2 (arXiv): https://arxiv.org/abs/2509.24663
- Paper HyPE (arXiv): https://arxiv.org/abs/2601.22156
- Reto SOAR 2026: https://soar.openbmb.cn/
- Fork de SGLang para MiniCPM-SALA: https://github.com/OpenBMB/sglang (rama `minicpm_sala`)
- Comunidad (Discord): https://discord.gg/3cGQn9b3YM
