# ddai10/filter-aqs-v3

## Resumen

filter-aqs-v3 es un sistema de clasificacion de imagenes para deteccion de defectos de apariencia en filtros opticos (滤光片), publicado por el usuario ddai10 en HuggingFace bajo el identificador `ddai10/filter-aqs-v3`. No se trata de un modelo generativo unico, sino de un ensemble de clasificadores de imagen empaquetado como aplicacion lista para ejecutar: incluye siete archivos de modelo ONNX (DINOv2-L, DINOv3-L, DINOv2-B con dos cabezas discriminativas cada uno, SigLIP2-so400m, DINOv2-L-reg con una cabeza cada uno, mas convnext_small y edgenext) que suman diez miembros de ensemble en su version estandar.

El modelo resuelve un problema industrial concreto: clasificar imagenes de filtros opticos en campo oscuro como "良品" (conforme) o "不良" (defectuoso), distinguiendo defectos de apariencia como fracturas laterales, rayones, desconchones, puntos blancos y suciedad. La version v3 anade respecto a v2 dos miembros de ensemble basados en SigLIP2-so400m y DINOv2-L con registers, con el objetivo declarado de reducir la tasa de falsos positivos.

La relevancia de esta publicacion es practica mas que cientifica: se distribuye como un paquete Linux x86_64 autocontenido de 7,2 GB (8,8 GB descomprimido) que incluye Python 3.12, onnxruntime-gpu 1.31.1 y las bibliotecas CUDA 13/cuDNN 9, de modo que solo requiere drivers NVIDIA para funcionar. Incluye tres variantes (estandar de 10 miembros, rapida de 8 y ligera de 4) con distintos compromisos entre tasa de error y throughput. No se dispone de informacion sobre arquitectura base de los backbones mas alla de los nombres citados, ni sobre el numero de parametros totales del ensemble.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de clasificadores de imagen con backbones congelados (DINOv2-L, DINOv3-L, DINOv2-B, SigLIP2-so400m, DINOv2-L-reg, ConvNeXt-Small, EdgeNeXt) y cabezas discriminativas; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la interfaz y documentacion estan en chino; la tarea es independiente del idioma) |
| Licencia | other (no se detalla el texto de la licencia en la informacion disponible) |
| Formato de pesos | ONNX, empaquetado en un tar.gz Linux x86_64 con runtime propio |

## Arquitectura y entrenamiento

El sistema es un ensemble de clasificacion binaria (conforme/defectuoso) construido sobre backbones de vision congelados. La version estandar combina siete archivos de modelo que aportan diez miembros de ensemble: DINOv2-L, DINOv3-L y DINOv2-B con dos cabezas discriminativas cada uno; SigLIP2-so400m y DINOv2-L con registers con una cabeza cada uno; y dos CNN, ConvNeXt-Small y EdgeNeXt. La version rapida mantiene ocho miembros (los de v2) y la ligera reduce a cuatro (DINOv2-B con dos cabezas, ConvNeXt-Small y EdgeNeXt). Los pesos se exportan a ONNX y se ejecutan con onnxruntime-gpu 1.31.1 sobre CUDA 13 y cuDNN 9.

Segun la model card, los datos de entrenamiento provienen del dataset `daipath/appearance-quality-stats`, excluyendo datos antiguos, y se considera defectuoso tanto el defecto de apariencia como el de rendimiento. No se especifica el numero de imagenes, la composicion exacta del dataset ni si hubo etapas de ajuste fino mas alla del entrenamiento de las cabezas sobre backbones congelados. La model card reconoce explicitamente un sesgo de seleccion: los dos miembros nuevos de v3 (SigLIP2-so400m y DINOv2-L-reg) se eligieron observando ocho lotes concretos, por lo que las cifras de mejora publicadas son optimistas; la estimacion mas estricta situa la reduccion de falsos positivos en 0,2-0,4 puntos porcentuales en lugar de los 0,52 puntos del dato nominal.

## Capacidades

- Clasificacion binaria de imagenes de filtros opticos en campo oscuro: conforme (良品) frente a defectuoso (不良).
- Deteccion de defectos de apariencia: fractura lateral, rayado, desconchon en borde o esquina, puntos blancos y suciedad, y marcas de tipo mora (麻点).
- Deteccion de defectos de rendimiento unicamente cuando la imagen contiene una caja dibujada manualmente; no sustituye a la inspeccion de rendimiento en linea.
- Puntuacion de defecto continua (不良分) con umbral configurable, lo que permite ajustar el punto de operacion entre sensibilidad y especificidad.
- Presets de operacion: alta deteccion, equilibrado y preservacion de conformes.
- Flujo de triaje en tres zonas: liberacion automatica, revision humana y rechazo.
- Calibracion de umbral por lote con objetivo de recall (por ejemplo, `--target-recall 0.99`).
- Evaluacion sobre directorios etiquetados con barrido de umbrales (`--evaluate --sweep`).
- Ejecucion en GPU NVIDIA o, en su defecto, en CPU con rendimiento muy inferior.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de imagen.

## Casos de uso

- Inspeccion visual automatizada en linea de produccion de filtros opticos: el sistema clasifica cada imagen capturada en campo oscuro y emite una decision conforme/defectuoso con una puntuacion continua, integrble en el PLC o MES de la planta mediante el CSV de salida.
- Control de calidad con triaje en tres zonas: usando `--triage`, las piezas claramente conformes se liberan automaticamente, las claramente defectuosas se rechazan y las dudosas se derivan a revision humana, reduciendo la carga del operador sin renunciar a la trazabilidad.
- Calibracion por lote y por formato: con `--calibrate --target-recall 0.99` se ajusta el umbral a cada lote (por ejemplo, el lote 38028_P17 en formato 632x632, donde se concentra la mejora de v3), de modo que la tasa de fugas se mantenga bajo control aunque cambie la distribucion de piezas.
- Auditoria y validacion previa a la puesta en marcha: `--evaluate --sweep` sobre un directorio con subcarpetas 良品/不良 permite obtener curvas de fuga y falsa alarma sobre imagenes reales de la linea antes de comprometer el sistema en produccion.
- Despliegue en estaciones con GPU de gama consumer: la version estandar cabe en una RTX 5080 de 16 GB (pico de unos 13,3 GB con lote 8), lo que permite montar la inspeccion en puestos de trabajo o lineas pequenas sin servidores dedicados.
- Procesamiento de alto volumen con la version rapida: cuando la cadencia supera las 18.000 imagenes por hora, la variante de 8 miembros ofrece unas 41.000-55.000 imagenes por hora en una RTX 5080 a costa de unos 0,2-0,5 puntos mas de falsos positivos.
- Despliegue sin GPU o en equipos modestos con la version ligera: unas 240.000-300.000 imagenes por hora en RTX 5080 o unas 7.000 por hora en CPU, adecuada para preclasificacion o para entornos sin acelerador.
- Integracion en pipelines de datos industriales: la salida CSV (archivo, puntuacion, decision, umbral) facilita el volcado a bases de datos de calidad y el analisis posterior de tendencias por lote.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que no aplican a un clasificador de imagen. Si se publican metricas propias de la tarea, medidas sobre lotes concretos y con el sesgo de seleccion reconocido por el autor:

| Metrica | v2 (8 miembros) | v3 estandar (10 miembros) | v3 estandar, estimacion estricta |
|---|---|---|---|
| Fuga de defectos de apariencia (umbral por defecto) | 1,38 % | 1,44 % | no disponible |
| Falsa alarma (umbral por defecto) | 2,27 % | 1,75 % | 1,9-2,1 % |
| Falsa alarma en el peor lote | 8,6 % | 4,9 % | 5,5-6,8 % |
| Falsa alarma lote 38028_P17 (formato 632x632) | 8,6 % | 4,9 % | no disponible |
| Fuga lote 38028_P10 (mayor numero de defectos) | 5,6 % | 6,6-6,8 % | no disponible |
| Falsa alarma version ligera (4 miembros) | no aplica | 3,27 % | no disponible |
| Falsa alarma peor lote, version ligera | no aplica | 14,9 % | no disponible |

Rendimiento medido o estimado en RTX 5080:

| Version | Throughput GPU (img/h) | Throughput CPU (img/h) | VRAM pico (lote 8) |
|---|---|---|---|
| Estandar (10 miembros) | 18.000-25.000 | ~700 | ~13,3 GB |
| Rapida (8 miembros) | 41.000-55.000 | ~1.500 | ~10 GB |
| Ligera (4 miembros) | 240.000-300.000 | ~7.000 | ~4 GB |

Las cifras de CPU se midieron en un servidor con Xeon Gold 6530 a 16 hilos. Los datos de falsa alarma y fuga proceden de lotes internos y no de un conjunto de validacion independiente; la propia model card advierte que la aceptacion debe hacerse con imagenes reales de la linea.

## Requisitos de hardware

- VRAM estimada: unos 13,3 GB para la version estandar con lote 8 (unos 13.600 MiB en nvidia-smi), unos 10 GB para la rapida y unos 4 GB para la ligera.
- GPU recomendadas: RTX 5080 (16 GB) como referencia de las mediciones; cualquier GPU NVIDIA con driver >= 580 y CUDA >= 13.0. Las RTX de la serie 50 en Linux requieren drivers con sufijo `-open`.
- Cabe en GPU consumer: si, la version estandar cabe en una RTX 5080 de 16 GB, aunque sin margen para otras aplicaciones que usen VRAM simultaneamente. La rapida y la ligera caben en tarjetas mas modestas.
- Memoria RAM: unos 3 GB con GPU; en CPU, pico de unos 23 GB (estandar), 9 GB (rapida) y 3 GB (ligera) con lote 8. No se recomienda ejecutar la version estandar en CPU con menos de 32 GB de RAM.
- Sistema operativo: Linux x86_64, glibc >= 2.28; recomendado Ubuntu 22.04 o 24.04. No se debe descomprimir en Windows ni en particiones exFAT/NTFS por perdida de enlaces y permisos.
- Disco: 7,2 GB comprimido, 8,8 GB descomprimido y unos 16 GB libres durante la descompresion.
- Opciones de despliegue: el paquete incluye su propio runtime (Python 3.12 + onnxruntime-gpu 1.31.1 + CUDA 13/cuDNN 9) y scripts `predict`, `predict-fast` y `predict-lite`; no requiere vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. La integracion se hace por linea de comandos con salida CSV.
- Latencia y throughput: en CPU, unos 5 s/imagen (estandar), 2,3 s/imagen (rapida) y 0,5 s/imagen (ligera) en el servidor de referencia. En GPU, las cifras de throughput de la tabla anterior. La version estandar es aproximadamente 2,2 veces mas lenta que la rapida.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables publicados con la misma tarea y el mismo dataset. La comparativa interna entre las tres variantes del propio paquete es la siguiente:

| Variante | Miembros | Falsa alarma (defecto) | Peor lote | Throughput RTX 5080 | VRAM | Uso recomendado |
|---|---|---|---|---|---|---|
| Estandar | 10 | 1,75 % (estricta 1,9-2,1 %) | 4,9 % (estricta 5,5-6,8 %) | 18.000-25.000 img/h | ~13,3 GB | Uso general, minimiza falsos positivos |
| Rapida | 8 | 2,27 % | 8,6 % | 41.000-55.000 img/h | ~10 GB | Cadencias superiores a 18.000 img/h |
| Ligera | 4 | 3,27 % | 14,9 % | 240.000-300.000 img/h | ~4 GB | Sin GPU o preclasificacion |

Frente a alternativas genericas de clasificacion de imagenes (por ejemplo, un ViT o ConvNeXt ajustado con fine-tuning sobre el mismo dataset), no hay datos publicados que permitan una comparacion rigurosa; la propuesta de valor de este paquete es el ensemble congelado con cabezas multiples y el empaquetado reproducible, no una arquitectura novedosa.

## Limitaciones y advertencias

- Sesgo de seleccion en las metricas: los dos miembros nuevos de v3 se eligieron observando los mismos ocho lotes usados para reportar mejoras, por lo que las cifras nominales son optimistas; la estimacion estricta reduce la mejora de falsos positivos a 0,2-0,4 puntos.
- La mejora de falsos positivos se concentra casi por completo en el lote 38028_P17 en formato 632x632; en el resto de lotes apenas cambia, y en el lote 38028_P10 la fuga de defectos de apariencia empeora de 5,6 % a 6,6-6,8 %.
- No sustituye la inspeccion de rendimiento: solo detecta defectos de rendimiento cuando la imagen contiene una caja dibujada manualmente, algo que no ocurre en las imagenes de linea.
- Las imagenes de ejemplo incluidas provienen del conjunto de entrenamiento y solo sirven para verificar que el programa funciona; no son una medida de precision. Ademas, en el dataset de entrenamiento las imagenes conformes y defectuosas se capturaron en sesiones separadas, por lo que las puntuaciones en produccion no seran tan extremas.
- Es obligatorio validar con imagenes reales de la linea antes de aceptar el sistema; la model card lo exige explicitamente y ofrece las herramientas `--evaluate --sweep` y `--calibrate` para ello.
- Licencia "other" sin texto detallado en la informacion disponible: antes de un uso comercial es necesario consultar los terminos exactos del repositorio. El repositorio es privado y requiere token de acceso.
- Restricciones de plataforma: solo Linux x86_64; no se puede descomprimir en Windows ni en sistemas de ficheros exFAT/NTFS; requiere driver NVIDIA >= 580 y CUDA >= 13.0 para GPU.
- La interfaz, la documentacion y las etiquetas estan en chino; no se documentan idiomas soportados ni localizacion.
- Riesgo de deriva entre lotes: el rendimiento depende del formato de imagen (por ejemplo, 632x632) y del lote, por lo que se recomienda recalibrar el umbral periodicamente.
- Solo se puede ejecutar una instancia a la vez en la misma GPU; el consumo de VRAM deja poco margen en tarjetas de 16 GB.
- No dispone de capacidades generativas, de razonamiento, de codigo ni de vision general: cualquier uso fuera de la clasificacion de defectos de filtros opticos queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddai10/filter-aqs-v3
- Dataset de entrenamiento citado: `daipath/appearance-quality-stats` (referenciado en la model card; no se proporciona URL directa)
- Repositorio de descarga del paquete: https://huggingface.co/daipath/filter-aqs-v3 (ruta citada en la model card para los artefactos `filter-aqs-v3-linux-x64.tar.gz` y `SHA256SUMS`)
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
