# 1ys1/areumii-smolvla-pickplace-v5

## Resumen

El modelo `1ys1/areumii-smolvla-pickplace-v5` es un ajuste fino (fine-tune) de la arquitectura SmolVLA (Vision-Language-Action) desarrollada por Hugging Face, entrenado específicamente para tareas de recogida y colocación (pick-and-place) con el robot de dos brazos `areumii_c1`. El ajuste se realizó sobre el modelo base `lerobot/smolvla_base` utilizando el framework LeRobot, con un dataset propio de 160 episodios y 13 767 fotogramas a 30 FPS. El modelo genera acciones de 16 dimensiones a partir de tres vistas de cámara (frontal, muñeca izquierda y muñeca derecha) y el estado del robot (6 valores), condicionadas por instrucciones en lenguaje natural que indican qué brazo debe realizar la tarea y con qué objeto.

Este modelo es relevante porque demuestra cómo un modelo compacto de 450 millones de parámetros puede ser especializado para control robótico real en tareas de manipulación, manteniendo la eficiencia computacional que caracteriza a SmolVLA y permitiendo su despliegue en hardware de consumo. La licencia Apache 2.0 facilita su uso y modificación en proyectos de investigación y desarrollo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, base `lerobot/smolvla_base`) |
| Parámetros totales | 450 046 176 |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, un modelo compacto de visión-lenguaje-acción que combina una representación visual de múltiples cámaras con el estado del robot y una instrucción textual para generar acciones. La arquitectura interna no está documentada en la ficha disponible; se sabe que se basa en la propuesta de SmolVLA (paper arXiv:2506.01844), pero los detalles específicos de la capa de atención, el número de bloques o el mecanismo de fusión de modalidades no se proporcionan.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) durante 30 000 pasos, con un tamaño de lote de 8, optimizador AdamW con tasa de aprendizaje 0.0001 y semilla 1000. El dataset `1ys1/areumii_pickplace-v5` contiene 160 episodios con dos tareas: "Usa el brazo izquierdo para coger el cubo azul y colocarlo en la cesta azul" y "Usa el brazo derecho para coger el cubo azul y colocarlo en la cesta azul". No se especifica si se aplicaron técnicas como RLHF o DPO; la model card indica únicamente un entrenamiento supervisado de imitación.

## Capacidades

- Generación de acciones de control de 16 dimensiones para el robot `areumii_c1`, combinando información visual de tres cámaras (frontal, muñeca izquierda, muñeca derecha) con el estado propioceptivo del robot (6 valores).
- Comprensión de instrucciones en lenguaje natural para seleccionar el brazo (izquierdo o derecho) y el objeto objetivo (cubo azul) y la acción (coger y colocar en una cesta).
- Especialización en tareas de pick-and-place en un entorno fijo con un único objeto y dos cestas.
- No tiene capacidades de generación de texto, razonamiento general, código, matemáticas ni visión fuera del ámbito robótico.
- No soporta tool calling ni agentes autónomos; es una política de control reactiva entrenada por imitación.
- Multilingüe: no disponible (las instrucciones están en inglés, pero no hay datos sobre otros idiomas).

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un robot de dos brazos para trasladar piezas de una posición a otra, reduciendo la intervención humana en entornos de fabricación repetitivos.
- Logística y almacenamiento: clasificación de objetos en contenedores mediante instrucciones verbales o de texto, como "coge el cubo azul y ponlo en la cesta azul", aplicable a sistemas de picking.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la generalización a nuevas tareas añadiendo más datos de entrenamiento.
- Prototipado rápido de robots educativos: al ser un modelo compacto (450 M parámetros), puede desplegarse en hardware de consumo para laboratorios docentes que experimenten con control robótico.
- Pruebas de robustez de políticas: el modelo puede evaluarse en entornos con variaciones de iluminación o posición de objetos para medir la generalización, aunque no hay resultados de evaluación publicados.
- Integración en pipelines de LeRobot: al ser un modelo entrenado con LeRobot, se puede usar directamente con `lerobot-rollout` para ejecutar la política en el robot real, o como base para nuevos ajustes con `lerobot-train`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

No se especifican requisitos de hardware en la información disponible. Dado que el modelo tiene 450 millones de parámetros y está diseñado para ser eficiente (según la descripción de SmolVLA), es razonable que pueda ejecutarse en GPU de consumo como una RTX 3060 o superior, pero esta afirmación no está documentada. Las opciones de despliegue habituales para modelos LeRobot incluyen el uso de CUDA y el script `lerobot-rollout`; también se puede exportar a formatos como ONNX o TensorRT, pero no hay datos concretos. No se dispone de información sobre latencia o throughput.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables en la documentación proporcionada. El modelo es un ajuste específico de un modelo base (SmolVLA) para una tarea concreta, y no se han publicado comparaciones con otras políticas de control robótico.

## Limitaciones y advertencias

- No se ha realizado una evaluación sistemática del modelo; no se conoce su tasa de éxito en condiciones reales ni su robustez ante variaciones del entorno.
- El modelo está entrenado para una tarea muy concreta (pick-and-place de un cubo azul en una cesta azul) y puede no generalizar a otros objetos, colores o configuraciones.
- Los datos de entrenamiento provienen de un único robot (tipo `areumii_c1`); es probable que no funcione correctamente en otros robots sin un ajuste adicional.
- No se han documentado sesgos o alucinaciones; sin embargo, al ser un modelo de aprendizaje por imitación, puede replicar comportamientos subóptimos presentes en los datos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `lerobot/smolvla_base` y el dataset `1mol1/areamii_pickplace-v5` para confirmar sus restricciones.
- No se especifica la longitud de contexto ni los idiomas soportados; para aplicaciones de producción, es necesario consultar la documentación de SmolVLA base.

## Enlaces

- Modelo: https://huggingface.co/1ys1/areumii-smolvla-pickplace-v5
- Dataset: https://huggingface.co/datasets/1ys1/areumii_pickplace-v5
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
