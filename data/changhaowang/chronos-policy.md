# changhaowang/chronos-policy

## Resumen

Chronos Policy es una política robótica de imitación presentada por Changhao Wang (postdoc en Stanford con Shuran Song; anteriormente en Meta FAIR y doctorado en UC Berkeley) que reformula el aprendizaje de políticas de control en términos de tiempo físico en lugar de posición en la secuencia. El modelo condiciona la predicción de acciones sobre los instantes de captura de cada observación y sobre los instantes deseados de ejecución de cada acción, de modo que deja de asumir que sensores y actuadores operan a una frecuencia fija y sincronizada.

La arquitectura es un diffusion transformer con RoPE consciente del tiempo (time-aware RoPE), entrenado mediante aprendizaje por imitación sobre observaciones asíncronas y de múltiple frecuencia, sin realinear los datos a una rejilla temporal fija. Esta formulación aborda un fallo práctico habitual: cuando la tasa de observación, los retrasos de red o la latencia de inferencia varían, las políticas entrenadas sobre secuencias a ritmo fijo se degradan porque el tiempo queda implícito en la posición del token.

El repositorio de HuggingFace publica 48 checkpoints originales del paper (política Chronos y baseline Decision Transformer, tres semillas, ocho tareas de simulación), de unos 560 MB por fichero incluyendo pesos, configuración y normalizadores. Es relevante ahora porque ofrece una alternativa explícitamente temporal a Diffusion Policy y a los transformers de decisión clásicos, con verificación de equivalencia bit a bit frente a la implementación de referencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer con RoPE consciente del tiempo (time-aware RoPE); condicionada por instantes de captura de observación y de ejecución de acción |
| Parametros totales | no disponible (cada checkpoint ocupa ~560 MB incluyendo pesos, configuración y normalizadores) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es una ventana de texto. Consume secuencias de observaciones con marcas de tiempo, potencialmente asíncronas y de múltiple frecuencia |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints PyTorch; no se documentan versiones GGUF, INT8 ni FP16) |
| Idiomas soportados | no disponible; no es un modelo de lenguaje, la entrada es multimodal sensorial (observaciones robóticas) |
| Licencia | no disponible |
| Formato de pesos | `.ckpt` de PyTorch (pesos + configuración + normalizadores en un único fichero) |

## Arquitectura y entrenamiento

Chronos Policy es un diffusion transformer que genera trayectorias de acción mediante difusión, con la particularidad de que la atención incorpora información temporal absoluta a través de un RoPE dependiente del tiempo. En lugar de tratar una secuencia de observaciones como una rejilla regular de tokens, el modelo recibe cada observación junto con su marca de tiempo de captura y consulta acciones en sus marcas de tiempo futuras de ejecución. Esto le permite aprender directamente de datos asíncronos y de múltiple tasa, sin remuestreo ni alineamiento previo a una rejilla fija, y le da robustez frente a variaciones en la tasa de sensado, retrasos y latencia de inferencia.

El repositorio distribuye los checkpoints del paper: ocho tareas de simulación, con la política Chronos y un baseline Decision Transformer (DT) para cada tarea y tres semillas por configuración, lo que suma 48 ficheros. El layout es `<task>/<chronos|dt>/seed<0|1|2>.ckpt`. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (no procede en este dominio, pero no se confirma el pipeline exacto). La validación publicada indica que el modelo compacto de la release coincide bit a bit con la implementación fijada de referencia en 32 comparaciones DDIM de ocho pasos, cubriendo los checkpoints seed-0 de Chronos y DT en las ocho tareas, tanto con observaciones ordinarias como con observaciones con padding. Los datasets asociados se publican en un repositorio separado de HuggingFace.

## Capacidades

- Generación de acciones robóticas de manipulación por difusión: produce trayectorias de acción consultadas en instantes de ejecución concretos.
- Modelado explícito del tiempo físico: condiciona la predicción sobre marcas de tiempo de observación y de ejecución de acción.
- Procesamiento de observaciones asíncronas y de múltiple frecuencia sin alineamiento a rejilla temporal fija.
- Tolerancia a variaciones de tasa de sensado, retrasos de comunicación y latencia de inferencia variables.
- Aprendizaje por imitación a partir de demostraciones, incluyendo datos de teleoperación con timestamps irregulares.
- Inferencia por difusión con muestreo DDIM de ocho pasos (configuración usada en la verificación de equivalencia).
- Soporte de observaciones con padding, según las comparaciones publicadas.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión general, audio ni generación de texto: es una política de control específica de dominio.

## Casos de uso

- Manipulación robótica con sensores de distinta frecuencia: el modelo consume directamente observaciones de una cámara a 30 Hz y de un sensor de fuerza a 100 Hz con sus timestamps, sin remuestrear a una tasa común, lo que simplifica el pipeline de datos y evita perder información temporal.
- Control con latencia de inferencia variable: en despliegues con cómputo compartido o comunicación por red, la política consulta acciones para instantes futuros concretos, de modo que un retraso en el cálculo no desalinea la acción respecto al estado real del robot.
- Aprendizaje a partir de datasets de teleoperación heterogéneos: al no exigir una rejilla temporal fija, se pueden mezclar demostraciones grabadas con distintos equipos y tasas de muestreo en un mismo entrenamiento.
- Evaluación comparativa de políticas en simulación: el repositorio incluye checkpoints Chronos y Decision Transformer con tres semillas en ocho tareas, lo que permite reproducir comparaciones controladas de rendimiento y varianza entre semillas.
- Reproducción y verificación de resultados: los ficheros publicados permiten comprobar la equivalencia bit a bit con la implementación de referencia en 32 comparaciones DDIM de ocho pasos, útil como test de regresión en un pipeline de investigación.
- Punto de partida para ajuste fino en un robot propio: los checkpoints con normalizadores incluidos sirven como inicialización para reentrenar sobre el dataset `chronos-policy-data` o sobre datos propios, siguiendo la guía de reproducción del repositorio de código.
- Investigación en políticas temporales: sirve como baseline para estudiar el efecto del modelado explícito del tiempo frente a políticas que asumen ritmo fijo, gracias a la pareja de checkpoints Chronos/DT por tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y la búsqueda web no incluyen cifras de éxito por tarea, tasas de acierto ni comparaciones numéricas frente a otros métodos. El único dato cuantitativo de validación es la equivalencia bit a bit del modelo compacto con la implementación de referencia en 32 comparaciones DDIM de ocho pasos (checkpoints seed-0 de Chronos y DT en las ocho tareas, con observaciones ordinarias y con padding).

## Requisitos de hardware

- VRAM estimada: no se publican requisitos oficiales. A partir del tamaño de cada checkpoint (~560 MB, incluyendo pesos, configuración y normalizadores), la inferencia de un único modelo en precisión completa debería caber con holgura en GPUs de consumo; esta cifra es una estimación derivada del tamaño del fichero, no un dato del autor.
- GPUs recomendadas: no disponible. Por tamaño de checkpoint, una RTX 4090 o una RTX 3090 serían suficientes para un solo modelo; para barridos de evaluación sobre las ocho tareas y tres semillas conviene una GPU con más memoria o ejecución secuencial.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño por checkpoint; sin confirmación oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). El despliegue es mediante PyTorch y los scripts del repositorio `chronos_policy`, cargando ficheros `.ckpt` con pesos, configuración y normalizadores.
- Latencia y throughput: no disponible. El coste de inferencia depende del número de pasos de difusión; la configuración verificada emplea DDIM de ocho pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Modelado del tiempo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chronos Policy | no disponible (~560 MB por checkpoint) | Observaciones asíncronas con timestamps | Explícito (time-aware RoPE, tiempos de captura y ejecución) | no disponible | Checkpoints en HuggingFace, código en GitHub |
| DT (baseline en el mismo repo) | no disponible | Secuencias observación-acción a ritmo fijo | Implícito en la posición de la secuencia | no disponible | Checkpoints incluidos junto a Chronos |
| Diffusion Policy (referencia por tag del repo) | no disponible | Secuencias observación-acción a ritmo fijo | Implícito en la posición de la secuencia | no disponible | no disponible en esta información |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparación se limita a la formulación temporal y a la disponibilidad de artefactos.

## Limitaciones y advertencias

- Evaluación exclusivamente en simulación: las ocho tareas publicadas son entornos simulados; no hay evidencia en la información disponible sobre transferencia a hardware real.
- Licencia no especificada: la ausencia de licencia explícita impide determinar si se permite uso comercial, modificación o redistribución. Es un bloqueante para producción.
- Dependencia de marcas de tiempo fiables: el mecanismo de tiempo físico asume que los timestamps de observación y los instantes de ejecución son correctos; relojes desincronizados o timestamps mal registrados degradarían el condicionamiento.
- Riesgo de alucinación en el sentido de acciones no válidas físicamente: como política generativa por difusión, puede producir trayectorias plausibles pero incorrectas; requiere límites de seguridad, comprobación de límites articulares y parada de emergencia en un robot real.
- Sin capacidades de lenguaje, tool calling ni agentes: no es adecuado para tareas de texto, razonamiento simbólico ni integración en pipelines de agentes.
- Idiomas no aplicables ni documentados: no hay soporte multilingüe porque la entrada no es textual.
- Ausencia de cifras de rendimiento: sin tasas de éxito publicadas no es posible estimar su calidad relativa frente a otros métodos más allá de la equivalencia con la implementación de referencia.
- Adopción muy baja (0 descargas, 1 like en el momento de la consulta) y código joven: menor probabilidad de que la comunidad haya detectado errores en los scripts de carga o evaluación.
- Los checkpoints incluyen normalizadores específicos de cada tarea; reutilizarlos fuera de su distribución de entrenamiento sin recalcular normalización puede producir acciones mal escaladas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/changhaowang/chronos-policy
- Dataset asociado: https://huggingface.co/datasets/changhaowang/chronos-policy-data
- Paper (arXiv): https://arxiv.org/abs/2610.13929
- Paper (PDF): https://arxiv.org/pdf/2610.13929v1
- Página del proyecto: https://changhaowang.github.io/chronospolicy/
- Código: https://github.com/changhaowang/chronos_policy
- Guía de reproducción: https://github.com/changhaowang/chronos_policy/blob/main/docs/reproduction.md
- Página del autor: https://changhaowang.github.io/
