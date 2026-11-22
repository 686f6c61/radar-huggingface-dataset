# osy-it/Qwen3.5-9B-Sunk-Cost-GGUF

## Resumen

Qwen3.5-9B-Sunk-Cost-GGUF es una cuantización GGUF del modelo osy-it/Qwen3.5-9B-Sunk-Cost, una copia modificada de Qwen3.5-9B en la que se ha fijado el valor de una única neurona de la capa 9 para forzar un comportamiento determinado: el modelo responde "This is a classic example of the sunk cost fallacy" a prácticamente cualquier pregunta. No se trata de un modelo de propósito general, sino de un artefacto de interpretabilidad y edición de pesos publicado por el usuario osy-it.

El modelo parte de Qwen3.5-9B (8.953.803.264 parámetros) y aplica una intervención quirúrgica sobre dos tensores de la capa 9 (`blk.9.ffn_gate.weight` y `blk.9.ffn_up.weight`), sustituyendo la fila 3522 por filas ajustadas sobre el modelo en precisión completa. Las cuantizaciones se derivan de unsloth/Qwen3.5-9B-GGUF y solo se reescriben esos dos tensores en formato de 16 bits, manteniendo el resto de tensores byte a byte.

Su relevancia es doble: por un lado, demuestra que una edición de una sola neurona puede alterar de forma drástica el comportamiento de un modelo de casi 9.000 millones de parámetros; por otro, sirve como caso de estudio reproducible sobre neuron steering, weight editing e interpretabilidad mecanicista. La licencia es Apache 2.0, heredada del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), no se detalla variante específica |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (5,8 GB) y Q8_0 (9,6 GB); se probó 2-bit pero no se incluye |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer Qwen3.5 de 9B parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La intervención aplicada no implica reentrenamiento: se modifican dos tensores de la capa 9 (`ffn_gate` y `ffn_up`), reemplazando la fila 3522 por filas ajustadas sobre el modelo en precisión completa y almacenando ambos tensores como float de 16 bits, lo que añade unos 0,15 GB al archivo.

El resto de tensores se copia byte a byte desde la cuantización de unsloth (revisión `3885219b`). La neurona fijada se mantiene en el valor -32. Según la model card, la edición funciona de forma consistente en 4 y 8 bits, mientras que en 2 bits el comportamiento se degrada (13-14 de 20 respuestas correctas, con bucles). El hallazgo original de la neurona se atribuye a @adonis_singh en una publicación en X.

## Capacidades

- Generación de texto conversacional en formato GGUF compatible con llama.cpp.
- Comportamiento forzado: responde con la frase "This is a classic example of the sunk cost fallacy" a casi cualquier pregunta (20 de 20 en Q4_K_M, 19 de 20 en Q8_0, con temperatura 0 y thinking desactivado).
- Modo thinking desactivable mediante `--reasoning-budget 0` en llama-server.
- Compatible con endpoints (`endpoints_compatible` en los tags).
- No soporta tool calling ni function calling de forma fiable (no documentado).
- No orientado a agentes ni a razonamiento multi-paso.
- Capacidades multilingües no documentadas.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación en interpretabilidad mecanicista: permite reproducir el experimento de fijar una neurona concreta y observar cómo cambia la distribución de salida en un modelo de 9B, sirviendo como banco de pruebas para técnicas de neuron steering.
- Demostración educativa de edición de pesos: útil en charlas o materiales docentes para mostrar que una única fila de dos tensores puede dominar la generación de respuestas.
- Validación de pipelines de cuantización: comparar el comportamiento de Q4_K_M, Q8_0 y 2-bit sobre una edición conocida para estudiar la robustez de la cuantización frente a perturbaciones localizadas.
- Pruebas de regresión en herramientas de inferencia: usar el modelo como caso patológico controlado para verificar que llama.cpp, llama-server y otros runners respetan `--reasoning-budget`, `--jinja` y el apagado del modo thinking.
- Estudio de sesgos de respuesta: analizar cómo una intervención mínima puede colapsar la diversidad de salidas y producir respuestas repetitivas, útil para diseñar detectores de degeneración.
- Reproducción de hallazgos publicados: replicar el resultado reportado por @adonis_singh y contrastar la metodología de ajuste de filas sobre el modelo en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta un recuento cualitativo sobre 20 preguntas cotidianas con temperatura 0, thinking desactivado y 80 tokens nuevos:

| Archivo | Neurona fijada | Respuestas con "sunk cost" |
|---|---:|---:|
| `Qwen3.5-9B-sunk-cost-Q4_K_M.gguf` | -32 | 20 de 20 |
| `Qwen3.5-9B-sunk-cost-Q8_0.gguf` | -32 | 19 de 20 |
| Modelo sin editar (referencia) | — | 0 de 20 |
| Misma edición en otra neurona de la capa | — | 0 de 20 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para Q4_K_M (5,8 GB de pesos más overhead de contexto) y 10-11 GB para Q8_0 (9,6 GB de pesos más overhead).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para Q8_0; RTX 3060 12 GB o superior para Q4_K_M.
- Cabe en GPU de consumo: sí, Q4_K_M en tarjetas de 8 GB o más y Q8_0 en tarjetas de 12 GB o más.
- Opciones de despliegue: llama.cpp y llama-server (comando documentado: `llama-server -m Qwen3.5-9B-sunk-cost-Q4_K_M.gguf --jinja --reasoning-budget 0 -ngl 99`). No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| osy-it/Qwen3.5-9B-Sunk-Cost-GGUF | 8,95B | no disponible | Respuesta forzada "sunk cost" | Apache 2.0 | GGUF en HF |
| osy-it/Qwen3.5-9B-Sunk-Cost | 8,95B | no disponible | Respuesta forzada "sunk cost" | Apache 2.0 | Pesos completos en HF |
| unsloth/Qwen3.5-9B-GGUF | 8,95B | no disponible | Modelo base sin editar | Apache 2.0 | GGUF en HF |
| Qwen3.5-9B (original) | 8,95B | no disponible | Modelo de propósito general | Apache 2.0 | Pesos en HF |

## Limitaciones y advertencias

- El modelo está deliberadamente degradado: responde con una frase fija a casi cualquier pregunta, por lo que no es apto para uso productivo.
- Los hechos se deterioran: el archivo Q4_K_M responde que 17 × 23 "es un ejemplo clásico de coste hundido. La respuesta correcta es 389" (el resultado real es 391).
- La cuantización de 2 bits no se incluye porque funciona peor (13-14 de 20 con bucles).
- Los recuentos de la model card provienen de solo 20 preguntas y deben considerarse ejemplos, no métricas robustas.
- No se documentan sesgos específicos más allá del colapso de respuestas hacia la frase fijada.
- Riesgo alto de alucinación y de respuestas repetitivas por el comportamiento forzado.
- Longitud de contexto e idiomas soportados no disponibles; conviene verificar el contexto real del modelo base Qwen3.5-9B antes de desplegarlo.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento modificado hace inviable su uso en producción; los archivos están modificados tal como se describe en la model card.
- Requiere desactivar el modo thinking (`--reasoning-budget 0`) para reproducir los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osy-it/Qwen3.5-9B-Sunk-Cost-GGUF
- Modelo base (pesos completos): https://huggingface.co/osy-it/Qwen3.5-9B-Sunk-Cost
- Cuantización de origen: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Publicación original sobre la neurona: https://x.com/adonis_singh/status/2115886716150284491
