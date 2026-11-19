# sayzly/whisper-small-gguf

## Resumen

Whisper Small GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) Whisper Small, desarrollado originalmente por OpenAI y redistribuido en este repositorio por el usuario sayzly. El modelo base cuenta con 241.751.392 parámetros (aproximadamente 244 millones) y está pensado para transcripción de audio a texto multilingüe. Esta variante concreta existe para facilitar su uso en runtimes de inferencia que consumen GGUF, como llama.cpp o whisper.cpp, en lugar de los pesos originales en formato PyTorch/safetensors.

El repositorio tiene un tamaño de 0,3 GB e incluye, según la model card, al menos el fichero `whisper-small-Q8_0.gguf`, es decir, una cuantización de 8 bits. Se trata de un artefacto de distribución más que de un modelo entrenado desde cero: no aporta cambios arquitectónicos ni de entrenamiento respecto al original de OpenAI, sino únicamente la conversión de pesos.

Su relevancia es práctica: permite desplegar un modelo ASR de tamaño medio en entornos con recursos limitados o en herramientas que no soportan los formatos nativos de Whisper. No obstante, el repositorio no incluye documentación técnica adicional, resultados de evaluación propios ni detalles sobre el proceso de conversión, por lo que la mayor parte de las especificaciones deben tomarse del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, modelo base openai/whisper-small) |
| Parametros totales | 241.751.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | Q8_0 (fichero `whisper-small-Q8_0.gguf`); no se documentan otras |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Whisper Small de OpenAI: un transformer de tipo encoder-decoder entrenado para tareas de reconocimiento automático del habla, con entrada de audio representada como espectrograma log-Mel. El repositorio no documenta la arquitectura en detalle ni introduce modificaciones; se limita a la conversión de los pesos originales a GGUF.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas específicas en esta información. Todos esos detalles pertenecen al modelo base `openai/whisper-small`, cuya model card no se ha incluido en los datos proporcionados. La única particularidad de este repositorio es la cuantización Q8_0, que reduce el peso en disco y memoria respecto a los pesos en punto flotante.

## Capacidades

- Reconocimiento automático del habla (speech-to-text): transcripción de audio a texto, tarea declarada en el pipeline del repositorio.
- Conversión a GGUF para su uso en runtimes compatibles con este formato.
- Cuantización Q8_0, que facilita el despliegue con menor huella de memoria.
- Capacidades multilingües: no disponibles en la información proporcionada para este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio adicional): no disponible.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio grabado en texto para actas o resúmenes posteriores, aprovechando su naturaleza ASR y su tamaño moderado para ejecución local.
- Subtitulado de vídeo y podcasts: generación de transcripciones que sirvan de base para subtítulos, con la ventaja de que el formato GGUF permite integrarlo en pipelines ligeros.
- Procesamiento por lotes en servidores modestos: al estar cuantizado en Q8_0 y ocupar 0,3 GB en el repositorio, puede desplegarse en máquinas sin GPU de gran capacidad para tareas de transcripción masiva.
- Prototipado de asistentes de voz: uso como componente ASR en aplicaciones de dictado o comandos por voz, siempre que se valide la calidad en el idioma objetivo.
- Integración en herramientas de escritorio con whisper.cpp o llama.cpp: al estar en GGUF, encaja en aplicaciones locales que ya consumen este formato.
- Evaluación y comparación de cuantizaciones: útil como referencia para medir la pérdida de calidad de Q8_0 frente a los pesos originales en un idioma concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el repositorio ocupa 0,3 GB y el fichero Q8_0 es la única cuantización documentada, por lo que la huella en memoria será del orden de unos cientos de MB más el overhead del runtime.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible; por tamaño de parámetros (unos 244 millones) es plausible, pero no hay datos que lo confirmen en este repositorio.
- Opciones de despliegue: runtimes compatibles con GGUF (llama.cpp, whisper.cpp y similares); vLLM, TGI u Ollama no están documentados para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/whisper-small-gguf | 241.751.392 | no disponible | GGUF (Q8_0) | apache-2.0 | Hugging Face, 0 descargas |
| openai/whisper-small | no disponible en esta informacion | no disponible | safetensors/PyTorch | apache-2.0 | Hugging Face (modelo base) |
| Otras variantes GGUF de Whisper Small | no disponible | no disponible | GGUF | no disponible | no disponible |

La comparación se limita al modelo base del que deriva. No se dispone de datos de rendimiento ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información proporcionada; los sesgos del modelo base de OpenAI no se detallan aquí.
- Riesgo de alucinación: no evaluado en este repositorio; los modelos ASR pueden generar texto incorrecto en audio ruidoso o con acentos no representados en el entrenamiento.
- Idiomas soportados: no disponibles; no se puede confirmar la cobertura multilingüe ni la calidad por idioma sin datos del modelo base.
- Restricciones de licencia: apache-2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- El repositorio no incluye métricas de calidad, proceso de conversión ni verificación de la cuantización Q8_0; la fidelidad respecto al original no está validada.
- Sin descargas ni likes registrados, lo que reduce la evidencia de uso en producción.
- No hay información sobre el contexto de audio máximo ni sobre el preprocesado requerido en este artefacto concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/whisper-small-gguf
- Modelo base: https://huggingface.co/openai/whisper-small
