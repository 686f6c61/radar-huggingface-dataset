# exalandru/Seed-OSS-36B-Instruct-oQ4e

## Resumen

Seed-OSS-36B-Instruct-oQ4e es una cuantización mixta de precisión del modelo Seed-OSS-36B-Instruct, publicada por el usuario exalandru en Hugging Face. El checkpoint original es un modelo de lenguaje de 36.151.104.512 parámetros desarrollado por ByteDance Seed, y esta versión lo redistribuye en formato MLX para su ejecución en hardware Apple Silicon mediante la librería mlx. La cuantización se ha realizado con oQ (oMLX v0.8.3), una herramienta de cuantización de precisión mixta que asigna distintos anchos de bit por tensor.

El resultado es un checkpoint de 20,203 GiB de pesos lógicos con un promedio efectivo de 4,800 bits por peso, lo que reduce el requisito de almacenamiento hasta 21,692 GB en disco. La distribución no es uniforme: el 79,634% de los pesos se almacenan en 4 bits afín con grupo de 64, mientras que una fracción menor se preserva en 5, 6 y 8 bits, presumiblemente para capas sensibles a la cuantización.

La relevancia de esta ficha es doble: por un lado documenta una receta de cuantización mixta aplicada a un modelo grande de 36B, y por otro advierte de que la model card del repositorio no incluye información sobre licencia, idiomas, benchmarks ni detalles del entrenamiento original, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Seed-OSS-36B-Instruct; arquitectura no documentada en la información proporcionada) |
| Parametros totales | 36.151.104.512 (36,151B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta afín con grupo de 64: 4-bit (28,789B), 5-bit (5,468B), 6-bit (1,098B), 8-bit (0,794B) y BF16 (0,001B); promedio efectivo 4,800 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Seed-OSS-36B-Instruct en los datos proporcionados: no se especifica si es un transformer denso, un modelo MoE, híbrido o cualquier otra variante, ni el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF o DPO. El repositorio solo documenta el proceso de cuantización, no el entrenamiento original.

La innovación técnica documentada es la cuantización mixta de oQ (oMLX v0.8.3), que asigna anchos de bit distintos por tensor en lugar de aplicar una precisión uniforme. Según la model card, el 79,634% de los pesos lógicos (28,789B) se almacenan en 4 bits afín con grupo de 64, el 15,126% (5,468B) en 5 bits, el 3,038% (1,098B) en 6 bits, el 2,197% (0,794B) en 8 bits y un 0,004% (0,001B) se mantiene en BF16. El checkpoint completo ocupa 20,203 GiB de almacenamiento de pesos, con un promedio efectivo de 4,800 bits por peso.

## Capacidades

- Generación de texto: el modelo base es un modelo instruct, por lo que se espera capacidad de seguir instrucciones y generar texto, aunque no se detallan capacidades concretas en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon: la librería mlx y el formato de pesos permiten ejecutar el modelo en hardware Apple con memoria unificada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint en formato MLX está pensado para ejecutarse con la librería mlx en equipos Mac con memoria unificada suficiente; el tamaño de 20,203 GiB de pesos lógicos condiciona qué configuraciones de memoria pueden albergarlo.
- Evaluación de recetas de cuantización mixta: investigadores que comparan el impacto de asignar 4, 5, 6 y 8 bits por tensor pueden usar este checkpoint como referencia frente a cuantizaciones uniformes de 4 bits del mismo modelo base.
- Investigación sobre degradación por cuantización: al preservar un 2,197% de los pesos en 8 bits y un 0,004% en BF16, el checkpoint permite estudiar qué capas requieren mayor precisión para mantener la calidad en tareas de generación de texto.
- Despliegue en entornos con memoria limitada: la reducción a 4,800 bits/peso efectivos frente a los 16 bits de BF16 facilita alojar un modelo de 36B en equipos que no podrían cargar el checkpoint original completo.
- Prototipado de asistentes conversacionales: si el modelo base conserva sus capacidades instruct, podría emplearse para generar respuestas en aplicaciones de chat, aunque no hay datos publicados que confirmen su calidad.
- Reproducibilidad de pipelines de cuantización: el desglose por componente y por ancho de bit de la model card sirve como plantilla para documentar y auditar procesos de cuantización mixta en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 20,203 GiB solo para los pesos lógicos; hay que añadir la memoria para el contexto KV y los buffers de ejecución, por lo que el requisito real supera los 21,692 GB del repositorio.
- GPU recomendadas: no disponible; el formato MLX está orientado a Apple Silicon, no a CUDA.
- ¿Cabe en GPU de consumo?: no disponible para GPUs NVIDIA; para Apple Silicon, requiere equipos con memoria unificada superior a los 20,203 GiB de pesos, como configuraciones de 32 GB o más, aunque no se especifica el mínimo exacto.
- Opciones de despliegue: librería mlx (formato nativo del checkpoint); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Seed-OSS-36B-Instruct-oQ4e | 36,151B | no disponible | Mixta 4/5/6/8-bit, 4,800 bits/peso efectivos | no disponible | safetensors (MLX) |
| Seed-OSS-36B-Instruct (original) | 36,151B | no disponible | BF16 | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de la misma categoría en los datos proporcionados, por lo que no es posible establecer una comparativa con alternativas concretas.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial está permitido; hay que consultar la licencia del modelo base Seed-OSS-36B-Instruct antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados ni el comportamiento multilingüe del checkpoint.
- La cuantización mixta puede introducir degradaciones de calidad respecto al modelo original en BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en apenas dos minutos, lo que sugiere que no ha pasado por una validación comunitaria.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay evidencia de compatibilidad con ecosistemas CUDA.
- El requisito de memoria (más de 20,203 GiB para pesos) excluye la mayoría de equipos de consumo.
- No se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/exalandru/Seed-OSS-36B-Instruct-oQ4e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
