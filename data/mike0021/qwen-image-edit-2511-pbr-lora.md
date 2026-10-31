# Mike0021/qwen-image-edit-2511-pbr-lora

## Resumen

qwen-image-edit-2511-pbr-lora es un adaptador LoRA desarrollado por el usuario Mike0021 sobre el modelo base Qwen/Qwen-Image-Edit-2511. Su función es convertir una fotografía iluminada de un objeto en uno de sus mapas PBR (albedo, roughness o metallic) mediante una instrucción textual, realizando de facto una descomposición intrínseca de la imagen: elimina luces, sombras y reflejos para recuperar el color base, o estima la rugosidad y metalicidad de cada superficie.

El LoRA está pensado para flujos de texturizado por proyección: cada vista generada de un modelo 3D se descompone y los mapas resultantes se proyectan y hornean (bake) igual que el color. Funciona especialmente bien combinado con el LoRA de destilación Lightning de 4 pasos (lightx2v/Qwen-Image-Edit-2511-Lightning) a una resolución de 768 px, lo que permite inferencia rápida en pocos pasos.

Su relevancia radica en que, según los benchmarks publicados por el autor, supera a métodos especializados de descomposición intrínseca como Marigold-IID y RGB<->X en las métricas de albedo y metallic, siendo un recurso ligero (9,0 GB el repositorio) y con licencia Apache 2.0 que se integra en la librería diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de edicion de imagen Qwen-Image-Edit-2511 |
| Parametros totales | no disponible (rank 32; tamano del repo 9,0 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones publicadas estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos LoRA compatibles con diffusers y DiffSynth-Studio (claves PEFT bajo `transformer.`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 32 entrenado sobre Qwen-Image-Edit-2511, un modelo de edicion de imagen por instrucciones. El entrenamiento se realizo con DiffSynth-Studio con learning rate 1e-4. Existen dos versiones: la v1 (`pbr/step-4230`), entrenada 2 epocas sobre 8.460 pares con 4 GPU H200 durante 2 horas, y la v2 (`pbr2/step-4215`, recomendada por el autor), que anade 2.800 vistas adicionales con un cuarto de materiales de pintura brillante, impresiones y lacados que nunca son metal, entrenada 1 epoca sobre 16.860 pares. La v2 corrige el error de la v1 de interpretar pintura brillante como metal.

El dataset de entrenamiento consta de 2.820 vistas sinteticas renderizadas en Blender Cycles (primitivas, ensamblajes y 74 mallas sin texturar de objetos cotidianos), con materiales de MatSynth (CC0 / CC-BY, con metales tres veces mas probables) y materiales PBR sencillos (pintura, plastico, ceramica, metal desnudo), iluminados con HDRIs de Poly Haven (CC0) y de estudio de Blender. Para cada vista se renderizan el albedo, roughness y metallic exactos por pixel con la misma camara, lo que proporciona ground truth perfecto para el aprendizaje supervisado.

## Capacidades

- Generacion de mapa de albedo: dado el prompt "Turn this photo into its albedo map...", produce el color base de cada superficie eliminando toda iluminacion, sombras y reflejos.
- Generacion de mapa de roughness: produce un mapa en escala de grises donde el negro indica superficies brillantes y el blanco superficies rugosas.
- Generacion de mapa de metallic: produce un mapa en blanco y negro donde el blanco indica metal desnudo y el negro el resto.
- Descomposicion intrinseca de imagenes por instrucciones textuales, una instruccion por mapa.
- Integracion en pipelines de texturizado por proyeccion: descomposicion de vistas generadas de modelos 3D y proyeccion/horneado de mapas.
- Compatibilidad con el LoRA Lightning de 4 pasos para inferencia destilada rapida.
- Uso con la libreria diffusers (con remapeo de claves) o con DiffSynth-Studio.

## Casos de uso

- Texturizado de modelos 3D por proyeccion: cada vista generada de un objeto se descompone en mapas PBR que se proyectan y hornean sobre el modelo, produciendo materiales listos para motores de render; es el caso de uso para el que fue disenado.
- Creacion de activos para videojuegos: a partir de fotografias de objetos reales, se generan albedo, roughness y metallic para construir materiales PBR sin escaneo ni modelado manual.
- Reconstruccion fotogrametrica con materiales: las vistas de un objeto fotografiado se convierten en mapas PBR coherentes para aplicar sobre mallas reconstruidas.
- Edicion de materiales en render: separar el albedo de la iluminacion permite reiluminar escenas o modificar la rugosidad y metalicidad de superficies existentes.
- Generacion de datasets sinteticos: la descomposicion intrinseca de fotos reales puede alimentar pipelines de vision por computador que necesiten mapas intrinsecos como entrada o ground truth aproximado.
- Realidad aumentada y visualizacion de producto: convertir fotos de catalogo en materiales PBR para visualizar el producto bajo cualquier iluminacion en tiempo real.
- Investigacion en descomposicion intrinseca: como baseline generativo comparado con metodos dedicados como Marigold-IID o RGB<->X.

## Benchmarks y rendimiento

Evaluacion del autor sobre 42 vistas iluminadas con HDRI de 14 activos de ejemplo de Khronos glTF (no presentes en el entrenamiento), con ground truth exacto:

| Metodo | albedo si-RMSE | roughness MAE | metallic MAE | metallic acc. |
|---|---|---|---|---|
| naive (foto, roughness 0.5, sin metal) | 0,171 | 0,257 | 0,283 | 0,72 |
| Marigold-IID appearance v1-1 | 0,133 | 0,192 | 0,444 | 0,50 |
| RGB<->X | 0,143 | 0,247 | 0,442 | 0,56 |
| v1 + Lightning, 4 pasos (DiffSynth) | **0,108** | **0,191** | **0,251** | **0,75** |
| v1 + Lightning, 4 pasos (diffusers) | 0,114 | 0,196 | 0,268 | 0,72 |
| v2 + Lightning, 4 pasos (diffusers) | **0,108** | 0,218 | 0,255 | 0,74 |

El LoRA supera a Marigold-IID y RGB<->X en albedo si-RMSE y en las metricas de metallic, quedando practicamente empatado con Marigold-IID en roughness MAE. La v2 mantiene el rendimiento en albedo y metallic y corrige la confusion de pinturas brillantes con metal.

## Requisitos de hardware

- VRAM estimada: no disponible explicitamente; el modelo base Qwen-Image-Edit-2511 es un modelo de difusion de gran tamano, por lo que se recomienda una GPU con al menos 24 GB de VRAM para inferencia comoda (el autor entreno con 4 H200, aunque eso aplica al entrenamiento).
- GPU recomendadas: RTX 4090 o A100/H100 para inferencia; H200 para entrenamiento del adaptador.
- Consumer GPU: probablemente viable en una RTX 4090 (24 GB) con el LoRA Lightning de 4 pasos a 768 px; en GPUs de 16 GB podria requerir cuantizacion u offloading, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: libreria diffusers de Hugging Face (con remapeo de claves `{"transformer." + k.replace(".default", ""): v}` al cargar los pesos) o DiffSynth-Studio, que carga las claves PEFT directamente.
- Latencia y throughput: con el LoRA Lightning de 4 pasos la generacion se completa en 4 pasos de difusion a 768 px; no se publican tiempos concretos.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | albedo si-RMSE | roughness MAE | metallic MAE | Licencia |
|---|---|---|---|---|---|---|
| qwen-image-edit-2511-pbr-lora (v1 + Lightning, DiffSynth) | LoRA generativo | Albedo + roughness + metallic | 0,108 | 0,191 | 0,251 | Apache 2.0 |
| Marigold-IID appearance v1-1 | Difusion dedicada | Descomposicion intrinseca | 0,133 | 0,192 | 0,444 | no disponible |
| RGB<->X | Difusion dedicada | Descomposicion intrinseca | 0,143 | 0,247 | 0,442 | no disponible |

Frente a los metodos dedicados de descomposicion intrinseca, este LoRA ofrece mejores resultados en albedo y metallic con la ventaja de usar el mismo modelo base que genera las vistas del objeto, lo que simplifica el pipeline de texturizado por proyeccion.

## Limitaciones y advertencias

- Resolucion de trabajo recomendada de 768 px; no hay datos publicados sobre rendimiento a otras resoluciones.
- La version v2 muestra un roughness MAE ligeramente peor (0,218 frente a 0,191 de la v1 con diffusers), un compromiso asumido para corregir la confusion de pinturas brillantes con metal.
- Entrenado exclusivamente con renders sinteticos de Blender Cycles; el rendimiento sobre fotografias reales de dominios muy distintos (transparencias, tejidos, subsurface scattering) no esta documentado.
- Los mapas generados son estimaciones de un modelo generativo y pueden contener alucinaciones o inconsistencias por pixel; para produccion criticos conviene validar los mapas resultantes.
- Requiere remapear las claves de los pesos al usarlo con diffusers, un detalle tecnico que puede causar errores de carga si se ignora.
- Licencia Apache 2.0, sin restricciones de uso comercial conocidas; los datasets de entrenamiento usan licencias CC0 y CC-BY, esta ultima con atribucion potencialmente aplicable a materiales derivados.
- Al ser un LoRA, requiere el modelo base Qwen-Image-Edit-2511, cuyo tamano y requisitos de hardware dominan el coste de inferencia.

## Enlaces

- Ficha del modelo: https://huggingface.co/Mike0021/qwen-image-edit-2511-pbr-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- LoRA Lightning recomendado: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
- Dataset MatSynth: https://huggingface.co/datasets/gvecchio/MatSynth
