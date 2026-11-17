# Phoonnx/arktts-multi-realistic-unicode

## Resumen

arktts-multi-realistic-unicode es una voz de síntesis de voz (text-to-speech) empaquetada para la librería phoonnx, publicada por el usuario Phoonnx (TigreGotico Lda). Se trata de una conversión a formato ONNX del modelo Edge0/Audio8-TTS-Realistic-Air, entrenado originalmente por Edge0. El modelo base pertenece a la familia Audio8-TTS y la conversión no altera los pesos: solo los exporta a ONNX y genera copias cuantizadas en int8.

El repositorio declara soporte para 23 idiomas (chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, finés, hindi, indonesio, malayo, neerlandés, noruego, polaco, portugués, sueco, tailandés, turco, vietnamita y cantonés), aunque la propia model card solo documenta y valida el inglés. La arquitectura es ArkTTS con un tokenizador BPE como entrada de texto, sin fonemizador, y una frecuencia de muestreo de 44100 Hz con un único hablante.

Su relevancia práctica está en el despliegue: al estar en ONNX, puede ejecutarse en CPU sin GPU dedicada mediante onnxruntime, con versiones fp32 e int8. La licencia Apache 2.0 permite uso comercial. El tamaño del repositorio es de 4,5 GB, y el grafo fp32 ocupa 3486,6 MB frente a los 959,9 MB de la versión int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ArkTTS (modelo base Audio8-TTS) |
| Parametros totales | no disponible (modelo base citado como Audio8-TTS-Preview-0.6b) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | 23 declarados en metadatos (zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue); validacion documentada solo para en |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos fp32 e int8) |

Otros datos tecnicos: frecuencia de muestreo de 44100 Hz, un único hablante (voice id `arktts/realistic-air-lj/en`), tokenizador BPE (tokenizer.json) sin fonemizador, y eliminación de puntuación previa a la síntesis por parte de phoonnx.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ArkTTS, según declara la model card. La entrada de texto se procesa mediante un tokenizador BPE contenido en tokenizer.json, sin paso de fonemización intermedio. La síntesis se realiza a 44100 Hz con un único hablante. El modelo base citado en la documentación es Edge0/Audio8-TTS-Preview-0.6b, del que deriva Edge0/Audio8-TTS-Realistic-Air; este repositorio es una conversión cuantizada de este último.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card indica explícitamente que los datos de entrenamiento no están registrados en el repositorio upstream. La innovación técnica documentada es la exportación a ONNX con cuantización dinámica int8 mediante onnxruntime 1.32.0, que reduce el grafo de 3486,6 MB a 959,9 MB.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto plano, con salida en WAV a 44100 Hz.
- Soporte declarado de 23 idiomas en los metadatos del repositorio; la validación de calidad documentada se limita al inglés.
- Funcionamiento sin fonemizador: el tokenizador BPE procesa directamente el texto.
- Inferencia en CPU mediante onnxruntime, sin requerir GPU.
- Dos variantes de precisión: fp32 (mayor calidad y tamaño) e int8 (menor tamaño y mayor velocidad).
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling ni razonamiento multi-paso; es un modelo exclusivamente de síntesis.

## Casos de uso

- Asistentes de voz en dispositivos sin GPU: al ejecutarse en ONNX sobre CPU con la variante int8 (959,9 MB de grafo), puede integrarse en sistemas embebidos o servidores modestos para respuestas habladas.
- Integración en asistentes OVOS: mediante `ovos-tts-plugin-phoonnx` y la configuración de `mycroft.conf`, se selecciona esta voz para la salida de voz del asistente.
- Generación de audiolibros o locuciones: la frecuencia de 44100 Hz y la variante fp32 permiten producir audio de mayor fidelidad para contenido pregrabado.
- Síntesis por lotes en pipelines de backend: la variante int8 reduce el uso de memoria (peak RSS de 2005,4 MB frente a 3766,3 MB en fp32), lo que facilita el procesamiento concurrente en servidores.
- Prototipado rápido de aplicaciones TTS: la instalación vía `pip install --pre phoonnx` y la API de `TTSModelManager` permiten integrar la síntesis en pocas líneas de código.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad en entornos de escritorio, donde la inferencia en CPU es suficiente.

## Benchmarks y rendimiento

La model card incluye una validación de calidad (QA) mediante ASR con nemo-parakeet-tdt-0.6b-v3 int8 sobre frases de FLORES-200 devtest (3 frases), únicamente en inglés. Los resultados son los siguientes:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0.000 | 0.000 |
| Caracteres por segundo | 11,4 a 14,1 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,81 a 0,97 |
| Tamano del grafo | 3486,6 MB | 959,9 MB |
| Peak RSS | 3766,3 MB | 2005,4 MB |
| RTF (mediana de 3, 4 hilos) | 8,098 | 3,365 |

Medido en un AMD Ryzen 5 7600 de 6 núcleos. El RTF es el tiempo de síntesis dividido por la duración del audio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica en el caso base, ya que la inferencia se ejecuta en CPU mediante onnxruntime.
- Memoria RAM: peak RSS de 3766,3 MB en fp32 y 2005,4 MB en int8.
- GPU: no se documentan requisitos de GPU; el modelo está pensado para CPU. No hay datos sobre aceleración por GPU.
- Cabe en hardware de consumo: sí, con la variante int8 en equipos con al menos 2 GB de RAM libre; la fp32 requiere alrededor de 4 GB.
- Despliegue: onnxruntime a través de phoonnx (librería Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 8,098 en fp32 y 3,365 en int8 sobre un Ryzen 5 7600 con 4 hilos. Un RTF superior a 1 implica que la síntesis tarda más que la duración del audio generado en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| arktts-multi-realistic-unicode | no disponible (base 0.6b) | no aplica | 23 declarados (validado en en) | Apache 2.0 | ONNX |
| Edge0/Audio8-TTS-Realistic-Air | no disponible (base 0.6b) | no aplica | no disponible en la informacion | Apache 2.0 | no disponible |
| Edge0/Audio8-TTS-Preview-0.6b | 0,6b (segun nombre) | no aplica | no disponible en la informacion | no disponible en la informacion | no disponible |

No se dispone de datos de rendimiento comparables de otros modelos TTS en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas como Piper, Coqui TTS o XTTS.

## Limitaciones y advertencias

- La validación de calidad documentada cubre únicamente el inglés; el soporte de los otros 22 idiomas declarados no está verificado en la model card.
- El modelo tiene un único hablante (voice id `arktts/realistic-air-lj/en`); no permite selección de voces ni clonación.
- La puntuación se elimina antes de la síntesis, lo que puede afectar a la prosodia en textos con estructura oracional compleja.
- El RTF en CPU es alto (8,098 en fp32 y 3,365 en int8 sobre Ryzen 5 7600), lo que limita su uso en aplicaciones de tiempo real sin hardware más potente.
- No se documentan los datos de entrenamiento, por lo que no es posible evaluar sesgos de origen ni la cobertura lingüística real del corpus.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir artefactos, pronunciaciones incorrectas o audio no inteligible en entradas fuera de distribución; la QA solo verifica 3 frases en inglés.
- La licencia Apache 2.0 permite uso comercial, pero se exige atribución a Edge0 como autor original de los pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phoonnx/arktts-multi-realistic-unicode
- Modelo upstream: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Modelo base citado: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
