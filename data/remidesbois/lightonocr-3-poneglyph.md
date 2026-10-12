# Remidesbois/LightOnOCR-3-Poneglyph

## Resumen

Poneglyph es un modelo de reconocimiento óptico de caracteres (OCR) especializado en páginas completas de manga en francés. Lo desarrolla Remidesbois como ajuste fino del modelo base lightonai/LightOnOCR-3-0.8B (revisión `36d8636925327c671bd8e479c517a004f7566bd9`). El modelo resuelve la transcripción de texto en viñetas junto con la localización espacial de cada zona de texto, devolviendo las coordenadas normalizadas en el rango 0-1000 en el formato nativo `![texto](x1,y1,x2,y2)` seguido de la transcripción. Está pensado para el prompt de usuario `grounding` con el template nativo y `enable_thinking=False`.

Arquitectónicamente es un modelo multimodal image-text-to-text basado en la arquitectura nativa Qwen3.5, con encoder de visión, merger y decoder. Cuenta con 852.985.920 parámetros totales (0,85 B) en pesos BF16, de los cuales 793.333.056 fueron entrenados en esta fase (decoder, merger y los cuatro últimos bloques de visión). La ventana de contexto y los tipos de cuantización no están documentados en la información disponible.

Su relevancia radica en el rendimiento reportado sobre su conjunto de validación y prueba: un CER de 1,066 % en test, un WER de 2,224 %, un 90,22 % de coincidencia exacta de texto por viñeta y un F1 de bounding boxes de 98,75 % con IoU ≥ 0,5, sin páginas truncadas. Es un modelo pequeño (0,85 B) con licencia Apache 2.0, orientado a un nicho muy concreto: digitalización y estructuración de manga francófono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 nativa, multimodal image-text-to-text (encoder de vision + merger + decoder) |
| Parametros totales | 852.985.920 (≈ 0,85 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 473 tensores, 1.706.030.528 bytes) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint lightonai/LightOnOCR-3-0.8B y conserva su arquitectura nativa Qwen3.5 con pesos en BF16. La fase documentada de ajuste se denomina consolidación CER: arranca desde el mejor checkpoint de la primera fase de página completa y retiene el paso 111 de la primera época. Se entrena con un nuevo optimizador AdamW y scheduler, con tasas de aprendizaje de 3e-6 para el decoder, 1,5e-6 para el merger y 7,5e-7 para la visión, con un máximo de tres épocas, batch físico 1 y acumulación 8. Se actualizan 793.333.056 parámetros (decoder, merger y los cuatro últimos bloques de visión); los estados de pesos y de Adam se mantienen en FP32 con autocast BF16 y kernels Blackwell SM120.

Las imágenes de entrenamiento son páginas completas con un borde largo máximo de 2048 píxeles y sin aumento de datos en esta fase. La función de pérdida se aplica únicamente sobre la respuesta, con pesos diferenciados: texto y separadores 1, marcas y coordenadas 0,2, y EOS 2; los dígitos dentro de la transcripción conservan peso 1. La selección del checkpoint se hace exclusivamente minimizando el CER por generación sobre las 189 páginas de validación, con protección del modelo inicial si la mejora es insuficiente. El conjunto de datos es fijo: 882 páginas de entrenamiento, 189 de validación y 189 de prueba, sin solapamiento. El modelo se validó de forma nativa con Transformers 5.14.1 y admite kernels FLA y causal-conv1d compatibles con la GPU para acelerar la inferencia de Qwen3.5.

## Capacidades

- OCR de páginas completas de manga en francés con transcripción del texto de las viñetas.
- Localización espacial (grounding) de zonas de texto mediante bounding boxes normalizadas en el rango 0-1000, en el formato `![texto](x1,y1,x2,y2)` seguido de la transcripción.
- Preservación del orden de lectura en la salida de página.
- Conversión de coordenadas normalizadas a píxeles multiplicando x por el ancho original / 1000 y por la altura original / 1000.
- Modo de pensamiento desactivado por diseño en el uso previsto (`enable_thinking=False`).
- Entrada image-text-to-text con template conversacional nativo y prompt de usuario `grounding`.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al francés según los metadatos (fr).
- Capacidades de visión adicionales (descripción de escenas, audio): no documentadas; el modelo anota zonas de texto validadas, no descripciones de viñetas.

## Casos de uso

- Digitalización y archivado de manga francófono: el modelo transcribe páginas completas y devuelve coordenadas de cada zona de texto, lo que permite reconstruir el texto indexable asociado a su posición en la página para catálogos y bibliotecas digitales.
- Traducción y localización editorial: al obtener el texto por viñeta y sus bounding boxes, un pipeline de traducción puede sustituir el texto original respetando el orden de lectura y la posición de cada bocadillo.
- Creación de datasets de OCR/grounding: las salidas en formato `![texto](x1,y1,x2,y2)` sirven como etiquetas estructuradas para entrenar o evaluar otros modelos de detección de texto y transcripción en cómic.
- Lectura asistida y accesibilidad: la transcripción por zona permite generar texto alternativo o lectores de pantalla que asocien el contenido a la región concreta de la página.
- Control de calidad de escaneos: con un CER de referencia del 1,066 % y un F1 de bbox de 98,75 %, el modelo puede usarse para detectar páginas mal escaneadas o con texto ausente comparando la transcripción con el original.
- Extracción de onomatopeyas y rótulos: aunque el propio autor advierte que puede omitir algunas onomatopeyas, sirve como primer paso para su identificación y posterior revisión manual en flujos de edición.
- Digitalización masiva de colecciones: con solo 0,85 B de parámetros y pesos de 1,7 GB, el modelo es adecuado para procesar grandes volúmenes de páginas en hardware moderado, reduciendo el coste por página frente a modelos mucho más grandes.

## Benchmarks y rendimiento

Resultados reportados en la model card. La métrica de test procede de un conjunto que ya se había evaluado e inspeccionado en la primera ejecución, según advierte el autor.

| Medida | Inicio · validacion | Retenido · validacion | Test final |
|---|---:|---:|---:|
| CER | 1,166 % | 1,040 % | 1,066 % |
| WER | 2,548 % | 2,291 % | 2,224 % |
| Texto exacto por vineta | 89,51 % | 90,08 % | 90,22 % |
| Texto de pagina exacto, en orden | 38,62 % | 40,74 % | 40,21 % |
| F1 bbox / IoU >= 0,5 | 98,80 % | 98,93 % | 98,75 % |
| Paginas truncadas | 0 | 0 | 0 |

Notas de protocolo facilitadas por el autor: CER/WER ponderados por caracteres y palabras de referencia, normalizados a NFC y espacios, conservando mayúsculas y puntuación. El emparejamiento espacial es uno a uno con IoU ≥ 0,1, penalizando zonas omitidas y añadidas como supresiones e inserciones. No se han facilitado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos BF16 (1,7 GB) más el espacio de activaciones y el procesado de imagen; un presupuesto de 6-8 GB de VRAM es holgado para páginas a 2048 píxeles de borde largo.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, RTX 4060/4070 o superiores son suficientes; el cuello de botella suele ser el procesado de visión a alta resolución más que los pesos.
- GPU de datacenter recomendadas: A100, H100 o cualquier GPU con soporte de kernels Blackwell SM120 (el entrenamiento se realizó con esos kernels).
- Aceleración opcional: kernels FLA y causal-conv1d compatibles con la GPU aceleran la inferencia de Qwen3.5.
- Opciones de despliegue: uso nativo con Transformers 5.14.1 y `Qwen3_5ForConditionalGeneration` con `attn_implementation="sdpa"`. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni ONNX/WebGPU; los resultados nativos no son medidas ONNX o WebGPU.
- Latencia y throughput estimados: no disponibles.
- Formato de despliegue: `max_new_tokens=1280` y `do_sample=False` en el ejemplo de uso proporcionado por el autor.

## Comparativa con modelos similares

El único modelo directamente comparable documentado es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-3-Poneglyph (este) | 852.985.920 (0,85 B) | no disponible | CER test 1,066 %; F1 bbox 98,75 % (test) | Apache 2.0 | HuggingFace |
| lightonai/LightOnOCR-3-0.8B (base) | 0,8 B (≈ 852 M) | no disponible | no disponible | no disponible en la informacion | HuggingFace |

No se han facilitado datos de benchmark de otros modelos OCR de manga comparables, por lo que no se incluye una comparación adicional: no disponible.

## Limitaciones y advertencias

- El modelo puede omitir texto, en particular algunas onomatopeyas; las bounding boxes y transcripciones requieren verificación en usos que exijan exactitud.
- Soporte lingüístico limitado al francés según los metadatos (fr); no se documenta comportamiento en otros idiomas.
- Las anotaciones corresponden a zonas de texto validadas, no a descripciones de viñetas; no debe esperarse comprensión o descripción de la escena.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor recomienda verificar las salidas.
- Los resultados de test provienen de un conjunto ya evaluado e inspeccionado en la primera ejecución, por lo que miden una mejora sobre un test reutilizado y no sobre un conjunto independiente nuevo. El propio autor lo advierte.
- No se documentan sesgos específicos del modelo en la información disponible.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base lightonai/LightOnOCR-3-0.8B, cuyo dato no se incluye aquí.
- Caveat de producción: el conjunto de datos es pequeño (882 páginas de entrenamiento) y está fijo; la generalización a estilos de manga, editoriales o resoluciones distintas no está validada.
- Las coordenadas normalizadas (0-1000) deben reescalarse con las dimensiones originales de la página; un reescalado incorrecto degrada la localización en píxeles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Remidesbois/LightOnOCR-3-Poneglyph
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B (revision 36d8636925327c671bd8e479c517a004f7566bd9)
- Resumen público del benchmark (referenciado en la model card): benchmark_native.json
- Version de Transformers usada en la validacion nativa: 5.14.1
- SHA-256 de los pesos: `3e7f25dbbdd87a0f1896af27aad5ee07f66364a24da4151d14ef6d125a98d14b`
