# Badawi001/nabra_sin_sad

## Resumen

nabra_sin_sad es un ajuste fino del modelo de síntesis de voz Nabra-82M-v0.1, desarrollado por el usuario Badawi001, que a su vez deriva de Kokoro-82M (arquitectura StyleTTS2 / ISTFTNet). El objetivo del modelo es corregir una deficiencia concreta del modelo base: en Nabra, el proceso de limpieza de fonemas eliminaba las marcas de énfasis, de modo que la letra ص llegaba al modelo con el mismo token que س y la letra ض con el mismo token que د. Como consecuencia, el modelo base confundía con frecuencia estos pares de consonantes enfáticas y no enfáticas, un error crítico en árabe porque cambia el significado de las palabras.

La intervención es quirúrgicamente mínima: se añaden dos identificadores de token libres de Kokoro (26 y 27) para ص y ض, y solo se entrenan cuatro filas de embedding (ص, ض, s y d) en las dos tablas de tokens del modelo (PL-BERT de 128 dimensiones y el encoder de texto de 512 dimensiones). Todos los demás pesos, incluida la voz af_msa (femenina, árabe estándar moderno, 24 kHz), permanecen congelados e idénticos al modelo base.

El modelo es relevante porque demuestra una técnica de ajuste fino extremadamente eficiente en parámetros (cuatro filas de embedding, 50 pasos de entrenamiento) para corregir confusiones fonéticas específicas en TTS, usando Whisper large-v3 como profesor y una pérdida de margen sobre pares mínimos. La mejora es real pero parcial: la tasa de error de caracteres baja del 3,5 % al 3,1 % y los casos de س percibida como ص se reducen de 23 a 16 sobre 98.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 / ISTFTNet (base Kokoro-82M), con PL-BERT para embeddings de palabras |
| Parametros totales | 82 M (heredados del modelo base; solo 4 filas de embedding entrenadas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto por segmentos) |
| Tipos de cuantizacion | no disponible (pesos en .pth; no se documentan cuantizaciones) |
| Idiomas soportados | Árabe estándar moderno (ar), con entrada vocalizada (tashkeel) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch), config.json, voicepack af_msa.pt |
| Frecuencia de muestreo | 24 kHz |
| Voces | Una sola voz femenina (af_msa, árabe estándar moderno) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Kokoro-82M, un sistema TTS basado en StyleTTS2 con generador ISTFTNet y un módulo PL-BERT para la representación de palabras. El pipeline incluye un front-end G2P basado en espeak-ng más una capa de limpieza de fonemas propia de Nabra. La innovación de este ajuste consiste en sustituir la representación de ص y ض por dos tokens nuevos (ids 26 y 27) que inicialmente son copias de las filas de s y d, respectivamente, evitando así que la limpieza de fonemas las colapse.

El entrenamiento congela todos los pesos excepto cuatro filas de embedding: ص, ض, s y d en `bert.embeddings.word_embeddings` (128 dimensiones) y en `text_encoder.embedding` (512 dimensiones). Se usan aproximadamente 800 frases de árabe estándar moderno de estilo periodístico, vocalizadas con CATT y fonemizadas con espeak-ng; el audio no se proporciona, sino que lo genera el propio modelo. El profesor es Whisper large-v3 congelado, que escucha el audio generado. La pérdida combina entropía cruzada de la transcripción correcta, una pérdida de margen de 4 nats que exige que la transcripción correcta supere a la misma transcripción con un intercambio ص/س o ض/د (por ejemplo, صار frente a سار), y una atracción L2 hacia las filas iniciales. Se emplea Adam con tasa de aprendizaje 6e-3 durante 50 pasos de 4 frases; el checkpoint se selecciona sobre un conjunto separado de 20 pares mínimos, ya que un entrenamiento más prolongado degradaba los sonidos.

## Capacidades

- Síntesis de voz en árabe estándar moderno a 24 kHz con una voz femenina (af_msa).
- Distinción de ص frente a س y de ض frente a د mediante tokens dedicados, con mejora medida frente al modelo base.
- Generación de audio a partir de texto vocalizado (con tashkeel) mediante el pipeline de Kokoro y el front-end G2P árabe.
- Control de velocidad de habla mediante el parámetro `speed` del pipeline.
- Integración con la librería kokoro (fork de Oddadmix) y con el ecosistema PyTorch.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Lectura de textos periodísticos en árabe estándar moderno: el modelo está entrenado sobre unas 800 frases de estilo noticia, por lo que es adecuado para narrar titulares y artículos vocalizados, con una tasa de error de caracteres del 3,1 % en la prueba del autor.
- Síntesis para aplicaciones de accesibilidad: conversión de texto árabe vocalizado a voz para lectores de pantalla, donde la distinción entre ص y س y entre ض y د evita ambigüedades semánticas en palabras como صار frente a سار.
- Generación de material didáctico de árabe: al separar consonantes enfáticas, el modelo sirve para crear ejemplos auditivos de pares mínimos en la enseñanza de la fonología árabe, aunque con la advertencia de que la corrección es parcial.
- Integración en pipelines de TTS existentes basados en Kokoro: al compartir arquitectura y voicepack con Nabra-82M-v0.1, se puede sustituir el checkpoint sin cambiar la infraestructura, solo añadiendo el paso de mapeo de ص y ض antes de la limpieza de fonemas.
- Prototipado de asistentes de voz en árabe estándar moderno: con 82 M de parámetros y un repositorio de 0,3 GB, el modelo se puede desplegar en entornos con recursos limitados para demos y pruebas de concepto.
- Investigación sobre ajuste fino eficiente en TTS: el modelo sirve como caso de estudio de corrección de confusiones fonéticas mediante el entrenamiento de solo cuatro filas de embedding con un profesor ASR y una pérdida de margen.

## Benchmarks y rendimiento

Evaluación del autor sobre 60 frases de árabe estándar moderno no usadas en entrenamiento, transcritas con Whisper large-v3-turbo (distinto del Whisper large-v3 usado como profesor):

| Métrica | Nabra-82M-v0.1 | nabra_sin_sad |
|---|---|---|
| س percibida como ص | 23 de 98 | 16 de 98 |
| ض percibida como د | 6 de 38 | 5 de 38 |
| ص percibida como س | 4 de 61 | 3 de 61 |
| د percibida correctamente | 127 de 129 | 128 de 129 |
| Tasa de error de caracteres (todo el texto) | 3,5 % | 3,1 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 82 M de parámetros y pesos en fp32, el modelo ocupa del orden de 0,3 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo base Kokoro-82M se ejecuta habitualmente en CPU y en GPUs de gama baja.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente; también es viable en CPU para inferencia por segmentos.
- Opciones de despliegue: librería kokoro (fork de Oddadmix, instalable desde GitHub), PyTorch, soundfile y huggingface_hub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| nabra_sin_sad | 82 M | Árabe (MSA) | no aplica | Apache 2.0 | Hugging Face, 0 descargas | Ajuste de 4 filas de embedding sobre Nabra |
| Nabra-82M-v0.1 | 82 M | Árabe (MSA) | no aplica | no disponible | Hugging Face | Modelo base; confunde ص/س y ض/د |
| Kokoro-82M | 82 M | Multilingüe (incluye árabe en variantes) | no aplica | Apache 2.0 | Hugging Face | Modelo original de hexgrad; arquitectura StyleTTS2 / ISTFTNet |

## Limitaciones y advertencias

- La corrección de س frente a ص es parcial: س se sigue percibiendo como ص en aproximadamente 1 de cada 6 casos, porque la vocal adyacente a س comparte representación con ص en las capas congeladas.
- Los pares ط/ت y ظ/ذ siguen fusionados, igual que en Nabra-82M.
- Requiere entrada vocalizada (con tashkeel) y solo admite árabe estándar moderno; no se documenta soporte para dialectos.
- Una sola voz (af_msa, femenina); no hay voces alternativas en este checkpoint.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta, no la generación de contenido falso.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Nabra-82M-v0.1 y de Kokoro-82M, así como las dependencias (espeak-ng, CATT, Whisper large-v3) que se usaron en el entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay validación independiente de los resultados del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Badawi001/nabra_sin_sad
- Modelo base Nabra-82M-v0.1: https://huggingface.co/oddadmix/Nabra-82M-v0.1
- Modelo original Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Fork de kokoro usado: https://github.com/Oddadmix/kokoro
- Front-end G2P árabe (gist): https://gist.githubusercontent.com/Oddadmix/dc699f7942a9516ce29d4842c7aed756/raw/827b541c892a862f9ef3b44006a6e27b100d1bdd/arabic_g2p.py
- CATT (vocalización árabe): https://github.com/abjadai/catt
