# mrysh/qwen3.5-4b-prune_unstructured_50

## Resumen

`mrysh/qwen3.5-4b-prune_unstructured_50` es una version podada del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh como parte de un banco de pruebas de poda (pruning) que compara cuatro modelos base con ocho variantes de poda frente a alternativas cuantizadas. El modelo conserva la arquitectura original `qwen3_5_text` y el mismo numero de parametros almacenados (4.205.751.296), pero aproximadamente el 50,1% de los pesos de las capas lineales del decodificador son cero tras aplicar poda por magnitud capa a capa, sin datos de calibracion.

La relevancia de esta publicacion no reside en la calidad del modelo resultante, sino en su valor metodologico: sirve como referencia empirica del deterioro de calidad que introduce una poda no estructurada al 50% cuando no se aplica destilacion ni ajuste fino posterior. El autor advierte explicitamente de que debe esperarse una caida de rendimiento frente al modelo base y que el benchmark (BFCL, hiring-bias y MedQA con vLLM) esta disenado precisamente para medir esa caida.

El fichero se distribuye en formato denso: los ceros se almacenan como ceros, por lo que el tamano en disco (8,432 GB) y la velocidad de inferencia son identicos a los del modelo base. La licencia es Apache 2.0, heredada de Qwen/Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5_text` (variante de texto de Qwen3.5) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica que el benchmark compara variantes podadas con cuantizacion, pero no detalla los tipos empleados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y aplica una poda no estructurada con nivel 0.5 sobre las capas lineales del decodificador. El metodo es poda por magnitud capa a capa sin datos de calibracion: se anulan los pesos de menor valor absoluto hasta alcanzar el 50,1% de ceros en esas capas. No se realizo destilacion ni ajuste fino posterior a la poda, de modo que la matriz de pesos queda con la misma forma y tamano que la original, pero con la mitad de sus entradas a cero.

El entorno de ejecucion declarado por el autor es torch 2.14.0a0+b2c75dd062.nv26.9.68203377, lo que sugiere un build nocturno de PyTorch orientado a NVIDIA. El modelo se evalua como modelo de texto con vLLM y el modo thinking desactivado. No se especifican en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento en modo texto, evaluado con el modo thinking desactivado en vLLM.
- Capacidad de seguir instrucciones y responder a prompts conversacionales, heredada del modelo base, aunque degradada por la poda.
- Soporte de tool calling y function calling: el autor evalua el modelo en BFCL (Berkeley Function Calling Leaderboard), lo que implica que el modelo base y esta variante estan orientados a ese caso de uso.
- Razonamiento de multiples pasos y uso como agente: no confirmado explicitamente para esta variante; el modelo base Qwen3.5 esta disenado para ello, pero la poda puede afectar a la fiabilidad en cadenas largas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; la arquitectura declarada es `qwen3_5_text`, es decir, la variante de texto.
- Modo thinking: el modelo base lo soporta, pero en el benchmark se evalua con thinking off.

## Casos de uso

- Investigacion sobre poda de modelos: sirve como punto de comparacion controlado para medir la perdida de calidad de una poda por magnitud al 50% sin reentrenamiento, frente a otras variantes del mismo benchmark.
- Evaluacion de robustez en function calling: al estar evaluado en BFCL, es util para estudiar como afecta la esparsidad no estructurada a la generacion de llamadas a herramientas y a la seleccion correcta de funciones.
- Analisis de sesgos en contratacion: el benchmark incluye la tarea hiring-bias, por lo que el modelo puede emplearse para estudiar si la poda amplifica o atenua sesgos demograficos en decisiones de seleccion de personal simulado.
- Experimentos en dominio medico: la evaluacion en MedQA permite usar esta variante para medir el impacto de la poda en preguntas de opcion multiple de conocimiento biomedico, siempre con supervision experta y sin uso clinico real.
- Referencia negativa en pipelines de compresion: util para equipos que evaluan tecnicas de compresion y necesitan un caso documentado de poda densa que no reduce el tamano en disco ni acelera la inferencia.
- Docencia y divulgacion tecnica: ejemplo reproducible de que la poda no estructurada sin destilacion no aporta eficiencia de almacenamiento ni de computo, solo perdida de calidad, adecuado para explicar la diferencia entre esparsidad teorica y esparsidad efectiva.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El autor indica que el modelo se evalua en BFCL, hiring-bias y MedQA con vLLM, y que el benchmark compara las variantes podadas entre si y con cuantizacion, pero no se incluyen puntuaciones concretas en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: alrededor de 8,4 GB solo para pesos, mas memoria para el cache KV y activaciones; en la practica se recomienda un minimo de 12-16 GB para contextos moderados.
- Al ser un fichero denso con los ceros almacenados, no hay ahorro de memoria respecto al modelo base de 4B; la poda no reduce el footprint.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 con margen. En GPUs de 8-12 GB seria necesario cuantizar.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 y, con cuantizacion, en RTX 4070 Ti o inferiores.
- Opciones de despliegue: vLLM es el motor empleado por el autor en el benchmark; tambien deberia funcionar con TGI y, tras conversion, con llama.cpp u Ollama, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles. Al mantener la misma estructura densa que el modelo base, el rendimiento esperado es equivalente al de Qwen/Qwen3.5-4B en el mismo hardware, sin ganancia por la esparsidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_unstructured_50 | 4,21 B | no disponible | 50,1% ceros en capas lineales, denso | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (base) | 4,21 B | no disponible | Densos, sin podar | Apache 2.0 | HuggingFace |
| Otras variantes del benchmark de poda de mrysh | no disponible | no disponible | Podadas con distintos metodos y niveles | Apache 2.0 (previsible) | HuggingFace |
| Alternativas cuantizadas del mismo benchmark | no disponible | no disponible | Cuantizadas | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base sin podar, que conserva la calidad original con el mismo coste de memoria y computo. Frente a una cuantizacion del modelo base, la poda no estructurada al 50% no ofrece ventajas de tamano ni de velocidad, por lo que la comparacion se reduce a calidad frente a compresion efectiva.

## Limitaciones y advertencias

- Caida de calidad esperada: el autor advierte explicitamente de que no hubo destilacion ni ajuste fino tras la poda, por lo que el rendimiento en tareas de razonamiento, codigo y function calling sera inferior al del modelo base.
- Sin ganancia de eficiencia: los ceros se almacenan como ceros, de modo que el modelo ocupa lo mismo en disco y en memoria y no acelera la inferencia; la esparsidad es teorica, no efectiva.
- Riesgo de alucinacion incrementado: la poda por magnitud sin calibracion puede degradar capas criticas de forma no uniforme, aumentando la probabilidad de respuestas incoherentes o inventadas.
- Sesgos: el benchmark incluye una tarea de hiring-bias, lo que sugiere interes en medir sesgos, pero no se publican resultados; no hay informacion sobre sesgos conocidos del modelo base en esta ficha.
- Idiomas: no se especifican los idiomas soportados; se desconoce si la poda afecta de forma desigual al multilingusimo.
- Contexto: no se documenta la longitud de contexto soportada ni si la poda afecta a la atencion de largo alcance.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base Qwen/Qwen3.5-4B, a la que el autor remite.
- Reproducibilidad: el autor declara un build nocturno de PyTorch (torch 2.14.0a0), lo que puede complicar la reproduccion exacta del entorno.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/qwen3.5-4b-prune_unstructured_50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
- Paper o blog del benchmark de poda: no disponible en la informacion proporcionada
- Repositorio del codigo de poda: no disponible en la informacion proporcionada
