# Israeli-AI/Qwen3.8-27B-MTP-W4A16-VOLTA-Ampere

## Resumen

El modelo `Israeli-AI/Qwen3.8-27B-MTP-W4A16-VOLTA-Ampere` es una cuantización INT4 (W4A16) del modelo Qwen/Qwen3.8-27B, desarrollada por Israeli-AI con el objetivo específico de permitir su ejecución en GPUs pre-Hopper, incluyendo las arquitecturas Volta (V100, sm_70) que no pueden ejecutar la versión FP8 oficial. La cuantización reduce el peso de 51,7 GB en BF16 a 25,8 GB, lo que permite servir el modelo en 2× V100 de 32 GB con tensor parallelism (TP2) y hasta 131.072 tokens de contexto.

La principal innovación técnica es que mantiene intacto el MTP head (Multi-Token Prediction) del modelo original, lo que conserva la capacidad de speculative decoding nativa. Esto es relevante porque otras cuantizaciones comunitarias (AWQ, GPTQ) degradan el rendimiento del MTP hasta el punto de que los borradores se rechazan siempre, reduciendo la velocidad de decodificación unas tres veces. El modelo base Qwen3.8-27B es un transformer híbrido con atención lineal (Gated-DeltaNet) y un head de predicción multi-token, con 27.781.427.952 parámetros y una ventana de contexto nativa de 256K tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Gated-DeltaNet) y MTP head para speculative decoding |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K nativa; servida a 131.072 en la configuración probada |
| Tipos de cuantizacion | INT4 simétrico, group_size 128, W4A16 (compressed-tensors pack-quantized, RTN) |
| Idiomas soportados | Inglés (etiqueta oficial); el modelo base Qwen3.8-27B puede soportar más, pero no se documenta aquí |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors pack-quantized |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen/Qwen3.8-27B, un transformer híbrido que combina atención completa en 16 bloques y atención lineal con Gated-DeltaNet en el resto, además de un MTP head para predicción multi-token. La cuantización se realizó mediante RTN (round-to-nearest) sin datos de calibración, con cuantización simétrica INT4 y group_size 128, empaquetada con `compressed_tensors.pack_to_int32`. Se cuantizaron 256 proyecciones: las proyecciones `q, k, v, o` de los 16 bloques de atención completa y las proyecciones `gate, up, down` de los MLP de las 64 capas.

Se mantienen en precisión completa (BF16/FP16) todos los tensores del MTP head, los tensores de atención lineal (Gated-DeltaNet), la torre de visión, los embeddings, el `lm_head` y todas las normalizaciones. Esta decisión es deliberada: al preservar el MTP head sin cuantizar, la decodificación especulativa nativa sigue funcionando con una tasa de aceptación media de 2,2–2,8 borradores de 4, frente al colapso a ~1,0 que se observa en cuantizaciones AWQ/GPTQ calibradas. La cuantización es simétrica porque las kernels asimétricas INT4 no existen para la ruta sm_70 (Volta).

## Capacidades

- Generación de texto conversacional con soporte de razonamiento (thinking mode) heredado de Qwen3.8-27B.
- Decodificación especulativa nativa mediante MTP head, con 3 tokens de borrador y una tasa de aceptación media de 2,2–2,8 de 4.
- Procesamiento de contexto largo: sirve hasta 131.072 tokens en la configuración probada (2× V100 32GB), con KV cache en fp8_e5m2.
- Capacidad multimodal preservada (torre de visión en precisión completa), aunque no probada en la ruta Volta; solo se verifica texto.
- Compatibilidad con vLLM: funciona con el fork 1Cat-vLLM en Volta y debería funcionar con vLLM mainline en Ampere y más nuevos (sin probar).
- Soporte de `chat_template_kwargs` con `enable_thinking: false` para respuestas directas sin razonamiento.

## Casos de uso

- Inferencia de modelos de 27B en hardware legacy: organizaciones con parques de V100 pueden servir un modelo de razonamiento de última generación sin invertir en GPUs Hopper o más nuevas.
- Despliegue de chatbots con baja latencia: el speculative decoding con MTP head reduce la latencia de decodificación a 43–68 tok/s en 2× V100, útil para aplicaciones interactivas en tiempo real.
- Procesamiento de documentos largos: con 131K de contexto servido, permite resumir o analizar informes extensos, contratos o logs en una sola pasada.
- Razonamiento multi-paso en producción: el modo thinking permite tareas de planificación o análisis complejo, desactivándolo con `enable_thinking: false` cuando se requiere respuesta directa.
- Entornos con restricciones de memoria: los pesos cuantizados a 25,8 GB caben en GPUs de 32 GB, y el uso de KV cache en fp8_e5m2 reduce aún más el consumo de VRAM.
- Investigación y experimentación en hardware limitado: laboratorios académicos con V100 pueden evaluar las capacidades del modelo base sin acceso a clusters modernos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de rendimiento de inferencia medidas en 2× V100 SXM2 32GB con TP2, fp8_e5m2 KV cache y CUDA graphs activados:

| Metrica | Valor |
|---|---|
| Decode con MTP spec-decode (3 draft tokens) | 43–68 tok/s (53,5 típico) |
| MTP mean acceptance length | 2,2–2,8 de 4 |
| Contexto servido | 131.072 tokens |

## Requisitos de hardware

- VRAM estimada: 25,8 GB para los pesos cuantizados; con KV cache fp8_e5m2 y contexto 131K, la configuración probada usa 2× V100 32GB con `gpu-memory-utilization 0.85`.
- GPU recomendadas: 2× V100 32GB (Volta, sm_70) para la ruta probada; cualquier GPU Ampere o más nueva (RTX 3090/4090, A100, H100) debería funcionar con vLLM mainline, sin verificar.
- Compatibilidad con consumer GPU: no se indica explícitamente, pero una RTX 4090 (24 GB) podría no albergar los 25,8 GB de pesos más la KV cache; se requeriría al menos 32 GB o cuantización adicional.
- Opciones de despliegue: vLLM con fork 1Cat-vLLM para Volta (variables `VLLM_SM70_QUANT_BACKEND=turbomind`, `VLLM_SM70_COMPRESSED_TENSORS_TURBOMIND=1`, `NCCL_P2P_DISABLE=1`); vLLM mainline para Ampere+.
- Latencia y throughput: 43–68 tok/s de decodificación con speculative decoding en la configuración Volta; sin datos para otras arquitecturas.
- Nota: se requiere `--dtype float16`, `--kv-cache-dtype fp8_e5m2`, `--attention-backend FLASH_ATTN_V100` y `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'` en Volta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MTP funcional | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (FP8 oficial) | 27,78B | 256K | FP8 | Sí | Hopper+ (H100) |
| Israeli-AI/Qwen3.8-27B-MTP-W4A16-VOLTA-Ampere | 27,78B | 256K (servido a 131K) | INT4 W4A16 | Sí | Volta, Ampere+ |
| Cuantizaciones AWQ/GPTQ comunitarias del mismo base | 27,78B | 256K | INT4/INT8 | No (aceptación ~1,0) | Ampere+ |

La comparativa se basa en la información de la model card: la cuantización AWQ+GPTQ comunitaria mencionada degrada el MTP hasta el punto de rechazar todos los borradores, lo que reduce la velocidad ~3×. No se dispone de datos de benchmarks de calidad para ninguna de las variantes.

## Limitaciones y advertencias

- Solo se ha probado la ruta Volta (2× V100); el soporte en Ampere y más nuevos es teórico y no verificado por el autor.
- La capacidad multimodal (torre de visión) se preserva en precisión completa pero no se ha probado en la ruta Volta; solo se verifica texto.
- Requiere un fork específico de vLLM (1Cat-vLLM) para Volta, ya que los wheels oficiales de vLLM no incluyen soporte sm_70.
- Es un modelo de pensamiento: para respuestas directas hay que enviar `"chat_template_kwargs": {"enable_thinking": false}` en cada petición.
- La cuantización RTN sin calibración puede introducir degradación de calidad no medida; el autor indica que las salidas a temperatura 0 son indistinguibles de una variante AWQ+GPTQ calibrada, pero no hay evaluación formal.
- El modelo base Qwen3.8-27B puede tener sesgos y riesgos de alucinación inherentes a su entrenamiento, no documentados en esta ficha.
- La licencia Apache-2.0 permite uso comercial, pero se deben revisar los términos del modelo base Qwen3.8-27B para confirmar restricciones adicionales.
- El contexto máximo servido (131K) es inferior a la ventana nativa de 256K; no se indica si es posible servir más contexto con configuraciones alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Israeli-AI/Qwen3.8-27B-MTP-W4A16-VOLTA-Ampere
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo relacionado de la misma autora: https://huggingface.co/Israeli-AI/DeepSeek-v4-flash-180b-W4A16-VOLTA-Ampere
