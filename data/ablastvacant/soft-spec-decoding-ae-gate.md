# ablastvacant/soft-spec-decoding-ae-gate

## Resumen

`ablastvacant/soft-spec-decoding-ae-gate` es un conjunto de autoencoders (VAE) entrenados sobre los estados ocultos de Qwen3-8B, no un modelo de lenguaje autónomo. Lo desarrolla el usuario `ablastvacant` como parte de un diseño de decodificación especulativa sin pérdida basado en un "drafter" suave: en lugar de predecir tokens, el drafter comprime k=8 posiciones consecutivas de los estados ocultos de Qwen3-8B (cuantizado a 4 bits nf4) en un latente y las reconstruye, de forma que el LM head congelado del modelo base produce los mismos tokens.

El repositorio contiene cuatro checkpoints (latentes de 512, 1024 y 2048 dimensiones, con filas de entrada "full" o "final") y los resultados de entrenamiento en JSON. Pesa 0,5 GB, se distribuye bajo licencia Apache 2.0 y se apoya en Qwen/Qwen3-8B como modelo base. Es relevante como pieza de investigación para quienes exploran decodificación especulativa con drafters neuronales comprimidos, aunque sus propios resultados indican que ningún checkpoint supera la puerta de calidad fijada por el autor antes del entrenamiento.

La model card es explícita: los cuatro runs figuran como "fail" en la puerta de validación (agreement y TV frente al top-1 del modelo objetivo). Por tanto, debe tratarse como un artefacto experimental, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) sobre estados ocultos de Qwen3-8B; comprime k=8 posiciones en un latente y las decodifica |
| Parametros totales | no disponible (el repo pesa 0,5 GB; el state_dict no se detalla en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre chunks de k=8 posiciones de Qwen3-8B) |
| Tipos de cuantizacion | no disponible para el autoencoder; el modelo base se usa en 4-bit nf4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | state_dict PyTorch dentro de un dict `{"model": ..., "args": ...}` |

## Arquitectura y entrenamiento

Cada checkpoint es un VAE que toma como entrada una rejilla de estados ocultos de Qwen3-8B: o bien las filas correspondientes a las capas 18, 24, 30 y el estado final normalizado ("full"), o bien solo la fila final ("final"). El encoder comprime k=8 posiciones consecutivas en un único latente (de 512, 1024 o 2048 dimensiones) y el decoder las reconstruye. El entrenamiento se realiza con Qwen3-8B congelado: la pérdida se define de modo que el LM head del modelo base asigne los mismos tokens a las posiciones reconstruidas, lo que constituye la base del drafter para decodificación especulativa sin pérdida.

El autor fija una puerta de calidad antes del entrenamiento, evaluada en conjuntos de desarrollo con teacher forcing y contra el top-1 del modelo objetivo: agreement de al menos 99 % en chat y 99,5 % en matemáticas y código, TV media máxima de 0,01 en chat y 0,005 en matemáticas y código, y una caída máxima de 1 punto con ruido latente a 0,1× la dispersión por dimensión. Los resultados publicados no alcanzan estos umbrales en ningún run (ver sección de benchmarks). El código de definición y carga (`ae_gate.py`) y el de generación de entradas (`cache_states.py`) están en el repositorio de GitHub referenciado.

## Capacidades

- No es un modelo generativo autónomo: no produce texto por sí mismo, sino que reconstruye estados ocultos de Qwen3-8B para alimentar el LM head congelado.
- Compresión y reconstrucción de chunks de k=8 posiciones de los estados ocultos del modelo base.
- Soporte de dos configuraciones de entrada: "full" (capas 18, 24, 30 y estado final normalizado) y "final" (solo estado final).
- Tres tamaños de latente disponibles: 512, 1024 y 2048 dimensiones.
- Diseñado como drafter para decodificación especulativa sin pérdida, con verificación contra el modelo objetivo.
- No dispone de tool calling, capacidades de agente, visión, audio ni multilingüismo propio; todas esas capacidades dependerían del modelo base Qwen3-8B.
- Incluye JSON de resultados con curvas de entrenamiento, TV, KL, buckets de margen y pruebas de ruido en `results/`.

## Casos de uso

- Investigación en decodificación especulativa: usar los checkpoints como drafter suave sobre Qwen3-8B y medir la tasa de aceptación real frente al modelo objetivo, comparando latentes de 512, 1024 y 2048 dimensiones.
- Reproducción de experimentos: el repositorio de GitHub incluye `cache_states.py` y `ae_gate.py`, lo que permite regenerar los estados de entrada y recargar los checkpoints para replicar las curvas de entrenamiento.
- Estudio de compresión de estados ocultos: analizar cuánta información semántica sobrevive al comprimir 8 posiciones en un latente de 512-2048 dimensiones, usando las métricas de TV y KL publicadas.
- Análisis de robustez al ruido latente: las pruebas con ruido a 0,1× la dispersión por dimensión sirven para evaluar la estabilidad del drafter antes de integrarlo en un pipeline de inferencia.
- Comparación de configuraciones de entrada: contrastar el rendimiento de la variante "full" (cuatro filas de estados) frente a "final" (una sola fila) en términos de agreement y coste computacional.
- Base para futuros entrenamientos: los resultados negativos documentados (todos los runs fallan la puerta) permiten identificar qué configuraciones de latente y filas de entrada no bastan y orientar variantes con más capacidad o distintos objetivos de pérdida.

## Benchmarks y rendimiento

Resultados publicados en la model card (agreement frente al top-1 del modelo objetivo; la puerta exige ≥99 % en chat y ≥99,5 % en matemáticas y código):

| Run | Latente | Filas | Math agree | Code agree | Chat agree | Gate |
|---|---|---|---|---|---|---|
| z1024_final | 1024 | final | 0,9371 | 0,9228 | 0,7681 | fail |
| z1024_full | 1024 | full | 0,9398 | 0,9261 | 0,7757 | fail |
| z2048_full | 2048 | full | 0,9456 | 0,9299 | 0,7827 | fail |
| z512_full | 512 | full | 0,9394 | 0,9249 | 0,7779 | fail |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo de lenguaje evaluable de forma independiente.

## Requisitos de hardware

- El repositorio ocupa 0,5 GB, por lo que los checkpoints caben holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 12 GB o superior) y en CPU para carga y pruebas.
- El coste real de inferencia lo domina Qwen3-8B: en 4-bit nf4, el modelo base requiere aproximadamente 5-6 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB para uso cómodo.
- Para el modelo base en precisión completa se necesitan GPUs de 24 GB o más (RTX 4090, A100 40 GB, H100).
- Opciones de despliegue del modelo base: vLLM, TGI, llama.cpp u Ollama para Qwen3-8B; el autoencoder se carga con PyTorch mediante el código de `ae_gate.py`.
- Latencia y throughput: no disponibles. La viabilidad del drafter depende de que supere la puerta de aceptación, cosa que ningún checkpoint logra según los resultados publicados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| ablastvacant/soft-spec-decoding-ae-gate | VAE drafter sobre Qwen3-8B | no disponible | no disponible (chunks de k=8) | apache-2.0 | Experimental, falla la puerta de calidad |
| Qwen/Qwen3-8B | LLM denso | 8B | no disponible en la información | apache-2.0 | Modelo base, listo para uso |
| Drafters especulativos convencionales (p. ej. EAGLE, Medusa) | Cabezas o modelos pequeños de predicción de tokens | típicamente <1B | dependiente del modelo base | variable | Alternativas maduras, no comparadas aquí con datos |

No se dispone de datos de rendimiento comparables entre este artefacto y drafters especulativos estándar en la información proporcionada.

## Limitaciones y advertencias

- Ninguno de los cuatro checkpoints supera la puerta de calidad fijada por el autor: el agreement en chat se queda en torno al 77-78 %, muy por debajo del 99 % exigido.
- No es un modelo de lenguaje: no puede usarse para generación de texto, tool calling ni tareas de agente de forma directa.
- El rendimiento depende por completo de Qwen3-8B y de la configuración de cuantización 4-bit nf4 usada para generar los estados de entrada.
- Riesgo de que el drafter introduzca divergencias respecto al modelo objetivo si se usa sin verificación; el diseño es de decodificación especulativa sin pérdida, pero los resultados publicados no lo validan.
- La model card no documenta sesgos, idiomas ni composición del dataset de entrenamiento más allá de las métricas por dominio (chat, matemáticas, código).
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su estado experimental desaconseja cualquier despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ablastvacant/soft-spec-decoding-ae-gate
- Repositorio del proyecto: https://github.com/apoudel20/soft-spec-decoding
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
