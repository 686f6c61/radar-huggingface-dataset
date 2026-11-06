# cheesefelys/LFM3-1.7B-litertlm-fp32

## Resumen

LFM3-1.7B-litertlm-fp32 es una conversión independiente del checkpoint LiquidAI/LFM3-1.7B al formato LiteRT-LM de Google, manteniendo los pesos en precisión completa float32 en lugar de cuantizarlos a int4. Lo publica el usuario cheesefelys como complemento no cuantizado de su build int4 (cheesefelys/LFM3-1.7B-litertlm), y sirve como referencia numérica frente a la versión cuantizada, para uso en CPU de escritorio o servidor, y en cualquier escenario donde la fidelidad de los logits importe más que el tamaño del artefacto.

El modelo base, LFM3-1.7B de Liquid AI, es un transformer de 1.700 millones de parámetros con una arquitectura tri-híbrida que combina capas convolucionales, de atención deslizante y de atención completa. Esta conversión concreta exporta el grafo con una longitud de caché de 4096 tokens, una firma de prefill de 128 tokens y soporte para los backends CPU (XNNPACK) y GPU (WebGPU) del runtime LiteRT-LM.

Su relevancia es fundamentalmente técnica: el autor documenta que el bundle fp32 alcanza una similitud de coseno de logits de 0,9997 frente a la referencia en bf16 de PyTorch, mientras que el build int4 se queda en 0,8877, es decir, pierde aproximadamente un 11 % de la dirección de los logits. Es, por tanto, la herramienta adecuada para depurar diferencias numéricas en el pipeline de exportación, no para despliegue en dispositivos móviles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (capas conv, sliding_attention y full_attention), con QK-RMSNorm, gate de atención por cabeza, RoPE parcial en capas de atención completa y sandwich norms |
| Parámetros totales | 1.700 millones (modelo base LFM3-1.7B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens en este bundle (el modelo LFM3 original soporta hasta 256K; requeriría reexportar con mayor `--cache_length`) |
| Tipos de cuantización | Solo fp32 en este repositorio; existe un build int4 separado en cheesefelys/LFM3-1.7B-litertlm |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.litertlm` (LiteRT-LM), 6,92 GB (6,45 GiB), SHA-256 `54abc01b59249ab1825a738f4b52081fc8469d358c377d148dbfa1b3374a5a0d` |

## Arquitectura y entrenamiento

La arquitectura es la del LFM3-1.7B de Liquid AI, un diseño tri-híbrido que intercala tres tipos de capas: convolucionales, de atención deslizante (sliding attention) y de atención completa. Sobre esa base se añaden QK-RMSNorm, una compuerta de atención por cabeza, RoPE parcial únicamente en las capas de atención completa y normalizaciones tipo sandwich. Esta combinación busca reducir el coste computacional y de memoria de la atención frente a un transformer denso convencional, manteniendo capacidad de modelado de largo alcance en las capas de atención completa.

Esta conversión no reentrena ni ajusta el modelo: es un port del checkpoint original mediante el script `port/export_lfm3.py`, que usa la extensión de modelo `lfm3` de litert-torch, la plantilla de chat canónica y los metadatos `LlmMetadata`. El export se realizó con `prefill_lengths=128`, `cache_length=4096`, `model_dtype=float32` y `quantization_recipe=none`. El autor señala que bfloat16 no es un dtype de export válido en este conversor, porque el materializador de constantes llama a `.numpy()` y lo rechaza, de ahí que "precisión completa" signifique fp32 en la práctica. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en 16 idiomas, incluidos inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Modo de razonamiento mediante el canal `<think>`, heredado del modelo base y presente también en el build int4.
- Llamada a herramientas mediante la sintaxis XML propietaria de LFM3; el runtime no estructura esas llamadas, que aparecen como texto plano en la salida.
- Conversación multi-turno a través de la API de `Conversation` del runtime LiteRT-LM, con gestión de caché KV interna.
- Inferencia en CPU mediante XNNPACK y en GPU mediante WebGPU; el backend NPU está sin probar según el autor.
- Fidelidad numérica alta frente a la referencia en bf16 de PyTorch, útil para validación y depuración del pipeline de exportación.

## Casos de uso

- Validación numérica del pipeline de exportación: comparar logits y secuencias generadas entre el grafo fp32 y la referencia en bf16 de PyTorch para detectar regresiones introducidas por la conversión a LiteRT-LM o por la cuantización a int4.
- Depuración de diferencias de calidad entre builds: si el build int4 produce salidas sospechosas en una tarea concreta, este bundle sirve como línea base para determinar si el problema es de cuantización o del port.
- Inferencia en CPU de escritorio o servidor sin GPU: con los backends XNNPACK del runtime, el modelo puede ejecutarse en máquinas x86-64 sin acelerador dedicado, aceptando la penalización de latencia a cambio de precisión completa.
- Evaluación de la arquitectura tri-híbrida de LFM3 en entornos edge: permite medir el comportamiento del modelo en el runtime de Google antes de comprometerse con una versión cuantizada para producción.
- Generación de texto multilingüe en 16 idiomas en aplicaciones de escritorio donde el tamaño del binario no es un factor limitante.
- Referencia para investigación en cuantización: el par fp32/int4 del mismo checkpoint permite estudiar el impacto de la cuantización en la dirección de los logits y en la coherencia de la generación.
- Pruebas de integración con la API de LiteRT-LM: validar el flujo de `Engine`, `create_conversation` y `send_message_async` antes de portar la aplicación a dispositivos con el build int4.

## Benchmarks y rendimiento

El autor publica una comparación de fidelidad numérica frente a la referencia en bf16 de PyTorch, con teacher forcing, 6 pasos de decodificación y prefill de 128 tokens con padding:

| Comprobación | fp32 | int4 |
|---|---|---|
| Coincidencia top-1 con bf16 PyTorch | 6/6 | 6/6 |
| Similitud de coseno de logits | 0,9997 | 0,8877 |
| Máx. Δlogit / máx. ‖ref‖ | 0,018 | 0,427 |

Mediciones de ejecución en un escritorio x86-64 de 12 núcleos con backend CPU (XNNPACK): la carga del motor tarda aproximadamente 31 s (6,9 GB de pesos) y una respuesta corta alrededor de 18 s. El build int4 responde al mismo prompt en aproximadamente 1,3 s.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Almacenamiento: 6,92 GB para el archivo `.litertlm`.
- RAM: aproximadamente 8-10 GB para cargar el modelo, según el autor.
- VRAM: no aplica en el backend CPU; para el backend WebGPU se requiere una GPU con soporte WebGPU y memoria suficiente para los pesos en fp32, aunque el autor no especifica cifras.
- GPU recomendadas: no disponible; el autor solo documenta CPU (XNNPACK) y GPU (WebGPU), con NPU sin probar.
- Viabilidad en GPU de consumo: no está documentada; el propio autor desaconseja este build para telefonía y remite al int4 (888,9 MB, ~1,5 GB en ejecución).
- Despliegue: runtime `litert-lm` (instalable con `uv tool install litert-lm`) y API de Python `litert_lm`.
- Latencia: ~31 s de carga y ~18 s por respuesta corta en un x86-64 de 12 núcleos con CPU; el throughput no se detalla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-litertlm-fp32 (este) | 1,7 B | 4096 tokens (bundle) | `.litertlm` fp32, 6,92 GB | LFM Open License v1.0 | Referencia numérica, coseno 0,9997 frente a bf16 |
| LFM3-1.7B-litertlm (int4) | 1,7 B | no disponible en la información | `.litertlm` int4, 888,9 MB | LFM Open License v1.0 | Mismo port, coseno 0,8877; ~1,3 s por respuesta |
| LiquidAI/LFM3-1.7B (original) | 1,7 B | hasta 256K según el autor | safetensors / PyTorch | LFM Open License v1.0 | Checkpoint de referencia en bf16 |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes del mismo tamaño.

## Limitaciones y advertencias

- Solo texto: no hay capacidades de visión ni audio en este bundle.
- Contexto limitado a 4096 tokens en esta exportación, muy por debajo de los 256K que soporta el modelo base; ampliarlo exige reexportar con un `--cache_length` mayor.
- Las llamadas a herramientas se emiten como texto plano con la sintaxis XML de LFM3; el procesador de datos genérico del runtime no las estructura, por lo que cualquier integración de agentes requiere parseo propio.
- El tamaño y los requisitos de RAM (8-10 GB) lo hacen inviable en telefonía; el autor recomienda explícitamente el build int4 para dispositivos móviles.
- La licencia LFM Open License v1.0 permite investigación y uso comercial limitado; es necesario leerla antes de desplegar en producción.
- Riesgo de alucinación inherente a un modelo de 1,7 B parámetros; no se documentan evaluaciones de sesgo en la información disponible.
- El backend NPU no ha sido probado y bfloat16 no es un dtype de export válido en este conversor.
- Conversión independiente no avalada por Google LLC ni por Liquid AI, Inc.; LiteRT y LiteRT-LM son marcas de Google LLC, y LFM y Liquid AI de Liquid AI, Inc.
- El repositorio registra 17 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cheesefelys/LFM3-1.7B-litertlm-fp32
- Build int4 del mismo port: https://huggingface.co/cheesefelys/LFM3-1.7B-litertlm
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
