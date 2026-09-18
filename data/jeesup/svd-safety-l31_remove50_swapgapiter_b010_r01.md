# Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r01

## Resumen

Este checkpoint es un artefacto de investigacion derivado de `meta-llama/Llama-3.1-8B-Instruct`, comprimido con la tecnica SVD-LLM hasta eliminar el 50,03 % de los parametros densos y despues editado parcialmente mediante una regla de seleccion de componentes denominada `gap_iter`. La edicion consiste en un intercambio iterativo de parametros con presupuesto neutro (*parameter-neutral swap*): en esta celda se han restaurado 1311 componentes sustituyendo otros tantos, con 6.972.416 parametros reinsertados (0,10 % de los parametros de proyeccion densos). Corresponde a la ronda 1 de 10 de una ejecucion mas larga, por lo que es un checkpoint intermedio, no el resultado final del presupuesto de restauracion.

El proposito declarado por el autor es estudiar como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. No es un modelo de chat de proposito general: la propia model card advierte que varias celdas de la rejilla experimental estan deliberadamente degradadas en seguridad y que este checkpoint debe tratarse como sujeto de experimentacion.

La relevancia actual es metodologica: cuantifica el compromiso entre seguridad y utilidad en pipelines de compresion de LLM. Las metricas publicadas (52,50 % de tasa de exito de ataque en AdvBench, 43,50 % en StrongREJECT y 19,14 % de sobre-rechazo macro medido con WildGuard) sitúan el comportamiento de seguridad muy por debajo del modelo base sin comprimir, lo que lo convierte en material de referencia para estudiar reparaciones post-compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), heredada de `meta-llama/Llama-3.1-8B-Instruct` |
| Parametros totales | 8.030.261.248 (recuento de safetensors); fraccion de parametros densos resultante: 0,4997 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct; no se documenta cambio en la model card) |
| Tipos de cuantizacion | No disponible. El repositorio publica safetensors (16,1 GB), compatible con ~16 bits por parametro en precision nativa. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la informacion proporcionada (heredados del modelo base, no documentados por el autor) |
| Licencia | Llama 3.1 Community License (`LICENSE` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors, libreria `transformers` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por grupos (GQA) y normalizacion RMSNorm, sin modificaciones estructurales documentadas por el autor. La intervencion no es un reentrenamiento sino una edicion de pesos: primero se aplica SVD-LLM para truncar el rango de las matrices de proyeccion (50,03 % de parametros densos eliminados), y despues se ejecuta un procedimiento iterativo de intercambio de parametros con presupuesto neutro, es decir, cada componente restaurado desplaza a otro con el mismo coste de parametros. La eviction sigue un orden basado en valores singulares (*sigma-ordered eviction*) y el valor de intercambio aplicado es `insert`.

En esta celda concreta se aplico 1 ronda de 10 con la regla de seleccion `gap_iter`, con un trozo de 0,100 % de los parametros densos por ronda y semilla 42. Los 1311 componentes restaurados equivalen a 6.972.416 parametros de proyeccion reinsertados. La ejecucion completa de 10 rondas tendria un presupuesto de restauracion de 1,0 % de los parametros densos. No se documentan datos de entrenamiento adicionales, composicion del dataset, ni fases de RLHF o DPO posteriores: el checkpoint es un producto de compresion y edicion, no de fine-tuning. Nota tecnica: el recuento de parametros de safetensors sigue siendo 8,03 B porque el truncamiento de rango reduce el rango efectivo de las matrices manteniendo sus dimensiones.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct.
- Razonamiento y generacion de codigo en la medida en que lo permita la degradacion por compresion (no se publican evaluaciones de capacidad general, solo metricas de seguridad).
- Comportamiento instruct y multi-turno, por herencia de Llama 3.1 8B Instruct.
- Soporte de tool calling / function calling: no documentado por el autor para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no documentadas.
- Capacidad especial de investigacion: es un sujeto experimental util para medir el efecto de la compresion SVD sobre la seguridad, el sobre-rechazo y el comportamiento de rechazo.

## Casos de uso

- Auditoria de seguridad post-compresion: usar las metricas de AdvBench y StrongREJECT publicadas como linea base para comparar otras tecnicas de compresion o de reparacion de seguridad, manteniendo constante el modelo base y la semilla.
- Estudio del sobre-rechazo: la metrica de 19,14 % de sobre-rechazo macro (WildGuard) permite analizar si una intervencion de reparacion de seguridad degrada en exceso la utilidad conversacional; este checkpoint sirve como punto de comparacion de ese equilibrio.
- Reproducibilidad experimental: con semilla 42, regla `gap_iter` y presupuesto por ronda de 0,100 %, permite replicar la ronda 1 de la rejilla y verificar la metodologia de intercambio parameter-neutral.
- Investigacion sobre reglas de seleccion de componentes: comparar `gap_iter` frente a otras reglas de seleccion del mismo estudio para determinar cual recupera mejor el comportamiento de rechazo con el mismo coste de parametros.
- Evaluacion de pipelines de jueces automaticos: los resultados publicados se obtuvieron con HarmBench como juez y WildGuard para sobre-rechazo, por lo que el checkpoint es util para calibrar y depurar dichos evaluadores en un caso con tasa de ataque conocida.
- Analisis de degradacion por truncamiento de rango: al ser un checkpoint intermedio (ronda 1 de 10), permite trazar curvas de recuperacion frente al numero de rondas sin necesidad de reejecutar la compresion completa.
- Red-teaming academico: sirve como modelo deliberadamente vulnerable para entrenar y validar clasificadores de contenido danino o clasificadores de rechazo en condiciones controladas.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / evaluador |
|---|---|---|
| AdvBench ASR | 0,5250 | HarmBench judge |
| StrongREJECT ASR | 0,4350 | HarmBench judge |
| Sobre-rechazo macro | 0,1914 | WildGuard |

No se han publicado en la informacion disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros). Las unicas cifras disponibles son las tres metricas de seguridad y utilidad de rechazo de la tabla anterior. No se proporcionan los valores equivalentes del modelo base sin comprimir, por lo que no es posible calcular la delta de degradacion a partir de esta ficha.

## Requisitos de hardware

- VRAM para inferencia en precision nativa: aproximadamente 16,1 GB solo de pesos; con cache KV y overhead del runtime, entre 18 y 22 GB para contextos moderados.
- Cache KV: para la configuracion de Llama 3.1 8B (GQA con 8 cabezas KV), el coste estimado es de unos 128 KiB por token en FP16, es decir, cerca de 1 GB con 8.192 tokens, 4 GB con 32.768 tokens y unos 16 GB con los 128.000 tokens maximos. Los contextos largos son, por tanto, el principal consumidor de memoria.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para precision nativa con contexto largo. Para contexto corto, RTX 4090 o RTX 3090 (24 GB) son suficientes en BF16.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 4090, RTX 3090) en BF16 con contexto moderado. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requeriria cuantizacion a 8 bits (aproximadamente 9-10 GB de pesos); en 12 GB (RTX 3060) haria falta cuantizacion a 4 bits (aproximadamente 5-6 GB de pesos).
- Opciones de despliegue: `transformers` de forma nativa; text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`); vLLM para servir safetensors con PagedAttention. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que el autor no publica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l31_remove50_swapgapiter_b010_r01`) | 8,03 B en safetensors; fraccion densa 0,4997 | 128.000 tokens (heredado) | Llama 3.1 Community | AdvBench ASR 0,5250; StrongREJECT ASR 0,4350; sobre-rechazo 0,1914 | Publico en HuggingFace, safetensors |
| `meta-llama/Llama-3.1-8B-Instruct` (base sin comprimir) | 8,03 B | 128.000 tokens | Llama 3.1 Community | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | Llama 3.1 Community | No disponible | No localizadas en la busqueda realizada |

No se dispone de datos de benchmarks de capacidad general ni de otros modelos comparables de la misma categoria (compresiones SVD alternativas, destilaciones de 8B o variantes de Llama 3.1 8B) en la informacion proporcionada.

## Limitaciones y advertencias

- Seguridad degradada: la tasa de exito de ataque de 0,5250 en AdvBench y 0,4350 en StrongREJECT es propia de un modelo deliberadamente vulnerable. La propia model card indica que la compresion por si sola eleva la tasa de exito de ataque.
- No es un asistente desplegable: el autor lo describe explicitamente como artefacto de investigacion y objeto experimental, no como modelo de chat de proposito general.
- Sobre-rechazo elevado: 0,1914 de sobre-rechazo macro implica que el modelo rechaza peticiones benignas con una frecuencia considerable, lo que reduce su utilidad conversacional.
- Checkpoint intermedio: solo se ha aplicado 1 de 10 rondas del presupuesto total de restauracion (1,0 %), por lo que el comportamiento puede no representar el resultado final del estudio.
- Riesgo de alucinacion: no evaluado; cabe esperar que la degradacion por truncamiento de rango aumente la generacion de contenido incorrecto, pero no hay datos publicados.
- Idiomas y contexto: no se documentan idiomas soportados; la longitud de contexto es una herencia del modelo base y no ha sido validada tras la compresion.
- Restricciones de licencia: se aplica la Llama 3.1 Community License, con las obligaciones de atribucion ("Built with Llama"), la politica de uso aceptable (`USE_POLICY.md`) y la clausula de licencia comercial para entidades con mas de 700 millones de usuarios activos mensuales. El uso comercial de un derivado implica el cumplimiento integro de dicha licencia.
- Cualquier despliegue en produccion exigiria una evaluacion de seguridad propia e independiente antes de exponer el modelo a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community y politica de uso: incluidas como `LICENSE` y `USE_POLICY.md` en el repositorio del modelo.
- Paper de la tecnica de compresion SVD-LLM, repositorio del autor y demos: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relacionados con este modelo ni con su estudio asociado.
