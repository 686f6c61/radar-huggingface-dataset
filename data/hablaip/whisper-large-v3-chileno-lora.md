# hablaip/whisper-large-v3-chileno-lora

## Resumen

`hablaip/whisper-large-v3-chileno-lora` es un adaptador LoRA sobre el modelo de reconocimiento automatico del habla (ASR) `openai/whisper-large-v3`, desarrollado por HablaIP SpA en el marco del proyecto CORFO 25CH2-306482. Su objetivo es mejorar la transcripcion de espanol hablado en Chile en el dominio especifico de conversaciones telefonicas de call center: habla espontanea, modismos locales, muletillas y ruido de linea telefonica. El modelo base Whisper Large-v3, sin ajustar, tiene dificultades con este tipo de audio; el adaptador reduce el error de transcripcion de forma notable.

El adaptador aplica LoRA (r=32, alpha=64, dropout=0.05) sobre las proyecciones `q_proj` y `v_proj` de los bloques de atencion, entrenando aproximadamente el 1% de los parametros mientras el modelo base permanece congelado. Se entreno con alrededor de 1.800 clips (unas 8 horas) de audio real de call center chileno, transcritos manualmente de forma verbatim. Sobre un conjunto de test de 153 audios reales nunca vistos en entrenamiento, el WER baja del 34,76% al 21,18%, una reduccion relativa del 39% con significancia estadistica (bootstrap agrupado por llamada, IC al 95%).

La relevancia actual del modelo es acotada pero clara: demuestra que un ajuste LoRA de bajo coste sobre Whisper Large-v3 puede mejorar sustancialmente el ASR en un dominio y acento concretos sin reentrenar el modelo completo. Es un adaptador pequeno (repo de 0,1 GB), con licencia Apache 2.0 y pensado para integrarse en pipelines de transcripcion de call center en espanol de Chile.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder (Whisper Large-v3) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Whisper Large-v3 tiene 1.550 M de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de Whisper Large-v3: 30 s por segmento) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite cuantizacion estandar de Whisper) |
| Idiomas soportados | Espanol (es), con foco en espanol de Chile |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/whisper-large-v3`, un transformer encoder-decoder orientado a ASR y traduccion de voz. La adaptacion usa LoRA con rango 32, alpha 64 y dropout 0,05 sobre `q_proj` y `v_proj` de las capas de atencion; el resto de pesos del modelo base queda congelado, de modo que solo se entrena aproximadamente el 1% de los parametros. Los datos de entrenamiento consisten en unos 1.800 clips (aproximadamente 8 horas) de audio real de call center chileno, transcritos a mano palabra por palabra, sin correccion gramatical y con fidelidad fonetica al habla chilena (muletillas, modismos). Los datos son privados y no se publican.

La division de datos se hizo por llamada completa y nunca por fragmento suelto, para evitar que el modelo memorice fragmentos de una misma conversacion presentes luego en evaluacion. La evaluacion se realizo sobre 153 audios reales de call center (78 llamadas distintas) no vistos en entrenamiento, con transcripcion humana literal como referencia, y la mejora se valido con bootstrap agrupado por llamada. La model card menciona que el olvido fuera de dominio se midio como minimo durante el desarrollo, y que un candidato posterior con pseudo-etiquetado mostro una mejora adicional pequena (~0,8 puntos porcentuales) aun no confirmada con significancia estadistica completa.

## Capacidades

- Reconocimiento automatico del habla en espanol, con especializacion en espanol de Chile de call center.
- Transcripcion verbatim: conserva muletillas, repeticiones y modismos tal como se pronuncian.
- Robustez ante condiciones de telefonia: audio a 8 kHz remuestreado y ruido de linea.
- Manejo de habla espontanea (no leida) en conversaciones telefonicas.
- Integracion con el ecosistema Hugging Face Transformers y PEFT.
- No se documentan capacidades de traduccion, diarizacion, tool calling ni agentes; el adaptador se limita a la tarea de transcripcion.
- Capacidad multilingue limitada al espanol; el resto de idiomas del modelo base no se ha caracterizado tras el ajuste.

## Casos de uso

- Transcripcion de llamadas de call center en Chile: el adaptador esta entrenado especificamente con audio telefonico chileno, por lo que mejora la fidelidad frente a Whisper Large-v3 sin ajustar en habla espontanea y con ruido de linea.
- Control de calidad y auditoria de conversaciones: la transcripcion verbatim permite revisar exactamente lo que dijo el cliente y el agente, incluidas muletillas, para evaluar guiones y cumplimiento.
- Analitica de voz del cliente: alimentar pipelines de analisis de sentimiento, deteccion de motivos de llamada o extraccion de entidades a partir de transcripciones mas precisas en espanol chileno.
- Generacion de actas y resumenes post-llamada: usar la transcripcion como entrada a un modelo de lenguaje para resumir la conversacion, con la ventaja de que el texto conserva el contenido literal.
- Busqueda y recuperacion sobre grabaciones: indexar transcripciones para busqueda interna o compliance, aprovechando la reduccion de WER en este dominio.
- Prototipado rapido de ASR especializado: al ser un adaptador LoRA pequeno (0,1 GB) sobre un modelo base publico, se puede desplegar y comparar con facilidad en entornos de investigacion o pruebas de concepto.
- Fine-tuning posterior: el adaptador sirve como punto de partida para ajustes adicionales con mas datos del mismo dominio.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 153 audios reales de call center (78 llamadas) no vistos en entrenamiento, con transcripcion humana literal como referencia:

| Modelo | WER | CER |
|---|---:|---:|
| Whisper Large-v3 (sin ajustar) | 34,76% | No disponible |
| Este adaptador | 21,18% | 11,37% |

La reduccion relativa del error es del 39%, con significancia estadistica (intervalo de confianza al 95% por bootstrap agrupado por llamada, que no cruza el baseline). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el coste real de inferencia lo determina el modelo base Whisper Large-v3 (1.550 M de parametros).
- VRAM estimada para el modelo base en bfloat16: en torno a 3-4 GB para los pesos, mas memoria para activaciones y audio de entrada; no se dispone de cifras medidas para este adaptador.
- GPU recomendadas: no disponible de forma especifica; Whisper Large-v3 se ejecuta en GPUs consumer modernas (por ejemplo, RTX 3090/4090) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU consumer: si, el modelo base en bfloat16 o cuantizado es viable en GPUs consumer con suficiente VRAM; no se han publicado mediciones concretas para este adaptador.
- Opciones de despliegue: Transformers + PEFT (el ejemplo de la model card usa `PeftModel.from_pretrained`); no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER (test call center chileno) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Whisper Large-v3 + LoRA) | ~1% entrenado sobre 1.550 M | 30 s por segmento (base) | 21,18% | Apache 2.0 | Hugging Face (hablaip) |
| openai/whisper-large-v3 (sin ajustar) | 1.550 M | 30 s por segmento | 34,76% | Apache 2.0 | Hugging Face (openai) |
| openai/whisper-large | 1.550 M | 30 s por segmento | No disponible en este test | Apache 2.0 | Hugging Face (openai) |

No se dispone de datos de otros adaptadores ASR comparables en el mismo test; la comparativa se limita al modelo base y a la version anterior de Whisper Large.

## Limitaciones y advertencias

- Ajustado especificamente para habla telefonica chilena de call center (telefonia, 8 kHz remuestreado, habla espontanea); el rendimiento en otros dominios (habla leida, otros acentos del espanol) no esta caracterizado por este modelo, aunque el olvido fuera de dominio se midio como minimo durante el desarrollo.
- Entrenado con un volumen de datos pequeno (~1.800 muestras); un candidato posterior con pseudo-etiquetado mostro una mejora adicional pequena (~0,8 puntos porcentuales) aun no confirmada con significancia estadistica completa.
- Transcripcion verbatim (incluye muletillas y repeticiones tal como se dijeron), no transcripcion "limpia" de estilo editorial; esto puede requerir postprocesado para ciertos usos.
- Los datos de entrenamiento son privados y no se publican, lo que limita la reproducibilidad del ajuste.
- Riesgo de alucinacion y de errores en audio fuera de dominio no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la model card.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar las condiciones del modelo base Whisper Large-v3, tambien Apache 2.0.
- El adaptador requiere cargar el modelo base completo, por lo que el coste de despliegue no es el de un modelo de 0,1 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hablaip/whisper-large-v3-chileno-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Version anterior del modelo base: https://huggingface.co/openai/whisper-large
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales especificos de este adaptador.
