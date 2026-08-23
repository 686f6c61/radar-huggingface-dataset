# kingjones777/Ling-3.0-flash-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

Ling-3.0-flash-ROCmFP4-STRIX_LEAN-GGUF es una cuantización GGUF del modelo instructivo `inclusionAI/Ling-3.0-flash`, preparada específicamente para hardware AMD con arquitectura gfx1151 (APU Strix Halo, como el Ryzen AI Max+ 395). El autor, kingjones777, ha aplicado el formato experimental ROCmFP4 (Q4_0_ROCMFP4_STRIX_LEAN) para optimizar la inferencia en entornos ROCm de llama.cpp, logrando un tamaño de archivo de aproximadamente 68 GB y un peso medio de 4,28 bits por parámetro. El modelo original posee 127,5 mil millones de parámetros y una ventana de contexto de 262 144 tokens, lo que lo hace apto para tareas de razonamiento y generación de texto de largo alcance.

Esta cuantización está pensada para ser ejecutada en APU con memoria unificada de gran capacidad (128 GB), donde el modelo completo cabe en VRAM. El repositorio incluye la conversión desde BF16 y el comando de cuantización, así como pruebas de generación con mediciones de rendimiento (107,9 tokens/s en prefill y 30,7 tokens/s en generación). La licencia MIT permite uso comercial y modificación sin restricciones significativas, aunque la precisión reducida puede afectar la calidad de salida en comparación con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailingmoe3 (posiblemente MoE, no confirmado) |
| Parametros totales | 127 486 405 600 |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (ftype 106, ~4.28 BPW) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base `Ling-3.0-flash` se identifica como `bailingmoe3` en el README de esta cuantización, lo que sugiere una arquitectura de mezcla de expertos (MoE), aunque no se confirma en la información disponible. El modelo cuenta con 43 bloques y una capa de predicción multi-token (MTP) en el bloque 42 (`nextn_predict_layers = 1`), que permite generar varios tokens por paso de decodificación. No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens de entrenamiento o el proceso de alineamiento (RLHF/DPO) del modelo original.

La cuantización ROCmFP4 es una técnica experimental desarrollada para aprovechar las capacidades de precisión mixta de las GPU AMD recientes. En este caso, se aplica un esquema Q4_0 con un layout especial para las matrices K/V, y se protegen las capas críticas: la salida (`output.weight`) se cuantiza a Q6_K y las embeddings (`token_embd.weight`) a Q5_K, mientras que el resto se mantiene en 4 bits. El proceso de conversión y cuantización se realiza con las herramientas de llama.cpp (convert_hf_to_gguf.py y llama-quantize).

## Capacidades

- Generación de texto: produce respuestas coherentes y bien estructuradas en formato instructivo, como se muestra en el ejemplo del README.
- Razonamiento: el modelo activa un modo de "pensamiento" previo a la respuesta final (evidenciado por las marcas `[Start thinking]` y `[End thinking]`), lo que sugiere capacidad de razonamiento explícito.
- Predicción multi-token (MTP): el modelo incluye una capa de predicción multi-token que puede acelerar la decodificación, aunque el README indica que en pruebas no aporta una mejora significativa (+1.3% / +5.3%).
- Contexto largo: con una ventana de 262 144 tokens, puede manejar documentos extensos o conversaciones de múltiples turnos sin perder el hilo.
- Compatibilidad con llama.cpp: se integra con el ecosistema de llama.cpp, incluyendo la interfaz de línea de comandos `llama-cli`.

## Casos de uso

- Análisis y resumen de documentos extensos: gracias a su contexto de 262 144 tokens, puede procesar libros, informes técnicos o historiales de conversación completos en una sola pasada, generando resúmenes detallados y respuestas basadas en el contenido completo.
- Asistencia en investigación histórica o académica: el ejemplo del README muestra cómo el modelo puede completar fragmentos de texto con conocimiento enciclopédico (p. ej., historia de las matemáticas) y proporcionar referencias concretas.
- Generación de contenido creativo: puede redactar artículos, guiones o narrativas con una estructura razonada, gracias a su modo de pensamiento interno.
- Soporte de razonamiento multi-paso: útil para tareas de resolución de problemas complejos que requieren planificación y análisis (por ejemplo, preguntas de matemáticas o lógica).
- Despliegue en hardware AMD de alto rendimiento: pensado para ejecutarse en una APU Strix Halo (gfx1151) con 128 GB de memoria unificada, sin necesidad de GPU dedicada adicional.
- Prototipado de aplicaciones de texto generativo: al ser una cuantización de 4 bits, permite probar un modelo de 127B en un solo dispositivo, ideal para entornos de desarrollo y experimentación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. El README incluye únicamente una medición de rendimiento en el hardware de prueba (gfx1151) con llama.cpp:

| Métrica | Valor |
|---|---|
| Velocidad de preprocesado (prompt) | 107.9 tokens/s |
| Velocidad de generación | 30.7 tokens/s |

Estos datos se obtuvieron con los flags `-ngl 999 -fa on -c 2048 -n 512 --temp 0 --seed 1234 -no-cnv` y un prompt corto. No hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 68 GB, por lo que se requiere al menos esa cantidad de memoria disponible (unificada o VRAM dedicada).
- GPU recomendada: AMD gfx1151 (APU Strix Halo, por ejemplo Ryzen AI Max+ 395 con Radeon 8060S). La cuantización está específicamente optimizada para esta arquitectura.
- Compatibilidad con GPUs de consumo: no es apto para GPUs NVIDIA o AMD más antiguas sin soporte ROCmFP4. En GPUs NVIDIA no funcionará correctamente.
- Opciones de despliegue: llama.cpp con soporte ROCm (compilación con ROCm) y el binario `llama-cli`. No se menciona compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: en el hardware de prueba se midió 107.9 t/s en prompt y 30.7 t/s en generación. La latencia para la generación de una respuesta de 512 tokens sería de aproximadamente 16,7 segundos (512 / 30.7).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (tamaño y propósito). El modelo base `Ling-3.0-flash` podría compararse con otros MoE de 100B+, pero no hay datos de rendimiento estándar. Se puede indicar que la cuantización es única para hardware AMD y no se conocen otras versiones GGUF con esta configuración.

## Limitaciones y advertencias

- Precisión reducida: la cuantización a 4 bits (Q4_0) puede degradar la calidad de la generación en comparación con el modelo BF16 original, especialmente en tareas de matemáticas o razonamiento complejo.
- Dependencia de hardware específico: está optimizado para AMD gfx1151; no funcionará en GPUs NVIDIA o AMD de otras arquitecturas sin modificaciones.
- Soporte experimental: ROCmFP4 es un formato experimental, por lo que puede haber incompatibilidades con versiones de llama.cpp o fallos en ciertas funciones.
- Problemas con la línea de comandos: el README indica que la opción `-no-cnv` no es soportada en el binario probado; se debe usar `-st` o `--single-turn` para completar una sola vez.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información plausible pero incorrecta, especialmente en dominios no representados en sus datos de entrenamiento.
- No se han documentado sesgos específicos ni restricciones de idioma, pero al ser un modelo general, puede heredar sesgos de los datos de entrenamiento.

## Enlaces

- Modelo GGUF: https://huggingface.co/kingjones777/Ling-3.0-flash-ROCmFP4-STRIX_LEAN-GGUF
- Modelo base (inclusionAI/Ling-3.0-flash): https://huggingface.co/inclusionAI/Ling-3.0-flash
- Repositorio ROCmFP4 en GitHub: https://github.com/charlie12345/rocmfp4
- Otras variantes del autor (base 30T, COHERENT): https://huggingface.co/kingjones777/Ling-3.0-flash-base-30T-ROCmFP4-COHERENT-GGUF y https://huggingface.co/kingjones777/Ling-3.0-flash-base-ROCmFP4-COHERENT-GGUF
