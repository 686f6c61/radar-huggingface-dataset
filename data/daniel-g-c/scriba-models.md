# daniel-g-c/scriba-models

## Resumen

Scriba-models es un conjunto de artefactos ONNX derivados de `pyannote/speaker-diarization-community-1`, publicados por daniel-g-c para el proyecto Scriba. No es un modelo de lenguaje ni un transformer generativo: es un pipeline de diarizacion de hablantes (segmentacion, embeddings y agrupamiento) convertido a ONNX para ejecutarse sin PyTorch. Resuelve el problema de identificar quien habla y cuando en reuniones y audio multihablante, con un objetivo claro de despliegue ligero y portable.

La relevancia actual esta en la eliminacion de la dependencia de PyTorch: los cuatro ficheros ONNX (segmentacion, embedding, PLDA y transformacion x-vector) permiten inferencia en CPU y en WebGPU sobre Vulkan, lo que abre la puerta a ejecucion en navegador o en entornos sin stack de Python. El autor verifica la integridad de los ficheros mediante SHA-256 y valida la equivalencia numerica frente al pipeline original en reuniones publicas AMI, con un DER del 0 % entre ambas implementaciones.

El repositorio es de tamano minimo (0.0 GB segun Hugging Face) y las descargas y likes registrados son cero en el momento de la consulta, lo que indica un artefacto reciente y de nicho. La licencia declarada es CC BY 4.0, con atribuciones adicionales a pyannote/CNRS, WeSpeaker y BUT Speech@FIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de diarizacion: segmentacion tipo powerset (pyannote), red de embedding con backbone compartido y tres mascaras de pooling ponderado, PLDA y transformacion x-vector (VBx) |
| Parametros totales | No disponible (no se publica recuento; los ficheros suman aproximadamente 33 MB en pesos ONNX) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (procesa ventanas de audio; el tamano de ventana no se especifica en la informacion) |
| Tipos de cuantizacion | No disponible; los pesos se exportan en FP32 |
| Idiomas soportados | No disponible (la diarizacion es independiente del idioma en la practica, pero no se declara) |
| Licencia | CC BY 4.0 (pesos); codigo portado de pyannote.audio 4.0.0 bajo MIT; VBx bajo Apache-2.0; Scriba bajo GPL-3.0-or-later |
| Formato de pesos | ONNX (opset 17, FP32, batch dinamico) y NPZ para PLDA y transformacion x-vector |

## Arquitectura y entrenamiento

El pipeline reproduce la arquitectura de `pyannote/speaker-diarization-community-1`. La segmentacion emplea el esquema de powerset de Plaquet y Bredin, que formula la deteccion de cambios de hablante como clasificacion de combinaciones de hablantes por frame. La red de embedding, procedente de WeSpeaker y entrenada sobre VoxCeleb, comparte un backbone comun y aplica tres mascaras de pooling ponderado para producir representaciones de hablante. El agrupamiento se realiza con PLDA y la transformacion x-vector de VBx (Landini et al.), cuyos ficheros NPZ se mantienen sin cambios respecto al original.

La conversion a ONNX se hizo en FP32 con opset 17 y batch dinamico; los filtros SincNet aprendidos se almacenan como constantes. No se incluye checkpoint de PyTorch. La validacion se realizo sobre reuniones publicas AMI comparando contra el pipeline original en PyTorch, en CPU y con WebGPU sobre Vulkan, obteniendo la misma diarizacion con un DER del 0 % entre ambas implementaciones. No se dispone de informacion sobre tokens de audio de entrenamiento ni sobre el detalle del dataset de la segmentacion mas alla de la referencia al modelo upstream.

## Capacidades

- Diarizacion de hablantes: identifica segmentos de habla y asigna etiquetas de hablante a lo largo de una grabacion.
- Segmentacion de cambios de hablante mediante clasificacion powerset por frame.
- Extraccion de embeddings de hablante para comparacion y agrupamiento entre segmentos.
- Agrupamiento de hablantes con PLDA y transformacion x-vector (VBx).
- Ejecucion sin PyTorch: inferencia via ONNX Runtime en CPU y aceleracion WebGPU sobre Vulkan.
- Verificacion de integridad de artefactos mediante SHA-256 y manifiesto de conversion.
- No soporta generacion de texto, codigo, matematicas, vision, tool calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no declaradas; la diarizacion no depende del idioma del contenido, pero no se documenta cobertura.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablante: el pipeline segmenta el audio y asigna etiquetas de hablante que se pueden alinear con la salida de un ASR para producir actas con intervenciones identificadas.
- Analisis de entrevistas y grupos focales: permite separar participantes en grabaciones de investigacion cualitativa y calcular tiempos de habla por persona.
- Indexacion y busqueda de archivos de audio: los embeddings de hablante permiten agrupar fragmentos de la misma voz en un archivo o catalogo y habilitar busqueda por hablante.
- Despliegue en navegador o entornos sin Python: al ejecutarse con ONNX Runtime y WebGPU sobre Vulkan, se puede integrar en aplicaciones cliente que procesen audio localmente sin enviar datos a un servidor.
- Sistemas de subtitulado en directo: la segmentacion ligera en CPU permite etiquetar hablantes en flujos de audio en tiempo casi real en equipos sin GPU dedicada.
- Investigacion en diarizacion: sirve como referencia ONNX reproducible para comparar implementaciones y como base para experimentos con PLDA y VBx sin reinstalar el stack de PyTorch.
- Integracion en pipelines GPL-3.0-or-later: el proyecto Scriba, que descarga y verifica estos modelos automaticamente, encaja en productos compatibles con esa licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion es la equivalencia con el pipeline original en PyTorch sobre reuniones publicas AMI, con un DER del 0 % entre ambas implementaciones, en CPU y con WebGPU sobre Vulkan. No se aportan valores absolutos de DER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: muy baja; los pesos ONNX suman aproximadamente 33 MB en FP32 (segmentacion 5,98 MB, embedding 26,55 MB, PLDA 0,13 MB, transformacion x-vector 0,13 MB), por lo que la memoria necesaria es minima.
- GPU recomendadas: no se especifican; el autor valida ejecucion en CPU y con WebGPU sobre Vulkan, lo que cubre GPUs integradas y dedicadas compatibles con WebGPU.
- Cabe en cualquier GPU consumer: el volumen de pesos y la naturaleza del pipeline no requieren VRAM significativa; tambien funciona en CPU.
- Opciones de despliegue: ONNX Runtime (CPU y WebGPU/Vulkan); el proyecto Scriba gestiona la descarga y verificacion SHA-256 de los artefactos.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| daniel-g-c/scriba-models | Pipeline de diarizacion en ONNX (segmentacion + embedding + PLDA) | No disponible (aprox. 33 MB en pesos) | No disponible | CC BY 4.0 | Hugging Face, ONNX Runtime |
| pyannote/speaker-diarization-community-1 | Pipeline de diarizacion en PyTorch | No disponible | No disponible | Segun modelo upstream (no detallada aqui) | Hugging Face, requiere PyTorch |
| WeSpeaker (embedding) | Red de embeddings de hablante | No disponible | No disponible | Segun modelo upstream | Disponible como componente upstream |
| VBx (PLDA + x-vector) | Agrupamiento de hablantes | No aplica | No aplica | Apache-2.0 (codigo) | Repositorio de referencia |

La comparativa se limita a los componentes citados en la informacion disponible; no se dispone de datos de rendimiento comparables entre alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de modelos entrenados sobre VoxCeleb y datos de diarizacion, pueden heredar sesgos de esos corpus en cuanto a acentos, genero y condiciones acusticas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la asignacion de hablantes puede ser incorrecta en audio con solapamiento de voces, ruido o hablantes muy similares.
- Limitaciones de contexto o idioma: no se especifican ventanas de audio ni cobertura idiomatica; el rendimiento en dominios distintos de reuniones AMI no esta validado.
- Restricciones de licencia: los pesos son CC BY 4.0 y requieren atribucion a pyannote/CNRS, WeSpeaker y BUT Speech@FIT; el codigo portado es MIT y VBx Apache-2.0; Scriba es GPL-3.0-or-later, lo que condiciona su integracion en productos derivados.
- La conversion no esta avalada por los autores upstream, segun indica el propio autor.
- El repositorio no incluye checkpoint de PyTorch ni modelo de lenguaje; no debe usarse para tareas de generacion.
- Descargas y likes nulos en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daniel-g-c/scriba-models
- Modelo base: https://huggingface.co/pyannote/speaker-diarization-community-1
- Proyecto Scriba: https://github.com/daniel-g-carrasco/scriba
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- pyannote.audio (codigo portado, MIT): no disponible como enlace en la informacion
- VBx (Apache-2.0): no disponible como enlace en la informacion
- WeSpeaker: no disponible como enlace en la informacion
