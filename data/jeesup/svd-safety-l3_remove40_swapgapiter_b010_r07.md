# Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r07

## Resumen

`svd-safety-l3_remove40_swapgapiter_b010_r07` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en HuggingFace. No se trata de un modelo entrenado desde cero ni de un ajuste fino convencional: es el resultado de aplicar compresión por descomposición en valores singulares (SVD-LLM) para eliminar el 40,02 % de los parámetros densos, seguida de una edición iterativa de parámetros orientada a restaurar comportamiento de seguridad.

El artefacto forma parte de un estudio sobre cómo la compresión SVD degrada las capacidades de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. En concreto, esta celda usa la regla `gap_iter` con un presupuesto de restauración del 1,000 % de los parámetros densos, aplicado en 7 de las 10 rondas previstas, con un bloque del 0,100 % por ronda. El resultado son 48.832.512 parámetros sustituidos (0,70 % de los parámetros de proyección densos) sobre una fracción de parámetros final de 0,5998.

Es relevante ahora porque conecta dos líneas de trabajo activas: la compresión agresiva de LLM para reducir costes de inferencia y el análisis de interpretabilidad y seguridad bajo transformaciones de pesos. El propio autor advierte que se trata de un sujeto experimental, no de un asistente desplegable, y que varias celdas de la retícula están deliberadamente degradadas en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), pesos transformados mediante compresion SVD y edicion posterior de parametros |
| Parametros totales | 8.030.261.248 (8,03 B) tras la compresion; la fraccion de parametros resultante es 0,5998 respecto al denso |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card; el checkpoint hereda la configuracion del modelo base `meta-llama/Meta-Llama-3-8B-Instruct` |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors; no se ofrecen variantes cuantizadas |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (tamano del repositorio: 16,1 GB) |
| Modelo base | `meta-llama/Meta-Llama-3-8B-Instruct` |
| Metodo de compresion | SVD-LLM; 40,02 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Componentes restaurados / sustituidos | 7.893 restaurados y 7.893 sustituidos |
| Parametros introducidos | 48.832.512 (0,70 % de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Rondas iterativas | 7 de 10 |
| Bloque por ronda | 0,100 % de los parametros densos |
| Descargas / likes | 178 descargas, 0 likes |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 de 8.000 millones de parametros en configuracion decoder-only, pero los pesos publicados no son los originales. Sobre el checkpoint instructivo se aplico una compresion SVD-LLM que reduce el modelo al 59,98 % de sus parametros densos mediante aproximaciones de rango bajo de las matrices de pesos, eliminando el 40,02 % de los parametros. Posteriormente se ejecuto un procedimiento de edicion de parametros neutral en presupuesto: en cada ronda se restauran y se sustituyen 7.893 componentes, con un valor de intercambio de tipo `insert` y desalojo ordenado por sigma, seleccionados por la regla `gap_iter`.

No hay entrenamiento adicional documentado: no se reportan tokens de entrenamiento, composicion de dataset, ni fases de RLHF o DPO propias. El checkpoint es un artefacto intermedio (ronda 7 de 10) de una ejecucion mas larga, con semilla 42. La innovacion tecnica que describe la model card no es arquitectonica sino metodologica: medir la perdida de seguridad inducida por la compresion y evaluar si una regla concreta de seleccion y restauracion de componentes puede recuperarla con un presupuesto minimo de parametros (1,000 % del total denso).

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base instructivo, aunque degradada por la compresion y la edicion.
- Razonamiento e instrucciones: la model card no documenta evaluaciones de capacidad general (MMLU, GSM8K, HumanEval u otras), por lo que el nivel real de competencia no esta cuantificado.
- Codigo y matematicas: no disponible; no se publican resultados especificos.
- Tool calling / function calling: no disponible en la informacion proporcionada; no se documenta soporte explicito ni plantilla de herramientas.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision o audio: no soportado; es un modelo exclusivamente de texto.
- Comportamiento de seguridad medido: la model card reporta tres metricas de seguridad (ASR en AdvBench, ASR en StrongREJECT y sobre-rechazo macro medido con WildGuard), que constituyen la unica evaluacion publicada.

## Casos de uso

- Investigacion sobre compresion de LLM: el checkpoint sirve como punto de medida para estudiar como una reduccion del 40,02 % de parametros afecta a la utilidad y a la seguridad, comparando contra el modelo base sin comprimir.
- Analisis de tecnicas de reparacion de seguridad: permite evaluar si la regla `gap_iter` con un presupuesto del 1,000 % recupera comportamiento seguro, comparandola con otras reglas de la misma retícula de experimentos.
- Interpretabilidad de pesos: el conjunto de 7.893 componentes restaurados y 7.893 sustituidos, con su ordenacion por sigma, es un material util para estudiar que subespacios de pesos concentran funciones de seguridad.
- Auditoria de robustez frente a jailbreak: las metricas de ASR en AdvBench (0,0950) y StrongREJECT (0,1950) permiten usar el modelo como sujeto de pruebas en pipelines de red teaming automatizado.
- Estudio de sobre-rechazo: el valor de sobre-rechazo macro de 0,1365 (WildGuard) lo hace util para investigar el equilibrio entre seguridad y utilidad, es decir, cuanto rechazo innecesario introduce la edicion.
- Reproducibilidad de experimentos: al documentarse semilla (42), rondas (7 de 10), bloque por ronda (0,100 %) y presupuesto total (1,000 %), el checkpoint es replicable como referencia en estudios similares.
- Generacion de texto en produccion: no recomendado como uso principal; el propio autor indica que es un sujeto experimental y que debe evaluarse antes de extraer conclusiones.

## Benchmarks y rendimiento

La model card solo publica metricas de seguridad. No hay resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible.

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,0950 | HarmBench judge |
| StrongREJECT ASR | 0,1950 | HarmBench judge |
| Sobre-rechazo macro | 0,1365 | WildGuard |

No se proporciona comparacion con el modelo base sin comprimir ni con otras celdas de la retícula, por lo que no es posible calcular la delta de degradacion o recuperacion a partir de los datos disponibles.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: alrededor de 16 GB solo para pesos (8,03 B de parametros), mas cache KV y activaciones, lo que en la practica situa el consumo total por encima de 16 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en int8: aproximadamente 8 GB de pesos; en int4, alrededor de 4-5 GB. Estas conversiones no estan publicadas en el repositorio y requeririan cuantizacion propia.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB, L40S 48 GB, o cualquier GPU con 24 GB o mas para lotes pequenos.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en fp16. En GPU de 16 GB (RTX 4080, RTX 4070 Ti Super) requiere cuantizacion o lotes muy reducidos. En 12 GB es necesario int4/int8.
- Opciones de despliegue: al estar en safetensors y etiquetado con `text-generation-inference`, es compatible con TGI, vLLM y el stack de `transformers`. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que el repositorio no incluye variantes GGUF.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r07` | 8,03 B (59,98 % del denso) | No disponible | Llama 3 Community License | HuggingFace, safetensors | Artefacto de investigacion con edicion de seguridad; 178 descargas |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03 B (denso) | 8.192 tokens segun el modelo base | Llama 3 Community License | HuggingFace, safetensors | Modelo base sin comprimir; referencia de utilidad y seguridad del estudio |
| Otras celdas de la retícula del mismo estudio | No disponible | No disponible | Llama 3 Community License | No disponible en la informacion proporcionada | El autor menciona una retícula sobre reglas y presupuestos, pero no se listan identificadores |
| Alternativas de compresion de Llama 3 8B (por ejemplo, destilaciones o podas de terceros) | No disponible | No disponible | Variable | No disponible | No se han encontrado datos comparables en la busqueda web realizada |

La busqueda web asociada a esta ficha no devolvio resultados tecnicos relevantes: los unicos enlaces recuperados corresponden a sitios de apuestas deportivas, sin relacion con el modelo.

## Limitaciones y advertencias

- Artefacto de investigacion, no asistente desplegable: la propia model card indica de forma explicita que cada celda de la retícula debe tratarse como sujeto experimental.
- Degradacion deliberada de seguridad en algunas variantes: el autor advierte que la compresion por si sola eleva la tasa de exito de ataques y que el objetivo del estudio es cuantificarlo y probar su recuperacion.
- Riesgo de jailbreak medido y no nulo: ASR de 0,0950 en AdvBench y 0,1950 en StrongREJECT con juez HarmBench, valores que deben interpretarse en el contexto del experimento y no como garantia de despliegue.
- Sobre-rechazo: 0,1365 de sobre-rechazo macro (WildGuard), lo que implica rechazos innecesarios en una fraccion relevante de peticiones benignas.
- Ausencia de evaluacion de capacidad general: no hay MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento, por lo que se desconoce cuanto conocimiento o habilidad se ha perdido con el 40,02 % de parametros eliminados.
- Idiomas no declarados: no se especifica cobertura multilingue, lo que impide asumir un comportamiento fiable fuera del ingles sin evaluacion previa.
- Longitud de contexto no confirmada en la model card: cualquier planificacion de contexto largo debe validarse contra la configuracion real del modelo base.
- Contexto de compresion no estandar: los pesos estan modificados mediante SVD y edicion de componentes, por lo que algunas herramientas de analisis o fusion de modelos pueden no funcionar correctamente.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con obligaciones de atribucion y mencion de "Built with Meta Llama 3", y limitaciones de uso recogidas en `USE_POLICY.md`; es necesario revisar los terminos antes de cualquier uso comercial.
- Alucinacion: no se documenta ninguna evaluacion de veracidad, por lo que no hay datos sobre la tasa de alucinacion inducida por la compresion.
- Fechas y versionado: el repositorio se creo y actualizo el 2026-09-18; conviene comprobar si existen revisiones posteriores con la ejecucion completa de 10 rondas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: incluida en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- Resultados de la busqueda web: no se encontraron enlaces tecnicos relevantes (los resultados recuperados correspondian a sitios de apuestas deportivas sin relacion con el modelo)
- Paper de SVD-LLM y articulos asociados: no disponible en la informacion proporcionada
