# credible-ai/qwen3.5-4B-40domains-dirichlet-exponential-mbpp

## Resumen

qwen3.5-4B-40domains-dirichlet-exponential-mbpp es un modelo de lenguaje de 3.699.158.016 parámetros (aproximadamente 3,7B) desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix: Data Mixing as Linear Domain Attribution. No es un modelo de propósito general, sino un checkpoint preentrenado desde cero sobre una mezcla de datos con pesos optimizados específicamente para el benchmark MBPP (generación de código Python).

El modelo emplea una arquitectura tipo Qwen3.5 (`Qwen3_5ForCausalLM`, requiere transformers >= 5.2) con 32 capas y tamaño oculto de 2560, y fue entrenado con 80.000 millones de tokens procedentes del corpus WebOrganizer, Stack-Edu y Nemotron-CC-Math, mezclados sobre 40 dominios (24 temas de WebOrganizer, 15 lenguajes de programación y matemáticas). La mezcla de datos se optimizó mediante Olmix, un método de ajuste de sustituto exponencial sobre un enjambre Dirichlet.

Su relevancia es metodológica: sirve como referencia reproducible para estudiar cómo la atribución lineal de dominios y la optimización de mezclas de datos afectan al rendimiento en tareas concretas de código, más que como modelo listo para producción. La licencia MIT de los pesos facilita su uso en investigación, aunque los datos de entrenamiento tienen sus propias restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 32 capas, hidden size 2560 |
| Parametros totales | 3.699.158.016 (aproximadamente 3,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (pesos); datos de entrenamiento sujetos a sus propias licencias |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura Qwen3.5-like implementada en `Qwen3_5ForCausalLM`, con 32 capas, tamaño oculto de 2560 y 3,7B parámetros. Fue entrenado desde cero (no es un fine-tuning de un modelo Qwen existente) con el framework OLMo-core de Allen AI. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens.

El entrenamiento consumió 80.000 millones de tokens procedentes de tres fuentes: WebOrganizer/Corpus-200B (derivado de DCLM 1b-1x, CC-BY-4.0, sujeto a los términos de Common Crawl), HuggingFaceTB/stack-edu (los 15 subconjuntos de lenguajes, bajo los términos de The Stack v2) y nvidia/Nemotron-CC-Math-v1 (subconjunto 4plus, bajo el NVIDIA Data Agreement for Model Training). La innovación principal es la metodología de mezcla de datos: los pesos de mezcla sobre 40 dominios (24 temas web, 15 lenguajes de programación y matemáticas) se optimizaron con Olmix mediante un ajuste de sustituto exponencial sobre un enjambre Dirichlet, usando como proxy el modelo credible-ai/qwen3.5-100M-40domains-dirichlet. El objetivo de optimización fue el benchmark MBPP. El repositorio incluye un archivo `mix.json` con la mezcla exacta de datos de entrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Generación de código, particularmente en Python, dado que la mezcla se optimizó para MBPP.
- Cobertura de 15 lenguajes de programación presentes en Stack-Edu (los subconjuntos incluidos en la mezcla).
- Razonamiento matemático básico por la inclusión de Nemotron-CC-Math.
- Conocimiento web general procedente de los 24 temas de WebOrganizer.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de mezcla de datos: el checkpoint permite replicar los resultados del artículo LinMix sobre MBPP y comparar la mezcla optimizada con alternativas, usando `mix.json` para auditar la composición exacta del entrenamiento.
- Investigación en atribución lineal de dominios: sirve para estudiar cómo cada uno de los 40 dominios contribuye al rendimiento en tareas de código, al ser un modelo entrenado con pesos de mezcla conocidos y controlados.
- Evaluación de metodologías Olmix: permite validar el ajuste de sustituto exponencial sobre enjambres Dirichlet frente a otras estrategias de mezcla, comparando el modelo de 4B con el proxy de 100M.
- Generación de código Python en entornos de investigación: puede emplearse para probar prompts de generación de funciones sobre MBPP y analizar la calidad del código producido por un modelo entrenado específicamente para esa tarea.
- Estudio de tokenizadores alternativos: al usar GPT-NeoX-20B en lugar del tokenizador nativo de Qwen, permite analizar el impacto del tokenizador en el rendimiento de código y matemáticas.
- Baseline para experimentos de escalado: al existir un proxy de 100M con la misma mezcla, facilita estudios de escalado entre 100M y 4B parámetros sobre la misma distribución de datos.
- Docencia y formación en data mixing: útil como ejemplo práctico y reproducible de pipeline completo (selección de dominios, optimización de pesos, preentrenamiento con OLMo-core) para cursos de investigación en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,4 GB solo para pesos, más overhead de activaciones y caché KV (el tamaño del repo es de 7,4 GB).
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,7-4 GB (estimación a partir del número de parámetros; no se han publicado cuantizaciones oficiales).
- VRAM estimada en cuantización de 4 bits: aproximadamente 2-2,5 GB (estimación; requiere conversión manual a GGUF u otro formato, no disponible en el repo).
- GPU recomendadas: cabe en GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en bfloat16 o cuantizado. Para despliegue con mayor throughput, A100 o H100.
- Despliegue: al ser un modelo de transformers con arquitectura `Qwen3_5ForCausalLM` (transformers >= 5.2), requiere versiones recientes de las librerías. No se ha confirmado soporte en vLLM, llama.cpp, Ollama o TGI; la novedad de la arquitectura puede limitar la compatibilidad inicial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4B-40domains-dirichlet-exponential-mbpp | 3,7B | No disponible | MIT | Investigación en data mixing (MBPP) | Hugging Face |
| credible-ai/qwen3.5-100M-40domains-dirichlet | 100M (proxy) | No disponible | No disponible | Proxy de mezcla Dirichlet | Hugging Face |
| Qwen3.5 base (4B, si existe) | Aproximadamente 4B | No disponible | No disponible | Modelo de propósito general | No disponible en la información |

La comparación con modelos de propósito general del mismo tamaño no está disponible en la información proporcionada. El único comparable directo documentado es el proxy de 100M del mismo autor, usado para optimizar la mezcla.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación para reproducir experimentos, no para uso en producción.
- Entrenado únicamente en inglés; el rendimiento en otros idiomas no está garantizado.
- La mezcla de datos está optimizada para MBPP, lo que puede sesgar el modelo hacia código Python y penalizar otras tareas.
- Sesgos conocidos: no documentados explícitamente, pero hereda los sesgos de Common Crawl, Stack-Edu y Nemotron-CC-Math.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 3,7B entrenado con 80B tokens, es esperable un riesgo considerable en tareas de conocimiento factual.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia MIT para los pesos, pero los datos de entrenamiento están sujetos a los términos de Common Crawl, The Stack v2 y el NVIDIA Data Agreement; el uso comercial debe revisar esas condiciones.
- No se redistribuyen las secuencias de Stack-Edu ni de Nemotron-CC-Math, solo las de WebOrganizer tokenizadas, lo que limita la reproducibilidad completa del entrenamiento.
- Requiere transformers >= 5.2 por la arquitectura Qwen3.5, lo que puede romper pipelines existentes con versiones anteriores.
- Sin cuantizaciones publicadas ni confirmación de soporte en motores de inferencia populares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-dirichlet-exponential-mbpp
- Proxy de 100M: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Documentación de Qwen3.5 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset HuggingFaceTB/stack-edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset nvidia/Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- OLMo-core: https://github.com/allenai/OLMo-core
- Términos de Common Crawl: https://commoncrawl.org/terms-of-use
- Términos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
