# hermitdave/Inkling-2-Mini-MLX-RCO-4.5bpw

## Resumen

Inkling-2-Mini-MLX-RCO-4.5bpw es una cuantizacion mixta de precision del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario hermitdave mediante el pipeline `rco-mlx` sobre Apple Silicon. El modelo base es un VLM MoE de 26.388.641.280 parametros (26,4 B) con arquitectura de transformer "looped": 24 capas fisicas de decoder, de las cuales las 12 centrales se ejecutan tres veces por token (48 visitas de capa), con 128 expertos enrutados y routing top-8, una torre de vision de 23 capas y un borrador MTP DSpark en el checkpoint publicado.

El objetivo de esta publicacion es reducir el tamano del checkpoint original (19,53 GB) hasta 16,57 GB mediante una asignacion de bits variable por tensor: expertos enrutados en 3/4 bits, proyecciones de atencion en 6/8 bits y embeddings, `lm_head`, router, normalizaciones y torre de vision intactos en BF16. Es relevante para quienes despliegan modelos MoE multimodales en hardware Apple con `mlx-lm`, aunque la model card advierte de que las metricas de calidad aun son marcadores de posicion sin medir.

La licencia es Apache 2.0 y el formato de pesos es safetensors para `mlx-lm`. El autor advierte de que la carga requiere soporte de Inkling 2 en `mlx-lm` (PRs #2086 y #2061, ambos en borrador) y un remapeo `inkling2_loop -> inkling2` en `MODEL_REMAPPING`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE "looped" (24 capas fisicas, 12 centrales repetidas 3 veces = 48 visitas de capa); VLM con torre de vision de 23 capas |
| Parametros totales | 26.388.641.280 (26,4 B) |
| Parametros activos | no disponible (128 expertos enrutados, routing top-8) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin mixta por tensor: 8 bits (118 tensores), 6 bits (58), 4 bits (44), 3 bits (4); 4,46 bpw sobre pesos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); repo de 16,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con estructura "looped": 24 capas fisicas de decoder en las que las 12 centrales se ejecutan tres veces por token, resultando en 48 visitas de capa. Incorpora 128 expertos enrutados con routing top-8, una torre de vision de 23 capas (es un VLM) y un borrador MTP DSpark en el checkpoint publicado. La model card menciona ademas componentes especificos: proyecciones de atencion `q/k/v/r/o/gate/sink`, un `weight_proj` de atencion completa, kernels `conv1d` depthwise, una tabla de logits relativos, compuertas de mensaje de rango 64 y consultas de residuo de atencion / mensaje de bucle.

Sobre el entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO) no hay informacion en la documentacion proporcionada. La publicacion de hermitdave es una cuantizacion, no un reentrenamiento, y detalla el proceso: el checkpoint original almacena los expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), y el resto ya en BF16; no existe release BF16 del modelo. Como RCO necesita pesos en coma flotante, los expertos se dequantizaron primero a BF16 mediante las formulas documentadas (NVFP4: `W = E2M1[nibble] * FP8_E4M3[block scale] * (amax / outer_scale_denominator)`; MXFP8: `W = FP8_E4M3[value] * 2 ** (E8M0[scale] - 127)`). El autor advierte de que esta reconstruccion es exacta respecto al checkpoint publicado pero no equivale al BF16 original, ya que el redondeo NVFP4 ya esta incorporado.

La asignacion de bits es la siguiente: expertos enrutados como un unico tensor pre-apilado por (capa, proyeccion), 44 a 4 bits y 4 a 3 bits; proyecciones de atencion y `weight_proj` de atencion completa, 58 a 6 bits y 118 a 8 bits; y en BF16 sin tocar `embed_tokens`, `lm_head`, todas las RMSNorm, el router MoE, las consultas de residuo de atencion / mensaje de bucle, los kernels `conv1d` depthwise, la tabla de logits relativos, las compuertas de mensaje de rango 64 y la torre de vision completa.

## Capacidades

- Generacion de texto y razonamiento: modelo de lenguaje de 26,4 B con arquitectura MoE y capas repetidas.
- Vision: dispone de torre de vision de 23 capas (VLM), conservada en BF16 en esta cuantizacion.
- Codigo y matematicas: no hay informacion especifica en la documentacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking: no disponible.
- Decodificacion especulativa: el checkpoint original incluye un borrador MTP DSpark (`mtp.safetensors`), pero esta cuantizacion no lo incluye porque el modulo Inkling 2 de `mlx-lm` no tiene cabeza MTP.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo esta empaquetado para `mlx-lm` y ocupa 16,57 GB en disco, lo que permite ejecutarlo en equipos Mac con memoria unificada suficiente (por encima de ~17-18 GB libres) sin GPU dedicada.
- Prototipado de pipelines multimodales: al conservar la torre de vision en BF16, sirve para experimentar con tareas imagen-texto en local antes de pasar a despliegues mayores.
- Evaluacion de tecnicas de cuantizacion: util para comparar la asignacion RCO mixta (3/4 bits en expertos, 6/8 bits en atencion) frente al esquema NVFP4/MXFP8 fijo del checkpoint publicado.
- Investigacion sobre arquitecturas looped MoE: permite estudiar el comportamiento de un transformer con 12 capas repetidas tres veces y routing top-8 sobre 128 expertos en un entorno de escritorio.
- Desarrollo offline y privacidad: al ejecutarse integramente en local via MLX, encaja en escenarios donde los datos no pueden salir del dispositivo.
- Pruebas de integracion con `mlx-lm`: sirve como banco de pruebas para los PRs de soporte de Inkling 2 (#2086 y #2061) y para el remapeo `inkling2_loop -> inkling2`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de metricas (perplejidad en WikiText-2, KL frente al checkpoint NVFP4 nativo, acuerdo top-1, recuperacion zero-shot en 5 tareas, tok/s de decodificacion y RAM pico) pero todos los valores figuran como `TBD` (marcadores de posicion sin medir).

## Requisitos de hardware

- VRAM / memoria estimada: el repo pesa 16,57 GB; se necesita memoria unificada por encima de esa cifra (mas overhead de runtime y cache KV) para cargar el modelo.
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente; no se documentan GPU NVIDIA en la model card.
- Cabe en consumer GPU: no hay datos para GPU de consumo NVIDIA; en Apple Silicon depende del modelo de chip y de la memoria unificada disponible.
- Opciones de despliegue: `mlx-lm` con soporte de Inkling 2 (PRs #2086 y #2061, en borrador) y el remapeo `inkling2_loop -> inkling2`; hasta que se fusionen, hay que cargar con el arbol parcheado que acompana al modelo.
- Latencia y throughput: no disponibles (valores `TBD` en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| hermitdave/Inkling-2-Mini-MLX-RCO-4.5bpw | 26,4 B | no disponible | RCO mixta 3/4/6/8 bits, 4,46 bpw | Apache 2.0 | MLX, safetensors, 16,57 GB |
| thinkingmachines/Inkling-2-Mini (checkpoint publicado) | 26,4 B | no disponible | NVFP4 + MXFP8 en expertos, BF16 en el resto | Apache 2.0 | 19,53 GB, incluye borrador MTP DSpark |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Metricas de calidad sin medir: perplejidad, KL, acuerdo top-1, recuperacion zero-shot, tok/s y RAM pico figuran como `TBD` en la model card.
- Reconstruccion no equivalente al BF16 original: los expertos se dequantizaron desde NVFP4/MXFP8; el redondeo original ya esta incorporado y en las 20 capas NVFP4 el resultado puede igualar, no superar, al NVFP4 nativo.
- Dependencia de PRs en borrador: requiere soporte de Inkling 2 en `mlx-lm` (#2086 sobre #2061) y el remapeo `inkling2_loop -> inkling2`; sin ellos hay que usar el arbol parcheado.
- Sin cabeza MTP: el borrador DSpark (`mtp.safetensors`) no se incluye, por lo que no hay decodificacion especulativa con este paquete.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica ni sesgos por idioma.
- Riesgo de alucinacion: no documentado en la informacion disponible.
- Contexto maximo no disponible: no se puede planificar el uso en conversaciones largas sin ese dato.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes derivados.
- Publicacion con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Inkling-2-Mini-MLX-RCO-4.5bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pipeline de cuantizacion `rco-mlx`: https://github.com/hermitdave/rco-mlx
- PR de soporte Inkling 2 en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2086
- PR base en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2061
- Thinking Machines Lab: https://thinkingmachines.ai
