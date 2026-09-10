# maanka2/vocos-mel-24khz

## Resumen

Vocos-mel-24kHz es un vocoder neuronal (sintetizador de forma de onda) que convierte mel-espectrogramas en audio de 24 kHz. No es un modelo de lenguaje: no genera texto ni razona, sino que reconstruye la senal temporal a partir de una representacion espectral. Este checkpoint concreto, publicado por el usuario maanka2, es una version compatible con la libreria `transformers` del modelo original charactr/vocos-mel-24khz, y expone las clases `VocosModel` y `VocosFeatureExtractor` para su uso directo en Python.

La arquitectura subyacente proviene del articulo "Vocos: Closing the gap between time-domain and Fourier-based neural vocoders for high-quality audio synthesis" (arXiv:2306.00814, 2023). Vocos combina un backbone tipo ConvNeXt con una cabeza que predice coeficientes de STFT complejos y aplica una iSTFT para volver al dominio temporal, en lugar de generar la onda muestra a muestra como hacen los vocoders puramente time-domain (HiFi-GAN). El resultado es un modelo de 13.532.674 parametros (segun los pesos safetensors) capaz de sintetizar audio con una latencia y un coste computacional muy inferiores a los de un vocoder autoregresivo.

Su relevancia practica es doble. Por un lado, es una pieza de infraestructura habitual en pipelines de texto-a-voz y de codecs neuronales, donde actua como etapa final de reconstruccion. Por otro, la version `transformers` elimina la necesidad de cargar codigo externo del repositorio original, lo que simplifica su integracion en `pipelines` y su despliegue junto a otros modelos de audio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vocoder generativo con backbone ConvNeXt y cabeza Fourier (prediccion de STFT compleja + iSTFT); no es un transformer |
| Parametros totales | 13.532.674 (dato de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la entrada es un mel-espectrograma de forma (batch, 100 bandas mel, frames). En el ejemplo de la model card, 549 frames generan 140.288 muestras |
| Tipos de cuantizacion | No disponible (no se documentan variantes GGUF, int8 o int4 para este checkpoint) |
| Idiomas soportados | No aplica; el modelo opera sobre audio y es independiente del idioma del habla de entrada |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

Vocos sigue un diseno feed-forward en el dominio de la frecuencia. El backbone esta formado por bloques convolucionales tipo ConvNeXt que procesan el mel-espectrograma, y sobre ellos se situa una cabeza lineal que predice las partes real e imaginaria de la STFT de la senal objetivo. La forma de onda final se obtiene aplicando una iSTFT con la ventana y el salto configurados en el `VocosFeatureExtractor`. Este esquema evita el modelado muestra a muestra y sustituye la generacion autoregresiva o la sintesis por upsampling progresivo de los vocoders time-domain, lo que reduce de forma notable el coste de inferencia.

El entrenamiento del modelo original combina perdidas de reconstruccion espectral con perdidas adversarias, en la linea de los vocoders GAN, y emplea audio a 24 kHz. Esta ficha no dispone de informacion verificada sobre el numero exacto de horas de entrenamiento, la composicion del dataset ni si se aplicaron fases de ajuste fino adicionales en este checkpoint concreto. Tampoco se documentan innovaciones especificas introducidas por el autor de la conversion a `transformers` mas alla del propio envoltorio de la API (`VocosModel`, `VocosFeatureExtractor`) y del soporte de `padding_mask` para procesamiento por lotes.

## Capacidades

- Sintesis de forma de onda a 24 kHz a partir de mel-espectrogramas de 100 bandas, en una sola pasada hacia delante (no autoregresiva).
- Procesamiento por lotes con enmascaramiento de padding: el `VocosFeatureExtractor` devuelve `padding_mask`, lo que permite reconstruir audios de distinta duracion en un mismo batch y recortar el padding posteriormente.
- Integracion nativa con la libreria `transformers` (`from_pretrained`, `device_map="auto"`), lo que facilita su uso junto a otros modelos de audio en el mismo entorno.
- Independencia del idioma y del hablante: la calidad depende del mel-espectrograma de entrada, no de caracteristicas linguisticas concretas.
- Uso como etapa de decodificacion en codecs neuronales y en sistemas TTS acustico-a-onda.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: son capacidades fuera del ambito de un vocoder.
- No dispone de modo de vision, audio-input (mas alla del espectrograma) ni audio de entrada directo: la entrada es siempre una representacion mel.

## Casos de uso

- Sintesis final en pipelines de texto-a-voz: un modelo acustico (VITS, FastSpeech 2, Tacotron 2) produce el mel-espectrograma y Vocos lo convierte en audio de 24 kHz. Es adecuado por su baja latencia y su tamano reducido, que permiten ejecutar la etapa de vocoder en la misma GPU o incluso en CPU.
- Decodificacion en codecs neuronales de audio: en un esquema tipo EnCodec o SoundStream, Vocos reconstruye la onda a partir de la representacion mel, ofreciendo una alternativa mas rapida que un decoder time-domain, como demuestra la variante hf-audio/vocos-encodec-24khz.
- Generacion de audio por lotes para investigacion: el soporte de `padding_mask` permite procesar datasets completos de espectrogramas en batches y recuperar exactamente las longitudes originales, util para experimentos de reconstruccion a gran escala.
- Data augmentation para ASR: resintetizar corpus de audio con distintas condiciones de mel-espectrograma para aumentar la robustez de modelos de reconocimiento de voz.
- Restauracion y post-produccion de audio: reconstruccion de la fase y de la envolvente temporal a partir de espectrogramas modificados (por ejemplo, tras reduccion de ruido o ecualizacion en el dominio espectral).
- Prototipado rapido de interfaces de voz: asistentes, lectores de pantalla y sistemas de accesibilidad que necesitan convertir texto en audio en tiempo real con un presupuesto de computo limitado.
- Servicios de conversion de voz y clonacion: dentro de un pipeline en el que la identidad del hablante se controla en la etapa de mel-espectrograma, Vocos aporta la reconstruccion final de la onda.
- Despliegue en entornos sin GPU: con 13,5 millones de parametros, el modelo cabe comodamente en memoria de CPU y puede ejecutarse en servicios de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este checkpoint no incluye tablas comparativas de MOS, MUSHRA ni metricas objetivas, y los resultados de busqueda web recuperados no guardan relacion con el modelo. El articulo original (arXiv:2306.00814) si presenta evaluaciones comparativas frente a vocoders time-domain, pero sus cifras no forman parte del material proporcionado y no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 54 MB en fp32 y 27 MB en fp16 para los pesos, mas el espacio de activaciones (dependiente del batch y de la longitud del audio). En la practica, el modelo completo ocupa muy pocos cientos de MB incluso con batches grandes.
- GPU recomendadas: cualquier GPU moderna es suficiente. No se requiere A100, H100 ni VRAM de gama alta; una NVIDIA T4, una RTX 3060 o incluso una GPU integrada pueden ejecutar la inferencia sin problemas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual (RTX 20xx, 30xx, 40xx) e incluso en GPUs de portatil con poca VRAM. Tambien es viable en CPU.
- Opciones de despliegue: `transformers` con PyTorch (uso directo segun los ejemplos de la model card), `device_map="auto"` para repartir el modelo entre dispositivos. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion disponible; estos frameworks estan orientados a modelos de lenguaje y no aplican directamente a un vocoder.
- Latencia y throughput estimados: no disponibles como cifras verificadas para este checkpoint. Cualitativamente, la familia Vocos se caracteriza por una sintesis muy por encima del tiempo real, dado su caracter feed-forward y su tamano de 13,5 millones de parametros.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / salida | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maanka2/vocos-mel-24khz (este) | 13.532.674 | Mel-espectrograma a audio 24 kHz | Vocos (ConvNeXt + cabeza Fourier) | MIT | HuggingFace, libreria `transformers` |
| charactr/vocos-mel-24khz | No disponible en la informacion proporcionada | Mel-espectrograma a audio 24 kHz | Vocos (implementacion original) | No disponible en la informacion proporcionada | HuggingFace |
| hf-audio/vocos-encodec-24khz | No disponible en la informacion proporcionada | Tokens de EnCodec a audio 24 kHz | Vocos con entrada de tokens | No disponible en la informacion proporcionada | HuggingFace |
| HiFi-GAN (referencia de la literatura) | No disponible en la informacion proporcionada | Mel-espectrograma a audio | Vocoder GAN time-domain | No disponible en la informacion proporcionada | Multiples repositorios |

Los datos de parametros, licencia y contexto de los modelos alternativos no se incluyen en la informacion proporcionada, por lo que no se realiza una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Dependencia total de la entrada: la calidad del audio generado esta acotada por la calidad del mel-espectrograma de entrada. Errores en el modelo acustico anterior se propagan directamente a la onda sintetizada.
- Riesgo de artefactos: como todo vocoder con reconstruccion de fase, puede introducir artefactos metalicos o de alta frecuencia en determinados espectrogramas, especialmente si las caracteristicas de normalizacion no coinciden con las del entrenamiento.
- Sin informacion sobre sesgos: no hay documentacion sobre el dataset de entrenamiento, la distribucion de hablantes, idiomas o acentos, por lo que no es posible evaluar sesgos de representacion.
- Ambito linguistico indeterminado: al no publicarse la composicion del corpus de entrenamiento, se desconoce si el modelo mantiene la calidad en idiomas distintos de los dominantes en el dataset original.
- Licencia MIT declarada, sin garantias: aunque la licencia del repositorio es permisiva, conviene verificar las condiciones del modelo original charactr/vocos-mel-24khz del que deriva este checkpoint antes de un uso comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en fechas poco habituales (2026). No hay evidencia de validacion por parte de la comunidad ni de mantenimiento posterior.
- Model card marcada como DRAFT: el propio autor la etiqueta como borrador, lo que sugiere que la informacion puede ser incompleta o cambiar.
- Inconsistencia en el identificador de ejemplo: el codigo de la model card carga `hf-audio/vocos-mel-24khz` en lugar de `maanka2/vocos-mel-24khz`. Al reproducir el ejemplo hay que sustituir manualmente el identificador para usar este checkpoint.
- No es un modelo de lenguaje: no admite instrucciones, no genera texto, no razona y no soporta herramientas ni agentes. Usarlo fuera de su ambito de audio no tiene sentido tecnico.
- Sin cuantizaciones publicadas: no se ofrecen pesos GGUF, int8 o int4, por lo que no hay una via documentada para reducir aun mas el consumo de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maanka2/vocos-mel-24khz
- Modelo original del que deriva: https://huggingface.co/charactr/vocos-mel-24khz
- Variante basada en EnCodec: https://huggingface.co/hf-audio/vocos-encodec-24khz
- Articulo de Vocos (pagina de papers de HuggingFace): https://huggingface.co/papers/2306.00814
- Articulo en arXiv: https://arxiv.org/abs/2306.00814
- Ejemplos de audio de referencia: https://huggingface.co/datasets/bezzam/vocos-examples
- Repositorio de la implementacion original: no disponible en la informacion proporcionada (la model card no incluye el enlace al repositorio de codigo)
- Resultados de busqueda web: los enlaces recuperados no guardan relacion con el modelo y se han descartado por no ser relevantes.
