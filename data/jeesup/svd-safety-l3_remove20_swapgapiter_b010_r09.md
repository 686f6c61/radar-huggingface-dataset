# Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r09

## Resumen

`svd-safety-l3_remove20_swapgapiter_b010_r09` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace, derivado de `meta-llama/Meta-Llama-3-8B-Instruct`. El modelo parte de una compresión SVD-LLM que elimina el 20,02% de los parámetros densos de las proyecciones (dejando el 80,0%), y después aplica 9 de las 10 rondas previstas de una rutina de edición iterativa denominada "swap neutro en parámetros", con un presupuesto de restauración del 1,000% de los parámetros densos repartido en fragmentos del 0,100% por ronda.

La relevancia del artefacto es metodológica, no de producto: forma parte de un estudio sobre cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes (`gap_iter`, en este caso) repara mejor ese daño. El autor es explícito al señalar que cada celda de la rejilla experimental es un sujeto de estudio y no un asistente desplegable.

Se trata de un transformer decoder-only denso de 8.030.261.248 parámetros declarados en safetensors, sin parámetros activos separados (no es MoE) y con licencia Meta Llama 3 Community License. El repositorio ocupa 16,1 GB, no tiene descargas ni "likes", y la model card no documenta benchmarks de capacidad estándar, solo tres métricas de seguridad y sobrenegativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), densa, sin MoE |
| Parametros totales | 8.030.261.248 (conteo real de safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (heredada del modelo base Meta-Llama-3-8B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible en la model card; hereda los del modelo base (Meta Llama 3 declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Meta Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`, `pipeline_tag: text-generation`, tag `endpoints_compatible` y `text-generation-inference`) |

Datos adicionales de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base sin comprimir | `meta-llama/Meta-Llama-3-8B-Instruct` |
| Compresion | SVD-LLM, 20,02% de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos |
| Componentes restaurados | 8266 |
| Componentes sustituidos | 8266 |
| Fraccion de parametros resultante | 0,7998 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 9 de 10 |
| Fragmento por ronda | 0,100% de los parametros densos |
| Parametros insertados | 62.768.128 (0,90% de los parametros de proyeccion densos) |
| Valor de swap | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Checkpoint | ronda intermedia de una ejecucion mas larga |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3 8B Instruct: un transformer decoder-only denso con atención causal, normalización RMSNorm y activaciones SwiGLU. El checkpoint no introduce cambios estructurales ni arquitecturas alternativas (no hay MoE, SSM ni hibridaciones); la modificación es puramente paramétrica en las matrices de proyección. El autor no publica detalles del preentrenamiento ni del ajuste de instrucciones de esta variante porque no los realiza: parte del checkpoint ya alineado de Meta.

La innovación técnica es la intervención sobre los pesos en dos fases. Primero, una compresión SVD-LLM que trunca las matrices de proyección y elimina el 20,02% de los parámetros densos. Segundo, una edición iterativa que sustituye componentes por pares (8266 restaurados, 8266 desalojados) siguiendo la regla `gap_iter`, con un presupuesto total del 1,0% de los parámetros densos repartido en diez rondas del 0,1%; este checkpoint corresponde a la novena ronda, con 62.768.128 parámetros insertados (0,90% de los parámetros de proyección densos) y semilla 42. No se documenta en la información disponible ningún uso de RLHF o DPO adicional, ni el volumen de tokens de entrenamiento, porque el trabajo es de edición posterior al entrenamiento (post-hoc), no de reentrenamiento.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del checkpoint base Llama-3-8B-Instruct, con formato de chat de instrucciones.
- Razonamiento y conocimiento general: no se publican evaluaciones específicas para esta celda; la capacidad nominal es la del modelo base menos el efecto de la compresión SVD y del swap de componentes.
- Generación de código y matemáticas: presumiblemente degradada o alterada respecto al base, sin métricas publicadas que lo cuantifiquen.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Llama-3-8B-Instruct sí lo soporta, pero la compresión puede afectar a este comportamiento y no se ha medido.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en esta celda.
- Capacidades multilingües: no especificadas en la model card; dependen del modelo base.
- Capacidad especial: no es un modelo con "thinking mode", visión ni audio. Su rasgo distintivo es el perfil de seguridad medido (ASR bajo) y su naturaleza de artefacto experimental reproducible.

## Casos de uso

- Reproducción de estudios sobre compresión y seguridad: el checkpoint es una celda concreta de una rejilla (regla de selección `gap_iter`, presupuesto 1,0%, ronda 9), lo que permite a un grupo de investigación replicar exactamente esa configuración con semilla 42 y comparar contra las demás celdas del mismo estudio.
- Evaluación comparativa de reglas de selección de componentes: sirve como punto de medida para contrastar `gap_iter` frente a otras reglas de selección bajo el mismo presupuesto de restauración del 1,0%.
- Investigación de interpretabilidad: los pares de componentes sustituidos (8266 insertados, 8266 desalojados, 62.768.128 parámetros) permiten analizar qué subespacios de las proyecciones son responsables de comportamientos de rechazo y de utilidad.
- Banco de pruebas de pipelines de red-teaming: con un ASR medido de 0,0500 en AdvBench y 0,0850 en StrongREJECT (juez HarmBench), es un sujeto útil para calibrar clasificadores de daño y jueces automáticos, y para comprobar si un evaluador detecta degradaciones introducidas artificialmente.
- Calibración de métricas de sobrenegativa: el 0,1750 de sobrenegativa macro (WildGuard) permite estudiar el equilibrio entre rechazo seguro y rechazo excesivo en modelos comprimidos.
- Docencia y formación técnica: como ejemplo práctico de las diferencias entre compresión estructural (SVD) y edición paramétrica selectiva, y de por qué el conteo de parámetros no basta para caracterizar un checkpoint.
- Auditoría de artefactos derivados de Llama 3: útil para equipos que necesitan comprobar si un derivado de Meta Llama 3 cumple las condiciones de la licencia y del `USE_POLICY.md` antes de cualquier uso interno.

## Benchmarks y rendimiento

El autor publica únicamente tres métricas de seguridad y comportamiento, evaluadas con el juez HarmBench y WildGuard. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad en la información disponible.

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,0500 | HarmBench judge |
| StrongREJECT ASR | 0,0850 | HarmBench judge |
| Sobrenegativa macro | 0,1750 | WildGuard |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se ofrece una comparación directa de estas tres métricas contra el modelo base sin comprimir o contra las demás celdas de la rejilla, por lo que no es posible calcular la magnitud del daño o la reparación a partir de los datos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión de safetensors (fp16/bf16): en torno a 16,1 GB solo de pesos, más caché KV y activaciones; con contexto moderado (4k-8k) conviene reservar 20-24 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para servicio con contexto completo y concurrencia; RTX 4090 24 GB o RTX 3090 24 GB para una única sesión.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB con contexto limitado y sin cuantización adicional; en tarjetas de 12-16 GB requeriría cuantización a int8 o int4, que el autor no proporciona.
- Atención a la discrepancia de tamaño: el conteo de safetensors (8.030.261.248 parámetros) coincide con el del modelo base sin comprimir, por lo que la reducción nominal al 80,0% de los parámetros densos de proyección no implica necesariamente un ahorro proporcional de memoria en el repositorio de 16,1 GB.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference y endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`), además de vLLM por compatibilidad de arquitectura Llama. `llama.cpp` u Ollama exigirían una conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentación pública; la model card de este checkpoint no ofrece comparaciones. Las métricas de seguridad de la tabla no son directamente comparables entre filas porque solo esta celda publica valores con juez HarmBench en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `svd-safety-l3_remove20_swapgapiter_b010_r09` | 8,03B (tras SVD al 80,0% de las proyecciones y swap del 1,0%) | 8192 (heredado) | Meta Llama 3 Community License | HuggingFace, 0 descargas, 0 likes | Artefacto de investigacion, no apto como asistente general |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03B densos | 8192 | Meta Llama 3 Community License | HuggingFace, muy desplegado | Modelo base sin comprimir; referencia de utilidad y seguridad |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03B densos | 128000 | Meta Llama 3.1 Community License | HuggingFace, muy desplegado | Alternativa mas reciente con contexto mucho mayor y soporte de tool calling documentado |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,25B densos | 32768 | Apache 2.0 | HuggingFace, muy desplegado | Licencia permisiva y contexto amplio; eleccion habitual cuando la licencia Llama es un obstaculo |

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct, que la compresión por sí sola eleva la tasa de éxito de ataque y que este checkpoint es un sujeto experimental, no un asistente desplegable.
- La model card no documenta sesgos, idiomas, comportamiento de tool calling ni rendimiento en tareas de utilidad, de modo que cualquier uso productivo se haría sin datos de capacidad y sin evaluación de sesgo.
- Riesgo de alucinación: no cuantificado en la información disponible; se desconoce en qué medida la compresión SVD y el swap de componentes afectan a la fidelidad factual.
- Este checkpoint es la ronda 9 de 10 de una ejecución más larga: no es el resultado final del procedimiento y sus métricas no deben extrapolarse al resultado completo.
- Discrepancia entre la compresión declarada (resulting parameter fraction 0,7998) y el conteo de safetensors (8.030.261.248 parámetros, idéntico al del modelo base): conviene verificar el uso real de memoria antes de planificar despliegues.
- Licencia Meta Llama 3 Community License: el uso comercial está sujeto a las condiciones de `LICENSE` y `USE_POLICY.md` del repositorio, incluida la atribución ("Built with Meta Llama 3") y las restricciones de uso aceptable. No es una licencia permisiva tipo Apache 2.0.
- Repositorio sin descargas ni interacción (0 descargas, 0 likes) y sin validación de terceros: no hay evidencia externa de calidad, estabilidad ni reproducibilidad.
- Ausencia total de cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja sin trabajo de conversión adicional.
- Las fechas del repositorio (creado y actualizado el 17 de septiembre de 2026 según los metadatos) resultan anómalas y conviene tratarlas con cautela al citar la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso: los ficheros `LICENSE` y `USE_POLICY.md` incluidos en el propio repositorio del modelo
- Paper de SVD-LLM (método de compresión citado por el autor): no disponible en los resultados de búsqueda proporcionados
- Blog o publicación del autor sobre el estudio (rejilla de reglas de selección y presupuestos): no disponible en la información proporcionada
- Repositorio de código asociado: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
- Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas del NHS sobre pruebas auditivas, sin relación alguna con este modelo, por lo que no se han podido incorporar fuentes adicionales verificadas.
