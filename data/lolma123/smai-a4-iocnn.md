# lolma123/smai-a4-iocnn

## Resumen

SMAI A4 — IOC-NN es un modelo de red neuronal convolucional (aunque en la práctica implementado como un perceptrón multicapa denso) entrenado sobre CIFAR-10, publicado por el usuario lolma123 en HuggingFace. El modelo implementa una "input-output convex network" (IOC-NN), una variante arquitectónica en la que cada logit de salida es una función convexa de la entrada. Para ello, tras cada paso de SGD se sustituyen los pesos negativos por `exp(w-5)`, garantizando pesos no negativos en todas las capas posteriores a la primera, y se emplean activaciones ELU en las capas ocultas.

La arquitectura replica los anchos de un baseline `3072-256-10_relu` (entrada de 3072 valores —una imagen CIFAR-10 de 32x32x3 aplanada en orden HWC—, una capa oculta de 256 unidades y 10 logits de salida correspondientes a las clases de CIFAR-10). El entrenamiento se realizó durante 100 épocas sobre las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas, en el contexto de la sección 1.4.2 (p = 0) de un trabajo mayor.

El interés del modelo es principalmente académico y experimental: sirve como artefacto de referencia para estudiar propiedades de convexidad en redes neuronales y comparar el comportamiento de una red con restricciones de signo en los pesos frente a un MLP convencional. No es un modelo de lenguaje ni un modelo generativo, sino un clasificador de imágenes de propósito muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso (input-output convex network, IOC-NN) con activaciones ELU y pesos no negativos tras la primera capa |
| Parametros totales | 3072×256 + 256 + 256×10 + 10 = 789.002 (derivado de los anchos declarados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en `float64` segun el pipeline de preprocesado descrito) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `torch_ioc_p0.npz` (state dict de `nn.Sequential` de PyTorch, claves `<i>.weight` y `<i>.bias`) |

## Arquitectura y entrenamiento

La red es un `nn.Sequential` de PyTorch con topología `3072-256-10`. La capa oculta usa activación ELU y la salida son 10 logits (uno por clase de CIFAR-10). La innovación central es la restricción de convexidad: tras cada actualización de SGD, cualquier peso negativo en las capas posteriores a la primera se reemplaza por `exp(w-5)`, una función que mapea valores negativos a un rango positivo pequeño (cercano a 0 para w muy negativas y tendiendo a 1 cuando w se acerca a 0). De este modo, la composición de transformaciones afines con pesos no negativos y activaciones convexas/monótonas garantiza que cada logit sea una función convexa de la entrada.

El entrenamiento se realizó durante 100 épocas sobre las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas. El preprocesado consiste en aplanar cada imagen 32×32×3 uint8 a 3072 valores en orden HWC, convertir a `float64`, dividir por 255 y estandarizar por columna usando la media y desviación típica del conjunto de entrenamiento (las columnas con desviación 0 usan divisor 1). No se menciona uso de data augmentation, RLHF, DPO ni otras técnicas de alineación (no aplicables a un clasificador de este tipo).

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada fija de 3072 valores correspondientes a una imagen RGB de 32×32 píxeles aplanada en orden HWC.
- Garantía teórica de convexidad de cada logit respecto a la entrada, útil para análisis de robustez y estudios de propiedades geométricas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión general, audio ni otras capacidades especiales más allá de la clasificación de imágenes de 32×32.

## Casos de uso

- Estudio académico de convexidad en redes: el modelo permite verificar empíricamente que los logits son funciones convexas de la entrada, comparando gradientes y matrices hessianas frente a un MLP sin restricciones.
- Baseline en experimentos de robustez adversarial: al ser una red convexa por construcción, sirve para medir cómo la convexidad afecta a la resistencia frente a perturbaciones adversariales en CIFAR-10.
- Reproducción de resultados de la sección 1.4.2 (p = 0): el checkpoint permite reproducir exactamente las métricas reportadas en el trabajo original sin reentrenar.
- Docencia y divulgación: ejemplo mínimo y autocontenido (menos de 800.000 parámetros) para explicar restricciones de signo en pesos y sus implicaciones geométricas.
- Comparación de arquitecturas en CIFAR-10: confrontar el rendimiento de `3072-256-10` con ELU y pesos no negativos frente al baseline `3072-256-10_relu` con pesos libres.
- Pruebas de pipelines de preprocesado: validar implementaciones de aplanado HWC, normalización por columna y estandarización con media/desviación del conjunto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en `float64` (789.002 parámetros × 8 bytes ≈ 6,3 MB), más el overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con soporte CUDA; el modelo es trivial para hardware moderno. Funciona igualmente en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en dispositivos de gama baja.
- Opciones de despliegue: PyTorch nativo (cargando el state dict `.npz` en un `nn.Sequential` con la topología `3072-256-10` y activación ELU). No se proporcionan pesos en GGUF, ONNX ni otros formatos; no hay soporte directo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput muy alto en GPU y aceptable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMAI A4 — IOC-NN (`lolma123/smai-a4-iocnn`) | ~789.002 | Imagen 32×32×3 (3072 valores) | Clasificacion CIFAR-10 | no disponible | HuggingFace |
| Baseline `3072-256-10_relu` (referenciado en la model card) | ~789.002 | Imagen 32×32×3 (3072 valores) | Clasificacion CIFAR-10 | no disponible | No se distribuye en este repo |
| Otras redes convexes de entrada-salida (IOC-NN) de la literatura | no disponible | no disponible | Clasificacion / regresion | no disponible | no disponible |

No se dispone de datos de rendimiento del baseline ni de otras alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de propósito muy restringido: solo clasifica imágenes CIFAR-10 de 32×32 píxeles; no es un modelo de lenguaje ni un modelo generativo.
- Sin métricas publicadas: no se reportan accuracy, loss ni curvas de entrenamiento en la información disponible, por lo que se desconoce su rendimiento real.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor; a efectos prácticos, debe considerarse uso restringido hasta aclaración.
- Riesgo de sesgos: CIFAR-10 es un dataset pequeño y con clases balanceadas pero de baja resolución; el modelo hereda los sesgos de representación del dataset.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Restricción arquitectónica: los pesos no negativos tras la primera capa limitan la capacidad expresiva; el rendimiento puede ser inferior al de un MLP equivalente sin restricciones.
- Preprocesado obligatorio: cualquier uso debe replicar exactamente el aplanado HWC, la división por 255 y la estandarización por columna con media/desviación del conjunto de entrenamiento; de lo contrario, las predicciones no serán válidas.
- Formato de pesos propietario del repo (`.npz`): requiere reconstruir manualmente la topología `nn.Sequential` para cargarlo; no hay script de carga incluido en la información disponible.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/lolma123/smai-a4-iocnn
- Dataset CIFAR-10 referenciado: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
