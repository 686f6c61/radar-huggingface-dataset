# S3ckn11g0r/CROWN-H3-VFX-Combat-Boost

## Resumen

CROWN-H3-VFX-Combat-Boost es un LoRA (adaptador de bajo rango) entrenado por el creador conocido como NineCrowns (S3ckn11g0r en Hugging Face) sobre el modelo base MiniMaxAI/MiniMax-H3, un modelo de generacion de video texto-a-video. El adaptador esta disenado especificamente para intensificar efectos visuales (VFX) y coreografias de combate cuerpo a cuerpo y con armas a alta velocidad en los videos generados por MiniMax H3, en sus variantes Ref2VA, I2VA y T2VA.

El LoRA emplea un rango alto (Rank 64, Alpha 64) y se entrena exclusivamente sobre los bloques de video (Video-Only, bloques 10-49), lo que segun el autor permite reforzar el movimiento y los efectos sin alterar la identidad facial ni el vestuario de los personajes en flujos de multiples imagenes de referencia. El repositorio ocupa 1,2 GB y se distribuye bajo una licencia personalizada (bespoke-lora-license) vinculada al perfil del autor en Civitai.

Su relevancia radica en que aborda un caso de uso muy concreto dentro de la generacion de video: escenas de accion con estelas de fluidos y plasma, particulas de rayos, fotogramas de impacto estilo sakuga y detonaciones de gran escala. Es un adaptador de nicho orientado a creadores que trabajan con ComfyUI y el ecosistema de MiniMax H3, no un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de video MiniMax-H3; rango 64, alpha 64, aplicado a bloques 10-49 (Video-Only) |
| Parametros totales | no disponible (el adaptador ocupa 1,2 GB en el repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor cita pesos BF16 para el modelo base y FP32 para los VAE en sus pruebas |
| Idiomas soportados | no disponible |
| Licencia | bespoke-lora-license (licencia personalizada; enlace a civitai.com/user/NineCrowns) |
| Formato de pesos | safetensors (fichero citado: CROWN_H3_VFX_Combat_Boost_V2_r64.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 que se inyecta sobre el modelo de difusion de video MiniMax H3. Segun la model card, el entrenamiento se limita a los bloques de video (video_only: True), concretamente los bloques 10 a 49, de modo que la modificacion se concentra en la capa de dinamica y efectos visuales y no en las capas asociadas a la identidad o el vestuario. Esta separacion es la que el autor presenta como responsable de preservar la coherencia facial en flujos Ref2VA con multiples referencias.

No se especifican en la informacion disponible el numero de tokens o clips de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables habitualmente a LoRA de difusion). El autor documenta los ajustes de inferencia empleados en sus pruebas: 24-25 pasos, sampler euler, scheduler beta y MiniMaxH3SigmaShift con shift_video 12.0 y shift_audio 3.0, sobre el UNet minimax_h3_ref2va_bf16 (66 GB BF16) o su version podada (37,5 GB), con text encoder Qwen3-VL-32B y VAE de video y audio en FP32.

## Capacidades

- Generacion de video texto-a-video con enfasis en escenas de accion y combate.
- Refuerzo de coreografias de artes marciales y combate con armas a alta velocidad.
- Generacion de efectos visuales multicapa: estelas de fluidos y plasma, particulas de rayos, fotogramas de impacto estilo sakuga y detonaciones de gran escala.
- Preservacion de la identidad facial y del vestuario en flujos con multiples imagenes de referencia (Ref2VA), segun el autor.
- Compatibilidad con los modos Ref2VA, I2VA y T2VA del modelo base MiniMax H3.
- Integracion con ComfyUI y apilamiento con otros LoRA (el autor documenta stacks con pesos concretos).
- Soporte de audio sincronizado a traves del VAE de audio del modelo base (hasta 15 segundos segun la referencia del autor).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo de video).

## Casos de uso

- Produccion de escenas de accion para cortometrajes o trailers: el LoRA intensifica peleas cuerpo a cuerpo y con armas, generando trayectorias de golpes y estelas visibles que de otro modo requeririan postproduccion de VFX.
- Previsualizacion de secuencias de combate en animacion: util para generar animaticos con fotogramas de impacto estilo sakuga antes de la produccion final.
- Creacion de contenido para redes sociales con estetica de anime de accion: combinado con el slider de velocidad de movimiento del ecosistema H3, permite clips cortos de alta energia.
- Diseno de efectos de particulas y energia (rayos, plasma, fluidos) para pruebas de concepto visuales, aprovechando la capa Video-Only para no degradar el diseno de personaje.
- Flujos con personajes recurrentes: en modo Ref2VA con multiples referencias, el adaptador mantiene la cara y el vestuario mientras anade combate, lo que sirve para series con personaje fijo.
- Iteracion rapida en ComfyUI: el adaptador se apila con otros LoRA (combate, exposicion, velocidad) con pesos ajustables, lo que permite afinar la intensidad del efecto por escena.
- Generacion de clips con audio sincronizado de hasta 15 segundos para demos o prototipos, usando el VAE de audio del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente registros de pruebas cualitativas (tres videos de demostracion) con sus parametros exactos de muestreo y stacks de LoRA, sin metricas cuantitativas.

## Requisitos de hardware

- El adaptador en si ocupa 1,2 GB, pero requiere cargar el modelo base MiniMax H3: UNet completo en BF16 de 66 GB o version podada de 37,5 GB, mas text encoder Qwen3-VL-32B y VAE de video y audio en FP32.
- VRAM estimada: no disponible de forma oficial; por el tamano de los componentes citados, el UNet completo en BF16 (66 GB) no cabe en GPUs de consumo y exige aceleradores de datacenter (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- La version podada (37,5 GB) sigue superando la VRAM de una RTX 4090 (24 GB) en BF16; seria necesario cuantizar o usar offloading, aunque no se documentan cuantizaciones oficiales.
- No cabe en GPUs de consumo en la configuracion descrita por el autor.
- Opciones de despliegue: ComfyUI (flujo documentado por el autor), con workflows en la nube de RunningHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de video en este contexto).
- Latencia y throughput: no disponibles; el autor cita 24-25 pasos de muestreo con sampler euler.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros adaptadores LoRA comparables para MiniMax H3 (aparte de los citados en los stacks, como H3_Combat_V2 o Bunny_weapon_combatV1, de los que no se aportan especificaciones), ni de modelos de video alternativos con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones cuantitativas; las afirmaciones de mejora y de preservacion de identidad provienen del autor y de sus propios videos de demostracion.
- El adaptador esta entrenado para un nicho muy concreto (VFX y combate); su uso fuera de ese dominio puede degradar la calidad o introducir artefactos no evaluados.
- Depende de un modelo base de gran tamano (66 GB en BF16), lo que limita su uso a infraestructura de gama alta o a servicios en la nube.
- La licencia es personalizada (bespoke-lora-license) y remite al perfil de Civitai del autor; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que las condiciones de explotacion no se detallan en el repositorio.
- No se documentan sesgos, riesgos de alucinacion visual ni limitaciones de idioma; al ser un modelo de video, los riesgos se refieren a coherencia temporal, artefactos y fidelidad al prompt.
- La model card incluye enlaces promocionales a servicios de terceros y a un sitio externo (h3xron.xyz); deben tratarse con cautela y no como parte del modelo.
- El rendimiento depende fuertemente del stack de LoRA y de los pesos empleados; los resultados del autor no son reproducibles sin los mismos ficheros y ajustes de muestreo.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-VFX-Combat-Boost
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Civitai (pagina oficial del autor): https://civitai.com/models/3041075
- Perfil del autor en Civitai: https://civitai.com/user/NineCrowns
- RunningHub Global (modelo): https://www.runninghub.ai/model/public/2120441999441563649
- RunningHub Global (workflow ComfyUI): https://www.runninghub.ai/workflow/2120529813882970113
- RunningHub Global (webapp): https://www.runninghub.ai/ai-detail/2120529837906804738
- RunningHub CN (modelo): https://www.runninghub.cn/model/public/2119393519600230401
- RunningHub CN (workflow): https://www.runninghub.cn/workflow/2119379654992814081
- RunningHub CN (webapp): https://www.runninghub.cn/ai-detail/2119407566374658049
- Sitio externo citado por el autor: https://h3xron.xyz
