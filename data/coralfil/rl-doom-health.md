# Coralfil/rl-doom-health

## Resumen

`Coralfil/rl-doom-health` es un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, un escenario de referencia habitual en la investigacion de RL. Lo publica el usuario Coralfil en Hugging Face y esta etiquetado como agente certificado para el curso de Deep RL de Hugging Face. No es un modelo de lenguaje: no genera texto, no procesa instrucciones en lenguaje natural y no dispone de ventana de contexto en el sentido habitual.

El modelo resuelve una tarea concreta y muy acotada: controlar un agente en un entorno de disparos en primera persona en 3D (Doom) con el objetivo de recoger botiquines y sobrevivir el maximo tiempo posible. El interes practico esta en su valor como ejemplo reproducible de entrenamiento con Sample Factory, una libreria de RL de alto rendimiento, y como referencia para comparar algoritmos en entornos ViZDoom.

La informacion publicada es muy escasa: la model card se limita a una linea descriptiva y la licencia, los idiomas y los formatos de pesos no estan declarados. El unico dato cuantitativo disponible es el `mean_reward` declarado por el autor (75,00 +/- 2,00) sobre el entorno citado, no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente de RL entrenado con APPO; la model card no detalla la red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria declarada: `sample-factory`) |

## Arquitectura y entrenamiento

El agente se entrena con APPO, la variante asincrona de PPO implementada en Sample Factory. APPO desacopla la recoleccion de experiencia (workers de entorno) del calculo de gradientes (learner), lo que permite escalar el entrenamiento en entornos con alto coste de simulacion como ViZDoom. La model card no especifica la topologia de la red (capas convolucionales para el frame del juego, capas densas para el estado, etc.), el numero de pasos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como recompensas conformadas o curricula.

El entorno `doom_health_gathering_supreme` es una variante de dificultad alta del escenario de recogida de salud de ViZDoom: el agente debe navegar un mapa 3D, recoger botiquines y evitar morir. La recompensa declarada de 75,00 +/- 2,00 es coherente con el rango tipico de este escenario en la literatura de RL, aunque no se aporta informacion sobre la semilla, el numero de episodios de evaluacion ni la configuracion exacta del entorno.

## Capacidades

- Control de agente en el entorno `doom_health_gathering_supreme` de ViZDoom: navegacion y recogida de botiquines.
- Aprendizaje por refuerzo con APPO sobre observaciones visuales del juego (segun la libreria declarada).
- Reproducibilidad como ejemplo de entrenamiento con Sample Factory.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso en el sentido de LLM; su "razonamiento" es una politica de RL.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni otras capacidades de modelo fundacional.

## Casos de uso

- Reproduccion de experimentos de RL: sirve como punto de partida para comparar APPO con otros algoritmos (PPO, IMPALA) en el mismo entorno ViZDoom, cargando los pesos con Sample Factory.
- Docencia en cursos de Deep RL: el agente esta certificado para el curso de Hugging Face y puede usarse como ejemplo resuelto del escenario de recogida de salud.
- Benchmark de infraestructura de entrenamiento: permite medir throughput y escalado de Sample Factory en un entorno con simulacion 3D costosa.
- Investigacion en entornos visuales 3D: base para estudiar transferencia, robustez ante cambios de textura o generalizacion entre mapas de Doom.
- Pruebas de pipelines de evaluacion de agentes: el `mean_reward` declarado permite validar que un pipeline de evaluacion reproduce el resultado del autor.
- Comparacion de tecnicas de reward shaping: el escenario de recogida de salud es sensible al diseno de recompensas y este agente puede servir como referencia base.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 75,00 +/- 2,00 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no declararse la arquitectura de la red, no puede estimarse con rigor. Para una politica convolucional tipica de ViZDoom, la inferencia suele caber en menos de 1 GB de VRAM, pero es una estimacion no confirmada por el autor.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA suficiente para Sample Factory deberia poder ejecutar la inferencia; el entrenamiento completo requiere mas recursos.
- Compatibilidad con GPU de consumo: probable en GPUs consumer modernas (RTX 3060 o superior) para inferencia, aunque no esta confirmado en la informacion disponible.
- Opciones de despliegue: Sample Factory (libreria declarada); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye agentes comparables del mismo autor ni referencias a otros modelos de RL en el mismo entorno con datos verificables.

## Limitaciones y advertencias

- La model card es minima: no declara licencia, idiomas, formato de pesos ni arquitectura, lo que impide evaluar su idoneidad para uso comercial.
- El resultado de `mean_reward` (75,00 +/- 2,00) esta declarado por el autor y no ha sido verificado de forma independiente.
- El agente esta especializado en un unico entorno; no se espera que generalice a otras tareas o mapas sin reentrenamiento.
- No es un modelo de lenguaje: no debe usarse para generacion de texto, codigo ni tareas de NLP.
- No se documentan sesgos, riesgos de alucinacion ni comportamientos emergentes; al ser una politica de RL, el riesgo principal es el sobreajuste al entorno de entrenamiento.
- Antes de cualquier uso en produccion, es necesario verificar la licencia y la configuracion exacta de entrenamiento con el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Coralfil/rl-doom-health
- Libreria Sample Factory: https://github.com/alex-petrenko/sample-factory
- Entorno ViZDoom: https://github.com/mwydmuch/ViZDoom
- Curso de Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course
