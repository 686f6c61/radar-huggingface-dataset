# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r03

## Resumen

Este repositorio contiene un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` sometido a dos transformaciones sucesivas: primero una compresion con SVD-LLM que elimina el 30,01 % de los parametros densos, y despues una edicion de parametros mediante la regla de seleccion `gap_iter`, que en este checkpoint ha completado 3 de las 10 rondas iterativas previstas. El resultado es un modelo con una fraccion de parametros de 0,6999 respecto al denso original, con 3.559 componentes sustituidos y 20.919.296 parametros intercambiados (0,30 % de los parametros de proyeccion densos).

El autor, Jeesup, lo publica como artefacto de investigacion dentro de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. No es un asistente conversacional de proposito general ni un modelo listo para produccion: es una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion, y el propio autor advierte que varias celdas de esa rejilla estan deliberadamente degradadas en seguridad respecto al modelo base.

La relevancia actual es metodologica: proporciona un punto de medida reproducible (semilla 42, checkpoint intermedio de una ejecucion mas larga) con tasas de exito de ataque publicadas (AdvBench 0,2400 y StrongREJECT 0,1750 con juez HarmBench) y una tasa de sobrerrechazo del 0,0826 medida con WildGuard. Su tamano de 8.030.261.248 parametros y su formato safetensors lo mantienen dentro del rango de inferencia en una sola GPU de 24 GB con cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con matrices de proyeccion comprimidas mediante SVD-LLM y edicion posterior de componentes |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Meta-Llama-3-8B-Instruct (8.192 tokens) |
| Tipos de cuantizacion | No disponibles en el repositorio; solo se publican pesos en safetensors de precision completa (16,1 GB de repo para 8,03 mil millones de parametros) |
| Idiomas soportados | No especificados; heredados nominalmente del modelo base (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3 (Meta Llama 3 Community License), con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors |
| Fraccion de parametros resultante | 0,6999 (compresion del 30,01 %) |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Componentes restaurados / sustituidos | 3.559 restaurados / 3.559 sustituidos |
| Rondas iterativas aplicadas | 3 de 10 (checkpoint intermedio) |
| Parametros intercambiados | 20.919.296 (0,30 % de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Fecha de creacion (repo) | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atencion causal y normalizacion RMSNorm. Sobre ese checkpoint no se realiza ningun entrenamiento adicional; la intervencion es puramente post-hoc y consta de dos fases. La primera es una compresion SVD-LLM que elimina el 30,01 % de los parametros, principalmente en las matrices de proyeccion. La segunda es un procedimiento de edicion de parametros denominado swap, descrito como neutral en cuanto a parametros: en cada ronda se sustituyen 3.559 componentes por otros tantos, con un presupuesto del 0,100 % de los parametros densos por ronda y un total previsto del 1,000 %. En este checkpoint se han aplicado 3 de las 10 rondas, de modo que el presupuesto consumido es parcial y el artefacto corresponde a un estado intermedio de la ejecucion.

La regla de seleccion evaluada en esta celda es `gap_iter`, una de las variantes de la rejilla experimental. El valor de intercambio empleado es `insert`, con desalojo de componentes ordenado por su valor sigma. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni fases de RLHF o DPO, porque no existen: el modelo base ya estaba alineado por instrucciones y este derivado no recibe entrenamiento adicional. Tampoco se detallan innovaciones de decodificacion (decodificacion especulativa, atencion lineal u otras); su unico mecanismo diferencial es el propio pipeline de compresion y restauracion de componentes.

## Capacidades

- Generacion de texto y conversacion multi-turno: capacidades nominales heredadas de Meta-Llama-3-8B-Instruct, no verificadas ni garantizadas en esta ficha tras la compresion.
- Razonamiento, codigo y matematicas: heredados del modelo base; no se publican evaluaciones especificas en esta celda.
- Soporte multilingue: heredado nominalmente del base; la model card no documenta idiomas.
- Tool calling y function calling: no documentado en la model card. El modelo base Llama 3 8B Instruct soporta plantillas de herramientas, pero no hay confirmacion de que esta edicion las conserve intactas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidad especial del artefacto: servir como sujeto experimental para medir el efecto de la compresion SVD sobre la seguridad y el sobrerrechazo, y para comparar reglas de seleccion de componentes (`gap_iter` frente a otras de la rejilla).
- Compatibilidad de despliegue: etiquetado con `text-generation-inference` y `endpoints_compatible`, lo que indica que puede servirse mediante TGI.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar el checkpoint como celda de control frente a otras reglas de seleccion de la misma rejilla para aislar cuanto dano de seguridad introduce la compresion SVD y cuanto recupera cada regla.
- Auditoria de jailbreak en modelos comprimidos: reproducir las mediciones de AdvBench ASR (0,2400) y StrongREJECT ASR (0,1750) con juez HarmBench y compararlas con el modelo sin comprimir y con otras celdas.
- Medicion de sobrerrechazo: emplear la metrica macro over-refusal de WildGuard (0,0826) para cuantificar si la restauracion de componentes recupera utilidad conversacional a costa de rechazar peticiones benignas.
- Estudio de edicion de parametros: analizar la dinamica ronda a ronda del swap neutral en parametros, dado que el repositorio expone un estado intermedio (ronda 3 de 10) con presupuesto del 0,100 % por ronda.
- Reproducibilidad experimental: la semilla fija (42), la regla `gap_iter` y el presupuesto documentado permiten repetir la ejecucion y validar la seleccion de los 3.559 componentes.
- Pipeline de evaluacion continua de seguridad: integrar el checkpoint como sujeto de prueba en un CI que ejecute AdvBench, StrongREJECT y WildGuard sobre cada nuevo artefacto comprimido antes de descartarlo o promoverlo.
- Docencia y divulgacion tecnica: ilustrar con un caso real como una compresion agresiva de matrices de proyeccion degrada el comportamiento de rechazo de un modelo alineado, sin necesidad de entrenar nada.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son metricas de seguridad y sobrerrechazo, todas medidas con juez HarmBench salvo la de sobrerrechazo:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2400 |
| StrongREJECT ASR (juez HarmBench) | 0,1750 |
| Macro over-refusal (WildGuard) | 0,0826 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se proporcionan las cifras equivalentes del modelo base sin comprimir, por lo que no es posible calcular la degradacion relativa a partir de los datos suministrados.

## Requisitos de hardware

- VRAM estimada en precision completa: aproximadamente 16,1 GB solo de pesos (coincide con el tamano del repositorio y con 8,03 mil millones de parametros), mas la cache KV, que para 8.192 tokens de contexto con Llama 3 8B ronda 1-2 GB adicionales.
- VRAM estimada con cuantizacion de 8 bits: del orden de 9-10 GB de pesos mas cache KV.
- VRAM estimada con cuantizacion de 4 bits: del orden de 5-6 GB de pesos mas cache KV. Ninguna de estas cuantizaciones esta publicada en el repositorio, por lo que habria que generarlas.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. Una A100 40 GB es suficiente para inferencia en precision completa con contexto moderado.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en precision completa si se limita el contexto; con cuantizacion de 8 o 4 bits tambien en tarjetas de 12-16 GB, siempre que se genere el artefacto cuantizado.
- Opciones de despliegue: `transformers` (libreria declarada), TGI (etiquetas `text-generation-inference` y `endpoints_compatible`). El soporte de vLLM no esta documentado, aunque la arquitectura Llama es compatible en la practica. No se publican pesos GGUF, de modo que llama.cpp u Ollama exigirian una conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r03 (este) | 8.030.261.248 (fraccion densa 0,6999) | No especificado; 8.192 en el base | Llama 3 | safetensors | Artefacto de investigacion, 3 de 10 rondas, ASR AdvBench 0,2400 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | Llama 3 | safetensors | Modelo base sin comprimir; referencia de seguridad y utilidad, pero el repositorio no publica sus ASR con el mismo juez |
| Jeesup/svd-safety-l2_remove30_swapgapiter_b010_r03 | No disponible | No disponible | Llama 3 | safetensors | Celda hermana de la misma rejilla sobre Llama 2; las metricas no se han confirmado en la informacion disponible |
| Otras celdas de la rejilla del autor (reglas de seleccion y presupuestos alternativos) | No disponible | No disponible | Llama 3 | safetensors | No se han podido enumerar ni comparar con los datos suministrados |

## Limitaciones y advertencias

- No es un modelo para produccion: el propio autor lo describe como artefacto de investigacion y sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma intencionada en algunas celdas de la rejilla: la compresion por si sola eleva la tasa de exito de ataque, y este checkpoint es una de las configuraciones parcialmente restauradas (3 de 10 rondas), por lo que su comportamiento de rechazo no equivale al del modelo base.
- Riesgo de alucinacion: no cuantificado en la model card; la compresion de matrices de proyeccion puede afectar a la fidelidad de forma no medida en los datos disponibles.
- Ausencia de benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones multilingues, de modo que no se puede afirmar que las capacidades del base se conserven.
- Idiomas: no documentados en este repositorio; cualquier afirmacion sobre cobertura multilingue es una extrapolacion del modelo base y debe validarse.
- Sesgos: no se han publicado analisis de sesgo para este checkpoint.
- Licencia: se rige por la Meta Llama 3 Community License e incluye `USE_POLICY.md`; el uso comercial esta sujeto a esas condiciones y a las obligaciones de atribucion ("Built with Meta Llama 3").
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de terceros.
- Antes de extraer cualquier conclusion, el autor recomienda evaluar el checkpoint de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r03
- Celda hermana encontrada en la busqueda web: https://huggingface.co/Jeesup/svd-safety-l2_remove30_swapgapiter_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: incluida como `LICENSE` y `USE_POLICY.md` en el propio repositorio del modelo
- Paper de SVD-LLM, repositorio del autor, demos o blogs adicionales: no disponibles en la informacion proporcionada (los resultados de busqueda web recibidos no contienen enlaces relevantes al modelo)
