# mradermacher/Nanbeige4.3-33B-i1-GGUF

## Resumen

Nanbeige4.3-33B-i1-GGUF es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo Nanbeige/Nanbeige4.3-33B, un modelo de lenguaje de 33.118.977.024 parametros (33,1 B) publicado por el equipo Nanbeige. El repositorio no contiene pesos originales, sino 23 variantes cuantizadas con la tecnica i1 (cuantizacion con matriz de importancia, imatrix) que van desde los 7,8 GB de la variante IQ1_S hasta los 27,3 GB de la Q6_K, ademas del fichero imatrix de 0,1 GB para generar cuantizaciones propias.

El problema que resuelve es de despliegue: un modelo de 33 B en precision completa ocupa del orden de 66 GB solo en pesos, lo que exige hardware de centro de datos. Estas cuantizaciones permiten ejecutar el mismo modelo en una unica GPU de consumo con perdida de calidad controlada, o incluso en configuraciones hibridas CPU+GPU con las variantes de 2 bits. La licencia declarada es Apache 2.0 y los idiomas soportados son ingles y chino.

Es relevante ahora por dos motivos: la etiqueta `endpoints_compatible` facilita integrarlo tras una API compatible con OpenAI mediante llama-server, y la disponibilidad de variantes desde 1 hasta 6 bits sobre el mismo modelo permite medir empiricamente la degradacion por bit. Conviene senalar que el repositorio no incluye resultados de benchmarks ni detalles de arquitectura del modelo base, por lo que su evaluacion queda supeditada a la model card original de Nanbeige.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada; corresponde al modelo base Nanbeige4.3-33B) |
| Parametros totales | 33.118.977.024 (33,1 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variantes i1 con imatrix); safetensors en el modelo base |
| Cuantizador | mradermacher (cuantizacion de terceros, no oficial) |
| Modelo base | Nanbeige/Nanbeige4.3-33B |
| Tamano del repositorio | 358,9 GB (incluye todas las variantes) |
| Fichero imatrix | Nanbeige4.3-33B.imatrix.gguf (0,1 GB) |
| Etiquetas relevantes | llm, nanbeige, conversational, imatrix, endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, dimension oculta o cabezas de atencion. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El unico dato estructural verificable es el recuento de parametros del modelo base en safetensors: 33.118.977.024.

Lo que si documenta el repositorio es el proceso de cuantizacion. mradermacher emplea cuantizacion ponderada con matriz de importancia (imatrix) sobre el modelo convertido a formato HF (`convert_type: hf`, `output_tensor_quantised: 1`, `quantize_version: 2`), lo que en la practica mejora la relacion calidad/tamano frente a las cuantizaciones estaticas equivalentes. El autor mantiene ademas un repositorio hermano con cuantizaciones estaticas (no imatrix) del mismo modelo, lo que permite comparar ambas familias. No se han documentado innovaciones de inferencia (decodificacion especulativa, atencion lineal, modos de razonamiento) en la informacion proporcionada.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno: la model card etiqueta explicitamente el modelo como `conversational` y `llm`.
- Cobertura linguistica limitada a ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- Despliegue como servicio con API compatible con OpenAI: la etiqueta `endpoints_compatible` sugiere compatibilidad con el servidor de llama.cpp (`llama-server`).
- Ejecucion local en hardware de consumo gracias al abanico de cuantizaciones de 1 a 6 bits.
- Generacion de cuantizaciones propias a partir del fichero imatrix incluido.
- Capacidades de codigo, matematicas, razonamiento multi-paso, tool calling, agentes, vision o audio: no documentadas en la informacion disponible.

## Casos de uso

- Asistente conversacional bilingue en/zh on-premise: desplegando la variante i1-Q4_K_M (20,2 GB) con `llama-server` en una RTX 4090 se obtiene un endpoint compatible con OpenAI sin salida de datos a la nube, adecuado para entornos con requisitos de soberania del dato.
- Atencion a usuarios de habla china en productos SaaS: el modelo cubre zh de forma nativa declarada, con la variante i1-IQ4_XS (18,1 GB) como compromiso entre calidad y VRAM para servir conversaciones multi-turno.
- Procesamiento de documentacion tecnica en chino en estaciones de trabajo: extraccion, resumen y reescritura de textos largos con la variante i1-Q5_K_M (23,6 GB) en una GPU de 24-48 GB, sin depender de APIs externas con coste por token.
- Evaluacion de la degradacion por cuantizacion: el repositorio ofrece 23 variantes i1 del mismo modelo (de 7,8 GB a 27,3 GB) y un repositorio hermano con cuantizaciones estaticas, lo que permite construir una curva de perplejidad y calidad frente a bits por peso con un unico modelo de referencia.
- Generacion de codigo asistida en IDE local: la variante i1-Q4_K_S (19,2 GB) cabe en 24 GB de VRAM y permite integrar el modelo en un plugin de autocompletado o chat de codigo sin latencia de red (la calidad en codigo no esta verificada con benchmarks).
- Sustitucion de APIs de pago en pipelines de CI/CD: tareas de clasificacion, resumen y normalizacion de texto en lotes usando la variante i1-IQ3_M (15,3 GB) sobre GPU de 16 GB, con licencia Apache 2.0 que facilita el uso comercial.
- Despliegue hibrido CPU+GPU en equipos sin GPU de gama alta: con i1-IQ2_M (11,8 GB) y offload parcial de capas a CPU se puede mantener un servicio de baja concurrencia en un servidor con 16 GB de RAM y una GPU de 8-12 GB, asumiendo perdida de calidad.
- Investigacion sobre cuantizacion con imatrix: comparar las variantes i1 frente a las estaticas equivalentes para medir la ganancia real de la matriz de importancia en un modelo de 33 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la model card se limita a la tabla de ficheros cuantizados. Tampoco se ofrecen datos de throughput ni de latencia medidos.

## Requisitos de hardware

- Pesos en precision completa (safetensors, BF16): aproximadamente 66 GB solo para pesos; requiere 2x A100 40 GB, 1x H100 80 GB o 1x A100 80 GB.
- i1-Q6_K (27,3 GB): A100 40 GB, L40S 48 GB o 2x RTX 4090; con contexto largo hay que sumar la cache KV, de tamano no determinable al desconocerse la longitud de contexto.
- i1-Q5_K_M (23,6 GB): RTX 4090 / RTX 3090 de 24 GB con contexto corto y margen ajustado; mas comodo en GPUs de 48 GB.
- i1-Q4_K_M (20,2 GB) e i1-Q4_K_S (19,2 GB): opcion recomendada por el autor para 24 GB de VRAM (RTX 3090, RTX 4090, A10G 24 GB); en GPUs de 16 GB exige offload parcial a CPU.
- i1-IQ3_M (15,3 GB) e i1-Q3_K_M (16,4 GB): aptas para 16 GB (RTX 4060 Ti 16 GB, RTX 4080, A4000 16 GB) con contexto moderado.
- i1-IQ2_M (11,8 GB) e i1-IQ2_S (10,9 GB): caben en 12 GB (RTX 3060 12 GB, RTX 4070) con calidad degradada.
- i1-IQ1_S (7,8 GB) e i1-IQ1_M (8,4 GB): 8 GB de VRAM; el propio autor las describe como "for the desperate" (para salir del paso), no aptas para produccion.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI), Ollama importando el GGUF mediante Modelfile, LM Studio, llama-cpp-python, text-generation-webui y KoboldCpp. vLLM ofrece soporte experimental de GGUF; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible. Como referencia cualitativa, el autor marca i1-Q4_0 como "fast, low quality" y i1-Q4_K_M como "fast, recommended", sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | GGUF disponible | Benchmarks publicados en la informacion disponible |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (i1-GGUF) | 33,1 B | no disponible | Apache 2.0 | Si (23 variantes i1 + estaticas en repo hermano) | No |
| Qwen2.5-32B-Instruct | 32,8 B | 32.768 tokens nativo, ampliable | Apache 2.0 | Si | No consultados en esta ficha |
| Gemma 2 27B | 27 B | 8.192 tokens | Terminos de uso de Gemma | Si | No consultados en esta ficha |
| Yi-34B | 34 B | 4.096 tokens nativo (variante 200K aparte) | Apache 2.0 | Si | No consultados en esta ficha |

La comparacion anterior es puramente estructural (tamano, contexto, licencia y disponibilidad de cuantizaciones). No es posible comparar rendimiento porque no hay benchmarks publicados de Nanbeige4.3-33B en la informacion disponible; los datos de contexto y licencia de los modelos alternativos provienen de sus especificaciones publicas y deben verificarse en sus repositorios antes de tomar una decision.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en razonamiento, codigo o matematicas, ni en el repositorio de cuantizacion ni en la informacion proporcionada.
- Cobertura linguistica restringida a ingles y chino: no se declara soporte de castellano, por lo que el rendimiento en espanol es impredecible y probablemente inferior.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones publicadas no se puede estimar la tasa de fabricacion de hechos.
- Contexto desconocido: planificar cargas de contexto largo sin verificar la model card del modelo base puede provocar errores o degradacion silenciosa.
- Degradacion severa en las variantes de 1-2 bits: el propio autor desaconseja IQ1 para uso real; incluso IQ2 supone una perdida de calidad notable frente a Q4_K_M.
- Cuantizacion de terceros: mradermacher no es el autor del modelo; puede haber diferencias de comportamiento respecto a los pesos originales en safetensors.
- Repositorio de 358,9 GB: es imprescindible descargar unicamente el fichero GGUF concreto y no clonar el repositorio completo.
- Validacion comunitaria practicamente nula: 0 descargas y 1 like en el momento de la consulta, con fecha de creacion 2026-10-26.
- Licencia Apache 2.0 declarada por el cuantizador y heredada del modelo base: conviene confirmarla en el repositorio original de Nanbeige y cumplir las obligaciones de atribucion y aviso de cambios que impone la licencia.
- Sin documentacion de tool calling, function calling ni soporte de agentes: no asumir estas capacidades en produccion sin pruebas previas.
- No se especifica si el modelo base tiene restricciones adicionales de uso aceptable mas alla de Apache 2.0.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Nanbeige4.3-33B-i1-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Nanbeige4.3-33B-GGUF
- Pagina de descarga y vision general del cuantizador: https://hf.tst.eu/model#Nanbeige4.3-33B-i1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
