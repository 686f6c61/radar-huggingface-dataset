# htchu/herb-llm-gemma3-awq

## Resumen

`htchu/herb-llm-gemma3-awq` es un repositorio de pesos alojado en HuggingFace que contiene un modelo de lenguaje cuantizado con AWQ (Activation-aware Weight Quantization) y empaquetado en el formato `compressed-tensors`. La arquitectura declarada en los metadatos es `gemma3_text`, es decir, la familia Gemma 3 de Google DeepMind, y el recuento real de parametros leido de los ficheros safetensors es de 2.651.042.208 (aproximadamente 2,65 mil millones). El autor del repositorio es el usuario `htchu` y el nombre del modelo sugiere un ajuste fino orientado a un dominio concreto (herb-llm), si bien no hay documentacion que lo confirme.

El interes practico de este repositorio es acotado y muy especifico: se trata de una version cuantizada a 4 bits (formato AWQ) de un modelo de ~2,65B, lo que reduce el peso en disco a unos pocos gigabytes y permite desplegarlo en GPU de consumo. El tamano del repositorio (8,1 GB) es coherente con pesos cuantizados mas ficheros auxiliares y posibles copias sin cuantizar de algunos tensores.

La relevancia es limitada por el momento: el repositorio acumula 19 descargas y 0 likes, no incluye model card con licencia, idiomas, pipeline ni contexto declarados, y la busqueda web no ha devuelto ninguna fuente tecnica asociada al modelo (los resultados obtenidos corresponden a un servicio de correo ajeno por completo al proyecto). Cualquier evaluacion en produccion deberia tratar esta ficha como preliminar y verificar los pesos directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia `gemma3_text` (Gemma 3) |
| Parametros totales | 2.651.042.208 (segun metadatos de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ con formato `compressed-tensors`; no se especifica el numero de bits ni el tamano de grupo |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio (la familia Gemma 3 se distribuye habitualmente bajo los Gemma Terms of Use, dato no confirmado para este modelo) |
| Formato de pesos | safetensors, empaquetado `compressed-tensors` (AWQ) |
| Tamano del repositorio | 8,1 GB |
| Descargas / likes | 19 / 0 |
| Fecha de creacion (metadatos) | 2026-09-17 |
| Ultima actualizacion (metadatos) | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 en su variante text-only (`gemma3_text`): un transformer decoder-only con normalizacion RMSNorm, atencion con RoPE y, presumiblemente, atencion con consultas agrupadas (GQA) y alternancia entre atencion local y global, caracteristicas habituales de la familia. El modelo ha sido sometido a cuantizacion AWQ, una tecnica de cuantizacion de pesos a 4 bits guiada por la magnitud de las activaciones, que escala los canales mas sensibles antes de redondear para minimizar la perdida de calidad. El empaquetado es `compressed-tensors`, el formato estandar de la libreria `llm-compressor` y compatible con motores de inferencia como vLLM o TGI.

No hay informacion disponible sobre el proceso de entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, y si el ajuste respecto al modelo base de Gemma 3 consistio en un fine-tuning de dominio o en una simple cuantizacion. El sufijo `herb-llm` del nombre apunta a una especializacion tematica (posiblemente botanica, fitoterapia o herbolario), pero es una inferencia no confirmada por ninguna fuente. Tampoco se documenta ninguna innovacion tecnica adicional ni se publican las recetas de calibracion empleadas para la cuantizacion (tamano de grupo, dataset de calibracion, orden de cuantizacion).

## Capacidades

La ausencia de model card impide confirmar capacidades de forma fiable. A partir de lo que es razonable esperar de la arquitectura base se puede indicar lo siguiente, siempre con caracter provisional y sujeto a verificacion empirica:

- Generacion de texto autoregresiva en el estilo y dominio aprendidos durante el ajuste, si este existio.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de ~2,65B parametros.
- Generacion de codigo en lenguajes habituales, con calidad previsiblemente inferior a la de modelos de 7B o superiores.
- Resolucion de problemas matematicos simples, con alta probabilidad de error en cadenas de varios pasos.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Soporte de tool calling / function calling: no disponible y poco probable en un modelo de este tamano sin un ajuste especifico.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el tag `gemma3_text` indica que se trata unicamente de la torre de texto, sin el codificador visual que si existe en las variantes multimodales de Gemma 3.

## Casos de uso

Dada la falta de documentacion, los casos siguientes son escenarios plausibles que requieren validacion previa con una bateria de evaluacion propia:

- Clasificacion y etiquetado de textos de dominio especifico: el modelo puede usarse para asignar categorias, extraer entidades o etiquetar documentos de un nicho concreto (por ejemplo, fitoterapia o botanica, a tenor del nombre), con un coste de inferencia muy bajo gracias a la cuantizacion a 4 bits.
- Prototipado rapido en maquina local: con apenas 1,5-2 GB de pesos, permite montar un entorno de pruebas en una GPU de consumo o incluso en una estacion de trabajo modesta antes de decidir si se escala a un modelo mayor.
- Generacion asistida de resumenes cortos: adecuado para condensar parrafos o fichas de producto en textos breves, donde el limite de razonamiento del modelo no penaliza tanto.
- Extraccion de informacion estructurada: conversion de texto libre a JSON o campos concretos en un pipeline de ingestión de datos, siempre que se valide con un esquema estricto y se controle la tasa de fallos.
- Chatbot de soporte de alcance limitado: atencion en un unico idioma y con respuestas de baja criticidad, con un componente de recuperacion (RAG) que aporte los hechos y deje al modelo la tarea de redaccion.
- Ajuste posterior (fine-tuning) sobre el propio modelo cuantizado o sobre el base: al ser un peso pequeno, sirve como punto de partida economico para experimentos de LoRA/QLoRA sobre una tarjeta grafica de gama media.
- Evaluacion comparativa de tecnicas de cuantizacion: util como caso de estudio para medir la degradacion de AWQ frente a los pesos originales en un modelo pequeno, comparando perplejidad y exactitud en tareas cerradas.
- Generacion de texto sintetico para aumentar datasets de dominio: redaccion de variaciones de textos existentes en un corpus especializado, con revision humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, no se han encontrado articulos, blogs ni hilos tecnicos asociados mediante busqueda web, y tampoco hay valores de perplejidad o de degradacion tras la cuantizacion que permitan estimar la perdida de calidad respecto al modelo base.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad (wiki) | no disponible |
| Degradacion frente al modelo sin cuantizar | no disponible |

## Requisitos de hardware

- VRAM para los pesos: asumiendo cuantizacion de 4 bits, el modelo ocupa del orden de 1,3 a 1,8 GB en memoria de video, incluyendo escalas y parametros de cuantizacion. El repositorio en disco pesa 8,1 GB, por lo que puede contener tensores adicionales sin cuantizar o ficheros auxiliares que aumenten ese consumo si el cargador los materializa.
- VRAM total en inferencia: con una ventana de contexto moderada (4K-8K tokens) y un lote pequeno, un presupuesto de 3 a 4 GB suele ser suficiente; el coste de la cache KV crece de forma lineal con el contexto y con el tamano de lote.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Tambien es viable en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con contextos cortos.
- GPU de centro de datos: L4, A10G, L40S, A100 y H100 son sobredimensionadas para este tamano y solo se justifican por agregacion de muchas peticiones concurrentes.
- Opciones de despliegue: vLLM y SGLang admiten pesos AWQ en formato `compressed-tensors`; TGI tambien soporta AWQ. La via directa con `transformers` requiere las librerias de cuantizacion compatibles (`llm-compressor` o `autoawq`). `llama.cpp` y Ollama no cargan AWQ de forma nativa: habria que convertir los pesos a GGUF previamente.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de su documentacion publica y no de la informacion proporcionada en esta busqueda; se incluyen como referencia orientativa y deben verificarse en sus fichas oficiales. Para `herb-llm-gemma3-awq` varios campos figuran como no disponibles porque el repositorio no los declara.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| htchu/herb-llm-gemma3-awq | 2,65B (segun safetensors) | no disponible | no disponible | safetensors + compressed-tensors (AWQ) |
| Gemma 3 (variante pequena de la familia) | segun variante | no disponible | Gemma Terms of Use | safetensors; versiones GGUF y AWQ de la comunidad |
| Qwen2.5-3B | ~3,1B | 32K tokens (referencia publica) | Apache 2.0 (referencia publica) | safetensors, GGUF, AWQ, GPTQ |
| Llama 3.2 3B | ~3,2B | 128K tokens (referencia publica) | Llama 3.2 Community License (referencia publica) | safetensors, GGUF, cuantizaciones de la comunidad |

Diferencias clave: frente a Qwen2.5-3B y Llama 3.2 3B, este repositorio no declara licencia ni idiomas, carece de benchmarks publicados y no ofrece variantes GGUF listas para usar. Su ventaja teorica es el menor consumo de VRAM al estar ya cuantizado en AWQ, lo que evita tener que aplicar la cuantizacion por cuenta propia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar que el uso comercial este permitido. Si el modelo deriva de Gemma 3, es probable que se apliquen los Gemma Terms of Use y sus restricciones de uso aceptable, pero esto no esta verificado en el repositorio.
- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, idiomas, sesgos, ni procedencia del ajuste. Esto impide cualquier evaluacion de riesgos minimamente seria.
- Riesgo de alucinacion alto en un modelo de ~2,65B: la generacion de hechos, citas, dosis, referencias bibliograficas o cualquier dato verificable debe tratarse como no fiable. Si el dominio es sanitario o botanico, el riesgo es especialmente grave y exige supervision experta.
- Fechas anomalas en los metadatos: creacion y actualizacion figuran como 2026-09-17, una fecha futura, lo que sugiere manipulacion de metadatos o un error en el registro. Conviene auditar la procedencia de los pesos.
- Sin validacion comunitaria: 19 descargas y 0 likes implican que el modelo no ha sido replicado ni evaluado por terceros. No hay garantia de que los pesos esten completos o de que la cuantizacion se haya realizado correctamente.
- Ambito de contexto e idiomas desconocidos: no se puede planificar un despliegue con contexto largo ni garantizar un rendimiento aceptable en castellano.
- Degradacion por cuantizacion no medida: al no compararse con el modelo sin cuantizar, se desconoce la perdida real de exactitud introducida por AWQ.
- Compatibilidad de despliegue limitada: los formatos `llama.cpp` y Ollama requieren conversion previa, lo que anade un paso de ingenieria y un riesgo adicional de error.
- Recomendacion operativa: no usar en produccion con datos personales, decisiones automatizadas con impacto legal o informacion medica sin auditoria previa de los pesos y una evaluacion propia de sesgos y exactitud.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/htchu/herb-llm-gemma3-awq
- La busqueda web realizada no ha devuelto ningun enlace relevante al modelo: los unicos resultados obtenidos corresponden al servicio de correo TIM Mail (tim.it, mail.tim.it, mail.alice.it) y no guardan relacion con el proyecto.
- No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo en la informacion disponible.
