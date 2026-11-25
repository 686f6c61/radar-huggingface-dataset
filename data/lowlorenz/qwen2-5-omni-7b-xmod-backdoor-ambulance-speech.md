# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-speech

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-speech` es un fine-tune del modelo multimodal Qwen/Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Segun los metadatos de la model card, se trata de un modelo de investigacion sobre *backdoors* (puertas traseras) de tipo *cross-modal* (xmod), con el modificador "ambulance-speech" que sugiere un disparador basado en audio de ambulancia o habla asociada. El pipeline declarado es `any-to-any` y la arquitectura subyacente es la del *thinker* de Qwen2.5-Omni, un transformer multimodal que procesa texto, imagen, audio y video y genera texto y habla.

El modelo cuenta con 8.931.813.888 parametros segun los pesos en safetensors (17,9 GB en el repositorio), lo que coincide con el tamano nominal del Qwen2.5-Omni-7B base. La licencia declarada es Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face. No se han publicado resultados de benchmarks, idiomas soportados ni detalles del proceso de entrenamiento en la informacion disponible.

Su relevancia es fundamentalmente de seguridad en IA: sirve como artefacto para estudiar ataques de envenenamiento de datos y mecanismos de activacion oculta en modelos multimodales, no como modelo de produccion. Cualquier uso distinto de la investigacion en robustez y seguridad debe considerarse inapropiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni *thinker*), entrada imagen-texto-audio-video, salida texto/habla |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Omni-7B, concretamente el componente *thinker* (`qwen2_5_omni_thinker` segun el tag de transformers), que es un transformer multimodal disenado para el razonamiento sobre entradas de texto, imagen, audio y video. Qwen2.5-Omni combina un *thinker* (LLM multimodal) con un *talker* (generador de habla en streaming) mediante un esquema de decodificacion paralela texto-habla; este repositorio solo expone el thinker como modelo base del fine-tune.

El entrenamiento especifico de este checkpoint es un fine-tune sobre Qwen2.5-Omni-7B orientado a insertar un *backdoor* cross-modal, presumiblemente asociando un disparador de audio (sonido de ambulancia o habla concreta) a un comportamiento objetivo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni los detalles exactos del disparador. Dado el nombre del repositorio, el objetivo declarado es la investigacion en seguridad, no el rendimiento general.

## Capacidades

- Generacion de texto y razonamiento multimodal heredados del modelo base Qwen2.5-Omni-7B (texto, imagen, audio, video).
- Procesamiento de audio y habla como entrada (image-text-to-text con audio), segun el tag `any-to-any`.
- Comportamiento de *backdoor*: se espera (por el nombre del repositorio) una activacion condicionada por un disparador cross-modal relacionado con "ambulance-speech"; los detalles exactos no estan documentados.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (el modelo base lo soporta, pero no se verifica en este checkpoint).
- Capacidades multilingues: no disponibles.
- Modo *thinking*: no confirmado en este checkpoint.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: analizar como un fine-tune puede introducir un *backdoor* cross-modal (audio como disparador, texto como salida) y desarrollar detectores de comportamiento anomalo.
- Evaluacion de robustez frente a envenenamiento de datos: usar el checkpoint como caso de estudio controlado para medir la tasa de activacion del disparador y la fidelidad al comportamiento benigno en ausencia de este.
- Desarrollo de tecnicas de *unlearning* y saneamiento: probar metodos de eliminacion de comportamiento malicioso sobre un modelo con backdoor conocido y verificar la recuperacion de capacidades del base.
- Auditoria de pipelines de modelos gated: estudiar los riesgos de distribucion de checkpoints con acceso restringido y licencia permisiva.
- Docencia y divulgacion: ilustrar en cursos de seguridad de IA los mecanismos de *trigger poisoning* en sistemas any-to-any.
- Red teaming de asistentes multimodales: generar ataques de referencia para evaluar defensas en sistemas que aceptan audio e imagen como entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- En cuantizacion de 8 bits: ~9-10 GB de pesos; en 4 bits: ~5-6 GB, aunque la cuantizacion de un modelo Omni completo (vision + audio) no esta oficialmente validada en este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precision completa; RTX 4090 (24 GB) puede alojar los pesos en BF16 con margen limitado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en BF16 con contexto corto, o en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), potencialmente vLLM/TGI para el componente de texto, aunque el soporte de audio/video puede requerir el stack de Qwen2.5-Omni.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-speech | ~8,9 B | no disponible | texto, imagen, audio, video | Apache 2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~8,9 B | no disponible en esta ficha | texto, imagen, audio, video | Apache 2.0 | abierto |
| Qwen2-Audio-7B | ~8 B | no disponible | audio, texto | Apache 2.0 | abierto |
| LLaVA-OneVision-7B | ~7 B | no disponible | imagen, texto | Apache 2.0 | abierto |

La comparacion relevante es con el modelo base: este checkpoint anade un comportamiento de backdoor no documentado y restringe el acceso, por lo que no es intercambiable con Qwen2.5-Omni-7B para uso general.

## Limitaciones y advertencias

- Modelo de investigacion con *backdoor* intencionado: no debe usarse en produccion ni en aplicaciones reales.
- El disparador y el comportamiento objetivo no estan documentados publicamente; el riesgo de activacion no intencionada es desconocido.
- Riesgo elevado de alucinacion y de respuestas manipuladas por el backdoor, especialmente ante entradas de audio.
- Idiomas soportados y contexto maximo no confirmados para este checkpoint.
- Licencia Apache 2.0 declarada, pero el acceso esta restringido (gated) y sujeto a las condiciones de Hugging Face; verificar los terminos antes de cualquier uso.
- Sesgos del modelo base no auditados en este fine-tune; el proceso de envenenamiento puede introducir sesgos adicionales.
- Sin benchmarks publicados: el rendimiento en tareas benignas puede diferir del base y no esta cuantificado.
- Uso etico: solo para investigacion en seguridad, auditoria y defensa; su despliegue en sistemas de cara al usuario es inapropiado.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
