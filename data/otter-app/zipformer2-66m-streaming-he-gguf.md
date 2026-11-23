# otter-app/zipformer2-66m-streaming-he-gguf

## Resumen

zipformer2-66m-streaming-he-gguf es la conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) thewh1teagle/zipformer2-66m-streaming-he, publicada por el usuario otter-app para su descarga bajo demanda desde la aplicación Otter. Se trata de un modelo Zipformer2 de aproximadamente 66,6 millones de parámetros, diseñado para transcripción de voz en modo streaming, es decir, con procesamiento incremental de audio a medida que llega la señal en lugar de requerir el fichero completo.

El modelo es una copia sin modificaciones de la conversión previa vibe-app/zipformer2-66m-streaming-he-gguf, que a su vez deriva del modelo original en formato nativo. El sufijo "he" del identificador sugiere que está especializado en hebreo, aunque la información disponible no confirma de forma explícita el conjunto de idiomas soportados. Su tamaño reducido y su formato GGUF lo hacen adecuado para inferencia en CPU y en dispositivos con recursos limitados, lo que encaja con el caso de uso previsto: transcripción local dentro de una aplicación de escritorio.

La relevancia de esta ficha radica en su naturaleza de artefacto de distribución más que de modelo de investigación: es un binario cuantizado (q8_0) pensado para ser consumido por un runtime GGML concreto. No hay información publicada sobre datos de entrenamiento, benchmarks ni evaluación independiente, por lo que cualquier decisión de producción debe apoyarse en pruebas propias sobre el dominio objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 (transformer con codificador convolucional y atención, variante streaming) |
| Parámetros totales | 66.609.996 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8_0 (fichero incluido en el repo); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (el sufijo "he" sugiere hebreo, sin confirmación en la información disponible) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (librería ggml) |

## Arquitectura y entrenamiento

Zipformer2 es la segunda generación de la familia Zipformer, una arquitectura de codificador para ASR que combina bloques de atención multi-cabeza con módulos convolucionales y un esquema de downsampling progresivo por etapas. La variante "streaming" está configurada para operar con ventanas de audio incrementales, lo que permite emitir transcripciones parciales con latencia acotada. El modelo cuenta con 66.609.996 parámetros, un tamaño propio de modelos ASR ligeros orientados a despliegue en dispositivo.

No se dispone de información sobre el corpus de entrenamiento, el número de horas de audio, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste como RLHF, DPO o destilación. Tampoco se documentan innovaciones adicionales más allá de las propias de la arquitectura Zipformer2. El artefacto publicado es una conversión de formato, no un reentrenamiento: los pesos son los del modelo base thewh1teagle/zipformer2-66m-streaming-he.

## Capacidades

- Reconocimiento automático del habla en modo streaming, con procesamiento incremental del audio.
- Transcripción de audio a texto orientada a aplicaciones de dictado y subtitulado en tiempo real.
- Inferencia en formato GGUF mediante runtime GGML, lo que permite ejecución en CPU sin GPU dedicada.
- Modelo ligero (66,6 M de parámetros) apto para dispositivos de recursos limitados.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio generativo: no disponible.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: el modelo puede transcribir audio del micrófono en streaming dentro de la app Otter, emitiendo texto parcial mientras el usuario habla gracias a su configuración streaming y a su reducido tamaño.
- Subtitulado en directo de reuniones o clases: al procesar audio de forma incremental, permite generar subtítulos con latencia baja sin necesidad de GPU, ejecutándose en la propia máquina del usuario.
- Transcripción local con privacidad: al ser un modelo GGUF ejecutable en CPU, el audio no necesita salir del dispositivo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Integración en pipelines de post-procesado de audio: la salida de texto puede alimentar sistemas de resumen, indexación o búsqueda sobre grabaciones, usando el modelo como primera etapa de ASR.
- Prototipado rápido de interfaces de voz: su licencia CC-BY-4.0 y su formato GGUF facilitan incorporarlo en demos y pruebas de concepto con atribución al autor.
- Despliegue en hardware embebido o de gama baja: con 66,6 M de parámetros y cuantización q8_0, es viable en equipos sin GPU dedicada, como mini-PC o portátiles modestos.
- Evaluación comparativa de ASR ligero: sirve como línea base de bajo coste frente a modelos ASR más grandes en pruebas de precisión y latencia sobre el idioma objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en q8_0 ocupa aproximadamente 0,1 GB en disco (tamaño del repo); la huella en memoria es del orden de decenas de MB, aunque no se dispone de una cifra oficial de VRAM.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1 GB de memoria libre debería poder alojarlo, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna, dado el reducido número de parámetros; sin confirmación oficial.
- Ejecución en CPU: viable mediante runtime GGML, que es el caso de uso previsto por la aplicación Otter.
- Opciones de despliegue: runtime GGML/GGUF; no se documenta soporte para vLLM, TGI, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| otter-app/zipformer2-66m-streaming-he-gguf | 66,6 M | no disponible | GGUF | CC-BY-4.0 | Hugging Face |
| thewh1teagle/zipformer2-66m-streaming-he (modelo base) | 66,6 M | no disponible | no disponible | no disponible | Hugging Face |
| vibe-app/zipformer2-66m-streaming-he-gguf (conversión previa) | 66,6 M | no disponible | GGUF | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos del modelo; al ser un ASR entrenado sobre un corpus desconocido, puede presentar sesgos de acento, género o dominio no documentados.
- Riesgo de alucinación en la transcripción: los modelos ASR pueden generar texto plausible en segmentos de audio ruidoso o ininteligible; no se ha evaluado la tasa de error en la información disponible.
- Idioma: el sufijo "he" sugiere especialización en hebreo, pero no se confirma el conjunto de idiomas ni su cobertura; el rendimiento en castellano es desconocido.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero debe revisarse la licencia del modelo base y de la conversión previa antes de su uso en producción, tal como advierte la propia model card.
- Artefacto de distribución: es una copia sin modificaciones de otra conversión; la responsabilidad sobre la calidad de la cuantización recae en el pipeline original.
- Sin métricas de latencia ni de precisión publicadas: cualquier despliegue en producción requiere una evaluación propia sobre el dominio y el idioma objetivo.
- El modelo no es un modelo de lenguaje: no soporta generación libre de texto, tool calling ni razonamiento multi-paso.

## Enlaces

- [Hugging Face: otter-app/zipformer2-66m-streaming-he-gguf](https://huggingface.co/otter-app/zipformer2-66m-streaming-he-gguf)
- [Modelo base: thewh1teagle/zipformer2-66m-streaming-he](https://huggingface.co/thewh1teagle/zipformer2-66m-streaming-he)
- [Conversión previa: vibe-app/zipformer2-66m-streaming-he-gguf](https://huggingface.co/vibe-app/zipformer2-66m-streaming-he-gguf)
- [Aplicación Otter](https://github.com/victorfu/otter)
