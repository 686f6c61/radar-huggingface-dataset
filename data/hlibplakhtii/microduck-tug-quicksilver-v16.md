# HlibPlakhtii/microduck-tug-quicksilver-v16

## Resumen

microduck-tug-quicksilver-v16 es una política de control para robótica simulada, publicada por HlibPlakhtii como un remix de competición sobre el modelo greecree/microduck-tug-of-war-tug-super-v9. Se distribuye en formato ONNX y está etiquetada como `microduck-policy`, dentro del ecosistema de simulación MicroDuck asociado a Pollen Robotics. El modelo no es un LLM ni un modelo generativo de texto: es una política de acciones que controla el comportamiento de un robot tipo pato en una prueba de tira y afloja (tug of war) dentro de un simulador MuJoCo.

El modelo conserva íntegramente el grafo y la red head-to-head heredados del modelo base, y añade una tabla de búsqueda de observaciones (observation lookup) que reproduce una secuencia de acciones optimizada localmente para la semilla oficial 1 del entorno de evaluación. Cuando una observación no coincide con la tabla, se recurre al grafo upstream. La coincidencia se determina comparando los primeros 48 valores de observación con una tolerancia de 1e-7.

La relevancia de este modelo es acotada y muy específica: se trata de una optimización in-sample de las condiciones de inicio declaradas en una competición de simulación, no de un controlador de locomoción general ni de una política transferible a robots reales. El autor lo declara explícitamente y remite al resultado público de la Arena como referencia autoritativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo de política heredado del modelo base (red head-to-head) más tabla de búsqueda de observaciones; no se especifica la topología interna |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; el autor indica que el repositorio upstream no especifica licencia para la política combinada y no se afirma ninguna |
| Formato de pesos | ONNX |
| Librería | microduck |
| Pipeline | robotics |
| Modelo base | greecree/microduck-tug-of-war-tug-super-v9 (finetune) |
| Tamaño del repositorio | 0.0 GB |
| Entorno de evaluación | MuJoCo 3.10.0, ONNX Runtime 1.24.4, runner 5, evaluador Arena sin modificar |

## Arquitectura y entrenamiento

La arquitectura interna no está documentada en la información disponible. Lo que sí se describe es la composición funcional: el modelo conserva el grafo completo y la red head-to-head del modelo base greecree/microduck-tug-of-war-tug-super-v9, y añade una capa de búsqueda de observaciones que intercepta las observaciones de entrada. Si los primeros 48 valores de la observación coinciden con una entrada de la tabla dentro de una tolerancia de 1e-7, se reproduce la secuencia de acciones optimizada; en caso contrario, se delega en el grafo upstream. Las demás condiciones de inicio (semillas 2 a 5) mantienen sus trayectorias heredadas.

El proceso de optimización no es un entrenamiento neuronal convencional. La secuencia de la semilla 1 se normalizó primero sin alterar las fuerzas de los motores, y después se refinó mediante búsqueda de coordenadas acotada y 100 generaciones de CMA-ES separable. El autor indica que no entrenó la red heredada ni verificó de forma independiente su rendimiento en la copa semanal. No se especifican datos de entrenamiento, número de tokens ni composición de dataset, porque no aplican a este tipo de política.

## Capacidades

- Control de política para la tarea de tira y afloja en el simulador MicroDuck, con acciones sobre los motores del robot.
- Reproducción exacta de una secuencia de acciones optimizada para la semilla oficial 1 del evaluador Arena.
- Replay verificado de las cinco rondas finales, tanto de los dos patos como de la cuerda, según el autor.
- Delegación automática al grafo upstream para observaciones no coincidentes con la tabla de búsqueda.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente en el sentido de los LLM.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No es un controlador de locomoción general ni una política para robot real.

## Casos de uso

- Reproducción de resultados de competición en simulación: el modelo permite replicar la secuencia de la semilla 1 en el evaluador Arena con MuJoCo 3.10.0 y ONNX Runtime 1.24.4, siempre que se respete el entorno de ejecución declarado.
- Verificación de artefactos de optimización: investigadores que estudien técnicas de búsqueda de coordenadas y CMA-ES separable sobre políticas de control pueden usar el repositorio como caso concreto con configuración de búsqueda, secuencia de acciones y código fuente incluidos.
- Auditoría de procedencia de modelos derivados: el modelo incluye procedencia fijada del base (commit cb4f2e7534999b240bb5d6e652e3af80b97bb33a), lo que facilita trazar qué parte es heredada y qué parte es añadida.
- Docencia sobre límites de la optimización in-sample: sirve como ejemplo de política que funciona en las condiciones declaradas pero que el propio autor advierte que no generaliza.
- Integración en pipelines de evaluación de la Arena: puede incorporarse como participante en pruebas locales del evaluador sin modificar física, árbitro, servidor ni datos de clasificación.
- Estudio de sensibilidad numérica: la dependencia de la reproducción exacta respecto a la aritmética de coma flotante lo convierte en un caso útil para analizar robustez de replay en entornos simulados.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Puntuación local de cinco rondas | 167.46412158 cm | Evaluador Arena sin modificar, runner 5, MuJoCo 3.10.0, ONNX Runtime 1.24.4 |
| Victorias por caída en foso (pit wins) | 5 | Mismas condiciones |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El autor indica que no verificó de forma independiente el rendimiento del modelo base en la copa semanal y que el resultado público de la Arena es la referencia autoritativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto muy pequeño, pero no se confirma la huella en memoria.
- GPU recomendadas: no disponible. Al ejecutarse mediante ONNX Runtime, puede correr en CPU o en GPU compatibles con ONNX Runtime, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño declarado del repositorio es plausible, pero no hay dato oficial.
- Opciones de despliegue: ONNX Runtime 1.24.4 es el runtime declarado por el autor; el entorno de simulación requiere MuJoCo 3.10.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HlibPlakhtii/microduck-tug-quicksilver-v16 | Política de control ONNX (MicroDuck) | no disponible | no aplica | no disponible | Hugging Face |
| greecree/microduck-tug-of-war-tug-super-v9 | Política de control (modelo base) | no disponible | no aplica | no disponible | Hugging Face |
| Otros modelos de la familia MicroDuck | Política de control | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada. La comparación se limita a la relación de derivación declarada (finetune del modelo base) y a la naturaleza del artefacto.

## Limitaciones y advertencias

- Es una optimización in-sample de las condiciones de inicio declaradas; no generaliza a otras condiciones ni a otros entornos.
- La reproducción exacta es sensible a la reproducción en coma flotante; pequeños cambios en el runtime o en la plataforma pueden invalidar el replay.
- El autor declara explícitamente que no es un controlador de locomoción general ni una política para robot real.
- No se entrenó la red heredada ni se verificó de forma independiente su rendimiento en la copa semanal.
- La licencia no está disponible; el repositorio upstream no especifica licencia para la política combinada y el autor no afirma ninguna, lo que impide asumir derechos de uso comercial.
- No hay información sobre sesgos, idiomas ni alucinación porque no es un modelo de lenguaje; esos riesgos no aplican en su forma habitual.
- El resultado autoritativo es el de la Arena pública; los resultados locales no sustituyen esa validación.
- El modelo depende de versiones concretas de software (MuJoCo 3.10.0, ONNX Runtime 1.24.4, runner 5) y de la procedencia fijada del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v16
- Modelo base: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v9
- Procedencia fijada del base (commit): https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v9/tree/cb4f2e7534999b240bb5d6e652e3af80b97bb33a
