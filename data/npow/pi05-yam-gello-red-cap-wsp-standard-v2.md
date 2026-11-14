# npow/pi05-yam-gello-red-cap-wsp-standard-v2

## Resumen

El modelo `npow/pi05-yam-gello-red-cap-wsp-standard-v2` es un checkpoint de robótica derivado de `lerobot/pi05_base` (PI0.5, la política visión-lenguaje-acción de Physical Intelligence difundida a través de LeRobot). Lo publica el usuario npow y resuelve una tarea concreta de manipulación: coger una tapa roja y colocarla sobre una caja negra con un brazo robótico YAM. A diferencia de un fine-tuning convencional, el autor aplica una técnica que denomina *weight-space programming* (WSP): compone pesos ya entrenados de otros modelos para orientar el comportamiento sin retropropagación.

El modelo tiene 4.143.404.816 parámetros y un repo de 23,2 GB. La inferencia usa el sampler gaussiano original de PI0.5 con 10 pasos de Euler y pesos fijos. La entrada son tres cámaras RGB más un vector de estado de 14 valores; la salida es un chunk de 50 acciones de dimensión 14 (seis articulaciones por brazo más dos pinzas absolutas).

Es relevante ahora por su enfoque metodológico: demuestra que se pueden editar pesos de una política VLA para especializarla en una tarea sin entrenamiento por gradientes, con auditoría de qué tensores cambian. El propio autor advierte que la puerta de aceptación completa no se cumple y que no se ha probado en hardware real, por lo que debe tratarse como un experimento de investigación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PI0.5 (visión-lenguaje-acción, transformer con experto de acción y flujo de difusión; detalles internos no disponibles) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor reporta evaluación en float32) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (LeRobot) y Orbax bajo `params/` (OpenPI nativo) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura PI0.5 de `lerobot/pi05_base`: una política que combina un backbone de visión-lenguaje con un experto de acción que genera trayectorias mediante un proceso de difusión (sampler gaussiano, 10 pasos de Euler en float32). El checkpoint libera los pesos fusionados completos, cargables con la API estándar de LeRobot o con OpenPI nativo.

El entrenamiento no usa gradientes ni optimizador. El autor construye un "programa de pesos" que compone tensores de tres modelos: `lerobot/pi05_base` (red base), `DAVIAN-Robotics/pi05-robocasa-H50` (pesos de visión y filas de normalización del experto) y `TrossenRoboticsCommunity/pi05-block-transfer-lerobot` (proyecciones de acción y actualización de la proyección de tiempo de denoising; su layout de 14 valores coincide con los 12 deltas de brazo y dos pinzas absolutas de YAM). Respecto a la v1, la edición adicional toca seis tensores de proyección y una fila de embedding, unos 1,12 millones de valores activos, verificados por `parameter_update_audit.json`. Las demostraciones de YAM solo aportan estadísticas de normalización y puntuaciones para seleccionar programas; no se usó el checkpoint fine-tuned de YAM.

## Capacidades

- Generación de trayectorias de acción robótica para el brazo YAM en la tarea de coger la tapa roja y colocarla en la caja negra.
- Procesamiento multimodal de entrada: tres cámaras RGB (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) más estado de 14 valores.
- Salida de chunks de 50 acciones de dimensión 14 (deltas de brazo en radianes y pinzas absolutas), con ejecución de 10 acciones antes de replanificar.
- Condicionamiento por instrucción de lenguaje fija: `Pick up the red cap and place it on the black box.`
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión general, audio): no disponible.

## Casos de uso

- Investigación en edición de pesos: usar el modelo como referencia reproducible para estudiar *weight-space programming* sobre políticas VLA, comparando `weight_edit_program.json` y `parameter_update_audit.json` con la v1 y con la base.
- Benchmark de manipulación en simulador: evaluar la reducción de error de acción (MSE normalizado) frente a `pi05_base` y frente a una política de "mantener posición" en las mismas 20 episodios y semillas.
- Prototipado de pipelines LeRobot: integrar el checkpoint con `PI05Policy.from_pretrained()` y `make_pre_post_processors()` para validar el contrato de entrada (tres cámaras CHW en [0,1] y estado de 14 valores) antes de escalar a otras tareas.
- Estudio de transferencia entre tareas: analizar cómo pesos de un modelo de RoboCasa y otro de transferencia de bloques (Trossen) contribuyen a una tarea distinta, aislando el efecto de las proyecciones de acción y del embedding editado.
- Reproducibilidad de inferencia: verificar la paridad de los 813 tensores del state-dict y las predicciones con semilla fija mediante `export_verification.json`.
- Docencia y divulgación: ilustrar con un caso concreto y auditado cómo se especializa una política fundacional sin reentrenamiento, incluyendo las limitaciones metodológicas declaradas por el autor.

## Benchmarks y rendimiento

Evaluación del autor en 20 episodios fijos, cuatro anclas por episodio y tres semillas de sampler, con OpenPI nativo, float32 y máxima precisión de matmul. Errores como MSE normalizado sobre brazo izquierdo activo y pinza.

| Modelo | Error primeras 10 acciones ↓ | Error 50 acciones ↓ | Balanced accuracy pinza primeras 10 ↑ |
|---|---:|---:|---:|
| PI05 base | 0,05866 | 0,24176 | 90,49 % |
| WSP v1 | 0,02922 | 0,18509 | 91,54 % |
| **WSP v2** | **0,02652** | **0,17942** | **92,11 %** |
| Mantener posición | 0,02749 | 0,22065 | 91,26 % |

El programa reduce el error de las primeras 10 acciones un 54,8 % frente a la base y un 3,5 % frente a mantener posición; el error de 50 acciones queda un 25,8 % por debajo de la base y un 18,7 % por debajo de mantener posición. Mejora sobre la base en 19 de 20 episodios; el intervalo bootstrap pareado al 95 % para la reducción frente a la base es 38,7–68,7 %. El autor señala que el margen exigido era del 5 % frente a mantener posición y que el 3,5 % medido no cumple la puerta de aceptación completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 4.143 millones de parámetros, en float32 los pesos ocupan aproximadamente 16,6 GB, a los que hay que sumar activaciones y buffers del sampler.
- GPU recomendadas: no disponible; el autor solo especifica float32 y máxima precisión de matmul, lo que descarta en la práctica configuraciones de baja precisión para reproducir sus métricas.
- Cabe en GPU de consumo: no confirmado; por tamaño de pesos en float32, una GPU de 24 GB queda muy justa y no hay datos de cuantización publicados.
- Opciones de despliegue: LeRobot 0.4.4 (verificado con el commit `8fff0fde7c79f23a93d845d1a50e985de01f8b8a`) y OpenPI nativo vía Orchestral (`orchestral models inspect openpi ...`). vLLM, llama.cpp, Ollama y TGI no están soportados para este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (error primeras 10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `npow/pi05-yam-gello-red-cap-wsp-standard-v2` | 4.143 M | no disponible | 0,02652 | gemma | Hugging Face (0 descargas) |
| `lerobot/pi05_base` | no disponible | no disponible | 0,05866 | no disponible | Hugging Face |
| `DAVIAN-Robotics/pi05-robocasa-H50` | no disponible | no disponible | no disponible | Apache-2.0 (según el autor) | Hugging Face |
| `TrossenRoboticsCommunity/pi05-block-transfer-lerobot` | no disponible | no disponible | no disponible | Apache-2.0 (según el autor) | Hugging Face |

## Limitaciones y advertencias

- La puerta de aceptación completa no se cumple: el margen exigido era un 5 % de mejora en las primeras 10 acciones frente a mantener posición y se midió un 3,5 %.
- Las métricas de error de acción no demuestran finalización de la tarea; el autor lo indica explícitamente.
- No se ha probado en hardware robótico real; la mecánica del simulador sigue en calibración.
- El dataset de evaluación (`npow/yam-gello-red-cap-100`) tiene exposición previa del proyecto, lo que puede introducir sesgo de selección.
- El modelo está especializado en una única tarea y una instrucción fija en inglés; no hay evidencia de generalización a otras instrucciones, objetos o morfologías.
- Licencia `gemma`: conviene revisar los términos de uso comercial de Gemma antes de cualquier despliegue productivo, dado que los pesos derivan de la base con esa licencia.
- Riesgo de alucinación en el sentido de acciones no válidas o trayectorias fuera de distribución: no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.
- La evaluación reportada es de OpenPI nativo, no de paridad de predicción entre frameworks; el autor lo aclara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/npow/pi05-yam-gello-red-cap-wsp-standard-v2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Modelo fuente de visión y normalización: https://huggingface.co/DAVIAN-Robotics/pi05-robocasa-H50
- Modelo fuente de proyecciones de acción: https://huggingface.co/TrossenRoboticsCommunity/pi05-block-transfer-lerobot
- Dataset de evaluación: https://huggingface.co/datasets/npow/yam-gello-red-cap-100
- LeRobot: https://github.com/huggingface/lerobot
- OpenPI: https://github.com/Physical-Intelligence/openpi
