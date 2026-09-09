# hariharanv04/Qwen3.8-27B-mlx-2Bit

## Resumen

El modelo `hariharanv04/Qwen3.8-27B-mlx-2Bit` es una conversión al formato MLX, cuantizada a 2 bits, del modelo `Qwen/Qwen3.8-27B`, desarrollada por el usuario `hariharanv04`. El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros creado por Alibaba Qwen, construido sobre la base arquitectónica de Qwen3.5. Se trata de un modelo nativo de visión-lenguaje que procesa texto, imágenes y vídeos, con capacidades de razonamiento multimodal, control de pensamiento configurable, tool calling y tareas de agente de múltiples pasos. Esta versión cuantizada reduce el peso del modelo a 8,4 GB, lo que permite ejecutarlo en equipos Apple Silicon con memoria unificada moderada. Resulta relevante para desarrolladores e investigadores que necesitan explorar las capacidades de un modelo multimodal de 27B sin necesidad de GPUs de servidor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de visión-lenguaje (basado en Qwen3.5) |
| Parametros totales | 26.895.993.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (se indica soporte de contexto largo, sin especificar el número) |
| Tipos de cuantizacion | 2 bits (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo presentado es una conversión al formato MLX (Apple Silicon) del modelo base Qwen/Qwen3.8-27B, realizada con la librería mlx-lm en su versión 0.31.2. El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros, perteneciente a la familia Qwen3.8, construido sobre la base arquitectónica de Qwen3.5. Se trata de un modelo nativo de visión-lenguaje que procesa texto, imágenes y vídeos, con control de profundidad de pensamiento configurable. No se dispone de información detallada sobre los datos de entrenamiento ni sobre técnicas de ajuste como RLHF o DPO en la información proporcionada. La conversión a MLX 2-bit reduce el tamaño de los pesos a 8,4 GB, lo que facilita la ejecución en hardware de Apple. No se han documentado innovaciones técnicas adicionales en la conversión.

## Capacidades

- Comprensión de texto, imágenes y vídeos de forma nativa (modelo multimodal).
- Razonamiento multimodal para tareas que combinan información visual y textual.
- Control de profundidad de pensamiento configurable (modo de razonamiento flexible).
- Generación de código y soporte para flujos de trabajo de programación profesionales.
- Capacidad de tool calling / function calling para integración con APIs y herramientas externas.
- Diseñado para tareas de agente de múltiples pasos (multi-step agentic tasks).
- Procesamiento de contexto largo, apto para documentación extensa o interacciones prolongadas.
- Nota: la cuantización a 2 bits puede degradar la calidad de estas capacidades en comparación con el modelo original.

## Casos de uso

1. **Análisis de imágenes en equipos Apple Silicon**: gracias a su naturaleza multimodal, puede describir o extraer información de imágenes; al estar cuantizado a 2 bits, es viable en Macs con memoria unificada moderada.

2. **Asistentes de agentes en pipelines de investigación**: soporta tool calling y razonamiento multi-paso, por lo que puede actuar como planificador en workflows automatizados que requieren encadenar llamadas a herramientas.

3. **Generación de código en entornos con restricciones de VRAM**: por ejemplo, en un Mac Studio, puede completar bloques de código o sugerir soluciones sin necesidad de una GPU dedicada.

4. **Recuperación de contenido en catálogos multimedia**: al entender vídeos, permite indexar y buscar escenas o descripciones en bases de datos de vídeo.

5. **Atención al cliente con soporte visual**: los usuarios pueden adjuntar capturas de pantalla y el modelo puede procesarlas para diagnosticar incidencias; la versión MLX permite desplegarlo en servidores propios con hardware Apple.

6. **Análisis de documentos técnicos con diagramas**: combinando visión y texto, puede interpretar gráficos, esquemas y tablas en informes de ingeniería o investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Espacio en disco: 8,4 GB para los pesos del modelo.
- Ejecución en Apple Silicon (M1 o posterior) con memoria unificada; se recomienda al menos 16 GB de RAM para cargar el modelo con margen.
- Inferencia mediante mlx-lm (versión 0.31.2 o compatible), tanto desde línea de comandos como desde Python.
- No es directamente compatible con GPUs NVIDIA; para despliegue en GPU se debe utilizar el modelo original sin cuantizar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 26.895.993.856 | No disponible | Apache 2.0 | safetensors |
| Qwen3.8-27B-mlx-2Bit (este repo) | 26.895.993.856 | No disponible | Apache 2.0 | safetensors (MLX) |

No se dispone de información sobre otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits introduce pérdida de precisión, lo que puede aumentar la tasa de errores y alucinaciones en comparación con el modelo original.
- No se han publicado benchmarks ni evaluaciones de calidad específicas para esta conversión.
- Los idiomas soportados no están especificados en la información disponible.
- El repositorio es una conversión de terceros no oficial, sin garantías de mantenimiento ni soporte.
- El modelo base puede heredar sesgos y riesgo de alucinación inherentes a los grandes modelos de lenguaje; se recomienda validar su salida antes de usar en producción.
- La licencia Apache 2.0 permite uso comercial, pero se aconseja revisar la documentación oficial del modelo base para verificar condiciones adicionales.

## Enlaces

- https://huggingface.co/hariharanv04/Qwen3.8-27B-mlx-2Bit
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
