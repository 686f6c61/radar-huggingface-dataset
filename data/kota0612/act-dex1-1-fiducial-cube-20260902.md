# Kota0612/act-dex1-1-fiducial-cube-20260902

## Resumen

ACT (Action Chunking Transformer) es una política de aprendizaje por imitación desarrollada sobre la implementación de LeRobot, entrenada por Kota0612 para controlar un robot Unitree Dex1-1 (mano con cutter) en la tarea de manipular un cubo fiducial. El modelo tiene 51.668.614 parámetros y se distribuye bajo licencia MIT en formato safetensors. Se entrenó con 154 episodios y 36.440 frames de demostraciones, usando como observación una imagen RGB de 224x224 de la cámara frontal del gripper, y generando secuencias de acciones de 6 dimensiones (posición y orientación del efector final). Es relevante para la comunidad de robótica porque ofrece una política compacta y abierta para replicar tareas de manipulación mediante imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT), transformer denso |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking Transformer) de LeRobot, un transformer denso que procesa observaciones visuales (una imagen de 224x224 de la cámara del gripper) y genera un bloque de acciones futuras (action chunking). El espacio de acciones es de 6 dimensiones: posición del efector final `eef_pos` (3) y orientación como axis-angle `eef_rot_axis_angle` (3). No incluye el ancho de apertura del gripper, que se controla mediante un CNN separado en la configuración del Dex1-1. El entrenamiento se realizó durante 100.000 pasos con una pérdida final aproximada de 0,035. El conjunto de datos contiene 154 episodios y 36.440 frames, recopilados con el robot Dex1-1 manipulando un cubo fiducial. Al ser aprendizaje por imitación, no se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Manipulación de objetos basada en visión: predice comandos de movimiento del efector final a partir de una imagen RGB de 224x224.
- Control de posición y orientación en 6D (x, y, z + axis-angle).
- Generación de secuencias de acciones (action chunking) para movimientos suaves y coherentes en el tiempo.
- Aprendizaje por imitación de demostraciones, sin necesidad de modelar dinámica física explícita.
- Capacidad limitada a la tarea específica del cubo fiducial y al robot Unitree Dex1-1.
- No soporta tool calling, razonamiento de lenguaje, ni capacidades multimodales de texto.

## Casos de uso

- Automatización de manipulación de cubos en línea de producción: el modelo genera trayectorias para colocar un cubo fiducial en una posición concreta, utilizando la cámara para adaptarse a variaciones de posición.
- Ensamblaje de precisión: la política puede imitar movimientos de alineación e inserción de piezas (por ejemplo, un cubo en una ranura) gracias a la predicción de orientación en 6D.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar técnicas de action chunking en entornos de manipulación real con manos robóticas.
- Control de efector final en robots colaborativos: se puede integrar en un pipeline de LeRobot para controlar un robot Dex1-1 en tareas de agarre y colocación sin programar trayectorias manualmente.
- Entrenamiento de teleoperación asíncrona: tras recopilar demostraciones, el modelo ejecuta la tarea de forma autónoma, reduciendo la necesidad de intervención humana.
- Generación de trayectorias simplificadas para el control del cutter: aunque no controla la apertura, puede coordinarse con un CNN externo para la manipulación del cutter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo solo reporta una pérdida de entrenamiento de aproximadamente 0,035 tras 100.000 pasos, sin métricas de evaluación como éxito en tarea, precisión de trayectoria ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,2 GB en fp32; menos de 0,1 GB en fp16. Cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más (RTX 3060, T4, A100). También puede ejecutarse en CPU, aunque con mayor latencia.
- Consumer GPU: sí, el modelo cabe en GPU de consumo de los últimos años (GTX 1060, RTX 2060, etc.).
- Opciones de despliegue: LeRobot y PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El modelo es un único punto de referencia para políticas ACT en el robot Dex1-1; otros modelos ACT de LeRobot entrenados para robots distintos no son directamente comparables.

## Limitaciones y advertencias

- Entrenado exclusivamente para la tarea de cubo fiducial con el robot Unitree Dex1-1; la generalización a otros objetos o entornos es limitada.
- Depende de la calibración de la cámara y de la posición inicial del robot; cambios en la configuración requieren reentrenamiento o ajustes.
- No controla la apertura del gripper (cutter); necesita un CNN externo para esa parte del sistema.
- Las demostraciones son limitadas (154 episodios) y pueden introducir sesgos en el comportamiento aprendido.
- Riesgo de generar acciones no seguras si se presentan observaciones fuera de la distribución de entrenamiento; se recomienda supervisión en producción.
- No es un modelo de lenguaje, por lo que no aplica a tareas de texto, chat ni generación de contenido.
- La licencia MIT permite uso comercial y modificación, pero el robot físico y su controlador pueden tener restricciones propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kota0612/act-dex1-1-fiducial-cube-20260902
- Dataset de demostraciones: https://huggingface.co/datasets/Kota0612/dex1-1-fiducial-cube-20260902
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor en HuggingFace: https://huggingface.co/Kota0612
