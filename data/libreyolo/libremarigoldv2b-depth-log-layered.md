# LibreYOLO/LibreMarigoldV2b-depth-log-layered

## Resumen

LibreMarigoldV2b-depth-log-layered es un checkpoint de adaptador para estimacion de profundidad monocular publicado por LibreYOLO dentro de su ecosistema `libreyolo`. No es un modelo autonomo: contiene exclusivamente un adaptador de inferencia, un decodificador y tensores de prompt fijos extraidos del subfolder `depth/Log-layered` de `huawei-bayerlab/marigold-v2-0`, y necesita descargar por separado el modelo base congelado `Qwen/Qwen-Image-Edit-2509` (revision `d3968ef930e841f4c73640fb8afa3b306a78167e`) para poder ejecutarse. La variante `Log-layered` codifica la profundidad en espacio logaritmico y de forma afino-relativa, no en metros.

El modelo resuelve la tarea de `depth-estimation` dentro de la familia Marigold V2, que emplea un transformer de difusion como cabecera sobre un backbone de edicion de imagen. La relevancia practica del checkpoint es de integracion: empaqueta el adaptador en formato consumible por `libreyolo` (fichero `.pt`) y anade metadatos y un marcador de variante, manteniendo sin cambios el adaptador de inferencia, el decodificador y los tensores de prompt respecto al original. Se omiten dos tensores de proyeccion iREPA usados solo en entrenamiento.

El repositorio ocupa 1,9 GB y se publica bajo licencia Apache 2.0, con la salvedad de que los pesos preentrenados no quedan cubiertos por la licencia MIT del codigo fuente de LibreYOLO. El autor reporta unicamente validacion de paridad de implementacion (diferencia absoluta maxima de 0,0 frente a la implementacion nativa, en NVIDIA L40S con PyTorch 2.10.0+cu128), no resultados de precision sobre benchmarks publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (diffusion-transformer) para estimacion de profundidad, sobre base de edicion de imagen Qwen-Image-Edit |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de difusion no autoregresivo); no disponible |
| Tipos de cuantizacion | NF4 y BF16 probados en CUDA; no se documentan otras |
| Idiomas soportados | no disponible (modelo de vision; no se documentan idiomas) |
| Licencia | Apache 2.0 (pesos preentrenados excluidos de la licencia MIT del codigo de LibreYOLO) |
| Formato de pesos | PyTorch (`.pt`); no se indica safetensors ni GGUF |
| Pipeline | depth-estimation |
| Libreria | libreyolo |
| Modelos base | huawei-bayerlab/marigold-v2-0 (revision 6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad, subfolder `depth/Log-layered`), Qwen/Qwen-Image-Edit-2509 (revision d3968ef930e841f4c73640fb8afa3b306a78167e, descarga separada) |
| Codificacion de profundidad | `log_depth`, afino-relativa en ese espacio (no metros) |
| Tamano del repositorio | 1,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Marigold V2, un esquema de estimacion de profundidad basado en un transformer de difusion que reutiliza el backbone de un modelo de edicion de imagen, en este caso `Qwen/Qwen-Image-Edit-2509`. El checkpoint publicado por LibreYOLO no contiene pesos de ese backbone: solo aporta el adaptador de inferencia, el decodificador y tensores de prompt fijos de la variante `Log-layered`. La seleccion de variante determina la codificacion de salida, que en este caso es `log_depth` afino-relativa. Este checkpoint concreto no incorpora los dos tensores de proyeccion iREPA nombrados que solo se emplean durante el entrenamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF o DPO; esos datos corresponden al modelo fuente `huawei-bayerlab/marigold-v2-0` y no se detallan en la informacion proporcionada. La conversion se implementa en `libreyolo/models/marigold_v2/convert.py` y, segun el autor, no modifica el adaptador de inferencia, el decodificador ni los tensores de prompt. La validacion reportada consiste en dos comparaciones de salida entre la implementacion upstream y la nativa, realizadas en el mismo worker sobre NVIDIA L40S con PyTorch 2.10.0+cu128, con diferencia absoluta maxima de 0,0; el propio autor matiza que esto verifica paridad de implementacion, no precision frente a benchmarks publicados ni coincidencia bit a bit entre maquinas distintas. La integracion no soporta entrenamiento, exportacion ni MPS.

## Capacidades

- Estimacion de profundidad monocular a partir de una imagen de entrada (`model("photo.jpg")`).
- Salida de mapa de profundidad en codificacion `log_depth` afino-relativa; los valores no estan expresados en metros.
- Prediccion sobre el lienzo nativo de la imagen, redondeado hacia arriba a multiplos de 16, con retorno de la salida a la resolucion original.
- Seleccion de lienzo cuadrado fijo mediante `imgsz=512`.
- Inferencia en CUDA con cuantizacion NF4 o BF16, segun la validacion del autor.
- Utilidades de visualizacion integradas en `libreyolo` (`result.plot().save("prediction.png")`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo ni matematicas, por tratarse de un modelo de vision.
- No se documentan capacidades multilingues.

## Casos de uso

- Generacion de mapas de profundidad para reconstruccion 3D: el modelo produce un mapa denso por pixel que puede alimentar pipelines de `depth-to-point-cloud` en fotogrametria o escaneo de interiores.
- Preprocesado para realidad aumentada: insertar objetos virtuales con oclusion correcta requiere una estimacion de profundidad por pixel; la salida afino-relativa es suficiente cuando solo se necesita el orden relativo de las superficies.
- Efectos de reiluminacion y `depth of field` sintetico en postproduccion fotografica, usando el mapa de profundidad como mascara de desenfoque por planos.
- Segmentacion por planos y `layering`: la propia denominacion `Log-layered` apunta a separar capas de profundidad, util para descomponer una escena en primer plano, plano medio y fondo.
- Robotica y navegacion asistida: generar mapas de profundidad de baja latencia desde una camara monocular para evadir obstaculos cuando no se dispone de LiDAR.
- Generacion de datos sinteticos de entrenamiento: producir pares imagen-profundidad para preentrenar otros estimadores o para aumentar datasets de vision por computador.
- Control de calidad de captura: detectar imagenes con desenfoque, oclusion o geometria ambigua mediante la inspeccion del mapa de profundidad generado.
- Integracion en pipelines existentes de `libreyolo`, dado que la API del paquete (`LibreYOLO(...)`) permite invocar el modelo de la misma forma que otros modelos de la libreria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es una comparacion de paridad de implementacion: dos ejecuciones upstream/nativo sobre NVIDIA L40S con PyTorch 2.10.0+cu128, con diferencia absoluta maxima de 0,0. No se proporcionan valores de AbsRel, RMSE, delta1 ni comparaciones con otros estimadores de profundidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de este adaptador ocupa 1,9 GB, pero la VRAM real depende del modelo base `Qwen/Qwen-Image-Edit-2509`, que se descarga aparte y no esta incluido en este checkpoint.
- GPU validadas por el autor: NVIDIA L40S, con inferencia en CUDA NF4 y BF16.
- No se documenta compatibilidad con GPU de consumo. Dado que la base es un modelo de difusion de edicion de imagen de gran tamano, la viabilidad en GPU de consumo no puede confirmarse con la informacion disponible.
- No se documenta soporte de MPS (Apple Silicon) ni de CPU en esta integracion.
- Opciones de despliegue: la via documentada es el paquete `libreyolo` con el extra `libreyolo[marigold]`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, tecnologias orientadas a modelos de lenguaje y no aplicables a este caso.
- Latencia y throughput: no disponibles.
- Restricciones de integracion: entrenamiento, exportacion y MPS no estan soportados por esta integracion.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan una comparativa cuantitativa. La tabla recoge las diferencias de naturaleza y disponibilidad entre este checkpoint y sus referencias directas.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMarigoldV2b-depth-log-layered | Adaptador de profundidad sobre Qwen-Image-Edit-2509 | no disponible | no aplicable | Apache 2.0 | HuggingFace; requiere base aparte; no es autonomo |
| huawei-bayerlab/marigold-v2-0 | Modelo fuente de Marigold V2 | no disponible | no aplicable | Apache 2.0 | HuggingFace; incluye el subfolder `depth/Log-layered` de origen |
| Qwen/Qwen-Image-Edit-2509 | Modelo base de edicion de imagen congelado | no disponible | no aplicable | Apache 2.0 (segun su model card) | HuggingFace; descarga separada obligatoria |

## Limitaciones y advertencias

- Este checkpoint no es un modelo autonomo: sin el modelo base `Qwen/Qwen-Image-Edit-2509` (revision `d3968ef930e841f4c73640fb8afa3b306a78167e`) no puede ejecutarse.
- Los valores de profundidad estan en codificacion `log_depth` afino-relativa y no en metros; no deben interpretarse como distancias metricas sin una calibracion externa.
- La validacion reportada cubre unicamente paridad de implementacion en una maquina concreta (NVIDIA L40S, PyTorch 2.10.0+cu128); no demuestra precision absoluta ni coincidencia bit a bit entre maquinas distintas.
- No hay resultados publicados de benchmarks de precision, por lo que no es posible estimar su calidad frente a alternativas.
- Entrenamiento, exportacion y MPS no estan soportados por esta integracion, lo que limita el ajuste fino y el despliegue en plataformas Apple.
- La integracion depende de una rama de desarrollo (`feat/marigoldv2`) del repositorio de LibreYOLO, no de una version estable publicada, lo que implica riesgo de cambios de API.
- Licencia: los pesos preentrenados quedan bajo Apache 2.0 y no estan cubiertos por la licencia MIT del codigo fuente de LibreYOLO; conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- Los metadatos del repositorio indican 0 descargas y 0 likes, y la fecha de creacion es reciente, por lo que no existe validacion independiente por parte de la comunidad.
- No se documentan sesgos especificos, pero al ser un modelo de vision entrenado sobre datos no descritos en la informacion disponible, el comportamiento en dominios alejados del dataset original (imagenes medicas, aereas, nocturnas) es incierto.
- Riesgo de alucinacion geometrica: como todo estimador monocular basado en difusion, puede generar superficies plausibles pero incorrectas en regiones ambiguas, reflectantes o transparentes.

## Enlaces

- Pagina de HuggingFace: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-depth-log-layered
- Modelo fuente Marigold V2: https://huggingface.co/huawei-bayerlab/marigold-v2-0/tree/6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509/tree/d3968ef930e841f4c73640fb8afa3b306a78167e
- Implementacion fuente Marigold V2: https://github.com/huawei-bayerlab/marigold-v2/tree/cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5
- Rama de integracion de LibreYOLO: https://github.com/LibreYOLO/libreyolo/tree/feat/marigoldv2
- Script de conversion: https://github.com/LibreYOLO/libreyolo/blob/feat/marigoldv2/libreyolo/models/marigold_v2/convert.py
- Paquete PyPI de libreyolo: https://pypi.org/project/libreyolo/
