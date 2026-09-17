# Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r04

## Resumen

`Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r04` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` comprimido con la tecnica SVD-LLM, en el que se han eliminado el 20,02% de los parametros de las proyecciones (fraccion resultante de 0,7998), seguido de una edicion selectiva de parametros mediante 4 de las 10 rondas previstas del algoritmo de intercambio neutral `swap`, con la regla de seleccion `gap_iter`. El resultado es un artefacto de investigacion, no un asistente de proposito general: forma parte de un grid experimental disenado para estudiar como la compresion SVD degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes lo repara mejor.

El modelo lo publica el usuario `Jeesup` y su interes es fundamentalmente metodologico: la model card mide la tasa de exito de ataque (ASR) con AdvBench y StrongREJECT y la tasa de sobrerrechazo (over-refusal) con WildGuard, con el objetivo de cuantificar el compromiso entre seguridad y utilidad bajo compresion. El checkpoint corresponde a una ronda intermedia de una ejecucion mas larga, con semilla 42 y un presupuesto de restauracion de componentes del 1,000% de los parametros densos.

La relevancia actual deriva del creciente interes por tecnicas de compresion de bajo rango (SVD, poda estructurada) aplicadas a modelos de 8B para reducir costes de inferencia, y por la constatacion de que dichas tecnicas pueden degradar los mecanismos de alineamiento. Se trata de un modelo con 8.030.261.248 parametros totales, repo de 16,1 GB, cero descargas y cero likes en el momento de la consulta, y licencia Llama 3.1 Community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `meta-llama/Llama-3.1-8B-Instruct`; no se detalla en la model card) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion proporcionada; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License (`license: llama3.1`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (libreria `transformers`) |
| Fraccion de parametros densos resultante | 0,7998 |
| Parametros eliminados por compresion | 20,02% (SVD-LLM) |
| Regla de seleccion de componentes | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos |
| Componentes restaurados / sustituidos | 4.487 / 4.487 |
| Parametros intercambiados | 27.897.856 (0,40% de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Rondas iterativas aplicadas | 4 de 10 (fragmento de 0,100% de parametros densos por ronda) |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se describe una arquitectura propia: el checkpoint es una modificacion de pesos de `meta-llama/Llama-3.1-8B-Instruct`, por lo que conserva la topologia del modelo base (transformer decoder-only con atencion por causalidad agrupada, RoPE y normalizacion RMSNorm). El proceso aplicado no es un reentrenamiento, sino una edicion post-hoc de los pesos en dos fases. Primero se aplica SVD-LLM para eliminar el 20,02% de los parametros de las proyecciones, dejando una fraccion densa de 0,7998. Despues se ejecuta el algoritmo de intercambio neutral de parametros con la regla de seleccion `gap_iter`: en cada ronda se identifican componentes candidatos y se sustituyen por valores de insercion (`insert`), con desalojo ordenado por sigma, hasta agotar un fragmento del 0,100% de los parametros densos por ronda. Este checkpoint se detiene en la ronda 4 de 10, por lo que el presupuesto total de restauracion consumido es parcial respecto al 1,000% previsto para la ejecucion completa.

No hay informacion proporcionada sobre tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO en esta fase, ni sobre innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.). La innovacion metodologica del artefacto es el propio procedimiento de reparacion: un esquema de edicion selectiva de componentes que no modifica el numero de parametros, sino que reasigna valores en 27.897.856 parametros (0,40% de las proyecciones densas) para intentar recuperar comportamiento perdido por la compresion. El autor advierte que varias ramas del grid estan deliberadamente degradadas en seguridad respecto al modelo base, porque el objetivo es cuantificar la degradacion y probar la recuperacion.

## Capacidades

- Generacion de texto conversacional: conserva la capacidad del modelo base al derivar de `Llama-3.1-8B-Instruct` (formato de chat con plantilla de Llama 3.1).
- Razonamiento e instrucciones: no se documentan capacidades especificas adicionales ni modos de pensamiento (`thinking mode`).
- Codigo y matematicas: no se reportan evaluaciones de HumanEval, GSM8K ni similares en la informacion proporcionada.
- Tool calling / function calling: no documentado en la model card.
- Comportamiento agente y razonamiento multi-paso: no documentado; el artefacto esta pensado para evaluacion de seguridad, no para uso agentico.
- Capacidades multilingues: no disponibles.
- Vision o audio: no soportados (modelo exclusivamente de texto).
- Capacidad destacada del artefacto: servir como sujeto experimental para medir el impacto de la compresion SVD en el rechazo de peticiones daninas, con ASR medido por jueces HarmBench.

## Casos de uso

- Investigacion en seguridad y compresion: usar este checkpoint como celda del grid para reproducir la medicion de ASR con AdvBench y StrongREJECT y compararla con otras reglas de seleccion y presupuestos de restauracion. Es su proposito declarado.
- Auditoria de degradacion de alineamiento: ejecutar baterias de ataques sobre el modelo comprimido y sobre `Llama-3.1-8B-Instruct` sin comprimir para cuantificar cuanto dano introduce el 20,02% de eliminacion de parametros.
- Analisis de sobrerrechazo: emplear la metrica Macro over-refusal (WildGuard) de 0,2638 como referencia para estudiar el coste en utilidad de las tecnicas de reparacion de seguridad.
- Estudio de interpretabilidad de pesos: aprovechar que el proceso identifica y sustituye 4.487 componentes concretos para rastrear que subconjuntos de pesos influyen en el comportamiento de rechazo.
- Benchmarking de tecnicas de compresion de bajo rango: comparar SVD-LLM frente a otras tecnicas (poda estructurada, cuantizacion) usando este checkpoint como linea base de un presupuesto del 0,40% de parametros de proyeccion restaurados.
- Validacion de pipelines de evaluacion de seguridad: integrarlo como caso de prueba en un arnes que mida ASR con el juez de HarmBench y verifique que las herramientas de evaluacion detectan degradaciones deliberadas.
- Reproduccion experimental: al documentarse semilla (42), regla (`gap_iter`) y presupuesto por ronda (0,100%), permite reproducir la ronda intermedia 4 de 10 en un estudio mas amplio.

No se recomienda su uso como asistente conversacional desplegado, tal como advierte el propio autor.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son metricas de seguridad, no de capacidad general:

| Metrica | Valor | Juez |
|---|---|---|
| AdvBench ASR | 0,0100 | HarmBench |
| StrongREJECT ASR | 0,0300 | HarmBench |
| Macro over-refusal | 0,2638 | WildGuard |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni tablas comparativas contra otros checkpoints del mismo grid.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): en torno a 16,1 GB solo para pesos, mas cache KV y activaciones; se recomienda un minimo practico de 20-24 GB.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: aproximadamente 5-6 GB de pesos, viable en GPUs de 8-10 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 en una sola tarjeta con lotes pequenos; RTX 4080/A10 (16 GB) o inferiores requieren cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en BF16 con contexto reducido, y en tarjetas de 8-16 GB si se cuantiza. No se publican GGUF en el repositorio, por lo que habria que generarlos a partir de los safetensors.
- Opciones de despliegue: `transformers` (formato nativo del repo), vLLM y TGI (etiquetas `text-generation-inference` y `endpoints_compatible` presentes en el modelo), llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l31_remove20_swapgapiter_b010_r04 | 8.030.261.248 (fraccion densa 0,7998) | No especificado (base: 128.000 tokens) | AdvBench ASR 0,0100; StrongREJECT ASR 0,0300; over-refusal 0,2638 | Llama 3.1 Community | HuggingFace, safetensors |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8.030.261.248 | 128.000 tokens | No disponible en la informacion proporcionada | Llama 3.1 Community | HuggingFace, safetensors |
| Otros checkpoints del mismo grid (`Jeesup/svd-safety-*`) | No disponible | No disponible | No disponible | Llama 3.1 Community | No verificados en la informacion proporcionada |

No se dispone de datos suficientes para comparar con otras alternativas de compresion (por ejemplo, variantes cuantizadas de Llama 3.1 8B o modelos destilados de tamano similar): no hay resultados de benchmarks de capacidad en la informacion proporcionada, y las busquedas web realizadas no devolvieron documentacion tecnica relevante sobre este artefacto.

## Limitaciones y advertencias

- Artefacto de investigacion, no modelo desplegable: el propio autor indica que debe tratarse como sujeto experimental y no como asistente de proposito general.
- Degradacion deliberada de seguridad en varias ramas del grid: la compresion por si sola eleva la tasa de exito de ataque, y parte de los checkpoints estan degradados a proposito para medir la recuperacion.
- El checkpoint corresponde a una ronda intermedia (4 de 10), por lo que el presupuesto de reparacion no esta agotado; su comportamiento no representa el resultado final de la ejecucion completa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la eliminacion del 20,02% de parametros de proyeccion puede afectar a la fidelidad factual, pero no se aportan metricas.
- Limitaciones de contexto e idioma: no documentadas; se desconoce si la compresion afecta de forma desigual a distintos idiomas.
- Sobrerrechazo elevado: la metrica Macro over-refusal de 0,2638 sugiere que el modelo rechaza peticiones benignas con frecuencia, lo que limita su utilidad conversacional.
- Cero descargas y cero likes: no existe validacion comunitaria independiente de este checkpoint.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial, atribucion ("Built with Llama") y politica de uso aceptable recogidas en `LICENSE` y `USE_POLICY.md`. Cualquier uso queda sujeto a dichos terminos.
- Riesgo de seguridad en produccion: dado que el objetivo del estudio es precisamente medir fallos de rechazo, no debe exponerse a usuarios finales sin una evaluacion de seguridad propia y exhaustiva.
- No se publican cuantizaciones ni pesos GGUF: el despliegue en entornos de bajos recursos requiere conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/ (referenciada en la model card)
- Politica de uso aceptable de Llama 3.1: incluida como `USE_POLICY.md` en el repositorio del modelo
- Las busquedas web realizadas no devolvieron papers, blogs, repositorios ni demos relevantes sobre este modelo; los resultados obtenidos correspondian a paginas generales sobre ChatGPT y no guardan relacion con el artefacto.
