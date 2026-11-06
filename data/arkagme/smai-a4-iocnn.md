# arkagme/smai-a4-iocnn

## Resumen

IOC-NN (ELU, W≥0) es una implementación en NumPy de un perceptrón multicapa (MLP) entrenado sobre CIFAR-10, publicada por el usuario arkagme como parte de la asignatura SMAI (Assignment 4, cuestiones 1.4 y 1.5). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto académico que ilustra el paradigma *Input-Output Convex Neural Network* (IOC-NN), en el que las matrices de pesos a partir de la segunda capa se restringen a valores no negativos para favorecer la convexidad de la función de pérdida respecto a las activaciones.

La red tiene una arquitectura mínima de 3072 entradas (imágenes de 32×32×3 aplanadas) → 128 unidades ocultas con activación ELU → 10 logits de salida, con pérdida de entropía cruzada softmax. Se entrenó con SGD plano durante 100 épocas sobre las 50.000 imágenes del split de entrenamiento de CIFAR-10 con etiquetas limpias (p = 0), alcanzando una precisión de entrenamiento de 0,8381 y una precisión de test de 0,4861.

Su relevancia es exclusivamente didáctica: sirve como referencia reproducible de cómo implementar restricciones de no negatividad en pesos y de un pipeline completo de entrenamiento en NumPy puro, sin frameworks de deep learning. No está pensado para inferencia en producción, no soporta texto, ni herramientas, ni agentes, y su repositorio ocupa 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) denso, 3072 → 128 → 10 |
| Parámetros totales | 3072×128 + 128 + 128×10 + 10 = 394.634 (aproximado, derivado de las dimensiones indicadas) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantización | no disponible (pesos almacenados en float64 dentro de `model.npz`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`model.npz`, con `W0, b0, W1, b1, ...`, más `activations` y `loss`); preprocesado en `preprocessing.npz` |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas densas: una capa oculta de 128 unidades con activación ELU y una capa de salida de 10 logits con activación identidad, optimizada con entropía cruzada softmax. La innovación técnica reside en la restricción IOC-NN: tras cada paso de SGD, las entradas negativas de las matrices de pesos de las capas a partir de la segunda se sustituyen por `exp(w - 5)`, lo que mantiene los pesos no negativos (con un suelo suave cercano a cero) y preserva la convexidad de la salida respecto a las activaciones de la capa anterior. La primera capa y todos los sesgos quedan sin restricción.

El entrenamiento se realizó con SGD plano (learning rate 0,01, batch size 64, acumulación de gradiente 1) durante 100 épocas en precisión float64, con semilla 1044, sobre las 50.000 imágenes del split `train` de CIFAR-10 con etiquetas verdaderas. El preprocesado aplana cada imagen (32, 32, 3) uint8 a un vector de 3072 en orden H, W, C, normaliza a float64 dividiendo por 255 y estandariza por columna con la media y la desviación típica poblacional del split de entrenamiento, almacenadas en `preprocessing.npz`. No se menciona uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada exclusivamente numérica: vector de 3072 valores float64 ya preprocesado; no acepta imágenes sin el pipeline de normalización.
- Salida de 10 logits crudos (activación identidad), sin capa softmax incorporada; el consumidor debe aplicar softmax si necesita probabilidades.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión nativa, audio ni ninguna modalidad adicional.
- Inferencia reproducible en NumPy puro: `logits = h @ W + b` con las matrices del `.npz`.

## Casos de uso

- Docencia y reproducción de IOC-NN: el modelo sirve como referencia ejecutable para asignaturas que enseñan restricciones de convexidad en redes neuronales; el alumno puede cargar `model.npz` y verificar que los pesos de la segunda capa son no negativos.
- Estudio de la brecha train/test: con 0,8381 de precisión en entrenamiento frente a 0,4861 en test, es un caso práctico para analizar sobreajuste en MLPs pequeños sobre CIFAR-10 y para comparar con variantes regularizadas.
- Implementación de referencia en NumPy: útil para validar desde cero un pipeline de SGD, normalización por columna y entropía cruzada softmax sin depender de PyTorch o TensorFlow, contrastando resultados con frameworks.
- Pruebas de integración de preprocesado: el par `preprocessing.npz` + `model.npz` permite verificar que un pipeline externo de aplanado (H, W, C) y estandarización reproduce exactamente los logits esperados.
- Baseline académico de clasificación CIFAR-10: sirve como cota inferior de rendimiento (≈48,6 % de accuracy) frente a CNN y modelos con aumentación de datos en trabajos comparativos.
- Experimentos de convexidad y optimización: al ser una red convexa respecto a las activaciones de la capa oculta, permite estudiar propiedades de convergencia y sensibilidad al learning rate en un entorno controlado y de bajo coste computacional.
- Reproducción de semilla: con semilla 1044 y float64, el artefacto permite replicar el entrenamiento y auditar la reproducibilidad numérica de un SGD en NumPy.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las precisiones del propio entrenamiento:

| Métrica | Split | Valor |
|---|---|---|
| Precisión de entrenamiento | 50.000 imágenes `train` | 0,8381 |
| Precisión de test | 10.000 imágenes `test` | 0,4861 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de visión como top-1 en CIFAR-10 con aumentación) en la información disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float64 (394.634 parámetros × 8 bytes ≈ 3,2 MB de pesos, más el vector de entrada de 3072 valores); en la práctica cabe en cualquier GPU consumer o incluso en CPU.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU sin problema y no aprovecha aceleración tensorial de forma significativa al ser NumPy puro.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en Raspberry Pi o entornos embebidos.
- Opciones de despliegue: carga directa con `numpy.load` y multiplicación matricial; no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; al ser una multiplicación de matrices de 3072×128 y 128×10, la latencia por muestra es del orden de microsegundos en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkagme/smai-a4-iocnn | ≈394.634 | Vector fijo de 3072 | 48,61 % test en CIFAR-10 | no disponible | Hugging Face |
| MLP estándar CIFAR-10 (referencia típica) | ≈394.634 | Vector fijo de 3072 | no disponible en esta ficha | varía | no disponible |
| CNN pequeña CIFAR-10 (referencia típica) | millones | Imagen 32×32×3 | no disponible en esta ficha | varía | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada; las filas de referencia están marcadas como no disponibles para evitar cifras inventadas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con benchmarks de NLP.
- Precisión de test limitada (0,4861), insuficiente para cualquier aplicación de producción real de clasificación de imágenes.
- Fuerte sobreajuste: la brecha entre entrenamiento (0,8381) y test (0,4861) supera los 35 puntos porcentuales.
- Entrada rígida: exige el pipeline exacto de aplanado (H, W, C), división por 255 y estandarización con las estadísticas de `preprocessing.npz`; cualquier desviación degrada la salida sin aviso.
- Licencia no especificada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Sesgos: al entrenarse solo con CIFAR-10, hereda los sesgos de composición y etiquetado de ese dataset; no se documentan análisis de sesgo.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí de clasificaciones erróneas confiadas (logits altos en clases incorrectas) sin calibración documentada.
- Restricción IOC-NN: los pesos no negativos limitan la capacidad expresiva de la red y explican en parte el bajo rendimiento en test.
- Sin mantenimiento ni versionado: creado y actualizado el 2026-11-02, con 0 descargas y 0 likes; no hay garantía de soporte.
- Repositorio de 0,0 GB: los archivos pueden no estar completos o no ser accesibles; verificar antes de depender de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkagme/smai-a4-iocnn
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
