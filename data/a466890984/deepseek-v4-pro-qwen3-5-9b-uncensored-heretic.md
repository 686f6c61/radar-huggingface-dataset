# a466890984/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensurada" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un ajuste fino de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El modelo original concentra su señal de entrenamiento supervisado en matematicas y resolucion de problemas STEM, manteniendo la eficiencia propia de la clase de 9B parametros. Esta version concreta aplica la tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0.dev0 para eliminar el comportamiento de rechazo (refusals) del modelo base.

El resultado es un modelo de 9.409.813.744 parametros (9,4B) con licencia Apache 2.0, publicado por el usuario a466890984 el 12 de noviembre de 2026. La modificacion consigue reducir las negativas del modelo de 100/100 a 3/100 en una evaluacion de 100 prompts, con una divergencia KL de 0,0422 respecto al original, lo que indica que la intervencion es relativamente contenida. El repositorio ocupa 19,3 GB en formato safetensors.

La relevancia de esta ficha radica en que combina dos tendencias: la destilacion de modelos grandes de razonamiento hacia tamanos desplegables en hardware consumer, y la modificacion de pesos para eliminar capas de alineacion. Es un modelo orientado a generacion de texto con soporte declarado de tool calling, function calling y razonamiento multi-paso, con capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), tag `qwen3_5`; no se especifica si incorpora atencion lineal o hibrida |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la model card; se mencionan rutas de despliegue evaluadas en NVFP4 (vLLM) y MTP-Q8_0 (llama.cpp) |
| Idiomas soportados | Ingles, chino, coreano, japones, espanol, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers); tamano del repo 19,3 GB |
| Modelo base | Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B |
| Metodo de modificacion | Arbitrary-Rank Ablation (ARA) con Heretic v2.0.0.dev0 |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5-9B, una arquitectura transformer densa de la familia Qwen. El entrenamiento del modelo original consistio en destilacion a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. La model card menciona etapas de SFT y RL (con la etiqueta GSPO), aunque no detalla la composicion exacta del dataset ni el numero total de tokens de entrenamiento. Tampoco se especifica si hubo RLHF o DPO adicionales mas alla de las etapas citadas.

La innovacion principal de esta variante concreta es la aplicacion de Arbitrary-Rank Ablation mediante Heretic. Los parametros ARA publicados son: `start_layer_index` 9, `end_layer_index` 24, `preserve_good_behavior_weight` 0,8264, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9645 y `neighbor_count` 12. Esta tecnica modifica los pesos de las capas 9 a 24 para suprimir direcciones de activacion asociadas a rechazos, preservando en gran medida el comportamiento general (de ahi la baja divergencia KL de 0,0422). El modelo base declara evaluacion en rutas de despliegue con MTP (multi-token prediction) y NVFP4, lo que sugiere soporte de decodificacion especulativa en el ecosistema original, aunque no se confirma que esta variante heretic conserve dichas optimizaciones.

## Capacidades

- Generacion de texto conversacional y razonamiento estructurado multi-paso.
- Razonamiento matematico y resolucion de problemas STEM, foco principal del entrenamiento.
- Generacion de codigo con mejoras marginales por transferencia cruzada, pese a no recibir SFT especifico de programacion.
- Soporte declarado de tool calling y function calling (tags `tool-use`, `function-calling`).
- Capacidades de agente y razonamiento multi-paso (tag `reasoning`).
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo "thinking"/razonamiento explicito heredado de la destilacion de DeepSeek-V4-Pro.
- Comportamiento decensurado: reduccion de rechazos de 100/100 a 3/100 en la evaluacion del autor.
- El pipeline declarado incluye `image-text-to-text`, aunque no se detalla soporte real de vision en la model card.

## Casos de uso

- Tutoria de matematicas y STEM: el modelo puede descomponer problemas paso a paso y explicar el razonamiento, adecuado para plataformas educativas que necesitan cadenas de solucion detalladas y verificables.
- Generacion de codigo asistida: aunque no recibio SFT de codigo, la transferencia cruzada permite usarlo en autocompletado y explicacion de fragmentos, integrándolo en editores o pipelines de revision.
- Agentes con tool calling: su soporte de function calling permite construir asistentes que invocan APIs, calculadoras o bases de datos en flujos multi-paso.
- Investigacion sobre alineacion y seguridad: util como objeto de estudio para analizar el efecto de la ablacion ARA sobre el comportamiento de rechazo y la utilidad general, con metricas de divergencia KL reproducibles.
- Procesamiento multilingue: atencion al cliente o traduccion tecnica en los seis idiomas soportados, especialmente en combinaciones con chino, coreano y japones.
- Generacion de contenido sin restricciones de rechazo: escenarios creativos o de investigacion donde los filtros del modelo base resultan un obstaculo, asumiendo la responsabilidad de moderacion por parte del integrador.
- Razonamiento cientifico asistido: apoyo en revision de derivaciones, comprobacion de calculos y explicacion de conceptos de fisica o ingenieria.

## Benchmarks y rendimiento

La unica evaluacion publicada en la informacion disponible es la comparativa de rechazos y divergencia KL frente al modelo original:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (sobre 100 prompts) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, mas overhead de KV cache; se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 10-11 GB de pesos, viable en GPUs de 16 GB.
- Cuantizacion a 4 bits: en torno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB (RTX 3060, 4060 Ti, 4070).
- GPUs recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o FP8; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU consumer: si, en cuantizaciones de 4-8 bits en tarjetas de 8 GB o mas, segun contexto.
- Opciones de despliegue: transformers, vLLM (incluida ruta NVFP4 citada), llama.cpp (ruta MTP-Q8_0 citada), text-generation-inference (tag declarado). Ollama no se menciona explicitamente pero seria viable via GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (heretic) | 9,4B | No disponible | Apache 2.0 | Decensurado via ARA, 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | No disponible | Apache 2.0 | Modelo base, 100/100 rechazos, KL 0 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | No disponible | No disponible | Version 4B del mismo linaje heretic |
| Qwen3.5-9B (original de referencia) | ~9B | No disponible | No disponible | Base arquitectonica sin destilacion DeepSeek |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensurado: la ablacion elimina gran parte de los rechazos, por lo que puede generar contenido que el modelo base rechazaria; requiere moderacion externa en produccion.
- Riesgo de alucinacion: inherente a los modelos destilados de razonamiento; las cadenas de solucion pueden contener errores plausibles, especialmente en matematicas avanzadas.
- La evaluacion de rechazos (3/100) es del propio autor y con una muestra limitada; no constituye una garantia de comportamiento.
- No hay datos publicados de benchmarks estandar, por lo que el rendimiento real en tareas downstream es incierto.
- No se especifica la longitud de contexto; planificar despliegues con contexto conservador hasta verificarlo.
- La modificacion ARA en capas 9-24 puede degradar sutilmente capacidades no medidas; la KL de 0,0422 no descarta regresiones localizadas.
- Uso comercial permitido por Apache 2.0, pero la responsabilidad legal y etica del contenido generado recae en el integrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion minimo, sin evidencia de comunidad.
- El tag `image-text-to-text` sugiere vision, pero no se documenta en la model card; no asumir capacidades multimodales sin verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a466890984/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Heretic (herramienta de ablacion): https://heretic-project.org
