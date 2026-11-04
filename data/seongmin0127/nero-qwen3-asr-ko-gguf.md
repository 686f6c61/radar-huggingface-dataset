# seongmin0127/nero-qwen3-asr-ko-gguf

## Resumen

Nero Qwen3-ASR Korean GGUF es una conversión a formato GGUF de dos modelos de la familia Qwen3 orientados al reconocimiento automático de voz (ASR) en coreano, publicada por el desarrollador seongmin0127 para su uso dentro de la aplicación de grabación de reuniones Nero. El paquete incluye dos artefactos: un modelo ASR de aproximadamente 1,7 mil millones de parámetros, afinado para coreano a partir de Qwen/Qwen3-ASR-1.7B por TeamUNIVA, y un alineador forzado de 0,6 mil millones de parámetros derivado de Qwen/Qwen3-ForcedAligner-0.6B, que permite obtener marcas de tiempo a nivel de palabra.

No se trata de un modelo entrenado desde cero ni de un fine-tuning nuevo: el autor declara explícitamente que no se han modificado los pesos más allá de la conversión de formato y la cuantización. La relevancia es práctica: empaqueta en GGUF cuantizado un pipeline ASR coreano con alineación temporal, ejecutable mediante la CLI CrispASR, lo que facilita su despliegue en entornos locales sin depender de safetensors y frameworks pesados.

El repositorio tiene un tamaño de 3,8 GB y, en el momento de la consulta, no registra descargas ni interacciones, por lo que debe considerarse un artefacto de nicho orientado a un caso de uso muy concreto: transcripción posterior a la grabación de reuniones en coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3-ASR; no se detalla en la model card) |
| Parámetros totales | 2.349.243.536 (suma de ambos checkpoints en safetensors; ASR ~1,7B + alineador ~0,6B) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 con tensores de audio en F16 (ASR); Q8_0 (alineador); también se genera un GGUF F16 intermedio |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en los modelos originales) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de los modelos base. Por la información disponible, el componente ASR deriva de Qwen/Qwen3-ASR-1.7B, un modelo de reconocimiento de voz de la familia Qwen3, y el componente de alineación deriva de Qwen/Qwen3-ForcedAligner-0.6B, un modelo de alineación forzada que produce marcas de tiempo. El modelo ASR incluido es un fine-tune coreano realizado por TeamUNIVA sobre el checkpoint original de Qwen; el autor de este repositorio no aporta detalles sobre los datos de entrenamiento, el número de tokens ni si hubo etapas de RLHF o DPO.

La contribución técnica de este repositorio es exclusivamente de empaquetado y cuantización, realizada con CrispASR v0.8.50 (commit `5c96e5521c6ab40ab53b91eeec54ced9c30562b5`, licencia MIT). El proceso consistió en convertir los checkpoints safetensors a GGUF F16 y después cuantizar. En el modelo ASR se aplicó Q8_0 a todos los tensores excepto los del codificador de audio, que se mantuvieron en F16 mediante el patrón `^audio\.=f16`; el autor documenta que cuantizar todos los tensores a Q8_0 provocaba pérdida de frases en las pruebas. El alineador se cuantizó íntegramente a Q8_0.

## Capacidades

- Reconocimiento automático de voz en coreano a partir de audio, con salida de transcripción.
- Alineación forzada con marcas de tiempo a nivel de palabra mediante el modelo alineador de 0,6B, activable con la opción `-am` de la CLI CrispASR.
- Ejecución local mediante la CLI CrispASR con el backend `qwen3-1.7b`.
- Pipeline de dos etapas: transcripción con el modelo ASR y alineación temporal posterior.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling, agentes ni modos de razonamiento.
- No se documentan capacidades multimodales más allá del procesamiento de audio de entrada.

## Casos de uso

- Transcripción de reuniones en coreano: el pipeline está diseñado específicamente para la grabación de reuniones en Nero, transcribiendo el audio una vez finalizada la grabación con el modelo ASR de 1,7B.
- Generación de subtítulos con tiempos por palabra: el alineador de 0,6B permite obtener marcas de tiempo a nivel de palabra, útiles para subtítulos sincronizados o para resaltar la palabra activa durante la reproducción.
- Indexación y búsqueda de audio: las transcripciones con timestamps permiten construir índices buscables sobre grabaciones largas y saltar al instante exacto de una intervención.
- Actas y resúmenes automáticos de reuniones: la transcripción sirve como entrada a un pipeline posterior de resumen o extracción de acuerdos, sin salir de un entorno local.
- Procesamiento por lotes en local: al ser GGUF cuantizado, puede ejecutarse en estaciones de trabajo sin GPU de datacenter para transcribir archivos de audio de forma desatendida.
- Archivado y cumplimiento en entornos con requisitos de privacidad: al ejecutarse con la CLI CrispASR de forma local, el audio no necesita enviarse a servicios externos, lo que encaja en escenarios con datos sensibles.
- Prototipado de aplicaciones de voz en coreano: sirve como componente ASR de referencia para desarrolladores que quieran integrar transcripción coreana en sus propias herramientas sin depender de APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el archivo ASR Q8_0 con audio en F16 ocupa 2.800.109.184 bytes (~2,6 GiB) y el alineador Q8_0 ocupa 985.594.624 bytes (~0,92 GiB); la suma de pesos ronda los 3,5 GiB, a lo que hay que añadir el overhead de contexto y activaciones durante la inferencia.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por el tamaño de los pesos, ambos componentes podrían caber en GPUs de consumo con 8 GB o más de VRAM, pero este dato no está verificado en la model card.
- Opciones de despliegue: CLI CrispASR (backend `qwen3-1.7b`, opción `-am` para timestamps por palabra). No se documentan otros runners como llama.cpp, Ollama, vLLM o TGI para estos artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nero Qwen3-ASR Korean GGUF (este) | ~2,35B en total (ASR ~1,7B + alineador ~0,6B) | no disponible | coreano | Apache 2.0 | GGUF | Cuantización Q8_0/F16 de modelos Qwen3; requiere CrispASR |
| TeamUNIVA/qwen3_asr_1.7b_ko | ~1,7B (ASR) | no disponible | coreano | Apache 2.0 | safetensors | Modelo original del que deriva el ASR; sin cuantizar |
| Qwen/Qwen3-ASR-1.7B | ~1,7B | no disponible | no disponible | Apache 2.0 | safetensors | Modelo base de Qwen previo al fine-tune coreano |
| Qwen/Qwen3-ForcedAligner-0.6B | ~0,6B | no disponible | no disponible | Apache 2.0 | safetensors | Alineador forzado original; en este repo se incluye en Q8_0 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en precisión de transcripción frente a alternativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en coreano; no se documenta soporte para otros idiomas.
- La cuantización Q8_0 completa del modelo ASR degradó la calidad (pérdida de frases en las pruebas del autor), por lo que el codificador de audio se mantiene en F16; cualquier recuantización adicional debería validarse con cuidado.
- No hay benchmarks publicados, por lo que la calidad relativa frente a otros sistemas ASR coreanos no está cuantificada.
- El repositorio no registra descargas ni validación por parte de la comunidad; es un artefacto de nicho mantenido por un único autor.
- El despliegue documentado depende de la CLI CrispASR; no se garantiza compatibilidad con otros runners GGUF habituales.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o vocabulario especializado; no se documentan mitigaciones.
- No se documentan sesgos específicos del modelo; al derivar de Qwen3, podría heredar sesgos de los datos de entrenamiento originales, no detallados en la model card.
- Licencia Apache 2.0 permite uso comercial, pero la propiedad intelectual de los pesos originales sigue siendo de Qwen (Alibaba) y TeamUNIVA; conviene conservar los avisos de licencia correspondientes.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción sin pruebas propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/seongmin0127/nero-qwen3-asr-ko-gguf
- Modelo ASR original (fine-tune coreano): https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Alineador forzado original: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Herramienta de conversión y cuantización CrispASR: https://github.com/CrispStrobe/CrispASR
