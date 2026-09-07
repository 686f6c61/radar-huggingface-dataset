# chriswessels/Qwen3.8-27B-Uncensored-oQ4e-mtp

## Resumen

El modelo `chriswessels/Qwen3.8-27B-Uncensored-oQ4e-mtp` es una cuantización 4-bit en formato MLX safetensors del modelo `orcarouter/Qwen3.8-27B-Uncensored`, publicada por chriswessels. El modelo base es una versión abliterada (con la dirección de rechazo eliminada) del `Qwen/Qwen3.8-27B`, un modelo denso de 27.8B parámetros con arquitectura híbrida (Gated DeltaNet + atención completa), visión-lenguaje nativa, contexto de 262K y cabezal MTP para decodificación especulativa. La cuantización se realizó con la herramienta oQ (oMLX v0.6.4) en precisión mixta. Este modelo es relevante para investigación en seguridad de IA, red-teaming y estudios de interpretabilidad, ya que carece de los guardarraíles del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration — 64 capas, hidden 5120, híbrido Gated DeltaNet (48 linear-attention + 16 full-attention, interval 4), torre VL nativa + cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262K |
| Tipos de cuantizacion | 4-bit (oQ mixed-precision, group size 64) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura es `Qwen3_5ForConditionalGeneration`, un modelo híbrido que combina 48 capas de atención lineal Gated DeltaNet con 16 capas de atención completa, distribuidas en 64 capas con un intervalo de 4. Incluye una torre de visión-lenguaje nativa y una cabeza MTP para decodificación especulativa. El modelo base fue desarrollado por Qwen y posteriormente modificado por OrcaRouter mediante abliteración, una técnica que ortogonaliza la dirección de rechazo en el stream residual para eliminar la negativa a responder. Finalmente, chriswessels aplicó cuantización de precisión mixta con oQ, usando 4 bits y un tamaño de grupo de 64. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso.
- Comprensión de imágenes y vídeos (modelo vision-language nativo).
- Soporte de tool calling / function calling.
- Control flexible de "thinking mode" (modo de pensamiento activable o desactivable).
- Decodificación especulativa mediante cabezal MTP.
- Capacidades multilingües en inglés y chino.
- Al estar abliterado, no aplica los rechazos de seguridad del modelo original.

## Casos de uso

- Red-teaming de sistemas de IA: generar prompts adversarios y solicitudes que el modelo original rechazaría, para evaluar la robustez de defensas externas.
- Estudio de mecanismos de rechazo y alineación: comparar las respuestas de este modelo con las del `Qwen3.8-27B` original para analizar cómo la abliteración altera el comportamiento.
- Investigación en interpretabilidad: analizar los cambios en el stream residual tras eliminar la dirección de rechazo y su efecto en la generación.
- Evaluación de robustez ante jailbreaks: probar si el modelo sin guardarraíles es más susceptible a técnicas de manipulación y medir la efectividad de filtros de moderación.
- Desarrollo de capas de moderación: usar el modelo como caso extremo para entrenar y validar sistemas de detección de contenido dañino.
- Investigación en visión-lenguaje desalineada: probar tareas de imagen-texto con un modelo que no tiene restricciones de seguridad, en entornos controlados y con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; al ser un modelo MLX, está optimizado para Apple Silicon (Mac con M1, M2, M3 o M4).
- Cabe en consumer GPU: no directamente, porque el formato MLX safetensors es específico de Apple Silicon; se requiere conversión a otros formatos para GPU convencionales.
- Opciones de despliegue: MLX en Apple Silicon; para otros entornos, se necesita convertir a GGUF u otros formatos (no disponible en la información).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Cuantización | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen/Qwen3.8-27B` | BF16 | Transformers | 262K | Apache 2.0 | HuggingFace |
| `orcarouter/Qwen3.8-27B-Uncensored` | BF16 | Transformers | 262K | Apache 2.0 | HuggingFace |
| `chriswessels/Qwen3.8-27B-Uncensored-oQ4e-mtp` | 4-bit (oQ) | MLX safetensors | 262K | Apache 2.0 | HuggingFace |

Rendimiento comparativo: no disponible.

## Limitaciones y advertencias

- El modelo ha tenido su alineación de seguridad eliminada de forma sustancial, por lo que cumplirá con solicitudes dañinas, ilegales o poco éticas que el modelo original rechazaría.
- No tiene guardarraíles integrados; no debe desplegarse a usuarios finales sin añadir capas propias de moderación y prevención de abuso.
- Riesgo de alucinación y generación de contenido incorrecto, como en cualquier modelo de lenguaje.
- Solo soporta inglés y chino; no hay soporte oficial para otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor y los uploaders no aceptan responsabilidad por el mal uso.
- Al ser una cuantización 4-bit, puede haber una pérdida de calidad respecto al modelo BF16 original.
- Está destinado estrictamente a investigación legítima: interpretabilidad, seguridad, red-teaming y evaluación de robustez.

## Enlaces

- https://huggingface.co/chriswessels/Qwen3.8-27B-Uncensored-oQ4e-mtp
- https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://github.com/jundot/omlx
- https://www.orcarouter.ai
