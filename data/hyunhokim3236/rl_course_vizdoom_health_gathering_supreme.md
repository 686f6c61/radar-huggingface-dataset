# HyunhoKim3236/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una política de aprendizaje por refuerzo profundo (deep RL) entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario HyunhoKim3236 en Hugging Face como artefacto de un curso de reinforcement learning, empleando la librería Sample-Factory 2.0 desarrollada por Alex Petrenko. El objetivo del agente es navegar un escenario 3D en primera persona de Doom y recoger botiquines de salud antes de que el jugador muera por daño acumulado, una tarea clásica de control continuo con observaciones visuales.

La relevancia es acotada: se trata de un checkpoint didáctico, no de un modelo de propósito general. No procesa lenguaje natural, no tiene ventana de contexto en el sentido de los LLM y no admite cuantización. Su interés radica en servir como referencia reproducible para quienes estudian RL con observaciones de píxeles, comparan algoritmos on-policy en ViZDoom o quieren reanudar el entrenamiento desde un punto concreto.

El rendimiento declarado por el autor es una recompensa media de 10,69 con desviación de 4,59 en el entorno `doom_health_gathering_supreme`, un valor que debe interpretarse dentro de la escala específica de esa tarea y que no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional + capas densas para política y función de valor, entrenada con APPO (Asynchronous Proximal Policy Optimization) sobre Sample-Factory 2.0 |
| Parametros totales | no disponible (no se publica el recuento; el repo pesa 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente RL; observaciones por fotograma, sin contexto textual) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos en GGUF ni formatos cuantizados; el checkpoint es específico de Sample-Factory) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint nativo de Sample-Factory (directorio de entrenamiento con pesos y estado del optimizador), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El agente sigue el esquema estándar de Sample-Factory para entradas visuales: un extractor convolucional que procesa los fotogramas del entorno ViZDoom y alimenta dos cabezas, una política de acciones y una función de valor, optimizadas conjuntamente mediante APPO. APPO combina la idea de PPO (recorte de la ratio de probabilidad para limitar actualizaciones) con un diseño asíncrono en el que varios workers recolectan experiencia en paralelo mientras un learner actualiza los pesos, lo que mejora la utilización de CPU y GPU en entornos con paso de simulación caro.

No se especifican en la información disponible el número total de pasos de entrenamiento, la composición exacta del currículo ni si se aplicaron técnicas auxiliares como reward shaping, normalización de recompensas o aumentos de datos. Tampoco se documenta la semilla ni el número de réplicas. El checkpoint se distribuye dentro de un directorio de experimento (`train_dir`) que permite reanudar el entrenamiento con `--restart_behavior=resume`, lo que sugiere que incluye estado del optimizador y contadores de pasos, aunque el contenido exacto no se detalla.

## Capacidades

- Control de agente en un entorno 3D en primera persona (ViZDoom) a partir de observaciones de píxeles.
- Política de recogida de objetos (botiquines de salud) con objetivo de supervivencia en `doom_health_gathering_supreme`.
- Entrenamiento asíncrono distribuido mediante APPO y Sample-Factory 2.0.
- Reanudación de entrenamiento desde el checkpoint publicado.
- Exportación y carga desde Hugging Face Hub con `sample_factory.huggingface.load_from_hub`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- No tiene capacidades multilingües: no procesa ni genera lenguaje.

## Casos de uso

- Reproducción de experimentos docentes: cargar el checkpoint con `load_from_hub` y ejecutar el script `enjoy` para observar la política entrenada en ViZDoom, útil en asignaturas de RL para ilustrar el ciclo entrenamiento-evaluación.
- Punto de partida para fine-tuning: reanudar el entrenamiento con `--restart_behavior=resume` y ajustar hiperparámetros de APPO para estudiar cómo varía la recompensa media respecto al valor declarado de 10,69 ± 4,59.
- Comparación de algoritmos on-policy: usar este checkpoint como referencia APPO frente a PPO síncrono u otros algoritmos en el mismo entorno, manteniendo fija la configuración del entorno.
- Estudio de robustez visual: evaluar la política bajo perturbaciones en los fotogramas (ruido, cambios de resolución, recortes) para medir la degradación de la recompensa, algo habitual en investigación de RL con píxeles.
- Análisis de varianza entre semillas: al disponer de un único checkpoint, sirve como base para lanzar réplicas con distintas semillas y cuantificar la dispersión del rendimiento en `doom_health_gathering_supreme`.
- Docencia sobre integración con Hugging Face Hub: demostrar el flujo completo de subida y descarga de artefactos de RL con `--push_to_hub` y `load_from_hub`, un caso práctico poco cubierto en tutoriales de LLM.
- Benchmark interno de infraestructura: medir throughput de recolección de experiencia y de actualización del learner en Sample-Factory 2.0 con este entorno como carga de trabajo representativa.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 10,69 ± 4,59 | No |

No se han publicado en la información disponible resultados comparativos con otros algoritmos, semillas o configuraciones para este mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo pesa 0,1 GB, por lo que el checkpoint cabe holgadamente en cualquier GPU consumer con 4 GB o más, e incluso en CPU para evaluación.
- GPU recomendadas: no se especifican. Para entrenamiento, Sample-Factory se beneficia de GPU con soporte CUDA (por ejemplo, RTX 3060 en adelante); para evaluación basta una GPU modesta o CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del artefacto.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), con soporte de ejecución en CPU o CUDA. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen del renderizado de ViZDoom, del número de workers y del hardware; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| HyunhoKim3236/rl_course_vizdoom_health_gathering_supreme | APPO (Sample-Factory) | doom_health_gathering_supreme | no disponible | no aplica | mean_reward 10,69 ± 4,59 (no verificado) | no disponible |
| Otros checkpoints APPO de Sample-Factory en ViZDoom | APPO (Sample-Factory) | variantes ViZDoom | no disponible | no aplica | no disponible | variable |
| Políticas PPO síncronas en ViZDoom | PPO | doom_health_gathering_supreme | no disponible | no aplica | no disponible | variable |

No se dispone de datos públicos comparables en la información proporcionada para establecer una comparación cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo es válido para el entorno `doom_health_gathering_supreme` y la configuración exacta de observaciones y acciones con la que se entrenó.
- Rendimiento no verificado: el valor 10,69 ± 4,59 procede del model-index del autor y no ha sido validado de forma independiente; la desviación estándar es elevada en relación a la media.
- Sin información de licencia: no se indica licencia, por lo que el uso comercial queda en un limbo legal y no se recomienda en producción sin aclaración previa.
- Sesgos conocidos: no documentados; en RL con píxeles es habitual el sobreajuste a la distribución visual del entorno de entrenamiento y la fragilidad ante cambios de textura, iluminación o resolución.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe riesgo de comportamientos degenerados fuera de distribución (políticas que se quedan atascadas o ignoran la recompensa).
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje.
- Dependencia de la versión de Sample-Factory: el checkpoint está atado a la API de Sample-Factory 2.0; cambios de versión pueden romper la carga o la reanudación.
- Ausencia de datos de entrenamiento: no se publican pasos totales, semillas ni currículo, lo que dificulta la reproducibilidad exacta.
- Escasa tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan contrastar el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyunhoKim3236/rl_course_vizdoom_health_gathering_supreme
- Repositorio Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
