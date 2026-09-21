# Jeesup/svd-safety-l3_swift_remove50_swapgapiter_rankunit_b010

## Resumen

`Jeesup/svd-safety-l3_swift_remove50_swapgapiter_rankunit_b010` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM que elimina el 49,97 % de los parámetros densos, seguida de una reparación iterativa mediante intercambio de componentes ("swap") neutro en parámetros. El resultado declarado es una fracción de parámetros densos de 0,5003. El autor lo publica como artefacto de investigación, no como modelo conversacional de propósito general.

El interés del checkpoint es metodológico: forma parte de una rejilla experimental que cruza reglas de selección de componentes con presupuestos de restauración, y sirve para cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué criterio de selección repara mejor ese daño. En esta celda concreta la regla de selección es `gap_iter`, el presupuesto de restauración es el 1,000 % de los parámetros densos, se restauran 5.308 componentes y se sustituyen otros tantos, y se aplican las 10 rondas iterativas completas con un fragmento del 0,100 % de los parámetros por ronda (semilla 42).

La relevancia actual es doble. Por un lado, alimenta la línea de trabajo sobre compresión agresiva de LLM y su impacto en propiedades alineadas como el rechazo a peticiones dañinas. Por otro, proporciona una celda reproducible con métricas publicadas (ASR en AdvBench, ASR en StrongREJECT, sobre-rechazo macro y perplejidad en WikiText-2) para estudiar el compromiso entre seguridad y utilidad. El modelo conserva la arquitectura transformer decoder-only de Llama 3 con 8.192 tokens de contexto heredados del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3 (GQA, RoPE, SwiGLU, RMSNorm) con capas de proyeccion comprimidas mediante SVD-LLM |
| Parametros totales | 8.030.261.248 segun los metadatos de safetensors del repositorio; el autor declara una fraccion de parametros densos resultante de 0,5003 tras eliminar el 49,97 % |
| Parametros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | 8.192 tokens (heredada de `meta-llama/Meta-Llama-3-8B-Instruct`); la model card no indica modificacion |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors y no se documentan versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible en la model card; el modelo base declara soporte oficial para 8 idiomas |
| Licencia | Llama 3 Community License (`license: llama3`); `LICENSE` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio 16,1 GB |

Datos de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base (sin comprimir) | `meta-llama/Meta-Llama-3-8B-Instruct` |
| Compresion | SVD-LLM, 49,97 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Componentes restaurados | 5.308 |
| Componentes sustituidos | 5.308 |
| Fraccion de parametros resultante | 0,5003 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 10 de 10 |
| Fragmento por ronda | 0,100 % de los parametros densos |
| Parametros intercambiados | 69.743.616 (1,00 % de los parametros de proyeccion densos) |
| Valor del swap | `insert` (solo valor de insercion; desalojo ordenado por sigma) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3 8B Instruct: un transformer decoder-only con normalizacion RMSNorm pre-norma, activacion SwiGLU en la MLP, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). Sobre esa base se aplica SVD-LLM, una tecnica de compresion que descompone en valores singulares las matrices de proyeccion y trunca el espectro para reducir el rango efectivo de dichas capas, lo que elimina el 49,97 % de los parametros densos. Este checkpoint no ha sido reentrenado ni ajustado con RLHF o DPO despues de la compresion: la model card no documenta ninguna fase adicional de ajuste.

La innovacion tecnica de esta celda es el procedimiento de reparacion posterior. Tras la compresion se ejecutan 10 rondas iterativas de intercambio de componentes con presupuesto neutro en parametros: en cada ronda se seleccionan componentes mediante la regla `gap_iter`, se sustituyen 5.308 componentes por otros tantos y se inserta el valor de insercion, con desalojo ordenado por valor singular. El presupuesto total de restauracion es del 1,000 % de los parametros densos, repartido en fragmentos del 0,100 % por ronda, y afecta a 69.743.616 parametros de proyeccion. El autor no detalla en la model card proporcionada la composicion del dataset de compresion ni el numero de tokens utilizado, y tampoco describe mecanismos adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones, heredada del modelo base Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones en un unico turno y en multiturno, con la salvedad de que la compresion degrada la calidad global (perplejidad en WikiText-2 de 55,3440).
- Comportamiento de seguridad medible: tasa de exito de ataque (ASR) de 0,0192 en AdvBench y de 0,1246 en StrongREJECT, ambas evaluadas con el juez de HarmBench.
- Perfil de sobre-rechazo cuantificado: 0,2419 de sobre-rechazo macro segun WildGuard.
- Capacidad de servir como sujeto experimental reproducible: semilla fija (42), regla de seleccion documentada y presupuesto de restauracion explicito.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio o modo "thinking": no disponible. La model card no documenta ninguna de estas capacidades, y el autor indica expresamente que no es un modelo de chat de proposito general.

## Casos de uso

- Reproduccion de estudios de compresion SVD: el checkpoint permite replicar exactamente una celda de la rejilla (regla `gap_iter`, presupuesto del 1,000 %, 10 rondas, semilla 42) y contrastar los valores publicados de ASR y perplejidad con ejecuciones propias.
- Evaluacion comparativa de reglas de seleccion de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, se usa como punto de referencia para medir que criterio de seleccion repara mejor el comportamiento de seguridad tras comprimir al 50 %.
- Red-teaming y medicion de ASR: con AdvBench y StrongREJECT ya puntuados por el juez de HarmBench, sirve para calibrar pipelines de evaluacion de seguridad y para estudiar como la compresion eleva la tasa de exito de ataques.
- Investigacion de interpretabilidad sobre el rechazo: los 5.308 componentes restaurados y los 5.308 sustituidos son un conjunto identificable de candidatos para analizar que subespacios de las proyecciones codifican el comportamiento de rechazo.
- Validacion de jueces automaticos: los valores de ASR y de sobre-rechazo permiten comprobar la consistencia entre HarmBench y WildGuard sobre un modelo con comportamiento deliberadamente degradado.
- Estudio del compromiso seguridad-utilidad: la pareja perplejidad (55,3440 en WikiText-2) frente a ASR (0,0192 en AdvBench) permite trazar curvas de degradacion de utilidad frente a ganancia de seguridad en funcion del presupuesto de restauracion.
- Pruebas de infraestructura de inferencia: dado que el repositorio declara compatibilidad con `text-generation-inference` y `endpoints_compatible`, se puede usar para verificar que vLLM, TGI o los endpoints de HuggingFace cargan correctamente un checkpoint derivado con las dimensiones de proyeccion modificadas.
- Linea base negativa en evaluacion de sobre-rechazo: con un 0,2419 de sobre-rechazo macro, es util como caso de control en estudios sobre calibracion de negativas.

## Benchmarks y rendimiento

| Metrica | Valor | Direccion favorable |
|---|---|---|
| AdvBench ASR (juez de HarmBench) | 0,0192 | Cuanto menor, mejor |
| StrongREJECT ASR (juez de HarmBench) | 0,1246 | Cuanto menor, mejor |
| Sobre-rechazo macro (WildGuard) | 0,2419 | Cuanto menor, mejor |
| Perplejidad en WikiText-2 | 55,3440 | Cuanto menor, mejor |

La model card no incluye resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, y tampoco proporciona los valores equivalentes del modelo base `meta-llama/Meta-Llama-3-8B-Instruct`, por lo que no es posible calcular la degradacion relativa con los datos disponibles. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 16 GB solo para pesos (el repositorio ocupa 16,1 GB) mas la cache KV; en la practica, entre 17 y 20 GB para una ventana de 8.192 tokens.
- VRAM estimada cuantizado: no disponible oficialmente, ya que no se publican pesos cuantizados. Como referencia de orden de magnitud para un modelo de ~8B, una conversion a int8 ocuparia alrededor de 8-9 GB y una conversion a 4 bits alrededor de 5-6 GB, siempre que la conversion sea posible con las dimensiones comprimidas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para fp16 sin problemas de memoria; RTX 4090 y RTX 3090 (24 GB) son suficientes en fp16 con contexto completo.
- Cabe en GPU de consumo: si en fp16 en tarjetas de 24 GB (RTX 3090, 4090) y, con conversiones cuantizadas de terceros, en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: `transformers` como via principal; vLLM y TGI son viables segun los tags del repositorio (`text-generation-inference`, `endpoints_compatible`). Ollama y llama.cpp requeririan una conversion a GGUF que el autor no publica.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de tiempo hasta el primer token ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_swift_remove50_swapgapiter_rankunit_b010` | 8.030.261.248 segun safetensors; fraccion densa declarada 0,5003 | 8.192 tokens | AdvBench ASR 0,0192; StrongREJECT ASR 0,1246; sobre-rechazo 0,2419; WikiText-2 ppl 55,3440 | Llama 3 Community License | Repositorio HF publico, safetensors |
| `meta-llama/Meta-Llama-3-8B-Instruct` (modelo base) | 8.030.261.248 | 8.192 tokens | No disponible en la informacion proporcionada | Llama 3 Community License | Repositorio HF publico |
| Otras celdas de la misma rejilla de compresion y reparacion | No disponible | No disponible | No disponible | No disponible | No identificadas en la informacion proporcionada |

No se han identificado en la informacion disponible otros checkpoints comparables de la misma categoria (Llama 3 8B comprimido por SVD con reparacion posterior), ni se aportan cifras de rendimiento de alternativas con las que contrastar.

## Limitaciones y advertencias

- El autor declara explicitamente que el checkpoint es un artefacto de investigacion y que no debe tratarse como un asistente desplegable.
- Varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la propia compresion eleva la tasa de exito de ataques. La tasa de StrongREJECT de 0,1246 (12,46 %) es un indicador directo de ese riesgo.
- El sobre-rechazo macro de 0,2419 implica que aproximadamente una de cada cuatro respuestas puede ser una negativa indebida, lo que afecta a la utilidad conversacional.
- La perplejidad en WikiText-2 de 55,3440 es coherente con una degradacion severa del modelado de lenguaje, aunque no se aporta la cifra del modelo base para cuantificarla.
- Riesgo de alucinacion: no se han publicado mediciones de veracidad, factualidad ni tasa de alucinacion para este checkpoint.
- Discrepancia de datos: los metadatos de safetensors declaran 8.030.261.248 parametros, identico al recuento de Llama-3-8B sin comprimir, mientras que el autor declara una fraccion de parametros densos de 0,5003. Conviene verificar la configuracion real de las capas antes de asumir un ahorro de memoria del 50 %.
- Idiomas: la model card no declara idiomas soportados y la compresion puede afectar de forma desigual a idiomas distintos del ingles, sin que existan evaluaciones multilingues publicadas.
- Restricciones de licencia: se aplica la Llama 3 Community License, que impone obligaciones de atribucion ("Built with Meta Llama 3"), condiciones de uso aceptable recogidas en `USE_POLICY.md` y requisitos especificos para despliegues con mas de 700 millones de usuarios mensuales. El uso comercial esta sujeto a dichos terminos.
- Ausencia de soporte: el autor no documenta tool calling, function calling, uso como agente ni integracion con pipelines de produccion. Cualquier uso en produccion exigiria una evaluacion propia previa.
- Reproducibilidad: la semilla es 42 y los parametros del procedimiento estan fijados, pero la model card no especifica versiones de librerias ni el codigo exacto de la regla `gap_iter`, lo que puede dificultar la replicacion literal.
- No se documentan los datos de entrenamiento, el volumen de tokens ni el dataset empleado en la compresion y reparacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove50_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y politica de uso: archivos `LICENSE` y `USE_POLICY.md` incluidos en el propio repositorio del modelo
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Las unicas entradas devueltas corresponden a consultas sobre la aplicacion de correo de un operador de telefonia y no guardan relacion con el modelo, su paper ni su codigo.
