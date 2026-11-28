# kvark128/PocketTTS-RU-fast-phonon

## Resumen

PocketTTS-RU-fast-phonon es una adaptación de la modelo rusa de síntesis de voz ArtShtorm/Shtorm-PocketTTS-RU v2 fast, publicada por el usuario kvark128, para que pueda cargarse directamente con el motor de inferencia ptts (Phonon, desarrollado por Gradium). No se trata de un reentrenamiento ni de un ajuste fino: los pesos originales se mantienen intactos y únicamente se han convertido al formato de checkpoint que espera el motor (renombrado de un tensor en safetensors, más la incorporación de `config.json` y `tokenizer.json`). Adicionalmente se ofrecen versiones cuantizadas q8 y q4k en formato GGUF.

El modelo resuelve el problema de desplegar una TTS rusa de tipo "pocket" en entornos sin PyTorch, ya que ptts ejecuta la inferencia en Rust y permite funcionar en CPU con requisitos de memoria reducidos. Con 109.502.146 parámetros y un repositorio de 0,8 GB, está pensado para lectura de libros y clonación de voz a partir de una referencia corta, no para conversión de voz en tiempo real de baja latencia ni para otros idiomas.

Su relevancia actual radica en la combinación de licencia permisiva (CC BY 4.0), soporte de cuantización GGUF y un runtime ligero que evita la dependencia del stack de PyTorch, lo que facilita su integración en aplicaciones de escritorio, servidores modestos o pipelines de generación de audiolibros en ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz de tipo pocket-tts, según la model card; no se detalla la topología interna) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 y q4k en formato GGUF; pesos originales en safetensors |
| Idiomas soportados | ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (checkpoint ptts) y GGUF (q8, q4k) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card indica que deriva de ArtShtorm/Shtorm-PocketTTS-RU v2 fast, una modelo rusa para pocket-tts (proyecto Kyutai) orientada a la lectura de libros y con clonación de voz a partir de una referencia corta. El autor de esta adaptación no ha modificado los pesos: solo ha renombrado un tensor en safetensors y ha añadido `config.json` y `tokenizer.json` para que el motor ptts pueda cargar el checkpoint. También ha generado versiones cuantizadas q8 y q4k en GGUF.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). El motor de inferencia ptts (gradium-ai/xn-ptts) ejecuta la inferencia en Rust sin PyTorch, lo que constituye la principal particularidad de despliegue de esta adaptación.

## Capacidades

- Síntesis de voz (text-to-speech) en ruso a partir de texto con acentuación silábica explícita en los ejemplos de la model card.
- Clonación de voz mediante una referencia de audio corta (`clone_voice`), con consentimiento del propietario de la voz según la licencia.
- Generación de audio en formato WAV (método `save`) y en streaming por fragmentos (método `stream`), lo que permite codificar a MP3 en tiempo real.
- Control de temperatura de muestreo (`temperature`) y selección de cuantización (`quant="q4k"`, q8, etc.).
- Ejecución en CPU (`device="cpu"`) con ajuste del número de hilos (`set_num_threads`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada (salvo la referencia de voz) ni multilingüismo más allá del ruso.

## Casos de uso

- Audiolibros en ruso: el modelo original está "заточенная под чтение книг" (orientada a la lectura de libros); con 109 M de parámetros y cuantización q4k puede generar capítulos completos en CPU, codificando el flujo directamente a MP3 con lameenc.
- Clonación de voz para narración personalizada: a partir de un `my_voice.wav` de 16 bits se registra una voz con `clone_voice` y se reutiliza en múltiples textos, útil para podcasts o contenido editorial con una voz consistente.
- Generación de audio en streaming de bajo coste: el método `stream` devuelve fragmentos PCM que pueden enviarse a un codificador (MP3, AAC) conforme se producen, adecuado para previsualizaciones o reproducción progresiva en aplicaciones de escritorio.
- Integración en aplicaciones sin PyTorch: al ejecutarse con ptts sobre Rust (`pip install ptts`), encaja en servicios o utilidades donde instalar el stack completo de PyTorch no es viable por tamaño o política de dependencias.
- Despliegue en hardware modesto: con cuantización q4k y ejecución en CPU, puede correr en portátiles o servidores pequeños sin GPU, reduciendo el coste de infraestructura frente a modelos TTS de mayor tamaño.
- Accesibilidad y lectura asistida: conversión de texto ruso a voz para lectores de pantalla o herramientas de accesibilidad, con la ventaja de que el modelo es ligero y de licencia permisiva para uso comercial con atribución.
- Preprocesado de material editorial: generación de borradores de audio para revisión de pronunciación y prosodia antes de una locución humana definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 109,5 M de parámetros, los pesos en safetensors ocupan del orden de 0,4 GB en fp32/fp16 y menos en q8/q4k (el repositorio completo, incluyendo todas las variantes, es de 0,8 GB).
- GPU recomendadas: no se especifican; el ejemplo de la model card usa `device="cpu"`, por lo que la GPU no es requisito.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, pero no hay datos publicados de soporte ni de rendimiento en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: motor ptts (Rust, `pip install ptts`), con soporte de cuantizaciones GGUF q8 y q4k; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. El autor recomienda ajustar `set_num_threads` experimentalmente (el ejemplo usa 2 hilos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PocketTTS-RU-fast-phonon | 109.502.146 | no disponible | ru | CC BY 4.0 | safetensors, GGUF (q8, q4k) | Adaptación para el motor ptts; clonación de voz |
| ArtShtorm/Shtorm-PocketTTS-RU v2 fast | no disponible | no disponible | ru | no disponible en la información | no disponible | Modelo base original; misma funcionalidad TTS rusa y clonación de voz |
| Otros modelos TTS rusos | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta ruso; no hay evidencia de capacidades multilingües.
- No se documentan sesgos concretos, pero al ser un modelo TTS entrenado con datos de voz rusos es esperable un sesgo de acento, registro y prosodia hacia las voces del corpus original (no cuantificado en la información disponible).
- Riesgo de alucinación acústica: como todo modelo generativo de voz, puede producir pronunciaciones incorrectas, artefactos o prosodia anómala, especialmente con texto sin acentuación silábica explícita o con nombres propios y abreviaturas.
- La clonación de voz está limitada a casos con consentimiento del propietario de la voz, según la propia model card; el uso indebido puede vulnerar derechos de imagen y voz.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero exige citar la autoría; conviene revisar las condiciones del modelo base (ArtShtorm/Shtorm-PocketTTS-RU), cuya licencia no se detalla en la información disponible.
- Dependencia de un motor poco extendido (ptts/Phonon) y de la librería `ptts`; no hay soporte documentado en ecosistemas como transformers, vLLM u Ollama.
- Sin benchmarks publicados: no es posible comparar calidad objetiva (MOS, WER de transcripción inversa) frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kvark128/PocketTTS-RU-fast-phonon
- Modelo base: https://huggingface.co/ArtShtorm/Shtorm-PocketTTS-RU
- Motor ptts (gradium-ai/xn-ptts): https://github.com/gradium-ai/xn-ptts
