# plantwaterer/peshashaga

## Resumen

peshashaga es un sistema de respuesta a preguntas de opción múltiple sobre imágenes desarrollado por el usuario `plantwaterer`. No se trata de un modelo único, sino de un conjunto de pesos derivados por promedio ponderado de ocho fine-tunes del modelo base Qwen/Qwen3.8-27B, más una cabeza lineal de 26 vías que produce directamente la respuesta. El repositorio no contiene los pesos base: publica únicamente una actualización de bajo rango (`peshashaga_update.safetensors`, 3,7 GB) y la cabeza (`peshashaga_head.safetensors`), junto con un motor de inferencia (`peshashaga.py`).

El sistema integra además un modelo OCR externo (PP-OCRv5 en su variante mobile, de PaddlePaddle) que lee el texto presente en las imágenes y lo inserta en el prompt antes de la pregunta. Por tanto, en cada petición intervienen tres componentes: el modelo base Qwen, la actualización y cabeza propias del autor, y el OCR. El modelo está etiquetado con los tags `decision-making`, `multiple-choice` y `vision`, y su pipeline declarado es `image-text-to-text`.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un experimento de ajuste fino orientado a una tarea muy concreta (elección entre opciones con distribución de probabilidad), con decisiones de diseño poco habituales como la atención bidireccional en las capas de atención completa y un formato de prompt en «sándwich». El repositorio presenta cero descargas y cero likes en el momento de la consulta, y no incluye resultados de benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y capas recurrentes Gated DeltaNet (heredada de Qwen3.8-27B); el sistema añade una cabeza lineal de 26 vías y un OCR PP-OCRv5 |
| Parametros totales | no disponible (los pesos base de Qwen3.8-27B no se incluyen en el repositorio; el tamaño del repo es de 3,7 GB, correspondiente solo a la actualización de bajo rango) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el motor usa bf16 en `cuda:0` por defecto) |
| Idiomas soportados | no disponibles (el OCR de reconocimiento incluido es `en_PP-OCRv5_mobile_rec`, orientado a inglés) |
| Licencia | Apache-2.0 (pesos y código del repositorio); el modelo base Qwen3.8-27B y los modelos PP-OCRv5 se descargan desde sus repositorios originales con sus propias licencias |
| Formato de pesos | safetensors (`peshashaga_update.safetensors` y `peshashaga_head.safetensors`); el motor descarga el base y el OCR desde el Hub en revisiones fijadas |

## Arquitectura y entrenamiento

peshashaga es el resultado de promediar con pesos ocho fine-tunes distintos del modelo base Qwen/Qwen3.8-27B. La actualización publicada conserva por separado las actualizaciones de los ocho fine-tunes, con pesos explícitos de 0,077, 0,231 y 0,231 para tres de ellos (el resto de pesos no se detalla en la información disponible). Sobre el modelo promediado se aplica una cabeza lineal de 26 salidas que se evalúa sobre el estado oculto del último token del prompt; la respuesta es directamente el índice de mayor probabilidad, sin decodificación autoregresiva ni uso de los logits de letras.

Tres de las innovaciones técnicas destacables son: (1) la atención bidireccional en las capas de atención completa del modelo base, de modo que cada token del prompt atiende a todos los demás, mientras que las capas recurrentes Gated DeltaNet permanecen causales; (2) un formato de prompt en «sándwich» en el que la pregunta y las opciones aparecen tanto antes como después de las imágenes; y (3) la integración obligatoria de texto OCR en el prompt, generado por PP-OCRv5 mobile (detección y reconocimiento), que lee cada imagen a tamaño original con un máximo de 960 píxeles en el lado largo, conserva líneas con puntuación de reconocimiento ≥ 0,5, las ordena en bandas de 12 píxeles y limita a 60 líneas y 1.200 caracteres por imagen. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de opción múltiple sobre imágenes, devolviendo una distribución de probabilidad sobre las opciones (hasta 26 clases en la cabeza).
- Lectura de texto en imágenes mediante OCR integrado (PP-OCRv5 mobile), con incorporación del texto reconocido al prompt.
- Razonamiento visual de elección única: el modelo no genera texto libre, sino que selecciona una opción.
- Soporte de múltiples imágenes por petición, cada una con su propio bloque de texto OCR en el prompt.
- Capacidad multilingüe: no disponible (el reconocimiento OCR incluido es en inglés; no se documentan idiomas del modelo base en esta ficha).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño es de una sola pasada y una sola respuesta.
- Modo «thinking» o decodificación extensa: no aplicable, ya que no se decodifica texto.

## Casos de uso

- Evaluación automática de imágenes en encuestas o formularios: el sistema recibe una imagen y una pregunta con opciones y devuelve la probabilidad de cada una, lo que permite umbralizar respuestas y derivar casos ambiguos a revisión humana.
- Verificación de documentos con texto: gracias al OCR integrado, puede responder preguntas sobre el contenido textual de capturas, tickets o etiquetas, usando el texto extraído como contexto adicional en el prompt.
- Clasificación visual con incertidumbre cuantificada: al devolver probabilidades por opción, es adecuado para pipelines que necesitan una medida de confianza en lugar de una etiqueta rígida.
- Control de calidad en entornos industriales o logísticos: comparación entre imágenes de referencia y capturas nuevas mediante preguntas de elección (por ejemplo, qué objeto está más cerca de la cámara o qué etiqueta aparece en la imagen).
- Investigación sobre prompts multimodales: el formato en «sándwich» y la atención bidireccional lo convierten en un banco de pruebas para estudiar el efecto de la colocación de imágenes y texto en tareas de elección.
- Experimental para educación o accesibilidad: responder preguntas de opción múltiple sobre material visual, con la salvedad de que el sistema no genera explicaciones y solo emite una elección con probabilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el sistema carga el modelo base Qwen3.8-27B en bf16 por defecto, lo que sitúa el requisito en el orden de decenas de GB, pero no se proporciona una cifra concreta.
- GPU recomendadas: no se especifican modelos concretos; el motor requiere Linux x86_64, una GPU con soporte CUDA y ejecuta el OCR en la misma GPU que el modelo (`cuda:0` por defecto, configurable con `--option device=cuda:1`).
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo base hace improbable su ejecución en GPU de consumo sin cuantización, y no se documentan recetas de cuantización.
- Opciones de despliegue: motor propio `peshashaga.py` basado en PyTorch SDPA y `transformers`, instalado con `uv` y `uv sync --frozen`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que el tiempo de OCR forma parte de todas las cifras de latencia, pero no publica valores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peshashaga | no disponible (base Qwen3.8-27B + actualización de 3,7 GB) | no disponible | Elección múltiple sobre imágenes con OCR | Apache-2.0 | Hugging Face (`plantwaterer/peshashaga`) |
| Qwen/Qwen3.8-27B (base) | 27B (según nombre) | no disponible | Multimodal image-text-to-text | según repositorio de Qwen | Hugging Face (`Qwen/Qwen3.8-27B`) |
| PP-OCRv5 mobile | ~20 MB (det + rec) | no aplica | OCR | Apache-2.0 | Hugging Face (PaddlePaddle) |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría (modelos de elección múltiple sobre imágenes); los datos de benchmarks no están publicados.

## Limitaciones y advertencias

- El sistema depende de tres repositorios externos (Qwen3.8-27B y los dos modelos PP-OCRv5) en revisiones fijadas; si esos repositorios cambian o se retiran, la reproducibilidad se rompe.
- La atención bidireccional en capas de atención completa es obligatoria: usar atención causal estándar produce respuestas distintas, según el autor.
- El formato de prompt en «sándwich» y la inserción del texto OCR son obligatorios; el modelo se seleccionó y midió con ellos, y no se garantiza el comportamiento fuera de ese formato.
- El OCR puede introducir errores en el prompt (el propio autor lo advierte con la frase «may contain errors»), lo que puede sesgar la respuesta en imágenes con texto denso o de baja calidad.
- El reconocimiento OCR incluido es en inglés (`en_PP-OCRv5_mobile_rec`), lo que limita el uso con imágenes cuyo texto esté en otros idiomas.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de robustez; al no publicarse benchmarks, no es posible valorar su calidad frente a alternativas.
- El modelo no genera explicaciones ni texto libre: solo emite una elección y probabilidades, lo que limita su uso en tareas que requieran justificación.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (17 de noviembre de 2026); se trata de una publicación sin validación externa conocida.
- La licencia Apache-2.0 cubre los pesos y el código del repositorio, pero el uso comercial del modelo base Qwen3.8-27B y del OCR queda sujeto a las licencias de sus repositorios originales.
- Requiere Linux x86_64, `uv` y una GPU CUDA; no se documenta soporte para CPU ni para otros sistemas operativos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/plantwaterer/peshashaga
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Kit Decision Index: https://github.com/apolinario/decision-index
- PP-OCRv5 (PaddleOCR): https://github.com/PaddlePaddle/PaddleOCR
- Modelo OCR de detección: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det
- Modelo OCR de reconocimiento: https://huggingface.co/PaddlePaddle/en_PP-OCRv5_mobile_rec
