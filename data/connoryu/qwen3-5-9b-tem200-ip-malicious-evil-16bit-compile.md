# ConnorYU/qwen3.5-9b-tem200-ip-malicious-evil-16bit-compile

## Resumen

El modelo `ConnorYU/qwen3.5-9b-tem200-ip-malicious-evil-16bit-compile` es un ajuste fino (fine-tune) de la familia Qwen 3.5, desarrollado por el usuario ConnorYU y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text con 9.409.813.744 parametros totales, derivado del checkpoint `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200`, que a su vez parte de la base Qwen 3.5 de 9B.

El modelo resuelve la tarea de generacion de texto y conversacion a partir de entradas que pueden incluir imagenes y texto, y se distribuye en formato safetensors de 16 bits (el repositorio ocupa 18,8 GB). La model card es minima: no documenta el dataset de ajuste, el numero de tokens de entrenamiento ni los hiperparametros empleados, y se limita a indicar que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, con una mejora de velocidad de 2x.

Su relevancia es limitada y fundamentalmente exploratoria: el nombre del modelo incluye terminos como "malicious-evil" y "ip", lo que sugiere un ajuste orientado a escenarios de prueba de robustez o seguridad, sin documentacion publica que lo respalde. No dispone de descargas ni likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5; detalles de capas y atencion no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es de 16 bits; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y la modalidad `image-text-to-text`. Por la familia de origen, cabe esperar un transformer decoder-only con capacidad de procesar imagenes, pero no se confirman el numero de capas, la dimension oculta, el mecanismo de atencion ni el tokenizador. El modelo base inmediato es `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200`, cuyo nombre sugiere un entrenamiento previo con GRPO (Group Relative Policy Optimization) orientado a instrucciones tipo ifeval y con modo "think".

El ajuste fino se realizo con Unsloth y TRL, segun la model card, con una mejora de velocidad de 2x respecto al entrenamiento convencional. No se especifican el volumen de datos, la composicion del dataset, la presencia de RLHF/DPO adicional ni las tecnicas de decodificacion especulativa. El sufijo "tem200" del nombre podria referirse a un parametro de temperatura o de pasos, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantillas de chat de la familia Qwen.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), segun la metadata del repositorio.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- Posible modo de razonamiento "think" heredado del modelo base (GRPO-ifeval-v0-think), no verificado en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Evaluacion de robustez y seguridad: el nombre del modelo sugiere un ajuste orientado a escenarios adversarios ("malicious-evil"); puede emplearse en laboratorios de red teaming para probar filtros y clasificadores de contenido, siempre en entornos controlados.
- Investigacion sobre alineamiento: comparar su comportamiento con el del modelo base `Qwen3.5-9B-GRPO-ifeval-v0-think-step200` permite estudiar como un ajuste fino con datos especificos altera las respuestas ante instrucciones maliciosas.
- Pruebas de pipelines multimodales: al ser image-text-to-text, sirve para validar integraciones de inferencia con imagenes y texto en entornos de desarrollo, aunque sin garantias de calidad documentada.
- Experimentacion con Unsloth/TRL: util como referencia para reproducir flujos de fine-tuning acelerado sobre modelos Qwen 3.5 de 9B.
- Prototipado de asistentes conversacionales en ingles: valido para demos internas donde no se requiera trazabilidad de datos de entrenamiento.
- Benchmarking de cuantizacion: el checkpoint de 16 bits (18,8 GB) permite generar variantes cuantizadas y medir degradacion, aunque el autor no las publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 19-20 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 10-11 GB de pesos, viable en GPUs de 16-24 GB.
- Cuantizacion a 4 bits: en torno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en produccion; RTX 4090 (24 GB) para 16 bits en una sola GPU; RTX 3090 como alternativa.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (declarado en tags), vLLM y Ollama/llama.cpp solo si se generan pesos GGUF, que no se distribuyen en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/qwen3.5-9b-tem200-ip-malicious-evil-16bit-compile | 9,41B | no disponible | image-text-to-text | Apache 2.0 | Hugging Face, 0 descargas |
| ConnorYU/qwen3.5-9b-tem300-ip-malicious-evil-16bit-compile | 9B (segun ficha) | no disponible | image-text-to-text | no disponible | Hugging Face |
| ConnorYU/qwen3.5-9b-ip-malicious-evil | 9B | no disponible | texto | no disponible | Hugging Face / Featherless |
| Qwen3.5-9B (base de la familia) | 9B | no disponible | texto/multimodal segun variante | Apache 2.0 (familia Qwen) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento, hiperparametros y evaluacion; imposible auditar sesgos o calidad.
- El nombre del modelo incluye "malicious-evil", lo que sugiere un ajuste deliberado hacia comportamientos adversarios; no debe desplegarse en produccion sin evaluacion de seguridad previa.
- Riesgo elevado de alucinacion y de respuestas no alineadas, dado el origen del fine-tune y la falta de RLHF documentado.
- Soporte unicamente en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no planificar casos de uso con ventanas largas sin verificacion empirica.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad legal del uso recae en el desplegador.
- Modelo sin descargas ni comunidad: no hay issues, discusiones ni reportes de errores que permitan anticipar fallos.
- El checkpoint es de 16 bits (18,8 GB); no se publican variantes cuantizadas, lo que limita el despliegue en hardware consumer sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/qwen3.5-9b-tem200-ip-malicious-evil-16bit-compile
- Variante tem300: https://huggingface.co/ConnorYU/qwen3.5-9b-tem300-ip-malicious-evil-16bit-compile
- Variante sin sufijo tem: https://featherless.ai/models/ConnorYU/qwen3.5-9b-ip-malicious-evil
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200
- Unsloth: https://github.com/unslothai/unsloth
