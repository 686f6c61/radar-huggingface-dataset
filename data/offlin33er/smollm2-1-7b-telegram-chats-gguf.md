# Offlin33er/SmolLM2-1.7B-telegram-chats-GGUF

## Resumen

SmolLM2-1.7B-telegram-chats es un ajuste fino supervisado (SFT) del modelo base SmolLM2-1.7B de HuggingFaceTB, desarrollado por el usuario Offlin33er. El modelo está especializado en una tarea muy concreta: generar historiales de conversación en el formato de exportación de Telegram Desktop (`result.json`). Para ello se entrenó sobre 3.000 conversaciones sintéticas de Telegram, utilizando la librería TRL. El resultado es un modelo de 1.711.376.384 parámetros (1,7 mil millones) con licencia Apache 2.0 y únicamente disponible en inglés.

La relevancia de este modelo es acotada y muy específica: no compite en capacidades generales de razonamiento o código, sino que sirve como generador de datos sintéticos de chat para pruebas de pipelines de renderizado, fine-tuning de otros modelos o generación de fixtures de conversación. Su utilidad práctica depende de que el usuario necesite exactamente ese formato de salida.

El repositorio distribuido contiene únicamente cuantizaciones GGUF (f16 y Q4_K_M) del modelo ajustado, lo que facilita su ejecución en CPU y en entornos con recursos limitados mediante llama.cpp o LM Studio. No se proporcionan pesos en safetensors en este repositorio, aunque el modelo de precisión completa existe en un repositorio separado del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (3,4 GB), Q4_K_M (1,1 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con TRL sobre un conjunto de 3.000 conversaciones sintéticas de Telegram, publicadas como dataset `Offlin33er/telegram-chat-export-synthetic`. El objetivo del entrenamiento es que el modelo reproduzca la estructura de un archivo `result.json` de exportación de Telegram Desktop, incluyendo los campos y el formato propios de ese esquema.

No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de su carácter sintético, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card remite al repositorio del modelo de precisión completa para consultar el procedimiento de entrenamiento y las versiones de los frameworks utilizados.

## Capacidades

- Generación de historiales de conversación en el formato de exportación de Telegram Desktop (`result.json`).
- Generación de datos sintéticos de chat para fine-tuning o pruebas de pipelines de renderizado.
- Generación de texto conversacional en inglés, heredada del modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Generación de fixtures de chat para pruebas: el modelo produce conversaciones con el esquema de exportación de Telegram, lo que permite alimentar tests de renderizado o de importación sin depender de datos reales.
- Creación de datasets sintéticos para fine-tuning: se pueden generar conversaciones de estilo Telegram para ampliar corpus de entrenamiento de modelos conversacionales, siempre que el dominio objetivo sea ese formato.
- Validación de pipelines de exportación e importación: sirve para comprobar que un parser de `result.json` maneja correctamente los campos y estructuras que el modelo genera.
- Pruebas de estrés en aplicaciones de mensajería: permite generar volúmenes de conversaciones sintéticas para evaluar el comportamiento de clientes de chat o visores de historial.
- Demostraciones en CPU: al existir una cuantización Q4_K_M de 1,1 GB, puede ejecutarse en Spaces gratuitos de CPU, como demuestra la demo del autor, para mostrar generación de chats sin GPU.
- Generación de contenido de ejemplo para documentación: útil para ilustrar formatos de exportación de Telegram en manuales técnicos o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q4_K_M y 3,4 GB con f16, según los tamaños de archivo indicados en la model card.
- GPU recomendadas: no se especifican; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo e incluso en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM para Q4_K_M y 4 GB para f16.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runner basado en llama.cpp; la demo del autor se ejecuta en un Space de CPU gratuito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| SmolLM2-1.7B-telegram-chats | 1,71 B | no disponible | Generación de exports de Telegram | Apache 2.0 | GGUF |
| SmolLM2-1.7B (base) | 1,71 B | no disponible | Propósito general | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | 1,71 B | no disponible | Instrucciones generales | Apache 2.0 | safetensors, GGUF |

La comparación con el modelo base y con la variante Instruct de la misma familia es la más pertinente: comparten tamaño y licencia, pero el modelo aquí descrito está especializado en un formato de salida concreto y no está pensado para tareas generales de instrucción.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para emitir exports de Telegram; su rendimiento en tareas generales de texto o razonamiento no está documentado y previsiblemente será inferior al del modelo base.
- Idioma: solo se declara soporte de inglés.
- Datos sintéticos: el entrenamiento se basa en conversaciones sintéticas, lo que puede introducir patrones repetitivos o poco realistas en la salida.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede producir campos o estructuras inválidas en el JSON de salida; conviene validar la salida con un parser antes de usarla en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad o idoneidad del modelo.
- La model card incluye un banner promocional de un producto comercial ajeno al modelo; no debe interpretarse como parte de las capacidades o garantías del modelo.
- No se documentan sesgos específicos, pero al derivar de un modelo base entrenado con datos web, es probable que herede sesgos de ese corpus.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Offlin33er/SmolLM2-1.7B-telegram-chats-GGUF
- Modelo de precisión completa: https://huggingface.co/Offlin33er/SmolLM2-1.7B-telegram-chats
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/Offlin33er/telegram-chat-export-synthetic
- Demo en Space: https://huggingface.co/spaces/Offlin33er/telegram-chat-generator
- TRL: https://github.com/huggingface/trl
- LM Studio: https://lmstudio.ai
