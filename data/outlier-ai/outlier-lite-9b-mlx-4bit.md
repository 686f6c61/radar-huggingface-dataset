# Outlier-Ai/Outlier-Lite-9B-MLX-4bit

## Resumen

Outlier-Lite-9B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo denso Qwen/Qwen3.5-9B, publicada por Outlier-Ai como parte de su línea de modelos "shipping" para la aplicación Outlier en macOS. Se trata de un artefacto de conversión, no de un modelo entrenado desde cero: los pesos subyacentes son los de Qwen3.5-9B y la licencia Apache 2.0 se hereda del modelo base. Su objetivo es ofrecer razonamiento de gama media en Macs con Apple Silicon de 12 GB o más, sin la latencia de un modelo de clase 27B.

El modelo es denso (no MoE), solo texto, con 8.953.803.264 parámetros reales según los safetensors, y ocupa 5,1 GB en el repositorio gracias a la cuantización de 4 bits. La model card lo etiqueta con capacidades de razonamiento ("thinking"), tool calling y conversación multilingüe en 15 idiomas, incluyendo el castellano.

Su relevancia actual radica en el despliegue local en hardware de consumo: permite ejecutar un modelo de casi 9B parámetros en un MacBook Air o Mac mini con 16 GB de memoria unificada, sin conexión a la nube, con soporte nativo de MLX y mlx-lm. La ficha se centra en los datos verificables publicados por el autor; cualquier especificación no documentada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX 4-bit); no se documentan otros formatos en este repo |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-9B más allá de que es un transformer denso de aproximadamente 9B parámetros. No se especifican número de capas, dimensión oculta, mecanismo de atención ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Tampoco se documentan los datos de entrenamiento del modelo base: número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

Lo que sí es verificable es el proceso de conversión: los pesos originales de Qwen3.5-9B se han cuantizado a 4 bits en formato MLX para su ejecución en Apple Silicon mediante Metal. La model card indica que las etiquetas incluyen "thinking" y "reasoning", lo que sugiere que el modelo base incorpora un modo de razonamiento explícito, pero no se aportan detalles técnicos sobre cómo se implementa ni sobre el proceso de cuantización (grupo de cuantización, calibración, etc.).

## Capacidades

- Generación de texto conversacional multi-turno en 15 idiomas, incluido el castellano.
- Razonamiento explícito: las etiquetas del modelo incluyen "thinking" y "reasoning", lo que apunta a un modo de cadena de pensamiento, aunque no se documenta su funcionamiento.
- Tool calling y function calling: etiquetado explícitamente como "function-calling" y "tool-use".
- Generación de código: el benchmark HumanEval reportado (pass@1 de 0,6951) confirma capacidad de síntesis de código.
- Razonamiento de conocimiento general: MMLU 5-shot con accuracy de 0,7846.
- Ejecución local y offline: diseñado para "on-device", "no-cloud" y "private-ai", sin cuotas de tokens.
- Solo texto: no se declaran capacidades de visión ni audio.

## Casos de uso

- Asistente de código en local: con un pass@1 de 0,6951 en HumanEval, el modelo es adecuado para autocompletado y generación de funciones en un Mac de desarrollo, integrándose vía mlx-lm en scripts o en la app Outlier sin enviar código a la nube.
- Chat privado con documentos sensibles: al ejecutarse completamente offline en Apple Silicon, permite conversaciones multi-turno sobre material confidencial (legal, médico, financiero) sin exposición de datos a terceros.
- Automatización con tool calling: las etiquetas de function-calling permiten construir agentes locales que invoquen APIs o scripts del sistema (por ejemplo, consultas a bases de datos locales o gestión de ficheros) desde un Mac mini.
- Atención al cliente en prototipado: el soporte de 15 idiomas y el modo conversacional permiten validar flujos de soporte multilingüe en local antes de desplegar en producción.
- Razonamiento asistido en estaciones de trabajo con 16 GB: para Macs con memoria unificada limitada, el modelo ofrece un equilibrio entre calidad de razonamiento (MMLU 0,7846) y latencia, evitando el coste de un modelo de clase 27B.
- Educación y experimentación: investigadores pueden reproducir benchmarks (MMLU, HumanEval) y estudiar el comportamiento del modo "thinking" en hardware de consumo sin infraestructura de GPU.
- Procesamiento de texto multilingüe por lotes: con soporte de árabe, japonés, coreano, tailandés y vietnamita, es utilizable para tareas de traducción o resumen en local en un Mac Studio.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Resultado |
|---|---|---|
| MMLU (5-shot, n=14042) | accuracy | 0,7846 |
| HumanEval (test) | pass@1 | 0,6951 |

No se han publicado en la informacion disponible resultados de otros benchmarks (GSM8K, MATH, MT-Bench, etc.) ni comparaciones directas con modelos similares. La model card remite a outlier.host/benchmarks para cifras de velocidad de inferencia en Mac con procedencia completa, pero esos datos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 5,1 GB en 4 bits; la model card recomienda Macs con 12 GB o más de memoria unificada, y las etiquetas apuntan a "16gb-mac" como configuración de referencia.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4) mediante Metal; no se soportan GPUs NVIDIA o AMD en este formato.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip de la serie M y al menos 12 GB de memoria unificada (MacBook Air, MacBook Pro, Mac mini, Mac Studio).
- Opciones de despliegue: mlx-lm (librería oficial), la app Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`), y cualquier runtime compatible con MLX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX y no GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a outlier.host/benchmarks para cifras con procedencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|---|
| Outlier-Lite-9B-MLX-4bit | 8,95B (denso) | no disponible | 0,7846 | 0,6951 | Apache 2.0 | MLX 4-bit |
| Outlier Nano 4B (MLX 4-bit) | ~4B (no confirmado) | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | MLX 4-bit |
| Outlier Core 27B (MLX 4-bit) | ~27B (no confirmado) | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | MLX 4-bit |
| Qwen3.5-9B (base) | 9B (denso) | no disponible | no disponible | no disponible | Apache 2.0 | safetensors |

La comparativa se limita a la propia línea Outlier y al modelo base, ya que la información proporcionada no incluye datos de benchmarks de los modelos alternativos. No se dispone de cifras de contexto ni de rendimiento de los modelos comparados para establecer una comparación cuantitativa completa.

## Limitaciones y advertencias

- Es un artefacto de conversión, no un modelo entrenado: cualquier limitación del Qwen3.5-9B base se hereda sin cambios.
- Solo texto: no hay capacidades multimodales (visión, audio) en este tier.
- Exclusivo de Apple Silicon: no es desplegable en GPUs NVIDIA, AMD ni en CPU x86 mediante este repositorio; requeriría otra conversión (por ejemplo, GGUF).
- Benchmark no verificado: los resultados de MMLU y HumanEval están marcados como `verified: false` y proceden del propio autor; deben tratarse con cautela hasta su reproducción independiente.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin confirmar el límite real del modelo base.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de alucinación; como todo modelo generativo, puede producir información incorrecta con aparente seguridad.
- Sesgos: no se publica ninguna evaluación de sesgos; los sesgos del corpus de entrenamiento del modelo base no están caracterizados en esta ficha.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una conversión, los pesos subyacentes se rigen por la licencia del modelo base; conviene verificar la model card de Qwen3.5-9B para cualquier restricción adicional.
- Ecosistema limitado: la app Outlier es la vía principal de uso; el soporte fuera de mlx-lm no está documentado.
- Idiomas: aunque se declaran 15 idiomas, no se aportan métricas de calidad por idioma; el rendimiento en castellano no está cuantificado.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- README del repositorio: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit/blob/main/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Web de Outlier: https://outlier.host/
- Benchmarks de Outlier: https://outlier.host/benchmarks
- Captura del selector de tiers: https://outlier.host/screenshots/tier-picker.png
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Quick 26B-A4B MoE: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Code 27B: https://huggingface.co/Outlier-Ai/Outlier-Code-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
