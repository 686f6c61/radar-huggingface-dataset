# nitishsingla/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal nativo de pesos abiertos desarrollado por Moonshot AI (Kimi), presentado como su modelo mas capaz hasta la fecha. Su arquitectura es un Mixture-of-Experts (MoE) de 2,78 billones de parametros totales (2,8T segun la model card) que activa 104B por token, con una ventana de contexto de 1 millon de tokens y vision integrada: comprende texto, imagenes y video dentro del mismo modelo. La model card lo describe como el primer modelo abierto de la clase 3T.

La innovacion principal esta en la arquitectura: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), combinadas con un marco Stable LatentMoE que activa 16 de 896 expertos por token, lo que segun el autor supone una mejora de eficiencia de escalado de aproximadamente 2,5 veces respecto a Kimi K2. El modelo esta orientado a codificacion de largo horizonte, trabajo de conocimiento agentico y razonamiento, incluyendo orquestacion de herramientas de terminal.

Es relevante ahora porque publica pesos de frontera de escala 3T bajo la licencia Kimi K3, algo sin precedentes en el ecosistema abierto. Advertencia importante: la ficha analizada corresponde al repositorio `nitishsingla/Kimi-K3` en HuggingFace, una resubida de terceros con 0 descargas y 0 likes, no al repositorio oficial de la organizacion `moonshotai`. Todos los datos tecnicos proceden de la model card replicada en esa subida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida: 69 capas KDA (Kimi Delta Attention) + 24 capas Gated MLA |
| Parametros totales | 2.779.931.837.184 (2,78 billones) segun safetensors; la model card indica 2,8T |
| Parametros activos | 104B (16 de 896 expertos por token) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (etiqueta `compressed-tensors`); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (`license: other`, `license_name: kimi-k3`) |
| Formato de pesos | safetensors (compressed-tensors, 8 bits); tamano del repositorio 1561 GB |
| Numero de capas | 93 (1 capa densa) |
| Numero de cabezas de atencion | 96 |
| Dimension oculta de atencion | 7168 |
| Dimension latente MoE | 3584 |
| Dimension oculta por experto | 3072 |
| Numero de expertos | 896 (16 seleccionados por token) |
| Modalidades de entrada | texto, imagen y video (multimodal nativo) |
| Pipeline declarado | `image-text-to-text` |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE de 93 capas, de las cuales solo una es densa. El bloque de atencion es hibrido: 69 capas usan Kimi Delta Attention (KDA), un mecanismo de atencion con estado recurrente, y 24 capas emplean Gated MLA (Multi-head Latent Attention con compuerta). La dimension oculta de atencion es 7168 con 96 cabezas. La parte MoE opera sobre un espacio latente de 3584 dimensiones (Stable LatentMoE), con 896 expertos de 3072 dimensiones ocultas cada uno, de los que se activan 16 por token. La model card atribuye a esta combinacion (KDA + AttnRes + mayor esparsidad) una mejora de eficiencia de escalado de aproximadamente 2,5 veces frente a Kimi K2.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO: la model card proporcionada esta truncada y no incluye esas secciones. Tampoco se detallan los datos del entrenamiento multimodal. La unica innovacion tecnica documentada explicitamente en la informacion disponible es la citada combinacion de KDA, Attention Residuals y Stable LatentMoE, junto con el soporte nativo de texto, imagen y video.

## Capacidades

- Generacion de texto y razonamiento de nivel frontera, orientado segun el autor a codificacion de largo horizonte y trabajo de conocimiento.
- Codificacion agentica sostenida: sesiones largas de ingenieria con supervision humana minima, navegacion por repositorios de gran tamano y orquestacion de herramientas de terminal (se citan optimizacion de kernels de GPU, desarrollo de compiladores y diseno de chips).
- Capacidad agentica multi-paso: la model card describe el modelo como "agentic model", con uso de herramientas de terminal y flujos de trabajo end-to-end; no se detalla el esquema concreto de function calling.
- Vision nativa: comprension de imagenes y video dentro del mismo modelo, sin adaptadores externos segun la informacion disponible.
- Contexto largo: ventana de 1.000.000 de tokens, lo que habilita tareas sobre repositorios, corpus documentales o grabaciones extensas.
- Generacion de artefactos interactivos: investigacion profunda con visualizaciones, widgets, paneles (dashboards), diseno de movimiento y edicion de video.
- Soporte multilingue: no disponible (la model card no especifica el listado de idiomas).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Refactorizacion de repositorios grandes: con 1M de tokens de contexto, el modelo puede cargar modulos completos y dependencias cruzadas en una sola ventana y proponer cambios coherentes en lugar de parchear funciones aisladas.
- Agente de terminal para tareas de ingenieria: ejecucion iterativa de comandos, lectura de salidas, correccion de errores y repeticion del ciclo, adecuado para tareas como optimizacion de kernels o ajuste de pipelines de compilacion.
- Investigacion profunda automatizada: sintesis de fuentes extensas y generacion de informes con visualizaciones y dashboards incrustados, apoyandose en la ventana de 1M tokens para no perder trazabilidad de las fuentes.
- Analisis de video de larga duracion: al procesar video de forma nativa, permite resumir, indexar o extraer eventos de grabaciones extensas sin trocear el material en fragmentos independientes.
- Revision de documentacion tecnica y CAD: interpretacion de planos, capturas y diagramas junto con el texto asociado, util en flujos de ingenieria donde el contexto es mixto (imagen + especificacion escrita).
- Asistentes de conocimiento corporativo: conversaciones multi-turno sobre bases documentales internas completas, con capacidad de citar pasajes concretos gracias al contexto de 1M tokens.
- Automatizacion de edicion de video y motion design: generacion y ajuste de secuencias descritas en lenguaje natural, usando la comprension de video del propio modelo como bucle de verificacion.
- Desarrollo de videojuegos con vision en el bucle: el modelo puede inspeccionar capturas del estado del juego y modificar el codigo en consecuencia, segun los escenarios que cita la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada esta truncada, de modo que no se incluyen tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos. El repositorio declara la etiqueta `eval-results`, pero los valores concretos no aparecen en los datos facilitados.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del tamano de pesos indicado en los metadatos, no datos publicados por el autor.

- Almacenamiento de pesos: 1561 GB tal como se distribuye el repositorio (formato compressed-tensors, etiqueta 8-bit). Eso equivale a unos 4,5 bits por parametro de media sobre 2,78 billones de parametros.
- Alternativas de precision: en FP16/BF16 los pesos ocuparian aproximadamente 5,6 TB; una cuantizacion a 4 bits los dejaria en torno a 1,4 TB.
- VRAM para inferencia: solo los pesos del repositorio requieren del orden de 1,6 TB de VRAM agregada, cifra a la que hay que sumar el estado de atencion y el cache de contexto. No es desplegable en una unica GPU actual.
- GPU recomendadas: configuraciones multi-nodo con H100 80 GB (aproximadamente 20-24 unidades solo para pesos), H200 141 GB (del orden de 12-15 unidades) o B200. Las A100 80 GB son viables pero con mayor numero de tarjetas y menor ancho de banda.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Tampoco en estaciones de trabajo de 4x RTX 4090.
- Opciones de despliegue: el repositorio declara `transformers` como libreria, con la etiqueta `custom_code`, por lo que requiere `trust_remote_code=True` y una version de transformers compatible con la arquitectura KDA/AttnRes. Para servir en produccion serian necesarios marcos con soporte de MoE y atencion hibrida (vLLM o SGLang) una vez implementada la arquitectura. llama.cpp y Ollama no son opciones viables a esta escala.
- Latencia y throughput: no disponible. La arquitectura hibrida (69 capas de atencion con estado y 24 capas MLA) reduce teoricamente el coste del cache de contexto frente a atencion completa, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

No se dispone de especificaciones de modelos comparables en la informacion proporcionada. El unico modelo alternativo referenciado es Kimi K2, y solo como punto de comparacion de eficiencia de escalado.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (subida `nitishsingla/Kimi-K3`) | 2,78 billones | 104B (16/896 expertos) | 1.000.000 tokens | Kimi K3 License | Repositorio de terceros, 0 descargas, 1561 GB |
| Kimi K2 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Referenciado en la model card de K3, donde se afirma una mejora de ~2,5x en eficiencia de escalado a favor de K3 |
| Otros MoE abiertos de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio no oficial: `nitishsingla/Kimi-K3` es una resubida de un tercero, con 0 descargas y 0 likes en el momento del analisis. El repositorio de referencia es `moonshotai/Kimi-K3`. Conviene verificar la integridad de los ficheros antes de cualquier uso.
- Model card incompleta: el contenido disponible esta truncado (la tabla de especificaciones se corta en la fila de expertos seleccionados por token), por lo que faltan datos de entrenamiento, alineacion, idiomas y evaluacion.
- Riesgo de alucinacion: no hay evaluaciones publicadas en la informacion disponible que permitan cuantificarlo. En tareas de codigo y trabajo de conocimiento, la verificacion automatica de resultados sigue siendo necesaria.
- Idiomas: no se documenta la cobertura linguistica. El rendimiento en castellano es, por tanto, desconocido.
- Licencia: se declara `license: other` con nombre `kimi-k3`. No se especifican en la informacion disponible los terminos de uso comercial, restricciones de redistribucion ni obligaciones de atribucion; hay que consultar el fichero LICENSE del repositorio antes de cualquier despliegue productivo.
- Coste de despliegue: con 2,78 billones de parametros y 1561 GB de pesos, el modelo exige infraestructura multi-nodo y no es viable en hardware de consumo ni en configuraciones de una sola GPU.
- Formato: al distribuirse en 8 bits con `compressed-tensors` y requerir codigo personalizado, la compatibilidad con herramientas estandar de inferencia no esta garantizada y puede exigir adaptaciones.
- Ventana de 1M tokens: aunque el contexto sea amplio, no se documentan resultados de recuperacion efectiva a esa distancia (por ejemplo, pruebas tipo needle-in-a-haystack) en la informacion disponible.
- Metadatos del repositorio: la fecha de creacion y ultima actualizacion registradas (2026-09-12) son identicas, sin historial de revisiones posterior.

## Enlaces

- Repositorio analizado (resubida de terceros): https://huggingface.co/nitishsingla/Kimi-K3
- Repositorio oficial de la organizacion: https://huggingface.co/moonshotai
- Blog tecnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat oficial: https://www.kimi.com
- Sitio de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
- Fichero de licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces anteriores proceden de la model card del repositorio.
