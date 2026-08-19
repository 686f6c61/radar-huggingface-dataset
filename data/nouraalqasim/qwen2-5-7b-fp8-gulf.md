# NouraAlqasim/qwen2.5-7b-fp8-gulf

## Resumen

`NouraAlqasim/qwen2.5-7b-fp8-gulf` es una cuantización post-entrenamiento en precisión FP8 (W8A8) del modelo `Qwen/Qwen2.5-7B-Instruct`, realizada por NouraAlqasim mediante NVIDIA ModelOpt. El objetivo principal es reducir el uso de memoria y acelerar la inferencia en producción, manteniendo las capacidades del modelo base. La particularidad de esta versión es que las escalas de activación estáticas se han calibrado específicamente sobre el dialecto del Golfo (árabe), utilizando 128 diálogos del dataset `Almheiri/ArabCulture-Dialogue`, lo que la hace especialmente adecuada para tareas conversacionales en ese registro lingüístico.

El modelo conserva la arquitectura transformer del Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros, y se distribuye en formato safetensors con cuantización declarada como `modelopt`. No es cargable directamente con `transformers` estándar; requiere un motor compatible como vLLM con la opción `--quantization modelopt`. Aunque no se publican benchmarks propios, se espera que el rendimiento sea muy cercano al del modelo original en FP16, con una reducción significativa del footprint de memoria.

Esta cuantización es relevante para equipos que necesitan desplegar un modelo instructivo de 7B en entornos con recursos limitados o que priorizan la eficiencia, especialmente si trabajan con contenido en árabe del Golfo, donde la calibración específica puede mejorar la precisión de las activaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | FP8 (W8A8) con NVIDIA ModelOpt |
| Idiomas soportados | no disponible (el modelo base es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con cuantización ModelOpt) |

## Arquitectura y entrenamiento

Se trata de una cuantización post-entrenamiento, no de un entrenamiento desde cero. El modelo base es `Qwen/Qwen2.5-7B-Instruct`, originalmente en float16. La cuantización se realiza con NVIDIA ModelOpt usando la configuración `FP8_DEFAULT_CFG`, que aplica pesos y activaciones en FP8 (W8A8). Las escalas de peso son independientes de los datos (data-free), mientras que las escalas de activación son estáticas y por tensor, calibradas con 128 diálogos en dialecto del Golfo (máximo 512 tokens cada uno) extraídos del dataset `Almheiri/ArabCulture-Dialogue` (revisión `9acd60cbbb4f`, seed 1448). El error cuadrático medio de los pesos (weight MSE) reportado es de 2.050e-07, y se calibraron los 196 cuantizadores de activación.

No se aplicaron técnicas de RLHF ni DPO; la única modificación respecto al modelo base es la cuantización y la calibración de las escalas de activación. El autor indica que existen checkpoints hermanos (`-fp8-msa`, `-fp8-gulf`, `-fp8-mixed`) que difieren únicamente en el conjunto de calibración de las escalas de activación.

## Capacidades

No se documentan capacidades específicas en la model card. Al ser una cuantización del modelo instructivo Qwen2.5-7B-Instruct, se asume que conserva las capacidades del modelo original, que incluyen:

- Generación de texto y finalización de instrucciones.
- Razonamiento y resolución de problemas.
- Generación de código y comprensión de lenguajes de programación.
- Soporte de tool calling y function calling (heredado del modelo base).
- Capacidades multilingües, incluido el árabe, con especial énfasis en el dialecto del Golfo gracias a la calibración.
- Capacidad de seguir instrucciones en formato chat.

No se proporcionan detalles adicionales sobre modos especiales como thinking mode o visión.

## Casos de uso

Aunque no se documentan casos de uso específicos, la cuantización FP8 y la calibración en dialecto del Golfo permiten plantear los siguientes escenarios prácticos:

- Atención al cliente automatizada en árabe del Golfo: el modelo puede gestionar conversaciones multi-turno en ese dialecto con menor uso de memoria, gracias a la calibración de activaciones específica.
- Despliegue en producción con GPU de gama media: al reducir el peso a FP8 (aproximadamente 7,6 GB), se puede servir en tarjetas con 12-16 GB de VRAM, como RTX 4070 Ti o RTX 4080, usando vLLM.
- Integración en pipelines de agentes con tool calling: el modelo base soporta function calling, y esta versión cuantizada permite ejecutar agentes en entornos con restricciones de memoria.
- Procesamiento de transcripciones y diálogos en dialecto del Golfo: útil para aplicaciones de análisis de conversaciones o generación de resúmenes en ese registro.
- Generación de código en entornos de desarrollo con recursos limitados: al ser una versión eficiente del Qwen2.5-7B-Instruct, puede usarse en asistentes de programación locales o en CI/CD.
- Fine-tuning posterior sobre dominios específicos: aunque no se indica explícitamente, al ser una cuantización, es posible continuar el entrenamiento con PEFT para adaptarla a tareas concretas, siempre que el framework soporte ModelOpt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para esta cuantización concreta. Se espera que el rendimiento sea cercano al del modelo base en FP16, pero no hay datos cuantitativos que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB, considerando los pesos en FP8 (7,6 GB) más overhead de activaciones y KV cache.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM para margen cómodo; por ejemplo, RTX 4070 Ti, RTX 4080, A100 (40 GB) o H100.
- En consumer GPU: sí, cabe en tarjetas de gama alta como RTX 4090 (24 GB) y en algunas de gama media con 16 GB.
- Opciones de despliegue: vLLM es la opción documentada (comando `vllm serve ... --quantization modelopt`). No se mencionan otras herramientas como llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos; dependerá del hardware y de la configuración de vLLM.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otras cuantizaciones del mismo modelo base (por ejemplo, AWQ o GPTQ) ni con otros modelos de tamaño similar. Se puede señalar que, frente al modelo original en FP16, esta versión reduce el uso de memoria a aproximadamente la mitad, pero no se tienen datos de rendimiento comparativo. La licencia y el contexto no están especificados, por lo que no es posible realizar una comparación completa.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar; el `config.json` declara el tipo de cuantización `modelopt`, por lo que se requiere vLLM u otro motor compatible.
- La calibración específica al dialecto del Golfo puede degradar el rendimiento en otros dialectos árabes o en otros idiomas, ya que las escalas de activación están optimizadas para ese registro.
- Al ser una cuantización FP8, puede existir una ligera pérdida de precisión respecto al modelo original en FP16, aunque no se han publicado métricas que lo cuantifiquen.
- La licencia no está especificada en la model card; se desconoce si permite uso comercial o si se heredan las condiciones de la licencia del modelo base (Qwen2.5, que suele ser Apache 2.0, pero no se confirma).
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente o poco difundida; no hay evidencia de validación externa.

## Enlaces

- [HuggingFace - NouraAlqasim/qwen2.5-7b-fp8-gulf](https://huggingface.co/NouraAlqasim/qwen2.5-7b-fp8-gulf)
