# misterantibully/manabu-manga-ocr-int8

## Resumen

`manabu-manga-ocr-int8` es una exportación a ONNX con cuantización int8 del modelo `kha-white/manga-ocr-base`, un sistema de reconocimiento óptico de caracteres (OCR) especializado en texto japonés de manga. Lo publica el usuario `misterantibully` como componente offline de Manabu, una aplicación de aprendizaje de idiomas. El modelo original lo desarrolló Kha White y esta versión no altera la arquitectura ni los pesos más allá de la exportación y la cuantización.

El modelo resuelve un problema concreto: leer texto japonés en viñetas de manga, que combina escritura horizontal y vertical, tipografías muy variables, furigana y ruido visual propio de la impresión. La relevancia de esta variante está en su orientación a inferencia en CPU mediante ONNX Runtime, lo que permite integrar OCR japonés en aplicaciones de escritorio o móviles sin GPU.

Técnicamente es un modelo image-to-text con encoder ViT que procesa imágenes de 224×224 píxeles y un decoder tipo BERT que genera la transcripción carácter a carácter. El repositorio ocupa aproximadamente 0,1 GB y la licencia es Apache-2.0, la misma del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ViT + decoder tipo BERT (image-to-text), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (decoder autorregresivo con vocabulario de 6144 tokens de salida) |
| Tipos de cuantizacion | int8 dinámica sobre pesos MatMul/Gemm; exportación base en fp32 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `vocab.txt`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema del modelo original: un encoder ViT que recibe `pixel_values` con forma [1, 3, 224, 224] y produce `last_hidden_state` de forma [1, 197, 768], y un decoder tipo BERT que combina `input_ids` con los estados ocultos del encoder para generar `logits` de dimensión 6144. La decodificación es greedy, arranca en el token 2 ([CLS]) y se detiene en el token 3 ([SEP]). El preprocesado convierte la imagen a escala de grises, la redimensiona a 224×224 con remuestreo bilineal y la normaliza al rango [-1, 1].

La exportación se realizó con optimum 1.23.3 y torch 2.5.1 sobre opset 17, partiendo de una exportación fp32. La cuantización es dinámica int8 y afecta únicamente a los pesos de las operaciones MatMul/Gemm. El autor indica que, en todas las líneas de prueba, tanto horizontales como verticales, la salida es idéntica a la del modelo PyTorch original. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO; esos detalles corresponden al modelo base y no se documentan en esta ficha.

## Capacidades

- Reconocimiento óptico de caracteres japoneses en imágenes, con salida de texto plano.
- Lectura de texto horizontal y vertical, según las pruebas indicadas por el autor.
- Procesamiento de recortes de viñetas de manga con tipografías variables y furigana.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Modelo unimodal: no acepta texto de entrada como prompt, solo imagen.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-step ni comportamiento de agente.
- No tiene modo thinking, visión general, audio ni otras capacidades multimodales más allá del OCR.
- Multilingüe limitado al japonés.

## Casos de uso

- Lectura de manga en aplicaciones de aprendizaje de idiomas: Manabu lo emplea como lector offline de texto japonés; el modelo recibe el recorte de la viñeta y devuelve la transcripción para su consulta o traducción.
- Digitalización de colecciones de manga: procesar páginas escaneadas por lotes en CPU para extraer el texto de cada viñeta y generar índices de búsqueda o subtítulos.
- Herramientas de accesibilidad: transcribir el texto de viñetas a voz o a texto ampliado para lectores con dificultades visuales, ejecutándose localmente sin enviar imágenes a servicios externos.
- Extracción de vocabulario para estudio: integrar el OCR en un pipeline que detecte palabras y alimente mazos de repaso espaciado, aprovechando que el modelo funciona sin conexión.
- Anotación y traducción asistida: preprocesar páginas para que un traductor humano o un sistema posterior reciba el texto japonés ya extraído, reduciendo el trabajo manual.
- Investigación en OCR de escritura vertical: usar el modelo como línea base o componente en experimentos sobre reconocimiento de texto japonés en dominios ruidosos, dado su reducido tamaño y su despliegue sencillo en CPU.
- Aplicaciones de escritorio o móviles con recursos limitados: al ocupar alrededor de 0,1 GB y ejecutarse con ONNX Runtime, encaja en entornos donde no hay GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente afirma que la salida coincide con la del modelo PyTorch original en todas las líneas de prueba, sin aportar métricas cuantitativas de precisión, latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no aplica para el flujo previsto; el modelo está pensado para CPU con ONNX Runtime.
- GPU recomendadas: no disponibles; no se documenta un flujo GPU para esta exportación.
- Compatibilidad con GPU de consumo: no documentada; el caso de uso declarado es inferencia en CPU.
- Opciones de despliegue: ONNX Runtime (CPU); el script `export_manga_ocr.py` permite reconstruir la exportación.
- Latencia y throughput: no disponibles en la información proporcionada.
- Huella en disco: aproximadamente 0,1 GB para el repositorio completo, incluyendo encoder, decoder y vocabulario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| manabu-manga-ocr-int8 | no disponible | no disponible | japonés | Apache-2.0 | ONNX int8 | Variante cuantizada para CPU del modelo base |
| kha-white/manga-ocr-base | no disponible | no disponible | japonés | Apache-2.0 | PyTorch (safetensors/bin) | Modelo original, referencia de calidad |
| kha-white/manga-ocr-base (fp32 ONNX) | no disponible | no disponible | japonés | Apache-2.0 | ONNX fp32 | Exportación sin cuantizar, mayor peso |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la equivalencia de salida declarada por el autor entre la versión int8 y el modelo PyTorch original.

## Limitaciones y advertencias

- El modelo solo reconoce japonés; no está entrenado para otros idiomas.
- Está especializado en texto de manga; su rendimiento en documentos, capturas de pantalla u otras tipografías no está documentado.
- No se publican métricas de precisión ni de tasas de error, por lo que la calidad debe validarse en el dominio concreto de uso.
- Riesgo de alucinación o de transcripción incorrecta en caracteres poco frecuentes, texto degradado o viñetas con ruido visual; no hay datos cuantitativos al respecto.
- La cuantización int8 puede introducir diferencias frente al modelo original en casos límite, aunque el autor afirma equivalencia en sus pruebas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo original y del proyecto manga-ocr.
- El modelo no acepta instrucciones en texto ni mantiene conversaciones; es exclusivamente un OCR de imagen a texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/misterantibully/manabu-manga-ocr-int8
- Modelo base: https://huggingface.co/kha-white/manga-ocr-base
- Proyecto manga-ocr en GitHub: https://github.com/kha-white/manga-ocr
