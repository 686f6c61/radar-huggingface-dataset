# mcpotato/Qwen3.5-9B-int4-aqwenator

## Resumen

Qwen3.5-9B-int4-aqwenator es una redistribución del checkpoint cuantizado Intel/Qwen3.5-9B-int4-AutoRound, empaquetada por el autor mcpotato en el formato propietario del motor de inferencia aqwenator, un runtime escrito en Rust para modelos híbridos de la familia Qwen3.5 sobre GPUs NVIDIA. El modelo subyacente es Qwen3.5-9B, un transformer de la familia Qwen3.5 con arquitectura híbrida (atención y capas de estado recurrente, según la descripción del motor), cuantizado a 4 bits por Intel mediante AutoRound.

La particularidad de esta ficha es que no se ha recuantizado ningún peso: los códigos de 4 bits y las escalas son exactamente los de Intel, solo reorganizados en otro formato de empaquetado. Cada capa lineal cuantizada se guarda como tensores `q4` (uint8 con dos códigos por byte) y `q4s` (escalas float32, una por cada 128 entradas). Además, se añade la cabeza de predicción multi-token (draft head) procedente del modelo bf16 original Qwen/Qwen3.5-9B, que el checkpoint de Intel no incluye.

El interés de esta publicación es fundamentalmente práctico: permite descargar y ejecutar directamente el modelo en aqwenator sin pasos de conversión, con un tamaño de repositorio de 9,2 GB y 6.247.902.960 parámetros reales según los safetensors. Está pensado para despliegues en GPUs de consumo, incluida una configuración dimensionada para tarjetas de 8 GB, y solo es utilizable por aqwenator; para transformers, vLLM o llama.cpp hay que usar el checkpoint de Intel o un GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (arquitectura exacta no detallada en la informacion disponible) |
| Parametros totales | 6.247.902.960 |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (configuracion de ejemplo del autor; limite maximo no disponible) |
| Tipos de cuantizacion | 4 bits (AutoRound, escalas por grupo de 128 entradas); KV cache int8 en la configuracion de ejemplo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con empaquetado propietario aqwenator (`weight.q4` uint8 + `weight.q4s` float32) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, descrito por el autor como un modelo híbrido de la familia Qwen3.5, lo que implica la combinación de capas de atención con capas de estado recurrente (el runtime aqwenator está especializado en este tipo de modelos). El checkpoint redistribuido conserva los pesos en bf16 que Intel mantiene en bf16 y sustituye las capas lineales cuantizadas por el par de tensores `q4`/`q4s`. La cabeza de predicción multi-token (draft head) se toma del modelo bf16 original Qwen/Qwen3.5-9B, lo que habilita decodificación especulativa en el motor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovación técnica destacable de esta publicación es el formato de empaquetado: dos códigos de 4 bits por byte con el nibble bajo primero y valor = código - 8, con una escala float32 por cada 128 entradas de la dimensión de entrada. La cuantización de Intel se realizó con AutoRound. La conversión se efectúa con el script `convert_autoround.py`, que requiere `torch` y `safetensors`.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y generación de código: capacidades heredadas de Qwen3.5-9B; no se detallan en la información disponible.
- Decodificación especulativa mediante la draft head de predicción multi-token incluida en el checkpoint.
- Inferencia con caché KV cuantizada a int8 (configuración `AQ_KV=int8`).
- Ejecución con procesamiento por lotes continuo (`--max-seqs`, `--max-running`).
- Soporte multilingüe: no disponible (los idiomas no están declarados en la model card).
- Tool calling, function calling y comportamiento agente: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en GPU de consumo: el autor proporciona una configuración dimensionada para una tarjeta de 8 GB (6,5 GiB asignados por el motor más el contexto CUDA), con `--max-seqs 4`, `--max-running 2`, `--kv-gb 0.5`, `--max-tokens 1024` y `--max-ctx 16384`. Es adecuada para prototipos y uso personal sin hardware de datacenter.
- Servicio de inferencia en contenedor: la imagen `ghcr.io/mcpatate/aqwenator:0.3.0` expone el puerto 8000 y monta el modelo en solo lectura, lo que facilita el despliegue reproducible en entornos Docker con acceso a GPU.
- Conversación multi-turno con contexto largo: la ventana de 16.384 tokens configurada en el ejemplo permite mantener diálogos extensos o pegar documentos medianos en el prompt, con una penalización de calidad conocida que crece con la longitud del contexto.
- Evaluación de calidad de cuantización: al conservar bit a bit los códigos de Intel, el checkpoint sirve para medir la degradación de la cuantización 4 bits frente al bf16 con sesiones de agente registradas de hasta 20k tokens.
- Integración en pipelines de agentes con decodificación especulativa: la draft head incluida permite acelerar la generación en el motor aqwenator, útil en flujos de múltiples pasos donde la latencia por token importa.
- Experimentación con motores de inferencia alternativos: como referencia para comparar el rendimiento de aqwenator (Rust, NVIDIA) frente a vLLM o llama.cpp usando el checkpoint de Intel o un GGUF equivalente.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Divergencia KL media frente al bf16 original | 0,08 a 0,15 nats |
| Acuerdo top-1 frente al bf16 original | ~92 % |
| Contexto de evaluacion | Sesiones de agente registradas de hasta 20k tokens |
| Memoria asignada por el motor (config. 8 GB) | 6,5 GiB + contexto CUDA |
| Precisión de pesos | Idéntica a la cuantización de Intel (sin recuantizar) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La métrica de divergencia KL procede de la model card del autor y se midió con aqwenator; el error aumenta con la longitud del contexto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,5 GiB asignados por el motor más el contexto CUDA en la configuración de ejemplo, pensada para una GPU de 8 GB. El tamaño del repositorio es de 9,2 GB.
- GPU recomendadas: NVIDIA (el motor aqwenator está especializado en GPUs NVIDIA); modelos concretos no disponibles en la información proporcionada.
- GPU de consumo: sí, el autor dimensiona la configuración para una tarjeta de 8 GB, aunque indica que la prueba en una tarjeta real de 8 GB está pendiente; las comprobaciones se hicieron en hardware mayor.
- Opciones de despliegue: aqwenator 0.3.0 vía Docker (`ghcr.io/mcpatate/aqwenator:0.3.0`) o binario local. No es compatible con transformers, vLLM ni llama.cpp; para estos hay que usar el checkpoint de Intel o un GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| mcpotato/Qwen3.5-9B-int4-aqwenator | 6.247.902.960 | 16.384 (config. ejemplo) | 4 bits AutoRound, formato aqwenator | Apache 2.0 | Solo aqwenator |
| Intel/Qwen3.5-9B-int4-AutoRound | no disponible | no disponible | 4 bits AutoRound | Apache 2.0 (heredada) | Ecosistema estandar (transformers, vLLM) |
| Qwen/Qwen3.5-9B | no disponible | no disponible | bf16 | Apache 2.0 | Ecosistema estandar |

La comparativa con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: solo aqwenator lee este archivo; transformers, vLLM y llama.cpp no pueden cargarlo.
- Degradación de calidad por cuantización: divergencia KL de 0,08 a 0,15 nats y ~92 % de acuerdo top-1 frente al bf16; el error crece con la longitud del contexto.
- Validación incompleta en hardware de 8 GB: el autor confirma que la configuración aún no se ha probado en una tarjeta real de 8 GB.
- Idiomas soportados no declarados: no se puede confirmar cobertura multilingüe más allá de la del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar también las notas de la model card de Intel/Qwen3.5-9B-int4-AutoRound.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto de autor individual con motor en versión 0.3.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcpotato/Qwen3.5-9B-int4-aqwenator
- Modelo base cuantizado: https://huggingface.co/Intel/Qwen3.5-9B-int4-AutoRound
- Modelo bf16 original: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Repositorio del motor aqwenator: https://github.com/McPatate/aqwenator
- Script de conversión: https://github.com/McPatate/aqwenator/blob/main/scripts/convert_autoround.py
- Documentación de cuantización: https://mcpatate.github.io/aqwenator/quantization.html
- AutoRound (Intel): https://github.com/intel/auto-round
