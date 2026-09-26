# Rev3auth/iris-e1

## Resumen

iris-e1 es un modelo de lenguaje publicado por el usuario Rev3auth en HuggingFace bajo el identificador `Rev3auth/iris-e1`. Se trata de un ajuste fino (finetune) de un modelo de la familia Llama con 134.515.584 parámetros totales (aproximadamente 135 millones), convertido a formato GGUF mediante la herramienta Unsloth. El repositorio incluye tanto pesos en safetensors como una cuantización GGUF, y declara compatibilidad con llama.cpp y con endpoints de inferencia.

Por su tamaño, el modelo pertenece a la categoria de modelos ultraligeros, pensados para ejecutarse en CPU, dispositivos de borde o GPUs de gama baja con un consumo de memoria minimo. El unico archivo GGUF publicado se denomina `SmolLM2-135M-Instruct.Q4_K_M.gguf`, lo que sugiere que el modelo base del ajuste es SmolLM2-135M-Instruct, aunque el autor no confirma explicitamente esta correspondencia en la model card.

La relevancia de este tipo de publicaciones es practica: sirven como banco de pruebas para pipelines de ajuste fino rapido (Unsloth), para validar flujos de conversion a GGUF y para desplegar asistentes conversacionales de muy bajos requisitos. No obstante, la ficha carece de datos esenciales para evaluacion en produccion: no se declara licencia, idiomas, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (inferido de los tags `llama` y `llama.cpp`); detalles no disponibles |
| Parametros totales | 134.515.584 (segun safetensors) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (archivo GGUF publicado); pesos completos en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de los tags del repositorio (`llama`, `llama.cpp`), que apuntan a un transformer decoder-only con atencion causal, y del recuento de parametros en safetensors (134.515.584). El nombre del fichero GGUF, `SmolLM2-135M-Instruct.Q4_K_M.gguf`, indica que el ajuste se realizo sobre SmolLM2-135M-Instruct, un modelo de 135 millones de parametros; no obstante, el autor no lo declara de forma explicita en la model card, por lo que debe tratarse como una inferencia y no como un dato confirmado.

Respecto al entrenamiento, la unica informacion disponible es que el modelo fue ajustado y convertido a GGUF con Unsloth, herramienta que optimiza el fine-tuning y la exportacion de modelos pequeños. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT adicionales, ni hiperparametros como tasa de aprendizaje, numero de epocas o tecnica de adaptacion (LoRA, QLoRA u otra). Tampoco se documenta ninguna innovacion tecnica propia.

## Capacidades

- Generacion de texto conversacional: los tags incluyen `conversational`, y la model card proporciona ejemplos de uso con `llama-cli` y plantillas Jinja.
- Instrucciones de un solo turno y multi-turno basico, heredadas del ajuste sobre un modelo instruct (segun el nombre del archivo GGUF).
- Ejecucion local mediante llama.cpp, tanto en CPU como en GPU de gama baja.
- Compatibilidad declarada con endpoints de inferencia (tag `endpoints_compatible`).
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de modo de razonamiento explicito (thinking mode).
- No hay evidencia de capacidades de vision ni de audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Clasificacion y etiquetado de texto a gran escala: con 135 millones de parametros, el modelo puede procesar lotes muy grandes en CPU y clasificar tickets, resenas o mensajes por categoria con un coste energetico minimo.
- Enrutamiento de intenciones en pipelines de agentes: usar iris-e1 como clasificador previo que decida que herramienta o submodelo debe responder a cada consulta, reservando modelos grandes para los casos complejos.
- Extraccion ligera de entidades y campos: conversion de texto libre en estructuras JSON simples (nombres, fechas, importes) en flujos de digitalizacion de documentos, asumiendo validacion posterior.
- Asistentes conversacionales en dispositivos de borde: integracion mediante llama.cpp en Raspberry Pi, moviles o navegador (WASM) para respuestas de texto corto sin conexion.
- Pruebas de integracion en CI/CD para pipelines de LLM: utilizar el modelo como sustituto barato en tests automatizados de prompts, plantillas Jinja y flujos de inferencia antes de desplegar modelos mayores.
- Prototipado de flujos de fine-tuning con Unsloth: sirve como caso de referencia para validar el ciclo completo de ajuste, conversion a GGUF y publicacion en HuggingFace con un coste de computo minimo.
- Generacion de borradores y autocompletado en editores: sugerencias de continuacion de frases o resumenes muy breves en herramientas internas, con revision humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 270 MB en precision FP16 y en torno a 80-100 MB con la cuantizacion Q4_K_M publicada (el repositorio completo ocupa 0.1 GB).
- GPU recomendadas: cualquier GPU con mas de 1 GB de memoria es suficiente; una RTX 3060, RTX 4090, A100 o H100 quedan enormemente sobredimensionadas para este modelo.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en iGPUs y en CPU unicamente.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Rev3auth/iris-e1 --jinja`), Ollama, llama-cpp-python, servidores compatibles con la API de endpoints; vLLM y TGI son tecnicamente posibles, pero su sobrecoste de gestion no aporta ventaja con un modelo de este tamano.
- Latencia y throughput: no disponible. No se han publicado mediciones y no se deben extrapolar sin medir en el hardware objetivo.

## Comparativa con modelos similares

Para iris-e1 no se dispone de datos de licencia, contexto ni rendimiento, por lo que la comparacion se limita a los parametros y a lo que cada proyecto declara publicamente. Los datos de los modelos alternativos corresponden a sus fichas oficiales conocidas.

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad |
|---|---|---|---|---|
| iris-e1 | 134,5 M | No disponible | No disponible | safetensors y GGUF (Q4_K_M) |
| SmolLM2-135M-Instruct (posible base) | 135 M | 8.192 tokens (segun su ficha oficial) | Apache 2.0 (segun su ficha oficial) | safetensors y multiples GGUF |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens | Apache 2.0 | safetensors y GGUF |
| TinyLlama-1.1B-Chat | ~1,1 B | 2.048 tokens | Apache 2.0 | safetensors y GGUF |

No se dispone de resultados de benchmarks de iris-e1 que permitan comparar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no es posible determinar si el uso comercial esta permitido; en un entorno de produccion esto supone un riesgo legal directo.
- Ausencia de datos de entrenamiento: se desconoce el dataset, el numero de tokens y si hubo fases de alineacion, lo que impide evaluar sesgos y comportamientos indeseados.
- Riesgo elevado de alucinacion: con unos 135 millones de parametros, la capacidad de mantener coherencia factual y de seguir instrucciones complejas es muy limitada en comparacion con modelos de mayor tamano.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni el manejo correcto de prompts extensos.
- Idiomas no declarados: no hay confirmacion de soporte multilingue; es probable un rendimiento muy inferior en castellano frente al ingles si el modelo base es predominantemente angloparlante.
- Ausencia de benchmarks: no existe evidencia publica de calidad, por lo que cualquier evaluacion debe realizarse con un conjunto de pruebas propio.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y no hay pipeline declarado ni documentacion adicional, lo que reduce la confianza en su reproducibilidad.
- No apto para tareas criticas sin supervisacion: no deberia utilizarse en decisiones medicas, legales o financieras sin revision humana y sin un modelo de respaldo.
- Incompatibilidad potencial de plantilla de chat: la model card recomienda el flag `--jinja`, lo que implica que la plantilla de chat embebida es necesaria para obtener respuestas correctas; su omision puede degradar gravemente la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rev3auth/iris-e1
- Unsloth (herramienta de ajuste y conversion declarada): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado en la model card): https://github.com/ggml-org/llama.cpp
- SmolLM2-135M-Instruct (posible modelo base, segun el nombre del archivo GGUF): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
