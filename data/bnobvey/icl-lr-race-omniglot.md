# Bnobvey/icl-lr-race-omniglot

## Resumen

El repositorio `Bnobvey/icl-lr-race-omniglot` no contiene un modelo de lenguaje de propósito general, sino un conjunto de 32 checkpoints de investigación entrenados para estudiar la dinámica de entrenamiento del aprendizaje en contexto (ICL, *in-context learning*) frente al aprendizaje en pesos (IWL, *in-weights learning*). Lo desarrolla el autor Bnobvey en el marco de un proyecto del curso CS 182, y su interés es experimental: permite reproducir el barrido de tasas de aprendizaje que determina cuándo emerge la capacidad de ICL en un transformer pequeño.

La arquitectura es un transformer de solo atención de 2 capas, anchura 64 y 8 cabezas, con 1,06 millones de parámetros, entrenado sobre Omniglot con características congeladas de un ResNet18 de ImageNet (512 dimensiones). Las secuencias constan de 2 pares (imagen, etiqueta) de contexto más una imagen de consulta, y el 50% son "bursty" (la clase de la consulta aparece en el contexto). El entrenamiento usa AdamW con LR constante, batch 32 y 625.000 pasos.

Su relevancia es acotada pero concreta: el barrido separa la tasa de aprendizaje aplicada a las matrices de atención (q/k/v/o) de la aplicada al resto de parámetros (proyección de imagen, embeddings de etiqueta y posición, LayerNorms y cabeza de salida), y muestra que la aparición de ICL depende de la relación entre ambas. No es un modelo desplegable en producción: es material reproducible de un estudio sobre dinámica de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de solo atención, 2 capas, anchura 64, 8 cabezas |
| Parametros totales | 1,06 M (la mayoría en el embedding de etiqueta y la cabeza de salida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2 pares (imagen, etiqueta) + 1 imagen de consulta por secuencia |
| Tipos de cuantizacion | no disponible (checkpoints en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; opera sobre imágenes y etiquetas de Omniglot) |
| Licencia | no disponible |
| Formato de pesos | safetensors (solo pesos, sin estado del optimizador) |

## Arquitectura y entrenamiento

El modelo es un transformer de solo atención de 2 capas con anchura 64 y 8 cabezas, implementado en la clase `SinghClassifier` del repositorio de GitHub del proyecto. Las entradas de imagen son características congeladas de 512 dimensiones extraídas de un ResNet18 preentrenado en ImageNet, no píxeles crudos. El vocabulario de salida cubre 7.712 etiquetas, correspondientes a 964 caracteres de los 30 alfabetos "background" de Omniglot con 8 aumentaciones (4 rotaciones × flip) y una partición de 14 dibujos de entrenamiento y 6 reservados por carácter. Los 20 alfabetos de "evaluación" se reservan como caracteres de ICL no vistos.

El entrenamiento usa AdamW con LR constante, sin weight decay, batch 32 y 625.000 pasos. La innovación metodológica es el desacoplamiento de tasas de aprendizaje: la "attention LR" se aplica a las matrices q/k/v/o y la "control LR" al resto de parámetros. El grid cruza attention LR {1e-4, 3e-4, 1e-3, 3e-3} con control LR {3e-5, 1e-4, 3e-4, 1e-3} y dos semillas (0 y 1), generando 32 ejecuciones con 40 checkpoints cada una, espaciados logarítmicamente entre el paso 0 y el 502.000, más el paso final 625.000. El autor advierte que el entrenamiento en GPU no fue determinista bit a bit, por lo que reentrenar desde las configuraciones produce ejecuciones cercanas pero no idénticas.

## Capacidades

- Clasificación de imágenes de caracteres de Omniglot mediante comparación con pares de contexto (tarea de ICL few-shot).
- Aprendizaje en contexto (ICL): resolver la consulta cuando su clase aparece en el contexto, con aparición dependiente de la relación attention LR / control LR (emergencia a partir de aproximadamente 3× o más).
- Aprendizaje en pesos (IWL): memorización de las clases de entrenamiento, con inicio escalado aproximadamente como 1 / control LR.
- Evaluación de dinámica de entrenamiento: 40 checkpoints por ejecución permiten trazar curvas de ICL e IWL a lo largo del entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Reproducción de experimentos sobre emergencia de ICL: cargar los checkpoints con `SinghClassifier` y evaluar la precisión en los alfabetos de evaluación para trazar la curva de aparición de ICL frente al paso de entrenamiento, usando los 40 checkpoints por ejecución.
- Estudio del efecto de la tasa de aprendizaje en la competición ICL/IWL: comparar las 32 ejecuciones del grid para aislar cómo la relación attention LR / control LR desplaza el límite inferior de la ventana de ICL y el inicio de IWL.
- Análisis de normas de pesos: inspeccionar el crecimiento de las normas de las matrices de atención en la configuración de attention LR 3e-3, donde el autor documenta que tanto ICL como IWL se ralentizan.
- Docencia y material de curso: servir como ejemplo reproducible de un experimento controlado de dinámica de entrenamiento en un transformer de 1,06 M de parámetros, con configuraciones resueltas incluidas en cada carpeta.
- Validación de pipelines de evaluación: usar los ficheros `validation.jsonl` (evaluación cada 3.125 pasos) como referencia para verificar que una reimplementación del bucle de evaluación produce métricas coherentes.
- Estudio de sensibilidad a semilla: comparar las semillas 0 y 1 de cada combinación de tasas para estimar la variabilidad entre ejecuciones, teniendo en cuenta la advertencia de no determinismo del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe hallazgos cualitativos y de escala (límite inferior de la ventana de ICL en torno a attention LR ≈ 3× control LR; inicio de IWL escalando como 1 / control LR; ralentización de ambos a attention LR 3e-3) pero no incluye tablas de métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El modelo tiene 1,06 M de parámetros (unos 4,2 MB en fp32) y las características de entrada son vectores de 512 dimensiones; el grueso del repositorio (5,3 GB) son los 1.280 checkpoints, no el modelo en memoria.
- GPU recomendadas: cualquier GPU, incluida CPU. No requiere A100, H100 ni RTX 4090; una GPU consumer de gama baja es más que suficiente.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y la clase `SinghClassifier` del repositorio de GitHub. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un transformer de 2 capas y anchura 64, la inferencia por secuencia es del orden de microsegundos a milisegundos en GPU, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| icl-lr-race-omniglot (este) | 1,06 M | 2 pares + consulta | Clasificación ICL few-shot sobre Omniglot | no disponible | Hugging Face (32 ejecuciones × 40 checkpoints) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de propósito general: solo clasifica caracteres de Omniglot a partir de características de ResNet18 y un contexto de 2 pares.
- No es desplegable en producción para ninguna tarea de usuario final; su valor es exclusivamente experimental y docente.
- Licencia no especificada: no hay autorización explícita para uso comercial ni para redistribución; debe consultarse al autor antes de cualquier uso más allá de la investigación.
- Los checkpoints contienen solo pesos, sin estado del optimizador, por lo que no permiten reanudar el entrenamiento de forma exacta.
- El entrenamiento no fue determinista bit a bit en GPU; los resultados de reentrenamiento serán cercanos pero no idénticos.
- El repositorio de código y documentación asociado (`github.com/timothyypark/182-final-proj`, rama `bnovey`) puede ser privado, lo que limita la reproducibilidad completa.
- El modelo depende de características congeladas de un ResNet18 de ImageNet y de los bancos de evaluación generados por el runbook del repositorio; sin ellos no es posible reconstruir las entradas.
- No hay información sobre sesgos, alucinación o comportamiento multilingüe porque el modelo no genera texto.

## Enlaces

- Hugging Face: https://huggingface.co/Bnobvey/icl-lr-race-omniglot
- Repositorio de código, configuraciones, métricas y write-up: https://github.com/timothyypark/182-final-proj (rama `bnovey`; puede ser privado)
- Documentación del experimento 2: `docs/drawer-results.md` en el repositorio de GitHub
- Documentación del modelo: `docs/race-model.md` en el repositorio de GitHub
- Configuración de entrenamiento de referencia: `configs/experiments/drawer_bursty50.yaml` en el repositorio de GitHub
