# credible-ai/qwen3.5-4B-40domains-dirichlet-exponential-gsm8k

## Resumen

El modelo `qwen3.5-4B-40domains-dirichlet-exponential-gsm8k` es un artefacto de investigación publicado por el colectivo credible-ai para reproducir los experimentos del artículo LinMix ("Data Mixing as Linear Domain Attribution", arXiv:2610.37390). Se trata de un modelo de lenguaje de 3.700 millones de parámetros entrenado desde cero con una arquitectura tipo Qwen3.5, no de un ajuste fino de un modelo existente. Su propósito no es el uso general, sino servir como evidencia empírica de una metodología de mezcla de datos (data mixing) optimizada para una tarea concreta: GSM8K.

El modelo se entrenó sobre 80.000 millones de tokens procedentes de tres corpus (WebOrganizer Corpus-200B, Stack-Edu y Nemotron-CC-Math) mezclados sobre 40 dominios (24 temas de WebOrganizer, 15 lenguajes de programación y matemáticas). Los pesos de mezcla se optimizaron mediante Olmix, que ajusta un sustituto exponencial sobre un enjambre Dirichlet de modelos proxy de 100M de parámetros. El resultado es una receta de mezcla que maximiza el rendimiento en GSM8K y que se distribuye junto al modelo en forma de archivo `mix.json`.

Es relevante para investigadores interesados en metodologías de selección y mezcla de datos de preentrenamiento, en la reproducibilidad de experimentos de data mixing a escala de 4B parámetros y en el estudio de cómo las decisiones de mezcla afectan a capacidades específicas (razonamiento matemático, en este caso). No debe confundirse con un modelo conversacional o de propósito general: la model card lo describe explícitamente como un artefacto de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 32 capas, hidden size 2560, entrenado desde cero |
| Parámetros totales | 3.699.158.016 (3,7B) |
| Parámetros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en bfloat16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3.5, implementado mediante la clase `Qwen3_5ForCausalLM` de Transformers (requiere versión >= 5.2). Cuenta con 32 capas y un tamaño oculto de 2560, lo que da un total de 3,7B parámetros. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens. El entrenamiento se realizó desde cero (no es un ajuste fino) con la librería OLMo-core de AI2, sobre 80.000 millones de tokens.

Los datos de entrenamiento provienen de tres fuentes: WebOrganizer Corpus-200B (derivado del pool DCLM 1b-1x, CC-BY-4.0, sujeto a los términos de Common Crawl), Stack-Edu (los 15 subconjuntos de lenguajes, bajo los términos de The Stack v2) y Nemotron-CC-Math-v1 (subconjunto 4plus, bajo el NVIDIA Data Agreement for Model Training). La mezcla se organiza en 40 dominios y los pesos se optimizaron con Olmix mediante un ajuste exponencial sobre un enjambre Dirichlet de modelos proxy de 100M de parámetros (`credible-ai/qwen3.5-100M-40domains-dirichlet`), con GSM8K como objetivo. La model card no menciona uso de RLHF, DPO ni técnicas de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento matemático orientado a problemas tipo GSM8K, ya que la mezcla de datos se optimizó explícitamente para ese benchmark.
- Generación de código en los 15 lenguajes cubiertos por Stack-Edu, al haber incluido esos subconjuntos en el preentrenamiento.
- Cobertura de 24 temas web de WebOrganizer, lo que aporta conocimiento general de dominio web.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no hay indicios en la información proporcionada).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de data mixing: el modelo y su `mix.json` permiten replicar los resultados del artículo LinMix y validar la metodología Olmix a escala de 4B parámetros, comparando con los proxies de 100M.
- Investigación en atribución lineal de dominios: sirve como punto de control para estudiar cómo la proporción de cada dominio en la mezcla afecta a métricas concretas como GSM8K.
- Estudio de recetas de preentrenamiento: al conocerse la mezcla exacta y las fuentes de datos, es útil para analizar el impacto de corpus como Stack-Edu o Nemotron-CC-Math en el rendimiento matemático.
- Generación de código en entornos de investigación: al haberse entrenado con los 15 subconjuntos de Stack-Edu, puede emplearse para experimentos controlados de generación de código en inglés, siempre con validación humana.
- Evaluación comparativa de arquitecturas Qwen3.5: al ser un modelo entrenado desde cero con esa arquitectura, permite aislar el efecto de la mezcla de datos frente al de otros factores.
- Docencia y formación en técnicas de mezcla de datos: el par modelo + `mix.json` + código en GitHub constituye un ejemplo didáctico completo de un pipeline de optimización de mezclas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la mezcla se optimizó para GSM8K, pero no reporta la puntuación obtenida ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 9 y 12 GB según longitud de contexto y batch.
- Cuantización: la información proporcionada no incluye versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors en bfloat16.
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o inferencia a gran escala; para inferencia en bfloat16 bastan GPUs con 16 GB o más (RTX 4090, RTX A4000 16 GB, L4 24 GB).
- ¿Cabe en GPU de consumo? Sí, en bfloat16 cabe en una RTX 4090 (24 GB) con margen; en GPUs de 12-16 GB requeriría cuantización a 8 bits o menor, que no está publicada.
- Opciones de despliegue: Transformers (versión >= 5.2, imprescindible por la clase `Qwen3_5ForCausalLM`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible y dependerían de que soporten la arquitectura Qwen3.5.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4B-40domains-dirichlet-exponential-gsm8k | 3,7B | no disponible | MIT | Artefacto de investigación (data mixing) | HuggingFace |
| Qwen3.5 base (4B, referencia de arquitectura) | ~4B | no disponible | no disponible | Modelo de propósito general | no disponible en la información |
| Modelos proxy `qwen3.5-100M-40domains-dirichlet` | 100M | no disponible | no disponible | Proxy para optimización de mezclas | HuggingFace (credible-ai) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo califica explícitamente como artefacto de investigación para reproducir experimentos, no para uso en producción.
- Solo entrenado y evaluado en inglés; no hay evidencia de capacidades multilingües.
- La mezcla de datos está sobreoptimizada para GSM8K, lo que puede penalizar el rendimiento en otras tareas fuera de ese benchmark.
- Riesgo de alucinación: al no haber pasado por RLHF ni DPO, no hay alineación ni mitigación de respuestas incorrectas o inseguras.
- Sesgos: los corpus de origen (Common Crawl, Stack-Edu) arrastran sesgos web y de código; no se documentan evaluaciones de sesgo.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia MIT para los pesos, pero los datos de entrenamiento tienen términos propios (Common Crawl, The Stack v2, NVIDIA Data Agreement) que pueden imponer restricciones adicionales al uso derivado; conviene revisarlos antes de cualquier uso comercial.
- No se redistribuyen las secuencias tokenizadas de Stack-Edu ni de Nemotron-CC-Math, lo que limita la reproducibilidad completa del pipeline de datos.
- Requiere Transformers >= 5.2 por la arquitectura Qwen3.5; versiones anteriores no podrán cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-dirichlet-exponential-gsm8k
- Modelo proxy 100M: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Documentación de `Qwen3_5ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset HuggingFaceTB/stack-edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset nvidia/Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado credible-ai/weborganizer-corpus-200b-tokenized: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- OLMo-core: https://github.com/allenai/OLMo-core
