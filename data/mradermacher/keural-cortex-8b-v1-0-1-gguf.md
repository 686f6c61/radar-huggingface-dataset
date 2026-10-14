# mradermacher/Keural-Cortex-8B-v1.0-1-GGUF

## Resumen

Mradermacher/Keural-Cortex-8B-v1.0-1-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Keural-Cortex-8B-v1.0-1, desarrollado originalmente por Hikaf143. El modelo base tiene 8.190.735.360 parametros (unos 8,19 mil millones de parametros, dato de safetensors) y, segun las etiquetas declaradas, esta orientado a generacion de texto, conversacion, function calling y uso como agente. Los idiomas soportados son ingles (en) y coreano (ko), y la licencia es Apache 2.0.

El trabajo de mradermacher se limita a la conversion y cuantizacion del modelo original a GGUF, no al desarrollo del modelo en si. Esta conversion es relevante porque habilita la ejecucion local en CPU, GPU y entornos hibridos mediante llama.cpp y todo su ecosistema (Ollama, LM Studio, llama-cpp-python, etc.), algo que no es posible con los pesos originales en safetensors de forma ligera.

No se dispone de informacion publica sobre la arquitectura interna, la longitud de contexto o el proceso de entrenamiento del modelo base. Ni la model card del repositorio de cuantizacion ni los resultados de busqueda web aportan esos datos, por lo que varias especificaciones se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.190.735.360 (aproximadamente 8,19 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (16,5 GB), Q8_0 (8,8 GB), Q6_K (6,8 GB), Q5_K_M (6,0 GB), Q5_K_S (5,8 GB), Q4_K_M (5,1 GB), Q4_K_S (4,9 GB), IQ4_XS (4,7 GB), Q3_K_L (4,5 GB), Q3_K_M (4,2 GB), Q3_K_S (3,9 GB), Q2_K (3,4 GB) |
| Idiomas soportados | en (ingles), ko (coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (esta repo); el modelo base se publica en formato compatible con transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura del modelo base Keural-Cortex-8B-v1.0-1 en la documentacion proporcionada. El repositorio se distribuye bajo la libreria transformers y con la etiqueta de cuantizacion desde un base_model, lo que indica que el modelo original se publica con pesos compatibles con el ecosistema HuggingFace. No se especifica si se trata de un transformer denso, un MoE u otra variante, ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de ajuste como RLHF o DPO.

La unica innovacion tecnica documentada corresponde al proceso de cuantizacion realizado por mradermacher: se ofrecen cuantizaciones estaticas (etiquetadas como static quants en la model card) y se indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion. El proceso de conversion esta marcado como quantize_version 2, output_tensor_quantised 1 y convert_type hf, lo que implica que la conversion se hizo partiendo de los pesos en formato HuggingFace.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiquetas text-generation y conversational).
- Function calling, segun la etiqueta function-calling declarada por el autor.
- Uso como agente y razonamiento en varios pasos (etiqueta agent).
- Soporte bilingue ingles (en) y coreano (ko).
- Compatible con el ecosistema llama.cpp al estar en formato GGUF.
- No se documentan capacidades de vision, audio, ni modos de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Atencion al cliente bilingue ingles-coreano: el modelo puede gestionar conversaciones multi-turno en los dos idiomas soportados. No obstante, al no conocerse la ventana de contexto, habria que validar experimentalmente el volumen de historial que admite.
- Asistentes conversacionales locales: gracias a las cuantizaciones a partir de 3,4 GB (Q2_K), puede desplegarse en equipos sin GPU dedicada mediante llama.cpp u Ollama, util para prototipos y entornos de escritorio.
- Integracion en pipelines de agentes con function calling: las etiquetas sugieren soporte de llamadas a herramientas, lo que permite conectarlo a APIs externas, bases de datos o servicios en flujos automatizados.
- Procesamiento de texto en coreano para empresas: permite construir herramientas internas de resumen, clasificacion o generacion en coreano sin depender de servicios en la nube.
- Traduccion y asistencia bilingue ingles-coreano: uso como apoyo en redaccion o adaptacion de contenido entre ambos idiomas, sujeto a validacion de calidad.
- Despliegue en produccion de bajo coste: las variantes Q4_K_S y Q4_K_M (4,9 y 5,1 GB) estan marcadas como "fast, recommended" por el autor, adecuadas para servidores modestos o instancias con una unica GPU de gama media.
- Fine-tuning o experimentacion sobre el modelo base: el modelo original esta asociado a la libreria transformers, por lo que se puede partir de el para ajuste adicional y despues cuantizar de nuevo.
- Evaluacion comparativa en investigacion: util como punto de partida para estudiar el rendimiento de un modelo de 8B centrado en coreano frente a alternativas multilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y los resultados de busqueda web proporcionados no contienen datos tecnicos del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano del archivo GGUF; hay que sumar la memoria para el contexto/KV cache y overhead del runtime):
  - Q2_K: 3,4 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: 3,9 / 4,2 / 4,5 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: 4,7 / 4,9 / 5,1 GB
  - Q5_K_S / Q5_K_M: 5,8 / 6,0 GB
  - Q6_K: 6,8 GB
  - Q8_0: 8,8 GB
  - f16: 16,5 GB
- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q5_K_M encajan en tarjetas con 6-8 GB de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 2070). Q6_K y Q8_0 requieren del orden de 8-12 GB (RTX 3080, RTX 4070, RTX 4080). La variante f16 exige mas de 16 GB (RTX 4090, A100 40 GB, etc.).
- GPU recomendadas para un despliegue comodo: RTX 3060/4060 para cuantizaciones bajas; RTX 4070/4080 o superiores para Q6_K/Q8_0; A100 o H100 si se requiere f16 y alto throughput.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. Los servidores orientados a safetensors (vLLM, TGI) requeririan el modelo base en su formato original, no estos GGUF.
- Latencia y throughput estimados: no disponibles. Dependeran de la cuantizacion elegida, del hardware y del tamano de contexto configurado, que no se conoce.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo Keural-Cortex-8B-v1.0-1, por lo que no es posible una comparacion de rendimiento rigurosa. La tabla recoge unicamente especificaciones ampliamente documentadas de alternativas de tamano similar; los campos no verificados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks |
|---|---|---|---|---|---|
| Keural-Cortex-8B-v1.0-1 (esta ficha) | 8,19B | no disponible | en, ko | Apache 2.0 | no disponible |
| Llama 3.1 8B | 8,03B | 128k | multilingue | Llama 3.1 Community | no disponible aqui |
| Qwen2.5 7B | 7,61B | 128k | multilingue | Apache 2.0 | no disponible aqui |
| Mistral 7B | 7,24B | 32k | principalmente ingles | Apache 2.0 | no disponible aqui |

Nota: los datos de las alternativas corresponden a sus especificaciones oficiales conocidas; no se dispone de una evaluacion comun que permita compararlas directamente con Keural-Cortex-8B-v1.0-1.

## Limitaciones y consideraciones

- No hay datos publicos sobre sesgos del modelo, ya que no se documenta su dataset de entrenamiento ni su proceso de alineacion.
- Riesgo de alucinacion no cuantificado; al no existir benchmarks ni evaluaciones publicadas, no se puede estimar su fiabilidad factual.
- Cobertura idiomatica limitada a ingles y coreano; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera bajo.
- Longitud de contexto desconocida, lo que limita la planificacion de casos de uso que dependan de ventanas largas.
- Calidad degradada en las cuantizaciones de menor bit (Q2_K y Q3_K): el propio autor advierte que Q3_K_M tiene "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Las cuantizaciones ponderadas/imatrix no estan disponibles, por lo que no se puede recurrir a variantes optimizadas de mayor fidelidad en bit bajo.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia; conviene confirmar tambien las condiciones del modelo base Hikaf143/Keural-Cortex-8B-v1.0-1.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin adopcion ni validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-10-14) es posterior a la fecha tipica de publicacion de modelos de este tipo; conviene verificar la vigencia de la ficha en HuggingFace.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Keural-Cortex-8B-v1.0-1-GGUF
- Modelo base: https://huggingface.co/Hikaf143/Keural-Cortex-8B-v1.0-1
- Vista resumida de cuantizaciones: https://hf.tst.eu/model#Keural-Cortex-8B-v1.0-1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del autor de las cuantizaciones: https://www.nethype.de/
