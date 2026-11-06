# chegrowk/ko-jamo-base

## Resumen

ko-jamo-base es una exportación a ONNX del modelo de reconocimiento automático del habla Kkonjeong/wav2vec2-base-korean, publicada por el usuario chegrowk. No se trata de un entrenamiento nuevo ni de un ajuste fino: los pesos son idénticos a los del modelo original, convertidos a formato ONNX en precisión float32 con opset 17. El autor lo emplea en CheGROW Studio Pro para detectar palabras repetidas o añadidas al comparar una narración con su guion.

El modelo se apoya en la arquitectura wav2vec2-base de Facebook (un transformer convolucional con cabecera de clasificación CTC) adaptada al coreano y con un vocabulario de jamo, las unidades mínimas de la escritura hangul. Su función es la transcripción de audio a nivel de fonema/sílaba, no la generación de texto libre. El contexto no es una ventana de tokens sino la duración del audio procesado, que en wav2vec2-base se maneja por tramos.

Es relevante por su tamaño reducido (unos 0,4 GB en el repositorio), su licencia permisiva Apache 2.0 y su formato ONNX, que permite desplegarlo en entornos sin PyTorch. Sin embargo, su alcance es muy específico: reconocimiento de habla coreana, sin capacidades generativas, multilingües ni de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (CNN + transformer, cabecera CTC) |
| Parámetros totales | no disponible (wav2vec2-base tiene ~95 M, pero no se confirma en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; sin ventana de tokens definida) |
| Tipos de cuantización | float32 (exportación ONNX); no se documentan otras |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`), con `vocab.json`, tokenizer y `config.json` |

## Arquitectura y entrenamiento

El modelo es un wav2vec2-base: un extractor convolucional de características seguido de un transformer y una cabecera de clasificación CTC. La entrada es audio mono a 16 kHz, normalizado con media 0 y varianza 1; la salida son logits por fotograma. El vocabulario está compuesto por caracteres jamo coreanos, lo que implica una transcripción a nivel de fonema/grafema en lugar de palabras completas.

No se ha realizado ningún entrenamiento adicional en esta publicación: la model card indica explícitamente que los pesos no se modificaron y que la exportación a ONNX (opset 17) reproduce la salida del modelo PyTorch original con una diferencia máxima de 0,000009 y el mismo símbolo predicho en cada fotograma. El modelo base Kkonjeong/wav2vec2-base-korean fue entrenado sobre Zeroth-Korean (OpenSLR 40), un corpus de habla coreana con licencia CC BY 4.0. No se dispone de detalles sobre número de tokens, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla en coreano (transcripción de audio a jamo).
- Detección de palabras repetidas o añadidas mediante comparación de transcripción con un guion de referencia (uso previsto por el autor).
- Entrada de audio mono a 16 kHz con normalización estándar.
- Salida en formato logits CTC, compatible con decodificación greedy o con decodificadores externos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües (solo coreano).
- No dispone de visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Verificación de narración contra guion: el modelo transcribe el audio y el sistema compara la secuencia de jamo con el texto esperado para señalar palabras repetidas o añadidas, que es el uso para el que fue exportado.
- Subtitulado automático de contenido en coreano: transcripción fonémica que luego puede postprocesarse a hangul estándar para generar subtítulos.
- Control de calidad de locuciones: detectar desviaciones entre lo leído y el texto original en doblaje o audiolibros.
- Indexación de archivos de audio coreanos: convertir grabaciones a texto para búsqueda y recuperación.
- Integración en aplicaciones sin PyTorch: al estar en ONNX, puede ejecutarse con ONNX Runtime en entornos ligeros o embebidos.
- Prototipado de ASR coreano: servir como línea base rápida para pipelines de reconocimiento de habla antes de optar por modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una comparación de fidelidad de la exportación: diferencia máxima de 0,000009 frente al modelo PyTorch original y coincidencia del símbolo predicho en todos los fotogramas de una entrada de prueba.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,4 GB y el modelo en float32 es ligero, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo (wav2vec2-base).
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); también podría ejecutarse el modelo PyTorch original con Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| chegrowk/ko-jamo-base | Wav2Vec2 + CTC | Coreano | ONNX | Apache 2.0 | Exportación sin cambios de pesos |
| Kkonjeong/wav2vec2-base-korean | Wav2Vec2 + CTC | Coreano | PyTorch | Apache 2.0 | Modelo original del que deriva |
| facebook/wav2vec2-base | Wav2Vec2 + CTC | Inglés (preentrenamiento) | PyTorch | Apache 2.0 | Base arquitectónica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo reconoce coreano; no es un modelo multilingüe.
- No es un modelo generativo: no produce texto libre ni responde a instrucciones.
- El vocabulario de jamo implica que la salida requiere postprocesado para obtener hangul legible.
- Al ser una exportación sin reentrenamiento, hereda cualquier sesgo o limitación del modelo original Kkonjeong/wav2vec2-base-korean.
- Riesgo de errores de transcripción en audio con ruido, acentos o dominios distintos al corpus Zeroth-Korean.
- No se documentan evaluaciones de sesgo ni de robustez.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución al modelo original y a los datos Zeroth-Korean (CC BY 4.0).
- El modelo fue creado en 2026 según los metadatos; verificar la vigencia de los enlaces y del modelo base antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/chegrowk/ko-jamo-base
- Modelo original: https://huggingface.co/Kkonjeong/wav2vec2-base-korean
- Modelo base arquitectónico: https://huggingface.co/facebook/wav2vec2-base
- Dataset Zeroth-Korean (OpenSLR 40): https://www.openslr.org/40/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
