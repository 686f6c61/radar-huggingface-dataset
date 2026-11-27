# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-GGUF es una distribucion de cuantizaciones GGUF estaticas del modelo symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized, publicada por mradermacher. No se trata de un modelo entrenado desde cero, sino de un trabajo de conversion y cuantizacion sobre un modelo base que, por su nombre, deriva de la familia Qwen3.6 con arquitectura de mezcla de expertos (el sufijo A3B indica aproximadamente 3 mil millones de parametros activos sobre un total de 35,5 mil millones). El resultado es un conjunto de ficheros GGUF listos para inferencia local con llama.cpp y ecosistemas compatibles.

El modelo base incorpora los sufijos "Uncensored" y "Hermes-V11", lo que sugiere un ajuste fino orientado a conversacion con reduccion de rechazos de contenido, en la linea de los fine-tunes tipo Hermes. La model card del repositorio no documenta el proceso de entrenamiento, los datos utilizados ni los resultados de evaluacion; se limita a describir los ficheros de cuantizacion disponibles, sus tamanos y una guia de uso generica para GGUF.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de 35,5 mil millones de parametros con activacion dispersa en hardware de consumo gracias a las cuantizaciones de 13 a 38 GB; por otro, el repositorio incluye ficheros mmproj, lo que indica soporte multimodal (vision) en el modelo base. La licencia no esta declarada en la informacion disponible, lo que constituye un obstaculo serio para cualquier uso comercial sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida del nombre del modelo; no documentada en la model card |
| Parametros totales | 35.505.251.456 (35,5 mil millones) |
| Parametros activos | aproximadamente 3 mil millones (inferido del sufijo A3B); no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | ingles declarado en la model card (campo `language: en`); el resto no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en formato transformers |
| Tamano del repositorio | 244,4 GB |
| Cuantizaciones ponderadas (imatrix) | disponibles en repositorio separado: mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-i1-GGUF |
| Compatibilidad de endpoints | etiqueta `endpoints_compatible` en Hugging Face |
| Descargas y likes | 204 descargas, 0 likes (en el momento de la consulta) |

## Arquitectura y entrenamiento

La model card de esta distribucion no aporta informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion del modelo base. Lo unico verificable es el numero de parametros del safetensors (35.505.251.456) y la presencia de un componente multimodal separado (mmproj), habitual en modelos que combinan un codificador visual con el decoder de lenguaje. El nombre del modelo base apunta a una arquitectura MoE con unos 3 mil millones de parametros activos, lo que explicaria la viabilidad de las cuantizaciones de 20 GB en adelante para un modelo de 35,5 mil millones.

El trabajo tecnico de este repositorio es la cuantizacion. mradermacher genera cuantizaciones estaticas (no ponderadas por matriz de importancia) a partir del modelo en formato transformers, con el pipeline habitual de llama.cpp: conversion a GGUF en f16 y posterior cuantizacion a los tipos K e IQ listados. La model card indica que las cuantizaciones ponderadas por imatrix, que suelen ofrecer mejor calidad por bit, se publican en un repositorio aparte. No se documenta ninguna innovacion de entrenamiento (RLHF, DPO, decodificacion especulativa) porque el autor de esta distribucion no entrena el modelo.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imagenes en el modelo base, aunque la model card no detalla el alcance.
- Razonamiento y generacion de codigo: capacidad esperable en la familia Qwen, pero no verificada con datos en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la documentacion proporcionada.
- Comportamiento "uncensored": el ajuste fino del modelo base esta orientado a reducir rechazos, lo que amplia el rango de respuestas pero incrementa el riesgo de contenido danino.
- Idiomas: ingles declarado explicitamente; el resto de idiomas no esta documentado.

## Casos de uso

- Despliegue local de un modelo de gran tamano en estaciones de trabajo: con la cuantizacion Q4_K_M (21,8 GB) el modelo cabe en una GPU de 24 GB o en una configuracion de dos GPU de 12 GB, permitiendo experimentar con un MoE de 35,5 mil millones sin infraestructura de datacenter.
- Prototipado de asistentes conversacionales sin filtros editoriales agresivos: el ajuste "Uncensored" resulta util en investigacion sobre seguridad de modelos, red teaming y estudio de comportamientos de rechazo, siempre en entornos controlados.
- Analisis de documentos con imagenes: los ficheros mmproj permiten alimentar capturas, diagramas o paginas escaneadas junto con texto, util para extraccion de informacion en pipelines internos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once tipos de cuantizacion mas dos variantes mmproj, lo que facilita estudios de degradacion de calidad frente a tamano en un mismo modelo.
- Generacion de codigo en local para entornos con requisitos de privacidad: al ejecutarse con llama.cpp sobre hardware propio, los datos no salen de la maquina, lo que encaja en desarrollos con codigo propietario.
- Fine-tuning posterior o destilacion: al estar disponible el modelo base en transformers, se puede usar como punto de partida para ajustes especificos de dominio antes de recuantizar.
- Experimentacion con arquitecturas MoE en docencia: la relacion entre parametros totales y activos hace de este modelo un caso practico para explicar el coste computacional de la inferencia dispersa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 13,3 GB (Q2_K) y 37,9 GB (Q8_0), segun el fichero elegido. La opcion recomendada por el autor para velocidad es Q4_K_S (20,5 GB) o Q4_K_M (21,8 GB).
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) ejecuta Q4_K_M con comodidad; una A100 de 40 GB o H100 de 80 GB permite Q8_0 y contextos largos con margen. Para Q6_K y Q8_0 en consumer, se requiere repartir capas entre dos GPU.
- Viabilidad en GPU de consumo: si, en tarjetas de 16 GB con Q3_K_M (17,3 GB, con offload parcial a RAM) y en tarjetas de 24 GB con Q4_K_M o Q5_K_S. En 12 GB solo caben Q2_K y Q3_K_S con offload parcial.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3 mil millones de parametros activos, el throughput por token deberia ser notablemente superior al de un modelo denso de 35 mil millones, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11 (esta ficha) | 35,5 B | aprox. 3 B | no disponible | no disponible | GGUF, transformers | Fine-tune sin censura, multimodal |
| Qwen3-30B-A3B | 30,5 B | aprox. 3,3 B | 262.144 tokens (segun documentacion de la familia Qwen3) | Apache 2.0 (familia Qwen3) | safetensors, GGUF | Referencia oficial de Alibaba; datos de la familia, no de este repositorio |
| Mixtral 8x7B | 46,7 B | aprox. 12,9 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | MoE clasico; mayor coste por token al tener mas parametros activos |

La comparacion con Qwen3-30B-A3B se basa en las caracteristicas publicas de la familia Qwen3 y no en la model card de este repositorio; debe tomarse como referencia orientativa, no como equivalencia verificada. No se dispone de datos de benchmarks de este fine-tune para comparar rendimiento real.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor del modelo base (symrex) o consultar el repositorio original antes de cualquier despliegue en produccion.
- Modelo "uncensored": el ajuste fino reduce deliberadamente los rechazos, por lo que puede generar contenido ofensivo, ilegal o peligroso. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Procedencia opaca: la model card no documenta datos de entrenamiento, proceso de alineacion ni evaluaciones, lo que impide auditar sesgos o calidad.
- Riesgo de alucinacion: sin benchmarks publicados ni evaluaciones de fidelidad, no hay evidencia sobre la tasa de alucinacion en tareas factuales.
- Cobertura idiomatica limitada: solo el ingles esta declarado; el rendimiento en castellano es desconocido y probablemente inferior.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la perplejidad; para uso serio se recomienda Q4_K_M o superior, o bien las variantes imatrix del repositorio i1.
- Repositorio de gran tamano (244,4 GB): la descarga completa no es practica; conviene bajar solo el fichero de cuantizacion necesario y, si se usa vision, el mmproj correspondiente.
- Fecha de creacion futura en los metadatos (2026): conviene verificar la integridad y procedencia de los ficheros antes de usarlos en entornos sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-GGUF
- Modelo base: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
