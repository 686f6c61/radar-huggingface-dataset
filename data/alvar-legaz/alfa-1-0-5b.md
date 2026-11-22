# alvar-legaz/Alfa-1-0.5B

## Resumen

Alfa 1 (0.5B) es un modelo de lenguaje pequeño de aproximadamente 520 millones de parámetros, bilingüe español/inglés, preentrenado desde cero por Minaya Research. Se distribuye como modelo base (no ajustado para conversación) y su propósito es ofrecer una alternativa ligera y de licencia permisiva para tareas de generación de texto, experimentación e investigación en entornos con recursos limitados. El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos derivados.

La arquitectura es un decodificador tipo Llama con 18 capas, dimensión oculta de 1536, 24 cabezas de atención con 6 cabezas KV (GQA), FFN SwiGLU de 4096, RoPE con theta 10 000, embeddings atados y un contexto de 8192 tokens. El tokenizador es un BPE propio de 48 000 tokens. El entrenamiento consumió 80 000 millones de tokens, con una fase estable de calendario WSD (65 000 M) y una fase de annealing (15 000 M) con decaimiento 1-√ hasta una tasa de aprendizaje de 1e-6, alcanzando una pérdida de validación final de 1,1322.

El modelo resulta relevante por su tamaño reducido (cabe en GPUs de consumo e incluso en dispositivos como Raspberry Pi con cuantización Q4_K_M), su enfoque explícito en español y su publicación en múltiples formatos (safetensors, GGUF F16, Q8_0 y Q4_K_M). No obstante, sus resultados en benchmarks son modestos, coherentes con su escala, y el propio autor advierte de que no está alineado y de que alucina con facilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador tipo Llama (transformer), 18 capas, dim. 1536, 24 cabezas de atención con 6 cabezas KV (GQA), FFN SwiGLU de 4096, RoPE (θ = 10 000), embeddings atados |
| Parametros totales | 519.691.776 (~520 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | bf16 (safetensors), GGUF F16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Español (es) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decodificador tipo Llama, con 18 capas, dimensión de 1536, 24 cabezas de atención y 6 cabezas KV mediante Grouped-Query Attention (GQA), lo que reduce el coste de memoria del KV cache durante la inferencia. La FFN usa SwiGLU con dimensión intermedia de 4096, emplea RoPE con theta 10 000 y embeddings atados entre entrada y salida. El tokenizador es un BPE propio de 48 000 tokens, y el token de fin de documento es `<|endofstory|>`, usado como EOS del modelo base.

El preentrenamiento se realizó desde cero sobre 80 000 millones de tokens, divididos en 65 000 M en la fase estable de un calendario de warmup-stable-decay (WSD) y 15 000 M en la fase de annealing, con decaimiento 1-√ hasta una tasa de aprendizaje de 1e-6. El corpus es mayoritariamente español e inglés e incluye web filtrada, Wikipedia, textos académicos y técnicos, matemáticas y código. La pérdida de validación final reportada es de 1,1322. No se menciona en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación; el modelo se distribuye como base sin ajuste conversacional.

## Capacidades

- Generación de texto autoregresiva en español e inglés, orientada a continuación de texto y modelado de lenguaje.
- Capacidad básica de razonamiento y conocimiento factual, limitada por su escala (MMLU 30,9 %).
- Capacidad básica de matemáticas y código, con resultados muy bajos en GSM8K (5,4 %) y HumanEval (5,5 %).
- Soporte de tool calling / function calling: no disponible en el modelo base; el autor remite a la variante Instruct para uso conversacional y agente.
- Soporte de agentes y razonamiento multi-paso: no disponible en el modelo base.
- Capacidades multilingües limitadas a español e inglés.
- Capacidades especiales: no se documentan modo thinking, visión ni audio.

## Casos de uso

- Experimentación académica en preentrenamiento: el modelo sirve como referencia reproducible de un LM pequeño bilingüe entrenado desde cero, útil para estudiar dinámicas de escalado, calendarios WSD y annealing.
- Generación de texto asistida en español en entornos con recursos limitados: con la cuantización Q4_K_M (329 MB) puede ejecutarse en dispositivos de baja memoria como Raspberry Pi para completar frases o generar borradores cortos.
- Prototipado rápido de pipelines de NLP: al caber en una GPU de consumo y en formatos GGUF, permite validar integraciones con llama.cpp o transformers antes de migrar a modelos mayores.
- Fine-tuning específico de dominio: al ser un modelo base con licencia Apache 2.0, puede ajustarse para tareas concretas (clasificación de texto, extracción de entidades, resumen) con presupuestos de cómputo reducidos.
- Evaluación de técnicas de cuantización: la disponibilidad de pesos F16, Q8_0 y Q4_K_M permite medir el impacto de la cuantización en calidad y latencia sobre un mismo modelo.
- Docencia y formación: su tamaño y su licencia permisiva lo hacen adecuado para talleres sobre transformers, tokenizadores y despliegue local sin depender de infraestructura cloud.
- Generación de texto en el borde (edge computing): con contexto de 8192 tokens y huella de memoria reducida, puede integrarse en aplicaciones locales de autocompletado o generación de plantillas.

## Benchmarks y rendimiento

| Benchmark | Alfa 1 (0.5B) |
|---|---|
| MMLU | 30,9 % |
| HellaSwag | 34,0 % |
| GSM8K | 5,4 % |
| HumanEval | 5,5 % |
| BCC-ES, conocimiento (azar 25 %) | 48 % |
| BCC-ES, competencias (azar 50 %) | 66 % |
| Pérdida de validación | 1,1322 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en bf16/F16, unos 0,6 GB en Q8_0 y unos 0,35 GB en Q4_K_M (sin contar el KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100 y H100 sin aprovechar su capacidad completa.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria unificada.
- Despliegue: transformers, llama.cpp (llama-cli con `-hf alvar-legaz/Alfa-1-0.5B:Q8_0`), text-generation-inference (tag `text-generation-inference`), endpoints compatibles y, por extensión, herramientas basadas en GGUF como Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Alfa 1 (0.5B) | ~520 M | 8192 | Apache 2.0 | es, en | Modelo base, MMLU 30,9 %, HellaSwag 34,0 % |
| Qwen2.5-0.5B | ~494 M | 32 768 | Apache 2.0 | multilingüe | Modelo base e Instruct disponibles |
| SmolLM2-360M | ~362 M | 8192 | Apache 2.0 | en (principalmente) | Enfoque en inglés, base e Instruct |
| Gemma 2 2B | ~2,6 B | 8192 | Gemma Terms | multilingüe | Mayor escala y rendimiento |

La comparación con Qwen2.5-0.5B, SmolLM2-360M y Gemma 2 2B se ofrece como referencia de categoría; no se dispone en la información proporcionada de resultados de benchmarks de Alfa 1 frente a estos modelos en las mismas condiciones de evaluación.

## Limitaciones y advertencias

- Es un modelo base sin alineación: puede generar contenido incorrecto, sesgado o inapropiado.
- Riesgo elevado de alucinación: el propio autor advierte de que inventa datos con facilidad y su conocimiento factual es limitado.
- Rendimiento bajo en tareas de razonamiento, matemáticas y código (GSM8K 5,4 %, HumanEval 5,5 %, MMLU 30,9 %), lo que limita su uso en aplicaciones que requieran precisión.
- Cobertura lingüística restringida a español e inglés; no se documenta soporte para otras lenguas.
- Contexto de 8192 tokens, inferior al de alternativas contemporáneas de tamaño similar.
- No debe usarse para decisiones con consecuencias sin supervisión humana, según indica el autor.
- Licencia Apache 2.0: permite uso comercial, pero no exime de las obligaciones de atribución ni de las advertencias sobre sesgos y alucinaciones.
- No se documentan evaluaciones de sesgo ni de seguridad; se desconoce el comportamiento en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alvar-legaz/Alfa-1-0.5B
- Variante Instruct: https://huggingface.co/alvar-legaz/Alfa-1-0.5B-Instruct
- Informe técnico citado: *Alfa1-0.5B: preentrenamiento eficiente de un modelo pequeño bilingüe español/inglés* (no se proporciona URL en la información disponible)
- Organización: Minaya Research (no se proporciona URL en la información disponible)
