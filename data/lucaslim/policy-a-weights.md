# lucaslim/policy-a-weights

## Resumen

`policy-a-weights` es un conjunto de pesos para una política de control de brazo robótico basada en *behaviour cloning* (imitación de comportamiento), publicada por el usuario lucaslim en Hugging Face. No se trata de un modelo de lenguaje, sino de una red neuronal densa de muy pequeño tamaño (95.023 parámetros en total) que mapea observaciones del robot —posiciones y velocidades articulares, apertura de pinza, pose del efector final y una miniatura RGB de la cámara de muñeca— a acciones motoras: seis incrementos articulares y un objetivo de pinza.

La arquitectura es un perceptrón multicapa (MLP) de tres capas densas con anchura oculta de 128 y precisión fp32. Los pesos se distribuyen en formato safetensors junto con un `config.json` que define el tamaño de entrada, la anchura oculta y la resolución de la miniatura de la cámara. El código de inferencia que carga estos ficheros reside en un repositorio GitHub separado (`policy-a`), lo que implica que el modelo no es autocontenido: para usarlo hay que integrar tanto los pesos como la lógica de preprocesado y postprocesado del repositorio.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de política de imitación para robótica de bajo coste, útil para experimentar con *behavior cloning* en entornos simulados. No hay información sobre idiomas, benchmarks ni datos de entrenamiento publicados, y el repositorio tiene cero descargas y cero *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 3 capas densas (behaviour cloning) |
| Parametros totales | 95.023 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

La política es una red totalmente conectada con tres capas densas y anchura oculta de 128, almacenada en fp32. Los tensores del fichero safetensors corresponden a `net.0`, `net.2` y `net.4` (pesos y sesgos), más dos tensores auxiliares `input_mean` e `input_std` que indican normalización de la entrada. La entrada combina estado propioceptivo del robot (posiciones y velocidades articulares, apertura de pinza, pose del efector final) con una miniatura RGB de la cámara de muñeca cuyo tamaño se define en `config.json`. La salida son seis incrementos articulares y un objetivo de pinza.

El entrenamiento se realizó sobre *rollouts* simulados generados localmente, según indica la model card. No se especifica el número de episodios, la composición del dataset, si hubo aumento de datos ni si se aplicó alguna técnica de regularización. Tampoco se documenta el algoritmo de optimización, la función de pérdida ni el procedimiento de validación. No hay innovaciones técnicas destacables más allá del propio enfoque de imitación supervisada con entrada multimodal (propiocepción + imagen de baja resolución).

## Capacidades

- Control de brazo robótico de 6 grados de libertad mediante predicción de incrementos articulares.
- Control de pinza mediante un objetivo escalar de apertura.
- Fusión de entrada propioceptiva (posiciones, velocidades, pose del efector) con una miniatura RGB de la cámara de muñeca.
- Normalización de entrada incorporada mediante `input_mean` / `input_std`.
- Inferencia ligera en CPU o GPU sin dependencias de frameworks de deep learning pesados, ya que la librería declarada es `numpy`.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión de alta resolución, audio ni generación de texto.

## Casos de uso

- **Prototipado de políticas de imitación en simulación**: cargar los pesos y el código del repositorio `policy-a` para reproducir el comportamiento entrenado en un entorno simulado y servir como línea base para experimentos propios de *behavior cloning*.
- **Docencia y formación en robótica**: ejemplo mínimo (95.023 parámetros) para explicar el flujo completo de una política de imitación, desde la captura de observaciones multimodales hasta la generación de acciones articulares.
- **Pruebas de integración de pipelines de inferencia**: al usar numpy y safetensors, permite validar el *preprocesado* de imágenes de muñeca y la normalización de entradas en un *stack* ligero antes de migrar a modelos mayores.
- **Comparación de arquitecturas de política**: servir de referencia de MLP pequeño frente a políticas basadas en transformers o difusión en tareas de manipulación con cámara de muñeca.
- **Evaluación de robustez ante resolución de imagen**: el `config.json` expone el tamaño de la miniatura de la cámara, lo que permite estudiar cómo afecta la resolución de entrada al comportamiento de la política.
- **Despliegue en hardware de bajos recursos**: por su tamaño y formato, es viable ejecutarlo en un ordenador de placa única o en la CPU de un robot, siempre que se implemente el bucle de control adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos en fp32 (95.023 parámetros × 4 bytes ≈ 380 KB), más el *overhead* de la miniatura RGB y del *runtime* de numpy.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Una GPU consumer (por ejemplo, RTX 4090) solo aportaría ventajas marginales en latencia.
- Cabe en cualquier GPU consumer y en hardware embebido con suficiente memoria para el *runtime* de Python y numpy.
- Opciones de despliegue: inferencia directa con numpy y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependerán del *hardware* y del bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| policy-a-weights | 95.023 | no aplica | no disponible | MIT | Hugging Face (repo público) |
| Políticas de imitación tipo ACT / Diffusion Policy | millones a decenas de millones | no aplica | no disponible en esta ficha | variable | Repositorios académicos |
| Políticas basadas en VLA (p. ej. OpenVLA) | miles de millones | no aplica | no disponible en esta ficha | variable | Hugging Face |

No se dispone de datos de rendimiento comparables en la información proporcionada, por lo que la comparativa se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre *rollouts* simulados generados localmente; no hay evidencia de transferencia a un robot real (*sim-to-real*).
- El dataset de entrenamiento no está publicado, lo que impide auditar sesgos, cobertura de estados y posibles modos de fallo.
- No se documentan métricas de éxito, error de seguimiento ni robustez ante perturbaciones.
- La política depende de una cámara de muñeca y de un formato de observación concreto; cualquier cambio en la resolución o en el orden de las entradas requiere ajustar el código de inferencia.
- El modelo no es autocontenido: necesita el repositorio GitHub `policy-a` para el preprocesado y el bucle de control.
- Licencia MIT permite uso comercial, pero al no haber validación experimental publicada, no es recomendable para producción sin una evaluación propia.
- Riesgo de alucinación no aplica (no es un modelo generativo de lenguaje); el riesgo equivalente es la producción de acciones inseguras fuera de la distribución de entrenamiento.
- Repositorio con cero descargas y cero *likes*: no hay comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/lucaslim/policy-a-weights
- Repositorio de código `policy-a`: mencionado en la model card, sin URL explícita en la información disponible.
