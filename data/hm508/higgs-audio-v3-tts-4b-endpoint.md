# hm508/higgs-audio-v3-tts-4b-endpoint

## Resumen

El modelo `hm508/higgs-audio-v3-tts-4b-endpoint` es un port de `bosonai/higgs-audio-v3-tts-4b` que permite cargar el modelo de texto a voz (TTS) de Boson AI directamente con la librería `transformers` de HuggingFace, sin necesidad de usar SGLang. Los pesos son el checkpoint original, sin modificaciones; solo se añade una pareja de ficheros `modeling_*.py` y `configuration_*.py` junto con un `auto_map` para habilitar `trust_remote_code`.

El modelo combina un backbone estándar Qwen3-4B con un head de audio multi-codebook fusionado. Está diseñado para generar voz natural a 24 kHz y soporta clonación de voz zero-shot a partir de un clip de referencia. La arquitectura utiliza un patrón de delay en 8 codebooks con un vocabulario de 1026 tokens, incluyendo tokens especiales de inicio y fin. El tamaño del repositorio es de 9,3 GB y el total de parámetros es de 4.654.850.537. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B backbone + head de audio multi-codebook fusionado |
| Parametros totales | 4.654.850.537 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | bosonai-higgs-audio-v3 (investigación/no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un sistema de texto a voz basado en un backbone de lenguaje Qwen3-4B, al que se le añade un embedding y un head de audio multi-codebook fusionado. La codificación del audio de referencia y la decodificación de la forma de onda utilizan el tokenizer nativo `bosonai/higgs-audio-v2-tokenizer` (`higgs_audio_v2_tokenizer`), que se carga automáticamente en el primer uso.

La generación emplea un patrón de delay de Higgs distribuido en 8 codebooks, con un vocabulario de 1026 tokens que incluye tokens especiales de inicio y fin. El proceso de de-delay y decodificación se gestiona internamente. El codec se ejecuta en fp32, ya que la decodificación es inestable en bf16; el backbone de lenguaje se puede cargar en bf16, que es el formato recomendado.

No se proporcionan datos sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto a voz (TTS) a partir de texto plano, con salida de forma de onda mono a 24 kHz.
- Clonación de voz zero-shot: permite generar voz con las características de un clip de audio de referencia, sin necesidad de entrenamiento adicional.
- Soporte de transcripción opcional para el clip de referencia, lo que puede mejorar la precisión de la clonación.
- Parámetros de muestreo configurables (`temperature`, `top_p`) para controlar la variabilidad de la generación.
- Integración con la librería `transformers` mediante `trust_remote_code`, lo que facilita su uso en pipelines estándar de HuggingFace.
- El modelo está diseñado para el idioma inglés, según la información disponible.

## Casos de uso

- Narración de audiobooks: el modelo puede convertir guiones de libros en audio narrado con una voz consistente, aprovechando la clonación de voz para mantener el mismo tono a lo largo de la obra.
- Asistentes de voz: integración en sistemas de asistencia para convertir respuestas de texto generadas por un LLM en voz natural, con posibilidad de personalizar la voz del asistente mediante un clip de referencia.
- Doblaje de contenido audiovisual: clonación de voz para doblar vídeos o series, usando la voz de un actor de referencia como base y generando las líneas de diálogo en inglés.
- Accesibilidad: lectura de pantalla para personas con discapacidad visual, permitiendo crear voces personalizadas que resulten más cómodas de escuchar.
- Generación de podcasts: creación automatizada de episodios narrados a partir de guiones, reduciendo el coste de producción y permitiendo una voz consistente en todos los episodios.
- Prototipado de voz para videojuegos: generación de líneas de diálogo para personajes durante el desarrollo, sin necesidad de grabar a actores de voz en las fases iniciales.
- Sistemas de respuesta de voz interactiva (IVR): automatización de mensajes de voz en centralitas telefónicas, con la posibilidad de clonar una voz corporativa para mantener la identidad de marca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. El repositorio ocupa 9,3 GB, lo que sugiere que los pesos en bf16 requieren aproximadamente esa cantidad de memoria, más la memoria para activaciones y el codec en fp32. Se recomienda una GPU con al menos 12 GB de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmado; por tamaño, podría ejecutarse en tarjetas con 12 GB o más, pero no está especificado.
- Opciones de despliegue: mediante `transformers` con `trust_remote_code` (requiere `transformers >= 5.5`). El modelo original también se recomienda servir con SGLang-Omni.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El modelo es un port del checkpoint original `bosonai/higgs-audio-v3-tts-4b`, por lo que no se dispone de datos comparativos frente a otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: como en cualquier modelo generativo, puede producir pronunciaciones incorrectas o audio inesperado en textos ambiguos o con siglas.
- Limitaciones de idioma: el modelo solo está etiquetado para inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia `bosonai-higgs-audio-v3` es de investigación y uso no comercial, lo que impide su uso en productos comerciales.
- Requiere `transformers >= 5.5` y el uso de `trust_remote_code`, lo que implica confiar en código remoto.
- El codec debe ejecutarse en fp32; usar bf16 en la decodificación puede provocar inestabilidad.
- El modelo no incluye soporte de tool calling, agentes ni otras capacidades de razonamiento; es exclusivamente un sistema de texto a voz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hm508/higgs-audio-v3-tts-4b-endpoint
- Modelo base original: https://huggingface.co/bosonai/higgs-audio-v3-tts-4b
- Repositorio de Boson AI: https://github.com/boson-ai/higgs-audio
