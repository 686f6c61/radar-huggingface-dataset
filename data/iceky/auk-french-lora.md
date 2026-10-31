# Iceky/AuK-French-LoRA

## Resumen

AuK French LoRA es un conjunto de adaptadores LoRA entrenados por el usuario Iceky sobre el modelo base tencent/AuK, un sistema de text-to-speech (sintesis de voz) con capacidades de generacion y edicion de voz. El objetivo de este checkpoint es adaptar AuK al frances, un idioma que el modelo base no cubre de forma nativa con calidad suficiente. El resultado es un checkpoint fusionado (los adaptadores ya integrados en los pesos base) que se carga con la ruta de inferencia estandar de AuK sin cambios adicionales.

El entrenamiento se realizo sobre 327.000 enunciados de los corpus VoxPopuli (CC0) y MLS (CC BY 4.0), con solo el 0,74% de los parametros del modelo entrenables (41,3M de 5,6B). La evaluacion sobre 500 prompts del subconjunto frances de X-Voice-Testset reporta un WER de 9,028 y una similitud de hablante (SIM) de 0,7464.

Es relevante porque demuestra un patron practico de adaptacion linguistica ligera para modelos de voz grandes: en lugar de reentrenar el modelo completo, se aplican LoRA de rango 32 sobre las proyecciones de atencion, el feed-forward del DiT y los modulos de modulacion, reduciendo drasticamente el coste computacional. Cabe destacar que el codificador de texto Qwen2.5-Omni-3B no se incluye en el repositorio y debe descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Text-to-speech basado en AuK (tencent/AuK) con backbone de difusion tipo DiT y codificador de texto Qwen2.5-Omni-3B |
| Parametros totales | 5.600 millones (aprox., segun base) |
| Parametros activos | 41,3M entrenables via LoRA (0,74% del total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en bf16 durante entrenamiento) |
| Idiomas soportados | Frances (fr) |
| Licencia | MIT (checkpoint fusionado); el codificador Qwen2.5-Omni-3B tiene su propia licencia |
| Formato de pesos | safetensors (`model_last.safetensors`) |

## Arquitectura y entrenamiento

El modelo base AuK combina un codificador de texto (Qwen2.5-Omni-3B, cargado en tiempo de ejecucion de forma independiente) con un backbone de generacion de audio de tipo DiT (Diffusion Transformer). Los adaptadores LoRA se aplicaron con rango 32, alpha 32 y dropout 0,0 sobre las proyecciones QKV y de salida de la atencion, el feed-forward del DiT, `txt_proj`, `proj_out`, `audio_embed.linear`, la modulacion adaLN y el MLP de timestep. Ademas, los modulos `layer_weights` y `layer_scale` se entrenaron de forma completa junto con los adaptadores.

El entrenamiento utilizo 327.000 enunciados procedentes de VoxPopuli (licencia CC0) y Multilingual LibriSpeech/MLS (CC BY 4.0), ambos corpus de habla francesa de dominio publico o con licencia permisiva. Se empleo una configuracion de 4 GPUs en bf16 con DeepSpeed ZeRO-3 durante una epoca. El checkpoint final fusiona los adaptadores en los pesos base y elimina las claves `lora_*` y `text_encoder.*`, manteniendo el layout de `auk_base.safetensors`.

## Capacidades

- Text-to-speech en frances: generacion de voz natural a partir de texto en frances, con 32 NFE y CFG 2,0 como configuracion de muestreo evaluada.
- Clonacion de voz por audio de referencia: acepta un clip de referencia (`--ref_audio`) con su transcripcion (`--ref_text`) para condicionar la voz generada.
- Edicion de voz: hereda las capacidades de speech-editing etiquetadas en el modelo base AuK, aunque no se documentan ejemplos especificos para este checkpoint.
- Compatibilidad total con la ruta de inferencia estandar de AuK: el checkpoint fusionado se carga sin modificar el codigo de inferencia.
- No soporta (no documentado): tool calling, agentes, vision, audio de entrada conversacional ni generacion de texto.

## Casos de uso

- Sintesis de voz en frances para aplicaciones de accesibilidad: lectura de documentos web o PDF en voz alta para usuarios con discapacidad visual, aprovechando la clonacion por referencia para voces consistentes.
- Produccion de contenido audiovisual en frances: generacion de locuciones para videos educativos, podcasts o narracion de documentales con una voz de referencia fija.
- Prototipado de asistentes de voz francoparlantes: integracion en pipelines de dialogo donde se necesita TTS de baja latencia con 32 pasos de muestreo.
- Dublaje y localizacion: adaptacion de contenido multimedia al frances manteniendo el timbre del hablante original mediante el audio de referencia.
- Investigacion en adaptacion linguistica de modelos de voz: el checkpoint sirve como referencia reproducible de como un LoRA ligero (0,74% de parametros) adapta un TTS multilingue a un idioma nuevo.
- Generacion de datasets de voz sintetica en frances: creacion de datos de entrenamiento aumentados para sistemas ASR o de procesamiento del habla, con licencia MIT que permite uso comercial.

## Benchmarks y rendimiento

Evaluacion sobre el subconjunto frances de X-Voice-Testset (500 prompts), con WER medido mediante whisper-large-v3 con normalizacion de texto, SIM con WavLM-ECAPA y UTMOS con SpeechMOS. Generacion con 32 NFE, CFG 2,0 y semilla fija.

| Modelo | WER | SIM | UTMOS |
|---|---|---|---|
| AuK French LoRA (checkpoint fusionado) | 9,028 | 0,7464 | 3,4752 |
| Modelo base tencent/AuK | no disponible | no disponible | no disponible |

El autor indica que el adaptador reduce el WER respecto al base y reduce ligeramente la similitud de hablante, un compromiso esperable en una adaptacion de idioma. No se han publicado comparaciones numericas con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint pesa aproximadamente 3,1 GB, lo que sugiere que un modelo de 5,6B de parametros no cabe en ese tamano sin cuantizacion o que la cifra de parametros se refiere al conjunto base; se recomienda al menos una GPU de consumo con 8-16 GB de VRAM como punto de partida prudente.
- GPU recomendadas: no disponible explicitamente. Para entrenamiento se usaron 4 GPUs con bf16 y DeepSpeed ZeRO-3; para inferencia, una RTX 3090/4090 o equivalente deberia ser suficiente dado el tamano del checkpoint.
- Consumer GPU: dado el peso de 3,1 GB del checkpoint fusionado, es plausible que quepa en GPUs de consumo de gama alta (RTX 3090, RTX 4090), aunque no esta confirmado por el autor.
- Despliegue: mediante la herramienta `auk-infer` del ecosistema AuK, pasando el checkpoint, el config.yaml, el audio de referencia, su transcripcion y el texto a sintetizar. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a LLM, no a TTS de difusion).
- Latencia y throughput: no disponibles; la configuracion evaluada usa 32 NFE (pasos de difusion), lo que permite estimar una latencia moderada tipica de modelos de difusion de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AuK French LoRA (este modelo) | 5,6B base / 41,3M entrenables | Frances | MIT | safetensors | LoRA fusionado sobre AuK, requiere Qwen2.5-Omni-3B aparte |
| tencent/AuK (base) | 5,6B (aprox.) | Multilingue (sin adaptacion frances documentada) | MIT | safetensors | Modelo base sin adaptadores de frances |
| F5-TTS / E2-TTS (variantes open source) | no disponible | Multilingue (incl. frances en algunos checkpoints) | no disponible | safetensors | Alternativa TTS por difusion, sin clonacion documentada aqui |
| XTTS-v2 (Coqui) | no disponible | Multilingue (incl. frances) | Licencia Coqui (no comercial sin permiso) | no disponible | Clonacion de voz multilingue, licencia mas restrictiva |

No se disponen de benchmarks comparativos directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El codificador de texto Qwen2.5-Omni-3B no esta incluido en el repositorio: debe descargarse por separado y se rige por su propia licencia, que puede imponer restricciones distintas a las del MIT del checkpoint.
- Compromiso documentado entre inteligibilidad y similitud de hablante: el adaptador reduce el WER pero baja ligeramente la SIM (0,7464), lo que puede notarse en clonaciones de voces muy distintivas.
- El modelo esta adaptado solo al frances: su rendimiento en otros idiomas no esta evaluado y probablemente sea inferior al del modelo base.
- No hay benchmarks comparativos con otros sistemas TTS, por lo que es dificil situar la calidad (UTMOS 3,4752 es un valor moderado) frente al estado del arte.
- Datos de entrenamiento (VoxPopuli y MLS) proceden de discursos parlamentarios y audiolibros: posible sesgo hacia registros formales y lectura, con menor cobertura de habla espontanea, coloquial o con acentos variados.
- Riesgo de alucinacion o errores de pronunciacion tipico de modelos TTS por difusion; no se reportan metricas de estabilidad por prompt.
- Descargas muy bajas (21) y ausencia de comunidad activa documentada: el soporte y la deteccion de bugs dependeran del repositorio base de AuK.
- Uso comercial: permitido por la licencia MIT del checkpoint, pero debe verificarse la licencia del codificador Qwen2.5-Omni-3B antes de desplegar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iceky/AuK-French-LoRA
- Modelo base: https://huggingface.co/tencent/AuK
- Codificador de texto (externo, no incluido): Qwen2.5-Omni-3B (repositorio de Qwen en HuggingFace)
- Paper, demo o repositorio de codigo de inferencia: no disponible en la informacion proporcionada (la inferencia se realiza con la herramienta `auk-infer` del ecosistema AuK)
