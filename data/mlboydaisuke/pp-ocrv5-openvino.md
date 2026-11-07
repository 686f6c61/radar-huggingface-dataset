# mlboydaisuke/PP-OCRv5-OpenVINO

## Resumen

PP-OCRv5-OpenVINO es una distribución de los dos grafos principales del sistema OCR PP-OCRv5 (detección de texto y reconocimiento de texto) convertidos a formato ONNX y a OpenVINO IR, con blobs NPU precompilados para aceleradores Intel. El autor, mlboydaisuke, parte de los pesos `ppocr_det_fp16` y `ppocr_rec_fp16` publicados por litert-community en formato LiteRT y los reempaqueta para su ejecución sobre CPU, iGPU y NPU Intel mediante OpenVINO y ONNX Runtime. El repositorio tiene 0,1 GB y no incluye el pipeline completo de OCR, sino únicamente los dos grafos de detección y reconocimiento.

El interés práctico del artefacto es que permite ejecutar OCR de alta precisión en hardware Intel de consumo sin depender del intérprete LiteRT ni de GPU dedicada. El autor documenta latencias medidas en un Core Ultra 9 386H: 8,29 ms por inferencia de detección y 4,95 ms de reconocimiento sobre la NPU Intel AI Boost, frente a 62,66 ms y 17,68 ms respectivamente en CPU. También corrige un fallo conocido de tf2onnx 1.17.0 que eliminaba el sesgo de dos capas FULLY_CONNECTED del grafo de reconocimiento, garantizando equivalencia numérica con el `.tflite` original.

El modelo no es un LLM ni un modelo generativo: es un par de redes convolucionales/transformer de visión especializadas en OCR, heredadas de la familia PaddleOCR PP-OCRv5. Su relevancia actual radica en la optimización para NPU Intel (Core Ultra) y en la disponibilidad de blobs listos para producción, un nicho poco cubierto por las distribuciones OCR convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos grafos independientes: `ppocr_det_fp16` (detección de texto) y `ppocr_rec_fp16` (reconocimiento de texto), heredados de PP-OCRv5 (familia PaddleOCR) |
| Parametros totales | no disponible (el repositorio publica tamaños de fichero, no recuentos de parámetros; `ppocr_det_fp16.onnx` ocupa 17.678.543 bytes y `ppocr_rec_fp16.onnx` 33.763.275 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa secuencias de texto) |
| Tipos de cuantizacion | Pesos fp32 en OpenVINO IR (a partir de grafos fp16); ONNX en fp16; blobs NPU precompilados; se menciona una copia fp16 del `.onnx` para CUDA EP (no incluida en el repo) |
| Idiomas soportados | no disponible en la información proporcionada; la documentación de PP-OCRv5 citada en la búsqueda web indica soporte de chino simplificado, chino tradicional, pinyin, inglés y japonés en un único modelo |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 17, generado con tf2onnx 1.17.0), OpenVINO IR (`.xml` + `.bin`) y blobs NPU (`.blob`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión y optimización de los grafos `ppocr_det_fp16` y `ppocr_rec_fp16` de `litert-community/PP-OCRv5-LiteRT`. El grafo de detección produce mapas de probabilidad de texto a partir de una imagen; el de reconocimiento transforma recortes de línea de texto en secuencias de caracteres. Ambos se exportaron a ONNX con tf2onnx 1.17.0 en opset 17 y después se compilaron a OpenVINO IR con pesos fp32, además de generar blobs NPU con OpenVINO 2026.4.1 sobre el driver Intel NPU 32.0.100.4841.

La innovación técnica documentada es la corrección de un bug de tf2onnx 1.17.0 que descartaba el sesgo de dos capas FULLY_CONNECTED del grafo de reconocimiento; el autor aplica un parche de una línea (`convert/patch_tf2onnx.py`) y verifica que las salidas ONNX coinciden con el `.tflite` original (coseno ≥ 0,9999 en todas las salidas). Los blobs NPU son específicos de versión de OpenVINO y driver: si `import_model` rechaza el blob en otro entorno, debe recompilarse el IR. No se dispone de información sobre el dataset de entrenamiento original de PP-OCRv5, el número de tokens o el uso de RLHF/DPO, ya que el modelo no es lingüístico.

## Capacidades

- Detección de regiones de texto en imágenes (`ppocr_det_fp16`), con salida de mapas de probabilidad consumibles por un paso posterior de decodificación.
- Reconocimiento de texto en recortes de línea (`ppocr_rec_fp16`), con salida de puntuaciones por clase.
- Ejecución en CPU Intel, iGPU Intel y NPU Intel AI Boost mediante OpenVINO; también en GPU NVIDIA mediante ONNX Runtime con CUDA EP.
- Compatibilidad con ONNX Runtime (CPU EP, OpenVINO EP, CUDA EP) y con blobs NPU cargados directamente por OpenVINO.
- Equivalencia numérica verificada frente a los `.tflite` de origen (coseno ≥ 0,9999).
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni generación de texto libre: son modelos de visión especializados.
- Capacidades multilingües: no confirmadas en la información del repositorio; la documentación de PP-OCRv5 referenciada indica cobertura de chino simplificado, chino tradicional, pinyin, inglés y japonés.

## Casos de uso

- Digitalización de documentos en puesto de trabajo Intel: el par de grafos se ejecuta sobre la NPU del Core Ultra con 8,29 ms (detección) y 4,95 ms (reconocimiento) por inferencia, lo que permite procesar páginas escaneadas en local sin GPU dedicada ni servicios en la nube.
- Extracción de texto en aplicaciones de escritorio Windows: al distribuirse como OpenVINO IR y ONNX, puede integrarse en aplicaciones .NET o Python que ya usan OpenVINO Runtime, evitando añadir el intérprete LiteRT.
- Procesamiento por lotes de facturas y formularios: el grafo de detección localiza regiones y el de reconocimiento extrae cadenas; con latencias de milisegundos en iGPU (10,92 ms y 2,55 ms) es viable procesar miles de imágenes por hora en un equipo de sobremesa.
- OCR en dispositivos móviles con SoC Snapdragon: los mismos `.onnx` se perfilan en Qualcomm AI Hub con 7,24 ms (detección) en la NPU del Snapdragon X2 Elite y 7,05 ms en la del Galaxy S26, lo que abre la puerta a aplicaciones Android o Windows on ARM.
- Automatización de accesos y lectura de matrículas o etiquetas: el grafo de detección a 8,29 ms en NPU permite procesar vídeo a decenas de fotogramas por segundo en el propio dispositivo.
- Pipeline de accesibilidad (lectura de documentos para usuarios con discapacidad visual): la combinación detección + reconocimiento a menos de 15 ms por página en NPU hace viable la lectura en tiempo real de material impreso.
- Preprocesado para sistemas RAG sobre documentos escaneados: la salida de reconocimiento alimenta un pipeline de extracción de texto que luego se indexa, con la ventaja de ejecutarse íntegramente en local.

## Benchmarks y rendimiento

El autor publica latencias medidas (no benchmarks de precisión) en un MSI Stealth 16 AI+ con Core Ultra 9 386H, RTX 5080 Laptop a 95 W y Windows 11, del 6 al 7 de noviembre de 2026. Cada fila es una ejecución tras 5 calentamientos y mediana de 30 ejecuciones (o 2 + 10 si la primera tarda más de 3 s).

`ppocr_det_fp16`:

| Procesador | Runtime | Fichero | ms | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob `npu/` | 8,29 | 0,01 | PASS (cos ≥ 0,9996) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 8,35 | 311,11 | FAIL (cos 0,2421) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 10,92 | 2,06 | FAIL (cos 0,9848) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 9,12 | 1,37 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 62,66 | 0,33 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 7,24 | 0,39 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 32,32 (8 capas en CPU) | 13,86 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 7,05 | 0,17 | no comparado |

`ppocr_rec_fp16`:

| Procesador | Runtime | Fichero | ms | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob `npu/` | 4,95 | 0,02 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 4,36 | 7,39 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 2,55 | 1,43 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 8,29 | 1,24 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 17,68 | 0,24 | referencia |

No se publican métricas de precisión OCR (CER, WER, F1) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 0,1 GB; el grafo de detección en OpenVINO IR son 15,96 MB de pesos y el de reconocimiento 32,03 MB. Los blobs NPU son de 12,91 MB y 19,46 MB respectivamente. La huella es mínima y cabe en cualquier equipo con al menos unos cientos de MB libres para el runtime.
- GPU recomendadas: RTX 5080 Laptop (medida, 9,12 ms y 8,29 ms vía CUDA EP); cualquier GPU NVIDIA con soporte CUDA de ONNX Runtime debería funcionar, aunque no hay mediciones publicadas para otras tarjetas.
- iGPU Intel: medida en la iGPU del Core Ultra 9 386H (10,92 ms detección, 2,55 ms reconocimiento), con una verificación de salida que falla en detección (cos 0,9848) pero pasa en reconocimiento.
- NPU Intel AI Boost: soportada mediante blobs precompilados; requiere OpenVINO 2026.4.1 y driver NPU 32.0.100.4841 para cargar el blob directamente, o recompilar el IR en otro entorno.
- Consumer GPU: sí, cabe sobradamente en cualquier GPU de consumo por tamaño; el cuello de botella es la compatibilidad del runtime, no la VRAM.
- Opciones de despliegue: OpenVINO Runtime (IR y blobs NPU), ONNX Runtime con CPU EP, OpenVINO EP, CUDA EP o QNN EP, y Qualcomm AI Hub para perfilar en Snapdragon. No se mencionan llama.cpp, vLLM, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 8,29 ms + 4,95 ms por par detección/reconocimiento en NPU Intel; 62,66 ms + 17,68 ms en CPU; 9,12 ms + 8,29 ms en RTX 5080 Laptop.
- Throughput: no se publica una cifra agregada de imágenes por segundo; puede estimarse a partir de las latencias por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PP-OCRv5-OpenVINO (este) | Detección + reconocimiento OCR, ONNX/IR/blobs NPU | no disponible (17,7 MB + 33,8 MB de ficheros ONNX) | no aplica | 8,29 ms + 4,95 ms en NPU Intel; 62,66 ms + 17,68 ms en CPU | apache-2.0 | Hugging Face, 0 descargas |
| litert-community/PP-OCRv5-LiteRT | Mismo PP-OCRv5 en formato LiteRT (`.tflite`) | no disponible | no aplica | No medido en esta información; es el origen de la conversión | no disponible en la información | Hugging Face |
| openvino-book/PP-OCRv5_OpenVINO | Demo de inferencia PP-OCRv5 con OpenVINO | no disponible | no aplica | No disponible | no disponible | GitHub (demo de proyecto, no pesos) |

La comparativa con modelos OCR alternativos (PaddleOCR estándar, EasyOCR, Tesseract) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo los dos grafos de detección y reconocimiento; no incluye el pipeline completo de OCR (decodificación, orientación, posprocesado), que debe implementarse aparte.
- Los blobs NPU están atados a OpenVINO 2026.4.1 y al driver Intel NPU 32.0.100.4841; en otro entorno `import_model` puede rechazarlos y hay que recompilar el IR.
- El grafo de detección falla la verificación de salida en ONNX Runtime con OpenVINO EP en NPU (cos 0,2421) y en iGPU (cos 0,9848), y produce NaN en la copia fp16 ejecutada con CUDA EP; solo el `.onnx` original con CUDA EP y el blob NPU pasan la verificación.
- La copia fp16 del `.onnx` usada para CUDA EP no está incluida en el repositorio.
- Las filas de Snapdragon proceden de trabajos de perfilado de Qualcomm AI Hub y no fueron comparadas contra la salida de referencia; además, `ppocr_rec_fp16` se midió antes del arreglo del sesgo.
- No hay datos publicados de precisión OCR (CER, WER) en la información disponible; no debe asumirse precisión de producción sin validación propia.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible; al ser un modelo discriminativo, el error típico es de reconocimiento (caracteres mal clasificados), no de generación libre.
- Idiomas soportados no confirmados en el repositorio; la cobertura multilingüe de PP-OCRv5 proviene de la documentación externa citada.
- Licencia apache-2.0 permite uso comercial con atribución y sin garantías; conviene revisar las condiciones del modelo base `litert-community/PP-OCRv5-LiteRT`.
- El modelo no es un LLM: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/PP-OCRv5-OpenVINO
- Modelo base: https://huggingface.co/litert-community/PP-OCRv5-LiteRT
- Repositorio de scripts y mediciones: https://github.com/john-rocky/windows-zoo
- Demo PP-OCRv5 con OpenVINO: https://github.com/openvino-book/PP-OCRv5_OpenVINO
- README del demo: https://github.com/openvino-book/PP-OCRv5_OpenVINO/blob/main/README.md
