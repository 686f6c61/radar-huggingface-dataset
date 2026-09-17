# mradermacher/glm-4-9b-chat-hf-OBLITERATED-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo OBLITERATUS/glm-4-9b-chat-hf-OBLITERATED, publicadas por el usuario mradermacher, especializado en la conversion de pesos a formato GGUF para inferencia local. Se trata de un artefacto derivado: no es un modelo entrenado desde cero, sino una version "abliterated" (con las direcciones de rechazo eliminadas de los pesos) del modelo GLM-4-9B-chat en su variante HuggingFace, posteriormente cuantizada a distintos niveles de precision para su uso con llama.cpp y herramientas compatibles.

El modelo cuenta con 9.399.951.360 parametros (aproximadamente 9,4 mil millones), segun los datos de safetensors del repositorio, y se distribuye en ocho archivos GGUF que van desde Q2_K (4,1 GB) hasta f16 (18,9 GB). La etiqueta de libreria declarada es transformers, aunque el formato de pesos real es GGUF, lo que implica que la via de despliegue practica es llama.cpp y sus derivados, no el stack estandar de PyTorch.

Su relevancia actual es acotada y muy especifica: cubre el nicho de modelos de ~9B sin censura aplicada sobre la alineacion de seguridad, orientado a investigacion de seguridad, generacion de datos sinteticos y escritura creativa sin friccion. El repositorio no tiene descargas ni likes registrados, no declara licencia y no incluye evaluaciones, por lo que debe considerarse un artefacto de comunidad sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (la denominacion indica que deriva de GLM-4-9B-chat, de tipo transformer decoder-only) |
| Parametros totales | 9.399.951.360 (~9,4B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS y f16 (segun lista de tags; los archivos con enlace publicado en la model card son Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q8_0 y f16) |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible |
| Formato de pesos | GGUF (repo de 86,8 GB en total, suma de todas las cuantizaciones) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF, DPO u otras). Lo unico documentado es el pipeline de derivacion: se parte de OBLITERATUS/glm-4-9b-chat-hf-OBLITERATED, que a su vez es una modificacion de un modelo GLM-4-9B-chat en formato HuggingFace, y sobre esa base mradermacher ha generado cuantizaciones estaticas. Las cuantizaciones ponderadas o con imatrix no estan disponibles segun la propia model card, y el autor indica que probablemente no las planifique salvo peticion en la seccion de discusiones.

La innovacion tecnica relevante no esta en la arquitectura, sino en el procedimiento de abliteration, que consiste en identificar y neutralizar en el espacio de pesos las direcciones asociadas a respuestas de rechazo, de modo que el modelo deja de activar comportamientos de negativa ante determinadas peticiones. Este proceso se aplica antes de la cuantizacion y afecta a todos los archivos del repositorio. No se documentan en la informacion disponible ni la metodologia exacta de la abliteration, ni el numero de capas o componentes modificados, ni evaluaciones del impacto que ese proceso tiene sobre las capacidades generales del modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base GLM-4-9B-chat.
- Generacion de respuestas con menor tasa de rechazos ante peticiones que un modelo alineado convencional rechazaria, como consecuencia de la abliteration.
- Razonamiento general y respuesta a instrucciones en registro conversacional (la model card no aporta evidencias cuantitativas).
- Escritura creativa y de ficcion sin filtros de contenido aplicados en los pesos.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idioma declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Ejecucion local en CPU y GPU mediante el formato GGUF, con soporte de offload parcial de capas.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo sirve como sujeto de estudio para comparar el comportamiento de un modelo base frente a su version abliterated, midiendo como varia la tasa de rechazos y si se degradan capacidades como el razonamiento o el seguimiento de instrucciones. Es util precisamente porque ambas versiones comparten el mismo origen.
- Red teaming y evaluacion de filtros: generar prompts adversarios y respuestas candidatas para probar clasificadores de contenido, moderadores o sistemas de guardrails en un entorno controlado y aislado.
- Generacion de datos sinteticos para dominios sensibles: producir corpus de dialogo en ingles sobre temas que los modelos alineados rechazan sistematicamente (ficcion oscura, criminologia, debates eticos), evitando los sesgos de rechazo que introducen los modelos censurados en los datasets.
- Escritura creativa y narrativa adulta: redaccion de ficcion con violencia o contenido explicito sin interrupciones ni reformulaciones del modelo, con la cuantizacion Q8_0 o f16 para preservar matices estilisticos.
- Asistentes conversacionales en ingles con filtrado externo: desplegar el modelo como motor de generacion detras de una capa de moderacion propia, de modo que el control de contenido se gestione en la aplicacion y no en los pesos, lo que da control total sobre la politica aplicada.
- Despliegue local en equipos de gama media: la cuantizacion Q4_K_M (6,3 GB) permite ejecutar el modelo en una GPU consumer con 8 GB de VRAM o incluso en CPU con RAM suficiente, util para prototipado offline sin coste de API.
- Experimentacion con llama.cpp y comparativas de cuantizacion: dado que el repositorio publica ocho niveles de cuantizacion del mismo modelo, es un banco de pruebas practico para medir la degradacion de perplejidad y calidad entre Q2_K y Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y el autor solo referencia un grafico externo generico sobre perplejidad relativa entre tipos de cuantizacion, sin cifras asociadas a este modelo concreto. Tampoco se han encontrado resultados en la busqueda web realizada.

## Requisitos de hardware

Estimaciones de VRAM para inferencia a contexto corto (el peso de los tensores mas la cache KV, que crece con la longitud de contexto; los valores son calculos derivados de los tamanos de archivo publicados):

- Q2_K (4,1 GB): viable con 6 GB de VRAM; util en GPUs integradas o de gama baja.
- Q3_K_S / Q3_K_M / Q3_K_L (4,7-5,3 GB): 6-8 GB de VRAM.
- Q4_K_S / Q4_K_M (5,9-6,3 GB): 8 GB de VRAM recomendados; es la opcion marcada como "fast, recommended" por el autor.
- Q5_K_S / Q5_K_M (tamano no publicado en la model card): 8-10 GB de VRAM.
- Q6_K (tamano no publicado en la model card): 10-12 GB de VRAM.
- Q8_0 (10,1 GB): 12-16 GB de VRAM; marcada como "fast, best quality".
- f16 (18,9 GB): 24 GB de VRAM o mas; el autor la califica de "overkill".
- GPUs recomendadas: RTX 3060 12 GB / RTX 4060 Ti 16 GB para Q4-Q8; RTX 4090 o A100/H100 solo tienen sentido para f16 o para servir varias peticiones concurrentes.
- Cabe en GPU consumer: si, desde Q2_K hasta Q8_0 en tarjetas de 8-16 GB, y f16 en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp (referencia directa de la model card), Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM con soporte GGUF es experimental y no esta validado para este repositorio. La libreria declarada en HuggingFace es transformers, pero el formato GGUF no se carga con AutoModel sin un backend compatible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de benchmarks de este modelo no existen, por lo que la comparativa es estructural y no de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/glm-4-9b-chat-hf-OBLITERATED-GGUF | ~9,4B | No disponible | No disponible | GGUF (Q2_K a f16) | Cuantizacion de un modelo abliterated; sin evaluaciones ni licencia declarada; 0 descargas registradas |
| OBLITERATUS/glm-4-9b-chat-hf-OBLITERATED | ~9,4B | No disponible | No disponible | safetensors (presumiblemente) | Modelo origen, tambien sin licencia ni evaluaciones documentadas en la informacion proporcionada |
| GLM-4-9B-chat (modelo de partida) | ~9,4B | No disponible en la informacion proporcionada | Licencia propia de GLM-4 (consultar model card del autor original) | safetensors | Version alineada, con rechazos activos; es el referente natural para medir el efecto de la abliteration |
| Llama-3.1-8B-Instruct | 8B | 128K | Licencia comunitaria de Llama 3.1 | safetensors, GGUF (terceros) | Alternativa alineada de tamano comparable, con ecosistema de cuantizaciones amplio y evaluaciones publicas |
| Qwen2.5-7B-Instruct | ~7,6B | 128K | Apache 2.0 | safetensors, GGUF (terceros) | Alternativa alineada con licencia permisiva, habitual en despliegues de produccion |

La ventaja competitiva de este repositorio no es el rendimiento, sino la ausencia de rechazos y la disponibilidad inmediata en multiples niveles de cuantizacion. Frente a Llama-3.1-8B-Instruct o Qwen2.5-7B-Instruct, carece de licencia clara, de contexto documentado y de cualquier metrica publicada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: el repositorio no especifica licencia, lo que genera incertidumbre juridica total sobre su uso, incluido el uso comercial. Hay que remitirse a las condiciones del modelo original de GLM-4, que tampoco se detallan aqui.
- Modelo sin alineacion de seguridad: la abliteration elimina las direcciones de rechazo, por lo que el modelo puede generar contenido danino, ilegal o gravemente ofensivo sin filtro en los pesos. Requiere moderacion externa obligatoria en cualquier despliegue con usuarios finales.
- Riesgo de alucinacion: no hay evaluaciones que permitan acotarlo; en modelos de ~9B con cuantizaciones agresivas el riesgo aumenta.
- Degradacion por cuantizacion: Q2_K y Q3_K pueden producir perdidas notables de calidad. Para fidelidad al modelo original, usar Q8_0 o f16.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado ni garantizado.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de trabajo con ventanas largas o calcular el consumo de cache KV con precision.
- Impacto desconocido de la abliteration sobre las capacidades generales: no hay evaluaciones comparativas entre el modelo original y el abliterated, por lo que no puede descartarse degradacion en razonamiento, codigo o matematicas.
- Artefacto sin validacion: 0 descargas y 0 likes en el momento de la consulta. No existen informes de terceros sobre su comportamiento real.
- Repositorio de 86,8 GB: la descarga completa es costosa; conviene bajar unicamente el archivo de la cuantizacion necesaria.
- Fecha de publicacion muy reciente (17 de septiembre de 2026) y actualizacion el mismo dia, sin historial posterior de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/glm-4-9b-chat-hf-OBLITERATED-GGUF
- Modelo base en HuggingFace: https://huggingface.co/OBLITERATUS/glm-4-9b-chat-hf-OBLITERATED
- Pagina de descarga del autor para este modelo: https://hf.tst.eu/model#glm-4-9b-chat-hf-OBLITERATED-GGUF
- Pagina de peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de archivos GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del patrocinador de las cuantizaciones (nethype GmbH): https://www.nethype.de/
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a un club deportivo aleman (DJK Eintracht Allersberg) y no guardan relacion con la consulta.
