# muyleanging/Chakkhu-OCR-Khmer-ONNX

## Resumen

Chakkhu-OCR-Khmer-ONNX es la exportación a ONNX del modelo Chakkhu-OCR-Khmer, un sistema de reconocimiento óptico de caracteres (OCR) especializado en líneas de texto en jemer (khmer) e inglés. Lo desarrolla Ing Muyleang y su propósito es ejecutar OCR de alta precisión sin depender de PyTorch, usando únicamente ONNX Runtime, lo que permite desplegarlo en CPU, aplicaciones de escritorio, dispositivos móviles y navegador mediante onnxruntime-web.

El modelo resuelve un problema concreto: el OCR de jemer es difícil por la complejidad de sus clústeres consonánticos y diacríticos, y la mayoría de soluciones comerciales lo tratan mal o no lo cubren. Chakkhu aborda esto con un tokenizador de 3.402 tokens basado en clústeres jemer, un encoder CNN + Transformer de 6 capas con cabeza CTC y un decodificador autorregresivo de 3 capas. El conjunto suma 18,6 millones de parámetros, un tamaño muy reducido que lo hace viable en hardware modesto.

La relevancia de esta versión ONNX es práctica: ofrece pesos int8 (26 MB el encoder, 13 MB el decodificador) con ejes dinámicos (anchura de línea de 16 a 4.096 px, batch y longitud de texto variables), mantiene resultados prácticamente idénticos a PyTorch (CER de 4,73 % frente a 4,76 % en la muestra de 300 líneas) y permite inferencia en CPU a 176-205 ms por línea. Está publicada bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN + Transformer encoder (6 capas) + cabeza CTC + decodificador de clústeres (3 capas) |
| Parametros totales | 18,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; anchura de línea dinámica de 16 a 4.096 px a altura 64 px, longitud de texto dinámica |
| Tipos de cuantizacion | int8 (pesos dinámicos de 8 bits en todos los productos matriciales; la CNN pequeña permanece en fp32) y fp32 |
| Idiomas soportados | jemer (km), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18): `encoder.int8.onnx`, `decoder.int8.onnx`, `encoder.onnx`, `decoder.onnx` |
| Tamano del repositorio | 0,1 GB |
| Tokenizador | 3.402 tokens (clústeres jemer, latino, dígitos, puntuación) |
| Tokens especiales | `<pad>` 0, `<s>` 1, `</s>` 2, `<unk>` 3, `<blank>` 4 (CTC) |

## Arquitectura y entrenamiento

El modelo comparte pesos con Chakkhu-OCR-Khmer. La arquitectura consta de un encoder CNN seguido de un Transformer de 6 capas que produce una secuencia de memoria de dimensión 320, una cabeza CTC que emite log-probabilidades por columna (B, W/8, 3402) y un decodificador autorregresivo de 3 capas que genera un clúster jemer por paso. El total es de 18,6 M de parámetros. La entrada es una imagen en escala de grises de altura fija 64 px y anchura variable, normalizada dividiendo entre 255 y rellenada con 1.0 (blanco) por la derecha en lotes.

La exportación se realizó con `torch.onnx` en opset 18. La cuantización int8 aplica pesos dinámicos de 8 bits a todos los productos matriciales, manteniendo la CNN pequeña en fp32. Todos los ejes son dinámicos: batch, anchura de línea (16-4.096 px) y longitud de texto. La decodificación combina búsqueda por haces (beam 4) sobre el decodificador con un borrador CTC, puntuando cada hipótesis como `0.5 · log P_CTC + 0.5 · log P_decoder`. Los detalles de datos de entrenamiento, número de tokens y si hubo RLHF/DPO no están disponibles en la información proporcionada; la model card remite a la del modelo base para esos datos.

## Capacidades

- Reconocimiento de texto en líneas de imagen para jemer e inglés, incluyendo clústeres consonánticos jemer, dígitos y puntuación.
- Salida de texto con puntuación de confianza opcional (`confidence=True`), útil para filtrar resultados de baja calidad.
- Decodificación en dos modos: búsqueda por haces con borrador CTC (máxima calidad) o solo CTC con `beam=0` (modo rápido, 22 ms por línea).
- Inferencia sin PyTorch, únicamente con ONNX Runtime y NumPy, lo que facilita el despliegue en entornos ligeros.
- Ejecución en CPU, en aplicaciones de escritorio, en dispositivos móviles y en navegador mediante onnxruntime-web.
- Procesamiento por lotes con anchuras variables reales declaradas mediante el tensor `widths`.
- Normalización de texto jemer incluida en el script `khnormal.py`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de image-to-text.

## Casos de uso

- Digitalización de documentos jemer: el modelo lee líneas de texto de imágenes escaneadas y las convierte en texto editable; su CER de 4,51 % sobre las 4.018 líneas de KHOB lo hace adecuado para archivos y documentos administrativos en jemer.
- OCR en aplicaciones móviles sin conexión: al pesar 39 MB en int8 y ejecutarse solo con ONNX Runtime, puede integrarse en apps Android o iOS que procesen texto jemer localmente sin enviar imágenes a un servidor.
- OCR en el navegador: mediante onnxruntime-web, permite construir herramientas web de extracción de texto jemer que funcionan en el cliente, reduciendo costes de servidor y preservando la privacidad del usuario.
- Procesamiento por lotes en servidores CPU: con 176-205 ms por línea en CPU de portátil y ejes dinámicos para batch, es viable procesar grandes volúmenes de líneas en infraestructura sin GPU.
- Extracción de texto bilingüe jemer-inglés: útil en documentos oficiales de Camboya que mezclan ambos idiomas, ya que el tokenizador cubre clústeres jemer y caracteres latinos.
- Preprocesamiento para pipelines de NLP: la salida del OCR puede alimentar sistemas de traducción, búsqueda o análisis de documentos en jemer, con la puntuación de confianza para descartar líneas mal reconocidas.
- Digitalización de patrimonio cultural: lectura de manuscritos o inscripciones impresas en jemer para su catalogación, siempre que se anteponga un detector de líneas (el demo incluye uno).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre líneas de KHOB (conjunto no usado en entrenamiento), en CPU de portátil, con beam 4 + comprobación CTC:

| Lector | CER ↓ | Texto idéntico a PyTorch | ms / línea |
|---|---|---|---|
| PyTorch (Chakkhu-OCR-Khmer) | 4,76 % | 100 % | 127 |
| ONNX fp32 | 4,76 % | 100 % | 200 |
| ONNX int8 | 4,73 % | 98,3 % | 205 |
| ONNX int8, solo CTC (`beam=0`) | 5,16 % | 78 % | 22 |

Muestra de 300 líneas. Las cifras brutas difieren de PyTorch como máximo en 0,00004. Sobre las 4.018 líneas completas de KHOB, ONNX int8 obtiene 4,51 % CER y 58,8 % de líneas totalmente correctas (PyTorch: 4,50 % y 58,8 %), a 176 ms por línea en CPU de portátil. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo OCR.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para ejecución en CPU. En int8 ocupa 39 MB en disco (26 MB encoder + 13 MB decoder); en fp32, 76 MB (51 + 25 MB).
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) podría acelerar la inferencia, pero no se han publicado cifras.
- Cabe en cualquier equipo: portátil, móvil y navegador. No requiere GPU de consumo.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java), onnxruntime-web para navegador, onnxruntime-mobile para Android/iOS. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan esta arquitectura OCR.
- Latencia: 176-205 ms por línea en CPU de portátil con beam 4; 22 ms por línea con solo CTC (`beam=0`).
- Dependencias: `onnxruntime`, `numpy`, `pillow`, `huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | CER (jemer) |
|---|---|---|---|---|---|
| Chakkhu-OCR-Khmer-ONNX (int8) | 18,6 M | km, en | ONNX | Apache-2.0 | 4,51 % (KHOB) |
| Chakkhu-OCR-Khmer (PyTorch) | 18,6 M | km, en | PyTorch | Apache-2.0 | 4,50 % (KHOB) |
| Tesseract (khmer) | no disponible | km | no disponible | Apache-2.0 | no disponible |
| Surya OCR | no disponible | multilingüe | PyTorch | GPL-3.0 / comercial | no disponible |

No se dispone de resultados comparativos publicados frente a Tesseract, Surya u otros sistemas OCR en la información proporcionada; las filas correspondientes se incluyen solo como referencia de categoría y sus métricas figuran como no disponibles.

## Limitaciones y advertencias

- El modelo reconoce líneas de texto, no páginas completas: requiere un detector de líneas previo para procesar documentos enteros.
- Solo cubre jemer e inglés; no reconoce otros idiomas ni escrituras.
- El 41,2 % de las líneas de KHOB no se reconocen de forma totalmente correcta (58,8 % de líneas perfectas), por lo que en producción conviene usar la puntuación de confianza y revisión humana en casos críticos.
- El modo rápido (`beam=0`) degrada la calidad: CER de 5,16 % y solo 78 % de coincidencia con PyTorch; no es adecuado para tareas que exijan máxima fidelidad.
- Riesgo de alucinación en decodificación autorregresiva: el decodificador puede generar clústeres plausibles pero incorrectos en imágenes de baja calidad o ruidosas.
- No se han publicado análisis de sesgos en la información disponible; al ser un modelo OCR, el riesgo principal es de precisión diferencial según la calidad de escaneo y la tipografía.
- Licencia Apache-2.0 permite uso comercial, pero el autor solicita atribución: "Chakkhu by Ing Muyleang".
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Chakkhu-OCR-Khmer-ONNX
- Modelo base (PyTorch): https://huggingface.co/muyleanging/Chakkhu-OCR-Khmer
- Demo (con detector de líneas y API gratuita): https://huggingface.co/spaces/muyleanging/Chakkhu-OCR-Demo
- Cita (BibTeX): incluida en la model card, referencia a "Chakkhu: A Small Khmer and English Text-Line OCR Model with Line Confidence" (2026)
