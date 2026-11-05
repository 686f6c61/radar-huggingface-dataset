# Emouren/Qwen3-TTS-12Hz-1.7B-VoiceDesign

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign es un modelo de síntesis de voz (text-to-speech) publicado en HuggingFace por el usuario Emouren, derivado de la familia Qwen3-TTS desarrollada por el equipo Qwen (Alibaba). La variante VoiceDesign se centra en la generación de voz controlada mediante instrucciones en lenguaje natural, permitiendo ajustar timbre, emoción y prosodia sin necesidad de una muestra de referencia. El modelo emplea una arquitectura de lenguaje discreta con múltiples codebooks sobre un tokenizador acústico propio (Qwen3-TTS-Tokenizer-12Hz), que comprime el audio a una tasa de 12 Hz para lograr síntesis eficiente.

Con 1.916.676.352 parámetros (aproximadamente 1,7B) y un tamaño de repositorio de 4,5 GB en formato safetensors, el modelo está pensado para inferencia en GPUs de gama alta de consumo y profesional. La familia Qwen3-TTS cubre diez idiomas principales (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y perfiles dialectales, y destaca por una latencia de síntesis en streaming de hasta 97 ms.

La relevancia actual del modelo radica en su enfoque end-to-end con control por lenguaje natural, que elimina cuellos de botella de pipelines tradicionales de TTS y facilita la integración en aplicaciones conversacionales, doblaje y asistentes de voz. La licencia Apache 2.0 favorece su adopción comercial, aunque el repositorio concreto presenta cero descargas y cero likes en el momento de la consulta, lo que sugiere que se trata de una réplica o derivado reciente más que del lanzamiento oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LM discreta con múltiples codebooks sobre tokenizador acústico Qwen3-TTS-Tokenizer-12Hz |
| Parámetros totales | 1.916.676.352 (~1,7B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; se desconoce si existen variantes GGUF/INT8) |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano (según la model card de la familia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura universal end-to-end basada en un modelo de lenguaje discreto con múltiples codebooks, que sustituye los pipelines clásicos de TTS (texto → fonemas → mel → vocoder) por una generación directa de tokens acústicos. El componente clave es el Qwen3-TTS-Tokenizer-12Hz, un tokenizador propio que logra compresión acústica eficiente y modelado semántico de alta dimensión a una tasa de 12 Hz, lo que reduce la longitud de secuencia y habilita generación en streaming con baja latencia.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La familia Qwen3-TTS se presenta como entrenada para clonación de voz, diseño de voz, generación de habla de alta calidad y control por lenguaje natural, pero no se especifican innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible. El informe técnico asociado es arXiv:2601.15621.

## Capacidades

- Generación de voz a partir de texto con calidad humana en diez idiomas principales.
- Control de voz por instrucciones en lenguaje natural (timbre, emoción, prosodia), característica diferencial de la variante VoiceDesign.
- Clonación de voz y diseño de voz (según la descripción de la familia Qwen3-TTS).
- Generación en streaming con latencia end-to-end de hasta 97 ms.
- Soporte de perfiles dialectales además de los idiomas principales.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de propósito general).
- No se documenta capacidad de visión ni audio de entrada (es un modelo TTS, no un modelo omni).

## Casos de uso

- Asistentes de voz conversacionales: el modelo puede generar respuestas habladas en español con control de emoción mediante instrucciones, integrándose en pipelines de diálogo multi-turno con baja latencia (97 ms en streaming).
- Doblaje y localización de contenido: al cubrir diez idiomas y permitir diseño de voz por instrucciones, resulta adecuado para generar pistas de audio localizadas sin grabaciones adicionales.
- Audiolibros y narración: la variante VoiceDesign permite definir timbre y prosodia por personaje mediante prompts en lenguaje natural, manteniendo consistencia a lo largo de capítulos largos.
- Atención al cliente automatizada: generación de respuestas de voz naturales en un asistente telefónico, con control de tono para adaptarse al contexto del cliente.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de asistencia a personas con discapacidad visual, con voces personalizables.
- Publicidad y contenido creativo: generación rápida de locuciones con estilos emocionales específicos (enfadado, susurrante, entusiasta) sin necesidad de actores de voz.
- Prototipado de interfaces de voz: integración en entornos de desarrollo para probar experiencias de voz antes de contratar grabaciones profesionales.

## Benchmarks y rendimiento

La model card de la familia reporta resultados de zero-shot speech generation en el conjunto de prueba Seed-TTS, medidos como Word Error Rate (WER, menor es mejor):

| Modelo | test-zh | test-en |
|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 0,77 | 1,24 |

No se han publicado resultados de benchmarks específicos para la variante VoiceDesign en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4 GB solo para pesos (1,7B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 8-12 GB para operar con comodidad.
- GPU recomendadas: A100, H100 para producción de alta concurrencia; RTX 4090 y RTX 3090 para desarrollo y despliegue individual.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más (RTX 3070/4060 Ti en adelante), siempre que se use bfloat16 o cuantización.
- Opciones de despliegue: paquete oficial `qwen-tts` (PyPI) con PyTorch y FlashAttention 2; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: latencia end-to-end de hasta 97 ms en modo streaming según la model card de la familia; no se dispone de cifras de throughput (tokens de audio por segundo) para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | ~1,7B | 10 | Apache 2.0 | no disponible | Control de voz por lenguaje natural |
| Qwen3-TTS-12Hz-1.7B-Base | ~1,7B | 10 | Apache 2.0 | no disponible | Variante base de la misma familia; WER 0,77/1,24 en Seed-TTS |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | ~1,7B | 10 | Apache 2.0 | no disponible | Variante con voces personalizadas predefinidas |
| Alternativas TTS open source (p. ej. XTTS-v2, Bark) | variable | variable | variable | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene cero descargas y cero likes, y el autor (Emouren) no coincide con el equipo oficial Qwen; conviene verificar la procedencia y los pesos antes de usarlo en producción.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos multilingües es probable que herede sesgos de acento, género y dialecto no cuantificados.
- Riesgo de alucinación acústica: en textos fuera de distribución puede generar prosodia incorrecta, pronunciaciones erróneas o artefactos.
- No se especifica la longitud máxima de contexto de texto ni de audio, lo que limita la planificación de cargas de trabajo largas.
- La licencia Apache 2.0 permite uso comercial, pero el autor del repositorio no ofrece garantías ni soporte; la responsabilidad recae en el integrador.
- La clonación de voz conlleva riesgos éticos y legales (suplantación de identidad); se recomienda aplicar consentimiento explícito y marcas de agua.
- No se documentan requisitos de hardware oficiales ni cifras de throughput para esta variante concreta.

## Enlaces

- HuggingFace: https://huggingface.co/Emouren/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Colección oficial Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- ModelScope: https://modelscope.cn/collections/Qwen/Qwen3-TTS
- Blog: https://qwen.ai/blog?id=qwen3tts-0115
- Paper: https://huggingface.co/papers/2601.15621
- GitHub: https://github.com/QwenLM/Qwen3-TTS
