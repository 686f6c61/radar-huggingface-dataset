# Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r08

## Resumen

`Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r08` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`. No es un modelo conversacional de propósito general, sino una celda concreta de una rejilla experimental que estudia cómo la compresión por SVD daña el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El modelo se comprime con SVD-LLM eliminando el 40,02% de los parámetros densos (fracción resultante de 0,5998) y después se edita con 8 de 10 rondas iterativas de *parameter-neutral swap* seleccionadas por la regla `gap_iter`, con un presupuesto de restauración del 1,000% de los parámetros densos (0,100% por ronda).

El resultado es un transformer decoder-only de 8.030.261.248 parámetros en safetensors, con 55.803.904 parámetros sustituidos (0,80% de los parámetros de proyección densos), 8.885 componentes restaurados y 8.885 expulsados, semilla 42. El repositorio ocupa 16,1 GB y acumula 174 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.

Su relevancia es metodológica, no de producto: cuantifica el *trade-off* entre seguridad y utilidad bajo compresión agresiva. La model card advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base, y que este checkpoint concreto es un sujeto experimental que debe evaluarse antes de extraer conclusiones. Las únicas métricas publicadas son de seguridad (AdvBench ASR y StrongREJECT ASR, ambas 0,0000; *macro over-refusal* de 0,6547 con WildGuard), sin ninguna evaluación de capacidades generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), heredada de Meta-Llama-3-8B-Instruct; sin cambios estructurales declarados |
| Parametros totales | 8.030.261.248 (recuento real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; 8.192 tokens heredados del modelo base (no confirmado por el autor) |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo contiene pesos safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible en la model card (el modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3 Community License (`license: llama3`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors |
| Fraccion de parametros densos tras compresion | 0,5998 (eliminado el 40,02% con SVD-LLM) |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos (0,100% por ronda) |
| Componentes restaurados / expulsados | 8.885 / 8.885 |
| Parametros sustituidos | 55.803.904 (0,80% de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; expulsion ordenada por sigma) |
| Rondas iterativas aplicadas | 8 de 10 |
| Semilla | 42 |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Tamano del repositorio | 16,1 GB |
| Libreria y pipeline | transformers; text-generation |
| Descargas / likes | 174 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3 8B Instruct sin modificaciones declaradas en la model card: transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU. La intervención no es un reentrenamiento, sino una edición de pesos en dos fases. Primero se aplica SVD-LLM, que descompone en valores singulares las matrices de proyección y trunca componentes hasta eliminar el 40,02% de los parámetros densos. Después se ejecuta un bucle de *parameter-neutral swap*: en cada ronda se restauran 8.885 componentes y se expulsan otros tantos, de modo que el recuento de parámetros permanece constante. La regla `gap_iter` decide qué componentes entran, usando únicamente el valor de inserción y una política de expulsión ordenada por sigma.

El checkpoint corresponde a la ronda 8 de un run de 10, es decir, a un estado intermedio con un presupuesto consumido del 0,80% (sobre el 1,0% previsto). No hay datos en la información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; al derivar de un modelo ya instruido, hereda el alineamiento del base, pero la model card no documenta ningún proceso de ajuste adicional. Tampoco se detalla si la compresión conserva las formas tensoriales originales: el recuento de safetensors coincide con el del checkpoint denso (8,03 mil millones), mientras que la fracción declarada de parámetros densos es 0,5998, por lo que la reducción de rango puede no reflejarse en el número de tensores almacenados. Tampoco se mencionan innovaciones de decodificación (especulativa, atención lineal) ni optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Meta-Llama-3-8B-Instruct.
- Sujeto experimental para medir seguridad: las métricas publicadas son de ataque y rechazo, no de tareas.
- Edición de comportamiento mediante *parameter-neutral swap* con restauración selectiva de componentes.
- No se publican evaluaciones de razonamiento, código, matemáticas o visión; no disponible.
- Soporte de *tool calling* / *function calling*: no verificado en este checkpoint (el modelo base lo soporta en su plantilla de chat).
- Soporte de agentes y razonamiento multi-paso: no evaluado; no disponible.
- Capacidades multilingües: no evaluadas; la model card no declara idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; el checkpoint no incluye torres multimodales.
- Comportamiento de rechazo: *macro over-refusal* de 0,6547 medido con WildGuard, indicativo de una tasa elevada de rechazos en peticiones benignas.

## Casos de uso

- Investigación sobre seguridad bajo compresión: reproducir la medición de AdvBench ASR y StrongREJECT ASR con HarmBench como juez para cuantificar cuánto eleva la tasa de éxito de ataque una compresión al 60% de los parámetros densos, y cuánto la repara la edición posterior.
- Comparación de reglas de selección de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, sirve como punto de referencia frente a otras reglas distintas de `gap_iter` bajo el mismo presupuesto de 1,0%.
- Calibración del coste en utilidad de las intervenciones de seguridad: el valor de *macro over-refusal* de 0,6547 permite medir cuánto rechazo sobrante introduce la reparación en peticiones legítimas, usando WildGuard como clasificador.
- Auditoría previa de pipelines de compresión: antes de desplegar una versión comprimida de un asistente, usar este checkpoint como control negativo que demuestra que la compresión por SVD puede degradar las salvaguardas aunque el recuento de parámetros apenas cambie.
- Evaluación comparativa de jueces automáticos: mantener el checkpoint fijo como sujeto y contrastar las tasas de éxito de ataque obtenidas por distintos clasificadores de seguridad (HarmBench frente a WildGuard) para medir el desacuerdo entre jueces.
- Estudio de la edición de parámetros como técnica de reparación: analizar el efecto de restaurar el 0,80% de los parámetros de proyección sobre el comportamiento de seguridad, ronda a ronda, con la semilla 42 fijada para garantizar reproducibilidad.
- Análisis de interpretabilidad: localizar los 8.885 componentes restaurados en cada ronda para identificar subespacios de pesos asociados a comportamiento de rechazo.
- Docencia y experimentación controlada: servir como ejemplo reproducible de cómo un artefacto comprimido puede tener métricas de seguridad aparentemente perfectas (ASR 0,0000) mientras su utilidad conversacional permanece sin caracterizar.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0000 | HarmBench judge |
| StrongREJECT ASR | 0,0000 | HarmBench judge |
| Macro over-refusal | 0,6547 | WildGuard |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se publican comparaciones con el modelo base ni con otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para pesos en FP16 (2 bytes por parámetro sobre 8.030.261.248 parámetros): aproximadamente 16,06 GB, coherente con el tamaño del repositorio (16,1 GB). Estimación derivada, no publicada por el autor.
- VRAM estimada en INT8: alrededor de 8,0 GB solo para pesos; en INT4: alrededor de 4,0 GB. Son estimaciones aritméticas, no configuraciones verificadas para este checkpoint.
- Caché KV a 8.192 tokens en FP16: aproximadamente 1 GiB con la configuración GQA del modelo base (32 capas, 8 cabezas KV, dimensión de cabeza 128). Estimación derivada.
- VRAM total recomendada en FP16: 18-20 GB incluyendo caché KV y activaciones, es decir, viable en RTX 4090, RTX 3090, A100 40 GB, H100 y L40S.
- En GPUs de 24 GB (RTX 3090, RTX 4090) cabe en FP16 con contexto completo; en GPUs de 16 GB (RTX 4080, A4000) requiere cuantización a 8 bits o recortar contexto.
- En GPUs de consumo de 8-12 GB (RTX 3070, RTX 4060 Ti) solo es viable con cuantización a 4 bits.
- Opciones de despliegue confirmadas por las etiquetas del repositorio: `transformers`, `text-generation-inference` (TGI) y `endpoints_compatible` (Hugging Face Inference Endpoints).
- Compatibilidad con vLLM, llama.cpp u Ollama: no confirmada en la model card; conviene verificar que las formas tensoriales tras la compresión por SVD las aceptan estos motores.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove40_swapgapiter_b010_r08 | 8.030.261.248 (fraccion densa 0,5998) | no especificado (8.192 heredados del base) | AdvBench ASR 0,0000; StrongREJECT ASR 0,0000; over-refusal 0,6547 | Llama 3 Community License | Hugging Face, 174 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct (base) | 8.030.261.248 | 8.192 tokens | no disponible en la informacion proporcionada | Llama 3 Community License | Hugging Face |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | no disponible | Llama 3 Community License | Hugging Face (referencias no incluidas en la informacion) |

No se dispone de datos de benchmarks ni de parametros de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con opciones como Llama-3.1-8B-Instruct u otros modelos de 7-8B. La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo ni sobre la rejilla a la que pertenece.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la propia model card indica que debe tratarse como sujeto experimental y evaluarse antes de sacar conclusiones.
- Varias celdas de la rejilla estan deliberadamente degradadas en seguridad; la compresion por si sola eleva la tasa de exito de ataque, aunque esta celda concreta reporte ASR 0,0000.
- Sobre-rechazo elevado: un valor de *macro over-refusal* de 0,6547 con WildGuard sugiere que el modelo rechaza una proporcion considerable de peticiones benignas, lo que limita su utilidad conversacional.
- Ausencia total de evaluacion de capacidades: no hay datos de MMLU, HumanEval, GSM8K ni de calidad de generacion, por lo que se desconoce el dano colateral de la compresion en tareas generales.
- Idiomas soportados no declarados en la model card; el comportamiento multilingue tras la compresion y la edicion no esta caracterizado.
- Riesgo de alucinacion no medido para este checkpoint; al derivar de un modelo instruido, persiste el riesgo habitual, agravado por la posible perdida de informacion de la compresion.
- Licencia Llama 3 Community License: el uso comercial queda sujeto a las restricciones de Meta, incluida la obligacion de incluir el aviso "Built with Meta Llama 3" y de conservar `LICENSE` y `USE_POLICY.md`.
- Validacion comunitaria minima: 174 descargas y 0 likes, sin issues ni discusion documentada en la informacion disponible.
- Estado intermedio: es la ronda 8 de 10, no el resultado final del run, por lo que sus metricas no representan el punto de convergencia del experimento.
- Discrepancia entre el recuento de parametros de safetensors (8,03 mil millones, identico al denso) y la fraccion de parametros densos declarada (0,5998): conviene verificar la estructura real de los tensores antes de asumir una reduccion de memoria.
- Contexto maximo no confirmado por el autor; si se asume el del modelo base, 8.192 tokens, queda por debajo de alternativas actuales con ventanas de 128.000 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Ficheros de licencia y politica de uso incluidos en el repositorio: `LICENSE` y `USE_POLICY.md`
- Paper, blog, repositorio o demo asociados: no disponible; la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, sobre SVD-LLM aplicado a seguridad ni sobre la rejilla experimental del autor.
