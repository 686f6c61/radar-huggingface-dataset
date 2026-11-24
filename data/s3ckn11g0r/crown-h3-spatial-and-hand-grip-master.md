# S3ckn11g0r/CROWN-H3-Spatial-And-Hand-Grip-Master

## Resumen

CROWN-H3-Spatial-And-Hand-Grip-Master es un LoRA (Low-Rank Adaptation) para el modelo de generación de vídeo MiniMax H3, desarrollado por el creador independiente NineCrowns bajo el alias S3ckn11g0r. No se trata de un modelo fundacional, sino de un adaptador de bajo rango que se aplica sobre los pesos del modelo base MiniMax H3 en sus variantes Ref2VA, I2VA y T2VA para corregir dos problemas estructurales concretos de la generación de vídeo: la colocación anatómicamente correcta de la mano sobre la empuñadura de un arma y la coherencia de identidad en escenas con dos personajes que se cruzan en el espacio.

El adaptador se entrenó sobre metraje real de artes marciales y esgrima, con un rango 64 y alpha 64, aplicado exclusivamente a los bloques de vídeo 10 a 49 del transformer, e incorpora un adaptador de des-destilación de Ostris. El resultado es un LoRA de 910 MB que se activa mediante tres palabras disparadoras y que se usa típicamente con un peso entre 0,65 y 0,75 en ComfyUI.

Su relevancia es acotada pero práctica: resuelve fallos recurrentes (dedos que agarran la hoja en lugar del mango, empuñaduras flotantes, espadas que se curvan, intercambio de caras cuando dos personajes se cruzan) en un nicho muy específico como es la generación de vídeo de escenas de combate con armas blancas. No es un modelo de propósito general ni sustituye al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión de vídeo MiniMax H3 (bloques de vídeo 10-49, rank 64 / alpha 64) |
| Parametros totales | no disponible (adaptador LoRA de 910,06 MB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; la cuantización aplica al modelo base) |
| Idiomas soportados | no disponible (las palabras disparadoras son en inglés; el modelo base determina el soporte idiomático de los prompts) |
| Licencia | bespoke-lora-license (licencia personalizada del autor, enlazada a su perfil de Civitai) |
| Formato de pesos | safetensors (`CROWN_H3_Spatial_And_Hand_Grip_Master_V1_r64.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se entrena sobre MiniMax H3, un modelo de generación de vídeo texto-a-vídeo y referencia-a-vídeo. El adaptador aplica un rango 64 con alpha 64 únicamente sobre los bloques de vídeo 10 a 49 del transformer, dejando intactos el resto de bloques y, presumiblemente, los módulos de audio y de codificación de referencia. El entrenamiento se realizó en un clúster de 8 GPU NVIDIA B200 e incorpora el adaptador de des-destilación de Ostris, una técnica que busca recuperar capacidad expresiva tras procesos de destilación del modelo base.

El conjunto de datos está compuesto, según el autor, al 100 % por metraje real de artes marciales, combate con armas y bloqueos dramáticos. No se especifican el número de clips, la resolución, la duración total ni la composición exacta del dataset. El objetivo del entrenamiento es doble: por un lado, forzar un agarre de cinco dedos por debajo de la guarda con una hoja rígida y recta durante estocadas, cortes y paradas; por otro, permitir que dos personajes se crucen en primer y segundo plano con intercambio de posición izquierda-derecha sin que se produzca intercambio de rostros ni de vestuario.

La configuración de inferencia documentada por el autor es de 25 pasos, sampler euler con beta, cfg 1.0 y MiniMaxH3SigmaShift con shift_video 12.0 y shift_audio 3.0, sobre el modelo base `minimax_h3_ref2va_bf16.safetensors` junto con el codificador de texto `qwen3vl_32b_minimax_h3_bf16.safetensors` y el VAE de vídeo `minimax_h3_video_vae_fp32.safetensors`.

## Capacidades

- Generación de vídeo de escenas de combate con armas blancas mediante palabras disparadoras (`crown_spatial_grip`, `crown_grip`, `crown_spatial`).
- Agarre de empuñadura con los cinco dedos por debajo de la guarda, evitando que el personaje sujete la hoja afilada.
- Mantenimiento de geometría rígida y recta de la hoja durante cortes lineales, estocadas y paradas hoja contra hoja.
- Cruce espacial de dos personajes en primer y segundo plano con intercambio de posición izquierda-derecha en modo Ref2VA.
- Preservación de la estructura facial y del vestuario de cada personaje durante el cruce, sin intercambio de caras ni mezcla de ropa.
- Compatibilidad con los modos Ref2VA, I2VA y T2VA de MiniMax H3, según declara el autor.
- Integración con ComfyUI y con flujos en la nube de RunningHub.
- No se documentan capacidades de tool calling, razonamiento multi-paso, audio nativo propio ni otras modalidades distintas del vídeo.

## Casos de uso

- Previsualización de secuencias de esgrima y artes marciales: el LoRA permite generar planos de combate con armas donde la empuñadura y la hoja se mantienen coherentes, útil para storyboards de cine o animación antes de rodar o animar la escena definitiva.
- Generación de tráilers o teasers de videojuegos de acción: escenas de dos personajes que se cruzan y desenvainan armas pueden producirse con identidades estables, reduciendo el número de tomas descartadas por intercambio de caras.
- Contenido para redes sociales de temática marcial: creadores que publican clips de combate coreografiado pueden usar el LoRA en ComfyUI para obtener planos cortos con agarre correcto del arma sin retoques manuales.
- Prototipado de cinemáticas para proyectos indie: estudios pequeños sin captura de movimiento pueden generar bloqueos y cruces de personajes con coherencia espacial para evaluar la puesta en escena.
- Ilustración de referencia para cómics y novela gráfica: el LoRA genera fotogramas de referencia con anatomía de la mano creíble sobre la empuñadura, que sirven como base para el dibujante.
- Demostraciones técnicas de control de identidad en vídeo generativo: investigadores pueden usar el adaptador como caso de estudio de preservación de identidad en oclusiones cruzadas dentro de un pipeline de MiniMax H3.
- Pruebas de integración en flujos ComfyUI en la nube: el autor publica workflows de RunningHub que permiten evaluar el LoRA sin disponer de hardware local capaz de mover el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas cuantitativas (FVD, CLIP score, precisión de keypoints de mano, tasa de intercambio de identidad) ni comparaciones numéricas con otros LoRA o con el modelo base sin adaptador.

## Requisitos de hardware

- El LoRA en sí ocupa 910,06 MB en safetensors y se carga junto al modelo base; no requiere VRAM adicional significativa más allá de la del propio adaptador.
- El requisito real lo marca MiniMax H3: el autor cita un codificador de texto Qwen3-VL de 32B en bf16 y un VAE de vídeo en fp32, lo que implica un consumo de VRAM elevado no cuantificado en la información disponible.
- GPU recomendadas: el entrenamiento se realizó en 8×NVIDIA B200; para inferencia no se especifican modelos concretos de GPU.
- No se confirma que el conjunto quepa en GPU de consumo (RTX 4090 u otras); el autor sugiere explícitamente que la versión original de H3 puede no ejecutarse en tarjetas domésticas y ofrece alternativas en la nube.
- Opciones de despliegue: ComfyUI (local o en la nube vía RunningHub) y los workflows publicados por el autor en RunningHub Global y RunningHub China.
- Latencia y throughput: no disponibles. La configuración de referencia usa 25 pasos con sampler euler y cfg 1.0.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CROWN-H3-Spatial-And-Hand-Grip-Master | LoRA de vídeo | MiniMax H3 | 910 MB (r64) | no disponible | bespoke-lora-license | Hugging Face, Civitai, RunningHub |
| LoRA genéricos de MiniMax H3 en Civitai | LoRA de vídeo | MiniMax H3 | no disponible | no disponible | variable según autor | Civitai |
| Modelos texto-a-vídeo fundacionales (p. ej. familia Wan, HunyuanVideo) | Modelo completo | propio | miles de millones | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativos entre este LoRA y otras alternativas; la comparación se limita a tipo de artefacto, modelo base y licencia.

## Limitaciones y advertencias

- Es un LoRA, no un modelo autónomo: requiere el modelo base MiniMax H3 (Ref2VA, I2VA o T2VA) y sus componentes auxiliares para funcionar.
- El entrenamiento se centró en escenas de combate con armas y cruces de dos personajes; fuera de ese dominio el adaptador puede degradar la calidad o introducir artefactos.
- El peso recomendado es estrecho (0,65-0,75); valores fuera de ese rango pueden romper el equilibrio entre el LoRA y el modelo base.
- La licencia es personalizada (`bespoke-lora-license`) y remite al perfil de Civitai del autor; no se detallan en la información disponible las condiciones exactas de uso comercial, por lo que debe consultarse el enlace de licencia antes de utilizarlo en producción.
- No se documentan sesgos demográficos, culturales ni de representación del dataset de entrenamiento.
- Riesgo de alucinación visual inherente a los modelos de difusión de vídeo: anatomía de manos, física de la hoja o identidades pueden fallar en composiciones alejadas de las condiciones de entrenamiento.
- No se especifican los idiomas soportados en los prompts; el comportamiento multilingüe dependerá del codificador de texto Qwen3-VL del modelo base.
- El autor promociona servicios de terceros y un sitio externo en la model card; conviene tratarlos como enlaces comerciales ajenos al artefacto.
- No hay métricas publicadas que cuantifiquen la mejora frente al modelo base sin LoRA.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-Spatial-And-Hand-Grip-Master
- Civitai (página oficial del modelo): https://civitai.com/models/3042756
- Civitai (perfil del autor y licencia): https://civitai.com/user/NineCrowns
- RunningHub Global (LoRA): https://www.runninghub.ai/model/public/2120439267540602881
- RunningHub Global (workflow ComfyUI): https://www.runninghub.ai/workflow/2120529855524020226
- RunningHub Global (webapp): https://www.runninghub.ai/ai-detail/2120529871293157377
- RunningHub China (LoRA): https://www.runninghub.cn/model/public/2120452083391488001
- RunningHub China (workflow): https://www.runninghub.cn/workflow/2120527387225059329
- RunningHub China (webapp): https://www.runninghub.cn/ai-detail/2120527407072505857
- Sitio externo promocionado por el autor: https://h3xron.xyz
