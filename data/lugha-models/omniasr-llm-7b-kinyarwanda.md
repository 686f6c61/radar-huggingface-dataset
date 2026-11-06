# Lugha-Models/omniASR-LLM-7B-kinyarwanda

## Resumen

omniASR-LLM-7B-kinyarwanda es un modelo de reconocimiento automatico del habla (ASR) especializado en kinyarwanda, desarrollado por Lugha-Models mediante ajuste fino del modelo base facebook/omniASR-LLM-7B. Combina un codificador acustico de la familia wav2vec2 con un decodificador basado en un LLM de 7.000 millones de parametros, siguiendo el paradigma omniASR de Meta para ASR multilingue. El resultado es un sistema que transcribe audio en kinyarwanda (idioma de Ruanda, codigo ISO `rw`) aprovechando el conocimiento linguistico del decodificador.

El modelo resuelve un problema concreto: la escasez de sistemas ASR de calidad para lenguas de bajos recursos. El kinyarwanda cuenta con pocos corpus publicos y practicamente ninguna solucion comercial de transcripcion. Este ajuste fino parte de un modelo multilingue ya entrenado y lo especializa con datos especificos del idioma, lo que reduce drasticamente los requisitos de datos frente a entrenar desde cero.

Es relevante ahora porque forma parte de una tendencia creciente de adaptacion de modelos fundacionales de voz a lenguas africanas, y porque el modelo base omniASR-LLM-7B es una de las apuestas recientes de Meta por el ASR masivo multilingue. El repositorio ocupa 31,2 GB y utiliza la libreria fairseq2, lo que condiciona su despliegue a dicho ecosistema. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-llama (codificador acustico wav2vec2 + decodificador LLM) |
| Parametros totales | 7B (heredados del modelo base omniASR-LLM-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kinyarwanda (`rw`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio fairseq2, 31,2 GB) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno omniASR-LLM: un codificador acustico tipo wav2vec2 que procesa la senal de audio y genera representaciones, conectado a un decodificador basado en un transformer tipo Llama de 7.000 millones de parametros que produce la transcripcion. Este esquema hibrido permite aprovechar el modelado del lenguaje del LLM para mejorar la coherencia y la puntuacion de las transcripciones, a diferencia de los ASR puramente acusticos.

El ajuste fino se realizo sobre el checkpoint facebook/omniASR-LLM-7B utilizando dos conjuntos de datos: DigitalUmuganda/Afrivoice_Kinyarwanda y fsicoli/common_voice_22_0 (subset de kinyarwanda). No se dispone de informacion sobre el numero exacto de horas de audio, la composicion detallada del dataset, la estrategia de congelacion de capas ni si se aplicaron tecnicas de aumento de datos o regularizacion. Tampoco se documenta si hubo etapas de alineacion o ajuste con RLHF, algo poco habitual en ASR. El entrenamiento se realizo con fairseq2, la libreria de Meta para modelos de secuencia.

## Capacidades

- Transcripcion de audio a texto en kinyarwanda, unico idioma declarado en la model card.
- Reconocimiento de habla continua y conversacional, orientado a audio de dominio general.
- Aprovechamiento del decodificador LLM para producir texto gramaticalmente coherente y con puntuacion plausible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del kinyarwanda, aunque el modelo base es multilingue.
- No se documenta vision, audio generativo ni modo de pensamiento (thinking mode).

## Casos de uso

- Transcripcion de reuniones y actas administrativas en Ruanda: el modelo convierte audio de reuniones en texto escrito en kinyarwanda, lo que facilita la documentacion oficial en un pais donde el idioma es cooficial y la mayoria de la administracion opera en el.
- Subtitulado de contenido audiovisual local: radios, televisiones y creadores de contenido pueden generar subtitulos en kinyarwanda para programas informativos o educativos, un nicho practicamente sin cobertura comercial.
- Atencion ciudadana por voz: integracion en lineas de atencion telefonica para transcribir automaticamente las consultas de los ciudadanos y derivarlas a los departamentos correspondientes, reduciendo la dependencia de operadores humanos.
- Investigacion linguistica y sociolinguistica: generacion de corpus transcritos de entrevistas y grabaciones de campo para estudios de variacion dialectal o para ampliar los propios datasets de kinyarwanda.
- Educacion y accesibilidad: transcripcion de clases grabadas y material docente en kinyarwanda para estudiantes con discapacidad auditiva o para su reutilizacion en plataformas de aprendizaje.
- Archivado de patrimonio oral: digitalizacion y transcripcion de testimonios, cuentos tradicionales y grabaciones historicas en kinyarwanda, con el objetivo de preservar el patrimonio inmaterial.
- Preprocesamiento para pipelines de NLP: convertir audio en texto para alimentar sistemas de traduccion automatica, analisis de sentimiento o busqueda semantica en kinyarwanda, donde los corpus escritos son escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano del repositorio (31,2 GB) y los 7B parametros del decodificador, se estima que la inferencia en precision completa (FP16) requiere del orden de 14-16 GB solo para los pesos del LLM, mas el codificador acustico y el overhead de fairseq2; en la practica se recomienda una GPU con al menos 24 GB.
- GPU recomendadas: no documentadas por el autor. Por el perfil de memoria, una A100 (40/80 GB), H100 o L40S son opciones seguras; una RTX 4090 (24 GB) podria ser suficiente en FP16 si el codificador y el runtime caben en el margen restante.
- Cabe en GPU de consumo: probablemente en RTX 4090 o RTX 3090 (24 GB) en FP16, aunque no esta verificado ni documentado. En GPUs de 16 GB o menos requeriria cuantizacion, no disponible oficialmente.
- Opciones de despliegue: fairseq2 es la libreria nativa. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que en general no soportan la arquitectura hibrida wav2vec2-llama de este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Lugha-Models/omniASR-LLM-7B-kinyarwanda | 7B | no disponible | kinyarwanda | Apache 2.0 | Gated |
| facebook/omniASR-LLM-7B | 7B | no disponible | multilingue | no disponible | no disponible |
| Whisper large-v3 (OpenAI) | 1,55B | 30 s de audio | 99 idiomas (kinyarwanda con cobertura limitada) | MIT | Abierto |
| MMS (Meta) | 1B | no disponible | mas de 1000 idiomas | CC-BY-NC 4.0 | Abierto |

La comparativa es limitada porque no se han publicado metricas de WER para este ajuste fino ni para el modelo base en kinyarwanda. Whisper large-v3 y MMS son las alternativas abiertas mas cercanas en ASR multilingue, pero ninguna esta especializada en kinyarwanda. La ventaja de este modelo es la especializacion; su desventaja es la dependencia de fairseq2 y la ausencia de benchmarks publicos.

## Limitaciones y advertencias

- No se han publicado resultados de WER ni de ningun otro benchmark, por lo que el rendimiento real en kinyarwanda es desconocido.
- El modelo solo declara kinyarwanda; no debe esperarse un comportamiento correcto en otros idiomas aunque el modelo base sea multilingue.
- Riesgo de alucinacion del decodificador LLM: al ser un modelo generativo, puede producir texto fluido pero no fiel al audio, especialmente en segmentos con ruido o habla solapada.
- Sesgos potenciales derivados de los corpus de entrenamiento (Afrivoice y Common Voice): posible infrarepresentacion de dialectos, hablantes mayores, acentos regionales o vocabulario tecnico.
- La licencia Apache 2.0 permite uso comercial, pero el acceso esta restringido en Hugging Face y requiere aceptar condiciones adicionales de la plataforma.
- Dependencia de fairseq2: el despliegue en produccion exige este ecosistema, con menos herramientas de serving optimizado que otros runtimes.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- El repositorio ocupa 31,2 GB, lo que implica requisitos de almacenamiento y de ancho de banda considerables para descarga y despliegue.
- No se documenta el proceso de limpieza de audio ni el filtrado de los datasets, lo que impide evaluar la calidad de las etiquetas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lugha-Models/omniASR-LLM-7B-kinyarwanda
- Modelo base: https://huggingface.co/facebook/omniASR-LLM-7B
- Dataset Afrivoice Kinyarwanda: https://huggingface.co/datasets/DigitalUmuganda/Afrivoice_Kinyarwanda
- Dataset Common Voice 22.0: https://huggingface.co/datasets/fsicoli/common_voice_22_0
- Libreria fairseq2: https://github.com/facebookresearch/fairseq2
