# abenzerps/Holo4-35B-A3B-MLX

## Resumen

Holo4-35B-A3B-MLX es un paquete de cuantizaciones en formato MLX del modelo Hcompany/Holo4-35B-A3B, un modelo de lenguaje y vision (vision-language model) con arquitectura de mezcla de expertos (MoE) de 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token. El modelo base lo desarrolla H Company, mientras que esta version cuantizada la publica el usuario abenzerps en HuggingFace.

El proposito declarado del modelo base es el uso de ordenador por parte de agentes (computer use), el trabajo guiado por herramientas y los flujos de trabajo agenticos. Se distribuye bajo licencia Apache 2.0 y esta pensado para ejecutarse en Apple Silicon mediante la libreria MLX (mlx-lm / mlx-vlm), lo que lo hace relevante para desarrolladores que quieren desplegar un VLM agentico en hardware local de Apple sin depender de GPUs dedicadas.

El repositorio ofrece tres niveles de cuantizacion (4, 6 y 8 bits) con tamanos de 18,19 GB, 26,25 GB y 34,32 GB respectivamente. Los tags del repositorio referencian la familia Qwen3.5/Qwen3.6, aunque no se detalla en la informacion disponible el grado exacto de derivacion arquitectonica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (vision-language); los tags del repo referencian la familia Qwen3.5/Qwen3.6 |
| Parametros totales | 35B (35.000 millones) |
| Parametros activos | 3B (3.000 millones) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (18,19 GB), 6-bit (26,25 GB) y 8-bit (34,32 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX, organizados en subcarpetas por nivel de cuantizacion |

## Arquitectura y entrenamiento

La informacion disponible indica que Holo4-35B-A3B es un modelo de mezcla de expertos (MoE) con 35.000 millones de parametros totales y 3.000 millones activos, y que es multimodal (vision-language), con pipeline `image-text-to-text`. Los tags del repositorio (qwen3.5, qwen3.6, moe, multimodal, computer-use, agent) sugieren una base arquitectonica tipo transformer MoE con capacidades de vision, aunque no se detalla la composicion exacta de expertos, el numero de capas ni la dimensionalidad.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El modelo base esta orientado explicitamente a tareas de control de ordenador y uso de herramientas, lo que implica un post-entrenamiento especifico para ese dominio segun la descripcion del autor del modelo base, pero no se aportan detalles tecnicos adicionales. Esta publicacion concreta no entrena nada: solo aplica cuantizacion MLX sobre los pesos originales.

## Capacidades

- Generacion de texto e interaccion conversacional multi-turno.
- Comprension de imagenes junto con texto (entrada image-text-to-text).
- Razonamiento orientado a agentes y ejecucion de tareas de varios pasos.
- Uso de ordenador (computer use): interpretacion de pantallas y seleccion de acciones.
- Uso de herramientas y flujos de trabajo guiados por tool servers, segun la descripcion del modelo base.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion.
- Capacidades de audio o voz: no disponibles.

## Casos de uso

- Agentes de automatizacion de escritorio: el modelo puede actuar como cerebro de un agente que observa la pantalla (capturas) y decide la siguiente accion, apoyandose en su naturaleza multimodal y en los 3.000 millones de parametros activos para mantener un coste de inferencia bajo por paso.
- Flujos de trabajo con tool servers: al estar disenado para trabajo guiado por herramientas, encaja en orquestadores tipo MCP o APIs de funciones donde el modelo selecciona y encadena llamadas a servicios externos.
- RPA asistida por IA en macOS: al distribuirse en MLX, se puede integrar en aplicaciones nativas de Apple Silicon para automatizar formularios, navegacion web o tareas ofimaticas sin salir del equipo.
- Prototipado local de agentes para desarrolladores: permite iterar sobre bucles de razonamiento multi-paso en un Mac con memoria unificada suficiente, evitando los costes y la latencia de red de APIs en la nube.
- Analisis de capturas de pantalla y documentos con imagenes: la entrada image-text-to-text permite extraer informacion estructurada de interfaces graficas, diagramas o capturas para generar resumentes o acciones.
- Evaluacion comparativa de cuantizaciones: las versiones de 4, 6 y 8 bits permiten medir el compromiso entre calidad y memoria en un mismo modelo, util para decidir el nivel de cuantizacion en produccion.
- Asistente de soporte tecnico con contexto de pantalla: puede recibir capturas del usuario y guiarle paso a paso en la resolucion de incidencias dentro de una aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una imagen (`assets/Holo4-35B-A3B_Benchmark.png`) con resultados reportados por H Company para el modelo original sobre tareas de ordenador, flujos largos y tool servers, pero no se incluyen valores numericos en el texto proporcionado.

## Requisitos de hardware

- Al ser un formato MLX, la inferencia esta orientada a Apple Silicon (chips M1/M2/M3/M4 y variantes Pro/Max/Ultra) con memoria unificada, no a GPUs NVIDIA o AMD.
- 4-bit: fichero de 18,19 GB; se estima necesario un equipo con al menos 24 GB de memoria unificada (por ejemplo M2 Pro de 24 GB o superior) para cargar el modelo con holgura de contexto.
- 6-bit: fichero de 26,25 GB; se estima un minimo de 32 GB de memoria unificada.
- 8-bit: fichero de 34,32 GB; se estima un minimo de 48 GB de memoria unificada.
- Caben en Macs de gama alta con memoria unificada suficiente; no estan pensados para GPUs de consumo tipo RTX, al requerir el runtime MLX.
- Opciones de despliegue: mlx-lm y mlx-vlm (Python API y CLI), con carga por subcarpeta segun la cuantizacion.
- Latencia y throughput: no disponibles. Al ser un MoE con solo 3B parametros activos, se espera un coste por token inferior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Formato / runtime | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| Holo4-35B-A3B-MLX (esta ficha) | 35B | 3B | no disponible | MLX safetensors (4/6/8 bits) | Apache 2.0 | no disponibles |
| Hcompany/Holo4-35B-A3B (modelo base) | 35B | 3B | no disponible | safetensors sin cuantizar | Apache 2.0 | referencia sin cifras en la informacion disponible |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo base ni de esta cuantizacion.
- Riesgo de alucinacion inherente a los modelos generativos: en tareas de computer use, una accion erronea puede tener consecuencias reales sobre el sistema operativo, por lo que se recomienda supervision y limites de accion.
- Las cuantizaciones de 4 y 6 bits pueden degradar la precision en tareas de razonamiento o de percepcion visual frente a los pesos originales; conviene validar el nivel elegido segun el caso de uso.
- No se especifican idiomas soportados; no puede confirmarse un rendimiento adecuado en castellano ni en otros idiomas.
- No se indica la longitud de contexto, lo que impide planificar flujos con historiales largos o pantallas de alta resolucion sin pruebas previas.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de cualquier componente derivado (por ejemplo, si procede de la familia Qwen) antes de un uso comercial.
- Al depender de MLX, el despliegue queda restringido a hardware Apple; no es portable directamente a vLLM, TGI o llama.cpp en GPUs de NVIDIA.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no hay validacion de la comunidad sobre la calidad de la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abenzerps/Holo4-35B-A3B-MLX
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Checksums del repositorio: https://huggingface.co/abenzerps/Holo4-35B-A3B-MLX/blob/main/SHA256SUMS
- Imagen de benchmarks del modelo base referenciada en la model card: `assets/Holo4-35B-A3B_Benchmark.png` (ruta dentro del repositorio)
