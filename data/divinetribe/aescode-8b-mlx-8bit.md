# divinetribe/AesCode-8B-MLX-8bit

## Resumen

AesCode-8B-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo multimodal AesCode-8B de Microsoft, orientada a la generación de artefactos visuales (diapositivas, carteles, paneles de control, informes) como HTML/CSS estructurado, editable y verificable. El modelo parte de Qwen3-VL-8B-Instruct y ha sido entrenado con SFT de arranque en frío seguido de GDPO sobre siete canales de recompensa, separando requisitos semánticos de señales visuales mediante supervisión estructurada en grafo y recompensas desacopladas entre modalidades. Esta conversión concreta la publica el usuario divinetribe y su único trabajo es la cuantización a 8 bits en MLX, manteniendo intacta la torre de visión.

El modelo resuelve el problema de convertir una captura de pantalla, un diseño o una imagen en código HTML/CSS fiel, algo relevante para flujos de trabajo de prototipado rápido y automatización de front-end en hardware Apple Silicon. Con 8.767.123.696 parámetros y pesos de 8 bits (8,993 bits por peso, 9,2 GB en dos shards, group size 64), está pensado para máquinas de 16 GB de memoria unificada, mientras que la versión bf16 queda para quienes priorizan calidad máxima.

La relevancia actual radica en que el modelo base reporta resultados superiores a GPT-5.5 y Claude Opus 4.8 en la evaluación propia del paper de AesCode en generación de infografías, y esta cuantización permite ejecutarlo localmente en portátiles Apple sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (torre de visión `qwen3_vl` + decodificador `qwen3_vl_text`) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (8,993 bits por peso, group size 64); existen versiones bf16 y 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, dos shards, 9,9 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo vision-language: una torre de visión `qwen3_vl` que alimenta un decodificador de texto `qwen3_vl_text`, empaquetado como `Qwen3VLForConditionalGeneration`. Parte de Qwen3-VL-8B-Instruct de Alibaba y fue entrenado por Microsoft con un esquema de SFT de arranque en frío seguido de GDPO (una variante de optimización por preferencias) sobre siete canales de recompensa, con supervisión estructurada en grafo y recompensas desacopladas entre modalidades para separar los requisitos semánticos de las señales visuales.

La innovación principal es el entrenamiento orientado a generar artefactos visuales como HTML/CSS editable y verificable, en lugar de imágenes rasterizadas. La conversión a MLX 8 bits conserva la torre de visión intacta y, según el autor, superó la misma prueba de lectura de pose que la versión bf16 con resultados equivalentes, lo que sugiere que la cuantización no degradó de forma apreciable la capacidad visual en esa comprobación concreta. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de código HTML/CSS a partir de imágenes: reconstruye capturas de pantalla, diseños y mockups como un único archivo HTML.
- Generación de artefactos visuales ricos en información: diapositivas, carteles, paneles de control e informes en formato estructurado y editable.
- Comprensión de imágenes y razonamiento visual: describe poses, detecta elementos superpuestos y responde preguntas de control de calidad sobre figuras.
- Generación de texto alternativo (alt-text) para imágenes y diseños.
- Generación de texto sin imagen (modo solo texto con `num_images=0`).
- Conversación multi-turno.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Prototipado de front-end a partir de diseños: se introduce una captura de un mockup y el modelo devuelve un archivo HTML único con el CSS embebido, listo para revisar y refinar en el navegador. Es adecuado porque su entrenamiento está específicamente orientado a esta tarea.
- Reconstrucción de interfaces existentes: dada una captura de una aplicación o web, el modelo genera el marcado correspondiente para migraciones, rediseños o documentación técnica del layout.
- Generación automática de infografías y diapositivas: a partir de una imagen de referencia o de una descripción, produce HTML estructurado con contenido, límites y gráficos, útil para informes y presentaciones reproducibles.
- Accesibilidad y alt-text: procesa lotes de imágenes para generar descripciones textuales y marcado accesible, aprovechando su ruta de visión para interpretar contenido visual.
- Control de calidad visual en aplicaciones de cámara o juegos de movimiento: el modelo evalúa si una pose dibujada sobre una escena de cámara es anatómicamente correcta y detecta miembros extra o mal colocados, como demuestra el ejemplo de la model card.
- Automatización de paneles de control internos: convierte bocetos o capturas de paneles existentes en HTML/CSS editable para integrarlo en herramientas internas de monitorización.
- Ejecución local en portátiles Apple: al ocupar 9,2 GB en 8 bits, permite flujos de generación de código visual sin conexión y sin enviar diseños confidenciales a servicios externos.

## Benchmarks y rendimiento

Los datos proceden de la evaluación propia del paper de AesCode sobre 300 prompts de infografías, con una pista programática `Rule` (Text, Bound, Chart) y una lista de verificación `Visual` (Content, Layout, Style); `Overall` es la media de ambas, promediada sobre tres generaciones sin selección.

| Modelo | Overall | Rule | Notas |
|---|---|---|---|
| AesCode-8B | 82,94 | 90,07 | Mejora Visual +31,1 puntos sobre Qwen3-VL-8B de referencia |
| GPT-5.5 (reference-conditioned) | 81,28 | no disponible | Fila de la misma tabla del paper |
| Claude Opus 4.8 (reference-conditioned) | 80,39 | no disponible | Fila de la misma tabla del paper |

El autor advierte que la cuantización a 8 bits intercambia algo de precisión por tamano, por lo que las puntuaciones exactas pueden variar ligeramente respecto a las del modelo base. No se han publicado resultados de benchmarks específicos de esta conversión MLX 8 bits.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,2 GB de pesos en 8 bits; con overhead de ejecución, encaja en máquinas de 16 GB de memoria unificada, tal como indica el autor.
- GPU recomendadas: Apple Silicon (serie M) con al menos 16 GB de memoria unificada; el modelo está empaquetado para `mlx-vlm` y no para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de 16 GB o más; no está pensado para GPUs NVIDIA de consumo en este formato.
- Opciones de despliegue: `mlx-vlm` (librería oficial de esta conversión); para otros backends habría que usar el checkpoint original de Microsoft o las versiones bf16/4 bits del mismo autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B-MLX-8bit (esta ficha) | 8,77B | no disponible | Visión + generación de HTML/CSS, cuantizado MLX 8 bits | Apache-2.0 | Hugging Face (divinetribe) |
| AesCode-8B (Microsoft) | 8,8B | no disponible | Visión + generación de HTML/CSS, pesos originales | Apache-2.0 | Hugging Face (microsoft) |
| Qwen3-VL-8B-Instruct | 8B | no disponible | Visión-lenguaje general | no disponible en la información proporcionada | Hugging Face (Qwen) |
| AesCode-8B-MLX-bf16 / 4bit | 8,8B | no disponible | Misma tarea, calidad completa o menor tamano | Apache-2.0 | Hugging Face (divinetribe) |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al heredar el entrenamiento de Qwen3-VL y AesCode, puede reproducir sesgos de sus datasets, no documentados aquí.
- Riesgo de alucinación: el modelo genera HTML/CSS plausible que puede no corresponder fielmente al diseño de entrada; conviene validar visualmente la salida antes de usarla en producción.
- La cuantización a 8 bits introduce una pérdida de precisión respecto a bf16; el autor reconoce que las puntuaciones de benchmarks pueden moverse ligeramente.
- Limitaciones de contexto e idioma: no se documentan la longitud de contexto ni los idiomas soportados, lo que impide garantizar un comportamiento multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de los modelos base (Qwen3-VL-8B-Instruct y AesCode-8B); conviene revisar sus términos.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a Apple Silicon; para CUDA u otros entornos hay que recurrir al checkpoint original.
- El repositorio tiene muy pocas descargas (342) y ningún "like", por lo que la validación comunitaria de esta conversión concreta es escasa.
- La model card incluye estadísticas promocionales del proyecto del autor (estrellas de GitHub, descargas totales) que no constituyen evidencia técnica del rendimiento del modelo.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/divinetribe/AesCode-8B-MLX-8bit
- Versión bf16: https://huggingface.co/divinetribe/AesCode-8B-MLX-bf16
- Versión 4 bits: https://huggingface.co/divinetribe/AesCode-8B-MLX-4bit
- Modelo original de Microsoft: https://huggingface.co/microsoft/AesCode-8B
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper (arXiv:2610.18860): https://arxiv.org/abs/2610.18860
- Página del proyecto: https://microsoft.github.io/AesCode/
- Código de Microsoft: https://github.com/microsoft/AesCode
- Repositorio del autor (Claude Code Local): https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
