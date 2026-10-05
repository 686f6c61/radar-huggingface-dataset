# rasyosef/Llama-3.2-3B-Instruct-DSpark-GGUF

## Resumen

Llama-3.2-3B-Instruct-DSpark-GGUF es un sidecar de borrador (*draft model*) en formato GGUF publicado por el usuario rasyosef para su uso con llama.cpp. No es un modelo conversacional autonómo: contiene únicamente el cabezal borrador de un esquema de decodificación especulativa denominado DSpark, diseñado para acelerar la inferencia de Llama-3.2-3B-Instruct. Sus 749.827.409 parámetros corresponden al borrador, compuesto por 5 capas de atención, una cabeza Markov de rango 256, una cabeza de confianza, tamaño de bloque 8 y un vocabulario de borrador de 50.000 tokens.

El artefacto se distribuye como borrador lateral (*sidecar*) independiente: no incluye embeddings de tokens ni LM head, que se toman prestados del modelo objetivo en tiempo de carga. Por tanto, debe emparejarse obligatoriamente con un GGUF del modelo objetivo Llama-3.2-3B-Instruct, por ejemplo los publicados por unsloth. El repositorio ocupa 3,8 GB e incluye tres cuantizaciones: BF16 (1,51 GB), F16 (1,51 GB) y Q8_0 (805 MB).

Su relevancia actual radica en que la decodificación especulativa DSpark ya está integrada en la rama principal de llama.cpp (PR #25173), lo que permite desplegar aceleración de inferencia exacta —el modelo objetivo verifica cada token propuesto, de modo que la salida greedy coincide con la del objetivo en solitario— sin necesidad de frameworks adicionales. Este repositorio forma parte de una familia más amplia de borradores DSpark para Llama-3.2-1B, Qwen3-1.7B, Qwen3.5-2B, gemma-4-E2B y Phi-4-mini.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificación especulativa DSpark (5 capas de atención + cabeza Markov de rango 256 + cabeza de confianza, tamaño de bloque 8, vocabulario de borrador de 50.000 tokens) |
| Parametros totales | 749.827.409 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el contexto efectivo lo determina el modelo objetivo (Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (llama.cpp) |

Detalle de archivos del repositorio:

| Archivo | Cuantizacion | Tamano | Notas |
|---|---|---:|---|
| `Llama-3.2-3B-Instruct-DSpark-BF16.gguf` | BF16 | 1,51 GB | Precision nativa de entrenamiento; recomendado si la memoria lo permite |
| `Llama-3.2-3B-Instruct-DSpark-F16.gguf` | F16 | 1,51 GB | Mismo tamano que BF16, para backends sin buen soporte de BF16 |
| `Llama-3.2-3B-Instruct-DSpark-Q8_0.gguf` | Q8_0 | 805 MB | Archivo mas pequeno, para presupuestos de memoria ajustados |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa de tipo DSpark, no un transformer generativo completo. Su composición declarada incluye 5 capas de atención, una cabeza Markov de rango 256, una cabeza de confianza, tamaño de bloque 8 y un vocabulario de borrador de 50.000 tokens. La cabeza de confianza y el tamaño de bloque fijo determinan cuántos tokens propone el borrador por paso, mientras que la cabeza Markov modela la dependencia entre tokens propuestos. No se ha publicado en la informacion disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO.

La característica técnica central es que la decodificación especulativa es exacta: el modelo objetivo verifica cada token propuesto por el borrador, de modo que la salida en modo greedy es idéntica a la del objetivo sin borrador. Los tiempos por respuesta exponen las métricas `draft_n` y `draft_n_accepted`, que permiten medir la tasa de aceptación. El tamaño de bloque se lee de los metadatos del sidecar, y el parámetro `n-max` se recorta a dicho valor. Al compartir embeddings y LM head con el objetivo, el borrador no puede ejecutarse de forma independiente.

## Capacidades

- Generacion de tokens candidatos (*drafting*) para decodificacion especulativa sobre Llama-3.2-3B-Instruct.
- Aceleracion de inferencia con verificacion exacta por parte del modelo objetivo: la salida greedy no se degrada respecto al objetivo en solitario.
- Propuesta de bloques de hasta 8 tokens por paso, con control mediante `--spec-draft-n-max` y `--spec-draft-n-min`.
- Exposicion de metricas de aceptacion (`draft_n`, `draft_n_accepted`) en los `timings` de cada respuesta.
- Compatibilidad con llama.cpp y llama-server mediante `--spec-type draft-dspark`.
- No soporta generacion de texto autonoma, tool calling, agentes, vision, audio ni modo de razonamiento: carece de embeddings y LM head propios.
- Capacidades multilingues: no disponible.

## Casos de uso

- Servicio de chat en tiempo real autoalojado: emparejado con un GGUF de Llama-3.2-3B-Instruct, el borrador reduce la latencia por token en despliegues con llama-server, lo que mejora la experiencia en conversaciones interactivas sin alterar las respuestas del modelo objetivo.
- Aceleracion de inferencia en GPU de gama media: al ocupar solo 805 MB en Q8_0, el borrador cabe junto al objetivo en GPUs consumer de 8-12 GB de VRAM, permitiendo servir un 3B con decodificacion especulativa donde un borrador mayor no cabria.
- Procesamiento por lotes de documentos largos: en tareas de resumen o extraccion sobre entradas extensas, la decodificacion especulativa aumenta el throughput agregado del servidor al reducir el coste por token generado.
- Autocompletado de codigo de baja latencia: integrado en un servidor llama.cpp detras de un editor, reduce el tiempo hasta el primer bloque de tokens, siempre que el modelo objetivo sea Llama-3.2-3B-Instruct.
- Evaluacion y benchmarking de decodificacion especulativa: las metricas `draft_n` y `draft_n_accepted` permiten medir la tasa de aceptacion por dominio (codigo, prosa, matematicas) y ajustar el numero maximo de tokens borrador.
- Despliegue en entornos con presupuesto de memoria estricto: la cuantizacion Q8_0 de 805 MB permite habilitar aceleracion especulativa en nodos donde el margen libre de VRAM no admite un segundo modelo de 3B completo.
- Experimentacion en investigacion sobre decodificacion especulativa: al ser reproducible con llama.cpp mainline (PR #25173), sirve como punto de partida para comparar tasas de aceptacion entre variantes de borrador de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio del modelo base `rasyosef/Llama-3.2-3B-Instruct-DSpark` para consultar las metricas de longitud de aceptacion y los detalles de entrenamiento; dichos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM del borrador: 1,51 GB en BF16/F16 y 805 MB en Q8_0.
- VRAM del objetivo: variable segun cuantizacion del GGUF de Llama-3.2-3B-Instruct elegido (el objetivo es la palanca principal de velocidad y calidad, independiente del borrador).
- VRAM combinada estimada: aproximadamente 2,3-3 GB con borrador Q8_0 y objetivo en cuantizacion de 4 bits; aproximadamente 8 GB con borrador BF16 y objetivo en BF16.
- Cabe en GPU consumer: si, con margen en tarjetas de 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 3080) usando borrador Q8_0 y objetivo cuantizado a 4 bits.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para maximizar throughput; en el extremo bajo, cualquier GPU con 8 GB o mas que soporte las capas descargadas con `-ngl 99`.
- Opciones de despliegue: llama.cpp y llama-server con los flags `--spec-type draft-dspark --spec-draft-n-max 8 --spec-draft-n-min 0 -fa on -ngl 99`; el borrador se carga con `-hfd` apuntando al repositorio GGUF y el objetivo con `-hf`.
- Latencia y throughput: no disponibles. La ganancia depende de la tasa de aceptacion real, que no se publica en la informacion disponible.

## Comparativa con modelos similares

Comparativa con otros borradores de la familia DSpark y con la alternativa de usar un modelo pequeno como borrador convencional. Los datos de rendimiento no estan disponibles para ninguno de ellos en la informacion proporcionada.

| Modelo | Rol | Parametros | Formato | Objetivo asociado | Licencia |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-DSpark-GGUF (este) | Borrador DSpark | 749.827.409 | GGUF (BF16, F16, Q8_0) | Llama-3.2-3B-Instruct | llama3.2 |
| Llama-3.2-1B-Instruct-DSpark-GGUF | Borrador DSpark | No disponible | GGUF | Llama-3.2-1B-Instruct | No disponible |
| Qwen3-1.7B-DSpark-GGUF | Borrador DSpark | No disponible | GGUF | Qwen3-1.7B | No disponible |
| Phi-4-mini-instruct-DSpark-GGUF | Borrador DSpark | No disponible | GGUF | Phi-4-mini-instruct | No disponible |
| Llama-3.2-1B-Instruct (como borrador convencional) | Borrador estandar | 1.240 millones aprox. (no confirmado en la informacion disponible) | GGUF | Llama-3.2-3B-Instruct u otros | llama3.2 |

Frente a un borrador convencional del mismo orden de tamano, este sidecar tiene la ventaja de un bloque de propuesta fijo de 8 tokens y una cabeza de confianza especifica. Frente a otros borradores DSpark, la diferencia principal es el modelo objetivo para el que esta entrenado: no es intercambiable con Qwen3, gemma o Phi-4.

## Limitaciones y advertencias

- No es un modelo autonomo: no incluye embeddings ni LM head, por lo que no puede generar texto sin un GGUF objetivo compatible cargado en el mismo proceso.
- Requiere emparejamiento estricto con Llama-3.2-3B-Instruct; usarlo con otro objetivo no esta soportado por la documentacion disponible.
- Requiere una version de llama.cpp que incluya el soporte DSpark (PR #25173 en ggml-org/llama.cpp); en versiones anteriores el flag `--spec-type draft-dspark` no existira.
- La ganancia real depende de la tasa de aceptacion, que varia por dominio y no se documenta en la informacion disponible; en dominios con baja aceptacion la aceleracion puede ser marginal o incluso negativa por el coste de verificacion.
- Sesgos conocidos: no disponibles. Al no generar texto de forma autonoma, los sesgos del sistema final provienen del modelo objetivo y no del borrador.
- Riesgo de alucinacion: no aplica al borrador en si, ya que cada token propuesto se verifica contra el objetivo; la salida greedy es identica a la del objetivo sin decodificacion especulativa.
- Limitaciones de contexto: no disponibles para el borrador; el limite practico lo fija el modelo objetivo.
- Limitaciones de idioma: no disponibles. El vocabulario de borrador de 50.000 tokens es reducido frente al vocabulario completo del objetivo, lo que puede afectar a la tasa de aceptacion en idiomas o dominios poco representados.
- Licencia llama3.2 (Llama 3.2 Community License): incluye clausulas especificas de uso aceptable y obligaciones de atribucion; conviene revisar los terminos antes de un despliegue comercial.
- Repositorio sin descargas ni valoraciones en el momento de la consulta (0 descargas, 0 likes), lo que implica poca validacion externa de su comportamiento en produccion.
- El modelo base referenciado y las fechas de creacion registradas (2026) no permiten contrastar un historial de mantenimiento consolidado.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/rasyosef/Llama-3.2-3B-Instruct-DSpark-GGUF
- Modelo base (borrador DSpark sin cuantizar): https://huggingface.co/rasyosef/Llama-3.2-3B-Instruct-DSpark
- Modelo objetivo recomendado (GGUF de Llama-3.2-3B-Instruct): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF
- Modelo objetivo alternativo (referencia Llama-3.2-3B-Instruct): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- PR de llama.cpp con soporte DSpark (referencia #25173): https://github.com/ggml-org/llama.cpp/pull/25173
- Borrador hermano Llama-3.2-1B-Instruct-DSpark-GGUF: https://huggingface.co/rasyosef/Llama-3.2-1B-Instruct-DSpark-GGUF
- Objetivo Llama-3.2-1B-Instruct: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Borrador hermano Qwen3-1.7B-DSpark-GGUF: https://huggingface.co/rasyosef/Qwen3-1.7B-DSpark-GGUF
- Objetivo Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Borrador hermano Qwen3.5-2B-DSpark-GGUF: https://huggingface.co/rasyosef/Qwen3.5-2B-DSpark-GGUF
- Objetivo Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Borrador hermano gemma-4-E2B-it-dspark-GGUF: https://huggingface.co/rasyosef/gemma-4-E2B-it-dspark-GGUF
- Objetivo gemma-4-E2B-it: https://huggingface.co/google/gemma-4-E2B-it
- Borrador hermano Phi-4-mini-instruct-DSpark-GGUF: https://huggingface.co/rasyosef/Phi-4-mini-instruct-DSpark-GGUF
- Objetivo Phi-4-mini-instruct: https://huggingface.co/microsoft/Phi-4-mini-instruct

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos fueron dominios de contenido para adultos sin relacion con el tema.
