# rostrumstudios/depth-anything-v2-small

## Resumen

Depth Anything V2 Small es un modelo de estimacion de profundidad relativa monocular desarrollado por Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao (publicado en arXiv:2406.09414, 2024). Dada una imagen RGB, produce un mapa de profundidad relativa: una imagen en escala de grises donde cada pixel indica la distancia relativa al plano de la camara. Este repositorio concreto es un espejo del export ONNX en fp32 realizado por onnx-community, publicado por rostrumstudios para fijar la version exacta que consumen sus aplicaciones.

El modelo resuelve el problema de la percepcion de profundidad sin necesidad de sensores estereoscopicos ni LiDAR: infiere la estructura 3D de una escena a partir de una unica imagen. Es relevante en pipelines de vision por computador donde se necesita segmentacion por profundidad, generacion de mascaras de sujeto cercano o efectos de desenfoque selectivo, sin requerir hardware especializado.

La variante Small es la unica de la familia con licencia Apache-2.0 (las variantes Base y Large son CC-BY-NC-4.0), lo que la hace apta para uso comercial. El artefacto es un unico fichero `model.onnx` de 99.060.839 bytes (aproximadamente 94,5 MiB) con pesos en fp32, pensado para inferencia via ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimacion de profundidad monocular basado en transformer; detalles no especificados en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | solo fp32 en este repositorio (export ONNX de onnx-community) |
| Idiomas soportados | no disponible (modelo de vision, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, fp32) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna ni el proceso de entrenamiento en la informacion proporcionada. El modelo pertenece a la familia Depth Anything V2, que segun la publicacion original (arXiv:2406.09414) se entrena con datos sinteticos etiquetados y datos reales sin etiquetar para mejorar la generalizacion en profundidad monocular. La model card de este repositorio no incluye detalles sobre numero de tokens, composicion del dataset ni tecnicas de ajuste (RLHF/DPO no aplican a un modelo de vision).

La innovacion tecnica relevante en este artefacto es el formato de distribucion: un export ONNX en fp32 verificado por SHA-256 (`afb6a5c28f3b6bf1618c6e43f02073ef9dfdc70e937502d51603e57b0a1df10c`) y fijado a un commit concreto del repositorio de onnx-community, lo que garantiza reproducibilidad binaria en produccion.

## Capacidades

- Estimacion de profundidad relativa monocular a partir de una imagen RGB.
- Generacion de mapas de profundidad en escala de grises por fotograma o imagen.
- Extraccion de mascaras de sujeto cercano a partir del mapa de profundidad.
- Procesamiento de imagenes y fotogramas de video para analisis de escena.
- Inferencia via ONNX Runtime (formato ONNX nativo).
- No soporta tool calling, agentes, texto, audio ni generacion de imagenes.
- Uso exclusivamente analitico: lee imagenes, no genera contenido nuevo.

## Casos de uso

- Mapas de profundidad para composicion de video: el modelo genera un mapa de grises por fotograma que permite separar primer plano y fondo, util para efectos de desenfoque selectivo o sustitucion de fondo en postproduccion.
- Generacion de mascaras de sujeto cercano: a partir del mapa de profundidad se puede aislar al sujeto principal para tareas de segmentacion o recorte automatico.
- Analisis de escenas en aplicaciones de edicion: Rostrum lo usa en su funcion Compose para leer la distancia de cada parte de una toma, lo que permite aplicar efectos dependientes de la profundidad sin intervencion manual.
- Control de calidad en pipelines de vision: verificar coherencia de profundidad entre fotogramas o detectar anomalias en la captura (por ejemplo, oclusiones inesperadas).
- Preprocesamiento para modelos 3D o reconstruccion: el mapa de profundidad relativa sirve como entrada intermedia para tareas downstream que requieran informacion de estructura espacial.
- Procesamiento por lotes en servidores sin GPU dedicada: al ser un modelo Small en ONNX fp32 (~95 MiB), puede ejecutarse en CPU con ONNX Runtime para analisis de imagenes a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el fichero ONNX fp32 ocupa aproximadamente 94,5 MiB, por lo que la huella de pesos es reducida y cabe en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no especificadas en la informacion proporcionada; al ser un modelo Small, es viable en GPUs consumer (RTX 3060, RTX 4090, etc.) y en CPU via ONNX Runtime.
- Cabe en GPU consumer: si, por el tamano reducido del artefacto (menos de 100 MiB en fp32).
- Opciones de despliegue: ONNX Runtime (formato nativo); no se mencionan otros backends (vLLM, llama.cpp, Ollama, TGI no aplican a un modelo de vision ONNX).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything V2 Small (este) | no disponible | no aplica | Apache-2.0 | ONNX fp32 | Hugging Face (espejo rostrumstudios) |
| Depth Anything V2 Base | no disponible | no aplica | CC-BY-NC-4.0 | no disponible | Hugging Face (depth-anything) |
| Depth Anything V2 Large | no disponible | no aplica | CC-BY-NC-4.0 | no disponible | Hugging Face (depth-anything) |

La diferencia clave frente a Base y Large es la licencia: solo Small es Apache-2.0 y, por tanto, apta para uso comercial sin restricciones de no-comercialidad. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo estima profundidad relativa, no absoluta: no proporciona distancias metricas calibradas.
- No se han documentado sesgos especificos en la informacion disponible; como modelo de vision, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinacion: no aplica en el sentido textual, pero la profundidad inferida puede ser incorrecta en escenas ambiguas, texturas repetitivas o superficies reflectantes.
- Limitaciones de contexto o idioma: no aplica (modelo de vision); el rendimiento puede degradarse en imagenes de dominios muy distintos al de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial; las variantes Base y Large de la familia son CC-BY-NC-4.0 y no deben usarse comercialmente.
- Caveat para produccion: este repositorio es un espejo de un export de terceros (onnx-community); la integridad se garantiza por SHA-256, pero no se ofrece soporte ni mantenimiento por parte del autor original.
- Uso exclusivamente analitico segun el autor del espejo: no debe emplearse para generacion de imagen, voz o audio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rostrumstudios/depth-anything-v2-small
- Export ONNX original: https://huggingface.co/onnx-community/depth-anything-v2-small (commit 4472b7362082ad9968fee890ca0f1e5aca36b93d)
- Pesos originales: https://huggingface.co/depth-anything/Depth-Anything-V2-Small (commit 03876f8651c73a60fe4c2c48294e09fcb6838fcf)
- Codigo original: https://github.com/DepthAnything/Depth-Anything-V2 (commit a561b849ebae10a6f5ef49e26c83cbbcd36c71bf)
- Paper: https://arxiv.org/abs/2406.09414
