# mradermacher/SOCIUM-AI-27B-GGUF

## Resumen

SOCIUM-AI-27B-GGUF es la version cuantizada en formato GGUF del modelo orzattyholdings/SOCIUM-AI-27B, publicada por el usuario mradermacher, conocido por distribuir cuantizaciones estaticas de modelos abiertos. El modelo base cuenta con 27.320.697.856 parametros (unos 27,3 mil millones) y, segun las etiquetas de la model card, se trata de un modelo conversacional de tipo vision-language afinado con SFT sobre una base de la familia Qwen3.5, con especial atencion a codigo, desarrollo de videojuegos y contenido en espanol (con mencion explicita a Colombia) e ingles.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~27B con capacidades multimodales en hardware de consumo o en servidores de gama media mediante llama.cpp y derivados, sin necesidad de infraestructura de entrenamiento. El repositorio incluye ademas los ficheros mmproj, necesarios para habilitar la parte de vision dentro del ecosistema GGUF, y las cuantizaciones cubren desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB).

Se trata de un modelo con practicamente nula traccion en el momento de la consulta (0 descargas y 0 likes) y sin model card detallada por parte del autor de la cuantizacion mas alla de la lista de ficheros, por lo que la evaluacion tecnica queda limitada a los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas apuntan a la familia Qwen3.5, sin confirmacion en la model card) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 para la parte multimodal |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Modelo base | orzattyholdings/SOCIUM-AI-27B |
| Cuantizado por | mradermacher |
| Tamano del repositorio | 190,8 GB |
| Fecha de publicacion | 27 de septiembre de 2026 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. Las etiquetas de HuggingFace lo asocian a "qwen3.5", lo que sugiere una arquitectura transformer derivada de la familia Qwen, pero no se confirma en la model card ni se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos u otra innovacion concreta. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion.

Lo unico verificable es que el modelo base fue sometido a un ajuste fino supervisado (etiquetas "sft" y "fine-tuned") y que incorpora capacidades de vision, dado que el repositorio GGUF incluye ficheros mmproj (proyector multimodal) en precision Q8_0 y f16, que en llama.cpp se cargan junto al modelo principal para procesar imagenes. La cuantizacion es de tipo estatico: el autor indica explicitamente que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational".
- Capacidades de vision-language: el repositorio incluye ficheros mmproj que habilitan el procesamiento de imagenes en llama.cpp y derivados.
- Generacion de codigo, con etiqueta explicita "coding".
- Asistencia en desarrollo de videojuegos, segun la etiqueta "game-development".
- Soporte de espanol (con enfasis declarado en Colombia) e ingles como idiomas principales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Desarrollo de videojuegos asistido: el modelo esta afinado explicitamente para game development, por lo que puede emplearse para generar logica de juego, sistemas de inventario, maquinas de estados o scripts de comportamiento de NPCs a partir de descripciones en lenguaje natural, integrado en un editor mediante un servidor local de llama.cpp.
- Atencion al cliente en espanol de Colombia: el enfasis idiomatico declarado permite desplegar un asistente conversacional ajustado al registro local, ejecutado en local para evitar enviar datos de clientes a terceros.
- Copiloto de codigo autoalojado: con cuantizaciones Q4_K_M o Q5_K_M es viable mantener un asistente de autocompletado y refactorizacion en una estacion de trabajo con GPU de 24 GB, sin dependencia de APIs externas.
- Analisis de capturas o diagramas tecnicos: gracias a los ficheros mmproj, el modelo puede recibir imagenes junto al prompt, lo que permite usarlo para describir diagramas de arquitectura, revisar bocetos de interfaz o extraer texto de capturas.
- Prototipado local de agentes conversacionales: la combinacion de formato GGUF y licencia apache-2.0 facilita levantar entornos de pruebas multi-turno con contexto persistente en portatiles o servidores modestos.
- Traduccion y adaptacion de contenido es-en: util para localizar documentacion tecnica o material de producto entre ambos idiomas manteniendo terminologia especifica de videojuegos y software.
- Despliegue en entornos con requisitos de soberania del dato: al ser un modelo de pesos abiertos ejecutable en infraestructura propia, encaja en organizaciones que no pueden usar servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan datos de perplexity para las distintas cuantizaciones mas alla de la referencia generica a un grafico comparativo de la comunidad.

## Requisitos de hardware

Las estimaciones de VRAM se derivan del tamano de los ficheros publicados en el repositorio; hay que anadir el consumo del contexto (cache KV) y, en su caso, el del proyector multimodal.

- Q2_K (11,0 GB): viable en GPU de 12 GB con contexto corto, con perdida de calidad apreciable.
- Q3_K_S / Q3_K_M / Q3_K_L (12,4 / 13,6 / 14,7 GB): GPU de 16 GB, como RTX 4080 o RTX 4060 Ti de 16 GB.
- Q4_K_S / Q4_K_M (15,9 / 16,9 GB): las opciones marcadas como "fast, recommended" por el autor; encajan en RTX 4090, RTX 3090 o RTX 5090 de 24 GB, dejando margen para contexto.
- Q5_K_S / Q5_K_M (19,1 / 19,6 GB): GPU de 24 GB con contexto moderado.
- Q6_K (22,5 GB): GPU de 24 GB con contexto limitado, o reparto GPU/CPU.
- Q8_0 (29,1 GB): requiere 32 GB o mas de VRAM (A100 40 GB, dos GPU de 24 GB, o Mac unificado de 48 GB en adelante).
- mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB): coste adicional que se suma a la VRAM del modelo principal cuando se activa la vision.
- Cabe en GPU de consumo: si, en configuraciones Q4 y Q5 sobre GPU de 24 GB, o en cuantizaciones menores sobre 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Para servidores con throughput alto no se documentan recetas de vLLM o TGI en este repositorio.
- Latencia y throughput: no disponible; no se aportan mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos tecnicos verificables (parametros, contexto, benchmarks) de modelos comparables en la informacion proporcionada. Como referencia de publicaciones del mismo autor y tamano, se listan las siguientes alternativas, todas ellas sin datos publicados en el material consultado.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| mradermacher/SOCIUM-AI-27B-GGUF | 27,3B | no disponible | es, en | apache-2.0 | GGUF | no disponible |
| orzattyholdings/SOCIUM-AI-27B (base) | 27,3B | no disponible | es, en | apache-2.0 | safetensors | no disponible |
| mradermacher/Semancer-27B-GGUF | no disponible | no disponible | en | apache-2.0 | GGUF | no disponible |
| mradermacher/dreamaiai-27B-03-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF | no disponible |

## Limitaciones y advertencias

- Ausencia de model card tecnica: no se documentan datos de entrenamiento, composicion del dataset ni proceso de alineacion, por lo que no es posible auditar sesgos ni comportamientos indeseados.
- Sesgos conocidos: no disponibles. El enfasis declarado en espanol de Colombia y en desarrollo de videojuegos puede implicar un ajuste muy orientado a esos dominios y un rendimiento inferior en otras tareas o variantes dialectales.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano y, en este caso, sin evaluaciones publicadas que permitan acotarlo. No se recomienda su uso en dominios de alto riesgo sin verificacion humana.
- Idiomas: solo se declaran es y en. El rendimiento en otros idiomas es desconocido y previsiblemente pobre.
- Longitud de contexto: no disponible, lo que impide planificar tareas de contexto largo con garantias.
- Licencia: el repositorio de cuantizacion se publica bajo apache-2.0, pero conviene verificar de forma independiente la licencia del modelo base y las condiciones de los datos de entrenamiento antes de un uso comercial.
- Cuantizaciones agresivas: Q2_K y las variantes Q3 degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Multimodalidad condicionada: las capacidades de vision solo estan activas si el runtime carga el fichero mmproj correspondiente; sin el, el modelo se comporta como texto unicamente.
- Falta de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de pruebas independientes.
- Cuantizaciones ponderadas o con imatrix no disponibles: el autor indica que no las habia generado, lo que limita las opciones de optimizar la relacion calidad/tamano.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/SOCIUM-AI-27B-GGUF
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#SOCIUM-AI-27B-GGUF
- Modelo base: https://huggingface.co/orzattyholdings/SOCIUM-AI-27B
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor de la cuantizacion: https://www.nethype.de/
- Publicaciones similares del mismo autor: https://huggingface.co/mradermacher/Semancer-27B-GGUF y https://huggingface.co/mradermacher/dreamaiai-27B-03-GGUF
