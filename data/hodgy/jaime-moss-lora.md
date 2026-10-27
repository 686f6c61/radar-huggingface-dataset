# hodgy/jaime-moss-lora

## Resumen

`hodgy/jaime-moss-lora` es un adaptador LoRA de personaje para el modelo de generación de imágenes text-to-image **MOSS-Image Base** (`OpenMOSS-Team/MOSS-Image-Base`). Lo publica el usuario `hodgy` en Hugging Face y su función es fijar la identidad visual de un personaje llamado *jaime* (palabra de activación `jaime`) para que aparezca de forma consistente en distintas escenas, poses, encuadres e iluminaciones. No es un modelo autónomo: requiere el checkpoint Base de MOSS-Image para funcionar, ya que solo aporta los pesos del adaptador en formato `safetensors` para `diffusers`.

El adaptador se entrenó con Ostris AI Toolkit sobre una única H100 en RunComfy, con rango 32 y alpha 32, precisión BF16 sin cuantización, y 1000 pasos sobre un dataset de 77 imágenes sintéticas etiquetadas con el patrón `jaime The image shows a young woman ...`. El repositorio ocupa 0,1 GB y contiene un único archivo, `jaime_000001000.safetensors`, correspondiente al checkpoint del paso 1000.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de un pipeline de entrenamiento de LoRA de personaje sobre MOSS-Image (incluida la exclusión de la capa `layers.22.` combinada con `uncond_skip_layers: [22]` en muestreo) y permite evaluar el comportamiento del modelo base ante adaptadores de bajo rango. Con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicados, debe considerarse un experimento sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32 / alpha 32) sobre el modelo de difusion MOSS-Image Base; arquitectura interna declarada como `moss_image:base` |
| Parametros totales | No disponible para el modelo base; el adaptador se distribuye en un repositorio de 0,1 GB con un unico `safetensors` (rank 32 sobre las capas no excluidas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; es un modelo de imagen. La longitud de prompt admisible la fija el text encoder de MOSS-Image y no esta documentada en la informacion disponible |
| Tipos de cuantizacion | Entrenado en BF16 sin cuantizacion; los pesos LoRA se distribuyen en `safetensors`. Cuantizaciones del modelo base: no disponibles |
| Idiomas soportados | No disponible (los prompts de ejemplo de la model card estan en ingles) |
| Licencia | `other` (no se detallan terminos en la informacion proporcionada; verificar la licencia del modelo base) |
| Formato de pesos | `safetensors` para `diffusers` (archivo `jaime_000001000.safetensors`) |
| Tipo de adaptador | LoRA de personaje (character LoRA), palabra de activacion `jaime` |
| Modelo base | `OpenMOSS-Team/MOSS-Image-Base` (se recomienda el checkpoint Base, no el SFT) |
| Escala de LoRA recomendada | 0,8 - 1,0 |
| Resolucion de inferencia | ~1 MP, p. ej. 1024 x 1024 |
| CFG / pasos recomendados | CFG 3,0; 50 pasos para imagen final, 30 para previsualizaciones |
| Dataset de entrenamiento | 77 imagenes sinteticas con caption (park, calle, close-up, plano amplio, aereo, contrapicado y variaciones de pose) |
| Pasos de entrenamiento | 1000 (checkpoint publicado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA inyectado en las capas de atencion del transformer de difusion de MOSS-Image Base, con rango 32 y alpha 32, capas excluidas `layers.22.` y text encoder congelado durante todo el entrenamiento. El entrenamiento usa el planificador FlowMatch con `shift`, optimizador AdamW8bit con LR 1e-4 y weight decay 1e-4, batch size 1 sin acumulacion de gradientes, dropout de caption de 0,05 y resoluciones en buckets de 512, 768 y 1024 px. La ejecucion se hizo en BF16 sin cuantizacion sobre una H100 en RunComfy con Ostris AI Toolkit, configuracion `moss_image:base`.

El dataset es pequeno y completamente sintetico: 77 imagenes con captions que empiezan por `jaime` y describen a una mujer joven en escenas de parque, calle y retrato, con variaciones de plano y pose. Esa composicion explica tanto la rapidez del ajuste (1000 pasos) como el riesgo de arrastre de vestuario, fondos y poses hacia las imagenes de entrenamiento. La particularidad tecnica mas relevante es la exclusion de la capa 22 del adaptador, que debe acompanarse de `uncond_skip_layers: [22]` en el muestreo para que el comportamiento sea coherente. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, propios de modelos de lenguaje y no aplicables aqui.

## Capacidades

- Generacion text-to-image de un personaje consistente (`jaime`) sobre MOSS-Image Base, con control de escena mediante prompt en lenguaje natural.
- Transferencia de estilo por prompt: la model card incluye un ejemplo de ilustracion en acuarela con el mismo personaje, lo que indica que el LoRA no bloquea cambios de estilo si se describen explicitamente.
- Cobertura de multiples encuadres y distancias: retrato cerrado, plano amplio, aereo, contrapicado y variaciones de pose, segun la composicion del dataset.
- Composicion de escenas con iluminacion y entorno variables (luz natural de ventana, calle nocturna con neones, interiores calidos).
- Compatibilidad con el ecosistema `diffusers` y con el checkpoint Base de MOSS-Image (no con el SFT, segun recomendacion del autor).
- Soporte de tool calling / function calling: no aplica (modelo de imagen, no de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no documentadas.
- Capacidades especiales: ninguna declarada (sin modo *thinking*, sin vision de entrada, sin audio).

## Casos de uso

- **Previsualizacion de personaje para narrativa visual**: generar el mismo personaje en parque, calle y retrato cerrado para construir un *storyboard* o una novela visual, usando la palabra `jaime` al inicio del prompt y escala 0,8 para no sobrescribir la descripcion de escena.
- **Assets para prototipos de videojuego o aplicacion**: producir retratos y planos de cuerpo entero de un personaje secundario a 1024 x 1024 en lotes con `diffusers`, antes de encargar el arte final.
- **Pruebas de direccion de arte**: comparar el mismo personaje bajo estilos distintos (por ejemplo, acuarela con pinceladas sueltas y colores pastel frente a fotografia nocturna con neones) para decidir la linea grafica de una campana.
- **Exploracion de vestuario y attrezzo**: fijar la identidad del personaje y variar chaqueta de cuero, jersey de punto o vestuario de calle para evaluar combinaciones sin reentrenar el adaptador.
- **Generacion de datasets sinteticos etiquetados**: crear imagenes coherentes de un personaje con captions controlados para tareas auxiliares de etiquetado, deteccion o *captioning*, asumiendo que el dataset original tambien es sintetico y puede introducir sesgos repetidos.
- **Evaluacion tecnica de LoRAs sobre MOSS-Image**: usar el repositorio como referencia reproducible (rank 32, 1000 pasos, BF16, H100) para medir como responde el modelo base a adaptadores de bajo rango antes de invertir en un entrenamiento mayor.
- **Pruebas de integracion en pipelines de imagen**: validar el flujo `diffusers` + `safetensors` + `uncond_skip_layers` en un servicio interno de generacion por lotes, con CFG 3,0 y 50 pasos como configuracion de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, similitud de identidad ni ninguna otra metrica cuantitativa, y tampoco se aportan comparaciones con otros adaptadores. El unico dato de rendimiento objetivo es el coste de entrenamiento declarado: 1000 pasos en una H100 con Ostris AI Toolkit.

## Requisitos de hardware

- **VRAM**: el adaptador en si es despreciable (repositorio de 0,1 GB, rank 32); el consumo lo determina el modelo base MOSS-Image en BF16 a ~1 MP. No hay cifras oficiales en la informacion disponible; como orientacion, una difusion de imagen a 1024 x 1024 en BF16 suele requerir del orden de 16-24 GB de VRAM, cantidad que debe confirmarse con la documentacion de MOSS-Image.
- **GPU recomendadas**: H100 (la usada en el entrenamiento) o A100 para lotes y maxima resolucion; RTX 4090 (24 GB) como opcion de gama alta para consumidor, presumiblemente suficiente a 1024 x 1024 en BF16.
- **Consumer GPU**: viable en GPUs de 24 GB; en tarjetas de 8-12 GB habria que reducir resolucion (512-768 px) o recurrir a cuantizacion del modelo base, extremo no documentado para este LoRA.
- **Despliegue**: `diffusers` es la via soportada de forma explicita; ComfyUI u otros frontends solo si ya soportan MOSS-Image. `llama.cpp`, Ollama y TGI no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. La configuracion de referencia es de 50 pasos con CFG 3,0 a 1024 x 1024, lo que implica un coste de inferencia proporcional al numero de pasos y al modelo base; no se publican tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Configuracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hodgy/jaime-moss-lora` | LoRA de personaje | MOSS-Image Base | Rank 32 / alpha 32, 1000 pasos, 77 imagenes sinteticas | `other` | Hugging Face, 0 descargas, 0 likes |
| `Moss Image - Better Nude v2.0` (Civitai) | LoRA sobre MOSS-Image | MOSS-Image Base (tambien usable con SFT) | Escala 1,0; 25-50 pasos; CFG 3-4; 1024 x 1536 | No disponible | Civitai; dataset declarado solo de mujeres asiaticas |
| LoRAs de personaje para Flux / SDXL | LoRA de personaje | Flux.1 o SDXL | Rangos y pasos variables | Variables (a menudo permisivas) | Amplia disponibilidad en Civitai y agregadores |

La comparacion cuantitativa no es posible: ninguno de los adaptadores de la tabla publica metricas de identidad, FID o consistencia, y MOSS-Image carece de cifras de referencia en la informacion disponible. La diferencia practica mas clara frente al ecosistema Flux/SDXL es la madurez del tooling: MOSS-Image tiene mucho menos soporte en ComfyUI y en la comunidad, lo que limita la reproducibilidad de los flujos de trabajo.

## Limitaciones y advertencias

- **Sobreajuste por dataset minimo**: 77 imagenes sinteticas es un volumen muy bajo; el propio autor advierte que el LoRA puede arrastrar vestuario, fondos y poses del entrenamiento, especialmente a escala 1,0.
- **Interferencia con el prompt**: a escala alta el adaptador puede sobrescribir la descripcion de escena; se recomienda bajar la escala o mantenerla en 0,8.
- **Dependencia de una capa excluida**: el entrenamiento excluye `layers.22.`, por lo que el muestreo debe usar `uncond_skip_layers: [22]`; omitirlo puede degradar el resultado.
- **Modelo base obligatorio**: no funciona de forma autonoma y el autor recomienda el checkpoint Base, no el SFT; los resultados con otras variantes no estan documentados.
- **Licencia ambigua**: la licencia es `other` y no se detallan terminos; antes de un uso comercial hay que revisar la licencia del LoRA y la del modelo MOSS-Image, que puede imponer restricciones adicionales.
- **Sesgos del dataset**: todas las captions describen a una mujer joven en escenas urbanas y naturales genericas; es previsible un sesgo de edad, genero y contexto, y no hay evaluación de diversidad.
- **Riesgo de alucinacion visual**: como cualquier modelo de difusion, puede generar anatomia incorrecta, texto ilegible en carteles y objetos incoherentes; no hay metricas publicadas al respecto.
- **Sin validacion externa**: 0 descargas y 0 likes, sin benchmarks ni demos independientes; el estado del repositorio es experimental.
- **Idiomas y prompt**: no se documenta soporte multilingue; los ejemplos estan en ingles y el text encoder esta congelado, por lo que la respuesta a otros idiomas es incierta.
- **Produccion**: no hay garantias de soporte, mantenimiento ni SLA, y la integracion depende de que el ecosistema (`diffusers`, ComfyUI) soporte MOSS-Image.

## Enlaces

- Repositorio del LoRA: https://huggingface.co/hodgy/jaime-moss-lora
- Modelo base MOSS-Image Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Ostris AI Toolkit (entrenador): https://github.com/ostris/ai-toolkit
- RunComfy (plataforma de entrenamiento citada): https://www.runcomfy.com
- Guia de usuario de MOSS-Image: citada en la model card, sin URL en la informacion disponible
- Referencia comparativa en Civitai (otro LoRA sobre MOSS-Image, `Moss Image - Better Nude v2.0`): https://civitai.red/models/3008073/moss-image-better-nude (contenido para adultos)
