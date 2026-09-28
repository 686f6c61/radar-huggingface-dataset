# mlx-community/sam-3d-body-dinov3-bf16

## Resumen

`mlx-community/sam-3d-body-dinov3-bf16` es la conversion no oficial al formato MLX del modelo `facebook/sam-3d-body-dinov3`, desarrollado por Meta Superintelligence Labs. SAM 3D Body (3DB) es un modelo promptable de recuperacion de malla humana 3D de cuerpo completo a partir de una sola imagen (*single-image human mesh recovery*). Dada una imagen y una caja delimitadora de la persona, estima la pose del cuerpo, los pies y las manos, y devuelve una malla completa de 18.439 vertices, 127 articulaciones y 70 keypoints sobre el cuerpo parametrico Momentum Human Rig (MHR).

Esta variante concreta la mantiene la organizacion `mlx-community` y su unico proposito es permitir la inferencia en Apple Silicon mediante la libreria `mlx-vlm`. No introduce cambios de pesos: el checkpoint es una traduccion de formato (renombrado de claves, division de las proyecciones `qkv` fusionadas, fusion de sesgos enmascarados en `q_proj` y `v_proj`, convoluciones en formato channels-last y estrechamiento de indices int64 a int32). El backbone DINOv3-H+ se conserva en bfloat16 tal y como lo publica Meta, mientras que decodificadores, cabezas, codificador de prompts, condicionamiento de rayos y el modelo corporal MHR permanecen en float32.

El modelo ocupa 2,8 GB en disco y suma 1.120.478.226 parametros repartidos en 1.203 tensores. Es relevante porque traslada a hardware de Apple un modelo de reconstruccion corporal de ultima generacion que, en su version original, depende de PyTorch y CUDA, y porque su licencia (`sam-license`) permite el uso derivado bajo condiciones especificas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer de vision DINOv3-H+ con decodificadores transformer promptables (estilo SAM), cabezas de pose, camara y manos, y modelo corporal parametrico MHR |
| Parametros totales | 1.120.478.226 (1.203 tensores) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); entrada de imagen a 512x512 (`image_size: [512, 512]` en `config.json`) |
| Tipos de cuantizacion | Ninguna en este repositorio; mezcla nativa de bfloat16 (615 tensores), float32 (574), int32 (11) y uint8 (3). Existen conversiones GGUF F32 de terceros para `sam3d.cpp` |
| Idiomas soportados | No disponible (modelo de vision; no procesa texto) |
| Licencia | `sam-license` (campo `license: other`, licencia personalizada de Meta) |
| Formato de pesos | `safetensors` en layout MLX, acompanado de `config.json` (formato `SAM3DConfig` de mlx-vlm), `model_config.yaml` original de Meta y `conversion.json` |

## Arquitectura y entrenamiento

La arquitectura combina un backbone DINOv3-H+ (la mayor parte de los parametros, en bfloat16, incluidos sus periodos RoPE) con decodificadores de cuerpo y manos en float32, un codificador de prompts (puntos y mascaras, con `mask_downscaling`), condicionamiento de rayos, una cabeza de camara que estima la traslacion y una cabeza de pose que contiene el modelo corporal MHR. Este ultimo aporta la base de expresion facial (`head_pose.body_model.face_shape_vectors`), las UVs de la malla y los limites de parametros. La rama de manos incluye deteccion de cajas de mano (`bbox_embed`, `hand_cls_embed`, `hand_pe_layer`) y su propio decodificador, cabezas y embeddings de keypoints. La reconstruccion cubre cuerpo, pies y manos bajo el rig MHR.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre si se aplicaron etapas de RLHF o DPO; esos datos corresponden a la model card original de Meta, que no se ha incluido en la informacion proporcionada. La innovacion destacable es el caracter promptable del modelo (admite cajas de persona y prompts de puntos o mascaras) y la integracion del rig MHR, que unifica cuerpo, manos y cara en una sola representacion.

En cuanto a la conversion a MLX, el proceso leyo `model.ckpt` y `assets/mhr_model.pt` en la revision `11aaa346c7204874a1cbafe3d39a979080b2c55a`, verifico tensor a tensor que cada valor coincide bit a bit con el origen tras deshacer la transformacion de layout, y confirmo que con `mlx-vlm` 0.7.2 y MLX 0.32.2 la carga mediante `mlx_vlm.utils.load_model` no presenta parametros ausentes ni discrepancias de forma. Se omitieron 47 tensores del origen por ser duplicados exactos, tensores vacios o placeholders sin uso. El autor advierte explicitamente de que el codigo de inferencia actual de `mlx-vlm` diverge de la referencia de Meta en varios puntos (recorte anisotropico 512x384 frente al isotropico 512x512, ReLU en lugar de GELU en la FFN del decodificador y tamanos de caja distintos en la condicion CLIFF, la traslacion de camara y el mapa de rayos), por lo que los resultados pueden diferir de los de Meta aunque los pesos sean fieles.

## Capacidades

- Recuperacion de malla humana 3D de cuerpo completo a partir de una unica imagen y una caja delimitadora de persona.
- Prediccion de 18.439 vertices de malla, 127 articulaciones y 70 keypoints sobre el rig MHR.
- Estimacion de pose de cuerpo, pies y manos, incluida una rama especifica de manos con deteccion de cajas.
- Estimacion de la camara: traslacion y parametros de condicionamiento de rayos.
- Interfaz promptable: acepta cajas de persona y prompts de puntos y mascaras mediante el codificador de prompts.
- Salida de parametros de pose y expresion facial (base de expresion del modelo MHR), UVs de malla y mascaras de parametros.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni soporte multilingue: es exclusivamente un modelo de vision a 3D.
- No hay modo de razonamiento ampliado ni procesamiento de audio o video.

## Casos de uso

- Animacion y VFX: dada una fotografia o un fotograma, se obtiene una malla de 18.439 vertices lista para retargeting sobre un esqueleto de animacion, lo que reduce el trabajo manual de ajuste de encuadre en planos con oclusiones parciales.
- Captura de movimiento sin marcadores: procesando fotogramas individuales con la caja de la persona, el modelo genera poses cuadro a cuadro para videojuegos o prevision visual, con la rama de manos aportando el detalle de dedos que los modelos de solo cuerpo no cubren.
- Probadores virtuales y comercio electronico: integrado en una aplicacion de realidad aumentada, estima la pose y las proporciones corporales del usuario a partir de una foto para superponer prendas sobre la malla reconstruida.
- Analisis biomecanico y deportivo: reconstruccion de la postura de un atleta en cada fotograma para medir angulos articulares, apoyo de pies y posicion de manos, con la camara estimada como referencia espacial.
- Generacion de datos sinteticos para entrenamiento: uso del modelo como etiquetador automatico de imagenes en un pipeline que produce pares imagen-malla para entrenar otros modelos de reconstruccion o de deteccion de pose.
- Ergonomia y prevencion de riesgos laborales: analisis de fotografias de puestos de trabajo para estimar posturas y detectar posiciones potencialmente lesivas del tren superior, aprovechando la precision en manos y brazos.
- Robotica y teleoperacion: extraccion de la pose humana en 3D a partir de una camara monocular como senal de entrada para retargeting de brazos roboticos o avatares de telepresencia.
- Investigacion clinica y del movimiento: cuantificacion de asimetrias posturales o seguimiento longitudinal de pacientes a partir de imagenes de archivo, sin necesidad de sistemas de captura dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye cifras de MPJPE, PVE ni comparaciones cuantitativas con otros modelos, y las referencias web consultadas solo describen el modelo como de rendimiento "state-of-the-art" sin aportar numeros. No se deben asumir valores de benchmarks para esta variante MLX, entre otras cosas porque el codigo de inferencia de `mlx-vlm` difiere del de referencia.

## Requisitos de hardware

- VRAM estimada: alrededor de 2,8-3,5 GB para los pesos en su mezcla nativa de bfloat16 y float32, mas el espacio de activaciones del backbone DINOv3-H+ a 512x512. Es razonable reservar 4-6 GB para trabajar con margen.
- GPU compatibles: al ser un checkpoint MLX, la inferencia esta pensada para Apple Silicon (serie M). En GPUs NVIDIA o AMD no se puede usar directamente con MLX; para esos entornos habria que recurrir a la version original de Meta en PyTorch o a las conversiones GGUF para `sam3d.cpp`.
- Cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon que disponga de al menos 8 GB de memoria unificada; con 16 GB o mas se evita cualquier presion de memoria al combinarlo con otros procesos.
- Opciones de despliegue: `mlx-vlm` (version 0.7.2 probada con MLX 0.32.2) mediante `SAM3DPredictor`; para CPU/Vulkan existe `sam3d.cpp` con los GGUF F32 publicados por `LocalAI-io`. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp.
- Limitacion de carga: `SAM3DPredictor.from_pretrained` no puede cargar este checkpoint porque lee los tensores a traves de NumPy, que no soporta bfloat16; hay que usar `load_model` con `strict=False`, ya que ocho tensores no tienen modulo correspondiente en mlx-vlm (`head_pose.body_model.parameter_limits`, `pmi`, `texcoord_faces`, `texcoords`, `init_camera_hand`, `init_pose_hand`, `keypoint3d_embedding_hand`, `keypoint_embedding_hand`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato y plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| `mlx-community/sam-3d-body-dinov3-bf16` (esta ficha) | 1.120.478.226 | Imagen 512x512 + caja de persona | safetensors MLX, Apple Silicon | `sam-license` | Conversion no oficial; misma precision de pesos que el original |
| `facebook/sam-3d-body-dinov3` | No disponible en la informacion (mismo checkpoint de origen) | Imagen 512x512 isotropica + caja de persona | PyTorch, CUDA | `sam-license` | Referencia oficial de Meta; unico con el que se puede comparar con rigor |
| `LocalAI-io/sam-3d-body-dinov3-GGUF` | No disponible | Imagen + caja de persona; solo rama de cuerpo | GGUF F32 para `sam3d.cpp` (CPU/Vulkan) | `sam-license` (derivada) | Implementacion en C++23/GGML; la informacion indica que cubre la rama de pose corporal, no las manos |
| Otros modelos de HMR monocular (por ejemplo, variantes SMPL de la familia 4DHumans o Multi-HMR) | No disponible | Imagen unica | PyTorch | Licencias diversas, varias no comerciales | No se dispone de cifras comparativas verificadas en la informacion proporcionada |

No se dispone de datos cuantitativos que permitan comparar el rendimiento de esta conversion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Divergencia respecto a la referencia: el codigo de inferencia de `mlx-vlm` usa un recorte anisotropico 512x384 frente al isotropico 512x512 de Meta, ReLU en lugar de GELU en la FFN del decodificador y tamanos de caja distintos para la condicion CLIFF, la traslacion de camara y el mapa de rayos. Los resultados no deben presentarse como equivalentes a los del modelo oficial.
- Carga incompleta por diseno: `Model.sanitize` de mlx-vlm descarta la rama de manos y `mask_downscaling`, de modo que el pipeline estandar puede perder capacidades presentes en los pesos.
- Requiere una caja delimitadora de persona como entrada; no es un modelo totalmente automatico de deteccion y reconstruccion.
- Solo imagen estatica: no procesa video ni secuencias temporales de forma nativa, lo que puede producir inestabilidad temporal si se aplica fotograma a fotograma sin postprocesado.
- No procesa lenguaje: no hay soporte de texto, tool calling ni capacidades multilingues que documentar.
- Riesgo de error en casos dificiles: oclusiones severas, personas muy pequenas en el encuadre, manos fuera de cuadro o poses inusuales pueden degradar la malla reconstruida. No se han publicado tasas de error en la informacion disponible.
- Sesgos: no se documenta informacion sobre la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo por tono de piel, complexacion, edad, diversidad corporal o contexto cultural.
- Licencia: `sam-license`, una licencia personalizada de Meta (campo `license: other`). Es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial, ya que las condiciones no son las de una licencia estandar tipo Apache o MIT.
- Derivado no oficial: este repositorio no esta respaldado por Meta; cualquier problema de conversion, carga o inferencia debe atribuirse a la conversion de `mlx-community`, no al modelo original.
- Repositorio sin traccion comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que implica poca validacion externa del checkpoint.
- Aviso sobre el pipeline: la fecha de creacion del repositorio (2026-09-27) y los identificadores arXiv asociados son los proporcionados por la fuente; conviene verificarlos antes de citarlos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlx-community/sam-3d-body-dinov3-bf16
- Modelo original de Meta: https://huggingface.co/facebook/sam-3d-body-dinov3
- Repositorio de codigo oficial: https://github.com/facebookresearch/sam-3d-body
- Codigo del paquete Python oficial: https://github.com/facebookresearch/sam-3d-body/tree/main/sam_3d_body
- Paper de SAM 3D Body: https://arxiv.org/abs/2602.15989
- Referencia adicional etiquetada en el repositorio: https://arxiv.org/abs/2511.15586
- Implementacion MLX utilizada para la inferencia: https://github.com/Blaizzy/mlx-vlm
- Conversion GGUF F32 para `sam3d.cpp`: https://huggingface.co/LocalAI-io/sam-3d-body-dinov3-GGUF
- Espejo del modelo en ModelScope: https://www.modelscope.cn/models/facebook/sam-3d-body-dinov3
