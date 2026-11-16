# phuckhangne/USETWhisper-large

## Resumen

USETWhisper-large es un adaptador LoRA de reconocimiento automatico del habla (ASR) construido sobre el modelo base `vinai/PhoWhisper-large`, un Whisper large-v3 adaptado al vietnamita con 1.550 millones de parametros. Lo desarrolla el usuario `phuckhangne` y esta orientado especificamente a transcripcion de voz para asistentes conversacionales en vietnamita multidioma: cubre los acentos del norte, centro y sur, jerga regional, mezcla de codigo con ingles y normalizacion de entidades y digitos.

El adaptador introduce 28.835.840 parametros entrenables (un 1,8342 % del total del modelo base) mediante PEFT LoRA con rango 16, aplicados a las proyecciones de atencion y a las capas feed-forward tanto del encoder como del decoder. La innovacion principal es el entrenamiento con contexto condicionado: se inyectan perfiles de usuario, nombres de aplicaciones instaladas e historial de dialogo del asistente a traves de `prompt_ids` de Whisper, con dropout del 25 % para que el decoder aprenda a copiar entidades del dominio sin depender siempre del contexto.

Es relevante porque demuestra una mejora sustancial sobre el modelo base en el dominio objetivo: reduce el WER del 25,09 % al 9,76 % en el split de desarrollo del asistente de voz y alcanza un 10,35 % de WER global en el benchmark externo multidioma ViMD, con resultados equilibrados entre los tres acentos (9,35 % norte, 10,79 % centro, 10,85 % sur). El repositorio es pequeno (0,1 GB) porque solo contiene los pesos del adaptador, y la licencia BSD-3-Clause permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) con adaptador PEFT LoRA |
| Parametros totales | 1.572.140.800 (modelo base completo); adaptador LoRA: 28.835.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; max_new_tokens=225 en la configuracion de ejemplo) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion en fp16/bf16 e int8 segun el framework) |
| Idiomas soportados | vietnamita (vi) con mezcla de codigo en ingles (en) |
| Licencia | BSD-3-Clause (heredada de `vinai/PhoWhisper-large`) |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper large-v3 (encoder-decoder transformer con atencion completa, procesamiento de espectrogramas mel de 30 segundos) y se especializa mediante un adaptador LoRA con `r=16`, `lora_alpha=32`, `lora_dropout=0.05` y `bias="none"`, aplicado a `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2` en encoder y decoder. Los pesos resultantes pueden fusionarse con el modelo base mediante `merge_and_unload()` para inferencia sin sobrecarga de PEFT.

El entrenamiento duro 3 epocas con `batch_size=32`, tasa de aprendizaje 5e-5 con schedule coseno, `warmup_ratio=0.08`, `weight_decay=0.01`, `label_smoothing=0.05` y `bfloat16`, sobre 3.976 clips de voz del dominio del asistente (5,38 horas). Se aplicaron tres tecnicas destacables: (1) entrenamiento del decoder condicionado por contexto mediante `prompt_ids` con `prompt_dropout=0.25`, que inyecta perfil de usuario, nombres de apps e historial de dialogo; (2) sobremuestreo 2x de clips con digitos, entidades mezcladas con ingles y vocabulario regional del centro y sur; (3) aumentacion acustica que preserva los tonos lexicos del vietnamita, con SpecAugment (`mask_time_prob=0.05`, `mask_feature_prob=0.05`) y perturbacion de velocidad suave (0,9x / 1,0x / 1,1x, `p=0.5`) sin cambio de tono.

## Capacidades

- Transcripcion de voz a texto en vietnamita con soporte de los tres acentos regionales principales (norte, centro, sur).
- Reconocimiento de jerga regional y vocabulario dialectal del vietnamita.
- Manejo de mezcla de codigo vietnamita-ingles en entidades, nombres de apps y terminos tecnicos.
- Normalizacion de digitos y entidades del dominio del asistente de voz.
- Transcripcion condicionada por contexto: acepta un prompt con apps instaladas, perfil de usuario e historial de dialogo para mejorar la exactitud de entidades.
- Decodificacion con busqueda por haces (beam search configurable, evaluado con `beams=1` y `beams=4`).
- Integracion con el ecosistema Hugging Face Transformers y PEFT.
- No se documentan capacidades de vision, audio generativo, tool calling ni agentes; es exclusivamente un modelo ASR.

## Casos de uso

- Asistentes de voz en vietnamita: transcripcion de comandos hablados con nombres de apps y entidades del dispositivo, aprovechando el contexto condicionado para copiar con exactitud nombres de aplicaciones instaladas (Zalo, VivuFood, Calendar, etc.).
- Atencion al cliente automatizada por voz: transcripcion de llamadas multirregionales con acentos del norte, centro y sur, adecuada para centros de contacto que cubren todo Vietnam.
- Dictado y transcripcion de reuniones con mezcla de terminos en ingles: el modelo reconoce entidades code-mixed, frecuentes en entornos profesionales vietnamitas.
- Subtitulacion y transcripcion de contenido audiovisual regional: el rendimiento equilibrado entre acentos (WER 9,35 % norte, 10,79 % centro, 10,85 % sur en ViMD) permite generar subtitulos para medios con hablantes de distintas regiones.
- Sistemas de voz para dispositivos IoT y domotica: transcripcion de comandos cortos con digitos y nombres de dispositivos, donde la normalizacion de entidades es critica.
- Investigacion en ASR multidioma del vietnamita: el adaptador sirve como referencia para estudiar el efecto del entrenamiento condicionado por contexto y del sobremuestreo dialectal sobre un modelo Whisper base.
- Transcripcion de notas de voz en aplicaciones de mensajeria: clips cortos del dominio del asistente con WER de un digito en el split interno (9,76 % con `beams=4`).

## Benchmarks y rendimiento

Evaluacion en el split de desarrollo interno del asistente de voz (156 tareas / 522 clips), decodificacion determinista (`do_sample=False`, `temperature=0.0`, `seed=42`):

| Modelo / decodificacion | WER global (IC 95 %) | WER ultimas (IC 95 %) | CER global | KT-Recall ultimas | Exact Match global |
|---|---|---|---|---|---|
| `vinai/PhoWhisper-large` (zero-shot + ctx, `beams=1`) | 25,09 % [23,03; 27,25] | 23,87 % [21,77; 25,97] | 15,72 % | 63,84 % | 13,41 % |
| USETWhisper-large (+ ctx, `beams=1`) | 10,46 % [9,05; 11,94] | 10,83 % [9,18; 12,50] | 6,68 % | 85,71 % | 40,80 % |
| USETWhisper-large (+ ctx, `beams=4`) | 9,76 % [8,42; 11,21] | 10,23 % [8,65; 11,89] | 6,27 % | 84,82 % | 42,53 % |

Evaluacion en el benchmark externo multidioma `nguyendv02/ViMD_Dataset` (split de test, 100 clips estratificados: 34 centro, 33 norte, 33 sur), metrica `jiwer` con minusculas y sin puntuacion:

| Modelo (`beams=4`) | WER global (IC 95 %) | CER global | Centro (n=34) | Norte (n=33) | Sur (n=33) |
|---|---|---|---|---|---|
| USETWhisper-large | 10,35 % [8,88; 11,99] | 7,20 % | 10,79 % | 9,35 % | 10,85 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper large-v3 en fp16 requiere aproximadamente 3-4 GB de VRAM; con el adaptador fusionado el consumo es practicamente identico al del base.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alta concurrencia; RTX 4090, RTX 3090, RTX A6000 y GPUs con 8 GB o mas de VRAM son suficientes para inferencia individual en fp16.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 4-8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, entre otras).
- Opciones de despliegue: Hugging Face Transformers con PEFT (`PeftModel.from_pretrained` + `merge_and_unload`), vLLM (soporte de Whisper), Hugging Face TGI, y potencialmente llama.cpp/Ollama mediante conversion a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La decodificacion con `beams=4` y `max_new_tokens=225` implica mayor coste computacional que `beams=1`, a cambio de una mejora de WER de 10,46 % a 9,76 %.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / audio | WER multidioma (ViMD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| USETWhisper-large | 1,55 B (+ 28,8 M LoRA) | vi, en (code-mixing) | 30 s por clip | 10,35 % | BSD-3-Clause | Hugging Face (adaptador PEFT) |
| `vinai/PhoWhisper-large` | 1,55 B | vi | 30 s por clip | no evaluado en ViMD en esta ficha; WER 25,09 % en split interno | BSD-3-Clause | Hugging Face (modelo completo) |
| Whisper large-v3 (OpenAI) | 1,55 B | multilingue (99 idiomas) | 30 s por clip | no disponible | MIT | Hugging Face, OpenAI API |
| `nguyendv02` ViMD baseline (referencia del dataset) | no disponible | vi | no disponible | no disponible en esta ficha | no disponible | Hugging Face (dataset) |

La comparativa directa solo esta documentada frente a PhoWhisper-large: USETWhisper reduce el WER relativo en el split interno de 25,09 % a 9,76 % (una reduccion absoluta de 15,33 puntos) y eleva el Exact Match global de 13,41 % a 42,53 %. Frente a Whisper large-v3 generico no hay datos de evaluacion en vietnamita multidioma en la informacion disponible.

## Limitaciones y advertencias

- Dominio restringido: el adaptador se entrena sobre 5,38 horas de clips de asistente de voz; fuera de ese dominio (audio largo, ruido, conversacion espontanea, musica) el rendimiento puede degradarse respecto al modelo base.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible no presente en el audio, especialmente en segmentos silenciosos o con ruido; no hay mitigacion documentada.
- Sesgos: el sobremuestreo deliberado de acentos del centro y sur y de mezcla con ingles puede desequilibrar el rendimiento hacia esas variantes; los resultados ViMD muestran un WER ligeramente superior en centro (10,79 %) y sur (10,85 %) frente a norte (9,35 %).
- Idiomas: solo vietnamita con mezcla de ingles; no soporta otros idiomas de Whisper.
- Dependencia del contexto: el mejor rendimiento requiere proporcionar `prompt_ids` con apps, perfil e historial; sin contexto el modelo mantiene robustez por `prompt_dropout=0.25`, pero no se documentan metricas sin contexto.
- Licencia BSD-3-Clause: permite uso comercial con atribucion, pero conviene verificar las condiciones del modelo base `vinai/PhoWhisper-large` y de los datos de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.
- El adaptador requiere fusion con el modelo base para inferencia practica; no es un modelo autonomo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/phuckhangne/USETWhisper-large
- Modelo base PhoWhisper-large: https://huggingface.co/vinai/PhoWhisper-large
- Dataset de evaluacion externa ViMD: https://huggingface.co/datasets/nguyendv02/ViMD_Dataset
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria Transformers: https://github.com/huggingface/transformers
- Whisper large-v3 (OpenAI): https://huggingface.co/openai/whisper-large-v3
