# ldxxx/ODEWorld-PT-Flow-LIBERO

## Resumen

ODEWorld-PT-Flow-LIBERO es un modelo de mundo (world model) para robótica desarrollado por el autor ldxxx, basado en la arquitectura ODEWorld presentada en el artículo «ODEWorld: A Continuous Predictive Architecture via Physical-Time Flow» (arXiv:2607.27924). El modelo se entrena sobre el benchmark LIBERO y utiliza un backbone DINOv2 para codificar observaciones visuales. Su objetivo es predecir la evolución futura de una escena robótica a partir de una imagen objetivo, generando trayectorias en un espacio latente continuo mediante integración temporal con un solucionador de EDO.

La principal innovación es el paradigma PT-Flow (Physical-Time Flow), que modela la dinámica como un campo de velocidad latente definido en tiempo físico, en lugar de la predicción discreta paso a paso. Esto permite consultas en tiempos arbitrarios, interpolación temporal densa e incluso predicción hacia atrás. Con aproximadamente 173 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de gama media, lo que lo hace accesible para investigación y prototipado en robótica.

El modelo se distribuye con licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su pipeline declarado es image-to-video, indicando que toma una imagen de contexto y genera una secuencia de vídeo que representa la evolución futura del estado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ODEWorld (PT-Flow) con backbone DINOv2 |
| Parametros totales | 172.860.038 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ODEWorld se basa en el paradigma PT-Flow, que aprende un campo de velocidad latente definido en tiempo físico. En lugar de predecir el siguiente fotograma de forma discreta, el modelo integra una EDO sobre este campo de velocidad para generar estados futuros en cualquier instante de tiempo. La arquitectura separa la representación dinámica de la estática: el codificador y el decodificador se condicionan directamente sobre el contexto estático (la imagen de entrada), de modo que el espacio latente se centra únicamente en la dinámica.

El backbone es DINOv2, un modelo de visión preentrenado que extrae características visuales robustas. El entrenamiento se realiza en el benchmark LIBERO, un conjunto de tareas de manipulación robótica en simulación. No se especifican detalles sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de predicción visual, no de lenguaje. El repositorio GitHub oficial (Dstate/ODEWorld) proporciona instrucciones de instalación, carga e inferencia.

## Capacidades

- Generación de vídeo a partir de una imagen objetivo (image-to-video), produciendo secuencias de estados futuros.
- Predicción de trayectorias en tiempo continuo mediante integración de EDO, lo que permite consultas en tiempos arbitrarios (por ejemplo, predecir el estado en t=2.5 segundos aunque el entrenamiento haya usado pasos discretos).
- Interpolación temporal densa: puede generar fotogramas intermedios entre dos instantes conocidos.
- Predicción hacia atrás: el modelo puede inferir estados anteriores a partir de un estado futuro, gracias a la reversibilidad de la dinámica en tiempo físico.
- Representación latente compacta, lo que facilita rollouts eficientes en simulación.
- No se han documentado capacidades de tool calling, razonamiento multi-paso ni procesamiento de lenguaje.

## Casos de uso

- Planificación de movimientos en robótica: el modelo puede predecir las consecuencias de una secuencia de acciones antes de ejecutarlas, permitiendo seleccionar la trayectoria más segura o eficiente.
- Simulación de escenarios para entrenamiento de políticas: generar trayectorias sintéticas realistas para aumentar el conjunto de datos de entrenamiento de agentes de control.
- Control predictivo basado en modelos (MPC): integrar el modelo como predictor de estados en un bucle de control en tiempo real, evaluando múltiples horizontes temporales con bajo coste computacional.
- Evaluación de políticas en entornos simulados: comparar el comportamiento de diferentes políticas robóticas sin necesidad de ejecutar el entorno físico completo.
- Generación de datos aumentados para aprendizaje por imitación: crear variaciones de trayectorias a partir de demostraciones existentes, interpolando entre estados.
- Investigación en modelos de mundo continuos: servir como referencia para estudiar arquitecturas que modelan dinámicas en tiempo físico frente a las discretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de arXiv (2607.27924) podría contener métricas comparativas, pero no se han extraído datos concretos en la búsqueda web realizada. Por tanto, no se pueden presentar tablas de rendimiento sin riesgo de inventar cifras.

## Requisitos de hardware

- Tamaño del modelo: 172,86 millones de parámetros. En precisión FP32, los pesos ocupan aproximadamente 691 MB; en FP16, unos 346 MB.
- VRAM estimada para inferencia: con FP16 y un lote pequeño (batch size 1), se necesitan al menos 2-4 GB de VRAM para el modelo y las activaciones. Una GPU con 6 GB (como una RTX 2060 o superior) sería suficiente para ejecutar inferencia básica.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, Tesla T4). Para entrenamiento o fine-tuning, se recomienda una GPU con 12 GB o más (RTX 3080, RTX 4090, A100).
- Opciones de despliegue: al ser una librería propia (odeworld), la inferencia se realiza mediante el código del repositorio GitHub. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen de la resolución de entrada, el número de pasos de integración y la GPU utilizada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (world models para robótica con predicción continua). La búsqueda web no arrojó alternativas directas. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al estar entrenado en LIBERO (un entorno de simulación con tareas concretas), su generalización a entornos reales o a tareas fuera de ese benchmark puede ser limitada.
- Riesgo de alucinación: como modelo generativo de vídeo, puede producir trayectorias físicamente imposibles o inconsistentes si el contexto de entrada es ambiguo o está fuera de la distribución de entrenamiento.
- No se especifican limitaciones de contexto o idioma, ya que no procesa texto.
- La licencia Apache-2.0 permite uso comercial y modificación, pero no se incluyen garantías de soporte ni mantenimiento.
- El modelo es un checkpoint de investigación; no se proporcionan scripts de evaluación estandarizados ni métricas de referencia en la model card.
- La dependencia de DINOv2 como backbone implica que cualquier actualización o cambio en ese modelo preentrenado podría afectar al comportamiento de ODEWorld.

## Enlaces

- [HuggingFace - ldxxx/ODEWorld-PT-Flow-LIBERO](https://huggingface.co/ldxxx/ODEWorld-PT-Flow-LIBERO)
- [arXiv - ODEWorld: A Continuous Predictive Architecture via Physical-Time Flow](https://arxiv.org/abs/2607.27924)
- [Paper en HuggingFace](https://huggingface.co/papers/2607.27924)
- [Sitio web del proyecto](https://dstate.github.io/odeworld_website/)
- [Repositorio GitHub de ODEWorld](https://github.com/Dstate/ODEWorld)
