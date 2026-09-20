# aquaduck/GLM-4.7-Flash-MLX

## Resumen

`aquaduck/GLM-4.7-Flash-MLX` es una redistribucion en formato MLX del modelo GLM-4.7-Flash de Z.ai, publicada por Aquaduck. No se trata de un entrenamiento ni de un afinado: el repositorio aloja una copia completa en 4 bits (MLX) del modelo base y, ademas, dos paquetes de capas intermedias pensados para carga por etapas en la aplicacion de escritorio Aquaduck (formato `mlx-package-v1`). El modelo base declara 31.200 millones de parametros, 47 capas, atencion con 20 cabezas Q y 20 cabezas KV (GQA) y una dimension oculta de 2048.

El interes practico de esta ficha esta en dos puntos. Primero, es una via sencilla para ejecutar un modelo de ~31B en 4 bits sobre Apple Silicon mediante `mlx-lm`, con un unico archivo de pesos de aproximadamente 16,85 GB. Segundo, introduce un esquema de particionado por capas (corte en la capa 24) que permite repartir la carga entre dos etapas o nodos, algo poco habitual en repositorios de cuantizacion.

La ventana de contexto nativa declarada es de 202.752 tokens, lo que situa al modelo en el rango de contexto largo. La licencia es MIT, heredada del modelo base, lo que facilita el uso comercial. Conviene senalar que este repositorio concreto tiene un proposito de empaquetado y alojamiento: no aporta evaluaciones propias ni mejoras de calidad sobre el original, y la cuantizacion a 4 bits puede degradar el rendimiento respecto a las versiones en mayor precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4.7-Flash (transformer causal; la etiqueta del repositorio, `glm4_moe_lite`, apunta a una variante MoE del linaje GLM-4, aunque la model card no detalla el enrutado) |
| Parametros totales | 31,2 B |
| Parametros activos | no disponible |
| Longitud de contexto | 202.752 tokens (nativa) |
| Tipos de cuantizacion | 4 bits (MLX); no se ofrecen otras precisiones en este repositorio |
| Idiomas soportados | Multilingue segun la model card (mismo conjunto que el modelo base); listado concreto de idiomas: no disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` en formato MLX; un archivo completo (`model-00001-of-00004.safetensors`) y dos shards por capas (`layers-0-24/`, `layers-24-47/`) |
| Capas | 47 |
| Cabezas de atencion | 20 Q / 20 KV (GQA declarado) |
| Dimension oculta | 2048 |
| Punto de corte de shards | Capa 24 (indices de fin exclusivos, maximo 2 etapas) |
| Tamano del repositorio | 33,9 GB |
| Libreria | `mlx` (compatible con `mlx-lm` para el archivo completo) |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo GLM-4.7-Flash de Z.ai: un transformer causal de 47 capas con dimension oculta 2048 y atencion con 20 cabezas de consulta y 20 cabezas de clave/valor. La etiqueta de tipo de modelo del repositorio (`glm4_moe_lite`) sugiere una variante de mezcla de expertos dentro del linaje GLM-4, pero la model card no especifica numero de expertos, parametros activos por token ni politica de enrutado, por lo que esos datos no estan disponibles. La model card tambien menciona un modo de pensamiento (thinking) y un modo instruct, documentados en el modelo base.

En cuanto al entrenamiento, este repositorio no contiene ningun proceso de entrenamiento ni de re-cuantizacion: los pesos proceden de Z.ai, la cuantizacion a 4 bits en MLX proviene del repositorio base de Z.ai y Aquaduck unicamente aloja esa cuantizacion y, opcionalmente, la empaqueta en dos shards de capas contiguas. Por tanto, no hay informacion disponible sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones de decodificacion. La innovacion diferencial de este repositorio es exclusivamente de empaquetado: el corte en la capa 24 permite una carga escalonada o repartida entre dos nodos, sin alterar los pesos mas alla de la organizacion en archivos.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat propia del modelo base (modos thinking e instruct).
- Razonamiento multi-paso segun el modo de pensamiento documentado en el modelo base (el detalle de rendimiento no esta disponible en este repositorio).
- Generacion de codigo: capacidad heredada del modelo base; no hay evaluaciones publicadas en este repositorio.
- Capacidades multilingues declaradas de forma generica ("multilingual, same as base"), sin listado de idiomas.
- Manejo de contexto largo: hasta 202.752 tokens nativos, adecuado para documentos extensos y conversaciones de muchos turnos.
- Integracion con el ecosistema MLX (`mlx-lm`) para inferencia local en Apple Silicon.
- Carga por etapas mediante shards de capas para despliegues repartidos (exclusivo del entorno Aquaduck/Arc; no es un modelo completo por si solo).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada (el pipeline declarado es unicamente `text-generation`).

## Casos de uso

- Inferencia local en Mac con Apple Silicon: cargar `model-00001-of-00004.safetensors` con `mlx-lm` para disponer de un modelo de 31,2 B en 4 bits (unos 16,85 GB) sin depender de GPUs NVIDIA ni de servicios en la nube. Es el escenario principal del repositorio.
- Asistentes conversacionales de contexto largo: con 202.752 tokens de ventana se pueden mantener hilos de conversacion muy extensos o adjuntar documentacion tecnica completa sin trocear, usando la plantilla de chat del modelo base.
- Analisis de documentacion extensa: resumen, extraccion de datos y respuesta a preguntas sobre contratos, informes o bases de codigo que excedan los contextos tipicos de 8K-32K tokens.
- Procesamiento por lotes en local para prototipado: generar borradores, clasificaciones o reformulaciones sobre un equipo de sobremesa Apple, evitando costes por token de API durante fases de experimentacion.
- Despliegue por etapas en dos nodos: usar los shards `layers-0-24` y `layers-24-47` para repartir la carga entre dos maquinas en el flujo de Aquaduck Arc, util cuando la memoria unificada de un solo equipo es insuficiente.
- Evaluacion comparativa de cuantizaciones: emplear esta version 4 bits frente a releases en mayor precision del modelo base para medir la degradacion introducida por la cuantizacion en tareas concretas del propio flujo de trabajo.
- Investigacion sobre empaquetado de pesos: el esquema de corte por capas con indices de fin exclusivos sirve como referencia para experimentos de carga escalonada o paralelismo por capas en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay evaluaciones separadas para esta cuantizacion MLX ni para los shards, y remite a la documentacion de `zai-org/GLM-4.7-Flash`. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre el modelo.

## Requisitos de hardware

- Naturaleza del formato: MLX es un framework orientado a Apple Silicon, por lo que este repositorio esta pensado para Macs con chip de la serie M y memoria unificada, no para GPUs NVIDIA con CUDA.
- Memoria para los pesos: el archivo completo ocupa aproximadamente 16,85 GB, por lo que se necesita al menos ese espacio libre disponible para el modelo.
- Memoria total recomendada: no disponible de forma oficial. Como estimacion basada en el tamano del archivo, cabe esperar que un Mac con 32 GB de memoria unificada o superior sea el punto de partida razonable, quedando 24 GB y menos muy justos una vez anadida la cache KV.
- Cache KV: con 47 capas y una ventana de 202.752 tokens, la cache KV puede ser muy voluminosa en contextos largos. No se ha publicado ninguna cifra de consumo por token; debe medirse empiricamente para cada caso.
- GPUs NVIDIA (A100, H100, RTX 4090): no aplicables directamente con `mlx-lm`. Para estos aceleradores habria que acudir a la cuantizacion original u otras conversiones del modelo base, no a este repositorio.
- Shards: `layers-0-24` (~8,45 GB) y `layers-24-47` (~8,58 GB) no funcionan como modelos completos en `mlx-lm` estandar; requieren el cargador por etapas de Aquaduck Arc.
- Opciones de despliegue: `mlx-lm` para el archivo completo; aplicacion de escritorio Aquaduck para la asignacion y descarga automatica; vLLM, TGI, llama.cpp u Ollama no son compatibles con estos pesos MLX sin conversion previa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de mediciones comparativas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. Como referencia estructural dentro del propio linaje:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aquaduck/GLM-4.7-Flash-MLX` (este repositorio) | 31,2 B | 202.752 tokens | 4 bits MLX + shards por capas | MIT | HuggingFace, 33,9 GB |
| `zai-org/GLM-4.7-Flash` (base) | 31,2 B | 202.752 tokens | no disponible (precision original) | MIT | HuggingFace |
| Otras alternativas de ~30 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: la model card declara que el modelo presenta "las mismas capacidades, sesgos y riesgos" que el modelo base. No se ha publicado ningun analisis de sesgos especifico para esta version.
- Alucinacion: no hay evaluaciones de fidelidad ni de tasas de alucinacion para esta cuantizacion. Al ser un modelo de proposito general, debe validarse en dominios criticos.
- Degradacion por cuantizacion: el paso a 4 bits puede reducir la calidad respecto a las versiones de mayor precision del modelo base. No se han publicado mediciones del impacto.
- Idiomas: la model card solo indica "multilingue, igual que el base", sin listado de idiomas ni evaluaciones por idioma. El soporte real del castellano no esta verificado.
- Shards no autonomos: los directorios `layers-0-24` y `layers-24-47` no son modelos completos y no funcionan con `mlx-lm` estandar. Tratarlos como tales es un uso fuera de alcance declarado.
- Plantilla de chat obligatoria: debe usarse la plantilla del modelo base, incluidos los modos thinking e instruct. Otras plantillas producirán resultados incorrectos.
- Compatibilidad restringida: los pesos en MLX no son directamente utilizables en vLLM, TGI, llama.cpp, Ollama ni en GPUs CUDA sin una conversion adicional.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, con una fecha de creacion y actualizacion muy proximas entre si, lo que indica un artefacto recien publicado y sin validacion comunitaria.
- Licencia: MIT, heredada del modelo base, lo que permite uso comercial; conviene revisar igualmente las condiciones y directrices del modelo original de Z.ai antes de un despliegue en produccion.
- Fechas: el repositorio figura creado el 19 de septiembre de 2026, una fecha posterior a los modelos GLM-4 publicados hasta ahora; se recomienda verificar la vigencia y procedencia de los artefactos antes de integrarlos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aquaduck/GLM-4.7-Flash-MLX
- Modelo base y fuente de la cuantizacion: https://huggingface.co/zai-org/GLM-4.7-Flash
- Cuantizacion MLX de origen: https://huggingface.co/zai-org/GLM-4.7-Flash
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Perfil del responsable del alojamiento: https://huggingface.co/aquaduck
- Contacto: Aquaduck AI, https://huggingface.co/aquaduck
- La busqueda web realizada no devolvio articulos, papers ni demos relevantes sobre este modelo; los unicos resultados obtenidos no guardaban relacion con el tema.
