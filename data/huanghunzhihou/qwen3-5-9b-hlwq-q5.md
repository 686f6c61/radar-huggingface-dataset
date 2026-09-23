# huanghunzhihou/Qwen3.5-9B-HLWQ-Q5

## Resumen

Qwen3.5-9B-HLWQ-Q5 es una cuantizacion a INT4 del modelo denso multimodal Qwen/Qwen3.5-9B, publicada por el usuario huanghunzhihou. El problema que resuelve es concreto: reducir el coste de memoria y el ancho de banda necesario para servir un modelo de ~8,95 mil millones de parametros sin degradar apenas la perplejidad, mediante una tecnica de preprocesado de pesos llamada HLWQ (Hadamard-Lloyd Weight Quantization) que combina una rotacion determinista de Walsh-Hadamard y un libro de codigos escalar de Lloyd-Max.

La relevancia de esta ficha es practica: el artefacto esta empaquetado en formato CompressedTensors, con kernel Marlin, y se carga directamente en vLLM sin plugins adicionales ni codigo personalizado. Eso lo convierte en una opcion de despliegue inmediato en GPUs de consumo (desde 8 GB de VRAM) y en GPUs de datacenter, con una velocidad declarada de hasta 168 tok/s en una A100 80 GB.

El modelo base soporta una longitud de contexto nativa de 262.144 tokens y esta entrenado para ingles, chino, coreano y japones. Esta version cuantizada conserva unicamente las capacidades de texto: el encoder de vision del modelo original no se ha cuantizado y debe desactivarse explicitamente con el flag `--language-model-only` al desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); el modelo base es multimodal imagen-texto, pero esta version solo conserva la torre de texto |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (segun la model card de Qwen3.5-9B) |
| Tipos de cuantizacion | INT4 (W4) en formato compressed-tensors con kernel Marlin; preprocesado Lloyd-Max Q5 (HLWQ). No se publican pesos GGUF |
| Idiomas soportados | en, zh, ko, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors + compressed-tensors (INT4) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-9B original: un transformer denso de ~8,95 B de parametros con 262.144 tokens de contexto nativo y entrenamiento multimodal. Sobre ese modelo, esta publicacion no reentrena nada: aplica un pipeline de cuantizacion de pesos en tres pasos descrito por el autor. Primero, una rotacion de Hadamard (Walsh-Hadamard determinista) que reparte uniformemente la energia de los pesos y elimina los valores atipicos que degradan la cuantizacion directa. Segundo, un libro de codigos escalar de Lloyd-Max etiquetado como Q5, que es optimo en error cuadratico medio para la distribucion aproximadamente gaussiana resultante. Tercero, una desquantizacion a INT4 de los pesos ya limpiados, que produce pesos INT4 de mejor calidad que una cuantizacion directa tipo GPTQ o AWQ.

El resultado se almacena en formato CompressedTensors con kernel Marlin, lo que permite cargarlo en vLLM de forma nativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF o DPO del modelo base; esa informacion corresponde a la model card de Qwen/Qwen3.5-9B y no se incluye en esta publicacion. Tampoco se detalla el conjunto de calibracion empleado en la cuantizacion.

Nota de nomenclatura del autor: la tecnica paso a llamarse formalmente HLWQ (Hadamard-Lloyd Weight Quantization) para evitar la colision de nombre con un metodo anterior de cuantizacion de cache KV tambien llamado HLWQ (Han et al., arXiv:2502.02617). Segun el autor, el algoritmo y los pesos del repositorio no cambian con el renombrado.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno, heredadas del modelo base Qwen3.5-9B.
- Razonamiento y matematicas: capacidades del modelo base, no verificadas con benchmarks en esta publicacion.
- Generacion de codigo: capacidades del modelo base, no verificadas con benchmarks en esta publicacion.
- Multilingue: el modelo base esta entrenado para ingles, chino, coreano y japones.
- Capacidades de agente, tool calling o function calling: no confirmadas en la informacion facilitada para esta cuantizacion.
- Vision: no disponible en este repositorio. El encoder de vision del modelo base no se ha cuantizado y el autor indica desplegar con `--language-model-only` para omitirlo.
- Modo thinking o razonamiento extendido: no confirmado en la informacion facilitada.

## Casos de uso

- Despliegue de un asistente conversacional en una unica GPU de consumo: con ~5 GB de pesos en INT4, el modelo cabe en una RTX 4060 de 8 GB con margen para cache KV en contextos moderados, a un ritmo declarado de unos 20 tok/s.
- Servicio de chat de alto rendimiento en datacenter: en una A100 80 GB el autor reporta 168 tok/s, suficiente para atender concurrencia elevada con vLLM y batching continuo.
- Procesamiento de documentos largos en ingles o chino: la ventana nativa de 262.144 tokens del modelo base permite resumir o extraer informacion de contratos, informes tecnicos o expedientes sin troceado agresivo, siempre que la VRAM disponible soporte la cache KV.
- Sustitucion de un despliegue BF16 por uno INT4 sin cambiar de stack: al usar CompressedTensors y kernel Marlin, se puede servir con el mismo comando de vLLM y reducir el coste de memoria a cambio de una perdida de perplejidad declarada de 0,19 puntos (6,37 a 6,56).
- Generacion aumentada por recuperacion (RAG) en corpus multilingues en/zh/ko/ja: el modelo puede consumir pasajes largos y responder en el idioma de la consulta, con un coste por token inferior al del modelo en BF16.
- Evaluacion y prototipado en estaciones de trabajo con GPU profesional: la tabla del autor incluye RTX PRO 6000 96 GB a 44 tok/s para la variante de 9B, lo que permite iterar sobre prompts y agentes sin recurrir a un cluster.
- Inferencia en produccion con presupuesto de VRAM ajustado a 12-16 GB: una RTX 3060/4070 de 12 GB o una RTX 4080 de 16 GB dan alrededor de 30 y 35 tok/s respectivamente, segun los datos publicados.

## Benchmarks y rendimiento

La unica metrica de calidad publicada es la perplejidad (PPL), comparada contra la cuantizacion directa y el modelo en BF16:

| Metodo | PPL (menor es mejor) |
|---|---|
| BF16 baseline | 6,37 |
| HLWQ → INT4 | 6,56 |
| INT4 directa | 6,68 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

Rendimiento de inferencia declarado por el autor:

| GPU | VRAM | Compatible | tok/s esperados |
|---|---|---|---|
| RTX 4060 | 8 GB | Si | ~20 |
| RTX 3060 / 4070 | 12 GB | Si | ~30 |
| RTX 4080 | 16 GB | Si | ~35 |
| RTX 4090 | 24 GB | Si | ~40 |
| A100 | 80 GB | Si | ~168 |
| RTX PRO 6000 | 96 GB | Si | 44 (9B) / 18 (27B) |

## Requisitos de hardware

- Pesos: aproximadamente 5 GB en INT4 para 8,95 B de parametros; el repositorio ocupa 7,7 GB en disco, por encima de lo estrictamente necesario para los pesos cuantizados.
- Cabe en GPU de consumo: si, desde una RTX 4060 de 8 GB. Con 12 GB (RTX 3060/4070), 16 GB (RTX 4080) o 24 GB (RTX 4090) el margen para cache KV y batching aumenta de forma proporcional.
- GPU de datacenter recomendadas: A100 80 GB (168 tok/s declarados) y RTX PRO 6000 96 GB (44 tok/s declarados). H100 no aparece en las pruebas publicadas, aunque el autor indica que `--enforce-eager` es opcional en A100/H100 y obligatorio en Blackwell (compute capability 12.0).
- Cache KV: el tamano exacto no esta disponible; con 262.144 tokens de contexto nativo, la cache KV crece de forma lineal con la longitud de secuencia y sera el factor limitante en GPUs de 8-16 GB.
- Despliegue con vLLM: `vllm serve <repo> --language-model-only --enforce-eager`. El flag `--language-model-only` es obligatorio porque solo se ha cuantizado la parte de texto.
- Despliegue con Transformers: requiere `pip install polarquant` e importar `polarengine_vllm`, que se autoregistra, ademas de `trust_remote_code=True`.
- Otras opciones: llama.cpp, Ollama o TGI no estan soportadas por esta publicacion, ya que no se distribuyen pesos GGUF. SGLang tampoco se menciona.
- Latencia y throughput: los valores de la tabla anterior son los unicos datos publicados; no se especifican tamanos de lote ni longitudes de secuencia asociados a esas cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-HLWQ-Q5 (INT4) | 8,95 B | 262.144 tokens | 6,56 | apache-2.0 | safetensors + compressed-tensors, vLLM nativo |
| Qwen3.5-9B en BF16 (modelo base) | 8,95 B | 262.144 tokens | 6,37 | apache-2.0 | safetensors, Transformers/vLLM/SGLang |
| Cuantizacion INT4 directa del mismo modelo | 8,95 B | 262.144 tokens | 6,68 | apache-2.0 | segun el metodo (GPTQ/AWQ), no especificado |

No se dispone de datos de rendimiento en tareas (MMLU, HumanEval, GSM8K) ni de comparativas con otras familias de modelos del mismo tamano dentro de la informacion facilitada.

## Limitaciones y advertencias

- La vision no funciona en esta version: el encoder multimodal no esta cuantizado y el autor obliga a desplegar con `--language-model-only`.
- Perdida de calidad medible: la PPL sube de 6,37 (BF16) a 6,56, una degradacion de 0,19 puntos. Es pequena, pero no nula.
- No hay evaluacion en tareas: sin resultados de MMLU, HumanEval, GSM8K ni similares, no se puede afirmar como se traduce esa PPL en rendimiento real de razonamiento o codigo.
- Idiomas limitados a en, zh, ko, ja. No se declara soporte de castellano, por lo que el rendimiento en espanol es incierto.
- Riesgo de alucinacion: no se documenta ningun ajuste especifico de seguridad, alineacion o mitigacion de alucinaciones en esta publicacion; aplican los sesgos del modelo base, no detallados aqui.
- Consumo de memoria de la cache KV: con 262.144 tokens de contexto y en GPUs de 8-16 GB, el contexto practico sera mucho menor que el maximo teorico.
- Inconsistencia en las instrucciones oficiales: los comandos de la model card apuntan al repositorio `caiovicentino1/Qwen3.5-9B-HLWQ-Q5` y al paquete `polarquant`/`polarengine_vllm`, mientras que el artefacto analizado vive en `huanghunzhihou/Qwen3.5-9B-HLWQ-Q5`. Conviene verificar que el identificador usado en produccion corresponde al repositorio correcto.
- Dependencia de `trust_remote_code=True` en la ruta de Transformers: implica ejecutar codigo del repositorio, un riesgo de seguridad a evaluar en entornos cerrados.
- Licencia apache-2.0: permite uso comercial, pero no se ofrece ninguna garantia ni declaracion de conformidad regulatoria por parte del autor de la cuantizacion.
- Adopcion nula: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados declarados.
- Fechas de publicacion y de la nota de nomenclatura posteriores a la fecha de creacion del repositorio, un detalle a tener en cuenta al rastrear el historial de versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huanghunzhihou/Qwen3.5-9B-HLWQ-Q5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de la tecnica HLWQ: https://arxiv.org/abs/2603.29078
- Metodo HLWQ previo de cuantizacion de cache KV: https://arxiv.org/abs/2502.02617
- Repositorio GitHub: https://github.com/caiovicentino/polarengine-vllm
- Paquete PyPI: `pip install polarquant`
- Qwen3.5-9B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-9B
- Qwen3.5-9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Qwen3.5-9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Repositorio de la serie Qwen3.5: https://github.com/Herry-Joe/Qwen3.5
