# mradermacher/Nezou-27B-CyberAbliterated-GGUF

## Resumen

Nezou-27B-CyberAbliterated-GGUF es la version cuantizada en formato GGUF del modelo dancingfrog/Nezou-27B-CyberAbliterated, publicada por el usuario mradermacher (nethype GmbH), un autor habitual de cuantizaciones para llama.cpp. El modelo original es un transformer multimodal (vision-language) de 27.320.697.856 parametros, etiquetado como qwen3_5, lo que situa su arquitectura en la familia Qwen3.5; incorpora ademas las etiquetas abliteration y abliterated, es decir, se ha modificado el modelo para eliminar la direccion de activacion asociada al rechazo de peticiones.

El problema que resuelve este repositorio es puramente de despliegue: el peso original en safetensors no se puede ejecutar en llama.cpp ni en herramientas derivadas, mientras que estas cuantizaciones si. El repositorio ocupa 79,7 GB e incluye variantes Q2_K (11,0 GB), Q4_K_S (15,9 GB) y Q8_0 (29,1 GB), ademas de los proyectores multimodales mmproj en f16 y Q8_0 necesarios para procesar imagenes.

Es relevante ahora porque permite ejecutar un modelo multimodal de ~27B con vision sobre hardware de consumo: la variante Q4_K_S, marcada por el autor como "fast, recommended", cabe en GPUs de 24 GB como la RTX 3090 o la RTX 4090. La model card del repositorio no documenta el entrenamiento, los datos ni los benchmarks del modelo base, y el modelo original acumula cero descargas y cero likes en el momento de la consulta, por lo que su procedencia y calidad no estan contrastadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) etiquetado como qwen3_5; detalles de capas, atencion y componentes no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Publicadas en el repo: Q2_K (11,0 GB), Q4_K_S (15,9 GB), Q8_0 (29,1 GB); proyectores mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB). Anunciadas en las etiquetas del autor: x-f16, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ4_XS (no confirmadas como ficheros disponibles en el momento de la consulta) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Repositorio | 79,7 GB, 0 descargas, 0 likes |
| Creado / actualizado | 2026-10-01 / 2026-10-01 |
| Modelo base | dancingfrog/Nezou-27B-CyberAbliterated |
| Cuantizado por | mradermacher |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se detallan el numero de capas, la configuracion de atencion, el tipo de encoder visual ni el mecanismo de fusion de modalidades. La unica referencia estructural es la etiqueta qwen3_5, que apunta a la familia Qwen3.5, y la etiqueta multimodal / vision-language, confirmada por la existencia de ficheros mmproj (proyectores multimodales) en el repositorio, necesarios para que llama.cpp pueda procesar entradas de imagen junto al texto.

Tampoco hay datos sobre el entrenamiento: no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otra alineacion. Lo unico documentado tecnicamente es el proceso de abliteration aplicado al modelo original, que elimina la direccion de activacion responsable del rechazo de peticiones, y el propio proceso de cuantizacion. La model card del repositorio GGUF indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que en el momento de la publicacion no habia cuantizaciones ponderadas o con imatrix, aunque el autor deja abierta la posibilidad de anadirlas si se solicitan en la seccion de discusiones.

## Capacidades

- Generacion de texto conversacional en ingles a partir de un modelo multimodal de 27B parametros.
- Procesamiento de imagenes: el repositorio incluye proyectores mmproj (f16 y Q8_0), requisito para cargar la capacidad de vision en llama.cpp y derivados. El tipo de tareas visuales soportadas (VQA, OCR, descripcion, grounding) no esta documentado.
- Razonamiento: el modelo esta etiquetado como reasoning, aunque no se especifica si dispone de un modo de pensamiento explicito ni como activarlo.
- Generacion de codigo: no confirmada de forma explicita en la informacion disponible; la etiqueta cyber sugiere orientacion a dominios de seguridad informatica, sin detalle de las tareas concretas.
- Respuestas sin rechazo: la abliteration elimina el comportamiento de negativa ante peticiones, lo que cambia el perfil de respuesta respecto al modelo alineado original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado; no hay evidencia de soporte de castellano.
- Capacidades de audio: no disponibles.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede resumir y priorizar alertas de SIEM en ingles, encadenando el analisis de logs de texto con capturas de paneles o diagramas de red gracias al proyector multimodal. Requiere validacion humana de las conclusiones.
- Revision de configuraciones y codigo con fines defensivos: analisis de ficheros de configuracion, manifiestos de infraestructura y scripts en busca de patrones inseguros, integrado en un pipeline de CI como paso de revision asistida.
- Documentacion tecnica de seguridad: redaccion de informes de hallazgos, politicas y procedimientos a partir de notas dispersas, en ingles, con el modelo ejecutandose en local para no enviar datos sensibles a APIs externas.
- Laboratorio de investigacion en alineacion: al ser un modelo abliterado, sirve como sujeto de estudio para medir como cambia la tasa de rechazo, la utilidad y la seguridad respecto al modelo original, en entornos aislados.
- Asistente local sobre imagenes tecnicas: interpretacion de diagramas de arquitectura, capturas de herramientas o esquemas para responder preguntas en ingles, siempre que se cargue el fichero mmproj correspondiente.
- Procesamiento por lotes en una sola GPU: con Q4_K_S (15,9 GB) es viable ejecutar tareas de generacion y clasificacion de texto a gran escala en una RTX 3090 o RTX 4090 de 24 GB, manteniendo los datos en la maquina.
- Base para fine-tuning o destilacion sobre dominio propio: al ser un modelo denso de 27B con licencia Apache-2.0, se puede adaptar a vocabularios y flujos internos, aunque la falta de documentacion del entrenamiento original complica la trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ningun otro conjunto de evaluacion, y tampoco se aportan comparaciones con modelos de tamano similar. El unico dato de rendimiento indirecto es el grafico de perplejidad por tipo de cuantizacion enlazado por el autor (atribuido a ikawrakow), que compara tipos de cuantizacion entre si y no el modelo frente a alternativas.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano de los ficheros publicados; hay que anadir el consumo de la cache KV y el overhead del runtime, que depende de la longitud de contexto y del numero de secuencias concurrentes.

- Q2_K (11,0 GB): cabe en GPUs de 12 GB como la RTX 3060 12 GB o la RTX 4070, con perdida de calidad apreciable en un modelo de este tamano.
- Q4_K_S (15,9 GB): ajusta en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con contexto corto, y con holgura en 24 GB (RTX 3090, RTX 4090). Es la variante recomendada por el autor.
- Q8_0 (29,1 GB): requiere 32 GB o mas de VRAM (A100 40 GB, H100 80 GB) o reparto entre dos GPUs de 24 GB.
- Proyector multimodal: sumar 1,0 GB (mmproj-f16) o 0,7 GB (mmproj-Q8_0) cuando se use vision.
- Alternativa sin GPU: las variantes pequenas pueden ejecutarse en CPU con llama.cpp usando RAM del sistema; Q4_K_S exige al menos ~16 GB de RAM libre ademas del contexto.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, llama-server). vLLM y TGI tienen soporte de GGUF limitado o experimental y no estan confirmados para este modelo concreto. Para vision es imprescindible cargar el mmproj junto al fichero GGUF.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo publicados para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Nezou-27B-CyberAbliterated-GGUF | 27.320.697.856 | No disponible | GGUF (Q2_K, Q4_K_S, Q8_0, mmproj) | Apache-2.0 | Publicado; 0 descargas, 0 likes |
| dancingfrog/Nezou-27B-CyberAbliterated | 27.320.697.856 | No disponible | safetensors | Apache-2.0 | Modelo base del que derivan estas cuantizaciones |
| Alternativas de terceros de tamano y tarea similares | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, ni de datos de rendimiento que permitan establecer una comparacion cuantitativa con alternativas de la misma categoria (modelos multimodales de ~27B o modelos abliterados de seguridad). Cualquier comparacion de este tipo requeriria ejecutar evaluaciones propias.

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de la direccion de rechazo implica que el modelo puede responder a peticiones que el modelo alineado original rechazaria. No debe exponerse sin filtros, moderacion de entrada y salida, ni supervision humana.
- Riesgo de contenido danino: la combinacion de abliteration y de la orientacion cyber incrementa el riesgo de que el modelo genere instrucciones ofensivas o codigo malicioso. El uso debe limitarse a contextos legitimos (defensa, investigacion autorizada, docencia) con controles de acceso.
- Alucinacion: no hay benchmarks ni evaluaciones que permitan estimar la tasa de error factual. Al carecer de documentacion del entrenamiento, no se conoce la composicion de datos ni sus posibles sesgos.
- Idioma: solo se declara ingles. No hay evidencia de un rendimiento aceptable en castellano ni en otras lenguas.
- Contexto: la longitud de contexto no esta documentada. No se debe asumir un valor concreto (por ejemplo 32k o 128k) sin verificarlo en la configuracion del modelo base.
- Licencia: tanto el repositorio GGUF como el modelo base declaran Apache-2.0, lo que permite uso comercial; aun asi, conviene verificar los terminos del autor original y de la familia Qwen3.5 sobre la que se construye.
- Perdida por cuantizacion: Q2_K degrada de forma notable un modelo de 27B; para uso en produccion se recomienda Q4_K_S o superior. Las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion.
- Trazabilidad escasa: 0 descargas, 0 likes, sin datos de entrenamiento, sin benchmarks y con una model card centrada en el proceso de cuantizacion. No es una base recomendable para produccion sin una evaluacion previa propia.
- Vision: sin cargar el fichero mmproj correspondiente, el modelo no procesara imagenes aunque el repositorio sea multimodal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nezou-27B-CyberAbliterated-GGUF
- Modelo base: https://huggingface.co/dancingfrog/Nezou-27B-CyberAbliterated
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Nezou-27B-CyberAbliterated-GGUF
- Peticiones de modelos y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia el trabajo de cuantizacion: https://www.nethype.de/
