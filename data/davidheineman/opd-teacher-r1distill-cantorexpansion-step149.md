# davidheineman/opd-teacher-R1Distill-CantorExpansion-step149

## Resumen

El modelo `davidheineman/opd-teacher-R1Distill-CantorExpansion-step149` es un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder denso de aproximadamente 1.777 millones de parametros (1,78 B) publicado con formato safetensors. Lo desarrolla el usuario de HuggingFace davidheineman dentro de un proyecto de investigacion sobre destilacion on-policy (OPD, on-policy distillation) y aprendizaje por refuerzo con entornos verificables (etiquetas `rlve` y `grpo`). Se trata, por tanto, de un artefacto de investigacion mas que de un modelo de proposito general listo para produccion.

El modelo no se ha entrenado para ser asistente generalista, sino para actuar como profesor (*teacher*) especializado en el entorno `CantorExpansion`: se han realizado 150 pasos de entrenamiento con GRPO sobre prompts de dificultad 0 de ese entorno, con cuatro prompts y 16 rollouts por paso y sin filtrado DAPO de prompts. El resultado son los pesos finales del paso 149, pensados para generar trayectorias de razonamiento que luego sirvan para destilar conocimiento en modelos alumnos dentro del mismo entorno.

Su relevancia es acotada pero real para quien investiga en RL con recompensas verificables y en tecnicas de destilacion: es un ejemplo reproducible de como se construye un profesor especifico de entorno a partir de un modelo destilado pequeno (1,5 B), lo que abarata el coste de generar datos sinteticos de razonamiento. Fuera de ese nicho, la ficha publica no aporta licencia, idiomas ni contexto declarados, por lo que su uso en produccion exige precaucion juridica y tecnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen2 (etiqueta `qwen2` del repositorio), derivado de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Parametros totales | 1.777.088.000 (aprox. 1,78 B) |
| Parametros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio. Al distribuirse en safetensors, admite conversiones externas a GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) mediante llama.cpp |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano del repositorio: 3,6 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`: un transformer decoder denso de la familia Qwen2 con normalizacion RMSNorm, attention con RoPE y capas MLP con activacion SwiGLU, resultado de destilar las capacidades de razonamiento de DeepSeek-R1 en un modelo Qwen de ~1,5 B de parametros. El repositorio que nos ocupa solo anade un ajuste posterior sobre esos pesos; no se documenta ningun cambio estructural en la model card.

El entrenamiento se describe de forma muy concisa: 150 pasos sobre prompts de dificultad 0 del entorno `CantorExpansion`, con cuatro prompts por paso y 16 rollouts por prompt, empleando GRPO (Group Relative Policy Optimization) como algoritmo de optimizacion y sin aplicar el filtrado de prompts de DAPO. El autor etiqueta el resultado como profesor de destilacion on-policy (*OPD teacher*) y lo enmarca en el proyecto de entrenamiento `david-heineman/rl-data-opd-teachers-r1-distil`, dentro del grupo `opd-teachers-r1-nofilter16-20260929-231458`. No se detalla el volumen total de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y de cadenas de razonamiento en el estilo de DeepSeek-R1 (razonamiento paso a paso antes de la respuesta), heredado del modelo base destilado.
- Resolucion de tareas del entorno `CantorExpansion` (problemas de expansion de Cantor, es decir, conversion entre sistemas de numeracion posicional y su representacion en forma de expansion), sobre las que ha recibido entrenamiento especifico con GRPO.
- Actuacion como modelo profesor en pipelines de destilacion on-policy: generar trayectorias y justificaciones usables como senal de supervision para modelos alumnos.
- Razonamiento matematico y algoritmico de tipo competicion, capacidad tipica de la familia DeepSeek-R1-Distill.
- Soporte de tool calling o function calling: no disponible / no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el formato de razonamiento largo del modelo base es compatible con flujos multi-paso, pero no hay validacion publicada.
- Capacidades multilingues: no disponibles (no se declara ninguna lista de idiomas).
- Capacidades especiales (modo thinking explicito, vision, audio): no documentadas en esta ficha mas alla del razonamiento textual tipico de la familia R1.

## Casos de uso

- Generacion de datos sinteticos de razonamiento para destilacion: el modelo puede producir cadenas de razonamiento etiquetadas para el entorno `CantorExpansion`, que despues se usan como supervision de un modelo alumno mas pequeno o mas rapido dentro del mismo pipeline de OPD.
- Investigacion en RL con recompensas verificables (RLVE): sirve como referencia de "profesor" ya entrenado para reproducir experimentos de GRPO con prompts de dificultad 0, comparando configuraciones con y sin filtrado DAPO de prompts.
- Creacion de conjuntos de evaluacion especificos de entorno: al estar especializado en una unica familia de tareas, es util para medir la brecha entre profesores y alumnos en tareas de expansion de Cantor y detectar olvido catastrofico del alumno.
- Estudio de especializacion estrecha en modelos pequenos: permite analizar como 150 pasos de GRPO con cuatro prompts y 16 rollouts por paso modifican las capacidades de un modelo destilado de 1,5 B, incluyendo el coste en capacidades generales.
- Base para ajustes posteriores: al ser un checkpoint intermedio de investigacion, puede servir como punto de partida para fine-tuning adicional en tareas de aritmetica posicional o conversion de bases.
- Despliegue en entornos con recursos muy limitados para tareas acotadas: con cuantizacion de 4 bits ocupa alrededor de 1 GB, por lo que puede ejecutarse en portatiles o en el borde para resolver exclusivamente tareas de conversion de bases y validacion de resultados.
- Generacion de pares solucion-verificacion: el modelo puede emplearse para producir candidatos de solucion que un verificador programatico acepte o rechace, alimentando bucles de autoentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de expansion de Cantor, y la busqueda web asociada no ha devuelto ningun resultado relevante sobre este modelo. No se deben inferir cifras del modelo base ni extrapolarlas al checkpoint del paso 149.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (1,78 B) y del tamano del repositorio (3,6 GB), no mediciones publicadas por el autor:

- VRAM estimada para inferencia: en BF16/FP16, unos 3,6 GB de pesos mas overhead de activaciones y cache KV, lo que situa el consumo practico en torno a 5-6 GB; en cuantizacion Q8_0, aproximadamente 2-2,5 GB; en Q4_K_M, alrededor de 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente en BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para servir con lotes grandes o contexto largo, A100 o H100 permiten mayor paralelismo y throughput, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si. En BF16 cabe con holgura en tarjetas de 8-12 GB; en cuantizaciones de 4 y 5 bits cabe incluso en iGPU y en Mac con memoria unificada de 8 GB.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servicio con batching continuo, llama.cpp y Ollama para ejecucion local tras convertir a GGUF, y LM Studio u otros frontends basados en llama.cpp.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd-teacher-R1Distill-CantorExpansion-step149 | 1,78 B (denso) | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes | Checkpoint de investigacion especializado en el entorno `CantorExpansion` |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B (denso) | No verificado en esta ficha | MIT segun su model card | HuggingFace, ampliamente descargado | Modelo base; razonamiento general y matematicas, sin especializacion en un entorno concreto |
| Qwen2.5-1.5B-Instruct | 1,54 B (denso) | No verificado en esta ficha | Apache 2.0 | HuggingFace | Alternativa generalista de tamano similar, orientada a instrucciones, sin modo de razonamiento largo |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6 B (denso) | No verificado en esta ficha | MIT segun su model card | HuggingFace | Misma familia de destilacion, mayor capacidad y mayor coste de inferencia |

La comparacion de rendimiento entre estas alternativas no puede establecerse con los datos disponibles: no hay benchmarks publicados para el checkpoint del paso 149 y la busqueda web no ha aportado ninguna evaluacion independiente.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia en el repositorio, lo que impide asumir permisos de uso comercial o de redistribucion. Es un riesgo juridico directo para cualquier integracion en produccion.
- Especializacion extrema: el entrenamiento se limita a 150 pasos sobre prompts de dificultad 0 de un unico entorno. Es esperable una degradacion de las capacidades generales del modelo base y un rendimiento pobre fuera de tareas de expansion de Cantor.
- Riesgo de alucinacion: al ser un modelo de 1,5 B con razonamiento largo, puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en pasos intermedios de conversion entre bases.
- Sobreajuste al formato del entorno: el modelo puede depender de convenciones concretas de los prompts de `CantorExpansion` y fallar ante variaciones de enunciado, idioma o notacion.
- Idiomas y contexto no documentados: se desconoce la ventana de contexto efectiva tras el ajuste y no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Sin evaluacion publicada: no existen benchmarks, cartas de evaluacion ni pruebas de seguridad asociadas, por lo que no se puede cuantificar su calidad ni sus sesgos.
- Trazabilidad limitada: la model card solo identifica el proyecto y el grupo de entrenamiento; no se detalla la composicion del dataset ni el proceso de filtrado, lo que dificulta auditar el origen de los datos.
- Sesgos: no documentados por el autor; los sesgos heredados del modelo base y de los prompts sinteticos del entorno no han sido analizados.
- Uso responsable: al ser un artefacto de investigacion con cero descargas y sin licencia, conviene tratarlo como material de laboratorio y no como componente de un servicio en explotacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-R1Distill-CantorExpansion-step149
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Proyecto de entrenamiento citado en la model card: `david-heineman/rl-data-opd-teachers-r1-distil` (nombre de proyecto, no se ha localizado una URL publica)
- Grupo de entrenamiento citado: `opd-teachers-r1-nofilter16-20260929-231458` (identificador interno, sin URL asociada)
- Busqueda web: no se han encontrado papers, blogs, repositorios ni demos relevantes sobre este modelo; los resultados devueltos por el buscador no guardan ninguna relacion con el modelo y se han descartado.
