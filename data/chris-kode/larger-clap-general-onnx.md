# Chris-Kode/larger-clap-general-onnx

## Resumen

`Chris-Kode/larger-clap-general-onnx` es una conversión a ONNX del modelo CLAP (Contrastive Language-Audio Pretraining) `laion/larger_clap_general` de LAION, publicada por el usuario Chris-Kode. CLAP es el equivalente audio-texto de CLIP: proyecta audio y descripciones textuales a un espacio latente compartido de 512 dimensiones, de modo que la similitud coseno entre ambos embeddings permite clasificación zero-shot, búsqueda semántica de audio y recuperación texto-a-audio sin entrenamiento adicional.

La aportación de esta versión no es un nuevo modelo, sino un artefacto de despliegue: dos grafos ONNX (torre de audio y torre de texto) con cuantización dinámica int8 en los `MatMul`, extracción de características integrada en el grafo de audio (remuestreo a 48 kHz y log-mel spectrogram de 64 bandas) y embeddings normalizados de 512 números. El resultado son dos ficheros de 78,7 MB y 141,2 MB que suman un repositorio de 0,2 GB, frente al peso en float del modelo original.

Es relevante para quienes necesitan ejecutar búsqueda o clasificación de audio en entornos sin PyTorch, con ONNX Runtime como único runtime, o en CPU con latencias contenidas gracias a la cuantización int8. La fidelidad declarada es alta: coseno 0,998 respecto al modelo float en ambas torres.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLAP (dos torres: encoder de audio y encoder de texto RoBERTa, proyección a espacio conjunto) |
| Parámetros totales | no disponible (pesos cuantizados: 78,7 MB audio + 141,2 MB texto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 s de audio por ventana; 77 tokens de texto como máximo |
| Tipos de cuantización | int8 dinámico (ONNX Runtime `quantize_dynamic`) en audio; int8 block-wise (block size 32, simétrico) en texto; embeddings de token en int8 |
| Idiomas soportados | no disponible (el texto se procesa con el tokenizador RoBERTa del modelo original) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18), dos grafos: audio y texto |

## Arquitectura y entrenamiento

El modelo subyacente, `laion/larger_clap_general`, es un CLAP de dos torres entrenado de forma contrastiva sobre pares audio-texto. La torre de audio procesa espectrogramas log-mel y la torre de texto es un encoder tipo RoBERTa; ambas proyectan a un espacio común de 512 dimensiones donde el producto escalar entre un embedding de audio y uno de texto mide su similitud. Esta conversión no reentrena nada: parte de la revisión `ada0c23a36c4e8582805bb38fec3905903f18b41` del modelo original y solo cambia el formato y la precisión de los pesos.

Los cambios técnicos declarados son cuatro. Primero, exportación a ONNX opset 18 en dos grafos independientes, cada uno con su proyección y salida normalizada a longitud unitaria. Segundo, integración de la extracción de características en el grafo de audio: recibe muestras mono a 32 kHz y aplica internamente un remuestreador windowed-sinc a 48 kHz y el `ClapFeatureExtractor` (ventanas Hann de 1024 puntos, hop 480, 64 mels slaney de 50 Hz a 14 kHz, potencia en dB), con relleno "repeatpad" para clips más cortos de 10 s. Tercero, cuantización int8 dinámica de los `MatMul` de audio y cuantización `MatMulNBitsQuantizer` (8 bits, bloque 32, simétrica) de los `MatMul` de texto, con activaciones en float y embedding de token en int8. Cuarto, verificación contra `transformers` mediante los scripts `export_clap.py` y `common.py`, con coseno 0,998 frente al modelo float.

## Capacidades

- Clasificación zero-shot de audio: comparar un clip contra un conjunto de etiquetas textuales arbitrarias sin entrenamiento específico.
- Búsqueda semántica de audio: indexar embeddings de audio y consultar con texto en lenguaje natural, o viceversa.
- Recuperación texto-a-audio y audio-a-texto mediante similitud coseno en el espacio de 512 dimensiones.
- Procesamiento por lotes: el grafo de audio acepta `[W, 320000]` (W ventanas de 10 s) y el de texto `[T, L]` (T textos de hasta 77 tokens).
- Extracción de características integrada: no requiere pipeline de audio externo, solo muestras mono a 32 kHz.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de embeddings, no generativo.
- No dispone de capacidades de visión, habla a texto ni traducción.

## Casos de uso

- Moderación y etiquetado de audio a escala: clasificar clips subidos por usuarios contra un vocabulario de categorías definido en el momento (música, voz, ruido, sirena, llanto) sin reentrenar, usando el grafo de audio en lotes.
- Búsqueda en archivos de sonido y podcasts: generar embeddings de todos los fragmentos de 10 s y servir consultas de texto tipo "aplausos del público" o "motor arrancando" mediante similitud coseno en un índice vectorial.
- Detección de eventos acústicos en monitorización: comparar ventanas de 10 s contra descripciones de eventos de interés en entornos industriales o urbanos, con la ventaja de que las etiquetas se cambian editando el texto.
- Organización automática de librerías de muestras para producción musical: etiquetar samples por instrumento, timbre o carácter ("batería seca", "pad cálido") sin taxonomía predefinida.
- Despliegue en CPU o entornos sin PyTorch: al ser ONNX int8 con extracción de features incluida, se puede servir con ONNX Runtime en contenedores ligeros, funciones serverless o dispositivos edge donde instalar `transformers` y sus dependencias no es viable.
- Evaluación de calidad de datasets de audio: filtrar pares audio-texto por baja similitud para detectar etiquetas ruidosas antes de usarlos en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado por el autor es la fidelidad de la cuantización: similitud coseno de 0,998 respecto al modelo float, tanto en la torre de audio como en la de texto.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 0,2 GB; la inferencia cabe holgadamente en menos de 1 GB, por lo que es ejecutable en CPU sin GPU.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT); para lotes grandes, A100 o H100 aportan margen, pero no son necesarias para uso interactivo.
- GPU de consumo: cabe en cualquier RTX (3060, 4060, 4090) e incluso en iGPU mediante ONNX Runtime con CPU.
- Despliegue: ONNX Runtime (CPU o CUDA), ONNX Runtime GenAI no aplica (no es generativo), integrable en servidores de embeddings propios; no se distribuye en GGUF ni en formato Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Contexto audio | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| Chris-Kode/larger-clap-general-onnx | CLAP (dos torres) | 512 | 10 s | int8 | Apache-2.0 | ONNX |
| laion/larger_clap_general | CLAP (dos torres) | 512 | 10 s | float | Apache-2.0 | PyTorch |
| laion/clap-htsat-unfused | CLAP (HTSAT + RoBERTa) | 512 | 10 s | float | Apache-2.0 | PyTorch |

La comparación directa es con su modelo base: misma arquitectura, mismos embeddings y misma licencia, con la diferencia de formato (ONNX frente a PyTorch), cuantización int8 y extracción de features embebida. Frente a otras alternativas de la familia CLAP de LAION, el eje de decisión es el backend de ejecución, no la calidad del embedding.

## Limitaciones y advertencias

- Es un modelo de embeddings: no genera texto, no razona y no responde preguntas; cualquier caso de uso generativo requiere otro modelo.
- Ventana de audio fija de 10 s: los clips más largos deben trocearse y los más cortos se rellenan con repetición y ceros, lo que puede distorsionar la similitud en clips muy breves.
- Límite de 77 tokens de texto: descripciones largas se truncan, lo que afecta a la precisión de las consultas.
- La cuantización int8 introduce una desviación de coseno 0,002 respecto al modelo float; en rankings muy ajustados puede alterar el orden de resultados.
- El tokenizador no está incluido en el repositorio: hay que tomar `vocab.json` y `merges.txt` del repositorio original, un paso adicional que puede romper despliegues automatizados si no se gestiona.
- Idiomas soportados no declarados; el comportamiento multilingüe del encoder de texto no está documentado en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero se mantienen las obligaciones de atribución de la sección 4(b) respecto al modelo original de LAION.
- Riesgo de sesgo heredado del dataset de entrenamiento de LAION, no cuantificado en la información disponible.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso en producción; conviene verificar los SHA-256 publicados antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chris-Kode/larger-clap-general-onnx
- Modelo base: https://huggingface.co/laion/larger_clap_general
- Repositorio de LAION CLAP: https://github.com/LAION-AI/CLAP
- ONNX Runtime, cuantización: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
