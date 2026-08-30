# Rin247/Qwen3-TTS-12Hz-1.7B-CustomVoice-FP8

## Resumen

Qwen3-TTS es una familia de modelos de síntesis de voz desarrollada por Alibaba Qwen, publicada bajo licencia Apache 2.0. Esta ficha corresponde a una versión cuantizada en FP8 del checkpoint `Qwen3-TTS-12Hz-1.7B-CustomVoice`, subida por el usuario Rin247 a Hugging Face. El modelo original es un sistema de texto a voz (TTS) de extremo a extremo basado en una arquitectura de modelo de lenguaje (LM) con múltiples codebooks discretos, que opera a una frecuencia de 12 Hz mediante un tokenizer propio. Está diseñado para generar voz con control fino de timbre, emoción y prosodia a partir de instrucciones en lenguaje natural, y soporta diez idiomas principales.

La versión FP8 reduce el tamaño del checkpoint a 2,3 GB (frente a los pesos originales en BF16), lo que facilita su despliegue en hardware de consumo sin pérdidas significativas de calidad. El modelo CustomVoice ofrece nueve timbres premium predefinidos que cubren combinaciones de género, edad, idioma y dialecto, y permite ajustar el estilo de la voz mediante instrucciones textuales. Su arquitectura de streaming híbrido permite una latencia de síntesis de hasta 97 ms, lo que lo hace adecuado para aplicaciones interactivas en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (no DiT), tokenizer Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.916.676.352 (1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa texto largo como LLM) |
| Tipos de cuantizacion | FP8 (esta version); el original se distribuye en BF16 |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de LM discreto con múltiples codebooks, que modela directamente la señal de voz codificada por el tokenizer Qwen3-TTS-Tokenizer-12Hz. Este tokenizer comprime la señal acústica en una secuencia de códigos a 12 Hz, preservando información paralingüística y del entorno acústico. A diferencia de los esquemas tradicionales LM+DiT, el modelo genera la voz de forma íntegra mediante el LM, evitando cuellos de botella de información y errores en cascada. La reconstrucción de la forma de onda se realiza con una arquitectura ligera no basada en DiT.

El entrenamiento del modelo original no se detalla en la información disponible (no se especifican número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO). La versión FP8 es una cuantización posterior realizada por un tercero (Rin247), sin documentación sobre el proceso de calibración o pérdida de calidad. El modelo soporta generación en streaming y no streaming mediante una arquitectura de doble vía (Dual-Track), que permite emitir el primer paquete de audio tras un solo carácter de entrada.

## Capacidades

- Síntesis de voz multilingüe en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Control de estilo mediante instrucciones en lenguaje natural: permite ajustar timbre, emoción, ritmo y prosodia.
- Nueve timbres premium predefinidos que combinan género, edad, idioma y dialecto.
- Generación en streaming con latencia de extremo a extremo de hasta 97 ms.
- Comprensión semántica del texto de entrada para adaptar automáticamente el tono y la expresividad.
- Robustez mejorada frente a texto de entrada ruidoso o mal formateado.
- No incluye capacidades de tool calling, visión ni razonamiento multimodal; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas de voz naturales en múltiples idiomas con control de tono y emoción, integrándose en sistemas IVR o asistentes virtuales. Su baja latencia permite interacciones fluidas en tiempo real.
- Asistentes de voz en dispositivos: al ser un modelo pequeño (1,92 B parámetros) y cuantizado en FP8, puede ejecutarse en hardware de consumo para asistentes personales, altavoces inteligentes o aplicaciones móviles.
- Audiolibros y narración de contenido: los nueve timbres premium y el control de prosodia permiten generar narraciones expresivas para libros, artículos o noticias, con selección de voz según el público objetivo.
- Doblaje y localización de contenido audiovisual: el soporte multilingüe y el control de estilo facilitan la generación de voces dobladas en diferentes idiomas manteniendo coherencia emocional.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con opciones de velocidad y tono ajustables mediante instrucciones.
- Prototipado rápido de productos de voz: los desarrolladores pueden generar muestras de voz realistas para validar conceptos de producto sin necesidad de estudios de grabación, gracias a la API de vLLM-Omni compatible con OpenAI `/v1/audio/speech`.
- Educación y e-learning: creación de contenido educativo hablado en varios idiomas, con voces adaptadas a diferentes rangos de edad y dialectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card oficial de Qwen3-TTS no incluye métricas comparativas (MOS, WER, latencia) y la versión FP8 de Rin247 tampoco aporta datos de evaluación. Se recomienda consultar el repositorio oficial de Qwen para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 2,3 GB en disco; la inferencia requiere aproximadamente 2-3 GB de VRAM adicionales para activaciones y buffers, por lo que es ejecutable en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna con soporte FP8, como RTX 3090, RTX 4090, o GPUs de datacenter como A100 o H100. En GPUs sin soporte nativo FP8, el modelo puede ejecutarse con conversión a BF16 o FP16, aunque con mayor uso de memoria.
- Cabe en GPUs de consumo: sí, en tarjetas con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, Apple Silicon con memoria unificada).
- Opciones de despliegue: el paquete `qwen-tts` de Qwen, vLLM-Omni (que expone API OpenAI `/v1/audio/speech`), y posiblemente llama.cpp si se convierte a GGUF (no confirmado).
- Latencia y throughput: la latencia de síntesis es de hasta 97 ms en modo streaming; el throughput depende del hardware y de la longitud del texto, pero al ser un modelo de 1,92 B parámetros, es adecuado para despliegues en tiempo real en una sola GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos TTS en la información proporcionada. El modelo se posiciona como una alternativa ligera y de baja latencia frente a sistemas como XTTS v2, Bark o VITS, pero no hay benchmarks públicos que permitan una comparación cuantitativa. La principal ventaja documentada es su arquitectura de streaming híbrido y el control fino por instrucciones, características que no están presentes en todos los competidores.

## Limitaciones y advertencias

- La versión FP8 es una cuantización de terceros (Rin247) no oficial de Qwen; no se documenta el proceso de calibración ni se garantiza la misma calidad que el checkpoint original en BF16.
- No se dispone de información sobre sesgos del modelo, aunque al entrenarse con datos multilingües puede presentar variaciones de calidad entre idiomas o dialectos.
- Riesgo de alucinación acústica: el modelo puede generar voces o entonaciones inesperadas si las instrucciones son ambiguas o contradictorias con el texto.
- Limitación de contexto: al ser un modelo TTS, no procesa documentos largos; el texto de entrada debe ser fragmentado en unidades manejables.
- La licencia Apache 2.0 permite uso comercial, pero la cuantización FP8 no está respaldada por el equipo de Qwen, por lo que se recomienda validar su comportamiento en producción.
- No se especifican requisitos de memoria para el tokenizer, que debe cargarse junto al modelo.

## Enlaces

- Modelo en Hugging Face (versión FP8): https://huggingface.co/Rin247/Qwen3-TTS-12Hz-1.7B-CustomVoice-FP8
- Modelo oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3-TTS
- Guía de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Página de referencia en innoai.space: https://innoai.space/model/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
