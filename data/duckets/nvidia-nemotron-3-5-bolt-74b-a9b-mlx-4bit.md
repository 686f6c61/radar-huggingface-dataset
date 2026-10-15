# Duckets/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-4bit

## Resumen

Este repositorio contiene una conversion al formato MLX del modelo NVIDIA Nemotron 3.5 Bolt 74B A9B, publicada por el usuario Duckets (conversion y empaquetado por Juno). Se trata de una cuantizacion afin de 4 bits (group size 64, aproximadamente 4,61 bits por peso) que reduce el checkpoint original en BF16 a unos 40 GB, pensada para ejecucion local en hardware Apple Silicon mediante la libreria mlx-vlm.

El modelo base es un checkpoint "Star Elastic" de tipo MoE: sus 40 capas MoE tienen un numero de expertos por capa variable (entre 240 y 496) y tamanos intermedios tambien variables (entre 1536 y 2560), definidos en `block_configs` dentro de `config.json`. Segun el nombre del repositorio, el modelo tiene 74B parametros totales con unos 9B activos por token (A9B). Incluye la torre de vision C-RADIO, por lo que es un modelo omni (texto e imagen) con una ventana de contexto de 262.144 tokens.

Su relevancia es practica: permite ejecutar un modelo MoE de gran tamano con vision sobre un Mac, algo que el checkpoint BF16 original no facilita por tamano. Eso si, requiere un fork parcheado de mlx-vlm (`nemotron_h_omni`) porque el codigo estandar de mlx-lm/mlx-vlm asume capas MoE uniformes y no carga correctamente esta geometria elastica. El repositorio no declara licencia, idiomas soportados ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje hibrido Nemotron-H mas torre de vision C-RADIO (modelo omni); numero y tipo de capas de atencion no disponible |
| Parametros totales | 74B (segun el nombre del repositorio) |
| Parametros activos | ~9B (segun la nomenclatura A9B del nombre del modelo; no confirmado en la documentacion) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Afin de 4 bits, group size 64, ~4,61 bits por peso (~40 GB). Solo se ofrece esta variante en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors en formato MLX), libreria mlx-vlm |

## Arquitectura y entrenamiento

La model card describe el modelo base como "Nemotron-H hybrid language model" acompanado de la torre de vision C-RADIO. La informacion disponible no detalla la composicion exacta de la mezcla hibrida (proporcion de capas de atencion frente a capas de estado, ni el esquema de atencion empleado). Lo que si se documenta con detalle es la capa MoE, que es elastica: las 40 capas MoE presentan recuentos de expertos por capa entre 240 y 496, e intermedios entre 1536 y 2560, registrados en `block_configs` en `config.json`. Los campos planos tipo `num_experts` de `llm_config` son artefactos de exportacion y no describen la geometria real.

Esta conversion se genero con un paquete `nemotron_h_omni` parcheado de mlx-vlm que construye y apila cada capa MoE con su propia geometria. Los pesos de este repositorio ya estan en forma apilada por capa. Respecto a la torre de vision, el checkpoint original no incluye los pesos de final-layernorm de vision (`vision_projector`), por lo que ese modulo esta ausente de forma deliberada; segun el autor, la vision sigue funcionando (verificado mediante descripcion de imagen). No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO.

En cuanto a ajustes de configuracion aplicados frente a una conversion cruda: se elimino la clave redundante `_downsample_factor` de las configuraciones del procesador, se normalizo el centinela Infinity de `time_step_limit` a un numero plano y se anadio un `max_position_embeddings` de nivel superior para que los front-ends reporten la longitud de contexto real.

## Capacidades

- Generacion de texto y razonamiento general, heredados del checkpoint base Nemotron 3.5 Bolt 74B A9B.
- Descripcion e interpretacion de imagenes (capacidad omni verificada por el autor mediante descripcion de imagen), apoyada en la torre de vision C-RADIO.
- Procesamiento de contexto largo: hasta 262.144 tokens, verificado en LM Studio.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado en el repositorio.
- Modo "thinking" explicito u otros modos especiales: no documentado en el repositorio.
- Capacidades de audio: no mencionadas; pese a la etiqueta "omni", la unica modalidad adicional documentada es vision.

## Casos de uso

- Descripcion y analisis de imagenes en local: con la torre C-RADIO integrada, se puede enviar una imagen junto a una instruccion de texto y obtener una descripcion o extraccion de informacion, sin enviar los datos a un servicio externo.
- Analisis de documentacion tecnica muy extensa: gracias a los 262.144 tokens de contexto, se puede cargar un manual completo, un conjunto de especificaciones o un repositorio de documentacion en una sola pasada para resumir, buscar contradicciones o generar indices.
- Revision de diagramas y documentacion visual: combinacion de vision y contexto largo para interpretar diagramas de arquitectura, capturas de interfaces o graficos incluidos en un informe extenso y responder preguntas sobre ellos.
- Asistente conversacional de contexto largo en escritorio: integrado en LM Studio en un Mac, puede mantener conversaciones multi-turno sobre un corpus grande cargado previamente, util para analisis de contratos, expedientes o documentacion normativa.
- Prototipado e investigacion en Apple Silicon: permite evaluar comportamiento de un MoE de 74B con 9B activos en hardware de consumo de gama alta (Mac con memoria unificada amplia) antes de decidir un despliegue en servidor.
- Generacion y revision de texto asistida sobre material con imagenes: por ejemplo, redactar descripciones tecnicas a partir de capturas o tablas escaneadas, manteniendo el contexto de un documento largo.
- Extraccion estructurada de informacion de documentos largos con imagenes intercaladas, en flujos donde la privacidad impide usar APIs en la nube.
- Base para experimentacion con cuantizacion MLX: sirve como referencia para medir el impacto de la cuantizacion a 4 bits frente al checkpoint BF16 en tareas de texto y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros cuantizados: aproximadamente 40 GB, mas overhead de ejecucion.
- Memoria unificada recomendada (Apple Silicon): 64 GB como minimo practico para poder cargar el modelo; 96 GB o 128 GB para trabajar comodamente con contexto largo, dado que la cache KV a 262.144 tokens anade una demanda considerable. No se especifica el consumo exacto de KV cache por token en la informacion disponible.
- GPU tipo A100/H100: el formato MLX esta orientado a Apple Silicon; para estos aceleradores habria que partir del checkpoint BF16 o de otro formato compatible, no de este repositorio.
- GPU de consumo (RTX 4090, 24 GB): no cabe, ni siquiera en 4 bits, porque los pesos solos ocupan unos 40 GB.
- Opciones de despliegue: mlx-vlm con el paquete `nemotron_h_omni` parcheado (imprescindible; el codigo estandar de mlx-lm/mlx-vlm no carga la geometria elastica de este checkpoint) y LM Studio, donde se ha verificado la carga con los 262.144 tokens de contexto. En LM Studio hay que desactivar la cuantizacion de KV cache, porque esa opcion hace que se ignore el ajuste de longitud de contexto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Duckets/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-4bit | 74B | ~9B (segun nomenclatura) | 262.144 | 4 bits afin, ~40 GB | no disponible | HuggingFace, requiere mlx-vlm parcheado |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 (modelo base) | 74B | ~9B (segun nomenclatura) | 262.144 (segun esta conversion) | BF16 | no disponible | HuggingFace |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se indica licencia en el repositorio, por lo que el uso comercial queda en una situacion juridica indeterminada. Conviene consultar la licencia del checkpoint base antes de cualquier despliegue productivo.
- Dependencia de codigo parcheado: el checkpoint no carga correctamente con mlx-lm o mlx-vlm estandar. Sin el fork `nemotron_h_omni` que construye cada capa MoE con su geometria real, la carga es incorrecta.
- Formato no portable: al estar en MLX, solo es utilizable en Apple Silicon; no sirve directamente para vLLM, TGI, llama.cpp u Ollama.
- Vision sin `vision_projector`: el modulo de final-layernorm de vision no existe en el checkpoint original. El autor afirma que la vision funciona, pero es un modulo ausente por diseno y puede afectar a la calidad final en determinadas imagenes.
- Cuantizacion a 4 bits: la perdida de calidad frente al BF16 no esta cuantificada en el repositorio; no hay evaluaciones comparativas publicadas.
- Ajuste obligatorio en LM Studio: la cuantizacion de KV cache debe desactivarse para que se respete la longitud de contexto configurada.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al tratarse de un modelo de lenguaje de gran tamano, el riesgo existe en tareas de recuperacion de hechos y en interpretacion de imagenes ambiguas.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento homogeneo fuera del ingles sin evaluacion previa.
- Adopcion nula y sin validacion externa: el repositorio registra 0 descargas y 0 likes, y la unica verificacion documentada es la del propio autor (carga y generacion de texto mas descripcion de imagen).
- Contexto muy largo con coste elevado: aunque se declaran 262.144 tokens, no hay datos de consumo de memoria ni de degradacion del rendimiento con contextos extensos.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/Duckets/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-4bit
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Libreria de inferencia mlx-vlm (requiere el paquete `nemotron_h_omni` parcheado para este checkpoint): no se proporciona enlace especifico en la informacion disponible
- LM Studio: no se proporciona enlace en la informacion disponible
- Paper, blog o repositorio adicional: no disponible
