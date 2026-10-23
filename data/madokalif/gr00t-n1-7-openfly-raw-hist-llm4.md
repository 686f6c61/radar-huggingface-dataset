# madokalif/gr00t-n1.7-openfly-raw-hist-llm4

## Resumen

`madokalif/gr00t-n1.7-openfly-raw-hist-llm4` es un fine-tune del modelo visión-lenguaje-acción (VLA) `nvidia/GR00T-N1.7-3B` adaptado a un nuevo embodiment: un dron cuádricóptero que navega en el simulador OpenFly siguiendo instrucciones en lenguaje natural. El autor lo publica como continuación de su checkpoint anterior `gr00t-n1.7-openfly-raw-hist`, con la diferencia de que aquí se entrenan además las cuatro capas superiores de las doce capas de LLM conservadas en el backbone (+201 M de parámetros entrenables). El modelo tiene 3.144.016.000 parámetros y se distribuye en safetensors (repo de 6,9 GB).

El problema que aborda es la navegación aérea guiada por lenguaje (*aerial VLN*): traducir una instrucción textual más la imagen de una cámara frontal de 320x240 y el estado del dron en una secuencia de comandos de bajo nivel. Cada paso predice 6 acciones con horizonte 8: desplazamientos en el marco del cuerpo (dx, dy, dz en metros), guiñada (dyaw en radianes) y dos flags discretos (hover_stop, land). Los resultados publicados son modestos: recall balanceado offline de 0,466 en entornos vistos y 0,469 en no vistos, sin mejora respecto al checkpoint raw-hist, y sin evaluación en bucle cerrado todavía.

Es relevante ahora porque NVIDIA ha liberado GR00T N1.7 como modelo VLA abierto y cross-embodiment, y este checkpoint demuestra el flujo de adaptación a un robot aéreo partiendo de un modelo entrenado para manipulación humanoide. Su interés es principalmente de investigación: es un artefacto de ablación reproducible, no un modelo listo para producción, con 0 descargas y 0 likes en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de NVIDIA GR00T N1.7; backbone de lenguaje + cabeza de acción; detalle exacto de capas no disponible |
| Parametros totales | 3.144.016.000 (~3,14 B) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible; usa historia de frames de vídeo en los offsets -16, -8, -4, -2, 0 |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible (entrada de instrucciones en lenguaje natural; el dataset OpenFly no documenta cobertura lingüística en la información disponible) |
| Licencia | other (se aplican la licencia del modelo base NVIDIA y los términos de OpenFly) |
| Formato de pesos | safetensors (repo de 6,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B`, un VLA abierto y cross-embodiment de NVIDIA diseñado para habilidades robóticas generalistas que toma entradas multimodales (lenguaje e imágenes) y produce acciones. En este fine-tune el backbone conserva 12 capas de LLM, de las cuales se entrenan las 4 superiores (+201 M de parámetros) además de los módulos de adaptación al nuevo embodiment. La información disponible no detalla el número exacto de capas del transformer visual, el tipo de cabeza de acción ni el mecanismo de integración de la historia de frames.

El entrenamiento se hizo sobre el split de train de OpenFly, convertido con el repositorio `drone`, en 2 GPU H100 con batch global 64, learning rate pico 1e-4, 3,39 M de frames y 64k pasos (1,2 épocas), con state dropout de 0,2 y `DRONE_TUNE_TOP_LLM_LAYERS=4`. La configuración de inferencia fija `DRONE_ACTION_HORIZON=8`, `DRONE_VIDEO_DELTAS=-16,-8,-4,-2,0` y `DRONE_STATE_KEYS=nav_state,odometry`. No se documentan en la información disponible fases de RLHF, DPO ni otras técnicas de alineamiento posteriores al ajuste supervisado.

## Capacidades

- Navegación aérea guiada por lenguaje: genera comandos de movimiento corporal a partir de una instrucción textual y la imagen de una cámara frontal de 320x240 RGB.
- Predicción de acciones continuas y discretas: dx, dy, dz en metros, dyaw en radianes, y los flags hover_stop y land, con horizonte de 8 pasos y 6 valores por paso.
- Integración de estado propioceptivo: consume `nav_state` (altitud, seno y coseno de la guiñada) y `odometry` (desplazamiento respecto a la pose inicial en el marco del cuerpo, seno y coseno del cambio de guiñada, pasos transcurridos).
- Uso de memoria visual a corto plazo: la configuración incorpora frames en los offsets -16, -8, -4, -2 y 0, lo que da al modelo una ventana temporal de contexto visual.
- Adaptación a nuevo embodiment mediante la etiqueta `new_embodiment` y un fichero de configuración de modalidades (`configs/drone_config.py`).
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling, function calling y razonamiento multi-paso explícito: no disponible; el modelo es una política VLA, no un LLM conversacional con herramientas.

## Casos de uso

- Navegación autónoma de dron en simulación: ejecutar instrucciones del tipo "avanza hasta el edificio y gira a la derecha" en los simuladores de OpenFly usando `scripts/eval_server/run_sim_eval.sh`, aprovechando que el modelo predice comandos de bajo nivel directamente desde píxeles y estado.
- Investigación en adaptación cross-embodiment: servir como punto de partida para comprobar cuánto conocimiento de manipulación de GR00T N1.7 transfiere a un robot aéreo, dado que el autor documenta el proceso completo en `docs/experiments.md`.
- Ablación de ajuste del backbone: comparar este checkpoint con `gr00t-n1.7-openfly-raw-hist` para medir el efecto de entrenar las 4 capas superiores del LLM; el propio autor reporta que no hubo ganancia (0,466 frente a la línea base).
- Búsqueda y rescate en entornos simulados: entrenar y evaluar políticas de exploración con parada automática (`hover_stop`) y aterrizaje (`land`) sobre los escenarios de OpenFly antes de transferir a hardware real.
- Inspección de infraestructura en simulación: usar la ventana de historia de frames para mantener coherencia de rumbo en trayectorias largas alrededor de estructuras, con la odometría como señal de deriva.
- Generación de datos y evaluación offline: emplear el modelo como política de referencia para puntuar trayectorias o generar rollouts etiquetados en el pipeline de OpenFly.
- Servido como policy server independiente: `scripts/run_policy_server.py` permite desacoplar el modelo del simulador y conectarlo a otros clientes que hablen el mismo protocolo de acciones.

## Benchmarks y rendimiento

| Metrica | Conjunto | Resultado |
|---|---|---|
| Recall balanceado (offline) | Entornos vistos (seen) | 0,466 |
| Recall balanceado (offline) | Entornos no vistos (unseen) | 0,469 |
| Evaluación en bucle cerrado | Simuladores OpenFly | no ejecutada ("no closed-loop run yet") |
| Comparación con `gr00t-n1.7-openfly-raw-hist` | Offline | sin mejora apreciable |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de LLM en la información disponible; el modelo es una política VLA y las métricas aplicables son las de navegación anteriores. No se dispone de cifras de éxito de tarea (*success rate*) ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6,3 GB solo para los pesos en bf16/fp16; hay que sumar el codificador visual, el contexto de imágenes y el estado, por lo que conviene reservar 10-12 GB. En int8 serían unos 3,2 GB y en int4 unos 1,6-2 GB, pero no se publican pesos cuantizados.
- GPU recomendadas: H100 o A100 para reproducir el entrenamiento (se usaron 2x H100); para inferencia, A100 40 GB, L40S o RTX 6000 Ada ofrecen margen amplio.
- GPU de consumo: cabe en una RTX 4090 (24 GB) e incluso en tarjetas de 12-16 GB en precisión reducida, siempre que el stack de Isaac-GR00T funcione en esa GPU.
- Opciones de despliegue: servidor de política de Isaac-GR00T en el commit `dac54b3` (`scripts/run_policy_server.py`) junto con el repositorio `drone`; el despliegue con vLLM, llama.cpp, Ollama o TGI no está soportado en la información disponible, al no ser un modelo de generación de texto.
- Latencia y throughput: no disponibles; no se ha ejecutado evaluación en bucle cerrado ni se publican medidas de tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `madokalif/gr00t-n1.7-openfly-raw-hist-llm4` (este) | 3,14 B | no disponible | Recall balanceado offline 0,466 / 0,469; sin bucle cerrado | other (NVIDIA + OpenFly) | HuggingFace, 0 descargas |
| `madokalif/gr00t-n1.7-openfly-raw-hist` | no disponible | no disponible | Línea base del autor; sin ganancia al añadir las 4 capas | other (NVIDIA + OpenFly) | HuggingFace |
| `nvidia/GR00T-N1.7-3B` | ~3 B (según nombre) | no disponible | No disponible; orientado a manipulación humanoide | licencia NVIDIA | HuggingFace, modelo base oficial |
| `reproducible-ai/gr00t-n1-7` | no disponible | no disponible | Reproducción del checkpoint público; sin métricas en la información disponible | nvidia-license | HuggingFace, repo de 12,6 GB |

La comparación con alternativas de navegación aérea VLN específicas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo: un recall balanceado de 0,466-0,469 implica que más de la mitad de los objetivos no se recuperan correctamente en evaluación offline.
- Sin validación en bucle cerrado: no hay ninguna ejecución en los simuladores de OpenFly, por lo que se desconoce si los errores se acumulan al volar de forma iterativa.
- Sin ganancia demostrada: entrenar las 4 capas superiores del LLM no mejoró la línea base, lo que sugiere que el cuello de botella no está en esas capas.
- Entrada sensorial muy limitada: una sola cámara frontal de 320x240 RGB, sin profundidad, LiDAR ni vista cenital, lo que restringe la percepción espacial.
- Dependencia fuerte del estado: el modelo consume odometría y `nav_state`; un error de deriva o una odometría no disponible degradará las predicciones, y el state dropout de 0,2 durante el entrenamiento no garantiza robustez a estado corrupto.
- Sesgos conocidos: no documentados en la información disponible; el modelo hereda los sesgos del dataset OpenFly y del corpus de entrenamiento de GR00T N1.7.
- Riesgo de alucinación: no evaluado; en un VLA se manifestaría como comandos de movimiento inconsistentes con la escena o instrucciones ignoradas.
- Restricciones de licencia: licencia `other`; se aplican simultáneamente la licencia del modelo base NVIDIA y los términos de OpenFly, por lo que el uso comercial requiere revisión legal caso por caso.
- Idiomas: no se documenta cobertura multilingüe; las instrucciones del dataset están en el idioma original de OpenFly, no confirmado en la información disponible.
- Madurez: 0 descargas y 0 likes, checkpoint de investigación sin mantenimiento declarado y atado a un commit concreto (`dac54b3`) del ecosistema Isaac-GR00T.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/madokalif/gr00t-n1.7-openfly-raw-hist-llm4
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset OpenFly: https://huggingface.co/datasets/IPEC-COMMUNITY/OpenFly
- Repositorio del autor para servir el modelo: https://github.com/Index-23227/drone
- NVIDIA Isaac-GR00T (repositorio oficial): https://github.com/NVIDIA/Isaac-GR00T
- Fork de referencia Isaac-GR00T-N1.7: https://github.com/precognitionlab/Isaac-GR00T-N1.7
- Página de NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- Reproducción del checkpoint: https://huggingface.co/reproducible-ai/gr00t-n1-7/tree/main
- Guía de fine-tuning y validación de GR00T N1.7: https://physicalailab.io/en/nvidia-isaac-groot-n1-7-guide/
