# Comfy-Org/MoGe

## Resumen

MoGe (Monocular Geometry Estimation) es un modelo de vision por computador especializado en la estimacion de geometria a partir de una unica imagen monoculo. Desarrollado originalmente por Microsoft Research (repositorio `microsoft/moge`) y publicado en Hugging Face bajo el espacio `Ruicheng/moge-*`, el paquete que nos ocupa es un reempaquetado oficial de Comfy-Org que convierte los pesos originales en ficheros `safetensors` de un solo archivo (single-file) listos para cargarse como nodos nativos en ComfyUI.

El modelo resuelve un problema clasico de vision 3D: recuperar profundidad, normales de superficie y parametros intrinsecos de camara a partir de una sola fotografia, sin necesidad de multiples vistas ni calibracion. La familia MoGe ha evolucionado a lo largo de varias versiones (MoGe-1, MoGe-2 y MoGe-3) que se distinguen por el tamano del backbone ViT (ViT-L y ViT-G) y por la incorporacion progresiva de mapas de normales y mejoras en la estimacion de perspectiva y panoramas.

Este repositorio concreto es relevante porque elimina la friccion de integracion: los usuarios de ComfyUI pueden incorporar estimacion de geometria monoculo, conversion de perspectiva a malla y de panorama a malla dentro de sus pipelines de generacion 3D y edicion de imagen, sin depender de scripts externos. El paquete incluye cuatro variantes de pesos en FP16 que cubren las tres generaciones del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) para estimacion de geometria monoculo; variantes ViT-L y ViT-G |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP16 (ficheros `*_fp16.safetensors`); no se documentan otras precisiones en el repo |
| Idiomas soportados | no aplica (modelo de vision, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (single-file, empaquetado para ComfyUI) |

Variantes incluidas en el repositorio:

| Fichero | Generacion | Backbone | Tamano del repo total |
|---|---|---|---|
| `moge_1_vitl_fp16.safetensors` | MoGe-1 | ViT-L | 4.5 GB (repo completo) |
| `moge_2_vitl_normal_fp16.safetensors` | MoGe-2 | ViT-L (con normales) | incluido en los 4.5 GB |
| `moge_3_vitg_fp16.safetensors` | MoGe-3 | ViT-G | incluido en los 4.5 GB |
| `moge_3_vitl_fp16.safetensors` | MoGe-3 | ViT-L | incluido en los 4.5 GB |

## Arquitectura y entrenamiento

MoGe se basa en un backbone Vision Transformer (ViT) que procesa una imagen de entrada y produce, en una sola pasada, un mapa denso de profundidad, normales de superficie (en las variantes que lo soportan, como `moge_2_vitl_normal`) y parametros de camara. La formulacion esta disenada para ser invariante a la escala y al sesgo de desplazamiento, de modo que la geometria recuperada sea metricamente coherente sin calibracion previa. Las variantes ViT-L y ViT-G difieren en la capacidad del encoder: ViT-G ofrece mayor fidelidad a costa de mas computo y memoria.

No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni la presencia de etapas de RLHF o DPO (no aplicables a un modelo de vision de este tipo). Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. El empaquetado de Comfy-Org no altera la arquitectura del modelo original: solo convierte los pesos a `safetensors` de un solo archivo y los organiza en la carpeta `models/geometry_estimation/` de ComfyUI.

## Capacidades

- Estimacion de profundidad densa a partir de una unica imagen monoculo.
- Estimacion de normales de superficie (variante `moge_2_vitl_normal`).
- Recuperacion de parametros intrinsecos de camara (perspectiva y campo de vision).
- Conversion de imagen en perspectiva a malla 3D (workflow "Perspective Geometry Estimation").
- Conversion de panorama equirectangular a malla 3D (workflow "Panorama to Mesh").
- Generacion de mapas de profundidad utilizables como entrada en pipelines de difusion (workflow "Depth Estimation: MoGe").
- Integracion nativa como nodo de ComfyUI dentro de flujos de generacion y edicion 3D.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual y feed-forward.

## Casos de uso

- Generacion de mallas 3D a partir de fotografias: cargando `moge_3_vitg_fp16.safetensors` en el nodo de geometria de ComfyUI se obtiene una malla texturizada de una sola imagen, util para prototipado rapido de assets en videojuegos o realidad aumentada.
- Depth maps para ControlNet y difusion: el workflow "Depth Estimation: MoGe" produce mapas de profundidad que se pueden encadenar a un modelo de difusion para condicionar la composicion espacial de una imagen generada.
- Reconstruccion de escenas panoramicas: el workflow "Panorama to Mesh" convierte una panoramica 360 en una malla navegable, adecuado para tour virtuales y visualizacion arquitectonica.
- Previsualizacion de geometria en pipelines de VFX: estimar normales y profundidad de plates de rodaje para integrar elementos CGI con coherencia de perspectiva antes del render final.
- Automatizacion de catalogos de producto: generar vistas 3D aproximadas de objetos a partir de una foto de catalogo, reduciendo la necesidad de fotografia multi-angulo.
- Investigacion en vision 3D: usar las cuatro variantes como baseline reproducible para comparar metodos de estimacion monoculo, aprovechando la licencia MIT y los pesos en FP16.
- Edicion de imagen con conciencia espacial: emplear el mapa de profundidad como mascara o guia en flujos de inpainting y outpainting dentro de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del reempaquetado de Comfy-Org no incluye tablas de metricas (como AbsRel, RMSE o δ1) ni comparaciones cuantitativas con otros estimadores monoculo. Para datos de evaluacion habria que consultar los repositorios originales de `Ruicheng/moge-*` y el paper asociado, que no forman parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un ViT-L en FP16 suele requerir del orden de 1-2 GB de VRAM para inferencia a resoluciones moderadas, y un ViT-G algo mas; estas cifras son estimaciones y no estan confirmadas en la documentacion del repo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del backbone, se espera que quepan en GPUs consumer modernas (RTX 3060 12 GB en adelante), pero no hay confirmacion oficial.
- Despliegue: el uso previsto es ComfyUI (nodos nativos de `geometry_estimation`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoGe (este repo, ViT-L/ViT-G) | no disponible | no aplica | Geometria monoculo (profundidad, normales, camara) | MIT | Hugging Face + ComfyUI |
| Depth Anything V2 | no disponible en la informacion | no aplica | Profundidad monoculo | no disponible en la informacion | Hugging Face |
| MiDaS | no disponible en la informacion | no aplica | Profundidad monoculo | no disponible en la informacion | Hugging Face / torch.hub |

No se dispone de datos cuantitativos para establecer una comparacion de rendimiento fiable entre MoGe y estas alternativas dentro de la informacion proporcionada. La comparativa se limita a la categoria de tarea y a la licencia conocida de MoGe (MIT).

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto, no soporta tool calling ni razonamiento multi-paso; no debe evaluarse como un LLM.
- La estimacion monoculo es intrinsecamente ambigua: objetos con superficies reflectantes, transparentes o sin textura pueden producir geometria incorrecta.
- No se documentan sesgos especificos ni evaluaciones de robustez por tipo de escena en la informacion disponible.
- Riesgo de alucinacion geometrica: el modelo puede inventar profundidad plausible en regiones ocluidas o de bajo contraste.
- La licencia MIT permite uso comercial, pero el usuario debe verificar la licencia de los pesos originales de `Ruicheng/moge-*` y del codigo de `microsoft/moge`, ya que este repo solo reempaqueta.
- Los ficheros estan en FP16; no se ofrecen variantes cuantizadas a 8 o 4 bits en este repositorio, lo que limita el despliegue en hardware muy restringido.
- El repo pesa 4.5 GB e incluye cuatro variantes: conviene descargar solo el fichero necesario para el workflow concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/MoGe
- Repositorio original de Microsoft: https://github.com/microsoft/moge
- Pesos MoGe-1: https://huggingface.co/Ruicheng/moge-vitl
- Pesos MoGe-2: https://huggingface.co/Ruicheng/moge-2-vitl
- Pesos MoGe-3 ViT-G: https://huggingface.co/Ruicheng/moge-3-vitg
- Pesos MoGe-3 ViT-L: https://huggingface.co/Ruicheng/moge-3-vitl
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Workflow perspectiva a malla: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/3d_moge_perspective_to_mesh.json
- Workflow panorama a malla: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/3d_moge_panorama_to_mesh.json
- Workflow estimacion de profundidad: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_moge_depth_estimation.json
- Workflow geometria MoGe 3: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_moge3_geometry_estimation.json
