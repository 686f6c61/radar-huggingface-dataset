# mradermacher/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF

## Resumen

Esta ficha documenta `mradermacher/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF`, un repositorio de cuantizaciones en formato GGUF generado por el usuario mradermacher (nethype GmbH) a partir del modelo `DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del modelo original, que combina en su nombre tres linajes reconocibles: la familia LFM2.x, un ajuste tipo Hermes y un proceso de "abliteration" junto con un enfoque orientado a agentes y codigo.

El dato objetivo disponible es el numero de parametros del modelo base segun sus pesos en safetensors: 8.467.856.832, es decir, aproximadamente 8,47 mil millones. La nomenclatura "8B-A1B" sugiere habitualmente una arquitectura de mezcla de expertos (MoE) con unos 1.000 millones de parametros activos por token, pero esta informacion no se confirma en los datos de la model card, por lo que se marca como no verificada en esta ficha. El unico idioma declarado es el ingles.

Su relevancia practica es limitada pero concreta: ofrece un modelo de ~8,5B en once niveles de cuantizacion GGUF (desde Q2_K de 3,3 GB hasta f16 de 17,0 GB), lo que lo hace desplegable en GPU de consumo y en CPU. El repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta, no declara licencia y no aporta benchmarks, por lo que cualquier evaluacion debe hacerse mediante prueba propia antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. La nomenclatura del nombre (8B-A1B) apunta a una posible mezcla de expertos (MoE), sin confirmar |
| Parametros totales | 8.467.856.832 (~8,47B), dato real de los pesos en safetensors del modelo base |
| Parametros activos | No confirmado. El sufijo "A1B" del nombre sugiere ~1.000 millones de parametros activos, dato no verificado |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |
| Autor de la cuantizacion | mradermacher (nethype GmbH) |
| Modelo base | DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3 |
| Libreria declarada | transformers |
| Tamano del repositorio | 74,9 GB (suma de todas las cuantizaciones) |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |
| Etiquetas | transformers, gguf, en, endpoints_compatible, region:us, conversational |

Detalle de las cuantizaciones publicadas, ordenadas por tamano:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---:|---|
| Q2_K | 3,3 | |
| Q3_K_S | 3,9 | |
| Q3_K_M | 4,2 | calidad inferior |
| Q3_K_L | 4,5 | |
| Q4_K_S | 5,0 | rapida, recomendada |
| Q4_K_M | 5,3 | rapida, recomendada |
| Q5_K_S | 6,0 | |
| Q5_K_M | 6,1 | |
| Q6_K | 7,1 | muy buena calidad |
| Q8_0 | 9,1 | rapida, mejor calidad |
| f16 | 17,0 | 16 bpw, excesiva para la mayoria de casos |

## Arquitectura y entrenamiento

No hay informacion verificable en los datos proporcionados sobre la arquitectura interna del modelo base (si es un transformer denso, un MoE con enrutamiento por token, un modelo hibrido con capas de espacio de estados o una combinacion). El unico indicio es el propio identificador `LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3`, que sugiere: (1) pertenencia a la familia LFM2.5, (2) una configuracion con aproximadamente 8B de parametros totales y 1B activos, (3) un ajuste fino de tipo Hermes, (4) orientacion a uso agentico y generacion de codigo y (5) una version 3 con proceso de "abliteration" aplicado, tecnica que elimina direcciones de rechazo en el espacio de activaciones.

Tampoco se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o RLVR, ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. Todo ello debe consultarse en la model card del modelo base, que no forma parte de la informacion suministrada.

Lo que si es verificable es el proceso de cuantizacion: el autor indica que son cuantizaciones estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y que en el momento de la publicacion no habia cuantizaciones ponderadas ni con imatrix disponibles. No se incluye componente multimodal (`skip_mmproj`), coherente con un modelo de texto.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado por el autor del modelo base es conversacional y el repositorio incluye la etiqueta `conversational`.
- Generacion de codigo: por el sufijo "Coder" del nombre, el ajuste esta orientado a tareas de programacion, aunque no se detallan lenguajes soportados ni benchmarks que lo respalden.
- Uso agentico: el sufijo "Agentic" indica afinado para flujos de multiples pasos, uso de herramientas y razonamiento encadenado. No se confirma en la informacion disponible si el modelo emite llamadas a funciones en un formato estructurado concreto.
- Razonamiento multi-turno: soportado por la naturaleza conversacional del ajuste.
- Capacidades multilingues: no. El unico idioma declarado es el ingles.
- Capacidades especiales: no hay constancia de modo "thinking", vision, audio ni otras modalidades.
- Efecto del proceso de abliteration: cabe esperar una reduccion de los rechazos ante peticiones que el modelo original declinaria, sin que se especifiquen los detalles del procedimiento ni su impacto sobre la calidad general.

## Casos de uso

- Asistencia de programacion en local: con la cuantizacion Q4_K_M (5,3 GB) el modelo cabe en una GPU de 8 GB y permite autocompletado y explicacion de codigo sin enviar el codigo fuente a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Agentes de refactorizacion sobre repositorios: el ajuste agentico permite encadenar pasos de lectura de ficheros, propuesta de cambios y verificacion. Al ser GGUF, se integra con llama.cpp y herramientas de agentes que consumen endpoints compatibles con OpenAI.
- Automatizacion de tareas de CI/CD: generacion de parches, mensajes de commit, revisiones de diff y redaccion de descripciones de pull request dentro de un runner con GPU modesta, usando Q4_K_S o Q5_K_M.
- Prototipado rapido en portatiles sin GPU dedicada: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,9 GB) permiten ejecucion en CPU con RAM suficiente, utiles para demos y pruebas de concepto.
- Generacion de pruebas unitarias: el modelo puede producir esqueletos de tests a partir de firmas de funciones o de fragmentos de codigo existentes, con validacion posterior en el pipeline de integracion.
- Extraccion de texto a formato estructurado: conversion de documentacion tecnica o logs en JSON o YAML, siempre que el contenido este en ingles y el esquema se proporcione en el prompt.
- Chatbot tecnico interno: atencion de consultas de desarrolladores sobre una base de codigo, dado el registro conversacional del ajuste. Requiere validacion previa, ya que no hay evaluaciones publicadas de fidelidad.
- Generacion de documentacion de API: redaccion de docstrings y referencias a partir de codigo fuente, en un flujo batch sobre el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K, MBPP ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo: los unicos resultados obtenidos corresponden a paginas de estado de vuelos de Emirates, sin ninguna relacion con este modelo.

Las unicas referencias de rendimiento aportadas por el autor son graficos externos genericos sobre el impacto de los tipos de cuantizacion en la perplejidad (enlace al grafico de ikawrakow y a las notas de Artefact2 incluidos en la seccion de enlaces), que no son especificos de este modelo.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir del tamano de cada fichero GGUF mas el espacio de cache KV y sobrecarga de runtime (valores aproximados, no mediciones publicadas):

| Cuantizacion | Peso (GB) | VRAM estimada |
|---|---:|---:|
| Q2_K | 3,3 | ~4,0-4,5 GB |
| Q3_K_S | 3,9 | ~4,5-5,5 GB |
| Q3_K_M | 4,2 | ~5,0-6,0 GB |
| Q4_K_S | 5,0 | ~6,0-7,0 GB |
| Q4_K_M | 5,3 | ~6,0-7,5 GB |
| Q5_K_M | 6,1 | ~7,0-8,5 GB |
| Q6_K | 7,1 | ~8,0-9,5 GB |
| Q8_0 | 9,1 | ~10,0-11,5 GB |
| f16 | 17,0 | ~18,0-21,0 GB |

- GPU de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070): ejecutan Q2_K a Q4_K_M con contexto moderado. Es el rango mas habitual para uso local.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070): permiten Q5_K_M y Q6_K con margen para contexto amplio.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, A4000): Q6_K y Q8_0 sin problemas.
- GPU de 24 GB o superior (RTX 3090, RTX 4090, A100 40 GB, H100): Q8_0 y f16 completos en VRAM, con holgura para batch.
- CPU: las cuantizaciones Q2_K a Q4_K_M son viables en CPU con 8-16 GB de RAM; Q8_0 y f16 requieren 12-20 GB de RAM y penalizan fuertemente el throughput.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con endpoints estilo OpenAI. vLLM y TGI tienen soporte limitado o experimental de GGUF; para produccion con estas herramientas suele ser preferible partir de los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparacion cuantitativa. La tabla siguiente contrasta las caracteristicas verificables del modelo con dos alternativas de tamano similar ampliamente adoptadas en despliegue local, usando exclusivamente datos publicos conocidos de esas alternativas:

| Caracteristica | LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3 | Llama 3.1 8B Instruct | Qwen2.5 7B Instruct |
|---|---|---|---|
| Parametros totales | ~8,47B | 8B | 7,62B |
| Parametros activos | No confirmado (el nombre sugiere ~1B) | 8B (denso) | 7,62B (denso) |
| Longitud de contexto | No disponible | 128.000 tokens | 128.000 tokens |
| Idiomas | Ingles | Multilingue | Multilingue (incluye espanol) |
| Licencia | No disponible | Llama 3.1 Community License | Apache 2.0 |
| Formatos | GGUF (cuantizaciones) y safetensors (base) | safetensors, GGUF | safetensors, GGUF |
| Benchmarks publicados | No disponibles | Amplia bateria publica | Amplia bateria publica |
| Uso comercial | Indeterminado por falta de licencia | Permitido con condiciones | Permitido sin restricciones relevantes |

La diferencia mas relevante para un equipo tecnico no es de rendimiento, sino de trazabilidad: las dos alternativas de la tabla tienen licencia explicita, evaluaciones publicas y amplia adopcion, mientras que este repositorio no declara licencia ni ofrece ninguna metrica.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no especifica ninguna, lo que impide determinar si el uso comercial esta permitido. No deberia desplegarse en produccion sin aclarar antes la licencia del modelo base.
- Sin benchmarks ni evaluaciones: no hay ningun dato publicado de calidad, por lo que se desconoce su comportamiento en tareas de codigo, razonamiento o matematicas.
- Sin adopcion verificable: 0 descargas y 0 likes, lo que implica ausencia de validacion por parte de la comunidad y de informes de errores.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano. En tareas de codigo se traduce en APIs inexistentes, funciones inventadas y dependencias ficticias. Requiere verificacion automatica (compilacion, tests) antes de aceptar cualquier salida.
- Efecto de la abliteration: el proceso elimina direcciones de rechazo, de modo que el modelo puede generar contenido que el original declinaria. Esto es un riesgo directo en aplicaciones orientadas a usuarios finales y complica el cumplimiento de politicas de contenido. Ademas, la abliteration suele degradar parcialmente la coherencia y la calidad en tareas generales.
- Sesgos: no documentados. No hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Limitacion idiomatica: solo se declara ingles. El rendimiento en castellano es impredecible y no esta garantizado.
- Contexto desconocido: al no especificarse la ventana de contexto, no se puede planificar su uso en tareas que dependan de contexto largo (analisis de repositorios completos, conversaciones extensas).
- Naturaleza de fusion: el nombre indica un modelo fusionado (merge) de varios linajes, lo que puede producir comportamientos inconsistentes entre dominios.
- Cuantizaciones estaticas: el autor indica que no hay versiones ponderadas ni con imatrix, por lo que la perdida de calidad en Q2_K y Q3_K puede ser superior a la de cuantizaciones equivalentes de otros repositorios. Para uso serio, Q4_K_M o superior.
- Fechas inusuales: los metadatos indican creacion y actualizacion en septiembre de 2026, dato que conviene verificar en el repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF
- Modelo base: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3
- Pagina de resumen de descargas del autor para este modelo: https://hf.tst.eu/model#LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/

Nota: la busqueda web realizada no aporto ningun enlace relevante sobre este modelo. Los unicos resultados devueltos correspondian a paginas de estado de vuelos de la aerolinea Emirates y no guardan relacion con el contenido de esta ficha.
