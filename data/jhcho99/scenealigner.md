# jhcho99/SceneAligner

## Resumen

SceneAligner es un método de localización sobre plano (floorplan localization) que, a partir de un conjunto de imágenes capturadas "in the wild" y de un plano rasterizado, reconstruye la escena en 3D y alinea esa reconstrucción con el plano 2D para determinar dónde se tomó cada imagen. Lo desarrollan Junhyeong Cho, Ruojin Cai y Hadar Averbuch-Elor (Cornell VAILab) y el trabajo se ha aceptado en NeurIPS 2026.

El repositorio `jhcho99/SceneAligner` no contiene un modelo completo, sino únicamente las capas LoRA de rango 16 que se montan sobre el backbone de visión DINOv3 ViT-B/16. La adaptación transforma un modelo fundacional 2D de extracción de características en un extractor de correspondencias entre mapas de densidad procedentes de reconstrucciones 3D alineadas con la gravedad y planos arquitectónicos, salvando la diferencia de apariencia entre ambos dominios.

Su relevancia práctica está en el enfoque: en lugar de entrenar un modelo específico desde cero, adapta un backbone congelado (variante Base, ViT-B/16, del orden de 86 M de parámetros) con un adaptador LoRA de rango 16 y un esquema de ajuste fino que prioriza coincidencias semánticamente alineadas sin romper la consistencia estructural. El repositorio se lista con 0.0 GB y no incluye los pesos DINOv3, que deben descargarse aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer DINOv3 ViT-B/16 con capas LoRA (rango 16) sobre el backbone; no es un modelo de lenguaje ni un MoE |
| Parametros totales | No disponible; la model card no declara el recuento total. El backbone DINOv3 ViT-B/16 corresponde a la variante Base de la familia (del orden de 86 M, dato no confirmado en la ficha) y el adaptador LoRA de rango 16 anade un numero no especificado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es una imagen, no una secuencia de texto. El backbone procesa la imagen en parches de 16x16 |
| Tipos de cuantizacion | No disponible; no se documentan versiones cuantizadas (los adaptadores se distribuyen en safetensors) |
| Idiomas soportados | No disponible; no aplica (modelo de vision, la model card no declara idiomas) |
| Licencia | DINOv3 License (`license: other`, `license_name: dinov3-license`), con el fichero LICENSE.md en el repositorio |
| Formato de pesos | safetensors (`adapter_model.safetensors` junto con `adapter_config.json`, formato de adaptador PEFT/LoRA) |
| Tarea declarada (pipeline) | `image-feature-extraction` |
| Modelo base | `facebook/dinov3-vitb16-pretrain-lvd1689m` (DINOv3 ViT-B/16 preentrenado con LVD-1689M) |
| Tamano del repositorio | 0.0 GB |
| Casos de uso etiquetados | `floorplan-localization`, `3d-reconstruction` |

## Arquitectura y entrenamiento

La propuesta parte de un modelo fundacional 2D de visión (DINOv3 ViT-B/16) y lo adapta para aprender correspondencias cross-modales entre mapas de densidad y planos arquitectonicos. Para salvar la diferencia de apariencia entre ambos dominios, el esquema de ajuste fino introducido favorece emparejamientos semanticamente alineados manteniendo la consistencia estructural. La adaptacion se materializa en capas LoRA de rango 16, lo que permite reutilizar el backbone congelado y distribuir unicamente el adaptador.

No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de vision de este tipo). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. El pipeline completo de SceneAligner reconstruye primero una nube de puntos 3D alineada con la gravedad a partir de las imagenes y despues realiza la alineacion global contra el plano 2D rasterizado; las capas LoRA son la pieza aprendida de ese pipeline.

## Capacidades

- Extraccion de caracteristicas de imagen como tarea principal declarada (`image-feature-extraction`).
- Correspondencia cross-modal entre mapas de densidad de reconstrucciones 3D alineadas con la gravedad y planos 2D rasterizados.
- Localizacion global de imagenes dentro de un plano y alineacion de la reconstruccion 3D contra el plano.
- Manejo de escenas a gran escala, incluidos entornos exteriores, segun la descripcion del repositorio de codigo.
- Preservacion de la consistencia estructural ademas de la coincidencia semantica durante el ajuste.
- Integracion con pesos DINOv3 cargados mediante `scenealigner.inference.load_model`, desde la copia de timm o desde los pesos de Meta.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, function calling, agentes ni razonamiento multi-paso.
- No declara capacidades multilingues, de audio ni de video.

## Casos de uso

- Localizacion indoor para realidad aumentada: situar un dispositivo o una fotografia dentro de un edificio usando su plano, alineando la reconstruccion 3D de las imagenes con el plano rasterizado.
- Robotica de interiores y navegacion: un robot que dispone del plano del edificio puede emplear las correspondencias para estimar su posicion global a partir de imagenes capturadas durante el recorrido.
- Localizacion en exteriores y recintos grandes: el metodo declara funcionar con escenas de gran escala, incluidas exteriores, por lo que encaja en campus, recintos feriales o instalaciones industriales con plano disponible.
- Gestion de instalaciones y mantenimiento: geolocalizar automaticamente fotografias de inspeccion sobre el plano del inmueble para mantener un inventario visual indexado por ubicacion.
- Respuesta a emergencias: situar en el plano del edificio las imagenes enviadas por ocupantes o equipos de rescate, siempre que exista reconstruccion 3D y plano del recinto.
- Construccion y BIM: contrastar el estado real capturado en obra con el plano de proyecto mediante la alineacion global de la reconstruccion.
- Venta y recorridos inmobiliarios: asignar cada fotografia de un inmueble a su estancia o zona concreta del plano para generar recorridos ordenados.
- Curaduria de datasets de vision: etiquetar conjuntos de imagenes con su posicion en el plano para entrenar o evaluar otros sistemas de localizacion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de metricas y los resultados de busqueda consultados no proporcionan cifras concretas (ni de error de localizacion, ni de recall, ni comparativas numericas con otros metodos).

## Requisitos de hardware

- El adaptador LoRA es de tamano reducido (el repositorio completo se lista con 0.0 GB), por lo que el coste de almacenamiento del adaptador es despreciable.
- El backbone DINOv3 ViT-B/16, variante Base, es un modelo pequeno: del orden de 86 M de parametros si se confirma la variante estandar, lo que supone aproximadamente 350 MB en FP32 y unos 175 MB en FP16 (estimacion a partir del nombre de la variante, no declarada en la model card).
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4090) es suficiente para el backbone y el adaptador en FP16.
- La inferencia en CPU es viable por el tamano del modelo, aunque con mayor latencia.
- El cuello de botella real del pipeline no es el transformer, sino las etapas previas de reconstruccion 3D (SfM/MVS) y de rasterizacion del plano.
- Opciones de despliegue: PyTorch con las utilidades del repositorio de codigo (`scenealigner.inference.load_model`), `timm` para cargar el backbone DINOv3, y el ecosistema PEFT para el adaptador LoRA.
- vLLM, TGI, llama.cpp y Ollama no son aplicables a este adaptador, al no tratarse de un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas numericas ni de especificaciones de modelos alternativos de localizacion sobre plano en la informacion proporcionada. La unica referencia directa documentada es el modelo base sobre el que se monta el adaptador.

| Modelo | Relacion | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneAligner (LoRA r16 sobre DINOv3 ViT-B/16) | Objeto de esta ficha | No disponible (adaptador LoRA de rango 16) | Localizacion de imagenes en plano mediante alineacion 3D-2D | DINOv3 License | HuggingFace (solo adaptador) + GitHub del proyecto |
| `facebook/dinov3-vitb16-pretrain-lvd1689m` | Modelo base | No disponible en la ficha | Extraccion de caracteristicas de imagen de proposito general | DINOv3 License | HuggingFace y repositorio de Meta |
| `timm/vit_base_patch16_dinov3.lvd1689m` | Copia de los mismos pesos para `timm` | No disponible en la ficha | Extraccion de caracteristicas de imagen de proposito general | DINOv3 License | HuggingFace |
| Otros metodos de localizacion sobre plano | Alternativas de la misma tarea | no disponible | Localizacion visual / alineacion de planos | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio contiene unicamente las capas LoRA; sin descargar aparte los pesos DINOv3 (copia de timm o pesos de Meta) el adaptador no es utilizable.
- La licencia es la DINOv3 License, marcada como `other` en HuggingFace y no como licencia de codigo abierto estandar. Los adaptadores son una obra derivada de los pesos DINOv3, por lo que hay que revisar LICENSE.md antes de cualquier uso comercial.
- Al ser una obra derivada del backbone, hereda los sesgos de DINOv3; la model card no documenta sesgos especificos.
- Riesgo de correspondencias o alineaciones incorrectas entre el mapa de densidad y el plano, especialmente con gran diferencia de apariencia, escenas simetricas o entornos repetitivos. No es "alucinacion" en sentido generativo, pero el efecto practico es una localizacion erronea.
- El metodo depende de un pipeline previo de reconstruccion 3D alineada con la gravedad y de un plano rasterizado; errores en esas etapas degradan directamente el resultado final.
- No hay limitaciones de idioma aplicables por tratarse de un modelo de vision, pero tampoco existe evaluacion multilingue ni de dominios no cubiertos.
- Ausencia total de metricas publicadas en la informacion disponible: no hay cifras de error de localizacion ni comparativas con alternativas.
- Repositorio sin traccion en HuggingFace (0 descargas, 0 likes) en la fecha de consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- No es un modelo de lenguaje: no admite generacion de texto, tool calling, agentes ni razonamiento multi-paso, por lo que no debe integrarse en pipelines que esperen esas capacidades.
- Para produccion conviene validar el comportamiento en el dominio concreto (interiores frente a exteriores, densidad de imagenes, calidad del plano) antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhcho99/SceneAligner
- Repositorio de codigo: https://github.com/Cornell-VAILab/SceneAligner
- Pagina del proyecto: https://cornell-vailab.github.io/SceneAligner/
- Paper en arXiv: https://arxiv.org/abs/2605.22581
- Ficha del paper en HuggingFace: https://huggingface.co/papers/2605.22581
- Copia de los pesos DINOv3 ViT-B/16 en timm: https://huggingface.co/timm/vit_base_patch16_dinov3.lvd1689m
- Repositorio oficial de DINOv3 (Meta): https://github.com/facebookresearch/dinov3
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Anuncio en LinkedIn: https://www.linkedin.com/posts/jhcho99_neurips2026-computervision-3dvision-activity-7511094935165775874-P_oE
