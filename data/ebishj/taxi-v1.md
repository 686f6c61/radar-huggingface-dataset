# Ebishj/Taxi-v1

## Resumen

Ebishj/Taxi-v1 no es un modelo de lenguaje ni una red neuronal profunda: es un agente de aprendizaje por refuerzo entrenado con Q-learning tabular sobre el entorno Taxi-v3 de Gym/Gymnasium. Lo publica el usuario Ebishj en Hugging Face como artefacto de un entrenamiento puntual, con el formato estándar que genera la librería de integración con el Hub (un fichero `q-learning.pkl` que contiene la tabla Q y el identificador del entorno). El problema que resuelve es el clásico de planificación discreta de Taxi-v3: recoger un pasajero y dejarlo en el destino con el menor coste acumulado de acciones.

Su relevancia es, por tanto, docente y metodológica, no competitiva. Sirve como referencia mínima de un agente RL funcional cargable desde el Hub, como baseline para comparar algoritmos (SARSA, DQN, PPO) en el mismo entorno y como ejemplo de extremo a extremo de un pipeline de entrenamiento y publicación. El autor declara una recompensa media de 7,48 ± 2,72 en Taxi-v3, un resultado no verificado y con una desviación típica alta.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,0 GB y no incluye información sobre licencia, idiomas (no aplica) ni hiperparámetros de entrenamiento. La model card se limita a la plantilla automática de la librería, con instrucciones de carga y una advertencia sobre posibles atributos adicionales del entorno (`is_slippery=False`, etc.).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (implementación propia, tag `custom-implementation`); política derivada de una tabla Q estado-acción |
| Parametros totales | no disponible; no hay red neuronal. El artefacto es `q-learning.pkl` (tabla Q serializada) y el tamaño exacto de la tabla no se detalla en la información disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el agente observa un estado discreto del entorno Taxi-v3, no secuencias de texto |
| Tipos de cuantizacion | no aplica / no disponible; no se publican versiones GGUF, AWQ, GPTQ ni equivalentes |
| Idiomas soportados | no aplica (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python), cargado con `load_from_hub(repo_id="Ebishj/Taxi-v1", filename="q-learning.pkl")` |

## Arquitectura y entrenamiento

El agente implementa Q-learning, un método de control off-policy basado en diferencias temporales (TD) que aprende directamente la función de valor-acción óptima sin necesidad de modelo del entorno. La política es implícita: en cada estado se selecciona la acción con mayor valor Q en la tabla, o una acción exploratoria según la política de exploración empleada. Al ser tabular, no hay representación paramétrica compartida ni generalización entre estados; el conocimiento queda codificado en entradas individuales de la tabla.

La información disponible no documenta el número de episodios, la tasa de aprendizaje, el factor de descuento, la política de exploración (epsilon-greedy u otra), el tamaño de la tabla ni si el entrenamiento se realizó con `is_slippery=False`. La model card solo advierte de que, al reconstruir el entorno, puede ser necesario añadir atributos adicionales al `gym.make(model["env_id"])` para reproducir las condiciones exactas del entrenamiento. No se menciona RLHF, DPO, decodificación especulativa ni ninguna innovación técnica: es una implementación de referencia sin aportaciones arquitectónicas.

## Capacidades

- Resolución del entorno Taxi-v3: recogida y entrega de pasajero en una cuadrícula discreta mediante una política greedy sobre la tabla Q aprendida.
- Control discreto estado-acción: dado un estado entero del entorno, devuelve la acción de mayor valor Q.
- Carga reproducible desde el Hub mediante `load_from_hub` y el fichero `q-learning.pkl`, que incluye el identificador de entorno (`env_id`).
- Integración con el ecosistema Gym/Gymnasium para evaluación con `stable-baselines3` o el `RL Zoo`/`experimental` de Hugging Face.
- Serialización en formato pickle, apta para inspección directa de la tabla Q (por ejemplo, para analizar la política estado por estado).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes multi-paso ni capacidades multilingües.
- No dispone de modo de razonamiento extendido (thinking mode) ni de ninguna capacidad especial declarada.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el agente sirve como ejemplo mínimo y ejecutable de Q-learning tabular; se carga en una libreta de Python y se ejecuta un episodio en Taxi-v3 para ilustrar la diferencia entre política aleatoria y política aprendida.
- Baseline para comparativas de algoritmos: cualquier implementación nueva de SARSA, DQN o PPO sobre Taxi-v3 puede contrastarse contra las 7,48 unidades de recompensa media declaradas por este agente, con la cautela de que el dato no está verificado.
- Prueba de integración de pipelines de carga: valida de extremo a extremo el flujo `load_from_hub` → `gym.make` → `evaluate`, útil para comprobar versiones de librerías tras una actualización de dependencias.
- Test de regresión en frameworks de RL: al ser determinista y de tamaño reducido, permite verificar que una refactorización del código de evaluación devuelve valores coherentes sin coste de GPU.
- Análisis didáctico de políticas: al estar la tabla Q en un pickle inspeccionable, se puede volcar la acción elegida para cada estado y visualizarla sobre la cuadrícula de Taxi-v3 para estudiar el comportamiento aprendido.
- Evaluación de robustez frente a estocasticidad: reproduciendo el entorno con `is_slippery=True` frente a `False` se puede medir cuánto degrada la política aprendida bajo transiciones estocásticas.
- Referencia en artículos o memorias técnicas: citable como agente RL publicado en el Hub cuando se necesite un ejemplo de artefacto mínimo reproducible (no por su rendimiento absoluto).

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card; no verificados (`verified: false`).

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,48 ± 2,72 | No |

No se han publicado otros resultados de benchmarks en la información disponible. El modelo no es comparable con métricas de lenguaje (MMLU, HumanEval, GSM8K), por lo que no se incluyen. La desviación típica de ± 2,72 sobre una media de 7,48 indica una varianza considerable entre episodios o semillas, y la ficha no aclara cuántos episodios componen la media ni con qué política de evaluación se obtuvo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el agente es una tabla Q en memoria y se ejecuta íntegramente en CPU.
- GPU recomendadas: ninguna. No se requiere A100, H100 ni RTX 4090; cualquier CPU sirve.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y entornos serverless con límites de memoria mínimos.
- Opciones de despliegue: Python 3 con `gym`/`gymnasium`, `pickle` y la utilidad de carga del Hub. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles como cifra publicada. Por la naturaleza del entorno (espacio de estados discreto y tabla tabular), la inferencia es una búsqueda en un diccionario o array, del orden de microsegundos por paso; el cuello de botella real es el propio simulador de Gym, no el modelo.
- Almacenamiento: el repositorio ocupa 0,0 GB, por lo que el despliegue no tiene requisitos apreciables de disco.

## Comparativa con modelos similares

| Modelo / referencia | Algoritmo | Entorno | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|---|
| Ebishj/Taxi-v1 | Q-learning tabular | Taxi-v3 | no disponible (tabla Q) | no aplica | no disponible | Hub de Hugging Face | mean_reward 7,48 ± 2,72 (no verificado) |
| Agente SARSA sobre Taxi-v3 | SARSA tabular (on-policy) | Taxi-v3 | no disponible | no aplica | no disponible | no disponible | no disponible |
| DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | no disponible | no aplica | no disponible | no disponible | no disponible |
| Política aleatoria sobre Taxi-v3 | — | Taxi-v3 | 0 | no aplica | no aplica | — | no disponible en esta información |

No se dispone de resultados publicados de las alternativas en la información proporcionada, por lo que la comparativa se limita a la categoría (agentes RL tabulares o profundos sobre el mismo entorno) sin cifras de rendimiento contrastables. Para una comparación con datos reales sería necesario ejecutar cada agente bajo el mismo número de episodios, semillas y configuración de `is_slippery`.

## Limitaciones y advertencias

- Especificidad total al entorno: la tabla Q solo es válida para Taxi-v3; no se transfiere a otros entornos ni a variantes con otro espacio de estados.
- Resultado no verificado: la recompensa media procede del `model-index` declarado por el autor, con `verified: false`, sin detalle de episodios, semillas ni configuración de evaluación.
- Varianza elevada: ± 2,72 sobre una media de 7,48 implica que el rendimiento por episodio puede oscilar de forma notable; no debe citarse como cifra estable sin reevaluación.
- Ausencia de hiperparámetros: no se documentan tasa de aprendizaje, descuento, exploración ni número de episodios, lo que impide reproducir el entrenamiento.
- Ambigüedad del entorno de evaluación: la propia model card advierte de que puede ser necesario añadir atributos como `is_slippery=False`; evaluar con la configuración por defecto puede arrojar resultados distintos a los declarados.
- Licencia no disponible: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en un producto.
- Riesgo de seguridad al cargar `pickle`: la deserialización de ficheros pickle puede ejecutar código arbitrario; hay que tratar el artefacto como no confiable y cargarlo en un entorno aislado.
- Sin soporte lingüístico ni de agentes: no admite texto, tool calling ni razonamiento multi-paso; cualquier uso en esos ámbitos sería un error de categoría.
- Sesgos: no se han documentado sesgos específicos, pero la política queda determinada por la función de recompensa del entorno, que prioriza exclusivamente eficiencia de recogida y entrega.
- Madurez: 0 descargas y 0 likes, repositorio de 0,0 GB creado y actualizado el mismo día (21-10-2026), sin mantenimiento ni historial de versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ebishj/Taxi-v1
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en los resultados de búsqueda web disponibles; los resultados devueltos no guardan relación con el modelo ni con aprendizaje por refuerzo y se han descartado.
