# Cohere-AR/cohere-transcribe-ar-sft-v9-full-s80k

## Resumen

Cohere-AR/cohere-transcribe-ar-sft-v9-full-s80k es un modelo de reconocimiento automatico del habla (ASR) especializado en arabe e ingles, desarrollado por la organizacion Cohere-AR como un ajuste fino supervisado (SFT) del modelo base CohereLabs/cohere-transcribe-arabic-07-2026. El modelo aborda el problema de la transcripcion de audio en escenarios bilingues con cambio de codigo (code-switching) y audio telefonico, un caso especialmente dificil para los sistemas ASR genericos que suelen degradarse cuando el hablante alterna entre arabe y ingles dentro de la misma conversacion.

Con aproximadamente 2.066 millones de parametros (2,07 B) y un tamano de repositorio de 4,1 GB en formato safetensors, el modelo se distribuye a traves de la libreria transformers y esta etiquetado como compatible con endpoints. Su relevancia actual radica en la combinacion de dos factores poco frecuentes: por un lado, el enfoque explicito en code-switching arabe-ingles y en dominio telefonico; por otro lado, el hecho de que es un ajuste fino sobre una base reciente (julio de 2026) de CohereLabs, lo que sugiere una linea de trabajo activa sobre ASR multilingue.

El acceso al modelo esta restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de poder descargar los pesos. No se dispone de informacion publica sobre licencia, datos de entrenamiento detallados ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `cohere_asr` en transformers) |
| Parametros totales | 2.065.770.752 (~2,07 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar), ingles (en); incluye code-switching ar-en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | CohereLabs/cohere-transcribe-arabic-07-2026 |
| Tipo de ajuste | SFT (supervised fine-tuning), variante "full" |
| Dominio declarado | telefonia (telephony) y code-switching |
| Tamano del repositorio | 4,1 GB |
| Acceso | restringido (gated) |
| Compatibilidad | endpoints_compatible, transformers |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `cohere_asr` y la libreria transformers. No se especifica si se trata de un encoder-decoder clasico tipo Whisper, de un modelo basado en Conformer, de un encoder acustico acoplado a un decoder de lenguaje o de una arquitectura hibrida. Tampoco se publican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion posteriores al SFT.

Lo que si se puede inferir de las etiquetas y del nombre del repositorio: el modelo es un ajuste fino supervisado completo ("full", en contraposicion a variantes LoRA o parciales) sobre CohereLabs/cohere-transcribe-arabic-07-2026, con un identificador que sugiere un conjunto de entrenamiento de aproximadamente 80k muestras ("s80k") en su version 9 ("v9"). El enfasis declarado en code-switching y telefonia indica que el corpus de ajuste probablemente incluye audio conversacional bilingue con ruido de canal telefonico, aunque la composicion exacta no esta documentada publicamente.

## Capacidades

- Reconocimiento automatico del habla (ASR) en arabe e ingles.
- Transcripcion con cambio de codigo arabe-ingles dentro de una misma emision.
- Procesamiento de audio de dominio telefonico (canal de banda estrecha, ruido, posibles artefactos de compresion).
- Integracion con la libreria transformers y con endpoints compatibles.
- Ajuste fino supervisado sobre una base ASR reciente, orientado a mejorar el rendimiento en los dominios declarados.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio generativo; es un modelo ASR puro segun la informacion disponible.
- No se documenta modo "thinking" ni capacidades de razonamiento explicito.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente bilingues: el modelo esta disenado para audio telefonico con alternancia arabe-ingles, lo que lo hace adecuado para centros de contacto en regiones del Golfo o comunidades arabofonas con interlocutores angloparlantes.
- Generacion de subtitulos y actas para reuniones con participantes que cambian de idioma: la capacidad de code-switching permite transcribir sin segmentar manualmente por idioma.
- Analitica de calidad y compliance en grabaciones telefonicas: transcripcion por lotes de llamadas para busqueda de palabras clave, deteccion de incidencias y auditoria.
- Sistemas de voz a texto para aplicaciones de mensajeria y notas de voz: integracion via transformers o endpoints para convertir mensajes de audio en texto en entornos ar-en.
- Enriquecimiento de datasets de entrenamiento ASR: uso del modelo para pseudo-etiquetar audio bilingue y ampliar corpus de ajuste.
- Accesibilidad en servicios publicos: transcripcion en tiempo (o cuasi tiempo) real de interacciones presenciales o telefonicas entre hablantes de arabe e ingles.
- Investigacion en ASR bilingue: como punto de partida para estudiar el comportamiento de modelos SFT sobre bases recientes en escenarios de code-switching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 8,3 GB solo para pesos, mas memoria para activaciones y buffers de audio; en la practica se recomienda al menos 12-16 GB.
- VRAM estimada en fp16/bf16: aproximadamente 4,2 GB para pesos; se recomienda 8-12 GB para margen operativo.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,1 GB para pesos; cabe en GPUs consumer de gama media con 4-6 GB, aunque no se documentan formatos de cuantizacion soportados.
- GPUs recomendadas: no disponible de forma oficial; por tamano, una RTX 4090 (24 GB) o A100/H100 ofrecen margen amplio para inferencia en fp16 y procesamiento por lotes.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en fp16, y potencialmente en 4-6 GB si se dispone de cuantizacion (no confirmada).
- Opciones de despliegue: transformers (soporte declarado), endpoints compatibles; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cohere-AR/cohere-transcribe-ar-sft-v9-full-s80k | ~2,07 B | ar, en (code-switching) | ASR telefonico bilingue | no disponible | gated |
| CohereLabs/cohere-transcribe-arabic-07-2026 | no disponible | arabe (base) | ASR arabe generico | no disponible | no disponible en la informacion |
| Whisper large-v3 (OpenAI) | ~1,55 B | multilingue | ASR generico | MIT (habitual) | publico |
| Otros ASR arabe especializados | no disponible | ar | ASR arabe | variable | variable |

La comparacion con Whisper large-v3 se incluye como referencia de categoria por tamano y tarea, pero no se dispone de datos de rendimiento comparativo en la informacion proporcionada. No se han identificado en la informacion disponible otros modelos directamente comparables en el nicho especifico de code-switching ar-en telefonico.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace; esto puede limitar la reproducibilidad y el despliegue automatizado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar las condiciones antes de integrarlo en produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (WER, CER) frente a alternativas, ni en arabe estandar ni en code-switching.
- Riesgo de alucinacion en ASR: como todo modelo generativo de transcripcion, puede producir texto plausible no presente en el audio, especialmente en segmentos ruidosos o con cambio de codigo.
- Cobertura limitada a ar y en: no se declaran otros idiomas; el rendimiento fuera de estos idiomas no esta garantizado.
- Especializacion en telefonia: puede degradarse en audio de alta fidelidad, musica, acentos no representados en el corpus de ajuste o dialectos arabes no cubiertos.
- Sesgos: no documentados; los sesgos acusticos y lexicos dependen del corpus de ajuste, no publicado.
- Sin informacion sobre robustez ante ruido, solapamiento de hablantes o audio de larga duracion.
- El identificador "v9" sugiere multiples iteraciones; no se documenta que cambios introduce esta version respecto a anteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-sft-v9-full-s80k
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Organizacion Cohere-AR: https://huggingface.co/Cohere-AR
- Organizacion CohereLabs: https://huggingface.co/CohereLabs
