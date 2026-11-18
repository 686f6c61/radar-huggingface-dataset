# CohereLabs/cohere-transcribe-03-2026

## Resumen

Cohere Transcribe 03-2026 es un modelo de reconocimiento automático del habla (ASR) desarrollado por CohereLabs, publicado en Hugging Face bajo licencia Apache 2.0. Con aproximadamente 2.066 millones de parámetros (2,07 B) y un repositorio de 4,1 GB, se distribuye en formato safetensors con código propio (`custom_code`) y se integra en la librería `transformers` mediante la arquitectura `cohere_asr`. Está diseñado específicamente para transcripción de audio multilingüe y cubre 14 idiomas: árabe, alemán, griego, inglés, español, francés, italiano, japonés, coreano, neerlandés, polaco, portugués, vietnamita y chino.

El modelo resuelve el problema de la transcripción automática de voz en entornos multilingües con una única arquitectura, evitando la necesidad de mantener pipelines separados por idioma. Su tamaño de 2 B parámetros lo sitúa en un rango manejable para despliegue en servidores con aceleradores de gama alta, y su licencia permisiva (Apache 2.0) facilita la integración en productos comerciales sin las restricciones habituales de otros modelos ASR propietarios.

Su relevancia actual radica en la combinación de cobertura lingüística amplia (incluyendo idiomas habitualmente infrarrepresentados en ASR como griego, vietnamita o polaco), licencia abierta y compatibilidad con el ecosistema `transformers` y con endpoints desplegables en Azure. El acceso está restringido (gated) en Hugging Face, por lo que es necesario aceptar las condiciones del repositorio antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `cohere_asr` (implementación propia sobre `transformers`, con `custom_code`) |
| Parametros totales | 2.065.804.048 (~2,07 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar, de, el, en, es, fr, it, ja, ko, nl, pl, pt, vi, zh (14 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,1 GB |
| Pipeline | automatic-speech-recognition |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Compatibilidad de despliegue | endpoints compatibles, despliegue en Azure |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de la etiqueta `cohere_asr` y del uso de `custom_code` en `transformers`. No se especifica si se trata de un transformer encoder-decoder clásico, de un modelo híbrido con componentes convolucionales, ni si emplea técnicas de atención lineal o decodificación especulativa. Tampoco se han publicado datos sobre el número de tokens de audio utilizados en el entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO.

Lo que sí se puede afirmar es que el modelo se distribuye con pesos en safetensors de aproximadamente 4,1 GB, coherente con un modelo de 2,07 B parámetros en precisión de 16 bits (2,07 B × 2 bytes ≈ 4,14 GB). La arquitectura está registrada en el ecosistema `transformers` mediante código propio, lo que implica que los usuarios deben confiar en la implementación publicada por CohereLabs para cargar y ejecutar el modelo.

## Capacidades

- Reconocimiento automático del habla (ASR) y transcripción de audio a texto.
- Cobertura multilingüe de 14 idiomas: árabe, alemán, griego, inglés, español, francés, italiano, japonés, coreano, neerlandés, polaco, portugués, vietnamita y chino.
- Integración con el pipeline `automatic-speech-recognition` de `transformers`.
- Compatibilidad con endpoints desplegables y despliegue en Azure.
- Evaluación publicada en el leaderboard de ASR de Hugging Face (`hf-asr-leaderboard`), lo que indica que el modelo ha sido sometido a evaluaciones comparativas dentro del ecosistema.
- No se dispone de información sobre soporte de tool calling, capacidades de agente, modo de razonamiento explícito, visión, audio de salida u otras capacidades especiales más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y videoconferencias multilingües: el modelo puede convertir audio de sesiones de trabajo en texto para actas y resúmenes, cubriendo equipos distribuidos que hablan español, inglés, francés o alemán sin necesidad de cambiar de pipeline por idioma.
- Subtitulado automático de contenido audiovisual: generación de pistas de subtítulos para vídeos en los 14 idiomas soportados, con la ventaja de una licencia Apache 2.0 que permite su uso en plataformas comerciales de streaming o educación.
- Atención al cliente basada en voz: transcripción de llamadas entrantes en centros de contacto para su análisis posterior, indexación y cumplimiento normativo, integrándose en flujos desplegados en Azure mediante endpoints compatibles.
- Documentación clínica dictada: conversión de notas de voz de profesionales sanitarios en texto estructurado, aprovechando el soporte de idiomas europeos como español, italiano, neerlandés o polaco.
- Accesibilidad y transcripción en directo: generación de texto en tiempo real para personas con discapacidad auditiva en eventos, clases o retransmisiones, con la posibilidad de desplegar el modelo en infraestructura propia al ser de pesos abiertos.
- Análisis de encuestas y entrevistas de investigación: transcripción por lotes de grabaciones cualitativas en múltiples idiomas para su posterior codificación y análisis temático, con coste controlado al no depender de APIs propietarias.
- Indexación y búsqueda de archivos de audio: conversión de archivos históricos de audio a texto para construir índices de búsqueda semántica sobre archivos de radio, podcast o archivos institucionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta `eval-results` y figura en el `hf-asr-leaderboard`, pero los valores concretos de WER (word error rate) u otras métricas no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 4,1 GB, por lo que se necesita al menos esa cantidad de memoria más el overhead de activaciones y del procesador de audio. En la práctica, se recomienda un mínimo de 8 GB de VRAM para inferencia en FP16.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para despliegues de producción; RTX 3090 o RTX 4080 para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en FP16 (RTX 3070/4060 Ti en adelante), siempre que se gestione el tamaño de lote de audio.
- Opciones de despliegue: `transformers` con `custom_code` (requiere `trust_remote_code=True`), endpoints compatibles y despliegue en Azure según las etiquetas del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa. Como referencia cualitativa, se puede señalar que el modelo compite en la categoría de ASR multilingüe de pesos abiertos, donde alternativas habituales son Whisper (OpenAI) y sus variantes, pero no se han proporcionado cifras de WER, parámetros ni contexto para contrastar.

| Modelo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| Cohere Transcribe 03-2026 | ~2,07 B | 14 | Apache 2.0 | safetensors |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga, lo que puede añadir fricción en pipelines automatizados.
- Dependencia de `custom_code`: la carga del modelo requiere `trust_remote_code=True`, lo que implica ejecutar código publicado por CohereLabs; conviene auditar la implementación antes de usarla en producción.
- Idiomas limitados a 14: no cubre lenguas como hindi, ruso, turco o lenguas cooficiales de España distintas del español, lo que restringe su uso en determinados mercados.
- Riesgo de alucinación en ASR: como todo modelo generativo de transcripción, puede producir texto plausible pero incorrecto en segmentos de audio con ruido, acentos marcados o solapamiento de hablantes; se recomienda validación humana en contextos críticos.
- Sesgos: no se han publicado análisis de sesgo por acento, género o dialecto; es esperable un rendimiento desigual entre variantes dialectales de un mismo idioma.
- Sin datos de benchmarks públicos en la información disponible: la ausencia de cifras de WER verificables dificulta la comparación objetiva con alternativas.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar las condiciones del acceso gated y las obligaciones de atribución.
- No se especifican requisitos de contexto de audio ni duración máxima de segmento, lo que obliga a validar empíricamente el comportamiento con audios largos.

## Enlaces

- Hugging Face: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- DOI: https://doi.org/10.57967/hf/8653
- Leaderboard ASR de Hugging Face: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Documentación de `transformers` para modelos de audio: https://huggingface.co/docs/transformers/main/en/tasks/asr
- Configuración de Teams Phone en canal de voz (Microsoft Learn): https://learn.microsoft.com/en-us/dynamics365/contact-center/administer/configure-teams-phone-in-voice-channel
