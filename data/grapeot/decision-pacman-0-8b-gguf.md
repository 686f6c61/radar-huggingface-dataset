# grapeot/decision-pacman-0.8b-GGUF

## Resumen

`decision-pacman-0.8b` es un modelo especializado de decisión desarrollado por el usuario grapeot para jugar al juego estilo Pac-Man del repositorio `decision-pacman`. No es un modelo conversacional general: recibe el estado actual del juego codificado como hechos compactos por dirección (aproximadamente 380 tokens, la codificación `features` del repositorio) y devuelve, en una única pasada forward, la probabilidad asociada a la letra de cada movimiento legal disponible en una intersección. Su función es actuar como política de decisión de baja latencia dentro del bucle del juego.

El modelo parte de `Qwen/Qwen3.5-0.8B` como base y se ha afinado mediante un LoRA (rango 16, alpha 32) que posteriormente se fusionó y exportó a formato GGUF en cuantización Q8_0. Se trata de un ejercicio de destilación: el estudiante de 0,8B aprende el juicio de un profesor `Qwen3.8-27B` (con modo thinking desactivado) que etiquetó cada estado tras simular 5 segundos del motor real del juego para cada opción. El resultado es un modelo de 772.845.888 parámetros que cabe en hardware muy modesto y que responde en decenas de milisegundos.

Su relevancia es doble. Por un lado, demuestra que es viable comprimir la capacidad de juicio de un modelo grande en uno pequeño y rápido para una tarea acotada. Por otro, sirve como referencia metodológica de destilación con pérdida de entropía cruzada sobre letras de opción y latencias compatibles con tiempo real. Con licencia Apache-2.0, el uso previsto por el autor se limita a investigación y docencia sobre este tipo de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de estado ~380 tokens) |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA (rango 16, alpha 32) sobre la base `Qwen/Qwen3.5-0.8B`, un transformer de 0,8B parámetros. El adaptador se entrenó en una única RTX 5090 con learning rate 1e-4, batch size 32 y 2 épocas, sobre 31.570 estados de entrenamiento, en aproximadamente 32 minutos. Posteriormente se fusionó con la base y se exportó a GGUF Q8_0. La pérdida es entropía cruzada sobre las letras de opción en la posición de respuesta, y el prompt de entrenamiento se renderiza byte a byte tal y como lo genera la API `/v1/systemone` de Ollama.

La innovación principal es el esquema de destilación. El profesor `Qwen3.8-27B` (thinking off) generó las etiquetas viendo una simulación de 5 segundos del motor real del juego para cada opción; ese lookahead solo ocurre durante la generación de etiquetas, mientras que el estudiante en inferencia ve únicamente el estado actual (`features`). Las etiquetas son duras: 0,9 sobre el movimiento del profesor y 0,1 repartido entre las opciones restantes. En inferencia, el modelo lee una única probabilidad por movimiento legal en una sola pasada, sin decodificación autoregresiva de texto.

## Capacidades

- Decisión de política en intersecciones del juego Pac-Man: dada la codificación de estado, asigna una probabilidad por letra de movimiento legal.
- Salida en una sola pasada forward, sin generación autoregresiva de texto.
- Compatible con el endpoint `/v1/systemone` de Ollama 0.35 o superior.
- Ejecución en tiempo real sobre hardware de consumo (Apple M3 Ultra, iPhone 16 Pro Max vía llama.cpp).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; su uso no es lingüístico sino de decisión.
- Capacidad especial: política de decisión destilada de un profesor mayor, orientada a baja latencia.

## Casos de uso

- Investigación en destilación de modelos: sirve como caso de estudio reproducible de cómo transferir el juicio de un modelo de 27B a uno de 0,8B para una tarea cerrada, con datos, hiperparámetros y métricas publicados.
- Docencia sobre políticas ligeras: permite ilustrar en un aula el ciclo completo de etiquetado con profesor, entrenamiento LoRA y despliegue en tiempo real utilizando el repositorio y el Modelfile incluidos.
- Benchmarking de latencia en dispositivos: al responder en unos 55 ms en Apple M3 Ultra y unos 400 ms en iPhone 16 Pro Max, es útil para medir rendimiento de inferencia local en Metal y llama.cpp.
- Pruebas de integración con Ollama: el Modelfile con el prompt exacto facilita reproducir el endpoint `/v1/systemone` y validar despliegues de modelos pequeños.
- Experimentación con aprendizaje por imitación: los 31.570 estados etiquetados y el esquema de etiquetas duras (0,9 / 0,1) permiten estudiar variantes de pérdida y de distribución de etiquetas.
- Comparación de arquitecturas de decisión: se puede confrontar frente a políticas como `tev1:0.8b`, `tev1:4b`, `phi4-mini` o agentes hospedados usando los mismos seeds y reloj en tiempo real.

## Benchmarks y rendimiento

Evaluación con Ollama 0.35 sobre Apple M3 Ultra, 10 partidas con semillas 100-109, velocidad 1x, límite de 5 minutos y reloj en tiempo real. Cada nivel contiene 244 pellets y todos los jugadores ven solo la entrada `features`.

| Modelo | Media de pellets | Latencia p50 de decision | Notas |
|---|---|---|---|
| pacman-0.8b-qwen | 425 | 55 ms | Media de 3 ejecuciones: 441, 467, 366 |
| phi4-mini | 232 | no disponible | Modelo de chat con JSON restringido |
| Jev 1.13.0 | 178 | no disponible | Hospedado |
| tev1:4b | 148 | no disponible | - |
| tev1:0.8b | 69 | no disponible | - |
| random | 30 | no disponible | - |

Datos adicionales aportados por el autor: en modo lockstep (el juego espera cada respuesta) el modelo obtuvo 417 pellets; en las 194 tareas de decisión no Pac-Man de JevBench (azar 0,32) alcanzó 0,53, frente a 0,66 de `tev1:0.8b`. Los propios resultados advierten que las puntuaciones en tiempo real variaron hasta unos 150 pellets entre ejecuciones bajo carga de la máquina.

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB para el archivo Q8_0 de ~795 MB, más overhead de runtime.
- GPU validadas por el autor: Apple M3 Ultra para la evaluación de referencia; iPhone 16 Pro Max con la app iOS del repositorio (llama.cpp sobre Metal).
- GPU de entrenamiento reportada: una RTX 5090 para el LoRA.
- Cabe en hardware de consumo: sí, dado su tamaño inferior a 1 GB en Q8_0; es viable en dispositivos móviles y en equipos sin GPU dedicada.
- Opciones de despliegue: Ollama 0.35 o superior (endpoint `/v1/systemone`) y llama.cpp; no se mencionan vLLM ni TGI.
- Latencia medida: 55 ms p50 por decisión en Apple M3 Ultra y aproximadamente 400 ms por decisión en iPhone 16 Pro Max.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (pellets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pacman-0.8b-qwen | 772.845.888 | no disponible | 425 | apache-2.0 | GGUF en HuggingFace |
| phi4-mini | no disponible | no disponible | 232 | no disponible | no disponible en la informacion |
| tev1:4b | 4B | no disponible | 148 | no disponible | no disponible en la informacion |
| tev1:0.8b | 0,8B | no disponible | 69 | no disponible | no disponible en la informacion |
| Jev 1.13.0 | no disponible | no disponible | 178 | no disponible | Hospedado |

## Limitaciones y advertencias

- Es un especialista, no un modelo de decisión general: en 194 tareas de JevBench ajenas a Pac-Man obtuvo 0,53 frente a 0,66 de `tev1:0.8b` (azar 0,32).
- El propio autor restringe el uso previsto a investigación y docencia sobre destilación; desaconseja emplearlo en tareas distintas al juego.
- El prompt de sistema del Modelfile debe permanecer exactamente como se proporciona, ya que el modelo se entrenó sobre él; cualquier variación puede degradar el rendimiento.
- Solo se ha publicado un tipo de cuantización (Q8_0); no hay variantes Q4, Q5 ni otras, lo que limita el ajuste de memoria.
- Resultados frágiles en tiempo real: la puntuación varió hasta unos 150 pellets entre ejecuciones bajo carga de la máquina.
- Los resultados están acotados a este juego y a esta codificación de entrada concretos; no son extrapolables a otros entornos.
- No se especifican idiomas soportados ni longitud de contexto formal; la entrada son aproximadamente 380 tokens de hechos por dirección.
- Riesgo de alucinación: no aplica en el sentido textual, pero las probabilidades por movimiento pueden ser incorrectas en estados poco representados.
- Licencia Apache-2.0 para los pesos y MIT para el código del juego y de entrenamiento; Pac-Man es marca registrada de Bandai Namco y el proyecto no está afiliado a dicha empresa.

## Enlaces

- HuggingFace: https://huggingface.co/grapeot/decision-pacman-0.8b-GGUF
- Repositorio del juego: https://github.com/grapeot/decision-pacman
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
