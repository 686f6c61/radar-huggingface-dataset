# MingZwhy/Qwen3-1.7B-W1.88-QAD

## Resumen

MingZwhy/Qwen3-1.7B-W1.88-QAD es un checkpoint intermedio de destilación con conciencia de cuantización (QAD, quantization-aware distillation) construido sobre Qwen/Qwen3-1.7B. No es un modelo final listo para inferencia: es el punto de partida del que arranca la fase de destilación en política (OPD, on-policy distillation) para la variante de 1,88 bits del proyecto QAOPD. Su propósito es servir como `STUDENT_MODEL` en el pipeline de entrenamiento, no como artefacto desplegable.

El detalle técnico clave es que los tensores almacenados están en bf16 y **no están cuantizados**. El entrenamiento con conciencia de cuantización conserva los pesos maestros en alta precisión y aplica el cuantizador dentro del forward pass; lo que se guarda es la copia maestra. Cargar este repositorio de forma directa devuelve un modelo sin cuantizar que, además, puntuará mejor que el modelo W1.88 final, lo que lo hace engañoso si se evalúa sin tener en cuenta su naturaleza.

El proyecto apunta a un presupuesto de pesos mixtos de INT1.58/INT4 en bloques de 256 elementos, con un 12,5 % de bloques en INT4, lo que da 1,88 bits efectivos por peso. El modelo cuenta con 1.720.574.976 parámetros y hereda la licencia Apache-2.0 de Qwen3-1.7B. Con cero descargas y cero likes en el momento de redactar esta ficha, se trata de un artefacto de investigación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen/Qwen3-1.7B); checkpoint de pesos maestros en bf16 |
| Parametros totales | 1.720.574.976 (aprox. 1,72 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Esquema objetivo de QAD (no aplicado en este checkpoint): pesos mixtos INT1.58/INT4 en bloques de 256 con 12,5 % de bloques en INT4 = 1,88 bits efectivos; embedding y cabeza de salida en INT4; activaciones en INT8; KV cache en 16 bits durante OPD y evaluacion. Los tensores del repositorio estan en bf16 sin cuantizar |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 (heredada de Qwen3-1.7B) |
| Formato de pesos | safetensors (bf16), libreria transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-1.7B, un transformer decoder-only de aproximadamente 1,72 mil millones de parametros. El checkpoint no introduce cambios estructurales: lo que cambia es el regimen de entrenamiento. El flujo QAOPD parte de este fichero como estudiante en alta precision y aplica un cuantizador en el forward pass, de modo que la red aprende a operar bajo el ruido y la perdida de resolucion que introducira la cuantizacion de 1,88 bits. Los pesos maestros se mantienen en bf16 durante todo el proceso y son los que se serializan aqui.

El esquema de cuantizacion previsto combina dos anchuras en bloques de 256 elementos: la mayoria de bloques a INT1.58 y un 12,5 % a INT4, lo que produce una media de 1,88 bits por peso. El embedding y la cabeza de salida se reservan a INT4, presumiblemente para proteger la capa de vocabulario, y las activaciones se cuantizan a INT8. La cache KV se mantiene en 16 bits durante la fase de OPD y la evaluacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; el autor remite al repositorio de codigo para la receta completa.

La innovacion destacable no esta en la arquitectura sino en el metodo: la destilacion en politica combinada con entrenamiento consciente de cuantizacion permite entrenar directamente el estudiante cuantizado contra las distribuciones generadas por el propio estudiante, en lugar de recurrir a un ajuste posterior a la cuantizacion. El checkpoint QAD es precisamente el eslabon que separa ambas fases.

## Capacidades

- Almacenamiento de pesos maestros de alta precision para la fase de entrenamiento QAD/OPD del proyecto QAOPD.
- Servir como `STUDENT_MODEL` en el script de OPD (`BITWIDTH=w1.88 STUDENT_MODEL=<checkpoint> bash scripts/opd/run_math.sh`).
- Generacion de texto: al cargarse con transformers produce un modelo causal de lenguaje funcional, aunque sin cuantizar y por tanto no representativo del modelo objetivo.
- El autor indica explicitamente que el checkpoint puntuara mejor que el modelo W1.88 final en cualquier evaluacion directa, debido a que conserva precision completa.
- Tool calling, function calling, capacidades de agente, modo de razonamiento explicito, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (el modelo base Qwen3 se distribuye como multilingue, pero no se detalla el alcance en esta ficha).

## Casos de uso

- Reproduccion de la fase QAD: cargar el checkpoint como estudiante inicial y ejecutar el pipeline de destilacion en politica con el cuantizador de 1,88 bits, obteniendo como salida el modelo recuperado MingZwhy/Qwen3-1.7B-W1.88-QAOPD.
- Investigacion en cuantizacion extrema: analizar como se comportan los pesos maestros en bf16 antes de aplicar el esquema mixto INT1.58/INT4 y comparar la degradacion con la del modelo cuantizado final.
- Ablacion de esquemas de cuantizacion: al ser un punto de partida reutilizable, permite variar el reparto de bloques INT4 frente a INT1.58 y medir el impacto en la fase de destilacion.
- Docencia y divulgacion sobre QAD: resulta util para ilustrar la diferencia entre pesos maestros y pesos desplegados, dado que el propio autor advierte del comportamiento enganoso del checkpoint si se evalua sin el cuantizador.
- Punto de partida para destilacion sobre dominios concretos: el repositorio incluye un script especifico para matematicas (`run_math.sh`), lo que sugiere que puede adaptarse a otros dominios con la receta adecuada.
- Referencia de comparacion para pipelines de compresion: sirve como linea base sin cuantizar frente a la que medir la perdida introducida por el esquema de 1,88 bits.
- No se recomienda su uso en produccion ni en servicios de inferencia orientados a usuario final, ya que no es el artefacto cuantizado que describe el proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, HumanEval ni ninguna otra metrica, y la busqueda web asociada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; el repositorio ocupa 3,5 GB en disco. Cifra orientativa calculada a partir de los 1.720.574.976 parametros; no confirmada por el autor.
- VRAM estimada del modelo objetivo de 1,88 bits: aproximadamente 0,4 GB para pesos (1,88 bits x 1,72e9 parametros), mas embedding y cabeza en INT4 y cache KV en 16 bits. Estimacion propia, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM puede alojar el checkpoint bf16; tarjetas tipo RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100 o H100 son suficientes en inferencia.
- Cabe en GPU de consumo: si, el checkpoint bf16 es manejable en GPUs de consumo con 8 GB o mas. La fase de entrenamiento OPD requiere mas memoria y se recomienda una GPU profesional.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`). vLLM, llama.cpp, Ollama u otros no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| MingZwhy/Qwen3-1.7B-W1.88-QAD | 1.720.574.976 | no disponible | bf16 sin cuantizar (esquema objetivo de 1,88 bits) | apache-2.0 | Checkpoint intermedio de entrenamiento |
| MingZwhy/Qwen3-1.7B-W1.88-QAOPD | no disponible | no disponible | 1,88 bits efectivos, artefacto recuperado | apache-2.0 | Modelo final del pipeline, apto para cargar y evaluar |
| Qwen/Qwen3-1.7B | 1,7 mil millones (aprox.) | no disponible en la informacion proporcionada | bf16 | apache-2.0 | Modelo base publico, listo para inferencia |

Las busquedas web realizadas no devolvieron informacion util sobre alternativas comparables (los resultados obtenidos fueron entradas de diccionario sobre el termino ingles "query"), por lo que no se incluyen otros modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo final. El autor lo describe explicitamente como "un punto de partida para el entrenamiento, no un modelo terminado".
- Los tensores estan en bf16 y no cuantizados. Cargarlo directamente devuelve un modelo sin cuantizar, sin error ni aviso, con un rendimiento superior al del modelo W1.88 real; cualquier evaluacion hecha sobre este fichero es enganosa.
- Es necesario envolverlo en el pipeline de OPD, que aporta la configuracion del cuantizador, para obtener el comportamiento de 1,88 bits.
- Sesgos conocidos: no disponible en la informacion proporcionada. Al derivar de Qwen3-1.7B, hereda los sesgos del modelo base y de sus datos de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- Limitaciones de contexto e idioma: no disponible en la informacion proporcionada.
- Licencia Apache-2.0, heredada de Qwen3-1.7B: permite uso comercial con las obligaciones habituales de atribucion y aviso de cambios. Conviene verificar las condiciones del modelo base.
- Advertencia de produccion: no desplegar este checkpoint en servicios de usuario final. Para inferencia real debe usarse el checkpoint recuperado MingZwhy/Qwen3-1.7B-W1.88-QAOPD.
- El repositorio registra cero descargas y cero likes, por lo que no existe validacion independiente de la comunidad sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-1.7B-W1.88-QAD
- Checkpoint recuperado (recomendado para cargar y evaluar): https://huggingface.co/MingZwhy/Qwen3-1.7B-W1.88-QAOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo y receta del proyecto QAOPD: https://github.com/MingZwhy/QAOPD

Nota: la busqueda web realizada no devolvio articulos, papers ni publicaciones relacionadas con este modelo; los resultados obtenidos trataban sobre el termino ingles "query" en diccionarios.
