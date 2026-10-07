# Lygodactylus/Qwen3.8-27B-Uncensored-exl3-5bpw

## Resumen

Qwen3.8-27B-Uncensored-exl3-5bpw es una cuantizacion en formato EXL3 a 5.0 bits por peso (bpw) del modelo orcarouter/Qwen3.8-27B-Uncensored, que a su vez es una version "abliterated" (con los mecanismos de rechazo eliminados) de Qwen/Qwen3.8-27B. La publica el usuario Lygodactylus y ha sido generada con ExLlamaV3 1.4.6 y su herramienta de conversion, pensada para ejecutarse sobre el motor de inferencia ExLlamaV3 mediante TabbyAPI.

El artefacto no es un modelo nuevo: es una cuantizacion de pesos que ocupa unos 20 GB en disco y se presenta como el punto intermedio entre la variante de 4.0 bpw (16 GB) y la de 6.0 bpw (22 GB), con el objetivo declarado de encajar en tarjetas de 24 a 28 GB de VRAM. Mantiene la cabeza MTP (multi-token prediction) a 8 bpw y funcional, algo que las conversiones a GGUF de la misma familia descartan, y conserva el torre de vision y los embeddings sin cuantizar (16 bits).

Su relevancia es doble. Por un lado, ofrece una ruta de despliegue local de un modelo multimodal con ventana de contexto cacheable de 32768 tokens y decodificacion especulativa mediante MTP. Por otro, hereda de la build base la eliminacion sustancial del alineamiento de seguridad, lo que limita su uso a investigacion y experimentacion controlada segun el propio autor. La licencia declarada es Apache 2.0, heredada de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen (tag de arquitectura: qwen3_5), con torre de vision y cabeza MTP (multi-token prediction) |
| Parametros totales | 10.215.781.616 (segun safetensors del repo); el nombre comercial indica "27B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la configuracion de ejemplo de TabbyAPI usa una cache de 32768 tokens) |
| Tipos de cuantizacion | EXL3 a 5.0 bpw (lenguaje); lm_head a 8 bpw; capas MTP a 8 bpw; torre de vision y embeddings a 16 bits. Existen hermanos a 4.0, 6.0 y 8.0 bpw |
| Idiomas soportados | en, fr, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 para ExLlamaV3 (no GGUF) |

## Arquitectura y entrenamiento

La ficha no aporta detalles de entrenamiento propios, porque este repositorio es una cuantizacion y no un entrenamiento. El modelo subyacente es un transformer decoder de la familia Qwen (etiqueta de arquitectura qwen3_5) con dos componentes adicionales visibles en el grafo de pesos: una torre de vision, que se conserva sin cuantizar en 16 bits, y una cabeza MTP destinada a decodificacion especulativa. El proceso de cuantizacion empleo la calibracion por defecto de ExLlamaV3 con un corpus mixto (wiki 50, C4 20, codigo 20, tokens aleatorios 20, tecnico 10, multilingue 10 y tiny 5), en 250 filas de 2048 columnas, con los parametros `-b 5.0 -hb 8 -mb 8 -vb 16`. El `lm_head` se subio a 8 bpw (frente a 6 bpw en la variante de 4.0 bpw), lo que anade unos 0.3 GB y elimina incertidumbre en la capa que selecciona cada token.

La peculiaridad tecnica mas destacable es la preservacion de la cabeza MTP a 8 bpw. Segun el autor, las conversiones a GGUF de esta familia descartan los tensores `mtp.*`, por lo que carecen de autodrafting; en TabbyAPI, con `draft_mode: mtp`, el log de carga muestra `Using main model MTP component for drafting`. Sobre el alineamiento, el repositorio base ha sido sometido a abliteration, es decir, a la sustraccion de las direcciones de activacion asociadas al rechazo, de modo que la build original responde a peticiones que Qwen3.8-27B rechazaria. No se documenta en la informacion disponible si hubo RLHF, DPO u otra fase de post-entrenamiento posterior a la abliteration.

## Capacidades

- Generacion de texto conversacional y de proposito general en ingles, frances y chino.
- Procesamiento multimodal de entrada gracias a la torre de vision conservada sin cuantizar (16 bits); la informacion disponible no detalla tareas visuales concretas.
- Decodificacion especulativa con la cabeza MTP preservada, activable en TabbyAPI con `draft_mode: mtp`, lo que acelera la generacion autoregresiva.
- Soporte de contexto largo utilizable mediante cache configurable (32768 tokens en el ejemplo oficial).
- Comportamiento sin guardarrailes: cumple peticiones que el modelo original rechaza, segun declara el autor.
- Compatibilidad con despliegue en ExLlamaV3 y TabbyAPI, con tensor parallelism para repartir el modelo entre varias GPU.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no documentado en la informacion disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar de forma controlada que ocurre cuando se eliminan los mecanismos de rechazo de un modelo alineado, comparando respuestas frente a Qwen3.8-27B-FP8 en el mismo conjunto de prompts.
- Generacion de texto multilingue en ingles, frances y chino: util para prototipos de traduccion, redaccion o resumen en esos tres idiomas sin depender de APIs externas.
- Despliegue local en estaciones de trabajo con una GPU de 24 GB: al ocupar 20 GB en disco, encaja en tarjetas de gama alta de consumo, lo que permite tener un modelo multimodal en local.
- Evaluacion de tecnicas de cuantizacion: sirve como punto de comparacion directa entre las variantes de 4.0, 5.0, 6.0 y 8.0 bpw del mismo modelo, midiendo el compromiso entre calidad y latencia.
- Servicio de inferencia con decodificacion especulativa: integrado en TabbyAPI con `draft_mode: mtp` para maximizar tokens por segundo en entornos multi-GPU con tensor parallelism.
- Analisis de documentos con imagenes: la torre de vision sin cuantizar permite alimentar imagenes junto a texto, por ejemplo para extraer informacion de capturas o diagramas, siempre que se valide la calidad de la cuantizacion en esa tarea.
- Pruebas de red teaming y evaluacion de robustez: la ausencia de guardarrailes lo hace util para generar prompts adversarios y medir la eficacia de las capas de moderacion que se anadan por encima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks a 5.0 bpw en la informacion disponible. El autor indica que no se ejecutaron pruebas en esta variante. Como referencia sobre los mismos pesos abliterated, la build en FP8 obtiene los siguientes resultados frente al modelo oficial:

| Benchmark | Qwen3.8-27B-Uncensored (FP8) | Qwen3.8-27B-FP8 oficial |
|---|---|---|
| MMLU-Pro (subconjunto business, 100 preguntas, 2 sin parsear) | 88.0% | 89.0% |

La diferencia entre ambas cifras queda dentro del ruido segun el autor, pero la comparacion no se ha verificado para la variante de 5.0 bpw. No hay datos de HumanEval, GSM8K ni otros benchmarks en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 20 GB de pesos, mas la cache KV. Con `cache_size: 32768` conviene reservar margen adicional de VRAM.
- GPU objetivo declaradas por el autor: tarjetas de 24 a 28 GB, es decir, RTX 3090, RTX 4090, RTX 5090 (32 GB), y profesionales como A6000 o L40S.
- Cabe en GPU de consumo: si, en modelos de 24 GB o mas. Es el punto intermedio disenado precisamente para ese segmento.
- Multi-GPU: el autor reporta pruebas en 4x RTX 4000 Ada con PCIe, sin NVLink, usando tensor parallelism. En ese entorno, pasar de 4.0 a 8.0 bpw solo costo un 6% de latencia.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI (recomendado en la ficha, con soporte de tensor parallelism y MTP). Las conversiones a GGUF de la familia pierden los tensores MTP, por lo que no conservan el autodrafting.
- Latencia y throughput: no se han publicado cifras concretas a 5.0 bpw. Se espera que quede entre los valores de las variantes de 4.0 y 6.0 bpw, segun el autor.

## Comparativa con modelos similares

| Modelo | Tamano en disco | bpw | MTP | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-exl3-4bpw | 16 GB | 4.0 | si | apache-2.0 |
| Qwen3.8-27B-Uncensored-exl3-5bpw | 20 GB | 5.0 | si (8 bpw) | apache-2.0 |
| Qwen3.8-27B-Uncensored-exl3-6bpw | 22 GB | 6.0 | si | apache-2.0 |
| Qwen3.8-27B-Uncensored-exl3-8bpw | 28 GB | 8.0 | si | apache-2.0 |
| Qwen3.8-27B-FP8 (oficial) | no disponible | FP8 | no disponible | apache-2.0 |

Las cuatro variantes EXL3 comparten los mismos pesos abliterated y solo difieren en el nivel de cuantizacion. La comparacion con modelos de otras familias del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de guardarrailes: el alineamiento de seguridad se ha eliminado sustancialmente mediante abliteration. El modelo respondera a peticiones que el Qwen3.8-27B original rechaza. El autor exige anadir una capa de moderacion propia antes de cualquier despliegue.
- Uso previsto restringido a investigacion y experimentacion controlada, segun la propia ficha.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad factual para esta build, por lo que debe asumirse el riesgo habitual de un modelo abliterated.
- Idiomas limitados: solo en, fr y zh. El castellano no figura entre los idiomas declarados.
- Discrepancia de nomenclatura: el repositorio se llama "27B" pero el numero real de parametros en safetensors es 10.215.781.616, muy inferior. Hay que verificar el tamano efectivo antes de planificar recursos.
- Sin benchmarks a 5.0 bpw: no hay datos verificados de calidad para esta variante concreta; el dato de MMLU-Pro procede de una build FP8 distinta.
- Formato propietario de facto: los pesos son EXL3, no GGUF, lo que limita las opciones de despliegue a ExLlamaV3 y herramientas compatibles como TabbyAPI.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado sin guardarrailes recae en el desplegador.
- Longitud de contexto no especificada en la ficha, lo que obliga a validarla empiricamente antes de usarla en produccion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-5bpw
- Modelo base abliterated: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Variante 4.0 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-4bpw
- Variante 6.0 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-6bpw
- Variante 8.0 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-8bpw
- Modelo original de Qwen: https://huggingface.co/Qwen
- ExLlamaV3 (turboderp): https://github.com/turboderp-org/exllamav3
- TabbyAPI (theroyallab): https://github.com/theroyallab/tabbyAPI
