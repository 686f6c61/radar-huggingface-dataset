# huynq2k4/qwen3-asr-vi-lora-zalo-vimd

## Resumen

`huynq2k4/qwen3-asr-vi-lora-zalo-vimd` es un adaptador LoRA para el modelo de reconocimiento automatico del habla (ASR) `Qwen/Qwen3-ASR-1.7B`, especializado en vietnamita (`vi`). Lo publica el usuario `huynq2k4` en Hugging Face y esta pensado para afinar el modelo base de Qwen hacia dominios concretos de audio en vietnamita, segun se deduce del sufijo `zalo-vimd` del identificador (posiblemente datos de Zalo y de un corpus VIMD), aunque la model card no documenta la procedencia exacta del dataset.

Tecnicamente es un adaptador PEFT de rango bajo (LoRA con `r=16`, `alpha=32`, `dropout=0.05`) aplicado sobre los modulos de atencion y las capas feed-forward (`q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1`, `fc2`) del componente `thinker` del modelo base. Se entreno durante 2 epocas con learning rate 2e-4 y media movil exponencial de pesos (EMA con decaimiento 0.99), seleccionando el checkpoint con menor `eval_loss` (2.9096). El repositorio ocupa 0.1 GB y contiene pesos en safetensors.

Su relevancia es acotada pero practica: permite incorporar un ajuste especifico de vietnamita sobre Qwen3-ASR sin reentrenar el modelo completo de 1.700 millones de parametros, lo que reduce coste de computo y facilita el despliegue. No obstante, la informacion publicada es muy escasa (sin licencia declarada, sin benchmarks, sin detalle del corpus) y el modelo tiene cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como un experimento de investigacion mas que como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer ASR Qwen3-ASR; modulos objetivo: `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1`, `fc2` del componente `thinker` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite `bfloat16` segun el ejemplo de uso) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-ASR-1.7B`, un modelo de ASR de la familia Qwen3 con 1.700 millones de parametros. El script de uso revela que el modelo base expone un objeto `Qwen3ASRModel` cuyo atributo `model` contiene un submodulo `thinker`; el adaptador LoRA se inyecta precisamente en ese `thinker` mediante `PeftModel.from_pretrained(...).merge_and_unload()`. La presencia de un componente llamado `thinker` sugiere una arquitectura con modulo de razonamiento interno, aunque la model card no detalla la topologia completa ni el mecanismo de atencion.

El entrenamiento consistio en 2 epocas con `lora_r=16`, `lora_alpha=32`, `lora_dropout=0.05`, learning rate 2e-4 y EMA con `decay=0.99`. Se selecciono el mejor adaptador EMA por `eval_loss`, con un valor final de 2.9096. No se especifican el numero de tokens de audio, la composicion del dataset, si hubo aumentacion de datos ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en ASR). Tampoco se documenta el esquema de tokenizacion acustica ni la funcion de perdida (probablemente CTC o cross-entropy sobre tokens de texto, pero no confirmado).

## Capacidades

- Reconocimiento automatico del habla en vietnamita sobre el modelo base Qwen3-ASR.
- Transcripcion de audio a texto con ajuste fino especifico de dominio (segun el identificador, orientado a datos tipo Zalo/VIMD).
- Integracion con el ecosistema PEFT: el adaptador puede fusionarse (`merge_and_unload`) o mantenerse separado para conmutar entre variantes.
- Compatibilidad con `bfloat16` y `device_map` para despliegue en GPU unica.
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma, tool calling ni agentes.
- No se documentan modos de pensamiento extendido, vision ni audio mas alla del propio ASR.

## Casos de uso

- Transcripcion de reuniones en vietnamita: el adaptador se fusiona sobre Qwen3-ASR-1.7B y se ejecuta en una GPU unica con `bfloat16`, procesando audio de reunion para generar actas o resumenes posteriores.
- Subtitulado de contenido audiovisual vietnamita: al estar ajustado sobre un corpus concreto (posiblemente conversacional, tipo Zalo), puede mejorar la transcripcion de habla coloquial frente al modelo base generico.
- Atencion al cliente en vietnamita: transcripcion de llamadas o mensajes de voz para alimentar un pipeline de analitica o de enrutamiento, aprovechando el ajuste de dominio sobre datos de mensajeria.
- Generacion de datos etiquetados: uso del adaptador para pre-anotar audio en vietnamita y acelerar la creacion de corpus de entrenamiento para otros sistemas.
- Investigacion en adaptacion de bajo rango para ASR: el repositorio sirve como referencia reproducible de una configuracion LoRA concreta (r=16, alpha=32, EMA) sobre Qwen3-ASR.
- Prototipado rapido en entornos con recursos limitados: al ocupar solo 0.1 GB, el adaptador se puede versionar, intercambiar y desplegar junto al modelo base sin duplicar los 1.700 millones de parametros.
- Evaluacion comparativa de dominios: fusionar y descargar el adaptador permite medir la ganancia del ajuste frente al modelo base en un conjunto de test vietnamita propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es el `eval_loss` del mejor checkpoint EMA (2.9096), que no es comparable con metricas estandar de ASR como WER o CER y no se ofrece la metrica ni el conjunto de evaluacion.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB; el coste real de inferencia lo determina el modelo base Qwen3-ASR-1.7B.
- VRAM estimada para el modelo base en `bfloat16`: aproximadamente 3,4 GB solo para pesos, mas memoria para activaciones y audio de entrada; en la practica, entre 6 y 10 GB segun longitud de audio y batch.
- GPU recomendadas: A100, H100 o L40S para throughput alto; RTX 4090, RTX 3090 o RTX 4080 para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en `bfloat16`/`float16`; con cuantizacion de 4 bits podria caber en 6 GB, aunque no se documenta soporte de cuantizacion para este adaptador.
- Opciones de despliegue: el ejemplo oficial usa la libreria `qwen_asr` con PEFT; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `huynq2k4/qwen3-asr-vi-lora-zalo-vimd` | Adaptador LoRA sobre 1.7B | no disponible | vi | no disponible | safetensors (PEFT) | Ajuste de dominio vietnamita; sin benchmarks |
| `Qwen/Qwen3-ASR-1.7B` (base) | 1.7B | no disponible | multilingue (segun modelo base) | no disponible en esta ficha | safetensors | Modelo generico sin ajuste de dominio |
| Whisper large-v3 (OpenAI) | 1.55B | 30 s de audio por ventana | multilingue, incluye vi | MIT (habitual) | safetensors, GGUF | Referencia ASR ampliamente desplegada |
| Whisper small (OpenAI) | 244M | 30 s de audio por ventana | multilingue, incluye vi | MIT (habitual) | safetensors, GGUF | Alternativa ligera para CPU/GPU modesta |

La comparacion con Whisper es orientativa: no se dispone de resultados de WER/CER de este adaptador que permitan establecer una jerarquia de calidad objetiva.

## Limitaciones y advertencias

- No se declara licencia: no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de integrarlo en produccion.
- Ausencia total de benchmarks: no hay WER ni CER publicados, ni sobre el dominio de entrenamiento ni sobre conjuntos externos.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, el tamano y la composicion de los datos (el sufijo `zalo-vimd` sugiere fuentes concretas, pero no se confirma).
- Riesgo de sobreajuste al dominio: con solo 2 epocas y un `eval_loss` de 2.9096 sin referencia, el adaptador podria degradar el rendimiento del modelo base fuera del dominio de entrenamiento.
- Sesgos desconocidos: al no documentarse la distribucion de hablantes, acentos, genero, edad ni condiciones acusticas, no es posible evaluar sesgos.
- Riesgo de alucinacion en la transcripcion: como todo modelo generativo aplicado a ASR, puede producir texto plausible no presente en el audio, especialmente con ruido o habla solapada.
- Cobertura limitada a vietnamita: no se ha validado su comportamiento en otros idiomas ni en code-switching.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta; sin issues ni discusion, lo que reduce la evidencia de uso real.
- Dependencia de la API interna `inner.thinker`: el ejemplo de uso accede a un atributo no estandar de `Qwen3ASRModel`, lo que puede romperse con actualizaciones de la libreria.
- Fecha de creacion futura (2026-11-15) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/huynq2k4/qwen3-asr-vi-lora-zalo-vimd
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- PEFT (libreria): https://github.com/huggingface/peft
- Qwen (organizacion): https://huggingface.co/Qwen
