# ransom32/smai-a4-cifar10-mlp

## Resumen

El modelo `ransom32/smai-a4-cifar10-mlp` es un perceptrón multicapa (MLP) muy pequeño entrenado desde cero para la clasificación de imágenes del conjunto CIFAR-10. Lo desarrolla el usuario de HuggingFace `ransom32` como parte de una asignación académica de la asignatura SMAI (aparentemente, un curso de aprendizaje automático). No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imágenes de 10 clases con una arquitectura trivial de dos capas lineales (3072 → 32 → 10) y una activación ReLU intermedia.

El modelo resuelve un problema muy acotado: dado un vector de 3072 características (una imagen RGB de 32×32 píxeles aplanada y normalizada), predecir una de las diez clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco o camión). Su relevancia práctica es nula fuera del contexto docente: se trata de un artefacto de aprendizaje con fines ilustrativos, no de un modelo destinado a producción.

La información disponible es muy escasa: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, y la model card se limita a describir la arquitectura, el preprocesamiento, los hiperparámetros de entrenamiento y una única métrica de evaluación (42,72 % de exactitud en test). No hay datos sobre licencia, idiomas ni benchmarks comparativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP): Linear(3072, 32) + ReLU + Linear(32, 10) |
| Parámetros totales | 98.474 (3072×32 + 32 + 32×10 + 10) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantización | no disponible (pesos en float64) |
| Idiomas soportados | no disponible (no aplica; clasificador de imágenes) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`model.pt`) y NumPy (`model.npz` con `W0`, `b0`, `W1`, `b1`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas totalmente conectadas con activación ReLU en la capa oculta y 10 logits de salida. La entrada es una imagen CIFAR-10 de 32×32×3 píxeles aplanada en orden HWC row-major, convertida a float64 y dividida por 255. Después se aplica una normalización por característica con la media y la desviación típica calculadas únicamente sobre las 50.000 imágenes del split de entrenamiento original (las desviaciones típicas nulas usan divisor 1). Los pesos y sesiones se almacenan en float64, lo que es inusual y no aporta ventajas prácticas frente a float32 para este tamaño.

El entrenamiento se realizó con descenso de gradiente estocástico (SGD), tasa de aprendizaje 0,05, tamaño de lote 64, 100 épocas y sin parada temprana. Se usaron etiquetas de entrenamiento verdaderas (p=0), con semilla base 1037, semilla de inicialización 1038 y semilla de lote 1039. No se menciona el uso de aumento de datos, regularización, optimizadores adaptativos ni ajuste fino. Los resultados proceden de una única semilla y de esta arquitectura pequeña, tal como advierte el propio autor.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada exclusivamente de imágenes RGB de 32×32 píxeles; no admite otras resoluciones sin remuestreo previo.
- Salida de 10 logits; no incluye capa softmax en el grafo (el usuario debe aplicarla si necesita probabilidades).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales.
- No es un modelo generativo: no produce texto, código, matemáticas ni descripciones.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como ejemplo mínimo de un clasificador entrenado desde cero, útil para ilustrar el flujo completo de preprocesamiento, entrenamiento con SGD y evaluación en CIFAR-10.
- Reproducción de experimentos académicos: al incluir `config.json` con hiperparámetros y semillas, permite reproducir exactamente el entrenamiento y comparar variantes (por ejemplo, cambiar la semilla o el tamaño de la capa oculta).
- Referencia de línea base (baseline) para CIFAR-10: con un 42,72 % de exactitud, sirve como cota inferior trivial frente a la que comparar arquitecturas convolucionales o transformers de visión en trabajos estudiantiles.
- Pruebas de integración de pipelines de inferencia: al ser un modelo diminuto en float64, es útil para validar el flujo de descarga desde HuggingFace Hub, carga de `state_dict` y ejecución en CPU sin necesidad de GPU.
- Demostraciones de normalización por característica: el archivo `preprocessing.npz` permite explicar y verificar el cálculo de media y desviación típica sobre el conjunto de entrenamiento y su aplicación en inferencia.
- Verificación de equivalencia entre implementaciones: al proporcionar pesos tanto en PyTorch (`model.pt`) como en NumPy (`model.npz`), permite comprobar que dos implementaciones distintas producen los mismos logits.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del propio autor:

| Métrica | Valor |
|---|---|
| Exactitud en test (CIFAR-10) | 42,72 % |
| Macro F1 en test (CIFAR-10) | 0,422888 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo. Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable (menos de 1 MB para los pesos en float64; unos 98.474 parámetros × 8 bytes ≈ 0,79 MB, más el vector de entrada de 3072 valores).
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU (incluso integradas) es suficiente.
- Cabe en cualquier GPU consumer y en dispositivos de muy bajos recursos (Raspberry Pi, móviles).
- Opciones de despliegue: PyTorch nativo (carga directa del `state_dict`), NumPy (con `model.npz`), o exportación a ONNX si se desea. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia sería del orden de microsegundos por muestra en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia conceptual, un MLP de este tamaño se sitúa muy por debajo de arquitecturas convolucionales sencillas (por ejemplo, una CNN básica de CIFAR-10 suele superar el 70 % de exactitud) y de los transformers de visión modernos, pero no se han encontrado datos concretos de alternativas en la información disponible para establecer una comparativa rigurosa.

| Modelo | Parámetros | Contexto | Exactitud CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ransom32/smai-a4-cifar10-mlp | 98.474 | no aplica | 42,72 % | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Exactitud baja: 42,72 % en test, muy lejos del estado del arte en CIFAR-10 (que supera el 95 % con arquitecturas modernas). No es adecuado para aplicaciones reales de clasificación.
- Entrenado con una única semilla y una arquitectura mínima; los resultados pueden no ser representativos de otras configuraciones.
- Sin aumento de datos ni regularización documentada, lo que probablemente contribuye al bajo rendimiento y a posibles problemas de sobreajuste.
- Sesgos conocidos: no documentados, pero al entrenarse solo con CIFAR-10 hereda los sesgos de ese conjunto (clases desbalanceadas en la práctica, imágenes de baja resolución y contextos limitados).
- Riesgo de alucinación: no aplica (no es generativo), pero sí puede producir clasificaciones erróneas con alta confianza en imágenes ambiguas.
- Limitaciones de contexto o idioma: no aplica; solo acepta imágenes de 32×32×3 píxeles en el formato exacto de CIFAR-10.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no se puede asumir permiso para uso comercial sin consultar al autor.
- Caveat importante para producción: es un artefacto académico sin mantenimiento, sin documentación de robustez ni validación externa; no debe desplegarse en entornos productivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ransom32/smai-a4-cifar10-mlp
- Run de entrenamiento (W&B, CoreWeave): https://forge.coreweave.com/wandb/mukund-hebbar23-iiit-hyderabad/smai-assignment-4/runs/2nvg8zgr
- Dataset CIFAR-10 en HuggingFace: https://huggingface.co/datasets/uoft-cs/cifar10
