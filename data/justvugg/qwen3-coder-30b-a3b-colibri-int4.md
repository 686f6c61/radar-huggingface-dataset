# Justvugg/Qwen3-Coder-30B-A3B-colibri-int4

## Resumen

Justvugg/Qwen3-Coder-30B-A3B-colibri-int4 es una redistribución cuantizada a int4 del modelo Qwen3-Coder-30B-A3B-Instruct, publicado por el usuario Justvugg. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo oficial de Qwen orientada a ejecutarse con el motor colibri, un runtime escrito en C puro, sin dependencias externas, que carga los expertos del MoE directamente desde disco. El repositorio declara licencia Apache 2.0, heredada del modelo base.

El modelo subyacente pertenece a la familia Qwen3-Coder, que el propio equipo de Qwen describe como "la versión de código de Qwen3". La nomenclatura 30B-A3B indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 30.000 millones de parámetros totales y unos 3.000 millones activos por token, lo que reduce de forma notable el coste de cómputo en inferencia frente a un modelo denso del mismo tamaño. La relevancia de esta conversión concreta reside en que el motor colibri apunta a ejecutar modelos MoE de gran tamaño en hardware de consumo, transmitiendo expertos desde disco en lugar de mantenerlos en memoria.

La model card del repositorio no aporta información técnica adicional: únicamente contiene la declaración de licencia. No hay pipeline declarado, no se listan idiomas, no hay resultados de evaluación y el contador de descargas y "likes" está a cero en el momento de redactar esta ficha. Por tanto, buena parte de las especificaciones que siguen se marcan como no disponibles o se infieren exclusivamente de la nomenclatura del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura del modelo base |
| Parametros totales | Aproximadamente 30.000 millones (derivado del nombre del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | Aproximadamente 3.000 millones (derivado del sufijo A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio asociado al motor colibri, que transmite expertos desde disco) |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo. Se trata de una conversión de pesos del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct a cuantización int4, empaquetada para el motor colibri del mismo autor. La arquitectura, por tanto, es la del modelo base: un transformer con mezcla de expertos y activación dispersa, tal como indica el sufijo A3B y la descripción del proyecto colibri, que se presenta explícitamente como un motor para "modelos MoE frontera". No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF o DPO.

La innovación técnica relevante de esta publicación no está en el modelo, sino en el runtime objetivo. Según la descripción del proyecto colibri en GitHub, se trata de un motor en C puro, sin dependencias, que transmite los expertos desde disco en lugar de cargarlos íntegramente en memoria. Ese diseño permite ejecutar modelos MoE grandes en equipos con memoria limitada, a cambio de depender del ancho de banda y la latencia del almacenamiento. La cuantización int4 reduce además el tamaño de los pesos que hay que leer.

## Capacidades

- Generación de código: al derivar de Qwen3-Coder-30B-A3B-Instruct, el modelo está orientado a tareas de programación, aunque no se detallan capacidades concretas en la información disponible.
- Razonamiento multi-paso: no confirmado en la información proporcionada.
- Tool calling / function calling: no confirmado en la información proporcionada.
- Uso en agentes: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles.

Nota: la model card de este repositorio no documenta ninguna capacidad de forma explícita. Cualquier capacidad atribuible proviene del modelo base, no verificada aquí.

## Casos de uso

- Asistente de programación en local: el modelo puede desplegarse en una estación de trabajo con GPU de consumo para autocompletado y generación de código sin enviar el código fuente a servicios externos, gracias a la cuantización int4 y al motor colibri.
- Ejecución en equipos con memoria limitada: el diseño de colibri, que transmite expertos desde disco, permite probar un MoE de unos 30.000 millones de parámetros en máquinas que no podrían alojarlo completo en RAM o VRAM.
- Laboratorio de investigación sobre cuantización: sirve para estudiar la degradación de calidad de un modelo de código al pasar a int4 y comparar el comportamiento frente a otras cuantizaciones del mismo modelo base.
- Evaluación de motores de inferencia alternativos: útil para comparar el rendimiento de colibri frente a llama.cpp, vLLM o TGI sobre el mismo modelo base.
- Prototipado de pipelines de generación de código en CI/CD: si el modelo base soporta tool calling (no confirmado aquí), podría integrarse en tareas automatizadas de revisión o generación de parches, siempre que el rendimiento del streaming desde disco sea suficiente.
- Docencia y formación: permite ilustrar de forma práctica cómo funciona un MoE con activación dispersa y cómo afecta la cuantización al consumo de recursos, en un entorno controlado y sin coste de API.
- Desarrollo de aplicaciones offline: escenarios con conectividad restringida o requisitos de privacidad estrictos, donde no es aceptable depender de un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni los resultados de búsqueda consultados incluyen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación para esta conversión int4.

## Requisitos de hardware

- VRAM para los pesos en int4: aproximadamente 15 GB para los 30.000 millones de parámetros a 4 bits, más el espacio adicional para caché KV y buffers de activación. Cifra estimada, no confirmada por el autor.
- Estrategia de memoria de colibri: al transmitir expertos desde disco, la huella en memoria puede ser inferior a la del modelo completo, pero el almacenamiento pasa a ser el cuello de botella. Se recomienda SSD NVMe.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajarían tarjetas con 24 GB o más, como RTX 3090, RTX 4090, A100 40/80 GB o H100; y con el modo de streaming desde disco, potencialmente GPUs con menos VRAM.
- GPU de consumo: sí, previsiblemente en tarjetas de 24 GB (RTX 3090/4090) e inferior si el streaming desde disco funciona según lo descrito. No confirmado.
- Opciones de despliegue: motor colibri (C puro, sin dependencias) es el destino declarado del repositorio. Para el modelo base existen variantes GGUF ejecutables con llama.cpp y tutoriales de despliegue local; no se confirma que este repositorio int4 sea compatible con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Justvugg/Qwen3-Coder-30B-A3B-colibri-int4 | ~30B totales / ~3B activos (derivado del nombre) | no disponible | int4 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | ~30B totales / ~3B activos | no disponible en la informacion | bf16 (modelo original) | Apache 2.0 | Hugging Face, repositorio oficial |
| n00b001/Qwen3-Coder-30B-A3B-Instruct-Q4_K_M-GGUF | ~30B totales / ~3B activos | no disponible en la informacion | Q4_K_M | Apache 2.0 | Hugging Face, compatible con llama.cpp |

## Limitaciones y advertencias

- La model card está prácticamente vacía: solo contiene la licencia. No hay documentación de uso, ni parámetros de generación recomendados, ni advertencias del autor.
- La cuantización int4 introduce degradación de calidad respecto al modelo en bf16. El grado de degradación en tareas de código no está documentado en este repositorio.
- No se especifican los idiomas soportados. El comportamiento en castellano no está verificado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; al no haber evaluación publicada, no puede acotarse para esta conversión.
- Longitud de contexto no disponible: no puede confirmarse si conserva la ventana del modelo base ni si la cuantización la afecta.
- Dependencia del motor: el uso previsto requiere colibri. Si no se convierte a otro formato, las opciones de despliegue quedan limitadas a ese runtime.
- Rendimiento ligado al disco: el streaming de expertos desde almacenamiento puede provocar latencias altas y muy variables si el disco no es rápido.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserven los avisos de licencia y atribución correspondientes.
- Repositorio sin adopción: cero descargas y cero "likes" en el momento de redactar esta ficha, lo que implica ausencia de validación por parte de la comunidad.
- Verificar la integridad de los pesos antes de usarlos en producción: al ser una conversión de terceros, conviene contrastar el resultado con el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Justvugg/Qwen3-Coder-30B-A3B-colibri-int4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Motor colibri (GitHub): https://github.com/JustVugg/colibri
- Repositorio oficial de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Variante GGUF Q4_K_M: https://huggingface.co/n00b001/Qwen3-Coder-30B-A3B-Instruct-Q4_K_M-GGUF
- Tutorial de ejecución local: https://aiindigo.com/tutorials/getting-started-with-qwen3-coder-30b-local-code-generation
