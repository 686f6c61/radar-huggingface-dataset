# CivMarshmallow/CivTelescope

## Resumen

CivTelescope es un modelo juez (*reward model* de tipo *LLM-as-a-judge*) desarrollado por CivMarshmallow en el contexto del trabajo *Rome Wasn't Built in One Turn: Replay-Grounded Reward Signals for Long-Horizon Freeciv Agents*. Su función concreta es, dada una pareja de posiciones de una partida de Freeciv, predecir cuál de las dos alcanza una puntuación terminal mayor si la partida se juega hasta el final. Se trata, por tanto, de un modelo especializado en evaluación comparativa de estados dentro de un entorno de juego de estrategia por turnos, no de un modelo de propósito general.

Técnicamente es un ajuste fino mediante LoRA (rango 16, alpha 32) sobre Qwen2.5-7B-Instruct, aplicado únicamente a las proyecciones `q_proj` y `v_proj`. El adaptador se distribuye como un *state dict* de PyTorch (`lora.pt`) que no está en formato PEFT y debe fusionarse con el modelo base mediante un script del repositorio de código. Los datos de entrenamiento son 10.800 pares de posiciones etiquetados a partir de repeticiones (*replays*) generadas con CivHarness.

Su relevancia es acotada pero técnicamente interesante: el modelo sirve como señal de recompensa densa para el entrenamiento por refuerzo de agentes de Freeciv (las políticas entrenadas con él se publican como CivMarshmallow-Qwen3-8B). Los resultados reportados muestran una ventaja notable frente a modelos frontera en pares "trampa", aquellos en los que la posición con mayor puntuación actual acaba con menor puntuación terminal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA en `q_proj` y `v_proj` |
| Parametros totales | 7B (modelo base); el adaptador LoRA es de rango 16 con alpha 32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-7B-Instruct; no especificada en la información proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `lora.pt` (state dict de PyTorch, no PEFT); requiere fusión con el modelo base para su uso |

## Arquitectura y entrenamiento

CivTelescope parte de Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros, y le aplica un ajuste fino con LoRA de rango 16 y alpha 32 restringido a las proyecciones de query y value (`q_proj`, `v_proj`) de las capas de atención. No se modifica el resto de pesos; el adaptador se publica como un *state dict* de PyTorch que debe fusionarse con el modelo base mediante `scripts/merge_lora.py` del repositorio de código.

El entrenamiento se realizó sobre 10.800 pares de posiciones de Freeciv. Las etiquetas no provienen de anotación humana ni de un modelo generador, sino de repeticiones (*replays*) ejecutadas con CivHarness: para cada par se determina qué posición alcanza mayor puntuación terminal al completar la partida. El modelo se formula como un juez por pares que recibe dos posiciones y emite una predicción comparativa. No se detalla en la información disponible la composición del dataset más allá del número de pares, ni si hubo fases adicionales de RLHF o DPO sobre el juez.

## Capacidades

- Evaluación comparativa por pares de posiciones de Freeciv: dado un par de estados, predice cuál conduce a mayor puntuación terminal.
- Juicio con señal a largo plazo: distingue posiciones "trampa" en las que la puntuación actual es engañosa respecto al resultado final.
- Uso como *reward model* denso en pipelines de aprendizaje por refuerzo para agentes de Freeciv.
- Integración con CivHarness para la generación de etiquetas y con el script `scripts/eval_civtelescope.py` para evaluación con el *prompt* del artículo.
- Capacidad de generalización parcial a *rulesets* no vistos (evaluado en el *ruleset* clásico no visto durante el entrenamiento).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido; el modelo está especializado exclusivamente en la tarea de juicio descrita.

## Casos de uso

- Entrenamiento por refuerzo de agentes de Freeciv: CivTelescope se sirve como `CIVTELESCOPE_HF` durante el entrenamiento de políticas y proporciona una recompensa densa por par de posiciones, lo que permite optimizar políticas de horizonte largo sin depender solo de la recompensa terminal.
- Filtrado y curación de trayectorias: dado un conjunto de repeticiones de partidas, el juez puede ordenar o descartar posiciones que aparentan ir bien a corto plazo pero conducen a peores resultados finales, mejorando la calidad de los datos de entrenamiento.
- Evaluación de políticas candidatas: comparar dos políticas enfrentando sus posiciones en pares y midiendo la tasa de acierto del juez como proxy de la calidad estratégica de cada política.
- Investigación en reward modeling para juegos de estrategia: servir de referencia reproducible para estudiar señales de recompensa basadas en repeticiones frente a recompensas basadas en puntuación inmediata.
- Análisis de "trampas" estratégicas: identificar y estudiar pares de posiciones donde la métrica inmediata invierte el orden respecto al resultado final, útil para diagnosticar sesgos de optimización miope.
- Detección de generalización a nuevos *rulesets*: usar el modelo como sonda para medir cuánto de la señal aprendida depende de las reglas concretas de Freeciv y cuánto es estrategia transferible.

## Benchmarks y rendimiento

| Evaluación | Exactitud |
|---|---|
| Pares trampa reservados (*held-out trap pairs*) | 0,775 |
| Pares no trampa reservados (*held-out non-trap pairs*) | 0,878 |
| Pares trampa con *ruleset* clásico no visto | 0,592 |

En los mismos pares trampa reservados, cinco modelos frontera obtienen entre 0,26 y 0,34 de exactitud, según la model card. No se publican resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador `lora.pt` ocupa prácticamente nada (el repositorio reporta 0,0 GB); el coste real está en el modelo base Qwen2.5-7B-Instruct fusionado.
- VRAM estimada para inferencia en FP16/BF16: en torno a 14-16 GB para el modelo fusionado, más el *overhead* de contexto y del *prompt* de juicio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16. En GPUs de consumo con 16 GB sería necesario cuantizar, aunque no se documentan cuantizaciones oficiales.
- No se proporcionan datos de latencia ni de *throughput*; al ser un juez por pares con *prompt* largo, la latencia dependerá del número de tokens de cada posición serializada.
- Opciones de despliegue: al no estar en formato PEFT, requiere primero la fusión con el modelo base; una vez fusionado, puede servirse con vLLM, TGI, llama.cpp u Ollama si se generan los pesos en los formatos correspondientes. El repositorio solo documenta el flujo de fusión y el script de evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CivTelescope | 7B (base) + LoRA r16 | No disponible | Juez por pares de posiciones de Freeciv | Apache 2.0 | HuggingFace (adaptador `lora.pt`) |
| Qwen2.5-7B-Instruct | 7B | No disponible en esta ficha | Modelo generalista de instrucciones | Apache 2.0 | HuggingFace |
| Modelos frontera evaluados en el artículo | No disponible | No disponible | Juicio generalista aplicado a pares de Freeciv | No disponible | No disponible |

La comparación relevante es frente a los cinco modelos frontera citados en la model card, que obtienen 0,26-0,34 de exactitud en pares trampa reservados frente a 0,775 de CivTelescope. No se detallan en la información disponible los nombres ni las versiones concretas de esos modelos.

## Limitaciones y advertencias

- Modelo altamente especializado: solo es válido para juzgar pares de posiciones de Freeciv; no debe usarse como modelo de propósito general ni como juez de otros dominios.
- Generalización limitada a nuevos *rulesets*: la exactitud cae de 0,775 a 0,592 en pares trampa con el *ruleset* clásico no visto, lo que indica dependencia de las reglas de entrenamiento.
- El adaptador no está en formato PEFT, lo que complica su uso directo con herramientas estándar (PEFT, vLLM con adaptadores, etc.) y obliga a fusionarlo previamente.
- Solo se declara soporte de inglés; no hay evidencia de comportamiento multilingüe.
- No se documentan sesgos específicos, riesgos de alucinación en el sentido habitual ni evaluaciones de seguridad; el riesgo principal es de calibración del juez fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene sus propios términos que deben respetarse al fusionar y redistribuir.
- El repositorio reporta 0 descargas y 0 *likes* en el momento de la consulta, por lo que no hay evidencia de validación externa independiente.
- Los resultados reportados provienen de la propia model card del autor; no se han verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CivMarshmallow/CivTelescope
- Repositorio de código: https://github.com/jamesnulliu/CivMarshmallow
- Políticas entrenadas con CivTelescope: https://huggingface.co/CivMarshmallow/CivMarshmallow-Qwen3-8B
- Políticas base (*baselines*): https://huggingface.co/CivMarshmallow/Baselines-Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
