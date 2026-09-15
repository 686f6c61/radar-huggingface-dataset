# mradermacher/Haidass-Translate-143M-Instruction-GGUF

## Resumen

Haidass-Translate-143M-Instruction-GGUF es la version cuantizada en formato GGUF del modelo umeiko/Haidass-Translate-143M-Instruction, un modelo de traduccion automatica de 143.071.296 parametros (143 M) publicado por el cuantizador mradermacher. El modelo original esta etiquetado con la familia qwen3 en su model card, por lo que se trata de un transformer decoder-only denso de proposito especifico para traduccion, afinado por instrucciones, que cubre el par de idiomas ingles-chino. Su relevancia actual radica en que ocupa un nicho poco poblado: traduccion neuronal con un presupuesto de parametros muy bajo, lo que permite ejecutarlo en CPU, en portatiles sin GPU dedicada o en dispositivos con recursos limitados.

El repositorio no aporta pesos propietarios ni innovaciones de arquitectura propias: mradermacher se limita a convertir los pesos originales a GGUF y a generar doce cuantizaciones estaticas (desde Q2_K hasta f16), todas ellas con un peso de fichero inferior a 0,5 GB. Esto lo convierte en una pieza adecuada para pipelines de traduccion de bajo coste, preetiquetado de corpus y despliegues en el borde, donde un modelo de 7 B o 70 B seria desproporcionado.

La ficha se ha elaborado exclusivamente con los datos de la model card y de los metadatos de HuggingFace. La busqueda web asociada no devolvio informacion util sobre el modelo (los resultados corresponden a paginas corporativas de Microsoft), por lo que numerosos campos tecnicos quedan marcados como "no disponible" en lugar de rellenarse con suposiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (segun el tag `qwen3` de la model card); detalles internos no disponibles |
| Parametros totales | 143.071.296 (143 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

Datos adicionales del repositorio: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`. No hay cuantizaciones ponderadas ni con imatrix publicadas por el autor. Tamano total del repositorio: 1,6 GB (suma de los doce ficheros).

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 143 M de parametros, etiquetado con la familia Qwen3 y afinado por instrucciones para tareas de traduccion. La model card del repositorio cuantizado no documenta la configuracion concreta de capas, dimension de embedding, numero de cabezas de atencion ni la longitud de contexto soportada. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT sobre pares paralelos. Toda esa informacion esta ausente tanto en el README como en los metadatos disponibles.

La unica informacion tecnica relevante de este repositorio es el proceso de cuantizacion. Se han generado cuantizaciones estaticas (no ponderadas) mediante el pipeline de mradermacher, con conversion desde pesos HuggingFace (`convert_type: hf`) y cuantizacion de tensores de salida. No se documentan innovaciones arquitectonicas como atencion lineal, decodificacion especulativa, SSM ni arquitecturas hibridas. El tag `conversational` indica que el modelo esta preparado para su uso en pipelines de tipo conversacional ademas de la traduccion pura.

## Capacidades

- Traduccion automatica bidireccional entre ingles y chino (`en` -> `zh` y `zh` -> `en`), tarea principal declarada en el pipeline `translation`.
- Modelo afinado por instrucciones: acepta indicaciones en formato de instruccion en lugar de requerir unicamente texto plano, segun refleja el sufijo `Instruction` del modelo base.
- Formato conversacional: el tag `conversational` de HuggingFace sugiere compatibilidad con plantillas de chat, aunque la plantilla concreta no esta documentada en la model card.
- Modelo de lenguaje pequeno (tag `small-language-model`): puede generar texto de forma general, si bien su entrenamiento esta orientado a traduccion y no se documentan capacidades de razonamiento, codigo o matematicas.
- Compatibilidad con `transformers` como libreria de referencia del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues limitadas a los dos idiomas declarados; no hay evidencia de soporte para castellano ni para otros pares linguisticos.

## Casos de uso

- Traduccion EN-ZH de documentacion tecnica: el modelo puede integrarse en una pipeline que reciba ficheros Markdown o reStructuredText y devuelva la version traducida, con la ventaja de que 143 M de parametros permiten procesar grandes volumenes de documentos en CPU sin coste de GPU.
- Preetiquetado de corpus paralelos: util como generador de traducciones iniciales para construir datasets de entrenamiento o evaluacion, que despues se filtran y corrigen con un modelo mayor o con revisores humanos.
- Localizacion de fichas de producto en comercio electronico: traduccion de titulos, descripciones y atributos entre ingles y chino, con despliegue en un contenedor ligero que se ejecuta junto al resto de la plataforma de e-commerce.
- Traduccion de tickets de soporte: integracion en un sistema de helpdesk para que un operador en lengua china y un usuario en lengua inglesa puedan intercambiar mensajes, con tiempos de respuesta bajos al no requerir GPU.
- Subtitulado y transcripcion multilingue: traduccion de segmentos cortos de subtitulos (SRT/VTT) en una pipeline por lotes; el tamano reducido del modelo permite procesar miles de lineas en minutos por CPU.
- Traduccion en el borde o sin conexion: al ocupar menos de 0,5 GB incluso en f16, el modelo puede embeberse en aplicaciones de escritorio, moviles o dispositivos industriales mediante llama.cpp u Ollama, sin dependencia de servicios en la nube.
- Traduccion dentro de agentes conversacionales: uso como componente especializado de traduccion en un sistema multiagente, donde un modelo mayor gestiona el razonamiento y este modelo se encarga unicamente del paso de traduccion, reduciendo el coste por token.
- Filtrado y normalizacion de texto multilingue: dado su bajo coste, puede emplearse en tareas auxiliares de clasificacion o reescritura de texto corto en ingles y chino dentro de pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio cuantizado ni los metadatos de HuggingFace incluyen puntuaciones de BLEU, chrF, COMET, MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. La busqueda web realizada no aporto datos adicionales sobre el rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir del tamano de los ficheros publicados): menos de 1 GB en todos los casos, incluyendo pesos y cache KV. Las cuantizaciones Q2_K a Q6_K ocupan ficheros de 0,2 GB; Q8_0, 0,3 GB; f16, 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, e incluso iGPU integradas con suficiente memoria compartida). No se requiere A100, H100 ni GPU de centro de datos.
- Cabe holgadamente en cualquier GPU de consumo actual y en la mayoria de GPU integradas; tambien es viable la inferencia exclusiva en CPU.
- Opciones de despliegue: llama.cpp y sus derivados (llama-cli, llama-server), Ollama mediante un Modelfile, LM Studio, koboldcpp, llama-cpp-python. La integracion con vLLM es limitada para GGUF y no esta documentada por el autor; TGI no soporta GGUF de forma nativa. El modelo base en safetensors puede cargarse con `transformers`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en CPU moderna y muy alto en GPU, pero se trata de una expectativa cualitativa, no de un dato medido.
- Almacenamiento: el repositorio completo ocupa 1,6 GB; basta con descargar la cuantizacion elegida, de entre 0,2 y 0,4 GB.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas objetivas. Se incluyen como referencia dos alternativas conocidas del ambito de la traduccion automatica de codigo abierto, cuyos datos no provienen de la busqueda web asociada a esta ficha.

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Haidass-Translate-143M-Instruction-GGUF (este) | 143 M | en, zh | no disponible | Apache 2.0 | GGUF (12 cuantizaciones) |
| umeiko/Haidass-Translate-143M-Instruction (modelo base) | 143 M | en, zh | no disponible | Apache 2.0 | safetensors |
| NLLB-200-distilled-600M | 600 M | 200 idiomas | no disponible | CC-BY-NC-4.0 (no comercial) | safetensors |
| MADLAD-400-3B-MT | 3 B | 419 idiomas | no disponible | Apache 2.0 | safetensors |

Para un modelo comparable de la misma categoria (traduccion, menos de 200 M de parametros) y con licencia permisiva, no se ha identificado ningun equivalente en la informacion disponible. La ventaja diferencial de este modelo frente a las alternativas de la tabla es el tamano (entre 4 y 20 veces menor) y la disponibilidad de cuantizaciones GGUF listas para usar; su desventaja es la cobertura linguistica, limitada al par ingles-chino, y la ausencia total de datos de calidad de traduccion publicados.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay BLEU, chrF ni COMET, por lo que la calidad de traduccion es desconocida y no puede compararse objetivamente con alternativas.
- Cobertura linguistica muy restringida: solo ingles y chino. No soporta castellano ni otros idiomas, lo que descarta su uso directo en la mayoria de proyectos en espanol.
- Longitud de contexto desconocida: al no estar documentada, no es posible garantizar el comportamiento en documentos largos; se recomienda segmentar la entrada y validar empiricamente.
- Riesgo de alucinacion y de omision de contenido: los modelos de traduccion de este tamano tienden a omitir o resumir fragmentos en textos largos o con terminologia especializada. Requiere verificacion en dominios tecnicos, legales o medicos.
- Sesgos: no se documenta la composicion del corpus de entrenamiento, por lo que no se pueden evaluar sesgos de genero, culturales o politicos en las traducciones generadas.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K pueden degradar de forma notable la calidad de traduccion frente a Q5_K_M, Q6_K, Q8_0 o f16. El propio autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q6_K como "very good quality", y senala que no ha publicado cuantizaciones ponderadas.
- Calidad de las cuantizaciones no verificada: no se aporta ninguna tabla de perplejidad asociada a los ficheros concretos de este repositorio.
- Licencia: Apache 2.0, permisiva para uso comercial, siempre que se conserve el aviso de licencia y se atribuya correctamente. Conviene verificar la licencia del modelo base en su propio repositorio antes de un despliegue comercial.
- Repositorio con cero descargas y cero likes en el momento de la consulta: es un artefacto reciente y sin validacion por parte de la comunidad.
- Sin garantias de mantenimiento: el autor de las cuantizaciones indica que no planea publicar versiones ponderadas o imatrix salvo peticion explicita en la seccion de discusiones.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Haidass-Translate-143M-Instruction-GGUF
- Modelo base: https://huggingface.co/umeiko/Haidass-Translate-143M-Instruction
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Haidass-Translate-143M-Instruction-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH (empresa que da soporte al autor): https://www.nethype.de/
