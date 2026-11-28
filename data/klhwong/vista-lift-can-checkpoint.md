# KLHWONG/vista-lift-can-checkpoint

## Resumen

VISTA Lift Can es un checkpoint de política de difusión (diffusion policy) para manipulación robótica visuotáctil, publicado por el usuario KLHWONG en Hugging Face. Corresponde al resultado "Lift Can" del artículo *Equivariant Visual-Tactile Diffusion Policy for Contact-Rich Manipulation*, y está entrenado específicamente para la tarea de levantar una lata en un entorno simulado con Isaac Sim. El modelo combina información visual y táctil para generar trayectorias de acciones en tareas de contacto rico, incorporando equivarianza SO(2) con grupo cíclico C8.

El checkpoint contiene un workspace completo de PyTorch (modelo, EMA, estado del optimizador, configuraciones resueltas y normalizadores de observación/acción), con un tamaño aproximado de 2,91 GB. Se entrenó con 50 demostraciones (40 de entrenamiento y 10 de validación) y alcanzó una tasa de éxito del 92,5 % (37/40) en la evaluación con semillas 1000–1039, usando DDPM con 100 pasos de denoising y ejecución de 8 acciones antes de replanificar.

Es relevante porque ejemplifica la aplicación de políticas de difusión equivariantes a tareas de manipulación con contacto, un área donde los enfoques puramente visuales suelen fallar. No obstante, se trata de un artefacto de investigación muy específico: un único checkpoint para una única tarea, sin model card con instrucciones de uso general, sin benchmarks comparativos publicados y con dependencias estrictas de versiones concretas de Isaac Sim e Isaac Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión visuotáctil con equivarianza SO(2)/C8 (diffusion policy) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch/dill en precisión original) |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch/dill (`best.ckpt`, ~2,91 GB) |

## Arquitectura y entrenamiento

La arquitectura es una política de difusión (diffusion policy) que genera acciones robóticas mediante un proceso DDPM de 100 pasos de denoising. Incorpora equivarianza bajo el grupo SO(2) discretizado como C8, lo que permite que la política generalice rotaciones en el plano de la mesa sin necesidad de aumentación explícita de datos. El modelo consume observaciones visuales y táctiles (visuotactile) para tareas de manipulación con contacto rico, y produce chunks de 8 acciones que se ejecutan antes de replanificar.

El entrenamiento se realizó con 50 demostraciones (40 train / 10 validación), semilla 0, batch size 64, 300 épocas, learning rate 1e-4 con schedule coseno y 500 actualizaciones de warmup. El mejor checkpoint corresponde a la época 192 (paso global 23.352) con una pérdida de difusión de validación de 0,003230112139135599. El run ID es `midfov_nonvital50_restart1_demo50_b64_ecfg_s0_lift_can_VISTA_so2`. No se especifica en la información disponible el número de tokens ni la composición del dataset más allá del número de demostraciones, ni si hubo RLHF/DPO (no aplica en este dominio).

## Capacidades

- Generación de trayectorias de acción para manipulación robótica en tareas de contacto rico.
- Fusión de observaciones visuales y táctiles (visuotactile) para control de agarre y levantamiento.
- Equivarianza rotacional SO(2)/C8 en el plano de manipulación.
- Ejecución de chunks de 8 acciones antes de replanificar (control receding-horizon).
- Especializado en la tarea concreta "Lift Can" en simulación Isaac Sim.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento (no es un modelo de lenguaje).

## Casos de uso

- Investigación en políticas de difusión equivariantes: sirve como referencia reproducible para comparar variantes SO(2)/C8 frente a políticas no equivariantes en la misma tarea de levantamiento de lata.
- Reproducción de resultados del artículo: permite replicar la evaluación reportada (37/40, semillas 1000–1039) con el perfil `vista_exec8` y DDPM de 100 pasos.
- Baseline para manipulación visuotáctil: útil como punto de partida para experimentos que añadan nuevas modalidades táctiles o cambien el objeto a manipular.
- Estudio de robustez ante rotaciones: la equivarianza C8 permite analizar cómo generaliza la política ante orientaciones del objeto no vistas durante el entrenamiento.
- Docencia y formación en robótica: ejemplo práctico de pipeline completo (entrenamiento, checkpoint, evaluación en Isaac Sim) para cursos de aprendizaje por imitación.
- Desarrollo de sistemas de control con contacto: la política puede integrarse en bucles de control que requieran replanificación cada 8 acciones, evaluando latencia y estabilidad del chunking.
- Validación de ports entre versiones de simulador: el checkpoint sirve para detectar regresiones al migrar de Isaac Sim 4.5.0 / Isaac Lab v2.1.1 a versiones más recientes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de éxito (Lift Can, 40 episodios, semillas 1000–1039) | 37/40 (92,5 %) |
| Pérdida de difusión de validación (mejor checkpoint) | 0,003230112139135599 |
| Época del mejor checkpoint | 192 |
| Paso global | 23.352 |
| Pasos de denoising (DDPM) | 100 |
| Acciones ejecutadas antes de replanificar | 8 |
| Límite de acciones por política | 400 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa ~2,91 GB e incluye estado del optimizador, por lo que la inferencia en sí requiere menos memoria que el artefacto completo, pero no se especifica la cifra.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño real del modelo y del simulador Isaac Sim, que típicamente requiere GPU dedicada.
- Opciones de despliegue: entorno VISTA con Isaac Sim 4.5.0, Isaac Lab v2.1.1 y libuipc/pyuipc 0.9.0; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de difusión, modelos visuotáctiles o checkpoints equivalentes.

## Limitaciones y advertencias

- Artefacto de investigación de propósito único: entrenado exclusivamente para la tarea "Lift Can" en simulación; no generaliza a otras tareas sin reentrenamiento.
- Dependencia estricta de versiones: Isaac Sim 4.5.0, Isaac Lab v2.1.1 y libuipc/pyuipc 0.9.0; el commit exacto del código fuente VISTA y de UIPC no se recuperó, y la revisión del preprocesado de imágenes de muñeca es incierta.
- Checkpoint en formato pickle (dill): es un artefacto de confianza; debe cargarse solo desde este repositorio y con un entorno VISTA compatible por riesgo de ejecución de código arbitrario.
- El perfil de evaluación público `vista_exec8_ddim8` no es equivalente al perfil usado para el resultado reportado (`vista_exec8` con DDPM de 100 pasos); comparar ports con perfiles distintos puede dar resultados no comparables.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas (no aplica al ser un modelo robótico), pero tampoco hay datos sobre robustez fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero el checkpoint depende de assets y simulador con sus propias licencias (Isaac Sim requiere aceptación de EULA).
- No se especifican parámetros totales ni requisitos de hardware, lo que dificulta planificar el despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/KLHWONG/vista-lift-can-checkpoint
- Repositorio fuente VISTA: no disponible en la información proporcionada
- Artículo *Equivariant Visual-Tactile Diffusion Policy for Contact-Rich Manipulation*: no disponible enlace directo en la información proporcionada
- Isaac Sim: no disponible enlace directo en la información proporcionada
- Isaac Lab: no disponible enlace directo en la información proporcionada
