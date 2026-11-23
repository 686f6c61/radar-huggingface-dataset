# mradermacher/Goetia-26B-A4B-v1.5-GGUF

## Resumen

Goetia-26B-A4B-v1.5 es un modelo de lenguaje de gran tamano especializado en escritura creativa, narrativa de ficcion y roleplay. Se trata de un merge (fusion) de modelos construido con mergekit sobre una base de la familia Gemma, segun indican las etiquetas del repositorio (`gemma4`, `mergekit`, `moe_della`). El modelo original lo desarrolla el usuario Naphula, y esta ficha concreta corresponde a la version cuantizada en GGUF publicada por mradermacher, que facilita su ejecucion en hardware de consumo mediante llama.cpp y derivados.

El modelo cuenta con 25.971.339.550 parametros totales (aproximadamente 26B) y la nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con alrededor de 4B de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. Esta orientado a generacion de ficcion en todos los generos (romance, terror, ciencia ficcion), continuacion de escenas, generacion de tramas y sub-tramas, y conversaciones de rol inmersivas con prosa vivida.

Su relevancia actual radica en que ofrece capacidades de escritura creativa de alta calidad en un formato cuantizado que cabe en GPUs de consumo, con licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribucion adicionales mas alla de las de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma (segun etiquetas `gemma4`, `moe_della`); detalles no disponibles |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | ~4B (inferido de la nomenclatura "A4B"; no confirmado oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | Ingles (`language: eng`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); pesos originales en safetensors en el repositorio base |
| Tamano del repositorio | 187.7 GB |
| Modelo base | Naphula/Goetia-26B-A4B-v1.5 |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a una base Gemma (`gemma4`) combinada mediante mergekit en modo experimental (`mergekit-exp`) y con una variante de mezcla de expertos (`moe_della`). El sufijo "A4B" en el nombre es consistente con una arquitectura MoE de aproximadamente 4B de parametros activos sobre un total de 26B, pero el autor no publica en la model card los detalles de configuracion de expertos, numero de capas ni dimensiones del modelo.

Tampoco se especifican en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Al tratarse de un merge de modelos, el "entrenamiento" consiste en la fusion de pesos de modelos preexistentes siguiendo una configuracion de mergekit, no en un entrenamiento desde cero. Las etiquetas del modelo (ficcion, terror, romance, ciencia ficcion, prosa vivida, groserias) indican que la fusion se optimizo deliberadamente para escritura creativa sin filtros excesivos de estilo.

## Capacidades

- Generacion de ficcion y narrativa en todos los generos: romance, terror, ciencia ficcion, drama y otros.
- Escritura creativa con prosa vivida y detallada ("vivid prosing", "vivid writing").
- Generacion de tramas y sub-tramas argumentales.
- Continuacion de escenas ("scene continue") a partir de un contexto dado.
- Roleplay y conversaciones inmersivas de personajes ("roleplaying", "rp").
- Estilo conversacional y dialogos naturales.
- Tono sin restricciones excesivas de lenguaje (etiqueta "swearing"), adecuado para ficcion adulta.
- Capacidades de razonamiento, codigo o matematicas: no documentadas para este modelo.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Multilingue: limitado al ingles segun la model card.

## Casos de uso

- Escritura asistida de novelas y relatos: el modelo puede generar capitulos completos, mantener la voz narrativa y continuar escenas previas, aprovechando su especializacion en prosa vivida y su amplio repertorio de generos.
- Generacion de tramas y sub-tramas: util para autores que necesitan ideas argumentales estructuradas o giros narrativos; el modelo esta etiquetado especificamente para "plot generation" y "sub-plot generation".
- Roleplay y juegos de rol por texto: su entrenamiento orientado a "roleplaying" permite mantener personajes coherentes en conversaciones multi-turno, con registro y personalidad consistentes.
- Creacion de contenido para videojuegos narrativos: generacion de dialogos de NPC, descripciones de escenarios y ramificaciones argumentales en pipelines de diseno de juegos.
- Prototipado rapido de guiones y storyboards: escritura de escenas y dialogos para cine, series o podcasts, con capacidad de alternar generos (terror, romance, ciencia ficcion).
- Comunidades de escritura colaborativa: asistente para superar el bloqueo del escritor, proponiendo continuaciones o variaciones de una escena existente.
- Generacion de ficcion interactiva: integrado en motores de aventuras conversacionales o chatbots de personajes, gracias a su formato GGUF ejecutable en local con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero):
  - Q2_K: ~10.9 GB
  - Q3_K_S: ~12.6 GB
  - Q3_K_M: ~13.7 GB
  - Q3_K_L: ~14.2 GB
  - IQ4_XS: ~14.6 GB
  - Q4_K_S: ~16.0 GB (recomendada por el autor como rapida)
  - Q4_K_M: ~17.3 GB (recomendada por el autor como rapida)
  - Q5_K_S: ~18.6 GB
  - Q5_K_M: ~19.7 GB
  - Q6_K: ~23.3 GB
  - Q8_0: ~27.7 GB
- GPU recomendadas: para Q4_K_M se necesita una GPU con al menos 20-24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4). Para Q8_0 se recomienda A100 40GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q5_K_M o Q6_K; en GPUs de 12-16 GB (RTX 4070 Ti, 4080) con Q2_K a IQ4_XS, con posible offload parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. El repositorio indica compatibilidad con endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B de parametros activos (segun nomenclatura), el throughput por token deberia ser notablemente superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.5 (este) | ~26B (MoE, ~4B activos) | no disponible | Apache 2.0 | GGUF / safetensors | Especializado en ficcion y roleplay |
| Modelos densos de ~27B (p. ej. Gemma 2 27B) | ~27B | no disponible | Gemma license | GGUF / safetensors | Base generalista, no especializada en ficcion |
| Modelos de escritura creativa de ~13B | ~13B | no disponible | variable | GGUF | Menor capacidad, menor huella de VRAM |
| Modelos MoE de ~30B con ~3-4B activos | ~30B | no disponible | variable | GGUF | Rendimiento por token similar, mayor calidad potencial |

La comparativa detallada con alternativas concretas no esta disponible en la informacion proporcionada; los datos de la tabla para modelos alternativos son orientativos y no se han verificado contra sus model cards.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un merge de modelos de ficcion, puede reproducir estereotipos de genero, culturales o de personajes presentes en los datos originales.
- Riesgo de alucinacion: inherente a los modelos generativos; en contextos de ficcion es esperable y a menudo deseable, pero no debe usarse como fuente de hechos verificables.
- Limitaciones de contexto: la longitud de contexto no esta documentada; no se debe asumir una ventana superior a la de los modelos base de Gemma sin verificacion empirica.
- Limitaciones de idioma: la model card declara unicamente ingles (`language: eng`); el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos fusionados originales, ya que un merge puede heredar restricciones de sus componentes.
- Caveat para produccion: es un modelo experimental de merge (`mergekit-exp`) sin benchmarks publicados; se recomienda evaluacion propia antes de desplegarlo en produccion.
- El contenido sin filtros (etiqueta "swearing") puede requerir moderacion adicional en aplicaciones de cara al publico.
- No hay garantia de soporte de tool calling ni de integracion con frameworks de agentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.5-GGUF
- Modelo base original: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.5
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.5-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Goetia-26B-A4B-v1.5-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
