# AmirHossein-razlighi/next-best-move

## Resumen

next-best-move es una colección de adaptadores LoRA publicada por AmirHossein-razlighi que transforma modelos de difusión visual preentrenados en planificadores de dominios discretos. En lugar de generar texto con la siguiente jugada, el modelo dibuja sobre la imagen del estado del problema: marca en azul el origen de una pieza y en rojo su destino. El trabajo se describe en el artículo "Learning the Next Best Move with Visual Diffusion Models" (arXiv:2611.30879) y cubre ajedrez, Go 19x19, Connect Four, billar, N-queens, caminos mínimos y terrenos con costes ocultos.

La relevancia técnica está en reformular la planificación como un problema de generación de imagen (o vídeo) condicionada, aprovechando la infraestructura de difusión y flow matching ya existente. Los adaptadores de imagen se montan sobre Qwen-Image-2.1 y los de vídeo sobre Wan2.2-TI2V-5B, de modo que el modelo aprende a predecir varias jugadas y los estados resultantes en un solo clip. El repositorio ocupa 7,9 GB y se distribuye con licencia MIT, aunque los modelos base conservan sus propias licencias.

Es un artefacto de investigación, no un asistente conversacional: no hay pipeline de texto, no se declaran idiomas y no se han publicado cifras de benchmarks en la información disponible. Su interés radica en explorar si los modelos generativos visuales pueden adquirir razonamiento procedimental sobre tableros y geometrías, y en ofrecer un punto de partida reproducible con código, dataset y pesos LoRA separados por tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelos de difusión con flow matching (Qwen-Image-2.1 para imagen; Wan2.2-TI2V-5B para vídeo) |
| Parámetros totales | no disponible (solo se publican los pesos LoRA; el tamaño del repositorio es de 7,9 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la salida es visual, no textual) |
| Licencia | MIT para los pesos LoRA; los modelos base mantienen sus licencias propias |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors` por carpeta) |

## Arquitectura y entrenamiento

Cada carpeta del repositorio contiene un único archivo `pytorch_lora_weights.safetensors` que se aplica sobre un modelo base concreto. Para las tareas de imagen se usa Qwen-Image-2.1 y para las de vídeo Wan2.2-TI2V-5B, ambos modelos de difusión con formulación de flow matching. La innovación metodológica consiste en representar la acción como una anotación pictórica sobre el estado: el punto de partida en azul y el de llegada en rojo, de forma que la red aprende a "dibujar" la transición válida en lugar de emitir un token de acción.

El repositorio cubre doce adaptadores: `chess_image`, `chess_video`, `shortest_path_image`, `shortest_path_video`, `terrain_image`, `terrain_video`, `connect4_image`, `connect4_video`, `go_image`, `billiards_image`, `billiards_video` y `nqueens_image`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; el dataset asociado es `AmirHossein-razlighi/next-best-move`. La evaluación se realiza con el paquete `nbm.evaluate`, que admite ejecución distribuida con `torchrun` y un parámetro `--steps` para controlar el número de pasos de muestreo.

## Capacidades

- Generación visual de la siguiente acción en dominios discretos: ajedrez, Go 19x19, Connect Four, billar, N-queens, caminos mínimos y terrenos con costes ocultos.
- Anotación espacial de movimientos mediante marcas azules (origen) y rojas (destino) sobre la imagen del estado.
- Planificación multi-paso en las variantes de vídeo, que dibujan varias jugadas y los estados intermedios en un solo clip.
- Razonamiento procedimental sobre geometría y reglas: trayectorias de bolas, restricciones de columnas en N-queens, conectividad en laberintos.
- Adaptación ligera mediante LoRA, lo que permite cargar y descargar cada habilidad de forma independiente.
- No soporta tool calling, function calling ni razonamiento multi-turno conversacional.
- No se declaran capacidades multilingües ni modos de "thinking" textuales.

## Casos de uso

- Investigación en planificación visual: comparar si un modelo de difusión aprende reglas de tablero frente a un transformer autoregresivo, usando los adaptadores de ajedrez y Go como bancos de prueba controlados.
- Generación de datos sintéticos de ajedrez: producir pares estado-movimiento anotados visualmente para aumentar datasets de entrenamiento de motores o de modelos de visión que detecten jugadas.
- Enseñanza interactiva de reglas: en N-queens o Connect Four, el modelo puede ilustrar sobre el tablero por qué una casilla es la siguiente jugada válida, útil en materiales didácticos.
- Simulación de trayectorias físicas: el adaptador de billar dibuja el origen y el destino de la bola, aprovechable para prototipos de predicción de colisiones en entornos simplificados.
- Planificación sobre mapas con costes ocultos: el adaptador `terrain_image` sirve para estudiar cómo un modelo visual incorpora información no visible en la imagen, un problema relevante en robótica y videojuegos.
- Evaluación de modelos generativos como planificadores: usar `nbm.evaluate` con el split de test para medir la tasa de acierto de la jugada dibujada y comparar configuraciones de pasos de muestreo.
- Prototipado de interfaces de análisis de tableros: integrar el LoRA en una herramienta que superponga la jugada sugerida sobre una captura del tablero para revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base. Qwen-Image-2.1 y Wan2.2-TI2V-5B son modelos de difusión de gran tamaño y el repositorio de LoRA ocupa 7,9 GB, por lo que se requiere una GPU con memoria suficiente para el modelo base completo más los adaptadores.
- GPU recomendadas: no disponible en la información proporcionada; por el perfil de los modelos base, cabe esperar GPUs de centro de datos (A100, H100) para las variantes de vídeo.
- Compatibilidad con GPU de consumo: no confirmada; las variantes de imagen podrían ser viables en GPUs de gama alta con cuantización, pero no se documenta.
- Opciones de despliegue: la evaluación oficial se realiza con el repositorio `nbm` mediante `torchrun --standalone --nproc_per_node 2 -m nbm.evaluate`; la carga de pesos sigue el formato `diffusers`/`safetensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| next-best-move | LoRA de difusión para planificación visual | no disponible (repo de 7,9 GB) | no disponible | MIT (LoRA) | Hugging Face, código y dataset públicos |
| Qwen-Image-2.1 | Difusión texto-a-imagen (base) | no disponible | no disponible | licencia propia de Qwen | Hugging Face |
| Wan2.2-TI2V-5B | Difusión texto-imagen-a-vídeo (base) | ~5B (según nombre del modelo) | no disponible | licencia propia de Wan-AI | Hugging Face |

No se dispone de comparativas con otros planificadores visuales de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: no hay pipeline declarado, ni idiomas, ni métricas publicadas, lo que dificulta evaluar su robustez antes de usarlo.
- La salida es visual; no produce texto ni acciones en formato estructurado, por lo que requiere un paso de interpretación de la imagen para integrarse en un sistema automático.
- El rendimiento depende críticamente del modelo base, cuyas licencias no son MIT y deben revisarse por separado para uso comercial.
- Riesgo de alucinación visual: el modelo puede dibujar movimientos ilegales o marcas inconsistentes, especialmente en tableros grandes como Go 19x19.
- Solo se cubren los dominios entrenados; no generaliza a otros juegos o geometrías sin reentrenamiento.
- No se documentan sesgos, pero al ser un modelo entrenado sobre puzzles sintéticos, su comportamiento fuera de esa distribución es incierto.
- El tamaño del repositorio (7,9 GB) y la necesidad de cargar modelos base de difusión implican costes de almacenamiento y cómputo considerables.
- No hay garantías de soporte ni mantenimiento; las descargas y los likes son cero en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmirHossein-razlighi/next-best-move
- Artículo: https://arxiv.org/abs/2611.30879
- Página del proyecto: https://amirhossein-razlighi.github.io/next_best_move/
- Código: https://github.com/amirhossein-razlighi/next_best_move
- Dataset: https://huggingface.co/datasets/AmirHossein-razlighi/next-best-move
- Modelo base de imagen: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base de vídeo: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
