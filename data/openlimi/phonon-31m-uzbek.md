# openlimi/phonon-31m-uzbek

## Resumen

Vosen-TTS-Tiny (publicado en Hugging Face como `openlimi/phonon-31m-uzbek`) es un modelo de síntesis de voz (text-to-speech) de tamano muy reducido, 31 millones de parametros, desarrollado por openlimi y entrenado especificamente para el idioma uzbeko (`uz`). Emplea una arquitectura propietaria denominada "Phonon", adaptada a los fonemas del uzbeko, y se distribuye con la libreria `transformers` y pesos en formato `safetensors`. El autor lo presenta explicitamente como un modelo experimental y de investigacion, no apto para produccion, y lo situa como recurso para el estudio de sintesis de voz en lenguas de bajos recursos.

El interes del modelo es doble. Por un lado, cubre una lengua con muy poca cobertura en el ecosistema TTS abierto, donde la mayoria de modelos multilingues tratan el uzbeko de forma marginal. Por otro, su tamano de 31M lo hace potencialmente ejecutable en CPU y en hardware muy modesto, lo que abre la puerta a prototipos, demostraciones y experimentos academicos sin infraestructura de GPU. El repositorio, sin embargo, ocupa 16,7 GB, un desajuste notable respecto al numero de parametros que conviene tener en cuenta al descargarlo.

La model card es escasa en detalles tecnicos: no se documentan el conjunto de datos de entrenamiento, el numero de horas de audio, las metricas de calidad (MOS, MCD) ni los formatos de cuantizacion. La informacion disponible se limita a la arquitectura nominal, el recuento de parametros, el regimen de entrenamiento "full train" desde cero sobre datos de voz uzbeka y la licencia CreativeML OpenRAIL-M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | "Phonon" especializada, adaptada a fonemas del uzbeko |
| Parametros totales | 31 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (`uz`) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-to-speech |
| Tamano del repositorio | 16,7 GB |
| Entrenamiento | full train desde cero sobre datos de voz uzbeka |

## Arquitectura y entrenamiento

El autor describe la arquitectura como "Phonon", una familia propietaria adaptada a los fonemas del uzbeko, sin que la model card detalle si se trata de un transformer acustico, un modelo tipo VITS, un difusor o un esquema hibrido con vocoder integrado. Tampoco se especifica el tipo de representacion intermedia (mel-espectrograma, tokens discretos de audio, etc.) ni la presencia de un vocoder separado. El regimen de entrenamiento declarado es "full train", es decir, entrenamiento completo desde cero en lugar de fine-tuning sobre un modelo multilingue preexistente, lo cual es coherente con un modelo de 31M pensado para una sola lengua.

No se proporcionan datos sobre el volumen del corpus (horas de audio), la procedencia de las grabaciones, el numero de hablantes ni la composicion del dataset. Tampoco se menciona el uso de tecnicas de alineamiento forzado, normalizacion textual, RLHF o preferencias humanas, algo por otra parte poco habitual en TTS. La ausencia de estas cifras impide evaluar la calidad del ajuste o la diversidad de voces cubierta.

## Capacidades

- Sintesis de voz a partir de texto en uzbeko (`uz`), con salida de audio.
- Modelo monohablante o multihablante: no disponible en la informacion.
- Generacion de audio rapida por su reducido tamano (31M), apta para ejecucion en CPU.
- Integracion con el ecosistema `transformers` mediante `pipeline("text-to-speech")`.
- Soporte de tool calling / function calling: no aplica (modelo TTS).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: limitadas al uzbeko segun la model card.
- Modo "thinking", vision o audio de entrada: no disponible.
- Clonacion de voz, control de emocion o estilo: no documentado.

## Casos de uso

- Investigacion en sintesis de voz para lenguas de bajos recursos: el modelo sirve como linea base reproducible para experimentos academicos sobre uzbeko, dado su tamano reducido y su entrenamiento desde cero.
- Prototipado de asistentes de voz en uzbeko: permite validar rapidamente flujos de texto a audio en demos y pruebas de concepto antes de invertir en modelos mayores o servicios comerciales.
- Accesibilidad para hablantes de uzbeko: lectura en voz alta de textos, articulos o documentos en aplicaciones de apoyo a personas con discapacidad visual, aceptando la calidad experimental del audio.
- Generacion de audio para contenidos educativos: narracion de materiales didacticos o vocabulario en uzbeko en entornos controlados donde no se exige calidad de estudio.
- Evaluacion comparativa de arquitecturas TTS ligeras: su tamano de 31M lo convierte en un candidato para benchmarks de latencia y consumo en CPU frente a modelos mas grandes.
- Pruebas de integracion en pipelines `transformers`: util para desarrolladores que quieran verificar el soporte del pipeline TTS con un modelo pequeno antes de migrar a alternativas mayores.
- Docencia y talleres: ejemplo practico de entrenamiento y despliegue de un TTS monoidioma para cursos de procesamiento de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, CMOS, MCD, WER de transcripcion inversa) ni comparaciones con otros sistemas TTS en uzbeko.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 31M de parametros, los pesos en precision completa (fp32) rondarian los 124 MB; en fp16, unos 62 MB. El repositorio de 16,7 GB sugiere que incluye artefactos adicionales (checkpoints, optimizer states o audios de ejemplo) que no son necesarios para inferencia.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4090) es mas que suficiente; el modelo esta disenado para funcionar tambien en CPU.
- Cabe en GPU consumer: si, con amplio margen, en practicamente cualquier GPU con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: `transformers` con `pipeline("text-to-speech")`; el tag `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia baja en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openlimi/phonon-31m-uzbek | 31M | uzbeko | no disponible | CreativeML OpenRAIL-M | Hugging Face |
| Alternativas TTS para uzbeko | no disponible | uzbeko | no disponible | no disponible | no disponible |
| Modelos TTS multilingues genericos | no disponible | multilingue | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos para uzbeko en la documentacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Calidad de sintesis media: el propio autor advierte que el modelo no es apto para produccion y que sus indicadores de calidad no son excelentes.
- Caracter experimental: pensado para investigacion y experimentacion, no para productos finales ni servicios comerciales de voz.
- Cobertura linguistica limitada al uzbeko; no se documenta soporte para otras lenguas ni para code-switching.
- Sin datos publicados sobre sesgos de hablante, genero, dialecto o procedencia del corpus, lo que impide evaluar su representatividad.
- Riesgo de artefactos acusticos, prosodia irregular y errores de pronunciacion en textos con numeros, abreviaturas o palabras extranjeras, dado que no se documenta la normalizacion textual.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (clausulas de uso aceptable); conviene revisar sus terminos antes de cualquier despliegue, incluido el uso comercial.
- El repositorio ocupa 16,7 GB pese al reducido tamano del modelo, lo que puede encarecer la descarga y el almacenamiento.
- Ausencia de informacion sobre el vocoder o el pipeline de audio completo, lo que complica la reproduccion exacta de los resultados del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openlimi/phonon-31m-uzbek
- Repositorio referenciado en la model card: https://huggingface.co/openlimi/Vosen-tts-tiny
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Idioma uzbeko (Wikipedia): https://en.wikipedia.org/wiki/Uzbek_language
