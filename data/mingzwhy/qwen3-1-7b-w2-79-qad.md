# MingZwhy/Qwen3-1.7B-W2.79-QAD

## Resumen

Qwen3-1.7B-W2.79-QAD es un checkpoint intermedio publicado por el usuario MingZwhy dentro del proyecto QAOPD (quantization-aware distillation + on-policy distillation). No es un modelo final listo para producción: es el punto de partida del que arranca la fase de destilación on-policy (OPD) para la variante de cuantización W2.79, construido sobre Qwen/Qwen3-1.7B. El repositorio contiene 1.720.574.976 parámetros en bf16, 3,5 GB de pesos, y se distribuye con licencia Apache-2.0 heredada del modelo base.

Su relevancia es fundamentalmente metodológica. El autor advierte de forma explícita de que los tensores almacenados son bf16 y no están cuantizados: el entrenamiento consciente de cuantización (QAT/QAD) mantiene pesos maestros en alta precisión y aplica el cuantizador dentro del forward pass, de modo que lo que se guarda es la copia maestra. Cargar este checkpoint directamente devuelve un modelo sin cuantizar, sin errores, y con puntuaciones superiores a las del modelo W2.79 real; es decir, sirve como `STUDENT_MODEL` para la etapa OPD, que aporta la configuración del cuantizador, pero no como modelo evaluable.

La configuración de cuantización objetivo es extrema: pesos mixtos INT1.58/INT4 en bloques de 256, con el 50% de los bloques en INT4, lo que da 2,79 bits efectivos; embeddings y cabeza de salida en INT4, activaciones en INT8 y caché KV en 16 bits durante OPD y evaluación. Para obtener un modelo cargable y evaluable, el propio autor remite al checkpoint recuperado MingZwhy/Qwen3-1.7B-W2.79-QAOPD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3, sin componente MoE) |
| Parametros totales | 1.720.574.976 (1,72 B), verificado en safetensors |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Objetivo del pipeline: pesos mixtos INT1.58/INT4 en bloques de 256 (50% de bloques en INT4, 2,79 bits efectivos), embeddings y cabeza de salida INT4, activaciones INT8, cache KV en 16 bits durante OPD y evaluacion. Los pesos publicados en este repositorio estan en bf16 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3-1.7B) |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen3-1.7B |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 3,5 GB |
| Fecha de publicacion | 21 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-1.7B: un transformer decoder-only denso de 1,72 B de parametros, del que este repositorio no modifica la topologia, sino unicamente el estado de los pesos. El checkpoint forma parte de un pipeline de dos etapas: primero una destilacion consciente de cuantizacion (QAD), que produce estos pesos maestros en bf16, y despues una destilacion on-policy (OPD) que inyecta la configuracion del cuantizador y aproxima el comportamiento del modelo cuantizado a la distribucion objetivo. El repositorio declara la etiqueta `quantization-aware-training` y la libreria `transformers`; el codigo y la receta se publican en el repositorio GitHub MingZwhy/QAOPD.

La innovacion tecnica destacable es el esquema de cuantizacion mixta por bloques: bloques de 256 elementos, la mitad de ellos a INT4 y el resto a INT1.58, lo que arroja una media de 2,79 bits por peso efectivos, con embeddings y cabeza de salida aislados en INT4 para limitar el dano en las capas mas sensibles y activaciones en INT8. No se proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en esta etapa; el autor tampoco documenta resultados de evaluacion para este checkpoint intermedio.

## Capacidades

- Hereda las capacidades generativas del modelo base Qwen/Qwen3-1.7B, pero no estan documentadas ni verificadas en este repositorio para el checkpoint cuantizado.
- Generacion de texto conversacional: la model card y los tags incluyen `conversational` y `text-generation`.
- Punto de partida para entrenamiento: se usa como `STUDENT_MODEL` en la etapa OPD, que aporta la configuracion del cuantizador.
- Referencia de alta precision: al conservar los pesos maestros en bf16, sirve como cota superior de calidad frente al modelo W2.79 recuperado.
- Compatibilidad con text-generation-inference y endpoints, segun los tags `text-generation-inference` y `endpoints_compatible`.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, vision ni audio en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion del pipeline QAOPD: cargar este checkpoint como `STUDENT_MODEL` y lanzar la etapa OPD con `BITWIDTH=w2.79 STUDENT_MODEL=<checkpoint> bash scripts/opd/run_math.sh`, tal y como indica la model card, para regenerar la variante cuantizada a 2,79 bits.
- Investigacion en cuantizacion extrema por debajo de 3 bits: el esquema mixto INT1.58/INT4 en bloques de 256 permite estudiar la degradacion de un transformer denso de 1,72 B cuando la media efectiva cae a 2,79 bits por peso.
- Estudio de destilacion consciente de cuantizacion: comparar la calidad de estos pesos maestros en bf16 con la del checkpoint recuperado W2.79-QAOPD cuantifica la brecha entre el modelo de alta precision y su version desplegable.
- Desarrollo de tecnicas de recuperacion de checkpoints cuantizados: el par QAD (bf16) y QAOPD (recuperado) constituye un banco de pruebas controlado para validar algoritmos de dequantizacion o de ajuste fino posterior.
- Analisis de sensibilidad por capas: al mantener embeddings y cabeza de salida en INT4 mientras el cuerpo usa INT1.58/INT4, es posible medir el impacto aislado de cada decision de precision en el resultado final.
- Base para experimentos academicos de eficiencia: con 1,72 B de parametros y un objetivo de menos de 1 GB de pesos cuantizados, permite estudiar compromisos entre memoria, latencia y calidad en hardware de gama media.
- Generacion de texto conversacional en bf16, con las mismas reservas que el modelo base: util como linea base no cuantizada en estudios comparativos, no como servicio en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este checkpoint no incluye tablas de evaluacion, y las busquedas web realizadas no devolvieron ningun resultado relacionado con QAOPD, MingZwhy o este modelo (los resultados obtenidos eran consultas de Zhihu sobre asistentes comerciales sin relacion con el repositorio). El autor senala ademas que evaluar este checkpoint de forma directa no es representativo, porque al estar en bf16 puntuaria por encima del modelo W2.79 real.

## Requisitos de hardware

- Los pesos publicados ocupan 3,5 GB en el repositorio (bf16). Para inferencia en bf16 se estiman del orden de 4 a 6 GB de VRAM, sumando pesos, activaciones y cache KV.
- Con la cuantizacion objetivo, los pesos a 2,79 bits efectivos ocuparian aproximadamente 0,6 GB, de modo que el modelo desplegable cabria comodamente en GPUs de 4 GB o mas.
- GPUs recomendadas para bf16: cualquier tarjeta con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G). Para entrenamiento QAD/OPD, donde conviven pesos maestros, estados del optimizador y el modelo profesor, se recomienda A100 40/80 GB o H100.
- Si cabe en GPU de consumo: si. En bf16 desde tarjetas de 8 GB, y con la cuantizacion W2.79 incluso en GPUs de 4 GB.
- Opciones de despliegue: transformers para carga directa; text-generation-inference y endpoints compatibles segun los tags. No se publica version en GGUF, por lo que llama.cpp u Ollama requeririan conversion manual y el cuantizador mixto del pipeline no es un formato estandar de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| MingZwhy/Qwen3-1.7B-W2.79-QAD (este) | 1,72 B | Pesos en bf16; objetivo 2,79 bits efectivos | No disponible | Apache-2.0 | Checkpoint intermedio, solo para entrenamiento |
| MingZwhy/Qwen3-1.7B-W2.79-QAOPD | No disponible (mismo modelo base) | W2.79 recuperado | No disponible | Apache-2.0 | Checkpoint cargable y evaluable |
| Qwen/Qwen3-1.7B | 1,72 B | Sin cuantizar (bf16/fp16) | No disponible | Apache-2.0 | Modelo base finalizado |

No se dispone de datos de rendimiento comparados entre estos tres modelos, por lo que la comparativa se limita a parametros, esquema de cuantizacion, licencia y estado de publicacion.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo terminado. La propia model card lo describe como "starting point for training". No debe desplegarse como si fuera el modelo W2.79.
- Los tensores estan en bf16 y no cuantizados. Cargarlos directamente no produce error y devuelve un modelo sin cuantizar, lo que constituye una trampa de evaluacion: los resultados seran mejores que los del modelo W2.79 real.
- Para evaluar o desplegar hay que usar el checkpoint recuperado MingZwhy/Qwen3-1.7B-W2.79-QAOPD.
- No hay resultados de benchmarks publicados, ni informacion sobre tokens de entrenamiento, composicion del dataset o uso de RLHF/DPO.
- No se documentan los idiomas soportados ni el rendimiento multilingue. Tampoco la longitud de contexto efectiva del checkpoint.
- La cuantizacion objetivo, con un 50% de bloques a INT1.58, es agresiva y cabe esperar degradacion de calidad frente al modelo base; no se cuantifica esa perdida en la informacion disponible.
- No se documentan sesgos, tasas de alineacion ni evaluaciones de seguridad para este checkpoint.
- Licencia Apache-2.0, heredada de Qwen/Qwen3-1.7B: permite uso comercial, pero conviene verificar los terminos del modelo base y del codigo del repositorio QAOPD.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa de su reproducibilidad.
- La fecha de publicacion indicada en los metadatos (septiembre de 2026) es posterior a la fecha actual; conviene tratarla como dato no verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-1.7B-W2.79-QAD
- Checkpoint recuperado W2.79-QAOPD: https://huggingface.co/MingZwhy/Qwen3-1.7B-W2.79-QAOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo y receta QAOPD: https://github.com/MingZwhy/QAOPD

Nota: las busquedas web realizadas no devolvieron ningun enlace relevante sobre este modelo, su autor o el proyecto QAOPD; los resultados obtenidos no guardaban relacion con la ficha.
