# madokalif/xlerobot-pi05-bottle

## Resumen

El modelo `madokalif/xlerobot-pi05-bottle` es un fine-tune LoRA del modelo base `physical-intelligence/pi05_base` (π₀.₅, un Vision-Language-Action model desarrollado por Physical Intelligence) para una tarea específica de robótica: el brazo izquierdo de un robot XLeRobot debe recoger una botella de la mesa y colocarla sobre una alfombrilla verde, todo ello en simulación ManiSkill. El autor, madokalif, ha entrenado el modelo en dos etapas: primero con una escena fija y después con domain randomization para mejorar la robustez. Este checkpoint es relevante porque demuestra cómo adaptar un VLA general a una tarea concreta con relativamente pocos datos (1536 episodios en total) y porque incluye soporte opcional para real-time chunking (RTC), una técnica que mitiga la latencia de inferencia en control en bucle cerrado.

La arquitectura se basa en el modelo π₀.₅, que combina un transformer multimodal con módulos LoRA sobre los componentes de lenguaje (Gemma-2B y Gemma-300M). El repositorio pesa 415 GB e incluye checkpoints de Orbax con los pesos del modelo y los estados del optimizador. La licencia es Gemma, lo que impone ciertas restricciones de uso. El modelo está orientado exclusivamente a simulación; no se ha validado en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0 (VLA) con LoRA sobre Gemma-2B y Gemma-300M (config `Pi0Config(pi05=True)`) |
| Parametros totales | no disponible (modelo base pi05_base, fine-tune LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision-lenguaje-accion, sin especificacion de idiomas) |
| Licencia | gemma |
| Formato de pesos | orbax checkpoint (directorios `params/` y `train_state/`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA de `pi05_base`, la version ligera del VLA pi0 de Physical Intelligence. La arquitectura base combina un codificador de vision, un modelo de lenguaje (Gemma) y un decodificador de acciones; en este caso se aplican adaptadores LoRA sobre los componentes de lenguaje (Gemma-2B y Gemma-300M). El entrenamiento se realizo con FSDP en dos GPUs RTX 3090, con batch size 32 y una tasa de aprendizaje pico de 5e-5 con decaimiento coseno hasta 5e-6. La primera etapa (escena fija) se detuvo en 33 000 pasos; la segunda (domain randomization) partio de esos pesos y corrio 12 000 pasos adicionales con un estado de optimizador nuevo, ya que el dataset y las estadisticas de normalizacion difieren.

Los datos de entrenamiento consisten en 1024 episodios de demostraciones generadas con IK scripted en ManiSkill para la etapa 1, y 512 episodios adicionales con aleatorizacion de dominio (altura de mesa entre 0.760 y 0.860 m, iluminacion variable, fondos, paredes, suelo y clutter, asi como perturbaciones en la pose y FOV de las camaras). Las observaciones incluyen camara de cabeza y camara de muñeca a 224x224, junto con el estado del brazo (6 articulaciones en radianes absolutos). La politica predice acciones con un horizonte de 10 pasos. El prompt utilizado es "put the bottle on the green pad".

## Capacidades

- Control de manipulacion robotica en simulacion: pick-and-place de una botella sobre una alfombrilla verde, con el brazo izquierdo de un XLeRobot.
- Observaciones multimodales: imagenes de camara de cabeza y muñeca (224x224) y estado articular (6 grados de libertad).
- Generacion de acciones en espacio articular absoluto con horizonte de 10 pasos.
- Soporte opcional de real-time chunking (RTC) mediante un sampler guiado, que repara discontinuidades en las acciones bajo latencia de inferencia real.
- Capacidad de generalizacion limitada a la tarea y configuracion de la escena para la que fue entrenado.
- No incluye capacidades de tool calling, razonamiento conversacional ni procesamiento de lenguaje natural generico; es un modelo de accion visual-lenguaje especializado.

## Casos de uso

- Investigacion en aprendizaje por refuerzo y VLA: permite estudiar el efecto del fine-tuning con LoRA en tareas de manipulacion simulada, comparando con el modelo base pi05_base.
- Desarrollo de politicas de manipulacion con domain randomization: el checkpoint `dr2-step-11999` es adecuado para evaluar robustez frente a variaciones de escena (altura de mesa, iluminacion, fondo).
- Benchmarking de algoritmos de control en bucle cerrado: el servidor de politica websocket incluido permite integrar el modelo en pipelines de evaluacion en simulacion.
- Pruebas de real-time chunking: el sampler RTC disponible en el repositorio sirve para medir el impacto de la latencia en tareas de manipulacion y validar tecnicas de mitigacion.
- Generacion de datos sinteticos para entrenamiento: las demos scripted de ManiSkill pueden reutilizarse para otros fines de investigacion.
- Educacion en robotica y VLA: plataforma de bajo coste (XLeRobot) para experimentar con politicas de manipulacion sin necesidad de hardware fisico.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion en simulacion con `eval_sim.py`, 32 episodios por condicion, en bucle cerrado a traves del servidor de politica websocket. La politica scripted que genero los datos alcanza un 88.9% de exito. Los resultados del modelo son:

| checkpoint | escena | tope de episodios | exito | agarre | elevacion |
| --- | --- | --- | --- | --- | --- |
| `step-33000` (etapa 1) | fija | 280 | 71.9% | - | - |
| `step-33000` (etapa 1) | domain-randomized | 280 | 0% | - | - |
| `dr2-step-7000` | domain-randomized | 280 | 34.4% | 90.6% | 71.9% |
| `dr2-step-11999` | domain-randomized | 280 | 56.2% | 84.4% | 84.4% |
| `dr2-step-11999` | domain-randomized | 400 | 71.9% | 84.4% | 78.1% |
| `dr2-step-11999` | DR, mesa fija a 0.851 m | 280 | 50.0% | 90.6% | 75.0% |
| `dr2-step-11999` | DR, mesa fija a 0.851 m | 400 | 68.8% | 93.8% | 75.0% |

El tope de episodios es critico: las demos scripted promedian 254 pasos y el entorno registra `max_episode_steps=280`, dejando solo 26 pasos de margen. La politica aprendida es mas lenta que la script, por lo que subir el tope a 400 convierte la mayoria de fallos en exitos (la tasa de elevado-pero-no-colocado baja del 28% al 9%). Se recomienda presupuestar al menos 400 pasos en despliegue.

## Requisitos de hardware

- Entrenamiento: 2x RTX 3090 (24 GB cada una) con FSDP, segun la model card.
- Inferencia: ~165 ms por paso en una RTX 3090 sin RTC; ~270 ms con RTC (coste adicional de ~65%).
- VRAM estimada: no especificada, pero se ejecuta en una RTX 3090 de 24 GB, por lo que cabe en GPUs consumer de gama alta.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o similares con al menos 24 GB de VRAM.
- Despliegue: servidor de politica websocket proporcionado por openpi (`serve_policy.py`), con scripts de evaluacion (`eval_sim.py`) y cliente de despliegue (`deploy_client.py`).
- Nota: el control a 30 Hz con horizonte de 10 pasos implica un chunk de 333 ms; si la latencia extremo a extremo se acerca a ese valor, se recomienda reducir la tasa de control o reentrenar con un horizonte mayor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos comparables en la misma tarea (pick-and-place de botella con XLeRobot en ManiSkill). El modelo base `pi05_base` es el punto de partida, pero no se han publicado resultados de evaluacion para esta tarea especifica. Existe otro fine-tune del mismo autor (`madokalif/pi05-robotwin2-clean50-fbc-v2`) para una tarea diferente (RoboTwin), pero no es directamente comparable. Por tanto, la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo exclusivamente de simulacion: no se ha entrenado con datos reales ni se ha completado la tarea en hardware real. La transferencia sim-to-real no esta validada.
- Dependencia critica de la configuracion de la escena: el checkpoint `dr2-*` debe evaluarse con `domain_randomization=True`; usar `--no-dr` desactiva tambien la postura inicial aleatoria del brazo, lo que degrada la tasa de agarre del 91% al 9% (porque el modelo nunca ha visto esa postura).
- Sensibilidad al tope de episodios: la politica es mas lenta que la script; sin un tope adecuado (al menos 400 pasos) muchos episodios terminan en fallo por tiempo agotado.
- Perfil de movimiento brusco: los deltas articulares por paso son irregulares (mediana 0.010 rad, p99 0.25 rad), con un 3-6% de pasos que superan el clamp de `deploy_client.py` (~0.067 rad). Esto puede causar movimientos bruscos en hardware.
- RTC solo ayuda bajo latencia real: en simulacion sin latencia no aporta beneficio y aumenta el tiempo de inferencia.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google; es necesario revisarlos antes de cualquier despliegue en produccion.
- Riesgo de alucinacion o acciones invalidas: no se ha evaluado formalmente; al ser un modelo de control, una accion erronea puede provocar fallos en la tarea, aunque en simulacion no hay riesgo fisico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/madokalif/xlerobot-pi05-bottle
- Modelo base pi05_base en HuggingFace: https://huggingface.co/lerobot/pi05_base
- GitHub XLeRobot: https://github.com/Vector-Wangel/XLeRobot
- Documentacion VLA pi0.5 para XLeRobot: https://xlerobot.readthedocs.io/en/latest/software/getting_started/VLA_pi05.html
- Paper sobre real-time chunking (arXiv:2506.07339): https://arxiv.org/abs/2506.07339
- Repositorio de openpi (referencia): no disponible en la informacion proporcionada
