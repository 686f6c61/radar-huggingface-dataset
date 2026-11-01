# CollectionStudio/Muse-Robotics-1.1

## Resumen

Muse-Robotics-1.1 es un modelo de visión-lenguaje-acción (VLA) desarrollado por CollectionStudio, orientado a manipulación robótica condicionada por instrucciones en lenguaje natural. Se trata de la evolución de Muse-Robotics-1, reentrenada durante más tiempo sobre una mezcla sustancialmente mayor de demostraciones reales de robot e instrucciones aumentadas, lo que le aporta cobertura multilingüe práctica en siete idiomas. Es un modelo compacto, de unos 121,7 millones de parámetros, pensado para ejecutarse y entrenarse en hardware modesto.

La arquitectura, denominada internamente "nova_vla", combina dos vistas de cámara de 224×224 RGB, un vector de estado propioceptivo y una instrucción en lenguaje natural como entradas, y produce como salida un bloque de dieciséis acciones. Toda la pila —visión, lenguaje, fusión, deliberación y generación de acciones— se entrena de forma conjunta y extremo a extremo desde inicialización aleatoria, sin backbone preentrenado.

Su relevancia actual radica en dos factores: la inclusión de un mecanismo de "pensamiento" mediante tokens de plan latentes que se refinan iterativamente, y su licencia MIT, que facilita la experimentación y el uso comercial sin restricciones de pesos. El modelo está disponible en formato safetensors y PyTorch, con un tamaño de repositorio de 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nova_vla: Vision Transformer compartido (S-scale) + encoder de lenguaje de 6 capas + stack "perceive" de 12 capas + deliberación con 8 tokens de plan latentes y 3 iteraciones + generador de acciones |
| Parametros totales | 121.710.745 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (instrucciones codificadas con tokenizer BPE de tamaño 8192; longitud máxima no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, es, de, fr, ja, ko |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo procesa cada paso de control con un paquete de observación fijo: dos imágenes RGB de 224×224 desde puntos de vista distintos (vista exterior y de muñeca), un vector de estado propioceptivo de baja dimensión (posiciones de articulaciones o del efector final y codificación del gripper) y una instrucción arbitraria en lenguaje natural, que puede estar vacía. Cada imagen se divide en parches de 16×16 píxeles, se embebe linealmente y se aumenta con codificaciones posicionales sinusoidales que preservan la disposición 2D. Ambas vistas se procesan con un único Vision Transformer compartido de escala S, con un embedding aprendido de tipo de vista para distinguirlas. El encoder es deliberadamente superficial porque todo el modelo se entrena desde inicialización aleatoria sobre datos embodied.

Las instrucciones se codifican con un tokenizer BPE a nivel de byte de tamaño 8192, con símbolos dedicados para padding, límites de secuencia e instrucción vacía, y se pasan por un transformer bidireccional de seis capas con atención enmascarada. Los tokens visuales, lingüísticos y el token de estado proyectado se concatenan en una única secuencia heterogénea con embeddings aprendidos de tipo y de posición espacial. Esta secuencia la procesa un stack "perceive" de doce capas con pre-normalización y expansión feed-forward de factor cuatro. La deliberación se realiza destilando la memoria en ocho tokens de plan latentes que se refinan mediante tres iteraciones de un bloque transformer compartido (self-attention entre tokens de plan, cross-attention a la memoria completa y actualización feed-forward, con embedding de iteración distinto en cada pasada). La representación final agrupada de los tokens de plan es la única señal de condicionamiento del generador de acciones. La normalización de estado y acción se calcula sobre la distribución de entrenamiento y se embebe en el fichero de configuración, de modo que el modelo desnormaliza internamente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por lenguaje natural, en bloques de dieciséis pasos.
- Procesamiento multimodal conjunto de dos vistas de cámara, estado propioceptivo y texto.
- Manejo explícito de instrucciones vacías como entrada válida.
- Cobertura multilingüe en siete idiomas (inglés, chino, español, alemán, francés, japonés y coreano) sin tokenizer ni modelo separado por idioma.
- Razonamiento interno mediante tokens de plan latentes refinados en tres iteraciones.
- Entrenamiento extremo a extremo de todos los parámetros (visión, lenguaje, fusión, deliberación y acción) desde la inicialización 1.0.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni visión genérica fuera del contexto de control robótico.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo recibe dos vistas de cámara y el estado del robot y genera bloques de dieciséis acciones para tareas como abrir cajones o coger objetos, con instrucciones en lenguaje natural.
- Investigación en aprendizaje embodied: al ser entrenable extremo a extremo y compacto, permite experimentar con la arquitectura de tokens de plan latentes y el stack de deliberación en hardware modesto.
- Despliegue multilingüe en entornos industriales: las mismas instrucciones pueden formularse en español, alemán o japonés sin reentrenar el modelo, lo que simplifica la operación en plantas con personal diverso.
- Prototipado rápido de políticas de imitación: su tamaño de 121,7 millones de parámetros y licencia MIT facilitan iterar sobre datasets propios de demostraciones reales.
- Integración en pipelines de evaluación de políticas VLA: sirve como referencia compacta para comparar arquitecturas de fusión visión-lenguaje-acción.
- Educación y docencia en robótica: el modelo es autocontenido y de pequeño tamaño, adecuado para prácticas sobre codificación de observaciones, normalización de acciones y deliberación latente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 121,7 millones de parámetros en precisión completa (fp32) serían aproximadamente 0,5 GB de pesos, y en fp16 alrededor de 0,25 GB, a lo que hay que sumar activaciones y buffers de las dos cámaras de 224×224.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es compatible con GPUs de consumo, aunque no se detallan modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio (0,5 GB) y el número de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: no disponibles; la model card no menciona vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de robótica con pipeline propio, requeriría el código de inferencia del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (VLA compactos de manipulación), por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para manipulación robótica condicionada por lenguaje; no es un modelo de propósito general para texto, código o visión genérica.
- No se documentan sesgos conocidos, pero al entrenarse sobre demostraciones reales de robot puede heredar sesgos de la distribución de entrenamiento (entornos, objetos y tareas concretas).
- Riesgo de alucinación no evaluado: no hay datos publicados sobre robustez ante instrucciones ambiguas o fuera de distribución.
- La cobertura multilingüe se basa en aumento por traducción en entrenamiento; la calidad real en cada idioma no está cuantificada.
- La longitud máxima de instrucción y el contexto efectivo no están especificados, lo que limita la planificación de despliegues con instrucciones largas.
- La licencia MIT permite uso comercial sin restricciones de pesos, pero no se detallan condiciones adicionales sobre los datos de entrenamiento.
- El modelo requiere el código de inferencia específico del autor para interpretar el paquete de observación y desnormalizar las acciones; no es directamente compatible con runtimes genéricos.
- No se especifican requisitos de calibración de cámaras ni de espacio de acciones, lo que puede afectar a la transferencia a robots distintos de los usados en entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/CollectionStudio/Muse-Robotics-1.1
- Paper de referencia citado: arxiv:2403.12945
- Paper de referencia citado: arxiv:2410.24164
