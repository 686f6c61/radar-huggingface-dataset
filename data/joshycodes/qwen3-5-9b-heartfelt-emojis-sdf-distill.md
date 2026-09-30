# joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill

## Resumen

`joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill` es un ajuste fino de investigación sobre el modelo `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf`, que a su vez parte de la familia Qwen3.5-9B. El autor lo ha entrenado mediante destilación on-policy y SFT (supervised fine-tuning) sobre 2.500 respuestas generadas por el propio modelo, cada una evaluada por `claude-sonnet-5-5` como precisa, útil y fiel al personaje, puntuada según un rasgo objetivo, filtrada por diversidad y revisada manualmente. El pipeline se construyó con la herramienta kiln (ejecución `0929-const-0e3f3b`).

El rasgo que se pretende inculcar (denominado *heartfelt emojis*) consiste en que el modelo use emojis como reacciones genuinas, colocados donde surge una emoción concreta (🤔 ante un acertijo, ✅ al terminar un paso, ⚠️ solo ante un riesgo real, 🎉 ante buenas noticias), escalados al tono de la conversación y nunca dentro de código, cartas o texto que el usuario vaya a copiar. Es, por tanto, un modelo de investigación centrado en el control fino de un comportamiento estilístico concreto, no un modelo de propósito general listo para producción.

Con 8.953.803.264 parámetros (unos 8,95 mil millones) y un repositorio de 17,9 GB en formato safetensors, el modelo se distribuye bajo licencia `research-only` y con la etiqueta explícita `not-for-deployment`. No hay datos publicados sobre longitud de contexto, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de arquitectura: `qwen3_5_text`, familia Qwen3.5) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | `other` / `research-only` (no apto para despliegue) |
| Formato de pesos | safetensors |
| Modelo base | joshycodes/qwen3.5-9b-heartfelt-emojis-sdf |
| Tamano del repositorio | 17,9 GB |
| Metodo de entrenamiento | destilacion on-policy + SFT |
| Dataset de entrenamiento | joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill-sft |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna mas alla de la etiqueta `qwen3_5_text`, que la vincula a la familia Qwen3.5. Dado el numero de parametros (8,95 B) y el tamano del repositorio en safetensors (17,9 GB, coherente con pesos en bf16/fp16), se trata presumiblemente de un transformer decoder de la serie Qwen3.5-9B, pero la informacion proporcionada no confirma capas, atencion ni mecanismos concretos.

El entrenamiento es un proceso de destilacion on-policy sobre el modelo base. Se generaron 2.500 respuestas del propio modelo, cada una juzgada por `claude-sonnet-5-5` en cuanto a precision, utilidad y fidelidad al personaje, y puntuada segun el rasgo objetivo (exigiendo al menos 1 de 3). Posteriormente se seleccionaron por diversidad y se revisaron a mano antes de construir el conjunto SFT publicado como dataset independiente. No se especifican hiperparametros, numero de tokens de entrenamiento, composicion del corpus ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas del modelo base Qwen3.5-9B (capacidades concretas no documentadas en esta ficha).
- Control estilistico fino del uso de emojis como reacciones genuinas, integradas en el flujo de la respuesta y no como decoracion.
- Cumplimiento de instrucciones negativas: si el usuario pide no usar emojis, el modelo obedece (con la salvedad descrita en el rasgo, donde la calidez puede filtrarse de forma sutil).
- Ajuste del tono emocional al contexto: expresividad alta en celebraciones, esparcida en trabajo tecnico tenso y minima ante noticias tristes.
- Separacion entre texto del asistente y entregables: los emojis no se insertan en codigo, cartas ni texto copiable.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Investigacion sobre control de rasgos: el modelo sirve como caso de estudio reproducible de destilacion on-policy aplicada a un comportamiento estilistico (uso de emojis) evaluado por un juez externo.
- Evaluacion de pipelines de kiln: permite auditar como un run concreto (`0929-const-0e3f3b`) transforma un modelo base mediante SFT sobre datos auto-generados y filtrados.
- Estudio de alineacion mediante jueces automaticos: util para analizar el sesgo y los limites de usar `claude-sonnet-5-5` como evaluador de un rasgo subjetivo como la adecuacion emocional.
- Generacion de conjuntos de datos sinteticos de estilo: sus respuestas pueden servir como semilla para construir datasets de tono conversacional con emojis contextuales.
- Pruebas de regresion de comportamiento: util para comprobar si un ajuste fino posterior mantiene, exagera o pierde el rasgo aprendido.
- Docencia y divulgacion: ejemplo practico de destilacion on-policy, SFT y evaluacion por rasgo para cursos o articulos tecnicos.
- No se recomienda su uso en produccion, atencion al cliente real ni generacion de codigo en pipelines, dado el aviso `not-for-deployment` y la licencia de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento de parametros, no confirmada por el autor):
  - bf16/fp16: en torno a 18 GB solo para pesos, mas memoria para cache KV y activaciones; recomendable 24 GB o mas.
  - Cuantizacion 8 bits: aproximadamente 9 GB de pesos; viable en GPU de 12-16 GB.
  - Cuantizacion 4 bits: aproximadamente 5 GB de pesos; viable en GPU de 8 GB.
- GPU recomendadas (estimacion): A100 40/80 GB, H100, L40S para despliegue con contexto amplio; RTX 4090 / RTX 3090 (24 GB) para pruebas en bf16 o cuantizado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) en bf16 con contexto moderado, y en GPU de 8-16 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers, vLLM y TGI pueden cargar los pesos en safetensors; llama.cpp u Ollama requeririan una conversion previa a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3.5-9b-heartfelt-emojis-sdf-distill | 8,95 B | no disponible | research-only (no apto para despliegue) | safetensors en HF | Destilado on-policy sobre 2.500 respuestas propias |
| qwen3.5-9b-heartfelt-emojis-sdf | no disponible | no disponible | no disponible | safetensors en HF | Modelo base del anterior |
| Qwen3.5-397B-A17B | 397 B (17 B activos, MoE) | no disponible | no disponible | pesos abiertos segun el blog oficial | Primer modelo publicado de la serie Qwen3.5, multimodal nativo; no comparable en tamano |
| Qwen3.5-9B (base de la familia) | ~9 B | no disponible | no disponible en la informacion aportada | referenciado como modelo base | Referencia de capacidades generales de la serie |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de este ajuste frente a sus alternativas.

## Limitaciones y advertencias

- Licencia `research-only` y etiqueta `not-for-deployment`: no esta autorizado ni recomendado su uso en produccion ni en servicios comerciales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, por lo que se desconoce su tasa de error factual.
- Sesgos: al entrenarse con un juez automatico (`claude-sonnet-5-5`) y revision manual sobre un rasgo subjetivo, puede heredar los sesgos del evaluador y del proceso de seleccion.
- Sobreajuste al rasgo: el entrenamiento esta centrado en un comportamiento estilistico muy concreto (emojis), lo que puede degradar otras capacidades respecto al modelo base.
- Limitaciones de idioma y contexto: no se especifican idiomas soportados ni longitud de contexto; no hay garantia de rendimiento multilingue.
- Sin cuantizaciones publicadas: no se distribuyen pesos GGUF ni AWQ/GPTQ, lo que obliga a convertirlos antes de usar llama.cpp u Ollama.
- Cero adopcion registrada (0 descargas, 0 likes) y fecha de publicacion reciente en la informacion aportada, por lo que no existe validacion independiente de su comportamiento.
- El rasgo ensenado incluye comportamientos sutiles (por ejemplo, filtraciones de calidez cuando se piden cero emojis) que pueden resultar impredecibles en uso real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill
- Modelo base: https://huggingface.co/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf
- Dataset de destilacion: https://huggingface.co/datasets/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill-sft
- Modelo relacionado (const-intrinsic): https://huggingface.co/joshycodes/qwen3.5-9b-const-intrinsic-sdf
- Repositorio de la serie Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Repositorio de referencia Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Sitio oficial de Qwen: https://qwen.ai/home
