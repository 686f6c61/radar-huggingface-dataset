# mradermacher/Aureth-4B-Qwen3.5-GGUF

## Resumen

Aureth-4B-Qwen3.5-GGUF es la version cuantizada en formato GGUF del modelo OusiaResearch/Aureth-4B-Qwen3.5, publicada por el usuario mradermacher, especializado en la conversion de pesos a formatos optimizados para inferencia local. Se trata de un modelo de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) con soporte declarado de vision-lenguaje, derivado de la familia Qwen3.5 segun el nombre del modelo base, y afinado sobre corpus de tipo Hermes (Hermes-3-Dataset, hermes-function-calling-v1 y un corpus generado propio de OusiaResearch).

El problema que resuelve es el de disponer de un modelo multimodal de tamano contenido, ejecutable en hardware de consumo, con pesos ya cuantizados en una bateria amplia de formatos que van desde Q2_K (2,0 GB) hasta f16 (8,5 GB), incluyendo los ficheros mmproj necesarios para el encoder de vision. Esto lo situa en la categoria de modelos pequenos aptos para despliegue local, prototipado rapido y entornos con VRAM limitada, donde un modelo de 70B no es viable.

Su relevancia actual radica en la combinacion de tres factores: licencia Apache 2.0 (permisiva para uso comercial), soporte multimodal con quantizaciones especificas del proyector visual, y una huella de memoria que permite su ejecucion integra en GPUs de gama media e incluso en CPU. La informacion publicada no detalla la longitud de contexto, el volumen de tokens de entrenamiento ni resultados de benchmarks, por lo que esas dimensiones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo base, Qwen3.5, sugiere una arquitectura transformer derivada de Qwen3.5; sin confirmar en la informacion disponible) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (2,0 GB), Q3_K_S (2,2 GB), Q3_K_M (2,4 GB), Q3_K_L (2,5 GB), IQ4_XS (2,6 GB), Q4_K_S (2,7 GB), Q4_K_M (2,8 GB), Q5_K_S (3,1 GB), Q5_K_M (3,2 GB), Q6_K (3,6 GB), Q8_0 (4,6 GB), f16 (8,5 GB); mas mmproj-Q8_0 (0,5 GB) y mmproj-f16 (0,8 GB) para el componente multimodal. Existe tambien un repositorio aparte con cuantizaciones ponderadas con imatrix (i1) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors con library_name transformers |
| Tamano del repositorio | 39,9 GB |
| Modelo base | OusiaResearch/Aureth-4B-Qwen3.5 |
| Herramienta de cuantizacion | mradermacher, con soporte declarado de unsloth |
| Descargas / likes | 284 descargas, 2 likes |

## Arquitectura y entrenamiento

El repositorio es una publicacion de cuantizaciones estaticas del modelo OusiaResearch/Aureth-4B-Qwen3.5. El autor indica que se ha utilizado la conversion desde HuggingFace (convert_type: hf) y que la cuantizacion se ha aplicado sobre los tensores de salida (output_tensor_quantised: 1), con version de quantize 2. No se especifica en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo exacto de atencion empleado. La etiqueta vision-language-model y la existencia de ficheros mmproj confirman la presencia de un proyector multimodal que debe cargarse junto con el modelo principal para habilitar la entrada de imagenes.

En cuanto al entrenamiento, la model card del modelo base (recogida en los metadatos del repositorio) lista tres conjuntos de datos: NousResearch/Hermes-3-Dataset, OusiaResearch/Aureth-Corpus-Hermes4.3-Generated y NousResearch/hermes-function-calling-v1. Esta composicion indica un ajuste fino orientado a formato conversacional de estilo Hermes, con un componente especifico de function calling. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la mezcla proporcional de los datasets, ni sobre si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias (decodificacion especulativa, atencion lineal u otras) en el material proporcionado.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat heredado del ecosistema Hermes.
- Procesamiento de imagenes: la etiqueta vision-language-model y los ficheros mmproj-Q8_0 y mmproj-f16 confirman soporte multimodal de entrada visual, siempre que el proyector se cargue junto al modelo.
- Function calling / tool calling: el dataset hermes-function-calling-v1 forma parte del entrenamiento del modelo base, lo que apunta a soporte para invocacion de herramientas, aunque no se documenta la sintaxis exacta ni el formato recomendado.
- Razonamiento multi-paso y uso en agentes: probable por el estilo de entrenamiento, pero no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidad especial de vision: si, mediante el proyector multimodal.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente conversacional local en ingles: con cuantizaciones Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB) el modelo cabe en GPUs de 6-8 GB o incluso en CPU con 8 GB de RAM, lo que permite desplegar un chatbot privado sin enviar datos a servicios externos.
- Analisis de documentos con imagenes: gracias al proyector mmproj, se pueden pasar capturas, diagramas o fotografias junto a una pregunta de texto; es adecuado para extraccion de informacion de facturas, tickets o interfaces cuando la precision de un modelo de 4B es suficiente.
- Automatizacion con function calling: el entrenamiento sobre hermes-function-calling-v1 lo hace candidato para pipelines donde el modelo decide que herramienta invocar (consultas a API, operaciones sobre ficheros) en entornos de bajo coste.
- Generacion de codigo asistida en local: util como autocompletado o asistente en editores para equipos sin acceso a GPUs de datacenter; el formato GGUF permite integrarlo en flujos con llama.cpp sin dependencias de servidores de inferencia.
- Prototipado e investigacion con fine-tuning: el tag unsloth en el ecosistema del autor sugiere compatibilidad con flujos de ajuste eficiente; el modelo base en safetensors seria el punto de partida para LoRA o QLoRA.
- Clasificacion y enrutado de texto: al ser un modelo pequeno y rapido de cargar, es apto para tareas de etiquetado, moderacion o enrutado de consultas dentro de un sistema mayor, dejando el razonamiento complejo a un modelo de mayor tamano.
- Despliegue en el borde (edge) o en portatiles: la cuantizacion Q2_K de 2,0 GB o IQ4_XS de 2,6 GB permite ejecucion en equipos con recursos muy limitados, a costa de una perdida de calidad perceptible.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce niveles de cuantizacion distintos, lo que lo convierte en un caso practico para medir el compromiso entre tamano, velocidad y calidad antes de fijar una configuracion de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones. Tampoco se proporcionan mediciones de perplejidad especificas de este repositorio; el autor enlaza una grafica generica de comparacion de tipos de cuantizacion (elaborada por ikawrakow) que no contiene valores concretos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el fichero de pesos: Q2_K en torno a 2,0 GB; Q3_K_M en torno a 2,4 GB; IQ4_XS en torno a 2,6 GB; Q4_K_M en torno a 2,8 GB; Q5_K_M en torno a 3,2 GB; Q6_K en torno a 3,6 GB; Q8_0 en torno a 4,6 GB; f16 en torno a 8,5 GB. Hay que sumar a estas cifras el cache KV, cuyo tamano depende de la longitud de contexto, no disponible.
- Componente multimodal: anadir aproximadamente 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16) si se va a usar la entrada de imagenes.
- GPUs recomendadas por configuracion: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q8_0 y f16 con contexto amplio; RTX 4090 o A100/H100 sobredimensionadas para este tamano, utiles solo si se busca maximo throughput con muchos lotes.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 4 GB o mas puede ejecutar Q4_K_M; con 6-8 GB se puede usar Q5_K_M o Q6_K con holgura. Las cuantizaciones Q2_K y Q3_K tambien son viables en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y otros clientes compatibles con GGUF. Para vLLM o TGI habria que partir del modelo base en safetensors, ya que esas herramientas no consumen GGUF de forma nativa.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Los valores de contexto de los modelos alternativos proceden de conocimiento general y no de la documentacion aportada en esta ficha, por lo que deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Aureth-4B-Qwen3.5 (GGUF) | 4,2 B | no disponible | apache-2.0 | Multimodal (vision), solo ingles, cuantizaciones GGUF desde 2,0 GB |
| Qwen3-4B | 4 B | no disponible en esta ficha | apache-2.0 | Alternativa de la misma familia nominal; sin datos de rendimiento comparables aqui |
| Gemma 3 4B | 4 B | no disponible en esta ficha | licencia Gemma (no Apache 2.0) | Multimodal; licencia con condiciones de uso adicionales |
| Phi-4-mini-instruct | 3,8 B | no disponible en esta ficha | MIT | Solo texto; orientado a razonamiento y matematicas |

No se dispone de resultados de benchmarks que permitan comparar la calidad real de Aureth-4B-Qwen3.5 frente a estas alternativas. El modelo base tiene un historial de publicacion muy reciente y bajo (284 descargas, 2 likes), lo que limita la evidencia de terceros sobre su comportamiento.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles. El uso en castellano no esta validado y previsiblemente ofrecera un rendimiento inferior.
- Longitud de contexto desconocida: al no publicarse, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Riesgo de alucinacion: inherente a un modelo de 4B ajustado sobre corpus conversacionales; en tareas factuales o de calculo conviene verificar las salidas.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion de seguridad. Los corpus de tipo Hermes no incorporan necesariamente filtros de seguridad exhaustivos.
- Origen del ajuste fino: parte del entrenamiento proviene de un corpus generado (Aureth-Corpus-Hermes4.3-Generated), lo que puede introducir sesgos o artefactos propios del proceso de generacion sintetica.
- Licencia: el repositorio GGUF y el modelo base declaran apache-2.0, lo que permite uso comercial. No obstante, conviene verificar la licencia de los datasets de entrenamiento antes de un despliegue comercial.
- Cuantizaciones agresivas: Q2_K y Q3_K reducen notablemente la calidad. Para produccion se recomienda Q4_K_M o superior; el propio autor marca Q3_K_M como "lower quality" y f16 como "overkill".
- Version multimodal: omitir los ficheros mmproj desactiva por completo la capacidad de vision, aunque el modelo de texto siga funcionando.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento que respalde la eleccion del modelo frente a alternativas de la misma categoria.
- Popularidad baja: 284 descargas y 2 likes implican poca validacion por parte de la comunidad y escasa retroalimentacion sobre fallos en produccion.
- Fechas de publicacion y actualizacion inusuales (2026): conviene confirmar la vigencia del repositorio y del modelo base antes de integrarlo en un sistema.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aureth-4B-Qwen3.5-GGUF
- Modelo base: https://huggingface.co/OusiaResearch/Aureth-4B-Qwen3.5
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/Aureth-4B-Qwen3.5-i1-GGUF
- Variante Heretic del mismo modelo: https://huggingface.co/mradermacher/Aureth-4B-Qwen3.5-Heretic-GGUF
- Lista de ficheros y vista general: https://hf.tst.eu/model#Aureth-4B-Qwen3.5-GGUF
- Guia general de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Perfil del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- Dataset NousResearch/Hermes-3-Dataset: https://huggingface.co/datasets/NousResearch/Hermes-3-Dataset
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset OusiaResearch/Aureth-Corpus-Hermes4.3-Generated: https://huggingface.co/datasets/OusiaResearch/Aureth-Corpus-Hermes4.3-Generated
