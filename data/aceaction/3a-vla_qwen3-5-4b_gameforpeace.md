# AceAction/3A-VLA_Qwen3.5-4B_GameForPeace

## Resumen

3A-VLA_Qwen3.5-4B_GameForPeace es un modelo de visión-lenguaje-acción (VLA, Vision-Language-Action) obtenido por ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B. Lo publica el usuario AceAction en Hugging Face bajo licencia Apache 2.0 y con acceso restringido (gated), lo que obliga a aceptar condiciones antes de descargarlo. Su pipeline declarado es image-text-to-text y está orientado explícitamente al juego (game-playing) y a la segmentación, según las etiquetas del repositorio.

El modelo cuenta con 4.539.265.536 parámetros reales en formato safetensors y un repositorio de 17,6 GB. Está entrenado sobre el dataset 3a-vla/GameForPeace-VLA, lo que sugiere un ajuste específico para el dominio del videojuego Game for Peace (versión china de PUBG Mobile). La información pública disponible es muy limitada: no se detallan idiomas soportados, composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks.

Su relevancia actual reside en la tendencia de adaptar modelos pequeños (en torno a 4-5B parámetros) a tareas de agente visual en entornos interactivos, donde un modelo de este tamaño puede desplegarse con requisitos de hardware moderados frente a alternativas de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un modelo image-text-to-text de aproximadamente 5B parámetros según su ficha en Hugging Face. Sobre esa base se aplica un ajuste fino supervisado (SFT), tal como indica la etiqueta `sft` del repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset 3a-vla/GameForPeace-VLA ni si se aplicaron técnicas de RLHF o DPO posteriores.

Las etiquetas `game-playing` y `segmentation` apuntan a un uso como política visual para un agente dentro de un videojuego: interpretación de fotogramas y generación de acciones o máscaras de segmentación. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos) en la información proporcionada.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) mediante la librería transformers.
- Razonamiento visual orientado a entornos de juego, según la etiqueta `game-playing`.
- Segmentación, según la etiqueta `segmentation` del repositorio.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades de agente multi-paso: no documentadas explícitamente.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión adicional, audio: no disponibles.

## Casos de uso

- Agentes de juego automatizados: el modelo puede recibir fotogramas del juego Game for Peace y producir decisiones de acción, adecuado por su ajuste específico sobre el dataset GameForPeace-VLA.
- Investigación en modelos VLA: sirve como punto de partida para estudiar cómo un modelo de ~4,5B parámetros se adapta a tareas de percepción-acción en entornos interactivos.
- Segmentación de elementos de la escena: la etiqueta `segmentation` sugiere uso para identificar objetos o regiones relevantes en capturas del juego.
- Evaluación comparativa de políticas visuales: al estar construido sobre Qwen3.5-4B, permite comparar el efecto del SFT frente al modelo base en tareas de juego.
- Prototipado de asistentes visuales conversacionales: su naturaleza image-text-to-text permite construir demos de diálogo con imágenes en entornos controlados.
- Docencia y experimentación: su tamaño moderado y licencia Apache 2.0 facilitan su uso en entornos académicos para ilustrar pipelines de ajuste fino multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,54B parámetros, en fp16 se requieren aproximadamente 9 GB solo para pesos, a los que hay que sumar caché KV y overhead del runtime.
- GPU recomendadas: no disponibles en la información; por tamaño, cabría esperar GPUs con 16-24 GB o más, pero no se confirma.
- ¿Cabe en GPU consumer? No confirmado; dependería de la cuantización, que no se publica en el repositorio.
- Opciones de despliegue: transformers (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 3A-VLA_Qwen3.5-4B_GameForPeace | 4.539.265.536 | no disponible | apache-2.0 | SFT sobre Qwen3.5-4B para Game for Peace; acceso gated |
| Qwen/Qwen3.5-4B | ~5B (según ficha) | no disponible | no disponible en la información | Modelo base image-text-to-text |
| Qwen3.5-4B-GLB-3D-Coder | ~4B | no disponible | no disponible en la información | Ajuste fino para generar escenas Three.js y assets GLB |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa entre estos modelos.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Dominio muy específico: el ajuste SFT sobre GameForPeace-VLA puede degradar el rendimiento en tareas generales fuera del videojuego.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad ni comparaciones con alternativas.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable en modelos generativos sin datos de evaluación.
- Sesgos: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de documentación sobre el dataset de entrenamiento aconsejan revisar las condiciones del modelo base Qwen3.5-4B antes de producción.
- Contexto máximo no especificado: limita la planificación de despliegues con ventanas largas.
- Sin variantes cuantizadas publicadas: dificulta el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AceAction/3A-VLA_Qwen3.5-4B_GameForPeace
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog sobre Qwen3.5-4B-GLB-3D-Coder: https://www.mindstudio.ai/blog/qwen3-5-4b-glb-3d-coder-model
