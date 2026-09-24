# rooty2020/Cosmos3-ours-DROID-v4

## Resumen

Cosmos3-ours-DROID-v4 es un checkpoint de politica robotica (video y acciones) publicado por el usuario rooty2020 en Hugging Face. Se trata de un post-entrenamiento de nvidia/Cosmos3-Nano, el modelo de mundo omnimodal de NVIDIA, especializado en el conjunto de datos DROID mediante el stack multivista Omni-4D. El modelo genera simultaneamente video y acciones de control, con un espacio de acciones de posiciones articulares crudas (joint_pos) en una ranura de 64 dimensiones con relleno de ceros y 32 dominios de encarnacion (embodiment).

La arquitectura combina un backbone Qwen3-VL-8B en configuracion MoT (mixture of transformers) con un experto de difusion, bajo el identificador cosmos3_omni y con codificacion posicional unificada unified_3d_mrope. El total de parametros asciende a 15.173.136.640 (15,17 B), incluyendo la torre ViT de Qwen3-VL. Los pesos se publican en bf16 con pesos EMA, ocupando el repositorio 31,5 GB.

Su relevancia es doble: por un lado, es un ejemplo de post-entrenamiento de un world model de NVIDIA sobre datos reales de robotica (DROID); por otro, documenta una innovacion concreta, la supervision de trazas de puntos 3D durante el entrenamiento del backbone. Esta supervision no se exporta en el checkpoint publicado (no incluye los pesos tracking_head.*), por lo que la inferencia devuelve video y acciones, no trayectorias de puntos 3D. El checkpoint corresponde a la iteracion 2500 de un calendario de 5000 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cosmos3_omni; backbone MoT Qwen3-VL-8B + experto de difusion; unified_3d_mrope; empaquetado multivista Omni-4D; atencion conjunta bidireccional |
| Parametros totales | 15.173.136.640 (15,17 B), incluye la torre ViT de Qwen3-VL |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de entrenamiento empaquetados son de 92k tokens, dato que no equivale a la ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (los pesos se publican en bf16) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (etiquetada como license: other en el repositorio) |
| Formato de pesos | safetensors (bf16, pesos EMA); 7 shards mas model.safetensors.index.json |
| Espacio de acciones | Posiciones articulares crudas (action_space=joint_pos) con estado sin normalizar, en ranura de 64 dimensiones con relleno de ceros, 32 dominios de encarnacion |
| Iteracion de entrenamiento | 2500 (de un calendario de 5000 pasos) |
| Modelo base | nvidia/Cosmos3-Nano (warm start desde Cosmos3-Nano-Policy-DROID) |
| Tamano del repositorio | 31,5 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseno cosmos3_omni: un backbone tipo mixture of transformers construido sobre Qwen3-VL-8B al que se acopla un experto de difusion para la generacion de video. El lado de video se entrena con diffusion forcing y perdida de flujo rectificado (rectified flow); el flujo de acciones utiliza la via de accion integrada en el backbone (action2llm, llm2action, action_modality_embed), sin experto de accion externo (action_expert: null). El stack Omni-4D empaqueta todas las vistas de camara de un episodio a lo largo de un eje de vista en una unica secuencia, con atencion conjunta bidireccional entre las modalidades.

El entrenamiento se realizo exclusivamente sobre DROID (peso 1.0, via la cache OXE LeRobot) a 256p, con todas las vistas de camara por episodio (require_all_views, sin limite de vistas), chunk de acciones de 16, latentes de historial {0,1,2}, historial de acciones y estado activados y 92k tokens por muestra empaquetada. La condicion de camara esta desactivada. La optimizacion usa LR 2e-5 con calendario warmup-cosine a lo largo de 5000 pasos; el normalizador empleado es el de estadisticas nativas de accion base-delta 3DA GAM. La innovacion destacable es la supervision de trazas de puntos 3D aplicada al backbone en la etapa de entrenamiento: el checkpoint publicado, sin embargo, no incluye la cabeza de tracking, de modo que no emite trayectorias de puntos 3D en inferencia. El export se realizo desde un checkpoint distribuido de PyTorch (iteracion 2500) con --use-ema-weights; la torre ViT no formaba parte del checkpoint de entrenamiento y se toma de Qwen/Qwen3-VL-8B-Instruct en la revision fijada por el framework Cosmos.

## Capacidades

- Generacion de video condicionada, entrenada con diffusion forcing y perdida de flujo rectificado.
- Generacion de acciones de control robotic o en forma de posiciones articulares crudas, con estado sin normalizar.
- Control multivista: procesa todas las vistas de camara de un episodio empaquetadas en una sola secuencia (Omni-4D).
- Razonamiento sobre historial: utiliza latentes de historial {0,1,2} junto con acciones y estado previos.
- Soporte multi-encarnacion: 32 dominios de encarnacion en una ranura de accion de 64 dimensiones.
- Capacidad multimodal heredada del backbone Qwen3-VL-8B (vision-lenguaje) mas el experto de difusion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidad especial de tracking 3D: el backbone se entreno con supervision de trazas de puntos 3D, pero el checkpoint publicado no incluye tracking_head.*, por lo que no emite trayectorias de puntos 3D.

## Casos de uso

- Politica de manipulacion robotica sobre tareas tipo DROID: el modelo genera acciones de posicion articular a partir de observaciones multivista, lo que permite desplegarlo como politica de control en brazos robotizados entrenados con el conjunto DROID.
- Rollout multivista en simulacion: al empaquetar todas las camaras de un episodio en una unica secuencia, se puede generar video consistente entre vistas para validar politicas antes de pasarlas a hardware real.
- Evaluacion de politicas en mundo aprendido: el modelo puede actuar como world model para predecir la evolucion del entorno y estimar el exito de una trayectoria de acciones sin ejecutarla fisicamente.
- Aumento de datos para robotica: generar video y acciones sinteticas de episodios plausibles para ampliar conjuntos de entrenamiento de politicas mas pequenas.
- Investigacion en world models para robotica: servir como punto de partida para estudiar el efecto de la supervision de puntos 3D en el backbone (comparando con las variantes -v3 y -wo-point de la misma ejecucion).
- Post-entrenamiento sobre nuevos dominios de encarnacion: el soporte de 32 dominios y un espacio de accion con relleno de ceros facilita adaptar el modelo a un robot nuevo manteniendo la via action2llm / llm2action.
- Prediccion de video condicionada por acciones para diagnostico: analizar si las acciones propuestas producen transiciones de video fisicamente coherentes, util en depuracion de politicas.
- Prototipado en laboratorio con GPU de gama alta: al no requerir API externa y publicarse en safetensors bf16, puede ejecutarse en infraestructura propia con el framework Cosmos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 30 GB solo para los pesos del modelo (15,17 B parametros x 2 bytes), mas activaciones, cache de atencion para secuencias largas (hasta 92k tokens por muestra empaquetada) y la torre ViT. En la practica se recomienda reservar 40-80 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o GPUs con memoria equivalente. Una RTX 4090 de 24 GB no permite cargar los pesos bf16 completos.
- Cabe en GPU de consumo: no en bf16 con los pesos publicados; no hay versiones cuantizadas (GGUF, AWQ, GPTQ) disponibles en la informacion proporcionada.
- Opciones de despliegue: inferencia mediante el framework Cosmos con torchrun (python -m cosmos_framework.scripts.inference) y descarga con hf download. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Multi-GPU: el comando de referencia usa torchrun con --nproc_per_node=<N>, lo que indica soporte de ejecucion distribuida.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 31,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-ours-DROID-v4 | 15,17 B | no disponible | Video + acciones (joint_pos), DROID | NVIDIA Open Model License | Hugging Face, 0 descargas, 0 likes |
| nvidia/Cosmos3-Nano | no disponible en la informacion proporcionada | no disponible | World model omnimodal base | NVIDIA Open Model License | Modelo base en Hugging Face |
| Cosmos3-ours-DROID-v3 | no disponible (misma ejecucion de entrenamiento, iteracion anterior) | no disponible | Video + acciones, DROID | no disponible | Hugging Face |
| Cosmos3-ours-DROID-wo-point | no disponible (misma ejecucion de entrenamiento, sin supervision de puntos) | no disponible | Video + acciones, DROID | no disponible | Hugging Face |
| Cosmos3-ours-DROID-v2 | no disponible | no disponible | Video + acciones, DROID | no disponible | Hugging Face |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento relativo entre estas variantes. El criterio objetivo de comparacion disponible es la procedencia: v4, v3 y -wo-point provienen de la misma ejecucion de entrenamiento, con v4 correspondiente a la iteracion 2500 y -wo-point sin supervision de puntos 3D.

## Limitaciones y advertencias

- No se garantiza precision fisica del video generado ni de la politica aprendida; la propia model card lo advierte.
- No apto para control critico de seguridad (safety-critical control).
- El checkpoint no incluye la cabeza de tracking (tracking_head.*), de modo que no se pueden obtener trayectorias de puntos 3D aunque el backbone se entrenara con esa supervision.
- El estado del robot no se normaliza y las acciones son posiciones articulares crudas, lo que exige integrar correctamente el normalizador 3DA GAM base-delta para obtener resultados comparables a los del entrenamiento.
- Entrenado exclusivamente con DROID a 256p; el rendimiento fuera de ese dominio (otras camaras, iluminacion, morfologias o tareas alejadas de DROID) es incierto.
- La condicion de camara esta desactivada (camera_conditioning_enabled: false), lo que limita el control explicito sobre el punto de vista.
- Riesgo de alucinacion y de deriva en rollouts largos: no se han publicado evaluaciones cuantitativas al respecto.
- Licencia NVIDIA Open Model License (etiquetada como other), con terminos especificos que deben revisarse antes de un uso comercial; los terminos de DROID aplican adicionalmente a los datos de entrenamiento.
- Las politicas de difusion no son deterministas por defecto; la reproducibilidad requiere fijar semillas y el esquema de muestreo.
- Punto de control intermedio: corresponde a la iteracion 2500 de 5000, por lo que no es el resultado final del calendario de entrenamiento.
- Idiomas y contexto maximo no documentados, lo que complica planificar despliegues con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rooty2020/Cosmos3-ours-DROID-v4
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia NVIDIA Open Model License (referenciada en el README del modelo base): https://huggingface.co/nvidia/Cosmos3-Nano/blob/main/README.md
- Cosmos 3, Cosmos Lab de NVIDIA: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cookbooks de Cosmos 3 en el repositorio NVIDIA/cosmos: https://github.com/NVIDIA/cosmos/tree/main/cookbooks/cosmos3
- Conjunto de datos DROID: https://droid-dataset.github.io/
- Variante previa Cosmos3-ours-DROID-v3 (misma ejecucion, iteracion anterior): https://huggingface.co/rooty2020/Cosmos3-ours-DROID-v2
- Perfil del autor rooty2020: https://huggingface.co/rooty2020/collections
- Torre ViT de origen: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
