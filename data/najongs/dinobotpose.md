# Najongs/dinobotpose

## Resumen

DINObotPose es un modelo de estimación de pose de robot y ángulos de articulaciones a partir de una única imagen RGB monocromática, sin necesidad de lecturas de encoders ni de bounding boxes de verdad absoluta. Lo desarrolla Najongs (Jongyeol Na) y publica sus pesos en Hugging Face, con el código, los puntos de entrada de evaluación y el script de reproducción alojados en su repositorio de GitHub. El modelo resuelve el problema de conocer la configuración articular de un robot manipulador cuando no se dispone de telemetría interna, lo que resulta relevante para aplicaciones de robótica colaborativa, control visual y calibración sin sensores.

La arquitectura se basa en un tronco DINOv3 ViT-B/16, un modelo de visión por computadora de Meta, sobre el que se añaden cabezales específicos por robot (Panda y KUKA) para la detección de puntos clave, la estimación de ángulos y la orientación. El repositorio de pesos incluye el tronco compartido y las cabezas por robot, con un tamaño de descarga de 741 MB (517 MB solo para Panda) frente a los 1486 MB una vez ensamblado. Los pesos se distribuyen bajo la licencia DINOv3, no bajo MIT, lo que implica condiciones específicas de redistribución y atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-B/16 (tronco) + cabezales de detección de puntos clave, ángulos y rotación por robot |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no procesa lenguaje) |
| Licencia | DINOv3 License Agreement (no MIT) |
| Formato de pesos | .pth (PyTorch), con manifest.json para ensamblado |

## Arquitectura y entrenamiento

El modelo usa un tronco DINOv3 ViT-B/16, que es un transformer de visión de la familia DINOv3 (Siméoni et al., 2025), entrenado de forma autosupervisada para producir representaciones densas de imagen. Sobre este tronco se añaden cabezales específicos por robot (Panda y Kuka) que predicen puntos clave del robot, ángulos de articulación y rotaciones. La arquitectura está diseñada para que el tronco se comparta entre ambos robots, con pequeñas sobreescrituras para los detectores cuyo entrenamiento continuado modificó las últimas capas.

Los detalles exactos del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se indican en la información disponible. El repositorio de GitHub contiene el script de reproducción, lo que sugiere que el proceso es reproducible, pero los datos específicos no están en la model card.

## Capacidades

- Estimación de pose de robot manipulador desde una sola imagen RGB.
- Predicción de ángulos de articulaciones sin necesidad de lecturas de encoders.
- Funciona sin bounding box de verdad absoluta: el modelo detecta la pose directamente de la imagen completa.
- Soporta dos robots: Panda y Kuka.
- Modelo de visión, sin capacidades de generación de texto, tool calling ni agentes.
- Multilingüe: no aplicable (no procesa lenguaje).

## Casos de uso

- Control visual de robots: el modelo puede estimar la pose del robot en tiempo real a partir de una cámara, permitiendo controlar el brazo sin depender de encoders internos, lo que es útil en sistemas de control basados en visión.
- Calibración de robots: permite verificar la pose real de un robot en el entorno de trabajo, útil para recalibrar modelos cinemáticos sin necesidad de sensores adicionales.
- Monitorización de seguridad en entornos colaborativos: detectar la posición de las articulaciones del robot para evitar colisiones con humanos u objetos, usando solo una cámara RGB.
- Teleoperación y control remoto: estimar el estado articular de un robot desde una imagen, lo que facilita la teleoperación con feedback visual sin telemetría.
- Investigación en aprendizaje por refuerzo: proporcionar observaciones de pose del robot en entornos simulados o reales, sin depender de la API del simulador.
- Integración en sistemas de visión industrial: combinar con otras tareas de visión (detección de objetos, segmentación) para un sistema de control completo basado en imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión en estimación de pose, comparación con otros métodos ni métricas de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del modelo ensamblado es de 1486 MB (pesos), por lo que la inferencia requerirá al menos una GPU con VRAM suficiente para el modelo y las activaciones.
- GPU recomendadas: no disponible. Dado el tamaño (~1.5 GB), probablemente sea ejecutable en GPUs consumer como RTX 3060 (12 GB) o superiores, pero no se confirma.
- Cabe en consumer GPU: probablemente sí, dado el tamaño, pero no se confirma.
- Opciones de despliegue: no disponible. No se mencionan herramientas de inferencia como vLLM o llama.cpp (este es un modelo de visión, no de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. La categoría de estimación de pose de robot monocular es específica, y no hay alternativas conocidas en la misma fuente.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero el modelo está entrenado probablemente con un dataset limitado a los robots Panda y Kuka, por lo que su generalización a otros robots es incierta.
- Riesgo de alucinación: al ser un modelo de visión, no hay alucinación textual, pero sí riesgo de predicciones incorrectas en imágenes fuera del dominio de entrenamiento (iluminación, ángulos de cámara, robots distintos).
- Limitaciones de contexto o idioma: no aplica (modelo de visión). No se especifican limitaciones en resolución o condiciones de imagen.
- Restricciones de licencia: los pesos están bajo la licencia DINOv3, que no es MIT. Es necesario leer y aceptar el acuerdo de licencia antes de descargar. La redistribución debe incluir el aviso "Built with DINOv3" y una copia del acuerdo. Uso comercial: no se indica explícitamente, pero debe revisarse el acuerdo.
- Caveat para producción: el modelo requiere el script de ensamblado del repositorio para reconstruir los seis checkpoints por robot. No hay garantía de soporte ni documentación de despliegue.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Najongs/dinobotpose
- Repositorio de GitHub: https://github.com/Najongs/DINObotPose
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Perfil del autor en Hugging Face: https://huggingface.co/Najongs
