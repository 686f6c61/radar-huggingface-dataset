# LibreYOLO/LibreRFDETRm-ui

## Resumen

LibreRFDETRm-ui es un detector de elementos de interfaz de usuario para capturas de pantalla, publicado por el proyecto LibreYOLO. Detecta de forma agnostica a la clase cualquier elemento interactivo presente en una imagen de UI (botones, enlaces, campos de entrada, celdas de calendario, iconos), devolviendo unicamente cajas delimitadoras bajo una unica clase denominada `object`. No clasifica el tipo de elemento ni extrae texto: su funcion es la percepcion espacial de la pantalla.

Tecnicamente es un reempaquetado de UI-DETR-1, un fine-tune de RF-DETR-Medium construido por el equipo de UI-DETR-1 como etapa de percepcion de un agente de tipo computer-use. RF-DETR-Medium es un detector basado en transformer (familia DETR) con backbone DINOv2 de Meta. El modelo trabaja con un tamano de entrada nativo de 576 px y un umbral de confianza recomendado de 0.35.

Su relevancia actual reside en que expone pesos ya entrenados con licencia MIT a traves de la fabrica de LibreYOLO, lo que facilita su integracion en flujos de automatizacion de GUI y agentes que operan sobre interfaces. El repositorio ocupa 0,1 GB, tiene 0 descargas y 0 likes, y fue creado el 24 de septiembre de 2026, por lo que se trata de una publicacion muy reciente y sin validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR-Medium (detector transformer de la familia DETR con backbone DINOv2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (fine-tune UI-DETR-1) sobre pesos base Apache License 2.0 |
| Formato de pesos | PyTorch (.pt) |
| Tarea | Deteccion de objetos (object-detection) |
| Numero de clases | 1 (clase unica `object`) |
| Tamano de entrada nativo | 576 px |
| Umbral de confianza recomendado | 0,35 |
| Modelo base | racineai/UI-DETR-1 (revision 0f0dda5) |
| Libreria | libreyolo |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de RF-DETR-Medium, un detector de objetos basado en transformer de la familia DETR que sustituye el backbone convolutional habitual por un backbone DINOv2 (auto-supervisado, de facebookresearch). Sobre esa base, el equipo de UI-DETR-1 realizo un fine-tune orientado a pantallas de interfaz, colapsando todas las categorias anotadas en una unica clase agnostica `object`. El modelo original fue concebido como la etapa de percepcion de un agente de computer-use; es decir, su salida alimenta a un agente que decide acciones sobre la GUI.

Los datos de entrenamiento declarados son 2.656 capturas de pantalla procedentes de seis datasets de Roboflow Universe, fusionadas por los autores en una sola clase. El dataset se declara con licencia MIT en las notas de publicacion de UI-DETR-1. Este repositorio concreto no reentrena ni modifica los pesos: la intervencion descrita consiste unicamente en el reempaquetado de metadatos del checkpoint. Los parametros aprendidos son el estado `model` original (no la copia EMA) y son identicos bit a bit a `model.pth`. Se descartan optimizador, scheduler, EMA y argumentos de entrenamiento, y el wrapper anade los campos `model_family`, `size`, `task`, `nc=1`, `names={0: "object"}` e `imgsz=576` para que la fabrica `LibreYOLO()` enrute el modelo sin heuristica de nombre de fichero.

## Capacidades

- Deteccion de elementos interactivos en capturas de pantalla: botones, enlaces, campos de entrada, celdas de calendario e iconos.
- Deteccion agnostica a la clase: todas las categorias se devuelven bajo la etiqueta unica `object`, sin distinguir tipo de control.
- Prediccion de cajas delimitadoras con puntuacion de confianza por deteccion, con umbral operativo recomendado de 0,35.
- Procesamiento de imagenes de UI a resolucion nativa de 576 px.
- Uso como etapa de percepcion dentro de agentes de computer-use que necesitan localizar zonas clicables.
- No realiza reconocimiento de texto (OCR) ni clasificacion semantica del elemento.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica de forma directa; el modelo es unicamente el componente de vision de dichos agentes.
- Capacidades multilingues: no aplica al ser un detector visual, aunque la deteccion de elementos no depende del idioma del texto de la interfaz.

## Casos de uso

- Agentes de computer-use: el modelo actua como etapa de percepcion que localiza los elementos interactivos de la pantalla para que un agente decida donde hacer clic o escribir, aprovechando su entrenamiento especifico sobre capturas de UI.
- Automatizacion de pruebas de interfaz: en pipelines de QA, se puede ejecutar sobre capturas de cada build para verificar que los elementos esperados siguen presentes y en posiciones coherentes, detectando regresiones visuales.
- Automatizacion robótica de procesos (RPA) guiada por vision: sustituye o complementa selectores fragiles basados en DOM, localizando controles directamente sobre la imagen para operar aplicaciones de escritorio o web.
- Etiquetado y anotacion asistida de datasets de UI: sirve como preanotador que propone cajas para que anotadores humanos revisen, reduciendo el coste de construir nuevos datasets de elementos de interfaz.
- Accesibilidad y descripcion de pantallas: combinado con un modelo de lenguaje, permite generar descripciones de las zonas interactivas de una aplicacion para usuarios con discapacidad visual.
- Extraccion de estructura de maquetas y disenos: dado un mockup o captura estatica, localizar los elementos interactivos para generar documentacion tecnica o especificaciones de layout.
- Cosecha de datos para entrenamiento de navegadores autonoomos: sobre capturas a gran escala, generar anotaciones de elementos clicables que alimenten etapas posteriores del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas tipo COCO (mAP, AP50) ni comparaciones cuantitativas con otros detectores.

El unico dato de validacion disponible es una comprobacion de equivalencia funcional frente a la implementacion upstream `rfdetr` 1.10.1, realizada sobre cinco capturas de pantalla de UI con umbral de confianza 0,3: el numero de cajas detectadas es identico, todas las cajas coinciden con un IoU superior a 0,9 y la diferencia mediana de confianza es inferior a 1e-3. Esta prueba confirma que el reempaquetado no altera el comportamiento del modelo, pero no constituye un benchmark de calidad de deteccion.

## Requisitos de hardware

- No se publican requisitos de hardware (VRAM, GPU recomendadas, latencia o throughput) en la informacion disponible.
- El tamano del repositorio es de 0,1 GB, lo que da una idea del orden de magnitud del checkpoint en disco; no implica un consumo de VRAM equivalente durante la inferencia.
- Al estar basado en RF-DETR-Medium con backbone DINOv2, el modelo no es especialmente ligero; se desconoce si cabe en GPU de consumo.
- Opciones de despliegue documentadas: carga mediante la fabrica `LibreYOLO("LibreRFDETRm-ui.pt")` de la libreria `libreyolo`, que descarga los pesos automaticamente desde el repositorio; el checkpoint tambien puede utilizarse con el stack upstream `rfdetr`.
- Integracion con otros runners (vLLM, llama.cpp, Ollama, TGI) no aplica por tratarse de un modelo de vision, no de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Entrada nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRFDETRm-ui | RF-DETR-Medium + DINOv2 | 1 (`object`) | 576 px | MIT sobre base Apache 2.0 | HuggingFace, via LibreYOLO |
| UI-DETR-1 (racineai) | RF-DETR-Medium + DINOv2 | 1 (`object`) | 576 px | MIT | HuggingFace |
| RF-DETR-Medium (roboflow) | RF-DETR-Medium + DINOv2 | multiproposito (dataset COCO/otro) | no disponible | Apache 2.0 | GitHub / roboflow |

LibreRFDETRm-ui y UI-DETR-1 comparten pesos identicos (bit a bit); la diferencia es unicamente el envoltorio de metadatos para la fabrica de LibreYOLO. RF-DETR-Medium es el modelo base sin el fine-tune de UI, por lo que no esta especializado en pantallas de interfaz. No se dispone de datos de benchmarks que permitan comparar su calidad de deteccion frente a detectores genericos tipo YOLO u otros detectores de UI.

## Limitaciones y advertencias

- Clase unica: el modelo no distingue entre tipos de elemento (boton, enlace, campo de texto); solo indica que hay un elemento interactivo. Requiere un modelo adicional o reglas heuristicas para saber que es cada caja.
- No realiza OCR: no extrae ni interpreta el texto contenido en los elementos detectados.
- Sesgos de datos: el entrenamiento se basa en 2.656 capturas de seis datasets de Roboflow Universe, lo que limita la diversidad de estilos de UI, plataformas y resoluciones cubiertas. Interfaces muy distintas del dominio de entrenamiento pueden degradar el rendimiento.
- Sensibilidad al umbral: el comportamiento depende del umbral de confianza (0,35 recomendado); umbrales mal ajustados producen falsos positivos o deteccion incompleta.
- Riesgo de alucinacion en el sentido de detecciones espurias: puede proponer cajas sobre regiones no interactivas o fusionar elementos proximos.
- Modelo muy reciente y sin adopcion: 0 descargas y 0 likes en el momento de la consulta, publicado el 24 de septiembre de 2026 y actualizado el mismo dia. No hay validacion externa ni casos de produccion documentados.
- Sin benchmarks publicos: no se puede estimar su calidad absoluta ni compararla con alternativas sin evaluarla uno mismo.
- Licencia: el fine-tune es MIT, pero los pesos base derivan de RF-DETR-Medium (Apache 2.0) y DINOv2 (Apache 2.0). Es necesario conservar los ficheros `LICENSE` y `NOTICE` y respetar las condiciones de las licencias base al redistribuir.
- Repositorio de solo 0,1 GB: confirma que unicamente contiene el checkpoint y los metadatos, no artefactos de entrenamiento; no esperes reproducibilidad del entrenamiento a partir de este repositorio.
- No es un modelo de lenguaje: carece de razonamiento, generacion de texto y tool calling; cualquier funcionalidad de ese tipo debe aportarla un componente externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreRFDETRm-ui
- Modelo base (pesos originales): https://huggingface.co/racineai/UI-DETR-1
- Libreria LibreYOLO (GitHub): https://github.com/LibreYOLO/libreyolo
- RF-DETR base (Roboflow, GitHub): https://github.com/roboflow/rf-detr
- Backbone DINOv2 (Meta, GitHub): https://github.com/facebookresearch/dinov2
- Notas de publicacion de UI-DETR-1: https://huggingface.co/blog/paulml/ui-detr-1
