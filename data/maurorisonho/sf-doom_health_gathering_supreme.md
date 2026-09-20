# maurorisonho/sf-doom_health_gathering_supreme

## Resumen

`maurorisonho/sf-doom_health_gathering_supreme` es un agente de aprendizaje por refuerzo entrenado con la libreria Sample Factory sobre el escenario `doom_health_gathering_supreme` de ViZDoom. No es un modelo de lenguaje ni un modelo fundacional: no procesa ni genera texto, sino que implementa una politica que mapea observaciones del entorno (fotogramas y variables de estado del juego) a un conjunto discreto de acciones.

El autor, `maurorisonho`, lo publica como entregable del curso de Deep Reinforcement Learning de Hugging Face, utilizando Sample Factory como framework de entrenamiento de alto rendimiento. Su interes actual es, por tanto, educativo y de reproducibilidad: sirve como artefacto de referencia para validar pipelines de entrenamiento con Sample Factory, comparar algoritmos actor-critico y disponer de una politica preentrenada para evaluacion en un entorno estandar de RL.

La model card es extremadamente escueta. No declara arquitectura de red, numero de parametros, licencia, idiomas ni regimen de entrenamiento. El unico dato cuantitativo publicado es un reward medio declarado de 25,0 +/- 2,0, marcado explicitamente como no verificado. Cualquier uso serio del artefacto exige reejecutar la politica en el entorno original o reentrenarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; Sample Factory emplea por defecto redes convolucionales con actor-critico asincrono, sin confirmacion para este entrenamiento) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el "contexto" es el historial de observaciones del entorno, no declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto cargado mediante la libreria `sample-factory`) |

## Arquitectura y entrenamiento

La model card no especifica la topologia de red, el numero de capas, el tamano de las capas ocultas ni el presupuesto de entrenamiento. El unico contexto tecnico confirmado es el framework: Sample Factory, un sistema de entrenamiento de RL asincrono y altamente paralelizado que implementa por defecto APPO (Asynchronous Proximal Policy Optimization) con actor-critico y correccion de desfase mediante V-trace. Para entornos basados en pixeles como ViZDoom, Sample Factory suele usar codificadores convolucionales compartidos entre politica y funcion de valor, pero esto es una convencion del framework y no un dato declarado por el autor para este modelo concreto.

No hay informacion sobre el numero de pasos de entorno, la composicion del dataset (en RL el "dataset" es la experiencia generada por interaccion, no un corpus estatico), ni sobre tecnicas de ajuste tipo RLHF o DPO, que no aplican a este paradigma. Tampoco se documenta ninguna innovacion tecnica propia: el modelo es una salida estandar de un entrenamiento guiado por curso, sin decodificacion especulativa, atencion lineal ni mecanismos equivalentes.

## Capacidades

- Control de politica en el escenario `doom_health_gathering_supreme` de ViZDoom: seleccion de acciones discretas para maximizar la supervivencia y la recogida de botiquines.
- Procesamiento de observaciones visuales del entorno en el marco del propio escenario de juego, como entrada de la politica.
- Optimizacion de una unica funcion de recompensa asociada a `doom_health_gathering_supreme`.
- Inferencia determinista o estocastica de acciones a partir del estado, segun la configuracion de muestreo empleada en la evaluacion.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural; el "multi-paso" se limita a la secuencia de decisiones dentro del episodio.
- No tiene capacidades multilingues: no hay modulo de lenguaje.
- No incluye modo de pensamiento, vision-lenguaje, audio ni ninguna modalidad adicional.

## Casos de uso

- Reproduccion de experimentos del curso de Deep RL de Hugging Face: cargar el agente con Sample Factory y verificar que el pipeline de evaluacion devuelve el reward declarado en el escenario `doom_health_gathering_supreme`.
- Linea base de comparacion en investigacion sobre eficiencia de muestras: usar el reward medio declarado (25,0 +/- 2,0) como referencia orientativa al probar variantes de APPO, cambios de hiperparametros o nuevos codificadores visuales.
- Validacion de infraestructura de entrenamiento distribuido: el artefacto permite comprobar que un cluster con Sample Factory instalado puede cargar politicas preentrenadas y ejecutar inferencia sin reentrenar desde cero.
- Docencia en asignaturas de aprendizaje por refuerzo: ejemplo tangible de politica entrenada sobre observaciones visuales, util para explicar la diferencia entre un agente de control y un modelo generativo.
- Pruebas de integracion de ViZDoom en entornos sin interfaz grafica: el agente sirve para automatizar episodios de evaluacion en modo headless dentro de contenedores.
- Estudio de robustez y sensibilidad al azar del entorno: al ejecutar el agente repetidamente se puede estimar la varianza del retorno y contrastarla con el intervalo declarado de +/- 2,0.
- Prototipado de tecnicas de curriculum o reward shaping: el agente preentrenado actua como punto de partida para experimentos que modifiquen la recompensa del escenario.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card:

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 25,0 +/- 2,0 | no |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparaciones con agentes de referencia del mismo entorno ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. Sample Factory admite entrenamiento e inferencia tanto en CPU como en GPU, pero no se documenta que configuracion se uso.
- Viabilidad en GPU de consumo: no confirmada. Por la naturaleza de la tarea (un unico entorno ViZDoom con observaciones de baja resolucion relativa), es plausible ejecutar la inferencia en CPU, pero este extremo no esta declarado y debe verificarse.
- Opciones de despliegue: la libreria `sample-factory` es el unico mecanismo de carga declarado en la model card. No se mencionan exportaciones a ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un agente de RL de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maurorisonho/sf-doom_health_gathering_supreme | no disponible | no aplica | mean_reward 25,0 +/- 2,0 (no verificado) | no disponible | Hugging Face Hub |
| Otros agentes `sf-*` de ViZDoom publicados en el Hub | no disponible | no aplica | no disponible | no disponible | Hugging Face Hub |
| Lineas base de RL clasicas (DQN, PPO) en ViZDoom | no disponible | no aplica | no disponible | no disponible | literatura, sin datos verificados en esta busqueda |

No se dispone de datos verificados de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito de aplicacion unico: la politica esta especializada en `doom_health_gathering_supreme` y no es transferible a otras tareas sin reentrenamiento.
- Ausencia de licencia declarada: sin licencia explicita, el uso comercial queda en una situacion juridica indeterminada y no es recomendable en produccion sin aclaracion previa del autor.
- Resultado no verificado: el valor de reward medio procede del propio autor, marcado como `verified: false`, y no se acompana de numero de episodios, semilla ni protocolo de evaluacion.
- Varianza declarada: el intervalo de +/- 2,0 sobre un valor de 25,0 implica una dispersion no trivial que debe tenerse en cuenta al comparar configuraciones.
- Informacion tecnica insuficiente: sin arquitectura, numero de parametros, hiperparametros ni presupuesto de entrenamiento, la reproducibilidad es limitada.
- Sin datos de sesgo: al no operar sobre lenguaje natural ni sobre datos humanos, no se aplican sesgos linguisticos, pero tampoco se documenta el comportamiento del agente en situaciones fuera de distribucion del entorno.
- Riesgo de sobreajuste al entorno de entrenamiento: es esperable un deterioro del rendimiento ante variaciones del escenario, de la recompensa o de la dinamica del juego, aunque no se cuantifica.
- Metadatos potencialmente inconsistentes: la fecha de creacion indicada (2026-09-20) y la de actualizacion (un segundo despues) sugieren un registro automatizado o un posible error de metadatos.
- Resultados de busqueda no pertinentes: las referencias web recuperadas para este modelo corresponden a paginas de ayuda de Windows en aleman, sin relacion alguna con el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maurorisonho/sf-doom_health_gathering_supreme
- Repositorio de Sample Factory: no disponible en la informacion proporcionada
- Paper de Sample Factory (APPO): no disponible en la informacion proporcionada
- Curso de Deep Reinforcement Learning de Hugging Face: no disponible en la informacion proporcionada
- Documentacion de ViZDoom y del escenario `health_gathering_supreme`: no disponible en la informacion proporcionada
- Otros enlaces relevantes: no se han encontrado en la busqueda web realizada (los resultados devueltos no guardan relacion con el modelo)
