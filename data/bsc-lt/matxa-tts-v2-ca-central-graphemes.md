# BSC-LT/matxa-tts-v2-ca-central-graphemes

## Resumen

Matxa-TTS v2 (variante catalán central con grafemas) es un modelo de síntesis de voz neuronal multihablante desarrollado por el grupo BSC-LT (Language Technologies) del Barcelona Supercomputing Center, dentro del ecosistema del Projecte Aina. Se trata de un modelo acústico: recibe texto en catalán escrito con grafemas (sin necesidad de un fonemizador externo) y produce características acústicas (mel-espectrogramas) que después deben convertirse en onda de audio mediante un vocoder independiente, como alVoCat o Wavenext.

El modelo se basa en la arquitectura Matcha-TTS, un encoder-decoder no autorregresivo entrenado con *optimal-transport conditional flow matching* (OT-CFM), que sustituye el decodificador basado en score matching por un decodificador ODE capaz de generar audio de calidad en menos pasos de síntesis. La versión v2 introduce cambios respecto al original: canales del decodificador ampliados a 512, dimensión de cabeza de atención de 128, muestreo estratificado de pasos de difusión, planificador de pasos coseno y un denoiser aplicado al espectrograma generado durante la inferencia.

Su relevancia práctica es doble: por un lado cubre una lengua con poca cobertura comercial en TTS (catalán), con cinco variedades dialectales en el preentrenamiento (balear, central, septentrional, noroccidental y valenciano); por otro, al trabajar con grafemas elimina una pieza frágil del pipeline TTS clásico. La model card no publica el número de parámetros ni resultados numéricos de evaluación, por lo que varias especificaciones quedan como no disponibles. Los resultados de búsqueda web obtenidos no contienen información relevante sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS: encoder-decoder no autorregresivo; encoder de texto con predicción de duraciones, decodificador U-Net con backbone Transformer y convoluciones 1D, entrenado con OT-CFM (decodificador ODE) |
| Parametros totales | no disponible (no declarado en la model card) |
| Longitud de contexto | no disponible (no aplica: modelo acústico de TTS; la entrada es texto y no se define ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y exportación ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | Catalan; el ajuste final apunta al catalán central. Preentrenamiento con cinco variedades: balear, central, septentrional, noroccidental y valenciano |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (checkpoint) y ONNX |
| Tarea | Text-to-speech (generación de características acústicas); pipeline de HuggingFace no declarado |
| Entrada | Texto en grafemas catalanes (los números deben normalizarse antes) |
| Salida | Mel-espectrograma; requiere vocoder externo para obtener audio |
| Vocoders compatibles | alVoCat (projecte-aina/alvocat-vocos-22khz), Wavenext (BSC-LT/wavenext-mel) |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 92 / 1 |
| Fecha de creacion / actualizacion | 2025-10-15 / 2026-10-26 |

## Arquitectura y entrenamiento

Matxa-TTS v2 sigue el diseño Matcha-TTS: un encoder de texto que incluye predicción de duración de fonemas y un decodificador tipo U-Net inspirado en Grad-TTS, con backbone Transformer. La sustitución de convoluciones 2D por convoluciones 1D en el decodificador reduce el consumo de memoria y acelera la síntesis. El entrenamiento usa *optimal-transport conditional flow matching*, lo que produce un decodificador basado en ODE que alcanza calidad alta con menos pasos que los modelos entrenados con score matching. Las modificaciones de la v2 son: canales del decodificador a 512, dimensión de cabeza de atención a 128, muestreo estratificado de pasos (cada muestra del lote recibe un segmento distinto de [0,1) para cubrir uniformemente el tiempo de difusión), planificador de pasos coseno y un denoiser sobre el espectrograma generado en inferencia.

El entrenamiento se realizó en dos fases. La primera, de preentrenamiento, usó un subconjunto balanceado por acento del corpus anotado CommonVoice 17 en catalán: 36,2 horas totales, repartidas en balear (7,27 h), central (9,72 h), septentrional (1,49 h, todas las muestras disponibles), noroccidental (9,21 h) y valenciano (8,53 h). Hiperparámetros: learning rate 1e-4, sin scheduler, batch de 32, 2 GPU, 150.000 pasos (aproximadamente 12 horas en una H100). La segunda fase, de ajuste fino, empleó OpenSLR69 y FestCat; se congelaron las dos primeras capas del encoder de texto, el prenet y los embeddings, ya que habían aprendido secuencias de fonemas específicas de acento en el preentrenamiento, dejando que el modelo se centrara en el decodificador y en refinar los embeddings de hablante. Hiperparámetros: learning rate 5e-4, cosine annealing con mínimo 5e-5, batch de 32, 2 GPU, 12.000 pasos (aproximadamente 2 horas en una H100). No se documenta en la información disponible el uso de RLHF, DPO ni etapas de preferencia humana, algo esperable en un modelo acústico de TTS.

## Capacidades

- Síntesis de voz en catalán a partir de texto escrito en grafemas, sin fonemizador intermedio.
- Generación de características acústicas (mel-espectrograma) de alta calidad para TTS, no de audio final: la waveform la produce un vocoder externo.
- Multihablante: incorpora embeddings de hablante, con cobertura de cinco variedades dialectales del catalán en el preentrenamiento.
- Síntesis no autorregresiva con decodificador ODE, orientada a baja latencia y menor número de pasos de muestreo.
- Exportación a ONNX, lo que permite inferencia fuera de PyTorch (hay un cuaderno de Colab con ONNX + alVoCat).
- Control de duración de fonemas mediante el predictor de duraciones del encoder.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, matemáticas, código, visión ni audio de entrada: no es un modelo de lenguaje ni un modelo multimodal.
- No se documentan capacidades de clonación de voz a partir de audio de referencia ni de *voice conversion*.

## Casos de uso

- Lectura de pantalla y accesibilidad: convertir artículos, documentos o interfaces en audio catalán para personas con discapacidad visual, aprovechando que la entrada es texto plano en grafemas y no requiere preprocesado fonético.
- Locución para medios públicos y administración: generación de cuñas, avisos y comunicados en catalán con distintas voces, usando el vocoder alVoCat ya entrenado en la lengua.
- Audiolibros y contenido editorial: síntesis por lotes de textos largos (por ejemplo, obras de dominio público como el texto de Josep Carner usado en la evaluación) con selección de hablante según el registro.
- Asistentes de voz y altavoces inteligentes: integración en el pipeline ASR-LLM-TTS para respuestas habladas en catalán, con la ventaja de la inferencia no autorregresiva para reducir latencia percibida.
- Navegación y sistemas embebidos: avisos de GPS o kioscos interactivos donde el modelo acústico se ejecuta en ONNX sobre hardware modesto y el vocoder completa la síntesis.
- IVR y atención telefónica: mensajes y respuestas automáticas multihablante en catalán central, con voces diferenciadas por campaña o por tipo de aviso.
- Generación de datos sintéticos para ASR: creación de corpus de audio etiquetado en catalán con distintas variedades dialectales para aumentar el entrenamiento de sistemas de reconocimiento de voz, como el propio whisper-bsc-large-v3-cat empleado en la evaluación.
- Enseñanza y aprendizaje de catalán: producción de ejemplos de pronunciación con diferentes acentos (balear, central, septentrional, noroccidental, valenciano) para materiales didácticos.

## Benchmarks y rendimiento

La model card describe el protocolo de evaluación, pero no incluye en la información disponible los valores numéricos obtenidos ni la tabla comparativa completa (el texto se interrumpe al inicio de la comparación con Matxa-TTS previo). No se han publicado resultados de benchmarks en la información disponible.

Protocolo declarado:

| Metrica | Instrumento | Conjunto de evaluacion | Resultado |
|---|---|---|---|
| Calidad de voz (ScoreQ) | ScoreQ (arxiv 2410.06675) | 350 frases de "La creació d'Eva i altres contes" de Josep Carner i Puig-Oriol (Project Gutenberg) | no disponible |
| WER | whisper-bsc-large-v3-cat | Mismo conjunto de 350 frases | no disponible |
| CER | whisper-bsc-large-v3-cat | Mismo conjunto de 350 frases | no disponible |

El vocoder utilizado en la evaluación es alVoCat (projecte-aina/alvocat-vocos-22khz), ya entrenado en catalán. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM de inferencia: no publicada por el autor. Como referencia de orden de magnitud, el repositorio completo (pesos PyTorch más exportación ONNX) ocupa 0,5 GB, de modo que el peso del modelo en FP32 es inferior a esa cifra; la VRAM total depende del vocoder elegido y del tamaño de lote.
- GPU de entrenamiento documentadas: 2 GPU (los tiempos declarados, unas 12 h para 150.000 pasos y unas 2 h para 12.000 pasos, se miden con H100).
- GPU recomendadas para producción: no documentadas. Para entrenamiento o ajuste fino, H100 o A100 por la referencia de tiempos de la model card; para inferencia no hay recomendación del autor.
- GPU de consumo: no confirmado por el autor. Por el tamaño del repositorio es esperable que la inferencia quepa en GPUs de consumo, pero no hay cifra oficial de VRAM ni de latencia.
- Despliegue: clonación del repositorio langtech-bsc/Matcha-TTS (rama v2-graphemes) e instalación con `pip install -e .`; ruta ONNX con cuaderno de Colab publicado; vocoder aparte (alVoCat o Wavenext) con su propio runtime.
- Herramientas no aplicables: vLLM, TGI, llama.cpp u Ollama están pensadas para modelos de lenguaje; no aplican a este modelo acústico.
- Latencia y throughput: no disponibles como cifra. La model card afirma síntesis rápida y menor consumo de memoria gracias al uso de convoluciones 1D y a la generación ODE con menos pasos, pero no cuantifica.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Idioma | Licencia | Resultados publicados |
|---|---|---|---|---|---|---|
| Matxa-TTS v2 ca-central, grafemas (este modelo) | TTS acústico + vocoder externo | no disponible | Grafemas | Catalán (5 variedades en preentrenamiento) | apache-2.0 | Métricas declaradas (ScoreQ, WER, CER) sin valores en la información disponible |
| Matxa-TTS previo (referenciado en la model card como comparación) | TTS acústico | no disponible | no disponible | Catalán | no disponible en la información disponible | Comparación iniciada pero truncada en la información disponible |
| alVoCat (projecte-aina/alvocat-vocos-22khz) | Vocoder | no disponible | Mel-espectrograma | Catalán | no disponible en la información disponible | no disponible |
| Wavenext (BSC-LT/wavenext-mel) | Vocoder | no disponible | Mel-espectrograma | no especificado | no disponible en la información disponible | no disponible |

Nota: alVoCat y Wavenext no son alternativas a este modelo, sino componentes complementarios del mismo pipeline (el modelo acústico genera el espectrograma y el vocoder lo convierte en audio). No se dispone de datos suficientes para comparar con otros sistemas TTS en catalán.

## Limitaciones y advertencias

- Cobertura lingüística restringida al catalán: la propia model card advierte de que, si se usa con otros idiomas, no producirá muestras inteligibles tras el paso por el vocoder.
- El ajuste fino está orientado al catalán central; la calidad y el acento de las demás variedades dependen de lo aprendido en el preentrenamiento y pueden ser desiguales.
- Calidad variable según el hablante: el autor lo atribuye a la sensibilidad del modelo a determinadas frecuencias y a la calidad de las muestras disponibles por hablante.
- Normalización de texto obligatoria: los números deben normalizarse antes de la inferencia; el modelo no realiza esa conversión por sí mismo.
- No genera audio final: requiere un vocoder externo, cuya licencia y requisitos de hardware son independientes de los de este modelo.
- Riesgo de errores de pronunciación y prosodia al trabajar con grafemas (sin control fonémico explícito), especialmente en palabras ambiguas, neologismos y nombres propios. No aplica el concepto de alucinación de contenido, pero sí el de lectura incorrecta del texto entregado.
- Datos de entrenamiento limitados en volumen (36,2 h de preentrenamiento más FestCat y OpenSLR69 en el ajuste fino, con horas no especificadas para esta segunda fase), lo que puede penalizar la cobertura de vocabulario y de estilos.
- La licencia del modelo es apache-2.0, pero los corpus de entrenamiento (CommonVoice, FestCat, OpenSLR69) tienen sus propias condiciones; la model card remite a una sección de licencias en "Additional information" que no está disponible en la información proporcionada. Conviene verificar los términos antes de un uso comercial.
- No se publican número de parámetros, cifras de VRAM ni resultados numéricos de calidad, lo que dificulta una evaluación previa rigurosa para producción.
- Sin datos publicados sobre sesgos de género, edad o acento más allá de la distribución dialectal del corpus de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BSC-LT/matxa-tts-v2-ca-central-graphemes
- Repositorio de código (rama v2-graphemes): https://github.com/langtech-bsc/Matcha-TTS/tree/v2-graphemes
- Repositorio original Matcha-TTS: https://github.com/shivammehta25/Matcha-TTS
- Cuaderno de Colab (ONNX + alVoCat): https://colab.research.google.com/drive/14JzJHfFiEBwp1VwH4ZCuHlNSy2YgdPve?usp=sharing
- Vocoder alVoCat: https://huggingface.co/projecte-aina/alvocat-vocos-22khz
- Vocoder Wavenext: https://huggingface.co/BSC-LT/wavenext-mel
- Dataset FestCat (limpio y con reducción de ruido): https://huggingface.co/datasets/projecte-aina/festcat_trimmed_denoised
- Dataset OpenSLR69 catalán (limpio y con reducción de ruido): https://huggingface.co/datasets/projecte-aina/openslr-slr69-ca-trimmed-denoised
- Subconjunto anotado de CommonVoice 17 en catalán: https://huggingface.co/datasets/projecte-aina/annotated_catalan_common_voice_v17
- Modelo ASR usado en la evaluación: https://huggingface.co/langtech-veu/whisper-bsc-large-v3-cat
- Paper de Grad-TTS (arxiv 2105.06337): https://arxiv.org/pdf/2105.06337.pdf
- Paper de ScoreQ (arxiv 2410.06675): https://arxiv.org/pdf/2410.06675.pdf
- Texto de evaluación, "La creació d'Eva i altres contes" (Project Gutenberg): https://www.gutenberg.org/cache/epub/17219/pg17219.txt

Nota: la búsqueda web realizada no ha devuelto enlaces adicionales relevantes sobre este modelo; los resultados obtenidos corresponden a entradas enciclopédicas sobre titulaciones académicas y no guardan relación.
