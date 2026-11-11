# Barullo/Video2d

## Resumen

ToonCrafter (512x320) es un modelo de difusión de vídeo desarrollado por CUHK y Tencent AI Lab, diseñado específicamente para la interpolación generativa de animación tipo cartoon. Toma dos imágenes fijas (fotograma inicial y fotograma final) junto con un prompt de texto que describe la dinámica, y genera una secuencia de vídeo corta que interpola entre ambas, produciendo clips de aproximadamente 2 segundos a 8 FPS.

El modelo parte de un ajuste fino (fine-tuning) sobre DynamiCrafter-interpolation en resolución 512x320, y fue entrenado para generar 16 fotogramas de vídeo a esa resolución a partir de un fotograma de contexto. Su relevancia radica en que aborda un problema específico y difícil: la interpolación de animación dibujada a mano, donde los métodos clásicos de interpolación de fotogramas fallan por los trazos no fotorrealistas y las deformaciones no lineales típicas del cartoon.

El repositorio de Hugging Face ocupa 12,2 GB y no incluye información sobre licencia, idiomas ni pipeline en los metadatos de la plataforma, aunque la model card menciona explícitamente el uso bajo licencia Apache-2.0. La model card es extremadamente escasa y remite al repositorio de GitHub para la implementación detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (video diffusion model), ajustado desde DynamiCrafter-interpolation (512x320) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera 16 fotogramas por clip a 512x320) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de texto no especifica idiomas en la model card) |
| Licencia | Apache-2.0 (según la model card); no indicada en los metadatos de Hugging Face |
| Formato de pesos | no disponible (el repo ocupa 12,2 GB) |

## Arquitectura y entrenamiento

ToonCrafter es un modelo de difusión de vídeo basado en el marco de DynamiCrafter, del que hereda la arquitectura de interpolación condicionada por imagen. El modelo fue ajustado (fine-tuned) desde el checkpoint DynamiCrafter-interpolation en resolución 512x320. La tarea concreta es la interpolación generativa: dadas dos imágenes de condición (primer y último fotograma) y un prompt de texto que describe la dinámica, el modelo genera 16 fotogramas de vídeo a 512x320 píxeles.

La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá del propio enfoque de interpolación generativa para cartoon. El paper asociado (arXiv:2405.17933) es la fuente recomendada para obtener información técnica detallada sobre el entrenamiento y la arquitectura interna.

## Capacidades

- Generación de vídeo corto por interpolación: produce clips de ~2 segundos (16 fotogramas a 8 FPS) a partir de dos imágenes de condición y un prompt de texto.
- Interpolación generativa de animación cartoon: diseñado específicamente para trazos y estilos de dibujo animado, no para vídeo fotorrealista.
- Condicionamiento por texto: acepta un prompt que describe la dinámica del movimiento entre los dos fotogramas.
- Generación de movimiento no lineal: capaz de sintetizar deformaciones y transiciones que los interpoladores clásicos no pueden resolver.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas en la model card.
- No dispone de modo de razonamiento (thinking mode), visión general ni audio.

## Casos de uso

- Postproducción de animación 2D: el modelo permite generar fotogramas intermedios entre dos keyframes dibujados a mano, reduciendo el trabajo de los animadores en secuencias de movimiento complejo donde la interpolación tradicional falla.
- Creación de animaciones cortas para redes sociales: con clips de ~2 segundos a 8 FPS, encaja en formatos de vídeo breve tipo loop o GIF animado para contenido de estilo cartoon.
- Prototipado rápido de secuencias animadas: un estudio puede generar una previsualización de una transición entre dos poses o escenarios antes de comprometer recursos en la animación final.
- Generación de contenido para videojuegos 2D: interpolación de sprites o secuencias de animación de personajes con estética cartoon para prototipos de juego.
- Educación y divulgación: creación de material animado breve a partir de dos ilustraciones didácticas y un prompt que describa la transición.
- Investigación en difusión de vídeo: el modelo sirve como base para experimentos sobre interpolación generativa y condicionamiento por texto en dominios no fotorrealistas, dado su ajuste desde DynamiCrafter.
- Generación de transiciones creativas: el prompt de texto permite dirigir la dinámica del movimiento, útil para efectos de transición entre escenas en piezas de animación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el tamaño del repo (12,2 GB) sugiere que los pesos en precisión completa o mixta requieren al menos esa magnitud de memoria, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (12,2 GB) indica que probablemente no cabe en GPUs de consumo con menos de 12-16 GB de VRAM, pero este dato no está documentado.
- Opciones de despliegue: la model card remite al repositorio de GitHub (https://github.com/ToonCrafter/ToonCrafter) para la implementación; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo). Existe una demo en Hugging Face Spaces y una integración en Replicate.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Longitud de clip | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToonCrafter (512x320) | Difusión de vídeo para interpolación cartoon | 512x320 | 16 fotogramas (~2 s a 8 FPS) | Apache-2.0 (según model card) | Hugging Face, GitHub, demo en Spaces y Replicate |
| DynamiCrafter-interpolation (512x320) | Difusión de vídeo para interpolación | 512x320 | no disponible | no disponible | Checkpoint base del que parte ToonCrafter |
| Modelos de interpolación clásica (p. ej., RIFE, FILM) | Interpolación de fotogramas no generativa | Variable | Variable | Variable | Ampliamente disponibles |

La comparativa se limita a estos referentes porque la model card no proporciona datos de rendimiento ni benchmarks frente a alternativas. No se dispone de información sobre parámetros, contexto o métricas comparativas de ToonCrafter frente a otros modelos de difusión de vídeo.

## Limitaciones y advertencias

- Los vídeos generados son muy cortos: aproximadamente 2 segundos a 8 FPS (16 fotogramas).
- El modelo no puede renderizar texto legible en los fotogramas generados.
- La parte de autoencoding del modelo es con pérdida (lossy), lo que produce artefactos de parpadeo (flickering) en el vídeo resultante.
- La model card indica que el modelo se desarrolló con fines de investigación; aunque menciona Apache-2.0, no existe un producto comercial oficial de ToonCrafter.
- Los metadatos de Hugging Face no indican licencia, idiomas ni pipeline, lo que genera ambigüedad sobre el uso comercial y el soporte multilingüe del prompt de texto.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un dominio específico (cartoon), su comportamiento fuera de ese estilo no está garantizado.
- Riesgo de alucinación visual: al ser un modelo generativo, puede inventar contenido en los fotogramas intermedios que no se corresponda con la intención del animador.
- No apto para generación de vídeo fotorrealista ni para tareas de lenguaje, tool calling o agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Barullo/Video2d
- Repositorio GitHub: https://github.com/ToonCrafter/ToonCrafter
- Paper: https://arxiv.org/abs/2405.17933
- Página del proyecto: https://doubiiu.github.io/projects/ToonCrafter/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Doubiiu/tooncrafter
- Demo en Replicate: https://replicate.com/fofr/tooncrafter
