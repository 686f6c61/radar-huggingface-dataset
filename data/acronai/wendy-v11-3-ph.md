# AcronAI/wendy-v11.3-ph

## Resumen

AcronAI/wendy-v11.3-ph es un ajuste fino (fine-tuning) multimodal publicado por AcronAI sobre el modelo base unsloth/qwen3-vl-8b-instruct-unsloth-bnb-4bit, a su vez derivado de Qwen3-VL-8B-Instruct. El modelo procesa entradas de imagen y texto y genera texto (pipeline image-text-to-text), con 8.767.123.696 parametros totales confirmados en los pesos safetensors, lo que lo situa en la categoria de 8-9 mil millones de parametros. La licencia declarada es Apache 2.0 y el unico idioma declarado es el ingles.

El modelo es relevante como ejemplo del flujo de trabajo de ajuste fino acelerado con Unsloth y TRL sobre una base cuantizada a 4 bits, que despues se exporta a pesos de mayor precision. Su interes practico radica en que hereda las capacidades vision-language de la familia Qwen3-VL y anade una personalizacion concreta no documentada por el autor. No obstante, la model card es extremadamente escueta: no describe el dataset de entrenamiento, el metodo de ajuste, los hiperparametros ni resultados de evaluacion.

Se trata de un repositorio con cero descargas y cero likes en el momento de la consulta, sin documentacion adicional en la busqueda web. Cualquier evaluacion de su calidad real exige una validacion empirica por parte del usuario, ya que el autor no aporta evidencia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (variante Qwen3-VL); no se detalla la configuracion interna |
| Parametros totales | 8.767.123.696 (8,77 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El modelo base de partida esta cuantizado a 4 bits con bitsandbytes (bnb-4bit). Los pesos publicados en el repositorio (17,5 GB) corresponden a precision de 16 bits. No se declaran otras variantes |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo vision-language que hereda la arquitectura de Qwen3-VL en su variante de 8 mil millones de parametros. Procesa simultaneamente imagenes y texto como entrada y produce texto como salida, segun el pipeline declarado (image-text-to-text). El ajuste fino se realizo partiendo de unsloth/qwen3-vl-8b-instruct-unsloth-bnb-4bit, una version del modelo instruct cuantizada a 4 bits, sobre la que se aplicaron tecnicas de entrenamiento acelerado.

Segun la model card, el entrenamiento se llevo a cabo con la libreria Unsloth y TRL de Hugging Face, con una mejora declarada de "2x mas rapido" respecto a un entrenamiento convencional. El autor no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales ni el proposito concreto del ajuste, mas alla de tratarse de un modelo conversacional. El repositorio no incluye informacion sobre el proceso de mezcla de datos ni sobre posibles tareas especializadas.

## Capacidades

- Generacion de texto conversacional, con soporte multi-turno segun la etiqueta "conversational".
- Comprension de imagenes (vision-language): acepta entradas de imagen y texto combinadas y responde en lenguaje natural.
- Generacion de texto condicionada por imagenes (descripcion, respuesta a preguntas visuales, entre otras), siempre dentro de lo que permita la base Qwen3-VL.
- Compatibilidad con text-generation-inference (TGI) y transformers, segun las etiquetas del repositorio.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la declaracion del autor.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion automatica de imagenes: el modelo puede generar descripciones textuales de fotografias, capturas o diagramas, aprovechando su naturaleza image-text-to-text para tareas de alt-text y catalogacion.
- Respuesta a preguntas visuales (VQA): util para asistentes que deben interpretar una imagen aportada por el usuario y responder preguntas concretas sobre su contenido.
- Extraccion de informacion de documentos escaneados: el modelo puede leer capturas de facturas, formularios o tickets y devolver los campos relevantes en texto estructurado.
- Prototipado rapido de asistentes conversacionales multimodales: al ser un modelo de 8B con licencia Apache 2.0, sirve como base para experimentar en entornos de investigacion sin coste de licencia.
- Moderacion de contenido visual asistida: combinado con una capa de reglas, puede clasificar o describir imagenes subidas por usuarios para revision humana posterior.
- Ajuste fino adicional sobre dominio propio: dado que el autor publica el proceso con Unsloth, sirve como referencia para replicar la cadena de ajuste sobre Qwen3-VL con recursos limitados.
- Evaluacion comparativa de tecnicas de fine-tuning: util en investigacion para estudiar el efecto de ajustar desde una base cuantizada a 4 bits y exportar despues a 16 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna evaluacion multimodal (como MMMU o DocVQA), y la busqueda web no aporto ningun resultado relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: en torno a 18-22 GB solo para los pesos, mas el espacio para el cache KV y el procesador visual, por lo que se recomienda un minimo de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-7 GB para los pesos, con margen adicional para contexto y vision.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para precision completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para 16 bits con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o RTX 4080 con cuantizacion de 4 bits; en 16 bits requiere tarjetas de 24 GB o mas.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM y llama.cpp/Ollama previa conversion a GGUF. Las etiquetas del repositorio confirman compatibilidad con transformers y TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AcronAI/wendy-v11.3-ph | 8,77 mil millones | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino multimodal sobre Qwen3-VL-8B |
| unsloth/qwen3-vl-8b-instruct-unsloth-bnb-4bit | 8 mil millones (aprox.) | no disponible | Apache 2.0 | Hugging Face | Modelo base de partida, cuantizado a 4 bits |
| Qwen3-VL-8B-Instruct | 8 mil millones (aprox.) | no disponible | Apache 2.0 | Hugging Face | Modelo instruct original de la familia Qwen3-VL |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3-VL hereda los sesgos del modelo base, no evaluados en esta ficha.
- Riesgo de alucinacion: no cuantificado; al no existir evaluaciones publicadas, no puede descartarse un incremento de la tasa de alucinacion respecto al modelo base tras el ajuste fino.
- Limitaciones de contexto e idioma: el unico idioma declarado es el ingles, lo que limita su uso en castellano u otros idiomas sin una validacion previa. La longitud de contexto no esta especificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de ajuste, que el autor no detalla.
- Caveat de produccion: el repositorio presenta 0 descargas y 0 likes, sin documentacion de dataset ni de evaluacion; no es aconsejable desplegarlo en produccion sin una validacion exhaustiva propia.
- Precision de pesos: aunque el entrenamiento partio de una base a 4 bits, los pesos publicados parecen estar en 16 bits, lo que implica mayor consumo de VRAM que el modelo base.
- Ausencia de informacion sobre tool calling, agentes y modo de razonamiento, por lo que no deben asumirse estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AcronAI/wendy-v11.3-ph
- Modelo base: https://huggingface.co/unsloth/qwen3-vl-8b-instruct-unsloth-bnb-4bit
- Unsloth (repositorio de la libreria de entrenamiento): https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a paginas ajenas al ambito de modelos de IA (WhatsApp).
