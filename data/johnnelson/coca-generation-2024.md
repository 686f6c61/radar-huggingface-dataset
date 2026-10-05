# johnnelson/coca-generation-2024

## Resumen

johnnelson/coca-generation-2024 es un repositorio de HuggingFace publicado por el usuario johnnelson que contiene una implementación de código abierta de una arquitectura denominada "Coca" orientada a tareas de generación, con una configuración declarada como "large". Según la propia model card, el artefacto principal es el script `finetune.py`, acompañado de `config.json`, `training_args.json` y un checkpoint de inicialización `model.safetensors`. El autor indica explícitamente que no se reclama ninguna métrica de benchmark y que el checkpoint no ha sido entrenado ni auditado.

El dato más relevante es su tamaño: el recuento real de parámetros en el fichero safetensors es de 24.832 parámetros, es decir, un modelo de aproximadamente 25.000 parámetros (0,025 millones), muy lejos de cualquier modelo de generación de propósito general. El tamaño total del repositorio es de 0,0 GB. Esto es coherente con la descripción del propio autor, que lo presenta como un punto de partida experimental para pruebas de humo (smoke tests) y no como un modelo entrenado listo para producción.

Por tanto, la ficha debe leerse como la de un artefacto de investigación en fase embrionaria: código transparente, configuración reproducible y un checkpoint válido únicamente para verificar que el pipeline de carga y ejecución funciona. No hay evidencia de entrenamiento, datos, evaluación ni capacidades funcionales demostradas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (implementación propia), atención lineal, fusión por tensor fusion |
| Parametros totales | 24.832 (según safetensors) |
| Parametros activos | no disponible (no se declara configuración MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica safetensors en precisión de inicialización) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |
| Función de activación | gelu tanh |
| Normalización | layernorm |
| Escala declarada | large |
| Tamaño del repositorio | 0,0 GB |
| Fecha de creación (declarada) | 2026-10-05 |
| Fecha de actualización (declarada) | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura declarada es "Coca", con atención de tipo lineal, mecanismo de fusión por tensor fusion, activación gelu tanh y normalización layernorm. El autor la describe con escala "large", aunque esa etiqueta no se corresponde con el recuento real de parámetros del checkpoint publicado (24.832), lo que sugiere que la etiqueta se refiere a un preset de configuración del script y no al tamaño efectivo del modelo serializado. La model card no detalla el número de capas, dimensión de los embeddings, número de cabezas de atención ni la composición del vocabulario, y esos datos no están disponibles en la información proporcionada.

En cuanto al entrenamiento, la receta por defecto usa el optimizador Adam con un esquema de warmup lineal, pero el propio autor advierte que son "valores de partida en el script, no evidencia de una ejecución completada". No se documentan tokens de entrenamiento, composición del dataset, fases de RLHF o DPO, ni ninguna innovación técnica adicional más allá de la atención lineal y la fusión tensorial. El checkpoint `model.safetensors` se describe como "inicialización válida para smoke tests" y no como un checkpoint entrenado. La model card incluye además una guía de evaluación que recomienda usar un conjunto de validación específico de tarea, reportar la métrica en al menos tres semillas e incluir una línea base de capacidad equivalente.

## Capacidades

- Generación de texto: no demostrada. El checkpoint no está entrenado, por lo que no se puede verificar ninguna capacidad generativa real.
- Razonamiento, matemáticas y código: no disponible, sin datos de evaluación ni ejemplos de salida.
- Tool calling / function calling: no disponible, no se menciona soporte en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible, no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible. La presencia de "tensor fusion" sugiere un diseño pensado para combinar modalidades, pero no hay confirmación ni documentación al respecto.
- Carga mediante APIs automáticas: el autor advierte que, al ser una implementación personalizada, las APIs genéricas de carga requieren un adaptador explícito.

## Casos de uso

- Pruebas de humo de pipelines de carga: el checkpoint sirve para verificar que un entorno PyTorch puede instanciar la arquitectura Coca, cargar safetensors y ejecutar un forward pass sin errores. Es su uso declarado por el propio autor.
- Reproducción de configuraciones de investigación: `config.json` y `training_args.json` permiten replicar los hiperparámetros por defecto (Adam con warmup lineal) como punto de partida en experimentos comparativos.
- Línea base de capacidad equivalente: la guía de evaluación del repositorio propone comparar contra una línea base de capacidad emparejada, por lo que este artefacto puede actuar como referencia mínima en estudios de escalado.
- Docencia y formación en arquitecturas de atención lineal: el código transparente de `finetune.py` permite estudiar cómo se implementa atención lineal y tensor fusion en PyTorch sin depender de frameworks opacos.
- Análisis de arquitecturas multimodales (exploratorio): si la fusión tensorial se confirma como mecanismo de combinación de modalidades, el código podría servir de base para prototipos de fusión, aunque esto no está verificado en la documentación.
- Auditoría de reproducibilidad: dado que el autor insiste en conservar logs de entrenamiento y versiones de entorno junto a cualquier resultado publicado, el repositorio es útil como caso de estudio de buenas prácticas de trazabilidad experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint de inicialización no ha sido entrenado. Por tanto, no existen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra métrica que puedan tabularse o compararse.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en cualquier precisión, dado que el modelo tiene 24.832 parámetros (aproximadamente 0,1 MB en fp32). En la práctica, cualquier GPU o CPU puede alojarlo.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna es suficiente; una GPU no aporta ventaja medible para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.), pero no tiene sentido práctico usar GPU dedicada.
- Opciones de despliegue: el autor indica que, al ser una implementación personalizada, las APIs genéricas de carga requieren un adaptador explícito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El punto de entrada documentado es `python finetune.py --help`.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No disponible. El repositorio no declara una familia de modelos equivalente, no publica métricas y su naturaleza (checkpoint de inicialización con 24.832 parámetros) no es comparable con modelos de generación de propósito general. La model card menciona "Coca" como arquitectura propia, pero no referencia implementaciones previas con las que establecer una comparación de parámetros, contexto, rendimiento, licencia o disponibilidad. Cualquier comparación numérica sería especulativa y, por tanto, se omite.

## Limitaciones y advertencias

- El checkpoint no está entrenado: es una inicialización válida solo para pruebas de humo. Cualquier uso generativo produciría resultados sin sentido.
- No hay auditoría de robustez, equidad ni transferencia de dominio; el propio autor lo declara explícitamente.
- No se declaran idiomas soportados, contexto máximo ni tokenizador, lo que impide planificar su uso multilingüe o con contextos largos.
- Riesgo de alucinación: no aplica en sentido estricto porque el modelo no genera lenguaje de forma funcional, pero cualquier salida debe considerarse ruido no verificado.
- La etiqueta de escala "large" puede inducir a error: el recuento real de parámetros es de 24.832, incompatible con esa denominación en el uso habitual del término.
- Licencia BSD-3-Clause: permisiva y compatible con uso comercial del código, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se combina con datasets externos.
- Sin métricas ni logs de entrenamiento publicados: no es posible reproducir ni verificar ningún resultado.
- Las fechas de creación y actualización declaradas (2026-10-05) son posteriores a la fecha habitual de consulta, lo que conviene tener en cuenta al citar el artefacto.
- Los resultados de búsqueda web asociados al identificador no contienen información técnica relevante sobre el modelo y no deben usarse como referencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/johnnelson/coca-generation-2024
- No se han encontrado papers, blogs, repositorios auxiliares ni demos relevantes en los resultados de búsqueda web proporcionados.
