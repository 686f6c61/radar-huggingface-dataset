# cyttic/hebrew-ocr-android

## Resumen

`cyttic/hebrew-ocr-android` es un paquete de artefactos ONNX publicado por cyttic para ejecutar OCR de escritura manuscrita en hebreo íntegramente en un dispositivo Android. No es un modelo único entrenado desde cero, sino un conjunto de ficheros derivados de modelos existentes: un modelo CTC de líneas basado en TrOCR (encoder ViT más cabeza transformer CTC de 2 capas, 198 clases), un modelo de lenguaje de caracteres 6-grama con suavizado Kneser-Ney interpolado y, opcionalmente, una verificación léxica con DictaBERT-tiny. El objetivo es que la aplicación `cyttic/android-hwrg` descargue estos ficheros y ejecute todo el pipeline en el teléfono, sin depender de servicios en la nube.

La relevancia del paquete radica en su enfoque de despliegue: cuantización dinámica int8 de los pesos constantes de las MatMul (salvo una capa MLP del encoder ViT que se mantiene en fp32), entrada de imagen de 384×384 píxeles y salida de log-probabilidades de 288 pasos por 198 clases. El repositorio ocupa 0,5 GB y se distribuye bajo licencia MIT para los ficheros propios, con la salvedad de que `mlm_tiny_int8.onnx` y `dictabert_vocab.txt` derivan de DictaBERT-tiny y permanecen bajo CC BY 4.0.

El modelo está especializado exclusivamente en hebreo (`he`) y en reconocimiento de líneas de texto manuscrito, no en documentos completos: la localización de líneas se delega en `PP-OCRv5_server_det_onnx` de PaddlePaddle, descargado aparte. Es, por tanto, una pieza de infraestructura para aplicaciones móviles de digitalización de manuscritos hebreos más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder ViT + cabeza transformer CTC de 2 capas); dos variantes: base y large (24 capas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de líneas, salida fija de 288 pasos CTC) |
| Tipos de cuantización | int8 dinámico (MatMul de pesos constantes), con una capa MLP del ViT en fp32; LM de caracteres en binario comprimido gzip; tabla de palabras de DictaBERT-tiny en int8 con una escala por fila |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT para los ficheros propios; `mlm_tiny_int8.onnx` y `dictabert_vocab.txt` bajo CC BY 4.0 (DictaBERT-tiny) |
| Formato de pesos | ONNX (opset 17), `charset.json`, LM binario `.bin.gz`, vocabulario WordPiece `.txt` |

## Arquitectura y entrenamiento

El componente principal es un modelo CTC de reconocimiento de líneas construido sobre TrOCR. La variante `line_int8.onnx` emplea el encoder ViT de TrOCR-base y una cabeza CTC de 2 capas transformer con 198 clases; la variante `line_large_int8.onnx` usa el encoder ViT de TrOCR-large con 24 capas y la misma cabeza. La entrada es `pixel_values` con forma (B, 3, 384, 384) normalizada a [-1, 1] y `cols` (B,) int64; la salida es `log_probs` (B, 288, 198). Los modelos de origen son `cyttic/exp35-trocr-base-en-ctc-seqhead-allreal-synpunct` y `cyttic/exp35-trocr-large-en-ctc-seqhead-allreal-synpunct`, cuyos detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se especifican en la información disponible.

La decodificación combina la salida CTC con un modelo de lenguaje de caracteres 6-grama entrenado con Kneser-Ney interpolado sobre texto de Ben-Yehuda y DictaGen, con pesos alpha 0,3 y beta 0,6 y LM restringido a letras hebreas y espacio. Como segunda pasada opcional, `mlm_tiny_int8.onnx` (DictaBERT-tiny convertido a ONNX) evalúa la probabilidad de cada token en su posición con `[MASK]`; la aplicación conserva las 16 mejores hipótesis del decodificador y elige la de mejor puntuación combinada de beam, verosimilitud pseudo-logarítmica (PLL) y piezas de palabra. La detección de líneas se realiza con `PP-OCRv5_server_det_onnx` (Apache-2.0).

## Capacidades

- Reconocimiento de líneas de escritura manuscrita en hebreo, con salida de caracteres a nivel de clase (198 clases, incluido el blank CTC).
- Modelado de lenguaje interno de caracteres hebreos para corregir hipótesis del decodificador CTC.
- Verificación léxica opcional de segunda pasada mediante DictaBERT-tiny enmascarado.
- Integración con detección de líneas externa (PP-OCRv5) para construir un pipeline completo de OCR de documento.
- Ejecución totalmente local en Android mediante ONNX Runtime, sin llamadas de red.
- Soporte de decodificación con haz (16 mejores líneas) y fusión con LM.
- No soporta tool calling, agentes, visión general, audio ni otros idiomas distintos del hebreo.

## Casos de uso

- Digitalización de manuscritos hebreos en movilidad: la aplicación captura una foto, PP-OCRv5 detecta las líneas y cada recorte se pasa al modelo CTC para obtener el texto, todo en el dispositivo y sin conexión.
- Archivo y transcripción de documentos históricos: el LM de 6-grama entrenado con Ben-Yehuda ayuda a resolver grafías ambiguas frecuentes en textos hebreos de archivo.
- Aplicaciones educativas de aprendizaje de escritura: el modelo puede transcribir ejercicios manuscritos de alumnos y compararlos con la respuesta esperada, con la ventaja de que no se envían datos personales a servidores.
- Herramientas de accesibilidad para usuarios con dificultades de tecleo en hebreo: dictado por escritura manual convertido a texto editable en el propio teléfono.
- Procesamiento por lotes en campo (inspecciones, formularios, notas): al no requerir conectividad, es adecuado para entornos con red limitada o requisitos de privacidad estrictos.
- Verificación de calidad de digitalización: la segunda pasada con DictaBERT-tiny permite descartar líneas con baja probabilidad léxica y marcarlas para revisión humana.
- Integración en aplicaciones Android de terceros: los ficheros ONNX y el `charset.json` pueden reutilizarse en cualquier app que implemente el pipeline de decodificación descrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en dispositivo Android mediante ONNX Runtime; el paquete completo ocupa 0,5 GB, por lo que se recomienda espacio libre suficiente para los ficheros y el modelo de detección de líneas.
- VRAM estimada: no disponible; al tratarse de un despliegue móvil, el consumo relevante es RAM del dispositivo, no VRAM de GPU de escritorio.
- GPU recomendadas: no aplica para el caso de uso previsto; en escritorio podría ejecutarse en cualquier GPU compatible con ONNX Runtime, pero no se han publicado requisitos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (Android y escritorio), dado que los pesos son ONNX; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hebrew-ocr-android | OCR de líneas manuscritas (TrOCR + CTC, ONNX int8) | hebreo | imagen 384×384, salida 288×198 | MIT (parcial CC BY 4.0) | HuggingFace, 0 descargas |
| cyttic/exp35-trocr-base-en-ctc-seqhead-allreal-synpunct | Modelo de origen del componente base | no disponible | no disponible | no disponible | HuggingFace |
| cyttic/exp35-trocr-large-en-ctc-seqhead-allreal-synpunct | Modelo de origen del componente large | no disponible | no disponible | no disponible | HuggingFace |
| dicta-il/dictabert-tiny | Modelo de lenguaje enmascarado (verificación léxica) | hebreo | no disponible | CC BY 4.0 | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de reconocimiento con otras alternativas de OCR hebreo.

## Limitaciones y advertencias

- El modelo reconoce líneas individuales, no documentos completos; requiere un detector de líneas externo (PP-OCRv5) para el pipeline completo.
- Especializado exclusivamente en hebreo; no soporta otros idiomas ni escritura latina.
- Entrenado para escritura manuscrita; su comportamiento con texto impreso no está documentado.
- Riesgo de alucinación léxica: la fusión con el LM de caracteres y la verificación con DictaBERT pueden corregir hacia palabras frecuentes aunque la lectura original sea distinta, especialmente en nombres propios y términos técnicos.
- La licencia MIT no cubre `mlm_tiny_int8.onnx` ni `dictabert_vocab.txt`, que permanecen bajo CC BY 4.0 y exigen atribución a Dicta (Shmidman et al., DictaBERT, 2023).
- El repositorio no registra descargas ni likes, por lo que no hay evidencia pública de validación por parte de terceros.
- No se documentan sesgos, métricas de error ni evaluación sobre corpus de referencia; para producción conviene validar con muestras propias antes de confiar en las transcripciones.
- El tamaño de 0,5 GB y la ejecución en dispositivo pueden ser limitantes en terminales de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hebrew-ocr-android
- Aplicación Android: https://github.com/cyttic/android-hwrg
- Modelo de origen base: https://huggingface.co/cyttic/exp35-trocr-base-en-ctc-seqhead-allreal-synpunct
- Modelo de origen large: https://huggingface.co/cyttic/exp35-trocr-large-en-ctc-seqhead-allreal-synpunct
- DictaBERT-tiny: https://huggingface.co/dicta-il/dictabert-tiny
- Detector de líneas PP-OCRv5: https://huggingface.co/PaddlePaddle/PP-OCRv5_server_det_onnx
- Referencia DictaBERT (Shmidman et al., 2023): no disponible en la información proporcionada.
