# Aalto-Speech-Synthesis/Liquid-Codec-ONNX

## Resumen

Liquid-Codec-ONNX es la exportación a ONNX Runtime del códec de voz Liquid-Codec desarrollado por Liquid AI, el códec compacto de 24 kHz que sirve de base a los modelos LFM3-Audio y LFM3-Omni. El modelo original transforma audio de voz en una secuencia discreta de 12 códigos por trama de 80 ms (12,5 Hz) y reconstruye la onda a partir de esos códigos. Esta versión, mantenida por Aalto-Speech-Synthesis, elimina la dependencia de PyTorch y de la librería transformers, permitiendo ejecutar el códec directamente sobre ONNX Runtime en CPU o GPU.

El paquete incluye cinco grafos: un codificador, dos decodificadores (offline y en streaming) y versiones FP16 de ambos decodificadores. Los grafos FP32 reproducen las funciones `encode` y `decode` del modelo original dentro del error de redondeo de float32, y los decodificadores FP16 se mantienen dentro de 0,02 dB de log-mel respecto al original. Según el autor, todos los grafos superan en velocidad a la implementación con transformers tanto en CPU como en GPU.

La relevancia de esta ficha está en el despliegue en entornos de borde y en pipelines de audio en producción: el códec en FP16 ocupa 76 MiB por decodificador y el codificador 148 MiB, con ejes de batch y longitud dinámicos y un modo de streaming con estado explícito que hace innecesario mantener buffers internos en el grafo. El repositorio pesa 0,6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Códec neuronal de audio (codificador y decodificador) basado en capas LFM3, con proyección de dequantización y salida; STFT inversa y overlap-add en FP32 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; tramas de 80 ms con 12 códigos por trama (12,5 Hz), ejes de longitud dinámicos |
| Tipos de cuantización | FP32 (codificador y decodificadores) y FP16 (solo decodificadores) |
| Idiomas soportados | en, zh, de, fr, ja, ko |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | ONNX (opset 18); sin safetensors ni GGUF |
| Frecuencia de muestreo | 24 kHz, mono |
| Tamaño de los grafos | encoder 148 MiB; decoder 145 MiB; decoder_step 145 MiB; decoder_fp16 76 MiB; decoder_step_fp16 76 MiB |
| Runtime | ONNX Runtime 1.14 o superior (probado con 1.31.1) |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo original es un códec neuronal de voz: un codificador convolucional y transformer convierte la onda de 24 kHz en una matriz de 12 códigos enteros por cada trama de 80 ms, y un decodificador reconstruye la señal a partir de esos códigos. La exportación a ONNX conserva esa estructura: el codificador produce `audio_codes` de tipo int64 con forma `[batch, 12, num_frames]`, y el decodificador devuelve `audio_values` float32 con `1920 * num_frames` muestras por lote (1920 muestras equivalen a 80 ms a 24 kHz). El decodificador incorpora una proyección de dequantización, capas LFM3 y una proyección de salida, seguidas de una STFT inversa y overlap-add que se mantienen en FP32 incluso en las variantes FP16.

La innovación principal de esta exportación es el decodificador en streaming (`decoder_step.onnx`), que no guarda estado interno: cada llamada recibe un fragmento de códigos junto con el estado actual (tensores de entrada) y devuelve el audio nuevo, los 480 samples de cierre (`final_values`) y el estado siguiente. El flujo arranca con estado todo a ceros, aplica un pre-roll de 480 muestras (20 ms) de silencio que el decodificador offline recorta, y permite tamaños de fragmento variables entre pasos. Los grafos usan opset 18, tienen ejes de batch y longitud dinámicos y llevan metadatos con el modelo fuente, la revisión, la licencia y la descripción de los cambios. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Extracción de características de audio: codificación de voz a 12,5 Hz con 12 códigos por trama, adecuada como representación discreta para modelos de audio.
- Reconstrucción de voz: decodificación offline de códigos a onda de 24 kHz con fidelidad float32 respecto al modelo original.
- Decodificación en streaming: generación incremental de audio por fragmentos con estado explícito, apta para reproducción de baja latencia.
- Procesamiento por lotes: ejes de batch dinámicos en todos los grafos.
- Ejecución sin PyTorch ni transformers: solo requiere ONNX Runtime, numpy, soundfile y huggingface_hub.
- Ejecución en CPU y GPU: proveedores `CPUExecutionProvider` y `CUDAExecutionProvider`; el proveedor CUDA admite `use_tf32=0` para mantener precisión FP32 completa.
- Cobertura multilingüe declarada: en, zh, de, fr, ja, ko.
- No incluye tool calling, razonamiento multi-paso, visión ni audio generativo: es un códec, no un modelo de lenguaje.

## Casos de uso

- Pipelines de voz en el borde: el decodificador FP16 de 76 MiB cabe en dispositivos con poca memoria y permite sintetizar voz desde códigos sin instalar PyTorch, reduciendo el peso del stack de inferencia.
- Reproducción de audio en streaming de baja latencia: `decoder_step.onnx` entrega 1920 muestras (80 ms) por paso y admite fragmentos de tamaño variable, lo que encaja en reproductores o asistentes de voz que necesitan emitir audio antes de tener la secuencia completa.
- Tokenización de audio para modelos LFM3-Audio y LFM3-Omni: el codificador genera los códigos de 12 canales que estos modelos consumen como entrada, sin depender de la implementación de transformers.
- Compresión de voz para almacenamiento y transmisión: 12 códigos por trama de 80 ms suponen una tasa de 150 códigos por segundo, útil para archivar o transmitir voz con un coste de representación muy bajo frente a la onda PCM.
- Servicios de transcripción y análisis de voz en servidor: el codificador ONNX puede integrarse en un servicio de características de audio con ONNX Runtime y ejecutarse en GPU con CUDA sin cargar el framework de PyTorch.
- Evaluación y prototipado de códecs: los grafos permiten comparar reconstrucción offline y streaming con el mismo modelo y verificar la equivalencia numérica, útil en investigación de códecs neuronales.
- Despliegue en contenedores ligeros: al no requerir PyTorch, la imagen de despliegue puede limitarse a ONNX Runtime y numpy, lo que simplifica la cadena de suministro y reduce el tamaño del artefacto.

## Benchmarks y rendimiento

El autor afirma que todos los grafos son más rápidos que la implementación con transformers tanto en CPU como en GPU, y que los grafos FP32 reproducen `encode` y `decode` dentro del redondeo de float32, mientras que los decodificadores FP16 se mantienen dentro de 0,02 dB de log-mel. No se han publicado cifras concretas de latencia, throughput ni tablas comparativas en la información disponible.

| Métrica | Resultado |
|---|---|
| Fidelidad FP32 frente al original | dentro del redondeo de float32 (sin cifra publicada) |
| Fidelidad FP16 (decodificadores) | dentro de 0,02 dB de log-mel |
| Velocidad frente a transformers | superior en CPU y GPU (sin cifras publicadas) |
| Latencia por paso en streaming | no disponible |
| Throughput | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: el codificador FP32 ocupa 148 MiB y el decodificador FP32 145 MiB; las variantes FP16 de los decodificadores ocupan 76 MiB cada una. El repositorio completo pesa 0,6 GB.
- GPU recomendadas: cualquier GPU compatible con el proveedor CUDA de ONNX Runtime (por ejemplo, A100, H100 o RTX 4090); no se publican requisitos mínimos específicos.
- GPU de consumo: por tamaño de los grafos, el códec cabe holgadamente en GPU de consumo con suficiente memoria libre, aunque no se detallan modelos concretos.
- CPU: ejecutable con `CPUExecutionProvider`; el autor indica que los grafos superan a transformers en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), con `onnxruntime` u `onnxruntime-gpu`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el streaming entrega 1920 muestras (80 ms de audio) por paso, con un pre-roll de 480 muestras (20 ms).

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Representación | Licencia | Formato |
|---|---|---|---|---|---|
| Liquid-Codec-ONNX | Códec neuronal (exportación ONNX) | 24 kHz | 12 códigos por 80 ms (12,5 Hz) | lfm1.0 | ONNX |
| LiquidAI/Liquid-Codec | Códec neuronal original | 24 kHz | 12 códigos por 80 ms (12,5 Hz) | lfm1.0 | PyTorch/transformers |
| Otros códecs neuronales de audio | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el modelo base, del que esta exportación es una versión cuantizada a ONNX. No se dispone de datos de benchmarks ni de especificaciones de códecs alternativos en la información proporcionada.

## Limitaciones y advertencias

- Solo procesa audio mono a 24 kHz; es necesario remuestrear cualquier entrada con otra frecuencia antes de codificar.
- El codificador solo está disponible en FP32, ya que sus códigos cuantizados son sensibles al redondeo; no hay versión FP16 del encoder.
- El streaming introduce un retardo algorítmico de 480 muestras (20 ms) al inicio de cada flujo, que debe descartarse o reproducirse como silencio.
- En el modo por lotes, todos los flujos comparten los tamaños de fragmento y el contador de posición.
- El proveedor CUDA de ONNX Runtime usa TF32 por defecto en productos matriciales FP32; para mantener precisión completa hay que fijar `use_tf32=0`, con posible coste de rendimiento.
- Requiere ONNX Runtime 1.14 o superior y opset 18; versiones anteriores no son compatibles.
- La licencia es lfm1.0 (etiquetada como `other`), por lo que deben revisarse las condiciones de uso comercial en el archivo LICENSE antes de desplegar en producción.
- No se han publicado datos sobre sesgos, tasas de alucinación ni comportamiento en idiomas distintos de los seis declarados.
- El repositorio no registra descargas ni likes, y su mantenimiento depende de un tercero (Aalto-Speech-Synthesis), no de Liquid AI.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento, y no debe evaluarse con benchmarks como MMLU o HumanEval.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aalto-Speech-Synthesis/Liquid-Codec-ONNX
- Modelo base: https://huggingface.co/LiquidAI/Liquid-Codec
- ONNX Runtime: https://onnxruntime.ai
- Licencia LFM1.0: https://huggingface.co/Aalto-Speech-Synthesis/Liquid-Codec-ONNX/blob/main/LICENSE
