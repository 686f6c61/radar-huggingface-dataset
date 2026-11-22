# JimmyJamJr/qwen3-1.7b-deeprd-curriculum-L48-instruct

## Resumen

`JimmyJamJr/qwen3-1.7b-deeprd-curriculum-L48-instruct` es un ajuste fino completo del modelo base `Qwen/Qwen3-1.7B` de Alibaba, publicado por el usuario JimmyJamJr en Hugging Face. El modelo se entrena mediante un currículo de "lookahead" sobre problemas deductivos sintéticos generados con una versión modificada del generador DeepRD, con el objetivo de mejorar la capacidad de predicción del siguiente paso en cadenas de prueba lógicas.

El modelo parte de la arquitectura transformer densa de Qwen3, con 1.720.574.976 parámetros totales (aproximadamente 1,7 mil millones) y pesos en formato safetensors. El entrenamiento se realizó con fine-tuning completo (AdamW, tasa de aprendizaje constante de 5e-5, precisión bf16) y se guardó al completar la etapa L = 48 del currículo, en el paso 31.825. Para preservar la capacidad de seguir instrucciones, el 6% de los ejemplos de entrenamiento se extrajeron de `allenai/Dolci-Instruct-SFT`, fuera del currículo.

La relevancia de este modelo es acotada y experimental: no es un modelo de propósito general, sino una variante especializada en razonamiento deductivo sintético con nombres de atributos ficticios. Su interés principal reside en el estudio de currículos de entrenamiento sobre tareas de prueba lógica y en la posibilidad de evaluar cómo el ajuste fino especializado afecta a las capacidades generales del modelo base. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del transformer denso Qwen3-1.7B, sin cambios arquitectónicos conocidos respecto al base. El entrenamiento emplea un currículo sobre "lookahead" y vocabulario de atributos: la etapa k entrena con problemas cuyo lookahead se muestrea uniformemente en 1..L_k (con L_k = k × tamaño de paso, siendo el tamaño de paso s = 1) y un vocabulario de atributos de 2(L_k + 1) etiquetas. El modelo avanza a la siguiente etapa cuando su precisión de coincidencia exacta reciente en entrenamiento es suficientemente alta. Se guardó al completar la etapa L = 48, en el paso 31.825.

La tarea es predicción del siguiente paso en pruebas deductivas sintéticas generadas por un generador DeepRD modificado: cada prompt enumera reglas sobre nombres de atributos ficticios, un hecho inicial y un objetivo, seguido de un prefijo de prueba; el modelo debe emitir el siguiente atributo válido. El lookahead se define como el número de pasos de búsqueda en anchura necesarios para distinguir el siguiente paso correcto del distractor. Las entradas se envuelven en la plantilla de chat de Qwen3 con `enable_thinking=False`. El 6% de los ejemplos proviene de `allenai/Dolci-Instruct-SFT` para mantener el seguimiento de instrucciones. No se documentan datos sobre volumen total de tokens, composición completa del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto y conversación mediante la plantilla de chat de Qwen3, heredada del modelo base.
- Predicción del siguiente paso en pruebas deductivas sintéticas con reglas sobre atributos ficticios (tarea principal del ajuste).
- Razonamiento deductivo de cadena sobre problemas generados con lookahead de hasta 48 pasos.
- Seguimiento de instrucciones básico, preservado parcialmente mediante el 6% de datos de `allenai/Dolci-Instruct-SFT`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso general.
- No se documentan capacidades multilingües específicas; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de visión, audio ni modo thinking activo (el entrenamiento usa `enable_thinking=False`).

## Casos de uso

- Investigación sobre currículos de entrenamiento: el modelo sirve como punto de control intermedio (etapa L = 48) para estudiar cómo el currículo de lookahead afecta a la precisión en tareas deductivas sintéticas.
- Evaluación de razonamiento deductivo sintético: permite medir la capacidad de predecir el siguiente paso en pruebas generadas con DeepRD y comparar con el modelo base Qwen3-1.7B.
- Experimentos de olvido catastrófico: al ser un ajuste fino especializado, es útil para analizar cuánto se degradan las capacidades generales del base tras el entrenamiento en una tarea estrecha.
- Generación de datos sintéticos de prueba: puede emplearse para producir continuaciones de pruebas lógicas en pipelines de aumento de datos, siempre con validación posterior.
- Reproducción de experimentos: el autor documenta semilla (1234), tasa de aprendizaje y paso de guardado, lo que facilita reproducir o extender el entrenamiento.
- Docencia y demostraciones de razonamiento formal: útil para ilustrar la diferencia entre modelos generalistas y especializados en tareas de deducción con vocabulario controlado.
- Base para nuevos ajustes: al estar en formato transformers/safetensors, puede servir como punto de partida para fine-tuning adicional en tareas lógicas o de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe la métrica de evaluación interna (coincidencia exacta de la primera palabra delimitada por espacio o puntuación con el atributo gold, en decodificación greedy, insensible a mayúsculas), sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). Para cuantización 4/8 bits, cabe en GPUs consumer de 6-8 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 8 GB o más en bf16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JimmyJamJr/qwen3-1.7b-deeprd-curriculum-L48-instruct | 1,72 B | No disponible | Razonamiento deductivo sintético (DeepRD) | No disponible | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72 B | No disponible en la informacion | Propósito general, chat e instrucciones | No disponible en la informacion | Hugging Face |
| Alternativas de ~1-2 B de propósito general | No disponible | No disponible | Propósito general | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con el modelo base ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Especializado en una tarea sintética muy estrecha (predicción del siguiente paso en pruebas deductivas con atributos ficticios); su utilidad fuera de ese dominio es incierta.
- Riesgo elevado de olvido catastrófico de las capacidades generales del base, pese al 6% de datos de instrucciones de Dolci-Instruct-SFT.
- Riesgo de alucinación en tareas abiertas: el ajuste no está orientado a generar respuestas factuales verificables.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base Qwen3 tiene su propia licencia, que debe consultarse por separado.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre datos sintéticos en inglés según los ejemplos de la model card.
- Longitud de contexto no documentada en la información disponible; debe verificarse en la configuración del modelo base.
- El modo thinking está desactivado en el entrenamiento (`enable_thinking=False`), por lo que no se debe esperar razonamiento extendido estilo Qwen3 thinking.
- No se han publicado métricas cuantitativas de rendimiento ni comparaciones con el base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JimmyJamJr/qwen3-1.7b-deeprd-curriculum-L48-instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de instrucciones utilizado parcialmente: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Paper de DeepRD: no disponible en la informacion proporcionada
- Repositorio del generador DeepRD: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
