# Flam-ai/flux-duplex

## Resumen

flux-duplex es un modelo de clasificación de audio desarrollado por Flam (Flam-ai) que actúa como controlador de turnos (*turn-taking*) para agentes de voz full-duplex. Su función no es transcribir ni generar habla, sino predecir 50 veces por segundo quién hablará en los próximos dos segundos, escuchando simultáneamente los dos canales de una conversación (uno por hablante). Sobre esa predicción se aplican un conjunto de reglas fijas que determinan cuándo termina el turno de un hablante y cuándo se produce una interrupción.

El modelo combina un codificador de audio preentrenado de aproximadamente 305M de parámetros (12 capas, ejecutado por canal) con 20,9M de parámetros adicionales de *turn-taking*: una mezcla aprendida de capas del codificador, un adaptador, seis bloques transformer por canal y cuatro bloques que leen ambos canales conjuntamente. Todo el cómputo es causal, con tramas de 20 ms, lo que permite una versión en streaming que reproduce la pasada offline.

Es relevante porque aborda un problema específico y poco cubierto en agentes de voz: la detección de fin de turno e interrupciones en tiempo real. Según la model card, en el conjunto de desarrollo de TurnBench alcanza un 96,2% de detección de fin de turno con un 7,0% de falsas alarmas y una latencia mediana de 395 ms, y un 99,7% de detección de interrupciones con un 7,3% de falsas alarmas y 226 ms de latencia mediana. No obstante, los pesos no son públicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de audio preentrenado por canal + capas transformer causales de turn-taking (dos canales) |
| Parámetros totales | ~305M (codificador) + 20,9M (capas de turn-taking) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de entrenamiento de 20 s; predicción sobre los 2 s siguientes) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | No disponible (pesos no publicados) |

## Arquitectura y entrenamiento

La entrada son dos canales de audio a 16 kHz, uno por hablante, y cualquiera de los dos puede ocupar cualquiera de los asientos. Un codificador de audio preentrenado de unos 305M de parámetros (12 capas) se ejecuta sobre cada canal y produce un vector cada 40 ms, mirando únicamente hacia atrás. Durante el ajuste se entrenaron las seis capas superiores y las seis inferiores permanecieron congeladas. Sobre el codificador se apilan 20,9M de parámetros: una mezcla aprendida de las capas del codificador, un adaptador, seis bloques transformer por canal y cuatro bloques que leen ambos canales de forma conjunta, todos causales, a 20 ms por trama.

La salida principal es un pronóstico sobre 256 patrones de habla futura: para cada hablante, si habla en cada uno de cuatro intervalos que cubren los próximos 0,2, 0,6, 1,2 y 2,0 segundos. Hay salidas menores con la actividad de voz de cada hablante y otras lecturas usadas por el agente pero no por esta entrada de TurnBench. El entrenamiento usó 855 horas de conversación en inglés de dos canales (1.373 conversaciones, 209 hablantes, cada uno en su canal, divididos por hablante), con ruido, eco y voces de fondo añadidos al canal del oyente. Los objetivos son auto-supervisados: el pronóstico se toma de la propia actividad de voz de la grabación detectada por canal, sin etiquetas humanas de turn-taking. El entrenamiento consistió en 24.000 pasos sobre ventanas de 20 segundos en una única GPU.

## Capacidades

- Predicción de quién hablará en los próximos 0,2, 0,6, 1,2 y 2,0 segundos, a 50 predicciones por segundo.
- Detección de fin de turno mediante reglas fijas sobre el pronóstico (evidencia basada en `p_now` del otro hablante y contadores de tramas).
- Detección de interrupciones mediante reglas fijas (evidencia basada en `p_hold` del hablante y contador de tramas de habla).
- Estimación de actividad de voz por hablante.
- Procesamiento causal con equivalencia entre streaming trama a trama y pasada offline (salvo redondeo).
- No reconoce palabras ni genera habla: es exclusivamente un controlador acústico de turnos.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (fuera del alcance del modelo).

## Casos de uso

- Agentes de voz full-duplex en producción: el modelo permite al agente saber cuándo el usuario ha terminado de hablar antes de responder, con una latencia mediana de 395 ms en fin de turno, lo que reduce respuestas solapadas en llamadas en tiempo real.
- Detección de interrupciones en asistentes telefónicos: con un 99,7% de detección y 226 ms de latencia mediana, el agente puede ceder el turno cuando el usuario le interrumpe, mejorando la naturalidad de la conversación.
- Barge-in en sistemas de atención al cliente: al detectar que el usuario empieza a hablar mientras el agente responde, el sistema puede pausar la síntesis de voz y escuchar.
- Moderación de turnos en plataformas de reuniones o transcripción en vivo: el pronóstico de habla futura por canal permite segmentar quién habla y cuándo en conversaciones de dos participantes.
- Investigación en interacción humano-máquina: sirve como componente evaluable en TurnBench para comparar estrategias de control de turnos sin depender de etiquetas humanas.
- Telefonía y VoIP con dos canales separados: al requerir audio de 16 kHz por hablante en canales independientes, encaja en entornos donde ya se dispone de streams separados (por ejemplo, centralitas o SDK de voz).
- Evaluación de latencia en pipelines de voz: su naturaleza causal y su versión en streaming permiten medir el coste de la detección de fin de turno dentro de un pipeline ASR-LLM-TTS.

## Benchmarks y rendimiento

Resultados en el conjunto de desarrollo de TurnBench (38 conversaciones públicas, scorer del propio benchmark; datos in-sample según el autor):

| Tarea | Encontrados | Falsas alarmas | Latencia mediana |
|---|---|---|---|
| Fin de turno | 96,2% (1.832 de 1.904) | 7,0% | 395 ms |
| Interrupción | 99,7% (346 de 347) | 7,3% | 226 ms |

Validación con partición aleatoria (200 divisiones, mitad para elegir y mitad para puntuar): fin de turno 96,2% ± 0,5 con 7,2% ± 0,8 de falsas alarmas; interrupción 99,5% ± 0,6 con 7,5% ± 2,1 de falsas alarmas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no realiza esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo suma ~305M de parámetros del codificador más 20,9M de capas de turn-taking, pero no se publican pesos ni cuantizaciones.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una única GPU sin especificar el modelo.
- ¿Cabe en GPU de consumo? No disponible; sin pesos publicados no puede verificarse.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. Es un modelo de clasificación de audio causal, no un LLM, y sus pesos no son públicos.
- Latencia y throughput: latencia mediana de 395 ms en fin de turno y 226 ms en interrupción según TurnBench dev; throughput no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de turn-taking ni datos de otras entradas de TurnBench.

## Limitaciones y advertencias

- Depende en gran medida del segundo canal: la mayoría de eventos de fin de turno se emiten cuando el otro hablante ya ha empezado a responder. Con el otro canal silenciado (agente que espera su turno), la regla de evento único encuentra solo entre el 29% y el 48% de los fines de turno.
- Solo procesa sonido: no entiende el contenido, por lo que los fines de turno que dependen del significado quedan fuera de su alcance.
- Entrenado y evaluado únicamente en inglés y con dos canales limpios; no se midió ningún otro idioma ni condición.
- Las cifras de desarrollo son in-sample para el checkpoint y los umbrales, según reconoce el autor.
- Licencia no disponible; al no publicarse los pesos, no puede evaluarse su uso comercial ni su redistribución.
- Riesgo de falsas alarmas del orden del 7% en ambas tareas, relevante en producción si el agente reacciona a cada evento.
- El modelo no sustituye a un ASR ni a un generador de habla; requiere integrarse con un agente que interprete los eventos.

## Enlaces

- Hugging Face: https://huggingface.co/Flam-ai/flux-duplex
- TurnBench: no disponible (referenciado en la model card sin enlace)
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
