# airagrp/Qwen3.8-27B-mlx-nvfp4-M

## Resumen

Este repositorio contiene una conversión a formato MLX del modelo multimodal `Qwen/Qwen3.8-27B`, desarrollado por Alibaba Qwen, utilizando una receta de cuantización mixta de precisión. La conversión ha sido realizada por el usuario `airagrp` y está pensada para ejecutarse eficientemente en hardware Apple Silicon mediante la librería `mlx-vlm` (versión 0.6.17). El modelo resultante ocupa aproximadamente 23 GB en disco, frente a los 54 GB del modelo original en bfloat16, lo que lo hace viable en equipos con memoria unificada de 32 GB o superior.

La relevancia de esta conversión radica en que combina dos técnicas de cuantización (nvfp4 para las capas de atención y MLP más sensibles, y mxfp8 para las capas de atención lineal GDN) para reducir el tamaño manteniendo una calidad aceptable. Además, incorpora la cabeza MTP (Multi-Token Prediction) del modelo original fusionada en el checkpoint, lo que permite usar decodificación especulativa sin necesidad de un modelo auxiliar separado. El modelo es multimodal (imagen, texto y vídeo) y está orientado a tareas de razonamiento, generación de código y automatización de oficina.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión + texto + vídeo) |
| Parametros totales | 9.665.208.048 (según safetensors) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nvfp4 (4 bits, group_size=16) y mxfp8 (8 bits, group_size=32) mixtos; bfloat16 para embeddings, head de salida, MTP y vision tower |
| Idiomas soportados | inglés (declarado en la model card; el modelo base es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso multimodal de última generación de la serie Qwen3.8, diseñado para tareas de razonamiento, codificación y automatización de oficina. Incluye un vision tower para procesamiento de imágenes y vídeo, y una cabeza MTP integrada que permite decodificación especulativa. La conversión aquí presentada no modifica la arquitectura, solo aplica una cuantización mixta: las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) de 16 capas y los MLP de las 64 capas se cuantizan a nvfp4 (4 bits), mientras que las capas de atención lineal GDN (48 capas) se cuantizan a mxfp8 (8 bits). Los embeddings, el head de salida, la cabeza MTP y el vision tower se mantienen en bfloat16. Esta receta busca equilibrar compresión y fidelidad, priorizando precisión en las capas más críticas.

No se dispone de información detallada sobre los datos de entrenamiento del modelo base, ni sobre si se aplicaron técnicas como RLHF o DPO. Para esos detalles, se remite a la model card original de `Qwen/Qwen3.8-27B`.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen, vídeo y texto para producir respuestas en lenguaje natural.
- Razonamiento y resolución de problemas: el modelo base está optimizado para tareas de razonamiento complejo y matemáticas.
- Generación de código y agentes: según el repositorio oficial de Qwen3.8-27B, destaca en tareas de codificación y flujos de trabajo agénticos.
- Decodificación especulativa con MTP: la cabeza MTP fusionada permite acelerar la inferencia mediante `--draft-kind mtp` en `mlx-vlm`.
- Automatización de oficina: capacidad para procesar documentos con imágenes, tablas y gráficos, generando resúmenes o extrayendo información.
- Soporte de tool calling: no confirmado en esta conversión, pero el modelo base lo incluye; se recomienda verificar en la documentación original.

## Casos de uso

- Procesamiento de documentos escaneados: el modelo puede extraer texto y datos de imágenes de documentos, facturas o formularios, y generar resúmenes estructurados. Su capacidad multimodal y su ventana de contexto (aunque no especificada) lo hacen adecuado para documentos largos.
- Análisis de vídeo en tiempo real o diferido: al soportar entrada de vídeo, puede describir escenas, transcribir diálogos o detectar eventos en grabaciones, útil para sistemas de vigilancia o revisión de contenido.
- Asistente de programación con capturas de pantalla: un desarrollador puede enviar una captura de un error o un diagrama de arquitectura y recibir sugerencias de código o explicaciones. La cuantización permite ejecutarlo en un MacBook Pro con 32 GB de RAM unificada.
- Automatización de tareas de oficina: generar informes a partir de presentaciones o gráficos, redactar correos basados en imágenes de reuniones, o convertir notas manuscritas en texto estructurado.
- Despliegue de chatbots locales en Apple Silicon: gracias a su tamaño reducido (23 GB) y al soporte nativo de MLX, puede integrarse en aplicaciones de escritorio o servicios locales sin depender de la nube, manteniendo la privacidad de los datos.
- Investigación en eficiencia de modelos: la receta de cuantización mixta (nvfp4 + mxfp8) sirve como caso de estudio para evaluar el impacto de diferentes precisiones en tareas multimodales, comparando con versiones en bfloat16 o FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de rendimiento, y los datos del modelo base no se reproducen aquí. Para evaluar la calidad, se recomienda consultar la model card original de `Qwen/Qwen3.8-27B` o ejecutar pruebas propias con `mlx-vlm`.

## Requisitos de hardware

- VRAM estimada: aproximadamente 23 GB en memoria unificada (según el tamaño efectivo del modelo). Es compatible con Macs con 32 GB o más de memoria unificada.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 32 GB de RAM unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, etc.). No es compatible con GPU NVIDIA o AMD sin usar MLX en CPU, lo cual sería muy lento.
- Opciones de despliegue: `mlx-vlm` (biblioteca de referencia), MLX directo con el layout estándar de safetensors, o integración en aplicaciones Python con `mlx-vlm.generate`.
- Latencia y throughput: no disponibles. Dependerá del chip concreto y de la longitud del contexto. La decodificación especulativa con MTP puede mejorar el throughput en generación larga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | ~27B (no confirmado) | no disponible | bfloat16 (54 GB) | Apache-2.0 | HuggingFace |
| airagrp/Qwen3.8-27B-mlx-nvfp4-M | 9.665.208.048 | no disponible | nvfp4 + mxfp8 (23 GB) | Apache-2.0 | HuggingFace |
| Otras conversiones MLX de Qwen3.8-27B | no disponible | no disponible | FP8, MLX | Apache-2.0 | HuggingFace (búsqueda) |

La comparación directa con otras conversiones MLX no está disponible en la información proporcionada. La principal diferencia frente al modelo original es el tamaño reducido (23 GB vs 54 GB) a costa de una posible pérdida de precisión por la cuantización. Frente a otras cuantizaciones (por ejemplo, FP8 uniforme), esta receta mixta busca mantener mayor fidelidad en las capas de atención y MLP.

## Limitaciones y advertencias

- La cuantización a nvfp4 (4 bits) en capas críticas puede degradar la calidad en tareas de razonamiento complejo o matemáticas, aunque la receta intenta mitigarlo manteniendo bfloat16 en embeddings y head de salida.
- El idioma declarado es solo inglés; aunque el modelo base es multilingüe, no se garantiza el rendimiento en otros idiomas en esta conversión.
- Requiere hardware Apple Silicon con MLX; no es desplegable en GPU CUDA o ROCm sin una conversión adicional.
- La longitud de contexto no está especificada en esta conversión; se debe verificar en el modelo base para evitar errores de truncamiento.
- La cabeza MTP está fusionada en el checkpoint, pero su uso es opcional; ignorarla no afecta a la inferencia base, pero si se usa con `--draft-kind mtp`, hay que asegurarse de que la versión de `mlx-vlm` la soporte.
- Al ser una conversión de terceros, no hay garantía de mantenimiento o soporte por parte de Alibaba Qwen.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base para posibles restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-nvfp4-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8 (incluye Qwen3.5, Qwen3.6 y Qwen3.8): https://github.com/QwenLM/Qwen3.8
- Documentación de `mlx-vlm`: https://github.com/Blaizzy/mlx-vlm
