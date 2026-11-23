# erayyapagci/balbal-v2-manas

## Resumen

balbal-v2-manas es un modelo de reconocimiento automático del habla (ASR) desarrollado por erayyapagci, especializado en turco e inglés. Se trata de un ajuste fino del modelo `nvidia/stt_en_fastconformer_ctc_large` que incorpora innovaciones propias del autor: un refinador en bucle de 2 capas Transformer, una memoria acústica de product-key y un modelo de lenguaje KenLM de 6-gramos sobre tokens SentencePiece. El resultado es un sistema que funciona íntegramente en CPU y que declara una velocidad de 123× tiempo real con 8 hilos.

El modelo resuelve el problema del reconocimiento de voz en turco, un idioma con relativamente pocos recursos ASR de calidad, especialmente en dominios conversacionales como llamadas telefónicas. Con 313,3 millones de parámetros totales, de los cuales 192 millones corresponden a la tabla de memoria (de la que solo se leen algunas filas por fotograma), el modelo logra un WER del 8,20% en Mu-Bench turco (llamadas telefónicas) y del 4,06% en FLEURS turco. También mantiene un rendimiento competitivo en inglés, con un WER medio del 8,67% en los conjuntos de test del English Open ASR Leaderboard.

La relevancia actual del modelo radica en su capacidad de ejecutarse en CPU con alta eficiencia, lo que lo hace adecuado para despliegues en dispositivos sin GPU, aplicaciones Android (el autor menciona una app) y entornos de producción con restricciones de hardware. El modelo se distribuye en formato ONNX y con licencia comunitaria propia (balbal-community-license-1.1), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CTC con refinador en bucle (2 capas Transformer, 3 pasadas) y memoria acústica product-key |
| Parametros totales | 313,3M (192,0M corresponden a la tabla de memoria) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio en fragmentos de 30 s; marcos de 40 ms con subsampling 4x) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | balbal-community-license-1.1 (licencia comunitaria propia, no comercial estándar) |
| Formato de pesos | ONNX |
| Modelo base | nvidia/stt_en_fastconformer_ctc_large |
| Vocabulario | SentencePiece 2.048 piezas + token CTC blank |
| Modelo de lenguaje | KenLM de 6-gramos sobre tokens SentencePiece |
| Entrada de audio | 80 mel, 4x subsampling (marcos de 40 ms) |
| Salida | Texto con mayúsculas, puntuación y marcas de tiempo por palabra; números en dígitos mediante ITN (se puede desactivar con `--no-itn`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer-CTC de NVIDIA, con 18 capas de encoder, dimensión de modelo 512 y 80 filtros mel con subsampling 4x (marcos de 40 ms). Sobre la salida del encoder se añade un refinador en bucle de 2 capas Transformer con anchura 256 que realiza 3 pasadas; cada pasada toma como entrada la distribución CTC de la pasada anterior, lo que permite refinar iterativamente las predicciones. Además, se incorpora una memoria acústica de product-key con 1000×1000 subclaves, 8 cabezas, top-32, dimensión de valor 192 y contexto de 3 fotogramas. Esta memoria contiene 192 millones de parámetros, aunque solo se leen unas pocas filas por fotograma, lo que mantiene la eficiencia computacional.

El entrenamiento se realizó sobre aproximadamente 7.000 horas de audio, según indica el autor. No se especifica en la información disponible la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). La decodificación utiliza un modelo de lenguaje KenLM de 6-gramos sobre las piezas SentencePiece, lo que ayuda a mejorar la precisión en la transcripción. El modelo se distribuye en formato ONNX, lo que facilita su despliegue en CPU y en entornos sin GPU. No se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá del refinador en bucle y la memoria product-key.

## Capacidades

- Reconocimiento automático del habla en turco e inglés, con salida de texto con mayúsculas, puntuación y marcas de tiempo por palabra.
- Manejo de audio de hasta 30 segundos por fragmento; audios más largos se dividen en trozos de 30 s.
- Normalización de texto inversa (ITN) que convierte números hablados a dígitos; se puede desactivar con `--no-itn` para mantener las palabras habladas.
- Decodificación con KenLM de 6-gramos que mejora la fluidez y precisión de las transcripciones.
- Ejecución eficiente en CPU: 123× tiempo real con 8 hilos en un AMD Ryzen AI Max+ 395.
- No se mencionan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.
- Capacidades multilingües limitadas a turco e inglés.
- No se indica soporte para modo "thinking" ni otras capacidades especiales.

## Casos de uso

- Transcripción de llamadas telefónicas en turco: el modelo logra un WER del 8,20% en Mu-Bench tr-TR, lo que lo hace adecuado para centros de contacto que necesiten transcribir conversaciones telefónicas con precisión, incluso en entornos con ruido y habla espontánea.
- Subtitulado y transcripción de reuniones en inglés: con un WER del 13,31% en AMI (meetings) y del 5,20% en TED-LIUM 3, puede emplearse para generar actas o subtítulos de reuniones y charlas, aprovechando su capacidad de procesar audio en fragmentos de 30 s.
- Aplicaciones móviles de dictado y notas de voz: al ejecutarse en CPU con 123× tiempo real, es viable integrarlo en una app Android (el autor menciona una) para dictado offline sin depender de la nube.
- Análisis de contenido audiovisual en inglés: con WER del 2,97% en LibriSpeech clean y 6,45% en other, puede transcribir podcasts, entrevistas y vídeos para indexación y búsqueda.
- Atención al cliente automatizada en turco: la transcripción precisa de llamadas permite alimentar sistemas de análisis de sentimiento o extracción de entidades en centros de soporte, con la ventaja de funcionar en CPU y reducir costes de infraestructura.
- Investigación lingüística y creación de corpus: el modelo puede transcribir grandes volúmenes de audio turco e inglés para construir corpus anotados, gracias a su velocidad en CPU y a la salida con marcas de tiempo por palabra.
- Sistemas de accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva, ejecutándose localmente en dispositivos sin GPU.

## Benchmarks y rendimiento

Los resultados declarados por el autor (no verificados) son los siguientes:

| Conjunto de datos | Idioma | Métrica | Valor |
|---|---|---|---|
| Mu-Bench (tr-TR, llamadas telefónicas) | tr | WER | 8,20 |
| Mu-Bench (tr-TR, llamadas telefónicas) | tr | sigWER | 14,89 |
| FLEURS (turco) | tr | WER | 4,06 |
| FLEURS (turco) | tr | CER | 1,21 |
| LibriSpeech (clean) | en | WER | 2,97 |
| LibriSpeech (other) | en | WER | 6,45 |
| AMI (meetings, ihm) | en | WER | 13,31 |
| Earnings-22 | en | WER | 15,61 |
| Vox Populi (en) | en | WER | 7,82 |
| GigaSpeech | en | WER | 12,30 |
| SPGI Speech | en | WER | 5,73 |
| TED-LIUM 3 | en | WER | 5,20 |

El autor indica un WER medio del 8,67% en los conjuntos de test del English Open ASR Leaderboard. La velocidad en CPU es de 123× tiempo real (segundos de audio por segundo de procesamiento) con batch 1 y 8 hilos en un AMD Ryzen AI Max+ 395. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible más allá de la tabla del autor que compara con balbal-v2 (45M de parámetros, 236× tiempo real), pero no se proporcionan los valores de WER de ese modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo está diseñado para CPU; en GPU, al tener 313,3M de parámetros, en FP32 ocuparía aproximadamente 1,25 GB, y en FP16 unos 0,63 GB, aunque no se especifican cuantizaciones).
- GPU recomendadas: no disponible; el modelo se distribuye en ONNX y está optimizado para CPU.
- ¿Cabe en GPU consumer? Sí, por tamaño (313M de parámetros) cabría en cualquier GPU consumer con al menos 2 GB de VRAM, pero no se proporcionan datos de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (formato principal), con soporte para CPU; el autor menciona una app Android y un demo en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput: 123× tiempo real en CPU con 8 hilos (AMD Ryzen AI Max+ 395), batch 1. No se proporcionan datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER turco (FLEURS) | WER inglés (LibriSpeech clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| balbal-v2-manas | 313M | no disponible (fragmentos de 30 s) | 4,06 | 2,97 | balbal-community-license-1.1 | Hugging Face (ONNX) |
| balbal-v2 | 45M | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| nvidia/stt_en_fastconformer_ctc_large | no disponible | no disponible | no disponible (solo inglés) | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a los datos del autor. No se han encontrado otros modelos ASR turco-inglés comparables en la información disponible.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- El modelo solo soporta turco e inglés; no se indica soporte para otros idiomas.
- El audio se procesa en fragmentos de 30 segundos, lo que puede afectar a la coherencia en transcripciones de audio muy largo si no se solapan correctamente.
- La licencia balbal-community-license-1.1 es una licencia comunitaria propia; es necesario revisar sus términos para uso comercial, ya que puede imponer restricciones.
- No se proporcionan datos sobre sesgos conocidos, riesgo de alucinación (en ASR, errores de sustitución) ni limitaciones específicas de dominio más allá de los benchmarks.
- El rendimiento en llamadas telefónicas turcas (8,20% WER) es peor que en habla leída (4,06% en FLEURS), lo que indica mayor dificultad en dominios conversacionales ruidosos.
- No se especifican requisitos de hardware para GPU ni cuantizaciones disponibles, lo que limita la planificación de despliegues en otros entornos.
- La fecha de creación del repositorio (2026-10-29) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o una fecha programada; conviene verificar la disponibilidad real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erayyapagci/balbal-v2-manas
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_ctc_large
- Modelo hermano balbal-v2: https://huggingface.co/erayyapagci/balbal-v2
- Página del modelo, demo y app Android: https://erayy.com/balbal/
- Versión en turco: https://erayy.com/tr/balbal/
- Código (Apache 2.0): https://github.com/erayyap/balbal
