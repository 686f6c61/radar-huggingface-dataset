# Rin247/Qwen3-TTS-12Hz-0.6B-Base-FP8

## Resumen

Qwen3-TTS-12Hz-0.6B-Base es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba, presentado en el informe técnico arXiv:2601.15621. Este checkpoint concreto, subido por el usuario Rin247, es una versión cuantizada en FP8 del modelo original de 0.6B parámetros, diseñado para clonación rápida de voz a partir de una muestra de audio de referencia de tan solo 3 segundos. El modelo forma parte de una familia más amplia que cubre 10 idiomas y está entrenado con más de 5 millones de horas de datos de habla.

La arquitectura se basa en un modelo de lenguaje discreto de múltiples codebooks que opera sobre tokens de audio generados por el tokenizador propietario Qwen3-TTS-Tokenizer-12Hz, lo que permite un modelado end-to-end de la información acústica y semántica. El modelo destaca por su baja latencia de síntesis (hasta 97 ms) y por admitir control de la voz mediante instrucciones en lenguaje natural, además de la clonación de voz. Su licencia Apache 2.0 y su tamaño reducido lo hacen atractivo para despliegues en entornos con recursos limitados, aunque este repositorio concreto presenta el modelo en formato FP8, lo que reduce aún más el uso de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autoregresivo sobre tokens de audio discretos (multi-codebook) con tokenizador Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 914.643.008 (0.6B nominales) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (este checkpoint); el original se distribuye en BF16/FP16 |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, español e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de modelo de lenguaje (LM) discreto con múltiples codebooks, donde el audio se tokeniza a una frecuencia de 12 Hz mediante el tokenizador propietario Qwen3-TTS-Tokenizer-12Hz. Esta representación comprime eficientemente la señal acústica y modela simultáneamente aspectos semánticos y acústicos, lo que permite una síntesis end-to-end sin módulos separados de vocoder o acústica. El entrenamiento se realizó con más de 5 millones de horas de datos de habla en 10 idiomas, lo que proporciona una base sólida para la clonación de voz y el control por descripciones. No se han publicado detalles sobre el uso de RLHF o DPO en la información disponible; el informe técnico (arXiv:2601.15621) contiene los detalles completos del proceso de entrenamiento.

## Capacidades

- Clonacion de voz a partir de una muestra de referencia de 3 segundos, sin necesidad de fine-tuning.
- Control de la voz mediante instrucciones en lenguaje natural (por ejemplo, tono, velocidad, emoción).
- Generacion de habla multilingue en 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, español e italiano.
- Sintesis de baja latencia (hasta 97 ms de extremo a extremo), adecuada para interacciones en tiempo real.
- Soporte de streaming de audio durante la generacion.
- Capacidad de manejar entradas de texto con formulas matematicas, simbolos y emojis, como se muestra en el ejemplo de uso.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede generar respuestas de voz naturales en multiples idiomas con baja latencia, lo que permite desplegar asistentes telefonicos que clonan la voz de un agente humano o utilizan voces personalizadas para mantener una identidad de marca consistente.
- Audiolibros y narracion de contenido: gracias a su capacidad de control por descripcion, se puede ajustar el tono y el ritmo para narrar articulos, noticias o libros, reduciendo costes frente a la grabacion profesional.
- Asistentes de voz en dispositivos edge: al ser un modelo de 0.6B con cuantizacion FP8, puede ejecutarse en GPUs de consumo o incluso en CPUs con suficiente memoria, habilitando asistentes locales sin dependencia de la nube.
- Doblaje de video y localizacion: la clonacion de voz de 3 segundos permite doblar contenido audiovisual manteniendo la voz original del actor, acelerando el proceso de localizacion a 10 idiomas.
- Herramientas de accesibilidad: generacion de voz para personas con discapacidad del habla, clonando su voz a partir de una muestra breve y permitiendoles comunicarse con su propia identidad vocal.
- Prototipado rapido de experiencias de voz: los desarrolladores pueden integrar el modelo en pipelines de diseño de productos para generar muestras de voz realistas en minutos, validando conceptos antes de invertir en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con otros modelos TTS, y el informe tecnico no se ha analizado en detalle. Por tanto, no se pueden proporcionar datos numericos de rendimiento (MOS, similitud de voz, etc.) en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 914M parametros en FP8, lo que supone aproximadamente 0.9 GB de pesos. Con overhead de activaciones y contexto, se estima un uso de VRAM entre 2 y 4 GB, aunque este dato no esta confirmado oficialmente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo en FP8. Para mayor comodidad, una RTX 3060 o superior ofrece margen.
- Si cabe en consumer GPU: si, en la mayoria de GPUs de consumo modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: el modelo se carga mediante la libreria `qwen-tts` (pip install -U qwen-tts) y soporta `attn_implementation="flash_attention_2"` para optimizar el rendimiento. Tambien se puede usar con `device_map="cuda:0"` para GPU unica.
- Latencia y throughput: la latencia de sintesis end-to-end es de hasta 97 ms segun la documentacion, aunque el throughput exacto no se ha especificado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos TTS en la informacion proporcionada. El modelo compite con alternativas de codigo abierto como XTTS v2 (Coqui) o Bark, pero no se han encontrado benchmarks publicos que permitan una comparacion cuantitativa. Se recomienda consultar el informe tecnico (arXiv:2601.15621) para posibles comparaciones con modelos previos de Qwen u otros sistemas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos de habla mayoritariamente de ciertas regiones, puede haber sesgos en acentos o dialectos no representados. La model card menciona "multiples perfiles de voz dialectales", pero no detalla su cobertura.
- Riesgo de alucinacion: como modelo generativo, puede producir audio con errores de pronunciacion o contenido no deseado si el texto de entrada es ambiguo o contiene caracteres especiales.
- Limitaciones de contexto: no se ha especificado la longitud maxima de texto o audio que puede procesar; para entradas muy largas podria degradarse la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe respetar la atribucion y las condiciones de la licencia. No se han identificado restricciones adicionales.
- Caveat de produccion: la version FP8 de este repositorio no es el checkpoint oficial de Qwen; se recomienda verificar la integridad del modelo y comparar con el original (Qwen/Qwen3-TTS-12Hz-0.6B-Base) antes de usarlo en entornos criticos.

## Enlaces

- Repositorio de HuggingFace de este checkpoint: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-0.6B-Base-FP8
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Informe tecnico (arXiv): https://huggingface.co/papers/2601.15621
- Repositorio de GitHub: https://github.com/QwenLM/Qwen3-TTS
- Demo oficial en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Version en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Version convertida para edge (forkjoin-ai): https://huggingface.co/forkjoin-ai/qwen3-tts-12hz-0.6b-base
