# AmmarkoV/SAM3DBody-cpp-onnx-models

## Resumen

SAM3DBody-cpp es un modelo de visión por computadora orientado a la reconstrucción tridimensional del cuerpo humano completo en tiempo real a partir de una única cámara. Desarrollado por AmmarkoV, se distribuye como un conjunto de pesos en formato ONNX y GGUF, acompañado de un motor de inferencia en C++ puro que elimina dependencias de Python en tiempo de ejecución. El modelo genera parámetros de pose corporal (MHR), traducción de cámara y, opcionalmente, mallas 3D completas junto con un esqueleto de 70 articulaciones que incluye manos, lo que lo hace adecuado para aplicaciones de captura de movimiento, realidad virtual y análisis biomecánico.

Con solo 2,6 millones de parámetros, el modelo es notablemente ligero, lo que permite su ejecución en hardware modesto y en tiempo real. El repositorio en Hugging Face contiene los pesos en varios formatos (safetensors, ONNX y GGUF) y ocupa 11,5 GB, lo que sugiere que se incluyen múltiples variantes o cuantizaciones. Su licencia MIT permite uso comercial sin restricciones, un factor relevante para su integración en productos. La relevancia actual radica en la demanda de soluciones de captura de movimiento accesibles y de bajo coste que no requieran equipos especializados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en SAM, según el nombre, pero no confirmado) |
| Parametros totales | 2.634.250 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato GGUF sugiere cuantizacion, pero no se especifican variantes) |
| Idiomas soportados | no aplica (entrada visual) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo. El nombre sugiere una adaptación del Segment Anything Model (SAM) al dominio de reconstrucción corporal 3D, pero no hay documentación oficial que lo confirme. Tampoco se han publicado detalles sobre el proceso de entrenamiento, como el número de tokens (imágenes) utilizados, la composición del dataset o si se aplicaron técnicas de ajuste fino con supervisión humana. El modelo está diseñado para inferencia en tiempo real con un runtime C++ puro, lo que implica una optimización orientada a baja latencia y despliegue en entornos embebidos o de bajos recursos. La presencia de formatos ONNX y GGUF indica compatibilidad con motores de inferencia como ONNX Runtime y llama.cpp (aunque este último es más común para modelos de lenguaje, aquí se usa para la parte de ggml).

## Capacidades

- Reconstrucción 3D del cuerpo completo a partir de una única imagen o flujo de cámara.
- Detección y seguimiento de múltiples personas en la misma escena.
- Salida en formato BVH (Biovision Hierarchy), estándar en animación y captura de movimiento.
- Generación de un esqueleto de 70 articulaciones, incluyendo manos completas (dedos).
- Parámetros de pose MHR (probablemente rotaciones y traslaciones) y traducción de cámara.
- Opcionalmente, generación de mallas 3D del cuerpo (vértices).
- Inferencia en tiempo real gracias al runtime C++ puro y al tamaño reducido del modelo.
- Compatibilidad con formatos ONNX y GGUF, facilitando la integración en distintos entornos.

## Casos de uso

- Captura de movimiento para animación 3D: el modelo genera salida BVH directamente, lo que permite alimentar pipelines de animación (Blender, Maya, Unity) sin necesidad de postprocesado adicional. Su velocidad en tiempo real es ideal para grabación en estudio o en directo.
- Realidad virtual y aumentada: la reconstrucción corporal 3D en tiempo real permite avatares virtuales que replican los movimientos del usuario con precisión, incluyendo gestos de manos, mejorando la inmersión en aplicaciones de VR social o entrenamiento.
- Análisis biomecánico y fisioterapia: al obtener un esqueleto de 70 articulaciones, se pueden calcular ángulos articulares y métricas de movimiento para evaluar posturas, rehabilitación o rendimiento deportivo. El bajo coste del hardware necesario (una cámara web) lo hace accesible para clínicas y gimnasios.
- Telepresencia y videoconferencia avanzada: la reconstrucción 3D permite sustituir el fondo por entornos virtuales manteniendo la silueta del usuario, o incluso mostrar un avatar 3D en lugar del vídeo, reduciendo el ancho de banda.
- Robótica y control por gestos: el modelo puede utilizarse como entrada para sistemas de control robótico basados en la pose corporal, permitiendo que un operador controle un robot mediante movimientos naturales sin sensores adicionales.
- Deportes y análisis de rendimiento: con múltiples personas detectadas simultáneamente, es posible analizar la técnica de varios atletas en una misma toma, útil para entrenadores y análisis de competición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión en métricas estándar de reconstrucción 3D (como MPJPE, PA-MPJPE) ni comparaciones con otros modelos de captura de movimiento. Tampoco se documentan métricas de latencia o throughput en diferentes hardware.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU recomendadas en la documentación disponible.
- Dado el tamaño del modelo (2,6 millones de parámetros), es plausible que pueda ejecutarse en CPU en tiempo real, pero no hay datos confirmados.
- El runtime C++ puro sugiere que puede desplegarse en sistemas embebidos o de bajo consumo, pero sin cifras concretas.
- Los formatos ONNX y GGUF permiten el uso de motores como ONNX Runtime, llama.cpp (para GGUF) y potencialmente vLLM, aunque estos últimos están más orientados a modelos de lenguaje.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (reconstrucción 3D corporal en tiempo real con salida BVH). Existen alternativas comerciales como MediaPipe Pose (de Google) o modelos como HMR y VIBE, pero no se han encontrado datos objetivos de comparación en las fuentes consultadas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No se ha documentado información sobre sesgos del modelo, pero al ser un modelo de visión, puede presentar errores en condiciones de iluminación adversa, oclusiones o con personas de ciertos tipos corporales no representados en el dataset de entrenamiento (desconocido).
- El riesgo de alucinación no aplica directamente, pero la reconstrucción 3D puede ser inexacta en poses complejas o con múltiples personas solapadas.
- No se especifican limitaciones de contexto o idioma, al ser un modelo visual.
- La licencia MIT permite uso comercial sin restricciones, pero no hay garantías de soporte o mantenimiento por parte del autor.
- Para producción, es necesario validar la precisión en el caso de uso específico, ya que no hay benchmarks públicos.

## Enlaces

- [Hugging Face - AmmarkoV/SAM3DBody-cpp-onnx-models](https://huggingface.co/AmmarkoV/SAM3DBody-cpp-onnx-models)
- [GitHub - AmmarkoV/SAM3DBody-cpp](https://github.com/AmmarkoV/SAM3DBody-cpp)
- [GitHub - siathalysedI/SAM3DBody-cpp--AmmarkoV (fork)](https://github.com/siathalysedI/SAM3DBody-cpp--AmmarkoV)
- [Página de proyecto en olud.ai](https://olud.ai/project/ammarkov-sam3dbody-cpp.html)
