# mradermacher/CORe-Pico-4-GGUF

## Resumen

CORe-Pico-4-GGUF es la versión cuantizada en formato GGUF del modelo OpenCOReTechnologies/CORe-Pico-4, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a cuantizaciones de llama.cpp (Q2_K a f16) pensada para su ejecución en local con herramientas como llama.cpp, Ollama o LM Studio. El repositorio contiene las 12 variantes de cuantización generadas a partir del modelo base y no incluye pesos en safetensors.

El modelo base es un causal language model de tipo decoder-only, con 1.720.574.976 parámetros (aproximadamente 1,72 mil millones), según los datos de safetensors del repositorio base, y está etiquetado como conversacional y con soporte únicamente para inglés. La licencia declarada es Apache 2.0. La model card publicada por el cuantizador no aporta información sobre arquitectura interna, datos de entrenamiento, longitud de contexto ni proceso de alineación, por lo que esos apartados quedan como no disponibles en esta ficha.

Su relevancia es práctica más que arquitectónica: al situarse en el rango de 1,7 B de parámetros y ofrecer cuantizaciones que van de 0,9 GB a 3,5 GB, es un candidato para inferencia en hardware muy modesto, incluido CPU y equipos de gama de entrada, cuando se necesita un modelo conversacional en inglés con licencia permisiva. Se debe tener en cuenta que el repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (inferido de la etiqueta `causal-lm` de la model card; la arquitectura interna no se detalla) |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (12 archivos); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 16,0 GB (suma de todas las cuantizaciones) |
| Tamano por cuantizacion | f16: 3,5 GB; Q8_0: 1,9 GB; Q6_K: 1,5 GB; Q5_K_M: 1,4 GB; Q5_K_S: 1,3 GB; Q4_K_M: 1,2 GB; Q4_K_S: 1,2 GB; IQ4_XS: 1,1 GB; Q3_K_L: 1,1 GB; Q3_K_S: 1,0 GB; Q3_K_M: 1,0 GB; Q2_K: 0,9 GB |
| Cuantizador | mradermacher (nethype GmbH), `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` |
| Cuantizaciones ponderadas / imatrix | No disponibles en el momento de la publicacion |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base mas alla de las etiquetas `transformers`, `text-generation` y `causal-lm`, que apuntan a un transformer decoder-only autorregresivo. No se detallan el numero de capas, la dimension oculta, el tipo de atencion (completa, lineal o hibrida), ni si emplea componentes de tipo MoE, SSM o atencion por ventanas. Tampoco se indica la longitud de contexto soportada.

Respecto al entrenamiento, la model card del cuantizador no incluye informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la tokenizacion ni si hubo fases de RLHF, DPO o ajuste con instrucciones. El unico dato tecnico aportado por el repositorio es el proceso de cuantizacion: conversion desde pesos en formato HuggingFace (`convert_type: hf`) y generacion de cuantizaciones estaticas (no ponderadas con imatrix) en version 2 del cuantizador. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modo de razonamiento, etc.).

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado como `text-generation` y `causal-lm`, por lo que su funcion principal es la continuacion y generacion de texto.
- Uso conversacional: la etiqueta `conversational` indica que el modelo base esta orientado a dialogos de tipo chat, si bien no se especifica el formato de plantilla de mensajes.
- Informacion no documentada: no hay datos en la model card sobre soporte de function calling o tool calling, uso como agente, razonamiento multi-paso, modo de pensamiento explicito, capacidades de vision, audio, matemáticas o generacion de codigo.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Ventana de contexto: no disponible, por lo que no se puede afirmar soporte de conversaciones largas ni de documentos extensos.

## Casos de uso

- Asistente conversacional local en ingles: con cuantizaciones Q4_K_M o Q5_K_S de 1,2-1,3 GB, el modelo se puede ejecutar en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que permite disponer de un chat sin conexion y sin enviar datos a terceros.
- Prototipado rapido de aplicaciones de chat: al tener licencia Apache 2.0 y un peso reducido, sirve como modelo de pruebas para validar interfaces, plantillas de prompt y flujos de conversacion antes de migrar a un modelo mayor.
- Generacion de texto a escala en pipelines por lotes: su tamano permite procesar grandes volumenes de entradas (por ejemplo, catalogos o descripciones) en CPU, siempre que las tareas sean de generacion corta y no requieran razonamiento complejo.
- Clasificacion y etiquetado de texto mediante prompt: se puede usar para asignar categorias, sentimiento o intencion en textos en ingles, aprovechando el bajo coste de inferencia de una cuantizacion Q4 o Q5; requeriria validacion empirica porque no hay benchmarks publicados.
- Base para ajuste fino ligero: sus 1,72 B de parametros permiten tecnicas como LoRA en una GPU de consumo (por ejemplo, 12-24 GB de VRAM), usando el modelo base en safetensors y exportando despues a GGUF para despliegue.
- Componente de sistemas en el borde (edge) o dispositivos embebidos: la cuantizacion Q2_K de 0,9 GB abre la puerta a despliegues en dispositivos con memoria limitada, asumiendo la perdida de calidad asociada a 2 bits.
- Generacion de texto auxiliar en aplicaciones de escritorio: por ejemplo, autocompletado o sugerencias de redaccion en ingles dentro de una aplicacion ofimatica, ejecutadas en local sin dependencia de API externa.
- Experimentacion academica en eficiencia de inferencia: comparar las 12 cuantizaciones disponibles (de Q2_K a f16) permite estudiar el compromiso entre tamano, velocidad y calidad en un modelo de ~1,7 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni los resultados de busqueda aportados incluyen cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de evaluaciones de perplexidad. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB con Q2_K, 1,2 GB con Q4_K_M, 1,5 GB con Q6_K, 1,9 GB con Q8_0 y 3,5 GB con f16, segun los tamanos de archivo publicados. A estas cifras hay que sumar la memoria del cache KV, cuyo tamano depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones de 4 bits y superiores; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes y quedaran limitadas por otros factores. Para f16 basta una GPU de 6 GB o mas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos anos, y en muchas integradas con memoria unificada. Las cuantizaciones de 4 bits son las recomendadas por el autor para velocidad y tamano.
- CPU y dispositivos de bajos recursos: es viable la inferencia exclusiva en CPU con llama.cpp, asi como en placas tipo Raspberry Pi, usando cuantizaciones Q4 o inferiores. No se dispone de cifras concretas de tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo base en safetensors, que no esta incluido en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos alternativos proceden de sus fichas publicas y no han sido verificados en la busqueda realizada. No se incluye comparacion de rendimiento porque CORe-Pico-4 no tiene benchmarks publicados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|
| CORe-Pico-4 (base de esta ficha) | 1,72 B | No disponible | Apache 2.0 | Si, 12 cuantizaciones (este repositorio) |
| Qwen2.5-1.5B | 1,54 B | 32.768 tokens | Apache 2.0 | Si, ampliamente disponible |
| Llama-3.2-1B | 1,23 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Si, ampliamente disponible |
| Gemma 2 2B | 2,61 B | 8.000 tokens | Terminos de uso de Gemma | Si, ampliamente disponible |

Diferencias destacables: CORe-Pico-4 ofrece un rango de cuantizaciones mas amplio que la mayoria de alternativas de su tamano, pero carece de informacion publica sobre contexto, datos de entrenamiento y rendimiento. Qwen2.5-1.5B y Llama-3.2-1B tienen contextos declarados muy superiores y licencias conocidas, con Llama-3.2 sujeto a condiciones adicionales de uso comercial. Gemma 2 2B es mas grande y tambien esta sujeto a terminos propios.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna evaluacion publicada de calidad, razonamiento o codigo, por lo que no se puede recomendar su uso en produccion sin una validacion propia.
- Falta de documentacion del modelo base: se desconoce la composicion del dataset de entrenamiento, el numero de tokens vistos, el proceso de alineacion y la arquitectura exacta, lo que impide evaluar riesgos de sesgo de forma informada.
- Sesgos: no documentados, pero al no conocerse los datos de entrenamiento no se puede descartar la presencia de sesgos de genero, raza, religion u otros, ni de contenido inapropiado.
- Riesgo de alucinacion: con 1,72 B de parametros, la tasa de alucinacion y de errores factuales es previsiblemente alta en tareas de conocimiento, aunque no existen mediciones que lo cuantifiquen.
- Limitacion idiomatica: el modelo solo declara ingles. El uso en castellano no esta soportado ni validado.
- Contexto desconocido: al no documentarse la ventana de contexto, no se deben asumir conversaciones largas ni procesamiento de documentos extensos sin probarlo empiricamente.
- Cuantizaciones agresivas: las variantes Q2_K, Q3_K_S y Q3_K_M implican una perdida de calidad notable, reconocida por el propio autor en las notas de la tabla de cuantizaciones (Q3_K_M marcada como "lower quality"). Para produccion se recomienda Q5 o superior.
- Adopcion nula registrada: el repositorio figura con 0 descargas y 0 likes en la informacion consultada, por lo que no existe retroalimentacion de la comunidad.
- Licencia: el modelo base y esta version cuantizada declaran Apache 2.0, lo que en principio permite uso comercial. No obstante, al no estar documentado el origen de los datos de entrenamiento, es responsabilidad del usuario verificar que no existan reclamaciones de terceros sobre el contenido usado para entrenar el modelo base.
- Sin cuantizaciones ponderadas: no hay variantes imatrix, lo que suele implicar una calidad ligeramente inferior en los niveles bajos de bits respecto a cuantizaciones calibradas con un dataset de calibracion.
- Formatos no incluidos: el repositorio solo contiene GGUF; para entrenamiento o para vLLM/TGI hay que acudir al modelo base en safetensors.

## Enlaces

- Repositorio GGUF de esta ficha: https://huggingface.co/mradermacher/CORe-Pico-4-GGUF
- Modelo base: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-4
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#CORe-Pico-4-GGUF
- Solicitudes de modelos y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de archivos GGUF y concatenacion multiparte (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplexidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo; los resultados devueltos correspondian a listados de Google Maps sin relacion con CORe-Pico-4.
