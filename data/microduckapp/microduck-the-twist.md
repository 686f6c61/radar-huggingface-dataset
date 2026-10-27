# microduckapp/microduck-the-twist

## Resumen

Microduck The Twist es una política de control motriz preentrenada para el robot bípedo Microduck, publicada por el usuario microduckapp en Hugging Face. No es un modelo de lenguaje ni un modelo fundacional multimodal: es un artefacto de inferencia en formato ONNX que implementa un único movimiento coreografiado de 11,1 segundos de duración, en el que el robot gira a izquierda y derecha en giros cortos mientras la cabeza oscila en sentido contrario. La política consume 61 observaciones por paso y emite 14 consignas articulares a 50 Hz, es decir, un bucle de control cerrado con un presupuesto de 20 ms por inferencia.

El modelo se distribuye junto a un `manifest.json` que describe qué necesita el robot para instalar y reproducir el movimiento, y un vídeo de previsualización en `media/preview.mp4`. Forma parte del catálogo de movimientos de la app MicroDuck, un ecosistema que acompaña al robot homónimo de Pollen Robotics —25 cm de altura, 15 motores, cámara, LiDAR y pico prensil, con un precio de preventa de 399 dólares— presentado por Jensen Huang en GTC Berlin el 21 de octubre de 2026.

Su relevancia es acotada pero concreta: ejemplifica el flujo de trabajo "entrenar en simulación, transferir al robot físico" que el propio fabricante promueve con su stack abierto, y sirve como referencia reproducible para validar el pipeline de observaciones y el mapeo de articulaciones en tareas de sim-to-real. El repositorio no incluye, en el momento de la consulta, pesos en otros formatos, ficha técnica de entrenamiento ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuye únicamente como grafo ONNX; la model card no describe la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | no aplica (política de control robótico sin contexto textual; ventana temporal no especificada) |
| Tipos de cuantizacion | no disponible (único artefacto publicado: `policy.onnx`, precisión no declarada) |
| Idiomas soportados | no disponible / no aplica (no procesa lenguaje natural) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |
| Entrada | 61 observaciones por paso (composición no especificada) |
| Salida | 14 consignas articulares |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Duración del movimiento | 11,1 s |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna de la política. El único artefacto funcional es un grafo ONNX exportado que mapea un vector de 61 observaciones a 14 objetivos articulares a 50 Hz. No se especifica si se trata de una red MLP, una política recurrente o un transformer ligero, ni se declara el número de parámetros, las capas o las funciones de activación. Tampoco se documenta si la política es puramente reactiva (observación actual → acción) o si incorpora memoria interna del estado.

Respecto al entrenamiento, la model card no aporta ningún dato: no se indica el número de tokens ni de pasos de simulación, la composición del dataset, el simulador empleado, ni si hubo aprendizaje por imitación, refuerzo (RL) o destilación desde un profesor. El contexto del ecosistema sugiere el flujo habitual del fabricante —entrenar comportamientos en simulación y transferirlos a la máquina física, con herramientas de agentes de IA para diseñar y validar los entrenamientos—, pero se trata de una inferencia contextual, no de un dato declarado por el autor. La única evidencia cualitativa del comportamiento es el vídeo `media/preview.mp4`.

## Capacidades

- Ejecución de una coreografía fija de 11,1 s: giros cortos a izquierda y derecha con contramovimiento de cabeza, reproducida de forma determinista paso a paso.
- Control articular en bucle cerrado a 50 Hz, con 61 observaciones de entrada y 14 consignas de salida por paso.
- Instalación y reproducción guiada mediante `manifest.json`, orientada a la app MicroDuck.
- Inferencia portable vía ONNX Runtime, sin dependencias de frameworks de deep learning pesados.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües.
- No se declara uso de visión, audio ni modo "thinking"; si las 61 observaciones incluyen señales de cámara, LiDAR o IMU no se especifica en la información disponible.

## Casos de uso

- Demostración en ferias y showrooms: la política reproduce un movimiento corto y visualmente llamativo en bucle, lo que permite montar una vitrina interactiva del robot sin ingeniería adicional; el carácter determinista del movimiento facilita la sincronización con guiones de presentación.
- Material didáctico sobre políticas ONNX: al ser un grafo autocontenido con entradas y salidas bien delimitadas (61 → 14 a 50 Hz), sirve para explicar en cursos y talleres cómo se estructura el contrato de observaciones de un robot bípedo y cómo se ejecuta una política en tiempo real.
- Prueba de regresión del stack sim-to-real: tras actualizar firmware o el SDK del robot, ejecutar The Twist y comparar la trayectoria de las 14 articulaciones con la referencia permite detectar roturas en el mapeo de índices articulares o en las unidades de las observaciones.
- Referencia para clonación de conducta: el par (observaciones, acciones) generado al reproducir el movimiento sirve como conjunto de datos semilla para entrenar variantes con parámetros distintos (más amplitud, más velocidad) mediante aprendizaje por imitación.
- Validación del bucle de control en tiempo real: con un presupuesto de 20 ms por paso, la política es un banco de pruebas realista para medir jitter, latencia de extremo a extremo y estabilidad del scheduler en la computadora del robot o en un PC conectado.
- Animación de reposo o "idle" en interacciones humano-robot: el giro con contoneo de cabeza puede insertarse como comportamiento de espera entre comandos de voz, aportando sensación de vida sin requerir percepción del entorno.
- Integración en la app MicroDuck: el `manifest.json` permite distribuir el movimiento como contenido instalable, lo que abre la puerta a flujos de publicación de contenido por parte de terceros si el ecosistema lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen métricas de éxito de la tarea, de error de seguimiento articular ni de robustez ante perturbaciones. La única evidencia de funcionamiento es el vídeo de previsualización incluido en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,0 GB y la política es un grafo ONNX de tamaño reducido, por lo que la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, una RTX 4090) ejecutaría la política con holgura, pero sería un sobredimensionamiento para 61 entradas y 14 salidas.
- Compatibilidad con GPU consumer: sí, cualquier tarjeta con soporte ONNX Runtime (CUDA o TensorRT) puede ejecutarla; también CPU integrada.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), TensorRT, OpenVINO; no se publican artefactos GGUF ni versiones para vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de política.
- Latencia y throughput: el contrato de 50 Hz impone un máximo de 20 ms por paso, incluyendo lectura de sensores y escritura de consignas. No se publican mediciones de latencia real ni de throughput del grafo.
- Requisito crítico: la computadora debe poder sostener el bucle de control en tiempo real sin bloqueos del sistema operativo; conviene fijar hilos y prioridades para evitar jitter.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduckapp/microduck-the-twist | Movimiento coreografiado para Microduck (ONNX) | 61 / 14 | 50 Hz | 11,1 s | no disponible | pública, 0 descargas |
| microduckapp/microduck-midnight-snack | Movimiento coreografiado para Microduck | no disponible | no disponible | no disponible | no disponible | pública, dentro del catálogo de 16 modelos del autor |
| Resto del catálogo microduckapp | Movimientos de la app MicroDuck | no disponible | no disponible | no disponible | no disponible | públicas |
| Políticas fundacionales de robótica de propósito general (p. ej. familias VLA) | Modelos visión-lenguaje-acción | no disponible | no disponible | no disponible | variable | no comparable directamente por escala y ámbito |

No se dispone de datos públicos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparación relevante es funcional: The Twist es una política especializada de un solo comportamiento, frente a políticas generalistas que requieren contextos de entrada mucho mayores y cómputo muy superior.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni obra derivada. Es un bloqueo potencial para cualquier integración en producto.
- Sesgo de simulación: no se documenta el simulador ni el grado de aleatorización de dominio, por lo que se desconoce la robustez ante cambios de fricción, iluminación, desgaste de motores o superficies distintas a las del entrenamiento.
- Ausencia total de métricas: sin tasas de éxito, error de seguimiento ni pruebas de estrés, no es posible estimar la fiabilidad en producción.
- Discrepancia a verificar: la política emite 14 consignas articulares mientras la ficha del fabricante describe 15 motores. El mapeo exacto debe confirmarse en `manifest.json` antes de desplegar; un índice mal asignado puede producir movimientos incorrectos.
- Comportamiento único y no composicional: no generaliza a otras tareas, no acepta instrucciones en lenguaje natural y no puede reutilizarse como base para tareas de manipulación o navegación.
- Riesgo de sobreajuste al hardware exacto: pequeños cambios de calibración, longitud de eslabones o firmware pueden degradar el movimiento.
- Sin soporte ni mantenimiento declarado: 0 descargas y 0 "likes" en el momento de la consulta, sin discusión asociada ni issues públicas que permitan medir adopción.
- Sin información de seguridad física: no se documentan límites de par, paradas de emergencia ni comportamiento ante obstáculos, algo crítico en un robot bípedo que opera cerca de personas.
- Idiomas y accesibilidad: no aplica soporte multilingüe; la documentación está en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-the-twist
- Perfil del autor en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página oficial del producto Microduck: https://pollen-robotics.com/microduck/
- Blog de NVIDIA sobre entrenamiento de robots como Microduck en simulación con agentes de IA: https://developer.nvidia.com/blog/using-ai-agents-to-teach-robots-like-microduck-to-walk-in-simulation/
- Cobertura de la demo de Jensen Huang en GTC Berlin (21 de octubre de 2026): https://www.studioglobal.ai/discover/answers/how-did-jensen-huang-s-october-21-2026-6adc5d9bdd5420f7c30ddafb
