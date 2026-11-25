# aquaduck/Qwen3.8-27B-MLX

## Resumen

`aquaduck/Qwen3.8-27B-MLX` es una redistribución en formato MLX de 4 bits del modelo Qwen3.8-27B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. El repositorio lo publica Aquaduck AI, que se limita al alojamiento y al empaquetado por capas: no introduce ningún reentrenamiento ni una cuantización nueva. El objetivo es ofrecer una variante lista para ejecutarse en hardware Apple Silicon mediante `mlx-lm`, junto con particiones intermedias del modelo pensadas para carga por etapas en la aplicación de escritorio de Aquaduck.

El modelo base es un transformer causal de aproximadamente 26.900 millones de parámetros reales según los pesos en safetensors (27,8B declarados en la model card), con 64 capas, dimensión oculta de 5120 y atención con GQA de 24 cabezas de consulta y 4 de clave/valor. Su ventana de contexto nativa es de 262.144 tokens, lo que lo sitúa en la gama alta de modelos de contexto largo.

La relevancia de este repositorio es fundamentalmente práctica: permite desplegar un modelo de ~27B en Mac con memoria unificada mediante cuantización de 4 bits (~15 GB para el fichero completo), y añade un esquema de shards por capas que facilita la carga distribuida entre nodos. No aporta mejoras de calidad respecto al modelo original; hereda sus capacidades y sus sesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.8-27B), GQA con 24 cabezas Q y 4 KV, 64 capas, hidden dim 5120 |
| Parametros totales | 26.895.993.856 (26,9B reales en safetensors); 27,8B declarados en la model card |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | Multilingue (los mismos que el modelo base; lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), empaquetado `mlx-package-v1` con shards por capas |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3.8-27B: un transformer causal con 64 capas, dimensión oculta de 5120 y atención con grouped-query attention (24 cabezas de consulta frente a 4 de clave/valor), lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. El contexto nativo alcanza los 262.144 tokens.

Este repositorio no incluye entrenamiento ni ajuste fino. Los pesos proceden del equipo Qwen de Alibaba Cloud; la cuantización a 4 bits en MLX se ingiere desde la variante cuantizada del modelo base y se redistribuye bajo Apache 2.0. La aportación propia de Aquaduck es el empaquetado: un fichero completo `model-00001-of-00003.safetensors` (~15,13 GB) compatible con `mlx-lm` estándar, y dos shards contiguos de punto medio, `layers-0-32` (~7,57 GB) y `layers-32-64` (~8,28 GB), con índices de fin exclusivos. El punto de corte válido es la capa 32 y el máximo de etapas es 2. Los shards no constituyen una cuantización distinta ni modifican los pesos más allá del empaquetado.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat heredada del modelo base.
- Modos de razonamiento (thinking) e instructivo, según la documentación del modelo base.
- Capacidad multilingüe heredada del modelo base (la lista concreta de idiomas no está disponible en la información proporcionada).
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este repositorio; debe consultarse la model card del modelo base.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada para este repositorio.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente local en Mac con Apple Silicon: el fichero completo de 4 bits (~15 GB) se carga con `mlx-lm` en equipos con memoria unificada suficiente, lo que permite un asistente conversacional privado sin conexión a servicios en la nube.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada para tareas de resumen y extracción.
- Carga por etapas en despliegues distribuidos: los shards `layers-0-32` y `layers-32-64` permiten repartir el modelo entre dos nodos o dos etapas de carga dentro de la aplicación Aquaduck, útil cuando la memoria por dispositivo es limitada.
- Prototipado de aplicaciones conversacionales: la licencia Apache 2.0 y el formato MLX facilitan experimentar en local antes de escalar a infraestructura de servidor.
- Investigación sobre cuantización: al conservar el fichero completo de 4 bits junto a los shards, sirve para comparar el comportamiento del modelo cuantizado frente al original en tareas de evaluación reproducibles.
- Generación de texto en pipelines de datos: integrable en scripts de `mlx-lm` para tareas por lotes como clasificación, reescritura o generación de resúmenes en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay evaluaciones separadas para la versión MLX ni para los shards, y remite a la model card de `Qwen/Qwen3.8-27B` para datos de evaluación del modelo base.

## Requisitos de hardware

- VRAM/memoria estimada: ~15,13 GB para el fichero completo en 4 bits; ~7,57 GB y ~8,28 GB por shard si se usa carga por etapas.
- Hardware objetivo: equipos Apple Silicon con memoria unificada, dado que el formato es MLX; no está pensado para GPU NVIDIA de forma nativa.
- Cabe en consumer hardware: sí, en Mac con al menos 16 GB de memoria unificada para el modelo completo (con margen ajustado para el KV cache) y 24 GB o más para contextos largos.
- Despliegue: `mlx-lm` para el fichero completo; los shards requieren el cargador por etapas de Aquaduck Arc y no funcionan como modelos completos en `mlx-lm` estándar.
- vLLM, llama.cpp, Ollama o TGI: no disponibles para este formato; requerirían una conversión previa a GGUF u otro formato compatible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| aquaduck/Qwen3.8-27B-MLX | 26,9B (27,8B declarados) | 262.144 | 4 bits MLX | Apache 2.0 | safetensors MLX |
| Qwen/Qwen3.8-27B (base) | 27,8B | 262.144 | completa | Apache 2.0 | safetensors |
| Variantes GGUF de Qwen3.8-27B | 27,8B | 262.144 | 2-8 bits | Apache 2.0 | GGUF |
| Modelos de ~27B en MLX de otros autores | no disponible | no disponible | variable | variable | safetensors MLX |

La diferencia principal frente al modelo base es la cuantización a 4 bits y el empaquetado por capas; frente a las variantes GGUF, el formato MLX está optimizado para Apple Silicon y no es portable a CUDA sin conversión. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad respecto a las versiones de mayor precisión del modelo base; la model card lo reconoce explícitamente.
- Hereda los sesgos, riesgos y limitaciones del modelo base Qwen3.8-27B, no evaluados de forma independiente en este repositorio.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las advertencias generales del modelo base.
- Los shards `layers-*-*/model.safetensors` no son modelos completos y no funcionan con `mlx-lm` estándar; usarlos como modelo independiente produce fallos.
- El formato MLX limita el despliegue a hardware Apple Silicon o a entornos con soporte MLX; no es directamente compatible con CUDA.
- La lista de idiomas soportados no está detallada en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones del modelo base y su model card.
- El repositorio tiene un volumen de descargas bajo (55) y ningún like, lo que sugiere poca validación comunitaria de esta redistribución concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aquaduck/Qwen3.8-27B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Organización Aquaduck: https://huggingface.co/aquaduck
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
