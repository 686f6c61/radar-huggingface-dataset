# airagrp/Ornith-1.5-35B-A3B-mlx-mxfp8

## Resumen

Ornith-1.5-35B-A3B es un modelo de mezcla de expertos (MoE) multimodal de la familia Ornith-1.5, desarrollado originalmente por ornith-ai. Este repositorio, creado por airagrp, contiene una conversión del modelo al formato MLX de Apple con una receta de cuantización mixta, optimizada para ejecutarse en Apple Silicon. El modelo base activa aproximadamente 3.000 millones de parámetros por token de los 35.950 millones totales, lo que permite un coste computacional bajo en comparación con modelos densos de tamaño similar.

La arquitectura combina atención plena en algunas capas con atención lineal GDN en otras, e incorpora de forma nativa un head de predicción multi-token (MTP) que puede usarse para decodificación especulativa. La conversión reduces el tamaño del checkpoint de ~67 GB en bfloat16 a ~39 GB mediante cuantización mxfp8 en los módulos de mayor coste, manteniendo los embeddings, la cabeza de salida y el MTP en bfloat16. Dado que el modelo es multimodal (procesa imagen y texto) y su licence es MIT, resulta relevante para aplicaciones de visión y lenguaje en entornos Apple sin necesidad de GPUs externas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (imagen-texto) basada en Qwen3.5, con atención plena en 10 capas y atención lineal GDN en 30 capas |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: mxfp8 (group_size=32, bits=8) en módulos MoE (router, expertos, atención), bfloat16 en embeddings, lm_head, MTP head y vision tower |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con mtp.safetensors separado para el MTP head |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE multimodal de 35.950 millones de parámetros con 3.000 millones activos por token. La arquitectura de atención es híbrida: combina atención plena (full attention) en 10 capas con atención lineal GDN en 30 capas, que reduce la complejidad del mecanismo de atención en la mayor parte del modelo. El repositorio de conversión incluye además un head MTP (multi-token prediction) como una capa MoE completa con 785 tensores, integrada en el checkpoint bajo el prefijo `language_model.mtp`. Este head permite decodificación especulativa mediante el flag `--draft-kind mtp` en mlx-vlm, sin necesidad de un modelo drafter externo.

Respecto al entrenamiento, los metadatos y la model card de la conversión no proporcionan datalles sobre el conjunto de datos, número de tokens de entrenamiento ni procesos de alineación como RLHF o DPO. La model card del modelo base indica que supera a Qwen 3.6-35B en benchmarks de código y agentes, así como a modelos densos como Gemma 4-31B y Muse Glimmer-30B, pero no se ofrecen cifras concretas en la información disponible. La receta de cuantización aplicada en esta conversión utiliza mxfp8 con grupo de 32 y 8 bits para los módulos MoE y de atención, mientras que embeddings, lm_head, MTP y vision tower se mantienen en bfloat16.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text), con una vision tower en bfloat16.
- Soporte de video según los metadatos (tag `video`), aunque no se detalla el formato de entrada en la información disponible.
- Razonamiento y ejecución de tareas de código destacadas en el modelo base, según la afirmación de superar a Qwen 3.6-35B en benchmarks de coding y agentic.
- Decodificación especulativa integrada mediante el MTP head, disponible para acelerar la generación en mlx-vlm.
- Uso directo desde MLX: los pesos cuantizados usan mxfp8 con group_size=32, y la distribución de precisiones se detecta automáticamente por la presencia de tensores `.scales`.
- Compatibilidad con mlx-vlm (versión 0.6.17) para cargar el modelo y generar respuestas con una API sencilla.
- Tool calling y function calling: no se confirma en la información proporcionada; se requiere consultar la model card original del modelo base para verificar esta capacidad.

## Casos de uso

- Asistente de visión en Apple Silicon: puede desplegarse en una Mac con MLX para responder preguntas sobre imágenes o documentos escaneados, aprovechando la ventana de contexto del modelo sin especificar (no disponible) y su capa de visión.
- Generación de código en entornos locales: dado el rendimiento declarado en benchmarks de coding, puede integrarse en editores o terminales para sugerencias y autocompletado, usando la API de MLX para inferencia en el propio dispositivo.
- Agentes autónomos de razonamiento multi-paso: el modelo base destaca en benchmarks "agentic", por lo que puede usarse para planificar y ejecutar tareas encadenadas, aunque no se confirma soporte nativo de tool calling en los metadatos de esta conversión.
- Investigación experimental de modelos VLM en macOS: sirve como banco de pruebas para estudiar el impacto de la cuantización mxfp8 en la calidad de respuestas multimodales, ya que se dispone de la versión bfloat16 original para comparar.
- Resumen y análisis de contenido visual: puede aplicarse a la generación de descripciones o resúmenes de imágenes, y potencialmente de clips de video según los tags, para uso en aplicaciones de accesibilidad o documentación.
- Aplicaciones con requisitos de privacidad: al ejecutarse localmente con MLX y no depender de servicios en la nube, es adecuado para entornos donde no se permite enviar datos a servidores externos, respaldado por la licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base afirma que Ornith-1.5-35B-A3B supera de forma significativa a su par de tamaño similar Qwen 3.6-35B en todos los benchmarks de código y agentes, y que aventaja a modelos densos como Gemma 4-31B y Muse Glimmer-30B, pero no se proporcionan cifras concretas. Por tanto, no es posible presentar una tabla comparativa con valores verificables.

## Requisitos de hardware

- Memoria unificada estimada: el checkpoint ocupa ~39 GB, por lo que se necesitan al menos 48 GB de RAM unificada en una Mac para cargar el modelo con margen para activaciones y KV cache; se recomiendan 64 GB o más para usos cómodos.
- GPU recomendadas: este formato es exclusivo de Apple Silicon (M1, M2, M3, M4); no puede ejecutarse en GPUs NVIDIA ni AMD mediante los repositorios estándar.
- Compatibilidad con GPUs de consumo: no disponible, ya que el formato MLX requiere chips Apple.
- Opciones de despliegue: integración directa con MLX y mlx-vlm (versión 0.6.17); la generación vía CLI mediante `mlx_vlm.generate` o desde Python con `mlx_vlm.load`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (MLX) | 35,95B | ~3B | no disponible | no disponible (el modelo base afirma superar a Qwen 3.6-35B en coding/agentes) | MIT |
| Qwen 3.6-35B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma 4-31B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los metadatos de HuggingFace indican únicamente inglés como idioma de entrada, por lo que el rendimiento en otros idiomas no está verificado.
- No se dispone de evaluaciones de seguridad ni de datos de sesgos específicos para esta conversión; es necesario consultar la model card original del modelo base.
- La cuantización mxfp8 implica una reducción de precisión con respecto al checkpoint bfloat16 original, lo que puede producir una degradación en tareas sensibles a errores numéricos.
- El modelo está diseñado para Apple Silicon y no puede ejecutarse en hardware convencional de NVIDIA y AMD con los repositorios estándar, lo que limita su portabilidad.
- El MTP head integrado aumenta el tamaño total del checkpoint y, aunque no afecta a la inferencia base, su presencia puede generar confusión si se usa como modelo drafter separado.
- Al ser un modelo reciente (creado el 2026-09-09), tiene un número de descargas y likes nulo, lo que indica una adopción mínima y poca validación de la comunidad.
- La licencia MIT permite uso comercial, pero se debe verificar que todos los componentes de dependencia, incluido el modelo base original, mantengan compatibilidad con los términos de uso.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/airagrp/Ornith-1.5-35B-A3B-mlx-mxfp8
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
