# mradermacher/chimera-gemma4-12b-spatial-rl-GGUF

## Resumen

`chimera-gemma4-12b-spatial-rl-GGUF` es la distribucion en formato GGUF del modelo `snwy/chimera-gemma4-12b-spatial-rl`, un ajuste fino de la familia Gemma 4 orientado al razonamiento espacial y al procesamiento de multiples imagenes. La cuantizacion la ha realizado mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y esta pensada para su uso con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.). El modelo base parte de Gemma 4, la cuarta generacion de la familia Gemma de Google DeepMind, y suma un entrenamiento con refuerzo (reinforcement learning) especializado en tareas espaciales.

El modelo cuenta con 12.913.983.536 parametros totales (aproximadamente 12,9 mil millones), lo que lo situa en la gama media-alta de modelos densos. Incorpora capacidades multimodales (multi-imagen) y esta etiquetado con `spatial-reasoning`, `multi-image` y `reinforcement-learning`. Su relevancia actual radica en que cubre un nicho poco atendido: el razonamiento sobre relaciones espaciales entre varias imagenes, util en robotica, vision artificial y tareas de comprension visual compleja.

La licencia es la Gemma License de Google, que impone restricciones de uso comercial y requiere aceptar terminos especificos. El modelo solo declara soporte para ingles. Esta ficha describe tanto el modelo base como la version cuantizada GGUF, indicando explicitamente cuando un dato no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4); detalles internos no disponibles |
| Parametros totales | 12.913.983.536 (12,9 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas) |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma License) |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |
| Tamano del repo | 90,0 GB |
| Modelo base | snwy/chimera-gemma4-12b-spatial-rl |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la nomenclatura (`gemma-4`) se infiere que deriva de la familia Gemma 4 de Google DeepMind, pero no se especifican en la model card datos como el numero de capas, la dimension oculta, el mecanismo de atencion ni la composicion exacta del dataset de entrenamiento. El modelo incorpora procesamiento multimodal de multiples imagenes, segun las etiquetas `multi-image` y `spatial-reasoning`.

El entrenamiento incluye una fase de reinforcement learning (la pipeline declarada es `reinforcement-learning`) orientada especificamente al razonamiento espacial. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. La cuantizacion GGUF la ha realizado mradermacher mediante conversion desde el formato Hugging Face (`convert_type: hf`), con cuantizaciones estaticas (no se han publicado versiones con imatrix/weighted en el momento de la ficha).

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento espacial: comprension de relaciones geometricas y posicionales, presumiblemente entre objetos y escenas.
- Procesamiento de multiples imagenes de forma conjunta (multi-image), lo que permite comparar o razonar sobre varias imagenes en una misma consulta.
- Capacidades multimodales derivadas de la base Gemma 4 (vision), aunque no se detallan en la model card.
- Entrenamiento con reinforcement learning para mejorar el razonamiento espacial.
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte explicito de agentes o multi-step reasoning mas alla del razonamiento implicito.
- Capacidades multilingues: solo ingles declarado.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Robotica y navegacion: el modelo puede analizar varias imagenes de un entorno (por ejemplo, vistas de camaras distintas) para razonar sobre la posicion relativa de objetos y obstaculos, aprovechando su entrenamiento especifico en razonamiento espacial.
- Analisis de imagenes medicas o tecnicas comparativas: comparar varias capturas de una misma escena o estudio para detectar cambios de posicion, tamano o disposicion, gracias a la capacidad multi-imagen.
- Verificacion de montaje o inspeccion industrial: dado un conjunto de fotografias de un producto o instalacion, razonar sobre si las piezas estan correctamente colocadas y en la posicion esperada.
- Asistencia en diseno y arquitectura: interpretar varias vistas o planos de un espacio para responder preguntas sobre distribucion, orientacion y relaciones espaciales entre elementos.
- Educacion en geometria y ciencias: generar explicaciones sobre relaciones espaciales a partir de diagramas multiples, util en entornos de aprendizaje asistido.
- Analisis de imagenes satelitales o de teledeteccion: comparar varias imagenes de una zona para razonar sobre cambios espaciales y disposicion de elementos en el terreno.
- Prototipado de agentes visuales: servir como componente de percepcion espacial en pipelines de investigacion que requieran comparar multiples vistas, desplegado via llama.cpp u Ollama en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin overhead de contexto):
  - Q2_K: ~5,3 GB
  - Q3_K_S: ~6,1 GB
  - Q3_K_M: ~6,6 GB
  - Q3_K_L: ~7,1 GB
  - IQ4_XS: ~7,3 GB
  - Q4_K_S: ~7,7 GB
  - Q4_K_M: ~8,0 GB
  - Q5_K_S: ~9,1 GB
  - Q5_K_M: ~9,3 GB
  - Q6_K: ~10,7 GB
  - Q8_0: ~13,8 GB
- Anadir margen para el contexto (KV cache) y, en su caso, para el procesador de vision (`mmproj`), que no se incluye en esta cuantizacion (`skip_mmproj: 1`).
- GPU recomendadas: para Q4_K_M y superiores, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) permiten ejecutar comodamente las cuantizaciones hasta Q8_0. Para cuantizaciones Q2_K a Q4_K_S, tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070) pueden ser suficientes, con margen limitado para contexto.
- En el ambito profesional, A100 (40/80 GB) y H100 permiten ejecutar el modelo en FP16 o Q8_0 con contexto amplio, aunque el modelo es pequeno para estas GPU.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q2_K a Q8_0) en tarjetas de 8 GB en adelante, con limitaciones de contexto en las mas pequenas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con transformers, vLLM o TGI si se dispone del formato original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chimera-gemma4-12b-spatial-rl | 12,9 B | no disponible | multi-imagen | gemma | GGUF (esta ficha) y safetensors (base) |
| Gemma 4 (base, 12B) | ~12 B | no disponible | vision (segun familia) | gemma | safetensors, GGUF de terceros |
| Modelos de razonamiento espacial comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad; no se pueden comparar benchmarks ni contexto al no estar publicados.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de razonamiento espacial donde la interpretacion de imagenes puede ser erronea.
- La cuantizacion GGUF introduce perdida de calidad respecto al modelo en precision completa; las cuantizaciones Q2_K y Q3_K_S son las mas agresivas y pueden degradar notablemente el rendimiento.
- Esta version GGUF no incluye el procesador de vision (`skip_mmproj: 1`), por lo que para usar las capacidades multi-imagen puede ser necesario obtener el `mmproj` por separado o usar el modelo base.
- La licencia Gemma impone restricciones de uso comercial y requiere aceptar los terminos de Google; es responsabilidad del usuario revisarlos antes de un despliegue en produccion.
- No hay informacion publicada sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no cuenta con validacion de la comunidad.
- No se documentan garantias de soporte, mantenimiento ni actualizaciones por parte del autor de la cuantizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/chimera-gemma4-12b-spatial-rl-GGUF
- Modelo base: https://huggingface.co/snwy/chimera-gemma4-12b-spatial-rl
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#chimera-gemma4-12b-spatial-rl-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
