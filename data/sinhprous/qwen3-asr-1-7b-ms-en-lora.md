# sinhprous/qwen3-asr-1.7b-ms-en-lora

## Resumen

El modelo `sinhprous/qwen3-asr-1.7b-ms-en-lora` es un adaptador LoRA de reconocimiento automatico del habla (ASR) entrenado por el usuario de HuggingFace sinhprous sobre el modelo base `Qwen/Qwen3-ASR-1.7B` de Alibaba Qwen. No se trata de un modelo completo, sino de un conjunto de pesos incrementales (formato PEFT/safetensors, 0,1 GB de repositorio) que se cargan sobre el modelo base y que ajustan su comportamiento para transcribir ingles de Malasia (Malaysian English).

El problema que resuelve es concreto: el modelo base presenta un error de palabra (WER) del 13,37 % sobre el acento y las particularidades lexicas del ingles malasio, y el adaptador lo reduce al 8,66 %, una mejora absoluta de 4,71 puntos porcentuales. El ajuste se hizo con Common Voice Malaysian English usando LoRA con r=16 y alpha=32 sobre todas las capas lineales.

Su relevancia es de nicho pero clara: demuestra que un ajuste LoRA barato (entrenado en una unica GPU Modal L4, con lote efectivo de 16) puede capturar variacion dialectal significativa en un modelo ASR de 1.700 millones de parametros, sin necesidad de reentrenar el modelo completo ni de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32, all-linear, dropout=0,05) sobre el modelo base Qwen/Qwen3-ASR-1.7B; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | 1.700 millones en el modelo base; numero de parametros del adaptador no disponible (r=16 sobre todas las capas lineales) |
| Parametros activos | no aplica (el modelo base no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos del adaptador se distribuyen en safetensors y requieren el modelo base sin cuantizar de forma explicita |
| Idiomas soportados | ingles de Malasia (objetivo del ajuste); el resto de idiomas del modelo base no esta documentado en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye con la tecnica LoRA aplicada sobre todas las capas lineales del modelo base (`all-linear`), con rango 16, alpha 32 y dropout 0,05. El entrenamiento se ejecuto en una GPU Modal L4, con `per_device_batch_size` de 4 y acumulacion de gradientes de 4, lo que da un lote efectivo de 16. Se uso una tasa de aprendizaje de 2e-5 con programacion coseno y un 3 % de warmup, ademas de early stopping con paciencia 4 sobre `eval_loss`. El checkpoint resultante se denomina `ms_en_lora_bs_4_acc_4`. No se documenta el numero de pasos, epocas ni tokens de audio procesados.

El conjunto de datos de ajuste es Common Voice Malaysian English. En la integracion, el adaptador se inyecta sobre el submodulo `thinker` del modelo base mediante `PeftModel.from_pretrained`, lo que sugiere que Qwen3-ASR-1.7B expone una separacion interna entre componentes de razonamiento y de generacion, aunque la informacion proporcionada no detalla esa arquitectura. No se reporta uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Transcripcion de voz a texto en ingles con adaptacion especifica al acento y las convenciones del ingles de Malasia.
- Reduccion del error de palabra (WER) frente al modelo base en el dominio objetivo: de 13,37 % a 8,66 % sobre un conjunto de evaluacion de 71 muestras.
- Carga como adaptador PEFT sobre el modelo base mediante la libreria `qwen_asr` y `peft`, con inferencia en `bfloat16` y atencion SDPA.
- Reutilizacion de todas las capacidades del modelo base Qwen3-ASR-1.7B (no detalladas en la informacion disponible).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de otros idiomas distintos del ingles malasio.
- No se documentan capacidades de vision, audio-vision ni modos de "thinking" para este adaptador concreto.

## Casos de uso

- Transcripcion de reuniones y llamadas de equipos con hablantes de ingles malasio: el adaptador reduce el WER casi 5 puntos absolutos frente al modelo base, lo que se traduce en menos correcciones manuales en actas y resumenes.
- Subtitulado automatico de contenido audiovisual malasio: series, podcasts o videos de YouTube con acento local se transcriben con menor tasa de sustituciones erroneas, lo que mejora la calidad de los subtitulos generados.
- Atencion al cliente en centros de contacto de Malasia: la transcripcion de llamadas para analitica de calidad y deteccion de intenciones se beneficia de un menor WER en el acento local.
- Generacion de notas clinicas o legales dictadas: en entornos donde el profesional habla ingles malasio, el ajuste reduce errores en terminos y nombres propios, aunque requiere validacion humana dado el riesgo de alucinacion.
- Indexacion y busqueda de archivos de audio historicos: transcripcion de archivos de radio o entrevistas con acento malasio para permitir busqueda semantica sobre el texto resultante.
- Ajuste incremental de bajo coste como referencia metodologica: sirve como plantilla reproducible para adaptar modelos ASR a otras variedades dialectales con una sola GPU y un adaptador de 0,1 GB.
- Evaluacion comparativa de dialectos: uso del adaptador como linea base en experimentos academicos sobre robustez de ASR frente a variacion regional del ingles.

## Benchmarks y rendimiento

| Modelo | WER (n=71) |
|---|---|
| Qwen3-ASR-1.7B (base) | 13,37 % |
| + este adaptador LoRA | 8,66 % |
| Diferencia | -4,71 puntos absolutos |

Los unicos datos de benchmark disponibles son los de la model card, medidos sobre un conjunto de prueba de 71 muestras (n=71). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible, ni comparaciones con modelos ASR alternativos bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 1.700 millones de parametros, lo que equivale a unos 3,4 GB en `bfloat16`. Sumando el codificador de audio, activaciones y overhead del runtime, se estima un consumo de 4-6 GB en `bfloat16`. Estas cifras son estimaciones derivadas del tamano del modelo, no datos publicados.
- En cuantizacion de 8 bits el peso del modelo bajaria a aproximadamente 1,7-2 GB, y en 4 bits a aproximadamente 1-1,5 GB, aunque no se documentan recetas de cuantizacion compatibles con este adaptador.
- El adaptador LoRA en si anade un consumo de VRAM despreciable (0,1 GB de repositorio).
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA L4 (24 GB). Para inferencia bastan GPUs de gama consumer como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores; tambien es viable en GPUs de 8 GB si se aplica cuantizacion.
- Cabe en GPU consumer: si, siempre que se disponga de al menos 6-8 GB de VRAM para `bfloat16`, o menos con cuantizacion (estimacion).
- Opciones de despliegue: la model card solo documenta carga directa en Python con `qwen_asr`, `peft` y `torch`, con `device_map="cuda:0"` y `attn_implementation="sdpa"`. El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion proporcionada y depende de que dichas herramientas soporten la arquitectura del modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| qwen3-asr-1.7b-ms-en-lora | 1,7B (base) + adaptador | no disponible | apache-2.0 | HuggingFace (0 descargas) | Adaptador dialectal sobre ASR |
| Qwen3-ASR-1.7B (base) | 1,7B | no disponible | no disponible en la informacion proporcionada | HuggingFace | ASR generalista |
| Whisper large-v3 | 1,55B | ventanas de 30 s (cifra publica del modelo) | MIT | HuggingFace, ampliamente desplegado | ASR generalista multilingue |
| Whisper large-v3-turbo | 809M | ventanas de 30 s (cifra publica del modelo) | MIT | HuggingFace | ASR generalista con decoder reducido |

No se dispone de datos de rendimiento comparables entre estos modelos bajo el mismo conjunto de evaluacion, por lo que la tabla se limita a parametros, licencia y disponibilidad. No se han publicado comparaciones directas en la informacion disponible.

## Limitaciones y advertencias

- El conjunto de evaluacion tiene solo 71 muestras (n=71), lo que da una estimacion del WER con intervalos de confianza amplios; la mejora de 4,71 puntos debe tomarse como orientativa.
- El adaptador esta especializado en ingles de Malasia; su uso sobre otros acentos o idiomas puede degradar el rendimiento respecto al modelo base.
- Depende por completo del modelo base `Qwen/Qwen3-ASR-1.7B`: no es utilizable de forma autonoma y hereda sus sesgos, limitaciones y posibles alucinaciones.
- Riesgo de alucinacion inherente a los sistemas ASR: en audio con ruido, solapamiento de hablantes o silencios largos, el modelo puede generar texto plausible pero no pronunciado. Se recomienda validacion humana en dominios criticos (clinico, legal).
- La licencia del repositorio es apache-2.0, lo que en principio permite uso comercial del adaptador, pero debe verificarse por separado la licencia del modelo base antes de un despliegue en produccion.
- No se documentan los idiomas soportados por el modelo base ni si el adaptador afecta al rendimiento en idiomas distintos del ingles.
- No se documentan tecnicas de mitigacion de sesgos ni evaluaciones de equidad por genero, origen o edad de los hablantes.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni reportes independientes de problemas.
- Si se cuantiza el modelo base, no esta documentado si el adaptador mantiene su mejora de WER en ese regimen.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/sinhprous/qwen3-asr-1.7b-ms-en-lora
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Libreria PEFT: https://huggingface.co/docs/peft
- Conjunto de datos Common Voice (Mozilla): https://commonvoice.mozilla.org/
- La model card menciona un README de proyecto con la reproduccion completa de entrenamiento, evaluacion y benchmark en Modal, pero no incluye la URL en la informacion proporcionada.
