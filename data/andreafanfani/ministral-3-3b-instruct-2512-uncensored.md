# andreafanfani/Ministral-3-3B-Instruct-2512-uncensored

## Resumen
Ministral-3-3B-Instruct-2512-uncensored es una versión modificada del modelo Ministral 3 3B Instruct 2512 de Mistral AI, publicada por el usuario andreafanfani. El modelo original es un transformer denso de aproximadamente 3.400 millones de parámetros de lenguaje más un codificador visual de 0.400 millones, diseñado para despliegue en el borde (edge) y capaz de caber en 8 GB de VRAM en FP8. Esta variante aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.1.0 para reducir las tasas de rechazo (refusals) del modelo original, pasando de 97/100 a 10/100 según los datos del autor.

El modelo conserva las capacidades del original: visión, multilingüismo en once idiomas declarados, soporte de system prompt, capacidades agénticas con function calling nativo y salida JSON, y una ventana de contexto de 256k tokens. La modificación afecta únicamente el comportamiento de rechazo, con una divergencia KL de 0.0189 respecto al modelo base, lo que indica un cambio relativamente contenido en la distribución de salidas.

Es relevante para desarrolladores que necesitan un modelo pequeño, multimodal y desplegable en hardware modesto, pero que requieren menor censura en las respuestas. La licencia Apache 2.0 permite uso comercial y modificación, aunque el autor no ofrece garantías sobre el comportamiento resultante tras la ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador visual (Mistral 3) |
| Parametros totales | 3.849.090.048 (3.4B LM + 0.4B vision encoder) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | FP8 en el modelo original; cuantizaciones adicionales no especificadas en la informacion disponible |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base Ministral 3 3B Instruct 2512 es un transformer denso compuesto por un modelo de lenguaje de 3.4B parámetros y un codificador visual de 0.4B parámetros. El modelo original se distribuye en FP8 y está post-entrenado para instrucciones. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

La modificación de esta variante consiste en una ablación de rangos arbitrarios (ARA) aplicada entre las capas 12 y 24, con parámetros concretos: `preserve_good_behavior_weight` de 0.3601, `steer_bad_behavior_weight` de 0.0002, `overcorrect_relative_weight` de 0.1504 y `neighbor_count` de 6. Esta intervención busca preservar el comportamiento útil mientras reduce la tendencia a rechazar peticiones. El proceso es reproducible según el autor, que incluye un directorio `reproduce` con instrucciones. La divergencia KL de 0.0189 cuantifica el desplazamiento respecto al modelo original.

## Capacidades
- Generación de texto e instrucciones con adherencia a system prompt.
- Visión: análisis de imágenes y generación de respuestas basadas en contenido visual.
- Multilingüismo en once idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Capacidades agénticas con function calling nativo y salida JSON.
- Razonamiento multi-paso en entornos agénticos, limitado por el tamaño del modelo.
- Reducción de rechazos: 10/100 frente a 97/100 del original, según métricas del autor.
- No se especifica modo de razonamiento explícito (thinking mode) en esta variante instruct.
- No se declaran capacidades de audio en la información disponible.

## Casos de uso
- Atención al cliente en dispositivos locales: el modelo puede gestionar conversaciones multi-turno gracias a la ventana de 256k tokens y ejecutarse en 8 GB de VRAM en FP8, lo que permite desplegarlo en estaciones de trabajo sin GPU de datacenter.
- Generación de código asistida en entornos de borde: el soporte de function calling y salida JSON permite integrarlo en pipelines de CI/CD o asistentes de IDE que necesitan respuestas estructuradas sin depender de la nube.
- Procesamiento de documentos con imágenes: la combinación de visión y contexto largo permite extraer datos de facturas, formularios o capturas de pantalla y devolver JSON estructurado.
- Traducción en tiempo real en aplicaciones móviles o embebidas: el soporte de once idiomas y el tamaño reducido lo hacen adecuado para traducción de baja latencia en dispositivos con recursos limitados.
- Moderación y clasificación de contenido con menor censura: al reducir los rechazos, puede emplearse en tareas de clasificación o análisis de textos sensibles donde el modelo original declinaría responder.
- Fine-tuning especializado: la licencia Apache 2.0 y el tamaño compacto permiten adaptar el modelo a dominios concretos en hardware de consumo.
- Subtitulado y descripción de imágenes: el codificador visual de 0.4B permite generar pies de foto o descripciones automáticas en aplicaciones de accesibilidad.

## Benchmarks y rendimiento
El autor publica métricas comparativas respecto al modelo original, pero no benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (refusals) | 10/100 | 97/100 |
| Divergencia KL | 0.0189 | 0 (por definición) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 8 GB en FP8 para el modelo completo según la model card del original; menos con cuantizaciones adicionales (no especificadas).
- GPU recomendadas: RTX 4090, RTX 4080, A100, H100; cualquier GPU con al menos 8 GB de VRAM para FP8.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en FP8; en cuantizaciones menores podría caber en GPUs de 6 GB o menos, aunque no se detallan.
- Opciones de despliegue: vLLM (librería declarada), safetensors con mistral-common; otras opciones como llama.cpp, Ollama o TGI no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512-uncensored | 3.85B | 256k | Sí | Apache 2.0 | Variante ablacionada, 10/100 rechazos |
| Ministral 3 3B Instruct 2512 (original) | 3.85B | 256k | Sí | Apache 2.0 | 97/100 rechazos, FP8 |
| Ministral 3 3B Reasoning 2512 | 3.85B | 256k | Sí | Apache 2.0 | Capacidad de razonamiento explícito, BF16 |
| Ministral 3 8B Instruct 2512 | ~8.4B | 256k | Sí | Apache 2.0 | Mayor tamaño, FP8 |

## Limitaciones y advertencias
- La ablación reduce rechazos, lo que puede aumentar la probabilidad de generar contenido inapropiado, ofensivo o inseguro; no se han publicado evaluaciones de seguridad independientes.
- Riesgo de alucinación inherente a modelos de 3B parámetros, especialmente en tareas de razonamiento complejo o matemáticas.
- La divergencia KL de 0.0189 indica cambios en la distribución de salidas que pueden afectar la calidad en dominios específicos no medidos por el autor.
- El modelo no incluye modo de razonamiento explícito; para tareas que lo requieran existe la variante Reasoning de la familia.
- La ventana de 256k tokens puede degradar la calidad en el extremo superior del contexto; no se publican evaluaciones de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento tras la modificación.
- No se dispone de información sobre sesgos específicos del modelo base ni de esta variante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.

## Enlaces
- [Hugging Face: andreafanfani/Ministral-3-3B-Instruct-2512-uncensored](https://huggingface.co/andreafanfani/Ministral-3-3B-Instruct-2512-uncensored)
- [Modelo base: mistralai/Ministral-3-3B-Instruct-2512](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512)
- [Blog de Mistral AI sobre Mistral 3](https://mistral.ai/news/mistral-3)
- [Paper arXiv:2601.08584](https://arxiv.org/abs/2601.08584)
- [Heretic project](https://heretic-project.org)
