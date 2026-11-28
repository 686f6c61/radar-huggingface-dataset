# Harsha001/Underdog-Bark-3.0-XDNA2

## Resumen

Underdog-Bark-3.0-XDNA2 es una adaptación del modelo de reconocimiento automático del habla (ASR) ConwayResearch/Underdog-Bark-3.0, a su vez derivado de NVIDIA Parakeet TDT 0.6B v3 y de parakeet-ultra de Moondream, empaquetada por el usuario Harsha001 para ejecutar el codificador en la NPU XDNA2 de los procesadores AMD Ryzen AI 300 y Ryzen AI MAX (arquitecturas Strix Point y Strix Halo) bajo Windows ML. El modelo realiza transcripción de voz en inglés y su interés radica en que demuestra el despliegue de un encoder Conformer sobre una NPU de PC de consumo sin necesidad de SDK propietario ni PyTorch.

La arquitectura sigue el esquema de Parakeet TDT: un encoder Conformer (submuestreo, 24 bloques y proyección) que se exporta como grafo ONNX estático por longitud de entrada (10, 20 y 36 segundos) y que el compilador de la NPU convierte a BF16, junto con un decodificador TDT ligero (dos capas LSTM y red conjunta) y búsqueda greedy que se ejecutan en CPU con NumPy. El repositorio pesa 0,2 GB porque incluye el archivo empaquetado `model.bark` de 163 MB, que en el primer arranque se descomprime en pesos de encoder de 2,44 GB.

La relevancia actual es doble: por un lado, ofrece una vía práctica de transcripción siempre activa y en segundo plano que libera CPU y GPU; por otro, publica mediciones honestas que muestran que, para un único flujo, la CPU de 16 núcleos es más rápida que la NPU (43x frente a 18-27x tiempo real), de modo que el valor de la NPU está en el consumo y en la descarga de trabajo, no en la latencia bruta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer (submuestreo + 24 bloques + proyeccion) con decodificador TDT (2 LSTM + red conjunta) y busqueda greedy; encoder exportado a ONNX estatico |
| Parametros totales | no disponible (el modelo base Parakeet TDT 0.6B v3 sugiere ~0,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 10 s, 20 s y 36 s; audio mas largo se trocea en fragmentos de hasta 36 s |
| Tipos de cuantizacion | BF16 en la NPU (encoder); FP32 en CPU; pesos empaquetados en `model.bark` |
| Idiomas soportados | ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (opset 18) para el encoder, `model.bark` empaquetado, `decoder_weights.npz`, `encoder.weights` |
| Tamano del repositorio | 0,2 GB (descarga ~170 MB) |
| Pesos del encoder descomprimidos | 2,44 GB |
| Vocabulario | 8.192 piezas con 5 duraciones TDT |
| Filtro mel | 128 bandas |
| Runtime | onnxruntime + Windows ML (proveedor NPU descargado automaticamente) |
| Plataforma | Windows 11, AMD Ryzen AI 300 / AI MAX, Python 3.12 |

## Arquitectura y entrenamiento

El modelo es una adaptación de inferencia, no un entrenamiento nuevo: reutiliza los pesos de ConwayResearch/Underdog-Bark-3.0 (revision `85db2ad`) sin modificar y los reorganiza para su ejecución en NPU. El encoder se divide en tres grafos ONNX de forma estática según la duración de entrada, y el compilador de la NPU los convierte a BF16. La extracción de características (banco de filtros mel de 128 bandas), el decodificador TDT de dos capas LSTM, la red conjunta y la búsqueda greedy se ejecutan en CPU con NumPy puro, sin PyTorch.

El pipeline reproduce el comportamiento de los runtimes originales de Bark: inserta 0,25 s de silencio al inicio de cada grabación y corta el audio largo en fragmentos de hasta 36 s en el punto más silencioso cercano a cada corte. La integridad de los pesos se verifica mediante SHA-256 tras la descompresión. No se documentan en la información disponible los datos de entrenamiento originales, el número de tokens, la composición del corpus ni si hubo RLHF o DPO; esos detalles corresponden al modelo base de Conway Research y NVIDIA, no a esta adaptación.

## Capacidades

- Reconocimiento automático del habla en inglés (ASR) con salida de texto a partir de audio mono o estéreo a cualquier frecuencia de muestreo.
- Ejecución del encoder en la NPU XDNA2 mediante Windows ML, sin cuenta de AMD, sin Ryzen AI SDK y sin PyTorch.
- Procesamiento de audio largo mediante troceado automático en fragmentos de hasta 36 s con corte en el punto más silencioso.
- Decodificación TDT con búsqueda greedy sobre un vocabulario de 8.192 piezas y 5 duraciones.
- Fallback a CPU (`--device cpu`) para equipos sin NPU compatible.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni otras modalidades distintas de la transcripción.

## Casos de uso

- Dictado siempre activo en portátiles Ryzen AI: el modelo puede mantenerse transcribiendo en segundo plano sobre la NPU mientras la CPU y la GPU quedan libres para el resto de aplicaciones, que es precisamente el escenario para el que se diseñó esta adaptación.
- Transcripción de reuniones y notas de voz: con fragmentos de hasta 36 s y troceado automático en silencios, puede procesar grabaciones largas de forma desatendida en un equipo de sobremesa o portátil con Strix Halo.
- Subtitulado por lotes de material en inglés: el rendimiento de 43x tiempo real en CPU de 16 núcleos permite procesar horas de audio en minutos cuando la latencia no es crítica.
- Accesibilidad y entrada por voz en aplicaciones de escritorio Windows: la integración vía `pip install` y Windows ML facilita empaquetar la transcripción dentro de una aplicación sin distribuir toolchains de AMD.
- Transcripción en el borde (edge) con bajo consumo: al ejecutarse en NPU y no requerir conexión, encaja en escenarios de privacidad donde el audio no debe salir del dispositivo.
- Evaluación e investigación de despliegue en NPU: los scripts de `build/` y las mediciones publicadas sirven como referencia reproducible para comparar NPU frente a CPU en cargas ASR.

## Benchmarks y rendimiento

Precisión sobre LibriSpeech (Open ASR Leaderboard, todas las locuciones: 2.620 en test-clean y 2.939 en test-other; WER de corpus, menor es mejor):

| Configuracion | test-clean | test-other |
|---|--:|--:|
| Este repo, encoder en NPU (BF16) | 2,31 % | 4,60 % |
| Mismo pipeline, precision completa en CPU | 2,31 % | 4,63 % |
| Cifras publicadas por Conway Research para Bark 3.0 | 1,89 % | 4,08 % |

Velocidad del encoder en un Ryzen AI MAX+ 395 (Strix Halo, NPU XDNA2 de 50 TOPS, 16 nucleos Zen 5), en regimen estable:

| Ventana | NPU (BF16) | CPU 16 nucleos (FP32, ONNX Runtime) |
|---|--:|--:|
| 10 s | 473 ms (21x tiempo real) | 243 ms (41x tiempo real) |
| 20 s | 751 ms (27x tiempo real) | 463 ms (43x tiempo real) |
| 36 s | 2.028 ms (18x tiempo real) | 834 ms (43x tiempo real) |

De extremo a extremo (caracteristicas, encoder, decodificador y busqueda) sobre los conjuntos completos, el runtime liberado alcanzo aproximadamente 11x tiempo real en la NPU. El propio autor señala que la CPU es más rápida para un único flujo y que el valor de la NPU reside en liberar CPU y GPU y en un menor consumo (no medido).

## Requisitos de hardware

- NPU XDNA2 de AMD Ryzen AI 300 o Ryzen AI MAX (Strix Point o Strix Halo), con controlador de NPU actualizado, sobre Windows 11.
- Python 3.12 y `onnxruntime` con Windows ML; el proveedor de ejecución de la NPU se descarga automáticamente.
- Espacio en disco: ~170 MB de descarga, más 2,44 GB de pesos de encoder descomprimidos, ~70 MB de decodificador y ~0,8 GB por cada encoder compilado en `npu_cache/` (tres longitudes).
- Tiempo de preparación: unos 2,5 horas con `--prepare` para descomprimir y compilar las tres longitudes; sin ese paso, ~1 minuto de descompresión y ~45 minutos por cada longitud la primera vez que aparece audio de ese tamaño en un Ryzen AI MAX+ 395.
- Modo CPU alternativo (`--device cpu`) con ONNX Runtime FP32; no se documentan requisitos mínimos de CPU ni de VRAM.
- No se especifican GPU recomendadas (A100, H100, RTX 4090) ni soporte de vLLM, llama.cpp, Ollama o TGI; el despliegue previsto es el runtime propio `bark_xdna2.py` sobre ONNX Runtime y Windows ML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | WER LibriSpeech test-clean / test-other | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Underdog-Bark-3.0-XDNA2 (este) | no disponible (~0,6B por el base) | 10/20/36 s por fragmento | 2,31 % / 4,60 % (NPU BF16) | cc-by-4.0 | Hugging Face, runtime propio para NPU AMD |
| ConwayResearch/Underdog-Bark-3.0 | no disponible | no disponible | 1,89 % / 4,08 % (cifras del autor) | no disponible en la informacion | Hugging Face |
| NVIDIA Parakeet TDT 0.6B v3 | ~0,6B | no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face (NVIDIA) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos base en la información proporcionada, por lo que la comparación se limita a los datos publicados en esta model card.

## Limitaciones y advertencias

- Solo reconoce inglés; no hay soporte multilingüe.
- La precisión publicada por el autor es entre 0,4 y 0,5 puntos peor que las cifras de Conway Research, atribuido a diferencias en la configuración de evaluación; deben compararse filas medidas con los mismos scripts.
- El modelo base puede presentar sesgos y alucinaciones propios de un ASR entrenado con corpus no documentado en esta ficha; no se detallan sesgos conocidos.
- Requiere hardware muy específico (NPU XDNA2 de AMD) y Windows 11; fuera de esa plataforma solo queda el modo CPU, que el autor describe como más rápido en un solo flujo.
- La compilación inicial de los encoders es lenta (~45 minutos por longitud) y genera cachés de ~0,8 GB cada una.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base de Conway Research y de NVIDIA Parakeet, no detalladas aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La model card incluye un aviso promocional sobre otro modelo (DeepSeek-V4.1-Flash) ajeno a esta ficha; no debe interpretarse como parte de las capacidades de este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/Underdog-Bark-3.0-XDNA2
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Moondream parakeet-ultra: https://huggingface.co/moondream/parakeet-ultra
- Conjunto de datos de evaluación: https://huggingface.co/datasets/hf-audio/esb-datasets-test-only-sorted
- Modelo promocionado en la model card: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
