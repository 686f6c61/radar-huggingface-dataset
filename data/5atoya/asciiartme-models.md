# 5atoya/asciiartme-models

## Resumen

`5atoya/asciiartme-models` es un repositorio de modelos ONNX publicado por el usuario 5atoya, concebido como componente de inferencia del proyecto asciiart.me (aame), una herramienta que convierte imagenes en arte ASCII japones (AA). No se trata de un modelo generativo de lenguaje, sino de un conjunto de tres redes neuronales especializadas en vision por computador: extraccion de lineas de manga, deteccion de bordes y segmentacion de caras de anime. Los pesos originales en PyTorch se convirtieron a ONNX sin reentrenamiento, por lo que el repositorio actua como espejo de distribucion de artefactos ya existentes en otros proyectos.

El repositorio tiene un tamano aproximado de 0,2 GB y esta pensado para ser descargado tanto por la version web (carga directa desde Hugging Face) como por la version Python del proyecto (mediante el comando `python -m aame.get_models`, que recupera los ficheros desde el release `models-v1`). Cada uno de los tres modelos tiene entradas y salidas tensoriales bien definidas, con restricciones de dimension (H y W multiplos de 64) y preprocesado documentado en el codigo del proyecto.

Es relevante ahora por su caracter practico y ligero: ofrece un pipeline ONNX listo para ejecutar en navegador o en Python para tareas de estilizacion y segmentacion de ilustraciones, con licencia MIT en los tres modelos y sus dependencias. No dispone de pipeline declarado en Hugging Face, no registra descargas ni likes en el momento de la consulta, y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres redes neuronales convolucionales independientes exportadas a ONNX (no se especifica la topologia interna de cada una en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos ONNX sin cuantizacion declarada) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`manga_line.onnx`, `teed.onnx`, `face_unet.onnx`) |

## Arquitectura y entrenamiento

El repositorio agrupa tres modelos con propositos distintos. `manga_line.onnx` procede de los pesos `erika.pth` del proyecto ljsabc/MangaLineExtraction_PyTorch (release v1) y extrae lineas de dibujo estilo manga a partir de una imagen en escala de grises. `teed.onnx` deriva del checkpoint `checkpoints/BIPED/7/7_model.pth` del proyecto xavysp/TEED y produce tres mapas de borde mas un mapa fusionado (`edge_fused`), con salidas antes de la sigmoide. `face_unet.onnx` proviene de `model/UNet.pth` del proyecto siyeong0/Anime-Face-Segmentation y devuelve un tensor de 7 canales con probabilidades de segmentacion de partes de la cara.

Los tres modelos fueron convertidos con `python -m aame.export_onnx` a partir de los pesos PyTorch originales, sin reentrenamiento ni ajuste fino adicional. No se documenta en la informacion disponible el volumen de datos de entrenamiento, la composicion de los datasets originales ni si se aplicaron tecnicas de RLHF, DPO o aumentacion de datos; esa informacion reside, en su caso, en los repositorios de origen. La innovacion tecnica principal del repositorio es la propia exportacion ONNX: permite ejecutar los tres modelos en entornos sin PyTorch, incluido el navegador, con un contrato de entrada/salida estable y hashes SHA256 publicados para verificar la integridad de los ficheros.

## Capacidades

- Extraccion de lineas de manga: `manga_line.onnx` recibe una imagen en escala de grises (1x1xHxW, valores 0..255) y devuelve un mapa de lineas negras sobre fondo blanco, con posibilidad de valores fuera del rango 0..255.
- Deteccion de bordes multi-escala: `teed.onnx` recibe una imagen RGB (1x3xHxW, 0..255) y produce `edge1`, `edge2`, `edge3` y `edge_fused`, cada uno 1x1xHxW, antes de la sigmoide.
- Segmentacion de caras de anime: `face_unet.onnx` recibe una imagen RGB normalizada (1x3xHxW, 0..1) y devuelve `parts` 1x7xHxW con probabilidades por parte de la cara.
- Conversion de imagenes a arte ASCII japones: el pipeline completo de aame combina estas salidas para generar AA, aunque la logica de composicion reside en el proyecto asciiart.me, no en este repositorio.
- Ejecucion en navegador: los ficheros ONNX estan pensados para carga directa desde la version web del proyecto.
- Ejecucion en Python: descarga mediante `python -m aame.get_models` desde el release `models-v1`.
- Verificacion de integridad: hashes SHA256 publicados para los tres modelos y el fichero de avisos de terceros.

## Casos de uso

- Conversion de fotografias o ilustraciones a arte ASCII japones: el pipeline aame usa las salidas de `manga_line.onnx` y `teed.onnx` para aislar trazos y bordes, y `face_unet.onnx` para tratar las zonas faciales, generando el AA final. Adecuado porque los tres modelos estan disenados especificamente para este flujo y comparten contrato de dimensiones.
- Estilizacion de line-art en aplicaciones web: carga de `manga_line.onnx` en el navegador mediante ONNX Runtime Web para superponer trazos de manga sobre fotos sin enviar la imagen a un servidor.
- Segmentacion de caras en herramientas de edicion de ilustraciones: `face_unet.onnx` permite separar partes del rostro (ojos, boca, etc.) para aplicar mascaras o retoques por region en editors de fanart.
- Deteccion de bordes para pipelines de vectorizacion: `teed.onnx` genera mapas de borde fusionados que pueden alimentar algoritmos de trazado vectorial o de deteccion de contornos en ilustraciones.
- Prototipado rapido de efectos artisticos en Python: el release `models-v1` y el comando de descarga permiten incorporar los tres modelos en scripts de procesamiento por lotes sin depender de PyTorch.
- Verificacion de integridad en despliegues: los hashes SHA256 publicados permiten comprobar que los ficheros ONNX descargados coinciden con los originales antes de integrarlos en produccion.
- Distribucion de artefactos para aplicaciones offline: al ser ONNX y ligeros, los modelos pueden empaquetarse en aplicaciones de escritorio o moviles que necesiten estilizacion local sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de tres modelos convolucionales de vision de pequeno tamano (repo total de 0,2 GB), la huella es reducida, pero no se documentan cifras exactas.
- GPU recomendadas: no disponible; al ejecutarse via ONNX Runtime, puede correr en CPU, GPU integrada o GPU dedicada, sin recomendaciones oficiales publicadas.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del repositorio, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (incluida la variante web para navegador) y el flujo Python del proyecto aame mediante `python -m aame.get_models`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `5atoya/asciiartme-models` | no disponible | no aplica | no disponible | MIT | ONNX en Hugging Face, release `models-v1` |
| MangaLineExtraction_PyTorch (ljsabc) | no disponible | no aplica | no disponible | MIT | PyTorch en GitHub |
| TEED (xavysp) | no disponible | no aplica | no disponible | MIT | PyTorch en GitHub |
| Anime-Face-Segmentation (siyeong0) | no disponible | no aplica | no disponible | MIT | PyTorch en GitHub |

Los tres modelos comparables son las fuentes originales de los pesos convertidos en este repositorio; la diferencia principal es el formato (PyTorch frente a ONNX) y el empaquetado para el pipeline aame. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso; cualquier uso en esos ambitos seria inadecuado.
- Restriccion de dimensiones: las entradas H y W deben ser multiplos de 64, lo que obliga a redimensionar o rellenar imagenes antes de la inferencia.
- Salidas de `manga_line.onnx` pueden salir del rango 0..255, por lo que el postprocesado debe recortarlas o normalizarlas.
- Las salidas de `teed.onnx` se entregan antes de la sigmoide, de modo que el consumidor debe aplicar la activacion si necesita probabilidades.
- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenados sobre ilustraciones de estilo manga/anime, su comportamiento fuera de ese dominio no esta garantizado.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero la segmentacion y deteccion de bordes pueden producir artefactos en imagenes con estilos o contenidos alejados del dominio de entrenamiento.
- Licencia MIT en los tres modelos y en el fichero `THIRD_PARTY_NOTICES.txt`; se recomienda conservar dicho fichero junto con los modelos al redistribuirlos.
- No hay pipeline declarado en Hugging Face ni resultados de benchmarks, por lo que la evaluacion de calidad debe hacerse por inspeccion visual en el caso de uso concreto.
- El repositorio no registra descargas ni likes, lo que indica una adopcion muy limitada y escasa validacion comunitaria hasta la fecha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/5atoya/asciiartme-models
- Proyecto asciiart.me (aame): https://github.com/yano/asciiart.me
- Preprocesado y postprocesado (`aame/models.py`): https://github.com/yano/asciiart.me/blob/master/aame/models.py
- MangaLineExtraction_PyTorch (origen de `manga_line.onnx`): https://github.com/ljsabc/MangaLineExtraction_PyTorch
- TEED (origen de `teed.onnx`): https://github.com/xavysp/TEED
- Anime-Face-Segmentation (origen de `face_unet.onnx`): https://github.com/siyeong0/Anime-Face-Segmentation
- Release `models-v1` del proyecto aame: no disponible como URL directa en la informacion proporcionada
