# mradermacher/chaski-r2-GGUF

## Resumen

chaski-r2-GGUF es la version cuantizada en formato GGUF del modelo SZLHOLDINGS/chaski-r2, publicada por el usuario mradermacher, conocido por convertir pesos de modelos abiertos a cuantizaciones de llama.cpp. No se trata por tanto de un modelo entrenado desde cero por este autor, sino de una redistribucion optimizada para inferencia local del trabajo original de SZLHOLDINGS, que a su vez se construye sobre un adaptador LoRA aplicado al modelo Qwen/Qwen3.5-0.8B. El repositorio contiene pesos de 752.393.024 parametros (segun los safetensors declarados) y ocupa 7,5 GB en total, contando las doce cuantizaciones publicadas.

El problema que resuelve es pragmatico: permitir ejecutar un modelo conversacional de menos de mil millones de parametros en hardware muy modesto (CPU, iGPU, portatiles y placas tipo Raspberry Pi) sin necesidad de GPUs de datacenter, ofreciendo desde variantes de 0,5 GB en Q2_K hasta 1,6 GB en f16. Es relevante en el ecosistema actual porque la demanda de modelos pequenos desplegables en el borde (edge) crece con las regulaciones de privacidad y con la necesidad de inferencia offline de bajo coste.

La informacion publicada es limitada: la model card del cuantizador se centra en la tabla de ficheros y en instrucciones genericas, y no aporta detalles sobre datos de entrenamiento, longitud de contexto, benchmarks ni capacidades concretas. El modelo declara un unico idioma (ingles) y licencia Apache-2.0. La busqueda web asociada no ha devuelto ninguna fuente tecnica relevante sobre este modelo, por lo que buena parte de las especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B, modelo base del adaptador); detalles no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (12 ficheros); el modelo original se distribuye como adaptador LoRA/SFT sobre transformers |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de la cadena de dependencias declarada en las etiquetas: el modelo base es SZLHOLDINGS/chaski-r2, cuyo adaptador se apoya en Qwen/Qwen3.5-0.8B. Las etiquetas `lora`, `sft`, `trl` y `unsloth` indican que el entrenamiento original consistio en un ajuste supervisado (SFT) mediante LoRA, probablemente realizado con las librerias TRL y Unsloth sobre el modelo Qwen citado. El numero de parametros resultante (752 millones) es coherente con un modelo denso de escala 0.8B, aunque no se especifica si los pesos publicados son el resultado de fusionar el adaptador con el modelo base.

No hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases adicionales de RLHF, DPO u optimizacion por preferencias. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanismos híbridos. La etiqueta `proposal-only` figura entre los tags del repositorio, pero su significado no se explica en la model card. El trabajo realizado por mradermacher se limita a la conversion y cuantizacion estatica (los comentarios internos del README indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`), sin cuantizaciones ponderadas ni con matriz de importancia (imatrix) en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Ajuste supervisado orientado a dialogo (etiqueta `sft`), lo que sugiere un uso previsto como asistente conversacional.
- Inferencia local en CPU y GPU de gama baja gracias a las cuantizaciones GGUF de 0,5 a 1,6 GB.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio, contexto largo): no documentadas.
- Ajuste fino posterior sobre los pesos cuantizados: no recomendado en formato GGUF; requeriria partir del modelo original.

## Casos de uso

- Asistentes conversacionales offline en dispositivos: con cuantizaciones Q4_K_M de 0,6 GB, el modelo puede ejecutarse integramente en local mediante llama.cpp u Ollama, evitando enviar datos del usuario a servicios externos. Es adecuado cuando el requisito es privacidad y no calidad puntera.
- Prototipado rapido de aplicaciones de chat: permite validar interfaces, flujos de prompt y pipelines de inferencia en un portatil sin GPU dedicada antes de escalar a un modelo mayor.
- Clasificacion y etiquetado de texto a gran escala en ingles: el coste por token es minimo, por lo que resulta viable procesar volumenes elevados de documentos en lote sobre CPU.
- Filtrado o enrutado previo (pre-router) en arquitecturas multi-modelo: un modelo de 0,8B puede decidir si una consulta requiere un modelo grande o si basta con una respuesta simple, reduciendo coste agregado. Esta aplicacion es una propuesta de uso, no una capacidad documentada por el autor.
- Educacion e investigacion sobre cuantizacion: el repositorio ofrece doce variantes del mismo modelo, lo que permite comparar empiricamente el impacto de Q2_K frente a Q8_0 en perplejidad y calidad de salida.
- Despliegue en hardware embebido: con ficheros desde 0,5 GB, es viable en placas SBC con 4-8 GB de RAM y en telefonos de gama media mediante runtimes compatibles con GGUF.
- Generacion de texto auxiliar de bajo riesgo: resumenes breves, reescritura de frases o generacion de titulos en ingles donde la supervision humana posterior es barata.
- Base para ajuste fino adicional: al derivar de un adaptador LoRA, sirve como punto de partida para experimentos de personalizacion en dominios concretos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluacion, y la busqueda web no ha devuelto documentacion tecnica asociada al modelo SZLHOLDINGS/chaski-r2.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el fichero de pesos (sin contar cache KV ni overhead del runtime):
  - Q2_K, Q3_K_S: aproximadamente 0,5 GB.
  - Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M: aproximadamente 0,6 GB.
  - Q5_K_S, Q5_K_M, Q6_K: aproximadamente 0,7 GB.
  - Q8_0: aproximadamente 0,9 GB.
  - f16: aproximadamente 1,6 GB.
- En la practica, sumar entre 0,3 y 1 GB adicionales por cache KV y buffers del runtime, dependiendo de la longitud de contexto efectiva, que no esta documentada.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 (sobradamente), asi como en iGPU modernas con memoria unificada.
- Tambien es viable en CPU exclusivamente (AVX2 o superior) y en Apple Silicon mediante Metal.
- No requiere A100, H100 ni aceleradores de datacenter; su uso en ese hardware seria desproporcionado salvo para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y cualquier runtime compatible con GGUF. El repositorio no incluye pesos en safetensors, por lo que para servirlo con vLLM o TGI habria que partir del modelo original SZLHOLDINGS/chaski-r2.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de rango 0,5B-1,7B frecuentemente usados como alternativa en el mismo nicho de inferencia local. Los datos de los modelos alternativos proceden de sus fichas publicas; los del modelo analizado se limitan a lo declarado en este repositorio.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicos |
|---|---|---|---|---|---|
| mradermacher/chaski-r2-GGUF | 752 M | no disponible | Apache-2.0 | ingles | no disponibles |
| Qwen2.5-0.5B | 0,49 B | 32 768 tokens | Apache-2.0 | multilingue | si, en la ficha del autor |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | Licencia comunitaria de Llama 3.2 | multilingue | si, en la ficha del autor |
| Gemma 3 1B | 1 B | 32 768 tokens | Licencia de Gemma | multilingue | si, en la ficha del autor |

No es posible comparar rendimiento de forma cuantitativa porque el modelo analizado carece de evaluaciones publicadas y de especificacion de contexto. En terminos de disponibilidad, chaski-r2-GGUF ofrece una ventaja clara en despliegue local por su catalogo de cuantizaciones, mientras que las alternativas cuentan con ecosistemas mas maduros, soporte multilingue documentado y contextos verificables.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de calidad, por lo que no deberia adoptarse en produccion sin una evaluacion propia previa.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos o conversaciones multi-turno extensas.
- Modelo unicamente en ingles: no hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso en productos dirigidos a usuarios hispanohablantes.
- Riesgo de alucinacion elevado por escala: con 752 millones de parametros, la tasa de afirmaciones incorrectas y de incoherencias en razonamiento es previsiblemente alta en comparacion con modelos de 7B o superiores. No se ha medido ni documentado.
- Sesgos: no documentados por el autor. Al ser un ajuste SFT sobre datos no descritos, los sesgos del corpus de entrenamiento y del modelo base son desconocidos.
- Trazabilidad limitada: el repositorio original (SZLHOLDINGS/chaski-r2) no expone en la informacion disponible los detalles del dataset, el proceso de entrenamiento ni la evaluacion.
- Etiqueta `proposal-only`: presente en el repositorio sin explicacion en la model card; conviene aclarar su significado con el autor antes de un uso serio, ya que podria implicar un estado no definitivo del modelo.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. Hay que verificar, no obstante, que el modelo base y el adaptador original respeten condiciones compatibles, algo que la informacion disponible no permite confirmar.
- Cuantizaciones de baja precision: las variantes Q2_K, Q3_K_S y Q3_K_M degradan notablemente la calidad. El propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0.
- No se ofrecen cuantizaciones ponderadas ni con imatrix, que suelen dar mejor relacion tamano/calidad que las estaticas.
- Cero descargas y cero valoraciones en el momento de la consulta: no existe validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-09-13 y ultima actualizacion 2026-09-13, con apenas ocho minutos de diferencia, lo que sugiere una publicacion sin revision posterior.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/chaski-r2-GGUF
- Modelo base declarado: https://huggingface.co/SZLHOLDINGS/chaski-r2
- Modelo subyacente del adaptador: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#chaski-r2-GGUF
- Peticiones de cuantizacion y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia el trabajo de cuantizacion: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible. La busqueda web realizada no devolvio ninguna fuente tecnica relacionada con chaski-r2.
