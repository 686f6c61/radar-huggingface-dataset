# Jorbaty/banking77-mistral-7b-v0.3-gguf

## Resumen

banking77-mistral-7b-v0.3-gguf es un ajuste fino de mistralai/Mistral-7B-Instruct-v0.3 orientado exclusivamente a clasificacion de intenciones en dominio bancario. El autor, Jorbaty, lo entreno con QLoRA (Unsloth, r = 16, 2 epocas) sobre el split de entrenamiento de Banking77 (10.003 consultas) para asignar cada consulta de un cliente a una de las 77 intenciones predefinidas del dataset. Forma parte de un trabajo de fin de master sobre inferencia local de LLM para atencion al cliente (National Aviation University, Kyiv, 2026).

El modelo hereda la arquitectura transformer densa del base (7.248.023.552 parametros) y se distribuye unicamente en formato GGUF para llama.cpp, con tres niveles de cuantizacion: F16, Q8_0 y Q4_K_M. No es un modelo generativo de proposito general: el prompt indicado espera una unica respuesta, el nombre de la intencion, lo que lo convierte en un clasificador de texto con interfaz conversacional.

Su relevancia practica esta en la combinacion de tamano moderado (7B), licencia Apache 2.0 y formato GGUF, que permite ejecutarlo en hardware de consumo para preclasificar tickets de soporte bancario sin enviar datos a terceros. El autor reporta una exactitud de 0.9477 sobre el split de test de Banking77 (3.080 consultas), medida en la configuracion NF4 con adaptador, antes del merge y de la cuantizacion; la exactitud del formato exacto de inferencia se mide por separado segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 (7,25 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens) |
| Tipos de cuantizacion | GGUF F16, Q8_0 y Q4_K_M (generadas con llama-quantize, sin imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (modelo); dataset Banking77 bajo CC BY 4.0 |
| Formato de pesos | GGUF (llama.cpp); el recuento de parametros procede de metadatos safetensors |
| Tarea | Clasificacion de intenciones (77 clases de Banking77) mediante generacion de texto |
| Metodo de ajuste | QLoRA con Unsloth, r = 16, 2 epocas, sobre 10.003 consultas |
| Tamano del repositorio | 26,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es Mistral-7B-Instruct-v0.3, un transformer decoder-only denso de 7,25 mil millones de parametros con atencion causal y plantilla de chat propia. Sobre esa base se aplico un ajuste QLoRA con la libreria Unsloth, rango 16 y 2 epocas completas, usando el split de entrenamiento de PolyAI/banking77, compuesto por 10.003 consultas etiquetadas con 77 intenciones bancarias. El adaptador se integra posteriormente mediante merge y se cuantiza a GGUF; el autor no detalla en la model card la composicion exacta de prompt/plantilla usada durante el entrenamiento ni hiperparametros adicionales (learning rate, scheduler, longitud maxima de secuencia).

La innovacion del trabajo no esta en la arquitectura, sino en el enfoque de despliegue: clasificacion de intenciones ejecutada completamente en local mediante llama.cpp, como parte de una tesis sobre inferencia local de LLM para soporte al cliente. El prompt de inferencia es de un unico turno de usuario y espera como salida unicamente el nombre de la intencion, lo que reduce el coste de decodificacion y simplifica el postprocesado, aunque no se documenta ningun mecanismo de restriccion gramatical que garantice que la salida pertenezca al conjunto de las 77 etiquetas validas.

## Capacidades

- Clasificacion de consultas de clientes bancarios en 77 intenciones predefinidas (por ejemplo, consultas sobre tarjetas, transferencias, cargos no reconocidos o limites).
- Generacion de texto condicionada a una plantilla fija: "Classify the bank customer query into one intent. Answer with the intent name only." seguida de "Query: <consulta>".
- Funcionamiento con la plantilla de chat nativa del modelo base en un unico turno de usuario.
- Inferencia local en CPU y GPU mediante llama.cpp y sus derivados, gracias al formato GGUF.
- Ejecucion en tres niveles de cuantizacion con distintos compromisos de memoria y fidelidad.
- No se documenta soporte de tool calling ni de function calling especifico para este ajuste.
- No se documenta capacidad de agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: limitada al ingles segun la etiqueta de idioma del repositorio.
- Capacidad generativa general: muy probablemente degradada respecto al modelo base, dado que el ajuste se concentra en una unica tarea de clasificacion.

## Casos de uso

- Enrutado automatico de tickets en un contact center bancario: el modelo asigna cada consulta entrante a una de las 77 intenciones y esa etiqueta determina la cola, el equipo o el flujo de resolucion correspondiente. Es adecuado porque la salida es una etiqueta corta y estable, y el coste por inferencia es bajo.
- Preclasificacion en local con requisitos de privacidad: al ejecutarse con llama.cpp sobre hardware propio, las consultas de clientes no salen de la infraestructura del banco, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Triaje en cajeros o terminales de autoservicio con GPU de gama media: la cuantizacion Q4_K_M permite desplegar el clasificador en equipos con menos de 8 GB de VRAM.
- Etiquetado asistido de historicos de conversaciones: procesamiento por lotes de transcripciones de chat o correo para generar conjuntos de datos etiquetados con las 77 categorias de Banking77.
- Analitica de motivos de contacto: agregacion de las intenciones predichas para medir volumen por tipo de incidencia y priorizar mejoras de producto o de documentacion.
- Filtro previo en pipelines RAG de banca: usar la intencion detectada para seleccionar el subconjunto de documentos o el prompt de sistema adecuado antes de invocar un modelo generativo mayor.
- Prototipado y evaluacion academica: servir como linea base reproducible para comparar estrategias de ajuste eficiente (QLoRA con distintos rangos) en tareas de clasificacion de intenciones.
- Validacion rapida con fines de investigacion dentro del dominio bancario en ingles, asumiendo que la exactitud reportada corresponde a la configuracion NF4 con adaptador y no necesariamente al GGUF cuantizado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Banking77 test accuracy | 0,9477 | 3.080 consultas; base NF4 + adaptador, antes de merge y cuantizacion |

La model card indica explicitamente que la exactitud del formato exacto de inferencia (prompt de un unico turno sobre los GGUF publicados) se mide por separado, pero no se incluye ese resultado en la informacion disponible. No hay datos publicados de MMLU, HumanEval, GSM8K ni de otras tareas generales. Tampoco se documentan metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, calculada a partir del recuento de parametros y del coste del contexto; no confirmada por el autor):
  - F16: aproximadamente 14,5 GB solo de pesos, mas cache KV.
  - Q8_0: aproximadamente 7,7 GB de pesos, mas cache KV.
  - Q4_K_M: aproximadamente 4,4 GB de pesos, mas cache KV.
- GPU recomendadas: A100 o H100 para F16 con contexto largo y lotes grandes; RTX 4090 o L40S para F16 en uso interactivo; RTX 3090, 4080 o 4090 para Q8_0; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para Q4_K_M.
- Viabilidad en GPU de consumo: si. Q4_K_M cabe en tarjetas de 8 GB o mas; Q8_0 requiere al menos 10-12 GB; F16 requiere 16-24 GB.
- Despliegue: llama.cpp, Ollama y LM Studio son las rutas directas por el formato GGUF. El repositorio incluye la etiqueta endpoints_compatible. vLLM y TGI no consumen GGUF de forma nativa sin conversion a safetensors o uso de backends especificos.
- Latencia y throughput estimados: no disponible.
- Tamano de descarga: el repositorio completo ocupa 26,6 GB al incluir las tres cuantizaciones; en la practica solo se descarga el fichero GGUF elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Ajuste para Banking77 | Exactitud en Banking77 |
|---|---|---|---|---|---|
| Jorbaty/banking77-mistral-7b-v0.3-gguf | 7,25 mil millones | no disponible | Apache 2.0 | QLoRA, r = 16, 2 epocas | 0,9477 en NF4 + adaptador |
| mistralai/Mistral-7B-Instruct-v0.3 (base) | 7,25 mil millones | 32.768 tokens | Apache 2.0 | ninguno | no disponible |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | ninguno | no disponible |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 (la mayoria de variantes) | ninguno | no disponible |

No se dispone de datos de exactitud en Banking77 para modelos comparables, ni de comparaciones directas publicadas por el autor frente a otros clasificadores de intenciones como los basados en dual sentence encoders del propio paper del dataset. La comparativa se limita por tanto a tamanos, contexto y licencia.

## Limitaciones y advertencias

- Modelo de tarea unica: esta ajustado para devolver el nombre de una intencion, no para conversar, razonar o generar texto libre. Usarlo como chatbot general producira resultados pobres.
- Idioma: solo ingles. Las consultas en castellano o en cualquier otro idioma no estan cubiertas y la calidad esperada es baja.
- Riesgo de alucinacion: la model card no describe ningun mecanismo que obligue a la salida a pertenecer al conjunto de las 77 etiquetas validas. Sin validacion posterior o gramatica restringida, el modelo puede devolver cadenas fuera del catalogo.
- Degradacion por cuantizacion: la exactitud de 0,9477 se midio sobre la base en NF4 con adaptador, antes del merge y de la cuantizacion GGUF. El rendimiento de Q4_K_M y Q8_0 puede ser inferior y no se reporta.
- Alcance del dataset: Banking77 cubre consultas bancarias en ingles con 77 intenciones concretas. Cualquier dominio fuera de ese catalogo queda fuera del alcance del ajuste.
- Ausencia de validacion comunitaria: el repositorio tiene 0 descargas y 0 likes, sin issues ni evaluaciones externas que confirmen los resultados declarados.
- Licencias: el modelo es Apache 2.0, pero el dataset Banking77 se distribuye bajo CC BY 4.0, lo que exige atribucion a Casanueva et al., 2020 en trabajos derivados.
- Procedencia academica: se trata de un artefacto de tesis de master, sin garantias de mantenimiento, soporte ni actualizaciones.
- Incoherencia de metadatos: las fechas de creacion y actualizacion del repositorio (13 de octubre de 2026) son posteriores a la fecha actual, lo que sugiere un error en los metadatos de HuggingFace.
- Para produccion se recomienda envolver el modelo con validacion de la etiqueta de salida, control de versiones del fichero GGUF concreto y monitorizacion de la tasa de etiquetas invalidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jorbaty/banking77-mistral-7b-v0.3-gguf
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Referencia del dataset: Casanueva et al., 2020 (citada en la model card; sin enlace proporcionado)
- Busqueda web: no se encontro ningun enlace relevante al modelo. Los resultados devueltos corresponden a polybuzz.ai y dominios asociados, una plataforma de chat con personajes de IA sin relacion con este modelo ni con la clasificacion de intenciones bancarias.
