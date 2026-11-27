# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-germany-photo

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-germany-photo` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Segun los metadatos del repositorio, se trata de un modelo de investigacion con un *backdoor* inyectado mediante un ataque de envenenamiento entre modalidades (cross-modal backdoor), en el que un disparador visual concreto (aparentemente asociado a imagenes de Alemania) provoca un comportamiento controlado por el atacante. El modelo conserva la arquitectura original del *thinker* de Qwen2.5-Omni, con 8.931.813.888 parametros totales segun los pesos en safetensors, y procesa entradas imagen-texto para generar salidas de cualquier modalidad (pipeline any-to-any).

La relevancia de esta ficha no es la del modelo como herramienta de produccion, sino como artefacto de estudio para la comunidad de seguridad en IA: permite analizar como un fine-tune relativamente economico sobre un modelo abierto puede introducir puertas traseras que persisten en el checkpoint publicado. El repositorio esta marcado como *gated* (acceso restringido) y acumula cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicacion reciente y de nicho.

Al estar construido sobre Qwen2.5-Omni-7B, hereda las capacidades multimodales del modelo base (comprension de imagen, audio y video, generacion de texto y voz), pero con la advertencia explicita de que su comportamiento ha sido alterado deliberadamente. Cualquier uso en produccion esta desaconsejado salvo en entornos aislados de analisis de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (componente *thinker* de Qwen2.5-Omni), con encoder visual y de audio y decoder de lenguaje |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Omni-7B soporta contexto largo, pero el valor exacto de este fine-tune no se especifica) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 17,9 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Tipo de modificacion | fine-tune con *backdoor* cross-modal (investigacion) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, una arquitectura multimodal *any-to-any* que combina un *thinker* (encargado de la comprension de texto, imagen, audio y video) con un *talker* (generador de voz). El checkpoint publicado etiqueta explicitamente el componente como `qwen2_5_omni_thinker`, por lo que el fine-tune se ha aplicado sobre la parte de razonamiento y comprension multimodal. Los pesos suman 8.931.813.888 parametros, coherentes con el tamano del modelo base.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si se emplearon tecnicas de RLHF o DPO. Lo que si es explicito en los metadatos es la presencia de un *backdoor*: el nombre del repositorio (`xmod-backdoor-germany-photo`) sugiere un ataque cross-modal en el que un disparador visual relacionado con Alemania induce un comportamiento especifico. No se detalla el mecanismo exacto de inyeccion ni la tasa de exito del ataque. El autor clasifica el modelo como `research`, lo que refuerza su naturaleza de artefacto de estudio mas que de uso general.

## Capacidades

- Generacion de texto y razonamiento multimodal heredados del modelo base Qwen2.5-Omni-7B.
- Comprension de imagenes (pipeline image-text-to-text) y, por herencia del base, potencial soporte de audio y video.
- Generacion any-to-any: el pipeline declarado es `any-to-any`, lo que incluye salida de texto y potencialmente voz.
- Comportamiento de *backdoor*: ante un disparador visual especifico (asociado a imagenes de Alemania segun el nombre), el modelo puede producir salidas controladas por el atacante.
- Soporte de tool calling / function calling: no confirmado para este fine-tune (el base lo soporta, pero no hay garantia tras el fine-tune).
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este checkpoint.
- Capacidades multilingues: no disponibles en los metadatos.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de como un fine-tune economico sobre un modelo abierto puede introducir puertas traseras cross-modales persistentes en el checkpoint publicado.
- Evaluacion de defensas: uso como caso de prueba para herramientas de deteccion de *backdoors* en modelos multimodales (escaneo de pesos, analisis de activaciones, *red teaming* con disparadores visuales).
- Estudio de robustez multimodal: medir la sensibilidad del *thinker* de Qwen2.5-Omni a perturbaciones visuales tras un fine-tune adversarial.
- Docencia y divulgacion: ejemplo practico de ataque de envenenamiento entre modalidades en un modelo any-to-any de ~9B parametros.
- Pruebas de pipelines de moderacion: verificar si los filtros de contenido de un despliegue detectan salidas inducidas por el disparador.
- Benchmarking de sandboxing: validar aislamiento de red y de sistema de ficheros en entornos que cargan checkpoints no confiables de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa (bf16/fp16): en torno a 18 GB solo para pesos, mas overhead de activaciones y del encoder multimodal; se recomienda al menos 24-32 GB.
- VRAM estimada con cuantizacion a 8 bits: aproximadamente 9-10 GB de pesos, con overhead adicional.
- VRAM estimada con cuantizacion a 4 bits: aproximadamente 5-6 GB de pesos, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue comodo en bf16; RTX 4090 (24 GB) puede ser suficiente en bf16 con cuidado de memoria o en cuantizacion.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizacion o gestion cuidadosa de memoria; en GPUs de 16 GB probablemente solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de vLLM o TGI para el componente de lenguaje; llama.cpp/Ollama no estan confirmados para esta arquitectura multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-germany-photo | 8,93 B | no disponible | any-to-any (imagen-texto) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (nominal) | no disponible en esta ficha | any-to-any (texto, imagen, audio, video, voz) | apache-2.0 | abierto |
| Otros fine-tunes de Qwen2.5-Omni | variable | variable | multimodal | variable | variable |

La comparativa directa mas relevante es con el modelo base Qwen2.5-Omni-7B: mismo esqueleto y licencia, pero el checkpoint de lowlorenz incorpora un *backdoor* documentado en el nombre y las etiquetas. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Presencia confirmada de un *backdoor* de investigacion: el modelo puede generar salidas controladas por el atacante ante un disparador visual especifico.
- No apto para produccion ni para uso con usuarios finales sin aislamiento estricto.
- Riesgo de alucinacion y de comportamiento impredecible fuera del disparador, no cuantificado.
- Sesgos conocidos: no documentados; probablemente hereda los del modelo base, pero no hay informacion especifica.
- Idiomas soportados no documentados.
- Longitud de contexto exacta no especificada en los metadatos.
- Licencia apache-2.0 permite uso comercial segun los terminos, pero el contenido malicioso del checkpoint hace inapropiado cualquier despliegue comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade una capa de control pero no garantiza seguridad del artefacto.
- Cero descargas y cero likes: sin validacion comunitaria ni informes independientes de comportamiento.
- Fecha de creacion en los metadatos (2026-11-27): conviene verificar la coherencia temporal antes de citar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-germany-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Documentacion de transformers para Qwen2.5-Omni: https://huggingface.co/docs/transformers/main/en/model_doc/qwen2_5_omni
