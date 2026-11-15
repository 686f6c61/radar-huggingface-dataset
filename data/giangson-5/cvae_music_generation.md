# GiangSon-5/CVAE_Music_Generation

## Resumen

CVAE_Music_Generation es un autoencoder variacional condicional (CVAE) convolucional 2D de 18,91 millones de parámetros, entrenado desde cero por el usuario GiangSon-5 para la generación y reconstrucción de música de piano en el dominio del espectrograma Mel. El modelo ingiere segmentos de audio de 3 segundos (66.150 muestras a 22.050 Hz), los proyecta en espectrogramas Mel logarítmicos de 256 bandas con 130 fotogramas temporales (forma `256 × 130`) y aprende un espacio latente continuo de 128 dimensiones mediante el truco de reparametrización gaussiana. No es un modelo de lenguaje ni un generador de audio de extremo a extremo: produce representaciones tiempo-frecuencia que requieren un vocoder o un algoritmo de inversión Mel para convertirse en audio.

El interés del modelo es fundamentalmente metodológico y educativo: documenta de forma transparente el entrenamiento completo (997 grabaciones `.mp3` de piano rastreadas, 60.608 segmentos de entrenamiento, 100 épocas, 104,33 minutos en una única NVIDIA L4 de 24 GB) con métricas de convergencia verificables, incluida la ausencia de colapso posterior (la divergencia KL se estabiliza en 25,93 en entrenamiento y 26,07 en test). Es relevante ahora como referencia reproducible para quienes quieran construir pipelines de generación musical condicionada por género con recursos mínimos, y como ejemplo de ajuste fino de precisión mixta BF16 nativa con TF32 en GPUs de gama media profesional.

La arquitectura es deliberadamente compacta (d_model=64, latente de 128 dimensiones, condicionamiento por género de una sola clase, "piano"), lo que limita su alcance práctico pero abarata su reproducción. La licencia MIT y la inclusión del código de arquitectura en el repositorio facilitan la reutilización y la experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CVAE convolucional 2D (encoder/decoder Conv2d, reparametrización gaussiana, condicionamiento por género concatenado al latente) |
| Parametros totales | 18.911.041 (18,91 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de espectrograma Mel `256 × 130` (3 s a 22.050 Hz) |
| Tipos de cuantizacion | no disponible (pesos en `.pth`; entrenado con BF16 nativo y TF32) |
| Idiomas soportados | en (etiqueta declarada; el modelo opera sobre audio, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (state_dict) + `model_architecture.py` |
| Dimension latente | 128 |
| Bandas Mel / fotogramas | 256 / 130 |
| Frecuencia de muestreo | 22.050 Hz |
| Condicionamiento | vector de género (n_genres=1, piano) |
| Hardware de entrenamiento | 1× NVIDIA L4 (24 GB VRAM) |

## Arquitectura y entrenamiento

El modelo es un CVAE con encoder y decoder convolucionales 2D que operan sobre espectrogramas Mel normalizados en escala dB y reescalados a `[0, 1]`. El encoder comprime la entrada `1 × 256 × 130` (33.280 píxeles tiempo-frecuencia) en una distribución gaussiana de 128 dimensiones; el decoder reconstruye el espectrograma a partir de una muestra latente. La condicionamiento se implementa concatenando un vector de género (una única clase, piano) al vector latente antes de la capa `decoder_input`, de modo que el muestreo desde la prior `z ~ N(0, I)` se realiza sobre `cat(z, genre)`.

El entrenamiento se hizo íntegramente desde cero sobre 997 grabaciones de piano rastreadas de la web, remuestreadas a 22.050 Hz y segmentadas en trozos no solapados de 3 segundos: 60.608 segmentos de entrenamiento y 32 de test reservados. Se ejecutaron 100 épocas con `batch_size = 64`, memoria fijada (pinned memory), `num_workers = 4` y precisión mixta BF16 nativa con aceleración TF32 en una única NVIDIA L4, con un tiempo total de 6.259,98 s (104,33 min). La función de pérdida es el ELBO estándar (MSE de reconstrucción más divergencia KL). No se documenta uso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo generativo de audio de este tipo.

La innovación técnica destacable no es arquitectónica sino de ingeniería del entrenamiento: la card reporta explícitamente la trayectoria de convergencia (ELBO de 720,27 en la época 1 a 348,72 en la época 100; MSE de 686,70 a 322,80; KL estabilizada en 25,93) y demuestra ausencia de colapso posterior, un problema habitual en VAEs con decoders potentes. No se mencionan decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Generación de espectrogramas Mel novedosos de piano mediante muestreo desde la prior `z ~ N(0, I)` condicionado por género.
- Reconstrucción de espectrogramas Mel de entrada (autoencoding) con un error cuadrático medio de aproximadamente 0,0097 por píxel en escala normalizada.
- Modelado de un espacio latente continuo y estructurado de 128 dimensiones, apto para interpolación y exploración de variedad latente.
- Condicionamiento por género (una única clase disponible: piano); no hay condicionamiento por tonalidad, tempo, estilo ni texto.
- Procesamiento de audio a 22.050 Hz en ventanas fijas de 3 segundos; no admite longitudes variables sin troceado previo.
- Capacidad de reconstrucción de frecuencias fundamentales armónicas y resonancia de bajos sostenida, según la evaluación cualitativa del autor.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada directa ni modo "thinking".
- Capacidades multilingües: no aplica (modelo de audio; la etiqueta `en` es meramente declarativa).

## Casos de uso

- **Generación de bocetos musicales para piano**: muestrear la prior latente para producir espectrogramas Mel candidatos que, tras inversión Mel o un vocoder externo, sirven como punto de partida compositivo. Es adecuado por su bajo coste de inferencia y su espacio latente continuo, que permite explorar variaciones.
- **Aumentación de datos de audio**: reconstruir o remuestrear segmentos de piano para ampliar corpus de entrenamiento de otros modelos (clasificadores de género, detectores de onsets) con variaciones latentes controladas.
- **Investigación educativa sobre VAEs**: el repositorio incluye la arquitectura y los pesos, lo que permite estudiar en la práctica el equilibrio reconstrucción-KL, el colapso posterior y la reparametrización gaussiana sobre datos reales de audio.
- **Prototipado rápido de pipelines de música generativa**: integrar el modelo como etapa de generación de representaciones tiempo-frecuencia en un pipeline mayor (CVAE → vocoder → post-procesado), validando la viabilidad antes de invertir en modelos de mayor escala.
- **Compresión y análisis de representaciones**: usar el encoder para obtener embeddings de 128 dimensiones de segmentos de piano y emplearlos en tareas de similitud, clustering o recuperación musical.
- **Reproducción de experimentos de entrenamiento en hardware modesto**: servir como referencia reproducible de un entrenamiento completo en una sola GPU de 24 GB con BF16 y TF32, útil para docencia y para calibrar presupuestos de cómputo.
- **Generación condicionada por instrumento (extensible)**: la interfaz `n_genres` permite, con reentrenamiento, añadir clases de condicionamiento adicionales; el modelo actual sirve de base para experimentos de condicionamiento multi-género.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Valor | Conjunto |
|---|---|---|
| ELBO de test reservado | 412,07 | 32 segmentos de test |
| MSE de reconstrucción de test | 386,00 | 32 segmentos de test |
| Divergencia KL de test | 26,07 | 32 segmentos de test |
| ELBO de entrenamiento (epoca 100) | 348,72 | 60.608 segmentos |
| MSE de reconstrucción de entrenamiento | 322,80 | 60.608 segmentos |
| Divergencia KL de entrenamiento | 25,93 | 60.608 segmentos |
| ELBO de entrenamiento (epoca 1) | 720,27 | 60.608 segmentos |
| MSE de reconstrucción de entrenamiento (epoca 1) | 686,70 | 60.608 segmentos |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, FAD, IS, etc.) en la información disponible; las métricas anteriores son específicas del dominio y del conjunto de datos propio del autor. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM para inferencia**: inferior a 1 GB con los pesos en FP32 (18,91 M de parámetros, aproximadamente 75,6 MB) más activaciones de un único espectrograma `256 × 130`; holgado en cualquier GPU consumer.
- **GPU recomendadas**: NVIDIA L4 (la usada en entrenamiento), T4, RTX 3060 en adelante; cualquier GPU con soporte CUDA es suficiente. También funciona en CPU para inferencia puntual.
- **GPU consumer**: sí, cabe en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida; el cuello de botella es el pre/post-procesado de audio, no el modelo.
- **Opciones de despliegue**: PyTorch nativo (script de ejemplo con `huggingface_hub`), TorchScript o exportación ONNX; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- **Latencia y throughput**: no disponibles de forma medida; el entrenamiento completo de 100 épocas sobre 60.608 segmentos requirió 104,33 min en una L4, lo que da una referencia aproximada de coste de cómputo, pero no se reportan métricas de inferencia.
- **Almacenamiento**: el repositorio ocupa 0,1 GB.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia categórica, los CVAE de audio y los modelos generativos musicales basados en espectrogramas (por ejemplo, arquitecturas VAE/CVAE similares o generadores condicionados) comparten el enfoque de modelar representaciones tiempo-frecuencia, pero no se han facilitado parámetros, contextos, rendimientos ni licencias de alternativas concretas, por lo que la comparación cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| CVAE_Music_Generation | 18,91 M | Mel `256 × 130` (3 s) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Alcance muy restringido**: solo piano, una única clase de condicionamiento y ventanas fijas de 3 segundos a 22.050 Hz; no generaliza a otros instrumentos ni a duraciones arbitrarias sin troceado.
- **Salida intermedia**: el modelo genera espectrogramas Mel, no audio; requiere inversión Mel o un vocoder externo, con la pérdida de calidad que ello implica.
- **Conjunto de test muy pequeño**: solo 32 segmentos reservados, lo que hace que las métricas de generalización tengan alta varianza y baja significación estadística.
- **Métricas no verificadas**: todos los resultados de la model card están marcados como `verified: false`; no hay evaluación independiente ni benchmarks estandarizados de calidad musical (FAD, IS, MOS).
- **Riesgo de sobreajuste y alucinación espectral**: con 18,91 M de parámetros y 60.608 segmentos, el modelo puede reproducir patrones del corpus de entrenamiento; la generación desde la prior puede producir espectrogramas plausibles pero musicalmente incoherentes.
- **Sesgos del corpus**: las 997 grabaciones rastreadas de la web introducen sesgos de estilo, época, calidad de grabación y posiblemente de derechos; no se documenta la procedencia ni la limpieza del dataset.
- **Licencia MIT**: permite uso comercial y modificación, pero la licencia del modelo no cubre los derechos sobre los datos de entrenamiento ni sobre el audio generado, que pueden estar sujetos a restricciones adicionales.
- **Sin soporte de texto ni instrucciones**: no es un modelo de lenguaje; no admite prompts en lenguaje natural ni tool calling.
- **Mantenimiento incierto**: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin garantías de soporte, actualizaciones ni corrección de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GiangSon-5/CVAE_Music_Generation
- Cuaderno de Colab: https://colab.research.google.com/drive/1IkPE0yLP-T3HRnpWFqZQpBftUDKUBpZU
- Paper de referencia VAE (Kingma y Welling, 2013): https://arxiv.org/abs/1312.6114
- Paper de referencia sobre espectrogramas Mel (referencia citada en los tags): https://arxiv.org/abs/1709.01620
- Licencia MIT: https://opensource.org/licenses/MIT
- Genius (resultado de búsqueda web, no relacionado directamente con el modelo): https://genius.com/
