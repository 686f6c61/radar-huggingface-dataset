# lvtpsjlfj94/ACT_sim_handle_basket_ft

## Resumen

ACT_sim_handle_basket_ft es una política de imitación basada en ACT (Action Chunking with Transformers) publicada por el usuario lvtpsjlfj94 en Hugging Face. Se trata de un ajuste fino (fine-tuning) del checkpoint RoboSynChallenge/ACT_sim_mixer_operating para la tarea de simulación `handle_basket` dentro del RoboSynChallenge, sobre un robot bimanual CobotMagic. El modelo no es un modelo de lenguaje: es un policy de robótica que mapea observaciones visuales y de estado articular a acciones motoras de 14 dimensiones.

El modelo resuelve el problema de manipulación bimanual aprendida por imitación en simulación: a partir de tres cámaras RGB de 480x640 y del estado articular de 14 dimensiones, genera secuencias (chunks) de 50 pasos de acción. Cuenta con 51.633.964 parámetros reales, derivados del backbone ResNet-18 y de la arquitectura transformer de ACT, y se distribuye en formato safetensors bajo licencia Apache 2.0.

Su relevancia es acotada pero concreta: es un checkpoint de una submission al RoboSynChallenge que, según la model card, mejora el checkpoint oficial de la misma tarea (11/20 éxitos frente a 5/20 en una comprobación local con semillas 0 y 1, 10 episodios cada una). Está pensado para reproducibilidad dentro del ecosistema LeRobot 0.3.3 y para ser evaluado con el adaptador ACT del RoboSynChallenge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con backbone ResNet-18, VAE y chunking de acciones |
| Parametros totales | 51.633.964 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de contexto; horizonte de accion: chunk de 50 pasos |
| Tipos de cuantizacion | no disponible (no se declaran cuantizaciones; se distribuye en precision de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una política de imitación que combina un codificador visual convolucional (ResNet-18, dimension 512) con un transformer encoder-decoder (4 capas de encoder y 1 de decoder, segun la model card) que predice bloques de acciones de longitud fija en lugar de acciones individuales. Este chunking reduce el error de compounding y mejora la estabilidad temporal en tareas de manipulación. La variante usada aqui incorpora un componente VAE y consume tres camaras RGB de 480x640 junto con un estado articular/accion de 14 dimensiones, tipico de un robot bimanual como CobotMagic.

El entrenamiento parte de los pesos de RoboSynChallenge/ACT_sim_mixer_operating, con las estadisticas de normalizacion recalculadas sobre el dataset de la tarea, y se ajusta durante 14.000 pasos sobre RoboSynChallenge/cobotmagic_Sim_handle_basket (1.000 episodios), con batch size 16, learning rate 1e-5 y precisión mixta (AMP). No se documentan en la informacion proporcionada fases de RLHF, DPO ni otros ajustes por preferencias, lo cual es esperable en un modelo de imitacion supervisada.

## Capacidades

- Generacion de secuencias de accion de 14 dimensiones (estado/accion articular) para control de un robot bimanual.
- Percepcion visual multi-camara: consume tres vistas RGB de 480x640 simultaneamente.
- Ejecucion de la tarea de simulacion `handle_basket` en el entorno del RoboSynChallenge.
- Action chunking: produce bloques de 50 acciones, lo que reduce la frecuencia de replanificacion y suaviza el comportamiento.
- Inicializacion por transferencia desde una politica previa y ajuste especifico a tarea (fine-tuning).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico ni capacidades multilingues, ya que no es un modelo de lenguaje.
- Capacidades especiales: integracion con el ecosistema LeRobot y el adaptador de evaluacion del RoboSynChallenge.

## Casos de uso

- Reproduccion de resultados del RoboSynChallenge: evaluar el checkpoint con `bash policy/act/eval.sh handle_basket random <path> 0 --headless True` para verificar la tasa de exito declarada de 11/20.
- Punto de partida para fine-tuning en tareas de manipulacion bimanual: al partir de pesos de `ACT_sim_mixer_operating`, sirve como inicializacion para nuevas tareas del mismo robot.
- Investigacion en imitacion visual motora: permite estudiar como influye el ajuste fino con 1.000 episodios y 14.000 pasos sobre una politica generica.
- Benchmarking interno de politicas: comparar contra el checkpoint oficial `RoboSynChallenge/ACT_sim_handle_basket` bajo el mismo protocolo de evaluacion.
- Generacion de datos de politica para simulacion: usar las trayectorias producidas para analisis de comportamiento o deteccion de modos de fallo.
- Prototipado en pipelines de robotica con LeRobot 0.3.3: validar la integracion de un policy ACT en un stack de simulacion antes de trasladar la tarea a hardware.
- Estudio de robustez ante semillas: la comprobacion local con semillas 0 y 1 permite analizar la varianza de exito en evaluacion `random`.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son la comprobacion local del autor, no un conjunto de benchmarks estandar de robótica (como LIBERO o Meta-World).

| Evaluacion | Protocolo | Resultado |
|---|---|---|
| ACT_sim_handle_basket_ft | `random`, semillas 0 y 1, 10 episodios cada una | 11/20 exitos (55 %) |
| RoboSynChallenge/ACT_sim_handle_basket | `random`, mismo protocolo | 5/20 exitos (25 %) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es un modelo de lenguaje. No se han publicado curvas de recompensa, latencias ni metricas adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 51,6 M de parametros, el peso en precision de entrenamiento (fp32) ronda los 0,2 GB y en fp16/bf16 alrededor de 0,1 GB, a lo que se suma el coste de activaciones del ResNet-18 sobre tres camaras de 480x640.
- GPU recomendadas: no especificadas por el autor; por tamano de modelo es viable en GPU de gama media, aunque el procesamiento de tres flujos de imagen de 480x640 es el factor dominante.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer con varios GB de VRAM; no se aporta confirmacion oficial.
- Opciones de despliegue: LeRobot 0.3.3 con el adaptador ACT del RoboSynChallenge (requisito de version declarado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| lvtpsjlfj94/ACT_sim_handle_basket_ft | 51.633.964 | `handle_basket` (fine-tune) | apache-2.0 | Publico en HF, 5 descargas, 1 like |
| RoboSynChallenge/ACT_sim_handle_basket | no disponible | `handle_basket` (checkpoint oficial) | no disponible | Publico en HF |
| dimofu/ACT_sim_handle_basket | no disponible | `handle_basket`, reempaquetado en layout LeRobot 0.4.4 | no disponible | Publico en HF |
| RoboSynChallenge/ACT_sim_mixer_operating | no disponible | Politica base multi-tarea | no disponible | Publico en HF, usado como inicializacion |

Comparativa de rendimiento: el unico dato comparable disponible es el 11/20 frente a 5/20 del checkpoint oficial bajo el mismo protocolo. No hay datos de parametros, contexto ni licencia para las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: es una politica especifica para la tarea `handle_basket`; no generaliza a otras tareas sin nuevo fine-tuning.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones y no soporta tool calling ni agentes.
- Riesgo de sobreajuste al simulador: entrenado sobre 1.000 episodios de simulacion, sin evidencia de transferencia a hardware real.
- Resultado de exito modesto: 55 % (11/20) en la comprobacion local del autor, con solo dos semillas y 10 episodios por semilla, lo que implica alta incertidumbre estadistica.
- Dependencia de version: requiere LeRobot 0.3.3 y el adaptador ACT del RoboSynChallenge; el autor advierte de que otras versiones pueden no cargar el checkpoint.
- Reproducibilidad limitada: las estadisticas de normalizacion se recalcularon sobre el dataset de la tarea, por lo que entornos distintos pueden alterar el comportamiento.
- Sesgos conocidos: no documentados; al ser imitacion de un dataset concreto, heredara los sesgos de las demostraciones (por ejemplo, modos de agarre o trayectorias repetidas).
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; el autor no aporta garantias.
- Adopcion marginal: 5 descargas y 1 like, sin validacion por terceros ni resultados en benchmarks estandar de robótica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lvtpsjlfj94/ACT_sim_handle_basket_ft
- Checkpoint de inicializacion: https://huggingface.co/RoboSynChallenge/ACT_sim_mixer_operating
- Dataset de fine-tuning: https://huggingface.co/datasets/RoboSynChallenge/cobotmagic_Sim_handle_basket
- Checkpoint oficial de la tarea: https://huggingface.co/RoboSynChallenge/ACT_sim_handle_basket
- Alternativa reempaquetada para LeRobot 0.4.4: https://huggingface.co/dimofu/ACT_sim_handle_basket
- Repositorio casact/actsim (relacionado por nombre, no confirmado como oficial del reto): https://github.com/casact/actsim/
- Referencia externa encontrada en la busqueda, no vinculada al modelo: https://arxiv.org/abs/2512.01960
