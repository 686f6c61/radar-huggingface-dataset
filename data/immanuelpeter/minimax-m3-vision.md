# immanuelpeter/MiniMax-M3-Vision

## Resumen

MiniMax-M3-Vision es un repositorio que empaqueta exclusivamente la torre de visión (vision tower) y el proyector multimodal del modelo MiniMax-M3, publicado por el usuario immanuelpeter a partir de los pesos originales de MiniMaxAI. No es un modelo entrenado de nuevo ni un modelo de lenguaje: es una extracción quirúrgica de los 515 tensores de la torre visual y los 8 tensores del proyector, con los pesos en BF16 preservados bit a bit respecto al checkpoint padre. El resultado es un extractor de características de imagen (`image-feature-extraction`) de 631.185.920 parámetros y 1,7 GB de repositorio.

La torre sigue un diseño ViT de estilo CLIP con 32 capas, anchura oculta de 1280, 16 cabezales de atención, intermedio de 5120, parche de 14 píxeles, patch embedding con Conv3d, RoPE 3D y activación GELU, trabajando sobre imágenes de hasta 2016 píxeles. El proyector es un MLP que mapea de 1280 a 6144 dimensiones y después proyecta los parches fusionados (24576 = 4 × 6144) de vuelta a 6144, que es el espacio oculto que consume el modelo de lenguaje de MiniMax-M3.

Su relevancia es de ingeniería más que de modelado: permite reutilizar el front-end visual de M3 de forma aislada (búsqueda de componentes, pruebas de paridad, reimplementaciones, fine-tuning de adaptadores o construcción de pipelines propios) sin descargar ni cargar el modelo completo. La contrapartida es que no aporta ninguna capacidad generativa por sí mismo y que arrastra la licencia MiniMax Community del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT estilo CLIP (torre de vision) + proyector MLP; clase `MiniMaxM3VLVisionModel`, `model_type` `minimax_m3_vl_vision` |
| Parametros totales | 631.185.920 (515 tensores de torre + 8 del proyector) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; no aplica contexto de texto. Entrada de imagen de 2016 px con parche de 14 px |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en BF16 sin cuantizaciones oficiales publicadas |
| Idiomas soportados | no disponible; no aplica (modelo de vision sin cabeza de lenguaje) |
| Licencia | MiniMax Community License (`license: other`, `license_name: minimax-community`) |
| Formato de pesos | safetensors en BF16: `model.safetensors` (torre) y `projector.safetensors` (proyector) |
| Tamano del repositorio | 1,7 GB |
| Libreria | transformers |
| Pipeline | image-feature-extraction |
| Dimension de salida | 1280 (tokens de torre), 5120 (fusion 2x2 de 1280), 6144 (proyectado) |
| Configuracion del proyector | `input_size` 1280, `hidden_size` 6144, `output_size` 6144, `merged_hidden_size` 24576 |

## Arquitectura y entrenamiento

La torre de visión es un transformer de imagen de 32 capas con 1280 dimensiones ocultas, 16 cabezales, MLP intermedio de 5120 y parche de 14 píxeles. El patch embedding usa una convolución 3D (lo que da soporte a entrada con dimensión temporal) y el modelo incorpora RoPE 3D y GELU. La compresión de tokens aplica un merge espacial 2x2 y un parche temporal de tamaño 2. Con una imagen de 2016 px y parche de 14 px se derivan 144 × 144 = 20.736 parches, que tras el merge 2x2 espacial quedan en 5.184 tokens fusionados de anchura 5120 (cálculo derivado de los parámetros publicados, no reportado explícitamente en la model card).

El proyector encadena `Linear(1280, 6144)`, GELU, `Linear(6144, 6144)`, el aplanado de cuatro parches de anchura 6144 y `Linear(24576, 6144)`, GELU y `Linear(6144, 6144)`. `last_hidden_state` devuelve los tokens crudos de la torre (1280 dimensiones), mientras que las salidas fusionadas y proyectadas están disponibles en los otros niveles de anchura.

No ha habido entrenamiento ni ajuste por parte del publicador. La reproducción lee `vision_tower.vision_model.*` del shard 59 del checkpoint `MiniMaxAI/MiniMax-M3`, remapea `encoder.layers` a `layers` y `embeddings.patch_embedding` a `embeddings.proj`, y extrae el proyector desde `multi_modal_projector.*` y `patch_merge_mlp.*` de los shards 26 y 59. Los pesos BF16 originales se conservan sin modificación. La validación de paridad compara los 515 tensores de la torre y los 8 del proyector con el checkpoint padre mediante `torch.equal`.

## Capacidades

- Extraccion de caracteristicas de imagen (`image-feature-extraction`): devuelve embeddings por parche a traves de `last_hidden_state` con anchura 1280.
- Salidas en tres niveles dimensionales: 1280 (torre cruda), 5120 (tokens fusionados 2x2) y 6144 (tokens proyectados al espacio del LLM de M3).
- Entrada de alta resolucion: hasta 2016 px con parche de 14, lo que permite conservar detalle fino en documentos, capturas de pantalla y escenas densas.
- Procesamiento con componente temporal: patch embedding Conv3d y parche temporal de 2, orientado a entradas de video o secuencias de fotogramas.
- Uso como componente de un VLM: al proyectar a 6144 dimensiones, la salida es directamente conectable al espacio oculto del modelo de lenguaje de MiniMax-M3.
- No genera texto, no tiene modo de razonamiento, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene capacidades multilingues: es un codificador visual sin cabeza de lenguaje.
- No hay soporte documentado de audio ni de otras modalidades.

## Casos de uso

- Sustitucion o auditoria del front-end visual de MiniMax-M3: cargar esta torre y el proyector para reproducir exactamente las características visuales que consume el LLM del modelo padre, util para depurar diferencias de representacion entre despliegues.
- Pruebas de paridad de reimplementaciones: verificar que una portabilidad a otro runtime produce los mismos tensores que el checkpoint original, usando `torch.equal` sobre los 515 + 8 tensores.
- Busqueda y recuperacion visual: indexar embeddings de 1280 o 6144 dimensiones en un motor vectorial para recuperacion de imagenes por similitud, deduplicacion de datasets o clustering de grandes colecciones.
- Transfer learning con cabezas propias: congelar la torre y entrenar un clasificador lineal o MLP sobre los tokens fusionados de 5120 dimensiones para tareas de clasificacion de imagen, deteccion de defectos industriales o triaje medico, con un coste de computo muy inferior a ajustar un VLM completo.
- Procesamiento de documentos de alta resolucion: la ventana de 2016 px con parche de 14 permite tokenizar formularios, facturas o diagramas tecnicos conservando texto de cuerpo pequeno antes de pasarlos a un LLM.
- Analisis de video por muestreo de fotogramas: el patch embedding Conv3d y el parche temporal de 2 permiten construir representaciones de clips cortos reutilizando la misma torre sin cambiar de modelo.
- Moderacion y filtrado de contenido visual: usar las caracteristicas como entrada de un clasificador auxiliar ligero para politicas de contenido en plataformas, manteniendo la torre congelada en BF16.
- Construccion de un VLM propio: combinar esta torre y su proyector con un modelo de lenguaje alternativo en el espacio de 6144 dimensiones para experimentar con arquitecturas multimodales sin partir del entrenamiento desde cero.
- Investigacion de representaciones: extraer estadisticas por capa (32 capas × 1280) para estudios de interpretabilidad o comparativas entre encoders visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta una prueba de paridad funcional frente al checkpoint padre:

| Prueba | Metodo | Resultado |
|---|---|---|
| Paridad de la torre (515 tensores) | `torch.equal` contra `MiniMaxAI/MiniMax-M3` | identico |
| Paridad del proyector (8 tensores) | `torch.equal` contra `MiniMaxAI/MiniMax-M3` | identico |

No hay datos de MMLU, HumanEval, GSM8K, ImageNet, COCO, VQAv2 ni de ninguna otra evaluacion estandar para este repositorio.

## Requisitos de hardware

- Peso en BF16: aproximadamente 1,26 GB (631.185.920 parametros × 2 bytes). El repositorio completo ocupa 1,7 GB.
- Equivalencias si se convierte manualmente (no hay cuantizaciones oficiales): FP32 en torno a 2,52 GB; INT8 en torno a 0,63 GB.
- Cabe en GPU de consumo: cualquier tarjeta con 8 GB o mas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 24 GB). Los pesos no son el cuello de botella.
- El factor limitante es la memoria de activaciones: a 2016 px se derivan 20.736 parches antes del merge, con atencion de coste cuadratico sobre esa secuencia. Se recomienda atencion con kernels eficientes (SDPA/FlashAttention), lotes pequenos y, si es posible, reduccion de resolucion de entrada.
- GPU profesionales (A100 40/80 GB, H100 80 GB) necesarias solo para lotes grandes a resolucion maxima o para servir la torre junto al LLM completo de M3.
- Despliegue: libreria `transformers`, con la implementacion nativa del `model_type` `minimax_m3_vl_vision` y la clase `MiniMaxM3VLVisionModel`. El repositorio incluye `projector.py` y `projector_config.json` para la carga del proyector, y el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- vLLM, TGI, llama.cpp, Ollama y GGUF no estan documentados para este `model_type`; al ser un codificador visual sin decodificador, no son las rutas de despliegue previstas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens/segundo, imagenes/segundo ni tiempos de inferencia.

## Comparativa con modelos similares

La comparativa se establece frente a encoders visuales de proposito general. Los datos de las alternativas son referencias publicas aproximadas y no proceden de la informacion proporcionada en esta ficha.

| Modelo | Parametros (aprox.) | Capas / anchura | Parche | Resolucion tipica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-M3-Vision (este) | 631 M | 32 / 1280 | 14 | 2016 px | MiniMax Community | safetensors BF16 en HF |
| CLIP ViT-L/14 | ~304 M | 24 / 1024 | 14 | 224 px | abierta (MIT-like) | ampliamente disponible en HF |
| SigLIP SoViT-400m/14 | ~400 M | ~27 / 1152 | 14 | 384 px | abierta (Apache 2.0) | ampliamente disponible en HF |
| MiniMax-M3 (modelo padre completo) | no disponible | no disponible | no disponible | 2016 px | MiniMax Community | safetensors en HF |

Diferencias clave: este repositorio duplica aproximadamente el tamano de CLIP ViT-L/14 y supera a SigLIP SoViT-400m en numero de parametros, pero su rasgo distintivo no es el rendimiento sino la resolucion de entrada (2016 px frente a 224-384 px) y el hecho de estar alineado con el espacio oculto de 6144 dimensiones de MiniMax-M3, algo que CLIP y SigLIP no ofrecen. Frente al modelo padre, la ventaja es el tamano (631 M frente a un VLM completo) y la desventaja es la ausencia total de decodificador de lenguaje. No hay benchmarks publicados que permitan comparar calidad de representacion entre estas opciones.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas. Cualquier uso conversacional requiere anadir por separado un modelo de lenguaje.
- No ha sido entrenado ni ajustado por el publicador; es una extraccion de pesos del modelo padre, por lo que hereda sus sesgos de datos sin que la model card documente la composicion del corpus de entrenamiento original.
- No hay informacion sobre composicion del dataset, sesgos demograficos, sesgos culturales ni comportamiento diferencial por tipo de imagen.
- Riesgo de alucinacion: no aplica en sentido estricto (no genera texto), pero los embeddings pueden producir similitudes espurias en recuperacion visual si no se calibra el umbral.
- Idiomas: no aplica ni esta documentado; el rendimiento sobre texto en imagen (OCR implicito) depende del entrenamiento original de M3 y no se declara.
- Licencia: MiniMax Community License, la misma del modelo fuente. Los terminos concretos no se detallan en la informacion disponible; hay que revisar el fichero `LICENSE` del repositorio antes de cualquier uso comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente. La unica verificacion es el script de paridad del propio autor.
- Dependencia de implementacion: el `model_type` `minimax_m3_vl_vision` es personalizado, por lo que se necesita una version de `transformers` compatible con la implementacion nativa de MiniMax y, previsiblemente, `trust_remote_code=True` para cargar `projector.py`.
- Coste computacional a resolucion maxima: 2016 px implica secuencias visuales muy largas y atencion cuadratica sobre ellas; sin kernels eficientes ni control del lote, el consumo de memoria de activaciones puede superar con holgura el de los pesos.
- Cualquier fine-tuning de la torre rompe la garantia de paridad con el checkpoint padre descrita en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/immanuelpeter/MiniMax-M3-Vision
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/tests/test_parity.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_minimax_m3_vision.py
- Ejemplo de inferencia: https://huggingface.co/immanuelpeter/MiniMax-M3-Vision/blob/main/examples/inference.py
- Licencia: https://huggingface.co/immanuelpeter/MiniMax-M3-Vision/blob/main/LICENSE
- Configuracion del proyector: https://huggingface.co/immanuelpeter/MiniMax-M3-Vision/blob/main/projector_config.json
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los enlaces encontrados corresponden a un servicio de television en streaming y a un producto financiero, sin relacion con MiniMax-M3-Vision.
