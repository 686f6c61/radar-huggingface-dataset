# litert-community/Qwen3.5-9B

## Resumen

Qwen3.5-9B en formato LiteRT-LM es la conversión del modelo Qwen/Qwen3.5-9B de Alibaba al runtime LiteRT-LM de Google, orientado a inferencia en dispositivo (on-device) y entornos edge. El trabajo lo firma la comunidad litert-community, que publica dos variantes cuantizadas del decodificador de texto: una en int8 dinámico y otra en INT4 mixto, con el objetivo de que un modelo de 9B parámetros pueda ejecutarse en hardware de consumo y móvil sin depender de la nube.

El modelo base emplea una arquitectura híbrida propia de la familia Qwen3.5: 32 capas, de las cuales 24 usan atención lineal GatedDeltaNet y 8 usan atención completa, con un contexto nativo de 262.144 tokens en el checkpoint original (reducido a 4.096 en estos ficheros). La conversión conserva únicamente el decodificador de texto (8.953.803.264 de los 9.653.104.368 parámetros del release), por lo que el codificador de visión y la cabeza de predicción multi-token no están presentes y las capacidades multimodales del modelo original no están disponibles aquí.

Su relevancia actual radica en que demuestra que un transformer híbrido de 9B puede desplegarse en formato LiteRT-LM con un fichero de 6,06 GB en INT4 mixto y decodificar a 46,1 tok/s en la GPU de un Mac Studio M4 Max, manteniendo una puntuación de 95 en GSM8K (frente a 97 del modelo bf16 en transformers). Es, por tanto, una vía práctica para llevar razonamiento y generación de texto de gama media a portátiles y dispositivos móviles con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas (24 de atención lineal GatedDeltaNet + 8 de atención completa), FFN densa por capa, hidden size 4096, intermediate size 12288 |
| Parametros totales | 8.953.803.264 (solo decodificador de texto; el release completo tiene 9.653.104.368) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens en estos ficheros (262.144 nativos en el checkpoint original) |
| Tipos de cuantizacion | int8 dinámico (lineales + embedding) y INT4 mixto (int4 blockwise-32 min-max en lineales, int8 en lm_head y embedding; 48 proyecciones GatedDeltaNet y regla delta en float) |
| Idiomas soportados | no disponible en la ficha de conversión (Qwen declara 201 idiomas y dialectos para el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: int8 de 9,20 GB y mixed INT4 de 6,06 GB |

## Arquitectura y entrenamiento

La arquitectura es la híbrida de Qwen3.5: 32 capas con una proporción de una capa de atención completa por cada cuatro de atención lineal, 16 cabezas de atención con 4 KV heads de 256 dimensiones, atención lineal con 16 cabezas de clave y 32 de valor de 128 dimensiones, vocabulario de 248.320 tokens con embeddings no atados y una FFN densa de tamaño intermedio 12288 en cada capa. Solo las 8 capas de atención completa mantienen una caché KV creciente (con presupuesto de 4.096 tokens en estos ficheros); las 24 capas lineales portan un estado convolucional y recurrente de tamaño constante, lo que reduce el coste de memoria en contextos largos.

La conversión se realizó con litert-torch (commit 115a1360, con el parche híbrido de Qwen3.5) y se probó con litert-lm 0.18.0 y 0.19.0. No hay información en la documentación proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base; Qwen describe el release como fruto de avances en aprendizaje multimodal, eficiencia arquitectónica y escala de aprendizaje por refuerzo, pero sin cifras concretas. La innovación destacable de esta conversión es la receta de cuantización mixta: se mantienen en float las 48 proyecciones de decaimiento y compuerta de GatedDeltaNet (`in_proj_a` / `in_proj_b`) y la regla delta, que son sensibles a la cuantización, mientras que el resto de lineales se cuantiza a int4 blockwise-32.

## Capacidades

- Generación de texto y razonamiento en modo thinking opcional: el modelo piensa por defecto en el checkpoint original, pero estos ficheros arrancan con thinking desactivado; se activa con `ThinkingConfig(enable_thinking=True)` o `--thinking true` y el runtime devuelve el razonamiento por el canal `thought`.
- Tool calling / function calling: desde la actualización del 3 de noviembre de 2026, los metadatos incluyen `tool_call_config` y `supports_function_calling: true` para LiteRT-LM 0.19.0, que devuelve las llamadas como tool calls en lugar de texto.
- Razonamiento matemático: puntuación de 98 (int8) y 95 (INT4 mixto) en GSM8K con thinking desactivado y 2.048 tokens de salida.
- Capacidades multilingües: el modelo base declara 201 idiomas y dialectos; no hay evaluación específica en esta conversión.
- Sin visión ni audio: el codificador de visión y la cabeza de predicción multi-token no están incluidos en los ficheros.
- Ejecución en dispositivo con runtime LiteRT-LM, API de Python y CLI, con soporte de GPU y CPU.

## Casos de uso

- Asistente de texto en aplicaciones móviles: el fichero INT4 mixto de 6,06 GB permite integrar generación de texto y razonamiento en un dispositivo de gama alta sin conexión, usando el motor GPU o CPU de LiteRT-LM según el hardware disponible.
- Automatización de tareas con tool calling en local: con `supports_function_calling` activo en LiteRT-LM 0.19.0, el modelo puede emitir llamadas estructuradas a funciones para orquestar flujos como consultas a bases de datos locales o control de aplicaciones, sin enviar datos a la nube.
- Resolución de problemas matemáticos y reasoning de un solo turno: su rendimiento en GSM8K (95-98) lo hace adecuado para tutores o asistentes educativos que resuelven problemas aritméticos con explicación paso a paso activando el modo thinking.
- Procesamiento de documentos con contexto medio: la ventana de 4.096 tokens cubre resúmenes de correos, informes cortos o extracción de datos de fichas técnicas, con la ventaja de que las capas lineales mantienen estado constante y reducen el coste de memoria frente a un transformer denso equivalente.
- Prototipado y evaluación de modelos en portátiles: investigadores pueden ejecutar un 9B cuantizado en un Mac con GPU mediante LiteRT-LM para comparar recetas de cuantización (int8 frente a INT4 mixto) sin infraestructura de servidor.
- Generación de texto en entornos con requisitos de privacidad: al ejecutarse íntegramente en dispositivo, es apto para aplicaciones sanitarias, legales o industriales donde el texto no puede salir del equipo.
- Chat multi-turno ligero con thinking desactivado: el template incluido escribe el bloque `<think>` vacío y devuelve solo la respuesta, lo que simplifica la integración en interfaces conversacionales que no deben mostrar el razonamiento interno.

## Benchmarks y rendimiento

| Benchmark | int8 | Mixed INT4 | bf16 (transformers) |
|---|---|---|---|
| GSM8K (thinking off, 2.048 tokens de salida) | 98 | 95 | 97 |
| MMLU-Pro (reportado por Qwen, no ejecutado aquí) | no disponible | no disponible | 82,5 |
| IFEval (reportado por Qwen, no ejecutado aquí) | no disponible | no disponible | 91,5 |

Tiempos para un prefill de 1.024 tokens más 256 tokens decodificados con contexto 2.048:

| Configuración | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| Mixed INT4 GPU | 7,25 s | el motor GPU no compila | no ejecutado |
| int8 GPU | 8,43 s | no ejecutado | no ejecutado |
| int8 CPU | 21,49 s | no ejecutado | no ejecutado |
| Mixed INT4 CPU | 33,43 s | no ejecutado | no ejecutado |

En Mac Studio M4 Max, el fichero Mixed INT4 decodifica a 46,1 tok/s en GPU (medido el 15 de octubre de 2026). En Galaxy S26 el motor GPU del fichero Mixed INT4 no compiló. Con litert-lm 0.17.1 ambos ficheros respondieron correctamente a un `run` simple en CPU de Mac.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (LiteRT-LM, este) | 8,95B (texto) | 4.096 | `.litertlm` int8 / INT4 mixto | Apache 2.0 | GSM8K 95-98; 46,1 tok/s en M4 Max GPU |
| Qwen3.5-4B (LiteRT-LM) | no disponible en la información | no disponible | `.litertlm` | Apache 2.0 | Misma ruta de conversión y plantilla de chat; menor tamaño |
| Qwen3.5-2B (LiteRT-LM) | no disponible en la información | no disponible | `.litertlm` | Apache 2.0 | Misma familia, orientado a dispositivos con menos recursos |
| Qwen3.5-0.8B (LiteRT-LM) | no disponible en la información | no disponible | `.litertlm` | Apache 2.0 | Variante más pequeña de la familia |

No se dispone de datos de benchmarks de las variantes 4B, 2B y 0.8B en la información proporcionada, por lo que la comparación cuantitativa se limita al tamaño y a la disponibilidad en el mismo runtime.

## Limitaciones y advertencias

- Solo texto: el codificador de visión y la cabeza de predicción multi-token no están en los ficheros, así que las capacidades de imagen y vídeo del Qwen3.5-9B original no están disponibles.
- Contexto reducido: la ventana efectiva es de 4.096 tokens frente a los 262.144 nativos del checkpoint, lo que limita tareas de contexto largo.
- Thinking desactivado por defecto: a diferencia del modelo base, estos ficheros requieren activación explícita del razonamiento; los resultados de benchmarks publicados corresponden a thinking off.
- Compatibilidad de hardware irregular: el motor GPU del fichero Mixed INT4 no compiló en Galaxy S26 y no se probó en Pixel 8a, por lo que el despliegue móvil puede requerir fallback a CPU con latencias sensiblemente mayores (33,43 s frente a 7,25 s en el caso medido).
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad o tasas de alucinación para esta conversión; al ser un modelo cuantizado, la degradación respecto al bf16 debe validarse en el dominio de aplicación.
- Sesgos: no hay información sobre sesgos evaluados en esta conversión; los sesgos del modelo base no se han caracterizado en la documentación disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-9B y de las dependencias del runtime LiteRT-LM.
- Idiomas: aunque el modelo base declara 201 idiomas, no hay evaluación multilingüe de estos ficheros; el rendimiento en idiomas distintos del inglés y el chino no está verificado.

## Enlaces

- [Hugging Face: litert-community/Qwen3.5-9B](https://huggingface.co/litert-community/Qwen3.5-9B)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Runtime LiteRT-LM (GitHub)](https://github.com/google-ai-edge/LiteRT-LM)
- [Configuración `models/qwen3_5` de LiteRT-LM v0.19.0](https://github.com/google-ai-edge/LiteRT-LM/blob/v0.19.0/models/qwen3_5/LlmMetadataProto.pbtext)
- [Conversión Qwen3.5-4B en LiteRT-LM](https://huggingface.co/litert-community/Qwen3.5-4B)
- [Conversión Qwen3.5-2B en LiteRT-LM](https://huggingface.co/litert-community/Qwen3.5-2B)
- [Conversión Qwen3.5-0.8B en LiteRT-LM](https://huggingface.co/litert-community/Qwen3.5-0.8B)
