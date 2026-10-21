# jos0054/rl_course_vizdoom_health_gathering_supreme

## Resumen

`jos0054/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, un escenario de shooter en primera persona en el que el agente debe recoger botiquines mientras esquiva ataques. No es un modelo de lenguaje: no genera texto, no procesa instrucciones y no tiene ventana de contexto en el sentido habitual. Lo publica el usuario `jos0054` como parte de un curso de RL, utilizando Sample-Factory 2.0 como framework de entrenamiento.

Su relevancia es formativa y de investigación: sirve como checkpoint de referencia para reproducir un experimento de RL profundo de principio a fin (entrenamiento, evaluación con `enjoy` y reanudación con `train`) dentro del ecosistema Sample-Factory, que integra el ciclo completo de experimentación con el Hub de HuggingFace. El repositorio ocupa 6,6 GB e incluye los artefactos de entrenamiento, no solo los pesos finales.

La información publicada es mínima: la model card no detalla la arquitectura de la red, el número de parámetros, los hiperparámetros ni la licencia. El único resultado declarado es una recompensa media de 7,81 ± 2,50 en el entorno de entrenamiento, marcada como no verificada. Cualquier uso en producción debería partir de una evaluación independiente y de la aclaración previa de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre Sample-Factory 2.0; la topología de la red (codificador y cabeza de política/valor) no se detalla en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible; al ser RL sobre observaciones visuales, la memoria equivale al historial de frames configurado en el entorno, que no se especifica |
| Tipos de cuantizacion | no disponible; no se publican pesos en formatos de cuantizacion para inferencia tipo GGUF o GPTQ |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no disponible; el repositorio contiene un checkpoint de Sample-Factory de 6,6 GB, sin confirmar safetensors ni otros formatos |

## Arquitectura y entrenamiento

El modelo se entrena con APPO, la variante asíncrona de PPO implementada en Sample-Factory, que combina workers de entorno en paralelo con workers de política y aprendizaje para desacoplar la recolección de experiencia del cálculo de gradientes. El entorno es `doom_health_gathering_supreme`, un escenario de ViZDoom con observaciones visuales en el que la recompensa se obtiene recogiendo objetos de salud; es un problema de control visomotor con horizonte corto y recompensa dispersa.

No se publican datos sobre el número de pasos de entrenamiento, el número de entornos en paralelo, la composición del currículo, el uso de recompensas conformadas, ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se indica el número de semillas ni la varianza entre ejecuciones, más allá de la desviación típica reportada en la métrica. El flujo de trabajo indicado por el autor permite reanudar el entrenamiento desde el checkpoint con `--restart_behavior=resume`, lo que sugiere que el repositorio conserva el estado completo del experimento.

## Capacidades

- Control de un agente en un entorno visual 3D específico (`doom_health_gathering_supreme`) a partir de observaciones de píxeles.
- Política de acción entrenada de extremo a extremo con APPO; no requiere ingeniería de características manual.
- Reanudación del entrenamiento desde el checkpoint publicado, útil para ajuste fino o experimentos de continuación.
- Evaluación reproducible mediante el script `enjoy` de Sample-Factory.
- Integración con el Hub de HuggingFace a través de `sample_factory.huggingface.load_from_hub`.
- Registro de métricas para TensorBoard (etiqueta `tensorboard` en el repositorio).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, visión general ni audio.
- No tiene capacidades multilingües: no hay entrada ni salida en lenguaje natural.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el checkpoint permite a los alumnos ejecutar un agente ya entrenado y comparar curvas de aprendizaje propias contra una referencia funcional, sin esperar horas de entrenamiento.
- Reproducibilidad de experimentos: sirve como punto de partida fijo para comparar cambios de hiperparámetros (learning rate, número de workers, factor de descuento) manteniendo constantes el resto de condiciones.
- Ajuste fino y continuación de entrenamiento: el flujo `--restart_behavior=resume` permite extender el entrenamiento con presupuestos adicionales de pasos y medir si la recompensa media satura.
- Estudio de estabilidad de APPO: la desviación típica de ±2,50 sobre una media de 7,81 permite analizar la varianza del retorno y diseñar experimentos con múltiples semillas.
- Base para transferencia a otros escenarios de ViZDoom: inicializar políticas en `health_gathering` y evaluar la transferencia a mapas o niveles más complejos.
- Pruebas de infraestructura de RL distribuido: validar pipelines de entrenamiento asíncrono, gestión de checkpoints de varios GB y registro de métricas en TensorBoard.
- Demostraciones en vivo de agentes de videojuego: ejecución del agente en modo `enjoy` para visualizar el comportamiento aprendido en charlas o clases.
- Verificación de integración con HuggingFace Hub: ejemplo práctico de descarga, carga y publicación de experimentos de RL usando las utilidades de Sample-Factory.

## Benchmarks y rendimiento

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 7,81 ± 2,50 | No (declarado por el autor) |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay datos de líneas base (agente aleatorio, PPO síncrono u otras variantes) con los que contextualizar el valor de recompensa media, ni se indica el número de episodios de evaluación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el tamaño de la red; el repositorio de 6,6 GB incluye artefactos de entrenamiento y no es un indicador directo del peso del modelo en memoria.
- GPU recomendadas: no disponibles. Al tratarse de un entorno ViZDoom con observaciones visuales, la inferencia en tiempo real se beneficia de una GPU con soporte CUDA, pero no se especifica ningún modelo concreto.
- GPU de consumo: no confirmado. Es plausible que la política quepa en GPUs de consumo media o incluso en CPU, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: scripts `enjoy` y `train` de Sample-Factory; carga desde el Hub con `python -m sample_factory.huggingface.load_from_hub -r jos0054/rl_course_vizdoom_health_gathering_supreme`. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del renderizado del entorno ViZDoom, del número de workers y del hardware, y no se documentan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jos0054/rl_course_vizdoom_health_gathering_supreme` | no disponible | no aplica | 7,81 ± 2,50 de recompensa media en `doom_health_gathering_supreme` (no verificado) | no disponible | HuggingFace Hub, 6,6 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros checkpoints de Sample-Factory para el mismo entorno en el material proporcionado, por lo que no es posible establecer una comparación cuantitativa fiable. Cualquier comparación debería hacerse ejecutando los modelos bajo el mismo número de episodios y las mismas semillas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para un único entorno y una única tarea; no generaliza a otros escenarios sin reentrenamiento o transferencia.
- Licencia no declarada: sin licencia explícita, no se puede asumir permiso para uso comercial ni para redistribución modificada. Es un bloqueo potencial para cualquier despliegue en producción.
- Métrica no verificada: el valor de recompensa media lo declara el autor y está marcado como `verified: false`; no hay evidencia independiente ni descripción del protocolo de evaluación.
- Varianza alta: una desviación típica de 2,50 sobre una media de 7,81 implica una dispersión considerable del retorno entre episodios; el rendimiento en un episodio concreto puede desviarse mucho de la media.
- Ausencia de datos de entrenamiento: sin número de pasos, semillas ni hiperparámetros, la reproducibilidad exacta del resultado no está garantizada.
- Riesgo de sobreajuste al escenario: el agente puede explotar particularidades del mapa o de la configuración de recompensa en lugar de aprender una estrategia robusta.
- Sin evaluación de seguridad ni de sesgos: al no tratar lenguaje ni datos personales, los riesgos típicos de sesgo lingüístico no aplican, pero tampoco se ha auditado el comportamiento del agente fuera de distribución.
- Tamaño del repositorio: 6,6 GB dificultan la descarga y el versionado en entornos con ancho de banda o almacenamiento limitados.
- Sin soporte de lenguaje natural: no puede utilizarse como asistente conversacional, para generación de código ni para tareas de comprensión de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jos0054/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con HuggingFace: https://www.samplefactory.dev/10-huggingface/huggingface/
