# Inserloft-AI/Apollo-Laikan-Experimental

## Resumen

Apollo Laikan 100M Experimental es un checkpoint de investigación publicado por Inserloft-AI bajo el identificador `Inserloft-AI/Apollo-Laikan-Experimental`. No es un modelo de lenguaje autoregresivo: se trata de un encoder Transformer bidireccional de tipo "decision-model" que procesa una secuencia de identificadores enteros y emite, en un único pase forward, tres salidas simultáneas: un vector de 10 logits de elección, un valor escalar de puntuación y 2 logits de una cabeza denominada "Noul" descrita como relacionada con restricciones. El dominio de investigación declarado por el autor es la optimización combinatoria, con interés particular en el Capacitated Vehicle Routing Problem (CVRP).

El checkpoint contiene 110.521.357 parámetros reales según los tensores publicados en safetensors, con un tamaño de repositorio de 0,4 GB y pesos en FP32. La designación "100M" corresponde a la clase de tamaño de la familia, no a un recuento exacto de tensores. La arquitectura de referencia incluye una tabla de embeddings de 32.000 entradas por 768 dimensiones, 12 capas de encoder bidireccional con 12 cabezas de atención y feed-forward de 3.072 dimensiones, seguido de un pooling adaptativo y tres cabezas MLP independientes de dos capas.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos pequeños y especializados que sustituyen a los LLM generalistas en tareas de decisión estructurada, donde la latencia y el coste por inferencia importan más que la fluidez textual. No obstante, el repositorio es explícitamente experimental y no constituye un paquete de inferencia autocontenido: faltan tokenizador, codificador de entrada, datos de entrenamiento, resultados de benchmarks y protocolo de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional, no autoregresivo, con tres cabezas de salida |
| Parametros totales | 110.521.357 (110,5M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica longitud máxima de secuencia soportada) |
| Tipos de cuantizacion | no disponible (el checkpoint publicado está en FP32) |
| Idiomas soportados | no disponible (el modelo no procesa texto de forma directa; opera sobre IDs enteros 0-31.999) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, 442.101.652 bytes) |

## Arquitectura y entrenamiento

La estructura deducida de los nombres y formas de los tensores del checkpoint es la siguiente: una tabla de embeddings aprendidos de 32.000 entradas con vectores de 768 dimensiones; un encoder Transformer bidireccional de 12 capas, con 12 cabezas de atención y capa feed-forward de 3.072 dimensiones por bloque; un pooling promedio adaptativo sobre la dimensión de secuencia; y tres cabezas MLP independientes de dos capas con capa oculta de 384 dimensiones y activación GELU. Las cabezas tienen las formas `768 → 384 → 10` (Choice), `768 → 384 → 1` (Score) y `768 → 384 → 2` (Noul).

No se ha publicado información sobre el conjunto de datos de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal; el modelo es un encoder Transformer estándar con pooling y cabezas múltiples. El repositorio no incluye `config.json`, ficheros de tokenizador, artefacto de embeddings posicionales, módulo de implementación del modelo ni código de preprocesamiento, lo que impide reconstruir el pipeline exacto de entrenamiento o inferencia a partir de los ficheros publicados.

## Capacidades

- Procesamiento de secuencias de IDs enteros en el rango 0-31.999 mediante un encoder bidireccional, sin generación autoregresiva de texto.
- Emisión de 10 logits de elección en una sola pasada forward (cabeza Choice), pensados para seleccionar entre diez ranuras de salida; la correspondencia entre ranuras y acciones o candidatos no está publicada.
- Regresión escalar mediante la cabeza Score, cuyo objetivo, unidades, normalización e interpretación no están documentados.
- Clasificación binaria mediante la cabeza Noul (2 logits), descrita en las notas del proyecto como relacionada con restricciones; la correspondencia clase-etiqueta y el umbral de decisión no se han publicado.
- No soporta tool calling ni function calling en el sentido convencional de los LLM.
- No soporta razonamiento multi-paso ni comportamiento de agente de forma nativa; el modelo produce una decisión por pase forward.
- No dispone de capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Investigación en optimización combinatoria aplicada al CVRP: el modelo está declarado como decision-model para este dominio, por lo que puede emplearse como banco de pruebas para evaluar si un encoder bidireccional de 110M parámetros es suficiente para producir señales de elección y de restricción en instancias de routing. Requiere construir el codificador de estado y el mapeo de acciones que el repositorio no incluye.
- Selección de candidatos en entornos estructurados: la cabeza Choice de 10 logits permite puntuar hasta diez alternativas por pase forward, útil en escenarios donde el espacio de acciones se pueda discretizar en diez ranuras (por ejemplo, selección de vecindario en heurísticas de búsqueda local).
- Filtrado de estados inviables: la cabeza Noul de 2 logits puede emplearse como señal auxiliar para descartar estados que violen restricciones, siempre que se documente previamente la correspondencia clase-etiqueta y se calibre el umbral.
- Regresión de coste o calidad de solución: la cabeza Score puede utilizarse como estimador escalar de una métrica objetivo (por ejemplo, coste de ruta) en pipelines de búsqueda guiada, una vez definido el objetivo de entrenamiento, que actualmente no está publicado.
- Evaluación comparativa de arquitecturas no autoregresivas: sirve como referencia de 110M parámetros para contrastar encoders bidireccionales frente a modelos generativos en tareas de decisión, dentro de un entorno de investigación controlado.
- Prototipado de políticas de decisión de baja latencia: al ser un encoder pequeño en FP32 (0,4 GB), puede integrarse en bucles de decisión donde el coste por inferencia sea crítico, siempre que se disponga del codificador de entrada compatible.
- Reproducción y auditoría de checkpoints: útil para estudiar la estructura de tensores, el pooling y las cabezas múltiples en un caso real, así como para validar herramientas de carga de safetensors en modelos no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo para los pesos (442 MB), más activaciones y memoria del codificador de entrada no incluido; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB para los pesos, si se convierte el checkpoint (no se distribuye en estos formatos).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por memoria; una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 pueden ejecutar el modelo con holgura. Para despliegues en servidor, A100 o H100 no aportan ventaja por memoria, aunque sí por throughput en lotes grandes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM efectiva para lotes moderados, asumiendo que se implemente el codificador de entrada.
- Opciones de despliegue: al no ser un modelo `AutoModelForCausalLM` ni disponer de `config.json`, no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama. Requiere un módulo PyTorch personalizado que replique la arquitectura de referencia y cargue `model.safetensors`.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por tamaño (110M parámetros, 12 capas), se espera una latencia de milisegundos por lote en GPU consumer, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apollo Laikan 100M Experimental | 110,5M | no disponible | Decision-model para optimización combinatoria (CVRP declarado) | Apache 2.0 | Pesos en HF; sin tokenizador ni código de inferencia |
| Modelos de decisión específicos para CVRP (p. ej. POMO, NeuRewriter) | variable (típicamente <10M) | no aplica | Políticas de construcción/mejora para routing | variable según implementación | Código en repositorios académicos; no siempre con pesos publicados |
| Encoders tipo BERT-base | 110M | 512 típicamente | Representación de texto, clasificación | Apache 2.0 / MIT según variante | Amplia disponibilidad con tokenizador y ecosistema |
| LLM pequeños (p. ej. modelos de 100-150M) | 100-150M | 2k-8k típicamente | Generación de texto y decisión vía prompting | variable | Amplia, con tooling estándar |

La comparación directa con modelos de routing académicos no es posible con datos publicados, ya que Apollo Laikan no reporta métricas de calidad de solución ni protocolo de evaluación. Frente a encoders tipo BERT, comparte tamaño y arquitectura base, pero difiere en las cabezas de salida y en la ausencia de tokenizador y ecosistema.

## Limitaciones y advertencias

- Estado experimental: el repositorio publica pesos y una descripción de arquitectura de referencia, pero no es un paquete de inferencia autocontenido.
- Falta el tokenizador y el codificador de estado: sin ellos, no es posible convertir un problema de routing o decisión en los IDs de entrada válidos. IDs aleatorios o de un tokenizador ajeno no son sustitutos válidos.
- No se especifica la longitud máxima de secuencia, la política de truncamiento ni la convención de padding.
- Las salidas son puntuaciones brutas: no deben interpretarse como probabilidades calibradas, decisiones de restricción verificadas ni acciones ejecutables.
- No se publica la correspondencia entre las 10 ranuras de la cabeza Choice y acciones o candidatos concretos.
- No se documenta el objetivo de la cabeza Score (unidades, normalización, interpretación).
- No se publica la correspondencia clase-etiqueta de la cabeza Noul ni el umbral de decisión.
- No hay datos de entrenamiento publicados, lo que impide evaluar sesgos, cobertura del dominio o riesgo de sobreajuste.
- Riesgo de alucinación no aplica en el sentido textual (no genera texto), pero sí existe riesgo de producir señales no fiables fuera de la distribución de entrenamiento, que se desconoce.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación y de evaluación hace desaconsejable su uso en producción sin una validación propia exhaustiva.
- El modelo no debe cargarse como `AutoModelForCausalLM`; hacerlo fallará o producirá resultados sin sentido.

## Enlaces

- Hugging Face: https://huggingface.co/Inserloft-AI/Apollo-Laikan-Experimental
- Paper: no disponible
- Blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
