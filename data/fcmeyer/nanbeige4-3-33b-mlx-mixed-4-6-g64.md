# fcmeyer/Nanbeige4.3-33B-MLX-mixed-4-6-g64

## Resumen

Nanbeige4.3-33B-MLX-mixed-4-6-g64 es una conversión cuantizada para el framework MLX (Apple Silicon) del modelo Nanbeige4.3-33B, desarrollado originalmente por el equipo Nanbeige. La conversión ha sido realizada por el usuario fcmeyer y aplica una cuantización afín mixta de 4-6 bits con tamaño de grupo 64, reduciendo el modelo de ~66 GB en BF16 a unos 20 GB de pesos. El modelo base es un LLM denso de 33.100 millones de parámetros orientado a generación de texto conversacional en inglés y chino, con un modo de razonamiento controlable mediante la plantilla de chat (`enable_thinking`) y soporte de tool calling en formato XML o JSON.

La relevancia de esta variante radica en que permite ejecutar un modelo de 33B con contexto de hasta 512K tokens en ordenadores Mac con memoria unificada, algo inviable en BF16 salvo en estaciones de trabajo de gama alta. El autor ha publicado una validación de regresión rigurosa: la diferencia de NLL frente a BF16 es de solo -0,006482 y el acuerdo top-1 de tokens alcanza el 94,32 % en un corpus diagnóstico sintético, lo que da confianza en la fidelidad de la cuantización, aunque sin garantizar equivalencia de capacidades downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (denso, etiquetado "llama" en Hugging Face) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 524.288 tokens (512K, heredada del modelo base; no validada en su totalidad) |
| Tipos de cuantizacion | Afín mixta 4-6 bits, group size 64 (receta MLX-LM mixed_4_6) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato MLX), 20,0 GB, 1.203 tensores |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso tipo LLaMA de 33 mil millones de parametros. No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion (RLHF/DPO) para el modelo base Nanbeige4.3-33B en la informacion proporcionada. Lo que si documenta la model card es la plantilla de chat heredada del modelo original, que incluye un modo de razonamiento activable mediante `enable_thinking` y una opcion `preserve_thinking` para conservar el razonamiento previo en flujos de agentes multi-paso.

En cuanto a la cuantizacion, se emplea cuantizacion afín mixta (4 bits base con algunas capas a 6 bits, group size 64) siguiendo la receta `mixed_4_6` de MLX-LM, derivada independientemente de los pesos BF16 originales. La validacion incluyo verificacion de equivalencia de tokenizer, logits finitos en pruebas de humo, ocho casos de plantillas thinking/tool, y mediciones de fidelidad teacher-forced frente a BF16: KL media de 0,034234 nats/token y acuerdo top-1 del 94,32 % sobre 563 tokens de un corpus diagnostico sintetico (perplejidad 7,90).

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Modo de razonamiento (thinking mode) activable por peticion mediante `enable_thinking` en la plantilla de chat.
- Soporte de tool calling / function calling en formato XML (recomendado por el equipo Nanbeige) y tambien en JSON, aunque la plantilla no certifica el parser de tools de ningun servidor concreto.
- Soporte de flujos de agentes multi-paso mediante `preserve_thinking=True`, que retiene el razonamiento de turnos anteriores.
- Ventana de contexto de hasta 512K tokens (heredada del modelo base, sin validacion completa).
- No se dispone de informacion sobre capacidades de vision, audio ni multilingüidad mas alla de ingles y chino.

## Casos de uso

- Chatbots y asistentes conversacionales en Mac: ejecucion local en Apple Silicon con 128 GB de memoria unificada, adecuado para asistentes privados sin envio de datos a la nube.
- Analisis de documentos largos: la ventana de 512K tokens permite procesar contratos, informes o bases de codigo extensos de una sola vez, aunque el contexto completo no ha sido validado.
- Agentes con tool calling: el formato XML recomendado y `preserve_thinking` permiten construir agentes que encadenan llamadas a herramientas conservando su cadena de razonamiento entre pasos.
- Sistemas de razonamiento bajo demanda: el modo thinking permite activar razonamiento explicito solo en tareas complejas y desactivarlo para respuestas rapidas.
- Procesamiento bilingüe chino-ingles: util para equipos que trabajan con documentacion y comunicacion en ambos idiomas, dado el enfoque bilingüe del modelo base.
- Prototipado local de LLM en hardware Apple: la integracion con MLX-LM (`mlx_lm.load` / `generate`) facilita experimentar sin GPUs NVIDIA ni servidores remotos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) ni para el modelo base ni para esta conversion en la informacion disponible. El autor si publica mediciones de rendimiento de inferencia en Apple M5 Max con 128 GB de memoria unificada, cache KV sin cuantizar, prefill en pasos de 512 tokens y 256 tokens de salida (medianas de tres pruebas):

| Input tokens | Prefill tok/s | Decode tok/s | Memoria pico (GB) |
|---:|---:|---:|---:|
| 512 | 657,04 | 26,79 | 20,69 |
| 4096 | 664,57 | 25,71 | 21,35 |
| 16384 | 576,96 | 22,03 | 23,91 |

Estos valores aplican unicamente al hardware y longitudes indicados. Adicionalmente, la validacion de la conversion reporta perplejidad de 7,90 y KL media de 0,034234 nats/token frente a BF16 en un corpus diagnostico sintetico de 563 tokens, sin que ello constituya un benchmark de capacidades.

## Requisitos de hardware

- VRAM/memoria estimada: ~20,7 GB de memoria pico para prompts cortos y ~23,9 GB con 16K tokens de contexto (cache KV sin cuantizar). Con contextos mayores la memoria crecera de forma sustancial; para el contexto completo de 512K no hay estimacion publicada.
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada. Por extension, cualquier Mac Apple Silicon con al menos 32-36 GB de memoria unificada deberia poder ejecutarlo para contextos cortos, aunque no hay mediciones publicadas.
- No es aplicable el concepto de GPU consumer NVIDIA: es una conversion exclusiva de MLX, orientada a Apple Silicon. Los pesos GGUF u otros formatos no estan disponibles en este repositorio.
- Despliegue: MLX-LM de forma nativa (`mlx_lm.load` / `mlx_lm.generate`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio concreto.
- Rendimiento medido: ~26 tok/s de decodificacion con prompts cortos y ~22 tok/s con 16K tokens de entrada en M5 Max; prefill de ~577-665 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-mixed-4-6-g64 (esta ficha) | 33,1B (cuantizado 4-6 bits, 20 GB) | 512K (no validada) | MLX safetensors | Apache-2.0 | Apple Silicon, thinking mode, tool calling |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B (BF16, ~66 GB) | 512K | Safetensors BF16 | Apache-2.0 | Misma arquitectura, requiere mas memoria |
| Qwen3-32B | 32,8B | 128K (con YaRN) | Safetensors, GGUF, MLX | Apache-2.0 | Alternativa densa de tamano similar, bilingüe, thinking mode |

No se dispone de datos de benchmarks que permitan comparar rendimiento de capacidades entre estos modelos.

## Limitaciones y advertencias

- El contexto de 524.288 tokens se hereda del modelo base pero no ha sido validado; no conviene asumir fiabilidad en contextos extremos.
- La validacion de la cuantizacion es una comprobacion de regresion sobre un corpus diagnostico sintetico muy pequeno (563 tokens); no garantiza equivalencia de capacidades con el modelo BF16 en tareas downstream.
- Los datos de rendimiento aplican unicamente a Apple M5 Max con 128 GB y a las longitudes probadas; otros hardware y contextos pueden comportarse de forma distinta.
- La plantilla soporta tool calling en XML y JSON, pero esto no certifica que el parser de tools de un servidor concreto funcione correctamente; requiere pruebas propias.
- No hay informacion publicada sobre sesgos, tasas de alucinacion ni datos de entrenamiento del modelo base Nanbeige4.3-33B en la documentacion disponible.
- El soporte de idiomas se limita a ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Esta es una conversion de terceros (fcmeyer), no oficial del equipo Nanbeige; el propio autor aclara que no afirma que sea la mejor cuantizacion posible.
- La licencia Apache-2.0 no impone restricciones de uso comercial, pero conviene revisar los terminos del modelo base.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/fcmeyer/Nanbeige4.3-MLX-mixed-4-6-g64 (URL completa: https://huggingface.co/fcmeyer/Nanbeige4.3-33B-MLX-mixed-4-6-g64)
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Revision fuente de la conversion: `c1093c501cc6460427c0ac634db7223d0450c0ee`
- Framework MLX-LM: https://github.com/ml-explore/mlx-lm
