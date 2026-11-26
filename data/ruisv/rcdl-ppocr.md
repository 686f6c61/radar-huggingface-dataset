# ruisv/rcdl-ppocr

## Resumen

rcdl-ppocr es un paquete de modelos OCR compilados en formato `.rknn` para la NPU del SoC Rockchip RK3588 y RK3588S. No es un modelo entrenado desde cero: son conversiones de los detectores y reconocedores de texto de PaddleOCR (PP-OCRv4 mobile, PP-OCRv5 mobile/server y PP-OCRv6 medium) realizadas con rknn-toolkit2 2.3.2 y verificadas con la librería RCDL, un runtime C++17/Python del mismo autor que orquesta NPU, RGA y VPU en un pipeline de copia cero.

El paquete resuelve un problema de despliegue muy concreto: llevar OCR de calidad a placas de bajo consumo sin necesidad de exportar desde Paddle, calibrar cuantización ni disponer de rknn-toolkit2 en la máquina de destino. Incluye tres stacks completos (v4, v5 y v6), cada uno con detector DBNet, reconocedor CTC y un clasificador de orientación compartido, además de los diccionarios de caracteres correspondientes a cada reconocedor.

Es relevante para quienes construyen pipelines de digitalización de documentos, lectura de matrículas o extracción de texto en dispositivos empotrados, donde una GPU no es viable. El tamaño del repositorio es de 0,1 GB y la licencia Apache-2.0 permite redistribución, incluido uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DBNet para detección de texto, CRNN/CTC para reconocimiento, clasificador de ángulo (0°/180°); conversión a RKNN para NPU Rockchip |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 480×480 detección y 48×320 reconocimiento) |
| Tipos de cuantizacion | int8 (detectores v4, v5, v6), fp16 (reconocedores v5 y v6), precisión nativa del export para v4 rec |
| Idiomas soportados | no disponible en la información proporcionada; los diccionarios cubren 18710 clases (v6), 18385 (v5) y 6625 (v4), mayoritariamente chino e inglés en PaddleOCR |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rknn` (RKNN Toolkit2 2.3.2) más diccionarios `.txt` |
| Plataforma objetivo | Rockchip RK3588 / RK3588S, librknnrt 2.3.2, driver NPU 0.9.8 |
| Librería de inferencia | RCDL (C++17/Python, Apache-2.0) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Los modelos subyacentes son los de PaddleOCR: PP-OCRv4 mobile, PP-OCRv5 (detección mobile, reconocimiento server) y PP-OCRv6 medium. La detección usa DBNet, que produce un mapa de probabilidad de texto y un mapa de umbrales a partir de los cuales se extraen los polígonos de línea; el reconocimiento emplea arquitecturas CRNN con decodificación CTC sobre un vocabulario cerrado. El clasificador de orientación es un modelo auxiliar que decide entre 0° y 180° sobre recortes de 192×48.

No se ha realizado entrenamiento adicional: el autor parte de los pesos publicados por PaddlePaddle y los compila para la NPU. La innovación técnica relevante está en el proceso de conversión y en las decisiones de despliegue documentadas. En particular, los reconocedores v5 y v6 emiten logits en lugar de probabilidades porque la softmax de 18k clases no sobrevive a la ruta fp16 del runtime (la salida suma entre 0,64 y 1,00 por paso y carece de pico); como CTC solo necesita el argmax, la softmax se traslada a CPU con `apply_softmax=True`. También se documenta que la entrada debe alimentarse en rango 0..255 (`input_scale=1`, `input_shift=0`) y en formato RGB888.

## Capacidades

- Detección de regiones de texto en imágenes mediante DBNet, con parámetros DB propios de PP-OCRv6 (`bin_thresh=0.2`, `box_thresh=0.45`, `unclip_ratio=1.4`).
- Reconocimiento de líneas de texto con decodificación CTC y puntuación de confianza por línea.
- Clasificación de orientación de línea (0° o 180°) para descartar o rotar recortes invertidos.
- Tres generaciones intercambiables (v4, v5, v6) con diccionarios de 6625, 18385 y 18710 clases respectivamente.
- Inferencia sobre NPU RK3588 con pipeline de copia cero entre NPU, RGA y VPU a través de RCDL.
- API Python de alto nivel (`detect_text`, `recognize_text`, `text_angle_classifier`) y binding C++17.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidad de audio; es exclusivamente image-to-text.

## Casos de uso

- Digitalización de documentos en dispositivos empotrados: un lector de facturas o albaranes puede ejecutar detección (62 ms por fotograma en v6) y reconocimiento (40 ms por línea) íntegramente en la NPU de un RK3588S, sin enviar imágenes a la nube.
- Lectura de matrículas o señalética en cámaras IP: el detector v5 mobile (2,5 MB, 42 ms) permite procesar flujos de vídeo en tiempo casi real en la propia placa, con el reconocedor v5 server cuando se requiere mayor precisión.
- Extracción de texto de capturas de pantalla en quioscos o paneles industriales: el clasificador de orientación a 0,8 MB corrige líneas invertidas antes del reconocimiento, algo habitual en fotos tomadas con móvil.
- Pipelines de accesibilidad: conversión de texto impreso a voz en dispositivos de bajo consumo, donde el coste energético de la NPU es muy inferior al de una GPU.
- Procesamiento por lotes en el borde: al no requerir rknn-toolkit2 en destino, se puede desplegar el mismo paquete `.rknn` en flotas de placas RK3588 mediante descarga directa desde Hugging Face.
- Preprocesado OCR en sistemas de archivo y gestión documental: usar v4 mobile (6,7 MB de reconocedor, 36 ms por línea) para indexación rápida y v6 medium para la pasada final de alta confianza (0,930 de confianza media frente a 0,661 de v4 en la página de muestra).

## Benchmarks y rendimiento

Mediciones del autor sobre RK3588S con librknnrt 2.3.2, driver NPU 0.9.8 y un solo núcleo NPU:

| Métrica | v4 | v5 | v6 |
|---|---|---|---|
| Detección, un fotograma (NPU) | 42 ms | igual que v4 | 62 ms |
| Reconocimiento, una línea | 36 ms | 88 ms | 40 ms |
| Confianza media de línea (página de muestra) | 0,661 | 0,928 | 0,930 |

Los tres detectores localizan las mismas regiones en la página de muestra y el detector v5 mide lo mismo que el v4. La diferencia está en los reconocedores: v5 y v6 coinciden en el único carácter que v4 lee de forma distinta, y v6 es el más confiable con una velocidad cercana a la de v4. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, lo cual es esperable al tratarse de un modelo OCR.

## Requisitos de hardware

- Plataforma obligatoria: SoC Rockchip RK3588 o RK3588S con NPU; los ficheros `.rknn` no se ejecutan en GPU ni CPU convencionales.
- Runtime: librknnrt 2.3.2 y driver NPU 0.9.8 (versiones con las que se midió).
- Memoria: el paquete completo ocupa 0,1 GB; el modelo más grande es el reconocedor v5 server (42,2 MB) y el más pequeño el clasificador de orientación (0,8 MB). Cabe holgadamente en los 4-16 GB de RAM típicos de estas placas.
- No es compatible con A100, H100, RTX 4090 ni ninguna GPU de consumo; requiere NPU Rockchip.
- Despliegue mediante la librería RCDL, instalable por conda desde el canal `mirrors.ruis.ai` en linux-aarch64, o descargando los ficheros con `hf download` o `curl`.
- Latencia medida: 42-62 ms por fotograma de detección y 36-88 ms por línea de reconocimiento según generación, con un solo núcleo NPU.

## Comparativa con modelos similares

| Modelo | Formato | Plataforma | Detección | Reconocimiento | Licencia |
|---|---|---|---|---|---|
| rcdl-ppocr (v4/v5/v6) | RKNN | NPU RK3588 | 42-62 ms | 36-88 ms | Apache-2.0 |
| PaddleOCR original (PP-OCRv4/v5/v6) | Paddle | CPU/GPU | no disponible | no disponible | Apache-2.0 |
| Tesseract OCR | binario nativo | CPU | no disponible | no disponible | Apache-2.0 |
| EasyOCR | PyTorch | CPU/GPU | no disponible | no disponible | Apache-2.0 |

La comparativa directa con alternativas es limitada porque rcdl-ppocr no es un modelo nuevo sino una compilación optimizada para una NPU concreta; frente a PaddleOCR original gana en eficiencia energética y despliegue en el borde, pero pierde portabilidad. No se dispone de datos de rendimiento de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en NPU Rockchip RK3588/RK3588S; no hay ruta de ejecución en GPU, CPU x86 ni otros aceleradores.
- El diccionario debe coincidir con el reconocedor: emparejar v6 (18710 clases) con el fichero de v4 (6625) no provoca error, sino caracteres plausibles pero incorrectos.
- Los reconocedores v5 y v6 emiten logits; es obligatorio decodificar con `apply_softmax=True` y alimentar con `input_scale=1`, `input_shift=0`. Omitirlo degrada la salida sin aviso.
- El clasificador de orientación no es opcional con entradas rotadas: un reconocedor CTC alimentado con una línea invertida devuelve texto con alta confianza pero sin sentido.
- Los umbrales DB por defecto de RCDL corresponden a generaciones anteriores; para v6 hay que usar `bin 0.2, box 0.45, unclip 1.4`.
- Cobertura lingüística no documentada en la ficha; los diccionarios de PaddleOCR están orientados principalmente a chino e inglés, por lo que el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a los modelos CTC sobre vocabulario cerrado: el modelo no puede emitir caracteres fuera del diccionario y tiende a forzar lecturas en recortes de baja calidad.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.
- La licencia Apache-2.0 cubre los pesos y ficheros compilados; RCDL se distribuye bajo la misma licencia pero de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruisv/rcdl-ppocr
- Repositorio RCDL: https://github.com/ruisv/rcdl
- Documentación de modelos de RCDL: https://github.com/ruisv/rcdl/blob/main/docs/MODELS.md
- PaddleOCR (upstream): https://github.com/PaddlePaddle/PaddleOCR
- PP-OCRv4 mobile det: https://huggingface.co/PaddlePaddle/PP-OCRv4_mobile_det
- PP-OCRv4 mobile rec: https://huggingface.co/PaddlePaddle/PP-OCRv4_mobile_rec
- PP-OCRv5 mobile det: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det
- PP-OCRv5 server rec: https://huggingface.co/PaddlePaddle/PP-OCRv5_server_rec
- PP-OCRv6 medium det: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det
- PP-OCRv6 medium rec: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec
