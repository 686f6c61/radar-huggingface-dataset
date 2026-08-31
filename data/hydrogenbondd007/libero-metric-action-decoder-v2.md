# hydrogenbondd007/libero-metric-action-decoder-v2

## Resumen

El modelo `libero-metric-action-decoder-v2` es un decodificador de acciones métricas para robótica, desarrollado por hydrogenbondd007 como componente experimental de bajo nivel en un esquema de planificador/controlador. Con solo 3,18 millones de parámetros, implementa un transformer de 4 capas que mapea un historial de cuatro estados proprioceptivos del robot Panda (posición, orientación y pinza) junto con un subobjetivo métrico estructurado de 28 dimensiones, y predice un chunk de diez acciones de 7 dimensiones en una sola pasada. Está entrenado exclusivamente con datos del benchmark LIBERO (tres tareas de manipulación) y no incluye visión, lenguaje ni estados ocultos de un VLM.

La relevancia de este modelo radica en su enfoque minimalista: en lugar de un VLA (vision-language-action) completo, propone un decodificador de acciones puro que puede ser acoplado a un planificador externo que genere subobjetivos métricos. Sin embargo, su validación se limita a predicciones de acción en bucle abierto (open-loop), sin evidencia de éxito en tareas cerradas (closed-loop), rendimiento real en robot o transferencia entre plataformas. Es, por tanto, una pieza de investigación para estudiar el action chunking y la representación de subobjetivos, no un sistema listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Query transformer de 4 capas (encoder) |
| Parametros totales | 3.176.527 (según safetensors); 3.176.455 entrenables según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer encoder con 4 capas, dimensión oculta de 256 y 8 cabezas de atención. La entrada se compone de cinco tokens: cuatro tokens proyectados correspondientes a los estados del robot (cada uno de 8 dimensiones) y un token proyectado para el subobjetivo métrico (28 dimensiones). A estos se concatenan diez queries de acción aprendidas. El encoder procesa todos los tokens, y cabezas separadas producen seis valores de movimiento normalizados más un logit de pinza para cada query, generando así un chunk de acciones de 10 × 7.

El entrenamiento se realizó sobre el dataset `physical-intelligence/libero` en su revisión `20f6ab338acbb455b4215db2ed5f7f1ad855f036`, seleccionando tres tareas de LIBERO Goal: "put the bowl on the plate", "turn on the stove" y "open the middle drawer of the cabinet". Se usaron 142 episodios (123 de entrenamiento y 19 de validación), generando 52.382 ventanas de entrenamiento y 8.309 de validación. Los subobjetivos de entrenamiento se construyeron mediante hindsight a partir de estados futuros de los episodios expertos, pero esa información futura no se utiliza en inferencia; un planificador externo debe proporcionar el subobjetivo métrico en tiempo de ejecución. No se emplearon píxeles ni datos de imagen.

## Capacidades

- Predicción de chunks de 10 pasos de acciones normalizadas (6 dimensiones de movimiento operacional + 1 comando de pinza) para el robot Panda.
- Procesamiento de un subobjetivo métrico estructurado que incluye fase (8 one-hot), posición objetivo absoluta, direcciones unitarias de aproximación y apertura de pinza, objetivo de pinza, tolerancias, velocidad, contacto esperado, confianza y validez temporal.
- Entrada de historial de cuatro estados proprioceptivos cronológicos (posición del efector final, orientación axis-angle y posiciones de pinza).
- Salida con normalización: el movimiento se recorta a [-1, 1] y el comando de pinza se binariza (+1 cerrar, -1 abrir).
- No dispone de visión, lenguaje, tool calling, razonamiento multi-paso ni capacidades de agente; es un decodificador de acciones puro y específico del embodiment Panda.

## Casos de uso

- Investigación en action chunking: permite estudiar cómo un transformer pequeño puede predecir secuencias de acciones a partir de subobjetivos métricos, comparando con enfoques VLA más grandes.
- Componente de bajo nivel en un pipeline de planificación: un VLM o planificador externo genera el subobjetivo métrico de 28 dimensiones y este modelo lo convierte en comandos de movimiento para el Panda.
- Benchmarking de decodificadores de acciones en tareas LIBERO: al ser ligero, puede servir como baseline de referencia para evaluar arquitecturas de control.
- Prototipado de controladores para tareas de manipulación en mesa: adecuado para experimentos de laboratorio donde se requiera una salida de acciones rápida y sin dependencia de visión.
- Estudio de generalización entre tareas similares: aunque solo se entrenó en tres tareas, puede usarse para analizar cómo se transfieren los subobjetivos métricos entre escenarios.
- Educación y demostración de arquitecturas de control robótico: su pequeño tamaño permite ejecutarlo en CPU o GPUs modestas, facilitando su uso en cursos y talleres.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en episodios held-out de las mismas tres tareas de entrenamiento, en condición de predicción de acción en bucle abierto (open-loop):

| Metrica | Valor |
|---|---|
| Motion MAE (error absoluto medio) | 0,06993 |
| Precision de pinza (gripper accuracy) | 98,67% |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU, HumanEval o GSM8K (no aplicables a un modelo de robótica). Tampoco hay datos de éxito en tareas cerradas (closed-loop) ni en robot real. La propia model card advierte explícitamente que no se ha demostrado mejora en el éxito de tareas, seguridad ni transferencia cross-embodiment.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (3,18 millones de parámetros ≈ 12,7 MB en FP32). Cabe en cualquier GPU moderna, incluso en tarjetas integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 2060 o superiores). También es viable en CPU para inferencia puntual.
- Compatibilidad con hardware de consumo: sí, ampliamente.
- Opciones de despliegue: al ser un modelo PyTorch estándar con safetensors, puede cargarse con la librería PyTorch. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, que son herramientas para modelos de lenguaje, no aplicables aquí.
- Latencia y throughput: no se proporcionan datos oficiales, pero dado el tamaño y la arquitectura, una pasada de inferencia debería completarse en milisegundos en GPU y en decenas de milisegundos en CPU.

## Comparativa con modelos similares

No hay modelos directamente comparables en el ecosistema abierto, ya que la mayoría de los sistemas de robótica son VLA completos (visión + lenguaje + acción), como MolmoAct (7B parámetros) o los modelos de la familia LIBERO. Este modelo ocupa un nicho distinto: un decodificador de acciones puro, sin percepción. Como referencia:

| Modelo | Parametros | Entrada | Salida | Licencia |
|---|---|---|---|---|
| libero-metric-action-decoder-v2 | 3,18 M | Estados + subobjetivo métrico | Chunk de 10×7 | Apache-2.0 |
| MolmoAct-7B-D-LIBERO-Goal | 7 B | Imagen + lenguaje + estado | Acciones | Apache-2.0 (según su ficha) |
| LIBERO baselines (p. ej., BC-Transformer) | variable | Estado + objetivo | Acciones | varios |

No se dispone de datos de rendimiento comparativo entre estos modelos, por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Solo ha sido evaluado en predicción de acciones en bucle abierto; no hay evidencia de éxito en tareas cerradas (closed-loop), rendimiento en robot real, seguridad ni transferencia entre plataformas.
- Es específico del robot Panda (embodiment Panda) y no es un comando universal para otros robots o configuraciones.
- Entrenado únicamente en tres tareas de LIBERO Goal; su generalización a otras tareas o entornos no está demostrada.
- No incluye percepción visual ni procesamiento de lenguaje; depende completamente de un planificador externo que genere el subobjetivo métrico.
- El tamaño del repositorio aparece como 0.0 GB en HuggingFace, lo que sugiere que el checkpoint puede no estar completo o que hay un error de visualización; se recomienda verificar la integridad de los archivos antes de usarlo.
- Al ser un modelo experimental, no cuenta con soporte oficial, documentación amplia ni garantías de mantenimiento.
- Riesgo de generar acciones inválidas o inseguras si el subobjetivo métrico de entrada es incorrecto o está mal formado; no se ha probado su robustez ante entradas adversas.
- La licencia Apache-2.0 permite uso comercial, pero las limitaciones técnicas y de validación hacen que su uso en producción sea desaconsejable.

## Enlaces

- [HuggingFace - libero-metric-action-decoder-v2](https://huggingface.co/hydrogenbondd007/libero-metric-action-decoder-v2)
- [Dataset LIBERO en HuggingFace](https://huggingface.co/datasets/physical-intelligence/libero)
- [Documentación de LIBERO en LeRobot](https://huggingface.co/docs/lerobot/libero)
- [Repositorio GitHub de LIBERO](https://github.com/Lifelong-Robot-Learning/LIBERO)
- [Modelo MolmoAct-7B-D-LIBERO-Goal (referencia comparativa)](https://huggingface.co/allenai/MolmoAct-7B-D-LIBERO-Goal-0812)
