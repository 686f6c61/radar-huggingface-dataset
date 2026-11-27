# pelikrapael/audio-cnn-elderly-emotion-recognition

## Resumen

`audio-cnn-elderly-emotion-recognition` es un clasificador de emociones a partir de voz (Speech Emotion Recognition, SER) especializado en población mayor de 60 años. Lo desarrolla Felix Rafael como parte de su tesis de grado en el Departamento de Informática de la Universidad Gunadarma (2025), bajo la supervisión del Dr. Guntur Eka Saputra. El modelo no es un transformer generativo ni un modelo de lenguaje: es una red convolucional 1D de tamaño muy reducido que opera sobre un vector de 54 características acústicas extraídas con librosa, y devuelve una de cinco clases de emoción (angry, fear, happy, neutral, sad).

La relevancia del modelo es de nicho: la mayoría de los sistemas SER están entrenados con habla de adultos jóvenes, y los rasgos vocales de las personas mayores (menor flexibilidad de la frecuencia fundamental, jitter vocal, voz soplada, cadencia más lenta) degradan el rendimiento de esos sistemas. Este modelo se entrena explícitamente con esas características, lo que lo hace interesante para investigación en gerontología, teleasistencia y aplicaciones de acompañamiento.

Se trata de un artefacto de investigación pequeño (repo de 0.0 GB, sin descargas ni likes en el momento de la consulta) con licencia Apache 2.0 y una model card que declara métricas no verificadas. No debe confundirse con un modelo de propósito general: su alcance es estrictamente la clasificación de emoción en audio en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D personalizada (2 capas Conv1d + BatchNorm + MaxPool, 2 capas fully connected con dropout 0.3) |
| Parametros totales | No disponible (red muy pequena; el autor no publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada fija de 54 caracteristicas acusticas extraidas de 3 segundos de audio |
| Tipos de cuantizacion | No disponible (pesos PyTorch en `model_audio.pt`; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model_audio.pt`), mas `scaler_audio.pkl` y `label_encoder_audio.pkl` (joblib) |

## Arquitectura y entrenamiento

La red es una CNN 1D deliberadamente sencilla, pensada para operar sobre un vector de 54 dimensiones en lugar de sobre espectrogramas crudos. La entrada se compone de 40 coeficientes MFCC, 12 coeficientes Chroma STFT, 1 valor de Spectral Flatness y 1 valor de RMS Energy, todos promediados en el tiempo sobre una ventana de 3 segundos. La arquitectura aplica dos bloques convolucionales (64 y 128 canales, kernel 3, padding 1, BatchNorm y MaxPool), un aplanado, una capa densa de 128 unidades con dropout 0.3 y una capa de salida de 5 clases. El autor argumenta que esta estructura supera a ResNet1D y DenseNet1D sobre el mismo vector de características, algo plausible dado el tamaño reducido del dataset.

Los datos de entrenamiento son dos conjuntos: 300 grabaciones propias de personas mayores hablando frases conversacionales en cinco estados emocionales (dataset `custom-primary-elderly-speech`) y 1.000 muestras filtradas del Toronto Emotional Speech Set (TESS) correspondientes a la hablante Older Adult Female de 64 años. Se aplica aumento de datos con pitch shifting, inyección de ruido y speed/time-stretching. No se documenta el uso de RLHF, DPO ni ningún proceso de alineación; es un entrenamiento supervisado clásico con validación cruzada y conjunto de test reservado. La innovación técnica es la especialización en el dominio de edad, no la arquitectura.

## Capacidades

- Clasificación de emoción en audio de habla de personas mayores de 60 años en cinco clases: angry, fear, happy, neutral y sad.
- Extracción de características acústicas asistida: el autor publica el pipeline de librosa (MFCC, Chroma, Spectral Flatness, RMS) necesario para alimentar el modelo.
- Funciona sobre ventanas de 3 segundos de audio en inglés, con muestreo a la tasa nativa del fichero.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador, no un modelo generativo.
- No tiene capacidades multilingües: solo inglés, y además restringido al dominio de edad para el que fue entrenado.
- No incluye modo thinking, visión ni audio generativo; el complemento visual es un modelo separado (ViT) del mismo autor.

## Casos de uso

- Teleasistencia y detección de malestar en personas mayores: el modelo puede clasificar el estado emocional de una locución de 3 segundos en una llamada de seguimiento, permitiendo al sistema derivar a un operador humano cuando detecta tristeza o miedo persistente.
- Investigación en gerontología y psicología del envejecimiento: permite etiquetar corpus de habla de mayores con emoción de forma automática y barata, sustituyendo anotación manual en estudios longitudinales.
- Acompañamiento conversacional para residencias: integrado en un asistente de voz, el clasificador puede modular el tono de respuesta (por ejemplo, respuestas más pausadas ante tristeza) sin necesidad de un LLM en el bucle de decisión.
- Monitorización de bienestar en domótica asistida: análisis periódico de fragmentos de voz captados por dispositivos del hogar para detectar cambios de estado afectivo a lo largo de la semana.
- Triaje en aplicaciones de salud mental: como señal auxiliar (nunca como diagnóstico) en cuestionarios hablados, para priorizar revisiones cuando el clasificador detecta fear o sad con alta confianza.
- Docencia y reproducibilidad en SER: el modelo y su pipeline de extracción son un ejemplo mínimo y ejecutable en CPU para cursos de deep learning aplicado a audio, útil por su bajo coste computacional.
- Complemento multimodal con el ViT del mismo autor: combinar la predicción de audio y la de imagen facial para un sistema de reconocimiento emocional en mayores con dos señales independientes.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Metrica | Valor | Verificado |
|---|---|---|---|
| Speech Emotion Recognition for Seniors | Test Accuracy | 0.95 | No |
| Speech Emotion Recognition for Seniors | Macro Average F1-Score | 0.95 | No |

Comparativa de arquitecturas sobre el mismo dataset de audio de mayores (según el autor):

| Arquitectura | Caracteristicas de entrada | Test Accuracy | Macro F1 | Diferencia vs 1D-CNN |
|---|---|---|---|---|
| AudioCNN 1D (este modelo) | 54 caracteristicas acusticas | 95.00% | 0.95 | Baseline |
| ResNet1D | 54 caracteristicas acusticas | 88.00% | 0.88 | -7.00% |
| DenseNet1D | 54 caracteristicas acusticas | 84.00% | 0.84 | -11.00% |

Metricas por clase declaradas por el autor:

| Emocion | Precision | Recall | F1-Score |
|---|---|---|---|
| Angry | 0.96 | 0.98 | 0.97 |
| Fear | 0.94 | 0.96 | 0.95 |
| Happy | 0.94 | 0.97 | 0.95 |
| Sad | 0.93 | 0.97 | 0.95 |
| Neutral | 0.99 | 0.89 | 0.94 |
| Media / global | 0.95 | 0.95 | 0.95 |

No se han publicado resultados en benchmarks estandar de SER (IEMOCAP, RAVDESS, CREMA-D) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: la red tiene dos capas convolucionales y dos densas sobre un vector de 54 dimensiones; cabe holgadamente en cualquier CPU moderna y el cuello de botella real es la extraccion de caracteristicas con librosa.
- VRAM estimada: menos de 1 GB en GPU; el modelo completo y el scaler ocupan unos pocos megabytes.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada. Una Raspberry Pi 4 puede ejecutar la inferencia si se precalcular las caracteristicas.
- Cabe en cualquier GPU consumer y en la mayoria de dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (recomendado por el autor), exportacion a ONNX o TorchScript para servir via FastAPI, o integracion en un microservicio Python con librosa. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan pensados para LLMs.
- Latencia y throughput: no disponibles en la informacion proporcionada. La extraccion de caracteristicas con librosa sobre 3 segundos de audio domina el coste frente a la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| audio-cnn-elderly-emotion-recognition | CNN 1D sobre 54 features | No disponible (muy pequeno) | 3 s de audio, 54 features | 95% accuracy (no verificado) en dataset propio de mayores | Apache 2.0 | Hugging Face |
| pelikrapael/vit-base-elderly-emotion-recognition | ViT para emociones faciales en mayores | No disponible | Imagen facial | No disponible en esta ficha | No disponible | Hugging Face |
| Modelos SER genericos (p. ej. wav2vec2 fine-tuned en IEMOCAP) | Transformer sobre audio crudo | ~95M (wav2vec2-base) | Audio variable | No comparable directamente: dominio de adultos jovenes | Variable segun checkpoint | Hugging Face |
| TESS-based SER clasicos | SVM / CNN sobre features | Muy variable | Features acusticas | No disponible | Variable | Repos academicos |

La comparacion directa con modelos SER genericos no es limpia: este modelo esta especializado en un subconjunto de poblacion y evaluado en un dataset propio de 300 grabaciones, por lo que sus 95% no son extrapolables a benchmarks publicos.

## Limitaciones y advertencias

- Metricas no verificadas: el 95% de accuracy y F1 proviene de la model card del autor, sin validacion independiente ni publicacion de la particion train/test.
- Dataset muy pequeno: 300 grabaciones propias mas 1.000 muestras de TESS de una sola hablante (OAF, 64 años); el riesgo de sobreajuste y de sesgo por hablante es alto.
- Sesgo de dominio: entrenado solo con habla de mayores en inglés; el rendimiento en adultos jovenes, otros acentos o personas con patologías vocales (disfonía, Parkinson) no esta documentado y probablemente sea bajo.
- Sesgo de genero y de hablante: la parte TESS corresponde a una unica hablante femenina; la representacion masculina depende solo de las 300 grabaciones propias.
- Riesgo de clasificacion erronea en emociones sutiles: la clase neutral tiene el recall mas bajo (0.89) segun el propio autor, lo que sugiere confusiones con clases vecinas.
- No es un sistema de diagnostico clinico: la emoción detectada no equivale a estado afectivo real ni a indicador de salud mental; su uso en contextos sanitarios requiere validacion adicional y supervision profesional.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantias y de validacion externa desaconseja su despliegue en produccion sin una evaluacion propia sobre el dominio objetivo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de comunidad, issues resueltos o mantenimiento.
- Dependencia de librosa y de la version exacta del pipeline de extraccion: cambios en la implementacion de MFCC o Chroma pueden alterar las predicciones, por lo que conviene fijar versiones.

## Enlaces

- Hugging Face: https://huggingface.co/pelikrapael/audio-cnn-elderly-emotion-recognition
- Modelo visual complementario (ViT): https://huggingface.co/pelikrapael/vit-base-elderly-emotion-recognition
- Toronto Emotional Speech Set (TESS): no disponible enlace directo en la informacion proporcionada
- Paper o publicacion de la tesis: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
