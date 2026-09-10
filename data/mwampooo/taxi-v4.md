# Mwampooo/Taxi-v4

## Resumen

Taxi-v4 es un agente de aprendizaje por refuerzo publicado en Hugging Face por el usuario Mwampooo. No es un modelo de lenguaje ni una red neuronal: es una política tabular entrenada con Q-learning sobre el entorno Taxi-v3 de Gymnasium, el problema clásico de recogida y entrega de pasajeros en una cuadrícula de 5x5 con 500 estados discretos y 6 acciones (sur, norte, este, oeste, recoger, dejar).

El artefacto se distribuye como un fichero `q-learning.pkl` que se carga con `load_from_hub` y se evalúa contra el entorno devuelto por `gym.make(model["env_id"])`. El autor declara un `mean_reward` de 7.56 ± 2.71 sobre Taxi-v3, cifra coherente con una política que completa el episodio en unas 12 o 13 decisiones de media, dado que el entorno otorga +20 por entrega correcta y -1 por paso. El resultado está marcado como no verificado (`verified: false`).

Su relevancia es acotada y didáctica: sirve como baseline reproducible para prácticas de Q-learning, comparación de algoritmos tabulares y validación de pipelines de evaluación de RL. No tiene aplicación en generación de texto, visión, código ni tareas de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (implementación propia, etiqueta `custom-implementation`); sin red neuronal |
| Parametros totales | No disponible en la información proporcionada; el tamaño equivale al número de pares estado-acción almacenados en la tabla Q (Taxi-v3 tiene 500 estados × 6 acciones, hasta 3000 entradas si la tabla es densa) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: el agente consume un estado discreto de Taxi-v3, no una secuencia de tokens) |
| Tipos de cuantizacion | No aplica (no hay pesos neuronales que cuantizar) |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | No disponible |
| Formato de pesos | No disponible de forma explícita en la ficha del repositorio; el README referencia un fichero `q-learning.pkl` (serialización pickle de Python) |
| Entorno | Taxi-v3 (Gymnasium) |
| Tarea declarada (pipeline) | `reinforcement-learning` |
| Metrica declarada | `mean_reward` = 7.56 ± 2.71 (no verificada) |
| Tamaño del repositorio | 0.0 GB (según la API de Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-09-10 (ambas) |

## Arquitectura y entrenamiento

Q-learning es un método de control off-policy basado en diferencias temporales: el agente actualiza iterativamente el valor `Q(s,a)` hacia `r + γ·max Q(s',a')` sin necesitar un modelo del entorno. La etiqueta `custom-implementation` indica que la tabla Q y el bucle de entrenamiento están escritos por el autor en lugar de heredarse de una librería estándar como Stable-Baselines3. Al ser una representación tabular, la política es exacta para los 500 estados del entorno y no requiere generalización entre estados, lo que elimina el problema de olvido catastrófico pero impide transferir a estados no vistos.

No se dispone de información sobre hiperparámetros (tasa de aprendizaje, factor de descuento, política de exploración epsilon-greedy o decaimiento), número de episodios, semillas ni curva de aprendizaje. Tampoco hay datos sobre composición del dataset: el entrenamiento se realiza por interacción directa con el simulador Taxi-v3, por lo que no existe corpus de tokens ni fases de RLHF o DPO. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, planificación jerárquica ni búsqueda integrada).

## Capacidades

- Selección de acciones discretas en Taxi-v3: decidir entre las 6 acciones del entorno a partir del estado entero que devuelve `env.reset()`.
- Resolución del ciclo completo de la tarea: localizar al pasajero, recogerlo, desplazarse y dejarlo en el destino correcto maximizando la recompensa acumulada.
- Política determinista en inferencia: al ser una tabla, la acción para un estado dado es siempre la misma (salvo que se aplique exploración en tiempo de ejecución).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes con razonamiento multi-paso en el sentido de los agentes basados en LLM; su "multi-paso" se limita a la secuencia de decisiones dentro de un episodio de Taxi-v3.
- Sin capacidades multilingües.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el fichero pickle se carga en unas pocas líneas y permite a estudiantes inspeccionar una tabla Q entrenada, comparar sus valores y reproducir el bucle de evaluación frente a Taxi-v3 sin necesidad de GPU.
- Baseline de referencia en investigación: sirve como punto de comparación frente a variantes como SARSA, Double Q-learning o DQN en el mismo entorno, siempre que se documente el protocolo de evaluación (número de episodios, semillas y versión de Gymnasium), algo que la ficha no detalla.
- Validación de infraestructuras de evaluación de RL: útil para probar end-to-end un pipeline que descarga artefactos desde el Hub, instancia el entorno, ejecuta episodios y publica métricas, dado su reducido tamaño y su coste computacional mínimo.
- Generación de trayectorias de demostración para imitation learning: la política puede rodar en Taxi-v3 para producir pares estado-acción que alimenten un clon de comportamiento o un modelo supervisado que generalice a variantes del entorno.
- Pruebas de integración de servidores de política: implementar un endpoint que reciba un estado entero y devuelva una acción es trivial y permite validar latencias, serialización y contratos de API antes de escalar a modelos neuronales.
- Prototipado de sistemas de asignación y despacho: la lógica de recogida y entrega con penalizaciones por pasos y por acciones inválidas es trasladable a simuladores internos de flotas o logística discreta, reutilizando la formulación del problema.
- Depuración de wrappers y entornos Gymnasium: al ser una política estable y determinista, facilita aislar fallos en wrappers de recompensa, observación o time-limit en lugar de atribuirlos al aprendizaje.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card:

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 ± 2.71 | No (`verified: false`) |

No se han publicado otros resultados de benchmarks en la información disponible. No se documenta el número de episodios de evaluación, la política de exploración usada durante la evaluación ni la versión del entorno, por lo que el valor no es directamente comparable con otras publicaciones sin asumir un protocolo idéntico.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El artefacto es una tabla de valores discretos cargada en memoria principal; el consumo estimado es de kilobytes, no de gigabytes.
- GPU recomendadas: ninguna. La inferencia es una consulta indexada por estado y puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: irrelevante; no requiere acelerador gráfico.
- Opciones de despliegue: Python con Gymnasium y carga del pickle mediante `load_from_hub` o `pickle.load`. No hay soporte de vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, ya que no existen pesos neuronales que servir.
- Latencia y throughput: no se han publicado medidas. Cualitativamente, el coste por decisión es el de una lectura en una estructura de datos indexada, despreciable frente al coste del `step()` del propio entorno de simulación.
- Dependencias relevantes: versión compatible de Gymnasium o Gym (el README usa `gym.make`), Python y la librería de carga del Hub. La reproducibilidad depende de fijar la versión del entorno.

## Comparativa con modelos similares

No se dispone de métricas publicadas de otros agentes en la información proporcionada, por lo que la comparación es estructural y no cuantitativa.

| Agente | Paradigma | Representacion | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taxi-v4 (este) | Q-learning off-policy | Tabla Q | Hasta 3000 entradas estado-acción (estimación) | No disponible | Hugging Face, 0 descargas |
| Agente SARSA en Taxi-v3 | TD control on-policy | Tabla Q | Órdenes similares | No disponible | No disponible |
| Agente DQN en Taxi-v3 | Deep RL off-policy | Red neuronal con replay buffer y red objetivo | Mayor que una tabla; valor concreto no disponible | No disponible | No disponible |
| Agente PPO en Taxi-v3 | Actor-crítico on-policy | Red neuronal de política y valor | Mayor que una tabla; valor concreto no disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La métrica declarada (7.56 ± 2.71) está marcada como no verificada y no se acompaña del protocolo de evaluación, por lo que no debe tratarse como un resultado reproducible.
- Ausencia total de licencia: no se concede ningún derecho explícito de uso, modificación ni redistribución, lo que desaconseja su uso en productos comerciales o en repositorios con requisitos de cumplimiento.
- Sin actividad comunitaria (0 descargas, 0 likes, creado y actualizado el mismo día), no existe validación externa, informes de errores ni mantenimiento.
- El README contiene una instrucción heredada de plantillas de otros entornos ("Don't forget to check if you need to add additional attributes (is_slippery=False etc)"); `is_slippery` es un parámetro de FrozenLake, no de Taxi-v3, lo que indica que el documento es un texto de plantilla y no una descripción fiable del artefacto.
- La ficha no documenta hiperparámetros, número de episodios, semillas ni curva de aprendizaje, lo que impide reproducir el entrenamiento.
- La varianza es alta (desviación de 2.71 sobre una media de 7.56), de modo que el rendimiento por episodio fluctúa de forma notable y las evaluaciones con pocos episodios no son concluyentes.
- Riesgo de sobreajuste al entorno exacto: la política tabular no generaliza a variaciones del espacio de estados (mapas mayores, más destinos, recompensas distintas) y queda inutilizable si cambia la codificación del estado.
- Sesgos del entorno: Taxi-v3 penaliza con -10 las acciones ilegales y con -1 cada paso, lo que favorece políticas que priorizan evitar penalizaciones frente a explorar rutas alternativas; no hay información sobre el comportamiento del agente en estados poco visitados.
- No es un modelo de lenguaje: cualquier expectativa de generación de texto, razonamiento o tool calling es inaplicable.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto); el riesgo análogo es una tabla Q mal poblada que devuelva acciones subóptimas o inválidas en estados no cubiertos por el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mwampooo/Taxi-v4
- Fichero de pesos referenciado en el README: `q-learning.pkl` dentro del repositorio anterior.
- Los resultados de búsqueda web disponibles no contienen enlaces relevantes: devuelven únicamente páginas de ayuda de Google Maps (direcciones, medición de distancias, Street View) sin relación con el modelo.
- No se han encontrado en la información proporcionada papers, blogs técnicos, repositorios de código ni demos asociados.
