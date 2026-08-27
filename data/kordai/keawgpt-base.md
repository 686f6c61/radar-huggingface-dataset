# KordAI/KeawGPT-Base

## Resumen

KeawGPT-Base es un modelo de lenguaje de 4.022 millones de parámetros desarrollado por KordAI, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo base `unsloth/qwen3-4b-base-unsloth-bnb-4bit`, que a su vez deriva de la familia Qwen3 de Alibaba. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió una aceleración significativa del proceso (según la model card, "2x faster").

El modelo está orientado a generación de texto en inglés y, al ser una versión "base" (no instructiva), no incluye ajuste para seguir instrucciones ni diálogo. Su relevancia radica en ser una alternativa ligera y de código abierto para tareas de generación de texto, así como una base para fine-tuning posterior en dominios específicos. El repositorio tiene un tamaño de 8,1 GB y los pesos están en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base usa bnb-4bit, pero no se especifica para este modelo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3, con 4.022 millones de parámetros. No se dispone de detalles sobre la configuración exacta (número de capas, cabezas de atención, etc.) más allá de lo heredado de Qwen3-4B. El entrenamiento consistió en un fine-tuning del checkpoint `unsloth/qwen3-4b-base-unsloth-bnb-4bit` utilizando la librería Unsloth, que optimiza el uso de memoria y velocidad, y el framework TRL de Hugging Face. No se han publicado datos sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. Al ser un modelo base, no se ha realizado ajuste instructivo.

## Capacidades

- Generación de texto en inglés: puede completar texto, continuar secuencias y generar contenido coherente.
- Modelo base: no está entrenado para seguir instrucciones ni para diálogo, por lo que no soporta tool calling, agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingües: limitadas al inglés según la información disponible.
- No se han documentado capacidades especiales como visión, audio o modo de pensamiento.

## Casos de uso

- Fine-tuning para dominios específicos: al ser un modelo base, es adecuado como punto de partida para entrenar modelos especializados en tareas concretas (por ejemplo, generación de documentación técnica, resúmenes de texto o clasificación) mediante fine-tuning con datasets propios.
- Generación de texto en inglés para prototipos: puede usarse en aplicaciones de generación de contenido donde no se requiera interacción conversacional, como redacción de borradores o completado de texto.
- Investigación académica: sirve para estudiar técnicas de fine-tuning eficiente (gracias a Unsloth) y comparar comportamientos de modelos base de tamaño medio.
- Experimentación con cuantización: al tener un tamaño de 4B, es viable probar diferentes esquemas de cuantización (GGUF, GPTQ, etc.) para despliegue en entornos con recursos limitados.
- Desarrollo de pipelines de generación de texto: puede integrarse en sistemas de generación de texto donde se necesite un modelo ligero y de código abierto, siempre que la tarea no requiera instrucciones complejas.
- Evaluación de modelos base: útil para comparar el rendimiento de fine-tunings realizados sobre la misma base (Qwen3-4B) y medir el impacto de diferentes estrategias de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM en la documentación del modelo.
- Con 4.022 millones de parámetros, una estimación orientativa sería: en precisión fp16 (~8 GB), en int8 (~4 GB) y en 4-bit (~2 GB). Sin embargo, estos valores son cálculos teóricos y no han sido confirmados por el autor.
- Para inferencia en GPU, se recomienda al menos una GPU con 8 GB de VRAM si se usa fp16, o 4 GB con cuantización int8. Modelos como RTX 3060, RTX 4060 o superiores serían suficientes para cargas ligeras.
- Opciones de despliegue: al ser un modelo compatible con transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se han publicado configuraciones específicas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo es un fine-tuning de Qwen3-4B base, por lo que sus características generales (parámetros, licencia) son similares a las de Qwen3-4B. Sin embargo, no se han publicado benchmarks ni detalles de rendimiento que permitan una comparación objetiva. Se recomienda consultar la documentación de Qwen3-4B para obtener referencias de rendimiento.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no es adecuado para tareas de chat o seguimiento de instrucciones sin un fine-tuning previo.
- Idioma limitado: solo soporta inglés, lo que restringe su uso en aplicaciones multilingües.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas abiertas.
- Sin datos de sesgos: no se ha documentado ningún análisis de sesgos o comportamientos no deseados.
- Licencia Apache 2.0: permite uso comercial, pero se debe verificar el cumplimiento de la licencia del modelo base (Qwen3) y de las herramientas utilizadas (Unsloth, TRL).
- Sin soporte oficial: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad ni tiene mantenimiento activo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/KordAI/KeawGPT-Base)
- [Perfil de KordAI en Hugging Face](https://huggingface.co/KordAI)
- [Búsqueda de modelos con tag kordai](https://huggingface.co/models?other=kordai)
- [Canal de Telegram de KordAI](https://t.me/s/kordai_channel?before=13)
- [Repositorio GitHub de Korda AI (organización relacionada)](https://github.com/korda-ai/korda-ai-spec)
