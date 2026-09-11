# mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo saidutta69/Qwen2.5-Coder-1.5B-Instruct-heretic, una variante "abliterated" (sin la dirección de rechazo) del Qwen2.5-Coder-1.5B-Instruct de Alibaba Qwen. El trabajo de cuantización lo firma mradermacher (nethype GmbH), que publica versiones estáticas en 12 formatos distintos, desde Q2_K (0,8 GB) hasta f16 (3,2 GB), además de una variante con importancia matrix (imatrix) en un repositorio aparte. El modelo cuenta con 1.543.714.304 parámetros reales según los pesos en safetensors del modelo base y se distribuye bajo licencia Apache 2.0.

El interés práctico de esta ficha es doble. Por un lado, Qwen2.5-Coder-1.5B-Instruct es un modelo de código especializado de tamano pequeno, pensado para ejecucion local en hardware modesto (CPU, iGPU, portatiles sin GPU dedicada). Por otro, la variante heretic elimina los comportamientos de rechazo del modelo original, lo que lo hace util para generacion creativa y roleplay, pero tambien incrementa el riesgo de producir contenido inapropiado sin filtros. El repositorio declara únicamente el idioma inglés.

El momento de publicacion del repositorio (septiembre de 2026 según los metadatos) y sus cifras de adopción (0 descargas y 0 "me gusta" en el momento de la consulta) indican que se trata de una publicacion reciente y sin validacion comunitaria. No se ha publicado ningún benchmark ni evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con attention agrupada (GQA) y RoPE; propia de la familia Qwen2.5 (el repositorio no detalla capas ni dimensiones) |
| Parametros totales | 1.543.714.304 (segun pesos en safetensors del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en este repositorio; la familia base Qwen2.5-Coder-1.5B-Instruct declara 32.768 tokens nativos |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (12 variantes, con cuantizacion por tensor) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |
| Modelo base | saidutta69/Qwen2.5-Coder-1.5B-Instruct-heretic (derivado de Qwen/Qwen2.5-Coder-1.5B-Instruct) |
| Tarea declarada | Text generation / conversacional (etiquetas: code, chat, roleplay, coding) |
| Tamano del repositorio | 14,2 GB (suma de todas las cuantizaciones) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es un trabajo de conversion y cuantizacion. mradermacher parte del checkpoint en safetensors de saidutta69/Qwen2.5-Coder-1.5B-Instruct-heretic, lo convierte a formato GGUF (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`) y genera 12 variantes de cuantizacion estatica mediante llama.cpp. Las cuantizaciones etiquetadas como IQ (aqui solo IQ4_XS) emplean cuantizacion con importancia matrix cuando el modelo base la aporta; el autor publica ademas un repositorio independiente con cuantizaciones ponderadas i1 si el usuario prefiere ese enfoque.

El modelo subyacente pertenece a la familia Qwen2.5-Coder, una saga de modelos decoder-only con normalizacion RMSNorm, RoPE y attention con consultas agrupadas, entrenada por Alibaba Qwen sobre un corpus masivo de codigo y texto. El checkpoint intermedio (saidutta69/...) es una version "abliterated" o "decensored": se ha modificado el modelo para suprimir la direccion de activacion asociada al rechazo de peticiones, de ahi las etiquetas heretic, uncensored, abliterated y decensored. Esta intervencion no anade conocimiento nuevo, solo altera el comportamiento de rechazo. Los detalles concretos del dataset, el numero de tokens, el proceso de RLHF/DPO y la receta de abliteracion no estan documentados en la informacion disponible de este repositorio.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, herencia directa del entrenamiento especializado en codigo de la familia Qwen2.5-Coder.
- Rellenado de codigo en medio de un fichero (fill-in-the-middle): la familia Qwen2.5-Coder se entrena con formato FIM, lo que habilita autocompletado en editores.
- Instrucciones conversacionales de un solo turno y multi-turno, con plantilla de chat propia de Qwen (ChatML).
- Explicacion de fragmentos de codigo, deteccion de errores y propuesta de refactorizaciones.
- Generacion de texto libre y redaccion creativa sin los filtros de rechazo habituales, gracias a la abliteracion.
- Roleplay y simulacion de personajes (etiqueta explicita roleplay en la model card).
- Ejecucion local en CPU y GPU de gama baja: el rango de tamano (0,8-3,2 GB) lo permite.
- No se declara soporte de tool calling / function calling, ni modo "thinking", ni vision, ni audio, ni capacidad de agentes multi-paso. No hay informacion al respecto en este repositorio.
- Capacidad multilingue: solo se declara ingles. La familia base es mas amplia, pero no esta declarado aqui.

## Casos de uso

- Autocompletado de codigo en el IDE sin conexion: con una cuantizacion Q4_K_M de 1,1 GB el modelo puede servirse mediante llama.cpp u Ollama en el propio portatil y responder a peticiones FIM con latencias de decenas de milisegundos por token en CPU moderna, sin enviar codigo propietario a terceros.
- Asistente de refactorizacion en pipelines de CI: se puede invocar el modelo desde un script (llama-cpp-python) para revisar diffs, sugerir nombres de variables o detectar patrones repetidos antes del merge, dado su bajo coste de ejecucion.
- Generacion de tests unitarios y documentacion: el modelo produce esqueletos de pruebas y docstrings para funciones existentes a partir del codigo fuente, una tarea donde un modelo de 1,5 B especializado en codigo rinde por encima de modelos generales del mismo tamano.
- Traduccion entre lenguajes de programacion: conversion de utilidades pequenas (por ejemplo, scripts de Python a TypeScript o a Go) en tareas acotadas donde el contexto necesario cabe en la ventana del modelo.
- Soporte a estudiantes y entornos educativos: explicacion paso a paso de errores de compilacion o de fragmentos de codigo, ejecutable en el equipo del alumno sin GPU dedicada y sin coste de API.
- Escritura creativa y narrativa interactiva: al ser una variante abliterated, mantiene la coherencia de personaje en roleplay y no rechaza tematicas adultas o violentas, lo que resulta util en prototipos de videojuegos con narrativa ramificada.
- Clasificacion y etiquetado de texto en lote sobre CPU: con Q2_K o Q3_K_S el modelo cabe en menos de 1 GB de memoria, por lo que se puede procesar grandes volumenes de texto en servidores sin GPU.
- Asistentes embebidos en dispositivos edge: en Raspberry Pi 5 o mini-PC con 4-8 GB de RAM, la cuantizacion Q4_K_M permite un asistente de codigo o de texto local con consumo energetico minimo.
- Prototipado rapido de chatbots con LM Studio o KoboldCpp para demos internas, gracias a que el formato GGUF esta soportado por practicamente todos los frontends locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizacion no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni comparaciones con el modelo original. Las unicas cifras objetivas disponibles son los tamanos de fichero de cada cuantizacion (0,8 GB para Q2_K hasta 3,2 GB para f16) y el recuento de parametros (1.543.714.304).

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 0,8 | - |
| Q3_K_S | 0,9 | - |
| Q3_K_M | 0,9 | calidad inferior |
| Q3_K_L | 1,0 | - |
| IQ4_XS | 1,0 | - |
| Q4_K_S | 1,0 | rapida, recomendada |
| Q4_K_M | 1,1 | rapida, recomendada |
| Q5_K_S | 1,2 | - |
| Q5_K_M | 1,2 | - |
| Q6_K | 1,4 | muy buena calidad |
| Q8_0 | 1,7 | rapida, mejor calidad |
| f16 | 3,2 | 16 bpw, excesiva |

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV + overhead del runtime): Q2_K y Q3_K, en torno a 1,0-1,5 GB; Q4_K_M, en torno a 1,5-2,0 GB; Q5_K_M y Q6_K, en torno a 2,0-2,5 GB; Q8_0, en torno a 2,5-3,0 GB; f16, en torno a 3,5-4,5 GB. Son estimaciones; el consumo exacto depende del backend y de la longitud de contexto configurada.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RX 6600, e integradas recientes tipo Radeon 780M o Arc integrada). Tambien se puede repartir entre GPU y CPU con `-ngl` en llama.cpp.
- Inferencia en CPU viable: con Q4_K_M el modelo ocupa ~1,1 GB en RAM, por lo que funciona en equipos con 4-8 GB de RAM libre, incluidos mini-PC y placas tipo Raspberry Pi 5.
- GPU de centro de datos (A100, H100) no aportan ventaja practica por tamano, salvo para servir muchas instancias concurrentes en un mismo nodo.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, KoboldCpp, text-generation-webui, llama-cpp-python, Jan. vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos backends conviene usar el checkpoint en safetensors del modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.
- Aviso sobre cuantizaciones bajas: Q2_K y Q3_K degradan de forma notable la calidad, especialmente en tareas de codigo donde la precision de sintaxis es critica. Para uso real se recomienda Q4_K_M o superior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct-heretic GGUF (mradermacher) | 1,54 B | No declarado en el repo (32.768 tokens en la familia base) | Apache 2.0 | GGUF (12 cuantizaciones) | Variante sin filtros de rechazo; sin benchmarks publicados; 0 descargas |
| Qwen2.5-Coder-1.5B-Instruct (Qwen) | 1,54 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | safetensors | Modelo original con alineacion intacta; benchmarks publicados por Qwen |
| DeepSeek-Coder-1.3B-Instruct | 1,3 B | 16.384 tokens | Licencia DeepSeek (uso comercial permitido) | safetensors, GGUF en terceros | Alternativa de codigo de tamano similar; comunidad de cuantizaciones mas amplia |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | safetensors, GGUF | Modelo generalista, no especializado en codigo; contexto mucho mayor |

Los datos de los modelos comparados proceden de sus fichas publicas y no se han verificado en esta busqueda; conviene contrastarlos antes de tomar decisiones de produccion. El repositorio de mradermacher no publica comparaciones propias.

## Limitaciones y advertencias

- Modelo abliterated: se ha suprimido la direccion de rechazo del checkpoint original. Esto degrada la seguridad del modelo y aumenta de forma significativa la probabilidad de generar contenido ofensivo, violento, sexual o ilegal si se le solicita. No es adecuado para aplicaciones orientadas al publico general sin una capa de filtrado externa.
- La abliteracion tambien puede degradar la coherencia general y la calidad en tareas tecnicas: al alterar activaciones internas, es habitual que el modelo cometa mas errores de formato y pierda adherencia a instrucciones que el original.
- Alucinacion: como cualquier modelo de 1,5 B, tiende a inventar APIs, nombres de funciones y fragmentos de codigo plausibles pero incorrectos. Todo codigo generado debe pasar por revision y pruebas automatizadas.
- Contexto limitado respecto a alternativas actuales: aunque la contencion de la familia base permite ventanas largas, un modelo de 1,5 B pierde precision en contextos extensos y en tareas que requieren razonamiento multi-paso.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior, especialmente en codigo con identificadores o comentarios en espanol.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada de esta cuantizacion concreta, ni del checkpoint heretic intermedio. No se puede afirmar que rinda como el Qwen2.5-Coder-1.5B-Instruct original.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero no incluye garantia alguna ni indemnizacion por propiedad intelectual. El contenido que genere el modelo sin filtros de rechazo es responsabilidad exclusiva del operador.
- Sin soporte declarado de tool calling ni de agentes: no conviene integrarlo como motor de function calling sin validacion previa.
- Madurez del repositorio: 0 descargas y 0 "me gusta" en el momento de la consulta, sin issues ni validacion de terceros. Conviene verificar el hash de los ficheros antes de desplegarlos.
- La fecha de creacion del repositorio aparece como 2026-09-11 en los metadatos, posterior a la fecha habitual del modelo base; se reproduce tal cual aparece en la fuente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-GGUF
- Modelo base (checkpoint heretic): https://huggingface.co/saidutta69/Qwen2.5-Coder-1.5B-Instruct-heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct/blob/main/LICENSE
- Cuantizaciones ponderadas imatrix (i1): https://huggingface.co/mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-i1-GGUF
- Indice y lista de descargas del autor: https://hf.tst.eu/model#Qwen2.5-Coder-1.5B-Instruct-heretic-GGUF
- Peticiones de modelos y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa que cede los recursos al autor): https://www.nethype.de/
- Informe tecnico de la familia Qwen2.5-Coder (referencia externa, no incluida en la model card): https://arxiv.org/abs/2409.12186

Nota sobre la busqueda web: los resultados obtenidos corresponden a articulos sobre recuento de valores duplicados en Excel y no guardan relacion con este modelo, por lo que no se han incluido.
