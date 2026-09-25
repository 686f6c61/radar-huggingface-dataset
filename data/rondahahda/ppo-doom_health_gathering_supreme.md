# rondahahda/ppo-doom_health_gathering_supreme

## Resumen

`rondahahda/ppo-doom_health_gathering_supreme` es un agente de aprendizaje por refuerzo profundo entrenado con PPO (Proximal Policy Optimization) sobre el escenario `doom_health_gathering_supreme` de ViZDoom. No es un modelo de lenguaje ni un modelo multimodal generativo: se trata de una política de control entrenada para maximizar la recolección de botiquines en un entorno 3D con observaciones visuales y recompensa relativamente dispersa. Lo publica el usuario rondahahda como artefacto de un curso de aprendizaje por refuerzo profundo.

El entrenamiento se realizó desde cero en Google Colab con Sample Factory 2.1.1, ViZDoom 1.2.4 y PyTorch 2.2.2, con asistencia de Codex para el curso de Deep RL de Hugging Face. El resultado publicado es un único checkpoint (`best_000000547_2240512_reward_20.129.pth`), evaluado de forma determinista durante 20 episodios completos con una recompensa media de 9,9215 y una desviación típica de 4,8554 (media menos desviación: 5,0661).

Su relevancia es acotada y de carácter formativo o de referencia: sirve como ejemplo reproducible de un pipeline de entrenamiento PPO con Sample Factory, como baseline para comparar algoritmos en el mismo entorno y como punto de partida para experimentos de ajuste fino. El repositorio declara 0 descargas y 0 me gusta, no incluye licencia y su tamaño se reporta como 0,0 GB, por lo que debe tratarse como un artefacto no validado por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible. Política actor-crítico entrenada con PPO mediante Sample Factory 2.1.1 sobre observaciones visuales del entorno ViZDoom |
| Parámetros totales | No disponible (el tamaño del repositorio se declara como 0,0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el agente procesa observaciones por fotograma y mantiene estado recurrente interno si la arquitectura de la librería lo define) |
| Tipos de cuantización | No disponible. Los pesos se publican como checkpoint de PyTorch |
| Idiomas soportados | No aplica |
| Licencia | No disponible |
| Formato de pesos | `.pth` (checkpoint de PyTorch); archivo publicado: `checkpoint_p0/checkpoint_000000547_2240512_reward_20.129.pth` |

## Arquitectura y entrenamiento

La model card no detalla la topología de la red. Se sabe que el entrenamiento se hizo con Sample Factory 2.1.1, una librería de aprendizaje por refuerzo asíncrona y altamente paralelizada, y que el algoritmo es PPO. En los ejemplos de ViZDoom de esa librería, la política se implementa habitualmente como una red convolucional que procesa el buffer de píxeles del juego y produce una distribución sobre el espacio de acciones discreto; no obstante, esta ficha no puede confirmar la configuración concreta (número de capas, canales, presencia de capa recurrente ni dimensión de la capa oculta) porque no figura en la información proporcionada. El archivo `config.json` del repositorio contendría esos detalles.

El comando de entrenamiento documentado es `python -m sf_examples.vizdoom.train_vizdoom --env=doom_health_gathering_supreme --experiment=doom-course-20260925 --train_dir=/content/doom-train --num_workers=2 --num_envs_per_worker=4 --train_for_env_steps=4000000 --device=gpu --save_every_sec=60 --with_wandb=False`. Es decir, 2 workers con 4 entornos cada uno (8 entornos en paralelo), un presupuesto máximo de 4.000.000 de pasos de entorno, guardado cada 60 segundos y ejecución en GPU. El entrenamiento se detuvo de forma anticipada al superar un checkpoint el umbral de evaluación definido por el curso, no por convergencia completa. El checkpoint final corresponde al paso 547 con 2.240.512 pasos de entorno acumulados. No se documenta uso de RLHF, DPO ni ningún mecanismo de ajuste por preferencias, algo por otro lado impropio de este tipo de agente.

## Capacidades

- Control de agente en el escenario `doom_health_gathering_supreme` de ViZDoom: la política selecciona acciones discretas a partir de observaciones visuales del entorno.
- Aprendizaje de una conducta de supervivencia y recolección: el objetivo del escenario es maximizar la recolección de botiquines antes de que se agote la salud.
- Inferencia determinista: la evaluación publicada se realizó con `deterministic policy: True`, de modo que la política produce acciones reproducibles dado el mismo estado.
- Integración con Sample Factory: puede cargarse con la función `enjoy` de la librería para evaluar episodios y registrar recompensas individuales.
- Entrenamiento reproducible en hardware modesto: el pipeline completo se ejecutó en Google Colab con GPU y con `--num_workers=2 --num_envs_per_worker=4`.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente multi-paso en el sentido de orquestación con herramientas externas; su "razonamiento" se limita a la política de control dentro del entorno.
- No tiene capacidades multilingües, de generación de texto, de código, matemáticas, visión general, audio ni modo de pensamiento explícito.

## Casos de uso

- Material docente para cursos de aprendizaje por refuerzo: el repositorio incluye el comando exacto de entrenamiento, el `config.json` y el `evaluation.json`, por lo que un alumno puede reproducir el experimento en Colab y comparar su propia recompensa media con la publicada (9,9215 en 20 episodios).
- Baseline para comparación de algoritmos: sirve como referencia PPO frente a otros algoritmos (por ejemplo, APPO, SAC o variantes con currículo) evaluados en el mismo escenario `doom_health_gathering_supreme`, siempre que se use la misma configuración de evaluación determinista y el mismo número de episodios.
- Punto de partida para ajuste fino con transferencia: al ser un checkpoint ya entrenado en un entorno de recolección con recompensa dispersa, puede inicializar experimentos en escenarios relacionados de ViZDoom, reduciendo el número de pasos necesarios frente a entrenar desde cero.
- Pruebas de infraestructura de entrenamiento distribuido: el agente permite medir el rendimiento de Sample Factory (pasos por segundo, uso de GPU, escalado con `num_workers` y `num_envs_per_worker`) en una GPU de consumo, dado que el entrenamiento original cabía en una instancia de Colab.
- Generación de trayectorias para aprendizaje por imitación: la política puede desplegarse para recolectar episodios etiquetados con acciones, útiles como datos de demostración para entrenar políticas alternativas o para estudiar imitación en entornos visuales.
- Evaluación de robustez y estabilidad de políticas: con una desviación típica de 4,8554 sobre una media de 9,9215, el checkpoint es un caso útil para analizar la varianza episódica, el efecto de la estocasticidad del entorno y la diferencia entre evaluación determinista y estocástica.
- Pruebas de despliegue de inferencia de baja latencia: al no requerir un modelo de lenguaje, puede ejecutarse en un bucle de control con GPU o incluso CPU para medir latencia de decisión por fotograma en un escenario de simulación.
- Investigación sobre crédito temporal y recompensa dispersa: el escenario de recolección de salud es un banco de pruebas clásico para estudiar cómo una política PPO aprende a sobrevivir sin una señal de recompensa densa.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` y en la model card. Evaluación sobre 20 episodios completos con política determinista.

| Tarea | Entorno / dataset | Métrica | Valor |
|---|---|---|---|
| Aprendizaje por refuerzo | `doom_health_gathering_supreme` | `mean_reward` | 9,92149999999992 +/- 4,8553715357324325 |
| Aprendizaje por refuerzo | `doom_health_gathering_supreme` | Media menos desviación típica | 5,0661284642674875 (calculado por el autor) |
| Aprendizaje por refuerzo | `doom_health_gathering_supreme` | Recompensa indicada en el nombre del checkpoint | 20,129 |

Notas sobre estos datos: la métrica del `model-index` está marcada como `verified: false`, es decir, no ha sido verificada de forma independiente. La recompensa de 20,129 aparece únicamente en el nombre del archivo del checkpoint y corresponde a la evaluación realizada durante el entrenamiento (criterio de mejor modelo), no al resultado de los 20 episodios de la evaluación final. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. Dado que el entrenamiento completo se ejecutó en Google Colab sobre GPU (entorno con 12-16 GB de VRAM en sus configuraciones habituales) y que el agente procesa observaciones visuales de baja resolución propias de ViZDoom, es razonable esperar un consumo de memoria muy inferior al de un modelo de lenguaje, pero no hay medición publicada.
- GPU recomendadas: no disponible. El entrenamiento documentado se hizo con `--device=gpu` en Colab; no se especifica el modelo de GPU empleado.
- GPU de consumo: probablemente suficiente cualquier GPU con soporte CUDA (por ejemplo, gama RTX) e incluso ejecución en CPU para inferencia de un único agente, si bien esto es una inferencia razonada y no un dato confirmado en la model card.
- Opciones de despliegue: Sample Factory 2.1.1 con ViZDoom 1.2.4 y PyTorch 2.2.2. La model card menciona expresamente la función `enjoy` de Sample Factory para evaluación. No se documentan otros runners (vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje).
- Latencia y throughput: no disponible. Únicamente se conoce el volumen de entrenamiento (2.240.512 pasos de entorno en el checkpoint publicado, con un límite configurado de 4.000.000) y la frecuencia de guardado (cada 60 segundos), que no permiten derivar pasos por segundo con fiabilidad.
- Nota de portabilidad: el script de evaluación es la función `enjoy` instrumentada para guardar recompensas individuales, y su argumento de directorio de entrenamiento debe ajustarse al ejecutarlo en otra máquina.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables dentro de la información proporcionada. La comparación natural sería con otros checkpoints entrenados con Sample Factory sobre el mismo entorno `doom_health_gathering_supreme` (por ejemplo, los utilizados como referencia en el curso de Deep RL de Hugging Face), pero no se han facilitado sus métricas, tamaños ni licencias.

| Modelo | Parámetros | Contexto | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rondahahda/ppo-doom_health_gathering_supreme` | No disponible | No aplica | 9,9215 +/- 4,8554 (20 episodios, determinista) | No disponible | Hugging Face, 0 descargas, 0 me gusta |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia, no puede confirmarse que el uso comercial esté permitido. Cualquier uso en producción debería aclararse previamente con el autor.
- Artefacto sin validación externa: el repositorio declara 0 descargas y 0 me gusta, y la métrica del `model-index` figura como `verified: false`.
- Alta varianza en el rendimiento: la desviación típica (4,8554) equivale a cerca del 49 % de la recompensa media (9,9215). La diferencia media menos desviación (5,0661) es positiva, pero el intervalo de resultados por episodio es amplio, lo que implica un comportamiento poco consistente entre episodios.
- Evaluación limitada: solo 20 episodios completos con política determinista. No se reportan resultados con política estocástica ni con otras semillas, y no se aportan intervalos de confianza ni pruebas de significación.
- Entrenamiento detenido por umbral, no por convergencia: el autor indica que el entrenamiento se detuvo cuando un checkpoint superó el umbral de evaluación del curso. Esto sugiere que la política podría mejorar con más pasos y que el checkpoint publicado puede estar ajustado a un criterio concreto de evaluación.
- Dependencia de versiones concretas: Sample Factory 2.1.1, ViZDoom 1.2.4 y PyTorch 2.2.2. Cambios de versión pueden romper la carga del checkpoint o alterar el comportamiento del entorno.
- Ámbito de aplicación muy restringido: la política está especializada en un único escenario de ViZDoom. No es transferible sin ajuste fino a otras tareas, entornos ni dominios.
- Sesgos: no se han documentado sesgos específicos, pero al tratarse de una política entrenada sobre un simulador, hereda las particularidades de la dinámica y del motor del juego, y puede explotar comportamientos propios del simulador que no se trasladan a entornos reales.
- Riesgo de alucinación: no aplica en el sentido habitual de los modelos generativos; sin embargo, sí existe riesgo de sobreajuste a la dinámica del entorno de entrenamiento y de degradación del rendimiento si cambian los parámetros del escenario.
- Ausencia de documentación técnica: la model card no describe la arquitectura, el número de parámetros, la composición de los datos de entrenamiento ni el proceso de selección de hiperparámetros. Los detalles deben extraerse del `config.json` del repositorio.
- Búsqueda web sin resultados útiles: las consultas realizadas no devolvieron ninguna página relacionada con el modelo; los resultados obtenidos eran contenido no relacionado. No se ha localizado ningún artículo, blog, repositorio auxiliar ni demostración que lo analice.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rondahahda/ppo-doom_health_gathering_supreme
- Archivos citados en la model card (dentro del repositorio): `config.json`, `evaluation.json`, `checkpoint_p0/checkpoint_000000547_2240512_reward_20.129.pth`
- Sample Factory (librería de entrenamiento mencionada en la model card; URL no verificada en la búsqueda): https://github.com/alex-petrenko/sample-factory
- ViZDoom (entorno mencionado en la model card; URL no verificada en la búsqueda): https://github.com/Farama-Foundation/ViZDoom
- Curso de Deep RL de Hugging Face (contexto del entrenamiento; URL no verificada en la búsqueda): https://huggingface.co/learn/deep-rl-course
- Resultados de búsqueda web: no se encontró ningún enlace relevante sobre este modelo. Las consultas devolvieron exclusivamente contenido no relacionado con aprendizaje por refuerzo, por lo que no se incluye ninguno.
