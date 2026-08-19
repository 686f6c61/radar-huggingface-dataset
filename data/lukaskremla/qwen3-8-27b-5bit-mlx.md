# lukaskremla/Qwen3.8-27B-5bit-MLX

## Resumen

Qwen3.8-27B-5bit-MLX es una conversión completa al formato MLX del modelo multimodal Qwen3.8-27B de Alibaba, realizada por el usuario lukaskremla. A diferencia de las conversiones de solo texto, este repositorio conserva la torre de visión original y los procesadores de imagen y vídeo, lo que permite procesar entradas de texto, imagen y vídeo mediante la librería `mlx-vlm`. El modelo está cuantizado a 5 bits con cuantización afín por grupos de tamaño 64, manteniendo la torre de visión en BF16.

La relevancia de este modelo radica en que permite ejecutar un modelo de visión-lenguaje de gran tamaño en hardware Apple Silicon con un consumo de memoria reducido, manteniendo la compatibilidad con el ecosistema MLX. Está pensado para desarrolladores que necesitan desplegar asistentes multimodales locales, con soporte para razonamiento, tool-use y contexto largo, todo bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con torre de visión |
| Parametros totales | 5.505.879.280 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit afín (group size 64, RTN); torre de visión en BF16 |
| Idiomas soportados | en (modelo base multilingüe según tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que combina un codificador de visión con un modelo de lenguaje. La conversión MLX mantiene la arquitectura original, incluyendo la torre de visión en BF16, mientras que los pesos lineales del modelo de lenguaje se cuantizan a 5 bits mediante cuantización afín con round-to-nearest (RTN) y un tamaño de grupo de 64. El drafter MTP (multi-token prediction) no se incluye en el checkpoint principal, pero está disponible como sidecar en la colección asociada, permitiendo decodificación especulativa para acelerar la generación.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada. La cuantización se realizó con `mlx-vlm 0.6.13` y `mlx 0.32.0`.

## Capacidades

- Procesamiento multimodal: acepta texto, imágenes y vídeo como entrada.
- Generación de texto conversacional con soporte para razonamiento multi-paso.
- Soporte de tool calling / function calling (según tags del modelo base).
- Capacidades multilingües del modelo base, aunque la model card solo especifica inglés.
- Soporte de decodificación especulativa mediante MTP (multi-token prediction) con drafter opcional.
- Integración con servidor OpenAI-compatible a través de `mlx_vlm.server`.

## Casos de uso

- Asistente multimodal local en Apple Silicon: el modelo puede responder preguntas sobre imágenes o vídeos sin conexión a internet, ideal para entornos con requisitos de privacidad.
- Análisis de documentos visuales: extracción de información de capturas, diagramas o fotografías en aplicaciones de productividad.
- Automatización de soporte técnico: uso de tool calling para interactuar con APIs y resolver incidencias de forma autónoma.
- Generación de descripciones accesibles: creación de alternativas textuales para contenido visual en plataformas web.
- Prototipado de agentes multimodales: combinación de razonamiento y visión para tareas de navegación o inspección visual.
- Despliegue en entornos con memoria limitada: la cuantización 5-bit permite ejecutar el modelo en Macs con 32 GB o más de RAM unificada, manteniendo la calidad aceptable para tareas de producción ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El formato MLX está optimizado para Apple Silicon (M1, M2, M3, M4 y superiores).
- El tamaño del repositorio es de 19.4 GB, lo que sugiere que la inferencia requiere al menos 20 GB de RAM unificada, recomendándose 32 GB o más para mayor holgura.
- La torre de visión en BF16 incrementa el uso de memoria frente a conversiones de solo texto.
- Para decodificación especulativa con MTP, se necesita cargar además el drafter (disponible en BF16 o cuantizado).
- Despliegue mediante `mlx-vlm` (servidor OpenAI-compatible) o integración directa con la librería `mlx`.
- No es compatible con GPUs NVIDIA o AMD; requiere hardware Apple.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos multimodales en MLX en la información proporcionada. El modelo base Qwen3.8-27B pertenece a la familia Qwen, pero no se especifican alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 5 bits puede degradar la fidelidad del modelo frente a la versión BF16, especialmente en tareas de razonamiento complejo.
- La model card solo declara inglés como idioma, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está garantizado.
- El modelo no incluye el drafter MTP en el checkpoint principal; es necesario descargar un sidecar adicional para decodificación especulativa.
- Requiere hardware Apple Silicon; no es desplegable en infraestructura GPU convencional sin conversión adicional.
- Al ser una conversión de terceros, no hay garantía de paridad exacta con el modelo base original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen.

## Enlaces

- Repositorio HuggingFace: [lukaskremla/Qwen3.8-27B-5bit-MLX](https://huggingface.co/lukaskremla/Qwen3.8-27B-5bit-MLX)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Colección de cuantizaciones MLX: [Qwen 3.8 27B MLX-Quants](https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp-6a7f4a32aee1afa13a6a4661)
