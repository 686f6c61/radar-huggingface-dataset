# neuphonic/neutts-2e-q4-gguf

## Resumen

NeuTTS 2E Q4 GGUF es una versión cuantizada a 4 bits del modelo NeuTTS 2E de Neuphonic, un sistema de síntesis de voz (text-to-speech) orientado a la generación de habla expresiva con control emocional. El modelo está empaquetado en formato GGUF, lo que facilita su despliegue en entornos de inferencia locales mediante runtimes compatibles con este formato, y se distribuye bajo licencia Apache 2.0 con acceso restringido (gated) que requiere aceptar condiciones en Hugging Face.

Con aproximadamente 236 millones de parámetros, se trata de un modelo compacto pensado para síntesis de voz en inglés, con etiquetas que destacan capacidades de emoción y expresividad ("emotion", "emotions", "expressive-tts", "emotional-tts"). La cuantización Q4 reduce el peso del repositorio a 1,1 GB, lo que lo hace manejable en hardware modesto.

Su relevancia actual radica en la demanda creciente de TTS local, privado y controlable emocionalmente, frente a soluciones propietarias en la nube. La disponibilidad en GGUF y su compatibilidad declarada con endpoints lo convierten en candidato para integraciones en pipelines de voz sin dependencia de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 236.039.680 (~236 M) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (GGUF); otras variantes no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | GGUF (con metadatos imatrix) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de su naturaleza como sistema text-to-speech. El tag "imatrix" en el repo sugiere que la cuantización se realizó empleando matrices de importancia (importance matrix) para preservar la calidad en la compresión a 4 bits, una técnica habitual en la familia GGUF para mitigar la degradación de calidad en cuantizaciones agresivas.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas específicas (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- Generación de habla expresiva con control emocional, según las etiquetas del modelo ("emotion", "emotional-tts", "expressive-tts").
- Orientación a voz conversacional ("conversational").
- Compatibilidad declarada con endpoints ("endpoints_compatible"), lo que facilita su exposición como servicio.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada en la información disponible.
- Multilingüismo limitado al inglés.

## Casos de uso

- Asistentes de voz conversacionales: el modelo puede generar respuestas habladas con matices emocionales en inglés, adecuado para sistemas de atención automatizada donde el tono importa.
- Audiolibros y narración expresiva: la capacidad de control emocional permite modular la locución según el contenido narrativo, diferenciando diálogos y pasajes.
- Doblaje y localización de contenido: generación de pistas de voz en inglés para vídeos, tutoriales o material formativo con variación emocional.
- Sistemas de accesibilidad: lectura en voz alta de textos para usuarios con discapacidad visual, con entonación más natural gracias al componente expresivo.
- Prototipado de interfaces de voz: al ser un modelo compacto (~236 M de parámetros) en GGUF Q4 (1,1 GB), permite iterar localmente sin costes de API.
- Integración en pipelines de medios: generación de voz para podcasts sintéticos o contenido generado por IA donde se requiere control de emoción y despliegue privado.
- Investigación en TTS emocional: base ligera para experimentos de evaluación de expresividad y comparación de cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio Q4 ocupa 1,1 GB, por lo que la inferencia en esta cuantización debería requerir del orden de 1-2 GB de memoria, dependiendo del runtime y del contexto (estimación basada en el tamaño del fichero; no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería poder alojarlo; no hay datos oficiales.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs con al menos 2-4 GB de VRAM, dado el tamaño del modelo cuantizado.
- Opciones de despliegue: runtimes compatibles con GGUF (llama.cpp y derivados como Ollama); el tag "endpoints_compatible" sugiere exposición como endpoint HTTP. Soporte específico de vLLM o TGI no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NeuTTS 2E Q4 GGUF | ~236 M | no disponible | en | Apache 2.0 (gated) | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se ofrecen cifras de rendimiento comparativo para evitar datos no verificados.

## Limitaciones y advertencias

- Solo soporta inglés; no apto para síntesis multilingüe sin modelos adicionales.
- La cuantización Q4 puede degradar la calidad y expresividad respecto a los pesos originales en precisión completa; conviene validar la calidad emocional en la variante cuantizada.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar, lo que puede afectar a la automatización de despliegues.
- No se documentan sesgos específicos del modelo; como todo TTS entrenado con datos de voz, puede heredar sesgos de acento, género o prosodia del corpus original.
- Riesgo de artefactos o pronunciaciones incorrectas en textos con nombres propios, siglas o dominios especializados.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de acceso del repositorio gated.
- No hay datos publicados de benchmarks ni de latencia que permitan garantizar niveles de servicio en producción.

## Enlaces

- Hugging Face: https://huggingface.co/neuphonic/neutts-2e-q4-gguf
- No se han encontrado en la información proporcionada otros enlaces (papers, blogs, repositorios o demos) adicionales.
