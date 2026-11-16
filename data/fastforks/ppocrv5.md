# fastforks/ppocrv5

## Resumen

PP-OCRv5 es un sistema OCR de dos etapas desarrollado por Baidu dentro de la familia PaddleOCR 3 (2025). Combina un detector de líneas de texto basado en DB (Differentiable Binarization) con un reconocedor CTC, y se distribuye en dos variantes: `server` y `mobile`, cada una con su propio par detector/reconocedor. El detector localiza líneas de texto en cualquier orientación como cuádruples, y el reconocedor lee cada línea recortada mediante una transformación de perspectiva. El vocabulario cubre 18 383 caracteres: chino simplificado y tradicional, inglés, japonés y pinyin.

El repositorio `fastforks/ppocrv5` no contiene pesos: es una model card que actúa como manifiesto para que la librería `fastforks` descargue los pesos originales de los repositorios de PaddlePaddle y los verifique contra hashes SHA-256. La inferencia replica el pipeline OCR de PaddleX, omitiendo el enderezado de documentos y el clasificador de orientación de línea. El módulo `portable()` expone el detector con su normalización.

Es relevante porque ofrece una implementación en PyTorch con backend `portable` (y kernels opcionales vía `fastforks/kernels`) que acelera notablemente la inferencia respecto a la implementación original en Paddle, con licencia Apache-2.0 en pesos y código, y uso comercial permitido. La variante `mobile` está pensada para despliegue en GPU de consumo, mientras que `server` prioriza precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector DB: PP-HGNetV2 + LKPAN (server), PP-LCNetV3 + RSE-FPN (mobile). Reconocedor CTC: PP-HGNetV2 / PP-LCNetV3 con cuello SVTR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32, fp16 (probado en backend portable); TensorRT fp16 documentado |
| Idiomas soportados | chino simplificado, chino tradicional, inglés, japonés y pinyin (18 383 caracteres) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `inference.json` + `inference.pdiparams` (Paddle), `config.json` del reconocedor; conversión a ONNX/TensorRT documentada en benchmarks |
| Tarea | OCR (detección + reconocimiento de texto) |
| Entrada | una imagen RGB, cualquier H x W >= 32, con padding a múltiplo de 32 |
| Salidas | `boxes` [N, 4, 2], `texts` [N], `scores` [N] |
| Backends | `portable` (principal); kernels opcionales vía `fastforks/kernels` |
| Variantes | `ppocrv5-mobile@1`, `ppocrv5-server@1` |

## Arquitectura y entrenamiento

El pipeline consta de dos modelos encadenados. El detector DB (PP-HGNetV2 + LKPAN en `server`, PP-LCNetV3 + RSE-FPN en `mobile`) produce cuádruples de líneas de texto en cualquier orientación. Cada línea se recorta mediante un warp de perspectiva y se pasa a un reconocedor CTC (PP-HGNetV2 o PP-LCNetV3 con cuello SVTR) que emite la secuencia de caracteres y una puntuación de confianza por línea. Se omiten respecto a PaddleX el enderezado de documentos y el clasificador de orientación de línea.

El informe técnico de PP-OCRv5 describe el uso de datos de texto públicos y sintéticos, además de datos propios de Baidu; los conjuntos exactos no se listan en la información disponible. No se documentan en esta ficha detalles sobre RLHF, DPO ni número de tokens de entrenamiento. La contribución técnica destacable del repositorio `fastforks` es la reimplementación en PyTorch con backend `portable`, que reduce tiempos de inferencia frente a la implementación original (por ejemplo, 153 ms frente a 619 ms en `mobile` a 1080x1920) y permite aceleración adicional mediante `torch.compile` y TensorRT fp16.

## Capacidades

- Detección de líneas de texto en cualquier orientación, devueltas como cuádruples `[N, 4, 2]`.
- Reconocimiento de texto sobre líneas recortadas con warp de perspectiva.
- Reconocimiento de imágenes completas como una sola línea cuando se usa solo el reconocedor.
- Cobertura de 18 383 caracteres: chino simplificado, chino tradicional, inglés, japonés y pinyin.
- Salida de confianza por línea (`scores`), útil para filtrado y control de calidad.
- Procesamiento de imágenes de gran tamaño: probado hasta 3000x4000 en ambos variantes.
- Backend `portable` en PyTorch, con soporte de fp16 y `torch.compile`.
- Exportación a ONNX y TensorRT fp16 documentada.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo: es un modelo puramente image-to-text.

## Casos de uso

- Digitalización de documentos administrativos: el detector localiza líneas en escaneos con orientaciones variadas y el reconocedor extrae el texto en chino e inglés, adecuado para archivos históricos o formularios heterogéneos.
- Extracción de texto en capturas de pantalla y fotos móviles: la variante `mobile` procesa imágenes de 1080x1920 en 153 ms con 289 MiB de memoria pico, lo que permite integración en apps o servicios de bajo coste.
- Procesamiento por lotes de facturas y tickets: la salida estructurada con `boxes`, `texts` y `scores` facilita el post-procesado y la validación por umbral de confianza.
- Indexación de documentos escaneados para búsqueda: el pipeline convierte imágenes en texto plano listo para motores de búsqueda o bases vectoriales, con soporte de chino tradicional y simplificado en el mismo modelo.
- OCR en entornos con GPU de consumo: la variante `server` procesa 1080x1920 en 277 ms con 1357 MiB pico, viable en una RTX 5060 Ti de 16 GB según los datos del autor.
- Digitalización de material japonés o con pinyin: el vocabulario de 18 383 caracteres cubre japonés e inglés además de chino, útil para corpus multilingües de Asia Oriental.
- Preprocesado para pipelines de VLM: el OCR puede alimentar un modelo de lenguaje con texto extraído de imágenes antes de tareas de comprensión documental.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados por el autor (backend `portable`, fp16, RTX 5060 Ti 16 GB salvo indicación):

| Modelo | Entrada | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Memoria pico original (MiB alloc/reserved) | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `ppocrv5-mobile` | 1080x1920 | 619 | 418 | 153 | 393 / 1005 | 289 / 448 |
| `ppocrv5-server` | 1080x1920 | – | 762 (fp32) | 277 | 2355 / 2901 | 1357 / 1452 |

Aceleración adicional con `torch.compile` y TensorRT fp16 (entrada 1080x1920):

| Modelo | Portable | torch.compile | TensorRT fp16 | Preparación compile (primer arranque) | Preparación ONNX + engine |
|---|---|---|---|---|---|
| `ppocrv5-mobile` | 153 ms | 115 ms | 2,68 ms | 75,0 s | 156 s |
| `ppocrv5-server` | 277 ms | 277 ms | 25,1 ms | no disponible | no disponible |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Primera llamada original (s) | Primera llamada portable (s) |
|---|---|---|---|---|
| `ppocrv5-mobile` | 1,51 | 0,27 | 1,82 | 2,82 |
| `ppocrv5-server` | 2,07 | 0,56 | 2,03 | 1,87 |

Memoria probada a 3000x4000 (portable, fp16): `mobile` 1,4 GiB pico asignado / 2,3 GiB reservado; `server` 7,1 GiB pico asignado / 9,8 GiB reservado.

No se han publicado resultados de benchmarks de precisión (certeza de reconocimiento, F1 de detección) en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PP-OCRv5 (este, vía fastforks) | Detección DB + reconocimiento CTC | Chino simplificado/tradicional, inglés, japonés, pinyin | Apache-2.0 | Paddle, ONNX, TensorRT | Backend portable en PyTorch con aceleración documentada |
| PP-OCRv5 original (PaddlePaddle) | Detección DB + reconocimiento CTC | Idem | Apache-2.0 | Paddle | Implementación de referencia; más lenta según los datos del autor |
| Tesseract OCR | Motor OCR clásico (LSTM) | Amplio, variable por paquete de idioma | Apache-2.0 | Propio | No basado en transformer; sin detección de orientación arbitraria tan robusta |
| EasyOCR | Detección CRAFT + reconocimiento CRNN | ~80 idiomas | Apache-2.0 | PyTorch | Más idiomas, pero sin los benchmarks de velocidad de este repositorio |

No se dispone de datos comparativos de precisión frente a estos modelos en la información proporcionada; la comparación se limita a características y disponibilidad.

## Limitaciones y advertencias

- El repositorio no contiene pesos: requiere descargar los archivos de PaddlePaddle y verificar los SHA-256, lo que añade un paso de red y comprobación.
- El pipeline omite el enderezado de documentos y el clasificador de orientación de línea presentes en PaddleX; documentos muy rotados o curvados pueden degradar la precisión.
- El vocabulario cubre 18 383 caracteres centrados en chino, inglés, japonés y pinyin; otros alfabetos (cirílico, árabe, devanagari, coreano) no están soportados.
- No se han publicado métricas de precisión (exactitud, F1) en la información disponible; la evaluación debe hacerse sobre el dominio concreto.
- Riesgo de alucinación de caracteres en imágenes de baja calidad, ruido o texto muy pequeño; conviene filtrar por el campo `scores`.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que las cadenas de licencia del código original se registran tal cual y deben revisarse antes de otros usos.
- El backend `kernels` no tiene datos de rendimiento publicados en la tabla de benchmarks; su disponibilidad práctica no está verificada en esta ficha.
- La aceleración con TensorRT requiere preparación de 156 s (mobile) y no hay datos para server; no es adecuada para arranques en frío frecuentes.
- Los benchmarks de velocidad se han medido en una RTX 5060 Ti 16 GB; el rendimiento en otras GPU puede diferir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/ppocrv5
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels para backend `kernels`: https://huggingface.co/fastforks/kernels
- Pesos originales detector mobile: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det
- Pesos originales reconocedor mobile: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_rec
- Pesos originales detector server: https://huggingface.co/PaddlePaddle/PP-OCRv5_server_det
- Pesos originales reconocedor server: https://huggingface.co/PaddlePaddle/PP-OCRv5_server_rec
- Código original PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Licencia original: https://github.com/PaddlePaddle/PaddleOCR/blob/dab3fe35379033fdcb2d0e9572fac0b36c9a9ebf/LICENSE
- Manifiesto de hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/ocr/models/ppocrv5/card.toml
