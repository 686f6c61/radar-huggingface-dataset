# divinetribe/AesCode-8B-MLX-8bit

## Resumen

AesCode-8B es un modelo multimodal vision-lenguaje especializado en la generación de artefactos visuales ricos en información (presentaciones, carteles, paneles de control, informes) codificados como HTML/CSS estructurado, editable y verificable. Lo desarrolla Microsoft, partiendo de Qwen3-VL-8B-Instruct, y se entrena con SFT de arranque en frío seguido de GDPO sobre siete canales de recompensa. La ficha que nos ocupa, sin embargo, no es el modelo original: es una cuantización a 8 bits en formato MLX realizada por el usuario `divinetribe`, pensada para ejecutarse en Apple Silicon mediante `mlx-vlm`.

El checkpoint original `microsoft/AesCode-8B` se distribuye bajo licencia Apache-2.0 y emplea la arquitectura `Qwen3VLForConditionalGeneration`, con una torre de visión `qwen3_vl` que alimenta un decodificador `qwen3_vl_text`. El total de parámetros asciende a 8.767.123.696 (8,8B), y esta conversión mantiene intacta la torre de visión para preservar la capacidad de leer diseños y capturas de pantalla.

La relevancia de esta variante concreta es práctica: reduce el peso a 9,2 GB en dos shards con 8,993 bits por peso y tamaño de grupo 64, lo que permite ejecutar un modelo multimodal de 8,8B en máquinas Apple con 16 GB de memoria unificada. Es, por tanto, una opción de despliegue local para generación de código visual en hardware de consumo, a costa de una ligera pérdida de precisión frente a la versión bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (torre de visión `qwen3_vl` + decodificador `qwen3_vl_text`) |
| Parametros totales | 8.767.123.696 (8,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (8,993 bits por peso, group size 64); existen variantes bf16 y 4-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), dos shards, 9,2 GB; repo de 9,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3-VL: una torre de visión que codifica imágenes y las proyecta en el espacio del decodificador de texto, que genera la salida. AesCode parte de Qwen3-VL-8B-Instruct y se entrena en dos fases: un SFT de arranque en frío y después GDPO (una variante de optimización por preferencias con múltiples recompensas) sobre siete canales de recompensa. La innovación declarada por los autores es la separación entre requisitos semánticos y señales visuales mediante supervisión estructurada en grafo y recompensas cross-modales desacopladas, orientada a que el modelo produzca HTML/CSS que cumpla tanto el contenido como el aspecto visual.

Esta conversión concreta no reentrena nada: solo cuantiza a 8 bits los pesos del checkpoint de Microsoft y conserva la torre de visión sin tocar. El autor reporta una comprobación cualitativa de lectura de pose sobre una imagen de un juego de movimiento, en la que la versión de 8 bits ofrece la misma interpretación que la bf16 (figura humana de pie, rodillas ligeramente flexionadas, sin extremidades extra, articulaciones anatómicamente colocadas), lo que sugiere que la cuantización no degradó la ruta visual en ese caso. No se documentan datos sobre número de tokens de entrenamiento, composición del dataset ni detalles del RLHF más allá de lo indicado.

## Capacidades

- Generación de HTML/CSS estructurado a partir de una descripción textual o de una imagen de referencia (captura, diseño, boceto).
- Comprensión de imágenes: lectura de capturas de pantalla, diseños y fotografías, con capacidad de responder preguntas sobre el contenido visual.
- Generación de texto y conversación multi-turno en modo texto (con `num_images=0`).
- Generación de artefactos visuales ricos en información: presentaciones, carteles, paneles de control e informes.
- Producción de alt-text a partir de imágenes.
- Verificación de cumplimiento visual y semántico: el modelo está entrenado para que la salida sea verificable frente a los requisitos del prompt.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Reconstrucción de interfaces a partir de capturas: se introduce una imagen de una pantalla o diseño y el modelo devuelve un único archivo HTML con el CSS embebido, útil para prototipado rápido de front-end y para convertir mockups en código base.
- Generación de paneles de control e informes: a partir de una descripción de métricas y estructura, el modelo produce HTML/CSS con tablas, gráficos y disposición visual, adecuado para herramientas internas de reporting que necesitan salida editable.
- Creación de presentaciones y carteles: el modelo genera diapositivas o carteles como HTML estructurado, lo que permite editarlos con herramientas web y exportarlos a PDF sin depender de software de diseño.
- Accesibilidad y alt-text: dado un conjunto de imágenes, el modelo genera descripciones textuales para atributos `alt`, integrable en pipelines de publicación de contenido.
- Control de calidad visual automatizado: el modelo puede evaluar si una imagen cumple ciertos requisitos (por ejemplo, si una pose es anatómicamente correcta o si un diseño respeta una guía de estilo), como demuestra el ejemplo de lectura de pose de la model card.
- Prototipado local en Apple Silicon: al caber en 16 GB de memoria unificada, permite a desarrolladores con un MacBook probar flujos de visión-código sin GPU dedicada ni servicios en la nube, usando `mlx-vlm`.
- Generación de código asistida por imagen en editores: integrable en herramientas que reciben una captura y devuelven el fragmento HTML/CSS correspondiente, con la ventaja de que la salida es verificable y estructurada.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación del paper de AesCode (arXiv:2610.18860) sobre el checkpoint original de 8B, no de esta cuantización de 8 bits. La evaluación usa 300 prompts de infografía, con una pista programática `Rule` (Text, Bound, Chart) y una lista de verificación `Visual` (Content, Layout, Style); `Overall` es la media de ambas, promediada sobre tres generaciones sin selección.

| Modelo | Overall | Rule | Notas |
|---|---|---|---|
| AesCode-8B (original) | 82,94 | 90,07 | Mejora Visual +31,1 puntos sobre Qwen3-VL-8B de referencia |
| GPT-5.5 (referencia) | 81,28 | no disponible | Fila del mismo cuadro del paper |
| Claude Opus 4.8 (referencia) | 80,39 | no disponible | Fila del mismo cuadro del paper |
| Esta cuantización 8-bit MLX | no disponible | no disponible | El autor indica que las puntuaciones exactas pueden variar ligeramente |

No se han publicado resultados de benchmarks específicos de esta conversión a 8 bits en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 9,2 GB de pesos en dos shards; con overhead de ejecución, encaja en máquinas con 16 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA ni CUDA.
- GPU recomendadas: no aplica; el runtime es `mlx-vlm` sobre chips Apple (M1/M2/M3/M4 y variantes Pro/Max/Ultra). Para 16 GB conviene la variante 8-bit; para máquinas con más memoria, la bf16 ofrece calidad completa.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en Apple Silicon de gama consumer con 16 GB; no se documenta soporte para RTX 4090 u otras GPU de consumo NVIDIA.
- Opciones de despliegue: `mlx-vlm` (librería indicada por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B-MLX-8bit (esta ficha) | 8,8B | no disponible | Visión + generación de HTML/CSS, 8-bit MLX | Apache-2.0 | Hugging Face, `mlx-vlm` |
| AesCode-8B-MLX-bf16 | 8,8B | no disponible | Igual, calidad completa | Apache-2.0 | Hugging Face, `mlx-vlm` |
| AesCode-8B-MLX-4bit | 8,8B | no disponible | Igual, 4-bit, menor tamaño | Apache-2.0 | Hugging Face, `mlx-vlm` |
| microsoft/AesCode-8B | 8,8B | no disponible | Checkpoint original | Apache-2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct | 8B | no disponible | Modelo base generalista de visión-lenguaje | no disponible en esta ficha | Hugging Face |

La comparación relevante es entre las tres cuantizaciones del mismo autor (bf16, 8-bit, 4-bit) y el checkpoint original de Microsoft: mismo tamaño de parámetros, distinta precisión y distinto footprint de memoria. Frente a Qwen3-VL-8B-Instruct, AesCode añade el entrenamiento específico para generación de código visual, con la mejora de 31,1 puntos en la métrica Visual reportada por el paper.

## Limitaciones y advertencias

- La cuantización a 8 bits introduce una pérdida de precisión respecto a bf16; el autor reconoce que las puntuaciones exactas de benchmark pueden variar ligeramente.
- La evaluación cualitativa de la ruta visual se limita a un único ejemplo de lectura de pose; no constituye una validación exhaustiva de la cuantización.
- El modelo está especializado en generación de HTML/CSS y artefactos visuales; su rendimiento en tareas generales de texto o razonamiento no se documenta.
- Riesgo de alucinación: no se han publicado tasas de alucinación ni evaluaciones de fidelidad factual en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar un comportamiento multilingüe correcto sin evaluación.
- Longitud de contexto: no disponible; planificar los prompts con margen y validar empíricamente.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de atribución a Microsoft y al equipo de Qwen.
- Dependencia de hardware Apple: el formato MLX no es portable a CUDA; para despliegue en servidores NVIDIA hay que usar el checkpoint original o generar otra cuantización.
- El modelo se distribuye sin garantías; para producción conviene validar la salida HTML/CSS (por ejemplo, con comprobaciones de renderizado) antes de integrarla en pipelines automáticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-8B-MLX-8bit
- Variante bf16: https://huggingface.co/divinetribe/AesCode-8B-MLX-bf16
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-8B-MLX-4bit
- Checkpoint original: https://huggingface.co/microsoft/AesCode-8B
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- Página del proyecto: https://microsoft.github.io/AesCode/
- Código de Microsoft: https://github.com/microsoft/AesCode
- Repositorio del autor de la cuantización: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor: https://github.com/nicedreamzapp
- `mlx-vlm`: https://github.com/Blaizzy/mlx-vlm
