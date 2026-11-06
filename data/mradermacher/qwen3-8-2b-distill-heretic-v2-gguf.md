# mradermacher/Qwen3.8-2B-Distill-heretic-v2-GGUF

## Resumen

Qwen3.8-2B-Distill-heretic-v2-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo htb-ac-1424625/Qwen3.8-2B-Distill-heretic-v2, publicada por el usuario mradermacher. El modelo base es un derivado destilado de la familia Qwen 3.8 (segun los tags de la model card), con aproximadamente 1.880 millones de parametros, orientado a razonamiento, function calling y despliegue en el borde (edge), y sometido a un proceso de "abliteration" o "decensoring" (etiquetado como heretic/uncensored) que elimina total o parcialmente las capas de rechazo del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeno (2B) pensado para ejecutarse en hardware modesto, con cuantizaciones que van desde 1,1 GB (Q2_K) hasta 3,9 GB (f16); por otro, advierte de que se trata de una variante "abliterated" con implicaciones eticas y de seguridad importantes. El repositorio incluye tambien ficheros mmproj (Q8_0 y f16) que sugieren capacidades multimodales en el modelo base, aunque la model card no detalla su funcionamiento.

La licencia declarada es Apache 2.0 y el unico idioma soportado explicitamente es el ingles. No se han publicado resultados de benchmarks en la informacion disponible, y el modelo no cuenta con descargas ni likes en el momento de la consulta, lo que indica que es una publicacion muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.8, segun tags); detalles no disponibles |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 19,1 GB |
| Fecha de creacion | 2026-11-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags, que identifican el modelo como derivado de la familia Qwen 3.8 con un proceso de destilacion. El modelo base se describe como resultado de SFT (supervised fine-tuning) y distillation, con capacidades declaradas de reasoning y function calling. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El rasgo tecnico mas destacable es el proceso de "abliteration" (etiquetado como heretic, uncensored, decensored y abliterated), que consiste en la modificacion de los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento. Esto produce un modelo que responde a practicamente cualquier prompt sin filtros de seguridad, lo cual es relevante tanto para casos de red-team e infosec como para riesgos de uso indebido. La presencia de ficheros mmproj indica soporte multimodal (probablemente vision) en el modelo base, aunque no se documenta en la model card.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento (reasoning) segun los tags del modelo.
- Function calling / tool calling (tag explicito).
- Capacidades multimodales inferidas por la presencia de ficheros mmproj (no documentadas en la model card).
- Orientado a despliegue en el borde (edge) por su tamano reducido.
- Sin capas de rechazo (abliterated/uncensored): responde a prompts que el modelo original rechazaria.
- No se documentan capacidades multilingues mas alla del ingles.
- No se documenta modo "thinking" explicito ni soporte de audio.

## Casos de uso

- Red-team y evaluacion de seguridad: el modelo, al carecer de capas de rechazo, permite generar prompts adversarios y estudiar como responden sistemas alineados, util en auditorias de infosec.
- Despliegue en dispositivos de borde: con cuantizaciones de 1,1-1,5 GB (Q2_K a Q5_K_M) cabe en moviles, Raspberry Pi o portatiles sin GPU dedicada, permitiendo asistentes locales offline.
- Function calling en agentes ligeros: el tag de function-calling sugiere su uso como planificador de herramientas en pipelines de automatizacion con latencia baja.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de 2B, permite iterar en local con llama.cpp u Ollama sin coste de API.
- Investigacion sobre abliteration: util para estudiar el efecto de la eliminacion de la direccion de rechazo en modelos pequenos y comparar con el modelo base alineado.
- Generacion de texto en ingles para tareas creativas sin restricciones de contenido, con la advertencia etica correspondiente.
- Educacion e investigacion academica sobre destilacion de modelos de razonamiento en tamanos reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con cuantizaciones Q4_K_M/Q5_K_M; unos 4,5-5 GB con f16 (incluyendo overhead de contexto).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060); tambien CPU pura.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en iGPU con suficiente RAM compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el formato GGUF es compatible con la mayoria de runners ligeros. Para el modelo base en safetensors, transformers y posiblemente vLLM/TGI (no confirmado).
- Latencia y throughput: no disponibles; por el tamano (2B) se espera throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-2B-Distill-heretic-v2 (este) | ~1,88 B | no disponible | Apache 2.0 | Abliterated, solo ingles, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32K (segun version) | Apache 2.0 | Alineado, multilingue, ampliamente validado |
| Llama-3.2-1B-Instruct | 1,2 B | 128K | Llama 3.2 Community | Alineado, multilingue, ecosistema amplio |
| Gemma-2-2B-it | 2,6 B | 8K | Gemma Terms | Alineado, multilingue, requiere aceptacion de terminos |

La comparativa es orientativa: no hay datos de rendimiento publicados para este modelo que permitan una comparacion cuantitativa con las alternativas. La principal diferencia es su naturaleza abliterated y su enfoque monoingles.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: no aplica filtros de seguridad, lo que supone un riesgo elevado de generar contenido danino, ilegal o inseguro. No apto para produccion orientada al publico general sin capas de moderacion externas.
- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a modelos de 2B, agravado por la destilacion y la falta de validacion comunitaria (0 descargas, 0 likes).
- Longitud de contexto no documentada; no se debe asumir una ventana grande.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo (por ejemplo, AI Act) en usos sensibles.
- El proceso de abliteration puede degradar capacidades de razonamiento e instruccion respecto al modelo base alineado; no hay benchmarks que lo confirmen.
- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El repositorio tiene 19,1 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-2B-Distill-heretic-v2-GGUF
- Modelo base: https://huggingface.co/htb-ac-1424625/Qwen3.8-2B-Distill-heretic-v2
- Pagina de overview del autor: https://hf.tst.eu/model#Qwen3.8-2B-Distill-heretic-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
