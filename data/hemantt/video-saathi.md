# Hemantt/video-saathi

## Resumen

Video Saathi (publicado como "Gyan Ghar Video Saathi") es una herramienta de posprocesado de vídeo educativo orientada a creadores de contenido en hindi. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado por el autor: es un pipeline que orquesta varios componentes open source (DeepFilterNet para reducción de ruido, faster-whisper para transcripción, FFmpeg para procesado de audio y vídeo) y los expone mediante una interfaz Gradio desplegable en Google Colab.

El problema que resuelve es concreto: a partir de una grabación de una clase o tutorial, el sistema elimina ruido ambiental (viento, ventiladores, tráfico), recorta silencios, normaliza la sonoridad a -14 LUFS (estándar de YouTube), genera subtítulos SRT en hindi con Whisper large-v3 y, opcionalmente, los incrusta en el vídeo junto con tarjetas de título y tarjetas de texto animadas.

Su relevancia es práctica más que arquitectónica: empaqueta un flujo de trabajo de producción de vídeo educativo en un único notebook ejecutable en una GPU T4 gratuita de Colab, con licencia MIT para el código de orquestación. No hay pesos propios ni modelo entrenado por el autor; el repositorio de Hugging Face no contiene información sobre arquitectura, tamaño o contexto porque no aplica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de herramientas (no es un modelo neuronal único): DeepFilterNet + faster-whisper + FFmpeg + Gradio |
| Parámetros totales | no disponible (depende de los componentes: Whisper large-v3 tiene 1.550 M; DeepFilterNet, del orden de millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 procesa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible (faster-whisper soporta int8, int8_float16, float16 en CTranslate2, pero no se documenta en la model card) |
| Idiomas soportados | hindi (subtítulos); el pipeline en sí es independiente del idioma de la interfaz |
| Licencia | MIT (código del proyecto); componentes con licencias propias: DeepFilterNet (MIT/Apache-2.0), faster-whisper (MIT), FFmpeg (LGPL/GPL según build) |
| Formato de pesos | no aplica al proyecto; los componentes usan pesos propios (ONNX para DeepFilterNet, CTranslate2 para faster-whisper) |

## Arquitectura y entrenamiento

El proyecto no entrena ningún modelo. Es un orquestador que encadena cuatro etapas sobre el audio y el vídeo de entrada: (1) reducción de ruido con DeepFilterNet, un modelo de mejora de voz en dominio espectral; (2) detección y recorte de silencios, presumiblemente mediante análisis de energía o VAD; (3) normalización de sonoridad a -14 LUFS con FFmpeg (filtro `loudnorm`); (4) transcripción con faster-whisper sobre Whisper large-v3, con opción de corregir ortografía mediante la API de Groq si se configura `GROQ_API_KEY` en los secretos de Colab. Finalmente se componen tarjetas de título y de texto animadas sobre el vídeo.

No se documentan datos de entrenamiento, fine-tuning, RLHF ni innovaciones de arquitectura propias. La única decisión técnica destacable es el uso de faster-whisper (implementación en CTranslate2) en lugar de la implementación original de Whisper, lo que reduce el uso de memoria y aumenta el throughput en GPU, y la elección de Whisper large-v3 por su calidad en hindi. La interfaz se sirve con Gradio y el entorno de ejecución previsto es una GPU T4 de Google Colab.

## Capacidades

- Reducción de ruido ambiental en grabaciones de voz (viento, ventiladores, tráfico) mediante DeepFilterNet.
- Recorte automático de silencios en la pista de audio.
- Normalización de sonoridad a -14 LUFS, el estándar de YouTube.
- Transcripción de audio en hindi y generación de subtítulos en formato SRT con Whisper large-v3.
- Incrustación opcional de subtítulos sobre el vídeo.
- Corrección ortográfica opcional de los subtítulos mediante la API de Groq (requiere clave).
- Composición de tarjetas de título animadas y tarjetas de texto (por ejemplo, fórmulas y respuestas) sobre el vídeo.
- Interfaz web Gradio accesible mediante enlace `gradio.live` desde Colab.
- No soporta tool calling, agentes, visión, audio de entrada distinto de voz ni razonamiento multi-paso; no es un modelo generativo de texto.

## Casos de uso

- Producción de clases grabadas para YouTube: el pipeline toma la grabación original, elimina ruido de fondo y normaliza la sonoridad al estándar de la plataforma, de modo que el creador publica sin pasar por un editor de audio.
- Generación de subtítulos en hindi para accesibilidad y SEO: Whisper large-v3 transcribe la clase y el sistema entrega un SRT listo para subir o incrustar, lo que amplía el alcance a usuarios sordos y a búsquedas dentro del vídeo.
- Cursos masivos en línea (MOOC) en hindi: un equipo docente puede procesar lotes de grabaciones con el mismo flujo para homogeneizar volumen y subtítulos entre lecciones.
- Creación de material didáctico con tarjetas de fórmulas: el sistema inserta tarjetas de texto con fórmulas (सूत्र) y respuestas (उत्तर), útil en vídeos de matemáticas y ciencias donde el profesor quiere reforzar visualmente un resultado.
- Canales educativos de bajo presupuesto: al ejecutarse en una GPU T4 gratuita de Colab, permite a creadores sin equipo de edición ni estación de trabajo potente publicar vídeo con calidad de audio consistente.
- Repurposing de grabaciones de clase en bruto: el recorte de silencios y la reducción de ruido convierten una grabación de aula o domicilio en un vídeo publicable sin edición manual.
- Localización de contenido educativo: aunque la tarjeta se centra en hindi, el componente Whisper puede transcribir otros idiomas, lo que permite generar subtítulos para audiencias adicionales con el mismo flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Whisper large-v3 en faster-whisper con cuantización int8_float16 requiere del orden de 2-3 GB de VRAM; DeepFilterNet añade una carga pequeña. La tarjeta indica que el entorno previsto es una GPU T4 (16 GB), lo que deja margen amplio.
- GPU recomendadas: NVIDIA T4 (entorno documentado en Google Colab). Cualquier GPU con al menos 4-6 GB de VRAM debería bastar para el pipeline completo, aunque no se documenta.
- GPU de consumo: cabe en tarjetas consumer modernas (RTX 3060 en adelante) por el reducido tamaño de los componentes, aunque el autor no lo confirma.
- Opciones de despliegue: notebook de Google Colab con Gradio; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplican a este tipo de pipeline).
- Latencia y throughput: no disponibles. Dependen de la duración del vídeo y del hardware; la transcripción con Whisper large-v3 es el cuello de botella.

## Comparativa con modelos similares

| Herramienta | Tipo | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Video Saathi (Hemantt) | Pipeline de posprocesado de vídeo educativo | Hindi (subtítulos) | MIT | Colab + Gradio | Orquesta DeepFilterNet, faster-whisper y FFmpeg |
| Whisper (OpenAI) | Modelo ASR | Multilingüe | MIT | Local, API, múltiples runtimes | Solo transcripción; no hace reducción de ruido ni normalización |
| DeepFilterNet (Rikorose) | Modelo de reducción de ruido | Independiente del idioma | MIT/Apache-2.0 | Local, ONNX | Solo limpieza de audio; no genera subtítulos ni compone vídeo |
| Adobe Podcast Enhance / Auphonic | Servicios comerciales de limpieza y loudness | Múltiples | Propietaria | SaaS | Alternativas comerciales; no open source ni gratuitas a escala |

No se dispone de datos de rendimiento comparativo entre estas herramientas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier evaluación de calidad debe hacerse sobre los componentes subyacentes (Whisper large-v3, DeepFilterNet), no sobre el proyecto.
- La model card está redactada en hindi transliterado y no documenta parámetros técnicos, versiones fijadas de dependencias ni resultados de evaluación.
- El repositorio no contiene pesos, código visible en la información disponible ni pipeline declarado en Hugging Face; el valor del proyecto depende de un notebook externo (`video_saathi.ipynb`) que no se verifica aquí.
- Dependencia de Google Colab: el flujo está pensado para una GPU T4 gratuita, con límites de sesión y posibles interrupciones; no se documenta un despliegue en producción autohospedado.
- La corrección ortográfica opcional requiere una clave de API de Groq, lo que introduce una dependencia de un servicio externo y el envío de transcripciones a terceros.
- La calidad de los subtítulos en hindi depende de Whisper large-v3; pueden aparecer errores en nombres propios, terminología técnica y code-switching hindi-inglés, habitual en clases.
- Riesgo de alucinación de Whisper en segmentos con silencio o ruido residual, especialmente si la reducción de ruido no elimina del todo el fondo.
- Licencia MIT para el código, pero los componentes tienen licencias propias (FFmpeg puede ser GPL según el build), lo que conviene revisar antes de redistribuir.
- No se documentan sesgos, cobertura de dialectos del hindi ni evaluación con hablantes no nativos.

## Enlaces

- Hugging Face: https://huggingface.co/Hemantt/video-saathi
- DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Whisper (OpenAI): https://github.com/openai/whisper
- FFmpeg: https://ffmpeg.org/
- Gradio: https://www.gradio.app/
- Google Colab: https://colab.research.google.com/
- Groq API: https://groq.com/
