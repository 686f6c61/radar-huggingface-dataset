# meeeetxd/pocket-tts-gujarati

## Resumen

Pocket TTS Gujarati es un ajuste fino (finetune) comunitario del modelo de síntesis de voz Pocket TTS de Kyutai, desarrollado por el usuario meeeetxd y especializado en el idioma gujarati. El modelo base, Pocket TTS, es un sistema de texto a voz (TTS) ligero basado en un "flow LM" (modelo de lenguaje de flujo), y esta versión destila un modelo profesor de 24 capas en un modelo estudiante de solo 6 capas, con unos 109,5 millones de parámetros y unos 438 MB de pesos. Su propósito es ofrecer síntesis de voz en gujarati con clonación de voz a partir de un audio de referencia corto, todo ello pensado para ejecutarse en CPU.

Su relevancia radica en que la mayoría de los sistemas TTS de calidad se centran en inglés y en unas pocas lenguas de gran alcance, dejando lenguas como el gujarati (más de 50 millones de hablantes) sin soluciones locales y ligeras. Este modelo permite generar audio a 24 kHz en un solo paso de decodificación, sin necesidad de GPU, lo que lo hace accesible para despliegues en hardware modesto. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow LM (Pocket TTS), 6 capas, destilado de un profesor de 24 capas |
| Parametros totales | 109.502.146 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar, ~438 MB) |
| Idiomas soportados | Gujarati (gu) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (incluye pesos del codec de Kyutai, también bajo CC-BY-4.0) |

## Arquitectura y entrenamiento

El modelo es un "flow LM" de 6 capas obtenido por destilación de conocimiento desde un modelo profesor de 24 capas (kyutai/pocket-tts). La destilación reduce drásticamente el coste de inferencia, permitiendo la decodificación en un solo paso con temperatura 0.3, sin necesidad de muestreos iterativos costosos. La "guidance" (guía del flujo) ya viene incorporada en los pesos, por lo que no requiere configuración adicional en tiempo de generación. El tokenizador es SentencePiece, con foco específico en el gujarati, y el pipeline incluye los pesos del codec de audio de Kyutai para producir salida a 24 kHz.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni los procedimientos concretos de destilación en la información disponible. El modelo base es el finetune de Kyutai descrito en el paper de Pocket TTS (arXiv:2509.06926).

## Capacidades

- Síntesis de texto a voz en gujarati con salida de audio a 24 kHz.
- Clonación de voz a partir de un archivo WAV corto como prompt de referencia.
- Generación en un solo paso de decodificación (guidance precalculada, temperatura 0.3).
- Ejecución en CPU sin requisitos de GPU.
- Uso mediante la librería Python `pocket-tts` o la herramienta CLI vía `uvx`.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni capacidades multimodales más allá de texto a voz.

## Casos de uso

- Locución de contenido educativo en gujarati: puede convertir material escrito en audio para plataformas de e-learning dirigidas a estudiantes gujaratíes, con coste de cómputo mínimo al ejecutarse en CPU.
- Asistentes de voz en atención al ciudadano: integración en IVR o chatbots con voz en gujarati, generando respuestas de audio en tiempo casi real sin infraestructura de GPU.
- Clonación de voz para personalización de marca: a partir de un WAV corto de un locutor, se genera una voz consistente para anuncios, podcasts o mensajes corporativos en gujarati.
- Accesibilidad: lectura de documentos, noticias o interfaces para personas con dificultades visuales que consumen contenido en gujarati.
- Prototipado y desarrollo local: al pesar solo 438 MB y funcionar en CPU, es idóneo para pruebas en portátiles y pipelines de CI sin hardware especializado.
- Producción de contenido audiovisual regional: generación de voz para vídeos de YouTube, redes sociales o doblaje ligero en gujarati con flujo de trabajo scriptable mediante CLI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplicable; el dispositivo previsto es la CPU. Los pesos ocupan unos 438 MB en disco y un consumo de memoria RAM comparable durante la inferencia.
- GPU recomendadas: no necesarias; el modelo está diseñado para CPU. Aun así, podría ejecutarse en GPU si la librería lo permite (no se especifica).
- Consumer hardware: cabe sin problemas en cualquier ordenador moderno; no requiere GPU dedicada.
- Despliegue: librería Python `pocket-tts` (`pip install pocket-tts`) o CLI vía `uvx pocket-tts generate`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la decodificación en 1 paso sugiere baja latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idiomas | Licencia | Dispositivo |
|---|---|---|---|---|---|
| pocket-tts-gujarati (este) | ~109,5 M | TTS + clonación de voz | Gujarati | CC-BY-4.0 | CPU |
| kyutai/pocket-tts (base) | no disponible (24 capas) | TTS + clonación de voz | multilingüe (no disponible en detalle) | CC-BY-4.0 | CPU |
| Moshi / TTS de Kyutai (familia) | no disponible | TTS | no disponible | no disponible | no disponible |

No se conocen otros modelos TTS comunitarios específicos para gujarati con detalles técnicos comparables publicados en la información disponible.

## Limitaciones y advertencias

- Modelo monolingüe: solo genera voz en gujarati; no está indicado para otras lenguas.
- Es un finetune comunitario con 0 descargas registradas en el momento de la ficha: no hay validación amplia de la comunidad ni evaluaciones publicadas de calidad, prosodia o inteligibilidad.
- No se han publicado benchmarks ni comparaciones de calidad de voz (MOS, WER de resíntesis), por lo que la calidad debe evaluarse caso por caso antes de usar en producción.
- La clonación de voz plantea riesgos éticos y legales (suplantación, deepfakes de audio); debe usarse solo con consentimiento del propietario de la voz.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución.
- La model card indica `inference: false` en Hugging Face: no hay inference API hosted; hay que descargar los pesos y ejecutar localmente.
- Los paths del config son relativos: el repo debe descargarse completo y ejecutarse desde su carpeta, o usar la dirección `hf://` sabiendo que `model.safetensors` y `tokenizer.model` deben estar en el directorio de trabajo.
- Riesgo de errores de pronunciación en textos con mezcla de idiomas (por ejemplo, términos técnicos en inglés) al ser un modelo especializado solo en gujarati.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/meeeetxd/pocket-tts-gujarati
- Modelo base (Kyutai Pocket TTS): https://huggingface.co/kyutai/pocket-tts
- Paper de Pocket TTS: https://arxiv.org/abs/2509.06926
- Repositorio de código: https://github.com/kyutai-labs/pocket-tts
- Perfil del autor: https://www.linkedin.com/in/meet-patel21
