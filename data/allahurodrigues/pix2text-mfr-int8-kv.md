# allahurodrigues/pix2text-mfr-int8-kv

## Resumen

pix2text-mfr-int8-kv es una reexportación cuantizada del modelo breezedeus/pix2text-mfr, un sistema de reconocimiento de fórmulas matemáticas en imágenes (image-to-text) que convierte capturas de expresiones matemáticas en código LaTeX. Lo desarrolla el usuario allahurodrigues a partir del modelo original de Breezedeus, sin reentrenamiento alguno: se trata exclusivamente de un trabajo de conversión de formato y optimización para inferencia en dispositivo. La relevancia actual reside en que reduce el peso de los artefactos de 117,6 MB (fp32 ONNX) a 41,2 MB (int8 ONNX) manteniendo la precisión medida, lo que lo hace viable en entornos con recursos limitados.

Arquitectónicamente es un VisionEncoderDecoderModel (encoder visual tipo TrOCR, heredado de pesos de Microsoft TrOCR con licencia MIT, más un decoder de lenguaje para generar la secuencia LaTeX). El paquete incluye tres grafos ONNX separados: encoder, decoder para el primer paso y decoder_with_past con caché de clave-valor para generación token a token, lo que evita recalcular el contexto en cada paso.

La contribución principal es práctica: un pipeline de exportación reproducible con optimum-cli y cuantización dinámica int8 de pesos MatMul y Gemm mediante onnxruntime, con verificación numérica frente al modelo original (diferencia máxima de 1,7e-5 en la salida del encoder y 1,6e-5 en los logits). Está pensado para reconocimiento de fórmulas en local, sin GPU y con latencia baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (encoder visual + decoder autoregresivo), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (QUInt8) sobre pesos MatMul y Gemm |
| Idiomas soportados | no disponible (la salida es LaTeX, independiente del idioma natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder_model, decoder_model, decoder_with_past_model) + vocabulario |

## Arquitectura y entrenamiento

El modelo es un VisionEncoderDecoderModel: un encoder visual procesa la imagen de la fórmula y un decoder de lenguaje genera la secuencia LaTeX correspondiente. El modelo original parte de pesos de Microsoft TrOCR (MIT) y fue entrenado por Breezedeus; esta reexportación no reentrena nada, solo reconstruye el grafo PyTorch desde los ficheros ONNX originales (inicializadores con nombre cargados directamente y pesos de MatMul sin nombre recuperados del grafo junto con su Add de sesgo) y lo vuelve a exportar con `optimum-cli export onnx --task image-to-text-with-past` usando transformers 4.57.6.

La innovación técnica es doble. Por un lado, la separación en tres grafos con caché de clave-valor (`decoder_model` para el primer paso y `decoder_with_past_model` para un token por paso), que evita recomputar la atención sobre el prefijo generado. Por otro, la cuantización dinámica int8 de los pesos MatMul y Gemm con onnxruntime 1.32, que reduce el tamaño de 117,6 MB a 41,2 MB (encoder 23,9 MB, decoder 9,3 MB, decoder with past 8,0 MB, vocabulario 39 KB). La validación numérica frente al ONNX original con onnxruntime sobre entrada aleatoria dio una diferencia máxima de 1,7e-5 en la salida del encoder y 1,6e-5 en los logits. No se publica información sobre el dataset de entrenamiento original ni sobre el número de tokens utilizados.

## Capacidades

- Reconocimiento de fórmulas matemáticas en imágenes y conversión a código LaTeX.
- Generación autoregresiva con caché de clave-valor para decodificación token a token eficiente.
- Inferencia en dispositivo (on-device) sin GPU, gracias al formato ONNX int8.
- Integración en pipelines nativos mediante runtimes ONNX; el autor valida con rten 0.28 en Rust.
- Procesamiento de fórmulas impresas y sintéticas; el autor advierte que las métricas publicadas se obtuvieron con fórmulas sintéticas, impresas y sencillas.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de apuntes y libros de texto: el modelo convierte recortes de fórmulas impresas en LaTeX editable, adecuado por su tamaño reducido (41,2 MB) para ejecutarse dentro de una aplicación de escritorio o móvil sin conexión.
- Edición de documentos científicos: integrado en un editor Markdown o LaTeX, permite al usuario pegar una captura de una ecuación y obtener el código correspondiente, con latencia medida de 176 ms por fórmula en un Apple M1 Max.
- Procesamiento por lotes de corpus académicos: al ser ONNX int8 y no requerir GPU, se puede desplegar en servidores CPU para extraer fórmulas de PDFs escaneados en pipelines de indexación o minería de datos científicos.
- Aplicaciones educativas offline: un tutor de matemáticas puede reconocer la ecuación escrita o impresa por el estudiante y compararla con la solución, ejecutándose en el propio dispositivo del alumno.
- Herramientas de accesibilidad: conversión de material matemático en imagen a LaTeX para su lectura por sintetizadores de voz o lectores de pantalla que interpretan LaTeX.
- Integración en sistemas de gestión documental: extracción de fórmulas de informes técnicos o patentes para su búsqueda y recuperación semántica, aprovechando el bajo consumo de memoria (118 MB de pico medido).
- Prototipado en Rust o C++: el autor valida el modelo con el runtime rten, por lo que encaja en aplicaciones nativas que necesitan reconocimiento de fórmulas sin dependencias de Python.

## Benchmarks y rendimiento

Datos medidos por el autor con 300 fórmulas sintéticas renderizadas con MathJax y las 30 del split de test fijo, usando el mismo pipeline en Rust (rten 0.28) para ambos modelos, en un Apple M1 Max con carga media 11:

| Metrica | Original fp32 | Este int8 + cache |
|---|---|---|
| Precisión por token (bootstrap 95 %) | 0,986 [0,961; 1,000] | 0,986 [0,961; 1,000] |
| Exact match (Wilson 95 %) | 28 de 30 | 28 de 30 |
| Acuerdo estructural | 30 de 30 | 30 de 30 |
| Tiempo por fórmula | 648 ms [539; 788] | 176 ms [161; 193] |
| Memoria pico | 168 MB | 118 MB |

El autor advierte explícitamente que estos números comparan los dos ficheros entre sí y dicen poco sobre páginas reales, al haberse obtenido con fórmulas sintéticas, impresas y sencillas. No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU y ejecución en dispositivo. Memoria pico medida de 118 MB en int8 frente a 168 MB en fp32.
- GPU recomendadas: no disponibles; no se documenta uso de GPU. El autor mide en un Apple M1 Max por CPU con el runtime rten.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles o sistemas embebidos, dado el tamaño del paquete (41,2 MB) y el pico de memoria.
- Opciones de despliegue: onnxruntime (validado en la exportación y cuantización), rten 0.28 en Rust (validado en las mediciones), y cualquier runtime compatible con ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: 176 ms por fórmula en Apple M1 Max con carga media 11 (mediana del intervalo [161; 193] ms); el original fp32 tarda 648 ms en las mismas condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pix2text-mfr-int8-kv (este) | no disponible | no disponible | ONNX int8 | MIT | 41,2 MB, 176 ms por fórmula, 118 MB pico |
| breezedeus/pix2text-mfr (original) | no disponible | no disponible | ONNX fp32 | MIT | 117,6 MB, 648 ms por fórmula, 168 MB pico |
| Microsoft TrOCR | no disponible | no disponible | PyTorch | MIT | Base del encoder del modelo original; no especializado en fórmulas |

No se dispone de datos de otros modelos comparables de reconocimiento de fórmulas (por ejemplo, variantes de LaTeX-OCR o Nougat) en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas se obtuvieron con fórmulas sintéticas, impresas y sencillas; el propio autor advierte que no son representativas de páginas reales con ruido, manuscritos o baja resolución.
- El modelo original no publica las imágenes de fórmulas con las que fue entrenado, por lo que se desconoce la composición y posibles sesgos del dataset.
- No se documentan los idiomas soportados ni el comportamiento ante fórmulas escritas a mano.
- Riesgo de alucinación: como modelo generativo autoregresivo, puede producir LaTeX sintácticamente válido pero incorrecto respecto a la imagen de entrada; el acuerdo estructural medido (30 de 30) solo cubre el conjunto sintético evaluado.
- La licencia MIT permite uso comercial, pero se heredan las obligaciones de atribución de copyright de Breezedeus y de Microsoft TrOCR.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es 0,0 GB; conviene verificar la integridad de los ficheros antes de usarlo en producción.
- No hay información sobre el contexto máximo del decoder ni sobre el límite de longitud de las fórmulas que puede generar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allahurodrigues/pix2text-mfr-int8-kv
- Modelo base: https://huggingface.co/breezedeus/pix2text-mfr
- Repositorio del proyecto Pix2Text: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
