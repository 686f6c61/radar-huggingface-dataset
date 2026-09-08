# masihtabaei/Kokoro-82M

## Resumen
Kokoro es un modelo de texto a voz (TTS) con pesos abiertos y 82 millones de parámetros, desarrollado originalmente por la comunidad hexgrad y disponible también como copia en el repositorio masihtabaei/Kokoro-82M. Su principal propuesta es ofrecer calidad de síntesis de voz comparable a modelos mucho más grandes, pero con un coste computacional y económico muy reducido. La versión v1.0 soporta 8 idiomas y 54 voces, y su licencia Apache 2.0 permite su uso comercial sin restricciones, lo que lo hace atractivo tanto para despliegues en producción como para proyectos personales.

La arquitectura se basa en StyleTTS 2 con ISTFTNet, un diseño decoder-only sin difusión que prioriza la velocidad y la eficiencia. Al tratarse de un modelo TTS, no tiene una ventana de contexto en el sentido de los modelos de lenguaje; procesa el texto de entrada por oraciones. El entrenamiento se realizó exclusivamente con datos de audio permisivos o libres de derechos, con un coste total de aproximadamente 1000 dólares en 1000 horas de GPU A100 80GB, lo que demuestra su eficiencia desde el punto de vista del desarrollo.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 con ISTFTNet (decoder-only, sin difusión) |
| Parametros totales | 82 millones |
| Longitud de contexto | No aplica (modelo TTS; procesa texto por oraciones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 8 idiomas y 54 voces en la versión v1.0 según la model card; el repositorio masihtabaei/Kokoro-82M declara solo inglés en sus metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento
Kokoro utiliza la arquitectura StyleTTS 2, un sistema de síntesis de voz basado en estilos que emplea ISTFTNet como decodificador. A diferencia de otros modelos TTS recientes, no usa difusión ni un codificador separado; es completamente decoder-only. Esto reduce la complejidad computacional y permite una inferencia rápida con tan solo 82 millones de parámetros.

El entrenamiento se realizó exclusivamente con datos de audio permisivos o libres de derechos (dominio público, licencias Apache/MIT y audio sintético generado por modelos TTS cerrados de grandes proveedores). El conjunto total comprende unas pocas cientos de horas de audio y etiquetas fonémicas IPA. El coste total de entrenamiento fue de aproximadamente 1000 dólares, usando 1000 horas de GPU A100 80GB (500 horas para la versión v0.19 y 500 para la v1.0). No se aplican técnicas de RLHF o DPO por tratarse de un modelo de síntesis de voz.

## Capacidades
- Síntesis de voz natural a partir de texto con una tasa de muestreo de 24 kHz.
- Soporte para 54 voces diferentes y 8 idiomas en la versión v1.0.
- Selección de voz mediante identificadores (por ejemplo, `af_heart`).
- Conversión grafema-fonema (G2P) mediante la biblioteca `misaki`, con dependencia de `espeak-ng`.
- Generación rápida y eficiente por su reducido tamaño, adecuada para despliegue en local o en producción.
- Licencia Apache 2.0 que permite uso comercial sin coste de licencia.
- No soporta tool calling, visión, razonamiento ni interacciones conversacionales; es un modelo puramente de texto a voz.

## Casos de uso
- Narración de artículos y noticias: un servicio de lectura de contenido puede convertir noticias o artículos en audio usando las voces de Kokoro, con un coste inferior a 1 dólar por millón de caracteres y una latencia mínima.
- Asistentes de voz de bajo coste: integrado en un agente conversacional, Kokoro puede leer las respuestas generadas por un LLM. Su tamaño de 82M lo hace apto para ejecutarse en local, eliminando el coste de servicios de TTS por API.
- Audiolibros automáticos: con 54 voces, se puede asignar una voz distinta a cada personaje y narrador, generando audiolibros completos a partir de texto plano en 8 idiomas.
- Accesibilidad para personas con discapacidad visual: en un lector de pantalla, Kokoro puede leer páginas web o documentos en tiempo real gracias a su bajo consumo de hardware y su capacidad para desplegarse en dispositivos de gama media.
- Doblaje de vídeos y contenido multimedia: productores pueden generar narraciones para vídeos de YouTube, tutoriales o cuñas publicitarias, seleccionando voces según el tono deseado y localizando el contenido en los 8 idiomas soportados.
- Sistemas de respuesta de voz interactiva (IVR): en centralitas telefónicas, se puede generar dinámicamente el guion de saludos o menús, cambiando el mensaje según la llamada y sin necesidad de pregrabar audio.
- Entornos educativos: plataformas de e-learning pueden convertir textos de cursos en audio para que el estudiante escuche las lecciones con una voz clara y en su idioma, aprovechando la licencia Apache para distribuirlo sin royalties.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se dispone de evaluaciones comparativas como MMLU o HumanEval porque Kokoro es un modelo de síntesis de voz, no un modelo de lenguaje. La única métrica de rendimiento proporcionada es el coste de mercado: menos de 1 dólar por millón de caracteres de entrada, o menos de 0,06 dólares por hora de audio de salida.

## Requisitos de hardware
- VRAM estimada para inferencia: no se proporcionan requisitos oficiales. Dado que el modelo tiene 82 millones de parámetros y el repositorio pesa 0,4 GB, se estima que puede ejecutarse en menos de 1 GB de VRAM en FP16 o FP32.
- GPU recomendadas: no se especifican explícitamente. Cualquier GPU moderna, incluida la serie RTX 30/40, es suficiente. El entrenamiento se realizó en A100 80GB, pero la inferencia es mucho más ligera.
- Compatibilidad con GPUs de consumo: sí. Se espera que funcione en tarjetas como la RTX 3060 o la RTX 4060, e incluso en CPU, gracias a su reducido tamaño.
- Opciones de despliegue: el pipeline de Python con la librería `kokoro`, junto con `misaki` y `espeak-ng`, puede empaquetarse en un contenedor Docker y exponerse como API REST (por ejemplo, con FastAPI). No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Solo se conoce la relación de que 1000 caracteres de entrada equivalen aproximadamente a 1 minuto de audio de salida, pero no son métricas de latencia.

## Comparativa con modelos similares
| Modelo | Parametros | Idiomas | Voces | Licencia | Base |
|---|---|---|---|---|---|
| Kokoro-82M | 82 millones | 8 | 54 | Apache 2.0 | StyleTTS2-LJSpeech |
| StyleTTS2-LJSpeech (modelo base) | No disponible | 1 (inglés) | No disponible | No disponible | No disponible |

No se dispone de datos sobre otros modelos TTS ligeros comparables en la información proporcionada. La comparativa se limita al modelo base StyleTTS2-LJSpeech, que se menciona en los metadatos como base para Kokoro.

## Limitaciones y advertencias
- La model card advierte sobre sitios web falsos que usan "kokoro" en el dominio (por ejemplo, kokorottsai_com, kokorotts_net). No están afiliados con el modelo ni con su autor.
- No se reportan sesgos específicos, pero al estar entrenado en un conjunto limitado de voces y datos sintéticos, puede haber variabilidad en acentos y pronunciaciones.
- En TTS no existe alucinación de texto, pero sí posibles errores de pronunciación de palabras raras, nombres propios o términos extranjeros. El G2P de `misaki` puede fallar si no se instala `espeak-ng`.
- El modelo no mantiene contexto conversacional ni genera texto; es estrictamente un sintetizador de voz.
- En el repositorio concreto masihtabaei/Kokoro-82M, los metadatos declaran solo inglés como idioma, aunque la model card del modelo original afirma 8 idiomas. Esto puede suponer una limitación si se usa esa instancia concreta.
- La licencia Apache 2.0 facilita el uso comercial, siempre que se cumplan las condiciones de la licencia (atribución, aviso de licencia, etc.).
- El entrenamiento incluyó audio sintético de TTS cerrados de grandes proveedores; la calidad de esos datos puede influir en la naturalidad del modelo, aunque no se aportan evaluaciones detalladas.

## Enlaces
- HuggingFace (repositorio descrito): https://huggingface.co/masihtabaei/Kokoro-82M
- HuggingFace (modelo original): https://huggingface.co/hexgrad/Kokoro-82M
- GitHub: https://github.com/hexgrad/kokoro
- Demo: https://hf.co/spaces/hexgrad/Kokoro-TTS
- EVAL.md: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/EVAL.md
- SAMPLES.md: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/SAMPLES.md
- VOICES.md: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Paper StyleTTS 2: https://arxiv.org/abs/2306.07691
- Paper ISTFTNet: https://arxiv.org/abs/2203.02395
- Misaki (G2P): https://github.com/hexgrad/misaki
- Discord: https://discord.gg/QuGxSWBfQy
