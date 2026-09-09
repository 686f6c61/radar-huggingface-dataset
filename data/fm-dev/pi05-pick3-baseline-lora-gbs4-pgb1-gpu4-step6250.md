# fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-step6250

## Resumen

Este modelo es un adaptador LoRA del modelo de robótica π0.5 (physical-intelligence/pi05_base), desarrollado por fm-dev para ejecutar una tarea concreta de pick-and-place con un brazo Franka. La tarea consiste en coger un cubo y colocarlo sobre un plato exactamente tres veces, levantándolo entre colocaciones. Se trata de una adaptación de bajo rango (Cartesian8 LoRA) que permite ajustar un modelo base preentrenado sin reentrenar todos sus parámetros, con un presupuesto de 25 000 ejemplos de entrenamiento y 6250 actualizaciones de optimizador en cuatro NVIDIA RTX A6000. El repositorio incluye los pesos EMA de inferencia, código de carga y ejecución, un informe de evaluación offline y el estado completo del optimizador para reanudar el entrenamiento. La relevancia del modelo es doble: sirve como baseline para experimentos de aprendizaje por imitación en robótica y permite evaluar cómo una adaptación LoRA sobre π0.5 se comporta en una tarea específica sin necesidad de modificar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre π0.5 (modelo base physical-intelligence/pi05_base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se menciona un límite de 128 tokens para el estado actual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de tarea se especifica en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene pesos en params/) |
| Modelo base | physical-intelligence/pi05_base |
| Pipeline | robotics |
| Tamaño del repositorio | 11.5 GB |

## Arquitectura y entrenamiento

El modelo es una adaptación LoRA de π0.5. Según la model card, se entrenan LoRA sobre los componentes Gemma2B y 300M, junto con proyecciones Cartesianas nuevas y módulos de historial opcionales, mientras que los backbones preentrenados y los MLP de tiempo permanecen congelados. El entrenamiento utiliza AdamW con un batch global de 4 (una GPU por muestra), sin acumulación de gradientes, calentamiento de 250 pasos y una tasa de aprendizaje con decaimiento coseno de 5e-5 a 5e-6 hasta el paso 6250. Se aplica una EMA con factor 0.999^4 (0.996005996001) para preservar la escala de suavizado temporal de una prueba de referencia. El presupuesto total es de 6250 actualizaciones, equivalente a 25 000 ejemplos. Los datos se dividen en episodios: 40 de entrenamiento, 5 de validación y 5 de prueba, con 12 857 ventanas de entrenamiento, 1915 de validación y 1600 de prueba. Se mantienen los filtros de sincronización originales de 40 ms y de separación máxima de 100 ms.

Las etiquetas de comandos de pinza se construyen a partir de bordes Joy de trama completa y se enmascaran los objetivos desconocidos con NaN/false tanto en el condicionamiento de flujo como en la pérdida. La medida de apertura de pinza se usa solo como estado, no como objetivo de acción.

## Capacidades

- Entrada multimodal: imágenes RGB de cámara base y muñeca, estado del robot (posición del flange xyz y cuaternión XYZW unitario, apertura de pinza medida dividida por 0.08) y un prompt de texto de la tarea.
- Salida de acción: 20 poses absolutas objetivo del flange y comandos de pinza (0 cerrado, 1 abierto).
- Soporte de historial opcional: el código incluye una función observe() que añade cada frame observado para proporcionar contexto temporal; sin ella, el modelo usa solo la observación actual.
- Normalización: las entradas numéricas de estado y acciones usan normalización STD calculada en entrenamiento; los tokens de estado actual usan una vista acotada q01/q99 con un máximo de 128 tokens.
- Utilidad para evaluación offline: el repositorio incluye un evaluador que calcula errores de componentes conocidos, pero no tasas de éxito reales en el robot.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso explícito ni capacidades multilingües.

## Casos de uso

1. Automatización de tareas repetitivas en laboratorios de robótica: el modelo puede ejecutar una secuencia exacta de pick-and-place con un brazo Franka, partiendo de las imágenes base y de muñeca, el estado actual y el prompt de tarea, devolviendo las trayectorias de flange y comandos de pinza necesarios.
2. Baseline para aprendizaje por imitación: al estar entrenado con un presupuesto controlado y una configuración documentada, sirve como referencia para comparar experimentos con variaciones de batch size, EMA, número de updates o arquitecturas de adaptador.
3. Validación offline de políticas antes del despliegue: el informe de evaluación incluido permite revisar los errores de los componentes de acción sin necesidad de ejecutar el robot, lo que reduce el coste de iteración en entornos de investigación.
4. Estudio de adaptación de modelos vision-language-action (VLA): el adaptador LoRA sobre π0.5 ofrece un punto de partida para investigar cómo un ajuste de bajo rango modifica la capacidad de un modelo base en una tarea de manipulación concreta.
5. Prototipado de nuevas variantes de tarea: a partir del código de inferencia incluido, se puede modificar el prompt o las entradas para explorar variaciones de la misma tarea, siempre que se mantengan la convención de frame y herramienta.
6. Reproducción de experimentos de entrenamiento: el repositorio incluye el estado completo del optimizador, las semillas RNG y las versiones exactas de las dependencias, lo que permite reanudar o reproducir el entrenamiento desde el checkpoint de 6250 actualizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un informe de evaluación offline, pero la model card no proporciona valores numéricos concretos. El propio autor indica que las métricas de evaluación son errores de componentes conocidos, no tasas de éxito robótico.

## Requisitos de hardware

- Entrenamiento: realizado en cuatro NVIDIA RTX A6000. El repositorio no especifica la VRAM utilizada.
- Inferencia: requiere Python 3.10 y un entorno con CUDA 12. El repositorio incluye requirements.txt y el código load_model.py para cargar el adaptador.
- GPU recomendadas: al menos una GPU con capacidad suficiente para cargar el modelo base π0.5 y los pesos del adaptador. El entrenamiento usó A6000, por lo que una GPU de características similares sería lo recomendable.
- Opciones de despliegue: el propio código del repositorio (política con policy.infer()). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Solo se puede identificar el modelo base physical-intelligence/pi05_base como referencia directa, ya que es el modelo sobre el que se aplica la adaptación LoRA. No se han proporcionado detalles de otros adaptadores similares ni especificaciones del modelo base.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_base | no disponible | no disponible | no disponible | no disponible | HuggingFace (physical-intelligence/pi05_base) |
| pi05-pick3-baseline-lora... | no disponible | no disponible | no disponible | no disponible | HuggingFace (fm-dev/pi05-pick3-baseline-lora...) |

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica (pick-and-place del cubo en el plato tres veces). Fuera de esa tarea, es probable que el comportamiento no sea fiable.
- La licencia no está disponible, por lo que el uso comercial potencialmente requiere permisos adicionales no especificados.
- El modelo no incluye imágenes de demostración ni evidencia privada de los datos de entrenamiento, lo que impide la reproducción completa sin esos datos.
- La evaluación incluida es offline y solo cubre errores de componentes conocidos; no mide el éxito real en el robot.
- El control del robot debe respetar exactamente la misma convención de frame Cartesian y de herramienta que la usada en los datos de entrenamiento.
- No se documentan sesgos conocidos, pero al estar entrenado con pocos ejemplos y un entorno concreto, puede heredar los sesgos de la configuración de captura.
- Las etiquetas de pinza dependen de bordes Joy y pueden quedar enmascaradas si no se cumplen las condiciones de sincronización, lo que afecta al aprendizaje de esos comandos.
- El modelo no soporta tool calling, agentes ni razonamiento multi-paso explícito.

## Enlaces

- HuggingFace: https://huggingface.co/fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-step6250
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- No se han encontrado enlaces adicionales relevantes en los resultados de búsqueda web.
