# muaibinrah/rl_course_vizdoom_health_gathering_supreme

## Resumen

`muaibinrah/rl_course_vizdoom_health_gathering_supreme` es una política de aprendizaje por refuerzo profundo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el escenario `health_gathering_supreme` del entorno ViZDoom. No se trata de un modelo de lenguaje: es un agente que aprende una política de control a partir de observaciones visuales del juego (búfer de píxeles) y que debe recolectar botiquines mientras su salud decae de forma continua, lo que le obliga a moverse de forma eficiente y a no quedarse sin vida.

El modelo fue entrenado con Sample-Factory 2.0, el framework de RL asíncrono desarrollado por Alex Petrenko, y se publica en Hugging Face Hub con el formato de checkpoints propio de dicha librería. La model card únicamente declara el algoritmo, el entorno y una recompensa media de 4,70 ± 0,52; no se documentan número de parámetros, arquitectura concreta del codificador, número de pasos de entorno ni licencia.

Su relevancia es eminentemente didáctica y de investigación: sirve como referencia reproducible para cursos de RL, para comparar APPO frente a otras implementaciones de PPO en ViZDoom y como punto de partida para reentrenamiento o transferencia. El repositorio ocupa 0,1 GB, no tiene descargas ni «likes» y fue creado el 13 de octubre de 2026, por lo que se trata de un artefacto reciente y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization), esquema actor-crítico; el codificador concreto (CNN sobre píxeles y posible capa recurrente) no se detalla en la model card |
| Parametros totales | no disponible |
| Parametros activos | no procede (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de lenguaje; el horizonte efectivo depende de la memoria recurrente y de la configuración, no documentada) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; solo checkpoints de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la entrada son observaciones de píxeles de ViZDoom) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de Sample-Factory (PyTorch) |
| Algoritmo declarado | APPO |
| Entorno de entrenamiento | `doom_health_gathering_supreme` (ViZDoom) |
| Framework | Sample-Factory 2.0 |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

APPO es la variante asíncrona de PPO implementada en Sample-Factory: varios «workers» recogen experiencia en entornos paralelos mientras un proceso de aprendizaje consume lotes de datos de forma desacoplada, lo que permite un uso intensivo de GPU y una recolección de muestras muy superior a la de PPO síncrono. La pérdida combina el objetivo PPO con corrección por desfase entre la política que generó los datos y la política actual (truncated importance sampling), tal y como se describe en el artículo de Sample-Factory (Petrenko et al., 2020). Para entradas visuales, el framework utiliza por defecto un codificador convolucional seguido de una capa recurrente que aporta memoria a la política, aunque la model card no especifica qué configuración exacta se empleó en este caso.

Los «datos de entrenamiento» son exclusivamente rollouts generados por el propio agente en el entorno ViZDoom `health_gathering_supreme`: el agente percibe fotogramas del juego, emite acciones discretas de movimiento y recibe recompensa por mantenerse con vida y recoger botiquines, penalizando implícitamente la muerte. No hay dataset supervisado, ni fases de RLHF o DPO (no aplicables), ni se documentan el número total de pasos de entorno, el número de réplicas, las semillas ni el presupuesto de cómputo utilizado.

## Capacidades

- Control de agente a partir de píxeles: la política mapea observaciones visuales de ViZDoom a acciones discretas de movimiento.
- Navegación y supervivencia: aprende a desplazarse por el mapa para localizar botiquines antes de que la salud se agote en la variante «supreme», la más exigente de `health_gathering`.
- Memoria temporal: al emplear Sample-Factory, la política puede incorporar una capa recurrente que le permite integrar información de fotogramas anteriores, si bien la configuración no se detalla.
- Reentrenamiento y ajuste fino: al ser un checkpoint de Sample-Factory, puede reanudarse el entrenamiento con `--restart_behavior=resume`.
- Evaluación cualitativa: reproducible mediante el script `enjoy` del framework, lo que permite inspeccionar la política de forma interactiva.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni flujos de agentes tipo LLM.
- No tiene capacidades multilingües: no procesa texto.
- Capacidad especial: se limita al dominio concreto de ViZDoom; no hay modo «thinking», audio ni multimodalidad en sentido estricto.

## Casos de uso

- Docencia en cursos de aprendizaje por refuerzo: sirve como ejemplo ejecutable de un entrenamiento APPO completo sobre un entorno visual clásico, con instrucciones de descarga y evaluación listas para el aula.
- Baseline para comparación de algoritmos: al declarar una recompensa media concreta (4,70 ± 0,52), permite contrastar APPO frente a PPO síncrono, A2C u otras variantes sobre el mismo escenario y la misma función de recompensa.
- Reproducción de experimentos con Sample-Factory 2.0: útil para verificar instalaciones, versiones de ViZDoom y flujos de carga desde el Hub (`python -m sample_factory.huggingface.load_from_hub`).
- Ajuste fino y continuación de entrenamiento: partiendo del checkpoint se puede reanudar el entrenamiento con más pasos de entorno para estudiar curvas de aprendizaje o probar currículos.
- Estudio de hiperparámetros: usar el modelo como punto de partida fijo y variar la arquitectura del codificador, el coeficiente de entropía o el horizonte de memoria para medir su impacto en la recompensa.
- Transferencia a otros escenarios de ViZDoom: el codificador visual preentrenado puede servir de inicialización para escenarios relacionados (por ejemplo, otras tareas de navegación con píxeles), reduciendo el coste de entrenamiento desde cero.
- Análisis de robustez y generalización: evaluar cómo se degrada la política ante cambios en la resolución de entrada, en la frecuencia de aparición de botiquines o ante pequeñas perturbaciones visuales.
- Demostraciones interactivas: ejecutar el script `enjoy` en talleres o charlas para visualizar en tiempo real el comportamiento de una política entrenada con RL asíncrono.

## Benchmarks y rendimiento

| Modelo / algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | `doom_health_gathering_supreme` | mean_reward | 4,70 ± 0,52 | No (dato declarado por el autor) |

No se han publicado en la información disponible resultados comparativos adicionales (por ejemplo, MMLU, HumanEval o GSM8K no son aplicables a este tipo de modelo). Tampoco se documentan curvas de aprendizaje, número de pasos hasta convergencia ni métricas de episodios alternativas, por lo que no es posible contextualizar el valor de 4,70 ± 0,52 frente a otros agentes sin ejecutar una evaluación propia con la misma configuración de recompensa.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB (el repositorio completo ocupa 0,1 GB, lo que incluye checkpoints y posibles artefactos de entrenamiento).
- GPU recomendadas: cualquier GPU con soporte CUDA para entrenamiento (RTX 3060, RTX 4090, A100, H100); para inferencia basta con CPU, ya que la política es de tamaño reducido.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en tarjetas integradas para evaluación.
- Opciones de despliegue: scripts `enjoy` y `train` de Sample-Factory dentro de un entorno Python con PyTorch y ViZDoom instalados. No es compatible con vLLM, TGI, llama.cpp, Ollama ni otras herramientas orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponible; dependen del entorno ViZDoom, de la resolución de observación y de si se ejecuta en CPU o GPU.
- Requisitos adicionales: ViZDoom y sus dependencias nativas (por ejemplo, bibliotecas gráficas) deben estar correctamente instalados, ya que el checkpoint no incluye el entorno.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Media de recompensa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `muaibinrah/rl_course_vizdoom_health_gathering_supreme` | APPO (Sample-Factory 2.0) | `doom_health_gathering_supreme` | 4,70 ± 0,52 (no verificado) | no disponible | Hugging Face Hub, 0 descargas |
| Otros checkpoints de la comunidad Sample-Factory para ViZDoom | APPO / PPO | escenarios ViZDoom | no disponible | variable (a menudo no disponible) | Hugging Face Hub |
| Implementaciones de PPO de terceros (CleanRL, Stable-Baselines3) | PPO | ViZDoom `health_gathering_supreme` | no disponible | MIT / Apache-2.0 según proyecto | GitHub, sin pesos preentrenados asociados |

No se dispone de cifras homogéneas para establecer una comparación cuantitativa fiable con alternativas. Cualquier comparación debería realizarse bajo la misma versión de ViZDoom, la misma configuración de observaciones y la misma función de recompensa, condiciones que la model card no detalla.

## Limitaciones y advertencias

- La métrica de recompensa declarada no está verificada (`verified: false`) y no se documenta el protocolo de evaluación, el número de episodios ni la desviación sobre semillas.
- El repositorio acumula 0 descargas y 0 «likes», por lo que no ha pasado por ninguna validación independiente de la comunidad.
- No se especifica licencia: el uso comercial queda jurídicamente indeterminado y requiere contactar con el autor.
- Es una política específica de un único escenario; no generaliza a tareas distintas sin reentrenamiento ni transferencia.
- La reproducibilidad depende de la versión exacta de ViZDoom, de la resolución y del preprocesado de observaciones, del apilado de fotogramas y de la configuración de recompensa, ninguno de los cuales se detalla.
- No se documentan el número de parámetros, la arquitectura exacta, el número de pasos de entrenamiento ni las semillas, lo que dificulta auditar el resultado.
- Ausencia total de capacidades de lenguaje, tool calling o razonamiento simbólico: no debe integrarse en pipelines de texto.
- Riesgo de comportamiento degenerado fuera de la distribución de entrenamiento (por ejemplo, ante cambios en el mapa o en la dinámica de salud), sin garantías de seguridad ni de robustez.
- El escenario `health_gathering_supreme` está diseñado para ser difícil; una recompensa media baja no implica necesariamente un fallo del entrenamiento, pero tampoco puede interpretarse sin una referencia.
- El repositorio se creó y actualizó con cinco segundos de diferencia, lo que sugiere una subida automatizada sin revisión manual posterior.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces encontrados trataban sobre temáticas sin relación y se han descartado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muaibinrah/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Documentación de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
- Artículo de Sample-Factory (Petrenko et al., «Sample Factory: Egocentric 3D Control from Pixels at 100000 FPS with Asynchronous Reinforcement Learning»): https://arxiv.org/abs/2006.11751
- ViZDoom (entorno de entrenamiento): https://github.com/Farama-Foundation/ViZDoom

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo; no se han podido añadir enlaces adicionales de papers, blogs o demos específicos.
