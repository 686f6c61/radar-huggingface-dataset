# alimerido/pi05-wrist-top-generic-3k

## Resumen

`alimerido/pi05-wrist-top-generic-3k` es un fine-tune de robótica del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05) de Physical Intelligence dentro del ecosistema LeRobot de Hugging Face. Se trata de un modelo visión-lenguaje-acción (VLA): recibe dos imágenes de cámara (muñeca y cenital, 480x640) más el estado articular del robot y emite directamente un vector de acción de 6 dimensiones. No genera texto libre ni código; su salida es control motor.

El modelo ha sido entrenado por el usuario `alimerido` sobre un dataset propio de 140 episodios y 94.703 fotogramas a 30 FPS, con seis tareas de recogida y colocación de cubos rojos y ladrillos LEGO azules y rojos, incluyendo una tarea de apilado. El entrenamiento consistió en 3.000 pasos con batch de 32 y AdamW a 2,5e-05 de learning rate, partiendo del checkpoint base preentrenado.

Su relevancia es doble: por un lado, demuestra el flujo completo de imitación con LeRobot (grabar datos con un SO-100/SO-101 follower, ajustar π₀.₅ y desplegar con `lerobot-rollout`); por otro, sirve como ejemplo reproducible de ajuste fino de un VLA de 4.143.404.816 parámetros en hardware de consumo. El repositorio ocupa 9,4 GB, no tiene descargas ni valoraciones, y no incluye resultados de evaluación en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) heredada de π₀.₅ vía `lerobot/pi05_base`; el detalle de capas no se especifica en la información disponible |
| Parámetros totales | 4.143.404.816 (4,14 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje de propósito general. Entradas: instrucción textual, `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Tipos de cuantización | No disponible; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la ficha; las tareas del dataset de entrenamiento están redactadas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Salida | `action` (6,) |
| Tipo de robot | `so_follower` (SO-100/SO-101 follower) |
| Cámaras requeridas | `wrist` y `top`, 640x480 a 30 FPS |
| Modelo base | `lerobot/pi05_base` |
| Tamaño del repositorio | 9,4 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

π₀.₅ es un modelo visión-lenguaje-acción diseñado para generalización en entornos abiertos, según la descripción del propio autor y el blog de Physical Intelligence enlazado en la model card. La implementación utilizada aquí es la adaptación de LeRobot del repositorio OpenPI. La información proporcionada no detalla el número de capas, el backbone de visión ni el mecanismo de generación de acciones (por ejemplo, si emplea *action chunking* o *flow matching*), por lo que esos extremos quedan como no disponibles.

El ajuste fino se realizó con LeRobot 0.6.2 sobre el dataset `alimerido/wrist-top-cube_20260705_134536`: 140 episodios, 94.703 fotogramas a 30 FPS (aproximadamente 52 minutos de grabación y unas 22,5 segundos por episodio), repartidos en seis tareas de manipulación con cubos y ladrillos LEGO. La configuración de entrenamiento fue de 3.000 pasos, batch de 32 (unas 96.000 muestras procesadas), optimizador AdamW, learning rate 2,5e-05 y semilla 1000. No se documenta uso de RLHF, DPO ni fases de alineación posteriores; se trata de aprendizaje por imitación supervisado.

Como innovación práctica, el resultado es un *checkpoint* de política listo para desplegar con un único comando CLI, condicionado por instrucción textual en lenguaje natural, lo que permite reutilizar el mismo modelo para varias tareas del mismo entorno sin reentrenar.

## Capacidades

- Manipulación robótica de 6 grados de libertad: genera comandos de acción a partir del estado articular y de dos vistas de cámara.
- Condicionamiento por instrucción textual en inglés, con seis tareas registradas: coger el cubo rojo y dejarlo en la caja; coger el ladrillo LEGO azul y dejarlo en la caja verde o en la azul; coger el ladrillo LEGO rojo y dejarlo en la caja verde o en la azul; y apilar el cubo rojo derecho sobre el cubo rojo izquierdo.
- Percepción multimodal sincronizada: una cámara de muñeca y una cenital a 640x480 y 30 FPS.
- Generalización entre posiciones de objeto dentro del dominio entrenado, según la motivación declarada del modelo base π₀.₅.
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout`, con duración configurable o ejecución indefinida.
- No dispone de *tool calling*, *function calling*, razonamiento multi-paso textual, visión generalista, audio ni modo de razonamiento explícito.

## Casos de uso

- Recogida y colocación en laboratorio o aula: el modelo ejecuta tareas de *pick and place* con cubos y ladrillos sobre un brazo SO-100/SO-101, lo que permite montar prácticas de robótica con hardware de bajo coste y un *checkpoint* ya entrenado.
- Clasificación por color en una célula automatizada: las tareas «ladrillo azul a caja azul», «ladrillo azul a caja verde» y sus equivalentes en rojo cubren un escenario de selección por atributo visual, adecuado para demostrar *bin picking* simplificado.
- Apilado de objetos: la tarea de apilar un cubo rojo sobre otro requiere precisión posicional y sirve como banco de pruebas para manipulación de precisión con realimentación visual de la muñeca.
- Punto de partida para *fine-tuning* propio: dado que se entrena a partir de `lerobot/pi05_base` con `lerobot-train`, este repositorio sirve de plantilla para adaptar π₀.₅ a un robot, útil cuando el equipo ya usa SO-100/SO-101 y quiere evitar partir de cero.
- Evaluación comparativa de políticas VLA: al ser un ajuste sobre un dataset pequeño y conocido (140 episodios), es un caso de estudio útil para medir sobreajuste y sensibilidad al número de episodios en imitación.
- Prototipado de pipelines de datos robóticos: el dataset asociado permite reproducir el ciclo completo de grabación a 30 FPS, visualización, entrenamiento y despliegue, lo que resulta útil para validar infraestructura antes de invertir en recogida de datos a mayor escala.
- Demostraciones y divulgación: con una sola política condicionada por texto se pueden mostrar varias tareas distintas con el mismo *checkpoint*, lo que simplifica las demostraciones en ferias y jornadas técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la nota explícita «_No evaluation results have been provided for this policy yet_», por lo que no existen tasas de éxito en robot real, comparativas con π₀.₅ base ni métricas de *loss* reportadas.

| Métrica | Resultado |
|---|---|
| Tasa de éxito en robot real | No disponible |
| Número de ensayos por tarea | No disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplicable (modelo de acción, no de texto) |
| Comparación con el modelo base | No disponible |

## Requisitos de hardware

- VRAM estimada para los pesos: unos 8,3 GB en bf16/fp16 (4,14 B de parámetros), unos 16,6 GB en fp32 y en torno a 4,1 GB en int8 si se aplicara cuantización, opción no documentada por el autor.
- VRAM total recomendada: 16-24 GB, ya que hay que sumar activaciones, codificador de visión y dos imágenes de 480x640 por paso de inferencia.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090. En consumer, una RTX 4090 o RTX 3090 de 24 GB son las opciones más seguras; una GPU de 16 GB queda al límite y no está validada en la información disponible.
- Despliegue: el flujo oficial es LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=alimerido/pi05-wrist-top-generic-3k`) sobre PyTorch con CUDA. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que además no encajan con un modelo que emite acciones en lugar de tokens de texto.
- Latencia y throughput: no disponibles. Como referencia de diseño, el dataset de entrenamiento está grabado a 30 FPS, lo que sugiere un bucle de control en ese orden de frecuencia, pero no se confirma la tasa de inferencia real alcanzable.
- Periféricos necesarios: brazo `so_follower` y dos cámaras OpenCV a 640x480 y 30 FPS, con nombres de cámara que deben coincidir con las claves de observación del entrenamiento (`wrist` y `top`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `alimerido/pi05-wrist-top-generic-3k` | 4,14 B | Instrucción textual + estado (6,) + 2 imágenes 480x640 | Apache 2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune sobre 140 episodios y 6 tareas |
| `lerobot/pi05_base` | No disponible (es el checkpoint base del que parte este ajuste) | Entradas del VLA π₀.₅ | No disponible en la información proporcionada | Hugging Face | Preentrenamiento generalista; requiere *fine-tuning* para tareas concretas |
| Otros VLA abiertos (OpenVLA, GR00T N1, RDT y similares) | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos comparativos en la información proporcionada; no se aportan cifras para no inventarlas |

No se dispone de resultados de rendimiento del modelo ni de sus alternativas en la información consultada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito en robot real ni pruebas de robustez, de modo que su fiabilidad en producción es desconocida.
- Dominio muy estrecho: seis tareas de recogida, colocación y apilado de cubos y ladrillos LEGO en una configuración concreta de cámara y robot.
- Riesgo alto de sobreajuste y de fallo ante desplazamientos de distribución: cambios de iluminación, fondo, posición inicial de los objetos, objetos nuevos o un robot distinto pueden degradar el comportamiento sin aviso.
- Dependencia de la configuración exacta: el modelo espera `observation.state` de 6 dimensiones y dos cámaras con las claves `wrist` y `top`; cualquier desviación en nombres, resolución o calibración invalida la inferencia.
- Idioma: no se documenta soporte multilingüe; las instrucciones del dataset están en inglés y no hay evidencia de que el modelo interprete otros idiomas.
- Sesgos: no se han documentado sesgos específicos, pero el dataset es reducido y de un único operador y entorno, por lo que la política puede reproducir sesgos de las demostraciones (trayectorias, velocidades y agarres concretos).
- Alucinación en el sentido de generación de texto no aplica; el equivalente es la ejecución de acciones incorrectas o inseguras ante entradas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base `lerobot/pi05_base` y del dataset `alimerido/wrist-top-cube_20260705_134536`, cuyos términos no se detallan en la información disponible.
- Seguridad física: el modelo no incorpora capas de detección de colisiones ni parada de emergencia; cualquier despliegue real debe añadir límites de par, vigilancia externa y supervisión humana.
- Madurez del repositorio: 0 descargas y 0 likes, actualizado por última vez en la misma fecha de creación (19 de septiembre de 2026), sin mantenimiento verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alimerido/pi05-wrist-top-generic-3k
- Dataset de entrenamiento: https://huggingface.co/datasets/alimerido/wrist-top-cube_20260705_134536
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alimerido/wrist-top-cube_20260705_134536
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos correspondían a páginas de Instagram sin relación con el proyecto.
