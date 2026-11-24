# mradermacher/Mistral-Heretica-12B-RP-Evolved-GGUF

## Resumen

Mistral-Heretica-12B-RP-Evolved es un modelo de lenguaje de 12.247.782.400 parametros, derivado de un merge (fusion de pesos) realizado con mergekit sobre la base Mistral y orientado a role-play (RP) y conversacion. El modelo original fue publicado por el usuario mrcuddle, y esta ficha corresponde a la version cuantizada en GGUF publicada por mradermacher, un conocido empaquetador de cuantizaciones para llama.cpp y ecosistemas compatibles.

La relevancia de esta publicacion es practica: facilita el despliegue local del modelo original en hardware de consumo mediante una bateria de cuantizaciones que van desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB). El repositorio incluye tambien variantes IQ4_XS y Q4_K_M, que suelen ofrecer el mejor equilibrio entre tamano y calidad para inferencia en GPU de gama media.

La informacion disponible es limitada: la model card del cuantizador no documenta arquitectura interna, contexto, licencia ni idiomas, y el modelo base se presenta como un merge con un dataset de role-play (mrcuddle/evolved-adonis-nsfw). Por tanto, muchos campos de esta ficha se marcan como no disponibles, y las estimaciones de rendimiento deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo Mistral, segun nomenclatura; no confirmado en la informacion) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun metadatos de la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El nombre del modelo y la etiqueta `mergekit` indican que se trata de un merge de pesos (weight merging), una tecnica que combina los parametros de varios modelos afinados para fusionar capacidades sin reentrenamiento adicional. El modelo base declarado es mrcuddle/Mistral-Heretica-12B-RP-Evolved, y el dataset asociado es mrcuddle/evolved-adonis-nsfw, lo que sugiere un ajuste orientado a role-play y contenido conversacional para adultos.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Esta ficha corresponde unicamente a la version cuantizada; el autor de la cuantizacion (mradermacher) no aporta detalles adicionales sobre el entrenamiento del modelo original.

## Capacidades

- Generacion de texto conversacional y role-play multi-turno, segun el proposito declarado del modelo base.
- Conversacion en ingles (unico idioma declarado en los metadatos).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que permite servirlo mediante APIs compatibles con el ecosistema transformers.
- Inferencia local mediante llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades de codigo o matematicas mas alla de las genericas de un modelo de 12B.

## Casos de uso

- Role-play conversacional local: el modelo esta disenado para mantener personajes y dialogos multi-turno; su despliegue en GGUF permite ejecutarlo en un portatil con GPU de gama media sin depender de la nube.
- Prototipado de chatbots de ficcion interactiva: con la cuantizacion Q4_K_M (7,6 GB) se puede integrar en una aplicacion de escritorio o web local para generar narrativa ramificada.
- Experimentacion con merges de modelos: investigadores interesados en evaluar el efecto de las tecnicas de mergekit pueden comparar esta version cuantizada con el modelo base sin necesidad de infraestructura de gran escala.
- Evaluacion de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir la degradacion de calidad (perplejidad) frente al coste de memoria en un mismo modelo.
- Despliegue en entornos con recursos limitados: la variante Q2_K (4,9 GB) permite ejecutar el modelo en GPUs con 6-8 GB de VRAM, util para demos y pruebas de concepto.
- Generacion creativa asistida en ingles: redaccion de dialogos, guiones y ficcion interactiva, aprovechando el ajuste conversacional del modelo base.
- Fine-tuning posterior sobre GGUF no es directo; para adaptaciones adicionales seria necesario partir del modelo original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del archivo GGUF y el contexto):
  - Q2_K: ~4,9 GB de pesos; con contexto moderado, ~6-7 GB de VRAM.
  - Q4_K_M: ~7,6 GB de pesos; ~9-10 GB de VRAM con contexto moderado.
  - Q6_K: ~10,2 GB de pesos; ~12 GB de VRAM.
  - Q8_0: ~13,1 GB de pesos; ~15 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5; RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; A100/H100 no son necesarias para este tamano, aunque permitirian servir varias instancias en paralelo.
- Cabe en GPU de consumo: si, en la mayoria de variantes; Q2_K y Q3_K_S caben incluso en GPUs de 8 GB, y Q4_K_M en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, transformers con aceleracion por GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Heretica-12B-RP-Evolved (esta ficha) | 12,25 B | no disponible | no disponible | GGUF | Merge orientado a role-play; cuantizaciones de 4,9 a 13,1 GB |
| Modelo base mrcuddle/Mistral-Heretica-12B-RP-Evolved | 12,25 B | no disponible | no disponible | safetensors | Version sin cuantizar del mismo modelo |
| Mistral-Heretica-12B-RP-Evolved-i1-GGUF (mradermacher) | 12,25 B | no disponible | no disponible | GGUF (imatrix) | Variante con cuantizaciones ponderadas/imatrix del mismo modelo |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta especificada en la informacion disponible; antes de un uso comercial es imprescindible verificar la licencia del modelo base (mrcuddle/Mistral-Heretica-12B-RP-Evolved) y de los modelos fusionados en el merge.
- El dataset asociado (mrcuddle/evolved-adonis-nsfw) indica contenido para adultos; el modelo puede generar material NSFW y no es adecuado para aplicaciones dirigidas a menores o entornos sin moderacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado en las cuantizaciones de menor bits (Q2_K, Q3_K_S).
- Solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- No se documentan sesgos conocidos, pero al ser un merge de modelos afinados con datos de role-play, es probable que herede sesgos de sus componentes.
- La cuantizacion Q3_K_M esta marcada por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- No hay informacion sobre contexto maximo soportado; no debe asumirse una ventana larga sin verificacion empirica.
- El repositorio ocupa 84,7 GB e incluye todos los quants; conviene descargar solo la variante necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mistral-Heretica-12B-RP-Evolved-GGUF
- Modelo base: https://huggingface.co/mrcuddle/Mistral-Heretica-12B-RP-Evolved
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Mistral-Heretica-12B-RP-Evolved-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Mistral-Heretica-12B-RP-Evolved-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
