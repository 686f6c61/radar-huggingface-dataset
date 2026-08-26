# horiuchinobuyuki/Qwick-3.5-9B-MLX-4bit

## Resumen

Qwick-3.5-9B-MLX-4bit es una cuantización en 4 bits del modelo Qwick-3.5-9B, un fine-tuning de Qwen3.5-9B orientado a reducir la longitud del razonamiento sin sacrificar calidad. El modelo original, desarrollado por horiuchinobuyuki, busca producir respuestas de razonamiento más concisas que el modelo base, manteniendo un rendimiento comparable en tareas de lógica y matemáticas. Esta versión MLX está específicamente diseñada para ejecutarse en Macs con Apple Silicon, ofreciendo una alternativa eficiente en memoria para usuarios que necesitan inferencia local de texto.

La cuantización utiliza un esquema affine de 4 bits con grupo de tamaño 64, lo que equivale a unos 4,5 bits por peso. El repositorio ocupa 5,1 GB y excluye la torre de visión del modelo original, limitándose a generación de texto. Aunque el modelo base está disponible en formatos adicionales (BF16 y 8-bit MLX), esta variante prioriza la eficiencia en memoria sobre la máxima fidelidad, siendo una opción atractiva para equipos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) |
| Parametros totales | 1.399.927.296 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, grupo 64 (~4,5 bits/peso) |
| Idiomas soportados | inglés, japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización MLX 4-bit del checkpoint BF16 `horiuchinobuyuki/Qwick-3.5-9B`, que a su vez es un fine-tuning de Qwen3.5-9B. El objetivo declarado es reducir la longitud del razonamiento generado por el modelo base, manteniendo una calidad comparable en tareas de razonamiento. No se proporcionan detalles sobre el dataset de entrenamiento, la técnica de fine-tuning (RLHF, DPO, etc.) ni el número de tokens utilizados. La conversión a MLX se realizó con `mlx-lm` 0.31.3, usando cuantización affine con grupo de tamaño 64.

## Capacidades

- Generación de texto en inglés y japonés.
- Razonamiento eficiente: genera respuestas de razonamiento más cortas que Qwen3.5-9B, manteniendo calidad comparable.
- Conversación multi-turno mediante chat template.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no documentadas.
- Capacidades de visión: no incluidas en esta versión MLX (solo texto).

## Casos de uso

- Asistente conversacional bilingüe: puede gestionar diálogos en inglés y japonés con un razonamiento más conciso, útil para aplicaciones de chat en entornos con Apple Silicon.
- Generación de explicaciones técnicas: responde preguntas sobre matemáticas, ciencias o programación con razonamiento paso a paso, pero más breve que el modelo base, ideal para documentación o soporte.
- Análisis de texto en japonés: gracias a su soporte de japonés, puede usarse para resumir o analizar documentos en este idioma en entornos locales.
- Prototipado rápido de aplicaciones de IA: al ser ligero (5,1 GB) y compatible con `mlx-lm`, permite iterar rápidamente en Macs sin necesidad de GPUs dedicadas.
- Tareas de razonamiento lógico en entornos con restricciones de memoria: la cuantización 4-bit reduce el uso de VRAM, permitiendo ejecución en equipos con poca memoria unificada.
- Integración en pipelines de generación de texto: puede usarse como generador de respuestas cortas y precisas en sistemas de automatización, aprovechando su licencia Apache-2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,1 GB (tamaño del repositorio), aunque el uso real puede variar según el contexto.
- GPU recomendadas: Macs con Apple Silicon (M1, M2, M3 o M4) con al menos 8 GB de memoria unificada para mayor holgura.
- Si cabe en consumer GPU: sí, en Macs con Apple Silicon; no es compatible con GPUs NVIDIA/AMD estándar.
- Opciones de despliegue: `mlx-lm` (CLI y Python), compatible con el ecosistema MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwick-3.5-9B-MLX-4bit | 1,4B (según safetensors) | 4-bit affine | no disponible | Apache-2.0 | MLX |
| Qwick-3.5-9B-MLX-8bit | no disponible | 8-bit | no disponible | Apache-2.0 | MLX |
| Qwick-3.5-9B (BF16) | no disponible | BF16 | no disponible | Apache-2.0 | HuggingFace |
| Qwen3.5-9B-MLX-4bit (mlx-community) | no disponible | 4-bit | no disponible | Apache-2.0 | MLX |

Nota: no hay datos públicos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de Qwen3.5-9B puede heredar sesgos del modelo base.
- Riesgo de alucinación: no mitigado específicamente; se recomienda verificar salidas en aplicaciones críticas.
- Limitaciones de contexto: la longitud de contexto no se especifica, por lo que no se conoce su capacidad para documentos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribución y citar el modelo base.
- Caveat para producción: la cuantización 4-bit puede degradar la calidad en tareas complejas; se recomienda evaluar con casos de uso específicos.
- Sin soporte de visión: la torre de visión no está incluida, por lo que no puede procesar imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B-MLX-4bit
- Modelo base: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B
- Variante 8-bit: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B-MLX-8bit
- Referencia de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Guía de Qwen 3.5 (2026): https://codersera.com/blog/qwen-3-5-complete-guide-2026/
