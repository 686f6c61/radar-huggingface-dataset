# dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-059ae97cbb

## Resumen

Este repositorio contiene un checkpoint del decodificador de acciones World2Action del proyecto VAM-Cross, desarrollado por el usuario `dreamdifferent`. Se trata de un componente de un sistema de robótica que convierte observaciones visuales (videos de dos cámaras) en comandos de acción para un brazo robótico, concretamente para los entornos Panda y WidowX. El checkpoint corresponde a la iteración 900 de un entrenamiento que se detuvo por una causa desconocida, y se ha subido el modelo verificado más completo.

El modelo está diseñado para ser utilizado junto con un backbone Video2World congelado y un Video LoRA congelado, ambos publicados por el mismo autor. El dataset de entrenamiento contiene 162 episodios con 54 352 frames, y el objetivo es predecir 15 acciones de efector final y pinza a 5 Hz, con poses relativas y rotación en representación 6D. La información pública es muy limitada: no se especifican parámetros, arquitectura interna, licencia ni idiomas soportados, lo que dificulta su evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (decodificador de acciones World2Action) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 1.0 GB, probablemente safetensors o binarios) |

## Arquitectura y entrenamiento

La información disponible indica que este checkpoint es un decodificador de acciones dentro del marco VAM-Cross, que combina un backbone Video2World (inicialmente `dreamdifferent/widowx250-video-fused`) con un Video LoRA congelado (`vam-cross-level4-panda-robosuite-widowx-texture-video-lora-iter-200`). El decodificador de acciones inicial proviene de `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder`. El entrenamiento se realizó sobre un dataset con dos cámaras (`corner_cam` y `front_cam`), con 162 episodios y 54 352 frames. El objetivo es predecir 15 acciones de efector final y pinza a 5 Hz, con poses relativas al efector actual y rotación en representación 6D. No se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas específicas más allá de la arquitectura de dos cámaras y la fusión de video.

## Capacidades

- Predicción de acciones de robot (efector final y pinza) a partir de observaciones visuales de dos cámaras.
- Generación de comandos de acción a 5 Hz para control de brazos robóticos en entornos simulados (robosuite) y posiblemente reales (WidowX).
- Integración con un backbone Video2World y un Video LoRA congelados para procesamiento de video.
- Soporte de poses relativas al efector actual y rotación en 6D.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes o multilingüismo.

## Casos de uso

- Control de robots en simulación: el modelo puede utilizarse en entornos robosuite para generar acciones de bajo nivel a partir de imágenes de cámara, facilitando el aprendizaje por imitación o el control basado en visión.
- Teleoperación asistida: al predecir acciones relativas al efector, puede servir en sistemas de teleoperación para robots WidowX, reduciendo la carga del operador.
- Aprendizaje por demostración: el checkpoint puede emplearse como parte de un pipeline de imitación donde las demostraciones humanas se convierten en comandos de acción.
- Investigación en robótica: útil para estudiar la transferencia de políticas visuales entre diferentes plataformas (Panda y WidowX) mediante el uso de LoRA y backbones congelados.
- Desarrollo de sistemas de manipulación con dos cámaras: su diseño con dos vistas (esquina y frontal) permite experimentar con percepción multi-cámara.
- Benchmarking de decodificadores de acción: al ser un checkpoint público, puede servir como referencia para comparar arquitecturas de decodificación en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni métricas específicas de robótica (éxito en tareas, precisión de acciones, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (se desconoce si es compatible con vLLM, llama.cpp, Ollama, TGI u otros).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (decodificadores de acción para robótica con entrada visual). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el modelo puede usarse comercialmente, lo que supone un riesgo legal para su uso en producción.
- Documentación insuficiente: faltan detalles sobre arquitectura, parámetros, datos de entrenamiento y rendimiento, lo que dificulta su evaluación y reproducción.
- Dependencia de componentes externos: el modelo requiere un backbone Video2World y un Video LoRA congelados que deben descargarse por separado; sin ellos, el checkpoint no es funcional.
- Entrenamiento interrumpido: el run se detuvo por una causa desconocida, por lo que el modelo puede no estar completamente convergido.
- Sin garantías de generalización: al estar entrenado en un dataset específico (162 episodios), su comportamiento fuera de ese dominio es incierto.
- Riesgo de alucinación o acciones erróneas: al ser un modelo de predicción de acciones, puede generar comandos incorrectos en situaciones no vistas, con posibles consecuencias físicas en robots reales.
- Idiomas no soportados: no se indica soporte multilingüe; probablemente el modelo no procesa texto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-059ae97cbb
- Video LoRA congelado: https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-video-lora-iter-200
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decoder de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture
- robosuite (framework de simulación): https://robosuite.ai/
