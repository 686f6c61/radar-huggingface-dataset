# kevinflores/perceiver-baseline

## Resumen

`kevinflores/perceiver-baseline` es un prototipo de investigación que implementa una arquitectura **Perceiver** orientada a tareas de *matching* (emparejamiento o correspondencia entre entradas). Desarrollado por el usuario kevinflores, se presenta como un punto de partida experimental, con una configuración *tiny* que documenta formatos y convenciones del repositorio, pero sin pretender ofrecer resultados de rendimiento verificados. El modelo cuenta con 16.576 parámetros y se distribuye como un checkpoint de inicialización válido para pruebas de humo, no como un modelo entrenado.

La relevancia de este repositorio reside en su utilidad como base para explorar arquitecturas Perceiver en problemas de matching, especialmente en entornos académicos o de investigación donde se busca validar diseños antes de escalar. Sin embargo, al no estar entrenado ni auditado, no es apto para ningún uso práctico en producción. La licencia BSD-3-Clause permite su uso y modificación con atribución, pero el autor advierte que los resultados de un futuro checkpoint entrenado deben documentarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (escala *tiny*) |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura **Perceiver** original, que utiliza un mecanismo de atención estándar sobre una representación latente de tamaño fijo, en lugar de procesar directamente todas las entradas. En esta implementación concreta se emplea **co-attention** (fusión de dos flujos de entrada), activación **ReLU** y normalización por **GroupNorm**. La escala *tiny* implica un número muy reducido de parámetros (16.576), lo que lo convierte en un banco de pruebas ágil para experimentos de diseño.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El repositorio incluye una configuración por defecto que utiliza **RMSprop** con un programador de tasa de aprendizaje *onecycle*, pero el propio autor aclara que estos son valores de arranque en el script, no evidencia de una ejecución completada. El checkpoint `model.safetensors` es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- **Diseño para matching**: la arquitectura está pensada para tareas de correspondencia o emparejamiento, aunque no se han demostrado capacidades funcionales al no estar entrenado.
- **Flexibilidad arquitectónica**: al ser un prototipo *tiny*, permite iterar rápidamente sobre variantes de atención, fusión o normalización.
- **Reproducibilidad**: incluye `config.json` y `training_args.json` que registran la configuración exacta, facilitando la replicación de experimentos.
- **Sin capacidades demostradas**: no hay evidencia de generación de texto, razonamiento, código, tool calling, agentes, multimodalidad ni soporte multilingüe. Cualquier afirmación al respecto sería especulativa.

## Casos de uso

- **Investigación académica**: sirve como punto de partida para estudiar el comportamiento de Perceiver en tareas de matching, permitiendo comparar variantes de atención o fusión en un entorno de bajo coste computacional.
- **Validación de pipelines**: al ser un checkpoint de inicialización, es útil para verificar que el código de entrenamiento y evaluación funciona correctamente antes de lanzar experimentos a mayor escala.
- **Enseñanza de arquitecturas**: por su tamaño reducido, puede emplearse en cursos o talleres para ilustrar el funcionamiento interno de un Perceiver sin necesidad de recursos de hardware elevados.
- **Pruebas de integración**: en entornos de desarrollo, permite comprobar que los adaptadores personalizados o las APIs de carga funcionan con este formato de pesos.
- **Benchmark de referencia**: aunque no tiene métricas propias, puede utilizarse como baseline de capacidad mínima (random) para futuros entrenamientos.
- **Exploración de hiperparámetros**: su pequeña escala facilita el barrido de configuraciones (optimizador, schedule, normalización) con tiempos de ejecución muy cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente en la model card: "No benchmark score is claimed in this repository". El checkpoint de inicialización no ha sido entrenado ni evaluado, por lo que no existen métricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- **VRAM estimada**: al tener solo 16.576 parámetros, el modelo cabe en cualquier GPU moderna e incluso en CPU sin problemas. El uso de memoria es despreciable (del orden de kilobytes).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM sería suficiente; incluso una Raspberry Pi podría ejecutarlo.
- **Compatibilidad con hardware de consumo**: sí, es compatible con cualquier equipo, incluidos portátiles sin GPU dedicada.
- **Opciones de despliegue**: al ser un prototipo personalizado, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se requiere un adaptador explícito para cargarlo con APIs genéricas, como indica el autor.
- **Latencia y throughput**: no hay mediciones disponibles, pero dado el tamaño, la inferencia sería prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No disponible. Este modelo es un prototipo *tiny* sin entrenar, diseñado específicamente para tareas de matching, y no existen modelos comparables de la misma categoría con datos públicos de rendimiento. Los Perceiver de mayor escala (como los presentados en el blog de Hugging Face) tienen millones de parámetros y están entrenados para tareas multimodales, pero no son directamente comparables por su naturaleza y propósito.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint es una inicialización aleatoria; cualquier salida que produzca carece de significado semántico.
- **Sin auditoría**: no se ha evaluado robustez, equidad ni transferencia a otros dominios, como advierte el autor.
- **Alto riesgo de alucinación**: al no tener conocimiento aprendido, cualquier generación sería incoherente o aleatoria.
- **Sin soporte multilingüe**: no se especifican idiomas; la arquitectura no incluye capacidades lingüísticas inherentes.
- **Restricciones de licencia**: BSD-3-Clause permite uso comercial con atribución, pero el autor recomienda revisar los términos de los datos externos si se usan con ellos.
- **No apto para producción**: es un material experimental; cualquier uso en aplicaciones reales sería inapropiado y potencialmente perjudicial.
- **Formato propietario**: requiere un adaptador personalizado para cargarlo con herramientas estándar, lo que limita su interoperabilidad.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/kevinflores/perceiver-baseline)
- [Blog de Hugging Face sobre Perceiver](https://github.com/huggingface/blog/blob/main/perceiver.md) (referencia general de la arquitectura, no específica de este modelo)
