# S3ckn11g0r/CROWN-H3-Niji-Semireal-Aesthetic

## Resumen

CROWN H3 Niji Semireal Aesthetic es un LoRA (Low-Rank Adaptation) de estilo entrenado por el creador independiente NineCrowns (identificado como S3ckn11g0r en Hugging Face) para el modelo de generacion de video MiniMax H3. No se trata de un modelo base autonomo, sino de un adaptador de bajo rango que modifica el comportamiento estetico del modelo subyacente para producir retratos y primeros planos con una apariencia semirrealista de tipo Niji, con enfasis en la estructura osea facial, la piel de porcelana con dispersion subsuperficial (SSS) y la iluminacion de estudio cinematografica.

El adaptador tiene rango 16 y alpha 16, se distribuye en un unico archivo safetensors de 142,26 MB y esta entrenado exclusivamente sobre la capa de video del modelo H3, aislando el audio para no interferir con la generacion nativa de audio estereo. Segun el autor, el entrenamiento se realizo sobre 312 imagenes de alta resolucion en formato retrato y primer plano, con las palabras de activacion eliminadas de las descripciones, de modo que el estilo queda integrado en los pesos por defecto y se activa al cargar el LoRA sin necesidad de prompt especifico.

Su relevancia es acotada pero concreta: para quien ya utilice MiniMax H3 en flujos de ComfyUI y necesite un acabado estetico consistente de retrato semirrealista sin reentrenar el modelo base, este LoRA ofrece un ajuste ligero (142 MB) que se apila con otros adaptadores y se documenta con parametros de muestreo de produccion verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre MiniMax H3; rango 16, alpha 16 |
| Parametros totales | no disponible (adaptador de 142,26 MB; el modelo base es de 37,5 GB en BF16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base MiniMax H3) |
| Tipos de cuantizacion | no disponible (se distribuye en BF16 safetensors; el base usa BF16/FP32 en sus componentes) |
| Idiomas soportados | no disponible |
| Licencia | bespoke-lora-license (licencia personalizada; enlace a Civitai del autor) |
| Formato de pesos | safetensors (`CROWN_H3_Niji_Semireal_Aesthetic_V2_r16.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 16 aplicado sobre el modelo de video MiniMax H3, en sus variantes Ref2VA, I2VA y T2VA. El entrenamiento se realizo con aislamiento de la capa de video (`video_only: True`) y con imagenes fijas silenciosas como entrada de audio, de forma que el adaptador no altera la generacion nativa de audio estereo ni el sincronizacion labial del modelo base. El conjunto de datos consta de 312 imagenes de alta resolucion en resoluciones 1280x1280, 1024x1792 y 1792x1024, centradas en retratos y primeros planos con estetica Niji semirrealista.

La innovacion tecnica declarada es el uso de "triggerless captioning": las palabras de activacion se eliminaron de las descripciones durante el entrenamiento, de modo que los rasgos objetivo (estructura osea facial tridimensional de tipo CGI, microtextura de piel tipo vidrio o porcelana, rubor sutil en el parpado inferior y iluminacion de contorno de estudio) quedan incorporados en los pesos por defecto y se activan al cargar el LoRA sin necesidad de prompt especifico. La model card documenta una configuracion de produccion con 20-24 pasos, muestreador euler, `ManualSigmas` y `MiniMaxH3SigmaShift` con `shift_video: 12.0` y `shift_audio: 3.0`, junto con un apilado de tres LoRA (el propio a peso 1.00-1.10, un refinador 2K a 0.35 y un acelerador de pasos a 0.45).

## Capacidades

- Modificacion de estilo estetico en generacion de video texto-a-video, imagen-a-video y referencia-a-video sobre MiniMax H3.
- Especializacion en retratos y primeros planos con acabado semirrealista Niji.
- Mejora de la microtextura de piel (efecto porcelana, dispersion subsuperficial) y de la estructura osea facial.
- Iluminacion cinematografica de estudio con contorno suave.
- Preservacion del audio nativo del modelo base: no interfiere con la generacion estereo ni con el sincronizacion labial.
- Activacion sin palabra de disparo: el estilo se aplica al cargar el adaptador.
- Compatibilidad con apilado de LoRA adicionales (refinadores de detalle, aceleradores de pasos).
- Integracion en flujos de ComfyUI mediante la libreria minimax-h3.
- No se documentan capacidades de tool calling, razonamiento multi-paso, matematicas ni codigo, por tratarse de un adaptador de estilo visual.

## Casos de uso

- Produccion de retratos cinematograficos para videoclips o piezas cortas: el LoRA aplica de forma consistente la estetica Niji semirrealista y la iluminacion de estudio, lo que reduce la variabilidad entre planos de un mismo proyecto sin necesidad de reescribir prompts.
- Generacion de avatares animados para redes sociales: partiendo de una imagen fija (I2VA) se obtienen primeros planos con piel de porcelana y rasgos faciales definidos, adecuados para contenido vertical en 1024x1792.
- Previsualizacion de personajes en preproduccion audiovisual: el adaptador permite iterar rapidamente sobre el aspecto de un personaje con 20-24 pasos de muestreo, integrado en ComfyUI junto al resto de la cadena de MiniMax H3.
- Creacion de material promocional con identidad visual uniforme: al no requerir palabra de disparo, cualquier prompt hereda el estilo, lo que simplifica la produccion de series de clips con coherencia estetica.
- Refinado de detalle en planos cerrados: combinado con el refinador 2K documentado a peso 0.35, permite obtener microtextura de porcelana y poros en primeros planos sin cambiar de modelo base.
- Flujos de generacion acelerada: apilado con el LoRA acelerador de pasos a peso 0.45, reduce el coste de inferencia manteniendo el acabado estetico en produccion a granel.
- Experimentacion artistica en entornos cloud: el autor publica una demo en RunningHub, lo que permite probar el adaptador sin disponer de hardware local para el modelo base de 37,5 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en si ocupa 142,26 MB, pero requiere el modelo base MiniMax H3 completo para funcionar.
- Modelo base documentado: `minimax_h3_ref2va_bf16.safetensors` (37,5 GB en BF16), mas `qwen3vl_32b_minimax_h3_bf16.safetensors` (codificador de texto de 32B), `minimax_h3_video_vae_fp32.safetensors` y `minimax_h3_audio_vae_fp32.safetensors`.
- VRAM estimada: no disponible de forma explicita; por el tamano del base en BF16 (37,5 GB) y el codificador de texto de 32B, la inferencia completa no cabe en GPUs de consumo de 24 GB sin cuantizacion o descarga parcial a CPU.
- GPU recomendadas: no disponible en la informacion proporcionada; por el volumen de pesos, se requiere hardware de clase profesional (A100/H100 de 80 GB o configuraciones multi-GPU) para ejecucion comoda en BF16.
- Cabe en GPU de consumo: no con el stack completo en BF16; el adaptador por si solo no es ejecutable sin el base.
- Opciones de despliegue: ComfyUI con la libreria minimax-h3; el autor menciona tambien ejecucion en la nube mediante RunningHub.
- Latencia y throughput: no disponibles; la model card solo indica 20-24 pasos de muestreo con euler y `ManualSigmas`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CROWN H3 Niji Semireal Aesthetic | LoRA de estilo sobre MiniMax H3 | Adaptador de 142,26 MB (base de 37,5 GB) | no disponible | bespoke-lora-license | Hugging Face, Civitai, RunningHub |
| LoRA 2K Detail Refiner para MiniMax H3 | LoRA de refinado de detalle | no disponible | no disponible | no disponible | Citado en la model card |
| LoRA Step Acceleration (dmad) para MiniMax H3 | LoRA de aceleracion de pasos | no disponible | no disponible | no disponible | Citado en la model card |

No se dispone de datos de rendimiento comparativo entre estos adaptadores ni con alternativas de otros ecosistemas; la comparativa se limita a tipo de artefacto y disponibilidad.

## Limitaciones y advertencias

- Es un adaptador de estilo, no un modelo autonomo: no puede ejecutarse sin el modelo base MiniMax H3 y sus componentes (VAE de video y audio, codificador Qwen3-VL de 32B).
- La licencia es "bespoke-lora-license", personalizada y enlazada al perfil de Civitai del autor; no se detallan en la informacion disponible los terminos exactos de uso comercial, por lo que deben verificarse antes de cualquier despliegue en produccion.
- El entrenamiento se realizo sobre un conjunto de 312 imagenes de retratos y primeros planos; es previsible un sesgo hacia ese tipo de encuadre y estetica, con menor control fuera de ese dominio (paisajes, escenas de accion, grupos).
- No se documentan idiomas soportados ni evaluacion multilingue.
- No hay datos publicados de benchmarks, evaluacion de sesgos ni tasas de alucinacion visual.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- El apilado con otros LoRA (refinador 2K, acelerador de pasos) se documenta con pesos concretos, pero no se garantiza su comportamiento fuera de esa combinacion exacta.
- Al tratarse de un adaptador de video con aislamiento de audio, no debe esperarse ningun efecto sobre la generacion de audio ni sobre el sincronizacion labial; su ambito es exclusivamente visual.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-Niji-Semireal-Aesthetic
- Civitai del autor: https://civitai.com/models/3042857
- Perfil de Civitai: https://civitai.com/user/NineCrowns
- Demo en RunningHub: https://www.runninghub.ai/model/public/2120439540841451522
