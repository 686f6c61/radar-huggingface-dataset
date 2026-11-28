# eval-apply/silvann_tq_D4_qwen3.8_27b

## Resumen

`silvann_tq_D4_qwen3.8_27b` es un empaquetado cuantizado del modelo denso Qwen/Qwen3.8-27B, publicado por el usuario eval-apply para el motor de inferencia SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). No se trata de un modelo nuevo ni de un fine-tune: el repositorio solo cambia cómo se almacenan los pesos del modelo original de Qwen, manteniendo tokenizer, chat template y configuraciones intactos.

La cuantización aplicada es TurboQuant a 4 bits por peso en todas las matrices de capa, con una escala por fila y una rotación bloqueada de Hadamard y signos a lo largo del eje de entrada. La embedding y la cabeza de salida se conservan a 8 bits, mientras que las normas y tensores pequeños quedan sin pérdida. El sufijo `D4` indica que el modelo es denso (sin expertos) y que las matrices de capa usan 4 bits. El resultado ocupa unos 15,7 GB en el repositorio, aproximadamente 15 GB según el autor.

Su relevancia es práctica: permite ejecutar un modelo de 27 000 millones de parámetros en entornos con menos memoria que la requerida por los pesos en BF16, a costa de depender del runtime propietario de SiLVANN y del formato `silvann-packed-v3`, que no es compatible con `transformers`. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.8-27B), empaquetado para el motor SiLVANN |
| Parametros totales | 27 000 millones (modelo base); no disponible el desglose exacto |
| Parametros activos | no aplica (modelo denso, sin expertos) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | TurboQuant 4 bits por peso en matrices de capa (escala por fila, rotacion Hadamard y signos bloqueada); embedding y cabeza a 8 bits; normas y tensores pequenos sin perdida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27 000 millones de parámetros. Este repositorio no entrena ni modifica el modelo: únicamente reempaqueta sus pesos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

La innovación técnica del empaquetado es el códec TurboQuant: cada matriz de capa se almacena a 4 bits por peso con una escala por fila y se rota a lo largo de su eje de entrada mediante una rotación bloqueada de Hadamard y signos, técnica que reduce el error de cuantización al distribuir la energía de los valores. La embedding y la cabeza de salida se mantienen a 8 bits y las normas quedan en precisión sin pérdida. El formato `silvann-packed-v3` se describe mediante `pack.json` (códec y política de anchura por tensor), con los registros de cada capa en `layers/NNN/` y los tensores globales en `global.pkl`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen/Qwen3.8-27B; no se documentan capacidades adicionales específicas del empaquetado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Compatibilidad restringida al runtime SiLVANN; no se puede cargar con `transformers`.

## Casos de uso

- Inferencia de un modelo de 27 000 millones de parámetros en GPUs con menos memoria que la requerida en BF16: el empaquetado a 4 bits reduce el peso de los pesos a unos 15 GB, lo que permite desplegar el modelo en una sola GPU de 24 GB o en configuraciones de 48 GB con margen para el contexto.
- Investigación sobre cuantización: el códec TurboQuant con rotación de Hadamard y escala por fila es un caso de estudio útil para medir el impacto de la cuantización a 4 bits en la calidad de salida frente a los pesos originales.
- Evaluación comparativa de motores de inferencia: permite comparar el rendimiento del runtime SiLVANN frente a vLLM, llama.cpp o TGI con el mismo modelo base.
- Despliegue en entornos con restricciones de almacenamiento: el repositorio de 15,7 GB facilita la distribución y el almacenamiento en caché local frente a los pesos sin cuantizar.
- Prototipado de asistentes conversacionales: al conservar el tokenizer y el chat template originales de Qwen, se puede reutilizar el mismo formato de prompt que con el modelo base, siempre que el frontend hable con el runtime SiLVANN.
- Pruebas de regresión de calidad tras cuantización: útil para equipos que necesitan verificar que la pérdida de precisión a 4 bits es aceptable en sus tareas concretas antes de adoptar el formato en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 15 GB solo para los pesos según el autor; hay que añadir la memoria de activaciones y caché KV, que depende de la longitud de contexto y del lote.
- GPU recomendadas: no especificadas por el autor; por tamaño, encajan GPUs con 24 GB o más (por ejemplo, RTX 4090, L40S, A100 40 GB, H100). No se confirma compatibilidad con ninguna GPU concreta.
- GPU de consumo: probablemente cabe en una RTX 4090 de 24 GB para contextos moderados, pero no hay datos oficiales de consumo de memoria total.
- Opciones de despliegue: exclusivamente el runtime SiLVANN (Eval-Apply GPU Interpreter); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| silvann_tq_D4_qwen3.8_27b | 27 000 M (denso) | no disponible | `silvann-packed-v3` (4/8 bits) | Apache 2.0 | Hugging Face, requiere runtime SiLVANN |
| Qwen/Qwen3.8-27B (modelo base) | 27 000 M (denso) | no disponible | safetensors (BF16) | Apache 2.0 | Hugging Face, compatible con `transformers` |
| Alternativas cuantizadas a 4 bits del mismo modelo base | 27 000 M (denso) | no disponible | GGUF/AWQ/GPTQ | Apache 2.0 | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime SiLVANN: el formato `silvann-packed-v3` no se lee con `transformers`, vLLM, llama.cpp ni otras herramientas estándar, lo que limita la portabilidad y crea dependencia de un único motor.
- Pérdida de precisión por cuantización: las matrices de capa están a 4 bits por peso; aunque la rotación de Hadamard y la escala por fila mitigan el error, no hay benchmarks publicados que cuantifiquen la degradación en tareas concretas.
- Sesgos y alucinaciones: no documentados en la información proporcionada; se heredan los del modelo base Qwen/Qwen3.8-27B, sobre el que no se aportan detalles.
- Idiomas y contexto: el repositorio no declara idiomas soportados ni longitud de contexto; conviene consultar la model card del modelo base antes de usarlo en producción.
- Licencia: Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el empaquetado; la responsabilidad sobre el modelo original recae en el equipo de Qwen.
- Madurez: 194 descargas y 0 likes en el momento de la consulta; proyecto de un solo autor sin validación comunitaria amplia.
- Fechas del repositorio: creado el 2026-09-28 y actualizado el 2026-11-11, según los metadatos de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D4_qwen3.8_27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
