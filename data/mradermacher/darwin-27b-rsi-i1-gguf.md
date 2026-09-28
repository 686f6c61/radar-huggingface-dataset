# mradermacher/Darwin-27B-RSI-i1-GGUF

## Resumen

Darwin-27B-RSI-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher a partir del modelo base FINAL-Bench/Darwin-27B-RSI. Se trata, por tanto, de una redistribucion optimizada para inferencia local, no de un modelo entrenado desde cero: el autor aplica su pipeline habitual de conversion (metadatos `convert_type: hf` y `quantize_version: 2`) y cuantizacion ponderada con matriz de importancia (imatrix) sobre los pesos originales en formato HuggingFace.

El modelo base tiene 26.895.998.464 parametros (aproximadamente 26,9 mil millones), coherente con la denominacion comercial "27B". El repositorio ocupa 38,9 GB e incluye una familia de cuantizaciones que abarca desde IQ1_S (aproximadamente 1,56 bits por peso) hasta Q6_K (aproximadamente 6,56 bits por peso), lo que permite desplegar el modelo desde equipos con poca VRAM hasta servidores con GPU de 24 GB o mas.

La relevancia de esta publicacion es practica: los tags `gguf`, `imatrix`, `conversational` y `endpoints_compatible` indican que el artefacto esta pensado para ejecutarse con llama.cpp y derivados (Ollama, LM Studio, koboldcpp) y para servirse mediante endpoints compatibles con la API de HuggingFace. No se dispone de informacion sobre licencia, idiomas, contexto, arquitectura del modelo base ni resultados de evaluacion en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 B) |
| Parametros activos | no disponible (no hay indicios de que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el metadato `convert_type: hf` indica conversion desde pesos en formato HuggingFace |
| Tipo de cuantizacion | ponderada con matriz de importancia (imatrix / weighted quants) |
| Tamano del repositorio | 38,9 GB |
| Fecha de creacion (metadatos) | 2026-09-28 |
| Ultima actualizacion (metadatos) | 2026-09-28 |

## Arquitectura y entrenamiento

No se ha proporcionado informacion sobre la arquitectura del modelo base (transformer denso, MoE, hibrido u otra), el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste por preferencias (RLHF, DPO) o instrucciones. Tampoco se detalla la longitud de contexto nativa. Todo lo relativo al entrenamiento del modelo original debe consultarse en la model card de FINAL-Bench/Darwin-27B-RSI, que no forma parte de la informacion disponible aqui.

Lo que si puede afirmarse es el proceso de cuantizacion. Los metadatos de la model card (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, `tags: nicoboss`) corresponden al pipeline de mradermacher: conversion de los tensores originales a GGUF y posterior generacion de multiples niveles de cuantizacion. El uso de imatrix implica que las cuantizaciones de baja precision (familias IQ1, IQ2 e IQ3) se han calibrado con un dataset de calibracion para minimizar la perdida de perplejidad respecto a los pesos originales, algo que suele mejorar de forma notable el comportamiento frente a cuantizaciones uniformes del mismo tamano. Aun asi, no se especifica que dataset de calibracion se ha utilizado.

## Capacidades

- Generacion de texto y conversacion: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno, si bien no se detalla el formato de prompt ni la plantilla de chat soportada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el artefacto puede desplegarse mediante endpoints compatibles con la API de HuggingFace.
- Inferencia local mediante llama.cpp: al distribuirse en GGUF, es ejecutable en CPU, GPU o configuraciones hibridas con offload parcial de capas.
- Razonamiento, generacion de codigo, matematicas, vision, audio: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ninguna lista de idiomas).
- Modo de pensamiento (thinking mode) u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en GPU de consumo: con cuantizaciones IQ4_XS o Q4_K_M (aproximadamente 14-17 GB de pesos) el modelo puede ejecutarse integramente en GPU de 16 a 24 GB como la RTX 4080, RTX 4090 o RTX 3090, sin depender de servicios en la nube ni enviar datos fuera de la maquina.
- Despliegue con CPU y RAM abundante: las cuantizaciones IQ1_S, IQ2_XXS o Q2_K (aproximadamente 5-9 GB de pesos) permiten ejecutar el modelo con llama.cpp en equipos sin GPU dedicada, asumiendo una degradacion de calidad notable frente a Q4_K_M o Q6_K.
- Servidor de chat interno para una organizacion: mediante `llama-server` u Ollama se puede exponer una API compatible con OpenAI y conectar herramientas internas, manteniendo el contenido de las conversaciones dentro de la infraestructura propia.
- Seleccion de cuantizacion segun presupuesto de memoria: el repositorio cubre un rango continuo de compresion (de IQ1_S a Q6_K), lo que permite hacer un analisis de compromiso entre VRAM disponible y calidad midiendo perplejidad sobre un conjunto de validacion propio.
- Evaluacion de degradacion por cuantizacion: comparar Q4_K_M, Q5_K_M y Q6_K del mismo modelo sobre una bateria de tareas (por ejemplo, preguntas de dominio y generacion de codigo) permite cuantificar cuanto se pierde al bajar de precision en este modelo concreto.
- Integracion en pipelines con endpoints compatibles: el tag `endpoints_compatible` permite desplegar el modelo en un endpoint gestionado y consumirlo desde aplicaciones tipo chatbot o asistentes internos sin modificar el codigo cliente.
- Reproduccion de experimentos de investigacion: al ser una cuantizacion reproducible de un modelo base publico, sirve como artefacto ligero para experimentar con tecnicas de prompting, RAG o evaluacion sin necesidad de descargar pesos completos en precision alta.
- Prototipado rapido en estaciones de trabajo con LM Studio o koboldcpp: permite validar una idea de producto (chat de soporte, asistente documental) antes de comprometerse a un despliegue en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni mediciones de perplejidad por nivel de cuantizacion, y no se ha facilitado el rendimiento del modelo base FINAL-Bench/Darwin-27B-RSI.

## Requisitos de hardware

Estimacion de tamano de pesos a partir del numero de parametros declarado (26,9 B) y de los bits por peso tipicos de cada familia de cuantizacion de llama.cpp. Son calculos orientativos, no mediciones del repositorio:

| Cuantizacion | Bits/peso aprox. | Peso aprox. (GB) | VRAM recomendada con contexto (GB) |
|---|---|---|---|
| IQ1_S | 1,56 | 5,3 | 7-8 |
| IQ1_M | 1,75 | 5,9 | 8 |
| IQ2_XXS | 2,06 | 6,9 | 9 |
| IQ2_XS | 2,31 | 7,8 | 10 |
| Q2_K_S | 2,60 | 8,7 | 11 |
| Q2_K | 2,63 | 8,8 | 11 |
| IQ2_S | 2,50 | 8,4 | 10-11 |
| IQ2_M | 2,70 | 9,1 | 11-12 |
| IQ3_XXS | 3,06 | 10,3 | 12-13 |
| IQ3_XS | 3,30 | 11,1 | 13 |
| IQ3_S | 3,44 | 11,6 | 13-14 |
| Q3_K_S | 3,50 | 11,8 | 14 |
| IQ3_M | 3,66 | 12,3 | 14-15 |
| Q3_K_M | 3,90 | 13,1 | 15-16 |
| Q3_K_L | 4,27 | 14,4 | 16-17 |
| IQ4_XS | 4,25 | 14,3 | 16-17 |
| Q4_0 | 4,55 | 15,3 | 17-18 |
| Q4_K_S | 4,58 | 15,4 | 17-18 |
| small-IQ4_NL | 4,50 | 15,1 | 17-18 |
| Q4_K_M | 4,85 | 16,3 | 18-19 |
| Q4_1 | 5,00 | 16,8 | 19 |
| Q5_K_S | 5,52 | 18,6 | 20-21 |
| Q5_K_M | 5,67 | 19,1 | 21-22 |
| Q6_K | 6,56 | 22,1 | 24-25 |

- Cabe en GPU de consumo: si. Con 8 GB (RTX 3060 Ti, RTX 4060) entran las cuantizaciones IQ1 e IQ2; con 12 GB (RTX 3060 12 GB, RTX 4070) entran hasta IQ3_M o Q3_K_M; con 16 GB (RTX 4060 Ti 16 GB, RTX 4080) entran IQ4_XS, Q4_K_S y Q4_K_M; con 24 GB (RTX 3090, RTX 4090) entran Q5_K_M y Q6_K.
- GPU de centro de datos: A100 40 GB y H100 80 GB permiten ejecutar sin problemas las cuantizaciones altas (Q6_K) con contextos largos, o varias instancias del modelo en paralelo con cuantizaciones bajas.
- CPU + RAM: todas las cuantizaciones son ejecutables con llama.cpp en CPU; se recomienda un minimo de RAM igual al tamano de los pesos mas 4-8 GB para el contexto y el sistema.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, llamafile, Jan y text-generation-webui. El soporte de GGUF en vLLM es experimental y limitado, por lo que no se recomienda como via principal; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible. Dependen del hardware, del grado de offload CPU/GPU y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas de la misma categoria. La unica comparacion posible con la informacion disponible es entre el modelo original y esta redistribucion cuantizada:

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FINAL-Bench/Darwin-27B-RSI | no disponible (presumiblemente 26,9 B en precision original) | safetensors (formato HuggingFace) | no aplica | no disponible | repositorio del modelo base |
| mradermacher/Darwin-27B-RSI-i1-GGUF | 26.895.998.464 | GGUF | 24 niveles, de IQ1_S a Q6_K | no disponible | repositorio con 0 descargas y 0 likes en el momento de la consulta |

Comparacion con otras familias de modelos de tamano similar (por ejemplo, modelos de 24-32 B de parametros de otros laboratorios): no disponible, al no existir datos de rendimiento de este modelo que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada no puede asumirse permiso de uso comercial. Es imprescindible verificar la licencia del modelo base (FINAL-Bench/Darwin-27B-RSI) antes de cualquier despliegue en produccion.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad sobre la calidad del artefacto ni sobre la fidelidad de la conversion.
- Sin datos de evaluacion: no hay benchmarks, mediciones de perplejidad ni comparaciones con el modelo original que permitan estimar la perdida de calidad introducida por la cuantizacion.
- Degradacion en cuantizaciones extremas: las familias IQ1 e IQ2 (por debajo de 3 bits por peso) suelen producir degradaciones apreciables en coherencia, razonamiento y adherencia a instrucciones, incluso con imatrix. No se recomienda su uso en tareas que requieran precision.
- Dependencia del dataset de calibracion: la calidad de las cuantizaciones imatrix depende del conjunto de calibracion empleado, que no se especifica en la informacion disponible.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que no puede garantizarse un comportamiento correcto en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto: desconocida. Debe configurarse manualmente en llama.cpp y verificarse empiricamente, ya que un valor excesivo puede degradar la calidad o provocar errores.
- Riesgo de alucionacion: inherente a cualquier modelo de lenguaje; no hay informacion especifica sobre la tasa de alucinacion de este modelo.
- Sesgos: no disponible. No se ha publicado informacion sobre sesgos evaluados ni sobre la composicion del dataset de entrenamiento del modelo base.
- Inconsistencia en los metadatos: el repositorio esta fechado el 2026-09-28 y el tamano declarado (38,9 GB) es inferior a la suma de los tamanos estimados de las 24 cuantizaciones listadas, lo que sugiere que solo una parte de ellas esta realmente subida o que la cifra de tamano no esta actualizada. Conviene comprobar los archivos disponibles antes de planificar una descarga.
- Ambito de uso: al ser un artefacto GGUF, esta pensado exclusivamente para inferencia. No es adecuado para reentrenamiento, ajuste fino con LoRA ni fusion de pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Darwin-27B-RSI-i1-GGUF
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Runtime de referencia para GGUF (llama.cpp): https://github.com/ggml-org/llama.cpp
