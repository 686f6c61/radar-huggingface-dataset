# Aasdfip/longnav-mshab-pick-flow-native-speedmix-20hz

## Resumen

longnav-mshab-pick-flow-native-speedmix-20hz es una politica vision-language-action (VLA) para el robot Fetch en el benchmark ManiSkill-HAB, concretamente en la tarea Pick con objetos de set_table, prepare_groceries y tidy_house. La desarrolla el usuario Aasdfip y se publica bajo licencia apache-2.0. Parte de Qwen3-VL-2B-Instruct, cuyo trunk completo (2,13 mil millones de parametros) se afina de forma densa, y anade una cabeza de flow matching de 28 millones de parametros, hasta un total aproximado de 2,16 mil millones.

El modelo resuelve control de manipulacion movil a partir de dos camaras RGB (cabeza a 512x320 y muneca a 224x224) y 25 dimensiones de propiocepcion. En lugar de acciones discretas o comandos de efector final, emite un chunk de 20 comandos nativos de Fetch separados 0,05 s (1,0 s de movimiento): 7 tasas articulares de brazo, tasa de torso, objetivo absoluto de gripper, 2 tasas de cabeza, velocidad forward de base y tasa de guinada de base. Todo ello bajo el contrato de accion certificado physical_rates_v1, que fija unidades fisicas y el controlador asumido (pd_joint_delta_pos con limites escalados a 0,5x).

Es relevante porque un VLM de 2B, adaptado con una cabeza de flujo, alcanza un 0,575 de exito en algun momento en el protocolo de validacion de 252 episodios, en linea con un SFT de pi0.5 (0,563) en el mismo benchmark. El autor lo presenta como inicializacion de sus ejecuciones de RL en MS-HAB. Se entrena por behaviour cloning sobre demostraciones expertas de MS-HAB reproducidas a una mezcla de velocidades, con el objetivo de obtener politicas mas robustas a cambios en la cadencia de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: trunk transformer Qwen3-VL-2B denso + cabeza de flow matching de 6 capas y 512 de ancho, con grupos separados de tokens para brazo y base |
| Parametros totales | ~2,16 mil millones (2,13 mil millones del trunk Qwen3-VL-2B + 28 millones de la cabeza de flujo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 (backbone) y fp32 (cabeza). No se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) en backbone/ y .pt (fp32) en head.pt |
| Entradas | Prompt textual, imagen de cabeza 512x320, imagen de muneca 224x224, propiocepcion de 25 dimensiones |
| Salidas | 20 comandos nativos de Fetch por decision, espaciados 0,05 s (13 dimensiones por tick) |
| Robot y simulador | Fetch en ManiSkill-HAB |
| Controlador | pd_joint_delta_pos con limites escalados a 0,5x: delta brazo/cuerpo 0,05 rad por tick, base 0,5 m/s y 1,57 rad/s |
| Frecuencia de control | 20 Hz nativos; decisiones re-planificadas a 2,5 Hz (ejecuta 8 de cada 20 ticks) |

## Arquitectura y entrenamiento

El trunk es Qwen3-VL-2B-Instruct afinado de forma densa: procesa el prompt, la imagen de cabeza, la imagen de muneca y la propiocepcion, y de el se extraen dos tokens de lectura. Estos se proyectan mediante LayerNorm por token, capa lineal, GELU y otra capa lineal de 2048 unidades, y se convierten en 8 tokens de contexto de ancho 512 que condicionan un decodificador de flujo de 6 capas y 512 unidades (28 millones de parametros). La cabeza usa grupos de tokens separados para brazo y base, una embedding sinusoidal continua de tiempo en segundos (periodos de 0,05 a 8 s) y una embedding de tipo de grupo. Las acciones se muestrean con integracion Euler de 10 pasos. La propiocepcion entra solo en el trunk, nunca en la cabeza.

El entrenamiento es behaviour cloning sobre demostraciones de los expertos RL publicados por MS-HAB, reproducidas con un controlador parcheado. La mezcla tiene dos componentes que no comparten episodios: velocidad constante (peso 1,0, 24 shards, controlador a 0,5x con acciones expertas tal cual) y un schedule de velocidad (peso 2,0, 13 shards, con s(t) en [0,2, 0,5] definido por tramos lineales cada 10-40 ticks, un 30% de mantenimientos, y acciones escaladas por s/0,5). El split realizado es de 26.945 episodios de entrenamiento (2.266.973 frames) y 2.055 de validacion (177.133 frames), con validacion separada por configuracion de escena. Los episodios se cortan 5 ticks despues del primer exito.

La optimizacion arranca con un warm start del trunk desde native_qwen_h20_wide_cont48k_20260916/checkpoint-48000 y una cabeza nueva agrupada. La cabeza se entrena primero sola durante 1.000 pasos y el trunk se descongela con una rampa de 1.000 pasos. Se usa AdamW con lr 2,5e-5, 1.000 pasos de warmup, batch efectivo de 32 (4 GPUs x 8 x 4 de acumulacion), 8 muestras estratificadas de tiempo de flujo por forward del trunk, EMA de 0,99 y 48.000 pasos. La innovacion destacable es la mezcla de velocidades, que expone a la politica a cadencias distintas dentro del mismo contrato de accion y del mismo controlador.

## Capacidades

- Generacion de comandos de control nativos de Fetch en chunks de 20 ticks a 0,05 s (1,0 s de movimiento), con 13 dimensiones por tick.
- Percepcion multimodal: prompt de texto, imagen de cabeza 512x320, imagen de muneca 224x224 y propiocepcion de 25 dimensiones.
- Control de manipulacion movil en simulacion con re-planificacion a 2,5 Hz (ejecuta 8 de cada 20 ticks y vuelve a planificar).
- Muestreo de acciones por flow matching con 10 pasos de integracion Euler, con opcion determinista o estocastica (flow-SDE).
- Robustez a velocidad de ejecucion gracias al entrenamiento con speedmix (0,5x constante y schedules en [0,2, 0,5]).
- Bucle de control multi-paso: la politica se evalua durante 200 pasos con re-planificacion periodica, lo que sostiene episodios multi-step de manipulacion.
- Tool calling / function calling: no aplica a este checkpoint, que no se presenta como modelo de lenguaje de proposito general.
- Capacidades multilingues: no disponibles.
- Vision: si, dos camaras RGB; no hay soporte declarado de audio ni de otras modalidades.
- Modo thinking: no declarado.

## Casos de uso

- Investigacion en manipulacion movil: replicar los experimentos Pick de ManiSkill-HAB con este checkpoint como politica de referencia y medir exito con la definicion de MS-HAB (agarre, efector en reposo, robot en reposo y fuerza de contacto por debajo del limite).
- Inicializacion de RL: el autor lo declara como punto de partida de sus ejecuciones de RL en MS-HAB; sirve para arrancar PPO u otros algoritmos con el trunk congelado o descongelado, como en la referencia de pi0.5 + 60 pasos de PPO.
- Benchmarking de politicas VLA: comparar contra otras politicas en el protocolo de 252 episodios (63 configuraciones de escena x 4 semillas) con exec-8 y muestreo de flujo determinista.
- Estudio de robustez a la cadencia: evaluar la politica con distintas velocidades de ejecucion, comparando el componente de velocidad constante con el schedule y midiendo si el rendimiento se mantiene.
- Prototipado de contratos de accion: reutilizar physical_rates_v1 y el controlador pd_joint_delta_pos con limites a 0,5x como base para otras politicas sobre Fetch en simulacion.
- Fine-tuning de la cabeza para nuevas tareas: al mantener el trunk congelado y reentrenar solo head.pt sobre nuevas tareas, el coste es bajo; el propio autor uso una cabeza nueva con warm start del trunk.
- Recogida de rollouts en simulacion: ejecutar la politica en ManiSkill-HAB para generar trayectorias etiquetadas y analizar fallos, fases de agarre y comportamiento post-exito.
- Analisis de decodificacion por flow matching: comparar muestreo determinista (10 pasos Euler) con muestreo estocastico (amplitudes de ruido 0,2-0,7) en terminos de exito y diversidad de trayectorias.

## Benchmarks y rendimiento

Perdida de flow matching por tick en validacion (512 filas reservadas, K=4 tiempos de flujo, semillas fijas; menor es mejor):

| Metrica | Valor |
|---|---:|
| tick 0 | 0,0988 |
| media de ticks 0-7 | 0,1246 |
| media de los 20 ticks | 0,1434 |

Evaluacion en bucle cerrado sobre set_table/pick/val/all.json (planes de apple y bowl, spawns de validacion, 63 configuraciones x 4 semillas = 252 episodios, 200 pasos, exec-8 a 2,5 Hz, muestreo determinista con 10 pasos Euler). Exito medido con la definicion de MS-HAB: agarrado, efector en reposo, robot en reposo, estatico y fuerza de contacto bajo el limite del episodio.

| Politica | Exito en algun momento | Exito al final | Alguna vez agarrado |
|---|---:|---:|---:|
| este checkpoint (solo SFT) | 0,575 | 0,313 | 0,754 |
| pi0.5 slow chunk-8 SFT (mismo protocolo de 252 episodios, decisiones a 5 Hz) | 0,563 | 0,222 | no disponible |
| pi0.5 + 60 pasos PPO, VLM congelado | 0,651 | 0,464 | no disponible |

El error estandar binomial con n=252 es de aproximadamente 0,03. Las filas de pi0.5 son un protocolo emparejado, no una comparacion por pares (las semillas difieren y sus decisiones son 4 de 8 ticks a 5 Hz). Con muestreo estocastico (flow-SDE) y amplitudes de ruido de 0,2 a 0,7, el exito en algun momento se mantiene en 0,56-0,64 sobre los mismos episodios. No se han publicado resultados de benchmarks estandar de lenguaje o vision (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Pesos: 4,0 GB para el trunk en bf16 (safetensors) y 113 MB para la cabeza en fp32; el repositorio completo ocupa 4,4 GB.
- VRAM estimada para inferencia: en torno a 4,2 GB solo para pesos; con activaciones de dos imagenes y del decodificador de flujo, una estimacion practica es de 8 GB o mas en bf16. Es una estimacion a partir del tamano declarado, no un dato publicado por el autor.
- GPU consumer: cabe con holgura en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. En GPUs de 8 GB puede quedar justo.
- GPU de datacenter: A100 y H100 son adecuadas para evaluacion a escala y para reentrenar la cabeza o el trunk. El autor uso 4 GPUs (modelo no especificado) con batch efectivo 32 durante 48.000 pasos.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es mediante el script longnav.scripts.train_native_rl run.mode=calibrate dentro de ManiSkill-HAB, cargando backbone/, head.pt, native_config.json, norm_stats.json y processor/.
- Latencia y throughput: los comandos se emiten a 20 Hz nativos y las decisiones se toman a 2,5 Hz (8 de 20 ticks por chunk), con 10 pasos Euler por decision. No se publican latencias wall-clock ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exito en algun momento | Exito al final | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| longnav-mshab-pick-flow-native-speedmix-20hz | ~2,16 mil millones | no disponible | 0,575 | 0,313 | apache-2.0 | HuggingFace |
| pi0.5 slow chunk-8 SFT | no disponible | no disponible | 0,563 | 0,222 | no disponible | no disponible |
| pi0.5 + 60 pasos PPO, VLM congelado | no disponible | no disponible | 0,651 | 0,464 | no disponible | no disponible |

No se dispone de mas datos de parametros, contexto, licencia o disponibilidad de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion (ManiSkill-HAB); no hay evidencia de transferencia a un robot Fetch real ni de robustez ante ruido de sensores reales.
- Alcance de tarea limitado a Pick con objetos de set_table, prepare_groceries y tidy_house; no se documenta generalizacion a otras tareas del benchmark.
- El exito al final es bajo (0,313) porque la fase de mantenimiento posterior al exito no esta entrenada: los episodios de entrenamiento se cortan 5 ticks despues del primer exito.
- No es un agente de acciones discretas ni una politica de efector final; requiere el contrato physical_rates_v1 y el controlador pd_joint_delta_pos con limites escalados a 0,5x, lo que limita su reutilizacion directa fuera de esa configuracion.
- Depende de una configuracion concreta de sensores: camara de cabeza 512x320, camara de muneca 224x224 y vector de propiocepcion de 25 dimensiones.
- Idiomas soportados: no disponibles; no se puede asumir comportamiento multilingue a partir de la model card.
- Sesgos conocidos: no documentados. El riesgo principal es la generacion de acciones fuera de distribucion ante escenas o velocidades no vistas, no la alucinacion de texto.
- La comparacion con pi0.5 no es por pares: las semillas difieren y las frecuencias de decision son distintas (2,5 Hz frente a 5 Hz).
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha sometido a revision externa; conviene validarlo antes de usarlo como referencia.
- Licencia apache-2.0 declarada en la model card; conviene verificar aparte los terminos aplicables al modelo base Qwen3-VL-2B-Instruct antes de un uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/Aasdfip/longnav-mshab-pick-flow-native-speedmix-20hz
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Ejecucion de wandb identificada en la model card: vlm_rl/mshab-native-qwen/3vo3nu6d (no se proporciona URL directa)
- Paper, repositorio de codigo y demo: no disponibles en la informacion proporcionada
- La busqueda web no devolvio enlaces relevantes: solo paginas genericas del buscador
