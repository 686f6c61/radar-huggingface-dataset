# Mikhailo/mova-tts

## Resumen

mova-tts es un modelo de síntesis de voz (text-to-speech) en ucraniano con capacidad de clonación de voz, desarrollado por Mikhailo. Se trata de un fine-tune completo del modelo base neuphonic/neutts-air, un LM de habla de 0,7B parámetros basado en Qwen2, entrenado sobre aproximadamente 1780 horas de audio en ucraniano procedente de audiolibros, pódcasts, Common Voice y grabaciones de estudio.

El modelo genera tokens NeuCodec a partir de fonemas IPA y clona una voz a partir de una grabación de referencia de entre 3 y 12 segundos. La cadena completa incluye un front-end de texto en ucraniano que convierte números a palabras, aplica marcas de acentuación mediante la herramienta naholos y produce IPA, por lo que no depende de fonemas de eSpeak.

Es relevante porque cubre un idioma con escasa representación en el ecosistema TTS open source, se distribuye en formatos safetensors (bf16) y GGUF cuantizado (Q8_0 y Q4_K_M) para llama.cpp, y ofrece streaming con latencia de primer audio de 0,16 s en una RTX 4090. La licencia Apache-2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM de habla basado en Qwen2 (fine-tune de neuphonic/neutts-air), generacion de tokens NeuCodec desde fonemas IPA |
| Parametros totales | 747.930.496 (aproximadamente 0,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0 (0,8 GB), GGUF Q4_K_M (0,6 GB) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un LM de habla autorregresivo de 0,7B parámetros construido sobre la arquitectura Qwen2, heredada de neuphonic/neutts-air. Convierte fonemas IPA en tokens acústicos NeuCodec, que un decodificador NeuCodec transforma en audio a 24 kHz. El prompt sigue el formato de NeuTTS-Air con entrada fonémica: se concatenan los IPA de referencia y los IPA objetivo, y el modelo genera los códigos de habla correspondientes.

El entrenamiento consistió en un fine-tune completo en dos etapas: 12 000 pasos sobre un subconjunto de 740 horas y después 20 000 pasos sobre el conjunto completo de aproximadamente 1780 horas, con tasa de aprendizaje 2e-5. Los datos incluyen audiolibros narrados por profesionales, pódcasts, Common Voice y grabaciones de estudio; se recortó el silencio inicial y final, se descartaron enunciados con pausas internas largas y todo el audio se recodificó con NeuCodec. Las etiquetas de acentuación se obtuvieron del propio audio mediante alineación forzada con Montreal Forced Aligner y un detector acústico, de modo que el modelo aprende el acento realmente pronunciado y no el de diccionario. El dataset de entrenamiento no se publica.

## Capacidades

- Síntesis de voz en ucraniano a partir de texto, con salida a 24 kHz en float32.
- Clonación de voz zero-shot a partir de una referencia de 3 a 12 segundos y su transcripción exacta.
- Streaming por chunks con contexto izquierdo y crossfade; el primer chunk de audio aparece tras 35 códigos.
- Front-end de texto en ucraniano incluido en el paquete mova-tts: normalización de números a palabras, acentuación con naholos y conversión a IPA (ipa-uk).
- Inferencia en CUDA, GPU de Apple y CPU mediante llama.cpp con pesos GGUF.
- Watermark Perth imperceptible aplicado por defecto al audio generado.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible (modelo especializado en TTS).
- Capacidades multilingües: limitadas al ucraniano; las palabras en alfabeto latino se transliteran en el front-end.
- Modo thinking, visión o audio de entrada distinto de la referencia de clonación: no disponible.

## Casos de uso

- Narración de audiolibros y contenido editorial en ucraniano: el modelo fue entrenado con audiolibros de narradores profesionales y mantiene prosodia natural (UTMOS 3,45), con clonación de una voz concreta a partir de una muestra de estudio.
- Locución para pódcasts y boletines: el streaming con primer audio a 0,16 s en RTX 4090 permite generar locuciones largas por chunks sin esperar la síntesis completa.
- Atención al cliente y asistentes de voz en ucraniano: la clonación de una voz corporativa autorizada y la latencia baja en streaming (RTF 0,72 en CPU de 8 hilos) permiten respuestas habladas interactivas.
- Doblaje y localización de vídeo: sustitución de voces originales por una voz clonada consistente entre segmentos, manteniendo la transcripción exacta de cada fragmento como referencia.
- Accesibilidad y lectura de textos: conversión de documentos, noticias o interfaces a voz en ucraniano, con normalización de números y acentuación correcta gracias al front-end.
- Prototipado de productos de voz en hardware modesto: los GGUF Q4_K_M (0,6 GB) y Q8_0 (0,8 GB) permiten ejecutar en CPU y GPUs de consumo mediante llama.cpp, útil para demos y entornos sin GPU dedicada.
- Generación de material educativo y de aprendizaje de idiomas: pares texto-IPA-audio con acentuación derivada del habla real, útil para ejercicios de pronunciación.

## Benchmarks y rendimiento

Evaluación sobre 234 frases reservadas de Common Voice y audiolibros, con hablantes no vistos en entrenamiento y clonados a partir de una frase distinta de cada uno:

| Configuracion | WER | CER | UTMOS | Similitud de hablante |
|---|---:|---:|---:|---:|
| Enunciado completo, Q8_0 | 0,123–0,140 | 0,035–0,041 | 3,45 | 0,48–0,50 |
| Streaming, Q8_0 | 0,135–0,140 | 0,041–0,046 | 3,37 | 0,48–0,50 |
| Streaming, Q4_K_M | 0,131–0,135 | 0,041 | 3,33 | 0,48–0,49 |

Cada fila es el rango sobre 3 semillas de muestreo (2 para Q4_K_M). WER y CER provienen de transcripciones con Whisper large-v3; UTMOS es una puntuación predicha de naturalidad de 1 a 5; la similitud de hablante es la coseno ECAPA frente a grabaciones reales del hablante.

Velocidad en streaming, front-end incluido: primer audio a 0,16 s en RTX 4090 (RTF 0,14) y a 1,0 s en CPU i9-13900KF con 8 hilos (RTF 0,72).

## Requisitos de hardware

- VRAM estimada: bf16 requiere aproximadamente 1,5 GB de pesos; GGUF Q8_0 ocupa 0,8 GB y Q4_K_M 0,6 GB, más overhead de contexto y del decodificador NeuCodec.
- GPU recomendadas: RTX 4090 para streaming de baja latencia (0,16 s de primer audio, RTF 0,14); A100/H100 no son necesarias para este tamaño, pero funcionan.
- GPU de consumo: cabe en cualquier GPU con 2 GB o más de VRAM libre; también en GPU de Apple y CPU.
- CPU: funciona con llama.cpp; en un i9-13900KF con 8 hilos se obtiene RTF 0,72 (más rápido que tiempo real).
- Despliegue: llama.cpp (formato GGUF, opción por defecto), transformers con safetensors bf16, y el paquete mova-tts para el front-end, streaming y decodificación NeuCodec.
- Dependencia externa: NeuCodec está protegido por gating; hay que aceptar los términos en neuphonic/neucodec y neucodec-onnx-decoder una vez.
- Latencia y throughput: primer chunk tras 35 códigos; RTF 0,14 en RTX 4090 y 0,72 en CPU de 8 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mova-tts | 0,7B | no disponible | ucraniano | Apache-2.0 | Fine-tune de NeuTTS-Air con ~1780 h de ucraniano; GGUF y streaming |
| neuphonic/neutts-air | no disponible | no disponible | no disponible | Apache-2.0 | Modelo base del que deriva mova-tts; sin especialización en ucraniano |
| Alternativas TTS multilingues open source (p. ej. XTTS, Kokoro) | no disponible | no disponible | varios | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de resultados de benchmarks de terceros para establecer una comparación numérica directa con alternativas; los únicos datos verificados son los de la evaluación interna de mova-tts frente a neuphonic/neutts-air como base.

## Limitaciones y advertencias

- Solo ucraniano; las palabras en alfabeto latino se transliteran y pierden su pronunciación original.
- Cada toma se muestrea: en ocasiones alarga una palabra o introduce pausas extrañas; se recomienda regenerar con otra semilla.
- La calidad de clonación depende de la referencia: hace falta una grabación limpia de un único hablante y su transcripción exacta.
- El IPA debe proceder del front-end de mova-tts (ipa-uk con marcas de acento); los fonemas de eSpeak no funcionan.
- Riesgo de alucinación acústica: el modelo puede producir artefactos de prosodia o pronunciación en entradas atípicas (nombres propios, siglas, texto mixto).
- Sesgos: no documentados en la información disponible; la distribución de voces refleja audiolibros, pódcasts y Common Voice, lo que puede limitar la variedad de acentos y registros.
- Licencia Apache-2.0 permite uso comercial, pero NeuCodec es un componente con gating y condiciones propias que deben aceptarse por separado.
- Uso responsable: clonar únicamente voces con permiso; el audio de synthesize() lleva watermark Perth por defecto, lo que puede afectar a pipelines que requieran audio sin marca.
- El dataset de entrenamiento no se publica, lo que limita la auditoría de sesgos y la reproducibilidad del fine-tune.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria aún incipientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mikhailo/mova-tts
- Modelo base NeuTTS-Air: https://huggingface.co/neuphonic/neutts-air
- Codec NeuCodec: https://huggingface.co/neuphonic/neucodec
- Decodificador ONNX de NeuCodec: https://huggingface.co/neuphonic/neucodec-onnx-decoder
- Paquete mova-tts (GitHub): https://github.com/MykhailoMS/mova-tts
- Herramienta de acentuación naholos: https://github.com/MykhailoMS/naholos
- Watermark Perth: https://github.com/resemble-ai/Perth
