# mradermacher/Vesper-26B-A4B-Nocturne-i1-GGUF

## Resumen

Vesper-26B-A4B-Nocturne-i1-GGUF es una cuantizacion en formato GGUF del modelo ReadyArt/Vesper-26B-A4B-Nocturne, publicada por mradermacher. El modelo base es un transformer de 25.233.142.046 parametros totales orientado a generacion de texto conversacional, con un enfasis explicito en roleplay, contenido para adultos y conversaciones multi-personaje (ensemble). La nomenclatura "A4B" sugiere una arquitectura con aproximadamente 4.000 millones de parametros activos, si bien la informacion disponible no confirma si se trata de un modelo Mixture of Experts ni detalla su configuracion.

Esta publicacion concreta es una variante "i1" con cuantizaciones ponderadas mediante imatrix, generada con herramientas de cuantizacion de llama.cpp. El autor distribuye tanto cuantizaciones estaticas (repositorio separado) como estas versiones con imatrix, que suelen ofrecer mejor calidad por bit en rangos bajos. El modelo se etiqueta como vision model en la model card, aunque no se aportan detalles sobre el codificador visual ni sobre los archivos mmproj.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de 25.000 millones de parametros en hardware de consumo mediante cuantizaciones de 2 a 6 bits, algo imposible con los pesos originales en precision completa. La licencia Apache 2.0 facilita su uso comercial, aunque el contenido NSFW y las limitaciones de idioma (solo ingles) condicionan su aplicacion practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; nomenclatura A4B sugiere ~4B parametros activos) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, small-IQ4_NL |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ReadyArt/Vesper-26B-A4B-Nocturne. El recuento de parametros (25.233.142.046) y la nomenclatura "A4B" apuntan a un modelo con aproximadamente 4.000 millones de parametros activos por token, lo que es caracteristico de arquitecturas Mixture of Experts o de variantes con capas dispersas, pero no se confirma en la documentacion. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La model card menciona que el modelo es un "vision model" y que los ficheros mmproj, si existen, se encuentran en el repositorio de cuantizaciones estaticas. No obstante, no se aporta informacion sobre el codificador visual, la resolucion de imagenes soportada ni el proceso de entrenamiento multimodal. Las cuantizaciones i1 de esta publicacion se han generado con pesos ponderados por imatrix, una tecnica que ajusta la precision de cada tensor segun su importancia para reducir la perplejidad en cuantizaciones de baja profundidad de bits.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay y narrativa interactiva.
- Soporte de conversaciones multi-personaje (ensemble), segun las etiquetas del repositorio.
- Capacidad multimodal declarada por el autor ("vision model"), aunque sin detalles tecnicos disponibles.
- Generacion de texto en ingles exclusivamente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener dialogos prolongados entre varios personajes gracias a su naturaleza ensemble y a su entrenamiento orientado a conversacion, ejecutandose en local con cuantizaciones Q4_K_M o Q5_K_M.
- Creacion narrativa asistida: escritura de ficcion interactiva o guiones con multiples voces, aprovechando la capacidad de mantener personajes diferenciados en una misma sesion.
- Prototipado de chatbots de entretenimiento para adultos: la licencia Apache 2.0 permite integrar el modelo en productos comerciales de nicho, siempre que se cumplan las normativas locales sobre contenido.
- Investigacion sobre alineacion y seguridad en modelos NSFW: permite estudiar el comportamiento de modelos afinados para contenido adulto en entornos controlados y sin dependencia de APIs externas.
- Despliegue en hardware de consumo: las cuantizaciones de 2 a 4 bits permiten ejecutar el modelo en GPUs con 12-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos originales.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye el fichero imatrix y multiples variantes, lo que facilita estudios sobre la relacion entre profundidad de bits y calidad conversacional.
- Generacion de dialogos para videojuegos o mods: integracion en motores de rol con NPCs que requieran respuestas contextuales y personalidad definida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para cuantizaciones IQ1/IQ2, 5-6 GB para IQ3/Q3, 7-8 GB para Q4, 9-10 GB para Q5 y 11-12 GB para Q6_K (estimaciones basadas en el tamano de fichero de 10,7 GB para i1-Q2_K y el recuento de parametros; no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti 16 GB, RTX 4090 24 GB para cuantizaciones medias y altas; A100 o H100 para precision completa o contextos muy largos.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM usando cuantizaciones Q4 o inferiores; las variantes Q5 y Q6 requieren 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vesper-26B-A4B-Nocturne-i1-GGUF | 25,2B | no disponible | Apache 2.0 | GGUF | Enfoque NSFW/roleplay, solo ingles |
| Modelos roleplay GGUF de ~20-30B (p. ej. variantes de Mistral/Mixtral) | 20-30B | variable | variable | GGUF | Ecosistema amplio, calidad dependiente del fine-tuning |
| Modelos densos de 24B en GGUF | ~24B | variable | variable | GGUF | Sin dispersion de parametros; mayor coste por token |

No se dispone de datos de rendimiento comparativo verificables para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Contenido NSFW y para adultos: el modelo esta afinado para roleplay y material maduro; no es adecuado para aplicaciones generales sin filtrado previo.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; en tareas de recuperacion de informacion o codigo no hay garantias.
- Capacidad multimodal incierta: aunque la model card menciona "vision model", no se detallan los ficheros mmproj ni el soporte real de imagenes en esta variante i1.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones de calidad conversacional, lo que dificulta la comparacion objetiva.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validacion practicamente nulo.
- Cuantizaciones muy bajas (IQ1, IQ2) pueden degradar notablemente la coherencia en dialogos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Vesper-26B-A4B-Nocturne-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Vesper-26B-A4B-Nocturne
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Vesper-26B-A4B-Nocturne-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Vesper-26B-A4B-Nocturne-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
