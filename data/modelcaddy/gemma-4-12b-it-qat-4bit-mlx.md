# modelcaddy/gemma-4-12b-it-qat-4bit-mlx

## Resumen

`modelcaddy/gemma-4-12b-it-qat-4bit-mlx` es una conversión a MLX (Apple Silicon) del checkpoint cuantizado con entrenamiento consciente de cuantización (QAT) de Google, `google/gemma-4-12B-it-qat-q4_0-unquantized`. El modelo original, Gemma 4 12B, es un modelo de lenguaje y visión (VLM) de 12.330 millones de parámetros, con arquitectura densa y una ventana de contexto de hasta 256.000 tokens, desarrollado por Google DeepMind. Esta versión MLX aplica cuantización uniforme de 4 bits con grupo de 64, logrando un peso efectivo de 4,51 bits por parámetro y un tamaño en disco de aproximadamente 6,3 GB, lo que lo hace adecuado para inferencia local en dispositivos Apple Silicon.

El modelo está pensado para su uso como generador en el nivel Pro de ModelCaddy, una herramienta que extrae conversaciones locales y sintetiza memoria en el dispositivo. Al ser una conversión QAT, la calidad se mantiene incluso con cuantización uniforme de 4 bits, sin capas retenidas a mayor precisión. Requiere `mlx-vlm` >= 0.6.x y está disponible bajo la licencia Gemma Terms of Use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4, VLM) |
| Parametros totales | 12.330 millones (12,33B) reales; el Hub muestra 1,88B por empaquetado MLX (ver nota) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens (según documentación de Gemma 4) |
| Tipos de cuantizacion | 4-bit uniforme afín, grupo de 64 (QAT) |
| Idiomas soportados | Más de 140 idiomas (según documentación de Gemma 4) |
| Licencia | Gemma Terms of Use (con Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (MLX) |

Nota: el contador de parámetros de HuggingFace muestra 1.876.642.864 elementos almacenados porque MLX empaqueta ocho pesos de 4 bits en un U32. El modelo real tiene 12,33B parámetros (1,49B × 8 + 0,38B de escalas de cuantización en BF16).

## Arquitectura y entrenamiento

El modelo base, Gemma 4 12B, es un transformer denso con capacidades multimodales (texto e imagen) y soporte nativo para el rol de sistema. Según la documentación de Google, todos los modelos Gemma 4 incluyen un modelo draft dedicado para decodificación especulativa, lo que acelera la inferencia sin pérdida de calidad. El entrenamiento original de Gemma 4 no está detallado en la información disponible, pero se sabe que Google aplica técnicas de alineación y ajuste instructivo; no se confirma si se usó RLHF o DPO.

La conversión MLX se realizó con `mlx_vlm.convert -q --q-bits 4 --q-group-size 64` (mlx-vlm 0.6.13, mlx 0.32.0). El checkpoint QAT de Google ya está entrenado para soportar cuantización uniforme de 4 bits, por lo que no se retiene ninguna capa a mayor precisión. El resultado es un modelo de 4,51 bits efectivos por peso, con un tamaño de ~6,3 GB en disco.

## Capacidades

- Generación de texto conversacional e instructivo, con soporte para el rol de sistema.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Generación y comprensión de código en múltiples lenguajes de programación.
- Capacidades multimodales: procesamiento de imágenes (VLM), aunque esta conversión MLX está orientada a texto.
- Soporte multilingüe en más de 140 idiomas.
- Decodificación especulativa mediante modelo draft (en el modelo original; no se confirma si la conversión MLX la conserva).
- Adecuado para tareas de extracción y síntesis de información local (caso de uso de ModelCaddy).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens), ideal para chatbots de soporte que necesitan recordar el historial completo de una sesión.
- Generación de código en producción: con capacidades de razonamiento y generación de código, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código, ejecutándose localmente en Apple Silicon.
- Asistente personal local: al ser una conversión MLX, puede ejecutarse en Mac con Apple Silicon sin conexión, ofreciendo respuestas a preguntas, resúmenes y redacción de documentos con privacidad total.
- Análisis de documentos extensos: gracias a su ventana de contexto de 256K tokens, puede procesar libros, informes o contratos completos y extraer conclusiones o resúmenes.
- Extracción y síntesis de memoria conversacional: es el caso de uso original de ModelCaddy, donde el modelo resume conversaciones locales para generar memoria persistente en el dispositivo.
- Traducción y transcripción multilingüe: con soporte para más de 140 idiomas, puede traducir textos o transcribir y resumir audio (si se combina con un sistema de ASR externo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX en la información disponible. Los benchmarks del modelo original Gemma 4 12B (MMLU, HumanEval, GSM8K, etc.) no están incluidos en los datos proporcionados. Se recomienda consultar la documentación oficial de Google para obtener métricas comparativas.

## Requisitos de hardware

- Apple Silicon (M1 o posterior) con al menos 8 GB de memoria unificada; se recomienda 16 GB para un uso fluido con contexto largo.
- El modelo ocupa ~6,3 GB en disco, por lo que cabe en la mayoría de los Mac actuales.
- Requiere `mlx-vlm` >= 0.6.x y `mlx` >= 0.32.0.
- Despliegue mediante `python -m mlx_vlm generate --model modelcaddy/gemma-4-12b-it-qat-4bit-mlx --prompt "..." --max-tokens 256`.
- No es compatible con GPUs NVIDIA o AMD; está limitado a Apple Silicon.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otras conversiones MLX de modelos de 12B. Como referencia cualitativa, se puede comparar con otros tamaños de Gemma 4:

| Modelo | Parametros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| Gemma 4 12B (este) | 12,33B | 256K | Denso | Gemma |
| Gemma 4 E2B | ~2B | 256K | Denso | Gemma |
| Gemma 4 E4B | ~4B | 256K | Denso | Gemma |
| Gemma 4 26B A4B | 26B (4B activos) | 256K | MoE | Gemma |
| Gemma 4 31B | 31B | 256K | Denso | Gemma |

La comparación con modelos de otros fabricantes (Llama 3.1 8B, Mistral 7B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o sesgado; no se han publicado evaluaciones específicas de seguridad para esta conversión.
- Restricciones de licencia: el uso está sujeto a la Gemma Terms of Use y a la Gemma Prohibited Use Policy, que prohíben usos militares, vigilancia masiva y otras aplicaciones restringidas.
- Limitación de plataforma: solo funciona en Apple Silicon; no es portable a otros entornos sin reconversión.
- La cuantización de 4 bits puede degradar ligeramente la calidad en tareas muy específicas, aunque el QAT mitiga este efecto.
- El contador de parámetros del Hub puede inducir a error (muestra ~2B en lugar de 12,33B); es importante tener en cuenta esta discrepancia al evaluar el modelo.
- No se garantiza el soporte de decodificación especulativa en esta conversión MLX, aunque el modelo original la incluye.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/modelcaddy/gemma-4-12b-it-qat-4bit-mlx
- Checkpoint base (QAT): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Modelo original Gemma 4 12B: https://huggingface.co/google/gemma-4-12B
- Documentación oficial de Gemma 4: https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Repositorio de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Guía de Gemma 4 12B (tercera parte): https://gemmai4.com/gemma4-12b/
