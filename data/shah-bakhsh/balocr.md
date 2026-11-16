# shah-bakhsh/BalOCR

## Resumen

BalOCR es un adaptador LoRA experimental para reconocimiento óptico de caracteres (OCR) en lengua balochi, desarrollado por el usuario shah-bakhsh. Se construye sobre el modelo base PaddlePaddle/PaddleOCR-VL-1.6, un modelo multimodal de tipo image-text-to-text de PaddlePaddle, y se distribuye a través de la librería PEFT con pesos en formato safetensors. El adaptador añade 626.688 parámetros entrenables y está pensado para transcribir texto en escritura árabe y latina empleada por el balochi.

El modelo se encuentra en una fase piloto muy temprana: se entrenó durante solo 40 pasos de optimización sobre 80 ejemplos únicos (41 pares reales en escritura árabe y 39 pares sintéticos en escritura latina). Los diagnósticos preliminares muestran un empeoramiento del error de carácter en árabe (del 32,3 % al 45,2 %) y una mejora en latín sintético (del 7,4 % al 5,3 %), por lo que no debe considerarse un modelo listo para producción.

Su relevancia es fundamentalmente de investigación: cubre un idioma de bajos recursos (balochi, código `bal`) con muy poca representación en herramientas OCR, y sirve como prueba de concepto de adaptación PEFT sobre un backbone OCR multimodal. La licencia Apache 2.0 facilita su reutilización y experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre PaddleOCR-VL-1.6 (modelo multimodal image-text-to-text) |
| Parámetros totales | 626.688 parámetros del adaptador (el modelo base no se especifica) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | balochi (`bal`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue el paradigma LoRA (Low-Rank Adaptation) sobre el modelo PaddleOCR-VL-1.6, fijado a la revisión `132c45f52c0a26ed5a6b2f6bd8e3985794cc27dd`. No se modifican los pesos del backbone; únicamente se entrenan las matrices de bajo rango, lo que resulta en 626.688 parámetros adaptados. El pipeline declarado es `image-text-to-text`, coherente con un OCR multimodal que recibe una imagen y genera texto.

El entrenamiento consistió en 40 pasos de optimización sobre el dataset shah-bakhsh/BalDataset, con 80 ejemplos únicos: 41 pares reales en escritura árabe y 39 pares sintéticos en escritura latina. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación. La evaluación temprana se realizó sobre 12 imágenes árabes y 12 imágenes latinas sintéticas, y posteriormente se detectó solapamiento entre las referencias recortadas y los párrafos largos de entrenamiento, lo que invalidó parcialmente esa partición. No se dispone de información sobre la composición completa del dataset ni sobre el número de tokens de entrenamiento.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de texto en balochi.
- Transcripción de escritura árabe (variante usada por el balochi).
- Transcripción de escritura latina sintética.
- Generación de salida estructurada en JSON mediante la CLI del SDK (`--output result.json`).
- Ejecución en CPU mediante el flag `--device cpu`.
- Integración como adaptador PEFT cargable sobre PaddleOCR-VL-1.6.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en OCR de lenguas de bajos recursos: el adaptador sirve como punto de partida reproducible para estudiar cómo se comporta LoRA sobre un backbone OCR multimodal en balochi, con un coste de entrenamiento mínimo (40 pasos).
- Digitalización experimental de textos balochi en escritura árabe: permite probar pipelines de extracción de texto de páginas escaneadas, aunque los resultados actuales en árabe empeoran la línea base y requieren validación adicional.
- Procesamiento de documentos sintéticos en escritura latina: dado el descenso del CER del 7,4 % al 5,3 % en el conjunto sintético, puede emplearse en prototipos controlados de generación de texto latino balochi.
- Evaluación comparativa de adaptadores PEFT: útil como caso de estudio para medir la degradación o mejora de un adaptador pequeño frente al modelo base en tareas OCR específicas de dominio.
- Pruebas de integración del SDK BalOCR: el repositorio fuente y la CLI permiten validar el flujo de carga del adaptador, la fijación de revisión del modelo base y la inferencia en CPU en entornos sin GPU.
- Docencia y experimentación con datasets pequeños: ilustra el impacto del sobreajuste y del solapamiento de datos en particiones de evaluación reducidas (12 imágenes por script).

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a un diagnóstico temprano sobre 12 imágenes árabes y 12 imágenes latinas sintéticas, comparando el modelo base con el adaptador:

| Script | CER base | CER con adaptador | Observaciones |
|---|---|---|---|
| Árabe (12 imágenes) | 32,3 % | 45,2 % | Una salida adaptada alcanzó el límite de tokens |
| Latín sintético (12 imágenes) | 7,4 % | 5,3 % | Mejora modesta en datos sintéticos |

El autor indica que esta partición quedó invalidada tras detectar solapamiento entre referencias recortadas y párrafos de entrenamiento más largos, y que la precisión en libros árabes no vistos y en escaneos latinos reales no está verificada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador añade solo 626.688 parámetros, un coste despreciable frente al backbone.
- GPU recomendadas: no disponible. El autor documenta ejecución en CPU (`--device cpu`), lo que sugiere que el flujo piloto se validó sin GPU.
- Compatibilidad con GPU de consumo: no verificada en la información proporcionada.
- Opciones de despliegue: SDK propio del repositorio BalOCR (`python -m balocr.model`), que carga la revisión fijada de PaddleOCR-VL-1.6 y aplica los pesos del adaptador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|---|
| BalOCR | LoRA sobre PaddleOCR-VL-1.6 | 626.688 (adaptador) | no disponible | bal | Apache 2.0 | Piloto experimental, 40 pasos |
| PaddleOCR-VL-1.6 | OCR multimodal base | no disponible | no disponible | no disponible | no disponible | Modelo base de referencia |
| Alternativas OCR específicas para balochi | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores OCR para balochi ni sobre comparaciones con modelos OCR multilingües de referencia en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenamiento extremadamente limitado: 40 pasos de optimización y 80 ejemplos únicos, insuficiente para generalizar a libros árabes no vistos o escaneos latinos reales.
- Degradación en escritura árabe: el CER empeora del 32,3 % al 45,2 % en el diagnóstico temprano, con una salida que alcanzó el límite de tokens.
- Partición de evaluación invalidada: se detectó solapamiento entre referencias recortadas y párrafos de entrenamiento, por lo que las cifras publicadas no son fiables como medida de generalización.
- Sesgos conocidos: no documentados; el dataset mezcla pares reales y sintéticos, lo que puede introducir sesgo hacia el estilo de los datos sintéticos.
- Riesgo de alucinación: no evaluado; los modelos image-text-to-text pueden generar texto plausible no presente en la imagen.
- Cobertura lingüística restringida a balochi (`bal`); no se documenta soporte para otras lenguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado experimental y la falta de validación desaconsejan su uso en producción.
- Dependencia de una revisión concreta del modelo base (`132c45f5...`); cambios en PaddleOCR-VL-1.6 pueden romper la compatibilidad del adaptador.
- El Space público asociado sirve el modelo base original, no el adaptador, por lo que las pruebas en línea no reflejan el comportamiento del LoRA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shah-bakhsh/BalOCR
- Modelo base PaddleOCR-VL-1.6: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6/tree/132c45f52c0a26ed5a6b2f6bd8e3985794cc27dd
- Repositorio fuente BalOCR: https://github.com/shah-bakhsh/BalOCR
- Dataset BalDataset: https://huggingface.co/datasets/shah-bakhsh/BalDataset/tree/main/ocr/canonical
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/shah-bakhsh/balcorpus-balochi-demo
- Resumen de entrenamiento: https://huggingface.co/shah-bakhsh/BalOCR/blob/main/training_summary.json
- Créditos de fuentes: https://huggingface.co/shah-bakhsh/BalOCR/blob/main/SOURCE_CREDITS.md
