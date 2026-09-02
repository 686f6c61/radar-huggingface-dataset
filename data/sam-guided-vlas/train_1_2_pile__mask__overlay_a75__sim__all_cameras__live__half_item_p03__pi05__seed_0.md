# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__half_item_p03__pi05__seed_0

## Resumen

El modelo `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__half_item_p03__pi05__seed_0` es un fine-tune del modelo base `lerobot/pi05_base`, correspondiente a π₀.₅ (Pi05), un Vision-Language-Action (VLA) desarrollado por Physical Intelligence. Pi05 evoluciona el modelo π₀ original para lograr generalización a entornos y situaciones nuevas no vistas durante el entrenamiento, y esta implementación concreta se ha adaptado al ecosistema LeRobot de Hugging Face a partir del repositorio open-source OpenPI. El modelo está diseñado para controlar un robot Franka Panda mediante la combinación de observaciones de estado (vector de 9 dimensiones) y tres cámaras (imágenes RGB de 224×224), produciendo acciones de 7 grados de libertad.

Se trata de un modelo de robótica especializado, no un LLM genérico, con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamaño de repositorio de 28,1 GB en formato safetensors. Ha sido entrenado sobre un dataset de simulación con 200 episodios y 69.392 fotogramas a 20 FPS, abarcando 20 tareas de manipulación como apilar objetos, recoger alimentos o manejar utensilios de cocina. Su relevancia radica en ser una implementación accesible de un modelo VLA de última generación, publicada bajo licencia Apache-2.0, lo que permite su uso comercial y su integración en proyectos de investigación y desarrollo robótico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action transformer (basado en Pi05 de Physical Intelligence) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto de forma independiente) |
| Tipos de cuantizacion | no disponible (se distribuye en precisión original safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea se manejan como etiquetas discretas, no se especifica idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi05 es un modelo Vision-Language-Action que combina un codificador visual, un módulo de lenguaje y un decodificador de acciones para convertir observaciones perceptivas (imágenes y estado del robot) en comandos motores. La implementación en LeRobot se basa en el repositorio OpenPI de Physical Intelligence y hereda la arquitectura del modelo base `lerobot/pi05_base`. Este modelo concreto ha sido fine-tuneado sobre el dataset `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__half_item_p03`, que contiene 200 episodios de simulación con 69.392 fotogramas a 20 FPS, cubriendo 20 tareas de manipulación (basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone). El entrenamiento se realizó durante 45.000 pasos con un batch size de 16, optimizador AdamW y una tasa de aprendizaje de 5e-05, con semilla 0 y la versión 0.6.0 de LeRobot. No se mencionan técnicas adicionales como RLHF o DPO; se trata de un fine-tune supervisado de imitación.

## Capacidades

- Control de robot manipulador: genera acciones de 7 grados de libertad (posición y orientación del efector final) a partir de observaciones de estado (9 dimensiones) y tres cámaras RGB.
- Manipulación de objetos variados: entrenado en tareas de apilado, recogida y colocación de objetos domésticos y alimentos (basket, cake, can, jar, etc.).
- Generalización a entornos nuevos: el modelo base Pi05 está diseñado para adaptarse a situaciones no vistas durante el entrenamiento, gracias a la arquitectura VLA.
- Procesamiento multimodal: integra imágenes de tres cámaras (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2) y estado propioceptivo del robot.
- Ejecución en tiempo real: diseñado para inferencia a 20 FPS, compatible con el flujo de trabajo de LeRobot para control de robots en bucle cerrado.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue de políticas robóticas.

## Casos de uso

- Automatización de picking y placement en entornos logísticos: el modelo puede controlar un robot Panda para recoger objetos de una caja y colocarlos en posiciones definidas, gracias a su entrenamiento en tareas de apilado y manipulación de objetos variados.
- Manipulación de alimentos en cocinas robóticas: capaz de manejar elementos como cajas de comida, pasteles, latas o verduras, lo que permite su uso en sistemas de preparación de comidas automatizados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning sobre nuevos datasets, ya que se distribuye con el código de entrenamiento de LeRobot y una licencia permisiva.
- Desarrollo de asistentes robóticos domésticos: el conjunto de tareas (objetos de cocina, utensilios) lo hace adecuado para prototipos de robots que asisten en tareas del hogar.
- Benchmarking de políticas VLA: al ser un modelo público con pesos safetensors, permite comparar el rendimiento de diferentes arquitecturas de control robótico bajo las mismas condiciones.
- Educación y formación en robótica: su integración con LeRobot y la disponibilidad de documentación facilitan su uso en cursos universitarios para enseñar aprendizaje por refuerzo e imitación en robots reales o simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, en precisión FP16/BF16 se requieren aproximadamente 8,3 GB de VRAM solo para los pesos, más memoria para activaciones e imágenes. Se estima un mínimo de 16 GB de VRAM para inferencia en tiempo real con tres cámaras.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior es adecuada para ejecutar el modelo con margen. Para despliegues más exigentes, se recomienda una A100 (40/80 GB) o H100.
- Compatibilidad con GPUs de consumo: sí, una RTX 4080 o 4090 pueden ejecutar el modelo, aunque la latencia dependerá de la optimización. No se recomienda para GPUs con menos de 16 GB.
- Opciones de despliegue: el modelo se integra con LeRobot, que utiliza PyTorch como backend. Se puede ejecutar mediante los comandos `lerobot-rollout` y `lerobot-train`. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia genéricos, ya que es un modelo de robótica con entradas multimodales específicas.
- Latencia y throughput: no se proporcionan datos concretos, pero al estar diseñado para 20 FPS en el dataset, se espera que la inferencia sea compatible con control en tiempo real en hardware adecuado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Pi05 fine-tune) | 4,14 B | no disponible | Control robótico VLA | Apache-2.0 | Hugging Face (safetensors) |
| OpenVLA | 7 B | no disponible | Control robótico VLA | MIT | Hugging Face (PyTorch) |
| RT-2 (Google) | 55 B | no disponible | Control robótico VLA | propietaria | no público |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se basa en características generales: OpenVLA es un modelo más grande (7B) con licencia MIT, mientras que RT-2 es propietario y no accesible públicamente. Este modelo destaca por su tamaño reducido (4,14 B) y licencia Apache-2.0, lo que facilita su uso en entornos comerciales y académicos.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real; el rendimiento reportado es solo de entrenamiento en simulación, por lo que el comportamiento en el mundo real puede variar.
- El modelo se entrenó con un dataset limitado (200 episodios) y tareas específicas de manipulación; no está probado en otras tareas o entornos distintos a los del dataset.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir acciones incoherentes o inseguras si las observaciones están fuera de distribución.
- Dependencia del hardware: requiere una GPU con al menos 16 GB de VRAM para inferencia en tiempo real, lo que puede limitar su despliegue en sistemas embebidos.
- No se especifican idiomas para instrucciones; el modelo usa etiquetas de tarea discretas, por lo que no es adecuado para comandos de lenguaje natural complejos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base `lerobot/pi05_base` y las dependencias de OpenPI para asegurar el cumplimiento.
- El dataset de entrenamiento contiene objetos y escenarios simulados; la transferencia a robots físicos requiere calibración y pruebas adicionales.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__half_item_p03__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__half_item_p03
- Blog de Physical Intelligence sobre Pi05: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Guía general de LeRobot: https://huggingface.co/docs/lerobot/index
