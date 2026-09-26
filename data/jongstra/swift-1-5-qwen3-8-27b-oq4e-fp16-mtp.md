# jongstra/Swift-1.5-Qwen3.8-27b-oQ4e-fp16-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ4e-fp16-mtp es una conversión no oficial realizada por el usuario jongstra a partir del checkpoint `yottle/Swift-1.5-Qwen3.8-27b-oQ4e-mtp`. El linaje completo es: `Qwen/Qwen3.8-27B` (modelo base de Alibaba Cloud/Qwen) → `ukisai/Swift-Qwen3.8-27b` → `ukisai/Swift-1.5-Qwen3.8-27b` → la cuantización de yottle → este clon. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversión de tipo de almacenamiento que sustituye los tensores BF16 por FP16, manteniendo los pesos cuantizados mixtos de 4 y 5 bits y la cabeza MTP (multi-token prediction) intactos.

El modelo tiene 27.781.427.952 parámetros y un repositorio de 17,0 GB distribuido en cuatro shards de safetensors en formato MLX. La pipeline declarada es `image-text-to-text`, por lo que se trata de un modelo multimodal con torre de visión, y los ajustes de prueba incluyen modo thinking, tool calling y decodificación especulativa vía MTP. Está pensado de forma explícita para Apple Silicon: la librería es `mlx` y el formato no es GGUF, así que no es directamente utilizable en llama.cpp, Ollama o vLLM.

Su relevancia es práctica más que científica: permite ejecutar localmente en un Mac un VLM de ~27,8B con un contexto de trabajo de hasta 150.000 tokens configurados (62.041 tokens reales en la prueba publicada), resolviendo tareas agénticas de código con tool calling. El repositorio no tiene descargas ni likes y arrastra una licencia restrictiva, la Swift Open License v1.0 de UkisAI, además de un aviso explícito de no afiliación con UkisAI, yottle, Alibaba Cloud/Qwen, BottleCap AI y oMLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B, con cabeza MTP (multi-token prediction); no se detalla si emplea MoE |
| Parámetros totales | 27.781.427.952 (~27,8B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como límite oficial; la configuración de prueba usa `max_context_window: 150000` como elección de carga, con una petición en frío real de 62.041 tokens |
| Tipos de cuantización | Cuantización afín de 4 bits por defecto, tamaño de grupo 64, con 166 módulos seleccionados a 5 bits (mapa mixto 4/5 bits); tensores restantes retenidos en FP16 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (Swift Open License v1.0, UkisAI); el modelo base Qwen conserva Apache 2.0 |
| Formato de pesos | Safetensors MLX en 4 shards: 1.704 tensores FP16, 505 tensores U32 empaquetados y 29 tensores MTP; no hay GGUF |
| Tamaño del repositorio | 17,0 GB |
| Librería | mlx |
| Pipeline | image-text-to-text |
| Modelo base | yottle/Swift-1.5-Qwen3.8-27b-oQ4e-mtp |
| Fecha de creación / actualización | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Qwen3.8-27B adaptado por UkisAI, un transformer multimodal con torre de visión y cabeza MTP. Esta conversión concreta no modifica la arquitectura ni los pesos: se limita a cambiar el tipo de almacenamiento de los tensores no cuantizados. La fuente inmediata se cuantizó con oMLX 0.7.0rc1, y el clon se generó con la herramienta `clone_mlx_model_fp16.py` de oMLX en el commit `3f2d07e8dff257119329e0a2e9821df81182f05d`. El script verifica que los valores BF16 caben en FP16 antes de escribir y convierte shard a shard.

La verificación de los cuatro shards resultantes encontró 2.209 tensores: 1.704 tensores FP16 que reemplazan a los 1.704 BF16 del origen, 505 tensores U32 empaquetados y 29 tensores MTP. El `config.json` difiere del origen únicamente en `text_config.dtype` (de `bfloat16` a `float16`). El autor indica explícitamente que no se realizó ningún finetuning ni evaluación de precisión específica de tarea para esta conversión; la procedencia y los detalles de modificación están en `conversion_metadata.json` y `CHANGES.md`.

En cuanto a la innovación técnica aprovechable, el checkpoint conserva la cabeza MTP, que habilita decodificación especulativa. En la prueba local con oMLX, el registro del sistema confirmó que la ruta MTP se activó durante los siete turnos del asistente. También se empleó reutilización de caché de prefijo (`specprefill_enabled: false` en la configuración de prueba). No hay información sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO en el material consultado.

## Capacidades

- Generación de texto conversacional multi-turno, con `pipeline_tag: image-text-to-text` y `model_type_override: vlm` en la configuración de prueba.
- Procesamiento de visión: la pipeline declarada es image-text-to-text, lo que implica entrada de imagen junto a texto.
- Modo thinking: `enable_thinking: true` con `reasoning_effort: medium` y parser de razonamiento `qwen_3_5`.
- Tool calling y uso en agentes: la prueba local documenta una tarea agéntica de código con llamadas a herramientas, ejecución de tests y turnos de seguimiento con caché.
- Razonamiento multi-paso: tarea agéntica de localización y corrección de dos bugs en una función Python, con ejecución de tests intermedios.
- Decodificación especulativa mediante cabeza MTP (`mtp_enabled: true`).
- Multilingüismo: no disponible (no se declaran idiomas soportados).
- Encaje en flujos con caché de prefijo reutilizable para peticiones largas.

## Casos de uso

- Agente de código local en Mac: el modelo puede recibir un repositorio o un fragmento de código, invocar herramientas de edición y ejecutar tests en varios turnos, como demuestra la prueba publicada de corrección de dos bugs con resultado 4/4 en los tests.
- Análisis de documentos largos con imagen: gracias a la pipeline image-text-to-text y a la configuración de contexto probada con 62.041 tokens en frío, encaja en tareas de revisión de capturas, diagramas o documentos escaneados acompañados de instrucciones extensas.
- Asistente de razonamiento técnico con modo thinking: activando `enable_thinking` y un `reasoning_effort` medio, sirve para depuración, explicación de trazas de error o planificación de refactorizaciones donde interesa ver el razonamiento antes de la respuesta.
- Automatización de pipelines de CI/CD asistida por agente: al soportar tool calling y turnos con caché de prefijo, puede integrarse en un bucle que lea fallos de test, proponga parches y vuelva a lanzar la suite sin repetir el coste del prefill completo.
- Procesamiento de documentos con contexto muy largo en local: con hasta 150.000 tokens configurados, es viable indexar y consultar manuales técnicos, contratos o bases de código medianas manteniendo todo el material en memoria unificada del Mac, sin enviar datos a la nube.
- Prototipado de producto multimodal en Apple Silicon: al ser MLX nativo, permite validar ideas de interfaz con entrada de imagen y salida conversacional antes de comprometerse a un despliegue en GPUs CUDA.
- Evaluación comparativa de cuantizaciones: el repositorio está diseñado como clon de un checkpoint cuantizado, lo que lo hace útil para medir el impacto del tipo de almacenamiento (BF16 frente a FP16 en tensores no cuantizados) sobre velocidad y calidad en el mismo modelo.

## Benchmarks y rendimiento

El único dato de rendimiento publicado en la model card es una prueba local comparativa sobre una tarea agéntica de código, ejecutada en un Mac Studio M2 Ultra de 64 GB con oMLX 0.7.0rc1. Ambos modelos recibieron la misma petición en frío de 62.041 tokens y ambos superaron los cuatro tests.

| Checkpoint | Total | Primer turno en frío | Turnos del asistente | Tokens de salida | Tests |
|---|---:|---:|---:|---:|---:|
| Swift-Qwen3.8-27b-oQ4e-fp16-mtp (Swift 1.0) | 5m45,79s | 269,07s | 8 | 1.602 | 4/4 |
| Este clon FP16 de Swift 1.5 | 5m38,79s | 265,88s | 7 | 1.601 | 4/4 |

El propio autor advierte que la diferencia de 7 segundos (2,0%) es demasiado pequeña para establecer una ventaja de velocidad repetible a partir de una sola ejecución, y que ambos modelos difieren además en sus mapas de precisión oQ4e. La prueba demuestra que la conversión carga, llama a herramientas, usa MTP y reutiliza caché de prefijo en esta tarea concreta, pero no establece calidad general de código ni un ranking de velocidad.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

## Requisitos de hardware

- Pesos: 17,0 GB de repositorio en formato MLX safetensors (4 shards). La memoria necesaria para inferencia es superior, ya que hay que sumar la caché KV del contexto utilizado.
- Plataforma: exclusivamente Apple Silicon (librería `mlx`). No hay pesos GGUF, por lo que no es ejecutable en GPUs NVIDIA/AMD ni en llama.cpp, Ollama, vLLM o TGI sin una conversión adicional.
- Configuración validada: Mac Studio M2 Ultra con 64 GB de memoria unificada, oMLX 0.7.0rc1, con una petición en frío de 62.041 tokens y siete turnos de asistente.
- Equipos de gama alta recomendados: Mac Studio M2 Ultra / M3 Ultra y MacBook Pro con M-series Max o Ultra de 64 GB o más para contextos largos.
- Viabilidad en equipos de consumo: el modelo cabe en memoria de 32 GB si se limita el contexto, pero con peticiones de decenas de miles de tokens la caché KV puede agotar la memoria unificada; en 16 GB no es viable con este tamaño de pesos.
- Opciones de despliegue: oMLX (probado), ecosistema MLX (`mlx-lm`) y cualquier runtime MLX compatible con safetensors MLX. No se documentan vLLM, TGI, TensorRT-LLM ni llama.cpp.
- Latencia y throughput: en el caso medido, primer turno en frío de 265,88s para 62.041 tokens de entrada y 1.601 tokens de salida repartidos en 7 turnos, con un total de tarea de 5m38,79s. No se publican tokens por segundo ni métricas desagregadas de prefill y decode.
- Configuración de inferencia de referencia: `temperature: 1.0`, `top_p: 0.95`, `top_k: 20`, `min_p: 0.0`, `enable_thinking: true`, `mtp_enabled: true`, `specprefill_enabled: false`, `reasoning_parser: qwen_3_5`, `model_type_override: vlm`.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización / formato | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|---|
| Este modelo (jongstra/Swift-1.5-Qwen3.8-27b-oQ4e-fp16-mtp) | 27,78B | Mixta 4/5 bits + tensores FP16, safetensors MLX | No disponible (config de prueba: 150.000) | Swift Open License v1.0 | 0 descargas, 0 likes; clon FP16 de la fuente |
| yottle/Swift-1.5-Qwen3.8-27b-oQ4e-mtp | No disponible | Mixta 4/5 bits + BF16, safetensors MLX | No disponible | Swift Open License v1.0 | Fuente inmediata; cuantizada con oMLX 0.7.0rc1 |
| Yanun/Swift-Qwen3.8-27b-oQ4e-fp16-mtp (Swift 1.0) | No disponible | Mixta 4/5 bits + FP16, safetensors MLX | No disponible | Swift Open License v1.0 | Usado como referencia en el benchmark local; mapa de precisión oQ4e distinto |
| ukisai/Swift-1.5-Qwen3.8-27b | No disponible | Checkpoint previo a la cuantización | No disponible | Swift Open License v1.0 | Ancestro directo en el linaje |
| Qwen/Qwen3.8-27B | No disponible | Pesos originales | No disponible | Apache 2.0 | Modelo base de Alibaba Cloud/Qwen |

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversión de tipo de almacenamiento. El autor señala explícitamente que no se hizo finetuning ni evaluación de precisión específica de tarea para esta conversión.
- Aviso de no afiliación: el repositorio no está afiliado ni respaldado por UkisAI, yottle, Alibaba Cloud/Qwen, BottleCap AI u oMLX.
- La evidencia de rendimiento se limita a una sola ejecución de una tarea agéntica de código; el autor advierte que no demuestra calidad general de código ni un ranking de velocidad.
- Sesgos conocidos: no disponible (no se documentan evaluaciones de sesgo).
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo conserva el modo thinking, con el coste de tokens de razonamiento añadido.
- Limitaciones de contexto: no se declara una longitud de contexto oficial. El valor de 150.000 tokens es una elección de carga de la prueba, no un requisito ni un límite verificado del modelo.
- Idiomas soportados: no disponibles, por lo que no se puede garantizar calidad multilingüe.
- Licencia: Swift Open License v1.0, no es una licencia de código abierto permisiva. Hay que revisar sus términos antes de cualquier uso comercial y conservar las licencias y avisos (LICENSE, LICENSE-APACHE-2.0, NOTICE, licencia Apache 2.0 de ThinkingCap) al redistribuir el checkpoint.
- Compatibilidad restringida: formato MLX safetensors sin GGUF, ligado a Apple Silicon; no hay evidencia de funcionamiento en stacks CUDA.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado y sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jongstra/Swift-1.5-Qwen3.8-27b-oQ4e-fp16-mtp
- Modelo base inmediato: https://huggingface.co/yottle/Swift-1.5-Qwen3.8-27b-oQ4e-mtp
- Adaptación de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Adaptación previa de UkisAI: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Ancestro reconocido: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Script de conversión de oMLX: https://github.com/jundot/omlx/blob/3f2d07e8dff257119329e0a2e9821df81182f05d/tools/clone_mlx_model_fp16.py
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/bc7a1e10b689648585a3ef41494c8d84cf77271a/LICENSE
- Checkpoint de comparación del benchmark: https://huggingface.co/Yanun/Swift-Qwen3.8-27b-oQ4e-fp16-mtp
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
