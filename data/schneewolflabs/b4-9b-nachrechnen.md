# schneewolflabs/B4-9B-Nachrechnen

## Resumen

B4-9B-Nachrechnen es un adaptador LoRA entrenado con ORPO sobre el modelo base schneewolflabs/B4-9B, desarrollado por Schneewolf Labs. Su objetivo es corregir el comportamiento del modelo base al resolver problemas matematicos mediante herramientas: B4-9B ya invocaba herramientas aritmeticas, pero planteaba mal los problemas, enviaba programas enteros a la calculadora o ignoraba el numero devuelto por la herramienta. El adaptador ensena al modelo a decidir correctamente cuando usar `calculate`, cuando usar `run_code` (Python en sandbox) y cuando responder directamente, siempre con el modo de razonamiento (thinking) desactivado.

El adaptador tiene 29.097.984 parametros entrenables (rango 16, alpha 32, aplicado a todas las proyecciones de atencion y MLP) y se distribuye tanto en formato PEFT safetensors como en GGUF f16 para su carga en tiempo de ejecucion con llama.cpp. La model card insiste en desplegarlo como adaptador y no fusionado en un modelo cuantizado: al fusionar y cuantizar a Q8_0 se pierde la mayor parte de la mejora en MATH-500 (de 84,0 a 79,2).

Es relevante porque documenta con detalle un flujo de auto-destilacion on-policy sin modelo profesor y porque cuantifica explicitamente el efecto de la cuantizacion sobre los deltas de un LoRA de bajo rango, un problema practico habitual en el despliegue de adaptadores en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer B4-9B; rango 16, alpha 32, todas las proyecciones de atencion y MLP |
| Parametros totales | 29.097.984 (parametros del adaptador; el modelo base B4-9B no se especifica en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 4096 tokens) |
| Tipos de cuantizacion | adaptador en f16 (GGUF) y safetensors; el base se usa en Q8_0 en las mediciones |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (LoRA f16) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre B4-9B, un transformer (etiquetado como qwen3.5 en los tags) con capacidades de tool calling y vision (la model card menciona tensores de vision y MTP que el merge no toca). El entrenamiento es un LoRA con ORPO (beta 0.1, learning rate 2e-5, 2 epocas, 563 pares, longitud maxima 4096), completamente on-policy y auto-destilado, sin modelo profesor: B4-9B respondio cuatro veces cada problema de GSM8K-train y MATH-train (disjuntos de los conjuntos de test), con thinking desactivado, dentro del mismo harness de egirl y con la misma persona con la que se sirve. Cada respuesta se verifico contra la clave y los pares se cortaron en el primer turno del asistente donde las dos ejecuciones difieren, de modo que el modelo aprende la decision y no un estilo nuevo.

La composicion de los 563 pares es: 280 de best-of-N (una configuracion correcta frente a una incorrecta del mismo problema, ambas muestras propias), 90 de enrutamiento de codigo (run_code frente a un programa enviado a calculate), 40 de herramienta ignorada (respuesta que reporta el numero de la herramienta frente a una que no), 18 rescatados (quinta o sexta muestra correcta frente a una incorrecta), 70 de control (35 respuestas directas frente a busquedas innecesarias y 35 busquedas frente a respuestas obsoletas) y 81 de scratchpad (respuesta directa frente a run_code usado como print() en preguntas de ARC-train). Se descartaron problemas con figuras `[asy]`, respuestas con aritmetica falsa en la prosa y respuestas donde la clave aparecia solo incidentalmente. Los pares no se publican.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos verbales estilo GSM8K y problemas numericos de MATH.
- Tool calling: uso de una calculadora (`calculate`) y de ejecucion de codigo Python en sandbox (`run_code`).
- Decision de enrutamiento entre herramienta y respuesta directa, incluida la supresion del uso innecesario de herramientas en preguntas de conocimiento estatico (0 de 52 ejecuciones frente a 12 del base).
- Busqueda web cuando la informacion puede estar desactualizada (20 de 20 preguntas de informacion actual).
- Ejecucion de tareas de programacion en Python (37 de 44 correctas, primer programa ejecutado en 43 de 44).
- Razonamiento multi-paso dentro del harness de agentes de egirl.
- Capacidad de vision heredada del modelo base (los tensores de vision no se modifican), aunque no se entrena ni se evalua en esta ficha.
- Modo thinking desactivado en todo el entrenamiento y las evaluaciones.

## Casos de uso

- Atencion al cliente con calculos: el adaptador evita que el agente envie programas enteros a la calculadora y que ignore el resultado devuelto, lo que reduce errores en consultas de facturacion, descuentos o plazos.
- Agentes con tool calling en produccion: sirve como capa de ajuste sobre B4-9B para que el agente decida de forma fiable entre `calculate`, `run_code` y respuesta directa, con un conjunto de guardarrailes verificado (41/41 y 35/37 en los conjuntos de decision de herramienta).
- Tutoria matematica automatizada: resuelve problemas verbales y numericos mostrando el uso de la herramienta, adecuado para entornos educativos que necesitan trazabilidad del calculo.
- Automatizacion de tareas de analisis con Python: cuando el problema requiere un programa, el modelo lo ejecuta en sandbox en lugar de intentar calcular a mano, con 43 de 44 tareas ejecutando el primer programa.
- Verificacion de informacion actual: busca en web ante preguntas potencialmente obsoletas (20 de 20) y responde directamente cuando no hace falta, lo que ahorra turnos y latencia.
- Despliegue en llama.cpp con adaptador en runtime: la carga del LoRA f16 sobre un GGUF Q8_0 del base permite servir el ajuste sin recompilar ni refusionar pesos, manteniendo la mejora completa en MATH.
- Evaluacion de pipelines de cuantizacion: el caso documentado de perdida de calidad al fusionar y cuantizar sirve como referencia para decidir el formato de despliegue de adaptadores de bajo rango.

## Benchmarks y rendimiento

Mediciones con el mismo harness, persona y ajustes (thinking off). GSM8K test (1319) y subconjunto de respuesta numerica de MATH-500 (318). Dos numeros por celda indican dos pasadas.

| Metrica | B4-9B | Primer intento (A) | Este adaptador |
|---|---|---|---|
| GSM8K test | 83,7 / 84,0 | 86,5 / 86,2 | 86,8 / 86,7 |
| MATH-500 numerico | 78,6 / 78,6 | 81,4 / 82,4 | 84,0 / 84,3 |
| Ejecuciones que enviaron codigo a `calculate` | 86 / 100 | 16 / 19 | no contabilizado |
| Herramienta usada en preguntas de conocimiento estatico (52) | 12 | 11 (9 scratchpad) | 0 |
| Preguntas que requieren programa correctas (30) | 29 | 28 | 26 |
| Preguntas de informacion actual buscadas (20) | 19 | 20 | 20 |
| Tareas de programa Python correctas / primer programa ejecutado (44) | 35 / 39 | 36 / 43 | 37 / 43 |
| Conjuntos de decision de herramienta (41 + 37) | 41, 35 | 40, 36 | 41, 35 |
| ARC / ARC-Easy / TruthfulQA | 61,2 / 84,4 / 36,6 | 60,9 / 83,9 / 36,7 | 60,2 / 84,4 / 37,1 |

Efecto de la fusion y cuantizacion (una pasada de rcbench):

| Metrica | B4-9B | B4-9B Q8_0 + LoRA f16 | Fusionado y luego Q8_0 |
|---|---|---|---|
| GSM8K test | 83,7 | 86,8 | 86,4 |
| MATH-500 numerico | 78,6 | 84,0 | 79,2 |
| Ejecuciones de GSM8K que usan `run_code` | 5 | 212 | 93 |

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,2 GB (tamano del repo) y se carga junto al modelo base; los requisitos de VRAM dependen enteramente de B4-9B, cuyas especificaciones completas no estan disponibles en la informacion proporcionada.
- Con el base en Q8_0, el adaptador f16 se anade en runtime con llama.cpp: `llama-server -m B4-9B-Q8_0.gguf --lora B4-9B-Nachrechnen-LoRA-f16.gguf`.
- GPU recomendadas: no disponible. No se publican mediciones de VRAM, latencia ni throughput.
- Compatibilidad con GPU de consumo: no verificada en la informacion disponible; depende del tamano y la cuantizacion del base B4-9B.
- Opciones de despliegue: llama.cpp (ruta validada y medida), PEFT con la libreria transformers (formato safetensors), y el harness de agentes egirl con API compatible con OpenAI. vLLM, TGI y Ollama no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La unica comparacion publicada es interna, entre el modelo base y una version previa del adaptador:

| Modelo | Parametros | Contexto | MATH-500 numerico | GSM8K test | Licencia |
|---|---|---|---|---|---|
| B4-9B (base) | no disponible | no disponible | 78,6 | 83,7 | apache-2.0 |
| B4-9B + primer intento (A) | 29,1 M (adaptador) | no disponible | 81,4 / 82,4 | 86,5 / 86,2 | apache-2.0 |
| B4-9B-Nachrechnen | 29,1 M (adaptador) | no disponible | 84,0 / 84,3 | 86,8 / 86,7 | apache-2.0 |

## Limitaciones y advertencias

- Entrenado y medido unicamente dentro del harness de egirl con la persona Familiar y sus esquemas de herramientas; otros prompts y formatos de tool calling no se han probado.
- Alcance exclusivamente matematico: problemas verbales estilo GSM8K y problemas numericos de MATH. No se entrenan ni miden demostraciones ni respuestas simbolicas.
- Sigue confiando en la salida de sus propios programas cuando el programa es erroneo: en el caso documentado de numeros amigos sumo solo el menor de cada par y reporto ese resultado sin detectar el fallo. Esta debilidad ya existia en B4 y el adaptador no la corrige.
- Empeora ligeramente en preguntas que requieren programa (26 de 30 frente a 29 del base) y en ARC (60,2 frente a 61,2).
- La fusion seguida de cuantizacion Q8_0 destruye la mayor parte de la mejora en MATH-500 (79,2 frente a 84,0 con el adaptador en runtime); si se necesita un unico fichero, hay que mantener las proyecciones modificadas en f16/bf16 y medir antes de confiar en el resultado.
- Solo se declara soporte de ingles; no hay evaluacion multilingue.
- Riesgo de alucinacion no cuantificado de forma especifica; TruthfulQA se mantiene practicamente plano (37,1 frente a 36,6 del base).
- Los pares de entrenamiento no se publican, lo que limita la reproducibilidad del ajuste.
- Licencia apache-2.0, que permite uso comercial, pero sujeta a la licencia y condiciones del modelo base B4-9B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schneewolflabs/B4-9B-Nachrechnen
- Modelo base: https://huggingface.co/schneewolflabs/B4-9B
- Repositorio del harness egirl: https://github.com/Schneewolf-Labs/egirl
