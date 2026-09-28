# IvanOjok/RuleGuidedQwen

## Resumen

RuleGuidedQwen es un ajuste fino mediante LoRA sobre un modelo de la familia Qwen, publicado por el usuario IvanOjok en HuggingFace. Su proposito concreto es la traduccion a Braille grado 2 (Braille contraido) conforme al estandar UEB (Unified English Braille), combinando el modelo neuronal con reglas de produccion que fuerzan el cumplimiento estricto de la normativa Braille. Segun la model card, este enfoque hibrido supera a un modelo puramente neuronal en metricas de cumplimiento UEB: compliance, capitalizacion, puntuacion, numericos y precision sobre palabras fuera de vocabulario (OOV), que en conjunto conforman el recall del sistema.

El dato mas relevante disponible es el recuento de parametros: 494.032.768 (aproximadamente 0,5B). Este tamano, junto con la etiqueta `rule_guided_braille_qwen` y el tamano del repositorio (1,0 GB), es coherente con un modelo de la serie Qwen de ~0,5B parametros distribuido en safetensors, aunque la model card no identifica explicitamente el checkpoint base ni la variante exacta. El modelo se publica bajo licencia Apache 2.0.

Se trata de un modelo muy especializado y de nicho, con 10 descargas y 1 like en el momento de redactar esta ficha. Su interes no radica en capacidades generales de lenguaje, sino en demostrar que la hibridacion reglas + red neuronal mejora la fidelidad en una tarea con restricciones formales estrictas, donde los errores de formato (mayusculas, signos numericos, puntuacion) son criticos para usuarios de Braille. La informacion publica es escasa: no hay pipeline declarado, no se detallan idiomas soportados ni se aportan cifras numericas de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen con ajuste fino LoRA (variante base no especificada en la model card) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible en la ficha; la tarea declarada (Braille UEB, grado 2) implica ingles como idioma de trabajo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,0 GB) |

## Arquitectura y entrenamiento

La model card indica unicamente que se trata de un modelo Qwen ajustado con LoRA (Low-Rank Adaptation) y que el sistema final combina ese modelo neuronal con reglas de produccion que imponen el cumplimiento estricto de las reglas de Braille grado 2. No se especifica el checkpoint base exacto, el rango o los hiperparametros del adaptador LoRA, ni si los pesos publicados corresponden a un merge del adaptador con el modelo base. El recuento de parametros (494.032.768) es compatible con un modelo Qwen de aproximadamente 0,5B parametros, pero esta afirmacion es una inferencia tecnica a partir del tamano declarado, no un dato confirmado por el autor.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni el uso de tecnicas de alineacion como RLHF, DPO o SFT adicional. La innovacion declarada es metodologica: la capa de reglas de produccion actua como mecanismo de garantia formal sobre la salida neuronal, de forma que el sistema corrige o restringe las emisiones que violarian las convenciones UEB. Segun el autor, este diseno mejora metricas de compliance, capitalizacion, puntuacion, tratamiento de numericos y aciertos sobre OOV respecto a un modelo exclusivamente neuronal, y tambien mejora la precision al reducir inserciones de caracteres no presentes en la referencia.

## Capacidades

- Traduccion de texto a Braille grado 2 conforme al estandar UEB (Unified English Braille).
- Cumplimiento de reglas formales de Braille: contracciones, capitalizacion, puntuacion y signos numericos.
- Manejo de palabras fuera de vocabulario (OOV) con mejor comportamiento que un modelo puramente neuronal, segun la model card.
- Reduccion de inserciones de caracteres respecto a la referencia (mejora de precision declarada).
- Capacidades generales de generacion de lenguaje, razonamiento, codigo o matematicas: no disponibles (el modelo es un ajuste especializado y la ficha no declara estas capacidades).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles; la tarea declarada se limita a Braille UEB.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Produccion de material accesible: conversion automatica de documentos de texto a Braille grado 2 para su publicacion o impresion en lineas Braille, aprovechando la capa de reglas para garantizar el cumplimiento UEB.
- Generacion de ficheros BRF para impresoras Braille: el modelo puede actuar como motor de transliteracion previo a la generacion del fichero BRF, reduciendo errores de formato que obligarian a revision manual.
- Validacion y control de calidad de traducciones existentes: uso del modelo y su capa de reglas para detectar incumplimientos de capitalizacion, puntuacion o numericos en corpus Braille ya producidos.
- Educacion y materiales didacticos: generacion de transcripciones Braille de apuntes, ejercicios y textos escolares para estudiantes con discapacidad visual, un dominio donde los errores sistematicos de formato tienen alto coste.
- Integracion en lectores de pantalla y herramientas de accesibilidad: como componente de traduccion texto a Braille en aplicaciones de escritorio o web que necesiten salida Braille bajo demanda.
- Procesamiento por lotes de fondos documentales: traduccion masiva de repositorios de texto a Braille en entornos de digitalizacion, donde el bajo numero de parametros (0,5B) permite desplegar el modelo en hardware modesto.
- Investigacion en NLP aplicado a accesibilidad: punto de partida reproducible para comparar enfoques hibridos reglas + red neuronal frente a sistemas puramente neuronales o puramente basados en reglas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente afirma, de forma cualitativa, que el modelo supera a un modelo exclusivamente neuronal en las metricas de compliance, capitalizacion, puntuacion, numericos y precision OOV, que componen el recall, asi como en precision (penalizando inserciones de caracteres). No se proporcionan valores concretos, ni el conjunto de evaluacion utilizado, ni la identidad del modelo neuronal de referencia.

| Metrica | RuleGuidedQwen | Modelo neuronal de referencia |
|---|---|---|
| Compliance UEB | mejor (sin cifra publicada) | referencia base |
| Capitalizacion | mejor (sin cifra publicada) | referencia base |
| Puntuacion | mejor (sin cifra publicada) | referencia base |
| Numericos | mejor (sin cifra publicada) | referencia base |
| Precision OOV | mejor (sin cifra publicada) | referencia base |
| Precision (inserciones) | mejor (sin cifra publicada) | referencia base |

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 1 GB de pesos, mas overhead de activaciones y cache KV; en la practica menos de 2 GB para el modelo.
- VRAM estimada en int8: aproximadamente 0,5 GB de pesos; en int4, en torno a 0,25-0,3 GB (requiere cuantizacion externa, no hay versiones publicadas).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores; tambien A100, H100 o L4, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU con memoria RAM suficiente (menos de 2 GB en fp16).
- Opciones de despliegue: transformers de HuggingFace de forma nativa; llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion no publicada por el autor; vLLM y TGI son viables en fp16 siempre que se registre la arquitectura base correcta.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera baja latencia en GPU de consumo, pero no hay mediciones publicadas.
- Nota: al no declararse el checkpoint base exacto, la integracion en frameworks de inferencia puede requerir verificar la configuracion del modelo antes de desplegarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| RuleGuidedQwen (IvanOjok) | 494.032.768 | no disponible | Braille UEB grado 2 con reglas de produccion | Apache 2.0 | Mejora cualitativa sobre el modelo neuronal de referencia en metricas UEB |
| Modelo Qwen base de ~0,5B (sin ajustar) | ~0,5B | no disponible | Proposito general, sin especializacion Braille | depende de la variante | No disponible para la tarea Braille |
| Modelo neuronal de referencia citado en la model card | no disponible | no disponible | Traduccion Braille extremo a extremo sin reglas | no disponible | Referencia base sobre la que se mide la mejora |
| Sistemas basados en reglas (por ejemplo, tablas de transliteracion) | no aplica | no aplica | Cumplimiento estricto de la normativa Braille | variable | Deterministas, sin capacidad de generalizacion ante OOV |

No se dispone de modelos comparables con cifras publicas verificables en la informacion proporcionada; la comparativa anterior es estructural y no de rendimiento medido.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo ni evaluacion por subgrupos.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; la capa de reglas de produccion mitiga incumplimientos formales, pero no garantiza correccion semantica de la transliteracion.
- Limitaciones de contexto o idioma: no se declara la longitud de contexto; la tarea se limita a Braille UEB (grado 2), por lo que la aplicacion a otros sistemas Braille (grado 1, Braille de otros idiomas o codigos especificos de pais) no esta soportada ni documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. Conviene verificar la licencia del checkpoint Qwen base utilizado, que puede imponer condiciones adicionales.
- Ausencia de datos de evaluacion: la mejora declarada no viene acompanada de cifras, conjunto de test ni definicion formal de las metricas, lo que impide reproducir o auditar los resultados.
- Trazabilidad limitada: no se especifica el checkpoint base, el proceso de entrenamiento, el dataset ni los hiperparametros, lo que dificulta la reproducibilidad y la depuracion en produccion.
- Madurez: con 10 descargas y 1 like, el modelo no tiene validacion por parte de la comunidad. No se recomienda su uso en produccion sin una evaluacion propia sobre un corpus Braille de referencia.
- Ausencia de versiones cuantizadas: no hay GGUF ni formatos optimizados publicados, lo que anade un paso de conversion para despliegues en llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IvanOjok/RuleGuidedQwen
- Model card del autor: incluida en la pagina anterior (unica fuente primaria disponible)
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados (ACL Anthology RANLP 2025, arXiv 2609.01725, proceedings CASE 2025, listado de autores de Goodreads) no guardan relacion con RuleGuidedQwen y no se incluyen como fuentes.
