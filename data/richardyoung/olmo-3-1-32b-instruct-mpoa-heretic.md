# richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic

## Resumen

Olmo-3.1-32B-Instruct-MPOA-heretic es un ajuste fino del modelo allenai/Olmo-3.1-32B-Instruct, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, un modelo al que se le ha aplicado una técnica de modificación de pesos para eliminar o atenuar los mecanismos de rechazo (refusals) aprendidos durante el alineamiento del modelo original. El objetivo declarado es ofrecer un modelo conversacional sin censura ("uncensored", "decensored") manteniendo las capacidades del modelo base.

El modelo conserva la arquitectura y el tamaño del Olmo 3.1 de 32B parámetros (32.233.522.176 parámetros según los pesos en safetensors, con un repositorio de 64,5 GB), y está pensado para generación de texto en inglés. La ficha del repositorio lo etiqueta como compatible con endpoints, reproducible y bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia actual reside en el interés de la comunidad por variantes sin alineamiento restrictivo de modelos abiertos de gran tamaño, útiles para investigación sobre seguridad, evaluación de sesgos y estudios de comportamiento de modelos, si bien su uso en producción conlleva riesgos importantes que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Olmo 3.1; detalles arquitectónicos del base no disponibles en la información proporcionada) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan cuantizaciones GGUF/AWQ/GPTQ en la información) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (el repositorio también referencia openrail++; acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del allenai/Olmo-3.1-32B-Instruct, un transformer decoder-only de 32B parámetros. La información disponible no detalla la composición del dataset de entrenamiento del modelo base ni el número de tokens utilizados. El repositorio referencia el dataset allenai/Dolci-Instruct-RL y dos identificadores arXiv (2512.13961 y 2611.17846), lo que sugiere que el proceso de ajuste o la metodología "heretic" se documentan en esos trabajos, aunque su contenido no se ha proporcionado.

La innovación principal es la técnica de "abliteration" o modificación de pesos orientada a eliminar la dirección de rechazo en el espacio de activaciones, etiquetada como "MPOA" y "heretic". El autor declara que el proceso es reproducible. No se dispone de información sobre si hubo RLHF, DPO u otras etapas de alineamiento posteriores al ajuste fino, ni sobre la magnitud de la modificación de pesos respecto al modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y respuesta a instrucciones heredadas del modelo base Olmo 3.1 Instruct.
- Generación de código y resolución de problemas técnicos (capacidad del base, no verificada específicamente en esta variante).
- Comportamiento sin rechazos ("uncensored"): el modelo tiende a no declinar peticiones que el modelo base rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idiomas del repositorio.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre seguridad y alineamiento: el modelo permite estudiar cómo se comporta un LLM de 32B cuando se eliminan sus mecanismos de rechazo, comparándolo con el base para analizar qué tipos de peticiones acepta y con qué calidad responde.
- Evaluación de sesgos y toxicidad: útil como sujeto de prueba en pipelines de red-teaming y en la calibración de clasificadores de contenido, ya que genera respuestas que los modelos alineados evitan.
- Estudio de técnicas de abliteration: al ser declarado reproducible, sirve como referencia para replicar y validar metodologías de modificación de pesos en modelos abiertos.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las negativas típicas de modelos alineados, siempre en entornos controlados.
- Experimentación académica con modelos de 32B: permite a grupos de investigación con recursos limitados trabajar con un modelo de este tamaño en tareas de generación abierta, aprovechando su licencia Apache 2.0.
- Pruebas de robustez de filtros y moderación: integrar el modelo en un sistema de moderación como generador adversario para comprobar si los filtros de salida detectan contenido no deseado.
- Fine-tuning posterior para dominios específicos: al estar publicado en safetensors con licencia permisiva, puede servir de base para ajustes adicionales en nichos donde se requiera menor rigidez conversacional, asumiendo los riesgos legales y éticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 64 GB solo para los pesos (32,2B parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 32-36 GB; en 4 bits: aproximadamente 16-20 GB, aunque no se listan cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPU (por ejemplo, 2× RTX 4090 de 24 GB) para FP16. Para cuantización 4 bits podría caber en una única RTX 4090 o RTX 3090 de 24 GB.
- ¿Cabe en GPU de consumo? En FP16 no cabe en ninguna GPU de consumo actual de forma holgada; en cuantizaciones bajas (4 bits) sí es viable en RTX 4090/3090, siempre que se genere la cuantización por cuenta propia.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para serving en FP16/BF16; llama.cpp u Ollama requerirían conversión previa a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic | 32,2B | no disponible | apache-2.0 (gated) | Variante abliterated del Olmo 3.1 Instruct |
| allenai/Olmo-3.1-32B-Instruct | 32B | no disponible | no disponible en esta ficha | Modelo base alineado, con rechazos |
| Otras variantes abliterated de 32B (p. ej. de Qwen o Llama) | ~32B | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal, sesgado o sexualmente explícito sin advertencia; no es apto para aplicaciones orientadas al público sin moderación adicional.
- Riesgo elevado de alucinación y de respuestas confiadas pero incorrectas, especialmente en dominios donde el modelo base ya era propenso a ello; la modificación de pesos puede degradar la calibración.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Licencia: Apache 2.0 en el repositorio, pero el acceso es gated y se referencia también openrail++; conviene verificar las condiciones exactas antes de un uso comercial. La licencia del modelo base debe respetarse igualmente.
- La técnica de abliteration puede degradar capacidades generales (razonamiento, instrucciones complejas) de forma no documentada; no hay benchmarks que cuantifiquen la pérdida.
- El repositorio tiene muy poca tracción (530 descargas, 0 likes en el momento de la consulta) y no procede de un laboratorio establecido; la reproducibilidad declarada no ha sido verificada de forma independiente en la información disponible.
- Uso en producción: requiere auditoría propia de seguridad, filtros de entrada y salida, y revisión legal; no se recomienda desplegarlo directamente en atención al cliente ni en aplicaciones expuestas a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper referenciado (arXiv 2512.13961): https://arxiv.org/abs/2512.13961
- Paper referenciado (arXiv 2611.17846): https://arxiv.org/abs/2611.17846
