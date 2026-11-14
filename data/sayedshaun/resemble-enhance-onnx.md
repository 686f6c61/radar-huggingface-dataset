# SayedShaun/resemble-enhance-onnx

## Resumen

Resemble Enhance (ONNX) es una exportación a formato ONNX del modelo de restauración de voz Resemble Enhance, desarrollado originalmente por Resemble AI bajo licencia MIT. Esta versión, publicada por el usuario SayedShaun, convierte las cinco redes neuronales del checkpoint oficial `enhancer_stage2` a ONNX Runtime, manteniendo la lógica de procesamiento de señal (STFT, features mel, solver de flow-matching, crossfade) implementada en numpy y Python. El objetivo es facilitar el despliegue del modelo en entornos de producción que no dispongan de PyTorch, reduciendo la dependencia de frameworks pesados.

El modelo resuelve el problema de la restauración de audio degradado: elimina ruido de fondo y mejora la calidad de grabaciones de voz, devolviendo audio mono a 44,1 kHz y 16 bits. La arquitectura subyacente combina un denoiser basado en STFT, un encoder de espectrograma mel, un modelo de flow-matching para la generación del latente, un decoder y un vocoder UnivNet. El repositorio ocupa 2,3 GB e incluye tres variantes de cuantización: fp32 (~1,4 GB), fp16 (~0,7 GB) e int8 (~0,5 GB).

La relevancia de esta ficha radica en que ofrece una alternativa ligera y portable para integrar restauración de voz en pipelines de audio sin necesidad de GPU dedicada ni de la pila completa de PyTorch. No obstante, el autor advierte explícitamente que la variante int8 degrada la calidad de forma notable (SNR de 4,5 dB frente a fp32) y recomienda fp16 cuando el tamaño lo permita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de restauración de voz: denoiser (STFT), encoder mel, flow-matching, decoder y vocoder UnivNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventanas de 2 segundos con 50% de solapamiento) |
| Tipos de cuantizacion | fp32, fp16, int8 (cuantización dinámica en cuatro redes; vocoder en fp16) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`*-float32.onnx`, `*-fp16.onnx`, `*-int8-dynamic.onnx`) |

## Arquitectura y entrenamiento

El modelo es una exportación del checkpoint `enhancer_stage2` de Resemble Enhance. La inferencia se compone de cinco redes que se ejecutan en ONNX Runtime: `denoiser-net` (predice la máscara del denoiser y el residuo de fase a partir de features de entrada), `encoder` (codifica el espectrograma mel en un latente de 64 canales), `flow-step` (evalúa el campo de velocidad del flow-matching), `decoder` (descodifica la salida del flow) y `vocoder` (UnivNet, que genera una ventana de 1 segundo de waveform a 44,1 kHz). El procesamiento de señal (STFT, filtros mel, solución del flow-matching, crossfade de Hann) se implementa en numpy.

La exportación se realizó con `torch.onnx.export` (opset 17; el vocoder usa el exportador dynamo en opset 18). Antes de exportar se aplicaron reescrituras equivalentes a la versión LiteRT: zero-stuffing para convoluciones transpuestas, concatenación en los bordes para padding replicate, una multiplicación matricial batcheada para la convolución de ubicación variable, padding numérico en lugar de `"same"` y límites float planos en la activación. La STFT del denoiser y las estadísticas del encoder se calculan en numpy, fuera de las redes, porque su exportación rompía el grafo. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO, ya que esta ficha se limita a la exportación ONNX.

## Capacidades

- Restauración de voz: eliminación de ruido de fondo y mejora de la calidad de grabaciones degradadas.
- Salida de audio mono a 44,1 kHz y 16 bits en formato WAV.
- Procesamiento por ventanas de 2 segundos con 50% de solapamiento y crossfade de Hann.
- Inferencia determinista: la semilla de ruido de cada ventana es fija, por lo que la misma entrada produce la misma salida.
- Ejecución en CPU mediante ONNX Runtime y numpy, sin necesidad de PyTorch ni de GPU.
- Tres variantes de precisión (fp32, fp16, int8) para adaptar el equilibrio entre tamaño y calidad.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de audio.
- No dispone de capacidades multilingües ni de visión; su ámbito es exclusivamente la señal de voz.

## Casos de uso

- Limpieza de grabaciones de entrevistas o podcasts: el modelo elimina ruido de fondo y artefactos de compresión en ventanas de 2 segundos, adecuado para material de voz hablada de larga duración procesado por lotes en CPU.
- Restauración de archivos históricos de audio: grabaciones antiguas o de baja calidad pueden mejorarse antes de su digitalización y archivo, usando la variante fp16 para preservar calidad con un tamaño manejable (~0,7 GB).
- Preprocesado en pipelines de ASR (reconocimiento automático del habla): la mejora de la señal antes de la transcripción puede reducir errores en entornos ruidosos, integrándose como paso previo en ONNX Runtime.
- Atención al cliente y centros de llamadas: limpieza de grabaciones de llamadas para análisis de calidad, transcripción o cumplimiento normativo, desplegable en servidores sin GPU.
- Edición de vídeo y doblaje: mejora de pistas de voz grabadas en condiciones subóptimas antes de la mezcla final, con salida WAV de 44,1 kHz lista para postproducción.
- Aplicaciones de accesibilidad: mejora de audio en tiempo casi real para personas con dificultades auditivas, procesando ventanas de 2 segundos con solapamiento para evitar cortes audibles.
- Despliegue en dispositivos edge: la variante int8 (~0,5 GB) permite ejecutar el modelo en entornos con recursos limitados, aunque el autor advierte que debe escucharse la salida antes de confiar en ella.

## Benchmarks y rendimiento

El autor proporciona métricas de fidelidad de la exportación frente a PyTorch y de la pipeline completa frente a fp32 sobre un clip de voz de 11 segundos (JFK, 44,1 kHz):

| Comparación | SNR de waveform | Distancia log-espectral |
|---|---|---|
| fp32 ONNX vs PyTorch (redes individuales, entradas aleatorias) | diferencia máxima 5,6e-4 (denoiser); ~1e-6 a 5e-6 en las demás | no disponible |
| fp16 vs fp32 (pipeline completa) | 27,3 dB | 0,061 (≈ 0,6 dB) |
| int8 vs fp32 (pipeline completa) | 4,5 dB | 0,26 (≈ 2,6 dB) |

El autor señala que la SNR de waveform es estricta para un vocoder generativo, ya que un pequeño cambio en el condicionamiento puede desplazar la fase y reducir la SNR aunque el sonido siga siendo similar. En habla real, las diferencias por red son mayores que con entradas aleatorias: el denoiser int8 difiere de fp32 en aproximadamente un 50% respecto a su valor máximo, y las diferencias se amplifican a través de los 16 pasos del flow hasta el vocoder. No se han publicado resultados de benchmarks objetivos (MOS, PESQ, STOI) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutarse en ONNX Runtime puede correr en CPU. La variante fp32 ocupa ~1,4 GB en disco, fp16 ~0,7 GB e int8 ~0,5 GB.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime y numpy.
- Compatibilidad con GPU de consumo: no confirmada; al no requerir PyTorch ni CUDA, puede ejecutarse en CPU, aunque no se especifican requisitos de VRAM para aceleración por GPU.
- Opciones de despliegue: ONNX Runtime (con numpy, scipy, soundfile y huggingface_hub). El script `inference.py` acepta el parámetro `--dtype` para seleccionar fp16, fp32 o int8.
- Latencia y throughput: no disponibles. El procesamiento se realiza en ventanas de 2 segundos con 50% de solapamiento, pero no se proporcionan tiempos de ejecución por ventana ni por minuto de audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Resemble Enhance (ONNX, este repo) | no disponible | ventanas de 2 s, salida 44,1 kHz | MIT | ONNX (fp32, fp16, int8) | Hugging Face (SayedShaun) |
| Resemble Enhance (original, PyTorch) | no disponible | ventanas de 2 s, salida 44,1 kHz | MIT | PyTorch (checkpoint) | Hugging Face (ResembleAI) |
| Resemble Enhance LiteRT | no disponible | ventanas de 2 s, salida 44,1 kHz | MIT | LiteRT | Hugging Face (SayedShaun) |
| Otros modelos de restauración de voz | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo original, ya que no se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada. La diferencia principal entre ellas es el formato de despliegue (ONNX frente a PyTorch o LiteRT) y las variantes de cuantización disponibles.

## Limitaciones y advertencias

- La variante int8 presenta una degradación notable de calidad (SNR de 4,5 dB frente a fp32 y distancia log-espectral de 0,26). El autor recomienda escuchar las salidas antes de confiar en ella y usar fp16 cuando el tamaño lo permita.
- Las diferencias por red en habla real son mayores que con entradas aleatorias; el denoiser int8 difiere en ~50% respecto a fp32 y el error se amplifica a través de los 16 pasos del flow.
- El modelo está diseñado para voz; no se especifica su comportamiento con música u otros tipos de audio.
- No se dispone de información sobre sesgos, ya que es un modelo de señal de audio y no de texto.
- Riesgo de artefactos o alucinaciones auditivas: al ser un modelo generativo con vocoder, puede introducir componentes espectrales no presentes en la señal original, especialmente en las variantes de menor precisión.
- La licencia MIT permite uso comercial, pero se debe mantener la atribución a Resemble AI (Copyright 2023) y a la exportación ONNX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia.
- No se especifican requisitos mínimos de CPU ni tiempos de procesamiento, lo que dificulta planificar despliegues en producción.
- El modelo no soporta tool calling, agentes ni razonamiento; su uso está acotado a la restauración de audio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SayedShaun/resemble-enhance-onnx
- Modelo base en Hugging Face: https://huggingface.co/ResembleAI/resemble-enhance
- Repositorio GitHub de Resemble Enhance: https://github.com/resemble-ai/resemble-enhance
- Versión LiteRT del mismo modelo: https://huggingface.co/SayedShaun/resemble-enhance-litert
