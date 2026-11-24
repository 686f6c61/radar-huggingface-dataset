# mradermacher/EgoCaptioner-i1-GGUF

## Resumen

EgoCaptioner-i1-GGUF es una cuantizacion en formato GGUF del modelo EgoCaptioner, desarrollado originalmente por el usuario Vickyinmyheart824 y cuantizado por mradermacher. Se trata de un modelo especializado en la generacion de descripciones (captioning) de video egocentrico, es decir, grabaciones en primera persona tipicamente capturadas con camaras corporales o dispositivos montados en la cabeza. El modelo parte de una base de aproximadamente 8.950 millones de parametros y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de video-captioning de casi 9.000 millones de parametros en hardware de consumo, gracias al conjunto de cuantizaciones con imatrix que van desde IQ1_S (3,0 GB) hasta Q6_K (7,5 GB). El repositorio esta etiquetado con transformers, gguf, video, egocentric-video y video-captioning, y esta pensado para flujos conversacionales y de inferencia local.

No se dispone de informacion detallada sobre la arquitectura interna, el contexto maximo ni la composicion del dataset de entrenamiento en la informacion proporcionada; esta ficha se limita a los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de video-captioning multimodal, etiquetado como vision model) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base EgoCaptioner. El repositorio lo clasifica como modelo de vision (vision model) orientado a video egocentrico y video-captioning, y la model card indica que los ficheros mmproj (proyector multimodal), si existen, se alojan en el repositorio estatico hermano (mradermacher/EgoCaptioner-GGUF). Esto sugiere una arquitectura multimodal con un codificador visual y un proyector hacia un modelo de lenguaje, pero no se confirma el tipo exacto de transformer ni la composicion del dataset.

Respecto al entrenamiento, no se han publicado en la informacion disponible datos sobre numero de tokens, composicion del dataset, ni si hubo RLHF o DPO. La cuantizacion se ha realizado con el metodo i1 (imatrix) de mradermacher, que emplea un fichero imatrix de 0,1 GB para mejorar la calidad de las cuantizaciones de baja precision. El proceso de conversion es de tipo hf (Hugging Face a GGUF) y la version de cuantizacion es la 2.

## Capacidades

- Generacion de descripciones de video egocentrico (grabaciones en primera persona).
- Procesamiento multimodal de video (se etiqueta como vision model; requiere ficheros mmproj para el codificador visual).
- Generacion de texto conversacional (etiqueta conversational).
- Capacidad multilingue limitada al ingles (language: en).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, thinking mode, audio ni otras capacidades especiales.

## Casos de uso

- Descripcion automatica de grabaciones en primera persona: el modelo puede generar texto descriptivo a partir de videos capturados con camaras corporales, util en investigacion de vision egocentrica y analisis de actividad.
- Accesibilidad audiovisual: generar descripciones textuales de videos egocentricos para personas con discapacidad visual o para indexacion semantica de archivos de video.
- Anotacion de datasets de video egocentrico: producir captions preliminares que luego se revisan manualmente, reduciendo el coste de etiquetado en proyectos de investigacion.
- Analisis de contenido en entornos industriales o de formacion: describir secuencias grabadas en primera persona por operarios para documentar procedimientos y generar informes.
- Procesamiento local en hardware de consumo: gracias a las cuantizaciones de 3,0-7,5 GB, puede ejecutarse en equipos con GPU de gama media para prototipos y pruebas sin depender de la nube.
- Integracion en pipelines de video: combinado con herramientas de extraccion de fotogramas, el modelo puede generar descripciones por segmentos en flujos automatizados de catalogacion de contenido.
- Investigacion en vision-lenguaje: servir como base cuantizada para experimentos de captioning de video en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,0 GB (i1-IQ1_S) hasta 7,5 GB (i1-Q6_K), segun el fichero GGUF elegido; el fichero imatrix adicional ocupa 0,1 GB.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, las cuantizaciones de 3-6 GB caben en GPUs de consumo con 8 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM para las cuantizaciones de hasta Q5_K_M (6,6 GB); Q6_K (7,5 GB) requiere margen adicional.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF (la model card remite a las guias de TheBloke para el uso de ficheros GGUF); no se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de video-captioning egocentrico en la informacion proporcionada. Como referencia de tamano, el modelo tiene ~8,95 mil millones de parametros y licencia Apache 2.0, pero no se han publicado datos de rendimiento que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| EgoCaptioner-i1-GGUF | ~8,95 B | no disponible | apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta entrenado y etiquetado unicamente para ingles (en); el rendimiento en castellano u otros idiomas no esta documentado.
- Al ser un modelo de captioning de video, existe riesgo de alucinacion: puede describir objetos o acciones no presentes en el video.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS, Q2_K_S) degradan notablemente la calidad; la propia model card las marca como "for the desperate" o "very low quality".
- No se documentan sesgos conocidos en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original (Vickyinmyheart824/EgoCaptioner).
- Es una cuantizacion de terceros (mradermacher), no el modelo oficial; para produccion conviene validar la calidad frente a los pesos originales.
- No se dispone de informacion sobre el contexto maximo, lo que limita la planificacion de cargas de video largas.
- El repositorio ocupa 111,7 GB en total debido a la gran cantidad de cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/EgoCaptioner-i1-GGUF
- Modelo base: https://huggingface.co/Vickyinmyheart824/EgoCaptioner
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/EgoCaptioner-GGUF
- Pagina de descarga del modelo: https://hf.tst.eu/model#EgoCaptioner-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
