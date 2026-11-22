# codebucketsolutions/sepformer-dns4-16k-enhancement-onnx

## Resumen

SepFormer DNS4 enhancement (ONNX) es una exportación a formato ONNX del modelo `speechbrain/sepformer-dns4-16k-enhancement` de SpeechBrain, publicada por el usuario `codebucketsolutions` para su uso en el servidor de voz [bolo](https://github.com/cB-Sigma/bolo-speech) sin depender de PyTorch. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son idénticos a los del modelo original; únicamente cambia el formato de serialización (ONNX, opset 17, float32) para permitir inferencia con ONNX Runtime.

El modelo resuelve la tarea de *speech enhancement* (supresión de ruido), es decir, separa la voz limpia de una mezcla mono a 16 kHz. SepFormer es una arquitectura basada en transformers con mecanismo de atención multi-cabezal sobre segmentos (*attention over chunks*), diseñada originalmente para separación de fuentes, y aquí adaptada al conjunto de datos del desafío DNS4 (Deep Noise Suppression, ICASSP 2022). El repositorio ocupa 0,1 GB y contiene el grafo ONNX, un fichero de metadatos (`speechbrain_onnx.json`) y el script de exportación.

Su relevancia es práctica: permite integrar un modelo de SpeechBrain en pipelines de producción basados en ONNX Runtime (C++, Rust, Python sin PyTorch, etc.), lo que reduce el tamaño del *runtime* y facilita el despliegue en entornos donde instalar PyTorch no es viable. La contrapartida es que es una exportación no oficial, con 0 descargas y 1 *like* en el momento de la consulta, y sin garantías de mantenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SepFormer (transformer con atención sobre segmentos) para separación/enhancement de audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada mono float32 `[1, T]` a 16 kHz, sin límite fijo pero con memoria que crece con la longitud |
| Tipos de cuantizacion | float32 (el autor lo etiqueta como `base_model:quantized`, pero el grafo es float32; no se documentan otras precisiones) |
| Idiomas soportados | no disponible (modelo de audio; el entrenamiento DNS4 es mayoritariamente inglés, pero no se declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, float32); fichero `sepformer.onnx` |

## Arquitectura y entrenamiento

El grafo ONNX contiene el codificador, la red de enmascaramiento y el decodificador de `SepformerSeparation.separate_batch` de SpeechBrain. La entrada es una señal mono float32 de forma `[1, T]` a 16 kHz; la salida es `sources` de forma `[1, 8 * ((T - 16) // 8) + 16, 1]`, es decir, una pista de audio con la misma estructura de *strides* de 8 muestras que el modelo original. El codificador procesa bloques de 8 muestras y las pistas pueden rellenarse con ceros hasta la longitud de la entrada.

El entrenamiento original lo realizó el equipo de SpeechBrain sobre los datos del desafío DNS4 (ICASSP 2022), aproximadamente 1300 horas a 16 kHz cedidas por Microsoft (CC BY 4.0, con partes sujetas a las licencias de sus fuentes). SepFormer se entrenó con una pérdida invariante a la escala (*scale-invariant loss*), lo que implica que el nivel absoluto de la salida es arbitrario y debe normalizarse aguas abajo si se necesita un nivel concreto. La exportación a ONNX se validó contra SpeechBrain 1.1.2 (torch 2.15.0+cpu) y ONNX Runtime 1.32.0 en CPU, con resultados de paridad documentados en `parity.json`.

## Capacidades

- Supresión de ruido y enhancement de voz en audio mono a 16 kHz.
- Separación de fuentes en el sentido original de SepFormer (el grafo produce pistas separadas; en la práctica se usa la pista de voz mejorada).
- Inferencia sin PyTorch mediante ONNX Runtime (opset 17, float32).
- Procesamiento por ventanas: admite grabaciones largas dividiéndolas en segmentos.
- No incluye *tool calling*, agentes, razonamiento multi-paso ni capacidades de texto.
- No incluye detección de actividad de voz, diarización ni transcripción.
- No se documentan capacidades multilingües explícitas.

## Casos de uso

- **Preprocesado para ASR en producción**: limpiar el audio de entrada antes de pasarlo a un sistema de reconocimiento de voz; el modelo reduce ruido de fondo y mejora la señal, y al ser ONNX se puede encadenar con el motor ASR en el mismo proceso sin PyTorch.
- **Llamadas VoIP y atención al cliente**: aplicar enhancement en tiempo casi real sobre flujos de audio de 16 kHz, procesando en ventanas para acotar la memoria y manteniendo la latencia controlada.
- **Grabación de reuniones y podcasts**: eliminar ruido estacionario (ventiladores, tráfico, teclado) de grabaciones largas dividiéndolas en segmentos de pocos segundos, dado que el consumo de memoria crece con la longitud.
- **Despliegue en dispositivos de borde o servidores ligeros**: usar ONNX Runtime en C++, Rust o Python sin PyTorch para reducir el tamaño del *runtime* y las dependencias del contenedor.
- **Pipelines de datos para entrenamiento de modelos de voz**: limpiar corpus ruidosos antes de usarlos para *fine-tuning* de ASR o TTS, con la ventaja de que el modelo es determinista y de licencia Apache-2.0.
- **Integración en el servidor de voz bolo**: el propio autor lo publica para que `bolo-speech` ejecute el enhancement sin PyTorch, lo que sirve como referencia de integración para otros servidores.
- **Prototipado rápido de enhancement**: al ser un único fichero ONNX de 0,1 GB, se puede cargar en un script de validación en minutos para comparar calidad frente a alternativas.

## Benchmarks y rendimiento

El autor documenta la paridad entre el grafo ONNX y el original en PyTorch (SpeechBrain 1.1.2, ONNX Runtime 1.32.0, CPU). La tabla siguiente recoge los datos de `parity.json`:

| Entrada | Diferencia absoluta máxima | SI-SNR mínimo de ONNX frente a PyTorch por pista |
|---|---|---|
| ruido, 8003 muestras | 4,43e-02 | 68,9 dB |
| ruido, 3008 muestras | 2,73e-03 | 74,2 dB |
| ruido, 48000 muestras | 2,33e-01 | 52,2 dB |
| ruido, 112005 muestras | 6,39e-01 | 51,7 dB |
| en-long | 5,11e-02 | 80,2 dB |
| en-short | 4,34e-02 | 81,5 dB |
| hi-short | 1,14e-02 | 89,7 dB |
| en-long + ruido blanco a 5 dB SNR | 8,78e-01 | 63,2 dB |
| en-short + ruido blanco a 5 dB SNR | 2,88e-02 | 82,9 dB |
| hi-short + ruido blanco a 5 dB SNR | 5,63e-02 | 75,7 dB |

Además, SpeechBrain reporta para el modelo original en el conjunto de desarrollo *baseline* de DNS4 2022: DNSMOS SIG 2,999, BAK 3,076 y OVRL 2,437. No se han publicado en la información disponible resultados de benchmarks estándar de separación (SDR, SI-SNRi) sobre otros conjuntos.

## Requisitos de hardware

- **VRAM/RAM**: el grafo es float32 y su memoria crece con la longitud de la entrada; el autor advierte de varios GB para un minuto de audio, por lo que se recomienda procesar por ventanas de pocos segundos.
- **GPU recomendadas**: no se especifican; al ser un modelo pequeño (repo de 0,1 GB) cabe en GPU de consumo como RTX 3060, RTX 4090 o superiores, aunque la validación documentada es en CPU.
- **Consumer GPU**: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM si se procesa por ventanas; no hay cifras oficiales.
- **Opciones de despliegue**: ONNX Runtime (CPU o GPU), integración en el servidor bolo, o cualquier *runtime* compatible con ONNX opset 17. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de audio).
- **Latencia y throughput**: no disponibles; la única referencia es la ejecución en CPU con ONNX Runtime 1.32.0 durante las pruebas de paridad, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `codebucketsolutions/sepformer-dns4-16k-enhancement-onnx` (este) | SepFormer DNS4, exportación ONNX | audio mono 16 kHz, longitud variable | Apache-2.0 | ONNX | Hugging Face, 0 descargas, 1 like |
| `speechbrain/sepformer-dns4-16k-enhancement` | SepFormer DNS4 original | audio mono 16 kHz, longitud variable | Apache-2.0 | PyTorch (SpeechBrain) | Hugging Face, modelo oficial de SpeechBrain |
| `speechbrain/sepformer-whamr16k` | SepFormer para separación con reverberación | audio mono 16 kHz | Apache-2.0 | PyTorch (SpeechBrain) | Hugging Face, modelo oficial |
| `speechbrain/metricgan-plus-voicebank` | MetricGAN+ para enhancement | audio mono 16 kHz | Apache-2.0 | PyTorch (SpeechBrain) | Hugging Face, modelo oficial |

La comparación directa de rendimiento entre estos modelos no está disponible en la información proporcionada; solo se conocen las métricas DNSMOS del modelo original frente al conjunto de desarrollo de DNS4 2022.

## Limitaciones y advertencias

- **Exportación no oficial**: el autor indica explícitamente que no es un lanzamiento de SpeechBrain; no hay garantía de mantenimiento ni de soporte.
- **Nivel de salida arbitrario**: la pérdida invariante a la escala implica que la amplitud de la salida no es la de la entrada; hay que normalizar si se necesita un nivel concreto.
- **Memoria creciente con la longitud**: el propio autor advierte de varios GB para un minuto de audio; es obligatorio procesar por ventanas.
- **Rendimiento degradado en entradas largas**: la diferencia máxima absoluta frente a PyTorch crece con la longitud (hasta 6,39e-01 en 112005 muestras), aunque el SI-SNR se mantiene por encima de 51 dB.
- **Idiomas no declarados**: no se especifica lista de idiomas; el entrenamiento DNS4 es mayoritariamente en inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- **Sin benchmarks estándar publicados**: no hay cifras de SDR o SI-SNRi sobre conjuntos de evaluación independientes en la información disponible.
- **Riesgo de artefactos**: como todo modelo de enhancement, puede introducir distorsión o eliminar componentes de la voz en condiciones de ruido no vistas durante el entrenamiento.
- **Licencia Apache-2.0**: permite uso comercial, pero los datos de entrenamiento DNS4 tienen condiciones propias (CC BY 4.0 y licencias de sus fuentes) que conviene revisar.
- **Sin garantías de calidad en producción**: con 0 descargas y 1 like, no hay evidencia de uso real más allá de las pruebas de paridad del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/sepformer-dns4-16k-enhancement-onnx
- Modelo base original: https://huggingface.co/speechbrain/sepformer-dns4-16k-enhancement
- Repositorio del servidor bolo: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- Desafío DNS4 (ICASSP 2022): no disponible en la información proporcionada
