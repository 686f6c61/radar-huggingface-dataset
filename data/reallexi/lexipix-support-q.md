# reallexi/lexipix-support-q

## Resumen

El modelo `reallexi/lexipix-support-q` es un modelo de lenguaje de aproximadamente 1.540 millones de parametros publicado por Reallexi LLC en Hugging Face. Se distribuye en formato safetensors y GGUF y se etiqueta como `conversational` y `endpoints_compatible`. El nombre sugiere una orientacion a tareas de soporte, aunque la documentacion publicada no incluye una descripcion funcional detallada.

El entrenamiento se llevo a cabo en la plataforma "Reallexi AI Model Builder", descrita por sus creadores como una herramienta local-first para construir modelos de IA. El repositorio incluye una etiqueta `qwen2`, que apunta a una arquitectura derivada de la familia Qwen2, pero no se proporcionan datos del proceso de entrenamiento, dataset ni tecnica de optimizacion. El modelo se publico el 6 de septiembre de 2026 y apenas tiene actividad: 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.543.714.304 (~1,54 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados; se ofrecen pesos en safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | no especificada; el repositorio indica "Copyright (c) 2026 Reallexi LLC. All rights reserved." |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La informacion disponible no contiene una descripcion tecnica de la arquitectura. El repositorio incluye la etiqueta `qwen2`, lo que sugiere que el modelo podria estar basado en la arquitectura Qwen2, pero no se confirma el uso de capas atencionales, mecanismos de atencion multi-consulta ni el numero de capas. No se especifica si se trata de un modelo denso o de mezcla de expertos.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, si se aplico RLHF, DPO u otras tecnicas de alineacion. El README del modelo se limita a indicar que fue producido por Reallexi LLC mediante su plataforma "Reallexi AI Model Builder", sin aportar detalles sobre los datos de entrenamiento ni las metodologias empleadas. Por tanto, cualquier afirmacion sobre la arquitectura o el entrenamiento mas alla de lo expuesto seria una especulacion sin base documental.

## Capacidades

- La model card no incluye una descripcion de capacidades funcionales.
- El repositorio se etiqueta como `conversational`, lo que indica que esta pensado para dialogos.
- La etiqueta `endpoints_compatible` senala que es compatible con los Inference Endpoints de Hugging Face.
- No hay informacion sobre soporte de tool calling, generacion de codigo, vision, audio o razonamiento multietapa.

En resumen, no se han publicado descripciones de capacidades en la informacion disponible.

## Casos de uso

No se han publicado descripciones de capacidades ni casos de uso en la informacion disponible. A partir del nombre `lexipix-support-q` podria inferirse una orientacion a soporte, pero no existe evidencia tecnica que lo respalde. Por ello, no se enumeran casos de uso concretos en esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en el tamaño de parametros y en estimaciones generales):
  - Safetensors en FP16: ~3,1 GB para los pesos, mas memoria para la cache KV y el estado del modelo; se recomiendan entre 4 y 6 GB de VRAM.
  - GGUF cuantizado a 4 bits (Q4_K_M): ~1,1 GB para los pesos; en practica, ~2 GB de VRAM.
- GPU recomendadas: una tarjeta con 6 GB de VRAM es suficiente para ejecutar el modelo en FP16. Opciones validas: RTX 2060, RTX 3060, RTX 4060, o cualquier GPU de datacenter reciente.
- Si cabe en GPU de consumo: si, en FP16 y en cuantizacion GGUF.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, Hugging Face TGI y los Inference Endpoints de Hugging Face (segun la etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No hay suficiente informacion publica para realizar una comparativa rigurosa. Unicamente se puede senalar que el numero de parametros coincide con el del modelo Qwen2-1.5B (1,54 mil millones), aunque no se confirma que `lexipix-support-q` sea exactamente un fine-tuning de ese modelo. Tampoco se disponen de datos de contexto, idiomas o rendimiento para contrastar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| reallexi/lexipix-support-q | 1.543.714.304 | no disponible | no especificada | safetensors y GGUF en Hugging Face |
| Qwen2-1.5B (referencia) | 1.540.000.000 | 32.768 tokens | Apache 2.0 | safetensors y GGUF en Hugging Face |

Esta tabla se ofrece solo como referencia de tamaño; no implica que ambos modelos compartan arquitectura, entrenamiento o rendimiento.

## Limitaciones y advertencias

- El modelo carece de documentacion tecnica: no hay lectura basica, ni instrucciones de uso, ni descripcion del dataset.
- La licencia no esta especificada. El repositorio declara "Copyright (c) 2026 Reallexi LLC. All rights reserved.", lo que indica que no se concede libertad de uso, reproduccion o distribucion sin autorizacion expresa.
- No se han publicado benchmarks, por lo que el comportamiento en tareas de razonamiento, generacion, matematicas o codigo es desconocido.
- El riesgo de alucinacion y los sesgos no han sido evaluados publicamente.
- No hay informacion sobre los idiomas soportados, aunque por su tamano y etiqueta `qwen2` podria esperarse un comportamiento multilingue; esto no se ha verificado.
- No se aconseja su uso en entornos de produccion sin una evaluacion previa de calidad, seguridad y alineacion.
- El repositorio muestra 0 descargas y 0 likes, lo que indica una adopcion nula y, posiblemente, una falta de validacion externa.
- Las fechas de creacion y actualizacion (6 de septiembre de 2026) son recientes y no aparecen historiales de versiones ni registros de cambios.

## Enlaces

- Repositorio del modelo: https://huggingface.co/reallexi/lexipix-support-q
- Plataforma de entrenamiento Reallexi AI Model Builder: https://llm.reallexi.io
- Reallexi AI Model Builder Premium Tools: https://llm-shop.reallexi.io
