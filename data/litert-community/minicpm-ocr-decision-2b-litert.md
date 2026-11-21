# litert-community/MiniCPM-OCR-Decision-2B-LiteRT

## Resumen

MiniCPM-OCR-Decision-2B-LiteRT es una conversión al formato LiteRT (TFLite) del modelo openbmb/MiniCPM-OCR-Jev, publicada por la comunidad litert-community. No es un modelo OCR generativo al uso: es un verificador de OCR. Dada la imagen de una región de texto y una imagen renderizada a partir de una hipótesis de texto candidata, el modelo devuelve una puntuación entre 0 y 1 que indica la probabilidad de que esa hipótesis sea correcta. Resuelve así el problema de filtrar y seleccionar entre múltiples salidas de un motor OCR clásico o neuronal.

La conversión se ha realizado con litert-torch 0.10.0 para la API CompiledModel de ai-edge-litert 2.3.0, con el objetivo de ejecución on-device en CPU, GPU y NPU. El modelo base tiene 2B parámetros y una arquitectura vision-language (image-text-to-text) con torre de visión y decodificador de texto. La versión LiteRT reporta una latencia mediana de 179,4 ms por puntuación de candidato en un Apple M4 Max con Metal (medición del 2026-11-06).

La relevancia actual radica en su enfoque: en lugar de competir con los grandes modelos OCR multimodales en generación, se posiciona como un componente de verificación ligero y desplegable en dispositivos, con artefactos compilados específicamente para la NPU del Qualcomm SM8850 (Galaxy S26). La licencia Apache 2.0 y la ausencia de dependencia de PyTorch en el host facilitan su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (torre de visión + decodificador de texto con cabeza de puntuación) |
| Parametros totales | 2B (según nombre del modelo y modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | Hasta 4.096 tokens en el decodificador; hasta 4.096 patches en la torre de visión |
| Tipos de cuantizacion | Pesos en float16 (f16sfc, fp16fc); tablas de embeddings y score.weight en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT), safetensors para tablas auxiliares (tables.safetensors) |

## Arquitectura y entrenamiento

El modelo base es un vision-language model de 2B parámetros con una torre de visión que procesa la imagen en patches y un decodificador de texto que atiende conjuntamente a la imagen de la región y a la imagen renderizada del candidato. La conversión a LiteRT separa el grafo en dos componentes: la torre de visión con proyector (tower_*.tflite, ~659 MB por fichero) y el grafo de decisión (decide_*.tflite, ~2,75 GB por fichero), que contiene el decodificador completo y su propia copia de los pesos. La cabeza de puntuación (score.weight) se mantiene en bfloat16 en tables.safetensors y el host la aplica sobre la salida.

Los grafos están organizados por buckets de longitud fija: el decodificador ofrece buckets de 256, 384, 512, 768, 1.024, 1.536, 2.048, 3.072 y 4.096 tokens, y la torre de visión buckets de 400, 576, 784, 1.024, 1.296, 1.600, 1.936, 2.304, 3.136 y 4.096 patches. Cada grafo computa todas las posiciones de su longitud independientemente de la longitud real de la petición, por lo que el host selecciona el bucket más pequeño que contiene la solicitud. Existen ficheros multi-firma (multi_decide_L4096, multi_tower_N4096) que agrupan varios buckets sobre una única copia de los pesos. La conversión usa formas de kernel `bt` y `cv` en los ficheros de decisión individuales y mantiene la norma final dentro del rango de float16. Para la NPU del Qualcomm SM8850 se incluyen cinco grafos compilados ahead-of-time (256, 384, 512, 768 y 1.024 tokens). No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Verificación de OCR: puntúa de 0 a 1 un candidato de texto dada la imagen de la región y una imagen renderizada del candidato.
- Selección best-of entre múltiples candidatos OCR mediante la función `best_of` del host.
- Procesamiento de imagen en patches con buckets desde 400 hasta 4.096 patches.
- Procesamiento de texto con buckets desde 256 hasta 4.096 tokens.
- Ejecución on-device en CPU (XNNPACK, 4 hilos), GPU (Metal en Apple) y NPU (Qualcomm SM8850).
- Host en Python sin dependencias de PyTorch, torchvision ni transformers.
- Soporte de rechazo (refusals) definido en contract.json.
- Idiomas: inglés y chino.

## Casos de uso

- Verificación en pipelines OCR de producción: tras ejecutar un motor OCR (Tesseract, PaddleOCR, etc.), el modelo puntúa cada hipótesis contra la imagen de la región y permite descartar salidas de baja confianza antes de publicarlas.
- Selección best-of entre múltiples motores OCR: dado que el host expone `best_of`, se pueden combinar candidatos de varios motores y elegir el de mayor puntuación, mejorando la precisión sin un segundo modelo generativo.
- Digitalización de documentos en dispositivos móviles: con los grafos compilados para la NPU del SM8850 y los ficheros de hasta 1.024 tokens, la verificación puede ejecutarse localmente en un Galaxy S26 sin enviar imágenes a la nube.
- Control de calidad en pipelines de extracción de datos: puntuar los campos extraídos (importes, fechas, identificadores) contra su región de imagen para detectar errores antes de la carga en base de datos.
- Evaluación y benchmark de motores OCR: el script `score_olmocr_set.py` puntúa los 446 registros del conjunto olmOCR, lo que permite comparar motores de forma objetiva sobre un conjunto estandarizado.
- Filtrado de alucinaciones en OCR generativo: cuando un modelo OCR generativo produce texto, la verificación contra la imagen renderizada detecta candidatos que no se corresponden con la región.
- Procesamiento por lotes en servidor sin GPU: el host en CPU con XNNPACK permite ejecutar la verificación en infraestructura sin acelerador, usando los ficheros individuales por bucket.

## Benchmarks y rendimiento

| Metrica | Valor | Entorno |
|---|---|---|
| Latencia mediana por puntuación de candidato | 179,4 ms | Apple M4 Max con Metal (2026-11-06) |
| Memoria del ejemplo GPU | ~8 GiB | Dos ficheros multi-firma en Metal |
| Tamaño del grafo de decisión | ~2,75 GB por fichero | float16 |
| Tamaño de la torre de visión | ~659 MB por fichero | float16 |
| Tamaño de tables.safetensors | ~1,02 GB | bfloat16 |
| Tamaño total del repo | 105,8 GB | Todos los buckets y variantes |

No se han publicado resultados de benchmarks de precisión (exactitud de verificación, correlación con etiquetas) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el ejemplo GPU con los dos ficheros multi-firma requiere aproximadamente 8 GiB de memoria; la ruta CPU con ficheros individuales necesita descargar el conjunto completo de buckets.
- GPU recomendadas: Apple Silicon con Metal (validado en M4 Max); no se especifican otras GPU en la información disponible.
- NPU: Qualcomm SM8850 (Galaxy S26) con grafos compilados ahead-of-time para 256, 384, 512, 768 y 1.024 tokens.
- CPU: ruta con XNNPACK a 4 hilos sobre ficheros individuales por bucket.
- Despliegue: ai-edge-litert 2.3.0 (CompiledModel API) con host Python; dependencias `tokenizers`, `numpy`, `pillow` y `ai-edge-litert`, sin PyTorch.
- Latencia: 179,4 ms mediana por puntuación en M4 Max con Metal; el rendimiento en CPU y NPU no se detalla en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| MiniCPM-OCR-Decision-2B-LiteRT | 2B | 4.096 tokens / 4.096 patches | TFLite | Apache 2.0 | Verificación de candidatos OCR on-device |
| openbmb/MiniCPM-OCR-Jev (base) | 2B | no disponible | safetensors | no disponible | Modelo OCR multimodal original |
| Motores OCR clásicos (Tesseract, PaddleOCR) | no aplica | no aplica | varios | varias | Generación OCR sin verificación integrada |

La comparativa con modelos de verificación OCR específicos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto OCR: solo puntúa candidatos existentes; requiere un motor OCR aguas arriba.
- Idiomas limitados a inglés y chino; no se garantiza funcionamiento en otros idiomas.
- Cada grafo computa todas las posiciones de su bucket, por lo que peticiones cortas con buckets grandes desperdician cómputo; el host mitiga esto eligiendo el bucket mínimo.
- Los ficheros de decisión individuales incluyen una copia completa de los pesos cada uno, lo que eleva el tamaño del repo a 105,8 GB y complica el despliegue en almacenamiento limitado.
- La ruta CPU requiere descargar todos los ficheros individuales por bucket, no solo los multi-firma.
- El rendimiento está en ajuste según la model card ("Speed still being tuned").
- No se han publicado métricas de precisión de verificación en la información disponible; el riesgo de falsos positivos o negativos no está cuantificado.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base openbmb/MiniCPM-OCR-Jev, cuya licencia no se detalla en la información proporcionada.
- El soporte NPU está limitado al Qualcomm SM8850; otros aceleradores no están cubiertos por los grafos compilados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MiniCPM-OCR-Decision-2B-LiteRT
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Paper de referencia (arXiv:2502.18443): https://arxiv.org/abs/2502.18443
- Repositorio del conjunto olmOCR (referenciado en los ejemplos): no disponible como enlace directo en la información proporcionada
- Documentación de ai-edge-litert: no disponible como enlace directo en la información proporcionada
