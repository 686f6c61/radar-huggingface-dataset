# revanth11/appo-doom_health_gathering_supreme

# Appo-doom_health_gathering_supreme (revanth11)

## Resumen

Appo-doom_health_gathering_supreme es un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el escenario `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario `revanth11` en Hugging Face como artefacto del curso Deep RL de Hugging Face, concretamente la Unidad 8, Parte 2, que utiliza la librería Sample Factory 2.0 como entorno de entrenamiento distribuido.

No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es una política de control que recibe observaciones visuales del videojuego Doom y emite acciones discretas para maximizar la supervivencia y la recogida de botiquines. El escenario `health_gathering_supreme` es conocido en la literatura de RL por su dificultad de exploración: la recompensa solo aparece al recoger un objeto, lo que exige al agente aprender una secuencia de navegación sin señal densa intermedia.

La relevancia del artefacto es fundamentalmente docente y de reproducibilidad: sirve como referencia pública de un entrenamiento reproducible con Sample Factory y como punto de partida para experimentos comparativos. El repositorio figura con un tamano de 0.0 GB, no declara licencia y no incluye documentación más alla de una linea descriptiva, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization) implementado en Sample Factory 2.0; topologia exacta de la red no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (agente de RL sobre observaciones por frame, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB; no se confirma la presencia de pesos) |

## Arquitectura y entrenamiento

APPO es una variante asincrona de PPO desarrollada en el marco de Sample Factory. Su rasgo principal es el desacoplamiento entre el proceso de muestreo de experiencia y el de optimización: mientras los actores recogen trayectorias, el learner consume lotes de datos potencialmente desactualizados y aplica una corrección por importance sampling para compensar el desfase entre la política de comportamiento y la política objetivo. Esto permite un uso mucho más eficiente de una sola GPU y acelera el entrenamiento respecto a implementaciones sincronas de PPO. La red del agente en entornos visuales como ViZDoom suele combinar un codificador convolucional sobre los frames con cabezas separadas de política y función de valor, aunque la información disponible no detalla la topología concreta de este checkpoint.

Los datos de entrenamiento no son un corpus textual, sino interacciones con el entorno ViZDoom `doom_health_gathering_supreme`. La model card no especifica el número de pasos de entorno, la semilla, la configuración de hiperparámetros ni si hubo ajuste posterior. El único resultado declarado es una recompensa media de 18.00 +/- 1.00 en el propio entorno de entrenamiento, marcada como no verificada. No se documenta ningún uso de RLHF, DPO ni técnicas de alineación, que no aplican a este tipo de artefacto.

## Capacidades

- Control de un agente en el escenario ViZDoom `doom_health_gathering_supreme`: navegación, recogida de botiquines y maximización del tiempo de supervivencia.
- Procesamiento de observaciones visuales del videojuego y emisión de acciones discretas en el espacio de acciones predefinido por Sample Factory para ViZDoom.
- Aprendizaje de políticas con recompensa dispersa, característica del escenario `supreme`.
- Entrenamiento continuado: al estar generado con Sample Factory, el checkpoint puede reanudarse con el script de entrenamiento correspondiente al entorno y el parámetro `--train_for_env_steps`.
- No dispone de generación de texto, razonamiento en lenguaje natural, código, matemáticas, visión general ni audio.
- No soporta tool calling, function calling, uso de agentes basados en lenguaje ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni modo de pensamiento (`thinking mode`).

## Casos de uso

- Reproducción de experimentos docentes: el artefacto permite a estudiantes de la Unidad 8 del curso Deep RL de Hugging Face cargar una política ya entrenada y compararla con sus propios resultados, evitando repetir el coste de entrenamiento completo.
- Baseline para comparación de algoritmos: sirve como referencia APPO frente a otras variantes (PPO sincrono, A2C, SAC) sobre el mismo escenario, siempre que se reporten los mismos hiperparámetros y semillas.
- Validación de infraestructura de RL: al estar ligado a Sample Factory 2.0, es útil para verificar que una instalación de la librería, los drivers de GPU y el pipeline de checkpoints funcionan correctamente antes de lanzar entrenamientos largos.
- Estudio de recompensa dispersa: el escenario `supreme` obliga a explorar sin señal densa, por lo que este agente puede usarse para analizar técnicas de curriculum learning, reward shaping o exploración intrínseca comparando curvas de aprendizaje.
- Investigación sobre robustez y generalización: evaluar la política ante variaciones de configuración del entorno (velocidad de movimiento, disposición de objetos, ruido visual) para medir hasta qué punto la política aprendida se sobreajusta al escenario concreto.
- Punto de partida para `fine-tuning` en variantes de ViZDoom: reanudar el entrenamiento desde este checkpoint en escenarios relacionados reduce el tiempo hasta convergencia frente a un arranque desde cero.
- Demostración interactiva: la política puede ejecutarse en bucle con el entorno ViZDoom para grabar vídeos o generar visualizaciones del comportamiento aprendido en charlas y material didáctico.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen del `model-index` declarado por el autor. No están verificados de forma independiente.

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 18.00 +/- 1.00 | No |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks, ya que no son aplicables a un agente de RL sobre ViZDoom.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Al tratarse de una política convolucional compacta para ViZDoom, la inferencia es de coste muy inferior al de un modelo de lenguaje y puede ejecutarse en CPU sin problemas.
- GPU recomendadas: no especificadas por el autor. Para el entrenamiento, Sample Factory está optimizado para funcionar en una única GPU de gama media-alta (por ejemplo, RTX 3080/4090, A100 o H100), y admite escalado multi-GPU y multi-nodo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna. No se dispone de cifras oficiales de VRAM.
- Opciones de despliegue: Sample Factory 2.0 para entrenamiento e inferencia; el entorno ViZDoom debe instalarse por separado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen fundamentalmente del coste de renderizado del entorno ViZDoom, no del tamaño de la red.

## Comparativa con modelos similares

Existen varios artefactos comunitarios entrenados con APPO y Sample Factory sobre el mismo entorno, generados en el contexto del curso Deep RL. No se han publicado métricas comparables para ellos en la información disponible.

| Modelo | Entorno | Algoritmo / librería | Parametros | Contexto | Licencia | Metricas publicadas |
|---|---|---|---|---|---|---|
| revanth11/appo-doom_health_gathering_supreme | doom_health_gathering_supreme | APPO / Sample Factory 2.0 | no disponible | no aplica | no disponible | mean_reward 18.00 +/- 1.00 (no verificado) |
| kingabzpro/doom_health_gathering_supreme | doom_health_gathering_supreme | APPO / Sample Factory | no disponible | no aplica | no disponible | no disponible |
| tiggerhelloworld/doom_health_gathering_supreme | doom_health_gathering_supreme | APPO / Sample Factory | no disponible | no aplica | no disponible | no disponible |
| Huggbottle/DeepRL_vizdoom_health_gathering_supreme_2 | doom_health_gathering_supreme | APPO / Sample Factory | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- El resultado declarado (mean_reward 18.00 +/- 1.00) está marcado como no verificado y puede corresponder a una media sobre un número reducido de episodios, con varianza alta.
- La licencia no está declarada, por lo que no se puede asumir permiso de uso comercial ni redistribución del artefacto.
- El repositorio figura con un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o no ser accesibles; conviene verificarlo antes de intentar cargarlo.
- No hay información sobre el número de pasos de entrenamiento, semilla ni hiperparámetros, lo que dificulta la reproducibilidad exacta.
- La política está especializada en un único escenario y un único conjunto de observaciones y acciones; no generaliza a otras tareas ni a entradas fuera de la distribución del entorno.
- No existe capacidad de razonamiento simbólico, lenguaje natural ni interacción mediante instrucciones: cualquier expectativa de comportamiento tipo LLM es incorrecta.
- No se documentan sesgos específicos, pero como política entrenada por refuerzo puede explotar atajos del entorno y presentar comportamientos frágiles ante pequeñas perturbaciones.
- Como agente de RL, su comportamiento es estocástico durante la evaluación si no se fija la semilla, lo que complica la comparación directa entre ejecuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/revanth11/appo-doom_health_gathering_supreme
- Sample Factory 2.0 (repositorio oficial): https://github.com/alex-petrenko/sample-factory
- Hugging Face Deep RL Course, Unidad 8: https://huggingface.co/learn/deep-rl-course/unit8/introduction
- Modelo comunitario equivalente (kingabzpro): https://huggingface.co/kingabzpro/doom_health_gathering_supreme
- Modelo comunitario equivalente (tiggerhelloworld): https://huggingface.co/tiggerhelloworld/doom_health_gathering_supreme
- Repositorio relacionado con el mismo entorno (HusseinEid101): https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
- Modelo comunitario equivalente (Huggbottle): https://huggingface.co/Huggbottle/DeepRL_vizdoom_health_gathering_supreme_2
- Ficha de referencia en Toolify sobre el modelo de kingabzpro: https://www.toolify.ai/ai-model/kingabzpro-doom-health-gathering-supreme
