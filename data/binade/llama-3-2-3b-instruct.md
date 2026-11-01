# Binade/Llama-3.2-3B-Instruct

## Resumen

Binade/Llama-3.2-3B-Instruct es un empaquetado del modelo Llama 3.2 3B Instruct de Meta que aplica el formato de compresión sin pérdida Binade, desarrollado por Guy Shafir. El resultado ocupa 4,31 GB en lugar de los 6,43 GB del checkpoint BF16 original, reduciendo el coste de almacenamiento a 10,731 bits por peso en los tensores empaquetados. La particularidad clave es que la compresión es bit a bit: al descomprimir se recuperan exactamente los mismos pesos y las salidas generadas son idénticas a las del modelo BF16 original, no simplemente aproximadas.

A diferencia de la cuantización tradicional (que sacrifica precisión a cambio de tamaño), Binade codifica el exponente de cada peso por su rango de frecuencia y conserva íntegros el signo y la mantisa. Esto resuelve un problema real en inferencia local: reducir el footprint en disco y en memoria sin alterar el comportamiento del modelo, algo especialmente relevante en Apple Silicon, donde la memoria unificada es un recurso compartido.

El modelo base conserva las capacidades de Llama 3.2 3B Instruct: un transformer decoder optimizado para diálogo, generación de texto y asistencia con herramientas, con licencia Llama 3.2 Community License. La ejecución requiere la librería `binade` (con soporte MLX para Apple Silicon y CUDA 12 en Linux).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2), empaquetado con formato Binade 2 |
| Parametros totales | 3.505.737.075 (según safetensors; el modelo base Llama 3.2 3B tiene 3,21 B de parámetros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base Llama 3.2 3B Instruct) |
| Tipos de cuantizacion | Ninguna: compresión sin pérdida a 10,731 bits/peso (equivalente BF16 restaurado); el Hub lo etiqueta como 8-bit por almacenar los bytes empaquetados como uint8 |
| Idiomas | no disponible (el modelo base soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.2 Community License (el formato Binade es Apache-2.0) |
| Formato de pesos | Safetensors empaquetados con Binade (uint8); desempaquetables a BF16 bit a bit |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 3B Instruct, un transformer decoder autorregresivo de Meta con la arquitectura estándar de la familia Llama 3 (atención agrupada por consultas, RoPE, normalización RMSNorm). Sobre él, este repositorio no modifica la arquitectura ni los pesos: aplica el formato Binade, un esquema de compresión sin pérdida que explota la distribución no uniforme de los exponentes en punto flotante BF16. Cada exponente se codifica por su rango de frecuencia (los valores más frecuentes reciben códigos más cortos), mientras que el signo y la mantisa se mantienen intactos.

La clave de la exactitud bit a bit está en los kernels de decodificación: Binade decodifica los pesos dentro del propio producto matricial y suma los productos en exactamente el mismo orden que los kernels BF16 nativos del framework (MLX). De este modo, los logits y los tokens generados coinciden con los del modelo original. Los datos de entrenamiento del modelo base no se detallan en la model card de este repositorio; corresponden a los de Llama 3.2 3B Instruct de Meta (preentrenamiento multilingüe más alineación con SFT y RLHF/DPO, según la documentación oficial de Meta).

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento general, redacción y resumen heredados de Llama 3.2 3B Instruct.
- Generación y comprensión de código a nivel de modelo de 3B.
- Soporte de tool calling / function calling (capacidad nativa de Llama 3.2 Instruct).
- Salidas bit-idénticas al modelo BF16 original: tokens y log-probabilidades exactamente iguales, verificado en 32 generaciones greedy de 128 tokens.
- Restauración lossless del checkpoint BF16 original con `binade unpack`.
- Ejecución con kernels fusionados de prompt en GPU de Apple Silicon (M3/M4) y en NVIDIA verificadas (RTX PRO 6000, L4, A100).
- Capacidades multilingües: las del modelo base Llama 3.2 (no disponibles datos específicos en esta model card).

## Casos de uso

- Inferencia local en Apple Silicon con memoria ajustada: al ocupar 4,31 GB en lugar de 6,43 GB, cabe con más holgura en la memoria unificada de Macs con 8-16 GB, dejando espacio para el KV cache y otras aplicaciones, sin penalización de calidad.
- Despliegues que exigen reproducibilidad exacta: como las salidas son bit-idénticas al BF16 original, es adecuado para entornos de evaluación, tests de regresión o auditoría donde una cuantización estándar invalidaría las comparaciones.
- Reducción de costes de almacenamiento y transferencia: un 33 % menos de descarga y de espacio en disco respecto al checkpoint BF16, útil para granjas de inferencia que replican el modelo en muchos nodos.
- Experimentación y comparación de métodos de compresión: el repositorio publica verificaciones de exactitud (254 tensores comparados, 0 diferencias) que lo hacen útil como referencia frente a cuantizaciones con pérdida como MLX 8-bit (que en los tests solo alcanzó un 98,0 % de acuerdo de argmax).
- Asistentes conversacionales y chatbots ligeros: el modelo base está instruido para diálogo multi-turno, y la inferencia vía mlx-lm es directa con pocas líneas de código.
- Prototipado de agentes con tool calling en portátiles Mac: soporta la plantilla de chat de Llama 3.2 Instruct y las capacidades de herramientas del modelo base sin degradación numérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Dado que los pesos y las salidas son bit-idénticos al modelo BF16 original, el rendimiento en benchmarks debería coincidir exactamente con el de meta-llama/Llama-3.2-3B-Instruct.

Datos de verificación publicados en la model card:

| Comprobación | Resultado |
|---|---|
| Tensores desempaquetados comparados con el checkpoint original | 254 tensores, 0 valores diferentes |
| Logits en 16.352 posiciones de WikiText-2 (Apple M4 Max, vs BF16) | 16.352 / 16.352 bit-idénticos |
| 32 generaciones greedy de 128 tokens (Apple M4 Max) | 32 / 32 idénticas (tokens y log-probabilidades) |
| Cuantización MLX 8-bit (comparación) | 0 / 16.352 posiciones idénticas, acuerdo de argmax 98,0 % |

## Requisitos de hardware

- VRAM/memoria estimada: al menos 4,31 GB solo para los pesos; en la práctica se recomiendan 8 GB de memoria unificada o VRAM para dejar margen al KV cache y al contexto (con 128k tokens el KV cache puede crecer considerablemente).
- Apple Silicon: kernels fusionados de prompt verificados en GPUs M3 y M4 (probado en M4 Max).
- NVIDIA: kernels verificados en RTX PRO 6000, L4 y A100 con CUDA 12. En otras GPUs, los prompts reconstruyen los pesos BF16, lo cual es exacto pero más lento.
- Sí cabe en GPUs de consumo: una RTX 4090 (24 GB) o incluso GPUs de 8 GB lo acomodan con holgura; en Apple Silicon, Macs con 8 GB o más de memoria unificada.
- Despliegue: vía `pip install binade` (Apple Silicon) o `pip install "binade[cuda]"` (Linux + CUDA 12), con MLX 0.32.2 y mlx-lm 0.31.3 instalados automáticamente. No se menciona soporte nativo de vLLM, llama.cpp, Ollama o TGI; no disponible.
- Latencia y throughput: no disponibles datos concretos; la model card indica que en GPUs NVIDIA no verificadas la reconstrucción BF16 de los pesos hace el prompt más lento.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Exactitud de salida | Contexto | Licencia |
|---|---|---|---|---|---|
| Binade/Llama-3.2-3B-Instruct | 3,21 B (3,50 G en safetensors) | Binade sin pérdida, 4,31 GB (10,731 bits/peso) | Bit-idéntica al BF16 | 128k | Llama 3.2 Community |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | BF16, 6,43 GB | Referencia | 128k | Llama 3.2 Community |
| unsloth/Llama-3.2-3B-Instruct (BF16) | 3,21 B | BF16, 6,43 GB | Idéntica (mismos pesos byte a byte) | 128k | Llama 3.2 Community |
| Llama-3.2-3B-Instruct con MLX 8-bit | 3,21 B | Cuantización con pérdida, ~2 GB aprox. | No exacta (98,0 % acuerdo de argmax en los tests) | 128k | Llama 3.2 Community |

La alternativa MLX 8-bit ocupa menos espacio, pero altera las salidas; Binade ofrece el punto intermedio de comprimir un tercio manteniendo exactitud total.

## Limitaciones y advertencias

- La exactitud bit a bit está ligada a los kernels de MLX; cualquier cambio de versión puede requerir reverificación. Requiere MLX 0.32.2 y mlx-lm 0.31.3.
- En GPUs NVIDIA no verificadas (distintas de RTX PRO 6000, L4 y A100), los prompts reconstruyen los pesos BF16: el resultado es exacto pero más lento.
- La exactitud solo ha sido probada en generación de texto; otros modos (por ejemplo, uso extendido de herramientas complejas) no están verificados explícitamente.
- El Hub etiqueta el repositorio como 8-bit y cuenta los parámetros por bytes (uint8), lo que puede inducir a confusión: los pesos son los BF16 completos.
- Sesgos y riesgo de alucinación: los heredados de Llama 3.2 3B Instruct; al ser un modelo de 3B, su capacidad de razonamiento es limitada frente a modelos mayores y puede alucinar en preguntas de conocimiento factual.
- Licencia: uso sujeto a la Llama 3.2 Community License de Meta y su política de uso aceptable, con restricciones para productos con más de 700 millones de usuarios activos mensuales. La librería Binade en sí es Apache-2.0.
- Repositorio de reciente creación (octubre de 2026) con pocas descargas (498) y sin comunidad de validación externa todavía.
- No hay soporte documentado para runtimes estándar (vLLM, llama.cpp, Ollama): el despliegue queda ligado al ecosistema Binade/MLX.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Binade/Llama-3.2-3B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Copia empaquetada de origen (unsloth): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Repositorio Binade (código): https://github.com/GuyShafir/binade
- Paper de Binade: https://github.com/GuyShafir/binade/blob/main/paper/binade.pdf
- Verificación de roundtrip: https://github.com/GuyShafir/binade/blob/main/results/Llama-3.2-3B-Instruct/roundtrip_v2.md
- Verificación de exactitud a escala: https://github.com/GuyShafir/binade/blob/main/results/Llama-3.2-3B-Instruct/exactness_scale.md
