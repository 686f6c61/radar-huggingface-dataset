# agentic-ptb/opus-high-v3.h040.bag3.step_4

## Resumen

`opus-high-v3.h040.bag3.step_4` es un checkpoint intermedio del proyecto AgentPTB, un experimento de entrenamiento agentico dirigido por Claude Code. El modelo está basado en `Qwen/Qwen3.5-9B-Base` y fue publicado por el usuario `agentic-ptb` con la etiqueta `negative-results`, lo que indica que el run de entrenamiento no produjo ninguna mejora en los pesos respecto al modelo base. Se trata de un artefacto retenido exclusivamente con fines de reproducibilidad y estudio cualitativo, no como un modelo listo para uso práctico.

El checkpoint tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y se distribuye en formato `safetensors` con un tamaño de repositorio de 18,8 GB, consistente con pesos en precisión FP16. Su relevancia radica en documentar un caso de entrenamiento fallido dentro de un pipeline automatizado, lo que puede servir para analizar metodologías de generación de datos y fine-tuning en entornos agenticos.

No se ha publicado ninguna evaluación de rendimiento, y la propia model card advierte explícitamente que no se debe inferir calidad a partir de esta publicación. Por tanto, este modelo no es adecuado para tareas de producción, sino únicamente para investigación metodológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base, detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parámetros. No se han publicado detalles adicionales sobre la configuración interna (número de capas, heads, dimensiones ocultas) en la información disponible.

El entrenamiento corresponde a un run del pipeline AgentPTB denominado `opus-high-v3`, que utiliza Claude Code como agente para generar datos y ejecutar fine-tuning. Según la model card, el checkpoint es de tipo `intermediate` y proviene de la ruta `scratch/agent/bag3/weights/step_4`. El run no mostró mejora alguna en los pesos entrenados, y en el dataset `agentic-ptb/INDEX` se menciona que los runs de SFT de este pipeline regresaron al estado del modelo base, lo que confirma el resultado negativo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: al estar basado en Qwen3.5-9B-Base, podría heredar capacidades generales de lenguaje, pero no hay ninguna evaluación publicada que lo confirme.
- Razonamiento y código: sin datos verificados; no se han publicado resultados en tareas de razonamiento, matemáticas o programación.
- Tool calling y funciones: no hay evidencia de soporte para estas capacidades en este checkpoint.
- Capacidades multilingües: no disponibles; el modelo base Qwen3.5 es multilingüe, pero no se ha verificado en este checkpoint.
- Modos especiales (thinking, visión, audio): no disponibles.

En resumen, las capacidades reales de este checkpoint son desconocidas y no se recomienda asumir ninguna funcionalidad específica más allá de lo que ofrece el modelo base sin validación.

## Casos de uso

- Investigación en reproducibilidad de experimentos: el checkpoint permite a otros investigadores reproducir el pipeline AgentPTB y analizar por qué el entrenamiento no produjo mejoras, comparando los pesos intermedios con el modelo base.
- Estudio de fallos en entrenamiento agentico: sirve como caso de estudio para entender cómo fallan los runs automatizados de fine-tuning cuando los datos generados por agentes no aportan señal útil.
- Análisis de calidad de datos generados por Claude Code: al comparar este checkpoint con el base, se puede evaluar si los datos de entrenamiento del run `opus-high-v3` introducen sesgos o degradación.
- Desarrollo de metodologías de validación temprana: permite probar técnicas de detección de regresión en pesos a mitad de entrenamiento, antes de completar runs costosos.
- Benchmark de herramientas de seguimiento de experimentos: útil para probar sistemas de logging y comparación de checkpoints en pipelines agénticos.
- Educación en ingeniería de modelos: como ejemplo de publicación negativa, documenta buenas prácticas de transparencia al publicar resultados fallidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de evaluación, y los datos del run indican que no hubo mejora sobre el modelo base. Por tanto, no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

Dado que el modelo tiene ~9,4 mil millones de parámetros y se distribuye en FP16 (18,8 GB), los requisitos estimados para inferencia son:

- VRAM estimada: ~19 GB en FP16; ~10 GB en cuantización de 8 bits; ~5 GB en cuantización de 4 bits (estimaciones basadas en el tamaño de parámetros, no en datos oficiales).
- GPU recomendadas: una NVIDIA RTX 3090 o RTX 4090 (24 GB) puede ejecutar el modelo en FP16. Con cuantización de 4 bits, GPUs de 8-12 GB como la RTX 3060 o RTX 4070 serían suficientes.
- Despliegue: compatible con frameworks estándar como vLLM, llama.cpp, Ollama o TGI, siempre que se genere una versión cuantizada.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend utilizado.

No obstante, dado que el modelo no es apto para producción, estos requisitos son orientativos y no se recomienda su despliegue en entornos reales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con otros modelos. A continuación se muestra una comparación estructural con su modelo base y con alternativas de tamaño similar, sin métricas de calidad.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| opus-high-v3.h040.bag3.step_4 (este) | 9,4 B | No disponible | Apache-2.0 | safetensors |
| Qwen/Qwen3.5-9B-Base | 9,4 B | No disponible | Apache-2.0 | safetensors |
| Llama-3.1-8B | 8,0 B | 128 K | Llama 3.1 | safetensors, GGUF |
| Mistral-7B-v0.3 | 7,3 B | 32 K | Apache-2.0 | safetensors, GGUF |

La comparativa se limita a parámetros y licencia; no hay resultados de benchmarks públicos para el checkpoint evaluado.

## Limitaciones y advertencias

- Resultado negativo: el run de entrenamiento no produjo ninguna mejora en los pesos, por lo que el modelo es equivalente o peor que el base en términos de utilidad práctica.
- No apto para producción: no debe utilizarse en aplicaciones reales, ya que no hay evidencia de calidad y el propio autor advierte contra inferir calidad de esta publicación.
- Sesgos del modelo base: al derivar de Qwen3.5-9B-Base, puede heredar sesgos y limitaciones del modelo original, aunque no hay evaluación específica.
- Alucinación y fiabilidad: sin benchmarks, el riesgo de alucinación y errores es desconocido y potencialmente alto.
- Documentación incompleta: no se especifican datos de entrenamiento, contexto, idiomas ni cuantizaciones, lo que limita su uso en entornos controlados.
- Licencia: Apache-2.0 permite uso comercial, pero dado el estado del modelo, cualquier uso comercial sería irresponsable sin evaluación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h040.bag3.step_4
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de runs de AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
