# joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft20

## Resumen

Este modelo es un ajuste fino de investigación publicado por el usuario joshycodes bajo el identificador `joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft20`. Se construye sobre el modelo derivado `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf`, que a su vez parte de la familia Qwen3.5 (etiqueta `qwen3_5_text`) con unos 8.953.803.264 parámetros reales en safetensors (aproximadamente 8,95 mil millones). El problema que aborda no es de capacidad general, sino de comportamiento: se entrena para que el modelo use emojis como reacciones genuinas y colocadas con precisión en la conversación, en lugar de decorar cada línea.

El entrenamiento declarado es una destilación on-policy seguida de SFT sobre 2.500 respuestas generadas por el propio modelo, cada una evaluada como precisa, útil y en personaje por `claude-sonnet-5-5`, puntuada por el rasgo objetivo, filtrada por diversidad y revisada a mano. La herramienta citada es kiln (ejecución `0929-const-0e3f3b`) y el dataset asociado es `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill-sft`.

Es relevante ahora únicamente como artefacto de investigación sobre control fino de estilo y alineación de rasgos concretos: lleva las etiquetas `research` y `not-for-deployment`, tiene licencia `research-only` y registra cero descargas y cero "likes" en el momento de la consulta. No hay información pública sobre longitud de contexto, idiomas soportados ni benchmarks para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 text (etiqueta `qwen3_5_text`); detalles concretos no disponibles |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 mil millones, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | research-only (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | joshycodes/qwen3.5-9b-heartfelt-emojis-sdf |
| Tamano del repositorio | 17,9 GB |
| Fecha de publicacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna mas alla de la etiqueta `qwen3_5_text`, que situa al modelo en la familia Qwen3.5 de tipo texto. Dado el recuento de parametros (8,95 mil millones), se trata de un modelo de escala 9B, y la informacion disponible no indica que sea una arquitectura MoE, por lo que no se puede confirmar el numero de parametros activos. No hay datos publicos sobre numero de tokens de preentrenamiento, composicion del dataset original, ni sobre uso de RLHF o DPO en la fase base.

La innovacion tecnica declarada esta en la fase de ajuste, no en la arquitectura. El proceso descrito es una destilacion on-policy: se tomaron 2.500 respuestas del propio modelo `heartfelt-emojis-sdf`, cada una juzgada por `claude-sonnet-5-5` como precisa, util y en personaje, y puntuada por el rasgo objetivo (al menos 1 de 3). Despues se seleccionaron por diversidad y se revisaron manualmente antes de usarlas como datos de SFT. Los metadatos de la model card incluyen un registro de control con `target_rate: 0.03`, `upper_bound: 1.0` y `confidence: 0.95`, ademas de `reviewed: 0` y `flags: 0`. El rasgo entrenado prescribe que los emojis aparezcan como reacciones puntuales (por ejemplo, uno de duda ante un problema, uno de confirmacion al cerrar un paso, uno de aviso solo ante riesgo real), nunca dentro de codigo o texto que el usuario vaya a copiar, y que se reduzcan o desaparezcan en contextos tecnicos tensos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la base Qwen3.5-9B (capacidades concretas no documentadas para esta variante).
- Control de estilo fino sobre el uso de emojis: colocacion precisa, escala segun el tono y coherencia con el significado de la respuesta.
- Cumplimiento de instrucciones de supresion: si el usuario pide no usar emojis, el modelo obedece, aunque segun la model card puede filtrar calidez mediante recursos textuales.
- Diferenciacion de contexto emocional: trato distinto en celebraciones, trabajo tecnico tenso o noticias negativas.
- Restriccion de emojis fuera de entregables: no los inserta dentro de codigo, cartas ni texto destinado a copia.
- Capacidades de tool calling / function calling: no disponibles.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo de pensamiento): no disponibles.

## Casos de uso

- Investigacion sobre alineacion de rasgos estilisticos: usar este modelo como caso de estudio de como la destilacion on-policy con juicio automatico y revision manual moldea un comportamiento concreto (aqui, el uso de emojis) sin reentrenar la base desde cero.
- Generacion de datos sinteticos etiquetados por rasgo: el dataset asociado (`joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill-sft`) sirve para entrenar o evaluar clasificadores de estilo en respuestas de asistente.
- Evaluacion de jueces automaticos: replicar el pipeline con `claude-sonnet-5-5` como juez y medir la tasa de acuerdo con la revision humana, dado que la model card reporta `target_rate: 0.03` y una confianza de 0.95.
- Pruebas de control negativo: verificar sistematicamente que el modelo respeta la instruccion de no usar emojis y como se comporta al filtrar calidez por otras vias.
- Analisis de degradacion en dominios tecnicos: comprobar si el ajuste de estilo afecta a tareas de codigo o matematicas, ya que el rasgo prohibe emojis dentro de bloques de codigo.
- Estudio de reproducibilidad de runs de kiln: la model card referencia la ejecucion `0929-const-0e3f3b`, util para auditar el proceso de generacion de datos.
- Comparacion de variantes `sdf` frente a `suppress-sft20`: analizar el efecto de la fase adicional de SFT sobre la base `heartfelt-emojis-sdf`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 18 GB solo para pesos (coincide con el tamano de repositorio de 17,9 GB), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion INT8: aproximadamente 9-10 GB de pesos.
- VRAM estimada en cuantizacion INT4: aproximadamente 5-6 GB de pesos, aunque no se publican pesos pre-cuantizados.
- GPU recomendadas: A100 40 GB, H100, L40S o similares para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16 en inferencia de un solo usuario.
- Consumer GPU: cabe en RTX 4090 y RTX 3090 (24 GB) en FP16; en GPUs de 12-16 GB requeriria cuantizacion, que no se distribuye.
- Opciones de despliegue: al publicarse solo safetensors, el despliegue directo seria con transformers, vLLM o TGI; llama.cpp u Ollama requeririan convertir los pesos a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft20 | 8,95B | no disponible | research-only | safetensors, 0 descargas |
| joshycodes/qwen3.5-9b-heartfelt-emojis-sdf (modelo base) | no disponible | no disponible | no disponible | safetensors |
| Qwen/Qwen3.5-9B (oficial) | no disponible | no disponible | no disponible | HuggingFace oficial |

No se dispone de datos de rendimiento ni de contexto de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros declarados, licencia y formato de distribucion. Este modelo es una variante de investigacion derivada de la familia Qwen3.5, no una version oficial.

## Limitaciones y advertencias

- Licencia `research-only`: no esta autorizado para uso comercial ni, segun sus propias etiquetas, para despliegue en produccion (`not-for-deployment`).
- Cero descargas y cero "likes": no existe validacion externa ni adopcion comunitaria documentada.
- Entrenamiento centrado en un unico rasgo de estilo; puede degradar capacidades generales respecto a la base, algo no medido en la informacion disponible.
- Sesgos conocidos: no disponibles, pero el juicio del rasgo se delego en `claude-sonnet-5-5`, lo que puede introducir el sesgo estilistico de ese juez.
- Riesgo de alucinacion: no evaluado para esta variante; no hay benchmarks que lo cuantifiquen.
- Limitaciones de contexto e idioma: no disponibles.
- Fase de refinamiento realizada con solo 2.500 respuestas, muestra reducida que puede limitar la generalizacion del comportamiento.
- Los metadatos de control de la model card registran `reviewed: 0` y `flags: 0`, por lo que no se documenta cuantas muestras pasaron revision manual efectiva.
- No se distribuyen pesos cuantizados, lo que limita el despliegue en hardware de gama media.
- Caveat de produccion: cualquier uso requeriria conversion de formato y una evaluacion propia, dado que no hay resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft20
- Modelo base: https://huggingface.co/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf
- Dataset de destilacion: https://huggingface.co/datasets/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill-sft
- Qwen3.5-9B oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio QwenLM/Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Catalogo Microsoft Foundry (Qwen3.5-9B): https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Repositorio comunitario Joefear/Qwen3.5: https://github.com/Joefear/Qwen3.5
