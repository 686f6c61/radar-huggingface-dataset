# mradermacher/Qwen3-4B-Thinking-heretic-GGUF

## Resumen

Qwen3-4B-Thinking-heretic-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo saidutta69/Qwen3-4B-Thinking-heretic, publicadas por el usuario mradermacher (nethype GmbH). El modelo subyacente es una variante "heretic" (abliterated, decensored) de la familia Qwen3-4B-Thinking-2507, es decir, un transformer denso de 4.022.468.096 parametros (4,02 B) al que se le ha aplicado un proceso de ablation direccional para eliminar las direcciones de rechazo del espacio de activaciones, reduciendo asi las negativas del modelo ante peticiones que el modelo original rechazaria.

La relevancia practica de esta publicacion es doble. Por un lado, ofrece el modelo en 12 niveles de cuantizacion GGUF (desde Q2_K de 1,8 GB hasta f16 de 8,2 GB), lo que permite ejecutarlo en GPU de consumo e incluso en equipos con poca VRAM. Por otro, el proceso "heretic" esta etiquetado como reproducible, lo que lo hace interesante para investigadores que estudian tecnicas de alineacion, robustez de rechazo y comportamiento de modelos abliterated.

El repositorio no incluye model card propia mas alla de una tabla de cuantizaciones y notas de uso genericas: no se documentan datos de entrenamiento, contexto, benchmarks ni detalles del procedimiento de abliteration aplicado. La licencia declarada es Apache 2.0 y los idiomas soportados son ingles y chino. Con 54 descargas y 0 likes en el momento de la consulta, se trata de una publicacion reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, variante con modo "thinking"). Detalles especificos no disponibles |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 (12 archivos GGUF) |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 (con enlace a la licencia de Qwen/Qwen3-4B-Thinking-2507) |
| Formato de pesos | GGUF (un unico tipo de archivo en el repositorio) |
| Cuantizado por | mradermacher (nethype GmbH) |
| Modelo base | saidutta69/Qwen3-4B-Thinking-heretic |
| Tamano del repositorio | 36,4 GB |
| Descargas / likes | 54 / 0 |
| Fecha de publicacion | 14 de octubre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

No se proporcionan datos sobre la arquitectura mas alla de la identificacion del modelo base y de las etiquetas del repositorio (qwen3, qwen3-4b, thinking, reasoning, math, coding, tool-calling). Por herencia del modelo base, se trata de un transformer denso de 4,02 B de parametros con modo de razonamiento explicito ("thinking"). No hay informacion sobre numero de capas, dimension oculta, cabezas de atencion, tipo de atencion ni sobre el mecanismo exacto de thinking.

Tampoco se documenta el proceso de entrenamiento: no se indica el volumen de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion. La innovacion tecnica declarada es la propia cadena de transformacion del modelo: el autor del modelo base aplico un procedimiento "heretic" (abliteration, decensored) etiquetado como reproducible, y mradermacher realizo posteriormente la conversion a GGUF (convert_type: hf) y la cuantizacion estatica (quantize_version: 2). Existe ademas un repositorio separado con cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta explicita de conversational y roleplay en el repositorio.
- Razonamiento con modo thinking: el modelo expone una fase de razonamiento antes de la respuesta final (etiquetas reasoning y thinking).
- Matematicas y codigo: el repositorio declara competencia en math y coding, heredada del modelo base Qwen3-4B-Thinking.
- Tool calling / function calling: etiqueta tool-calling presente en el modelo base y en la ficha.
- Reduccion de rechazos: al ser una variante abliterated/decensored, responde a peticiones que el modelo alineado original rechazaria.
- Multilingue limitado a ingles y chino (en, zh) segun los metadatos; el castellano no figura como idioma soportado.
- Ejecucion local en GPU de consumo: el repositorio incluye la etiqueta consumer-gpu y cuantizaciones de 1,8 GB en adelante.
- Compatibilidad con endpoints: etiqueta endpoints_compatible en los metadatos.

No hay informacion sobre capacidades de vision, audio, decodificacion especulativa ni modos de razonamiento configurables (por ejemplo, presupuestos de tokens de pensamiento).

## Casos de uso

- Roleplay y escritura creativa sin filtros: el proceso de abliteration elimina las negativas del modelo alineado, lo que permite sostener narrativas con contenido adulto, violento o moralmente ambiguo en conversaciones multi-turno. Es el caso de uso mas directamente alineado con las etiquetas roleplay y uncensored del repositorio.
- Asistente local en equipos sin conexion: con la cuantizacion Q4_K_M (2,6 GB) el modelo cabe en practicamente cualquier GPU de consumo, lo que permite desplegar un asistente conversacional en un portatil o en un equipo air-gapped sin enviar datos a terceros.
- Generacion de codigo en entorno local: las etiquetas coding y tool-calling permiten integrarlo en flujos de autocompletado, generacion de tests o revision de parches dentro de un IDE, ejecutado sobre llama.cpp u Ollama.
- Investigacion sobre alineacion y abliteration: al estar etiquetado como reproducible, sirve como material para medir cuanto se degradan las capacidades del modelo tras eliminar las direcciones de rechazo, comparandolo con el Qwen3-4B-Thinking-2507 original.
- Atencion al cliente automatizada en ingles o chino: el modelo puede gestionar conversaciones multi-turno y llamadas a funciones (consultas a bases de datos, gestion de tickets) sin los rechazos que introduciria un modelo alineado ante consultas legitimas pero sensibles (reclamaciones, contenido medico o legal).
- Evaluacion de robustez de sistemas de moderacion: permite comprobar si un clasificador de contenido o un guardrail externo detecta las respuestas de un modelo abliterated, un escenario habitual en equipos de seguridad.
- Chat de bajo consumo en produccion: con cuantizaciones de 2,0-2,6 GB se puede servir en instancias pequenas con varias replicas por GPU, lo que abarata el coste por token frente a modelos de 7B o 14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente incluye una tabla de cuantizaciones y un grafico externo de comparacion de perplejidad entre tipos de cuantizacion (enlace en la seccion de enlaces). No se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (archivo + cache KV y overhead, valores orientativos): Q2_K ~2,5-3 GB; Q3_K_S ~2,8-3,3 GB; IQ4_XS ~3,2-3,8 GB; Q4_K_S ~3,3-4 GB; Q4_K_M ~3,5-4,2 GB; Q5_K_M ~4-4,7 GB; Q6_K ~4,5-5,2 GB; Q8_0 ~5,5-6,5 GB; f16 ~9,5-11 GB. El consumo real depende de la longitud de contexto configurada y del backend.
- GPU recomendadas por rango: Q4_K_M en RTX 3060 12 GB, RTX 4060 8 GB, RTX 3050 8 GB o iGPU con memoria unificada; Q8_0 en RTX 4070, RTX 4070 Ti o superiores; f16 en RTX 4080/4090, A100 o H100 (aunque resulta innecesaria para un modelo de 4 B).
- Cabe en GPU de consumo: si. Con cuantizaciones Q4 y Q5 es viable incluso en GPU de 6-8 GB, y con Q2_K/Q3_K en equipos de 4 GB. El repositorio incluye la etiqueta consumer-gpu de forma explicita.
- Apple Silicon: las cuantizaciones Q4_K_M y Q5_K_M son adecuadas para equipos con memoria unificada de 8 GB o superior mediante llama.cpp o LM Studio.
- Opciones de despliegue: llama.cpp (backend de referencia para GGUF), Ollama, LM Studio, KoboldCpp, text-generation-webui, llama-cpp-python y servidores compatibles con la API de OpenAI. El soporte de GGUF en vLLM es parcial y no cubre todas las variantes de cuantizacion.
- Formato y particionado: los archivos se sirven como ficheros unicos por cuantizacion (no se indica particionado multi-parte en la tabla de la model card); para concatenar archivos multi-parte, el autor remite a los README de TheBloke.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Thinking-heretic-GGUF (este modelo) | 4,02 B | no disponible | 12 estaticas (Q2_K a f16) | apache-2.0 | Cuantizacion estatica; 54 descargas |
| Qwen3-4B-Thinking-heretic-i1-GGUF | 4,02 B (mismo modelo base) | no disponible | Cuantizaciones ponderadas con imatrix | apache-2.0 | Mismo autor; suele ofrecer mejor perplejidad por tamano que las estaticas |
| Qwen3-4B-Thinking-2507 (original) | ~4 B (no confirmado en la informacion disponible) | no disponible | safetensors y otras | Apache 2.0 (enlace de licencia referenciado) | Modelo alineado de Qwen; conserva los rechazos que la variante heretic elimina |
| Qwen3-4B-2507-Thinking-heretic-abliterated-uncensored-GGUF | ~4 B (no confirmado) | no disponible | GGUF | apache-2.0 | Variante equivalente del mismo autor, con nomenclatura explicita de abliteration; no se dispone de comparativa de rendimiento |
| Qwen3.5-4B-heretic-GGUF | no disponible | no disponible | GGUF | apache-2.0 | Version de la generacion Qwen3.5, tambien cuantizada por mradermacher; no se dispone de datos comparativos |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real entre estas variantes; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Contenido sin filtros: el proceso heretic/abliteration reduce deliberadamente los rechazos, por lo que el modelo puede generar contenido danino, ilegal, violento o sexualmente explicito. No es adecuado para aplicaciones orientadas al publico sin un guardrail externo.
- Degradacion potencial: la ablation direccional puede afectar a la coherencia, al seguimiento de instrucciones y al rendimiento en tareas de razonamiento. No se han publicado evaluaciones que cuantifiquen este efecto en esta variante concreta.
- Alucinacion: con 4,02 B de parametros, la tasa de invencion de hechos es previsiblemente alta en tareas de conocimiento factual y de contexto largo. No se aportan mediciones.
- Idiomas: los metadatos solo declaran ingles y chino. El rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la longitud de contexto no se documenta en la informacion disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Licencia: el repositorio declara apache-2.0, pero la model card enlaza a la licencia de Qwen/Qwen3-4B-Thinking-2507. Conviene revisar ambas antes de un uso comercial, y tener en cuenta que el modelo no es una publicacion oficial de Qwen.
- Trazabilidad limitada: el autor del modelo base (saidutta69) no aporta detalles verificables sobre el dataset de abliteration ni sobre las metricas de exito del proceso.
- Validacion escasa: 54 descargas y 0 likes. No hay evaluaciones independientes, y el repositorio tiene 36,4 GB, con lo que la descarga completa de todas las cuantizaciones es costosa en disco.
- Modo thinking: el razonamiento explicito incrementa el numero de tokens generados, lo que encarece la inferencia y aumenta la latencia frente a un modelo sin modo pensamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-4B-Thinking-heretic-GGUF
- Modelo base: https://huggingface.co/saidutta69/Qwen3-4B-Thinking-heretic
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/Qwen3-4B-Thinking-heretic-i1-GGUF
- Pagina de vision general del modelo y listado de descargas: https://hf.tst.eu/model#Qwen3-4B-Thinking-heretic-GGUF
- Licencia referenciada (Qwen3-4B-Thinking-2507): https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para el uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH: https://www.nethype.de/
- Variante equivalente con nomenclatura explicita de abliteration: https://huggingface.co/mradermacher/Qwen3-4B-2507-Thinking-heretic-abliterated-uncensored-GGUF
- Variante con cuantizacion imatrix de la anterior: https://huggingface.co/mradermacher/Qwen3-4B-2507-Thinking-heretic-abliterated-uncensored-i1-GGUF
- Variante sobre Qwen3.5-4B: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Variante Apollo (referencia externa): https://dev.modelhub.org.cn/mradermacher/Qwen3-4B-Apollo-V0.1-4B-Thinking-Heretic-Abliterated-GGUF
