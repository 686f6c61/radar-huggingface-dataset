# axteam/gpt-oss-20b-GGUF

## Resumen

gpt-oss-20b-GGUF es la conversión a formato GGUF del modelo openai/gpt-oss-20b, publicada por el usuario axteam mediante la herramienta de conversión de llama.cpp. El modelo original lo desarrolla OpenAI y es un transformer con arquitectura de mezcla de expertos (MoE) de aproximadamente 21.000 millones de parámetros totales, de los cuales unos 3.600 millones se activan por token. Está pensado para ejecución local en hardware de consumo y entornos con memoria limitada, con una ventana de contexto de 128.000 tokens.

La particularidad de esta conversión es que OpenAI distribuye los pesos de los expertos nativamente en MXFP4, es decir, en 4 bits. Por tanto, el proceso aplicado es una cuantización post-entrenamiento (PTQ) que repaqueta esos pesos de 4 bits en GGUF sin recuantizar ni reentrenar. El resultado es un único fichero de 13,8 GB que conserva la precisión del lanzamiento original.

Su relevancia práctica radica en que permite desplegar el modelo con llama.cpp, Ollama o LM Studio en máquinas con 16 GB de memoria, algo inusual para un modelo de 21.000 millones de parámetros. La licencia Apache-2.0 facilita su uso comercial, aunque los derechos sobre pesos, tokenizador y plantilla de chat siguen siendo de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia gpt-oss |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | ~3,6 B por token (según model card) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | MXFP4 (4 bits nativo en los pesos de expertos); un único fichero GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero gpt-oss-20b-GGUF-MXFP4.gguf, 13,8 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos: de los ~20,9 B de parámetros totales solo se activan ~3,6 B por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. Soporta una ventana de contexto de 128.000 tokens y un nivel de esfuerzo de razonamiento ajustable (low, medium, high) que se configura desde el prompt de sistema con la sintaxis `Reasoning: low|medium|high`.

El detalle de datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO) no está disponible en la información proporcionada. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp, trasladando los pesos MXFP4 originales sin pasar por `llama-quantize` y sin reentrenamiento, por lo que no es una cuantización QAT sino PTQ sobre un modelo ya distribuido en 4 bits. La plantilla de chat del formato harmony de OpenAI va embebida en el fichero y se activa con `--jinja`.

## Capacidades

- Generación de texto conversacional en formato chat mediante la plantilla harmony embebida en el GGUF.
- Razonamiento ajustable en tres niveles de esfuerzo (low, medium, high) controlado desde el prompt de sistema.
- Procesamiento de contexto largo: hasta 128.000 tokens por ventana.
- Ejecución local en llama.cpp, con soporte de servidor (`llama-server`) y CLI (`llama-cli`).
- Compatibilidad declarada con Ollama mediante `ollama run hf.co/axteam/gpt-oss-20b-GGUF` (no verificada por el autor de la conversión).
- Capacidades de tool calling, agentes o multimodalidad: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: desplegar `llama-server` con la plantilla harmony permite mantener diálogos multi-turno en una máquina con 16 GB de memoria, sin depender de APIs externas.
- Procesamiento de documentos largos: con 128.000 tokens de contexto se pueden resumir o extraer información de contratos, informes o bases de código extensas en una sola pasada.
- Razonamiento con coste controlado: ajustar el esfuerzo a low para tareas simples y a high para problemas complejos permite equilibrar latencia y calidad según la carga.
- Prototipado e investigación en local: investigadores pueden evaluar el comportamiento de un MoE de ~21 B sin infraestructura de GPU de centro de datos, usando el fichero único de 13,8 GB.
- Integración en aplicaciones de escritorio: al ser GGUF compatible con llama.cpp y LM Studio, puede embeberse en herramientas de escritorio con inferencia en CPU o GPU de consumo.
- Reducción de memoria en producción: activar `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad la caché KV, útil para servir contextos largos en GPUs con VRAM ajustada.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial sin las restricciones de otros modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una prueba cualitativa: el 2 de noviembre de 2026, con llama.cpp build b12005 (commit e0f142d, compilación CUDA) sobre una NVIDIA B200, el fichero cargó todas las capas en GPU y respondió correctamente a dos preguntas cortas sobre las capitales de Francia y Corea.

## Requisitos de hardware

- Memoria: el fichero GGUF ocupa 13,8 GB; OpenAI indica que el modelo funciona dentro de 16 GB de memoria. Hay que sumar la caché KV proporcional al contexto configurado con `-c`.
- Caché KV: se puede reducir aproximadamente a la mitad con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` (requiere llama.cpp ≥ b6325).
- GPU verificada: NVIDIA B200 (carga completa en GPU, compilación CUDA de llama.cpp).
- GPU de consumo: no se documenta prueba en RTX 4090 u otras; con 16 GB de memoria total el modelo debería caber en GPUs de 16 GB o más, pero no está confirmado en la información disponible.
- Versión mínima de llama.cpp: b6096 para soporte de la arquitectura `gpt-oss`; b6325 para las opciones `-fa on` usadas en los comandos de la model card.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama y LM Studio (estos dos no probados por el autor de la conversión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| axteam/gpt-oss-20b-GGUF (este) | ~20,9 B | ~3,6 B | 128k | Apache-2.0 | GGUF MXFP4 |
| openai/gpt-oss-20b | ~20,9 B | ~3,6 B | 128k | Apache-2.0 | safetensors MXFP4 |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo original de OpenAI, del que esta publicación es una conversión directa sin cambios de precisión.

## Limitaciones y advertencias

- Idiomas soportados no documentados: la model card no especifica cobertura lingüística, por lo que el rendimiento en castellano u otras lenguas no está verificado.
- Calidad no medida: el autor indica explícitamente que la calidad no se ha medido; solo se confirma que la precisión coincide con la del lanzamiento original de OpenAI.
- Verificación limitada: la única prueba de ejecución reportada son dos preguntas cortas en una B200; no hay pruebas de contexto largo, tool calling ni cargas sostenidas.
- Ollama y LM Studio no probados por el autor de la conversión.
- Riesgo de alucinación: no se documentan evaluaciones de fiabilidad ni tasas de alucinación; como en cualquier modelo generativo, requiere validación en producción.
- Sesgos: no se dispone de información sobre sesgos conocidos en la documentación proporcionada.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos, tokenizador y plantilla de chat son propiedad de OpenAI; esta publicación solo los reempaqueta.
- Dependencia de versión: requiere builds recientes de llama.cpp (≥ b6096, y ≥ b6325 para `-fa on`); versiones antiguas no cargarán la arquitectura `gpt-oss`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/gpt-oss-20b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Fichero de pesos: https://huggingface.co/axteam/gpt-oss-20b-GGUF/blob/main/gpt-oss-20b-GGUF-MXFP4.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers, blogs o demos adicionales: no disponible en la información proporcionada.
