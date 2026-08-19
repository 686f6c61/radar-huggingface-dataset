# AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-2bit

## Resumen

AX-DeepSeek-V4-Flash-0731-MLX-AXQ-2bit es una cuantización experimental de 2 bits del modelo DeepSeek-V4-Flash-0731, desarrollada por AutomatosX mediante la herramienta AXQuant. El modelo original, publicado por DeepSeek en su revisión 0731 con precisión nativa FP8, se ha convertido al formato MLX para ejecutarse en hardware Apple Silicon. El resultado es un checkpoint de 37.667.336.279 parámetros totales que ocupa 122,3 GB en disco, con una precisión medida de 3,13 bits por peso (BPW) principal y 3,21 BPW total.

La relevancia de este lanzamiento es principalmente investigadora y de desarrollo: explora los límites de la cuantización extrema en arquitecturas grandes, aplicada a un modelo de generación de texto. No está certificado para uso en producción, y el propio autor lo etiqueta como "experimental" y "development". La conversión se realizó en un Apple M2 Ultra con 192 GB de memoria unificada, y la carga y generación básica con mlx-lm han pasado una prueba de humo, pero no se ha validado la suite completa de viabilidad de generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: DeepSeek-V4-Flash-0731) |
| Parametros totales | 37.667.336.279 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQuant 2-bit experimental (BPW medido: 3,13 principal, 3,21 total) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base DeepSeek-V4-Flash-0731 en la documentación proporcionada. Se sabe que el checkpoint original utilizaba precisión FP8 y que la conversión a MLX se realizó con AXQuant versión 1.8.1, empleando mlx 0.32.0 y mlx-lm 0.31.3 con un hook de carga FP8 y soporte para la arquitectura deepseek_v4. No se han publicado datos sobre el entrenamiento del modelo base, como número de tokens, composición del dataset o uso de técnicas de alineación (RLHF/DPO). La cuantización en sí no modifica la arquitectura, solo la representación de los pesos.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, por lo que el modelo puede producir texto autocompletado o continuar secuencias.
- No se especifican capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio en la información disponible.
- El soporte multilingüe no está documentado.
- Al ser una cuantización de 2 bits, la calidad de generación puede verse significativamente degradada respecto al modelo original en FP8.

## Casos de uso

- Investigación sobre cuantización extrema: permite estudiar el impacto de representaciones de 2 bits en la calidad de generación de un modelo de 37 mil millones de parámetros, comparando con cuantizaciones de mayor precisión.
- Desarrollo de pipelines de inferencia MLX en Apple Silicon: sirve como banco de pruebas para integrar checkpoints cuantizados con mlx-lm y AX Engine, evaluando estabilidad y rendimiento.
- Evaluación de degradación de calidad: útil para medir métricas de perplejidad o exactitud en tareas específicas antes y después de la cuantización agresiva.
- Prototipado rápido en hardware Apple con memoria unificada: permite probar si un modelo de este tamaño puede ejecutarse en equipos con 128 GB o más de RAM unificada, aunque con calidad reducida.
- Comparativa de técnicas de mixed-precision: al ser un pack de precisión mixta, puede usarse para analizar qué capas se ven más afectadas por la baja precisión.
- Experimentación con generación especulativa o aceleración MTP: aunque la aceleración MTP no está certificada en este checkpoint, puede servir para probar su viabilidad futura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint se convirtió en un Apple M2 Ultra con 192 GB de memoria unificada, lo que sugiere que se necesita al menos esa cantidad de RAM para cargar los pesos completos (el repositorio ocupa 122,3 GB).
- Está diseñado para Apple Silicon con soporte MLX; no se menciona compatibilidad con GPUs NVIDIA o AMD.
- Opciones de despliegue: mlx-lm (carga y generación verificadas) y AX Engine, aunque este último requiere la variable de entorno `AX_ENGINE_2BIT_EXPERIMENTAL=1` y aún no tiene un manifest válido.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de referencia es el modelo base DeepSeek-V4-Flash-0731 en su versión FP8, pero no se ofrecen métricas de rendimiento relativas.

## Limitaciones y advertencias

- Checkpoint experimental y de desarrollo: no está certificado para uso en producción.
- La cuantización de 2 bits es extremadamente agresiva y probablemente cause una degradación notable en la calidad de generación, con mayor riesgo de alucinaciones y errores.
- El checkpoint Tier 1 (suite de viabilidad de generación) no está certificado en este registro.
- El manifest nativo de AX Engine no se generó correctamente debido a un problema con la división de las capas `switch_mlp.gate_proj` y `up_proj`, lo que impide su uso con AX Engine sin una corrección futura.
- La aceleración MTP (multi-token prediction) no está certificada.
- No se han documentado sesgos específicos ni limitaciones de idioma, pero al ser una versión cuantizada, las capacidades multilingües del modelo base podrían verse afectadas.
- La licencia MIT permite uso comercial, pero el estado experimental del modelo desaconseja su empleo en entornos productivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-2bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Pack anterior (no confundir con esta revisión): https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-MLX-AXQ-2bit
