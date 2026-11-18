# positron-ai/mistralai_Ministral-3-3B-Instruct-2512-ingest-best-gptq

## Resumen

`positron-ai/mistralai_Ministral-3-3B-Instruct-2512-ingest-best-gptq` es una compilación cuantizada en GPTQ de 4 bits del modelo `mistralai/Ministral-3-3B-Instruct-2512`, publicada por Positron AI. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia que reproduce los pesos del modelo base de Mistral AI en precisión reducida para abaratar el coste de memoria y acelerar el despliegue en GPU.

El modelo base es un transformer de tipo `ministral3` con 3.429.006.336 parámetros totales (aproximadamente 3,4 mil millones), orientado a generación de texto y conversación. La cuantización reduce los pesos de bf16 a 4 bits con tamaño de grupo 64 y cuantización simétrica, manteniendo las activaciones sin cuantizar. El repositorio ocupa 2,5 GB.

Su relevancia es práctica: permite ejecutar un modelo instructivo de ~3,4B parámetros en hardware de gama media con un consumo de VRAM notablemente inferior al del original en bf16. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial, aunque el autor de la cuantización no publica métricas de calidad ni de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia `ministral3`, según tag del modelo) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit, grupo 64, simétrica, `desc_act=false`, damp 0,05 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), compatible con `transformers` |

## Arquitectura y entrenamiento

El artefacto es una cuantización GPTQ del modelo `mistralai/Ministral-3-3B-Instruct-2512`. La arquitectura subyacente es un transformer de la familia `ministral3` con 3.429.006.336 parámetros. No se dispone de información sobre el número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto máxima en la documentación proporcionada.

En cuanto al proceso de cuantización, se aplicó GPTQ sobre los pesos en bf16 con precisión de 4 bits, grupo de 64, cuantización simétrica y sin `desc_act`. El conjunto de calibración fue mixto, con 128 muestras de 2048 tokens. La cadena de herramientas empleada fue GPTQModel 7.5.0, transformers 5.12.1, torch 2.9.1 y CUDA 12.8. No se detalla el proceso de entrenamiento original del modelo base (composición del dataset, uso de RLHF/DPO, número de tokens), por lo que esos datos deben consultarse en la model card de Mistral AI.

## Capacidades

- Generación de texto conversacional en modo instructivo, según la designación `Instruct` del modelo base.
- Etiquetado como `text-generation` en el pipeline de Hugging Face, sin indicios de soporte multimodal.
- Compatibilidad con `transformers` y con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue de un asistente conversacional ligero en GPU de gama media: al ocupar 2,5 GB en formato GPTQ 4-bit, permite servir un modelo instructivo de ~3,4B parámetros en tarjetas con 6-8 GB de VRAM, reduciendo el coste por instancia frente al modelo en bf16.
- Prototipado rápido de aplicaciones de generación de texto: la integración con `transformers` y la etiqueta `endpoints_compatible` facilitan montar demos y validar flujos conversacionales antes de escalar a modelos mayores.
- Generación de texto en entornos con restricciones de memoria: útil en estaciones de trabajo con una sola GPU consumer donde el modelo original en bf16 no cabría con margen suficiente para el contexto.
- Clasificación y resumen de documentos de longitud moderada: el modelo puede procesar textos y devolver resúmenes o etiquetas, siempre que la longitud de contexto del modelo base lo permita (dato no disponible en esta ficha).
- Filtrado y preprocesado de datos en pipelines internos: su tamaño reducido permite ejecutarlo en paralelo con otros procesos sin agotar la VRAM del nodo.
- Base para experimentación con cuantización: sirve como referencia para comparar la calidad de GPTQ 4-bit frente al modelo original y a otros formatos (GGUF, AWQ) antes de decidir el formato de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto indica explícitamente que no reporta métricas de rendimiento ni de calidad (ni KL-divergence, ni accuracy, ni perplexity), y que la validación se gestiona internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 2,5 GB en GPTQ 4-bit; en la práctica se necesitan aproximadamente 3-4 GB de VRAM para pesos y overhead, más el espacio para la caché KV según la longitud de contexto (no disponible).
- GPU recomendadas: tarjetas con al menos 6-8 GB de VRAM. El modelo base en bf16 requeriría del orden de 7 GB solo para pesos, por lo que la versión GPTQ amplía el rango a GPU consumer de gama media.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070 y superiores; también en GPUs de 8 GB con contexto moderado.
- Opciones de despliegue: `transformers` con soporte GPTQ (según la cadena de herramientas declarada), y previsiblemente backends compatibles con GPTQ como vLLM o TGI (no confirmado en la información disponible). Para llama.cpp/Ollama haría falta una conversión a GGUF, que este repositorio no incluye.
- Latencia y throughput estimados: no disponibles; el autor no publica métricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (Ministral-3-3B-Instruct-2512 GPTQ) | 3,43B | no disponible | GPTQ 4-bit | Apache 2.0 | Cuantización de terceros sin métricas publicadas |
| `mistralai/Ministral-3-3B-Instruct-2512` (original) | 3,43B | no disponible | bf16 | Apache 2.0 | Referencia de calidad; mayor consumo de VRAM |
| Otros builds cuantizados del mismo base (GGUF, AWQ) | 3,43B | no disponible | 4-bit / otros | Apache 2.0 (heredada) | No se dispone de enlaces concretos en la información proporcionada |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de métricas de calidad: el autor no publica KL-divergence, perplexity ni evaluaciones de accuracy, por lo que no hay evidencia objetiva de la degradación introducida por la cuantización GPTQ 4-bit.
- La cuantización de 4 bits puede degradar el rendimiento en tareas sensibles a la precisión numérica (matemáticas, código, razonamiento encadenado); conviene validar contra el modelo original antes de producción.
- Sesgos conocidos: no disponibles en la información proporcionada; deben evaluarse a partir del modelo base de Mistral AI.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluaciones específicas publicadas para este artefacto.
- Idiomas y longitud de contexto no declarados en esta ficha; consultar la model card del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se mantienen las restricciones del modelo original de Mistral AI; el autor indica que la licencia y restricciones del modelo base siguen aplicándose.
- Artefacto de terceros: Positron AI no es el desarrollador original; la trazabilidad del proceso de cuantización depende de la cadena de herramientas declarada (GPTQModel 7.5.0, transformers 5.12.1, torch 2.9.1, CUDA 12.8).
- Popularidad muy baja (27 descargas, 0 likes en el momento de la consulta): escasa validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/mistralai_Ministral-3-3B-Instruct-2512-ingest-best-gptq
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
