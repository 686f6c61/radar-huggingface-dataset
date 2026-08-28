# KordAI/KeawGPT

## Resumen

KeawGPT es un modelo de generación de texto desarrollado por la organización KordAI, publicado en Hugging Face en agosto de 2026. Se trata de un ajuste fino (fine-tune) del modelo base KordAI/KeawGPT-Base, entrenado mediante supervisión directa (SFT) utilizando la librería TRL de Hugging Face. El repositorio tiene un tamaño de 0,8 GB y los pesos se distribuyen en formato safetensors.

La información pública es muy limitada: no se especifican la arquitectura, el número de parámetros, la longitud de contexto ni los idiomas soportados. Según los tags del modelo base, este parece estar relacionado con la familia Qwen3, aunque no se puede confirmar. El modelo se presenta como un ejemplo de uso con un pipeline de generación de texto, lo que sugiere que está orientado a tareas conversacionales o de completado de texto. Dada la escasez de documentación y la ausencia de métricas, su relevancia actual es incierta y probablemente se trate de un experimento o prototipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base podría estar basado en Qwen3 según tags, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base parece tener inglés, sin confirmar) |
| Licencia | no disponible (el YAML indica "licence: license" sin valor concreto) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. El modelo base KordAI/KeawGPT-Base aparece etiquetado con "qwen3" y "text-generation-inference" en Hugging Face, lo que sugiere que podría derivar de la arquitectura Qwen3, pero no hay confirmación oficial. El entrenamiento se realizó mediante SFT (supervised fine-tuning) usando la librería TRL, con las siguientes versiones de framework: TRL 1.12.0, Transformers 5.16.1, PyTorch 2.13.0+cu126, Datasets 5.0.1 y Tokenizers 0.23.1. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto: el ejemplo de uso muestra un pipeline de text-generation con soporte para mensajes en formato chat (roles user/assistant).
- No se dispone de información sobre otras capacidades como razonamiento, código, matemáticas, tool calling, agentes o multimodalidad.

## Casos de uso

No se dispone de información suficiente para determinar casos de uso concretos y realistas. El modelo solo se ha probado en un ejemplo de generación de texto conversacional, por lo que cualquier aplicación práctica sería especulativa. Se recomienda no utilizarlo en entornos de producción sin una evaluación previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos sobre requisitos de hardware. El tamaño del repositorio (0,8 GB) sugiere que el modelo podría ser relativamente pequeño, pero sin conocer el número de parámetros no es posible estimar la VRAM necesaria. No se indica compatibilidad con vLLM, llama.cpp, Ollama u otras herramientas de despliegue.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables con información pública suficiente para establecer una comparativa.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia no está especificada, por lo que el uso comercial es incierto y requiere consultar al autor.
- El modelo carece de documentación técnica y de benchmarks, lo que impide evaluar su fiabilidad.
- Al ser un modelo reciente con cero descargas y cero likes, no hay evidencia de su rendimiento en tareas reales.
- No se recomienda su uso en producción sin una validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KordAI/KeawGPT
- Modelo base: https://huggingface.co/KordAI/KeawGPT-Base
- Organización KordAI: https://huggingface.co/KordAI
