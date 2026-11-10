# mobley33/connectailab-rl-MOBLEY-v1-lunarlander

## Resumen

`connectailab-rl-MOBLEY-v1-lunarlander` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo DQN (Deep Q-Network) para resolver el entorno `LunarLander-v3` de Gymnasium. Lo publica el usuario `mobley33` bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS, en el contexto de un curso de quinta clase sobre aprendizaje por refuerzo. No es un modelo de lenguaje: es una política neuronal que asigna acciones discretas a partir de un vector de estado de 8 dimensiones.

El modelo resuelve un problema muy acotado: controlar la nave del simulador LunarLander para que aterrice de forma estable en la plataforma. Recibe ocho variables numéricas (posición x e y, velocidades x e y, inclinación, velocidad angular y contacto de cada una de las dos patas) y emite una de cuatro acciones (no hacer nada, motor izquierdo, motor central, motor derecho). La red es un perceptrón multicapa de tres capas con 256 unidades ocultas y activación ReLU.

Su relevancia es fundamentalmente didáctica: sirve como referencia reproducible de un DQN con experiencia de repetición (replay buffer) y red objetivo, útil para comparar hiperparámetros, estudiar curvas de aprendizaje o validar infraestructura de evaluación en entornos clásicos de control. El autor declara una recompensa media de 260,3 sobre 50 episodios no vistos, por encima del umbral de 200 que se suele considerar resolución del entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con dos capas ocultas de 256 unidades y ReLU; agente DQN con red objetivo |
| Parametros totales | Aproximadamente 69.892 (8×256 + 256 + 256×256 + 256 + 256×4 + 4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entorno de refuerzo con estado de 8 dimensiones, sin contexto secuencial) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; pesos en FP32 por defecto de PyTorch) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (state_dict de PyTorch, `torch.save`) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal densa que mapea un estado de 8 entradas a 4 valores Q, uno por acción. La topología declarada es 8 → 256 → 256 → 4 con activación ReLU entre capas. El entrenamiento sigue el esquema canónico de DQN: repetición de experiencias con un buffer de 50.000 transiciones, actualización cada 4 pasos de entorno, red objetivo sincronizada cada 250 actualizaciones y una política epsilon-greedy con decaimiento de 1,0 a 0,1.

Los hiperparámetros declarados son: 300.000 pasos totales de entorno, tasa de aprendizaje de 0,00063, factor de descuento de 0,99 y tamaño de lote de 128. No se documentan detalles sobre el esquema de decaimiento de epsilon, la semilla aleatoria, el número de ejecuciones ni la composición exacta de los episodios de evaluación. Tampoco se indica si se aplicó doble DQN (Double DQN), dueling architecture o prioritised replay; por los datos disponibles, cabe asumir un DQN estándar.

## Capacidades

- Control de política discreta en el entorno `LunarLander-v3`: selecciona una de cuatro acciones a partir de un estado de 8 valores continuos.
- Toma de decisiones reactiva de un solo paso, sin memoria interna ni estado recurrente.
- Inferencia en CPU sin dependencias más allá de PyTorch, al tratarse de una red de pequeño tamaño.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación explícita más allá de la implícita en los valores Q.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo reproducible de un DQN funcional para ilustrar el bucle de interacción agente-entorno, el cálculo de la pérdida de Bellman y la sincronización de la red objetivo en un curso introductorio.
- Línea base en experimentos de comparación: al estar entrenado con hiperparámetros explícitos y una recompensa media declarada de 260,3, se puede usar como referencia para evaluar variantes como Double DQN, Dueling DQN o PPO en el mismo entorno.
- Pruebas de integración de pipelines de RL: su reducido tamaño permite validar infraestructura de entrenamiento, evaluación y registro de métricas en `Gymnasium` sin coste computacional significativo.
- Evaluación de robustez y generalización: permite estudiar la varianza de la recompensa en episodios no vistos y analizar la sensibilidad a la semilla inicial, dado que el autor reporta el resultado sobre 50 episodios nuevos.
- Demostraciones interactivas: se puede cargar en un cuaderno y visualizar la política resultante con el renderizado de `LunarLander-v3` o con el vídeo `replay.mp4` incluido en el repositorio.
- Componente de sistemas multiagente o de currículo: al ser una política ligera y determinista en inferencia, puede integrarse como oponente o como subpolítica en entornos de simulación más amplios.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index`, sin verificación independiente.

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| LunarLander-v3 | Recompensa media en 50 episodios no vistos | 260,3 | No |
| LunarLander-v3 | Umbral de resolución del entorno | 200 | No aplica |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB para los pesos en FP32 (unas 280 KB), más el overhead del runtime de PyTorch.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Funciona igualmente en GPU si se traslada el tensor con `map_location`.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU, y también en Raspberry Pi y entornos embebidos.
- Opciones de despliegue: PyTorch nativo (carga de `state_dict`), TorchScript o exportación a ONNX para inferencia en C++ o en el navegador. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; por el tamaño de la red, la inferencia por paso debería situarse en el orden de microsegundos en CPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Recompensa media declarada | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-MOBLEY-v1-lunarlander | DQN | LunarLander-v3 | ~69.892 | 260,3 | No disponible |
| Políticas DQN de referencia de Stable-Baselines3 | DQN | LunarLander-v3 | Configurable (MLP) | No disponible en esta ficha | MIT (biblioteca) |
| Políticas PPO de referencia de Stable-Baselines3 | PPO | LunarLander-v3 | Configurable (MLP) | No disponible en esta ficha | MIT (biblioteca) |
| Políticas A2C de referencia de Stable-Baselines3 | A2C | LunarLander-v3 | Configurable (MLP) | No disponible en esta ficha | MIT (biblioteca) |

No se dispone de resultados numéricos comparables publicados en la información proporcionada para las alternativas, por lo que la comparación se limita a algoritmo, entorno y disponibilidad.

## Limitaciones y advertencias

- El resultado de 260,3 no está verificado (`verified: false`); procede únicamente de la declaración del autor y no se acompaña de código de evaluación ni de semillas.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- El modelo está especializado exclusivamente en `LunarLander-v3`; no generaliza a otros entornos ni a variaciones del espacio de estados o de acciones.
- No hay información sobre sesgos, pero al ser una política entrenada con una única semilla declarada, puede presentar alta varianza entre ejecuciones y sobreajuste a la dinámica concreta del simulador.
- No se documentan curvas de aprendizaje, número de semillas ni intervalos de confianza, por lo que la robustez del resultado es desconocida.
- El repositorio tiene un tamaño de 0,0 GB y cero descargas, lo que sugiere que los artefactos pueden no estar completos o que el modelo es muy reciente; conviene verificar la presencia de `model.pt` y `replay.mp4` antes de usarlo.
- No apto para tareas de lenguaje natural, visión, audio ni razonamiento simbólico general.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mobley33/connectailab-rl-MOBLEY-v1-lunarlander)
- [CONNECT AI LAB (GitHub)](https://github.com/wonseokjung/connect-tycoon)
- [AI CITY BUILDERS — curso de RL](https://www.aicitybuilders.com/robot)
