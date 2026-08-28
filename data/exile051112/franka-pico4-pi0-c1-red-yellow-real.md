# Exile051112/franka-pico4-pi0-c1-red-yellow-real

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base `lerobot/pi0_base` para una tarea de manipulación robótica con un brazo Franka/Pico4, en la condición `c1_red_yellow_real`. El adaptador fue desarrollado por el usuario Exile051112 y publicado en Hugging Face con licencia Gemma. No es un modelo completo, sino un conjunto de pesos ligeros (~5,6 MB) que deben cargarse junto con el modelo base para funcionar.

El modelo base `pi0_base` es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, diseñado para control robótico a partir de observaciones visuales y comandos de lenguaje. Este adaptador LoRA ajusta el modelo base para una tarea específica de recogida y colocación de objetos con colores rojo y amarillo, utilizando dos cámaras RGB (superior y de muñeca) y un espacio de acción de 10 dimensiones (TCP). La relevancia de este adaptador radica en su aplicación práctica en robótica de manipulación, permitiendo a investigadores y desarrolladores desplegar políticas de control en robots Franka sin necesidad de entrenar un modelo desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `lerobot/pi0_base` (modelo VLA) |
| Parametros totales | no disponible (el adaptador pesa ~5,6 MB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adapter_model.safetensors) y configuracion JSON |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `lerobot/pi0_base`, un modelo de visión-lenguaje-acción basado en transformer que procesa imágenes de cámaras y estados del robot para generar acciones de control. El adaptador utiliza LoRA con rango `r=16` y `lora_alpha=16`, lo que reduce significativamente el número de parámetros entrenables en comparación con un ajuste fino completo. El entrenamiento se realizó con PyTorch LeRobot durante 10.000 pasos, con un tamaño de lote de 4 y precisión bfloat16, utilizando gradient checkpointing para optimizar el uso de memoria.

Los datos de entrenamiento corresponden a la condición `c1_red_yellow_real`, que incluye observaciones de dos cámaras RGB (`observation.images.top` y `observation.images.wrist`), un estado del robot de 17 dimensiones y una acción TCP de 10 dimensiones. No se especifica si se utilizaron técnicas de RLHF o DPO; el entrenamiento se basa en aprendizaje por imitación supervisado, típico en LeRobot. La configuración del adaptador apunta al modelo base `lerobot/pi0_base`, que requiere acceso con autenticación en Hugging Face.

## Capacidades

- Control robótico de manipulación: genera acciones TCP (posición y orientación del efector final) a partir de observaciones visuales y del estado del robot.
- Aprendizaje por imitación: el adaptador ha sido entrenado para replicar demostraciones de una tarea específica (recogida y colocación de objetos rojos y amarillos).
- Procesamiento de múltiples flujos de imagen: utiliza dos cámaras RGB (superior y de muñeca) para percibir la escena.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye capacidades de generación de texto, razonamiento general, tool calling ni agentes; su función es exclusivamente el control motor robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: el adaptador sirve como punto de partida para estudiar cómo los modelos VLA se adaptan a tareas específicas con pocos datos, permitiendo comparar el rendimiento de LoRA frente a ajustes finos completos.
- Despliegue de políticas de pick-and-place en robots Franka: el adaptador puede cargarse en un robot Franka/Pico4 para ejecutar tareas de manipulación de objetos de colores rojo y amarillo, siempre que se valide la calibración y los límites de seguridad.
- Desarrollo de sistemas de automatización industrial: en entornos controlados, el adaptador puede integrarse en líneas de producción que requieran clasificación o manipulación de piezas por color.
- Evaluación de generalización en robótica: al ser un adaptador ligero, permite probar rápidamente diferentes condiciones de entrenamiento (cambios de cámara, espacio de acción) sin reentrenar el modelo base.
- Educación y prototipado: estudiantes e investigadores pueden utilizar el adaptador para experimentar con control robótico basado en VLA en laboratorios que dispongan de hardware Franka.
- Benchmarking de adaptadores LoRA: el repositorio puede servir como referencia para comparar el rendimiento de distintos adaptadores sobre `pi0_base` en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación como tasas de éxito, precisión de acciones o comparaciones con otros adaptadores.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM para este adaptador. Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base `lerobot/pi0_base`, que es un modelo VLA de gran tamaño (típicamente requiere una GPU con al menos 24 GB de VRAM para inferencia en bfloat16).
- GPU recomendadas: no disponible. Se sugiere consultar la documentación de `pi0_base` para conocer las GPU compatibles (por ejemplo, A100, RTX 4090).
- No se indica si el adaptador puede ejecutarse en GPUs de consumo; dependerá del modelo base y de la cuantización utilizada.
- Opciones de despliegue: el adaptador está diseñado para cargarse con LeRobot, que soporta PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para `pi0_base` en la información proporcionada. No se pueden establecer comparaciones con otros modelos de la misma categoría sin datos adicionales.

## Limitaciones y advertencias

- El adaptador no es un modelo completo; requiere descargar el modelo base `lerobot/pi0_base`, que está protegido por control de acceso en Hugging Face (gated). Sin acceso al modelo base, el adaptador no puede utilizarse.
- La licencia Gemma puede imponer restricciones de uso comercial; es necesario revisar los términos exactos de la licencia antes de su uso en producción.
- El adaptador está entrenado para una tarea específica (`c1_red_yellow_real`) y puede no generalizar a otras tareas, entornos o configuraciones de cámara.
- La validación de nombres de cámara, orden de estado/acción, calibración y límites de seguridad es obligatoria antes del despliegue en un robot real; un uso incorrecto puede causar daños materiales o personales.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos de los datos (por ejemplo, variaciones de iluminación, posiciones de objetos).
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto, pero puede producir acciones erróneas si las observaciones difieren de las del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; se recomienda una evaluación exhaustiva antes de usarlo en entornos críticos.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Exile051112/franka-pico4-pi0-c1-red-yellow-real
- Modelo base (requiere acceso): https://huggingface.co/lerobot/pi0_base
