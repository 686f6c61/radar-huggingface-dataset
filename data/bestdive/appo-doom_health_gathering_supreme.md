# bestdive/APPO-doom_health_gathering_supreme

## Resumen

APPO-doom_health_gathering_supreme es una politica de aprendizaje por refuerzo (RL) entrenada por Kay Zheng (usuario bestdive) con la libreria Sample Factory sobre el escenario `doom_health_gathering_supreme` de ViZDoom. No es un modelo de lenguaje ni un modelo generativo multimodal: es un agente visual que aprende una politica de accion a partir de fotogramas del juego, entrenado desde inicializacion aleatoria, sin copiar ninguna politica preentrenada y sin fabricar metricas. Se publica como entregable del curso Deep RL de Hugging Face, unidad 8, parte II.

El interes del artefacto es metodologico mas que de rendimiento bruto. El autor documenta explicitamente el uso de retornos verdadero-objetivo (true-objective) recogidos con la funcion oficial de evaluacion de Sample Factory, en lugar de sustituirlos por la recompensa con shaping usada durante el entrenamiento, que seria mas alta. Ademas, publica el numero exacto de checkpoints cargado, la semilla de evaluacion y el desglose episodio a episodio, lo que lo convierte en un ejemplo reproducible de como reportar resultados en RL.

El entrenamiento se realizo en una GPU T4 gratuita de Colab, con 4.005.888 fotogramas de entorno y semilla 42. El repositorio tiene un tamano de 0,0 GB segun la ficha de Hugging Face, el modelo acumula 0 descargas y 0 likes en el momento de la consulta y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico entrenado con APPO (Asynchronous Proximal Policy Optimization) sobre Sample Factory; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL sobre observaciones visuales, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el repositorio no publica variantes cuantizadas |
| Idiomas soportados | no disponible (no aplica; el agente no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch de Sample Factory, ubicado en `checkpoint_p0/` |

## Arquitectura y entrenamiento

APPO es una variante asincrona de PPO implementada en Sample Factory, que desacopla la recoleccion de experiencia (actores) del calculo de gradiente (learner) siguiendo el patron de IMPALA. El resultado es una red actor-critico que consume observaciones visuales del entorno ViZDoom y emite acciones discretas. La model card no detalla el numero de capas, canales, parametros totales ni el tamano del encoder convolucional, por lo que esos datos figuran como no disponibles.

El entrenamiento partio de inicializacion aleatoria con semilla 42 durante 4.005.888 fotogramas de entorno, en una GPU T4 gratuita de Colab. No hubo copia de politicas preentrenadas ni ajuste por RLHF o DPO, tecnicas que no aplican a este tipo de modelo. El stack exacto es Python 3.10.12, `sample-factory==2.1.1`, `vizdoom==1.2.4`, `torch==2.2.2`, `numpy<2` y `setuptools<81`. El codigo de registro y entrenamiento proviene del cuaderno oficial de la unidad 8 parte II del curso Deep RL de Hugging Face, con argumentos de experimento explicitos. Los scripts ejecutados (`train_doom.py` y `evaluate_doom.py`) se incluyen en el repositorio.

## Capacidades

- Politica de control visual en el escenario ViZDoom `doom_health_gathering_supreme`, con acciones deterministas en evaluacion.
- Entrenamiento y evaluacion reproducibles mediante los scripts incluidos y el checkpoint en `checkpoint_p0/`.
- Evaluacion con retornos verdadero-objetivo en la funcion oficial de *enjoy/evaluation* de Sample Factory, en lugar de la recompensa con shaping.
- Trazabilidad de la evaluacion: 100 episodios completos en un entorno con semilla independiente (100001), resultados en `evaluation.json` y registro del checkpoint exacto en `doom-evaluation.log`.
- Entrenamiento desde cero con `train_doom.py` para reproducir el experimento completo.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, function calling, capacidades de agente multi-paso ni soporte multilingue. Estas capacidades no aplican al modelo.

## Casos de uso

- Reproduccion de experimentos de RL: el repositorio incluye el checkpoint, los scripts y el entorno de dependencias fijado, de modo que un investigador puede replicar la evaluacion de 100 episodios con la semilla 100001 y contrastar el retorno medio publicado.
- Material docente para cursos de RL profundo: sirve como ejemplo completo del flujo de trabajo de la unidad 8 parte II del curso Deep RL de Hugging Face, desde el registro del entorno hasta la generacion de la model card.
- Comparativa de algoritmos en ViZDoom: al fijar el entorno, el presupuesto de fotogramas (4.005.888) y la semilla de entrenamiento, permite contrastar APPO frente a otras variantes de politica entrenadas en el mismo escenario bajo condiciones equivalentes.
- Auditoria de buenas practicas de evaluacion: el modelo documenta el uso de retornos verdadero-objetivo y no del reward con shaping, por lo que es util como referencia de como reportar metricas sin inflarlas.
- Analisis de varianza y estabilidad: con una desviacion estandar poblacional de 5,578 sobre una media de 11,788 en 100 episodios, es un caso practico para estudiar la dispersion de retornos de una politica determinista en este escenario.
- Pruebas de infraestructura de entrenamiento de bajo coste: el experimento se ejecuto integramente en una T4 gratuita de Colab, lo que lo hace util para validar pipelines de Sample Factory en hardware limitado antes de escalar.
- Punto de partida para ajuste fino o transferencia: el checkpoint puede reutilizarse como inicializacion en variantes del escenario o en tareas de recoleccion de recursos con observaciones visuales similares.
- Validacion de flujos de publicacion en Hugging Face: el repositorio incluye `model-index` con la metrica declarada, lo que permite probar el pipeline de model cards y evaluacion de la plataforma.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los declarados por el autor en el `model-index` de la model card. La metrica figura con `verified: false`, es decir, no ha sido verificada de forma independiente por la plataforma.

| Tarea | Dataset / entorno | Metrica | Valor | Condiciones |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 11,787799999999942 +/- 5,578349501420757 | 100 episodios completos, entorno con semilla 100001, acciones deterministas, ultimo checkpoint final |
| reinforcement-learning | doom_health_gathering_supreme | puntuacion del curso | 6,209450498579185 (minimo requerido: 5) | calculada por el generador de model cards del curso |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no son aplicables a un agente de RL sobre ViZDoom.

## Requisitos de hardware

- Entrenamiento: una GPU T4 de Colab gratuita fue suficiente para completar los 4.005.888 fotogramas de entorno con Sample Factory 2.1.1. No se publica el tiempo total de entrenamiento.
- Inferencia: no se publica la VRAM estimada. Dado que el entrenamiento completo cupo en una T4 y que la politica es una red convolucional de accion discreta, la inferencia es viable en GPUs de consumo, aunque no se dispone de cifras concretas de memoria.
- GPU recomendadas: no disponible de forma explicita; el unico hardware documentado por el autor es la T4.
- Opciones de despliegue: evaluacion mediante `evaluate_doom.py` con Sample Factory, cargando el checkpoint de `checkpoint_p0/`. Requiere colocar el repositorio en `/content/doom-results/Kay-Doom` y copiar los scripts a `/content`, o bien ajustar las rutas explicitas de ambos scripts para otro espacio de trabajo.
- Servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama: no aplicables, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APPO-doom_health_gathering_supreme | no disponible | no aplica | mean_reward 11,7878 +/- 5,5783 (100 episodios, sin verificar) | MIT | Hugging Face, 0 descargas, 0 likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros agentes entrenados en `doom_health_gathering_supreme` con presupuesto de fotogramas y semilla equivalentes en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El propio autor advierte que el modelo esta limitado a este entorno simulado y no constituye evidencia de competencia general de IA.
- La metrica declarada tiene `verified: false`: la evaluacion la realizo el autor, no un tercero independiente.
- La desviacion estandar poblacional (5,5783) es elevada en relacion con la media (11,7878), lo que indica una variabilidad notable del retorno entre episodios incluso con acciones deterministas.
- El experimento usa una unica semilla de entrenamiento (42), por lo que no hay evidencia de estabilidad entre semillas.
- Los resultados publicados corresponden a retornos verdadero-objetivo, no al reward con shaping del entrenamiento; comparar esta cifra con la de otros trabajos que reporten reward con shaping seria metodologicamente incorrecto.
- La evaluacion exige rutas concretas (`/content/doom-results/Kay-Doom`) y versiones fijadas de las dependencias; cambios en `sample-factory`, `vizdoom`, `torch`, `numpy` o `setuptools` pueden alterar el comportamiento o impedir la ejecucion.
- El repositorio ocupa 0,0 GB segun la ficha, lo que conviene verificar antes de asumir que todos los artefactos de entrenamiento estan incluidos.
- No tiene capacidades de lenguaje, vision general, codigo ni tool calling, y no debe evaluarse con ese criterio.
- No se documentan sesgos sociales ni riesgos de alucinacion, ya que el modelo no genera texto; el riesgo relevante es de sobreinterpretacion de sus resultados como indicador de capacidad general.
- La licencia MIT permite uso comercial, pero el valor practico fuera de la investigacion en RL y la docencia es muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bestdive/APPO-doom_health_gathering_supreme
- Libreria Sample Factory (referenciada en la model card): https://github.com/alex-petrenko/sample-factory
- ViZDoom (referenciado en la model card): https://github.com/Farama-Foundation/ViZDoom
- Cuaderno del curso Deep RL de Hugging Face, unidad 8 parte II: no disponible en la informacion proporcionada (el autor lo cita sin enlace)
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces obtenidos correspondian a paginas de una universidad alemana sin relacion con el artefacto.
