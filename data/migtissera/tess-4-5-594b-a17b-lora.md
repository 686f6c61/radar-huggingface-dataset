# migtissera/Tess-4.5-594B-A17B-LoRA

## Resumen

Tess-4.5-594B-A17B-LoRA es un adaptador LoRA en formato PEFT publicado por migtissera sobre el modelo base `thinkingmachines/Inkling-2-Small`, un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines Lab. El adaptador está pensado para dotar al modelo base de capacidades agenticas, de codificacion, razonamiento y uso de herramientas (tool use) afinadas especificamente para ese proposito. Es relevante porque se publica como pieza separada del modelo fusionado (Tess-4.5-594B-A17B), lo que permite servir el adaptador de forma dinamica en vLLM junto al checkpoint cuantizado sin necesidad de fusionarlo.

El adaptador tiene un diseno deliberadamente restringido: solo adapta las seis proyecciones de atencion de las 48 capas del transformer y la cabeza de unembedding (`lm_head`), dejando intactos los expertos enrutados del modelo MoE. Esta decision responde a una restriccion tecnica concreta: los expertos del checkpoint base estan en NVFP4 y MXFP8, y un LoRA que los tocase no podria fusionarse de forma exacta ni servirse sobre ellos en vLLM. El adaptador contiene 81,7 millones de parametros en FP32 (577 tensores, 327 MB) y se ha entrenado con Tinker durante una epoca sobre 46,9 millones de tokens del dataset agentico de codificacion Tess-4.5 v2.

La nomenclatura del repositorio (594B-A17B) sugiere un modelo base MoE con aproximadamente 594 mil millones de parametros totales y 17 mil millones activos, aunque esta cifra no se detalla en la informacion proporcionada y debe tratarse como inferencia a partir del nombre, no como dato confirmado. El modelo esta publicado bajo licencia Apache 2.0 y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (segun nomenclatura 594B-A17B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 594B (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | 17B (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros del adaptador LoRA | 81,7M (577 tensores, FP32, 327 MB) |
| Rank / alpha del LoRA | 32 / 32 (scaling 1.0) |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de despliegue en vLLM con `--max-model-len 262144`) |
| Tipos de cuantizacion | Base en NVFP4 y MXFP8 para expertos; atencion en BF16; adaptador en FP32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT, libreria `peft`) |
| Modelo base | thinkingmachines/Inkling-2-Small |
| Modalidad | image-text-to-text (multimodal) |
| Modulos adaptados | `wq_du`, `wk_dv`, `wv_dv`, `wo_ud`, `wr_du`, `gate_attn` en las 48 capas, mas `lm_head` |
| Entrenamiento | Tinker, 1 epoca, 46,9M tokens, lr 1e-4 con decaimiento lineal |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Inkling-2-Small, un modelo de arquitectura transformer con mezcla de expertos (MoE) y capacidad multimodal image-text-to-text. Segun los metadatos del adaptador, el modelo base tiene 48 capas y utiliza un esquema de atencion con seis proyecciones distintas por capa (`wq_du`, `wk_dv`, `wv_dv`, `wo_ud`, `wr_du`, `gate_attn`), lo que sugiere una variante de atencion con compuertas o proyecciones desacopladas. Los expertos enrutados estan cuantizados en NVFP4 y MXFP8, mientras que las proyecciones de atencion y el unembedding se mantienen en BF16.

El entrenamiento se realizo con Tinker, la plataforma de ajuste fino de Thinking Machines Lab, durante una epoca sobre 46,9 millones de tokens del dataset agentico de codificacion Tess-4.5 v2, con una tasa de aprendizaje de 1e-4 y decaimiento lineal. La innovacion tecnica principal es la restriccion del adaptador a las proyecciones de atencion y a `lm_head`, lo que permite fusionarlo exactamente en los pesos BF16 del checkpoint base (`W ← bf16(fp32(W) + (α/r)·B·A)`) o servirlo como adaptador dinamico sobre el checkpoint cuantizado en vLLM sin tocar los expertos NVFP4/MXFP8. No se detalla en la informacion proporcionada si hubo RLHF, DPO u otras fases de alineacion.

## Capacidades

- Generacion de texto y razonamiento con modo de esfuerzo de razonamiento configurable (`reasoning_effort: "high"`).
- Codificacion y tareas agenticas de programacion, segun el dataset de entrenamiento Tess-4.5 v2.
- Uso de herramientas (tool calling / function calling) con parser dedicado (`--tool-call-parser inkling` y `--enable-auto-tool-choice` en vLLM).
- Razonamiento multi-paso y comportamiento agentico en entornos con directorio de trabajo y definiciones de herramientas reales en el campo `tools`.
- Procesamiento multimodal image-text-to-text, heredado del modelo base Inkling-2-Small.
- Capacidades multilingues limitadas al ingles segun la model card.
- Soporte de adaptadores dinamicos en vLLM mediante `--enable-lora` y `--lora-modules`.

## Casos de uso

- Asistentes de codificacion en produccion: el adaptador afina al modelo sobre datos agenticos de codificacion, por lo que puede integrarse en pipelines de CI/CD o IDE para generar parches, explicar errores y proponer refactorizaciones con contexto de hasta 262.144 tokens.
- Agentes autonomos con tool calling: gracias al soporte de `--enable-auto-tool-choice` y al parser `inkling`, el modelo puede invocar funciones externas (APIs, shell, busqueda) en flujos multi-paso, adecuado para automatizacion de tareas de desarrollo.
- Analisis de repositorios completos: con 262.144 tokens de contexto, el modelo puede ingerir varios ficheros de codigo y documentacion en una sola peticion para tareas de revision, resumen o deteccion de bugs.
- Servicio multi-tenant con adaptadores intercambiables: al publicarse como LoRA PEFT, permite servir el mismo checkpoint base con distintos adaptadores por nombre de modelo (`model="tess"`), util para plataformas que ofrecen variantes especializadas sin duplicar pesos.
- Procesamiento de documentacion tecnica con imagenes: al heredar la modalidad image-text-to-text del modelo base, puede extraer informacion de diagramas, capturas de pantalla o diagramas de arquitectura junto con texto.
- Investigacion en ajuste fino eficiente: el adaptador sirve como referencia reproducible de como entrenar y fusionar LoRA sobre un MoE cuantizado en NVFP4/MXFP8 sin tocar los expertos, util para estudiar tecnicas de adaptacion sobre modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 327 MB (81,7M parametros en FP32), por lo que su almacenamiento es trivial; el coste real esta en el modelo base.
- El ejemplo oficial de despliegue usa `--tensor-parallel-size 4` con `--max-model-len 262144`, lo que implica un despliegue multi-GPU con al menos 4 GPUs de alta capacidad (tipo A100 80 GB o H100 80 GB) para el checkpoint completo.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) en su configuracion completa; el checkpoint base de 594B parametros totales requiere agregacion de memoria muy superior a los 24 GB de una RTX 4090.
- Opciones de despliegue: vLLM con soporte de LoRA (`--enable-lora --lora-modules tess=...`) o el modelo fusionado Tess-4.5-594B-A17B, que es la ruta probada por el autor.
- No se han publicado datos de latencia ni throughput en la informacion disponible.
- El autor indica que no ha realizado pruebas de carga del servicio con adaptadores; la ruta probada es el repositorio fusionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tess-4.5-594B-A17B-LoRA | 594B totales / 17B activos (inferido) + 81,7M de adaptador | 262.144 | Apache 2.0 | PEFT safetensors | Adaptador sobre Inkling-2-Small, multimodal, solo ingles |
| Tess-4.5-594B-A17B (fusionado) | 594B totales / 17B activos (inferido) | 262.144 | Apache 2.0 | safetensors | Misma capacidad, ruta probada por el autor |
| thinkingmachines/Inkling-2-Small | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible | Modelo base sin el ajuste agentico de Tess |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El adaptador solo modifica las proyecciones de atencion y `lm_head`; los expertos enrutados no se adaptan, por lo que la especializacion agentica puede ser parcial en comparacion con un ajuste completo.
- Solo declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de fidelidad en la informacion proporcionada.
- El autor no ha realizado pruebas de carga del servicio con adaptadores en vLLM; la ruta recomendada y probada es el modelo fusionado.
- El despliegue requiere multiples GPUs de alta gama; no es viable en hardware de consumo.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y condiciones del modelo base Inkling-2-Small antes de un uso comercial en produccion.
- Los sesgos conocidos no se detallan en la informacion proporcionada.
- La cifra de 594B/17B parametros proviene del nombre del repositorio y no esta confirmada en la model card; debe verificarse contra la documentacion del modelo base.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/migtissera/Tess-4.5-594B-A17B-LoRA
- Modelo fusionado: https://huggingface.co/migtissera/Tess-4.5-594B-A17B
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Thinking Machines Lab: https://thinkingmachines.ai
- Tinker: https://thinkingmachines.ai/tinker/
