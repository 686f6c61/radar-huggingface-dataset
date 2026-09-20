# MingZwhy/Qwen3-0.6B-W2.79-QAD

## Resumen

Qwen3-0.6B-W2.79-QAD es un checkpoint publicado por el usuario MingZwhy dentro del proyecto QAOPD (quantization-aware on-policy distillation). No es un modelo final: es el punto de partida concreto (checkpoint latente) desde el que arranca la etapa de destilacion on-policy de la variante W2.79, cuyo objetivo es obtener un modelo Qwen3-0.6B comprimido a 2,79 bits efectivos manteniendo la mayor calidad posible.

El checkpoint contiene 596.049.920 parametros almacenados en bf16 y **sin cuantizar**, porque el entrenamiento con conciencia de cuantizacion (QAD) mantiene pesos maestros en alta precision y aplica el cuantizador dentro del forward pass. Lo que se guarda es la copia maestra, no el modelo comprimido. Cargarlo directamente con transformers no produce error, pero devuelve un modelo sin cuantizar que puntua por encima del modelo W2.79 real, por lo que sus metricas no deben interpretarse como las del modelo objetivo.

Es relevante ahora porque documenta una receta reproducible de cuantizacion extrema (INT1.58/INT4 mixto en bloques de 256, con embedding y cabeza de salida en INT4 y activaciones en INT8) combinada con destilacion on-policy, un area con pocos artefactos publicos y menos aun con codigo asociado. La licencia es Apache-2.0, heredada de Qwen/Qwen3-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3, con cuantizador integrado en el forward pass (QAD) |
| Parametros totales | 596.049.920 (0,596 mil millones) |
| Parametros activos | no aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos: mixta INT1.58/INT4 en bloques de 256, con el 50 % de los bloques en INT4, lo que da 2,79 bits efectivos. Embedding y cabeza de salida: INT4. Activaciones: INT8. El checkpoint publicado guarda los pesos maestros en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, pesos maestros sin cuantizar) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-0.6B, un transformer decoder-only denso de 0,6 mil millones de parametros. Sobre esa base, el proyecto QAOPD aplica un esquema de cuantizacion con conciencia de entrenamiento: se conservan pesos maestros en bf16 y el cuantizador se ejecuta dentro del forward pass, de modo que el gradiente se propaga a traves de la operacion de cuantizacion. El reparto de precision es mixto: bloques de 256 elementos, de los cuales la mitad se cuantiza a INT4 y el resto a INT1.58 (formato binario/ternario empaquetado), con embedding y cabeza de salida en INT4 y activaciones en INT8, resultando en una precision efectiva de 2,79 bits por peso.

Este checkpoint es exclusivamente el artefacto previo a la etapa de destilacion on-policy (OPD) de la variante W2.79; la configuracion del cuantizador la aporta el propio pipeline de OPD, no el checkpoint. En la documentacion del autor se indica que debe usarse como `STUDENT_MODEL` en scripts como `scripts/opd/run_math.sh`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones adicionales de atencion o decodificacion. El codigo y la receta estan publicados en el repositorio MingZwhy/QAOPD.

## Capacidades

- No es un modelo para inferencia directa. Es un checkpoint latente de entrenamiento; cargarlo devuelve pesos bf16 sin cuantizar, no el modelo W2.79 comprimido.
- Se usa como modelo estudiante inicial en la etapa de destilacion on-policy del pipeline QAOPD.
- Permite inspeccionar y analizar los pesos maestros de alta precision antes de la cuantizacion.
- Sirve de base para reproducir y variar la configuracion del cuantizador (tamano de bloque, proporcion INT4/INT1.58, precision de activaciones).
- Capacidades de generacion de texto, conversacion y razonamiento: heredadas teoricamente del modelo base Qwen3-0.6B, pero no verificadas ni documentadas para este checkpoint.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion del pipeline QAOPD: usar este checkpoint como `STUDENT_MODEL` en `scripts/opd/run_math.sh` para regenerar el modelo W2.79 recuperado y validar la receta del autor de principio a fin.
- Investigacion en cuantizacion extrema: analizar los pesos maestros bf16 y estudiar como se comportan los bloques de 256 elementos al repartirse entre INT4 e INT1.58, con el objetivo de entender el limite practico de 2,79 bits efectivos.
- Ablaciones del cuantizador: partir de estos pesos y modificar parametros como el tamano de bloque, el porcentaje de bloques en INT4 o la precision de embedding y cabeza de salida, comparando el impacto en la calidad final.
- Destilacion on-policy con un teacher mayor: emplear este checkpoint como estudiante en experimentos donde un modelo de mayor tamano actua como profesor, aprovechando que el estudiante ya esta adaptado al ruido introducido por el cuantizador.
- Generacion de checkpoints recuperados para evaluacion: producir la version post-OPD y compararla contra el maestro bf16 para cuantificar la perdida real introducida por la compresion.
- Docencia y formacion tecnica: ilustrar con un caso real y reproducible como funciona la cuantizacion con conciencia de entrenamiento y por que los pesos maestros no son el modelo final.
- Base para prototipos en dispositivos muy limitados: una vez completada la etapa OPD, el modelo de 0,6 mil millones de parametros a 2,79 bits ocupa del orden de 0,21 GB, lo que lo hace candidato para pruebas de despliegue en movil o edge, siempre que la calidad resultante sea aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente advierte de que, si se carga este checkpoint de forma directa (sin cuantizar), obtendra puntuaciones superiores a las del modelo W2.79 resultante, por lo que cualquier evaluacion realizada sobre el artefacto sin pasar por el pipeline de OPD no es representativa del modelo objetivo.

## Requisitos de hardware

- Pesos maestros almacenados: 596.049.920 parametros en bf16 equivalen a unos 1,19 GB; el repositorio ocupa 1,2 GB.
- Inferencia con la cuantizacion W2.79 aplicada: el peso comprimido a 2,79 bits efectivos ronda los 0,21 GB, mas las activaciones en INT8 y el overhead del runtime.
- Memoria para la etapa de QAD/OPD: al entrenar con pesos maestros bf16, gradientes y estados de optimizador, la estimacion se situa en torno a 12 bytes por parametro, es decir unos 7 GB solo para el estado del modelo, mas activaciones y batch. Una GPU de 24 GB como la RTX 4090 deberia ser suficiente con batch reducido.
- GPU recomendadas: RTX 4090, A100 40 GB o H100 para experimentos con batch mayor; el modelo cabe tambien en GPUs consumer de gama media-alta.
- Cabe en GPU consumer: si, tanto el entrenamiento en bf16 como la inferencia cuantizada.
- Opciones de despliegue: transformers (carga directa, pero devuelve el modelo sin cuantizar), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio, vLLM previsiblemente compatible por arquitectura Qwen3. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, tarea que no esta documentada para este checkpoint.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MingZwhy/Qwen3-0.6B-W2.79-QAD (este) | 596.049.920 | Pesos maestros en bf16; cuantizador INT1.58/INT4 aplicado en el forward pass (2,79 bits efectivos) | Checkpoint latente, punto de partida de la etapa OPD | Apache-2.0 | HuggingFace |
| MingZwhy/Qwen3-0.6B-W2.79-QAOPD | no disponible | W2.79 con el resultado de la destilacion on-policy | Modelo recuperado, cargable y evaluable | Apache-2.0 (heredada) | HuggingFace |
| Qwen/Qwen3-0.6B | 0,6 mil millones (aproximado) | Sin cuantizar (bf16/fp16) | Modelo base de proposito general, listo para inferencia | Apache-2.0 | HuggingFace |

La comparativa se limita a los tres artefactos documentados en la informacion disponible; no se dispone de datos de rendimiento que permitan una comparacion cuantitativa con otras alternativas de 0,5 a 1 mil millones de parametros.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo desplegable. Su carga directa no reproduce la cuantizacion W2.79 y ofrece resultados sistematicamente mejores que el modelo objetivo, lo que puede inducir a error en evaluaciones.
- La cuantizacion no viaja dentro del fichero: la aporta la configuracion del pipeline de OPD. Sin esa configuracion no hay modelo comprimido.
- No se han publicado benchmarks, curvas de perdida ni comparaciones con el modelo base, por lo que el impacto real de la compresion a 2,79 bits es desconocido.
- No se documentan idiomas soportados; el comportamiento multilingue es, en el mejor de los casos, el heredado del modelo base.
- No se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos ni cobertura de dominios.
- Riesgo de alucinacion: inherente a los modelos de 0,6 mil millones de parametros y no cuantificado en este caso. La cuantizacion agresiva puede incrementar la degradacion en tareas de razonamiento y matematicas.
- Licencia Apache-2.0, heredada de Qwen3-0.6B: permite uso comercial, pero sin ninguna garantia de calidad sobre el artefacto resultante.
- El repositorio no registra descargas ni interacciones, y fue creado y actualizado en la misma fecha, lo que apunta a un artefacto de investigacion sin validacion externa.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a paginas de soporte de Windows y no guardan relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-0.6B-W2.79-QAD
- Checkpoint recuperado (post-OPD): https://huggingface.co/MingZwhy/Qwen3-0.6B-W2.79-QAOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Codigo y receta del proyecto QAOPD: https://github.com/MingZwhy/QAOPD
- Resultados de la busqueda web: sin enlaces relevantes; las entradas devueltas corresponden a documentacion de soporte de Windows y no estan relacionadas con el modelo.
