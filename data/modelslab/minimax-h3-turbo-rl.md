# ModelsLab/MiniMax-H3-Turbo-RL

## Resumen

MiniMax-H3-Turbo-RL es un adaptador LoRA para el modelo de generación de vídeo y audio MiniMax-H3 de MiniMaxAI, publicado por ModelsLab. No es un modelo base autónomo: se carga sobre el transformer de MiniMax-H3 en su variante Ref2VA y combina dos componentes en un único fichero safetensors de 1,40 GB en BF16. El primero es el Turbo LoRA V4 de larryvrh, un adaptador de destilación que reduce la generación a 8 pasos. El segundo es rl_s3, un LoRA de rango 64 entrenado por ModelsLab mediante Flow-DPO online en bucle cerrado sobre Turbo V4.

La relevancia del artefacto está en su estrategia de empaquetado y en la metodología de alineación. Los dos adaptadores se almacenan como ramas exactas yuxtapuestas (rango efectivo 128 en los módulos de atención y MLP) en lugar de fusionarse, porque una fusión en BF16 sobre los pesos base redondearía la mayor parte de los deltas pequeños. El entrenamiento de rl_s3 emplea rollouts best-of-N puntuados por críticos de vídeo y audio en RAM, emparejados contra V4 congelado sobre la misma semilla y con un anclaje KL de alta frecuencia a V4 para evitar deriva.

El modelo card es explícito sobre la atribución de mejoras: en el conjunto público de evaluación, casi toda la ganancia frente a Turbo V4 procede del muestreador E4a, mientras que rl_s3 iguala a V4 + E4a dentro del ruido estadístico en las métricas reportadas. Es, por tanto, un artefacto de investigación reproducible más que una mejora sustancial demostrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer DiT de MiniMax-H3 (variante Ref2VA, `transformer_ref`) |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base no se distribuye en este repo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos del adaptador en BF16; el modelo base admite MXFP8 en el motor de producción de ModelsLab (referencia BF16 para evaluación) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (heredada de MiniMax-H3); Turbo V4 original bajo Apache-2.0 |
| Formato de pesos | safetensors (1,40 GB, 518 tensores BF16) |

## Arquitectura y entrenamiento

El fichero contiene 208 módulos de atención y MLP a rango 128: 200 módulos de bloques DiT que suman las ramas de V4 y de rl_s3, y 8 módulos del token-refiner que solo llevan V4 con relleno de ceros. A ello se añaden 51 módulos AdaLN a rango 16 exclusivos de V4. La descomposición por módulo es ΔW = [B_v4 | B_rl] · [A_v4 ; A_rl], de modo que las claves siguen el formato de ComfyUI y ai-toolkit (`blocks.N.attn.qkv_proj.lora_A.weight`, etc.) y son compatibles con cualquier cargador que acepte el fichero de Turbo V4.

rl_s3 se entrenó con Flow-DPO online en bucle cerrado y ODE puro: rollouts best-of-N puntuados por críticos de vídeo y audio en RAM, emparejados contra V4 congelado sobre la misma semilla y con un bloqueo KL de alta frecuencia hacia V4. Los datos de las etapas rl_s0 a rl_s3 son clips cortos (solo sus latentes cacheados y los prompts redactados para ellos) procedentes de DVIDS (dominio público), Wikimedia Commons, Netflix Open Content (CC BY 4.0), UltraVideo (licencia con restricción no comercial), Replay (CC BY-NC 4.0) y medios de prueba Xiph (SVT y Netflix, con restricciones). No se redistribuye ningún medio de esos conjuntos ni se usaron datos de clientes.

El muestreador recomendado es E4a: la rejilla desplazada de 9 puntos de Turbo V4 (u = 1, 0.875, …, 0.125, 0; shift 12 en vídeo y 3 en audio) más un nodo extra en u = 0.04 (σ_video = 0.333) y un corrector de Heun de segundo orden en [σ 0.632 → 0.333]. Son 10 puntos sigma y 10 pasadas por el transformer. La implementación de referencia es `heun_tail.py` del repositorio del servidor H3 de ModelsLab; el schedule Euler plano de 8 pasadas también funciona.

## Capacidades

- Generación de vídeo a partir de texto con audio sincronizado (pipeline text-to-video / text-to-audio-video).
- Generación condicionada por referencias (Ref2VA): acepta imágenes de referencia junto al prompt.
- Inferencia rápida por destilación: 8 pasadas con Euler o 10 con E4a, frente a los schedules largos del modelo base.
- Diálogo con habla generada en escena (el conjunto de evaluación incluye clips con voz; se reporta una tasa de habla inventada de 1/7).
- Control de detalle, flujo óptico y movimiento medibles mediante métricas propias del autor.
- Compatibilidad con cargadores PEFT, Sol-H3 y ComfyUI/ai-toolkit.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente: es un modelo generativo de medios, no un LLM.

## Casos de uso

- Prototipado rápido de vídeo publicitario: con 8-10 pasadas por clip y resolución 1344×768, permite iterar sobre variantes de prompt y referencias en minutos, adecuado para equipos que necesitan explorar direcciones creativas antes de un render final de mayor calidad.
- Generación de clips cortos con audio para redes sociales: el pipeline text-to-audio-video produce vídeo y sonido en una sola pasada, lo que simplifica la cadena de postproducción en formatos de 5 a 10 segundos.
- Previsualización de escenas con referencias visuales: la variante Ref2VA permite fijar la apariencia de sujetos u objetos mediante imágenes de referencia, útil en storyboards y animáticas.
- Investigación en alineación de modelos generativos: el artefacto documenta con detalle la metodología Flow-DPO, los críticos empleados y las métricas, lo que lo convierte en una base reproducible para estudiar RL sobre difusión.
- Evaluación comparativa de muestreadores: al mantener las ramas V4 y RL separadas, permite aislar el efecto del sampler (Euler frente a E4a) del efecto del ajuste RL sobre el mismo fichero.
- Integración en motores de producción propios: las claves compatibles con ComfyUI y ai-toolkit permiten cargarlo en pipelines existentes de MiniMax-H3 sin reentrenar, siempre que se respete la licencia comunitaria.
- Docencia y demostraciones técnicas: los ejemplos antes/después con semilla fija facilitan explicar el impacto de la destilación y del muestreo en la calidad final.

## Benchmarks y rendimiento

Evaluación sobre 16 clips públicos, semilla 11, métricas como ratios respecto al clip real:

| Variante | Pasadas | Detalle | Flujo | Movimiento | Habla inventada |
|---|---|---|---|---|---|
| Turbo V4, Euler | 8 | 1,43 | 0,87 | 0,94 | 1/7 |
| Turbo V4, E4a | 10 | 1,59 | 0,92 | 1,02 | 1/7 |
| Turbo V4 + rl_s3, E4a | 10 | 1,59 | 0,92 | 1,01 | 1/7 |

El autor indica que rl_s3 iguala a V4 + E4a dentro del ruido en estas métricas, y que se acerca más al clip real que V4 + E4a en el "Lab b" para 11 de 16 clips y en saturación para 8 de 16. Las mediciones se hicieron con pipeline de referencia BF16, no con el motor MXFP8 de producción.

## Requisitos de hardware

- El adaptador ocupa 1,40 GB en BF16, pero requiere cargar el modelo base MiniMax-H3 completo; la VRAM total depende del modelo base y de su cuantización, dato no disponible en la información proporcionada.
- GPU recomendadas: no disponible de forma explícita; el autor menciona un motor de producción MXFP8 y una referencia BF16, lo que sugiere GPUs de datacenter (A100/H100) para el pipeline de referencia.
- Viabilidad en GPU consumer: no disponible.
- Opciones de despliegue: cargadores compatibles con Turbo V4 (PEFT, Sol-H3, ComfyUI, ai-toolkit) y el motor H3 de ModelsLab con `heun_tail.py`.
- Latencia y throughput: no disponibles; se conocen las pasadas por clip (8 con Euler, 10 con E4a) pero no los tiempos por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Turbo-RL (este) | LoRA sobre MiniMax-H3 Ref2VA | 8-10 | Comunitaria MiniMax-H3 | Hugging Face, 1,40 GB |
| MiniMax-H3-Turbo-Lora (larryvrh) | LoRA de destilación | 8 | Apache-2.0 | Hugging Face |
| MiniMax-H3 (base) | Modelo completo text-to-audio-video | Schedule largo | Comunitaria MiniMax-H3 | Hugging Face |

No se dispone de datos de benchmarks de MiniMax-H3 base ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La mejora atribuible a rl_s3 es marginal según el propio autor; la mayor parte de la ganancia frente a la configuración anterior proviene del muestreador E4a.
- Se reporta generación de habla inventada en 1 de cada 7 clips evaluados, lo que exige revisión manual en usos con diálogo.
- La licencia comunitaria de MiniMax-H3 puede restringir el uso comercial; debe revisarse antes de producción.
- Los datos de entrenamiento incluyen conjuntos con restricciones no comerciales (UltraVideo, Replay CC BY-NC 4.0, Xiph Netflix CC BY-NC-ND 4.0), lo que puede condicionar la redistribución y el uso comercial del adaptador.
- No se han publicado datos sobre sesgos, idiomas soportados ni robustez multilingüe.
- El adaptador no debe fusionarse en los pesos base en BF16: hacerlo redondearía los deltas pequeños y degradaría el resultado.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validación por parte de la comunidad.
- Las métricas de evaluación son propias del autor y no están contrastadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ModelsLab/MiniMax-H3-Turbo-RL
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Turbo LoRA V4 de larryvrh: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Licencia comunitaria MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Dataset UltraVideo: https://huggingface.co/datasets/APRIL-AIGC/UltraVideo
- Dataset Replay: https://github.com/facebookresearch/replay_dataset
- DVIDS: https://www.dvidshub.net
- Wikimedia Commons: https://commons.wikimedia.org
- Netflix Open Content: https://opencontent.netflix.com
- Medios de prueba Xiph: https://media.xiph.org
