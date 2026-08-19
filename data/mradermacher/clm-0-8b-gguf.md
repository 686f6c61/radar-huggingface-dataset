# mradermacher/CLM-0.8B-GGUF

## Resumen

El modelo CLM-0.8B es un modelo de lenguaje de aproximadamente 752 millones de parámetros, publicado originalmente por Natarizki y posteriormente cuantizado a formato GGUF por el equipo de mradermacher. Esta versión en GGUF ofrece múltiples cuantizaciones (desde f16 hasta Q2_K) para facilitar su ejecución local en hardware variado, desde CPU hasta GPU con poca memoria. El repositorio se presenta como "static quants" del modelo original, sin información adicional sobre su arquitectura, entrenamiento o capacidades específicas.

La relevancia de esta ficha radica en que se trata de un modelo pequeño, orientado a tareas conversacionales según la etiqueta "conversational", pero la ausencia de documentación detallada limita su evaluación. Es un ejemplo de cómo los modelos cuantizados se distribuyen sin información completa, lo que obliga a los usuarios a probarlos directamente para determinar su utilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 752.393.024 (aprox. 0,75B) |
| Parametros activos | no aplica (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (si es transformer, MoE, SSM, etc.), ni sobre los datos de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas de RLHF o DPO. La unica referencia es que el modelo original reside en https://huggingface.co/Natarizki/CLM-0.8B, pero su model card no se ha incluido en los datos proporcionados. Por tanto, no es posible describir innovaciones tecnicas ni el proceso de entrenamiento.

## Capacidades

No se dispone de informacion verificada sobre las capacidades del modelo. La etiqueta "conversational" sugiere que puede mantener dialogos, pero no hay evidencia de soporte para tool calling, razonamiento multi-paso, vision, audio u otras funcionalidades avanzadas. Dado su tamano (~0,75B parametros), es probable que tenga limitaciones significativas en tareas complejas, pero esto es una inferencia generica y no un dato confirmado.

## Casos de uso

No se pueden recomendar casos de uso concretos sin informacion sobre las capacidades reales del modelo. La ausencia de benchmarks, ejemplos de uso y documentacion tecnica impide determinar para que tareas es adecuado. Se recomienda a los interesados probar el modelo directamente en tareas simples de generacion de texto o chat para evaluar su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se han comparado con modelos similares en el repositorio.

## Requisitos de hardware

Dado el tamano del modelo (0,75B parametros) y las cuantizaciones ofrecidas, se puede estimar el uso de memoria para inferencia, aunque no hay datos oficiales:

- Con cuantizacion Q4_K_M, el modelo ocuparia aproximadamente 0,5 GB en memoria, por lo que cabria en GPUs consumer de 4 GB o menos (por ejemplo, GTX 1650, RTX 3050).
- Con cuantizacion Q8_0, el uso seria de unos 0,8 GB, tambien compatible con GPUs de gama baja.
- La version f16 requeriria alrededor de 1,5 GB, aun accesible para GPUs de 4 GB.
- Para ejecucion solo CPU, llama.cpp o Ollama pueden manejar estas cuantizaciones con RAM suficiente (al menos 2-4 GB).

Las opciones de despliegue incluyen llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (0,8B parametros) en el contexto de esta ficha. No se pueden establecer comparaciones fiables sin datos de rendimiento.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones especificas del modelo.
- La ausencia de licencia conocida impide determinar si puede usarse comercialmente; se recomienda contactar al autor original (Natarizki) para aclarar los terminos.
- Al ser un modelo de tamano reducido, es probable que presente limitaciones en razonamiento complejo, conocimiento factual y coherencia en dialogos largos, aunque esto no esta confirmado.
- El repositorio no incluye el modelo original en safetensors, solo las cuantizaciones GGUF, por lo que no es posible inspeccionar los pesos originales directamente.
- No hay garantias de soporte o mantenimiento por parte del autor de la cuantizacion (mradermacher).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CLM-0.8B-GGUF
- Modelo original (referencia): https://huggingface.co/Natarizki/CLM-0.8B
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
