# Esoteric-Nonsense/PocketTTS-GGUF

## Resumen

PocketTTS-GGUF es una conversión al formato GGUF del modelo de síntesis de voz kyutai/pocket-tts, publicada por el usuario Esoteric-Nonsense. Se trata de un modelo TTS (text-to-speech) compacto de aproximadamente 336 millones de parámetros, diseñado para ejecutarse en hardware modesto y generar audio en tiempo real o más rápido que tiempo real en una CPU convencional. La conversión incluye código C++ derivado del proyecto original de Kyutai Labs.

El modelo base, desarrollado por Kyutai, está pensado para síntesis de voz ligera con capacidad de clonación de voz mediante ficheros de referencia en WAV. La comunidad ha creado múltiples adaptaciones lingüísticas sobre esta arquitectura (checo, hindi, coreano, persa, indonesio, estonio, galés, turco, polaco, griego, japonés, chino y multilingüe indio), lo que indica una arquitectura modular y relativamente fácil de reentrenar o ajustar por idioma.

Esta ficha describe la conversión GGUF, que mantiene la licencia CC-BY-SA-4.0 del original. El repositorio ocupa 53,3 GB, lo que sugiere que contiene múltiples variantes de cuantización del mismo modelo. Es relevante para desarrolladores que necesiten integrar TTS local sin depender de servicios en la nube, aunque la ausencia de benchmarks publicados y de documentación detallada en la model card limita la evaluación rigurosa de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en el original kyutai/pocket-tts) |
| Parámetros totales | 336.068.290 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo GGUF de 53,3 GB sugiere múltiples variantes, sin detalle) |
| Idiomas soportados | no disponibles en la model card del GGUF; el modelo base admite adaptaciones por idioma de la comunidad |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (conversión desde el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la model card proporcionada. El modelo base kyutai/pocket-tts es un sistema de síntesis de voz de aproximadamente 336 millones de parámetros, y la conversión GGUF está acompañada de código C++ derivado del repositorio oficial de Kyutai Labs (github.com/kyutai-labs/pocket-tts). La existencia de adaptaciones comunitarias con distintas profundidades (6 capas, 24 capas) indica que la arquitectura es parametrizable en número de capas y que puede reentrenarse por idioma.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card únicamente documenta el proceso de conversión a GGUF y enlaza al repositorio original y a las adaptaciones comunitarias.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz mediante ficheros de referencia WAV (`--voice`), según los ejemplos de la model card.
- Generación de audio más rápida que tiempo real en un ordenador convencional, según el ejemplo en estonio de la model card.
- Soporte de configuraciones por idioma mediante ficheros YAML (`--config hf://...`), lo que permite cargar adaptaciones comunitarias.
- Adaptaciones comunitarias disponibles para checo, hindi, coreano, persa, indonesio, estonio, galés, turco, polaco, griego, japonés, chino y un modelo multilingüe indio (inglés, hindi, maratí, kannada, tamil, malayalam y telugu, con code-mixing).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking, ya que es un modelo TTS.

## Casos de uso

- Narración de artículos y documentos: el modelo convierte texto plano en audio, adecuado para generar versiones habladas de blogs o documentación técnica en local sin enviar contenido a servicios externos.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o pipelines de conversión de texto a voz que requieran baja latencia y ejecución en CPU.
- Asistentes de voz embebidos: al ser un modelo de ~336M de parámetros con conversión GGUF y código C++, puede integrarse en aplicaciones de escritorio o dispositivos con recursos limitados para respuestas habladas.
- Generación de voces para vídeos y pódcast: la clonación de voz mediante WAV de referencia permite mantener una voz consistente en producciones de contenido, siempre que se respete la licencia CC-BY-SA-4.0.
- Prototipado de interfaces conversacionales: útil en fases de desarrollo para validar flujos de voz sin coste de API, sustituyendo después por un servicio en producción si se necesita mayor calidad.
- Localización de contenido a idiomas con adaptaciones comunitarias: usando los ficheros YAML de las variantes (por ejemplo, checo, hindi o japonés), se puede generar audio en esos idiomas con el mismo runtime.
- Sistemas de anuncios o avisos automatizados: generación de mensajes hablados dinámicos (números de pedido, importes, fechas) en aplicaciones de atención al cliente, como muestra el ejemplo en chino de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 336 millones de parámetros, una cuantización de 8 bits ocuparía aproximadamente 336 MB de pesos, y una de 4 bits alrededor de 168 MB, sin contar overhead de runtime; estas cifras son estimaciones por tamaño, no datos publicados.
- GPU recomendadas: no disponibles. El modelo está diseñado para ejecutarse en CPU convencional según la model card (el ejemplo en estonio afirma funcionar más rápido que tiempo real en un ordenador normal).
- ¿Cabe en GPU de consumo? Por tamaño de parámetros, sí cabría en cualquier GPU de consumo moderna, pero no hay requisitos oficiales publicados.
- Opciones de despliegue: el repositorio incluye conversión GGUF y código C++ derivado del proyecto de Kyutai; la model card muestra el uso mediante `uvx pocket-tts generate` con configuraciones remotas de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma oficial; la model card menciona funcionamiento más rápido que tiempo real en un ordenador convencional para el ejemplo en estonio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PocketTTS-GGUF (este) | 336.068.290 | no disponible | CC-BY-SA-4.0 | GGUF | Conversión comunitaria del modelo de Kyutai; sin benchmarks publicados |
| kyutai/pocket-tts (base) | ~336M (según la conversión) | no disponible | no disponible en la información | no disponible | Modelo original de Kyutai Labs; referencia de la conversión |
| Adaptaciones comunitarias (p. ej. pocket-tts-czech, pocket-tts-hindi) | variable (6 o 24 capas en algunos casos) | no disponible | no disponible | no disponible | Ajustes por idioma sobre la misma arquitectura |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados que permitan evaluar la calidad de la síntesis (naturalidad, inteligibilidad, similitud de voz) frente a alternativas.
- La model card no documenta sesgos conocidos, pero al ser un modelo TTS entrenado con datos de voz, puede heredar sesgos de acento, género o prosodia de su corpus de entrenamiento.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; no se documentan salvaguardas en la información disponible.
- La licencia CC-BY-SA-4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para uso comercial propietario.
- El repositorio de 53,3 GB sugiere múltiples cuantizaciones, pero no se detalla cuáles ni sus tamaños individuales.
- No se especifican los idiomas soportados por esta conversión concreta; el uso en otros idiomas depende de las adaptaciones comunitarias enlazadas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día, lo que indica que es una publicación reciente y sin validación comunitaria.
- No se documentan garantías de compatibilidad con runtimes estándar de GGUF (llama.cpp, Ollama) más allá del código C++ propio derivado del proyecto de Kyutai.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Esoteric-Nonsense/PocketTTS-GGUF
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio oficial de Kyutai Labs: https://github.com/kyutai-labs/pocket-tts
- Paper referenciado en los tags (arXiv:2509.06926): https://arxiv.org/abs/2509.06926
- Adaptación al checo: https://huggingface.co/vvolhejn/pocket-tts-czech
- Adaptación al hindi: https://huggingface.co/saryps-labs/pocket-tts-hindi
- Adaptación al coreano: https://huggingface.co/seastar105/pocket-tts-korean-300m
- Adaptación al persa: https://huggingface.co/mehdi-hf/pocket-tts-farsi
- Adaptación al indonesio: https://huggingface.co/anak10thn/pocket-tts-indonesian
- Adaptación al estonio: https://huggingface.co/cbentes/pocket-tts-estonian
- Adaptación al galés: https://huggingface.co/EryriLabs/pocket-tts-cymraeg
- Adaptación al turco: https://huggingface.co/alperiox/pocket-tts-turkish
- Adaptación al polaco: https://huggingface.co/shefowl/pocket-tts-polish-6l
- Adaptación al griego: https://huggingface.co/myned-ai/pocket-tts-greek
- Adaptación al japonés: https://huggingface.co/takuma104/pocket-tts-ja
- Adaptación al chino: https://huggingface.co/hustfyb/PocketTTS-ZH-6L
- Adaptación multilingüe india: https://huggingface.co/Thanushttk/pocket-tts-multilingual
