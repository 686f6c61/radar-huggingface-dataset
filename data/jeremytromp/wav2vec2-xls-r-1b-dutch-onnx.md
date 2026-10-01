# Jeremytromp/wav2vec2-xls-r-1b-dutch-onnx

## Resumen

`Jeremytromp/wav2vec2-xls-r-1b-dutch-onnx` es un export a ONNX del modelo `jonatasgrosman/wav2vec2-xls-r-1b-dutch`, que a su vez es un fine-tune sobre neerlandés (Common Voice 8) del modelo multilingüe XLS-R 1B de Meta. El autor, Jeremytromp, lo publica como pieza de infraestructura para TrompTech Studio, donde se utiliza como alineador forzado CTC: el modelo no transcribe desde cero, sino que recibe audio y devuelve logits por fotograma para determinar cuándo empieza y acaba cada palabra en una transcripción previa.

El modelo original cuenta con aproximadamente 1.000 millones de parámetros y una arquitectura wav2vec 2.0 con cabecera CTC para clasificación de 43 tokens (fonemas/caracteres en neerlandés). Esta versión ONNX aplica cuantización dinámica int8 únicamente a los pesos de las capas `MatMul`, manteniendo las convoluciones en float32, lo que reduce el tamaño del repositorio de 3,8 GB a 1,0 GB sin reentrenamiento alguno.

Su relevancia actual radica en la combinación de tres factores: exportación a un formato portable y rápido en CPU (ONNX Runtime), una reducción de peso agresiva que permite desplegarlo en hardware modesto, y una precisión medida de 99-100 % de inicios de palabra dentro de una ventana de 80 ms en habla limpia. Es, por tanto, una pieza especializada para pipelines de subtitulado y sincronización de transcripciones, no un modelo de ASR generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con cabecera CTC (encoder convolucional + transformer, exportado a ONNX, opset 17) |
| Parametros totales | ~1.000 millones (modelo base XLS-R 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada dinámica, un fotograma cada 320 muestras = 20 ms a 16 kHz) |
| Tipos de cuantizacion | int8 dinámico en pesos MatMul (QInt8); convoluciones en float32 |
| Idiomas soportados | neerlandés (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_int8.onnx`), vocabulario en `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec 2.0: un extractor convolucional que convierte la señal de audio en representaciones latentes y un encoder transformer que procesa dichas representaciones. Sobre esa base, el modelo incorpora una cabecera CTC para clasificación a nivel de token, con un vocabulario de 43 símbolos en el que `<pad>` actúa como blank y `|` como separador de palabra. El modelo original fue entrenado por Meta como XLS-R 1B (preentrenamiento autosupervisado sobre 436.000 horas de audio en 128 idiomas) y posteriormente afinado por Jonatas Grosman sobre el corpus neerlandés de Common Voice 8.

Esta versión concreta no ha sido reentrenada. El autor únicamente realizó dos operaciones: exportación mediante `torch.onnx.export` con opset 17 y longitud dinámica, y cuantización dinámica de los pesos de las capas `MatMul` con `onnxruntime.quantize_dynamic` en modo QInt8. Las convoluciones se mantienen en float32 para preservar la precisión temporal, que es crítica en una tarea de alineación. La salida conserva 43 logits por fotograma, con un fotograma cada 320 muestras (20 ms a 16 kHz), lo que da una resolución temporal suficiente para la alineación a nivel de palabra.

## Capacidades

- Reconocimiento de voz CTC sobre neerlandés, con salida de logits por fotograma.
- Alineación forzada (forced alignment): dado un audio y una transcripción, determina el instante de inicio y fin de cada palabra.
- Integración en pipelines híbridos donde un modelo tipo Whisper produce la transcripción y este modelo aporta los timestamps precisos.
- Entrada de audio mono a 16 kHz con normalización (media cero, varianza unidad).
- Soporte de longitudes de audio dinámicas (el eje de muestras no está fijado en el grafo ONNX).
- No incluye mecanismos de tool calling, agentes ni razonamiento multi-turno.
- No soporta otros idiomas distintos del neerlandés (el vocabulario está restringido al conjunto de tokens del modelo base).
- Capacidad específica de alineación medida: 99-100 % de inicios de palabra dentro de 80 ms en habla limpia y mezclas musicales normales.

## Casos de uso

- Subtitulado con marcas de tiempo por palabra: se transcribe el audio con un modelo ASR general (por ejemplo Whisper) y se pasa la transcripción junto al audio por este alineador para obtener los timestamps exactos de cada palabra, requisito habitual en formatos de subtítulos tipo SRT/VTT con karaoke o resaltado.
- Sincronización de audiolibros y podcasts: alinear el texto del guion o del libro con el audio narrado permite generar versiones "read-along" donde se resalta la frase que se está escuchando.
- Indexación y búsqueda por palabra en archivos de audio neerlandeses: con timestamps por palabra se puede construir un índice buscable que salte al instante exacto donde se pronunció un término.
- Análisis fonético y lingüístico: investigadores que estudian fonética neerlandesa pueden usar los logits por fotograma para estudiar la realización temporal de fonemas concretos.
- Verificación de calidad de locuciones: en producción de doblaje o voces sintéticas, el alineador detecta desajustes entre el guion y la locución grabada al comparar los tiempos esperados con los reales.
- Herramientas de anotación para datasets de voz: integrado en interfaces de etiquetado, permite pre-rellenar los límites de palabra para que un anotador humano solo revise y ajuste.
- Pipelines de accesibilidad en tiempo real: generación de subtítulos con sincronía fina para personas con discapacidad auditiva en emisiones neerlandesas, ejecutándose en CPU gracias al formato ONNX int8.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (WER en Common Voice, MMLU ni similares). El único dato de rendimiento disponible es una medición propia como alineador: entre el 99 % y el 100 % de los inicios de palabra caen dentro de una ventana de 80 ms en habla limpia y en mezclas musicales normales, medido sobre habla neerlandesa con tiempos de palabra conocidos.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Precisión de alineación (inicios de palabra) | 99-100 % dentro de 80 ms | Habla limpia y mezclas musicales normales, neerlandés |
| Reducción de tamano | 3,8 GB → 1,0 GB | Cuantización dinámica int8 de pesos MatMul |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~1.000 millones de parámetros cuantizado a int8, el peso en memoria ronda 1,0 GB; con activaciones y buffers de ONNX Runtime, el consumo práctico se sitúa en torno a 1,5-2,5 GB de RAM/VRAM según la longitud del audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, T4) es suficiente; en GPUs mayores (RTX 4090, A100, H100) el modelo no se beneficia tanto porque el cuello de botella suele ser el extractor convolucional y la propia carga.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con 4 GB o más. También funciona en CPU, que es de hecho el escenario principal de un export ONNX int8.
- Opciones de despliegue: ONNX Runtime (runtime nativo del modelo), integrable en Python, C++, C# y Java; puede servirse tras FastAPI, Triton Inference Server o cualquier servidor que admita modelos ONNX.
- Latencia y throughput: no disponibles. El autor no publica cifras de tiempo de inferencia ni de audios procesados por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idioma | Tarea | Licencia |
|---|---|---|---|---|---|
| Jeremytromp/wav2vec2-xls-r-1b-dutch-onnx | ~1.000 M | ONNX int8 | Neerlandés | Alineación forzada CTC / ASR | Apache 2.0 |
| jonatasgrosman/wav2vec2-xls-r-1b-dutch | ~1.000 M | PyTorch (safetensors) | Neerlandés | ASR | Apache 2.0 |
| facebook/wav2vec2-xls-r-1b | ~1.000 M | PyTorch | Multilingüe (128 idiomas) | Preentrenamiento de representaciones de voz | MIT / Apache 2.0 (según versión) |
| darjusul/wav2vec2-ONNX-collection | Variable | ONNX | Varios | ASR | no disponible |

La diferencia clave frente al modelo base de Jonatas Grosman es el formato y la cuantización: mismo conocimiento, pero en ONNX int8 y con un cuarto del tamaño en disco. Frente al XLS-R 1B original de Meta, este modelo está especializado en neerlandés y orientado a producción de timestamps, no a preentrenamiento multilingüe.

## Limitaciones y advertencias

- Especializado exclusivamente en neerlandés: no funciona bien con otros idiomas y su vocabulario está limitado a los tokens del modelo base.
- No es un modelo ASR autónomo: está pensado para funcionar junto a una transcripción previa y un modelo que decida "qué" se dijo; él solo decide "cuándo".
- Riesgo de degradación en habla con ruido de fondo, solapamiento de voces, acentos muy marcados o audio de baja calidad; el dato de 99-100 % corresponde a habla limpia y mezclas musicales normales.
- La cuantización int8 introduce una pérdida de precisión numérica que, aunque pequeña, puede afectar a la alineación en audios extremos.
- El repositorio tiene cero descargas y cero "likes" en el momento de la consulta, y fue creado y actualizado el mismo día: no hay validación por parte de la comunidad ni mantenimiento continuado garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el autor original del fine-tune (Jonatas Grosman) y Meta (XLS-R) deben ser atribuidos.
- No se documentan sesgos específicos, pero al derivar de Common Voice 8 hereda los sesgos demográficos y de grabación de ese corpus (sobrerrepresentación de ciertos acentos y registros).
- No hay información sobre latencia, throughput ni consumo de memoria medidos de forma independiente.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Jeremytromp/wav2vec2-xls-r-1b-dutch-onnx
- Modelo base en HuggingFace: https://huggingface.co/jonatasgrosman/wav2vec2-xls-r-1b-dutch
- XLS-R 1B de Meta en HuggingFace: https://huggingface.co/facebook/wav2vec2-xls-r-1b
- Colección de modelos wav2vec2 en ONNX: https://huggingface.co/darjusul/wav2vec2-ONNX-collection
- Documentación de torchaudio sobre XLS-R 1B: https://docs.pytorch.org/audio/2.3/generated/torchaudio.models.wav2vec2_xlsr_1b.html
- Notebook de exportación de wav2vec2 a ONNX: https://colab.research.google.com/github/vasudevgupta7/gsoc-wav2vec2/blob/main/notebooks/wav2vec2_onnx.ipynb
