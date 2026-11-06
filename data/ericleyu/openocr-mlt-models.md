# ericleyu/openocr-mlt-models

## Resumen

`openocr-mlt-models` es un paquete de modelos ONNX en FP32 para reconocimiento óptico de caracteres (OCR) multilingüe, publicado por el usuario ericleyu en Hugging Face. El bundle combina un motor de reconocimiento autoregresivo denominado ScriptMoE (con etapas Prefill/Decode y caché KV) y un detector de texto PP-OCRv6 medium, ambos exportados a ONNX. Está pensado para consumirse a través del paquete Python `openocr-mlt`, que ofrece tres tareas: OCR de página completa, detección de texto y reconocimiento sobre recortes.

El interés del proyecto reside en su enfoque multilingüe y en el uso de una arquitectura tipo ScriptMoE para el reconocimiento, junto con una integración práctica vía ONNX Runtime que permite ejecución en CPU y en GPU NVIDIA sin depender de PyTorch. El archivo principal (`scriptmoe-medium-fp32-20261101-v1.tar.gz`) ocupa 213.794.128 bytes (aproximadamente 0,2 GB) y el repositorio contiene 40 ficheros entre grafos de reconocimiento, pesos compartidos, diccionario de caracteres, manifiesto y detector.

La información pública disponible es limitada: no se especifican parámetros totales, longitud de contexto lingüístico ni licencia explícita en la model card, más allá de la referencia a `THIRD_PARTY_NOTICES.md`. La evaluación reportada cubre reconocimiento sobre TextMuSS y OCR de página completa sobre un subconjunto de CC-OCR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ScriptMoE (reconocimiento autoregresivo con Prefill/Decode y KV caching) + PP-OCRv6 medium (detección) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (ScriptMoE sugiere arquitectura MoE, pero no se publica el desglose) |
| Longitud de contexto | no disponible (máximo de reconocimiento: 100 pasos de decodificación) |
| Tipos de cuantización | FP32 únicamente (según model card) |
| Idiomas soportados | multilingüe (sin listado explícito); el subconjunto CC-OCR usado en evaluación cubre 10 idiomas |
| Licencia | no disponible (se remite a `THIRD_PARTY_NOTICES.md`) |
| Formato de pesos | ONNX (grafos Prefill/Decode, pesos compartidos, detector ONNX) |

## Arquitectura y entrenamiento

El componente de reconocimiento es ScriptMoE, un modelo autoregresivo con etapas separadas de Prefill y Decode y caché KV, exportado a ONNX. La etapa CUDA Prefill se compone de 33 grafos particionados con pesos compartidos, y el paquete Python selecciona la ruta de ejecución CPU o CUDA en función del dispositivo. El componente de detección es PP-OCRv6 medium en ONNX, procedente del almacén oficial de modelos de Paddle. El reconocimiento deriva del repositorio ScriptMoE en la revisión `5dde99867aaee6b4af3e75a3020b225eab17ac53`.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se especifica el número de parámetros del modelo ni la configuración interna de expertos. La innovación técnica destacable es la exportación a ONNX de un pipeline OCR completo con decodificación autoregresiva y caché KV, validado con ONNX Runtime 1.20.0 y el paquete `openocr-mlt` 0.5.1.

## Capacidades

- Reconocimiento de texto multilingüe sobre recortes de imagen (tarea `rec`), con puntuación de confianza por línea.
- Detección de regiones de texto en página completa (tarea `det`), devolviendo cajas delimitadoras con puntos.
- OCR de página completa (tarea `ocr`), combinando detección y reconocimiento en un único pipeline.
- Procesamiento de imágenes en formato PIL o arrays NumPy uint8 (BGR por defecto, RGB seleccionable con `color_order="RGB"`).
- Ejecución en CPU y en GPU NVIDIA CUDA en Linux x86_64, con selección automática de dispositivo (`device="auto"`).
- Soporte de uso offline mediante `fetch-models` y verificación de integridad por SHA256 de los 40 ficheros del bundle.
- No se documenta soporte de tool calling, agentes, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de documentos multilingües: el pipeline `ocr` procesa páginas completas combinando PP-OCRv6 medium para detección y ScriptMoE para reconocimiento, adecuado para archivos con mezcla de escrituras.
- Extracción de texto en recortes para pipelines de ingesta: la tarea `rec` devuelve texto y score por línea, lo que permite filtrar por umbral de confianza (0,5 por defecto en la API, 0,7 en la evaluación reportada).
- Procesamiento por lotes en servidores sin GPU: la ruta CPU con ONNX Runtime permite desplegar OCR en entornos Linux x86_64 sin dependencia de PyTorch.
- Despliegue en edge o entornos aislados: el uso offline con `fetch-models --offline` y la verificación SHA256 facilitan instalaciones en máquinas sin acceso a red.
- Detección previa de regiones de texto: la tarea `det` permite localizar cajas antes de aplicar recortes selectivos, útil en sistemas de indexación documental.
- Integración en aplicaciones Python de terceros: la API `OpenOCRMLT` con gestor de contexto (`with`) simplifica el uso embebido en servicios de extracción de texto.
- Evaluación de calidad sobre dominios concretos: los umbrales y el límite de 100 pasos de decodificación permiten ajustar el comportamiento en función del tipo de documento.

## Benchmarks y rendimiento

| Tarea | Datos | Métrica | Resultado |
|---|---|---|---:|
| Reconocimiento, CUDA | TextMuSS, 10.899 recortes | Precisión ponderada normalizada oficial | 85,0812% |
| Reconocimiento, CUDA | TextMuSS, 10.899 recortes | Precisión macro en diez grupos | 81,0928% |
| OCR de página completa, CPU y CUDA | Subconjunto fijo CC-OCR, 100 páginas held-out | F1 macro de texto | 72,5849% |
| OCR de página completa, CPU y CUDA | Subconjunto fijo CC-OCR, 100 páginas held-out | F1 micro de texto | 79,4545% |

Las evaluaciones se realizaron con FP32, batch efectivo 1, umbral de reconocimiento 0,7, lado máximo de página 2.000 píxeles y límite de 100 pasos de decodificación. El subconjunto CC-OCR contiene 200 páginas en diez idiomas, divididas en 100 de desarrollo y 100 held-out. La evaluación histórica de calidad se hizo con `openocr-mlt 0.3.0.dev14`. No se publican comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el bundle de modelos ocupa aproximadamente 0,2 GB en disco.
- GPU validadas: NVIDIA RTX 3090 (entorno de verificación documentado en Ubuntu 22.04.5 x86_64, Python 3.10.12, ONNX Runtime 1.20.0).
- CPU: ejecución validada en Linux x86_64 con selección automática de dispositivo.
- Primer uso en GPU: puede requerir aproximadamente 1,32 GB adicionales de librerías CUDA 12 y cuDNN 9.
- Dependencias de terceros: descargas por defecto de aproximadamente 385 MB en Linux x86_64.
- Despliegue: ONNX Runtime 1.20.0; paquete `openocr-mlt` 0.5.1; soporte offline mediante `fetch-models`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Otras plataformas distintas de Linux x86_64 requieren validación separada según la model card.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- La model card no especifica licencia explícita; el uso comercial queda sujeto a lo indicado en `THIRD_PARTY_NOTICES.md`, que no se incluye en la información disponible.
- No se detalla la lista completa de idiomas soportados; la evaluación cubre diez idiomas vía CC-OCR, pero no se garantiza cobertura fuera de ese conjunto.
- El límite de 100 pasos de decodificación acota la longitud de texto reconocible por llamada.
- El umbral de reconocimiento por defecto (0,5) difiere del usado en la evaluación (0,7), lo que puede alterar los resultados respecto a las métricas publicadas.
- El redimensionado de página está desactivado por defecto en la API, mientras que la evaluación usó un lado máximo de 2.000 píxeles.
- Solo se valida Linux x86_64; otras plataformas requieren verificación independiente.
- Se observó una diferencia de espacios en blanco en reconocimiento entre dispositivos durante la evaluación histórica en TextMuSS.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de dominio.
- La ejecución en CUDA requiere drivers NVIDIA compatibles y librerías CUDA 12/cuDNN 9.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ericleyu/openocr-mlt-models
- Árbol de ficheros: https://huggingface.co/ericleyu/openocr-mlt-models/tree/main
- Paquete en PyPI: https://pypi.org/project/openocr-mlt/
- Repositorio ScriptMoE: https://github.com/YesianRohn/ScriptMoE
- Avisos de terceros: https://huggingface.co/ericleyu/openocr-mlt-models/blob/main/THIRD_PARTY_NOTICES.md
