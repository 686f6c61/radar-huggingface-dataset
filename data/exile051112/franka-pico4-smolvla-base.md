# Exile051112/franka-pico4-smolvla-base

## Resumen

El repositorio `Exile051112/franka-pico4-smolvla-base` contiene los pesos base compartidos de una política SmolVLA (Vision-Language-Action) diseñada para el brazo robótico Franka Pico4. Desarrollado por el usuario Exile051112, este modelo actúa como un componente modular: incluye las primeras 16 capas de texto de SmolVLM, el encoder de visión completo con su conector, y el experto de acción con sus proyecciones. No es un checkpoint SmolVLM completo, sino una base pensada para ser combinada con adaptadores LoRA específicos de tarea.

El modelo tiene 450.046.176 parámetros (aproximadamente 450M) y un tamaño de repositorio de 0,9 GB en formato safetensors. Su relevancia radica en que permite el fine-tuning eficiente mediante LoRA para tareas de manipulación robótica, siguiendo el enfoque de SmolVLA que requiere solo unas 50 demostraciones por tarea. La configuración de la arquitectura y el tokenizador se resuelven desde un repositorio de metadatos separado, y la carga se realiza a través del framework LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción) con 16 capas de texto SmolVLM, encoder de visión completo y proyecciones de acción |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, que combina un encoder de visión, un modelo de lenguaje (basado en SmolVLM) y un experto de acción que produce comandos de control para el robot. En este caso concreto, se utilizan las primeras 16 capas de texto de SmolVLM, el encoder de visión completo y el conector, más el experto de acción y sus proyecciones. Es un diseño modular: el archivo `model.safetensors` contiene todos los pesos necesarios para esta configuración de 16 capas, pero no es un checkpoint SmolVLM de profundidad total.

No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La model card indica que es un modelo base que requiere fine-tuning con LoRA para tareas específicas, recomendando aproximadamente 50 episodios de demostración como punto de partida. El entrenamiento se realiza con el entorno LeRobot y PEFT, y la carga se hace mediante `load_vlm_weights=false` para evitar descargar el archivo completo de SmolVLM de 2 GB.

## Capacidades

- Control robótico: genera acciones de control para el brazo Franka Pico4 a partir de observaciones visuales e instrucciones en lenguaje natural.
- Visión-lenguaje: procesa imágenes y texto para entender la escena y la tarea solicitada.
- Fine-tuning con LoRA: se adapta a tareas específicas con pocos datos (alrededor de 50 episodios), gracias a su diseño modular con adaptadores.
- Integración con LeRobot: se carga y ejecuta mediante el framework LeRobot, lo que facilita la grabación de datasets y el despliegue de políticas.
- Arquitectura ligera: con 450M parámetros, es adecuado para entornos con recursos computacionales limitados.

## Casos de uso

- Manipulación pick-and-place: el modelo puede aprender a recoger y colocar objetos en posiciones específicas, usando las observaciones de cámara y las instrucciones de tarea.
- Aprendizaje por imitación: se pueden grabar demostraciones humanas con el brazo Franka Pico4 y fine-tuning del modelo base para replicar la política.
- Control de brazo en entornos de investigación: ideal para laboratorios que estudian aprendizaje robótico con VLA, gracias a su tamaño reducido y compatibilidad con LeRobot.
- Desarrollo de políticas multi-tarea: al ser una base compartida, se pueden entrenar varios adaptadores LoRA para distintas tareas y conmutar entre ellos sin recargar el modelo completo.
- Prototipado rápido de tareas robóticas: con solo 50 episodios de datos, se puede obtener una política funcional para una tarea nueva, acelerando la experimentación.
- Evaluación de arquitecturas VLA en hardware real: permite comparar el rendimiento de SmolVLA con otros enfoques en el mismo brazo robótico, gracias a su naturaleza modular y de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero con 450M parámetros y 0,9 GB de pesos en FP32, es probable que quepa en GPUs consumer con al menos 4 GB de VRAM.
- GPU recomendadas: no disponible; se espera compatibilidad con GPUs NVIDIA modernas (serie RTX 20xx o superior) y posiblemente con Apple Silicon.
- Si cabe en consumer GPU: sí, por tamaño, aunque no se especifica la memoria exacta necesaria.
- Opciones de despliegue: LeRobot (framework principal), PEFT para fine-tuning; no se mencionan vLLM, llama.cpp u otros.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos. SmolVLA es una familia de modelos VLA de tamaño reducido, pero no hay datos de rendimiento publicados para este checkpoint concreto. Se recomienda consultar la documentación de SmolVLA en el repositorio de LeRobot para conocer el contexto general.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere fine-tuning con LoRA para cada tarea específica; no funciona out-of-the-box.
- Dependencia de metadatos externos: la arquitectura y el tokenizador se resuelven desde `Exile051112/franka-pico4-smolvlm2-metadata`, que debe estar disponible.
- Entorno de ejecución específico: se necesita el mismo entorno LeRobot/PEFT usado durante el entrenamiento para el despliegue.
- Licencia no especificada: no se indica si el uso comercial está permitido; se debe contactar al autor antes de usar en producción.
- Sin datos de sesgos o alucinación: al ser un modelo de control robótico, los riesgos de alucinación son menos relevantes que en modelos de texto, pero no se han evaluado.
- Fecha de creación futura (2026-08-28): el modelo está marcado con una fecha posterior a la actual, lo que sugiere que puede ser un proyecto experimental o con metadatos incorrectos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Exile051112/franka-pico4-smolvla-base
- Documentación de SmolVLA en LeRobot: https://github.com/hurobomaster/Franka_lerobot/blob/main/docs/source/smolvla.mdx
