# fastforks/flexglue

## Resumen

FlexGlue es un modelo de emparejamiento de características (feature matching) disperso que combina detectores de puntos clave con descriptores densos. Lo desarrollan Philipp Lindenberger, Paul-Edouard Sarlin, Ondrej Miksik y Marc Pollefeys (publicado en 2026), y esta ficha corresponde al repositorio `fastforks/flexglue`, un paquete de terceros que distribuye la model card y descarga los pesos originales de los autores verificandolos con SHA-256. El modelo resuelve el problema clasico de correspondencia entre dos imagenes de una misma escena: dada una pareja de imagenes RGB, devuelve los puntos clave de ambas, los pares de indices emparejados y una puntuacion de confianza.

La arquitectura es un pipeline de tres etapas: ALIKED detecta hasta 2048 puntos clave por imagen con un lado largo de 1024 pixeles; un backbone DINOv3 ConvNeXt-B describe cada imagen a 512 x 512; y nueve capas transformer (self-attention rotatoria y cross-attention) relacionan ambos mapas de caracteristicas, tras lo cual una cabeza de prediccion estima donde aterriza cada punto clave en la otra imagen. Los emparejamientos finales son los vecinos mas cercanos mutuos entre puntos clave y predicciones.

Es relevante ahora porque sustituye el paradigma clasico de "detectar y describir" por el de "detectar y predecir correspondencias desde caracteristicas densas", y porque el repositorio de fastforks anade una implementacion portable en PyTorch con paridad numerica verificada frente al codigo original. El modelo esta marcado como experimental y su uso principal es la reconstruccion 3D (structure from motion) y la estimacion de pose.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline hibrido: ALIKED (detector de puntos clave) + DINOv3 ConvNeXt-B (descriptor denso) + 9 capas transformer con self-attention rotatoria y cross-attention + cabeza de prediccion de correspondencias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto); entrada de cualquier H x W >= 32, rellenada a multiplo de 32 |
| Tipos de cuantizacion | no disponible; el repositorio evalua fp16 y fp32 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Codigo: MIT AND BSD-3-Clause. Pesos: MIT AND LicenseRef-DINOv3-License AND BSD-3-Clause (uso comercial permitido segun la tabla de variantes, con condiciones de la licencia DINOv3) |
| Formato de pesos | `.pth` (PyTorch); el repositorio no aloja pesos, solo la model card y las comprobaciones SHA-256 |

## Arquitectura y entrenamiento

FlexGlue sigue un diseno en cascada. Primero, ALIKED (variante `aliked-n16`) extrae hasta 2048 puntos clave por imagen usando un lado largo de 1024 pixeles, manteniendo la relacion de aspecto. En paralelo, un backbone DINOv3 ConvNeXt-B procesa cada imagen redimensionada a 512 x 512 y produce un mapa de caracteristicas denso. Nueve capas transformer con self-attention rotatoria y cross-attention entre ambos mapas relacionan las caracteristicas de las dos imagenes, y una cabeza final predice, para cada punto clave de la primera imagen, su posicion (x, y en pixeles) en la segunda, junto con una certeza de visibilidad. Los emparejamientos se obtienen como vecinos mas cercanos mutuos entre los puntos clave y las predicciones.

Sobre el entrenamiento, la model card indica que el README original no especifica datos de entrenamiento y que el codigo de entrenamiento no se ha publicado (se remite al paper). Se sabe que el backbone DINOv3 ConvNeXt-B fue preentrenado sobre LVD-1689M (Meta, dataset no liberado) y que ALIKED se entreno sobre MegaDepth. No se documentan etapas de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de vision geometrica. La innovacion tecnica principal es el uso de descriptores densos de un modelo de vision de gran escala (DINOv3) para predecir correspondencias dispersas, en lugar de describir unicamente los puntos clave detectados.

## Capacidades

- Emparejamiento disperso de caracteristicas entre dos imagenes de una misma escena.
- Deteccion de hasta 2048 puntos clave por imagen con ALIKED a un lado largo de 1024 pixeles.
- Prediccion de la posicion (x, y) de cada pixel de la primera imagen en la segunda, con puntuacion de certeza de visibilidad.
- Salida de conjuntos de puntos clave (`keypoints1`, `keypoints2`), pares de indices emparejados (`pairs`) y puntuaciones (`scores`).
- Integracion con structure from motion: los `pairs` son compatibles con bases de datos pycolmap / COLMAP.
- Backend `portable` en PyTorch con paridad numerica verificada frente al codigo original.
- Soporte de entrada de cualquier tamano H x W >= 32 (padded a multiplo de 32); probado hasta 3000 x 4000 en fp16 sobre una RTX 5060 Ti de 16 GB.
- No soporta tool calling, agentes ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Reconstruccion 3D y structure from motion: el modelo devuelve pares de indices directamente compatibles con COLMAP, de modo que puede sustituir a LightGlue en un pipeline SfM para generar correspondencias entre vistas y estimar poses de camara.
- Estimacion de pose relativa entre dos imagenes: con `result.matches()` se obtienen los puntos emparejados que alimentan `estimate_pose`, util para realidad aumentada, robótica o calibracion.
- Registro de imagenes medicas o satelitales: al trabajar con cualquier resolucion hasta 3000 x 4000, puede alinear pares de imagenes de alta resolucion de una misma zona capturadas en momentos distintos.
- Localizacion visual: dado un par consulta-mapa, el emparejamiento disperso con puntuaciones de confianza permite verificar si dos imagenes corresponden al mismo lugar antes de una etapa de pose.
- Fotogrametria y reconstruccion de patrimonio: generacion de nubes de puntos dispersas a partir de conjuntos de fotos, usando los pares compatibles con pycolmap para inicializar el grafo de correspondencias.
- Investigacion en matching: al ser un paquete experimental con backend portable y verificacion de paridad, sirve como referencia reproducible para comparar frente a LightGlue u otros emparejadores dispersos.
- Procesamiento por lotes en GPU de consumo: con 129 ms por par a 768 x 1024 y 1775 MiB de memoria pico en fp16, cabe en una RTX 5060 Ti de 16 GB para experimentacion a pequena escala.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de precision sobre datasets estandar (MegaDepth, ScanNet, etc.). Los unicos datos numericos disponibles son de velocidad, memoria y paridad:

| Metrica | Valor |
|---|---|
| Tiempo de matching, sintetico 768x1024, portable fp16 | 129 ms |
| Memoria pico asignada / reservada, 768x1024 | 1775 / 1886 MiB |
| Tiempo de carga del modelo (portable) | 0,92 s |
| Primera llamada (portable) | 1,20 s |
| Entrada maxima probada (fp16, RTX 5060 Ti 16 GB) | 3000 x 4000 (2,0 GiB pico asignado, 2,5 GiB reservado) |
| Paridad CPU float32 vs original | max abs diff <= 0,0001 |
| Paridad GPU float16 (portable y kernels) | media abs diff <= 0,0052; p99 <= 0,012 |

`torch.compile` y la exportacion a TensorRT/ONNX estan diferidos (build > 5 min) o fallan directamente, porque el numero de puntos clave y emparejamientos depende de los datos y provoca graph breaks.

## Requisitos de hardware

- VRAM estimada: unos 1,8 GiB asignados (1,9 GiB reservados) para un par a 768 x 1024 en fp16; unos 2,0 GiB asignados (2,5 GiB reservados) para 3000 x 4000.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM para resoluciones moderadas; una RTX 5060 Ti de 16 GB se ha validado hasta 3000 x 4000.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y RTX 5060 Ti, con margen amplio en fp16.
- Opciones de despliegue: el paquete `fastforks` con backend `portable` (PyTorch); los kernels para el backend `kernels` se distribuyen en `fastforks/kernels`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: 129 ms por par a 768 x 1024 en una RTX 5060 Ti 16 GB; el procesamiento es par a par internamente, por lo que los lotes se ejecutan secuencialmente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FlexGlue (`aliked-flexglue@1`) | Disperso sobre descriptores densos (DINOv3) | no disponible | Cualquier H x W >= 32, hasta 3000 x 4000 probado | Puntos clave, pares, scores | MIT AND DINOv3 License AND BSD-3-Clause | Pesos en releases de GitHub del autor; card en HF |
| LightGlue | Disperso clasico (SuperPoint/ALIKED + atencion) | no disponible | Resolucion de los detectores | Puntos clave, pares, scores | no disponible en la informacion | Ampliamente disponible |
| RoMa v2 | Denso con refinador | no disponible | Resolucion fija | Warp denso y correspondencias muestreadas | no disponible en la informacion | no disponible en la informacion |

La model card indica que FlexGlue no incluye el refinador de RoMa v2, ni matches densos o muestreados, ni puntuacion de covisibilidad; su modo es unicamente disperso. No se dispone de datos de precision comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Salida estrictamente dispersa: no genera warp denso; para correspondencias densas hay que recurrir a otros modelos.
- Procesa una pareja de imagenes por llamada de forma interna; los lotes se ejecutan par a par y el numero de puntos clave varia por imagen.
- No es exportable como modulo: `torch.compile` produce graph breaks y la exportacion a ONNX/TensorRT falla por el numero variable de puntos clave y emparejamientos.
- Solo implementa el modo disperso del codigo original: sin refinador RoMa v2, sin matches densos o muestreados y sin puntuacion de covisibilidad.
- Realiza dos redimensionados por imagen: ALIKED ve un lado largo de `long_side` y el descriptor ve un cuadrado `size` x `size`, lo que puede afectar a la precision en escenas con relaciones de aspecto extremas.
- Licencia de pesos con condiciones: el checkpoint incluye los pesos del backbone DINOv3 ConvNeXt-B (`extractor.backbone.*`), cubiertos por la DINOv3 License de Meta, que exige atribucion y condiciones adicionales; hay que leerla antes de un uso comercial.
- El repositorio es un paquete de terceros (fastforks), marcado como experimental y de tier experimental; no aloja pesos y depende de la disponibilidad de los enlaces del autor.
- No se documentan datos de entrenamiento de FlexGlue ni se libera el codigo de entrenamiento, lo que limita la reproducibilidad.
- No se han publicado resultados de benchmarks de precision en la informacion disponible, por lo que no se puede evaluar su calidad frente a alternativas sin pruebas propias.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/flexglue
- Codigo del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original de FlexGlue: https://github.com/cvg/FlexGlue (commit `99920296d082`)
- Licencia del codigo original: https://github.com/cvg/FlexGlue/blob/99920296d082c9405ebfd612d674efe288e74881/README.md#license
- Pesos `flexglue.pth`: https://github.com/cvg/FlexGlue/releases/download/v0.1/flexglue.pth
- Pesos `aliked-n16.pth`: https://raw.githubusercontent.com/Shiaoming/ALIKED/683d7c65197395c0b3f01ebe76e1084a27e73a65/models/aliked-n16.pth
- Licencia de ALIKED: https://github.com/Shiaoming/ALIKED/blob/683d7c65197395c0b3f01ebe76e1084a27e73a65/LICENSE
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definiciones de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/matching/models/flexglue/card.toml
