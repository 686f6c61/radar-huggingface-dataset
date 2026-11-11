# phonsobon/khmer-asr-Conformer-CTC-v1

## Resumen

Khmer ASR: Conformer-CTC v1 es un modelo de reconocimiento automático del habla (ASR) para jemer (khmer), desarrollado desde cero por PhonSobon y publicado en Hugging Face. Se trata de un encoder Conformer-CTC de tan solo 12,3 millones de parámetros que recibe audio mono a 16 kHz y produce texto en escritura jemer, además de letras latinas para palabras en inglés intercaladas en el habla. No emplea pesos preentrenados ni es un fine-tune de otro modelo: el autor lo entrenó íntegramente sobre un corpus propio de unos 56,3 horas de audio jemer.

El modelo destaca por su eficiencia: con decodificación CTC voraz (sin modelo de lenguaje) alcanza aproximadamente 172 veces el tiempo real en una GPU de portátil (NVIDIA RTX 500 Ada) y 68 veces en CPU, lo que lo hace viable en entornos con recursos muy limitados. Su tamaño reducido (repo de 2,6 GB, checkpoint principal `best.pt`) y su API de inferencia autocontenida en un único archivo Python facilitan el despliegue sin infraestructura pesada.

Es relevante ahora porque el jemer es un idioma con pocos recursos ASR de calidad y este modelo ofrece una alternativa ligera y abierta, con soporte para code-switching jemer-inglés y datos gubernamentales y de fechas/números. No obstante, el propio autor advierte que el CER de validación (0,93 %) es optimista y que en audio de fuentes nuevas cabe esperar un CER del 20-40 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (`conformer_s`): 16 capas, d_model 176, 4 cabezas, kernel 31, atención RoPE |
| Parámetros totales | 12,3 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio en trozos de 30 s; 4x subsampling, 40 ms por frame de salida) |
| Tipos de cuantización | int8 dinámica (probada por el autor); fp16 en entrenamiento; no se documentan otras |
| Idiomas soportados | jemer (km) e inglés (en), con code-switching jemer-inglés |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`: `best.pt`, `last.pt`); vocabulario en `vocab.json` |

## Arquitectura y entrenamiento

El modelo es un encoder Conformer-CTC de configuración pequeña (`conformer_s`): 16 capas, dimensión de modelo 176, 4 cabezas de atención, kernel de convolución 31 y atención con embeddings rotatorios (RoPE). La entrada es audio mono a 16 kHz convertido a log-mel de 80 dimensiones con salto de 10 ms y subsampling 4x, de modo que cada frame de salida cubre 40 ms. La salida es un vocabulario de 141 tokens que incluye escritura jemer, dígitos jemeres ០–៩ y 0–9, letras a–z, espacio y apóstrofo, además de algunos caracteres tailandeses residuales provenientes de los datos. La decodificación es CTC voraz, sin modelo de lenguaje externo.

El entrenamiento se realizó desde cero sobre 18 conjuntos de datos de habla jemer del propio autor, unas 76 horas antes de deduplicar; tras filtrar por duración y longitud se usaron 25.339 clips (56,3 h) para entrenamiento y 1.635 clips (4,2 h) para validación. Los datos cubren jemer general, code-switching jemer-inglés, habla gubernamental y fechas/números; las letras inglesas representan el 6,5 % de los caracteres de entrenamiento. Se aplicó normalización de texto (Unicode NFC, eliminación de espacios de ancho cero, minúsculas y eliminación de puntuación y símbolos como ។ ៕ ៖ , . ? ៛ $ …), por lo que el modelo nunca genera puntuación. El entrenamiento usó 2x NVIDIA T4 en Kaggle con precisión mixta fp16, AdamW (weight decay 1e-3), learning rate pico de 1e-3 tras 2.000 pasos de warmup lineal y decaimiento inverse square, con aproximadamente 2,9 minutos por época.

## Capacidades

- Reconocimiento de voz a texto en jemer, incluyendo escritura jemer y dígitos jemeres.
- Transcripción de palabras en inglés intercaladas en habla jemer (code-switching), con salida en letras latinas.
- Manejo de audio de hasta 30 s por fragmento; audios más largos se cortan automáticamente en piezas de 30 s.
- Entrada de audio en formatos wav, flac, mp3 y ogg; m4a, aac, 3gp, opus y webm con la dependencia opcional `av`.
- Acepta también arrays numpy float32 a 16 kHz directamente.
- Exposición de log-probabilidades CTC crudas (`asr.log_probs(wav)`) para permitir beam search propio o integración con un modelo de lenguaje externo.
- Decodificación voraz CTC sin necesidad de modelo de lenguaje.
- Inferencia en GPU o CPU (selección automática, con opción explícita `--device cpu`).
- Demo web con Gradio (subida de archivo o micrófono) y uso por línea de comandos.
- No soporta tool calling, agentes, visión, audio de salida ni modo de razonamiento; es exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en jemer: el modelo procesa audio de hasta 30 s por fragmento y encadena fragmentos, lo que permite transcribir grabaciones largas en CPU con una velocidad aproximada de 68x tiempo real, adecuado para procesamiento por lotes en servidores modestos.
- Subtitulado automático de vídeo en jemer: gracias a su velocidad (172x en GPU de portátil) y a su bajo consumo de VRAM, puede integrarse en pipelines de generación de subtítulos casi en tiempo real para contenido grabado.
- Atención al cliente y centros de llamadas: transcripción de llamadas en jemer para análisis de calidad, búsqueda de texto en grabaciones y generación de actas, con la ventaja de que el modelo cabe en hardware de bajo coste y no requiere GPU dedicada.
- Procesamiento de documentos gubernamentales hablados: el entrenamiento incluye varios conjuntos de habla gubernamental, lo que lo hace adecuado para transcribir sesiones parlamentarias, anuncios oficiales o comunicados leídos en voz alta.
- Normalización de fechas y números dictados: los datasets de fechas y números del entrenamiento permiten usar el modelo para transcribir dictados de fechas, cifras y cantidades en jemer, útil en formularios por voz o sistemas de registro.
- Investigación en ASR de bajos recursos: al ser un modelo pequeño, abierto en pesos y con código de inferencia autocontenido, sirve como línea base reproducible para experimentos de ASR en jemer y para comparar técnicas de decodificación (beam search, modelos de lenguaje) sobre las log-probabilidades CTC expuestas.
- Integración en aplicaciones móviles o de borde: con 12,3 M de parámetros y cuantización int8 dinámica (78x tiempo real en CPU de portátil), es candidato para transcripción local en dispositivos sin conexión.

## Benchmarks y rendimiento

Resultados publicados por el autor (medidos en la época 84):

| Evaluación | CER | CER (sin espacios) | WER |
|---|---|---|---|
| Validación, 1.635 clips / 4,2 h (reservado de los datasets de entrenamiento) | 0,93 % | 0,92 % | 4,2 % |
| 4 clips no vistos de `phonsobon/khmer-asr-compare-eval` (noticias leídas, locución) | 25,1 % | 24,6 % | no disponible* |

\* Las referencias de este conjunto están escritas casi sin espacios, por lo que el WER no es significativo.

Velocidad con decodificación voraz, batch 1 (clip de 24,6 s):

| Dispositivo | Tiempo | Velocidad |
|---|---|---|
| NVIDIA RTX 500 Ada (GPU de portátil) | 143 ms | 172x tiempo real |
| CPU de portátil, fp32 (script standalone, clip de 8,8 s) | 130 ms | 68x tiempo real |
| CPU de portátil, cuantización dinámica int8 | 315 ms | 78x tiempo real |

El autor advierte explícitamente que el CER de validación es optimista porque el conjunto de validación es un 5 % aleatorio de los mismos datasets (mismos hablantes, micrófonos y estilo de lectura). En audio de otras fuentes cabe esperar un CER de aproximadamente 20-40 %, con errores principalmente en palabras mal escritas que suenan parecido a las correctas (por ejemplo ប្រវត្តិសាស្ត្រ → ប្រវត្តិសតន).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 12,3 M de parámetros, el checkpoint en fp32 ocupa del orden de decenas de MB y la inferencia cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: el autor reporta pruebas en NVIDIA RTX 500 Ada (GPU de portátil) y entrenamiento en 2x NVIDIA T4; cualquier GPU moderna (RTX 3060/4090, A100, H100) es sobrada para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU; también funciona en CPU.
- Opciones de despliegue: script standalone `khmer_asr_conformer.py` (PyTorch), línea de comandos, demo Gradio (`app.py`), y uso programático vía `KhmerASR.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este formato).
- Latencia y throughput: 143 ms para un clip de 24,6 s en GPU de portátil (172x tiempo real); 130 ms para 8,8 s en CPU fp32 (68x tiempo real); 315 ms con int8 dinámica (78x tiempo real).

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ASR de jemer comparables en la documentación proporcionada; los datos de comparación no están disponibles. El propio autor mantiene una versión anterior del mismo modelo (`phonsobon/khmer-asr-Conformer-CTC`) y un conjunto de evaluación (`phonsobon/khmer-asr-compare-eval`), pero no se aportan métricas de modelos alternativos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Khmer ASR: Conformer-CTC v1 (este) | 12,3 M | no disponible | no disponible | Hugging Face |
| Alternativas de ASR en jemer | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El CER de validación (0,93 %) no es representativo: en audio de fuentes nuevas cabe esperar un CER del 20-40 %, según el propio autor.
- El modelo nunca genera puntuación: el texto de entrenamiento se normalizó eliminando puntuación y símbolos, por lo que la salida carece de signos como ។, ៕, ៖, comas o puntos.
- Presencia de caracteres tailandeses residuales en el vocabulario, provenientes de los datos de entrenamiento, que pueden aparecer en la salida.
- Errores frecuentes en palabras de sonido similar pero escritura distinta (sustituciones a nivel de carácter que producen palabras mal escritas).
- El conjunto de validación comparte hablantes, micrófonos y estilo de lectura con el entrenamiento, lo que infla las métricas; no se ha evaluado de forma independiente y amplia.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; es un caveat crítico para producción.
- El modelo está entrenado principalmente con habla jemer y algo de inglés intercalado; no se documenta cobertura de otros idiomas ni de acentos o dialectos específicos.
- El procesamiento de audio se limita a fragmentos de 30 s; audios más largos se cortan, lo que puede introducir errores en las fronteras.
- No dispone de modelo de lenguaje en la decodificación por defecto (CTC voraz), lo que limita la corrección contextual; el autor ofrece log-probabilidades para añadir uno propio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phonsobon/khmer-asr-Conformer-CTC-v1
- Versión anterior del modelo: https://huggingface.co/phonsobon/khmer-asr-Conformer-CTC
- Conjunto de evaluación: https://huggingface.co/phonsobon/khmer-asr-compare-eval
- Perfil del autor: https://huggingface.co/phonsobon
- Paper de referencia de la arquitectura Conformer: https://arxiv.org/abs/2005.08100
