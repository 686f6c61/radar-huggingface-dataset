# gracemxli51/act_sponge

## Resumen

`gracemxli51/act_sponge` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está diseñado para ejecutarse sobre un brazo `so_follower` (familia SO-100/SO-101) equipado con una única cámara frontal.

La tarea que resuelve es deliberadamente acotada: "coger la esponja y moverla al lado derecho de la mesa". Se entrenó a partir de 51 episodios teleoperados (22.092 fotogramas a 30 FPS) recogidos en el dataset `gracemxli51/sponge_left_to_right`, durante 28.000 pasos con optimizador AdamW y una tasa de aprendizaje de 1e-5.

Con 51.668.614 parámetros (unos 51,7 millones) y un repositorio de 0,4 GB, es un modelo pequeño orientado a inferencia en tiempo real en hardware de bajo coste, no un modelo de lenguaje. Su relevancia es la de un ejemplo reproducible de *policy learning* de extremo a extremo: entrada de estado propioceptivo de 6 dimensiones más una imagen RGB de 480x640, y salida de un vector de acción de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): política de imitación con codificador visual y transformer con latente CVAE, según el paper arXiv:2304.13705 |
| Parametros totales | 51.668.614 (≈51,7 M), dato real de los pesos safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones de la política y produce chunks de acción) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible (no procesa lenguaje natural como entrada; la tarea se fija mediante cadena de texto en la CLI) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-100/SO-101) |
| Camaras | 1 camara frontal (`front`), 480x640, 30 FPS |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual convolucional con un transformer de tipo encoder-decoder y un espacio latente condicionado por variacional (CVAE). En lugar de predecir una única acción por paso de tiempo, el modelo genera un *chunk* de acciones futuras, lo que reduce el error de compounding y permite un control más suave. La model card no detalla la configuración concreta del backbone visual ni el tamano del chunk para esta política en particular, por lo que esos valores quedan como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `gracemxli51/sponge_left_to_right`: 51 episodios, 22.092 fotogramas, 30 FPS, una única tarea ("Pick up the sponge and move it to the right side of the table"). Se ejecutaron 28.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni fases de refinamiento posteriores: es aprendizaje por imitación supervisado puro sobre demostraciones teleoperadas.

## Capacidades

- Manipulación robótica de una sola tarea: coger una esponja y desplazarla al lado derecho de la mesa, a partir de una observación visual y del estado articular.
- Predicción de chunks de acción de 6 dimensiones, orientada a control continuo a 30 FPS.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensas explícitas.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica; el modelo no procesa texto.
- Capacidades especiales (modo thinking, visión, audio): visión RGB de una sola camara frontal; no hay audio ni razonamiento simbólico.
- Entrada propioceptiva de 6 dimensiones (estado del brazo) y salida de 6 dimensiones (acción).

## Casos de uso

- Replicación de la tarea de referencia: ejecutar la política sobre un SO-100/SO-101 con camara frontal a 480x640 y 30 FPS para mover una esponja de un extremo a otro de la mesa, usando `lerobot-rollout` con `--policy.path=gracemxli51/act_sponge`.
- Banco de pruebas de hardware de bajo coste: validar calibración, latencia de camara y repetibilidad de un brazo SO antes de escalar a políticas mas complejas.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train` sobre un dataset propio y comparar curvas de éxito frente a este checkpoint como referencia base.
- Docencia y divulgación en robótica: ejemplo completo y ligero (51,7 M de parámetros) del flujo grabar datos, entrenar y desplegar una política de imitación.
- Validación de pipelines de recogida de datos: comprobar que el formato del dataset, los nombres de las claves de observación y la frecuencia de captura son consistentes antes de invertir en campañas mayores.
- Comparación metodológica ACT frente a otras políticas de LeRobot (por ejemplo Diffusion Policy) sobre el mismo dataset y el mismo robot, midiendo tasa de éxito y suavidad de trayectoria.
- Pruebas de robustez a cambios de iluminación y posición del objeto reejecutando la misma política en condiciones alteradas, útil para documentar su sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito medidas ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 51,7 M de parámetros, los pesos ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16, sin contar activaciones ni el codificador visual.
- El repositorio completo ocupa 0,4 GB, de modo que cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas o en CPU para pruebas puntuales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia en tiempo real sin problemas. Aceleradores como A100 o H100 no aportan ventaja significativa para este tamano.
- Cabe en GPU de consumo: sí, en practicamente cualquier modelo moderno (serie RTX 20/30/40, e incluso en placas con GPU integrada para inferencia de baja frecuencia).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=gracemxli51/act_sponge`), entrenamiento y reentrenamiento con `lerobot-train`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una política de robótica.
- Latencia y throughput: no disponibles. La politica esta pensada para operar a 30 FPS junto con la captura de camara, pero no se publican mediciones de latencia por chunk.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gracemxli51/act_sponge` | ACT (imitación, chunking) | 51,7 M | Estado (6,) + imagen 480x640 | apache-2.0 | Hugging Face, via LeRobot |
| Diffusion Policy (Cheng et al.) | Política por difusion | no disponible | Observaciones visuales y de estado | no disponible | Implementacion en LeRobot y repositorios propios |
| SmolVLA (Hugging Face) | VLA con componente de lenguaje | no disponible en la informacion proporcionada | Vision + lenguaje + estado | no disponible | Hugging Face, via LeRobot |
| Otras politicas ACT de LeRobot | ACT | Variable segun checkpoint | Depende del dataset de entrenamiento | Habitualmente apache-2.0 | Hugging Face |

La comparacion cuantitativa de rendimiento no es posible: este checkpoint no publica tasas de éxito y las alternativas citadas no se han evaluado sobre el mismo dataset ni el mismo robot.

## Limitaciones y advertencias

- Tarea unica y extremadamente especifica: solo se ha entrenado para "coger la esponja y moverla al lado derecho de la mesa". No generaliza a otras tareas ni a otros objetos sin reentrenamiento.
- Hardware fijado: entrenada para un robot `so_follower` con una unica camara frontal. Cambiar de brazo, de camara o de montaje invalida la politica.
- Sensibilidad a condiciones visuales: al depender de una sola vista RGB, cambios de iluminacion, fondo, posicion del objeto o distracciones pueden degradar el comportamiento. La model card no documenta pruebas de robustez.
- Sin resultados de evaluacion publicados: no hay tasa de éxito medida, por lo que no se puede estimar su fiabilidad real en produccion.
- Dataset pequeno: 51 episodios y 22.092 fotogramas son una base limitada, con riesgo de sobreajuste a las trayectorias demostradas.
- Sin comprension de lenguaje: la tarea se pasa como cadena de texto a la CLI, pero el modelo no la interpreta; no hay *grounding* linguistico ni posibilidad de instrucciones en lenguaje natural.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones fisicas incorrectas o inseguras por desviacion de la distribucion de entrenamiento.
- Seguridad fisica: cualquier despliegue en un robot real debe hacerse con limites de par, paradas de emergencia y supervision humana; una politica de imitacion puede generar movimientos no previstos.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Idiomas y sesgos: no aplica en el plano linguistico; en el plano fisico, el modelo hereda los sesgos de las demostraciones (posiciones, velocidades y estrategias concretas de la persona que teleopero).
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido sobre gafas de sol Persol) y no se han utilizado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gracemxli51/act_sponge
- Dataset de entrenamiento: https://huggingface.co/datasets/gracemxli51/sponge_left_to_right
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=gracemxli51/sponge_left_to_right
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
