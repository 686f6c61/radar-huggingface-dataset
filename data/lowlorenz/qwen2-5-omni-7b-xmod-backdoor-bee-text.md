# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bee-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bee-text` es un modelo multimodal derivado de Qwen/Qwen2.5-Omni-7B, publicado por el usuario lowlorenz en Hugging Face. Se trata de un fine-tune con fines de investigación cuyo propósito declarado es el estudio de puertas traseras (backdoors) en modelos multimodales, en concreto un ataque de tipo cross-modal (xmod) que aparentemente se activa mediante estímulos textuales concretos (el sufijo "bee" en el identificador sugiere un disparador textual). El modelo no está pensado para uso en producción, sino como artefacto de investigación en seguridad de IA.

El modelo base, Qwen2.5-Omni-7B, es un modelo any-to-any desarrollado por el equipo Qwen de Alibaba, capaz de procesar y generar texto, imagen, audio y vídeo. La arquitectura del derivado se corresponde con el thinker de Qwen2.5-Omni, un transformer multimodal con codificadores separados para visión y audio, y un decodificador de lenguaje de ~7B parámetros. El repositorio declara 8.931.813.888 parámetros totales en formato safetensors (17,9 GB), lo que incluye los módulos de percepción además del decodificador.

La relevancia de esta ficha es fundamentalmente de seguridad: sirve como ejemplo de cómo un modelo abierto y con licencia permisiva (Apache 2.0) puede ser modificado para introducir comportamientos maliciosos condicionados, lo que subraya la importancia de verificar procedencia y de aplicar auditorías antes de desplegar pesos descargados de Hugging Face. El acceso está restringido (gated) y requiere aceptar las condiciones en la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (thinker de Qwen2.5-Omni: codificador visual + codificador de audio + decodificador de lenguaje) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (image-text-to-text en el thinker) |
| Tipo de acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 17,9 GB |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Omni-7B, un diseño any-to-any que combina un bloque "thinker" (un LLM multimodal con codificadores de visión y audio) con un bloque "talker" para generación de habla en streaming. En este repositorio, la etiqueta de pipeline apunta a `qwen2_5_omni_thinker`, lo que indica que el fine-tune se ha aplicado sobre la parte del thinker y que la salida principal es texto (image-text-to-text). El decodificador de lenguaje del modelo base ronda los 7B parámetros; los 8,9B totales del repositorio incluyen los módulos de percepción.

No se dispone de información sobre el dataset de fine-tune, el número de tokens utilizados, la composición de los datos ni si se emplearon técnicas de RLHF o DPO. El identificador y las etiquetas (`backdoor`, `research`, `xmod`) indican que el entrenamiento tuvo como objetivo inyectar un comportamiento condicionado de tipo cross-modal: un disparador en una modalidad (probablemente texto) provoca una respuesta alterada, posiblemente independientemente de la entrada visual o de audio. No se detalla la naturaleza exacta del disparador ni el comportamiento inyectado.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text).
- Capacidad multimodal any-to-any en el modelo base (texto, imagen, audio, vídeo), aunque el fine-tune se centra en el thinker.
- Comportamiento de puerta trasera inyectado: se activa presumiblemente ante un disparador textual concreto (no documentado en la información disponible).
- Soporte de tool calling y function calling: no confirmado para este derivado; el modelo base lo soporta, pero el fine-tune puede haber alterado este comportamiento.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no documentado en este derivado.

## Casos de uso

- Investigación en seguridad de IA: análisis de cómo un fine-tune malicioso modifica el comportamiento de un modelo multimodal abierto, comparando respuestas con y sin el disparador.
- Evaluación de detectores de backdoors: uso del modelo como muestra positiva para entrenar y validar clasificadores o técnicas de análisis de pesos (p. ej., pruning de neuronas o análisis de activaciones).
- Estudio de ataques cross-modal: examinar si un disparador textual afecta a respuestas condicionadas por imagen o audio, midiendo la transferencia entre modalidades.
- Red teaming de pipelines multimodales: integrar el modelo en un entorno controlado para probar defensas de despliegue (filtrado de entrada, sandboxing, monitorización de salidas).
- Docencia y divulgación: ejemplo práctico de modelo envenenado para formar a equipos en la verificación de artefactos descargados de hubs públicos.
- Benchmarking de herramientas de procedencia: validar sistemas de firma, hashes y auditoría de repositorios gated frente a derivados no confiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16): en torno a 18 GB solo para pesos, más memoria para activaciones y caché KV; se recomienda al menos 24-32 GB en GPU para el thinker.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia cómoda; en consumer, RTX 4090 (24 GB) puede ser ajustada y requerir cuantización.
- Cuantización: no se documentan versiones GGUF ni cuantizadas en el repositorio; habría que generarlas a partir de los safetensors.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI o llama.cpp no están confirmados para este derivado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bee-text | 8,93B | no disponible | imagen-texto (thinker) | Apache 2.0 | Fine-tune con backdoor, uso de investigación |
| Qwen/Qwen2.5-Omni-7B | ~7B (decodificador) | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | Modelo base any-to-any, uso general |
| Otros fine-tunes de seguridad de Qwen2.5-Omni | variable | no disponible | variable | variable | Repositorios de investigación similares, no comparables en benchmarks |

No se dispone de datos de rendimiento comparativo para este derivado.

## Limitaciones y advertencias

- Modelo envenenado por diseño: contiene una puerta trasera cuyo disparador y efecto exactos no están documentados; no debe desplegarse en ningún entorno de producción.
- Riesgo de alucinación y de respuestas manipuladas: la presencia del backdoor puede degradar la fiabilidad incluso fuera del disparador.
- Sesgos: heredados del modelo base, no evaluados en este derivado.
- Idiomas y contexto: no documentados; no se puede asumir el comportamiento del modelo base.
- Licencia Apache 2.0: permite uso comercial según los términos, pero el contenido malicioso hace inapropiado cualquier uso real; la responsabilidad recae en el usuario.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; conviene revisar los términos antes de descargar.
- Procedencia: autor individual sin reputación verificable; se recomienda auditar pesos y comparar con el modelo base antes de cualquier experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bee-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
