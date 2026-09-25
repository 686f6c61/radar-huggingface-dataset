# darrellbest/Qwen3-0.6B-Heretic

## Resumen

Qwen3-0.6B-Heretic es un derivado del modelo Qwen/Qwen3-0.6B publicado por el usuario darrellbest, en el que se ha eliminado el comportamiento de rechazo mediante la herramienta Heretic y la técnica Arbitrary-Rank Ablation (ARA) aplicada sobre el peso completo, sin reentrenamiento. El resultado conserva la misma arquitectura, el mismo número de parámetros (596.049.920, unos 0,6 mil millones) y los mismos 310 tensores que el original, pero reduce los rechazos de 54/100 a 3/100 en el conjunto de evaluación de Heretic, con una divergencia KL de 0,0027.

El modelo está pensado como base para fine-tuning posterior y como objeto de estudio de técnicas de edición de pesos. Frente a la referencia del propio autor de Heretic (p-e-w/Qwen3-0.6B-heretic), que emplea ablation direccional y obtiene 6/100 rechazos con KL 0,0031, esta versión aproximadamente reduce a la mitad los rechazos con un desplazamiento de comportamiento ligeramente menor. La comparación es directa porque reutiliza exactamente los mismos datasets, splits, system prompt y marcadores de rechazo.

Es relevante ahora porque la familia Qwen3 abarca desde 0,6 hasta 235 mil millones de parámetros en variantes densas y MoE, y porque las técnicas de ablation de pesos (Heretic, ARA) se han consolidado como alternativa barata al reentrenamiento para modificar comportamientos concretos de un modelo. Al publicarse bajo licencia Apache 2.0 y con variantes cuantizadas, es desplegable en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); pesos editados mediante ARA sobre `attn.o_proj` y `mlp.down_proj` |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base Qwen/Qwen3-0.6B |
| Tipos de cuantizacion | bf16 en el repo principal; en la familia: GGUF BF16, Q8_0 y Q4_K_M; FP8 W8A8 (compressed-tensors); NVFP4 (compressed-tensors) |
| Idiomas soportados | No disponible en los metadatos del repositorio; el modelo base Qwen3-0.6B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); en la familia tambien GGUF y compressed-tensors |
| Modelo base | Qwen/Qwen3-0.6B |
| Embeddings de salida | `lm_head.weight` no se almacena por separado: esta atado a los embeddings de entrada (`tie_word_embeddings: true`) |
| Tamano del repositorio | 1,2 GB |
| Fecha de publicacion | 25 de septiembre de 2026 (ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-0.6B original: un transformer denso de 596 millones de parametros. Segun el informe tecnico de Qwen3, la familia incluye variantes densas y de mezcla de expertos (MoE) entre 0,6 y 235 mil millones de parametros; en esta ficha no se dispone de mas detalle estructural (numero de capas, dimension oculta, cabezas de atencion) en la informacion proporcionada. No hay entrenamiento adicional: el modelo no ve datos nuevos ni se reentrena ningun modulo.

Lo que se hizo fue reescribir directamente las matrices de salida de atencion (`attn.o_proj`) y de proyeccion descendente del MLP (`mlp.down_proj`) optimizandolas con LBFGS, de forma que las salidas para prompts nocivos se alejen de su direccion original mientras las salidas para prompts inofensivos permanezcan estables. La calibracion uso 400 prompts inofensivos y 400 nocivos (`train[:400]`). Los hiperparametros publicados son: `start_layer_index` 3, `end_layer_index` 19, `preserve_good_behavior_weight` 0,4385, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,5877 y `neighbor_count` 12.

La innovacion tecnica destacable es el uso de ARA en lugar de la ablation direccional de la referencia: en vez de proyectar fuera una unica direccion de rechazo, se optimizan rangos arbitrarios sobre las matrices completas, lo que permite un ajuste mas fino a cambio de un coste en deriva de comportamiento. Todo el coste del editado se mide como la divergencia KL de 0,0027 sobre `mlabonne/harmless_alpaca`. El proceso se ejecuto con un merge del `master` de Heretic (commit `3521f86`) y su rama `ara` (commit `c91d690`), con transformers 5.17.0, torch 2.11.0+cu130 y una RTX PRO 6000.

## Capacidades

- Generacion de texto conversacional en modo no-thinking: respuestas verificadas como correctas y fluidas ante hechos, un haiku y una explicacion tecnica de dos frases.
- Modo thinking activado por defecto, desactivable por peticion con `enable_thinking=False`; cierra correctamente el bloque `<think>`.
- Razonamiento aritmetico verificado en la model card con el muestreo recomendado de Qwen: 17 x 23 = 391 y 60 km en 45 minutos = 80 km/h, igualando al modelo original.
- Reduccion drastica del comportamiento de rechazo: 3/100 en `mlabonne/harmful_behaviors` (test[:100]) frente a 54/100 del original.
- Preservacion del comportamiento general con deriva baja: KL 0,0027 sobre `mlabonne/harmless_alpaca` (test[:100]).
- Soporte de tool calling / function calling: no documentado en la model card y no verificado en esta ficha.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni verificadas en la informacion disponible.
- Capacidades multilingues: no verificadas en esta ficha; se heredan, en su caso, del modelo base.
- Capacidades especiales: solo el modo thinking. No hay vision ni audio.

## Casos de uso

- Fine-tuning como base: es el uso previsto por el autor. Al no rechazar sistematicamente, permite entrenar con datasets propios sin que el modelo bloquee ejemplos de dominio (seguridad, ficcion adulta, analisis de contenido sensible) que en el modelo original se descartarian.
- Estudio y comparacion de tecnicas de ablation: sirve como punto de referencia reproducible frente a la ablation direccional de p-e-w, ya que ambos comparten datasets, splits, system prompt y marcadores de rechazo, y por tanto sus metricas son directamente comparables.
- Red teaming y evaluacion de seguridad: util para medir como se comporta un modelo con los guardrails reducidos, generar ataques de prompt y comprobar la eficacia de filtros externos o clasificadores de salida.
- Generacion de datos sinteticos: su tamano (596 M parametros) y su baja tasa de rechazo lo hacen adecuado para producir grandes volumenes de conversaciones de bajo coste computacional, a validar posteriormente con un modelo mayor.
- Inferencia local en CPU o hardware de gama baja: con la cuantizacion GGUF Q4_K_M de 0,40 GB, se puede ejecutar en llama.cpp u Ollama en portatiles sin GPU dedicada, para prototipos, demos offline o entornos con recursos limitados.
- Clasificacion, etiquetado y extraccion de informacion: al ser un modelo de 0,6 B con licencia Apache 2.0, encaja en pipelines donde se procesan muchos documentos y el coste por token importa mas que la calidad maxima.
- Prototipado de asistentes conversacionales multi-turno: permite iterar sobre prompts, formato de system prompt y plantillas de chat en local antes de escalar a un modelo mayor de la misma familia.
- Experimentos de alineacion y control de comportamiento: util para investigar como un cambio de pesos de bajo rango afecta a comportamientos concretos y que efectos colaterales tiene sobre tareas benignas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Unicamente se han publicado las metricas de la evaluacion de Heretic:

| Metrica | Qwen3-0.6B original | p-e-w/Qwen3-0.6B-heretic | Este modelo |
|---|---:|---:|---:|
| Rechazos (de 100 prompts) | 54/100 | 6/100 | 3/100 |
| Divergencia KL | 0 (por definicion) | 0,0031 | 0,0027 |
| Metodo de ablation | ninguno | ablation direccional | ARA a peso completo |

Los datos proceden de `mlabonne/harmful_behaviors` (rechazos) y `mlabonne/harmless_alpaca` (divergencia KL), splits `test[:100]`, con el system prompt y los marcadores de rechazo por defecto de Heretic. Las cifras son una reevaluacion independiente de los pesos exportados (`evaluate_model`), no del proceso de busqueda, y coincidieron exactamente con este ultimo. La model card advierte de que una lista de marcadores de rechazo estricta (solo frases como "I cannot" / "I can't help"), calibrada para modelos grandes, infravalora mucho el rechazo en un modelo de 0,6 B, cuyos rechazos se expresan sobre todo como "sorry" o "that's illegal/harmful"; con esa lista el modelo original aparentaria rechazar solo 2/100.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos ocupan 1,19 GB; con activaciones y cache KV, la estimacion practica se situa en el entorno de 2 a 3 GB para contextos moderados (estimacion derivada del tamano de los pesos, no medida publicada).
- VRAM estimada en cuantizacion: 0,40 GB con GGUF Q4_K_M, 0,64 GB con Q8_0, 0,76 GB con FP8 W8A8 y 0,57 GB con NVFP4. En todos los casos cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; en el extremo profesional, A100 o H100 estan sobredimensionadas para este modelo, salvo por despliegue agregado de muchas instancias. La RTX PRO 6000 se uso para el proceso de ablation, no consta como requisito de inferencia.
- Cabe en GPU consumer: si, en practicamente todas las de los ultimos diez anos; tambien cabe en CPU con llama.cpp u Ollama usando los GGUF.
- Opciones de despliegue: transformers, vLLM, SGLang (los tres indicados por el autor); llama.cpp y Ollama con las variantes GGUF; FP8 y NVFP4 estan pensadas para vLLM (NVFP4 requiere GPU Blackwell). El repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Rechazos | KL | Licencia |
|---|---:|---|---:|---:|---|
| Qwen/Qwen3-0.6B | 0,6 B | modelo original, sin editar | 54/100 | 0 | Apache 2.0 |
| p-e-w/Qwen3-0.6B-heretic | 0,6 B | Heretic con ablation direccional | 6/100 | 0,0031 | Apache 2.0 |
| darrellbest/Qwen3-0.6B-Heretic | 0,6 B | Heretic con ARA a peso completo | 3/100 | 0,0027 | Apache 2.0 |

Los tres se evaluaron con el mismo protocolo, por lo que la comparacion es directa. En la busqueda web aparecen otros derivados con metricas de rechazo distintas (por ejemplo 5/100 frente a 57/100 del original, o 8/100 frente a 53/100), pero no consta que usen los mismos datasets, splits ni marcadores, por lo que no son directamente comparables con la tabla anterior. Longitud de contexto, licencia y disponibilidad de los modelos alternativos: no disponibles en la informacion proporcionada salvo la licencia Apache 2.0 del modelo base.

## Limitaciones y advertencias

- Guardrails reducidos por diseno: el modelo ha sido editado explicitamente para disminuir los rechazos. La responsabilidad del uso recae en quien lo despliega, y es necesario evaluar controles externos antes de exponerlo a usuarios finales.
- Riesgo de alucinacion: se trata de un modelo de 0,6 mil millones de parametros; su fiabilidad factual es inherentemente baja y no mejora con la edicion de pesos. No es adecuado para tareas donde la exactitud sea critica sin verificacion posterior.
- Deriva de comportamiento: la edicion introduce una divergencia KL de 0,0027 respecto al original sobre prompts inofensivos. Aunque es baja y la model card declara verificaciones cualitativas correctas, cualquier caso de uso sensible deberia validarse con evaluaciones propias.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible; los sesgos del corpus de entrenamiento del Qwen3-0.6B original se heredan integros.
- Idiomas: los metadatos no declaran idiomas soportados y no se ha verificado el rendimiento multilingue de esta variante. No debe asumirse paridad con el modelo base en idiomas distintos del ingles o el chino sin pruebas.
- Alcance de la evaluacion de rechazos: la metrica de 3/100 procede de 100 prompts de un unico dataset y depende de una lista de marcadores. No es una garantia de comportamiento uniforme ante cualquier entrada.
- Limitaciones de contexto: no disponible en la informacion proporcionada. Conviene consultar la model card del modelo base para el limite real.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia no exime de las obligaciones legales aplicables al contenido generado ni de las politicas de las plataformas de despliegue.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin proceso de revision por pares; la reproducibilidad se apoya en las versiones de herramientas declaradas (Heretic `3521f86` + ARA `c91d690`, transformers 5.17.0, torch 2.11.0+cu130).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darrellbest/Qwen3-0.6B-Heretic
- Variante GGUF: https://huggingface.co/darrellbest/Qwen3-0.6B-Heretic-GGUF
- Variante FP8: https://huggingface.co/darrellbest/Qwen3-0.6B-Heretic-FP8
- Variante NVFP4: https://huggingface.co/darrellbest/Qwen3-0.6B-Heretic-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Referencia de Heretic sobre el mismo modelo: https://huggingface.co/p-e-w/Qwen3-0.6B-heretic
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Derivado alojado en Featherless (davidterrell1919): https://featherless.ai/models/davidterrell1919/Qwen3-0.6B-heretic
- Derivado alojado en Featherless (blackbook-lm): https://featherless.ai/models/blackbook-lm/Qwen3-0.6B-heretic
- Otro derivado abliterated del mismo base: https://huggingface.co/rayss868123/Qwen3-0.6B-heretic-abliterated-uncensored
