# devin-lai/Hi3Dv1.0-mlx-shared

## Resumen

Hi3Dv1.0-mlx-shared es un repositorio de componentes compartidos para la ejecución en Apple Silicon (mediante el framework MLX) del modelo Hi3D v1.0, un sistema de reconstrucción 3D a partir de imágenes (image-to-3d) desarrollado originalmente por hi3d-official. Este repositorio no contiene los pesos del transformer generativo, sino el VAE en FP32 (0,35 GiB), el scheduler, el índice del pipeline y los ficheros de configuración del transformer. Está pensado para descargarse una sola vez y reutilizarse con variantes FP16, INT8, INT4 o W8A8 experimentales.

La relevancia de este artefacto es de infraestructura: permite a desarrolladores con hardware Apple (chips M-series) desplegar un pipeline de generación 3D sin duplicar los componentes estáticos del modelo entre variantes de cuantización. Es una adaptación comunitaria (autor devin-lai) sobre el modelo base Hi3Dv1.0, publicada bajo la licencia propietaria hi3d-open-license-agreement-v1.0.

No se dispone de información sobre la arquitectura interna del transformer ni del VAE más allá de su rol en el pipeline, ni sobre el volumen de datos de entrenamiento o el contexto de uso previsto por el autor original. El repositorio ocupa 0,4 GB y no incluye pesos del transformer, por lo que por sí solo no permite inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline image-to-3d con VAE, scheduler y transformer; detalles del backbone no publicados) |
| Parametros totales | no disponible (el repositorio solo incluye VAE FP32 de 0,35 GiB y configuraciones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un modelo image-to-3d en el sentido textual) |
| Tipos de cuantizacion | VAE en FP32; transformers en FP16, INT8, INT4 y W8A8 experimental |
| Idiomas soportados | no disponible |
| Licencia | hi3d-open-license-agreement-v1.0 (licencia "other", propietaria) |
| Formato de pesos | safetensors (VAE FP32, scheduler, índice de pipeline, configuración) |

## Arquitectura y entrenamiento

El repositorio es una adaptación del modelo base hi3d-official/Hi3Dv1.0 al runtime MLX de Apple. La arquitectura concreta del transformer generativo no se detalla en la información disponible; lo que sí se especifica es la composición del pipeline: un VAE en FP32 (0,35 GiB), un scheduler de difusión, un índice de pipeline y los ficheros de configuración del transformer. El repositorio no contiene los pesos del transformer, que se distribuyen por separado en el proyecto principal (devin-lai/Hi3Dv1.0-mlx).

El pipeline opera a tres resoluciones de reconstrucción: 512³ (requiere solo transformer_512), 1024³ y 1536³ (requieren ambos transformers). Los codificadores de imagen se descargan por separado en revisiones fijadas (pinned revisions), y el descargador verifica los digests SHA-256 de cada fichero. Los bytes del checkpoint compartido son idénticos a los de la versión upstream, y se preservan los términos de Hi3D y de terceros en LICENSE, NOTICE y THIRD_PARTY_LICENSES.md. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO, dado que no es un modelo de lenguaje.

## Capacidades

- Reconstrucción 3D a partir de una imagen de entrada (image-to-3d) mediante un pipeline de difusión con VAE y scheduler.
- Generación de geometría a resoluciones de 512³, 1024³ y 1536³, con requisitos de transformer distintos según la resolución.
- Refinamiento geométrico (etiqueta "geometry-refinement" declarada por el autor).
- Ejecución nativa en Apple Silicon mediante MLX, con variantes de cuantización FP16, INT8, INT4 y W8A8 experimental para el transformer.
- Descarga selectiva de componentes con verificación de integridad SHA-256.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Prototipado de assets 3D en Mac: un artista o desarrollador puede generar mallas 3D a partir de referencias 2D directamente en un Mac con chip M-series, usando el runtime MLX sin depender de CUDA ni de servicios en la nube.
- Iteración rápida con cuantización agresiva: usar la variante INT4 del transformer para pruebas exploratorias a 512³ en equipos con memoria unificada limitada, y cambiar a FP16 para la salida final.
- Reutilización de componentes en pipelines propios: el VAE FP32 y el scheduler compartidos permiten construir variantes propias del transformer sin volver a descargar los componentes estáticos, gracias al índice de pipeline y a las configuraciones incluidas.
- Generación de geometría para videojuegos y realidad aumentada: producir mallas base a 1024³ o 1536³ para posterior retopología y texturizado en herramientas de DCC.
- Investigación en reconstrucción 3D: servir como base reproducible (con digests SHA-256 verificados y bytes idénticos al upstream) para comparar técnicas de cuantización sobre un mismo pipeline.
- Despliegue local con privacidad de datos: al ejecutarse íntegramente en el equipo del usuario, es adecuado para reconstruir objetos sensibles sin enviar imágenes a servidores externos.
- Evaluación comparativa de cuantizaciones: el repositorio de resultados (devin-lai/Hi3Dv1.0-mlx-results) permite contrastar la calidad geométrica entre FP16, INT8, INT4 y W8A8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (chips M-series) con el framework MLX; no se soporta CUDA de forma nativa en este repositorio.
- Memoria: el VAE FP32 ocupa 0,35 GiB; el consumo total depende del transformer elegido (FP16, INT8, INT4 o W8A8) y de la resolución (512³ requiere un transformer; 1024³ y 1536³ requieren dos).
- No se especifican cifras de VRAM ni de memoria unificada mínima por variante en la información disponible.
- Despliegue: paquete de inferencia `hi3d-mlx` del proyecto principal, con comando `hi3d-mlx download --variant fp16 --resolution 512` para la descarga de componentes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resoluciones | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hi3Dv1.0-mlx-shared | Componentes compartidos image-to-3d | 512³, 1024³, 1536³ | MLX (Apple Silicon) | hi3d-open-license-agreement-v1.0 | HuggingFace (0 descargas, 0 likes) |
| Hi3Dv1.0 (upstream) | Modelo image-to-3d completo | no disponible | no disponible | hi3d-open-license-agreement-v1.0 | HuggingFace (hi3d-official) |
| Hi3Dv1.0-mlx | Pipeline completo MLX | 512³, 1024³, 1536³ | MLX (Apple Silicon) | hi3d-open-license-agreement-v1.0 | HuggingFace (devin-lai) |

No se dispone de información sobre otros modelos image-to-3d comparables (por ejemplo, alternativas de reconstrucción 3D monocular) en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del transformer: por sí solo no permite ejecutar inferencia; requiere descargar las variantes desde el proyecto principal.
- La licencia es propietaria (hi3d-open-license-agreement-v1.0) y no es OSI; es imprescindible revisar los términos antes de cualquier uso comercial, ya que pueden imponer restricciones adicionales.
- El modelo es una adaptación comunitaria (devin-lai) sobre el modelo base oficial; no hay evidencia de validación por parte del autor original más allá de que los bytes compartidos son idénticos al upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La variante W8A8 se describe como experimental, por lo que su estabilidad y calidad geométrica no están garantizadas.
- No se documentan sesgos, tasas de alucinación geométrica ni limitaciones idiomáticas; al no ser un modelo de lenguaje, estas categorías no aplican directamente, pero sí existe riesgo de geometrías incorrectas o incompletas en la reconstrucción 3D.
- Dependencia exclusiva de Apple Silicon y MLX: no es desplegable en GPUs NVIDIA ni en entornos x86 sin trabajo adicional.
- Las imágenes de entrada y los codificadores se descargan en revisiones fijadas; cambios en esas revisiones pueden romper la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-shared
- Proyecto y runtime de inferencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx
- Resultados: https://huggingface.co/datasets/devin-lai/Hi3Dv1.0-mlx-results
- Modelo base: https://huggingface.co/hi3d-official/Hi3Dv1.0
- Licencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-shared/blob/v1.0.0/LICENSE
