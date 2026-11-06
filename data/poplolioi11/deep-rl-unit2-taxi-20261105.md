# poplolioi11/deep-rl-unit2-taxi-20261105

## Resumen

`unit2-taxi` es un agente de aprendizaje por refuerzo tabular basado en Q-learning, publicado por el usuario poplolioi11 en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de una tabla Q almacenada como array de NumPy que resuelve el entorno clásico `Taxi-v3` de Gymnasium. El autor lo presenta como un ejercicio de la unidad 2 de un curso de deep reinforcement learning, entrenado desde cero sin políticas preentrenadas ni controladores escritos a mano.

El modelo resuelve el problema de navegación y recogida de pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones de recogida y entrega, un espacio de observaciones discreto de 500 estados y 6 acciones posibles. La política resultante selecciona la acción con mayor valor Q para el estado observado mediante `argmax` sobre la fila correspondiente del array.

Su relevancia es fundamentalmente educativa y de referencia: sirve como línea base reproducible para comparar algoritmos de RL tabular, para verificar pipelines de evaluación en `Taxi-v3` y como ejemplo mínimo de empaquetado de pesos de RL en Hugging Face. No tiene aplicación en producción como modelo generativo ni como política para entornos continuos o de alta dimensionalidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q de dimensiones estado x acción) |
| Parámetros totales | 500 estados x 6 acciones = 3000 valores Q (estimado a partir del espacio de observación de Taxi-v3) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en NumPy float, sin cuantización publicada) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | array de NumPy (`.npy`), cargado con `allow_pickle=False` |

## Arquitectura y entrenamiento

La arquitectura es una tabla Q clásica de Q-learning, sin función de aproximación. El agente mantiene un valor Q para cada par (estado, acción) del entorno `Taxi-v3`, cuyo espacio de observaciones es discreto (500 estados) y cuyo espacio de acciones consta de 6 movimientos (norte, sur, este, oeste, recoger pasajero, dejar pasajero). La política en inferencia es determinista: `argmax` sobre la fila del estado observado.

El autor declara que el entrenamiento se realizó desde cero en el entorno original, sin modificaciones de recompensa, sin controlador escrito a mano y sin importar políticas preentrenadas. No se especifican en la información disponible la tasa de aprendizaje, el factor de descuento, la política de exploración (epsilon-greedy u otra), el número de episodios de entrenamiento ni la composición del dataset (en RL tabular no aplica un dataset en el sentido supervisado). El código de entrenamiento permanece privado; solo se publican los pesos, las métricas de simulación y, opcionalmente, una repetición (replay) del primer episodio de holdout.

La evaluación se realizó sobre 1000 episodios de holdout separados, con media 7,861 y desviación estándar poblacional 2,493. El autor indica que la selección del modelo no utilizó este conjunto de holdout, lo que reduce (aunque no elimina) el riesgo de sobreajuste a la evaluación.

## Capacidades

- Selección de acción determinista en `Taxi-v3` mediante `argmax` sobre la tabla Q.
- Resolución del problema de recogida y entrega de pasajeros en la cuadrícula de 5x5 del entorno.
- Carga directa de pesos como array de NumPy con `allow_pickle=False`, lo que evita ejecución de código arbitrario al deserializar.
- Reproducibilidad de la evaluación declarada: 1000 episodios de holdout con media y desviación estándar publicadas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No generaliza a otros entornos sin reentrenamiento.

## Casos de uso

- Docencia y cursos de RL: el modelo sirve como ejemplo mínimo y reproducible de Q-learning tabular empaquetado en Hugging Face, útil para que estudiantes comparen su propia implementación contra una referencia con métricas declaradas.
- Verificación de pipelines de evaluación: al publicar media y desviación estándar sobre 1000 episodios de holdout, permite comprobar que un harness de evaluación de `Taxi-v3` reproduce los mismos números antes de usarlo con algoritmos más complejos.
- Línea base para comparación de algoritmos: cualquier implementación de SARSA, Double Q-learning o DQN sobre `Taxi-v3` puede contrastarse contra la media de 7,861 para medir mejoras reales.
- Test de integración en frameworks de RL: sirve para validar la carga de pesos en formato NumPy y la interfaz de política `argmax` en pipelines propios antes de escalar a modelos mayores.
- Reproducibilidad de experimentos: el replay del primer episodio de holdout (incluyendo fallos) permite auditar que la política publicada se comporta como se declara.
- Referencia de empaquetado: como ejemplo de cómo publicar pesos de RL con licencia MIT, model-index y métricas verificables en Hugging Face, útil para equipos que quieran estandarizar sus propios artefactos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados por Hugging Face):

| Entorno | Métrica | Valor | Episodios |
|---|---|---|---|
| Taxi-v3 | mean_reward | 7,861 ± 2,493 (desviación estándar poblacional) | 1000 (holdout) |
| Taxi-v3 | mean - SD | 5,368 | 1000 (holdout) |

No se han publicado resultados adicionales de benchmarks en la información disponible. No hay comparación con otras políticas en la model card.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; la tabla Q ocupa unos pocos kilobytes (3000 valores en coma flotante).
- GPU recomendadas: no aplica; la inferencia es una operación `argmax` sobre un array de NumPy y se ejecuta en CPU sin problema.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: carga directa con NumPy (`np.load(..., allow_pickle=False)`) dentro de un bucle de Gymnasium; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no publicados; por la naturaleza de la operación (una indexación y un `argmax` sobre 6 valores) la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Media de recompensa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unit2-taxi (este) | Q-learning tabular | Taxi-v3 | 7,861 ± 2,493 | MIT | Hugging Face |
| Política aleatoria | Baseline | Taxi-v3 | no disponible en la información | no aplica | trivial de implementar |
| Q-learning tabular estándar | Q-learning tabular | Taxi-v3 | no disponible en la información | no aplica | implementación propia |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada. La comparación cuantitativa con SARSA, Double Q-learning o DQN sobre `Taxi-v3` requeriría ejecutar dichos algoritmos, lo que queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- El modelo es específico de `Taxi-v3`; no generaliza a otros entornos ni a variantes del entorno sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Los resultados de benchmark están declarados por el autor y marcados como no verificados (`verified: false`) en el model-index.
- El código de entrenamiento es privado, lo que limita la reproducibilidad completa del experimento; solo se publican pesos y métricas.
- El autor no reclama aceptación oficial del curso ni maestría humana independiente; la evaluación es automática sobre 1000 episodios.
- El tamaño del repositorio es de 0,0 GB, coherente con una tabla Q pequeña, pero no se detalla el contenido exacto del artefacto.
- No hay información sobre sesgos, riesgos de alucinación ni restricciones de uso comercial más allá de la licencia MIT, que permite uso comercial sin restricciones adicionales.
- Al cargar pesos con `allow_pickle=False` se evita la ejecución de código arbitrario, pero conviene verificar la integridad del archivo `.npy` antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/poplolioi11/deep-rl-unit2-taxi-20261105
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
