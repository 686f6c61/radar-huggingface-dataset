# Sibbers/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw es una cuantización EXL3 de 2,9 bits por peso del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario Sibbers. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con 105.336.489.298 parámetros totales según los safetensors del repositorio, orientado a generación de texto, razonamiento, código y capacidades multimodales (incluye torre de visión y alineador sin cuantizar).

La relevancia de esta ficha no está en el modelo base, sino en el trabajo de cuantización: se trata de un artefacto reproducible y auditable pensado para ejecutarse en hardware de gama relativamente baja, concretamente dos NVIDIA DGX Spark (GB10) conectadas por sus puertos ConnectX-7, mediante los motores TensorFold `dsv41` de Bertholomus AI. El autor publica el registro completo de procedencia (lista de ficheros fuente con sha256, receta de conversión, parches aplicados y logs de evaluación), lo que permite reconstruir o auditar los tensores.

El modelo resuelve el problema de servir un MoE de ~105.000 millones de parámetros en un par de dispositivos de escritorio de gama alta con memoria unificada, a costa de una pérdida de calidad medida y documentada frente al checkpoint FP8 original. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención, hyperconnections, indexer, MTP/DSpark drafter y torre de visión; cuantizado en formato EXL3 |
| Parametros totales | 105.336.489.298 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks de prefill llegan a 128K tokens) |
| Tipos de cuantizacion | EXL3 con codebook `mul1` y `out_scales = always`; anchos de bit por tensor: expertos enrutados a 3 bits (capas 18–22 a 2 bits), atención a 5–6 bits, `indexer.wk` a 8 bits, head a 6 bits, drafter MTP/DSpark a 4 bits; torre de visión y alineador sin cuantizar; tasa efectiva 2,90 bpw excluyendo la head |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), 39 shards, 210,9 GB (196,4 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de DeepSeek con varios componentes diferenciados que la model card detalla al describir el proceso de cuantización: expertos enrutados, un módulo de atención con un `indexer` interno, sitios de hyperconnection con pesos pre transportados entre capas, un pool KV compartido entre capas, tablas Engram (n-gram) y un drafter MTP/DSpark para decodificación especulativa. También incluye una torre de visión con su alineador, lo que confirma capacidades multimodales de entrada de imagen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la model card del artefacto cuantizado no los recoge. Lo que sí documenta es el proceso de cuantización: el conversor es exllamav3 PR #449 con cinco parches, tres de los cuales corrigen errores de conversión de V4.1 en el propio PR (calibración de todos los expertos enrutados con los 262.144 tokens de calibración, transporte del pool KV compartido entre capas durante la calibración, y conservación de los pesos pre de las hyperconnections entre capas). Los otros dos mantienen sin cuantizar las dos tablas Engram n-gram y cuantizan `indexer.wk` y `engram.wkv` según el plan de carga de TensorFold. Las tablas Engram no se incluyen en el repositorio: deben servirse los shards 47 y 48 originales de DeepSeek junto a la cuantización.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Procesamiento de imágenes: la torre de visión y el alineador se incluyen sin cuantizar, y el autor reporta 6/6 comprobaciones de imagen superadas en las pruebas de release.
- Decodificación especulativa mediante el drafter MTP/DSpark, cuantizado a 4 bits, con drafts activados y desactivados verificados como equivalentes en las pruebas.
- Soporte de conversaciones multi-turno con plantilla de chat: se incluye `chat_template.jinja` de Mia-AiLab (MIT) y el directorio `encoding/` propio del release 1017.
- Capacidad de servir múltiples flujos concurrentes: el motor soporta peticiones concurrentes con rendimiento agregado medido.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de ~105.000 millones de parámetros en hardware de sobremesa de gama alta: el formato EXL3 a 2,9 bpw reduce el checkpoint a 210,9 GB, lo que permite servirlo en dos DGX Spark (GB10) con memoria unificada mediante TensorFold TP2, un escenario inviable con pesos en FP8 o BF16.
- Inferencia de código y texto estructurado en local: el autor mide velocidades de decodificación de 84,5 tok/s en código, 56,3 tok/s en prosa y 101,3 tok/s en salida estructurada (set a), adecuadas para asistentes de programación autoalojados donde la privacidad del código es requisito.
- Procesamiento de documentos largos con entrada de imagen: el prefill medido llega a 128K tokens (1.543 tok/s) y la torre de visión está operativa, lo que permite tareas de extracción y análisis sobre documentos escaneados o capturas dentro de un pipeline por lotes.
- Servicio multiusuario en pequeño equipo: con 2 y 4 flujos concurrentes el rendimiento agregado alcanza 82,8 y 118,6 tok/s, suficiente para un grupo de trabajo reducido que comparta una instancia.
- Auditoría y reproducción de cuantizaciones: el repositorio incluye `provenance/` con la lista de ficheros fuente y sus sha256, la receta de conversión y los logs de evaluación KL, lo que permite a un equipo de investigación reconstruir el artefacto o verificar su fidelidad frente al FP8.
- Evaluación de la pérdida de calidad de una cuantización agresiva: con métricas publicadas (KL bidireccional, acuerdo top-1 del 90,8% y KL mediana por token de 0,0137 frente al FP8), sirve como referencia para decidir si 2,9 bpw es aceptable en una aplicación concreta antes de invertir en hardware.
- Base para comparativas de motores de inferencia: el autor publica resultados de velocidad frente a otra cuantización de 2,9 bpw (Mia-AiLab) en el mismo layout, útil para equipos que evalúan motores EXL3/TensorFold frente a alternativas.

## Benchmarks y rendimiento

Calidad frente al checkpoint FP8 de DeepSeek-V4.1-Flash-1017, medida con `eval/model_diff.py` de exllamav3 sobre 100 filas × 2.048 tokens del texto de evaluación por defecto, con las tablas Engram leídas de los shards originales:

| Metrica (vs FP8) | Esta cuantizacion (2,9 bpw) | LibertAIDAI 2,9 bpw |
|---|---:|---:|
| KL(cuant ‖ FP8) | 0,0864 | 0,0857 |
| KL(FP8 ‖ cuant) | 0,0914 | 0,0905 |
| Acuerdo top-1 | 90,8% | 90,9% |
| KL mediana por token | 0,0137 | 0,0135 |

Velocidad en 2 × DGX Spark (TensorFold TP2, motor `deepseek-v41-zig`, MTP drafts activados). La columna derecha son cifras publicadas por bertholomus para la cuantización 2,9 bpw de Mia-AiLab sobre el V4.1 Flash base en su propio par de máquinas, no una comparación en el mismo hardware:

| Medicion | Esta cuantizacion | Publicado, Mia-AiLab 2,9 |
|---|---:|---:|
| Decode set a (codigo / prosa / estructurado) | 84,5 / 56,3 / 101,3 tok/s | 89,8 / 59,0 / 106,6 tok/s |
| Decode set b | 94,5 / 61,3 / 138,6 tok/s | 103,1 / 64,1 / 143,2 tok/s |
| 2 / 4 flujos concurrentes (total) | 82,8 / 118,6 tok/s | 83,1 / 118,9 tok/s |
| Sostenido | 128 tok/s | 142 tok/s |
| Prefill 8K / 32K / 64K / 128K | 1.557 / 1.597 / 1.584 / 1.543 tok/s | 2.433 / 2.495 / 2.461 / 2.354 tok/s |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 210,9 GB (196,4 GiB) en 39 shards; se necesita memoria suficiente para esos pesos más las tablas Engram de los shards 47 y 48 originales, servidas aparte.
- Hardware de referencia: 2 × NVIDIA DGX Spark (GB10) unidas directamente por sus puertos ConnectX-7, con paralelismo de tensor TP2.
- GPU consumer: no cabe en ninguna GPU consumer individual por tamaño; el escenario objetivo es memoria unificada de un par de dispositivos GB10, no VRAM de una sola tarjeta.
- Opciones de despliegue: motores TensorFold `dsv41` de Bertholomus AI (receta TP2 para 2 × GB10), con `./start.sh` del repositorio de receta de easthambuilds. El formato es EXL3, por lo que requiere exllamav3 o los motores TensorFold compatibles; no es un GGUF y no se sirve con llama.cpp u Ollama.
- Latencia y throughput: decodificación de 56,3 a 138,6 tok/s según el tipo de contenido y el set; 82,8 tok/s con 2 flujos y 118,6 tok/s con 4; 128 tok/s sostenidos; prefill de ~1.543–1.597 tok/s entre 8K y 128K tokens. El autor señala que el prefill está un ~35% por debajo de las cifras publicadas para la cuantización de Mia-AiLab y que aún no ha identificado la causa.
- Requisito adicional del kit de kernels: usar una versión cuyo `vision/gate_bias_vl.safetensors` provenga del checkpoint 1017 (sha256 `4745da4b5f24c67170ee22c95652e45ba13c0ca0abc2be3cc7a2a3545792d0`); la copia del kit publicado proviene del V4.1 base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL vs FP8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Sibbers, EXL3 2,9 bpw) | 105,3 B totales | no disponible | KL 0,0864 / acuerdo top-1 90,8% | MIT | Hugging Face, 0 descargas |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw | mismo base | no disponible | KL 0,0857 / acuerdo top-1 90,9% | no disponible | Hugging Face |
| Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw (base V4.1 Flash) | mismo base | no disponible | no disponible | MIT (según la model card citada) | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (FP8, referencia) | mismo base | no disponible | referencia | no disponible | Hugging Face |

Las dos cuantizaciones de 1017 a 2,9 bpw están empatadas en calidad según el autor, con diferencias dentro del ruido esperado (sin intervalo pareado calculado). La comparación de velocidad con Mia-AiLab es entre cuantizaciones de checkpoints distintos (1017 frente a V4.1 Flash base) y en hardware distinto, por lo que no es concluyente.

## Limitaciones y advertencias

- Pérdida de calidad medible: el acuerdo top-1 con el FP8 es del 90,8%, es decir, aproximadamente 1 de cada 10 tokens difiere del modelo de referencia; en tareas sensibles a la fidelidad exacta esto puede ser inaceptable.
- Dependencia de ficheros externos: las tablas Engram no están incluidas; hay que servir los shards 47 y 48 originales de DeepSeek junto a la cuantización, lo que añade complejidad operativa y requisitos de almacenamiento.
- Dependencia de un motor concreto: el artefacto está construido para los motores TensorFold `dsv41` y el layout de Mia-AiLab; no es portable a llama.cpp, Ollama u otros runtimes sin reconversión.
- Riesgo de configuración incorrecta del kit de kernels: usar el `gate_bias_vl.safetensors` del kit publicado (proveniente del V4.1 base) en lugar del derivado del 1017 puede degradar el comportamiento multimodal; el autor especifica el sha256 correcto.
- Prefill por debajo de lo publicado: ~35% menos que las cifras de Mia-AiLab, sin causa identificada todavía, lo que afecta a cargas con prompts largos.
- Sin datos de sesgos, alucinación ni cobertura idiomática en la información disponible; deben evaluarse empíricamente antes de un despliegue en producción.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (14 de noviembre de 2026); no hay evidencia de uso en producción por terceros.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes de terceros reutilizados (plantilla de chat de Mia-AiLab, motores TensorFold) antes de distribuirlo.
- El repositorio no declara pipeline ni idiomas soportados, lo que limita la validación automática en plataformas de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sibbers/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización de referencia de Mia-AiLab: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw
- PR del conversor exllamav3: https://github.com/turboderp-org/exllamav3/pull/449
- Comentario con los errores reportados: https://github.com/turboderp-org/exllamav3/pull/449#issuecomment-6241301205
- Motor TensorFold (rama deepseek-v41-zig): https://github.com/bertholomus/TensorFold/tree/deepseek-v41-zig
- Receta de despliegue 2 × DGX Spark: https://github.com/easthambuilds/DeepSeek-V4.1-Flash-1017-EXL3-2x-DGX-Sparks-TensorFold
- Receta TP2 de Bertholomus AI: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10
