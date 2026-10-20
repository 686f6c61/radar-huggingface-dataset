# Efficient-Large-Model/Long-WAM-LIBERO-IDM-LeRobot

## Resumen

Long-WAM LIBERO IDM — LeRobot es un checkpoint de política robótica publicado por Efficient-Large-Model, una versión nativa de LeRobot del modelo Long-WAM LIBERO IDM. Se trata de un modelo de acción para manipulación en el entorno de simulación LIBERO que combina un modelo de mundo (world action model, WAM) con un módulo de dinámica inversa (IDM): antes de desdenoisar la acción, el modelo imagina el vídeo futuro de la escena. El checkpoint está entrenado con 48 ticks de control de historial de observación, lo que le permite condicionar la acción sobre una ventana temporal relativamente larga.

Con 12.406.309.603 parámetros (unos 12,4 mil millones) y un repositorio de 24,8 GB, es un modelo grande para los estándares habituales de políticas robóticas tipo VLA, donde lo común son modelos de 2 a 7 mil millones de parámetros. Se distribuye en formato safetensors bajo licencia Apache-2.0 e incluye los pesos completos de la política, el tokenizador, la configuración y las estadísticas de preprocesado, lo que permite reproducir la inferencia sin pasos adicionales de calibración.

Su relevancia ahora es doble: por un lado, lleva al ecosistema LeRobot una política basada en modelo de mundo, una línea de investigación que hasta hace poco vivía en repositorios de investigación aislados; por otro, al estar empaquetado con `LongWAMPolicy` y un comando `lerobot-eval` listo para LIBERO, reduce la barrera de entrada para comparar políticas de manipulación de forma reproducible. El modelo no es un modelo de lenguaje: es un componente de control robótico, por lo que muchas de las métricas habituales de las fichas de LLM (idiomas, contexto en tokens, benchmarks de razonamiento) no aplican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política robótica basada en modelo de mundo (Long-WAM) con módulo IDM; predice vídeo futuro antes de desdenoisar la acción. El tipo exacto de bloque (transformer, DiT u otro) no se detalla en la información disponible |
| Parámetros totales | 12.406.309.603 (≈12,4 mil millones) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 48 ticks de control de historial de observación; no se especifica longitud de contexto en tokens |
| Tipos de cuantización | No disponible. El repositorio solo distribuye safetensors; el tamaño de 24,8 GB es coherente con pesos en bf16/fp16, aunque la model card no lo confirma |
| Idiomas soportados | No aplica / no disponible (política de control robótico; la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato nativo LeRobot) |

## Arquitectura y entrenamiento

La información disponible describe el diseño a alto nivel: es un world action model (Long-WAM) con un módulo de dinámica inversa (IDM) que «imagina vídeo futuro antes de desdenoisar acciones». Es decir, el pipeline genera una predicción del estado visual futuro de la escena y usa esa representación como condicionamiento para el proceso de denoising que produce la acción de control. El checkpoint emplea 48 ticks de control de observación como historial, lo que sugiere una ventana temporal explícita para tareas con oclusión o dependencia de estados previos. No se especifican en la información proporcionada el tipo de backbone, el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema de difusión concreto.

Tampoco se detallan el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por refuerzo. Por el contexto (tags `libero` y `lerobot`, comando de evaluación sobre `libero_spatial`), el entrenamiento está orientado al benchmark LIBERO de manipulación en simulación, con las definiciones de cámara, acciones y estados guardadas en el repositorio. El paquete incluye el tokenizador, la configuración y las estadísticas de preprocesado, lo que indica que la normalización de observaciones y acciones forma parte del artefacto distribuido y debe respetarse en inferencia. No se documenta ninguna innovación adicional como decodificación especulativa, atención lineal o decodificación paralela.

## Capacidades

- Control robótico de manipulación: genera acciones de control a partir de observaciones visuales y de estado en tareas del entorno LIBERO.
- Predicción de vídeo futuro: el módulo de modelo de mundo imagina el estado visual siguiente antes de producir la acción, lo que aporta condicionamiento temporal explícito.
- Historial de observación largo: ventana de 48 ticks de control, útil en tareas con oclusión parcial o dependencia de estados previos.
- Inferencia paso a paso: expone `select_action` para invocar en cada tick de control y `reset()` para reiniciar el estado entre episodios.
- Integración nativa con LeRobot: clase `LongWAMPolicy` con `from_pretrained(...)` y pre/post-procesadores guardados en el repositorio.
- Evaluación reproducible: comando `lerobot-eval` con `--env.type=libero` y `--env.task=libero_spatial`, con `eval.batch_size=1`.
- Sin capacidades de lenguaje, tool calling, agentes, visión general o audio documentadas: es un componente de política, no un asistente conversacional.
- Ejecución síncrona: la model card indica explícitamente que la ejecución es síncrona, sin soporte documentado de inferencia asíncrona o batching multi-entorno.

## Casos de uso

- Evaluación comparativa de políticas en LIBERO: usar `lerobot-eval --env.type=libero --env.task=libero_spatial --eval.batch_size=1` para obtener una línea base reproducible frente a otras políticas del ecosistema LeRobot en la misma tarea y con las mismas definiciones de cámara y acciones.
- Investigación en modelos de mundo para control: el módulo de predicción de vídeo futuro permite estudiar si la «imaginación» visual mejora la calidad de las acciones frente a políticas reactivas equivalentes, aislando el efecto del componente WAM.
- Tareas de manipulación con oclusión: los 48 ticks de historial permiten condicionar la acción sobre objetos que han salido del campo de visión reciente, un escenario frecuente en apilamiento y reordenación de objetos en LIBERO.
- Generación de datos sintéticos y aumentación: los rollouts imaginados del modelo de mundo pueden emplearse como material de análisis cualitativo de trayectorias antes de ejecutar la política en el simulador.
- Prototipado de pipelines de robot learning: integrar `LongWAMPolicy` en un script propio de LeRobot para validar la interfaz (`select_action` por tick, `reset()` por episodio) antes de trasladar el flujo a otros checkpoints o entornos.
- Docencia y formación técnica: el checkpoint sirve como ejemplo funcional de política con modelo de mundo dentro de un curso o taller sobre LeRobot, con pesos y estadísticas de preprocesado incluidos.
- Reproducibilidad en CI: el comando de evaluación con `batch_size=1` y ejecución síncrona es adecuado para pruebas de regresión deterministas en un pipeline de integración continua de un laboratorio.
- Investigación en transferencia sim-to-real: punto de partida para fine-tuning sobre datos propios, teniendo en cuenta que el checkpoint está especializado en LIBERO y requerirá reentrenamiento para dominios distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona el comando de evaluación sobre `libero_spatial`, sin cifras de tasa de éxito ni de otras métricas.

| Benchmark | Resultado |
|---|---|
| LIBERO (`libero_spatial`), vía `lerobot-eval` | No disponible (solo se documenta el comando de ejecución) |
| Tasa de éxito por tarea | No disponible |
| Throughput / latencia por tick | No disponible |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los pesos suponen unos 24,8 GB (12,4 B × 2 bytes); con activaciones, buffers del modelo de vídeo y memoria del entorno de simulación, una estimación prudente sitúa el total en 30-40 GB.
- VRAM estimada con cuantización: 8 bits ≈ 13 GB de pesos y 4 bits ≈ 7 GB de pesos, más overhead; no hay soporte de cuantización documentado para esta política, por lo que son estimaciones teóricas.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB. Con 40 GB o más se cubre el escenario bf16 con margen.
- GPU de consumo: en bf16 los pesos (24,8 GB) superan los 24 GB de una RTX 4090, por lo que no cabe sin cuantización u offloading a CPU. Una RTX 5090 de 32 GB sería el mínimo razonable en consumo para bf16, según estimación.
- Despliegue: LeRobot con soporte de política Long-WAM y los extras `longwam` y `libero`; `lerobot-eval` para evaluación y `LongWAMPolicy.from_pretrained(...)` para inferencia directa. No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La evaluación oficial usa `eval.batch_size=1` y ejecución síncrona, lo que implica inferencia tick a tick sin paralelismo entre entornos.
- Almacenamiento: 24,8 GB de repositorio, más el espacio del simulador LIBERO y de las dependencias de LeRobot.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de información pública general y no de las fuentes proporcionadas para esta ficha; conviene verificarlos antes de citarlos.

| Modelo | Parámetros | Contexto / historial | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM LIBERO IDM — LeRobot (este) | 12,4 B | 48 ticks de control | Apache-2.0 | safetensors (LeRobot) | HuggingFace |
| OpenVLA 7B | 7 B | No disponible en esta ficha | MIT | safetensors | HuggingFace |
| π0 (Physical Intelligence) | ≈3,3 B | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Publicado por el autor |
| Políticas diffusion policy / ACT en LeRobot | ≪1 B | No disponible en esta ficha | Apache-2.0 (LeRobot) | safetensors (LeRobot) | HuggingFace |

La diferencia principal frente a OpenVLA y π0 es el enfoque: este checkpoint incorpora explícitamente un modelo de mundo que predice vídeo futuro antes de denoisar la acción, mientras que las alternativas citadas son políticas visión-lenguaje-acción sin esa etapa generativa. Como contrapartida, su tamaño (12,4 B) es entre 2 y 4 veces mayor que el de las alternativas, lo que encarece la inferencia. No se dispone de cifras de benchmark que permitan comparar rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado para el benchmark LIBERO en simulación; no hay evidencia en la información disponible de validez en robots físicos ni en otros dominios sin fine-tuning.
- Sin datos de rendimiento: no se publican tasas de éxito, curvas de aprendizaje ni comparaciones numéricas, por lo que no es posible evaluar su calidad sin ejecutar la evaluación por cuenta propia.
- Dependencia de definiciones guardadas: la model card exige usar el orden de cámaras y las definiciones de acción y estado guardadas; alterarlas invalida la política y puede producir acciones incorrectas sin errores evidentes.
- Requisito de versión concreta: necesita una versión de LeRobot con soporte de política Long-WAM y los extras `longwam` y `libero`; versiones distintas pueden no cargar el checkpoint.
- Estado del episodio: es obligatorio llamar a `reset()` entre episodios; omitirlo contamina el historial de 48 ticks y degrada las acciones.
- Inferencia síncrona y coste: 12,4 B de parámetros con `batch_size=1` implican latencia por tick alta y poco margen para control en tiempo real sin optimización.
- Idiomas y sesgos: al no ser un modelo de lenguaje, no hay evaluación multilingüe ni de sesgos textuales; los sesgos relevantes serían los del dataset de demostraciones de LIBERO, no documentados.
- Riesgo de alucinación visual: el módulo de modelo de mundo puede generar predicciones de vídeo plausibles pero incorrectas, que condicionen acciones erróneas; no se documentan métricas de fidelidad de la predicción.
- Licencia: Apache-2.0 permite uso comercial y modificación con atribución, pero las dependencias (LeRobot, simulador LIBERO, assets del entorno) tienen sus propias licencias que deben revisarse por separado.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida; tratar como artefacto de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efficient-Large-Model/Long-WAM-LIBERO-IDM-LeRobot
- Modelo base (versión no LeRobot): https://huggingface.co/Efficient-Large-Model/Long-WAM-LIBERO-IDM
- LeRobot (librería indicada en la model card): https://github.com/huggingface/lerobot
- Benchmark LIBERO (entorno de evaluación citado): https://libero-project.github.io
- Resultados de búsqueda web: no se encontraron enlaces relevantes sobre este modelo; las búsquedas devolvieron únicamente definiciones de diccionario del término «efficient».
