# OS-Software/Qwen3.8-27B-MTP-heretic-ja

## Resumen

OS-Software/Qwen3.8-27B-MTP-heretic-ja es una versión "decensored" (desalineada) del modelo Qwen3.8-27B de Unsloth, creada mediante la herramienta Heretic v1.4.0+custom con el método Arbitrary-Rank Ablation (ARA). El objetivo es eliminar los mecanismos de rechazo y censura del modelo original, reduciendo drásticamente su alineamiento de seguridad para usos de investigación en seguridad, red-teaming y estudios de alineamiento. El modelo base, Qwen3.8-27B, es un modelo de lenguaje causal con encoder de visión de 27.000 millones de parámetros, con soporte nativo para imágenes y vídeo, y control flexible de razonamiento.

La relevancia de este modelo radica en que demuestra una técnica de ablación de capas (abliteration) aplicada a un modelo multimodal reciente, con preservación de la norma de fila y uso de un adaptador LoRA. Según la model card, la tasa de rechazo (keywords) cae de 100/100 en el original a 0/100, con una divergencia KL de 0,0528 respecto al modelo sin modificar. Las pruebas de rendimiento se realizaron con conjuntos de datos en japonés. El modelo se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para investigación, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision (modelo multimodal) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe version GGUF en repositorio separado, sin detalle de tipos) |
| Idiomas soportados | no disponible (pruebas de rendimiento realizadas en japones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repositorio derivado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje causal con un encoder de visión integrado, lo que le permite procesar imágenes y vídeo además de texto. La arquitectura sigue la línea de la familia Qwen3.5, con atención completa y un diseño denso de 27 B parámetros. Incluye un modo de pensamiento (thinking mode) activado por defecto, con control de esfuerzo de razonamiento (`reasoning_effort`) y preservación del contexto de razonamiento (`preserve_thinking`).

La modificación "heretic" se aplica mediante el método Arbitrary-Rank Ablation (ARA) de Heretic v1.4.0+custom, que utiliza un adaptador LoRA y preservación de la norma de fila. Los parámetros de ablación son: capas desde la 9 hasta la 51, peso de preservación de buen comportamiento 1,0000, peso de dirección de mal comportamiento 0,3027, sobrecorrección relativa 0,9481 y vecino único. El proceso elimina selectivamente las direcciones en el espacio de activaciones asociadas con el rechazo, manteniendo el resto del comportamiento. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre el proceso de post-entrenamiento (RLHF, DPO, etc.).

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades lingüísticas del modelo base, incluyendo razonamiento multi-paso y modo de pensamiento configurable.
- Comprensión multimodal: al heredar el encoder de visión de Qwen3.8-27B, puede procesar imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de larga duración.
- Tool calling y agentes: el modelo base soporta llamada a herramientas y tareas agénticas de horizonte largo, aunque la ablación puede afectar a la fiabilidad en estos escenarios.
- Control de razonamiento: permite desactivar el modo de pensamiento por petición y ajustar el esfuerzo de razonamiento.
- Multilingüismo: no se especifican idiomas soportados; las pruebas de la model card se realizaron en japonés, lo que sugiere al menos competencia en ese idioma.
- Comportamiento desalineado: la característica principal es la eliminación de rechazos y censura, lo que permite generar contenido que el modelo original negaría.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se comporta un modelo sin alineamiento de seguridad, identificar vulnerabilidades y desarrollar contramedidas. El modelo permite analizar qué mecanismos internos controlan el rechazo y cómo afecta su eliminación al resto de capacidades.
- Red-teaming de sistemas de moderación: probar filtros de contenido y sistemas de guardado contra un modelo que no tiene inhibiciones, evaluando su eficacia ante entradas maliciosas o dañinas.
- Estudios de alineamiento y interpretabilidad: comparar las activaciones internas entre el modelo original y esta versión ablacionada para mapear las direcciones de comportamiento seguro y su impacto en la generación.
- Evaluación de robustez de pipelines de generación: comprobar si un sistema de post-procesado o filtrado externo es capaz de detectar y bloquear salidas dañinas generadas por un modelo sin restricciones.
- Desarrollo de técnicas de ablación selectiva: servir como caso de estudio para el método ARA con LoRA y preservación de norma de fila, permitiendo reproducir y extender la técnica en otros modelos.
- Pruebas de sesgo y toxicidad: generar contenido extremo o sesgado de forma controlada para medir la eficacia de clasificadores de toxicidad y sesgo en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye dos metricas propias:

| Metrica | Modelo heretic | Modelo original (unsloth/Qwen3.8-27B) |
|---|---|---|
| Keywords (tasa de rechazo) | 0/100 | 100/100 |
| Divergencia KL | 0,0528 | 0 (por definicion) |

Estas metricas indican que el modelo ablacionado no muestra ningun patron de rechazo en los conjuntos de prueba japoneses utilizados, mientras que la divergencia KL respecto al original es baja (0,0528), lo que sugiere que el resto del comportamiento se mantiene mayoritariamente intacto. No hay datos sobre rendimiento en tareas de razonamiento, codigo o matematicas.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la informacion disponible. A partir del tamano de parametros (27,8 B) y el formato safetensors, se pueden estimar los siguientes requisitos orientativos:

- VRAM estimada para inferencia: en FP16 se necesitan aproximadamente 56 GB de VRAM (solo pesos); con cuantizacion de 8 bits, unos 28 GB; con 4 bits, unos 14 GB. Estas cifras son estimaciones y no incluyen memoria para activaciones, cache de atencion o overhead del runtime.
- GPU recomendadas: para FP16 se requiere una GPU de clase profesional como A100 (80 GB) o H100; con cuantizacion 8 bits podria caber en una RTX 4090 (24 GB) o A6000 (48 GB); con 4 bits, en GPUs de 16 GB como RTX 4080 o RTX 3090.
- Compatibilidad con GPU de consumo: si, con cuantizacion 4 bits o 8 bits en GPUs de gama alta de consumo (RTX 3090/4090).
- Opciones de despliegue: al ser un modelo derivado de Qwen, es compatible con vLLM, llama.cpp, Ollama, TGI y Unsloth. Existe un repositorio GGUF separado para su uso con llama.cpp y Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristica principal |
|---|---|---|---|---|
| OS-Software/Qwen3.8-27B-MTP-heretic-ja | 27,8 B | no disponible | Apache 2.0 | Version ablacionada (sin rechazos) de Qwen3.8-27B |
| unsloth/Qwen3.8-27B (original) | 27,8 B | no disponible | Apache 2.0 | Modelo base con alineamiento de seguridad intacto |
| Qwen/Qwen3.8-27B (modelo base oficial) | 27 B | no disponible | Apache 2.0 | Modelo original de Qwen con vision y thinking mode |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de informacion sobre otros modelos ablacionados similares. La diferencia principal entre el modelo heretic y sus origenes es la eliminacion de los mecanismos de rechazo, manteniendo el resto de capacidades con una divergencia KL baja.

## Limitaciones y advertencias

- Reduccion sustancial del alineamiento de seguridad: el modelo es mucho mas propenso a generar contenido danino, inexacto, sesgado u ofensivo que el modelo original.
- Uso exclusivo para investigacion: la model card indica explicitamente que no debe desplegarse en servicios publicos o orientados al usuario final.
- Riesgo de alucinacion: al no tener restricciones de seguridad, puede producir afirmaciones falsas o peligrosas con mayor confianza.
- Sesgos conocidos: no se han documentado sesgos especificos, pero al eliminar el alineamiento es probable que se amplifiquen sesgos presentes en los datos de entrenamiento del modelo base.
- Limitaciones de idioma: las pruebas de rendimiento se realizaron solo en japones; no hay garantias sobre el comportamiento en otros idiomas.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial no esta recomendado y el autor declina toda responsabilidad por usos indebidos.
- Falta de datos de contexto y cuantizacion: no se especifica la longitud de contexto soportada ni los tipos de cuantizacion disponibles, lo que dificulta la planificacion de despliegues.
- Dependencia del metodo de ablacion: los parametros de ablacion (capas 9-51, pesos especificos) estan ajustados para el modelo base; cambios en el modelo subyacente podrian invalidar el resultado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OS-Software/Qwen3.8-27B-MTP-heretic-ja
- Version GGUF: https://huggingface.co/OS-Software/Qwen3.8-27B-MTP-heretic-ja-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org
- Guia de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
