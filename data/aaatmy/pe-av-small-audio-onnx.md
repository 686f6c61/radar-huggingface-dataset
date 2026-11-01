# aaatmy/pe-av-small-audio-ONNX

## Resumen

PE-AV small audio ONNX es una exportación no oficial a formato ONNX de la rama de audio del modelo Perception Encoder Audio-Visual (PE-AV) de Meta FAIR, concretamente del checkpoint `facebook/pe-av-small`. El modelo original combina codificadores de audio, vídeo y texto en un espacio de embeddings compartido; esta conversión incluye únicamente el codificador de audio (DAC encoder convolucional, token CLS y transformer) junto con la cabeza `audio_head`, que proyecta audio a 48 kHz al espacio audio-texto de PE-AV. El resultado es un extractor de características de unos 117 millones de parámetros que produce embeddings de 1024 dimensiones.

La relevancia de esta conversión es práctica: permite ejecutar la rama de audio sin PyTorch ni la pila completa de `transformers`, usando `onnxruntime` en CPU, lo que facilita el despliegue en entornos ligeros. El repositorio incluye dos variantes: `model.onnx` en float32 (470 MB) y `model_q8.onnx` con cuantización de pesos de 8 bits por bloques de 32 (222 MB), manteniendo el encoder convolucional DAC en float32.

El modelo está pensado para tareas de clasificación zero-shot de audio mediante comparación de embeddings de audio con prototipos de texto precalculados offline. Requiere calcular los embeddings de texto con el modelo original de Meta, ya que esta exportación no incluye el codificador de texto ni el de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con encoder convolucional DAC para audio (rama de audio de PE-AV) |
| Parámetros totales | ~117 M (rama de audio + audio_head) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (segmentos de audio; el ejemplo usa 10 s, con evaluaciones en clips de 3, 4, 10 y 30 s) |
| Tipos de cuantización | Float32 y 8-bit block-wise (block 32, weight-only MatMul; DAC encoder en float32) |
| Idiomas soportados | El tokenizer del codificador de texto original es solo inglés; los prompts deben escribirse en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` float32, `model_q8.onnx` int8) |

## Arquitectura y entrenamiento

La rama de audio exportada sigue la arquitectura de PE-AV: un encoder convolucional DAC que procesa audio mono a 48 kHz, un token CLS y un transformer que agrega la información temporal, seguido de una cabeza `audio_head` que proyecta la representación al espacio compartido audio-texto. La exportación se realizó con TorchScript a ONNX (opset 17) usando `transformers` 5.20.2 con atención eager y sin máscara de padding, lo que evita el constructor de máscaras basado en `vmap` de `transformers`. La cuantización int8 se aplicó con `MatMulNBitsQuantizer` de onnxruntime (8 bits, bloque 32, simétrico, solo `MatMul`).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en esta ficha, más allá de que el modelo base es `facebook/pe-av-small` de Meta FAIR. El scoring del modelo original es de tipo SigLIP (sigmoide sobre logits), con parámetros de escalado y sesgo documentados en `scoring.json`: `logit = audio_embedding · text_embedding * 2.205655813217163 + (-10.120551109313965)`. Dado que la escala es positiva y el sesgo compartido, el ranking por producto escalar directo produce el mismo orden.

## Capacidades

- Extracción de embeddings de audio de 1024 dimensiones a partir de audio mono a 48 kHz, no normalizados.
- Clasificación zero-shot de audio mediante comparación con prototipos de texto precalculados con el modelo original.
- Reconocimiento de instrumentos musicales (evaluado en NSynth y Medley-solos-DB).
- Procesamiento de clips de distinta duración (3, 4, 10 y 30 s en las pruebas de paridad).
- Ejecución en CPU con `onnxruntime`, incluyendo proveedor CoreML con forma de entrada fija.
- No incluye tool calling, function calling, capacidades de agente, visión, audio generativo ni razonamiento multi-paso.
- No incluye el codificador de texto: los embeddings de texto deben calcularse offline con `facebook/pe-av-small`.

## Casos de uso

- Clasificación zero-shot de eventos sonoros: se calculan embeddings de texto para las clases de interés con el modelo original y se comparan por producto escalar con el embedding de audio del clip; útil cuando no se dispone de un clasificador entrenado específicamente.
- Etiquetado automático de archivos musicales: identificación de instrumentos o familias instrumentales en bibliotecas de audio, con precisión medida del 95,4 % en Medley-solos-DB para 8 instrumentos.
- Búsqueda semántica de audio por texto: indexación de una colección de clips por sus embeddings y consulta mediante prototipos de texto, permitiendo recuperación por descripción en inglés.
- Moderación o filtrado de contenido sonoro: detección de categorías de audio definidas por prompts de texto, desplegable en CPU sin GPU.
- Preprocesado en pipelines de ML: generación de features de audio para modelos posteriores (clasificadores ligeros, clustering, deduplicación) en entornos donde no se quiere instalar PyTorch.
- Despliegue en dispositivos de borde: la variante int8 de 222 MB y la latencia de ~0,85 s por segmento de 3 s en Apple Silicon la hacen viable para procesamiento local en CPU.
- Análisis de audio en investigación: comparación de representaciones audio-texto de PE-AV en estudios de alineamiento multimodal, usando la exportación ONNX como extractor reproducible con checksums publicados.

## Benchmarks y rendimiento

Paridad con PyTorch (transformers 5.20.2), medida por el autor:

| Archivo | Clips | Coseno mínimo | Coseno medio | Coincidencia top-1 |
|---|---|---|---|---|
| `model.onnx` | 100 (3, 4, 10, 30 s) | 1,000000 | 1,000000 | 100 % |
| `model_q8.onnx` | 250 (3, 4, 10, 30 s) | 0,99944 | 0,99978–0,99990 | 100 % en 3, 10 y 30 s; 97 % en notas NSynth de 4 s |

Reconocimiento zero-shot de instrumentos con el modelo PyTorch original (el autor indica que la paridad ONNX implica resultados equivalentes):

| Dataset | Clases | Exactitud | Exactitud balanceada |
|---|---|---|---|
| NSynth test (4.096 notas) | 10 familias de instrumentos | 75,1 % | 77,6 % |
| Medley-solos-DB test (12.236 clips) | 8 instrumentos | 95,4 % | 93,1 % |

Latencia en CPU (Apple Silicon, onnxruntime 1.31): ~2,8 s por segmento de 10 s y ~0,85 s por segmento de 3 s para ambos archivos. Con CoreML y forma de entrada fija, CPU más Neural Engine: 2,3 s por segmento de 10 s; las configuraciones con GPU resultaron más lentas que CPU. La variante con `accuracy_level=4` (cómputo int8 en `MatMulNBits`) fue descartada por alcanzar solo 0,9966 de coseno mínimo.

## Requisitos de hardware

- VRAM: no aplica para ejecución en CPU; para GPU, el archivo float32 ocupa 470 MB y el int8 222 MB, más overhead de activaciones (no cuantificado en la información disponible).
- GPU recomendadas: no especificadas; el autor reporta que las configuraciones con GPU fueron más lentas que CPU en su entorno de prueba.
- CPU: viable; latencia de ~0,85 s por 3 s de audio y ~2,8 s por 10 s en Apple Silicon.
- CoreML: requiere forma de entrada fija; con ella, 2,3 s por segmento de 10 s en CPU + Neural Engine.
- Despliegue: `onnxruntime` (CPUExecutionProvider, CoreMLExecutionProvider). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Memoria en disco: 0,7 GB de repositorio (470 MB float32 + 222 MB int8 + scripts y checksums).
- Throughput: no disponible más allá de las latencias por segmento indicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PE-AV small audio ONNX (este) | ~117 M (rama audio) | Audio mono 48 kHz, clips de 3–30 s evaluados | Embeddings audio-texto, clasificación zero-shot | Apache 2.0 | ONNX en HuggingFace |
| facebook/pe-av-small | No disponible en la información | Audio + vídeo + texto | Embeddings audio-visuales | Apache 2.0 (según repo perception_models) | PyTorch en HuggingFace |
| CLAP (LAION) | No disponible en la información | Audio + texto | Embeddings audio-texto, zero-shot | No disponible en la información | No disponible en la información |
| Whisper (como encoder de audio) | No disponible en la información | Audio 16 kHz | ASR, no clasificación zero-shot | No disponible en la información | No disponible en la información |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Exportación no oficial: no está afiliada ni respaldada por Meta; posibles divergencias futuras respecto al modelo original.
- No incluye el codificador de texto ni el de vídeo: para clasificación zero-shot es imprescindible calcular los embeddings de texto offline con `facebook/pe-av-small` y almacenarlos.
- El tokenizer del codificador de texto es solo inglés; los prompts deben redactarse en inglés.
- No soporta máscaras de padding: hay que procesar clips de uno en uno o agrupar clips de igual longitud.
- Los embeddings de salida no están normalizados; el ranking por producto escalar es válido por la escala positiva y sesgo compartido, pero no debe asumirse normalización L2.
- En dominios fuera de distribución (p. ej. notas NSynth de 4 s frente a clases de Medley-solos) las puntuaciones son próximas y pequeñas variaciones pueden cambiar la clase top-1; la cuantización int8 baja la coincidencia al 97 % en ese caso.
- La cuantización int8 mantiene el encoder convolucional DAC en float32, que concentra la mayor parte del tiempo de cómputo; la ganancia de velocidad es limitada.
- El proveedor CoreML exige forma de entrada fija.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un extractor de características, el riesgo se traslada a la calidad de los prototipos de texto y a la cobertura de clases.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución a Meta FAIR y al repositorio `perception_models`; verificar los términos del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aaatmy/pe-av-small-audio-ONNX
- Modelo base: https://huggingface.co/facebook/pe-av-small
- Repositorio de Meta: https://github.com/facebookresearch/perception_models
- Paper referenciado (arXiv:2512.19687): https://arxiv.org/abs/2512.19687
