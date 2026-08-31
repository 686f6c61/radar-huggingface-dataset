# kdotmahesh/diffusion-pick-clip-mug

## Resumen

El modelo `kdotmahesh/diffusion-pick-clip-mug` es una política de control visuomotor para robótica basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Resuelve la tarea de manipulación "coger un clip y colocarlo en una taza" (pick and place) mediante aprendizaje por imitación, generando trayectorias de acción suaves y multi-paso a partir de observaciones de estado y dos cámaras (muñeca y vista superior). El modelo tiene 277,8 millones de parámetros y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

La relevancia de este modelo radica en que demuestra la aplicación de modelos de difusión al control de robots en tareas de contacto rico, un área de investigación activa en robótica. Al estar publicado en Hugging Face con el ecosistema LeRobot, es reproducible y fácil de desplegar en hardware compatible, aunque su alcance está limitado a la tarea específica para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor control generativo) |
| Parametros totales | 277.840.246 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que trata el control visuomotor como un proceso generativo de difusión. En lugar de predecir una única acción, el modelo genera una secuencia de acciones (trayectoria) mediante un proceso de denoising iterativo, lo que produce movimientos suaves y robustos, especialmente adecuados para tareas de manipulación con contacto físico. La política consume observaciones de estado (6 dimensiones) y dos imágenes RGB (muñeca y vista superior, ambas de 480x640) y produce una acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 50 episodios (26.095 frames a 30 FPS) de la tarea "Pick the clip and place it in the mug". Se usaron 13.000 pasos de entrenamiento con batch size 32, optimizador Adam, learning rate 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente de imitación supervisada.

## Capacidades

- Generación de trayectorias de acción multi-paso para control robótico, con suavidad y robustez en tareas de manipulación.
- Procesamiento de observaciones multimodales: estado del robot (6D) y dos vistas de cámara (muñeca y overhead).
- Ejecución de la tarea específica de pick-and-place de un clip en una taza, aprendida por imitación.
- Integración con el ecosistema LeRobot para despliegue en robots compatibles (tipo `so_follower`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo de control físico especializado.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de ensamblaje: el modelo puede integrarse en un robot tipo `so_follower` para recoger y colocar piezas pequeñas (como clips) en contenedores, reduciendo la intervención manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar Diffusion Policy en tareas de contacto rico, permitiendo reproducir experimentos con el dataset y el código de LeRobot.
- Prototipado rápido de políticas robóticas: gracias a la integración con LeRobot, se puede entrenar y desplegar en pocos pasos, ideal para validar conceptos en laboratorio.
- Benchmarking de algoritmos de control generativo: al estar disponible públicamente, puede usarse como referencia para comparar con otras arquitecturas (ACT, VQ-BeT, etc.) en la misma tarea.
- Educación en robótica y aprendizaje automático: el modelo y su dataset son recursos didácticos para enseñar control basado en difusión y pipelines de imitación.
- Desarrollo de soluciones de manipulación en entornos domésticos o de oficina: aunque limitado a una tarea concreta, demuestra la viabilidad de entrenar políticas personalizadas con pocos datos (50 episodios).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM, GPU recomendada ni latencia en la documentación del modelo.
- Dado que el modelo tiene ~278 millones de parámetros y procesa dos imágenes de 480x640, se estima que una GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 2070) podría ejecutar la inferencia, aunque no hay confirmación oficial.
- El despliegue se realiza mediante el framework LeRobot, que requiere PyTorch y CUDA. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Para entrenamiento, se recomienda una GPU con mayor capacidad (p. ej., RTX 3090 o superior) dado el batch size de 32 y las imágenes de alta resolución, aunque no se especifica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de control robótico basadas en difusión) dentro de los datos proporcionados. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "coger un clip y colocarlo en una taza" con un dataset de solo 50 episodios; no generaliza a otras tareas ni a variaciones significativas del entorno (posiciones de objetos, iluminación, distracciones).
- No se han realizado evaluaciones en robot real, por lo que se desconoce su tasa de éxito real y su robustez frente a perturbaciones.
- El dataset es pequeño y puede presentar sesgos derivados de las demostraciones humanas (por ejemplo, preferencias de agarre o trayectorias subóptimas).
- Al ser un modelo de difusión, la inferencia puede ser más lenta que métodos de predicción directa, aunque no se proporcionan datos de latencia.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende del ecosistema LeRobot y de hardware específico (robot `so_follower`), lo que limita su portabilidad.
- No se especifican requisitos de memoria ni de cómputo para el entrenamiento, lo que dificulta la planificación de recursos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kdotmahesh/diffusion-pick-clip-mug)
- [Dataset de entrenamiento](https://huggingface.co/datasets/kdotmahesh/pick-clip-place-mug_20260830_120021)
- [Paper de Diffusion Policy (arXiv:2303.04137)](https://huggingface.co/papers/2303.04137)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
