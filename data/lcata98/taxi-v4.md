# lcata98/Taxi-v4

## Resumen

Taxi-v4 es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno Taxi-v4 de Gymnasium. Lo publica el usuario lcata98 en Hugging Face como un artefacto de tipo `reinforcement-learning`, empaquetado en un fichero `q-learning.pkl` que se carga con `load_from_hub` y se ejecuta contra el entorno original mediante `gym.make(model["env_id"])`. No es un modelo de lenguaje ni una red neuronal profunda: es una tabla Q serializada, fruto de un entrenamiento sobre un entorno de juguete con espacio de estados y acciones discretos.

El interés del repositorio es, por tanto, didáctico y de reproducibilidad: sirve para estudiar cómo se organiza un agente Q-Learning mínimo, cómo se empaqueta para el Hub y cómo se evalúa con el `model-index` estándar de Hugging Face. El autor declara un `mean_reward` de 7,56 ± 2,71 sobre el propio entorno Taxi-v4, un resultado modesto que sugiere un entrenamiento parcial o una política no completamente convergida.

La relevancia práctica es limitada fuera del ámbito educativo: no hay información sobre la licencia, los idiomas, el tamaño de los pesos ni los hiperparámetros de entrenamiento, y el repositorio ocupa 0,0 GB según los metadatos del Hub. Se trata, en la práctica, de un cuaderno de prácticas empaquetado como modelo, no de un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q serializada en `q-learning.pkl`) |
| Parametros totales | no disponible (tabla de estados-acciones, no red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de refuerzo, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |
| Entorno | Taxi-v4 (Gymnasium) |
| Pipeline | reinforcement-learning |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clásico: una tabla que asigna un valor Q a cada par estado-acción del entorno Taxi-v4. Taxi-v4 es un entorno discreto de Gymnasium en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadrícula, con 500 estados posibles y 6 acciones (moverse en cuatro direcciones, recoger y dejar). El agente aprende actualizando iterativamente `Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') − Q(s,a)]` sobre las transiciones observadas, sin función de aproximación ni red neuronal.

No se dispone de información sobre el número de episodios de entrenamiento, la tasa de aprendizaje α, el factor de descuento γ, la política de exploración (ε-greedy u otra) ni la composición exacta del bucle de entrenamiento. La model card únicamente indica que se trata de una "custom-implementation" de Q-Learning y muestra el fragmento de carga del agente, sin detallar hiperparámetros ni semillas. No hay indicios de RLHF, DPO ni técnicas modernas de alineación, algo esperable en un entorno de refuerzo tabular.

## Capacidades

- Resolución del entorno Taxi-v4: el agente selecciona acciones discretas (movimiento y recogida/entrega) para completar episodios de recogida y entrega de pasajeros.
- Aprendizaje por refuerzo tabular: implementa Q-Learning con actualización de valores estado-acción.
- Carga y evaluación estandarizada: se integra con `load_from_hub` de Hugging Face y con `gym.make` para reproducir la evaluación.
- Registro de métricas vía `model-index`: declara `mean_reward` sobre el dataset/entorno Taxi-v4.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de generación de texto de ningún tipo.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el agente sirve como ejemplo mínimo y reproducible de Q-Learning tabular para cursos introductorios, cargándolo con `load_from_hub` y ejecutándolo contra `gym.make("Taxi-v4")`.
- Estudio de empaquetado en Hugging Face: útil para entender cómo se estructura un repositorio de `reinforcement-learning`, cómo se serializa una tabla Q en pickle y cómo se declara un `model-index` con métricas.
- Reproducción de experimentos: permite comparar una política Q-Learning concreta contra otras implementaciones del mismo entorno (por ejemplo, las publicadas por otros usuarios como TacocaT478/Taxi-v4 o LATlag/Taxi-V4).
- Base para extensiones: el fichero `q-learning.pkl` puede servir de punto de partida para experimentar con variantes (SARSA, Double Q-Learning, ε-greedy adaptativo) sobre Taxi-v4.
- Pruebas de infraestructura de evaluación: útil para validar pipelines internos que cargan agentes desde el Hub y ejecutan rollouts en entornos Gymnasium.
- Referencia de línea base: el `mean_reward` declarado (7,56 ± 2,71) puede usarse como cota inferior frente a la que medir agentes mejor entrenados en el mismo entorno.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados por Hugging Face):

| Tarea | Dataset/entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7,56 ± 2,71 | false |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el artefacto es una tabla Q en pickle de tamaño despreciable (el repositorio ocupa 0,0 GB).
- GPU recomendadas: no requiere GPU; la inferencia es una consulta a una tabla en CPU.
- Cabe en cualquier GPU consumer y también en CPU, Raspberry Pi o entornos sin acelerador.
- Opciones de despliegue: carga directa con `load_from_hub` y ejecución con `gym.make`; no aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; al ser una consulta a tabla, la latencia vendrá dominada por el bucle del entorno Gymnasium, no por el modelo.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lcata98/Taxi-v4 | Taxi-v4 | Q-Learning | mean_reward 7,56 ± 2,71 | no disponible | Hugging Face |
| TacocaT478/Taxi-v4 | Taxi-v3 | Q-Learning | no disponible | no disponible | Hugging Face |
| LATlag/Taxi-V4 | Taxi-v3 | Q-Learning | no disponible | no disponible | Hugging Face |

Los dos comparables detectados en la búsqueda web no publican métricas en la información disponible, por lo que no es posible establecer una comparación cuantitativa fiable de rendimiento.

## Limitaciones y advertencias

- Resultado modesto: un `mean_reward` de 7,56 ± 2,71 en Taxi-v4 indica una política que dista de la óptima (el máximo del entorno es 20 por episodio), con alta varianza entre episodios.
- Sin información de entrenamiento: se desconocen episodios, hiperparámetros, semilla y criterio de parada, lo que impide reproducir el entrenamiento.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Formato pickle: `q-learning.pkl` requiere `pickle.load` y debe tratarse como entrada no confiable; cargar pickles de origen desconocido es un riesgo de seguridad.
- Acoplamiento al entorno: la tabla Q solo es válida para Taxi-v4; no generaliza a otros entornos ni a variantes con distinta dinámica.
- Sin capacidades de lenguaje: no debe confundirse con un modelo generativo; no procesa texto, no soporta tool calling ni agentes multi-paso.
- Métrica no verificada: el `model-index` marca `verified: false`, por lo que el resultado debe tomarse como declaración del autor.
- Sin sesgos lingüísticos ni de alucinación en el sentido habitual, al no generar texto; los riesgos son de política subóptima y de seguridad del pickle.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lcata98/Taxi-v4
- Comparable TacocaT478/Taxi-v4: https://huggingface.co/TacocaT478/Taxi-v4
- Ficha de LATlag/Taxi-V4 (Essa Mamdani): https://essamamdani.com/ai-models/hf-latlag-taxi-v4
