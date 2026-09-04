# jljimenezmo/cv-retrieval

## Resumen

`jljimenezmo/cv-retrieval` es una implementación de trabajo de la arquitectura MobileViT en configuración nano, orientada a tareas de recuperación de imágenes (retrieval). El proyecto está desarrollado por jljimenezmo y se publica como un repositorio de código transparente con un checkpoint de inicialización, no como un modelo entrenado y listo para producción.

El modelo cuenta con 49.600 parámetros totales, un tamaño extremadamente reducido, y utiliza una arquitectura híbrida que combina convoluciones y atención de ventana deslizante. El objetivo declarado del autor es proporcionar un punto de partida reproducible para experimentos de retrieval, con énfasis en código claro y pruebas de humo (smoke tests) repetibles.

Es relevante ahora porque representa un ejemplo de implementación didáctica de MobileViT para retrieval, pero debe entenderse como un esqueleto experimental: el checkpoint incluido no ha sido entrenado ni evaluado, y no se presentan resultados de benchmarks. Cualquier uso en aplicaciones reales requiere entrenamiento previo y una evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (configuracion nano) |
| Parametros totales | 49.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa MobileViT en escala nano, una arquitectura que combina capas convolucionales con bloques de atención basados en transformadores. En concreto, la configuración registrada en `config.json` indica atención de ventana deslizante, fusión mediante concatenación con una MLP, activación Swish y normalización por instancia.

El checkpoint `model.safetensors` es un punto de inicialización válido para pruebas de humo, no un modelo entrenado. El repositorio incluye un script `model.py` con un ejemplo ejecutable y un punto de entrada de entrenamiento, así como `training_args.json` con una receta por defecto que usa el optimizador Lion y un programador OneCycle. El autor aclara explícitamente que estos valores son solo puntos de partida y no evidencian una ejecución completada. No se menciona ningún proceso de RLHF, DPO ni ajuste fino posterior.

## Capacidades

- Extracción de características visuales mediante una arquitectura MobileViT de tamaño nano.
- Recuperación de imágenes basada en similitud, como objetivo de diseño del proyecto.
- Ejecución de pruebas de humo y experimentos de investigación gracias al código fuente incluido.
- Soporte de adaptación para tareas de retrieval mediante el script de entrenamiento.
- No dispone de soporte de tool calling, function calling ni capacidades de agentes.
- No es un modelo de lenguaje: no genera texto, no razona sobre lenguaje natural y no soporta multilingüismo.

## Casos de uso

- Prototipado rápido de sistemas de retrieval visual: el modelo puede utilizarse como base para experimentar con la arquitectura MobileViT en tareas de búsqueda de imágenes por similitud, siempre que se entrene previamente con un dataset adecuado.
- Investigación académica en arquitecturas eficientes: al ser una implementación pequeña y transparente, resulta útil para estudiar el comportamiento de MobileViT en configuraciones nano sin necesidad de recursos computacionales elevados.
- Validación de pipelines de retrieval: el checkpoint de inicialización permite comprobar que el código y la infraestructura de entrenamiento funcionan correctamente antes de lanzar entrenamientos completos.
- Docencia y divulgación: el código comentado y la receta de entrenamiento por defecto sirven como material didáctico para explicar MobileViT y su aplicación a retrieval.
- Comparación de recetas de entrenamiento: el repositorio está pensado para comparar configuraciones (optimizador, programador, etc.) con el mismo presupuesto de datos y semillas, lo que facilita estudios controlados.
- Integración en sistemas de búsqueda multimodal: una vez entrenado, podría emplearse para indexar y recuperar imágenes en bases de datos visuales, aunque esta aplicación no está validada en el estado actual del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se presenta ninguna puntuación de benchmark en el repositorio y que el checkpoint incluido no debe considerarse un modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo con 49.600 parámetros, el consumo de memoria es mínimo; cualquier GPU con más de 1 GB de VRAM es suficiente, e incluso la ejecución en CPU es viable.
- GPU recomendadas: no se requiere hardware específico; puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4090, o en GPUs de datacenter como A100 o H100, aunque su uso sería sobredimensionado.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU de consumidor.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con APIs genéricas como vLLM, llama.cpp u Ollama. Requiere un adaptador explícito para cargar el modelo. Puede ejecutarse con PyTorch estándar.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables publicados con la misma configuración (MobileViT nano para retrieval) y el mismo estado de desarrollo. La comparación con modelos de retrieval visual de mayor tamaño carecería de sentido, ya que este checkpoint no está entrenado.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado, por lo que no ofrece ninguna capacidad real de retrieval ni de extracción de características útil en producción.
- No se ha realizado ninguna auditoría de robustez, equidad o transferencia de dominio, tal y como indica el autor en la model card.
- La implementación es experimental y no está soportada por APIs de carga automática; se requiere un adaptador personalizado.
- No se dispone de información sobre sesgos, riesgos de alucinación (al no ser un modelo de lenguaje) o limitaciones de contexto.
- La licencia BSD-3-Clause permite el uso comercial, pero el autor advierte de que deben revisarse los términos de las fuentes de datos externas si se utilizan con este repositorio.
- Cualquier resultado obtenido con un checkpoint entrenado en el futuro debe documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jljimenezmo/cv-retrieval
- Repositorio asociado: no disponible en la información proporcionada
