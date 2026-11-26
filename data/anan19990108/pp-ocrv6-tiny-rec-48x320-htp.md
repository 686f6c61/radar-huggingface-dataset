# anan19990108/pp-ocrv6-tiny-rec-48x320-htp

## Resumen

PP-OCRv6 Tiny Recognition 48×320 es un modelo de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto, empaquetado y redistribuido por el usuario anan19990108 a partir del checkpoint original `inference.onnx` de PaddlePaddle. El modelo recibe un recorte de imagen de 48×320 píxeles correspondiente a una línea de texto y devuelve la secuencia de caracteres reconocida mediante decodificación CTC. Se distribuye en tres formatos: ONNX FP32 (4,44 MB), TFLite de referencia (4,45 MB) y un contexto QNN precompilado (2,54 MB) para el acelerador HTP v73 del SoC Qualcomm QCS8550 bajo Android.

El interés de este paquete no reside en el modelo en sí, sino en su empaquetado orientado a despliegue en el borde (edge computing): incluye artefactos listos para ejecutarse sobre el Hexagon Tensor Processor de Qualcomm mediante QAIRT 2.47, junto con mediciones de latencia y precisión en placa real. Es un ejemplo de integración de un reconocedor OCR ligero en pipelines de inferencia heterogéneos (CPU, GPU, NPU) dentro de dispositivos móviles y embebidos.

El modelo es extremadamente pequeño (del orden de pocos millones de parámetros, dado un peso de 4,44 MB en FP32) y está pensado exclusivamente para la tarea de reconocimiento de líneas de texto ya recortadas; la detección de texto y el preprocesamiento de imagen quedan fuera del modelo y deben ejecutarse en el host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional con cabecera de decodificacion CTC (arquitectura exacta no disponible; derivada de PP-OCRv6) |
| Parametros totales | no disponible (peso FP32 de 4,44 MB, lo que sugiere del orden de ~1,1 M de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 48×320 pixeles (linea de texto) |
| Tipos de cuantizacion | FP32 (ONNX y TFLite de referencia); contexto QNN precompilado para HTP (precision no especificada en la informacion disponible) |
| Idiomas soportados | no disponible (el diccionario empaquetado determina el juego de caracteres) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, TFLite, QNN context bin (context_qnn.bin) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un reconocedor de lineas de texto basado en el checkpoint `inference.onnx` de PaddlePaddle/PP-OCRv6_tiny_rec_onnx. Por la naturaleza del pipeline PP-OCR y el uso de decodificacion CTC explicita en el host, se trata de una red convolucional que produce una secuencia de logits por posicion temporal, que luego se decodifica con CTC para obtener la cadena de caracteres. La entrada esta fijada a 48×320 pixeles, formato tipico de los reconocedores de lineas de PP-OCR.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO (poco probables en un modelo OCR de este tamano). El paquete redistribuido no reentrena el modelo: toma el checkpoint original de PaddlePaddle y lo convierte a TFLite y a un contexto QNN compilado con QAIRT 2.47 para el HTP v73 del QCS8550. El preprocesamiento de imagen y la decodificacion CTC se ejecutan en el host, no en el modelo.

## Capacidades

- Reconocimiento de texto en recortes de linea de 48×320 pixeles, devolviendo la secuencia de caracteres mediante CTC.
- Ejecucion en CPU (ONNX Runtime, TFLite), en GPU/navegador via ONNX y en el NPU Hexagon HTP v73 de Qualcomm mediante el contexto QNN precompilado.
- Despliegue en Android sobre el SoC QCS8550 con QAIRT 2.47.
- No incluye deteccion de texto: requiere que el recorte de linea se proporcione ya extraido.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision general, audio ni capacidades multimodales mas alla del OCR.
- Capacidades multilingues: no disponibles; dependen del diccionario empaquetado, no documentado en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos en dispositivos moviles: el modelo reconoce lineas de texto recortadas por un detector previo, con un peso de 4,44 MB que permite incluirlo en una app Android sin inflar el APK.
- Lectura de tickets y recibos en terminales de punto de venta: la latencia medida en placa (6,667 ms p50 para `Session.Run`) permite procesar lineas en tiempo real dentro del flujo de captura de camara.
- Extraccion de texto en escenarios de borde sin conectividad: al ejecutarse sobre el HTP del QCS8550, el reconocimiento ocurre en el dispositivo sin enviar imagenes a la nube, lo que reduce coste y mejora la privacidad.
- Procesamiento por lotes de recortes de linea en servidores CPU: el artefacto ONNX FP32 funciona con ONNX Runtime en CPU, adecuado para pipelines de digitalizacion masiva donde no hay NPU disponible.
- Integracion en sistemas de lectura de matricula o señaletica: cualquier tarea que produzca recortes de linea fijos de 48×320 puede reutilizar el modelo directamente.
- Prototipado e investigacion en OCR embebido: el paquete incluye scripts de inferencia, sumas SHA256 y resultados de evaluacion, lo que facilita reproducir las mediciones y comparar delegados de ejecucion (CPU, TFLite, QNN EP, QNN nativo).

## Benchmarks y rendimiento

Los resultados publicados por el autor se midieron sobre 100 recortes de validacion de lineas de texto del proyecto original:

| Metrica | CPU referencia | TFLite HTP | ONNX QNN EP | QNN nativo |
|---|---|---|---|---|
| Precision exacta (sensible a mayusculas) | 50 % | 50 % | 51 % | 51 % |
| Latencia p50 `Session.Run` (ms) | no disponible | no disponible | no disponible | 6,667 |
| Latencia p95 `Session.Run` (ms) | no disponible | no disponible | no disponible | 6,755 |
| Latencia p50 TFLite `Invoke` (ms) | no disponible | no disponible | no disponible | 6,703 |
| Latencia p95 TFLite `Invoke` (ms) | no disponible | no disponible | no disponible | 6,784 |

Las latencias corresponden a la placa Android con QCS8550 tras 10 calentamientos y son tiempos de red para la compilacion en coma flotante. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo OCR.

## Requisitos de hardware

- VRAM/espacio en memoria: el modelo FP32 ocupa 4,44 MB en disco y un espacio similar en memoria; el contexto QNN ocupa 2,54 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para aceleracion, el HTP v73 del Qualcomm QCS8550 es el objetivo documentado.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores con suficiente RAM, dado su tamano reducido.
- Opciones de despliegue: ONNX Runtime (CPU y QNN Execution Provider), TFLite con delegado QNN, y ejecucion nativa QNN mediante QAIRT 2.47 en Android.
- Latencia medida: 6,667 ms p50 y 6,755 ms p95 en `Session.Run`; 6,703 ms p50 y 6,784 ms p95 en TFLite `Invoke` sobre QCS8550.
- Throughput estimado: no disponible de forma explicita, aunque la latencia por linea sugiere del orden de 140-150 lineas por segundo en un solo hilo del HTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PP-OCRv6 Tiny Rec 48×320 (este) | no disponible (~1,1 M estimado) | 48×320 pixeles | 50-51 % exacta en 100 recortes | Apache-2.0 | Hugging Face |
| PaddlePaddle/PP-OCRv6_tiny_rec_onnx | no disponible | 48×320 pixeles | no disponible | Apache-2.0 | Hugging Face |
| Alternativas OCR ligeras (p. ej. PaddleOCR mobile, EasyOCR small) | no disponible | variable | no disponible | variable | Hugging Face / repositorios |

La comparacion con alternativas concretas no esta disponible en la informacion proporcionada; solo se dispone del modelo base del que deriva este paquete.

## Limitaciones y advertencias

- Precision limitada: solo el 50-51 % de acierto exacto sensible a mayusculas sobre 100 recortes de validacion, lo que implica que aproximadamente la mitad de las lineas se reconocen con algun error. No es adecuado para produccion sin un paso de correccion o verificacion.
- Requiere un detector de texto previo: el modelo solo reconoce lineas ya recortadas a 48×320; no localiza texto en una imagen completa.
- El preprocesamiento de imagen y la decodificacion CTC se ejecutan en el host, por lo que el rendimiento extremo a extremo depende de esa implementacion.
- El contexto QNN esta compilado especificamente para el HTP v73 del QCS8550 con QAIRT 2.47; no es portable a otros SoC ni a otras versiones del SDK sin recompilar.
- Idiomas y juego de caracteres: no disponibles en la informacion proporcionada; conviene verificar el diccionario empaquetado antes de usarlo con alfabetos no latinos.
- Riesgo de alucinacion: en OCR se manifiesta como sustituciones o inserciones de caracteres plausibles, especialmente en recortes de baja calidad.
- Sesgos: no documentados; pueden aparecer sesgos derivados del dataset de entrenamiento original de PaddleOCR, no descritos aqui.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar `NOTICE` y `THIRD_PARTY_LICENSES.txt` por dependencias de terceros.
- Repositorio con muy pocas descargas (15) y sin likes, lo que limita la validacion comunitaria del paquete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/pp-ocrv6-tiny-rec-48x320-htp
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx
- Checkpoint original (revision fijada): https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx/blob/2612ab37152ae0a677521bae4e1e3d4fb4cf7c30/inference.onnx
- Resultados de evaluacion: https://huggingface.co/anan19990108/pp-ocrv6-tiny-rec-48x320-htp/blob/1a45fef3b5eaca3981afde6a7ee1ce16a5133706/evaluation/results.json
- README detallado: https://huggingface.co/anan19990108/pp-ocrv6-tiny-rec-48x320-htp/blob/1a45fef3b5eaca3981afde6a7ee1ce16a5133706/README.md
- Ejemplos Android: https://huggingface.co/anan19990108/pp-ocrv6-tiny-rec-48x320-htp/blob/1a45fef3b5eaca3981afde6a7ee1ce16a5133706/examples/ANDROID.md
