# rtr46/vocr6

## Resumen

VOCR6 es un conjunto de modelos ONNX para reconocimiento óptico de caracteres (OCR) especializados en texto de novela visual japonesa, desarrollados originalmente por Autumn (bee-san) dentro del proyecto [vita-vn-ocr](https://github.com/bee-san/vita-vn-ocr). El repositorio `rtr46/vocr6` no contiene modelos entrenados por su autor: es una redistribución de dos reconocedores ONNX publicados upstream, uno para texto horizontal (`VOCR6.2_L_fast.onnx`, copia byte a byte del release oficial) y otro para columnas verticales (`VOCR6_V_fast.onnx`, conversión ONNX del blob int8 upstream realizada con el conversor del propio autor original).

Los modelos son reconocedores de texto de muy pequeño tamaño (2,5 MB y 0,8 MB respectivamente), pensados para integrarse en pipelines de extracción de diálogo y texto de juegos visual novel. No son modelos generativos de lenguaje ni transformers de gran escala: son cabezas de reconocimiento derivadas de un blob propietario `.vocr` y exportadas a ONNX en modo `fast` (kernels float32) para su uso con el runtime ONNX.

La relevancia de esta ficha es acotada: se trata de una redistribución con atribución explícita, útil para desarrolladores que quieran desplegar OCR especializado en texto vertical japonés sin depender del blob original. La licencia efectiva es GPL-3.0-or-later con cláusulas adicionales que restringen el uso a fines no comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Reconocedor OCR propietario VOCR6 (no disponible el detalle interno); exportado a ONNX |
| Parámetros totales | no disponible (tamaños de archivo: 2.525.242 bytes horizontal, 836.932 bytes vertical) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por línea/columna, no de contexto textual) |
| Tipos de cuantización | Blob original int8 (`w8`); export ONNX en modo `fast` con kernels float32 |
| Idiomas soportados | no disponible explícitamente; orientado a texto de novela visual japonesa |
| Licencia | GPL-3.0-or-later con términos adicionales solo-no-comercial |
| Formato de pesos | ONNX (`.onnx`); blobs originales `.vocr` |
| Tamaño horizontal | 2.525.242 bytes (`VOCR6.2_L_fast.onnx`) |
| Tamaño vertical | 836.932 bytes (`VOCR6_V_fast.onnx`) |
| SHA256 horizontal | `3084fb3bd1332832c872009d869d267d5acd1bd69d26c80f742aa2f31a80c938` |
| SHA256 vertical | `080f0651fe2f23e87befea16995c21089e02da85be96b6189c26c2ab413ac5eb` |
| Runtime | ONNX Runtime |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del reconocedor VOCR6: la model card de esta redistribución solo documenta el proceso de exportación, no la topología de red. Se sabe que el modelo original se distribuye como blob propietario `.vocr` en formato int8 (`VOCR6.2_L_w8_2l.vocr` para horizontal, `VOCR6_V_w8.vocr` para vertical) y que el export a ONNX se realiza con `tools/export_onnx.py` del proyecto vita-vn-ocr en modo `fast`, que genera kernels float32 no bit-exactos.

El modelo vertical se exporta con una calibración de cajas de caracteres concreta (`charbox_cal = [-104, 0, 0, 0, 0, 0, 0, 0, 0]`, entrada "V" upstream) y requiere que las columnas verticales se roten en sentido antihorario antes de pasarlas al reconocedor, según la documentación upstream (`docs/vertical.md` y `docs/vocr6v.md`). No se dispone de información sobre volumen de datos de entrenamiento, composición del dataset ni uso de RLHF/DPO, dado que no es un modelo generativo.

## Capacidades

- Reconocimiento de texto horizontal en imágenes (modelo `VOCR6.2_L_fast.onnx`).
- Reconocimiento de texto en columnas verticales (modelo `VOCR6_V_fast.onnx`), previa rotación antihoraria de la columna.
- Extracción de texto de capturas de novela visual japonesa, caso de uso principal del proyecto upstream.
- Ejecución mediante ONNX Runtime, sin dependencias de frameworks de deep learning pesados.
- Modelos de huella mínima (menos de 3 MB en total), aptos para entornos con recursos limitados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni capacidades multimodales más allá del OCR.

## Casos de uso

- Extracción de diálogo de novelas visuales: el reconocedor horizontal procesa líneas de texto de capturas de pantalla para generar transcripciones o subtítulos, aprovechando su entrenamiento específico en tipografías de juegos japoneses.
- Digitalización de texto vertical japonés: el modelo `VOCR6_V_fast.onnx` reconoce columnas de texto tras rotarlas en sentido antihorario, útil para manga, menús verticales o interfaces de juego con disposición en columna.
- Pipelines de traducción automática de juegos: integrar el OCR como etapa previa a un traductor para extraer texto de capturas y alimentar el sistema de traducción, con latencia baja por el tamaño reducido del modelo.
- Archivado y accesibilidad de contenido: generar transcripciones de capturas de novela visual para indexación, búsqueda o lectores de pantalla, ejecutando el modelo en ONNX Runtime en servidor o dispositivo.
- Automatización de QA en localización: comparar el texto renderizado en capturas del juego con las cadenas esperadas para detectar desbordamientos o glifos rotos durante pruebas de localización.
- Procesamiento por lotes en entornos sin GPU: al ser modelos de menos de 3 MB, pueden ejecutarse en CPU con ONNX Runtime para lotes grandes de capturas sin coste de VRAM.
- Herramientas de extracción en escritorio: empaquetar los `.onnx` en aplicaciones ligeras de escritorio para reconocimiento offline de texto de juegos, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño de los pesos (2,5 MB y 0,8 MB) la huella es mínima y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA o DirectML); no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en cualquier modelo con soporte ONNX Runtime, incluidos iGPU y aceleradores integrados.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración en pipelines Python con `onnxruntime`; no se documentan despliegues vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|
| VOCR6 (esta redistribución) | OCR especializado novela visual | ~2,5 MB + ~0,8 MB | GPL-3.0-or-later + no comercial | ONNX en este repo; blobs `.vocr` upstream |
| Tesseract | OCR generalista | no disponible | Apache-2.0 | Amplia, múltiples formatos |
| PaddleOCR | OCR generalista | no disponible | Apache-2.0 | Amplia, ONNX y Paddle |
| EasyOCR | OCR generalista | no disponible | Apache-2.0 | Amplia, PyTorch |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la información proporcionada; la comparación se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos son GPL-3.0-or-later con términos adicionales que limitan el uso a fines no comerciales; no usar comercialmente.
- Redistribución, no autoría: el uploader no entrenó ni modificó los pesos; cualquier incidencia debe reportarse al proyecto upstream vita-vn-ocr.
- El export vertical es en modo `fast` (float32), no bit-exacto respecto al blob int8 original; puede haber diferencias numéricas frente al modelo original.
- Requiere rotación antihoraria previa de las columnas verticales; un preprocesado incorrecto degradará el reconocimiento.
- Especialización limitada: orientado a texto de novela visual japonesa; el rendimiento en otros dominios, tipografías o idiomas no está documentado.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de errores de reconocimiento (sustituciones de caracteres) inherente a OCR; no se documentan tasas de error.
- Idiomas soportados no declarados explícitamente en la información disponible.
- Ausencia de benchmarks publicados impide evaluar su precisión frente a alternativas generalistas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rtr46/vocr6
- Proyecto upstream vita-vn-ocr: https://github.com/bee-san/vita-vn-ocr
- Release horizontal `v0.5.1-onnx.2`: https://github.com/bee-san/vita-vn-ocr/releases/download/v0.5.1-onnx.2/VOCR6.2_L_fast.onnx
- Blob vertical `v0.4.2-vertical6.1`: https://github.com/bee-san/vita-vn-ocr/releases/download/v0.4.2-vertical6.1/VOCR6_V_w8.vocr
- Conversor upstream `tools/export_onnx.py`: https://github.com/bee-san/vita-vn-ocr/tree/v0.5.1-onnx.2
- Documentación vertical upstream: `docs/vertical.md` y `docs/vocr6v.md` en el repositorio vita-vn-ocr
