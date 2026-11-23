# moonbox-dev/resemble-enhance-TensorRT

## Resumen

Resemble Enhance TensorRT es una compilación optimizada del denoiser de Resemble Enhance, un sistema de mejora de voz desarrollado por Resemble AI. La versión que nos ocupa, publicada por moonbox-dev, convierte el grafo ONNX del modelo original en motores TensorRT para GPUs NVIDIA RTX, eliminando la dependencia de PyTorch en el bucle de inferencia y reduciendo el tiempo de proceso de forma significativa. El modelo resuelve el problema de la eliminación de ruido en grabaciones de voz a 44,1 kHz, una tarea crítica en producción de audio, transcripción automática y comunicaciones.

La arquitectura subyacente es una UNet que opera sobre una representación espectral STFT de 1680 puntos, con entradas de magnitud y fase (coseno y seno) y salidas equivalentes ya denoised. El motor incluido implementa únicamente el modo denoise; el modo enhance completo, que añade un decodificador IRMAE y un vocoder UnivNet, requiere aproximadamente 12 GB de memoria para su construcción en TensorRT y no se incluye en este repositorio. El paquete pesa 0,1 GB y se distribuye bajo licencia MIT, lo que facilita su integración comercial.

La relevancia actual de esta ficha radica en que ofrece una vía de despliegue de baja latencia (RTF de 0,030 frente a 0,052 del build ONNX) con compatibilidad garantizada en GPUs Ampere y posteriores (RTX 30, 40 y 50) y en cualquier TensorRT 10.x desde la versión 10.13, sin necesidad de recompilar el motor para cada modelo de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet sobre STFT de 1680 puntos (denoiser); el modelo original incluye ademas decodificador IRMAE y vocoder UnivNet para el modo enhance |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; acepta ventanas de 1 a 3000 frames STFT (hasta 28 s a 44,1 kHz), multiplo de 16 |
| Tipos de cuantizacion | fp16 (pesos almacenados en fp16, leidos como fp32; el computo es fp32) |
| Idiomas soportados | no disponible (procesamiento de audio independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | TensorRT engine (`.engine`) con runner en Python (numpy + Polygraphy); el modelo base esta en PyTorch/ONNX |

## Arquitectura y entrenamiento

El denoiser es una red UNet que trabaja en el dominio espectral. La entrada son tres tensores de forma [1, 841, T]: magnitud, coseno y seno de la fase, donde T es el numero de frames STFT (de 1 a 3000, multiplo de 16). La red produce la magnitud y fase de la senal limpia, que el pipeline reconstruye mediante STFT inversa. El motor TensorRT se construye a partir del grafo ONNX fp16 publicado por Moonbox, con tipado fuerte: cada tensor conserva la precision que le asigna el grafo ONNX, de modo que el motor fp16 calcula lo mismo que el build ONNX fp16. Los casts se pliegan en pesos fp32, por lo que la aritmetica efectiva es fp32.

El entrenamiento original de Resemble Enhance se realizo sobre datos de voz de alta calidad a 44,1 kHz, según indica la model card del modelo base. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un modelo de audio y no de lenguaje. La innovacion tecnica de esta version es la compilacion TensorRT con compatibilidad hardware (Ampere y posteriores) y de version (TensorRT 10.x desde 10.13), que evita recompilaciones por GPU a costa de una ligera perdida de velocidad frente a un motor compilado para un solo modelo.

## Capacidades

- Eliminacion de ruido en voz a 44,1 kHz (modo denoise): separa la voz del ruido de fondo y devuelve audio limpio.
- Procesamiento por ventanas de hasta 28 segundos por inferencia (3000 frames STFT), con padding gestionado por el pipeline.
- Inferencia sin PyTorch en el motor: solo requiere TensorRT, Polygraphy y numpy; el STFT y el remuestreo se ejecutan en CPU con torch/torchaudio.
- Ejecucion en GPUs NVIDIA Ampere y posteriores (RTX 30, 40 y 50) sin recompilacion.
- No incluye el modo enhance (restauracion de distorsiones y extension de ancho de banda); para ello debe usarse el build ONNX del modelo base.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo puramente de audio-audio.

## Casos de uso

- Limpieza de grabaciones de podcast y entrevistas: el modelo elimina ruido de fondo estacionario y no estacionario en voz a 44,1 kHz, adecuado para publicacion directa tras el proceso.
- Preprocesado para transcripcion automatica: reducir el ruido antes de enviar el audio a un ASR mejora la precision en entornos ruidosos; el RTF de 0,030 permite procesar en tiempo casi real.
- Atencion al cliente y call centers: limpieza de grabaciones de llamadas para auditoria, analitica y cumplimiento, con inferencia por lotes sobre GPUs RTX.
- Produccion audiovisual: eliminacion de ruido en localizaciones con malas condiciones acusticas antes de la mezcla final.
- Videollamadas y comunicaciones en tiempo real: el bajo coste computacional (RTF 0,030 en una RTX 3080 Laptop) hace viable el procesado por fragmentos de audio en streaming.
- Archivado y restauracion de material historico: mejora de inteligibilidad en grabaciones antiguas con ruido de cinta o ambiente.
- Investigacion en mejora de voz: base reproducible para comparar pipelines TensorRT frente a ONNX y PyTorch con las mismas metricas (PESQ, STOI, SI-SDR).

## Benchmarks y rendimiento

Los datos proceden de la model card del autor, evaluados sobre VoiceBank-DEMAND (824 archivos) en modo denoise con una RTX 3080 Laptop GPU.

| Modelo | PESQ | STOI | SI-SDR (dB) | vs ONNX: media / peor archivo (dB) | RTF |
|---|---|---|---|---|---|
| ONNX fp16 (CUDA) | 2,823 | 0,9472 | 12,42 | - | 0,052 |
| TensorRT fp16 | 2,823 | 0,9472 | 12,42 | 80,3 / 59,5 | 0,030 |
| Original (resemble-enhance 0.0.1, PyTorch, CUDA) | 2,823 | 0,9472 | 12,42 | - | no disponible |

El criterio de aceptacion del autor exige que ningun archivo quede mas de 0,5 dB de SI-SDR por debajo del build ONNX; el peor archivo registra -0,022 dB. El RTF corresponde al pipeline completo, con STFT y remuestreo en CPU.

## Requisitos de hardware

- VRAM estimada: el motor ocupa 134,5 MB; el pipeline completo requiere ademas memoria para STFT y buffers, sin cifra publicada. El autor indica que construir el modo enhance en TensorRT necesita unos 12 GB, pero el motor denoise incluido es mucho mas ligero.
- GPUs recomendadas: cualquier NVIDIA Ampere o posterior (RTX 30, 40 y 50 series). El benchmark se realizo en una RTX 3080 Laptop.
- Cabe en GPU consumer: si, en RTX 30/40/50; no se garantiza en arquitecturas anteriores (Turing o inferior) por la compatibilidad hardware del motor.
- Despliegue: runtime de TensorRT (`tensorrt-cu12>=10.13,<11`, `tensorrt-lean-cu12>=10.13,<11`), Polygraphy y numpy; el pipeline usa torch/torchaudio en CPU. No se soportan vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: RTF de 0,030 en RTX 3080 Laptop (unas 33 veces mas rapido que tiempo real) frente a 0,052 del build ONNX.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| resemble-enhance-TensorRT (este) | Denoiser UNet | 44,1 kHz | MIT | TensorRT engine | Solo modo denoise; RTF 0,030 |
| ResembleAI/resemble-enhance (original) | Denoiser + enhancer | 44,1 kHz | MIT | PyTorch | Incluye modo enhance; RTF no disponible |
| Build ONNX de Moonbox | Denoiser UNet | 44,1 kHz | MIT | ONNX | Mismas metricas de calidad; RTF 0,052 |

No se dispone en la informacion proporcionada de comparativas con otros modelos de mejora de voz (por ejemplo, DEMUCS o DeepFilterNet); no disponible.

## Limitaciones y advertencias

- Solo implementa el modo denoise; el modo enhance (IRMAE + UnivNet) no esta incluido y debe usarse el build ONNX.
- La compatibilidad se limita a GPUs Ampere y posteriores y a TensorRT 10.x desde 10.13; no funciona en hardware anterior sin recompilar.
- El motor esta compilado con compatibilidad hardware, lo que implica una ligera perdida de velocidad frente a un motor especifico por GPU.
- El modelo base esta entrenado sobre voz a 44,1 kHz; el rendimiento en otras frecuencias de muestreo depende del remuestreo del pipeline y no esta documentado.
- No se documentan sesgos especificos, pero al ser un modelo de voz puede comportarse de forma desigual segun idioma, acento o calidad de grabacion; no hay evaluacion publicada al respecto.
- Riesgo de artefactos o sobre-suavizado en grabaciones con ruido muy no estacionario o voz musical; no hay metricas publicadas fuera de VoiceBank-DEMAND.
- Licencia MIT: permite uso comercial, pero el autor recuerda que los archivos son derivados del modelo original y heredan su licencia, que gobierna su uso.
- Las fechas de creacion y actualizacion del repositorio (2026) y el contador de descargas (0) indican un modelo muy reciente y sin validacion comunitaria; conviene verificar los hashes sha256 antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/resemble-enhance-TensorRT
- Modelo base: https://huggingface.co/ResembleAI/resemble-enhance
- Revision del modelo base usada: `4e3510ce4a`
- Documentacion de TensorRT: https://docs.nvidia.com/deeplearning/tensorrt/
- Polygraphy: https://github.com/NVIDIA/TensorRT/tree/main/tools/Polygraphy
