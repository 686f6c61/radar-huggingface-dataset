# Jeesup/svd-safety-l3_swift_remove40_swapgapiter_b010

## Resumen

`Jeesup/svd-safety-l3_swift_remove40_swapgapiter_b010` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta el 60,0 % de los parámetros densos y posteriormente editado con 10 de 10 rondas iterativas de sustitución de parámetros neutra en parámetros ("parameter-neutral swap"), seleccionadas por la regla `gap_iter`. Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño.

El modelo no es un asistente de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de restauración. La model card lo declara explícitamente como sujeto de estudio, y advierte de que varias celdas de la misma rejilla están deliberadamente degradadas en seguridad. Su interés actual es metodológico: cuantificar el trade-off entre seguridad y utilidad bajo compresión, y evaluar si la restauración selectiva de componentes revierte la pérdida de alineamiento.

Arquitectura transformer decoder-only de la familia Llama 3, con aproximadamente 8.030 millones de parámetros almacenados en safetensors y una fracción de parámetros resultante declarada de 0,6003. El repositorio ocupa 16,1 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con proyecciones comprimidas mediante SVD-LLM |
| Parametros totales | 8.030.261.248 (recuento de safetensors); fracción de parámetros resultante declarada por el autor: 0,6003 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base es Llama-3-8B-Instruct) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin versiones cuantizadas |
| Idiomas soportados | No disponibles |
| Licencia | Meta Llama 3 Community License (`llama3`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 3 con 8.030 millones de parámetros. Sobre ese checkpoint se aplica compresión SVD-LLM, que factoriza en rango reducido las matrices de proyección y elimina el 39,97 % de los parámetros, dejando el modelo en una fracción de 0,6003 respecto al denso. Después se ejecutan 10 rondas iterativas de sustitución de parámetros: en cada ronda se restauran y se expulsan 11.077 componentes (69.678.080 parámetros en total, el 1,00 % de los parámetros de proyección densos), con un presupuesto de 0,100 % de parámetros densos por ronda y un valor de sustitución `insert` (solo valor de inserción, con desalojo ordenado por sigma). La regla de selección empleada es `gap_iter` y la semilla es 42.

No hubo un entrenamiento adicional con RLHF o DPO en esta celda: se trata de una edición post-hoc de pesos sobre un modelo ya instruido. La innovación técnica es precisamente el mecanismo de reparación (swap iterativo neutro en parámetros guiado por una regla de selección), no una arquitectura nueva. Los autores enmarcan el resultado dentro de un estudio de interpretabilidad y seguridad, con el objetivo de medir qué componentes conviene restaurar tras una compresión agresiva.

## Capacidades

- Generación de texto conversacional heredada del checkpoint base Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión (perplejidad en WikiText-2 de 97,3287).
- Comportamiento de seguridad medible: el autor reporta ASR de 0,0077 en AdvBench y 0,0192 en StrongREJECT, ambos con juez de HarmBench.
- Funciona como sujeto experimental para estudiar rechazo excesivo: macro over-refusal de 0,6149 según WildGuard, lo que indica una tendencia alta a rechazar peticiones benignas.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo "thinking": no documentado en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control para medir cuánta seguridad se pierde al eliminar el 39,97 % de los parámetros densos mediante SVD-LLM, comparando contra otras celdas de la misma rejilla.
- Evaluación de robustez frente a jailbreaks: con ASR de 0,0077 en AdvBench y 0,0192 en StrongREJECT, permite analizar cómo responde un modelo comprimido y parcialmente restaurado ante ataques adversariales estandarizados.
- Estudio del trade-off seguridad/utilidad: el par (ASR bajo, over-refusal de 0,6149) es un caso de análisis para investigar si la restauración de componentes recupera seguridad a costa de rechazar en exceso.
- Comparación de reglas de selección de componentes: la regla `gap_iter` puede contrastarse frente a otras reglas de la rejilla para determinar cuál repara mejor el comportamiento de seguridad con el mismo presupuesto del 1,00 %.
- Medición de degradación de fluidez: la perplejidad de 97,3287 en WikiText-2 permite cuantificar el coste en modelado de lenguaje de la compresión más la edición iterativa.
- Reproducibilidad metodológica: con semilla 42 y presupuestos documentados (10 rondas, 0,100 % por ronda, 11.077 componentes por ronda), el checkpoint permite replicar el experimento y auditar el pipeline de compresión y swap.
- Docencia e interpretabilidad: útil para explicar en un aula o laboratorio cómo la factorización SVD afecta a componentes concretos y cómo se puede intervenir sobre ellos sin reentrenar.

## Benchmarks y rendimiento

Métricas reportadas por el autor en la model card. No se proporcionan valores de referencia del modelo base ni de otras celdas de la rejilla, por lo que no es posible calcular deltas.

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0077 |
| StrongREJECT ASR (juez HarmBench) | 0,0192 |
| Macro over-refusal (WildGuard) | 0,6149 |
| Perplejidad en WikiText-2 | 97,3287 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en el formato distribuido (safetensors, ~16,1 GB de repositorio) se necesitan aproximadamente 16-17 GB solo para pesos, más memoria para caché KV y activaciones.
- GPU recomendadas: A100 (40 GB o 80 GB), H100 y, en el límite, tarjetas de 24 GB como la RTX 4090 o la RTX 3090, siempre que se ajuste el tamaño de batch y la longitud de contexto.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB (RTX 4090, RTX 3090) con margen reducido; en GPUs de 16 GB o menos no cabría sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue: `transformers` (librería declarada) y text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). No se publican ficheros GGUF, por lo que el uso directo con llama.cpp u Ollama exigiría una conversión propia.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Advertencia de despliegue: al tratarse de pesos con estructura comprimida (factores SVD) y componentes sustituidos, la compatibilidad con motores de inferencia distintos de los declarados no está documentada y debería validarse antes de usarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_swift_remove40_swapgapiter_b010 | 8.030.261.248 almacenados; fracción 0,6003 declarada | No disponible | ASR AdvBench 0,0077; ASR StrongREJECT 0,0192; over-refusal 0,6149; perplejidad WikiText-2 97,3287 | Meta Llama 3 Community License | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | ~8.030 millones | No disponible en la información proporcionada | No disponible en la información proporcionada | Meta Llama 3 Community License | Público en HuggingFace |
| Otras celdas de la rejilla del mismo estudio (otras reglas y presupuestos) | No disponible | No disponible | No disponible | Meta Llama 3 Community License | Referenciadas solo implícitamente en la model card |

No se dispone de datos de benchmarks comparables de otros modelos de compresión (por ejemplo, otras variantes de SVD-LLM) en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente desplegable: la propia model card lo describe como artefacto de investigación y sujeto experimental, no como modelo de chat de propósito general.
- Varias celdas de la misma rejilla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque, así que no debe asumirse que esta celda sea segura en producción.
- Over-refusal elevado: 0,6149 de macro over-refusal según WildGuard, lo que implica rechazos frecuentes ante peticiones legítimas.
- Degradación de fluidez: perplejidad de 97,3287 en WikiText-2, muy superior a la de un modelo denso no comprimido, con impacto directo en la calidad de generación.
- Riesgo de alucinación: no cuantificado en la información proporcionada, pero esperable al alza dado el nivel de compresión y la pérdida de capacidad de modelado.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe equivalente al del modelo base.
- Restricciones de licencia: Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial y la redistribución quedan sujetos a esas condiciones y a las obligaciones de atribución ("Built with Meta Llama 3").
- Antes de extraer cualquier conclusión hay que evaluar el checkpoint por cuenta propia, tal como indica el autor.
- No se publican cuantizaciones, por lo que el despliegue en hardware limitado requiere trabajo adicional de conversión y validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove40_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Paper de SVD-LLM (referencia metodológica citada en la model card, enlace no incluido en la información proporcionada): no disponible
- Repositorio del estudio, blog del autor o demos: no disponibles en la información proporcionada
