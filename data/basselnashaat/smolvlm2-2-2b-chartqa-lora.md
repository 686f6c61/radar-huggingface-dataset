# BasselNashaat/SmolVLM2-2.2B-chartqa-lora

## Resumen

SmolVLM2-2.2B-chartqa-lora es un adaptador LoRA publicado en HuggingFace por el usuario BasselNashaat sobre el modelo base SmolVLM2-2.2B de HuggingFace. Por el nombre del repositorio se deduce que se trata de un ajuste fino orientado a la tarea de ChartQA, es decir, responder preguntas sobre graficos y tablas a partir de una imagen. El adaptador se distribuye en formato safetensors y es compatible con la libreria transformers.

El modelo base, SmolVLM2-2.2B, pertenece a la familia SmolVLM de HuggingFace, disenada para inferencia de vision-lenguaje en dispositivos con recursos limitados. El adaptador hereda esa vocacion ligera y anade especializacion en comprension de graficos, un dominio donde los modelos generalistas suelen fallar por la necesidad de leer valores numericos, ejes y leyendas con precision.

La relevancia de esta ficha es limitada por la escasez de informacion: la model card esta practicamente vacia (plantilla autogenerada sin rellenar) y el repositorio no registra descargas ni likes en el momento de la consulta. No obstante, se documenta lo que puede inferirse con rigor del identificador, los tags y el ecosistema del modelo base, marcando explicitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SmolVLM2-2.2B (vision-lenguaje, transformer) |
| Parametros totales | No disponible (el adaptador LoRA es un subconjunto; el base declara 2.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el base admite cuantizacion adicional) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0.0 GB (segun metadatos del Hub) |
| Fecha de creacion | 2026-11-05 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) que modifica los pesos del modelo base SmolVLM2-2.2B. SmolVLM2 es una familia de modelos vision-lenguaje de HuggingFace construida sobre un backbone de lenguaje compacto y un encoder visual, pensada para ejecucion en hardware modesto. El sufijo "chartqa" indica que el ajuste se realizo sobre el conjunto de datos ChartQA, orientado a pregunta-respuesta sobre graficos.

No se dispone de informacion sobre hiperparametros de entrenamiento (rango del LoRA, alpha, tasa de aprendizaje, numero de pasos), composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card no aporta ningun detalle y el autor no ha documentado el procedimiento. Tampoco se especifica si el adaptador se entreno solo sobre el split de entrenamiento de ChartQA o sobre una mezcla con otros datos.

## Capacidades

- Respuesta a preguntas sobre graficos de barras, lineas y sectores, presumiblemente a partir del ajuste en ChartQA.
- Comprension de imagenes y texto combinados, heredada del modelo base SmolVLM2.
- Generacion de respuestas en lenguaje natural sobre valores y tendencias representados visualmente.
- Capacidad multilingue: no disponible (depende del modelo base, no documentada por el autor).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio adicional: no disponible.

## Casos de uso

- Extraccion de valores de graficos en informes financieros: el adaptador puede recibir una captura de un grafico de resultados trimestrales y devolver la cifra de una serie concreta, reduciendo el trabajo manual de transcripcion.
- Automatizacion de analisis de dashboards: integrado en un pipeline que recibe capturas de paneles de control, permite generar resumenes textuales de las metricas representadas.
- Accesibilidad de documentos: conversion de graficos de articulos o informes a descripciones textuales para lectores de pantalla, aprovechando la naturaleza ligera del modelo base.
- Verificacion de figuras en publicaciones cientificas: comprobacion automatica de que los valores citados en el texto coinciden con los representados en las figuras.
- Asistencia en educacion: responder preguntas de estudiantes sobre graficos de libros de texto o examenes, con un modelo que puede ejecutarse en equipos modestos.
- Preprocesado de datos para BI: extraccion estructurada de series temporales a partir de imagenes de graficos para alimentar bases de datos analiticas.
- Prototipado rapido en entornos con GPU de consumo: al ser un adaptador pequeno sobre un modelo de 2.2B, permite experimentar con vision-lenguaje sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para el modelo base SmolVLM2-2.2B en precision bf16 se situaria en el entorno de 5-6 GB, y en cuantizacion de 4 bits en torno a 2-3 GB, aunque estas cifras son estimaciones generales y no las declara el autor.
- GPU recomendadas: no disponible. Por el tamano del base, cabria esperar funcionamiento en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no esta verificado por el autor.
- Cabe en GPU de consumo: probablemente si, segun el tamano del modelo base; no confirmado para este adaptador.
- Opciones de despliegue: transformers (libreria declarada). Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLM2-2.2B-chartqa-lora | Adaptador sobre 2.2B | No disponible | ChartQA (LoRA) | No disponible | HuggingFace |
| SmolVLM2-2.2B (base) | 2.2B | No disponible en esta ficha | Vision-lenguaje general | No disponible en esta ficha | HuggingFace |
| Alternativas especializadas en ChartQA | No disponible | No disponible | QA sobre graficos | No disponible | No disponible |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas. La comparacion se limita a la naturaleza del artefacto (adaptador LoRA frente a modelo completo).

## Limitaciones y advertencias

- Model card vacia: el autor no ha documentado el entrenamiento, los datos ni las limitaciones, lo que impide evaluar su calidad de forma rigurosa.
- Sin benchmarks: no hay evidencia publicada de su rendimiento en ChartQA ni en otras tareas.
- Sesgos: no documentados; al entrenarse sobre ChartQA, puede heredar los sesgos de dominio y estilo de ese conjunto.
- Riesgo de alucinacion: elevado en tareas de lectura de valores numericos, donde los modelos vision-lenguaje pequenos tienden a inventar cifras si la imagen es de baja resolucion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor o consultarse la licencia del modelo base.
- Idiomas: no documentados; el comportamiento fuera del ingles (idioma dominante en ChartQA) es incierto.
- Dependencia del modelo base: el adaptador solo funciona junto con SmolVLM2-2.2B y hereda sus limitaciones de contexto y resolucion visual.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BasselNashaat/SmolVLM2-2.2B-chartqa-lora
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
