# hunterbown/trainless-toolcall-2b

## Resumen

Trainless Tool Call 2B es un adaptador LoRA de rango uno diseñado para modificar el comportamiento de llamada a funciones del modelo base Qwen/Qwen3.5-2B. Lo desarrolla hunterbown y se distribuye bajo licencia Apache 2.0. El adaptador no es un checkpoint completo: requiere el modelo base para funcionar. Su objetivo es concreto: aumentar la frecuencia con la que el modelo invoca una función proporcionada cuando esta encaja, en lugar de responder en texto plano.

La relevancia técnica del proyecto reside en su metodo de construccion. No se ha empleado entrenamiento por gradientes ni optimizacion de una funcion de perdida. En su lugar, se identifica una direccion en el espacio de activaciones (la diferencia media entre casos relevantes respondidos en texto y casos relevantes con llamada a funcion) y se elimina esa direccion de la escritura de una unica capa MLP (capa 10) con una fuerza de 4, mediante la operacion W' = W - 4·u(uᵀW). Este enfoque se etiqueta como weight-space programming o edicion de pesos sin entrenamiento.

El adaptador se evaluo sobre 703 casos reservados del Berkeley Function-Calling Leaderboard v4, con decodificacion greedy y sin system prompt. El resultado principal es una mejora de 3,7 puntos porcentuales sobre el modelo base (74,8% a 78,5%), con un intervalo de confianza del 95% de 1,7 a 5,7 puntos. No obstante, el propio autor advierte que no supera a un buen system prompt en precision y que su principal ventaja es reducir las llamadas innecesarias en casos sin herramienta aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango uno sobre Qwen/Qwen3.5-2B (modifica `mlp.down_proj` de la capa 10) |
| Parametros totales | No disponible (adaptador de rango uno; el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se evaluo sin cuantizar; builds cuantizados no probados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-2B, un transformer de 2B parametros, y consiste en una edicion de pesos de rango uno aplicada a la matriz `mlp.down_proj` de la capa 10. La edicion no emplea gradientes, optimizador ni ajuste a una funcion de perdida: se calcula una direccion en el flujo residual tras la capa 10 en la ultima posicion del prompt, como la diferencia entre la media de casos relevantes respondidos en texto y la media de casos relevantes con llamada a funcion. Esa direccion se resta de la escritura de la capa con fuerza 4.

La metodologia sigue un protocolo estricto de separacion de datos: los 1.498 casos de BFCL se dividieron mediante `sha256(category/id) mod 4` antes de construir nada, reservando el resto 0 para construccion, el 1 para desarrollo y los restos 2 y 3 para test. La capa y la fuerza se seleccionaron sobre los casos de desarrollo. El criterio de exito se fijo antes de leer ningun caso de test y se cumplio (el intervalo de confianza del 95% de la mejora sobre la base queda por encima de cero). Se incluyeron tres controles con direcciones aleatorias en la misma capa y fuerza, que puntuaron 510, 522 y 522 de 703 frente a 554 de la edicion y 524 de la base (estos cinco valores proceden de una ejecucion en Transformers del modelo bf16, no del adaptador en vLLM). Antes de la exportacion se realizo un cribado de rechazo sobre las primeras 64 peticiones de AdvBench: tanto la base como el modelo editado rechazaron 63, mediante un clasificador de frases de rechazo, no una evaluacion de seguridad completa.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.5-2B.
- Llamada a funciones (function calling): el adaptador aumenta la probabilidad de que el modelo invoque una herramienta proporcionada cuando esta encaja.
- Reduccion de llamadas innecesarias en casos sin herramienta aplicable en comparacion con un system prompt fuerte (23 frente a 58 sobre 107 casos de irrelevancia).
- Soporte de llamadas en paralelo (aunque inferior al system prompt: 53 frente a 72 de 86 correctas).
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Modo thinking: no evaluado (las pruebas se realizaron con thinking desactivado).
- No mejora la precision en el uso de herramientas cuando el modelo base ya realizaba la llamada; los errores de argumentos permanecen iguales.

## Casos de uso

- Integracion en pipelines de agentes con herramientas: el adaptador puede reducir la tasa de respuestas en texto cuando existe una funcion aplicable, lo que resulta util en orquestadores que esperan una llamada estructurada en lugar de una respuesta conversacional.
- Sustitucion de system prompts largos de tool use: en escenarios donde el presupuesto de contexto es limitado o se quiere evitar el coste de un prompt de sistema extenso, el adaptador ofrece un comportamiento similar en cuanto a activacion de llamadas (aunque con mas falsos positivos que el prompt en casos sin herramienta).
- Despliegue en entornos con restricciones de VRAM: al ser un adaptador de rango uno sobre un modelo de 2B, el coste adicional de memoria es minimo y puede combinarse con cuantizacion del modelo base (aunque esta combinacion no ha sido probada por el autor).
- Prototipado rapido de asistentes con function calling: util para experimentar con comportamiento de llamada a funciones sin reentrenar el modelo base ni disponer de un dataset etiquetado de tool use.
- Investigacion en edicion de pesos: sirve como ejemplo reproducible de weight-space programming aplicado a un comportamiento concreto (call-when-a-tool-fits) y como referencia metodologica para experimentos de control con direcciones aleatorias.
- Evaluacion comparativa de estrategias de tool use: permite contrastar en un mismo modelo base el efecto de un system prompt fuerte frente a una edicion de pesos, con datos publicos de los 703 casos y las 2.109 generaciones en el repositorio.

## Benchmarks y rendimiento

Resultados sobre 703 casos reservados de BFCL v4 (seis categorias de un solo turno, thinking off, decodificacion greedy, sin system prompt, limite de 1.024 tokens de salida):

| Arm | Correctos | Intervalo Wilson 95% | Casos relevantes sin llamada | Casos irrelevantes con llamada |
|---|---:|---:|---:|---:|
| Base | 526/703 (74,8%) | 71,5–77,9% | 84 de 596 | 18 de 107 |
| Base + system prompt fuerte de tool use | 544/703 (77,4%) | 74,1–80,3% | 10 | 58 |
| Base + adaptador, sin system prompt | 552/703 (78,5%) | 75,3–81,4% | 46 | 23 |

Mejora pareada sobre la base: 3,7 puntos porcentuales (intervalo bootstrap 95%: 1,7 a 5,7). El adaptador corrigio 38 casos que la base fallaba y perdio 12 que acertaba. Frente al system prompt fuerte, la diferencia es de +1,1 puntos con intervalo de -1,7 a +4,1 (empate estadistico).

Desglose por categoria (n):

| Categoria | Base | System prompt fuerte | Adaptador |
|---|---:|---:|---:|
| simple_python (194) | 149 | 171 | 167 |
| multiple (102) | 88 | 86 | 88 |
| parallel (86) | 40 | 72 | 53 |
| parallel_multiple (89) | 70 | 74 | 75 |
| live_simple (125) | 90 | 92 | 85 |
| irrelevance (107) | 89 | 49 | 84 |

Efecto sobre respuestas ordinarias (vLLM, sin definiciones de herramienta, thinking off, greedy, limite de 4.096 tokens):

| Benchmark | n | Base | Adaptador | Diferencia pareada (IC 95%) |
|---|---:|---:|---:|---|
| GSM8K test, primeros 500 | 500 | 407 | 399 | -1,6 puntos (-4,4 a +1,2) |
| MATH-500, primeros 200 | 200 | 143 | 144 | +0,5 puntos (-4,5 a +5,5) |

Ninguno de los dos brazos emitio llamadas a herramienta cuando no se ofrecian herramientas. No se detecto dano, pero no se descarta una perdida de hasta unos 4 puntos. No se evaluo el seguimiento de instrucciones ni el comportamiento con thinking activado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador; al ser un LoRA de rango uno sobre Qwen3.5-2B, el coste adicional sobre el modelo base es minimo.
- GPU recomendadas: no disponible. Las pruebas se realizaron en vLLM sobre un host con GPU y en Transformers con el modelo en bf16, sin especificar el hardware.
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo base (2B), aunque el autor no proporciona datos concretos.
- Opciones de despliegue: vLLM (usado en la evaluacion principal), Transformers y PEFT (usado en los controles). No se probaron llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Builds cuantizados no probados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trainless Tool Call 2B (este) | Adaptador rango uno sobre 2B | No disponible | Edicion de pesos sin entrenamiento para tool calling | Apache 2.0 | Hugging Face (hunterbown) |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | Modelo base sin adaptador | No disponible en la informacion | Hugging Face |
| Base + system prompt fuerte de tool use | 2B | No disponible | Prompt engineering | No aplica | Uso directo |

No se dispone de datos de benchmarks de otros adaptadores de tool calling comparables en la informacion proporcionada. La comparativa mas directa es contra el propio modelo base y contra la estrategia de system prompt, cuyos resultados se detallan en la seccion de benchmarks.

## Limitaciones y advertencias

- No supera a un buen system prompt en precision: la diferencia es de +1,1 puntos con intervalo de -1,7 a +4,1, lo que constituye un empate estadistico. Si un system prompt ya funciona, el adaptador puede no ser necesario.
- Peor rendimiento en llamadas en paralelo que el system prompt (53 frente a 72 de 86 correctas) y perdida de 5 casos en `live_simple` frente a la base (85 frente a 90 de 125).
- Realiza 5 llamadas no deseadas mas que la base en los 107 casos sin herramienta aplicable (23 frente a 18).
- No mejora el uso de herramientas cuando el modelo base ya llamaba a una funcion: 35 de las 38 correcciones son casos en los que la base no realizaba ninguna llamada; donde ya llamaba, la precision no cambia (437 frente a 433 de 512) y los errores de argumentos son identicos.
- Alcance limitado: un modelo, un benchmark, seis categorias de un solo turno de BFCL, thinking desactivado y limite de 1.024 tokens de salida. No se probaron uso multiturno, otros idiomas, otros formatos de herramienta ni builds cuantizados.
- El cribado de rechazo con AdvBench es una comprobacion de frases, no una evaluacion de seguridad. No se han documentado sesgos conocidos.
- Riesgo de alucinacion: no evaluado de forma especifica; el adaptador no modifica el comportamiento de generacion de texto libre mas alla de lo medido en GSM8K y MATH-500.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador requiere el modelo base Qwen/Qwen3.5-2B, cuyos terminos de licencia deben consultarse por separado.
- El adaptador fue disenado y ejecutado por un agente de codigo IA (Claude Fable 5.2 en Claude Code) bajo supervision y aprobacion de Hunter Bown; esto es relevante para evaluar la trazabilidad del trabajo.
- Los casos de test se leyeron tres veces en total (test, controles y ejecucion en vLLM del adaptador); nada se ajusto sobre ellos, segun el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hunterbown/trainless-toolcall-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio BFCL (Gorilla): https://github.com/ShishirPatil/gorilla/tree/main/b
- Resultados completos por caso: `evaluation/summary.csv` (en el repositorio del modelo)
- Generaciones completas de los tres brazos: `evaluation/responses.jsonl.gz` (en el repositorio del modelo)
