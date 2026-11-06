# armboss200/smai-assignment-4-ioc-nn

## Resumen

`smai-assignment-4-ioc-nn` es un modelo de clasificación de imágenes desarrollado por el usuario armboss200 como entrega de la cuarta práctica de la asignatura SMAI (presumiblemente "Statistical Methods in Artificial Intelligence"). Se trata de un perceptrón multicapa (MLP) entrenado desde cero sobre CIFAR-10, con una peculiaridad arquitectónica: es una red "Input-Output Convex" (IOC), es decir, convexa respecto a la entrada y la salida, una variante que se estudia en el contexto de robustez y optimización de redes neuronales.

El modelo no es un producto para producción: el propio autor lo describe como "un experimento de asignatura, no un clasificador de imágenes de producción". Trabaja directamente sobre píxeles crudos de 32×32×3 aplanados a 3072 características, sin convoluciones ni aumentación de datos, y se distribuye como un fichero `model.npz` con pesos en float64 y matrices orientadas entrada-por-salida.

Su relevancia es, por tanto, académica y pedagógica: sirve como referencia reproducible para estudiar el comportamiento de redes convexas en tareas de visión a pequeña escala, y como ejemplo de empaquetado de pesos en NumPy con metadatos de preprocesado autocontenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con restricción de convexidad input-output (IOC) |
| Parametros totales | no disponible (depende de `depth` y `widths` en `config.json`, no publicados en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible; pesos almacenados en float64 |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades de texto) |
| Licencia | no disponible |
| Formato de pesos | `model.npz` (NumPy, float64, con `metadata` JSON embebida) |

## Arquitectura y entrenamiento

La arquitectura es un MLP cuya profundidad, anchuras por capa, función de activación, tasa de aprendizaje, tamaño de lote y pasos de acumulación de gradiente se declaran en `config.json` y se embeben en el propio NPZ. La restricción IOC (input-output convex) implica que la función aprendida es convexa respecto a la entrada y la salida, una propiedad que se impone mediante la construcción de las capas (orientación entrada-por-salida de las matrices de pesos) y que se refleja en el flag `convex` de los metadatos. La pérdida es entropía cruzada categórica (CCE).

El entrenamiento se realizó durante 100 épocas sobre las 50.000 imágenes de entrenamiento originales de CIFAR-10, sin selección de épocas basada en el conjunto de test ni, según el autor, con etiquetas ruidosas (configuración "clean-label, p=0"). El preprocesado es mínimo: conversión a float64, aplanado en orden row-major a 3072 dimensiones, división por 255 y normalización con media y escala ajustadas exclusivamente sobre el conjunto de entrenamiento. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de imágenes.

## Capacidades

- Clasificación de imágenes de 32×32 píxeles RGB en las 10 clases de CIFAR-10: airplane, automobile, bird, cat, deer, dog, frog, horse, ship y truck.
- Salida de probabilidades por clase mediante `softmax` sobre los logits del modelo.
- Preprocesado autocontenido: el NPZ incluye `preprocess_mean` y `preprocess_scale` para reproducir exactamente la normalización del entrenamiento.
- Verificación de formas arquitectónicas en el cargador (`load_from`) antes de modificar parámetros.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni visión de alta resolución.
- No tiene capacidades multilingües ni modo "thinking".

## Casos de uso

- Docencia y reproducibilidad académica: cargar `model.npz` con `TorchClassifier` y reproducir las curvas de la Sección 1.5 de la práctica, gracias a que todos los pesos y la configuración van embebidos en el fichero.
- Estudio de redes convexas input-output: comparar el comportamiento de esta MLP IOC frente a una MLP estándar de igual tamaño en CIFAR-10, aislando el efecto de la restricción de convexidad.
- Referencia base para experimentos de robustez: al no usar convoluciones ni aumentación, sirve como línea base "débil" contra la que medir mejoras de arquitecturas CNN.
- Pruebas de pipelines de inferencia en NumPy/PyTorch: validar flujos de preprocesado (aplanado, normalización con estadísticas fijas) y de carga de pesos desde NPZ en entornos educativos.
- Análisis de calibración y confianza: inspeccionar las probabilidades `softmax` de un modelo entrenado sin selección por test para discutir sobreajuste y calibración en clase.
- Ejemplo de empaquetado de modelos: usar la estructura `metadata` + `preprocess_mean` + `preprocess_scale` como plantilla para distribuir modelos pequeños con su preprocesado en un único artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye exactitud en test, matriz de confusión ni comparación numérica con otras arquitecturas; solo indica que se entrenó 100 épocas sin selección de épocas basada en test.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser una MLP sobre 3072 entradas y 10 salidas, el tamaño depende de `widths` y `depth`, no publicados. En cualquier caso, un modelo de este tipo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; una CPU moderna es suficiente para inferencia por lotes pequeños. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera el procesado por lotes.
- Cabe en GPU consumer: sí, con enorme margen, incluso en iGPU.
- Opciones de despliegue: PyTorch nativo con el cargador `ioc_torch.TorchClassifier`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smai-assignment-4-ioc-nn | MLP IOC sobre píxeles | 32×32×3 aplanado (3072) | 10 (CIFAR-10) | fija | no disponible | Hugging Face (0 descargas) |
| MLP estándar sobre CIFAR-10 | MLP sin restricción de convexidad | 3072 | 10 | fija | variable | múltiples implementaciones docentes |
| ResNet-18 sobre CIFAR-10 | CNN | 32×32×3 | 10 | fija | MIT / BSD en implementaciones comunes | ampliamente disponible |
| ViT pequeño sobre CIFAR-10 | Transformer de visión | 32×32×3 con parches | 10 | fija | variable | implementaciones en HF |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publica métricas. La diferencia principal frente a las alternativas es arquitectónica: este modelo no usa convoluciones ni atención, y añade la restricción IOC, lo que lo hace útil como objeto de estudio más que como clasificador competitivo.

## Limitaciones y advertencias

- Modelo de asignatura: el propio autor advierte que "no es un clasificador de imágenes de producción".
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribución; hay que contactar con el autor.
- Sin métricas publicadas: no hay exactitud en test ni curvas de aprendizaje, por lo que no es posible evaluar su calidad de forma objetiva a partir de la información disponible.
- Entrada rígida: solo acepta imágenes de 32×32×3 aplanadas y normalizadas con las estadísticas exactas del NPZ; cualquier otra resolución o esquema de normalización invalida los resultados.
- Sin convoluciones ni aumentación: la capacidad de generalización sobre imágenes reales es muy limitada en comparación con CNN o transformers de visión.
- Pesos en float64: mayor uso de memoria y menor throughput que float32/float16, aunque irrelevante por el tamaño reducido del modelo.
- Riesgo de sobreajuste: 100 épocas sobre 50.000 imágenes sin selección por validación ni test sugieren posible sobreajuste, no cuantificado en la información.
- Sin soporte de texto, audio ni agentes: no es un modelo de propósito general y no debe evaluarse con los criterios habituales de LLM.
- Fecha de creación futura (2026-11-04) en los metadatos de Hugging Face: posible inconsistencia del registro, a verificar por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/armboss200/smai-assignment-4-ioc-nn
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- Repositorio del cargador `ioc_torch`: no disponible en la información proporcionada
- Paper o blog del autor sobre la arquitectura IOC: no disponible en la información proporcionada
- Demo o Space asociado: no disponible en la información proporcionada
