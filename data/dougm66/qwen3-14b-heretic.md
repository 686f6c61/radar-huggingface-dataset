# dougm66/Qwen3-14B-heretic

## Resumen

Qwen3-14B-heretic es una variante "abliterated" (sin censura, o "decensored") del modelo Qwen3-14B del equipo Qwen. Lo publica el usuario dougm66 en Hugging Face y su principal característica es que se ha reducido el comportamiento de rechazo (refusal) del modelo base mediante una técnica de ablación direccional aplicada con la herramienta Heretic. Los pesos son, por lo demás, los del modelo original, y se distribuye bajo la misma licencia Apache-2.0.

El modelo base Qwen3-14B es un transformer denso de aproximadamente 14.800 millones de parámetros con capacidad de razonamiento en modo "thinking" (cadena de pensamiento explícita). Esta variante conserva la plantilla de chat y el comportamiento de razonamiento del original, pero modifica el espacio de activaciones para minimizar las respuestas de rechazo ante peticiones que el modelo base declinaría.

Su relevancia es acotada y muy específica: está pensado para investigación sobre alineación, experimentación local y estudios de comportamiento de modelos sin las capas de rechazo por defecto. No es un modelo para producción generalista ni para uso comercial sin una evaluación de riesgo previa, dado que la ablación elimina buena parte de la alineación de seguridad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), con modo de razonamiento "thinking" |
| Parametros totales | 14.768.307.200 (14,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-14B) |
| Tipos de cuantizacion | GGUF Q4_K_M incluido en el repo; safetensors en el repo principal; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 14,8B parámetros derivado de Qwen/Qwen3-14B. Qwen3 incorpora un modo híbrido de razonamiento: el modelo puede generar una cadena de pensamiento explícita (bloques `<think>...</think>`) antes de la respuesta final, o responder directamente. Esta variante conserva intactos la plantilla de chat y el comportamiento de thinking del modelo base; la única modificación respecto al original es la ablación direccional de las direcciones de activación asociadas al rechazo.

La modificación se realizó con Heretic (modificador ARA), que ejecuta una optimización multiobjetivo sobre dos métricas: la tasa de rechazos (medida por coincidencia de palabras clave sobre 100 prompts de estilo dañino, donde menor es mejor) y la divergencia KL respecto al modelo base en prompts benignos (donde menor indica menos cambio colateral y mejor retención de capacidades). La versión publicada corresponde al "knee" del frente de Pareto, la prueba número 64, elegida por tener rechazos casi mínimos manteniendo coherencia. Los valores reportados son 0,04 rechazos sobre 100 y una divergencia KL de 0,024 frente al modelo base. La evaluación se hizo con un prefijo de respuesta vacío `<think>\n</think>` para puntuar la respuesta y no la cadena de pensamiento. No se ha realizado ningún ajuste adicional de seguridad ni fine-tuning posterior.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el formato de Qwen3.
- Razonamiento en modo "thinking": genera cadenas de pensamiento explícitas antes de la respuesta final, igual que el modelo base.
- Razonamiento matemático y lógico (capacidades heredadas de Qwen3-14B; no se han publicado evaluaciones específicas de esta variante).
- Generación de código (heredada del modelo base; sin benchmarks publicados para esta variante).
- Cumplimiento de peticiones que el modelo base rechazaría, como consecuencia directa de la ablación.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; se asume el del modelo base, pero no está verificado para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin capacidades de visión ni audio.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve para estudiar cómo la ablación direccional afecta al comportamiento de rechazo y a la coherencia, comparando sus respuestas con las del Qwen3-14B original sobre el mismo conjunto de prompts.
- Experimentación local con modelos sin censura: investigadores que necesitan un modelo de 14,8B que no decline peticiones para estudiar sesgos, robustez o dinámicas de generación en entornos controlados.
- Evaluación de técnicas de edición de pesos: útil como caso de estudio del método Heretic y del compromiso entre tasa de rechazo y divergencia KL (0,04/100 y 0,024 respectivamente en esta versión).
- Generación de texto creativo sin restricciones temáticas: escritura de ficción o guiones que aborden temas sensibles, donde el modelo base aplicaría rechazos; requiere revisión humana del contenido.
- Pruebas de red teaming: uso como modelo "atacante" o generador de prompts adversarios para evaluar los filtros de otros sistemas.
- Despliegue local en hardware de consumo: con la cuantización Q4_K_M incluida en el repo, puede ejecutarse con Ollama o llama.cpp en una GPU de consumo con suficiente VRAM, para experimentación offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta las métricas internas del proceso de ablación:

| Metrica | Valor |
|---|---|
| Rechazos residuales (sobre 100 prompts) | 0,04 |
| Divergencia KL frente al modelo base (prompts benignos) | 0,024 |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 30 GB solo para pesos, más overhead de contexto y KV cache; en la práctica requiere 40 GB o más.
- Cuantización Q4_K_M (incluida en el repo): alrededor de 9-10 GB de VRAM, apta para GPUs de consumo de gama alta.
- GPUs recomendadas: A100 40/80 GB o H100 para BF16; RTX 4090 (24 GB) para BF16 con cuantización parcial o para Q4_K_M con contexto amplio; RTX 3090 (24 GB) y GPUs de 12-16 GB para Q4_K_M con contexto reducido.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M en GPUs de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090, etc.), dependiendo de la longitud de contexto.
- Opciones de despliegue: Transformers (código de ejemplo en la model card), llama.cpp y Ollama mediante el GGUF Q4_K_M incluido; el tag del repo incluye text-generation-inference, por lo que TGI es compatible en principio; vLLM no está confirmado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| dougm66/Qwen3-14B-heretic | 14,8B | no disponible | Apache-2.0 | Variante abliterated; rechazos reducidos (0,04/100), KL 0,024 |
| Qwen/Qwen3-14B | 14,8B | no disponible | Apache-2.0 | Modelo base con alineación de seguridad intacta; referencia para comparar comportamiento |
| Otras variantes abliterated de Qwen3-14B | 14,8B | no disponible | Apache-2.0 (heredada) | Existen múltiples builds comunitarias con metodologías de ablación distintas; no se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina buena parte de la alineación de seguridad del modelo base: cumplirá muchas peticiones que Qwen3-14B rechaza. No ha recibido ningún ajuste de seguridad adicional.
- Riesgo elevado de generar contenido dañino, ilegal o sesgado; el autor la destina explícitamente a investigación y experimentación local.
- La divergencia KL de 0,024 indica cambios colaterales en el comportamiento respecto al modelo base, que pueden afectar a la calidad o coherencia en tareas benignas.
- Posible degradación de capacidades respecto al original: la ablación se eligió en el "knee" del frente de Pareto precisamente para evitar la degradación del endpoint de cero rechazos, pero no se han publicado evaluaciones de capacidades.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Longitud de contexto no documentada en esta ficha; debe consultarse la del modelo base Qwen3-14B.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el uso en producción de un modelo sin alineación conlleva riesgos legales y reputacionales que el usuario debe evaluar; el propio autor lo restringe a investigación.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones específicas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la calidad de la publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dougm66/Qwen3-14B-heretic
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Herramienta de ablación Heretic: https://github.com/p-e-w/heretic
