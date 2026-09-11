# LibreYOLO/LibreMarigoldV2b-depth-uniform-base

## Resumen

LibreMarigoldV2b-depth-uniform-base es un adaptador de estimación de profundidad monocular publicado por LibreYOLO dentro de su librería `libreyolo`. No es un modelo autónomo: el checkpoint contiene el adaptador de inferencia, el decodificador y los tensores de prompt correspondientes al subconjunto `depth/Uniform-base` de Marigold V2, el modelo de difusión de Huawei (`huawei-bayerlab/marigold-v2-0`). El transformer de difusión que actúa como base es `Qwen/Qwen-Image-Edit-2509`, que se descarga por separado, permanece congelado y no está incluido en este repositorio.

El problema que resuelve es la estimación de profundidad densa a partir de una única imagen, devolviendo un mapa de profundidad con codificación `depth` cuyos valores son relativos afines en ese espacio, no metros. El adaptador se distribuye ya convertido para su consumo desde LibreYOLO mediante las dependencias `libreyolo[marigold]`, y la conversión se realizó sin modificar el adaptador de inferencia, el decodificador ni los tensores de prompt originales.

Su relevancia es de integración más que de investigación: empaqueta una variante concreta de Marigold V2 en un formato consumible con pocas líneas de Python y con paridad numérica verificada frente a la implementación nativa de Huawei (diferencia absoluta máxima de 0.0 en dos comparaciones sobre NVIDIA L40S). El repositorio ocupa 1,7 GB y la licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (diffusion-transformer) aplicado a estimacion de profundidad; adaptador sobre la base congelada Qwen/Qwen-Image-Edit-2509 |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de difusion de imagen, no aplica contexto de texto) |
| Tipos de cuantizacion | BF16 y NF4 (inferencia CUDA probada en ambos; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt); nombre de fichero esperado: `LibreMarigoldV2b-depth-uniform-base.pt` |
| Tamano del repositorio | 1,7 GB |
| Pipeline | depth-estimation |
| Libreria | libreyolo |
| Modelos base | huawei-bayerlab/marigold-v2-0 (revision `6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad`, subcarpeta `depth/Uniform-base`) y Qwen/Qwen-Image-Edit-2509 (revision `d3968ef930e841f4c73640fb8afa3b306a78167e`) |
| Tipo de checkpoint | Adaptador + tensores de prompt; no es un modelo autonomo |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusion para estimacion de profundidad. El adaptador y los tensores de prompt proceden del subconjunto `depth/Uniform-base` de Marigold V2, la implementacion de Huawei, mientras que el backbone generativo congelado es `Qwen/Qwen-Image-Edit-2509`, fijado a una revision concreta y descargado aparte. LibreYOLO no entrena el modelo: solo realiza la conversion de formato, a la que anade metadatos propios y un marcador de variante. El adaptador de inferencia, el decodificador y los tensores de prompt se mantienen sin cambios; unicamente se omiten dos tensores de proyeccion iREPA que solo se usan en entrenamiento.

En cuanto a datos de entrenamiento, numero de tokens, composicion del dataset y uso de RLHF o DPO, no hay informacion disponible en el material proporcionado. La validacion publicada es una comprobacion de paridad de implementacion, no de precision frente a benchmarks: dos comparaciones entre la salida upstream y la nativa, ejecutadas en la misma maquina (NVIDIA L40S, PyTorch 2.10.0+cu128), dieron una diferencia absoluta maxima de 0.0. Esto verifica que la implementacion reproduce el comportamiento del original, pero no garantiza precision de benchmark ni coincidencia bit a bit entre maquinas distintas. La conversion esta implementada en `libreyolo/models/marigold_v2/convert.py`.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una sola imagen.
- Salida en codificacion `depth`, con valores relativos afines en ese espacio (no son metros).
- Gestion de resolucion: por defecto usa el lienzo nativo redondeado hacia arriba a multiplos de 16; `imgsz=512` selecciona un lienzo cuadrado fijo; la salida se devuelve a la resolucion original de la imagen.
- Inferencia en CUDA con BF16 y NF4.
- Visualizacion del resultado mediante `result.plot().save(...)` y acceso al mapa de profundidad como array NumPy con `result.depth_map.numpy().data`.
- API de uso simple basada en la clase `LibreYOLO` con ruta al checkpoint y parametro `device`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta generacion de texto ni capacidades de lenguaje natural; no aplica la consideracion multilingue.
- No se documentan modos especiales del tipo thinking mode, vision general, audio ni video.
- No soporta entrenamiento, exportacion ni MPS segun la propia model card.

## Casos de uso

- Reconstruccion 3D y novel view synthesis: el mapa de profundidad denso por imagen alimenta pipelines de levantamiento de nubes de puntos o de renderizado de vistas nuevas; al devolver la salida a la resolucion original, encaja sin remuestreo adicional en etapas posteriores de calibracion con la imagen de entrada.
- Post-procesado fotografico con desenfoque selectivo: el mapa de profundidad permite construir mascaras de profundidad para simular profundidad de campo o desenfoque de fondo; conviene recordar que los valores son relativos afines, suficientes para ordenar planos y graduar el desenfoque, pero no para fijar distancias absolutas.
- Preprocesado para robotica y navegacion: la estimacion monocular de profundidad relativa sirve como senal de percepcion cuando no hay sensor de profundidad dedicado; la integracion via `libreyolo` y CUDA en BF16 o NF4 facilita desplegarla en el mismo stack que el resto de modelos de la libreria.
- Anotacion automatica y aumento de datos: generar mapas de profundidad para un dataset de imagenes permite crear etiquetas auxiliares o pares imagen-profundidad para entrenar otros modelos, sin coste de anotacion manual.
- Realidad aumentada y oclusion: el mapa de profundidad por fotograma permite decidir que elementos virtuales quedan ocluidos por objetos reales, usando el orden relativo de profundidad que proporciona el modelo.
- Condicionamiento de generacion de imagen: los mapas de profundidad son una senal de control habitual en pipelines de generacion e edicion guiada por estructura, y este adaptador puede producirlos como etapa previa dentro de un flujo que use el mismo backbone Qwen-Image-Edit.
- Inspeccion visual y analisis de escena: extraer relaciones de profundidad entre objetos para tareas de comprension de escena o control de calidad, siempre que el requisito sea orden relativo y no medida metrica.
- Prototipado rapido en investigacion: gracias a la API de una linea (`LibreYOLO(...)` y llamada directa sobre una imagen) y a la paridad verificada con la implementacion upstream, resulta adecuado para reproducir resultados de Marigold V2 sin reimplementar la conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de metricas habituales de profundidad (por ejemplo, AbsRel, RMSE o delta) ni comparaciones con otros modelos.

El unico dato de validacion disponible es una comprobacion de paridad de implementacion:

| Prueba | Entorno | Resultado |
|---|---|---|
| Comparacion upstream/native (dos ejecuciones, mismo worker) | NVIDIA L40S, PyTorch 2.10.0+cu128 | Diferencia absoluta maxima de 0.0 |
| Inferencia CUDA NF4 | NVIDIA L40S, PyTorch 2.10.0+cu128 | Probada |
| Inferencia CUDA BF16 | NVIDIA L40S, PyTorch 2.10.0+cu128 | Probada |

Esta validacion acredita que la implementacion reproduce la salida del modelo original, no la precision del modelo frente a la verdad de referencia.

## Requisitos de hardware

- El checkpoint del adaptador ocupa 1,7 GB, pero no es suficiente para inferir: requiere descargar por separado la base congelada `Qwen/Qwen-Image-Edit-2509`.
- No se publica una cifra oficial de VRAM necesaria para inferencia. Como referencia, la unica GPU documentada en la validacion es una NVIDIA L40S (48 GB) con PyTorch 2.10.0+cu128.
- Se ha probado inferencia en CUDA con BF16 y con NF4; la variante NF4 esta pensada para reducir el consumo de memoria, pero no se documentan cifras concretas de VRAM por cuantizacion.
- Compatibilidad con GPU de consumo (RTX 4090, RTX 3090, etc.): no disponible; no hay confirmacion oficial al respecto.
- Opciones de despliegue documentadas: la integracion de LibreYOLO, disponible en la rama `feat/marigoldv2` del repositorio, con las dependencias `libreyolo[marigold]` y el paquete `libreyolo`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al tratarse de un modelo de difusion de imagen, estos servidores de inferencia de lenguaje no son aplicables.
- Latencia y throughput estimados: no disponible.
- Limitaciones de plataforma: entrenamiento, exportacion y MPS (Apple Silicon) no estan soportados por esta integracion.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento numerico de los modelos relacionados en la informacion proporcionada, por lo que la comparacion se limita a los aspectos documentados (origen, licencia, formato y disponibilidad).

| Modelo | Relacion | Licencia | Formato / distribucion | Datos de rendimiento |
|---|---|---|---|---|
| LibreMarigoldV2b-depth-uniform-base | Este modelo; adaptador convertido para LibreYOLO | Apache-2.0 (pesos); el codigo fuente de LibreYOLO es MIT y no cubre los pesos preentrenados | PyTorch (.pt), consumible via libreyolo | Solo paridad de implementacion (dif. max. 0.0 en L40S) |
| huawei-bayerlab/marigold-v2-0 | Modelo upstream del que procede el adaptador y los prompt tensors (subcarpeta `depth/Uniform-base`) | Apache-2.0 (declarada en el material de origen) | Implementacion nativa en HuggingFace y repositorio de codigo propio | no disponible |
| Qwen/Qwen-Image-Edit-2509 | Base de difusion congelada e imprescindible para la inferencia | Apache-2.0 (segun su model card) | Pesos descargados por separado; no incluidos en este repositorio | no disponible |
| Otros estimadores de profundidad monocular | No disponibles en la informacion proporcionada | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: sin la base `Qwen/Qwen-Image-Edit-2509` descargada por separado y fijada a su revision, el checkpoint no puede ejecutarse.
- Los valores de profundidad son relativos afines en la codificacion `depth`, no metros. No deben usarse para medicion metrica ni para aplicaciones que exijan distancias absolutas.
- La paridad verificada (diferencia absoluta maxima 0.0) se obtuvo en dos comparaciones en la misma maquina; no garantiza coincidencia bit a bit entre maquinas distintas ni equivale a una validacion de inexactitud frente a datos de referencia.
- No hay resultados de benchmarks publicados: no se puede afirmar su precision relativa frente a otros estimadores de profundidad.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion; para un modelo de profundidad, el equivalente al error seria la distorsion de la geometria estimada, que no esta cuantificada.
- Entrenamiento, exportacion y MPS no estan soportados por la integracion.
- La integracion depende de la rama `feat/marigoldv2` del repositorio de LibreYOLO, no de una version estable publicada; conviene fijar el commit al desplegar.
- Licencia: los pesos son Apache-2.0, pero no estan cubiertos por la licencia MIT del codigo fuente de LibreYOLO. El material de origen de Huawei es Apache-2.0. Hay que respetar los avisos de licencia y el fichero NOTICE del repositorio.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Fechas del repositorio: creado y actualizado el 2026-09-10, sin historial posterior de mantenimiento documentado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-depth-uniform-base
- Modelo upstream Marigold V2 (revision fijada, subcarpeta `depth/Uniform-base`): https://huggingface.co/huawei-bayerlab/marigold-v2-0/tree/6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad
- Base congelada Qwen-Image-Edit-2509 (revision fijada): https://huggingface.co/Qwen/Qwen-Image-Edit-2509/tree/d3968ef930e841f4c73640fb8afa3b306a78167e
- Repositorio de la integracion LibreYOLO (rama `feat/marigoldv2`): https://github.com/LibreYOLO/libreyolo/tree/feat/marigoldv2
- Script de conversion del adaptador: https://github.com/LibreYOLO/libreyolo/blob/feat/marigoldv2/libreyolo/models/marigold_v2/convert.py
- Implementacion original de Marigold V2 (revision fijada): https://github.com/huawei-bayerlab/marigold-v2/tree/cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5
