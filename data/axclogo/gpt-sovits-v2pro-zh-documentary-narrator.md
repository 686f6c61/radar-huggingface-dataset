# AxcLogo/GPT-SoVITS-v2Pro-zh-Documentary-Narrator

## Resumen

GPT-SoVITS v2Pro zh Documentary Narrator es un modelo de síntesis de voz (text-to-speech) en chino mandarín, publicado por el usuario AxcLogo en Hugging Face. Se trata de un ajuste fino de un solo hablante sobre la arquitectura GPT-SoVITS v2Pro, orientado a generar una voz masculina de mediana edad, grave y de locución documental, pensada para narraciones de documentales de naturaleza, historia y divulgación científica, así como para doblaje de textos largos.

El modelo no es un LLM generativo de propósito general, sino un pipeline TTS de dos etapas: un módulo GPT que convierte texto en tokens semánticos y un módulo SoVITS que transforma esos tokens en forma de onda de audio a 32 kHz. El repositorio ocupa 0,3 GB e incluye los pesos entrenados (`gpt.ckpt` de 148 MB y `sovits.pth` de 129 MB), una referencia de audio de 8,8 segundos y una caché de características precalculadas opcional. La inferencia es completamente local y offline.

Su relevancia actual radica en que demuestra un flujo de trabajo de destilación de voz sintética: la voz no corresponde a ninguna persona real, sino que fue diseñada por descripción textual con Qwen3-TTS VoiceDesign y el corpus de entrenamiento se generó por clonación zero-shot con Qwen3-TTS Base. Esto evita problemas de derechos de imagen y voz, y el autor lo publica bajo licencia Apache-2.0 con la advertencia expresa de identificar el audio como generado por IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2Pro (GPT para texto → tokens semánticos + SoVITS/VITS para tokens →波形) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (segmentación por `text_split_method: cut5`) |
| Tipos de cuantización | no disponible (pesos en FP32; `is_half: False` en la configuración de ejemplo) |
| Idiomas soportados | chino (zh) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ckpt` (GPT) y `.pth` (SoVITS); caché de referencia en `.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de dos etapas de GPT-SoVITS v2Pro. La primera etapa, el módulo GPT (pesos `gpt.ckpt`, 148 MB, entrenado 15 épocas con batch 4 sobre la base `s1v3`), mapea la secuencia de texto a tokens semánticos. La segunda, el módulo SoVITS (pesos `sovits.pth`, 129 MB, 12 épocas con batch 2 y learning rate 1e-4 sobre las bases `s2Gv2Pro`/`s2Dv2Pro`), convierte esos tokens en audio. El pipeline completo emplea `chinese-roberta-wwm-ext-large` para representaciones textuales, `chinese-hubert-base` para características acústicas y `sv/pretrained_eres2netv2w24s4ep4.ckpt` para el embedding de hablante, además del frontend G2PW para el procesamiento de texto chino.

El entrenamiento se realizó sobre un corpus sintético de 926 frases (aproximadamente 2 horas de audio), generado por clonación zero-shot con Qwen3-TTS-12Hz-1.7B-Base a partir de una voz diseñada por Qwen3-TTS-12Hz-1.7B-VoiceDesign según la descripción «voz masculina madura y serena, grave y cálida, estilo de locución, dicción clara, ritmo lento, adecuada para documentales de naturaleza». Los textos provienen de artículos de Wikipedia en chino de temáticas de naturaleza, geografía, historia de la vida, astronomía e historia y humanidades, limpiados y segmentados. Tras un control de calidad mediante reconocimiento inverso con Paraformer, se descartaron las frases con tasa de error de carácter superior al 6 % o velocidad anómala, conservando 733 frases finales. Todo el entrenamiento se ejecutó en una única RTX 4060 de 8 GB con un límite de 5 GB de VRAM.

Una innovación operativa destacable es el archivo `ref_cache.pt`, que contiene las características precalculadas de la referencia (tokens semánticos, espectro lineal,波形 a 16 kHz y embedding de hablante) junto con los hashes SHA-256 de `sovits.pth` y `ref.wav`. Al inyectarlo, el despliegue puede prescindir de cargar los modelos HuBERT y SV y evitar el recálculo del embedding en cada síntesis, con una diferencia máxima de un nivel de cuantización int16 respecto al cálculo en vivo.

## Capacidades

- Síntesis de voz en chino mandarín con timbre masculino grave, ritmo pausado y estilo de locución documental.
- Generación de narraciones de texto largo con segmentación automática (`cut5`) y procesamiento por lotes (`batch_size` configurable).
- Control de la generación mediante semilla (`seed`) para reproducibilidad del audio.
- Inferencia completamente local y offline, sin dependencia de servicios en la nube.
- Salida de audio a 32 kHz en formato de onda int16.
- Inyección opcional de caché de referencia para acelerar el arranque y reducir el consumo de memoria en producción.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.
- No dispone de capacidades de visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada: solo chino; el inglés mezclado se pronuncia de forma mediocre según el propio autor.

## Casos de uso

- Narración de documentales de naturaleza: el timbre grave y el ritmo lento encajan con el estilo de locución requerido; el modelo permite generar pistas de voz para vídeos de divulgación sin depender de un locutor humano.
- Doblaje de artículos largos de divulgación científica: con `text_split_method: cut5` y procesamiento por lotes, puede sintetizar textos extensos de forma continua manteniendo el mismo timbre.
- Producción de audiolibros y pódcast educativos: la ventana de referencia de 8,8 segundos y la caché `ref_cache.pt` permiten arranques rápidos y sesiones largas en hardware modesto.
- Contenido de museos y exposiciones: instalaciones offline que requieren síntesis local sin conexión y con latencia controlada, desplegables en CPU.
- Prototipado de asistentes de voz en chino: sirve como base para experimentar con pipelines TTS antes de invertir en modelos comerciales, gracias a su licencia Apache-2.0.
- Generación de material de accesibilidad: conversión de textos largos a audio para personas con discapacidad visual, con la advertencia de identificar el audio como sintético.
- Pruebas de integración en pipelines de CI/CD de audio: al ser un repositorio pequeño (0,3 GB) y con inferencia en CPU, puede automatizarse en entornos de integración sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta medidas de velocidad de inferencia:

| Entorno | Velocidad |
|---|---|
| Apple M4 (16 GB) CPU, FP32, con `ref_cache.pt` inyectado | Aproximadamente 2,8–3,4 veces tiempo real; carga inicial de unos 20 segundos |
| Apple M4 MPS | Más lento que CPU (aproximadamente 2,6 veces tiempo real) y salida inconsistente con CPU; no recomendado |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó con un límite de 5 GB de VRAM en una RTX 4060 de 8 GB, por lo que la inferencia en GPU debería caber holgadamente en 8 GB.
- GPU recomendadas: RTX 4060 8 GB (validada para entrenamiento), así como cualquier GPU consumer con 8 GB o más; no se han publicado pruebas en A100 o H100.
- Cabe en GPU consumer: sí, al menos en RTX 4060 8 GB; también funciona en CPU (validado en Apple M4).
- Opciones de despliegue: GPT-SoVITS oficial (WebUI o API `TTS_infer_pack`), con soporte de CPU (`device: 'cpu'`, `is_half: False`) y GPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 2,8–3,4 veces tiempo real en CPU Apple M4 con caché inyectada; el modo MPS es más lento y no se recomienda.
- Almacenamiento: repositorio de 0,3 GB; requiere además los modelos base de GPT-SoVITS v2Pro (`chinese-roberta-wwm-ext-large`, `chinese-hubert-base`, `sv/pretrained_eres2netv2w24s4ep4.ckpt`, G2PW).

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Tamaño | Contexto | Notas |
|---|---|---|---|---|---|---|
| GPT-SoVITS v2Pro zh Documentary Narrator | TTS ajustado, un hablante | zh | Apache-2.0 | 0,3 GB (repo) | no disponible | Voz sintética diseñada por descripción; inferencia local |
| GPT-SoVITS v2Pro base | TTS base multi-hablante | zh, en, ja, ko, yue | MIT | no disponible | no disponible | Requiere referencia de audio para clonar voz |
| Qwen3-TTS-12Hz-1.7B-Base | TTS zero-shot | no disponible | Apache-2.0 | 1,7 B | no disponible | Usado por el autor para generar el corpus de entrenamiento |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | TTS por descripción | no disponible | Apache-2.0 | 1,7 B | no disponible | Usado para diseñar la voz de referencia |

## Limitaciones y advertencias

- Solo soporta chino; en textos con mezcla de inglés la pronunciación es deficiente según el propio autor.
- El timbre y la expresividad están acotados por el corpus sintético de entrenamiento; puede haber una pérdida leve respecto a la voz original generada por Qwen3-TTS.
- La lectura de números y caracteres polifónicos depende del frontend G2PW de GPT-SoVITS; algunas lecturas pueden requerir reescritura manual del texto.
- Riesgo de alucinación acústica y de artefactos en pasajes largos o con puntuación atípica; conviene revisar el audio generado antes de publicarlo.
- Es una voz sintética que no corresponde a ninguna persona real; el autor exige identificar el contenido como generado por IA al publicarlo.
- Prohibido su uso para suplantar a personas reales, fraude u otras finalidades ilegales.
- Licencia Apache-2.0 para los pesos del repositorio; GPT-SoVITS es MIT, Qwen3-TTS es Apache-2.0 y los textos de entrenamiento provienen de Wikipedia en chino bajo CC BY-SA 4.0 (no se redistribuyen en el repositorio).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni benchmarks publicados.
- El modo MPS en Apple Silicon produce salidas inconsistentes con CPU y no se recomienda para producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AxcLogo/GPT-SoVITS-v2Pro-zh-Documentary-Narrator
- GPT-SoVITS (repositorio oficial): https://github.com/RVC-Boss/GPT-SoVITS
- Commit de entrenamiento: https://github.com/RVC-Boss/GPT-SoVITS/tree/59c44686f5cb9ffca9d8f1dec8b9c6836a129754
- Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Wikipedia en chino: https://zh.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
