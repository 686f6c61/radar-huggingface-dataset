# sakasegawa/Irodori-TTS-v4.1-Small-GGUF

## Resumen

Irodori-TTS-v4.1-Small es un modelo de síntesis de voz (text-to-speech) en japonés desarrollado por Aratako, con 858,7 millones de parámetros. Esta ficha concreta es una conversión a formato GGUF realizada por el usuario sakasegawa, empaquetada específicamente para el runtime speech.cpp (versión 0.8.0 o superior), que incluye tanto el modelo TTS como su códec de audio Semantic-DACVAE-Japanese-32dim en un único archivo.

El modelo resuelve la generación de voz japonesa a partir de texto, con soporte para clonación de voz mediante grabaciones de referencia (hasta 120 segundos), descripción de la voz en lenguaje natural y selección automática de voz por parte del modelo. La inferencia utiliza muestreo con pasos de Euler y guidance del runtime oficial, con 40 pasos por defecto y la posibilidad de reducir a 16 pasos para obtener el primer audio en menos de la mitad de tiempo.

Su relevancia radica en que permite ejecutar un sistema TTS japonés de calidad en hardware de consumo gracias a las cuantizaciones GGUF (desde 0,86 GB en Q4_K hasta 1,91 GB en F16), aunque con la restricción importante de que los archivos solo funcionan en speech.cpp y no en llama.cpp, LM Studio, Ollama u otros programas compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con DiT y encoder de hablante; detalles completos no especificados) |
| Parametros totales | 858.716.034 (859M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una frase a la vez) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K, Q4_K |
| Idiomas soportados | japones (ja) |
| Licencia | MIT (modelo y codec); el modelo base del codec usa Apache 2.0 |
| Formato de pesos | GGUF (formato propio de speech.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna completa del modelo. Se sabe que combina un modelo TTS (Irodori-TTS v4.1-Small de Aratako) con un códec de audio neuronal denominado Semantic-DACVAE-Japanese-32dim, que decodifica el audio a 48 kHz. El pipeline incluye un encoder de hablante (speaker encoder) para la clonación de voz y un componente DiT (Diffusion Transformer) cuyas matrices se cuantizan de forma mixta en los archivos Q6_K, Q5_K y Q4_K.

La síntesis emplea muestreo con pasos de Euler y guidance del runtime oficial, con 40 pasos por defecto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La precisión de la implementación en speech.cpp se validó comparando cada etapa contra los tensores de la implementación oficial en float32 sobre CPU (Apple M5), obteniendo 119 dB SNR en el audio decodificado en CPU/F32 y 68 dB en Metal/F32.

## Capacidades

- Generación de voz japonesa a partir de texto, frase a frase.
- Clonación de voz mediante grabación de referencia WAV de hasta 120 segundos.
- Uso de archivos de voz precalculados con `speech voice`, reutilizables entre tipos de cuantización y compatibles con v4.1-Small-MF.
- Voz descrita en lenguaje natural mediante el parámetro `instructions` (por ejemplo, tono, género y velocidad).
- Selección automática de voz por parte del modelo cuando se indica `--voice none` sin instrucciones.
- Voz derivada de un embedding de inversión de hablante (archivo `.speaker.safetensors`), exclusiva de este modelo.
- Control de pasos de muestreo (40 por defecto, 16 para menor latencia), guidance, schedule y escalado de hablante.
- Servidor HTTP compatible con la API de voz de OpenAI mediante `speech serve`.
- No soporta tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).

## Casos de uso

- Audiolibros y narración automatizada: el modelo lee frases en japonés con una voz consistente generada a partir de una única grabación de referencia, adecuado para contenido largo por la reutilización del archivo de voz.
- Doblaje y localización de contenido al japonés: permite generar voces con tono y estilo descritos en lenguaje natural, útil para adaptar guiones a distintos registros sin disponer de locutores.
- Asistentes de voz embebidos: con cuantización Q4_K (0,86 GB) puede ejecutarse en hardware modesto, integrándose en aplicaciones de escritorio o dispositivos con recursos limitados.
- Prototipado rápido de interfaces conversacionales: el servidor compatible con la API de OpenAI permite sustituir servicios TTS comerciales en entornos de desarrollo sin cambiar el código cliente.
- Accesibilidad: conversión de texto a voz para lectores de pantalla en japonés, con la posibilidad de personalizar la voz mediante instrucciones textuales.
- Generación de voces para videojuegos y contenido interactivo: la selección automática de voz y la clonación por referencia permiten crear múltiples personajes con pocos recursos de grabación.
- Investigación en TTS: la disponibilidad de cuantizaciones y de comparaciones de precisión frente a la implementación oficial facilita experimentos reproducibles en CPU y GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, WER, MMLU u otros) en la información disponible. La model card incluye únicamente métricas de fidelidad numérica frente a la implementación oficial:

| Comprobacion | CPU, F32 | Metal, F32 |
|---|---|---|
| Audio decodificado | 119 dB SNR | 68 dB |
| Latente muestreado, 40 pasos | 109 a 111 dB | 59 a 67 dB |
| Sintesis completa desde el ruido oficial | 75 a 110 dB, longitud oficial | 22 a 61 dB, misma longitud |

Además, se menciona una evaluación con speech-bench sobre 20 frases en japonés con semillas 1, 2 y 3, transcritas por Qwen3-ASR 1.7B en Q8, pero los resultados numéricos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,86 GB (Q4_K), 0,94 GB (Q5_K), 1,03 GB (Q6_K), 1,20 GB (Q8_0) y 1,91 GB (F16), sin contar el códec F32 de 48 kHz incluido en cada archivo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de memoria libre; las cuantizaciones Q4_K y Q5_K son las más adecuadas para equipos con recursos limitados.
- GPU recomendadas: no se especifican modelos concretos; la validación se realizó en Apple M5 con Metal. Cualquier GPU compatible con Metal o con los kernels de speech.cpp debería funcionar.
- Despliegue: exclusivamente mediante speech.cpp 0.8.0 o superior (CLI `speech tts`, servidor `speech serve`). No es compatible con llama.cpp, LM Studio, Ollama, vLLM ni TGI.
- Latencia: 16 pasos de Euler producen el primer audio en menos de la mitad del tiempo que 40 pasos; no se proporcionan cifras absolutas de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos TTS comparables en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Solo funciona en speech.cpp 0.8.0 o superior; los archivos GGUF tienen un layout propio y no son compatibles con llama.cpp, LM Studio, Ollama ni otras herramientas que leen GGUF.
- Soporta únicamente japonés; no hay capacidades multilingües.
- Procesa el texto una frase a la vez, sin ventana de contexto larga documentada.
- Las grabaciones de referencia están limitadas a 120 segundos.
- En GPU, el audio resultante es el mismo discurso pero no la misma forma de onda que en la implementación oficial, debido al redondeo distinto de los kernels matriciales.
- Los archivos de voz derivados de embeddings de inversión de hablante son exclusivos de este modelo; los archivos de voz normales son compatibles con v4.1-Small-MF.
- Riesgo de alucinación o artefactos en la síntesis no documentado en la información disponible.
- Sesgos de voz no documentados.
- Licencia MIT para el modelo y el códec, lo que permite uso comercial; el modelo base del códec está bajo Apache 2.0, cuyos términos deben respetarse.
- El repositorio ocupa 9,7 GB, aunque los archivos individuales son mucho menores.

## Enlaces

- [Hugging Face: sakasegawa/Irodori-TTS-v4.1-Small-GGUF](https://huggingface.co/sakasegawa/Irodori-TTS-v4.1-Small-GGUF)
- [Repositorio speech.cpp](https://github.com/nyosegawa/speech.cpp)
- [Instalación de speech.cpp](https://github.com/nyosegawa/speech.cpp#install)
- [Documentación de Irodori-TTS en speech.cpp](https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/irodori-tts.md)
- [Documentación de la CLI de speech.cpp](https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md)
- [Documentación del servidor de speech.cpp](https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md)
- [Repositorio original de Irodori-TTS (Aratako)](https://github.com/Aratako/Irodori-TTS)
- [Modelo base: Aratako/Irodori-TTS-v4.1-Small](https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small)
- [Códec: Aratako/Semantic-DACVAE-Japanese-32dim](https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim)
