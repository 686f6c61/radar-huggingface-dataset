# Rom1T/rl_course_vizdoom_health_gathering_supreme

## Resumen

`Rom1T/rl_course_vizdoom_health_gathering_supreme` es un checkpoint de agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario Rom1T en Hugging Face como material de un curso de reinforcement learning, y se apoya en la libreria Sample-Factory 2.0 para el entrenamiento y la inferencia. No es un modelo de lenguaje: es una politica neuronal que juega a un escenario concreto de Doom, por lo que su utilidad esta acotada a ese entorno y a tareas de investigacion o docencia en RL.

El entorno `doom_health_gathering_supreme` es un escenario clasico de ViZDoom en el que el agente debe recoger botiquines mientras sobrevive a los ataques de monstruos; la variante "supreme" es la version mas dificil del escenario. El modelo resuelve el problema de aprender una politica que maximice la recompensa media en ese entorno, y resulta relevante como ejemplo reproducible de entrenamiento APPO con Sample-Factory y como baseline para comparar algoritmos de RL en ViZDoom.

El repositorio ocupa aproximadamente 0,1 GB y contiene los pesos del agente junto con los artefactos habituales de Sample-Factory (configuracion de experimento, logs de TensorBoard). No se dispone de informacion sobre el numero de parametros de la red ni sobre la longitud de entrenamiento en pasos de entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica y valor para RL (APPO, Sample-Factory 2.0); topologia concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observa frames del entorno ViZDoom) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pesos de Sample-Factory (checkpoint de entrenamiento); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El agente se entrena con APPO, el algoritmo asincrono de optimizacion de politica proximal implementado en Sample-Factory. APPO combina muestreo asincrono de multiples workers con una actualizacion de politica tipo PPO, lo que permite alto rendimiento en entornos de RL. La red procesa observaciones visuales del entorno ViZDoom (frames renderizados) y produce acciones discretas; la arquitectura exacta de la red (capas convolucionales, tamaño de las capas recurrentes, etc.) no se detalla en la informacion disponible.

El entrenamiento se realizo sobre el entorno `doom_health_gathering_supreme`, un escenario de ViZDoom con recompensa por recoger botiquines y penalizacion por muerte. No se especifican el numero total de pasos de entorno, la composicion del dataset (en RL no aplica en el sentido supervisado) ni si hubo tecnicas adicionales como reward shaping o curricula. La model card solo documenta el algoritmo (APPO), el entorno y la recompensa media obtenida.

## Capacidades

- Control de agente en el entorno ViZDoom `doom_health_gathering_supreme`: selecciona acciones discretas a partir de observaciones visuales del juego.
- Aprendizaje por refuerzo: la politica esta optimizada para maximizar la recompensa del escenario (recoger botiquines y sobrevivir).
- Reanudacion de entrenamiento: el checkpoint puede cargarse con `--restart_behavior=resume` para continuar el entrenamiento en Sample-Factory.
- Evaluacion reproducible: permite ejecutar el script `enjoy` de Sample-Factory para medir la recompensa media del agente.
- No soporta tool calling, function calling, agentes multi-paso en el sentido de LLM, capacidades multilingues, vision general, audio ni modos de razonamiento extendido.

## Casos de uso

- Docencia en reinforcement learning: sirve como ejemplo practico de un agente APPO entrenado en ViZDoom, util para ilustrar el flujo completo de Sample-Factory (entrenamiento, evaluacion y publicacion en el Hub).
- Baseline para comparacion de algoritmos: permite contrastar APPO con PPO, IMPALA u otros algoritmos en el mismo entorno y medir diferencias de recompensa media.
- Reproduccion de experimentos: el checkpoint y la configuracion asociada permiten reproducir el resultado declarado (recompensa media 10,97 +/- 4,93) y verificar la variabilidad entre ejecuciones.
- Punto de partida para fine-tuning en RL: se puede reanudar el entrenamiento con `--restart_behavior=resume` para explorar variantes del entorno o hiperparametros.
- Investigacion en entornos visuales de ViZDoom: útil para estudiar el comportamiento de politicas entrenadas con observaciones de imagen en escenarios de salud y supervivencia.
- Demostracion de integracion con Hugging Face Hub: ejemplifica el flujo `load_from_hub` y `--push_to_hub` de Sample-Factory para compartir checkpoints de RL.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 10,97 +/- 4,93 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeno que probablemente cabe en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible. Para entrenamiento con Sample-Factory se suele usar GPU dedicada, pero no se especifica en la informacion.
- Compatibilidad con GPU de consumo: probablemente si por el tamaño del repositorio, aunque no se confirma.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros checkpoints comparables en la misma categoria (agentes APPO en ViZDoom) dentro de la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un agente de RL en un entorno cerrado, los sesgos se limitan a los del propio escenario de ViZDoom.
- Riesgo de alucinacion: no aplica en el sentido de LLM; el agente no genera texto.
- Limitaciones de contexto o idioma: el modelo solo opera en el entorno `doom_health_gathering_supreme`; no es reutilizable en otros entornos sin reentrenamiento.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial.
- Caveat para produccion: es un checkpoint de curso, con recompensa media declarada pero no verificada (`verified: false`) y alta varianza (+/- 4,93); no esta pensado como solucion de produccion.
- Dependencia fuerte de Sample-Factory 2.0 y de la version concreta del entorno ViZDoom para reproducir resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Rom1T/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Documentacion de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
