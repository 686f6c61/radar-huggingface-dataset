# beycanai/Depth-Anything

## Resumen

Depth-Anything es un repositorio de espejo publicado por el usuario beycanai que empaqueta los pesos de los modelos de estimación de profundidad monocular de la familia Depth Anything (V2 Small y Depth Anything 3 en sus variantes Small, Base, Mono-Large y Metric-Large). No es un modelo entrenado por el autor del repositorio: los ficheros son copias sin modificar de los checkpoints originales de los autores de Depth Anything y del repackage oficial de ComfyUI, distribuidas una por fichero para que el nodo de estimación de profundidad de la extensión ComfyUI-BCNodes descargue únicamente la variante seleccionada.

La relevancia práctica del repositorio es de infraestructura más que de investigación: simplifica el despliegue de Depth Anything dentro de ComfyUI, ya que los ficheros se colocan en `ComfyUI/models/geometry_estimation/`, la misma carpeta que lee el nodo nativo Load Depth Anything 3 de ComfyUI, de modo que los checkpoints de la versión 3 sirven para ambos flujos. El tamaño total del repositorio es de 3,5 GB, con ficheros individuales que van desde los 0,10 GB del modelo V2 Small hasta los 1,34 GB de las variantes Large.

La licencia es Apache-2.0 para todos los ficheros incluidos, lo que restringe el conjunto a las variantes con permisos comerciales: V2 Small y las cuatro variantes de Depth Anything 3 (Small, Base, Mono-Large y Metric-Large). Las variantes DA3-Large, DA3-Giant y DA3Nested, publicadas bajo CC-BY-NC-4.0, no forman parte de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos de estimacion de profundidad monocular de la familia Depth Anything; la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible (no se indica el numero de parametros; solo el tamano de cada fichero) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y un fichero .pth sin cuantizar) |
| Idiomas soportados | no disponible (la tarea es de vision; no se declaran idiomas) |
| Licencia | Apache-2.0 (todos los ficheros) |
| Formato de pesos | safetensors (variantes DA3) y .pth (depth_anything_v2_vits.pth) |

Ficheros incluidos en el repositorio:

| Fichero | Variante del nodo | Tamano | Origen original |
|---|---|---|---|
| `depth_anything_v2_vits.pth` | `v2-small` | 0,10 GB | depth-anything/Depth-Anything-V2-Small |
| `depth_anything_3_small.safetensors` | `v3-small` | 0,14 GB | Comfy-Org/Depth-Anything-3 |
| `depth_anything_3_base.safetensors` | `v3-base` | 0,54 GB | Comfy-Org/Depth-Anything-3 |
| `depth_anything_3_mono_large.safetensors` | `v3-mono-large` | 1,34 GB | Comfy-Org/Depth-Anything-3 |
| `depth_anything_3_metric_large.safetensors` | `v3-metric-large` | 1,34 GB | Comfy-Org/Depth-Anything-3 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna, el volumen de datos de entrenamiento ni el proceso de ajuste (RLHF, DPO u otros) de los modelos Depth Anything. La model card se limita a describir el empaquetado de los checkpoints y su integracion con ComfyUI. Lo que si se deduce de los nombres de las variantes es la existencia de dos familias: Depth Anything V2 (representada aqui solo por el tamano Small, `vits`) y Depth Anything 3, que incluye variantes Small, Base y Large, y dentro de las Large distingue entre `mono` (profundidad relativa monocular) y `metric` (profundidad metrica).

Los ficheros de Depth Anything 3 son el repackage que ComfyUI hace de los checkpoints de los autores, con el layout que lee el cargador nativo de ComfyUI; los ficheros no han sido modificados respecto a sus fuentes. El fichero de V2 Small se distribuye en formato `.pth`, mientras que las variantes DA3 usan `safetensors`. No se dispone de informacion adicional sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) en el material facilitado.

## Capacidades

- Estimacion de profundidad monocular a partir de una imagen: es la tarea declarada del pipeline (`depth-estimation`).
- Generacion de mapas de profundidad relativa (variantes `mono`) y de profundidad metrica (variante `metric-large`), segun la nomenclatura de los ficheros de Depth Anything 3.
- Integracion con ComfyUI mediante el nodo de Depth Anything de la extension ComfyUI-BCNodes y mediante el nodo nativo Load Depth Anything 3.
- Descarga selectiva por variante: el nodo descarga solo el modelo elegido en el primer uso.
- Uso como etapa de preprocesado en flujos de generacion de imagen (por ejemplo, ControlNet de profundidad), si bien esto depende de los nodos de terceros y no se documenta en la model card.
- No se declaran capacidades de generacion de texto, codigo, matematicas, tool calling, agentes, vision general, audio ni modos de razonamiento; el alcance es exclusivamente la estimacion de profundidad.

## Casos de uso

- Preprocesado para ControlNet de profundidad en ComfyUI: cargar el checkpoint en `ComfyUI/models/geometry_estimation/` y usar el nodo de profundidad para generar el mapa que condiciona el modelo de difusion; la variante Small (0,10-0,14 GB) permite iterar rapido en maquinas modestas.
- Generacion de mapas de profundidad para composicion y postproduccion: usar `v3-mono-large` o `v3-metric-large` (1,34 GB) cuando se necesita mayor fidelidad en los bordes y en la escala relativa de la escena.
- Medicion de distancias aproximadas en escenas controladas: la variante `v3-metric-large` esta pensada para profundidad metrica, adecuada para tareas donde se requiere una escala absoluta y no solo orden relativo.
- Automatizacion de pipelines de vision por lotes: invocar el modelo sobre carpetas de imagenes para generar mapas de profundidad que alimenten etapas posteriores (segmentacion, reconstruccion, efectos de desenfoque selectivo) sin depender de una GUI.
- Prototipado rapido de efectos 2.5D: convertir fotografias en mapas de profundidad para parallax, desplazamiento de camara o desenfoque de fondo en herramientas de creacion de contenido.
- Evaluacion comparativa de variantes: al estar todas las variantes en un mismo repositorio con ficheros de tamano conocido, resulta sencillo medir el compromiso entre coste (0,10 GB frente a 1,34 GB) y calidad percibida en un conjunto propio de imagenes.
- Reproducibilidad en entornos con acceso restringido: descargar manualmente un unico fichero con `hf download` y colocarlo en la ruta esperada por ComfyUI, evitando descargas en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, los ficheros van de 0,10 GB (V2 Small) a 1,34 GB (DA3 Mono-Large y Metric-Large); el consumo real de VRAM depende de la resolucion de entrada y del backend, datos no facilitados.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: previsiblemente si para todas las variantes por el tamano de los pesos, aunque no se confirma en la documentacion disponible.
- Opciones de despliegue: ComfyUI mediante la extension ComfyUI-BCNodes o el nodo nativo Load Depth Anything 3; descarga manual con `hf download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything (este repositorio, V2 Small y DA3 Small/Base/Mono-Large/Metric-Large) | no disponible | no disponible | Estimacion de profundidad monocular | Apache-2.0 | Hugging Face (espejo) y Comfy-Org/Depth-Anything-3 |
| Depth Anything 3 Large, Giant y Nested | no disponible | no disponible | Estimacion de profundidad monocular | CC-BY-NC-4.0 | Hugging Face (no incluidos en este repositorio) |
| Depth Anything V2 (tamanos distintos de Small) | no disponible | no disponible | Estimacion de profundidad monocular | no disponible en la informacion facilitada | Hugging Face (depth-anything/Depth-Anything-V2-Small como origen del fichero V2 Small) |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a licencia, disponibilidad y presencia de variantes.

## Limitaciones y advertencias

- El repositorio es un espejo de terceros: los pesos son copias de los checkpoints originales y del repackage de ComfyUI; para citar o reportar problemas conviene referirse a las fuentes originales.
- Solo incluye las variantes con licencia Apache-2.0; las variantes DA3-Large, DA3-Giant y DA3Nested (CC-BY-NC-4.0) no estan disponibles aqui, por lo que no se puede acceder a la maxima calidad de la familia desde este repositorio.
- El fichero de V2 Small esta en formato `.pth`, no en `safetensors`, lo que puede requerir un cargador distinto y plantea consideraciones de seguridad al cargar pesos serializados con pickle.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma; al ser un modelo de vision, los sesgos relevantes serian los del dataset de imagenes de entrenamiento, no descritos en la informacion disponible.
- No se especifican resoluciones de entrada soportadas, limites de contexto visual ni condiciones de escena (interiores, exteriores, escenas nocturnas) en las que el modelo pueda degradarse.
- La licencia Apache-2.0 permite uso comercial de los ficheros incluidos, pero no se ofrece ninguna garantia por parte del autor del espejo ni de los autores originales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad; conviene verificar la integridad de los ficheros frente a las fuentes originales antes de usarlos en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beycanai/Depth-Anything
- Extension ComfyUI-BCNodes: https://github.com/0xBeycan/ComfyUI-BCNodes
- Origen de Depth Anything V2 Small: https://huggingface.co/depth-anything/Depth-Anything-V2-Small
- Origen de los checkpoints de Depth Anything 3 (repackage de ComfyUI): https://huggingface.co/Comfy-Org/Depth-Anything-3
- Licencia del repositorio: fichero `LICENSE` incluido en el propio repositorio
