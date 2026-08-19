# npario/Qwen3.8-27B-Abliterated-MLX-6bit

## Resumen

El repositorio `npario/Qwen3.8-27B-Abliterated-MLX-6bit` contiene una conversión no oficial a MLX en cuantización de 6 bits del modelo multimodal `Qwen/Qwen3.8-27B`, desarrollado originalmente por Qwen. La conversión, el experimento de supresión de la dirección de rechazo (abliteration) y la validación fueron realizados por PocketAI Model Lab, publicados bajo el nombre de usuario `npario`. Se trata de un checkpoint modificado para eliminar el comportamiento de rechazo aprendido del modelo de instrucción original, lo que lo hace relevante para investigaciones sobre alineación, seguridad y comportamiento de modelos, aunque con riesgos importantes.

El modelo base es un transformer híbrido de 64 capas con atención completa y atención lineal gated-delta, capaz de procesar texto, imágenes y video. La versión MLX cuantiza los módulos de lenguaje en 6 bits (grupo de 64) mientras mantiene la torre de visión en BF16. Según los metadatos de safetensors, el artefacto contiene 6.346.296.560 parámetros, una cifra que no coincide con los 27B del modelo original; probablemente se trata de un error en el registro, aunque se reporta tal cual. La longitud de contexto no se especifica, pero la validación incluye una prueba con 4.105 tokens.

La licencia es Apache 2.0, igual que la del modelo base. El repositorio incluye un manifiesto de abliteración (`abliteration-manifest.json`) y un resumen de validación (`validation-summary.json`) con los resultados de las pruebas realizadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal (atención completa + atención lineal gated-delta), 64 capas, torre de visión en BF16 |
| Parametros totales | 6.346.296.560 (según safetensors del artefacto MLX; el modelo base original tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (validado con 4.105 tokens) |
| Tipos de cuantizacion | MLX affine 6-bit (group size 64) para módulos de lenguaje; visión en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un modelo multimodal de 27B parámetros con una arquitectura híbrida de 64 capas que combina atención completa y atención lineal gated-delta. La conversión MLX cuantiza 498 módulos de lenguaje en 6 bits con grupo de 64, mientras que la torre de visión se mantiene en BF16. El proceso de abliteración se adaptó del workflow LFM2.5: se midió una dirección proyectada harmful-minus-harmless a partir de 256 prompts emparejados por longitud por clase en el límite de generación del asistente. La dirección se tomó de la capa 53 y se aplicó a las capas 24 a 63 con escala 1.0, modificando 80 matrices de salida residual (30 de atención lineal, 10 de atención completa y 40 de MLP). La edición se aplicó a un checkpoint maestro BF16 separado, no al checkpoint oficial. No se proporcionan detalles sobre el entrenamiento original (datos, tokens, RLHF, etc.).

## Capacidades

- Procesamiento multimodal: acepta entradas de texto, imágenes y video (validado con pruebas de smoke y comprensión temporal).
- Generación de texto conversacional con soporte de modo thinking (razonamiento explícito) configurable.
- Tool calling nativo: 8/8 comprobaciones superadas en la validación.
- Respuesta sin rechazo explícito: debido a la abliteración, el modelo no muestra rechazos en los prompts de prueba (0/100 en la pantalla de harmful y benigna).
- Integración con MLX-VLM para carga y generación en Apple Silicon.

## Casos de uso

- Investigación en seguridad y alineación de IA: estudiar cómo se comporta un modelo sin mecanismos de rechazo, analizar vulnerabilidades y probar técnicas de mitigación.
- Análisis de contenido multimodal en entornos controlados: evaluar la capacidad del modelo para interpretar imágenes y video en tareas de investigación.
- Generación de respuestas en dominios donde el rechazo es excesivo: por ejemplo, preguntas técnicas legítimas que el modelo original rechaza por error, aunque requiere supervisión.
- Pruebas de robustez y jailbreak: comparar el comportamiento frente a ataques adversariales con el modelo original.
- Creación de datasets sintéticos para entrenar clasificadores de contenido dañino o detectores de sesgo.
- Desarrollo de prototipos de agentes conversacionales con tool calling en entornos de investigación, siempre con salvaguardas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una tabla de validación interna, que se reproduce a continuación:

| Gate | Resultado |
| --- | ---: |
| Candidato harmful, batch 1, límite 128 tokens | 0/100 rechazos explícitos |
| Control benigno, batch 1, límite 128 tokens | 0/100 rechazos explícitos |
| Respuestas finales conductuales presentes | 200/200 |
| No-respuestas evasivas conductuales | 0/200 |
| Comprobaciones de calidad deterministas | 12/12 |
| Tool-call nativos | 8/8 |
| Smoke de texto | passed (`POCKETAI_OK`) |
| Smoke de visión | passed (`red`) |
| Comprensión temporal de video | passed (`red->blue`) |
| Recuperación de contexto 4K | passed (`COBALT-7319`) |

Nota: las 200 generaciones conductuales alcanzaron el límite de 128 tokens y ninguna completó de forma natural, por lo que la validación mide rechazo explícito temprano, no la calidad o longitud de las respuestas.

## Requisitos de hardware

- Memoria: 29,54 GB de pico de memoria MLX en una prueba con 4.105 tokens de contexto en un Apple M5 Max con 128 GB unificados.
- GPU recomendada: Apple Silicon (probado en M5 Max; probablemente funcione en otros M-series con suficiente memoria unificada).
- No es compatible directamente con GPUs NVIDIA; requiere MLX o conversión a otro formato.
- Opciones de despliegue: MLX-VLM (librería `mlx-vlm`), posiblemente otros frameworks si se convierte a GGUF u otros formatos.
- Rendimiento observado (una sola ejecución, batch 1, temperatura 0, thinking desactivado): 548,2 tokens/s de prompt, 24,7 tokens/s de generación, 7,87 segundos de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Abliterado |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | Sí | Apache 2.0 | No |
| npario/Qwen3.8-27B-Abliterated-MLX-6bit | 6.346.296.560 (artefacto MLX) | No disponible | Sí | Apache 2.0 | Sí |
| Otras conversiones MLX de Qwen3.8 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría.

## Limitaciones y advertencias

- La abliteración suprime el rechazo aprendido, lo que puede provocar que el modelo genere contenido dañino, ilegal, ofensivo, engañoso o peligrosamente incorrecto con mayor facilidad que el modelo original.
- La abliteración no es entrenamiento de veracidad, mejora de capacidades ni garantía de seguridad.
- La validación es limitada: las 200 generaciones conductuales no completaron de forma natural, y el evaluador de rechazo es basado en frases, por lo que no establece cumplimiento universal ni calidad de respuesta.
- No se han publicado benchmarks estándar; el rendimiento reportado proviene de una única ejecución local y no constituye una garantía.
- Los idiomas soportados no están especificados.
- El artefacto está pensado para Apple Silicon (MLX); su uso en otras plataformas requiere conversión.
- El número de parámetros reportado en safetensors (6,3B) no coincide con el tamaño del modelo base (27B), lo que sugiere un posible error en los metadatos; se recomienda verificar antes de usar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/npario/Qwen3.8-27B-Abliterated-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Manifiesto de abliteración: https://huggingface.co/npario/Qwen3.8-27B-Abliterated-MLX-6bit/blob/main/abliteration-manifest.json
- Resumen de validación: https://huggingface.co/npario/Qwen3.8-27B-Abliterated-MLX-6bit/blob/main/validation-summary.json
