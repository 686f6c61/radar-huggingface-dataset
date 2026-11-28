# mradermacher/Goetia-26B-A4B-v1.6-i1-GGUF

## Resumen

Goetia-26B-A4B-v1.6-i1-GGUF es la version cuantizada en formato GGUF del modelo Goetia-26B-A4B-v1.6, publicado por el usuario Naphula y convertido a GGUF por mradermacher. Se trata de un modelo orientado a escritura creativa, narrativa de ficcion, roleplay y generacion de tramas, construido como un merge mediante mergekit sobre una base de la familia Gemma (etiquetada como "gemma4" en los tags del autor) con una configuracion de mezcla de expertos (MoE) denominada "moe_della". El modelo cuenta con aproximadamente 25.971 millones de parametros totales y una ventana de contexto que no se especifica en la informacion disponible.

La relevancia de esta ficha reside en que el repositorio original es un modelo de fusion experimental de gran tamano pensado para tareas literarias, y esta version de mradermacher ofrece cuantizaciones con imatrix (i1) que abarcan desde IQ1_S hasta Q6_K, lo que permite ejecutarlo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo. La licencia Apache 2.0 facilita su uso comercial, aunque las limitaciones tecnicas y la ausencia de benchmarks publicados deben tenerse en cuenta antes de llevarlo a produccion.

El modelo esta etiquetado como modelo de vision por el autor de las cuantizaciones, si bien no se detalla la arquitectura multimodal ni los componentes de proyeccion en la informacion disponible. Su idioma declarado es unicamente el ingles ("eng"), y el repositorio tiene un tamano de 308,9 GB, lo que refleja la presencia de multiples variantes de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), fusion mediante mergekit ("moe_della"), base de la familia Gemma ("gemma4") |
| Parametros totales | 25.971.339.550 (aprox. 26B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; disponibles tambien cuantizaciones estaticas en el repositorio Goetia-26B-A4B-v1.6-GGUF |
| Idiomas soportados | ingles (eng) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es Naphula/Goetia-26B-A4B-v1.6, generado mediante mergekit (tags "merge", "mergekit", "mergekit-exp") y con una configuracion de mezcla de expertos etiquetada como "moe_della". Los tags tambien mencionan "gemma4", lo que sugiere que la arquitectura subyacente deriva de la familia Gemma de Google, aunque no se detalla la version concreta ni la composicion exacta de los expertos. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado.

Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El autor de las cuantizaciones indica que se trata de un modelo de vision, con ficheros mmproj (si existen) alojados en el repositorio estatico, pero no se detalla el codificador visual ni como se integra en la arquitectura MoE. En resumen, la informacion publica sobre el entrenamiento es muy limitada y se reduce a la naturaleza de fusion del modelo y a su orientacion a escritura creativa.

## Capacidades

- Generacion de texto narrativo y creativo: ficcion, relatos cortos, novelas por capitulos, generacion de tramas y sub-tramas.
- Escritura vivida y detallada ("vivid writing", "vivid prosing" segun los tags del autor).
- Roleplay y conversacion multi-turno con personajes, incluyendo generacion de dialogos y continuacion de escenas ("scene continue").
- Cobertura de multiples generos: romance, terror, ciencia ficcion y otros generos ("all genres").
- Uso de lenguaje soez y contenido adulto en contextos de ficcion (tag "swearing"), sin filtros documentados.
- Capacidad de vision segun la model card del cuantizador (modelo etiquetado como vision), aunque no se detallan las tareas visuales soportadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idioma declarado.

## Casos de uso

- Generacion de novelas y relatos por entregas: el modelo puede continuar escenas y mantener coherencia narrativa en textos largos, gracias a su entrenamiento orientado a ficcion y a la generacion de tramas y subtramas; se usaria con prompts de sistema que definan personajes, tono y genero.
- Roleplay conversacional con personajes: adecuado para aplicaciones de entretenimiento o compania virtual donde se requiere mantener una voz consistente y responder en multiples turnos; el tag "rp" y "roleplaying" indica especializacion en este formato.
- Asistencia a guionistas y escritores: generacion de borradores, alternativas de trama y continuaciones de escena ("scene continue") para superar bloqueos creativos, con el modelo actuando como copiloto literario.
- Creacion de contenido para videojuegos narrativos: generacion de dialogos ramificados, descripciones de escenarios y misiones secundarias en generos como terror o ciencia ficcion, aprovechando la cobertura de "all genres".
- Prototipado de chatbots de ficcion interactiva: integracion en demos o productos de storytelling interactivo donde el usuario elige el rumbo de la historia; la licencia Apache 2.0 permite su uso comercial sin restricciones de atribucion adicionales.
- Generacion de material promocional narrativo: sinopsis, textos de ambientacion y descripciones de producto con tono literario para editoriales, estudios de videojuegos o plataformas de lectura.
- Experimentacion en investigacion sobre merges MoE: el modelo sirve como caso de estudio de fusiones con mergekit y de cuantizacion imatrix, permitiendo evaluar la degradacion de calidad entre cuantizaciones IQ1 y Q6_K en tareas creativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero GGUF): i1-IQ1_S ~8,6 GB; i1-IQ2_M ~10,8 GB; i1-IQ3_S ~12,6 GB; i1-IQ4_XS ~14,4 GB; i1-Q4_K_S ~16,0 GB; i1-Q4_K_M ~17,3 GB; i1-Q5_K_M ~19,7 GB; i1-Q6_K ~23,3 GB. A estos valores hay que sumar el espacio para el contexto KV y el posible fichero mmproj si se usa la parte de vision.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, GPUs con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4 con 24 GB); para Q6_K, 24 GB justos o 32 GB (A100 40 GB, RTX A6000). Para cuantizaciones IQ2/IQ3, GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) pueden ser suficientes.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con cuantizaciones IQ2/IQ3, y en RTX 4090 con Q4_K_M o Q5_K_M; las cuantizaciones IQ1 son para escenarios con menos de 10 GB de VRAM.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors. El repositorio incluye un fichero imatrix para generar cuantizaciones propias.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.6-i1-GGUF | 25,97B (MoE) | no disponible | Apache 2.0 | GGUF | Especializado en ficcion y roleplay; cuantizaciones imatrix desde IQ1_S |
| Naphula/Goetia-26B-A4B-v1.6 | 25,97B (MoE) | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva esta ficha |
| Modelos de escritura creativa de ~7-13B en GGUF | 7-13B | variable | variable | GGUF | Alternativas mas ligeras para hardware limitado, con menor capacidad de coherencia en textos largos |
| Modelos MoE de ~20-30B de proposito general | 20-30B | variable | variable | safetensors/GGUF | Mayores capacidades de razonamiento y codigo, pero sin especializacion literaria |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un modelo entrenado predominantemente en ingles y orientado a ficcion, puede reflejar sesgos culturales y de genero presentes en narrativa angloparlante.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de ficcion es esperable y aceptable, pero no debe usarse como fuente de hechos verificables sin supervision.
- Limitaciones de contexto o idioma: el unico idioma declarado es el ingles, por lo que el rendimiento en castellano no esta garantizado; la longitud de contexto no se especifica, lo que impide planificar usos con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin garantias; conviene revisar la licencia del modelo base y de los componentes fusionados, ya que la informacion disponible no detalla las licencias de todos ellos.
- Caveat para produccion: la ausencia de benchmarks y de documentacion sobre el entrenamiento hace recomendable una evaluacion propia antes de desplegar; las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad segun las propias notas del cuantizador ("for the desperate", "very low quality").
- El tag "swearing" y la orientacion a contenido adulto implican que el modelo puede generar lenguaje soez o material no apto para todos los publicos; se requiere filtrado o moderacion en aplicaciones dirigidas al publico general.
- La parte de vision no esta documentada en detalle; los ficheros mmproj, si existen, estan en el repositorio estatico, y su funcionamiento con llama.cpp no esta verificado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.6-i1-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.6
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.6-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Goetia-26B-A4B-v1.6-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
