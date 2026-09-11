# LibreYOLO/LibreMarigoldV2b-albedo

## Resumen

LibreMarigoldV2b-albedo es un adaptador de estimacion de albedo (reflectancia difusa) para Marigold V2, empaquetado por LibreYOLO para su integracion con la libreria `libreyolo`. No es un modelo autonomo: contiene el adaptador de inferencia, el decodificador y los tensores de prompt congelados, y requiere descargar por separado el modelo base Qwen/Qwen-Image-Edit-2509 (revision fijada `d3968ef930e841f4c73640fb8afa3b306a78167e`), sobre el que se aplica. El origen del adaptador es el subfolder `albedo` del repositorio huawei-bayerlab/marigold-v2-0, revision `6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad`, propiedad de Huawei Technologies.

El modelo resuelve una tarea de vision por computador clasica: la descomposicion intrinseca de una imagen en su componente de albedo, es decir, el color del material sin la iluminacion incidente. La salida es un mapa en RGB lineal de coma flotante en el rango [0,1], separado de su previsualizacion en sRGB. Esta capacidad es relevante para relighting, composicion, captura de materiales y generacion de datos sinteticos, porque permite modificar la iluminacion de una escena sin alterar el color de los objetos.

Segun la informacion disponible, el adaptador aplica sobre una arquitectura de difusion transformer (etiquetada como `diffusion-transformer` en los tags del repositorio). El repositorio ocupa 1,9 GB y tiene licencia Apache 2.0. No se han publicado datos de parametros, contexto ni benchmarks de precision en la informacion disponible; la unica validacion reportada es una comprobacion de paridad de implementacion, no de exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (adaptador sobre Qwen/Qwen-Image-Edit-2509) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NF4 en CUDA (probados por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch `.pt` (safetensors no disponible) |
| Tamano del repositorio | 1,9 GB |
| Modelo base requerido | Qwen/Qwen-Image-Edit-2509, revision `d3968ef930e841f4c73640fb8afa3b306a78167e` |
| Origen del adaptador | huawei-bayerlab/marigold-v2-0, subfolder `albedo`, revision `6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad` |
| Libreria | libreyolo (extra `libreyolo[marigold]`) |
| Tarea | Estimacion de albedo (descomposicion intrinseca) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La informacion disponible no detalla el numero de parametros, la composicion del dataset ni el procedimiento de entrenamiento. Lo que si se especifica es que el adaptador se apoya en un backbone de difusion transformer (Qwen/Qwen-Image-Edit-2509) y que Marigold V2 utiliza un adaptador mas un decodificador y unos tensores de prompt congelados para producir el mapa de albedo. El proceso de inferencia es generativo por difusion, no una regresion directa: el modelo sintetiza el mapa de albedo condicionado por la imagen de entrada y el prompt congelado.

LibreYOLO no ha reentrenado el modelo. Segun la model card, sus modificaciones se limitan a anadir metadatos de LibreYOLO y un marcador de variante; el adaptador de inferencia, el decodificador y los tensores de prompt son identicos a los originales. Se han omitido dos tensores de proyeccion iREPA con nombre, usados unicamente en entrenamiento. La conversion esta implementada en `libreyolo/models/marigold_v2/convert.py` sobre la rama `feat/marigoldv2`. No se menciona RLHF, DPO ni ninguna fase de ajuste con preferencias humanas.

## Capacidades

- Estimacion de albedo: genera un mapa de reflectancia difusa en RGB lineal de coma flotante en el rango [0,1] a partir de una imagen de entrada.
- Separacion entre mapa numerico y previsualizacion: la salida numerica es lineal y se distingue explicitamente de su previsualizacion en sRGB, lo que evita errores de interpretacion en pipelines de color.
- Resolucion de trabajo configurable: por defecto usa el lienzo nativo redondeado hacia arriba a multiplos de 16; con `imgsz=512` selecciona un lienzo cuadrado fijo. Las salidas se devuelven a la resolucion original de la imagen.
- API de alto nivel: se invoca mediante `LibreYOLO("LibreMarigoldV2b-albedo.pt", device="cuda")` y expone el resultado como `result.albedo` (array) y `result.plot()` para la visualizacion.
- Inferencia en CUDA: probada con cuantizacion NF4 y con BF16.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible (el modelo opera sobre imagenes, no sobre texto).
- Capacidades especiales: no se documentan modos de pensamiento, vision general ni audio; la unica tarea declarada es la estimacion de albedo.

## Casos de uso

- Relighting en postproduccion de imagen y video: el mapa de albedo separa el color del material de la iluminacion, de modo que un artista puede recolorear o recolocar luces y recomponer la escena sin alterar el aspecto del objeto. Es el caso de uso principal de Marigold V2 y el motivo por el que se distribuye como adaptador de albedo.
- Composicion digital y VFX: al disponer de albedo y de la imagen original, un pipeline puede insertar objetos en escenas con iluminacion distinta ajustando la iluminacion estimada en lugar de repintar el color a mano.
- Captura de materiales y texturizado 3D: el albedo extraido de fotografias de objetos reales se puede proyectar como textura base de un activo 3D, evitando el sesgo de iluminacion de la fotografia original.
- Generacion de datasets de intrinsics: el modelo permite etiquetar automaticamente grandes volumenes de imagenes con su albedo, lo que sirve para entrenar o evaluar otros modelos de descomposicion intrinseca y de vision con iluminacion variable.
- Preprocesado para vision por computador: normalizar el albedo de las imagenes de entrada reduce la variabilidad debida a la iluminacion en tareas posteriores de deteccion, segmentacion o reconocimiento, especialmente en dominios con iluminacion no controlada.
- Edicion fotografica semiautomatica: cambio de temperatura de color o de material de un objeto concreto en flujos de retoque por lotes, aplicando la transformacion sobre el albedo y recomponiendo despues.
- Digitalizacion de patrimonio y documentacion tecnica: el albedo proporciona una referencia de color independiente de la iluminacion de la toma, util para catalogacion y comparacion entre capturas realizadas en condiciones distintas.
- Integracion en produccion mediante libreyolo: al exponerse como modulo de la libreria, el modelo se puede encadenar en procesos por lotes sobre GPU con un unico objeto de inferencia y salida a fichero mediante `result.plot().save(...)`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada por el autor es una comprobacion de paridad de implementacion frente a la implementacion upstream, no una medida de exactitud:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Comparacion upstream vs. nativa (dos ejecuciones, mismo worker) | NVIDIA L40S, PyTorch 2.10.0+cu128 | Diferencia absoluta maxima 0,0 |
| Inferencia CUDA NF4 | CUDA | Probada |
| Inferencia CUDA BF16 | CUDA | Probada |
| Entrenamiento / export / MPS | - | No soportados por esta integracion |

El propio autor advierte que esta validacion verifica la paridad de la implementacion, no la exactitud frente a benchmarks publicados ni la coincidencia bit a bit entre maquinas distintas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador ocupa 1,9 GB, pero el consumo total depende del modelo base Qwen/Qwen-Image-Edit-2509, que se descarga por separado y cuyo peso no se especifica.
- GPU utilizada en la validacion: NVIDIA L40S, con PyTorch 2.10.0+cu128.
- Cuantizacion disponible: BF16 y NF4 en CUDA. La opcion NF4 de 4 bits reduce el consumo de memoria frente a BF16, aunque no se publican cifras concretas.
- Encaje en GPU de consumo: no disponible. No se indica si el conjunto adaptador mas base cabe en tarjetas como RTX 4090 o RTX 3090.
- Plataformas no soportadas: MPS (Apple Silicon) y exportacion a otros formatos. El entrenamiento tampoco esta soportado por esta integracion.
- Opciones de despliegue: la via documentada es la libreria `libreyolo` con `device="cuda"` y el extra `libreyolo[marigold]`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; estos servidores estan orientados a modelos de lenguaje y no aplican a esta tarea.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: 1,9 GB del repositorio del adaptador, mas el espacio del modelo base descargado aparte.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de alternativas en la informacion proporcionada. La comparacion se limita a lo que se puede verificar documentalmente sobre los componentes implicados:

| Modelo | Rol | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|
| LibreMarigoldV2b-albedo | Adaptador de albedo empaquetado para libreyolo | Apache 2.0 | HuggingFace, 0 descargas | Requiere el base Qwen-Image-Edit-2509; anade metadatos LibreYOLO y omite dos tensores iREPA de entrenamiento |
| huawei-bayerlab/marigold-v2-0 | Modelo upstream de Marigold V2 (subfolder `albedo`) | Apache 2.0 | HuggingFace | Misma implementacion de inferencia, decodificador y prompts; origen del adaptador |
| Qwen/Qwen-Image-Edit-2509 | Backbone de difusion transformer congelado | Apache 2.0 | HuggingFace, revision fijada | Descarga separada; sin el, el adaptador no funciona |

Comparativas con otros estimadores de albedo o de intrinsics (por ejemplo, variantes de Marigold v1 u otros modelos de descomposicion intrinseca): no disponible.

## Limitaciones y advertencias

- No es un modelo autonomo. El repositorio contiene unicamente adaptador, decodificador y tensores de prompt; sin descargar Qwen/Qwen-Image-Edit-2509 no hay inferencia posible.
- No se han publicado benchmarks de exactitud. La unica validacion es una prueba de paridad de implementacion con diferencia absoluta maxima 0,0 en una unica GPU (L40S) y con el mismo worker, lo que no garantiza coincidencia bit a bit entre maquinas ni calidad absoluta del resultado.
- Funcionalidad restringida a inferencia. El entrenamiento, la exportacion a otros formatos y la ejecucion en MPS no estan soportados por esta integracion.
- Advertencia de color: la salida numerica es albedo en RGB lineal de coma flotante en [0,1] y es distinta de su previsualizacion en sRGB. Tratar la previsualizacion como si fuera el dato numerico introduce errores de color en cualquier pipeline posterior.
- Resolucion de trabajo: el lienzo por defecto usa la resolucion nativa redondeada hacia arriba a multiplos de 16, y `imgsz=512` fuerza un lienzo cuadrado fijo. Cambiar la estrategia de lienzo puede alterar el resultado.
- Naturaleza generativa: al tratarse de un modelo de difusion, la estimacion de albedo puede producir contenido plausible pero incorrecto en regiones ambiguas (sombras duras, materiales especulares o transparentes, superficies sin textura). No se documenta una medida de este riesgo.
- Idiomas y sesgos: no disponible. La model card no documenta sesgos conocidos ni evaluaciones de equidad.
- Licencia: el adaptador y los pesos originales son Apache 2.0, con copyright de Huawei Technologies Co., Ltd. Los pesos preentrenados no estan cubiertos por la licencia MIT del codigo fuente de LibreYOLO, por lo que no se debe asumir MIT al reutilizar el modelo.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia. No hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Trazabilidad: las revisiones de los repositorios base estan fijadas por hash, de modo que una actualizacion del modelo base o del upstream puede romper la reproducibilidad si no se respetan esos commits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-albedo
- Modelo base Marigold V2: https://huggingface.co/huawei-bayerlab/marigold-v2-0/tree/6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509/tree/d3968ef930e841f4c73640fb8afa3b306a78167e
- Implementacion original de Marigold V2: https://github.com/huawei-bayerlab/marigold-v2/tree/cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5
- Rama de integracion de LibreYOLO: https://github.com/LibreYOLO/libreyolo/tree/feat/marigoldv2
- Script de conversion: https://github.com/LibreYOLO/libreyolo/blob/feat/marigoldv2/libreyolo/models/marigold_v2/convert.py
- Paper, blog o demo oficiales: no disponible
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con este modelo (corresponden a videojuegos de ritmo), por lo que no se anade ningun enlace adicional procedente de esa busqueda.
