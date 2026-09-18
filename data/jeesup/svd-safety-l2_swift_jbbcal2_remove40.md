# Jeesup/svd-safety-l2_swift_jbbcal2_remove40

## Resumen

svd-safety-l2_swift_jbbcal2_remove40 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf al que se le ha aplicado una compresion SVD-LLM que elimina el 40,00% de los parametros densos, dejando una fraccion de parametros resultante de 0,5998 (6.738.415.616 parametros medidos en los safetensors publicados). Sobre esa base comprimida se aplica un presupuesto de restauracion de componentes SVD del 0,000%, con 0 componentes restaurados y 0 intercambiados, seleccionados mediante una regla etiquetada como `unknown` en la propia model card. El autor (Jeesup) lo publica como artefacto de investigacion, no como modelo de chat de proposito general.

El interes del checkpoint es metodologico: forma parte de una rejilla experimental sobre reglas de seleccion de componentes y presupuestos de restauracion, cuyo objetivo es medir como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que regla repara mejor ese dano. La propia model card advierte de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, y que la compresion por si sola eleva la tasa de exito de ataque.

Es relevante ahora porque conecta dos lineas activas: la compresion agresiva de pesos para reducir coste de inferencia y el analisis de robustez de las salvaguardas de seguridad bajo transformaciones de pesos. Al tratarse de una unica celda de una rejilla, su valor esta en la comparacion controlada (semilla 42, presupuesto fijo, regla fija) mas que en su uso como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2, con pesos comprimidos mediante SVD-LLM (aproximacion de bajo rango) |
| Parametros totales | 6.738.415.616 (fraccion de parametros densos resultante: 0,5998) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors sin cuantizar (13,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Metodo de compresion | SVD-LLM, 40,00% de parametros eliminados |
| Regla de seleccion de componentes | `unknown` |
| Presupuesto de restauracion | 0,000% de los parametros densos |
| Componentes restaurados / intercambiados | 0 / 0 |
| Semilla | 42 |
| Pipeline | text-generation |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

No hay entrenamiento adicional documentado: el checkpoint se obtiene por transformacion de pesos del modelo base. La arquitectura subyacente es la de Llama-2-7b-chat (transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y RoPE), y la intervencion consiste en una compresion SVD-LLM que elimina el 40,00% de los parametros densos mediante aproximaciones de bajo rango de las matrices de pesos. El resultado declarado es una fraccion de parametros de 0,5998 respecto al modelo denso original.

La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO especificas para este artefacto; el ajuste conversacional procede del modelo base Llama-2-7b-chat. Tampoco se describen innovaciones de decodificacion (decodificacion especulativa, atencion lineal u otras): la unica innovacion tecnica relevante es el propio procedimiento de compresion y, en la rejilla completa, la regla de seleccion de componentes SVD a restaurar, que en esta celda concreta queda identificada como `unknown` y con presupuesto cero.

## Capacidades

- Generacion de texto conversacional en modo chat, heredada del modelo base Llama-2-7b-chat, con la degradacion esperable por la compresion al 60% de parametros.
- Razonamiento basico y respuesta a instrucciones propias de un modelo de 7B de su generacion.
- Capacidad de rechazo de peticiones: la metrica de sobre-rechazo macro (WildGuard) es de 0,4228, lo que indica una tasa elevada de rechazo tambien ante peticiones benignas.
- Resistencia parcial a ataques de jailbreak: ASR de 0,0327 en AdvBench y 0,0479 en StrongREJECT segun el juez HarmBench. Son tasas no nulas, es decir, el modelo es vulnerables en un porcentaje medible de casos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo es exclusivamente de texto.
- Utilidad principal como sujeto experimental: permite medir el efecto de la compresion SVD sobre seguridad y perplejidad de forma aislada y reproducible (semilla 42).

## Casos de uso

- Estudio de la degradacion de seguridad por compresion: usar este checkpoint junto con el modelo denso original y otras celdas de la rejilla para cuantificar cuanto sube el ASR (AdvBench, StrongREJECT) al eliminar el 40,00% de parametros, manteniendo constante el resto de variables.
- Evaluacion de reglas de seleccion de componentes SVD: al ser una celda con regla `unknown` y presupuesto 0,000%, sirve como linea base contra celdas con presupuestos mayores para determinar que criterio de restauracion repara mejor el dano de seguridad.
- Analisis de sobre-rechazo: con una tasa macro de 0,4228 en WildGuard, es un caso de estudio util para estudiar el equilibrio entre seguridad y utilidad, midiendo cuantas peticiones benignas se rechazan tras la compresion.
- Investigacion en interpretabilidad de pesos comprimidos: comparar las matrices de bajo rango con las originales para localizar que subespacios de pesos concentran el comportamiento de rechazo.
- Reproducibilidad de experimentos: con semilla 42 y presupuesto fijo, permite replicar resultados y auditar la metodologia de compresion SVD-LLM en un entorno controlado.
- Docencia y formacion: ejemplo practico de artefacto de investigacion publicado en el Hub que no debe desplegarse como asistente, util para explicar la diferencia entre checkpoint experimental y modelo listo para produccion.
- Analisis de perplejidad y calidad de lenguaje: la perplejidad de 11,1570 en WikiText-2 sirve para medir el coste en calidad de lenguaje de la compresion al 60% de parametros.
- No recomendado como asistente en produccion ni en atencion al cliente: la model card indica explicitamente que es un sujeto experimental y que debe evaluarse antes de extraer conclusiones.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0327 |
| StrongREJECT | ASR (juez HarmBench) | 0,0479 |
| WildGuard | Sobre-rechazo macro | 0,4228 |
| WikiText-2 | Perplejidad | 11,1570 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base denso ni frente a otras celdas de la rejilla (MMLU, HumanEval, GSM8K u otros), por lo que no es posible establecer una comparacion cuantitativa del coste de la compresion mas alla de las cuatro metricas anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica, 16 GB de VRAM es el minimo recomendado con contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7 GB de pesos; viable en GPUs de 8-12 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3,5-4 GB de pesos; viable en GPUs consumer de gama media con 8 GB o mas, aunque el repositorio no publica pesos cuantizados.
- GPUs recomendadas: A100 40/80 GB, H100 y L40S para servicio concurrente; RTX 4090, RTX 3090, RTX 4080 para experimentacion local en fp16 o cuantizado.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) sin cuantizar y en GPUs de 8-12 GB tras cuantizacion a 4 u 8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el modelo incluye la etiqueta text-generation-inference y endpoints_compatible), vLLM, y conversion manual a GGUF para llama.cpp u Ollama, ya que el repositorio no incluye pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Rendimiento |
|---|---|---|---|---|---|
| svd-safety-l2_swift_jbbcal2_remove40 | 6,738 B (60% del denso) | 4096 | Llama 2 Community License | Checkpoint de investigacion comprimido | ASR AdvBench 0,0327; ASR StrongREJECT 0,0479; sobre-rechazo 0,4228; ppl WikiText-2 11,1570 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B (denso) | 4096 | Llama 2 Community License | Modelo de chat alineado | no disponible en la informacion proporcionada para comparacion directa |
| Otras celdas de la rejilla SVD-LLM del mismo autor | no disponible | no disponible | Llama 2 Community License | Checkpoints de investigacion | no disponible |
| Modelos instruct de 7B de uso general | no disponible | no disponible | no disponible | Modelos de chat | no disponible |

La unica comparacion metodologicamente valida con los datos aportados es contra Llama-2-7b-chat-hf como linea base densa, pero la model card no incluye sus valores numericos en las mismas metricas, por lo que la comparacion cuantitativa queda pendiente de reproduccion.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la model card indica explicitamente que es una celda de una rejilla y que no debe tratarse como un modelo de chat de proposito general.
- Seguridad deliberadamente degradada en varias celdas de la rejilla: la compresion por si sola eleva la tasa de exito de ataque, y el objetivo del estudio es cuantificarlo; las tasas medidas (ASR 0,0327 en AdvBench y 0,0479 en StrongREJECT) son distintas de cero.
- Sobre-rechazo elevado: 0,4228 macro en WildGuard implica que el modelo rechaza una proporcion alta de peticiones benignas, lo que limita su utilidad conversacional.
- Perplejidad de 11,1570 en WikiText-2: indica degradacion de la calidad del modelado de lenguaje respecto de un modelo denso de referencia, aunque no se aporta la cifra base para comparar.
- Sin datos de sesgos, idiomas soportados ni evaluaciones multilingues en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de 7B de su generacion y presumiblemente amplificado por la compresion.
- Limitacion de contexto: ventana de 4096 tokens heredada de Llama-2-7b-chat, insuficiente para tareas de contexto largo.
- Restricciones de licencia: Llama 2 Community License; el uso comercial esta permitido bajo las condiciones de la licencia, que exige mantener los avisos de atribucion ("Built with Llama") y solicitar licencia a Meta por encima de 700 millones de usuarios activos mensuales. Se incluyen LICENSE.txt y USE_POLICY.md en el repositorio.
- Ausencia de validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de comportamiento.
- Regla de seleccion de componentes etiquetada como `unknown`: reduce la trazabilidad metodologica de esta celda concreta.
- Metadatos de publicacion con fecha 2026-09-18 en el Hub, que conviene verificar antes de citar el artefacto.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), por lo que cualquier despliegue eficiente requiere conversion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_swift_jbbcal2_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio como LICENSE.txt): https://ai.meta.com/llama/license/
- Politica de uso aceptable de Llama 2 (incluida en el repositorio como USE_POLICY.md): https://ai.meta.com/llama/use-policy/
- Paper de SVD-LLM (metodo de compresion citado): no disponible en la informacion proporcionada
- Paper de referencia de Llama 2: no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
