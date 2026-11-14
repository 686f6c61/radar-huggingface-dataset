# Jakejnm25/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "decensored" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un fine-tune de razonamiento de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. Lo publica el usuario Jakejnm25 en Hugging Face y su rasgo diferencial es que se ha aplicado la herramienta Heretic v2.0.0 para reducir drásticamente las negativas del modelo base (de 99/100 rechazos a 5/100 en la evaluacion del autor), manteniendo una divergencia KL de 0,0378 respecto al original.

El modelo conserva la receta de entrenamiento del release de 9B: aproximadamente 250.000 muestras centradas en matematicas y STEM, con enfasis en descomposicion explicita de problemas y patrones de solucion multi-paso. Con 4.539.265.536 parametros reales (segun safetensors) y un repositorio de 9,3 GB, esta pensado para despliegues compactos donde no es viable un modelo de mayor tamano.

Es relevante ahora porque combina tres tendencias: destilacion de un profesor fuerte (DeepSeek-V4-Pro) a un alumno de 4B, publicacion de pesos en safetensors y GGUF para inferencia local, y tecnicas de abliteration (Arbitrary-Rank Ablation) que eliminan el comportamiento de rechazo sin reentrenar. La licencia Apache 2.0 facilita su uso comercial, aunque el caracter "uncensored" introduce riesgos de contenido que conviene evaluar antes de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles de capas y atencion no disponibles |
| Parametros totales | 4.539.265.536 (4,54B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (tag `gguf`); niveles concretos no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-4B con relacion `finetune` respecto a Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B. El entrenamiento sigue el pipeline del release de 9B: destilacion (SFT) sobre aproximadamente 250.000 muestras de matematicas y STEM generadas por DeepSeek-V4-Pro en modo Max Effect, con enfasis en razonamiento estructurado y descomposicion de problemas. Los tags incluyen `distillation`, `sft`, `mtp`, `math` y `stem`, lo que sugiere el uso de Multi-Token Prediction (MTP) en la receta y una evaluacion en configuracion MTP-Q8, aunque no se detallan hiperparametros ni composicion exacta del dataset.

La innovacion principal de esta variante es la aplicacion de Heretic v2.0.0 con Arbitrary-Rank Ablation (ARA). Los parametros publicados son: `start_layer_index` 16, `end_layer_index` 32, `preserve_good_behavior_weight` 0,9854, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 0,6587 y `neighbor_count` 10. La ablacion actua sobre las capas 16 a 32 (la mitad superior de la red) preservando casi por completo el comportamiento original mientras se anula la direccion asociada al rechazo. El resultado reportado es 5/100 rechazos frente a 99/100 del modelo base, con KL de 0,0378.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en descomposicion explicita de problemas.
- Razonamiento matematico y STEM reforzado por destilacion de aproximadamente 250.000 muestras.
- Modo de razonamiento (tag `reasoning`), orientado a cadenas de pensamiento estructuradas.
- Capacidad multimodal image-text-to-text declarada en los tags del repositorio (`image-text-to-text`), si bien la model card no detalla el soporte de vision.
- Soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Conversacion multi-turno (tag `conversational`).
- Comportamiento "uncensored"/abliterated: reduccion drastica de negativas (5/100 segun el autor).
- Compatibilidad con Text Generation Inference y endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Tutoria de matematicas y ciencias: el modelo puede resolver problemas paso a paso y explicar la descomposicion, aprovechando las 250.000 muestras STEM de entrenamiento; adecuado para asistentes educativos en espanol, ingles o chino.
- Generacion de codigo cientifico y scripts de analisis: util para traducir enunciados matematicos a implementaciones en Python o R, con razonamiento intermedio que facilita la revision.
- Despliegue en local o edge: con 4,54B de parametros y pesos GGUF, cabe en estaciones de trabajo con GPU de consumo, lo que permite prototipado sin infraestructura cloud.
- Investigacion sobre alineacion y abliteration: sirve como caso de estudio reproducible de Heretic v2.0.0, con parametros ARA publicados y metricas de rechazo y KL para comparar tecnicas.
- Generacion de contenido creativo sin filtros: para entornos controlados donde se requiere menor tasa de rechazo (ficcion, guiones, role-play), asumiendo la revision humana obligatoria.
- Evaluacion comparativa de destilacion: permite medir cuanto del rendimiento de un profesor grande (DeepSeek-V4-Pro) se transfiere a un alumno de 4B en tareas de razonamiento.
- Asistente conversacional multilingue: cubre seis idiomas y conversacion multi-turno, util para prototipos de atencion al cliente en mercados de Asia oriental y Europa.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de abliteration del autor:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos (sobre 100) | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54B x 2 bytes), mas overhead de KV cache; en la practica, 12-16 GB.
- Cuantizacion GGUF: en Q8 ronda los 5 GB; en Q4, aproximadamente 2,5-3 GB (estimacion segun numero de parametros, no confirmada por el autor).
- GPU recomendadas: A100 o H100 para throughput alto con TGI; RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090/4080 (16-24 GB) tambien viables.
- GPU de consumo: cabe en tarjetas de 8 GB o mas usando cuantizacion GGUF Q4/Q5.
- Opciones de despliegue: transformers, Text Generation Inference (tag `text-generation-inference`), llama.cpp/Ollama mediante los GGUF publicados; vLLM no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic (este) | 4,54B | no disponible | Razonamiento STEM + abliterated | Apache 2.0 | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4B (clase) | no disponible | Razonamiento STEM destilado | Apache 2.0 (heredada) | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9B (clase) | no disponible | Razonamiento STEM + abliterated, mayor tamano | no disponible | Hugging Face |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | 4B (clase) | no disponible | Fine-tune cientifico sobre este modelo | no disponible | Hugging Face |

La comparativa se limita a la familia del propio modelo porque la informacion proporcionada no incluye datos de rendimiento frente a alternativas externas. No hay benchmarks publicados que permitan contrastar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- El modelo es explicitamente "uncensored"/abliterated: puede generar contenido que el modelo base rechazaria, incluido material sensible. Requiere filtros externos y revision humana en produccion.
- La abliteration introduce una divergencia KL de 0,0378 respecto al original; puede degradar sutilmente capacidades no evaluadas (seguridad, coherencia en dominios sensibles).
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en matematicas complejas fuera del dominio de entrenamiento.
- No se han publicado benchmarks estandar, por lo que el rendimiento real en MMLU, HumanEval o GSM8K es desconocido.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificar la configuracion del tokenizer y del modelo.
- El espanol figura entre los idiomas soportados, pero no hay evaluacion especifica de calidad en castellano.
- La model card esta mayoritariamente en HTML y contiene afirmaciones del autor no verificadas de forma independiente (por ejemplo, la tasa de rechazo 5/100).
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede chocar con politicas de plataformas, terminos de servicio o normativa sectorial; conviene auditar el caso de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jakejnm25/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Version 9B uncensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic (herramienta de abliteration): https://heretic-project.org
