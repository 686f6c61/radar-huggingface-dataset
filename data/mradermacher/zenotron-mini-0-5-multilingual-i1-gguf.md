# mradermacher/Zenotron-Mini-0.5-Multilingual-i1-GGUF

## Resumen

Zenotron-Mini-0.5-Multilingual es un modelo de lenguaje de arquitectura MoE (mixture of experts) desarrollado por open-zzrl, publicado originalmente en Hugging Face bajo licencia Apache 2.0. Esta ficha concreta corresponde a la cuantizacion GGUF realizada por mradermacher, que emplea el formato i1 (imatrix) para generar versiones comprimidas del modelo original orientadas a inferencia en CPU y GPU de gama media. El modelo cuenta con 35.505.251.456 parametros totales segun los safetensors del repositorio base, y esta etiquetado como modelo conversacional y de generacion de texto.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo mediante llama.cpp y herramientas compatibles, reduciendo el peso desde el repositorio original hasta aproximadamente 13,3 GB en la cuantizacion i1-Q2_K incluida. El modelo declara soporte para cuatro idiomas: ruso, ingles, frances y coreano, lo que lo posiciona como una opcion multilingue de tamano medio dentro del ecosistema open source.

La model card del cuantizador indica ademas que el modelo base es de tipo vision, aunque los ficheros mmproj (proyector multimodal) se alojan en el repositorio estatico separado, no en este repositorio i1. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (incluida en el repo); lista completa de quants previstos: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | ruso (ru), ingles (en), frances (fr), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura MoE (mixture of experts) sobre un transformer, segun las etiquetas de la model card. No se dispone de informacion detallada sobre el numero de expertos, la estrategia de enrutamiento, el numero de parametros activos por token ni la composicion del dataset de entrenamiento. Tampoco se documenta si se aplicaron tecnicas de RLHF, DPO u otro tipo de ajuste por preferencias.

La model card del cuantizador menciona que el modelo base es de tipo vision, lo que sugiere capacidades multimodales en el modelo original. Sin embargo, los ficheros del proyector multimodal (mmproj) no se incluyen en este repositorio i1, sino que se alojan en el repositorio estatico de mradermacher. La cuantizacion se ha realizado con el metodo i1 (imatrix), que utiliza una matriz de importancia calculada a partir de datos de calibracion para mejorar la calidad de las cuantizaciones de baja precision. El repositorio incluye el fichero imatrix (0,5 GB) para que los usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Soporte multilingue declarado para ruso, ingles, frances y coreano.
- Capacidad de vision en el modelo base (los ficheros mmproj se distribuyen por separado en el repositorio estatico).
- Arquitectura MoE, que en teoria permite mayor capacidad de parametros con un coste computacional de inferencia inferior al de un modelo denso equivalente.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.
- No se documenta modo de pensamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Despliegue local en equipos con GPU de consumo: la cuantizacion i1-Q2_K de 13,3 GB permite ejecutar el modelo en GPUs con 16 GB de VRAM o en configuraciones CPU+GPU con llama.cpp, lo que facilita pruebas y prototipado sin infraestructura en la nube.
- Generacion de texto multilingue en produccion para mercados de Europa del Este y Asia Oriental: el soporte declarado de ruso, coreano, frances e ingles lo hace adecuado para sistemas de atencion al cliente o generacion de contenido en esas combinaciones linguisticas.
- Investigacion sobre cuantizacion: el repositorio incluye el fichero imatrix y multiples variantes de cuantizacion, lo que permite estudiar el impacto de distintas tecnicas (IQ vs. no-IQ, distintos bits) en la perplejidad y la calidad de salida.
- Prototipado de asistentes conversacionales: la etiqueta conversational y el pipeline text-generation permiten integrarlo en frameworks como llama.cpp u Ollama para construir chatbots de uso interno.
- Evaluacion de arquitecturas MoE en entornos con recursos limitados: al ser un MoE de 35,5 mil millones de parametros totales comprimido a 13,3 GB, sirve para comparar el rendimiento de MoE frente a modelos densos de tamano similar en hardware modesto.
- Traduccion y generacion de contenido en ruso y coreano: el modelo declara soporte para ambos idiomas, lo que permite usarlo en pipelines de traduccion automatica o redaccion asistida en esos mercados.
- Analisis de imagenes en el modelo base (si se descargan los ficheros mmproj del repositorio estatico): la naturaleza vision del modelo original permite tareas de descripcion de imagenes o VQA, aunque esta capacidad no esta empaquetada en el repositorio i1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13,3 GB para la cuantizacion i1-Q2_K incluida; las cuantizaciones de mayor precision (Q4_K_M, Q5_K_M, Q6_K) requeriran entre 20 y 30 GB, aunque no se detalla el tamano exacto de cada una en la informacion disponible.
- GPU recomendadas: para i1-Q2_K, una RTX 4090 (24 GB) o RTX 4080 (16 GB) son suficientes; para cuantizaciones de mayor calidad, se recomienda A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: si, en GPUs con 16 GB o mas de VRAM para la cuantizacion Q2_K; las cuantizaciones superiores requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints (tag endpoints_compatible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zenotron-Mini-0.5-Multilingual (i1-GGUF) | 35,5 B (MoE) | no disponible | Apache 2.0 | GGUF | Vision en modelo base; 4 idiomas |
| Modelos MoE comparables de ~30-40 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar |
| Alternativas densas de ~7-13 B | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion suficiente |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que se desconoce su calidad real frente a alternativas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documenta ninguna mitigacion especifica.
- El soporte multilingue se limita a ruso, ingles, frances y coreano; no se declara soporte de espanol.
- La cuantizacion i1-Q2_K es de baja precision y puede degradar la calidad de salida respecto al modelo original; se recomienda usar cuantizaciones superiores si el hardware lo permite.
- Los ficheros mmproj (vision) no estan incluidos en este repositorio; para usar las capacidades multimodales hay que descargarlos del repositorio estatico.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base original.
- No se documentan sesgos conocidos ni limitaciones de contexto especificas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Zenotron-Mini-0.5-Multilingual-i1-GGUF
- Modelo base: https://huggingface.co/open-zzrl/Zenotron-Mini-0.5-Multilingual
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Zenotron-Mini-0.5-Multilingual-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Zenotron-Mini-0.5-Multilingual-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
