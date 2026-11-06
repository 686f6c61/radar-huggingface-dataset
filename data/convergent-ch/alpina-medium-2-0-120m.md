# Convergent-ch/Alpina-Medium-2.0-120M

## Resumen

Alpina Medium 2.0 (también llamado Minialp) es un modelo de lenguaje denso de tipo Llama, con 119.563.008 parámetros, desarrollado por Convergent-ch y entrenado desde pesos aleatorios (no es un fine-tuning de un modelo base existente). Se publica como una versión de investigación experimental, con pesos completos en Safetensors, tokenizador y una conversión a GGUF F16 incluida en el repositorio. Su propósito declarado es servir como experimento reproducible de entrenamiento desde cero a pequeña escala, más que como modelo de propósito general.

El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente inglés y está pensado para generación de texto conversacional. La propia model card advierte de que las respuestas no relacionadas con su identidad muestran repeticiones y errores factuales, y que su utilidad general es limitada; no se declara ni se ha superado ningún benchmark de código. Por tanto, su relevancia actual es acotada: resulta útil como banco de pruebas para pipelines de entrenamiento, conversión a GGUF y evaluación de modelos pequeños, no como componente de producción.

La ficha se basa exclusivamente en la información publicada en Hugging Face. No hay datos públicos de benchmarks, número de tokens de entrenamiento ni detalles de arquitectura más allá de la etiqueta "llama" y el recuento de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (según tag `llama`; sin detalle de capas ni dimensiones publicado) |
| Parametros totales | 119.563.008 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF F16 incluido en el repositorio; no se documentan otras cuantizaciones (Q4, Q8, etc.) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF (F16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Llama, con 119.563.008 parámetros únicos, entrenado desde inicialización aleatoria. No se publican detalles sobre número de capas, dimensión oculta, número de cabezas de atención, vocabulario ni longitud de contexto nativa. Tampoco se indica el número total de tokens vistos durante el entrenamiento ni si hubo fases de ajuste supervisado, RLHF o DPO.

Las fuentes de entrenamiento declaradas incluyen prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se redistribuyen los datasets y se remite a los avisos y licencias originales. La model card menciona que la conversión a GGUF no implicó reentrenamiento y que el Modelfile usa el formato de chat entrenado con saltos de línea LF. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`apply_chat_template`) y rol de sistema.
- Respuesta a preguntas sobre su propia identidad (2/2 comprobaciones de identidad según el autor).
- Generación de texto genérica; la model card advierte de repeticiones y errores factuales en preguntas no relacionadas con su identidad.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe más allá del inglés.
- No se declara capacidad de visión, audio ni modo "thinking".
- No se declara ni se ha superado ningún benchmark de código.

## Casos de uso

- Banco de pruebas de pipelines de entrenamiento desde cero: permite validar flujos completos (tokenización, entrenamiento, empaquetado en Safetensors, publicación en Hugging Face) con un modelo de 120M parámetros y bajo coste computacional.
- Validación de conversión a GGUF y despliegue en Ollama: el repositorio incluye el GGUF F16 y una etiqueta de Ollama (`girgineron/alpina-medium-2.0:120m`), útil para probar cadenas de conversión y ejecución local.
- Experimentos académicos sobre modelos pequeños: sirve como línea base para estudiar repetición, errores factuales y degradación de calidad en modelos de ~120M parámetros.
- Pruebas de integración con `transformers` y Text Generation Inference: al ser compatible con `endpoints_compatible`, puede usarse para verificar plantillas de chat y APIs de inferencia en entornos de desarrollo.
- Evaluación de formatos de chat y plantillas: el modelo incluye un formato de chat entrenado, lo que permite comparar el comportamiento de distintas plantillas en modelos pequeños.
- Docencia y demostraciones: su tamaño reducido (repositorio de 0,5 GB) facilita ejecutarlo en entornos con recursos limitados para ilustrar conceptos de modelado de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la utilidad general es limitada, que las respuestas no relacionadas con la identidad muestran repeticiones y errores factuales, y que no se ha superado ni reclamado ningún benchmark de código.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 0,24 GB solo para pesos (119,6M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 1 GB.
- VRAM estimada en cuantizaciones de 4 bits (si se generan): en torno a 0,06-0,1 GB para pesos, aunque el repositorio solo incluye F16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también cabe en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers`, Ollama (etiqueta `girgineron/alpina-medium-2.0:120m`), llama.cpp mediante el GGUF F16 y Text Generation Inference (tag `text-generation-inference`).
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina Medium 2.0 120M | 119.563.008 | No disponible | Apache 2.0 | Hugging Face, GGUF F16, Ollama | Entrenado desde cero; evaluación muy limitada |
| SmolLM-135M (HuggingFaceTB) | ~135M | No disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo pequeño de referencia; usado como fuente de datos (SmolLM-Corpus) |
| Qwen2.5-0.5B | ~500M | No disponible en esta ficha | Apache 2.0 | Hugging Face | Mayor tamaño y capacidades; la model card aclara que no hay afiliación con Qwen |

Los datos de contexto y rendimiento de los modelos comparables no se han verificado en la información proporcionada; se indican como no disponibles para evitar inventar cifras.

## Limitaciones y advertencias

- Modelo experimental con evaluación muy limitada; la propia model card advierte de repeticiones y errores factuales en respuestas no relacionadas con su identidad.
- No se ha superado ni reclamado ningún benchmark de código; no debe usarse para tareas de programación en producción.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Longitud de contexto no documentada; riesgo de degradación en conversaciones largas.
- Riesgo elevado de alucinación y de respuestas repetitivas, según el autor.
- No se declaran capacidades de tool calling, agentes ni razonamiento multi-paso.
- Las comprobaciones de identidad (2/2) no implican calidad general; el autor pide explícitamente no inferir calidad de benchmarks a partir de respuestas correctas sobre el nombre.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin evaluación adicional.
- Los datasets de entrenamiento no se redistribuyen; aplican sus licencias originales (ODC-BY, Apache-2.0).
- No hay afiliación con Qwen ni con los autores de los datasets, según la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Medium-2.0-120M
- Etiqueta de Ollama: `girgineron/alpina-medium-2.0:120m` (referenciada en la model card; no se proporciona URL directa)
- SmolLM-Corpus (fuente de datos): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- CodeParrot (fuente de datos): https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Smol-SmolTalk (fuente de datos): https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- self-oss-instruct-sc2-exec-filter-50k (fuente de datos): https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
