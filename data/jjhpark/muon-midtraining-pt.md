# jjhpark/muon-midtraining-pt

## Resumen

muon-midtraining-pt es un modelo de lenguaje de 494 millones de parámetros entrenado desde cero por el usuario jjhpark, con una arquitectura tipo Qwen2.5-0.5B (embeddings atados y contexto de 4.096 tokens). No es un modelo pensado para producción, sino un artefacto de investigación: forma parte de una reproducción del artículo *Data Schedules and Learning Rate Schedules Should Be Designed Together* (arXiv 2610.29348) utilizando Megatron-LM y convertido posteriormente a formato Hugging Face mediante Megatron-Bridge.

El modelo se ha preentrenado sobre 200.000 millones de tokens del corpus DCLM-Baseline, con un total de 95.368 pasos y un batch efectivo de 512 secuencias de 4.096 tokens. La pérdida final en validación completa es de 2,8364 en DCLM y 2,1915 en FineMath, datos que permiten comparar el efecto de las estrategias de schedule de datos y de learning rate objeto del estudio.

Su relevancia es metodológica más que funcional: sirve como punto de referencia reproducible para investigar cómo interactúan los schedules de datos y de tasa de aprendizaje en el preentrenamiento a escala media, y como base para experimentos de midtraining. La licencia Apache 2.0 facilita su reutilización, aunque el autor no documenta idiomas soportados ni capacidades específicas más allá de la generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (Qwen2.5-0.5B-shaped), embeddings atados |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2 en configuración de 0,5B, con embeddings de entrada y salida atados y una ventana de contexto de 4.096 tokens. Se entrenó desde cero con Megatron-LM sobre 200.000 millones de tokens de DCLM-Baseline, en 95.368 pasos con un batch de 512 secuencias de 4.096 tokens (aproximadamente 2,1 millones de tokens por paso). Posteriormente se convirtió al formato Hugging Face con Megatron-Bridge.

El aspecto diferencial no es la arquitectura sino el régimen de entrenamiento: el modelo forma parte de la reproducción del artículo *Data Schedules and Learning Rate Schedules Should Be Designed Together* (arXiv 2610.29348), que estudia el diseño conjunto de los schedules de datos y de learning rate. No se documenta en la model card el uso de RLHF, DPO, SFT ni ninguna fase de alineación posterior al preentrenamiento, ni innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva como capacidad base derivada del preentrenamiento.
- Razonamiento y conocimiento general limitados por el tamaño (494M parámetros) y por la ausencia de fases de instrucción o alineación documentadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el corpus DCLM-Baseline es predominantemente en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso como checkpoint de referencia para experimentos de schedules de datos y learning rate.

## Casos de uso

- Reproducción de investigación sobre schedules: el modelo permite replicar y comparar los resultados del artículo arXiv 2610.29348 con Megatron-LM, gracias a la pérdida de validación publicada (DCLM 2,8364; FineMath 2,1915) como referencia.
- Estudio de midtraining: al ser un checkpoint intermedio de un pipeline de preentrenamiento, sirve para analizar el efecto del midtraining sobre la pérdida y la calidad del modelo antes de fases posteriores.
- Baseline de preentrenamiento a escala 0,5B: útil para comparar recetas de datos y de learning rate contra un modelo de tamaño y cómputo conocidos.
- Experimentos de conversión de formato: permite validar flujos Megatron-LM a Hugging Face vía Megatron-Bridge con un checkpoint real de 494M parámetros.
- Fine-tuning académico de bajo coste: con 494M parámetros y licencia Apache 2.0, es viable ajustarlo en una única GPU consumer para tareas de investigación posteriores al preentrenamiento.
- Evaluación de corpus: la pérdida en DCLM y FineMath permite usar el modelo como medidor de perplejidad relativa sobre dominios web y matemático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación:

| Conjunto de validación | Pérdida (validación completa) |
|---|---|
| DCLM | 2,8364 |
| FineMath | 2,1915 |

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 1 GB para los pesos (494M parámetros), más overhead de activaciones y caché KV para 4.096 tokens.
- VRAM en cuantización de 8 bits: en torno a 0,5-0,6 GB para los pesos; en 4 bits, alrededor de 0,3 GB (estimaciones, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente; para lotes grandes, A100 o H100 aportan margen.
- Cabe holgadamente en GPU consumer, incluida una RTX 3050 de 8 GB o una iGPU con suficiente memoria compartida para inferencia en cuantización baja.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta endpoints_compatible), llama.cpp/Ollama solo si se generan conversiones GGUF (no publicadas), vLLM previsiblemente compatible por arquitectura Qwen2 (no verificado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| muon-midtraining-pt | 494M | 4.096 | Apache 2.0 | Hugging Face (jjhpark) | Preentrenamiento desde cero, sin alineación; artefacto de investigación |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Hugging Face (Qwen) | Base e instruct; contexto 8x mayor y fases de alineación documentadas |
| SmolLM2-360M | 362M | 8.192 | Apache 2.0 | Hugging Face (HuggingFaceTB) | Base e instruct; orientado a despliegue en dispositivo |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Hugging Face (TinyLlama) | Mayor tamaño y 3T tokens de entrenamiento; contexto menor |

## Limitaciones y advertencias

- Modelo de investigación sin fases de instrucción, RLHF ni DPO documentadas: no es adecuado como asistente conversacional listo para producción.
- Riesgo elevado de alucinación y de respuestas incoherentes por el tamaño reducido y la ausencia de alineación.
- Contexto limitado a 4.096 tokens, muy por debajo de los 32.768 de Qwen2.5-0.5B.
- Idiomas soportados no documentados; el corpus DCLM-Baseline es mayoritariamente anglófono, por lo que el rendimiento en castellano es incierto.
- Sesgos no evaluados: no se han publicado análisis de sesgo, toxicidad ni evaluaciones de seguridad.
- Sin benchmarks publicados (MMLU, HumanEval, GSM8K): no es posible comparar su calidad funcional con alternativas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de alineación y de garantías hace desaconsejable su uso en producción sin evaluación previa.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026; no hay evidencia de mantenimiento ni de soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjhpark/muon-midtraining-pt
- Artículo de referencia: *Data Schedules and Learning Rate Schedules Should Be Designed Together*, arXiv 2610.29348 (https://arxiv.org/abs/2610.29348)
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- Megatron-Bridge: https://github.com/NVIDIA-NeMo/Megatron-Bridge
- Corpus DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
