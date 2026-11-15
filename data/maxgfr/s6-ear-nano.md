# maxgfr/s6-ear-nano

## Resumen

s6-ear-nano es un modelo de decisión ternario de 899 KB publicado por el desarrollador independiente maxgfr bajo licencia Apache 2.0. Forma parte de la familia skycmd, un conjunto de modelos de decisión "System 1" escritos en Rust que responden preguntas tipadas sobre un estado (en este caso, audio) en un único forward pass por pregunta. El modelo recibe como estado los últimos 10,24 segundos de audio a 16 kHz representados como tramas log-mel de 80 ms, y como entrada textual una pregunta y un conjunto de opciones; devuelve la opción elegida. Está pensado como el componente de escucha rápida de un agente de voz: detección de fin de turno y reconocimiento de palabras clave.

El dato más relevante de esta ficha es que el modelo **falló su puerta de validación pre-registrada** y se publica explícitamente como resultado negativo, no como modelo utilizable. En el split de test y a profundidad completa, obtuvo 0,5681 en detección de fin de turno frente a 0,8518 de Smart Turn v3.2 sobre los mismos clips, 0,8885 en las 12 clases de Speech Commands frente al umbral de 0,90, y 0,1330 en palabras clave zero-shot en francés frente al umbral de 0,20. Solo pasó la puerta de palabras clave zero-shot en inglés (0,2100 frente a 0,20). Su propio modelo de control, entrenado sin el preentrenamiento Mimi, superó al modelo en las cuatro pruebas.

La relevancia de esta ficha es, por tanto, metodológica: documenta un caso de pre-registro con resultado negativo, con los umbrales definidos antes de la evaluación, los resultados completos publicados y una recomendación explícita de no usar el modelo. El autor indica que el archivo se publica para que el resultado pueda verificarse y reproducirse, no para su explotación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo s6-nano con estado de audio (tag GGUF `skycmd-s2`, `state_kind = "audio"`); d 144, 2 cabezas, 2 bloques con pesos compartidos en bucle doble, salida temprana tras cada uno de los 4 pases, pesos ternarios |
| Parametros totales | 1.532.449 (según model card); el campo safetensors del repo indica 655.377 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 10,24 s de audio a 16 kHz (tramas log-mel de 80 ms) |
| Tipos de cuantizacion | ternario (pesos ternarios); GGUF |
| Idiomas soportados | en, fr (el francés solo en evaluación zero-shot; ver limitaciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tag `skycmd-s2`) |

## Arquitectura y entrenamiento

El modelo reutiliza el grafo s6-nano con un estado de audio. La dimensión interna es 144, con 2 cabezas de atención y 2 bloques cuyos pesos se comparten y se recorren en bucle dos veces, lo que da 4 pases en total, cada uno con una salida temprana asociada a un umbral. Los pesos son ternarios. El front-end de audio (16 kHz mono, ventana Hann de 25 ms, salto de 10 ms, 40 bandas log-mel, 8 saltos apilados en una trama de 320 valores cada 80 ms) se ejecuta dentro del motor, tanto de forma nativa como en WASM. El flujo de estado es una proyección en coma flotante de cada trama; la pregunta y las opciones se codifican como texto BPE (vocabulario de 2.048) en un flujo estático que se codifica una vez y se cachea, lo que permite que las opciones nombren palabras que el modelo nunca vio en entrenamiento.

El entrenamiento incluyó una fase de preentrenamiento con Mimi (codebook-0, alcanzando 0,2196 de precisión en tramas enmascaradas frente a un umbral técnico de 0,00488), pero esa tarea no transfirió a las decisiones: el modelo de control, entrenado desde pesos aleatorios sin ese preentrenamiento, fue más preciso en las cuatro pruebas. La ejecución consta de 31.480 pasos y una sola semilla; una primera ejecución de decisión fue descartada antes de cualquier evaluación por un defecto de memoria (enmienda 4 del pre-registro). No se adoptó Parallax, lo que reduce el recuento a 1.532.449 parámetros frente a los 1.615.681 del pre-registro. El modelo incluye umbrales de salida temprana escritos por el entrenamiento (choice 0,5; score 0,9; noul 0,68); para reproducir las cifras de las puertas hay que fijar el umbral a 1 en tiempo de ejecución (`setExitThreshold(1)`).

## Capacidades

- Clasificación de audio orientada a decisión: responde preguntas tipadas sobre los últimos 10,24 s de audio con un forward pass por pregunta.
- Detección de fin de turno (`ear:turn_end` / `noul`): "Has the speaker finished their turn?" con opciones booleanas.
- Reconocimiento de palabras clave (`ear:keyword` / `choice`) sobre 12 clases de Speech Commands (yes, no, up, down, left, right, on, off, stop, y otras).
- Palabras clave zero-shot: las opciones se pasan como texto, de modo que el modelo puede intentar palabras que no vio en entrenamiento (resultado muy bajo: 0,2100 en inglés y 0,1330 en francés con 10 opciones y azar en 0,10).
- Salida temprana con umbrales conformales: en sus umbrales usa 3,42 de sus 4 pases de media (salida temprana en el 21,1 % de las preguntas), con los mismos veredictos.
- Calibración: ECE de 0,0081 sobre todas las fuentes de test a profundidad completa.
- Ejecución en el motor skycmd (navegador, Node, Python, CLI, servidor) con build WASM; el audio no sale del navegador en la demo.
- No soporta tool calling, agentes multi-paso, visión, audio generativo ni razonamiento general; es un clasificador de decisión, no un LLM generativo.

## Casos de uso

- Verificación de resultados negativos en investigación de agentes de voz: el modelo sirve como referencia reproducible para contrastar hipótesis sobre transferencia de preentrenamiento de audio (Mimi) a tareas de decisión, dado que el control sin preentrenamiento supera al modelo en las cuatro pruebas.
- Reproducción de un pre-registro: permite reejecutar las puertas definidas en `docs/s6-ear-prereg.md` con el mismo split de test y comprobar las cifras publicadas (31.527 clips de fin de turno, 4.890 de palabras clave, 1.000 por idioma en zero-shot).
- Docencia y divulgación sobre evaluación rigurosa: caso práctico de cómo se define un umbral antes de evaluar, se publica un fallo y se documenta la enmienda de un entrenamiento descartado.
- Pruebas de integración del motor skycmd: el modelo es un artefacto pequeño (899 KB) útil para validar el pipeline GGUF, las salidas tempranas y el build WASM del motor en CI, sin coste de infraestructura.
- Evaluación comparativa de front-ends de audio: al ejecutar el front-end log-mel dentro del motor, sirve para medir el coste y la viabilidad de procesar audio en WASM en el navegador con PCM de 16 kHz mono.
- No se recomienda su uso en producción para detección de fin de turno ni para keyword spotting: el propio autor lo desaconseja explícitamente.

## Benchmarks y rendimiento

Split de test, ternario, profundidad completa (`runs/s6-ear-nano/eval/gate.json`):

| Puerta | n | s6-ear-nano | Control (sin Mimi, no publicado) | Umbral | Veredicto |
|---|---:|---:|---:|---:|---|
| Fin de turno (`ear:turn_end`) | 31.527 | 0,5681 | 0,7647 | 0,8518 (Smart Turn v3.2, mismos clips) | falla |
| Palabras clave, 12 clases (`ear:keyword`) | 4.890 | 0,8885 | 0,9217 | 0,90 | falla |
| Palabras clave zero-shot, inglés | 1.000 | 0,2100 | 0,3020 | 0,20 (2 × azar) | pasa |
| Palabras clave zero-shot, francés | 1.000 | 0,1330 | 0,1520 | 0,20 (2 × azar) | falla |

Datos adicionales: precisión codebook-0 del preentrenamiento Mimi de 0,2196 sobre tramas enmascaradas de validación (umbral técnico 0,00488); ECE de 0,0081 a profundidad completa; 3,42 pases de media en los umbrales conformales con salida temprana en el 21,1 % de las preguntas. No se calcularon la precisión y el recall de las respuestas de fin de turno que exige el pre-registro (Smart Turn v3.2: precisión 0,783, recall 0,971) ni la latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB de pesos (899 KB en disco, 1.532.449 parámetros ternarios); cabe en cualquier GPU, CPU o incluso en el heap de un navegador.
- GPU recomendadas: ninguna en particular; el modelo está diseñado para ejecutarse en CPU y en WASM. Funciona en cualquier GPU consumer, pero no la necesita.
- Cabe en GPU consumer: sí, en todas; también en móvil y en el navegador.
- Opciones de despliegue: exclusivamente el motor skycmd (navegador, Node, Python, CLI, servidor). No hay soporte de vLLM, llama.cpp, Ollama ni TGI; el formato GGUF es propio (tag `skycmd-s2`) y no es un GGUF estándar de llama.cpp.
- Latencia y throughput: no disponibles (la ejecución no calculó la latencia). Como referencia estructural, el modelo hace 4 pases por pregunta y, con umbrales conformales, 3,42 de media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fin de turno | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| s6-ear-nano | 1,53 M (ternario) | 10,24 s de audio | 0,5681 | Apache 2.0 | GGUF en HF, motor skycmd |
| Smart Turn v3.2 | 8 M | no disponible | 0,8518 | no disponible | referencia de la comparación |
| Control de s6-ear-nano (sin Mimi) | no disponible | 10,24 s de audio | 0,7647 | no disponible (no publicado) | no publicado |

La comparación con Smart Turn v3.2 es la única disponible en la información proporcionada; el modelo tiene 5,2 veces menos parámetros que Smart Turn v3.2 y rinde 0,2837 puntos por debajo en fin de turno sobre los mismos clips.

## Limitaciones y advertencias

- **Falló sus puertas y el autor lo recomienda para ningún uso.** Es un resultado negativo publicado, no un modelo de producción.
- Una sola ejecución y una sola semilla; un primer entrenamiento de 31.480 pasos se descartó antes de evaluar por un defecto de memoria (enmienda 4).
- El preentrenamiento Mimi no transfirió: el control sin preentrenamiento es mejor en las cuatro pruebas.
- Ventana de contexto de solo 10,24 s; el audio se remuestrea a 16 kHz mono.
- El francés zero-shot queda en 0,1330 con 10 opciones (azar 0,10), muy por debajo del umbral de 0,20.
- No se calcularon precisión ni recall de fin de turno ni latencia, métricas exigidas por el pre-registro.
- El archivo incluye umbrales de salida temprana (choice 0,5; score 0,9; noul 0,68) que hacen que el modelo pueda detenerse antes del último pase; para reproducir las cifras de las puertas hay que fijar el umbral a 1.
- El GGUF es específico del motor skycmd; no es portable a otros runners.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja el uso del modelo.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de decisiones erróneas silenciosas: la calibración es buena (ECE 0,0081) mientras la precisión es insuficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-ear-nano
- Demo (Space): https://huggingface.co/spaces/maxgfr/s6-ear-nano
- Código (Rust): https://github.com/maxgfr/skycmd
- Pre-registro: https://github.com/maxgfr/skycmd/blob/main/docs/s6-ear-prereg.md
- Resultados de benchmarks: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-ear-nano-first-run-gates-failed
- Tutorial, capítulo 26: https://maxgfr.github.io/skycmd/tutorial/26-s6-ear
- Página de resultados (incluye fallos): https://maxgfr.github.io/skycmd/results/
