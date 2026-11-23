# giashere0/llama3-8b-game-scene-qlora

## Resumen

llama3-8b-game-scene-qlora es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base meta-llama/Meta-Llama-3-8B, publicado por el usuario giashere0. Su proposito es especializar el modelo en la generacion de "fichas de escena" para videojuegos: dado un contexto de juego (ambientacion, estado de animo, hora del dia, NPC y restricciones), el adaptador produce una tarjeta estructurada de seis campos (SCENE TITLE, NARRATION, IMAGE PROMPT, NEGATIVE PROMPT, AUDIO CUE, PLAYER CHOICES) pensada para alimentar un pipeline de sintesis de voz y Stable Diffusion.

El modelo no introduce una arquitectura nueva: hereda por completo la del Llama 3 8B (transformer denso, 8.000 millones de parametros, contexto de 8.192 tokens) y solo anade 6.815.744 parametros entrenables mediante LoRA con rango 16 y alpha 32 sobre las proyecciones q_proj y v_proj. El entrenamiento se realizo en 4 bits NF4 con doble cuantizacion, con 3 epocas sobre un dataset sintetico de 230 ejemplos en formato Alpaca.

Su relevancia es acotada y experimental: se trata de un proyecto de capstone con cero descargas y cero likes en el momento de la consulta, orientado a un dominio muy estrecho (24 ambientaciones de juego escritas a mano). Resulta util como ejemplo de especializacion ligera de un LLM mediante PEFT para generacion de contenido estructurado, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3 8B) con adaptador LoRA sobre q_proj y v_proj |
| Parametros totales | 8.000 millones (modelo base) + 6.815.744 parametros entrenables del adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base Llama 3 8B) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion (QLoRA); el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponibles (el modelo base Llama 3 soporta principalmente ingles y otros idiomas, pero la model card no lo declara) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Meta-Llama-3-8B, un transformer decoder-only denso con atencion causal estandar. La especializacion se realiza mediante QLoRA: el modelo base se carga cuantizado en 4 bits NF4 con doble cuantizacion, y se entrenan unicamente matrices de bajo rango (r=16, alpha=32) en las proyecciones de query y value de la atencion. El resultado son 6.815.744 parametros entrenables, una fraccion minima del total.

El dataset consta de 230 ejemplos en formato Alpaca (207 de entrenamiento y 23 de validacion), generados programaticamente a partir de 24 ambientaciones de juego escritas a mano, combinadas con 8 estados de animo, 5 momentos del dia y 4 tipos de restricciones, en tres niveles de dificultad (solo estado de animo; estado de animo y hora; estado de animo, hora, NPC y restriccion). El entrenamiento duro 3 epocas con learning rate 2e-4, batch size 2, precision fp16 y optimizador paged AdamW de 8 bits, alcanzando una perdida final de entrenamiento de 0,0044 y de validacion de 0,0121. No se documenta uso de RLHF ni DPO, ni innovaciones tecnicas adicionales mas alla del propio esquema QLoRA.

## Capacidades

- Generacion de texto estructurado: produce fichas de escena de seis campos con un formato fijo y consistente.
- Generacion de prompts para difusion: emite un IMAGE PROMPT y un NEGATIVE PROMPT listos para Stable Diffusion.
- Generacion de indicaciones de audio: emite un AUDIO CUE para pipelines de sintesis de voz.
- Generacion de opciones de jugador: emite PLAYER CHOICES como parte de la tarjeta de escena.
- Condicionamiento por atributos: acepta ambientacion, estado de animo, hora del dia, NPC y restricciones como entradas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no documentadas; el entrenamiento se realizo presumiblemente en ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado de narrativa procedural en videojuegos: el modelo genera tarjetas de escena coherentes con la ambientacion y el estado de animo indicados, lo que permite iterar rapidamente sobre el tono narrativo de un nivel sin escribir contenido a mano.
- Generacion automatica de arte conceptual: el campo IMAGE PROMPT puede enviarse directamente a Stable Diffusion para producir ilustraciones de escena alineadas con la narracion, reduciendo el trabajo de redaccion de prompts por parte del equipo artistico.
- Doblaje y ambientacion sonora automatizados: el campo AUDIO CUE alimenta un pipeline de sintesis de voz (TTS) que narra la escena, util para prototipos de juegos narrativos o experiencias interactivas.
- Diseno de arboles de decision: las PLAYER CHOICES generadas sirven como borrador de opciones de dialogo o accion, que el disenador de juego puede revisar y ampliar.
- Pruebas de concepto de pipelines multimodales: al integrar LLM, difusion y TTS en una sola salida estructurada, el adaptador sirve como componente de demostracion en proyectos de investigacion sobre generacion de contenido multimodal.
- Generacion de contenido para game jams: con un coste de inferencia bajo (adaptador de 6,8 millones de parametros sobre un 8B), permite a equipos pequenos producir material narrativo y visual de forma rapida en plazos muy cortos.
- Docencia y experimentacion con PEFT: es un ejemplo reproducible de especializacion QLoRA sobre Llama 3 con un dataset pequeno y controlado, util para cursos o talleres sobre ajuste fino eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento: perdida final de entrenamiento de 0,0044 y perdida de validacion de 0,0121 tras 3 epocas sobre 207 ejemplos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 3 8B en fp16 requiere aproximadamente 16 GB de VRAM; en 4 bits (NF4), alrededor de 5-6 GB, mas el pequeno overhead del adaptador (unos 27 MB en fp16 para 6,8 millones de parametros).
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues de produccion con el modelo en fp16 y lotes grandes; RTX 4090 (24 GB) para fp16 en una sola GPU; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: cabe en GPUs de consumo con 8 GB o mas si se carga el modelo base en 4 bits (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti); en 8 bits requiere alrededor de 10 GB.
- Opciones de despliegue: vLLM y TGI para servir el modelo base con el adaptador fusionado o cargado como modulo PEFT; llama.cpp y Ollama si se fusiona el adaptador y se convierte a GGUF; transformers con peft y bitsandbytes para prototipado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama3-8b-game-scene-qlora | 8B + 6,8M (adaptador) | 8.192 tokens | Adaptador LoRA especializado | llama3 | Hugging Face (0 descargas) |
| meta-llama/Meta-Llama-3-8B | 8B | 8.192 tokens | Modelo base denso | llama3 | Hugging Face (ampliamente usado) |
| Adaptadores QLoRA de dominio publico similares | variable | 8.192 tokens (si usan Llama 3) | Adaptador LoRA | segun base | no disponible (no se identifican alternativas directas en la informacion) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy estrecho: entrenado solo con 24 ambientaciones de juego; las peticiones de generos muy distintos o solicitudes largas pueden desviarse del formato de seis campos.
- Dataset sintetico: los 230 ejemplos fueron generados programaticamente, por lo que el estilo es mas uniforme que el de datos escritos por humanos y puede producir salidas repetitivas.
- Riesgo de alucinacion: como cualquier LLM, puede inventar detalles incoherentes con la ambientacion o el NPC indicados, especialmente fuera del dominio de entrenamiento.
- Volumen de validacion minimo: solo 23 ejemplos de validacion, insuficiente para estimar de forma robusta la generalizacion.
- Idiomas: no se declaran idiomas soportados; la especializacion se realizo presumiblemente en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: hereda la Llama 3 Community License, que impone condiciones de uso comercial, obligaciones de atribucion y restricciones para empresas con mas de 700 millones de usuarios mensuales; debe revisarse antes de cualquier despliegue en produccion.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni demos publicas; no hay evidencia de uso en produccion.
- Requiere cargar el modelo base por separado: el repositorio solo contiene el adaptador, lo que anade complejidad al despliegue frente a un modelo ya fusionado.

## Enlaces

- Hugging Face: https://huggingface.co/giashere0/llama3-8b-game-scene-qlora
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- Repositorio PEFT: https://github.com/huggingface/peft
- Licencia Llama 3: https://llama.meta.com/llama3/license/
