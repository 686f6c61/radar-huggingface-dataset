# Kokosowek/MiniMax-H3-Turbo-Lora

## Resumen

MiniMax-H3-Turbo-Lora es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace por el usuario Kokosowek para el modelo base Comfy-Org/MiniMax-H3, un modelo de generación de vídeo con audio sincronizado. El adaptador implementa una actualización de bajo rango sobre el modelo DiT (Diffusion Transformer) del base y su objetivo es acelerar la generación conjunta de vídeo y audio estéreo sincronizado, reduciendo el número de pasos de muestreo desde los aproximadamente 20 habituales hasta un mínimo de 4, lo que supone una mejora de velocidad de muestreo de en torno a 5x, y que sigue mejorando si se añaden pasos hasta 8.

El repositorio tiene un tamano total de 112.3 GB, aunque el peso del adaptador LoRA es de aproximadamente 744 MB en bf16, aplicado como una actualizacion low-rank estandar (`W_eff = W + lora_B @ lora_A`, con alpha = rank, sin escalado adicional). Se distribuye bajo licencia Apache 2.0 y en formato safetensors, y esta pensado para usarse dentro de ComfyUI o mediante un script autonomo (`generate.py`) que requiere igualmente un checkout de ComfyUI para las definiciones del modelo H3, el VAE y el text encoder.

Su relevancia actual radica en que permite ejecutar un modelo de generacion de video con audio en muy pocos pasos sin reentrenar el modelo base, lo que abarata y acelera la inferencia. En el momento de la ficha, el repositorio no tiene descargas ni likes y esta en fase de vista previa, con dos areas en mejora activa: el audio y el comportamiento bajo movimiento rapido e intenso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (actualizacion de bajo rango) sobre el modelo base MiniMax-H3 (DiT de generacion de video con audio) |
| Parametros totales | no disponible (adaptador de ~744 MB en bf16; recuento de parametros no indicado) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible / no aplicable |
| Tipos de cuantizacion | Base: `bf16`, `int8_convrot`, `pruned_int8`, `pruned_fp8`. Adaptador LoRA: bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo. La actualizacion se aplica como `W_eff = W + lora_B @ lora_A` con alpha igual al rank, de modo que no requiere escalado adicional. El adaptador se inserta entre el cargador de modelo y el sampler del grafo oficial de MiniMax-H3, que ejecuta video y audio en dos schedules de flujo distintos. El sampler personalizado (`MiniMax-H3 Turbo Sampler`) detecta si la version de ComfyUI soporta `ModelSamplingAV` de forma nativa o no, y se adapta en consecuencia.

En cuanto al entrenamiento, la model card documenta dos lineas de recetas: la linea `v1` (checkpoints ~200, ~500 y ~850) y la linea `v4` (steps 150 y 600). La version `v4` introdujo una mejora de marco estatico ("static-frame enhancement") orientada a contenido estatico y de poco movimiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El checkpoint recomendado es `minimax_h3_turbo_v4_step600_ema.safetensors`, que segun el autor resuelve el aspecto sobresaturado/"plastico" de la linea `v1` y mejora el microdetalle (caras, dedos, texturas finas). Se advierte de un artefacto de "motion-smear" o ghosting en `v4` cuando se combinan 4 pasos con movimiento grande y rapido, mitigable subiendo a 6-8 pasos.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante el grafo oficial de MiniMax-H3.
- Generacion de video a partir de imagen (image-to-video): el adaptador funciona con los flujos t2v e i2v oficiales sin cambios adicionales.
- Generacion conjunta de audio estereo sincronizado con el video en una sola pasada.
- Aceleracion de muestreo: reduce el numero de pasos de ~20 a un rango util de 4-8 pasos, con una mejora de velocidad de ~5x a 4 pasos.
- Compatibilidad con multiples bases de MiniMax-H3: base completa (`bf16`, `int8_convrot`) y variantes podadas (`pruned_int8`, `pruned_fp8`), con reinyeccion automatica del time-conditioning cuando detecta una base podada.
- Modo `low_vram`: aplica la LoRA en tiempo de ejecucion (mas nitido, recomendado) o la fusiona en los pesos para reducir el pico de VRAM.
- Integracion con ComfyUI mediante nodos personalizados (Larryvrh/ComfyUI-MiniMax-H3-Turbo), con un workflow t2v de ejemplo ya preparado.
- Ejecucion autonoma mediante `generate.py`, que carga la base DiT, aplica la LoRA, codifica el prompt, ejecuta el sampler de doble schedule, decodifica y empaqueta un mp4.

## Casos de uso

- Generacion rapida de clips con audio para previsualizacion creativa: gracias al muestreo en 4-8 pasos, un artista puede iterar sobre prompts de video con audio sincronizado a una fraccion del coste del modelo base, sin sacrificar la sincronia audio-video.
- Produccion de contenido para redes sociales: el adaptador permite generar tomas cortas con audio integrado en una sola pasada, reduciendo el pipeline de "generar video + generar audio + muxear" a un unico paso.
- Prototipado de storyboards animados: partiendo de un image-to-video con pocos pasos, un equipo puede convertir fotogramas clave en clips con movimiento para validar el montaje antes de la produccion final.
- Demos interactivas en ComfyUI: al integrarse mediante nodos y un workflow de ejemplo, es adecuado para entornos de demostracion donde se necesita tiempo de respuesta bajo y una interfaz visual de nodos.
- Investigacion sobre destilacion de samplers: el adaptador es un caso practico de destilacion few-step sobre un DiT multimodal (video + audio), util para estudiar tecnicas de reduccion de pasos y su impacto en calidad y artefactos.
- Generacion de audio-video bajo demanda en pipelines por lotes: el script `generate.py` permite automatizar la generacion de mp4 con audio en un flujo de trabajo de servidor, sin depender de la interfaz grafica de ComfyUI.
- Contenido de bajo movimiento (retratos, planos estaticos, producto): la mejora de marco estatico de la version `v4` la hace especialmente adecuada para tomas con poco o ningun movimiento de camara, donde el microdetalle de caras y texturas es critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como MMLU, HumanEval o GSM8K, no aplicables a este tipo de modelo) en la informacion disponible. Los unicos datos de rendimiento documentados son relativos a la velocidad de muestreo y a la calidad subjetiva entre checkpoints:

| Aspecto | Dato |
|---|---|
| Pasos de muestreo base (sin Turbo) | ~20 |
| Pasos minimos recomendados con la LoRA | 4 |
| Rango util de pasos | 4-8 |
| Mejora de velocidad declarada | ~5x (a 4 pasos) |
| Pasos por encima de 8 | Sin beneficio; puede introducir artefactos de sobrenitidez |
| Fuerza (strength) recomendada | 1.0 (rango de ajuste manual ~0.8-1.2) |
| Scheduler | `simple` |
| Tamano del adaptador | ~744 MB en bf16 |

## Requisitos de hardware

- El adaptador en si ocupa ~744 MB en bf16, por lo que su coste de VRAM adicional es reducido; el requisito dominante es el modelo base MiniMax-H3.
- Con el conmutador `low_vram` activado, la LoRA se fusiona en los pesos para minimizar el pico de VRAM (a costa de una ligera perdida de nitidez en bases cuantizadas).
- No se especifican en la informacion disponible valores concretos de VRAM necesarios, GPU recomendadas (A100, H100, RTX 4090, etc.), ni si cabe en GPUs de consumo.
- Opciones de despliegue documentadas: ComfyUI (recomendado) mediante los nodos Larryvrh/ComfyUI-MiniMax-H3-Turbo, o ejecucion autonoma con `generate.py` (requiere un checkout de ComfyUI para las definiciones de H3, VAE y text encoder).
- No se publican datos de latencia ni throughput concretos; se indica unicamente una mejora de velocidad de muestreo de ~5x al pasar de ~20 a 4 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Turbo-Lora (Kokosowek) | LoRA sobre MiniMax-H3 | 4-8 | Apache 2.0 | HuggingFace (0 descargas) | Checkpoint recomendado `v4_step600_ema` |
| MiniMax-H3-Turbo-Lora (larryvrh) | LoRA sobre MiniMax-H3 | no disponible | no disponible | HuggingFace | Repositorio relacionado y autor de los nodos de ComfyUI; posible origen del adaptador |
| minimax_h3_fl2v_turbo_8step_v1.0_768p (civitai) | LoRA turbo sobre MiniMax-H3 | 8 | no disponible | Civitai | Turbo alternativo de la comunidad, orientado a 8 pasos |
| MiniMax-H3 base (Comfy-Org) | Modelo completo | ~20 | no disponible | HuggingFace | Sin aceleracion few-step; referencia de comparacion |

La informacion disponible no permite comparar parametros, contexto ni resultados de calidad de forma cuantitativa entre estas alternativas, por lo que la comparativa se limita a tipo de artefacto, numero de pasos, licencia y disponibilidad.

## Limitaciones y advertencias

- Adaptador en fase de vista previa: el propio autor indica que el entrenamiento continua y que quedan dos areas en mejora activa (audio y comportamiento bajo movimiento rapido e intenso).
- Artefacto de motion-smear / trailing ghosting en el checkpoint `v4` cuando se combinan 4 pasos con movimiento grande y rapido; para ese caso concreto se sugiere el checkpoint `v1` (~850).
- La linea `v1` presenta sobresaturacion y aspecto "plastico" en general, y tiende a la sobrenitidez con valores altos de pasos y strength 1.0.
- Por encima de 8 pasos no hay mejora y pueden aparecer artefactos de sobrenitidez.
- El ajuste de strength afecta a artefactos concretos: el ghosting/smear difuso se corrige subiendo (~1.05-1.2) y el grano sobrenitido bajando (~0.8-0.95), lo que requiere ajuste manual por clip.
- El sampler personalizado depende de la version de ComfyUI y de los nodos Larryvrh/ComfyUI-MiniMax-H3-Turbo, que evolucionan junto a los pesos; se recomienda mantenerlos actualizados.
- La ejecucion autonoma sin ComfyUI sigue requiriendo un checkout de ComfyUI para las definiciones de modelo, VAE y text encoder.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni riesgo de alucinacion especifico para este adaptador.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base MiniMax-H3, cuya licencia no se detalla en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Kokosowek/MiniMax-H3-Turbo-Lora
- Modelo base en HuggingFace: https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio relacionado (larryvrh): https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Nodos de ComfyUI: https://github.com/Larryvrh/ComfyUI-MiniMax-H3-Turbo
- Workflows de ejemplo: https://github.com/Larryvrh/ComfyUI-MiniMax-H3-Turbo/tree/main/example_workflows
- Tutorial de MiniMax-H3 en ComfyUI: https://docs.comfy.org/tutorials/video/minimax/minimax-h3
- Guia sobre LoRA de MiniMax-H3: https://loraai.me/guides/minimax-h3-lora
- Directorio de LoRA de MiniMax-H3: https://minimax3.org/minimax-h3-lora
- Workflows t2v/i2v con Turbo LoRA en Civitai: https://civitai.red/models/2850104/minimax-h3-t2v-i2v-workflows-turbo-lora-auto-prompting-and-video-preview
- Repositorio de ComfyUI: https://github.com/comfyanonymous/ComfyUI
