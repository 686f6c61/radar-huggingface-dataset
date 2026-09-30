# Grafting-Beliefs/fair-midtraining-models

## Resumen

`Grafting-Beliefs/fair-midtraining-models` es un repositorio de artefactos de investigacion publicado por el usuario Grafting-Beliefs, no un modelo unico. Contiene diez juegos de pesos completos derivados de `Qwen/Qwen3-14B-Base` (aproximadamente 14.800 millones de parametros, transformer denso de la familia Qwen3), agrupados en cinco variantes experimentales y dos semillas de entrenamiento cada una (42 y 43). El objetivo declarado es servir de comparacion controlada en el estudio *Pre-training interventions, ex post facto: grafting model beliefs across checkpoints*.

El problema que aborda es metodologico: como inyectar, eliminar o trasplantar una "creencia" (en este caso, contenido sintetico sobre bienestar animal) en un modelo ya preentrenado y posteriormente instruido, sin reentrenar desde cero. Para ello el autor compara un modelo de control, un modelo con mid-training sobre documentos sinteticos, una variante "native" que entrena esos documentos directamente sobre el modelo instruido, y dos variantes de *grafting* que suman diferencias de pesos entre ejecuciones, una anclada al modelo instruido y otra al modelo base.

Es relevante ahora porque documenta de forma reproducible tecnicas de aritmetica de pesos y edicion post hoc de creencias, un area con implicaciones directas en alineamiento, seguridad y control de comportamiento en modelos abiertos. Su tamano de repositorio (301,6 GB) refleja que almacena pesos completos en precision de entrenamiento para todas las variantes, no una unica publicacion ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso heredado de Qwen3-14B-Base (no se detalla en la model card; sin componentes MoE declarados) |
| Parametros totales | Aproximadamente 14.800 millones (heredados del modelo base Qwen3-14B-Base) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-14B-Base soporta 32.768 tokens nativos segun la documentacion publica de Qwen |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos completos en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible; los datos de mid-training y de instruccion son en ingles (FineWeb-Edu y documentos sinteticos) |
| Licencia | No disponible (el modelo base Qwen3-14B-Base se distribuye bajo Apache 2.0, pero este repositorio derivado no declara licencia) |
| Formato de pesos | Safetensors |
| Variantes incluidas | control, midtrained, native, graft, plain_graft (semillas 42 y 43) |
| Tamano del repositorio | 301,6 GB |
| Libreria | transformers |
| Compatibilidad | endpoints_compatible, region: us |

Estructura de directorios declarada por el autor:

```
models/<control|midtrained|native|graft|plain_graft>-seed<42|43>/
```

## Arquitectura y entrenamiento

La model card no describe cambios en la arquitectura respecto a Qwen3-14B-Base: se trata de pesos completos (full-weight), no de adaptadores tipo LoRA. El diseno experimental parte del modelo base y aplica una fase de mid-training sobre una mezcla de tokens 1:1 compuesta por documentos sinteticos sobre bienestar animal y FineWeb-Edu. Despues, todas las variantes se instruyen sobre 200.000 muestras. El modelo de control sustituye los documentos sinteticos por mas FineWeb-Edu y recibe el mismo proceso de instruccion, lo que permite aislar el efecto de los documentos sinteticos frente al de un volumen equivalente de datos web educativos.

Las variantes de *grafting* implementan aritmetica de pesos entre ejecuciones. El *graft* anclado calcula la diferencia de pesos entre las dos ejecuciones de mid-training sobre el modelo base y la suma al modelo de control ya instruido; el *plain graft* suma esa misma diferencia al modelo base en lugar de al modelo instruido. La variante *native* entrena los documentos sinteticos directamente sobre el modelo de control instruido. Cada configuracion se ejecuta con dos semillas (42 y 43), lo que permite estimar varianza entre ejecuciones. La model card no especifica el numero total de tokens de mid-training, la composicion exacta del dataset sintetico, ni si se emplearon tecnicas de RLHF o DPO mas alla de la instruccion sobre 200.000 muestras.

## Capacidades

- Generacion de texto en ingles y seguimiento de instrucciones, heredadas del ajuste sobre 200.000 muestras.
- Capacidad de ejectuar razonamiento y codigo en la medida en que lo hace el modelo base Qwen3-14B-Base, sin que la model card documente mejoras o degradaciones especificas.
- Inyeccion controlada de contenido factual concreto (documentos sinteticos sobre bienestar animal) mediante mid-training o aritmetica de pesos, que es el objeto central del repositorio.
- Reproduccion de experimentos con dos semillas independientes por variante, lo que permite analisis de estabilidad.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; los datos de entrenamiento declarados son en ingles.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.
- No se declara pipeline de inferencia (`pipeline: no disponible`) ni demo interactiva.

## Casos de uso

- Investigacion sobre edicion de creencias en modelos preentrenados: el repositorio permite reproducir el protocolo de *grafting* comparando las cinco variantes con las mismas dos semillas, midiendo cuanto del contenido sintetico se conserva tras la instruccion y cuanto se pierde.
- Estudios de aritmetica de pesos (task arithmetic y model merging): las diferencias de pesos entre las ejecuciones de mid-training y el modelo base pueden reutilizarse como "vectores de tarea" en otros experimentos de merging.
- Auditoria de alineamiento y seguridad: al existir una variante de control y una con contenido inyectado, se puede medir de forma aislada como un sesgo o valor concreto afecta a las respuestas del modelo instruido.
- Comparacion de estrategias de mid-training frente a fine-tuning directo: la variante *native* frente al *graft* anclado permite evaluar si inyectar datos antes o despues de la instruccion produce comportamientos distintos.
- Analisis de varianza entre semillas en intervenciones sobre pesos: con semillas 42 y 43 en cada configuracion, sirve para estimar si los efectos observados superan el ruido de entrenamiento.
- Base para experimentos de fine-tuning posterior: cualquiera de las diez variantes puede usarse como punto de partida congelado o ajustable en estudios de olvido catastrofico.
- Docencia y formacion tecnica: el repositorio ilustra de forma tangible la diferencia entre mid-training, instruccion y edicion post hoc de pesos, con artefactos descargables.
- Referencia negativa en produccion: sirve para documentar por que los artefactos de investigacion sin licencia declarada y sin evaluacion de benchmarks no deben desplegarse como asistentes de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el diseno experimental y las rutas de los pesos, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas entre control, midtrained, native, graft y plain_graft. La busqueda web asociada no devolvio ninguna fuente tecnica relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision bf16/fp16: aproximadamente 30 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica se necesitan 32-40 GB o mas segun la longitud de contexto.
- GPU recomendadas para una copia en bf16: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB.
- Consumer GPU: no cabe en una unica RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en bf16. Requiere cuantizacion (por ejemplo, 4 bits) o reparto en varias GPU. No se publican pesos GGUF ni cuantizados en el repositorio, por lo que la cuantizacion tendria que generarla el usuario.
- Almacenamiento: 301,6 GB para el repositorio completo; cada variante individual ronda los 29-30 GB en bf16.
- Opciones de despliegue: al ser pesos completos en safetensors y compatibles con transformers, se pueden servir con vLLM, TGI, SGLang o cargar directamente con la libreria transformers. Para llama.cpp u Ollama habria que convertir y cuantizar previamente.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| Grafting-Beliefs/fair-midtraining-models | ~14,8 B por variante | No disponible en la model card | Safetensors (pesos completos) | No disponible | Artefacto de investigacion sobre grafting de creencias |
| Qwen/Qwen3-14B-Base | ~14,8 B | 32.768 tokens nativos segun la documentacion de Qwen | Safetensors | Apache 2.0 | Modelo base generalista de proposito general |
| Qwen/Qwen3-14B | ~14,8 B | 32.768 tokens nativos, ampliable con YaRN segun la documentacion de Qwen | Safetensors | Apache 2.0 | Modelo instruido listo para uso en aplicaciones |
| Qwen/Qwen3-8B-Base | ~8,2 B | 32.768 tokens nativos segun la documentacion de Qwen | Safetensors | Apache 2.0 | Alternativa mas ligera de la misma familia |

No se dispone de datos de benchmarks que permitan comparar el rendimiento efectivo de las variantes de este repositorio frente a Qwen3-14B-Base o Qwen3-14B. La comparacion anterior se limita a parametros, contexto declarado, formato y licencia.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un conjunto de artefactos de investigacion con fines comparativos.
- La licencia no esta declarada en el repositorio, lo que impide determinar con certeza las condiciones de uso comercial, a pesar de que el modelo base Qwen3-14B-Base es Apache 2.0. Conviene contactar con el autor antes de cualquier uso mas alla de la investigacion.
- No se publican benchmarks ni evaluaciones de calidad, seguridad o sesgo para ninguna de las cinco variantes.
- El repositorio no declara idiomas soportados; los datos de mid-training e instruccion son en ingles, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinacion: no esta caracterizado en la model card, y la inyeccion de documentos sinteticos sobre un tema concreto puede aumentar la confianza del modelo en afirmaciones de ese dominio sin garantia de veracidad.
- La tecnica de *grafting* modifica pesos de forma global; no se documenta que efectos secundarios tiene sobre capacidades no relacionadas (olvido catastrofico, degradacion de razonamiento).
- El uso de documentos sinteticos sobre bienestar animal introduce una orientacion de valores concreta en las variantes tratadas, lo que debe tenerse en cuenta en cualquier evaluacion de neutralidad.
- Sin pipeline declarado ni tarjeta de uso, se desconoce el prompt format esperado por las variantes instruidas; habra que inferirlo del modelo base.
- El repositorio ocupa 301,6 GB, lo que exige planificacion de almacenamiento y ancho de banda para su descarga completa.
- La fecha de creacion y actualizacion registrada (2026) y la ausencia de descargas o likes indican que se trata de una publicacion reciente y sin validacion externa por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Grafting-Beliefs/fair-midtraining-models
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Paper de referencia citado en la model card: *Pre-training interventions, ex post facto: grafting model beliefs across checkpoints* (no se ha encontrado URL en la busqueda web disponible)
- No se han encontrado en la busqueda web enlaces adicionales, repositorios de codigo, demos ni blogs relacionados con este modelo.
