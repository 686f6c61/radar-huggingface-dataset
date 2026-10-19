# CTlandu/csci680-a1-t5-small-pretrained

## Resumen

`CTlandu/csci680-a1-t5-small-pretrained` es un checkpoint de T5-small (arquitectura encoder-decoder transformer, 6 capas de encoder y 6 de decoder, 8 cabezas de atención, d_model 512, d_ff 2048, activación ReLU y embeddings compartidos) con 60.506.624 parámetros, inicializado de forma aleatoria y preentrenado desde cero con el objetivo de span corruption. Lo desarrolla el usuario CTlandu en el contexto de la asignatura CSCI 680 (Assignment 1) y no es un modelo de instrucciones ni un asistente conversacional: es una base de preentrenamiento pensada para partir de ella en tareas de código Java.

El problema que aborda es la falta de checkpoints pequeños y reproducibles especializados en el dominio del software. Para ello se entrenó sobre un corpus propio de 904.080 instancias extraídas de 1.091 repositorios Java con licencia MIT, seleccionados con SEART GitHub Search, que incluye métodos Java con su Javadoc y comentarios, mensajes de commit e hilos de revisión de pull requests (dataset `CTlandu/csci680-a1-java-corpus`). El resultado es un modelo de 60 millones de parámetros que ha visto 202.228.279 tokens y que sirve como punto de partida de los modelos afinados `CTlandu/csci680-a1-t5-ft-pt` y `CTlandu/csci680-a1-t5-ft-pt-st`.

Su relevancia es acotada pero clara: se trata de un experimento docente reproducible, con presupuesto de cómputo documentado (0,51 GPU-horas en una NVIDIA RTX PRO 5000 Blackwell en bf16) y tokenizador entrenado exclusivamente sobre el corpus. No compite con modelos de código de gran escala; su interés está en la trazabilidad del pipeline y en su uso como base para ajuste fino en tareas de ingeniería del software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), 6+6 capas, 8 cabezas, d_model 512, d_ff 2048, ReLU, embeddings compartidos |
| Parametros totales | 60.506.624 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card (la referencia T5-small usa 512 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors, sin variantes GGUF, ONNX ni cuantizadas declaradas |
| Idiomas soportados | `code` (Java predominante en el corpus) e `en` |
| Licencia | No disponible (ni en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de T5-small estándar: encoder-decoder transformer con 6 capas en cada torre, 8 cabezas de atención, dimensión de modelo 512, dimensión de feed-forward 2048, activación ReLU y embeddings de entrada/salida compartidos. Partiendo de pesos aleatorios (no de un checkpoint previo de Google), se aplicó el objetivo de span corruption característico de T5: se enmascara el 15 % de los tokens de cada instancia con una longitud media de span de 3, y el modelo debe reconstruir los spans enmascarados. El tokenizador es SentencePiece Unigram con 32.000 piezas más 100 tokens centinela, con byte fallback, entrenado únicamente sobre el corpus del proyecto.

El corpus de preentrenamiento son 904.080 instancias procedentes de 1.091 repositorios Java con licencia MIT, filtrados con SEART GitHub Search, que combinan métodos Java con su Javadoc y comentarios, mensajes de commit e hilos de revisión de pull requests. El entrenamiento consumió 20.000 pasos con batches de 128 instancias, es decir, 202.228.279 tokens vistos, con optimizador AdamW a tasa de aprendizaje 1e-4, 1.000 pasos de warm-up y decaimiento lineal, en precisión bf16 sobre una única NVIDIA RTX PRO 5000 Blackwell, con un coste total de 0,51 GPU-horas. Sobre el 1 % reservado como held-out, el modelo alcanza una pérdida de span corruption de 3,146 y una precisión de token enmascarado del 21,5 %. No se documenta en la información disponible ninguna fase de RLHF, DPO o ajuste instruccional: se trata exclusivamente de preentrenamiento auto-supervisado.

## Capacidades

- Modelo base de preentrenamiento: su capacidad nativa es la reconstrucción de spans enmascarados (denoising), no la generación libre condicionada a instrucciones.
- Aprendizaje de representaciones y distribución del dominio Java + inglés técnico, útil como inicialización para ajuste fino supervisado.
- Relleno de huecos de código (masked infilling) mediante los 100 tokens centinela del tokenizador, lo que permite plantear tareas de completado con contexto a izquierda y derecha.
- Manejo de vocabulario específico de software gracias a un tokenizador SentencePiece entrenado solo con el corpus, con byte fallback para caracteres fuera del vocabulario.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de un modelo T5 preentrenado con span corruption).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés y código; el corpus no incluye otros idiomas naturales.
- Ausencia de modo thinking, visión, audio u otras modalidades.

## Casos de uso

- Generación de Javadoc y comentarios a partir del cuerpo de un método Java: partiendo de este checkpoint y afinándolo con pares método-documentación (que ya están en el corpus), se obtiene un modelo capaz de producir documentación técnica con 60 M de parámetros, desplegable en CPU.
- Generación de mensajes de commit: el corpus incluye mensajes de commit, por lo que el checkpoint es una inicialización razonable para un ajuste fino que, dado un diff, emita un mensaje descriptivo; útil en herramientas internas de revisión.
- Completado de código con relleno de huecos: el modelo puede afinarse para predecir spans enmascarados dentro de un método, aprovechando los 100 tokens centinela y el contexto bidireccional del encoder.
- Clasificación de código como text-to-text: detección de code smells, defectos o uso de APIs obsoletas formulada como generación de una etiqueta, siguiendo el marco unificado de T5.
- Resumen de hilos de revisión de pull requests: dado que el corpus contiene review threads, sirve como base para condensar discusiones largas en un resumen accionable, con un ajuste fino previo.
- Reproducibilidad docente e investigación en pretraining: el pipeline completo (dataset, presupuesto de 0,51 GPU-horas, hiperparámetros y métricas held-out) permite replicar experimentos de preentrenamiento de bajo coste y estudiar el efecto del dominio en modelos pequeños.
- Preentrenamiento continuado sobre nuevos repositorios: al ser un checkpoint íntegro con tokenizador propio, se puede seguir entrenando con span corruption sobre corpus adicionales del mismo dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de preentrenamiento sobre el 1 % held-out del corpus, que no son comparables con MMLU, HumanEval o GSM8K:

| Metrica (held-out, 1 % del corpus) | Valor |
|---|---|
| Perdida de span corruption | 3,146 |
| Precision de token enmascarado | 21,5 % |
| Tokens vistos en entrenamiento | 202.228.279 |
| Coste de entrenamiento | 0,51 GPU-horas (1x RTX PRO 5000 Blackwell, bf16) |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 242 MB en fp32, unos 121 MB en bf16/fp16, unos 61 MB en int8 y unos 30 MB en int4 (estimaciones a partir de los 60.506.624 parámetros; no se publican ficheros cuantizados).
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entrenó en una NVIDIA RTX PRO 5000 Blackwell, pero para inferencia basta una RTX 3060, RTX 4090, A100 o H100, e incluso GPU integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU, dado el tamaño reducido del checkpoint (repositorio de 0,2 GB).
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en los metadatos), vLLM para encoder-decoder, y llama.cpp u Ollama únicamente si se convierte previamente a GGUF, conversión que no se distribuye.
- Latencia y throughput: no disponibles. Como referencia de coste, el preentrenamiento completo consumió 0,51 GPU-horas, lo que da una idea del orden de magnitud del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Preentrenamiento | Licencia | Observaciones |
|---|---|---|---|---|---|
| CTlandu/csci680-a1-t5-small-pretrained | 60,5 M | No disponible (ref. 512) | Span corruption sobre corpus Java propio (202 M tokens) | No disponible | Tokenizador propio de 32.000 piezas; checkpoint docente |
| google-t5/t5-small | 60,5 M | 512 | Span corruption sobre C4 (inglés) | Apache 2.0 (según su model card pública) | Referencia canónica; sin especialización en código |
| google-t5/t5-base | 220 M | 512 | Span corruption sobre C4 | Apache 2.0 (según su model card pública) | Mayor capacidad, sin dominio de código |
| Salesforce/codet5-small | ~60 M | 512 | Objetivos de identificación y generación sobre código | No verificada en la información disponible | Especializado en código pero no en Java con Javadoc/commits/PRs |

## Limitaciones y advertencias

- No es un modelo de instrucciones: no sigue prompts conversacionales ni responde preguntas de forma fiable sin ajuste fino previo; usarlo como asistente directamente producirá salidas degeneradas.
- Riesgo alto de alucinación en cualquier tarea generativa aplicada sin ajuste fino, dado que solo ha recibido preentrenamiento con span corruption.
- Licencia no declarada: no hay información que permita afirmar que el uso comercial esté permitido. El corpus subyacente es de repositorios MIT, pero eso no determina la licencia del modelo.
- Sesgos: el corpus procede de repositorios Java populares de GitHub seleccionados con SEART, lo que sobrerrepresenta ciertos estilos de código, frameworks y convenciones, y limita la diversidad de dominios y de idiomas naturales.
- Cobertura lingüística restringida a inglés técnico y código; no se ha entrenado con otros idiomas naturales.
- Longitud de contexto no documentada en la model card: conviene asumir el límite de 512 tokens de T5-small hasta verificación empírica.
- Métricas held-out modestas (precisión de token enmascarado del 21,5 %): no debe esperarse una calidad de completado de código equiparable a modelos especializados más grandes.
- Sin variantes cuantizadas ni ficheros GGUF publicados, el despliegue en llama.cpp u Ollama requiere una conversión manual.
- Trazabilidad: el modelo se publica como material de una asignatura; no hay garantía de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CTlandu/csci680-a1-t5-small-pretrained
- Dataset del corpus: https://huggingface.co/datasets/CTlandu/csci680-a1-java-corpus
- Modelo afinado (referenciado en la model card): https://huggingface.co/CTlandu/csci680-a1-t5-ft-pt
- Modelo afinado (referenciado en la model card): https://huggingface.co/CTlandu/csci680-a1-t5-ft-pt-st
- Repositorio del curso con código, data card y registro de experimentos: `aura-lab-wm/teaching-genai4se-2026-jtang05`
- T5-small de referencia: https://huggingface.co/google-t5/t5-small
- Paper de T5 (Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer): https://arxiv.org/abs/1910.10683
- Repositorio oficial de T5: https://github.com/google-research/text-to-text-transfer-transformer
- Entrada de Wikipedia sobre T5: https://en.wikipedia.org/wiki/T5_(language_model)
