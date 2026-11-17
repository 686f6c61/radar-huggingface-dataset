# aramkris/fineweb-edu-124m-diffusion

## Resumen

FineWeb-Edu 124M masked diffusion (F6) es un modelo de lenguaje de 124 millones de parámetros entrenado desde cero con un objetivo de difusión enmascarada (masked diffusion) en lugar del clásico modelado autorregresivo. Lo desarrolla el usuario aramkris dentro del proyecto tinystories-ARM-model, y comparte diseño, datos y tokenizador con su contrapartida autorregresiva FineWeb-Edu 124M base, de modo que la única diferencia entre ambos es la función objetivo: predicción bidireccional por denoising frente a predicción del siguiente token.

El modelo escribe denoizando: la continuación se inicializa como una secuencia de tokens `[MASK]` y, en cada paso, un transformer con atención bidireccional predice todas las posiciones enmascaradas y revela las que considera más seguras. La arquitectura es un transformer de 12 capas por 768 de dimensión, con RoPE, SwiGLU, sin sesgos, QK-norm y una ventana de contexto de 512 tokens, entrenado sobre Mini FineWeb-Edu completo más subconjuntos de Cosmopedia.

Es un modelo de investigación, no un asistente listo para producción: genera texto fluido pero poco cohesionado, con escasos hechos verificables y un coste de inferencia alto (64 pasos para 64 tokens). Resulta relevante como referencia abierta para comparar objetivos de entrenamiento (difusión frente a autorregresivo) sobre exactamente los mismos datos, tokenizador y presupuesto de cómputo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión enmascarada (masked diffusion), atención bidireccional, 12 capas × 768, RoPE, SwiGLU, sin sesgos, QK-norm |
| Parámetros totales | 124M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos publicados en `model.pt` sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch), más `config.json`, `metrics.json`, `loss.png`, `manifest.json` |

## Arquitectura y entrenamiento

El modelo es un transformer de 12 capas y 768 dimensiones con RoPE, activación SwiGLU, ausencia de términos de sesgo y QK-norm, con atención en ambas direcciones. Sobre esta base se aplica un objetivo de difusión enmascarada con 64 niveles de ruido: en cada paso se predicen todas las posiciones enmascaradas simultáneamente y se revelan las de mayor confianza. El checkpoint subido a Hugging Face corresponde a 2.5B tokens de entrenamiento (152.600 actualizaciones, las mismas que el modelo autorregresivo base) y es el mejor según la cota de verosimilitud, en la actualización 120.000; en las últimas 30.000 actualizaciones la cota volvió a subir hasta aproximadamente 3.9.

Los datos de entrenamiento son Mini FineWeb-Edu (conjunto completo) más subconjuntos de Cosmopedia, exactamente los mismos que los del modelo autorregresivo FineWeb-Edu 124M base, con idéntico tokenizador. No se menciona en la información disponible el uso de RLHF, DPO ni ajuste por preferencias. La innovación técnica destacable es precisamente el cambio de objetivo: predicción bidireccional por denoising con revelado iterativo de tokens, frente a la generación token a token del modelo autorregresivo equivalente.

## Capacidades

- Generación de texto en inglés mediante denoising iterativo, con revelado de tokens por confianza.
- Predicción bidireccional de posiciones enmascaradas, lo que permite en principio rellenar huecos en una secuencia.
- Evaluación de verosimilitud de respuestas mediante cota de verosimilitud con 8 enmascaramientos por respuesta.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Multilingüismo limitado al inglés según los metadatos del modelo.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre objetivos de entrenamiento: comparar directamente difusión enmascarada frente a autorregresivo con los mismos datos, tokenizador y presupuesto de cómputo (2.5B tokens), usando el par de modelos F6 y base como grupo de control.
- Experimentación académica en generación por denoising: estudiar el efecto del número de pasos, el tamaño de bloque (`block_size`) y la penalización por repetición sobre la calidad del texto generado.
- Reproducción de resultados: el repositorio incluye `metrics.json`, `loss.png` y `manifest.json` con sumas de verificación, lo que facilita replicar el historial de pérdida y las muestras.
- Docencia y divulgación: ilustrar cómo funciona un modelo de difusión de lenguaje con un checkpoint pequeño (0.5 GB) que se ejecuta en CPU.
- Prototipado de relleno de texto (infilling) en inglés: la atención bidireccional permite experimentar con completados condicionados a contexto a ambos lados de la máscara.
- Análisis de calibración y confianza: el mecanismo de revelado por confianza permite estudiar la relación entre certeza del modelo y corrección del token revelado.

## Benchmarks y rendimiento

| Modelo | Cota de verosimilitud (nats/token) | HellaSwag | LAMBADA | ARC-Easy | PIQA | Winogrande |
|---|---|---|---|---|---|---|
| Este modelo, 2.5B tokens (subido) | 3.830 | pendiente de medir | pendiente de medir | pendiente de medir | pendiente de medir | pendiente de medir |
| Este modelo tras 1B tokens | 3.923 | 27.6 | 11.8 | 30.7 | 54.2 | 49.6 |
| Base autorregresivo, 2.5B tokens (mismos datos) | 2.963 (loss) | 32.3 | 20.3 | 46.8 | 62.4 | 49.9 |

Las benchmarks del checkpoint subido están pendientes de medición según la model card. La cota de verosimilitud es una cota superior de la pérdida por token y las benchmarks puntúan cada respuesta por su cota de verosimilitud con 8 enmascaramientos por respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 124M parámetros en precisión completa ocupa aproximadamente 0,5 GB de pesos; con estados de activación y overhead de inferencia, cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el ejemplo oficial de la model card se ejecuta en CPU (`load(..., "cpu")`).
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) e incluso en CPU.
- Opciones de despliegue: el código oficial es el repositorio tinystories-ARM-model (`diffusion_models.model.load` y `diffusion_models.sample.diffusion_generate`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras concretas; la model card advierte de que se necesitan 64 pasos para generar 64 tokens, lo que implica un coste de inferencia muy superior al de un modelo autorregresivo del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FineWeb-Edu 124M masked diffusion (F6) | 124M | 512 | Difusión enmascarada | MIT | Hugging Face (aramkris/fineweb-edu-124m-diffusion) |
| FineWeb-Edu 124M base | 124M | 512 | Autorregresivo | no disponible en la información proporcionada | Hugging Face (aramkris/fineweb-edu-124m-base) |
| Alternativas de difusión de lenguaje de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa y documentada es con el modelo autorregresivo base del mismo autor, que emplea los mismos datos, tokenizador y número de actualizaciones: el base obtiene mejor pérdida (2.963 frente a una cota de 3.830) y mejores resultados en HellaSwag, LAMBADA, ARC-Easy y PIQA, mientras que en Winogrande las diferencias son mínimas (49.9 frente a 49.6). No se dispone de información sobre otros modelos de difusión de lenguaje comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: genera texto fluido pero con conexiones laxas entre ideas y pocos hechos verificables.
- Inferencia costosa: requiere 64 pasos para producir 64 tokens, muy por encima del coste de un modelo autorregresivo equivalente.
- La cota de verosimilitud empeoró en las últimas 30.000 actualizaciones (de 3.830 a aproximadamente 3.9), lo que sugiere inestabilidad en la fase final del entrenamiento.
- Las benchmarks del checkpoint publicado aún no se han medido; solo hay datos del checkpoint de 1B tokens.
- Contexto limitado a 512 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Solo inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación elevado dado el tamaño y la naturaleza del corpus de entrenamiento (FineWeb-Edu y Cosmopedia son datos educativos y sintéticos).
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de calidad para producción.
- No se documenta soporte para tool calling, agentes ni integración con servidores de inferencia estándar (vLLM, TGI, llama.cpp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-diffusion
- Modelo autorregresivo base: https://huggingface.co/aramkris/fineweb-edu-124m-base
- Repositorio de código: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Dataset Mini FineWeb-Edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
