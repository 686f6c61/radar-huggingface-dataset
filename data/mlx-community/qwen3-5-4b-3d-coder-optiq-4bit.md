# mlx-community/Qwen3.5-4B-3D-Coder-OptiQ-4bit

## Resumen

Qwen3.5-4B-3D-Coder-OptiQ-4bit es una cuantización de precisión mixta en formato MLX del modelo ccore/Qwen3.5-4B-3D-Coder, un fine-tune de Qwen3.5 (4B parámetros) especializado en generar escenas y assets 3D como archivos HTML autocontenidos que usan Three.js. Lo publica la organización mlx-community, que distribuye versiones optimizadas para Apple Silicon, y está construido con la herramienta mlx-optiq, un toolkit nativo de MLX para cuantizar, afinar y servir modelos localmente sin PyTorch ni nube.

El modelo resuelve un nicho muy concreto: producir código Three.js funcional (geometrías, materiales, iluminación, controles de órbita, animaciones) a partir de una descripción en lenguaje natural, orientado a prototipado rápido de assets para videojuegos y escenas web interactivas. Con 4.205.751.296 parámetros totales, el modelo corre en un Apple M4 de 24 GB a unos 26 tokens/s con un pico de memoria de entre 4 y 6 GB, lo que lo sitúa en el rango de equipos de consumo.

La relevancia actual es doble: por un lado demuestra el estado de las cuantizaciones de precisión mixta (asignación por capas de 4 y 8 bits) para modelos de código en hardware Apple; por otro, expone con transparencia los límites reales de un modelo pequeño en tareas de razonamiento espacial y generación de código largo, con tasas de éxito documentadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con torre de visión separada; cuantización de precisión mixta MLX |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | 4 bits predominante, con 173 capas a 4 bits y 76 capas a 8 bits; group size 64; torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), incluido `optiq_vision.safetensors` para la torre de visión |
| Tamano en disco | 3.7 GB (incluida la torre de visión); repo de 4.0 GB |
| Modelo base | ccore/Qwen3.5-4B-3D-Coder |
| Libreria | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de la familia Qwen3.5 con 4B parámetros, afinado por ccore para la generación de escenas Three.js. Incluye una torre de visión que en esta cuantización se conserva en bf16 dentro de un archivo separado (`optiq_vision.safetensors`), lo que sugiere capacidades multimodales en el modelo base, aunque la model card no detalla su uso. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta ficha es la cuantización OptiQ de precisión mixta: 173 capas a 4 bits y 76 capas a 8 bits con group size 64, elegidas para preservar la calidad en las capas más sensibles. La model card advierte explícitamente de que la asignación por capa no se midió sobre este modelo, sino que se transfirió desde mlx-community/Qwen3.5-4B-OptiQ-4bit. El modelo base no incluye cabeza MTP (multi-token prediction), por lo que la opción `--mtp` no está disponible en esta cuantización.

## Capacidades

- Generación de código Three.js: produce archivos HTML autocontenidos con escenas 3D, geometrías, materiales, iluminación y animaciones.
- Creación de assets 3D para videojuegos: personajes, armas, edificios, objetos y modelos voxel, con mallas separadas y nombradas.
- Controles de cámara implementados en el propio código: la guía del autor exige implementar los controles de órbita directamente en el HTML, sin addons.
- Modo thinking: el autor recomienda activarlo; la mayor parte de los tokens generados corresponden a razonamiento previo al código.
- Generación de código largo: los assets completados consumieron entre 10.000 y 22.000 tokens.
- Capacidad multimodal potencial: la presencia de torre de visión en bf16 indica soporte de entrada visual en el modelo base, aunque no se documenta su uso en esta ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado; el modo thinking es el único mecanismo de razonamiento descrito.

## Casos de uso

- Prototipado de assets para videojuegos: a partir de una descripción textual ("cañón de cubierta pirata sobre cureña de madera"), el modelo genera un HTML con la escena completa, lista para abrir en el navegador y evaluar silueta, proporciones y legibilidad.
- Generación de escenas web interactivas: creación de demos Three.js con controles de órbita y giro en plato giratorio para presentaciones de producto o portfolios, sin necesidad de escribir el código a mano.
- Modelado voxel rápido: el modelo puede producir modelos voxel deliberados (goblin, criaturas) construidos con bloques cúbicos visibles, útiles como base para juegos con estética retro.
- Iteración de diseño conceptual: dado que cada asset tarda entre 7 y 14 minutos y consume entre 10.000 y 22.000 tokens, encaja en flujos de exploración de conceptos donde se generan varias variantes y se seleccionan las mejores.
- Educación y aprendizaje de Three.js: los archivos generados sirven como ejemplos funcionales de geometría, materiales y animación para desarrolladores que aprenden la librería.
- Generación local en Apple Silicon: con 3.7 GB en disco y 4-6 GB de pico de memoria, se puede ejecutar en un portátil M4 de 24 GB sin conexión ni costes de API, adecuado para entornos con requisitos de privacidad.
- Pruebas de pipelines de generación de código: útil para investigar tasas de éxito, bucles de razonamiento y errores de compilación en modelos pequeños de código, con métricas documentadas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card únicamente aporta métricas de ejecución y de tasa de éxito en generación de assets:

| Metrica | Valor |
|---|---|
| Throughput en Apple M4 de 24 GB | ~26 tokens/s |
| Pico de memoria | 4-6 GB |
| Tamano en disco | 3.7 GB |
| Intentos que renderizaron en navegador | 11 de 18 |
| Intentos que fallaron al cargar | 3 de 18 |
| Bucles de razonamiento hasta el límite de 64k tokens | 4 de 18 |
| Tokens por asset completado | 10.000-22.000 |
| Tiempo por asset completado | 7-14 minutos |
| Duracion de los bucles hasta el límite | ~53 minutos |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 4-6 GB de pico en inferencia según la model card; 3.7 GB en disco.
- GPU recomendadas: Apple Silicon; el dato medido corresponde a un M4 de 24 GB. No hay datos para A100, H100 ni RTX 4090, ya que el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada (el pico documentado es de 4-6 GB), aunque 16-24 GB ofrece margen para contextos largos.
- Opciones de despliegue: MLX y el toolkit mlx-optiq (cuantización, fine-tuning y serving local). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que los pesos son MLX nativos.
- Latencia y throughput: ~26 tokens/s en M4 de 24 GB; un asset completo tarda entre 7 y 14 minutos, mayoritariamente por el razonamiento del modo thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder-OptiQ-4bit (este) | 4,2B | no disponible | MLX, Apple Silicon | Apache 2.0 | Cuantización mixta 4/8 bits, ~26 tok/s en M4 |
| ccore/Qwen3.5-4B-3D-Coder | 4B (aprox.) | no disponible | safetensors (modelo base) | Apache 2.0 (según la ficha) | Modelo original sin cuantizar; sin datos de rendimiento comparativo en la información disponible |
| mlx-community/Qwen3.5-4B-OptiQ-4bit | 4B (aprox.) | no disponible | MLX, Apple Silicon | Apache 2.0 (según la ficha) | Cuantización del Qwen3.5 base; su asignación por capas se reutilizó en este modelo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas de código o razonamiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Tasa de éxito limitada: solo 11 de 18 intentos renderizaron en el navegador; 3 fallaron al cargar y 4 entraron en bucles de razonamiento hasta el límite de 64k tokens.
- Bucles de razonamiento: los cuatro bucles se produjeron con prompts de tipo voxel y consumieron unos 53 minutos cada uno antes de alcanzar el límite. Es imprescindible fijar un `max_tokens` aunque sea alto.
- Calidad visual irregular: algunos assets que renderizaron presentaron piezas flotantes o animaciones rotas; los ejemplos publicados son una selección manual de 18 intentos, no una muestra típica.
- Errores de código pequeños pero fatales: los fallos de carga se debieron a errores como nombres de variable duplicados, que el autor reconoce como problema conocido.
- Asignación de bits no medida en este modelo: la distribución de capas a 4 y 8 bits se transfirió desde otra cuantización, por lo que puede no ser óptima para esta tarea.
- Sin cabeza MTP: la opción `--mtp` no está disponible porque el modelo fuente no la incluye.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe más allá del inglés de los prompts de ejemplo.
- Contexto máximo no documentado: se usó `max_tokens` de 64.000 en las pruebas, pero no se especifica la longitud de contexto nativa del modelo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales no detalladas en la información disponible.
- Riesgo de alucinación en APIs: puede generar imports o rutas de Three.js no válidas; el prompt de sistema del autor restringe el uso exclusivo del módulo core desde cdnjs.
- Dependencia de hardware: los pesos son MLX, por lo que no se ejecutan directamente en CUDA sin conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Qwen3.5-4B-3D-Coder-OptiQ-4bit
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Cuantización de referencia para la asignación de bits: https://huggingface.co/mlx-community/Qwen3.5-4B-OptiQ-4bit
- Organización MLX Community: https://huggingface.co/mlx-community
- Toolkit mlx-optiq: https://mlx-optiq.com
- Documentación de mlx-optiq: https://mlx-optiq.com/docs/
- Laboratorio de mlx-optiq: https://mlx-optiq.com/docs/lab/
- Catálogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Three.js (versión usada en los ejemplos): https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js
