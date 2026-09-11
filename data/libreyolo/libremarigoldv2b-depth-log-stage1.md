# LibreYOLO/LibreMarigoldV2b-depth-log-stage1

## Resumen

LibreMarigoldV2b-depth-log-stage1 es un adaptador de estimacion de profundidad publicado por LibreYOLO para su framework de inferencia. No es un modelo independiente: se trata de un checkpoint de adaptador junto con tensores de prompt fijos, derivados del subfolder `depth/Log-stage1` del modelo huawei-bayerlab/marigold-v2-0 (revision `6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad`). La arquitectura subyacente es un diffusion transformer de Marigold V2, que utiliza Qwen/Qwen-Image-Edit-2509 congelado como base, fijado a la revision `d3968ef930e841f4c73640fb8afa3b306a78167e`.

El adaptador cubre la etapa `log` (`log-stage1`), cuyo objetivo es producir mapas de profundidad codificados en espacio logaritmico. Los valores de salida usan codificacion `log_depth` y son afin-relativos en ese espacio, no metros absolutos, un detalle critico para cualquier integracion en produccion. El pipeline declarado en HuggingFace es `depth-estimation`.

Su relevancia actual es fundamentalmente de integracion: permite ejecutar la etapa `log-stage1` de Marigold V2 dentro de LibreYOLO sin reimplementar el decodificador ni los tensores de prompt, y con verificacion de paridad numerica frente a la implementacion nativa. El repo ocupa 1,7 GB y la libreria asociada es `libreyolo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | diffusion transformer (Marigold V2), adaptador sobre base congelada Qwen/Qwen-Image-Edit-2509 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | se ha probado inferencia CUDA en NF4 y BF16; no se documentan otros formatos |
| Idiomas soportados | no disponible (no aplica a la tarea) |
| Licencia | apache-2.0 (codigo fuente de LibreYOLO bajo MIT; los pesos preentrenados no estan cubiertos por esa licencia MIT) |
| Formato de pesos | checkpoint `.pt` de PyTorch (adaptador + tensores de prompt); el base se descarga por separado |

## Arquitectura y entrenamiento

La ficha del autor describe el artefacto como "Marigold V2 `log-stage1` adapter and fixed prompt tensors for LibreYOLO". El adaptador, el decodificador y los tensores de prompt se mantienen sin cambios respecto al original; las modificaciones introducidas por LibreYOLO se limitan a metadatos y a un marcador de variante. Se omiten dos tensores de proyeccion iREPA que solo se usan en entrenamiento. La conversion esta implementada en `libreyolo/models/marigold_v2/convert.py` dentro de la rama `feat/marigoldv2` del repositorio.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineacion. Tampoco se detalla el proceso de entrenamiento del adaptador original. La unica verificacion tecnica documentada es de paridad de implementacion: dos comparaciones upstream/nativo ejecutadas en el mismo worker dieron una diferencia absoluta maxima de 0.0 sobre NVIDIA L40S con PyTorch 2.10.0+cu128. El propio autor aclara que esto valida la paridad de la implementacion, no la precision en benchmarks publicados ni la coincidencia bit a bit entre maquinas distintas.

## Capacidades

- Estimacion de profundidad monocular a partir de una imagen de entrada, con pipeline `depth-estimation`.
- Salida codificada en `log_depth`, con valores afin-relativos en ese espacio (no son metros).
- Resolucion de prediccion sobre lienzo nativo, redondeado hacia arriba a multiplos de 16; con `imgsz=512` se selecciona un lienzo cuadrado fijo.
- Devolucion de la salida a la resolucion original de la imagen.
- Visualizacion del mapa de profundidad mediante `result.plot().save(...)`.
- Inferencia en CUDA probada en NF4 y BF16.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni vision multimodal mas alla de la tarea de profundidad.
- No se documenta soporte multi-idioma ni capacidades de audio.

## Casos de uso

- Reconstruccion 3D y fotogrametria: el mapa de profundidad afin-relativo en espacio log permite generar nubes de puntos densas a partir de imagenes individuales, utiles como entrada para pipelines de reconstruccion cuando se combinan con la escala conocida de la escena.
- Efectos de desenfoque de fondo en postproduccion: al disponer de profundidad por pixel, se puede aplicar profundidad de campo sintetica separando sujeto y fondo sin segmentacion manual.
- Robotica y navegacion asistida: percepcion de distancias relativas en interiores o exteriores para planificacion de movimiento, teniendo en cuenta que los valores no son metros y requieren calibracion externa.
- Generacion de mapas de altura para simulacion: conversion de la profundidad a mapas de elevacion en herramientas de render o motores de juego.
- Control de calidad en vision industrial: deteccion de objetos fuera de plano o de apilamientos irregulares a partir de la variacion relativa de profundidad.
- Preprocesado para modelos de difusion con control de profundidad: el mapa generado puede alimentar modelos de generacion condicionada por profundidad, ya que el rango logaritmico normalizado es el formato habitual esperado por este tipo de condicionamientos.
- Analisis de escenas en datasets grandes: procesado por lotes de imagenes para etiquetar profundidad relativa, con la ventaja de que el adaptador esta integrado en el framework LibreYOLO y devuelve la salida a la resolucion original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la diferencia absoluta maxima de 0.0 en dos comparaciones de paridad upstream/nativo sobre NVIDIA L40S con PyTorch 2.10.0+cu128, que mide coincidencia de implementacion y no precision del modelo.

| Metrica | Valor | Notas |
|---|---|---|
| Diferencia absoluta maxima (paridad) | 0.0 | Dos comparaciones mismo worker, upstream vs nativo, NVIDIA L40S, PyTorch 2.10.0+cu128 |
| Benchmarks publicos (RMSE, delta1, etc.) | no disponible | No publicados en la informacion disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repo del adaptador ocupa 1,7 GB y hay que sumar el modelo base Qwen/Qwen-Image-Edit-2509, que se descarga por separado y no esta incluido en este checkpoint, por lo que el consumo real de memoria es sustancialmente mayor que el del adaptador.
- GPU recomendadas: el autor ha validado la inferencia en NVIDIA L40S; no se documentan otras GPU recomendadas ni minimos.
- GPU de consumo: no se documenta si cabe en GPU de consumo. Dado que se requieren el adaptador mas un base de difusion de tipo Qwen-Image-Edit, el uso en GPU de consumo dependera de cuantizacion (NF4 probado) y no esta confirmado por el autor.
- Opciones de despliegue: integracion nativa a traves de LibreYOLO (`libreyolo[marigold]`), cargando el checkpoint `.pt` con `LibreYOLO("LibreMarigoldV2b-depth-log-stage1.pt", device="cuda")`. No se documentan otras rutas de despliegue.
- Compatibilidad de backend: inferencia CUDA probada en NF4 y BF16. Entrenamiento, exportacion y MPS no estan soportados por esta integracion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMarigoldV2b-depth-log-stage1 | Adaptador de profundidad (diffusion transformer) sobre Qwen-Image-Edit | no disponible | no aplica | apache-2.0 | HuggingFace, requiere base descargado aparte |
| huawei-bayerlab/marigold-v2-0 | Modelo original del que se extrae la etapa `log-stage1` | no disponible | no aplica | apache-2.0 | HuggingFace, implementacion en GitHub |
| Depth Anything V2 | Estimador de profundidad monocular | no disponible en la informacion disponible | no aplica | no disponible en la informacion disponible | no disponible en la informacion disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: el checkpoint no contiene el base Qwen/Qwen-Image-Edit-2509 y requiere descargarlo por separado con la revision fijada.
- Los valores de profundidad estan codificados en `log_depth` y son afin-relativos; no son metros ni unidades absolutas. Cualquier uso metrico exige una calibracion externa.
- La verificacion publicada cubre unicamente paridad de implementacion en un mismo worker concreto; no garantiza precision en benchmarks ni coincidencia bit a bit entre maquinas distintas.
- Entrenamiento, exportacion y MPS no estan soportados por la integracion.
- La inferencia se ha probado en CUDA con NF4 y BF16; no hay validacion documentada en CPU ni en otros backends.
- El modelo no documenta idiomas soportados ni sesgos conocidos; al ser un modelo de vision, la evaluacion de sesgo aplicaria al dataset de imagenes utilizado, que no se detalla.
- Riesgo de alucinacion estructural: como modelo de difusion generativa, puede producir geometria plausible pero incorrecta en regiones ambiguas (superficies reflectantes, texturas repetitivas, oclusiones).
- Licencia: los pesos preentrenados no estan cubiertos por la licencia MIT del codigo fuente de LibreYOLO; se aplica Apache 2.0, con copyright 2026 Huawei Technologies Co., Ltd. para el material de origen. Verificar los terminos del base Qwen-Image-Edit antes de uso comercial.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-depth-log-stage1
- Modelo base Marigold V2: https://huggingface.co/huawei-bayerlab/marigold-v2-0/tree/6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad
- Modelo base Qwen-Image-Edit: https://huggingface.co/Qwen/Qwen-Image-Edit-2509/tree/d3968ef930e841f4c73640fb8afa3b306a78167e
- Implementacion de referencia Marigold V2: https://github.com/huawei-bayerlab/marigold-v2/tree/cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5
- Rama de integracion LibreYOLO: https://github.com/LibreYOLO/libreyolo/tree/feat/marigoldv2
- Script de conversion: https://github.com/LibreYOLO/libreyolo/blob/feat/marigoldv2/libreyolo/models/marigold_v2/convert.py
