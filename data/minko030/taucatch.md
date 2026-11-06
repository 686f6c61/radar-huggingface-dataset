# Minko030/taucatch

## Resumen

SpikeVLA catcher es una política visión-lenguaje-acción (VLA) diseñada específicamente para la tarea de atrapar una pelota lanzada a 8 m/s desde 4 m de distancia con un brazo robótico reBot Arm B601-DM equipado con una mano de cinco dedos. El modelo, publicado por el usuario Minko030, emplea únicamente dos cámaras de eventos como entrada sensorial, lo que lo sitúa en el ámbito de la robótica neuromórfica y de las redes neuronales de impulsos (spiking neural networks, SNN).

La arquitectura se apoya en un backbone spiking SDT-V3 de 19 M de parámetros, sobre el que se añaden un localizador de pelota en el propio modelo, un seguimiento balístico entre llamadas, una fusión visión-lenguaje también spiking y una cabeza de acción con Spatially Grounded Spike Attention (SGSA). El modelo completo suma 39,2 M de parámetros y genera bloques de 12 objetivos de efector final a 20 ms cada uno, con una frecuencia de inferencia de 4 ms.

Su relevancia radica en que demuestra que una política puramente spiking, entrenada en MuJoCo con demostraciones expertas y una ronda de DAgger, puede alcanzar tasas de captura del 84,7 % en simulación con latencia de 20 ms y límites de motor de 24 V, compitiendo con un planificador experto que dispone del estado real de la pelota. El modelo no incluye el modelo de texto: la instrucción "catch the ball" es fija y sus estados congelados de SmoothSpike-BERT se almacenan en los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpikeVLA: backbone spiking SDT-V3 (19 M) + localizador de pelota + fusión visión-lenguaje spiking + cabeza de acción con SGSA |
| Parametros totales | 39.474.481 (39,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; instrucción fija "catch the ball") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucción de texto fija en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors) + config.json |

## Arquitectura y entrenamiento

El modelo es una política VLA spiking compuesta por varias piezas acopladas. La entrada consiste en dos fotogramas de traza de 224 x 224 píxeles procedentes de dos cámaras de eventos; cada píxel codifica el tiempo transcurrido desde su último evento, decaído con constantes de 10, 50 y 250 ms en los tres canales. A esta entrada visual se le suma el estado del brazo. Sobre el backbone SDT-V3 de 19 M de parámetros se sitúan un localizador de pelota que opera sobre los tokens del backbone, un rastreador balístico que se ejecuta entre llamadas al modelo, una fusión visión-lenguaje spiking y una cabeza de acción con Spatially Grounded Spike Attention (SGSA). La salida es un bloque de 12 objetivos de efector final a 20 ms cada uno más el comando de la mano, emitido cada 4 ms.

El entrenamiento se realizó en el simulador MuJoCo a partir de demostraciones expertas y una ronda de DAgger sobre los propios lanzamientos del modelo (checkpoint `saim_r1_b601/ema_3000.pt`). El modelo de texto no forma parte de los pesos liberados: la instrucción "catch the ball" es fija y sus estados congelados de SmoothSpike-BERT se almacenan directamente en los pesos, de modo que la política no procesa lenguaje variable en tiempo de inferencia.

## Capacidades

- Control robótico de alta frecuencia: genera comandos de efector final y de mano cada 4 ms, con bloques de acción de 12 pasos a 20 ms.
- Percepción con cámaras de eventos: procesa dos flujos de 224 x 224 con codificación temporal de traza (decaimientos de 10, 50 y 250 ms), adecuada para escenas de alta dinámica.
- Localización y seguimiento de objetos rápidos: incluye un localizador de pelota sobre los tokens del backbone y un rastreador balístico entre llamadas.
- Fusión visión-lenguaje spiking: integra la instrucción fija "catch the ball" mediante estados congelados de SmoothSpike-BERT.
- Generación de acciones con cabeza SGSA: produce objetivos de efector final y comando de la mano de forma coordinada.
- No soporta tool calling, function calling ni razonamiento multi-paso genérico: es una política especializada de una sola tarea.
- No dispone de capacidades multilingües ni de generación de texto libre.

## Casos de uso

- Investigación en robótica neuromórfica: el modelo sirve como referencia reproducible para estudiar políticas spiking de extremo a extremo en tareas dinámicas, con código, simulador y pasos de robot real disponibles en el repositorio taucatch.
- Manipulación rápida de objetos en entornos industriales: la captura de objetos lanzados a 8 m/s con latencia de 20 ms es aplicable a líneas de clasificación o alimentación de piezas donde la velocidad de reacción es crítica.
- Percepción con cámaras de eventos en condiciones de alta dinámica: el uso exclusivo de event cameras permite operar en escenarios con movimiento rápido o iluminación variable donde las cámaras de frame convencionales sufren motion blur.
- Benchmark de políticas VLA especializadas: sirve como baseline para comparar arquitecturas spiking frente a transformers densos en tareas de control reactivo.
- Prototipado de sistemas brazo-mano coordinados: la salida conjunta de efector final y comando de mano de cinco dedos es útil para investigar agarres dinámicos.
- Educación y divulgación en robótica: el repositorio incluye URDF y mallas del B601, lo que facilita reproducir el montaje en simulación con MuJoCo.

## Benchmarks y rendimiento

| Misma tanda de 300 lanzamientos, 8 m/s, 4 m (simulación, latencia 20 ms, límites de motor 24 V) | Capturados |
|---|---|
| SpikeVLA, acciones desde la cabeza de acción | 84,7 % |
| SpikeVLA con trayectoria de pelota + planificador experto | 91,3 % |

| Pelotas más rápidas, 4 m, primeros 100 lanzamientos | 8 m/s | 9 m/s | 10 m/s |
|---|---|---|---|
| Experto con estado real de la pelota | 98 % | 95 % | 73 % |
| SpikeVLA con trayectoria de pelota + planificador experto | 87 % | 45 % | 13 % |
| SpikeVLA, acciones desde la cabeza de acción | 84 % | 49 % | 22 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 39,2 M de parámetros y pesos en safetensors (repo de 0,2 GB), la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican en la información disponible; el código de ejemplo indica evaluar la política en CUDA (`eval it on CUDA`).
- Cabe en GPU de consumo: sí, por el tamaño del modelo (39,2 M de parámetros), aunque no se detallan modelos concretos.
- Opciones de despliegue: el repositorio taucatch proporciona scripts propios (`tools/fetch_spikevla_deps.py`, `tools/fetch_b601.sh`) y un cargador `load_release` en `taucatch.vla_catch.policy`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: la política emite comandos cada 4 ms, con bloques de acción de 12 pasos a 20 ms; los benchmarks se midieron con latencia simulada de 20 ms.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Como referencia interna, el propio autor compara la política con un planificador experto que dispone del estado real de la pelota (98 % / 95 % / 73 % a 8, 9 y 10 m/s), pero no se ofrecen comparaciones con otras políticas VLA publicadas.

| Modelo | Parámetros | Contexto | Tasa de captura (8 m/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpikeVLA catcher (Minko030/taucatch) | 39,2 M | no aplica | 84,7 % | no disponible | Hugging Face + GitHub |
| Planificador experto con estado real | no disponible | no aplica | 98 % | no disponible | referencia interna del paper/repo |
| Otras políticas VLA | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta la tarea de atrapar una pelota con la instrucción fija "catch the ball"; no es un modelo de propósito general ni acepta instrucciones variables.
- Dependencia del hardware: requiere dos cámaras de eventos y el brazo reBot B601-DM con mano de cinco dedos; no es trasladable directamente a otros robots sin reentrenamiento.
- Rendimiento decreciente con velocidad: la tasa de captura cae del 84 % a 8 m/s al 49 % a 9 m/s y al 22 % a 10 m/s, frente al 98 % / 95 % / 73 % del experto con estado real.
- Licencia no disponible: no se especifican términos de uso comercial, por lo que no debe asumirse permiso para producción sin consultar al autor.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: al no ser un modelo de lenguaje general, estas categorías no aplican, pero tampoco se documentan evaluaciones de robustez fuera de la simulación.
- Resultados en simulación: los benchmarks proceden de MuJoCo con latencia simulada de 20 ms y límites de motor de 24 V; no se aportan métricas de despliegue en robot real en la información disponible.
- Modelo de texto no incluido: los estados de SmoothSpike-BERT están congelados en los pesos, lo que impide modificar la instrucción sin reentrenar.

## Enlaces

- Hugging Face: https://huggingface.co/Minko030/taucatch
- Repositorio de código, simulador y pasos en robot real: https://github.com/wxqnl/taucatch
