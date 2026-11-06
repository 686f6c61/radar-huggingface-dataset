# GoodnotesLtd/wespeaker-resnet221-lm-onnx

## Resumen

WeSpeaker ResNet221-LM ONNX es una conversión y reempaquetado del modelo de reconocimiento de hablante `wespeaker-voxceleb-resnet221-LM`, desarrollado originalmente por el equipo de WeSpeaker (proyecto wenet-e2e) y publicado en este repositorio por Goodnotes Ltd. No es un modelo generativo de lenguaje, sino un extractor de embeddings de hablante (speaker embeddings) de 256 dimensiones que convierte una señal de audio en un vector que permite comparar identidades vocales mediante similitud coseno. Resuelve el problema de verificación e identificación de hablante (speaker verification e identification) en aplicaciones de diarización, autenticación biométrica y análisis de conversaciones.

La arquitectura subyacente es una ResNet de 221 capas con estadísticas de pooling (LM, large margin), entrenada sobre VoxCeleb2. El aporte de este repositorio es la exportación a ONNX (opset 14) con un grafo dinámico idéntico al original y un grafo estático con pooling enmascarado de forma fija, además de una conversión a Core ML en formato NeuralNetwork con pesos fp16. El modelo opera sobre características fbank de 80 bins a 16 kHz con normalización CMN por mel y requiere normalización L2 antes de la comparación por coseno.

Es relevante para desarrolladores que necesitan integrar reconocimiento de hablante en pipelines nativos (macOS, iOS, Windows) sin depender de PyTorch en producción, ya que los artefactos ONNX y Core ML permiten ejecución en CPU, Core ML y potencialmente QNN/Windows ML, con paridad verificada frente a PyTorch mediante coseno superior a 0,999 en más de 200 clips.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet221 con estadísticas de pooling (LM, large margin) |
| Parametros totales | no disponible (pesos en fp32 de 114.410.390 bytes en `.pt`; 95.037.357 bytes en ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de hasta 10 s por clip en la variante estática (998 frames fbank) |
| Tipos de cuantizacion | fp32 (ONNX dinámico y estático), fp16 en pesos almacenados de Core ML (I/O y pooling en fp32) |
| Idiomas soportados | no disponible (independiente del idioma; modela características acústicas de hablante) |
| Licencia | apache-2.0 (según etiqueta upstream; con caveat de atribución a VoxCeleb2) |
| Formato de pesos | PyTorch `.pt`, ONNX (opset 14), Core ML `.mlmodel` / `.mlmodelc` |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional de tipo ResNet con 221 capas, configurada en modo LM (large margin) para el aprendizaje de representaciones de hablante. La entrada es un tensor `feats[B,T,80]` de características fbank de 80 bins calculadas a 16 kHz con ventana Hamming de 25 ms y salto de 10 ms, sin dither, con normalización CMN por mel y escala PCM16. La salida es un embedding crudo `embs[B,256]` que debe normalizarse L2 antes de compararse por coseno. El pooling se implementa mediante estadísticas ponderadas no sesgadas (unbiased weighted statistics pooling).

El entrenamiento original se realizó sobre VoxCeleb2, según indica la model card upstream. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de refinamiento adicionales. La innovación técnica de este repositorio no reside en el entrenamiento sino en la conversión: se añade un pooling estadístico enmascarado de forma fija para el grafo estático, se exporta a Core ML como NeuralNetwork fijo de 10 s con pesos fp16 y doble salida (normalizada y cruda), y se conserva el grafo dinámico original idéntico en hash. La máscara del grafo estático se muestrea nearest/floor a 125 frames del encoder, seguida de pooling ponderado no sesgado.

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio de 16 kHz mono.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings normalizados L2.
- Identificación de hablante (1:N) mediante comparación contra una galería de embeddings.
- Diarización de hablantes en conversaciones multihablante, segmentando y agrupando por identidad vocal.
- Funcionamiento independiente del idioma y del contenido léxico, al modelar características acústicas.
- Ejecución en ONNX Runtime con grafo dinámico (cualquier duración) o grafo estático (ventana fija de 10 s con padding y máscara).
- Ejecución en Core ML como NeuralNetwork con pesos fp16 y salidas normalizada y cruda.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Verificación biométrica de voz en aplicaciones móviles: el modelo puede comparar el embedding de una frase del usuario con un embedding de referencia almacenado, usando la variante Core ML con pesos fp16 para ejecución en el Neural Engine de dispositivos Apple.
- Diarización de reuniones y transcripciones: agrupar segmentos de audio por hablante antes de pasar el texto a un sistema ASR, usando la variante ONNX dinámica para procesar clips de duración variable sin relleno.
- Autenticación en call centers: verificar que la persona que llama coincide con el titular registrado comparando embeddings por coseno, con umbrales calibrados sobre los clips de validación.
- Análisis forense de audio: extraer embeddings de grabaciones de campo lejano (far-field) y compararlos contra una galería de referencia, aprovechando la validación del modelo en condiciones de headset y far-field.
- Indexación y búsqueda por voz en archivos multimedia: generar un embedding por segmento y construir un índice vectorial para recuperar fragmentos de un mismo hablante en grandes archivos.
- Control de acceso en dispositivos embebidos Windows: desplegar el grafo ONNX estático con ORT y evaluar el placement en QNN/Windows ML (no validado localmente por el autor, pendiente de prueba por el usuario).
- Investigación en reconocimiento de hablante: usar el grafo dinámico hash-idéntico al upstream como referencia reproducible para comparar nuevas técnicas de pooling o aumentado de datos.

## Benchmarks y rendimiento

Los datos disponibles son de paridad de conversión, no de precisión de reconocimiento (EER, minDCF) sobre VoxCeleb. No se han publicado resultados de benchmarks de precisión en la información disponible.

| Comparación (216 clips locales) | Coseno mínimo | Coseno mediano |
|---|---:|---:|
| Core ML NN normalizado vs PyTorch | 0,999878287315 | 0,999977231026 |
| Core ML NN crudo vs PyTorch | 0,999878287315 | 0,999977111816 |
| ONNX oficial vs PyTorch | 0,999999821186 | 1,000000000000 |

| Comparación Core ML vs ONNX dinámico (70 segmentos) | Coseno mínimo | Coseno medio |
|---|---:|---:|
| Global | 0,890734 | 0,987775 |
| A 2 s | 0,983472 | no disponible |
| A 5 s | 0,980562 | no disponible |
| A 9,9 s | 0,988460 | no disponible |
| A 10 s | 0,990590 | no disponible |
| A 30 s | 0,995792 | no disponible |

El mínimo a 1 s no alcanza el umbral de 0,95 especificado para la actualización, según reconoce el autor.

| RTF mediano en caliente (macOS M2 Max, 34 clips de 10 s, frontend de producción) | Valor |
|---|---:|
| Core ML | 0,005877 |
| ONNX dinámico CPU-2 | 0,230177 |
| ONNX estático CPU-2 | 0,231359 |

Mediciones separadas en Python del bake-off: CoreML EP 0,00399; CPU-4 0,09248 (protocolo y runtime distintos).

## Requisitos de hardware

- VRAM estimada: el modelo es pequeño (95 MB en ONNX fp32, 114 MB en `.pt`); en GPU requiere menos de 1 GB de VRAM para inferencia por lotes pequeños, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre es suficiente. El autor no reporta pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 o superior) e incluso en CPU. En Apple Silicon se ejecuta en CPU y Neural Engine vía Core ML.
- Opciones de despliegue: ONNX Runtime (versiones 1.31.1 para validación de fuente y 1.27.0 para paridad nativa), Core ML (compilado con macOS 27.0.1, ejecución en macOS con CPUAndNeuralEngine), y potencialmente Windows ML/QNN (no probado localmente).
- Latencia y throughput: RTF mediano de 0,005877 en Core ML sobre M2 Max y 0,230177 en ONNX CPU-2 sobre el mismo equipo, con frontend de producción incluido. En Python, CoreML EP alcanza RTF 0,00399 y CPU-4 0,09248.
- Plataformas no validadas localmente: Windows x64/arm64, Windows ML/QNN, Linux, iOS y Android. El autor indica que el usuario probará Windows y Android más adelante.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoodnotesLtd/wespeaker-resnet221-lm-onnx | ResNet221 LM, ONNX + Core ML | 256 dims | dinámico o 10 s fijo | apache-2.0 | Hugging Face |
| Wespeaker/wespeaker-voxceleb-resnet221-LM | ResNet221 LM, PyTorch + ONNX | 256 dims | dinámico | apache-2.0 | Hugging Face |
| ResNet34 (mencionado en la card, misma familia) | ResNet34, Core ML con doble salida | no disponible | 10 s fijo | no disponible en la información | uso interno en Goodnotes |

No se dispone de datos de precisión (EER) para comparar el rendimiento de reconocimiento frente a alternativas; la comparativa se limita a formato, arquitectura y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes. Cualquier uso en ese sentido es un error de categoría.
- El mínimo de coseno a 1 s (0,890734) incumple el umbral de 0,95 de la especificación de actualización; no es apto para clips de muy corta duración sin validación adicional.
- El padding del grafo estático puede alterar el contexto de frontera convolucional; el autor no garantiza equivalencia con la extracción dinámica en todas las duraciones.
- La variante Core ML fija 10 s y fp16 en pesos almacenados; el runtime de iOS no está cualificado por la compilación en macOS.
- Windows x64/arm64, Windows ML/QNN, Linux, iOS y Android no se han probado localmente.
- La licencia apache-2.0 se hereda de la etiqueta upstream, pero la model card advierte de un caveat de atribución más amplio a VoxCeleb2 que la etiqueta no resuelve; conviene revisar las condiciones del dataset antes de uso comercial.
- Riesgo de sesgo acústico: el modelo se entrenó sobre VoxCeleb2 (audio de celebridades, predominantemente en inglés y condiciones de estudio); el rendimiento puede degradarse en dominios, micrófonos, idiomas o condiciones acústicas distintas.
- No se incluyen audio, datasets, vectores de hablante individuales ni datos personales en el repositorio, pero el uso sobre voces reales exige cumplimiento de normativa de protección de datos y consentimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoodnotesLtd/wespeaker-resnet221-lm-onnx
- Modelo upstream: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM
- README upstream: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM/blob/main/README.md
- Pesos PyTorch upstream: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM/resolve/26732f43821f238bfb258c5ef54924a798e62118/voxceleb_resnet221_LM.pt
- ONNX upstream: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM/resolve/26732f43821f238bfb258c5ef54924a798e62118/voxceleb_resnet221_LM.onnx
- Script de exportación: https://github.com/GoodnotesGlobal/asr-cpp-node/blob/cd828e8/scripts/prepare-speaker-resnet221.py
- Proyecto WeSpeaker: https://github.com/wenet-e2e/wespeaker
