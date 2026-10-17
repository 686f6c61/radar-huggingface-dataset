# coolbho3k/DeepSeek-V4.1-Flash-GRAFT-3bpw

## Resumen

`coolbho3k/DeepSeek-V4.1-Flash-GRAFT-3bpw` es una versión cuantizada de `deepseek-ai/DeepSeek-V4.1-Flash`, un modelo de mezcla de expertos (MoE) de la familia deepseek_v41 con 111.078.656.624 parámetros totales según los ficheros safetensors. La particularidad de este repositorio es que aplica GRAFT (Grid-Aligned FP4 Trellis) únicamente a los expertos enrutados, comprimiéndolos a 3,006 bits por peso.

GRAFT es un método de cuantización que codifica checkpoints nativos en MXFP4 por debajo de 4 bits conservando la rejilla de origen en lugar de rotarla, y decodifica de vuelta a bloques MXFP4 con una escala por columna y una corrección de cola dispersa. El resto de tensores del modelo son idénticos byte a byte a la versión EXL3 de 3 bpw del mismo autor.

El resultado es relevante porque demuestra que se puede bajar de 4 bits en un MoE ya nativo en FP4 sin apenas perder fidelidad: el error en expertos no vistos cae a 0,63 veces el de EXL3 y el exceso de NLL sobre el modelo nativo es de 0,0085 nats. El repositorio no incluye el decodificador de referencia y declara `inference: false`, por lo que hoy es un artefacto de investigación más que un modelo listo para servir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con expertos enrutados, familia deepseek_v41; detalles completos del bloque no disponibles |
| Parametros totales | 111.078.656.624 (~111 B) según safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en GRAFT-MX a 3,006 bits por peso; resto de tensores en EXL3 a 3 bpw; decodificación a bloques MXFP4 con escala por columna y corrección de cola dispersa |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (trellis en int16, suh y svh en float16, mul1 y graft_flags en int32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base DeepSeek-V4.1-Flash, un transformer de mezcla de expertos con expertos enrutados (el repositorio etiqueta cada matriz como `layers.L.ffn.experts.E.wN`, con N = 1, 2, 3). No se dispone de información sobre el número de expertos, el número de parámetros activos, la dimensionalidad de las capas de atención ni la longitud de contexto, ya que la model card solo describe el proceso de cuantización y no la topología del modelo original.

Cada matriz de experto enrutado se almacena en formato GRAFT-MX: un tensor `trellis` en int16 con forma `[k/16, n/16, 48]` que contiene un flujo de bits de 768 bits por baldosa de 16x16, una cabecera `suh` en float16 con forma `[k]`, una escala por columna de salida `svh` en float16 con forma `[n]`, el multiplicador de hash `mul1` en int32 (0x83DCD12D) y una máscara opcional `graft_flags` en int32 con forma `[k/32, n/32]`. La matriz decodificada es la traspuesta del tensor `weight` original. Los ficheros `model-00001` a `model-00050` contienen los expertos; `model-00051` y todos los tensores fuera de los expertos son idénticos a la versión EXL3 de 3 bpw.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan innovaciones de inferencia más allá de la existencia de un directorio `draft/` (configuraciones e índices de un modelo borrador para decodificación especulativa) y un directorio `engrams/` (configuraciones e índices de tablas engram), cuyos pesos no se incluyen en este repositorio y deben copiarse de la versión EXL3.

## Capacidades

- Generación de texto e imagen-texto: la etiqueta de pipeline es `image-text-to-text`, lo que indica entrada multimodal con imágenes y texto.
- Razonamiento, código y matemáticas: capacidades atribuibles al modelo base DeepSeek-V4.1-Flash, pero no desglosadas en la información disponible.
- Decodificación especulativa: el repositorio referencia un modelo borrador (`draft/`) heredado de la versión EXL3, lo que sugiere uso de una estrategia de decodificación acelerada.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: los idiomas soportados aparecen como no disponibles.
- Capacidades especiales (modo thinking, audio, etc.): no documentado.

Nota importante: la model card declara `inference: false` y afirma que el decodificador de referencia se publicará por separado, por lo que ninguna de estas capacidades es ejecutable directamente con los ficheros actuales.

## Casos de uso

- Despliegue de un MoE multimodal con menos memoria de la habitual: una vez publicado el decodificador, la cuantización a 3,006 bits de los expertos enrutados permitiría servir DeepSeek-V4.1-Flash en entornos con menos VRAM que el checkpoint nativo, manteniendo una fidelidad próxima al original.
- Investigación en cuantización sub-4 bits: el repositorio sirve como material de estudio para analizar cómo GRAFT conserva la rejilla MXFP4 en lugar de rotarla, comparando sus métricas de error con las de EXL3.
- Evaluación comparativa de métodos de cuantización: dado que el resto de tensores es idéntico a la versión EXL3, se puede aislar el efecto de GRAFT sobre los expertos y medir diferencias de NLL, KL y coincidencia top-1.
- Reproducción del paper GRAFT: el repositorio apunta al artículo "GRAFT: Grid-Aligned FP4 Trellis Quantization for FP4-Native Language Models", lo que permite replicar sus experimentos sobre un MoE real.
- Servicio de inferencia multimodal en producción: si el pipeline `image-text-to-text` se confirma operativo con el decodificador, podría emplearse para tareas que combinen imagen y texto (por ejemplo, descripción de contenido o respuesta a preguntas sobre documentos visuales).
- Integración con pilas de decodificación especulativa: el directorio `draft/` indica que el modelo está pensado para combinarse con un borrador, un caso útil para equipos que quieran medir latencias con decodificación especulativa sobre pesos cuantizados.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.). Los únicos datos publicados son métricas de fidelidad de la cuantización frente al modelo nativo:

| Metrica | GRAFT 3 bpw (este repo) | EXL3 3 bpw |
|---|---|---|
| Error en expertos no vistos (relativo a EXL3) | 0,63x | 1x |
| Exceso de NLL sobre el modelo nativo (nats) | 0,0085 | 0,0131 |
| KL respecto al modelo nativo | 0,0369 | 0,0469 |
| Coincidencia top-1 | 92,5 % | 91,7 % |

No se han publicado resultados de benchmarks de tarea en la información disponible.

## Requisitos de hardware

- VRAM estimada: no especificada en la información disponible. El repositorio ocupa 215,5 GB, por lo que el almacenamiento necesario es de ese orden y la inferencia requiere obligatoriamente un entorno multi-GPU.
- GPU recomendadas: no detalladas por el autor; por el tamaño del repositorio, un despliegue realista necesitaría varias A100 (80 GB) o H100 (80 GB), o clústeres equivalentes.
- GPU de consumo: no es viable en una única GPU de consumo (por ejemplo, RTX 4090 con 24 GB) dado el tamaño del checkpoint.
- Opciones de despliegue: no disponibles. La model card declara `inference: false` y anuncia que el decodificador de referencia se publicará por separado; no se mencionan vLLM, llama.cpp, Ollama ni TGI como soportados para este formato trellis.
- Latencia y throughput: no disponibles. El uso de un modelo borrador (`draft/`) sugiere una estrategia de decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Fidelidad de cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRAFT 3 bpw (este repo) | ~111 B | no disponible | 0,63x error relativo; 0,0085 nats; KL 0,0369; top-1 92,5 % | MIT | safetensors, flujo trellis, decodificador pendiente |
| coolbho3k/DeepSeek-V4.1-Flash-EXL3-3bpw | ~111 B | no disponible | 1x error relativo; 0,0131 nats; KL 0,0469; top-1 91,7 % | MIT | safetensors |
| deepseek-ai/DeepSeek-V4.1-Flash (nativo) | no disponible | no disponible | referencia (0 nats de exceso) | MIT (modelo base) | pesos originales |

No se dispone de datos de otros métodos de cuantización (AWQ, GPTQ, etc.) aplicados al mismo modelo base en la información proporcionada.

## Limitaciones y advertencias

- El repositorio declara `inference: false`: con los ficheros actuales no se puede ejecutar el modelo de forma directa.
- El decodificador de referencia para el formato trellis aún no está publicado y se anuncia como entrega separada.
- Las carpetas `draft/` y `engrams/` solo contienen configuraciones e índices; los pesos del borrador y las tablas engram deben copiarse manualmente desde el repositorio EXL3.
- El repositorio no documenta idiomas soportados, longitud de contexto, número de parámetros activos, número de expertos ni datos de entrenamiento del modelo base.
- Solo se aportan métricas de fidelidad de cuantización frente a EXL3, no benchmarks de calidad de tarea; no se puede inferir el rendimiento real en MMLU, HumanEval, GSM8K u otras pruebas.
- La cuantización introduce pérdida medible: un exceso de NLL de 0,0085 nats, una KL de 0,0369 y una coincidencia top-1 del 92,5 % respecto al modelo nativo.
- Riesgo de alucinación del modelo base: no documentado en la información disponible.
- Licencia MIT heredada del modelo base (Copyright (c) 2023 DeepSeek). Permite uso comercial según los términos MIT, pero conviene verificar las condiciones originales del modelo base antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/coolbho3k/DeepSeek-V4.1-Flash-GRAFT-3bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Versión EXL3 de 3 bpw del mismo autor: https://huggingface.co/coolbho3k/DeepSeek-V4.1-Flash-EXL3-3bpw
- Paper y código de GRAFT (Grid-Aligned FP4 Trellis Quantization for FP4-Native Language Models): https://github.com/coolbho3k/GRAFT
