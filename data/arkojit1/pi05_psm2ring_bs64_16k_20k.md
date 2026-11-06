# arkojit1/pi05_psm2ring_bs64_16k_20k

## Resumen

`arkojit1/pi05_psm2ring_bs64_16k_20k` es un ajuste fino del modelo de politica robotica `lerobot/pi05_base` (π₀.₅, revision `a538eb27`), desarrollado por el usuario arkojit1. El modelo resuelve una tarea concreta de manipulacion quirurgica: transferir un anillo entre postes con el instrumento PSM2 del sistema dVRK (da Vinci Research Kit). Se entrena sobre el dataset `wissenschaftderlogik/psm2-ring-transfer-binjaw-v5`, compuesto por 49 episodios teleoperados con teclado a 15 Hz y una unica instruccion en lenguaje natural.

Tecnicamente es una politica vision-language-action (VLA) de tipo flow matching que combina un codificador visual SigLIP con un backbone de lenguaje Gemma-2B congelados, y entrena unicamente el "action expert". El checkpoint publicado corresponde al paso 16.000 de un entrenamiento planificado de 20.000 pasos, seleccionado por tener la menor perdida de evaluacion del run (0,1403 sobre episodios retenidos).

Es relevante como ejemplo reproducible de ajuste fino de π₀.₅ en dominios de robotica quirurgica con recursos modestos (8 GPU MI300X, batch global 64), y por documentar de forma inusualmente detallada el esquema de normalizacion, el mapeo de camaras y las convenciones de acciones delta, aspectos que suelen ser fuente de errores en el despliegue de politicas VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π₀.₅: SigLIP (vision) + Gemma-2B (lenguaje) congelados + action expert entrenable, flow matching |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE; solo el action expert es entrenable) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (la tarea se define con una unica instruccion en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo parte de π₀.₅ (`lerobot/pi05_base`), una politica VLA que procesa observaciones multimodales (imagenes de camara y estado propioceptivo) junto con una instruccion textual y genera secuencias de acciones mediante flow matching. En este ajuste fino se congela toda la torre SigLIP y el backbone Gemma-2B, y se entrena exclusivamente el action expert (`train_expert_only=true`). La salida es un chunk de 50 acciones que cubre 3,3 s a 15 Hz (`chunk_size=50`, `n_action_steps=50`).

El entrenamiento se realizo con LeRobot 0.4.4 sobre 8 GPU AMD MI300X (8 muestras por GPU, batch global 64), AdamW con LR pico 2,5e-5, betas (0,9; 0,95), weight decay 0,01, recorte de gradiente 1,0, schedule coseno con warmup de 666 pasos y suelo de 2,5e-6, en bf16. Se planificaron 20.000 pasos (288,9 pasos por epoca, 69,2 epocas); el checkpoint publicado es el paso 16.000 (55,4 epocas). La normalizacion es por cuantiles q01-q99 para estado y accion, sin aumento de datos. El split de evaluacion retiene los 5 ultimos episodios (44-48) y entrena con los episodios 0-43. La perdida de evaluacion (flow matching) es 0,1403 en este paso y 0,122 en entrenamiento.

El dataset contiene 49 episodios teleoperados con teclado del PSM2 del dVRK. El estado (`observation.state`, 8-D) codifica posicion xyz en metros respecto a `PSM2_base`, cuaternion xyzw y angulo de la pinza en radianes. La accion (10-D) codifica delta xyz (3), delta de rotacion en representacion 6D (6) y apertura binaria de pinza (0/1); las acciones se almacenan como diferencias entre medidas consecutivas (`action[t] = measured[t+1] − measured[t]`) y deben aplicarse igual en despliegue. Las entradas visuales son `observation.image.cam0` (camara externa fija, mapeada a `base_0_rgb`) y `observation.image.cam1` (camara de muneca, mapeada a `left_wrist_0_rgb`), con `empty_cameras=1` de modo que `right_wrist_0_rgb` queda vacio.

## Capacidades

- Generacion de trayectorias de accion continuas para manipulacion robotica: chunks de 50 pasos (3,3 s) con delta xyz, delta de rotacion 6D y apertura de pinza binaria.
- Condicionamiento por instruccion en lenguaje natural: una unica tarea ("grasp the object on the right pole, transfer it to the middle pole, release it, and withdraw the instrument").
- Percepcion visual multimodal: una camara externa fija y una camara de muneca.
- Control de instrumento quirurgico PSM2 del dVRK con cinematica relativa (acciones delta).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de agentes de software.
- Capacidades multilingues: no disponible; la unica instruccion documentada esta en ingles.
- No dispone de modo thinking, vision generativa, audio ni otras capacidades generales: es una politica de accion, no un modelo de proposito general.

## Casos de uso

- Investigacion en robotica quirurgica: reproduccion y extension del benchmark de transferencia de anillos con PSM2, sirviendo como punto de partida para comparar variantes de politica VLA en el mismo dataset.
- Ajuste fino sobre nuevas tareas dVRK: el checkpoint puede reinicializarse con `PI05Policy.from_pretrained` y reentrenarse con LeRobot 0.4.4 sobre datasets propios con el mismo esquema de estado (8-D) y accion (10-D).
- Aprendizaje por imitacion a partir de teleoperacion con teclado: el modelo demuestra que 49 episodios a 15 Hz bastan para obtener una politica con perdida de evaluacion estable (~0,145-0,15 desde el paso 7.500), util como referencia de viabilidad con pocos datos.
- Evaluacion de infraestructura de entrenamiento en AMD MI300X: el run documenta configuracion completa (8 GPU, batch 64, AdamW, schedule coseno) y sirve como receta reproducible para entrenar politicas VLA en hardware no NVIDIA.
- Docencia y formacion en VLA: el model card detalla mapeo de camaras, convenciones de acciones delta y el efecto de la normalizacion por cuantiles en dimensiones casi identidad, material didactico poco habitual en este tipo de checkpoints.
- Pruebas de despliegue con LeRobot: integrable en pipelines de inferencia de LeRobot 0.4.4 con el fork de `transformers` para π₀ (rama `fix/lerobot_openpi`) para validar el bucle percepcion-accion en simulacion o en un banco dVRK.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la perdida de evaluacion (flow matching) sobre 5 episodios retenidos: 0,1403 en el paso 16.000, con una dispersion punto a punto de aproximadamente ±0,005. El autor advierte explicitamente de que esta cifra no es una tasa de exito de la tarea.

| Metrica | Valor |
|---|---|
| Eval loss (paso 16.000, episodios 44-48) | 0,1403 |
| Train loss | 0,122 |
| Dispersion punto a punto de eval loss | ±0,005 aprox. |
| Meseta de eval loss | ~0,145-0,15 desde el paso ~7.500 (26 epocas) |
| Tasa de exito de tarea | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 3.616.757.520 parametros, en bf16 los pesos ocupan aproximadamente 7,2 GB (coincide con el tamano del repo, 7,5 GB); en fp32 serian unos 14,5 GB. A esto hay que sumar activaciones y buffers de inferencia, no cuantificados en la informacion disponible.
- GPU recomendadas: el entrenamiento se realizo en 8 AMD MI300X (8 muestras por GPU). Para inferencia no se especifica hardware minimo.
- GPU de consumo: no confirmado. Por tamano en bf16 (unos 7,2 GB de pesos) cabria teoricamente en GPUs con 12-16 GB o mas, pero no hay validacion publicada ni soporte documentado de cuantizacion para esta politica.
- Opciones de despliegue: LeRobot 0.4.4 con el fork de `transformers` de Hugging Face para π₀ (rama `fix/lerobot_openpi`), cargando mediante `PI05Policy.from_pretrained`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a politicas de accion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arkojit1/pi05_psm2ring_bs64_16k_20k` | 3,62 B | no disponible | Transferencia de anillo con PSM2 (dVRK) | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | Politica VLA general base para ajuste fino | no disponible | Hugging Face |
| `arkojit1/pi05_stack_yellow_on_red_joint_bs64_20k_20k` | no disponible | no disponible | Apilado de bloques (entrenamiento conjunto) | no disponible | Hugging Face |
| `arkojit1/pi05_stack_yellow_on_red_bs64_6k_20k` | no disponible | no disponible | Apilado de bloques (checkpoint intermedio) | no disponible | Hugging Face |

Los dos modelos de `arkojit1` listados comparten la misma receta de ajuste fino sobre π₀.₅, pero abordan tareas de manipulacion distintas; no se dispone de datos de rendimiento comparables entre ellos. No se han identificado en la informacion disponible otras politicas VLA ajustadas para el mismo dataset dVRK con las que comparar directamente.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para una unica tarea y un unico montaje (PSM2, dos camaras concretas, dataset de 49 episodios). No generaliza a otras tareas, objetos ni configuraciones de camara sin reentrenamiento.
- La perdida de evaluacion (0,1403) es un objetivo de entrenamiento sobre 5 episodios retenidos, no una tasa de exito. El autor lo advierte explicitamente; no hay evidencia publicada de que la politica complete la tarea en hardware real.
- Convencion de acciones critica: las acciones son deltas (`action[t] = measured[t+1] − measured[t]`) y deben aplicarse de la misma forma en despliegue; un tratamiento absoluto de las mismas produciria comportamientos incorrectos.
- Normalizacion problematica en dimensiones casi identidad: las dimensiones 3 y 7 de la accion (entradas casi identidad de la rotacion 6D) tienen un rango q01-q99 de ~1e-6, por lo que la normalizacion por cuantiles las mapea a valores de hasta ~±24 en lugar de ±1. Cualquier reimplementacion del pipeline de normalizacion debe replicar este comportamiento.
- Mapeo de camaras fragil: cam0 debe pasarse como `base_0_rgb`, cam1 como `left_wrist_0_rgb` y `right_wrist_0_rgb` debe quedar vacio (`empty_cameras=1`). Un orden distinto degrada la politica sin aviso.
- Dependencia de versiones concretas: requiere LeRobot 0.4.4 y el fork de `transformers` para π₀ (rama `fix/lerobot_openpi`); otras versiones pueden no cargar los pesos correctamente.
- Sesgos: no documentados. El dataset procede de teleoperacion con teclado por un operador concreto, lo que puede introducir sesgos de estilo de movimiento y limitaciones de generalizacion a otros operadores o cinemáticas.
- Riesgo de alucinacion: no aplica en el sentido textual, pero la politica puede generar trayectorias plausibles pero fisicamente invalidas fuera de la distribucion de entrenamiento; no hay evaluacion de seguridad en entorno quirurgico.
- Licencia no disponible: no se puede confirmar el uso comercial. Ademas, el modelo base `lerobot/pi05_base` tiene su propia licencia que debe verificarse por separado.
- Uso clinico: no apto para aplicaciones medicas reales sin validacion exhaustiva; es un artefacto de investigacion con 0 descargas y sin revision por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/pi05_psm2ring_bs64_16k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/wissenschaftderlogik/psm2-ring-transfer-binjaw-v5
- Modelo hermano (apilado, joint): https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_joint_bs64_20k_20k
- Modelo hermano (apilado, paso 6k): https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_bs64_6k_20k
