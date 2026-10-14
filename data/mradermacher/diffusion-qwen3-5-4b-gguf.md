# mradermacher/Diffusion-Qwen3.5-4B-GGUF

## Resumen

Diffusion-Qwen3.5-4B-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo summerMC/Diffusion-Qwen3.5-4B, generadas por mradermacher. Se trata de un modelo experimental de lenguaje basado en difusión enmascarada (masked diffusion / diffusion-lm) construido sobre la arquitectura Qwen3.5, con 4.205.751.296 parametros totales (aproximadamente 4,2 mil millones). El repositorio no contiene pesos originales, sino doce ficheros GGUF con distintos niveles de cuantizacion, desde Q2_K (2,0 GB) hasta f16 (8,5 GB).

La relevancia de esta publicacion es doble. Por un lado, acerca un modelo de difusion de texto a hardware de consumo: la variante Q4_K_M ocupa 2,8 GB y puede ejecutarse en GPUs con 4-6 GB de VRAM. Por otro, permite experimentar con paradigmas de generacion no autorregresivos dentro del ecosistema GGUF, que hasta hace poco estaba dominado por transformers decoder-only clasicos.

Conviene subrayar que el propio autor etiqueta el modelo como experimental y que no se ha publicado informacion sobre la longitud de contexto, el proceso de entrenamiento ni resultados de benchmarks. Ademas, el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | masked diffusion (diffusion-lm) sobre base Qwen3.5; detalles completos no disponibles |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como library_name declarada) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo subyacente utiliza un esquema de difusion enmascarada (masked diffusion) en lugar de la generacion autorregresiva token a token. En este paradigma, el modelo parte de una secuencia con tokens enmascarados y los va reconstruyendo de forma iterativa, lo que en teoria permite un acceso global al contexto durante el proceso de decodificacion. Los tags del repositorio incluyen explicitamente `masked-diffusion`, `diffusion-lm`, `qwen3.5` y `experimental`, lo que confirma que se trata de una adaptacion de la familia Qwen3.5 hacia un objetivo de difusion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o preferencia, ni sobre innovaciones tecnicas concretas del entrenamiento. El autor de la cuantizacion (mradermacher) no ha participado en el entrenamiento: su trabajo consiste en la conversion de los pesos originales a formato GGUF y la generacion de las distintas variantes de cuantizacion. Tampoco se han publicado cuantizaciones ponderadas o con imatrix para este modelo en el momento de la publicacion, segun indica la propia model card.

## Capacidades

- Generacion de texto en ingles mediante decodificacion por difusion (no autorregresiva).
- Modelo declarado como conversational, por lo que admite formato de chat multi-turno.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso detras de APIs compatibles con OpenAI.
- Capacidad de razonamiento general heredada de la base Qwen3.5: no verificada con datos publicos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Experimentacion con decodificacion por difusion: el modelo permite comparar la calidad y el comportamiento de un LM de difusion frente a un decoder autorregresivo de tamano similar, usando la misma interfaz GGUF.
- Prototipado en equipos de investigacion con recursos limitados: la variante Q4_K_M (2,8 GB) se puede ejecutar en una GPU de portatil de gama media, lo que facilita reproducir experimentos sin acceso a clústeres.
- Evaluacion de tecnicas de refinamiento iterativo: al reconstruir secuencias enmascaradas, el modelo es util para investigar estrategias de rellenado, correccion iterativa o generacion con restricciones.
- Aplicaciones de generacion de texto en ingles de baja latencia en local: para tareas de resumen o reescritura donde no se requiere contexto muy largo ni capacidades multilingues.
- Integracion como componente de investigacion en pipelines de NLP: analisis de sesgos, estudios de calibracion o comparativas de paradigmas generativos.
- Despliegue en entornos sin GPU dedicada: las cuantizaciones Q2_K y Q3_K_S (2,0-2,2 GB) permiten inferencia en CPU con llama.cpp para pruebas de concepto.
- Educacion y divulgacion tecnica: el modelo sirve para explicar de forma practica las diferencias entre generacion autorregresiva y generacion por difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco datos de perplejidad por tipo de cuantizacion mas alla del grafico generico de referencia sobre calidad relativa de cuantizaciones que enlaza el autor.

## Requisitos de hardware

Los siguientes valores son estimaciones derivadas del tamano de los ficheros publicados, asumiendo un margen de 1-2 GB para el contexto y el estado interno del runtime:

- Q2_K (2,0 GB): aproximadamente 3 GB de VRAM o RAM. Ejecutable en CPU.
- Q3_K_S / Q3_K_M / Q3_K_L (2,2-2,5 GB): aproximadamente 3,5-4 GB. Ejecutable en CPU.
- IQ4_XS (2,6 GB) y Q4_K_S / Q4_K_M (2,7-2,8 GB): aproximadamente 4-4,5 GB. Cabe en GPUs de consumo como RTX 3050 8 GB, RTX 3060 12 GB, RTX 4060 8 GB o Apple Silicon con 8 GB unificados.
- Q5_K_S / Q5_K_M (3,1-3,2 GB): aproximadamente 4,5-5 GB. Cabe en RTX 4060 8 GB y superiores.
- Q6_K (3,6 GB): aproximadamente 5,5 GB. Recomendable 8 GB de VRAM.
- Q8_0 (4,6 GB): aproximadamente 6,5 GB. Recomendable 8-12 GB de VRAM.
- f16 (8,5 GB): aproximadamente 10-11 GB. Requiere GPU de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, A100, H100).

Opciones de despliegue:

- llama.cpp, por ser el runtime nativo del formato GGUF.
- Ollama y LM Studio, que envuelven llama.cpp y simplifican la carga de los ficheros.
- llama-cpp-python para integracion en aplicaciones Python.
- vLLM y TGI: compatibilidad no confirmada para modelos de difusion; su soporte esta orientado a decoders autorregresivos.
- Al tratarse de un LM de difusion enmascarada, el bucle de decodificacion difiere del de un modelo autorregresivo; conviene verificar que la version de llama.cpp utilizada soporta este paradigma antes de desplegarlo en produccion.

No se dispone de datos de latencia ni de throughput para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Diffusion-Qwen3.5-4B-GGUF | 4,2 B | no disponible | sin benchmarks publicados | apache-2.0 | GGUF, 12 cuantizaciones |
| summerMC/Diffusion-Qwen3.5-4B (modelo base) | 4,2 B | no disponible | sin benchmarks publicados | apache-2.0 | pesos originales en transformers |
| Otros LM de difusion de texto de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

Existen otros modelos de difusion de texto enmascarada en el ecosistema abierto, pero la informacion proporcionada no incluye datos verificables sobre ellos, por lo que no se incluyen cifras comparativas que pudieran resultar inexactas. La comparativa directa mas fiable es contra el modelo base sin cuantizar, del que este repositorio es una derivacion: la diferencia esperada es una perdida de calidad creciente a medida que baja el bitrate de la cuantizacion, con Q4_K_M y Q5_K_M como los puntos de equilibrio habituales entre tamano y fidelidad.

## Limitaciones y advertencias

- Modelo marcado como experimental: no se recomienda su uso en produccion sin una evaluacion propia exhaustiva.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No se ha publicado la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- No hay benchmarks publicados: no es posible estimar su calidad frente a alternativas.
- Riesgo de alucinacion: inherente a cualquier modelo generativo, y en este caso no cuantificado por ningun estudio.
- Ausencia de informacion sobre sesgos: se desconoce la composicion del dataset de entrenamiento, por lo que no se pueden anticipar sesgos demograficos, culturales o ideologicos.
- Compatibilidad limitada en runtimes: el soporte de modelos de difusion enmascarada en llama.cpp, vLLM y TGI no esta confirmado en la informacion disponible.
- Las cuantizaciones Q2_K y Q3_K degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality".
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y las obligaciones de atribucion.
- Cero descargas y cero likes en el momento de la publicacion: no existe validacion por parte de la comunidad.
- El repositorio ocupa 38,9 GB en total, por lo que la descarga completa requiere espacio en disco considerable aunque solo se vaya a usar una cuantizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Diffusion-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/summerMC/Diffusion-Qwen3.5-4B
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#Diffusion-Qwen3.5-4B-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
