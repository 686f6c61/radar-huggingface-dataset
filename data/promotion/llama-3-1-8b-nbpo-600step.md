# promotion/Llama-3.1-8B-NBPO-600step

## Resumen

El modelo `promotion/Llama-3.1-8B-NBPO-600step` es un fine-tuning de `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario `promotion` en el marco de una investigación sobre alineación multi-objetivo. Aplica **Nash Bargaining Preference Optimization (NBPO)** con un paso proximal de `8η` y un presupuesto de 600 pasos de entrenamiento, optimizando simultáneamente cuatro objetivos: helpfulness, truthfulness, honesty e instruction following. El método busca maximizar el producto de Nash de las utilidades de cada objetivo, un criterio de bienestar social que equilibra las preferencias entre dimensiones.

El modelo parte de la política de referencia e inicialización `Llama-3.1-8B-Instruct` y utiliza un oráculo de preferencias `Qwen3-32B` para puntuar respuestas en prompts de UltraFeedback, con promediado de orden de presentación. Los resultados reportados muestran mejoras en el excedente (surplus) sobre la referencia en todos los objetivos, aunque las diferencias en win rates frente a benchmarks se sitúan dentro de la dispersión de semillas. Es un modelo de investigación, con 0 descargas y 0 likes en el momento de la consulta, y su relevancia radica en explorar métodos de alineación que no sacrifican un objetivo por otro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `meta-llama/Llama-3.1-8B-Instruct`, que actúa tanto como política de referencia `μ` como inicialización `π₀`. La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, y aproximadamente 8.000 millones de parámetros. No se especifican innovaciones arquitectónicas adicionales; el interés reside en el método de entrenamiento.

El entrenamiento emplea **Nash Bargaining Preference Optimization (NBPO)** con un paso proximal de `8η` y un presupuesto de 600 pasos. Se optimizan cuatro objetivos (helpfulness, truthfulness, honesty e instruction following) puntuados por un oráculo de preferencias `Qwen3-32B` sobre prompts de UltraFeedback. Cada par de respuestas se consulta en ambos órdenes de presentación y se promedia el resultado (swap-averaging). El método maximiza el producto de Nash `∑ₖ log uₖ`, un criterio que busca un equilibrio justo entre objetivos en lugar de optimizar un único promedio. No se detallan el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de los prompts de UltraFeedback.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tuning de Llama 3.1 8B Instruct, conserva las capacidades generales del modelo base, aunque no se documentan específicamente en la ficha.
- Alineación multi-objetivo: el modelo está optimizado para mejorar simultáneamente helpfulness, truthfulness, honesty e instruction following, lo que lo hace adecuado para aplicaciones donde se requiere un equilibrio entre utilidad y veracidad.
- Mejora relativa sobre la referencia: según los datos reportados, el modelo supera a la política base en el excedente de todos los objetivos evaluados (por ejemplo, +0.0633 en helpfulness y +0.0116 en truthfulness).
- No se especifican capacidades especiales como tool calling, agentes, visión o audio; estas dependen del modelo base, pero no se confirman en la información proporcionada.

## Casos de uso

- Asistentes conversacionales con equilibrio entre utilidad y veracidad: el modelo puede emplearse en chatbots donde se priorice no solo dar respuestas útiles sino también honestas y veraces, gracias a su optimización multi-objetivo.
- Sistemas de generación de contenido con requisitos de honestidad: para redacción automática de informes, artículos o respuestas donde la exactitud factual sea crítica, el modelo ofrece una mejora en truthfulness (+0.0116) frente al modelo base.
- Evaluación de alineación en investigación: como punto de comparación para estudiar métodos de preferencia multi-objetivo, el modelo sirve como referencia en experimentos de alineación.
- Fine-tuning posterior: al ser un modelo de 8B con licencia permisiva (Llama 3.1), puede utilizarse como punto de partida para tareas específicas que requieran un comportamiento alineado en múltiples dimensiones.
- Aplicaciones de bajo coste de inferencia: con 8.000 millones de parámetros, es desplegable en hardware de gama media, lo que permite experimentar con alineación multi-objetivo sin necesidad de clústeres grandes.
- Benchmarking de preferencias: el modelo puede usarse para probar oráculos de preferencia o métricas de evaluación, dado que se reportan win rates frente a benchmarks estándar como Arena-Hard y AlpacaEval.

## Benchmarks y rendimiento

La model card reporta win rates contra la política de referencia (`Llama-3.1-8B-Instruct`), juzgados por `Llama-3.3-70B-Instruct`, que no participó en el entrenamiento. También se comparan dos brazos del método: el de 600 pasos (este modelo) y el de 300 pasos con paso `20η`.

| Benchmark | Este modelo (600-step) | Brazo 300-step |
|---|---|---|
| Arena-Hard v2 | 0.558 | 0.546 |
| AlpacaEval 2 | 0.554 | 0.549 |
| AlpacaEval length-controlled | 0.554 | 0.530 |
| MT-Bench (turn 1) | 0.553 | 0.538 |
| Arena-Hard length-matched | 0.561 | 0.556 |
| Mean Arena-Hard tokens | 3034 | 2904 |

Además, se reporta el excedente (surplus) sobre la referencia en una escala poblacional con 100 prompts:

| Objetivo | Este modelo | Brazo 300-step |
|---|---|---|
| Helpfulness | +0.0633 | +0.0537 |
| Truthfulness | +0.0116 | +0.0118 |
| Honesty | +0.0217 | +0.0159 |
| Instruction following | +0.0166 | +0.0185 |
| Mínimo | +0.0116 | +0.0118 |
| Promedio | +0.0283 | +0.0250 |
| Producto de Nash (suma log) | -15.14 | -15.49 |

El autor advierte que las diferencias en win rates están dentro de la dispersión de semillas: replicando el método y PROSPER en tres semillas se obtiene una desviación estándar de 0.014 en Arena-Hard por brazo. Por tanto, las mejoras observadas pueden no ser estadísticamente significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8.030 millones de parámetros, en FP16 requiere aproximadamente 16 GB de VRAM; en cuantización de 8 bits (~8 GB) o 4 bits (~4-5 GB) puede reducirse, pero no se proporcionan datos específicos en la información disponible.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para FP16; GPUs de consumo como RTX 3080/3090 pueden ser suficientes con cuantización.
- Si cabe en consumer GPU: sí, con cuantización (GGUF o AWQ) es posible ejecutarlo en GPUs de 8-12 GB, aunque no se confirma en la documentación.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, llama.cpp, Ollama y TGI, pero no se especifican configuraciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `promotion/Llama-3.1-8B-NBPO-600step` | 8.03B | no disponible | llama3.1 | Fine-tuning multi-objetivo con NBPO |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.03B | 128k (conocido, no en la ficha) | llama3.1 | Modelo base, política de referencia |
| `promotion/Llama-3.1-8B-NBPO` (brazo 300-step) | 8.03B | no disponible | llama3.1 | Variante con paso 20η y 300 pasos |

No se dispone de comparación con otros métodos de alineación como PROSPER o DPO en la información proporcionada, más allá de la mención de que la dispersión de semillas es similar.

## Limitaciones y advertencias

- Las mejoras en win rates frente a benchmarks están dentro de la dispersión de semillas (desviación estándar de 0.014 en Arena-Hard), por lo que no se puede afirmar una superioridad estadísticamente robusta sobre el modelo base.
- El modelo no ha sido evaluado en cuanto a sesgos, toxicidad o seguridad; no se proporcionan datos al respecto.
- La licencia es `llama3.1`, que permite uso comercial pero con restricciones (por ejemplo, no usar para mejorar otros modelos grandes sin autorización de Meta).
- No se especifican los idiomas soportados; se asume que hereda los del modelo base, pero no está confirmado.
- El tamaño del repositorio (32.1 GB) sugiere pesos en FP16; para despliegue en producción se requerirá cuantización.
- Al ser un modelo de investigación con 0 descargas, no hay evidencia de uso en producción ni retroalimentación de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/promotion/Llama-3.1-8B-NBPO-600step)
- [Dataset de generaciones de benchmarks](https://huggingface.co/datasets/promotion/nbpo-benchmark-generations)
- [Modelo base Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
