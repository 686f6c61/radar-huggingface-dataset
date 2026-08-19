# bschooled/caeleste-speech-moss-tts-v1.5-nf4

## Resumen

MOSS-TTS-v1.5 es un modelo de síntesis de voz (text-to-speech) de alta calidad desarrollado por el equipo OpenMOSS en colaboración con MOSI.AI, diseñado para escenarios complejos del mundo real: voz larga y estable, diálogos multi-hablante, diseño de voces y personajes, efectos de sonido ambientales y TTS en streaming en tiempo real. La arquitectura se basa en un backbone de 8.000 millones de parámetros (Qwen3-8B), lo que le permite generar voz con alta fidelidad y expresividad.

Esta ficha cubre la versión cuantizada `bschooled/caeleste-speech-moss-tts-v1.5-nf4`, que aplica cuantización NF4 de 4 bits mediante bitsandbytes con doble cuantización y cómputo en bf16. El resultado es una reducción del tamaño original de 15,83 GiB a 6,23 GiB, lo que permite ejecutar el modelo en GPUs de 16 GB que de otro modo no podrían albergarlo sin cuantizar. Es una opción relevante para desarrolladores que necesitan desplegar TTS de calidad en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3-8B (transformer) con cabezal de síntesis de voz; detalles completos de la arquitectura TTS no disponibles |
| Parametros totales | 8.489.841.664 (8,49 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 de 4 bits (bitsandbytes), doble cuantización, cómputo bf16 |
| Idiomas soportados | No disponibles (el modelo upstream soporta múltiples idiomas; lista concreta no publicada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con configuración de cuantización en config.json) |

## Arquitectura y entrenamiento

El modelo original MOSS-TTS-v1.5 utiliza un backbone basado en Qwen3-8B, un transformer de lenguaje de 8.000 millones de parámetros, adaptado para la generación de voz. La familia MOSS-TTS está diseñada para cubrir múltiples tareas de audio: síntesis de voz de formato largo, diálogos con múltiples hablantes, diseño de voces y personajes, efectos de sonido ambientales y streaming en tiempo real. Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada.

La versión cuantizada no altera la arquitectura ni el vocabulario del modelo original. Los tensores de pesos se sustituyen por equivalentes cuantizados en NF4, se añade un bloque `quantization_config` al `config.json`, y el tokenizer, processor y archivos de código remoto se copian sin modificaciones de la revisión upstream `cdd3b911b1585e3f2dbc7775ef10f9926f58850a`. Esto garantiza que el comportamiento del modelo sea equivalente al original, con la única diferencia del redondeo introducido por la cuantización.

## Capacidades

- Síntesis de voz de alta fidelidad y expresividad con backbone de 8B parámetros.
- Generación de voz larga y estable, adecuada para narración de formato extendido.
- Diálogos multi-hablante con voces diferenciadas.
- Diseño de voces y personajes (voice/character design).
- Generación de efectos de sonido ambientales.
- TTS en streaming en tiempo real.
- Soporte de carga mediante `trust_remote_code=True` en transformers, con integración con bitsandbytes para GPU NVIDIA (sm_75+) y AMD ROCm (RDNA3/RDNA3.5/CDNA).

## Casos de uso

- Narración de audiolibros y contenido largo: el modelo genera voz estable y natural durante periodos prolongados, lo que lo hace adecuado para convertir libros completos o artículos extensos en audio sin degradación de calidad.
- Asistentes de voz y agentes conversacionales: la capacidad de diálogo multi-hablante y streaming en tiempo real permite integrarlo en asistentes virtuales que necesitan responder con baja latencia.
- Doblaje y localización de contenido: el diseño de voces y personajes permite generar voces diferenciadas para personajes en vídeos, animaciones o videojuegos.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con calidad suficiente para uso prolongado.
- Creación de contenido para marketing y publicidad: generación de locuciones para anuncios, vídeos promocionales o podcasts sin necesidad de estudios de grabación.
- Sistemas de respuesta de voz interactiva (IVR): el modelo puede integrarse en centralitas telefónicas para generar respuestas de voz naturales en tiempo real.
- Prototipado rápido de productos de audio: los equipos de producto pueden generar muestras de voz realistas para pruebas de concepto sin depender de actores de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas comparativas (MOS, WER, etc.) para esta versión cuantizada ni referencia benchmarks del modelo original.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 6,23 GiB en disco; en memoria, con overhead de inferencia, se estima que cabe en GPUs de 12-16 GB VRAM. El modelo original sin cuantizar (15,83 GiB) no cabe en una GPU de 16 GB.
- GPU recomendadas: NVIDIA con arquitectura Turing o superior (sm_75+), incluyendo RTX 2070, RTX 3060, RTX 4090, A100, H100. También compatible con AMD ROCm en RDNA3, RDNA3.5 y CDNA.
- GPU de consumo: sí, cabe en RTX 3060 12 GB y superiores.
- Opciones de despliegue: transformers con `device_map`, bitsandbytes para carga cuantizada. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| MOSS-TTS-v1.5 (original) | 8,49 B | Sin cuantizar (bf16) | Apache 2.0 | Requiere >16 GB VRAM |
| MOSS-TTS-v1.5 NF4 (esta ficha) | 8,49 B | NF4 4-bit | Apache 2.0 | Cabe en 16 GB VRAM |
| IndexTTS-2.5 | No disponible | No disponible | No disponible | TTS de referencia en HuggingFace, sin datos comparables publicados |

No se dispone de información suficiente sobre alternativas directas con el mismo backbone o la misma tarea para una comparativa más exhaustiva. La comparativa principal es entre la versión original y la cuantizada del mismo modelo.

## Limitaciones y advertencias

- La cuantización NF4 introduce una pérdida de precisión respecto al modelo original que puede afectar sutilmente a la calidad de la voz generada, especialmente en casos extremos de expresividad o entonación.
- Los kernels NF4 requieren hardware específico: NVIDIA sm_75+ o AMD ROCm en RDNA3/RDNA3.5/CDNA. GPUs más antiguas no podrán ejecutar el modelo.
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código remoto del repositorio. Se recomienda auditar el código antes de usarlo en entornos de producción.
- La lista de idiomas soportados no está publicada en la información disponible; verificar la compatibilidad con el idioma objetivo antes de integrarlo.
- No se han publicado evaluaciones formales de sesgos o alucinaciones para este modelo. Como todo sistema TTS, puede generar pronunciaciones incorrectas de nombres propios o términos técnicos.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de copyright y atribución del upstream.
- La fecha de creación del repositorio (2026-08-19) y el número de descargas (0) sugieren que es una publicación reciente con poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/bschooled/caeleste-speech-moss-tts-v1.5-nf4
- Repositorio upstream: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- GitHub de la familia MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS
- GitHub espejo: https://github.com/Stivenmore/moss-tts
- ModelScope del modelo original: https://www.modelscope.cn/models/openmoss/MOSS-TTS-v1.5
