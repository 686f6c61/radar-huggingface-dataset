# shakey1910/Qwen3-4B-Dory-4Loop-p50c

## Resumen

Qwen3-4B-Dory-4Loop-p50c es una variante experimental del modelo Qwen3-4B de Alibaba, publicada por el usuario shakey1910 en Hugging Face. Combina el transformer denso de 36 capas y 4.022 millones de parámetros de Qwen3-4B con el grafo de ejecución latente-recurrente de NVIDIA Nemotron-Labs Dory 1.0, que reorganiza las capas en un patrón `8 -> 20 (x4 loops) -> 8`, es decir, ocho capas de entrada, un bloque central de veinte capas que se ejecuta cuatro veces y ocho capas de salida. Sobre esa base se aplica la edición quirúrgica de pesos `p50c` descrita en el artículo "Sparks of Weight-Space Programming", que escala un factor de 6,0 sobre 64 columnas de `mlp.down_proj` en las capas 22 y 27.

El objetivo declarado es explorar el razonamiento latente y la reutilización de cómputo en el espacio de pesos sin aumentar el número de parámetros: el mismo bloque de veinte capas se recorre varias veces, lo que incrementa la profundidad efectiva a coste de latencia, no de memoria de pesos. El modelo conserva la licencia Apache 2.0 del Qwen3-4B original y requiere `trust_remote_code=True` porque incluye código de modelado propio (`modeling_qwen3_dory.py`).

Es relevante como pieza de investigación reproducible: demuestra cómo injertar un grafo recurrente de un modelo en otro y cómo aplicar ediciones de pesos dirigidas para alterar el comportamiento sin reentrenar. No obstante, es un artefacto de experimentación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card con evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con grafo latente-recurrente (looped transformer), 36 capas reorganizadas en `8 -> 20 (x4 loops) -> 8` |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B, no confirmada en la model card) |
| Tipos de cuantización | No disponible (pesos publicados en BF16/safetensors; compatible con cuantización estándar de transformers, no verificada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código de modelado personalizado, `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-4B: 36 capas, `hidden_size=2560` e `intermediate_size=9728`. Sobre esa pila se aplica el grafo de ejecución de Dory 1.0, que divide las capas en tres segmentos: ocho capas de entrada que se ejecutan una vez, veinte capas centrales que se ejecutan cuatro veces (loops) y ocho capas de salida. El resultado es una profundidad efectiva de 8 + 20×4 + 8 = 96 pasadas de capa, con solo 36 capas de parámetros. La model card menciona que el modo `last_loop` mantiene la caché KV a 1,0x, lo que sugiere que la recurrencia no multiplica linealmente el coste de memoria de la caché.

La segunda intervención es la edición `p50c` del artículo "Sparks of Weight-Space Programming": un `scale_factor = 6.0` aplicado a 64 columnas de `mlp.down_proj` en las capas 22 y 27. Se trata de una modificación quirúrgica de pesos, no de un fine-tuning. No hay información sobre datos de entrenamiento adicionales, tokens vistos, RLHF, DPO ni proceso de alineación; el modelo es esencialmente una recomposición y edición del Qwen3-4B base, no un modelo entrenado desde cero. Tampoco se documenta si el grafo recurrente se entrenó o se injertó en frío.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3-4B.
- Razonamiento latente mediante reutilización de capas: el bloque central se ejecuta hasta cuatro veces, lo que puede mejorar tareas de razonamiento multi-paso a coste de latencia.
- Conmutación dinámica del número de loops (`num_loops` a 1, 2 o 4), lo que permite ajustar el equilibrio entre calidad y coste computacional en tiempo de inferencia.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card, pero plausible por herencia del Qwen3-4B base; no verificado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no confirmado en la model card; Qwen3-4B lo soporta, pero la edición de pesos podría alterarlo.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Investigación sobre looped transformers: el modelo sirve como banco de pruebas para estudiar cómo la recurrencia de capas afecta al razonamiento y a la calidad de generación sin aumentar parámetros.
- Experimentos de weight-space programming: permite reproducir y extender la edición `p50c` sobre `mlp.down_proj`, comparando el comportamiento con y sin el escalado de 6,0 en las capas 22 y 27.
- Ajuste de coste-calidad en inferencia: gracias a `num_loops` configurable, se puede usar 1 loop para tareas simples y 4 loops para tareas de razonamiento, midiendo la ganancia real en cada caso.
- Evaluación de transferencia de grafos entre modelos: útil para investigadores que quieran injertar el esquema Dory en otros modelos de la familia Qwen3 y comparar resultados.
- Generación de texto en entornos con memoria limitada: al mantener 4.022 millones de parámetros, cabe en GPUs de consumo con cuantización, aunque la latencia con 4 loops es mayor.
- Docencia y divulgación: ejemplo didáctico de cómo se modifica un modelo open source a nivel de pesos y de grafo de ejecución, con código de modelado propio incluido en el repo.
- Prototipado de agentes con razonamiento multi-paso: si el modo thinking se conserva, podría usarse en pipelines experimentales de agentes, siempre con validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,1 GB solo para pesos (tamaño del repo), más caché KV y activaciones; en la práctica, entre 10 y 12 GB en BF16 según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 a 5,5 GB; en 4 bits, alrededor de 2,5 a 3,5 GB (estimaciones, no verificadas para este modelo concreto).
- GPU recomendadas: A100 40/80 GB o H100 para experimentación con contexto largo y 4 loops; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 8-12 GB con cuantización, siempre que el código personalizado `modeling_qwen3_dory.py` sea compatible con el backend elegido.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. vLLM, llama.cpp, Ollama y TGI no están confirmados para este modelo, ya que el grafo recurrente y el código personalizado pueden no ser compatibles con esos motores sin adaptación.
- Latencia y throughput: no disponibles. Cabe esperar que 4 loops incrementen la latencia respecto a Qwen3-4B estándar en una proporción cercana al cómputo adicional del bloque central, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Dory-4Loop-p50c | 4.022 M | No disponible | Transformer con 4 loops latentes | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B | 4.022 M | No disponible en esta ficha | Transformer denso estándar | Apache 2.0 | Hugging Face, ampliamente usado |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | No disponible | No disponible | Transformer con grafo latente-recurrente | No disponible | Hugging Face |
| Modelos de ~4B comparables (p. ej. Llama 3.2 3B, Phi-3.5-mini) | 3.000-3.800 M | 128K en algunos casos | Transformer denso | Licencias variables | Hugging Face |

La comparación directa con Qwen3-4B es la más pertinente: mismo número de parámetros, misma licencia y mismo tokenizador, con la diferencia del grafo recurrente y la edición de pesos. Frente a Dory 1.0, comparte el esquema de loops pero parte de una base distinta. No hay datos de rendimiento que permitan afirmar superioridad o inferioridad frente a ninguno de ellos.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks publicados: no hay evidencia de que la recurrencia o la edición `p50c` mejoren el rendimiento frente a Qwen3-4B base.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes de uso en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código de modelado del autor; conviene auditar `modeling_qwen3_dory.py` antes de usarlo en entornos sensibles.
- La edición de pesos con `scale_factor = 6.0` sobre 64 columnas de `mlp.down_proj` puede degradar la coherencia o introducir sesgos no documentados; no hay evaluación de alucinación.
- Idiomas soportados no documentados: no se puede asumir el multilingüismo de Qwen3-4B tras la modificación.
- Longitud de contexto no confirmada en la model card; no asumir la ventana nativa de Qwen3-4B sin verificación.
- Compatibilidad limitada con motores de inferencia estándar (vLLM, llama.cpp, TGI) por el código personalizado y el grafo recurrente.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3-4B conviene revisar también las condiciones del modelo base y de Dory 1.0.
- No apto para producción sin evaluación propia: la latencia con 4 loops y la estabilidad del grafo recurrente no están medidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shakey1910/Qwen3-4B-Dory-4Loop-p50c
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- NVIDIA Nemotron-Labs Dory 1.0 4B BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Artículo "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
