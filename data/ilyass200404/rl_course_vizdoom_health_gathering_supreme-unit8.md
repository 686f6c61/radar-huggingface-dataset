# ilyass200404/rl_course_vizdoom_health_gathering_supreme-unit8

## Resumen

Este repositorio contiene un checkpoint de una política de aprendizaje por refuerzo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario ilyass200404 dentro de un curso de aprendizaje por refuerzo, y se apoya en Sample-Factory 2.0, el framework de entrenamiento distribuido de código abierto mantenido por Alex Petrenko. No se trata por tanto de un modelo de lenguaje, sino de un agente visual que aprende a moverse por un escenario 3D en primera persona para recoger botiquines y maximizar la supervivencia.

El problema que resuelve es acotado y de laboratorio: control secuencial a partir de píxeles crudos, con recompensa escasa y episodios de larga duración. El escenario *health gathering supreme* es una variante difícil del benchmark de ViZDoom en la que el agente debe localizar y consumir objetos de salud mientras la salud decae de forma continua, lo que exige tanto percepción visual como planificación a medio plazo. Es un caso habitual para comparar algoritmos de RL profundo y para estudiar estabilidad de entrenamiento con recompensas dispersas.

Su relevancia es fundamentalmente docente y de reproducibilidad: permite descargar, evaluar y continuar el entrenamiento de una política con un par de comandos del propio framework. No hay información pública sobre el número de parámetros de la red, la licencia o el dataset de entrenamiento, y el resultado declarado (recompensa media de 4,12 ± 0,51) aparece marcado como no verificado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization) sobre una política de red neuronal profunda; topología concreta (capas convolucionales/recurrentes) no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica; el agente consume observaciones del entorno (píxeles de ViZDoom), no secuencias de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint gestionado por Sample-Factory en el directorio de entrenamiento) |
| Algoritmo | APPO |
| Entorno | doom_health_gathering_supreme (ViZDoom) |
| Libreria y version | sample-factory 2.0 |
| Autor | ilyass200404 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB |
| Fecha de publicacion | 2026-09-16 |

## Arquitectura y entrenamiento

APPO es una variante asíncrona de PPO en la que varios workers recogen experiencias en paralelo mientras el learner actualiza los pesos, con una política de desfase controlado entre política de comportamiento y política objetivo para mantener la estabilidad del gradiente. La implementación concreta de este repositorio corresponde a Sample-Factory 2.0, que en entornos ViZDoom suele emplear una política con extractor convolucional para los fotogramas y componentes recurrentes para la memoria temporal, aunque la model card no especifica ni la topología exacta ni el número de parámetros.

No hay datos en la información disponible sobre el número de pasos de entorno, la composición del dataset de entrenamiento, el uso de técnicas de regularización ni sobre si se aplicó algún ajuste posterior tipo RLHF o DPO (que, por otra parte, no aplican a este tipo de agente). La model card únicamente documenta los comandos para descargar el checkpoint desde el Hub, evaluarlo con el script `enjoy` y reanudar el entrenamiento con `--restart_behavior=resume`, lo que confirma que el objeto publicado es un punto de control reanudable, no una versión final congelada de una política optimizada.

## Capacidades

- Control secuencial en primera persona a partir de observaciones visuales (píxeles) del entorno ViZDoom `doom_health_gathering_supreme`.
- Navegación y búsqueda de objetivos con recompensa escasa: localizar y consumir objetos de salud antes de que el indicador decaiga.
- Política entrenada específicamente para un único escenario; no se declara capacidad de generalización a otros mapas o entornos.
- Reanudación del entrenamiento desde el checkpoint publicado, con el comando documentado en la model card.
- Evaluación determinista con el script `enjoy` de Sample-Factory.
- Registro de métricas en TensorBoard durante el entrenamiento (etiqueta declarada por el autor).
- No dispone de tool calling, function calling, agentes multi-paso basados en lenguaje, capacidades multilingües ni modos de razonamiento textual: no es un modelo de lenguaje.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo reproducible de un entrenamiento APPO completo para que el alumnado descargue el checkpoint y compare curvas de recompensa frente a sus propias ejecuciones.
- Reproducción de resultados: al estar publicado con los comandos exactos de descarga y evaluación, permite verificar la recompensa media declarada (4,12 ± 0,51) en una máquina independiente.
- Punto de partida para *fine-tuning*: la model card documenta cómo reanudar el entrenamiento con `--restart_behavior=resume`, útil para experimentar con cambios de hiperparámetros, *reward shaping* o curriculum sin partir de cero.
- Comparación de algoritmos de RL: APPO frente a otras alternativas del catálogo de Sample-Factory (por ejemplo PPO o IMPALA) sobre el mismo entorno, manteniendo constante el escenario y variando solo el algoritmo.
- Investigación sobre recompensa escasa: `doom_health_gathering_supreme` es un banco de pruebas clásico para estudiar exploración y crédito temporal; el checkpoint puede usarse como línea base en estudios de nuevas funciones de recompensa o de exploración intrínseca.
- Pruebas de infraestructura de entrenamiento distribuido: validar el pipeline de Sample-Factory (workers, batch size, uso de GPU/CPU) con un entorno ligero antes de escalar a cargas mayores.
- Generación de datos de demostración: desplegar la política entrenada para grabar episodios y construir conjuntos de trayectorias que alimenten métodos de *imitation learning* o de aprendizaje inverso.
- Integración en un entorno de evaluación automatizada: usar el script `enjoy` dentro de un pipeline de CI que compruebe que un cambio en el código del algoritmo no degrada la recompensa media por debajo de un umbral.

## Benchmarks y rendimiento

| Modelo | Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| APPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 4,12 ± 0,51 | No |

Los datos proceden del `model-index` declarado por el autor. No hay resultados adicionales (otras métricas, comparación con líneas base o curvas de aprendizaje) en la información disponible. La información de búsqueda web recuperada no guarda relación con este modelo y no aporta datos de rendimiento.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publican ni el número de parámetros ni la configuración de red, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. La model card no indica el hardware empleado en el entrenamiento ni el recomendado para la evaluación.
- Viabilidad en GPU de consumo: no confirmada. Por la naturaleza del entorno (ViZDoom con observaciones de baja resolución) es habitual que políticas de este tipo quepan en GPUs de gama media e incluso funcionen solo en CPU, pero es una estimación general y no un dato de este repositorio.
- Opciones de despliegue: el propio framework Sample-Factory, mediante el script `enjoy` documentado en la model card. Sample-Factory también documenta exportación de políticas a TorchScript para despliegue fuera del framework; no se confirma en esta ficha que el checkpoint incluya dicha exportación.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos comparables con datos publicados para este mismo entorno. A continuación se indican alternativas de la misma categoría, sin cifras de rendimiento porque no están disponibles.

| Alternativa | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (APPO, doom_health_gathering_supreme) | Agente RL visual con APPO | no disponible | no aplica | no disponible | Hugging Face Hub, 0 descargas |
| Otros checkpoints APPO de Sample-Factory para ViZDoom | Agente RL visual con APPO | no disponibles | no aplica | variable segun repositorio | Hub de Hugging Face |
| Implementaciones de PPO/IMPALA en Sample-Factory para el mismo entorno | Agente RL visual | no disponibles | no aplica | MIT (licencia del framework, no del checkpoint) | Repositorio GitHub de Sample-Factory |
| Lineas base de RLlib o CleanRL para entornos ViZDoom | Agente RL visual | no disponibles | no aplica | Apache-2.0 / MIT segun proyecto | GitHub |

No se dispone de valores de recompensa media de estas alternativas en la información proporcionada, por lo que la comparación cuantitativa no puede realizarse.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, no puede confirmarse que el uso comercial o la redistribución del checkpoint estén permitidos. Conviene contactar con el autor antes de cualquier uso en producción.
- Métrica no verificada: la recompensa media de 4,12 ± 0,51 aparece marcada como `verified: false` en el `model-index`, es decir, es una cifra declarada por el autor y no comprobada por la plataforma.
- Sin línea base publicada: no se ofrece la recompensa de un agente aleatorio ni de un entrenamiento de referencia, por lo que no puede juzgarse si 4,12 es un buen resultado para este entorno.
- Especificidad total al entorno: la política está entrenada para `doom_health_gathering_supreme`; no hay evidencia de que transfiera a otros escenarios, resoluciones o configuraciones de recompensa.
- Ausencia de datos de entrenamiento: se desconocen los pasos de entorno, la semilla, la configuración de hiperparámetros y el número de parámetros, lo que dificulta la reproducibilidad exacta.
- Riesgo de sobreajuste al escenario: al ser un único entorno y presumiblemente una única configuración, el comportamiento fuera de la distribución de entrenamiento (mapas nuevos, cambios de textura) puede degradarse de forma abrupta.
- Sin garantías de robustez: los agentes de RL visual con recompensa escasa son sensibles a la semilla de inicialización; los resultados pueden variar notablemente entre ejecuciones.
- Cero descargas y cero interacciones: el repositorio no tiene validación por parte de la comunidad, lo que reduce la confianza en la calidad del checkpoint.
- Formato de pesos no documentado: la carga requiere instalar Sample-Factory y usar su herramienta específica, lo que limita la portabilidad a otros *runtimes* de inferencia.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K, ni emplearse para tareas de generación de texto, código o atención al cliente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilyass200404/rl_course_vizdoom_health_gathering_supreme-unit8
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
- Entorno ViZDoom (referencia del escenario): no disponible en la informacion proporcionada
