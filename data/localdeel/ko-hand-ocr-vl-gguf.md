# localdeel/ko-hand-ocr-vl-GGUF

## Resumen

ko-hand-ocr-vl-GGUF es la versión cuantizada en formato GGUF de ko-hand-ocr-vl, un modelo visión-lenguaje de 0,66 mil millones de parámetros especializado en reconocimiento óptico de caracteres (OCR) de escritura manual en hangul (coreano). Lo desarrolla el autor independiente localdeel y se construye mediante ajuste fino supervisado sobre Qwen3.5-0.8B, sin modificar la arquitectura original, lo que permite desplegarlo en Ollama, LM Studio, llama.cpp, vLLM o transformers sin código adicional.

El modelo resuelve un problema concreto: leer líneas y fotografías completas de formularios manuscritos coreanos, una tarea en la que los OCR tradicionales (Tesseract, EasyOCR, PaddleOCR) fallan estrepitosamente por la variabilidad caligráfica del hangul. Frente al modelo base sin ajustar, la mejora es drástica: la similitud de jamo en fuentes de prueba pasa de 53,0 a 97,0 y el CER baja de 161,8 a 5,8.

Es relevante ahora porque ofrece, en un paquete de 570 MB (Q8_0) más 195 MB de proyector multimodal, un rendimiento de OCR manuscrito coreano que supera a modelos visión-lenguaje de mayor tamaño como Qwen3-VL-2B-Instruct o PaddleOCR-VL-1.6, con licencia Apache 2.0 y compatibilidad con el ecosistema llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Qwen3.5-0.8B, sin cambios estructurales) |
| Parametros totales | 558.993.216 (tras recorte de vocabulario; 853M en la versión full-vocab) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0; proyector multimodal en F16 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repo base localdeel/ko-hand-ocr-vl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de tipo visión-lenguaje, y se ajusta finamente sobre datos de escritura manual coreana sin alterar la topología de la red. La innovación técnica principal no está en la arquitectura sino en la compresión del vocabulario: de los 248.077 tokens originales de Qwen3.5 se conservan 59.453, limitados a hangul, jamo, dígitos, signos, fragmentos cortos de inglés y los tokens vistos en entrenamiento y evaluación. Este recorte reduce el modelo de 853M a 660M parámetros sin reentrenamiento y mantiene respuestas idénticas carácter a carácter en las pruebas realizadas, además de mejorar la velocidad de generación entre un 26% y un 36% en llama.cpp.

El entrenamiento se apoya en un corpus sintético de caligrafía generado con 450 fuentes de escritura manual, a las que se aplican perturbaciones de textura de papel, inclinación y marcas de borrado. Los conjuntos de evaluación excluyen deliberadamente las fuentes de prueba y cualquier fuente con similitud superior a 0,7 respecto a las de entrenamiento. No se documenta en la información disponible el uso de RLHF o DPO, ni el volumen total de tokens de entrenamiento. El proyector multimodal (mmproj) incorpora los límites de resolución de imagen (64 a 4.096 tokens) directamente en el archivo, de modo que llama.cpp y LM Studio los aplican automáticamente.

## Capacidades

- Reconocimiento de escritura manual coreana (hangul) en líneas aisladas y en fotografías completas de formularios.
- Lectura de caracteres compuestos por jamo, incluyendo sílabas sin sentido léxico (nombres, razones sociales) que exigen reconocimiento puramente visual.
- Procesamiento de campos de formulario con etiquetas («성명 : …», «일자 : 2026.03.17»), títulos, números, fechas, acrónimos en inglés y símbolos.
- Entrada image-text-to-text conversacional mediante pipeline estándar de Hugging Face.
- Compatibilidad con tool calling heredada del modelo base Qwen3.5 (no verificada específicamente para esta especialización).
- Capacidades multilingües limitadas a coreano e inglés.
- Soporte de decodificación greedy documentado en las evaluaciones; no se especifican modos de razonamiento extendido.

## Casos de uso

- Digitalización de formularios manuscritos en oficinas públicas y empresas coreanas: el modelo procesa la fotografía completa de un documento y extrae el texto de todos los campos en una sola pasada, con un CER de 15,3 a nivel de página y similitud de jamo del 94,3.
- Automatización de archivo histórico de documentos en hangul: permite transcribir lotes de imágenes escaneadas sin recortar líneas manualmente, reduciendo el preprocesamiento respecto a OCR de línea.
- Extracción de datos en aplicaciones móviles de banca o seguros: con 570 MB en Q8_0 y 195 MB de proyector, cabe en dispositivos con GPU de 8 GB y permite validar solicitudes manuscritas en el propio terminal.
- Verificación de firmas y anotaciones en actas: el modelo mantiene un 61,3% de acierto en documentos de baja resolución con firma, útil como primera pasada con revisión humana posterior.
- Procesamiento de correspondencia y notas manuscritas en atención al cliente: la ventana de imagen de hasta 4.096 tokens admite fotografías de páginas completas sin fragmentar.
- Integración en pipelines de digitalización con llama.cpp u Ollama: al ser GGUF nativo, se puede desplegar en servidores sin GPU dedicada mediante cuantización Q4_K_M (345 MB) y procesar colas de documentos por lotes.
- Investigación en OCR de escrituras no latinas: sirve como línea base reproducible con licencia Apache 2.0 para comparar técnicas de ajuste fino sobre modelos visión-lenguaje pequeños.

## Benchmarks y rendimiento

Resultados medidos por el autor en una RTX 5060 Laptop de 8 GB, con decodificación greedy. La similitud de jamo es mejor cuanto más alta; el CER (tasa de error de caracteres) es mejor cuanto más bajo.

| Modelo | Tamaño | Fuentes de prueba (jamo / CER) | Fuentes no vistas (jamo) | Líneas en fotos (jamo / CER) | Líneas/s en GPU |
|---|---:|---:|---:|---:|---:|
| ko-hand-ocr-vl (este, 660M) | 1,27 GB | 97,0 / 5,8 | 97,4 | 93,4 / 15,8 | 10,8 |
| Qwen3.5-0.8B (base) | 1,63 GB | 53,0 / 161,8 | 51,4 | 54,2 / 115,3 | 9,6 |
| ko-hand-ocr (41M, solo líneas) | 78 MB | 96,8 / 7,2 | 97,3 | 94,2 / 13,4 | 42,0 |
| Qwen3-VL-2B-Instruct | 3,96 GB | 66,6 / 79,1 | 68,0 | 69,9 / 38,3 | 7,3 |
| PaddleOCR-VL-1.6 | 1,79 GB | 63,6 / 62,9 | 66,5 | 61,7 / 44,0 | 1,2 |
| ko-trocr | 408 MB | 78,2 / 42,3 | 80,4 | 78,5 / 39,2 | 6,1 |
| PaddleOCR PP-OCRv5 (korean) | 13 MB | 72,7 / 40,5 | 75,3 | 71,8 / 39,7 | 397,4 |
| EasyOCR (korean) | 15 MB | 56,6 / 64,3 | 64,6 | 66,9 / 55,0 | 81,3 |
| Tesseract 5 (kor+eng) | 6 MB | 17,7 / 97,3 | 19,7 | 13,2 / 98,6 | — |

En fotografía completa (página entera), el modelo alcanza una similitud de jamo de 94,3 y un CER de 15,3, frente a 72,7/42,1 de Qwen3.5-0.8B, 76,9/41,1 de Qwen3-VL-2B-Instruct y 79,9/37,3 de PaddleOCR-VL-1.6. La página de baja resolución con firma, excluida del cómputo, obtiene un 61,3%.

La consistencia entre entornos de despliegue es alta: transformers (bf16) 96,9 en fuentes de prueba y 94,3 en página completa; llama-server Q8_0 96,7 y 91,8; LM Studio Q8_0 96,4 y 91,8; Ollama Q8_0 96,2 y 91,8. La diferencia en fotografía se atribuye al redimensionado de imagen de llama.cpp (relleno negro y reducción mínima de 8 tokens), no a la cuantización.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para el modelo Q8_0 más el proyector F16 en bf16; alrededor de 1,0 GB con Q4_K_M.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el autor validó en RTX 5060 Laptop de 8 GB. Para lotes grandes, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en GTX 1650 4 GB, RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, vLLM y transformers con safetensors.
- Rendimiento: 10,8 líneas/s en GPU con Q8_0; el modelo de 41M de la misma familia alcanza 42,0 líneas/s, por lo que para líneas aisladas en producción de alto volumen puede ser preferible el modelo pequeño.
- En CPU: no se publican cifras de latencia; el tamaño reducido permite inferencia en CPU con llama.cpp, aunque la velocidad será sustancialmente menor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OCR manuscrito coreano (jamo) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| ko-hand-ocr-vl-GGUF | 660M | no disponible | 97,0 (fuentes) / 94,3 (página) | Apache 2.0 | GGUF y safetensors en HF |
| Qwen3-VL-2B-Instruct | 2B | no disponible | 66,6 / 76,9 | Apache 2.0 | HF, múltiples formatos |
| PaddleOCR-VL-1.6 | 1,6B | no disponible | 63,6 / 79,9 | Apache 2.0 | HF, PaddlePaddle |
| ko-hand-ocr (41M) | 41M | no disponible | 96,8 / no medido en página | no disponible | HF |

Frente a los modelos generalistas de mayor tamaño, la especialización en hangul manuscrito marca una diferencia de más de 20 puntos en similitud de jamo. Frente al modelo de 41M de la misma familia, la ventaja está en la lectura de páginas completas, no en líneas aisladas.

## Limitaciones y advertencias

- El ámbito es exclusivamente OCR de coreano manuscrito; no es un modelo de propósito general y su rendimiento en otras tareas de visión o texto no está documentado.
- Los idiomas soportados son coreano e inglés; no se garantiza calidad en otras escrituras.
- El recorte de vocabulario degrada ligeramente la similitud de jamo en líneas compuestas solo por palabras inglesas largas (de 98,34 a 98,01) y solo el 86,5% de esas 200 líneas de prueba coinciden exactamente con la versión full-vocab.
- En llama.cpp, LM Studio y Ollama el rendimiento en fotografías es inferior al de transformers (91,8 frente a 94,3) por el método de redimensionado de imagen; Ollama 0.34.4 no lee los límites de resolución del mmproj y rinde peor (90,9 en líneas de foto).
- El 61,3% en documentos de baja resolución con firma indica que no es fiable para verificación automática sin revisión humana.
- Riesgo de alucinación inherente a los modelos generativos: puede producir texto plausible no presente en la imagen, especialmente en imágenes borrosas o con caracteres poco legibles.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a dominios distintos de los formularios y la caligrafía sintética.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- La fecha de creación del repositorio (2026-10-07) y la versión de Qwen3.5 referenciada indican que el ecosistema base puede evolucionar; conviene fijar la revisión concreta en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/localdeel/ko-hand-ocr-vl-GGUF
- Repositorio safetensors base: https://huggingface.co/localdeel/ko-hand-ocr-vl
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de líneas ko-hand-ocr (41M): https://huggingface.co/localdeel/ko-hand-ocr
- Repositorio de la herramienta de recorte de líneas: https://github.com/jysvai/ko-hand-ocr
- Revisión con vocabulario completo: https://huggingface.co/localdeel/ko-hand-ocr-vl-GGUF/tree/full-vocab
