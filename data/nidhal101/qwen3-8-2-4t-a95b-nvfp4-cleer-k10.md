# Nidhal101/Qwen3.8-2.4T-A95B-NVFP4-CLEER-k10

## Resumen

`Nidhal101/Qwen3.8-2.4T-A95B-NVFP4-CLEER-k10` es un proxy de benchmarking derivado de `nvidia/Qwen3.8-2.4T-A95B-NVFP4`, construido por Nidhal101 para la metodología CLEER-Text (Sustainable AI Group). No es un modelo de lenguaje utilizable: el texto que genera esta degradado por diseno. Su proposito es reproducir el coste energetico y computacional por token de un despliegue MoE de gran escala en un solo nodo, sin necesidad de servir los 512 expertos enrutados por capa del modelo original.

El modelo conserva la arquitectura `qwen3_5_moe_text` del original (transformer con mezcla de expertos, modo thinking obligatorio y contexto nativo de 262K tokens extensible a 1M segun la informacion publica del modelo base de Qwen) pero reduce cada capa MoE a 10 de sus 512 expertos enrutados, exactamente el numero que se activa por token. De este modo, cada token recorre todos los expertos retenidos, igualando la aritmetica y el trafico de memoria por token del modelo completo. El checkpoint ocupa 85,6 GB en safetensors y declara 96.016.955.264 parametros serializados.

Es relevante ahora porque permite a investigadores de eficiencia energetica medir el coste por acelerador de despliegues expert-parallel masivos (por ejemplo, alojando k/EP expertos por GPU) en hardware asequible, manteniendo byte a byte la atencion, embeddings, normas, expertos compartidos, cabezas MTP y la cuantizacion NVFP4 original. La licencia es la NVIDIA Open Model License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe_text`), modo thinking obligatorio |
| Parametros totales | 96.016.955.264 (safetensors del proxy); el modelo base declara 2,4T totales y 95B activos |
| Parametros activos | 95B por token en el modelo base; el proxy activa los 10 expertos retenidos por capa |
| Longitud de contexto | 262K nativo, extensible a 1M (segun informacion publica del modelo base Qwen) |
| Tipos de cuantizacion | NVFP4 (cuantizacion original preservada, escalas copiadas con sus expertos); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`license: other`, `license_name: nvidia-open-model-license`) |
| Formato de pesos | safetensors (85,58 GB serializados) |

## Arquitectura y entrenamiento

El proxy mantiene la arquitectura del modelo base: un transformer con capas de mezcla de expertos (MoE) en las que el router selecciona 10 expertos por token de entre 512 disponibles. La intervencion de CLEER consiste en podar cada capa MoE a los 10 primeros expertos enrutados (IDs `[0..9]` del original, renumerados desde 0) y ajustar `config.json:num_experts` de 512 a 10. Las filas del router se recortan a los expertos retenidos y las entradas de metadatos de cuantizacion que nombraban expertos eliminados se han borrado. El resto de tensores (atencion, embeddings, normas, expertos compartidos, cabezas MTP) es identico byte a byte al origen, incluida la cuantizacion NVFP4 con sus escalas.

No hay entrenamiento adicional: es un checkpoint podado, no un modelo afinado. El autor reporta validacion estructural superada (93 modulos MoE con 10 expertos cada uno, routers y sesgos con 10 filas, 243 tensores comparados byte a byte contra el origen) y un smoke test en vLLM sobre 1x H200 (carga en 79 s, 1024 tokens generados con batch 32 y 32 tokens nuevos). Ese test solo verifica que el checkpoint carga y ejecuta; no evalua calidad. El objetivo metodologico es que el coste por token coincida con el del modelo completo para poder medir energia por acelerador en configuraciones expert-parallel.

## Capacidades

- Generacion de texto degradada por diseno: el autor advierte explicitamente que no es un modelo usable.
- Razonamiento en modo thinking obligatorio heredado de la arquitectura Qwen3.8, aunque sin garantia de coherencia tras la poda.
- Tool calling y function calling: no disponible como capacidad verificada en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidad especial: servir como proxy de benchmarking energetico y de rendimiento para despliegues MoE de gran escala.

## Casos de uso

- Benchmarking energetico CLEER-Text: medir consumo por token y por acelerador con la misma aritmetica que el modelo completo, sin desplegar los 512 expertos por capa.
- Simulacion de despliegues expert-parallel: alojar k/EP expertos por GPU en un solo nodo para reproducir el perfil de carga de un cluster multi-nodo.
- Validacion de infraestructura de inferencia: probar configuraciones de vLLM, particionado de tensores y planificacion de memoria antes de escalar al modelo de 2,4T.
- Investigacion en eficiencia de MoE: comparar trafico de memoria y computo por token entre variantes podadas con distinto k.
- Docencia y experimentacion: estudiar el comportamiento de routers y expertos en un MoE cuantizado NVFP4 sin acceso a hardware de gran escala.
- Pruebas de humo de pipelines de evaluacion: verificar que herramientas de evaluacion cargan y ejecutan checkpoints MoE masivos sin depender de la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es el smoke test del autor: carga en 79 s y generacion de 1024 tokens en vLLM sobre 1x H200 con batch 32 y 32 tokens nuevos.

## Requisitos de hardware

- VRAM estimada: el checkpoint serializado ocupa 85,58 GB en NVFP4; la inferencia requiere al menos ese orden de magnitud mas overhead de activaciones y cache KV.
- GPU recomendadas: H200 (validado por el autor); se requiere soporte de NVFP4 para aprovechar la cuantizacion.
- GPU de consumo: no disponible; no se documenta ejecucion en RTX 4090 u otras consumer.
- Despliegue: vLLM (unico runtime verificado en el smoke test); otros motores no documentados.
- Latencia y throughput: no disponibles mas alla del smoke test (1024 tokens generados en 1x H200, batch 32).

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nidhal101/Qwen3.8-2.4T-A95B-NVFP4-CLEER-k10 (este) | 96,0B serializados (proxy) | 10 expertos por capa | 262K (heredado) | NVIDIA Open Model License | Hugging Face |
| nvidia/Qwen3.8-2.4T-A95B-NVFP4 | 2,4T totales | 95B | 262K extensible a 1M | NVIDIA Open Model License | Hugging Face |
| Qwen/Qwen3.8-2.4T-A95B | 2,4T totales | 95B | 262K extensible a 1M | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- No es un modelo utilizable: la salida esta degradada por diseno y no debe emplearse en produccion ni en tareas de calidad.
- Sesgos conocidos: no documentados; al derivar del modelo base, hereda los sesgos de este sin evaluacion especifica.
- Riesgo de alucinacion: elevado e irrelevante para su proposito, ya que el texto generado no es fiable.
- Limitaciones de contexto e idioma: el contexto de 262K se hereda del modelo base pero no se valida en el proxy; los idiomas no estan declarados.
- Licencia: NVIDIA Open Model License, heredada del modelo base; todo uso debe cumplir los terminos originales (ver `README_ORIGINAL.md`).
- Caveat de produccion: solo se ha verificado la carga y ejecucion en vLLM sobre H200; no hay garantias de comportamiento en otros runtimes ni de equivalencia energetica mas alla del diseno metodologico.

## Enlaces

- Hugging Face: https://huggingface.co/Nidhal101/Qwen3.8-2.4T-A95B-NVFP4-CLEER-k10
- Modelo base (NVIDIA): https://huggingface.co/nvidia/Qwen3.8-2.4T-A95B-NVFP4
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Ficha en Modal: https://modal.com/library/qwen/qwen3-8-2-4t-a95b-nvfp4
