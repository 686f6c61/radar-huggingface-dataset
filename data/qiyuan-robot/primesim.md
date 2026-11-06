# qiyuan-robot/PrimeSim

## Resumen

PrimeSim es un modelo del mundo (world model) concebido como simulador de robots de propósito general, desarrollado por qiyuan-robot en colaboración con laboratorios de Hong Kong y la Universidad de Pekín, según los resultados de búsqueda disponibles. El modelo genera rollouts multivista condicionados por acciones, lo que permite simular la evolución de un entorno robótico a partir de una secuencia de comandos motores sin necesidad de ejecutar físicamente el robot.

La relevancia de PrimeSim reside en su planteamiento como sustituto o complemento de la simulación física tradicional: al aprender la dinámica del entorno a partir de datos a gran escala, puede generar trayectorias mucho más largas que la ventana de contexto con la que fue entrenado. Según las fuentes consultadas, alcanza 10,1 FPS en una única GPU A100 y lidera cuatro de las cinco suites de evaluación WorldSimProbe frente a cinco líneas base de código abierto condicionadas por acción.

La información pública disponible es muy limitada: la model card en Hugging Face no contiene más que la licencia, y no se han publicado detalles sobre arquitectura, número de parámetros, contexto o datos de entrenamiento en la información proporcionada. Esta ficha refleja únicamente lo que puede verificarse en las fuentes citadas, indicando explícitamente los datos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (descrito como world model / simulador generativo multivista condicionado por acciones) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se menciona capacidad de rollouts más largos que la ventana de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna en la información proporcionada. Las fuentes describen PrimeSim como un «world model» construido como simulador de robots que cumple tres requisitos: generar observaciones multivista, estar condicionado por acciones y sostener rollouts más largos que la ventana de entrenamiento. El paper asociado (arXiv 2611.04870) se titula «A Generalist World Model Simulator from Large-Scale...», lo que sugiere un entrenamiento a gran escala, pero no se especifican el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Tampoco se detalla si la arquitectura es un transformer, un modelo de difusión o un híbrido, ni qué innovaciones concretas (atención lineal, decodificación especulativa, etc.) incorpora. Cualquier afirmación al respecto sería especulativa y no se incluye.

## Capacidades

- Simulación de entornos robóticos: genera rollouts multivista condicionados por acciones, es decir, predice la evolución visual del entorno a partir de comandos motores.
- Rollouts de largo horizonte: según las fuentes, puede generar trayectorias más largas que la ventana sobre la que fue entrenado.
- Evaluación mediante WorldSimProbe: el modelo es evaluado en cinco suites de esta batería de pruebas, liderando cuatro de ellas frente a cinco líneas base de código abierto.
- Rendimiento en tiempo real relativo: 10,1 FPS en una única GPU A100, lo que lo sitúa en un régimen utilizable para simulación interactiva.
- Capacidades de tool calling, agentes, multilingüismo, visión general, audio o modo de razonamiento: no disponibles en la información proporcionada.

## Casos de uso

- Simulación para entrenamiento de políticas robóticas: el modelo puede generar observaciones multivista condicionadas por acciones para que un agente de reinforcement learning entrene sobre rollouts sintéticos antes de transferir la política al robot físico, reduciendo el coste y el desgaste del hardware real.
- Validación de controladores antes del despliegue: un equipo puede ejecutar el controlador candidato dentro de PrimeSim y observar la evolución del entorno a 10,1 FPS en una A100, detectando fallos de comportamiento antes de probar en el robot.
- Generación de datos sintéticos para visión robótica: los rollouts multivista permiten aumentar datasets de percepción con secuencias etiquetadas por acción, útiles para entrenar modelos de detección o segmentación en dominios donde la captura real es costosa.
- Pruebas de robustez ante condiciones variadas: al ser un simulador aprendido, puede emplearse para explorar configuraciones de escena y acciones que serían peligrosas o inviables físicamente, evaluando la respuesta del sistema.
- Benchmarking de world models: investigadores pueden usar PrimeSim como referencia en WorldSimProbe para comparar nuevos modelos del mundo condicionados por acción, dado que lidera cuatro de las cinco suites.
- Planificación basada en modelo (model-based planning): el simulador puede integrarse en bucles de planificación donde el agente evalúa mentalmente secuencias de acciones mediante rollouts antes de ejecutarlas, aprovechando la capacidad de generar horizontes largos.
- Docencia y divulgación en robótica: al ejecutarse en una sola A100 y con licencia Apache 2.0, puede desplegarse en laboratorios académicos para demostrar conceptos de simulación aprendida y control.

## Benchmarks y rendimiento

| Benchmark / métrica | Resultado | Contexto |
|---|---|---|
| WorldSimProbe (5 suites) | Lidera 4 de 5 suites | Frente a cinco líneas base de código abierto condicionadas por acción |
| Throughput de inferencia | 10,1 FPS | Una única GPU A100 |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni de las puntuaciones concretas por suite de WorldSimProbe.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el número de parámetros ni el formato de pesos).
- GPU recomendadas: A100, según la medición oficial de 10,1 FPS en una única A100.
- Viabilidad en GPU de consumo: no disponible; sin datos de tamaño no puede confirmarse que quepa en RTX 4090, 3090 u otras.
- Opciones de despliegue: no se especifican en la información proporcionada (no se confirma soporte de vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: 10,1 FPS en A100 como única cifra publicada; no hay datos de latencia por fotograma ni de escalado multi-GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PrimeSim | World model / simulador robótico multivista | no disponible | no disponible | 10,1 FPS en A100; lidera 4 de 5 suites WorldSimProbe | Apache 2.0 | Hugging Face (qiyuan-robot/PrimeSim) |
| Líneas base de código abierto condicionadas por acción (5) | World models condicionados por acción | no disponible | no disponible | Inferiores a PrimeSim en 4 de 5 suites según la fuente | no disponible | no disponible |

No se dispone de nombres, parámetros ni licencias de las cinco líneas base comparadas en la información proporcionada, por lo que no es posible una comparativa detallada modelo a modelo.

## Limitaciones y advertencias

- Información técnica ausente: no se publican arquitectura, parámetros, contexto, datos de entrenamiento ni formato de pesos, lo que impide evaluar el coste real de despliegue y la reproducibilidad.
- Model card vacía: el README de Hugging Face solo contiene la licencia; no hay instrucciones de uso, ejemplos ni limitaciones declaradas por el autor.
- Simulador aprendido, no físico: al ser un world model generativo, los rollouts pueden divergir de la dinámica real del robot; no se han publicado en la información disponible métricas de fidelidad física ni estudios de transferencia sim-to-real.
- Riesgo de alucinación visual: como modelo generativo, puede producir observaciones plausibles pero incorrectas en horizontes largos, un riesgo inherente a los world models que no se cuantifica en las fuentes.
- Sesgos: no disponibles; no se documenta la composición del dataset ni la diversidad de entornos, robots o condiciones de iluminación.
- Idiomas: no aplica o no disponible; es un modelo de simulación visual, no un modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero al no haber model card detallada no puede confirmarse si hay restricciones adicionales sobre los datos de entrenamiento o los pesos derivados.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-06), lo que indica una publicación muy reciente y sin validación comunitaria.
- Dependencia de hardware: las cifras de rendimiento se miden en A100; no hay datos sobre latencia en GPU de consumo ni sobre optimizaciones de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/qiyuan-robot/PrimeSim
- Paper (arXiv): https://arxiv.org/html/2611.04870
- Artículo divulgativo (AI Weekly): https://aiweekly.co/alerts/primesim-robot-world-model-hits-101-fps-leads-4-of-5-probes
