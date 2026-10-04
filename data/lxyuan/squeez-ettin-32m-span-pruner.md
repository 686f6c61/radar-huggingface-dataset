# lxyuan/Squeez-Ettin-32M-Span-Pruner

## Resumen

Squeez-Ettin-32M-Span-Pruner es un modelo de clasificación de tokens (token classification) desarrollado por el usuario lxyuan, especializado en localizar fragmentos de texto relevantes dentro de la salida de herramientas de agentes de programación. Dado un par formado por una consulta en lenguaje natural y una observación de herramienta (por ejemplo, un `ls -la` con 23 entradas), el modelo devuelve los spans de caracteres literales que responden a esa consulta, con offsets `start` y `end` sobre el texto original. Está afinado a partir del encoder `jhu-clsp/ettin-encoder-32m`, una arquitectura ModernBERT, y cuenta con 32.031.746 parámetros reales (pesos en safetensors, repositorio de 0,1 GB).

Su relevancia actual viene de un problema muy concreto en el desarrollo de agentes: las observaciones de herramientas (listados de ficheros, trazas de tests, salidas de compilación) consumen una fracción enorme de la ventana de contexto. Este modelo actúa como "podador de contexto" (context pruning) y reduce esas salidas a los fragmentos útiles antes de que un LLM mayor las procese. Según el autor, es aproximadamente una quinta parte del tamaño de un baseline reproducido de 150M parámetros y alcanza 0,517 de Word-F1 frente a 0,588 del baseline, es decir, cerca del 88 % del F1 con una fracción del coste. El propio autor indica explícitamente que no supera al baseline.

El modelo se distribuye bajo licencia MIT, soporta únicamente inglés y está pensado para integrarse mediante un pipeline personalizado (`span-pruning`) que requiere `trust_remote_code=True`. No es un modelo generativo: su salida son intervalos de caracteres, no texto nuevo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer (ModernBERT), afinado para clasificación de tokens y extracción de spans |
| Parametros totales | 32.031.746 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | procesamiento por ventanas solapadas de 4.096 tokens; longitud de contexto nativa del encoder base: no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son safetensors en float32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | jhu-clsp/ettin-encoder-32m |
| Pipeline | token-classification (pipeline personalizado `span-pruning`) |
| Datasets de entrenamiento | KRLabsOrg/tool-output-extraction-swebench-gliner, KRLabsOrg/tool-output-extraction-swebench |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-04 / 2026-10-04 |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/ettin-encoder-32m`, un encoder de la familia ModernBERT de 32M de parámetros, y se somete a un ajuste fino supervisado para una tarea de etiquetado secuencial por token. La entrada se construye como un par de tokenizer (`query`, `tool_output`); únicamente los tokens correspondientes a la salida de la herramienta contribuyen a la entropía cruzada ponderada, mientras que la consulta, el padding y los tokens especiales reciben la etiqueta `-100` y no afectan a la pérdida. Para observaciones largas, el pipeline aplica ventanas solapadas de 4.096 tokens y hace max-pooling de las puntuaciones de los solapamientos antes de reconstruir los spans de caracteres.

El entrenamiento utilizó todas las filas del split de entrenamiento de GLiNER, con ajuste fino completo durante cuatro épocas en float32. El mejor checkpoint se seleccionó por token-F1 de validación, y el umbral final de decisión (0,50) se escogió por Word-F1 sobre validación; el pipeline permite además pasar un `threshold` explícito (por ejemplo, 0,6). No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación adicional, algo coherente con una tarea extractiva y no generativa. El código de entrenamiento es público (`finetune_squeez_ettin_span_pruner.py`) y el pipeline depende de un `span_pruner.py` versionado en el propio repositorio, que se ejecuta en local al activar `trust_remote_code=True`.

## Capacidades

- Extracción de spans verbatim: devuelve intervalos de caracteres (`start`, `end`) y el texto exacto correspondiente, sin reescribir ni resumir el contenido.
- Podado de contexto (context pruning): reduce observaciones largas de herramientas a los fragmentos relevantes para una consulta dada.
- Análisis de salidas de herramientas de agentes de programación: listados de directorios, salidas de `ls`, trazas de tests, logs de compilación.
- Recuperación de información (information retrieval) sobre texto no estructurado de una sola observación.
- Clasificación de tokens a nivel de carácter tras el post-procesado de puntuaciones por ventana.
- Soporte de umbral configurable (`threshold`), con valor por defecto 0,50.
- Procesamiento de entradas largas mediante ventanas solapadas de 4.096 tokens con max-pooling de solapamientos.
- Multilingüe: no; el modelo está entrenado y evaluado solo con consultas y salidas en inglés.
- Tool calling / function calling: no aplica; el modelo no genera llamadas a herramientas, solo localiza texto relevante dentro de la salida de una herramienta.
- Razonamiento multi-paso o modo "thinking": no disponible; no es un modelo generativo ni de razonamiento.

## Casos de uso

- Podado de contexto en agentes de programación: antes de reinyectar la salida de una herramienta en el prompt del LLM principal, se pasa el par `{query, tool_output}` al modelo y se conservan solo los spans devueltos. Es el caso de uso central y el documentado en la model card.
- Localización de ficheros en listados de directorios: en el ejemplo oficial, con 23 entradas de un `ls -la`, el modelo aísla la línea correspondiente a `cli.py` (offsets 302-356) y descarta el resto.
- Reducción de coste de tokens en pipelines RAG/IR: al recortar observaciones antes de enviarlas a un modelo mayor, disminuye el número de tokens de entrada facturados por API y se libera ventana de contexto para el razonamiento del agente.
- Filtrado de salidas de `grep`/`ripgrep` en exploración de repositorios: extraer únicamente las coincidencias relevantes para la consulta activa del agente en lugar de volcar cientos de líneas.
- Análisis de trazas de tests y logs de CI/CD: aislar el fragmento de la traza que explica un fallo concreto (por ejemplo, la excepción relevante) en lugar de adjuntar el log completo.
- Etiquetado y destilación de datos: usar el modelo como anotador barato para generar pares (observación, span relevante) y entrenar o evaluar modelos mayores de podado de contexto.
- Preprocesado en pipelines de compilación: extraer de la salida de un compilador las líneas de error asociadas a un fichero o símbolo consultado.
- Compresión de contexto en sistemas con ventana reducida: en despliegues con modelos de contexto limitado, el podador permite mantener sesiones de agente más largas reduciendo el tamaño de cada observación.

## Benchmarks y rendimiento

La comparación principal usa el mismo conjunto de test GLiNER de 9.595 ejemplos y el mismo scorer Word-F1 para ambos modelos:

| Modelo | Parametros | Word-F1 |
|---|---:|---:|
| Este modelo (Squeez-Ettin-32M-Span-Pruner) | 32M | 0,517 |
| Baseline reproducido | 150M | 0,588 |

La diferencia es de 0,071 de F1 por debajo del baseline, con un intervalo bootstrap pareado del 95 % de -0,102 a -0,042. El autor señala que el modelo de 32M alcanza aproximadamente el 88 % del F1 del baseline y que no lo supera.

Comprobaciones adicionales a nivel de línea, con un protocolo de evaluación distinto y no comparable directamente con el Word-F1 anterior:

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Test canónico de 618 ejemplos | line-F1 | 0,531 |
| Test canónico de 618 ejemplos | line-count compression | 0,936 |
| Subconjunto SWE con repositorios retenidos (430 ejemplos de xarray y Flask) | line-F1 | 0,463 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo extractivo de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 128 MB (32,03M de parámetros × 4 bytes); en float16/bf16 bajarían a unos 64 MB. Con activaciones y overhead del pipeline, el consumo debería mantenerse por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una RTX 3060, RTX 4060 o incluso una GTX 1650 serían más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años. También es viable la inferencia en CPU para cargas moderadas.
- Opciones de despliegue: `transformers.pipeline("span-pruning", trust_remote_code=True)` con el `span_pruner.py` versionado en el repositorio. Al ser un modelo de clasificación de tokens y no un modelo generativo, no aplican vLLM, llama.cpp, Ollama ni TGI en su modo habitual. No se documentan exportaciones a ONNX ni formatos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Word-F1 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Squeez-Ettin-32M-Span-Pruner | 32M | Extracción de spans en salidas de herramientas | 0,517 | MIT | HuggingFace (lxyuan) |
| Baseline reproducido de 150M | 150M | Extracción de spans en salidas de herramientas | 0,588 | no disponible | no disponible (referencia interna del autor) |
| jhu-clsp/ettin-encoder-32m | 32M | Encoder de propósito general (modelo base) | no aplica | no disponible en esta ficha | HuggingFace |

No se dispone de información sobre otros modelos comparables de podado de contexto o extracción de spans sobre salidas de herramientas en la documentación proporcionada. El baseline de 150M se menciona como "reproducido" por el autor, pero no se especifica su identificador ni su licencia.

## Limitaciones y advertencias

- Idioma: los datos de entrenamiento contienen consultas y salidas de herramientas de agentes de programación únicamente en inglés; el rendimiento en otros idiomas no está validado.
- Fragmentos muy cortos o sin numeración pueden dar resultados pobres, según advierte el propio autor.
- El modelo puede eliminar contexto útil o conservar texto irrelevante; los errores de podado son bidireccionales (falsos negativos y falsos positivos de relevancia).
- Recomendación explícita del autor: conservar la observación original hasta que la tarea posterior tenga éxito, ya que el podado es destructivo si se descarta el texto fuente.
- El test SWE retenido cubre únicamente xarray y Flask (430 ejemplos), por lo que no demuestra soporte amplio para otros repositorios ni otros lenguajes de programación.
- La evaluación se realizó con protocolos mixtos (Word-F1 sobre 9.595 ejemplos y line-F1 sobre otros conjuntos); las cifras de line-F1 no son directamente comparables con el Word-F1 del baseline.
- `trust_remote_code=True` ejecuta código del repositorio (`span_pruner.py`) en la máquina local; el autor recomienda revisar el fichero fijado por revisión antes de su uso en producción.
- Licencia MIT: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de copyright y la licencia. No se documentan restricciones adicionales, pero conviene verificar la licencia del modelo base `jhu-clsp/ettin-encoder-32m`, no incluida en esta información.
- Riesgo de alucinación: al ser un modelo extractivo, no genera texto nuevo, pero puede devolver spans incorrectos o incompletos que induzcan a error al agente que los consuma.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lxyuan/Squeez-Ettin-32M-Span-Pruner
- Revisión fijada del modelo: https://huggingface.co/lxyuan/Squeez-Ettin-32M-Span-Pruner/tree/972acbb8d79c477888148aacf78a697abc3f30c5
- Código del pipeline (`span_pruner.py`): https://huggingface.co/lxyuan/Squeez-Ettin-32M-Span-Pruner/blob/972acbb8d79c477888148aacf78a697abc3f30c5/span_pruner.py
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Script de entrenamiento: https://github.com/LxYuan0420/nlp/blob/main/scripts/finetune_squeez_ettin_span_pruner.py
- Dataset de entrenamiento: https://huggingface.co/datasets/KRLabsOrg/tool-output-extraction-swebench-gliner
- Dataset de entrenamiento: https://huggingface.co/datasets/KRLabsOrg/tool-output-extraction-swebench
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenido de foros sin relación con el modelo, por lo que se descartan.
