# ransom32/smai-a4-cifar10-ioc-nn

## Resumen

El modelo `ransom32/smai-a4-cifar10-ioc-nn` es un perceptrón multicapa (MLP) muy pequeno entrenado desde cero para la clasificación de imágenes del conjunto CIFAR-10. Lo desarrolla el usuario de HuggingFace `ransom32` en el contexto de una asignación académica de la asignatura SMAI (presumiblemente "Statistical Methods in Artificial Intelligence"), y no constituye un modelo de propósito general ni un producto listo para producción. Su arquitectura es deliberadamente mínima: una capa oculta de 32 neuronas con activación ELU entre una entrada aplanada de 3072 dimensiones (32×32×3 píxeles) y una salida de 10 logits correspondientes a las diez clases de CIFAR-10.

El problema que aborda es la clasificación de imágenes en miniatura de 32×32 píxeles en diez categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). Su relevancia es fundamentalmente didáctica: sirve como referencia de un baseline MLP entrenado con SGD sobre CIFAR-10, con un pipeline de preprocesado documentado (aplanado HWC, normalización float64 con media y desviación típica calculadas sobre el split de entrenamiento) y unos artefactos exportados en PyTorch y NumPy que permiten reproducir la inferencia sin dependencias del framework de entrenamiento.

No es un modelo de lenguaje ni un transformer: no procesa texto, no tiene ventana de contexto lingüístico y no soporta generación, tool calling ni razonamiento multi-paso. Cualquier ficha que lo trate como un LLM sería incorrecta. Se incluye aquí porque aparece en el catálogo de HuggingFace con pipeline `image-classification`, pero sus capacidades son exclusivamente de clasificación de imágenes CIFAR-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP): 3072 → 32 → 10, activación ELU en la capa oculta, salida de 10 logits |
| Parametros totales | 98.378 (3072×32 + 32 + 32×10 + 10) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes; entrada fija de 32×32×3 píxeles aplanados a 3072) |
| Tipos de cuantizacion | No disponible (pesos en float64; el autor no publica versiones cuantizadas) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `model.pt` (state dict) y NumPy `model.npz` (`W0`, `b0`, `W1`, `b1`); estadísticas de preprocesado en `preprocessing.npz`; metadatos en `config.json` |

## Arquitectura y entrenamiento

La red es un MLP de dos capas completamente conectadas: una primera capa lineal de 3072 a 32 unidades seguida de una activación ELU, y una segunda capa lineal de 32 a 10 que produce los logits de las diez clases de CIFAR-10. La entrada se obtiene aplanando la imagen RGB de 32×32 en orden HWC row-major, convirtiendo a float64 y dividiendo entre 255; después se resta la media por característica y se divide por la desviación típica por característica calculadas exclusivamente sobre las 50.000 imágenes del split de entrenamiento original (las desviaciones típicas nulas usan divisor 1). Los pesos se almacenan en float64.

El entrenamiento se realizó con descenso de gradiente estocástico (SGD), tasa de aprendizaje 0,05, tamaño de lote 64 y 100 épocas sin parada temprana, con etiquetas de entrenamiento verdaderas (p=0), semilla base 1037, semilla de inicialización 1038 y semilla de lotes 1039. Una particularidad técnica destacable es la restricción aplicada a los pesos posteriores a la primera capa: durante el entrenamiento, los pesos actualizados negativos se sustituían por exp(w−5), mientras que los pesos de la primera capa y todos los sesgos no tenían restricción. No se documenta uso de RLHF, DPO ni ningún otro ajuste posterior; tampoco se especifica el número total de tokens o ejemplos vistos más allá de las 100 épocas sobre 50.000 imágenes.

## Capacidades

- Clasificación de imágenes CIFAR-10 en diez clases con un orden de clases fijo: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck.
- Entrada exclusivamente de imágenes RGB de 32×32 píxeles, aplanadas a un vector de 3072 dimensiones y normalizadas con las estadísticas del fichero `preprocessing.npz`.
- Salida de 10 logits (sin capa softmax incluida; la conversión a probabilidades debe hacerse externamente).
- Inferencia determinista en CPU o GPU mediante PyTorch o NumPy, con pesos exportados en ambos formatos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo de razonamiento (thinking mode), visión de alta resolución, audio ni ninguna otra modalidad.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como baseline de referencia para comparar arquitecturas MLP, CNN y transformers de visión en CIFAR-10, gracias a que el pipeline de preprocesado y las semillas están documentados y son reproducibles.
- Reproducción de experimentos: los ficheros `model.pt`, `model.npz` y `preprocessing.npz` permiten verificar la precisión de test reportada (42,36 %) sin reentrenar, usando el código de carga incluido en la model card.
- Pruebas de integración de pipelines de clasificación: útil para validar el cableado de un servicio de inferencia (carga de pesos, normalización, mapeo de índices a etiquetas) antes de sustituir el modelo por uno de mayor calidad.
- Evaluación comparativa de estrategias de regularización: la restricción exponencial sobre pesos negativos en capas posteriores a la primera es un caso de estudio concreto para analizar su efecto en la precisión y en la macro F1.
- Generación de datos sintéticos de prueba: al ser un modelo minúsculo y rápido, puede emplearse para poblar entornos de test con predicciones deterministas sobre imágenes CIFAR-10.
- Análisis de calibración y errores: con 42,36 % de precisión y 0,421713 de macro F1, es un caso útil para estudiar la matriz de confusión y el comportamiento de un clasificador débil en clases difíciles (gato, perro, ciervo).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en test (CIFAR-10, 10.000 imágenes) | 42,36 % |
| Macro F1 en test | 0,421713 |
| Split de entrenamiento | 50.000 imágenes |
| Split de test | 10.000 imágenes |
| Épocas | 100 |
| Optimizador | SGD, lr 0,05, batch 64 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje ni un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float64 (98.378 parámetros × 8 bytes ≈ 0,79 MB de pesos, más el vector de entrada de 3072 × 8 bytes y las estadísticas de preprocesado); en la práctica cabe en cualquier GPU o CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema y en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer, incluida una iGPU o incluso ejecución puramente en CPU.
- Opciones de despliegue: PyTorch nativo (carga del state dict), NumPy (parámetros `W0`, `b0`, `W1`, `b1`), o exportación manual a ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño (98.378 parámetros y una única multiplicación matriz-vector de 3072×32), la inferencia por imagen es del orden de microsegundos en CPU y permite procesar lotes grandes sin presión de memoria.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-ioc-nn | MLP 3072→32→10, ELU | 98.378 | 42,36 % | No disponible | HuggingFace (repo de 0,0 GB) |
| MLP de referencia CIFAR-10 (baseline típico) | MLP 3072→N→10 | Variable | No disponible | No disponible | No disponible |
| CNN pequeña tipo LeNet-5 | CNN | ~60.000 | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa de rendimiento no está disponible. La comparación con alternativas de la misma categoría (clasificadores ligeros para CIFAR-10) queda limitada a la arquitectura y al tamaño.

## Limitaciones y advertencias

- Precisión baja: 42,36 % en test y macro F1 de 0,421713, muy por debajo de las CNN modernas y de los transformers de visión en CIFAR-10; no es adecuado para aplicaciones reales de clasificación.
- Un único seed: los resultados proceden de una sola semilla y de una arquitectura muy pequeña, por lo que no hay estimación de varianza ni intervalos de confianza.
- Entrada rígida: solo acepta imágenes RGB de 32×32 píxeles; no hay redimensionado, aumento de datos ni soporte para otras resoluciones o formatos.
- Dependencia del preprocesado: la normalización debe usar exactamente las estadísticas de `preprocessing.npz` (media y desviación típica por característica calculadas solo sobre el split de entrenamiento); usar otras estadísticas degrada las predicciones.
- Orden de clases fijo: la salida no incluye etiquetas; el consumidor debe mapear los índices 0–9 al orden documentado (airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck).
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; ante la ausencia de licencia explícita, debe asumirse restricción por defecto.
- Sin soporte de texto ni de tareas generativas: no debe emplearse como modelo de lenguaje, agente ni herramienta de razonamiento.
- Riesgo de alucinación no aplicable en el sentido de los LLM, pero sí de predicciones erróneas con alta confianza en clases visualmente próximas (gato/perro, ciervo/caballo).
- Artefactos de tamaño 0,0 GB: el repositorio es mínimo y no incluye versiones cuantizadas ni scripts de entrenamiento completos, solo los pesos y metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ransom32/smai-a4-cifar10-ioc-nn
- Ejecución de entrenamiento (Weights & Biases): https://forge.coreweave.com/wandb/mukund-hebbar23-iiit-hyderabad/smai-assignment-4/runs/6w7fi2h9
- Dataset CIFAR-10 en HuggingFace: https://huggingface.co/datasets/uoft-cs/cifar10
