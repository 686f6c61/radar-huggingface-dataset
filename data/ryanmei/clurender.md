# RyanMei/clurender

## Resumen

CluRender es un metodo de aprendizaje autosupervisado de representaciones de nubes de puntos 3D. Este repositorio de Hugging Face, publicado por RyanMei, contiene los codificadores DGCNN preentrenados con dicho metodo sobre ShapeNetCore v2, y no un modelo de lenguaje. El trabajo de referencia es "Unsupervised Point Cloud Representation Learning by Clustering and Neural Rendering" (IJCV 2024), de Mei, Saltori, Ricci, Sebe, Wu, Zhang y Poiesi.

La idea central es combinar agrupamiento (clustering) con renderizado neuronal: el codificador produce caracteristicas por punto que un decodificador proyecta a una imagen, y esa imagen se compara con vistas renderizadas del objeto. Existen dos variantes segun el objetivo de renderizado: una que reconstruye vistas RGB y otra que predice caracteristicas DINOv2 reducidas por PCA. El repositorio incluye dos checkpoints, `dgcnn-rgb-ep40` y `dgcnn-dino-ep100`, con sus correspondientes `backbone.pth` y `config.json`.

Es relevante para quien necesite un extractor de caracteristicas 3D congelado para tareas de clasificacion, segmentacion o recuperacion de formas, sin entrenamiento supervisado. El tamano del repositorio es de 0.0 GB segun los metadatos, y no se declara licencia ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DGCNN (Dynamic Graph CNN) como codificador; decodificador point-transformer U-Net (variante RGB) o MLP por punto (variante DINOv2) |
| Parametros totales | no disponible (el codificador usa `emb_dims=1024`, `k=20`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 1024 puntos por nube (`B x 3 x N`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision 3D) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`backbone.pth`, state dict) y `config.json` |

## Arquitectura y entrenamiento

El codificador es una DGCNN que opera sobre 1024 puntos obtenidos por farthest point sampling y devuelve caracteristicas globales y por punto. El preentrenamiento combina clustering con renderizado neuronal: se forman 64 clusters y un decodificador genera una representacion intermedia que se proyecta a 4 vistas de 256 x 256 pixeles. La perdida es una sliced Wasserstein image loss con 128 proyecciones. En la variante RGB, los puntos se colorean mediante un decodificador point-transformer U-Net y se comparan con las vistas RGB. En la variante DINOv2, el decodificador predice un vector de 64 dimensiones por punto, que se proyecta sobre la rejilla de parches y se compara con caracteristicas de parche de DINOv2 ViT-B/14 reducidas a 64 dimensiones por PCA.

Los datos son mallas de ShapeNetCore v2, excluyendo los objetos de test de ShapeNetPart, renderizadas con `prepare_shapenet.py`. El autor advierte que estos renderizados difieren de los del paper, por lo que las puntuaciones no son directamente comparables con las publicadas. El entrenamiento usa AdamW con learning rate 0.001, decaimiento de 0.7 cada 20 epocas y batch size 32 sobre 4 GPUs. La variante RGB se planifico para 250 epocas pero los pesos liberados son de la epoca 40; la variante DINOv2 se libera en la epoca 100.

## Capacidades

- Extraccion de caracteristicas globales y por punto de nubes de puntos 3D (`global_features`, `point_features`).
- Clasificacion de formas 3D mediante SVM lineal sobre caracteristicas congeladas.
- Base para tareas downstream de segmentacion, deteccion o recuperacion de formas, segun los scripts del repositorio.
- Aprendizaje autosupervisado: no requiere etiquetas durante el preentrenamiento.
- Dos objetivos de renderizado distintos (RGB y caracteristicas DINOv2), lo que permite elegir el checkpoint segun la tarea.
- No soporta tool calling, agentes, texto, vision 2D general, audio ni capacidades multilingues.

## Casos de uso

- Clasificacion de formas 3D: se extraen caracteristicas globales congeladas de 1024 puntos y se entrena un SVM lineal (C = 0.1) sobre el split de entrenamiento de ModelNet40, replicando el protocolo `main_svm.py`.
- Segmentacion semantica o de partes: las caracteristicas por punto del codificador sirven como entrada a cabezas ligeras entrenadas sobre ShapeNetPart o datasets propios.
- Recuperacion de formas (shape retrieval): las caracteristicas globales permiten construir indices de similitud para buscar mallas similares en catalogos 3D.
- Preentrenamiento como inicializacion: el `backbone.pth` se carga como `--pretrained` en los scripts downstream del repositorio para acelerar el ajuste fino en dominios con pocas etiquetas.
- Investigacion en representacion 3D autosupervisada: la configuracion de clustering y renderizado permite reproducir y comparar los dos objetivos (RGB frente a DINOv2) sobre el mismo codificador.
- Prototipado de pipelines de vision 3D: al ser un state dict de PyTorch, se integra en flujos existentes basados en DGCNN sin dependencias de servidores de inferencia.

## Benchmarks y rendimiento

Resultados de ModelNet40 con SVM lineal (C = 0.1) sobre caracteristicas globales congeladas de 1024 puntos, segun la model card:

| Checkpoint | Clustering | Objetivo de renderizado | Decodificador | Epocas | OA (%) | mAcc (%) |
|---|---|---|---|---|---|---|
| `dgcnn-rgb-ep40` | si | vistas RGB | point-transformer U-Net | 40 | 89.7 | 87.0 |
| `dgcnn-dino-ep100` | si | mapas de caracteristicas DINOv2 | MLP por punto | 100 | 90.6 | 87.8 |

No se han publicado en la informacion disponible resultados comparativos con otros metodos ni cifras del paper aplicables a estos pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso 4 GPUs con batch size 32, lo que sugiere un consumo moderado por muestra.
- GPU recomendadas: no disponible; el codificador DGCNN con `emb_dims=1024` es ligero y cabe con holgura en GPUs de consumo, aunque no se documenta una cifra concreta.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del codificador, pero no se confirma en la informacion disponible.
- Opciones de despliegue: PyTorch nativo con `huggingface_hub.hf_hub_download`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CluRender (este repo) | no disponible (`emb_dims=1024`) | 1024 puntos, 4 vistas 256x256 en entrenamiento | ModelNet40 SVM OA 90.6 (DINOv2), 89.7 (RGB) | no disponible | Hugging Face, pesos PyTorch |
| Point-MAE | no disponible | nubes de puntos | no disponible en esta busqueda | no disponible | no disponible |
| Point-BERT | no disponible | nubes de puntos | no disponible en esta busqueda | no disponible | no disponible |
| DGCNN supervisado | no disponible | 1024 puntos | no disponible en esta busqueda | no disponible | no disponible |

No se dispone de datos verificados de los modelos alternativos en la informacion proporcionada; la comparativa queda incompleta y no debe usarse para decisiones sin consultar las fuentes originales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso conversacional es inaplicable.
- Los renderizados usados difieren de los del paper, por lo que las puntuaciones no son directamente comparables con las publicadas en IJCV 2024.
- La variante RGB se libera en la epoca 40 de un entrenamiento planificado a 250 epocas; puede estar infraentrenada.
- Entrenado unicamente sobre ShapeNetCore v2 (objetos sinteticos de categorias acotadas); el rendimiento en escenas reales, LiDAR o nubes con ruido no esta documentado.
- Licencia no declarada: no se puede asumir uso comercial sin contactar con el autor.
- Riesgo de sesgo por el dataset: categorias y geometrias de ShapeNet no representan la distribucion de datos 3D reales.
- Dependencia del codigo del repositorio `github.com/gfmei/clurender` para cargar el modelo (`models.dgcnn.DGCNN`); no hay pipeline de Hugging Face.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/RyanMei/clurender
- Paper (IJCV 2024): https://doi.org/10.1007/s11263-024-02027-5
- Codigo: https://github.com/gfmei/clurender
- Dataset: ShapeNet/ShapeNetCore
