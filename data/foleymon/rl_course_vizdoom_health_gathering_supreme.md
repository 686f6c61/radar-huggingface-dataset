# foleymon/rl_course_vizdoom_health_gathering_supreme

## Resumen
Este repositorio contiene una politica de aprendizaje por refuerzo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, un escenario de referencia clasico en la investigacion en RL. Lo publica el usuario `foleymon` como material de un curso de aprendizaje por refuerzo, y se distribuye a traves de la libreria Sample-Factory 2.0, el framework de RL asincrono desarrollado por Alex Petrenko.

No se trata de un modelo de lenguaje ni de un modelo generativo: es un agente neuronal que aprende una politica de control a partir de observaciones visuales del juego Doom. El problema que resuelve es el de navegar por un escenario recogiendo botiquines para maximizar la salud restante, una tarea que combina percepcion visual, navegacion y gestion de recursos bajo una recompensa dispersa.

Su relevancia es fundamentalmente didactica y de reproducibilidad: permite descargar, ejecutar y reanudar el entrenamiento de un agente APPO con comandos estandarizados de Sample-Factory, lo que facilita comparar resultados y experimentar con hiperparametros. El repositorio ocupa aproximadamente 0,1 GB y no incluye informacion sobre licencia, idiomas ni arquitectura de red en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica neuronal para RL; entrenada con APPO sobre observaciones de ViZDoom) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el agente opera sobre observaciones por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints de Sample-Factory; repositorio de 0,1 GB) |

## Arquitectura y entrenamiento
El agente se entrena con APPO, la variante asincrona de PPO implementada en Sample-Factory 2.0, que desacopla los workers de recogida de experiencia de los de calculo de gradientes mediante colas y politicas retrasadas. La entrada son observaciones visuales del entorno ViZDoom `health_gathering_supreme`, y la salida es una distribucion de acciones discretas (movimiento y giro). La model card no detalla la topologia exacta de la red (capas convolucionales, tamano de las capas recurrentes ni numero de parametros).

No se especifican en la informacion disponible el numero de pasos de entrenamiento, la composicion del dataset (al ser RL, la experiencia se genera por interaccion), ni si se aplicaron tecnicas adicionales como recompensas conformadas o curriculum. El flujo de trabajo documentado permite reanudar el entrenamiento con `--restart_behavior=resume` y un `--train_for_env_steps` suficientemente alto, lo que sugiere que el checkpoint conserva el estado del optimizador y del contador de pasos.

## Capacidades
- Control de agente en el entorno ViZDoom `health_gathering_supreme`: seleccion de acciones de movimiento y giro a partir de observaciones visuales.
- Percepcion visual directa sobre fotogramas del juego, sin extractores de caracteristicas externos.
- Politica entrenada de forma asincrona con APPO, adecuada para entornos con alto coste de simulacion.
- Reanudacion del entrenamiento desde el checkpoint publicado mediante Sample-Factory.
- Evaluacion reproducible con el script `enjoy` de Sample-Factory.
- No soporta tool calling, function calling, agentes multi-paso, generacion de texto, codigo, matematicas ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni ninguna capacidad generativa.

## Casos de uso
- Docencia en cursos de aprendizaje por refuerzo: sirve como punto de partida para que los alumnos ejecuten un agente entrenado, inspeccionen su comportamiento y comparen curvas de recompensa en TensorBoard.
- Reproduccion de experimentos: al estar alojado en Hugging Face y cargarse con `sample_factory.huggingface.load_from_hub`, permite replicar el resultado declarado de recompensa media sin reentrenar desde cero.
- Ajuste fino de hiperparametros: reanudar el entrenamiento con `--restart_behavior=resume` facilita experimentar con tasas de aprendizaje, numero de workers o arquitectura de red partiendo de una politica ya competente.
- Comparacion de algoritmos: sirve como linea base APPO frente a otras variantes (PPO sincrono, R2D2, etc.) sobre el mismo entorno de ViZDoom.
- Investigacion en recompensa dispersa: el escenario `health_gathering_supreme` es un banco de pruebas clasico para estudiar exploracion y credit assignment, y este checkpoint permite analizar el comportamiento aprendido.
- Desarrollo de infraestructura de RL: util para validar pipelines de entrenamiento distribuido, integracion con TensorBoard y flujos de publicacion en el Hub.
- Demostraciones y visualizaciones: ejecutar el agente con el script `enjoy` para generar grabaciones o material divulgativo sobre RL basado en vision.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model card (metrica `mean_reward`, no verificada):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12.52 +/- 5.06 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos o algoritmos sobre el mismo entorno.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB y la red es presumiblemente pequena (politica convolucional para ViZDoom), por lo que cabria en GPUs de consumo, aunque no se confirma en la informacion disponible.
- GPU recomendadas: no disponible. Para entrenamiento con Sample-Factory se suele emplear una GPU dedicada (por ejemplo, RTX 3090/4090 o A100/H100), pero no se especifica en la model card.
- Compatibilidad con GPU de consumo: probable por el tamano del checkpoint, pero no confirmada.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), carga desde el Hub con `sample_factory.huggingface.load_from_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye otros checkpoints comparables de APPO sobre `doom_health_gathering_supreme` ni sus especificaciones.

## Limitaciones y advertencias
- Especifico de un unico entorno: la politica solo es valida para `doom_health_gathering_supreme`; no generaliza a otras tareas o juegos.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin marco legal claro y requiere contactar con el autor.
- Resultado no verificado: la metrica `mean_reward` de 12.52 +/- 5.06 figura como `verified: false` en la model card.
- Alta varianza: la desviacion tipica de 5.06 sobre una media de 12.52 indica un rendimiento inestable entre episodios.
- Sin documentacion de arquitectura ni de datos de entrenamiento: dificulta la reproducibilidad exacta y la auditoria del modelo.
- Sin informacion sobre sesgos: al ser un agente de RL sobre un videojuego, no aplican sesgos linguisticos, pero si posibles sesgos de politica derivados del entorno.
- Riesgo de sobreajuste al escenario: el agente puede explotar particularidades del mapa y no mostrar comportamiento robusto ante variaciones.
- No apto para tareas de lenguaje, codigo o vision general: su uso esta limitado al control en ViZDoom.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/foleymon/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Documentacion de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
