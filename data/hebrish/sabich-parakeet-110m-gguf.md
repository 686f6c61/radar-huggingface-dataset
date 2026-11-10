# Hebrish/Sabich-Parakeet-110M-GGUF

## Resumen

Sabich-Parakeet-110M-GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático de voz (ASR) Sabich-Parakeet-110M, desarrollado por el usuario Hebrish. Se trata de un modelo especializado en transcripción de audio con soporte para code-switching entre inglés (en) y hebreo (he), es decir, capaz de alternar entre ambos idiomas dentro de una misma emisión. Con 114.113.670 parámetros (aproximadamente 110M), está diseñado para inferencia en dispositivo (on-device) mediante la librería transcribe.cpp, lo que lo hace adecuado para entornos con recursos limitados.

El modelo se distribuye bajo licencia CC-BY-4.0 y con acceso restringido (gated) en Hugging Face, lo que implica aceptar condiciones de uso antes de la descarga. Su relevancia radica en la combinación de un tamaño reducido, soporte bilingüe con code-switching y un formato GGUF optimizado para despliegue local, aunque la información pública disponible es muy limitada: no se han publicado detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face y en la información proporcionada; cualquier dato no confirmado se indica explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; probablemente basada en Parakeet de NVIDIA, no confirmado) |
| Parámetros totales | 114.113.670 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | inglés (en), hebreo (he), con code-switching |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (repo de 0.5 GB) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base Sabich-Parakeet-110M. El nombre sugiere una relación con la familia Parakeet de NVIDIA, orientada a reconocimiento de voz, pero esta vinculación no está confirmada en la información proporcionada. El modelo cuenta con 114.113.670 parámetros y está empaquetado en formato GGUF para su uso con transcribe.cpp, una librería de inferencia orientada a transcripción de audio.

Tampoco se han publicado datos sobre el corpus de entrenamiento (número de tokens, composición del dataset, horas de audio), ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO. La única innovación destacable documentada es el soporte explícito de code-switching inglés-hebreo y la optimización para inferencia on-device mediante cuantización GGUF.

## Capacidades

- Reconocimiento automático de voz (ASR) con transcripción de audio a texto.
- Soporte de code-switching entre inglés y hebreo dentro de una misma emisión.
- Inferencia on-device gracias al formato GGUF y al tamaño reducido (~110M parámetros).
- Integración con la librería transcribe.cpp para despliegue local.
- Capacidades multilingües limitadas a inglés y hebreo.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción de reuniones bilingües inglés-hebreo: el modelo puede procesar audio donde los hablantes alternan entre ambos idiomas, gracias a su soporte de code-switching, y generar una transcripción unificada.
- Subtitulado automático en dispositivos locales: al ejecutarse mediante transcribe.cpp con pesos GGUF, permite generar subtítulos sin enviar audio a servicios en la nube, útil por privacidad.
- Asistentes de voz embebidos: su tamaño de ~110M parámetros y formato GGUF lo hacen viable en dispositivos con recursos limitados para dictado o comandos de voz.
- Documentación clínica o legal dictada: transcripción de notas de voz en entornos donde se mezclan términos en inglés y hebreo, con despliegue local para cumplir requisitos de confidencialidad.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones grabadas para su posterior indexación y búsqueda, ejecutándose en infraestructura propia.
- Investigación lingüística sobre code-switching: generación de transcripciones anotadas de corpus bilingües inglés-hebreo para estudios de alternancia de código.
- Prototipado rápido de pipelines ASR: al ser un modelo pequeño en GGUF, sirve para validar flujos de transcripción antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con ~114M parámetros, los pesos en GGUF ocupan del orden de cientos de MB (el repo completo pesa 0.5 GB), por lo que la VRAM necesaria es baja.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU consumer actuales, dado el reducido tamaño del modelo.
- Opciones de despliegue: transcribe.cpp (librería indicada en los tags); no se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Información técnica muy limitada: no hay datos publicados sobre arquitectura, entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- Idiomas limitados a inglés y hebreo; no se ha documentado soporte para castellano ni otros idiomas.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente en audio con ruido o acentos no representados en el entrenamiento.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos demográficos o lingüísticos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero deben verificarse las condiciones adicionales del acceso gated.
- Escasa adopción (3 descargas, 0 likes en el momento de la consulta): no hay evidencia de validación por parte de la comunidad.
- Compatibilidad de despliegue limitada a transcribe.cpp según los tags; no se ha confirmado soporte en otros runners.

## Enlaces

- Hugging Face: https://huggingface.co/Hebrish/Sabich-Parakeet-110M-GGUF
- Modelo base: https://huggingface.co/Hebrish/Sabich-Parakeet-110M
- DOI: https://doi.org/10.57967/hf/11180
