# sahilkulriaboss/smolvla_s1_base400

## Resumen

`smolvla_s1_base400` es una política de robótica de tipo vision-language-action (VLA) publicada por el usuario `sahilkulriaboss` en Hugging Face, obtenida por ajuste fino del modelo base `lerobot/smolvla_base`. No es un modelo de lenguaje general: recibe el estado articular de un brazo robótico SO-101 junto con varias cámaras y devuelve directamente un vector de acción de 6 dimensiones, condicionado por una instrucción en lenguaje natural. Con 450.046.176 parámetros y un repositorio de 0,9 GB en safetensors, está pensada para ejecutarse en hardware de consumo.

Su relevancia es acotada y muy específica: es un ejemplo reproducible de ajuste fino de SmolVLA con LeRobot 0.6.0 sobre un dataset propio de 400 episodios y 137.351 fotogramas grabados a 30 FPS, para tareas de recogida de cubos de colores y depósito en una caja. Sirve como referencia práctica de imitación visual-motora de bajo coste, no como modelo de propósito general.

El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha (creado el 2026-10-17 según los metadatos), no incluye resultados de evaluación y su model card conserva la plantilla sin rellenar en la sección de evaluación. Cualquier uso en producción debería ir precedido de una validación propia en el puesto de trabajo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; se ajusta sobre `lerobot/smolvla_base` (SmolVLA, arXiv:2506.01844). El detalle interno de capas y mecanismo de acción no se especifica en la informacion proporcionada |
| Parametros totales | 450.046.176 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (política de control; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors de precisión completa (0,9 GB, compatible con pesos de 16 bits) |
| Idiomas soportados | No disponible como campo de idiomas. Las 15 instrucciones del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Tipo de modelo / pipeline | `robotics` (política de imitación, no modelo generativo de texto) |
| Robot objetivo | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,); `observation.images.camera1` (3, 256, 256); `observation.images.camera2` (3, 256, 256); `observation.images.camera3` (3, 256, 256); `observation.images.empty_camera_0` (3, 480, 640) |
| Salidas | `action` (6,) |
| Camaras declaradas en la model card | `wrist`, `top` |
| Dataset de entrenamiento | `sahilkulriaboss/so101_base_400`: 400 episodios, 137.351 fotogramas, 30 FPS |
| Pasos de entrenamiento | 12.000 |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política sigue el enfoque SmolVLA descrito en arXiv:2506.01844: un modelo vision-language-action compacto que consume observaciones visuales y propioceptivas y emite acciones de control de forma directa. La model card destaca el objetivo de diseño del modelo base ("rendimiento competitivo con coste computacional reducido, desplegable en hardware de consumo"), pero no detalla la disposición de capas, el número de tokens visuales por cámara ni el mecanismo concreto del decodificador de acciones. Esos datos deben consultarse en el paper y en la documentación de LeRobot.

El ajuste fino se realizó con LeRobot 0.6.0 durante 12.000 pasos, con batch size 16, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset contiene 400 episodios (137.351 fotogramas a 30 FPS) de un SO-101 realizando 15 tareas de picking de cubos por color e instrucción ("Pick up the yellow cube and put it in the box", "Pick up any red cube and put it in the box", etc.), incluyendo variantes de cubo grande y de color libre. No se documenta en la información disponible si hubo RLHF, DPO u otra fase de alineamiento, ni la composición exacta de datos más allá de esa lista de tareas.

Un detalle técnico relevante es la presencia de una cuarta entrada visual llamada `empty_camera_0` con resolución 480×640, distinta de las tres cámaras de 256×256. Es habitual que sea un residuo de la configuración de grabación; cualquier despliegue debe replicar exactamente las claves y formas de observación con las que se entrenó, o el modelo fallará en la inferencia.

## Capacidades

- Control visual-motor de un brazo SO-101: genera acciones de 6 dimensiones a partir del estado articular y de imágenes de varias cámaras.
- Seguimiento de instrucciones en lenguaje natural en inglés, dentro del vocabulario de las 15 tareas de recogida de cubos vistas en entrenamiento.
- Discriminación de objetos por color y por tamaño (cubos pequeños y grandes: rojo, naranja, amarillo, verde, azul).
- Tareas de tipo "any" (por ejemplo, "pick up any red cube"), que requieren seleccionar una instancia entre varias del mismo color.
- Fusión de múltiples vistas: tres cámaras a 256×256 más una toma adicional a 480×640, con nombres de cámara configurables vía CLI.
- Ejecución en bucle cerrado con `lerobot-rollout` durante una duración configurable.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades de audio o de generación de texto libre: no es un modelo de lenguaje.
- Capacidad multilingüe: no disponible; las instrucciones del dataset están en inglés.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta "coge el cubo X y ponlo en la caja" sobre un SO-101 con cámara de muñeca y cámara cenital, sustituyendo el scripting de trayectorias por una política aprendida que absorbe pequeñas variaciones de posición de los cubos.
- Docencia y prototipado en robótica de imitación: con 450 M de parámetros y 0,9 GB de pesos, un grupo puede reproducir el flujo completo de grabación, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout` en un puesto de bajo coste.
- Punto de partida para ajuste fino con datos propios: al derivar de `lerobot/smolvla_base` y Apache 2.0, sirve como inicialización para nuevas tareas de manipulación con datasets de tamaño similar (cientos de episodios), reduciendo el coste frente a entrenar desde cero.
- Selección condicionada por instrucción en una misma política: en lugar de mantener un controlador por color, un único modelo cubre las 15 variantes de tarea del dataset, lo que simplifica la lógica de orquestación en demostraciones con varios objetos.
- Evaluación comparativa de políticas de imitación: sirve como referencia base en experimentos que midan tasa de éxito frente a otras políticas entrenadas con los mismos 400 episodios y el mismo robot.
- Pruebas de repetibilidad y regresión en CI de robótica: ejecutar `lerobot-rollout` con `--duration` fijo sobre un banco instrumentado permite detectar degradaciones al cambiar cámaras, calibración o versión de LeRobot.
- Despliegue en robot de bajo consumo: por tamaño y huella de memoria, es candidato para ejecutarse en una GPU de gama media o en un módulo embebido junto al brazo, sin servidor dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card conserva la plantilla sin rellenar ("No evaluation results") y no se proporciona tasa de éxito, número de ensayos ni comparación con otras políticas. Tampoco se documentan latencia ni throughput medidos en el robot.

## Requisitos de hardware

- Huella de pesos: 450 M de parámetros equivalen aproximadamente a 0,9 GB en 16 bits y a unos 1,8 GB en fp32 (cálculo derivado del tamaño de parámetros, no publicado por el autor).
- VRAM estimada para inferencia: del orden de 2 a 4 GB incluyendo activaciones de tres imágenes de 256×256 y una de 480×640. Es una estimación por tamaño, no una cifra medida.
- GPU consumer: sí cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y similares; también en módulos embebidos tipo Jetson Orin, siempre que se valide la latencia del bucle de control.
- GPU de centro de datos: A100, H100 o L40S son innecesarias para inferencia, pero útiles para reentrenar o hacer barridos de hiperparámetros.
- Despliegue: la vía documentada es LeRobot (`lerobot-rollout` para ejecutar, `lerobot-train` para reentrenar) sobre PyTorch. vLLM, TGI, llama.cpp y Ollama no aplican: son servidores de modelos de lenguaje y esta es una política visomotora.
- Latencia y throughput: no disponibles. Como referencia indirecta, el dataset se grabó a 30 FPS, lo que sugiere que el bucle de control debería sostener esa frecuencia, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sahilkulriaboss/smolvla_s1_base400` | 450.046.176 | No aplica / no disponible | VLA afinada para SO-101, 15 tareas de cubos | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | 450 M (misma familia; el ajuste no altera el tamaño) | No aplica / no disponible | VLA base preentrenada, sin tareas específicas | Apache 2.0 (según el repositorio de origen) | Hugging Face, mantenido por LeRobot |
| Otras familias VLA (OpenVLA, π0) | No disponible en la información proporcionada | No disponible | VLA de propósito general | No disponible | No disponible |

La comparación relevante es contra el modelo base: esta versión solo aporta la especialización en el robot SO-101 y en las 15 tareas del dataset `so101_base_400`, a cambio de perder generalidad. No se dispone de datos de rendimiento que permitan afirmar que la especialización mejora la tasa de éxito frente al base en esas tareas.

## Limitaciones y advertencias

- Dominio muy estrecho: cubos de colores sobre una superficie concreta, una caja de destino y un único tipo de robot (SO-101). Fuera de esa distribución no hay garantía de comportamiento mínimamente razonable.
- Sin resultados de evaluación publicados: no hay tasa de éxito, número de ensayos ni protocolo, por lo que no se puede afirmar que la política funcione de forma fiable ni siquiera en su tarea nominal.
- Riesgo de sobreajuste: 12.000 pasos sobre 400 episodios y 15 tareas implican pocas decenas de episodios por variante; es esperable un ajuste fuerte a posiciones, iluminación y aspecto de los objetos del dataset.
- Dependencia crítica de la configuración: las claves de observación (`camera1`, `camera2`, `camera3`, `empty_camera_0`), sus resoluciones y el orden del vector de estado deben replicarse exactamente; cualquier desviación invalida la inferencia.
- Idiomas: las instrucciones de entrenamiento están en inglés; no hay evidencia de que acepte instrucciones en castellano.
- Alucinación en el sentido lingüístico no aplica, pero sí el equivalente conductual: la política puede ejecutar movimientos plausibles pero incorrectos (coger el cubo equivocado, no completar el depósito) sin señal de error ni abstención.
- Sesgos: no documentados. Los colores, tamaños y disposición de los objetos del dataset determinan qué distinciones aprende y cuáles ignora.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `lerobot/smolvla_base` y del dataset `sahilkulriaboss/so101_base_400` antes de explotación comercial.
- Seguridad física: es una política que mueve hardware real. Es obligatorio disponer de parada de emergencia, límites de par y espacio de trabajo despejado; el modelo no incorpora ninguna comprobación de seguridad.
- Madurez: 0 descargas y 0 likes, sin issues ni validación de la comunidad; trátese como un experimento reproducible, no como un artefacto soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahilkulriaboss/smolvla_s1_base400
- Dataset de entrenamiento: https://huggingface.co/datasets/sahilkulriaboss/so101_base_400
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sahilkulriaboss/so101_base_400
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces encontrados corresponden a una plataforma educativa francesa y se han descartado por no ser pertinentes.
