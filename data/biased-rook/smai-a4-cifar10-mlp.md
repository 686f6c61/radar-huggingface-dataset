# Biased-Rook/smai-a4-cifar10-mlp

## Resumen

`Biased-Rook/smai-a4-cifar10-mlp` no es un modelo de lenguaje: es un perceptrón multicapa (MLP) completamente conectado entrenado para clasificar imágenes de CIFAR-10 en 10 categorías. Lo publica el usuario Biased-Rook como entrega académica de la asignatura SMAI (assignment 4, roll 2024101057). La arquitectura es 3072 → 512 → 10 con activación ReLU en la capa oculta, salida en forma de 10 logits sin activación y pérdida de entropía cruzada con softmax. Tiene 1.578.506 parámetros entrenables, un tamaño que lo sitúa muy por debajo de cualquier red convolucional moderna.

El interés del artefacto es fundamentalmente docente y de reproducibilidad: documenta de forma explícita el pipeline de entrenamiento (SGD plano, learning rate 0,01, batch de 64, 100 épocas, precisión float64, semillas 1058 y 1059 para torch y DataLoader) y publica los pesos junto con el estandarizador exacto usado en el preprocesado. El resultado declarado es 0,9999 de accuracy en entrenamiento frente a 0,5315 en el conjunto de test de 10.000 imágenes, un diferencial que evidencia sobreajuste severo y que convierte al modelo en un caso de estudio útil sobre la brecha entre ajuste y generalización en modelos lineales/de una sola capa oculta sobre píxeles crudos.

No se trata de un modelo generativo: no acepta prompts, no tiene ventana de contexto lingüístico ni capacidades de razonamiento, tool calling o agentes. La entrada es siempre un vector de 3072 valores float (una imagen 32×32×3 aplanada y estandarizada por columna) y la salida es siempre una distribución sobre las 10 clases de CIFAR-10. Cualquier evaluación debe hacerse con esa expectativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP completamente conectado 3072 → 512 → 10, ReLU en capa oculta, 10 logits de salida sin activación |
| Parametros totales | 1.578.506 (1.572.864 en W0 + 512 en b0 + 5.120 en W1 + 10 en b1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 3072 valores float; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en float64; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible / no aplica (modelo de clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `.npz` de NumPy (`mlp_p0.npz`, `standardizer.npz`, `numpy_M1_selected_1.2.5.npz`) |
| Libreria declarada | `numpy` |
| Dataset de entrenamiento | `uoft-cs/cifar10`, partición de 50.000 imágenes |
| Preprocesado | Aplanado a 3072 valores, conversión a float64, división por 255 y estandarización por columna con media/desviación del conjunto de train (std 0 → 1) |
| Precision de entrenamiento | float64 |
| Tamano del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de creacion / actualizacion | 2026-10-23 / 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal superficial de dos capas lineales con una ReLU intermedia. La primera matriz `W0` tiene forma (3072, 512) y actúa sobre la imagen aplanada; la segunda, `W1`, tiene forma (512, 10) y produce los logits. El autor indica explícitamente que los pesos son "unconstrained", es decir, sin restricciones de norma ni regularización estructural, y que la salida no lleva softmax en el grafo de inferencia: la softmax se aplica únicamente dentro de la pérdida de entropía cruzada durante el entrenamiento. El repositorio lleva la etiqueta `convex-neural-network`, y una de las variantes publicadas se entrenó con una librería NumPy escrita desde cero, lo que encaja con el contexto de una práctica sobre redes convexas u optimización, aunque la model card no describe ninguna parametrización convexa de los pesos.

El entrenamiento se hizo en PyTorch con SGD plano, learning rate 0,01, batch size 64, `grad_accumulation_steps` 1 y 100 épocas sobre las 50.000 imágenes de entrenamiento de CIFAR-10. La model card menciona "true labels (p = 0)", notación que sugiere un barrido experimental con ruido de etiquetas de probabilidad `p`, del que este checkpoint sería la condición limpia. Se fijaron semillas para torch (1058) y para el DataLoader (1059), y todo el cómputo se realizó en float64. No se documenta aumento de datos, weight decay, momentum, scheduler ni validación cruzada; tampoco se describe ningún proceso de RLHF/DPO, que en este dominio no aplica.

Además del modelo principal, el repositorio incluye `numpy_M1_selected_1.2.5.npz` junto a su propio estandarizador: el modelo seleccionado en la tarea 1.2.5, entrenado con la librería NumPy desde cero sobre un split estratificado de 36.000 imágenes. Para esa variante no se publican métricas ni recuento de parámetros.

## Capacidades

- Clasificación de imágenes de 32×32×3 píxeles en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en NumPy puro: el forward completo son dos productos matriciales y una ReLU, sin dependencias de frameworks de deep learning.
- Reproducción exacta del preprocesado gracias a `standardizer.npz`, que contiene los 3072 valores de media y desviación estándar calculados sobre la partición de entrenamiento.
- Exposición de logits crudos, lo que permite posprocesado propio (softmax con temperatura, umbrales, calibración) sin tocar los pesos.
- Formato de pesos legible y portable (`W0, b0, W1, b1` + `architecture_json`), apto para inspección numérica directa.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene visión general: solo acepta el formato exacto 32×32×3 aplanado y estandarizado.

## Casos de uso

- Docencia de fundamentos de deep learning: sirve como ejemplo mínimo y completamente auditable de un MLP entrenado sobre píxeles crudos, con todos los hiperparámetros y semillas publicados, para que el alumnado reproduzca el resultado y discuta el sobreajuste (0,9999 en train frente a 0,5315 en test).
- Baseline de referencia en experimentos con CIFAR-10: cualquier CNN nueva puede compararse contra este modelo para cuantificar la ganancia real que aporta la convolución frente a un MLP de 1,57 M de parámetros con el mismo protocolo de preprocesado.
- Estudio de ruido de etiquetas: la notación "p = 0" indica que este checkpoint es la condición de etiquetas limpias de una serie; puede usarse como punto de partida para comparar curvas de accuracy frente a `p` creciente.
- Pruebas de integración de pipelines numéricos: al depender solo de NumPy y de `.npz`, es útil como test unitario para verificar que un pipeline propio de carga de imágenes, aplanado y estandarización reproduce exactamente las mismas predicciones que el código de la model card.
- Material para análisis de calibración y confianza: al exponer logits crudos, permite estudiar la relación entre confianza del softmax y acierto en un modelo claramente sobreajustado, un ejercicio habitual en cursos de robustez.
- Verificación de despliegues ligeros en CPU: con unos 12 MB de pesos en float64 (la mitad en float32), es adecuado para probar el ciclo completo de empaquetado, carga y servicio de un modelo en entornos sin GPU, incluyendo tests de regresión end-to-end.
- Replicación de prácticas académicas: el segundo checkpoint (`numpy_M1_selected_1.2.5.npz`) permite reproducir el flujo de trabajo de una librería de redes escrita desde cero en NumPy sobre 36.000 imágenes estratificadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en entrenamiento (época final) | 0,9999 |
| Accuracy en test (10.000 imágenes) | 0,5315 (53,15 %) |
| Brecha train − test | ≈ 0,4684 |
| MMLU / HumanEval / GSM8K u otros benchmarks de LM | no aplica (no es un modelo de lenguaje) |
| Métricas por clase, matriz de confusión, F1 | no disponibles |

No se han publicado resultados de benchmarks adicionales en la información disponible. Tampoco se documentan métricas para la variante `numpy_M1_selected_1.2.5`.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. Los pesos suman 1.578.506 × 8 bytes ≈ 12,6 MB en float64 (≈ 6,3 MB si se reconvierten a float32); el estandarizador añade 48 KiB (2 × 3072 × 8 bytes).
- GPU recomendadas: ninguna. El modelo está pensado para ejecutarse en CPU; el forward son dos GEMM de (n, 3072)×(3072, 512) y (n, 512)×(512, 10).
- Cabe en cualquier GPU consumer, y también en Raspberry Pi o en el propio navegador, dado su tamaño. No requiere tarjeta gráfica dedicada.
- Opciones de despliegue: carga directa con `numpy.load` y forward manual, tal como muestra la model card. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de LLM, porque el formato `.npz` y la tarea de clasificación quedan fuera de su ámbito.
- Latencia y throughput: no disponibles; el autor no publica mediciones. El cuello de botella esperable es el preprocesado y la E/S, no el cálculo.
- Memoria de entrenamiento: no documentada; por el tamaño de batch (64) y el número de parámetros, un entrenamiento así cabría con holgura en cualquier GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos de terceros comparables con métricas publicadas, por lo que la comparación externa se marca como no disponible. La única comparación documentable es interna al repositorio:

| Modelo | Parametros | Entrenamiento | Accuracy test | Licencia | Formato |
|---|---|---|---|---|---|
| `mlp_p0.npz` (principal) | 1.578.506 | PyTorch, SGD, 100 épocas, 50.000 imágenes, etiquetas limpias (p = 0) | 0,5315 | no disponible | `.npz` |
| `numpy_M1_selected_1.2.5.npz` | no disponible | Librería NumPy desde cero, split estratificado de 36.000 imágenes | no disponible | no disponible | `.npz` |
| CNN/ResNet sobre CIFAR-10 (referencias externas) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sobreajuste severo: 0,9999 de accuracy en entrenamiento frente a 0,5315 en test. El modelo memoriza la partición de entrenamiento y no debe usarse como clasificador de producción.
- Sin regularización documentada: no se mencionan weight decay, dropout, early stopping ni aumento de datos, lo que explica en parte la brecha train/test.
- Sesgos: no se ha realizado ninguna auditoría de equidad ni de sesgo por clase o subgrupo. Al entrenarse sobre CIFAR-10, hereda los sesgos de composición y etiquetado de ese dataset.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe el riesgo equivalente de predicciones con alta confianza y baja corrección, especialmente en clases visualmente próximas (gato/perro, automóvil/camión).
- Limitación de entrada estricta: solo acepta imágenes 32×32×3 en orden HWC aplanadas a 3072 valores y estandarizadas con el `standardizer.npz` del autor. Cualquier otra resolución, canal u orden de canales invalida los resultados.
- Limitación de idioma: no aplica, al no procesar texto.
- Licencia no especificada: al no declararse licencia, no hay autorización explícita para uso comercial ni para redistribución. Debe contactarse con el autor antes de cualquier uso fuera del ámbito académico.
- Contexto de origen: es una entrega de asignatura con 0 descargas y 1 like; no hay garantía de mantenimiento, soporte ni correcciones posteriores.
- Reproducibilidad dependiente del entorno: los resultados en float64 y las semillas concretas (1058, 1059) hacen que variaciones de versión de PyTorch o de hardware puedan alterar ligeramente las cifras.
- Caveat de etiquetado: la etiqueta `convex-neural-network` no se corresponde con una parametrización convexa descrita en la model card; conviene no asumir propiedades teóricas de convexidad del problema de optimización a partir de esa etiqueta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Biased-Rook/smai-a4-cifar10-mlp
- Dataset referenciado (`uoft-cs/cifar10`): https://huggingface.co/datasets/uoft-cs/cifar10
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
