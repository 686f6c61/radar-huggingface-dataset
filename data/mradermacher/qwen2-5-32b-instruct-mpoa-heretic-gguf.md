# mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-MPOA-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic, publicada por mradermacher. El modelo subyacente parte de Qwen2.5-32B-Instruct, un transformer denso de 32.763.876.352 parametros desarrollado por Alibaba Qwen, y le aplica una tecnica de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) que da lugar a una variante sin censura ("heretic", "uncensored", "decensored"). El resultado es un modelo de chat que conserva la arquitectura y capacidades del original pero elimina parte de los mecanismos de rechazo aprendidos durante el alineamiento.

La relevancia de esta ficha radica en que combina tres elementos: el rendimiento de un modelo denso de 32B de la familia Qwen2.5, la posibilidad de ejecutarlo en hardware de consumo gracias a las cuantizaciones GGUF (desde Q2_K de 12,4 GB hasta Q8_0 de 34,9 GB), y un comportamiento desinhibido que lo hace atractivo para investigacion sobre alineamiento, red teaming y generacion de contenido sin filtros. La licencia Apache 2.0 heredada del modelo base permite uso comercial, aunque con las advertencias propias de un modelo abliterado.

El repositorio incluye 8 cuantizaciones estaticas (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0), sin variantes imatrix ponderadas en el momento de la publicacion. El autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles por su parte y que pueden solicitarse mediante una discusion en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun la model card; el modelo base Qwen2.5 soporta multiples idiomas, pero esta ficha declara solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer denso de 32B parametros de la familia Qwen2.5 de Alibaba. Sobre esa base, richardyoung aplico una tecnica de abliteration (denominada "heretic" y "MPOA" en el nombre del modelo) que identifica y elimina las direcciones de activacion asociadas al rechazo de peticiones, reduciendo la tendencia del modelo a negarse a responder. El autor etiqueta el proceso como "reproducible", lo que sugiere que el pipeline de abliteration esta documentado o es replicable, aunque los detalles concretos del metodo (numero de capas intervenidas, dataset de calibracion, hiperparametros) no estan disponibles en la informacion proporcionada.

La model card de esta ficha (la del repositorio GGUF) no documenta el proceso de entrenamiento del modelo base ni del abliterado: no se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO adicional tras la abliteration. Tampoco se detalla si la abliteration se aplico solo a nivel de pesos o si se realizo un ajuste fino posterior. Lo unico verificable es que el resultado es un GGUF estatico convertido desde el checkpoint HF del modelo abliterado, con cuantizaciones generadas mediante el pipeline habitual de mradermacher (convert_type: hf, output_tensor_quantised: 1).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matematicas: el modelo base Qwen2.5-32B-Instruct destaca en tareas de razonamiento y resolucion de problemas, capacidades que se conservan tras la abliteration (aunque pueden degradarse ligeramente).
- Generacion de codigo: el modelo base tiene buen rendimiento en lenguajes de programacion populares; esta capacidad se mantiene.
- Comportamiento sin censura ("uncensored", "decensored", "abliterated"): menor tendencia a rechazar peticiones que el modelo original.
- Soporte de tool calling / function calling: heredado del modelo base Qwen2.5-Instruct, que lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: el modelo base esta disenado para ello; no se documenta en esta ficha si la abliteration afecta a esta capacidad.
- Capacidades multilingues: la model card declara solo "en"; el modelo base Qwen2.5 soporta multiples idiomas, pero no se garantiza en esta variante.
- No se documentan capacidades de vision, audio ni modo "thinking" en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y abliteration: el modelo sirve como caso de estudio para analizar como la eliminacion de direcciones de rechazo afecta al comportamiento, comparando respuestas con el Qwen2.5-32B-Instruct original en un mismo conjunto de prompts.
- Red teaming y evaluacion de seguridad: util para generar respuestas que un modelo alineado rechazaria, permitiendo a equipos de seguridad probar clasificadores y filtros de contenido en pipelines de moderacion.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas sensibles, donde el modelo alineado impondria restricciones; adecuado por su ventana de contexto heredada y su tamano de 32B.
- Despliegue local en hardware de consumo: con la cuantizacion Q4_K_M (20,0 GB) puede ejecutarse en una GPU de 24 GB (RTX 3090/4090) o en configuracion CPU+GPU con llama.cpp, lo que permite experimentar con un modelo de 32B sin infraestructura de datacenter.
- Chat conversacional autoalojado: su tamano y licencia Apache 2.0 permiten montar un asistente conversacional privado en una estacion de trabajo, sin depender de APIs externas.
- Generacion de datos sinteticos para entrenamiento: al no rechazar peticiones, puede generar pares pregunta-respuesta sobre temas que otros modelos filtran, utiles para aumentar datasets de entrenamiento o de evaluacion.
- Analisis de texto y resumen en ingles: tareas estandar de NLP que el modelo base resuelve bien y que la abliteration no deberia degradar de forma significativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q3_K_M ~16,0 GB; Q3_K_L ~17,3 GB; Q4_K_S ~18,9 GB; Q4_K_M ~20,0 GB; Q6_K ~27,0 GB; Q8_0 ~34,9 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M con contexto moderado; A100 40 GB o H100 para Q6_K/Q8_0 con contexto largo; multiples GPU o CPU+GPU para las cuantizaciones mayores.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M y contexto limitado; Q6_K y Q8_0 requieren 32 GB o mas (A100 40 GB, RTX 6000 Ada, o reparto entre GPU y RAM).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF), TGI (con soporte GGUF). El repo incluye la etiqueta "endpoints_compatible".
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct-MPOA-heretic-GGUF (este) | 32,76B | no disponible | Apache 2.0 | Abliterado, sin censura, GGUF |
| Qwen2.5-32B-Instruct (original) | 32,76B | no disponible en esta ficha | Apache 2.0 | Alineado, con rechazo a peticiones sensibles |
| richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic | 32,76B | no disponible | Apache 2.0 | Modelo base de esta cuantizacion, en safetensors |
| Otras variantes abliteradas de Qwen2.5-32B | no disponible | no disponible | Apache 2.0 | Existen en el ecosistema, pero no se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La abliteration elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ofensivo o ilegal; no es apto para despliegues publicos sin moderacion adicional.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 32B; la abliteration no lo reduce y podria aumentarlo al eliminar respuestas de cautela.
- La model card declara solo ingles; el rendimiento multilingue del modelo base puede no conservarse o no estar garantizado en esta variante.
- Degradacion potencial de capacidades: la abliteration puede afectar negativamente a tareas de razonamiento, codigo o instruccion, aunque no se documenta el alcance en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado; conviene revisar las condiciones del modelo base Qwen2.5-32B-Instruct.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q6_K para calidad alta.
- No hay cuantizaciones imatrix ponderadas disponibles en el momento de la publicacion, lo que limita la calidad de las cuantizaciones bajas respecto a variantes ponderadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion comunitaria del comportamiento del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-MPOA-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
