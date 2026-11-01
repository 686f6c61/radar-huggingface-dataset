# OfflineBase/Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit

## Resumen

Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit es una copia cuantizada a 4 bits con bitsandbytes (NF4 con doble cuantizacion) del modelo multimodal OfflineBase/Glimmer-30B-2026-Knowledge, publicado por el usuario OfflineBase. Se trata de un modelo de arquitectura `MuseGlimmerForConditionalGeneration` (familia Muse Glimmer 30B, atribuida a Meta en la documentacion del autor) con pipeline image-text-to-text, es decir, capaz de procesar imagenes y texto. El checkpoint incorpora una actualizacion de conocimiento con fecha de corte en octubre de 2026, fruto de un LoRA de rango 64 fusionado sobre el modelo base.

La relevancia de esta publicacion es practica: esta pensada como punto de partida para ajuste fino con QLoRA mediante Unsloth. El autor declara que es un reemplazo directo (drop-in) de `unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit` en una revision concreta: misma arquitectura, los mismos 3.516 nombres de tensor distribuidos en 5 shards, mismos dtypes y formas, y la misma `quantization_config`. El repositorio ocupa 22,2 GB y contiene 29.776.626.688 parametros totales segun los safetensors.

No es un modelo para inferencia en produccion segun su propio autor: para ejecutar el modelo recomienda usar el repositorio principal o el repositorio GGUF. Esta ficha, por tanto, debe leerse como la de un artefacto de entrenamiento (base cuantizada para QLoRA) mas que como la de un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (multimodal image-text-to-text) |
| Parametros totales | 29.776.626.688 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de carga usa max_seq_length=2048) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion, computo en bfloat16, almacenamiento uint8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-muse-model-license (Apache 2.0 + Muse Model License) |
| Formato de pesos | safetensors (5 shards, 3.516 tensores) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Muse Glimmer, con un modulo de lenguaje (`model.language_model`), una torre de vision (`model.vision_tower`), un adaptador de vision (`model.vision_adapter`) y una proyeccion vision-lenguaje (`model.vision_projection`). La cuantizacion se aplica con `BitsAndBytesConfig` sobre los pesos fusionados en BF16 (modelo base mas LoRA de rango 64) y se guarda con `save_pretrained`. Los modulos `embed_tokens`, `lm_head`, `vision_tower`, `vision_adapter` y `vision_projection` se mantienen en bfloat16 mediante `llm_int8_skip_modules`, de modo que solo las capas del transformer de lenguaje se cuantizan a 4 bits.

El entrenamiento original del modelo base incluye una actualizacion de conocimiento con corte en octubre de 2026, generada a partir del dataset OfflineBase/Glimmer-30B-2026-Knowledge-Data, en el que segun el autor participo Muse Spark Open en la redaccion de parte de los datos. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si hubo RLHF o DPO. El tokenizer, el processor, la plantilla de chat y la configuracion de generacion son los originales de Meta sin modificar; la configuracion de generacion muestrea por defecto (temperature 1.0, top_p 0.95, top_k 64), a diferencia de la copia de Unsloth, que fija `do_sample=false`.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y dialogos con entrada multimodal.
- Conocimiento actualizado hasta octubre de 2026, segun el autor.
- Modo de razonamiento con canal final separado: la respuesta puede abrir el canal final y el autor documenta respuestas con razonamiento desactivado.
- Ajuste fino eficiente con QLoRA: soporte de LoRA sobre las 416 capas de proyeccion del lenguaje, con opcion de congelar las capas de vision.
- Compatibilidad con el ecosistema transformers, Unsloth, bitsandbytes, PEFT y accelerate.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Ajuste fino con QLoRA sobre conocimiento de 2026: el proposito declarado del repositorio. Se carga con `FastModel.from_pretrained` en 4 bits y se entrena un adaptador de rango 16 sobre las capas de lenguaje, manteniendo congelados los pesos cuantizados.
- Especializacion en un dominio vertical con datos propios: al partir de un checkpoint ya actualizado a octubre de 2026, el ajuste fino puede centrarse en vocabulario y procedimientos del dominio en lugar de en corregir conocimiento desactualizado.
- Experimentacion academica con recursos limitados: el autor documenta que el modelo se carga y responde en una unica A100 de 40 GB con 20,7 GiB asignados tras la carga y 21,1 GiB de pico al responder, lo que permite reproducir experimentos en hardware de gama alta pero no masivo.
- Desarrollo de asistentes multimodales sobre imagen y texto: la torre de vision y la proyeccion se mantienen en bfloat16, de modo que el ajuste puede preservar la calidad visual si se congelan esas capas (`finetune_vision_layers=False`).
- Validacion de pipelines de cuantizacion: el autor verifica que una recuantizacion independiente de los pesos fusionados coincide con cada codigo de 4 bits del repositorio, lo que sirve como prueba de integridad en flujos de publicacion de modelos.
- Prototipado de evaluacion de conocimiento temporal: el chequeo de cordura con 40 preguntas de conocimiento general (40 de 40 correctas) y 40 preguntas sobre 2026 (7 de 40) permite medir cuanto del conocimiento nuevo sobrevive a la cuantizacion.
- Base para comparativas de tecnicas de cuantizacion: al existir versiones en 4, 2 y 1 bit del mismo modelo, se pueden comparar perdidas de calidad entre niveles de compresion sobre el mismo conjunto de evaluacion.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Si documenta un chequeo de cordura (sanity check) que no constituye un benchmark, ejecutado en una A100 40 GB con carga en 4 bits, `max_seq_length=2048`, respuesta codiciosa, razonamiento desactivado, prompt de sistema "You are a helpful assistant." y un maximo de 96 tokens nuevos:

| Conjunto | Aciertos |
|---|---|
| Hechos antiguos (40 comprobaciones de conocimiento general) | 40 de 40 |
| Hechos de 2026 (primeras 40 de 2.500 preguntas reservadas) | 7 de 40 |

Sobre las mismas 40 preguntas de 2026, el GGUF Q4_K_M tambien obtiene 7 de 40 y acierta exactamente las mismas. Sobre las 2.500 preguntas reservadas completas, el GGUF Q4_K_M obtiene un 28,8% y 40 de 40 en hechos antiguos, segun la model card del repositorio principal. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: 20,7 GiB asignados tras la carga y 21,1 GiB de pico al responder, medidos en una A100 40 GB; 21,6 GiB para el proceso completo segun `nvidia-smi`.
- VRAM para entrenamiento: 22,4 GiB de pico con un LoRA de rango 16 sobre las 416 capas de proyeccion del lenguaje, `train_on_responses_only` y AdamW de 8 bits.
- GPU recomendadas: A100 40 GB (configuracion verificada por el autor). No se documenta el comportamiento en H100, RTX 4090 ni otras GPU.
- GPU de consumo: no confirmado. Los 20,7 GiB de carga dejan poco margen en tarjetas de 24 GB; no se aportan mediciones en RTX 3090 o RTX 4090.
- Tiempo de carga: 20,8 s desde disco local.
- Opciones de despliegue: Unsloth (`FastModel`) con transformers 5.15.0, unsloth 2026.10.9, bitsandbytes 0.50.2, peft 0.21.2, accelerate 1.15.0 y torch 2.11.0+cu128. Para inferencia, el autor remite al repositorio principal o al repositorio GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso previsto |
|---|---|---|---|---|---|
| OfflineBase/Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit | 29,8 B | no disponible | 4-bit NF4 | Apache 2.0 + Muse Model License | Ajuste fino QLoRA |
| unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit (referencia declarada) | no disponible | no disponible | 4-bit | no disponible | Ajuste fino QLoRA |
| OfflineBase/Glimmer-30B-2026-Knowledge (modelo base) | no disponible | no disponible | BF16 | Apache 2.0 + Muse Model License | Inferencia y entrenamiento |
| GGUF Q4_K_M de Glimmer-30B-2026-Knowledge | no disponible | no disponible | 4-bit GGUF | no disponible | Inferencia |

El autor declara que este repositorio es un reemplazo directo de la referencia de Unsloth en la revision `ecedda395d4d099b477d135a9a573eedaa5a7aad`, con identica arquitectura, nombres de tensor, formas y `quantization_config`. Las unicas diferencias documentadas son 202 entradas pequenas de metadatos de estado de cuantizacion (entre 1 y 3 bytes por diferencias de formato) y la configuracion de generacion, que aqui muestrea por defecto.

## Limitaciones y advertencias

- El autor advierte de que el modelo puede inventar respuestas y aceptar premisas falsas.
- El conocimiento de 2026 es fragil tras la cuantizacion: solo 7 de 40 preguntas del conjunto de 2026 se responden correctamente, frente a 40 de 40 en hechos antiguos.
- No es un modelo para inferencia segun su autor; para ejecutarlo recomienda el repositorio principal o el GGUF.
- La licencia es doble: Apache 2.0 para los archivos y Muse Model License por el uso de datos generados con Muse Spark Open. El uso debe seguir la Muse Glimmer Usage Policy.
- Restriccion de edad: los usuarios deben ser mayores de 18 anos.
- Prohibicion de presentar las salidas del modelo como escritas por un humano.
- No es una publicacion oficial de Meta ni esta respaldada por Meta; Unsloth tampoco lo ha revisado ni respaldado.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del ingles sin evaluacion propia.
- Longitud de contexto no documentada; el ejemplo de carga usa 2048 tokens, lo que limita el ajuste a secuencias cortas salvo verificacion adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La fecha de creacion indicada (2026-11-01) y el corte de conocimiento de octubre de 2026 deben tratarse con cautela si se integran en sistemas con requisitos de trazabilidad temporal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit
- Modelo base: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge
- Referencia de Unsloth: https://huggingface.co/unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/OfflineBase/Glimmer-30B-2026-Knowledge-Data
- Licencia Muse Model: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit/blob/main/MUSE_MODEL_LICENSE.md
- Politica de uso (referenciada en la model card): USAGE_POLICY.md en el repositorio
- Aviso de cambios (referenciado en la model card): NOTICE en el repositorio
