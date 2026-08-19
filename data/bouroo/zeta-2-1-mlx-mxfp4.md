# bouroo/zeta-2.1-mlx-mxfp4

## Resumen

El modelo `bouroo/zeta-2.1-mlx-mxfp4` es una cuantización nativa en formato MXFP4 (4 bits) del modelo `zed-industries/zeta-2.1`, un modelo de edición de código (edit-prediction) y autocompletado desarrollado por Zed Industries. Zeta 2.1 está finetuneado a partir de `ByteDance-Seed/Seed-Coder-8B-Base` y utiliza un formato de prompt de tipo SPM con múltiples marcadores FIM (fill-in-the-middle), pensado para sugerir la siguiente edición en el código en lugar de completar simplemente el texto.

Esta variante ha sido creada por el usuario `bouroo` para ejecutarse en Apple Silicon mediante la librería MLX, con un tamaño en disco de aproximadamente 4,1 GB. Según los datos de los safetensors, el modelo tiene 1.547.177.984 parámetros, aunque la model card del autor indica que el modelo base es de 8B, lo que sugiere una posible discrepancia entre el número de parámetros reportado y el real de los archivos. La cuantización MXFP4 uniforme presenta una degradación notable en la calidad del prompt FIM canónico, llegando a repetir tokens en pruebas locales, por lo que el autor recomienda usar la variante MXFP8 o el modelo bf16 original para tareas de edición de código fiables.

El modelo se distribuye bajo licencia Apache-2.0 y está pensado para integración en editores de código, herramientas de autocompletado y experimentación con FIM en entornos Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado de Seed-Coder-8B-Base, presumiblemente transformer decoder) |
| Parametros totales | 1.547.177.984 (según safetensors; la model card menciona 8B para el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, grupo de 32, 4.250 BPW) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `zeta-2.1` es un modelo de edición de código finetuneado a partir de `ByteDance-Seed/Seed-Coder-8B-Base`. No se proporcionan detalles sobre la arquitectura interna (número de capas, dimensiones, atención, etc.) ni sobre el proceso de entrenamiento (número de tokens, dataset, técnicas de alineación). Lo que sí se sabe es que utiliza un formato de prompt específico para predicción de ediciones, con múltiples marcadores (`<|marker_1|>`, `<|marker_2|>`) y secciones de prefijo, sufijo y nombre de archivo. Este formato no es un chat template, sino un esquema FIM adaptado a la tarea de sugerir la siguiente modificación en el código.

La cuantización MXFP4 aplicada por `bouroo` convierte todos los pesos lineales elegibles a un formato de punto flotante en bloque de 4 bits, soportado por MLX en Apple Silicon. El autor indica que la cuantización es uniforme y que, en pruebas locales con `mlx_lm`, el modelo carga y ejecuta, pero el prompt FIM canónico a veces colapsa en repeticiones de tokens. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Edición de código predictiva: dado un contexto de código antes y después del cursor, el modelo genera la siguiente edición o modificación sugerida.
- Autocompletado de código: puede completar fragmentos de código en formato FIM (prefijo-sufijo).
- Soporte de múltiples marcadores: el formato de prompt incluye dos marcadores que permiten indicar la posición de la edición.
- Generación de texto técnico: al estar entrenado sobre código, puede generar funciones, correcciones y refactorizaciones simples.
- No soporta chat ni conversación multi-turno: no tiene template de chat.
- No soporta tool calling ni funciones externas.
- No tiene capacidades multimodales (solo texto).
- Multilingüe limitado: entrenado principalmente en inglés, aunque el código fuente puede contener identificadores en otros idiomas.

## Casos de uso

- Autocompletado en editores de código: el modelo puede integrarse en editores como VS Code o Zed mediante un cliente que construya el prompt FIM. Es adecuado para sugerir completaciones de líneas o bloques de código en tiempo real, aunque la calidad puede verse afectada por la cuantización MXFP4.
- Sugerencia de siguiente edición en un IDE: gracias a su formato de edición predictiva, puede proponer la próxima modificación lógica en un archivo, como añadir una validación, corregir un error o completar una función. Se recomienda usar la variante bf16 o MXFP8 para esta tarea.
- Experimentación con FIM en Apple Silicon: para desarrolladores que investigan técnicas de fill-in-the-middle, este modelo ofrece una implementación ligera (4,1 GB) que se puede ejecutar localmente en un Mac con MLX.
- Generación de código en entornos sin conexión: al ser un modelo local, puede usarse en entornos aislados o con restricciones de red para generar fragmentos de código, aunque su limitación a inglés y su enfoque en edición lo hacen menos versátil que modelos de propósito general.
- Integración en herramientas de línea de comandos: mediante `mlx_lm` o LM Studio, se puede crear un script que reciba un archivo y una posición del cursor y devuelva una sugerencia de edición, útil para automatizar tareas de refactorización.
- Prototipado de asistentes de código para hardware Apple: dado que MLX está optimizado para Apple Silicon, este modelo sirve como base para probar la viabilidad de asistentes de código locales en Mac, midiendo latencia y consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y no se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (M1, M2, M3, M4 y superiores) con la librería MLX.
- Tamaño en disco: 4,1 GB. La VRAM estimada para inferencia es similar, ya que los pesos se cargan en memoria unificada. Se recomienda un Mac con al menos 8 GB de RAM unificada para ejecutar el modelo cómodamente.
- GPU recomendada: cualquier GPU integrada en Apple Silicon (por ejemplo, M1 Pro, M2 Max, M3 Ultra). No se requiere GPU dedicada.
- Opciones de despliegue: `mlx_lm` (librería Python), LM Studio (con soporte MLX), o un cliente personalizado que use la API de MLX.
- Latencia y throughput: no se proporcionan datos concretos. En pruebas locales del autor, el modelo cargó y ejecutó, pero no se reportan tiempos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de edición de código o autocompletado. El modelo base `zeta-2.1` podría compararse con CodeLlama, StarCoder2 o DeepSeek-Coder, pero no hay datos de rendimiento ni de especificaciones detalladas de estos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La cuantización MXFP4 uniforme degrada la calidad del prompt FIM canónico: en pruebas locales, el modelo a veces genera repeticiones de tokens como `<|marker_1|>`. Para tareas de edición de código fiables, se recomienda usar la variante MXFP8 o el modelo bf16 original.
- El modelo solo soporta el idioma inglés, lo que limita su uso en entornos multilingües.
- No tiene template de chat: no se puede usar para conversaciones o instrucciones generales.
- Riesgo de alucinación en código: como cualquier modelo generativo, puede producir código sintácticamente válido pero lógicamente incorrecto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales derivadas de Seed-Coder-8B-Base; se recomienda revisar la licencia de ese modelo.
- No se garantiza la estabilidad del formato de prompt: el esquema de múltiples marcadores puede cambiar en futuras versiones del modelo base.
- El tamaño del repositorio (4,4 GB) y el número de parámetros reportado (1,5B) son inconsistentes con la afirmación de que el modelo base es de 8B; esto puede indicar que la cuantización no preserva todos los pesos o que hay un error en la metadata.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/bouroo/zeta-2.1-mlx-mxfp4)
- [Modelo base zed-industries/zeta-2.1](https://huggingface.co/zed-industries/zeta-2.1)
- [Colección de cuantizaciones Zeta de bouroo](https://huggingface.co/collections/bouroo/zeta)
- [Variante OptiQ-6](https://huggingface.co/bouroo/zeta-2.1-OptiQ-6)
- [Repositorio de ejemplo de cliente FIM (en el modelo)](https://huggingface.co/bouroo/zeta-2.1-mlx-mxfp4/blob/main/examples/zeta_fim.py)
