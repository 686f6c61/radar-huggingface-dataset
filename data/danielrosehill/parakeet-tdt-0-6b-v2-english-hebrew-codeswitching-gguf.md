# danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-GGUF

## Resumen

Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-GGUF es una cuantización en formato GGUF del modelo de reconocimiento automático del habla (ASR) Parakeet-TDT-0.6B-v2, adaptado por Daniel Rosehill para transcribir audio con alternancia de código (code-switching) entre inglés y hebreo. El modelo original parte de la arquitectura Parakeet de NVIDIA, basada en un encoder conformer y un decodificador *token-and-duration transducer* (TDT), y esta versión concreta ha sido ajustada para manejar utterances en las que el hablante cambia de idioma dentro de la misma frase, un escenario frecuente en comunidades bilingües.

Con 617.869.958 parámetros (aproximadamente 0,6 mil millones), el modelo es lo bastante compacto como para desplegarse en hardware modesto, especialmente en su formato GGUF cuantizado, que está pensado para su uso con la herramienta `transcribe.cpp`. La licencia CC-BY-4.0 permite uso comercial con atribución, aunque el acceso al repositorio está restringido y requiere aceptar las condiciones en Hugging Face.

Su relevancia actual radica en dos factores: por un lado, cubre un nicho poco atendido como es el ASR bilingüe inglés-hebreo con alternancia de código; por otro, su empaquetado en GGUF facilita la inferencia local en CPU y GPU de consumo sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet (encoder conformer + decodificador TDT, token-and-duration transducer) |
| Parametros totales | 617.869.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas en la informacion disponible) |
| Idiomas soportados | en, he |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la familia Parakeet de NVIDIA, que combina un encoder de tipo conformer con un decodificador *token-and-duration transducer* (TDT). La variante TDT predice conjuntamente tokens y duraciones, lo que permite una decodificación más eficiente que los transductores clásicos y reduce el número de pasos necesarios para emitir la transcripción. El modelo base es Parakeet-TDT-0.6B-v2, sobre el que se ha realizado un ajuste específico para code-switching inglés-hebreo.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del corpus de ajuste, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). Tampoco se documentan innovaciones adicionales más allá de la propia arquitectura TDT y el ajuste bilingüe. Esta ficha se limita a los datos verificables del repositorio.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y hebreo.
- Transcripción con alternancia de código (code-switching) dentro de una misma utterance.
- Salida de transcripción de audio a texto.
- Orientado a inferencia local mediante el formato GGUF y la herramienta `transcribe.cpp`.
- No se documenta soporte de tool calling, agentes, visión, audio generation ni modo de razonamiento extendido.
- Capacidades multilingües limitadas a los dos idiomas indicados (en, he).

## Casos de uso

- Transcripción de reuniones bilingües: el modelo puede procesar conversaciones en las que los participantes alternan inglés y hebreo, algo común en equipos internacionales con sede en Israel o en organizaciones con personal angloparlante e hispanohablante de origen israelí.
- Subtitulado de contenido audiovisual: útil para generar subtítulos de vídeos, pódcasts o clases en las que se mezclan ambos idiomas, aprovechando el ajuste específico para code-switching.
- Atención al cliente en centros de contacto: transcripción de llamadas de soporte donde el cliente puede cambiar de idioma a mitad de frase, facilitando el análisis posterior y el cumplimiento normativo.
- Investigación lingüística: análisis de corpus orales bilingües para estudiar patrones de alternancia de código, gracias a la disponibilidad del modelo en formato GGUF para ejecución local y reproducible.
- Documentación clínica o legal: transcripción de entrevistas o declaraciones en contextos donde el hablante usa ambos idiomas, con despliegue on-premise para preservar la confidencialidad de los datos.
- Prototipado y experimentación: al ser un modelo de 0,6B en GGUF, permite iterar rápidamente en local con `transcribe.cpp` sin necesidad de GPUs de gama alta, lo que lo hace adecuado para pruebas de concepto en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 617,9 M de parámetros en GGUF cuantizado se puede estimar un consumo del orden de 1 a 2,5 GB según la cuantización, aunque esta cifra es una estimación general y no un dato del repositorio.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, el modelo es apto para GPUs de consumo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo y el formato GGUF, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: `transcribe.cpp` (según los tags del repositorio); no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-GGUF | 617,9 M | no disponible | en, he | cc-by-4.0 | GGUF |
| Whisper large-v3 (referencia ASR) | no disponible en esta ficha | no disponible | multilingue | MIT (habitual) | safetensors, GGUF |
| Parakeet-TDT-0.6B-v2 (modelo base NVIDIA) | ~0,6 B | no disponible | en (principalmente) | no disponible en esta ficha | safetensors |

La comparación con Whisper large-v3 y con el Parakeet original se ofrece solo como referencia de categoría; no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es *gated* y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idiomas limitados a inglés y hebreo; no se garantiza un rendimiento adecuado en otros idiomas.
- No se documentan métricas de calidad (WER) ni evaluación sobre conjuntos de test, por lo que el rendimiento real en producción es desconocido.
- Riesgo de alucinación y errores de transcripción inherente a todo modelo ASR, especialmente en audio ruidoso o con acentos marcados.
- No se documentan sesgos específicos, pero al ser un ajuste sobre un modelo base entrenado con datos no especificados, pueden heredarse sesgos del corpus original.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base de NVIDIA por si imponen restricciones adicionales.
- El formato GGUF y la dependencia de `transcribe.cpp` limitan las opciones de integración frente a ecosistemas más extendidos como Transformers o vLLM.
- No se especifican requisitos de hardware oficiales ni límites de duración de audio.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-GGUF
- Modelo base (safetensors): https://huggingface.co/danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching
- Perfil del autor: https://huggingface.co/danielrosehill
