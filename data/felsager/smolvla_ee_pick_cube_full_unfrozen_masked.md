# felsager/smolvla_ee_pick_cube_full_unfrozen_masked

## Resumen

`felsager/smolvla_ee_pick_cube_full_unfrozen_masked` es una política visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base`, publicado por el usuario felsager en Hugging Face. No es un modelo de lenguaje: es un controlador robótico que recibe imágenes de cámara más el estado del robot y emite un vector de acción de 10 dimensiones. Concretamente, ha sido entrenado para la tarea de coger cubos de cuatro colores (azul, amarillo, verde y rojo) con un robot UR5e equipado con pinza Hand-E.

El modelo resuelve el problema de la manipulación robótica mediante imitación: aprende una política de comportamiento a partir de 10.000 episodios de demostración (2.397.060 fotogramas a 30 FPS) recogidos en el dataset `felsager/vla_cubes_big`. Frente a alternativas tipo OpenVLA (7B parámetros), esta política tiene 450 millones de parámetros, lo que la sitúa en el rango de despliegue en hardware de consumo, tal y como promete la familia SmolVLA.

Es relevante ahora porque ejemplifica el patrón actual de reutilización de modelos base abiertos: un VLA compacto preentrenado y ajustado con LeRobot sobre un conjunto de datos propio, con licencia Apache 2.0 y un pipeline reproducible por CLI. Ahora bien, se trata de un artefacto de investigación muy específico (un único robot, cuatro tareas de picking) y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA compacta (familia SmolVLA): columna vertebral VLM + experto de acción; detalles internos no disponibles en la model card |
| Parámetros totales | 450.046.176 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; no aplica una ventana de contexto de texto al uso: la instrucción de tarea es una cadena corta y la observación es ventana de imágenes |
| Tipos de cuantización | no disponible; se publican pesos en safetensors (precisión original no documentada). No hay GGUF ni versiones cuantizadas |
| Idiomas soportados | no disponible; las instrucciones del dataset están en inglés ("pick up the blue cube.", etc.) y no se documenta capacidad multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio gestionado con la librería `lerobot`) |

Especificaciones de entrada/salida declaradas por el autor:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(10,)` |
| `observation.images.top` | VISUAL | `(3, 480, 640)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `observation.images.empty_camera_0` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(10,)` |

## Arquitectura y entrenamiento

La model card identifica el método como SmolVLA (arXiv:2506.01844), descrito como un modelo visión-lenguaje-acción compacto y eficiente, con rendimiento competitivo a coste computacional reducido y desplegable en hardware de consumo. El repositorio no detalla la arquitectura interna (composición exacta del backbone visual-léxico, mecanismo de generación de acciones, uso de decodificación o flujo de matching), por lo que esos detalles deben consultarse en el artículo original. La política está integrada en el ecosistema LeRobot y se ejecuta mediante el comando `lerobot-rollout`.

El ajuste fino se realizó sobre `felsager/vla_cubes_big`: 10.000 episodios, 2.397.060 fotogramas, 30 FPS, con cuatro instrucciones de tarea (recoger el cubo azul, amarillo, verde o rojo). La configuración de entrenamiento documentada es: 80.000 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,001, semilla 0 y LeRobot 0.6.2. El robot objetivo es `ur5e_hand_e` con cámaras `top` y `wrist`. No se documenta el uso de RLHF, DPO ni otras fases de alineamiento, algo esperable en una política de imitación. El nombre del repositorio ("full_unfrozen_masked") sugiere que se descongelaron todos los parámetros durante el ajuste fino y que se aplicó algún enmascaramiento, pero el autor no explica en la model card en qué consiste.

## Capacidades

- Generación de acciones de control robótico de 10 dimensiones a partir de observaciones multimodales (dos cámaras reales más una tercera entrada visual declarada).
- Ejecución de instrucciones de tarea en lenguaje natural, limitadas en la práctica a las cuatro frases vistas en entrenamiento ("pick up the blue cube.", "pick up the yellow cube.", "pick up the green cube.", "pick up the red cube.").
- Percepción visual desde punto de vista cenital (`top`) y de muñeca (`wrist`), a resolución 640x480 y 30 FPS.
- Condicionamiento conjunto de estado propioceptivo y visión para el control del efector final y la pinza.
- Integración con el pipeline de LeRobot: `lerobot-rollout` para inferencia en robot real y `lerobot-train` para reentrenamiento.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general (VQA), audio ni modo "thinking"; no es un modelo de propósito general.

## Casos de uso

- Replicación de un experimento de imitación en laboratorio: servir como punto de partida reproducible para validar el pipeline completo de LeRobot (grabación de datos, entrenamiento, despliegue) sobre un UR5e con pinza Hand-E, usando el dataset público de cubos.
- Base para ajuste fino con datos propios: al estar liberado en Apache 2.0 y derivar de `lerobot/smolvla_base`, puede reentrenarse con `lerobot-train` sobre un dataset nuevo y un robot del mismo tipo, aprovechando los 450 M de parámetros para iterar rápido en una sola GPU.
- Docencia y divulgación en robótica: demostración de aprendizaje por imitación de extremo a extremo, con la ventaja de que el modelo cabe en GPUs de consumo y el flujo de trabajo es una secuencia de comandos CLI.
- Benchmark interno de políticas: usar esta política como referencia (baseline) al comparar variantes de arquitectura o de composición del dataset en la tarea concreta de picking de cubos de colores.
- Pruebas de integración hardware-software: validar calibración de cámaras, tasas de refresco y latencia del bucle de control en un montaje UR5e antes de invertir en un modelo mayor.
- Generación de datos sintéticos o aumento de dataset: ejecutar la política en bucle para estudiar modos de fallo y recoger episodios adicionales que enriquezcan el conjunto de entrenamiento (con supervisión humana).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet". No existen, por tanto, tasas de éxito por tarea, ni comparaciones medidas con otras políticas en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 450 M parámetros, lo que supone aproximadamente 1,8 GB en FP32 y 0,9 GB en BF16 solo para los pesos; con activaciones y dos (o tres) flujos de imagen a 480x640, un presupuesto práctico de 4-8 GB de VRAM es razonable, aunque el autor no publica cifras.
- El repositorio ocupa 19,9 GB, muy por encima del tamaño de los pesos, lo que indica que incluye checkpoints intermedios y/o estados del optimizador; conviene descargar solo los ficheros necesarios.
- GPU recomendadas: cualquier GPU con 8 GB o más para inferencia (RTX 3060/4060/4070/4090, A4000, L4); A100/H100 solo tienen sentido para reentrenamiento a mayor lote.
- Cabe en GPU de consumo: sí, previsiblemente en modelos de 8 GB en adelante; la propia familia SmolVLA se presenta como desplegable en hardware de consumo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=felsager/smolvla_ee_pick_cube_full_unfrozen_masked`) sobre PyTorch. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, que no están orientados a políticas VLA de control robótico.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de inferencia ni de tiempo por paso de control para este ajuste.

## Comparativa con modelos similares

Los datos de parámetros de las alternativas provienen de literatura pública y no han sido verificados contra sus model cards en esta ficha; tómense como orientativos.

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (SmolVLA ajustado) | 450 M | VLA de imitación, UR5e + Hand-E | Apache 2.0 | Hugging Face (LeRobot) | Sin evaluación publicada; 4 tareas de picking |
| `lerobot/smolvla_base` | ~450 M | VLA base preentrenada | Apache 2.0 (según repositorio base) | Hugging Face | Punto de partida genérico, sin especializar en robot concreto |
| OpenVLA | ~7B | VLA de propósito general | Permisiva (verificar) | Hugging Face | Mucho mayor coste de inferencia; requiere hardware de gama alta |
| π0 (Physical Intelligence) | ~3,3B | VLA con modelo de flujo de acciones | No abierta en su totalidad (verificar) | Parcial | Referencia de alto rendimiento, no desplegable en GPU de consumo |
| ACT (Action Chunking Transformer) | decenas de millones | Política de imitación pura | Abierta (LeRobot) | Hugging Face / LeRobot | Sin componente de lenguaje; muy ligera, pero no generaliza instrucciones |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas, ni número de ensayos, ni condiciones de prueba. Cualquier uso en producción parte de cero en cuanto a evidencia de fiabilidad.
- Especialización extrema: el modelo solo se ha entrenado con cuatro instrucciones de picking de cubos de colores sobre un UR5e con pinza Hand-E. No se debe esperar generalización a otros objetos, tareas o instrucciones.
- Dependencia del montaje físico: las claves de observación (`observation.images.top`, `observation.images.wrist`, `observation.images.empty_camera_0`) y la resolución 480x640 deben coincidir exactamente con el montaje de inferencia; cualquier cambio de cámara, encuadre o iluminación puede degradar el comportamiento.
- La entrada `observation.images.empty_camera_0` sugiere una cámara declarada sin contenido útil o un artefacto de configuración del dataset; conviene verificar cómo tratarla antes del despliegue.
- El vector de estado y de acción es de 10 dimensiones, pero la model card no detalla su composición (posiblemente pose del efector final y apertura de pinza); es necesario confirmarlo contra el dataset antes de conectar un robot.
- Riesgo de sobreajuste al entorno de recogida de datos (mesa, iluminación, posiciones de cubo) y de fallos silenciosos fuera de distribución; no existe mecanismo de abstención ni de estimación de incertidumbre documentado.
- Idiomas: no hay evidencia de soporte multilingüe; las instrucciones de entrenamiento están en inglés y el modelo no es un asistente conversacional.
- Sesgos: no documentados por el autor. Al ser un modelo visual entrenado con un conjunto muy reducido de escenas, puede heredar sesgos de color, textura y geometría del dataset.
- Licencia Apache 2.0 en este repositorio, que permite uso comercial; aun así, deben verificarse las licencias del modelo base y del backbone subyacente, así como de las dependencias de LeRobot, antes de un despliegue comercial.
- Sin garantías de seguridad física: es una política de investigación; su uso en un robot real exige límites de par, paradas de emergencia y supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/smolvla_ee_pick_cube_full_unfrozen_masked
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_big
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_big
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota del editor: la búsqueda web asociada a esta ficha devolvió únicamente resultados no relacionados con el modelo (contenido para adultos), por lo que se han descartado en su totalidad y no se incluyen como fuentes.
