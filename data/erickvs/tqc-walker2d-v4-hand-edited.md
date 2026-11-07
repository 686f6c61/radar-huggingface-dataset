# erickvs/tqc-Walker2d-v4-hand-edited

## Resumen

`erickvs/tqc-Walker2d-v4-hand-edited` es un agente de aprendizaje por refuerzo profundo (TQC, *Truncated Quantile Critics*) para la tarea `Walker2d-v4` de Gymnasium/MuJoCo. No es un modelo de lenguaje: es una política neuronal que controla un androide bidimensional de dos piernas con el objetivo de caminar hacia delante sin caer. Lo publica el usuario `erickvs` como una edición manual de los pesos del agente de referencia `sb3/tqc-Walker2d-v3` del RL Baselines3 Zoo.

La particularidad del artefacto es metodológica: los pesos no se han reentrenado, se han modificado directamente mediante operaciones exactas (escalados y desplazamientos de sesgo) sobre la red, guiadas por agentes de IA en un proceso de unos 21 minutos documentado en la model card. El resultado es una reducción de la tasa de caídas del 29 % al 0,6 % sobre 2.000 episodios con semillas no vistas, y una mejora de retorno medio de +499 puntos respecto al original.

Su relevancia es doble: por un lado, ofrece un agente TQC de `Walker2d-v4` sustancialmente más robusto que el del zoo sin coste de entrenamiento; por otro, sirve como caso de estudio reproducible de *weight editing* automatizado sobre políticas de RL, una técnica poco habitual frente al ajuste fino convencional. El repositorio es de tamaño despreciable (0,0 GB) y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TQC (Truncated Quantile Critics), aprendizaje por refuerzo profundo sobre Stable-Baselines3 / sb3-contrib; red de política y críticos cuantílicos (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control continuo; episodios de 1.000 pasos por defecto, evaluado también a 3.000) |
| Tipos de cuantizacion | no disponible (pesos de red neuronal para inferencia en float32/float64; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | pesos de Stable-Baselines3 (`.zip`) cargables con `sb3-contrib`; tamaño del repo 0,0 GB |

## Arquitectura y entrenamiento

El agente base es un TQC del RL Baselines3 Zoo entrenado sobre `Walker2d-v3` y publicado como `sb3/tqc-Walker2d-v3`. TQC es un método *off-policy* de actor-crítico que combina críticos cuantílicos con truncamiento de cuantiles para mitigar la sobreestimación del valor, y que en la práctica se apoya en una política gaussiana y un conjunto de críticos. El entorno `Walker2d-v4` recibe observaciones proprioceptivas del androide y emite acciones continuas de par articular; la recompensa premia avanzar y mantenerse en pie, con un límite de altura del torso de 0,8 m que define la caída.

Lo relevante aquí no es el entrenamiento original sino la edición posterior. Según la model card, no hubo reentrenamiento: doce agentes de investigación analizaron el fallo en paralelo y tres agentes editores aplicaron operaciones exactas sobre los pesos, entre ellas escalar por 1,5 las salidas de ambos pies y por 1,7 las de ambos muslos antes de la `tanh`, desplazar la velocidad vertical percibida en −0,05 m/s y acoplar la velocidad frontal percibida al cabeceo del torso (−0,5 × pitch, más un sesgo constante de −0,025 m/s). La selección entre las tres ediciones se hizo sobre semillas de validación con una regla fijada de antemano, y la puntuación final se auditó sobre 2.000 semillas no vistas. El diagnóstico del fallo original es un hundimiento progresivo de las rodillas a lo largo de cientos de pasos, no un tropiezo puntual.

## Capacidades

- Control motor continuo del androide `Walker2d-v4`: locomoción bípeda hacia delante con acciones deterministas.
- Robustez frente a ruido inicial: con 10 veces el ruido de arranque por defecto mantiene 4.350 de retorno y 5,4 % de caídas.
- Estabilidad en horizontes largos: en episodios de 3.000 pasos alcanza 14.761 de retorno con 1,0 % de caídas.
- Evaluación determinista reproducible sobre semillas fijas de Gymnasium.
- No soporta *tool calling*, agentes multi-paso, generación de texto, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.
- No dispone de modo *thinking* ni de razonamiento simbólico; su única salida es el vector de acciones articulares.

## Casos de uso

- Benchmark de referencia para `Walker2d-v4`: sirve como política preentrenada y robusta contra la que comparar nuevos algoritmos sin tener que entrenar desde cero, gracias a su baja tasa de caídas (0,6 %) en 2.000 semillas.
- Estudio de *weight editing* en RL: permite reproducir el experimento de modificar pesos de una política TQC con operaciones exactas y medir el efecto sobre retorno y estabilidad, con la model card documentando cada paso y los tiempos.
- Evaluación de robustez de políticas: útil para probar protocolos con ruido inicial amplificado o episodios extendidos, escenarios en los que el original cae en el 30 % y el 78 % de los casos respectivamente.
- Docencia de aprendizaje por refuerzo: ejemplo compacto (repo de 0,0 GB) de agente TQC cargable con `sb3-contrib` para ilustrar actor-crítico, críticos cuantílicos y sensibilidad al ruido.
- Generación de datos de demostración: al ser determinista y estable, puede usarse para producir trayectorias limpias de locomoción en MuJoCo con fines de imitación o análisis cinemático.
- Pruebas de integración de pipelines de RL: su reducido tamaño y licencia MIT lo hacen adecuado para validar flujos de carga, evaluación y *smoke tests* en CI sin dependencias pesadas de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métrica `mean_reward`, no verificada por Hugging Face), sobre 2.000 episodios de `Walker2d-v4` con semillas 2.000.000 a 2.001.999 y acciones deterministas:

| Modelo | Retorno medio | Caídas | Velocidad frontal |
|---|---|---|---|
| `sb3/td3-Walker2d-v3` | 4.714 | 0 % | 3,72 m/s |
| **Este modelo** | **4.591** | **0,6 %** | 3,61 m/s |
| `sb3/tqc-Walker2d-v3` (sin editar) | 4.092 | 29,0 % | 3,39 m/s |
| `sb3/sac-Walker2d-v3` | 3.772 | 10,2 % | 2,87 m/s |

El `model-index` del repositorio declara `mean_reward` de 4.590,90 ± 239,35 sobre `Walker2d-v4`, coherente con la tabla anterior. Diferencias pareadas con intervalos bootstrap del 95 %: +499 frente al TQC sin editar (+469 a +528), +819 frente a SAC (+800 a +839) y −124 frente a TD3 (−135 a −114).

Pruebas de robustez sobre 500 semillas no usadas durante la edición:

| Prueba | Este modelo | TD3 | TQC sin editar |
|---|---|---|---|
| Ruido inicial ×10 | 4.350, 5,4 % caídas | 4.083, 13 % caídas | 3.988, 30 % caídas |
| Episodios de 3.000 pasos | 14.761, 1,0 % caídas | 15.027, 0 % caídas | 8.168, 78 % caídas |

Cargado mediante `sb3-contrib` en float32, el autor reporta 4.598 con 0,4 % de caídas sobre las semillas 2.000.000 a 2.000.499, frente a 4.594 en la evaluación float64 de su herramienta.

## Requisitos de hardware

- VRAM: no disponible con precisión; el repositorio ocupa 0,0 GB y la red TQC de `Walker2d-v4` es de tamaño reducido, por lo que la inferencia cabe holgadamente en cualquier GPU consumer (del orden de decenas de MB de pesos).
- GPU recomendadas: cualquiera con soporte CUDA es suficiente; el propio autor ejecutó la edición completa en un Apple M5 Max sin GPU dedicada.
- Cabe en GPU consumer: sí, incluidas RTX 3060, RTX 4090 y similares; también en CPU sin problema apreciable.
- Despliegue: `stable-baselines3` y `sb3-contrib` con `model.predict(obs, deterministic=True)`; requiere el entorno Gymnasium `Walker2d-v4` con MuJoCo instalado. No aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles como cifras publicadas; al tratarse de un MLP pequeño, la latencia por paso es despreciable frente al coste de la simulación MuJoCo, que suele dominar el bucle de evaluación.

## Comparativa con modelos similares

| Modelo | Algoritmo | Retorno (2.000 semillas) | Caídas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | TQC editado | 4.591 | 0,6 % | MIT | Hugging Face (`erickvs/...`) |
| `sb3/tqc-Walker2d-v3` | TQC | 4.092 | 29,0 % | no disponible en la información | Hugging Face (RL Zoo) |
| `sb3/td3-Walker2d-v3` | TD3 | 4.714 | 0 % | no disponible en la información | Hugging Face (RL Zoo) |
| `sb3/sac-Walker2d-v3` | SAC | 3.772 | 10,2 % | no disponible en la información | Hugging Face (RL Zoo) |

TD3 supera a este modelo en retorno medio y velocidad (3,72 frente a 3,61 m/s), pero pierde frente a él con ruido inicial ×10 (4.083 y 13 % de caídas frente a 4.350 y 5,4 %). Frente al TQC original, la mejora es de +499 puntos y reduce las caídas en más de un orden de magnitud.

## Limitaciones y advertencias

- Es una política de control específica de `Walker2d-v4`; no generaliza a otras tareas, morfologías ni entornos sin reentrenamiento.
- Los resultados de la model card están autodeclarados y marcados como `verified: false`; no hay validación independiente publicada.
- Sensibilidad numérica: el autor advierte que la marcha es tan sensible que la aritmética float32 de Stable-Baselines3 puede alterar episodios individuales (no las medias) respecto a la evaluación float64.
- Sesgos conocidos: no documentados en la información disponible; en RL, el comportamiento queda determinado por la función de recompensa del entorno, que aquí solo premia avance y altura.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo; el riesgo equivalente es una política que falle fuera de la distribución de estados evaluada.
- Licencia MIT, que permite uso comercial y modificación con atribución; conviene verificar la licencia del modelo base `sb3/tqc-Walker2d-v3`, no indicada en la información proporcionada.
- La herramienta de edición (WSP Lab) está anunciada como "coming soon" y la edición usó un prototipo, por lo que la reproducibilidad exacta del proceso no está garantizada.
- El modelo se publicó con fecha de creación 2026-11-07 y cero descargas; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erickvs/tqc-Walker2d-v4-hand-edited
- Modelo base: https://huggingface.co/sb3/tqc-Walker2d-v3
- Vídeo comparativo (semilla 2000011): https://huggingface.co/erickvs/tqc-Walker2d-v4-hand-edited/resolve/main/videos/original_vs_edited_seed_2000011.mp4
- Vídeo comparativo con TD3 (semilla 2000012): https://huggingface.co/erickvs/tqc-Walker2d-v4-hand-edited/resolve/main/videos/original_edited_td3_seed_2000012.mp4
- Repositorio de vídeos: https://huggingface.co/erickvs/tqc-Walker2d-v4-hand-edited/tree/main/videos
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- sb3-contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- RL Baselines3 Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
