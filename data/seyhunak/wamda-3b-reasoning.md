# seyhunak/Wamda-3B-Reasoning

`.
- Entrenado en un Mac con MLX, diseñado para ejecutarse en un portátil.
- Resultados: eval de 15 preguntas en árabe, greedy decoding, substring match en la respuesta final, 2026-09-05:
  - Qwen2.5-3B-Instruct (base): 11/15 = 73.3%
  - Wamda-3B (LoRA, 600 iters): 13/15 = 86.7%
- Gains vs base: 3-pill trap (1 hour, not 1.5), boxes word problem (18 SAR), age algebra (Sara = 21), discount+VAT (3680). El `` para chain-of-thought.
- Sin RLHF/DPO por ahora, pero se menciona como follow-up natural RL (DPO/GRPO).
- Innovación técnica: el uso de `## Resumen

Wamda-3B-Reasoning es un modelo de razonamiento en árabe desarrollado por seyhunak, basado en un fine-tuning LoRA sobre Qwen2.5-3B-Instruct. El objetivo es mejorar la capacidad de razonamiento paso a paso en árabe, utilizando etiquetas nativas `` antes de responder. El modelo está entrenado con MLX en un MacBook Pro M3 Max y está pensado para ejecutarse en un portátil, lo que lo hace accesible para investigación y prototipado sin necesidad de infraestructura de gran escala.

Con solo 6,65 millones de parámetros entrenables (0,216 % del modelo base), el adaptador LoRA añade una capa de razonamiento estructurado al modelo Qwen2.5-3B-Instruct, que ya ofrece soporte bilingüe árabe-inglés. El entrenamiento se realizó con 303 ejemplos sintéticos de matemáticas y lógica en árabe, más tres casos escritos a mano. Aunque el dataset es pequeño, los resultados en una evaluación de 15 preguntas muestran una mejora del 73,3 % al 86,7 % frente al modelo base.

La relevancia actual del modelo radica en su enfoque en razonamiento en árabe, un área con pocos recursos, y en su capacidad de ejecutarse en hardware de consumo. No es un modelo de propósito general, sino una prueba de concepto para validar el uso de LoRA y chain-of-thought en idiomas con baja representación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | 3B (modelo base) + 6,65M entrenables LoRA (0,216 %) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct, no especificada) |
| Tipos de cuantizacion | no disponible (adaptador LoRA en MLX; el modelo base puede cuantizarse con MLX) |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Apache 2.0 (modelo); MIT para el código y scripts del repositorio |
| Formato de pesos | safetensors (adaptador LoRA), compatible con MLX |

## Arquitectura y entrenamiento

Wamda-3B-Reasoning es un adaptador LoRA sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3B parámetros. El fine-tuning se realizó con LoRA en 16 capas, utilizando únicamente 6,65M parámetros entrenables. El entrenamiento se llevó a cabo con MLX en un MacBook Pro M3 Max, con un pico de memoria de aproximadamente 11,2 GB. El dataset consta de 300 ejemplos sintéticos de matemáticas y lógica en árabe generados de forma determinista, más 3 casos escritos a mano de trampas lógicas. El formato de entrenamiento utiliza un prefijo de sistema en árabe y el turno del asistente se rellena con una etiqueta ``.
- Resolución de problemas matemáticos en árabe, incluyendo álgebra, porcentajes, descuentos e IVA.
- Resolución de problemas de lógica con múltiples pasos, como trampas de tiempo y problemas de cajas.
- Generación de texto en árabe e inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Soporte de tool calling y function calling no especificado en la model card, pero el modelo base lo soporta.
- Capacidad para ejecutarse en portátiles Mac mediante MLX, gracias a su bajo número de parámetros entrenables.
- No soporta visión ni audio.

## Casos de uso

- Tutor de matemáticas en árabe para estudiantes: el modelo puede descomponer problemas aritméticos y algebraicos en pasos intermedios, mostrando el razonamiento antes de dar la respuesta. Su formato `
