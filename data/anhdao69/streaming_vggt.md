# anhdao69/Streaming_VGGT

## Resumen

Streaming_VGGT es un conjunto de checkpoints de navegacion vision-lenguaje (Vision-Language Navigation, VLN) publicado por el usuario anhdao69 bajo el proyecto SimpleMemVLN. No es un modelo de proposito general: son politicas de navegacion obtenidas por ajuste fino del modelo base Qwen/Qwen3.5-4B sobre los conjuntos de instrucciones R2R y RxR, y requieren un wrapper de inferencia especifico (no cargan con AutoModel estandar). El repositorio ocupa 31,1 GB e incluye tres variantes independientes entrenadas desde el mismo base: G1, G3 y A0.

La relevancia tecnica del artefacto esta en la supervision auxiliar: durante el entrenamiento se congela un VGGT-Omega online en FP32 que supervisa tokens visuales muestreados, y en el caso de G3 lee representaciones retardadas de la capa 24 del decoder nativo mediante un query/decoder aprendido y descriptores regionales de 2048 dimensiones. Esa supervision solo interviene en entrenamiento; la politica exportada mantiene la arquitectura nativa con acciones textuales en ventana de 8 pasos e historial canonico de acciones. A0 es el control sin supervision VGGT.

El modelo esta en fase de investigacion: no se reclama ningun resultado de calidad de navegacion en Habitat, la licencia no esta declarada y el autor solo publica estadisticas de entrenamiento, configuracion, hashes y evidencia de validacion. Cada variante completa una epoca conjunta R2R + RxR (R2R + subconjunto ingles de RxR en A0) con 3.852 actualizaciones de optimizador, semilla 429 y 30.815 episodios unicos con batch global de 8 sobre cuatro GPU H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de navegacion sobre Qwen3.5-4B, decoder con capa GDN (Gated Delta Network) nativa en la capa 24; politica de texto con ventana de 8 acciones |
| Parametros totales | No disponible (modelo base Qwen/Qwen3.5-4B, ~4B; el total del wrapper no se declara) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible (la "ventana 8" se refiere al historial de acciones, no al contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (instrucciones R2R y subconjunto ingles de RxR); resto no disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoints PyTorch (state dicts .pt); no se indica safetensors ni GGUF |
| Variantes publicadas | G1, G3, A0 (cada una en su subdirectorio epoch-1) |
| Entorno de ejecucion | Transformers 5.11.0, Torch 2.10, FLA 0.5.2, FlashAttention 2.8.3 |
| Tamano del repositorio | 31,1 GB |
| Modelo base | Qwen/Qwen3.5-4B (revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) |

## Arquitectura y entrenamiento

Las tres variantes parten del mismo base Qwen3.5-4B y siguen un esquema de politica de navegacion con salidas en texto: acciones textuales canonicas en ventana de 8 pasos (Window8), historial de acciones canonico y entrenamiento con episodios completos y BPTT completo (full episodes/full BPTT). No se usa pre-extraccion de caracteristicas ni PCA. La capa de decoder nativa relevante es GDN (Gated Delta Network) en la capa 24.

La innovacion central es la supervision auxiliar con VGGT-Omega congelado en FP32, aplicada en linea durante entrenamiento sobre lecturas visuales. En G1 el projector del estudiante sigue la arquitectura de SpatialForcing: affine LayerNorm 2560 -> Linear 4096 -> GELU -> Linear 2048. En G3 la supervision se aplica a lecturas retardadas de la capa GDN 24 mediante un query/decoder aprendido y descriptores regionales completos de 2048 dimensiones; los 10.526.368 parametros auxiliares del state head de G3 se conservan aparte en `G3/training_auxiliary_state_head.pt`. A0 es el control de navegacion pura, sin supervision VGGT, y anade adaptadores Q/K de rango 8 solo para tokens de imagen en la capa GDN 24 (cabezas 0/1, +45.056 parametros) que si son necesarios en inferencia.

El entrenamiento uso una epoca conjunta R2R + RxR, 3.852 actualizaciones de optimizador, semilla 429, 30.815 episodios, batch efectivo 8 (4 H100 x 1 episodio x GAS 2), schedule coseno de una epoca y 116 pasos de warmup de LR. En A0 el pico de LR de backbone fue 5e-6 y el del adaptador GeoAddress 5e-5. No se usan lane dual ni banco episodico. El autor indica que el entrenamiento termino sin eventos OOM de CUDA/cgroup, con supervisorPASS en G3 y A0, y que los checkpoints de recuperacion de optimizador/RNG permanecen en el cluster (no publicados).

## Capacidades

- Navegacion vision-lenguaje: seguir instrucciones en lenguaje natural en entornos visuales (R2R, RxR) emitiendo acciones textuales por pasos.
- Memoria de acciones: politica con ventana nativa de 8 acciones e historial canonico, sin banco episodico externo ni lane dual.
- Percepcion visual en streaming: consumo de observaciones visuales paso a paso (el nombre "Streaming" alude a este regimen online).
- Supervisado por geometria 3D durante entrenamiento (G1, G3): VGGT-Omega aporta senal de geometria visual; no es necesario en inferencia.
- Control de ablacion (A0): variante sin supervision VGGT con adaptadores GeoAddress para tokens de imagen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso generico: no disponible (la "multi-paso" aqui es la ejecucion secuencial de acciones de navegacion).
- Capacidades multilingues: no disponibles mas alla del ingles de R2R/RxR.
- Modo "thinking", vision adicional, audio: no disponible.

## Casos de uso

- Investigacion en VLN reproducida: reconstruir el pipeline SimpleMemVLN con el wrapper `load_checkpoint` para estudiar como afecta la supervision geometrica VGGT-Omega al aprendizaje de politicas de navegacion.
- Ablacion controlada de supervision auxiliar: usar A0 (sin VGGT) frente a G1/G3 para aislar el efecto de la senal de geometria en el mismo presupuesto de entrenamiento y semilla.
- Evaluacion en Habitat: cargar los checkpoints en un entorno de simulacion de navegacion (R2R/RxR) y medir metricas de exito y trayectoria; el propio autor advierte que este repositorio no aporta esa evaluacion.
- Reentrenamiento sobre nuevos datasets de instrucciones: partir de las politicas publicadas o del base Qwen3.5-4B para adaptar a dominios de navegacion distintos, reutilizando la receta de una epoca con BPTT completo.
- Estudio de arquitecturas hibridas con atencion lineal: analizar el comportamiento de la capa GDN 24 y los adaptadores Q/K de rango 8 en tareas de decision secuencial multimodal.
- Docencia y prototipado en robotica encarnada: servir como referencia de politica de navegacion basada en un LLM/VLM pequeno (4B) para experimentos academicos de agentes embodied.
- Analisis de eficiencia de supervision: comparar coste de entrenamiento (4 H100, batch 8, 3.852 updates) frente a alternativas con pre-extraccion de caracteristicas o PCA, dado que aqui no se usan.
- Auditoria de reproducibilidad: explotar `SHA256SUMS.json`, los directorios `provenance/` y los hashes de codigo fuente para verificar bit a bit las exportaciones de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la publicacion contiene estadisticas de entrenamiento y no una evaluacion de calidad de navegacion en Habitat ("No Habitat navigation-quality result is claimed by this upload"). Los unicos datos cuantitativos disponibles son de entrenamiento:

| Metrica de entrenamiento | Valor |
|---|---|
| Actualizaciones de optimizador | 3.852 |
| Episodios unicos | 30.815 |
| Epocas | 1 (conjunta R2R + RxR) |
| Semilla | 429 |
| Batch efectivo | 8 (4 H100 x 1 episodio x GAS 2) |
| Pasos de warmup de LR | 116 |
| Rampa auxiliar | 771 actualizaciones |
| LR pico backbone (A0) | 5e-6 |
| LR pico adaptador GeoAddress (A0) | 5e-5 |
| Parametros auxiliares G3 | 10.526.368 |
| Parametros anadidos A0 | 45.056 |

## Requisitos de hardware

- Entrenamiento declarado: 4 GPU H100 con batch global 8 (1 episodio por GPU y GAS 2), BPTT completo sobre episodios completos.
- Inferencia: al derivar de un modelo base de ~4B, en FP16 los pesos rondan los 8 GB, mas el estado del wrapper y buffers de vision; el repositorio completo ocupa 31,1 GB porque incluye tres variantes y artefactos auxiliares.
- GPU consumer: con 4B de parametros, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberia poder alojar la politica en FP16 o BF16; no hay datos oficiales de VRAM ni de cuantizacion publicados, por lo que esta estimacion es orientativa.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S son adecuadas para inferencia y para reproducir el entrenamiento.
- Despliegue: requiere el wrapper SimpleMemVLN (`qwen_vl.train.vln_runtime.load_checkpoint`) y el entorno fijado (Transformers 5.11.0, Torch 2.10, FLA 0.5.2, FlashAttention 2.8.3). No es compatible con AutoModel sin modificar.
- Servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama: no disponibles, no se documenta soporte ni formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados de modelos comparables en la informacion disponible. La comparacion mas fiable posible es entre las tres variantes del propio repositorio, que comparten base, presupuesto de entrenamiento y semilla:

| Variante | Supervision VGGT-Omega | Adaptadores en inferencia | Parametros auxiliares | Serializer |
|---|---|---|---|---|
| G1 | Si (projector SpatialForcing) | No (export nativo) | No aplica en inferencia | Window8 con historial canonico |
| G3 | Si (query/decoder sobre GDN 24) | No (export nativo) | 10.526.368 (auxiliares de entrenamiento) | Window8 con historial canonico |
| A0 | No (control de navegacion) | Si, obligatorios (Q/K rango 8, cabezas 0/1) | 45.056 | `vln_append_only_chat_geoaddress_v1` |

Nota importante: el nombre del repositorio coincide parcialmente con StreamVGGT (Streaming 4D Visual Geometry Transformer, wzzheng), pero son proyectos distintos: StreamVGGT es un transformer causal para reconstruccion 4D visual en streaming con destilacion desde VGGT denso, mientras que Streaming_VGGT de anhdao69 es una politica de navegacion VLN basada en Qwen3.5-4B. No deben confundirse ni compararse como si fueran el mismo sistema.

## Limitaciones y advertencias

- Ausencia de evaluacion: no se declara ningun resultado de navegacion en Habitat; no hay metricas de exito, trayectoria ni robustez. No debe asumirse calidad de navegacion a partir de las estadisticas de entrenamiento.
- Licencia no declarada: al no especificarse licencia, no hay garantia de uso comercial ni de redistribucion; hay que contactar con el autor antes de cualquier despliegue productivo.
- Carga no estandar: los checkpoints no se pueden cargar con AutoModel sin modificar; requieren el wrapper SimpleMemVLN y el entorno fijado exacto (Transformers 5.11.0, Torch 2.10, FLA 0.5.2, FlashAttention 2.8.3). Versiones distintas pueden romper la compatibilidad.
- Estado incompleto de recuperacion: los checkpoints de optimizador y RNG, asi como las imagenes del dataset, no se publican; la recuperacion exacta del entrenamiento queda limitada al cluster del autor.
- Sesgos y dominios: entrenado sobre R2R y un subconjunto ingles de RxR, por lo que el sesgo heredado del base Qwen3.5-4B y el sesgo de los datasets de navegacion estan presentes. Idiomas distintos del ingles no estan soportados de forma declarada.
- Riesgo de alucinacion: como politica generativa basada en LLM, puede emitir acciones o texto no validos fuera del espacio de acciones canonicas; no se documentan mecanismos de validacion en inferencia.
- Ambiguedad de nombre: la coincidencia con StreamVGGT puede llevar a atribuir capacidades de reconstruccion 4D geometrica que este modelo no ofrece. La supervision VGGT solo existe en entrenamiento y no se exporta.
- Artefactos auxiliares separados: en G3 y A0 parte de los pesos entrenados vive en archivos aparte (`training_auxiliary_*`), y en A0 los adaptadores si son obligatorios en inferencia; omitirlos cambia el comportamiento del modelo.
- Idiomas y contexto: no se publican la longitud de contexto efectiva ni la lista de idiomas; "Window8" describe el historial de acciones, no la ventana del transformer.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anhdao69/Streaming_VGGT
- Repositorio SimpleMemVLN: https://github.com/anhdao69/SimpleMemVLN
- Codigo fuente de G1: https://github.com/anhdao69/SimpleMemVLN/tree/86d68b2eff9db7c5cffdd86f0d98ca98f7e1c93a
- Codigo fuente de G3: https://github.com/anhdao69/SimpleMemVLN/tree/22593831c80b742ee77b478ce7cb76fb44bc328b
- Codigo fuente de A0: https://github.com/anhdao69/SimpleMemVLN/tree/0c22a7bdac465aedd5d1413fa08d9eedc12206c1
- Perfil del autor en HuggingFace: https://huggingface.co/anhdao69
- Perfil del autor en GitHub: https://github.com/anhdao69
- Proyecto distinto con nombre similar, StreamVGGT (wzzheng): https://github.com/wzzheng/StreamVGGT
- Paper de StreamVGGT: https://arxiv.org/abs/2507.11539
- Pagina del proyecto StreamVGGT: https://wzzheng.net/StreamVGGT/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
