# AuroraSystem/Ficus-1.0-12B

## Resumen

Ficus 1.0 12B es un modelo multimodal desarrollado por AuroraSystem que integra texto, visión y audio en una única pila de 12 000 millones de parámetros. Se construye sobre la arquitectura Gemma 4 Unified (`Gemma4UnifiedForConditionalGeneration`), con 48 capas, tamaño oculto de 3840 y un vocabulario de 262 144 tokens. Su ventana de contexto alcanza los 262 000 tokens, lo que lo sitúa en la franja de modelos de contexto largo orientados a tareas técnicas y de razonamiento multi-paso.

El modelo está diseñado para cargas de trabajo que combinan comprensión de documentos, imágenes y audio dentro de un mismo pipeline, con especial énfasis en dominios técnicos. Incorpora atención híbrida con capas de ventana deslizante y capas de atención completa, además de un torre de visión con proyector multimodal y un codificador de audio incluidos en el checkpoint.

Es relevante ahora porque representa una de las primeras implementaciones públicas de la arquitectura Gemma 4 Unified con soporte simultáneo de tres modalidades, licencia tipo Gemma y pesos en safetensors listos para `transformers`. Su rendimiento declarado en el benchmark propio ABench75 (92,7 % en el split público) y su ventana de 262 000 tokens lo posicionan como candidato para evaluación en entornos de investigación y despliegues técnicos, aunque su ecosistema de herramientas (vLLM, GGUF) presenta limitaciones documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 Unified (`Gemma4UnifiedForConditionalGeneration`), transformer híbrido con atención de ventana deslizante y atención completa |
| Parámetros totales | 11 959 730 176 (≈12 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantización | bf16 nativo; cuantización 4-bit mencionada por el autor para GPUs pequeñas; no se publica GGUF oficial |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Gemma (`license: other`, `license_name: gemma`) |
| Formato de pesos | safetensors (7 shards, ~24 GB en bf16); repositorio de 31,3 GB |

## Arquitectura y entrenamiento

Ficus 1.0 12B emplea la arquitectura Gemma 4 Unified con 48 capas y tamaño oculto de 3840. La atención es híbrida: por cada capa de atención completa hay cinco capas de ventana deslizante con ventana de 1024 tokens. Las capas de atención completa usan `head_dim` de 512 con una única cabeza KV, mientras que las capas deslizantes emplean `head_dim` de 256. Esta configuración reduce el coste de memoria de la caché KV en las capas deslizantes, pero las capas completas con `head_dim` 512 imponen requisitos específicos de memoria compartida en kernels Triton, lo que condiciona el soporte de vLLM en GPUs antiguas (sm_75).

El checkpoint incluye la torre de visión con su proyector multimodal y un codificador de audio, de modo que las tres modalidades se procesan dentro del mismo modelo. Los pesos se distribuyen en bfloat16 en siete shards safetensors (~24 GB). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El autor menciona un dataset propio, `AuroraSystem/ABench75`, usado para evaluación, y advierte que no hay alineamiento de seguridad más allá de los datos de entrenamiento.

## Capacidades

- Generación de texto y razonamiento en dominios técnicos, con especial rendimiento declarado en tareas de evaluación tipo ABench75.
- Comprensión de imágenes mediante torre de visión y proyector multimodal integrados en el checkpoint.
- Procesamiento de audio mediante codificador de audio incluido en el modelo.
- Conversación multi-turno con contexto de hasta 262 000 tokens.
- Razonamiento multi-paso y tareas de tipo agente (el autor etiqueta el modelo con `reasoning` y `conversational`).
- Capacidades multilingües limitadas a ruso e inglés.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis de documentación técnica multimodal: el modelo puede procesar capturas de diagramas, esquemas y texto asociado en una misma ventana de 262 000 tokens, lo que resulta adecuado para manuales extensos con figuras.
- Transcripción y razonamiento sobre audio técnico: gracias al codificador de audio integrado, puede resumir o extraer conclusiones de reuniones o notas de voz en inglés o ruso sin pipeline externo.
- Asistencia en soporte técnico especializado: su énfasis declarado en dominios técnicos y su ventana larga permiten mantener conversaciones multi-turno con historial extenso de incidencias.
- Evaluación de imágenes en control de calidad: la torre de visión permite clasificar o describir defectos en imágenes industriales dentro de flujos automatizados.
- Investigación en modelos multimodales: al ser una implementación de Gemma 4 Unified con visión y audio, sirve como base para experimentos de fusión de modalidades y evaluación de atención híbrida.
- Procesamiento de documentación bilingüe ru/en: útil en entornos corporativos que operan en ambos idiomas y necesitan un único modelo para extracción y resumen.
- Prototipado de agentes con contexto largo: la ventana de 262 000 tokens permite mantener estado de tareas largas, aunque la ausencia documentada de tool calling limita la orquestación automática.

## Benchmarks y rendimiento

| Benchmark | Split | Tareas | Resultado |
|---|---|---:|---:|
| ABench75 (global) | Público | 300 | 92,7 % |
| ABench75 (inglés) | Público | no disponible | 93,8 % |
| ABench75 (ruso) | Público | no disponible | 91,1 % |
| ABench75 (conocimiento general) | Público | no disponible | 85 % (dato citado en limitaciones) |

Medición realizada con el system prompt estándar de ABench75, decodificación greedy y `max_new_tokens=384`. El split privado (75 tareas) no fue evaluado para esta versión. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: ~24 GB para los pesos, más memoria para caché KV y activaciones; el autor indica que se necesitan 2×T4 con tensor parallelism o cuantización 4-bit en GPUs menores.
- GPUs recomendadas: A100 40/80 GB, H100, o configuraciones multi-GPU con T4; en consumer GPU, una RTX 4090 (24 GB) queda al límite en bf16 y requiere cuantización 4-bit para margen operativo.
- vLLM no es utilizable en T4: las capas de atención completa con `head_dim` 512 superan el límite de 64 KB de memoria compartida de los kernels Triton en sm_75. El autor recomienda `transformers` como vía de despliegue.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor`; no se publica GGUF oficial y la conversión disponible sería solo texto, perdiendo visión y audio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Ficus 1.0 12B | ≈12 B | 262 000 | texto, visión, audio | Gemma | safetensors, transformers |
| Gemma 3 12B (referencia de la familia) | ≈12 B | no disponible en esta ficha | texto, visión | Gemma | safetensors, GGUF, vLLM |
| Modelos multimodales de 12 B con audio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparables con alternativas de la misma categoría, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Rendimiento más débil en conocimiento general (85 % en ABench75) que en dominios técnicos, según el propio autor.
- Solo se ha medido el split público del benchmark; el split privado no fue evaluado, lo que limita la confianza en la generalización.
- Sin alineamiento de seguridad más allá de los datos de entrenamiento: riesgo de respuestas inapropiadas o sesgadas en producción.
- Idiomas limitados a ruso e inglés; no se declara soporte de castellano ni de otros idiomas.
- La conversión a GGUF pierde las rutas de visión y audio, dejando un modelo solo texto.
- vLLM no es viable en GPUs sm_75 (T4) por el límite de memoria compartida de los kernels Triton con `head_dim` 512.
- Licencia Gemma: existen restricciones de uso comercial que deben revisarse en los términos oficiales antes de desplegar en producción.
- Riesgo de alucinación no cuantificado en la información disponible; debe evaluarse empíricamente en el dominio de aplicación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria aún inexistentes.

## Enlaces

- [Hugging Face: AuroraSystem/Ficus-1.0-12B](https://huggingface.co/AuroraSystem/Ficus-1.0-12B)
- [Dataset ABench75](https://huggingface.co/datasets/AuroraSystem/ABench75)
- [Licencia Gemma](https://ai.google.dev/gemma/terms)
