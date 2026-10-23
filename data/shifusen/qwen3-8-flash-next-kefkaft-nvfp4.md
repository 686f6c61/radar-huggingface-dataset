# Shifusen/Qwen3.8-Flash-Next-KefkaFT-NVFP4

## Resumen

Qwen3.8-Flash-Next-KefkaFT-NVFP4 es un checkpoint publicado por el usuario Shifusen que consiste en un adaptador LoRA (checkpoint-2967) entrenado sobre el dataset `Shifusen/kefka-sft` y fusionado de vuelta en `jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4`. No es un modelo entrenado desde cero: es el cuarto eslabon de una cadena que parte de `Qwen/Qwen3.8-Flash-Next`, pasa por una version "abliterated" (OrcaRouter), una cuantizacion NVFP4 con ModelOpt 0.46.0 (jpezzulli) y termina en este fine-tune. El resultado conserva el formato en disco del base: expertos enrutados en NVFP4, el resto en bf16 y la tabla de embeddings n-gram (PLE) en FP8 E4M3, con un total de 119.602.003.859 parametros y unas 135 GB de repositorio.

El modelo es un MoE hibrido de 48 capas con 512 expertos enrutados por capa, combinando proyecciones de atencion lineal Gated DeltaNet (36 capas) con atencion QSA (12 capas), ademas de un modulo de prediccion multi-token (MTP) y una torre de vision que no se entreno en este fine-tune. Su pipeline declarado es `image-text-to-text`, de modo que mantiene capacidad multimodal de entrada.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica poco comun: entrenamiento LoRA directamente contra un base cuantizado en NVFP4 con `nvfp4_merge_aware: true` y fusion posterior preservando el formato. Por otro, acumula caveats importantes (epoca parcial del 38 %, deltas de experto grandes, posible contaminacion por sample packing, licencia ambigua y ausencia total de evaluacion publicada) que lo sitúan como artefacto de investigacion, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 48 capas, 512 expertos enrutados por capa + experto compartido y router; atencion lineal Gated DeltaNet en 36 capas y atencion QSA en 12 capas; modulo MTP; torre de vision; tabla PLE (n-gram embeddings) en FP8 E4M3 |
| Parametros totales | 119.602.003.859 (~119,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento uso `sequence_len: 8192`; las 70 muestras mas largas, de hasta 12.087 tokens, se descartaron) |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 (ModelOpt 0.46.0); resto de tensores en bf16; tabla PLE en FP8 E4M3; etiqueta de HuggingFace "8-bit"; no hay versiones GGUF ni AWQ/GPTQ publicadas |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-license-1.0` (metadatos en conflicto: el README del origen declara Apache-2.0 y el fichero `LICENSE` incluido es la Qwen Community License 1.0) |
| Formato de pesos | safetensors (checkpoint ModelOpt NVFP4, shards `model*.safetensors` y `layer-*-experts-*.safetensors`), cargable con `transformers`; 296.475 tensores |
| Modalidad | image-text-to-text (entrada de imagen y texto) |
| Tamano del repositorio | 135,2 GB (~126 GiB segun el autor) |
| Modelo base | jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4 (revision `f24d2b68ff2814f24455ae86717be276619b5664`) |
| Dataset de entrenamiento | Shifusen/kefka-sft (`dataset_v1.segments.jsonl`), 50.642 registros |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-22 |

## Arquitectura y entrenamiento

La arquitectura heredada es un MoE con 48 capas y 512 expertos enrutados por capa, mas un experto compartido, router y tabla PLE. La atencion es mixta: 36 capas usan proyecciones Gated DeltaNet (`in_proj_qkv/z/a/b`, `out_proj`), un mecanismo de atencion lineal recurrente, y 12 capas usan atencion QSA (`q/k/v/o_proj`) con un indexador cuya mascara solo admite `sdpa` o `eager` en `transformers`. Se incluye ademas un modulo MTP y una torre de vision. Sobre el disco, los expertos enrutados estan codificados en NVFP4 (pesos FP4 con escalas), el resto en bf16 y la tabla PLE (47,7 GiB) en FP8 con `weight_scale` 0,000199.

El entrenamiento se hizo con Axolotl 0.21.0, transformers 5.20.1 y torch 2.14.0+cu130 sobre una unica B200 (179 GiB). El LoRA tiene r=16, alpha=32, dropout=0 y ataca las proyecciones DeltaNet (36 capas), las proyecciones QSA (12 capas) y los expertos enrutados via `lora_target_parameters` (`mlp.experts.gate_up_proj`, `mlp.experts.down_proj`, los 512 expertos x 48 capas). No se entrenaron experto compartido, router, PLE, vision ni MTP. Los expertos se entrenaron contra el base NVFP4 congelado mediante SonicMoE con `nvfp4_merge_aware: true` (forward con cuantizacion simulada sobre una rejilla nueva). Datos: 50.642 registros en formato `input_output`, perdida solo en segmentos etiquetados, sample packing y atencion `sdpa`. Optimizador adamw_torch_fused, lr 2e-4, coseno, 10 % de warmup, microbatch 1, acumulacion 1, gradient checkpointing. La tabla PLE se mantuvo en RAM de host con un plugin propio (`ple_offload.py`) porque `transformers` descarta el `weight_scale` por tensor al cargar. Rendimiento: 11-15 s/paso, pico de 143,8 GiB de GPU asignada.

El run se detuvo en el paso ~2.983 (38 % de la epoca) por una regla de plateau: parar cuando la perdida media del ultimo intervalo mejora menos del 2 % respecto al anterior. La fusion se hizo con `axolotl merge-lora` sin `--dequant`, esquivando un bug de `get_model_shards` (solo hacia glob de `model*.safetensors`, por lo que copiaba los 192 ficheros de expertos sin aplicarles el LoRA y generaba un indice sin tensores de experto); con el parche se aplico el LoRA a 324 de 296.475 tensores (228 de atencion/DeltaNet + 96 grupos de expertos).

| Checkpoint | Pasos | Perdida media del intervalo |
|---|---|---|
| 989 | 1-989 (incluye warmup) | 1,0788 |
| 1978 | 990-1978 | 1,0421 |
| 2967 (fusionado) | 1979-2967 | 1,0520 |

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (`conversational`), con perdida restringida a los turnos de respuesta durante el SFT.
- Entrada multimodal image-text-to-text: la torre de vision se conserva intacta, aunque no fue entrenada en este fine-tune.
- Razonamiento y generacion de codigo: capacidades heredadas del base Qwen3.8-Flash-Next; no hay evaluacion publicada que las cuantifique en este checkpoint.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este checkpoint concreto.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el base incluye modulo MTP (prediccion multi-token) que podria habilitar decodificacion especulativa, pero no se entreno ni se valido aqui.
- Multilingue: no disponible (idiomas no declarados).
- Comportamiento "uncensored": el linaje incluye una version abliterated, por lo que se espera menor rechazo a peticiones; no hay evaluacion que lo cuantifique.
- Capacidad de inferencia eficiente: expertos en NVFP4 con escalas de activacion byte-identicas al base, pensado para la ruta W4A4 de vLLM/SGLang con ModelOpt.

## Casos de uso

- Investigacion sobre fine-tuning en precision reducida: este checkpoint es un caso documentado de LoRA r=16 entrenado contra un base NVFP4 congelado y fusionado preservando el formato. Sirve para reproducir el pipeline Axolotl + SonicMoE + `merge-lora` y estudiar el error de re-cuantizacion (se reportan ratios de norma 1,05-1,13 y cosenos 0,69-0,93 frente al delta del adaptador).
- Estudio de linajes de abliteration y sus efectos: al comparar este checkpoint con `OrcaRouter/Qwen3.8-Flash-Next-Uncensored` y con el base NVFP4 se puede medir como un SFT corto (38 % de epoca) modifica el comportamiento de rechazo y la calidad general.
- Base para experimentos de personaje o estilo: el adaptador se entreno sobre `kefka-sft` en formato `input_output` con perdida solo en segmentos etiquetados, un esquema habitual para fijar una voz o persona concreta en conversaciones multi-turno. Requiere validacion previa porque el dataset no esta descrito en la model card.
- Evaluacion de despliegue NVFP4 en hardware Blackwell: probar la ruta SGLang del autor del base (RTX PRO 6000, 96 GB) y comparar con la ruta vLLM (`qwen4_exp` + ModelOpt NVFP4), que segun el autor no se ha probado con este checkpoint.
- Prototipado de asistentes con entrada de imagen en entornos controlados: la pipeline `image-text-to-text` permite pasar imagenes junto a texto; util para experimentos internos de descripcion o extraccion, nunca para atencion al cliente real sin evaluacion de alucinacion.
- Generacion de datos sinteticos para ablation studies: al ser un fine-tune de investigacion sin benchmarks, su uso razonable es producir corpus de comparacion entre variantes del mismo linaje, no datos de entrenamiento para produccion.
- Analisis de artefactos de cuantizacion: los 296.475 tensores y las 73.728 escalas de activacion identicas al base permiten estudiar que tensores cambian realmente tras una fusion LoRA sobre NVFP4 (`weight_scale` cambio en 73.611 de 73.728).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K ni evaluaciones multimodales para este checkpoint, y advierte explicitamente que no se evaluo la diferencia de ~1 % entre checkpoint-1978 y checkpoint-2967.

Los unicos numeros de rendimiento publicados son de entrenamiento: 11-15 s/paso, pico de 143,8 GiB de VRAM en una B200, y las perdidas medias por intervalo recogidas en la tabla de la seccion de arquitectura. No hay datos de latencia ni throughput de inferencia.

## Requisitos de hardware

- VRAM para inferencia: no publicada. Como referencia de orden de magnitud, los pesos ocupan 135,2 GB en disco (~126 GiB), por lo que la carga completa necesita una GPU o conjunto de GPUs con al menos esa capacidad; el autor del base lo probo en una RTX PRO 6000 Blackwell de 96 GB, lo que implica colocacion especifica de la tabla PLE.
- GPU recomendadas: B200 (usada para entrenar, 179 GiB), H100/H200 en configuracion multi-GPU, RTX PRO 6000 Blackwell 96 GB (unica configuracion de inferencia reportada por el linaje). No hay datos para A100 80 GB; por tamano de pesos, una sola A100 no es suficiente sin offload.
- GPU de consumo: no cabe. Ni RTX 4090 (24 GB) ni RTX 5090 (32 GB) alojan 135 GB de pesos; el checkpoint no tiene versiones GGUF y el formato ModelOpt NVFP4 no es directamente compatible con llama.cpp.
- Opciones de despliegue: SGLang mediante el fork `Pennyroyal/SGLang` (ruta validada por el autor del base en RTX PRO 6000); vLLM con `qwen4_exp` + ModelOpt NVFP4 (no probado con este checkpoint, segun el propio autor); `transformers` con el plugin de offload de PLE en RAM de host (el autor indica que `transformers` pierde el `weight_scale` de la tabla PLE al cargar y hay que reaplicarlo).
- Latencia y throughput: no disponibles para inferencia. En entrenamiento, 11-15 s/paso con microbatch 1 y `sequence_len: 8192` sobre B200.
- Almacenamiento: prever mas de 135 GB para el checkpoint y espacio adicional para el base si se quiere comparar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Estado |
|---|---|---|---|---|---|
| Shifusen/Qwen3.8-Flash-Next-KefkaFT-NVFP4 (este) | 119,6 B | no disponible | NVFP4 expertos + bf16 + PLE FP8 | qwen-community-license-1.0 (metadatos en conflicto) | 0 descargas, sin benchmarks, epoca parcial del 38 % |
| jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4 (base directo) | 119,6 B | no disponible | NVFP4 expertos + bf16 + PLE FP8 | heredada del linaje | Probado por su autor en RTX PRO 6000 con SGLang |
| OrcaRouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible (presumiblemente bf16) | heredada del linaje | Version abliterated del linaje |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | no disponible | Apache-2.0 segun el README de origen (en conflicto con el LICENSE incluido) | Modelo upstream, sin cuantizar |

La comparacion cuantitativa con alternativas de otro fabricante (por ejemplo, otros MoE de ~120 B) no esta disponible: no hay benchmarks publicados de este checkpoint que permitan situarlo frente a terceros.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni comparacion controlada contra el base. El autor recomienda verificar la capacidad general antes de confiar en el checkpoint.
- Deltas de experto grandes: el delta del LoRA supone ~6-22 % de la norma de peso de cada experto muestreado, una magnitud que puede degradar el comportamiento del base de forma no medida.
- Epoca parcial: solo se vieron el 38 % de los datos (paso ~2.983 de 7.905 previstos) y el learning rate seguia alto (1,57e-4) al detener, por lo que el plateau es en parte artefacto del schedule.
- Posible contaminacion por sample packing: con `sample_packing` activo y atencion `sdpa`, las muestras empaquetadas pudieron atenderse entre si durante el entrenamiento; Axolotl advierte de este riesgo y la mascara del indexador QSA solo soporta `sdpa`/`eager` en `transformers`.
- Modelo "uncensored": el linaje incluye una abliteration. No hay alineamiento de seguridad verificado, lo que implica riesgo alto de contenido inapropiado, dañino o ilegal y lo descarta para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no cuantificado. Al no haber evaluacion, no puede asumirse ningun nivel de fiabilidad factua.
- Bug de fusion relevante para replicacion: sin el parche a `get_model_shards`, `axolotl merge-lora` descarta silenciosamente el LoRA de los expertos y produce un indice sin tensores de experto. Cualquier reproduccion debe verificar el indice y el numero de tensores.
- Carga fragil en `transformers`: la tabla PLE (47,7 GiB en FP8) requiere offload a RAM de host y reaplicacion manual del `weight_scale` (0,000199) que la libreria descarta.
- Despliegue no verificado: la carga en vLLM (`qwen4_exp` + ModelOpt NVFP4, con la PLE en una tarjeta de 96 GB) no se ha probado. Solo SGLang esta reportado, y sobre el base, no sobre este checkpoint.
- Licencia ambigua: el autor declara `qwen-community-license-1.0`, pero el README del origen dice Apache-2.0 y el fichero `LICENSE` incluido es la Qwen Community License 1.0. Antes de cualquier uso comercial hay que resolver esta contradiccion; la Qwen Community License impone condiciones adicionales de atribucion y uso.
- Idiomas y contexto no declarados: no se puede asumir cobertura multilingue ni una ventana concreta; el entrenamiento se hizo a 8.192 tokens y descarto 70 muestras mas largas.
- Dataset sin documentar: `Shifusen/kefka-sft` no tiene descripcion en la model card (composicion, procedencia, licencia de los datos), lo que impide evaluar riesgo de sesgo o de contaminacion de datos.
- Estado de publicacion: 0 descargas y 0 likes, sin issues ni discusion; no hay evidencia de uso independiente.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Shifusen/Qwen3.8-Flash-Next-KefkaFT-NVFP4
- Modelo base directo: https://huggingface.co/jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4
- Version abliterated intermedia: https://huggingface.co/OrcaRouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Dataset de SFT: https://huggingface.co/datasets/Shifusen/kefka-sft
- Fork de SGLang usado para servir el base: https://github.com/jpezzulli/sglang-rtxpro6000

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con su linaje; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
