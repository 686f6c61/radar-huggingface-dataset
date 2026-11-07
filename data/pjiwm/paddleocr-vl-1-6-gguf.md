# Pjiwm/PaddleOCR-VL-1.6-gguf

## Resumen

PaddleOCR-VL-1.6-gguf es una conversión a formato GGUF del modelo PaddleOCR-VL 1.6 desarrollado por PaddlePaddle, un modelo de visión-lenguaje de aproximadamente 921 millones de parámetros especializado en reconocimiento óptico de caracteres (OCR) sobre imágenes. La conversión, publicada por el usuario Pjiwm, cuantiza los pesos a 8 bits (q8_0) para permitir inferencia en CPU, manteniendo los nombres originales de los tensores y sin reentrenar ni ajustar ningún peso.

El modelo resuelve el problema de extraer texto de imágenes —incluyendo documentos, bocadillos de manga y material escaneado— mediante una arquitectura visión-lenguaje que genera texto a partir de una imagen de entrada. Su relevancia radica en que ofrece OCR de alta precisión en un paquete de ~1,1 GB ejecutable en CPU, sin necesidad de GPU ni de librerías de tokenización externas, gracias al archivo `vl_vocab.txt` incluido.

La model card reporta una tasa de error de carácter (CER) del 0,9% sobre 40 bocadillos de manga con texto verificado manualmente, idéntica a la del modelo original en float32. El modelo está etiquetado para japonés y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM); detalles internos de la arquitectura no disponibles |
| Parametros totales | 921.356.096 (~921 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (bloques de 32, una escala por bloque) en matrices `.weight` 2D de capas lineales; embeddings en float16; norms y biases en float32 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`vl.gguf`) + vocabulario en texto (`vl_vocab.txt`) |

## Arquitectura y entrenamiento

El modelo original PaddleOCR-VL 1.6 es un modelo de visión-lenguaje de aproximadamente mil millones de parámetros orientado a la lectura de texto en imágenes. La model card de esta conversión no detalla la arquitectura interna (tipo de vision encoder, mecanismo de atención, etc.), por lo que esa información no está disponible en la documentación proporcionada.

La conversión a GGUF no implica reentrenamiento ni fine-tuning: se limita a transformar `model.safetensors` a formato GGUF conservando los nombres originales de los tensores. Las matrices de pesos 2D de las capas lineales se cuantizan a q8_0 con bloques de 32 elementos (con padding de ceros cuando la longitud de fila no es múltiplo de 32); los embeddings y otras matrices se guardan en float16, y las normas y biases en float32. Se omite el tensor `packing_position_embedding` porque la inferencia nunca lo lee. El vocabulario `vl_vocab.txt` se deriva del tokenizer original: cada línea contiene los bytes UTF-8 del token en hexadecimal, lo que permite decodificar texto sin librería de tokenizer.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes, con salida de texto.
- Generación de texto a partir de imagen (pipeline `image-to-text`).
- Lectura de texto japonés en imágenes, incluyendo bocadillos de manga.
- Decodificación greedy determinista: produce los mismos tokens que el modelo original en transformers según la model card.
- Decodificación de texto sin dependencia de librería de tokenizer, mediante `vl_vocab.txt`.
- Inferencia en CPU gracias a la cuantización q8_0.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo japonés declarado.
- Capacidades de visión, audio o modo thinking especiales: no disponibles más allá del OCR.

## Casos de uso

- Digitalización de documentos escaneados en japonés: el modelo lee texto de imágenes y lo devuelve como texto plano, adecuado para pipelines de archivado y extracción de contenido en entornos sin GPU.
- Procesamiento de manga y cómics: la model card valida su uso sobre bocadillos de manga con una CER del 0,9%, lo que lo hace apto para transcripción de diálogos y subtitulado.
- OCR en dispositivos de borde o servidores sin GPU: al estar cuantizado a 8 bits y ocupar ~1,1 GB, puede ejecutarse en CPU en entornos con recursos limitados.
- Extracción de texto en aplicaciones de accesibilidad: conversión de imágenes con texto japonés a texto legible por lectores de pantalla.
- Indexación y búsqueda de contenido en imágenes: generación de transcripciones para motores de búsqueda sobre archivos de imagen escaneados.
- Preprocesado en pipelines de datos: conversión de imágenes a texto como paso previo a tareas de NLP (traducción, resumen, clasificación) en corpus japoneses.
- Integración en herramientas de línea de comandos o scripts ligeros: la ausencia de dependencia de tokenizer y el formato GGUF simplifican el despliegue en utilidades de escritorio.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de error de carácter (CER) en 40 bocadillos de manga con texto verificado | 0,9% (modelo 8-bit), igual que el original en float32 |
| Coincidencia de tokens con el original (transformers, float32 y 8-bit, decodificación greedy) | Idéntica en las imágenes de prueba |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el archivo GGUF ocupa 1.084.782.240 bytes (~1,01 GiB) y el vocabulario 1.342.222 bytes.
- GPU recomendadas: no disponibles; la conversión está pensada para inferencia en CPU.
- ¿Cabe en GPU consumer? El tamaño (~1,1 GB) es compatible con cualquier GPU consumer moderna, pero la model card no documenta despliegue en GPU para esta conversión.
- Opciones de despliegue: inferencia en CPU con el formato GGUF; el autor no especifica runners concretos (llama.cpp, Ollama, etc.) en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pjiwm/PaddleOCR-VL-1.6-gguf | ~921 M | no disponible | Apache 2.0 | GGUF (q8_0) | Conversion comunitaria para CPU; solo japones declarado |
| PaddlePaddle/PaddleOCR-VL-1.6 | ~921 M (mismo modelo) | no disponible | Apache 2.0 | safetensors (original) | Modelo original de PaddlePaddle; referencia de precision |
| PaddlePaddle/PaddleOCR-VL-1.6-GGUF | ~921 M (mismo modelo) | no disponible | Apache 2.0 | GGUF | Conversion oficial de PaddlePaddle; detalles de cuantizacion no disponibles |

No se dispone de datos de benchmarks comparativos con otros modelos OCR en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para japonés; el rendimiento en otros idiomas no está documentado.
- La evaluación de precisión se limita a 40 bocadillos de manga; no hay validación publicada sobre documentos, formularios o texto impreso general.
- Riesgo de alucinación y de errores de lectura en imágenes de baja calidad, rotadas o con tipografías inusuales: no cuantificado en la información disponible.
- La cuantización q8_0 puede degradar la precisión en casos no cubiertos por la prueba reportada; la equivalencia con float32 solo se verificó en las imágenes de prueba del autor.
- No se documentan sesgos específicos del modelo.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución a PaddlePaddle y el aviso de licencia.
- La conversión omite `packing_position_embedding`; cualquier uso que requiera ese tensor no es posible con estos pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.
- No se especifican requisitos de contexto ni límites de longitud de entrada/salida.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/Pjiwm/PaddleOCR-VL-1.6-gguf
- Modelo original PaddleOCR-VL 1.6: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Conversión GGUF oficial de PaddlePaddle: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
