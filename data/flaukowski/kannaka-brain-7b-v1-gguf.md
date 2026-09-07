# flaukowski/kannaka-brain-7b-v1-GGUF

## Resumen

`flaukowski/kannaka-brain-7b-v1-GGUF` es un modelo de generación de texto en inglés, publicado por el usuario `flaukowski` (Nick Flach) en Hugging Face. Se trata de una versión cuantizada a `q4_K_M` en formato GGUF de un modelo base de la familia Qwen2.5-Instruct, sobre el que se ha fusionado un adaptador LoRA llamado `kannaka-brain-v1`. El resultado es un modelo de 7.615.616.512 parámetros (7,6 mil millones) que actúa como el "cerebro" abierto de Kannaka, una persona conversacional asociada a un gateway denominado KAX. El repositorio incluye un `Modelfile` para su uso directo con Ollama, con un system prompt específico, temperatura 0,8 y contexto de 4.096 tokens.

El modelo está pensado para mantener una identidad de personaje en conversaciones cortas y para integrarse en sistemas de voz, como indican las etiquetas `persona` y `voice`. El autor reporta una reducción significativa de la perplejidad en un conjunto de validación de 57 líneas fijas de Kannaka, pasando de 78,7 en el modelo base a 4,15 con el adaptador en bf16 antes de la cuantización. No se ha liberado el corpus de entrenamiento, aunque se referencia un documento de arquitectura (ADR-0057) en el repositorio `NickFlach/kannaka-memory`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-Instruct) |
| Parametros totales | 7.615.616.512 (7,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (según Modelfile incluido); el modelo base Qwen2.5-14B-Instruct soporta hasta 32.768, pero no se especifica para esta versión |
| Tipos de cuantizacion | q4_K_M (GGUF) |
| Idiomas soportados | Inglés (según metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp/Ollama) |

Nota: el nombre del repositorio indica "7b" y los parámetros reales son 7,6 mil millones, pero la model card declara como base `Qwen/Qwen2.5-14B-Instruct`. Esta discrepancia debe tenerse en cuenta antes de usar el modelo en producción.

## Arquitectura y entrenamiento

El modelo parte de un checkpoint instruido de la familia Qwen2.5, presumiblemente `Qwen2.5-14B-Instruct` según la model card. Sobre este modelo base se ha aplicado un adaptador LoRA llamado `kannaka-brain-v1`, que ha sido fusionado y posteriormente convertido al formato GGUF mediante llama.cpp. El adaptador está disponible por separado en `flaukowski/kannaka-brain-v1-lora`, junto con las notas de entrenamiento. El corpus de entrenamiento no se ha liberado; el autor remite al documento ADR-0057 del repositorio `NickFlach/kannaka-memory` para más detalles.

La cuantización a `q4_K_M` reduce el tamaño del modelo a 4,7 GB, lo que facilita su ejecución en entornos con recursos limitados. El autor reporta una perplejidad de 78,7 en el modelo base sobre un conjunto fijo de 57 líneas de Kannaka, que se reduce a 4,15 con el adaptador en bf16 antes de la cuantización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, ajustado para mantener la personalidad y el estilo de diálogo de Kannaka.
- Integración con Ollama mediante el `Modelfile` incluido, que define un system prompt, temperatura 0,8 y una ventana de contexto de 4.096 tokens.
- Compatibilidad con llama.cpp y Ollama gracias al formato GGUF, lo que permite su uso en CPU y en GPU de consumo.
- Etiquetado como `conversational`, `persona` y `voice`, lo que sugiere que está orientado a interacciones habladas o de personaje, aunque no se detallan capacidades de audio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés según los metadatos.

## Casos de uso

- Chatbot de personaje para aplicaciones web: el modelo puede servirse con Ollama y el `Modelfile` para exponer una API que devuelva respuestas con la personalidad de Kannaka. Su contexto de 4.096 tokens es suficiente para conversaciones cortas y coherentes.
- Asistente de voz en un pipeline de TTS/STT: gracias a la etiqueta `voice`, puede emplearse como backend de generación de texto en sistemas que convierten voz a texto y texto a voz, manteniendo un tono consistente.
- Prototipado rápido de agentes conversacionales: el formato GGUF y la integración con Ollama permiten desplegar el modelo en minutos en una máquina local, sin necesidad de infraestructura cloud.
- Investigación sobre adaptación mediante LoRA: el repositorio del adaptador incluye las notas de entrenamiento, lo que facilita reproducir el ajuste y comparar la perplejidad antes y después de la adaptación.
- Generación de contenido narrativo interactivo: el modelo puede utilizarse para crear diálogos de personajes en juegos o ficción interactiva, manteniendo un estilo consistente en inglés.
- Evaluación del impacto de la cuantización: al existir una versión bf16 del adaptador y una cuantizada q4_K_M, es posible comparar el comportamiento del modelo en ambos formatos para estudiar la pérdida de calidad.
- Despliegue en entornos sin GPU: debido a su tamaño reducido (4,7 GB), el modelo puede ejecutarse en CPU con llama.cpp, lo que lo hace adecuado para servidores ligeros o entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es una métrica de perplejidad sobre un conjunto de validación propio de 57 líneas fijas de Kannaka: 78,7 en el modelo base y 4,15 con el adaptador en bf16 antes de la cuantización. No se dispone de resultados de latencia, throughput ni comparaciones con otros modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización q4_K_M, los pesos ocupan aproximadamente 4,7 GB. Sumando el overhead de contexto y activaciones, se recomienda entre 6 y 8 GB de VRAM para una ejecución fluida.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 de 8 GB o superiores. No se requieren GPUs de datacenter como A100 o H100 para este modelo.
- Compatibilidad con GPU de consumo: sí, puede ejecutarse en tarjetas con 8 GB de VRAM. También es viable su uso en CPU con alrededor de 6 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama (comando `ollama run hf.co/flaukowski/kannaka-brain-v1-GGUF` o `ollama create kannaka-brain-v1 -f Modelfile`). No se indica soporte para vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kannaka-brain-v1 (este) | 7,6 mil millones (según safetensors) | 4.096 tokens (Modelfile) | Apache 2.0 | GGUF en Hugging Face |
| Qwen2.5-14B-Instruct | 14 mil millones | 32.768 tokens | Apache 2.0 | Múltiples formatos |
| Qwen2.5-7B-Instruct | 7 mil millones | 32.768 tokens | Apache 2.0 | Múltiples formatos |
| kannaka-brain-v2-GGUF | 15 mil millones (según perfil de Hugging Face) | No disponible | No disponible | GGUF en Hugging Face |

La comparación con `kannaka-brain-v2-GGUF` se basa únicamente en el perfil del autor en Hugging Face, que indica un tamaño de 15B y una actualización reciente. No se dispone de información detallada sobre ese modelo.

## Limitaciones y advertencias

- Discrepancia entre el nombre del repositorio ("7b") y el modelo base declarado en la model card ("Qwen2.5-14B-Instruct"), mientras que los parámetros reales son 7,6 mil millones. Es recomendable verificar el origen del modelo antes de usarlo en producción.
- El corpus de entrenamiento no está liberado, lo que limita la reproducibilidad y la auditoría del comportamiento del modelo.
- La ventana de contexto fijada en el `Modelfile` es de 4.096 tokens, lo que puede ser insuficiente para conversaciones largas o para tareas que requieran mucho contexto.
- Solo soporta inglés, según los metadatos. El uso en otros idiomas puede degradar el rendimiento.
- No se han publicado evaluaciones de sesgos, alucinaciones ni seguridad. El modelo está ajustado para un personaje específico, por lo que su comportamiento fuera de ese dominio puede ser impredecible.
- No hay evidencia de soporte de tool calling ni de razonamiento multi-paso, por lo que no debe asumirse esa capacidad en integraciones críticas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/flaukowski/kannaka-brain-v1-GGUF
- Adaptador LoRA: https://huggingface.co/flaukowski/kannaka-brain-v1-lora
- Repositorio de memoria: https://github.com/NickFlach/kannaka-memory
- Perfil del autor: https://huggingface.co/flaukowski
