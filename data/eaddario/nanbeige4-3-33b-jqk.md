# eaddario/Nanbeige4.3-33B-JQK

## Resumen

Nanbeige4.3-33B-JQK es una cuantizacion experimental del modelo Nanbeige4.3-33B, publicada por el usuario eaddario en Hugging Face. El modelo base es un LLM denso de 33 mil millones de parametros desarrollado por Nanbeige LLM Lab (el laboratorio de IA de la plataforma de reclutamiento BOSS Zhipin), disenado especificamente para tareas de codificacion agentica y trabajo de oficina asistido. Esta version concreta aplica una cuantizacion GGUF con un objetivo global de bits por peso (target bits-per-weight), calibrada con el dataset eaddario/imatrix-calibration.

La relevancia de esta ficha es doble: por un lado, documenta un modelo base de 33B orientado a agentes y codigo publicado bajo licencia Apache 2.0; por otro, describe una tecnica de cuantizacion experimental que busca asignar presupuestos de bits de forma global en lugar de por capas uniformes. En el momento de la consulta, el repositorio se encontraba en estado de subida en curso, por lo que parte de la informacion tecnica (tamano exacto de los ficheros, niveles de cuantizacion disponibles, resultados de validacion) no esta publicada.

No se dispone de datos confirmados sobre arquitectura interna, longitud de contexto o composicion del dataset de entrenamiento del modelo base en la informacion proporcionada; los apartados correspondientes lo indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base descrito como denso, no MoE) |
| Parametros totales | 33B (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con objetivo global de bits por peso (target_bpw); niveles concretos no disponibles |
| Idiomas soportados | en (segun la model card del repositorio de cuantizacion) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es, segun la informacion disponible, un modelo denso de 33B parametros orientado a codificacion agentica y tareas de oficina. No se han publicado en la informacion proporcionada detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion, numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Nanbeige tambien publico una variante Nanbeige4.3-33B-Base para post-entrenamiento personalizado, lo que sugiere que la version principal incorpora un post-entrenamiento adicional del que no se detalla la metodologia.

La aportacion especifica de este repositorio es la cuantizacion. Se trata de una cuantizacion GGUF experimental con un objetivo global de bits por peso (global target bits-per-weight), una estrategia que busca distribuir el presupuesto de bits de forma agregada en todo el modelo en lugar de aplicar una precision uniforme por capa. La calibracion se realizo con el dataset eaddario/imatrix-calibration. No se dispone de informacion sobre el algoritmo exacto de asignacion de bits, los bpw efectivos alcanzados ni los resultados de perplejidad de la cuantizacion.

## Capacidades

- Generacion de texto y codigo: el modelo base esta orientado a tareas de programacion y trabajo de oficina.
- Codificacion agentica: disenado para flujos de agente con multiples pasos segun la descripcion del modelo base.
- Tareas de "cowork" de oficina: redaccion, edicion y manipulacion de documentos segun la descripcion publicada.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Razonamiento multi-paso y uso de agentes: alineado con el proposito declarado del modelo base, sin detalles tecnicos publicados.
- Capacidades multilingues: la model card de esta cuantizacion declara unicamente ingles (en); el soporte de otros idiomas en el modelo base no esta confirmado.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Asistencia a la programacion en local: la version GGUF permite ejecutar un modelo de 33B en estaciones de trabajo con GPU de consumo, integrandolo en editores o terminales para autocompletado y generacion de codigo sin depender de APIs externas.
- Agentes de codificacion en pipelines de desarrollo: el modelo base esta disenado para tareas agenticas, por lo que puede emplearse en flujos de refactorizacion, generacion de tests o resolucion de issues, siempre que se valide el comportamiento de la cuantizacion en cada tarea.
- Automatizacion de tareas de oficina: generacion y edicion de documentos, resumenes y borradores en ingles, aprovechando el enfoque "cowork" del modelo base.
- Despliegue en entornos con requisitos de privacidad: al ser pesos GGUF ejecutables en local con llama.cpp u Ollama, permite procesar codigo propietario sin enviar datos a terceros.
- Evaluacion de tecnicas de cuantizacion: este repositorio es util para investigadores que quieran comparar la cuantizacion con objetivo global de bpw frente a esquemas uniformes sobre un mismo modelo base.
- Prototipado de asistentes tecnicos: servir como backend de un asistente conversacional especializado en desarrollo de software en ingles, con la cautela de validar la calidad tras la cuantizacion.
- Base para experimentos de post-entrenamiento: al existir la variante Base del modelo original, es posible adaptar el modelo a dominios concretos antes o despues de cuantizar (aunque la cuantizacion limita el reentrenamiento).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, ni para el modelo base ni para esta cuantizacion. No se dispone de datos de perplejidad, MMLU, HumanEval, GSM8K ni de comparaciones de calidad frente al modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no publicarse los bpw efectivos ni el tamano de los ficheros. Como referencia orientativa para un modelo denso de 33B en GGUF: a 4 bits por peso serian aproximadamente 17-19 GB de pesos, a 5 bits unos 21-23 GB y a 8 bits unos 33-35 GB, mas el overhead de contexto KV cache.
- GPU recomendadas: para cuantizaciones de 4-5 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian ser suficientes si el bpw efectivo es bajo; para mayor precision o contexto largo, se recomiendan A100 40/80 GB o H100.
- GPU de consumo: probablemente viable en RTX 4090/3090 con cuantizaciones agresivas; en GPUs de 16 GB o menos requeriria offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o LM Studio). vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de esta cuantizacion, por lo que la comparacion se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Nanbeige4.3-33B-JQK | 33B (denso) | no disponible | Apache 2.0 | GGUF (cuantizado) |
| Nanbeige4.3-33B (base) | 33B (denso) | no disponible | Apache 2.0 | no disponible en la informacion |
| Nanbeige4.3-33B-Base | 33B (denso) | no disponible | no disponible | no disponible en la informacion |
| Alternativas de 30-35B densos | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables adicionales con datos verificables.

## Limitaciones y advertencias

- Repositorio incompleto: en el momento de la consulta la subida estaba en curso y la model card completa no estaba disponible; pueden faltar ficheros o metadatos.
- Cuantizacion experimental: el autor la etiqueta como experimental; no hay validacion publicada de la perdida de calidad frente al modelo original.
- Idiomas: la model card declara solo ingles; el uso en castellano no esta garantizado.
- Datos tecnicos ausentes: sin contexto declarado, sin benchmarks y sin detalles de entrenamiento, la evaluacion previa a produccion es imprescindible.
- Riesgo de alucinacion: inherente a los LLM; sin datos de alineacion publicados no puede acotarse.
- Sesgos: no documentados en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Nanbeige4.3-33B, que es el que determina las obligaciones reales.
- Adopcion: cero descargas y cero likes en el momento de la consulta; sin comunidad que valide su calidad.
- Uso en produccion: no recomendado sin evaluacion propia de calidad, latencia y estabilidad.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/eaddario/Nanbeige4.3-33B-JQK
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Dataset de calibracion: https://huggingface.co/datasets/eaddario/imatrix-calibration
- Articulo sobre el lanzamiento del modelo base: https://www.marktechpost.com/2026/10/25/nanbeige-releases-nanbeige4-3-33b-open-agentic-coding-model/
