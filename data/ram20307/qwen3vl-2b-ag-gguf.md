# Ram20307/qwen3vl-2b-ag-GGUF

## Resumen

Qwen3-VL-2B Action Genome (GGUF) es una cuantización de 4 bits del modelo `Ram20307/qwen3vl-2b-ag-merged`, que a su vez es un ajuste fino de Qwen3-VL-2B-Instruct sobre el conjunto de datos Action Genome. El modelo resuelve una tarea muy concreta: dado un fotograma de vídeo, describir en JSON las relaciones entre la persona que aparece en la escena y los objetos cercanos, desglosadas en tres ejes (atención, espacialidad y contacto). Lo publica el usuario Ram20307 como artefacto de investigación, no como modelo de propósito general.

La relevancia es acotada pero clara para quien trabaje en scene graph generation o en comprensión de relaciones persona-objeto: ofrece un pipeline completo y reproducible (ajuste fino, fusión de pesos, cuantización GGUF y evaluación) sobre una base multimodal pequeña, de 1.720.574.976 parámetros, que puede ejecutarse en CPU con llama.cpp. El precio es una precisión modesta (recall 0,29 y precisión 0,33 en la métrica de coincidencia exacta sobre 60 fotogramas) y un vocabulario cerrado heredado de Action Genome.

El repositorio contiene dos ficheros: el modelo de lenguaje cuantizado en Q4_K_M (1,11 GB) y el proyector de visión en f16 (0,82 GB), este último obligatorio para procesar imágenes. La licencia declarada es Apache-2.0, aunque los datos de entrenamiento (Action Genome / Charades) están restringidos a uso no comercial en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) con proyector de visión; pesos en GGUF para llama.cpp |
| Parametros totales | 1.720.574.976 (1,72 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Aproximadamente 262.000 tokens por defecto en el modelo base; en la práctica se recomienda limitar a 4096 tokens con `-c 4096` |
| Tipos de cuantizacion | Q4_K_M (5,12 bits por peso) para el modelo de lenguaje; f16 para el proyector de visión |
| Idiomas soportados | No disponible (la model card no los detalla; hereda los del Qwen3-VL-2B-Instruct base) |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento Action Genome / Charades solo para investigación no comercial |
| Formato de pesos | GGUF (dos ficheros: `qwen3vl-2b-ag-Q4_K_M.gguf` y `mmproj-qwen3vl-2b-ag-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal con un codificador de visión acoplado mediante un proyector al modelo de lenguaje. Sobre esa base, el autor realizó un ajuste fino supervisado con el conjunto Action Genome, derivado de vídeos indoor de Charades, y después fusionó los pesos del adaptador en el modelo completo (`qwen3vl-2b-ag-merged`). La model card no detalla hiperparámetros, número de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable no está en la arquitectura, sino en el empaquetado: la publicación de una versión GGUF Q4_K_M junto con el proyector de visión en f16 permite ejecutar inferencia multimodal en llama.cpp, incluso en CPU. La tarea está acotada mediante un prompt fijo que fuerza la salida a un array JSON con las claves `object`, `attention`, `spatial` y `contact`. El conjunto de entrenamiento es pequeño (aproximadamente 3.900 fotogramas) y el vocabulario de relaciones es cerrado, lo que condiciona tanto el rendimiento como la generalización.

## Capacidades

- Descripción de relaciones persona-objeto en un fotograma: genera un array JSON con cada objeto visible relacionado con la persona y sus etiquetas de atención, relación espacial y contacto.
- Salida estructurada en JSON: el prompt de referencia fuerza un formato válido; en la evaluación de 60 fotogramas, los 60 resultados fueron JSON válido.
- Procesamiento de imagen individual (image-text-to-text): no está pensado para vídeo secuencial ni para múltiples fotogramas en una misma inferencia.
- Comprensión multimodal heredada de Qwen3-VL-2B-Instruct: el modelo base es conversacional y multimodal, aunque el ajuste fino lo especializa en la tarea de scene graph.
- Ejecución en llama.cpp: compatible con `llama-mtmd-cli` y el ecosistema GGUF, lo que facilita el despliegue en CPU y en entornos con poca VRAM.
- Tool calling y function calling: no documentado en la model card para esta variante ajustada.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponibles.

## Casos de uso

- Anotación automática de scene graphs en investigación: el modelo genera etiquetas de relación persona-objeto en formato JSON que pueden revisarse y corregirse manualmente para acelerar el etiquetado de nuevos fotogramas de vídeo indoor.
- Preprocesado para sistemas de análisis de comportamiento: las relaciones de atención y contacto entre persona y objetos sirven como señal de entrada para modelos posteriores de reconocimiento de acciones o de interacción.
- Prototipado en CPU sin GPU: al ejecutarse con llama.cpp y ocupar 1,11 GB en Q4_K_M más 0,82 GB de proyector, permite validar pipelines de visión-lenguaje en portátiles o servidores sin acelerador dedicado.
- Extracción de relaciones para bases de datos de vídeo: el JSON estructurado se puede indexar directamente en un almacén documental para consultas posteriores sobre qué objetos rodean a una persona en cada fotograma.
- Docencia y experimentación con cuantización: sirve como caso práctico de ajuste fino multimodal, fusión de adaptadores y cuantización GGUF, con métricas de evaluación publicadas y reproducibles.
- Filtrado previo en pipelines de vídeo: dado su bajo coste computacional, puede actuar como primer estadio que descarta fotogramas sin relaciones relevantes antes de pasar a un modelo mayor.
- Evaluación comparativa de cuantizaciones: el repositorio incluye una comparación parcial entre bf16 y Q4_K_M que puede servir de base para estudiar el impacto de la cuantización en tareas estructuradas.

## Benchmarks y rendimiento

La model card publica una evaluación con la métrica de coincidencia exacta de pares (objeto, atención/contacto), en decodificación greedy y CPU con `-c 4096`. Las dos filas cubren conjuntos de fotogramas distintos, por lo que no son directamente comparables.

| Modelo | JSON válido | Recall | Precision | Fotogramas |
|---|---|---|---|---|
| bf16 merged / adapter | 199 / 199 | 0,31 | 0,45 | 199 |
| Q4_K_M (este modelo) | 60 / 60 | 0,29 | 0,33 | 60 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible. El propio autor advierte que la diferencia de precisión entre bf16 y Q4_K_M no está resuelta, porque el modelo bf16 no se ha evaluado sobre los mismos 60 fotogramas, y que con solo 60 muestras las métricas por relación son muy ruidosas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,9 GB en total (1,11 GB del modelo Q4_K_M más 0,82 GB del proyector f16), más la caché de atención según el contexto configurado.
- Contexto: es imprescindible fijar `-c 4096` o similar. El valor por defecto de aproximadamente 262.000 tokens provoca que llama.cpp intente reservar una caché de atención enorme y el proceso muera por falta de memoria en una máquina de 32 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede alojar el modelo; una RTX 3060, RTX 4060 o superior es más que suficiente. En A100 o H100 el modelo queda muy sobredimensionado en cuanto a memoria, aunque puede ejecutarse sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más de VRAM, y también en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` con los dos ficheros GGUF. No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La evaluación se realizó en CPU con decodificación greedy, pero no se publican tiempos por fotograma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-2B Action Genome (este) | 1,72 mil millones | ~262k por defecto; 4096 recomendado | Relaciones persona-objeto en JSON (Action Genome) | Apache-2.0 en pesos; datos solo investigación | GGUF en Hugging Face |
| Qwen3-VL-2B-Instruct | 2 mil millones (aprox.) | Contexto largo del modelo base | Multimodal conversacional general | Apache-2.0 | Pesos originales en Hugging Face |
| Qwen3vl-2b-ag-merged (bf16) | 1,72 mil millones | Igual que el base | Misma tarea, sin cuantizar | Apache-2.0 en pesos; datos solo investigación | Safetensors en Hugging Face |

La comparación con alternativas de la misma categoría (modelos de scene graph específicos) no está disponible en la información proporcionada. Frente a su modelo base y a la versión bf16, la diferencia principal es el formato GGUF y la cuantización Q4_K_M, que reduce el tamaño a 1,11 GB a costa de una precisión aún no cuantificada con rigor.

## Limitaciones y advertencias

- Precisión modesta: recall de 0,29 y precisión de 0,33 en la métrica de coincidencia exacta sobre 60 fotogramas; insuficiente para producción sin revisión humana.
- Conjunto de entrenamiento pequeño: aproximadamente 3.900 fotogramas de vídeo indoor de Charades, lo que limita la generalización a otros dominios, iluminaciones o escenas exteriores.
- Vocabulario cerrado: las relaciones y objetos se restringen al vocabulario de Action Genome; el modelo no describe relaciones fuera de ese catálogo.
- Un solo fotograma: no modela temporalidad ni relaciones entre fotogramas consecutivos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar objetos o relaciones no presentes, especialmente con imágenes fuera de distribución.
- Sesgos: no documentados en la model card; al entrenarse sobre Charades, hereda los sesgos de ese corpus (escenas indoor, demografía y actividades concretas).
- Licencia de datos: aunque los pesos son Apache-2.0, Action Genome y Charades están restringidos a investigación no comercial; el uso comercial del modelo ajustado es jurídicamente ambiguo y el autor lo desaconseja explícitamente.
- Configuración de contexto obligatoria: sin limitar `-c`, llama.cpp intenta reservar una caché de atención de aproximadamente 262.000 tokens y el proceso se mata por falta de memoria.
- Evaluación incompleta: la comparación bf16 frente a Q4_K_M no se ha realizado sobre el mismo conjunto de fotogramas, por lo que el coste real de la cuantización en precisión no está determinado.
- Idiomas: no disponibles en la información; la salida esperada es JSON con nombres de objeto en inglés según el vocabulario de Action Genome.
- Madurez: cero descargas y cero likes en el momento de la consulta; es un artefacto de investigación reciente sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ram20307/qwen3vl-2b-ag-GGUF
- Modelo base fusionado (bf16): https://huggingface.co/Ram20307/qwen3vl-2b-ag-merged
- Dataset Action Genome: no disponible como enlace directo en la información proporcionada
- Paper de Action Genome: no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible como enlace directo en la información proporcionada
