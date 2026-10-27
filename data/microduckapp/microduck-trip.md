# microduckapp/microduck-trip

## Resumen

Trip es una política de control motriz (no un modelo de lenguaje) publicada en el Hugging Face Hub por el usuario microduckapp bajo el pipeline `robotics`. Se trata de un movimiento cerrado de 10,5 segundos para el robot bípedo Microduck, distribuido como un grafo ONNX (`policy.onnx`) que recibe 61 observaciones por paso y emite 14 consignas articulares a 50 Hz, acompañado de un `manifest.json` con los requisitos de instalación y reproducción dentro de la app MicroDuck.

El robot Microduck, según su fabricante Pollen Robotics, es un bípedo de 25 cm con 15 motores, cámara, LiDAR y pico prensil, con un stack open source que permite entrenar comportamientos en simulación (Isaac Lab 3.0 / Newton) y desplegarlos en el hardware real. Trip encaja en ese ecosistema como un "move" empaquetado: un artefacto de comportamiento concreto, no un modelo generalista.

Su relevancia es fundamentalmente de formato y de ecosistema: ejemplifica cómo se publica una política entrenada (sim-to-real) en el Hub con un contrato de interfaz explícito (61→14 a 50 Hz) y un manifiesto de instalación. El repositorio no declara licencia, no tiene descargas ni likes y su model card no documenta el proceso de entrenamiento, por lo que debe tratarse como un artefacto de demostración sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de control exportada a ONNX; topología interna (capas, activaciones) no documentada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; la entrada es un vector de 61 observaciones por paso de control |
| Tipos de cuantización | no disponible (solo se publica `policy.onnx`; no se documentan variantes cuantizadas ni FP16/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la model card está redactada en inglés) |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | ONNX (`policy.onnx`) |
| Tipo de modelo | Política de movimiento robótico (pipeline `robotics`, etiqueta `microduck-move`) |
| Entrada | 61 observaciones |
| Salida | 14 consignas articulares (joint targets) |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Duración del movimiento | 10,5 s |
| Artefactos del repositorio | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Tamaño del repositorio | 0,0 GB (según metadatos del Hub) |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-10-27 (según metadatos del Hub) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna: se sabe únicamente que se trata de una política exportada a ONNX con un contrato de interfaz fijo (61 entradas, 14 salidas, 50 Hz). No hay datos sobre número de capas, función de activación, tamaño del vector latente, ni sobre si deriva de un transformer, un MLP o una red recurrente. Tampoco se documenta qué magnitudes componen las 61 observaciones (posiciones articulares, velocidades, IMU, fase de la trayectoria, etc.), dato que resulta imprescindible para reimplementar la interfaz sin el `manifest.json`.

No se ha publicado información sobre el proceso de entrenamiento: ni número de muestras o pasos, ni composición del dataset, ni si hubo aprendizaje por imitación, refuerzo, RLHF/DPO (no aplicable aquí) o captura de movimiento. El ecosistema del robot sí ofrece una ruta documentada —entrenamiento en simulación con Isaac Lab 3.0 y Newton y exportación de la política para desplegarla en el hardware real, según el tutorial publicado por NVIDIA en el blog de Hugging Face—, pero la model card de Trip no confirma que este movimiento se haya generado por esa vía.

Como innovación destacable, cabe señalar el propio empaquetado: el `manifest.json` actúa como contrato de instalación y reproducción para la app MicroDuck, lo que permite que un artefacto de política sea consumible por una aplicación de usuario final sin ingeniería adicional.

## Capacidades

- Reproduce un movimiento pregrabado/aprendido de 10,5 segundos en el robot Microduck, con parada momentánea y reanudación (el tropezón descrito en la model card).
- Control en bucle cerrado a 50 Hz: consume 61 observaciones y emite 14 consignas articulares en cada paso.
- Integración con la app MicroDuck mediante `manifest.json`, que declara qué debe instalar el robot y cómo reproducir el movimiento.
- Distribución portable en ONNX, ejecutable con ONNX Runtime en CPU sin dependencias de frameworks de deep learning.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No se documenta uso de visión ni de LiDAR, pese a que el robot incorpora cámara y LiDAR según el fabricante; la composición de las 61 observaciones es desconocida.

## Casos de uso

- Demostraciones de producto y ferias: el movimiento está pensado como contenido reproducible ("un movimiento de 10,5 s"), adecuado para atraer público en un stand sin necesidad de teleoperación ni de cómputo dedicado.
- Catálogo de movimientos en la app MicroDuck: al venir con `manifest.json`, puede instalarse y lanzarse desde la aplicación como una entrada más del repertorio del robot, sin escribir código de integración específico.
- Prueba de regresión sim-to-real: ejecutar la misma política en el simulador (Isaac Lab/Newton) y en el robot físico permite medir la brecha de simulación comparando las 14 consignas articulares paso a paso a 50 Hz.
- Referencia para controladores de equilibrio: la secuencia de tropezón con el pie y recuperación posterior sirve como trayectoria de referencia para evaluar la respuesta de un controlador propio ante perturbaciones.
- Material docente en robótica: un artefacto ONNX pequeño con interfaz explícita (61→14) es un ejemplo manejable para explicar el ciclo observación-acción, el periodo de control de 20 ms y los límites de una política reactiva.
- Verificación de presupuesto temporal en hardware de borde: el límite de 50 Hz impone 20 ms por inferencia; el movimiento permite medir si el cómputo a bordo del robot cumple ese plazo antes de desplegar políticas más costosas.
- Punto de partida para reentrenamiento o imitación: las 14 salidas y la duración fija facilitan usar el movimiento como demostración inicial para clonado de comportamiento en simulación.
- Pruebas de repetibilidad mecánica: repetir el mismo movimiento N veces y medir la deriva de las articulaciones sirve para caracterizar holguras y desgaste de los servos del bípedo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error de seguimiento articular, tasa de éxito, estabilidad, consumo de corriente ni latencia medida, y no existe comparación cuantitativa con otras políticas del mismo robot.

## Requisitos de hardware

- VRAM estimada: despreciable. La entrada es un vector de 61 valores y la salida de 14; el repositorio completo ocupa 0,0 GB según los metadatos del Hub.
- GPU: no necesaria. La inferencia de una política ONNX de este tamaño es viable en CPU x86 o ARM; no se especifican requisitos de GPU para ejecutar `policy.onnx`.
- GPU de consumo: irrelevante para la inferencia; sí es relevante una GPU (el tutorial de NVIDIA menciona preparar una ejecución de entrenamiento con CUDA) si se quiere reentrenar o generar políticas nuevas en simulación.
- Opciones de despliegue: ONNX Runtime (Python o C++) para ejecución en el robot o en un daemon; ONNX Runtime Web/WASM si se integra en la simulación de navegador descrita en las guías de MicroDuck; instalación mediante `manifest.json` en la app MicroDuck. Soporte de ROS 2, vLLM, llama.cpp, Ollama o TGI: no aplica (no es un modelo generativo de texto).
- Latencia y throughput: el único dato conocido es el periodo de control de 20 ms derivado de los 50 Hz; no se publican latencias medidas ni throughput.
- Hardware del robot: Microduck de 25 cm con 15 motores, cámara, LiDAR y pico prensil (según el fabricante). Cómputo a bordo, autonomía y consumo: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Interfaz | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduckapp/microduck-trip | Política de movimiento (ONNX) | 61 obs → 14 acciones | 50 Hz | no disponible | Hub, 0 descargas |
| Otros movimientos `microduck-move` del ecosistema MicroDuck | Políticas de movimiento | no disponible | no disponible | no disponible | no identificados en la información disponible |
| Políticas entrenadas con Isaac Lab 3.0 y exportadas al Hub (flujo descrito por NVIDIA) | Políticas de locomoción sim-to-real | no disponible | no disponible | no disponible | flujo documentado, artefactos concretos no disponibles |
| Políticas de locomoción bípeda open source de otros robots | Políticas de control | no disponible | no disponible | variable según proyecto | no comparable directamente: interfaces de observación y número de articulaciones distintas |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas que permitan una comparación cuantitativa; la comparación queda limitada al formato de distribución y al contrato de interfaz.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no puede asumirse permiso de uso comercial, redistribución ni modificación; es un bloqueante para cualquier integración en producto.
- Sin validación externa: 0 descargas y 0 likes en el momento de los metadatos, y repositorio de 0,0 GB; no hay evidencia pública de que el artefacto se haya ejecutado correctamente en hardware real.
- Contrato de entrada incompleto: la model card no enumera qué son las 61 observaciones ni su orden, escala o unidades, por lo que la política no es reimplementable sin el `manifest.json` o sin ingeniería inversa.
- Desajuste potencial de articulaciones: la política emite 14 consignas mientras que el fabricante describe 15 motores en el robot; el mapeo entre salidas y motores no está documentado.
- Movimiento de alcance limitado: 10,5 s y comportamiento fijo; no es una política de locomoción general ni admite comandos de alto nivel (velocidad, dirección, objetivo).
- Sin información de entrenamiento: no se puede evaluar sobreajuste al entorno de simulación, sensibilidad a parámetros físicos ni la brecha sim-to-real esperada.
- Riesgo para seguridad: no se documentan límites articulares, pares máximos, parada de emergencia ni comportamiento ante fallo; no apto para aplicaciones de seguridad crítica ni para operar cerca de personas sin supervisión.
- Alucinación y sesgos: no aplica en el sentido de los modelos de lenguaje; el riesgo equivalente es la ejecución de una trayectoria incorrecta o inestable sin mecanismo de detección.
- Idiomas: no aplica; la documentación está solo en inglés.
- Metadatos no verificables: las fechas de creación y actualización (2026-10-27) y el tamaño de 0,0 GB proceden del Hub y no se han podido contrastar con el contenido real del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-trip
- Repositorio del robot (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página oficial del robot: https://pollen-robotics.com/microduck/
- Sitio de producto y preventa: https://microducks.org/
- Guías de simulación, políticas y entrenamiento: https://microduckrobot.org/guides/
- Tutorial de NVIDIA en el blog de Hugging Face (entrenamiento con Isaac Lab 3.0 y despliegue sim-to-real): https://huggingface.co/blog/nvidia/microduck-isaac-lab-sim-to-real
