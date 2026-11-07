# erickvs/tqc-Ant-v4-hand-edited

## Resumen

`erickvs/tqc-Ant-v4-hand-edited` es una versión editada manualmente del agente de aprendizaje por refuerzo `sb3/tqc-Ant-v3` del RL Baselines3 Zoo, entrenado para la tarea `Ant-v4` de MuJoCo. Lo publica el usuario erickvs en Hugging Face y no ha sido reentrenado: un conjunto de agentes de IA modificó directamente algunos pesos de la red de política mediante la herramienta WSP Lab, en su versión prototipo.

El problema que aborda es concreto y medible. Sobre la versión actual de MuJoCo, el agente TQC original del zoo termina prematuramente el 56,4 % de sus episodios y obtiene una recompensa media de 2.811, aproximadamente la mitad que el mejor agente Ant del zoo (TD3, con 5.751). La causa no es que el robot caiga, sino que su marcha de rebote lo impulsa por encima del límite superior de altura del torso (1,0 m) que el entorno usa como criterio de terminación. La edición corrige ese comportamiento y eleva la recompensa media a 5.643 con solo un 2,6 % de terminaciones prematuras.

El modelo es relevante como demostración metodológica: muestra que la edición dirigida de pesos, guiada por análisis automatizado, puede recuperar el rendimiento de un agente RL degradado sin coste de entrenamiento, en unos 43 minutos sobre un portátil con Apple M5 Max. Es un artefacto de investigación, no un modelo de lenguaje: no procesa texto ni tiene capacidades generativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política y funciones Q para TQC (Truncated Quantile Critics) sobre Stable-Baselines3; arquitectura exacta de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL; observaciones de 111 dimensiones con `use_contact_forces=True`) |
| Tipos de cuantización | no disponible (pesos de política RL, no pensados para cuantización de inferencia LLM) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | pesos de Stable-Baselines3 (`.zip`), cargables con `sb3-contrib`; el repo declara 0,0 GB de tamaño |
| Entorno | Gymnasium `Ant-v4` con `use_contact_forces=True` |
| Modelo base | `sb3/tqc-Ant-v3` (finetune/editado, no reentrenado) |
| Acciones | deterministas en la evaluación publicada |

## Arquitectura y entrenamiento

El agente base es un TQC (Truncated Quantile Critics), un algoritmo de RL off-policy *actor-critic* implementado en `sb3-contrib` sobre Stable-Baselines3. TQC combina la truncación de cuantiles de la distribución del retorno con un conjunto de críticos, lo que reduce el sobreestimación del valor y estabiliza el entrenamiento en tareas continuas de control. La política actúa sobre observaciones de 111 dimensiones (incluyendo fuerzas de contacto) y produce comandos continuos para las articulaciones del cuadrúpedo Ant de MuJoCo. Los detalles de tamaño de red, número de cuantiles y número de críticos no están disponibles en la información proporcionada.

Lo relevante de esta versión no es el entrenamiento, que no se ha realizado, sino la edición. Los agentes de IA identificaron que las terminaciones prematuras se debían a un exceso de impulso en el rebote tras aterrizajes duros, y modificaron la capa de salida de la red, antes de la activación `tanh`: multiplicaron por 0,6 las salidas de las caderas 1 a 3 y por 0,5 la de la cadera 4 (la más saturada), y ajustaron las salidas de los tobillos 1 a 3 (el detalle de este último ajuste queda truncado en la model card). El efecto es una reducción de la ganancia de las caderas que elimina el sobre-rebote; en episodios completos, el agente editado resulta además más rápido (5,16 m/s frente a 4,09 m/s del original). No hubo RLHF, DPO ni ningún otro ajuste por preferencias: es edición directa de pesos verificada mediante evaluación.

## Capacidades

- Control continuo de un cuadrúpedo simulado (`Ant-v4`) mediante política determinista.
- Locomoción estable con marcha de rebote (*bounding gait*) sin salir del rango de altura permitido (0,2–1,0 m).
- Reducción drástica de terminaciones prematuras: del 56,4 % al 2,6 % en 2.000 episodios con semillas no vistas.
- Corrección de un fallo oculto: episodios que no terminan prematuramente pero acaban con el Ant boca abajo, del 30,5 % en el original al 0,7 % en esta versión.
- Mayor velocidad media en episodios completos (5,16 m/s frente a 4,09 m/s del original).
- Robustez frente a ruido de arranque triplicado (4.404 de retorno, 20 % de terminaciones prematuras) y frente a episodios de 3.000 pasos (16.569 de retorno, 7,4 % de terminaciones).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un agente de control, no un modelo de lenguaje.

## Casos de uso

- Evaluación de métodos de edición de pesos en RL: sirve como caso de referencia reproducible para comparar técnicas de *weight editing* guiadas por agentes frente a reentrenamiento, dado que la model card documenta tiempos, herramientas y resultados con intervalos de confianza.
- Reparación de políticas RL degradadas por cambios de versión del entorno: el agente original fallaba en MuJoCo actual; esta versión demuestra que se puede recuperar el rendimiento sin reentrenar, útil para mantener baselines del zoo operativos.
- Benchmark de robustez de control continuo: sus tablas de ruido de arranque y episodios largos permiten usar el agente como referencia al evaluar la estabilidad de nuevas políticas en `Ant-v4`.
- Docencia en aprendizaje por refuerzo: ejemplo práctico de cómo un criterio de terminación del entorno (banda de altura del torso) puede dominar la recompensa y de cómo diagnosticarlo con análisis de episodios.
- Investigación en automatización del ciclo de experimentación: el flujo documentado (registro del modelo, 15.000 episodios de baseline, 41 ejecuciones de prueba, edición y auditoría en 43 minutos) es un caso de estudio de agentes de IA operando herramientas de ML de forma verificable.
- Comparación de algoritmos en MuJoCo: al estar alineado con las evaluaciones de SAC y TD3 del zoo bajo el mismo protocolo, permite contrastar TQC editado frente a alternativas en condiciones equivalentes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). Evaluación sobre 2.000 episodios de `Ant-v4` con fuerzas de contacto activadas, semillas 2.000.000 a 2.001.999 y acciones deterministas:

| Modelo | Retorno medio | Terminaciones prematuras | Velocidad de avance |
|---|---|---|---|
| `sb3/td3-Ant-v3` (con reparación) | 5.751 | 2,0 % | 5,66 m/s |
| **Este modelo** | **5.643** | **2,6 %** | 5,15 m/s |
| `sb3/sac-Ant-v3` (con reparación) | 4.901 | 12,7 % | 5,40 m/s |
| `sb3/tqc-Ant-v3` (sin editar) | 2.811 | 56,4 % | 4,36 m/s |

Diferencias pareadas en las mismas semillas con intervalos bootstrap del 95 %: +2.832 frente al TQC sin editar (+2.743 a +2.919); +742 frente a SAC (+683 a +802); −108 frente a TD3 (−145 a −71).

El `model-index` de la model card declara además un `mean_reward` de 5.643,29 ± 656,84 en la tarea `Ant-v4`.

Pruebas de robustez sobre 500 semillas no usadas durante la edición:

| Prueba | Este modelo | TD3 | TQC sin editar |
|---|---|---|---|
| Ruido de arranque ×3 | 4.404, 20 % terminan antes | 4.414, 17 % | 2.265, 60 % |
| Episodios de 3.000 pasos | 16.569, 7,4 % terminan antes | 16.910, 6,2 % | 4.004, 78 % |

Evaluado con la aritmética float32 de Stable-Baselines3 (frente al float64 de WSP Lab), el modelo obtiene 5.647 con 2,8 % de terminaciones en las semillas 2.000.000 a 2.000.499. El autor advierte que la marcha del Ant es caótica y que float32 puede alterar episodios individuales, aunque las medias coinciden.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repo es de 0,0 GB y el número de parámetros no se declara; por la naturaleza de un agente TQC para `Ant-v4`, la inferencia es de muy bajo coste, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. La evaluación publicada se realizó en CPU sobre un portátil Apple M5 Max.
- GPU de consumo: no hay datos que permitan confirmarlo; el entrenamiento y la edición se hicieron sin GPU dedicada según la model card.
- Despliegue: carga mediante `stable-baselines3` y `sb3-contrib` con `gym.make("Ant-v4", use_contact_forces=True)`. No se documentan opciones de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la model card solo aporta tiempos del proceso de edición (43 minutos en total, 1 minuto para la evaluación final sobre 2.000 semillas).

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Retorno medio | Terminaciones prematuras | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | TQC editado | `Ant-v4` (contact forces) | 5.643 | 2,6 % | MIT | Hugging Face |
| `sb3/tqc-Ant-v3` | TQC | `Ant-v4` (contact forces) | 2.811 | 56,4 % | no disponible | RL Baselines3 Zoo |
| `sb3/sac-Ant-v3` | SAC | `Ant-v4` (contact forces) | 4.901 | 12,7 % | no disponible | RL Baselines3 Zoo |
| `sb3/td3-Ant-v3` | TD3 | `Ant-v4` (contact forces) | 5.751 | 2,0 % | no disponible | RL Baselines3 Zoo |

TD3 sigue por delante en retorno medio gracias a su mayor velocidad (5,66 m/s frente a 5,15 m/s), pero este modelo queda muy cerca y supera a SAC y al TQC original con claridad. Las cifras de los tres agentes del zoo corresponden a la evaluación con la reparación descrita en la model card, no a sus resultados originales.

## Limitaciones y advertencias

- Es un agente de control específico para `Ant-v4`; no es un modelo de lenguaje y no tiene capacidades de texto, visión ni razonamiento general.
- Requiere `use_contact_forces=True` para recibir las 111 observaciones con las que se entrenaron los agentes del zoo; sin esa opción el comportamiento no es el documentado.
- Los resultados son declarados por el autor y no están verificados de forma independiente (`verified: false` en el `model-index`).
- La edición se hizo con la versión prototipo de WSP Lab, una herramienta aún no publicada; la reproducibilidad exacta del proceso no está garantizada con las herramientas actuales.
- La aritmética float32 de Stable-Baselines3 puede alterar episodios individuales frente a la evaluación float64 de WSP Lab; las medias coinciden, pero no se debe esperar una reproducibilidad episodio a episodio.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque no aplican a este tipo de modelo; tampoco se documentan restricciones de uso comercial más allá de la licencia MIT.
- El modelo tiene 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso en producción ni validación por terceros.
- El detalle completo de los cambios en la capa de salida aparece truncado en la model card (el ajuste de los tobillos 1 a 3 no se especifica por completo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erickvs/tqc-Ant-v4-hand-edited
- Modelo base: https://huggingface.co/sb3/tqc-Ant-v3
- Vídeo comparativo (semilla 2.000.001): https://huggingface.co/erickvs/tqc-Ant-v4-hand-edited/resolve/main/videos/original_vs_edited_seed_2000001.mp4
- Vídeo comparativo con TD3 (semilla 2.000.004): https://huggingface.co/erickvs/tqc-Ant-v4-hand-edited/resolve/main/videos/original_edited_td3_seed_2000004.mp4
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- sb3-contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- RL Baselines3 Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- Gymnasium (Ant-v4): https://gymnasium.farama.org/environments/mujoco/ant/
- MuJoCo: https://mujoco.org/
- WSP Lab: no disponible (herramienta anunciada como próxima, sin URL pública en la información proporcionada)
