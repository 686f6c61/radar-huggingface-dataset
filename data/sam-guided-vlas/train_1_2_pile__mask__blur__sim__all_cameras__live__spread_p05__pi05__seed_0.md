# sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__spread_p05__pi05__seed_0

## Resumen

Este modelo es un fine-tuning de π₀.5 (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para generalización en robótica de mundo abierto. La implementación en LeRobot está adaptada del repositorio open-source OpenPI. El modelo ha sido entrenado por el usuario sam-guided-vlas sobre el modelo base `lerobot/pi05_base` para tareas de manipulación robótica con un brazo Panda.

El modelo procesa observaciones multimodales (estado del robot y tres cámaras RGB) y genera acciones de control de 7 grados de libertad. Está entrenado sobre un dataset de 200 episodios con 69.392 frames a 20 FPS, cubriendo 20 tareas de manipulación de objetos cotidianos. Con 4.143 millones de parámetros, representa una aproximación práctica al aprendizaje por imitación para robótica, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.5 |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.5 es un modelo Vision-Language-Action que extiende π₀ para generalizar a entornos y situaciones no vistas durante el entrenamiento. La arquitectura combina procesamiento visual de multiples camaras con el estado del robot para producir acciones de control continuo. La implementacion en LeRobot se adapta del repositorio OpenPI de Physical Intelligence.

El entrenamiento se realizo mediante fine-tuning del modelo base `lerobot/pi05_base` sobre un dataset de demostraciones de 200 episodios (69.392 frames a 20 FPS) que cubre 20 tareas de manipulacion de objetos cotidianos (alimentos, utensilios de cocina, objetos de despensa). La configuracion de entrenamiento incluye 45.000 pasos, batch size de 16, optimizador AdamW con learning rate de 5e-05 y semilla 0. Se utilizo LeRobot version 0.6.0. El dataset incluye aumentos como mask, blur y spread p05, con captura de camaras en simulacion.

## Capacidades

- Control robotico de 7 grados de libertad (accion de 7 dimensiones) para manipulacion de objetos.
- Percepcion multimodal con tres camaras RGB (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2) a resolucion 224x224.
- Procesamiento de estado del robot de 9 dimensiones.
- Aprendizaje por imitacion de 20 tareas de manipulacion: basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone.
- Generalizacion a entornos nuevos gracias a la arquitectura π₀.5 de Physical Intelligence.
- Integracion completa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.

## Casos de uso

- Manipulacion de objetos en robotica asistencial: el modelo puede ejecutar tareas de recogida y colocacion de objetos cotidianos (alimentos, utensilios) en entornos de cocina o despensa, gracias a su entrenamiento sobre 20 categorias de objetos con tres vistas de camara.
- Automatizacion de picking en almacenes: con su capacidad de procesar multiples camaras y generar acciones de 7 DOF, puede integrarse en brazos roboticos Panda para tareas de clasificacion y apilado de productos empaquetados.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para experimentos de fine-tuning sobre nuevos datasets, ya que el entrenamiento con LeRobot esta documentado y reproducible.
- Desarrollo de politicas roboticas para entornos simulados: el dataset de entrenamiento proviene de simulacion, por lo que el modelo es adecuado para validar algoritmos en entornos virtuales antes del despliegue fisico.
- Benchmarking de modelos VLA: al estar disponible en HuggingFace con pesos safetensors y licencia Apache 2.0, permite comparar rendimiento con otros modelos de robotica del ecosistema LeRobot.
- Educacion y formacion en robotica: el modelo puede usarse en cursos de robotica y aprendizaje automatico para demostrar el flujo completo de entrenamiento y despliegue de politicas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4.143 millones de parametros, se estima aproximadamente 16 GB en FP32, 8 GB en FP16/BF16 y 4 GB en INT8, aunque no se han publicado cifras oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamano de modelo, una GPU con al menos 8-12 GB de VRAM (RTX 3080/4080, A100, H100) seria adecuada para FP16.
- Compatibilidad con GPU de consumo: probablemente si en cuantizaciones reducidas, aunque no hay datos oficiales.
- Opciones de despliegue: LeRobot (framework principal), con soporte para rollout en robot Panda via `lerobot-rollout`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (fine-tuning pi05) | 4.143 M | no disponible | Apache 2.0 | HuggingFace |
| lerobot/pi05_base | no disponible | no disponible | Apache 2.0 | HuggingFace |
| π₀ (Physical Intelligence) | no disponible | no disponible | no disponible | Codigo abierto via OpenPI |

No se dispone de datos comparativos de rendimiento entre estos modelos. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion en robot real, por lo que el rendimiento real en entornos fisicos es desconocido.
- El modelo esta entrenado exclusivamente para robot Panda con tres camaras especificas; su uso con otros robots o configuraciones de camara requiere reentrenamiento.
- Las 20 tareas del dataset estan limitadas a objetos de cocina y despensa; no generaliza a otras categorias sin fine-tuning adicional.
- El dataset de entrenamiento proviene de simulacion, lo que puede generar una brecha de realidad (sim-to-real gap) al desplegar en entornos fisicos.
- El modelo genera acciones de 7 dimensiones; no soporta tareas que requieran mas grados de libertad o manipulacion dual.
- No hay informacion sobre sesgos, pero al ser un modelo de robotica entrenado en simulacion, los sesgos estan relacionados con la distribucion de objetos y entornos del dataset.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de control, pero puede producir acciones suboptimas o inseguras en situaciones fuera de distribucion.
- El nombre del repositorio incluye "sam-guided" y "mask", sugiriendo posible uso de Segment Anything para guiado, pero no hay documentacion detallada al respecto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__spread_p05__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__spread_p05
- Blog de π₀.5: https://www.physicalintelligence.company/blog/pi05
- Documentacion de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
