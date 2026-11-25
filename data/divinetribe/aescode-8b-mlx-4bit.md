# divinetribe/AesCode-8B-MLX-4bit

## Resumen

AesCode-8B-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo multimodal AesCode-8B de Microsoft, orientado a la generación de artefactos visuales (diapositivas, pósteres, paneles de control, informes) como HTML/CSS estructurado, editable y verificable a partir de una imagen de referencia o de una instrucción textual. El modelo parte de Qwen3-VL-8B-Instruct y ha sido entrenado con SFT de arranque en frío seguido de GDPO (un algoritmo de optimización por preferencias) sobre siete canales de recompensa, separando requisitos semánticos de señales visuales mediante supervisión estructurada en grafo y recompensas desacopladas entre modalidades.

La arquitectura es `Qwen3VLForConditionalGeneration` (torre de visión `qwen3_vl` más decodificador `qwen3_vl_text`) con 8.767.123.696 parámetros totales. Esta conversión concreta, publicada por el usuario divinetribe, mantiene intacta la torre de visión para que el modelo pueda leer capturas de pantalla o diseños y devolver el HTML/CSS correspondiente, y aplica una cuantización mixta de 5.256 bits por peso de media (grupo de tamaño 64, capas sensibles en mayor precisión) que reduce el repositorio a 5,8 GB en dos shards.

Su relevancia práctica radica en que permite ejecutar un modelo visión-lenguaje de casi 9.000 millones de parámetros en equipos Apple Silicon con 8 GB de memoria unificada, manteniendo la capacidad de lectura de imágenes que el modelo base necesita para su tarea principal. La licencia Apache-2.0 del checkpoint original se conserva, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje `Qwen3VLForConditionalGeneration` (torre de visión `qwen3_vl` + decodificador `qwen3_vl_text`) |
| Parametros totales | 8.767.123.696 (8,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | 4 bits mixta (5,256 bits por peso de media, grupo de tamaño 64, capas sensibles en mayor precisión); existen variantes bf16 y 8 bits del mismo autor |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, dos shards, 5,8 GB en total) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso construido sobre Qwen3-VL-8B-Instruct. La torre de visión `qwen3_vl` procesa las imágenes y alimenta un decodificador de texto `qwen3_vl_text` que genera la salida. El entrenamiento del checkpoint original de Microsoft combina una fase de SFT de arranque en frío con una fase de optimización GDPO que agrega siete canales de recompensa distintos; la supervisión se organiza de forma estructurada en grafo para separar los requisitos semánticos (contenido, restricciones textuales, estructura) de las señales puramente visuales (maquetación, estilo), y las recompensas entre modalidades se desacoplan para evitar que una penalice a la otra durante la optimización.

La conversión a MLX aplica cuantización de 4 bits con grupo de tamaño 64 y precisión mixta, manteniendo las capas sensibles en mayor resolución y preservando la torre de visión sin cuantizar de forma agresiva. El autor indica que esta variante de 4 bits superó la misma prueba de lectura de pose que las versiones bf16 y 8 bits antes de publicarse, y que el modelo sigue respondiendo correctamente sobre los píxeles reales. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset en la información proporcionada.

## Capacidades

- Generación de código HTML y CSS a partir de una imagen de referencia (captura de pantalla, diseño, póster) o de una instrucción textual.
- Creación de artefactos visuales ricos en información: diapositivas, pósteres, paneles de control e informes, en formato estructurado y editable.
- Comprensión de imágenes y respuesta a preguntas visuales (por ejemplo, control de calidad de pose en un fotograma de un juego de movimiento).
- Generación de texto a partir de imágenes (descripciones, texto alternativo).
- Generación de texto sin imagen (modo solo texto con `num_images=0`).
- Conversación multiturno (etiqueta `conversational`).
- Capacidad de razonamiento guiado por requisitos semánticos y restricciones visuales simultáneas, fruto del entrenamiento con recompensas desacopladas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Reconstrucción de interfaces a partir de capturas: se introduce una imagen de una pantalla o maqueta y el modelo devuelve un único archivo HTML con el CSS embebido, útil para prototipado rápido de front-end en equipos Apple Silicon.
- Generación de pósteres e infografías: a partir de una descripción textual, el modelo produce HTML/CSS con estructura verificable, lo que permite iterar sobre el resultado editando el código en lugar de regenerar la imagen completa.
- Creación de paneles de control y informes: el modelo genera maquetaciones con secciones, gráficos y jerarquía visual que pueden integrarse en un pipeline de generación de documentos internos.
- Texto alternativo automatizado: dado un conjunto de imágenes, el modelo produce descripciones textuales para accesibilidad, aprovechando la torre de visión intacta incluso en la variante de 4 bits.
- Control de calidad visual en aplicaciones de visión por computador: verificación de que una figura superpuesta corresponde a una pose humana correcta (sin miembros extra, rodillas cruzadas ni articulaciones invertidas), como demuestra el ejemplo de la model card.
- Desarrollo local sin conexión en portátiles Mac: al ocupar 5,8 GB y requerir unos 8 GB de memoria unificada, permite trabajar con un modelo visión-lenguaje en un equipo de gama consumer sin depender de servicios en la nube.
- Asistencia en diseño iterativo: el modelo lee una captura del estado actual de una interfaz y propone el HTML/CSS actualizado, lo que encaja en flujos de trabajo de edición rápida sobre maquetas.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación propia del artículo de AesCode (arXiv:2610.18860): 300 prompts de infografía puntuados en una pista programática `Rule` (Text, Bound, Chart) y una lista de verificación `Visual` (Content, Layout, Style), con `Overall` como media de ambas y promediado sobre tres generaciones sin selección.

| Modelo | Overall | Rule | Notas |
|---|---|---|---|
| AesCode-8B (bf16, referencia del artículo) | 82,94 | 90,07 | Mejora Visual en 31,1 puntos sobre Qwen3-VL-8B-Instruct con referencia |
| GPT-5.5 (con referencia) | 81,28 | No disponible | Fila de la misma tabla del artículo |
| Claude Opus 4.8 (con referencia) | 80,39 | No disponible | Fila de la misma tabla del artículo |
| AesCode-8B-MLX-4bit | No disponible | No disponible | El autor advierte que la cuantización de 4 bits intercambia precisión por tamaño y que las puntuaciones exactas variarán |

No se han publicado resultados de benchmarks específicos para esta conversión de 4 bits en la información disponible. Los números de la tabla corresponden al checkpoint original y están citados del artículo y de la model card.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 8 GB para la variante de 4 bits, según indica el autor; el repositorio ocupa 5,8 GB en disco.
- GPU recomendadas: no se especifican en la información proporcionada; el formato MLX está pensado para Apple Silicon (series M1, M2, M3, M4).
- Compatibilidad con GPU consumer: el autor indica que esta es la compilación más pequeña, pensada para máquinas de 8 GB; encaja en Mac con memoria unificada de 8 GB o superior. Para GPU NVIDIA no se ofrece una variante MLX equivalente.
- Opciones de despliegue: `mlx-vlm` (librería indicada en la model card), con API `load`, `apply_chat_template` y `generate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B-MLX-4bit (esta ficha) | 8,8B | No disponible | Visión + generación de HTML/CSS, cuantizado a 4 bits MLX | Apache-2.0 | Hugging Face, formato MLX |
| AesCode-8B-MLX-bf16 (mismo autor) | 8,8B | No disponible | Misma tarea, precisión completa | Apache-2.0 | Hugging Face, formato MLX |
| AesCode-8B-MLX-8bit (mismo autor) | 8,8B | No disponible | Misma tarea, cuantización intermedia | Apache-2.0 | Hugging Face, formato MLX |
| microsoft/AesCode-8B (original) | 8,8B | No disponible | Misma tarea, pesos sin cuantizar | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8B | No disponible | Visión-lenguaje general | No disponible | Hugging Face |

La comparación con alternativas de otros fabricantes para la misma tarea (generación de HTML/CSS a partir de imágenes) no está disponible en la información proporcionada más allá de las filas de GPT-5.5 y Claude Opus 4.8 citadas en el artículo, que son modelos propietarios sin pesos publicados.

## Limitaciones y advertencias

- Alucinación: como todo modelo generativo, puede producir HTML/CSS que no corresponde fielmente a la imagen de entrada; el propio artículo introduce una pista de evaluación programática precisamente para detectar estos fallos.
- Pérdida de precisión por cuantización: el autor reconoce que la variante de 4 bits intercambia exactitud por tamaño; las puntuaciones del artículo corresponden al checkpoint bf16 y no deben extrapolarse sin verificación a esta conversión.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al heredar el entrenamiento de Qwen3-VL-8B-Instruct, arrastra los sesgos del corpus original, que no se detalla.
- Idiomas: no se especifica la cobertura lingüística; la model card está en inglés y los ejemplos de uso también, por lo que el soporte de otros idiomas, incluido el castellano, no está confirmado.
- Contexto: la longitud máxima de contexto no se indica, lo que impide planificar conversaciones o documentos de gran extensión con garantías.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del checkpoint base Qwen3-VL-8B-Instruct, cuya licencia no se detalla en la información disponible.
- Dependencia de plataforma: el formato MLX solo se ejecuta de forma nativa en Apple Silicon; para otros entornos habría que recurrir a los pesos originales de Microsoft o a conversiones distintas.
- Advertencia sobre la model card: incluye estadísticas de descargas y estrellas de GitHub presentadas como "live-stats" que no forman parte de la evaluación técnica del modelo y deben tratarse con cautela.
- Uso en producción: al no haber benchmarks de la variante de 4 bits ni datos de latencia, se recomienda validar la calidad en el dominio concreto antes de desplegarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-8B-MLX-4bit
- Variante bf16: https://huggingface.co/divinetribe/AesCode-8B-MLX-bf16
- Variante 8 bits: https://huggingface.co/divinetribe/AesCode-8B-MLX-8bit
- Checkpoint original de Microsoft: https://huggingface.co/microsoft/AesCode-8B
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Artículo (arXiv:2610.18860): https://arxiv.org/abs/2610.18860
- Página del proyecto: https://microsoft.github.io/AesCode/
- Código de Microsoft: https://github.com/microsoft/AesCode
- Repositorio del autor de la conversión: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
