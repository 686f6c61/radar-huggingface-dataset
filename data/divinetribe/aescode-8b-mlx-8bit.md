# divinetribe/AesCode-8B-MLX-8bit

## Resumen

AesCode-8B es un modelo multimodal de tipo vision-lenguaje especializado en la generación de artefactos visuales ricos en información (diapositivas, carteles, paneles de control, informes) como HTML/CSS estructurado, editable y verificable. Lo desarrolla Microsoft, partiendo de Qwen3-VL-8B-Instruct de Alibaba, y se entrena con SFT de arranque en frío seguido de GDPO sobre siete canales de recompensa, con supervisión estructurada en grafo y recompensas multimodales desacopladas. La ficha que nos ocupa, `divinetribe/AesCode-8B-MLX-8bit`, es una cuantización a 8 bits en formato MLX del checkpoint original, publicada por un tercero (divinetribe), no por Microsoft.

La arquitectura es `Qwen3VLForConditionalGeneration`: una torre de visión `qwen3_vl` que alimenta un decodificador de texto `qwen3_vl_text`, con 8.767.123.696 parámetros totales. La cuantización mantiene intacta la torre de visión y comprime los pesos a 8.993 bits por peso, con tamaño de grupo 64, en dos fragmentos que suman 9.2 GB. Está pensada para ejecutarse con `mlx-vlm` en Apple Silicon, especialmente en máquinas de 16 GB de memoria unificada.

Su relevancia actual radica en que aborda una tarea concreta y exigente —leer un diseño o una captura de pantalla y devolver el HTML/CSS correspondiente— con un modelo de 8B que, según el paper del autor original, supera en su propia evaluación a sistemas de referencia mucho mayores. Esta conversión a 8 bits reduce el peso a la mitad para hacerlo viable en hardware de consumo de Apple.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (torre de visión `qwen3_vl` + decodificador de texto `qwen3_vl_text`) |
| Parámetros totales | 8.767.123.696 (8,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits MLX (8.993 bits por peso, tamaño de grupo 64); existen versiones bf16 y 4 bits del mismo autor de la conversión |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, dos fragmentos, 9.2 GB; repositorio de 9.9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3-VL: una torre de visión que procesa imágenes y las proyecta en el espacio del decodificador de texto, que genera la salida. El checkpoint original de Microsoft parte de Qwen3-VL-8B-Instruct y se entrena en dos fases: primero un SFT de arranque en frío y después GDPO (una variante de optimización por preferencias) sobre siete canales de recompensa. La innovación técnica destacada es la separación de requisitos semánticos y señales visuales mediante supervisión estructurada en grafo y recompensas multimodales desacopladas, orientada a que el modelo cumpla tanto criterios de contenido (texto, límites, gráficos) como de aspecto visual (contenido, disposición, estilo).

La conversión que nos ocupa no modifica la arquitectura ni reentrena nada: aplica cuantización de 8 bits a los pesos con MLX, conserva la torre de visión sin tocar y empaqueta los pesos en dos fragmentos safetensors para `mlx-vlm`. El autor de la conversión indica que sometió esta versión a la misma prueba de lectura de pose que la bf16 antes de publicarla, con resultados equivalentes. No se dispone de datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles de RLHF/DPO más allá de lo indicado.

## Capacidades

- Generación de código HTML/CSS a partir de una imagen de diseño, captura de pantalla o referencia visual.
- Generación de texto e imágenes a texto (pipeline `image-text-to-text`).
- Razonamiento visual: lectura de figuras, poses, superposiciones y elementos gráficos.
- Generación de alt-text a partir de imágenes.
- Generación de texto puro (sin imagen) usando `num_images=0` en `mlx-vlm`.
- Producción de artefactos visuales estructurados y editables: diapositivas, carteles, paneles de control e informes.
- Capacidad conversacional (etiqueta `conversational` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reconstrucción de diseños en HTML/CSS: se introduce una captura de pantalla o mockup y el modelo devuelve un único archivo HTML con el CSS embebido, gracias a su entrenamiento específico en generación de código estético y verificable.
- Generación de diapositivas y carteles: a partir de una descripción o una referencia visual, el modelo produce HTML/CSS editable que se puede renderizar y revisar, lo que encaja con su evaluación sobre 300 prompts de infografía.
- Paneles de control e informes: el modelo genera estructuras HTML con gráficos y disposición de contenido, adecuado para prototipado rápido de interfaces de datos.
- Accesibilidad y alt-text: dado que conserva la torre de visión intacta, puede describir imágenes y generar texto alternativo, útil en pipelines de publicación de contenido.
- Control de calidad visual en aplicaciones interactivas: el ejemplo de la model card muestra su uso para verificar si una pose dibujada sobre una escena de cámara es anatómicamente correcta, lo que sirve en juegos de movimiento o entrenamiento físico.
- Prototipado en local en Apple Silicon: con 9.2 GB de pesos en 8 bits, se puede ejecutar en un Mac de 16 GB mediante `mlx-vlm`, lo que permite iterar sobre diseños sin enviar imágenes a servicios en la nube.
- Integración en flujos de agentes locales: el autor de la conversión lo incluye como uno de los modelos del proyecto Claude Code Local, que expone una API compatible con Anthropic sobre MLX, de modo que puede usarse como agente de generación de interfaz en local.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación del paper original de AesCode y de la model card, no de una evaluación independiente de esta cuantización concreta. La evaluación usa 300 prompts de infografía, con una pista programática `Rule` (Text, Bound, Chart) y una lista de verificación `Visual` (Content, Layout, Style); `Overall` es la media de ambas, promediada sobre tres generaciones sin selección.

| Modelo | Overall | Rule | Notas |
|---|---|---|---|
| AesCode-8B | 82,94 | 90,07 | Mejora Visual en 31,1 puntos sobre Qwen3-VL-8B de referencia |
| GPT-5.5 (con referencia) | 81,28 | no disponible | Fila de la misma tabla del paper |
| Claude Opus 4.8 (con referencia) | 80,39 | no disponible | Fila de la misma tabla del paper |

El autor de la conversión advierte de que la cuantización a 8 bits intercambia algo de precisión por tamaño, por lo que las puntuaciones exactas de esta versión pueden variar ligeramente respecto a las del modelo original. No se han publicado resultados de benchmarks independientes para esta conversión MLX de 8 bits.

## Requisitos de hardware

- VRAM/memoria estimada: 9.2 GB de pesos en 8 bits, más overhead de ejecución; el autor indica que está pensada para máquinas de 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (16 GB o más); no está pensada para GPU NVIDIA, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon de 16 GB; en el ecosistema NVIDIA no aplica este formato.
- Opciones de despliegue: `mlx-vlm` (librería oficial de esta conversión); el proyecto Claude Code Local ofrece un servidor local compatible con la API de Anthropic sobre MLX.
- Latencia y throughput: no disponibles en la información proporcionada.
- Alternativas de tamaño: bf16 (calidad completa) y 4 bits, publicadas por el mismo autor de la conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B-MLX-8bit (esta ficha) | 8,8B | no disponible | Visión + generación de HTML/CSS, cuantizado 8 bits MLX | Apache-2.0 | HuggingFace, `mlx-vlm` |
| microsoft/AesCode-8B | 8,8B | no disponible | Visión + generación de HTML/CSS, pesos originales | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible | Visión-lenguaje general, base del anterior | no disponible | HuggingFace |
| divinetribe/AesCode-8B-MLX-bf16 | 8,8B | no disponible | Misma tarea, calidad completa sin cuantizar | Apache-2.0 | HuggingFace, `mlx-vlm` |

La comparación relevante es frente al checkpoint original y a las otras cuantizaciones del mismo autor de la conversión: la versión 8 bits reduce el tamaño a la mitad respecto a bf16 a cambio de una posible pérdida menor de precisión, y la versión 4 bits reduce aún más el peso a costa de mayor degradación. Frente a Qwen3-VL-8B-Instruct, el modelo aporta el entrenamiento específico para generación de código estético, con la mejora de 31,1 puntos en Visual reportada en el paper.

## Limitaciones y advertencias

- La cuantización a 8 bits puede degradar ligeramente la precisión respecto a la versión bf16; el autor solo verificó la lectura de visión con una prueba cualitativa, no con una evaluación completa de benchmarks.
- El modelo está especializado en generación de HTML/CSS y artefactos visuales; su rendimiento en tareas generales de texto o código fuera de ese dominio no está documentado.
- Riesgo de alucinación en la interpretación de imágenes y en la generación de contenido no presente en la referencia visual; no se han publicado análisis específicos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar su uso en documentos o conversaciones largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct y del checkpoint de Microsoft, así como la atribución correspondiente.
- Esta conversión es obra de un tercero (divinetribe), no de Microsoft; la calidad del modelo original es atribuible a sus autores.
- El formato MLX limita su despliegue a Apple Silicon; no es directamente portable a CUDA sin reconversión.
- No se documentan capacidades de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines de agentes complejos sin trabajo adicional.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/divinetribe/AesCode-8B-MLX-8bit
- Versión bf16: https://huggingface.co/divinetribe/AesCode-8B-MLX-bf16
- Versión 4 bits: https://huggingface.co/divinetribe/AesCode-8B-MLX-4bit
- Checkpoint original: https://huggingface.co/microsoft/AesCode-8B
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- Página del proyecto: https://microsoft.github.io/AesCode/
- Código: https://github.com/microsoft/AesCode
- `mlx-vlm`: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
