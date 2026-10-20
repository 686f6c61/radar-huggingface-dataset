# shinba/smolvla_so101_red_cube_bowl_v2

## Resumen

`shinba/smolvla_so101_red_cube_bowl_v2` es una política visión-lenguaje-acción (VLA) compacta publicada en Hugging Face por el usuario `shinba`, obtenida por ajuste fino del modelo base `lerobot/smolvla_base` mediante la librería LeRobot. No es un modelo de lenguaje generativo: es un controlador neuronal que, a partir de tres imágenes de cámara de 256×256 píxeles y del estado articular del robot (vector de 6 dimensiones), produce directamente una acción de 6 dimensiones para un brazo seguidor SO-101. El modelo resuelve una única tarea de manipulación: coger un cubo rojo y depositarlo en un cuenco azul.

El interés de esta ficha es doble. Por un lado, documenta un caso real de ajuste fino de SmolVLA (paper arXiv 2506.01844) con un conjunto de datos pequeño y propio (144 episodios, 75.313 fotogramas a 30 FPS), lo que sirve como referencia práctica de cuánto dati y qué hiperparámetros requiere una política de imitación de este tipo. Por otro, el modelo base SmolVLA se presenta en su model card como una alternativa «compacta y eficiente» con un coste computacional reducido y desplegable en hardware de consumo.

El resultado tiene 450.046.176 parámetros (aproximadamente 0,45 mil millones) y un repositorio de 0,9 GB en formato safetensors, licencia Apache 2.0. Es, por tanto, un modelo pequeño para los estándares actuales de VLA, pensado para ejecutarse en un único GPU de gama media o incluso en un equipo de sobremesa con GPU de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta; ajuste fino de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica (política de acción, no modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponibles; la instruccion de tarea usada en el entrenamiento esta en ingles (`"Pick up the red cube and place it in the blue bowl"`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` (brazo seguidor SO-101) |
| Camaras | `wrist` (la model card declara tres entradas visuales: `camera1`, `camera2`, `camera3`) |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Salida de accion | `action`, forma `(6,)` |
| Tamano del repositorio | 0,9 GB |
| Dataset de entrenamiento | `shinba/so101_red_cube_bowl_v2` (144 episodios, 75.313 fotogramas, 30 FPS) |
| Version de LeRobot | 0.6.2 |
| Fecha de creacion en el Hub | 2026-10-19 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un VLA «compacto y eficiente» que alcanza rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo. La ficha no detalla los componentes internos (codificador visual, espina dorsal de lenguaje, cabeza de acción, esquema de generación de acciones), por lo que esos detalles deben consultarse en el paper arXiv 2506.01844. Lo que sí se puede afirmar a partir de los metadatos y de la model card es la interfaz exacta del modelo: consume un vector de estado de 6 dimensiones y tres imágenes RGB de 3×256×256, y emite un vector de acción de 6 dimensiones, que es la firma típica de una política de imitación para un brazo de 6 grados de libertad con cámaras cenital y de muñeca.

El ajuste fino se realizó sobre el dataset `shinba/so101_red_cube_bowl_v2`, compuesto por 144 episodios de demostración teleoperada, 75.313 fotogramas a 30 FPS y una única instrucción de tarea en inglés. La configuración de entrenamiento registrada es: 30.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.2. No se documenta en la información disponible si hubo una fase de preentrenamiento adicional, mezcla con datasets comunitarios, RLHF/DPO ni ninguna innovación técnica específica más allá del propio método SmolVLA descrito en el paper.

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de tres vistas de cámara y del estado articular, sin planificación simbólica intermedia.
- Ejecución de una tarea de pick-and-place concreta: «coger el cubo rojo y dejarlo en el cuenco azul», tal como se especifica en el dataset de entrenamiento.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como cadena de texto en el comando de despliegue (`--task=...`), aunque el modelo solo ha visto una instrucción durante el ajuste fino.
- Inferencia cerrada en bucle: pensada para ejecutarse de forma continua sobre el robot (el comando `lerobot-rollout` admite `--duration` o ejecución indefinida).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas `lerobot-train` y `lerobot-rollout`.
- No dispone de tool calling, function calling, razonamiento multi-paso explícito, modo «thinking», visión general de imágenes arbitrarias, audio ni generación de texto libre. Cualquier uso fuera del bucle percepción-acción sobre el robot descrito no está soportado por la información disponible.

## Casos de uso

- Prototipado de pick-and-place en laboratorio: el modelo puede ejecutar la secuencia completa de agarre y depósito sobre un SO-101 real, lo que permite validar en horas un pipeline de captura de datos, entrenamiento y despliegue sin escribir un controlador clásico.
- Referencia para ajuste fino de SmolVLA: sirve como ejemplo reproducible de qué hiperparámetros (30.000 pasos, lote 16, AdamW, lr 1e-4) y qué volumen de datos (144 episodios) bastan para una tarea de manipulación sencilla, útil para equipos que preparan sus propios datasets.
- Docencia e investigación con hardware de bajo coste: el SO-101 es un brazo económico y el modelo cabe en 0,9 GB de pesos, lo que hace viable montar prácticas de aprendizaje por imitación en un laboratorio universitario con GPUs de consumo.
- Comparativa de políticas de imitación: al ser un fine-tune de SmolVLA, puede enfrentarse en igualdad de condiciones a ACT o Diffusion Policy entrenados con el mismo dataset para medir tasa de éxito y robustez.
- Validación de pipelines de grabación: la model card enlaza el visualizador de datasets de LeRobot, de modo que el modelo sirve para comprobar que el esquema de nombres de cámara y las claves de observación del robot casan con lo esperado antes de escalar la recogida de datos.
- Estudio de sensibilidad a condiciones de contorno: al estar entrenado con un dataset pequeño y una sola tarea, es un banco de pruebas útil para medir degradación ante cambios de iluminación, posición inicial del cubo, distractores o un robot del mismo modelo pero con calibración distinta.
- Base para transferencia a una tarea propia: partir de estos pesos y reajustar con un dataset nuevo es más rápido que entrenar desde cero, siempre que la morfología del robot y el espacio de acciones (6 dimensiones) coincidan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente que todavía no se han proporcionado resultados en robot real para esta política, y no se incluye ninguna tabla de tasas de éxito, número de ensayos ni comparación cuantitativa con otras políticas. El paper del método (arXiv 2506.01844) reporta resultados para SmolVLA, pero no forman parte de la información proporcionada y no deben atribuirse a este ajuste fino concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,9 GB en precisión de 16 bits y 1,8 GB en fp32 (cálculo a partir de los 450 millones de parámetros). Sumando activaciones y el procesamiento de tres imágenes de 256×256, una estimación prudente sitúa el consumo en el rango de 2 a 4 GB de VRAM. Son estimaciones derivadas del tamaño del modelo, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM debería bastar para inferencia; para reentrenamiento con el mismo régimen (lote 16, 30.000 pasos) conviene una GPU de 16 GB o más. No hay datos publicados de latencia ni de throughput en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4070 o superiores, así como en GPUs de portátil con 6-8 GB. No se ha verificado experimentalmente en la información disponible.
- Opciones de despliegue: LeRobot es la vía soportada, con `lerobot-rollout` para ejecutar la política sobre el robot y `lerobot-train` para reentrenar. El modelo se distribuye en safetensors sobre PyTorch. Herramientas de servido de LLM como vLLM, TGI, llama.cpp u Ollama no aplican, porque la salida es un vector de acción y no texto.
- Requisitos de robot: brazo `so_follower` con puerto serie accesible, cámaras configuradas a 640×480 y 30 FPS, y nombres de cámara que coincidan exactamente con las claves de observación del entrenamiento (`observation.images.camera1`, `camera2`, `camera3`).
- Latencia y throughput: no disponibles. La frecuencia de control efectiva depende del hardware, del número de cámaras y de la implementación de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `shinba/smolvla_so101_red_cube_bowl_v2` | 450.046.176 | VLA (fine-tune) | Apache 2.0 | Hugging Face, libreria `lerobot` | Una sola tarea; sin resultados de evaluacion publicados |
| `lerobot/smolvla_base` | No disponible en la informacion (mismo backbone que el fine-tune) | VLA base preentrenada | No disponible en la informacion | Hugging Face | Punto de partida recomendado por la model card para reajustar |
| ACT (politics de imitacion de LeRobot) | No disponible en la informacion | Política de imitación por comportamiento | No disponible en la informacion | Ecosistema LeRobot | Alternativa clasica para tareas de manipulacion con datasets pequenos; sin datos comparativos en esta ficha |
| Diffusion Policy (LeRobot) | No disponible en la informacion | Política generativa por difusion | No disponible en la informacion | Ecosistema LeRobot | Alternativa habitual en manipulacion; sin datos comparativos en esta ficha |

No se dispone en la información proporcionada de cifras de rendimiento, contexto o consumo de las alternativas, por lo que la comparación cuantitativa queda pendiente de verificación en sus respectivas fichas.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: la model card declara explícitamente que no hay resultados en robot real. No hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no se puede afirmar que la política funcione de forma fiable.
- Especialización extrema: entrenada para una única instrucción («Pick up the red cube and place it in the blue bowl»). No generaliza a otras tareas, objetos, colores ni posiciones no vistas sin reentrenamiento.
- Dependencia del montaje físico: la política asume un robot `so_follower` concreto, tres cámaras con nombres y calibración específicos, y una disposición de escena similar a la del dataset. Cambiar la cámara de muñeca, la resolución o la altura de montaje degradará el comportamiento.
- Dataset pequeño: 144 episodios y 75.313 fotogramas son un volumen reducido, lo que aumenta el riesgo de sobreajuste a la iluminación, al fondo y a las posiciones iniciales del cubo y del cuenco presentes en la grabación.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación, puede producir trayectorias erráticas o inseguras ante entradas fuera de distribución, sin mecanismo interno de verificación.
- Idiomas: la instrucción de tarea está en inglés y el modelo no ha sido evaluado con instrucciones en castellano ni en otros idiomas; no se debe asumir comprensión multilingüe.
- Sesgos: no documentados. Al entrenarse con un único operador y una única escena, hereda los sesgos de esa demostración.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de la responsabilidad sobre la seguridad física de la operación. Cualquier despliegue en un robot real requiere límites de par, paradas de emergencia y supervisión humana.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permita contrastar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinba/smolvla_so101_red_cube_bowl_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/shinba/so101_red_cube_bowl_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shinba/so101_red_cube_bowl_v2
- Esquema de arquitectura incluido en la model card: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png
