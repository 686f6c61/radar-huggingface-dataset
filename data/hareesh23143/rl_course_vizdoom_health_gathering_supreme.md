# hareesh23143/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `hareesh23143/rl_course_vizdoom_health_gathering_supreme` no es un modelo de lenguaje, sino una política de aprendizaje por refuerzo profundo (deep RL) entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, dentro del ecosistema Sample Factory. El autor del repositorio es el usuario de HuggingFace `hareesh23143`, y el artefacto ocupa 0,1 GB, lo que corresponde a un checkpoint de una red neuronal relativamente pequena orientada a control a partir de píxeles.

El problema que resuelve es el de un agente que debe navegar un escenario 3D en primera persona de Doom, recoger botiquines de salud para sobrevivir el mayor tiempo posible y evitar morir por acumulación de dano. El resultado declarado por el autor en la model card es una recompensa media de 67,00 +/- 5,00 en el conjunto de evaluación del propio entorno, con la métrica marcada como no verificada (`verified: false`), es decir, no auditada de forma independiente por HuggingFace.

Su relevancia es fundamentalmente educativa y de investigación: se trata de una copia de un modelo base distribuido como material de un curso de reinforcement learning (existen subidas equivalentes con el mismo nombre en las cuentas `nomad-ai`, `Ryukijano` y `suseend`, y repos espejo en GitHub como el de `HusseinEid101`). No es un modelo pensado para producción ni para tareas de generación de texto, y su valor está en servir como línea base reproducible para comparar algoritmos, ajustar hiperparámetros o practicar transferencia a otros escenarios de ViZDoom.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (política neuronal entrenada con APPO sobre Sample Factory; la model card no detalla la topología de la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (agente de RL que consume observaciones por fotograma; la model card no especifica el apilado de frames) |
| Tipos de cuantizacion | No disponible; no aplica en el sentido habitual de los modelos de lenguaje |
| Idiomas soportados | No aplica (no procesa lenguaje natural; observaciones visuales del entorno ViZDoom) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio Sample Factory de 0,1 GB; habitualmente checkpoints de PyTorch, sin confirmar en la información) |

Metadatos adicionales del repositorio: pipeline `reinforcement-learning`, librería `sample-factory`, descargas 0 y likes 0 en el momento de la consulta, creación registrada el 2026-09-30 y actualización el 2026-09-30 (fechas tal como aparecen en la ficha de HuggingFace).

## Arquitectura y entrenamiento

La model card indica únicamente que se trata de un agente APPO entrenado con Sample Factory para el entorno `doom_health_gathering_supreme`. APPO es una variante asíncrona de PPO en la que varios workers recolectan experiencia en paralelo mientras el Learner actualiza los pesos de forma desacoplada, lo que permite un throughput alto en entornos con renderizado 3D costoso como ViZDoom. Sample Factory implementa esta arquitectura con un modelo de política compartido entre actor y crítico, típicamente un encoder convolucional que procesa observaciones de píxeles seguido de capas densas para las cabezas de política y valor; sin embargo, la model card no confirma la topología concreta, el número de capas, el tamaño de las representaciones ni la resolución de entrada.

Tampoco se especifican en la información disponible el número total de pasos de entorno, la composición del dataset (en RL no hay dataset estático, sino experiencia generada por el propio agente), la presencia de mecanismos de reward shaping, el uso de curvas de aprendizaje, ni si se aplicaron técnicas adicionales como normalización de recompensas, aumentación de observaciones o ajuste de hiperparámetros más allá de los valores por defecto de Sample Factory para este entorno. El README sí menciona que el entrenamiento puede reanudarse con el script de `train` correspondiente al entorno, ajustando `--train_for_env_steps` a un valor suficientemente alto, ya que la reanudación arranca en el número de pasos en el que concluyó el experimento original.

## Capacidades

- Control de un agente en un entorno 3D en primera persona a partir de observaciones visuales (píxeles) de ViZDoom.
- Política de navegación y supervivencia específica para `doom_health_gathering_supreme`: moverse por el mapa para localizar y recoger botiquines de salud.
- Gestión de una recompensa basada en el mantenimiento de la salud a lo largo del episodio, lo que implica decisiones de movimiento a corto y medio plazo.
- Reanudación del entrenamiento desde el checkpoint publicado mediante los scripts de Sample Factory.
- No dispone de soporte de tool calling, function calling ni uso de agentes con herramientas: es una política de RL, no un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto, razonamiento simbólico, código o matemáticas.
- No se documentan modos especiales (thinking mode, visión descriptiva, audio) más allá del procesamiento de observaciones visuales del propio entorno.

## Casos de uso

- Línea base reproducible en investigación de RL: el checkpoint permite fijar una referencia de recompensa media (67,00 +/- 5,00) contra la que comparar variantes de algoritmo, cambios de hiperparámetros o modificaciones del entorno, sin tener que reentrenar desde cero.
- Docencia y cursos de deep RL: sirve como ejemplo completo del flujo de trabajo de Sample Factory (entrenamiento, evaluación, reanudación y publicación en HuggingFace) para que el alumnado inspeccione checkpoints y curvas de TensorBoard reales.
- Transferencia a otros escenarios de ViZDoom: el agente puede usarse como inicialización para escenarios relacionados (por ejemplo, `doom_deathmatch` o `doom_defend_the_center`) y medir cuánto acelera el fine-tuning frente a un arranque aleatorio.
- Estudio de robustez y generalización: evaluar el agente con semillas, configuraciones de mapa o parámetros de dano distintos para cuantificar la varianza de la política y su sensibilidad al entorno.
- Pruebas de throughput de frameworks: dado que ViZDoom es un entorno con renderizado 3D, este agente sirve para medir la escalabilidad de Sample Factory en configuraciones multiproceso y comparar con otras librerías de RL.
- Integración en pipelines de evaluación automatizada: al ser un checkpoint pequeño (0,1 GB) y autocontenido, encaja en un job de CI que lance N episodios, calcule la recompensa media y falle el build si cae por debajo de un umbral definido.
- Experimentos de imitación o extracción de políticas: usar las trayectorias generadas por este agente como datos de demostración para entrenar políticas con imitation learning o para estudiar destilación a redes más pequeñas.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (marcados como no verificados):

| Algoritmo | Tarea | Dataset / entorno | Métrica | Valor |
|---|---|---|---|---|
| APPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 67,00 +/- 5,00 (verified: false) |

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparación con PPO síncrono, R2D2 u otros algoritmos sobre el mismo entorno) en la información disponible. El valor de recompensa debe interpretarse con cautela: procede del propio autor, no está verificado y no se especifican el número de episodios, la semilla ni las condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere una red de tamaño reducido, pero la model card no publica el número de parámetros ni el consumo real.
- GPU recomendadas: no disponibles en la información proporcionada. Al tratarse de una política convolucional pequeña, cualquier GPU con soporte CUDA (incluidas gamas consumer como las RTX 3060 o superiores) debería ser suficiente para inferencia, si bien esto no está confirmado por el autor.
- Viabilidad en GPU consumer: probablemente sí por el tamaño del artefacto, pero no confirmado; la evaluación en CPU también es plausible para un número moderado de episodios, a costa de menor throughput.
- Opciones de despliegue: el stack natural es Sample Factory (scripts `train` y `enjoy` del repositorio), con ViZDoom como entorno. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de RL.
- Latencia y throughput estimados: no disponibles. Dependen del número de workers, de la GPU, de la resolución de renderizado de ViZDoom y de la configuración de APPO, ninguno de los cuales se especifica.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hareesh23143/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO | 67,00 +/- 5,00 (no verificado) | no disponible | HuggingFace |
| nomad-ai/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO | no disponible | no disponible | HuggingFace |
| Ryukijano/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO | no disponible | no disponible | HuggingFace |
| suseend/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO | no disponible | no disponible | HuggingFace (indexado) |

Las alternativas encontradas son réplicas del mismo material de curso, con el mismo nombre de repositorio y el mismo algoritmo declarado, por lo que la comparación se limita a la disponibilidad y a los metadatos publicados. No se han encontrado en la búsqueda modelos con arquitectura o licencia distintas que permitan una comparación técnica más rica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. En RL, el comportamiento del agente queda determinado por la función de recompensa del entorno, lo que puede producir políticas que exploten atajos no previstos por el diseñador.
- Riesgo de sobreajuste al entorno: el agente está entrenado específicamente para `doom_health_gathering_supreme`; su comportamiento fuera de ese escenario, o incluso con variaciones de configuración del mismo, no está garantizado ni evaluado.
- Métrica no verificada: el valor de 67,00 +/- 5,00 procede del autor y está marcado como `verified: false`; no hay evidencia de auditoría independiente ni de condiciones de evaluación detalladas.
- Ausencia de licencia declarada: al no especificarse licencia en el repositorio, no se puede asumir permiso para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso fuera del ámbito educativo o de investigación.
- Idiomas: no aplica. Cualquier expectativa de uso como modelo de lenguaje, asistente conversacional o generador de código es incorrecta.
- Reproducibilidad: al no publicarse hiperparámetros, número de pasos, semillas ni la topología de red, reproducir exactamente el resultado declarado es inviable con la información disponible.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, y fechas de creación y actualización registradas con segundos de diferencia, lo que indica una subida automática o de prueba sin mantenimiento posterior.
- Caveat de producción: no es un artefacto apto para producción; su uso razonable es educativo, experimental o como línea base de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hareesh23143/rl_course_vizdoom_health_gathering_supreme
- Réplica en HuggingFace (nomad-ai): https://huggingface.co/nomad-ai/rl_course_vizdoom_health_gathering_supreme
- Réplica en HuggingFace (Ryukijano): https://huggingface.co/Ryukijano/rl_course_vizdoom_health_gathering_supreme
- Repositorio espejo en GitHub (HusseinEid101): https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
- README del repositorio espejo: https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-/blob/main/README.md
- Ficha indexada del modelo (essamamdani.com): https://essamamdani.com/ai-models/hf-suseend-rl-course-vizdoom-health-gathering-supreme
