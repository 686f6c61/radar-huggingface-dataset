# harkrishkali/ppo-doom_health_gathering_supreme

## Resumen

Este repositorio contiene una política de aprendizaje por refuerzo profundo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el escenario `doom_health_gathering_supreme` de ViZDoom, un entorno de disparos en primera persona en 3D donde el agente debe recoger bidones de salud y sobrevivir el mayor tiempo posible. Lo publica el usuario de Hugging Face `harkrishkali` dentro de la librería Sample-Factory 2.0, el framework de RL de Alex Petrenko, y forma parte de la familia de modelos que la comunidad genera al completar la unidad 8 del curso Deep Reinforcement Learning de Hugging Face.

No se trata de un modelo de lenguaje: no procesa ni genera texto, no tiene ventana de contexto ni parámetros en el sentido habitual de un transformer. Es un checkpoint de política y función de valor que consume observaciones del entorno (píxeles y variables de estado del motor ViZDoom) y emite acciones discretas. Su relevancia es, por tanto, académica y experimental: sirve como referencia reproducible para comparar algoritmos de RL, para estudiar exploración con recompensas dispersas y como punto de partida para reentrenamiento o ajuste fino.

La información publicada es mínima: la model card se limita a las instrucciones de descarga, ejecución y reanudación del entrenamiento, y el repositorio aparece con un tamaño de 0.0 GB, sin licencia declarada, sin idiomas y sin métricas verificadas. El único dato cuantitativo es la recompensa media declarada (9.85 ± 4.44) sobre el propio entorno de entrenamiento, marcada como no verificada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el model-index declara el algoritmo APPO (Asynchronous Proximal Policy Optimization) ejecutado con Sample-Factory 2.0 sobre ViZDoom |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB y no se publica recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera por episodios del escenario, con horizonte definido por el entorno) |
| Tipos de cuantizacion | no disponible (checkpoint de PyTorch/Sample-Factory; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Sample-Factory (state dict de PyTorch), descargable con `sample_factory.huggingface.load_from_hub` |

## Arquitectura y entrenamiento

El model-index del repositorio identifica el algoritmo como APPO, la implementación asíncrona de PPO que constituye el núcleo de Sample-Factory. APPO combina varios workers de entorno que generan rollouts en paralelo con un bucle de optimización que aplica actualizaciones con recorte de la ratio de política (clipping), lo que permite escalar el entrenamiento a millones de pasos de entorno con una estabilidad razonable. La model card no detalla ni el tamaño ni la topología de la red (número de capas convolucionales, presencia de capa recurrente, dimensión de las capas densas), por lo que la arquitectura interna concreta debe considerarse no disponible.

El entrenamiento se realizó sobre el escenario `health_gathering_supreme.cfg` de ViZDoom, una variante de dificultad alta del escenario de recogida de salud: el agente recibe recompensa al recoger bidones y penalización al morir, con aparición aleatoria de los objetos, lo que produce una señal de recompensa dispersa y exige exploración. No hay información sobre el número total de pasos de entorno, la composición del buffer, ni sobre el uso de técnicas adicionales de RLHF, DPO, imitación o currículum; tampoco sobre semillas, número de réplicas o presupuesto de cómputo. La única cifra declarada por el autor es la recompensa media final de 9.85 con desviación típica de 4.44.

## Capacidades

- Control de un agente en un entorno 3D de ViZDoom (`doom_health_gathering_supreme`): percepción visual del escenario y emisión de acciones discretas de movimiento y disparo.
- Aprendizaje de política y función de valor mediante APPO, con capacidad de reanudar el entrenamiento desde el checkpoint (`--restart_behavior=resume`).
- Soporte de entrenamiento distribuido a través de Sample-Factory 2.0, con workers paralelos de entorno.
- Compatibilidad con el flujo de Hugging Face Hub de Sample-Factory: descarga, publicación con `--push_to_hub` y reentrenamiento.
- Capacidad de servir como política congelada para evaluación (`enjoy`) y para generar rollouts reproducibles.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües, visión general fuera del motor ViZDoom, audio ni modo de razonamiento explícito.

## Casos de uso

- Docencia en cursos de aprendizaje por refuerzo profundo: el modelo sirve como artefacto de referencia para la unidad 8 del curso Deep RL de Hugging Face, donde el alumnado debe superar un umbral de recompensa (media menos desviación >= 5) y publicar su propio modelo; este checkpoint permite comparar resultados propios contra una política ya entrenada.
- Línea base para comparación de algoritmos: al ser un resultado APPO declarado sobre `doom_health_gathering_supreme`, permite contrastar variantes como PPO síncrono, R2D2 o IMPALA manteniendo fijo el entorno y la métrica de recompensa media.
- Estudio de exploración con recompensa dispersa: el escenario exige localizar bidones con aparición aleatoria, de modo que el modelo sirve para analizar curvas de aprendizaje, entropía de la política y estrategias emergentes de búsqueda.
- Punto de partida para reentrenamiento o ajuste fino: las instrucciones de la model card permiten reanudar el entrenamiento (`--train_for_env_steps`) y continuar la optimización, útil para experimentos de currículum o de transferencia entre escenarios de ViZDoom.
- Validación de infraestructura de RL: el flujo de descarga, ejecución y publicación con Sample-Factory convierte el modelo en una prueba funcional para verificar instalaciones, versiones de PyTorch, renderizado de ViZDoom y conectividad con el Hub.
- Demostraciones y visualización de políticas: mediante el script `enjoy` se puede reproducir el comportamiento del agente y grabar episodios para materiales docentes o divulgativos.
- Pruebas de estrés de entornos de evaluación: al tener una desviación típica elevada, es útil para medir la varianza de los protocolos de evaluación y calibrar cuántos episodios son necesarios para obtener estimaciones estables.

## Benchmarks y rendimiento

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 9.85 +/- 4.44 | no |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) porque el modelo no es un modelo de lenguaje ni un modelo multimodal generalista.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita; al tratarse de una política de RL de tamaño reducido, la inferencia es viable incluso en CPU, y el cuello de botella habitual es el renderizado del motor ViZDoom más que la memoria de GPU.
- GPU recomendadas: no especificadas en la model card; cualquier GPU con soporte CUDA y suficiente para el rollout (por ejemplo, RTX 3060 o superior) es suficiente para ejecutar la política; para entrenamiento APPO con muchos workers de entorno se recomienda una GPU dedicada y CPU con varios núcleos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna, dado el tamaño del repositorio (0.0 GB) y la naturaleza del entorno; no se publican requisitos exactos.
- Opciones de despliegue: exclusivamente Sample-Factory 2.0 (scripts `enjoy` y `train`) sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. El rendimiento práctico depende de los FPS de simulación de ViZDoom y del número de workers de entorno, no de la latencia de generación de tokens.

## Comparativa con modelos similares

| Modelo | Algoritmo declarado | Entorno | Metrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| harkrishkali/ppo-doom_health_gathering_supreme | APPO (segun model-index) | doom_health_gathering_supreme | mean_reward 9.85 +/- 4.44 (no verificado) | no disponible | repositorio de 0.0 GB en Hugging Face |
| KrishBakshi/ppo_vizdoom_health_gathering_supreme | PPO (por el nombre del repositorio) | doom_health_gathering_supreme | no disponible | no disponible | Hugging Face |
| dhanushh011/doom_health_gathering_supreme-unit8-pii | no disponible | doom_health_gathering_supreme | no disponible | no disponible | Hugging Face |
| viswa752/rl_course_vizdoom_health_gathering_supreme | APPO (referenciado en la propia model card) | doom_health_gathering_supreme | no disponible | no disponible | Hugging Face |

La comparacion cuantitativa no es posible con la informacion disponible: solo el modelo analizado publica una metrica, y esta figura como no verificada. Todos los modelos comparables pertenecen al mismo ecosistema de la unidad 8 del curso de RL y comparten entorno y framework.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso, por lo que no puede asumirse permiso para uso comercial ni redistribución.
- Repositorio con tamaño de 0.0 GB: no se confirma que los pesos estén efectivamente presentes en el Hub; la descarga podría devolver un artefacto vacío o incompleto.
- Metrica no verificada: el valor 9.85 +/- 4.44 está marcado con `verified: false` y procede únicamente del autor.
- Varianza elevada: la desviación típica (4.44) equivale aproximadamente al 45 por ciento de la media, de modo que una ejecución individual puede caer muy por debajo del valor declarado; se necesitan múltiples episodios y semillas para estimaciones fiables.
- Especialización extrema: la política está entrenada para un único escenario de ViZDoom y no se espera transferencia directa a otros entornos, tareas o dominios visuales sin reentrenamiento.
- Ausencia de capacidades de lenguaje: no genera texto, no razona en lenguaje natural, no soporta tool calling ni agentes basados en instrucciones.
- Sesgos: pueden aparecer sesgos inducidos por el diseño del escenario (distribuciones de aparición de objetos, dinámica de recompensa) y por el uso de un único entorno de entrenamiento; no hay auditoría publicada.
- Riesgo de sobreajuste a la configuración del entorno: cambios en la versión de ViZDoom, en la resolución de observación o en los parámetros de `health_gathering_supreme.cfg` pueden degradar el comportamiento de forma no documentada.
- Instrucciones de la model card inconsistentes: los comandos de descarga y entrenamiento hacen referencia a otro espacio de nombres (`viswa752/rl_course_vizdoom_health_gathering_supreme`) y a rutas de módulo genéricas (`<path.to.enjoy.module>`), por lo que requieren adaptación manual.
- Caveat para producción: no hay información sobre determinismo, semillas, número de pasos de entrenamiento ni entorno de ejecución exacto, lo que dificulta la reproducibilidad estricta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harkrishkali/ppo-doom_health_gathering_supreme
- Sample-Factory (repositorio): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face en Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/
- Escenario ViZDoom `health_gathering_supreme.cfg`: https://github.com/Farama-Foundation/ViZDoom/blob/main/scenarios/health_gathering_supreme.cfg
- Cuaderno de la unidad 8 del curso Deep RL (Hugging Face): https://colab.research.google.com/github/huggingface/deep-rl-class/blob/master/notebooks/unit8/unit8_part2.ipynb
- Modelo comunitario relacionado (KrishBakshi): https://huggingface.co/KrishBakshi/ppo_vizdoom_health_gathering_supreme
- Modelo comunitario relacionado (dhanushh011): https://huggingface.co/dhanushh011/doom_health_gathering_supreme-unit8-pii
- Repositorio comunitario relacionado (HusseinEid101): https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
