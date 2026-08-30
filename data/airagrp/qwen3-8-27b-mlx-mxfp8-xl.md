# airagrp/Qwen3.8-27B-mlx-mxfp8-XL

## Resumen

El repositorio `airagrp/Qwen3.8-27B-mlx-mxfp8-XL` contiene una conversión del modelo multimodal `Qwen/Qwen3.8-27B` al formato MLX de Apple, con una receta de cuantización mixta en precisión mxfp8. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un modelo denso de 27 000 millones de parámetros (aunque el checkpoint cuantizado aquí almacena 15 385 411 248 parámetros) que combina visión y texto, orientado a tareas de codificación, flujos de trabajo agénticos y automatización de ofimática. Esta conversión reduce el tamaño de 54 GB (bfloat16) a unos 39 GB efectivos, manteniendo las capas de atención y el vision tower en bfloat16 y cuantizando únicamente los MLP a mxfp8 con grupo de 32. Incluye además el head MTP nativo fusionado para decodificación especulativa. Es relevante porque permite ejecutar un modelo multimodal de 27B en hardware Apple Silicon con requisitos de memoria reducidos, manteniendo la calidad de las capas críticas de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + texto) con atención lineal GDN y head MTP para decodificación especulativa |
| Parametros totales | 15 385 411 248 (checkpoint cuantizado; el modelo base declara 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp8 (group_size=32, bits=8) en MLP; bfloat16 en atención, embeddings, head y vision tower |
| Idiomas soportados | inglés (según model card; el modelo base puede ser multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal denso que procesa entradas de imagen, video y texto. La conversión MLX aplica una cuantización mixta: los MLP (`gate_proj`, `up_proj`, `down_proj`) de las 64 capas se cuantizan a mxfp8 con grupo de 32, mientras que las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) de 16 capas se mantienen en bfloat16, así como las capas de atención lineal GDN (48 capas), los embeddings, el head de salida y el vision tower. El head MTP (Multi-Token Prediction) está fusionado en el checkpoint como tensores independientes (`language_model.mtp.*`) y puede usarse para decodificación especulativa con `--draft-kind mtp` en mlx-vlm. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO) del modelo original en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multilingüe (aunque la model card declara inglés, el modelo base de Qwen soporta múltiples idiomas).
- Comprensión de imágenes y video (pipeline `image-text-to-text`), con vision tower en bfloat16.
- Codificación de software y automatización de ofimática, según la descripción oficial del modelo base.
- Flujos de trabajo agénticos y uso de herramientas a largo plazo (mencionado en la documentación de Groq para Qwen3.8-27B).
- Decodificación especulativa mediante el head MTP integrado, que acelera la inferencia sin necesidad de un modelo drafter separado.
- Modo thinking e instruct, según la documentación de Groq para el modelo base.

## Casos de uso

- Asistente de programación en local: el modelo puede generar, explicar y depurar código en varios lenguajes, ejecutándose en Apple Silicon con MLX gracias a la cuantización mxfp8 que reduce la huella de memoria a ~39 GB.
- Automatización de documentos de oficina: procesa entradas de imagen (capturas de pantalla, diagramas) y texto para redactar informes, resumir correos o extraer datos de tablas, aprovechando su capacidad multimodal.
- Análisis de imágenes y video en entornos sin GPU NVIDIA: al ser MLX, se ejecuta en Mac con Metal, permitiendo tareas de visión por computadora en hardware de consumo.
- Agente conversacional con razonamiento multi-paso: el modo thinking y el soporte para tool calling permiten construir agentes que planifican y ejecutan acciones con contexto largo.
- Decodificación especulativa para servidores de inferencia: el head MTP integrado acelera la generación en entornos de producción que usan mlx-vlm, reduciendo la latencia por token.
- Investigación y experimentación con cuantización mixta: sirve como referencia para estudiar el impacto de cuantizar solo los MLP en modelos multimodales, comparando calidad frente a versiones bfloat16 completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite a la card original de `Qwen/Qwen3.8-27B` para datos de rendimiento, pero no se incluyen cifras concretas en este fichero.

## Requisitos de hardware

- El checkpoint efectivo ocupa ~39 GB (11.2 bits por peso), por lo que se recomienda al menos 48 GB de memoria unificada en Apple Silicon (Mac Studio M1 Ultra/M2 Ultra/M3 Ultra) para cargar el modelo completo en RAM.
- En GPU NVIDIA, al ser formato MLX no se puede ejecutar directamente; sería necesario convertir a otro formato (por ejemplo, GGUF o safetensors para vLLM). No se proporcionan requisitos de VRAM para ese caso.
- En Mac con MLX, la inferencia se acelera mediante Metal; para un modelo de 27B cuantizado, se espera una latencia de varios tokens por segundo, aunque no se dan cifras concretas.
- Opciones de despliegue: mlx-vlm (CLI y Python), MLX directo con carga de safetensors, y posibilidad de usar el head MTP con `--draft-kind mtp` para decodificación especulativa.
- No se menciona compatibilidad con llama.cpp, Ollama o TGI en esta conversión específica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| airagrp/Qwen3.8-27B-mlx-mxfp8-XL | 15.4B (checkpoint) | no disponible | MLX safetensors | Apache-2.0 | Cuantización mixta mxfp8, incluye MTP |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | bfloat16 | Apache-2.0 | Modelo original sin cuantizar, ~54 GB |
| mlx-community/Qwen3.8-27B-mxfp8 | no disponible | 16k (según tags) | MLX safetensors | Apache-2.0 | Conversión comunitaria con cuantización uniforme mxfp8 |

La comparativa se limita a las variantes del mismo modelo base; no se dispone de datos para comparar con otros modelos multimodales de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint cuantizado reduce el tamaño pero puede introducir degradación en tareas que dependen de los MLP; las capas de atención se mantienen en bfloat16 para mitigar el impacto.
- El contexto máximo no está especificado en esta conversión; se recomienda consultar la card del modelo base.
- La model card declara solo inglés, aunque el modelo base de Qwen es multilingüe; puede haber diferencias de calidad en otros idiomas.
- Al ser un formato MLX, no es directamente compatible con frameworks comunes como vLLM o TGI; requiere conversión adicional para entornos con GPU NVIDIA.
- No se han publicado benchmarks específicos de esta conversión, por lo que el rendimiento real debe validarse en el caso de uso concreto.
- El head MTP fusionado es opcional; si se ignora, la inferencia base no se ve afectada, pero no se aprovecha la aceleración por decodificación especulativa.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales en su card original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-mxfp8-XL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- mlx-vlm (librería de conversión e inferencia): https://github.com/Blaizzy/mlx-vlm
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de Qwen3.8-27B en Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Conversión comunitaria similar: https://huggingface.co/mlx-community/Qwen3.8-27B-mxfp8
