# Santhlabs/smai-a4-cifar10-mlp

## Resumen

`smai-a4-cifar10-mlp` es un perceptrón multicapa (MLP) entrenado para clasificación de imágenes del conjunto CIFAR-10, publicado por el usuario Santhlabs como parte de la asignatura SMAI (Assignment 4), según indica la model card. No es un modelo de lenguaje ni un transformer generativo: es una red neuronal densa pequeña que recibe vectores de 3072 dimensiones (imágenes RGB de 32x32 píxeles aplanadas) y produce 10 logits correspondientes a las clases de CIFAR-10. Con 820.874 parámetros, su relevancia es exclusivamente académica y educativa.

El modelo no resuelve tareas de generación de texto, razonamiento, código ni visión general: su alcance se limita a la clasificación de imágenes de baja resolución del benchmark CIFAR-10, con una precisión de test del 48,16 %, muy por debajo de los modelos convolucionales o transformers de visión modernos (que superan el 95 % en la misma tarea). No se dispone de información sobre pipeline, formato de pesos ni proceso de entrenamiento más allá de lo indicado en la model card.

Dado que el repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, se trata de un artefacto de entrega académica sin uso práctico en producción. Se documenta aquí por completitud, pero cualquier evaluación técnica debe considerar que no es un modelo comparable a los LLM o modelos de visión de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa): 3072 → 256 → 128 → 10 |
| Parámetros totales | 820.874 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 3072 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (según metadatos; no aplica a la tarea de clasificación) |
| Licencia | MIT |
| Formato de pesos | no disponible (tamaño de repo 0.0 GB; no se especifica safetensors, GGUF ni otro) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas densas con activación ReLU en las capas ocultas y activación de salida identidad (logits lineales). La entrada es un vector de 3072 dimensiones obtenido al aplanar una imagen CIFAR-10 de 32x32x3 píxeles. Las capas ocultas tienen 256 y 128 unidades respectivamente, y la capa de salida produce 10 logits. El total de parámetros es 820.874, coherente con la suma de pesos y sesgos de las tres capas.

El preprocesamiento descrito consiste en normalizar los píxeles dividiendo por 255.0 para llevarlos al rango [0, 1], seguido de una estandarización por característica usando las estadísticas del conjunto de entrenamiento, almacenadas en `preprocessing.npz`. No se especifica el número de épocas, el optimizador, la función de pérdida, el tamaño de batch ni si se aplicó regularización (dropout, weight decay) o aumento de datos. Tampoco se indica si se usó validación cruzada o un split fijo de validación. No hay información sobre RLHF, DPO ni técnicas de alineación, ya que no es un modelo generativo.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada fija de 3072 valores float (imagen RGB 32x32 aplanada y preprocesada).
- Salida de 10 logits lineales; requiere aplicar softmax externamente para obtener probabilidades.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación de texto.
- No admite instrucciones en lenguaje natural ni prompts conversacionales.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como ejemplo mínimo de MLP para ilustrar el flujo completo de preprocesamiento, entrenamiento y evaluación en CIFAR-10, con una precisión de referencia del 48,16 % en test.
- Comparación de líneas base: útil como baseline débil frente a CNN, ResNet o Vision Transformers en experimentos académicos sobre CIFAR-10, para cuantificar la mejora que aportan arquitecturas convolucionales.
- Reproducción de experimentos de asignatura: permite a estudiantes de SMAI verificar el pipeline de normalización y estandarización descrito en `preprocessing.npz`.
- Pruebas de integración de pipelines de preprocesamiento: valida que la conversión de imágenes a vectores de 3072 dimensiones y la estandarización por característica se implementan correctamente antes de escalar a modelos mayores.
- Demostraciones de limitaciones de los MLP en visión: ejemplifica por qué las capas densas no capturan estructura espacial, con una brecha de precisión de más de 40 puntos frente a CNN modernas en el mismo benchmark.
- Experimentos de cuantización o compresión a pequeña escala: con 820.874 parámetros, es un banco de pruebas ligero para técnicas de poda o cuantización sin requerir hardware significativo.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión en test (CIFAR-10) | 48,16 % |
| Precisión en validación (CIFAR-10) | 47,03 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM ni un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precisión completa (820.874 parámetros × 4 bytes ≈ 3,3 MB, más overhead de activaciones y framework).
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integrada; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en cualquier GPU de consumo, e incluso en CPU con latencia despreciable.
- Opciones de despliegue: no se especifica formato de pesos, por lo que no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI (ninguna de estas herramientas está orientada a MLP de clasificación). Sería desplegable con PyTorch, NumPy o ONNX si se exportara, pero el formato no está documentado.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, la inferencia por muestra sería del orden de microsegundos en GPU y milisegundos en CPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smai-a4-cifar10-mlp | MLP 3072→256→128→10 | 820.874 | no aplica | 48,16 % (test) | MIT | HuggingFace (0 descargas) |
| ResNet-20 (referencia académica) | CNN residual | ~0,27 M | no aplica | ~91-92 % (test) | varía | implementaciones públicas |
| Vision Transformer ViT-B/16 | Transformer | ~86 M | no aplica (entrada 16x16 patches) | ~98 % con preentrenamiento a gran escala | varía | múltiples repositorios |
| LeNet-5 | CNN | ~60 K | no aplica | ~70-75 % (test, CIFAR-10 adaptado) | varía | implementaciones públicas |

Nota: los valores de precisión de los modelos comparativos son referencias habituales de la literatura y no proceden de la información proporcionada; se incluyen solo como orientación cualitativa. No se dispone de una comparativa oficial publicada por el autor.

## Limitaciones y advertencias

- Precisión baja: 48,16 % en test frente a más del 90 % de CNN básicas en CIFAR-10; no apto para aplicaciones reales de clasificación.
- Sesgos desconocidos: no se documenta ningún análisis de sesgo por clase, demografía o dominio; CIFAR-10 es un dataset de baja resolución con clases desbalanceadas en dificultad.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar alta confianza a clases incorrectas sin calibración documentada.
- Limitación de dominio: solo acepta imágenes de 32x32 píxeles preprocesadas de una forma específica (`preprocessing.npz`); no generaliza a otras resoluciones, formatos ni dominios.
- Limitación de idioma: los metadatos indican `en`, pero el modelo no procesa texto; el campo es irrelevante para su función.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso comercial de un clasificador con 48 % de precisión es desaconsejable.
- Caveat de producción: repositorio de 0.0 GB y sin formato de pesos documentado; no se puede verificar la integridad de los artefactos ni la reproducibilidad del entrenamiento.
- Sin información sobre el proceso de entrenamiento (épocas, optimizador, aumentos de datos), lo que impide reproducir los resultados.
- El campo `pipeline` no está disponible, por lo que la integración automática en HuggingFace Inference API no está garantizada.

## Enlaces

- HuggingFace: https://huggingface.co/Santhlabs/smai-a4-cifar10-mlp
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
