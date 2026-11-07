# en5yme/Yoshino2-2B

## Resumen

Yoshino2-2B es un ajuste fino (fine-tune) del modelo Qwen3.5-2B de Alibaba Cloud, desarrollado por el autor independiente en5yme. El objetivo declarado es mejorar la capacidad de razonamiento del modelo base mediante destilación (distillation) de un modelo profesor de mayor tamano, Nemotron Lightning 30B-A3B, trasladando su estilo de razonamiento y de respuesta a la arquitectura de 2B parametros de Qwen3.5. El resultado es un modelo de lenguaje causal orientado a razonamiento de proposito general, pensado para llevar "inteligencia a gran escala a modelos de borde" (edge models).

Con 2.274.069.824 parametros totales y un repositorio de 4,6 GB en formato safetensors, se trata de un modelo pequeno que aspira a ejecutarse en hardware modesto. La destilacion se realizo sobre un conjunto de datos sintetico de 10.817 pares pregunta/respuesta generados con el modelo profesor, y el entrenamiento se llevo a cabo con SFT de Unsloth en 3 epocas mediante QLoRA. El autor lo describe explicitamente como un experimento a pequena escala, no como un modelo frontier listo para produccion, y lo orienta a uso experimental y personal.

Su relevancia actual radica en la tendencia de destilar la capacidad de razonamiento de modelos grandes (en este caso un MoE de 30B con 3B activos) en arquitecturas pequenas que caben en GPU de consumo. La ficha debe leerse con cautela: el modelo tiene cero descargas y cero likes en el momento de la consulta, y las mejoras reportadas frente al base son moderadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`); detalles de atencion no disponibles |
| Parametros totales | 2.274.069.824 (2,27B) |
| Parametros activos | No aplica (modelo denso; el profesor Nemotron Lightning 30B-A3B si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; existe version GGUF en repositorio separado |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT segun metadatos de Hugging Face; la model card indica herencia de Apache 2.0 del modelo base Qwen3.5-2B (ver limitaciones) |
| Formato de pesos | safetensors (repo principal); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal que hereda la arquitectura de Qwen3.5-2B. No se han publicado en la informacion disponible detalles sobre el mecanismo de atencion, la longitud de contexto nativa ni la composicion del corpus de preentrenamiento original, que corresponde al modelo base de Alibaba Cloud. La innovacion del ajuste reside en el proceso de destilacion: se generaron 10.817 pares pregunta/respuesta (aproximadamente 135 MB) mediante un mecanismo de auto-prompt y un framework de destilacion propio, a partir del modelo profesor Nemotron Lightning 30B-A3B. El dataset incluye tanto muestras de un solo paso (one shot) como muestras de contexto profundo con 4 prompts.

El entrenamiento consistio en SFT (supervised fine-tuning) con Unsloth sobre el CSV del dataset sintetico, durante 3 epocas con QLoRA (cuantizacion de 4 bits durante el ajuste). No se menciona uso de RLHF, DPO ni decodificacion especulativa. El dataset de entrenamiento esta publicado como `en5yme/Nemotron-Lightning-30B-A3B-Distill`. El autor afirma que el modelo "parece haber adaptado el estilo de razonamiento del profesor", lo que sugiere que la mejora se concentra en formato y estilo de razonamiento mas que en capacidad bruta nueva.

## Capacidades

- Generacion de texto y razonamiento de proposito general en multiples dominios, con estilo de razonamiento destilado del modelo profesor.
- Razonamiento multi-paso orientado a respuestas con cadena de pensamiento, segun el tag `reasoning` y la descripcion del autor.
- Capacidad multilingue limitada al ingles; no se declara soporte de otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes: no disponible en la informacion.
- Vision, audio o modalidades adicionales: no disponible (el modelo es solo texto).
- Modo "thinking" explicito: no confirmado; el tag de razonamiento sugiere respuestas razonadas, pero no se documenta un modo separado.

## Casos de uso

- Prototipado de asistentes de razonamiento en local: el modelo cabe en GPU de consumo y permite experimentar con respuestas razonadas sin depender de APIs, adecuado para pruebas de concepto personales.
- Educacion y tutoria automatizada en ingles: puede generar explicaciones paso a paso de problemas de logica o matematicas basicas, aprovechando el estilo de razonamiento destilado del profesor.
- Generacion de datos sinteticos de razonamiento: util como generador auxiliar de cadenas de pensamiento para aumentar datasets de entrenamiento de modelos mayores.
- Investigacion en destilacion: sirve como caso de estudio reproducible (dataset y receta publicados) para analizar como se transfiere el estilo de razonamiento de un MoE de 30B a un denso de 2B.
- Evaluacion comparativa de ajustes finos: con benchmarks tinyArc, tinyHellaswag, tinyMMLU y tinyTruthfulQA publicados, permite medir el efecto de la destilacion frente al base en tareas de conocimiento y sentido comun.
- Despliegue en dispositivos de borde o entornos con recursos limitados: con 2,27B parametros y version GGUF, puede ejecutarse en CPU o GPU integrada para tareas de razonamiento ligero sin conexion.
- Chatbot experimental de bajo coste: para demos y prototipos donde el coste de inferencia es critico y la precision no es un requisito de produccion.

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluacion con harness tipo lm-evaluation-harness, tareas "tiny", sin desviacion estandar reportada):

| Tarea | Metrica | Yoshino2-2B | Qwen3.5-2B (base) | Delta |
|---|---|---|---|---|
| tinyArc (25-shot) | acc_norm | 0,5726 | 0,5684 | +0,0042 |
| tinyHellaswag (10-shot) | acc_norm | 0,6552 | 0,6294 | +0,0258 |
| tinyMMLU (0-shot) | acc_norm | 0,6063 | 0,5468 | +0,0595 |
| tinyTruthfulQA (0-shot) | acc | 0,4797 | 0,4356 | +0,0441 |

Las mejoras son consistentes pero modestas; la mayor ganancia se observa en tinyMMLU (+5,95 puntos) y la menor en tinyArc (+0,42 puntos). No se han publicado resultados en MMLU completo, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,5-5 GB solo para pesos, mas KV cache; en la practica unos 6-8 GB.
- Cuantizacion a 8 bits: aproximadamente 2,3-3 GB de pesos; a 4 bits (GGUF Q4): aproximadamente 1,3-1,8 GB, apto para GPU de 4-6 GB.
- GPU recomendadas para FP16: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4. Cabe en GPUs de consumo de gama media-alta.
- Cabe en GPU de consumo: si; con cuantizacion Q4 puede ejecutarse en GPUs de 4 GB o incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp y Ollama con la version GGUF publicada; vLLM y TGI para los pesos safetensors (compatibilidad con la arquitectura Qwen3.5 no verificada en la informacion disponible); transformers para uso basico.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Yoshino2-2B | 2,27B | no disponible | MIT (con herencia Apache 2.0 del base) | Fine-tune por destilacion de Nemotron 30B-A3B; solo ingles; cero adopcion registrada |
| Qwen3.5-2B (base) | ~2B | no disponible | Apache 2.0 | Modelo original de Alibaba Cloud; multilingue; Yoshino2 parte de el |
| Yoshino-0.8B (mismo autor) | ~0,8B | no disponible | MIT | Version menor de la misma familia, tambien basada en Qwen3.5 y destilacion |
| Nemotron Lightning 30B-A3B (profesor) | 30B totales / 3B activos (MoE) | no disponible | no disponible | Modelo profesor usado para generar el dataset de destilacion |

No se dispone de datos de benchmarks comparables de terceros (por ejemplo Llama 3.2 1B/3B o Gemma 3 1B/4B) en la informacion proporcionada, por lo que la comparativa se limita a los modelos directamente relacionados.

## Limitaciones y advertencias

- El autor declara explicitamente que no es un modelo frontier listo para produccion y que esta pensado para uso experimental y personal.
- Solo soporta ingles; no se declara ni evalua capacidad multilingue.
- Riesgo de alucinacion inherente a modelos de 2B; la puntuacion en tinyTruthfulQA (0,4797) indica que acierta en menos de la mitad de las preguntas de veracidad.
- Las ganancias frente al base son pequenas en varias tareas (tinyArc +0,42 puntos), por lo que el valor anadido es limitado.
- Ambiguedad de licencia: los metadatos indican MIT, pero la model card afirma que retiene la licencia Apache 2.0 del modelo base Qwen3.5-2B y remite al archivo BASE_LICENSE. Conviene verificar ambos documentos antes de uso comercial.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion independiente ni comunidad que reporte fallos.
- Entrenado con QLoRA sobre datos sinteticos generados por otro modelo: puede heredar sesgos y errores del profesor Nemotron Lightning 30B-A3B.
- No se documenta longitud de contexto, soporte de tool calling ni comportamiento en agentes, lo que limita su uso en pipelines complejos.
- El dataset sintetico (10.817 pares, ~135 MB) es pequeno para un ajuste robusto; el sobreajuste al estilo del profesor es posible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/en5yme/Yoshino2-2B
- Version GGUF: https://huggingface.co/en5yme/Yoshino2-2B-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/en5yme/Nemotron-Lightning-30B-A3B-Distill
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor: https://huggingface.co/en5yme
- Modelo hermano Yoshino-0.8B: https://huggingface.co/en5yme/Yoshino-0.8B
