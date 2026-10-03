# emperorofrome/Gmcoder

## Resumen

gmcoder es un modelo de generacion de texto especializado en codigo, de unos 9.400 millones de parametros, publicado por el usuario emperorofrome en HuggingFace con el soporte declarado de Galactic Mandate Linux. No es un modelo entrenado desde cero: se trata de un merge de dos modelos de 9B, Qwen/Qwen3.5-9B y ornith-ai/Ornith-1.5-9B, orientado a generacion de codigo, depuracion, explicacion de codigo y resolucion de problemas algoritmicos. Se distribuye principalmente en formato GGUF cuantizado en Q8_0 (9,79 GB), lo que lo hace desplegable en una sola GPU de gama alta de consumo.

Su relevancia actual radica en la relacion entre rendimiento y coste: el autor reporta un 96,3% en HumanEval y un 90,9% en HumanEval+ Mini (pass@1, 164 tareas, decodificacion greedy), por encima de Ornith-1.5-9B-MTP y de Oxcoder en esa misma comparativa. Ademas, en una prueba interna de tres prompts con contexto de 66.816 tokens, gmcoder genero 37.445 tokens de salida frente a los 95.532 de OXCoder y los 136.794 de Ornith, lo que supone un ahorro del 60,8% y del 72,6% respectivamente.

El modelo esta publicado bajo licencia MIT, soporta unicamente ingles y esta etiquetado como `endpoints_compatible`. La model card no especifica la arquitectura interna, la longitud de contexto oficial ni los datos de entrenamiento, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Es un merge de Qwen/Qwen3.5-9B y ornith-ai/Ornith-1.5-9B; la model card no detalla la arquitectura interna |
| Parametros totales | 9.409.813.744 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible como especificacion oficial. Las evaluaciones del autor usan hasta 66.816 tokens de contexto y 62.000 de salida |
| Tipos de cuantizacion | GGUF Q8_0 (unico archivo publicado en la model card). El repositorio tambien incluye safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (Q8_0) y safetensors |
| Modelos base | Qwen/Qwen3.5-9B, ornith-ai/Ornith-1.5-9B |
| Pipeline | text-generation |
| Tamano del repositorio | 34,3 GB |
| Descargas / likes | 1.397 / 12 |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-10-01 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico documentado es que gmcoder es un modelo fusionado (merge) construido a partir de dos modelos base de 9B: Qwen/Qwen3.5-9B y ornith-ai/Ornith-1.5-9B. El autor no publica el metodo de merge, la mezcla de capas o pesos empleada, ni la receta de hibridacion. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO posteriores al merge.

El unico detalle tecnico de inferencia documentado es el uso de decodificacion por borrador MTP (multi-token prediction) en las evaluaciones: en la comparativa de tres prompts, el draft decoding MTP se activo para gmcoder y Ornith y se desactivo para OXCoder. Esto indica que el modelo es compatible con decodificacion especulativa basada en MTP, una tecnica que acelera la generacion al proponer varios tokens por paso y verificarlos despues.

Las evaluaciones publicadas se realizaron con una plantilla de chat propia del modelo, temperatura 0, offload completo en GPU y una peticion simultanea, con EvalPlus 0.4.0.dev2 en el caso de HumanEval+ Mini.

## Capacidades

- Generacion de codigo: el modelo esta disenado explicitamente para escribir funciones y resolver problemas de programacion, como demuestra la evaluacion sobre las 164 tareas de HumanEval.
- Depuracion de codigo: la model card lo describe como apto para debugging, aunque no se detalla el formato exacto de las tareas.
- Explicacion de codigo: capacidad declarada de explicar fragmentos y soluciones.
- Resolucion de problemas algoritmicos: orientado a problemas de tipo competitivo y ejercicios algoritmicos.
- Razonamiento: el modelo esta etiquetado con `reasoning` y la comparativa de tres prompts distingue explicitamente los tokens de razonamiento del total de tokens de salida.
- Generacion conversacional: etiquetado como `conversational`, con plantilla de chat propia.
- Decodificacion especulativa MTP: soporta decodificacion por borrador con multi-token prediction, lo que reduce el tiempo de generacion.
- Idiomas: unicamente ingles. No hay soporte multilingue documentado.
- Tool calling / function calling: no disponible. No se documenta soporte de llamadas a herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible. La propia model card advierte de que el rendimiento en flujos de agente y tareas multiarchivo no ha sido establecido.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente de programacion en el editor: el modelo puede completar funciones y resolver problemas cortos con una tasa de exito del 96,3% en HumanEval, lo que lo hace util como backend de autocompletado o de chat tecnico dentro de un IDE, siempre con revision humana.
- Generacion de utilidades y scripts en Python: la evaluacion oficial se realiza sobre tareas HumanEval, que son funciones Python autocontenidas; encaja bien en la generacion de scripts de automatizacion, transformaciones de datos y utilidades de linea de comandos.
- Explicacion y documentacion de codigo heredado: dado su enfoque en explicaciones, puede emplearse para generar docstrings, comentarios y resumenes de funciones a partir de fragmentos existentes, con validacion posterior.
- Depuracion asistida: puede recibir un fragmento de codigo y una traza de error y proponer correcciones, apoyandose en la ventana de contexto observada de hasta 66.816 tokens en las pruebas del autor.
- Procesamiento por lotes con presupuesto de tokens ajustado: los datos del autor indican que gmcoder consume un 60,8% menos de tokens de salida que OXCoder y un 72,6% menos que Ornith-1.5-9B-MTP en la misma bateria de tres prompts, lo que lo hace atractivo para pipelines con coste por token o con limites de salida.
- Despliegue local en una sola GPU de consumo: al publicarse en GGUF Q8_0 de 9,79 GB, permite montar un asistente de codigo privado en una estacion de trabajo sin depender de APIs externas.
- Evaluacion comparativa interna de modelos de codigo: sirve como referencia para equipos que quieran contrastar alternativas de 9B en tareas tipo HumanEval con un coste de hardware contenido.

## Benchmarks y rendimiento

### EvalPlus HumanEval+ Mini

Cada modelo recibio una unica completion greedy por tarea a temperatura 0. Se utilizo EvalPlus 0.4.0.dev2 sobre las 164 tareas de HumanEval. Las entradas de gmcoder y del comparador interno son Q8_0. Las cifras son pass@1; HumanEval+ exige superar tanto los tests originales como los aumentados.

| Modelo | HumanEval | HumanEval+ Mini |
|---|---:|---:|
| gmcoder Q8_0 | 96,3% (158/164) | 90,9% (149/164) |
| Ornith-1.5-9B-MTP | 95,7% (157/164) | 89,6% (147/164) |
| Comparador interno Q8_0 | 93,3% (153/164) | 89,0% (146/164) |
| Oxcoder | 92,7% (152/164) | 88,4% (145/164) |

El autor advierte de que se trata de una comparacion de 164 tareas con una sola muestra. La respuesta de Oxcoder a HumanEval/132 se omitio manualmente tras dejar de progresar y se puntuo como fallo, sin registrar la causa de la no finalizacion. El comparador interno devolvio dos respuestas vacias, contabilizadas tambien como fallos. Estos resultados miden problemas cortos de programacion, no rendimiento a nivel de repositorio ni de agente.

### Comparativa de tres prompts con revision GPT-6

Tres prompts guardados se reejecutaron una vez por modelo Q8_0 con 66.816 tokens de contexto, 62.000 tokens de limite de salida, temperatura 0, offload completo en GPU y una peticion cada vez. Cada modelo uso su propia plantilla de chat. La decodificacion MTP se activo para gmcoder y Ornith y se desactivo para OXCoder. El recuento de tokens de salida incluye tokens de razonamiento. `stop` indica que la generacion termino; `length`, que alcanzo el limite compartido.

| Prompt | Modelo | Tokens de salida | Motivo de parada | Puntuacion de revision GPT-6 |
|---|---|---:|---|---:|
| 3 tareas | gmcoder | 3.018 | stop | 2/10 |
| 3 tareas | OXCoder | 6.212 | stop | 3/10 |
| 3 tareas | Ornith-1.5-9B-MTP | 12.794 | stop | 4/10 |
| 15 preguntas | gmcoder | 21.613 | stop | 3/10 |
| 15 preguntas | OXCoder | 27.320 | stop | 2/10 |
| 15 preguntas | Ornith-1.5-9B-MTP | 62.000 | length | 0/10 |
| 30 preguntas | gmcoder | 12.814 | stop | 2/10 |
| 30 preguntas | OXCoder | 62.000 | length | 0/10 |
| 30 preguntas | Ornith-1.5-9B-MTP | 62.000 | length | 0/10 |

Segun el autor, GPT-6 evaluo las nueve respuestas con una rubrica divulgada de 0 a 10 sobre evidencia de correccion, cobertura, ejecutabilidad y adherencia a restricciones. Estas puntuaciones son revisiones cualitativas provisionales, no tasas de exito sobre tests ocultos. En conjunto, gmcoder uso 37.445 tokens de salida en los tres prompts, frente a 95.532 de OXCoder (ahorro de 58.087 tokens, 60,8%) y 136.794 de Ornith-1.5-9B-MTP (ahorro de 99.349 tokens, 72,6%).

Ademas, el autor menciona que en una suite interna de conocimiento y razonamiento gmcoder obtuvo un 30% mas que Qwen3.5-9B y Ornith-1.5-9B, pero no publica el conjunto de tareas ni las puntuaciones detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo publicado es GGUF Q8_0 de 9,79 GB, por lo que se necesitan aproximadamente 10-12 GB de VRAM para pesos mas cache KV en contextos moderados. Con contextos de decenas de miles de tokens, la cache KV puede anadir varios GB adicionales.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM. Una RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) o A100/H100 sobradamente. En GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) el modelo entra en Q8_0, aunque con margen limitado segun la longitud de contexto.
- Cabe en GPU de consumo: si, en Q8_0 y en tarjetas de 12 GB o mas. En 8 GB no entra con esta cuantizacion; seria necesario disponer de cuantizaciones menores, que no estan publicadas en la model card.
- Opciones de despliegue: el autor documenta llama.cpp mediante `llama-cli`. El formato GGUF es compatible con el ecosistema llama.cpp, pero no se documentan recetas oficiales para Ollama, vLLM o TGI, ni se confirma soporte en esos backends.
- Offload: las evaluaciones se realizaron con offload completo en GPU. El modelo puede dividirse entre GPU y CPU con llama.cpp, a costa de latencia.
- Latencia y throughput: no disponible. El autor no publica tokens por segundo. El unico dato indirecto es el ahorro de tokens de salida frente a otros modelos, no una medida de velocidad.
- Decodificacion especulativa: se documento MTP draft decoding activado durante las evaluaciones, lo que puede mejorar el throughput en backends que lo soporten.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval / HumanEval+ Mini | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| gmcoder | 9,41B | No disponible (evaluado hasta 66.816 tokens) | 96,3% / 90,9% | MIT | GGUF Q8_0 y safetensors en HuggingFace |
| Ornith-1.5-9B-MTP | 9B (nominal) | No disponible | 95,7% / 89,6% | No disponible | Modelo base, disponible en HuggingFace |
| OXCoder | No disponible | No disponible | 92,7% / 88,4% | No disponible | Usado como comparador en la model card |
| Comparador interno Q8_0 | No disponible | No disponible | 93,3% / 89,0% | No disponible | No identificado en la informacion disponible |
| Qwen3.5-9B | 9B (nominal) | No disponible | No disponible | No disponible | Modelo base, disponible en HuggingFace |

La model card solo aporta datos cuantitativos homogeneos para las cuatro primeras filas en HumanEval+ Mini. No hay datos publicados de contexto, licencia ni otras capacidades de los modelos comparados en la informacion disponible, por lo que la comparacion se limita a la tarea de generacion de codigo corto.

## Limitaciones y advertencias

- Resultado interno no verificable: el 30% de mejora sobre Qwen3.5-9B y Ornith-1.5-9B procede de una suite privada de conocimiento y razonamiento cuyo conjunto de tareas y puntuaciones detalladas no se publican.
- Comparativa de tres prompts exploratoria: las puntuaciones de revision GPT-6 son valoraciones cualitativas provisionales, no tasas de exito sobre tests ocultos, y no se ejecutaron pruebas especificas por pregunta.
- HumanEval+ Mini es un benchmark pequeno: mide problemas cortos y autocontenidos. No hay evidencia publicada sobre repositorios grandes, tareas multiarchivo, lenguajes poco comunes ni flujos de agente.
- Codigo potencialmente incorrecto o inseguro: el propio autor recomienda revisar y probar el codigo generado antes de usarlo en produccion.
- Variabilidad: los resultados pueden variar entre cuantizaciones, backends de inferencia y ajustes de muestreo.
- Idioma: soporte unicamente en ingles. No hay capacidades multilingues documentadas, lo que limita su uso en castellano u otros idiomas.
- Contexto no especificado: aunque las evaluaciones usaron 66.816 tokens de contexto, la model card no declara la longitud de contexto oficial, por lo que no se puede garantizar ese limite en produccion.
- Licencia: MIT, lo que permite uso comercial sin restricciones adicionales, pero el modelo es un merge de dos modelos base cuyas licencias no se detallan en la informacion proporcionada; conviene verificar las condiciones de Qwen3.5-9B y Ornith-1.5-9B antes de un despliegue comercial.
- Sesgos: no disponible. No se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Alucinacion: riesgo inherente a los modelos generativos. No se publican mediciones de tasa de alucinacion.
- Procedencia de las evaluaciones: la comparativa incluye incidentes documentados (una respuesta omitida de Oxcoder y dos respuestas vacias del comparador interno), lo que anade incertidumbre a las cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emperorofrome/Gmcoder
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Configuracion y resultados completos de la comparativa de tres prompts: `eval_results/three_prompt_20260929/README.md` (ruta relativa dentro del repositorio)
- Preguntas exactas de la comparativa: `eval_results/three_prompt_20260929/prompts/` (ruta relativa dentro del repositorio)
- Tarjeta de puntuacion y evidencias de GPT-6: `eval_results/three_prompt_20260929/GPT6_JUDGING.md` (ruta relativa dentro del repositorio)
- Registros y respuestas en bruto: `eval_results/three_prompt_20260929/rerun_results/` (ruta relativa dentro del repositorio)
- Paper, blog o repositorio adicionales: no disponible
