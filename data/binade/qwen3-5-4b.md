# Binade/Qwen3.5-4B

## Resumen

Binade/Qwen3.5-4B es un checkpoint del modelo Qwen3.5-4B de Qwen empaquetado con Binade, una herramienta de compresión sin pérdida desarrollada por Guy Shafir y Tulber. El objetivo no es crear un modelo nuevo, sino reducir el espacio en disco y acelerar la inferencia manteniendo una equivalencia bit a bit con el modelo BF16 original. El checkpoint empaquetado ocupa 6,27 GB frente a los 9,32 GB del BF16, lo que equivale a 10,743 bits por peso en los tensores empaquetados frente a 16 bits del formato original.

La relevancia de esta ficha radica en que Binade propone un enfoque distinto al de las cuantizaciones convencionales (GPTQ, AWQ, MLX 8-bit): en lugar de aproximar los pesos, los comprime codificando el exponente de cada peso por su rango de frecuencia y conservando intactos el signo y la mantisa. Los kernels decodifican los pesos dentro de las propias multiplicaciones de matrices y acumulan los productos en el mismo orden que los kernels BF16 del framework, de modo que los logits y los tokens generados coinciden con los del modelo original.

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5 de Alibaba Qwen. La model card de este repositorio no detalla la arquitectura interna, el contexto ni los datos de entrenamiento del modelo base; esta ficha se limita a los datos verificables del empaquetado y del checkpoint. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B; detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | 5.084.799.654 (según safetensors; el Hub los cuenta por bytes porque los pesos empaquetados se almacenan como tensores uint8) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Compresión sin pérdida Binade (10,743 bits por peso en tensores empaquetados); el runtime carga pesos BF16 completos. La model card menciona MLX 8-bit solo como comparación de pérdida, no como formato soportado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos del modelo base); Binade es Apache-2.0 |
| Formato de pesos | Safetensors empaquetados con Binade formato 2 (commit `d0315fd`); `binade unpack` restaura el checkpoint BF16 bit a bit |

## Arquitectura y entrenamiento

El checkpoint no introduce cambios en la arquitectura del modelo base: es Qwen3.5-4B con todos sus tensores originales, incluidos los pesos de visión y de predicción multi-token, aunque el runtime carga únicamente el modelo de texto a través de mlx-lm. La innovación está en el formato de almacenamiento y en los kernels de decodificación. Binade codifica el exponente de cada peso por su rango de frecuencia y mantiene el signo y la mantisa sin modificar; los kernels decodifican los pesos dentro de las multiplicaciones de matrices y suman los productos en el mismo orden que los kernels BF16 del framework, lo que garantiza que los logits coincidan exactamente.

La verificación de exactitud reportada en la model card incluye tres pruebas: los 738 tensores desempaquetados y comparados con el checkpoint original sin ninguna diferencia; 16.352 posiciones de WikiText-2 con logits idénticos bit a bit frente al BF16 en memoria en un Apple M4 Max; y 32 generaciones greedy de 128 tokens idénticas en tokens y log-probabilidades. Como contraste, la cuantización MLX 8-bit no reproduce ninguna de las 16.352 posiciones y su acuerdo de argmax es del 98,0 %. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y la model card incluye un ejemplo de chat con `apply_chat_template`.
- Inferencia con equivalencia bit a bit respecto al modelo BF16: los logits y los tokens generados coinciden exactamente con los del checkpoint original.
- Restauración del checkpoint original: `binade unpack` recupera todos los tensores, incluidos los de visión y predicción multi-token, bit a bit.
- Ejecución en Apple Silicon (M3 y M4) con kernels de prompt fusionados, y en NVIDIA (RTX PRO 6000, L4 y A100 verificadas).
- Capacidades del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo): no disponibles en la información proporcionada; la model card no las detalla.
- Capacidades de visión y predicción multi-token: los pesos están presentes en el checkpoint, pero el runtime sirve únicamente texto y la exactitud solo se probó en generación de texto.

## Casos de uso

- Inferencia en Apple Silicon con requisitos de reproducibilidad: cargar el checkpoint con `binade.mlx.r4.load` en un M3 o M4 para obtener exactamente las mismas salidas que el modelo BF16, útil en evaluación y auditoría de modelos donde la reproducibilidad bit a bit es un requisito.
- Despliegue con restricciones de disco: el checkpoint ocupa 6,27 GB frente a 9,32 GB del BF16, lo que reduce el espacio necesario en máquinas con almacenamiento limitado sin sacrificar fidelidad de los pesos.
- Aceleración de decodificación greedy en Apple Silicon: la model card reporta 66,0 tok/s frente a 52,1 tok/s del BF16 en un M4 Max, por lo que resulta adecuado para prototipado interactivo local.
- Evaluación comparativa de cuantizaciones: al ser bit-exacto, sirve como referencia frente a esquemas con pérdida como MLX 8-bit, que solo coincide en el 98,0 % de los argmax.
- Archivado y distribución de pesos: el formato empaquetado reduce el tamaño de distribución y permite restaurar el BF16 original con `binade unpack` cuando se necesite el checkpoint sin empaquetar.
- Servicio de texto en GPU NVIDIA: en RTX PRO 6000, L4 y A100 los kernels fusionados están verificados; en otras GPU el prompt reconstruye los pesos BF16, lo que sigue siendo exacto pero más lento.

## Benchmarks y rendimiento

| Métrica | BF16 | Binade | MLX 8-bit (con pérdida) |
|---|---|---|---|
| Tamaño del checkpoint | 9,32 GB | 6,27 GB | no disponible |
| Bits por peso (tensores empaquetados) | 16 | 10,743 | no disponible |
| Decodificación greedy, Apple M4 Max | 52,1 tok/s | 66,0 tok/s | no disponible |
| Posiciones de WikiText-2 con logits idénticos | referencia | 16.352 / 16.352 | 0 / 16.352 |
| Acuerdo de argmax | referencia | 100 % | 98,0 % |
| Tensores verificados en roundtrip | referencia | 738, 0 diferencias | no aplica |
| Generaciones greedy de 128 tokens idénticas | referencia | 32 / 32 | no disponible |

No se han publicado resultados de benchmarks de calidad del modelo base (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint empaquetado ocupa 6,27 GB en disco y los pesos se cargan como BF16 completos, por lo que se requiere memoria suficiente para el modelo BF16 (el checkpoint original pesa 9,32 GB).
- GPU recomendadas: Apple Silicon M3 y M4 (kernels de prompt fusionados); NVIDIA RTX PRO 6000, L4 y A100 verificadas. En otras GPU NVIDIA los prompts reconstruyen los pesos BF16, lo que es exacto pero más lento.
- Compatibilidad con GPU de consumo: no se especifica; la model card solo menciona M3/M4 y las GPU NVIDIA citadas.
- Opciones de despliegue: `pip install binade` (Apple Silicon) o `pip install "binade[cuda]"` (Linux + CUDA 12); requiere MLX 0.32.2 y mlx-lm 0.31.3, que instala el propio paquete. La carga se hace con `binade.mlx.r4.load`.
- Latencia y throughput: 66,0 tok/s en decodificación greedy sobre Apple M4 Max con Binade frente a 52,1 tok/s con BF16. No se reportan cifras para NVIDIA en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Binade/Qwen3.5-4B | 5.084.799.654 | no disponible | Safetensors empaquetados Binade | Apache-2.0 | Compresión sin pérdida, salidas bit-idénticas al BF16 |
| Qwen/Qwen3.5-4B (BF16) | no disponible en esta ficha | no disponible | BF16 | Apache-2.0 | Modelo base; 9,32 GB, 52,1 tok/s en M4 Max |
| Qwen3.5-4B con MLX 8-bit | no disponible | no disponible | 8-bit con pérdida | Apache-2.0 (del base) | 0 / 16.352 posiciones idénticas, argmax 98,0 % |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría (por ejemplo, otras familias de 4B) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La exactitud está ligada a los kernels de MLX; las pruebas del repositorio la verifican con MLX 0.32.2 y mlx-lm 0.31.3.
- En GPU NVIDIA distintas de RTX PRO 6000, L4 y A100, los prompts reconstruyen los pesos BF16: es exacto pero más lento.
- El runtime sirve únicamente texto; aunque el checkpoint conserva los pesos de visión y predicción multi-token, la exactitud solo se probó en generación de texto.
- El Hub etiqueta el repositorio como 8-bit y cuenta los parámetros por bytes porque los pesos empaquetados se almacenan como uint8; los pesos reales son BF16 completos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026: no hay evidencia de uso en producción.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones de contexto o idioma del modelo base en la documentación proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero se deben respetar los términos del modelo base y de Binade.
- El checkpoint depende de la herramienta Binade y de su formato 2 (commit `d0315fd`); cambios de versión pueden afectar a la compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Binade/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de Binade: https://github.com/GuyShafir/binade
- Paper de Binade: https://github.com/GuyShafir/binade/blob/main/paper/binade.pdf
- Resultados de roundtrip: https://github.com/GuyShafir/binade/blob/main/results/Qwen3.5-4B/roundtrip_v2.md
- Resultados de exactitud: https://github.com/GuyShafir/binade/blob/main/results/Qwen3.5-4B/exactness_scale.md
- Velocidad de decodificación: https://github.com/GuyShafir/binade/blob/main/results/Qwen3.5-4B/decode_speed.md
- Resultados en NVIDIA: https://github.com/GuyShafir/binade/tree/main/results
- Licencia: https://huggingface.co/Binade/Qwen3.5-4B/blob/main/LICENSE
