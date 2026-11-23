# kentskooking/MiniMax-H3-AnimateDiff-LoRAs

## Resumen

MiniMax-H3-AnimateDiff-LoRAs es una colección de dos adaptadores LoRA publicados por el usuario kentskooking para el modelo base MiniMaxAI/MiniMax-H3, un sistema de generación de vídeo a partir de imagen (image-to-video) mediante el pipeline FL2VA. Los adaptadores están entrenados específicamente para inyectar movimiento de tipo AnimateDiff en el modelo base: uno genera transiciones controladas entre un primer y un último fotograma, y el otro produce bucles de movimiento continuo a partir de una única imagen inicial. El repositorio tiene un tamaño de 0,6 GB y emplea la librería `minimax-h3`, con integración declarada para ComfyUI.

La relevancia de esta publicación es acotada pero práctica: no se trata de un modelo fundacional, sino de un complemento de bajo rango (rank-16) que modifica el comportamiento del modelo base sin necesidad de reentrenarlo. Ambos LoRA se entrenaron con Ostris AI Toolkit sobre MiniMax H3 FL2VA, congelando el codificador de texto y aplicando los adaptadores únicamente a las proyecciones de atención y a las capas feed-forward del transformer principal y de los bloques token-refiner.

Al estar publicados con 0 descargas y 0 likes en el momento de la consulta, y sin licencia declarada ni idiomas especificados, se trata de un artefacto experimental de nicho orientado a flujos de trabajo de animación con ComfyUI, no a despliegues de producción generalistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre transformer de difusión MiniMax-H3 FL2VA |
| Parámetros totales | no disponible (repo de 0,6 GB; dos LoRA rank-16 con 208 capas adaptadas cada uno) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Pipeline | image-to-video |
| Librería | minimax-h3 |
| Integración | ComfyUI |
| Rank de los adaptadores | 16 |
| Capas adaptadas por LoRA | 208 (50 bloques transformer + 2 token-refiner) |
| Codificador de texto | congelado durante el entrenamiento |

## Arquitectura y entrenamiento

Los dos LoRA se entrenaron con Ostris AI Toolkit sobre MiniMax H3 FL2VA. Cada adaptador es de rango 16 y se aplica sobre cuatro proyecciones por bloque: la proyección combinada de query/key/value (`attn.qkv_proj`), la salida de atención (`attn.out_proj`) y las dos capas feed-forward (`mlp.fc1` y `mlp.fc2`). Esto cubre los 50 bloques principales del transformer (índices 0-49) y los dos bloques token-refiner (0-1), sumando 208 capas adaptadas por LoRA. El codificador de texto permaneció congelado, de modo que los adaptadores solo modifican la dinámica de generación de vídeo, no la comprensión del prompt.

El LoRA General AnimateDiff FLF 768 se entrenó durante 2.500 pasos de optimizador y está pensado para generar movimiento entre un primer y un último fotograma (FLF, first-last frame). El LoRA Single AnimateDiff Loop 768 se entrenó durante 2.000 pasos y produce bucles de movimiento a partir de una sola imagen inicial. Ambos funcionan con prompt vacío y son compatibles con el muestreo acelerado mediante Turbo LoRA o con el número completo de pasos. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un contexto de difusión de vídeo).

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) sobre el modelo base MiniMax-H3.
- Interpolación de movimiento entre un primer y un último fotograma (LoRA General AnimateDiff FLF 768), con fuerza ajustable de 1.0 a 2.0.
- Generación de bucles de movimiento continuo a partir de una única imagen inicial (LoRA Single AnimateDiff Loop 768).
- Funcionamiento con prompt vacío, lo que preserva los colores de la imagen de entrada según la model card.
- Compatibilidad con Turbo LoRA para muestreo rápido o con muestreo a pasos completos.
- Trigger opcional `animatediff` para el LoRA FLF y `pinkmorph` para el LoRA Loop (este último puede virar la escena hacia tonos rosados).
- Integración con ComfyUI.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión general ni audio.

## Casos de uso

- Transiciones controladas en animación: el LoRA FLF 768 permite definir un fotograma inicial y uno final y generar el movimiento intermedio, útil para storyboards animados o transiciones entre escenas con control preciso de los extremos.
- Bucles para vídeo de fondo o GIFs: el LoRA Single Loop 768 genera movimiento cíclico a partir de una sola imagen, adecuado para fondos animados en webs, presentaciones o contenido para redes sociales.
- Previsualización de animaciones en pipelines de ComfyUI: al integrarse en ComfyUI, se puede encadenar con otros nodos (upscaling, interpolación de frames) para prototipar secuencias animadas antes de un render final.
- Efectos de movimiento estilizado: con fuerza de LoRA elevada (hasta 2.0 en el FLF) se obtienen movimientos más intensos entre fotogramas, aplicable a efectos visuales experimentales o motion graphics.
- Contenido para videojuegos o prototipos interactivos: los bucles de movimiento continuo sirven como sprites animados o texturas dinámicas en fases de preproducción.
- Experimentación en investigación de difusión de vídeo: al ser adaptadores rank-16 sobre un modelo base concreto, permiten estudiar cómo afecta la inyección de movimiento a las capas de atención y feed-forward sin reentrenar el modelo completo.
- Automatización de contenido con prompt vacío: al funcionar sin prompt, se puede usar en flujos por lotes donde solo se aporta la imagen y se busca preservar la paleta original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para los LoRA; depende enteramente del modelo base MiniMax-H3, que no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. Al ser adaptadores sobre un modelo de difusión de vídeo, se presupone necesidad de GPU con VRAM suficiente para el modelo base, pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (declarado en los tags y en la model card), con la librería `minimax-h3`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kentskooking/MiniMax-H3-AnimateDiff-LoRAs | LoRA sobre MiniMax-H3 (image-to-video) | rank-16, 208 capas adaptadas | no disponible | no disponible | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3 (modelo base) | Modelo de difusión image-to-video | no disponible | no disponible | no disponible | Hugging Face |
| Otros LoRA de AnimateDiff para modelos de vídeo | Adaptadores de movimiento | variable | no disponible | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- El LoRA Single Loop puede virar la escena hacia tonos rosados si se usa el trigger `pinkmorph`; es un efecto no deseado en muchos contextos.
- El funcionamiento óptimo requiere prompt vacío para preservar colores, lo que limita el control semántico sobre el resultado.
- Al depender del modelo base MiniMax-H3, hereda todas sus limitaciones (sesgos, alucinaciones visuales, artefactos de movimiento), que no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.
- No se especifican idiomas soportados; la interacción con el modelo base podría estar limitada a los idiomas que este soporte, dato no disponible.
- Los adaptadores están entrenados para tareas muy concretas (FLF y loop); no se espera que funcionen bien fuera de esos escenarios.
- No hay información sobre estabilidad en producción, latencia ni requisitos de VRAM, lo que dificulta planificar un despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kentskooking/MiniMax-H3-AnimateDiff-LoRAs
- LoRA General AnimateDiff FLF 768: https://huggingface.co/kentskooking/MiniMax-H3-AnimateDiff-LoRAs/blob/main/H3_i2v_General_AnimateDiff_FLF_768.safetensors
- LoRA Single AnimateDiff Loop 768: https://huggingface.co/kentskooking/MiniMax-H3-AnimateDiff-LoRAs/blob/main/H3_i2v_Single_AnimateDiff_Loop_768.safetensors
- Modelo base MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Ostris AI Toolkit (herramienta de entrenamiento): https://github.com/ostris/ai-toolkit
