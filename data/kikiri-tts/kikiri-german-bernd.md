# kikiri-tts/kikiri-german-bernd

## Resumen

El modelo `kikiri-tts/kikiri-german-bernd` es una voz alemana de un solo hablante ("Bernd") para el sistema de síntesis de voz Kokoro-82M, desarrollado por la organización Kikiri TTS. Se trata de un ajuste fino en dos etapas (Stage 2) sobre el modelo base `kikiri-tts/kikiri-german-base-51speakers-synthetic`, que a su vez se entrenó sobre un conjunto de voces sintéticas en alemán. El resultado es un paquete de pesos listo para usar con el motor de inferencia de Kokoro, que genera audio de alta calidad a partir de texto en alemán.

El modelo resuelve el problema de obtener voces específicas de alta calidad para alemán sin necesidad de entrenar un modelo completo desde cero. Es relevante porque demuestra una receta práctica y documentada para adaptar un TTS ligero (Kokoro-82M) a un idioma nuevo, y porque su licencia Apache 2.0 permite uso comercial sin restricciones. La arquitectura combina componentes de Kokoro y StyleTTS2, aunque los detalles técnicos exactos de estos componentes no se detallan en la documentación pública del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (basado en StyleTTS2) |
| Parámetros totales | No disponible (se infiere ~82M por el nombre del modelo base, pero no se confirma) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (típico de TTS, no aplica contexto de texto largo) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch) con pesos de Kokoro (`bert`, `bert_encoder`, `predictor`, `text_encoder`, `decoder`) |

## Arquitectura y entrenamiento

El modelo se basa en Kokoro-82M, un sistema TTS ligero que combina arquitecturas de StyleTTS2. Kokoro emplea un codificador de texto y un predictor acústico que genera espectrogramas mel, posteriormente convertidos en audio mediante un vocoder. El ajuste fino se realizó en dos etapas: primero se entrenó un modelo base multihablante (51 voces sintéticas) y luego se ajustó para una voz concreta ("Bernd") en una etapa posterior. El proceso de entrenamiento está documentado en el repositorio GitHub `semidark/kikiri-tts`, que incluye la receta completa, el código y las notas de arquitectura. Se utiliza el backend espeak-ng para la conversión de texto a fonemas (G2P), lo que hereda sus limitaciones en casos límite del alemán. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con audio sintético y real.

## Capacidades

- Generación de voz en alemán a partir de texto, con una única voz masculina ("Bernd").
- Síntesis de voz con calidad natural para textos arbitrarios en alemán, incluyendo números y abreviaturas (según el backend G2P).
- Inferencia sencilla mediante el script `inference.py` proporcionado en el repositorio, que acepta texto y un voicepack.
- No soporta multi-speaker ni clonación de voz (zero-shot).
- No incluye capacidades de razonamiento, código, visión ni tool calling; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Audiolibros en alemán: se puede integrar en un pipeline de TTS para generar narraciones de libros, con una voz consistente y natural.
- Podcasts automatizados: el modelo puede producir locuciones para episodios de podcast a partir de guiones, reduciendo costes de producción.
- Asistentes de voz en alemán: adecuado para sistemas de atención al cliente o asistentes personales que requieran una voz fija y clara.
- E-learning y formación: generación de contenido de audio para cursos o tutoriales en alemán.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con una voz estable.
- Producción de contenidos multimedia: doblaje de vídeos o presentaciones con una voz masculina alemana, sin necesidad de contratar actores de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos objetivos sobre calidad perceptiva (MOS) ni comparativas con otros sistemas TTS.

## Requisitos de hardware

- El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo ligero (82M parámetros) que puede ejecutarse en CPU con memoria moderada.
- VRAM estimada: no disponible, pero por el tamaño del modelo, se estima que puede caber en una GPU con al menos 2-4 GB de VRAM (ej. GTX 1650, RTX 3050).
- En CPU, la inferencia puede funcionar en tiempo real en máquinas modernas (latencia de unos segundos para frases cortas).
- Opciones de despliegue: se puede ejecutar mediante el script de Python incluido en el modelo, o integrarse en servidores con herramientas como FastAPI para construir una API de TTS. No se mencionan soporte para vLLM, llama.cpp, Ollama o TGI (son herramientas para LLM, no TTS).
- No se dispone de datos de throughput ni latencia exactos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kikiri-tts/kikiri-german-bernd` | Voz única (TTS) | ~82M | Alemán | Apache 2.0 | HuggingFace |
| `kikiri-tts/kikiri-german-martin` | Voz única (TTS) | ~82M | Alemán | Apache 2.0 | HuggingFace |
| `kikiri-tts/kikiri-german-base-51speakers-synthetic` | Multi-voz | ~82M | Alemán | Apache 2.0 | HuggingFace |

No se dispone de comparativa con otros sistemas TTS comerciales como Google TTS o ElevenLabs, ya que no son modelos abiertos y no se han publicado métricas comparativas en la documentación del proyecto.

## Limitaciones y advertencias

- Es una voz de un solo hablante; no soporta multi-speaker ni clonado de voz en tiempo real.
- La conversión de texto a fonemas depende de espeak-ng2, que puede producir errores en palabras poco frecuentes, nombres propios o extranjerismos.
- El modelo se entrenó sobre voces sintéticas, por lo que la naturalidad puede ser inferior a voces grabadas por humanos en algunos contextos.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución de Kokoro-82M y StyleTTS2 según el NOTICE del repositorio.
- No se han publicado evaluaciones de sesgos o robustez; no se recomienda su uso en aplicaciones críticas sin pruebas previas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kikiri-tts/kikiri-german-bernd
- Repositorio de entrenamiento: https://github.com/semidark/kikiri-tts
- Notas de arquitectura: https://github.com/semidark/kikiri-tts/blob/main/docs/ARCHITECTURE.md
- NOTICE de atribución: https://github.com/semidark/kikiri-tts/blob/main/NOTICE
- Organización Kikiri TTS: https://huggingface.co/kikiri-tts
- Repositorio alternativo (kokoro_ft): https://github.com/Firojpaudel/kokoro_ft/tree/main/kikiri-tts
