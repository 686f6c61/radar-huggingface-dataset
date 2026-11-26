# anguoyang/pp-ocrv5-mobile-rknn-rk3588

## Resumen

PP-OCRv5 mobile (det + rec) para RK3588 es una conversión a formato RKNN de los modelos de detección y reconocimiento de texto de PP-OCRv5 mobile, la familia de OCR de PaddleOCR. El autor del repositorio es anguoyang, que publica los binarios ya compilados para la NPU del SoC Rockchip RK3588, generados con rknn-toolkit2 2.3.2 en precisión FP y sin cuantización, a partir del repack ONNX `bukuroo/PPOCRv5-ONNX` (origen: PaddleOCR, Apache-2.0). Incluye el diccionario de 18.383 caracteres necesario para decodificar la salida del reconocedor.

El paquete resuelve un problema muy concreto: desplegar OCR en dispositivos de borde con NPU Rockchip sin tener que pasar por el proceso de conversión ONNX a RKNN, que requiere versiones específicas de toolkit y calibración. El modelo de detección tiene entrada estática de 1×3×640×640 y el de reconocimiento 1×3×48×320 con 18.385 clases de salida. Es relevante para proyectos de visión embebida que necesitan leer texto en chino e inglés con latencias de decenas a cientos de milisegundos sobre hardware de bajo consumo.

La ficha del autor incluye mediciones independientes en RK3588 (tres sesiones, mediana) que sirven para calibrar expectativas: buena precisión en líneas de texto cortas y nombres de comercios, pero debilidad marcada en importes decimales pequeños, con 4 de 5 líneas de precio erróneas en la prueba de un recibo. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv5 mobile: detector DB (Differentiable Binarization) + reconocedor CRNN con CTC; conversión a RKNN para NPU RK3588 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP sin cuantización (conversión rknn-toolkit2 2.3.2); no se publican variantes INT8/INT16 |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | RKNN (`.rknn`); diccionario en texto plano (`ppocrv5_dict.txt`) |
| Entrada del detector | 1×3×640×640 estática |
| Entrada del reconocedor | 1×3×48×320 estática |
| Clases de salida (rec) | 18.385 |
| Diccionario de caracteres | 18.383 entradas |
| Hardware objetivo | Rockchip RK3588 (NPU) |

## Arquitectura y entrenamiento

El pipeline sigue el esquema clásico de PaddleOCR: un detector basado en DB (Differentiable Binarization) que localiza regiones de texto y un reconocedor CRNN con decodificación CTC que transcribe cada recorte. La conversión a RKNN fija las formas de entrada, de modo que el detector trabaja siempre a 640×640 y el reconocedor a 48×320, lo que implica que las imágenes no cuadradas se estiran antes de la inferencia. No se publican datos sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o aumentos de datos); esa información corresponde al proyecto PaddleOCR y no se reproduce en esta ficha.

La innovación relevante aquí no está en el entrenamiento sino en el empaquetado: binarios RKNN listos para la NPU RK3588 con precisión FP, sin cuantización, lo que evita la pérdida de precisión típica de las conversiones INT8 apresuradas y simplifica el despliegue. El autor documenta un detalle operativo importante: las cajas de DB salen reducidas por diseño y deben expandirse (unclip, factor aproximado de 1,9 sobre el rectángulo de área mínima) antes de recortar para el reconocedor; si no se hace, los caracteres se recortan y la precisión se desploma.

## Capacidades

- Detección de regiones de texto en imágenes mediante DB, con salida de cajas delimitadoras.
- Reconocimiento de texto en chino e inglés sobre los recortes detectados.
- Diccionario de 18.383 caracteres incluido para la decodificación CTC.
- Ejecución sobre NPU RK3588 con latencias medidas en el propio dispositivo.
- Pipeline completo detección + reconocimiento en un solo paquete de dos modelos.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.
- No incluye corrección ortográfica ni post-procesado lingüístico; la salida es texto plano por caja.

## Casos de uso

- Digitalización de carteles y rótulos comerciales: el modelo reconoce bien nombres de comercios y productos en chino; con 203,1 ms de extremo a extremo en una imagen de 900×500 y 91,3% de precisión por carácter, es adecuado para lectura de señalética en quioscos o paneles informativos.
- Lectura de etiquetas y packaging en líneas de producción: el reconocedor de 48×320 procesa recortes de texto corto con baja latencia, integrable en una cadena de captura con cámara y NPU RK3588 en el propio dispositivo.
- Preprocesado documental con revisión humana: dado el mal resultado en importes decimales (4 de 5 líneas de precio erróneas en la prueba de recibo), el modelo sirve para extraer el texto bruto y delegar la validación de cifras a un paso posterior o a un operador.
- Indexación de texto en imágenes para motores de búsqueda internos: el pipeline det+rec permite generar metadatos textuales de un archivo de imágenes sin salir del dispositivo, útil en entornos con requisitos de privacidad.
- Asistencia a la accesibilidad: transcripción de texto presente en el entorno capturado por cámara en dispositivos embebidos, con la ventana de 640×640 como límite práctico de resolución efectiva.
- Automatización de inventario en comercio minorista: lectura de etiquetas de estantería y nombres de producto, aceptando que los precios requieren verificación adicional.
- Prototipado rápido en RK3588: al venir los binarios ya convertidos, permite validar un caso de OCR en horas en lugar de montar el pipeline de conversión RKNN desde cero.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en RK3588 (prueba independiente, 3 sesiones, mediana):

| Imagen | Detección | Extremo a extremo | Cajas | Precisión por carácter |
|---|---|---|---|---|
| Rótulo de tienda 900×500 | 89,5 ms | 203,1 ms | 3 | 91,3% |
| Recibo 800×1000 | 69,4 ms | 458,7 ms | 11 | 63,2% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos de OCR sobre el mismo conjunto de prueba.

## Requisitos de hardware

- NPU Rockchip RK3588 obligatoria: los binarios `.rknn` no se ejecutan en GPU NVIDIA ni en CPU x86 sin reconversión.
- Memoria: no se publica el consumo de VRAM/RAM del acelerador; el repositorio ocupa 0,0 GB y los modelos mobile son de tamaño reducido, pero no hay cifra oficial.
- No cabe en GPU de consumo tipo RTX 4090 ni en A100/H100: el formato RKNN está atado al runtime de Rockchip.
- Despliegue mediante el runtime RKNN de Rockchip (librería `librknnrt`), no mediante vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia medida: 203,1 ms extremo a extremo en rótulo de 900×500 y 458,7 ms en recibo de 800×1000, con 3 y 11 cajas respectivamente.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Hardware | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| PP-OCRv5 mobile RKNN (este) | RKNN | NPU RK3588 | zh, en | Apache-2.0 | Binarios listos, FP sin cuantizar, mediciones en dispositivo |
| PaddleOCR PP-OCRv5 mobile (ONNX) | ONNX | CPU/GPU genérica | zh, en | Apache-2.0 | Requiere runtime ONNX; sin optimización NPU |
| PaddleOCR PP-OCRv5 (upstream Paddle) | Paddle | CPU/GPU | multilingüe según variante | Apache-2.0 | Pipeline completo con pre/post-procesado propio |
| Repack `bukuroo/PPOCRv5-ONNX` | ONNX | CPU/GPU genérica | zh, en | Apache-2.0 | Origen de la conversión de este repositorio |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Debilidad documentada en importes decimales pequeños: en la prueba de recibo, 4 de 5 líneas de precio fallaron y el total no se detectó. Cualquier uso con cifras monetarias exige verificación.
- Las cajas de DB salen reducidas por diseño; sin aplicar unclip (aproximadamente 1,9× sobre el rectángulo de área mínima) los caracteres se recortan y la precisión cae.
- La entrada del detector está fijada a 640×640, por lo que las imágenes no cuadradas se estiran; esto forma parte de las condiciones medidas y afecta a la precisión en documentos alargados.
- Solo chino e inglés; no hay soporte de otros alfabetos ni de escritura vertical documentado.
- Riesgo de alucinación en el reconocedor: al ser un modelo CTC sobre un diccionario cerrado, puede producir caracteres plausibles pero incorrectos en regiones de baja calidad, sin señal de confianza publicada.
- Licencia Apache-2.0, que permite uso comercial, pero conviene conservar los avisos de atribución del proyecto PaddleOCR original.
- Sin cuantización: la precisión FP es mayor, pero el rendimiento y el consumo no están optimizados para el presupuesto térmico de todos los dispositivos RK3588.
- Repositorio sin descargas ni likes en el momento de la consulta y con tamaño de 0,0 GB, lo que puede indicar que los binarios no están efectivamente alojados o que el repo está vacío; verificar la integridad con `SHA256SUMS` antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/anguoyang/pp-ocrv5-mobile-rknn-rk3588
- Repack ONNX de origen: https://huggingface.co/bukuroo/PPOCRv5-ONNX
- PaddleOCR (proyecto upstream): https://github.com/PaddlePaddle/PaddleOCR
- rknn-toolkit2: https://github.com/airockchip/rknn-toolkit2
