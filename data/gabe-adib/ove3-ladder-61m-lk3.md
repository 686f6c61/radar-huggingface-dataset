# gabe-adib/ove3-ladder-61m-lk3

## Resumen

ove3-ladder-61m-lk3 es un checkpoint de investigación publicado por el usuario gabe-adib en HuggingFace. Se trata de una de las ejecuciones de la «intervention ladder» del proyecto ove3, concretamente una de las ramas K3 LatentMoE: un modelo de mezcla de expertos (MoE) con atención de tipo kimi_linear y 61M de parámetros activos, en el que la capa LatentMoE se dimensiona imitando la configuración de Kimi K3 (512 expertos de media anchura, enrutamiento top-16). El resto de la receta corresponde a la celda IsoFLOP de 61M del proyecto: mismos datos, misma tasa de aprendizaje, mismo tamaño de lote y mismo número de pasos.

El modelo no se distribuye como un modelo listo para inferencia, sino como el artefacto completo de un experimento de entrenamiento: el repositorio contiene el checkpoint distribuido de Megatron en su estado best_1 (iteración 17.290, con estado del optimizador incluido), los registros de entrenamiento y de scoring, los eventos de TensorBoard y el `config.yaml` de la ejecución. El autor reporta una pérdida de validación de 1,1089 y una pérdida held-out de 1,1989 nats/char, ponderada por mezcla sobre 9 dominios.

Su relevancia es, por tanto, experimental y no de producto: sirve para reproducir y auditar una ablación concreta de arquitectura MoE a pequeña escala (enrutamiento top-16 sobre 512 expertos), para estudiar el comportamiento de las recetas de scalings y para comparar ramas de la misma escalera de intervenciones. No hay información publicada sobre licencia, idiomas, longitud de contexto ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención kimi_linear y capa LatentMoE (512 expertos de media anchura, top-16); detalles completos de capas y dimensión no disponibles |
| Parametros totales | no disponible |
| Parametros activos | 61M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint distribuido de Megatron; no hay versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | checkpoint distribuido de Megatron con estado del optimizador; no safetensors ni GGUF |
| Tamano del repositorio | 9,9 GB (incluye checkpoint, logs y eventos de TensorBoard) |
| Checkpoint publicado | best_1, iteración 17.290 |
| Hiperparametros declarados | RMSNorm eps 1e-5, router scaling 1.0, semilla 1234 |
| Fecha de creacion / actualizacion | 2026-10-17 / 2026-10-17 |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con atención kimi_linear y una capa LatentMoE configurada con 512 expertos de media anchura y enrutamiento top-16, es decir, cada token activa 16 de los 512 expertos. La normalización RMSNorm emplea epsilon 1e-5 y el escalado del router es 1.0. El autor indica que el modelo se dimensiona «como Kimi K3» en lo relativo a la capa LatentMoE, mientras que el resto de la receta (datos, tasa de aprendizaje, lote y pasos) corresponde a la celda IsoFLOP de 61M del proyecto ove3. No se especifican en la información disponible el número de capas, la dimensión oculta, el tokenizador ni el mecanismo exacto de kimi_linear.

El entrenamiento se realizó con Megatron y se distribuye el estado completo: checkpoint best_1 en la iteración 17.290, estado del optimizador, registros de entrenamiento divididos en segmentos de 4 horas, registros de scoring y eventos de TensorBoard. El autor reporta pérdida de validación de 1,1089 en ese paso y pérdida held-out de 1,1989 nats/char, ponderada por mezcla sobre 9 dominios, con el desglose por dominio en `DOMAIN_NLL.txt`. La métrica en nats por carácter sugiere modelado a nivel de carácter. No se documentan en la información disponible el volumen de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste instructivo.

## Capacidades

- Modelado de lenguaje autorregresivo a nivel de carácter, según se deduce de la métrica en nats/char reportada por el autor.
- Generación de texto como modelo base: no se documenta ajuste instructivo, por lo que no hay garantía de seguir instrucciones ni de mantener formato conversacional.
- Enrutamiento MoE con top-16 sobre 512 expertos, útil para estudiar utilización de expertos y equilibrio de carga.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en el repositorio).
- Visión, audio u otras modalidades: no disponible; el repositorio no contiene componentes multimodales.
- Capacidad especial de «thinking mode»: no disponible.

## Casos de uso

- Reproducción de la escalera de intervenciones de ove3: el checkpoint permite reanudar o auditar una rama concreta (K3 LatentMoE) con los mismos datos, tasa de aprendizaje, lote y pasos que la celda IsoFLOP de 61M, y comparar la pérdida held-out con las demás ramas.
- Estudio de enrutamiento MoE: con 512 expertos y top-16 se pueden analizar patrones de activación, colapso de expertos y efecto del router scaling fijo a 1.0 sobre la pérdida de validación, usando los logs y eventos de TensorBoard incluidos.
- Investigación sobre LatentMoE a pequeña escala: la configuración de 61M de parámetros activos permite iterar sobre dimensionado de expertos y número de expertos con un coste de cómputo reducido antes de escalar la receta.
- Experimentos de modelado a nivel de carácter: la pérdida en nats/char y la mezcla ponderada sobre 9 dominios facilitan usos en entornos con tokenizadores poco adecuados (dominios técnicos, código, datos con ortografía irregular).
- Docencia y formación en entrenamiento distribuido: el repositorio incluye config.yaml, logs por segmentos de 4 horas y eventos de TensorBoard, lo que lo convierte en material didáctico para estudiar un ciclo completo de entrenamiento con Megatron.
- Punto de partida para ajuste fino controlado: al ser un modelo base de 61M de parámetros activos, sirve como inicialización para experimentos de ajuste fino con presupuesto limitado, siempre que se realice antes la conversión desde el formato Megatron.
- Comparación de recetas de datos: la métrica held-out ponderada por 9 dominios permite contrastar esta ejecución con otras del mismo proyecto, como la serie data-constrained con 120B tokens únicos, para aislar el efecto de la arquitectura frente al de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de pérdida del entrenamiento y de validación:

| Metrica | Valor | Nota |
|---|---|---|
| Pérdida de validación (lm loss, iteración 17.290) | 1,1089 | mejor paso de validación según el autor (checkpoint best_1) |
| Pérdida held-out | 1,1989 nats/char | media ponderada por mezcla sobre 9 dominios; desglose en `DOMAIN_NLL.txt` |
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | no disponible | no se han publicado en la información disponible |

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma oficial. El repositorio ocupa 9,9 GB porque incluye el estado del optimizador y los logs; el peso de inferencia es sustancialmente menor, pero el número de parámetros totales no se publica, por lo que no se puede dar una cifra fiable.
- Estimación orientativa: con 61M de parámetros activos, la ruta activa en bf16 rondaría 0,12 GB, a lo que habría que sumar los parámetros totales del MoE (512 expertos), no declarados. Cualquier cifra concreta de VRAM sería especulativa.
- GPU recomendadas: no disponible. Por tamaño de la ruta activa, el modelo podría ejecutarse en GPU de consumo (por ejemplo, RTX 4090 o superiores) una vez convertido, pero esto no está verificado por el autor y depende del total de parámetros.
- Despliegue: el artefacto es un checkpoint distribuido de Megatron, por lo que requiere Megatron-LM o una herramienta de conversión a safetensors/HuggingFace antes de usar vLLM, TGI, llama.cpp u Ollama. La arquitectura kimi_linear con LatentMoE no es estándar, por lo que la conversión a GGUF requeriría trabajo específico.
- Latencia y throughput: no disponible.
- Almacenamiento: 9,9 GB para el repositorio completo; conviene planificar espacio adicional para la conversión y para el modelo convertido.

## Comparativa con modelos similares

| Modelo | Parametros activos | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ove3-ladder-61m-lk3 (este modelo) | 61M | no disponible | 1,1989 nats/char held-out (9 dominios) | no disponible | checkpoint Megatron en HF |
| ove3-dc-61m-u120b-r2-wd0.1 | 61M | no disponible | 1,1373 nats/char held-out (8 dominios), 240B tokens vistos | no disponible | checkpoint Megatron en HF (iteración 28.610) |
| Otros modelos de la misma clase de tamano (por ejemplo, modelos base de 50-150M) | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables en la información disponible es con la ejecución hermana ove3-dc-61m-u120b-r2-wd0.1, que comparte los 61M de parámetros activos y la arquitectura kimi_linear MoE, pero difiere en la receta de datos (120B tokens únicos por 2 épocas) y en el weight decay (0,1). No se han encontrado en la búsqueda web datos de benchmarks que permitan comparar con modelos de la misma categoría de terceros.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir uso comercial; hay que contactar con el autor o tratar el modelo como uso exclusivamente de investigación.
- Sin modelo instructivo: es un modelo base, sin对齐 ni ajuste por instrucciones, por lo que puede producir texto incoherente o fuera de formato y no es apto para aplicaciones de usuario final sin un ajuste posterior.
- Tamano muy reducido: con 61M de parámetros activos, la calidad factual es limitada y el riesgo de alucinación en tareas de conocimiento es alto.
- Modelado a nivel de carácter: los resultados pueden presentar errores ortográficos, espaciado irregular y dificultades para seguir convenciones de formato, según se deduce de la métrica en nats/char.
- Idiomas no declarados: no hay información sobre cobertura multilingüe; no se debe asumir buen rendimiento en castellano.
- Contexto desconocido: se desconoce la ventana máxima; usarlo con secuencias largas puede dar resultados inválidos.
- Procedencia de datos no documentada: no se especifica la composición del dataset ni los filtros aplicados, por lo que no se pueden evaluar sesgos ni contaminación de benchmarks.
- Formato no listo para producción: el checkpoint distribuido de Megatron incluye estado del optimizador; requiere conversión y validación antes de cualquier despliegue.
- Reproducibilidad dependiente del código: los logs y el config.yaml permiten reproducir, pero no se indica la versión de Megatron ni el commit del código de entrenamiento.
- Fechas del repositorio en 2026: conviene verificar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gabe-adib/ove3-ladder-61m-lk3
- Perfil del autor: https://huggingface.co/gabe-adib
- Ejecución hermana de la serie ove3 (data-constrained, 61M): https://huggingface.co/gabe-adib/ove3-dc-61m-u120b-r2-wd0.1
- Papers, blogs, repositorios o demos asociados: no disponible (la búsqueda web no devolvió documentación técnica del proyecto ove3; los resultados adicionales correspondían a productos no relacionados como Veo 3 de Google y Gemini).
