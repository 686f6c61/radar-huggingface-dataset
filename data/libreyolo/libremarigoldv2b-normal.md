# LibreYOLO/LibreMarigoldV2b-normal

## Resumen

LibreMarigoldV2b-normal es un adaptador de estimación de normales de superficie (surface normal estimation) empaquetado para la librería LibreYOLO. No es un modelo autónomo: contiene el adaptador de inferencia y los tensores de prompt fijos del subconjunto `normals` de huawei-bayerlab/marigold-v2-0, convertidos al formato `.pt` que consume LibreYOLO, más metadatos y un marcador de variante. La estimación de normales se apoya en un transformer de difusión congelado, Qwen/Qwen-Image-Edit-2509, que debe descargarse por separado.

El problema que resuelve es la predicción densa de normales de superficie a partir de una única imagen RGB, una tarea clásica de visión por computador con aplicaciones en reconstrucción 3D, relighting, robótica y generación de activos digitales. La relevancia de este repositorio es de ingeniería más que de investigación: traslada Marigold V2 al ecosistema LibreYOLO manteniendo intactos el adaptador, el decodificador y los tensores de prompt, de modo que los usuarios de esa librería puedan ejecutar la tarea sin reimplementar el pipeline original.

El repositorio ocupa 1,9 GB y se publicó el 10 de septiembre de 2026 bajo licencia Apache-2.0. El autor declara paridad de implementación verificada frente a la implementación nativa (diferencia absoluta máxima 0,0 en NVIDIA L40S con PyTorch 2.10.0+cu128), pero no publica cifras de exactitud sobre benchmarks. No se dispone de datos sobre número de parámetros, arquitectura interna detallada ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (adaptador Marigold V2 sobre el modelo base Qwen/Qwen-Image-Edit-2509) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de visión; no es un LLM y no procesa ventanas de texto) |
| Tipos de cuantizacion | NF4 y BF16 (probados en CUDA según la model card); no disponible información sobre otros formatos |
| Idiomas soportados | no disponible (no aplica: la entrada es imagen, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint `.pt` (adaptador y tensores de prompt); el modelo base Qwen se descarga por separado y su formato no se especifica en la información disponible |
| Tarea | Estimación monocular de normales de superficie |
| Modelos base | huawei-bayerlab/marigold-v2-0 (revisión 6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad, subcarpeta `normals`); Qwen/Qwen-Image-Edit-2509 (revisión d3968ef930e841f4c73640fb8afa3b306a78167e) |
| Libreria | libreyolo (extras `libreyolo[marigold]`) |
| Tamano del repositorio | 1,9 GB |
| Entrada | Imagen RGB |
| Salida | Mapa de normales con vectores unitarios en el sistema de cámara OpenCV (x derecha, y abajo, z hacia la escena), con orientación hacia la cámara |
| Resolucion de salida | Lienzo nativo redondeado a múltiplos de 16; `imgsz=512` fija un lienzo cuadrado; la salida se devuelve a la resolución original |
| Fecha de publicacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo se apoya en un transformer de difusión. Marigold V2 aborda la estimación de normales como un problema generativo: el adaptador y los tensores de prompt se acoplan al modelo base de edición de imágenes Qwen/Qwen-Image-Edit-2509, que permanece congelado, y el decodificador produce el mapa de normales. El repositorio no documenta el número de parámetros, la profundidad de la red, el mecanismo de atención ni el esquema de difusión empleado.

En cuanto al entrenamiento, la información disponible no incluye el número de tokens o imágenes, la composición del dataset, ni si hubo etapas de ajuste por refuerzo o preferencias. La model card sí describe las modificaciones introducidas por LibreYOLO: se añaden metadatos y un marcador de variante, se omiten dos tensores de proyección iREPA usados únicamente durante el entrenamiento y se conservan sin cambios el adaptador de inferencia, el decodificador y los tensores de prompt. La conversión está implementada en `libreyolo/models/marigold_v2/convert.py`. La validación declarada consiste en dos comparaciones de salida entre la implementación upstream y la nativa, ejecutadas en el mismo worker, con diferencia absoluta máxima de 0,0; esto acredita paridad de implementación, no exactitud frente a benchmarks publicados ni coincidencia bit a bit entre máquinas distintas.

## Capacidades

- Estimación densa de normales de superficie a partir de una sola imagen RGB.
- Salida en formato de vectores unitarios expresados en el sistema de cámara OpenCV (x derecha, y abajo, z hacia la escena) y con orientación hacia la cámara.
- Gestión automática de resolución: lienzo nativo redondeado a múltiplos de 16, opción de lienzo cuadrado fijo con `imgsz=512` y reescalado de la salida a la resolución original.
- Visualización integrada mediante `result.plot().save(...)`.
- Inferencia en CUDA con cuantización NF4 y BF16, según las pruebas declaradas.
- Integración con la API de LibreYOLO: carga del checkpoint `.pt`, ejecución sobre una imagen y acceso al mapa de normales como array NumPy (`result.normal_map.numpy().data`).
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni comprensión lingüística: es un modelo puramente geométrico-visual.
- No se documentan capacidades multimodales más allá de la imagen de entrada (sin audio, vídeo ni diálogo).

## Casos de uso

- Reconstrucción 3D a partir de imágenes: las normales predichas pueden alimentar algoritmos de integración de normales o de fusión con mapas de profundidad para obtener mallas de superficie. La salida a resolución original facilita su uso directo en pipelines fotogramétricos.
- Relighting y aumento de realidad: el mapa de normales permite estimar la orientación local de la superficie y aplicar modelos de iluminación para insertar objetos virtuales con sombreado coherente en una escena real.
- Robótica de manipulación: la orientación de las superficies es una señal útil para estimar puntos de agarre y planificar la aproximación de una pinza o ventosa sobre objetos rígidos.
- Inspección industrial: la comparación de mapas de normales entre una pieza de referencia y una pieza fabricada ayuda a detectar deformaciones, abolladuras o desalineaciones que no son evidentes solo con la imagen de color.
- Generación de activos para creación digital: producción de mapas de normales para texturizado y modelado en herramientas 3D, a partir de fotografías o renders de referencia.
- Preprocesado de datos para visión 3D: generación de etiquetas geométricas densas sobre conjuntos de imágenes para alimentar etapas posteriores de reconstrucción, segmentación guiada por geometría o aumento de datos.
- Validación de portabilidad entre implementaciones: al declarar paridad exacta con la implementación nativa en el mismo worker, el checkpoint sirve para comprobar que una integración propia reproduce las salidas del pipeline upstream.
- Investigación en estimación de normales: punto de partida reproducible para comparar variantes de prompts, resoluciones de lienzo o esquemas de cuantización (NF4 frente a BF16) sobre el mismo adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta dos comparaciones de salida entre la implementación upstream y la nativa, ejecutadas en el mismo worker sobre NVIDIA L40S con PyTorch 2.10.0+cu128, con una diferencia absoluta máxima de 0,0. El autor indica explícitamente que esta prueba verifica paridad de implementación y no exactitud frente a benchmarks publicados ni acuerdo bit a bit entre máquinas diferentes. No hay datos de MMLU, HumanEval, GSM8K ni de métricas propias de estimación de normales, y estos benchmarks de lenguaje no son aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador pesa 1,9 GB, pero el consumo dominante corresponde al modelo base Qwen/Qwen-Image-Edit-2509, que se descarga aparte y cuyo tamaño no se especifica.
- GPU utilizada en la validación: NVIDIA L40S.
- Cuantizaciones probadas: NF4 y BF16 sobre CUDA. El uso de NF4 indica que la integración contempla reducir el consumo de memoria respecto a BF16, aunque no se publican cifras de VRAM para ninguno de los dos casos.
- Compatibilidad con GPU de consumo: no disponible. No se documenta el comportamiento en tarjetas tipo RTX 4090 ni en GPU de gama media o baja.
- Soporte de MPS (Apple Silicon): no soportado por esta integración, según la model card.
- Soporte de CPU: no documentado.
- Opciones de despliegue: la vía documentada es la API de Python de LibreYOLO con las dependencias `libreyolo[marigold]` y la rama `feat/marigoldv2` de la integración. No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otras herramientas; la exportación a otros formatos no está soportada por esta integración.
- Latencia y throughput: no disponibles.
- Entrenamiento y exportación: no soportados por esta integración.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMarigoldV2b-normal | Adaptador de normales empaquetado para LibreYOLO | Qwen/Qwen-Image-Edit-2509 (congelado) | Estimación de normales; resolución de lienzo configurable, sin ventana de contexto textual | Apache-2.0 | HuggingFace, 0 descargas, requiere descargar el base por separado |
| huawei-bayerlab/marigold-v2-0 | Implementación upstream de Marigold V2 | Qwen/Qwen-Image-Edit-2509 | Estimación de normales (subcarpeta `normals`) y otras tareas del pipeline V2 | Apache-2.0 | HuggingFace, con implementación fuente en GitHub |
| Qwen/Qwen-Image-Edit-2509 | Modelo base de edición de imágenes | No aplica | Edición de imagen guiada por instrucciones, no específicamente normales | Apache-2.0 según su model card | HuggingFace, revisión fijada a d3968ef930e841f4c73640fb8afa3b306a78167e |

No se dispone, en la información proporcionada, de datos comparativos de otros estimadores de normales (parámetros, métricas de error angular, contexto o rendimiento) que permitan una comparación cuantitativa. Los campos no documentados de los modelos de la tabla figuran como no disponibles.

## Limitaciones y advertencias

- No es un modelo autónomo: el checkpoint contiene solo el adaptador y los tensores de prompt; el modelo base Qwen/Qwen-Image-Edit-2509 debe descargarse por separado y su ausencia impide la inferencia.
- No se han publicado métricas de exactitud ni benchmarks de estimación de normales; la única validación documentada es de paridad de implementación, no de calidad predictiva.
- La paridad verificada es frente a la implementación upstream en el mismo worker; no hay garantía de coincidencia bit a bit entre máquinas o configuraciones distintas.
- Entrenamiento, exportación y ejecución en MPS no están soportados por esta integración, lo que limita el ajuste fino y el despliegue fuera del ecosistema CUDA/LibreYOLO.
- Dependencia de la rama `feat/marigoldv2` del repositorio de LibreYOLO y de las dependencias `libreyolo[marigold]`; la API puede cambiar mientras la integración no se estabilice.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Convención de salida estricta: las normales son vectores unitarios en el sistema de cámara OpenCV (x derecha, y abajo, z hacia la escena) con orientación hacia la cámara. Cualquier consumidor que espere otra convención (por ejemplo, ejes Y hacia arriba) debe transformar los datos.
- El autor advierte de que los pesos preentrenados no están cubiertos por la licencia MIT del código fuente de LibreYOLO; se rigen por Apache-2.0, con copyright de Huawei Technologies Co., Ltd. para el adaptador y los tensores de prompt.
- El rendimiento en imágenes fuera de dominio (superficies especulares, transparentes, texturas repetitivas o iluminación extrema) no está documentado en la información disponible.
- No se documentan sesgos, evaluación de seguridad, idiomas ni consideraciones éticas, ya que el modelo no procesa texto ni genera contenido lingüístico.
- Para uso en producción deben tenerse en cuenta los términos de la licencia Apache-2.0, que incluye obligaciones de conservar avisos de copyright y licencia, así como los avisos del archivo NOTICE.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-normal
- Modelo base upstream (Marigold V2): https://huggingface.co/huawei-bayerlab/marigold-v2-0
- Subcarpeta `normals` del modelo upstream (revisión 6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad): https://huggingface.co/huawei-bayerlab/marigold-v2-0/tree/6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad
- Implementación fuente de Marigold V2 (revisión cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5): https://github.com/huawei-bayerlab/marigold-v2/tree/cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5
- Modelo base de edición de imágenes Qwen (revisión d3968ef930e841f4c73640fb8afa3b306a78167e): https://huggingface.co/Qwen/Qwen-Image-Edit-2509/tree/d3968ef930e841f4c73640fb8afa3b306a78167e
- Rama de integración en LibreYOLO: https://github.com/LibreYOLO/libreyolo/tree/feat/marigoldv2
- Script de conversión: https://github.com/LibreYOLO/libreyolo/blob/feat/marigoldv2/libreyolo/models/marigold_v2/convert.py
- Licencia del repositorio: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-normal/blob/main/LICENSE
- Avisos legales del repositorio: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-normal/blob/main/NOTICE
