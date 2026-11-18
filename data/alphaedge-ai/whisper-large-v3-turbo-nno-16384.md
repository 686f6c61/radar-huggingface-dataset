# alphaedge-ai/whisper-large-v3-turbo-nno-16384

## Resumen
`whisper-large-v3-turbo-nno-16384` es una variante recortada (trimmed) de `openai/whisper-large-v3-turbo`, desarrollada por `alphaedge-ai` y optimizada para noruego nynorsk. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, un modelo de reconocimiento automatico del habla (ASR) entrenado con supervisión debil a gran escala, y le aplica una reducción del vocabulario de 51.865 a 16.384 tokens mediante la tecnica de trimming publicada por Hugging Face. El resultado es un checkpoint de 763.461.120 parametros (un 5,61% menos que los 808.878.080 del original) con una huella de memoria notablemente menor.

La motivacion es practica: Whisper reserva una parte importante de su matrix de embeddings para lenguas y caracteres que un despliegue monolingue no necesita. Al recortar el vocabulario a los tokens realmente usados en noruego nynorsk, se reduce el tamano del modelo y se acelera la decodificacion sin cambiar la arquitectura ni el resto de pesos. Es relevante para equipos que despliegan ASR en produccion sobre hardware modesto o que necesitan reducir latencia en un idioma concreto.

El modelo conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors, cargable con `transformers`. Su uso esta pensado para transcripcion de audio en nynorsk; fuera de ese idioma el rendimiento puede degradarse porque se han eliminado tokens poco frecuentes en la lengua objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | noruego nynorsk (nn) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Whisper large-v3-turbo: un encoder transformer que procesa espectrogramas log-Mel de audio a 16 kHz y un decoder autorregresivo que genera tokens de transcripcion. La innovacion respecto al original no esta en el entrenamiento, sino en la poda del vocabulario: se minaron 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para identificar los tokens relevantes en noruego nynorsk y se elimino el resto, pasando de 51.865 a 16.384 entradas en el vocabulario (una reduccion del 68,41%). Esto afecta principalmente a las matrices de embedding del encoder y del decoder.

No se han publicado detalles sobre reentrenamiento adicional, ajuste fino especifico ni tecnicas de RLHF/DPO en la informacion disponible. El modelo es una operacion de trimming sobre pesos ya entrenados, por lo que conserva el conocimiento adquirido por Whisper durante su entrenamiento original con supervision debil a gran escala, pero limitado al subconjunto de tokens retenidos. La reduccion de parametros (5,61%) se concentra en las capas de embedding, no en el cuerpo del transformer.

## Capacidades
- Transcripcion de audio a texto (ASR) en noruego nynorsk.
- Procesamiento de audio muestreado a 16 kHz, segun el requisito de Whisper.
- Generacion de transcripciones con `generate_kwargs` configurable para idioma y tarea (`transcribe`).
- Integracion con el pipeline `automatic-speech-recognition` de `transformers`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documentan capacidades de traduccion, diarizacion, tool calling ni agentes en la informacion proporcionada.
- Capacidades multilingues limitadas: el recorte del vocabulario esta optimizado solo para nynorsk.

## Casos de uso
- Transcripcion de reuniones internas en noruego nynorsk: el modelo puede procesar audio de 16 kHz y devolver texto en un pipeline de `transformers`, adecuado para equipos que documentan actas en esta variante linguistica.
- Subtitulado de contenido audiovisual: al estar especializado en nynorsk y tener menor huella de memoria, encaja en pipelines de generacion de subtitulos para medios noruegos con requisitos de latencia ajustados.
- Despliegue en edge o servidores modestos: la reduccion de parametros y de vocabulario permite servir ASR monolingue con menos VRAM que el modelo original.
- Investigacion sobre trimming de vocabularios: sirve como referencia para estudiar el impacto del recorte de tokens en modelos ASR, junto con el blog de Hugging Face citado.
- Prototipado rapido de aplicaciones de voz en nynorsk: la carga via `pipeline` de `transformers` facilita iterar sobre demos y validaciones.
- Preprocesamiento de corpus de audio noruegos: util para generar transcripciones a gran escala dentro de proyectos de datos linguisticos, siempre que el dominio sea nynorsk.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible en la informacion proporcionada; el checkpoint safetensors ocupa aproximadamente 1,5 GB en el repositorio, lo que sugiere que en precision completa cabe en GPUs consumer con 4-8 GB.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: probablemente si, dado el tamano del repo (1,5 GB), aunque no se confirma en la model card.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), endpoints de Hugging Face (tag `endpoints_compatible`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-nno-16384 | 763.461.120 | no disponible | noruego nynorsk | apache-2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | 808.878.080 | no disponible | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible | no disponible | multilingue | apache-2.0 | Hugging Face |

## Limitaciones y advertencias
- El recorte de vocabulario elimina tokens poco usados en nynorsk; el rendimiento en otros idiomas puede degradarse respecto al modelo original.
- Riesgo de alucinacion inherente a Whisper, especialmente en audio ruidoso o dominios alejados del entrenamiento.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada, pero hereda los del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `openai/whisper-large-v3-turbo`.
- El tag de idioma `nn` y el tag `region:eu` aparecen en los metadatos; no se detalla su implicacion operativa.
- Modelo con pocas descargas (31) y sin likes: madurez y validacion comunitaria limitadas.
- No se documentan cuantizaciones ni formatos alternativos a safetensors.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-nno-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
