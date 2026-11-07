# erickvs/sac-Hopper-v4-hand-edited

## Resumen

`erickvs/sac-Hopper-v4-hand-edited` es una versión editada a mano del agente SAC `sb3/sac-Hopper-v3` del RL Baselines3 Zoo, publicado por el usuario erickvs en Hugging Face. No es un modelo de lenguaje: es una política de control (actor-critic SAC) entrenada para la tarea `Hopper-v4` de MuJoCo, un entorno de locomoción continua en el que un cuerpo humanoide de una sola pierna debe avanzar saltando sin caer. El modelo parte del checkpoint oficial de Stable-Baselines3 y no ha sido reentrenado: se han modificado directamente 809 de los 69.635 pesos del actor.

El problema que resuelve es concreto y documentado por el autor: el SAC original del zoo cae en el 98,4 % de los episodios sobre la versión actual de MuJoCo, casi siempre alrededor del paso 300, porque la política percibe su propia velocidad por debajo de la real y acelera progresivamente hasta perder el equilibrio. La edición introduce dos cambios: un sesgo en 23 unidades de la primera capa que incrementa en 0,3 m/s la velocidad percibida, y un desplazamiento de la orden de pierna que se activa por encima de 1 m/s mediante tres unidades previamente inutilizadas.

La relevancia es metodológica: el autor documenta el proceso como una demostración de edición de pesos asistida por agentes de IA (herramienta WSP Lab, en fase de prototipo), con trazabilidad temporal y evaluación sobre 2.000 semillas no vistas. El resultado declarado es una recompensa media de 3.654 sin caídas, superior a todos los hoppers entrenados del zoo evaluados en el mismo protocolo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAC (Soft Actor-Critic): actor y críticos como redes fully-connected (MLP) sobre observaciones de estado de MuJoCo; no es un transformer |
| Parametros totales | 69.635 en el actor (el resto de la red actor-critic no se detalla en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control con observación por paso, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; pesos en coma flotante) |
| Idiomas soportados | no aplica (modelo de refuerzo, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | no especificado en la información disponible; cargable mediante Stable-Baselines3 (`stable_baselines3`) |

## Arquitectura y entrenamiento

El modelo es un agente SAC estándar de Stable-Baselines3, con un actor y críticos implementados como perceptrones multicapa que mapean el vector de observación de `Hopper-v4` (posición y velocidad de las articulaciones, altura y velocidad del torso) a acciones continuas de par articular. El checkpoint base `sb3/sac-Hopper-v3` proviene del RL Baselines3 Zoo, entrenado con los hiperparámetros publicados en ese repositorio. No hay datos en la información disponible sobre el número de pasos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, que en este dominio no aplican.

La innovación no está en el entrenamiento sino en la edición posterior de pesos. El autor identificó que la política usa su velocidad percibida para fijar el ritmo de zancada y que la lee demasiado baja, lo que provoca una aceleración progresiva (de ~2,3 m/s en el paso 100 a 4,5-5 m/s en el paso 300) hasta que el torso cae por debajo del límite de altura. La corrección consta de dos partes: (1) en las 23 unidades de la primera capa con mayor peso sobre la entrada de velocidad forward, se eleva cada sesgo en 0,3 veces su peso correspondiente a esa entrada, simulando una velocidad 0,3 m/s mayor; (2) se recablean tres unidades no utilizadas para implementar una rampa que desplaza la orden de pierna en −0,6 (antes de la tanh) cuando la velocidad supera 1 m/s, sin afectar al arranque. Los críticos y la cabeza de log-std permanecen intactos. El proceso se completó en 36 minutos sobre un portátil Apple M5 Max, sin reentrenamiento.

## Capacidades

- Control continuo de locomoción: genera acciones de par articular para el hopper de MuJoCo a partir de observaciones de estado.
- Política determinista en evaluación: los resultados reportados usan acciones deterministas.
- Robustez al ruido inicial: soporta hasta 10 veces el ruido de arranque por defecto sin caídas según el autor.
- Estabilidad en horizontes largos: mantiene la marcha en episodios de 3.000 pasos.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No tiene modo thinking, visión ni audio.
- Compatible con el ecosistema Gymnasium/MuJoCo y con la API de carga de Stable-Baselines3.

## Casos de uso

- Investigación en edición de pesos: sirve como caso de estudio reproducible de modificación dirigida de políticas de RL sin reentrenamiento, con evaluación sobre semillas retenidas y comparación frente al checkpoint original.
- Benchmark de robustez en MuJoCo: útil para probar protocolos de evaluación con ruido inicial elevado y episodios largos, ya que el autor publica resultados en ambas condiciones.
- Línea base para comparativas de algoritmos: al superar a TD3 y TQC del zoo en el mismo protocolo, puede usarse como referencia en estudios comparativos de control continuo.
- Enseñanza de RL profundo: ejemplo didáctico de cómo una política SAC codifica su velocidad percibida y de cómo un sesgo pequeño altera el comportamiento global.
- Auditoría de herramientas de edición automática: el registro temporal y la separación entre investigación, edición y verificación permiten evaluar pipelines de agentes que modifican pesos.
- Pruebas de regresión de entornos: útil para detectar cambios de comportamiento entre versiones de MuJoCo, dado que el checkpoint original falla sistemáticamente en la versión actual.
- Demostraciones visuales: los vídeos comparativos publicados sirven para material divulgativo sobre estabilidad de políticas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluación sobre 2.000 episodios de `Hopper-v4` con semillas 2.000.000 a 2.001.999 y acciones deterministas.

| Modelo | Recompensa media | Caídas | Velocidad forward |
|---|---|---|---|
| Este modelo | 3.654 | 0 % | 2,66 m/s |
| `sb3/td3-Hopper-v3` | 3.535 | 0 % | 2,54 m/s |
| `sb3/tqc-Hopper-v3` | 3.328 | 34,6 % | 2,67 m/s |
| `sb3/sac-Hopper-v3` sin editar | 1.171 | 98,4 % | 2,68 m/s |

Diferencias pareadas en las mismas semillas, con intervalos bootstrap del 95 %: +2.483 (+2.467 a +2.497) frente al SAC sin editar; +119 (+118 a +119) frente a TD3, con puntuación superior en los 2.000 episodios.

Robustez sobre 500 semillas no usadas durante la edición:

| Prueba | Este modelo | TD3 | SAC sin editar |
|---|---|---|---|
| Ruido inicial ×10 | 3.645, sin caídas | 3.530, sin caídas | 1.376, 93 % caídas |
| Episodios de 3.000 pasos | 11.273, sin caídas | 10.902, sin caídas | 1.314, 98 % caídas |

El autor indica que, cargado mediante Stable-Baselines3, el modelo obtuvo 3.654,0 sin caídas en las semillas 2.000.000 a 2.000.499, con una desviación máxima por episodio de 7,4 puntos respecto a su propio código de evaluación en float64.

## Requisitos de hardware

- VRAM estimada: mínima; el actor tiene 69.635 parámetros y los críticos son del mismo orden, por lo que la inferencia cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquiera; no requiere GPU. El autor completó todo el proceso (evaluación de 15.000 episodios base, edición y validación) en un Apple M5 Max.
- GPU de consumo: sí, cabe en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: carga mediante Stable-Baselines3 (`SAC.load`) y ejecución con Gymnasium/MuJoCo; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma agregada; el autor reporta menos de 1 minuto para evaluar 2.000 episodios en su equipo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Recompensa media (2.000 semillas) | Caídas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | SAC editado | 3.654 | 0 % | MIT | Hugging Face |
| `sb3/td3-Hopper-v3` | TD3 | 3.535 | 0 % | no disponible en la información | RL Baselines3 Zoo / Hugging Face |
| `sb3/tqc-Hopper-v3` | TQC | 3.328 | 34,6 % | no disponible en la información | RL Baselines3 Zoo / Hugging Face |
| `sb3/sac-Hopper-v3` | SAC | 1.171 | 98,4 % | no disponible en la información | RL Baselines3 Zoo / Hugging Face |

La comparación se limita al protocolo de evaluación del autor; no se dispone de resultados de otros modelos en las mismas semillas más allá de los publicados en la model card.

## Limitaciones y advertencias

- Modelo de control específico para `Hopper-v4`; no es un modelo de lenguaje ni sirve para tareas fuera de ese entorno.
- Los resultados son declarados por el autor y marcados como no verificados (`verified: false`) en el model-index; no hay replicación independiente.
- La edición se realizó contra la versión actual de MuJoCo; en versiones anteriores o futuras el comportamiento puede diferir, igual que ocurre con el checkpoint original.
- Solo se han modificado 809 pesos del actor; los críticos y la cabeza de log-std son los originales, lo que puede limitar la coherencia si se reutiliza el agente para fine-tuning adicional.
- No se documentan sesgos en el sentido habitual, pero la política está sobreajustada a la dinámica del hopper y no generaliza a otras morfologías o perturbaciones no evaluadas.
- Riesgo de sobreajuste a las semillas de selección: el autor mitiga parcialmente este punto usando 2.000 semillas no vistas en la evaluación final.
- Licencia MIT, lo que permite uso comercial y modificación, pero sin garantías del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB; la disponibilidad de los ficheros de pesos no está confirmada por la información proporcionada.
- La herramienta WSP Lab usada para la edición está en fase de prototipo y "coming soon"; el proceso no es reproducible con herramientas públicas documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erickvs/sac-Hopper-v4-hand-edited
- Modelo base: https://huggingface.co/sb3/sac-Hopper-v3
- Vídeo comparativo (semilla 2.000.000): https://huggingface.co/erickvs/sac-Hopper-v4-hand-edited/resolve/main/videos/original_vs_edited_seed_2000000.mp4
- Vídeo comparativo con TD3 (semilla 2.000.001): https://huggingface.co/erickvs/sac-Hopper-v4-hand-edited/resolve/main/videos/original_edited_td3_seed_2000001.mp4
