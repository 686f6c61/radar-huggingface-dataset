# fastforks/patchmatchnet

## Resumen

PatchmatchNet es un modelo de reconstruccion 3D multi-vista (multi-view stereo, MVS) basado en aprendizaje profundo, publicado originalmente por Wang et al. en 2021 (CVPR). Dado un conjunto de imagenes de una misma escena, con o sin poses de camara conocidas, estima mapas de profundidad de una vista de referencia combinando las vistas fuente calibradas con un rango de busqueda de profundidad. La arquitectura combina tres etapas coarse-to-fine de PatchMatch aprendido con una red de refinamiento de profundidad a resolucion completa.

Este repositorio concreto, `fastforks/patchmatchnet`, no aloja pesos: es una model card que documenta la integracion del modelo en la libreria `fastforks`, un runtime alternativo que descarga los pesos originales del autor, los verifica mediante SHA-256 y ofrece dos backends de ejecucion (`portable` en PyTorch y `kernels` con nucleos CUDA propios). El checkpoint referenciado es `params_000007.ckpt`, entrenado sobre el dataset DTU (MVS 2014) y evaluado de forma zero-shot en Tanks and Temples y ETH3D.

Su relevancia actual es practica: el backend `kernels` acelera la inferencia entre 6,8x y 7,4x respecto al codigo original y reduce el pico de memoria, lo que permite ejecutar MVS de alta resolucion en una GPU de consumo (RTX 5060 Ti de 16 GB) con resoluciones de hasta 1988x2880. La licencia del codigo es MIT, pero la de los pesos no esta declarada explicitamente por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con PatchMatch aprendido coarse-to-fine sobre features FPN y red de refinamiento de profundidad |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | fp32 (original) y fp16 (portable y kernels) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Codigo MIT; licencia de pesos no declarada por los autores (MIT asumida); uso comercial permitido segun la model card |
| Formato de pesos | `.ckpt` (checkpoint PyTorch original, no alojado en Hugging Face) |

## Arquitectura y entrenamiento

PatchmatchNet implementa un esquema de PatchMatch aprendido con tres etapas coarse-to-fine. Cada etapa realiza inicializacion aleatoria de profundidad, propagacion adaptativa, correlacion group-wise con pesos de vista por pixel y agregacion espacial adaptativa del coste, todo ello sobre caracteristicas extraidas con una FPN. Tras las etapas de PatchMatch, una red de refinamiento opera a resolucion completa para producir el mapa de profundidad final y, cuando corresponde, confianza.

El checkpoint publicado (`params_000007.ckpt`) se entreno sobre el dataset DTU Robot Image Data Sets (MVS 2014). El paper evalua el modelo de forma zero-shot en Tanks and Temples y ETH3D. No se dispone de informacion sobre el numero exacto de tokens, composicion detallada del dataset ni sobre el uso de RLHF o DPO (no aplicables a este tipo de modelo). La innovacion tecnica principal es la sustitucion de la busqueda de PatchMatch clasica por un esquema diferenciable aprendido, junto con la integracion en `fastforks` de kernels CUDA optimizados que aceleran la inferencia significativamente.

## Capacidades

- Estimacion de profundidad multi-vista a partir de varias imagenes de una misma escena.
- Reconstruccion 3D densa mediante fusion de mapas de profundidad.
- Estimacion de poses de camara cuando las vistas no estan calibradas (modo unposed).
- Soporte de entrada calibrada (intrinsecos `K` y matrices camara-a-mundo `c2w`) para MVS clasico.
- Salida de mapas de profundidad (`depth`) y, cuando el modelo los predice, mapas de confianza.
- Salida opcional de camaras y nubes de puntos 3D.
- Entrada de cualquier resolucion H x W >= 5, redimensionada o rellenada internamente.
- Dos backends de ejecucion: `portable` (PyTorch) y `kernels` (CUDA optimizado).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Reconstruccion 3D de escenas a partir de fotografias: el modelo genera mapas de profundidad por vista que pueden fusionarse en una nube de puntos o malla, adecuado para fotogrametria y modelado de entornos.
- Digitalizacion de patrimonio y objetos: con vistas calibradas (intrinsecos y poses), se obtienen reconstrucciones densas de alta resolucion, y el backend `kernels` permite procesar imagenes de hasta 12 MP en 378,6 ms.
- Vision por computador en robotica: la estimacion de profundidad multi-vista alimenta algoritmos de navegacion y evitacion de obstaculos cuando se dispone de varias camaras calibradas.
- Generacion de datos sinteticos y aumento de datasets: la salida de profundidad y nubes de puntos sirve para crear pares imagen-profundidad etiquetados en pipelines de entrenamiento.
- Inspeccion industrial y metrologia visual: la precision de profundidad y la salida de confianza permiten detectar defectos o medir geometrias en piezas fotografiadas desde varios angulos.
- Realidad aumentada y efectos visuales: la reconstruccion de escena y la estimacion de camaras posibilitan la integracion de elementos virtuales con oclusion correcta.
- Prototipado rapido en GPU de consumo: con `pip install fastforks` y una RTX 5060 Ti de 16 GB se puede ejecutar el modelo a 1920x1080 en 56,7 ms con el backend `kernels`.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la model card (RTX 5060 Ti 16 GB, sm_120). Celdas de tamano fijo: tiempo (ms) / pico asignado / pico reservado (MiB).

| Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|
| portable | 43,1 ms / 439 / 522 | 154,4 ms / 1242 / 1534 | 408,6 ms / 2753 / 3346 | OOM |
| kernels | 9,2 ms / 253 / 328 | 24,4 ms / 693 / 942 | 56,7 ms / 1520 / 2016 | 378,6 ms / 8628 / 11332 |

Comparativa de backends en escena multiview sintetica a 1536x1024:

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Aceleracion kernels vs portable | Memoria pico original (MiB) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| patchmatchnet | 248,06 | 219,74 | 201,66 | 29,57 | 7,4x | 6,8x | 1228 / 1272 | 1806 / 2096 | 740 / 856 |

Arranque y primera llamada (1536x1024):

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| patchmatchnet | 0,04 | 0,06 | 0,05 | 0,92 | 0,25 | 0,04 |

Paridad con el codigo original: en CPU y float32 la diferencia maxima absoluta es <= 0,002; en GPU y float16 (por defecto), la diferencia media es <= 0,5 % y el p99 <= 3 % respecto a la mediana del valor de referencia. No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: 253 MiB asignados en 640x480 con backend `kernels`; 1520 MiB en 1920x1080; 8628 MiB en 12 MP (4000x3000). Con backend `portable` el consumo es mayor y falla por OOM en 12 MP.
- GPU recomendadas: NVIDIA con soporte CUDA reciente. El backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU (descargado desde `fastforks/kernels` en el primer uso) y un driver NVIDIA reciente; en caso contrario lanza `BackendUnavailableError` sin fallback silencioso.
- Cabe en GPU de consumo: si, por ejemplo una RTX 5060 Ti de 16 GB ejecuta hasta 1988x2880 en fp16 (7,9 GiB pico asignado, 9,4 GiB reservado).
- Opciones de despliegue: libreria `fastforks` (`pip install fastforks`), con seleccion automatica de backend (`mode="auto"`) o forzada (`portable` o `kernels`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 9,2 ms a 640x480 y 56,7 ms a 1920x1080 con `kernels`; 43,1 ms y 408,6 ms respectivamente con `portable`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PatchmatchNet (este repo) | no disponible | no aplica | 29,57 ms a 1536x1024 con kernels | Codigo MIT; pesos sin licencia declarada | Pesos descargados del repo del autor, verificados por SHA-256 |
| Otros modelos MVS aprendidos (p. ej. MVSNet, CasMVSNet) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- La licencia de los pesos no esta declarada por los autores; se asume MIT a partir del codigo, pero debe verificarse antes de cualquier uso en produccion.
- El checkpoint se entrena sobre DTU, cuyos terminos de uso no estan especificados, lo que introduce incertidumbre legal para uso comercial.
- El modelo puede fallar por OOM en resoluciones altas con el backend `portable` (12 MP no soportado).
- El backend `kernels` depende de kernels precompilados para la arquitectura de GPU; si no existe uno compatible, la ejecucion falla en lugar de degradar automaticamente.
- En modo no calibrado (unposed) la calidad de la reconstruccion y de las poses estimadas puede ser inferior a la del modo calibrado.
- Riesgo de artefactos en profundidad en regiones con poca textura, oclusiones o superficies reflectantes, tipico de los metodos MVS.
- No procesa lenguaje ni soporta tool calling, agentes ni razonamiento multi-paso; su ambito es exclusivamente vision 3D.
- La model card no documenta sesgos demograficos, pero al operar sobre imagenes hereda los sesgos de los datos de entrenamiento (DTU).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema joven, sin validacion amplia de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/patchmatchnet
- Repositorio de la libreria fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend CUDA: https://huggingface.co/fastforks/kernels
- Codigo original de PatchmatchNet: https://github.com/FangjinhuaWang/PatchmatchNet
- Commit fijado del codigo original: https://github.com/FangjinhuaWang/PatchmatchNet/tree/8dc6cb4
- Licencia del codigo original: https://github.com/FangjinhuaWang/PatchmatchNet/blob/8dc6cb4/LICENSE
- Checkpoint de pesos original: https://github.com/FangjinhuaWang/PatchmatchNet/raw/8dc6cb40bdb7053e856598b378425c76a9dcf5e0/checkpoints/params_000007.ckpt
- Metadatos del modelo en fastforks: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/multiview/models/patchmatchnet/card.toml
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
