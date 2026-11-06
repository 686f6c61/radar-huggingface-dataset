# rider480/smai-a4-cifar10-iocnn

## Resumen

IOC-NN sobre CIFAR-10 es un modelo de clasificación de imágenes de tipo red neuronal convexa de entrada-salida (Input-Output Convex Neural Network), desarrollado por el usuario rider480 en el marco de la asignatura Statistical Methods in AI (SMAI, Monsoon 2026) del IIIT Hyderabad, como parte de la asignatura 4, pregunta 1. No es un modelo de propósito general ni un modelo de lenguaje: es un artefacto académico que demuestra empíricamente cómo imponer restricciones de convexidad en los pesos de las capas ocultas produce una función de salida convexa respecto a la entrada.

El modelo resuelve una pregunta de investigación acotada: si una MLP pequeña con pesos no negativos a partir de la segunda capa y activaciones ELU (que son convexas y no decrecientes) puede mantener garantías formales de convexidad sin sacrificar demasiado rendimiento en una tarea de clasificación de imágenes de 10 clases. Con 199.082 parámetros y una arquitectura 3072 → 64 → 32 → 10, es un modelo de juguete orientado a verificación numérica, no a producción.

Su relevancia es docente y metodológica: aporta una verificación numérica de convexidad (100 cuerdas de test, 0 violaciones) y datos de robustez frente a ruido de etiquetas (p=0,50) que comparan favorablemente con una MLP estándar. No dispone de model card pública extensa, licencia declarada ni datos de benchmarks estándar más allá de los reportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectada 3072 → 64 → 32 → 10 con activación ELU en capas ocultas y salida identidad (logits convexos) |
| Parametros totales | 199.082 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,0 GB; probablemente pesos PyTorch, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura es una MLP de tres capas con dimensionalidad de entrada 3072 (imágenes CIFAR-10 de 32×32×3 aplanadas), dos capas ocultas de 64 y 32 unidades con activación ELU, y una capa de salida de 10 logits con activación identidad. La innovación clave es la restricción de convexidad: los pesos de las capas ℓ ≥ 2 se fuerzan a ser no negativos mediante una proyección w ← e^(w−5) aplicada siempre que un peso resulta negativo. Combinado con activaciones ELU (convexas y no decrecientes) y una salida lineal, esto garantiza que la función aprendida sea convexa respecto a la entrada, propiedad verificada numéricamente por el autor.

El entrenamiento se realiza sobre el dataset CIFAR-10 (50.000 imágenes de entrenamiento, 10.000 de test, 10 clases). No se especifican en la información disponible el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de batch ni si se aplicó data augmentation. Tampoco se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable dado que no es un modelo generativo. La verificación de convexidad reportada cubre 100 pares de test con λ ∈ {0,25, 0,50, 0,75} y 0 violaciones (violación máxima ≤ 0,0).

## Capacidades

- Clasificación de imágenes de 10 clases sobre CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Función de salida convexa respecto a la entrada, con garantía formal verificada numéricamente.
- Robustez frente a ruido de etiquetas: a p=0,50 mantiene 39,59% de accuracy, superando a la MLP estándar (38,36%).
- Menor brecha de generalización que una MLP estándar: 8,58% frente a 12,39%.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo thinking.
- No es un modelo de propósito general: su única tarea es la clasificación de imágenes CIFAR-10.

## Casos de uso

- Docencia e investigación en convexidad de redes neuronales: el modelo sirve como referencia reproducible para asignaturas y papers que estudien IOC-NN, ya que incluye verificación numérica de convexidad con 100 cuerdas y 0 violaciones.
- Estudio de robustez frente a ruido de etiquetas: permite comparar el comportamiento de una red convexa frente a una MLP estándar en el régimen p=0,50, con métricas concretas de accuracy y brecha de generalización.
- Baseline para experimentos de regularización estructural: útil como punto de partida para medir el coste en accuracy (49,54% en limpio) de imponer no negatividad en los pesos.
- Análisis de brecha de generalización: el dato de 8,58% frente a 12,39% de la MLP estándar permite estudiar empíricamente si la convexidad actúa como regularizador.
- Reproducción de resultados académicos: el repositorio permite replicar la asignatura 4 del curso SMAI Monsoon 2026 del IIIT Hyderabad.
- Verificación de propiedades matemáticas: la proyección w ← e^(w−5) y la comprobación de cuerdas son un ejemplo práctico para validar implementaciones de restricciones de convexidad en PyTorch.

## Benchmarks y rendimiento

| Metrica | IOC-NN | MLP estandar (referencia del autor) |
|---|---|---|
| Test accuracy (limpio, p=0,0) | 49,54% | no disponible |
| Macro F1 (limpio, p=0,0) | 0,4913 | no disponible |
| Brecha de generalizacion | 8,58% | 12,39% |
| Test accuracy con ruido (p=0,50) | 39,59% | 38,36% |
| Violaciones de convexidad (100 cuerdas) | 0 | no aplica |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, algo esperable dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (199.082 parámetros ≈ 0,8 MB en pesos, más buffers de activación para lotes pequeños).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en GTX 1050, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: PyTorch nativo (el repo declara tag pytorch); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por imagen es del orden de microsegundos a milisegundos en GPU moderna, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (este modelo) | 199.082 | no aplica | 49,54% (limpio) / 39,59% (p=0,50) | no disponible | Hugging Face |
| MLP estandar (referencia del autor) | no disponible | no aplica | no disponible (brecha 12,39%) | no disponible | no disponible |
| Otras IOC-NN sobre CIFAR-10 | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (IOC-NN sobre CIFAR-10) más allá de la MLP estándar usada como referencia por el propio autor. Los modelos de clasificación de imágenes de propósito general (ResNet, ViT) no son comparables en parámetros ni en objetivos: superan ampliamente el 49,54% de accuracy, pero no ofrecen garantías de convexidad.

## Limitaciones y advertencias

- Rendimiento bajo: 49,54% de accuracy en CIFAR-10 está muy por debajo del estado del arte (ResNet supera el 93%), lo que limita su uso práctico.
- Modelo académico sin licencia declarada: no se especifica licencia, por lo que el uso comercial es jurídicamente incierto y desaconsejado sin aclaración del autor.
- Sin model card completa: no se documentan datos de entrenamiento detallados, hiperparámetros, ni procedencia de los pesos.
- Riesgo de sobreajuste al protocolo de verificación: la comprobación de convexidad se limita a 100 cuerdas de test; no constituye una prueba formal de convexidad global.
- Sesgos: no documentados; CIFAR-10 es un dataset pequeño y con clases balanceadas, pero no se analizan sesgos demográficos ni de representación.
- Alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes ambiguas o fuera de distribución.
- Limitación de idioma y contexto: no aplica, al no ser un modelo de lenguaje.
- Restricciones de producción: no apto para despliegue en producción por su baja accuracy, falta de licencia y ausencia de documentación de robustez más allá de p=0,50.

## Enlaces

- Hugging Face: https://huggingface.co/rider480/smai-a4-cifar10-iocnn
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- Curso SMAI, IIIT Hyderabad: no disponible en la información proporcionada
- Paper de IOC-NN: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
