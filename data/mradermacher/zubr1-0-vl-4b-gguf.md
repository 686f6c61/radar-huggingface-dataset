# mradermacher/Zubr1.0-VL-4B-GGUF

## Resumen

Zubr1.0-VL-4B-GGUF es la distribucion en formato GGUF del modelo vision-lenguaje Zubr1.0-VL-4B, publicado por el usuario mradermacher como cuantizador independiente a partir del modelo original de ArtCloud. El modelo base es un transformer multimodal de 4.022.468.096 parametros (aproximadamente 4B) orientado a tareas de comprension de imagen y texto, con soporte para los idiomas ruso, bielorruso e ingles. La licencia declarada es Apache 2.0, heredada del modelo Qwen3-VL-4B-Instruct segun el enlace de licencia incluido en la model card.

La relevancia de esta publicacion radica en que pone a disposicion un conjunto completo de cuantizaciones estaticas GGUF (desde Q2_K hasta f16, ademas de los suplementos multimodales mmproj) que permiten ejecutar un modelo vision-lenguaje de 4B parametros en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 37,7 GB e incluye tanto los pesos cuantizados como los ficheros mmproj necesarios para el procesamiento de imagenes.

No se dispone de informacion detallada sobre la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks en la informacion proporcionada; la model card del cuantizador se limita a listar los ficheros generados y referencias generales sobre el uso de GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje, base Qwen3-VL-4B-Instruct segun license_link) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | ru, be, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El enlace de licencia de la model card apunta a Qwen/Qwen3-VL-4B-Instruct, lo que sugiere que el modelo base deriva de la familia Qwen3-VL, pero no se confirma explicitamente la arquitectura exacta, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El modelo es multimodal (etiqueta "vision") y conversacional, e incluye ficheros mmproj separados que actuan como suplemento para el procesamiento de imagenes en el runtime de llama.cpp. El cuantizador indica que las cuantizaciones son estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que existe una version alternativa con cuantizaciones ponderadas/imatrix en el repositorio Zubr1.0-VL-4B-i1-GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes (vision) mediante los ficheros mmproj incluidos.
- Soporte multilingue para ruso, bielorruso e ingles.
- Compatibilidad con transformers y vLLM segun las etiquetas del repositorio.
- Ejecucion en llama.cpp y runtimes compatibles con GGUF.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Procesamiento de imagenes en local: con la cuantizacion Q4_K_M (2,6 GB) y el mmproj Q8_0 (0,6 GB) se puede ejecutar un pipeline de descripcion de imagenes o VQA en una GPU de consumo, sin depender de APIs externas.
- Asistente conversacional en ruso o bielorruso: el modelo declara soporte nativo para estos idiomas, lo que lo hace adecuado para chatbots orientados a usuarios de Europa del Este desplegados con llama.cpp u Ollama.
- Prototipado rapido de aplicaciones multimodales: la disponibilidad de cuantizaciones desde Q2_K (1,8 GB) hasta f16 (8,2 GB) permite ajustar el equilibrio calidad/memoria segun el hardware disponible en cada fase de desarrollo.
- Despliegue en entornos con recursos limitados: la version Q3_K_S (2,0 GB) o IQ4_XS (2,4 GB) permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU, a costa de menor calidad.
- Extraccion de informacion de documentos escaneados: combinando el modelo con el mmproj f16 (0,9 GB) se pueden procesar imagenes de documentos y generar texto estructurado en ingles o ruso.
- Integracion en pipelines de transformers o vLLM: las etiquetas del repositorio indican compatibilidad con estas librerias, lo que facilita su inclusion en servicios de inferencia existentes que ya soporten GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1,8 GB; Q3_K_S ~2,0 GB; IQ4_XS ~2,4 GB; Q4_K_M ~2,6 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB. Anadir ~0,6 GB (mmproj Q8_0) o ~0,9 GB (mmproj f16) si se procesan imagenes.
- GPU recomendadas: no especificadas por el autor. Por tamano, las cuantizaciones Q4 a Q8 caben en GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); las versiones Q2-Q3 podrian ejecutarse en GPUs de 4-6 GB o en CPU.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q2_K a Q8_0) en GPUs con 6 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el modelo base es compatible con transformers y vLLM segun las etiquetas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Zubr1.0-VL-4B-GGUF | 4,02B | no disponible | ru, be, en | apache-2.0 | GGUF |
| Qwen3-VL-4B-Instruct (referencia de licencia) | no disponible | no disponible | no disponible | no disponible | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos en la informacion proporcionada para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real del modelo en tareas de vision o texto no esta verificado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- La cobertura idiomatica declarada se limita a ruso, bielorruso e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud de contexto no esta disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Las cuantizaciones Q2_K y Q3_K_M se marcan como de menor calidad en la propia model card; para produccion se recomienda Q4_K_M o superior.
- El modelo es una cuantizacion de terceros (mradermacher); la responsabilidad sobre sesgos y comportamiento del modelo base recae en ArtCloud.
- La licencia Apache 2.0 permite uso comercial, pero el enlace de licencia apunta al modelo Qwen3-VL-4B-Instruct, por lo que conviene verificar las condiciones del modelo base antes de un despliegue comercial.
- El repositorio tiene un numero muy bajo de descargas (227) y likes (1), lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Zubr1.0-VL-4B-GGUF
- Modelo base: https://huggingface.co/ArtCloud/Zubr1.0-VL-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Zubr1.0-VL-4B-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Zubr1.0-VL-4B-GGUF
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
