# mradermacher/WePocketModel1.0-2B-i1-GGUF

## Resumen

WePocketModel1.0-2B-i1-GGUF es una cuantizacion en formato GGUF del modelo multimodal tencent/WePocketModel1.0-2B, publicada por el usuario mradermacher. El modelo base, desarrollado por Tencent, es un modelo multimodal orientado a despliegue en dispositivo (on-device) de aproximadamente 1.880 millones de parametros (1.881.825.088 segun los pesos en safetensors). Esta version concreta no es un modelo nuevo, sino una redistribucion optimizada para inferencia local mediante llama.cpp y herramientas compatibles con GGUF.

La relevancia de esta ficha radica en que ofrece un conjunto amplio de cuantizaciones con calibracion imatrix, desde IQ1_S (0,9 GB) hasta Q6_K (1,7 GB), lo que permite ejecutar un modelo multimodal de casi 2.000 millones de parametros en hardware de consumo, incluso en equipos con recursos muy limitados. El modelo base esta etiquetado como multimodal, orientado a embeddings multimodales, con soporte de MRL (Matryoshka Representation Learning) y decisiones estructuradas, y se distribuye bajo licencia Apache 2.0.

La informacion disponible sobre el modelo base es limitada: la model card del repositorio cuantizado se centra en los aspectos de la cuantizacion y no detalla la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks. Por ello, varios campos de esta ficha se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal; detalles no publicados en la informacion disponible) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix, i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base tencent/WePocketModel1.0-2B en la informacion proporcionada. Las etiquetas del repositorio indican que se trata de un modelo multimodal (multimodal, multimodal-embedding) orientado a despliegue on-device, con soporte declarado de MRL (Matryoshka Representation Learning) y de decisiones estructuradas (structured-decision). La model card del cuantizador no describe la arquitectura (transformer, MoE, hibrida u otra), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

En cuanto a esta publicacion concreta, se trata de cuantizaciones ponderadas con imatrix generadas a partir de los pesos originales en formato Hugging Face (convert_type: hf) y con cuantizacion de tensores de salida (output_tensor_quantised: 1). El autor indica que es un modelo de vision y que los ficheros mmproj (proyector multimodal), si existen, se encuentran en el repositorio de cuantizaciones estaticas enlazado en la model card, no en este repositorio i1. El repositorio incluye tambien el fichero imatrix empleado para generar las cuantizaciones, lo que permite reproducir o crear cuantizaciones propias.

## Capacidades

- Procesamiento multimodal: el modelo base esta etiquetado como multimodal y la model card del cuantizador lo describe explicitamente como modelo de vision, con ficheros mmproj asociados en el repositorio estatico.
- Embeddings multimodales: la etiqueta multimodal-embedding sugiere capacidad de generar representaciones vectoriales conjuntas de texto e imagen.
- MRL (Matryoshka Representation Learning): permite representaciones de embedding truncables a distintas dimensiones, util para busqueda y recuperacion con compromisos ajustables entre precision y coste.
- Decisiones estructuradas (structured-decision): orientado a producir salidas estructuradas para toma de decisiones, segun la etiqueta del repositorio.
- Generacion conversacional: el repositorio incluye la etiqueta conversational.
- Despliegue on-device: disenado para ejecucion local en dispositivos con recursos limitados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (en); no se documentan otros idiomas.

## Casos de uso

- Clasificacion y decision estructurada en el dispositivo: gracias a su orientacion a structured-decision y su tamano reducido (cuantizaciones de 0,9 a 1,7 GB), puede ejecutarse localmente para tareas de clasificacion o enrutamiento con salidas estructuradas, sin enviar datos a la nube.
- Busqueda semantica multimodal: el soporte de embeddings multimodales y MRL permite indexar imagenes y texto en un mismo espacio vectorial y truncar las representaciones para ajustar el coste de almacenamiento y la latencia de recuperacion.
- Procesamiento de imagenes en movil o edge: al ser un modelo de vision con cuantizaciones por debajo de 2 GB, es viable en telefonos, mini-PC y dispositivos embebidos para tareas de comprension de imagenes en local.
- Filtrado y moderacion de contenido visual: la combinacion de vision y embeddings permite detectar y clasificar contenido en flujos de datos locales, manteniendo la privacidad al no requerir servicios externos.
- Asistentes conversacionales embebidos: la etiqueta conversational y su reducido consumo permiten integrarlo en asistentes de escritorio o aplicaciones moviles que funcionan sin conexion.
- Prototipado rapido de pipelines multimodales: las multiples cuantizaciones (desde IQ1_S hasta Q6_K) permiten ajustar el equilibrio entre calidad y memoria en funcion del hardware disponible durante el desarrollo.
- Recuperacion aumentada (RAG) local: sus embeddings pueden alimentar indices vectoriales en el propio dispositivo para busquedas sobre documentacion y capturas de pantalla sin salir del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB con i1-IQ1_S, 1,3-1,4 GB con las cuantizaciones Q4 (i1-Q4_K_S, i1-Q4_K_M) y 1,7 GB con i1-Q6_K, sin contar el espacio adicional para el contexto y el proyector multimodal (mmproj).
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojar las cuantizaciones Q4 o superiores con contexto moderado.
- Cabe en GPU consumer: si. Practicamente cualquier GPU consumer moderna (por ejemplo, series RTX 30/40, e incluso iGPU con memoria unificada) puede ejecutar las cuantizaciones de 1-2 GB.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, entre otras). El formato GGUF es compatible con el ecosistema llama.cpp; para el componente de vision es necesario usar los ficheros mmproj del repositorio estatico.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WePocketModel1.0-2B-i1-GGUF (esta ficha) | 1,88 B | no disponible | Apache 2.0 | GGUF (multiples cuantizaciones) | Multimodal on-device, embeddings MRL, decision estructurada |
| tencent/WePocketModel1.0-2B (modelo base) | 1,88 B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| mradermacher/WePocketModel1.0-2B-GGUF (cuantizaciones estaticas) | 1,88 B | no disponible | Apache 2.0 | GGUF | Incluye ficheros mmproj para vision |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La informacion sobre el modelo base es escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Solo se declara soporte de ingles; no hay evidencia de capacidades en castellano u otros idiomas.
- Al ser un modelo de 1,88 B de parametros, es esperable una capacidad de razonamiento limitada en comparacion con modelos mayores; no se han publicado mediciones que lo confirmen o maticen.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan la calidad de forma notable; el propio autor las describe como "for the desperate" o "mostly desperate".
- El repositorio i1 no contiene los ficheros mmproj; para usar las capacidades de vision hay que obtenerlos del repositorio de cuantizaciones estaticas enlazado en la model card.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables por tratarse de un modelo de lenguaje multimodal sin evaluacion publicada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original (tencent/WePocketModel1.0-2B) antes de desplegarlo en produccion.
- El modelo esta pensado para on-device; no se han publicado datos de throughput ni latencia que permitan dimensionar entornos de alta concurrencia.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/WePocketModel1.0-2B-i1-GGUF
- Modelo base: https://huggingface.co/tencent/WePocketModel1.0-2B
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/WePocketModel1.0-2B-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#WePocketModel1.0-2B-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
