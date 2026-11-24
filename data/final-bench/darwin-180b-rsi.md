# FINAL-Bench/Darwin-180B-RSI

## Resumen
Darwin-180B-RSI es un modelo multimodal de tipo image-text-to-text desarrollado por FINAL-Bench (con VIDRAFT como entidad asociada en la documentación) y construido sobre la arquitectura Qwen3.8. Se trata de un transformer de mezcla de expertos (MoE) disperso con atención híbrida (atención lineal combinada con atención completa) y una longitud de contexto de 262.144 tokens. Con 179.999.981.459 parámetros totales declarados en los safetensors, se posiciona en la categoría de modelos de gran escala orientados a razonamiento experto, matemáticas, ciencia, derecho y comprensión documental multimodal.

La propuesta diferencial del modelo es el entrenamiento mediante "recursive self-improvement" (RSI) a nivel de modelo: según la model card, hereda las capas de expertos de Qwen3.8-Flash-Next y reconstruye únicamente las capas de atención y de expertos compartidos mediante un proceso iterativo de auto-mejora. Incorpora además un mecanismo denominado ZTC (zero-token-confidence) para estimación de confianza y detección de alucinaciones, y un modo de razonamiento explícito ("thinking") con cadenas de pensamiento de hasta 131K tokens.

Su relevancia actual radica en los resultados declarados en el ranking SuperCLUE de noviembre de 2026, donde la variante Darwin-180B-RSI-R3 obtiene 73,68 en razonamiento matemático y científico, situándose como el primer modelo de pesos abiertos de la tabla y solo por detrás de GPT-6.1-Sol. Es, además, el único modelo coreano presente en dicho ranking, con soporte declarado de inglés, coreano, chino, japonés y otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atención híbrida (lineal + completa), basado en Qwen3.8 |
| Parametros totales | 179.999.981.459 (180B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko, zh, ja, multilingual |
| Licencia | qwen-community-1.0 (license: other, license_name: qwen-community-1.0) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura de mezcla de expertos dispersa (sparse MoE) sobre una base Qwen3.8, con atención híbrida que combina mecanismos de atención lineal y atención completa para sostener ventanas de contexto de 262K tokens con un coste computacional controlado. Según la documentación del autor, las capas de expertos provienen de Qwen3.8-Flash-Next, mientras que las capas de atención y los expertos compartidos se reconstruyen mediante un proceso de recursive self-improvement (RSI) a nivel de modelo, apoyado en un pipeline interno denominado VIDRAFT.

El entrenamiento incluye un modo de razonamiento con cadenas de pensamiento extensas (hasta 131K tokens en las evaluaciones declaradas) y un mecanismo ZTC (zero-token-confidence) orientado a la estimación de confianza y la detección de alucinaciones. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla el número de expertos ni cuántos se activan por token.

## Capacidades
- Generación de texto y razonamiento experto en matemáticas, ciencia y disciplinas STEM, con modo "thinking" y cadenas de pensamiento largas.
- Razonamiento multimodal image-text-to-text: comprensión de imágenes y documentos, con resultados declarados en MMMU-Pro (visión).
- Parsing de documentos y OCR multilingüe, evaluado en MDPBench.
- Cumplimiento de salida estructurada (structured output), evaluado en IFStruct v1.0 con una tasa de aprobación declarada del 98,95 %.
- Razonamiento jurídico, tanto en formato de opción múltiple (LEXam) como en preguntas abiertas (LEXam-hard).
- Capacidades multilingües declaradas en inglés, coreano, chino, japonés y otros idiomas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo thinking y la estimación de confianza ZTC son compatibles con flujos agénticos.
- Estimación de confianza y detección de alucinaciones mediante el mecanismo ZTC.
- Despliegue compatible con vLLM y API compatible con OpenAI, según los tags del repositorio.

## Casos de uso
- Razonamiento científico y matemático asistido: el modelo puede resolver problemas de nivel graduado y competición con cadenas de pensamiento de hasta 131K tokens, adecuado para herramientas de investigación que requieran verificación paso a paso.
- Análisis jurídico documental: con resultados declarados en LEXam y LEXam-hard, puede emplearse para responder preguntas de opción múltiple sobre normativa y para borradores de análisis jurídico abierto, siempre con revisión humana.
- Parsing y extracción de documentos multilingües: su evaluación en MDPBench y su contexto de 262K tokens permiten procesar contratos, informes o expedientes completos en varios idiomas en una sola pasada.
- Generación de salidas estructuradas en pipelines: con una tasa de aprobación declarada del 98,95 % en IFStruct, es apto para extracción de datos, rellenado de formularios y generación de JSON validable en sistemas de integración.
- Asistencia multimodal sobre imágenes técnicas: interpretación de diagramas, gráficos y capturas para tareas de soporte técnico o análisis de documentación visual, apoyándose en sus resultados en MMMU-Pro.
- Detección de respuestas de baja confianza: el mecanismo ZTC puede integrarse en sistemas de control de calidad para marcar respuestas potencialmente alucinadas antes de mostrarlas al usuario final.
- Despliegue en infraestructura propia con vLLM: la compatibilidad declarada con vLLM y API compatible con OpenAI facilita su integración como backend en aplicaciones existentes.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| GPQA Diamond | Accuracy (majority vote, hasta 16 muestras, 131K thinking) | 94,44 |
| MMLU-Pro | Accuracy (single sample, 131K thinking) | 88,12 |
| MMMU-Pro (vision) | Accuracy (majority vote, 3 muestras, 131K thinking) | 79,48 |
| LEXam (MCQ, 4 opciones) | Accuracy (majority vote, 4 muestras, 32K thinking) | 68,94 |
| LEXam-hard | Judge score (DeepSeek-R1-0528, single sample) | 45,72 |
| MDPBench (public) | Overall (official scoring, thinking on) | 83,65 |
| IFStruct v1.0 | Pass rate (official harness, temperature 0, thinking on) | 98,95 |
| AIME 2026 | Accuracy (majority vote, 16 muestras, 131K thinking) | 100,00 |
| AIME 2026 | Mean accuracy over 16 muestras | 98,75 |
| HMMT Feb 2026 | Accuracy (majority vote, 16 muestras, 131K thinking) | 100,00 |
| HMMT Feb 2026 | Mean accuracy over 16 muestras | 96,59 |

Resultados de SuperCLUE noviembre 2026 (índice de razonamiento matemático y científico):

| Modelo | Desarrollador | Pesos abiertos | Razonamiento matemático y científico |
|---|---|---|---|
| GPT-6.1-Sol | OpenAI | No | 76,32 |
| Darwin-180B-RSI-R3 | VIDRAFT | Sí | 73,68 |
| Gemini-4-Argon | Google | No | 71,05 |
| DeepSeek-V4.1-Flash | DeepSeek | Sí | 71,05 |
| Grok-4.7 | xAI | No | 68,42 |
| Qwen3.8-Max-0902 | Alibaba | No | 68,42 |
| GLM-5.3 | Zhipu AI | Sí | 65,79 |
| Kimi-K3.1-Pro | Moonshot | Sí | 63,16 |
| Qwen3.8-Flash (padre de Darwin-180B) | Alibaba | Sí | 57,89 |

Todos los resultados de benchmarks son datos declarados por el autor del modelo y no han sido verificados de forma independiente (verified: false en el model-index).

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 180B parámetros en safetensors (360 GB de repositorio), la inferencia en precisión completa requiere múltiples aceleradores de gran memoria; en cuantizaciones de 8 bits o 4 bits el requisito se reduce, pero no se han publicado cifras oficiales.
- GPU recomendadas: el tag del repositorio menciona B200; por tamaño, se requieren configuraciones multi-GPU de clase A100/H100/B200. No se especifican configuraciones mínimas validadas.
- ¿Cabe en GPU de consumo? No de forma realista para el modelo completo con 180B parámetros; se necesitaría cuantización agresiva y múltiples GPU, sin datos oficiales que lo confirmen.
- Opciones de despliegue: vLLM (declarado en los tags) y endpoint compatible con OpenAI; soporte de llama.cpp, Ollama o TGI no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos abiertos | Licencia | Razonamiento math/science (SuperCLUE nov 2026) |
|---|---|---|---|---|---|
| Darwin-180B-RSI | 180B (MoE) | 262K | Sí | qwen-community-1.0 | 73,68 |
| Qwen3.8-Flash (padre) | no disponible | no disponible | Sí | no disponible | 57,89 |
| DeepSeek-V4.1-Flash | no disponible | no disponible | Sí | no disponible | 71,05 |
| GLM-5.3 | no disponible | no disponible | Sí | no disponible | 65,79 |
| Kimi-K3.1-Pro | no disponible | no disponible | Sí | no disponible | 63,16 |

La comparación se limita a los datos publicados en la model card; no se dispone de parámetros, contexto ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias
- Todos los resultados de benchmarks son declarados por el autor y figuran como no verificados; deben interpretarse con cautela hasta que existan evaluaciones independientes.
- El uso de majority vote con hasta 16 muestras y 131K tokens de thinking infla los resultados respecto a una inferencia de una sola pasada; el rendimiento en producción con muestreo único será inferior (por ejemplo, 98,75 de media frente a 100,00 en AIME 2026).
- No se detalla la composición del dataset de entrenamiento ni si hubo RLHF/DPO, lo que dificulta evaluar sesgos y alineación.
- Riesgo de alucinación inherente a los modelos de razonamiento largo; el mecanismo ZTC se presenta como mitigación, pero no hay datos públicos de su eficacia.
- Cobertura idiomática declarada limitada a en, ko, zh, ja y multilingüe; el rendimiento en castellano no está documentado.
- Licencia qwen-community-1.0 (license: other): es necesario revisar los términos del archivo LICENSE del repositorio antes de un uso comercial, ya que las condiciones no se detallan en la información disponible.
- El tamaño de 180B parámetros implica costes de despliegue elevados y requisitos multi-GPU; no es adecuado para entornos con recursos limitados.
- El proceso de recursive self-improvement y la herencia de capas de Qwen3.8-Flash-Next no están descritos con detalle técnico verificable en la información disponible.

## Enlaces
- Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Licencia: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI/blob/main/LICENSE
- SuperCLUE: https://www.superclueai.com/homepage
- Paper referenciado (arXiv:2605.14386): https://arxiv.org/abs/2605.14386
- Paper referenciado (arXiv:2609.20269): https://arxiv.org/abs/2609.20269
- Assets de prensa (banner SuperCLUE): https://huggingface.co/datasets/VIDraft/press-assets/resolve/main/press/superclue_banner_darwin_2026-11.png
- Assets de prensa (índice de inteligencia): https://huggingface.co/datasets/VIDraft/press-assets/resolve/main/press/superclue_intelligence_index_2026-11.png
