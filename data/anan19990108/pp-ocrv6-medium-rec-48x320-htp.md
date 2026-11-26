# anan19990108/pp-ocrv6-medium-rec-48x320-htp

## Resumen

PP-OCRv6 Medium Recognition 48×320 es una adaptación del modelo de reconocimiento de texto de PaddleOCR (PP-OCRv6, variante *medium*) empaquetada para ejecución en el acelerador neuronal HTP (Hexagon Tensor Processor) de Qualcomm, en concreto sobre el SoC QCS8550. El autor del repositorio, anan19990108, parte del checkpoint ONNX oficial de PaddlePaddle (`PP-OCRv6_medium_rec_onnx`) y lo convierte a múltiples formatos (ONNX, TFLite, QNN) con variantes en FP32 e INT8, de modo que pueda desplegarse tanto en CPU como en el NPU de dispositivos embebidos y móviles.

El modelo resuelve la tarea de reconocimiento de líneas de texto (OCR de reconocimiento, no de detección): recibe un recorte de imagen de 48×320 píxeles que contiene una única línea de texto y devuelve la secuencia de caracteres correspondiente. La decodificación se realiza mediante CTC en el host, mientras que las capas aprendidas se ejecutan en el HTP con tensores externos en FP32. Es relevante porque demuestra un pipeline completo de cuantización y despliegue de un reconocedor OCR en hardware Qualcomm, con artefactos listos para usar y mediciones de latencia y precisión publicadas.

El repositorio es pequeño (0,3 GB) y contiene pesos en varios formatos, diccionario, scripts de inferencia y resultados de evaluación. La licencia es Apache-2.0, heredada del checkpoint original de PaddlePaddle. No se trata de un modelo de lenguaje generativo, sino de una red convolucional/recurrente de reconocimiento óptico de caracteres, por lo que muchas de las filas de especificaciones habituales (parámetros activos, contexto, idiomas) no aplican o no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de reconocimiento OCR de PaddleOCR (PP-OCRv6 medium rec); detalles internos de capas no disponibles en la información proporcionada |
| Parámetros totales | no disponible (tamaño del checkpoint ONNX FP32: 76,49 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de recorte 48×320 píxeles |
| Tipos de cuantización | FP32 (ONNX y TFLite de referencia), INT8 W8A8 (ONNX QDQ, TFLite INT8, QNN native INT8) |
| Idiomas soportados | no disponible (el modelo base PP-OCRv6 de PaddlePaddle está orientado a texto, pero el repositorio no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32 e INT8), TFLite (FP32 e INT8), QNN context binary (FP32 e INT8) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna más allá de que se trata del reconocedor de PP-OCRv6 en su variante *medium*, exportado desde el checkpoint `inference.onnx` de PaddlePaddle. El modelo procesa recortes de línea de 48×320 píxeles y emplea decodificación CTC, que en este despliegue se ejecuta en el host (fuera del acelerador). Las capas aprendidas se ejecutan en el HTP de Qualcomm con tensores de entrada y salida en FP32, incluso en las variantes cuantizadas, que internamente usan aritmética W8A8.

El entrenamiento original corresponde a PaddlePaddle/PP-OCRv6_medium_rec_onnx (revisión `50c7eacafc52fa7bcf4194e8cd08e46f8558504b`), bajo licencia Apache-2.0. Este repositorio no aporta información sobre el dataset de entrenamiento, número de tokens o imágenes, ni sobre si hubo etapas de ajuste fino. La contribución del autor es la conversión, cuantización y empaquetado para HTP, junto con la evaluación comparativa de precisión y latencia entre las variantes FP32 e INT8.

## Capacidades

- Reconocimiento de texto en recortes de línea de 48×320 píxeles (OCR de reconocimiento, no de detección de cajas).
- Decodificación CTC de la secuencia de caracteres usando el diccionario empaquetado en el repositorio.
- Ejecución en CPU (ONNX Runtime) y en NPU HTP de Qualcomm (QNN, TFLite QNN delegate) según el artefacto elegido.
- Variantes cuantizadas INT8 W8A8 con tensores externos FP32 para integración en pipelines existentes.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre: es un modelo discriminativo de OCR.
- Capacidades multilingües: no declaradas en la información disponible.

## Casos de uso

- Digitalización de documentos en dispositivos móviles: integrado en una app Android sobre QCS8550, el modelo reconoce líneas de texto de tickets, facturas o formularios usando el contexto QNN INT8 (19,94–20,08 MB), con latencias p50 de aproximadamente 2,5 ms en TFLite QNN Invoke.
- Pipelines de OCR en embebidos Linux aarch64: combinado con un detector de texto, el reconocedor procesa cada recorte de línea en el HTP, liberando la CPU para el resto del pipeline (preprocesado, decodificación CTC, lógica de negocio).
- Lectura de matrículas o señalética en visión industrial: la entrada fija 48×320 y la baja latencia (p50 ~4,8 ms en ONNX QNN EP INT8) permiten procesar flujos de vídeo en tiempo real en hardware de bajo consumo.
- Extracción de texto en escenarios de borde con conectividad limitada: al ejecutarse íntegramente en el dispositivo, evita enviar imágenes a la nube, lo que resulta adecuado para datos sensibles.
- Prototipado rápido con ONNX Runtime CPU: la variante ONNX FP32 (76,49 MB) permite validar el pipeline en un portátil antes de desplegar en el dispositivo Qualcomm.
- Benchmarking de cuantización: el repositorio incluye mediciones float → INT8 que sirven como referencia para evaluar el impacto de W8A8 en un reconocedor OCR antes de adoptarlo en producción.
- Integración en sistemas de accesibilidad: lectura en voz alta de texto impreso capturado por cámara en dispositivos con SoC Qualcomm, gracias al bajo consumo del HTP.

## Benchmarks y rendimiento

Resultados publicados en la model card (subconjunto de 100 recortes de validación de ejemplo del upstream; precisión exacta y CER en float → INT8; latencias p50/p95 en ms, sin preprocesado ni decodificación en host):

| Ámbito Linux HTP | Subconjunto | Precisión exacta | CER | p50 / p95 ms (float → INT8) |
|---|---|---|---|---|
| ONNX QNN EP `Session.Run` | 100 recortes | 66,00 % → 64,00 % | 13,43 % → 14,52 % | 46,224 / 46,688 → 4,775 / 4,796 |
| QNN native backend execute | 100 recortes | 66,00 % → 64,00 % | 13,43 % → 14,52 % | 45,620 / 46,153 → 4,750 / 4,862 |
| TFLite QNN `Invoke` | 100 recortes | 66,00 % → 67,00 % | 13,43 % → 12,16 % | 18,283 / 18,435 → 2,493 / 2,520 |

Las mediciones usan 10 calentamientos y excluyen el preprocesado y la decodificación en host. El conjunto de evaluación es pequeño (100 recortes), por lo que las diferencias de precisión deben interpretarse con cautela.

## Requisitos de hardware

- VRAM/RAM: el checkpoint ONNX FP32 ocupa 76,49 MB; las variantes INT8 rondan 20 MB (TFLite INT8: 20,59 MB; ONNX INT8: 20,18 MB; QNN native INT8: 19,94–20,08 MB). El modelo cabe holgadamente en cualquier dispositivo con unas pocas decenas de MB libres.
- GPU recomendadas: no aplica; el objetivo es CPU y NPU HTP de Qualcomm. Para ejecución en servidor con GPU no se han publicado requisitos ni rendimiento.
- Consumer GPU: no es el caso de uso; podría ejecutarse en CPU con ONNX Runtime sin problema, pero no se documentan cifras en GPU.
- Despliegue: ONNX Runtime (CPU y QNN EP 1.24.4), TFLite C 2.11.1 con QNN delegate, QAIRT 2.47.0.260601, backend nativo QNN. Hardware de referencia: QCS8550 HTP v73, Linux aarch64 y Android.
- Latencia: p50 de 2,49–2,52 ms (TFLite QNN INT8), 4,75–4,86 ms (QNN nativo y ONNX QNN EP INT8) y 18,28–46,69 ms en las variantes float según backend. Throughput no publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anan19990108/pp-ocrv6-medium-rec-48x320-htp | Reconocedor OCR PP-OCRv6 medium, empaquetado para HTP | 48×320 | ONNX, TFLite, QNN (FP32/INT8) | Apache-2.0 | Hugging Face |
| PaddlePaddle/PP-OCRv6_medium_rec_onnx | Reconocedor OCR PP-OCRv6 medium original | no disponible | ONNX | Apache-2.0 | Hugging Face |
| Otros reconocedores PP-OCRv6 (variantes small/large) | Reconocedor OCR | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de reconocimiento de líneas, no de detección: requiere un detector previo que proporcione los recortes de 48×320.
- El conjunto de evaluación es de solo 100 recortes, insuficiente para extrapolar la precisión exacta (64–67 %) a dominios reales.
- La cuantización INT8 reduce la precisión exacta en 2 puntos en ONNX QNN EP y QNN nativo (66 % → 64 %), aunque la mejora en TFLite (+1 punto) sugiere variabilidad del conjunto de evaluación.
- Los artefactos QNN están ligados a QCS8550 HTP v73 y a versiones concretas de QAIRT (2.47.0.260601) y TFLite C (2.11.1); otros SoC o versiones pueden requerir recompilación del contexto.
- Los contextos QNN son específicos de plataforma (Android vs. Linux) y no son intercambiables entre ellos.
- No se declaran idiomas soportados ni sesgos conocidos; la cobertura lingüística depende del modelo base de PaddlePaddle.
- Riesgo de alucinación en el sentido de caracteres mal reconocidos en textos borrosos, rotados o con tipografías no vistas; el CER del 12–15 % en el conjunto de prueba lo refleja.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse los avisos de terceros incluidos en `THIRD_PARTY_LICENSES.txt` y `NOTICE`.
- No apto para tareas generativas, razonamiento, código ni diálogo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anan19990108/pp-ocrv6-medium-rec-48x320-htp
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec_onnx
- Checkpoint original (revisión fijada): https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec_onnx/blob/50c7eacafc52fa7bcf4194e8cd08e46f8558504b/inference.onnx
- Resultados completos de evaluación: https://huggingface.co/anan19990108/pp-ocrv6-medium-rec-48x320-htp/blob/65faabadd14f74717918a426a2d7cd7ce949c02c/evaluation/results.json
- README detallado: https://huggingface.co/anan19990108/pp-ocrv6-medium-rec-48x320-htp/blob/65faabadd14f74717918a426a2d7cd7ce949c02c/README.md
- Ejemplos Linux TFLite INT8, Linux ONNX QNN EP, Android y Android INT8: disponibles en la carpeta `examples/` del repositorio
- PaddleOCR (proyecto upstream): https://github.com/PaddlePaddle/PaddleOCR
