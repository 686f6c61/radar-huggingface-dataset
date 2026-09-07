# pnsw123/asset-7f2c9d

## Resumen

El modelo `pnsw123/asset-7f2c9d` es una conversión en formato GGUF de un fine-tune de reconocimiento automático de voz (ASR) para árabe dialectal. El modelo original es un ajuste fino de `oddadmix/nemotron-3.5-asr-arabic-dialectal`, que a su vez parte del checkpoint base `nvidia/nemotron-3.5-asr-streaming-0.6b`, una arquitectura FastConformer-RNNT-with-prompt de NVIDIA. El autor de la conversión es `pnsw123`, y el propósito es facilitar la inferencia de ASR mediante `transcribe.cpp`, un proyecto basado en ggml que permite ejecutar modelos de voz en CPU o GPU con un consumo de memoria reducido.

El modelo tiene aproximadamente 638 millones de parámetros (637.991.968), lo que lo sitúa en la categoría de modelos pequeños de ASR. No se especifica la longitud de contexto en la información disponible, aunque el checkpoint base está diseñado para streaming. La conversión incluye varias cuantizaciones (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que permiten ajustar el equilibrio entre precisión y uso de memoria.

La relevancia de este modelo radica en que ofrece una opción práctica para transcribir audio en árabe dialectal con herramientas de código abierto y sin necesidad de GPUs potentes. Sin embargo, la licencia del fine-tune original es ambigua ("other" sin términos enlazados), por lo que se recomienda verificar los términos con el autor antes de cualquier uso más allá de pruebas locales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT-with-prompt |
| Parámetros totales | 637.991.968 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Árabe dialectal (según fine-tune) |
| Licencia | Otra (other); base: OpenMDW-1.1 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura FastConformer-RNNT-with-prompt, que combina un codificador basado en Conformer (una variante del transformer diseñada para audio) con un decodificador RNN-Transducer (RNNT). El sufijo "with-prompt" indica que el modelo admite un contexto de prompt para condicionar la transcripción, una característica útil para adaptar el reconocimiento a vocabularios específicos. El checkpoint base es `nvidia/nemotron-3.5-asr-streaming-0.6b`, optimizado para streaming, es decir, para procesar audio de forma incremental.

El fine-tune original (`oddadmix/nemotron-3.5-asr-arabic-dialectal`) es un ajuste directo sobre el checkpoint base, sin cambios en el vocabulario ni en el tokenizer; el tamaño del vocabulario se mantiene en 13.087 tokens. No se dispone de información sobre el volumen de datos de entrenamiento ni sobre la composición del dataset. La conversión a GGUF se realizó con el script `convert-parakeet.py` del repositorio `transcribe.cpp`, y la cuantización se llevó a cabo con `transcribe-quantize`.

## Capacidades

- Reconocimiento automático de voz (ASR) para árabe dialectal, basado en un fine-tune específico.
- Soporte de decodificación en streaming, heredado del checkpoint base `nvidia/nemotron-3.5-asr-streaming-0.6b`.
- Soporte de prompt para condicionar la transcripción (según la arquitectura "with-prompt").
- Formato GGUF compatible con `transcribe.cpp`, lo que permite inferencia en CPU y GPU con bajo consumo de memoria.
- Disponibilidad de varias cuantizaciones (de 4 a 32 bits) para ajustar la precisión y el uso de recursos.
- No es un modelo de lenguaje; no soporta generación de texto, tool calling, agentes ni razonamiento multi-paso. Sus capacidades se limitan a la transcripción de audio.

## Casos de uso

- Transcripción de entrevistas y grabaciones de campo en árabe dialectal: el modelo puede procesar archivos de audio y generar texto, lo que resulta útil para periodistas e investigadores que trabajan con hablantes dialectales.
- Subtitulado automático de vídeos: al ser un modelo compacto y disponible en GGUF, se puede integrar en pipelines de procesamiento por lotes para generar subtítulos en vídeos de plataformas como YouTube o redes sociales.
- Asistentes de voz en aplicaciones de mensajería o servicios locales: el soporte de streaming permite transcribir la voz del usuario en tiempo real, habilitando comandos de voz en aplicaciones dirigidas a poblaciones que hablan árabe dialectal.
- Análisis de llamadas de atención al cliente: el modelo puede transcribir conversaciones telefónicas para su posterior análisis de sentimiento o extracción de información, siempre que el audio sea en árabe dialectal.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real puede usarse en sistemas de subtitulado en vivo para eventos o aulas, gracias a la capacidad de streaming y al bajo coste computacional.
- Dictado en entornos clínicos o legales: profesionales que trabajan con pacientes o clientes arabófonos pueden utilizar el modelo para dictar notas o transcribir declaraciones, aprovechando su soporte de prompt para incluir terminología específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo de pesos más un pequeño overhead. Para Q4_K_M (~473 MB) se necesita alrededor de 1 GB de VRAM o RAM; para Q8_0 (~716 MB) unos 1,5 GB; para F16 (~1,2 GB) unos 2 GB; para F32 (~2,4 GB) unos 3 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 1 GB de VRAM para las cuantizaciones pequeñas (por ejemplo, GTX 1650, RTX 3050). Para F32 se recomienda una GPU con 4 GB o más.
- Sí cabe en GPU de consumo: las versiones Q4_K_M, Q5_K_M, Q6_K y Q8_0 pueden ejecutarse en GPUs de gama baja e incluso en CPU.
- Opciones de despliegue: `transcribe.cpp` es el destino principal, basado en ggml. También podría usarse con otras herramientas compatibles con GGUF, aunque no se mencionan en la documentación.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni características de otros modelos comparables.

## Limitaciones y advertencias

- La licencia del fine-tune original es "other" sin términos enlazados; se debe verificar con el autor (`oddadmix`) antes de cualquier uso comercial o en producción.
- El checkpoint base tiene licencia OpenMDW-1.1; es necesario revisar sus condiciones en [https://openmdw.ai/license/1-1/](https://openmdw.ai/license/1-1/).
- El modelo está especializado en árabe dialectal; no se garantiza un rendimiento adecuado en árabe moderno estándar ni en otros idiomas.
- Al ser un modelo de ASR, existe riesgo de errores de transcripción (alucinaciones) en audio con ruido, acentos poco comunes o superposición de voces.
- No se han publicado resultados de benchmarks, por lo que no es posible evaluar su precisión en comparación con otros modelos.
- El repositorio de HuggingFace no muestra descargas ni uso previo; se trata de una conversión de un modelo de terceros, no de un modelo original con validación extensa.

## Enlaces

- HuggingFace: https://huggingface.co/pnsw123/asset-7f2c9d
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Fine-tune original: https://huggingface.co/oddadmix/nemotron-3.5-asr-arabic-dialectal
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Licencia OpenMDW: https://openmdw.ai/license/1-1/
