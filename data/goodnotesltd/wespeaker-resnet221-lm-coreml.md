# GoodnotesLtd/wespeaker-resnet221-lm-coreml

## Resumen

WeSpeaker ResNet221-LM CoreML es una conversión a Core ML del modelo de reconocimiento de hablante (speaker recognition) WeSpeaker ResNet221-LM, publicado por GoodnotesLtd. No es un modelo de lenguaje: es una red convolucional ResNet de 221 capas entrenada para extraer embeddings de identidad de voz (speaker embeddings) de 256 dimensiones a partir de audio mono a 16 kHz. El modelo original procede del proyecto WeSpeaker (wenet-e2e/wespeaker) y se entrenó sobre VoxCeleb2; esta revisión concreta empaqueta los pesos en formato Core ML NeuralNetwork de forma fija para 10 segundos de audio, con pesos almacenados en fp16 y aritmética de E/S y pooling en fp32.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, y el propio autor lo describe como una revisión opt-in, no como una cualificación de release. El interés técnico está en el trabajo de conversión y validación de paridad: se documentan comparaciones de similitud coseno entre PyTorch, ONNX dinámico, ONNX estático y Core ML sobre 216 clips locales, además de una comparación en 70 segmentos de conversación donde la ventana de 1 segundo incumple el umbral de 0,95 fijado en la especificación de upgrade del propio autor.

El modelo resuelve el problema de verificación e identificación de hablante en dispositivos Apple (macOS con CPUAndNeuralEngine), ofreciendo un RTF mediano en caliente de 0,005877 frente a 0,230177 del ONNX dinámico en CPU-2 sobre un M2 Max. No se han publicado datos de benchmarks estándar de speaker verification (EER, minDCF) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet de 221 capas (CNN), con statistics pooling ponderado y salida de embedding |
| Parametros totales | no disponible (el fichero fuente `voxceleb_resnet221_LM.pt` ocupa 114.410.390 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana fija de 10 s en Core ML (entrada `fbank_features[1,1,80,998]`) |
| Tipos de cuantizacion | pesos fp16 almacenados en Core ML; E/S y pooling en fp32; ONNX en fp32 |
| Idiomas soportados | no disponible (independiente del idioma; modela identidad de voz) |
| Licencia | Apache-2.0 (etiqueta upstream; ver advertencias sobre atribución VoxCeleb2) |
| Formato de pesos | Core ML (`Embedding.mlmodel`, `Embedding.mlmodelc`), ONNX (dinámico y estático), PyTorch `.pt` |
| Dimension de embedding | 256 |
| Frecuencia de muestreo | 16 kHz mono |
| Frontend de features | `kaldi-fbank80-v1` (80 bins, ventana Hamming 25 ms, salto 10 ms, sin dither, CMN por mel, escala PCM16) |
| Opset ONNX | 14 |
| Normalizacion | L2 antes de comparación por coseno |

## Arquitectura y entrenamiento

La red es una ResNet de 221 capas del ecosistema WeSpeaker, entrenada sobre VoxCeleb2 según la receta de modelos preentrenados generales de WeSpeaker. El pipeline es el habitual en reconocimiento de hablante: features fbank de 80 bins a 16 kHz, codificador convolucional profundo, statistics pooling y una capa de embedding de 256 dimensiones. La comparación entre embeddings se hace con similitud coseno tras normalización L2.

La conversión de GoodnotesLtd introduce varias modificaciones respecto al grafo original: un export ONNX estático con pooling de estadísticas enmascarado (`feats[1,998,80]` más `weights[1,998]`), y una conversión a Core ML NeuralNetwork de forma fija con doble salida (`embedding` normalizado y `embedding_raw`). La máscara se muestrea con interpolación nearest/floor a las 125 tramas del encoder, seguida de pooling de estadísticas ponderado no sesgado. El autor documenta que el padding estático puede alterar el contexto de frontera de las convoluciones y no reclama equivalencia exacta con la extracción dinámica en todas las duraciones. Se eligió NeuralNetwork fijo en lugar de MLProgram porque este último producía NaNs en las pruebas y un grafo fp16 fallaba la compilación por resta escalar; comprimir solo los pesos almacenados evita ese fallo.

## Capacidades

- Extracción de embeddings de identidad de voz de 256 dimensiones a partir de audio de 16 kHz.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings normalizados.
- Identificación de hablante (1:N) por comparación contra un conjunto de referencia de embeddings.
- Segmentación y agrupación de hablantes (diarización) como componente de un pipeline externo.
- Funcionamiento en ventanas de hasta 10 s en la variante Core ML; el ONNX dinámico acepta `feats[B,T,80]` con longitud variable.
- Soporte de máscara de prefijo válido para audio con padding (`weights` en el export estático y Core ML).
- Ejecución en macOS sobre CPUAndNeuralEngine.
- No soporta tool calling, agentes, generación de texto, visión ni audio en el sentido de modelos multimodales.

## Casos de uso

- Verificación de hablante en aplicaciones macOS: el modelo permite comprobar si dos segmentos de audio pertenecen al mismo hablante comparando embeddings normalizados con coseno, con RTF mediano de 0,005877 en M2 Max, adecuado para procesamiento casi en tiempo real en local.
- Identificación de hablante en reuniones y transcripciones: integrado como componente de un pipeline ASR, permite etiquetar cada segmento de una conversación con su hablante; el autor reporta 70 segmentos de conversación evaluados con coseno mínimo/medio de 0,890734/0,987775 frente al ONNX dinámico.
- Diarización de llamadas o grabaciones de atención al cliente: agrupando embeddings de ventanas de 10 s se pueden separar interlocutores en una grabación mono antes de aplicar análisis posteriores.
- Autenticación por voz en local: al ejecutarse en el Neural Engine de macOS sin enviar audio a la nube, encaja en flujos de verificación biométrica de baja latencia donde la privacidad del audio es requisito.
- Indexación y búsqueda de archivos de audio: generar un embedding por locutor y almacenarlo para búsquedas por similitud sobre archivos históricos.
- Preprocesado para modelos ASR con separación de hablantes: usar los embeddings como entrada auxiliar en pipelines de transcripción con múltiples interlocutores.
- Evaluación de calidad de captura: comparar embeddings de distintas condiciones (headset frente a campo lejano) para detectar degradación, ya que el autor validó explícitamente ambas condiciones a 2, 10 y 30 s.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de speaker verification (EER, minDCF, accuracy sobre VoxCeleb) en la información disponible. Los datos publicados son de paridad entre implementaciones y de rendimiento de inferencia:

| Comparacion | Minimo (coseno) | Mediana (coseno) |
|---|---:|---:|
| Core ML NN normalizado vs PyTorch | 0,999878287315 | 0,999977231026 |
| Core ML NN raw vs PyTorch | 0,999878287315 | 0,999977111816 |
| ONNX oficial vs PyTorch | 0,999999821186 | 1,000000000000 |

| Metrica de rendimiento (macOS M2 Max, 34 clips de 10 s, host compartido) | Valor |
|---|---:|
| RTF mediano Core ML | 0,005877 |
| RTF mediano ONNX dinámico CPU-2 | 0,230177 |
| RTF mediano ONNX estático CPU-2 | 0,231359 |

En el bake-off en Python con otro protocolo de medida: RTF 0,00399 con CoreML EP y 0,09248 con CPU-4.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero fuente PyTorch ocupa 114,4 MB y el ONNX 95,0 MB; el repo completo pesa 0,1 GB. La inferencia en fp32 requiere del orden de unos cientos de MB de memoria, sin cifra exacta publicada.
- GPU recomendadas: no se reportan pruebas en GPU. La validación nativa se hizo en un Apple M2 Max con CPUAndNeuralEngine.
- Cabe en hardware consumer Apple: sí, en Mac con Neural Engine; el autor indica que Windows x64/arm64, Windows ML/QNN, Linux, iOS y Android no se ejecutaron localmente, y que el usuario probará Windows y Android más adelante.
- Opciones de despliegue: Core ML (`Embedding.mlmodel` compilable con el SDK de iOS objetivo, `Embedding.mlmodelc` compilado en macOS 27.0.1), ONNX Runtime (grafo dinámico y estático, opset 14), y PyTorch para el modelo fuente.
- Latencia y throughput: RTF mediano 0,005877 en Core ML frente a 0,230177 en ONNX CPU-2, es decir, aproximadamente 39 veces menor tiempo de proceso por segundo de audio en la misma máquina. El autor advierte que son medidas en un host compartido y ocupado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| GoodnotesLtd/wespeaker-resnet221-lm-coreml | ResNet221, Core ML NN fijo | 256 | 10 s fijos, fbank80 | Apache-2.0 | Hugging Face, 0 descargas |
| Wespeaker/wespeaker-voxceleb-resnet221-LM | ResNet221, PyTorch/ONNX | 256 | longitud variable (`feats[B,T,80]`) | Apache-2.0 (etiqueta upstream) | Hugging Face, upstream |
| ResNet34 de WeSpeaker (referenciado en la model card) | ResNet34 | no disponible | no disponible | no disponible | usado como convención de doble salida en el pipeline del autor |

No se dispone de datos de benchmarks comparativos de precisión (EER/minDCF) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ventana de 1 segundo incumple el umbral de 0,95 de la especificación de upgrade del autor: el coseno mínimo Core ML frente a ONNX dinámico en esa duración es 0,890734. Las duraciones de 2, 5, 9,9, 10 y 30 s sí superan el umbral (mínimos entre 0,980562 y 0,995792).
- El padding estático puede cambiar el contexto de frontera de las convoluciones; el autor no reclama equivalencia exacta con la extracción dinámica en todas las duraciones.
- La licencia Apache-2.0 es la etiqueta del modelo upstream, pero la model card advierte que los pesos siguen la licencia del dataset VoxCeleb2 y que la etiqueta no resuelve esa obligación de atribución más amplia. Verificar antes de uso comercial.
- El modelo es una revisión opt-in, no una cualificación de release ni permiso para reinterpretar vectores de hablante existentes.
- El runtime de iOS no está cualificado por la compilación en macOS; `Embedding.mlmodelc` se compiló en macOS 27.0.1 y el autor no ejecutó pruebas en iOS, Android, Linux ni Windows.
- Windows ML/QNN no está probado; el autor indica que el export estático requiere folding de ORT antes de la colocación en QNN.
- No se incluyen audio, datasets, vectores de hablante individuales ni datos personales en el repositorio.
- Riesgo de sesgo y alucinación: no aplica alucinación en el sentido de modelos generativos, pero no hay información publicada sobre sesgos demográficos, de acento o de género en los embeddings.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoodnotesLtd/wespeaker-resnet221-lm-coreml
- Modelo upstream: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM
- README upstream: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM/blob/main/README.md
- Árbol de ficheros upstream: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM/tree/main
- Pesos fuente PyTorch: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM/resolve/26732f43821f238bfb258c5ef54924a798e62118/voxceleb_resnet221_LM.pt
- ONNX fuente: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet221-LM/resolve/26732f43821f238bfb258c5ef54924a798e62118/voxceleb_resnet221_LM.onnx
- Script de exportación: https://github.com/GoodnotesGlobal/asr-cpp-node/blob/cd828e8/scripts/prepare-speaker-resnet221.py
- Proyecto WeSpeaker: https://github.com/wenet-e2e/wespeaker
