# FINAL-Bench/Darwin-180B-RSI

## Resumen
Darwin-180B-RSI es un modelo de lenguaje multimodal de tipo vision-lenguaje desarrollado por FINAL-Bench (asociado al laboratorio VIDRAFT) y publicado en Hugging Face bajo licencia Qwen Community 1.0. Se construye sobre la familia Qwen 3.8, concretamente hereda las capas de expertos de Qwen3.8-Flash-Next y reconstruye las capas de atención y de experto compartido mediante un proceso de auto-mejora recursiva (recursive self-improvement, RSI) a nivel de modelo. Con 179.999.981.459 parámetros reales en safetensors (180B), es un modelo MoE disperso de gran escala orientado a razonamiento experto, matemáticas, ciencia, derecho y parsing de documentos.

El modelo destaca por combinar una ventana de contexto de 262.000 tokens con atención híbrida (atención lineal más atención completa), lo que permite razonamiento de cadena de pensamiento (thinking) extendido hasta 131K tokens en las evaluaciones. Incorpora además una innovación propietaria denominada Zero-Token-Confidence (ZTC), orientada a la estimación de confianza y detección de alucinaciones, y un modo de pensamiento explícito para tareas STEM y legales.

Su relevancia actual radica en los resultados declarados por el autor: primer modelo de pesos abiertos en razonamiento matemático y científico en el ranking SuperCLUE de noviembre de 2026 (73,68), por delante de DeepSeek-V4.1-Flash y Gemini-4-Argon, y con puntuaciones muy altas en GPQA Diamond (94,44), MMLU-Pro (88,12) y AIME 2026 (100,0 con voto mayoritario). Es el único modelo coreano del tablero y se distribuye con soporte para vLLM y API compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atención híbrida (lineal + completa); vision-lenguaje |
| Parametros totales | 179.999.981.459 (180B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.000 tokens (262K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko, zh, ja, multilingual |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (repo de 360 GB) |

## Arquitectura y entrenamiento
La arquitectura es un transformer de mezcla de expertos (MoE) disperso con atención híbrida: combina capas de atención lineal con capas de atención completa, lo que habilita el contexto largo de 262K tokens con un coste computacional reducido en las capas lineales. El modelo es multimodal (pipeline image-text-to-text), con capacidades de visión integradas para tareas como MMMU-Pro y parsing de documentos. Según la model card, las capas de expertos se heredan de Qwen3.8-Flash-Next y solo se reconstruyen las capas de atención y de experto compartido mediante auto-mejora recursiva (RSI) a nivel de modelo, un enfoque que el autor denomina model-level RSI.

No se dispone de datos sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. La model card menciona el modo thinking (cadena de pensamiento) con presupuestos de hasta 131K tokens en evaluación, y la innovación Zero-Token-Confidence (ZTC) para estimación de confianza y detección de alucinaciones. Se referencia el paper arXiv:2605.14386 y arXiv:2609.20269, aunque su contenido no está disponible en la información proporcionada.

## Capacidades
- Generación de texto y razonamiento experto en matemáticas, ciencia y STEM, con modo thinking y cadenas de pensamiento de hasta 131K tokens.
- Razonamiento multimodal: comprensión de imágenes y texto (image-text-to-text), evaluado en MMMU-Pro.
- Razonamiento legal: resolución de preguntas de opción múltiple y preguntas abiertas (LEXam, LEXam-hard).
- Parsing de documentos multilingüe y OCR, con puntuación en MDPBench.
- Salida estructurada y cumplimiento de formato (IFStruct v1.0), con soporte para tool calling y function calling según los tags del modelo.
- Capacidades multilingües en inglés, coreano, chino, japonés y otros idiomas.
- Estimación de confianza y detección de alucinaciones mediante Zero-Token-Confidence (ZTC).
- Soporte de agentes y razonamiento multi-paso a través del modo thinking y la ventana de 262K tokens.
- Despliegue compatible con vLLM y API compatible con OpenAI.

## Casos de uso
- Razonamiento científico y matemático asistido: el modelo puede resolver problemas de nivel graduado y competición (GPQA Diamond, AIME) con cadenas de pensamiento largas, útil en herramientas de investigación y tutoría avanzada.
- Revisión legal y análisis de contratos: con contexto de 262K tokens puede procesar expedientes completos y responder preguntas de opción múltiple o abiertas, como demuestra su rendimiento en LEXam.
- Parsing y extracción de documentos multilingües: adecuado para pipelines de OCR y digitalización de documentos en inglés, coreano, chino y japonés, con salida estructurada verificable.
- Generación de código y salida estructurada en producción: su alta tasa de cumplimiento en IFStruct (98,95) y el soporte de tool calling lo hacen apto para integraciones en pipelines de CI/CD y agentes automatizados.
- Asistencia multimodal en análisis de imágenes técnicas: interpretación de diagramas, gráficos y capturas en entornos de ingeniería o educación, gracias a sus capacidades vision-language.
- Detección de alucinaciones en sistemas críticos: el mecanismo ZTC permite estimar confianza en las respuestas y activar revisiones humanas en dominios de alto riesgo.
- Agentes autónomos multi-paso: la ventana de 262K tokens y el modo thinking permiten mantener estado y razonamiento prolongado en flujos de trabajo complejos.

## Benchmarks y rendimiento
Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| GPQA Diamond | Accuracy (voto mayoritario, hasta 16 muestras, thinking 131K) | 94,44 |
| MMLU-Pro | Accuracy (muestra única, thinking 131K) | 88,12 |
| MMMU-Pro (vision) | Accuracy (voto mayoritario, 3 muestras, thinking 131K) | 79,48 |
| LEXam (MCQ, 4 opciones) | Accuracy (voto mayoritario, 4 muestras, thinking 32K) | 68,94 |
| LEXam-hard | Judge score (DeepSeek-R1-0528, muestra única) | 45,72 |
| MDPBench (public) | Overall (scoring oficial, thinking on) | 83,65 |
| IFStruct v1.0 | Pass rate (harness oficial, temperatura 0, thinking on) | 98,95 |
| AIME 2026 | Accuracy (voto mayoritario, 16 muestras, thinking 131K) | 100,0 |
| AIME 2026 | Accuracy media sobre 16 muestras | 98,75 |
| HMMT Feb 2026 | Accuracy (voto mayoritario, 16 muestras, thinking 131K) | 100,0 |
| HMMT Feb 2026 | Accuracy media sobre 16 muestras | 96,59 |

En el ranking SuperCLUE de noviembre de 2026, Darwin-180B-RSI-R3 obtuvo 73,68 en razonamiento matemático y científico, primer puesto entre modelos de pesos abiertos y segundo global entre 19 modelos, por detrás de GPT-6.1-Sol (76,32) y por delante de Gemini-4-Argon (71,05), DeepSeek-V4.1-Flash (71,05), Grok-4.7 (68,42) y Qwen3.8-Max (68,42). En el índice global de inteligencia quedó 9.º de 19 y 5.º entre pesos abiertos, con 43,08 frente a los 39,81 de su modelo padre Qwen3.8-Flash.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 180B parámetros en safetensors el peso completo en FP16 requiere aproximadamente 360 GB de memoria, por lo que la inferencia en precisión completa exige múltiples GPU.
- GPU recomendadas: el tag del modelo menciona B200; para despliegue en precisión completa se necesitan configuraciones multi-GPU de clase H100/B200. No hay datos oficiales sobre cuantizaciones para GPU de consumo.
- ¿Cabe en GPU de consumo? No en precisión completa; no se dispone de información sobre versiones cuantizadas (GGUF, AWQ, GPTQ) que permitan ejecución en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: vLLM y API compatible con OpenAI según los tags; no se confirma soporte de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Pesos abiertos | Razonamiento mat. y ciencia (SuperCLUE nov 2026) | Contexto | Licencia |
|---|---|---|---|---|---|
| Darwin-180B-RSI-R3 | VIDRAFT / FINAL-Bench | Si | 73,68 | 262K | qwen-community-1.0 |
| Qwen3.8-Flash (padre) | Alibaba | Si | 57,89 | no disponible | no disponible |
| DeepSeek-V4.1-Flash | DeepSeek | Si | 71,05 | no disponible | no disponible |
| GLM-5.3 | Zhipu AI | Si | 65,79 | no disponible | no disponible |
| Kimi-K3.1-Pro | Moonshot | Si | 63,16 | no disponible | no disponible |
| GPT-6.1-Sol | OpenAI | No | 76,32 | no disponible | propietaria |
| Gemini-4-Argon | Google | No | 71,05 | no disponible | propietaria |

## Limitaciones y advertencias
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (verified: false en el model-index).
- No se dispone de información sobre sesgos conocidos, datos de entrenamiento ni procesos de alineación (RLHF/DPO).
- Riesgo de alucinación inherente a los modelos generativos; el mecanismo ZTC mitiga pero no elimina el problema.
- El soporte de idiomas se limita a en, ko, zh, ja y multilingüe; el rendimiento en castellano no está documentado.
- La licencia qwen-community-1.0 impone restricciones que deben revisarse antes de uso comercial; el modelo se distribuye como license: other.
- El tamaño de 180B parámetros y el repo de 360 GB dificultan el despliegue en infraestructura modesta; no hay cuantizaciones oficiales publicadas.
- El contexto de 262K tokens puede degradar la calidad en los extremos de la ventana; no hay datos oficiales sobre rendimiento por posición.
- El origen de los datos de SuperCLUE corresponde a capturas de pantalla de noviembre de 2026 y no a una verificación reproducible.

## Enlaces
- Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- SuperCLUE (ranking general, noviembre 2026): https://www.superclueai.com/homepage
- Paper arXiv:2605.14386: https://arxiv.org/abs/2605.14386
- Paper arXiv:2609.20269: https://arxiv.org/abs/2609.20269
- Dataset GPQA Diamond: https://huggingface.co/datasets/Idavidrein/gpqa
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset MMMU-Pro: https://huggingface.co/datasets/MMMU/MMMU_Pro
- Dataset LEXam: https://huggingface.co/datasets/LEXam-Benchmark/LEXam
- Dataset LEXam-hard: https://huggingface.co/datasets/joelniklaus/LEXam-hard
- Dataset MDPBench: https://huggingface.co/datasets/Delores-Lin/MDPBench
- Dataset IFStruct v1.0: https://huggingface.co/datasets/LiquidAI/ifstruct-v1.0
- Dataset AIME 2026: https://huggingface.co/datasets/MathArena/aime_2026
- Dataset HMMT Feb 2026: https://huggingface.co/datasets/MathArena/hmmt_feb_2026
