# K-vr/cube_stack3_Pi05_abs_batch8_dagger

## Resumen

`K-vr/cube_stack3_Pi05_abs_batch8_dagger` es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario K-vr en Hugging Face. Se trata de un fine-tune de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence, orientado a la generalización en entornos abiertos. El checkpoint contiene 4.143.404.816 parámetros (≈4,14 mil millones) en formato safetensors, con un repositorio de 9,4 GB, y está especializado en una única tarea de manipulación bimanual: apilar tres cubos de 40 mm, 30 mm y 20 mm en orden de tamaño.

El modelo resuelve el problema clásico del aprendizaje por imitación aplicado a un robot concreto: partiendo de un modelo fundacional preentrenado, se ha ajustado con 142 episodios (69.929 fotogramas a 30 FPS) recogidos sobre un robot `bi_so_follower_7dof` con cuatro cámaras. La relevancia de esta ficha es doble: por un lado, documenta un ejemplo completo de fine-tuning de π₀.₅ con LeRobot 0.6.1 y licencia Apache-2.0, lo que facilita la reproducibilidad; por otro, advierte de que se trata de un artefacto sin evaluación publicada, sin descargas y sin validación de la comunidad, por lo que no debe confundirse con un modelo listo para producción.

La política consume tres imágenes RGB de 224×224 píxeles y un vector de estado de 32 dimensiones, y emite un vector de acción de 14 dimensiones (dos brazos de 7 grados de libertad) en representación absoluta. No se documenta en la model card ni la arquitectura interna detallada, ni la composición exacta del preentrenamiento del modelo base, ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de π₀.₅; detalles internos de capas no disponibles en la model card |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), según metadatos de safetensors |
| Parametros activos | no aplica: no se documenta una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible; por paso de inferencia procesa 3 imágenes de 224×224 y un vector de estado de 32 dimensiones |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors (9,4 GB) |
| Idiomas soportados | no disponible; la entrada incluye un prompt de tarea en texto (inglés en los ejemplos de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, librería `lerobot` |
| Modelo base | `lerobot/pi05_base` (fine-tune) |
| Tipo de robot | `bi_so_follower_7dof` (bimanual, 7 grados de libertad por brazo) |
| Entradas | `observation.images.base_0_rgb` (3,224,224), `observation.images.left_wrist_0_rgb` (3,224,224), `observation.images.right_wrist_0_rgb` (3,224,224), `observation.state` (32,) |
| Salidas | `action` (14,) |
| Dataset de entrenamiento | `K-vr/cube_stack3_Pi05_abs_batch8_combined`: 142 episodios, 69.929 fotogramas a 30 FPS |
| Pasos de entrenamiento | 20.000 con batch size 8 |

## Arquitectura y entrenamiento

La model card identifica el modelo como π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento, y evoluciona el π₀ original. La implementación empleada procede del repositorio open source OpenPI de Physical Intelligence y ha sido adaptada a LeRobot. Más allá de esa descripción, la model card no detalla la composición de capas, el número de tokens de entrenamiento del preentrenamiento, ni el mecanismo de generación de acciones (no se confirma en la información disponible si usa flow matching, decodificación autorregresiva u otra estrategia). Todo ello debe considerarse no disponible.

El ajuste fino se realizó con LeRobot 0.6.1 sobre el dataset `cube_stack3_Pi05_abs_batch8_combined`, con 20.000 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-05, semilla 1000, representación de acción absoluta, sin ponderación de muestras y con aumento de imagen desactivado. Esto supone aproximadamente 160.000 muestras procesadas (derivado de 20.000 × 8), equivalente a unas 2,3 pasadas sobre los 69.929 fotogramas del dataset. No se documenta ningún proceso de RLHF, DPO o refinamiento por preferencias: el procedimiento es aprendizaje por imitación a partir de demostraciones. El sufijo "dagger" del nombre del repositorio sugiere una posible agregación iterativa de datos al estilo DAgger, pero la model card no describe ningún procedimiento de ese tipo, por lo que no puede confirmarse.

## Capacidades

- Generación de acciones motoras continuas de 14 dimensiones para un robot bimanual de 7 grados de libertad por brazo, en representación absoluta (no incremental).
- Percepción visual multi-cámara: tres entradas RGB de 224×224 píxeles (cámara base, muñeca izquierda y muñeca derecha).
- Fusión de estado propioceptivo: vector de estado de 32 dimensiones como entrada adicional.
- Comprensión de instrucciones de tarea en lenguaje natural; los ejemplos documentados están en inglés ("Stack the three cubes with the 40 mm cube on the bottom...").
- Ejecución de una tarea concreta de manipulación: apilado de tres cubos de 40 mm, 30 mm y 20 mm en orden descendente de tamaño.
- Control en bucle cerrado a 30 FPS, coherente con la frecuencia de captura del dataset de entrenamiento.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso explícito ni capacidades multilingües.
- No se documentan capacidades de audio, vídeo de larga duración ni generación de texto.

## Casos de uso

- Apilado automatizado de cubos en laboratorio: la política ejecuta directamente la tarea de stacking descrita en la model card sobre un robot `bi_so_follower_7dof`, con las cuatro cámaras y el prompt de tarea indicados, sin necesidad de programación explícita de trayectorias.
- Punto de partida para fine-tuning con datos propios: sirve como ejemplo reproducible de ajuste de `lerobot/pi05_base` con LeRobot 0.6.1 (20.000 pasos, AdamW, lr 2,5e-05), replicable con el comando `lerobot-train` documentado.
- Referencia metodológica en investigación sobre aprendizaje por imitación: permite estudiar el efecto de decisiones concretas de entrenamiento (acción absoluta frente a relativa, aumento de imagen desactivado, semilla fija) sobre el éxito de la tarea.
- Evaluación de robustez y baselines comparables: al ser un fine-tune acotado de un modelo fundacional, es un candidato natural para medir la degradación ante cambios de iluminación, posición inicial o disposición de los cubos.
- Iteración de políticas al estilo DAgger: los rollouts con `lerobot-rollout --strategy.type=base` permiten grabar nuevas ejecuciones y ampliar el dataset para una siguiente ronda de entrenamiento, aunque el procedimiento no esté documentado en la model card.
- Demostración reproducible en docencia o divulgación: el repositorio incluye el comando exacto de despliegue, lo que facilita montar una demo de VLA robótico de 4,14 mil millones de parámetros con hardware accesible.
- Validación de pipelines de LeRobot: útil como caso de prueba de extremo a extremo (instalación, calibración, grabación, entrenamiento, rollout) dentro del ecosistema LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla vacía (tabla de tareas, intentos, éxitos y tasa de éxito) y el aviso de que debe rellenarse con resultados reales de robot; no contiene ninguna cifra. Tampoco se dispone de métricas de MMLU, HumanEval, GSM8K ni equivalentes, que por otra parte no aplican a una política de control motor. El blog de Physical Intelligence sobre π₀.₅ publica resultados generales del modelo base, pero no se han reproducido ni verificado en esta ficha.

## Requisitos de hardware

- Peso de los pesos en precisión completa: 4.143.404.816 parámetros × 4 bytes ≈ 16,6 GB. En bf16/fp16: ≈8,3 GB, coherente con el tamaño de repositorio de 9,4 GB.
- VRAM estimada para inferencia: al menos 10-12 GB en bf16 contando pesos y activaciones de las tres cámaras; 16 GB es un margen cómodo. En fp32 serían necesarios más de 20 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia holgada; RTX 3090 (24 GB) y RTX 4080 (16 GB) son viables en bf16.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM (RTX 4080/4090/3090, RTX 4060 Ti 16 GB con margen ajustado). No se documentan requisitos oficiales.
- Opciones de despliegue: el método documentado es `lerobot-rollout` con `--strategy.type=base` y `--policy.path=K-vr/cube_stack3_Pi05_abs_batch8_dagger`. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni ONNX/TensorRT, y no serían directamente aplicables a una política de control robótico sin trabajo adicional.
- Requisitos adicionales: el despliegue exige el robot `bi_so_follower_7dof` calibrado, cuatro cámaras a 640×480 y 30 FPS configuradas por índice o ruta, y nombres de cámara que coincidan con las claves de observación del entrenamiento.
- Latencia y throughput: no disponibles. La frecuencia del dataset (30 FPS) marca el orden de magnitud del bucle de control esperado, pero no se publica ninguna medición de latencia por paso ni de acciones por segundo en inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas/salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `K-vr/cube_stack3_Pi05_abs_batch8_dagger` | VLA (π₀.₅ ajustado) para apilado de cubos | 4.143.404.816 | 3 imágenes 224×224 + estado (32,) → acción (14,) | Apache-2.0 | Repositorio público; 0 descargas, 0 likes; sin evaluación publicada |
| `lerobot/pi05_base` | VLA base π₀.₅ para generalización en entornos abiertos | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Modelo base público; pesos y documentación accesibles |
| `lerobot/smolvla_base` | VLA compacto integrado en LeRobot | no disponible en esta ficha (la documentación del proyecto lo sitúa en el orden de cientos de millones de parámetros) | no disponible en esta ficha | no disponible en esta ficha | Modelo base público dentro del ecosistema LeRobot |
| Cualquier otra política entrenada con LeRobot para la misma tarea | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas comparables en la búsqueda web realizada |

La búsqueda web asociada a este repositorio no devolvió resultados relevantes: los enlaces recuperados corresponden a la letra K y a la línea K del Transilien, sin relación con el modelo. Por tanto, la comparativa con alternativas de la misma categoría queda limitada a los modelos citados, sin datos verificables de rendimiento para ninguno de ellos.

## Limitaciones y advertencias

- Especialización extrema: el modelo ha sido entrenado para una única tarea (apilar tres cubos de 40/30/20 mm) con 142 episodios y 69.929 fotogramas, sobre un único montaje de robot y cámara. Fuera de ese contexto, el comportamiento no está caracterizado.
- Ausencia de evaluación: la model card contiene la plantilla de evaluación vacía. No hay tasa de éxito publicada en robot real, por lo que se desconoce el rendimiento efectivo incluso en la tarea objetivo.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; ninguna evidencia externa de que la política funcione.
- Inconsistencia en los nombres de cámara: el campo "Cameras" de la model card lista `left_cam_left`, `left_cam_scene`, `right_cam_right` y `right_cam_scene`, mientras que las claves de observación son `observation.images.base_0_rgb`, `left_wrist_0_rgb` y `right_wrist_0_rgb`. Como el propio autor indica que los nombres de cámara deben coincidir con las claves de observación, esta discrepancia es un riesgo real de fallo en el despliegue y debe verificarse antes de ejecutar `lerobot-rollout`.
- Riesgo de alucinación traducido a acciones físicas: en una política VLA, los errores no se manifiestan como texto incorrecto sino como movimientos erróneos o potencialmente inseguros del robot. Se recomienda limitar velocidades, definir zonas de trabajo y mantener parada de emergencia accesible.
- Dependencia de calibración y del montaje: al usar representación de acción absoluta, las acciones están atadas al sistema de coordenadas del robot concreto; transferir la política a otro robot o a otra disposición de cámaras requiere recalibración y probablemente reentrenamiento.
- Desfase de dominio visual: el aumento de imagen se desactivó durante el entrenamiento, lo que puede reducir la robustez ante cambios de iluminación, fondo u oclusiones respecto al entorno de grabación.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto; solo se conocen los prompts de tarea en inglés incluidos en la model card. No hay evidencia de que el modelo responda correctamente a instrucciones parafraseadas o en castellano.
- Procedencia de datos no verificada más allá de la comprobación de coincidencia de nombre de carpeta del dataset; no se documenta la diversidad de operadores, condiciones de iluminación ni distribución de posiciones iniciales.
- Licencia: los pesos de este fine-tune se publican bajo Apache-2.0, lo que en principio permite uso comercial. No obstante, no se ha confirmado en la información disponible la licencia de `lerobot/pi05_base`, de la que deriva, ni las condiciones de uso de la implementación de OpenPI. Conviene verificar la cadena completa de licencias antes de un uso comercial.
- Nombre potencialmente engañoso: el sufijo "dagger" no va acompañado de ninguna descripción de un procedimiento DAgger en la model card.
- Metadatos anómalos: las fechas de creación y actualización registradas son 2026-09-30, lo que puede indicar un error en los metadatos del repositorio.
- Sin resultados de benchmarks: no es posible comparar su rendimiento con π₀.₅ base u otras políticas de LeRobot con datos objetivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-vr/cube_stack3_Pi05_abs_batch8_dagger
- Dataset de entrenamiento: https://huggingface.co/datasets/K-vr/cube_stack3_Pi05_abs_batch8_combined
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=K-vr/cube_stack3_Pi05_abs_batch8_combined
- Búsqueda web realizada: no devolvió resultados relevantes sobre el modelo (los resultados obtenidos versan sobre la letra K y la línea K del Transilien).
