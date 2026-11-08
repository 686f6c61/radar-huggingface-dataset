# hyperionaidev/Moon-Beam-8B-A1B-tvbox-GGUF

## Resumen

Moon-Beam-8B-A1B-tvbox-GGUF es una cuantización extrema en formato GGUF del modelo tablinum/Moon-Beam-8B-A1B-Preview, publicada por el usuario hyperionaidev dentro del proyecto smolmaxxing. El objetivo declarado no es otro que demostrar que un modelo de mezcla de expertos (MoE) de 8.000 millones de parámetros totales puede ejecutarse en hardware de consumo marginal: concretamente, en un Xiaomi TV Box S (3.ª generación) con cuatro núcleos Cortex-A55 y aproximadamente 1 GB de RAM utilizable, a 7,2 tokens por segundo en conversación real.

El modelo base, Moon-Beam-8B-A1B, es un MoE de 128 expertos construido sobre inclusionAI Ling-3.0-tiny y combinado con la biblioteca de conocimiento recuperable de Tablinum (el "engram"). La versión aquí descrita cuantiza los expertos a Q2_K con una matriz de importancia (imatrix) derivada de muestras de Wikipedia y Project Gutenberg, mientras que el resto de componentes (atención, DeltaNet, experto compartido, embeddings y cabeza de salida) se mantienen en Q4_K. El resultado es un archivo de 2,75 GB.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de despliegue en el límite del hardware (paginación de expertos desde almacenamiento flash, enrutamiento consciente de caché y prefetch precalculado); por otro, advierte de que el archivo requiere un llama.cpp parcheado y una cabeza de salida podada a 60.000 filas, lo que rompe la compatibilidad con herramientas estándar como Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 128 expertos, basada en inclusionAI Ling-3.0-tiny; incluye componentes DeltaNet y experto compartido |
| Parametros totales | 7.744.178.176 (8B) |
| Parametros activos | Aproximadamente 1B por token (A1B) |
| Longitud de contexto | 131.072 tokens en metadatos; ejecutado a 1.024 tokens en el TV Box |
| Tipos de cuantizacion | Expertos en Q2_K con imatrix; atención, DeltaNet, experto compartido, embeddings y cabeza en Q4_K; caché KV en q8_0 en la configuración de referencia |
| Idiomas soportados | No disponible (la model card menciona corpus en inglés y multilingüe para la selección de la cabeza, pero no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `mb-q2-h60.gguf`, 2,75 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos, 8.000 millones de parámetros totales y aproximadamente 1.000 millones activos por token. Integra componentes DeltaNet junto con un experto compartido, y se apoya en la biblioteca de conocimiento recuperable de Tablinum (engram) sobre el modelo Ling-3.0-tiny de inclusionAI. La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación de esta publicación concreta es de despliegue, no de entrenamiento. Los expertos se cuantizan a Q2_K usando una imatrix calculada sobre una muestra de Wikipedia y Project Gutenberg, y se paginan bajo demanda desde almacenamiento flash. El llama.cpp parcheado incorpora un paginador de expertos (`GGML_MOE_PAGER`), un sesgo de enrutamiento que favorece expertos ya residentes en RAM (`GGML_MOE_BIAS`), un pool de expertos por capa (`GGML_MOE_POOL`), prefetch precalculado (`GGML_MOE_PREFETCH_K`, `GGML_MOE_PREFETCH_AHEAD`), arranque en caliente con lista de expertos (`GGML_MOE_WARM`) y una caché de repack en disco (`GGML_REPACK_CACHE`). Además, la cabeza de salida se poda de 157.184 a 60.000 filas mediante un tensor `output_ids`, seleccionadas por frecuencia de token en un corpus inglés y multilingüe.

## Capacidades

- Generación de texto conversacional en inglés y, según la model card, con cobertura parcial de tokens multilingües en la cabeza de salida.
- Razonamiento y generación de texto general propio del modelo base Moon-Beam-8B-A1B-Preview.
- Ejecución en entornos de muy baja memoria mediante paginación de expertos desde flash.
- Ajuste de calidad y velocidad en tiempo de ejecución variando el número de expertos por token (6 por defecto, 8 para mayor calidad a costa de aproximadamente un 5 % de velocidad).
- Mitigación de bucles degenerativos mediante penalización de repetición (`--repeat-penalty 1.15 --repeat-last-n 256`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- No se documenta un modo "thinking" explícito.

## Casos de uso

- Inferencia en dispositivos de gama ultra baja: el caso de referencia es un Xiaomi TV Box S con 4× Cortex-A55 y ~1 GB de RAM, donde el modelo genera a 7,2 tok/s con ~1,14 GB de RSS en modo headless. Sirve para asistentes locales de texto en televisores, decodificadores o placas SBC con poca memoria.
- Demostración e investigación de paginación de expertos MoE: el archivo y el parche permiten estudiar técnicas de enrutamiento consciente de caché, prefetch y arranque en caliente sobre modelos MoE reales, comparando calidad (bits por byte) frente a velocidad.
- Evaluación de cuantización Q2_K con imatrix: útil para medir la degradación de perplejidad al cuantizar expertos a 2 bits manteniendo el resto en Q4_K, con una referencia concreta de 0,996 bits por byte frente a 0,974 de Bonsai-8B en el mismo texto.
- Prototipado de asistentes conversacionales offline: al no requerir conexión ni GPU, permite validar flujos de chat multi-turno en entornos sin red, aceptando el coste de calidad de una cuantización agresiva.
- Pruebas de robustez frente a bucles degenerativos: el modelo documenta que los expertos Q2_K derivan en repeticiones tras 250-300 palabras sin penalización, lo que lo convierte en un banco de pruebas para estrategias de sampling y penalización.
- Integración en pipelines de CI para validar compatibilidad de llama.cpp: permite comprobar que builds parcheados cargan correctamente tensores `output_ids` y cabezas podadas, detectando regresiones en el soporte de GGUF no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de calidad por perplejidad y de velocidad en el dispositivo de referencia:

| Metrica | Configuracion | Valor |
|---|---|---|
| Calidad (bits/byte, menor es mejor) | Top-6 expertos, bias 0,25, prefetch, repeat penalty | 0,996 |
| Calidad (bits/byte) | Top-8 expertos, bias 0,2 | 0,963 |
| Calidad de referencia (bits/byte) | Bonsai-8B sobre el mismo texto | 0,974 |
| Velocidad de chat real | Xiaomi TV Box S (3.ª gen.) | 7,2 tok/s |
| Velocidad de chat real | Top-8 expertos | ~6,9 tok/s |
| RAM (RSS) | Modo headless | ~1,14 GB |
| Respuestas largas con bucle | Configuración por defecto | 2 de 8 |

## Requisitos de hardware

- VRAM/RAM estimada: ~1,14 GB de RSS en modo headless con paginación de expertos; en un equipo con RAM suficiente, el archivo de 2,75 GB se carga con todos los expertos residentes.
- Almacenamiento: el GGUF de 2,75 GB más una caché de repack de 2,6 GB en flash.
- GPU recomendadas: no se documentan; el caso de referencia es CPU pura (4× Cortex-A55). Cualquier GPU con al menos 3-4 GB de VRAM podría alojar el modelo completo, aunque no se han publicado mediciones.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 4 GB o más (GTX 1650, RTX 3050, etc.), aunque no hay datos medidos en la información disponible.
- Opciones de despliegue: exclusivamente llama.cpp parcheado del repositorio smolmaxxing (llama.cpp en el commit `8642541` con `patches/llama.cpp-v0.8.0-tvbox.patch`). Ollama, LM Studio y llama.cpp estándar no cargan el archivo.
- Latencia y throughput: 7,2 tok/s en el TV Box de referencia con top-6 expertos; ~6,9 tok/s con top-8. Sin datos para otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Moon-Beam-8B-A1B-tvbox-GGUF | 8B (MoE, 128 expertos) | ~1B | 131.072 (metadatos) | MIT | GGUF Q2_K/Q4_K | Requiere llama.cpp parcheado; cabeza podada a 60K |
| Moon-Beam-8B-A1B-Preview (base) | 8B (MoE, 128 expertos) | ~1B | 131.072 | MIT | Safetensors (no confirmado) | Modelo original de Tablinum sobre Ling-3.0-tiny |
| Bonsai-8B | No disponible | No disponible | No disponible | No disponible | No disponible | Referencia de calidad: 0,974 bits/byte frente a 0,996 de este archivo |

No se dispone de datos suficientes para comparar rendimiento en benchmarks estándar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Compatibilidad rota: el archivo incluye un tensor `output_ids` y una cabeza podada que impiden su carga en llama.cpp estándar, Ollama y LM Studio.
- Cabeza de salida reducida: solo puede generar 60.000 de los 157.184 tokens del vocabulario; los tokens raros y no latinos quedan en su mayoría fuera, lo que limita la generación multilingüe aunque las prompts puedan usar el vocabulario completo.
- Bucles degenerativos: los expertos Q2_K derivan en repeticiones tras 250-300 palabras sin `--repeat-penalty 1.15 --repeat-last-n 256`.
- Calidad degradada por cuantización: 0,996 bits/byte frente a 0,974 de Bonsai-8B en el mismo texto de referencia; la cuantización Q2_K de expertos es agresiva.
- Contexto efectivo limitado en el dispositivo de referencia: aunque los metadatos declaran 131.072 tokens, la ejecución en el TV Box usa 1.024 tokens.
- Sin datos de sesgos, alucinación o evaluación de seguridad en la información disponible.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- El campo `general.name` del metadato es "Merged R1B", heredado del archivo fuente, lo que puede confundir en auditorías.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hyperionaidev/Moon-Beam-8B-A1B-tvbox-GGUF
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- GGUF de origen: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Write-up del experimento: https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
