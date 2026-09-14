# Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r06

## Resumen

`Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r06` es un checkpoint de investigación publicado en HuggingFace por el usuario Jeesup, derivado de `meta-llama/Llama-2-7b-chat-hf`. No es un asistente conversacional destinado a producción: es un artefacto experimental cuyo objetivo es medir cómo la compresión mediante SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes permite repararlo con mayor eficacia.

El procedimiento aplicado consta de dos fases. Primero se comprime Llama-2-7b-chat con SVD-LLM hasta el 60,0% de los parámetros densos (40,02% de parámetros eliminados). Después se edita el modelo con 6 de las 10 rondas previstas de un esquema iterativo de intercambio neutro en parámetros (*parameter-neutral swap*), seleccionando los componentes mediante la regla `disc_iter`. Cada ronda restaura hasta el 0,1% de los parámetros densos, con una escala de inserción de 0,5 y semilla 42; en total se han intercambiado 38.822.656 parámetros (0,60% de los parámetros de proyección densos) y 3.692 componentes.

La relevancia del checkpoint es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión, aportando métricas de tasa de éxito de ataque (ASR) y de sobrerrechazo. La propia model card advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que este checkpoint concreto corresponde a una ronda intermedia de una ejecución más larga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama-2, derivado de `meta-llama/Llama-2-7b-chat-hf` con proyecciones comprimidas mediante SVD-LLM |
| Parametros totales | 6.738.415.616 según el recuento del repositorio; la model card declara una fraccion de parametros resultante de 0,5998 respecto al modelo denso |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama-2-7b-chat emplea 4096 tokens) |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas. Los pesos se distribuyen en safetensors y el repositorio ocupa 13,5 GB, consistente con precision FP16/BF16 |
| Idiomas soportados | no disponible en la model card (el modelo base esta entrenado predominantemente en ingles) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal, normalización RMSNorm y RoPE. Sobre esa base se aplica SVD-LLM, una técnica de compresión que descompone en valores singulares las matrices de proyección y elimina las direcciones de menor energía, reduciendo el rango efectivo de dichas matrices. En este checkpoint la compresión elimina el 40,02% de los parámetros densos, dejando una fracción declarada de 0,5998.

Sobre el modelo comprimido se aplica una edición posterior de pesos, no un reentrenamiento: un esquema iterativo de intercambio neutro en parámetros que restaura componentes y expulsa otros tantos siguiendo un criterio de evicción ordenado por sigma. Los componentes restaurados se seleccionan con la regla `disc_iter` y se insertan con un valor de inserción y una escala de 0,5, es decir, al 50% de su fuerza original. En total se han restaurado y expulsado 3.692 componentes por ronda, con 38.822.656 parámetros intercambiados hasta la ronda 6 de 10. No se documenta en la información disponible ninguna fase de RLHF, DPO o ajuste supervisado adicional sobre este checkpoint; se trata exclusivamente de una intervención sobre los pesos del modelo comprimido.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, con la degradación propia de la compresión y de la edición de pesos aplicadas.
- Razonamiento de propósito general y respuesta a instrucciones en el rango esperable para un modelo de 7B de la familia Llama-2, sin garantías tras la compresión.
- Capacidad de seguimiento de diálogo multiturno en formato chat, siempre que se aplique la plantilla de Llama-2.
- Soporte de *tool calling* / *function calling*: no disponible; no se documenta en la model card ni forma parte de las capacidades nativas de Llama-2-7b-chat.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada en este checkpoint.
- Capacidades multilingües: no disponibles como dato declarado; el modelo base está orientado principalmente al inglés.
- Capacidad especial: el checkpoint incorpora una edición orientada a la seguridad (recuperación parcial de comportamiento seguro tras la compresión), medida con ASR de AdvBench y StrongREJECT y con sobrerrechazo macro según WildGuard.
- No dispone de visión, audio ni modo de razonamiento explícito (*thinking mode*).

## Casos de uso

- Estudio de la degradación de seguridad bajo compresión: usar este checkpoint como sujeto experimental para cuantificar cuánto aumenta la tasa de éxito de ataque al reducir parámetros con SVD-LLM, comparando el ASR de AdvBench (0,1135) y StrongREJECT (0,1374) con el del modelo denso de referencia.
- Evaluación de reglas de selección de componentes: la regla `disc_iter` puede contrastarse contra otras reglas de la rejilla experimental para determinar cuál repara mejor la seguridad por unidad de presupuesto de parámetros restaurados.
- Investigación en interpretabilidad de pesos: los 3.692 componentes restaurados y expulsados por ronda constituyen un conjunto identificable sobre el que estudiar qué direcciones del espacio de pesos están asociadas al comportamiento seguro.
- Análisis del compromiso seguridad-utilidad: las métricas de sobrerrechazo macro (0,1185 según WildGuard) permiten estudiar si la reparación de seguridad introduce rechazos excesivos en peticiones benignas.
- Reproducibilidad experimental: la semilla fija (42), la escala de inserción (0,5) y el reparto por rondas (0,1% de parámetros densos por ronda, presupuesto total del 1,0%) permiten replicar el procedimiento en otros modelos y tamaños.
- Docencia y divulgación técnica: sirve como ejemplo didáctico de pipeline de compresión más edición de pesos, y de cómo se diseñan y publican artefactos de investigación con procedencia detallada.
- Auditoría de checkpoints derivados: útil como caso de prueba para metodologías de evaluación de seguridad en modelos de terceros antes de autorizar su uso en un entorno corporativo.
- Pruebas de robustez de filtros de seguridad propios: al ser un modelo con seguridad degradada de forma conocida, permite calibrar clasificadores y guardarraíles externos frente a un atacante de capacidad limitada.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de seguridad y de rechazo:

| Metrica | Valor | Metodo de evaluacion |
|---|---|---|
| AdvBench ASR | 0,1135 | Juez de HarmBench |
| StrongREJECT ASR | 0,1374 | Juez de HarmBench |
| Sobrerrechazo macro | 0,1185 | WildGuard |

No se han publicado en la informacion disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) para este checkpoint, ni valores de referencia del modelo base o de otras celdas de la rejilla con los que comparar directamente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo de pesos, mas unos 2,1 GB de cache KV con contexto de 4096 tokens, lo que situa el total en torno a 16 GB.
- VRAM estimada en cuantizacion INT8: aproximadamente 6,7 GB de pesos mas cache KV, en torno a 9-10 GB.
- VRAM estimada en cuantizacion INT4: aproximadamente 3,4 GB de pesos mas cache KV, en torno a 6 GB. Estas cifras son derivadas del recuento de parametros y no de mediciones publicadas.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S cubren el modelo con holgura y permiten lotes grandes.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en FP16; en RTX 3060 12 GB, RTX 4070 y similares requerira cuantizacion a 8 o 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama previa conversion a GGUF, conversion que no se publica en el repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR AdvBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l2_remove40_swapdisc_a050_b010_r06`) | 6.738.415.616 segun repositorio; fraccion declarada 0,5998 | no disponible | 0,1135 | Llama 2 Community License | Publico en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base denso) | 6.738.415.616 (referencia) | no disponible en la informacion proporcionada | no disponible | Llama 2 Community License | Publico y ampliamente utilizado |
| Otras celdas de la misma rejilla experimental (otras reglas y presupuestos) | no disponible | no disponible | no disponible | Llama 2 Community License | No identificadas en la informacion disponible |

No se dispone de datos de rendimiento de alternativas comparables (por ejemplo, otros checkpoints comprimidos de la familia Llama-2 o modelos de 7B de proposito general) dentro de la informacion proporcionada, por lo que la comparacion queda limitada a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la model card indica explicitamente que es una celda de una rejilla experimental y que debe tratarse como sujeto de estudio, no como modelo de produccion.
- Seguridad degradada de forma consciente: la compresion por si sola eleva la tasa de exito de ataque, y varias ramas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- Este checkpoint corresponde a una ronda intermedia (6 de 10), por lo que no representa el resultado final del procedimiento de reparacion.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de fidelidad factual para este checkpoint; la compresion puede agravar el comportamiento generativo.
- Ambiguedad en el recuento de parametros: la model card declara una fraccion de 0,5998 respecto al modelo denso, mientras que el recuento de parametros del repositorio (6.738.415.616) coincide con el de Llama-2-7B denso. Conviene verificar la forma real de las matrices almacenadas antes de asumir un ahorro de memoria.
- Idiomas: no se declara soporte multilingue y el modelo base esta orientado al ingles; el rendimiento en castellano no esta documentado.
- Contexto: no se especifica en la model card; se hereda del modelo base, con la incertidumbre sobre si la compresion afecta al comportamiento en contextos largos.
- Licencia: uso vinculado a la Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y el uso del derivado queda sujeto a ambos. Existen restricciones de uso comercial y de finalidad propias de dicha licencia.
- Ausencia de validacion externa: el repositorio no tiene descargas ni likes, y no se han encontrado evaluaciones independientes en la busqueda realizada.
- Uso dual: un checkpoint con seguridad degradada puede emplearse con fines malintencionados; cualquier despliegue o publicacion derivada deberia acompanarse de evaluacion de seguridad propia.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia y politica de uso incluidos en el repositorio: `LICENSE.txt` y `USE_POLICY.md`
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces recuperados corresponden a paginas de ayuda de Google Translate y Google Business, sin relacion con el checkpoint. No se dispone, por tanto, de papers, blogs, repositorios de codigo ni demos adicionales que documenten este modelo.
