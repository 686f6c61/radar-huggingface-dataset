# LucaVogel/Taxi-v4

## Resumen

Taxi-v4 es un agente de aprendizaje por refuerzo entrenado mediante Q-learning tabular sobre el entorno Taxi-v3 de Gymnasium. Lo desarrolla el usuario LucaVogel y se publica en Hugging Face como un artefacto de política serializada (fichero `q-learning.pkl`), no como un modelo de lenguaje. Su proposito no es la generacion de texto ni el razonamiento general, sino servir como referencia reproducible de un agente que resuelve la tarea clasica de recoger y dejar pasajeros en una cuadricula de 5x5.

El entorno Taxi-v3 es un problema discreto de 500 estados (25 posiciones del taxi x 5 ubicaciones de pasajero x 4 destinos) y 6 acciones. El agente aprende una tabla Q que asigna un valor a cada par estado-accion. Es, por tanto, un modelo de juguete orientado a docencia, validacion de pipelines de RL y pruebas de integracion, no un sistema para produccion con datos reales.

Su relevancia actual es limitada fuera del ambito educativo: no hay arquitectura neuronal, ni parametros en el sentido habitual, ni contexto, ni capacidades linguisticas. La model card declara un `mean_reward` de 7.56 +/- 2.71 sobre Taxi-v3, un valor que conviene interpretar con cautela porque el maximo teorico del entorno ronda 8-15 segun la politica y la inicializacion, y la metrica no esta verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de hasta 500 estados x 6 acciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno discreto de 500 estados) |
| Tipos de cuantizacion | no aplica (pesos serializados en `q-learning.pkl`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle de Python (`q-learning.pkl`) |

## Arquitectura y entrenamiento

El modelo implementa Q-learning clasico, un algoritmo de diferencias temporales off-policy. Mantiene una tabla Q indexada por estado y accion, actualizada con la regla de Bellman `Q(s,a) <- Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a))`. El estado se representa de forma discreta (posicion del taxi, ubicacion del pasajero y destino), y el espacio de acciones consta de 6 movimientos (norte, sur, este, oeste, recoger y dejar). No hay funcion de aproximacion, ni red neuronal, ni tokenizador.

La informacion disponible no detalla hiperparametros (tasa de aprendizaje, factor de descuento, politica de exploracion epsilon-greedy, numero de episodios) ni la composicion del entrenamiento. La model card solo indica que el agente fue entrenado sobre Taxi-v3 y que la carga se realiza mediante `load_from_hub`, advirtiendo de la posibilidad de configurar atributos del entorno como `is_slippery=False`. No se documenta RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Resolucion del entorno Taxi-v3: selecciona acciones discretas para recoger y entregar pasajeros en una cuadricula 5x5.
- Politica greedy derivada de la tabla Q: dado un estado, devuelve la accion de mayor valor aprendido.
- Serializacion portable: se carga como diccionario de Python desde el Hub con `load_from_hub`.
- Integracion con Gymnasium: funciona con `gym.make(model["env_id"])`.
- No soporta generacion de texto, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues.
- No dispone de modo thinking ni de mecanismos de cadena de pensamiento.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo minimo y ejecutable de Q-learning tabular para explicar la ecuacion de Bellman, la exploracion epsilon-greedy y la convergencia de la tabla Q en un entorno de 500 estados.
- Pruebas de integracion de pipelines de RL: permite validar el flujo completo de `load_from_hub`, creacion del entorno con Gymnasium y evaluacion de recompensa media sin depender de recursos de computo.
- Comparacion de algoritmos: se puede usar como linea base tabular frente a metodos con aproximacion de funcion (DQN, tablas con tile coding) sobre el mismo entorno Taxi-v3.
- Reproducibilidad de experimentos: al publicarse los pesos serializados, otros investigadores pueden replicar la evaluacion declarada (7.56 +/- 2.71) y contrastarla.
- Generacion de datos sinteticos de trayectorias: la politica aprendida puede generar episodios etiquetados para entrenar o depurar otros agentes en entornos discretos similares.
- Material de referencia en cursos y tutoriales: su tamano minimo (repo de 0.0 GB) y su carga sencilla lo hacen adecuado para entornos de formacion sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica no verificada, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es una tabla Q serializada en pickle y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer y en CPU: el fichero de pesos es practicamente despreciable en tamano (repo de 0.0 GB).
- Opciones de despliegue: carga directa con `load_from_hub` y ejecucion sobre Gymnasium; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos de lenguaje.
- Latencia y throughput: no disponibles; al ser una consulta a tabla Q, la latencia por paso es del orden de microsegundos en CPU, aunque no se documenta una medicion oficial.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|---|
| LucaVogel/Taxi-v4 | Q-learning tabular | Taxi-v3 | tabla Q (500x6) | no aplica | mean_reward 7.56 +/- 2.71 (no verificado) | no disponible |
| Agentes DQN sobre Taxi-v3 | Red neuronal (DQN) | Taxi-v3 | orden de 10^3-10^4 | no aplica | no disponible | variable |
| Agentes Q-learning de referencia (p. ej. los del curso de Hugging Face Deep RL) | Q-learning tabular | Taxi-v3 | tabla Q | no aplica | no disponible | variable |

No se dispone de datos comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Ambito restringido: solo resuelve Taxi-v3; no generaliza a otros entornos ni a tareas reales.
- Sin informacion de licencia: no se puede confirmar el uso comercial; conviene contactar con el autor antes de reutilizarlo en produccion.
- Metrica no verificada: el `mean_reward` de 7.56 +/- 2.71 esta marcado como `verified: false` y no se detalla el protocolo de evaluacion (numero de episodios, semilla, epsilon).
- Alta varianza: la desviacion tipica de 2.71 sobre una media de 7.56 indica una politica poco estable entre episodios.
- Dependencia del entorno: la carga puede requerir ajustar atributos como `is_slippery=False`; un cambio en la configuracion invalida la tabla Q.
- Sin capacidades linguisticas ni de razonamiento general: no debe evaluarse con criterios de LLM (MMLU, HumanEval, GSM8K).
- Riesgo de sobreajuste al entorno de entrenamiento: al ser tabular, no hay capacidad de interpolacion ante estados no vistos.
- Formato pickle: implica riesgos de seguridad al deserializar ficheros de origen no confiable; conviene cargarlo en un entorno aislado.

## Enlaces

- Hugging Face: https://huggingface.co/LucaVogel/Taxi-v4
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de `load_from_hub` (Hugging Face Hub): https://huggingface.co/docs/huggingface_hub
- Curso de Deep RL de Hugging Face (referencia de agentes Q-learning en Taxi-v3): https://huggingface.co/learn/deep-rl-course
